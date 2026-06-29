# Separator

A hairline divider that splits content along one axis. Optionally carries a centered label ("OR", a section heading) sitting between two line segments.

> **Contract scope.** This file is the cross-consumer *design contract*: the
> orientation/label vocabulary, the token recipe, anatomy, a11y. It is the
> authority both implementations answer to. It deliberately does NOT document
> the React prop *types* or base-ui specifics — those live with the Next
> implementation (`@cloud/ui` + the `ui` skill). When the contract and an
> implementation disagree, the contract is right and the implementation is a bug.

## Variants

A single visual treatment — a 1px hairline in `line-subtle`. There is no variant *prop*; the shape is driven by two orthogonal facts: orientation (`horizontal` *default* / `vertical`) and whether a `label` is present.

| form | use | token recipe |
|---|---|---|
| plain horizontal *(default)* | divide stacked content / list rows / card sections | 1px hairline · bg `line-subtle` · full width, `shrink-0` |
| plain vertical | divide inline items in a toolbar / button row | 1px hairline · bg `line-subtle` · stretches to the row's cross height (`self-stretch`), `shrink-0` |
| labeled | a captioned break ("OR", section title) between two segments | two `flex-1` hairlines (`line-subtle`) flanking a centered caption · text `content-tertiary` · `text-xs` · `gap-3` between segments and label |

> The labeled form is horizontal only — the source renders it as a flex row of `[line] label [line]`; there is no vertical labeled form.

## Sizes

No size scale. The line is always a 1px hairline (a conventionally-exempt value, not a token). The labeled caption is fixed at `text-xs` (12px). Length is intrinsic: horizontal fills the container width, vertical stretches to the parent's cross-axis height.

## States

Stateless and non-interactive — no hover / active / focus / disabled / invalid. It is decorative chrome, not a control. (`aria-orientation` is reflected for assistive tech but carries no visual state.)

## Anatomy

- **Plain** — a single element that is the line itself. Horizontal: `height: 1px; width: 100%`. Vertical: `width: 1px; height: stretch` (`self-stretch` in a flex parent). Always `shrink-0` so a flex parent can't collapse it.
- **Labeled** — a horizontal flex row, `align-items: center`, `gap-3`:

```
┌─────────── line (flex-1) ───────────┐  label  ┌─────────── line (flex-1) ───────────┐
└────────── h-px bg-line-subtle ──────┘ text-xs └────────── h-px bg-line-subtle ──────┘
                                       content-tertiary, shrink-0
```

The two line segments each take equal remaining width (`flex-1`); the label is `shrink-0` so it never compresses.

## Accessibility

- Plain form has `role="separator"` and reflects `aria-orientation` (from base-ui) — purely a structural hint; a separator is not focusable or interactive.
- The labeled form is a presentational `<div>` row (no `role="separator"`); the label text carries its own meaning. If the caption names a section, associate it semantically at the call site (e.g. a heading), not via the separator.
- Decorative-only dividers add no semantics beyond the role; do not attach actions or focus to a separator.

## Notes

- The labeled form is **not** the base-ui `Separator` — it is a hand-rolled flex row in the source. Only the plain form delegates to the base-ui primitive (for the `role`/`aria-orientation` semantics). The reference CSS below expresses both shells statically; the only thing it can't reproduce is base-ui's runtime `aria-orientation` reflection.

## Implementations

- **Next / @cloud/ui** — `import { Separator } from "@cloud/ui"`. base-ui `Separator` under the hood for the plain form; pass `orientation="vertical"` for the vertical line, `label` for the captioned form. API details: the `ui` skill. Do not re-skin via `className`.
- **Artifact (self-contained HTML)** — plain: `<div class="separator">` (add `.separator--vertical` for the vertical line), on top of the inlined `release/tokens.inline.css`. Labeled: `<div class="separator-labeled"><span class="separator-labeled__label">OR</span></div>` (the two flanking lines are drawn with `::before`/`::after`). Same `line-subtle` hairline + `content-tertiary` caption recipe, same names.
