# WayfarerArchive.com

Website source for [wayfarerarchive.com](https://wayfarerarchive.com).

Personal Web Builder toolset: **Traditional**. Bounded post-acceptance work may
be delegated directly to the property's Traditional Site Steward or the Brain;
significant product or responsive rework receives a dedicated Traditional Site
Steward, and whole-site regeneration returns to the Traditional Generator.

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
