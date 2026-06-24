# Load more · composite

The append-on-click footer beneath a list/table: an optional summary line, a
load-more button (or an end marker once exhausted), and an optional progress
bar. Purely presentational — all copy is passed in, so it stays i18n-agnostic.
Pair it with a windowed/plain table above; for scroll-driven loading use the
table's own `onReachEnd` instead.

> **Contract scope.** Cross-consumer contract: anatomy, the two terminal
> states (more / done), tokens. React prop types live with `@cloud/ui`; the
> contract wins — an implementation that diverges is the bug.

## Anatomy

```
┌ load-more ──────────────── (top hairline) ────────────────┐
│              Showing 50 of 1,248          (summary?)       │
│                 [  Load more  ]    ← secondary/lg button   │
│              ▰▰▰▰▰▰▰▱▱▱▱▱▱▱▱▱             (progress?)       │
└────────────────────────────────────────────────────────────┘

  done state — the button slot is replaced by the end marker:
┌ load-more ──────────────── (top hairline) ────────────────┐
│              Showing 1,248 of 1,248       (summary?)       │
│              You've reached the end       ← end marker     │
│              ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰             (progress?)       │
└────────────────────────────────────────────────────────────┘
```

A centered vertical stack (gap `space-3`) with a top hairline (`line-default`)
separating it from the list above, and `px-4` / `py-5` padding. Three optional
zones top-to-bottom: **summary**, the **action slot** (button OR end marker —
never both), **progress**.

## States

State is driven by the `done` / `loading` flags, not a variant:

| flag | action slot | progress |
|---|---|---|
| `loading=false done=false` *(more)* | `secondary` `lg` button, enabled, shows the passed label | bar at current ratio |
| `loading=true` | the SAME button, now `loading` (spinner replaces iconLeft, button disabled) — the label stays visible | bar unchanged |
| `done=true` | button removed; **end marker** text (`text-sm` / `content-tertiary`) in its place | bar at 100% |

- **summary** — `text-sm` / `content-secondary`, e.g. a localized "Showing N of TOTAL". Rendered only when provided.
- **progress** — optional thin bar, capped to a readable measure (`w-60` ≈ 240px, `max-w-full`). The ratio is clamped to 0–100%. Rendered only when provided. The bar's own skin (track / indicator / tones) is the **progress** contract, not redefined here.
- The button's hover/active/disabled/focus behavior is the `secondary` Button recipe — see button.md. `loading` implies disabled.

## Accessibility

- The action is a real `<button>` (Button primitive) — keyboard/disabled semantics come for free.
- While `loading`, the button is disabled so repeated presses can't double-fetch the next batch.
- The progress bar carries its own `aria-label` ("Loaded so far") so it isn't an unlabeled progressbar (announced via the Progress primitive).
- The end marker is plain text, not a disabled button — once done there is no action to offer.

## Implementations

- **Next / @cloud/ui** — `import { LoadMore } from "@cloud/ui"`. Props: `loading` `done` `onLoadMore` `progress` (0–1 ratio) `summary` `endContent` `children` (button label). Composes `Button` (`variant="secondary"` `size="lg"`) + `Progress`. All copy is passed in. API details: the `ui` skill.
- **Artifact (self-contained HTML)** — `.load-more` › optional `.load-more__summary`, then EITHER a `.btn.btn--secondary.btn--lg` (more/loading) OR `.load-more__end` (done) in the action slot, then an optional `.progress` (reuse the progress primitive's classes for the bar, sized via `.load-more__progress`). On top of the inlined `dist/tokens.inline.css` + `primitives.css`. In `composites.css`.
