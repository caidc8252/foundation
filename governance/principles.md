# Design law (shared)

The rules that hold in **both** consumers — the Next.js app (`@cloud/ui`) and
artifact-design prototypes. Consumer-specific *enforcement* (which tool catches
a violation) is in `enforcement.md`; this file is the law itself.

## 1. Everything derives from tokens

No raw color, size, radius, shadow, duration, or font value may be hand-written
anywhere. Use a token (`var(--color-…)`, `var(--radius-…)`, …) or — on the Next
side — a utility generated from a token (`bg-primary`, `text-content-secondary`).

- A hex literal, `rgb(...)`, `px` font size, or arbitrary `rounded-[7px]` is a defect.
- 1px hairlines (`border`), `border-0`, `size-px` are conventional utilities, exempt.
- Need a value no token expresses? Stop. Follow `token-change.md` — do not hardcode.

## 2. Tokens are the single source of truth — and they live in one place

Token VALUES exist only in `foundation/tokens/*.css`. Neither consumer redefines
them. The Next app imports the `@theme` source; artifacts inline the emitted
`release/tokens.inline.css`. Two copies of a value is the failure mode this whole
foundation exists to prevent.

## 3. Semantic names over raw ramps

Reach for the semantic token, not the ramp step it points at:
`text-content-secondary` not `text-…-600`; `bg-success-bg` not `bg-…-50`;
`border-line-default` not a specific gray. Semantic names survive a re-theme;
ramp steps don't.

## 4. The type scale is closed

Font sizes snap to `--text-{xs…5xl}`. There is no `text-[15px]`. Same for the
control-height (`control-*`), spacing (`cx-*`, `space-*`), radius, and shadow
ladders. The scales are the design; off-scale values read as accidents.

## 5. The component contract is authoritative — atoms and composites alike

A component's variants/sizes/states/anatomy are defined once: primitives in
`foundation/primitives/<name>.md`, composites in `foundation/composites/<name>.md`.
Both implementations answer to it: the `@cloud/ui` React component and the
artifact-side reference CSS (`primitives.css` / `composites.css`). When an
implementation diverges from the contract, the implementation is the bug.
Don't re-skin to fake a new variant — propose the variant to the contract first.

**Composites are the assembly unit, patterns are the recipe.** A reusable
building block (page-body, page-header, data-table, the list-filter family,
pagination, empty-state, skeleton) is a *composite* with its own contract — not a
slice of a pattern. A page is assembled by choosing composites; the **pattern**
(L3) fixes which composites appear and in what order. So a recurring part
(page-body and page-header show up in list, detail, and create) lives **once** as
a composite, never duplicated into each pattern. Don't subdivide patterns into "header + table" — that pushes
granularity to the wrong layer and forfeits the pattern's ordering guarantee.

## 6. `page-body` children are full-width by default

The `page-body` composite provides gutters and vertical stack spacing; it does
**not** constrain or center the page's content column — that is the app shell's
job. Every direct child of `page-body` (step indicator, table card, columns row,
nav row, overview grid, …) fills the full available width the shell allows.

- **Never** apply a `max-width` + `margin-inline: auto` centering wrapper to a
  layout-structural slot inside `page-body`. Width is the shell's responsibility.
- An **individual content element** (e.g. a narrow single-step form card) may
  constrain its own width as a content-level choice — but the layout column it
  lives in still fills full width. The constraint belongs on the element, not on
  a structural wrapper.
- Violating this causes the pattern to silently diverge from the production page,
  where the shell already controls the content width.

## 7. The four layers, and what crosses the consumer boundary

| Layer | Shared substance (in foundation) | Stays consumer-specific |
|---|---|---|
| **Tokens** | the values | — |
| **Primitives** | contract + reference CSS | React impl (Next) / bespoke HTML (artifact) |
| **Composites** | contract + reference CSS | React impl (Next) / bespoke HTML (artifact) |
| **Patterns** | named archetype structure | the actual page implementations |
| **Governance** | this law + token process | the enforcement mechanism (lint vs checklist) |

