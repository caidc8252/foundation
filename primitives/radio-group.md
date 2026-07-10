# Radio Group

A set of mutually exclusive options where exactly one is selected. Use the bare group/item here for custom layouts; prefer `ToggleRadioGroup`/`ToggleRadio` for labeled radio fields.

## Variants

Two slots: `RadioGroup` (the container) and `RadioGroupItem` (each circle). Single visual variant — a 16px circle.

| part | token recipe |
|---|---|
| `RadioGroup` | layout only — `grid` with `gap-2`, full width |
| `RadioGroupItem` unchecked | size-4 (16px) circle · border `line-strong` · bg `surface-2` |
| `RadioGroupItem` checked | border `primary-700` · bg `primary-700` · inner dot `content-on-primary` |

(`bg-primary` / `border-primary` / `bg-primary-foreground` map to `primary-700` and `content-on-primary`.)

## Sizes

No size variants — fixed `size-4` (16px) circle with a `size-1.5` (6px) center dot. The hit target is enlarged to **24px** (WCAG 2.5.8 *Target Size (Minimum)*) via an invisible pseudo-element overlay beyond the visual circle. Which pseudo carries it is an implementation detail: React's mark is an inner `<span>`, leaving `after` free; an artifact's `<input>` cannot hold children, so `after` paints the dot and `before` is the target.

## States

- **checked** — border + fill `primary-700`, centered dot in `content-on-primary`.
- **focus-visible** — `shadow-focus` ring.
- **disabled** — `cursor-not-allowed` + `opacity-50`.
- **invalid** (`aria-invalid`) — border `error` + 2px ring `error`/20; if invalid AND checked, border returns to `primary-700` so the selection still reads.

## Anatomy

`RadioGroup` is a vertical grid of items (`.radio-group` — `display:grid`, `gap-2`, full width). Each `RadioGroupItem` is a circle whose `Indicator` holds a small centered dot, shown only when checked. The enlarged invisible hit area (a pseudo-element overlay) makes the small circle easy to click.

A horizontal or multi-column arrangement is **the consumer's own layout**, not a group variant — there is no `.radio-group--horizontal`.

## Accessibility

- Real radiogroup semantics from base-ui — arrow-key roving selection, single tab stop, `aria-checked` handled by the primitive.
- Bare items carry no label; provide labels via `<Label>` / `Field`, or use `ToggleRadioGroup`/`ToggleRadio`.
- Focus ring (`shadow-focus`) is never removed.

## Notes

- This is **base-ui** (`@base-ui/react/radio` + `radio-group`), not Radix. The item is `RadioGroupItem` and the selected mark is a positioned inner `<span>`, not an SVG.
- The `RadioGroup` container is layout-only; spacing/columns are its job, the circle is the item's job.

## Implementations

- **Next / @cloud/ui** — `import { RadioGroup, RadioGroupItem } from "@cloud/ui"`. base-ui radio under the hood. For labeled options use `ToggleRadioGroup`/`ToggleRadio`.
- **Artifact (self-contained HTML)** — wrap the options in `<div class="radio-group">` and use `<input type="radio" class="radio">` for each, styled by `./primitives.css`, on top of the inlined `release/tokens.inline.css`. Same checked recipe (`primary-700` fill, `content-on-primary` dot). The invalid state is the `aria-invalid="true"` attribute, not a class. Bare radios carry no label — supply your own label row.
