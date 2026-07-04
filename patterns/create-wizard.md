# Pattern · Create wizard

"多步向导新增页（有阶段依赖/分支/复核）" — a multi-step create flow for records
that have stage dependencies, branching, or a review-before-commit step. Named
structure, not implementation.

> 📐 **Copyable example** · [`create-wizard.html`](./create-wizard.html) — the full
> wizard (sticky detail-header with a back button that exits the flow → step-indicator →
> current-step form-section cards beside an optional sticky summary rail → Back/Continue
> footer → done state as a commented swap), ready to copy and modify. It **links** the
> reference CSS so it never forks; inline the blocks to ship it as an artifact. All
> examples: [`index.html`](./index.html).

## Anatomy

```
┌ detail-header (sticky) ──────────────────────────────────────┐
│ [‹] title                                                     │  ← back = exit flow
├ steps ───────────────────────────────────────────────────────┤
│ [ ✓ Details ]──[ ② Terms ]──[ ③ Review ]        step-indicator │
├ body ─────────────────────────────────┬ summary (optional) ───┤
│ ┌ form-section: current step ───────┐ │  What you've entered   │
│ │ Field: label                      │ │  Name      Acme Robo…  │  ← sticky
│ │        [ input ]                   │ │  Plan      Enterprise  │     right rail
│ │ … one Card per concern …          │ │  Email     —           │     (dl, em-dash
│ └───────────────────────────────────┘ │  …                     │      for empty)
├ nav ──────────────────────────────────┴────────────────────────┤
│     [ ◂ Back ] [ Continue ▸ / Create ]                         │  ← right-aligned
└─────────────────────────────────────────────────────────────────┘

  done ┌ centered success card ───────────┐
       │            ( ✓ )                  │
       │      Customer created             │
       │  [ Go to customer ]               │  ← primary CTA
       └───────────────────────────────────┘
```

## Slots — required core vs. driven by the flow's job

A wizard is a **framework**, not a filled-in page (governance principle #9 —
[`../governance/principles.md`](../governance/principles.md)): it guarantees the
*structure and ordering* of the steps, never that every slot is present. The
**required core** is four slots — without them this stops being a wizard. The
summary rail and the done state are **optional**, included per business need.

| slot | required? | include when |
|---|---|---|
| **header** | **yes** | always — the sticky [`detail-header`](../composites/detail-header.md) in reduced form: a **back button** (chevron-left) + the page title, nothing else. The back **exits the whole flow** without committing (it replaces the old ghost Cancel). **No primary** lives here; the commit verb is in **nav**. |
| **steps** | **yes** | always — the `step-indicator` rail (done · here · left). Stretches **full-width** inside `page-body`. |
| **body** | **yes** | always (repeatable) — the current step's **form-section** card(s) (one `Card` per concern) of `Field`s. Full-width; a card may cap its own internal width but the layout column is not capped. |
| **nav** | **yes** | always — the footer: right-aligned **ghost Back** (hidden on step 1) **+ primary Continue**; the last step's primary is the contextual commit verb. |
| **summary rail** | no | a recap of entered values earns its place — a sticky right rail (`dl`). All-or-nothing across steps when present (see Rules). |
| **done** | no | the flow ends on a confirmation screen rather than redirecting — a centered success card + a primary CTA. |

## Rules

- **Linear by default.** Steps advance one at a time; the `step-indicator` shows
  position (completed → active → upcoming). Branching is allowed but the rail still
  reflects the path actually taken.
- **A `Review` step precedes commit** — the user sees everything before it's
  written. Commit happens from Review (or the last data step), never silently mid-flow.
- **Two backs, and they never collide.** The **header** back (icon-only, top-left,
  in the `detail-header`) **exits the whole wizard** without committing — it is the
  cancel affordance. The **footer** "Back" (labelled, in the nav) goes to the
  **previous step**. They are distinguished by position + form, and because the
  footer Back is **hidden on step 1** (next rule), step 1 shows only the header
  back — so the two are never both "a back" in the same place at the same time.
