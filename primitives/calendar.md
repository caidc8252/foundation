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

- **root** — a `w-fit` **bare** surface: `p-3` (12px) padding + type only, **no** border / shadow / background. The host paints the chrome — a `.popover` inside the pickers, a bordered wrapper (or `.popover`) for a standalone view — so the calendar never doubles it.
- **header** — a flex row, `justify-between`: prev nav button · centered month/year caption · next nav button.
- **month_caption** — `text-md` (14px) medium (500) `content-primary` label, centered between the nav buttons. In the `dropdown` caption layout (`react-day-picker` `captionLayout="dropdown"`) it becomes `.calendar__dropdowns` — two `.calendar__dropdown` **borderless** ghost triggers (month + year `<select>`, each with a trailing chevron-down, subtle `surface-hover` on hover) so a viewer can jump straight to any month/year. Prev/next still step one month and keep the dropdowns in sync.
- **grid** — a **single** CSS grid, `repeat(7, --cell-size)` columns. Day columns sit **edge-to-edge** (no column gap) so selection / range fills join into a continuous track; weeks breathe on an **8px** `row-gap`. Holds the seven weekday header cells *and* all 42 day cells together (not per-week flex rows).
- **weekday** — day-of-week abbreviation; tiny (`text-xs` 12px), **normal weight** (400), `content-tertiary`.
- **day** — `--cell-size` (32px) tall ghost button, `--cell-radius` (6px) corners, `text-xs` (12px) `tabular-nums` so columns stay aligned.
- **footer** *(optional)* — a flex row split between a *Clear* and a *Today* link button (`primary-700` text), divided from the grid by a 1px `line-default` top border.

Two layout customs the grid is built on: `--cell-size: var(--space-8)` (32px) sizes each cell, and `--cell-radius: var(--radius-md)` (10px) gives day buttons and the range caps a **rounded-square** shape — not circular. Day columns are gapless (fills join); weeks sit on an **8px** `row-gap`.

## Sizes

No size variants — the grid is fixed at `--cell-size` 32px squares. Density is the cell, not a size prop.

## States (day cell)

The day button is a `ghost`/`icon` button; selection state is driven by `data-*` attributes the React side sets per day, not by a variant prop.

| state | token recipe |
|---|---|
| default / hover | ghost button — transparent until hover `surface-hover`; text `content-primary` |
| **today** | **subtle filled** (source `bg-accent`) — bg `surface-3` · text `content-primary` · radius `--cell-radius`, normal weight. When also selected (or part of a range), the filled `primary-700`/range state overrides it. |
| **selected** (single) | bg `primary-700` · text `content-on-primary` · radius `--cell-radius` |
| **range_start / range_end** | a filled `primary-700` **pill** (rounded `--cell-radius`, text `content-on-primary`) sitting ON the muted track — the endpoint cell also carries the `surface-3` track so it joins the middle continuously (react-day-picker's two-layer cell=track / button=pill look). |
| **range_middle** | the muted `surface-3` track (source `bg-accent`), text `content-primary`; gapless columns join it into one bar per week, square between days and rounded only at the range ends **and at each week-row's left/right edge** (a stadium per row). |
| **outside** (other month, shown when `showOutsideDays`) | text `content-tertiary` (`muted-foreground`) · `opacity-50` |
| **disabled** | text `content-tertiary` · `opacity-50` · not selectable |
| **hidden** | `visibility:hidden` (holds grid alignment) |
| **focused** | a 3px `shadow-focus` ring around the cell (source `ring-[3px]`); it lifts above neighbors (`z`) so the ring isn't clipped |

Nav buttons: `--cell-size` (32px) **ghost** icon buttons — no border/fill until hover, `radius-md`, a `text-lg` (16px) chevron in `content-secondary`, hover `surface-hover`, `aria-disabled` → `opacity-50` (e.g. at a min/max month bound). The chevrons flip 180° under RTL.

## Accessibility

- Grid semantics, month navigation, day selection, range building, type-of-caption (label vs. dropdown), and arrow-key roving focus are all owned by `react-day-picker` — the static skin only expresses the visual shell.
- The focused day receives real keyboard focus (the React `DayButton` calls `.focus()` when its `focused` modifier is set); the focus ring (`line-focus`) is the visible signal and is never removed.
- Weekday abbreviations, the month caption, and selection state are exposed by the underlying grid's roles/aria — not re-implemented here.
- Disabled and outside days are non-interactive; `hidden` days stay in the DOM (invisible) to keep the 7-column rhythm.

## Implementations

- **Next / @cloud/ui** — `import { Calendar } from "@cloud/ui"`. Wraps `react-day-picker`'s `DayPicker`; props pass through (`mode`, `selected`, `month`, `disabled`, `captionLayout`, `showOutsideDays`, `locale`, `buttonVariant` — default `ghost`). Day cells render via `CalendarDayButton` (a `Button variant="ghost" size="icon"`); nav uses `buttonVariants`. **Behavior — month/range/dropdown/roving-focus/RTL — is owned by `react-day-picker`; the reference CSS expresses the static skin only** (surface, cell grid, weekday/caption type, the selected/range/today/outside/disabled/focused day fills). Locale-aware date formatting comes from `_date-shared` (`useDateFormat`, `combineDisabledDays`) in the picker composites, not the bare Calendar. API details: the `ui` skill.
- **Artifact (self-contained HTML)** — use `.calendar` › `.calendar__header` (`.calendar__nav-btn` × 2 flanking `.calendar__caption`) + `.calendar__grid` (seven `.calendar__weekday` then 42 `.calendar__day`, all direct grid children) + optional `.calendar__footer` (`.calendar__link` × 2), on top of the inlined `release/tokens.inline.css`. Mark day state with `.calendar__day--today` / `--selected` / `--range-start` / `--range-end` / `--range-middle` / `--outside` / `--disabled` / `--focused` (the skin can't observe live selection/focus). Same `--cell-size`/`--cell-radius` (rounded-square, 10px) customs; `today` is a subtle `surface-3` fill, `selected` the `primary-700` fill, and `--range-middle` the `surface-3` track. The root is bare (no border/shadow/background) — drop it inside a host `.popover`, or wrap a standalone view in a `.popover` (or bordered box) so it reads as a card.
