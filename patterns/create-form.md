# Pattern · Create / edit form

"Capture or change a record." The single-step form — one card of fields, one
commit. Named structure, not implementation.

> 📐 **Copyable example** · [`create-form.html`](./create-form.html) — the single-step
> card form (Field units, grouped into labelled section cards when long, with a
> cancel/submit footer), ready to copy and modify. It **links** the reference CSS so
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
`form-section` card** are the required core. Everything else — a status banner, a
file-upload block, extra section cards, per-section or page descriptions — is
**optional**, included only when the page's job calls for it (see the slot table).

The multi-step wizard (≥3 steps, stage dependencies, or branching) is now its own
pattern → [`create-wizard.md`](./create-wizard.md).

### Slots — what's required core vs. driven by the page's job

A pattern is a **framework**: it fixes structure + ordering, not that every slot is
filled (governance [principle #9](../governance/principles.md) — *patterns are
frameworks*). The required core below is the few slots without which this stops
being a create/edit form; everything else is included per business need. The
fully-dressed [`create-form.html`](./create-form.html) shows every slot at once —
copying it does **not** mean keeping them all; the optional ones are marked
removable there.

| slot | required? | include when |
|---|---|---|
| sticky `page-header` (title) | **yes** | always — names the record being created/edited |
| header actions: ghost Cancel + primary Create/Save | **yes** | always — the conventional fill of the sticky header's actions slot (the primary verb follows the variant) |
| ≥1 `form-section` card (header + `Field`s) | **yes** | always — at least one card of fields is the form |
| header `description` | no | the title alone doesn't make the page's purpose obvious |
| status `banner` (alert under the header) | no | a record-level status/notice must be surfaced before the fields |
| file-upload block (dropzone, in the body) | no | the form captures a file/attachment — *see Known gaps* |
| additional `form-section` cards | no | the form is long enough to split into per-concern cards (Identity, Billing, …) |
| per-section `description` | no | a section's purpose isn't obvious from its header |
| secondary header action (beyond Cancel) | no | a genuine page-level secondary verb exists — Cancel is not "secondary" in this sense |

## Variants

The variant drives the primary verb in the (required) header actions slot:

- **`create`** — empty form; primary reads **"Create X"** ("Create customer").
- **`edit`** — prefilled with the record's current values; primary reads **"Save
  changes"**. Same anatomy, same fields — only the seeded values, the title, and
  the verb differ.

## Rules

- **The required core is the sticky header + ≥1 `form-section`.** A valid
  create/edit form is, at minimum, the sticky `page-header` (title + ghost Cancel +
  primary Create/Save) above a single `form-section` card of `Field`s. Banner,
  file-upload, extra section cards, and descriptions are optional add-ons (slot
  table above) — present them only when the page's job needs them, never as a
  default checklist.
- **One `Field` unit** = label + control + help/error, vertically stacked. Errors
  attach to the field, in the interface's voice ("Enter a valid email"), not a
  global banner — and explain how to fix.
- **Submit says what it does** — "Create customer", "Save changes" — not "Submit";
  the button keeps its verb through the resulting toast ("Customer created").
- **Group long forms into labelled section cards by concern** — one `Card` per
  concern (Identity, Billing, Notifications, …), each with its own header, rather
  than one flat list of fields. A short form (≤ ~8 fields) stays the single
  required card; the *additional* section cards are the optional slot, added only
  when the form is long enough to warrant splitting.
- **Validation** is Zod-backed on the Next side; the form mirrors the same rules.
  Disable submit only while pending, not to express invalid (show field errors).
- Modal for short forms (≤ ~8 fields, no branching); full page otherwise. ≥3 steps
  or branching → the wizard pattern, not this one.

## Known gaps

- **File upload** is a recognized form block (an upstream blueprint
  `file-upload-block`), but foundation has **no `Dropzone` primitive yet** — do not
  hand-roll dropzone classes. When it lands it becomes a composite and this pattern
  gains an "upload region" block. Until then, record it here as the gap it is.

## Building blocks

Primitives: `Field`, `Label`, `Input`/`Textarea`/`Select`/`Checkbox`/`RadioGroup`,
`Button`, `Modal`/`Sheet`, `Card` (the form card and per-concern section cards).
`@cloud/ui` realizes these; an artifact composes from `primitives.css`.

> First-draft stub — expand with field-spacing and section specs as real forms land.
