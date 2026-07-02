/* ─────────────────────────────────────────────────────────────
   Foundation · icon registry (shared module)

   The single source of truth for the icon vocabulary, used by both the
   author-facing CLI (icon.mjs) and the validator (check-artifact.mjs).

   Raw material is VENDORED from lucide-static under ./data — so a repo that
   pulls this foundation in as skills needs NO npm dependency. `icon-nodes.json`
   holds every icon's element list; `tags.json` holds Lucide's own English tags
   (the semantic index). VERSION pins the Lucide release. Refresh with
   `node scripts/icon/refresh.mjs <version>`.

   buildSvg(name) reassembles the canonical inline <svg> deterministically, so
   the markup an author pastes is byte-correct — never a hallucinated path.
   ───────────────────────────────────────────────────────────── */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const dataDir = join(dirname(fileURLToPath(import.meta.url)), "data");

export const VERSION = readFileSync(join(dataDir, "VERSION"), "utf8").trim();
const nodes = JSON.parse(readFileSync(join(dataDir, "icon-nodes.json"), "utf8"));
const tags = JSON.parse(readFileSync(join(dataDir, "tags.json"), "utf8"));

export const ICON_NAMES = Object.keys(nodes).sort();
export const hasIcon = (name) => Object.prototype.hasOwnProperty.call(nodes, name);
export const tagsFor = (name) => tags[name] ?? [];

// Shape elements a Lucide icon is built from (everything else is noise).
const SHAPE = "path|circle|rect|line|polyline|polygon|ellipse";

const attrStr = (attrs) =>
  Object.entries(attrs)
    .map(([k, v]) => ` ${k}="${v}"`)
    .join("");

// The inner shapes for one icon, serialized as compact self-closing tags —
// matches the foundation's existing inline-SVG style.
export const childrenMarkup = (name) =>
  nodes[name].map(([tag, attrs]) => `<${tag}${attrStr(attrs)}/>`).join("");

// The canonical inline icon. `data-lucide` is the FIRST attribute: it is the
// semantic name you grep for, the validator key, and the Next.js bridge. The
// remaining wrapper attributes match the foundation's existing icons exactly.
export const buildSvg = (name) => {
  if (!hasIcon(name)) throw new Error(`unknown Lucide icon: "${name}"`);
  return (
    `<svg data-lucide="${name}" viewBox="0 0 24 24" fill="none" stroke="currentColor"` +
    ` stroke-width="2" stroke-linecap="round" stroke-linejoin="round">` +
    `${childrenMarkup(name)}</svg>`
  );
};

// Normalize a fragment of SVG inner markup into an order-preserving signature
// of its shapes — element order is kept (it is meaningful), attribute order and
// whitespace are not. Lets the validator compare an authored icon body against
// the canonical one regardless of reformatting, while still catching any
// altered/invented path data.
const shapeSignature = (markup) => {
  const out = [];
  const re = new RegExp(`<(${SHAPE})\\b([^>]*?)/?>`, "gi");
  for (const m of markup.matchAll(re)) {
    const tag = m[1].toLowerCase();
    const attrs = {};
    for (const a of m[2].matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
      attrs[a[1].toLowerCase()] = (a[2] ?? a[3] ?? "").replace(/\s+/g, " ").trim();
    }
    const norm = Object.keys(attrs)
      .sort()
      .map((k) => `${k}=${attrs[k]}`)
      .join(" ");
    out.push(`${tag}{${norm}}`);
  }
  return out.join("|");
};

// True when the authored icon body is the real Lucide geometry for `name`.
export const bodyMatches = (name, authoredInnerSvg) =>
  hasIcon(name) && shapeSignature(authoredInnerSvg) === shapeSignature(childrenMarkup(name));

// Rank icons against a free-text English query (icon name + Lucide tags).
export const searchIcons = (query, limit = 25) => {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  return ICON_NAMES.map((name) => {
    const nameWords = name.replace(/-/g, " ");
    const iconTags = tagsFor(name);
    const hay = `${nameWords} ${iconTags.join(" ")}`.toLowerCase();
    let score = 0;
    for (const w of words) {
      if (name === w) score += 100;
      else if (nameWords.split(" ").includes(w)) score += 20;
      else if (name.includes(w)) score += 8;
      if (iconTags.includes(w)) score += 6;
      else if (hay.includes(w)) score += 2;
    }
    return { name, score, tags: iconTags };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, limit);
};
