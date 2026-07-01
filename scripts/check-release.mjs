#!/usr/bin/env node
/* ---------------------------------------------------------------------------
   Foundation · release snapshot freshness check

   release/ (the committed current artifact snapshot — catalog, tokens, composites,
   manifest) and build/current/ (the committed current-source style snapshot) are GENERATED
   from the sources (tokens/*.css, the reference CSS, the contract *.md) by
   `pnpm build`. A diff after a clean rebuild means someone hand-edited a snapshot
   or forgot to run `pnpm build`. Numbered versions/vN directories are saved
   prototype snapshots, not build outputs. This rebuilds and asserts the
   committed snapshots are unchanged.

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

const diff = spawnSync("git", ["diff", "--exit-code", "--", "release", "build/current"], { cwd: root, stdio: "inherit" });
if (diff.status !== 0) {
  console.error("\n✗ release/ or build/current/ is out of date — run `pnpm build` and commit the regenerated snapshot.");
  process.exit(1);
}
const untracked = spawnSync(
  "git",
  ["ls-files", "--others", "--exclude-standard", "--", "release", "build/current"],
  { cwd: root, encoding: "utf8" },
);
if (untracked.status !== 0) {
  process.exit(untracked.status ?? 1);
}
if (untracked.stdout.trim()) {
  console.error(untracked.stdout.trim());
  console.error("\n✗ generated snapshot files are untracked — add the regenerated release/ or build/current/ files.");
  process.exit(1);
}
console.log("✓ release/ + build/current/ are in sync with the sources.");
