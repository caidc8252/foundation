# List summary bar · composite

The strip between the list card's top edge and the table: how many results, and
the list-level actions (Export, bulk ops). Mirrors @cloud/ui
`list-filter/ListSummaryBar`.

## Anatomy

```
┌ summary-bar (h = 48) ────────────────────────────────────────┐
│ 1,248 results                                    [ Export? ] │
└───────────────────────────────────────────────────────────────┘
```

## Rules

- **Fixed height 48px** (`--space-12`). This is load-bearing: when the bar is
  sticky, the table's sticky header docks at exactly this offset so the two tile
  flush. The @cloud/ui constant is `LIST_SUMMARY_BAR_HEIGHT = 48`.
- **Count is `tabular-nums` + `content-primary`**; the trailing label — the count
  noun alone ("results" / "transactions") — is `content-secondary`. It reports the
  current total only, **not** the sort or filter state. The number must not reflow as
  it updates.
- **Right slot is business-driven** — it carries only the list-level secondary
  actions this list actually needs, included per need (it is **not** a fixed set).
  `Export` is the common one, present when the filtered result is worth exporting.
  There is **no default "Columns" / column-manager action** — the system ships no
  such composite, so don't invent one. A secondary action lives in exactly one
  place — here **or** the page header, never both (see
  [`list-page.md`](../patterns/list-page.md)). When rows are selected, the
  **bulk-action set** (selection count + bulk verbs) replaces the idle actions.
- **Sticky contract** — when sticky, the host frame must use `overflow: clip`
  (`.table-frame--flush`), not the default `hidden`, or the sticky bar is trapped
  and scrolls away with the body. **And for the table's `--sticky-head` thead to tile
  *under* the bar, nothing scroll-container-y may sit between the thead and the shared
  scroll root** — `.table-scroll`'s `overflow-x:auto` is one, so it steals the thead's
  stickiness (the thead docks to `.table-scroll` and scrolls away, and rows slide under
  the bar). When bar + thead tile to an outer root, clip the table's h-scroll
  (`.table-scroll { overflow-x: clip }`); h-scroll and an outer-root sticky-head are
  mutually exclusive. See [`data-table.md`](./data-table.md) §Sticky-head trap;
  regression `scripts/visual/sticky-check.mjs`.

## Implementations

- **Next / @cloud/ui** — `ListSummaryBar` (`total` / `label` / `actions` / `sticky`)
  + the exported `LIST_SUMMARY_BAR_HEIGHT`.
- **Artifact** — `.summary-bar` (+ `--sticky`) › `.summary-bar__count`
  (`<strong>` = tabular count) + `.summary-bar__actions` (`.btn--*`). Place inside a
  `.table-frame--flush`, directly above `table.data-table`. In `composites.css`.
