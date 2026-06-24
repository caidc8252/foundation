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
┌ calendar (popover surface) ─────────────────────┐
│ [‹]            June 2026             [›]   ← header
│                                                  │
│  Su  Mo  Tu  We  Th  Fr  Sa     ← weekday row    │
│  31   1   2   3   4   5   6   ┐                   │
│   7   8   9  10  11  12  13   │ one 7-col grid    │
│   …                          ┘ (uniform 2px gap)  │
│ ────────────────────────────────                 │
│ Clear                      Today   ← footer (opt) │
└──────────────────────────────────────────────────┘
```

- **root** — a `w-fit` popover surface (`surface-2` / `line-default` / `radius-xl` 12px / `shadow-3` / `p-3` 12px). Inside a host popover-content slot it drops its own border / shadow / background so the host surface shows through.
- **header** — a flex row, `justify-between`: prev nav button · centered month/year caption · next nav button.
- **month_caption** — `text-md` (14px) semibold (600) `content-primary` label, centered between the nav buttons. (In `dropdown` caption layouts it becomes month/year `<select>`s — `react-day-picker` behavior.)
- **grid** — a **single** CSS grid, `repeat(7, --cell-size)` columns on a uniform **2px** gap, holding the seven weekday header cells *and* all 42 day cells together (not per-week flex rows).
- **weekday** — day-of-week abbreviation; tiny (`text-2xs` 11px), semibold (600), letter-spaced, `content-tertiary`.
- **day** — `--cell-size` (32px) tall ghost button, `--cell-radius` (6px) corners, `text-xs` (12px) `tabular-nums` so columns stay aligned.
- **footer** *(optional)* — a flex row split between a *Clear* and a *Today* link button (`primary-700` text), divided from the grid by a 1px `line-default` top border.

Two layout customs the grid is built on: `--cell-size: var(--space-8)` (32px) sizes each cell, and `--cell-radius: var(--radius-md)` (6px) gives day buttons and the range caps a **rounded-square** shape — not circular. Cells sit on a uniform **2px** grid gap.

## Sizes

No size variants — the grid is fixed at `--cell-size` 32px squares. Density is the cell, not a size prop.

## States (day cell)

The day button is a `ghost`/`icon` button; selection state is driven by `data-*` attributes the React side sets per day, not by a variant prop.

| state | token recipe |
|---|---|
| default / hover | ghost button — transparent until hover `surface-hover`; text `content-primary` |
| **today** | **outlined** — a 1px `line-strong` **outline** + **bold** (700) text, no fill. When also selected (or part of a range), the outline and bold drop so the filled `primary-700`/range state reads. |
| **selected** (single) | bg `primary-700` · text `content-on-primary` · radius `--cell-radius` |
| **range_start / range_end** | bg `primary-700` · text `content-on-primary`; the cap is rounded on its outer side, square on the inner. A 2px `box-shadow` bridges the grid gap toward the middle so the track stays continuous. |
| **range_middle** | bg `surface-3` (`muted`) · text `content-primary` · square corners; `box-shadow` bridges both side gaps |
| **outside** (other month, shown when `showOutsideDays`) | text `content-tertiary` (`muted-foreground`) · `opacity-50` |
| **disabled** | text `content-tertiary` · `opacity-50` · not selectable |
| **hidden** | `visibility:hidden` (holds grid alignment) |
| **focused** | a 2px `line-focus`/50 **box-shadow ring** around the cell; it lifts above neighbors (`z`) so the ring isn't clipped |

Nav buttons: 26px **bordered** icon buttons — 1px `line-default` border, `radius-md`, `surface-2` bg, a `text-lg` (16px) chevron in `content-secondary`, hover `surface-hover`, `aria-disabled` → `opacity-50` (e.g. at a min/max month bound). The chevrons flip 180° under RTL.

## Accessibility

- Grid semantics, month navigation, day selection, range building, type-of-caption (label vs. dropdown), and arrow-key roving focus are all owned by `react-day-picker` — the static skin only expresses the visual shell.
- The focused day receives real keyboard focus (the React `DayButton` calls `.focus()` when its `focused` modifier is set); the focus ring (`line-focus`) is the visible signal and is never removed.
- Weekday abbreviations, the month caption, and selection state are exposed by the underlying grid's roles/aria — not re-implemented here.
- Disabled and outside days are non-interactive; `hidden` days stay in the DOM (invisible) to keep the 7-column rhythm.

## Implementations

- **Next / @cloud/ui** — `import { Calendar } from "@cloud/ui"`. Wraps `react-day-picker`'s `DayPicker`; props pass through (`mode`, `selected`, `month`, `disabled`, `captionLayout`, `showOutsideDays`, `locale`, `buttonVariant` — default `ghost`). Day cells render via `CalendarDayButton` (a `Button variant="ghost" size="icon"`); nav uses `buttonVariants`. **Behavior — month/range/dropdown/roving-focus/RTL — is owned by `react-day-picker`; the reference CSS expresses the static skin only** (surface, cell grid, weekday/caption type, the selected/range/today/outside/disabled/focused day fills). Locale-aware date formatting comes from `_date-shared` (`useDateFormat`, `combineDisabledDays`) in the picker composites, not the bare Calendar. API details: the `ui` skill.
- **Artifact (self-contained HTML)** — use `.calendar` › `.calendar__header` (`.calendar__nav-btn` × 2 flanking `.calendar__caption`) + `.calendar__grid` (seven `.calendar__weekday` then 42 `.calendar__day`, all direct grid children) + optional `.calendar__footer` (`.calendar__link` × 2), on top of the inlined `dist/tokens.inline.css`. Mark day state with `.calendar__day--today` / `--selected` / `--range-start` / `--range-end` / `--range-middle` / `--outside` / `--disabled` / `--focused` (the skin can't observe live selection/focus). Same `--cell-size`/`--cell-radius` (rounded-square, 6px) customs; `today` is an outlined+bold cell, `selected` the `primary-700` fill, and `--range-middle` the `surface-3` track. Inside a host `.popover`, set `border:0;border-radius:0;box-shadow:none` on `.calendar` so it doesn't double the host chrome.
