# Page header  · composite

The band at the top of a screen: what this page is, plus its actions. It is the
**"no back" header kind** — for **top-level pages** (list / dashboard / settings)
that you land on directly and have no "up" to return to, so they carry **no back
button**. Its counterpart is [`detail-header`](./detail-header.md), the **"with
back" header kind** for any page you reach *into* (detail / create / edit /
wizard). Between the two, every screen's header is covered — which is why each is
a shared composite, not duplicated inside each pattern.

> **Contract scope.** The cross-consumer design contract: anatomy, the action
> rule, tokens, states. NOT the React prop types — those live with `@cloud/ui` +
> the `ui` skill. When an implementation disagrees with this file, the file wins.

## Anatomy

```
┌ page-header ─────────────────────────────────────────────────┐
│ Title  〔status chip〕                [ secondary ] [ primary ] │
│ optional description                                          │
└───────────────────────────────────────────────────────────────┘
```

- **Left** — `title` (one `h1`, **the only required slot**), optional **status
  adornment** (a `Badge`), optional one-line `description`.
- **Right** — the action cluster (optional — see the slot rule below).

### Slots — what's required vs. driven by the page's job

The header band recurs everywhere, but **what it carries is business-driven**:
only the title is always present. Include each other slot solely when this
page's job calls for it — most pages render a subset, not the whole band.

| slot | required? | include when |
|---|---|---|
| `title` | **yes** | always — names the page |
| status adornment | no | the page/entity has a status worth surfacing up top |
| `description` | no | the title alone doesn't make the page's purpose obvious |
| primary action | no | this page has a single main verb (Create / Save / …) |
| secondary action(s) | no | a page-level secondary verb exists (Import / Export / …) |

## Rules

- **At most one primary action**, rightmost when present — a read-only /
  informational page may have none, but it never has two. Everything else is
  `secondary` / `ghost`. Destructive actions are never a bare primary here —
  behind an overflow menu or a `danger` button.
- Title is `text-2xl` / weight 600 / tracking-tight / `content-primary`.
- `description` is `text-sm` / `content-tertiary`, one line, capped to a readable
  measure — not a paragraph.
- **Sticky variant** (`.page-header--sticky`) docks the band under the app header
  while the page scrolls — use it on a top-level page whose header actions must
  stay reachable through a long scroll. (Create / edit / wizard pages are **not**
  page-header — they use the sticky [`detail-header`](./detail-header.md).)

## States

- **Loading** — title can hold while a status adornment renders a `skeleton`.
- **Wrap** — on narrow widths the action cluster wraps below the title (never
  truncate actions).

## Implementations

- **Next / @cloud/ui** — `layout/PageHeader` (full-bleed band) or `ContentHeader`
  (in-content title). Props `title` `description` `actions` `titleAdornment`
  `sticky`. Detail-page header (logo + status + meta in a row) wraps a `Card`
  with `flex-row`. See the `ui` skill (layout reference).
- **Artifact** — `.page-header` (+ `--sticky`) → `.page-header__bar` →
  `.page-header__titles` (`.page-header__heading` holding `.page-header__title`
  + a `.badge`, then `.page-header__description`) +
  `.page-header__actions` (holding `.btn--*`). In `composites.css`.
