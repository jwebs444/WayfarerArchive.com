# Physical edition commerce plan

## Recommendation

Use a staged founding-batch model. Do not accept paid orders into an indefinite
queue and wait for the queue to become convenient.

### Stage 1 — interest, no payment

- Finish the public Edition 1.0 release and physical pilot.
- Publish the expected device, packaging, labor, replacement, payment, and
  shipping costs.
- Collect optional interest only after Turnstile and a privacy notice are live.
- Make it explicit that joining the list is not an order or reservation.

Use a BackerKit pre-launch page for the initial follower list. The site already
supports `NEXT_PUBLIC_BACKERKIT_CAMPAIGN_URL`; setting it changes the dormant
founding-batch buttons into links to that page.

### Stage 2 — capped founding batch

- Open a fixed number of order slots based on demonstrated weekly capacity.
- State the expected shipment window clearly before checkout.
- Charge through hosted Stripe Checkout only after materials and capacity are
  available.
- Close checkout automatically when the batch is full.
- Keep order, shipment, cancellation, refund, and customer-contact records.

BackerKit is the recommended founding-batch platform. Its first-party preorder
widget can open checkout in a modal from the Wayfarer site, while BackerKit
handles inventory limits, shipping rates, backer records, and fulfillment
exports. Set `NEXT_PUBLIC_BACKERKIT_PREORDER_URL` to the project's
`overlay_preorders` URL when—and only when—the paid batch is ready to open.

Current platform costs should be checked again immediately before launch.
BackerKit currently publishes a 5% crowdfunding platform fee plus payment
processing for campaigns launched there. Its pledge-manager pricing varies by
where the campaign launched and how funds are collected.

### Stage 3 — repeatable workshop batches

- Prefer dated monthly or quarterly drops over an indefinite rolling backlog.
- Keep a small replacement reserve for failed media and shipping damage.
- Invite interest-list members before opening remaining slots publicly.
- Increase batch size only after prior batches ship comfortably.

## Why not the alternatives?

### Long-lead rolling orders

This creates the greatest administrative burden: every order has a different
age, the promised shipping date can become ambiguous, and delays require active
customer consent or refunds. It is a poor first model for a one-person workshop.

### Holding paid single orders until a batch forms

Do not do this without a clearly disclosed, supportable shipment date. The FTC's
Mail, Internet, or Telephone Order Merchandise Rule requires a reasonable basis
for shipping representations. If the stated time cannot be met—or within 30
days when no time is stated—the buyer must be offered delay consent or a prompt
refund.

### Pledge campaign

A campaign can fund tooling and inventory, but it raises the trust burden before
the pilot has established true costs. Reconsider it only if the pilot shows that
minimum-order quantities, custom enclosures, or packaging require more capital
than a small capped batch can support.

Crowd Supply is a credible later alternative if Wayfarer becomes a true custom
hardware product needing global logistics. It is curated, typically charges
12% of product sales, and handles fulfillment through Mouser; that is more
service and more cost than this initial assembled-drive batch needs.

Platform references:

- BackerKit pricing: <https://www.backerkit.com/pricing>
- BackerKit website widget: <https://help.backerkit.com/article/845-how-to-set-up-widget-on-website>
- BackerKit pre-launch pages: <https://help.backerkit.com/article/971-how-to-use-your-pre-launch-page>
- Crowd Supply applications: <https://www.crowdsupply.com/apply>

FTC guide: <https://www.ftc.gov/business-guidance/resources/business-guide-ftcs-mail-internet-or-telephone-order-merchandise-rule>

## Cloudflare and commerce architecture

### Website

- GitHub `main` → Cloudflare Workers Builds → `wayfarerarchive.com`
- vinext Worker for the storefront and later API routes
- Turnstile on every public submission form with mandatory server-side
  Siteverify validation
- Observability enabled in Wrangler configuration

### Downloads

- R2 bucket for immutable, versioned installer and release objects
- Production custom domain such as `downloads.wayfarerarchive.com`
- Cloudflare cache, WAF, and rate-limiting rules on the custom domain
- Release manifest contains exact byte counts and SHA-256 values
- Website links to a small installer; the installer retrieves sequential archive
  packages, rather than serving a drive-sized file through the website Worker

### Checkout, when ready

- Stripe-hosted Checkout for payment handling
- Worker endpoint creates only allowlisted product/price sessions
- Stripe webhook verifies signatures and records order state
- D1 stores fulfillment state; payment-card data never enters D1
- Checkout stays closed unless a batch has a published price, slot count, and
  shipping window

Cloudflare references:

- Workers Builds: <https://developers.cloudflare.com/workers/ci-cd/builds/>
- R2 custom domains: <https://developers.cloudflare.com/r2/buckets/public-buckets/#custom-domains>
- Turnstile validation: <https://developers.cloudflare.com/turnstile/get-started/server-side-validation/>

## Required decisions before paid checkout

- Final device make/model and tested usable capacity
- Unit, packaging, payment, tax, and shipping cost
- Batch size and credible shipment window
- Sales regions and shipping carriers
- Cancellation, refund, replacement, and limited-warranty policies
- Privacy policy, terms of sale, and customer-support address
- Treatment of sales tax and business registration with qualified professional
  review where needed
