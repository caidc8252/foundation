/* ─────────────────────────────────────────────────────────────
   Foundation · block-rhythm check (fused card stack)

   Catches the recurring "hand-rolled wrapper forgot the vertical gap" bug:
   a container with two or more DIRECT `.card` children that resolves to NO
   gap between them — the wrapper carries no `gap` (and is not one of the
   foundation rhythm containers: page-body / tabs__content / stack--N), and the
   cards carry no vertical margin either. The cards fuse into one slab.

   Why this and not a form check. "Correct vertical rhythm" has MANY equivalent
   forms — `.stack--N`, `.page-body`, a tab panel, a hand-rolled
   `flex-direction:column; gap:var(--space-N)`, adjacent-sibling margins — so
   policing the wrapper's FORM (e.g. "don't hand-roll a stack") false-positives
   across the whole equivalence class (a hand-rolled flex+gap wrapper is a
   working stack). The only form-agnostic signal is the OUTCOME: do these two
   card siblings end up with a gap or not. This check approximates that outcome
   statically — it asks whether ANY gap source resolves for the pair, in any
   form, and flags only the genuine 0-source case.

   Static, no rendering: it sees the whole authored DOM including subtrees a
   render would leave `hidden` (a JS-toggled wizard step, an inactive tab), which
   is exactly where the bug hides. It does NOT see card groups a script BUILDS at
   runtime (those live in <script>, not the static tree) — that residual is left
   for a rendered-layout pass.
   ───────────────────────────────────────────────────────────── */

const VOID = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

const stripCssComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, " ");

// ── Minimal element tree ──────────────────────────────────────────────
// Enough to know each element's tag, classes, and DIRECT element children.
// Text, comments, scripts, and styles are assumed already stripped by the
// caller (check-artifact's `markup`). Tolerant of mismatched close tags: a
// close pops up to the nearest matching open, so one stray tag can't corrupt
// the whole tree.
const classesOf = (attrs) => {
  const set = new Set();
  const m = /\sclass\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(attrs);
  if (m) for (const c of (m[1] ?? m[2] ?? "").split(/\s+/)) if (c) set.add(c);
  return set;
};

// An element the at-rest DOM does not render: a `hidden` attribute, an
// `.is-hidden`/`.hidden` class, or an inline `display:none`. Mutually-exclusive
// siblings (a wizard step, an inactive tab panel) are hidden this way, so only
// one shows at a time — they never fuse and must not count toward a stack.
const isHidden = (attrs, classes) =>
  /\shidden(\s|=|>|$)/i.test(attrs) ||
  classes.has("is-hidden") ||
  classes.has("hidden") ||
  /\sstyle\s*=\s*(?:"[^"]*|'[^']*)\bdisplay\s*:\s*none/i.test(attrs);

export const parseTree = (markup) => {
  const root = { tag: "#root", classes: new Set(), children: [], parent: null };
  let cur = root;
  const tagRe = /<(\/?)([A-Za-z][A-Za-z0-9:-]*)((?:\s[^<>]*)?)>/g;
  let m;
  while ((m = tagRe.exec(markup))) {
    const [, slash, rawName, attrs] = m;
    const tag = rawName.toLowerCase();
    if (slash) {
      let n = cur;
      while (n && n !== root && n.tag !== tag) n = n.parent;
      if (n && n !== root) cur = n.parent;
      continue;
    }
    const classes = classesOf(attrs);
    const node = { tag, classes, children: [], parent: cur, hidden: isHidden(attrs, classes) };
    cur.children.push(node);
    const selfClose = /\/\s*$/.test(attrs);
    if (!VOID.has(tag) && !selfClose) cur = node;
  }
  return root;
};

