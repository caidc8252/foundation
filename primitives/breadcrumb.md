# Breadcrumb

A horizontal navigation trail showing the current page's location in the hierarchy. A row of linked ancestor crumbs, separated by a glyph, ending in the non-link current page.

> **Contract scope.** This file is the cross-consumer *design contract*: the
> part vocabulary, the token recipe, states, anatomy, a11y. It is the authority
> both implementations answer to. It deliberately does NOT document the React
> prop *types* — those live with the Next implementation (`@cloud/ui` + the `ui`
> skill). When the contract and an implementation disagree, the contract is right
> and the implementation is a bug.

## Variants

No variants. A breadcrumb is a single composed shape; the only axis is per-part
role (link vs. current page vs. separator vs. ellipsis), not a variant prop.

| part | element | use | token recipe |
|---|---|---|---|
| list | `<ol>` | the trail container; sets baseline type + tone for all crumbs | flex wrap · gap `space-2` · font `text-xs` · text `content-tertiary` |
| link | `<a>` | a navigable ancestor crumb | inherits `content-tertiary` · hover text `content-secondary` (animated) |
| page | `<span>` | the current (non-link) crumb, always last | text `content-primary` · `font-weight 500` |
| separator | `<li>` | divider between crumbs; default `/` glyph (overridable, e.g. chevron) | text `content-tertiary` · `select-none`; svg slot `size-3.5` (14px) |
| ellipsis | `<span>` | collapsed-middle affordance ("…") when the trail is too long | `size-5` (20px) box · svg `size-4` (16px) · inherits `content-tertiary` |

## Sizes

No size variants — the list fixes `text-xs` (12px) for every crumb; the current
page is the same size, distinguished by weight (`500`) and `content-primary`
tone, not by size. Separator and ellipsis glyphs pin to 14px / 16px svg slots.

## States

Only the link crumb is interactive:

- **link hover** — text lifts `content-tertiary` → `content-secondary`, animated
  via a color transition (source `transition-colors`).
- **link focus-visible** — `shadow-focus` ring (inherited control focus
  treatment; never removed).
- **current page** — not a state but the terminal crumb: `content-primary` +
  weight `500`, non-interactive (`aria-disabled`, `aria-current="page"`).

There is no disabled/invalid/selected axis — a breadcrumb is read-only navigation
chrome.

## Anatomy

```
nav[aria-label=breadcrumb]
└─ ol .breadcrumb__list                     (flex, wrap, gap-2, text-xs, tertiary)
   ├─ li .breadcrumb__item   → a .breadcrumb__link    "Dashboard"
   ├─ li .breadcrumb__separator                       "/"  (or chevron svg)
   ├─ li .breadcrumb__item   → a .breadcrumb__link    "Projects"
   ├─ li .breadcrumb__separator                       "/"
   ├─ li .breadcrumb__item   → span .breadcrumb__ellipsis   "…"   (collapsed middle)
   ├─ li .breadcrumb__separator                       "/"
   └─ li .breadcrumb__item   → span .breadcrumb__page "Current page"   (aria-current)
```

Each crumb is an `<li>` inside the `<ol>`; separators are their own
presentational `<li>`s interleaved between item `<li>`s. The default separator
content is a `/` glyph; pass a child (e.g. a chevron icon) to override it. The
ellipsis renders a horizontal-dots icon with an `sr-only` "More" label and is
typically wrapped in an item (or a menu/dropdown trigger) that expands the
hidden middle crumbs.

## Accessibility

- The root is a real `<nav aria-label="breadcrumb">` landmark wrapping an ordered
  list — the order is meaningful, hence `<ol>`.
- The current crumb is a `<span role="link" aria-disabled="true"
  aria-current="page">` — it announces as the current location and is not
  focusable/actionable.
- Separators are `role="presentation" aria-hidden="true"` and `select-none` — pure
  decoration, skipped by assistive tech.
- The ellipsis is `role="presentation" aria-hidden="true"` on the glyph with a
  visually-hidden "More" label so its purpose is still announced.
- Link focus ring (`shadow-focus`) is never removed.

## Implementations

- **Next / @cloud/ui** — `import { Breadcrumb, BreadcrumbList, BreadcrumbItem,
  BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis } from
  "@cloud/ui"`. `BreadcrumbLink` accepts a `render` prop (base-ui `useRender`) so
  it can adopt a router `<Link>` while keeping the link skin; the collapse logic
  (deciding *which* middle crumbs become an ellipsis/menu) is consumer-owned —
  not provided by the primitive. API details: the `ui` skill.
- **Artifact (self-contained HTML)** — build the trail by hand with the
  `.breadcrumb__list` / `.breadcrumb__item` / `.breadcrumb__link` /
  `.breadcrumb__page` / `.breadcrumb__separator` / `.breadcrumb__ellipsis`
  classes in `./primitives.css`, on top of the inlined `release/tokens.inline.css`.
  Wrap them in `<nav aria-label="breadcrumb"><ol class="breadcrumb__list">…`.
  Same type, tone, and hover recipe as the React side.
