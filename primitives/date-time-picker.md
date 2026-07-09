# Date Time Picker

A single date **+ time** field. Same input-styled trigger as `DatePicker`, but the
popover stacks a single-month calendar over a **time row** (a native time input + an
*OK* button), and the field renders `date HH:mm`.

> **Contract scope.** This file is the cross-consumer *design contract*: the
> trigger recipe, sizes, states, the calendar + time-row composition, a11y. It is
> the authority both implementations answer to. It deliberately does NOT document
> the React prop *types*, the date↔time merge plumbing, or the react-day-picker /
> base-ui specifics — those live with the Next implementation (`@cloud/ui` + the
> `ui` skill). When the contract and an implementation disagree, the contract is
> right and the implementation is a bug.

One of **four sibling pickers** sharing a trigger skin and popover-over-calendar
composition (see `date-picker.md`). The trigger (`.date-trigger`), the clear
button, and the time row (`.date-time-row`) are defined once and reused across the
family. A date-time **range** is not its own component: compose it from **two**
of these pickers — a *Start* field and an *End* field (see the demo) — rather than
one oversized dual-calendar popover.

## Anatomy

```
 ┌ .date-trigger ───────────────────────────────────┐
 │ 📅  Mar 14, 2026 09:30                      [✕]   │   ← date HH:mm · clear
 └───────────────────────────────────────────────────┘
        ▼  (.popover, p-0, w-auto, align="start")
 ┌ .popover ─────────────────────────────┐
 │  .calendar  (mode="single")           │
 │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ │   ← top hairline
 │  .date-time-row                       │
 │   [ 09:30 (time input) ]      [ OK ]  │
 └───────────────────────────────────────┘
```

- **`.date-trigger`** — identical to `DatePicker`'s (icon · value span · clear). The
  value reads `date HH:mm`: the date part is locale-formatted (`formatStr` applies to
  the date only), the time is **always 24-hour `HH:mm`**. Empty shows the placeholder
  (default *Pick a date and time*, i18n `ui.datePicker.placeholder.dateTime`).
- **`.calendar` (single)** — month grid (`calendar.md`). Picking a day keeps the
  current time-of-day from the time draft and merges it onto the chosen date.
- **`.date-time-row`** — a bottom row under a top hairline (`line-default`), holding
  a small native `<input type="time">` (`.input--sm`) on the left and a `.btn--sm`
  *OK* on the right that closes the popover. Editing the time updates the value's
  time-of-day live.

## Sizes

| size | trigger recipe | use |
|---|---|---|
| `sm` | `control-sm` (28px) · `px-cx-sm` · `text-xs` | dense forms |
| `md` *(default)* | `control-md` (36px) · `px-cx-md` · `text-md` | standard form field |
| `lg` | `control-lg` (44px) · `px-cx-lg` · `text-lg` (16px, source `text-base`) | spacious forms |

Sizes drive the trigger; the time input inside the popover is fixed `sm`.

## States

The **trigger** owns interactive states, mirroring `Input`/`Select`:

- **hover** — border `line-strong`.
- **focus-visible** — border `line-focus` + the `shadow-focus` ring (shared by every bordered control; `.date-trigger` carries it for all four date/time pickers).
- **disabled** — `cursor-not-allowed` + `opacity-50`; clear suppressed; the time
  input is disabled too.
- **invalid** (`aria-invalid`, via `invalid`) — border `error-strong` + 2px ring `error`/20.
- **open** — popover entrance owned by the React side; reference CSS = static open skin.

Time input and OK button carry their own `.input` / `.btn` states. Calendar cell
states: see `calendar.md`.

## Accessibility

- Trigger is a real focusable `<button>` with an `aria-label` (placeholder) and
  `aria-invalid`; base-ui wires open/close, focus return, Escape / outside-click.
- The time field is a native `<input type="time">` — full native keyboard time entry
  and locale-aware 12h/24h rendering come for free; *OK* is a real `<button>`.
- The clear `✕` is `tabIndex={-1}` with its own `aria-label` (*Clear*).
- A hidden `<input name>` (when `name` is set) emits the full ISO string
  (`value.toISOString()`) for form posts.
- Calendar grid semantics + roving focus are owned by react-day-picker (`calendar.md`).

## Implementations

- **Next / @cloud/ui** — `import { DateTimePicker } from "@cloud/ui"`. Composes
  `Popover` + `Calendar mode="single"` + an `Input type="time"` + `Button` *OK*;
  value type is `Date | null` (each value carries its own time-of-day). Props mirror
  `DatePicker` (note: no `disabledDays` — only `minDate`/`maxDate`). The popover,
  the month grid, and the date↔time merge are **behavior owned by the React
  implementation** — the reference CSS expresses the static trigger + open-panel skin
  only. API details: the `ui` skill.
- **Artifact (self-contained HTML)** — `.date-trigger` (+ size/`--invalid`) for the
  closed control; a `.popover` containing the calendar skin and a `.date-time-row`
  with an `<input type="time" class="input input--sm">` and a `.btn--sm` *OK*. On top
  of the inlined `release/tokens.inline.css`.
