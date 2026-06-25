#!/usr/bin/env node
/* ---------------------------------------------------------------------------
   Foundation artifact builder

   Builds a shipped, self-contained HTML artifact from a copyable pattern
   example. The pattern examples keep the production app-frame as context; this
   builder ports only the page inside .app-frame__main, wraps it in the frameless
   width-lock shell required by AGENTS.md, inlines the three foundation CSS
   layers, then runs the strict artifact checker.

   Usage:
     node scripts/build-artifact.mjs --pattern list-page --out artifacts/list.html
     node scripts/build-artifact.mjs --list
   --------------------------------------------------------------------------- */
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const patternsDir = join(root, "patterns");

const usage = () => {
  console.error(`usage:
  node scripts/build-artifact.mjs --pattern <name> --out <file.html> [--title <title>] [--no-check]
  node scripts/build-artifact.mjs --list`);
};

const args = process.argv.slice(2);
let patternName = "";
let outPath = "";
let titleOverride = "";
let check = true;
let list = false;

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === "--") {
    continue;
  } else if (arg === "--pattern") {
    patternName = args[++i] ?? "";
  } else if (arg === "--out") {
    outPath = args[++i] ?? "";
  } else if (arg === "--title") {
    titleOverride = args[++i] ?? "";
  } else if (arg === "--no-check") {
    check = false;
  } else if (arg === "--list") {
    list = true;
  } else if (arg === "--help" || arg === "-h") {
    usage();
    process.exit(0);
  } else {
    console.error(`unknown option: ${arg}`);
    usage();
    process.exit(2);
  }
}

const patternExamples = () =>
  readdirSync(patternsDir)
    .filter((file) => file.endsWith(".html") && file !== "index.html")
    .map((file) => file.slice(0, -".html".length))
    .sort();

if (list) {
  console.log(patternExamples().join("\n"));
  process.exit(0);
}

if (!patternName || !outPath) {
  usage();
  process.exit(2);
}

const examples = new Set(patternExamples());
if (!examples.has(patternName)) {
  console.error(`unknown pattern example: ${patternName}`);
  console.error(`available: ${[...examples].join(", ")}`);
  process.exit(2);
}

const patternPath = join(patternsDir, `${patternName}.html`);
const patternHtml = readFileSync(patternPath, "utf8");

const titleMatch = patternHtml.match(/<title>([\s\S]*?)<\/title>/i);
const title = titleOverride || titleMatch?.[1]?.trim() || `Artifact - ${patternName}`;

const pageMatch = patternHtml.match(/<main\b[^>]*class=(["'])app-frame__main\1[^>]*>([\s\S]*?)<\/main\s*>/i);
if (!pageMatch) {
  console.error(`pattern example does not contain .app-frame__main: ${relative(root, patternPath)}`);
  process.exit(2);
}

const pageHtml = pageMatch[2].trim();
const htmlWithoutComments = patternHtml.replace(/<!--[\s\S]*?-->/g, "");
const pageLocalCss = [...htmlWithoutComments.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi)]
  .map((match) => match[1].trim())
  .filter(Boolean)
  .join("\n\n");

const readLayer = (path) => readFileSync(join(root, path), "utf8");
const tokens = readLayer("dist/tokens.inline.css");
const primitives = readLayer("primitives/primitives.css");
const composites = readLayer("composites/composites.css");

const artifactCss = `
/* 1/4 dist/tokens.inline.css */
${tokens}

/* 2/4 primitives/primitives.css */
${primitives}

/* 3/4 composites/composites.css */
${composites}

/* 4/4 artifact shell + page-local composition */
html {
  background-color: var(--color-surface-1);
}

body {
  margin: 0;
  background-color: var(--color-surface-1);
  color: var(--color-content-primary);
  font-family: var(--font-sans);
}

[hidden] {
  display: none !important;
}

.artifact-shell {
  max-width: 1672px;
  margin-inline: auto;
  min-height: 100vh;
  background-color: var(--color-surface-1);
}

${pageLocalCss}
`.trim();

const output = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <style>
${artifactCss}
  </style>
</head>
<body>
  <div class="artifact-shell">
${pageHtml.split("\n").map((line) => `    ${line}`).join("\n")}
  </div>
</body>
</html>
`;

const absoluteOut = resolve(root, outPath);
mkdirSync(dirname(absoluteOut), { recursive: true });
writeFileSync(absoluteOut, output, "utf8");

const displayOut = relative(root, absoluteOut);
console.log(`wrote ${displayOut} from patterns/${patternName}.html`);

if (check) {
  const result = spawnSync(process.execPath, [join(root, "scripts", "check-artifact.mjs"), "--strict", absoluteOut], {
    cwd: root,
    stdio: "inherit",
  });
  process.exit(result.status ?? 1);
}
