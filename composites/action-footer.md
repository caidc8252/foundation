# Composite · Action footer

A full-bleed action band pinned to the bottom of the scroll root, carrying a
right-aligned commit cluster — the bottom counterpart to the header bands
([`page-header`](./page-header.md) / [`detail-header`](./detail-header.md)).

> 📐 **Copyable example** · [`action-footer.html`](./action-footer.html) — the band in an
> `app-frame__main` scroll root, shown with both arrangements (create-form's ghost Cancel +
> primary, and the wizard's ghost Back + primary Continue). It **links** the reference CSS
> so it never forks; inline the blocks to ship it as an artifact.

## Contract scope

Owns the **band** (surface + top hairline + bottom-pinning) and its **right-aligned
action row**. It does **not** own the buttons themselves (those are the
[`button`](../primitives/button.md) primitive) or decide which verbs appear — that is the
[`actions.md`](../patterns/actions.md) order rule and each pattern's job. Used by
[`create-form`](../patterns/create-form.md) (ghost Cancel + primary Create/Save) and
[`create-wizard`](../patterns/create-wizard.md) (ghost Back + primary Continue/verb); the
page's **exit** stays in the sticky header's back button, the **commit** rides here.

## Anatomy

```
├ … page-body (scrolls) ……………………………………………………………………………┤
├ action-footer (sticky bottom, full-bleed) ─────────────────────┤
│                              [ ghost Cancel/Back ] [ primary ]  │  ← right-aligned
└─────────────────────────────────────────────────────────────────┘
```

- `.action-footer` — the band: `surface-2`, a 1px top hairline (`line-subtle`), pinned to
  the bottom of the scroll root. Breaks out of `page-body`'s gutters edge-to-edge, exactly
  like the header bands at the top.
- `.action-footer__bar` — the inner row: the action cluster, `justify-content: flex-end`
  (right-aligned), `gap: space-2`, gutters `padding-inline: space-6` / `padding-block:
  space-4` (mirrors the `detail-header__bar`).

## Pinning model

The band stays at the **viewport** bottom whether the page is short or long, and touches
nothing when it is absent:

- `.app-frame__main:has(.action-footer)` turns the scroll root into a flex column **only
  when a footer is present** — footer-less pages (list / detail / dashboard …) are
  untouched.
- `margin-block-start: auto` pushes the band to the bottom when the content is shorter than
  the viewport.
- `position: sticky; bottom: 0` keeps it pinned while a long page scrolls beneath it.

**Host requirement:** the scroll root is `.app-frame__main` (bounded height + its own
`overflow-y`), the same root the sticky `detail-header` docks to. Inside a modal there is
no `action-footer` — a dialog uses the `Modal` primitive's own `.modal__footer` chrome.

## Rules

- **Right-aligned, never split.** The commit sits rightmost; subordinate controls (a ghost
  Cancel, a ghost Back) sit to its left, all riding the same right edge (`actions.md`
  order). **Never** push one control to the far-left edge with an auto margin or
  `justify-content: space-between`.
- **At most one primary.** One primary commit per footer; everything else is a `ghost`.
  Cancel/Back tone is **`ghost`** here (the sticky-footer surface — see `actions.md`
  "Cancel tone follows the surface").
- **Commit, not exit.** The footer commits the page; the **exit** without committing is the
  sticky header's leftmost back button, outside this cluster. Don't duplicate an exit here.
- **One band per page.** A page has a single `action-footer`; hide it (not restyle it) on
  states that have no commit (e.g. a wizard's done screen).
- **Full-bleed.** The band draws its top hairline edge-to-edge and is a **sibling of
  `page-body`** in the scroll root — never nested inside `page-body`'s gutters.

## Accessibility

- Use a `<footer>` landmark for the band. The buttons keep their own labels; an icon-only
  control (e.g. the Back chevron pairs with a "Back" text label) still needs an accessible
  name per [`actions.md`](../patterns/actions.md).
- Because the band is sticky, it never scrolls out of reach — the commit stays reachable
  from any scroll position on a long form.

## Implementations

**Next / `@cloud/ui`** — a layout `ActionFooter` (or the form/wizard shell's footer slot):
a sticky bottom bar rendering the page's commit cluster; the same surface + hairline as the
header band, actions right-aligned.

**Artifact** — root `<footer class="action-footer">` (a direct child of
`.app-frame__main`, **after** `.page-body`) › `<div class="action-footer__bar">` › the
[`button`](../primitives/button.md)s in source order (ghost Cancel/Back first, primary
last). No page-local CSS is needed for the band or its pinning — the composite owns both.
