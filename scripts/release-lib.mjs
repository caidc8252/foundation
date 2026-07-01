import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, extname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  applyTokenJsonOverrides,
  CURRENT_BUILD_ROOT,
  emitCatalog,
  emitCatalogMarkdown,
  emitTokensJson,
  RELEASE_STRUCTURE,
  CURRENT_VERSION,
  writeCurrentVersion,
} from "../emit/build.mjs";
import {
  assertVersionSourceRestorable,
  readSourceGitState,
  restoreGovernedSource,
} from "./source-git.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(HERE, "..");
export const VERSION_ROOT = join(ROOT, "versions");
export const BUILD_ROOT = join(ROOT, CURRENT_BUILD_ROOT);
export const RELEASE_ROOT = join(ROOT, "release");

const TOKEN_RE = /^--[-A-Za-z0-9_]+$/;
const SELECTOR_RE = /^\.[-A-Za-z0-9_]+$/;
const PROP_RE = /^-?[A-Za-z][-_A-Za-z0-9]*$/;

function cssValue(value) {
  if (typeof value !== "string") throw new Error("CSS value must be a string");
  const trimmed = value.trim();
  if (!trimmed) throw new Error("CSS value cannot be empty");
  if (/[\r\n{};]/.test(trimmed)) throw new Error("CSS value contains a block delimiter");
  return trimmed;
}

function normalizeTokens(input = {}) {
  const tokens = {};
  const skipped = [];
  for (const [name, rawValue] of Object.entries(input || {})) {
    try {
      if (!TOKEN_RE.test(name)) throw new Error("invalid token name");
      tokens[name] = cssValue(rawValue);
    } catch (error) {
      skipped.push({ name, reason: error.message });
    }
  }
  return { tokens, skipped };
}

function normalizeClassOverrides(input = {}) {
  const classOverrides = {};
  const skipped = [];
  for (const [selector, declarations] of Object.entries(input || {})) {
    try {
      if (!SELECTOR_RE.test(selector)) throw new Error("invalid selector");
      const cleanDecls = {};
      for (const [prop, rawValue] of Object.entries(declarations || {})) {
        if (!PROP_RE.test(prop)) throw new Error(`invalid property ${prop}`);
        cleanDecls[prop] = cssValue(rawValue);
      }
      if (Object.keys(cleanDecls).length) classOverrides[selector] = cleanDecls;
    } catch (error) {
      skipped.push({ selector, reason: error.message });
    }
  }
  return { classOverrides, skipped };
}

function metaText(value) {
  return String(value || "")
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
}

function normalizeClassOverrideMeta(input = {}) {
  const meta = {};
  for (const [selector, declarations] of Object.entries(input || {})) {
    if (!SELECTOR_RE.test(selector)) continue;
    for (const [prop, rawMeta] of Object.entries(declarations || {})) {
      if (!PROP_RE.test(prop)) continue;
      const clean = {
        ownerLayer: metaText(rawMeta?.ownerLayer),
        ownerName: metaText(rawMeta?.ownerName),
        ownerTitle: metaText(rawMeta?.ownerTitle),
        ownerClass: metaText(rawMeta?.ownerClass),
        compositeName: metaText(rawMeta?.compositeName),
        compositeTitle: metaText(rawMeta?.compositeTitle),
        visualName: metaText(rawMeta?.visualName),
        reviewLabel: metaText(rawMeta?.reviewLabel),
        sourceFile: metaText(rawMeta?.sourceFile),
      };
      if (!Object.values(clean).some(Boolean)) continue;
      meta[selector] = meta[selector] || {};
      meta[selector][prop] = clean;
    }
  }
  return meta;
}

const REVIEW_SOURCE_FILES = new Set(["composites/composites.css", "primitives/primitives.css"]);

