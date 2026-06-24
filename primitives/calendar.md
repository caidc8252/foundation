# Calendar

The base month grid — a weekday header over a 6×7 day matrix with month navigation. The static surface every date picker (DatePicker, range, date-time) builds its popup on; on its own it's a bare month view, not a field.

> **Contract scope.** This file is the cross-consumer *design contract*: the
> anatomy, the token recipe, day/cell states, a11y. It is the authority both
> implementations answer to. It deliberately does NOT document the React prop
> *types* or `react-day-picker` specifics — those live with the Next
> implementation (`@cloud/ui` + the `ui` skill). When the contract and an
> implementation disagree, the contract is right and the implementation is a bug.

## Anatomy

```
┌ calendar ──────────────────────────────────────┐
│ [‹]            June 2026             [›]        │  ← nav + month_caption
│                                                  │
│  Su  Mo  Tu  We  Th  Fr  Sa                      │  ← weekdays
│  ──  ──  ──  ──  ──  ──  ──                      │
│   1   2   3   4   5   6   7                      │  ← week (7 day cells)
│   8   9  10  11  12  13  14                      │
│  …                                               │
└──────────────────────────────────────────────────┘
```

- **root** — a `w-fit` surface card (`surface-2` / `line-default` / `radius-xl` / `p-3.5`). Inside a card-content or popover-content slot the source drops its own background to transparent (the host surface shows through).
- **nav** — absolutely positioned across the top; a previous + next icon button at each end.
- **month_caption** — centered month/year label, one cell-row tall. Either a plain label (`captionLayout="label"`, default) or month/year **dropdowns** (`dropdown` layouts) — the dropdown trigger is a transparent native `<select>` overlaying the visible label.
- **weekdays / weekday** — a flex row of seven equal-width day-of-week abbreviations.
- **week / day** — each week is a flex row of seven `--cell-size` (32px) square cells; each cell holds one day button.

Two layout customs the grid is built on: `--cell-size: 2rem` (32px = `--space-8`) sizes every square, and `--cell-radius: var(--radius-full)` rounds day buttons and the range caps.

## Sizes

No size variants — the grid is fixed at `--cell-size` 32px squares. Density is the cell, not a size prop.

## States (day cell)

The day button is a `ghost`/`icon` button; selection state is driven by `data-*` attributes the React side sets per day, not by a variant prop.

| state | token recipe |
|---|---|
| default / hover | ghost button — transparent until hover `surface-hover`; text `content-primary` |
| **today** | bg `surface-hover` · text `content-primary` (a resting fill, no border). When also selected, the rounding flattens so the range/selected fill reads. |
| **selected** (single) | bg `primary-700` · text `content-on-primary` · radius `--cell-radius` |
| **range_start / range_end** | bg `primary-700` · text `content-on-primary`; the cap is rounded on its outer side, square on the inner (the `bg-muted` track bleeds toward the middle) |
| **range_middle** | bg `surface-3` (`muted`) · text `content-primary` · square corners |
| **outside** (other month, shown when `showOutsideDays`) | text `content-tertiary` (`muted-foreground`) |
| **disabled** | text `content-tertiary` · `opacity-50` · not selectable |
| **hidden** | `visibility:hidden` (holds grid alignment) |
| **focused** | ring around the focused cell — border `line-focus` + a 2px `line-focus`/50 ring; the cell lifts above neighbors (`z`) so the ring isn't clipped |

Nav buttons: 24px (`size-6`) ghost icon buttons, `radius-md`, text `content-secondary`, hover `surface-hover`, `aria-disabled` → `opacity-50` (e.g. at a min/max month bound). The chevrons flip 180° under RTL.

## Accessibility

- Grid semantics, month navigation, day selection, range building, type-of-caption (label vs. dropdown), and arrow-key roving focus are all owned by `react-day-picker` — the static skin only expresses the visual shell.
- The focused day receives real keyboard focus (the React `DayButton` calls `.focus()` when its `focused` modifier is set); the focus ring (`line-focus`) is the visible signal and is never removed.
- Weekday abbreviations, the month caption, and selection state are exposed by the underlying grid's roles/aria — not re-implemented here.
- Disabled and outside days are non-interactive; `hidden` days stay in the DOM (invisible) to keep the 7-column rhythm.

## Implementations

- **Next / @cloud/ui** — `import { Calendar } from "@cloud/ui"`. Wraps `react-day-picker`'s `DayPicker`; props pass through (`mode`, `selected`, `month`, `disabled`, `captionLayout`, `showOutsideDays`, `locale`, `buttonVariant` — default `ghost`). Day cells render via `CalendarDayButton` (a `Button variant="ghost" size="icon"`); nav uses `buttonVariants`. **Behavior — month/range/dropdown/roving-focus/RTL — is owned by `react-day-picker`; the reference CSS expresses the static skin only** (surface, cell grid, weekday/caption type, the selected/range/today/outside/disabled/focused day fills). Locale-aware date formatting comes from `_date-shared` (`useDateFormat`, `combineDisabledDays`) in the picker composites, not the bare Calendar. API details: the `ui` skill.
- **Artifact (self-contained HTML)** — use `.calendar` › `.calendar__nav` (`.calendar__nav-btn`) + `.calendar__caption` + `.calendar__weekdays` (`.calendar__weekday`) + `.calendar__week` (`.calendar__day`), on top of the inlined `dist/tokens.inline.css`. Mark day state with `.calendar__day--today` / `--selected` / `--range-start` / `--range-end` / `--range-middle` / `--outside` / `--disabled` / `--focused` (the skin can't observe live selection/focus). Same `--cell-size`/`--cell-radius` customs, same `primary-700` selected fill and `surface-3` range track.
