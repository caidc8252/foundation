# Chart · composite

The data-viz family — bar, pie-with-callouts, sparkline, and the shared
chrome (legend, tooltip, empty/loading states) — all themed off one
categorical palette. A chart is a framed region whose *geometry* is drawn by
Recharts SVG; this contract owns the **skin** (palette, grid/axis hairlines,
legend, tooltip, states) every chart wears.

> **Contract scope.** Cross-consumer contract: the palette assignment rule,
> the chrome anatomy, the static skin tokens, a11y. React prop types
> (`ChartConfig`, `ChartBarProps`, the `Chart*` Recharts re-exports) live with
> `@cloud/ui/components/chart` + the `ui` skill. **SVG geometry and all
> interaction — responsive sizing, stacking math, pie-callout elbow geometry,
> tooltip/legend payload wiring, keyboard stepping, brush/zoom — is owned by
> the React (Recharts) implementation.** The reference CSS expresses only the
> static skin (surface, grid/axis hairlines, curve caps, legend swatch,
> tooltip card, empty/skeleton states). When the contract and an
> implementation disagree, the contract is right and the implementation is a
> bug.

## Family

| member | what it is | use |
|---|---|---|
| **bar** (`ChartBar`) | cartesian bars; free end rounded `radius-md` (4px), axis end flat; stack-aware (only the visible top segment rounds) | counts / amounts per category, stacked breakdowns |
| **pie-callout** (`ChartPieCalloutLabel` + `…LabelLine`) | donut/pie with an elbow leader line out to a `name`/`value` text block | part-to-whole with a handful of labelled slices |
| **sparkline** (`ChartSparkline`) | fixed-size inline trend — one `1.5px` round stroke, no axes/grid/tooltip/legend; `line` or filled `area` | table cells, KPI tiles |
| **legend** (`ChartLegendContent`) | series swatches; static, or `aria-pressed` toggle buttons when interactive | series key under/over the plot |
| **tooltip** (`ChartTooltipContent`) | dark hover card: category header + per-series swatch/name/value rows, optional Total | hover/focus readout |
| **empty / skeleton** (`ChartEmpty` / `ChartSkeleton`) | no-data and loading states for the plot region | filter→no-data, in-flight load |

## Palette (token recipe)

The categorical palette is **ordinal**: a series with no explicit color takes
`--color-chart-{1..8}` by declaration order (cycling past 8). Implementations
inject `--color-<series>: var(--color-chart-N)` per series; geometry, legend
swatch, and tooltip indicator all read that same `--color-<series>`.

| token group | use |
|---|---|
| `chart-1` … `chart-8` | categorical (ordinal) data fills/strokes — **always start at `chart-1` and step** |
| `chart-seq-100` … `chart-seq-700` | sequential ramp (heatmaps / density), lightest → darkest |
| `chart-div-neg` / `chart-div-mid` / `chart-div-pos` | diverging (variance vs target) |
| `chart-grid` | dashed grid hairlines (= `line-subtle`) |
| `chart-axis` | axis baseline ticks + tick values (= `content-tertiary`) |
| `chart-label` | data labels (= `content-tertiary`) |
| `chart-dim` | de-emphasised / filtered-out datum paint |
| `chart-tooltip-bg` / `chart-tooltip-fg` | dark tooltip surface + ink |
| `chart-zoom-fill` / `chart-zoom-stroke` | brush/zoom selection band |
| `cat-1` … `cat-6` (+ `-fg`) | categorical-**soft** tint pairs — pale bg + same-hue ink for per-label identity tiles; **not** the saturated `chart-1..8` data fills |

> Pick a hue **by content hash for identity tiles** (`cat-*`), **by ordinal
> position for data series** (`chart-*`). Never hand-pick a `chart-N` to "make
> blue" — order owns the assignment.

## Anatomy

```
┌ chart ───────────────────────────────────────────────┐   role="img" when labelled
│   ┊      ┊      ┊      ┊      (chart__grid, dashed)    │
│  ▁█  ▃█  █▆  ▅█       bars: free end radius-md         │
│  ──────────────────── (chart__axis baseline)          │
│   Jan   Feb   Mar     (chart__tick, mono 9.5px)        │
├───────────────────────────────────────────────────────┤
│  ● Revenue   ● Refunds        (chart-legend, below)    │
└───────────────────────────────────────────────────────┘

chart-tooltip (floating, dark)        chart-legend item
┌──────────────────┐                  [● Revenue]  dot|line swatch + mono label
│ Mar              │ ← header (mono)
│ ● Revenue  12,480│ ← swatch · name · value(tabular)
│ ● Refunds     320│
│ ──────────────── │
│ Total      12,800│ ← showTotal row
└──────────────────┘
```

- **Container** — `flex aspect-video` region; `text-xs` mono baseline. Gains
  `role="img"` + sr-only title/desc only when `label`/`description` are set.
- **Legend** — wrapped row, centered, `gap-x-3 gap-y-1.5`; each item = swatch +
  mono `text-2xs` `content-secondary` label. Swatch is a `dot` (`2.5px` rounded
  square) or `line` (`0.5×3` bar) tinted with the series color; toggled-off
  items dim to `content-tertiary` / `opacity-60`.
