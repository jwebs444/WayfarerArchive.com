import FoundingBatchAction from "./components/FoundingBatchAction";

const archiveFacts = [
  ["125 GB", "target drive"],
  ["3 systems", "Windows, macOS, Linux"],
  ["7.6M", "media records reviewed"],
  ["$0", "builder license"],
];

const principles = [
  ["01", "Useful without a signal", "Once built, the archive opens locally. No login, activation server, subscription, or network connection is required."],
  ["02", "Open to inspection", "The build recipe, source manifest, media-rights decisions, reader notices, and integrity checks travel with every edition."],
  ["03", "Made at a human pace", "Physical editions will be assembled in disclosed batches, tested individually, and offered only when a credible ship window exists."],
];

const buildSteps = [
  ["Prepare", "Insert an empty 125 GB or larger drive. The builder checks the exact destination and available capacity before writing."],
  ["Gather", "Current Wikipedia and portable Kiwix readers download one verified component at a time without exceeding the drive during assembly."],
  ["Verify", "The finished archive is accepted only after its manifest, launchers, reader packages, and encyclopedia file pass integrity checks."],
];

const faqs = [
  ["Do I have to buy a drive?", "No. The one-click builder and its build records will remain freely available. A physical edition is a convenience for people who would rather receive a tested, ready-to-open device."],
  ["Why not take preorders immediately?", "A preservation project should not begin by making promises it cannot measure. The pilot establishes material cost, build time, failure rate, packaging, and a realistic shipping window before payment opens."],
  ["What is included?", "The current plan is English Wikipedia in Kiwix, cross-platform portable readers, launchers, offline attribution records, open-source notices, and verification tools."],
  ["Can the archive be updated?", "Yes. Editions are versioned rather than silently replaced. Future builders will be able to create a current drive while older verified releases remain documented."],
];

