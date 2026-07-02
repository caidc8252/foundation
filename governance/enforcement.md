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

No AST lint can run on a self-contained HTML file, so enforcement is part
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
tokens, native date/time inputs (`<input type="date|time|datetime-local|month|
week">`, which render browser-native chrome that bypasses the token skin — use the
date-picker family / `.date-trigger` instead), and classes that are neither a
foundation class nor defined in the file's own page-local `<style>`. It can check the shipped self-contained artifact
directly: when `release/tokens.inline.css`, `primitives/primitives.css`, and
`release/composites.css` are inlined, those known layer bodies are ignored so
their token values do not count as hardcoded artifact colors. In default mode,
off-set classes are review warnings; `--strict` makes them hard violations and is
the recommended gate for AI-generated artifacts.

The remaining items are an eye/design pass:

- [ ] `node scripts/check-artifact.mjs --strict <file>` is clean (no out-of-set
      tokens/colors/classes; page-local composition classes must be defined in
      the artifact's own `<style>`).
- [ ] **Filtering commits on the Search button, never on change** (principle 14):
      the search field / quick filters edit a *draft*; only **Search** (or Enter)
      runs the query; chip-remove / Clear-all re-running immediately is allowed.
      **The static checker cannot see this reliably** — whether an `input`/`change`
      handler merely updates the draft (allowed) or runs the query (a defect) is a
      behavior, not a closed-set fact. `check-artifact` emits a **best-effort advisory**
      (⚠) when a search/filter target is wired to an `input`/`change` listener, but it
      misses generically-named wiring and can't confirm intent — so read the filter
      wiring by hand. This is the failure mode missed most under **detail-page tabs**.
- [ ] Inlined the current `release/tokens.inline.css`; no stale snapshot.
- [ ] Every color/size/radius/shadow is `var(--token-…)` — zero hex/px literals
      for anything a token covers.
- [ ] Primitives/composites use the `primitives.css` / `composites.css` classes
      (`.btn`, `.input`, `.data-table`, …), matching the contracts — not hand-rolled one-offs.
      Dates/times use the picker family (`.date-trigger`), **never** a native
      `<input type="date|time|datetime-local|month|week">` — the native control
      renders browser chrome that ignores the token skin (checker flags it hard).
- [ ] Any visual not expressible from tokens/primitives is raised as a token-change
      proposal (`token-change.md`), not hardcoded.
- [ ] Dark mode works by toggling `[data-theme="dark"]` — not by editing colors.
- [ ] Frameless functional page is **full-width** — the builder's
      `main.app-frame__main` scroll root fills the width with no `max-width` lock.
      Height scrolls. (Use the full `.app-frame` with chrome only when you want a
      production sidebar + header.) See `.claude/docs/artifact-build-guide.md` §6 "frameless shell 的 sticky 滚动根".

### Optional: visual review pass (opt-in, default OFF)

The eye/design pass above can be performed by an agent against real renders — it
is `composition.md`'s synthesis gate (rule 5) done by a vision model on
screenshots, the one mechanism that catches *subjective* composition problems (an
unbalanced split, a starved column) that no closed-set lint can express.

**Default OFF.** It runs ONLY when the generation instructions carry the directive
line **`Visual review: on`** — absence, or `Visual review: off`, skips it (the
canonical form is greppable; natural equivalents like "run a visual review pass"
are honoured too). It runs AFTER `check-artifact --strict` passes — legality first.

When on:

```bash
pnpm visual:setup   # once: downloads chromium (Linux may also need: npx playwright install-deps chromium)
node scripts/visual/render.mjs <artifact.html> <outDir> <base> ["view=#hash" | "view=@selector" ...]
```

This renders each view light+dark (+ a 64px squint thumbnail); the agent then
reads each shot and judges it against `composition.md` rules 1–5 — completeness,
one-world, density, **proportion**, reads-as-delivered — plus light/dark parity
and declared-state visibility. Output: per-view findings, each tagged with the
rule it breaks and classified ① page/composition fix vs ② foundation gap.

It is **advisory** — judgement, never a build-failing gate (proportion has no
fixed ratio; only *starvation* reads as wrong). Fix ① and re-render; raise ② as a
contract/token change.

## When the two disagree

If an artifact needs something the app's primitives can't express, that's a
contract gap → propose it (`token-change.md` for tokens, a primitive contract PR
for components). Don't fork a divergent value on either side; that recreates the
drift this foundation removes.