- **Never lose entered data on Back.** The footer Back is non-destructive — it
  returns to a prior step with its fields intact. It is **hidden on step 1** (not
  merely disabled — the slot is empty and the Continue button stays right-aligned
  alone), and visible from step 2 onward.
  - **Footer is right-aligned, not split.** Back + Continue ride the **same right
    edge** (`justify-content: flex-end`; Back is a ghost just left of Continue) —
    **never push Back to the far left** with `margin-inline-start/right: auto` or
    `justify-content: space-between`. Copy the example's `.wizard-footer`; don't
    hand-roll a left-Back / right-Next split.
- **The summary rail is all-or-nothing across steps** — show it on every step or
  none; it never blinks in and out. It's a `dl` of entered values; an unfilled value
  renders an **em-dash** (`—`), never a blank or a guess.
- **A step that collects a list of sub-entities (line items — contracts, members,
  addresses, …) has exactly ONE "Add" affordance at a time.** Shape of such a step:
  an `empty-state` → the collected items as an **editable / removable list or
  `data-table`** (each item carries its own Edit / Delete) → one way to add the
  next. Pick the add carrier by **field count** (reuse the create-form rule in
  [`detail-page.md`](./detail-page.md) → "Editing is launched…"): a small sub-entity
  (≤ ~8 fields, no branching) → an **inline add-form**; many fields / conditional
  sub-config → a `Modal` (or its own sub-step). **Never two "Add" buttons:** an
  inline add-form commits with a single primary **Add** that appends to the list —
  there is no separate "open" button; a deferred form is opened by **Add &lt;item&gt;**
  and commits *inside* with **Add / Save** — the opener is not also shown. Conditional
  fields (e.g. billing that appears only for one type) live **inside** the add-form,
  revealed by the type control. Adding an item is **not** "Continue" — the wizard's
  own Back/Continue still governs step navigation.
- **Footer**: right-aligned **ghost Back + primary Continue**. The primary advances
  ("Continue"); on the **last step** it becomes the contextual verb
  ("Create customer") and commits. One primary only.
- **Done state** = a centered success `card` (check mark + confirmation line) and a
  single primary CTA toward the new record ("Go to customer").
- **Use the full-page wizard when there are ≥3 steps or branching.** Two simple
  steps or fewer, no branching → a single-step form ([`create-form.md`](./create-form.md)),
  not this pattern.
- **All structural children of `page-body` are full-width.** The `page-body`
  composite provides gutters and vertical stack spacing; its direct children
  (step indicator, body columns, nav row) fill the full available width. Never
  add a centering wrapper (e.g. `max-width` + `margin-inline: auto`) to a
  layout-structural slot — that is the shell's job, not the pattern's.

## Building blocks

A wizard is **assembled from composites** (`../composites/`) plus a small page-local
rail; this pattern fixes which appear and how they sequence:

| Anatomy slot | Composite |
|---|---|
| shell (context, **not ported**) | [`app-frame`](../composites/app-frame.md) — the page renders inside `.app-frame__main` |
| header band (sticky, back = exit; no Cancel, no primary) | [`detail-header`](../composites/detail-header.md) (reduced form: back + title) |
| content region (gutters + stack) | [`page-body`](../composites/page-body.md) |
| steps rail | [`step-indicator`](../composites/step-indicator.md) — wrap the bare `ol` for the card look (`border` `line-default` · `surface-2` · `radius-xl` · `shadow-1` · `px-6 py-4`) |
| current-step body | [`field`](../primitives/field.md) units inside per-concern [`card`](../primitives/card.md) form-sections |
| nav (Back / Continue / Create) | [`button`](../primitives/button.md) — ghost Back, primary Continue/verb |
| summary rail (optional) | page-local `dl` (composition only, built from tokens — not a foundation component) inside a [`card`](../primitives/card.md). **KV labels in the summary rail must be UPPERCASE** (`text-transform: uppercase`, overline tracking, `content-tertiary`). Match the [`kv-grid`](../composites/kv-grid.md) label recipe exactly — never title-case. |
| done state | a centered [`card`](../primitives/card.md) + a primary [`button`](../primitives/button.md) |

Those composites lean on primitives (`Button`, `Input`, `Field`, `Card`, `Checkbox`,
`RadioGroup`). In `@cloud/ui` they are the `step-indicator` + form families; an
artifact composes the same anatomy from `composites.css` (on top of `primitives.css`
+ `release/tokens.inline.css`). Same parts, same names, both sides.

> First-draft stub — expand with per-step transition + summary-rail specs as real wizards land.
