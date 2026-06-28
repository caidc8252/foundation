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

## 4. Reads as delivered, not scaffolded — the synthesis gate
Before you ship, read each screen and answer: *would I show this to a
stakeholder as a finished screen?* If a screen reads as empty, thin, or
placeholder, it fails — recompose it (rules 1–3) before shipping. This is a
generation-time self-check, not a tool.
