#!/usr/bin/env node
/* ---------------------------------------------------------------------------
   Foundation · example lint

   The in-repo example HTML (patterns/ · composites/ · primitives/) is the AI's
   PRIMARY reference and anti-hallucination guard — so it must itself stay inside
   the closed set. This runs check-artifact over every example.

   Default mode enforces the HARD FLOOR (no hardcoded colors, no off-set tokens,
   no unknown icon names). Pass --strict to additionally fail on off-set classes
   and altered icon paths.

   Usage:  node scripts/check-examples.mjs [--strict]
   --------------------------------------------------------------------------- */
import { readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dirs = ["patterns", "composites", "primitives"];
const files = dirs.flatMap((d) =>
  readdirSync(join(root, d))
    .filter((f) => f.endsWith(".html"))
    .sort()
    .map((f) => join(root, d, f)),
);

const passthrough = process.argv.slice(2).filter((a) => a.startsWith("-"));
const res = spawnSync(
  process.execPath,
  [join(root, "scripts", "check-artifact.mjs"), ...passthrough, ...files],
  { stdio: "inherit" },
);
process.exit(res.status ?? 1);
