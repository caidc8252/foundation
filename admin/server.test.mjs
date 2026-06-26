import { test } from "node:test";
import assert from "node:assert/strict";
import { createHandler } from "./server.mjs";

function call(method, url) {
  return new Promise((resolve) => {
    const req = { method, url };
    const chunks = []; let status = 0, headers = {};
    const res = {
      writeHead(s, h) { status = s; headers = h || {}; },
      setHeader(k, v) { headers[k] = v; },
      end(body) { resolve({ status, headers, body: body ? String(body) : "" }); },
    };
    createHandler()(req, res);
  });
}
test("health returns ok json", async () => {
  const r = await call("GET", "/api/health");
  assert.equal(r.status, 200);
  assert.deepEqual(JSON.parse(r.body), { ok: true });
});
test("serves index.html at /", async () => {
  const r = await call("GET", "/");
  assert.match(r.body, /Foundation Admin/);
});
test("unknown path 404", async () => {
  const r = await call("GET", "/nope");
  assert.equal(r.status, 404);
});
