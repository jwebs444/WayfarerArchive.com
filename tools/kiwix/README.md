# Kiwix 1.0 build tools

These tools create a rights-filtered Kiwix ZIM without extracting the source
archive. They never modify the source ZIM.

1. Install the pinned `requirements.txt` into an isolated Python environment.
2. Run `Get-KiwixSource.ps1` to resume/download and verify the pinned official
   English Wikipedia source ZIM.
3. Inventory once with
   `zim_media_audit.py SOURCE.zim rights.sqlite --inventory-only`.
4. Resolve clear Commons licenses with
   `zim_media_audit.py SOURCE.zim rights.sqlite --skip-inventory --bulk-export --bulk-batch-size 5000 --bulk-workers 3 --inventory-only`.
   The worker count is deliberately capped at Wikimedia's published maximum of
   three concurrent requests. Clear Commons license templates are resolved from
   bulk page-revision evidence. The command is restartable; already checked
   titles are skipped.
5. Resolve ambiguous Commons files and every English-Wikipedia-local upload
   through `imageinfo/extmetadata` with
   `zim_media_audit.py SOURCE.zim rights.sqlite --skip-inventory`.
   The API phase honors `Retry-After` and uses exponential backoff.
6. Review the SQLite summary and rejected reasons.
7. Run `zim_rights_filter.py SOURCE.zim rights.sqlite OUTPUT.zim`.
8. Validate the result with `zimcheck` and test it in every bundled reader.
9. Run `Get-KiwixReaders.ps1` to acquire and checksum the pinned Windows,
   Linux, and macOS readers.

The audit is fail-closed. Only the project's explicit public-domain, CC0,
CC BY, and CC BY-SA allowlist is approved. Missing records, missing credit,
ambiguous licenses, noncommercial/no-derivatives terms, and other unusual
licenses remain excluded. Progress is committed to SQLite after each API batch,
so a full audit can resume after an interruption.

Public-domain and CC0 files do not require an author credit. CC BY and CC
BY-SA files do. Public Domain Mark (`PDM`) and "no known restrictions" are not
treated as public-domain licenses by this conservative gate.

The two Wikimedia upload directory hashes are stable products of MWoffliner's
path mapping and are covered by its own unit tests. All unrelated skin,
JavaScript, CSS, math, and interface assets remain in the archive.
