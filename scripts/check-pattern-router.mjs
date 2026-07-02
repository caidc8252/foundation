#!/usr/bin/env node
/* ---------------------------------------------------------------------------
   Foundation pattern router check

   Ensures patterns/router.json stays aligned with release/catalog.json, pattern
   examples, and composites/schema.json.
   --------------------------------------------------------------------------- */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalogPath = join(root, "release", "catalog.json");
const routerPath = join(root, "patterns", "router.json");

const failSetup = (message) => {
  console.error(`✗ ${message}`);
  process.exit(2);
};

if (!existsSync(catalogPath)) failSetup("release/catalog.json missing — run `pnpm build` first.");
if (!existsSync(routerPath)) failSetup("patterns/router.json missing.");

const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
const router = JSON.parse(readFileSync(routerPath, "utf8"));

const catalogPatterns = new Set(catalog.patterns.map((item) => item.name));
const catalogPatternContracts = new Map(catalog.patterns.map((item) => [item.name, item.contract]));
const compositeNames = new Set(catalog.composites.map((item) => item.name));
const routes = router.routes ?? {};

let failures = 0;
const report = (message) => {
  console.log(`  ✗ ${message}`);
  failures++;
};

const requireArray = (routeId, entry, field) => {
  if (!Array.isArray(entry[field])) report(`${routeId}: ${field} must be an array`);
};

console.log("● patterns/router.json");

if (router.version !== 1) report("version must be 1");
if (!router.routes || typeof router.routes !== "object" || Array.isArray(router.routes)) {
  report("routes must be an object keyed by route id");
}
if (!Array.isArray(router.decisionOrder)) report("decisionOrder must be an array");
if (!Array.isArray(router.aiFlow)) report("aiFlow must be an array");

for (const patternName of catalogPatterns) {
  if (!Object.values(routes).some((entry) => entry.pattern === patternName)) {
    report(`no route points to catalog pattern: ${patternName}`);
  }
}

for (const [routeId, entry] of Object.entries(routes)) {
  if (!entry.pattern || !catalogPatterns.has(entry.pattern)) {
    report(`${routeId}: unknown catalog pattern ${entry.pattern}`);
    continue;
  }

  if (!entry.builderPattern || typeof entry.builderPattern !== "string") {
    report(`${routeId}: builderPattern is required`);
  } else if (!existsSync(join(root, "patterns", `${entry.builderPattern}.html`))) {
    report(`${routeId}: builderPattern example not found: patterns/${entry.builderPattern}.html`);
  }

  const expectedContract = catalogPatternContracts.get(entry.pattern);
  if (entry.contract !== expectedContract) {
    report(`${routeId}: contract must be ${expectedContract}`);
  }
  if (!existsSync(join(root, entry.contract ?? ""))) report(`${routeId}: contract file not found: ${entry.contract}`);

  if (entry.example && !existsSync(join(root, entry.example))) {
    report(`${routeId}: example file not found: ${entry.example}`);
  }

  for (const field of ["chooseWhen", "avoidWhen", "keywords", "exampleRequests", "outputNameHints", "composites", "clarifyIf"]) {
    requireArray(routeId, entry, field);
  }

  for (const field of ["intent", "defaultTitle"]) {
    if (!entry[field] || typeof entry[field] !== "string") report(`${routeId}: ${field} is required`);
  }

  // Each composite the route claims must (a) be a real catalog composite and
  // (b) actually be documented in the pattern's own contract — otherwise the
  // router drifts from the contract (lists a composite the pattern never uses,
  // or the contract is an incomplete stub). The contract is the source of truth.
  let contractText = "";
  if (entry.contract && existsSync(join(root, entry.contract))) {
    contractText = readFileSync(join(root, entry.contract), "utf8");
  }
  for (const compositeName of entry.composites ?? []) {
    if (!compositeNames.has(compositeName)) {
      report(`${routeId}: unknown composite ${compositeName}`);
      continue;
    }
    const mentioned =
      contractText.includes(`composites/${compositeName}.md`) ||
      new RegExp(`\\b${compositeName.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`).test(contractText);
    if (!mentioned) {
      report(`${routeId}: composite "${compositeName}" is in route.composites but not documented in ${entry.contract}`);
    }
  }
}

const routeCount = Object.keys(routes).length;
if (failures) {
  console.log(`  → FAIL (${failures} issue${failures === 1 ? "" : "s"})`);
  process.exit(1);
}

console.log(`  routes: ${routeCount} entries · all aligned with catalog/examples`);
console.log("  → PASS");
