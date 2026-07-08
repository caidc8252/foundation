#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────────
   Foundation · artifact closed-set check

   Makes governance/enforcement.md's artifact checklist RUNNABLE. Scans an
   artifact HTML and reports anything OUTSIDE the foundation closed set
   (release/catalog.json):

     ✗ hardcoded color literals   — a token covers every brand color
     ✗ unknown var(--…) refs      — token name not in the set (typo / invented)
     ✗ native date/time input     — `<input type="date|datetime-local|month|
                                     week">` pops unskinnable native calendar
                                     chrome; the date-picker family (.date-trigger)
                                     is the closed-set control. `type="time"` is
                                     allowed ONLY when skinned (.input /
                                     .input-group__control) — that IS the foundation
                                     time-picker; a bare native time input is still
                                     flagged.
     ✗ field hint+error both shown — a `.field` whose at-rest markup renders BOTH a
                                     visible `.field__hint` AND a visible `.field__error`;
                                     the two are mutually exclusive (field.md · States) —
                                     the interactive swap must hide one (`.is-hidden` /
                                     `hidden` / display:none). Statically decidable, so it
                                     fails the build.
     ✗ fused card stack           — a wrapper with ≥2 DIRECT `.card` children that render
                                     at rest but have NO gap between them (the wrapper
                                     carries no `gap` — foundation or page-local — and is
                                     not page-body / .tabs__content / .stack--N, and the
                                     cards have no vertical margin). The cards collapse into
                                     one slab — the hand-rolled step/section wrapper that
                                     forgot its rhythm. Outcome-based, not form-based: a
                                     hand-rolled flex-column+gap wrapper is a working stack
                                     and passes; mutually-exclusive hidden siblings (a wizard
                                     step, an inactive tab) don't count. Scans the static
                                     tree, so a JS-hidden step is checked too; card groups a
                                     script BUILDS at runtime are the known residual. See
                                     scripts/lib/block-rhythm.mjs.
     ⚠ .label outside a Field      — a foundation `.label` wired to a control (`for=`) but
                                     not wrapped in a `.field`. The "hand-rolled form row"
                                     escape (principle 5 · create-form.md · field.md). A
                                     toolbar control uses `aria-label` (no `.label` element)
                                     and never trips; a standalone label demo does — HEURISTIC
                                     + advisory, confirm intent.
     ⚠ classes not in the set     — neither a foundation class nor defined in
                                     this file's own <style> (page-local
                                     composition is allowed; an off-set
                                     component library is not — review these)
     ⚠ inline padding/margin hack — style="padding:0"-style layout resets;
                                     prefer a class (.stack--N / --flush). Advisory
                                     only — never affects the exit code.
     ⚠ .table-frame--flush in .card — two frame mechanisms fight; the card owns
                                     the frame and its overflow:hidden traps the
                                     sticky header --flush exists to free (see the
                                     function note). Advisory only — never affects
                                     the exit code.
     ⚠ search/filter wired on change — a search/filter control that runs the query
                                     on `input`/`change` instead of on the Search
                                     button / Enter (principle 14). HEURISTIC scan of
                                     the raw script; advisory only — never affects the
                                     exit code (see the function note).
     ⚠ spec-internal id in copy   — rule/state/process/task ids (R-N · SM-N · P-N ·
                                     TASK-*) in rendered UI text; traceability markers,
                                     not product copy. HTML-comment refs are exempt.
                                     Advisory only — never affects the exit code.
     ⚠ app-shell chrome, frameless — a `.theme-toggle` (or similar top-bar chrome) in
                                     an `.app-frame--frameless` page; invented chrome a
                                     frameless business page has no bar to host.
                                     Advisory only — never affects the exit code.
     ⚠ cell-chevron as its own cell — a `.cell-chevron` on a `<td>`/`<th>`; the chevron
                                     is no longer a standalone cell. It belongs inside the
                                     row's single trailing `.row-actions` cell, last child
                                     of `.row-actions__inner`, after any verbs (data-table.md).
                                     Advisory only — never affects the exit code.

   The two ✗ categories are hard violations (non-zero exit). Classes are
   advisory by default; pass --strict to make off-set classes fail too.

   The checker understands shipped artifacts with the three foundation CSS
   layers inlined. It removes those known layer bodies before scanning for
   authored CSS violations, so token definitions do not count as hardcoded
   artifact colors.

   Usage:  node scripts/check-artifact.mjs [--strict] <file.html> [more.html …]
   Build the release snapshot first if missing:  pnpm build
   ───────────────────────────────────────────────────────────── */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { hasIcon, bodyMatches, VERSION as ICON_VERSION } from "./icon/registry.mjs";
import { findFusedCardStacks } from "./lib/block-rhythm.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const requireFoundationFile = (path) => {
  const file = join(root, path);
  if (!existsSync(file)) {
    console.error(`✗ ${path} missing — run \`pnpm build\` first.`);
    process.exit(2);
  }
  return readFileSync(file, "utf8");
};

