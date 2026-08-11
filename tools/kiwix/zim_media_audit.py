#!/usr/bin/env python3
"""Inventory and conservatively approve Wikimedia media embedded in a ZIM."""

from __future__ import annotations

import argparse
import concurrent.futures
import html
import http.client
import json
import re
import sqlite3
import sys
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from urllib.error import HTTPError, URLError
from pathlib import Path

from libzim.reader import Archive


REPOSITORIES = {
    "_assets_/0c70a452f799bfe840676ee341124611/": (
        "commons",
        "https://commons.wikimedia.org/w/api.php",
    ),
    "_assets_/c8f24dc75f9c782269c846c9b17e400f/": (
        "enwiki",
        "https://en.wikipedia.org/w/api.php",
    ),
}
EXPORT_ENDPOINTS = {
    "commons": "https://commons.wikimedia.org/wiki/Special:Export",
    "enwiki": "https://en.wikipedia.org/wiki/Special:Export",
}
MEDIA_MIMES = {
    "image/avif",
    "image/gif",
    "image/jpeg",
    "image/png",
    "image/svg+xml",
    "image/tiff",
    "image/webp",
}
BLOCKED_LICENSE_MARKERS = re.compile(
    r"(?:noncommercial|no.?derivatives|\bNC\b|\bND\b|fair use|copyrighted|GFDL|OGL|IGO)",
    re.IGNORECASE,
)
TAG_RE = re.compile(r"<[^>]+>")
DERIVATIVE_NAME_RE = re.compile(
    r"^(?:lossy-)?(?:page\d+-)?(.+\.(?:svg|pdf|djvu|tiff?|webm|ogv|ogg))\.(?:png|jpe?g|webp)$",
    re.IGNORECASE,
)
WIKITEXT_CC_TOKEN_RE = re.compile(
    r"\bcc[- _]?by(?:[- _]?sa)?[- _]?(2\.0|2\.5|3\.0|4\.0)\b|\bcc[- _]?(?:zero|0)(?:[- _]?1\.0)?\b",
    re.IGNORECASE,
)
WIKITEXT_ALLOWED_CC_CONTEXT_RE = re.compile(
    r"{{\s*(?:cc[- _]?(?:zero|0|by)|self\b|multi[- _]?license\b)[^{}]{0,1000}?}}",
    re.IGNORECASE | re.DOTALL,
)
WIKITEXT_PD_RE = re.compile(r"{{\s*(?:template\s*:\s*)?pd(?:[- _|}])", re.IGNORECASE)
WIKITEXT_CREDIT_RE = re.compile(
    r"\|\s*(?:author|artist|credit|attribution)\s*=\s*",
    re.IGNORECASE,
)
MAX_UNMATCHED_ATTEMPTS = 3


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("zim", type=Path)
    parser.add_argument("database", type=Path)
    parser.add_argument("--inventory-only", action="store_true")
    parser.add_argument(
        "--skip-inventory",
        action="store_true",
        help="reuse an existing inventory database without traversing the ZIM again",
    )
    parser.add_argument(
        "--bulk-export",
        action="store_true",
        help="pre-approve clear allowlisted licenses from bulk Special:Export evidence",
    )
    parser.add_argument("--bulk-limit", type=int)
    parser.add_argument("--bulk-batch-size", type=int, default=1000)
    parser.add_argument("--bulk-workers", type=int, default=1, choices=range(1, 4))
    parser.add_argument("--batch-size", type=int, default=50, choices=range(1, 51))
    parser.add_argument("--delay", type=float, default=1.0)
    parser.add_argument("--max-resolutions", type=int)
    parser.add_argument(
        "--reject-pending",
        action="store_true",
        help="fail closed by rejecting all still-pending media (useful for bounded pilots)",
    )
    parser.add_argument(
        "--recheck-rejected",
        action="store_true",
        help="reset prior rejected decisions after an intentional policy change",
    )
    parser.add_argument(
        "--recheck-deferred",
        action="store_true",
        help="reset API records deferred after repeated unmatched responses",
    )
    return parser.parse_args()


