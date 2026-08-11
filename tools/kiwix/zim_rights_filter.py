#!/usr/bin/env python3
"""Stream a ZIM into a new ZIM while omitting media that failed the rights gate."""

from __future__ import annotations

import argparse
import hashlib
import html
import posixpath
import re
import sqlite3
from pathlib import Path

from libzim.reader import Archive
from libzim.writer import Compression, Creator, Hint, Item, StringProvider

from zim_media_audit import MEDIA_MIMES, repository_for


TAG_WITH_SRC_RE = re.compile(
    rb"<(?:img|source)\b[^>]*?\b(?:src|srcset)=[\"']([^\"']+)[\"'][^>]*>",
    re.IGNORECASE,
)
ASSET_IN_VALUE_RE = re.compile(rb"(?:\.\./|\./)?(_assets_/[^\s,]+)")


class MemoryItem(Item):
    def __init__(self, path: str, title: str, mimetype: str, content: bytes, front: bool):
        super().__init__()
        self.path = path
        self.title = title
        self.mimetype = mimetype
        self.content = content
        self.front = front

    def get_path(self) -> str:
        return self.path

    def get_title(self) -> str:
        return self.title

    def get_mimetype(self) -> str:
        return self.mimetype

    def get_contentprovider(self) -> StringProvider:
        return StringProvider(self.content)

    def get_hints(self) -> dict:
        return {Hint.FRONT_ARTICLE: self.front}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("database", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--no-index", action="store_true")
    parser.add_argument("--workers", type=int, default=4)
    return parser.parse_args()


def approved_paths(db: sqlite3.Connection) -> set[str]:
    pending = db.execute("SELECT count(*) FROM media WHERE status='pending'").fetchone()[0]
    if pending:
        raise RuntimeError(f"rights database still contains {pending:,} pending media records")
    return {row[0] for row in db.execute("SELECT path FROM media WHERE status='approved'")}


def asset_path(raw: bytes) -> str | None:
    match = ASSET_IN_VALUE_RE.search(raw)
    if not match:
        return None
    return match.group(1).decode("utf-8", "replace").split("?")[0].split("#")[0]


def attribution_path(repository: str, file_title: str) -> str:
    digest = hashlib.sha256(f"{repository}\0{file_title}".encode("utf-8")).hexdigest()
    return f"_wayfarer_media/{digest[:2]}/{digest}.html"


def rewrite_html(content: bytes, approved: set[str], page_path: str | None = None) -> bytes:
    def replace(match: re.Match[bytes]) -> bytes:
        path = asset_path(match.group(1))
        if path is None or repository_for(path) is None or path in approved:
            if path is None or path not in approved or page_path is None:
                return match.group(0)
            repository, filename = repository_for(path)
            credit_path = attribution_path(repository, f"File:{filename}")
            page_dir = posixpath.dirname(page_path) or "."
            href = html.escape(posixpath.relpath(credit_path, page_dir), quote=True)
            return f'<a class="wayfarer-media-attribution" href="{href}" title="Media license and credit">'.encode() + match.group(0) + b"</a>"
        return b""

    return TAG_WITH_SRC_RE.sub(replace, content)


def attribution_html(row: sqlite3.Row) -> bytes:
    credit = row["artist"] or row["credit"] or "No attribution required"
    description_url = row["description_url"] or ""
    source_url = row["source_url"] or ""
    evidence = ""
    if row["evidence_revision_id"]:
        evidence = f"Revision {row['evidence_revision_id']} ({row['evidence_timestamp'] or 'timestamp unavailable'})"
    elif row["source_sha1"]:
        evidence = f"Source SHA-1 {row['source_sha1']}"
    links = []
    if row["license_url"]:
        links.append(f'<p><a href="{html.escape(row["license_url"], quote=True)}">License text</a></p>')
    if description_url:
        links.append(f'<p><a href="{html.escape(description_url, quote=True)}">Wikimedia description and license page</a></p>')
    if source_url:
        links.append(f'<p><a href="{html.escape(source_url, quote=True)}">Original media file</a></p>')
    document = f"""<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Media attribution: {html.escape(row['file_title'])}</title></head><body>
<main><h1>{html.escape(row['file_title'])}</h1>
<dl><dt>Repository</dt><dd>{html.escape(row['repository'])}</dd>
<dt>License</dt><dd>{html.escape(row['license_short'] or '')}</dd>
<dt>Creator / credit</dt><dd>{html.escape(credit)}</dd>
<dt>Verification</dt><dd>{html.escape(evidence)}</dd></dl>
{''.join(links)}<p>This record was preserved by Wayfarer’s Archive when the offline release was built.</p></main></body></html>"""
    return document.encode("utf-8")


def main() -> int:
    args = parse_args()
    if args.destination.exists():
        raise FileExistsError(f"destination already exists: {args.destination}")
    source = Archive(args.source)
    db = sqlite3.connect(args.database)
    db.row_factory = sqlite3.Row
    approved = approved_paths(db)
    indexed = not args.no_index
    creator = Creator(args.destination).config_compression(Compression.zstd)
    creator.config_nbworkers(args.workers).config_indexing(indexed, "eng")
    main_candidates: list[str] = []
    try:
        main_candidates.append(source.main_entry.path)
    except KeyError:
        pass
    if "MainPage" in source.metadata_keys:
        main_candidates.append(source.get_metadata("MainPage").decode("utf-8"))
    main_candidates.append("index")
    main_path = next((path for path in main_candidates if source.has_entry_by_path(path)), None)
    if main_path:
        print(f"Preserving main path: {main_path}")
        creator.set_mainpath(main_path)
    else:
        print("Source has no resolvable main path")

    kept = rejected = redirects = 0
    with creator:
        for key in source.metadata_keys:
            if key == "Counter" or key.startswith("Illustration_"):
                continue
            creator.add_metadata(key, source.get_metadata(key))
        for size in source.get_illustration_sizes():
            creator.add_illustration(size, bytes(source.get_illustration_item(size).content))

        for index in range(source.entry_count):
            entry = source._get_entry_by_id(index)
            if entry.is_redirect:
                target = entry.get_redirect_entry().path
                if repository_for(target) is not None and target not in approved:
                    rejected += 1
                    continue
                creator.add_redirection(entry.path, entry.title or "", target, {Hint.FRONT_ARTICLE: True})
                redirects += 1
                continue

            item = entry.get_item()
            media = repository_for(item.path)
            if media is not None and item.mimetype in MEDIA_MIMES and item.path not in approved:
                rejected += 1
                continue
            content = bytes(item.content)
            if item.mimetype.startswith("text/html"):
                content = rewrite_html(content, approved, item.path)
            creator.add_item(
                MemoryItem(
                    item.path,
                    item.title or "",
                    item.mimetype,
                    content,
                    bool(item.title and item.mimetype.startswith("text/html")),
                )
            )
            kept += 1
            if (kept + rejected + redirects) % 100000 == 0:
                print(
                    f"Processed {kept + rejected + redirects:,}: kept={kept:,}, rejected={rejected:,}, redirects={redirects:,}",
                    flush=True,
                )

        attribution_count = 0
        for row in db.execute(
            """
            SELECT repository, file_title, max(license_short) AS license_short,
                   max(license_url) AS license_url, max(artist) AS artist,
                   max(credit) AS credit, max(description_url) AS description_url,
                   max(source_url) AS source_url, max(source_sha1) AS source_sha1,
                   max(evidence_revision_id) AS evidence_revision_id,
                   max(evidence_timestamp) AS evidence_timestamp
            FROM media WHERE status='approved'
            GROUP BY repository, file_title
            """
        ):
            path = attribution_path(row["repository"], row["file_title"])
            creator.add_item(
                MemoryItem(path, "", "text/html", attribution_html(row), False)
            )
            attribution_count += 1

    print(
        f"Complete: kept={kept:,}, rejected={rejected:,}, redirects={redirects:,}, attribution_pages={attribution_count:,}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