export function normalizeReviewSubject(input = null) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const selector = metaText(input.selector);
  const sourceFile = metaText(input.sourceFile);
  if (!SELECTOR_RE.test(selector) || !REVIEW_SOURCE_FILES.has(sourceFile)) return null;

  const className = metaText(input.className);
  const cleanClassName = /^[-A-Za-z0-9_]+$/.test(className) ? className : selector.slice(1);
  const label = metaText(input.label);
  const visualName = metaText(input.visualName);
  const rawOwner = input.owner && typeof input.owner === "object" && !Array.isArray(input.owner) ? input.owner : null;
  let owner = null;
  if (rawOwner) {
    const layer = metaText(rawOwner.layer);
    if (layer === "composite" || layer === "primitive") {
      owner = {
        layer,
        name: metaText(rawOwner.name),
        title: metaText(rawOwner.title),
      };
    }
  }

  return {
    label: label || visualName || cleanClassName,
    visualName: visualName || label || cleanClassName,
    selector,
    className: cleanClassName,
    sourceFile,
    owner,
  };
}

function mergeClassOverrides(base = {}, next = {}) {
  const merged = {};
  for (const [selector, declarations] of Object.entries(base || {})) {
    merged[selector] = { ...(declarations || {}) };
  }
  for (const [selector, declarations] of Object.entries(next || {})) {
    merged[selector] = { ...(merged[selector] || {}), ...(declarations || {}) };
  }
  return merged;
}

function mergeClassOverrideMeta(base = {}, next = {}) {
  const merged = {};
  for (const [selector, declarations] of Object.entries(base || {})) {
    merged[selector] = { ...(declarations || {}) };
  }
  for (const [selector, declarations] of Object.entries(next || {})) {
    merged[selector] = { ...(merged[selector] || {}), ...(declarations || {}) };
  }
  return merged;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseTokenDeclarations(css) {
  const values = {};
  const re = /(--[-A-Za-z0-9_]+)\s*:\s*([^;{}]+);/g;
  let match;
  while ((match = re.exec(css))) {
    if (!(match[1] in values)) values[match[1]] = match[2].trim();
  }
  return values;
}

function parseSimpleClassDeclarations(css, target = {}) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const blockRe = /([^{}]+)\{([^{}]*)\}/g;
  let block;
  while ((block = blockRe.exec(css))) {
    const selectors = block[1].split(",").map(selector => selector.trim()).filter(selector => SELECTOR_RE.test(selector));
    if (!selectors.length) continue;
    const declarations = {};
    for (const rawDecl of block[2].split(";")) {
      const idx = rawDecl.indexOf(":");
      if (idx < 0) continue;
      const prop = rawDecl.slice(0, idx).trim();
      const value = rawDecl.slice(idx + 1).trim();
      if (PROP_RE.test(prop) && value) declarations[prop] = value;
    }
    if (!Object.keys(declarations).length) continue;
    for (const selector of selectors) {
      target[selector] = { ...(target[selector] || {}), ...declarations };
    }
  }
  return target;
}

function currentDir(repoRoot) {
  return join(repoRoot, CURRENT_BUILD_ROOT, CURRENT_VERSION);
}

function snapshotDir(repoRoot, versionRoot, version) {
  return version === CURRENT_VERSION ? currentDir(repoRoot) : join(versionRoot, version);
}

export function ensureCurrentVersion(repoRoot) {
  const dir = currentDir(repoRoot);
  if (
    !existsSync(join(dir, "tokens.inline.css")) ||
    !existsSync(join(dir, "primitives.css")) ||
    !existsSync(join(dir, "composites.css")) ||
    !existsSync(join(dir, "manifest.json"))
  ) {
    writeCurrentVersion(repoRoot);
  }
  return dir;
}

function readVersionManifest(versionRoot, repoRoot, version) {
  const versionName = assertVersionName(version || CURRENT_VERSION);
  if (versionName === CURRENT_VERSION) ensureCurrentVersion(repoRoot);
  const manifestFile = join(snapshotDir(repoRoot, versionRoot, versionName), "manifest.json");
  if (!existsSync(manifestFile)) throw new Error(`version not found: ${versionName}`);
  return JSON.parse(readFileSync(manifestFile, "utf8"));
}

