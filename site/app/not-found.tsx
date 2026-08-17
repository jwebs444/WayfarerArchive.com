import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "./components/SiteChrome";

export const metadata: Metadata = {
  title: "Not Found | Wayfarer's Archive",
  alternates: { canonical: null },
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="inner-page">
        <section className="release-gate">
          <p className="wayfinding">Unmarked passage</p>
          <h1>Nothing is archived at this address.</h1>
          <p>Return to the refuge or choose one of the established routes.</p>
          <Link className="stone-button sun-button" href="/">Return home</Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