Below tokens, consumers share *contracts*, never *code*. That is by design:
React+Tailwind and self-contained HTML cannot share components — but they can,
and must, share the same design truth.

**Low-level interaction & accessibility are realized downstream, not in the
artifact skin.** The artifact-side reference CSS is a **static skin** whose job is
to make a prototype communicate *business interaction and flow*; the runtime
behaviour and the fine-grained interaction/a11y layer are added when the prototype
is translated into `@cloud/ui`. The following are therefore **deliberately the
`@cloud/ui` consumer's responsibility**, and their absence from the reference CSS
or an artifact is **not a defect** (do not "fix" them in the skin, and audits
should not flag them):

- keyboard focus rings (`:focus-visible`) and their exact ring geometry;
- ARIA wiring (`aria-describedby` / `aria-required` / `role` associations, live regions);
- disabled-state interaction guards (e.g. suppressing `:hover` on a disabled control);
- `prefers-reduced-motion` handling of transitions/animations.

What the skin *is* responsible for: token-only values, the documented
variants/sizes and the **visible business states** (empty / loading / error /
selected / disabled), and cross-screen consistency. A missing *visible business
state* is a real gap; a missing *interaction-polish behaviour* is not.

## 8. Same-brand scope

This foundation encodes ONE brand (the product design system). Sharing tokens
across the prototype→production boundary is correct precisely because both sides
are the same product. It is **not** a generic theme for off-brand work — an
artifact that wants a deliberately different identity should not consume these
tokens; it forks its own. (See the project decision: same-brand pipeline.)

## 9. Patterns are frameworks — a minimal required core, everything else optional

A pattern (L3) is a **framework**, not a filled-in page. It guarantees *structure
and ordering* — which slots exist and in what sequence — never that every slot is
present. Each pattern declares a **minimal required core**: the few slots without
which the screen stops being that screen. Every other slot is **optional**,
included only when this page's job calls for it.

- Each pattern's contract declares its required core in a "required core /
  optional slots" table; that table is the authoritative split. Today:
  - **list** — required: `page-header` + results card (count bar · table ·
    pagination); optional: status banner, segment tabs, condition band
    (search/filter), metric strip, row peek-drawer.
  - **detail** — required: detail-head (identity/title) + body (overview *or*
    tabs); optional: back button, status, meta, actions, right rail, banner.
  - **create-form** — required: sticky header + ≥1 `form-section` (with fields);
    optional: status banner, file-upload, extra sections, description.
  - **create-wizard** — required: header + step indicator + step body + nav
    (Back/Continue); optional: summary rail, done state.
- **A populated example is not a checklist.** Each `*.html` example shows one
  fully-dressed instance; copying it does not mean keeping every slot. Optional
  slots are marked removable in the example and listed as optional in the contract.
- **At most one primary action — never a required one** (see `page-header` /
  `detail-header`). A read-only page may have none.

## 10. Semantic color has a scope

Color carries meaning here; spend it on meaning, not decoration.

- **Status colors** (`success` / `warning` / `error` / `info`, with their `-bg` /
  `-strong`) appear only on status carriers — `badge`, inline validation, alerts.
  Never a page or card background wash, never decorative.
- A `badge`'s semantic `tone` encodes **only** status or severity. Informational /
  category / plain-display fields (plan tier, type, category, a bare label) use
  `tone="neutral"` — never borrow a semantic tone, or a categorical chart color,
  to tint or distinguish a non-status field.
- `accent-*` is for data-visualization emphasis and AI markers only — never a
  button surface or an ordinary status.
- No gradients or decorative background images on application screens. Dark mode
  comes only from the `[data-theme="dark"]` same-name variables (principle 2),
  never a hand-tuned color.

## 11. Typography is functional

Beyond the closed scale (principle 4), weight and family carry rules too:

- Weight is limited to `400` / `500` / `600`. `700` is rare emphasis; `300` /
  `800` / `900` are off-system.
