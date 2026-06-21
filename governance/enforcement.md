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

No AST lint can run on a self-contained HTML file, so enforcement is an authoring
checklist (reviewed by eye / a design pass):

- [ ] Inlined the current `dist/tokens.inline.css`; no stale snapshot.
- [ ] Every color/size/radius/shadow is `var(--token-…)` — zero hex/px literals
      for anything a token covers.
- [ ] Primitives use the `primitives.css` classes (`.btn`, `.input`, …), matching
      the contracts — not hand-rolled one-offs.
- [ ] Any visual not expressible from tokens/primitives is raised as a token-change
      proposal (`token-change.md`), not hardcoded.
- [ ] Dark mode works by toggling `[data-theme="dark"]` — not by editing colors.

## When the two disagree

If an artifact needs something the app's primitives can't express, that's a
contract gap → propose it (`token-change.md` for tokens, a primitive contract PR
for components). Don't fork a divergent value on either side; that recreates the
drift this foundation removes.
