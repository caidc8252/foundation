import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { emitInlineCss } from "./build.mjs";

const layers = [
  "palette",
  "surface",
  "typography",
  "elevation",
  "motion",
  "layout",
  "chart",
  "dark",
];

test("emitInlineCss collapses blank lines after stripping CRLF comments", () => {
  const root = mkdtempSync(join(tmpdir(), "foundation-build-"));
  try {
    mkdirSync(join(root, "tokens"), { recursive: true });
    for (const layer of layers) {
      const css = layer === "layout"
        ? "@theme {\r\n  --breakpoint-xs: 480px;\r\n}\r\n\r\n/* removed comment */\r\n:root {\r\n  --space-1: 4px;\r\n}\r\n"
        : "@theme {\r\n  --noop-token: 0;\r\n}\r\n";
      writeFileSync(join(root, "tokens", `${layer}.css`), css, "utf8");
    }

    const inlineCss = emitInlineCss(root);

    assert.doesNotMatch(inlineCss, /\r?\n\r?\n\r?\n:root \{/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
