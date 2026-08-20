import type { Metadata } from "next";
import FoundingBatchAction from "../components/FoundingBatchAction";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { buildMetadata } from "../seo";

export const metadata: Metadata = buildMetadata({
  title: "Founding Batch | Wayfarer's Archive",
  description:
    "Follow the measured path toward a possible small founding batch of prepared Wayfarer's Archive drives. No payment or orders are accepted yet.",
  path: "/founding-batch",
});

export default function FoundingBatchPage() {
  return (
    <>
      <SiteHeader />
      <main className="inner-page founding-page">
        <section className="inner-hero founding-hero">
          <div><p className="wayfinding">The founder&apos;s workshop</p><h1>A finished archive, planned at a human pace.</h1><p>The possible founding batch is for travelers who want a prepared, labeled, and individually tested field copy without assembling it themselves.</p></div>
          <aside><span>Current state</span><strong>Pilot not complete</strong><p>No order, reservation, payment, or delivery date is available.</p></aside>
        </section>

        <section className="batch-path">
          <div className="ledger-heading"><p className="wayfinding">The path to a real batch</p><h2>Measure first. Offer second.</h2></div>
          <div className="batch-steps">
            <article><span>Pilot</span><h3>Build the whole edition</h3><p>Measure download time, write time, failed media, manual labor, packaging, and cross-platform launch behavior.</p></article>
            <article><span>Publish</span><h3>Name the actual terms</h3><p>Disclose the drive, included edition, price, batch size, replacement reserve, and a credible shipping window.</p></article>
            <article><span>Open</span><h3>Accept only a workable number</h3><p>The workshop opens briefly for the quantity that can be built and supported comfortably, then closes until the next batch.</p></article>
          </div>
        </section>

        <section className="field-copy">
          <div><p className="wayfinding">What arrives</p><h2>A field copy with a known history.</h2></div>
          <div><p>Each finished drive is planned to include the same freely buildable archive, a durable label, a printed quick-start guide, its edition manifest, and a completed verification record.</p><p>The physical price will pay for the device, preparation, testing, packaging, replacement risk, and fulfillment—not exclusive access to the knowledge or builder.</p></div>
        </section>

        <section className="founding-interest">
          <div><p className="wayfinding">Founding interest</p><h2>Follow the workshop, without placing an order.</h2><p>A follow or preorder link will appear here only after the pilot establishes honest numbers.</p></div>
          <FoundingBatchAction />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