const catalogPath = join(root, "release", "catalog.json");
if (!existsSync(catalogPath)) {
  console.error("✗ release/catalog.json missing — run `pnpm build` first.");
  process.exit(2);
}
const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));
const TOKENS = new Set(catalog.tokens);
const CLASSES = new Set(catalog.classes);
const FOUNDATION_LAYERS = [
  ["release/tokens.inline.css", requireFoundationFile("release/tokens.inline.css")],
  ["primitives/primitives.css", requireFoundationFile("primitives/primitives.css")],
  ["release/composites.css", requireFoundationFile("release/composites.css")],
];
// All foundation CSS bodies, for checks that must know which foundation classes
// carry a rhythm (a gap) — the block-rhythm check resolves gap sources across
// both foundation and page-local CSS.
const FOUNDATION_CSS = FOUNDATION_LAYERS.map(([, body]) => body).join("\n");

const usage = () => {
  console.error("usage: node scripts/check-artifact.mjs [--strict] <file.html> […]");
};

let strict = false;
const files = [];
for (const arg of process.argv.slice(2)) {
  if (arg === "--") {
    continue;
  } else if (arg === "--strict") {
    strict = true;
  } else if (arg === "--help" || arg === "-h") {
    usage();
    process.exit(0);
  } else if (arg.startsWith("-")) {
    console.error(`unknown option: ${arg}`);
    usage();
    process.exit(2);
  } else {
    files.push(arg);
  }
}
if (!files.length) {
  usage();
  process.exit(2);
}

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const stripHtmlComments = (html) => html.replace(/<!--[\s\S]*?-->/g, " ");
const stripScriptBlocks = (html) => html.replace(/<script\b[^>]*>[\s\S]*?<\/script\s*>/gi, " ");
const stripStyleBlocks = (html) => html.replace(/<style\b[^>]*>[\s\S]*?<\/style\s*>/gi, " ");
const stripCssComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, " ");

// A color literal is only a violation in a CSS context — a <style> body or an
// element attribute (style="…", fill="…", stroke="…"). In text content, "#10482"
// is an order number, not a color. Keep tags (their attributes) + page CSS, but
// drop the text nodes between tags so demo copy never trips the color check.
const colorScanSurface = (markup, pageCss) => `${markup.replace(/>[^<]*</g, "><")}\n${pageCss}`;

const extractStyleCss = (html) =>
  [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style\s*>/gi)].map((m) => m[1]).join("\n");

const removeKnownFoundationCss = (css) => {
  let out = css;
  const removed = [];
  for (const [name, layer] of FOUNDATION_LAYERS) {
    const before = out;
    out = out.replace(new RegExp(escapeRegExp(layer), "g"), "");
    if (out !== before) removed.push(name);
  }
  return { css: out, removed };
};

const authoredSurfaces = (html) => {
  const styleCss = extractStyleCss(html);
  const { css: pageCss, removed } = removeKnownFoundationCss(styleCss);
  const markup = stripHtmlComments(stripStyleBlocks(stripScriptBlocks(html)));
  // Same as `markup` but KEEPS <script> — a mock-data prototype builds most of its
  // DOM (rows, badges, cells) from JS string templates, so class usage there is
  // invisible to a script-stripped scan. Styles are still dropped (a CSS body is
  // not DOM). Used only by the class scan, which guards against interpolated values.
  const markupWithScripts = stripHtmlComments(stripStyleBlocks(html));
  return {
    markup,
    markupWithScripts,
    pageCss,
    authored: `${markup}\n${pageCss}`,
    removedLayers: removed,
  };
};

// Strip CSS rule bodies (repeat for nesting) so only selector text remains.
const selectorsOnly = (css) => {
  let prev;
  do { prev = css; css = css.replace(/\{[^{}]*\}/g, " "); } while (css !== prev);
  return css;
};

const localClassesFromCss = (css) => {
  const local = new Set();
  for (const m of selectorsOnly(stripCssComments(css)).matchAll(/\.(-?[A-Za-z_][\w-]*)/g)) {
    local.add(m[1]);
  }
  return local;
};

// Collects the classes an artifact USES. Accepts markup that may include <script>
// (see authoredSurfaces.markupWithScripts) so JS-templated DOM counts too. A class
// value is only harvested when it is a CLEAN, fully-literal class list — plain
// idents + spaces. A value carrying interpolation (`class="badge ' + tone + '"`)
// or any non-class char is skipped whole: its real leading class is a false
// negative we accept to avoid emitting junk tokens (`'`, `+`, a JS var name) that
// would false-positive as off-set classes — a hard violation under --strict.
const CLEAN_CLASS_LIST = /^[\sA-Za-z0-9_-]+$/;
const usedClassesFromMarkup = (markup) => {
  const used = new Set();
  for (const tag of markup.matchAll(/<([A-Za-z][A-Za-z0-9:-]*)(?:\s[^<>]*)?>/g)) {
    const attrs = tag[0];
    for (const m of attrs.matchAll(/\sclass\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/gi)) {
      const raw = m[1] ?? m[2] ?? m[3] ?? "";
      if (!CLEAN_CLASS_LIST.test(raw)) continue;   // interpolated / dynamic — skip whole
      for (const c of raw.split(/\s+/)) if (c) used.add(c);
    }
  }
  return used;
};

const classAttrValuesFromTag = (tag) => {
  const values = [];
  for (const m of tag.matchAll(/\sclass\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/gi)) {
    values.push(m[1] ?? m[2] ?? m[3] ?? "");
  }
  return values;
};

