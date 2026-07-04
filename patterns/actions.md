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
| **confirm-danger** | destructive confirm — delete / remove / revoke | a `ghost-danger` **icon** button *or* a `danger` **text** button → opens an `AlertDialog` (ghost **Cancel** + danger **Confirm**) | list row · detail head · section rows | always confirms; the trigger carries `danger` tone (icon or text), and the dialog's Confirm is `danger` too |
| **secondary-action** | a secondary tool action (e.g. Export, Import) | a `secondary` button + a leading icon | list **summary bar** *or* page **header** — exactly **one** place | none; neutral tone |
| **batch-action** | act on a multi-select | a selection-count label + a bulk **button group** in the `summary-bar` (e.g. secondary Assign, ghost-danger Delete) | list summary (replaces the idle actions on select) | destructive verbs route through **confirm-danger**; otherwise neutral |
| **transition** | status flip / approve–reject | a status **button** or a `dropdown-menu` of statuses; destructive directions use `danger` + a confirm (or a reject-reason dialog) | detail head · section rows | confirm on destructive / service-interrupting directions; neutral on safe ones |
| **picker** | relate / assign | a trigger button → a `Combobox` (inline) *or* a `Modal` list | section header · detail head | none; neutral tone |
| **inline-edit** | edit one value in place | a KV/display value toggles to a `Field` + `Input` with inline **Save** (`primary` `sm`) / **Cancel** (`ghost` `sm`) | KV grid rows | none; neutral tone — destructive edits escalate to a confirm |
| **copy** | copy an id / key to the clipboard | a `ghost` icon-sm + a copy icon (clipboard glyph) | KV rows · detail meta · section rows | none; neutral tone |

## Rules

- **Primary is rightmost — the order is fixed, not a per-screen choice.** In any
  actions group — a `page-header` actions slot, a dialog footer, a `create-wizard`
  nav, an inline row — the **commit verb is the last (rightmost) button**;
  subordinate controls (`secondary`, `ghost`, a `ghost` **Back**) sit to its left and
  **Cancel is leftmost**: `secondary`/`ghost` Cancel → … → `primary`/`danger` Confirm.
  **Cancel tone follows the surface:** a `page-header` actions slot uses a `secondary`
  Cancel; a dialog / confirm surface or a card footer (`Modal` · `AlertDialog` · `Sheet` ·
  `card__footer`) uses a `ghost` Cancel. **At most one primary per group.** Source order
  *is* visual order in the row — author the markup in this order; never reorder with CSS.
  This is why a `create-wizard` nav is `ghost Back + primary Continue` and an
  `AlertDialog` is `ghost Cancel + danger Confirm`. (A `create-form` / `create-wizard`
  header carries no in-group Cancel at all — its exit is the leftmost `detail-header`
  back button, outside the actions cluster.) (A trailing destructive
  icon — a `ghost-danger` Delete/Terminate after the primary — is the one exception, and
  even then prefer routing it through the `⋯` overflow per **One carrier per row**.)
- **Danger tone marks destructive verbs.** `danger` / `ghost-danger` skins are for
  **destructive** actions — delete / remove / revoke / suspend / terminate.
  Everything reversible / routine stays neutral (`secondary` / `ghost`).
- **Delete reads as destructive.** A delete control carries `danger` tone — a `danger`
  text button or a `ghost-danger` icon — and still opens **a confirm dialog** as the
  safety gate. Don't dilute it to a neutral control to avoid red; destructive is meant
  to look destructive.
- **Irreversible actions MUST confirm.** revoke / terminate / delete always go through a
  confirm dialog — never fire silently (see **Confirmation tiers**).
- **One carrier per row.** A row exposes its verbs as inline **icons** *or* a single
  **kebab** (`⋯`) menu — never both. Pick icons when there are ≤2 frequent verbs;
  collapse to a kebab past that.
