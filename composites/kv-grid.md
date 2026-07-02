# Key-value grid · composite

The **overview** block of a detail screen: a record's attributes as
label → value pairs, laid out **left-right** — label left, value right, aligned
in two shared columns; a long value takes `--full` to stack across the full
width. This is the "Overview (KV grid)" the
[detail-page pattern](../patterns/detail-page.md) mandates — the pattern already
forbids a hand-written `repeat(auto-fit,…)` and names the column behavior; this
composite gives the pairs their typography and semantics on top of it.

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
│ BILLING   (── --full row: label over value, spanning the full width ──)    │
│ ADDRESS     2200 Mission St, Suite 4, San Francisco, CA 94110             │
└─────────────────────────────────────────────────────────────────────────────┘
```

- A `<dl>` of `.kv-grid__row` cells laid out **left-right**: label left, value
  right beside it. A subgrid aligns every row's label and value into two shared
  columns, so short values sit next to their label instead of stranding across an
  empty column. This is the single, canonical KV layout.
- **Label** — `dt`, `text-xs`, **UPPERCASE** (`text-transform: uppercase`), `tracking-overline` (letter-spacing ~0.06 em), `content-tertiary`, weight 500. This casing is mandatory — never title-case or sentence-case labels. Both wizard summary rails and detail-screen overview grids must match.
- **Value** — `dd`, `text-sm`, `content-primary`; ids/tokens render mono; a short
  value stays beside its label, a long one wraps in the value column. Mark a long
  / multi-line field `--full` to break the pairing and stack label over value
  across the full width (addresses, notes).

## Rules

- **Left-right, aligned by subgrid.** Label left, value right; a subgrid pins the
  label and value columns across every row so the whole block reads as one
  scannable list. This is the only KV layout — there is no stacked/multi-column
  variant.
- **Values left-aligned, never right-aligned.** The value starts at the shared
  value column and stays left-aligned; do not push values to the far edge
  (`space-between` / `text-align: right`) — that strands short values across an
  empty column, the exact failure this layout avoids.
- **Long values take `--full`.** A value too long for one line (address, notes)
  uses `.kv-grid__row--full` to break the two-column pairing and stack label over
  value across the full width. Reach for it only when the value genuinely needs
  the room — everyday values stay in the two-column pairing.
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

- **Next / @cloud/ui** — the detail-page Overview: a `<dl>` of label → value
  pairs, labels `content-tertiary` / values `content-primary` (see the
  detail-page pattern + the `ui` skill). This contract names the pair recipe.
- **Artifact** — `.kv-grid` (a `<dl>`) → `.kv-grid__row` each holding a `dt`
  (label) + `dd` (value), laid out left-right (subgrid-aligned two columns). Mark
  a long / multi-line row `.kv-grid__row--full` to stack it across the full width.
  In `composites.css`.
