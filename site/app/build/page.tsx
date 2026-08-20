import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { buildMetadata } from "../seo";

export const metadata: Metadata = buildMetadata({
  title: "Build an Offline Wikipedia Drive | Wayfarer's Archive",
  description:
    "See how the planned free Wayfarer's Archive builder will prepare and verify an offline Wikipedia drive after current validation is complete.",
  path: "/build",
});

const contents = [
  ["The encyclopedia", "A current English Wikipedia ZIM selected to fit the edition's capacity and redistribution rules."],
  ["Portable readers", "Kiwix readers for Windows, macOS, and Linux, kept on the drive alongside straightforward launch instructions."],
  ["Rights-cleared media", "Useful diagrams and other permitted media selected for offline reference, with people and scenery given lower priority."],
  ["The edition record", "Sources, versions, licenses, exclusions, checksums, and a manifest describing exactly what was placed on the drive."],
];

export default function BuildPage() {
  return (
    <>
      <SiteHeader />
      <main className="inner-page">
        <section className="inner-hero build-hero">
          <div><p className="wayfinding">The open passage · Edition I</p><h1>Build the refuge yourself.</h1><p>One guided process will prepare an empty drive directly, resume interrupted transfers, verify each major component, and leave no duplicate archive consuming the host computer.</p></div>
          <aside><span>Release status</span><strong>Builder in validation</strong><p>Rights, capacity, and cross-platform launch tests are still underway.</p></aside>
        </section>

        <section className="content-ledger">
          <div className="ledger-heading"><p className="wayfinding">Before you begin</p><h2>What the passage requires.</h2></div>
          <div className="requirement-grid">
            <article><span>01</span><h3>An empty 125 GB drive</h3><p>The builder will inspect the destination and refuse to proceed when the available capacity is unsafe.</p></article>
            <article><span>02</span><h3>A desktop computer</h3><p>The first release is planned for Windows, with portable readers included for Windows, macOS, and Linux use afterward.</p></article>
            <article><span>03</span><h3>A stable first connection</h3><p>The finished archive works offline. Creating it still requires downloading the edition, with restartable stages protecting partial progress.</p></article>
          </div>
        </section>

        <section className="manifest-section">
          <div><p className="wayfinding">Inside the vessel</p><h2>What Edition I carries.</h2></div>
          <div className="manifest-list">{contents.map(([title, copy]) => <article key={title}><h3>{title}</h3><p>{copy}</p></article>)}</div>
        </section>

        <section className="release-gate">
          <p className="wayfinding">The release gate</p>
          <h2>Free when it is trustworthy.</h2>
          <p>The builder will be published only after a complete build fits on the target drive, its critical files verify correctly, and the same finished archive launches on the supported desktop systems. Until then, no incomplete download is presented as ready.</p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
