# Detail header · composite

The header **band** of a detail screen: an entity's identity (logo / name /
status), its metadata, its actions, and the tab strip that switches its
sub-views — all on one full-bleed surface that docks flush under the app header.
The detail-page counterpart to `page-header`: where `page-header` titles a *list*
("Customers · 1,248"), `detail-header` titles *one record* ("Acme Corp ·
ACTIVE"). It recurs on **every** detail screen — customer, order, app, firmware,
factory image, device, ticket — which is why it is a shared composite, not
duplicated per page. The [detail-page pattern](../patterns/detail-page.md) draws
exactly this band at the top of its anatomy.

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

- **Back** — optional icon-only ghost button (`.btn--ghost` at icon size),
  first in the bar. Returns to the list it was reached from.
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
  + status `.badge`(s) + `.detail-header__chips`] / `.detail-header__meta`, then
  `.detail-header__actions` with `.btn--*`) → `.detail-header__tabs` wrapping a
  `.tabs__list--line`. In `composites.css`.
