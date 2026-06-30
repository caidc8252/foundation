# scripts/visual

Screenshot tooling for the **opt-in visual review** (default OFF). Contract +
when-to-run: [`governance/enforcement.md`](../../governance/enforcement.md) →
"visual review pass". Rubric: [`governance/composition.md`](../../governance/composition.md).

- **`render.mjs <html> <outDir> <base> [view…]`** — full-page light+dark
  screenshots (+ a 64px squint thumbnail) of a built artifact. Extra views are
  driven by `label=#hash` or `label=@selector` (page reloads between views).

```bash
pnpm install
pnpm visual:setup          # once — downloads chromium (Linux may also need: npx playwright install-deps chromium)
pnpm visual:render artifacts/roles.html /tmp/shots roles "sel=@.list-row[data-role]"
```

Advisory quality tooling, **not a build gate**. Nothing invokes it unless the
generation prompt carries `Visual review: on`.
