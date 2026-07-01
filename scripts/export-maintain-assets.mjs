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
     node scripts/export-maintain-assets.mjs ../foundation-maintain/carbon
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

const outArg = process.argv.slice(2).filter((a) => a !== "--")[0];
if (!outArg) {
  console.error("Usage: node scripts/export-maintain-assets.mjs <out-dir>");
  process.exit(1);
}
const outDir = resolve(outArg);
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
