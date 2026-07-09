// scripts/prototype-cheatsheet/refresh.mjs
//
// Generates the 3-tier prototype component INDEX + tier-components.json into release/prototype-cheatsheet/.
// Run manually pre-tag by foundation maintainers: `node scripts/prototype-cheatsheet/refresh.mjs`
// (bare invocation from the foundation repo root — all paths default foundation-relative).
//
// The index is a PURE lookup table (component · class vocab · purpose · example path),
// derived entirely from component-registry.md (tier) + release/catalog.json (summary/classes/example/layer).
// It carries NO markup skeletons — the downstream writer reads the real example
// (`primitives|composites/<name>.html`) on demand for any non-trivial usage.
// Consequently the old skeleton library + distillation + staleness check are retired.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseRegistry, componentsForTier } from './lib/registry.mjs';
import { readCatalog } from './lib/catalog.mjs';
import { markerCoverage } from './lib/marker-coverage.mjs';
import { directCompositionDeps, closure } from './lib/composition.mjs';

export { markerCoverage };

const TIER_FILE = { 30: 'cheatsheet-low.md', 70: 'cheatsheet-mid.md', 100: 'cheatsheet-full.md' };
const TOKENS_HEADER = `## Tokens (semantic, use \`var(--…)\`)\n\n- content/surface/line/primary/status colors · space · text · radius · font-sans · shadow(card/overlay). (Full list in tokens.inline.css, inlined in the shell.)\n`;

export function buildIndex({ tier, registry, catalog }) {
  const names = componentsForTier(registry, tier);
  const head = `# Foundation 组件索引 · 档 ${tier}%\n\n> **纯索引**:组件清单 + class vocab + 用途 + 范例路径。**不含 markup 骨架**——非平凡使用直接读 \`example\` 指的真范例、取其规范实例(忽略 demo 脚手架)。组件 CSS 已在壳里。生成物,勿手改;改覆盖范围请编辑 component-registry.md 后跑 refresh。\n\n${TOKENS_HEADER}\n---\n`;
  const blocks = names.map(n => {
    const c = registry.find(r => r.name === n);
    const cat = catalog.get(n) || {};
    const layer = cat.layer || c.kind;
    const summary = (cat.summary || '').trim() || '(catalog 无 summary)';
    const classes = (cat.classes || []).map(x => `\`${x}\``).join(' ');
    const example = cat.example || `${c.kind === 'primitive' ? 'primitives' : 'composites'}/${n}.html`;
    return `### ${n} · ${layer} · tier ${c.tier}\n${summary}\nclass: ${classes || '(见范例)'}\nexample → \`${example}\` (非平凡使用去读、取规范实例)`;
  });
  return `${head}\n${blocks.join('\n\n')}\n`;
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
  const outDir = a.out || join(foundationRoot, 'release', 'prototype-cheatsheet');
  mkdirSync(outDir, { recursive: true });

  const registry = parseRegistry(readFileSync(registryPath, 'utf8'));
  const catalog = readCatalog(catalogPath);
  const primitivesCss = readFileSync(join(foundationRoot, 'primitives', 'primitives.css'), 'utf8');
  const compositesCss = readFileSync(join(foundationRoot, 'composites', 'composites.css'), 'utf8');

  // Composition edges (A composes B) read from example HTML — drives the shell closure.
  const depsMap = directCompositionDeps(catalog, foundationRoot);
  const kindOf = n => registry.find(c => c.name === n)?.kind || catalog.get(n)?.layer;
  // Shell scaffold: build-netshell ALWAYS emits `<div class="app-frame app-frame--frameless">`
  // as the shell root, so app-frame CSS must ship in EVERY shell (its --frameless rules are
  // load-bearing for sticky headers), regardless of tier. Seed the closure with it.
  const SHELL_BASELINE = ['app-frame'];

  const tierMap = {};
  for (const tier of [30, 70, 100]) {
    const indexNames = componentsForTier(registry, tier);            // lean index: tier's own components
    const shellSet = closure([...indexNames, ...SHELL_BASELINE], depsMap); // shell: + baseline + transitive composition deps
    const shellNames = [...shellSet];
    const composedIn = shellNames.filter(n => !indexNames.includes(n)).sort(); // pulled in only via composition

    // marker-coverage runs on the SHELL set (what actually gets sliced into the shell).
    const cov = markerCoverage({ selected: shellNames, registry, primitivesCss, compositesCss });
    if (cov.errors.length) {
      const detail = cov.errors.map(e => `${e.name} (markerless, host=${e.host}@${e.hostTier} > tier ${tier})`).join('; ');
      throw new Error(`marker-coverage: tier ${tier} would ship class(es) with zero CSS: ${detail}`);
    }
    if (cov.warns.length) {
      console.log(`marker-coverage: tier ${tier} warn(s) (markerless but safe): ${cov.warns.map(w => w.host ? `${w.name}(host=${w.host})` : `${w.name}(host unresolved)`).join(', ')}`);
    }

    const md = buildIndex({ tier, registry, catalog });              // index stays lean (tier's own components)
    writeFileSync(join(outDir, TIER_FILE[tier]), md);
    tierMap[tier] = {                                                // tier-components drives the shell → use closure
      primitives: shellNames.filter(n => kindOf(n) === 'primitive').sort(),
      composites: shellNames.filter(n => kindOf(n) === 'composite').sort(),
    };
    console.log(`wrote ${TIER_FILE[tier]} (index ${indexNames.length}; shell ${shellNames.length}${composedIn.length ? `; +composition: ${composedIn.join(', ')}` : ''})`);
  }
  writeFileSync(join(outDir, 'tier-components.json'), JSON.stringify(tierMap, null, 2));
  console.log('wrote tier-components.json');
}
if (import.meta.url === `file://${process.argv[1]}`) main();
