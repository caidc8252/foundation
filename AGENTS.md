# Building an artifact from this foundation — read this first

You are about to build a **same-brand artifact** (a self-contained HTML/CSS/JS
prototype) using `@cloud/foundation`. This file is the contract for doing that
correctly. The design law is in `governance/principles.md`; this is the operating
manual.

## What the foundation is — and is not

`@cloud/foundation` is a **normative design specification**: it states the rules
**in force**, in the present tense, as the settled law both consumers — the React
`@cloud/ui` app and self-contained artifacts — answer to. When a contract and an
implementation disagree, the **contract wins**.

It is **not** a development log, changelog, roadmap, or scratchpad. Write only what
**exists and is in force** — never `deferred` / `future` / "coming later" /
speculative entries. If a rule isn't real yet it does not belong here; add it when it
becomes real. (A *real, current* constraint — a primitive a pattern needs that does
not exist yet — is part of "what is" and is stated plainly; a speculative future
feature is not.)

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

Preferred path: start from a pattern example and let the builder make the
self-contained artifact:

```bash
node scripts/build-artifact.mjs --list
node scripts/build-artifact.mjs --pattern list-page --out artifacts/customers.html --title "Customers"
```

The builder copies the page inside `.app-frame__main`, wraps it in the frameless
full-width shell, inlines the three CSS layers in the correct
order, adds the frameless `[hidden]` guard, and runs
`check-artifact.mjs --strict` against the output. Use this before hand-editing;
then re-run the strict check after edits.

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

- **A frameless page is full-width — no max-width lock.** These artifacts are
  standalone functional pages with **no `.app-frame` chrome**; the content fills
  the viewport width (the `.artifact-shell` sets `width: 100%`, no `max-width`).
  **Height scrolls** — the page grows downward and the window scrolls.
  (`.app-frame` remains available when you instead want full production chrome —
  sidebar + header — see [`composites/app-frame.md`](composites/app-frame.md).)
- Dark mode is a `[data-theme="dark"]` toggle — never edit color values.
- **Every wrapper `div` must earn its place** — it exists to group spacing,
  establish a scroll/flex context, or constrain width. A wrapper with a single
  child whose classes could move onto that child is dead weight; drop it
  (`.card` / `.btn` / `.input` roots all accept a `class`).

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
2. **[`patterns/router.json`](patterns/router.json)** — the machine-readable
   intent router for AI generation. Use it to map a natural-language request to a
   catalog pattern and a `build-artifact` example (`builderPattern`). Example:
   "注册界面" / "sign up" routes to `create-form`; "客户管理" / "management table"
   routes to `list-page`.
3. **[`composites/schema.json`](composites/schema.json)** — the machine-readable
   composite plan surface for AI generation. Use it after choosing a pattern to
   decide which composites to configure, which slots are required, which slots
   are optional, and which class names are legal for that composite. The schema
   does not replace contracts; it keeps AI planning aligned with them.
4. **The contract** (`primitives/<x>.md` · `composites/<x>.md` · `patterns/<x>.md`)
   — anatomy, rules, states, and the exact "Artifact" class recipe. The contract
   wins over any implementation.
5. **The example** (`patterns/<x>.html`) — copy it and edit the markup.

AI generation flow:

1. Interpret the user's request with `patterns/router.json` and choose one route.
2. Run `build-artifact.mjs` with the route's `builderPattern`.
3. Read the route's pattern contract/example for ordering and required core.
4. Read `composites/schema.json` for the composites used by that route.
5. Configure each composite through its required/optional slots.
6. Edit the generated artifact, then run `check-artifact.mjs --strict`.

## Check your work

```bash
node scripts/check-artifact.mjs path/to/your-artifact.html
```

Run it against the shipped artifact directly — even when the three foundation CSS
layers are inlined. The checker ignores those known layer bodies and scans only
the authored markup/page-local CSS for drift.

For AI-generated pages, use the strict gate:

```bash
node scripts/check-artifact.mjs --strict path/to/your-artifact.html
```

Reports anything outside the closed set: hardcoded colors, unknown `var(--…)`
tokens, and classes that are neither foundation nor locally defined. In default
mode, off-set classes are review warnings; in `--strict`, they fail the check.
This is the runnable form of the `governance/enforcement.md` checklist.
