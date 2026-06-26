import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { DRAFT } from "./paths.mjs";
import { ensureDraft, buildDraftTokens, logChange } from "./draft.mjs";
import { tokenDict } from "./recipe.mjs";

const BAD = /[;{}]/;
// Escapes hyphens so the token name is regex-literal. Safe because token names
// match --[\w-]+ (only word chars + hyphens) — no other regex-special chars can
// appear, so escaping hyphens is sufficient.
const escName = (n) => n.replace(/[-]/g, "\\-");

function defFileOf(name) {
  const info = tokenDict()[name];
  if (!info || !info.defFile) throw new Error("unknown token " + name);
  return info.defFile; // e.g. "tokens/palette.css"
}

export function setTokenValue(name, newValue) {
  if (typeof newValue !== "string" || !newValue.trim() || BAD.test(newValue)) throw new Error("bad value");
  ensureDraft();
  const rel = defFileOf(name);
  const file = join(DRAFT, rel);
  const css = readFileSync(file, "utf8");
  const re = new RegExp(`(${escName(name)}\\s*:\\s*)([^;]+)(;)`);
  if (!re.test(css)) throw new Error(`declaration ${name} not found in ${rel}`);
  // No `g` flag → rewrites the FIRST declaration only. This is the canonical
  // light value and matches emit's light-map (emitTokensJson splits motion.css
  // at `@media`, so a token redeclared inside an @media(prefers-reduced-motion)
  // block — e.g. --duration-* → 0ms — is excluded from the light map). We
  // intentionally leave any later @media override untouched.
  writeFileSync(file, css.replace(re, `$1${newValue.trim()}$3`));
  buildDraftTokens();
  logChange({ kind: "value", target: name, detail: newValue.trim() });
  return { ok: true, file: rel };
}

// Repoint a semantic alias to reference a different token.
// Delegates to setTokenValue with a var(...) value — which rebuilds draft tokens.
export function repointAlias(alias, toTokenName) {
  if (!/^--[\w-]+$/.test(alias)) throw new Error("bad token");
  if (!/^--[\w-]+$/.test(toTokenName)) throw new Error("bad token");
  return setTokenValue(alias, `var(${toTokenName})`);
}

// Swap a single CSS property's token reference inside a component rule block.
// Writes the draft primitives/composites CSS; NO dist rebuild (component CSS is
// inlined directly into preview, so the change is visible on next /api/render).
//
// Bounded limitation: if a selector appears in multiple rule blocks, this
// rewrites the FIRST match only — which is the intended canonical rule for all
// components currently exposed in the platform. Comma-group selectors where the
// target selector isn't the leading member won't match ruleRe and will throw.
export function setReference({ layer, selector, prop, pseudo, fromToken, toToken }) {
  if (!/^--[\w-]+$/.test(toToken)) throw new Error("bad token");
  // Validate fromToken too — keeps semantics tight AND prevents regex-metachar
  // injection: fromToken is interpolated into propRe with only hyphen-escaping,
  // so any other regex-special char would leak through if the value weren't
  // constrained to --[\w-]+.
  if (!/^--[\w-]+$/.test(fromToken)) throw new Error("bad token");
  ensureDraft();
  const rel = layer === "composite" ? "composites/composites.css" : "primitives/primitives.css";
  const file = join(DRAFT, rel);
  let css = readFileSync(file, "utf8");
  // Locate the rule block: `selector[:pseudo] { ... }` (first match).
  const sel = (selector + (pseudo || "")).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const ruleRe = new RegExp(`(${sel}[^{}]*\\{)([^}]*)(\\})`);
  const m = ruleRe.exec(css);
  if (!m) throw new Error(`rule ${selector}${pseudo || ""} not found in ${rel}`);
  // Within the block, swap the prop's var(--fromToken) → var(--toToken).
  // The `(?<![\w-])` left boundary stops a property name from matching as a
  // SUFFIX of a longer one — e.g. prop "color" must NOT match inside
  // "background-color:" and corrupt the wrong declaration.
  const propRe = new RegExp(
    `(?<![\\w-])(${prop.replace(/[-]/g, "\\-")}\\s*:\\s*[^;]*var\\(\\s*)${fromToken.replace(/[-]/g, "\\-")}(\\s*\\))`
  );
  if (!propRe.test(m[2])) throw new Error(`${prop} → var(${fromToken}) not found in ${selector}`);
  const newBody = m[2].replace(propRe, `$1${toToken}$2`);
  css = css.slice(0, m.index) + m[1] + newBody + m[3] + css.slice(m.index + m[0].length);
  writeFileSync(file, css);
  logChange({ kind: "reference", target: `${selector}${pseudo || ""} ${prop}`, detail: `${fromToken}→${toToken}` });
  return { ok: true, file: rel }; // no rebuild: component CSS is inlined directly into preview
}
