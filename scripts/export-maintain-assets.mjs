#!/usr/bin/env node
/* ---------------------------------------------------------------------------
   Foundation · export static editing assets for foundation-maintain

   Regenerates the read-only editing substrate the static editor needs:
     <out>/versions.json                       — version index (server-shape)
     <out>/catalog.json                        — copy of release/catalog.json
     <out>/versions/<vN>/tokens.inline.css     — per-version preview CSS
     <out>/versions/<vN>/primitives.css
     <out>/versions/<vN>/composites.css

   Usage:
     pnpm export:maintain                     # → ../foundation-maintain/carbon
     node scripts/export-maintain-assets.mjs <out-dir>

   <out-dir> defaults to the sibling checkout ../foundation-maintain/carbon (the
   layout governance/release-workflow.md §3 assumes). The default is only taken
   when that repo is actually checked out — otherwise we'd silently mkdir a stray
   tree instead of telling you the repo is missing.
   --------------------------------------------------------------------------- */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import {
  ensureCurrentVersion,
  listVersions,
  currentVersionSummary,
  markReleasedVersions,
  readReleaseInfo,
  ROOT,
  VERSION_ROOT,
  RELEASE_ROOT,
} from "./release-lib.mjs";

const DEFAULT_OUT = resolve(ROOT, "..", "foundation-maintain", "carbon");

const outArg = process.argv.slice(2).filter((a) => a !== "--")[0];
if (!outArg && !existsSync(resolve(DEFAULT_OUT, ".."))) {
  console.error("Usage: node scripts/export-maintain-assets.mjs <out-dir>");
  console.error(`\n✗ foundation-maintain is not checked out next to foundation.`);
  console.error(`  expected: ${resolve(DEFAULT_OUT, "..")}`);
  console.error(`  clone it there, or pass an explicit <out-dir>.`);
  process.exit(1);
}
const outDir = outArg ? resolve(outArg) : DEFAULT_OUT;
mkdirSync(outDir, { recursive: true });

ensureCurrentVersion(ROOT);
const releaseInfo = readReleaseInfo(RELEASE_ROOT);
const current = markReleasedVersions([currentVersionSummary(ROOT)], releaseInfo)[0];
const versions = markReleasedVersions(listVersions(), releaseInfo);
const index = {
  ok: true,
  current,
  versions,
  latest: versions.at(-1)?.version || "",
  releasedVersion: releaseInfo.version,
  releasedAt: releaseInfo.releasedAt,
};
writeFileSync(join(outDir, "versions.json"), `${JSON.stringify(index, null, 2)}\n`, "utf8");

const catalog = join(RELEASE_ROOT, "catalog.json");
if (existsSync(catalog)) copyFileSync(catalog, join(outDir, "catalog.json"));

const CSS_FILES = ["tokens.inline.css", "primitives.css", "composites.css"];
for (const entry of readdirSync(VERSION_ROOT, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const src = join(VERSION_ROOT, entry.name);
  const dst = join(outDir, "versions", entry.name);
  mkdirSync(dst, { recursive: true });
  for (const file of CSS_FILES) {
    const from = join(src, file);
    if (existsSync(from)) copyFileSync(from, join(dst, file));
  }
}
console.log(`foundation: exported maintain assets → ${outDir} (${versions.length} versions)`);
