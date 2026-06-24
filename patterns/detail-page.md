# Pattern · Detail page

"One record, read-mostly, with actions." The archetype you reach a list page's
row into. Named structure, not implementation.

> 📐 **Copyable example** · [`detail-page.html`](./detail-page.html) — the full anatomy
> assembled from composites (breadcrumb → header with status chips → overview KV grid →
> tabs → activity timeline), ready to copy and modify. It **links** the reference CSS so
> it never forks; inline the blocks to ship it as an artifact. All examples: [`index.html`](./index.html).

## Anatomy

```
┌ breadcrumbs ─────────────────────────────────────────────┐
├ page-header ─────────────────────────────────────────────┤
│ name + status chip(s)        [ edit ] [ ⋯ ] [ primary ]   │
├ overview (KV grid) ──────────────────────────────────────┤
│ label   value     label   value     label   value        │
│ (grid-auto-fit-kv — columns follow container width)       │
├ section / tabs ──────────────────────────────────────────┤
│ Activity · Related · Settings …                           │
└──────────────────────────────────────────────────────────┘
```

## Rules

- **Status is shown, not editable here** — status changes are explicit actions
  (buttons / menu), each confirmed. Render multi-axis status as separate chips.
- **Tabs vs sections** — use tabs only when sub-views are genuinely independent
  and each is substantial; otherwise stack labelled sections on one page. A detail
  screen is ONE page with tab state, not one route per tab.
- **Overview is a key-value grid** via `grid-auto-fit-kv` (no hand-written
  `repeat(auto-fit,…)`); labels `text-content-tertiary`, values `content-primary`.
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

**Detail head** — optional leading **back button** (ghost icon + a left chevron,
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
