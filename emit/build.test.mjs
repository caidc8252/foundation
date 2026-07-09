import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { emitInlineCss, emitTokensJson } from "./build.mjs";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

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

test("typography exports closed weight and line-height token sets", () => {
  const { light } = emitTokensJson(repoRoot);

  assert.deepEqual(
    Object.fromEntries(
      Object.entries(light)
        .filter(([name]) => name.startsWith("font-weight-"))
        .sort(),
    ),
    {
      "font-weight-bold": "700",
      "font-weight-medium": "500",
      "font-weight-normal": "400",
      "font-weight-semibold": "600",
    },
  );
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(light)
        .filter(([name]) => name.startsWith("line-height-"))
        .sort(),
    ),
    {
      "line-height-compact": "1.4",
      "line-height-none": "1",
      "line-height-normal": "1.5",
      "line-height-relaxed": "1.6",
      "line-height-snug": "1.3",
      "line-height-tight": "1.1",
    },
  );
});
