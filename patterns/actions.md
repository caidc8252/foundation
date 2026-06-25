# Pattern · Actions

The recurring **verbs** a portal screen offers — confirm-a-delete, export, bulk-act,
flip-a-status, relate, edit-in-place, copy-an-id. The page archetypes
([list](./list-page.md), [detail](./detail-page.md), [create-form](./create-form.md))
fix the *slots*; this reference fixes what lands **in** them. An action is named by
its intent, and each intent carries a fixed **carrier** (which button variant, and any
dialog/popover it opens), a fixed **tone**, and a fixed **confirm** rule — so a delete
reads the same on a list row, a detail head, and a section row, and so a prototype and
the production page spell every verb the same way. This mirrors the upstream
blueprint's `action` kind.

> 📐 **Copyable example** · [`actions.html`](./actions.html) — a one-page gallery, one
> card per action, each showing its carrier and (where it opens a surface) that surface
> rendered inline. It **links** the reference CSS so it never forks; inline the blocks to
> ship it as an artifact. All examples: [`index.html`](./index.html).

## The vocabulary

Seven actions cover the portal verbs. Pick by intent; the row then dictates the carrier,
where it lands, and whether it confirms — those are not per-screen choices.

| action | intent | carrier (variant + surface) | lands in (pattern slots) | confirm / tone |
|---|---|---|---|---|
| **confirm-danger** | destructive confirm — delete / remove / revoke | a `ghost-danger` **icon** button *or* a `danger` **text** button → opens an `AlertDialog` (outline **Cancel** + danger **Confirm**) | list row · detail head · section rows | always confirms; **danger** tone lives on the dialog's Confirm, not on a wall of red |
| **secondary-action** | a secondary tool action (e.g. Export, Columns) | a `secondary` button + a leading icon | list **summary bar** *or* page **header** — exactly **one** place | none; neutral tone |
| **batch-action** | act on a multi-select | a selection-count label + a bulk **button group** in the `summary-bar` (e.g. secondary Assign, ghost-danger Delete) | list summary (replaces the idle actions on select) | destructive verbs route through **confirm-danger**; otherwise neutral |
| **transition** | status flip / approve–reject | a status **button** or a `dropdown-menu` of statuses; destructive directions use `danger` + a confirm (or a reject-reason dialog) | detail head · section rows | confirm on destructive / service-interrupting directions; neutral on safe ones |
| **picker** | relate / assign | a trigger button → a `Combobox` (inline) *or* a `Modal` list | section header · detail head | none; neutral tone |
| **inline-edit** | edit one value in place | a KV/display value toggles to a `Field` + `Input` with inline **Save** (`primary` `sm`) / **Cancel** (`ghost` `sm`) | KV grid rows | none; neutral tone — destructive edits escalate to a confirm |
| **copy** | copy an id / key to the clipboard | a `ghost` icon-sm + a copy icon (clipboard glyph) | KV rows · detail meta · section rows | none; neutral tone |

## Rules

- **Danger tone is reserved.** `danger` / `ghost-danger` skins are for actions that take
  effect **directly** and are **service-interrupting or irreversible** (suspend, revoke,
  terminate). Everything reversible stays neutral (`secondary` / `ghost`).
- **Delete is the exception** — a delete control is a **neutral icon** (the trash glyph,
  `ghost` / `ghost-danger`) that opens **a confirm dialog**. The dialog is the safety
  gate, so the column isn't a wall of red; the only red is the dialog's Confirm.
- **Irreversible actions MUST confirm.** revoke / terminate / delete always go through an
  `AlertDialog`. High-risk ones (e.g. delete-a-tenant) may require **typing a confirm
  word** before the Confirm button enables.
- **One carrier per row.** A row exposes its verbs as inline **icons** *or* a single
  **kebab** (`⋯`) menu — never both. Pick icons when there are ≤2 frequent verbs;
  collapse to a kebab past that.
- **List rows navigate; mutations default to the detail page.** A list row's job is
  to open the record (click → its detail page) — *the list navigates, the detail page
  mutates.* By default a list row carries **no** edit / delete / `transition`; those
  land on the **detail head** ([`detail-page`](./detail-page.md)), and multi-row ops on
  the list **summary bar** (`batch-action`). Put verbs on a **list row** only when a
  requirement emphasizes single-row quick ops; when present they are
  **always-visible** (the `list-page` override), not hover-reveal.
- **Every icon-only control needs a name.** An `aria-label` (and/or a tooltip) on every
  icon-only button — the single exception being a **passive trailing row chevron**, which
  is decorative (the row itself is the click target) and is `aria-hidden`.
