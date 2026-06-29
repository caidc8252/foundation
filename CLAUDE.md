# CLAUDE.md

Building an artifact from this design foundation? **Read [`AGENTS.md`](AGENTS.md)** —
it is the operating manual: the closed set you may use (tokens · primitives ·
composites · patterns), where to find each thing fast (`release/catalog.md`), how to
assemble a page, and how to check your work.

Quick map:
- **What may I use?** → the closed set in [`AGENTS.md`](AGENTS.md); enumerated names in [`release/catalog.md`](release/catalog.md) / [`release/catalog.json`](release/catalog.json).
- **The design law** → [`governance/principles.md`](governance/principles.md).
- **How violations are caught** → [`governance/enforcement.md`](governance/enforcement.md) (+ `node scripts/check-artifact.mjs <file>`).
- **Changing a token/contract** → [`governance/token-change.md`](governance/token-change.md). Edits to values go in `tokens/`, then `pnpm build`; never hand-edit `release/` or `versions/v1/`.
