# Contributing

The repository covers the public website, drive-builder logic, release manifests, tests, and documentation. Large archive payloads and material without confirmed redistribution rights do not belong in Git history.

Before opening a change:

1. Run `pnpm install --frozen-lockfile`.
2. Run `pnpm test`.
3. Keep public-facing text compatible with UTF-8 and avoid decorative symbols that degrade on older offline systems.
4. Never mark a release manifest `ready` until every package URL, byte count, and SHA-256 value has been independently verified.
