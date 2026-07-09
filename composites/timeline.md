# Timeline · composite

Vertical event log — device history, audit trails, ticket activity. A column of
tone-coded markers joined by a connecting rail, each beside a content block of
title + timestamp + description + actor. Display-only: no interactivity, no data
fetching.

> **Contract scope.** Cross-consumer contract: the marker/tone vocabulary, the
> two layout axes (density, stacked), anatomy, the token recipe. React prop
> *types* and the `items`-shortcut shape live with `@cloud/ui` + the `ui` skill;
> the contract wins. An implementation that diverges is the bug.

## Choosing a form

Timeline has four independent axes — **marker** (`dot` / `icon`), **density**
(`default` / `compact`), **layout** (time-right / `stacked`), **tone** (6). Mixing
them freely yields dozens of permutations, so **pick the nearest canonical recipe
below — don't improvise a new combination.**

| requirement | marker | density | layout | canonical example |
|---|---|---|---|---|
| **System / release history** — homogeneous events separated by status, relative time | `dot` | default | time-right | Deployment history |
| **Entity audit trail** — the *kind* of event is the point; the glyph names the action | `icon` | default | time-right | Account audit trail |
| **Dense access / security log** — many short title-only rows, scanned by clock time | `dot` | compact | time-right | Dense audit log |
| **Document / collaboration activity** — time · actor as a meta row, narrow / side-by-side panels | `icon` | stacked | default | Document activity |

Per-axis rules (consult only when no recipe fits):

- **marker** — `dot` when events differ only by status (deploy / health / alert…);
  `icon` when the event *type* differs and a glyph should identify it at a glance.
  **Never mix `dot` and `icon` within one timeline.**
- **density** — `default` when each row carries a description worth reading;
  `compact` for title-only audit logs scanned rather than read.
- **layout** — time-right when the column is wide and timestamps are short
  (relative, or `14:30`); `stacked` for narrow / sidebar / side-by-side columns,
  or when time and actor should read as one meta line. A long absolute timestamp
  (`2026-06-28 14:30 UTC`) that would crowd the title row is a signal to stack.
- **tone** — status vocabulary shared with Badge: `success` = done / approved,
  `warning` = attention (non-blocking), `error` = failed / rejected, `info` =
  in-progress / pending, `primary` (accent) = highlighted / current, `neutral` =
  routine / informational. **One tone per event**; never color for decoration.

Anti-patterns: mixing `dot` and `icon`; packing descriptions into `compact`
(it's for scanning); painting every event `primary`/`success` (tone stops
signaling status); leaving a long absolute timestamp in time-right layout.

## Modes (two combinable root axes)

| axis | values | effect |
|---|---|---|
| `density` | `default` *(default)* · `compact` | vertical rhythm of each item's content (`space-5` vs `space-3` bottom padding). `compact` is for dense audit logs. |
| `stacked` | `false` *(default)* · `true` | timestamp placement. `false` → time sits at the right edge of the header row (across from the title). `true` → time + actor stack as a "time · actor" inline row *below* the title. |

## Marker variants

The marker style is **not a prop** — it is derived from whether the marker wraps
an icon: empty → `dot`, with children → `icon`.

| variant | trigger | recipe |
|---|---|---|
| `dot` *(ring-dot)* | no children | a 12px hollow circle on the rail: `size-3` · radius `full` · 2px border `currentColor` · bg `surface-2`. The tone colors `currentColor`. |
| `icon` *(icon node)* | wraps an icon | a 24px tinted circle: `size-6` · radius `full` · 2px border · bg `surface-2` (tone overrides) · inner icon defaults to `size-3` (12px). |

## Tones

Tone colors the marker only (the column is decorative). Vocabulary mirrors
Badge's `tone`. `primary` maps to the **accent** ramp (not the gray-blue
`primary-*` CTA ramp) — matching the upstream TOMS spec.

| tone | dot (`currentColor`) | icon border · bg · glyph |
|---|---|---|
| `neutral` *(default)* | `content-tertiary` | `line-strong` · `surface-2` · `content-tertiary` |
| `primary` | `accent-600` | `accent-600` · `accent-50` · `accent-600` |
| `success` | `success` | `success` · `success-bg` · `success` |
| `warning` | `warning` | `warning` · `warning-bg` · `warning-strong` *(darker glyph for contrast on the tint)* |
| `error` | `error` | `error` · `error-bg` · `error` |
| `info` | `info` | `info` · `info-bg` · `info` |

