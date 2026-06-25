# Key-value grid · composite

The **overview** block of a detail screen: a record's attributes as
label → value pairs, laid out as a description list that flows into more columns
as its container widens. This is the "Overview (KV grid)" the
[detail-page pattern](../patterns/detail-page.md) mandates — the pattern already
forbids a hand-written `repeat(auto-fit,…)` and names the column behavior; this
composite gives the pairs their typography and semantics on top of it.

> **Contract scope.** The cross-consumer design contract: anatomy, the
> label/value recipe, the column rule, tokens. NOT the React prop types — those
> live with `@cloud/ui` + the `ui` skill. When an implementation disagrees with
> this file, the file wins.

## Anatomy

```
┌ kv-grid (a <dl>; columns follow CONTAINER width, not the viewport) ─────────┐
│ ID                 Status              Created             Owner            │
│ cust_8f2a…〔copy〕  Active              Mar 4, 2026         a.lee@acme.co     │
│                                                                             │
│ Billing address  (── full-span row: a long value spans every column ──)    │
│ 2200 Mission St, Suite 4, San Francisco, CA 94110                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

- A `<dl>` of `.kv-grid__row` cells, each a stacked **label** (`dt`) over
  **value** (`dd`).
- **Label** — `dt`, `text-xs`, UPPERCASE, `tracking-overline`, `content-tertiary`, weight 500.
- **Value** — `dd`, `text-sm`, `content-primary`; ids/tokens render mono; a long
  value wraps. Mark a wide field `--full` to span the whole row.

## Rules

- **Columns follow the container, not the viewport.** The grid is `auto-fit` with
  a per-cell wrap measure (~16rem), so the same block lands on 1 column in a
  drawer and 3–4 in a full-width page — without viewport breakpoints. This is the
  detail-page rule; do not hand-write `repeat(auto-fit,…)` per page. (Mirrors the
  `.grid-auto-fit-kv` utility; the KV cell measure is tighter than the 22rem
  section threshold.)
- **Stacked, not left-right.** Label on top, value below — a left-label /
  right-value list strands short values across an empty column on wide layouts.
- Labels are the muted axis, values carry the ink — labels `content-tertiary`,
  values `content-primary` (the detail-page contract).
- **Sensitive values render masked** by default; reveal is an audited action
  (the value cell, not the grid, owns the reveal control).

## States

- **Empty value** — render an em-dash (`content-tertiary`), never a blank cell.
- **Loading** — a `skeleton--text` stands in for each value while the label holds.
- **Full-span** — `.kv-grid__row--full` for addresses, descriptions, or any value
  too long for one column.

## Implementations

- **Next / @cloud/ui** — the detail-page Overview: a `<dl>` under the
  `grid-auto-fit-kv` utility, labels `content-tertiary` / values `content-primary`
  (see the detail-page pattern + the `ui` skill). This contract names the pair
  recipe that utility carries.
- **Artifact** — `.kv-grid` (a `<dl>`) → `.kv-grid__row` (`--full` to span) each
  holding a `dt` (label) + `dd` (value). In `composites.css`; the column behavior
  mirrors `.grid-auto-fit-kv`.
