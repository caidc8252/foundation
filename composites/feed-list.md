# Feed list · composite

A vertical list of event rows — each a tone-coded icon, a heading line, a body,
and a right-aligned time, with optional row actions. The shape behind a
**notifications** list and an **approvals / activity** feed: things that
happened or need attention, newest first, each actionable in place. It is the
list cousin of [`Timeline`](./timeline.md) — `timeline` draws a *chronological
rail* through dated events; `feed-list` is a *flat, hairline-separated* inbox
where order is recency, not a connected sequence, and rows can carry actions.

## Anatomy

```
┌ feed-list (hairline-separated rows) ───────────────────────────────────────┐
│ 〔!〕 APPROVAL · role change            Promote a.lee to Admin      2h ago   │
│       Requested by m.ortiz · expires in 5d            [ Approve ] [ Deny ]   │
├──────────────────────────────────────────────────────────────────────────────┤
│ 〔✉〕 EMAIL · invite sent               Invitation to acme.co        1d ago   │
│       Delivered to 3 recipients                                             │
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Row** — a 3-column grid: **icon** | **main** | **trailing**.
- **Icon** — a tonal tile (`--info` / `--success` / `--warning` / `--error` /
  `--neutral`), signalling the event class.
- **Main** — an optional **overline** head (kind / source, uppercase
  `content-tertiary`, may hold a `<code>` run), a **title** (`text-md`, weight 600),
  an optional **body** line (`text-xs`, `content-secondary`), and an optional
  **actions** row.
- **Trailing** — a right-aligned column (`__trailing`) holding the **time**
  (`content-tertiary`, `nowrap`) at the top, with optional **actions** (`__actions`,
  `justify-end`) stacked below. May also hold a status chip or an unread dot beside
  the time.

## Rules

- **Rows are hairline-separated, not carded** — the list sits inside one frame
  (a `.card__content--flush` region or a `table-frame`), rows divide with a
  `line-subtle` rule, last row drops it. Don't box each row.
- **Tone lives on the icon only** — the row body stays neutral; the icon tile
  carries the success/warning/info hue. (Same tone tokens as `timeline`.)
- **Actions are per-row and secondary** — Approve/Deny etc. are `secondary`
  buttons in the row, never a bare primary; a single destructive action uses the
  `danger` recipe.
- For a **connected, dated** sequence (an audit trail, a record's history) use
  `timeline` instead; reach for `feed-list` when rows are independent and
  actionable.

## States

- **unread** — an accent dot / heavier title; read rows relax to
  `content-secondary`.
- **empty** — render an `empty-state` (or its compact `__title` / `__sub` form)
  in place of rows — never a blank frame.
- **loading** — `skeleton-row`s inside the frame.
- **load more** — a long feed ends in the `load-more` composite, not inline
  pagination.

## Implementations

- **Next / @cloud/ui** — a list of rows composed from `Badge` / icon tiles +
  `Button` actions inside a `Card` (`flush` content); this contract names the row
  shape shared with the notifications + approvals screens.
- **Artifact** — `.feed-list` → `.feed-item` (3-column grid: icon | main | trailing)
  with `.feed-item__icon` (`--info` / `--success` / `--warning` / `--error` / `--neutral`),
  `.feed-item__main` (`__head` / `__title` / `__body`), and `.feed-item__trailing`
  (`__time` on top; optional `__actions` below — `justify-content: flex-end`). Empty
  reuses `.empty-state`; row buttons reuse `.btn--*`. In `composites.css`.
