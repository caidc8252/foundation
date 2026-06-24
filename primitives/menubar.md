# Menubar

A horizontal application-style menu bar — a row of top-level triggers ("File", "Edit", "View") that each drop a menu of grouped actions. Desktop-app chrome, not page navigation.

> **Contract scope.** This file is the cross-consumer *design contract*: the
> bar/trigger surface, border, radius, spacing, typography, and states. It is the
> authority both implementations answer to. It deliberately does NOT document the
> React prop *types* or base-ui specifics — those live with the Next
> implementation (`@cloud/ui` + the `ui` skill). When the contract and an
> implementation disagree, the contract is right and the implementation is a bug.

## Parts

A menubar is a composed set of slots, not a single element. This contract owns the **bar** and its **trigger** skin only; everything that drops below a trigger (the popup, its action / checkbox / radio / sub rows, labels, separators, shortcuts) is the menu-row recipe already governed by **dropdown-menu.md** — the menubar parts (`MenubarContent`, `MenubarItem`, `MenubarCheckboxItem`, `MenubarRadioItem`, `MenubarLabel`, `MenubarSeparator`, `MenubarShortcut`, `MenubarSub`, `MenubarSubTrigger`, `MenubarSubContent`) are thin wrappers over the matching `DropdownMenu*` parts.

| part | role | token recipe |
|---|---|---|
| `bar` (root) | the horizontal track holding the triggers | bg `surface-2` · border `line-subtle` · radius `radius-lg` · padding `2px` *(half-step, see notes)* · `1px` gap between triggers |
| `trigger` | a top-level menu opener ("File", "Edit") | height `26px` *(no token, see notes)* · `px-cx-sm` (10px) · radius `radius-sm` · `text-xs` · weight 500 · text `content-secondary` · hover/open bg `surface-hover` |
| popup + rows | the dropped menu surface and its rows | **governed by dropdown-menu.md** — see Implementations & notes |

## States

The bar has no states of its own. The trigger carries them:

- **hover** — bg `surface-hover` (the only resting-to-hover step; the trigger has no chrome until hovered).
- **open / expanded** (`aria-expanded`) — holds the same `surface-hover` fill while its menu is open; selected state and hover share one surface (there is no distinct selected fill).
- **focus** — `outline-hidden`; keyboard focus roams across triggers and is shown by the same `surface-hover` fill, not a separate ring (matches the menu-row focus model).
- **disabled** — inherited from the underlying trigger; `cursor-not-allowed` + `opacity-50`.

## Anatomy

```
 ┌──────────────────────────────────────────────┐  ← .menubar (bar: surface-2, line-subtle, radius-lg, 2px pad)
 │  File     Edit     View     Help              │  ← .menubar__trigger ×N  (1px gap between)
 └──────┬───────────────────────────────────────┘
        ▼
   ┌──────────────────────┐   ← MenubarContent → dropdown-menu popup skin (surface-2, line-default, shadow-4)
   │  New File      ⌘N    │   ← MenubarItem / Shortcut → dropdown-menu rows
   │  Open…         ⌘O    │
   │  ─────────────────   │   ← MenubarSeparator
   │  ✓ Word Wrap         │   ← MenubarCheckboxItem
   │  More Tools     ▸    │   ← MenubarSubTrigger → MenubarSubContent (nested popup)
   └──────────────────────┘
```

- **bar** is a `flex` row: triggers sit inline with a `1px` gap, the bar's `2px` padding insetting them from its rounded edge.
- **trigger** is a compact flex row of label text (icons are uncommon here but allowed as an inline slot, same as a menu row). It is shorter (`26px`) and quieter (`content-secondary`, `text-xs`) than a `Button` — it reads as chrome, not a CTA.
- **popup & rows** drop from the trigger and are the dropdown-menu skin verbatim — do not re-derive their tone/spacing here.

## Accessibility

