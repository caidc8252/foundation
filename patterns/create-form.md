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

The multi-step wizard (≥3 steps, stage dependencies, or branching) is now its own
pattern → [`create-wizard.md`](./create-wizard.md).

## Variants

- **`create`** — empty form; primary reads **"Create X"** ("Create customer").
- **`edit`** — prefilled with the record's current values; primary reads **"Save
  changes"**. Same anatomy, same fields — only the seeded values, the title, and
  the verb differ.

## Rules

- **One `Field` unit** = label + control + help/error, vertically stacked. Errors
  attach to the field, in the interface's voice ("Enter a valid email"), not a
  global banner — and explain how to fix.
- **Submit says what it does** — "Create customer", "Save changes" — not "Submit";
  the button keeps its verb through the resulting toast ("Customer created").
- **Group long forms into labelled section cards by concern** — one `Card` per
  concern (Identity, Billing, Notifications, …), each with its own header, rather
  than one flat list of fields. A short form (≤ ~8 fields) stays a single card.
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
