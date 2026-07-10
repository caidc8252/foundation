# Stat card · composite

A single key metric — overline label, big tabular value, optional trend / icon /
description — surfaced above a list (style-spec §4). Pure display, or an
interactive quick-filter synced to the list toolbar's applied state. Composes a
`card`-like surface + a `label` + a `value` + a `delta`.

**Metric vs attribute — when NOT to use.** A stat card is a **headline aggregate
the screen is ABOUT** — a KPI computed over a *set* (a dashboard total, a
count / sum / rate across records). It is **not** for a single record's own
numbers. On a detail screen, that record's price, SKU count, image count, etc.
are **attributes** → they belong in [`kv-grid`](./kv-grid.md) or the identity
band, **never dressed as a KPI strip**. Padding a `stat-grid` with a record's
attributes (the giveaway: an "Images 2/3" tile) is the mark of a *cloned*
Overview, not a *designed* one — see [`detail-page`](../patterns/detail-page.md)
→ "Derive the body, don't port it".

## Variants

Not a structural variant axis — one card shape. Two orthogonal selectors drive
the look:

**Value tone** (`tone`, colors the value only; default `neutral`):

| tone | value color |
|---|---|
| `neutral` *(default)* | `content-primary` |
| `success` | `success-strong` |
| `warning` | `warning-strong` |
| `error` | `error-strong` |
| `info` | `info-strong` |

> Alias kept for compat: `variant` (`default`/`success`/`warning`/`error`) maps
> 1:1 to `tone`, with `default` → `neutral`. New code uses `tone`.

**Selected** wins over tone — when selected, the whole card (label, icon, value)
recolors to the primary hue regardless of `tone` (see States).

## States

- **rest** — border `line-subtle` · bg `surface-2` · `shadow-1`.
- **interactive** (`onClick` present) — `cursor-pointer`; on hover (and only when
  *not* selected) bg → `surface-hover`. Pure-display cards have no hover.
- **selected** (`selected`, alias `active`) — **beats hover**: border
  `primary-500` · bg `primary-50` · a 2px `primary-500`-at-10% ring; no
  `shadow-1`. Label + icon + value all shift to `primary-700`, overriding the
  value `tone`.
- **focus-visible** — interactive cards are keyboard-focusable; the focus ring is
  the standard `shadow-focus` (see a11y; the static skin paints it on
  `:focus-visible`).

No disabled/invalid state — a stat card is a metric, not a form control.

## Sizes

No size axis. The card has a **floor** height of `spacing-stat-card` (92px) and
grows with content; it never has a fixed height. Inner padding is fixed at
`spacing-cx-md` block / `space-4` inline.

## Anatomy

```
┌ stat-card ────────────────────────────────┐  ← min-h spacing-stat-card (92px),
│  ACTIVE TERMINALS            ◍  (icon?)    │    radius-xl, surface-2 + shadow-1
│  __label (overline)          __icon        │
│                                            │
│  1,248   ▲ 12%                             │  ← __value (tabular 2xl) + __delta (trend?)
│  __value                                   │
│  Updated 2 min ago                         │  ← __description? (xs tertiary)
└────────────────────────────────────────────┘
```

- **`__label`** — overline: `text-xs`, weight 500, UPPERCASE, `tracking-overline`,
  `content-tertiary` (→ `primary-700` selected). Sits in a top row beside the icon.
- **`__icon`** — optional, top-right, `shrink-0`, `content-tertiary`
  (→ `primary-700` selected). Decorative; size set by the consumer's glyph
  (`space-5` / 20px). The head reserves this height (`min-height: space-5`) so a
  label-only card aligns with an icon card across a grid — values don't stagger.
- **`__value`** — the metric: `tabular-nums`, `text-2xl`, weight 600, `tracking-tight`,
  `tabular-nums`. Color = the `tone` recipe (→ `primary-700` selected).
- **`__delta`** — optional trend chip inline-baseline after the value: `text-xs`
  weight 500. Direction colors: **up** `success-strong` · **down** `error-strong`
  · **flat** `content-tertiary`.
- **`__description`** — optional sub-line (alias `sub`): `text-xs`,
  `content-tertiary`.
- **custom** — `children` replaces the entire label/value/description/trend/icon
  body; only the surface recipe + states remain.

Cards lay out in a **`.stat-grid`** (2 / 3 / 4 columns, gap `space-3`; the 4-col
preset collapses to 2-up below `sm`). The grid, the data array, and any
filter-sync live in the consuming page — the card is a presentational leaf.

## Accessibility

- **Pure display** — a plain container, no role.
- **Interactive** (`onClick`) — a keyboard-accessible `role="button"` (NOT a
  native `<button>`, per the apps lint rule) with `tabIndex={0}`; `aria-pressed`
  reflects `selected`. Enter / Space activate it (the React impl calls
  `preventDefault` then `onClick`). Give it an accessible name via the label/value
  content.
- Focus ring is never removed — keyboard focus shows `shadow-focus`.

## Implementations

- **Next / @cloud/ui** — `import { StatCard, StatGrid } from "@cloud/ui"`. A
  presentational `<div>` (interactive when `onClick` is passed); props
  `label` `value` `description` `trend` `icon` `tone` `selected` `onClick`
  `children`. Keyboard activation + `role="button"`/`aria-pressed` are owned by
  the React implementation; the reference CSS expresses the static skin only. Don't re-skin via `className` — pick `tone` /
  `selected`.
- **Artifact (self-contained HTML)** — `.stat-card` (+ `.stat-card--selected`,
  `.stat-card--interactive`) wrapping `.stat-card__head` ›
  `.stat-card__label` + `.stat-card__icon`, then `.stat-card__value`
  (+ tone modifier `.stat-card__value--success|warning|error|info`) with an inline
  `.stat-card__delta` (+ `--up|--down|--flat`), and a trailing
  `.stat-card__description`. Lay cards out in `.stat-grid` (`--cols-2|3|4`). In
  `composites.css`, on top of the inlined `release/tokens.inline.css`. Same surface
  recipe and tone names.
