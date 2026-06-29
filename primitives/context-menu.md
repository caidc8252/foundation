# Context Menu

A right-click contextual action menu. Wrap any element as a trigger; the menu opens at the pointer with grouped action rows (plain, checkbox, radio, submenu). Shares the menu-row anatomy with dropdown-menu — same row recipe, different trigger gesture.

> **Contract scope.** This file is the cross-consumer *design contract*: the
> panel surface/border/radius/shadow/spacing token recipe, the row anatomy and
> states, a11y. It is the authority both implementations answer to. It
> deliberately does NOT document the React prop *types* or base-ui specifics —
> those live with the Next implementation (`@cloud/ui` + the `ui` skill). When
> the contract and an implementation disagree, the contract is right and the
> implementation is a bug.

## Variants

One elevated panel; no tone/semantic variant on the panel itself (status belongs to `Alert`/`Badge`). The only per-row variant is the item tone:

| part | token recipe |
|---|---|
| panel (`__content`) | bg `surface-2` · text `content-primary` · border `line-default` · radius `radius-lg` (8px) · `shadow-4` · padding `space-1` (4px) · min-width 220px (see Notes) |
| item — `default` | row · gap `space-1.5` · padding `space-2.5` inline / `space-2` block · radius `radius-md` · `text-xs` · text `content-primary` · focus bg `surface-hover` |
| item — `destructive` | text `error-strong` · focus bg `error-bg` |
| `__label` (group heading) | `text-xs` · uppercase · `font-medium` · text `content-tertiary` · padding `space-2.5` inline / `space-1` block |
| `__separator` | 1px hairline `line-default`, bled to the panel edges, `space-1` block margin |
| `__shortcut` | trailing key hint · `text-xs` · text `content-tertiary` · brightens to `content-primary` when its row is focused |

> The implementation's `bg-border` on the separator and `text-muted-foreground` on the shortcut are shadcn aliases — they resolve to `line-default` and `content-tertiary` in this token system.

## Sizes

No size variants. Plain rows, labels, and the submenu trigger are `text-xs`; checkbox/radio rows are `text-sm` (they carry a trailing indicator gutter, so they sit a hair larger). The panel is content-sized vertically (capped to `--available-height` by the positioner, then scrolls) with a fixed 220px minimum width — see Notes for the width-token gap.

## States

The panel is a transient overlay — open/closed transitions are React/base-ui behavior (fade + `zoom-95` + a directional slide keyed off the resolved side; transform origin tracks the side). The reference CSS paints the static open skin only.

The rows carry the interactive states:

- **focus** — bg `surface-hover` (default) / `error-bg` (destructive). base-ui drives row focus via keyboard roving and pointer hover (`outline-hidden` — no separate ring on rows; the focused row is shown by its fill).
- **submenu trigger open** — `data-open` holds the `surface-hover` fill while the submenu is shown.
- **checked** (checkbox/radio rows) — a trailing check glyph appears in the right-edge indicator gutter; the row fill itself is unchanged.
- **disabled** (`data-disabled`) — `cursor-not-allowed` + `opacity-50`.

## Anatomy

```
 ┌──────────────────────────────────────┐  ← .context-menu__content (bg surface-2, shadow-4, border)
 │  ACTIONS                              │  ← .context-menu__label (uppercase group heading)
 │  ┌──────────────────────────────────┐│
 │  │ ⧉  Cut                    ⌘X     ││  ← .context-menu__item  ([icon] label … __shortcut)
 │  │ ⧉  Copy                   ⌘C     ││
 │  ├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤│  ← .context-menu__separator
 │  │    Show gridlines           ✓    ││  ← .context-menu__item--checkbox (trailing indicator)
 │  │    More tools             ▸      ││  ← .context-menu__sub-trigger (trailing chevron)
 │  │ ⧉  Delete                        ││  ← .context-menu__item--destructive (error tone)
 │  └──────────────────────────────────┘│
 └──────────────────────────────────────┘
```

Rows (composed by the consumer):
- **`__item`** — `[icon?] label [__shortcut?]`. Leading icon is an inline slot (defaults 14px / `space-3.5`); the optional `__shortcut` is pushed to the row's trailing edge (`margin-inline-start: auto`). `--destructive` modifier for delete-style actions; `--inset` modifier reserves a leading gutter so iconless rows align under rows that have icons.
- **`__item--checkbox` / `__item--radio`** — label with a right-edge indicator gutter (`padding-inline-end` reserved); a check glyph paints there when selected. These are `text-sm` and use a tighter `space-1.5` leading inset.
- **`__sub-trigger`** — an item-shaped row that opens a nested submenu; carries a trailing chevron and an open-state fill.
- **`__label`** — non-interactive uppercase group heading.
- **`__separator`** — a hairline divider between groups.

