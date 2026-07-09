# Design law (shared)

The rules that hold in **both** consumers — the Next.js app (`@cloud/ui`) and
artifact-design prototypes. Consumer-specific *enforcement* (which tool catches
a violation) is in `enforcement.md`; this file is the law itself.

## How to read this file

Every rule opens with a one-line **invariant** tagged `**Tier** · consumer · caught-by`:

- **Tier.** `Law` — violate = fail, a hard gate. `Default` — the resting choice;
  deviate only for a stated reason the task forces. `Boundary` — defines what is in
  scope / what is *not* a defect; it draws a line, it is not a pass/fail gate.
- **Consumer.** `both` · `artifact` (bites self-contained HTML) · `next` (`@cloud/ui`).
- **Caught by.** `mechanical` (eslint / `check-artifact` — fails the build) · `review`
  (a review-gate eye) · `advisory` (`check-artifact` best-effort ⚠). The authoritative
  mechanism lives in `enforcement.md`, not here — this file states the law, not the catch.

The invariant is the scannable law; the prose, tables, and code beneath it are the
load-bearing exposition — read them before applying. Rules are referenced by number
(`principle 14`); the split rules keep their number with an `a`/`b` suffix (`9a`, `11b`).

## Index

| # | Rule | Tier | Consumer | Caught by |
|---|---|---|---|---|
| 1 | Everything derives from tokens | Law | both | mechanical |
| 2 | Tokens are the single source of truth | Law | both | mechanical |
| 3 | Semantic names over raw ramps | Default | both | review |
| 4 | The type scale is closed | Law | both | mechanical |
| 5 | The component contract is authoritative | Law | both | review |
| 6 | `page-body` children are full-width | Law | both | review |
| 7 | Four layers · what crosses the boundary | Boundary | both | — |
| 8 | Same-brand scope | Boundary | both | — |
| 9a | Patterns are frameworks — required core | Boundary | both | review |
| 9b | At most one primary action | Law | both | review |
| 10 | Semantic color has a scope | Law | both | review |
| 11a | Weight is a closed set | Law | both | mechanical + review |
| 11b | Data-readable text uses mono | Default | both | review |
| 12 | Rows align on a shared baseline | Law | both | review |
| 13 | Spacing rhythm — the nesting ladder | Law | both | review |
| 14 | Filtering commits on an explicit action | Law | both | review + advisory |
| 15 | Default to the `md` size | Default | both | review |
| 16 | A committed state outranks hover | Law | artifact | review |
| 17 | No floating popup in an overflow ancestor | Law | artifact | review |

## 1. Everything derives from tokens

> **Law** · both · mechanical — no raw color, size, radius, shadow, duration, or font
> value is ever hand-written anywhere; every such value is a token (or, on Next, a
> token-generated utility). Violate = fail.

No raw color, size, radius, shadow, duration, or font value may be hand-written
anywhere. Use a token (`var(--color-…)`, `var(--radius-…)`, …) or — on the Next
side — a utility generated from a token (`bg-primary`, `text-content-secondary`).

- A hex literal, `rgb(...)`, `px` font size, or arbitrary `rounded-[7px]` is a defect.
- 1px hairlines (`border`), `border-0`, `size-px` are conventional utilities, exempt.
- Need a value no token expresses? Stop. Follow `token-change.md` — do not hardcode.

## 2. Tokens are the single source of truth — and they live in one place

> **Law** · both · mechanical — token *values* exist only in `foundation/tokens/*.css`;
> neither consumer redefines them. Two copies of a value is the failure this foundation
> exists to prevent.

Token VALUES exist only in `foundation/tokens/*.css`. Neither consumer redefines
them. The Next app imports the `@theme` source; artifacts inline the emitted
`release/tokens.inline.css`. Two copies of a value is the failure mode this whole
foundation exists to prevent.

## 3. Semantic names over raw ramps

> **Default** · both · review — reach for the semantic token, not the ramp step it
> points at; semantic names survive a re-theme. A raw ramp step is a review nudge, not
> a build failure.

Reach for the semantic token, not the ramp step it points at:
`text-content-secondary` not `text-…-600`; `bg-success-bg` not `bg-…-50`;
`border-line-default` not a specific gray. Semantic names survive a re-theme;
ramp steps don't.

