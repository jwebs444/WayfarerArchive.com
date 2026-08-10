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

test("server-renders the preservation portal", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>Wayfarer(?:'|&#x27;)s Archive<\/title>/i);
  assert.match(html, /Keep a working library/);
  assert.match(html, /Offline knowledge, made reproducible/);
  assert.match(html, /Download Windows builder/);
  assert.match(html, /One drive\. One manifest\. No mystery\./);
  assert.match(html, /313 commercially reusable diagrams/);
  assert.doesNotMatch(html, /practical books|lectures and recordings/i);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});
