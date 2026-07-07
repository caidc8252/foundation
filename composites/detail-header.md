# Detail header · composite

The header **band** of a detail screen: an entity's identity (logo / name /
status), its metadata, its actions, and the tab strip that switches its
sub-views — all on one full-bleed surface that docks flush under the app header.

`detail-header` is the **"with back" header kind** — the header for any page you
reach *into*. Its counterpart is `page-header`, the **"no back" header kind** for
top-level pages (list / dashboard / settings) that have no "up" to return to.
Where `page-header` titles a *list* ("Customers · 1,248"), `detail-header` titles
*one record* ("Acme Corp · ACTIVE") **and** heads any create / edit / wizard page
(see "Reduced form" below). It recurs on **every** detail screen — customer,
order, app, firmware, factory image, device, ticket — and on every create/edit
flow, which is why it is a shared composite, not duplicated per page. The
[detail-page pattern](../patterns/detail-page.md) draws exactly this band at the
top of its anatomy; [`create-form`](../patterns/create-form.md) and
[`create-wizard`](../patterns/create-wizard.md) draw its reduced form.

> **Contract scope.** The cross-consumer design contract: anatomy, the action
> rule, the tab-strip reuse, tokens, states. NOT the React prop types — those
> live with `@cloud/ui` + the `ui` skill. When an implementation disagrees with
> this file, the file wins.

## Anatomy

