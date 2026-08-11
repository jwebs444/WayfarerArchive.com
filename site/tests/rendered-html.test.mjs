import assert from "node:assert/strict";
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
  assert.match(html, /<title>Wayfarer(?:'|&#x27;)s Archive<\/title>/i);
  assert.match(html, /A refuge for knowledge/);
  assert.match(html, /href="\/build"/);
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

test("serves detailed build, founding batch, and creator pages", async () => {
  const buildHtml = await (await render("/build")).text();
  assert.match(buildHtml, /Build the refuge yourself/);
  assert.match(buildHtml, /What Edition I carries/);

  const foundingHtml = await (await render("/founding-batch")).text();
  assert.match(foundingHtml, /A finished archive, made at a human pace/);
  assert.match(foundingHtml, /Measure first\. Offer second/);

  const creatorHtml = await (await render("/creator")).text();
  assert.match(creatorHtml, /Mr\. Crowmeister/);
  assert.match(creatorHtml, /Go far\. Bring something back/);
  assert.match(creatorHtml, /Venture[\s\S]*Attend[\s\S]*Play[\s\S]*Return/);
  assert.match(creatorHtml, /https:\/\/mrcrowmeister\.com/);
});
