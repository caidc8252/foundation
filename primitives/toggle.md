# Toggle

A press-toggle button with on/off (pressed) state. Used standalone for a single boolean-as-button (bold, mute, pin), or as a child of `<ToggleGroup>` for segmented / chip pickers. This is a button, not a switch — it shares button interaction tokens and the pressed look is `data-pressed`, not a sliding track.

## When to use — Toggle vs Toggle Group

Both are **two-state (on/off) buttons** — a `Toggle` is a button that is either on or off.

- **Toggle** (this component) — one standalone on/off button: a lone Bold, a favorite / mute / pin, a "show grid". Independent toggles sitting in a row are still separate `Toggle`s.
- **Toggle Group** ([`toggle-group.md`](./toggle-group.md)) — a set of these buttons managed as one control. Its **select mode** lives on the container as `data-type` (`single` = radio-like, ≤1 on · `multiple` = any number on) and is **independent of the visual variant**: a `segmented` group can be multi-select, a `cloud` group can be single-select.

Rule of thumb: one independent on/off → **Toggle**; a set managed together → **Toggle Group** (then choose the select mode and the look independently).

## Variants

A `Toggle` has two **own** variants. A third axis — its look inside a `<ToggleGroup>` — is not a prop on `Toggle` at all: the item restyles purely from the parent group's `data-variant` (`in-data-[variant=…]`), with no prop threading.

| variant | use | token recipe |
|---|---|---|
| `default` *(default)* | standalone press-toggle button | bg `surface-2` · border `line-strong` · radius `radius-md` · text `content-primary` · hover `surface-hover` · pressed (`data-pressed`) `surface-active` |
| `outline` | standalone, transparent fill | same chrome as `default` but bg `transparent` |

### Group-driven looks (no prop on the item — keyed off parent `data-variant`)

| group variant | item look | token recipe |
|---|---|---|
| `outline` *(group default)* | connected segments sharing one outer border | radius flattened (square) · `border-0` + right hairline `line-strong` (last item drops it) — track owns the outer border + radius |
| `segmented` | borderless transparent item on a tinted track; pressed item lifts into a pill | radius `radius-sm` · `border-0` · bg `transparent` · text `content-secondary` · hover text `content-primary` (bg stays transparent) · pressed bg `surface-2` + text `content-primary` + `shadow-1` |
| `cloud` | standalone rounded-full bordered chip (NOT a shared track) | `height:auto` · radius `radius-full` · border `line-default` · bg `surface-2` · padding `--spacing-cx-sm` (10px) inline / `--space-1` block · text `text-xs` weight normal · text `content-secondary` · hover border `line-strong` (bg stays) · pressed border `primary-500` + bg `primary-50` + weight medium + text `primary-700` |
| `plain` | no restyle — caller's children own their selected look | (none — Toggle base recipe applies) |

> The group's `segmented`/`cloud` stacks **override** the base bg/border/hover/pressed above; an item never fights its container.

## Sizes

| size | height / recipe | use |
|---|---|---|
| `sm` | `control-sm` (28px) · `px-cx-sm` · `text-xs` | dense toolbars |
| `md` *(default)* | `control-md` (36px) · `px-cx-md` · `text-md` | standard |
| `auto` | content-driven (`px-cx-md` · `py-2` · `text-md` · `gap-1.5`) | option cards / tiles |

Horizontal padding follows the `cx-*` scale; never an arbitrary px. The `cloud` group look forces its own compact `height:auto` sizing, overriding the size height.

## States

- **hover** — `surface-hover` (default/outline); transparent-with-text-darken (segmented); border darken (cloud).
- **pressed** (`data-pressed`, the on state) — per-variant steps above. This is the toggle's "checked": `surface-active` standalone, pill-lift in segmented, primary tint in cloud.
- **focus-visible** — `shadow-focus` ring. Never removed.
- **disabled** — `cursor-not-allowed` + `opacity-50` (also when the parent `ToggleGroup` is disabled).

## Anatomy

`[ icon? ] label? [ icon? ]` — an inline-flex row, `gap-1.5`, centered, `whitespace-nowrap`. SVG children are `pointer-events-none` + `shrink-0` and may stand alone (icon-only toggle) or sit beside text. No separate track/thumb structure — the whole button surface is the affordance and `data-pressed` recolors it.

## Accessibility

- Real toggle-button semantics from base-ui — `aria-pressed` reflects the on/off state; space/enter toggle it.
- Inside a `single` `ToggleGroup` it behaves radio-like (max one pressed); `multiple` toggles independently. The group owns roving focus / arrow-key navigation.
- An icon-only toggle needs an accessible name (`aria-label`).
- Focus ring (`shadow-focus`) is never removed.

## Implementations

- **Next / @cloud/ui** — `import { Toggle, ToggleGroup } from "@cloud/ui"`. base-ui `Toggle` / `ToggleGroup` under the hood; **the on/off behavior, roving focus, and single-vs-multiple selection are owned by the React implementation** — the reference CSS expresses the static skin only. Props `variant` (`default`/`outline`) `size` (`sm`/`md`/`auto`); pressed state via `pressed`/`defaultPressed`/`onPressedChange`. Group look comes from `<ToggleGroup variant>` (`outline`/`segmented`/`cloud`/`plain`), surfaced to items as `data-variant`. Do not re-skin via `className` — pick a variant or wrap in the right group.
- **Artifact (self-contained HTML)** — use `.toggle` + `.toggle--<variant>` + `.toggle--<size>` on a `<button>`, on top of the inlined `release/tokens.inline.css`. The pressed state is `aria-pressed="true"` (the static stand-in for `data-pressed`). This is the **standalone** single toggle. For a set of toggles acting as one control (outline / segmented / cloud looks), use the **`toggle-group`** component instead (`.toggle-group` + `.toggle-group--<variant>` + `.toggle-group__item`) — see [`toggle-group.md`](./toggle-group.md). Same token recipe, same names.
