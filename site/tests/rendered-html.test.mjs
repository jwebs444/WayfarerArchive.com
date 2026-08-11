import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
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
  assert.match(html, /Carry the reference shelf/);
  assert.match(html, /Build your own/);
  assert.match(html, /Founding batch/);
  assert.match(html, /Founding list opens after the pilot/);
  assert.match(html, /Payment only when the promise is credible/);
  assert.match(html, /Installer arriving with Edition 1\.0/);
  assert.doesNotMatch(html, /XOWA|Public edition 0\.7|313 commercially reusable diagrams/i);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|chatgpt\.site/i);
});
