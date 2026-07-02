#!/usr/bin/env node
/* ─────────────────────────────────────────────────────────────
   Foundation · icon CLI

   The author's way to use an icon WITHOUT hand-writing SVG or guessing a name.
   Icons are inline Lucide SVGs (self-contained — CSP blocks any external icon
   font/sprite/CDN). Pick by meaning, paste the exact markup.

     node scripts/icon/icon.mjs search <english intent>   # find a name by meaning
     node scripts/icon/icon.mjs get <name>                # print the exact <svg> to paste
     node scripts/icon/icon.mjs list <substring>          # names containing <substring>

   Tags are English (Lucide's own) — translate a non-English need to an English
   word first ("删除" → "delete"). Every icon prints with `data-lucide` first.
   ───────────────────────────────────────────────────────────── */
import { ICON_NAMES, VERSION, buildSvg, hasIcon, searchIcons, tagsFor } from "./registry.mjs";

const [cmd, ...rest] = process.argv.slice(2);

const usage = () => {
  console.log(`icon CLI · ${ICON_NAMES.length} icons · ${VERSION}

  search <english intent>   find a name by meaning (Lucide tags, English)
  get <name>                print the exact inline <svg> to paste
  list <substring>          names containing <substring>

Tags are English — translate the intent first (e.g. "删除" → "delete").`);
};

const fail = (msg) => {
  console.error(msg);
  process.exit(1);
};

if (!cmd || cmd === "--help" || cmd === "-h" || cmd === "help") {
  usage();
  process.exit(cmd ? 0 : 2);
}

if (cmd === "get") {
  const name = rest[0];
  if (!name) fail("usage: icon.mjs get <name>");
  if (!hasIcon(name)) {
    const near = searchIcons(name.replace(/-/g, " "), 8).map((x) => x.name);
    fail(
      `✗ "${name}" is not a Lucide icon (${VERSION}).` +
        (near.length ? `\n  did you mean: ${near.join(", ")}` : "") +
        `\n  search by meaning: node scripts/icon/icon.mjs search <english intent>`,
    );
  }
  console.log(buildSvg(name));
} else if (cmd === "search") {
  const q = rest.join(" ").trim();
  if (!q) fail("usage: icon.mjs search <english intent>");
  const hits = searchIcons(q);
  if (!hits.length) {
    fail(`no icon matched "${q}". Try a different English word (tags are English).`);
  }
  for (const h of hits) {
    console.log(`${h.name.padEnd(28)} ${h.tags.slice(0, 8).join(", ")}`);
  }
} else if (cmd === "list") {
  const sub = (rest[0] ?? "").toLowerCase();
  const hits = ICON_NAMES.filter((n) => n.includes(sub));
  if (!hits.length) fail(`no icon name contains "${sub}".`);
  for (const n of hits) console.log(`${n.padEnd(28)} ${tagsFor(n).slice(0, 6).join(", ")}`);
  console.log(`\n${hits.length} icon(s).`);
} else {
  fail(`unknown command: ${cmd}\n`);
}