## 4. The type scale is closed

> **Law** · both · mechanical — font size, spacing, radius, shadow, control-height, and
> stacking snap to their closed ladders; there is no off-scale value (`text-[15px]`).
> Violate = fail.

Font sizes snap to `--text-{xs…5xl}`. There is no `text-[15px]`. Same for the
control-height (`control-*`), spacing (`cx-*`, `space-*`), radius, and shadow
ladders. The scales are the design; off-scale values read as accidents.

`z-index` snaps to the `--z-*` ladder in `tokens/elevation.css`; a bare number is
an off-scale value like any other. The ladder has two tiers, and picking from the
wrong one is the defect it exists to catch: `--z-behind/base/raised` order siblings
**inside one stacking context**, while `--z-sticky/dialog/popover/tooltip/toast` are
the **cross-component** contract for surfaces that escape their parent. To lift a
thing above its neighbours, reach for `--z-raised` — never a big number "to be safe",
which is how a nub or an input slot quietly outranks the dialog layer.

## 5. The component contract is authoritative — atoms and composites alike

> **Law** · both · review — a component's variants/sizes/states/anatomy live once in
> its contract; when an implementation diverges, the implementation is the bug. Don't
> re-skin to fake a variant — propose it to the contract first.

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

> **Law** · both · review — never wrap a layout-structural slot inside `page-body` in a
> `max-width` + `margin-inline:auto` centering wrapper; width is the shell's job. (An
> individual content element may still cap its *own* width.)

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

> **Boundary** · both — below tokens, consumers share *contracts*, never *code*; and the
> downstream interaction/a11y layer (focus rings, ARIA wiring, disabled-hover guards,
> reduced-motion) is the `@cloud/ui` consumer's job — its absence from an artifact skin
> is **not** a defect.

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

> **Boundary** · both — this foundation encodes ONE brand; sharing tokens across
> prototype→production is correct because both sides are the same product. Off-brand
> work forks its own tokens, it does not consume these.

This foundation encodes ONE brand (the product design system). Sharing tokens
across the prototype→production boundary is correct precisely because both sides
are the same product. It is **not** a generic theme for off-brand work — an
artifact that wants a deliberately different identity should not consume these
tokens; it forks its own. (See the project decision: same-brand pipeline.)

## 9. Patterns are frameworks

### 9a. A minimal required core, everything else optional

> **Boundary** · both · review — a pattern guarantees *structure and ordering* (which
> slots exist, in what sequence), never that every slot is filled; each declares a
> minimal required core, the rest optional. A populated example is not a checklist.

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

### 9b. At most one primary action — never a required one

> **Law** · both · review — a screen carries at most one primary action, and never a
> *required* one; a read-only page may have none.

**At most one primary action — never a required one** (see `page-header` /
`detail-header`). A read-only page may have none.

## 10. Semantic color has a scope

> **Law** · both · review — status colors ride only status carriers (badge / inline
> validation / alert), never a page or card background wash; a badge's semantic tone
> encodes only status/severity; `accent-*` is data-viz / AI-marker only; no gradients
> on application screens.

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

### 11a. Weight is a closed set

> **Law** · both · mechanical + review — weight is limited to `400` / `500` /
> `600`; `700` is rare emphasis, `300` / `800` / `900` are off-system.

Weight is limited to `--font-weight-normal` (`400`), `--font-weight-medium`
(`500`), and `--font-weight-semibold` (`600`). `--font-weight-bold` (`700`) is
rare emphasis; `300` / `800` / `900` are off-system.

Line-height follows the closed `--line-height-*` ladder (`none`, `tight`,
`snug`, `compact`, `normal`, `relaxed`) for the same reason: typography rhythm
is part of the system, not a per-page number.

### 11b. Data-readable text uses `font-mono` + `tabular-nums`

> **Default** · both · review — data-readable text (identifiers, timestamps, amounts,
> counts, versions) uses `font-mono` + `tabular-nums` so digits align; prose and labels
> use the sans family.

**Data-readable text** — identifiers, timestamps, amounts, counts, versions —
uses `font-mono` + `tabular-nums` so digits align and codes read unambiguously.
Prose and labels use the sans family.

