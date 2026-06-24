# Popover

A small floating panel anchored to a trigger, portalled above the page. Holds rich content — a header/title/description, a form, or a list of `MenuItem` actions (the dropdown-menu shape).

> **Contract scope.** This file is the cross-consumer *design contract*: the
> panel's surface/border/radius/shadow/spacing/typography token recipe, the
> slot anatomy, the `MenuItem` row states, a11y. It is the authority both
> implementations answer to. It deliberately does NOT document the React prop
> *types* or base-ui specifics — those live with the Next implementation
> (`@cloud/ui` + the `ui` skill). When the contract and an implementation
> disagree, the contract is right and the implementation is a bug.

## Variants

Single visual variant — one elevated panel. It carries no tone/semantic variants
(no success/warning/error popover); status belongs to `Alert`/`Badge`. The only
axes are placement (`side` + `align` + their offsets), owned by the positioner.

| part | token recipe |
|---|---|
| panel | bg `surface-1` · text `content-primary` · radius `radius-lg` (8px) · 1px hairline ring `content-primary`/10% · `shadow-3` · padding `cx-sm` (10px) · gap `cx-sm` between children · font `text-sm` |
| `MenuItem` (row) | full-width row · padding `space-2` inline / `space-1.5` block · radius `radius-md` · `text-sm` · text `content-primary` · hover bg `surface-hover` |
| `MenuItem` destructive | text `error-strong` · hover bg `error-bg` |

(The implementation's `bg-popover` / `text-popover-foreground` are shadcn aliases
for the elevated-panel pair — they resolve to `surface-1` fill on `content-primary`
text in this token system. `shadow-md` maps to `shadow-3` (the overlay-elevation
step); `ring-foreground/10` is a 1px hairline at `content-primary` 10%.
`text-muted-foreground` on the description resolves to `content-secondary`.)

## Sizes

No size variants. The panel has a fixed default width of **288px** (`w-72`) and is
otherwise content-sized vertically; consumers override width via `className` when a
panel needs to be wider or narrower. Padding is fixed at `cx-sm` (10px). See Notes
for the width token gap.

## States

A popover is a transient overlay — the panel itself has no hover/active/disabled/
invalid of its own (the *trigger* owns those). Its only panel states are open/closed
transitions, owned by the React implementation:

- **open** — fade + zoom-in entrance (`fade-in` + `zoom-in-95`), plus a short directional slide keyed off the resolved `side` (slides down from a `bottom` placement, etc.).
- **closed** — fade + zoom-out exit.
- transform origin tracks the resolved side (`origin-(--transform-origin)`).

The `MenuItem` rows DO carry interactive states (they are real `<button>`s):

- **hover** — bg `surface-hover` (default) / `error-bg` (destructive).
- **focus-visible** — `shadow-focus` ring (keyboard roving through the list).
- **disabled** — `opacity-40` + `cursor-not-allowed`.

The panel animations are base-ui behaviors; the reference CSS expresses the static
open skin only (no enter/exit keyframes).

## Anatomy

```
 ┌─────────────────────────────────┐  ← .popover (panel: bg surface-1, shadow-3, ring)
 │  .popover__header               │
 │    .popover__title  (medium)    │
 │    .popover__description (2nd)  │
 │  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
 │  …arbitrary content / form…     │
 │  ┌─────────────────────────────┐│
 │  │ ▸ .menu-item                ││  ← rows for the dropdown-menu shape
 │  │ ▸ .menu-item                ││
 │  │ ▸ .menu-item.menu-item--…   ││     destructive row (error tone)
 │  └─────────────────────────────┘│
 └─────────────────────────────────┘
```

Slots (all optional, composed by the consumer):
- **`__header`** — stacks `__title` + `__description` with a tight `space-0.5` gap.
- **`__title`** — `font-medium`, `text-sm`; the panel's heading.
- **`__description`** — `content-secondary` supporting text.
- **`.menu-item`** — a full-width action row for the dropdown-list shape; renders an optional leading icon + left-aligned label, with a `destructive` modifier for delete-style actions.

The trigger is a separate element (any focusable control) and is NOT part of the
panel skin. Child layout is a vertical flex column with `cx-sm` (10px) gap.

## Accessibility

- base-ui wires the trigger↔panel relationship, `role`, open/close, focus return to the trigger on close, and Escape-to-dismiss / outside-click dismissal.
- Focus moves into the panel on open; the panel manages its own focus (it is not a focus-trapping modal — it is a dismissible overlay).
- For the dropdown-list shape, `MenuItem` rows are real `<button>`s (keyboard-focusable, Space/Enter activate); destructive rows still read as ordinary buttons — the red tone is presentational, so the action label must itself be unambiguous ("Delete user").
- The trigger must be a real focusable control so keyboard users can open the panel.
- Title/description, when present, should be associated as the panel's accessible name/description (base-ui's `Title`/`Description` wire this).

## Notes

- **Width token gap.** The default panel width is `w-72` (288px). No sizing token expresses 288px (the `container-content` token is 1280px; the control/cx scales top out far below). The reference CSS pins `width: 18rem` as a documented one-off and caps `max-width` to the viewport so the panel never overflows on small screens. *Token-change wish:* if floating panels standardize on a small set of widths, propose an `--size-popover-{sm,md}` token family; until then 288px is a single-component constant, not a reusable rhythm.
- **Half-step spacing.** `MenuItem` block padding is `py-1.5` (6px) and the header gap is `gap-0.5` (2px) — half-steps the raw scale doesn't name (`--space-1` 4px, `--space-2` 8px). The reference CSS uses `calc()` over the raw steps rather than inventing tokens, matching how `tooltip`/`alert` handle their half-steps.
- **`MenuItem` lives in popover.tsx but is shared.** The same `MenuItem` row is the building block for both popover-menus and dropdown menus; its `.menu-item` class is intentionally not namespaced under `.popover__` so it can be reused inside any list-shaped overlay. Reuse the class — do not redefine it per overlay.

## Implementations

- **Next / @cloud/ui** — `import { Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription, MenuItem } from "@cloud/ui"`. base-ui `Popover` under the hood; wrap the trigger in `PopoverTrigger`, content in `PopoverContent` (props `side` `sideOffset` `align` `alignOffset`, default `side="bottom"` / `align="center"` / `sideOffset={4}`). Open/close, portalling, positioning, focus return, and dismissal are **behavior owned by the React implementation** — the reference CSS expresses the static open panel skin only. API details: the `ui` skill.
- **Artifact (self-contained HTML)** — use `.popover` for the panel + `.popover__header` / `.popover__title` / `.popover__description` for the heading slots, and `.menu-item` (+ `.menu-item--destructive`) for action rows, on top of the inlined `dist/tokens.inline.css`. The artifact side renders a *static* open panel (positioning/show-hide is the React side's job); same elevated recipe (`surface-1` fill, `shadow-3`, hairline ring).
