import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
export function readCatalog() {
  return JSON.parse(readFileSync(join(ROOT, "release/catalog.json"), "utf8"));
}
export function listComponents() {
  const c = readCatalog();
  return [...c.primitives, ...c.composites, ...c.patterns].map(e => ({
    layer: e.layer, name: e.name, title: e.title, summary: e.summary,
    contract: e.contract, example: e.example, classes: e.classes || [],
  }));
}
