#!/usr/bin/env node
/* ---------------------------------------------------------------------------
   Foundation · finalize a promoted prototype version

   Validates that a draft versions/vN snapshot has been promoted into the
   governed source, then rewrites that same versions/vN snapshot from the
   current source as a clean releaseable version.

   Usage:
     node scripts/finalize-promoted-version.mjs v3
   --------------------------------------------------------------------------- */
import { finalizePromotedVersion } from "../prototypes/carbon/publish-server.mjs";

function usage() {
  console.error("Usage: node scripts/finalize-promoted-version.mjs <vN>");
  process.exit(1);
}

const args = process.argv.slice(2);
if (args[0] === "--") args.shift();
const version = args[0];
if (!/^v\d+$/.test(version || "")) usage();

try {
  const result = finalizePromotedVersion(version);
  console.log(
    `foundation: finalized ${result.version} as a clean saved version at ${result.relativeDir}`,
  );
  console.log(`foundation: source commit ${result.sourceCommit}`);
} catch (error) {
  console.error(`✗ ${error.message}`);
  process.exit(1);
}
