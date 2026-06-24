# Scroll Area

A styled overflow container that swaps the OS scrollbar for a thin, token-skinned one that matches the design system. Wrap any region that can overflow (long lists, panels, code blocks) when you want a consistent, unobtrusive scrollbar instead of the platform default.

> **Contract scope.** This file is the cross-consumer *design contract*: the
> anatomy, the scrollbar/thumb token recipe, states, a11y. It is the authority
> both implementations answer to. It deliberately does NOT document the React
> prop *types* or base-ui specifics — those live with the Next implementation
> (`@cloud/ui` + the `ui` skill). When the contract and an implementation
> disagree, the contract is right and the implementation is a bug.

## Variants

No visual variants. A single skin; the only axis is scrollbar **orientation** (`vertical` *(default)* / `horizontal`), which swaps which edge the thin track hugs. The viewport itself is unstyled chrome — it inherits the host's `border-radius` and adds nothing but clip + scroll.

| orientation | track sits | recipe |
|---|---|---|
| `vertical` *(default)* | right edge, full height | `4px` wide track · 1px transparent left gutter · thumb fills width |
| `horizontal` | bottom edge, full width | `4px` tall track · 1px transparent top gutter · thumb fills height |

## Sizes

No size variants. The track is a fixed `4px` (`--space-1`) cross-axis thickness with a 1px transparent border forming the gutter. The viewport sizes to its container (`size-full`); the consumer sets the box's own width/height/`max-height` to create the overflow.

## States

- **resting** — thumb is `line-strong` at `opacity-70`; the track is transparent (only the thumb is visible).
- **hover / dragging** — thumb visibility / fade is a base-ui behavior (the scrollbar fades in on interaction); the reference skin paints the resting thumb only.
- **focus-visible** — the *viewport* is focusable when scrollable; on keyboard focus it shows a `shadow-focus` ring (source: `ring-2 ring-ring/50`). The scrollbar itself is not a focus target.
- No disabled / invalid / selected states — this is a passive container.

## Anatomy

```
.scroll-area                     ← root, position:relative, owns radius
└─ .scroll-area__viewport        ← clips + scrolls; inherits radius; focus ring
     └─ (your content)
   .scroll-area__scrollbar       ← thin track, hugs one edge (orientation)
     └─ .scroll-area__thumb      ← rounded-full draggable handle (line-strong/70)
   [corner]                      ← base-ui Corner where both bars meet; unstyled
```

The transparent 1px border on the scrollbar (left for vertical, top for horizontal) is the gutter between the thumb and the box edge — not a visible line. The `Corner` slot (where a vertical and horizontal bar would intersect) is rendered by base-ui and carries no skin.

## Accessibility

- The viewport is the scroll region: it becomes keyboard-focusable when content overflows, so arrow/Page keys scroll it; the `shadow-focus` ring marks that focus and is never removed.
- The custom scrollbar is decorative chrome — pointer dragging is a base-ui behavior; keyboard users scroll the viewport directly, never the bar.
- The skin must not suppress native overflow semantics — the container still exposes a scrollable region to assistive tech.

## Notes

The implementation paints the thumb in `bg-line-strong` (resolves to the `--color-line-strong` token) at `opacity-70`. The `p-px` track padding and the 1px `border-{l,t}-transparent` gutter are hairline/transparent values — conventionally exempt, not token violations. The `4px` cross-axis thickness maps cleanly onto `--space-1`.

## Implementations

- **Next / @cloud/ui** — `import { ScrollArea, ScrollBar } from "@cloud/ui"`. base-ui `ScrollArea` (`Root` / `Viewport` / `Scrollbar` / `Thumb` / `Corner`) under the hood; `ScrollBar` takes `orientation`. **Scroll detection, scrollbar fade-in/out, pointer-drag, and corner placement are owned by the React/base-ui implementation; the reference CSS expresses the static skin only** (track + thumb surface, radius, gutter, focus ring). API details: the `ui` skill.
- **Artifact (self-contained HTML)** — wrap content in `.scroll-area > .scroll-area__viewport` and skin native scrollbars with the `.scroll-area__scrollbar` / `.scroll-area__thumb` recipe via `::-webkit-scrollbar` in `./primitives.css`, on top of the inlined `dist/tokens.inline.css`. A native scrollbar can't reproduce base-ui's fade-on-interaction; the reference paints the resting thin thumb. Same `line-strong` / `opacity-70` recipe, same `4px` track.
