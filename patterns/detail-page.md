# Pattern · Detail page

"One record, read-mostly, with actions." The archetype you reach a list page's
row into. Named structure, not implementation.

> 📐 **Copyable examples** — both **link** the reference CSS so they never fork; inline
> the blocks to ship as an artifact. All examples: [`index.html`](./index.html).
> - [`detail-page.html`](./detail-page.html) — the `tabbed` variant: detail-header band
>   (back + status chips + meta + **docked tabs**) → tab content (Overview KV grid with a
>   top KPI row + `.detail-split` main/aside, Team simple-tier collection, Orders
>   rich-tier collection, Billing, Activity timeline, Settings empty state).
> - [`detail-page-overview.html`](./detail-page-overview.html) — the `overview` variant:
>   the **no-tabs** detail-header (identity + meta + actions, **no tab strip**), with the
>   body's sections stacked directly in `page-body` (status banner `alert` → `.detail-split`
>   Overview + a `progress` Health rail → a `accordion` Diagnostics section → a
>   `list-row` + `switch` Preferences list).

## Anatomy

```
┌ detail-header band (full-bleed surface-2, sticky, NO breadcrumb) ─────────┐
│ [‹] 〔logo〕 name 〔status〕〔status〕     [ edit? ] [ ⋯? ] [ primary? ]      │
│              id · region · created … (meta row)                           │
│ ┌ tabs — OPTIONAL — line variant, docked on the band's bottom edge ────┐  │
│ │ Overview   Activity   Orders   Settings                              │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
╞ page-body (gutters + stack) ══════════════════════════════════════════════╡
│ tabbed → the ACTIVE tab's content: a full page-body canvas — any          │
│ composite, a composition, or a whole nested pattern (Overview = kv-grid). │
│ no tabs → the body's sections stack directly in page-body.                │
└────────────────────────────────────────────────────────────────────────────┘
```

