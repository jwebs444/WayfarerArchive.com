import { SiteFooter, SiteHeader } from "./components/SiteChrome";

const questions = [
  ["Must I buy a finished drive?", "No. The builder remains free. The workshop edition is simply for travelers who want a prepared, labeled, and individually tested copy."],
  ["What will the first edition contain?", "Current English Wikipedia in Kiwix, portable readers for the major desktop systems, rights-cleared media, launchers, attribution records, and verification tools."],
  ["Why is the founding batch not open yet?", "The pilot must reveal the true build time, media failure rate, packaging cost, and defensible shipping window before any money changes hands."],
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="top">
        <section className="sanctuary" aria-labelledby="hero-title">
          <div className="approach">
            <h1 id="hero-title">A refuge for knowledge</h1>
            <p className="hero-copy">Carry a working encyclopedia through dead zones, broken infrastructure, and the ordinary places the network does not reach. Make the archive freely—or receive one prepared in a small workshop batch.</p>
          </div>
          <div className="hero-actions">
            <a className="stone-button sun-button" href="/build">Enter with an empty drive</a>
            <a className="quiet-link" href="/founding-batch">Seek a finished archive <span aria-hidden="true">→</span></a>
          </div>
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
            <p className="card-note">The builder opens when Edition I clears rights, capacity, and launch testing.</p>
          </article>

          <article className="workshop-chamber" id="commission">
            <div className="chamber-mark" aria-hidden="true">II</div>
            <p className="wayfinding">The founder&apos;s workshop</p>
            <h2>Commission a field copy.</h2>
            <p className="chamber-lede">A finished Wayfarer is for someone who wants the refuge without first making the road: assembled, labeled, tested, and accompanied by its edition record.</p>
            <div className="batch-status">
              <span>Founding batch</span>
              <strong>Interest gathering · no payment collected</strong>
            </div>
            <p>We will first build a pilot and measure the work honestly. Only then will a fixed number of places open with a published price and credible departure window.</p>
          </article>
        </section>

        <section className="questions" id="questions" aria-labelledby="questions-title">
          <div className="questions-heading">
            <h2 id="questions-title">Before setting out.</h2>
          </div>
          <div className="question-stack">
            {questions.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}
          </div>
        </section>

        <section className="project-origin" id="project" aria-labelledby="project-title">
          <div>
            <p className="wayfinding">A Mr. Crowmeister project</p>
            <h2 id="project-title">Knowledge for the road beyond the signal.</h2>
          </div>
          <div className="project-note">
            <p>Wayfarer&apos;s Archive is designed and maintained by Mr. Crowmeister as a practical preservation project: a way to carry useful knowledge beyond the reach of the network.</p>
            <div className="project-links">
              <a className="stone-button sun-button" href="/creator">Meet the Creator <span aria-hidden="true">→</span></a>
              <a className="quiet-link light-link" href="https://www.patreon.com/c/MrCrowmeister" target="_blank" rel="noreferrer">Support the work on Patreon <span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