export default function Home() {
  return (
    <>
      <header className="masthead">
        <a className="wordmark" href="#top" aria-label="Wayfarer's Archive home">
          <span className="archive-mark" aria-hidden="true"><i /><i /><i /></span>
          <span><strong>Wayfarer&apos;s Archive</strong><small>A library for the road beyond the signal</small></span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#builder">Build one</a>
          <a href="#workshop">Finished drives</a>
          <a href="#method">The method</a>
          <a href="#questions">Questions</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Offline Wikipedia · independently verifiable</p>
            <h1>Carry the reference shelf <em>beyond the reach of the network.</em></h1>
            <p className="lede">Wayfarer&apos;s Archive turns an ordinary thumb drive into a current, cross-platform offline encyclopedia. Build one yourself for free, or join a small workshop batch for a finished and tested edition.</p>
            <div className="actions">
              <a className="button button-dark" href="#builder">Build your own</a>
              <a className="button button-light" href="#workshop">See the physical edition</a>
            </div>
            <div className="release-line"><span>Edition 1.0</span><p>Rights review and production testing are underway. No orders are being charged yet.</p></div>
          </div>

          <aside className="field-card" aria-label="Wayfarer's Archive field edition preview">
            <div className="dune-sky"><span className="sun" /><span className="dune dune-far" /><span className="dune dune-near" /></div>
            <div className="field-card-copy">
              <p className="folio">Field edition / volume 01</p>
              <div className="drive-figure" aria-hidden="true"><span /><b>WA</b></div>
              <h2>A working library in your pocket.</h2>
              <dl>
                <div><dt>Reader</dt><dd>Kiwix</dd></div>
                <div><dt>Connection</dt><dd>Not required</dd></div>
                <div><dt>Edition state</dt><dd>In review</dd></div>
              </dl>
            </div>
          </aside>
        </section>

        <section className="fact-strip" aria-label="Archive facts">
          {archiveFacts.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
        </section>

        <section className="two-paths section" aria-labelledby="two-paths-title">
          <div className="section-heading">
            <p className="eyebrow">Two paths, one archive</p>
            <h2 id="two-paths-title">Knowledge is the product. The device is optional.</h2>
          </div>
          <div className="path-grid">
            <article className="path-card path-open" id="builder">
              <p className="card-number">Path 01 / open builder</p>
              <h3>Make your own Wayfarer.</h3>
              <p>Bring a suitable drive and let the builder assemble the same public edition offered by the workshop. It downloads sequentially, verifies every component, and never needs a second drive-sized temporary copy.</p>
              <ul><li>Free and open build recipe</li><li>Capacity-safe, restartable assembly</li><li>SHA-256 verification before acceptance</li><li>Windows builder first; other systems documented</li></ul>
              <span className="button button-disabled" aria-disabled="true">Installer arriving with Edition 1.0</span>
              <small>Release candidate is being rights-audited now.</small>
            </article>

            <article className="path-card path-workshop" id="workshop">
              <p className="card-number">Path 02 / workshop edition</p>
              <div className="availability"><span>Founding batch</span><b>Interest stage</b></div>
              <h3>Receive one built, labeled, and tested.</h3>
              <p>For readers who want the archive without the long download, the workshop edition will arrive ready to open, with an edition card and a recorded final verification.</p>
              <dl className="product-specs"><div><dt>Capacity</dt><dd>125 GB class</dd></div><div><dt>Fulfillment</dt><dd>Capped batches</dd></div><div><dt>Price</dt><dd>After pilot costing</dd></div><div><dt>Payment</dt><dd>Not yet collected</dd></div></dl>
              <FoundingBatchAction />
              <a className="text-link" href="#batch-plan">How the founding batch works</a>
            </article>
          </div>
        </section>

        <section className="batch section" id="batch-plan" aria-labelledby="batch-title">
          <div className="batch-intro">
            <p className="eyebrow">A deliberate first production run</p>
            <h2 id="batch-title">Interest first. A firm batch second. Payment only when the promise is credible.</h2>
            <p>We are not opening an indefinite preorder queue. The pilot run will measure hands-on assembly time, media reliability, packaging cost, and failure allowance. A fixed number of invitations will then open for a clearly dated production window.</p>
          </div>
          <ol className="batch-steps">
            <li><span>Now</span><div><strong>Complete the public release</strong><p>Finish the rights audit, capacity test, cross-platform launch test, and physical pilot.</p></div></li>
            <li><span>Next</span><div><strong>Publish price and ship window</strong><p>Show what the drive costs, what is included, how many slots exist, and when the batch is expected to leave the workshop.</p></div></li>
            <li><span>Then</span><div><strong>Invite the founding batch</strong><p>Open only the number of paid orders the workshop can comfortably build and support.</p></div></li>
          </ol>
          <div className="batch-note"><strong>Why this model?</strong><p>It keeps production small enough to verify every device and avoids holding customer money while the project is still learning its real fulfillment capacity.</p></div>
          <div className="batch-action">
            <div><strong>Founding campaign</strong><p>Follow the pilot now. When price, capacity, and the ship window are proven, this becomes the entrance to the capped founding batch.</p></div>
            <FoundingBatchAction />
          </div>
        </section>

        <section className="method section" id="method" aria-labelledby="method-title">
          <div className="section-heading method-heading">
            <p className="eyebrow">The preservation compact</p>
            <h2 id="method-title">A library should tell you where it came from—and whether it still works.</h2>
          </div>
          <div className="principle-grid">
            {principles.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}
          </div>
          <div className="build-sequence">
            <div><p className="eyebrow">One-click does not mean opaque</p><h3>The builder&apos;s three promises</h3></div>
            <ol>{buildSteps.map(([title, copy], index) => <li key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{title}</strong><p>{copy}</p></div></li>)}</ol>
          </div>
        </section>

        <section className="questions section" id="questions" aria-labelledby="questions-title">
          <div className="section-heading">
            <p className="eyebrow">Field questions</p>
            <h2 id="questions-title">Before you set out.</h2>
          </div>
          <div className="faq-list">{faqs.map(([question, answer]) => <details key={question}><summary>{question}</summary><p>{answer}</p></details>)}</div>
        </section>

        <section className="closing section">
          <p className="eyebrow">Edition 1.0 is being assembled in public</p>
          <h2>Keep a map. Keep a manual. Keep the encyclopedia.</h2>
          <p>The first release opens when its content, reader, installer, and physical workflow are all ready to make the same promise.</p>
          <div className="actions"><a className="button button-dark" href="#builder">Follow the build path</a><a className="button button-light" href="#workshop">Review the workshop plan</a></div>
        </section>
      </main>

      <footer>
        <a className="footer-mark" href="#top">Wayfarer&apos;s Archive</a>
        <p>Offline knowledge, carried carefully.</p>
        <p>Edition 1.0 · August 2026</p>
      </footer>
    </>
  );
}