- **No in-page breadcrumb.** The path lives in the app shell's header, not the
  page. The page begins with the sticky `detail-header` band (`.detail-header--sticky`
  — the band's identity + actions + tabs dock under the app header while the body scrolls).
- **Tabs are OPTIONAL.** Use them only when sub-views are genuinely independent
  and substantial (the `tabbed` variant); a single-section screen omits them (the
  `overview` variant) and the band is just identity + meta + actions. **When
  present**, the tab strip docks flush on the band's bottom edge **below** the
  name + meta — never as a separate block in `page-body`; `Overview` is the first
  tab and tab *content* renders in `page-body`.
- **A back button is OPTIONAL** — an icon-only ghost sm button (`‹`), first in the
  bar when present, returning to the list the record was reached from. Include it
  when the record was reached from a list; otherwise the app shell carries
  navigation and the band opens straight on the identity (matches
  [`detail-header`](../composites/detail-header.md), which lists Back as optional).
- **Every other header slot is business-driven** — same rule as
  [`detail-header`](../composites/detail-header.md) and
  [`page-header`](../composites/page-header.md): only the **name** is always
  present; the logo, status badges, meta facts, and the actions are each included
  per the record's needs. **At most one primary action**, rightmost — a read-only
  record may have none.

### Required core vs. optional slots

A detail page is a **framework**, not a filled-in template (governance principle
[#9](../governance/principles.md) — *patterns are frameworks*). It guarantees the
structure + ordering above; it does **not** guarantee every slot is present. The
**required core** is just two slots — the identity in the head, and a body. The
populated [`detail-page.html`](./detail-page.html) shows one fully-dressed instance;
copying it does **not** mean keeping every slot. Include each optional slot only
when this record's job calls for it.

| slot | required? | include when |
|---|---|---|
| detail-header band | **yes** | always — the page begins with the head band |
| → title / name (within the head) | **yes** | always — the only required slot inside the head |
| body ([`page-body`](../composites/page-body.md)) | **yes** | always — the content region beneath the head band; the SAME `page-body` any screen uses, its content recursing into the full closed set. Convention: an Overview block opens it (main = a `kv-grid`). `.tabs__content` is only page-body's panel-partition in the tabbed variant — never a required wrapper. |
| back button | no | the record was reached from a list to return to; else the shell carries navigation |
| status badge(s) | no | the record has a status worth surfacing up top (shown, not editable) |
| meta row | no | id / region / dates / counts are useful at a glance |
| header actions | no | a verb applies to this record (Edit / a single primary / overflow) |
| tabs (the `tabbed` variant) | no | sub-views are genuinely independent and substantial; the `overview` variant omits them |
| top KPI row (`.stat-grid`) | no | the overview has headline metrics worth surfacing full-width above the split |
| right rail (`.card--elevation-0` secondary cards) | no | there are secondary facts (relationship, billing, an order/invoice total) that should sit beside — and quieter than — the main card |
| status banner | no | a record-wide condition needs an inline callout (e.g. suspended, past-due) |

## Rules

- **Status is shown, not editable here** — status changes are explicit actions
  (buttons / menu), each confirmed. Render multi-axis status as separate chips.
- **Tabs vs sections** — use tabs only when sub-views are genuinely independent
  and each is substantial; otherwise stack labelled sections on one page. A detail
  screen is ONE page with tab state, not one route per tab. When tabs are used,
  they dock in the **`detail-header` band** (below the name), not in `page-body`.
  *"Not one route per tab" constrains URL / navigation — not the choice of a tab's
  body; each tab's content still goes through the same content→composite decision a
  standalone screen does.*
- **The tab set is entity-derived, not master-derived.** The tabbed
  [`detail-page.html`](./detail-page.html) shows an *illustrative* set of tabs
  (Overview / Team / Orders / Billing / Activity / Settings) — a gallery of what a
  tab CAN be, **not a required set**. Which tabs exist, and what each holds, are
  derived from THIS record's spec (its related collections, lifecycle facets, and
  sub-resources) — the same way a list-page derives its columns from the entity.
  Cloning the master's tabs onto a different record is the failure mode, not the goal.
- **A tab body is a recursive canvas.** Below the head band the body is just
  [`page-body`](../composites/page-body.md), so a tab draws on the **whole closed
  set** and may nest a full pattern (a records tab can *be* a list-page inside the
  tab). This is where you create UE — row-expand → sub-table, click-to-modal, a
  per-row drill into a timeline are all legitimate. The only fixed chrome a detail
  guarantees is the `detail-header` identity; from `page-body` down a tab has the
  same latitude as any screen.
- **Derive the body, don't port it — the Overview included.** The master is one
  *example sentence*, not a template: port its **frame** (detail-header + page-body
  + the tab mechanism) and write the body fresh for THIS record. Classify each
  piece of data and pick its composite — a record's **attributes** → `kv-grid` (or
  a lead fact in the identity band); a **related collection** → `data-table`;
  **history** → `timeline`; **only a headline aggregate the screen is about** →
  `stat-card` ([Metric vs attribute](../composites/stat-card.md)). A single
  record's own price / counts / images are attributes — **never a padded KPI
  strip** (the master's Overview KPI row is *illustrative*, not a required
  ingredient). Before composing, name the record's **protagonist** — what this
  detail is *for* (a buy page's protagonist is ordering → a buy panel; an admin
  record's is its key attributes + relations) — and lead with that, instead of
  defaulting to KPI + kv-grid + aside.
- **Overview is a key-value grid** ([`kv-grid`](../composites/kv-grid.md)):
  a left-right label → value list, labels `text-content-tertiary`, values
  `content-primary`. Short values sit beside their label; a long / multi-line
  value simply wraps inside its value column. On a **wide overview**
  the facts may be split across **two or more `.kv-grid` columns side by side** — a
  layout wrapper holding whole `.kv-grid` dls (never `repeat(auto-fit)` on the rows;
  see [`kv-grid`](../composites/kv-grid.md)) — so the main fills its width instead
  of one column trailing empty space; it collapses to one column when narrow.
- **A section that lists a collection is a `card` wrapping a `data-table`** —
  the one consistent block for every record-list section / tab (contracts, operators,
  members, devices, …). It comes in **two tiers, chosen by collection size**; pick
  one — never hand-roll a third shape, every collection section reads the same.
  - **Simple** (small / bounded collection) — the default. The shape is fixed:
    `card` › `card__header` ( **title** · **at most one** action — the section's
    add / primary verb ) › a **flush** `card__content` (`.card__content--flush` —
    never an inline `padding:0` hack) › `data-table` (row actions **always-visible**
    per [`data-table`](../composites/data-table.md); an `empty-state` in place of
    rows when empty). The action lives in the **card header**, *not* a `summary-bar`.
  - **Rich** (a collection large enough to need search / pagination) — the section
    **mirrors the list-page results region**: an OPTIONAL search
    [`condition-band`](../composites/list-filter.md) above — **bound to the results
    card at `space-4` via a `.stack--4` wrapper** (principles §13; the bound unit
    then sits in the panel's `space-6` rhythm) — then a **header-less**
    `card` whose `.card__content--flush` frame holds a
    [`summary-bar`](../composites/summary-bar.md) (count on the left · the section's
    **single** add / primary verb on the right), the `data-table`, and a
    [`rich-pagination`](../composites/rich-pagination.md) footer. **This is the ONE
    place a `summary-bar` appears in a detail page** — it is otherwise a list-page
    composite. The card carries **no `card__header`**: the count in the summary-bar
    quantifies the collection, and the tab trigger (or the section's place on the page)
    already names it.
  - **Don't repeat the tab / section name in a `card__header`.** When a collection
    tab's card would title itself the same word as its tab trigger ("Orders" tab →
    "Orders" card title), that title is pure duplication — drop the header (the rich
    tier has none; the summary-bar's count carries the quantity). A `card__header`
    earns its place only when it says something the tab label does *not* (a distinct
    sub-section title, a description, or the simple tier's one action).
  Multiple collection sections in one tab **stack vertically at `space-6`** — the
  panel provides that rhythm itself (`.page-body > .tabs__content`; principles §13 —
  a tab panel is navigation, not nesting, so it matches page-body's own rhythm and
  needs no hand-rolled `.stack--N` wrapper), and they **never touch / 0-gap**; e.g.
  Operators = an accounts `card` + a pending-invitations `card`.
- **At most one primary action**, rightmost (mirrors `detail-header` /
  `page-header`) — a read-only record may have none, never two; everything else is
  `secondary` / `ghost`.
- **Destructive actions** live behind the `⋯` overflow menu or a `danger` button,
  never as a bare primary. In the `⋯` overflow the rows are **`dropdown-menu`
  items** (`.dropdown-menu__item`; Delete = the `--destructive` variant) — **never
  `.btn` buttons inside the menu** (a `danger` *button* is the alternative carrier,
  not a button placed in the menu). The `⋯` overflow is shown **only when** there
  are destructive or surplus secondary verbs to collapse into it — **never render an
  empty `⋯`**; a header with just Edit + a primary has none.
- **The detail page is where a record mutates.** Edit, Delete, and status changes for
  a record reached from a list live in the `detail-header` actions here — not on the
  list row. *The list navigates, the detail page mutates* (see
  [`list-page.md`](./list-page.md)): Edit is a `secondary` (or the single primary),
  Delete sits behind the `⋯` overflow / a `danger` button → confirm.
- **Editing is launched, never in-place — and it's the `create-form` pattern.** The
  detail page stays read-only; an Edit verb (the core-record *master edit*, or a
  per-tab sub-entity edit) **launches** a `create-form`, the carrier chosen by
  **field count**: few (≤ ~8, no branching) → a `Modal`; many → an **edit sub-page**
  (a `sub-route`). Master edit and in-tab sub-edits follow the same rule. **Editing
  never uses a wizard** (multi-step is a *create* concern). This rule covers editing
  the record's fields broadly — down to a **single value**, which still *launches*
  (a `Modal`); there is **no edit-in-place**.
- **On return from an edit: backfill, and restore the tab.** Saving (or cancelling)
  closes the modal / leaves the edit sub-page, and the detail simply **backfills**
  the updated values — no change-highlight, scroll-to, or flash. An edit launched
  from a tab **returns to that same tab** (tab state is preserved, never reset to
  Overview), so the user lands exactly where they left.
- Sensitive fields render masked by default; reveal is an audited action. The
  reveal control is a **`link`-variant button** — a low-emphasis inline affordance
  beside the masked value, not a `ghost` button.

## Variants & optional slots

**Variants** — the layout decision for the body.

- `overview` — sections laid out directly, **no tabs** (the band drops its tab
  strip). For when the sub-views are few and light enough to read on one scroll;
  the body stacks its labelled sections directly in `page-body`. Example:
  [`detail-page-overview.html`](./detail-page-overview.html).
- `tabbed` — multiple peer blocks become a `Tabs` set (line variant). One page
  with tab state, not one route per tab (see **Tabs vs sections** in Rules).
  Example: [`detail-page.html`](./detail-page.html).
- `sub-route` — when a sub-view is heavy, has independent permissions, or needs a
  deep-link, split it into its own route and **record the reason**. This is the
  one case where a detail "tab" becomes a real route.

**Overview structure** — `overview` = a **main card** (the KV grid — a left-right
label → value list; a long value wraps inside its value column) **+ an
optional right rail** of quiet secondary cards. **Hierarchy comes from
elevation**: the main card keeps the default `elevation-1` so it reads as the
protagonist; the rail's cards drop to **`.card--elevation-0`** (flat, no shadow)
so they recede behind it. Don't lift the main to `elevation-2` — `card.md`
reserves `2` for hover/overlay, so make the contrast by dropping the rail, not
raising the main.

**Headline metrics go in a top KPI row, not the rail** — when the record has key
metrics, surface them in a **full-width `.stat-grid` row at the top of the panel**
(`stat-grid--cols-N`, `repeat(N,1fr)` columns), above the `.detail-split`. A
`stat-card` has a minimum height; stacked vertically in the 320px rail it reads
short-and-wide. Use the KPI row **sparingly** — prefer no strip unless a metric
genuinely earns the top spot (a table-only tab is often the right answer).

**The main / aside split is `.detail-split`** — the closed-set layout utility
(`composites.css`), **not** a page-local grid: a fluid `minmax(0,1fr)` main + a
**fixed 320px rail** (a rail sized by its content, never a percentage that
balloons into whitespace on a wide viewport), collapsing to one column below
68rem. It is **not Overview-only** — every tab body that wants a main + aside
reuses the same `.detail-split`, so the tab outline stays put across tabs instead
of jumping between a 2-column overview and full-bleed collection tabs. **Group the
cards within each column** with a `.stack--N` (main `--5`, aside `--4`); the tab
panel itself keeps its `space-6` rhythm between top-level blocks (§13). A
collection tab whose aside would be empty simply omits it (the main spans the row).

**Detail head** — the **title/name** is the only required slot. An OPTIONAL
leading **back button** (ghost icon + a left chevron, `aria-label` required,
sharing the head's baseline with the right-side actions) precedes it **when the
record was reached from a list**; everything else — logo, status chip(s), meta,
actions — is included per the record's needs (see the slot table under Anatomy).

**Actions** — the detail page is where the shared action vocabulary concentrates;
see [`actions.md`](./actions.md). **copy** (copy an ID/key, ghost icon),
**transition** (status flip / approve-reject; destructive directions confirm),
**picker** (relate/assign via Combobox or a Modal list). Editing a field is not one
of these — it **launches** a `create-form` (see the Rules above), never edits in
place. Destructive actions stay behind the
overflow menu or a `danger` button (see **Destructive actions** in Rules).

## Building blocks

Composites: [`detail-header`](../composites/detail-header.md) (the identity +
status + meta + tab-strip band at the top), [`kv-grid`](../composites/kv-grid.md)
(the Overview), `card` (each labelled section / panel),
[`feed-list`](../composites/feed-list.md) or
[`timeline`](../composites/timeline.md) (activity), and
[`diff`](../composites/diff.md) (the confirm-change step),
[`page-body`](../composites/page-body.md) (the guttered content region),
[`stat-card`](../composites/stat-card.md) (headline metrics), and
[`empty-state`](../composites/empty-state.md) (empty activity / sections).
Layout utilities (pure geometry, no contract): **`.detail-split`** (the main +
320px-aside split reused by every tab body) and `.stack--N` (in-column grouping).
For a **rich collection section** (a search/paginated tab), it also reaches for the
list-page results composites: [`summary-bar`](../composites/summary-bar.md)
(count + the section's primary), the search
[`condition-band`](../composites/list-filter.md), and
[`rich-pagination`](../composites/rich-pagination.md).
Primitives underneath:
`Card`, `Badge`, `Tabs`, `Button`, `Separator`, `Avatar`. `@cloud/ui`: `layout/`
content-header + page-body; an artifact composes the same from `primitives.css` +
these composites.
