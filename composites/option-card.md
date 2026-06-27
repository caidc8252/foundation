# Option card · composite

A large, clickable card that behaves as a **radio (or checkbox)** — icon, title,
description, and a selection indicator, with the whole card as the hit target and
a tinted ring when chosen. The picker you reach for when an option needs more
than a label: customer-type selection, contract assignment, an onboarding
account-kind choice, a plan picker. It composes the [`Card`](../primitives/card.md)
surface with [`RadioGroup`](../primitives/radio-group.md) / `Checkbox` semantics —
the card *is* the label of a hidden control, so keyboard and AT users get real
radio/checkbox behavior, not a `cursor-pointer` div.

> **Contract scope.** The cross-consumer design contract: anatomy, the selection
> recipe, single- vs multi-select, tokens, states, a11y. NOT the React prop
> types — those live with `@cloud/ui` + the `ui` skill. When an implementation
> disagrees with this file, the file wins.

## Anatomy

```
┌ option-card (selected) ────────────────────────────── ┐
│ [●] ┌────┐  ISV partner                               │
│     │ 🧩 │  Builds and lists apps on the marketplace. │
│     └────┘                                            │
└────────────────────────────────────────────────────────┘
  ▲     ▲ icon tile   ▲ title + description
  indicator (leading)
```

- **Indicator** — **leading (left) edge**, vertically aligned with the title's
  cap-height. A **radio dot** (`radius-full`, inner dot) for single-select; a
  **checkbox** (`radius-sm`, svg check) for multi-select. Add `.option-card--radio`
  on the card element for single-select groups; the default is checkbox.
- **Icon** — optional tonal tile, sized ~40px.
- **Body** — `title` (`text-sm`, weight 600) over an optional `description`
  (`text-xs`, `content-secondary`).

## Rules

- **The card is a `<label>` over a real `<input>`** (radio for one-of, checkbox
  for many-of). Selection state, roving focus, and group semantics come from the
  control — the card only paints them. Never a bare clickable div.
- **Selected beats hover** — chosen cards take a `primary-700` border, a
  `primary-50` fill, and a soft primary ring; hover on an unselected card only
  lifts the border to `line-strong`. (Same selected recipe as `stat-card`.)
- **One indicator style per group** — radio dots (`.option-card--radio`) for
  single-select, checkboxes (default) for multi; don't mix within a group.
- **Indicator is leading** — the `__check` element is the first child in the
  flex row, before the icon and body. It is `flex-shrink: 0` and aligned to the
  title's cap-height via a 1px top margin. No absolute positioning; no body
  `padding-inline-end` reserve is needed.
- Keep the body to a title + one short description line — an option card is a
  choice, not a content card.

## States

- **selected** (`data-selected` / `:checked`) — primary border + tint + ring;
  the indicator fills.
- **hover** (unselected) — border `line-strong`, surface `surface-hover`.
- **focus-visible** — the focus ring (`shadow-focus`) rides the input, shown on
  the card.
- **disabled** — `cursor-not-allowed` + `opacity-50`; the input is disabled.

## Accessibility

- Wraps a native radio/checkbox; the group is a real `radiogroup` / set of
  checkboxes with arrow-key (radio) or tab (checkbox) navigation and
  `aria-checked` handled by the control. The visible focus ring is never removed.

## Implementation notes

Cross-consumer guards — the contract is the authority both implementations
answer to, so these are binding, not the artifact CSS's private business. All
*values* here are tokens (gap `cx-md`, padding `cx-lg`, icon `size-10`, check
`size-5`, radii `xl`/`lg`/`sm`) → plain utilities; **the drift risk is
structural, not numeric**:

- **The body is a vertical stack** (`flex-col`): title *over* description. Inline
  children (`<span>`) collapse onto one line unless the body forces a column —
  don't let the icon/text row's `flex` leak into the text column.
- **No space reservation needed.** The indicator is a normal leading flex item
  (`flex-shrink: 0`), not absolutely positioned — the body column naturally fills
  the remaining width. Do not add `padding-inline-end` to `__body`.
- **It is a real control**, not a clickable div: a `<label>` wrapping a native
  radio/checkbox (or `RadioGroupItem`/`Checkbox`). Selection + focus come from the
  input's state (`:checked` / `data-state` / `has-[]`), never a JS-toggled class.
- **Selected = the `stat-card--selected` recipe** (primary-700 border + primary-50
  fill + a 2px soft primary ring). Reuse it; don't invent a different ring width.

## Implementations

- **Next / @cloud/ui** — a `Card` (`interactive`) wrapping `RadioGroupItem` /
  `Checkbox` with a `Label`; the selected/focus styling keys off the control's
  `data-state`. See the `ui` skill.
- **Artifact** — `.option-card` (a `<label>`, `--selected` / `[data-selected]`)
  wrapping a visually-hidden input (`type="radio"` or `type="checkbox"`), with
  `.option-card__check` **(leading, first child)**, `.option-card__icon` (optional),
  `.option-card__body` (`__title` / `__desc`), and `.option-card__input`
  (the hidden control). Add `.option-card--radio` on the card for single-select
  groups (round dot); omit it for multi-select (square checkbox, default). In
  `composites.css`.
