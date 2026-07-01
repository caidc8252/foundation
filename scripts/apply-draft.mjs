#!/usr/bin/env node
/* ---------------------------------------------------------------------------
   Foundation · apply an exported prototype draft manifest

   Reads a manifest.json exported from foundation-maintain (or an existing
   versions/<vN>/manifest.json) and (re)writes the versions/<vN> draft snapshot
   — tokens.inline.css / primitives.css / composites.css / manifest.json —
   using the same merge semantics the old publish-server used on save.

   Usage:
     node scripts/apply-draft.mjs path/to/manifest.json
     node scripts/apply-draft.mjs v3        # re-apply versions/v3/manifest.json
   --------------------------------------------------------------------------- */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { publishSnapshot, ROOT } from "./release-lib.mjs";

function usage() {
  console.error("Usage: node scripts/apply-draft.mjs <manifest.json | vN>");
  process.exit(1);
}

const arg = process.argv.slice(2).filter((a) => a !== "--")[0];
if (!arg) usage();

const manifestPath = /^v\d+$/.test(arg)
  ? join(ROOT, "versions", arg, "manifest.json")
  : resolve(arg);
if (!existsSync(manifestPath)) {
  console.error(`✗ manifest not found: ${manifestPath}`);
  process.exit(1);
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const payload = {
  page: manifest.source?.page || manifest.page || "",
  title: manifest.source?.title || manifest.title || "",
  href: manifest.source?.href || manifest.href || "",
  publishedAt: manifest.publishedAt,
  baseVersion: manifest.baseVersion,
  classOverrides: manifest.classOverrides || {},
  classOverrideMeta: manifest.classOverrideMeta || {},
  elementOverrides: manifest.elementOverrides || {},
  conflicts: manifest.conflicts || [],
};
// token overrides live under manifest.tokenOverrides; publishSnapshot expects payload.tokens
payload.tokens = manifest.tokenOverrides || manifest.tokens || {};

const forced = /^v\d+$/.test(arg) ? { version: arg } : {};
try {
  const result = publishSnapshot(payload, forced);
  console.log(`foundation: applied draft ${result.version} at ${result.relativeDir}`);
} catch (error) {
  console.error(`✗ ${error.message}`);
  process.exit(1);
}
