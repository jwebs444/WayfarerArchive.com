import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { buildMetadata } from "../seo";

export const metadata: Metadata = buildMetadata({
  title: "Personal Offline Library | Wayfarer's Archive",
  description:
    "Learn how to extend a Wayfarer's Archive drive with books, lectures, maps, and personal records you lawfully obtain and keep yourself.",
  path: "/build-beyond",
});

const formats = [
  ["PDF & EPUB", "Field manuals, books, papers, maps, and saved reference documents."],
  ["MP3 & M4A", "Lectures, oral histories, language lessons, and spoken-word collections."],
  ["MP4 & WebM", "Demonstrations and courses whose value depends on seeing the work."],
  ["TXT, HTML & images", "Notes, inventories, family records, scans, diagrams, and local web references."],
];

const shelf = [
  {
    title: "Hesperian Health Guides",
    copy: "The creator's private shelf includes selected Hesperian health manuals. Use Hesperian's current English resource page to obtain the editions they make available to you.",
    href: "https://languages.hesperian.org/pages/en/pdf.html",
    label: "Visit Hesperian's English resources",
  },
  {
    title: "Wes Cecil's lecture archive",
    copy: "Selected Wes Cecil lecture series live on the creator's private field drive. His official site is the right starting point for listening to or acquiring the material yourself.",
    href: "https://www.wescecil.com/",
    label: "Visit Wes Cecil's official archive",
  },
  {
    title: "USDA home-canning guides",
    copy: "The National Center for Home Food Preservation maintains the USDA Complete Guide to Home Canning and its individual sections from an authoritative source.",
    href: "https://nchfp.uga.edu/resources/category/usda-guide",
    label: "Open the official canning guide",
  },
  {
    title: "Seed Savers Exchange",
    copy: "Seed-saving technique and growing knowledge are natural companions to an offline encyclopedia. Begin with the organization's own learning collection.",
    href: "https://seedsavers.org/learn/seed-saving/",
    label: "Explore seed-saving resources",
  },
];

export default function BuildBeyondPage() {
  return (
    <>
      <SiteHeader />
      <main className="inner-page beyond-page">
        <section className="inner-hero beyond-hero">
          <div>
            <p className="wayfinding">Past the public edition</p>
            <h1>Build beyond the archive.</h1>
            <p>The public drive is a foundation, not a locked box. Add the books, lectures, maps, records, and practical knowledge that matter to your own road.</p>
          </div>
          <aside><span>The boundary</span><strong>You acquire the material. The drive helps you keep it.</strong><p>Wayfarer&apos;s Archive supplies the structure and compatible readers, but does not redistribute the third-party works described here.</p></aside>
        </section>

        <section className="content-ledger extension-path">
          <div className="ledger-heading"><p className="wayfinding">A personal annex</p><h2>Three steps, entirely under your control.</h2></div>
          <div className="requirement-grid">
            <article><span>01</span><h3>Obtain it from the source</h3><p>Download, purchase, scan, or create material through a route available to you. Keep the receipt, license, or source page beside anything whose origin may matter later.</p></article>
            <article><span>02</span><h3>Place it in the annex</h3><p>Use the drive&apos;s Personal Library folders rather than altering the sealed Wikipedia edition. Organize by subject, creator, or expedition—whatever you will remember offline.</p></article>
            <article><span>03</span><h3>Record what you carried</h3><p>Add a plain-language catalog entry with title, creator, source, date acquired, and any use restrictions. Then verify the drive and keep a second copy of irreplaceable personal records.</p></article>
          </div>
        </section>

        <section className="reader-kit" id="reader-kit">
          <div><p className="wayfinding">Readers carried with the vessel</p><h2>The tools should already be there.</h2><p>Edition I is being designed to carry redistributable, portable readers and their required dependencies so common personal-library formats remain useful without installing software on the host computer.</p></div>
          <div className="format-grid">
            {formats.map(([format, copy]) => <article key={format}><h3>{format}</h3><p>{copy}</p></article>)}
          </div>
        </section>

        <section className="field-shelf" id="field-shelf">
          <div className="shelf-heading">
            <p className="wayfinding">The creator&apos;s field shelf</p>
            <h2>What I keep—or would seek—for my own drive.</h2>
            <p>These are personal recommendations and source links, not files included with the public edition. Linking to a work does not grant permission to copy or redistribute it. Read the source&apos;s current terms and keep privately acquired material in your own annex.</p>
          </div>
          <div className="shelf-grid">
            {shelf.map((item) => (
              <article key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
                <a href={item.href} target="_blank" rel="noreferrer">{item.label} <span aria-hidden="true">↗</span></a>
              </article>
            ))}
          </div>
        </section>

        <section className="annex-boundary">
          <p className="wayfinding">Keep the editions distinct</p>
          <h2>The public archive stays clean. Your annex stays yours.</h2>
          <p>Wayfarer&apos;s Archive can document a useful path without hosting copyrighted books or recordings. Public releases contain only approved redistributable material; personal additions remain outside the public manifest and are never uploaded by the builder.</p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
