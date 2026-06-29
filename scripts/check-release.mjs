#!/usr/bin/env node
/* ---------------------------------------------------------------------------
   Foundation · release snapshot freshness check

   release/ (the committed current artifact snapshot — catalog, tokens, composites,
   manifest) and versions/v1/ (the committed base style snapshot) are GENERATED
   from the sources (tokens/*.css, the reference CSS, the contract *.md) by
   `pnpm build`. A diff after a clean rebuild means someone hand-edited a snapshot
   or forgot to run `pnpm build`. This rebuilds and asserts they are unchanged.

   Usage:  node scripts/check-release.mjs
   --------------------------------------------------------------------------- */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const build = spawnSync(process.execPath, [join(root, "emit", "build.mjs")], { stdio: "inherit" });
if (build.status !== 0) {
  console.error("✗ build failed.");
  process.exit(build.status ?? 1);
}

const diff = spawnSync("git", ["diff", "--exit-code", "--", "release", "versions"], { cwd: root, stdio: "inherit" });
if (diff.status !== 0) {
  console.error("\n✗ release/ or versions/ is out of date — run `pnpm build` and commit the regenerated snapshot.");
  process.exit(1);
}
console.log("✓ release/ + versions/ are in sync with the sources.");
