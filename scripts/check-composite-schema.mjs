#!/usr/bin/env node
/* ---------------------------------------------------------------------------
   Foundation composite schema check

   Ensures composites/schema.json stays aligned with dist/catalog.json:
   - every catalog composite has a schema entry, and no unknown entries exist
   - referenced contracts exist and match the catalog entry
   - referenced classes are in the closed set
   - referenced patterns are known patterns
   --------------------------------------------------------------------------- */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalogPath = join(root, "dist", "catalog.json");
const schemaPath = join(root, "composites", "schema.json");

const failSetup = (message) => {
  console.error(`✗ ${message}`);
  process.exit(2);
};

if (!existsSync(catalogPath)) failSetup("dist/catalog.json missing — run `pnpm build` first.");
if (!existsSync(schemaPath)) failSetup("composites/schema.json missing.");

const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
const schema = JSON.parse(readFileSync(schemaPath, "utf8"));

const catalogComposites = new Map(catalog.composites.map((item) => [item.name, item]));
const catalogPatterns = new Set(catalog.patterns.map((item) => item.name));
const catalogClasses = new Set(catalog.classes);
const schemaComposites = schema.composites ?? {};

let failures = 0;
const report = (message) => {
  console.log(`  ✗ ${message}`);
  failures++;
};

console.log("● composites/schema.json");

if (schema.version !== 1) report("version must be 1");
if (!schema.composites || typeof schema.composites !== "object" || Array.isArray(schema.composites)) {
  report("composites must be an object keyed by composite name");
}

for (const name of catalogComposites.keys()) {
  if (!schemaComposites[name]) report(`missing schema for catalog composite: ${name}`);
}

for (const name of Object.keys(schemaComposites)) {
  const entry = schemaComposites[name];
  const catalogEntry = catalogComposites.get(name);
  if (!catalogEntry) {
    report(`unknown composite schema entry: ${name}`);
    continue;
  }

  if (!entry.intent || typeof entry.intent !== "string") report(`${name}: intent is required`);
  if (entry.contract !== catalogEntry.contract) {
    report(`${name}: contract must be ${catalogEntry.contract}`);
  }
  if (!existsSync(join(root, entry.contract ?? ""))) report(`${name}: contract file not found: ${entry.contract}`);

  for (const field of ["classes", "requiredSlots", "optionalSlots", "variants", "states", "usedByPatterns"]) {
    if (!Array.isArray(entry[field])) report(`${name}: ${field} must be an array`);
  }

  for (const className of entry.classes ?? []) {
    if (!catalogClasses.has(className)) report(`${name}: unknown class ${className}`);
  }

  for (const patternName of entry.usedByPatterns ?? []) {
    if (!catalogPatterns.has(patternName)) report(`${name}: unknown pattern ${patternName}`);
  }

  if (!entry.artifactRecipe || typeof entry.artifactRecipe !== "object" || Array.isArray(entry.artifactRecipe)) {
    report(`${name}: artifactRecipe object is required`);
  } else {
    if (!entry.artifactRecipe.root || typeof entry.artifactRecipe.root !== "string") {
      report(`${name}: artifactRecipe.root is required`);
    }
    if (!Array.isArray(entry.artifactRecipe.notes)) {
      report(`${name}: artifactRecipe.notes must be an array`);
    }
  }
}

const count = Object.keys(schemaComposites).length;
if (failures) {
  console.log(`  → FAIL (${failures} issue${failures === 1 ? "" : "s"})`);
  process.exit(1);
}

console.log(`  composites: ${count} schema entries · all aligned with catalog`);
console.log("  → PASS");
