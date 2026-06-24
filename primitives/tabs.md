# Tabs

A tabbed control: a horizontal bar of triggers that switch which content panel is shown. Use for in-page section switching (detail tabs, settings groups) — not for page navigation.

> **Contract scope.** This file is the cross-consumer *design contract*: the
> variant/size vocabulary, the token recipe, states, anatomy, a11y. It is the
> authority both implementations answer to. It deliberately does NOT document
> the React prop *types* or base-ui specifics — those live with the Next
> implementation (`@cloud/ui` + the `ui` skill). When the contract and an
> implementation disagree, the contract is right and the implementation is a bug.

## Variants

Variant lives on the **list** (`TabsList`); the **trigger** adapts its active/hover skin automatically from the parent list's `data-variant`.

| variant | use | token recipe |
|---|---|---|
| `line` *(default)* | section tabs on a page — minimal, sits over content | list: no fill · bottom hairline `inset 0 -1px 0 line-default` · `gap-1`. trigger: text `content-secondary` · transparent · active text `content-primary` + `font-semibold` + animated `primary-700` underline |
| `default` | pill tabs inside a contained tray | list: `bg-surface-3` · `radius-md` · `p-1` · `gap-1` · height `control-sm`. trigger: text `content-secondary` · `radius-md` · hover text `content-primary` · active `bg-surface-2` + text `content-primary` + `shadow-1` (raised pill) |

## Sizes

No size prop. The trigger is fixed at `text-sm` / `font-medium`. Geometry is variant-driven, not size-driven:

- `line` trigger — padding `px-cx-sm` (`12px`) both axes, pulled `-1px` down so its underline overlaps the list hairline.
- `default` list — fixed height `control-sm` (28px); trigger fills it (`calc(100% - 2px)`) with `px-cx-sm`-ish (`12px`) inline padding.

## States

- **hover** — `line`: no surface change, text only lifts on active; `default` (non-active): text `content-secondary → content-primary`.
- **active / selected** (`data-active`, from base-ui) — `line`: text `content-primary` + `font-semibold` + the underline indicator scales in (`scale-x-0 → 1`, `duration-normal` `ease-emphasized`); `default`: raised pill (`bg-surface-2` + `shadow-1`) + text `content-primary`. Selected always wins over hover.
- **focus-visible** — `shadow-focus` ring, `radius-md`. Never removed.
- **disabled** (`:disabled` / `aria-disabled`) — `cursor-not-allowed` + text `content-disabled`.

## Anatomy

```
Tabs (root, flex column, gap-2)
├── TabsList            ← the bar; owns the variant (line tray-less / default pill tray)
│   ├── TabsTrigger     ← [ icon? ] label  · one per panel; the active one carries data-active
│   ├── TabsTrigger
│   └── …
└── TabsContent         ← the panel for the active trigger (flex-1, no outline)
    └── …
```

Trigger is `[ icon? ] label`: inline flex, `gap-2`, icons default `size-4` (16px), `whitespace-nowrap`. In the `line` variant the underline is an `::after` element inset to the label box (`inset-x: px-cx-sm`), `2px` tall, `primary-700`, animating its `scale-x`.

## Accessibility

- Real tab semantics from base-ui (`Tabs.Root` / `.List` / `.Tab` / `.Panel`): roving arrow-key focus along the list, `aria-selected` on the active tab, panel `role="tabpanel"` wired to its tab. Handled by the primitive.
- `orientation` (default `horizontal`) sets `data-orientation` and the arrow-key axis.
- Focus ring (`shadow-focus`) is never removed.
- Each trigger needs a discernible name (label text, or `aria-label` if icon-only).

## Implementations

- **Next / @cloud/ui** — `import { Tabs, TabsList, TabsTrigger, TabsContent } from "@cloud/ui"`. base-ui `Tabs` under the hood; `TabsList` takes `variant` (`line` | `default`). **Behavior — selection, roving focus, keyboard, panel wiring — is owned by the React/base-ui implementation; the reference CSS expresses the static skin only.** API details: the `ui` skill. Do not re-skin via `className`; pick a list variant.
- **Artifact (self-contained HTML)** — use `.tabs` > `.tabs__list` (+ `.tabs__list--line` / `.tabs__list--default`) > `.tabs__trigger` (mark the open one `.tabs__trigger--active`, the skin can't observe live selection) and `.tabs__content`, on top of the inlined `dist/tokens.inline.css`. Same variant names, same token recipe.
