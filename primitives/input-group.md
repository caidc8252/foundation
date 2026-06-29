# Input Group

A single-border container that fuses an `Input`/`Textarea` with leading/trailing addons (icons, text affixes, action buttons, keyboard hints). One unified field that owns the border, focus ring, invalid, and disabled treatment so the control and its addons read as one control.

> **Contract scope.** This file is the cross-consumer *design contract*: the
> slot vocabulary, the addon alignment recipe, states, anatomy, a11y. It is the
> authority both implementations answer to. It deliberately does NOT document
> the React prop *types* or the click-to-focus / order-swapping behavior — those
> live with the Next implementation (`@cloud/ui` + the `ui` skill). When the
> contract and an implementation disagree, the contract is right and the
> implementation is a bug.

## Slots

Input Group is not a variant family — it is a container plus four addon-shaped slots. The group is the one bordered surface; every slot inside goes borderless/transparent so a single ring shows.

| slot | role | token recipe |
|---|---|---|
| `InputGroup` *(container)* | the bordered shell | bg `surface-2` · border `line-default` · radius `radius-md` · height `control-md` (auto when it holds a textarea or a block addon) |
| `InputGroupInput` / `InputGroupTextarea` | the control | borderless + transparent fill (`flex-1`); inherits group border/ring — never paints its own |
| `InputGroupAddon` | a slot wrapper for affix/icon/button content | text `content-secondary` · `text-sm` · weight 500 · inline gap `space-2`; cursor `text` (clicking focuses the input) |
| `InputGroupText` | non-interactive label inside the group (currency symbol, unit suffix) | text `content-secondary` · `text-sm` · inline gap `space-2` |
| `InputGroupButton` | an action button inside the group (clear, reveal, submit) | reuses `.btn`; defaults `variant="ghost"` + `size="xs"`, `shadow-none`, `type="button"` |

## Addon alignment

`InputGroupAddon`'s `align` selects where the addon sits and whether the group stays a row or stacks into a column. `inline-start` is the default.

| align | placement | effect on group |
|---|---|---|
| `inline-start` *(default)* | leading, before the control | row layout · `order-first` · addon padding-left `space-2` · input gains a small left inset |
| `inline-end` | trailing, after the control | row layout · `order-last` · addon padding-right `space-2` · input gains a small right inset |
| `block-start` | a full-width row above the control | group becomes `height:auto` + column · addon spans full width · input pads its top |
| `block-end` | a full-width row below the control | group becomes `height:auto` + column · addon spans full width · input pads its bottom |

A button or `kbd` placed in an inline addon pulls a hair toward the edge (negative margin) so its visual box hugs the field border instead of floating with the addon's own padding.

### `--block` modifier

When the group contains a `block-start` or `block-end` addon, add `.input-group--block` on the container to switch it from a single-line row to a column layout:

```css
.input-group--block { height: auto; flex-direction: column; }
```

- **No `--block`** → the group is a fixed-height row (`control-md`, 36px) — for inline addons only.
- **With `--block`** → `height: auto` + `flex-direction: column` — the group stacks the
  block addon(s) and the control vertically. Used when the group wraps a `Textarea`
  with a `block-end` character count, or a `block-start` toolbar above a multi-line
  control.

## Sizes

The group itself is a single height — `control-md` (36px), or `height:auto` when it wraps a `Textarea` or a `block-*` addon. There is no `sm`/`lg` group size.

