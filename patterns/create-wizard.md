# Pattern · Create wizard

"多步向导新增页（有阶段依赖/分支/复核）" — a multi-step create flow for records
that have stage dependencies, branching, or a review-before-commit step. Named
structure, not implementation.

> 📐 **Copyable example** · [`create-wizard.html`](./create-wizard.html) — the full
> wizard (header with ghost Cancel → step-indicator → current-step form-section cards
> beside an optional sticky summary rail → Back/Continue footer → done state as a
> commented swap), ready to copy and modify. It **links** the reference CSS so it never
> forks; inline the blocks to ship it as an artifact. All examples: [`index.html`](./index.html).

## Anatomy

```
┌ header ──────────────────────────────────────────────────────┐
│ title                                              [ Cancel ]  │  ← ghost
├ steps ───────────────────────────────────────────────────────┤
│ [ ✓ Details ]──[ ② Terms ]──[ ③ Review ]        step-indicator │
├ body ─────────────────────────────────┬ summary (optional) ───┤
│ ┌ form-section: current step ───────┐ │  What you've entered   │
│ │ Field: label                      │ │  Name      Acme Robo…  │  ← sticky
│ │        [ input ]                   │ │  Plan      Enterprise  │     right rail
│ │ … one Card per concern …          │ │  Email     —           │     (dl, em-dash
│ └───────────────────────────────────┘ │  …                     │      for empty)
├ nav ──────────────────────────────────┴────────────────────────┤
│ [ ◂ Back ]                              [ Continue ▸ / Create ]  │  ← right-aligned
└─────────────────────────────────────────────────────────────────┘

  done ┌ centered success card ───────────┐
       │            ( ✓ )                  │
       │      Customer created             │
       │  [ Go to customer ]               │  ← primary CTA
       └───────────────────────────────────┘
```

## Slots

| slot | what it holds |
|---|---|
| **header** | the page title + a single **ghost** Cancel (exit without committing). |
| **steps** | the `step-indicator` rail — what's done, where you are, what's left. |
| **body** | the current step's content: one or more **form-section** cards (one `Card` per concern) of `Field`s. |
| **nav** | the footer: right-aligned **ghost Back + primary Continue**; the last step's primary is the contextual verb. |
| **summary** | *(optional)* a sticky right rail recapping entered values as a `dl`. |
| **done** | the post-commit completion state: a centered success card + a primary CTA. |

## Rules

- **Linear by default.** Steps advance one at a time; the `step-indicator` shows
  position (completed → active → upcoming). Branching is allowed but the rail still
  reflects the path actually taken.
- **A `Review` step precedes commit** — the user sees everything before it's
  written. Commit happens from Review (or the last data step), never silently mid-flow.
- **Never lose entered data on Back.** Back is non-destructive — it returns to a
  prior step with its fields intact. Back is always present (disabled, not hidden,
  on step 1).
- **The summary rail is all-or-nothing across steps** — show it on every step or
  none; it never blinks in and out. It's a `dl` of entered values; an unfilled value
  renders an **em-dash** (`—`), never a blank or a guess.
- **Footer**: right-aligned **ghost Back + primary Continue**. The primary advances
  ("Continue"); on the **last step** it becomes the contextual verb
  ("Create customer") and commits. One primary only.
- **Done state** = a centered success `card` (check mark + confirmation line) and a
  single primary CTA toward the new record ("Go to customer").
- **Use the full-page wizard when there are ≥3 steps or branching.** Two simple
  steps or fewer, no branching → a single-step form ([`create-form.md`](./create-form.md)),
  not this pattern.

## Building blocks

A wizard is **assembled from composites** (`../composites/`) plus a small page-local
rail; this pattern fixes which appear and how they sequence:

| Anatomy slot | Composite |
|---|---|
| shell (context, **not ported**) | [`app-frame`](../composites/app-frame.md) — the page renders inside `.app-frame__main` |
| header band (ghost Cancel) | [`page-header`](../composites/page-header.md) |
| steps rail | [`step-indicator`](../composites/step-indicator.md) — wrap the bare `ol` for the card look (`border` `line-default` · `surface-2` · `radius-xl` · `shadow-1` · `px-6 py-4`) |
| current-step body | [`field`](../primitives/field.md) units inside per-concern [`card`](../primitives/card.md) form-sections |
| nav (Back / Continue / Create) | [`button`](../primitives/button.md) — ghost Back, primary Continue/verb |
| summary rail (optional) | page-local `dl` (composition only, built from tokens — not a foundation component) inside a [`card`](../primitives/card.md) |
| done state | a centered [`card`](../primitives/card.md) + a primary [`button`](../primitives/button.md) |

Those composites lean on primitives (`Button`, `Input`, `Field`, `Card`, `Checkbox`,
`RadioGroup`). In `@cloud/ui` they are the `step-indicator` + form families; an
artifact composes the same anatomy from `composites.css` (on top of `primitives.css`
+ `dist/tokens.inline.css`). Same parts, same names, both sides.

> First-draft stub — expand with per-step transition + summary-rail specs as real wizards land.
