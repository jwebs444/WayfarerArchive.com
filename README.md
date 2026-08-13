# WayfarerArchive.com

Website source for [wayfarerarchive.com](https://wayfarerarchive.com).

The production application lives in `site/`. It is a vinext/React application
deployed as a Cloudflare Worker from GitHub. Archive-building experiments,
Wikipedia payloads, rights-audit databases, portable-reader bundles, and drive
assembly tools are intentionally outside this repository's current scope.

## Local development

```bash
cd site
pnpm install --frozen-lockfile
pnpm test
pnpm dev
```

See `site/README.md` for deployment and storefront configuration.