`InputGroupButton` carries its own compact size scale (distinct from `Button`'s), defaulting to `xs`:

| button size | recipe | use |
|---|---|---|
| `xs` *(default)* | 24px box · gap `space-1` · tighter radius (`radius-md` − 3) · padding-inline `space-1.5` · icon `size-3.5` | inline text+icon action |
| `sm` | inherits the base `.btn` `sm` metrics | slightly larger inline action |
| `icon-xs` | 24px square · no padding | icon-only at xs |
| `icon-sm` | 28px square · no padding | icon-only at sm |

`kbd` hints inside an addon get a tighter corner (`radius-md` − ~5) than the field.

## States

States are owned by the **group**, not the inner control — the borderless control defers all chrome upward:

- **hover** — no chrome change (matches `default` `input`).
- **focus-visible** — when the inner control has focus, the group border goes `line-focus` + a 3px ring `line-focus`/50. Triggered by the control's focus, applied to the container.
- **invalid** (`aria-invalid` on the control) — group border `error-strong` + 3px ring `error`/20.
- **disabled** (a disabled control inside) — group bg dims toward `surface-3` + `opacity-50`; addons fade with it.
- **inside a combobox popover** — the group *suppresses* its own border/ring on focus and defers to the popover so the focus treatment isn't doubled. Behavior owned by the React implementation; not expressible in static CSS.

## Anatomy

```
InputGroup  ─ role="group", one border + radius + ring
├─ InputGroupAddon align="inline-start"   [ icon | text | button | kbd ]   ← order-first
├─ InputGroupInput / InputGroupTextarea   the borderless control (flex-1)
└─ InputGroupAddon align="inline-end"     [ button | kbd | text | icon ]   ← order-last
```

`block-start` / `block-end` addons switch the container to a column and span its full width (toolbar above / status row below a textarea). An addon contains any of: an `InputGroupText` affix, an icon, one or more `InputGroupButton`s, or a `kbd` hint. Slot order in markup is normalized by `order-first` / `order-last` so source order need not match visual order.

## Accessibility

- The container and each addon are `role="group"`; the real control inside keeps native `<input>`/`<textarea>` semantics.
- Pair the control with a `<Label htmlFor>` (or wrap in `Field`) — the group is not itself a label.
- Clicking an addon (outside its buttons) focuses the input, so the whole field is one hit target; addon text is `select-none`.
- Error state must set `aria-invalid` on the control so AT announces it; the group's red border is the visible echo, not the announcement.
- Focus ring is never removed — it moves to the container but is always shown on keyboard focus.

## Notes

- Unlike `Input`'s `prefix`/`suffix` (non-interactive only), Input Group addons can hold interactive buttons and route clicks; reach for Input Group when you need an action inside the field, and for `Input` `prefix`/`suffix` for a plain adornment.
- Implementation aliases that map into this token system: `border-input` → `line-default`, `border-ring`/`ring-ring` → `line-focus`, `border-destructive`/`ring-destructive` → `error-strong`/`error`, `text-muted-foreground` → `content-secondary`. The `rounded-[calc(var(--radius)-3px)]` button corner and `calc(var(--radius)-5px)` kbd corner are derived insets — the reference CSS approximates them with `radius-sm` (no token expresses the exact calc; recorded as a token-change wish).
- `InputGroupButton`'s `xs`/`icon-xs` boxes are 24px in the source; the nearest control token is `control-xs` (22px). The reference CSS uses raw `--space-6` (24px) to match the source pixel exactly rather than drift to 22px.

## Implementations

- **Next / @cloud/ui** — `import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupTextarea, InputGroupText, InputGroupButton } from "@cloud/ui"`. The group wraps base-ui `Input`/`Textarea`; addon `align`, click-to-focus, `order-*` swapping, and combobox-popover border deferral are owned by the React implementation. API details: the `ui` skill. Do not re-skin via `className`; compose the slots.
- **Artifact (self-contained HTML)** — use `.input-group` as the container, `.input-group__addon` (+ `--inline-start`/`--inline-end`/`--block-start`/`--block-end`) for addons, `.input-group__text` for affixes, and the control wears `.input-group__control`. Action buttons reuse `.btn` (`.btn--ghost` `.btn--xs`/`.btn--icon`). Same token recipe, same names. The borderless control and group-owned focus/invalid rings are reproduced statically; combobox deferral and click-to-focus are JS behaviors and are out of scope for the static skin.
