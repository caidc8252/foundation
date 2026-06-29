#!/usr/bin/env node
/* ---------------------------------------------------------------------------
   Foundation · dist freshness check

   dist/ is GENERATED from the sources (tokens/*.css, the reference CSS, the
   contract *.md). A diff after a clean rebuild means someone hand-edited dist/
   or forgot to run `pnpm build`. This rebuilds and asserts dist/ is unchanged.

   Usage:  node scripts/check-dist.mjs
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

const diff = spawnSync("git", ["diff", "--exit-code", "--", "dist"], { cwd: root, stdio: "inherit" });
if (diff.status !== 0) {
  console.error("\n✗ dist/ is out of date — run `pnpm build` and commit the regenerated dist/.");
  process.exit(1);
}
console.log("✓ dist/ is in sync with the sources.");
