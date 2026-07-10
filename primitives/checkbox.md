# Checkbox

A binary on/off toggle for a single boolean, or a tri-state "select all" header. Use the standalone box here for table headers and custom layouts; prefer `ToggleCheckbox` when you need an inline label.

## Variants

Single visual variant — a 16px square box. State (unchecked / checked / indeterminate) drives the fill and glyph, not a variant prop.

| state | token recipe |
|---|---|
| unchecked | size-4 (16px) · radius `radius-sm` · border `line-strong` · bg `surface-2` |
| checked | border `primary-700` · bg `primary-700` · check glyph `content-on-primary` |
| indeterminate | border `primary-700` · bg `primary-700` · minus glyph `content-on-primary` |

(`bg-primary` / `border-primary` / `text-primary-foreground` in the implementation map to the `primary-700` CTA color and `content-on-primary`.)

## Sizes

No size variants — fixed `size-4` (16px) box with a `size-2.5` (10px) glyph. The hit target is enlarged to **24px** (WCAG 2.5.8 *Target Size (Minimum)*) via an invisible pseudo-element overlay extending the clickable area beyond the visual box. Which pseudo carries it is an implementation detail: React's glyph is an inner element, leaving `after` free; an artifact's `<input>` cannot hold children, so `after` paints the glyph and `before` is the target.

## States

- **checked / indeterminate** — fill steps above; the indicator glyph switches check vs. minus based on `data-indeterminate`.
- **focus-visible** — `shadow-focus` ring.
- **disabled** — `cursor-not-allowed` + `opacity-50` (also dims when inside a disabled `field` group).
- **invalid** (`aria-invalid`) — border `error` + 2px ring `error`/20; if invalid AND checked, border returns to `primary-700` so the checked fill still reads.

## Anatomy

A square box that renders a single indicator (check or minus). base-ui renders the indicator for checked OR indeterminate; the root's `data-indeterminate` attribute decides which glyph shows. An enlarged invisible hit area (a pseudo-element overlay) makes the small box easy to click.

## Accessibility

- Real checkbox semantics from base-ui — space toggles, `aria-checked` (including `mixed` for indeterminate) handled by the primitive.
- Standalone box has no label; provide one via `<Label htmlFor>` / `Field`, or use `ToggleCheckbox`.
- Focus ring (`shadow-focus`) is never removed.

## Notes

- Tri-state is driven by base-ui's `indeterminate` prop (not a `checked="mixed"` string). The box fills `primary-700` and shows a minus dash — used for "select all" headers.
- The implementation's `bg-input` / `border-destructive` dark-mode classes are shadcn aliases; they resolve to `surface-3` / `error` in this token system.

## Implementations

- **Next / @cloud/ui** — `import { Checkbox } from "@cloud/ui"`. base-ui `Checkbox` under the hood; pass `indeterminate` for tri-state. For a labeled field use `ToggleCheckbox`.
- **Artifact (self-contained HTML)** — use `<input type="checkbox" class="checkbox">` styled by `./primitives.css`, on top of the inlined `release/tokens.inline.css`. Same checked-fill recipe (`primary-700` + `content-on-primary` glyph).