- **A peer action group shares one weight.** Actions of *equal emphasis* sitting
  together in one row / cluster — a table row's inline verbs, a card-header action set,
  a section-row group — use **one carrier**: never mix `secondary` with `ghost` for
  peers (e.g. `Lock` as `secondary` next to `Reset password` as `ghost` is the bug —
  pick one). A **destructive** verb inline among such peers takes **`ghost-danger`**
  (still red — destructive still *looks* destructive — but low-chrome), **not** the
  solid `danger` fill: solid `danger` is a destructive **primary** (a standalone CTA,
  or the `AlertDialog` **Confirm**), and dropped into a peer row it becomes the group's
  visual anchor — backwards for a destructive verb, and it reads as *taller/heavier*
  than its outlined neighbours though the box is the same height. (Three inline text
  verbs like Edit / Suspend / Terminate also trip **One carrier per row** — collapse
  them to icons or a `⋯` menu.)
- **A menu row is a menu item, not a button.** Inside a `⋯` / `dropdown-menu`, verbs
  are `.dropdown-menu__item` rows (destructive → the `--destructive` variant,
  `error-strong` text) — **never `.btn`** (`secondary` / `danger` / `ghost`) buttons. The
  `danger`/`ghost-danger` **button** in `confirm-danger` is the *standalone* trigger
  (used instead of a menu), not something you place inside a menu.
- **List rows navigate; mutations default to the detail page.** A list row's job is
  to open the record (click → its detail page) — *the list navigates, the detail page
  mutates.* By default a list row carries **no** edit / delete / `transition`; those
  land on the **detail head** ([`detail-page`](./detail-page.md)), and multi-row ops on
  the list **summary bar** (`batch-action`). Put verbs on a **list row** only when a
  requirement emphasizes single-row quick ops; when present they are
  **always-visible `sm` buttons** (the `list-page` override) — `secondary` for the
  action, `ghost-danger` for a Delete that opens a `confirm-danger` dialog (low-chrome
  to match its `secondary` peers per **A peer action group shares one weight**; the solid
  `danger` fill is the dialog's Confirm, not the inline row trigger) — not hover-reveal icons.
  On a `data-table` they share the row's **single trailing `.row-actions` cell** with the
  navigate chevron (verbs first, passive chevron last); a quick-op row both acts and
  navigates, so the verbs `event.stopPropagation()` (see [`data-table.md`](../composites/data-table.md)).
- **Every icon-only control needs a name.** An `aria-label` (and/or a tooltip) on every
  icon-only button — the single exception being a **passive trailing row chevron**, which
  is decorative (the row itself is the click target) and is `aria-hidden`.
- **Add-to-list shows one "Add" at a time.** When a flow collects a list of
  sub-entities (line items), an inline add-form commits with a single primary **Add**
  that appends; a deferred add-form is opened by **Add &lt;item&gt;** and commits *inside*
  with **Add / Save** — never an "open" button and a "commit" button that both read
  **Add**. The collected items render as an editable/removable list. See
  [`create-wizard.md`](./create-wizard.md).

## Confirmation tiers

A confirm's friction tracks the action's **risk**, not its kind:

- **No dialog** — a reversible, low-risk action just runs; a success `toast` is the only
  feedback. Don't gate reversible actions behind a dialog (it trains click-through), and
  there is **no Undo** affordance.
- **Simple confirm** — irreversible but contained (delete a record, remove a member): an
  `AlertDialog` — a consequence line + `ghost` Cancel + `danger` Confirm, no input, no
  escape.
- **Confirm with input** — the action must capture context (a reject reason, a suspend
  note): an `AlertDialog` can't hold a field, so use a **hardened `Modal`**
  (`closeOnOverlay` + `closeOnEscape` off, keeping the forced choice) with the field + a
  `danger` / `primary` Confirm.

**Carrier rule** — input-less confirm → `AlertDialog`; a confirm that must capture input
→ a hardened `Modal`. The Confirm is `danger` for destructive actions; the copy names
the consequence and the affected object.
