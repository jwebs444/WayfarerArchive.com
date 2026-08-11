import FoundingBatchAction from "./components/FoundingBatchAction";

const vows = [
  ["Useful in silence", "Once assembled, the archive asks for no signal, account, activation, or subscription."],
  ["Honest about its making", "Sources, licenses, exclusions, versions, and integrity records travel with the knowledge."],
  ["Built at a human pace", "Workshop copies are prepared in small disclosed batches and tested before they leave shelter."],
];

const questions = [
  ["Must I buy a finished drive?", "No. The builder remains free. The workshop edition is simply for travelers who want a prepared, labeled, and individually tested copy."],
  ["What will the first edition contain?", "Current English Wikipedia in Kiwix, portable readers for the major desktop systems, rights-cleared media, launchers, attribution records, and verification tools."],
  ["Why is the founding batch not open yet?", "The pilot must reveal the true build time, media failure rate, packaging cost, and defensible shipping window before any money changes hands."],
  ["Will it survive future updates?", "Editions are dated and preserved rather than silently overwritten. A later builder may create a newer archive without making the older record disappear."],
];

export default function Home() {
  return (
    <>
      <header className="gatehouse">
        <a className="seal" href="#top" aria-label="Wayfarer's Archive home">
          <span className="seal-mark" aria-hidden="true">WA</span>
          <span><strong>Wayfarer&apos;s Archive</strong><small>Knowledge kept beyond the signal</small></span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#threshold">The threshold</a>
          <a href="#make">Build a copy</a>
          <a href="#commission">Founding batch</a>
        </nav>
      </header>

      <main id="top">
        <section className="sanctuary" aria-labelledby="hero-title">
          <div className="approach">
            <p className="wayfinding">Wayfarer&apos;s Archive · Field Edition I</p>
            <h1 id="hero-title">A refuge for knowledge <em>at the edge of the signal.</em></h1>
            <p className="hero-copy">Carry a working encyclopedia through dead zones, broken infrastructure, and the ordinary places the network does not reach. Make the archive freely—or receive one prepared in a small workshop batch.</p>
            <div className="hero-actions">
              <a className="stone-button sun-button" href="#make">Enter with an empty drive</a>
              <a className="quiet-link" href="#commission">Seek a finished archive <span aria-hidden="true">↓</span></a>
            </div>
          </div>
          <aside className="threshold-plaque" aria-label="Archive edition details">
            <p>Within the shelter</p>
            <strong>Wikipedia · Kiwix · edition records</strong>
            <span>125 GB class · Windows / macOS / Linux · no signal required</span>
          </aside>
        </section>

        <section className="threshold" id="threshold">
          <div className="threshold-copy">
            <p className="wayfinding">Between exposure and shelter</p>
            <h2>The archive is not a monument. It is a place to take cover.</h2>
          </div>
          <p className="threshold-note">The desert is not decoration here. It is the condition that gives the library meaning: distance, scarcity, interrupted routes, and the need to carry what matters. The stone represents the opposite—shade, patience, memory, and a structure made to remain.</p>
          <figure className="threshold-photo">
            <div role="img" aria-label="The illuminated archive shelves seen through the shelter entrance" />
            <figcaption>Past the wind line, the reference room remains ready.</figcaption>
          </figure>
        </section>

        <section className="chambers" aria-label="Ways to obtain the archive">
          <article className="open-chamber" id="make">
            <div className="chamber-mark" aria-hidden="true">I</div>
            <p className="wayfinding">The open passage</p>
            <h2>Make the same archive yourself.</h2>
            <p className="chamber-lede">Bring an empty drive. The builder gathers one verified component at a time, checks it, places it directly on the destination, and leaves no second archive-sized copy behind.</p>
            <ol className="trail">
              <li><span>Choose the vessel</span><p>An empty 125 GB or larger drive is checked before anything is written.</p></li>
              <li><span>Gather the library</span><p>Wikipedia, portable readers, records, and rights-cleared media arrive in restartable stages.</p></li>
              <li><span>Seal the edition</span><p>The finished drive is accepted only after its manifest and critical files pass verification.</p></li>
            </ol>
            <span className="stone-button disabled-stone" aria-disabled="true">Builder opens with Edition I</span>
            <small>The release candidate is still undergoing rights and capacity review.</small>
          </article>

          <article className="workshop-chamber" id="commission">
            <div className="chamber-mark" aria-hidden="true">II</div>
            <p className="wayfinding">The keeper&apos;s workshop</p>
            <h2>Commission a field copy.</h2>
            <p className="chamber-lede">A finished Wayfarer is for someone who wants the refuge without first making the road: assembled, labeled, tested, and accompanied by its edition record.</p>
            <div className="batch-status">
              <span>Founding batch</span>
              <strong>Interest gathering · no payment collected</strong>
            </div>
            <p>We will first build a pilot and measure the work honestly. Only then will a fixed number of places open with a published price and credible departure window.</p>
            <FoundingBatchAction />
            <a className="quiet-link light-link" href="#founding-route">Read the founding route <span aria-hidden="true">↓</span></a>
          </article>
        </section>

        <section className="founding-route" id="founding-route">
          <div className="route-heading">
            <p className="wayfinding">The route before commerce</p>
            <h2>No caravan leaves on a promise alone.</h2>
            <p>We will not disguise uncertainty as scarcity. The first paid batch opens only after the physical process has been walked from end to end.</p>
          </div>
          <div className="cairn-route">
            <article><span aria-hidden="true" /><p className="route-state">Now</p><h3>Prove the edition</h3><p>Finish the rights audit, drive-capacity test, cross-platform launch test, and physical pilot.</p></article>
            <article><span aria-hidden="true" /><p className="route-state">At the next marker</p><h3>Name the true cost</h3><p>Publish the device, labor, packaging, replacement reserve, batch size, and shipping window.</p></article>
            <article><span aria-hidden="true" /><p className="route-state">When the path is known</p><h3>Open the gate briefly</h3><p>Invite only the number of founders the workshop can comfortably build and support.</p></article>
          </div>
          <div className="founding-call">
            <p><strong>The founding list is a signal, not an order.</strong> Following the campaign will not reserve a drive or authorize a charge.</p>
            <FoundingBatchAction />
          </div>
        </section>

        <section className="compact" aria-labelledby="compact-title">
          <div className="compact-title">
            <p className="wayfinding">Carved into every edition</p>
            <h2 id="compact-title">Three vows of the archive.</h2>
          </div>
          <div className="vow-wall">
            {vows.map(([title, copy], index) => (
              <article key={title}><span aria-hidden="true">{["◒", "◇", "⌁"][index]}</span><h3>{title}</h3><p>{copy}</p></article>
            ))}
          </div>
        </section>

        <section className="questions" aria-labelledby="questions-title">
          <div className="questions-heading">
            <p className="wayfinding">Questions carried to the door</p>
            <h2 id="questions-title">Before setting out.</h2>
          </div>
          <div className="question-stack">
            {questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}
          </div>
        </section>

        <section className="last-light">
          <p className="wayfinding">Edition I is being assembled in public</p>
          <h2>Keep a map. Keep a manual. Keep the encyclopedia.</h2>
          <p>Build it freely when the edition is sealed, or follow the measured path toward a workshop-made copy.</p>
          <div className="hero-actions"><a className="stone-button sun-button" href="#make">Follow the open passage</a><a className="quiet-link light-link" href="#commission">Visit the workshop</a></div>
        </section>
      </main>

      <footer>
        <div className="footer-seal"><span>WA</span><strong>Wayfarer&apos;s Archive</strong></div>
        <p>Offline knowledge, carried carefully.</p>
        <p>Field Edition I · August 2026</p>
      </footer>
    </>
  );
}