- **Data-readable text** — identifiers, timestamps, amounts, counts, versions —
  uses `font-mono` + `tabular-nums` so digits align and codes read unambiguously.
  Prose and labels use the sans family.

## 12. Rows align on a shared baseline

Within a row — a table row, list item, header band, detail-head — the leading
label/title and the trailing actions sit on one horizontal centerline. Exception:
when the leading content is genuinely multi-line (title + sub-line + meta), the
trailing actions align to the **first** line, not the block center.

## 13. Spacing rhythm — the nesting ladder

Block-to-block spacing is part of the design, not a per-page guess. Page-level
rhythm and slot padding are **provided** — `page-body` stacks its direct children,
`card` slots own their padding; never hand-write those. What you compose by hand
is the gap **between** the blocks/cards you stack, chosen by nesting tightness from
this ladder (deeper nesting = tighter). Only `--space-*` steps — never an arbitrary
value, and **never `p-0` / `m-0` to fake spacing** (flush a slot with its `flush`
modifier, e.g. `.card__content--flush`).

| between | token |
|---|---|
| `page-body` direct children (cards / bands / rows) | `space-6` (24px) — auto by `page-body` |
| sibling block-cards you stack yourself (tab panel, wrapper) | `space-5` (20px) |
| condition band ↔ list card | `space-4` (16px) sticky · `space-6` (24px) short / embedded |
| main card ↔ a tightly-bound sub-card | 14px (React `gap-3.5`; no raw token — artifacts approximate) |
| **in-card stacked elements** (header ↔ alert ↔ body ↔ sub-section) | **`space-3` (12px)** |
| stat-card grid | `space-3` (12px) |
| tight pair (title ↔ description, label ↔ control) | `space-1` / `space-2` (4 / 8px) |

- **Compose stacked blocks with the `.stack` / `.stack--N` utility** (`flex-col` +
  the rung's gap): `.stack--5` for sibling cards, `.stack--3` for in-card elements.
  A stacked group then never falls back to 0-gap — spacing is a composition choice,
  not a margin you can forget.
- **Two stacked blocks never touch.** A 0-gap stack (or a `p-0` hack to flush a slot)
  is a defect: the checker warns on inline `style` padding/margin hacks, and review
  fails any two blocks that touch.

(This is the canonical home for the portal spacing system; the standalone
`docs/protal-page-style-spec.md` §3 is being folded in here.)

## 14. Filtering commits on an explicit action — never on change

Wherever the **list-filter family** (search input · quick filters · advanced) appears
— a list page, a table **inside a detail-page tab**, a picker, any filtered collection
— editing a filter only builds a **draft**. Typing in the search field or changing a
quick filter runs **nothing**; the query commits only when the user acts — the **Search
button**, or **Enter** in the search field — which applies the whole draft and resets
to page 1. **Search-on-change / search-as-you-type / filter-on-select is a defect.**

- The sole exception is editing the *already-applied* query: removing a chip (✕) or
  **Clear all** re-runs immediately with no Search click — the user is trimming a
  committed query, not typing a new draft.
- This is a **business-flow** rule, not interaction polish (contrast principle 7): the
  draft→applied model changes how filtering reads and behaves, so the prototype must
  honor it — it is not a downstream `@cloud/ui` concern to defer.
- **Global scope, not the list pattern's.** The family carries this rule everywhere it
  is embedded; lists tucked under **detail-page tabs** are where it is missed most —
  which is exactly why the law lives here, not only in `patterns/list-page.md`.

Mechanics live in the composite: `composites/list-filter.md` (Rules). Enforcement: the
static artifact checker cannot *reliably* see this — behavior isn't in the closed set,
and a draft update (allowed) reads the same as a query run (a defect). `check-artifact`
emits a **best-effort advisory** flagging the obvious on-change wiring, but the
authoritative catch is the review-gate item in `enforcement.md`; on the `@cloud/ui`
side it is an ESLint target.
