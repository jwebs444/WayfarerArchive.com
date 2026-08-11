import io
import tempfile
import urllib.parse
import unittest
from pathlib import Path
from unittest.mock import patch

from zim_media_audit import MAX_UNMATCHED_ATTEMPTS, classify_wikitext, connect, decode_filename, defer_unmatched, extract_wikitext_credit, fetch_batch, repository_for, resolve_alias
from zim_rights_filter import attribution_path, rewrite_html


COMMONS = "_assets_/0c70a452f799bfe840676ee341124611/"
ENWIKI = "_assets_/c8f24dc75f9c782269c846c9b17e400f/"


class PipelineTests(unittest.TestCase):
    def test_decodes_mwoffliner_filename(self):
        self.assertEqual(decode_filename("Map%252C_example.svg.png"), "Map, example.svg")
        self.assertEqual(decode_filename("page1-Manual.pdf.jpg"), "Manual.pdf")

    def test_repository_hashes(self):
        self.assertEqual(repository_for(COMMONS + "Example.jpg")[0], "commons")
        self.assertEqual(repository_for(ENWIKI + "Example.jpg")[0], "enwiki")
        self.assertIsNone(repository_for("_assets_/skin/icon.png"))

    def test_alias_cycles_terminate(self):
        self.assertEqual(resolve_alias("same", {"same": "same"}), "same")
        self.assertIn(resolve_alias("a", {"a": "b", "b": "a"}), {"a", "b"})

    def test_imageinfo_batches_are_sent_in_post_body(self):
        response = io.BytesIO(b'{"query":{"pages":[]}}')
        with patch("zim_media_audit.urllib.request.urlopen", return_value=response) as urlopen:
            payload = fetch_batch("https://example.test/w/api.php", ["File:" + "x" * 4000 + ".jpg"])
        request = urlopen.call_args.args[0]
        form = urllib.parse.parse_qs(request.data.decode("utf-8"))
        self.assertEqual(request.get_method(), "POST")
        self.assertEqual(request.full_url, "https://example.test/w/api.php")
        self.assertEqual(form["titles"][0], "File:" + "x" * 4000 + ".jpg")
        self.assertEqual(payload, {"query": {"pages": []}})

    def test_unmatched_titles_remain_pending_then_defer(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            db = connect(Path(temp_dir) / "audit.sqlite")
            try:
                db.execute(
                    "INSERT INTO media(path, repository, file_title, mimetype, zim_bytes) "
                    "VALUES (?, ?, ?, ?, ?)",
                    ("asset/example", "commons", "File:Example.jpg", "image/jpeg", 1234),
                )
                for expected_attempt in range(1, MAX_UNMATCHED_ATTEMPTS + 1):
                    defer_unmatched(db, "commons", ["File:Example.jpg"])
                    attempts, deferred, status = db.execute(
                        "SELECT api_attempts, api_deferred, status FROM media"
                    ).fetchone()
                    self.assertEqual(attempts, expected_attempt)
                    self.assertEqual(deferred, int(expected_attempt == MAX_UNMATCHED_ATTEMPTS))
                    self.assertEqual(status, "pending")
            finally:
                db.close()

    def test_bulk_wikitext_needs_license_and_credit(self):
        result = classify_wikitext("{{Information\n|author=Jane Example\n}}\n{{cc-by-sa-4.0}}")
        self.assertIsNotNone(result)
        self.assertEqual(result[1], "Jane Example")
        self.assertIsNotNone(classify_wikitext("{{Information|author=Jane}}\n{{self|cc-by-4.0}}"))
        self.assertIsNone(classify_wikitext("{{Information|author=Jane}}\n{{GFDL}}"))
        self.assertIsNone(classify_wikitext("{{cc-by-4.0}}"))
        self.assertIsNotNone(classify_wikitext("{{PD-old-100-expired}}"))
        self.assertIsNone(classify_wikitext("{{Information|author=Jane}}\nSource says CC BY 4.0 in prose."))

    def test_credit_parser_preserves_wikilink_label(self):
        text = "{{Information\n|author=[[User:Tweedle|Tweedledumb2]]\n|date=2020\n}}"
        self.assertEqual(extract_wikitext_credit(text), "Tweedledumb2")
        inline = "{{Information|author={{Creator:Jane Example}}|date=2020}}"
        self.assertEqual(extract_wikitext_credit(inline), "Jane Example")

    def test_rewrite_removes_only_rejected_repository_media(self):
        approved_path = COMMONS + "Approved.jpg"
        rejected_path = COMMONS + "Rejected.jpg"
        support_path = "_assets_/skin/icon.png"
        source = (
            f'<img src="./{approved_path}"><img src="./{rejected_path}">'
            f'<img src="./{support_path}">'
        ).encode()
        rewritten = rewrite_html(source, {approved_path}, "Example_article")
        self.assertIn(b"Approved.jpg", rewritten)
        self.assertNotIn(b"Rejected.jpg", rewritten)
        self.assertIn(b"skin/icon.png", rewritten)
        self.assertIn(b"wayfarer-media-attribution", rewritten)
        self.assertIn(attribution_path("commons", "File:Approved.jpg").encode(), rewritten)


if __name__ == "__main__":
    unittest.main()
