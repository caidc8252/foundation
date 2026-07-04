#!/usr/bin/env node
/* ---------------------------------------------------------------------------
   Foundation · artifact spec-coverage check

   Verifies a prototype ACCOUNTS FOR every business obligation its module's
   specs define — every rule (R-n), process/operation (P-n), and state-machine
   (SM-n). check-artifact (legality) and check-anatomy (structural presence) are
   both blind to this: a prototype can be legal + structurally complete yet
   silently stub an operation (a real run rendered P-1/P-2 create/edit as toast
   placeholders and no gate caught it).

   It checks PRESENCE + HONEST CLASSIFICATION, not semantic correctness. The
   builder must emit a coverage manifest as an HTML comment:

     <!-- coverage: products#P-1=mutation products#P-4=view product#R-6=enforced
          product#SM-1=view category#P-1=mutation product#R-9=enforced
          product#R-13=access-hidden ... -->

   id = <spec-file-stem>#<ID> (file-scoped, because P-n repeats across files:
   processes/products.md AND processes/category.md both have P-1). disposition
   vocab: mutation | view | enforced | access-* | placeholder:<neighbor-concept>
   | n/a:<reason>. A spec obligation absent from the manifest, or a
   placeholder/n-a with no reason, fails.

   Exit: 0 ok · 1 violations · 2 setup error.

   Usage:  node scripts/check-coverage.mjs <artifact.html> <specModuleDir>
     e.g.  node scripts/check-coverage.mjs A2.html specs/SALES/PRODUCTS
   --------------------------------------------------------------------------- */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, basename } from "node:path";

const [, , artifact, specDir] = process.argv;
if (!artifact || !specDir) {
  console.error("usage: node scripts/check-coverage.mjs <artifact.html> <specModuleDir>");
  process.exit(2);
}
for (const p of [artifact, specDir]) {
  if (!existsSync(p)) { console.error(`✗ not found: ${p}`); process.exit(2); }
}

// Walk specDir/{rules,processes,states} for *.md, extract R-n/P-n/SM-n heading
// ids, file-scoped as "<stem>#<ID>".
const ID_RE = /^#{1,6}\s*((?:R|P|SM)-\d+)\b/;
const obligations = new Set();
const walk = (dir) => {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    if (!name.endsWith(".md")) continue;
    const stem = basename(name, ".md");
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const m = line.match(ID_RE);
      if (m) obligations.add(`${stem}#${m[1]}`);
    }
  }
};
for (const sub of ["rules", "processes", "states"]) walk(join(specDir, sub));

if (obligations.size === 0) {
  console.error(`✗ no R-n/P-n/SM-n obligations found under ${specDir} — wrong dir or spec heading format`);
  process.exit(2);
}

// Read the coverage manifest from the artifact.
const html = readFileSync(artifact, "utf8");
const mm = html.match(/<!--\s*coverage:\s*([\s\S]*?)-->/i);
if (!mm) {
  console.log(`${artifact}:`);
  console.log(`  ✗ no <!-- coverage: … --> manifest (骨架 must declare disposition for every spec obligation)`);
  console.log(`  obligations to cover (${obligations.size}): ${[...obligations].sort().join(", ")}`);
  process.exit(1);
}

const declared = new Map(); // id → disposition
for (const tok of mm[1].split(/\s+/)) {
  if (!tok) continue;
  const eq = tok.indexOf("=");
  if (eq < 0) continue;
  declared.set(tok.slice(0, eq), tok.slice(eq + 1));
}

const VALID = /^(mutation|view|enforced|access-[a-z-]+|placeholder:.+|n\/a:.+)$/;
const findings = [];
for (const id of obligations) {
  if (!declared.has(id)) { findings.push(["✗", `${id}: not in coverage manifest`]); continue; }
  const d = declared.get(id);
  if (!VALID.test(d)) findings.push(["✗", `${id}: disposition "${d}" invalid (need mutation|view|enforced|access-*|placeholder:<neighbor>|n/a:<reason>)`]);
}
for (const id of declared.keys()) {
  if (!obligations.has(id)) findings.push(["⚠", `${id}: declared but not a spec obligation (typo? stale?)`]);
}

if (findings.every(([m]) => m === "⚠")) {
  console.log(`✓ ${artifact}: coverage ok (${obligations.size} obligations all declared)`);
  for (const [m, msg] of findings) console.log(`  ${m} ${msg}`);
  process.exit(0);
}
console.log(`${artifact}:`);
for (const [m, msg] of findings) console.log(`  ${m} ${msg}`);
process.exit(1);
