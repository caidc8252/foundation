# Changing a token

There is one upstream (`@cloud/foundation`) and two downstream consumers. A token
change is a versioned event, not a local edit. This is the process that keeps the
two spaces from drifting.

## Before you add anything

Adding a token is the last resort, in this order of preference:

1. **Reuse** an existing semantic token. ("Secondary text" → `content-secondary`,
   don't add `content-muted`.)
2. **Reuse** a ramp step if no semantic name fits.
3. Only if neither exists: propose a new token — and say which group it joins
   and why nothing covers it.

Changing an existing token's *value* is heavier than adding one: it moves every
surface that references it, in both consumers. Treat it as a design decision with
review, not a tweak.

## The flow

1. Edit `foundation/tokens/*.css` (the one source). Add to the right layer file
   and, if it has a light value that changes in dark, add the override to
   `dark.css`. Keep semantic shortcuts pointing at ramp steps via `var()`.
2. Run `pnpm build` to regenerate `dist/`. Never hand-edit `dist/`.
3. Open a PR to the foundation repo. Review covers: name follows the group's
   convention, value is OKLCH, dark override present if needed, no duplicate of
   an existing token.
4. Merge and tag a release (`vX.Y.Z`). Adding tokens is a minor bump; changing a
   value that shifts existing UI is a major bump — call it out.
5. Each consumer syncs on its own schedule by bumping the dependency ref and
   running install. The Next app may hold a stable version while artifact
   experiments track a newer one — that decoupling is the point of versioning.

## Where edits may originate

Either space (both are git). A token need spotted while building an artifact in
the requirements space is still a PR **to the foundation repo** — never a local
patch to the inlined snapshot, and never a divergent edit in the app. One
upstream, always.

## Tailwind-specific notes (for editors)

- `tokens/*.css` author values in `@theme` / `@theme static`. The chart palette
  MUST stay in `@theme static` — it's referenced only at runtime, so a plain
  `@theme` tree-shakes it away. See the comment in `chart.css`.
- `@theme inline` shadcn aliases, `@utility z-*`, `@custom-variant dark`, and
  `@layer base` are Tailwind *mechanism*, not token values — they stay in
  `@cloud/ui`, not here.
