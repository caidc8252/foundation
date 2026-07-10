# Alert

An inline, in-flow status message box. Highlights feedback (a result, a warning, an error, contextual info) at the point in the layout where it's relevant. Not a transient toast and not a modal — it sits in the page and stays.

## Variants

Alert is colored by **tone** (semantic status), not by visual form — there is one form (a tonal filled box) and the `variant` prop selects the status hue. Each tone uses the matching semantic `*-bg` surface, a hairline border mixed from the base semantic color at 25% opacity, and `*-strong` text (which the leading icon inherits). **Every alert carries a semantic tone — there is no neutral/un-toned variant; if a note has no status, it isn't an Alert.**

| variant | use | token recipe |
|---|---|---|
| `info` | informational heads-up | bg `info-bg` · border `info`/25 · text + icon `info-strong` |
| `success` | a completed / healthy result | bg `success-bg` · border `success`/25 · text + icon `success-strong` |
| `warning` | a caution that needs attention but isn't a failure | bg `warning-bg` · border `warning`/25 · text + icon `warning-strong` |
| `error` | a failure / blocked action | bg `error-bg` · border `error`/25 · text + icon `error-strong` |

> Alias kept for compat: `destructive` = `error`. (`destructive` is the shadcn vocabulary; it resolves to the `error` tone here.)

## Sizes

No size variants — one box. Padding is fixed at block `--space-3` (12px) × inline `--space-4` (16px); radius `radius-lg`. Density comes from how much you put in it (title only, vs. title + description + action), not a size prop.

## States

Alert is a static presentational box — it has no hover / active / focus / disabled / invalid states of its own. Any interactivity lives in slotted controls (the `action` button), which carry their own states from `.btn`. The only per-instance change is the **tone** selected via `variant`.

## Anatomy

```
┌─────────────────────────────────────────────┐
│ [icon?]  Title                    [ action? ]│   ← title row  (action pinned top-right, absolute)
│          Description text…                    │   ← description row
└─────────────────────────────────────────────┘
```

- **icon** *(optional)* — a leading status glyph. When present the root switches to a two-column grid (`auto 1fr`) with a `--space-2`-ish gutter; the icon spans both rows, sits `size-3.5` (14px), nudged down a hair to align to the title cap-height, and `shrink-0`. The title and description then start in column 2. With no icon the box is a plain single-column flow.
- **title** — `text-md`, `font-semibold`, tight line-height. The primary line.
- **description** *(optional)* — `text-xs`, `content-secondary`, a small top margin below the title. Inherits nothing from the tone color (deliberately dimmer than the title).
- **action** *(optional)* — a control (typically a `.btn--ghost`) absolutely positioned in the top-right corner. Use it for one inline affordance ("Retry", "Dismiss").

## Accessibility

- The root carries `role="alert"` so assistive tech announces the message when it appears. Reserve it for genuine status feedback — don't wrap static page copy in an Alert just for the tinted box.
- Tone is reinforced by the title/icon, but color is never the *only* signal — the title text carries the meaning. Pair tone with a recognizable status icon for users who can't perceive the hue.
- The `action` control owns its own accessible name and keyboard behavior (it's a real button via `.btn`); icon-only actions need an `aria-label`.

## Implementations

- **Next / @cloud/ui** — `import { Alert, AlertTitle, AlertDescription, AlertAction } from "@cloud/ui"`. `Alert` takes `variant`; compose the `AlertTitle` / `AlertDescription` / `AlertAction` slots inside. The two-column icon layout is auto-applied when a direct `<svg>` child is present (`has-[>svg]`). Don't re-skin via `className`; pick a `variant`.
- **Artifact (self-contained HTML)** — use `.alert` + `.alert--<tone>` on the box, with `.alert__icon` / `.alert__title` / `.alert__description` / `.alert__action` slots, on top of the inlined `release/tokens.inline.css`. The `.alert--with-icon` modifier opts the box into the two-column grid (the static skin can't observe a child `<svg>` the way the React `has-[>svg]` selector does, so it's an explicit class). Same tone recipe, same names. Reuse `.btn` (e.g. `.btn--ghost .btn--xs`) inside `.alert__action`.
