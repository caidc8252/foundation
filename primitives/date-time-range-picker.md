# Date Time Range Picker

A from→to range where **each end carries its own time-of-day**. Same input-styled
trigger as the family; the popover combines a presets rail + two-month range
calendar with a **two-row time block** (start time, end time) and an *OK* button.

> **Contract scope.** This file is the cross-consumer *design contract*: the
> trigger recipe, sizes, states, the presets + range-calendar + dual-time-row
> composition, a11y. It is the authority both implementations answer to. It
> deliberately does NOT document the React prop *types*, the two-click + per-end
> time plumbing, or the react-day-picker / base-ui specifics — those live with the
> Next implementation (`@cloud/ui` + the `ui` skill). When the contract and an
> implementation disagree, the contract is right and the implementation is a bug.

One of **five sibling pickers** (see `date-picker.md`). It is the union of
`date-range-picker` (presets rail + two-month range calendar) and `date-time-picker`
(per-end time inputs + *OK*) — it reuses `.date-trigger`, `.date-presets`, and the
time-row pieces (`.date-time-row` / `.date-time-row__label`). Unlike
`DateRangePicker`, it does **not** auto-close on range completion: the user adjusts
the two times, then confirms with *OK*.

## Anatomy

```
 ┌ .date-trigger ─────────────────────────────────────────────────────┐
 │ 📅  Mar 1, 2026 00:00 – Mar 14, 2026 23:59                   [✕]    │
 └─────────────────────────────────────────────────────────────────────┘
        ▼  (.popover, p-0, w-auto, align="start")
 ┌ .popover ──────────────────────────────────────────────┐
 │ .date-presets │  .calendar (mode="range", 2 months)     │
 │  Today …      │   [ month grid ] [ month grid ]          │
 │ ─ ─ ─ ─ ─ ─ ─ ┴ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │   ← top hairline
 │ .date-time-row  Start  [ 00:00 ]                         │
 │ .date-time-row  End    [ 23:59 ]                         │
 │                                                  [ OK ]  │
 └──────────────────────────────────────────────────────────┘
```

- **`.date-trigger`** — family trigger (icon · value span · clear). The value reads
  `from – to`, each end formatted with the **dateTime** default (date + 24-hour
  `HH:mm`). Empty shows the placeholder (default *Pick a date and time range* — see
  Notes: i18n `ui.datePicker.placeholder.dateTimeRange`).
- **`.date-presets`** — same left rail as `DateRangePicker` (defaults *Today* …
  *Last month*); omitted when `presets` is empty.
- **`.calendar` (range, two months)** — `numberOfMonths={2}`; range fills owned by
  `calendar.md`. Completing the range stamps the current start/end time drafts onto
  the two endpoints but keeps the popover open.
- **Time block** — under a top hairline, two `.date-time-row`s each with a fixed
  `w-9` (36px) `.date-time-row__label` (*Start* / *End*) + a `.input--sm`
  `<input type="time">`, then a right-aligned `.btn--sm` *OK* that closes the popover.
  The time inputs are disabled until a range exists. Default end time seeds to `23:59`.

## Sizes

| size | trigger recipe | use |
|---|---|---|
| `sm` | `control-sm` (28px) · `px-cx-sm` · `text-xs` | dense filters |
| `md` *(default)* | `control-md` (36px) · `px-cx-md` · `text-sm` | standard form field |
| `lg` | `control-lg` (44px) · `px-cx-lg` · `text-lg` (16px, source `text-base`) | spacious forms |

Sizes drive the trigger; presets rail, two-month grid, and time inputs are fixed.

## States

The **trigger** owns interactive states, mirroring `Input`/`Select`:

- **hover** — border `line-strong`.
- **focus-visible** — border `line-focus` + 2px ring `line-focus`/30.
- **disabled** — `cursor-not-allowed` + `opacity-50`; clear suppressed; time inputs disabled.
- **invalid** (`aria-invalid`, via `invalid`) — border `error-strong` + 2px ring `error`/20.
- **open** — popover entrance owned by the React side; reference CSS = static open skin.

Time inputs are additionally disabled while no range is selected (state owned by the
React side). Preset rows hover `surface-hover` + `content-primary`. Range cell
states: see `calendar.md`.

## Accessibility

- Trigger is a real focusable `<button>` with an `aria-label` (placeholder) and
  `aria-invalid`; base-ui wires open/close, focus return, Escape / outside-click.
- Each time field is a native `<input type="time">`; *Start*/*End* labels precede
  them; *OK* is a real `<button>`. Preset buttons are real `<button>`s.
- The clear `✕` is `tabIndex={-1}` with its own `aria-label` (*Clear*).
- Range grid semantics + roving focus owned by react-day-picker (`calendar.md`).

## Notes

- **Missing i18n keys.** The source reads `ui.datePicker.placeholder.dateTimeRange`,
  `ui.datePicker.rangeStart`, and `ui.datePicker.rangeEnd`, but those keys are absent
  from `packages/ui/messages/{en,zh-CN,ja}.json` (only `date`/`range`/`dateTime`
  placeholders + `clear`/`ok` exist). Until the messages are backfilled the
  placeholder and the Start/End labels fall back to the raw key string. Flagged for
  the message catalog, not a CSS/contract concern.

## Implementations

- **Next / @cloud/ui** — `import { DateTimeRangePicker } from "@cloud/ui"` (reuses
  `DateRange` / `DateRangePreset` / `DEFAULT_RANGE_PRESETS` from `date-range-picker`).
  Composes `Popover` + presets `<ul>` + `Calendar mode="range" numberOfMonths={2}` +
  two `Input type="time"` rows + `Button` *OK*; value type is `DateRange` with each
  end carrying its own time. Props mirror `DateRangePicker`. The popover, the month
  grid, the two-click range logic, and the per-end time merge are **behavior owned by
  the React implementation** — the reference CSS expresses the static trigger +
  open-panel skin only. API details: the `ui` skill.
- **Artifact (self-contained HTML)** — `.date-trigger` (+ size/`--invalid`); a
  `.popover` with `.date-presets`, the range calendar skin, then a stacked group of
  `.date-time-row`s (each `.date-time-row__label` + `<input type="time" class="input
  input--sm">`) and a `.btn--sm` *OK*. On top of the inlined `dist/tokens.inline.css`.
