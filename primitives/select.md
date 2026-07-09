# Select

A dropdown for choosing one option from a list. The control for single-choice when the option set is known and finite.

## Variants

The trigger has a single visual variant. The composable parts are slots: `Select` (root) · `SelectTrigger` · `SelectValue` · `SelectContent` · `SelectGroup` · `SelectLabel` · `SelectItem` · `SelectSeparator`.

| part | token recipe | artifact class |
|---|---|---|
| `SelectTrigger` | bg `surface-2` · text `content-primary` (`text-md`) · border `line-default` · hover border `line-strong` · focus border `line-focus` + `shadow-focus` ring · chevron `content-tertiary` · placeholder text `content-tertiary` | `.select` (on a native `<select>`) |
| `SelectContent` (popup) | bg `surface-2` · text `content-primary` · border `line-default` · radius `radius-md` · `shadow-4` · padding `space-1` | — **React only** |
| `SelectItem` | radius `radius-md` · `text-md` · focus(highlight) bg `surface-hover` + text `content-primary` · check indicator | — **React only** |
| `SelectLabel` (group label) | `text-xs` · `content-tertiary` | — **React only** |
| `SelectSeparator` | 1px rule `line-default` | — **React only** |

> **Only the trigger has an artifact skin.** The popup is portalled, positioned and
> keyboard-driven — behavior a static artifact cannot reproduce. So no `.select__content`
> / `__item` / `__label` / `__separator` classes exist, and none are coming. Those recipes
> are here so the React implementation has one authority to answer to, **not** because
> they are in the artifact closed set. See §Implementations.

## Sizes

The trigger takes a `size` prop. Note the value vocabulary differs from Button/Input.

| size | height token | use |
|---|---|---|
| `sm` | `control-sm` (28px) | dense toolbars, inline filters |
| `default` *(default)* | `control-md` (36px) | standard |

There is no `md`/`lg` — the only two values are `sm` and `default`.

## States

- **hover** (trigger) — border lifts to `line-strong`.
- **focus-visible** (trigger) — border `line-focus` + the `shadow-focus` ring (the one focus-ring token every control shares; it *is* `line-focus` at 25%).
- **disabled** (trigger) — `cursor-not-allowed` + `opacity-50`.
- **invalid** (`aria-invalid` on trigger) — border `error-strong` + 2px ring `error`/20.
- **placeholder** — when no value is selected, the value text renders `content-tertiary` (`data-placeholder`).
- **item highlighted** (keyboard/pointer focus) — bg `surface-hover` + text `content-primary`.
- **item disabled** — `cursor-not-allowed` + `opacity-50`.
- **item selected** — trailing check icon at the right edge.

## Anatomy

`SelectTrigger` = `[ SelectValue ] [ chevron-down ]` (chevron is `size-3.5`, `content-tertiary`, auto-appended). The popup is portalled and positioned (`SelectContent` props `side`/`sideOffset`/`align`/`alignOffset`/`alignItemWithTrigger`), max-height clamped to available space with scroll arrows. Each `SelectItem` = `[ item text ] [ check-indicator when selected ]`.

## Accessibility

- Real listbox semantics from base-ui — roving focus, type-ahead, Esc-to-close handled by the primitive.
- The trigger is a real `<button>`; pair with a `<Label>`/`Field` for a name.
- Focus ring is never removed, only restyled.

## Notes

- This is **base-ui** (`@base-ui/react/select`), not Radix. Prop names and slot composition follow base-ui (e.g. `SelectContent` exposes `alignItemWithTrigger`, scroll arrows are `ScrollUpArrow`/`ScrollDownArrow`). Do not assume Radix APIs.
- Size vocabulary is `sm` | `default`, not the `xs/sm/md/lg` of other controls.
- The popup width tracks the trigger (`w-(--anchor-width)`) with a `min-w-36` floor.

## Implementations

- **Next / @cloud/ui** — `import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel, SelectSeparator } from "@cloud/ui"`. base-ui `Select` under the hood. API details: the `ui` skill. Compose the slots; do not re-skin via `className`.
- **Artifact (self-contained HTML)** — for a static prototype use a native `<select class="select">` styled by `./primitives.css` (matches the trigger recipe), on top of the inlined `release/tokens.inline.css`. A native select cannot reproduce the portalled popup / per-item check; use it for layout fidelity only.
