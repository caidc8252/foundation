# Stepper · composite

A numeric input flanked by `−`/`+` buttons for incrementing/decrementing a
single bounded number (quantity, page size, retry count). Composes
`InputGroup` — it adds value clamping, keyboard arithmetic, and per-button
boundary state on top of that shell; it invents no new surface of its own.

> **Contract scope.** This file is the cross-consumer *design contract*: the
> anatomy, the boundary/disabled rule, states, tokens. React prop *types* and
> the value/clamp/keyboard *behavior* live with the Next implementation
> (`@cloud/ui` + the `ui` skill). The contract wins; an implementation that
> diverges is the bug.

## Variants

None. Stepper is a single composition — there is no variant prop. Tone and
chrome are inherited from `InputGroup` (border `line-default`, surface
`surface-2`) and the two ghost buttons; do not re-skin.

## Sizes

One size: the group is `control-md` (36px), matching `InputGroup`'s single
height. The two buttons are `InputGroupButton size="icon-xs"` — 24px squares
(`size-6`), the same compact button scale `InputGroup` defines. There is no
`sm`/`lg` Stepper.

## States

States are owned by the **group** and the **two buttons**, never by a
stepper-specific surface:

- **focus-visible** — only the input takes focus (both buttons are
  `tabIndex=-1`, out of the tab order). The input is borderless, so its focus
  lifts to the group: border `line-focus` + a 3px ring `line-focus`/50. The
  `−`/`+` buttons are reached by click, not Tab.
- **boundary** (`atMin` / `atMax`) — when the value hits `min` (or `max`), only
  *that one* button dims: it sets `aria-disabled` (NOT native `disabled`) +
  `cursor-not-allowed` + `opacity-50`, and its hover fill is suppressed. Using
  `aria-disabled` is deliberate — native `disabled` would trip the group's
  `:has(:disabled)` rule and grey the entire control. A click on a
  boundary-disabled button is a no-op (guarded, and `commit` clamps anyway).
- **disabled** (whole-Stepper `disabled` prop) — sets native `disabled` on the
  input AND both buttons, so the group's disabled rule fires: bg dims toward
  `surface-3` + `opacity-50` across the whole control. This is the one case
  where greying everything is correct. Distinguish it from the boundary state,
  which dims a single button.
- **invalid** — not modeled by Stepper itself; if a consumer sets `aria-invalid`
  on the input, the inherited group invalid ring (`error-strong` border + 3px
  `error`/20 ring) applies.

## Anatomy

```
InputGroup  ─ role="group", one border + radius + ring (data-slot="stepper")
├─ InputGroupAddon align="inline-start"      ← order-first
│    └─ InputGroupButton size="icon-xs"  [ − MinusIcon ]   tabIndex=-1, aria-label="Decrement"
├─ InputGroupInput  role="spinbutton"  inputMode="numeric"  text-center   ← the value (flex-1)
└─ InputGroupAddon align="inline-end"        ← order-last
     └─ InputGroupButton size="icon-xs"  [ + PlusIcon ]    tabIndex=-1, aria-label="Increment"
```

The input is a *text* input (`type="text"` + `inputMode="numeric"`), not a
native `number` field — so the layout shows these two buttons instead of the
browser's spin arrows, and a `draft` string can hold a mid-edit value before it
parses/clamps. It centers its text (`text-center`). The decrement button sits
left of the value, the increment right of it.

## Accessibility

- The input is `role="spinbutton"` carrying `aria-valuenow` (the current value)
  and `aria-valuemin`/`aria-valuemax` (only when `min`/`max` are finite). Provide
  a name via `aria-label` (or pair with a `<Label htmlFor>` / `Field`).
- Keyboard arithmetic lives on the input: `ArrowUp`/`ArrowDown` step ±`step`,
  `PageUp`/`PageDown` step ±`step×10`, `Home`/`End` jump to `min`/`max` (only
  when finite). The `−`/`+` buttons are pointer affordances, kept out of the tab
  order (`tabIndex=-1`) so keyboard users drive the value from the input.
- Each button has an `aria-label` (`decrementLabel` / `incrementLabel`,
  defaulting to "Decrement" / "Increment") since they are icon-only.
- Boundary buttons announce via `aria-disabled` (kept actionable to AT as a
  disabled control) rather than being removed; the whole-Stepper `disabled`
  uses native `disabled`.
- The focus ring is never removed — it shows on the group when the input has
  keyboard focus.

## Notes

- Value/clamp/draft/keyboard logic is owned by the React implementation; the
  reference CSS expresses the static skin only (the group shell, the two
  `icon-xs` ghost buttons, the centered input, and the per-button
  boundary-disabled dim).
- `icon-xs` buttons are 24px (`size-6`) in the source. As established in
  `input-group.md`, the nearest control token is `control-xs` (22px); the
  reference CSS uses raw `--space-6` (24px) to match the source pixel exactly
  rather than drift to 22px. Recorded there as a token-change wish (a 24px
  control token); not re-filed here.
- The button corner is the source's `rounded-[calc(var(--radius)-3px)]` inset;
  the reference approximates it with `radius-sm`, same as `input-group.md`.

## Implementations

- **Next / @cloud/ui** — `import { Stepper } from "@cloud/ui"`. Props
  `value`/`onChange` (controlled), `min`/`max`/`step`, `disabled`, `id`/`name`,
  `aria-label`, `decrementLabel`/`incrementLabel`. Built on `InputGroup` +
  `InputGroupButton size="icon-xs"`. Clamping, the focus-preserving draft, and
  the keyboard map are owned by the React implementation. API details: the `ui`
  skill. Do not re-skin via `className`; pass props.
- **Artifact (self-contained HTML)** — use `.stepper` on the `.input-group`
  container, with `.input-group__addon--inline-start` / `--inline-end` holding a
  `.btn .btn--ghost .btn--icon .btn--xs .stepper__button` (the `−` and `+`), and
  the value as `.input .input-group__control .stepper__input`. Mark a button at
  its boundary with `aria-disabled="true"` (dims that one button only); set
  `.input-group--disabled` on the root for the whole-Stepper disabled state.
  Same token recipe, same names. Clamp/keyboard/draft behavior is owned by the
  React implementation and is out of scope for the static skin.