function readStyleSnapshot(repoRoot, versionRoot, version = CURRENT_VERSION) {
  const versionName = assertVersionName(version || CURRENT_VERSION);
  const versionDir = versionName === CURRENT_VERSION
    ? ensureCurrentVersion(repoRoot)
    : snapshotDir(repoRoot, versionRoot, versionName);
  const tokenCss = readFileSync(join(versionDir, "tokens.inline.css"), "utf8");
  const primitivePath = join(versionDir, "primitives.css");
  const primitiveCss = existsSync(primitivePath)
    ? readFileSync(primitivePath, "utf8")
    : readFileSync(join(repoRoot, "primitives", "primitives.css"), "utf8");
  const compositeCss = readFileSync(join(versionDir, "composites.css"), "utf8");
  const classDeclarations = parseSimpleClassDeclarations(primitiveCss);
  parseSimpleClassDeclarations(compositeCss, classDeclarations);
  return {
    tokenCss,
    primitiveCss,
    compositeCss,
    tokenDeclarations: parseTokenDeclarations(tokenCss),
    classDeclarations,
  };
}

function buildChangeDetails(baseManifest, baseSnapshot, incomingTokens, incomingClassOverrides, incomingClassOverrideMeta = {}) {
  const tokenChanges = [];
  for (const name of Object.keys(incomingTokens).sort()) {
    const previous = (baseManifest.tokenOverrides || {})[name] ?? baseSnapshot.tokenDeclarations[name] ?? "";
    const next = incomingTokens[name];
    if (String(previous).trim() === String(next).trim()) continue;
    tokenChanges.push({ name, previous, next });
  }

  const compositeChanges = [];
  for (const selector of Object.keys(incomingClassOverrides).sort()) {
    const declarations = incomingClassOverrides[selector] || {};
    for (const prop of Object.keys(declarations).sort()) {
      const previous = ((baseManifest.classOverrides || {})[selector] || {})[prop]
        ?? ((baseSnapshot.classDeclarations || {})[selector] || {})[prop]
        ?? "";
      const next = declarations[prop];
      if (String(previous).trim() === String(next).trim()) continue;
      const owner = incomingClassOverrideMeta[selector]?.[prop] || {};
      compositeChanges.push({ selector, prop, previous, next, owner });
    }
  }

  return {
    tokens: tokenChanges,
    composites: compositeChanges,
  };
}

