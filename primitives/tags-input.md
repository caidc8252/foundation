# Tags Input

A free-text token field: the user types arbitrary values that become removable chips, ahead of a bare text input. For labels, keywords, recipients, or any open-ended multi-value entry.

## When to use — Tags Input vs Combobox

Both surface chips. Use **Tags Input** when the values are **open-ended free text**
the user authors (tags, keywords, emails). Use a multi-select
[`combobox`](./combobox.md) when the values come from a **known, finite list** the
user searches and picks. If the value is a single free-text string, that's a plain
[`input`](./input.md).

## Variants

One visual form — a bordered container wrapping chips + a bare input. No style
variants. Validation is an orthogonal axis (see States): `invalid`.

## Sizes

One size — the container is `control-md` (36px) min-height and grows as chips
wrap onto new rows. Chips and the inner field sit at `control-sm` (28px) so a
single-row field reads as a standard `md` control.

## Anatomy

```
.tags-input                       ← owns the border, focus ring, invalid/disabled skin
├─ .tags-input__tag  ×N           ← a removable token
│  ├─ (label text)
│  └─ .tags-input__remove         ← × button (x icon), aria-label "Remove <tag>"
└─ .tags-input__field             ← the bare <input>, borderless/transparent, grows to fill
```

- The **container** owns the border, radius, focus ring, and invalid/disabled styling — exactly like the adorned [`input`](./input.md) — so only one ring ever shows; the inner `<input>` is borderless and transparent.
- Chips are `radius-full`, `surface-3` fill, `text-xs`, each with a trailing remove button.
- The field grows (`flex: 1 1 auto`, `min-width` floor) to fill the trailing space on each wrapped row.

## States

- **focus-within** — border `line-focus` + `shadow-focus` ring on the container (the inner input's own focus is suppressed). Always visible on keyboard focus.
- **invalid** (`.tags-input--invalid` / `aria-invalid`) — border `error-strong` + 2px ring `error`/20.
- **disabled** (`.tags-input--disabled`) — `cursor-not-allowed` + bg `surface-3` + `opacity-50`; the inner field and remove buttons are non-interactive.
- **chip remove hover** — the × button lifts to `surface-hover` + `content-primary`.

## Accessibility

- The inner control is a real `<input>`; pair with a `<Label htmlFor>` (or wrap in [`field`](./field.md)) for a name, and set `aria-invalid` on error so AT announces it.
- Each remove button is a real `<button>` with an accessible name (`aria-label="Remove <tag>"`).
- Typing Enter (or a configured delimiter) commits a tag; Backspace on an empty field removes the last chip — behaviour owned by the implementation.
- Focus ring is never removed, only restyled onto the container.

## Implementations

- **Next / @cloud/ui** — not a standalone base-ui primitive: compose an input whose committed values render as chips (Enter/delimiter to add, Backspace/× to remove). Prefer the multi-select `Combobox` when values come from a known list.
- **Artifact (self-contained HTML)** — a `.tags-input` container holding `.tags-input__tag` chips (each with a `.tags-input__remove` `x`-icon button) followed by one `<input class="tags-input__field">`. Put the invalid skin with `.tags-input--invalid` (and `aria-invalid`), disabled with `.tags-input--disabled`. A small script adds a chip on Enter and removes on ×. On top of the inlined `release/tokens.inline.css`.
