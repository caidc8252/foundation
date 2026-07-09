# Diff · composite

A compact **before → after** comparison: the old value struck through, an arrow,
the new value highlighted. The block that makes a change reviewable at the point
of commit — the confirm step of an approval, an audit-log entry, a
permission-change preview, a "you're about to change X" modal. Small, but a real
shared building block: every "confirm this edit" flow in the portal renders the
same old/new pair, and nothing in the primitive layer expresses it.

> **Contract scope.** The cross-consumer design contract: anatomy, the
> old/new recipe, the two layouts, tokens. NOT the React prop types — those live
> with `@cloud/ui` + the `ui` skill. When an implementation disagrees with this
> file, the file wins.

## Anatomy

```
block layout (in a confirm modal)            inline layout (in a row / feed)
┌ diff ─────────────────────────────┐
│ BEFORE          →          AFTER   │        Role:  Member  →  Admin
│ Member                     Admin   │               ▔▔▔▔▔▔ (struck)  (success)
└────────────────────────────────────┘
```

- **Old column** (`--old`) — the prior value: tabular, `content-tertiary`, struck
  through.
- **Arrow** — a `content-tertiary` glyph separating old from new.
- **New column** (`--new`) — the incoming value: tabular, `success-strong`, the one
  the eye should land on.
- **Labels** (block layout) — optional overline captions ("BEFORE" / "AFTER")
  over each column.

## Rules

- **Old is struck and muted; new is highlighted** — the direction of change reads
  from styling, not from position alone. New is `success-strong` (an additive
  change reads positive); a *removal* may render the new side as an em-dash in
  `content-tertiary`.
- **Values are `tabular-nums` + `break-all`** — ids, tokens, scopes, and addresses must not
  reflow mid-token; long values wrap inside their column.
- **Two layouts, one recipe** — `block` (three columns: old · arrow · new, in a
  tinted `surface-3` box) for modals; `--inline` (one line: `label old → new`) for
  a feed row or a table cell. Same tokens, same semantics.
- It states a change; it does not *apply* one — the diff is display, the
  confirm/cancel action lives in the surrounding modal or row.

## States

- **add** — old side an em-dash, new side the value.
- **remove** — old side the value (struck), new side an em-dash.
- **modify** — both sides populated (the common case).

The em-dash side is **`.diff__value--empty`** — it is *nothing there*, so it drops the old
column's strike-through and the new column's success ink and renders as a plain muted
em-dash. Do **not** put a bare `.diff__value` (it would inherit the struck/highlighted
styling of its column) or an inline colour override on the placeholder.

## Implementations

- **Next / @cloud/ui** — a small old/new comparison composed inside the confirm
  dialog (`AlertDialog`) and the audit/approval rows; this contract names the
  shared shape. See the `ui` skill.
- **Artifact** — `.diff` (block) → `.diff__col` `.diff__col--old` / `.diff__arrow` /
  `.diff__col` `.diff__col--new`, each column an optional `.diff__label` over a
  `.diff__value` (an empty side is `.diff__value--empty`); `.diff--inline` collapses to a
  single compact line. In `composites.css`.
