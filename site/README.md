# Wayfarer's Archive

The public home and reproducible build tooling for the Wayfarer's Archive preservation project. Public edition 0.7 contains offline Wikipedia, 313 rights-verified images, portable readers, source records, and integrity checks.

Canonical website: <https://wayfarerarchive.com>

## Repository scope

This repository contains:

- The online project website
- The Windows drive-builder preview
- Release-manifest schema examples
- Tests and deployment configuration
- Documentation for publishing verified archive bundles

The approximately 65.4 GiB archive payload is not stored in Git. Public releases use separately hosted sequential packages with SHA-256 values in `public/downloads/release-manifest.json`. Material without confirmed commercial redistribution rights must not be published.

## Development

Requirements: Node.js 22 or newer and pnpm.

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm test
```

## Drive builder status

`public/downloads/Create-PreservationDrive.ps1` implements target-drive safety checks, package-by-package restart support, SHA-256 verification, low-overhead 7-Zip assembly, and final archive verification. The checked-in manifest remains in `staged` state until every public object has been uploaded and independently verified.

## Offline front door

The serverless removable-drive interface is maintained in the parent archive at `START_HERE.html` and `Portal/assets`. It does not require this web application to run.
