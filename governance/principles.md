# Design law (shared)

The rules that hold in **both** consumers — the Next.js app (`@cloud/ui`) and
artifact-design prototypes. Consumer-specific *enforcement* (which tool catches
a violation) is in `enforcement.md`; this file is the law itself.

## 1. Everything derives from tokens

No raw color, size, radius, shadow, duration, or font value may be hand-written
anywhere. Use a token (`var(--color-…)`, `var(--radius-…)`, …) or — on the Next
side — a utility generated from a token (`bg-primary`, `text-content-secondary`).

- A hex literal, `rgb(...)`, `px` font size, or arbitrary `rounded-[7px]` is a defect.
- 1px hairlines (`border`), `border-0`, `size-px` are conventional utilities, exempt.
- Need a value no token expresses? Stop. Follow `token-change.md` — do not hardcode.

## 2. Tokens are the single source of truth — and they live in one place

Token VALUES exist only in `foundation/tokens/*.css`. Neither consumer redefines
them. The Next app imports the `@theme` source; artifacts inline the emitted
`dist/tokens.inline.css`. Two copies of a value is the failure mode this whole
foundation exists to prevent.

## 3. Semantic names over raw ramps

Reach for the semantic token, not the ramp step it points at:
`text-content-secondary` not `text-…-600`; `bg-success-bg` not `bg-…-50`;
`border-line-default` not a specific gray. Semantic names survive a re-theme;
ramp steps don't.

## 4. The type scale is closed

Font sizes snap to `--text-{2xs…5xl}`. There is no `text-[15px]`. Same for the
control-height (`control-*`), spacing (`cx-*`, `space-*`), radius, and shadow
ladders. The scales are the design; off-scale values read as accidents.

## 5. The component contract is authoritative — atoms and composites alike

A component's variants/sizes/states/anatomy are defined once: primitives in
`foundation/primitives/<name>.md`, composites in `foundation/composites/<name>.md`.
Both implementations answer to it: the `@cloud/ui` React component and the
artifact-side reference CSS (`primitives.css` / `composites.css`). When an
implementation diverges from the contract, the implementation is the bug.
Don't re-skin to fake a new variant — propose the variant to the contract first.

**Composites are the assembly unit, patterns are the recipe.** A reusable
building block (page-body, page-header, data-table, the list-filter family,
pagination, empty-state, skeleton) is a *composite* with its own contract — not a
slice of a pattern. A page is assembled by choosing composites; the **pattern**
(L3) fixes which composites appear and in what order. So a recurring part
(page-body and page-header show up in list, detail, and create) lives **once** as
a composite, never duplicated into each pattern. Don't subdivide patterns into "header + table" — that pushes
granularity to the wrong layer and forfeits the pattern's ordering guarantee.

## 6. The four layers, and what crosses the consumer boundary

| Layer | Shared substance (in foundation) | Stays consumer-specific |
|---|---|---|
| **Tokens** | the values | — |
| **Primitives** | contract + reference CSS | React impl (Next) / bespoke HTML (artifact) |
| **Composites** | contract + reference CSS | React impl (Next) / bespoke HTML (artifact) |
| **Patterns** | named archetype structure | the actual page implementations |
| **Governance** | this law + token process | the enforcement mechanism (lint vs checklist) |

Below tokens, consumers share *contracts*, never *code*. That is by design:
React+Tailwind and self-contained HTML cannot share components — but they can,
and must, share the same design truth.

## 7. Same-brand scope

This foundation encodes ONE brand (the product design system). Sharing tokens
across the prototype→production boundary is correct precisely because both sides
are the same product. It is **not** a generic theme for off-brand work — an
artifact that wants a deliberately different identity should not consume these
tokens; it forks its own. (See the project decision: same-brand pipeline.)
