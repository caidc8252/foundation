#!/usr/bin/env node
/* ---------------------------------------------------------------------------
   Foundation · restore governed source from a saved prototype version

   Restores tokens/primitives/composites/patterns/governance from the Git commit
   recorded in versions/vN/manifest.json. HEAD is not moved; this only restores
   file contents, so the resulting diff remains reviewable.
   --------------------------------------------------------------------------- */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { CURRENT_BUILD_ROOT, CURRENT_VERSION, refreshReleaseMetadata, writeCurrentVersion } from "../emit/build.mjs";
import {
  assertVersionSourceRestorable,
  restoreGovernedSource,
} from "./source-git.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function usage() {
  console.error("Usage: node scripts/restore-version-source.mjs <vN> [--build]");
  process.exit(1);
}

function assertVersionName(version) {
  if (!/^v\d+$/.test(version || "")) usage();
  return version;
}

function parseArgs(argv) {
  const args = [...argv];
  if (args[0] === "--") args.shift();
  const version = assertVersionName(args.shift());
  let build = false;
  while (args.length) {
    const arg = args.shift();
    if (arg === "--build") build = true;
    else usage();
  }
  return { version, build };
}

function readManifest(version) {
  const manifestPath = join(root, "versions", version, "manifest.json");
  if (!existsSync(manifestPath)) {
    throw new Error(`version manifest not found: ${relative(root, manifestPath)}`);
  }
  return JSON.parse(readFileSync(manifestPath, "utf8"));
}

function runBuild(sourceGit) {
  const { inlineCss } = writeCurrentVersion(root, { sourceGit });
  const { catalog, tokenJson } = refreshReleaseMetadata(root);
  console.log(`foundation: emitted ${CURRENT_BUILD_ROOT}/${CURRENT_VERSION}/tokens.inline.css (${inlineCss.length} bytes)`);
  console.log(`foundation: emitted ${CURRENT_BUILD_ROOT}/${CURRENT_VERSION}/primitives.css`);
  console.log(`foundation: emitted ${CURRENT_BUILD_ROOT}/${CURRENT_VERSION}/composites.css`);
  console.log(
    `foundation: refreshed release/catalog.json + catalog.md ` +
      `(${catalog.primitives.length} primitives, ${catalog.composites.length} composites, ` +
      `${catalog.patterns.length} patterns, ${catalog.classes.length} classes, ${catalog.tokens.length} tokens)`,
  );
  console.log(
    `foundation: refreshed release/tokens.json ` +
      `(light ${Object.keys(tokenJson.light).length} / dark ${Object.keys(tokenJson.dark).length} tokens)`,
  );
}

try {
  const { version, build } = parseArgs(process.argv.slice(2));
  const manifest = readManifest(version);
  const sourceGit = assertVersionSourceRestorable(version, manifest);
  const restored = restoreGovernedSource(root, sourceGit.commit);
  console.log(
    `foundation: restored governed source from ${version} source commit ${restored.shortCommit}`,
  );
  console.log(`foundation: paths: ${restored.paths.join(", ")}`);
  if (build) runBuild(sourceGit);
} catch (error) {
  console.error(`✗ ${error.message}`);
  process.exit(1);
}
