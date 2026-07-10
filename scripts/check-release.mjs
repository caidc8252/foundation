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

   Two generators write under release/, so a stale file names its own fix:
   `pnpm build` owns everything except release/prototype-cheatsheet/, which is
   emitted by scripts/prototype-cheatsheet/refresh.mjs. Rebuilding cannot
   refresh the cheatsheet — hence the per-path advice below.

   Usage:  node scripts/check-release.mjs
   --------------------------------------------------------------------------- */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const CHEATSHEET_DIR = "release/prototype-cheatsheet/";

const build = spawnSync(process.execPath, [join(root, "emit", "build.mjs")], { stdio: "inherit" });
if (build.status !== 0) {
  console.error("✗ build failed.");
  process.exit(build.status ?? 1);
}

/* Name the generator that owns each stale path, so the advice is actionable. */
function adviseOn(paths, verb) {
  const cheatsheet = paths.filter((p) => p.startsWith(CHEATSHEET_DIR));
  const built = paths.filter((p) => !p.startsWith(CHEATSHEET_DIR));
  if (built.length) {
    console.error(`\n✗ release/ or build/current/ is out of date — run \`pnpm build\` and ${verb} the regenerated snapshot.`);
  }
  if (cheatsheet.length) {
    console.error(
      `\n✗ ${CHEATSHEET_DIR} is out of date — run \`node scripts/prototype-cheatsheet/refresh.mjs\` and ${verb} it.` +
        "\n  (`pnpm build` does NOT emit the cheatsheet; refresh.mjs does.)",
    );
  }
  process.exit(1);
}

function gitLines(args) {
  const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
  if (result.status !== 0 && result.status !== 1) process.exit(result.status ?? 1);
  return result.stdout.trim() ? result.stdout.trim().split("\n") : [];
}

const changed = gitLines(["diff", "--name-only", "--", "release", "build/current"]);
if (changed.length) {
  spawnSync("git", ["diff", "--", "release", "build/current"], { cwd: root, stdio: "inherit" });
  adviseOn(changed, "commit");
}
const untracked = gitLines(["ls-files", "--others", "--exclude-standard", "--", "release", "build/current"]);
if (untracked.length) {
  console.error(untracked.join("\n"));
  adviseOn(untracked, "add");
}
console.log("✓ release/ + build/current/ are in sync with the sources.");
