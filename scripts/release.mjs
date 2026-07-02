#!/usr/bin/env node
/* ---------------------------------------------------------------------------
   Foundation · release a finalized version snapshot into release/

   Usage:
     node scripts/release.mjs v3
   --------------------------------------------------------------------------- */
import { releaseSnapshot } from "./release-lib.mjs";

function usage() {
  console.error("Usage: node scripts/release.mjs <vN>");
  process.exit(1);
}

const version = process.argv.slice(2).filter((a) => a !== "--")[0];
if (!/^v\d+$/.test(version || "")) usage();

try {
  const result = releaseSnapshot(version);
  console.log(`foundation: released ${result.version} into ${result.relativeDir}`);
} catch (error) {
  console.error(`✗ ${error.message}`);
  process.exit(1);
}