## 12. Rows align on a shared baseline

> **Law** · both · review — within a row, the leading label/title and the trailing
> actions sit on one horizontal centerline. (Exception: genuinely multi-line leading
> content aligns the actions to its *first* line.)

Within a row — a table row, list item, header band, detail-head — the leading
label/title and the trailing actions sit on one horizontal centerline. Exception:
when the leading content is genuinely multi-line (title + sub-line + meta), the
trailing actions align to the **first** line, not the block center.

## 13. Spacing rhythm — the nesting ladder

> **Law** · both · review — block-to-block spacing comes only from `--space-*` steps
> chosen by nesting tightness; never an arbitrary value, never `p-0` / `m-0` to fake
> spacing, and never a 0-gap stack — two stacked blocks never touch.

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
| tab content docked in `page-body` (the active panel's sections) | `space-6` (24px) — auto by the panel; **not** a rung down |
| sibling block-cards inside a hand-authored wrapper / sub-group | `space-5` (20px) |
| condition band ↔ results region (list card / product grid) | `space-4` (16px) — bind the two in a `.stack--4` wrapper |
| main card ↔ a tightly-bound sub-card | 14px (React `gap-3.5`; no raw token — artifacts approximate) |
| **in-card stacked elements** (header ↔ alert ↔ body ↔ sub-section) | **`space-3` (12px)** |
| stat-card grid | `space-3` (12px) |
| tight pair (title ↔ description, label ↔ control) | `space-1` / `space-2` (4 / 8px) |

- **Compose stacked blocks with the `.stack` / `.stack--N` utility** (`flex-col` +
  the rung's gap): `.stack--3` for in-card elements, `.stack--4` to bind a condition
  band to its results region (list card or product grid), `.stack--5` for a
  hand-authored sub-group of sibling cards inside a wrapper. A stacked group then
  never falls back to 0-gap — spacing is a composition choice, not a margin you can
  forget. The bound condition↔results unit is then ONE block in `page-body`'s
  `space-6` rhythm — the tight `space-4` lives only inside the wrapper.
- **A tab panel is navigation, not nesting.** Tab content docked in `page-body`
  stands in for page-body's content slot — it draws no frame, so it is not a level
  of visual nesting and does **not** drop a rung. The panel PROVIDES its sections'
  rhythm at `space-6` (same as page-body's direct children, `.page-body > .tabs__content`
  in the artifact skin), so a detail tab's sections read at the same rhythm whether
  or not the record uses tabs — and never hand-roll a `.stack--N` wrapper.
- **Two stacked blocks never touch.** A 0-gap stack (or a `p-0` hack to flush a slot)
  is a defect: the checker warns on inline `style` padding/margin hacks, and review
  fails any two blocks that touch.

(This is the canonical home for the portal spacing system; the standalone
`docs/protal-page-style-spec.md` §3 is being folded in here.)

## 14. Filtering commits on an explicit action — never on change

> **Law** · both · review + advisory — editing a filter builds a *draft*; the query
> commits only on an explicit action (the Search button or Enter). Search-on-change /
> filter-on-select is a defect. (Trimming an already-applied query — chip ✕ / Clear all
> — re-runs immediately.)

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

## 15. Default to the `md` / default size

> **Default** · both · review — when a primitive ships a size scale, reach for `md`
> first; pick a non-default size only for a stated reason the layout forces.

When a primitive ships a size scale (`xs` · `sm` · `md` · `lg`, or a `size` prop),
reach for **`md` — the default — first**. It is the resting size the components are
tuned around; a page built from `md` controls reads as one coherent system. Pick a
non-default size only for a **stated reason the layout forces**, not by habit:

- **Smaller (`sm`/`xs`)** — genuinely dense surfaces where `md` would not fit or would
  break the rhythm: a toolbar of inline row actions, chips, a compact table's in-cell
  controls. Density must be a real constraint, not a default reflex.
- **Larger (`lg`)** — a deliberately prominent moment: a hero CTA, an empty-state's
  primary action, a marketing panel.

Absent such a reason, `md` wins. Reserving the small sizes for real density keeps them
meaningful and stops pages from drifting into an arbitrary mix of control heights. (This
is why, e.g., `CardAction` is specified at `btn--md` — see `primitives/card.md`.)

## 16. A committed state outranks hover

> **Law** · artifact · review — a committed visual state (selected / checked / pressed /
> current item / a calendar's selected or in-range day) is never repainted by `:hover`;
> every hover that paints must exclude the committed state(s) via `:not(...)`.

A **committed** visual state — selected, checked, pressed, the active/current item,
a calendar's selected day or in-range track — **must not be repainted by `:hover`**.
Hover is transient affordance for an *un-chosen* element; the moment an element is
chosen, hover feedback yields to the chosen fill. Pointing at your current selection
must never make it look un-selected.

This is defeated silently by **specificity**, not by intent: `.x:hover` is `(0,2,0)`
while `.x--selected` is `(0,1,0)`, so an unguarded hover **wins** even when the selected
rule is written later. The fix is mechanical and mandatory — **every hover that paints a
background/foreground must exclude the committed state(s)** on that element:

```css
/* WRONG — hover washes out the selection */
.tab:hover            { background: var(--color-surface-hover); }
.tab--active          { background: var(--color-primary-50); }   /* loses on hover */

/* RIGHT — hover is guarded; the committed state survives */
.tab:hover:not(.tab--active) { background: var(--color-surface-hover); }
.tab--active                 { background: var(--color-primary-50); }
```

- Guard against **all** committed variants on the element, not just the obvious one — a
  calendar day has `--selected` *and* `--range-start/--range-end/--range-middle`; missing
  one leaks (this rule's origin). A menu row chosen by `aria-current`/`aria-selected`/
  `[aria-pressed="true"]` guards on the attribute.
- Do **not** rely on source order to win — reordering rules would silently re-break it.
  The `:not(...)` guard is the invariant; source order is not.
- This holds for **local state styling an artifact adds**, too, not only foundation CSS:
  any hover you author over a selectable thing carries the same guard.

Enforcement: a review-gate item in `enforcement.md`; the foundation's own components all
carry the guard (`stat-card`, `option-card`, `tabs`, `list-row`, `data-table`, calendar,
`nav-menu`, `app-frame`, `pagination`).

## 17. A floating popup nested in an overflow ancestor is clipped

> **Law** · artifact · review — never nest an inline, absolutely-positioned popup inside
> a scroll/overflow ancestor; it is clipped flat at that box's edge. Lift it to a
> non-clipping ancestor, or use a `fixed` surface (modal / sheet).

An inline, absolutely-positioned popup — a `dropdown-menu`, `popover`, `select`/`combobox`
listbox, `context-menu`, `tooltip`, `hover-card`, or any `.x__content` anchored to its
trigger — **is clipped by the nearest ancestor that scrolls or hides overflow**
(`.scroll-area__viewport`, `.table-scroll`, a `card`/panel with `overflow: auto|hidden|scroll`).
`overflow` establishes a clip rect; an `absolute` descendant cannot paint outside it, so the
part of the popup that extends past the container's edge is silently cut off.

This bites artifacts specifically. The React components **portal** their popup to the body and
position it with a floating strategy, so it is not a DOM descendant of the overflow container
and is never clipped. The static HTML skins place the popup **inline** as a descendant of the
trigger — correct for a normal flow, wrong the moment that trigger sits inside an overflow box.

The rule when authoring a self-contained artifact:

- Do **not** nest an inline popup inside an overflow container. Lift the popup out to a
  non-clipping ancestor (or the `page-body` root) and position it there, **or**
- reach for a `position: fixed` surface (a `modal` / `sheet`), which is positioned against the
  viewport and escapes ancestor `overflow` (as long as no ancestor creates a fixed-containing
  block via `transform` / `filter` / `will-change`).
- Height/scroll needs alone never justify wrapping a trigger's region in `overflow: auto` if a
  popup opens from it — constrain the scroll to the parts that don't host popups.

Failure mode to recognise: the popup opens but only its top slice is visible, cut flat at the
container's edge — not a positioning bug, a clip. Verified empirically (a dropdown lost 116px,
a popover 76px, below a 140px `scroll-area`; a `fixed` modal from the same spot was unclipped).
