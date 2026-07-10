# Popover

A small floating panel anchored to a trigger, portalled above the page. Holds rich content — a header/title/description, a form, or a list of `MenuItem` actions (the dropdown-menu shape).

## Variants

Single visual variant — one elevated panel. It carries no tone/semantic variants
(no success/warning/error popover); status belongs to `Alert`/`Badge`. The only
axes are placement (`side` + `align` + their offsets), owned by the positioner.

| part | token recipe |
|---|---|
| panel | bg `surface-1` · text `content-primary` · radius `radius-lg` (8px) · 1px hairline ring `content-primary`/10% · `shadow-3` · padding `cx-sm` (10px) · gap `cx-sm` between children · font `text-md` |
| `MenuItem` (row) | full-width row · padding `space-2` inline / `space-1.5` block · radius `radius-md` · `text-md` · text `content-primary` · hover bg `surface-hover` |
| `MenuItem` destructive | text `error-strong` · hover bg `error-bg` |

(The implementation's `bg-popover` / `text-popover-foreground` are shadcn aliases
for the elevated-panel pair — they resolve to `surface-1` fill on `content-primary`
text in this token system. `shadow-md` maps to `shadow-3` (the overlay-elevation
step); `ring-foreground/10` is a 1px hairline at `content-primary` 10%.
`text-muted-foreground` on the description resolves to `content-secondary`.)

## Sizes

No size variants. The panel has a fixed default width of **288px** (`w-72`,
`--spacing-popup-xl`) and is otherwise content-sized vertically; consumers override
width via `className` when a panel needs to be wider or narrower. Padding is fixed
at `cx-sm` (10px).

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
- **`__title`** — `font-medium`, `text-md`; the panel's heading.
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

- **Width.** The default panel width is `w-72` (288px), expressed as `--spacing-popup-xl` — part of the shared popup-sizing family (also used by `context-menu`, `dropdown-menu`, `hover-card`). `max-width: 100%` still caps it to the viewport so the panel never overflows on small screens.
- **Half-step spacing.** `MenuItem` block padding is `py-1.5` (6px) and the header gap is `gap-0.5` (2px) — half-steps the raw scale doesn't name (`--space-1` 4px, `--space-2` 8px). The reference CSS uses `calc()` over the raw steps rather than inventing tokens, matching how `tooltip`/`alert` handle their half-steps.
- **`MenuItem` is shared, not popover-specific.** The same `MenuItem` row is the building block for both popover-menus and dropdown menus; its `.menu-item` class is intentionally not namespaced under `.popover__` so it can be reused inside any list-shaped overlay. Reuse the class — do not redefine it per overlay.
- **Dropdown alignment convention.** The positioner's `align` axis takes `start` / `center` / `end`; base-ui's default is `center`. The menu-list / dropdown shape conventionally anchors to the trigger's *start* edge (`align="start"`) so the panel's leading edge lines up under the trigger — a center-aligned menu reads as unusual. Prefer `align="start"` for menu popovers; keep `center` for symmetric info / summary panels, and `end` when the trigger sits near the viewport's trailing edge and a start-aligned panel would overflow.

## Implementations

- **Next / @cloud/ui** — `import { Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription, MenuItem } from "@cloud/ui"`. base-ui `Popover` under the hood; wrap the trigger in `PopoverTrigger`, content in `PopoverContent` (props `side` `sideOffset` `align` `alignOffset`, default `side="bottom"` / `align="center"` / `sideOffset={4}`). Open/close, portalling, positioning, focus return, and dismissal are **behavior owned by the React implementation** — the reference CSS expresses the static open panel skin only.
- **Artifact (self-contained HTML)** — use `.popover` for the panel + `.popover__header` / `.popover__title` / `.popover__description` for the heading slots, and `.menu-item` (+ `.menu-item--destructive`) for action rows, on top of the inlined `release/tokens.inline.css`. The artifact side renders a *static* open panel (positioning/show-hide is the React side's job); same elevated recipe (`surface-1` fill, `shadow-3`, hairline ring).
