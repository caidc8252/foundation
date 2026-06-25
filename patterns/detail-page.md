# Pattern · Detail page

"One record, read-mostly, with actions." The archetype you reach a list page's
row into. Named structure, not implementation.

> 📐 **Copyable example** · [`detail-page.html`](./detail-page.html) — the full anatomy
> assembled from composites (detail-header band with back button + status chips + meta +
> docked tabs → tab content: Overview KV grid, Activity timeline, empty states), ready to
> copy and modify. It **links** the reference CSS so it never forks; inline the blocks to
> ship it as an artifact. All examples: [`index.html`](./index.html).

## Anatomy

```
┌ detail-header band (full-bleed surface-2, NO breadcrumb) ─────────────────┐
│ [‹] 〔logo〕 name 〔status〕〔status〕        [ edit ] [ ⋯ ] [ primary ]      │
│              id · region · created … (meta row)                           │
│ ┌ tabs — OPTIONAL — line variant, docked on the band's bottom edge ────┐  │
│ │ Overview   Activity   Orders   Settings                              │  │
│ └────────────────────────────────────────────────────────────────────────┘  │
╞ page-body (gutters + stack) ══════════════════════════════════════════════╡
│ tabbed → the ACTIVE tab's content (Overview = a KV grid via               │
│          grid-auto-fit-kv; other tabs hold sections / timeline / empty).  │
│ no tabs → the body's sections stacked directly (Overview KV grid first).  │
└────────────────────────────────────────────────────────────────────────────┘
```

- **No in-page breadcrumb.** The path lives in the app shell's header, not the
  page. The page begins with the `detail-header` band.
- **Tabs are OPTIONAL.** Use them only when sub-views are genuinely independent
  and substantial (the `tabbed` variant); a single-section screen omits them (the
  `overview` variant) and the band is just identity + meta + actions. **When
  present**, the tab strip docks flush on the band's bottom edge **below** the
  name + meta — never as a separate block in `page-body`; `Overview` is the first
  tab and tab *content* renders in `page-body`. (Mirrors `detail-page.tsx`.)
- **A back button is mandatory** — an icon-only ghost button (`‹`), first in the
  bar, returning to the list the record was reached from.
- **Every other header slot is business-driven** — same rule as
  [`detail-header`](../composites/detail-header.md) and
  [`page-header`](../composites/page-header.md): only the **name** is always
  present; the logo, status badges, meta facts, and the actions are each included
  per the record's needs. **At most one primary action**, rightmost — a read-only
  record may have none.

## Rules

- **Status is shown, not editable here** — status changes are explicit actions
  (buttons / menu), each confirmed. Render multi-axis status as separate chips.
- **Tabs vs sections** — use tabs only when sub-views are genuinely independent
  and each is substantial; otherwise stack labelled sections on one page. A detail
  screen is ONE page with tab state, not one route per tab. When tabs are used,
  they dock in the **`detail-header` band** (below the name), not in `page-body`.
- **Overview is a key-value grid** via `grid-auto-fit-kv` (no hand-written
  `repeat(auto-fit,…)`); labels `text-content-tertiary`, values `content-primary`.
- **At most one primary action**, rightmost (mirrors `detail-header` /
  `page-header`) — a read-only record may have none, never two; everything else is
  `secondary` / `ghost`.
- **Destructive actions** live behind the overflow menu or a `danger` button, never
  as a bare primary.
- Sensitive fields render masked by default; reveal is an audited action.

## Variants & optional slots

**Variants** — the layout decision for the body.

- `overview` — 1–2 core blocks, laid out directly (no tabs).
- `tabbed` — multiple peer blocks become a `Tabs` set (line variant). One page
  with tab state, not one route per tab (see **Tabs vs sections** in Rules).
- `sub-route` — when a sub-view is heavy, has independent permissions, or needs a
  deep-link, split it into its own route and **record the reason**. This is the
  one case where a detail "tab" becomes a real route.

**Overview structure** — `overview` = a **main card** (the KV grid, via
`grid-auto-fit-kv`) **+ an optional right rail**. The rail stacks `stat-card`s
(key metrics) and/or an **amount-summary** (subtotal/fee lines + an emphasized
total, right-aligned mono) for order/invoice-style records.

- ⚠️ Foundation has no dedicated `amount-summary` composite yet — known gap.
  Compose it from `Separator` + mono KV for now; don't invent classes.

**Detail head** — a mandatory leading **back button** (ghost icon + a left chevron,
`aria-label` required, sharing the head's baseline with the right-side actions),
then identity/title, status chip(s), meta, actions.

**Actions** — the detail page is where the shared action vocabulary concentrates;
see [`actions.md`](./actions.md). **copy** (copy an ID/key, ghost icon),
**inline-edit** (a KV row toggles display↔input with save/cancel), **transition**
(status flip / approve-reject; destructive directions confirm), **picker**
(relate/assign via Combobox or a Modal list). Destructive actions stay behind the
overflow menu or a `danger` button (see **Destructive actions** in Rules).

## Building blocks

Composites: [`detail-header`](../composites/detail-header.md) (the identity +
status + meta + tab-strip band at the top), [`kv-grid`](../composites/kv-grid.md)
(the Overview), [`section-card`](../composites/section-card.md) (each labelled
section / collapsible panel), [`feed-list`](../composites/feed-list.md) or
[`timeline`](../composites/timeline.md) (activity), and
[`diff`](../composites/diff.md) (the confirm-change step). Primitives underneath:
`Card`, `Badge`, `Tabs`, `Button`, `Separator`, `Avatar`. `@cloud/ui`: `layout/`
content-header + page-body; an artifact composes the same from `primitives.css` +
these composites.

> First-draft stub — expand with concrete specs as real detail pages land.
