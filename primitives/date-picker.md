# Date Picker

A single-date field. An input-styled trigger that opens a popover holding a
month-view calendar; the chosen day fills the field as locale-formatted text.

> **Contract scope.** This file is the cross-consumer *design contract*: the
> trigger recipe, sizes, states, the popover/calendar composition, a11y. It is
> the authority both implementations answer to. It deliberately does NOT document
> the React prop *types*, the controlled/uncontrolled value plumbing, or the
> react-day-picker / base-ui specifics — those live with the Next implementation
> (`@cloud/ui` + the `ui` skill). When the contract and an implementation
> disagree, the contract is right and the implementation is a bug.

This is one of **five sibling pickers** that share a single trigger skin and the
same popover-over-calendar composition: `date-picker` (this file),
`date-range-picker`, `date-time-picker`, `date-time-range-picker`, `time-picker`.
Read the sibling each names; the trigger recipe (`.date-trigger`) and the
clear-button are defined once and reused.

## Anatomy

```
 ┌ .date-trigger ───────────────────────────────────┐
 │ 📅  Mar 14, 2026                            [✕]   │   ← icon · value/placeholder · clear
 └───────────────────────────────────────────────────┘
        ▼  (opens .popover, align="start")
 ┌ .popover (p-0, w-auto) ───────────────┐
 │  .calendar  (mode="single")           │   ← calendar skin owns the month grid
 └───────────────────────────────────────┘
```

- **`.date-trigger`** — the closed control. `inline-flex`, `gap-2`, leading
  `CalendarIcon` (16px, `content-tertiary`), a truncating value span (left-aligned),
  and — when a value is set and the field is neither `required` nor `disabled` — a
  trailing clear `✕` (`.date-trigger__clear`). The trigger is the only chrome the
  artifact draws on the layout; the popover is portalled.
- **Value vs. placeholder** — the value span carries `content-primary`; when empty
  it shows the placeholder in `content-tertiary` (default *Pick a date*, i18n
  `ui.datePicker.placeholder.date`).
- **`.calendar`** — the month grid lives in `calendar.md` (react-day-picker). The
  popover wraps it flush (`p-0`, `w-auto`); picking a day sets the value and closes.

## Sizes

| size | trigger recipe | use |
|---|---|---|
| `sm` | `control-sm` (28px) · `px-cx-sm` · `text-xs` | dense filter bars, table toolbars |
| `md` *(default)* | `control-md` (36px) · `px-cx-md` · `text-sm` | standard form field |
| `lg` | `control-lg` (44px) · `px-cx-lg` · `text-lg` (16px, source `text-base`) | prominent / spacious forms |

Sizes drive the trigger only; the calendar grid keeps its own fixed cell size.
When a clear `✕` is shown, the trigger gains right padding (`pr-7`) so the value
text never collides with it.

## States

The **trigger** owns all interactive states; it mirrors `Input`/`Select` exactly
so a picker reads as just another field:

- **hover** — border `line-strong`.
- **focus-visible** — border `line-focus` + 2px ring `line-focus`/30.
- **disabled** — `cursor-not-allowed` + `opacity-50`; the clear button is suppressed.
- **invalid** (`aria-invalid`, via the `invalid` prop) — border `error-strong` +
  2px ring `error`/20. Same recipe as `Input`/`Select`'s error state.
- **open** — the popover entrance (fade + zoom + directional slide) is owned by the
  React implementation; the reference CSS paints the static open panel only.

The **calendar** rows (today / selected / range / disabled / outside-month) carry
their own states — see `calendar.md`.

## Accessibility

- The trigger is a real focusable `<button>` (base-ui `PopoverTrigger`); keyboard
  opens the panel, focus returns to it on close, Escape and outside-click dismiss —
  all wired by base-ui.
- The trigger carries an `aria-label` (the effective placeholder) so it has an
  accessible name even before a value is picked; `aria-invalid` reflects the error
  state.
- The clear `✕` is `tabIndex={-1}` and has its own `aria-label` (*Clear*); it is a
  pointer affordance, not a tab stop — clearing is also reachable by re-opening and
  changing the date.
- Calendar grid semantics, day-button roving focus, and `aria-selected` are owned by
  react-day-picker (see `calendar.md`).
- A hidden `<input name>` (when `name` is set) emits `yyyy-MM-dd` for form posts; it
  is not a visible control.

## Implementations

- **Next / @cloud/ui** — `import { DatePicker } from "@cloud/ui"`. Composes
  `Popover` + `PopoverTrigger` + `PopoverContent` with `Calendar mode="single"`;
  value type is `Date | null`. Props `value`/`defaultValue`/`onValueChange`,
  `size`, `disabled`, `invalid`, `minDate`/`maxDate`/`disabledDays`, `formatStr`,
  `placeholder`, `name`/`required`/`id`. The popover open/close, portalling,
  positioning, and the month grid are **behavior owned by the React implementation**
  (base-ui + react-day-picker) — the reference CSS expresses the static trigger +
  open-panel skin only. Locale-aware formatting via `date-fns`. API details: the
  `ui` skill.
- **Artifact (self-contained HTML)** — use `.date-trigger` (+ `.date-trigger--sm`/
  `--lg`, `.date-trigger--invalid`) for the closed control, with
  `.date-trigger__icon`, a value/placeholder `<span>`, and `.date-trigger__clear`;
  drop the calendar into a `.popover` (the calendar skin owns the grid). On top of
  the inlined `dist/tokens.inline.css`. Same trigger recipe as `Input`/`Select`.
