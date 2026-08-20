import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Wayfarer's Archive storefront", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>Wayfarer(?:'|&#x27;)s Archive \| Offline Knowledge Drive Project<\/title>/i);
  assert.match(html, /A refuge for knowledge/);
  assert.match(html, /href="\/build"/);
  assert.match(html, /href="\/build-beyond"/);
  assert.match(html, /href="\/founding-batch"/);
  assert.match(html, /href="\/creator"/);
  assert.match(html, /Make the same archive yourself/);
  assert.match(html, /Founding batch/);
  assert.match(html, /A Mr\. Crowmeister project/);
  assert.match(html, /https:\/\/www\.patreon\.com\/c\/MrCrowmeister/);
  assert.doesNotMatch(html, /Will it survive future updates|Builder opens with Edition I|Founding list opens after the pilot/);
  assert.doesNotMatch(html, /Between exposure and shelter|No caravan leaves on a promise alone|Three vows of the archive/);
  assert.doesNotMatch(html, /XOWA|Public edition 0\.7|313 commercially reusable diagrams/i);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|chatgpt\.site/i);
});

test("publishes distinct canonical search surfaces", async () => {
  const routes = [
    ["/", "Wayfarer's Archive | Offline Knowledge Drive Project"],
    ["/build", "Build an Offline Wikipedia Drive | Wayfarer's Archive"],
    ["/build-beyond", "Personal Offline Library | Wayfarer's Archive"],
    ["/founding-batch", "Founding Batch | Wayfarer's Archive"],
    ["/creator", "Mr. Crowmeister | Creator of Wayfarer's Archive"],
  ];

  for (const [path, title] of routes) {
    const response = await render(path);
    assert.equal(response.status, 200);
    const html = await response.text();
    const canonical = path === "/" ? "https://wayfarerarchive.com" : new URL(path, "https://wayfarerarchive.com").href;
    assert.ok(html.includes(`<title>${title.replaceAll("&", "&amp;").replaceAll("'", "&#x27;")}</title>`));
    assert.ok(html.includes(`<link rel="canonical" href="${canonical}"`));
    assert.ok(html.includes(`<meta property="og:url" content="${canonical}"`));
    assert.match(html, /<meta name="robots" content="index, follow"/);
  }

  const home = await (await render()).text();
  const jsonLdMatch = home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(jsonLdMatch);
  const structuredData = JSON.parse(jsonLdMatch[1]);
  assert.deepEqual(structuredData["@graph"].map((item) => item["@type"]), ["WebSite", "WebPage", "CreativeWork", "Person"]);
  assert.equal(structuredData["@graph"][3].name, "Mr. Crowmeister");
});

test("publishes a truthful crawl contract", async () => {
  const robots = await readFile(new URL("../public/robots.txt", import.meta.url), "utf8");
  assert.match(robots, /User-Agent: \*/i);
  assert.match(robots, /Allow: \//i);
  assert.match(robots, /Sitemap: https:\/\/wayfarerarchive\.com\/sitemap\.xml/i);

  const sitemap = await readFile(new URL("../public/sitemap.xml", import.meta.url), "utf8");
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  assert.deepEqual(urls, [
    "https://wayfarerarchive.com/",
    "https://wayfarerarchive.com/build",
    "https://wayfarerarchive.com/build-beyond",
    "https://wayfarerarchive.com/founding-batch",
    "https://wayfarerarchive.com/creator",
  ]);
});

test("returns noindex for unknown routes", async () => {
  const response = await render("/coordinates-unknown");
  assert.equal(response.status, 404);
  const html = await response.text();
  assert.match(html, /<meta name="robots" content="noindex, nofollow"/);
  assert.doesNotMatch(html, /<link rel="canonical"/);
});

test("serves detailed build, build-beyond, founding batch, and creator pages", async () => {
  const buildHtml = await (await render("/build")).text();
  assert.match(buildHtml, /Build the refuge yourself/);
  assert.match(buildHtml, /What Edition I carries/);

  const beyondHtml = await (await render("/build-beyond")).text();
  assert.match(beyondHtml, /Build beyond the archive/);
  assert.match(beyondHtml, /The creator(?:'|&#x27;)s field shelf/);
  assert.match(beyondHtml, /does not redistribute the third-party works/);
  assert.match(beyondHtml, /https:\/\/www\.wescecil\.com/);

  const foundingHtml = await (await render("/founding-batch")).text();
  assert.match(foundingHtml, /A finished archive, planned at a human pace/);
  assert.match(foundingHtml, /Measure first\. Offer second/);
  assert.match(foundingHtml, /No founding list is open yet/);

  const creatorHtml = await (await render("/creator")).text();
  assert.match(creatorHtml, /Mr\. Crowmeister/);
  assert.match(creatorHtml, /Go far\. Bring something back/);
  assert.match(creatorHtml, /Venture[\s\S]*Attend[\s\S]*Play[\s\S]*Return/);
  assert.match(creatorHtml, /https:\/\/mrcrowmeister\.com/);
});