function comparableCssValue(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function promotedMismatchRows(manifest, currentSnapshot) {
  const rows = [];
  for (const name of Object.keys(manifest.tokenOverrides || {}).sort()) {
    const expected = comparableCssValue(manifest.tokenOverrides[name]);
    const actual = comparableCssValue(currentSnapshot.tokenDeclarations[name]);
    if (actual !== expected) {
      rows.push({ type: "token", name, expected, actual });
    }
  }
  for (const selector of Object.keys(manifest.classOverrides || {}).sort()) {
    const declarations = manifest.classOverrides[selector] || {};
    for (const prop of Object.keys(declarations).sort()) {
      const expected = comparableCssValue(declarations[prop]);
      const actual = comparableCssValue(currentSnapshot.classDeclarations[selector]?.[prop]);
      if (actual !== expected) {
        rows.push({ type: "class", selector, prop, expected, actual });
      }
    }
  }
  return rows;
}

function formatMismatch(row) {
  if (row.type === "token") {
    return `${row.name}: expected ${row.expected || "(empty)"}, source has ${row.actual || "(missing)"}`;
  }
  return `${row.selector} ${row.prop}: expected ${row.expected || "(empty)"}, source has ${row.actual || "(missing)"}`;
}

export function applyTokenOverrides(css, changedTokens) {
  let nextCss = css;
  const appended = [];
  for (const name of Object.keys(changedTokens).sort()) {
    const value = changedTokens[name];
    const re = new RegExp(`(^[ \\t]*${escapeRegExp(name)}\\s*:\\s*)([^;]*)(;)`, "m");
    let found = false;
    nextCss = nextCss.replace(re, (_match, prefix, _oldValue, suffix) => {
      found = true;
      return `${prefix}${value}${suffix}`;
    });
    if (!found) appended.push([name, value]);
  }
  if (appended.length) {
    nextCss = `${nextCss.trimEnd()}\n\n:root {\n${appended.map(([name, value]) => `  ${name}: ${value};`).join("\n")}\n}\n`;
  }
  return `${nextCss.trimEnd()}\n`;
}

export function appendCompositeOverrides(css, classOverrides, meta = {}) {
  const selectors = Object.keys(classOverrides).sort();
  const lines = [
    "",
    "/* Prototype published overrides",
    `   Version: ${meta.version || ""}`,
    `   Source page: ${meta.page || ""}`,
    `   Published: ${meta.publishedAt || ""}`,
    "*/",
  ];
  if (!selectors.length) {
    lines.push("/* No composite class overrides in this snapshot. */");
  }
  for (const selector of selectors) {
    lines.push(`${selector} {`);
    for (const prop of Object.keys(classOverrides[selector]).sort()) {
      lines.push(`  ${prop}: ${classOverrides[selector][prop]};`);
    }
    lines.push("}", "");
  }
  return `${css.trimEnd()}\n${lines.join("\n").trimEnd()}\n`;
}

function nextVersionName(versionRoot) {
  let max = 0;
  if (existsSync(versionRoot)) {
    for (const entry of readdirSync(versionRoot, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const match = /^v(\d+)$/.exec(entry.name);
      if (match) max = Math.max(max, Number(match[1]));
    }
  }
  return `v${max + 1}`;
}

function versionSummary(entry, repoRoot = ROOT) {
  const dir = entry.dir;
  const manifestFile = join(dir, "manifest.json");
  let manifest = {};
  if (existsSync(manifestFile)) {
    try {
      manifest = JSON.parse(readFileSync(manifestFile, "utf8"));
    } catch {
      return null;
    }
  } else {
    return null;
  }
  const classOverrideDeclarations = classOverrideCount(manifest);
  const tokenOverrideCount = Object.keys(manifest.tokenOverrides || {}).length;
  const draftOverrideCount = classOverrideDeclarations + tokenOverrideCount;
  const isCurrent = entry.name === CURRENT_VERSION || Boolean(manifest.current);
  const hasPrimitiveCss = existsSync(join(dir, "primitives.css"));
  const liveSourceGit = isCurrent ? readSourceGitState(repoRoot) : null;
  const sourceGit = liveSourceGit || manifest.sourceGit || {};
  const sourceCommit = sourceGit.commit || manifest.sourceCommit || "";
  const sourceDirty = Boolean(sourceGit.dirty ?? manifest.sourceDirty);
  const hasSourceCommit = Boolean(sourceCommit);
  const releaseable = draftOverrideCount === 0 && hasSourceCommit && !sourceDirty;
  const status = isCurrent
    ? "current"
    : draftOverrideCount > 0
      ? "draft"
      : releaseable
        ? "clean"
        : "blocked";
  return {
    version: entry.name,
    kind: isCurrent ? "current" : "snapshot",
    status,
    releaseable,
    releaseBlockReason: releaseable
      ? ""
      : draftOverrideCount > 0
        ? "promote required"
        : !hasSourceCommit
          ? "source commit missing"
          : sourceDirty
            ? (isCurrent ? "current source dirty" : "source dirty at save")
            : "not releaseable",
    publishedAt: manifest.publishedAt || "",
    source: manifest.source || {},
    sourceCommit,
    sourceDirty,
    sourceGit,
    classOverrideDeclarations,
    tokenOverrideCount,
    hasPrimitiveCss,
    counts: manifest.counts || {},
  };
}

export function currentVersionSummary(repoRoot = ROOT) {
  ensureCurrentVersion(repoRoot);
  return versionSummary({ name: CURRENT_VERSION, dir: currentDir(repoRoot) }, repoRoot);
}

export function listVersions(versionRoot = VERSION_ROOT, repoRoot = ROOT) {
  const entries = [];
  if (existsSync(versionRoot)) {
    for (const entry of readdirSync(versionRoot, { withFileTypes: true })) {
      if (entry.isDirectory() && /^v\d+$/.test(entry.name)) {
        entries.push({ name: entry.name, dir: join(versionRoot, entry.name) });
      }
    }
  }
  return entries
    .map(entry => versionSummary(entry, repoRoot))
    .filter(Boolean)
    .sort((a, b) => Number(a.version.slice(1)) - Number(b.version.slice(1)));
}

export function readReleaseInfo(releaseRoot = RELEASE_ROOT) {
  const manifestFile = join(releaseRoot, "manifest.json");
  if (!existsSync(manifestFile)) return { version: "", releasedAt: "" };
  try {
    const manifest = JSON.parse(readFileSync(manifestFile, "utf8"));
    const version = manifest.release?.version || manifest.version || "";
    if (!/^v\d+$/.test(version)) return { version: "", releasedAt: "" };
    return {
      version,
      releasedAt: manifest.releasedAt || "",
    };
  } catch {
    return { version: "", releasedAt: "" };
  }
}

export function markReleasedVersions(versions, releaseInfo = readReleaseInfo()) {
  const releasedVersion = releaseInfo.version || "";
  return (versions || []).map(version => {
    const released = Boolean(releasedVersion && version.version === releasedVersion);
    return {
      ...version,
      released,
      releasedAt: released ? (releaseInfo.releasedAt || "") : "",
    };
  });
}

export function publishSnapshot(payload, options = {}) {
  const repoRoot = options.repoRoot || ROOT;
  const versionRoot = options.versionRoot || VERSION_ROOT;
  const baseVersion = assertVersionName(payload.baseVersion || CURRENT_VERSION);
  const baseManifest = readVersionManifest(versionRoot, repoRoot, baseVersion);
  const baseSnapshot = readStyleSnapshot(repoRoot, versionRoot, baseVersion);
  const { tokens: incomingTokens, skipped: skippedTokens } = normalizeTokens(payload.tokens || {});
  const { classOverrides: incomingClassOverrides, skipped: skippedClassOverrides } = normalizeClassOverrides(payload.classOverrides || {});
  const incomingClassOverrideMeta = normalizeClassOverrideMeta(payload.classOverrideMeta || {});
  const { tokens } = normalizeTokens({ ...(baseManifest.tokenOverrides || {}), ...incomingTokens });
  const { classOverrides } = normalizeClassOverrides(
    mergeClassOverrides(baseManifest.classOverrides || {}, incomingClassOverrides),
  );
  const classOverrideMeta = mergeClassOverrideMeta(baseManifest.classOverrideMeta || {}, incomingClassOverrideMeta);
  const changes = buildChangeDetails(baseManifest, baseSnapshot, incomingTokens, incomingClassOverrides, incomingClassOverrideMeta);
  const reviewSubject = normalizeReviewSubject(payload.reviewSubject) || normalizeReviewSubject(baseManifest.reviewSubject);
  const version = options.version || nextVersionName(versionRoot);
  const publishedAt = payload.publishedAt || new Date().toISOString();
  const outDir = join(versionRoot, version);
  const sourceGit = readSourceGitState(repoRoot);

  mkdirSync(outDir, { recursive: true });

  const tokenCss = applyTokenOverrides(baseSnapshot.tokenCss, tokens);
  const compositeCss = appendCompositeOverrides(
    baseSnapshot.compositeCss,
    classOverrides,
    { version, page: payload.page, publishedAt },
  );

  writeFileSync(join(outDir, "tokens.inline.css"), tokenCss, "utf8");
  writeFileSync(join(outDir, "primitives.css"), baseSnapshot.primitiveCss, "utf8");
  writeFileSync(join(outDir, "composites.css"), compositeCss, "utf8");

  const manifest = {
    version,
    baseVersion,
    publishedAt,
    source: {
      page: payload.page || "",
      title: payload.title || "",
      href: payload.href || "",
    },
    counts: {
      tokens: Object.keys(tokens).length,
      compositeDeclarations: Object.values(classOverrides).reduce((sum, decls) => sum + Object.keys(decls).length, 0),
      selectors: Object.keys(classOverrides).length,
      elementPaths: Object.keys(payload.elementOverrides || {}).length,
    },
    changedTokens: Object.keys(tokens).sort(),
    reviewSubject,
    tokenOverrides: tokens,
    classOverrides,
    classOverrideMeta,
    changes,
    elementOverrides: payload.elementOverrides || {},
    conflicts: payload.conflicts || [],
    skipped: {
      tokens: skippedTokens,
      classOverrides: skippedClassOverrides,
    },
    sourceCommit: sourceGit.commit || "",
    sourceDirty: Boolean(sourceGit.dirty),
    sourceGit,
  };
  writeFileSync(join(outDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  return {
    version,
    dir: outDir,
    relativeDir: relative(repoRoot, outDir).replace(/\\/g, "/"),
    files: ["tokens.inline.css", "primitives.css", "composites.css", "manifest.json"],
    counts: manifest.counts,
    changes,
    sourceCommit: manifest.sourceCommit,
    sourceDirty: manifest.sourceDirty,
  };
}

export function finalizePromotedVersion(version, options = {}) {
  const repoRoot = options.repoRoot || ROOT;
  const versionRoot = options.versionRoot || VERSION_ROOT;
  const sourceVersion = assertVersionName(version);
  if (sourceVersion === CURRENT_VERSION) throw new Error("cannot finalize current source as a saved version");

  const draftManifest = readVersionManifest(versionRoot, repoRoot, sourceVersion);
  const tokenOverrideCount = Object.keys(draftManifest.tokenOverrides || {}).length;
  const classOverrideDeclarations = classOverrideCount(draftManifest);
  if (!tokenOverrideCount && !classOverrideDeclarations) {
    throw new Error(`version ${sourceVersion} has no draft overrides to finalize`);
  }

  const sourceGit = readSourceGitState(repoRoot);
  if (!sourceGit.commit) throw new Error("current source has no Git commit; commit promoted source before generating a clean version.");
  if (sourceGit.dirty) {
    const paths = sourceGit.dirtyPaths.length ? ` (${sourceGit.dirtyPaths.join(", ")})` : "";
    throw new Error(`promoted source is still dirty${paths}. Commit governed source before generating a clean version.`);
  }

  writeCurrentVersion(repoRoot);
  const currentSnapshot = readStyleSnapshot(repoRoot, versionRoot, CURRENT_VERSION);
  const mismatches = promotedMismatchRows(draftManifest, currentSnapshot);
  if (mismatches.length) {
    throw new Error(
      `version ${sourceVersion} is not fully promoted into source: ` +
        mismatches.slice(0, 4).map(formatMismatch).join("; ") +
        (mismatches.length > 4 ? `; +${mismatches.length - 4} more` : ""),
    );
  }

  const cleanVersion = sourceVersion;
  const publishedAt = new Date().toISOString();
  const outDir = join(versionRoot, cleanVersion);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "tokens.inline.css"), currentSnapshot.tokenCss, "utf8");
  writeFileSync(join(outDir, "primitives.css"), currentSnapshot.primitiveCss, "utf8");
  writeFileSync(join(outDir, "composites.css"), currentSnapshot.compositeCss, "utf8");

  const manifest = {
    version: cleanVersion,
    baseVersion: draftManifest.baseVersion || "",
    finalizedFromDraft: sourceVersion,
    finalizedAt: publishedAt,
    publishedAt,
    source: draftManifest.source || {},
    counts: {
      tokens: 0,
      compositeDeclarations: 0,
      selectors: 0,
      elementPaths: 0,
      promotedTokens: tokenOverrideCount,
      promotedCompositeDeclarations: classOverrideDeclarations,
    },
    changedTokens: [],
    tokenOverrides: {},
    classOverrides: {},
    classOverrideMeta: {},
    changes: {
      tokens: [],
      composites: [],
    },
    promotedChanges: draftManifest.changes || { tokens: [], composites: [] },
    elementOverrides: {},
    conflicts: [],
    skipped: {
      tokens: [],
      classOverrides: [],
    },
    sourceCommit: sourceGit.commit || "",
    sourceDirty: false,
    sourceGit,
  };
  writeFileSync(join(outDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  return {
    version: cleanVersion,
    finalizedFromDraft: sourceVersion,
    dir: outDir,
    relativeDir: relative(repoRoot, outDir).replace(/\\/g, "/"),
    files: ["tokens.inline.css", "primitives.css", "composites.css", "manifest.json"],
    sourceCommit: manifest.sourceCommit,
    sourceDirty: manifest.sourceDirty,
  };
}

export function createPromotionBrief(version, options = {}) {
  const repoRoot = options.repoRoot || ROOT;
  const versionRoot = options.versionRoot || VERSION_ROOT;
  const sourceVersion = assertVersionName(version);
  if (sourceVersion === CURRENT_VERSION) throw new Error("current source does not need a promote brief");
  const manifest = readVersionManifest(versionRoot, repoRoot, sourceVersion);
  const tokenOverrideCount = Object.keys(manifest.tokenOverrides || {}).length;
  const classOverrideDeclarations = classOverrideCount(manifest);
  if (!tokenOverrideCount && !classOverrideDeclarations) {
    throw new Error(`version ${sourceVersion} has no draft overrides to promote`);
  }

  const script = join(repoRoot, "scripts", "promote-version.mjs");
  const run = spawnSync(process.execPath, [script, sourceVersion], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  if (run.status !== 0) {
    const detail = (run.stderr || run.stdout || "").trim();
    throw new Error(detail || `failed to generate promote brief for ${sourceVersion}`);
  }

  const briefPath = join(repoRoot, "versions", sourceVersion, "promote.md");
  if (!existsSync(briefPath)) throw new Error(`promote brief was not written for ${sourceVersion}`);
  return {
    version: sourceVersion,
    briefPath,
    relativeBriefPath: relative(repoRoot, briefPath).replace(/\\/g, "/"),
    command: `pnpm promote -- ${sourceVersion}`,
    output: (run.stdout || "").trim(),
    tokenOverrideCount,
    classOverrideDeclarations,
  };
}

function assertVersionName(version) {
  if (version === CURRENT_VERSION || /^v\d+$/.test(version || "")) return version;
  throw new Error("invalid version");
}

function classOverrideCount(manifest) {
  return Object.values(manifest.classOverrides || {}).reduce((sum, declarations) => {
    return sum + Object.keys(declarations || {}).length;
  }, 0);
}

function assertReleaseableManifest(version, manifest) {
  const tokenCount = Object.keys(manifest.tokenOverrides || {}).length;
  const classCount = classOverrideCount(manifest);
  const count = tokenCount + classCount;
  if (!count) return;
  throw new Error(
    `version ${version} contains ${count} unpromoted override${count === 1 ? "" : "s"} ` +
      `(${tokenCount} token, ${classCount} class). ` +
      `Run \`node scripts/promote-version.mjs ${version}\`, promote the changes into source CSS/docs, ` +
      "then rebuild before publishing release.",
  );
}

function copyReleaseFiles(repoRoot, outDir, versionDir, manifest) {
  const catalog = emitCatalog(repoRoot);
  writeFileSync(join(outDir, "catalog.json"), `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
  writeFileSync(join(outDir, "catalog.md"), emitCatalogMarkdown(catalog), "utf8");
  copyFileSync(join(versionDir, "tokens.inline.css"), join(outDir, "tokens.inline.css"));
  copyFileSync(join(versionDir, "composites.css"), join(outDir, "composites.css"));

  const tokenJson = applyTokenJsonOverrides(
    emitTokensJson(repoRoot),
    manifest.tokenOverrides || {},
  );
  writeFileSync(join(outDir, "tokens.json"), `${JSON.stringify(tokenJson, null, 2)}\n`, "utf8");
}

function resetReleaseDir(releaseRoot) {
  const dir = resolve(releaseRoot);
  if (basename(dir) !== "release") throw new Error(`refusing to clear non-release directory: ${dir}`);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}

function restoreVersionSourceForRelease(repoRoot, versionName, manifest) {
  const sourceGit = assertVersionSourceRestorable(versionName, manifest);
  const restored = restoreGovernedSource(repoRoot, sourceGit.commit);
  writeCurrentVersion(repoRoot, { sourceGit });
  return {
    applied: true,
    ...restored,
  };
}

export function releaseSnapshot(version, options = {}) {
  const repoRoot = options.repoRoot || ROOT;
  const versionRoot = options.versionRoot || VERSION_ROOT;
  const releaseRoot = options.releaseRoot || RELEASE_ROOT;
  const versionName = assertVersionName(version || CURRENT_VERSION);
  if (versionName === CURRENT_VERSION) ensureCurrentVersion(repoRoot);
  const versionDir = snapshotDir(repoRoot, versionRoot, versionName);
  if (!existsSync(versionDir)) throw new Error(`version not found: ${versionName}`);

  const manifestFile = join(versionDir, "manifest.json");
  const manifest = existsSync(manifestFile) ? JSON.parse(readFileSync(manifestFile, "utf8")) : { version: versionName };
  assertReleaseableManifest(versionName, manifest);
  let releaseSourceGit = manifest.sourceGit || {};
  const sourceRestore = versionName === CURRENT_VERSION
    ? (() => {
        const sourceGit = readSourceGitState(repoRoot);
        releaseSourceGit = sourceGit;
        if (!sourceGit.commit) throw new Error("current source has no Git commit; commit source before release.");
        if (sourceGit.dirty) {
          const paths = sourceGit.dirtyPaths.length ? ` (${sourceGit.dirtyPaths.join(", ")})` : "";
          throw new Error(`current source is dirty${paths}. Commit or discard source edits before release.`);
        }
        writeCurrentVersion(repoRoot);
        return { applied: false, reason: "current source already live", commit: sourceGit.commit, shortCommit: sourceGit.shortCommit };
      })()
    : options.restoreSource === false
      ? { applied: false, reason: "disabled" }
      : restoreVersionSourceForRelease(repoRoot, versionName, manifest);
  const outDir = releaseRoot;
  resetReleaseDir(outDir);
  copyReleaseFiles(repoRoot, outDir, versionDir, manifest);

  const releaseManifest = {
    ...manifest,
    sourceCommit: versionName === CURRENT_VERSION ? releaseSourceGit.commit || "" : manifest.sourceCommit,
    sourceDirty: versionName === CURRENT_VERSION ? Boolean(releaseSourceGit.dirty) : Boolean(manifest.sourceDirty),
    sourceGit: versionName === CURRENT_VERSION ? releaseSourceGit : manifest.sourceGit,
    releasedAt: new Date().toISOString(),
    release: {
      version: versionName,
      structure: RELEASE_STRUCTURE,
    },
    sourceRestore,
  };
  writeFileSync(join(outDir, "manifest.json"), `${JSON.stringify(releaseManifest, null, 2)}\n`, "utf8");

  return {
    version: versionName,
    dir: outDir,
    relativeDir: relative(repoRoot, outDir).replace(/\\/g, "/"),
    files: releaseManifest.release.structure,
    sourceRestore,
  };
}
