# Step Indicator · composite

Horizontal progress rail for a multi-step flow (wizard): a row of numbered dots
joined by connectors, each with a caption + title, showing what's done, where you
are, and what's left. Display-only by default; opt-in click-to-jump-back.

> **Contract scope.** This file is the cross-consumer *design contract*: the
> per-state token recipe, anatomy, the navigation rule, a11y. React prop *types*
> (`steps` / `current` / `onStepClick` / `maxNavigableStep`) live with `@cloud/ui`
> + the `ui` skill. When the contract and an implementation disagree, the contract
> is right and the implementation is the bug. Not to be confused with `Stepper`
> (the numeric +/- spinbutton) — different component, similar name.

## States

There is no `variant` prop — a step's appearance is derived from its index vs.
`current`: `index < current` → completed, `index === current` → active, else
upcoming. State drives the **dot**, the **title** tone, and the **connector**
trailing each step.

| state | dot recipe | title recipe | connector (to the right) |
|---|---|---|---|
| `completed` | border `success`/25 · bg `success-bg` · text `success-strong` · glyph = check (or the step's own `icon`) | `text-sm`/500 · `content-secondary` | `success`/50 hairline |
| `active` *(current)* | border `primary-700` · bg `primary-700` · text `content-on-primary` · 600 · `shadow-cta` | `text-sm`/600 · `content-primary` | `line-default` hairline |
| `upcoming` | border `line-default` · bg `surface-3` · text `content-tertiary` · 500 | `text-sm`/500 · `content-secondary` | `line-default` hairline |
| `error` | border `error`/25 · bg `error-bg` · text `error-strong` · glyph = alert (or the step's own `icon`) | `text-sm`/600 · `error-strong` | `error`/50 hairline |

The connector belongs to the step it trails and is omitted after the last step.
A connector reads "done" (`success`/50) only when its **own** step index is `<
current`; the connector out of the active step is still `line-default`.

## Sizes

Single size. Dot is a fixed 32px (`space-8`) circle; the in-dot glyph (check or
the step's `icon`) defaults to 14px (`size-3.5`) and inherits the per-state text
color via `currentColor`. No size modifier.

## Anatomy

```
┌ step-indicator (ol, horizontal) ───────────────────────────────────────┐
│  ┌ item ─────────────┐            ┌ item ─────────────┐                 │
│  │ (●)  STEP 1        │━━━━━━━━━━━━│ (2)  STEP 2        │━━━━━ … (last:   │
│  │ dot  Company       │ connector  │ dot  Contracts     │      no track) │
│  └───────────────────┘            └───────────────────┘                 │
└─────────────────────────────────────────────────────────────────────────┘
  dot = circle w/ number | step icon | check(once completed)
  text column = caption (optional, uppercase) over title
```

- **Body** (`step__body`) — the clickable/static block that groups dot + text. When
  navigation is enabled the consumer renders it as a `<button>` with
  `step__body--clickable`; otherwise it is a plain `<div>`. It is a sibling of
  the connector, not its parent.
- **Dot** carries the ordinal (`index + 1`), or the step's own `icon`, or — once
  completed — a check. An `icon` **wins in every state**: it persists through
  completed (shown in success green, not replaced by the check), so keep the
  ordinal legible via `caption`.
- **Text column** stacks an optional `caption` (small, uppercase, `text-xs`/500,
  `tracking-wide`, `content-tertiary`) over the `title` (`leading-tight`).
- **Connector** is a 1px flex-grow track filling the gap to the next step; absent
  after the last step (last item is `flex-none`, the rest are `flex-1` so the rail
  spreads to fill its width). It is a sibling of `__body` inside `<li>`, not
  nested within it.
- The component renders **bare** (just the dot row + connectors) so it composes
  anywhere; wrap it yourself for the card look (`border` `line-default` · bg
  `surface-2` · `radius-xl` · `shadow-1` · `px-6 py-4`).

## Accessibility

- Renders as an ordered list (`<ol>` › `<li>` per step) — the steps are inherently
  sequential. `data-state` mirrors completed/active/upcoming.
- The active step's `<li>` carries `aria-current="step"`.
- Connectors are decorative (`aria-hidden`).
- When navigation is enabled, each reachable step is a real `<button type="button">`
  (never a clickable `<div>`) with `focus-visible` `shadow-focus`; non-reachable
  steps render as a plain `<div>` and are not focusable.

## Navigation rule

Display-only by default — advancing is driven by the surrounding wizard's
Back / Continue buttons; the indicator just reflects `current`. Pass `onStepClick`
to make visited steps clickable jump-back targets. `maxNavigableStep` (0-based,
defaults to `current`) caps how far clicks reach — typically the furthest step the
user has already visited. Steps at `index <= maxNavigable` become buttons; the rest
stay inert. Without `onStepClick` nothing is navigable.

## Status pipeline usage

`step-indicator` is also the sanctioned vehicle for an **order or record "status
pipeline"** — a read-only horizontal rail that shows where a record sits in a fixed
lifecycle (e.g. Pending payment → Pending shipment → Shipped → Delivered).

Use the same completed / active / upcoming states:

- **completed** — stages already passed (green dot + connector).
- **active** — the record's current stage (primary dot).
- **upcoming** — stages not yet reached (muted dot).

**When to use as a status pipeline vs. a wizard rail:**

| use-case | signal |
|---|---|
| **Wizard rail** | user-driven, multi-step *creation* or *configuration* flow; user advances by filling forms and clicking Continue. |
| **Status pipeline** | system-driven lifecycle; the record moves through stages automatically (payment, fulfilment, delivery). User reads, not drives. |

For a status pipeline, omit `onStepClick` / navigation — it is purely display. Wrap
the bare `<ol class="step-indicator">` in a card for surface (border `line-default` ·
bg `surface-2` · `radius-xl` · `shadow-1` · `px-6 py-4`), same as the wizard rail.
Use captions to show stage dates or IDs where available.

## Implementations

- **Next / @cloud/ui** — `import { StepIndicator } from "@cloud/ui"`. Props
  `steps` (`{ label, caption?, icon? }[]`), `current`, optional `onStepClick` /
  `maxNavigableStep`. State derivation, the icon-vs-check glyph swap, and which
  steps are buttons are owned by the React implementation. Also exports
  `stepDotVariants` for the dot recipe. API details: the `ui` skill.
- **Artifact (self-contained HTML)** — `.step-indicator` (an `<ol>`) › `.step` per
  item, modified by `.step--completed` / `.step--active` / `.step--upcoming` /
  `.step--error` (a step that failed validation). Each
  `<li>` holds a `.step__body` (a `<div>`, or `<button>` with `step__body--clickable`
  when navigable), which contains `.step__dot` (number / icon / check) and
  `.step__text` (`.step__caption` + `.step__title`); plus a sibling
  `.step__connector` (trailing 1px track — omit on the last step). The skin paints
  all three static states by class; **which** state a step is in, and the
  click-to-jump behavior, are computed by the consumer. In `composites.css`.
