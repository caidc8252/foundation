# Date Range Picker

A from→to date range field. Same input-styled trigger as `DatePicker`, but the
popover pairs a **presets rail** with a **two-month** range calendar, and the field
renders `from – to`.

> **Contract scope.** This file is the cross-consumer *design contract*: the
> trigger recipe, sizes, states, the presets-rail + range-calendar composition,
> a11y. It is the authority both implementations answer to. It deliberately does
> NOT document the React prop *types*, the two-click range plumbing, or the
> react-day-picker / base-ui specifics — those live with the Next implementation
> (`@cloud/ui` + the `ui` skill). When the contract and an implementation disagree,
> the contract is right and the implementation is a bug.

One of **five sibling pickers** that share a single trigger skin and the popover-
over-calendar composition (see `date-picker.md` for the family). The trigger
(`.date-trigger`), the clear button, and the presets rail (`.date-presets`) are
defined once and reused — `date-time-range-picker` reuses both.

## Anatomy

```
 ┌ .date-trigger ──────────────────────────────────────────┐
 │ 📅  Mar 1, 2026 – Mar 14, 2026                     [✕]   │   ← from – to · clear
 └──────────────────────────────────────────────────────────┘
        ▼  (.popover, p-0, w-auto, flex row, align="start")
 ┌ .popover ──────────────────────────────────────────────┐
 │ .date-presets │  .calendar (mode="range", 2 months)     │
 │  Today        │                                          │
 │  Last 7 days  │   [ month grid ] [ month grid ]          │
 │  Last 30 days │                                          │
 │  This month   │                                          │
 │  Last month   │                                          │
 └───────────────┴──────────────────────────────────────────┘
```

- **`.date-trigger`** — identical to `DatePicker`'s (icon · value span · clear). The
  value reads `from – to` (en-dash separator), each end locale-formatted; empty shows
  the placeholder (default *Pick a range*, i18n `ui.datePicker.placeholder.range`).
- **`.date-presets`** — a fixed-width (`w-32`, 128px) left rail of quick-range
  buttons inside the popover, separated from the calendar by a right hairline. Each
  `.date-presets__item` is a full-width, left-aligned `text-sm` `content-secondary`
  row that hovers to `surface-hover` + `content-primary`. Defaults: *Today*,
  *Last 7 days*, *Last 30 days*, *This month*, *Last month*
  (i18n `ui.datePicker.presets.*`). The rail is omitted when `presets` is empty.
- **`.calendar` (range, two months)** — `numberOfMonths={2}`; the range start/end/
  middle fills are owned by `calendar.md`. Completing a range commits the value and
  closes the popover.

## Sizes

| size | trigger recipe | use |
|---|---|---|
| `sm` | `control-sm` (28px) · `px-cx-sm` · `text-xs` | dense filter bars |
| `md` *(default)* | `control-md` (36px) · `px-cx-md` · `text-sm` | standard form field |
| `lg` | `control-lg` (44px) · `px-cx-lg` · `text-lg` (16px, source `text-base`) | spacious forms |

Sizes drive the trigger; the presets rail and two-month grid keep fixed sizing.

## States

The **trigger** owns interactive states, mirroring `Input`/`Select`:

- **hover** — border `line-strong`.
- **focus-visible** — border `line-focus` + 2px ring `line-focus`/30.
- **disabled** — `cursor-not-allowed` + `opacity-50`; clear suppressed.
- **invalid** (`aria-invalid`, via `invalid`) — border `error-strong` + 2px ring `error`/20.
- **open** — popover entrance owned by the React side; reference CSS = static open skin.

Preset rows: hover `surface-hover` + `content-primary`. Range cell states (start/
middle/end/today/disabled/outside): see `calendar.md`. Mid-selection (a `from`
chosen but not yet a `to`) is internal draft state, never emitted — a behavior owned
by the React implementation.

## Accessibility

- Trigger is a real focusable `<button>` with an `aria-label` (the placeholder) and
  `aria-invalid`; base-ui wires open/close, focus return, Escape / outside-click.
- Preset buttons are real `<button>`s with visible text labels — keyboard-reachable
  inside the open panel.
- The clear `✕` is `tabIndex={-1}` with its own `aria-label` (*Clear*).
- Range grid semantics + roving focus are owned by react-day-picker (`calendar.md`).

## Implementations

- **Next / @cloud/ui** — `import { DateRangePicker } from "@cloud/ui"` (also exports
  `DEFAULT_RANGE_PRESETS`, type `DateRange = { from: Date; to: Date }`, type
  `DateRangePreset`). Composes `Popover` + the presets `<ul>` + `Calendar
  mode="range" numberOfMonths={2}`; `onValueChange` fires only once both ends are
  picked (partial selection held internally). Props mirror `DatePicker` plus
  `presets`. Popover/positioning + the month grid + the two-click range logic are
  **behavior owned by the React implementation** — the reference CSS expresses the
  static trigger + open-panel skin only. API details: the `ui` skill.
- **Artifact (self-contained HTML)** — `.date-trigger` (+ size/`--invalid`) for the
  closed control; a `.popover` containing `.date-presets` › `.date-presets__item`
  rows and the calendar skin (`numberOfMonths={2}` layout). On top of the inlined
  `release/tokens.inline.css`.
