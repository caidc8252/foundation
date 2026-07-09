// scripts/prototype-cheatsheet/refresh.mjs
//
// Generates the 3-tier prototype cheatsheets + tier-components.json into release/prototype-cheatsheet/.
// Run manually pre-tag by foundation maintainers: `node scripts/prototype-cheatsheet/refresh.mjs`
// (bare invocation from the foundation repo root — all paths default foundation-relative).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseRegistry, componentsForTier } from './lib/registry.mjs';
import { readCatalog } from './lib/catalog.mjs';
import { loadSkeleton, missingSkeletons } from './lib/skeletons.mjs';
import { markerCoverage } from './lib/marker-coverage.mjs';

export { markerCoverage };

const TIER_FILE = { 30: 'cheatsheet-low.md', 70: 'cheatsheet-mid.md', 100: 'cheatsheet-full.md' };
const TOKENS_HEADER = `## Tokens (semantic, use \`var(--…)\`)\n\n- content/surface/line/primary/status colors · space · text · radius · font-mono/sans · shadow(card/overlay). (Full list in tokens.inline.css, inlined in the shell.)\n`;

export function buildCheatsheet({ tier, registry, catalog, skeletonsDir }) {
  const names = componentsForTier(registry, tier);
  const missing = missingSkeletons(skeletonsDir, names);
  if (missing.length) throw new Error(`missing skeleton(s) for tier ${tier}: ${missing.join(', ')}`);
  const head = `# Foundation cheatsheet · 档 ${tier}%\n\n> 生成物,勿手改;改覆盖范围请编辑 component-registry.md 后跑 refresh。class vocab + 最小 markup;CSS 在壳里。\n\n${TOKENS_HEADER}\n---\n`;
  const body = names.map(n => loadSkeleton(skeletonsDir, n)).join('\n\n');
  return `${head}\n${body}\n`;
}

// Foundation repo root — 2 levels up from this script
// (scripts/prototype-cheatsheet/refresh.mjs → repo root). Computed from the script's
// own location (not process.cwd()) so `node scripts/prototype-cheatsheet/refresh.mjs`
// works regardless of invocation directory; still overridable with --foundation.
const FOUNDATION_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

function main() {
  const a = Object.fromEntries(process.argv.slice(2).reduce((acc, cur, i, arr) => (cur.startsWith('--') && acc.push([cur.slice(2), arr[i+1]]), acc), []));
  const foundationRoot = a.foundation || FOUNDATION_ROOT;
  const registryPath = a.registry || join(foundationRoot, 'prototype-cheatsheet', 'component-registry.md');
  const catalogPath = a.catalog || join(foundationRoot, 'release', 'catalog.json');
  const skeletonsDir = a.skeletons || join(foundationRoot, 'prototype-cheatsheet', 'skeletons');
  const outDir = a.out || join(foundationRoot, 'release', 'prototype-cheatsheet');
  mkdirSync(outDir, { recursive: true });

  const registry = parseRegistry(readFileSync(registryPath, 'utf8'));
  const catalog = readCatalog(catalogPath);
  const primitivesCss = readFileSync(join(foundationRoot, 'primitives', 'primitives.css'), 'utf8');
  const compositesCss = readFileSync(join(foundationRoot, 'composites', 'composites.css'), 'utf8');

  const tierMap = {};
  for (const tier of [30, 70, 100]) {
    const names = componentsForTier(registry, tier);

    const cov = markerCoverage({ selected: names, registry, primitivesCss, compositesCss });
    if (cov.errors.length) {
      const detail = cov.errors.map(e => `${e.name} (markerless, host=${e.host}@${e.hostTier} > tier ${tier})`).join('; ');
      throw new Error(`marker-coverage: tier ${tier} would ship class(es) with zero CSS: ${detail}`);
    }
    if (cov.warns.length) {
      console.log(`marker-coverage: tier ${tier} warn(s) (markerless but safe): ${cov.warns.map(w => w.host ? `${w.name}(host=${w.host})` : `${w.name}(host unresolved)`).join(', ')}`);
    }

    const md = buildCheatsheet({ tier, registry, catalog, skeletonsDir });
    writeFileSync(join(outDir, TIER_FILE[tier]), md);
    tierMap[tier] = {
      primitives: registry.filter(c => c.kind === 'primitive' && c.tier <= tier).map(c => c.name),
      composites: registry.filter(c => c.kind === 'composite' && c.tier <= tier).map(c => c.name),
    };
    console.log(`wrote ${TIER_FILE[tier]} (${tierMap[tier].primitives.length}p + ${tierMap[tier].composites.length}c)`);
  }
  writeFileSync(join(outDir, 'tier-components.json'), JSON.stringify(tierMap, null, 2));
  console.log('wrote tier-components.json');
}
if (import.meta.url === `file://${process.argv[1]}`) main();
