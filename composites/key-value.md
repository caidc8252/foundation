# Key-Value · composite

Read-only KV field system for detail / overview pages (DS 2.0 §detail fields). Vertical layout: a small overline label stacked above a body value. Columns are container-responsive auto-fit — column count follows the container's own width with no breakpoints.

> **Contract scope.** Surface recipe, typography, empty-value placeholder, the grid's column formula, and the `wide` full-row override. Data fetch and edit affordances live in the consuming page.

## Variants

No variant axis — one field shape. Two orthogonal modifiers:

| modifier | effect |
|---|---|
| `wide` | spans the full grid row — for long free-text fields (Address, Notes) |
| `mono` | renders value in `font-mono` + `tabular-nums` — for IDs, amounts, dates |

## States

Display-only. No interactive, hover, or focus states. Empty value (null / `""`) renders an em-dash placeholder in `content-tertiary`.

## Sizes

No size axis. Label is fixed `text-xs` / 500 / UPPERCASE / `tracking-overline` (`0.06em`). Value is fixed `text-md`.

## Anatomy

```
┌ kv-grid ─────────────────────────────────────────────────────────────────┐
│ ┌ key-value ────────────┐  ┌ key-value ────────────┐  …                 │
│ │ LABEL                 │  │ LABEL                 │                     │
│ │ Value text            │  │ mono-value            │                     │
│ └───────────────────────┘  └───────────────────────┘                     │
│ ┌ key-value key-value--wide ─────────────────────────────────────────┐   │
│ │ NOTES                                                               │   │
│ │ Long free-text spanning the whole row                               │   │
│ └─────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
```

- **`.kv-grid`** — `<dl>` container; `grid-template-columns: repeat(auto-fit, minmax(min(22rem, 100%), 1fr))` · column-gap `space-4` (16px) · row-gap `space-5` (20px).
- **`.key-value`** — one `<div>` cell: flex-col, gap `space-1`.
  - **`__label`** (`<dt>`) — `text-xs`, weight 500, UPPERCASE, `letter-spacing 0.06em`, `content-tertiary`.
  - **`__value`** (`<dd>`) — `text-md`, `content-primary`; or `content-tertiary` when empty.
  - **`__value--empty`** — tertiary color for the em-dash placeholder.
  - **`__value--mono`** — `font-mono`, `tabular-nums`.
- **`.key-value--wide`** — `grid-column: 1 / -1`.

## Accessibility

- Uses `<dl>` / `<dt>` / `<dd>` semantics — screen readers associate labels with values automatically.
- Empty fields render `"—"` (em-dash) with `content-tertiary` — still readable; no additional `aria-label` needed.

## Implementations

- **Next / @cloud/ui** — `import { KvGrid, KeyValue } from "@cloud/ui"`. `KvGrid` renders a `<dl>`; `KeyValue` renders `<div><dt>…</dt><dd>…</dd></div>`. Props: `label` `value` `mono` `wide` `className`. API details: the `ui` skill.
- **Artifact (self-contained HTML)** — `.kv-grid` wrapping `.key-value` (+ `--wide`) cells, each containing `.key-value__label` + `.key-value__value` (+ `--empty`, `--mono`). In `composites/composites.css` on top of `dist/tokens.inline.css` + `primitives/primitives.css`.
