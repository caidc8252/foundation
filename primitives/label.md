# Label

The caption for a form control. Names an input and, via `htmlFor`, makes its text a click-to-focus target for that control.

> **Contract scope.** This file is the cross-consumer *design contract*: the
> typography recipe, layout, states, anatomy, a11y. It is the authority both
> implementations answer to. It deliberately does NOT document the React prop
> *types* — those live with the Next implementation (`@cloud/ui` + the `ui`
> skill). When the contract and an implementation disagree, the contract is
> right and the implementation is a bug.

## Variants

Single visual variant — no variant prop. It is an inline-flex text caption.

| token recipe |
|---|
| font `font-sans` · size `text-md` (14px) · weight 500 · line-height 1 · `select-none` · **color inherited** (not set by the primitive) |

The label sets no color of its own — it inherits the surrounding text color, so it composes inside any field or context. The `Field` wrapper applies `content-secondary` as the standard form-caption tone; the reference `.label` class bakes that same tone in for the artifact side (see Notes).

## Sizes

No size variants. Fixed `text-md` (14px), weight 500, line-height 1. Slot gap is `gap-2` (`--space-2`, 8px) between the caption text and any inline adornment (e.g. a required `*` or an inline control).

## States

The label has no interactive state of its own — it borrows the disabled state of the control it captions, via two upstream signals:

- **group-disabled** — when an ancestor marked as a disabled group (`group` + `data-disabled="true"`) is present, the label goes `cursor-not-allowed` + `opacity-50`.
- **peer-disabled** — when the label's paired control is a disabled sibling (`peer:disabled`), the label goes `cursor-not-allowed` + `opacity-50`.

There is no hover, active, focus, invalid, or selected styling on the label itself — focus and validation live on the control it points at.

## Anatomy

`[ caption text ] [ adornment? ]` — an inline-flex row, vertically centered, with `gap-2` between children. The text is the only required slot; an optional adornment (a required-marker `*`, an inline checkbox/radio, a helper glyph) sits beside it. `select-none` keeps the caption from being text-selected when a user click-drags to toggle the control.

## Accessibility

- Real `<label>` semantics. Set `htmlFor` to the control's `id` so clicking the caption focuses/toggles that control.
- Omit `htmlFor` for radio/checkbox **groups**, which have no single target element id — wrap the group instead.
- The required marker (`*`) is decorative (`aria-hidden`); requiredness is communicated to AT via the control's own `required` / `aria-required`, not the visual star.
- No focus ring — the label is not focusable; focus belongs to the control.

## Implementations

- **Next / @cloud/ui** — `import { Label } from "@cloud/ui"`. A plain `<label>` (no base-ui dependency); pass `htmlFor` + children. The disabled dimming is driven by Tailwind `group-data-[disabled=true]:*` / `peer-disabled:*` variants reading state off the surrounding group or paired control. For the standard stacked form field (label → control → hint/error) use `Field`, which wraps `Label` and applies the `content-secondary` tone plus the required `*`. Prop/API details: the `ui` skill.
- **Artifact (self-contained HTML)** — use `<label class="label">` in `../primitives/primitives.css`, on top of the inlined `release/tokens.inline.css`. Same `font-sans` / `text-md` / weight-500 / `select-none` recipe. Disabled dimming is expressed via `.label--disabled` (static stand-in for the React group/peer variants, which need live control state). For the full stacked field, compose with `.field` / `.field__required` / `.field__hint` / `.field__error`.
