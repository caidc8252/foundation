#!/usr/bin/env node
/* ---------------------------------------------------------------------------
   Foundation · artifact copy-hygiene check

   Catches spec-internal traceability markers that leaked into USER-VISIBLE copy
   — the class of defect check-artifact (legality) and check-anatomy (presence)
   are both blind to. R-n / P-n / SM-n / TASK-* / 〔…〕 / 源自: / TBD(coding) are
   audit anchors; they belong in HTML comments, never on screen.

   Method (deterministic, regex): strip HTML comments and <style> bodies, then
   scan what remains — markup text, attribute values (title/aria-label/
   placeholder/alt), and inline <script> string literals (which reach the screen
   via notify()/textContent). Comments are stripped first, so anchors kept in
   comments (the sanctioned place) are correctly ignored.

   Exit: 0 clean · 1 leaks found · 2 setup error.

   Usage:  node scripts/check-copy.mjs <file.html> [more.html …]
   --------------------------------------------------------------------------- */
import { readFileSync, existsSync } from "node:fs";

const PATTERNS = [
  [/\b[RP]-\d+\b/g, "rule/process id (R-n / P-n)"],
  [/\bSM-\d+\b/g, "state-machine id (SM-n)"],
  [/\bTASK-[A-Za-z0-9-]+\b/g, "task id (TASK-*)"],
  [/〔[^〕]*〕/g, "spec bracket 〔…〕"],
  [/源自\s*[:：]/g, "源自: marker"],
  [/TBD\(coding\)/g, "TBD(coding) placeholder"],
];

const files = process.argv.slice(2).filter((a) => !a.startsWith("-"));
if (files.length === 0) {
  console.error("usage: node scripts/check-copy.mjs <file.html> […]");
  process.exit(2);
}

let hardFail = false;

for (const file of files) {
  if (!existsSync(file)) {
    console.error(`✗ ${file}: not found`);
    hardFail = true;
    continue;
  }
  let html = readFileSync(file, "utf8");
  // Strip comments (the sanctioned home for anchors) and <style> bodies first.
  html = html.replace(/<!--[\s\S]*?-->/g, "");
  html = html.replace(/<style[\s\S]*?<\/style>/gi, "");

  const hits = new Map(); // label → Set(samples)
  for (const [re, label] of PATTERNS) {
    for (const m of html.matchAll(re)) {
      if (!hits.has(label)) hits.set(label, new Set());
      hits.get(label).add(m[0]);
    }
  }

  if (hits.size === 0) {
    console.log(`✓ ${file}: copy clean`);
  } else {
    console.log(`${file}:`);
    for (const [label, samples] of hits) {
      const list = [...samples].slice(0, 8).join(", ");
      console.log(`  ✗ ${label} in user-visible copy: ${list}`);
    }
    console.log(`  → move to HTML comments; anchors are traceability, not UI text`);
    hardFail = true;
  }
}

process.exit(hardFail ? 1 : 0);
