# Split Button

A primary action fused with an adjacent menu trigger — one control that runs a default action on the left and opens a menu of related actions from a chevron on the right.

## When to use

Reach for a Split Button when one action is the obvious default but a small set of
sibling actions belong with it (Save ▾ Save and close / Save as draft; Export ▾
CSV / JSON). If the actions are peers with no default, use a plain
[`dropdown-menu`](./dropdown-menu.md) trigger; if there is only one action, use a
plain [`button`](./button.md). Never more than one primary Split Button per
surface — the left segment counts as the surface's one primary action.

## Variants

The Split Button has no variants of its own — it inherits the
[`button`](./button.md) variant vocabulary. **Both segments carry the same
`.btn--<variant>`**; the fused seam is styled for the two filled variants:

| segment variant | seam |
|---|---|
| `primary` *(default)* / `danger` | a translucent divider off `content-on-primary` (22%) reads on the fill |
| `secondary` / `ghost` | the trigger's own 1px `line-*` border is the seam — no extra divider |

Mixing variants across the two segments is out of contract — a Split Button is one control.

## Sizes

No size prop of its own. The default-action segment takes a `.btn--<size>` from the
[`button`](./button.md) scale; the trigger is a **square icon button**
(`.btn--icon*`) at the height that matches that segment — pair `sm` (28px) with
`.btn--icon-sm` (28px) and `md` (36px) with `.btn--icon-lg` (36px). Keep both
segments height-matched.

## Anatomy

```
.split-button
├─ .btn.btn--<variant>.btn--<size>        ← default action (label, optional iconLeft)
└─ .btn.btn--<variant>.btn--icon<-size>   ← menu trigger (chevron-down, aria-haspopup)
```

- Outer corners keep `radius-md`; the shared inner corners are squared so the two segments read as one pill.
- The trigger overlaps the seam by `-1px` (`margin-inline-start`) so exactly one divider line shows.
- The trigger opens a [`dropdown-menu`](./dropdown-menu.md) / [`popover`](./popover.md) of the sibling actions; that surface is a separate primitive, portalled and anchored to the trigger.

## States

Each segment is a real `.btn` and carries the button states independently
(hover / active / focus-visible / disabled). The trigger additionally reflects
its menu with `aria-expanded` (reuses the hover surface). Disabling the whole
control disables both segments.

## Accessibility

- Two real `<button>`s, not a clickable `<div>`. The left runs its action on click/Enter/Space; the right opens the menu.
- The trigger needs an accessible name (`aria-label`, e.g. "More actions") and `aria-haspopup="menu"` + `aria-expanded`.
- Focus ring (`shadow-focus`) is never removed; each segment is independently focusable in tab order.

## Implementations

- **Next / @cloud/ui** — compose from `Button` (the default action) + a `DropdownMenu` whose `DropdownMenuTrigger` is an icon `Button` (`aria-label`, chevron-down), wrapped so the two share the fused seam. No bespoke re-skin; use the button variants/sizes.
- **Artifact (self-contained HTML)** — wrap two `.btn`s in `.split-button`: the first is the default action (`.btn--<variant> .btn--<size>`), the last is the trigger (`.btn--<variant> .btn--icon<-size>` with a `chevron-down` icon + `aria-label`). Both segments use the same variant and size. Wire the trigger to a `.dropdown-menu` / `.popover`. On top of the inlined `release/tokens.inline.css`.
