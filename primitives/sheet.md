# Sheet

An edge-docked side panel that slides in over a dimmed scrim (base-ui `Dialog`), docked to right (default), left, top, or bottom — for filters, detail/inspector views, and form panels. Dismissal is the close button, scrim click, or Escape (no drag-to-dismiss).

> **Contract scope.** This file is the cross-consumer *design contract*: the
> side vocabulary, the token recipe, states, anatomy, a11y. It is the authority
> both implementations answer to. It deliberately does NOT document the React
> prop *types* or base-ui `Dialog` specifics (open/close lifecycle, focus trap,
> portal, Escape/overlay dismissal, the enter/exit slide) — those live with the
> Next implementation (`@cloud/ui` + the `ui` skill). When the contract and an
> implementation disagree, the contract is right and the implementation is a bug.

## Variants

The single variant axis is **side** (`data-side`) — which edge the panel docks to. It drives the inset, the size axis (height vs width), and which edge gets the divider border. All four share the panel surface recipe: bg `surface-3` · text `content-primary` · `text-md` · `shadow-4`.

| side | use | token recipe |
|---|---|---|
| `right` *(default)* | detail / inspector / form drawer (LTR end edge) | `inset-y-0 right-0` · full-height · `width: min(560px, 90vw)` · left border `line-default` |
| `left` | nav / filter side panel (LTR start edge) | `inset-y-0 left-0` · full-height · `width: min(560px, 90vw)` · right border `line-default` |
| `top` | notification / command sheet from the top | `inset-x-0 top-0` · full-width · `height: auto` · bottom border `line-default` |
| `bottom` | bottom-sheet / mobile action surface | `inset-x-0 bottom-0` · full-width · `height: auto` · top border `line-default` |

Unlike the Modal the Sheet has **square corners** (docks flush to the edge, no rounded inner corner) and **no drag handle** — dismissal is the close button, scrim click, or Escape (impl-owned). The side widths (`min(560px, 90vw)`, a readable 560px cap) and `height: auto` are viewport math — conventionally exempt, no token expresses them.

## States

- **overlay (scrim)** — a fixed full-viewport `surface-overlay` wash behind the panel (the shared scrim token, same as Modal), with an optional `backdrop-blur` where supported. Fades with the panel (150ms). Clicking it dismisses (impl-gated).
- **open / closed** — enter/exit is a fade (`opacity`) plus a `~40px` translate *from the docked edge* (200ms `ease-in-out`). Keyframes (`data-starting-style` / `data-ending-style`) are impl-owned; this skin paints the resting OPEN panel only.
- **body overflow** — the panel is `flex-direction: column`; the content region scrolls while header/footer stay put (footer pins to the bottom via `mt-auto`).
- **close button hover / focus** — inherits the `ghost` `.btn` recipe (hover `surface-hover`; focus-visible `shadow-focus`).
- No disabled / invalid / selected states on the shell — those belong to the controls the Sheet contains.

## Anatomy

```
┌ overlay (surface-overlay scrim, covers viewport) ─────┐
│                          ┌ sheet (docked right) ─────┐ │
│                          │ ┌ header ───────────[×]─┐ │ │
│                          │ │ title                 │ │ │
│                          │ │ description (optional)│ │ │
│                          │ └───────────────────────┘ │ │
│                          │   …children (scroll)…     │ │
│                          │ ┌ footer (mt-auto) ─────┐ │ │
│                          │ │        [Cancel] [Save]│ │ │
│                          │ └───────────────────────┘ │ │
│                          └───────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

- **overlay** — fixed full-viewport scrim behind the panel; sits on the modal z-layer.
- **sheet (panel)** — the docked surface: `surface-3` on `content-primary`, `text-md`, `shadow-4`, one divider border on the docked edge. `flex` column, square corners, clipped.
- **header** — title + description stack, `space-4` padding, tight `gap-0.5` (2px). Present only when there's a title/description.
- **title** — `text-lg` / 500 / `content-primary`.
- **description** — `text-md` / `content-secondary`.
- **close** — a built-in `ghost` icon button (×, `icon-sm`) pinned `top-3 right-3`; rendered when `showCloseButton` (default true). It is a real `.btn--ghost`, not a bespoke shell element.
- **body** — children flow between header and footer; the panel scrolls this region.
- **footer** — action shelf pinned to the panel bottom via `margin-top: auto`; stacks children in a column with `space-2` gaps, `space-4` padding. Holds `.btn` actions (typically `ghost` cancel + `primary`/`danger` confirm).

## Accessibility

- Real dialog semantics from base-ui `Dialog` (role `dialog`, modal focus trap, `aria-labelledby` / `aria-describedby` wired to the Title/Description slots) — never a hand-rolled `div` overlay.
- Focus moves into the panel on open and restores to the trigger on close (impl-owned).
- Escape and scrim-click dismissal are impl-owned; a sheet that must survive a stray keypress gates them off (or uses `AlertDialog`).
- The close button ships an accessible name — the source renders an `sr-only` "Close" beside the × glyph.
- Focus rings (`shadow-focus`) are never removed.

## Notes

- **Scrim uses the shared `surface-overlay` token** (same as Modal / AlertDialog). The source overlay was a lighter `bg-black/10` wash, but the Sheet was **aligned onto the one governed overlay token** so every scrim in the system is consistent and there is no per-component near-token. Trade-off: the dim is slightly darker than the source's `black/10`; this was the deliberate convergence choice (drop the near-token over pixel-fidelity to the source wash).
- **`backdrop-blur-xs`** on the overlay is a `supports`-gated progressive enhancement with no blur-radius token; expressed with a small literal `blur()` radius (visual-only, degrades gracefully).
- The source paints on `bg-surface-3` (already semantic) and the title/description use the shadcn aliases `text-foreground` / `text-muted-foreground` — they resolve to `content-primary` / `content-secondary` in this token system (same mapping the modal skin uses).
- The close button's `top-3 right-3` offset is `space-3` (12px); the header `gap-0.5` (2px) lands on a half-step over the raw `--space` scale, expressed via the same `calc()` half-step convention used elsewhere in this stylesheet.
- The `~40px` open/close translate (`translate-*-[2.5rem]`) is animation distance, owned by the React enter/exit and out of scope for this static skin.
- Open/close animation, portalling, focus trap, and dismissal gating are **behavior owned by the React implementation** (base-ui `Dialog`); the reference CSS expresses the static OPEN skin only.

## Implementations

- **Next / @cloud/ui** — `import { Sheet, SheetTrigger, SheetClose, SheetPortal, SheetOverlay, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription } from "@cloud/ui"`. **Behavior owned by the base-ui `Dialog` React implementation** (open/close, edge slide, focus trap, portalling, Escape/scrim dismissal); pass `side` (`right` default) for the docked edge and `showCloseButton` to toggle the × . Prop/API details: the `ui` skill. Do not re-skin via `className`; the reference CSS expresses the static skin only. For a centered task dialog use `Modal`.
- **Artifact (self-contained HTML)** — use `.sheet-overlay` wrapping `.sheet` (+ `.sheet--right` / `--left` / `--top` / `--bottom`) with `.sheet__header` › `.sheet__title` + `.sheet__description`, the close as a `.btn .btn--ghost .btn--icon .btn--sm .sheet__close`, and `.sheet__footer` (holding `.btn` actions), on top of the inlined `release/tokens.inline.css`. The reference CSS paints the resting OPEN panel; the consumer drives visibility and the slide is out of scope. Same surface recipe and side vocabulary as the source.
