# Pattern · Master–detail

"Scan a collection **and** work one record beside it — on one screen." A left
**list rail** of records paired with a right **detail / editor pane** that swaps to
the selected record. The list and the record you're working stay visible together;
selecting a rail row never leaves for a separate route.

> 📐 **Copyable example** · [`master-detail.html`](./master-detail.html) — a Roles
> screen (rail of roles → the selected role's identity + a permissions list), ready
> to copy. It **links** the reference CSS so it never forks; inline the blocks to
> ship it as an artifact. All examples: [`index.html`](./index.html).

## When to use — vs. list-page / detail-page / settings

- **master-detail** — the list and one record's detail/editor **coexist** on one
  screen; you move between records without losing the list. Reach for it when the
  records are a **bounded, scannable set** you hop between and edit in place
  (firmware versions per hardware, roles & permissions, a category tree, admin
  users).
- **list-page** — a collection you scan/sort/filter where a row **navigates away**
  to a separate detail route. The list is the whole screen; the detail is elsewhere.
- **detail-page** — **one** record fills the screen (reached from a list). No
  persistent list rail beside it.
- **settings** — a left **anchor nav** that scroll-jumps between *groups of one long
  page*; the rail is navigation, not a list of records, and the right side is the
  same page, not a per-record swap.

## Anatomy

```
┌ page-header (○) ──────────────────────────────────────────────┐
│ Title (+ count?)                                  [ + New ? ]  │
╞═══════════════════════════════════════════════════════════════╡
│ ┌ ■ list rail (master) ─┐ ┌ ■ detail pane (selected record) ┐ │
│ │ [ search? ○ ]         │ │ header: name + actions? ○       │ │
│ │ ▸ Record A  ⟵ selected│ │ kv-grid / form / sections       │ │
│ │   Record B            │ │                                 │ │
│ │   Record C            │ │                                 │ │
│ │ [ + add? ○ ]          │ │ …or an empty-state when none    │ │
│ └─(260px, fixed)────────┘ │    is selected / the set is empty│ │
│                           └─────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
   .master-detail = a FIXED 260px rail + a FLUID pane; collapses to
   one column below 60rem (rail above pane).
```

- **Two panes on `.master-detail`.** The left **list rail** and the right **detail
  pane** sit in the `.master-detail` layout utility (fixed 260px rail + fluid pane).
  Below 60rem it collapses to one column (rail above pane).
- **The rail is a list of records, not nav.** Its rows are the collection —
  `list-row` items (`--interactive`, the current one `--selected`), each naming a
  record (+ an at-a-glance sub-line). Selecting a row swaps the pane; it does **not**
  navigate to a new route (that would be **list-page → detail-page** instead).
- **The pane is the selected record.** It renders that record's detail or editor —
  the same blocks a `detail-page` body uses (a `kv-grid` overview, `card` sections, a
  `create-form` when editing). When nothing is selected (or the set is empty), the
  pane shows an `empty-state`.

### Required core vs. optional slots

A master-detail is a **framework**, not a filled-in template (governance principle
[#9](../governance/principles.md)). The **required core** is the two panes: a list
rail and a detail pane. Everything else is included per the screen's needs.

| slot | required? | include when |
|---|---|---|
| list rail (master) | **yes** | always — the collection you hop between |
| detail pane (detail) | **yes** | always — shows/edits the selected record |
| selected state | **yes** | always — exactly one rail row is `--selected` and the pane mirrors it |
| page-header | no | the screen wants a title and/or a **New record** primary |
| rail search / filter | no | the collection is long enough to need finding a row |
| rail add affordance | no | records are created here (a `+ New` in the header or a rail footer) |
| detail pane actions | no | the selected record has verbs (Edit / a single primary / `⋯` overflow) |
| empty-state | no | nothing is selected yet, or the collection is empty |

## Rules

- **One screen, selection state — not one route per record.** Selecting a rail row
  updates the pane in place; it is **not** a navigation. If a record needs its own
  URL / independent permissions / a deep link, that's **list-page → detail-page**
  (a real route), not master-detail. A master-detail may itself be reached as one
  route of a larger app.
- **Exactly one rail row is `--selected`**, and the pane always reflects it. On load,
  either select the first record or show the empty-state — never a selected row whose
  pane is blank, nor a populated pane with no row marked.
- **The pane mutates the record; the rail navigates between records.** Edit / Delete
  / status changes for the selected record live in the **pane** (its header actions),
  never on the rail row — mirrors detail-page's *the list navigates, the detail
  mutates*. Editing **launches** the `create-form` pattern (a `Modal` for few fields,
  an edit sub-view for many); the pane stays read-only between edits. At most **one
  primary** action in the pane, rightmost; destructive verbs sit behind a `⋯`
  overflow / a `danger` button → confirm.
- **The rail carries the collection's own add / search**, not the pane's. A `+ New`
  creates a record (header primary or a rail footer); a rail search finds a row.
  These act on the *set*; the pane's actions act on the *selected record*.
- **Make the panes independently scrollable when the list is long.** The rail and the
  pane each own their scroll (e.g. a sticky rail, or a scroll container) so a long
  collection doesn't push the pane off-screen — the whole point is that both stay in
  view. Short screens can let the page scroll as one.
- **Collapsed (narrow) is still master-then-detail.** Below 60rem the two panes stack
  (rail above pane). A real implementation may instead show the rail **or** the pane
  (rail → tap a row → pane, with a back affordance); record that choice.

## Variants & optional slots

- `read` — the pane is a read-mostly **detail** (kv-grid + sections), edits launched
  from its header. The default (the example shows this — a role's identity + a
  permissions list).
- `edit-in-pane` — the pane is a **form** the user fills for the selected record
  (still launched, not inline-per-field): picking a rail row loads that record into
  the pane's `create-form`. Use when the screen's whole job is editing the set.
- `tree-rail` — the rail is a hierarchy, not a flat list (a category tree). The rail
  rows nest; the pane edits the selected node. (The tree affordance itself is a
  separate closed-set concern — compose it in the rail.)

## Building blocks

Layout: the **`.master-detail`** utility (pure geometry — the 260px rail + fluid
pane split; no contract, like `.detail-split`). Composites:
[`page-header`](../composites/page-header.md) (optional title + New primary),
[`list-row`](../composites/list-row.md) (the rail's record rows —
`--interactive` / `--selected`), [`kv-grid`](../composites/kv-grid.md) (the pane's
record overview), and [`empty-state`](../composites/empty-state.md) (nothing
selected / empty set). The pane reuses the detail-page vocabulary: `card` sections,
and — when editing — the [`create-form`](./create-form.md) pattern (launched in a
`Modal` or an edit sub-view, never inline). Primitives underneath: `Card`, `Badge`,
`Button`, `Switch`, `Separator`. `@cloud/ui`: an artifact composes the same from
`primitives.css` + these composites over the `.master-detail` grid.
