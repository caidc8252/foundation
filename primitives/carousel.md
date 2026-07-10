# Carousel

A horizontally (or vertically) scrollable track of equal-width slides, with optional prev/next buttons and dot indicators. For media galleries, onboarding decks, and feature showcases — not for paginated tables.

## Orientation

Not a styled variant — a layout axis the whole assembly mirrors. `horizontal` *(default)* lays slides left→right; `vertical` stacks them top→bottom and rotates the nav chevrons 90°. One token recipe, two axes:

| axis | track | slide inset | prev / next placement |
|---|---|---|---|
| `horizontal` *(default)* | `flex` row, `-ml-4` (negative `--space-4`) | `pl-4` (left `--space-4`) | left / right of the viewport, vertically centered |
| `vertical` | `flex` column, `-mt-4` (negative `--space-4`) | `pt-4` (top `--space-4`) | above / below the viewport, horizontally centered, chevron rotated 90° |

The negative track margin + per-slide padding produce a consistent `--space-4` (16px) inter-slide gutter without a stray leading gap. There is no size vocabulary — slide width is content-driven (`basis-full` by default; consumers re-basis per slide for multi-up layouts).

## Anatomy

```
┌ carousel (region, position:relative) ──────────────────┐
│  (◂)  ┌ content (overflow:hidden) ───────────────┐ (▸)  │
│ prev  │  ┌ track (flex) ─────────────────────┐   │ next │
│       │  │ [ item ][ item ][ item ] …        │   │      │
│       │  └───────────────────────────────────┘   │      │
│       └───────────────────────────────────────────┘      │
│                  • • ◦ ◦  ← dots                          │
└───────────────────────────────────────────────────────────┘
```

- **`carousel`** — `position: relative` shell so the absolutely-positioned prev/next anchor to it.
- **`carousel__viewport`** — the clipping window (`overflow: hidden`); the embla ref attaches here.
- **`carousel__track`** — the flex line that slides; holds the negative-margin gutter setup.
- **`carousel__item`** — one slide: `min-w-0 shrink-0 grow-0`, `basis-full` by default, carries the gutter padding.
- **`carousel__prev` / `carousel__next`** — icon-only round nav buttons, absolutely pinned just *outside* the viewport.
- **`carousel__dots`** — centered row of dot buttons, one per scroll snap; the active dot fills solid.

## States

- **prev / next disabled** — at a scroll boundary the corresponding button is `disabled` (`canScrollPrev` / `canScrollNext` false): `cursor-not-allowed` + `opacity-50`, inherited from `.btn`.
- **prev / next hover / focus-visible** — inherited from the `.btn--secondary` recipe (`surface-hover` fill, `shadow-focus` ring).
- **dot selected** — the dot at the current scroll snap fills `content-primary`; the rest are hollow (transparent fill, `line-default` ring). Selection is the only state a dot expresses.
- **dot focus-visible** — `shadow-focus` ring (keyboard reachable).

## Accessibility

- Root is `role="region"` + `aria-roledescription="carousel"`; each slide is `role="group"` + `aria-roledescription="slide"`.
- Keyboard: ArrowLeft / ArrowRight scroll the track (captured on the region); the React side `preventDefault`s the native scroll.
- Prev/next are real `<button>`s carrying an sr-only label ("Previous slide" / "Next slide") since they are icon-only.
- Each dot is a `<button aria-label="Go to slide N">`; clicking jumps to that snap.
- Focus rings (`shadow-focus`) are never removed.

## Implementations

- **Next / @cloud/ui** — `import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, CarouselDots } from "@cloud/ui"`. **Behavior is owned by the React implementation** (embla-carousel-react): the scroll engine, snap points, `canScroll*` flags, dot count/selection sync, ArrowKey handling, and `orientation` axis swap all live there. `CarouselPrevious`/`CarouselNext` are `Button`s (`variant="secondary"`, `size="icon-sm"`); a `useCarousel()` context wires them and the dots to the engine. The reference CSS below expresses the **static visual skin only** — surface, clipping, gutter, nav placement, dot fill.
- **Artifact (self-contained HTML)** — use `.carousel` › `.carousel__viewport` › `.carousel__track` › `.carousel__item`, with `.carousel__prev` / `.carousel__next` (reuse `.btn .btn--secondary .btn--icon .btn--sm` + `.carousel__nav` for the round + absolute placement) and `.carousel__dots` › `.carousel__dot` (+ `.carousel__dot--active`). Add `.carousel--vertical` on the root to flip the axis. A pure-CSS artifact has no scroll engine — render slides as a horizontally scrollable/overflowing track for the static prototype; mark the current dot with `--active` (the skin can't observe a live snap).
