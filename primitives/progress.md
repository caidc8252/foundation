# Progress

A horizontal bar showing numeric completion (0–100%). Determinate only — the filled indicator width maps to `value`.

## Tones

No `variant` axis (no form/emphasis choice — the bar has one shape). The only
visual axis is `tone`, a SEMANTIC status color that swaps the **indicator** fill.
Omitting `tone` yields the default brand fill — there is no `neutral` tone
(`ProgressTone = Exclude<Tone, "neutral">`).

| tone | use | indicator recipe |
|---|---|---|
| *(omitted, default)* | normal progress, no status meaning | bg `primary` (brand CTA fill) |
| `success` | completed / healthy | bg `success` |
| `warning` | nearing a limit / caution | bg `warning` |
| `error` | failed / over-limit | bg `error` |
| `info` | informational fill | bg `info` |

The **track** color does not change with tone — it is always `surface-3`.

## Sizes

The size axis swaps the **track height** only (full width and `radius-full` are
constant). Token-pure ladder on the space scale:

| size | class | track height | use |
|---|---|---|---|
| `xs` | `.progress--xs` | `space-1` (4px) | dense inline / in-row meters |
| *(default)* | — | `space-2` (8px) | standard |
| `lg` | `.progress--lg` | `space-3` (12px) | prominent single-metric bar |

There is no `sm` between `xs` and default: no token expresses 5–6px (see Notes),
so the ladder skips it rather than hardcode a raw px.

## States

Progress is a display primitive, not an interactive control — no hover / active /
focus / disabled / invalid states. What moves is the indicator **width**, plus an
optional striped-motion affordance:

- **indicator width** — `value%` of the track; the fill animates width changes
  over `duration-normal` with no easing curve override.
- **0%** — indicator collapses to zero width (track shows through fully).
- **100%** — indicator fills the track.
- **striped (active)** — `.progress--striped` overlays the indicator with moving
  diagonal stripes to signal work in flight. This is the one **functional**
  gradient allowed beyond the loading-skeleton shimmer (principle #1): the stripes
  are an activity affordance, not decoration. Stripe ink is `content-on-primary`
  at low alpha so it reads on any tone fill; reduced-motion stops the travel (the
  static stripes remain). It composes with any `tone` and any size.

## Anatomy

```
Root  ── flex column, gap-3 (label/value row + track)
 ├─ [ Label ]   optional — caption text (text-xs, content-secondary)
 ├─ [ Value ]   optional — right-aligned % readout (text-xs, content-secondary, tabular-nums)
 └─ Track       6px tall, full width, radius-full, bg surface-3, clips overflow
     └─ Indicator   full height, radius-full, bg primary (or tone color), width = value%
```

`Label` and `Value` are optional sibling slots rendered before the track inside
the same flex container (the source places them via `children`); `Value` pushes
itself to the row end with `ml-auto`. The track always clips its indicator
(`overflow-x-hidden`) so the rounded fill stays inside the rounded track.

## Accessibility

- Progressbar semantics (role, `aria-valuenow`/`valuemin`/`valuemax`) are owned
  by the base-ui `Progress.Root` — the bar is announced as a progressbar with its
  current value; consumers pass `value` (0–100).
- `Label` associates a text caption with the bar via the base-ui compound — use
  it (or an external label) so the bar is not an unlabeled progressbar.
- Tone is color-only and carries no semantics to assistive tech — pair a
  `success`/`error` tone with a `Label`/`Value` or surrounding text so the
  meaning is not conveyed by color alone.

## Notes

- **6px track height has no space token.** The source is `h-1.5` (6px); the raw
  space scale jumps `--space-1` (4px) → `--space-2` (8px), so no token expresses
  6px. The default track picks `--space-2` (8px, nearest-up) for a bar with visible
  presence, and the `xs`/`lg` sizes step to `--space-1` (4px) / `--space-3` (12px).
  The absent 5–6px step is why there is no `sm` size. Token-change wish: a
  `--space-1_5` (6px) step, or a dedicated `--size-track` token. Until then the
  default artifact bar runs 2px thicker than the Next bar.
- **Circular progress is a separate primitive** — for a single bounded value shown
  as a ring, use [`progress-ring`](./progress-ring.md), not this bar. The chart
  donut / radial gauge (`composites/chart`) is multi-series data-viz, a third,
  distinct thing.
- The indicator tone shortcuts map to tokens: `bg-primary` → `--color-primary-700`
  (foundation defines no bare `--color-primary` shortcut — primary is a ramp, so the
  default brand fill uses the same `-700` step as `.btn--primary`), while
  `bg-success` / `bg-warning` / `bg-error` / `bg-info` → the semantic shortcut tokens
  `--color-success` / … (not a ramp step).

## Implementations

- **Next / @cloud/ui** — `import { Progress } from "@cloud/ui"` (compound:
  `ProgressTrack`, `ProgressIndicator`, `ProgressLabel`, `ProgressValue`).
  base-ui `Progress` under the hood — value clamping, valuenow aria, and the
  compound slots are owned there. Pass `value` (0–100) and optional `tone`
  (`success`|`warning`|`error`|`info`; omit for brand). Behavior owned by the
  React implementation; do not re-skin via `className` — pick a `tone`.
- **Artifact (self-contained HTML)** — use `.progress` (root) wrapping a
  `.progress__track` whose child `.progress__indicator` has an inline
  `width: <n>%`; add `.progress__indicator--<tone>` to swap the fill, `.progress--xs`
  / `.progress--lg` on the root for size, and `.progress--striped` on the root for
  the active-motion fill. Optional `.progress__label` / `.progress__value` slots sit
  above the track. Styled by `./primitives.css` on top of the inlined
  `release/tokens.inline.css`. Same track/indicator recipe and tone names. The fill
  % is static markup here — there is no base-ui value plumbing on the artifact side.