The trigger is whatever element the consumer wraps; it is NOT part of the panel skin (it only gets `user-select: none`).

## Accessibility

- base-ui owns the menu semantics: `role="menu"` on the panel, `menuitem` / `menuitemcheckbox` / `menuitemradio` on rows, the right-click (and long-press) open gesture, keyboard roving (Arrow keys), `Enter`/`Space` to activate, `Escape` to dismiss, outside-click dismissal, submenu open/close, and focus return to the trigger on close.
- Rows manage focus via roving tabindex; the focused row is indicated by its `surface-hover` fill (`outline-hidden` suppresses a second ring on rows — the fill *is* the focus affordance).
- Destructive rows read as ordinary menu items — the red tone is presentational, so the label must itself be unambiguous ("Delete file").
- Checkbox/radio rows expose checked state via aria (`aria-checked`, with `mixed` for indeterminate where applicable); the trailing glyph is the visual mirror, not the source of truth.
- An icon-only row still needs an accessible name (label text or `aria-label`).

## Notes

- **Behavior is owned by the React implementation.** Open/close, pointer-position anchoring, portalling, side/align positioning, keyboard roving, submenu timing, and dismissal are all base-ui `ContextMenu` behaviors. The reference CSS expresses the **static open skin only** — no enter/exit keyframes, no positioning. The artifact side renders a single open panel for prototyping.
- **Min-width token gap.** The panel is `min-w-[220px]`; no sizing token expresses 220px (the cx/control scales top out far below, `container-content` is 1280px). The reference CSS pins `min-width: 220px` as a documented one-off. *Token-change wish:* if floating panels (popover 288px, this menu 220px) standardize, propose an `--size-overlay-{sm,md}` token family; until then these are per-component constants.
- **Half-step / odd spacing.** Item inline padding is `px-2.5` (10px = `cx-sm`); block padding is `py-2` (8px = `space-2`); the row gap is `gap-1.5` (6px) and the inset gutter is `pl-7` (28px). The 6px and 28px values are between named raw steps (the scale jumps `space-6` 24px → `space-8` 32px, no 28px). The reference CSS uses the `cx-sm` token where it lands exactly (10px) and `calc()` over the raw scale for the rest — 6px as `space-1 + space-1/2`, 28px as `space-6 + space-1` — matching how `tooltip`/`alert`/`popover` handle their half-steps.
- **Shares the menu row with dropdown-menu.** Context-menu and dropdown-menu render the same row recipe; the difference is the trigger gesture (right-click vs. button click), owned by the React side. The row classes are namespaced under `.context-menu__` here to match this file's block; a future dropdown-menu contract should reuse the same recipe rather than reinvent the row tone/spacing.
- **`shadow-lg` on `SubContent`.** The submenu reuses the content skin and tacks on `shadow-lg` (shadcn alias) — it resolves to the same overlay elevation (`shadow-4`) in this system; no extra step is emitted.

## Implementations

- **Next / @cloud/ui** — `import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuCheckboxItem, ContextMenuRadioItem, ContextMenuRadioGroup, ContextMenuLabel, ContextMenuSeparator, ContextMenuShortcut, ContextMenuGroup, ContextMenuSub, ContextMenuSubTrigger, ContextMenuSubContent } from "@cloud/ui"`. base-ui `ContextMenu` under the hood; `ContextMenuContent` defaults to `side="right"` / `align="start"` / `alignOffset={4}` / `sideOffset={0}`. `ContextMenuItem` takes `variant?: "default" | "destructive"` and `inset?: boolean`. Open/close, pointer anchoring, positioning, roving focus, submenus, and dismissal are **behavior owned by the React implementation** — the reference CSS expresses the static open panel skin only. API details: the `ui` skill.
- **Artifact (self-contained HTML)** — use `.context-menu__content` for the panel + `.context-menu__item` (`--destructive` / `--inset`), `.context-menu__item--checkbox` / `--radio`, `.context-menu__sub-trigger`, `.context-menu__label`, `.context-menu__separator`, `.context-menu__shortcut`, on top of the inlined `release/tokens.inline.css`. The artifact renders a *static* open panel (positioning / show-hide / roving is the React side's job); same elevated recipe (`surface-2` fill, `line-default` border, `shadow-4`).