- **Tooltip** — dark card (`chart-tooltip-bg`/`-fg`), `radius-md`, `shadow-4`,
  `min-w-32`; mono header, per-row swatch (`dot`/`line`/`dashed`) + truncating
  name + `font-semibold tabular-nums` value; optional `Total` row above a
  hairline divider.
- **Pie callout** — slice → elbow polyline (`startX/Y` → `elbowX/Y` → `endX/Y`,
  round caps) → text block: name (`font-medium`) over value
  (`content-tertiary tabular-nums`), both mono `text-2xs`.
- **Empty / skeleton** — both fill the `aspect-video` plot box. Empty = icon +
  `text-sm`/medium/`content-primary` title + `content-tertiary` description,
  centered. Skeleton = `radius-md` shimmer block, `role="status"`/`aria-busy`.

## States

Interaction is owned by Recharts; these are the **visual** state contracts the
skin paints (consumers set them via a `className` on a series/`<Cell>`, which
Recharts forwards onto the SVG primitive):

- **hover** — the hovered geometry brightens ×1.08; de-emphasised data opts out.
- **selected** (`.is-selected`) — `2px` `primary-700` outer-halo stroke
  (`paint-order: stroke`).
- **dimmed** (`.is-dimmed`) — `opacity 0.25`; a sibling of the active series.
- **filtered** (`.is-filtered`) — `opacity 0.18` + `chart-dim` paint; legend
  toggled off / excluded.
- **hover cursor** — bars get a faint `content-primary 6%` fill band; lines/areas
  get a dashed `line-strong` crosshair.
- **active dot** — a `2px` `surface-2` halo ring on the focused line point.
- **focus-visible** — keyboard focus draws a `1.5px` `primary-700` outline
  (offset `1px`); mouse focus draws **no** box. The focus ring is never silently
  removed.
- **legend toggle** — interactive items are `aria-pressed` buttons; off = dim +
  `opacity-60`, hover = `surface-hover`.

## Accessibility

- A labelled chart container is `role="img"` with an sr-only title
  (`aria-labelledby`) and optional sr-only description (`aria-describedby`) —
  the picture gets one accessible name, not a pile of unreadable SVG nodes.
- Pair the container `label` with Recharts' `accessibilityLayer` so the plot is
  keyboard-focusable and steps points with ← →.
- Keyboard focus is always visible (the `1.5px primary-700` outline above);
  pointer focus is intentionally box-free.
- Sparklines are **decorative** — they opt **out** of the accessibility layer
  (not focusable, no focus box); convey their meaning in surrounding text.
- The skeleton is `role="status"` / `aria-busy="true"`; the empty state leads
  with a real text headline, not an icon alone.
- Palette hues are tuned for ≥3:1 distinguishability at 8px markers / 1.5px
  strokes — but color is never the *only* channel: legend/tooltip name every
  series in text.

## Implementations

- **Next / @cloud/ui** — `import { ChartContainer, ChartBar, ChartTooltip,
  ChartTooltipContent, ChartLegend, ChartLegendContent, ChartSparkline,
  ChartPieCalloutLabel, ChartEmpty, ChartSkeleton } from
  "@cloud/ui/components/chart"` (a **dedicated subpath** — deliberately not in
  the root `@cloud/ui` barrel, since Recharts' `Tooltip`/`Legend` would collide;
  use the `Chart*` aliases). Recharts v3 under the hood; series colors come from
  `ChartConfig` (explicit `color`, per-theme `{light,dark}`, or ordinal
  fallback). The SVG skin is applied to Recharts' own classes
  (`.recharts-cartesian-grid`, `.recharts-curve`, …) under `[data-slot="chart"]`
  in `component-defaults.css`. API details: the `ui` skill. **Do not** depend on
  `recharts` directly or hand-pick palette steps.
- **Artifact (self-contained HTML)** — geometry must be drawn as **hand-authored
  SVG** (no Recharts); apply the `.chart` skin classes from `composites.css` on
  top of the inlined `release/tokens.inline.css`:
  - `.chart` (container) › `.chart__grid` line · `.chart__axis` baseline ·
    `.chart__tick` (mono 9.5px) · `.chart__bar` (free end `radius-md`) ·
    `.chart__curve` (round caps) · datum-state `.chart__series--selected` /
    `--dimmed` / `--filtered`.
  - `.chart-legend` › `.chart-legend__item` (+ `--toggle` for the button form,
    `--off` when toggled off) › `.chart-legend__swatch` (+ `--line`) +
    `.chart-legend__label`.
  - `.chart-tooltip` › `.chart-tooltip__header` · `.chart-tooltip__row` ›
    `.chart-tooltip__indicator` (+ `--line` / `--dashed`) +
    `.chart-tooltip__name` + `.chart-tooltip__value` · `.chart-tooltip__total`.
  - `.chart-sparkline` (inline-block fixed box) › `.chart__curve`.
  - `.chart-empty` (reuses the empty-state idea, sized to the plot) ›
    `.chart-empty__icon` + `.chart-empty__title` + `.chart-empty__description`;
    `.chart-skeleton` (shimmer block).
  Per-series color is set inline as `--chart-series: var(--color-chart-N)` on the
  geometry/swatch/indicator and read by these classes — same ordinal rule, same
  token names.
