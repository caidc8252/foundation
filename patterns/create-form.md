# Pattern · Create / edit form

"Capture or change a record." The single-step form — one card of fields, one
commit. Named structure, not implementation.

> 📐 **Copyable example** · [`create-form.html`](./create-form.html) — the single-step
> card form (Field units, grouped into labelled section cards when long, with a
> back button + title in the sticky detail-header and a ghost Cancel + primary in a
> sticky bottom action footer), ready to copy and modify. It **links** the reference CSS so
> it never forks; inline the blocks to ship it as an artifact. All examples: [`index.html`](./index.html).

## Anatomy — single step (full page; modal uses `Modal` chrome — see "Carrier")

```
┌ detail-header (sticky top) ──────────────────────────────┐
│ [‹] title                                                │
├ body ────────────────────────────────────────────────────┤
│ Field: label                                              │
│        [ input ]                                          │
│        help / error                                       │
│ … grouped into labelled section cards when long …        │
├ footer (sticky bottom) ──────────────────────────────────┤
│                               [ Cancel ] [ create/save ] │  ← right-aligned
└──────────────────────────────────────────────────────────┘
```

The header is the sticky [`detail-header`](../composites/detail-header.md) in its
**reduced form** (the "with back" header kind): a **back button** (leftmost — exit
without committing) + the title — **no actions, logo, meta, chips, or tabs**. The
**ghost Cancel and the primary** commit (Create / Save changes) live in a **sticky
bottom action footer** (Cancel left, primary rightmost per `actions.md`), pinned to the
bottom of the viewport. The header sticks to the top and the footer to the bottom as the
user scrolls a long form, so both the exit and the commit stay reachable throughout.

The detail-header (back + title), the **sticky bottom footer** (ghost Cancel + Create/Save),
and **at least one `form-section` card** (*"form-section" 是概念单元——一张 `card` 的 `Field`,非 CSS 类;html 中即 `.card.form-page`*) are the required core. Everything else — a status banner, a
file-upload block, extra section cards, per-section or page descriptions — is
**optional**, included only when the page's job calls for it (see the slot table).

The multi-step wizard (≥3 steps, stage dependencies, or branching) is now its own
pattern → [`create-wizard.md`](./create-wizard.md).

### Slots — what's required core vs. driven by the page's job

