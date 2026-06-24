# Building an artifact from this foundation — read this first

You are about to build a **same-brand artifact** (a self-contained HTML/CSS/JS
prototype) using `@cloud/foundation`. This file is the contract for doing that
correctly. The design law is in `governance/principles.md`; this is the operating
manual.

## The closed set — you may use ONLY these four layers

There is **no fifth source**. Everything an artifact renders comes from here:

| # | Layer | Lives in | What you take |
|---|---|---|---|
| ① | **Tokens** | `dist/tokens.inline.css` | the `--*` custom properties (color, space, text, radius, shadow, …) |
| ② | **Primitives** | `primitives/primitives.css` | the atom classes (`.btn`, `.input`, `.badge`, `.field`, …) |
| ③ | **Composites** | `composites/composites.css` | the page-building-block classes (`.page-header`, `.data-table`, `.summary-bar`, …) |
| ④ | **Patterns** | `patterns/*.md` (+ `.html`) | the named screen archetypes (list / detail / create-form) |

**The legal names are enumerated in [`dist/catalog.md`](dist/catalog.md)** (human)
and **[`dist/catalog.json`](dist/catalog.json)** (machine). If a token name, a
class, or a pattern is not in the catalog, **it is not part of this system.**

## The rule

> Use a token / primitive class / composite class for **everything they cover**.
> Do **not** hardcode a hex or px where a token exists, and do **not** hand-roll a
> component that already has a class.
>
> Need something the set can't express? That's a **contract gap, not a license to
> improvise** → propose it: `governance/token-change.md` for a token, a
> primitive/composite contract PR for a component. Forking a value on the artifact
> side recreates the drift this foundation exists to remove.

The one allowed local addition: **page-level composition** — a few helper classes
in the artifact's own `<style>` that arrange *cell content / layout* (e.g. a
two-line table cell), built **only from tokens**. That is layout glue, not new
design vocabulary. The examples in `patterns/*.html` show the line.

## How to assemble the page

Inline the three CSS layers into one `<style>`, **in this order** (composites
reuse `.btn`/`.input`, so primitives must come first):

```html
<style>
  /* 1 · paste dist/tokens.inline.css   — token values   */
  /* 2 · paste primitives/primitives.css — atoms          */
  /* 3 · paste composites/composites.css — building blocks */
</style>
```

(Working **inside this repo**, the `patterns/*.html` examples instead `<link>`
those same files so edits flow through live — see the README. For a shipped
artifact, inline them: CSP blocks external fetches.)

- **A frameless page MUST hard-lock its width — never full-bleed.** These
  artifacts are standalone functional pages with **no `.app-frame` chrome**. So
  the content doesn't run edge-to-edge (which previews badly and overstates the
  real reading width), cap the page and center it: `max-width: 1672px` — the
  production content width, a **`1920px` viewport minus the `248px` sidebar**
  (`SIDEBAR_WIDTH`) — plus `margin-inline: auto`. **Width is fixed; height
  scrolls** — the page grows downward and the window scrolls. The width lock is
  non-negotiable; the height is free. (`.app-frame` remains available when
  you instead want full production chrome — sidebar + header — see
  [`composites/app-frame.md`](composites/app-frame.md); but the default for a
  functional page is frameless + locked width.)
- Dark mode is a `[data-theme="dark"]` toggle — never edit color values.

## Two traps in a frameless page

Frameless, the page has no `.app-frame__main` scroll root and no guaranteed
`display:none` for hidden nodes. Two things bite silently:

- **Sticky needs a scroll root.** `--sticky-head` / `summary-bar--sticky` /
  `page-header--sticky` pin to the nearest scrolling ancestor — frameless that is
  the window, and `.table-scroll` only scrolls sideways. An offset (`top:`) meant
  to dock a header under a sticky bar then leaves an empty band or hides the first
  row. Fix: keep sticky `top: 0` (or drop the `--sticky*` modifiers entirely), or
  wrap content in your own `overflow-y:auto` scroll root.
- **`[hidden]` can't hide a `.card`.** The UA `[hidden]{display:none}` rule loses
  to `.card`'s own `display:flex` (same for `.tabs__content` / any composite with
  an explicit `display`). So toggling a wizard step or tab panel via the `hidden`
  attribute shows them all at once. Fix: add one guard to your page-local
  `<style>` — `[hidden]{display:none!important}` — or toggle a display class
  instead of the attribute.

Both fixes are page-local composition (a wrapper + one reset line), not new design
vocabulary — they stay inside the closed set.

## Find what you need — fast

1. **[`dist/catalog.md`](dist/catalog.md)** — one row per primitive/composite/
   pattern: what it's for, its classes, and links to its **contract** (`.md`) and,
   for patterns, a copyable **example** (`.html`). Start here.
2. **The contract** (`primitives/<x>.md` · `composites/<x>.md` · `patterns/<x>.md`)
   — anatomy, rules, states, and the exact "Artifact" class recipe. The contract
   wins over any implementation.
3. **The example** (`patterns/<x>.html`) — copy it and edit the markup.

## Check your work

```bash
node scripts/check-artifact.mjs path/to/your-artifact.html
```

Reports anything outside the closed set: hardcoded colors, unknown `var(--…)`
tokens, and classes that are neither foundation nor locally defined. This is the
runnable form of the `governance/enforcement.md` checklist.
