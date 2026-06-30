#!/usr/bin/env node
/* ---------------------------------------------------------------------------
   Foundation · prototype version promotion brief

   Reads a saved prototype version manifest and writes a concise handoff brief
   for an Agent to promote editor overrides back into the governed source files.

   Usage:
     node scripts/promote-version.mjs v3
     node scripts/promote-version.mjs v3 --stdout
     node scripts/promote-version.mjs v3 --out /tmp/promote.md
   --------------------------------------------------------------------------- */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function usage() {
  console.error("Usage: node scripts/promote-version.mjs <vN> [--stdout] [--out <file>]");
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
  let stdout = false;
  let out = "";
  while (args.length) {
    const arg = args.shift();
    if (arg === "--stdout") {
      stdout = true;
    } else if (arg === "--out") {
      out = args.shift() || "";
      if (!out) usage();
    } else {
      usage();
    }
  }
  return { version, stdout, out };
}

function readManifest(version) {
  const manifestPath = join(root, "versions", version, "manifest.json");
  if (!existsSync(manifestPath)) {
    throw new Error(`version manifest not found: ${relative(root, manifestPath)}`);
  }
  return {
    path: manifestPath,
    manifest: JSON.parse(readFileSync(manifestPath, "utf8")),
  };
}

function countDeclarations(classOverrides = {}) {
  return Object.values(classOverrides || {}).reduce((sum, declarations) => {
    return sum + Object.keys(declarations || {}).length;
  }, 0);
}

function metaFor(manifest, selector, prop) {
  return manifest.classOverrideMeta?.[selector]?.[prop] || {};
}

function classOverrideRows(manifest) {
  const rows = [];
  const seen = new Set();
  for (const change of manifest.changes?.composites || []) {
    const selector = change.selector || "";
    const prop = change.prop || "";
    if (!selector || !prop) continue;
    rows.push({
      selector,
      prop,
      previous: change.previous ?? "",
      next: change.next ?? "",
      owner: change.owner || metaFor(manifest, selector, prop),
    });
    seen.add(`${selector}\n${prop}`);
  }

  for (const selector of Object.keys(manifest.classOverrides || {}).sort()) {
    const declarations = manifest.classOverrides[selector] || {};
    for (const prop of Object.keys(declarations).sort()) {
      if (seen.has(`${selector}\n${prop}`)) continue;
      rows.push({
        selector,
        prop,
        previous: "",
        next: declarations[prop],
        owner: metaFor(manifest, selector, prop),
      });
    }
  }
  return rows;
}

function tokenRows(manifest) {
  const rows = [];
  const seen = new Set();
  for (const change of manifest.changes?.tokens || []) {
    const name = change.name || "";
    if (!name) continue;
    rows.push({
      name,
      previous: change.previous ?? "",
      next: change.next ?? "",
    });
    seen.add(name);
  }
  for (const name of Object.keys(manifest.tokenOverrides || {}).sort()) {
    if (seen.has(name)) continue;
    rows.push({ name, previous: "", next: manifest.tokenOverrides[name] });
  }
  return rows;
}

function ownerKind(owner = {}) {
  if (owner.ownerLayer === "primitive" && owner.ownerName) return "primitive";
  if (owner.ownerLayer === "composite" && owner.ownerName) return "composite";
  if (owner.compositeName) return "composite";
  return "unknown";
}

function ownerName(owner = {}) {
  if (owner.ownerLayer === "primitive" && owner.ownerName) return owner.ownerName;
  if (owner.ownerLayer === "composite" && owner.ownerName) return owner.ownerName;
  return owner.compositeName || "unknown";
}

function groupClassRows(rows) {
  const groups = new Map();
  for (const row of rows) {
    const kind = ownerKind(row.owner);
    const name = ownerName(row.owner);
    const key = `${kind}:${name}`;
    if (!groups.has(key)) groups.set(key, { kind, name, rows: [] });
    groups.get(key).rows.push(row);
  }
  return [...groups.values()].sort((a, b) => {
    if (a.kind !== b.kind) return a.kind < b.kind ? -1 : 1;
    return a.name < b.name ? -1 : 1;
  });
}

function sourceFilesFor(group) {
  if (group.kind === "primitive") {
    return [
      `primitives/${group.name}.md`,
      `primitives/${group.name}.html`,
      "primitives/primitives.css",
    ];
  }
  if (group.kind === "composite") {
    return [
      `composites/${group.name}.md`,
      `composites/${group.name}.html`,
      "composites/composites.css",
    ];
  }
  return [
    "release/catalog.json",
    "primitives/primitives.css",
    "composites/composites.css",
  ];
}

function formatValue(value) {
  return value === "" ? "_unknown_" : `\`${String(value).replace(/`/g, "\\`")}\``;
}

function formatOwner(owner = {}) {
  const parts = [];
  if (owner.ownerLayer && owner.ownerName) parts.push(`${owner.ownerLayer} \`${owner.ownerName}\``);
  if (owner.ownerClass) parts.push(`class \`${owner.ownerClass}\``);
  if (owner.compositeName && owner.compositeName !== owner.ownerName) {
    parts.push(`context composite \`${owner.compositeName}\``);
  }
  return parts.length ? parts.join(" · ") : "unknown owner; inspect `release/catalog.json`";
}

