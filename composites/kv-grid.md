# Key-value grid · composite

The **overview** block of a detail screen: a record's attributes as
label → value pairs, laid out **left-right** — label left, value right, aligned
in two shared columns; a long value just wraps inside its value column. This
is the "Overview (KV grid)" the
[detail-page pattern](../patterns/detail-page.md) mandates — the pattern already
forbids a hand-written `repeat(auto-fit,…)` and names the column behavior; this
composite gives the pairs their typography and semantics on top of it.

**A record's own numbers stay here — even numeric ones.** Price, counts,
quantities that belong to THIS record are attributes, not headline metrics; they
render as kv rows (or a lead fact in the identity band), **not** promoted to
[`stat-card`](./stat-card.md) KPI tiles. Reserve `stat-card` for an aggregate the
screen is *about* (see its "Metric vs attribute").

> **Contract scope.** The cross-consumer design contract: anatomy, the
> label/value recipe, the column rule, tokens. NOT the React prop types — those
> live with `@cloud/ui` + the `ui` skill. When an implementation disagrees with
> this file, the file wins.

## Anatomy

```
┌ kv-grid (a <dl>; label left, value right, subgrid-aligned two columns) ─────┐
│ ID          cust_8f2a…〔copy〕                                              │
│ STATUS      Active                                                         │
│ CREATED     Mar 4, 2026                                                    │
│ OWNER       a.lee@acme.co                                                  │
│ BILLING ADDRESS  2200 Mission St, Suite 4,                                 │
│                  San Francisco, CA 94110  (── long value wraps in column ──)│
└─────────────────────────────────────────────────────────────────────────────┘
```

- A `<dl>` of `.kv-grid__row` cells laid out **left-right**: label left, value
  right beside it. A subgrid aligns every row's label and value into two shared
  columns, so short values sit next to their label instead of stranding across an
  empty column. This is the single, canonical KV layout.
- **Label** — `dt`, `text-xs`, **UPPERCASE** (`text-transform: uppercase`), `tracking-overline` (letter-spacing ~0.06 em), `content-tertiary`, weight 500. This casing is mandatory — never title-case or sentence-case labels. Both wizard summary rails and detail-screen overview grids must match.
- **Value** — `dd`, `text-md`, `content-primary`; ids/tokens render tabular; a short
  value stays beside its label, a long / multi-line one (addresses, notes) simply
  wraps inside its value column (`overflow-wrap: break-word`), staying aligned with
  every other row.

## Rules

- **Left-right, aligned by subgrid.** Label left, value right; a subgrid pins the
  label and value columns across every row so the whole block reads as one
  scannable list. A single grid is always this left-right two-column form — never
  internally stacked, and never `repeat(auto-fit,…)` on the rows.
- **Multiple columns on a wide overview.** When a single column would leave short
  values trailing empty width, the facts MAY be split across **two or more
  `.kv-grid` columns side by side** — a layout wrapper (`display: grid` of whole
  `.kv-grid` dls, e.g. `grid-template-columns: repeat(2, minmax(0, 1fr))`), **not**
  a change to one grid's internal subgrid. Each dl stays this canonical left-right
  form; the wrapper only places whole grids beside each other and collapses to one
  column when narrow. Reach for it only when the width genuinely wants filling.
- **Values left-aligned, never right-aligned.** The value starts at the shared
  value column and stays left-aligned; do not push values to the far edge
  (`space-between` / `text-align: right`) — that strands short values across an
  empty column, the exact failure this layout avoids.
- **Long values wrap in place.** A value too long for one line (address, notes)
  just wraps inside its value column (`dd` breaks on overflow); the row stays in
  the two-column subgrid like every other, aligned with its neighbours. There is
  no full-width escape hatch — one code path for every row.
- Labels are the muted axis, values carry the ink — labels `content-tertiary`,
  values `content-primary` (the detail-page contract).
- **Sensitive values render masked** by default; reveal is an audited action
  (the value cell, not the grid, owns the reveal control).

## States

- **Empty value** — render an em-dash (`content-tertiary`), never a blank cell.
- **Loading** — a `skeleton--text` stands in for each value while the label holds.
- **Long value** — an address / description / any value too long for one line
  wraps inside its value column; no special row class.

## Implementations

- **Next / @cloud/ui** — the detail-page Overview: a `<dl>` of label → value
  pairs, labels `content-tertiary` / values `content-primary` (see the
  detail-page pattern + the `ui` skill). This contract names the pair recipe.
- **Artifact** — `.kv-grid` (a `<dl>`) → `.kv-grid__row` each holding a `dt`
  (label) + `dd` (value), laid out left-right (subgrid-aligned two columns). A
  long / multi-line value wraps inside its value column — no special row class.
  In `composites.css`.
