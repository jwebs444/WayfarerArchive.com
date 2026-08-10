const holdings = [
  ["6.89M", "Wikipedia articles"],
  ["313", "rights-verified images"],
  ["7,063", "public-edition files"],
  ["37", "restartable packages"],
];

const principles = [
  ["Works without permission", "No account, activation server, subscription, or network connection is required after the drive is built."],
  ["Built for verification", "Every release bundle and critical archive file is checked with SHA-256 before the builder calls a drive complete."],
  ["Useful before decorative", "The visual cache favors anatomy, repair, agriculture, circuits, machines, safety, and scientific processes."],
];

export default function Home() {
  return (
    <>
      <header className="masthead">
        <a className="wordmark" href="#top" aria-label="Wayfarer's Archive home">
          <span>W</span><div><strong>Wayfarer&apos;s Archive</strong><small>Knowledge kept in reach</small></div>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#archive">The archive</a><a href="#build">Build a drive</a><a href="#open">Open project</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Offline knowledge, made reproducible</p>
            <h1>Keep a working library<br/><em>within reach.</em></h1>
            <p className="lede">A complete offline encyclopedia, portable readers, a rights-verified image cache, and integrity tools - assembled into one redistributable drive that remains useful when the network cannot help.</p>
            <div className="actions">
              <a className="primary" href="/downloads/Create-PreservationDrive.ps1" download>Download Windows builder</a>
              <a className="quiet" href="#build">See how it works</a>
            </div>
            <p className="release-note">Edition 0.7 passed local rights, archive, and SHA-256 verification. Public data packages are staged while production storage is connected.</p>
          </div>
          <aside className="edition-card" aria-label="Current edition facts">
            <div className="card-label">PUBLIC EDITION / 0.7</div>
            <p className="big-number">65</p><p className="unit">GiB of verified material</p>
            <dl><div><dt>Primary reader</dt><dd>XOWA</dd></div><div><dt>Target media</dt><dd>125 GB+</dd></div><div><dt>Rights-cleared images</dt><dd>313</dd></div><div><dt>Integrity result</dt><dd>PASS</dd></div></dl>
          </aside>
        </section>

        <section className="holdings" id="archive" aria-label="Archive holdings">
          {holdings.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
        </section>

        <section className="principles">
          <div className="section-intro"><p className="eyebrow">Design rules</p><h2>Preservation is a practice, not a pile of files.</h2></div>
          <div className="principle-grid">{principles.map(([title, copy], index) => <article key={title}><span>0{index + 1}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
        </section>

        <section className="contents">
          <div><p className="eyebrow">What the drive carries</p><h2>A public library with a documented chain of custody.</h2></div>
          <ul><li>Complete October 2024 English Wikipedia text</li><li>313 commercially reusable diagrams and reference images</li><li>Per-image creator, license, source-page, and hash records</li><li>Portable XOWA readers and Java runtimes</li><li>Launchers for Windows, Linux, and macOS</li><li>Release manifest and whole-archive integrity ledger</li></ul>
        </section>

        <section className="builder" id="build">
          <div className="builder-copy"><p className="eyebrow">Build your own</p><h2>One drive. One manifest. No mystery.</h2><p>The Windows builder reads the signed-off public manifest, downloads one package at a time, checks SHA-256 before extraction, removes each temporary package, and verifies the assembled drive.</p><a className="download" href="/downloads/Create-PreservationDrive.ps1" download>Download the Windows builder</a><small>The builder stays safety-locked until the staged packages are live and independently checked.</small></div>
          <ol><li><span>01</span><div><strong>Insert an empty drive</strong><p>Use a 125 GB or larger drive formatted as exFAT.</p></div></li><li><span>02</span><div><strong>Run the builder</strong><p>Choose the target. Downloads resume without discarding verified chunks.</p></div></li><li><span>03</span><div><strong>Verify and keep</strong><p>The drive is accepted only after package and critical-file checks pass.</p></div></li></ol>
        </section>

        <section className="open-project" id="open"><p className="eyebrow">Redistribution boundary</p><h2>Public means reusable, not merely available.</h2><p>The public edition excludes every book, recording, or image that lacks a verified commercial-redistribution basis. Donations and physical-drive sales do not change that line. Build policy, attribution, source records, and verification tooling remain available for inspection.</p><span className="repo-status">Public payload verified - storage connection pending</span></section>
      </main>

      <footer><span className="seal">W</span><p><strong>Wayfarer&apos;s Archive</strong><br/>A preservation project made to outlast a connection.</p><p>Public edition 0.7 - August 2026</p></footer>
    </>
  );
}
