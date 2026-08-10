# Wayfarer's Archive — public distribution

This repository builds the commercially redistributable public edition of
Wayfarer's Archive from a private reference drive without changing that drive.

The public edition contains:

- the October 2024 English Wikipedia text archive;
- XOWA and its bundled open-source components;
- portable Eclipse Temurin Java runtimes;
- a curated Wikimedia image cache whose licenses and attribution are verified;
- launchers, notices, manifests, and integrity checks.

The public edition deliberately excludes the private PDF and lecture
collections. Run `tools/Resolve-WikimediaRights.ps1` before building, then run
`tools/Build-PublicRelease.ps1`. The builder uses an explicit allowlist; it does
not mirror the source drive.

This is a compliance-oriented engineering record, not legal advice.