A pattern is a **framework**: it fixes structure + ordering, not that every slot is
filled (governance [principle #9](../governance/principles.md) — *patterns are
frameworks*). The required core below is the few slots without which this stops
being a create/edit form; everything else is included per business need. The
[`create-form.html`](./create-form.html) example shows the **required core live**;
the optional slots appear only as labelled, removable stubs/comments — the
status `banner`, the extra section card, and the file-upload block (a `dropzone`
primitive stub) are commented stubs, and the
preview/summary rail is **full-page-only** and not shown in this example. Copying
the example does **not** mean filling every slot.

| slot | required? | include when |
|---|---|---|
| sticky `detail-header` (back + title) | **yes** | always — the back button (exit without committing) + the title naming the record being created/edited (no actions cluster) |
| sticky bottom footer: ghost Cancel + primary Create/Save | **yes** | always — the [`action-footer`](../composites/action-footer.md) composite: a ghost Cancel (leading `x`) then the primary commit, right-aligned (Cancel left, primary rightmost). The header back is the other exit; the primary verb follows the variant |
| ≥1 `form-section` card (header + `Field`s) | **yes** | always — at least one card of fields is the form |
| header `description` | no | the title alone doesn't make the page's purpose obvious |
| status `banner` (alert under the header) | no | a record-level status/notice must be surfaced before the fields |
| file-upload block (`dropzone`, in the body) | no | the form captures a file/attachment — use the [`dropzone`](../primitives/dropzone.md) primitive (`.dropzone` + `.file-list`/`.file-row`) |
| additional `form-section` cards | no | the form is long enough to split into per-concern cards (Identity, Billing, …) |
| per-section `description` | no | a section's purpose isn't obvious from its header |
| preview / summary rail (**full page only**) | no | a long full-page form benefits from a sticky side recap / live preview of what's being entered (a `dl`); a modal form never carries one |

## Variants

The variant drives the primary verb in the (required) sticky footer:

- **`create`** — empty form; primary reads **"Create X"** ("Create customer").
- **`edit`** — prefilled with the record's current values; primary reads **"Save
  changes"**. Same anatomy, same fields — only the seeded values, the title, and
  the verb differ.

## Rules

- **The required core is the sticky header + ≥1 `form-section` + the sticky footer.** A
  valid create/edit form is, at minimum, the sticky `detail-header` (back button + title,
  in the composite's reduced form — no actions/logo/meta/tabs) above a single `form-section`
  card of `Field`s, with a **sticky bottom footer** carrying the ghost Cancel + primary
  Create/Save. Banner, file-upload, extra section cards, and descriptions are optional
  add-ons (slot table above) — present them only when the page's job needs them, never as a
  default checklist.
- **One `Field` unit** = label + control + help/error, vertically stacked. Errors
  attach to the field, in the interface's voice ("Enter a valid email"), not a
  global banner — and explain how to fix.
- **Multi-column field rows use the `.form-grid` utility** — `.form-grid--2` /
  `.form-grid--3` for a fixed 2-/3-up row (collapsing to 1-up below `sm`), or bare
  `.form-grid` for auto-fit. It is a closed-set layout utility (like `.stack`); do
  **not** hand-roll a page-local `.form-row`/grid in the artifact's `<style>`.
- **Submit says what it does** — "Create customer", "Save changes" — not "Submit";
  the button keeps its verb through the resulting toast ("Customer created").
- **Group long forms into labelled section cards by concern** — one `Card` per
  concern (Identity, Billing, Notifications, …), each with its own header, rather
  than one flat list of fields. A short form (≤ ~8 fields) stays the single
  required card; the *additional* section cards are the optional slot, added only
  when the form is long enough to warrant splitting.
- **Validation** is Zod-backed on the Next side; the form mirrors the same rules.
  Disable submit only while pending, not to express invalid (show field errors).
- **Carrier by field count** — modal for short forms (≤ ~8 fields, no branching); a
  full page otherwise. The **wizard** escalation (≥3 steps / branching) is
  **create-only**: an **edit never becomes a wizard** — it stays a single surface
  (modal or one page) so the user jumps to a field and saves.
- **The commit surface depends on the carrier.** A **full-page** form heads with the
  sticky `detail-header` (back + title) and carries its **ghost Cancel + primary** in a
  **sticky bottom action footer** (described above). A **modal** form has no page header or
  page footer: it uses the `Modal` primitive's own chrome (`.modal__header` + a
  `.modal__footer` carrying its **ghost Cancel + primary**), which is the dialog
  convention. Either way the commit sits rightmost with a ghost Cancel to its left
  (`actions.md` order).
- **Optional preview / summary rail (full-page only).** A long full-page form may
  carry a sticky right rail that recaps entered values or previews the result (a
  `dl`; mechanism borrowed from the wizard's summary rail). All-or-nothing across the
  form; a modal form never has one (it's short by definition).

## File-upload block

When the form captures a file/attachment, drop the [`dropzone`](../primitives/dropzone.md)
primitive into the body (typically inside its own `form-section` card): the
`.dropzone` zone (rest / `--drag` / `--disabled`) plus a `.file-list` of
`.file-row`s for picked files. It is **presentation-only** — the host wires the
actual upload and feeds per-file status/progress back; the form never uploads on
its own. Include it only when the page's job needs it (optional slot above).

## Building blocks

Composites: [`detail-header`](../composites/detail-header.md) (the full-page form's
"with back" header band, reduced form — back + title) +
[`page-body`](../composites/page-body.md) (the guttered content region the form
card sits in) + [`action-footer`](../composites/action-footer.md) (the governed sticky
bottom commit band — `surface-2` + hairline top, actions right-aligned, pinned to the
viewport bottom). A modal form uses the `Modal` primitive's chrome instead of the header
band + footer.

Primitives: `Field`, `Label`, `Input`/`Textarea`/`Select`/`Checkbox`/`RadioGroup`,
`Button`, `Modal`/`Sheet`, `Card` (the form card and per-concern section cards),
`Dropzone` (the optional file-upload block).
`@cloud/ui` realizes these; an artifact composes from `primitives.css`.

> First-draft stub — expand with field-spacing and section specs as real forms land.
