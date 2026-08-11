import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="gatehouse">
      <Link className="seal" href="/" aria-label="Wayfarer's Archive home">
        <span className="seal-mark" aria-hidden="true">WA</span>
        <span><strong>Wayfarer&apos;s Archive</strong><small>Knowledge kept beyond the signal</small></span>
      </Link>
      <nav aria-label="Primary navigation">
        <Link href="/build">Build a copy</Link>
        <Link href="/founding-batch">Founding batch</Link>
        <Link href="/creator">The Creator</Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer>
      <div className="footer-seal"><span>WA</span><strong>Wayfarer&apos;s Archive</strong></div>
      <p>Offline knowledge, carried carefully.</p>
      <p>Field Edition I · August 2026</p>
    </footer>
  );
}
