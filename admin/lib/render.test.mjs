import { test } from "node:test";
import assert from "node:assert/strict";
import { renderComponent } from "./render.mjs";

test("primitive render inlines 3 layers + demo", () => {
  const html = renderComponent("primitive", "button");
  assert.match(html, /--color-primary-700/);      // tokens layer inlined
  assert.match(html, /\.btn\s*\{/);                // primitives layer inlined
  assert.match(html, /class="btn btn--primary"/);  // demo markup
  assert.doesNotMatch(html, /https?:\/\//);        // self-contained
});

test("pattern render uses its example html", () => {
  const html = renderComponent("pattern", "detail-page");
  assert.match(html, /Acme Robotics|detail-header/);
  assert.doesNotMatch(html, /https?:\/\//);        // self-contained
});