// ── Minimal CSS rule model ────────────────────────────────────────────
// Pulls (selectorList, declarationBody) pairs. `[^{}]+` can't cross a brace,
// so a rule nested in `@media(...){ … }` is captured with its own selector and
// the at-rule prelude is skipped — good enough for one level of nesting.
const eachRule = (css, cb) => {
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(stripCssComments(css)))) {
    const sel = m[1].trim();
    if (!sel || sel.startsWith("@")) continue;
    for (const one of sel.split(",")) cb(one.trim(), m[2]);
  }
};

const isZero = (v) => /^(0(px|rem|em|%)?|var\(--space-0\))$/.test(v.trim());

// The rightmost compound of a selector — the element the rule actually targets.
// "`.page-body > .tabs__content`" → "`.tabs__content`"; "`.card + .card`" →
// "`.card`". Combinators split the selector; the last piece is the subject.
const rightmostCompound = (selector) =>
  selector.trim().split(/\s*[>+~]\s*|\s+/).pop() ?? "";

const classesInCompound = (compound) =>
  [...compound.matchAll(/\.(-?[A-Za-z_][\w-]*)/g)].map((x) => x[1]);

const declHasGap = (body) => {
  const m = /(?:^|;)\s*(?:row-)?gap\s*:\s*([^;]+)/i.exec(body);
  return Boolean(m) && !isZero(m[1]);
};

// A vertical margin in a declaration body: any of margin-top / -bottom /
// -block / -block-start / -block-end, or the `margin` shorthand whose vertical
// component (top/bottom) is non-zero.
const declHasVerticalMargin = (body) => {
  for (const m of body.matchAll(/(?:^|;)\s*margin-(top|bottom|block|block-start|block-end)\s*:\s*([^;]+)/gi)) {
    if (!isZero(m[2])) return true;
  }
  const sh = /(?:^|;)\s*margin\s*:\s*([^;]+)/i.exec(body);
  if (sh) {
    const parts = sh[1].trim().split(/\s+/);
    const top = parts[0];
    const bottom = parts.length >= 3 ? parts[2] : parts[0];
    if ((top && !isZero(top)) || (bottom && !isZero(bottom))) return true;
  }
  return false;
};

// Build the two predicates the walk needs from all CSS (foundation + page).
const buildResolvers = (css) => {
  const gapClasses = new Set();      // classes whose rule sets a non-zero gap
  let cardHasMargin = false;         // any rule gives a `.card` a vertical margin
  let siblingMargin = false;         // any `… + …` / `… ~ …` rule sets a vertical margin
  eachRule(css, (selector, body) => {
    const compound = rightmostCompound(selector);
    const classes = classesInCompound(compound);
    if (declHasGap(body)) for (const c of classes) gapClasses.add(c);
    if (declHasVerticalMargin(body)) {
      if (classes.includes("card")) cardHasMargin = true;
      if (/[+~]/.test(selector)) siblingMargin = true;
    }
  });
  return { gapClasses, cardHasMargin, siblingMargin };
};

const label = (node) => {
  const cls = [...node.classes];
  return cls.length ? `${node.tag}.${cls.join(".")}` : `<${node.tag}>`;
};

/**
 * @param {{markup: string, css: string}} input
 *   markup — authored DOM (scripts/styles/comments stripped, as check-artifact's `markup`)
 *   css    — foundation layers + page-local CSS concatenated
 * @returns {{label: string, count: number}[]} one entry per fused card stack
 */
export const findFusedCardStacks = ({ markup, css }) => {
  const { gapClasses, cardHasMargin, siblingMargin } = buildResolvers(css);
  const root = parseTree(markup);
  const out = [];
  const visit = (node) => {
    // Only cards that render at rest can fuse — a hidden step / inactive tab does not.
    const cardKids = node.children.filter((c) => c.classes.has("card") && !c.hidden);
    if (cardKids.length >= 2) {
      const wrapperHasGap = [...node.classes].some((c) => gapClasses.has(c));
      if (!wrapperHasGap && !cardHasMargin && !siblingMargin) {
        out.push({ label: label(node), count: cardKids.length });
      }
    }
    for (const c of node.children) visit(c);
  };
  visit(root);
  return out;
};
