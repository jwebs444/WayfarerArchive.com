# WayfarerArchive.com website

The public storefront and project website for <https://wayfarerarchive.com>.

The current storefront intentionally does not accept payments. Physical orders
open only after the pilot establishes cost, build time, failure allowance, and a
credible shipping window. See `COMMERCE-PLAN.md`.

## Development

Requirements: Node.js 22 or newer and pnpm.

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm dev
```

## Cloudflare deployment

This is a vinext application deployed as a Cloudflare Worker, following the
same deployment shape as LanceForward.com.

- `wrangler.jsonc` declares the Worker and `wayfarerarchive.com` custom domain.
- `pnpm build` creates the Cloudflare deployment bundle.
- `pnpm deploy:dry-run` validates it without publishing.
- `pnpm deploy` publishes it.
- `.github/workflows/ci.yml` validates pushes and pull requests.
- Cloudflare Workers Builds should connect to the GitHub repository and deploy
  the `main` branch automatically.

Recommended Workers Builds settings:

- Root directory: `site`
- Build command: `pnpm install --frozen-lockfile && pnpm build`
- Deploy command: `pnpm deploy`
- Production branch: `main`
- Node.js: 22

The former `.openai/hosting.json` marker and Sites build plugin were removed;
this repository no longer targets GPT website hosting.

## Founding-batch integration

The storefront is prepared for BackerKit without loading third-party checkout
code while the batch is still in pilot testing.

- `NEXT_PUBLIC_BACKERKIT_CAMPAIGN_URL` links visitors to the pre-launch campaign.
- `NEXT_PUBLIC_BACKERKIT_PREORDER_URL` enables BackerKit's embedded preorder
  modal and takes precedence over the campaign link.
- With neither value set, the founding-batch action remains visibly dormant.

Do not set the preorder URL until the price, slot count, inventory, policies,
and credible shipping window are published.

## Repository scope

This repository contains only the website, its tests, documentation, and
deployment configuration. Earlier Wikipedia-drive build experiments and
downloadable installer artifacts are not part of this codebase.
