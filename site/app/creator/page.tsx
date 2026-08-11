import type { Metadata } from "next";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";

export const metadata: Metadata = {
  title: "The Creator | Wayfarer's Archive",
  description: "Meet Mr. Crowmeister, the creator and keeper of Wayfarer's Archive.",
};

export default function CreatorPage() {
  return (
    <>
      <SiteHeader />
      <main className="inner-page creator-page">
        <section className="creator-hero">
          <div>
            <p className="wayfinding">The Creator</p>
            <h1>Mr. Crowmeister</h1>
            <p>Go far. Bring something back.</p>
          </div>
          <span className="photo-caption">Field image · Island in the Sky</span>
        </section>

        <section className="creator-story">
          <div><p className="wayfinding">The keeper behind the archive</p><h2>Preservation is another form of returning with evidence.</h2></div>
          <div>
            <p>Mr. Crowmeister is a field-minded maker, photographer, writer, traveler, and collector of useful traces. His broader work follows the things brought back from deserts, roads, storms, strange places, and close observation.</p>
            <p>Wayfarer&apos;s Archive applies that practice to knowledge itself: take something vast and fragile, make it portable, document what it contains, and keep it usable when the ordinary route disappears.</p>
            <div className="creator-links">
              <a className="stone-button sun-button" href="https://mrcrowmeister.com" target="_blank" rel="noreferrer">Visit MrCrowmeister.com <span aria-hidden="true">↗</span></a>
              <a className="quiet-link" href="https://www.patreon.com/c/MrCrowmeister" target="_blank" rel="noreferrer">Support on Patreon <span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </section>

        <section className="creator-principles">
          <article><span>Venture</span><p>Go toward wild, difficult, beautiful, or neglected things.</p></article>
          <article><span>Attend</span><p>Look closely enough to understand what deserves to return with you.</p></article>
          <article><span>Return</span><p>Bring back photographs, language, practical maps—and now an offline library.</p></article>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
