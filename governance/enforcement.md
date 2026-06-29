# Enforcement

The design law (`principles.md`) is shared. How a violation gets *caught*
differs by consumer — one has a compiler-grade lint, the other has a checklist.
This file is the pointer map.

## Next.js app (`@cloud/ui` consumer)

Enforced mechanically by ESLint in the app repo (`eslint.nextkit.mjs`). Relevant
rules that back the law:

- **No arbitrary Tailwind values** — `bg-[#…]`, `text-[15px]`, `rounded-[7px]`,
  template-literal arbitraries. Backs principle 1 & 4.
- **No inline `style` for static visuals** — `style` is only for runtime/dynamic
  values or `--var` injection. Backs principle 1.
- **No native form controls** — `<button>/<input>/<select>/<textarea>` must be the
  `@cloud/ui` primitives. Backs principle 5.
- **Primitive API guards** — `asChild` (base-ui uses `render=`), Card padding,
  Table columns/rows API, Button content-height trap, `.map()` fragment keys.
- **No CSS-in-JS** — styled-components / emotion banned. Backs principle 1 & 2.

These run at lint/CI time; a violation fails the build. The app never redefines
token values — it imports the foundation `@theme` source.

## Artifact-design (requirements space consumer)

The closed set an artifact may use — and where to find each piece — is the
`AGENTS.md` at the repo root; the legal token/class/pattern names are enumerated
in the committed `release/catalog.md` (+ `release/catalog.json`). Start there.

No AST l int can run on a self-contained HTML file, so enforcement is part
**runnable check**, part authoring checklist:

```bash
node scripts/build-artifact.mjs --pattern list-page --out path/to/artifact.html
node scripts/check-artifact.mjs path/to/artifact.html   # or: pnpm check <file>
node scripts/check-artifact.mjs --strict path/to/artifact.html
```

`build-artifact.mjs` is the preferred starting point for AI-generated pages: it
ports the page content from a pattern example, inlines the current foundation CSS
layers, applies the frameless full-width shell (the app-frame skeleton minus the
sidebar/header chrome, `main.app-frame__main` as the scroll root), and runs the
strict checker.
After hand edits, run the strict checker again.

It reports usage outside the catalog — hardcoded colors, unknown `var(--…)`
tokens, and classes that are neither a foundation class nor defined in the file's
own page-local `<style>`. It can check the shipped self-contained artifact
directly: when `release/tokens.inline.css`, `primitives/primitives.css`, and
`release/composites.css` are inlined, those known layer bodies are ignored so
their token values do not count as hardcoded artifact colors. In default mode,
off-set classes are review warnings; `--strict` makes them hard violations and is
the recommended gate for AI-generated artifacts.

The remaining items are an eye/design pass:

- [ ] `node scripts/check-artifact.mjs --strict <file>` is clean (no out-of-set
      tokens/colors/classes; page-local composition classes must be defined in
      the artifact's own `<style>`).
- [ ] Inlined the current `release/tokens.inline.css`; no stale snapshot.
- [ ] Every color/size/radius/shadow is `var(--token-…)` — zero hex/px literals
      for anything a token covers.
- [ ] Primitives/composites use the `primitives.css` / `composites.css` classes
      (`.btn`, `.input`, `.data-table`, …), matching the contracts — not hand-rolled one-offs.
- [ ] Any visual not expressible from tokens/primitives is raised as a token-change
      proposal (`token-change.md`), not hardcoded.
- [ ] Dark mode works by toggling `[data-theme="dark"]` — not by editing colors.
- [ ] Frameless functional page is **full-width** — the builder's
      `main.app-frame__main` scroll root fills the width with no `max-width` lock.
      Height scrolls. (Use the full `.app-frame` with chrome only when you want a
      production sidebar + header.) See `.claude/docs/artifact-build-guide.md` §6 "frameless shell 的 sticky 滚动根".

## When the two disagree

If an artifact needs something the app's primitives can't express, that's a
contract gap → propose it (`token-change.md` for tokens, a primitive contract PR
for components). Don't fork a divergent value on either side; that recreates the
drift this foundation removes.
