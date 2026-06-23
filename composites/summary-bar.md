# List summary bar · composite

The strip between the list card's top edge and the table: how many results, and
the list-level actions (Export, bulk ops). Mirrors @cloud/ui
`list-filter/ListSummaryBar`.

> **Contract scope.** Cross-consumer contract: anatomy, the sticky contract,
> tokens. React prop types live with `@cloud/ui`; the contract wins.

## Anatomy

```
┌ summary-bar (h = 48) ────────────────────────────────────────┐
│ 1,248 results · sorted by name        [ Export ] [ Columns ] │
└───────────────────────────────────────────────────────────────┘
```

## Rules

- **Fixed height 48px** (`--space-12`). This is load-bearing: when the bar is
  sticky, the table's sticky header docks at exactly this offset so the two tile
  flush. The @cloud/ui constant is `LIST_SUMMARY_BAR_HEIGHT = 48`.
- **Count is mono + tabular + `content-primary`**; the trailing label
  ("results · sorted by …") is `content-secondary`. The number must not reflow as
  it updates.
- **Right slot** holds list-level actions and, when rows are selected, the
  **bulk-action set** (the selection count + bulk verbs replace the idle actions).
- **Sticky contract** — when sticky, the host frame must use `overflow: clip`
  (`.table-frame--flush`), not the default `hidden`, or the sticky bar is trapped
  and scrolls away with the body.

## Implementations

- **Next / @cloud/ui** — `ListSummaryBar` (`total` / `label` / `actions` / `sticky`)
  + the exported `LIST_SUMMARY_BAR_HEIGHT`. `ui` skill → data-display.
- **Artifact** — `.summary-bar` (+ `--sticky`) › `.summary-bar__count`
  (`<strong>` = mono count) + `.summary-bar__actions` (`.btn--*`). Place inside a
  `.table-frame--flush`, directly above `table.data-table`. In `composites.css`.
