# List row · composite

A non-tabular interactive list row — a leading visual, a title line that can carry inline badges over an optional sub-line, and a trailing control / action cluster / value, with the whole row optionally a click target. It is the shape behind a **settings** list, an **account & security** panel, a **role / permission** list, a **connected services** list, and an **entity** list (contracts, sessions, members): rows you read down, each pairing one thing with its state or its control. It is the upright cousin of the table and the feed — where [`data-table`](./data-table.md) lays records into scannable *columns* and [`feed-list`](./feed-list.md) is a tone-coded *event* inbox ordered by recency, `list-row` is a *flat list of items*, each a label-and-control pair, divided by hairlines and read top to bottom.

> **Contract scope.** The cross-consumer design contract: anatomy, the row
> recipe, the interactive rule, tokens, states. NOT the React prop types — those
> live with `@cloud/ui` + the `ui` skill. When an implementation disagrees with
> this file, the file wins.

## Anatomy

```
┌ list-rows (hairline-separated rows) ───────────────────────────────────────┐
│ 〔🔔〕 Two-factor authentication                              [ ●——  On  ]   │  ← trailing control (.switch)
│        Adds a one-time code at sign-in                                      │
├──────────────────────────────────────────────────────────────────────────────┤
│ 〔👤〕 m.ortiz                          Owner                  [ Manage ]    │  ← trailing actions (.btn)
│        m.ortiz@acme.co · last active 2h ago                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│ 〔📄〕 PILOT  〔badge:7d left〕                          3 fields filled  ›   │  ← --interactive (value + chevron)
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Row** — a 3-column grid: **leading** | **main** | **trailing**. Leading and
  trailing are `auto`-width; the main column takes the rest.
- **Leading** *(optional)* — an `__icon` tile (neutral by default) or a primitive
  `.avatar`. Omit it for a text-only row; the column collapses.
- **Main** — a **title** (`text-sm`, weight 600) that may hold inline `.badge`s /
  status chips, over an optional **sub** line (`text-xs`, `content-secondary`) —
  a description, a handle, a secondary metadata line. The title's text goes in a
  `__name` span that **truncates** (the badges stay inline, never wrap), and the
  sub is a single truncating line — so a list of rows reads at one **uniform
  height** instead of some rows wrapping taller than others.
- **Trailing** *(optional)* — the right cluster: a control (`.switch` for a
  preference, a `.btn` cluster for actions), a `__value` (a read-only setting's
  current value), and/or a `__chevron` when the row navigates.

## Rules

- **Rows are hairline-separated, not carded** — the list sits inside one frame (a
  `section-card`'s flush content, or a `card`), rows divide with a `line-subtle`
  rule, the last row drops it. Don't box each row. (Same framing rule as
  `feed-list`.)
- **Rows share a uniform height** — the title is one line (the `__name` truncates;
  inline badges never wrap below it) and the sub is one line (truncates). Don't let
  a long name/description wrap a single row taller than its neighbours; the full
  value lives on the detail side, not in the master row.
- **A single-select list shows its selection** — when the list is a master/detail
  picker (pick one row → a panel/page shows its detail, like the roles list), the
  active row carries `--selected` (tint + 2px primary left bar). It is the row's
  *persisted* state, distinct from transient hover, and stays visible while hovered.
- **Pick ONE primary trailing affordance per row** — a switch *or* an action
  button *or* a value+chevron. A row that both toggles and navigates is
  ambiguous; split it.
- **`--interactive` means the whole row is the click target** — wrap a real
  `<button>`/`<a>` for keyboard access and show a `__chevron`; `cursor: pointer`
  alone is not interactive (same rule as `product-card` / `option-card`). A
  trailing control on a non-interactive row owns its own click.
- **Reach for the right neighbour** — a tone-coded *event* that happened →
  `feed-list`; a *dated, connected* sequence → `timeline`; a record's *attributes*
  as label→value (not controls) → `kv-grid`; *columns* to sort/select/scan →
  `data-table`. `list-row` is the items-with-controls list none of those cover.
- **Tone is carried by the badge / control, not the row** — the row body stays
  neutral; status rides an inline `.badge` in the title.

## States

- **interactive hover / active** — `surface-hover`, then `surface-active` on
  press; only on `--interactive` rows.
- **focus-visible** (interactive) — `shadow-focus` ring on the row.
- **selected** — `--selected` tints the row `state-selected` **and** draws a 2px
  primary left bar (`--shadow-row-selected`, the same recipe as a selected
  `data-table` row) — the open item in a single-select master/detail list. It
  outranks hover so the selection never disappears when the row is hovered.
- **disabled** — `--disabled` dims the row to 0.5 and drops pointer events (a
  setting that isn't available yet).
- **empty** — render an `empty-state` in place of rows, never a blank frame.
- **loading** — `skeleton-row`s inside the frame.

## Implementations

- **Next / @cloud/ui** — a list of rows composed from an icon tile / `Avatar` +
  text + a `Switch` / `Button` / value, inside a `Card` (flush content); this
  contract names the row shape shared across the settings, account, roles, and
  members screens. See the `ui` skill.
- **Artifact** — `.list-rows` wraps `.list-row` (grid). Leading is
  `.list-row__icon` (or a `.avatar`); main is `.list-row__main` (`.list-row__title`
  holding a `.list-row__name` truncating text + inline `.badge`s, over
  `.list-row__sub`); trailing is `.list-row__trailing`
  holding a `.switch` / `.btn`, a `.list-row__value`, a `.list-row__actions`
  cluster, and/or a `.list-row__chevron`. A whole-row click target adds
  `.list-row--interactive`; persisted selection adds `.list-row--selected`;
  unavailable rows add `.list-row--disabled`. Empty reuses `.empty-state`. In
  `composites.css`.