// Scans the RAW html (scripts included), NOT the script-stripped markup: a
// mock-data prototype builds its table rows from JS string templates in a
// `<script>` (`'<td class="cell-tags">' + …`), so a stripped-markup scan is blind
// to exactly where this defect lives. `.cell-tags` is a flex wrapper — on a `<td>`
// it makes the cell `display:flex`, dropping it out of table-cell layout so its
// content stops aligning with the row's other cells (the vertical misalignment).
// It belongs INSIDE the cell: `<td><div class="cell-tags">…</div></td>`. Matching a
// literal `<td class="cell-tags">` catches both static and JS-template forms; a
// class assembled from fragments (`'<td class="' + cls + '"'`) can still slip past.
// The trailing chevron is NOT its own cell. A data-table row has ONE trailing
// operations cell (`.row-actions`, self-right-aligned) that holds any inline verbs
// then a passive `.cell-chevron` glyph (a `<span>`) as its last child — so a row can
// both act and navigate from one cell (data-table.md). The pre-merge pattern put the
// chevron in its own `<td class="cell-right cell-chevron">` beside a separate action
// cell; flag any `<td>`/`<th>` still carrying `cell-chevron` — it must move inside
// `.row-actions__inner`. Same raw-html scan as cell-tags so JS-template rows count.
// Advisory only — it reads slightly off / splits the trailing column, not a hard break.
const structuralFindingsFromHtml = (html) => {
  const cellTagsOnTableCells = [];
  const chevronAsCell = [];
  for (const m of html.matchAll(/<(td|th)\b(?:\s[^<>]*)?>/gi)) {
    const tag = m[0];
    const classes = classAttrValuesFromTag(tag).flatMap((raw) => raw.split(/\s+/));
    if (classes.includes("cell-tags")) {
      cellTagsOnTableCells.push(tag.length > 90 ? `${tag.slice(0, 87)}…` : tag);
    }
    if (classes.includes("cell-chevron")) {
      chevronAsCell.push(tag.length > 90 ? `${tag.slice(0, 87)}…` : tag);
    }
  }
  return { cellTagsOnTableCells, chevronAsCell };
};

