# Progress Ring

A circular determinate progress indicator for a single bounded value (0–100%) — battery, quota used, an approval rate, a p95 gauge. The ring's arc length maps to the value.

> **Contract scope.** This file is the cross-consumer *design contract*: the tone
> and size vocabulary, the token recipe, anatomy, a11y. It is the authority both
> implementations answer to. It deliberately does NOT document the React prop
> *types* or SVG plumbing (dash math, value clamping) — those live with the Next
> implementation (`@cloud/ui` + the `ui` skill). When the contract and an
> implementation disagree, the contract is right and the implementation is a bug.

## When to use

Reach for a Progress Ring when a **single** bounded value reads better as a compact
dial than a bar — a KPI tile's fill level, a circular gauge, a quota badge. For a
value in a row or a wide meter use the linear [`progress`](./progress.md) bar
instead. For **multi-series** composition (a donut of category shares, a radial
gauge with several arcs) use the chart donut/radial in `composites/chart` — that is
data-viz, not this single-value primitive.

## Tones

Same vocabulary as the linear bar: no `variant`; the only color axis is `tone`, a
semantic status color that swaps the **arc** stroke (the track stays `surface-3`).
Omitting `tone` yields the default brand fill; there is no `neutral` tone.

| tone | use | arc recipe |
|---|---|---|
| *(omitted, default)* | normal progress, no status meaning | stroke `primary-700` |
| `success` | complete / healthy | stroke `success` |
| `warning` | nearing a limit / caution | stroke `warning` |
| `error` | failed / over-limit | stroke `error` |
| `info` | informational | stroke `info` |

## Sizes

The size axis swaps the diameter and steps the centered label. Token-pure.

| size | class | diameter | label |
|---|---|---|---|
| `sm` | `.progress-ring--sm` | `space-10` (40px) | `text-xs` |
| *(default)* | — | `space-16` (64px) | `text-md` |
| `lg` | `.progress-ring--lg` | `space-20` (80px) | `text-lg` |

The arc stroke weight is a fixed SVG value (`3.5` user units in the `36` viewBox),
so it scales with the diameter.

## States

A display primitive, not interactive — no hover / focus / disabled. The only thing
that moves is the arc length, driven by the `--progress` custom property (0–100):

- **arc length** — `--progress%` of the circumference; changes animate over
  `duration-normal` (reduced-motion removes the transition).
- **0%** — arc collapses; only the track ring shows.
- **100%** — arc closes the full ring.

## Anatomy

```
.progress-ring                      inline-grid, one cell (svg + label overlap)
├─ svg.progress-ring__svg           rotated -90° so 0% starts at 12 o'clock
│  ├─ circle.progress-ring__track   full-circle rail, stroke surface-3, pathLength=100
│  └─ circle.progress-ring__fill    the arc, stroke-dasharray: var(--progress) 100
└─ span.progress-ring__label        centred % readout (tabular-nums) — optional
```

- Both circles carry `pathLength="100"`, so `--progress` (0–100) maps directly to
  the dash length regardless of the actual radius.
- The `__fill` and `__label` share the single grid cell so the label sits centered
  over the ring.
- The arc is `stroke-linecap: round`; the `__svg` is rotated `-90deg` so progress
  grows clockwise from the top.

## Accessibility

- Give the ring `role="progressbar"` with `aria-valuenow` / `aria-valuemin="0"` /
  `aria-valuemax="100"` (and `aria-label` naming what it measures) — the visual arc
  is not announced on its own.
- Tone is color-only: pair a `success`/`error` ring with the numeric label or
  surrounding text so meaning is not conveyed by color alone.

## Notes

- Progress is driven by the `--progress` custom property (set inline, e.g.
  `style="--progress: 72"`), not a width — the SVG `pathLength="100"` trick turns it
  into an arc length with no per-size dash math.
- The `3.5` stroke and `-90deg` rotation are geometry constants (SVG user units /
  angle), not design px — the diameter tokens carry the sizing.

## Implementations

- **Next / @cloud/ui** — render the two-circle SVG (`pathLength=100`, `strokeDasharray = value 100`) with the token strokes. Pass `value` (0–100), optional `tone` and `size`. API details: the `ui` skill.
- **Artifact (self-contained HTML)** — a `.progress-ring` grid holding a `.progress-ring__svg` (viewBox `0 0 36 36`) with `.progress-ring__track` + `.progress-ring__fill` circles (both `pathLength="100"`, `r="16"`, `cx="18"`, `cy="18"`), the fill carrying inline `style="--progress: <n>"`, plus an optional `.progress-ring__label`. Add `.progress-ring--<tone>` and `.progress-ring--sm/--lg`. Set `role="progressbar"` + `aria-valuenow`. On top of the inlined `release/tokens.inline.css`.