def connect(path: Path) -> sqlite3.Connection:
    path.parent.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(path)
    db.execute("PRAGMA journal_mode=WAL")
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS media (
            path TEXT PRIMARY KEY,
            repository TEXT NOT NULL,
            file_title TEXT NOT NULL,
            mimetype TEXT NOT NULL,
            zim_bytes INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            reason TEXT,
            license_short TEXT,
            license_url TEXT,
            artist TEXT,
            credit TEXT,
            description_url TEXT,
            source_url TEXT,
            source_sha1 TEXT,
            source_width INTEGER,
            source_height INTEGER,
            resolved_utc TEXT
        )
        """
    )
    existing_columns = {row[1] for row in db.execute("PRAGMA table_info(media)")}
    for name, sql_type in {
        "resolution_method": "TEXT",
        "evidence_revision_id": "INTEGER",
        "evidence_timestamp": "TEXT",
        "evidence_sha1": "TEXT",
        "bulk_checked": "INTEGER NOT NULL DEFAULT 0",
        "api_attempts": "INTEGER NOT NULL DEFAULT 0",
        "api_deferred": "INTEGER NOT NULL DEFAULT 0",
        "api_last_attempt_utc": "TEXT",
    }.items():
        if name not in existing_columns:
            db.execute(f"ALTER TABLE media ADD COLUMN {name} {sql_type}")
    db.execute("CREATE INDEX IF NOT EXISTS media_status_idx ON media(status)")
    db.execute(
        "CREATE INDEX IF NOT EXISTS media_bulk_queue_idx "
        "ON media(repository, status, bulk_checked, file_title)"
    )
    db.execute(
        "CREATE INDEX IF NOT EXISTS media_repository_title_idx "
        "ON media(repository, file_title)"
    )
    db.commit()
    return db


def decode_filename(value: str) -> str:
    previous = value
    for _ in range(3):
        decoded = urllib.parse.unquote(previous)
        if decoded == previous:
            break
        previous = decoded
    filename = previous.replace("_", " ")
    derivative = DERIVATIVE_NAME_RE.match(filename)
    return derivative.group(1) if derivative else filename


def repository_for(path: str) -> tuple[str, str] | None:
    for prefix, (repository, _api) in REPOSITORIES.items():
        if path.startswith(prefix):
            return repository, decode_filename(path[len(prefix) :])
    return None


def inventory(archive: Archive, db: sqlite3.Connection) -> None:
    inserted = 0
    for index in range(archive.entry_count):
        entry = archive._get_entry_by_id(index)
        if entry.is_redirect:
            continue
        item = entry.get_item()
        source = repository_for(item.path)
        if source is None or item.mimetype not in MEDIA_MIMES:
            continue
        repository, filename = source
        db.execute(
            """
            INSERT OR IGNORE INTO media(path, repository, file_title, mimetype, zim_bytes)
            VALUES (?, ?, ?, ?, ?)
            """,
            (item.path, repository, f"File:{filename}", item.mimetype, item.size),
        )
        inserted += 1
        if inserted % 10000 == 0:
            db.commit()
            print(f"Inventoried {inserted:,} candidate entries", flush=True)
    db.commit()


def metadata_value(extmetadata: dict, name: str) -> str:
    raw = extmetadata.get(name, {})
    value = raw.get("value", "") if isinstance(raw, dict) else ""
    return html.unescape(TAG_RE.sub(" ", str(value))).strip()


def classify(info: dict) -> tuple[str, str, dict]:
    metadata = info.get("extmetadata") or {}
    license_short = metadata_value(metadata, "LicenseShortName")
    license_url = metadata_value(metadata, "LicenseUrl")
    artist = metadata_value(metadata, "Artist")
    credit = metadata_value(metadata, "Attribution") or metadata_value(metadata, "Credit")
    description_url = info.get("descriptionurl", "")
    fields = {
        "license_short": license_short,
        "license_url": license_url,
        "artist": artist,
        "credit": credit,
        "description_url": description_url,
        "source_url": info.get("url", ""),
        "source_sha1": info.get("sha1", ""),
        "source_width": info.get("width"),
        "source_height": info.get("height"),
    }
    if not license_short:
        return "rejected", "missing license metadata", fields
    if BLOCKED_LICENSE_MARKERS.search(license_short):
        return "rejected", f"blocked license: {license_short}", fields
    normalized_license = " ".join(re.sub(r"[-_]+", " ", license_short).upper().split())
    is_public_domain = bool(
        re.fullmatch(r"PUBLIC DOMAIN|PD(?: .+)?", normalized_license)
    )
    is_cc0 = bool(re.fullmatch(r"CC0(?: 1\.0)?", normalized_license))
    allowed_license = bool(
        is_public_domain
        or is_cc0
        or re.fullmatch(r"CC BY(?: SA)? (?:2\.0|2\.5|3\.0|4\.0)", normalized_license)
    )
    if not allowed_license:
        return "rejected", f"license outside conservative allowlist: {license_short}", fields
    if not description_url:
        return "rejected", "missing source description URL", fields
    if not (is_public_domain or is_cc0) and not (artist or credit):
        return "rejected", "missing required artist or credit", fields
    if not info.get("sha1"):
        return "rejected", "missing source SHA-1", fields
    return "approved", "verified allowlisted license and credit", fields


def fetch_batch(api: str, titles: list[str]) -> dict:
    body = urllib.parse.urlencode(
        {
            "action": "query",
            "format": "json",
            "formatversion": "2",
            "maxlag": "5",
            "redirects": "1",
            "prop": "imageinfo",
            "iiprop": "url|sha1|mime|size|extmetadata",
            "titles": "|".join(titles),
        }
    ).encode("utf-8")
    request = urllib.request.Request(
        api,
        data=body,
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "WayfarersArchiveRightsAudit/1.0 (wayfarerarchive.com)",
        },
    )
    with urllib.request.urlopen(request, timeout=90) as response:
        return json.load(response)


def clean_wikitext_credit(value: str) -> str:
    value = re.sub(r"<!--.*?-->", "", value, flags=re.DOTALL)
    value = re.sub(r"\[\[(?:[^]|]+\|)?([^]]+)]]", r"\1", value)
    value = re.sub(r"{{\s*Creator:([^}|]+).*?}}", r"\1", value, flags=re.IGNORECASE | re.DOTALL)
    value = re.sub(r"'{2,}", "", value)
    return " ".join(value.split()).strip()


def extract_wikitext_credit(text: str) -> str:
    match = WIKITEXT_CREDIT_RE.search(text)
    if not match:
        return ""
    index = match.end()
    curly_depth = square_depth = 0
    output: list[str] = []
    while index < len(text) and len(output) < 2000:
        pair = text[index : index + 2]
        if pair == "[[":
            square_depth += 1
            output.append(pair)
            index += 2
            continue
        if pair == "]]" and square_depth:
            square_depth -= 1
            output.append(pair)
            index += 2
            continue
        if pair == "{{":
            curly_depth += 1
            output.append(pair)
            index += 2
            continue
        if pair == "}}":
            if curly_depth:
                curly_depth -= 1
                output.append(pair)
                index += 2
                continue
            break
        character = text[index]
        if (character == "\n" or character == "|") and not curly_depth and not square_depth:
            break
        output.append(character)
        index += 1
    return clean_wikitext_credit("".join(output))


def canonical_cc_display(token: str) -> str:
    normalized = " ".join(re.sub(r"[-_]+", " ", token).upper().split())
    if normalized.startswith("CC ZERO") or normalized.startswith("CC0"):
        return "CC0 1.0"
    match = re.fullmatch(r"CC BY( SA)? (2\.0|2\.5|3\.0|4\.0)", normalized)
    if match:
        return f"CC BY{'-SA' if match.group(1) else ''} {match.group(2)}"
    return token.strip()


def classify_wikitext(text: str) -> tuple[str, str] | None:
    cc_context = WIKITEXT_ALLOWED_CC_CONTEXT_RE.search(text)
    cc = WIKITEXT_CC_TOKEN_RE.search(cc_context.group(0)) if cc_context else None
    public_domain = WIKITEXT_PD_RE.search(text)
    if not (cc or public_domain):
        return None
    credit = extract_wikitext_credit(text)
    if not credit and not public_domain:
        return None
    if cc:
        license_short = canonical_cc_display(cc.group(0))
    else:
        license_short = "Public domain"
    return license_short, credit


def fetch_export(endpoint: str, titles: list[str]) -> ET.Element:
    body = urllib.parse.urlencode(
        {"pages": "\n".join(titles), "curonly": "1", "wpDownload": "1"}
    ).encode("utf-8")
    request = urllib.request.Request(
        endpoint,
        data=body,
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "WayfarersArchiveRightsAudit/1.0 (wayfarerarchive.com)",
        },
    )
    backoff = 5.0
    while True:
        try:
            with urllib.request.urlopen(request, timeout=180) as response:
                return ET.parse(response).getroot()
        except (
            HTTPError,
            URLError,
            TimeoutError,
            OSError,
            http.client.HTTPException,
            ET.ParseError,
        ) as exc:
            retry_after = exc.headers.get("Retry-After") if isinstance(exc, HTTPError) else None
            cooldown = float(retry_after) if retry_after and retry_after.isdigit() else backoff
            cooldown = min(max(cooldown, 5.0), 300.0)
            print(
                f"Bulk export request failed; retaining pending state and waiting {cooldown:.0f}s: {exc}",
                file=sys.stderr,
                flush=True,
            )
            time.sleep(cooldown)
            backoff = min(cooldown * 2, 300.0)


def bulk_resolve(
    db: sqlite3.Connection, limit: int | None, batch_size: int = 500, workers: int = 1
) -> None:
    processed = 0
    # Commons is intentionally the only bulk-approved repository. English
    # Wikipedia permits local fair-use uploads, so every local file goes
    # through imageinfo/extmetadata instead.
    for repository in ("commons",):
        endpoint = EXPORT_ENDPOINTS[repository]
        while limit is None or processed < limit:
            batch_started = time.perf_counter()
            wave_size = batch_size * workers
            remaining = wave_size if limit is None else min(wave_size, limit - processed)
            titles = [
                row[0]
                for row in db.execute(
                    "SELECT file_title FROM media WHERE repository=? AND status='pending' AND bulk_checked=0 GROUP BY file_title LIMIT ?",
                    (repository, remaining),
                )
            ]
            if not titles:
                break
            selected_at = time.perf_counter()
            print(
                f"Selected {len(titles):,} bulk titles in {selected_at - batch_started:.2f}s; "
                f"fetching evidence with {workers} worker(s)",
                flush=True,
            )
            title_batches = [titles[offset : offset + batch_size] for offset in range(0, len(titles), batch_size)]
            if workers == 1:
                roots = [fetch_export(endpoint, title_batches[0])]
            else:
                with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as executor:
                    roots = list(executor.map(lambda batch: fetch_export(endpoint, batch), title_batches))
            fetched_at = time.perf_counter()
            print(
                f"Fetched and parsed {len(roots)} bulk export(s) in "
                f"{fetched_at - selected_at:.2f}s; applying decisions",
                flush=True,
            )
            approved = 0
            for page in (page for root in roots for page in root.findall(".//{*}page")):
                title_node = page.find("{*}title")
                revision = page.find("{*}revision")
                if title_node is None or revision is None:
                    continue
                text_node = revision.find("{*}text")
                result = classify_wikitext(text_node.text or "" if text_node is not None else "")
                if result is None:
                    continue
                license_short, credit = result
                title = title_node.text or ""
                revision_id = revision.findtext("{*}id")
                timestamp = revision.findtext("{*}timestamp")
                evidence_sha1 = revision.findtext("{*}sha1")
                encoded_title = urllib.parse.quote(title.replace(" ", "_"), safe=":()!,')")
                description_url = f"https://{'commons.wikimedia.org' if repository == 'commons' else 'en.wikipedia.org'}/wiki/{encoded_title}"
                db.execute(
                    """
                    UPDATE media INDEXED BY media_repository_title_idx
                    SET status='approved', reason='bulk export: clear allowlisted license and credit',
                        license_short=?, credit=?, description_url=?, resolution_method='special-export',
                        evidence_revision_id=?, evidence_timestamp=?, evidence_sha1=?,
                        resolved_utc=strftime('%Y-%m-%dT%H:%M:%SZ','now')
                    WHERE repository=? AND file_title=? AND status='pending'
                    """,
                    (license_short, credit, description_url, revision_id, timestamp, evidence_sha1, repository, title),
                )
                approved += 1
            db.executemany(
                "UPDATE media INDEXED BY media_repository_title_idx "
                "SET bulk_checked=1 WHERE repository=? AND file_title=?",
                ((repository, title) for title in titles),
            )
            db.commit()
            processed += len(titles)
            print(
                f"Bulk evidence processed {processed:,} unique titles; approved {approved:,} in this batch "
                f"({time.perf_counter() - batch_started:.2f}s total)",
                flush=True,
            )


def normalized_key(title: str) -> str:
    return title.replace("_", " ").casefold()


def resolve_alias(key: str, aliases: dict[str, str]) -> str:
    visited: set[str] = set()
    while key in aliases and key not in visited:
        visited.add(key)
        key = aliases[key]
    return key


def defer_unmatched(
    db: sqlite3.Connection, repository: str, titles: list[str]
) -> int:
    deferred = 0
    for title in titles:
        cursor = db.execute(
            """
            UPDATE media INDEXED BY media_repository_title_idx
            SET api_attempts=api_attempts+1,
                api_deferred=CASE WHEN api_attempts+1 >= ? THEN 1 ELSE 0 END,
                api_last_attempt_utc=strftime('%Y-%m-%dT%H:%M:%SZ','now'),
                reason='API response did not contain a match; retained pending for bounded retry',
                resolution_method='imageinfo-api-unmatched'
            WHERE repository=? AND file_title=? AND status='pending'
            """,
            (MAX_UNMATCHED_ATTEMPTS, repository, title),
        )
        deferred += cursor.rowcount
    return deferred


def resolve(db: sqlite3.Connection, batch_size: int, delay: float, limit: int | None) -> None:
    resolved = 0
    backoff = max(delay, 1.0)
    current_batch_size = batch_size
    totals = dict(db.execute("SELECT status, count(*) FROM media GROUP BY status"))
    for repository, api in (value for value in REPOSITORIES.values()):
        while limit is None or resolved < limit:
            remaining = current_batch_size if limit is None else min(current_batch_size, limit - resolved)
            rows = db.execute(
                "SELECT file_title FROM media WHERE repository=? AND status='pending' "
                "AND api_deferred=0 AND api_attempts=0 GROUP BY file_title LIMIT ?",
                (repository, remaining),
            ).fetchall()
            if not rows:
                rows = db.execute(
                    "SELECT file_title FROM media WHERE repository=? AND status='pending' "
                    "AND api_deferred=0 AND api_attempts<? GROUP BY file_title LIMIT ?",
                    (repository, MAX_UNMATCHED_ATTEMPTS, remaining),
                ).fetchall()
            if not rows:
                break
            titles = [row[0] for row in rows]
            requested = {normalized_key(title): title for title in titles}
            try:
                payload = fetch_batch(api, titles)
            except Exception as exc:
                if isinstance(exc, HTTPError) and exc.code == 414:
                    if current_batch_size == 1:
                        raise RuntimeError(
                            "API rejected a single-title POST request as too large"
                        ) from exc
                    current_batch_size = max(1, current_batch_size // 2)
                    print(
                        f"API rejected an oversized request; reducing batches to {current_batch_size} title(s)",
                        file=sys.stderr,
                        flush=True,
                    )
                    continue
                if isinstance(exc, HTTPError) and exc.code < 500 and exc.code != 429:
                    raise
                retry_after = None
                if isinstance(exc, HTTPError):
                    retry_after = exc.headers.get("Retry-After")
                cooldown = float(retry_after) if retry_after and retry_after.isdigit() else backoff
                cooldown = min(max(cooldown, 5.0), 300.0)
                print(
                    f"API request failed; retaining pending state and waiting {cooldown:.0f}s: {exc}",
                    file=sys.stderr,
                    flush=True,
                )
                time.sleep(cooldown)
                backoff = min(cooldown * 2, 300.0)
                continue
            backoff = max(delay, 1.0)

            aliases: dict[str, str] = {}
            query = payload.get("query", {})
            for group in ("normalized", "redirects"):
                for mapping in query.get(group, []):
                    target_key = normalized_key(mapping["to"])
                    source_key = normalized_key(mapping["from"])
                    if target_key != source_key:
                        aliases[target_key] = source_key

            seen: set[str] = set()
            for page in query.get("pages", []):
                key = normalized_key(page.get("title", ""))
                key = resolve_alias(key, aliases)
                requested_title = requested.get(key)
                if requested_title is None:
                    continue
                seen.add(requested_title)
                imageinfo = (page.get("imageinfo") or [None])[0]
                if page.get("missing") or not imageinfo:
                    status, reason, fields = "rejected", "missing remote file record", {}
                else:
                    status, reason, fields = classify(imageinfo)
                cursor = db.execute(
                    """
                    UPDATE media INDEXED BY media_repository_title_idx
                    SET status=?, reason=?, license_short=?, license_url=?, artist=?,
                        credit=?, description_url=?, source_url=?, source_sha1=?, source_width=?,
                        source_height=?, resolution_method='imageinfo-api',
                        resolved_utc=strftime('%Y-%m-%dT%H:%M:%SZ','now')
                    WHERE repository=? AND file_title=?
                    """,
                    (
                        status,
                        reason,
                        fields.get("license_short"),
                        fields.get("license_url"),
                        fields.get("artist"),
                        fields.get("credit"),
                        fields.get("description_url"),
                        fields.get("source_url"),
                        fields.get("source_sha1"),
                        fields.get("source_width"),
                        fields.get("source_height"),
                        repository,
                        requested_title,
                    ),
                )
                changed = cursor.rowcount
                if changed > 0:
                    totals["pending"] = totals.get("pending", 0) - changed
                    totals[status] = totals.get(status, 0) + changed
            unmatched = [title for title in titles if title not in seen]
            if unmatched:
                deferred_rows = defer_unmatched(db, repository, unmatched)
                print(
                    f"API response left {len(unmatched)} title(s) unmatched; "
                    f"retained {deferred_rows} media row(s) pending for bounded retry",
                    file=sys.stderr,
                    flush=True,
                )
            db.commit()
            resolved += len(titles) - len(unmatched)
            print(f"Resolved {resolved:,}; totals: {totals}", flush=True)
            if delay:
                time.sleep(delay)


def main() -> int:
    args = parse_args()
    db = connect(args.database)
    if args.recheck_rejected:
        db.execute(
            "UPDATE media SET status='pending', reason=NULL, resolved_utc=NULL WHERE status='rejected'"
        )
        db.commit()
    if args.recheck_deferred:
        db.execute(
            "UPDATE media SET api_attempts=0, api_deferred=0, api_last_attempt_utc=NULL, "
            "reason=NULL, resolution_method=NULL WHERE status='pending' AND api_deferred=1"
        )
        db.commit()
    if args.skip_inventory:
        inventory_count = db.execute("SELECT count(*) FROM media").fetchone()[0]
        if inventory_count == 0:
            raise RuntimeError("--skip-inventory requires a populated media database")
        print(f"Reusing {inventory_count:,} inventoried media entries", flush=True)
    else:
        archive = Archive(args.zim)
        inventory(archive, db)
    totals = dict(db.execute("SELECT status, count(*) FROM media GROUP BY status"))
    print(f"Inventory complete: {totals}", flush=True)
    if args.bulk_export:
        bulk_resolve(db, args.bulk_limit, args.bulk_batch_size, args.bulk_workers)
    if not args.inventory_only:
        resolve(db, args.batch_size, args.delay, args.max_resolutions)
    if args.reject_pending:
        db.execute(
            "UPDATE media SET status='rejected', reason='unresolved at audit close', resolved_utc=strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE status='pending'"
        )
        db.commit()
    totals = dict(db.execute("SELECT status, count(*) FROM media GROUP BY status"))
    print(f"Final totals: {totals}")
    reasons = db.execute(
        "SELECT reason, count(*), sum(zim_bytes) FROM media WHERE status='rejected' GROUP BY reason ORDER BY count(*) DESC"
    ).fetchall()
    if reasons:
        print("Rejection summary:")
        for reason, count, byte_count in reasons:
            print(f"  {count:>8,}  {byte_count:>14,} bytes  {reason}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
