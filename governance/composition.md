# Composition law — the finished-feel doctrine

The rules that decide whether a generated artifact reads as a **delivered
product** or as an unfinished skeleton. `principles.md` governs what is *legal*
(tokens, the closed set); this governs whether the legal pieces are *composed
into something that reads finished*. It holds for both consumers — the Next.js
app and self-contained artifacts — but bites hardest on the loose screens
(create-form, detail); the list pattern already earns finished-feel structurally
(a table fills with rows; the count says "N of N").

> **This governs qualities, not shapes.** It is the extension of principle 9
> ("patterns are frameworks; a populated example is not a checklist") from
> *structure* to *composition quality*. It never dictates a layout: each rule
> states what the result must READ AS (HOLD) and leaves the form free (VARY).
> That two finished artifacts of different domains and different layouts can
> both satisfy every rule below is the proof it does not over-constrain.

## 1. Completeness over emptiness
A screen reads as a finished deliverable: no large empty void below the content,
no lone sparse element stretched edge-to-edge. When the content is genuinely
sparse, **compose** it to read complete rather than letting it float in
whitespace.

- HOLD: the screen fills its frame and reads complete.
- VARY: how — a right rail carrying status / summary / actions, supporting
  sub-sections (a sub-table, a related list), grouping, a narrower content
  column, a contextual banner. Pick what fits the screen.
- Completeness signal: the list reads complete because the count says "N of N".
  Give every screen an equivalent "this is all of it" cue.

## 2. One world across screens
A multi-screen artifact shares **one** mock dataset and **one** identity.
Entities are continuous: the row you click is the record you land on; the same
shell / header / breadcrumb treatment carries across.

- HOLD: cross-screen continuity + a consistent identity.
- VARY: each screen's own form and content.

## 3. Believable, dense content
Mock data at realistic **volume** and specificity, carrying the meta / badges /
counts / timestamps / codes that signal a live system. Never "Lorem", never
"Item 1 / Item 2", never a one-row table standing in for a real list.

- HOLD: realism + volume.
- VARY: the domain and the actual values.

## 4. Proportion serves the content
Each region is sized to **what it holds**: a column is wide enough that its
*primary* content — the name, label, or value the user scans — fits at rest
without truncating, and no region is starved so narrow it clips while a sibling
carries slack. In a split layout (master/detail, list + rail), the column
holding the thing the user scans is never the cramped one.

- HOLD: every region fits its primary content at rest; no column starves while a
  neighbour has slack; in a split, the primary-scan column reads comfortably.
- VARY: the widths and the ratio — a wide master, a narrow rail, a 50/50 split.
  There is **no fixed ratio**; it follows the content. Prefer `minmax()` /
  `clamp()` bounds over a hard fixed width so it flexes sanely.
- Proportion signal: a *secondary* line clamped to one line on purpose (the full
  value lives on the detail side) is fine; a *primary identifier* truncating at
  rest (a name cut to `Platform Adm…`) is **starvation** — widen the column or
  lighten the row. Squint at a 64px thumbnail: if one column reads as a starved
  strip, recompose before shipping.

## 5. Reads as delivered, not scaffolded — the synthesis gate
Before you ship, read each screen and answer: *would I show this to a
stakeholder as a finished screen?* If a screen reads as empty, thin, or
placeholder, it fails — recompose it (rules 1–4) before shipping. This is a
generation-time self-check, not a pass/fail tool; optionally an agent performs it
against real renders (opt-in `Visual review: on` — see
[`enforcement.md`](enforcement.md)).
