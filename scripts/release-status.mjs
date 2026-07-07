#!/usr/bin/env node
/* ---------------------------------------------------------------------------
   Foundation · release status — is the latest clean version actually released?

   The maintain→foundation lifecycle is: editor save → apply-draft / finalize
   (make versions/vN clean) → release (promote vN into release/). The last hop
   is a manual, out-of-band step with no guard, so a version can sit
   `releaseable: true` yet never reach release/ (this is exactly how v2 was
   finalized clean but left unreleased). This surfaces that gap: it warns when a
   clean snapshot NEWER than the released version is waiting to be released.

   Informational by default (exit 0). Pass --strict to exit non-zero when a
   release is pending — use that in a release checklist / CI release gate.

   Usage:
     node scripts/release-status.mjs
     node scripts/release-status.mjs --strict
   --------------------------------------------------------------------------- */
import {
  listVersions,
  markReleasedVersions,
  pendingReleaseSummary,
  readReleaseInfo,
} from "./release-lib.mjs";

const strict = process.argv.slice(2).includes("--strict");

const releaseInfo = readReleaseInfo();
const versions = markReleasedVersions(listVersions(), releaseInfo);
const summary = pendingReleaseSummary(versions, releaseInfo);

console.log("foundation · release status\n");
if (summary.releasedVersion) {
  const when = summary.releasedAt ? ` (${summary.releasedAt})` : "";
  console.log(`  released: ${summary.releasedVersion}${when}`);
} else {
  console.log("  released: none");
}

for (const v of versions) {
  const marker = v.released ? "●" : v.releaseable ? "○" : "·";
  const flags = [v.status, v.released ? "released" : v.releaseable ? "releaseable" : v.releaseBlockReason]
    .filter(Boolean)
    .join(", ");
  console.log(`    ${marker} ${v.version.padEnd(5)} ${flags}`);
}

console.log("");
if (summary.hasPending) {
  const list = summary.pending.join(", ");
  console.log(`  ⚠ ${summary.pending.length} clean version(s) releaseable but NOT released: ${list}`);
  console.log(`    run:  node scripts/release.mjs ${summary.next}   (then pnpm build + commit)`);
  if (strict) process.exit(1);
} else if (summary.releasedVersion) {
  console.log(`  ✓ released ${summary.releasedVersion} is the latest releaseable version — nothing pending.`);
} else {
  console.log("  ✓ no releaseable version is pending.");
}
