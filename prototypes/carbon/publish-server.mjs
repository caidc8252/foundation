import { createServer } from "node:http";
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
  emitCatalog,
  emitCatalogMarkdown,
  emitTokensJson,
  RELEASE_STRUCTURE,
  writeBaseVersion,
} from "../../emit/build.mjs";
import {
  assertVersionSourceRestorable,
  readSourceGitState,
  restoreGovernedSource,
} from "../../scripts/source-git.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "..", "..");
const VERSION_ROOT = join(ROOT, "versions");
const RELEASE_ROOT = join(ROOT, "release");
const DEFAULT_PORT = 4177;
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

const TOKEN_RE = /^--[-A-Za-z0-9_]+$/;
const SELECTOR_RE = /^\.[-A-Za-z0-9_]+$/;
const PROP_RE = /^-?[A-Za-z][-_A-Za-z0-9]*$/;

const json = (res, obj, status = 200) => {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "content-type",
  });
  res.end(JSON.stringify(obj));
};

function readJson(req) {
  return new Promise((resolveJson, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", chunk => {
      size += chunk.length;
      if (size > 1024 * 1024) {
        req.destroy(new Error("request body too large"));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        resolveJson(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

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
      };
      if (!Object.values(clean).some(Boolean)) continue;
      meta[selector] = meta[selector] || {};
      meta[selector][prop] = clean;
    }
  }
  return meta;
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

function ensureBaseVersion(repoRoot) {
  const baseDir = join(repoRoot, "versions", "v1");
  if (
    !existsSync(join(baseDir, "tokens.inline.css")) ||
    !existsSync(join(baseDir, "composites.css")) ||
    !existsSync(join(baseDir, "manifest.json"))
  ) {
    writeBaseVersion(repoRoot);
  }
  return baseDir;
}

function readBaseStyleSnapshot(repoRoot) {
  const baseDir = ensureBaseVersion(repoRoot);
  const tokenCss = readFileSync(join(baseDir, "tokens.inline.css"), "utf8");
  const primitiveCss = readFileSync(join(repoRoot, "primitives", "primitives.css"), "utf8");
  const compositeCss = readFileSync(join(baseDir, "composites.css"), "utf8");
  const classDeclarations = parseSimpleClassDeclarations(primitiveCss);
  parseSimpleClassDeclarations(compositeCss, classDeclarations);
  return {
    tokenCss,
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

function listVersions(versionRoot = VERSION_ROOT) {
  if (!existsSync(versionRoot)) return [];
  return readdirSync(versionRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && /^v\d+$/.test(entry.name))
    .map(entry => {
      const dir = join(versionRoot, entry.name);
      const manifestFile = join(dir, "manifest.json");
      let manifest = {};
      if (existsSync(manifestFile)) {
        try {
          manifest = JSON.parse(readFileSync(manifestFile, "utf8"));
        } catch {
          manifest = {};
        }
      }
      return {
        version: entry.name,
        publishedAt: manifest.publishedAt || "",
        source: manifest.source || {},
        sourceCommit: manifest.sourceCommit || manifest.sourceGit?.commit || "",
        sourceDirty: Boolean(manifest.sourceDirty || manifest.sourceGit?.dirty),
        sourceGit: manifest.sourceGit || {},
        counts: manifest.counts || {},
      };
    })
    .sort((a, b) => Number(a.version.slice(1)) - Number(b.version.slice(1)));
}

export function publishSnapshot(payload, options = {}) {
  const repoRoot = options.repoRoot || ROOT;
  const versionRoot = options.versionRoot || VERSION_ROOT;
  const baseVersion = payload.baseVersion && assertVersionName(payload.baseVersion);
  let baseManifest = {};
  if (baseVersion) {
    const baseManifestFile = join(versionRoot, baseVersion, "manifest.json");
    if (!existsSync(baseManifestFile)) throw new Error(`base version not found: ${baseVersion}`);
    baseManifest = JSON.parse(readFileSync(baseManifestFile, "utf8"));
  }
  const baseSnapshot = readBaseStyleSnapshot(repoRoot);
  const { tokens: incomingTokens, skipped: skippedTokens } = normalizeTokens(payload.tokens || {});
  const { classOverrides: incomingClassOverrides, skipped: skippedClassOverrides } = normalizeClassOverrides(payload.classOverrides || {});
  const incomingClassOverrideMeta = normalizeClassOverrideMeta(payload.classOverrideMeta || {});
  const { tokens } = normalizeTokens({ ...(baseManifest.tokenOverrides || {}), ...incomingTokens });
  const { classOverrides } = normalizeClassOverrides(
    mergeClassOverrides(baseManifest.classOverrides || {}, incomingClassOverrides),
  );
  const classOverrideMeta = mergeClassOverrideMeta(baseManifest.classOverrideMeta || {}, incomingClassOverrideMeta);
  const changes = buildChangeDetails(baseManifest, baseSnapshot, incomingTokens, incomingClassOverrides, incomingClassOverrideMeta);
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
  writeFileSync(join(outDir, "composites.css"), compositeCss, "utf8");

  const manifest = {
    version,
    baseVersion: baseVersion || "",
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
    files: ["tokens.inline.css", "composites.css", "manifest.json"],
    counts: manifest.counts,
    changes,
    sourceCommit: manifest.sourceCommit,
    sourceDirty: manifest.sourceDirty,
  };
}

function assertVersionName(version) {
  if (!/^v\d+$/.test(version || "")) throw new Error("invalid version");
  return version;
}

function classOverrideCount(manifest) {
  return Object.values(manifest.classOverrides || {}).reduce((sum, declarations) => {
    return sum + Object.keys(declarations || {}).length;
  }, 0);
}

function assertReleaseableManifest(version, manifest) {
  const count = classOverrideCount(manifest);
  if (!count) return;
  throw new Error(
    `version ${version} contains ${count} unpromoted class override${count === 1 ? "" : "s"}. ` +
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
  writeBaseVersion(repoRoot, { sourceGit });
  return {
    applied: true,
    ...restored,
  };
}

export function releaseSnapshot(version, options = {}) {
  const repoRoot = options.repoRoot || ROOT;
  const versionRoot = options.versionRoot || VERSION_ROOT;
  const releaseRoot = options.releaseRoot || RELEASE_ROOT;
  const versionName = assertVersionName(version || listVersions(versionRoot).at(-1)?.version);
  const versionDir = join(versionRoot, versionName);
  if (!existsSync(versionDir)) throw new Error(`version not found: ${versionName}`);

  const manifestFile = join(versionDir, "manifest.json");
  const manifest = existsSync(manifestFile) ? JSON.parse(readFileSync(manifestFile, "utf8")) : { version: versionName };
  assertReleaseableManifest(versionName, manifest);
  const sourceRestore = options.restoreSource === false
    ? { applied: false, reason: "disabled" }
    : restoreVersionSourceForRelease(repoRoot, versionName, manifest);
  const outDir = releaseRoot;
  resetReleaseDir(outDir);
  copyReleaseFiles(repoRoot, outDir, versionDir, manifest);

  const releaseManifest = {
    ...manifest,
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

function serveStatic(url, res) {
  const pathname = decodeURIComponent(url.pathname);
  if (pathname.startsWith("/versions/")) return serveRootAsset(pathname, "/versions/", VERSION_ROOT, res);
  if (pathname.startsWith("/release/")) return serveRootAsset(pathname, "/release/", RELEASE_ROOT, res);
  const rel = pathname === "/" ? "app-publish-list.html" : pathname.replace(/^\/+/, "");
  const file = resolve(HERE, rel);
  if (!(file === HERE || file.startsWith(HERE + sep)) || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("404");
    return;
  }
  res.writeHead(200, {
    "content-type": MIME[extname(file)] || "application/octet-stream",
    "cache-control": "no-store",
  });
  res.end(readFileSync(file));
}

function serveRootAsset(pathname, prefix, root, res) {
  const rel = pathname.slice(prefix.length);
  const file = resolve(root, rel);
  if (!(file === root || file.startsWith(root + sep)) || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("404");
    return;
  }
  res.writeHead(200, {
    "content-type": MIME[extname(file)] || "application/octet-stream",
    "cache-control": "no-store",
  });
  res.end(readFileSync(file));
}

export function createHandler() {
  return async (req, res) => {
    const url = new URL(req.url, "http://localhost");
    try {
      if (url.pathname === "/__prototype_versions" && req.method === "GET") {
        ensureBaseVersion(ROOT);
        const versions = listVersions();
        return json(res, { ok: true, versions, latest: versions.at(-1)?.version || "" });
      }
      if ((url.pathname === "/__prototype_save" || url.pathname === "/__prototype_publish") && req.method === "POST") {
        const payload = await readJson(req);
        return json(res, { ok: true, ...publishSnapshot(payload) });
      }
      if (url.pathname === "/__prototype_release" && req.method === "POST") {
        const payload = await readJson(req);
        return json(res, { ok: true, ...releaseSnapshot(payload.version) });
      }
      if (url.pathname.startsWith("/__prototype_") && req.method === "OPTIONS") {
        res.writeHead(204, {
          "access-control-allow-origin": "*",
          "access-control-allow-headers": "content-type",
          "access-control-allow-methods": "GET, POST, OPTIONS",
        });
        return res.end();
      }
      return serveStatic(url, res);
    } catch (error) {
      return json(res, { ok: false, error: error.message }, 400);
    }
  };
}

export function start(port = DEFAULT_PORT) {
  return createServer(createHandler()).listen(port, () => {
    console.log(`carbon prototype -> http://localhost:${port}`);
  });
}

if (process.argv[1] && process.argv[1].endsWith("publish-server.mjs")) {
  start(Number(process.env.PORT) || DEFAULT_PORT);
}
