# Navigation Menu

Top-level site navigation with flyout panels — a horizontal bar of triggers/links where a trigger opens a portalled content panel beneath the bar. Use for primary site-header navigation, not for in-page action menus (that's Dropdown Menu).

> **Contract scope.** This file is the cross-consumer *design contract*: the
> part vocabulary, the token recipe, states, anatomy, a11y. It is the
> authority both implementations answer to. It deliberately does NOT document
> the React prop *types* or base-ui specifics — those live with the Next
> implementation (`@cloud/ui` + the `ui` skill). When the contract and an
> implementation disagree, the contract is right and the implementation is a bug.

## Parts

A navigation menu is a composed set of slots, not a single element. The bar holds triggers and links; an opened trigger reveals a portalled popup that holds more links.

| part | role | token recipe |
|---|---|---|
| `root` | the menu container that anchors the bar + portalled positioner | inline flex row, no skin |
| `list` | the horizontal row of items | flex row · `gap-0` (items abut) · no skin |
| `item` | one slot in the bar (wraps a trigger or a link) | `position: relative`, no skin |
| `trigger` | a bar button that opens a content panel | height `control-md` (36px) · `px-cx-sm` (10px) · radius `radius-md` · `text-sm` · weight 500 · hover/focus/open bg `surface-hover` · trailing chevron rotates 180° when open |
| `content` (popup) | the floating panel an open trigger reveals | bg `surface-2` · radius `radius-lg` · `shadow-4` · 1px ring `line-default` · inner padding `--space-1` |
| `link` | a navigable row, in the bar or inside a content panel | radius `radius-md` · padding `--space-2` · `text-sm` · gap `--space-2` · hover/focus bg `surface-hover` · current-page (`data-active`) bg `surface-active` |
| `indicator` | the small arrow that points from the bar to the open panel | rotated square · bg `line-default` · `shadow-3` |

## Sizes

Single size. The bar trigger pins to `control-md` (36px) height — matching a `md` button — with `cx-sm` (10px) inline padding. No size variants.

## States

Open/highlight state is driven by base-ui (pointer/keyboard), not CSS `:hover` alone — but the resting skins are:

- **hover / focus (trigger & link)** — bg `surface-hover`. Same surface for pointer hover and keyboard focus.
- **open (trigger, `data-popup-open` / `data-open`)** — holds the `surface-hover` fill while its panel is open; the trailing chevron rotates 180°.
- **focus-visible (trigger)** — focus ring `shadow-focus`. (The source rings the trigger; links inside an open panel intentionally suppress their own ring — the panel owns focus context.)
- **active / current page (link, `data-active`)** — bg `surface-active`, a step darker than hover, marking the current destination.
- **disabled (trigger)** — `cursor-not-allowed` + `opacity-50`.

## Anatomy

```
root
└─ list  ───────────────────────────────────────────────
   ├─ item › trigger     "Products"  [ ▾ ]   (chevron rotates on open)
   ├─ item › trigger     "Solutions" [ ▾ ]
   └─ item › link        "Pricing"            (plain bar link, no panel)
   indicator  ▲                               (arrow to the open panel)

   ┄┄ portalled popup (an open trigger reveals) ┄┄
   content (popup surface)
   ├─ link   [ icon? ] label
   ├─ link   [ icon? ] label
   └─ link   [ icon? ] label
```

- **trigger** is an inline-flex row: label then a trailing chevron (14px) that rotates 180° when its panel is open.
- **link** is a flex row: optional leading icon (defaults 16px) + label, with `--space-2` gap. Inside a content panel it uses the same row recipe.
- **content** is the floating panel surface; the consumer fills it with links (and any layout it needs). Width is content-driven.
- **indicator** is a rotated square nub pointing from the bar toward the open panel — decorative, painted in `line-default`.

## Accessibility

- Real navigation-menu semantics from base-ui `NavigationMenu`: the trigger carries `aria-expanded` / `aria-haspopup`; arrow-key roaming focus across the bar, Esc to close the open panel, focus returns to the trigger on close.
- The bar is a list of items; each item is a trigger or a link. Icon-only links still need an accessible name.
- Focus ring on the trigger (`shadow-focus`) is never removed, only restyled. Links inside an open panel defer ring rendering to the panel's focus context (source sets `focus:ring-0`).
- `data-active` marks the current page on a link — distinct from `:hover`/focus highlight.

## Notes

- The source's `bg-popover` / `text-popover-foreground` (popup surface) and `ring-foreground/10` / `bg-border` (panel ring, indicator) are shadcn aliases; they resolve to `surface-2` / `content-primary` and `line-default` in this token system — the same mapping used by Dropdown Menu and Hover Card.
- The source trigger uses `py-1.5` (6px block padding) on a fixed `h-9`; the height token governs, so the reference skin pins `control-md` and lets the flex center the label — no separate block-padding token is needed.
- The source layers a `cubic-bezier(0.22,1,0.36,1)` directional slide + fade + zoom-95 open/close on the popup, plus an animated positioner that follows the active trigger. These are **behavior owned by the React implementation** — the reference CSS expresses the static (resting open) skin only.

## Implementations

- **Next / @cloud/ui** — `import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuContent, NavigationMenuLink, NavigationMenuIndicator, NavigationMenuPositioner, navigationMenuTriggerStyle } from "@cloud/ui"`. **Behavior is owned by the React implementation** (base-ui `NavigationMenu`): triggering, portalling, positioning (`side`/`align`/offsets, default `side="bottom"` / `sideOffset=8` / `align="start"`), the animated positioner/viewport that tracks the active trigger, open/close animation, and roaming focus are all base-ui. `navigationMenuTriggerStyle()` is the shared trigger recipe (also usable on a plain bar link). API details: the `ui` skill. Do not re-skin via `className`.
- **Artifact (self-contained HTML)** — use the `.nav-menu` block classes in `./primitives.css`, on top of the inlined `dist/tokens.inline.css`. The reference CSS expresses the **static skin only** — the resting bar plus one open panel. There is no portalling, positioning, indicator tracking, or open/close keyframes; render the bar, mark an open trigger with `.nav-menu__trigger--open`, the current link with `.nav-menu__link--active`, and place a `.nav-menu__content` panel where the consumer wants it. Same token recipe, same names.