## Anatomy

```
┌ timeline (ul) ───────────────────────────────────────────────┐
│ timeline-item ──────────────────────────────────────────────┐│
│  [marker col]   [content col]                                ││
│   ┌ node ┐      ┌ header ─────────────────────────────────┐  ││
│   │ ◍/◉ │      │ title …………………………………………… time(right)│  ││  stacked=false: time right
│   │ rail │      │ time · actor   (TimeRow, stacked=true)  │  ││  stacked=true:  time row below
│   │ (2px)│      └─────────────────────────────────────────┘  ││
│   │      │      description                                   ││
│   └──────┘      actor   (stacked=false: after description)    ││
│ ─────────────────────────────────────────────────────────────┘│
│ … more items; rail runs continuously into the next item …     │
└───────────────────────────────────────────────────────────────┘
```

- **Marker column** is fixed 24px wide and stretches to the full item height.
  The **rail** (2px, `line-default`) fills the space below the node and runs
  continuously into the next item — the inter-item gap lives on the content
  column's bottom padding, not on the rail. The rail is **hidden on the last
  item**.
- **Content column** flexes to fill, with `space-1`-ish top nudge so the title
  baseline aligns with the node.
- **Header** is a `space-3`-gapped row (title left / time right) when
  `stacked=false`; a plain block (title, then the TimeRow beneath) when
  `stacked=true`.
- **Title** `text-md` · 500 · `content-primary` — the same size at both densities; `compact` changes rhythm, not type size.
- **Time** `text-xs` · tabular-nums · `content-tertiary` · nowrap.
  Renders as `<time dateTime>`.
- **Description** `text-md` · normal leading · `content-secondary`, with a small
  top nudge.
- **Actor** `text-xs` · `content-tertiary`. In a TimeRow it sits inline
  (joined to the time by a `·` separator); outside one it is a block with a top
  margin (sits after the description in time-right mode).

## Accessibility

- The marker column is purely decorative (`aria-hidden`) — all meaning lives in
  the content column's text.
- The root is a real `<ul>`, each event a `<li>`; the timestamp is a real
  `<time>` carrying the machine-readable `dateTime`.
- No roles/keyboard/focus of its own — display-only.

## Implementations

- **Next / @cloud/ui** — `import { Timeline, TimelineItem, TimelineMarker,
  TimelineContent, TimelineHeader, TimelineTitle, TimelineTime, TimelineTimeRow,
  TimelineDescription, TimelineActor } from "@cloud/ui"`. Root props `density`
  `stacked` `items`; an `items={entries}` shortcut renders plain event lists
  through the same slots. API details: the `ui` skill. The `dot`/`icon` marker
  split and the `time · actor` separator interspersing are React behaviors; pick
  a `tone`, don't re-skin via `className`.
- **Artifact (self-contained HTML)** — `.timeline` (ul) › `.timeline__item` (li)
  › `.timeline__marker` (column) + `.timeline__content`. Set the marker shape
  with `.timeline__marker--dot` / `--icon` (the static skin can't observe whether
  an icon is present) and the tone with `.timeline__marker--<tone>`. Inside
  `.timeline__marker`: a `.timeline__marker-node` (the tinted circle container —
  24px for `--icon`, 12px for `--dot`; receives the tone's border + bg) holding
  either a `.timeline__marker-dot` (the hollow 12px ring, dot variant only) or a
  raw SVG (icon variant); plus a sibling `.timeline__rail` (the 2px connecting
  track that extends to the next item — hidden on `.timeline__item--last`). Apply
  `.timeline--compact` / `.timeline--stacked` on the root, and
  `.timeline__item--last` on the final item to drop its rail + bottom gap (the
  static skin can't observe `:last-child` group state the way the source's
  `group-last` does — though `:last-child` covers the common case). Content slots:
  `.timeline__header` · `.timeline__title` · `.timeline__time` · `.timeline__time-row`
  · `.timeline__description` · `.timeline__actor`. In `composites.css`.
