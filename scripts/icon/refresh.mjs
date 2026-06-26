#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────────
   Foundation · re-vendor the Lucide raw material

   HUMAN MAINTAINER TOOL — NOT an automated or AI step. A version bump is a
   deliberate decision (it can shift the Next.js lucide-react floor and change
   icon geometry). Agents must never run this; see primitives/icon.md. Nothing
   in the build/check/author path invokes it.

   It re-vendors icon-nodes.json + tags.json from a published lucide-static
   release via `npm pack` (no permanent dependency) and rewrites ./data +
   VERSION. To guard against accidental/unattended runs it only WRITES when you
   pass BOTH an explicit version AND --yes; otherwise it dry-runs and exits.

     node scripts/icon/refresh.mjs                 # show current pin, do nothing
     node scripts/icon/refresh.mjs 1.22.0          # DRY RUN: preview, write nothing
     node scripts/icon/refresh.mjs 1.22.0 --yes    # confirmed: vendor + rewrite VERSION

   After a confirmed run: `pnpm build` and re-run the pattern checks. Then review
   the diff before committing.
   ───────────────────────────────────────────────────────────── */
import { execSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, rmSync, copyFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";

const dataDir = join(dirname(fileURLToPath(import.meta.url)), "data");
const args = process.argv.slice(2);
const confirmed = args.includes("--yes");
const versionArg = args.find((a) => a !== "--yes");
const pinned = readFileSync(join(dataDir, "VERSION"), "utf8").trim().replace(/^lucide-static@/, "");

// No version given → nothing to do but report the current pin.
if (!versionArg) {
  console.log(`current pin: lucide-static@${pinned}`);
  console.log("A version bump is a human decision. To preview a version:");
  console.log("  node scripts/icon/refresh.mjs <version>         # dry run");
  console.log("  node scripts/icon/refresh.mjs <version> --yes   # confirmed write");
  process.exit(0);
}

const version = versionArg;
const spec = `lucide-static@${version}`;

// Confirmation gate: a version alone is a DRY RUN. Writing requires --yes.
if (!confirmed) {
  console.log(`DRY RUN — would re-vendor ${pinned} → ${version}.`);
  console.log("No files written. Re-run with --yes to confirm:");
  console.log(`  node scripts/icon/refresh.mjs ${version} --yes`);
  process.exit(0);
}

const tmp = mkdtempSync(join(tmpdir(), "lucide-vendor-"));
try {
  console.log(`· packing ${spec} …`);
  execSync(`npm pack ${spec}`, { cwd: tmp, stdio: ["ignore", "ignore", "inherit"] });
  const tgz = readdirSync(tmp).find((f) => f.endsWith(".tgz"));
  if (!tgz) throw new Error("npm pack produced no tarball");
  execSync(`tar -xzf ${tgz} package/icon-nodes.json package/tags.json`, { cwd: tmp });
  for (const f of ["icon-nodes.json", "tags.json"]) {
    copyFileSync(join(tmp, "package", f), join(dataDir, f));
  }
  writeFileSync(join(dataDir, "VERSION"), `${spec}\n`);
  const count = Object.keys(JSON.parse(readFileSync(join(dataDir, "icon-nodes.json"), "utf8"))).length;
  console.log(`✓ vendored ${count} icons from ${spec} → scripts/icon/data`);
  console.log("  next: pnpm build && node scripts/check-artifact.mjs patterns/*.html");
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
