# Pattern · Create / edit form

"Capture or change a record." Covers the single-step form and the multi-step
wizard variant. Named structure, not implementation.

## Anatomy — single step (modal or page)

```
┌ header ──────────────────────────────────────────────────┐
│ title                                              [ ✕ ]   │
├ body ────────────────────────────────────────────────────┤
│ Field: label                                              │
│        [ input ]                                          │
│        help / error                                       │
│ … grouped into labelled sections when long …             │
├ footer ──────────────────────────────────────────────────┤
│                                  [ cancel ] [ submit ]    │
└──────────────────────────────────────────────────────────┘
```

## Anatomy — wizard (≥3 steps or branching)

```
[ ① Details ]─[ ② Terms ]─[ ③ Review ]      step-indicator
   ─────────────── current step body ───────────────
[ back ]                              [ cancel ] [ next ▸ ]
```

## Rules

- **One `Field` unit** = label + control + help/error, vertically stacked. Errors
  attach to the field, in the interface's voice ("Enter a valid email"), not a
  global banner — and explain how to fix.
- **Submit says what it does** — "Create customer", "Save changes" — not "Submit";
  the button keeps its verb through the resulting toast ("Customer created").
- **Validation** is Zod-backed on the Next side; the form mirrors the same rules.
  Disable submit only while pending, not to express invalid (show field errors).
- **Wizard**: linear by default, `step-indicator` shows position; Review step
  before commit; never lose entered data on Back.
- Modal for short forms (≤ ~8 fields, no branching); full page/wizard otherwise.

## Building blocks

Primitives: `Field`, `Label`, `Input`/`Textarea`/`Select`/`Checkbox`/`RadioGroup`,
`Button`, `Modal`/`Sheet`, `Stepper`/`StepIndicator`. `@cloud/ui` realizes these;
an artifact composes from `primitives.css`.

> First-draft stub — expand with field-spacing and section specs as real forms land.
