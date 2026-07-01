# Pattern · Dashboard

"The overview home." A read-mostly landing that answers *is the fleet healthy, and what needs attention* at a glance — a KPI **metric strip** over optional charts and an activity / alert feed. A pattern is a named structure, not an implementation; both consumers assemble it from composites and this file fixes the anatomy, ordering, and load-bearing decisions.

> 📐 **Copyable example** · [`dashboard.html`](./dashboard.html) — a sticky header (title + range + Export), a 4-up metric strip, and a trend chart card beside a recent-alerts feed. It **links** the reference CSS so it never forks; inline the blocks to ship as an artifact. All examples: [`index.html`](./index.html).

## Anatomy (top → bottom)

The diagram shows a **fully-dressed** instance. Only two bands are the required core (`■`); the rest are optional (`○`, trailing `?`) and render only when this dashboard's job calls for them.

```
┌ ■ page-header (full-bleed) ──────────────────────────────────┐
│ Title                          [range?]      [ Export? ]     │
│ [description?]                                               │
╞ page-body (gutters + stack) ═════════════════════════════════╡
│ ○ [banner?]  system-wide status Alert                        │
│ ┌ ■ metric strip (stat-grid of stat-cards) ────────────────┐ │
│ │  Online rate   Active POS   Txns today   Error rate       │ │
│ └───────────────────────────────────────────────────────────┘ │
│ ┌ ○ insight row? (columns) ────────────────────────────────┐ │
│ │  [ chart card: trend / breakdown ]   [ activity feed? ]   │ │
│ └───────────────────────────────────────────────────────────┘ │
│ ○ [secondary table?]  a recent-records data-table            │
└───────────────────────────────────────────────────────────────┘
   ■ required core   ○ optional — included per business need
```

## Required core / optional slots

A dashboard is a **framework**, not a filled-in screen (governance principle [#9](../governance/principles.md)). The split below is authoritative. The **header** and **one metric strip** are the minimal core — a dashboard *is* its KPIs; a header over a single `stat-grid` is already a complete, correct dashboard.

| slot | required? | include when |
|---|---|---|
| `page-header` (title; at most one primary action) | **yes** | always — names the overview; a range control / Export are optional header actions |
| metric strip — a `stat-grid` of `stat-card`s | **yes** | always — the headline KPIs are the point of the screen |
| status `banner` (Alert under the header) | no | a system-wide state must gate the whole view (incident, degraded) |
| insight row — one or more `chart` cards, optionally beside an activity feed | no | a trend / breakdown or a recent-events feed is worth surfacing |
| activity / alert feed (`feed-list`, or `timeline` for richer history) | no | recent alerts / events need a running list |
| secondary `data-table` | no | a short "recent N" table adds value below the fold |

## Rules

- **Read-mostly, at most one primary action** (Export/Refresh live in the header actions slot; never a required primary).
- **The metric strip is the required core** — ≥1 `stat-grid` of `stat-card`s. It fills the full width the shell allows (principle #6); never wrap it in a `max-width` centering wrapper.
- **The insight row is a full-width columns row** — a chart card beside an optional feed. Compose the columns with a page-local grid on tokens; it too fills full width (principle #6). Below a narrow width it collapses to one column.
- **Semantic color stays on status carriers** (stat-card value tones, trend deltas, feed-item tones, badges) — never a card background wash (principle #10). Chart series take the ordinal `--color-chart-*` palette, not status colors.
- **Data-readable figures are mono + tabular** — the big `stat-card__value`, counts, times (principle #11).

## Building blocks

Composites: [`page-header`](../composites/page-header.md) (title band) + [`page-body`](../composites/page-body.md) (guttered stack) · [`stat-card`](../composites/stat-card.md) (the metric strip, in a `stat-grid`) · [`chart`](../composites/chart.md) (trend / breakdown card) · [`feed-list`](../composites/feed-list.md) (activity / alerts; [`timeline`](../composites/timeline.md) for richer chronological history) · optional [`data-table`](../composites/data-table.md) (a recent-records table).

Primitives: `Card` (each block sits in a `card`), `Button`/`Select` (header actions), `Badge` (inline status).
