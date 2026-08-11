# Wayfarer 1.0 rebuild plan

Plan date: 2026-08-10

## Non-negotiable constraints

- Complete current English Wikipedia article coverage.
- Standard target capacity: 125,000,000,000 bytes or greater.
- The installer must never require more space on the target than the target
  drive provides, including temporary downloads and extraction.
- Public media must pass the existing commercial-redistribution rights gate.
- The private archive remains the source of truth and is not rebuilt in place.
- The website describes a tested release; it does not lead the release.

## Build order

1. Preserve Wayfarer Public 0.7 as a regression baseline.
2. Create a separate private staging tree for 1.0.
3. Acquire the newest completed official full-English Kiwix ZIM and verify its
   published checksum.
4. Produce a complete embedded-media inventory directly from that ZIM.
5. Resolve every candidate through the Wikimedia APIs and the existing rights
   gate, storing resumable results and attribution in SQLite.
6. Stream the source through the rights database into a new ZIM, omit rejected
   media, remove their image tags, and rebuild the Kiwix search index.
7. Validate the filtered ZIM with `zimcheck` and exercise it in the portable
   Windows, macOS, and Linux readers.
8. Assemble and test a capacity-constrained private candidate.
9. Install that candidate onto a clean 125 GB target using the public installer
   and record peak usage.
10. Publish release objects to R2 only after the physical-drive test passes.
11. Update the website and public documentation last.

## Current source snapshot

MWoffliner does not import Wikimedia's XML dump; it builds from the live
MediaWiki APIs. Re-scraping all English Wikipedia pages locally would be slower
and create more intermediate state than necessary. The 1.0 pipeline therefore
starts from the newest completed official Kiwix full-English ZIM, whose media
paths retain the source repository and filename, then performs a streaming
rights-filtered rewrite. XOWA remains only in the preserved 0.7 baseline.

## Media policy

Continue the present allowlist:

- Public domain
- CC0
- CC BY 2.0, 2.5, 3.0, or 4.0
- CC BY-SA 2.0, 2.5, 3.0, or 4.0

Continue excluding or reviewing:

- Fair use and other non-free English Wikipedia files
- Copyrighted-with-permission or otherwise ambiguous files
- Noncommercial or no-derivatives licenses
- GFDL-only and unusual licenses whose redistribution obligations are not part
  of the release workflow
- Missing remote records, changed hashes, or missing required credit

For scale, the inventory must record repository, canonical file title, source
URL, description URL, license, artist/credit, remote hash, rendition dimensions,
downloaded hash, byte count, and every article reference.

"All approved images" is a desired outcome, not yet a demonstrated capacity
fact. Kiwix's February 2026 full-English image ZIM is approximately
123,980,646,400 bytes by itself. It leaves only about 1.0 GB on the project's
125 GB minimum target before adding readers or installation overhead. The 1.0
build must therefore measure the filtered ZIM rather than infer its size from
the unfiltered archive.

The official ZIM already stores display-sized, compressed renditions. The first
measurement retains those renditions and removes only media that fails the
rights gate. If every approved image does not fit, report the actual shortfall
before applying any subject ranking or further downsampling.

## Target capacity contract

Use 125,000,000,000 bytes as the minimum target, not the marketing label
"128 GB." Reserve at least 2,000,000,000 bytes after installation for filesystem
overhead, logs, reader state, and operational safety. Initial maximum installed
payload: 123,000,000,000 bytes, subject to physical-drive measurement.

The current uncompressed 3 GB 7z packages are sequential, but each package
temporarily duplicates its content during extraction. They are safe for the
70 GB prototype but unsuitable for a near-capacity release.

For 1.0:

- Publish the final ZIM and portable reader files directly.
- Download each object to its final directory as `<name>.partial`.
- Verify it, then atomically rename it to the final filename.
- Never retain a second archive copy on the target.
- Bundle only small-file groups where the temporary expansion is bounded and
  included in the capacity calculation.
- Check required remaining space before every transfer.
- Resume partial downloads and remove installation metadata after success.

This makes peak target usage approximately equal to final installed usage,
rather than final usage plus a multi-gigabyte package.

## Workspace policy

Do not import directly over the private master drive. Build into a versioned
scratch/staging directory with enough room for the 24.8 GB source dump, the
fresh XOWA databases, image renditions, and comparison outputs. After validation,
copy the candidate to one designated physical test drive. Preserve both the
private master and Public 0.7 until 1.0 has passed launch, integrity, rights, and
capacity tests.
