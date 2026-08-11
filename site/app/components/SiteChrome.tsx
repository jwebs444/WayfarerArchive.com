/* eslint-disable @next/next/no-html-link-for-pages */

export function SiteHeader() {
  return (
    <header className="gatehouse">
      <a className="seal" href="/" aria-label="Wayfarer's Archive home">
        <span className="seal-mark" aria-hidden="true"><span>WA</span></span>
        <span><strong>Wayfarer&apos;s Archive</strong><small>Knowledge kept beyond the signal</small></span>
      </a>
      <nav aria-label="Primary navigation">
        <a href="/build">Build a copy</a>
        <a href="/build-beyond">Build beyond</a>
        <a href="/founding-batch">Founding batch</a>
        <a href="/creator">The Creator</a>
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
