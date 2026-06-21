# @cloud/foundation

The shared design **foundation** — one upstream, two downstream consumers:

- the **Next.js app** (`@cloud/ui`), and
- **artifact-design prototypes** built in the requirements space.

It exists to kill one failure mode: the same design truth living in two places
and drifting apart. Token values, primitive contracts, pattern archetypes, and
the design law are defined **here, once**; each consumer reads them in the form
it can use.

> Scope: **one brand**, same-brand prototype→production pipeline. Not a generic
> theme — off-brand artifact work forks its own tokens. See
> `governance/principles.md` §7.

## The four layers

| Layer | Lives in | What's shared | What stays per-consumer |
|---|---|---|---|
| **L1 · Tokens** | `tokens/` (+ emitted `dist/`) | the values | — |
| **L2 · Primitives** | `primitives/` | contract (`*.md`) + reference CSS | React impl (Next) · bespoke HTML (artifact) |
| **L3 · Patterns** | `patterns/` | named archetype structure | the page implementations |
| **L4 · Governance** | `governance/` | the design law + token process | enforcement (lint vs checklist) |

Below tokens, consumers share **contracts, not code** — React+Tailwind and
self-contained HTML can't share components, but they answer to the same truth.

## Layout

```
foundation/
  tokens/            L1 — @theme source (the single source of truth for values)
    palette·surface·typography·elevation·motion·layout·chart·dark.css
    index.css          import-only entry
  emit/build.mjs     emitter: @theme source → Tailwind-free artifact outputs
  dist/              GENERATED — never hand-edit
    tokens.inline.css  flat :root{} + dark, paste into an artifact <style>
    tokens.json        { light, dark } maps for artifact JS
  primitives/        L2 — button.md … (contracts) + primitives.css (reference)
  patterns/          L3 — list-page · detail-page · create-form (archetypes)
  governance/        L4 — principles · token-change · enforcement
```

## How each consumer uses it

**Next.js / `@cloud/ui`** — depend on `@cloud/foundation`, then in the app's
global stylesheet import the `@theme` source so Tailwind generates the
`bg-*`/`text-*`/`border-*` utilities:

```css
@import "tailwindcss";
@import "@cloud/foundation/tokens";   /* token values */
/* @cloud/ui keeps ONLY its Tailwind glue here: @utility z-*,
   @custom-variant dark, @layer base, the @theme inline shadcn aliases,
   grid-auto-fit — it no longer defines token values. */
```

**Artifact (self-contained HTML)** — inline the emitted token block, then use
the primitive reference classes:

```html
<style>
  /* paste dist/tokens.inline.css here */
  /* paste primitives/primitives.css here */
</style>
```

Artifacts are frozen snapshots by nature (CSP, no external fetch). "Syncing" an
artifact = re-inlining the current `dist/` — there is no live link, and that's
correct.

## Sync model

One upstream (this repo). Each consumer pins a version (pnpm git dependency, e.g.
`"@cloud/foundation": "github:<org>/foundation#v0.1.0"`) and bumps when ready.
Token/contract changes are PRs **here**, then a tagged release — never a local
patch in a consumer. Full process: `governance/token-change.md`.

> `dist/` is committed so git-dependency consumers get it without a build step.
> Regenerate with `pnpm build` (or `node emit/build.mjs`) after editing `tokens/`.

## Status — first draft

- ✅ L1 tokens extracted from the live `@cloud/ui` and emitting cleanly.
- ✅ L2 contract format set (`button.md`) + common primitives + `primitives.css`.
- ✅ L3 archetype stubs · ✅ L4 governance.
- ⏳ **Not yet wired**: `@cloud/ui`'s `index.css` still defines its own token
  values; pointing it at `@cloud/foundation/tokens` (and verifying the compiled
  CSS is unchanged via diff) is the migration step, intentionally out of this draft.
- ⏳ Primitive coverage is the common set; grow on demand, not all ~70 at once.
