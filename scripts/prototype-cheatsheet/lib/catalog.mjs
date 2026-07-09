// scripts/prototype-design/lib/catalog.mjs
import { readFileSync } from 'node:fs';

export function readCatalog(catalogPath) {
  const c = JSON.parse(readFileSync(catalogPath, 'utf8'));
  const m = new Map();
  for (const e of [...(c.primitives ?? []), ...(c.composites ?? [])]) {
    m.set(e.name, { summary: e.summary ?? '', classes: e.classes ?? [], example: e.example ?? '', layer: e.layer });
  }
  return m;
}
