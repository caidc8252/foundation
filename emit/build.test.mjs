import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { emitCatalog, emitInlineCss, emitTokensJson } from "./build.mjs";

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

test("governed composite and docs CSS use logical inline properties", () => {
  const checkedFiles = ["composites/composites.css", "emit/docs.mjs"];
  const findings = [];
  const physicalDirectionDecl = /\b(border-right(?:-[\w-]+)?|margin-left|text-align|right)\s*:\s*([^;"'}]+)/g;

  for (const file of checkedFiles) {
    const text = readFileSync(join(repoRoot, file), "utf8")
      .replace(/\/\*[\s\S]*?\*\//g, " ");

    for (const match of text.matchAll(physicalDirectionDecl)) {
      const prop = match[1];
      const value = match[2].trim().replace(/\s+/g, " ");
      if (prop === "margin-left" && value !== "auto") continue;
      if (prop === "text-align" && value !== "left") continue;
      findings.push(`${file}: ${prop}: ${value}`);
    }
  }

  assert.deepEqual(findings, []);
});

test("utility classes are closed-set entries, not components", () => {
  const catalog = emitCatalog(repoRoot);

  const utilityNames = new Set(catalog.utilities.map((item) => item.name));
  const primitiveNames = new Set(catalog.primitives.map((item) => item.name));
  const compositeNames = new Set(catalog.composites.map((item) => item.name));

  assert.equal(utilityNames.has("screen-reader-only"), true);
  assert.equal(utilityNames.has("stack"), true);
  assert.equal(utilityNames.has("master-detail-grid"), true);
  assert.equal(catalog.classes.includes("sr-only"), true);
  assert.equal(catalog.classes.includes("stack--4"), true);
  assert.equal(primitiveNames.has("sr-only"), false);
  assert.equal(compositeNames.has("stack"), false);

  const publicNames = [
    ...catalog.primitives.map((item) => item.name),
    ...catalog.composites.map((item) => item.name),
    ...catalog.patterns.map((item) => item.name),
  ];
  assert.equal(publicNames.some((name) => utilityNames.has(name)), false);

  for (const utility of catalog.utilities) {
    const css = readFileSync(join(repoRoot, utility.source), "utf8");
    for (const className of utility.classes) {
      assert.match(css, new RegExp(`\\${className}(?![-_\\w])`));
    }
  }
});
