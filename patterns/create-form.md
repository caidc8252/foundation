# Pattern · Create / edit form

"Capture or change a record." The single-step form — one card of fields, one
commit. Named structure, not implementation.

> 📐 **Copyable example** · [`create-form.html`](./create-form.html) — the single-step
> card form (Field units, grouped into labelled section cards when long, with
> cancel/submit in the sticky header), ready to copy and modify. It **links** the reference CSS so
> it never forks; inline the blocks to ship it as an artifact. All examples: [`index.html`](./index.html).

## Anatomy — single step (modal or page)

```
┌ header (sticky) ─────────────────────────────────────────┐
│ title                         [ cancel ] [ create/save ]  │
├ body ────────────────────────────────────────────────────┤
│ Field: label                                              │
│        [ input ]                                          │
│        help / error                                       │
│ … grouped into labelled section cards when long …        │
└──────────────────────────────────────────────────────────┘
```

The page-header sticks to the top of the viewport as the user scrolls through a long
form. Cancel and the primary action (Create / Save changes) sit in the header's
actions slot — there is **no separate footer row**.

The page-header (with its Cancel + Create/Save actions) and **at least one
`form-section` card** (*"form-section" 是概念单元——一张 `card` 的 `Field`,非 CSS 类;html 中即 `.card.form-page`*) are the required core. Everything else — a status banner, a
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
| sticky `page-header` (title) | **yes** | always — names the record being created/edited |
| header actions: ghost Cancel (leading X icon) + primary Create/Save | **yes** | always — the conventional fill of the sticky header's actions slot (the primary verb follows the variant) |
| ≥1 `form-section` card (header + `Field`s) | **yes** | always — at least one card of fields is the form |
| header `description` | no | the title alone doesn't make the page's purpose obvious |
| status `banner` (alert under the header) | no | a record-level status/notice must be surfaced before the fields |
| file-upload block (`dropzone`, in the body) | no | the form captures a file/attachment — use the [`dropzone`](../primitives/dropzone.md) primitive (`.dropzone` + `.file-list`/`.file-row`) |
| additional `form-section` cards | no | the form is long enough to split into per-concern cards (Identity, Billing, …) |
| per-section `description` | no | a section's purpose isn't obvious from its header |
| secondary header action (beyond Cancel) | no | a genuine page-level secondary verb exists — Cancel is not "secondary" in this sense |
| preview / summary rail (**full page only**) | no | a long full-page form benefits from a sticky side recap / live preview of what's being entered (a `dl`); a modal form never carries one |

## Variants

The variant drives the primary verb in the (required) header actions slot:

- **`create`** — empty form; primary reads **"Create X"** ("Create customer").
- **`edit`** — prefilled with the record's current values; primary reads **"Save
  changes"**. Same anatomy, same fields — only the seeded values, the title, and
  the verb differ.

## Rules

- **The required core is the sticky header + ≥1 `form-section`.** A valid
  create/edit form is, at minimum, the sticky `page-header` (title + ghost Cancel
  [leading X icon] + primary Create/Save) above a single `form-section` card of `Field`s. Banner,
  file-upload, extra section cards, and descriptions are optional add-ons (slot
  table above) — present them only when the page's job needs them, never as a
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

Composites: [`page-header`](../composites/page-header.md) (the title band) +
[`page-body`](../composites/page-body.md) (the guttered content region the form
card sits in).

Primitives: `Field`, `Label`, `Input`/`Textarea`/`Select`/`Checkbox`/`RadioGroup`,
`Button`, `Modal`/`Sheet`, `Card` (the form card and per-concern section cards),
`Dropzone` (the optional file-upload block).
`@cloud/ui` realizes these; an artifact composes from `primitives.css`.

> First-draft stub — expand with field-spacing and section specs as real forms land.
