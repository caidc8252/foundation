# Toggles · composite

Inline control-with-label wrappers — pairs a `.checkbox`, `.radio`, or `.switch` primitive with an optional text `.label`. This composite owns ONLY the flex alignment layout; all control styling delegates to the underlying primitive.

> **When to use.** Use these wrappers any time a form control needs a visible inline label. For a standalone control without a label (e.g. a standalone table-row checkbox), use the primitive directly.

## Variants

Three wrappers, one per control type:

| class | control inside | use |
|---|---|---|
| `.toggle-checkbox` | `.checkbox` | multiple-select, boolean opt-in |
| `.toggle-radio` | `.radio` (inside `.radio-group`) | single-select from a group |
| `.toggle-switch` | `.switch` | binary toggle (on/off preference) |

All three share the same layout recipe — they are aliases for the same visual pattern, named per control type for semantic clarity.

## States

- **default** — flex row, `gap: space-2`, `cursor: pointer`.
- **disabled** (`data-disabled="true"`) — `opacity: 0.5`, `cursor: not-allowed`, `pointer-events: none`. Set on the wrapper and let the inner control's `:disabled` state render naturally.

## Sizes

No size prop on the wrapper itself — inherits from the inner primitive (`.checkbox`, `.radio`, `.switch` all default to their respective standard sizes).

## Anatomy

```
.toggle-checkbox / .toggle-radio / .toggle-switch
├── .checkbox  / .radio  / .switch   ← control primitive
└── .label                           ← optional visible label (clicking it also toggles)
```

The wrapper is typically a `<label>` element (so clicking the text label activates the control), or a `<div>` with an explicit `<label for="…">` sibling.

## Accessibility

- Wrap with a `<label>` so the text activates the control — or use an explicit `<label for="…">` pointing to the control's `id`.
- The `data-disabled` attribute on the wrapper expresses the disabled state; the inner `<input disabled>` still handles the browser's native disabled behavior.
- For `.toggle-radio` groups, ensure the `<label>` elements are inside a `<fieldset>` + `<legend>` to give the group an accessible name.

## Implementations

- **Next / @cloud/ui** — `import { ToggleCheckbox, ToggleRadio, ToggleSwitch } from "@cloud/ui"`. Each component wires the label + control relationship automatically. Props: `label` `checked` / `defaultChecked` `disabled` `onCheckedChange` (+ `value`/`name` for radio). API details: the `ui` skill.
- **Artifact (self-contained HTML)** — `.toggle-checkbox`, `.toggle-radio`, or `.toggle-switch` wrapping a `.checkbox` / `.radio` / `.switch` primitive + a `.label` element. In `release/composites.css` on top of `release/tokens.inline.css` + `primitives/primitives.css`.