- Real menubar semantics from base-ui `Menubar` + `Menu`: `role="menubar"` on the bar, `menuitem` triggers, and `role="menu"` / `menuitem` / `menuitemcheckbox` / `menuitemradio` on the dropped rows.
- Left/Right arrows roam between triggers; opening one and arrowing past its edge moves to the adjacent menu (the menubar's roving model). Down/Enter/Space opens a trigger's menu; Up/Down roam rows; Esc closes; focus returns to the trigger on close.
- Trigger focus is shown by the `surface-hover` fill (`outline-hidden` — the fill *is* the focus affordance, never removed).
- An icon-only trigger still needs an accessible name (label text or `aria-label`).

## Notes

- **Behavior is owned by the React implementation.** Bar roving, trigger open/close, hover-to-switch between open menus, portalling, side/align positioning, open/close keyframes (`fade` + `zoom-95` + directional slide), type-ahead, and checkbox/radio/sub state are all base-ui `Menubar`/`Menu`. The reference CSS expresses the **static skin only** — a resting bar and one trigger marked open; the dropped popup is rendered via the dropdown-menu skin.
- **Trigger height `26px` has no token.** The source pins `h-[26px]` — between `spacing-control-xs` (22px) and `spacing-control-sm` (28px). No control token lands on 26px, so the reference CSS keeps it as a raw `26px`. *Token-change wish:* a `--spacing-control-2xs` (≈24–26px) for menu-bar / tab-strip chrome would close this gap; until then it is a documented one-off.
- **Bar padding `2px` is a half-step.** Source `p-0.5` (2px) sits between `--space-0` (0) and `--space-1` (4px); the reference CSS expresses it as `calc(var(--space-1) / 2)`, matching how tooltip/alert/popover handle their half-steps.
- **`gap-px` (1px between triggers)** is a hairline gap — conventionally exempt (like a 1px border), kept as `1px`.
- **Trigger `rounded`** is Tailwind's default `rounded` = 4px = `radius-sm` (a hair tighter than the bar's `radius-lg`).
- **The popup diverges slightly from dropdown-menu's default width.** `MenubarContent` sets `min-w-36` (144px) where `DropdownMenuContent` defaults to `min-w-[240px]`, and defaults `align="start"` / `alignOffset={-4}` / `sideOffset={8}`. Both are the same surface recipe (`surface-2` · `line-default` · `radius-lg` · `shadow-4`); the width difference is a positioning default owned by the React side, not a separate skin. The `MenubarSubContent` source still carries shadcn aliases (`bg-popover`, `text-popover-foreground`, `shadow-lg`, `ring-foreground/10`) — they resolve to `surface-2` / `content-primary` / `shadow-4` / `line-default` in this token system, same as the dropdown-menu sub-content.
- **Row tone/spacing is NOT redefined here.** Reuse the `.dropdown-menu__*` classes for the popup and its rows; this file only adds the `.menubar` bar and `.menubar__trigger`.

## Implementations

- **Next / @cloud/ui** — `import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem, MenubarGroup, MenubarLabel, MenubarSeparator, MenubarShortcut, MenubarCheckboxItem, MenubarRadioGroup, MenubarRadioItem, MenubarSub, MenubarSubTrigger, MenubarSubContent, MenubarPortal } from "@cloud/ui"`. base-ui `Menubar` wraps a row of `DropdownMenu`s; the menu parts re-export the `DropdownMenu*` skin (so `MenubarItem` carries the same `variant="default" | "destructive"` and `inset?` as `DropdownMenuItem`). **Behavior is owned by the React implementation** — bar roving, trigger open/close, hover-to-switch, portalling, positioning, animation, roving focus, type-ahead, and checkbox/radio/sub state are all base-ui. API details: the `ui` skill. Do not re-skin via `className`.
- **Artifact (self-contained HTML)** — use `.menubar` for the bar and `.menubar__trigger` for each opener (mark the open one `.menubar__trigger--open`), on top of the inlined `dist/tokens.inline.css`. For the dropped menu, render the dropdown-menu skin (`.dropdown-menu` + its `__item` / `__separator` / `__shortcut` / `__sub-trigger` rows) — the reference CSS expresses the **static skin only**; there is no roving, portalling, positioning, or show/hide. Same token recipe, same names.
