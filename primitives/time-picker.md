# Time Picker

A time-only field built on the native `<input type="time">`. The odd sibling of the
date-picker family: it has **no popover and no calendar** — the browser's own time
control does the entry. A leading clock icon and trailing clear button match the
family's chrome.

> **Contract scope.** This file is the cross-consumer *design contract*: the field
> recipe (it is an `Input` with affix slots), sizes, states, a11y. It is the
> authority both implementations answer to. It deliberately does NOT document the
> React prop *types* or the `Input`/base-ui specifics — those live with the Next
> implementation (`@cloud/ui` + the `ui` skill). When the contract and an
> implementation disagree, the contract is right and the implementation is a bug.

One of **five sibling pickers** (see `date-picker.md`), but the only one that is
**not** a popover-over-calendar: it is a thin wrapper over the `Input` primitive's
prefix/suffix slots. It therefore defines no new block — it reuses `.input` (with the
input-group affix shape) plus the shared `.date-trigger__clear` from the family.

## Anatomy

```
 ┌ .input  (type="time") ─────────────────────────────┐
 │ 🕐   09 : 30                                  [✕]   │   ← clock prefix · native time · clear suffix
 └─────────────────────────────────────────────────────┘
```

- **prefix** — a leading `ClockIcon` (16px) in the `Input`'s prefix slot.
- **native time field** — `<input type="time">`, `tabular-nums`; the browser renders
  12h/24h per the user's locale and supplies hour/minute (and optional second)
  spinners. The native calendar-picker indicator is **hidden** so only the leading
  clock icon shows.
- **suffix** — a clear `✕` (`.date-trigger__clear`) shown when a value is set and the
  field is neither `required` nor `disabled`.
- Value is a 24-hour `"HH:mm"` string (`"HH:mm:ss"` when `withSeconds`). Empty shows
  the placeholder (default *Pick a time* — see Notes: i18n
  `ui.datePicker.placeholder.time`).

## Sizes

| size | recipe | use |
|---|---|---|
| `sm` | `control-sm` (28px) · `px-cx-sm` · `text-xs` (`Input` `inputSize="sm"`) | dense forms |
| `md` *(default)* | `control-md` (36px) · `px-cx-md` · `text-sm` | standard form field |
| `lg` | `control-lg` (44px) · `px-cx-lg` · `text-lg` (16px, source `text-base`) | spacious forms |

Sizes map straight to the `Input` size scale.

## States

All states are the `Input` primitive's — a time picker is just a typed `Input`:

- **hover / focus-visible** — border `line-focus` + ring on focus, per `input.md`.
- **disabled** — `cursor-not-allowed` + `opacity-50`; clear suppressed.
- **invalid** (`aria-invalid`) — border `error-strong` + 2px ring `error`/20.

Native `min` / `max` / `step` bound and quantize the entry (e.g. `withSeconds`
implies `step=1`); these are browser behaviors, not skin.

## Accessibility

- The control is a native `<input type="time">` — native keyboard time entry,
  spinbutton semantics, and locale-aware presentation come for free; it carries an
  `aria-label` (the placeholder) for an accessible name.
- The clear `✕` is `tabIndex={-1}` with its own `aria-label` (*Clear*) — a pointer
  affordance, not a tab stop; clearing is also reachable by selecting the field's text
  and deleting.
- A `name`/`required`/`id` flow straight to the native input for form posts.

## Notes

- **Missing i18n key.** The source reads `ui.datePicker.placeholder.time`, but that
  key is absent from the message catalog (only `date`/`range`/
  `dateTime` placeholders exist). Until backfilled the placeholder falls back to the
  raw key string. Flagged for the message catalog, not a CSS/contract concern.
- **No new block.** Because this primitive is an `Input` with affix slots, the
  reference CSS adds no `.time-picker` block — author it with `.input` (size modifier)
  plus the family's `.date-trigger__clear` in the suffix slot. The native
  calendar-picker indicator is hidden via the source's
  `::-webkit-calendar-picker-indicator { display:none }` (a UA pseudo-element, not a
  token surface).

## Implementations

- **Next / @cloud/ui** — `import { TimePicker } from "@cloud/ui"`. A wrapper over
  `Input type="time"` with `prefix` (clock) / `suffix` (clear) slots; value is a
  `string | null` (`"HH:mm"` / `"HH:mm:ss"`). Props `value`/`defaultValue`/
  `onValueChange`, `size`, `disabled`, `withSeconds`, `step`, `min`, `max`,
  `placeholder`, `name`/`required`/`id`. The native time UI (spinners, locale
  rendering) is **behavior owned by the browser**; there is no base-ui overlay here.
  API details: the `ui` skill.
- **Artifact (self-contained HTML)** — an `<input type="time" class="input">` (add a
  size modifier), with a leading clock glyph and a trailing `.date-trigger__clear`;
  for the affix layout reuse the input-group shape (`.input-group` +
  `.input-group__addon`). On top of the inlined `release/tokens.inline.css`.
