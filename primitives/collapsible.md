# Collapsible

A single show/hide disclosure: one trigger reveals or hides one panel of
content. Use for a lone expandable section — "show more", an inline detail
panel, a filter drawer body. For a stack of grouped disclosure sections that
divide and frame themselves, use **Accordion** instead.

> **Contract scope.** This file is the cross-consumer *design contract*: the
> anatomy, the (minimal) token recipe, states, a11y. It is the authority both
> implementations answer to. It deliberately does NOT document the React prop
> *types* or base-ui specifics (controlled `open`, `keepMounted` /
> `hiddenUntilFound`, the panel height/width animation) — those live with the
> Next implementation (`@cloud/ui` + the `ui` skill). When the contract and an
> implementation disagree, the contract is right and the implementation is a bug.

## Variants

**No visual variant — this is a headless behavior primitive.** The `@cloud/ui`
wrapper adds zero chrome: it forwards `className` to the base-ui Root / Trigger /
Panel and nothing else. The source is explicit — *"callers own all visual
styling."* So there is no authored surface, border, fill, or padding to mirror;
the contract governs only the disclosure *mechanic* and its structural slots.
The reference skin below is therefore deliberately bare: it makes the panel
show/hide and rotates an optional chevron, and stays out of the way so a
consumer can drop a `.btn`-styled trigger or any content inside.

## States

- **open / closed** — base-ui sets `data-panel-open` on the **trigger** and
  `data-open` / `data-closed` on the **panel**. Open shows the panel; closed
  hides it. There is no authored fill change on the trigger — disclosure is
  signalled by the revealed panel and (if present) the rotating chevron.
- **animating** (`data-starting-style` / `data-ending-style` on the panel) —
  the height/width transition driven by the `--collapsible-panel-height` /
  `--collapsible-panel-width` CSS vars base-ui publishes. **Behavior owned by
  the React implementation**; the static skin just toggles visibility.
- **focus-visible** — the trigger carries its own focus treatment from whatever
  control it's built on (e.g. a `.btn`'s `shadow-focus` ring). The bare
  reference trigger adds nothing so as not to fight a composed control; if used
  standalone it should still expose a ring (`shadow-focus`).
- **disabled** (`disabled` / `aria-disabled` on the trigger) — `cursor-not-allowed`
  + `opacity-50`, inherited from the underlying control.

## Anatomy

```
┌ collapsible (Root — no chrome) ──────────────────────────────┐
│  ┌ collapsible__trigger (a button / composed .btn) ───────┐  │
│  │   trigger label … …………………………………………………  [chevron ⌄?]  │  │  ← consumer-styled
│  └─────────────────────────────────────────────────────────┘  │
│  ┌ collapsible__content (panel) ──────────────────────────┐  │
│  │   revealed content …                                    │  │  ← shown only when open
│  └─────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

- **Root** (`collapsible`) — a transparent grouping wrapper. Owns no border,
  fill, radius, or padding; it only scopes the trigger↔panel relationship. Lay
  it out (column flex, gap) at the use site.
- **Trigger** (`collapsible__trigger`) — the interactive opener. Typically a
  composed control: a `.btn` (often `.btn--ghost` / `.btn--subtle`) or a plain
  full-width row. The contract does not impose a surface; the consumer's chosen
  control owns height, padding, type, and states.
- **Chevron** (`collapsible__chevron`, optional) — a 14px (`size-3.5`)
  decorative disclosure glyph in `content-tertiary` that rotates 180° when the
  panel is open (keyed off the trigger's `data-panel-open`).
- **Content** (`collapsible__content`) — the panel. Hidden when closed, shown
  when open. Padding/type/surface, if any, are the consumer's to add — the bare
  skin contributes none, so a panel can be flush text or a fully-styled card.

## Accessibility

- Real disclosure semantics from base-ui: the trigger is a `<button>` carrying
  `aria-expanded` and `aria-controls` pointing at the panel; the panel is
  labelled back by the trigger. Enter / Space toggle. All owned by the React
  primitive.
- The accessible name is the trigger's text content; the chevron is decorative
  (`pointer-events: none`, no label).
- `hiddenUntilFound` lets the browser's in-page find expand a closed panel — a
  base-ui behavior; the static skin can't reproduce it.
- A focus ring must remain visible on the trigger — never removed, only
  expressed via the composed control (e.g. `shadow-focus`).

## Notes

- This is the **single-section** sibling of Accordion. Accordion frames itself
  (border, divided items, `surface-2` header over a `surface-1` panel);
  Collapsible does not — it is bring-your-own-chrome by design. Don't copy the
  accordion surface recipe here; that would invent vocabulary the source doesn't
  have.
- The reference `.collapsible__content` uses `display:none` while closed as a
  static stand-in. The real height animation (`--collapsible-panel-height`,
  `data-starting-style` / `data-ending-style`) is owned by the React
  implementation and is intentionally out of scope for the static skin.

## Implementations

- **Next / @cloud/ui** — `import { Collapsible, CollapsibleTrigger,
  CollapsibleContent } from "@cloud/ui"`. base-ui `Collapsible` under the hood
  (Root / Trigger / Panel). Controlled `open` / `defaultOpen`, `keepMounted`,
  `hiddenUntilFound`, and the panel height/width animation are **behavior owned
  by the React implementation** — the reference CSS below expresses the static
  skin only (the open/closed visibility toggle + optional chevron rotation), not
  the height transition. The wrapper is headless: style the trigger by composing
  a control (e.g. wrap a `Button` or pass button classes), not by re-skinning
  the primitive. API details: the `ui` skill.
- **Artifact (self-contained HTML)** — compose `.collapsible` ›
  (`.collapsible__trigger` — typically also a `.btn` variant — optionally
  holding a `.collapsible__chevron` span) + `.collapsible__content`, on top of
  the inlined `dist/tokens.inline.css`. Mark the open state with
  `data-panel-open` on the trigger (rotates the chevron) and add
  `.collapsible__content--open` (or `data-open`) to reveal the panel; the static
  skin shows/hides via `display` — it can't run base-ui's height animation. Same
  slot names, same disclosure mechanic.