```
┌ detail-header (full-bleed surface-2 band, hairline bottom edge) ────────────┐
│ [‹] 〔logo〕 Name 〔status〕 〔chip〕 〔chip〕   [ secondary? ] [ ⋯? ] [ primary? ] │
│              id · mono · 〔copy〕 · created 3d ago · 12 members               │
│ ┌ tabs (line variant, on the band's bottom edge) ─────────────────────────┐ │
│ │ Overview   Activity   Members   Settings                                │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Back** — icon-only ghost button (`.btn--ghost`; its `chevron-left` glyph is
  **16px** / `--space-4`, one step over the 14px button default so the page-level
  back reads with a little more weight — matches `@cloud/ui`'s detail back), first in the
  bar. Returns to the place it was reached from. On a **detail** screen it is
  optional (present when the record was reached from a list); on a **create / edit
  / wizard** page it is **required** and is an **exit-without-committing**
  affordance. Neither a **wizard** nor a single-step **create / edit** page carries a
  Cancel or a commit in this header — the back button is its only header control; the
  commit cluster lives in a sticky bottom action footer (see Reduced form).
  Its glyph is the **`chevron-left`** icon (per `primitives/icon.md` — Back =
  `chevron-left`), the same back affordance used across wizards and pagination —
  **not** `arrow-left`. On a wizard, this header back **exits the whole flow**; the
  footer nav's own "Back" (previous step) is a separate, labelled control that is
  hidden on step 1, so the two never collide.
- **Vertical alignment** — the bar's row is **vertically centered**
  (`align-items: center`): back button, logo, the identity block, and the action
  cluster all share one vertical center. The back button is **not** nudged to the
  title's top line — against a 56px logo / two-line identity that would leave it
  (and the actions) sitting high. Centering keeps them balanced for both one- and
  two-line identities.
- **Logo / avatar** — optional 56px square (entity logo) or an `Avatar` /
  `InitialsTile` primitive. Omit for records with no visual identity.
- **Main** — at most **two lines**: (1) the `title` (one `h1` `name`) with optional
  inline **status badges** and **category chips** (`Badge`s) on the *same* line —
  the name ellipsizes so trailing badges / chips survive; (2) a one-line **meta row**
  (mono ids, a `copy` affordance, dot-joined facts). **Never a third stacked line** —
  chips share the title line, they do not get their own row.
- **Actions** — the action cluster, **business-driven** (same rule as
  `page-header`): include only the verbs this record needs. The `⋯` overflow is
  present **only when** there are destructive / surplus secondary verbs to collapse
  into it — never render an empty `⋯`.
- **Tabs** — the `tabs` primitive (`--line` variant) docked on the band's bottom
  edge, NOT a second component. Render the strip only when sub-views are
  genuinely independent (see the detail-page pattern's "tabs vs sections" rule).
  Each trigger is a **label only** — no count / quantity / status `badge` on the
  tab (a collection's count lives in its panel's `summary-bar`, not on the
  trigger; see [`tabs`](../primitives/tabs.md)).

## Rules

- **Identity is at most two lines.** Line 1 = `name` + **status badges** + **category
  chips**, all inline (the name ellipsizes first so trailing badges / chips survive);
  line 2 = the **meta row**. Chips never take a third stacked line — they ride the
  title line with the status badges. Keep the band compact: don't add a row.
- **At most one primary action**, rightmost when present — a read-only record may
  have none, but it never has two. Everything else is `secondary` / `ghost`;
  destructive actions live behind the `⋯` overflow menu **or** a `danger`
  button — never a bare primary (mirrors `page-header` and the detail-page
  pattern). When it's the `⋯` overflow, the menu is a `dropdown-menu` and its rows
  are **`.dropdown-menu__item`** (Delete = the `--destructive` variant — `error`
  text, not a fill) — **never `.btn` buttons inside the menu**; the `danger` *button*
  is the alternative carrier, used **instead of** a menu, not within it. The `⋯`
  overflow appears **only when** there are destructive or surplus secondary verbs to
  collapse into it; a header with just (say) Edit + a primary shows **no** `⋯` —
  don't render an empty overflow.
- **Status is shown, not edited here.** Multi-axis status renders as separate
  badges; a status *change* is an explicit, confirmed action, not a toggle on the
  chip.
- **Reduced form (create / edit / wizard header).** The same composite heads
  create/edit/wizard pages with only its **back + title** (+ an **optional one-line
  `.detail-header__description`** under the title, carrying the page's purpose) —
  **no actions, logo, meta, chips, or tabs**. The description mirrors
  `page-header`'s (`text-md` / `content-tertiary`, one line) so create/edit pages
  keep the same title+description rhythm as top-level pages; omit it when the title
  alone makes the page obvious. Both a single-step create/edit page and a wizard carry **no** header
  action at all: the commit cluster lives in a **sticky bottom action footer** — a
  create/edit page a `ghost Cancel + primary` (Create / Save), a wizard a `ghost Back +
  primary Continue`; see [`create-form.md`](../patterns/create-form.md) /
  [`create-wizard.md`](../patterns/create-wizard.md). Same classes, same band; the identity
  and action slots are simply omitted (they are all optional).
- The band is **sticky by default in patterns** — apply `.detail-header--sticky`
  so the identity + actions (+ tabs) dock under the app header while the body
  scrolls. detail-page, create-form, and create-wizard all use `--sticky`.
- The band is **full-bleed** — it draws its bottom hairline edge-to-edge and
  breaks out of `page-body`'s gutters, exactly like `page-header`. Tab *content*
  below gets its own page padding.
- **The tab strip is the `tabs` primitive**, not re-skinned here. Hold every tab
  at one weight so the selected tab doesn't widen and nudge its neighbours; the
  active tab reads by ink + the 2px underline (see `tabs`).
- Title is `text-2xl` / weight 600 / tracking-tight / `content-primary`. The meta
  row is `text-xs` / `content-secondary`; ids are mono.

## States

- **Loading** — the title/meta can hold while a `skeleton` fills the values; the
  tab strip renders its labels immediately.
- **Wrap** — on narrow widths the action cluster wraps below the title (never
  truncate actions); the title block flexes and ellipsizes the name.
- **No tabs** — a single-section detail screen omits `.detail-header__tabs`; the
  band is then just identity + meta + actions over its hairline.

## Implementation notes

Cross-consumer guards:

- **The tab strip IS the Tabs primitive** (`--line` variant) docked on the band's
  bottom edge — not a second component and not re-skinned. Hold every tab at one
  weight so the active tab doesn't widen and shift its neighbours (see `tabs`).
- **The name truncates; badges don't.** The name cell is `min-w-0` + truncate so
  trailing status badges stay on the title line instead of being pushed off.
- **Meta row uses dot separators** (`·`) *between* facts (inserted between items,
  never trailing the last); ids render mono.
- **Full-bleed band**, like `page-header`: render it OUTSIDE `page-body` so it
  spans edge-to-edge and draws its hairline corner-to-corner; the tab *content*
  below gets `page-body`'s gutters.
- **Non-token measure**: the logo is 56px → `size-14` (a default utility, not
  arbitrary). Everything else is tokens.
- At most one primary action, rightmost; destructive behind the overflow menu or
  a `danger` button.

## Implementations

- **Next / @cloud/ui** — composed from `layout/` (full-bleed band) + `Card`
  (`flex-row` head), `Badge`, `Avatar`, `Button`, and the `Tabs` primitive for
  the strip; this contract names the shared structure those parts assemble into.
  See the `ui` skill (layout reference).
- **Artifact** — `.detail-header` (+ `--sticky`) → `.detail-header__bar`
  (holding `.btn--ghost.detail-header__back`, `.detail-header__logo`,
  `.detail-header__main` → `.detail-header__title` [contains `.detail-header__name`
  + status `.badge`(s) + `.detail-header__chips`] / `.detail-header__meta`
  (or, in the reduced form, `.detail-header__description`), then
  `.detail-header__actions` with `.btn--*`) → `.detail-header__tabs` wrapping a
  `.tabs__list--line`. In `composites.css`.