function renderBrief(version, manifestPath, manifest) {
  const classRows = classOverrideRows(manifest);
  const tokens = tokenRows(manifest);
  const groups = groupClassRows(classRows);
  const sourceCommit = manifest.sourceCommit || manifest.sourceGit?.commit || "";
  const sourceDirty = Boolean(manifest.sourceDirty || manifest.sourceGit?.dirty);
  const lines = [
    `# Promote prototype version ${version} to foundation source`,
    "",
    `Generated by \`node scripts/promote-version.mjs ${version}\`.`,
    "",
    "This file is an Agent handoff brief. The prototype editor saved a visual snapshot;",
    "`release/` must not publish these overrides until the governed source",
    "CSS, contracts, and examples agree with the intended design change.",
    "",
    "## Version",
    "",
    `- manifest: \`${relative(root, manifestPath).replace(/\\/g, "/")}\``,
    `- source page: \`${manifest.source?.page || ""}\``,
    `- title: ${manifest.source?.title || "_unknown_"}`,
    `- saved at: \`${manifest.publishedAt || ""}\``,
    `- source commit: ${sourceCommit ? `\`${sourceCommit}\`` : "_not recorded_"}`,
    `- source dirty at save: ${sourceDirty ? "**yes**" : "no"}`,
    `- token overrides: ${tokens.length}`,
    `- class override declarations: ${countDeclarations(manifest.classOverrides)}`,
    "",
    "## Agent task",
    "",
    "1. Read the version manifest and the source files listed below.",
    "2. Decide whether each change is a valid foundation-source change or a semantic mismatch.",
    "3. If valid, update the source CSS first, then update the matching `.md` contract and `.html` example.",
    "4. If a change alters meaning, update the contract language instead of only changing token names.",
    "5. If a change looks wrong, stop and explain the concern instead of forcing it into source.",
    "6. Run `pnpm build` after source edits so `release/` and `build/current/` are regenerated.",
    "7. Stage the promoted source files plus regenerated `release/` / `build/current/` snapshots, then run `pnpm check:all`.",
    "8. Create the promotion PR yourself: make a promotion branch, commit only the promoted source and regenerated snapshots, push it, run `gh pr create`, and report the PR URL. Do not ask the requester to open the PR manually, and do not commit directly to the requester's current branch unless they explicitly ask.",
    `9. After the PR lands, turn this draft into a clean saved snapshot with \`pnpm finalize -- ${version}\`; publish ${version} after it becomes clean.`,
    "",
    "Do not hand-edit `release/`, `build/current/`, or generated catalog files as the source of the change.",
    "",
    "If promotion edits the wrong source files and `source dirty at save` is `no`, restore",
    "the governed source paths from this version's recorded Git commit with",
    `\`node scripts/restore-version-source.mjs ${version} --build\`.`,
    "",
  ];

  if (groups.length) {
    lines.push("## Class overrides to promote", "");
    for (const group of groups) {
      const label = group.kind === "unknown" ? "Unknown owner" : `${group.kind} ${group.name}`;
      lines.push(`### ${label}`, "");
      lines.push("Source files to inspect/update:");
      for (const file of sourceFilesFor(group)) lines.push(`- \`${file}\``);
      lines.push("");
      for (const row of group.rows) {
        lines.push(`- \`${row.selector}\` · \`${row.prop}\``);
        lines.push(`  - previous: ${formatValue(row.previous)}`);
        lines.push(`  - next: ${formatValue(row.next)}`);
        lines.push(`  - owner: ${formatOwner(row.owner)}`);
      }
      lines.push("");
    }
  } else {
    lines.push("## Class overrides to promote", "", "No class overrides were found in this version.", "");
  }

  if (tokens.length) {
    lines.push("## Token overrides to review", "");
    lines.push("Token value changes affect every consumer that references the token. Promote them");
    lines.push("by editing `tokens/*.css`, then run `pnpm build`.");
    lines.push("");
    for (const row of tokens) {
      lines.push(`- \`${row.name}\``);
      lines.push(`  - previous: ${formatValue(row.previous)}`);
      lines.push(`  - next: ${formatValue(row.next)}`);
    }
    lines.push("");
  }

  lines.push("## Release gate", "");
  if (classRows.length || tokens.length) {
    lines.push(
      "`release` is blocked while this version still contains `manifest.tokenOverrides` or `manifest.classOverrides`.",
      "After the source files are updated, rebuilt, validated, and merged through the Agent-created PR,",
      `run \`pnpm finalize -- ${version}\` and publish ${version} after it becomes clean.`,
    );
  } else {
    lines.push("This version has no token or class overrides, so the release gate will not block it.");
  }
  lines.push("");

  return `${lines.join("\n").trimEnd()}\n`;
}

try {
  const { version, stdout, out } = parseArgs(process.argv.slice(2));
  const { path: manifestPath, manifest } = readManifest(version);
  const brief = renderBrief(version, manifestPath, manifest);
  if (stdout) {
    process.stdout.write(brief);
  } else {
    const outPath = out ? resolve(out) : join(root, "versions", version, "promote.md");
    writeFileSync(outPath, brief, "utf8");
    console.log(`foundation: wrote ${relative(root, outPath).replace(/\\/g, "/")}`);
  }
} catch (error) {
  console.error(`✗ ${error.message}`);
  process.exit(1);
}
