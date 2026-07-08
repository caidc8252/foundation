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

## 5. Color and weight anchor the hierarchy — take the anchoring the law already licenses
A finished screen has a visible **first read**: the eye lands somewhere — the primary
action, the status that matters, an entity's identity mark, the current step — because
those carry visual weight while supporting detail stays quiet. A screen where every
element is equally pale — every tile neutral-grey, every badge the same faint neutral,
no single primary — reads as *timid / unfinished* even when every piece is legal: there
is nothing to land on. The fix is **never decorative color** (principle 10 forbids it);
it is spending the anchoring color the law *already permits* instead of leaving it on
the table.

- HOLD: a legible visual hierarchy — the meaning-bearing elements are anchored and the
  eye has a first landing point.
- VARY: which elements lead and how far. The set of *licensed* anchors is fixed by
  principle 10 (status/severity tones; the categorical `cat-N` palette for identity /
  data-viz; the one primary action of 9b; the committed/selected state of principle 16)
  — spend within it, never a decorative wash and never a semantic tone borrowed onto a
  plain category/type field.
- Anchoring signals, concretely:
  - **Entity marks wear their color — and keep it across screens.** A company / app /
    product / device identity mark is a square `object-tile` in its `auto` (content-
    hashed `cat-N`) tone — a recognizable colored block — not a flat `--neutral` grey.
    The *same* entity carries the *same* colored tile on its list row and on its detail
    header (continuity, rule 2); a mark that is colored in the list and grey on the
    detail reads as two different things.
  - **A lifecycle shows its state at a glance.** Where a record has a status /
    fulfillment progression, the current state is visually distinct (a filled current
    step, a toned status pill) — not a uniform grey run.
  - **One primary moment leads.** The single primary action (9b) carries real weight;
    ghost / secondary actions recede. A row of equal-weight buttons has no primary read.
- The failure mode is **"clean but flat."** Squint at the screen: if nothing pops as the
  thing to look at first, the anchor is missing — add weight to the element that already
  carries meaning, never decoration to one that doesn't.

## 6. Reads as delivered, not scaffolded — the synthesis gate
Before you ship, read each screen and answer: *would I show this to a
stakeholder as a finished screen?* If a screen reads as empty, thin, or
placeholder, it fails — recompose it (rules 1–5) before shipping. This is a
generation-time self-check, not a pass/fail tool; optionally an agent performs it
against real renders (opt-in `Visual review: on` — see
[`enforcement.md`](enforcement.md)).
