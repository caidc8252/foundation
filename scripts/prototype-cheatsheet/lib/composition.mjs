// scripts/prototype-cheatsheet/lib/composition.mjs
//
// Composition-dependency analysis for the prototype shell.
//
// A composite often COMPOSES other components (detail-header renders a `.tabs__list`
// tab strip; rich-pagination renders a `.pagination` nav; list-filter opens a `.sheet`).
// The composed component's CSS lives under ITS OWN `/* @component */` marker, so a shell
// sliced for a tier that includes the composer but NOT the composed dep ships zero CSS
// for the dep → silent unstyled render. The registry's per-component tier does not
// capture this ("pagination is niche/100" while rich-pagination@30 needs it).
//
// Fix: the SHELL component set for a tier is the TRANSITIVE COMPOSITION CLOSURE of the
// tier's own components — every composed dep's CSS ships with its composer, regardless
// of the dep's own registry tier. (The cheatsheet INDEX stays lean: only the tier's own
// components; the writer gets composed markup from the composer's example.)
//
// Composition edges are read from each component's example HTML: a used class that is
// "owned" by another component (its base name equals that component's name) = a dep.

import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// Map "<.class>" → owning component name, where a class is owned by the component whose
// name equals the class's base (strip leading dot, split off __element / --modifier).
// This is precise: `.tabs__list` → tabs, `.page-header__bar` → page-header. Shared/utility
// classes whose base matches no component name simply don't map (and don't create edges).
export function buildClassOwner(catalog) {
  const owner = new Map();
  for (const [name, c] of catalog) {
    for (const cls of (c.classes || [])) {
      const bare = cls.replace(/^\./, '');
      const base = bare.split(/__|--/)[0];
      if (base === name) owner.set('.' + bare, name);
    }
  }
  return owner;
}

// component name → Set of directly-composed component names (from its example HTML).
export function directCompositionDeps(catalog, foundationRoot) {
  const owner = buildClassOwner(catalog);
  const deps = new Map();
  for (const [name, c] of catalog) {
    const set = new Set();
    const ex = c.example ? join(foundationRoot, c.example) : null;
    if (ex && existsSync(ex)) {
      const html = readFileSync(ex, 'utf8');
      for (const m of html.matchAll(/class="([^"]+)"/g)) {
        for (const cl of m[1].split(/\s+/)) {
          if (!cl) continue;
          const o = owner.get('.' + cl);
          if (o && o !== name) set.add(o);
        }
      }
    }
    deps.set(name, set);
  }
  return deps;
}

// Transitive closure of `names` (iterable) over the deps map.
export function closure(names, depsMap) {
  const out = new Set(names);
  const stack = [...out];
  while (stack.length) {
    const n = stack.pop();
    for (const d of (depsMap.get(n) || [])) {
      if (!out.has(d)) { out.add(d); stack.push(d); }
    }
  }
  return out;
}