// Native CALENDAR date inputs bypass the foundation picker family. The date
// pickers (date-picker / date-range-picker / date-time-picker) replace the
// browser-native calendar with a custom
// `.date-trigger` + `.calendar` popover; a raw `<input type="date">` — even one
// wearing `.input` — still pops unskinnable native calendar chrome, so it is a
// closed-set breach — a HARD violation, not a style smell.
//   `type="time"` is the exception: the foundation time-picker IS a native
// `<input type="time">` wearing the foundation input skin (its only native
// chrome is a minimal spinner, which the design accepts; there is no non-native
// time control in the closed set). So a time input is allowed ONLY when it wears
// that skin — class `.input` or `.input-group__control`. A bare / unskinned
// `<input type="time">` (raw browser chrome) is still a HARD violation, routed to
// the time-picker recipe. This keeps "native time = the time-picker, nothing else".
// Scan the RAW html (scripts included) so a JS-templated `<input type="date">`
// counts too. Plain `<input class="input" type="text|search|number|email|…">`
// stays allowed — the legitimate foundation input primitive.
const PICKER_FOR = {
  date: "date-picker",
  "datetime-local": "date-time-picker",
  month: "date-picker",
  week: "date-picker",
};
const NATIVE_DATE_INPUT = /<input\b[^>]*\btype\s*=\s*["'](date|datetime-local|month|week)["'][^>]*>/gi;
// Time inputs are matched separately so we can allow the skinned time-picker
// recipe and flag only the raw ones.
const NATIVE_TIME_INPUT = /<input\b[^>]*\btype\s*=\s*["']time["'][^>]*>/gi;
const isSkinnedInput = (tag) => /\bclass\s*=\s*["'][^"']*\b(?:input|input-group__control)\b/i.test(tag);
const nativeDateInputsFromHtml = (html) => {
  const hits = new Map();
  for (const m of html.matchAll(NATIVE_DATE_INPUT)) {
    const type = m[1].toLowerCase();
    if (!hits.has(type)) hits.set(type, PICKER_FOR[type]);
  }
  for (const m of html.matchAll(NATIVE_TIME_INPUT)) {
    if (isSkinnedInput(m[0])) continue; // skinned native time = the time-picker recipe, allowed
    if (!hits.has("time")) hits.set("time", "time-picker");
  }
  return [...hits.entries()].map(([type, picker]) => ({ type, picker }));
};

// Native controls that HAVE a richer foundation equivalent. Unlike the native
// date/time chrome above (a hard breach — the OS calendar is unskinnable), these
// CAN be skinned, so reaching for the native element isn't broken — it just
// bypasses the closed-set component and drifts from the system. A review nudge,
// never a hard fail.
//   `<input type="range">` → the slider skin (`.slider` + `.slider__track` /
//     `.slider__indicator` / `.slider__thumb`). The sanctioned interactive recipe
//     keeps a native range as a HIDDEN DRIVER wearing class `range-input` (see
//     primitives/slider.md · Artifact behavior); that one is allowed — so flag a
//     range ONLY when it is not that driver (a bare range, or one wearing `.slider`
//     directly, which is the classic "native control in a foundation costume").
//   `<progress>` / `<meter>` → the progress primitive (`.progress`).
const NATIVE_SKINNABLE = /<(?:input\b[^>]*\btype\s*=\s*["']range["'][^>]*|progress\b[^>]*|meter\b[^>]*)>/gi;
const nativeSkinnableFromHtml = (html) => {
  const hits = new Map(); // native element → foundation replacement
  for (const m of html.matchAll(NATIVE_SKINNABLE)) {
    const tag = m[0];
    if (/^<input/i.test(tag)) {
      if (/\bclass\s*=\s*["'][^"']*\brange-input\b/i.test(tag)) continue; // sanctioned slider driver
      hits.set("range", "the slider skin (.slider + .slider__track/__indicator/__thumb)");
    } else if (/^<progress/i.test(tag)) {
      hits.set("progress", "the progress primitive (.progress)");
    } else {
      hits.set("meter", "the progress primitive (.progress)");
    }
  }
  return [...hits.entries()].map(([el, repl]) => ({ el, repl }));
};

// Spec-internal IDs leaking into rendered UI copy. A prototype projects the spec's
// business meaning, not its bookkeeping: rule ids (R-N), state-machine ids (SM-N),
// process ids (P-N), task ids (TASK-*) are traceability markers — a real product UI
// never shows "(R-1)". Scan markupWithScripts so JS-templated copy counts, but with
// HTML comments already stripped (authoredSurfaces): `<!-- enforces party.md#R-1 -->`
// is the SANCTIONED traceability channel and must not be flagged. Advisory only.
// Match the reference SYNTAX only — a parenthesized tag `(R-1)` or an anchor `#R-1`
// (how a leaked spec ref reads in copy), plus a bare `TASK-*`. This skips quoted
// mock-data ids like `{ id: 'R-301' }` in the JS, which are data, not copy.
const INTERNAL_ID = /\((?:R|SM|P)-\d+\)|#(?:R|SM|P)-\d+\b|\bTASK-[A-Z][\w-]*/g;
const internalIdsFromMarkup = (markupWithScripts) => {
  const hits = new Set();
  for (const m of markupWithScripts.matchAll(INTERNAL_ID)) hits.add(m[0]);
  return [...hits].sort();
};

// A frameless business page must not invent app-shell chrome. A theme toggle
// (`.theme-toggle`) belongs in the full app-frame's top bar — a frameless page has
// no bar to host it, so its presence is invented chrome (dark/light is verified by
// the visual pass's two renders, not a page-level switch). Flag `.theme-toggle`
// class usage when the artifact declares `.app-frame--frameless`. Scan
// markupWithScripts so a JS-built button counts; the inlined `.theme-toggle` CSS
// lives in <style> (stripped). Advisory only.
const frameChromeFromMarkup = (markupWithScripts) => {
  if (!/\bapp-frame--frameless\b/.test(markupWithScripts)) return [];
  const hits = new Set();
  if (/class\s*=\s*["'][^"']*\btheme-toggle\b/.test(markupWithScripts)) hits.add(".theme-toggle");
  return [...hits];
};

// A `.table-frame--flush` nested inside a `.card` is a self-defeating double-frame.
// The card already owns the border / radius / shadow (`.card__content--flush >
// .table-frame` in composites.css strips the inner one), AND the card's own
// `overflow: hidden` re-creates the scroll-container trap that `--flush`
// (`overflow: clip`) exists to avoid — so a sticky summary-bar / thead gets pinned
// to the card instead of propagating to the app-frame scroll root. The list
// "results card" should BE a standalone `.table-frame--flush` (patterns/list-page.md),
// not wrapped in a card; a plain table inside a section card uses `.table-frame`
// (no `--flush`). Advisory ONLY — never affects the exit code: rule 312 hides the
// visual double-border, so this bites only once sticky headers are enabled.
const VOID_ELEMENTS = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
const flushFrameNestingFromMarkup = (markup) => {
  const hits = [];
  const stack = [];
  let openCards = 0;
  for (const m of markup.matchAll(/<(\/)?([A-Za-z][A-Za-z0-9:-]*)((?:\s[^<>]*)?)>/g)) {
    const [full, closing, rawName, attrs] = m;
    const tag = rawName.toLowerCase();
    if (closing) {
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].tag === tag) {
          for (let j = stack.length - 1; j >= i; j--) if (stack[j].card) openCards--;
          stack.length = i;
          break;
        }
      }
      continue;
    }
    const classes = classAttrValuesFromTag(full).join(" ").split(/\s+/);
    // Check ancestry BEFORE self-push: an element is never its own ancestor.
    if (classes.includes("table-frame--flush") && openCards > 0) {
      hits.push(full.length > 90 ? `${full.slice(0, 87)}…` : full);
    }
    const selfClose = attrs.trimEnd().endsWith("/") || VOID_ELEMENTS.has(tag);
    if (!selfClose) {
      const card = classes.includes("card");
      stack.push({ tag, card });
      if (card) openCards++;
    }
  }
  return hits;
};

// Field caption contract (primitives/field.md) + the "forms use Field" mandate
// (principle 5 · create-form.md). One stack walk, two findings:
//
//   HARD — hint↔error mutual exclusion. A `.field` renders EITHER a `.field__hint`
//   OR a `.field__error`, never both at once (field.md · States: "error replaces the
//   hint entirely"). A field whose AT-REST markup shows BOTH a visible hint AND a
//   visible error is a contract breach — the interactive swap must hide one at rest
//   (the codebase convention is the page-local `.is-hidden`; a `hidden` attribute or
//   inline `display:none` counts too). Statically decidable with no false positive,
//   so it fails the build.
//
//   ADVISORY — a foundation `.label` wired to a control (`for=`/`htmlFor`) but sitting
//   OUTSIDE any `.field` wrapper: the "hand-rolled form row" escape — a label+control
//   improvised without the Field primitive that owns the stacked label→control→caption
//   anatomy (field.md · label.md: "For the full stacked field, compose with .field").
//   The `for=` gate keeps this precise: a toolbar/pagination/quick-filter control is
//   labelled by `aria-label` (no `.label` ELEMENT) and never trips; `.field-check` rows
//   caption with `.field-check__text`, not `.label`. HEURISTIC + advisory only — a
//   standalone `.label` primitive DEMO (primitives/label.html) legitimately shows the
//   label without a field, so confirm intent. Scans `markup` (script-stripped), so a
//   form BUILT IN JS is invisible here — the enforcement.md review-gate item is the
//   backstop for that (the ungoverned JS/DOM layer a class scan cannot see).
const CAPTION_HIDDEN = (tag) => /\bis-hidden\b|\bhidden\b|display\s*:\s*none/i.test(tag);
const fieldFindingsFromMarkup = (markup) => {
  const captionConflict = []; // .field showing a visible hint AND a visible error (hard)
  const labelOutsideField = []; // a `for=`-wired .label with no .field ancestor (advisory)
  const stack = [];
  const snip = (s) => (s.length > 90 ? `${s.slice(0, 87)}…` : s);
  const verdict = (f) => {
    if (f.field && f.field.hint > 0 && f.field.error > 0) captionConflict.push(f.field.snip);
  };
  for (const m of markup.matchAll(/<(\/)?([A-Za-z][A-Za-z0-9:-]*)((?:\s[^<>]*)?)>/g)) {
    const [full, closing, rawName, attrs] = m;
    const tag = rawName.toLowerCase();
    if (closing) {
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i].tag === tag) {
          for (let j = stack.length - 1; j >= i; j--) verdict(stack[j]);
          stack.length = i;
          break;
        }
      }
      continue;
    }
    const classes = classAttrValuesFromTag(full).join(" ").split(/\s+/).filter(Boolean);
    const classSet = new Set(classes);
    // Caption → credit a VISIBLE hint/error to the nearest open .field ancestor.
    if (classSet.has("field__hint") || classSet.has("field__error")) {
      if (!CAPTION_HIDDEN(full)) {
        for (let i = stack.length - 1; i >= 0; i--) {
          if (stack[i].field) {
            if (classSet.has("field__hint")) stack[i].field.hint++;
            else stack[i].field.error++;
            break;
          }
        }
      }
    }
    // A `for=`-wired .label (a real control caption) with no .field ancestor.
    if (classSet.has("label") && /\bfor\s*=/i.test(full) && !stack.some((f) => f.field)) {
      labelOutsideField.push(snip(full));
    }
    const selfClose = attrs.trimEnd().endsWith("/") || VOID_ELEMENTS.has(tag);
    if (!selfClose) {
      const isField = classSet.has("field");
      stack.push({ tag, field: isField ? { hint: 0, error: 0, snip: snip(full) } : null });
    }
  }
  for (const f of stack) verdict(f); // flush any fields left open by unbalanced markup
  return { captionConflict, labelOutsideField };
};

// Principle 14: filtering commits on the Search button / Enter, NEVER on change.
// Unlike every other check, this one scans the RAW html (scripts included) for a
// search/filter control wired to an on-change handler: an `input` (search-as-you-type)
// or `change` (filter-on-select) listener whose TARGET names a search/filter element
// (id/var contains search·filter·query·keyword·q-input·q-search), or an inline
// on{input,change} on a `type="search"` field. `keydown`/`keyup` are deliberately
// NOT matched — that is the legitimate Enter-to-commit path.
// HEURISTIC + advisory only (never affects the exit code): it cannot tell a draft
// update (allowed) from a query run (the defect), and a listener on a generically
// named variable or a quick-filter <select> with a neutral id slips through. It
// surfaces the obvious wiring so a human applies principle 14 — a review-gate rule
// the static closed-set check can't own. Most missed under detail-page tabs.
const SEARCH_TARGET = /(search|filter|query|keyword|q[-_]?input|q[-_]?search)/i;
const searchOnChangeFromHtml = (html) => {
  const hits = new Set();
  // A target expression immediately before .addEventListener / .on* — e.g.
  // byId('q-input'), searchInput, document.querySelector('.search-input .input').
  const target = "([A-Za-z_$][\\w$]*(?:\\([^()]*\\)|\\[[^\\]]*\\]|\\.[A-Za-z_$][\\w$]*)*)";
  for (const m of html.matchAll(new RegExp(`${target}\\s*\\.addEventListener\\(\\s*['"](input|change)['"]`, "g"))) {
    if (SEARCH_TARGET.test(m[1])) hits.add(`${m[1].trim()}.addEventListener('${m[2]}', …)`);
  }
  for (const m of html.matchAll(new RegExp(`${target}\\s*\\.on(input|change)\\s*=`, "g"))) {
    if (SEARCH_TARGET.test(m[1])) hits.add(`${m[1].trim()}.on${m[2]} = …`);
  }
  for (const m of html.matchAll(/<input\b[^>]*\bon(input|change)\s*=[^>]*>/gi)) {
    if (/type\s*=\s*["']search["']/i.test(m[0]) || /class\s*=\s*["'][^"']*search-input/i.test(m[0])) {
      hits.add(`inline on${m[1]} on <input type="search">`);
    }
  }
  return [...hits];
};

const tokenRefsFromAuthored = (text) => {
  const refs = new Set();
  for (const m of stripCssComments(text).matchAll(/var\(\s*(--[A-Za-z_][\w-]*)/g)) {
    refs.add(m[1].slice(2));
  }
  return refs;
};

// Custom properties the artifact DEFINES itself — page-local CSS variables (an
// animation/state var like --toast-duration, set in its own <style>, an inline
// style="--x:…", or via JS setProperty). Allowed exactly like page-local classes:
// a var() resolving to one of these is page-local composition, not an off-set
// foundation-token reference. A var() to a `--x` that is never defined and not a
// foundation token stays flagged (catches typos / renamed tokens).
const locallyDefinedTokensFromHtml = (html) => {
  const defs = new Set();
  for (const m of html.matchAll(/(--[A-Za-z_][\w-]*)\s*:/g)) defs.add(m[1].slice(2));
  for (const m of html.matchAll(/setProperty\(\s*["'](--[A-Za-z_][\w-]*)["']/g)) defs.add(m[1].slice(2));
  return defs;
};

// Inline Lucide icons. Every icon must carry `data-lucide="<name>"`: the name
// must be a real Lucide icon (no invented names) and the pasted body must be
// that icon's real geometry (no hand-edited / hallucinated paths). An
// icon-shaped <svg> with no data-lucide is un-mappable to lucide-react — warn.
const iconFindingsFromMarkup = (markup) => {
  const unknown = new Set();
  const mismatch = new Set();
  let untagged = 0;
  for (const m of markup.matchAll(/<svg\b([^>]*)>([\s\S]*?)<\/svg\s*>/gi)) {
    const [openAttrs, inner] = [m[1], m[2]];
    const dl = openAttrs.match(/data-lucide\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
    if (dl) {
      const name = dl[1] ?? dl[2];
      if (!hasIcon(name)) unknown.add(name);
      else if (!bodyMatches(name, inner)) mismatch.add(name);
    } else if (/viewBox\s*=\s*["']0 0 24 24["']/.test(openAttrs)) {
      untagged++;
    }
  }
  return { unknown: [...unknown].sort(), mismatch: [...mismatch].sort(), untagged };
};

const hardcodedColorsFromAuthored = (text) => {
  const stripped = stripCssComments(text);
  const colorLiterals = [
    ...stripped.matchAll(/#[0-9a-fA-F]{3,8}\b/g),
    ...stripped.matchAll(/\b(?:rgb|rgba|hsl|hsla|oklch|oklab)\([^)]*\)/g),
  ]
    .map((m) => m[0])
    // color-mix(in oklch, var(--token) …) is token-based, not a literal — keep only
    // raw functions, and drop any that wrap a var().
    .filter((s) => !s.includes("var("));
  return [...new Set(colorLiterals)];
};

// Inline style="…padding…/…margin…" layout hacks. Spacing/flush is a composition
// choice (a token-based class — .stack--N, .card__content--flush, or a page-local
// class), never an inline reset like style="padding:0". Advisory ONLY — never
// affects the exit code, even in --strict: it's a smell to review, not a
// closed-set breach (the value carries no off-set token/color).
const inlineLayoutHacksFromMarkup = (markup) => {
  const hits = new Set();
  for (const m of markup.matchAll(/\sstyle\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)) {
    const val = (m[1] ?? m[2] ?? "").trim();
    if (/\b(?:padding|margin)\b/i.test(val)) hits.add(val.length > 60 ? val.slice(0, 57) + "…" : val);
  }
  return [...hits].sort();
};

let hardTotal = 0;
for (const file of files) {
  if (!existsSync(file)) {
    console.log(`\n● ${file}\n  ✗ file not found`);
    hardTotal++;
    continue;
  }
  const html = readFileSync(file, "utf8");
  const { markup, markupWithScripts, pageCss, authored, removedLayers } = authoredSurfaces(html);

  // Classes the file defines in its OWN <style> are allowed (page-local composition).
  const local = localClassesFromCss(pageCss);

  // 1. Classes used in markup — including JS-templated DOM (markupWithScripts).
  const used = usedClassesFromMarkup(markupWithScripts);
  const offSetClasses = [...used].filter((c) => !CLASSES.has(c) && !local.has(c)).sort();

  // 2. var(--x) refs must name a real token — unless the artifact defines that
  //    custom property itself (page-local CSS variable, allowed like a local class).
  const refs = tokenRefsFromAuthored(authored);
  const localTokens = locallyDefinedTokensFromHtml(html);
  const unknownTokens = [...refs].filter((t) => !TOKENS.has(t) && !localTokens.has(t)).sort();

  // 3. Hardcoded color literals (every brand color has a token). SVG uses
  //    stroke="currentColor", so any hex / raw color function is a literal.
  //    Scan CSS + attributes only — never text content (an order "#10482" is not a color).
  const hardColors = hardcodedColorsFromAuthored(colorScanSurface(markup, pageCss));

  // 4. Inline Lucide icons: unknown names always fail; altered paths fail in
  //    strict (warn otherwise); untagged icon-shaped svgs always warn.
  const icons = iconFindingsFromMarkup(markup);

  // 5. Structural table contracts. `.cell-tags` is a flex wrapper inside a cell;
  // placing it on <td>/<th> changes the browser's table layout and breaks row rules.
  // Scans raw `html` (not stripped markup) so JS-templated rows in <script> count too.
  const structure = structuralFindingsFromHtml(html);

  // 6. Native date/time inputs. `<input type="date|time|…">` bypasses the
  // date-picker family (.date-trigger); a closed-set breach. Scans raw `html` so
  // JS-templated inputs count too.
  const nativeDateInputs = nativeDateInputsFromHtml(html);

  // 7. Fused card stack: a wrapper with ≥2 direct `.card` children that resolves
  // to NO gap between them (no gap on the wrapper — foundation or page-local — and
  // no vertical margin on the cards). The cards collapse into one slab. A hard,
  // statically-decidable layout defect (the hand-rolled step/section wrapper that
  // forgot its `.stack--N` rhythm). Uses the static tree, so a JS-hidden wizard
  // step or inactive tab is checked too.
  const fusedCardStacks = findFusedCardStacks({ markup, css: `${FOUNDATION_CSS}\n${pageCss}` });

  // Advisory: inline padding/margin layout hacks (never affects exit code).
  const layoutHacks = inlineLayoutHacksFromMarkup(markup);

  // Advisory: a `.table-frame--flush` wrapped in a `.card` — two frame mechanisms
  // fight and the card's overflow:hidden defeats the flush frame's sticky propagation.
  const flushNesting = flushFrameNestingFromMarkup(markup);

  // Advisory: a search/filter control wired to run on change (principle 14 forbids it).
  // Scans the RAW html (scripts included), unlike the closed-set checks above.
  const searchOnChange = searchOnChangeFromHtml(html);

  // Advisory: spec-internal IDs (R-N / SM-N / P-N / TASK-*) in rendered UI copy.
  // markupWithScripts keeps JS-templated copy; HTML comments are already stripped
  // (the sanctioned `<!-- enforces …#R-1 -->` traceability channel is not flagged).
  const internalIds = internalIdsFromMarkup(markupWithScripts);

  // Advisory: app-shell chrome (a .theme-toggle) invented in a frameless page.
  const frameChrome = frameChromeFromMarkup(markupWithScripts);

  // Advisory: a native control used where a foundation component exists (range →
  // slider, progress/meter → progress). Scans the RAW html so JS-templated ones count.
  const nativeSkinnable = nativeSkinnableFromHtml(html);

  // Field caption contract + "forms use Field": HARD hint+error-both-visible, plus an
  // ADVISORY for a stacked control hand-rolled outside a Field / recognized host.
  const fieldFindings = fieldFindingsFromMarkup(markup);

  const hard =
    unknownTokens.length +
    hardColors.length +
    icons.unknown.length +
    structure.cellTagsOnTableCells.length +
    nativeDateInputs.length +
    fieldFindings.captionConflict.length +
    fusedCardStacks.length +
    (strict ? offSetClasses.length + icons.mismatch.length : 0);
  hardTotal += hard;

  console.log(`\n● ${file}`);
  console.log(`  foundation CSS: ${removedLayers.length ? `ignored ${removedLayers.join(", ")}` : "no inlined layer bodies found"}`);
  console.log(`  classes: ${used.size} used · ${offSetClasses.length} off-set (not foundation, not local)`);
  if (offSetClasses.length) {
    const marker = strict ? "✗" : "⚠ review:";
    console.log(`    ${marker} ${offSetClasses.join(", ")}`);
  }
  console.log(`  tokens:  ${refs.size} var(--…) refs · ${unknownTokens.length} unknown`);
  if (unknownTokens.length) console.log(`    ✗ not a foundation token: ${unknownTokens.map((t) => "--" + t).join(", ")}`);
  console.log(`  colors:  ${hardColors.length} hardcoded literal(s)`);
  if (hardColors.length) console.log(`    ✗ use a token, not a literal: ${hardColors.join(", ")}`);
  const iconBad = icons.unknown.length + icons.mismatch.length + icons.untagged;
  console.log(`  icons:   ${iconBad === 0 ? "ok" : `${iconBad} issue(s)`} (Lucide ${ICON_VERSION})`);
  if (icons.unknown.length)
    console.log(`    ✗ not a Lucide icon (run icon.mjs search): ${icons.unknown.join(", ")}`);
  if (icons.mismatch.length) {
    const marker = strict ? "✗" : "⚠ review:";
    console.log(`    ${marker} altered icon path — re-fetch with icon.mjs get: ${icons.mismatch.join(", ")}`);
  }
  if (icons.untagged)
    console.log(`    ⚠ review: ${icons.untagged} icon-shaped <svg> with no data-lucide (un-mappable to lucide-react)`);
  const structureBad = structure.cellTagsOnTableCells.length;
  console.log(`  structure: ${structureBad === 0 ? "ok" : `${structureBad} issue(s)`}`);
  if (structureBad)
    console.log(`    ✗ .cell-tags is a flex wrapper inside the table cell; do not put it on ${structure.cellTagsOnTableCells.join(", ")}`);
  console.log(`  date/time inputs: ${nativeDateInputs.length === 0 ? "ok" : `${nativeDateInputs.length} native input(s)`}`);
  if (nativeDateInputs.length)
    console.log(`    ✗ native browser date/time chrome bypasses the token skin — use the picker family (.date-trigger): ${nativeDateInputs.map((n) => `type="${n.type}" → ${n.picker}`).join(", ")}`);
  const captionBad = fieldFindings.captionConflict.length;
  console.log(`  field captions: ${captionBad === 0 ? "ok" : `${captionBad} issue(s)`}`);
  if (captionBad)
    console.log(`    ✗ .field shows a hint AND an error at once — they are mutually exclusive (field.md); hide one at rest (.is-hidden) and let the swap reveal it: ${fieldFindings.captionConflict.join(" · ")}`);
  console.log(`  block rhythm: ${fusedCardStacks.length === 0 ? "ok" : `${fusedCardStacks.length} fused card stack(s)`}`);
  if (fusedCardStacks.length)
    console.log(`    ✗ a wrapper stacks ${fusedCardStacks.map((f) => `${f.count} cards`).join(", ")} with no gap between them — the cards fuse into one slab; give the wrapper a rhythm (.stack--N / page-body / .tabs__content) instead of a bare block wrapper: ${fusedCardStacks.map((f) => f.label).join(" · ")}`);
  if (structure.chevronAsCell.length)
    console.log(`  ⚠ review: ${structure.chevronAsCell.length} .cell-chevron on a table cell — the chevron is no longer its own cell; move it inside the trailing .row-actions cell as the last child of .row-actions__inner, verbs first (data-table.md): ${structure.chevronAsCell.join(" · ")}`);
  if (layoutHacks.length)
    console.log(`  ⚠ review: ${layoutHacks.length} inline padding/margin style(s) — prefer a class (.stack--N / .card__content--flush / page-local): ${layoutHacks.join(" · ")}`);
  if (flushNesting.length)
    console.log(`  ⚠ review: ${flushNesting.length} .table-frame--flush inside a .card — the card owns the frame and its overflow:hidden traps the sticky header; make the list results card a standalone .table-frame--flush (patterns/list-page.md), or drop --flush for a plain table in a section card: ${flushNesting.join(" · ")}`);
  if (searchOnChange.length)
    console.log(`  ⚠ review: ${searchOnChange.length} search/filter wired on change — filtering must commit on the Search button / Enter, never on change (principle 14). Verify these edit a draft only, not run the query: ${searchOnChange.join(" · ")}`);
  if (internalIds.length)
    console.log(`  ⚠ review: ${internalIds.length} spec-internal id(s) in rendered copy — R-N/SM-N/P-N/TASK-* are traceability markers, not user-facing text; strip them (put traceability in an HTML comment): ${internalIds.join(", ")}`);
  if (frameChrome.length)
    console.log(`  ⚠ review: app-shell chrome in a frameless page — ${frameChrome.join(", ")} belongs in the full app-frame top bar, not a frameless business page; drop it (dark/light is verified by the visual pass's two renders)`);
  if (nativeSkinnable.length)
    console.log(`  ⚠ review: ${nativeSkinnable.length} native control(s) with a foundation equivalent — the native element skips the closed-set component; use it instead: ${nativeSkinnable.map((n) => `<${n.el}> → ${n.repl}`).join(", ")}`);
  if (fieldFindings.labelOutsideField.length)
    console.log(`  ⚠ review: ${fieldFindings.labelOutsideField.length} .label wired to a control but outside a Field — the hand-rolled form-row escape; the stacked label→control→caption anatomy belongs to the Field primitive (principle 5 · create-form.md · field.md). Wrap it in .field, or confirm this is a standalone label demo: ${fieldFindings.labelOutsideField.join(" · ")}`);
  const passText = strict
    ? "PASS (strict: no out-of-set tokens, hardcoded colors, or off-set classes)"
    : "PASS (no out-of-set tokens, no hardcoded colors)";
  console.log(`  → ${hard === 0 ? passText : `FAIL (${hard} hard violation(s))`}`);
}

console.log(`\n${hardTotal === 0 ? "✓ all clean" : `✗ ${hardTotal} hard violation(s)`}`);
process.exit(hardTotal === 0 ? 0 : 1);
