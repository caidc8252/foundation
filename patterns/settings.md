# Pattern · Settings

"Configure this workspace." A read-write preferences surface: related controls
grouped into **setting cards**, reached through a left **section nav**, each group
committing its own changes. A pattern is a named structure, not an
implementation; both consumers assemble it from composites + primitives and this
file fixes the anatomy, the setting-row unit, and the load-bearing decisions.

> 📐 **Copyable example** · [`settings.html`](./settings.html) — a sticky header, a
> left anchor-nav rail beside a stack of setting-group cards (General · Fleet
> defaults · Notifications · Security), plus a Danger zone. It **links** the
> reference CSS so it never forks; inline the blocks to ship as an artifact. All
> examples: [`index.html`](./index.html).

## Anatomy (top → bottom)

The diagram shows a **fully-dressed** instance. Only the header and one setting
group are the required core (`■`); the rest are optional (`○`, trailing `?`) and
render only when this settings screen's job calls for them.

```
┌ ■ page-header (full-bleed, sticky) ──────────────────────────┐
│ Settings                                                     │
│ [description?]                                               │
╞ page-body (gutters) ═════════════════════════════════════════╡
│ ┌ ○ section nav? ─┐ ┌ ■ content column (stack of groups) ──┐ │
│ │ • General       │ │ ┌ ■ setting-group card ─────────────┐ │ │
│ │   Fleet defaults│ │ │ Group title · description         │ │ │
│ │   Notifications │ │ │ ┌ setting row ──────────────────┐ │ │ │
│ │   Security      │ │ │ │ label + desc    [ control ]   │ │ │ │
│ │   Danger zone   │ │ │ ├ setting row ──────────────────┤ │ │ │
│ └─(sticky rail)───┘ │ │ │ label + desc    [ switch ]    │ │ │ │
│                     │ │ └───────────────────────────────┘ │ │ │
│                     │ │ [ footer: Save ]                  │ │ │
│                     │ └───────────────────────────────────┘ │ │
│                     │ ┌ ○ more group cards? ──────────────┐ │ │
│                     │ └───────────────────────────────────┘ │ │
│                     │ ┌ ○ Danger zone? (destructive) ─────┐ │ │
│                     │ └───────────────────────────────────┘ │ │
│                     └───────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
   ■ required core   ○ optional — included per business need
```

## Required core / optional slots

A settings screen is a **framework**, not a filled-in preference list (governance
principle [#9](../governance/principles.md)). The split below is authoritative.
The **header** and **one setting-group card** are the minimal core — a header over
a single group of setting rows is already a complete, correct settings page.

| slot | required? | include when |
|---|---|---|
| `page-header` (title, e.g. "Settings"; sticky) | **yes** | always — names the surface |
| ≥1 **setting-group card** (header + setting rows + Save footer) | **yes** | always — a group of related controls is the page |
| **section nav** (left anchor rail) | no | there are ~3+ groups worth jumping between; a single-group page drops it |
| header `description` | no | the title alone doesn't make the scope obvious |
| additional group cards | no | settings span more than one concern (General, Notifications, Security…) |
| per-group `description` | no | a group's purpose isn't obvious from its title |
| **Danger zone** (destructive group) | no | the screen exposes an irreversible/destructive action (deactivate, delete, reset) |
| status `banner` (alert under the header) | no | an account-level state must gate the whole screen (read-only, billing past due) |

## The setting row

The atomic unit of this pattern — **not** the create-form `Field`. A setting row is
a single line: the **label + one-line description on the left**, the **control on
the right** (right-aligned), a hairline between rows.

```
┌ setting row ─────────────────────────────────────────────┐
│ Auto-update firmware                       [ ●───  on ]   │
│ Push the latest signed build to devices overnight        │
└───────────────────────────────────────────────────────────┘
```

- **Left** — the setting's name (`content-primary`) over a one-line description
  (`text-md` / `content-tertiary`). The description is optional.
- **Right** — exactly one control: a `switch` (binary preference), `select`
  (choose one), `input` (a value), `radio-group` (small mutually-exclusive set),
  or a `button` (opens a sub-flow, "Manage keys"). Right-aligned so controls form
  a clean column.
- On narrow widths the control **wraps below** the text (never truncate it).

This differs from the create-form `Field` (label *above* a full-width control, for
data entry). Use the setting row for **preferences you scan and flip**; use a
create-form `Field` when the screen is really a record-entry form.

## Rules

- **The required core is the header + ≥1 setting-group card.** Group related
  controls into cards by concern (General, Fleet defaults, Notifications,
  Security), each with its own header — never one flat list of controls.
- **Each group saves independently.** The Save button lives in that card's
  `card__footer`, **bottom-right** (the primary action is rightmost — the same
  action rule as the [`page-header`](../composites/page-header.md) /
  [`detail-header`](../composites/detail-header.md) bands), enabled only when the
  group is dirty; committing one group doesn't touch the others. (A short
  single-group screen may instead put one Save in the sticky header — but
  multi-group settings save per section.)
- **The section nav is an anchor rail**, not tabs — it scroll-jumps to a group and
  highlights the one in view; every group stays on one scroll. It is a sticky,
  fixed-width left rail that collapses (hides) below a medium width, leaving the
  content column full-width. Compose it page-local on tokens.
- **Right-align controls into a column.** Setting rows read as a table of
  name → control; keep the control's right edge aligned. Switches for immediate
  binary prefs, selects/inputs for values.
- **Size each control to its content, not one blanket width.** An email / name
  input needs room (it must never clip its value); a numeric count is a few
  characters and sits in a small field with its unit hugging it ("5 missed") — a
  count in a full-width box reads as a mistake. Right-alignment gives the column;
  per-purpose widths keep it from looking arbitrary.
- **Destructive settings live in a Danger zone**, last — a normal card whose
  actions are `btn--danger` / `btn--ghost-danger`. Semantic danger stays on the
  button and (at most) the card border, **never a card background wash**
  (principle #10).
- **The content column fills the width the shell allows** (principle #6); only the
  nav rail is fixed-narrow. Don't wrap the groups in a `max-width` centering
  wrapper.
- **Data-readable values are mono + tabular** where they appear (IDs, thresholds,
  intervals) — principle #11.

## Building blocks

Composites: [`page-header`](../composites/page-header.md) (title band) +
[`page-body`](../composites/page-body.md) (guttered stack the groups sit in) ·
optionally [`toggles`](../composites/toggles.md) (an inline label+control wrapper
inside a setting row).

Primitives: `Card` (each group is a card), `Switch` (binary prefs), `Select` /
`Input` / `RadioGroup` (values), `Label`, `Field` (when a control still needs a
stacked label), `Separator` (between rows if not drawn by the row itself),
`Button` (per-group Save, Danger-zone actions), `Badge` (inline status on a row).
`@cloud/ui` realizes these; an artifact composes from `primitives.css`.
