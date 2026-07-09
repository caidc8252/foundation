// scripts/prototype-design/lib/marker-coverage.mjs
//
// Guard against the "input-group" class of bug: a registry component whose CSS has
// NO own `/* @component <name> */` marker in the foundation source CSS. build-netshell
// slices CSS by marker, so a markerless component's rules physically live inside
// whichever marker's block precedes them ("the host"). If the host's tier is HIGHER
// than the component's own registry tier, a shell built at the component's tier gets
// zero CSS for it while the cheatsheet at that tier still tells the writer to use its
// classes → silent unstyled render. That's an ERROR. If the host's tier is ≤ the
// component's own tier, the host is always selected whenever the component is
// (tiers are cumulative), so it's safe → WARN (visibility only, not blocking).
//
// Uses the SAME marker regex as foundation's build-netshell.mjs (single name,
// `/* @component <name> */`) so "has its own marker" here matches what the real
// slicer actually recognizes — a multi-name marker line (e.g. the foundation
// `date-picker date-range-picker date-time-picker` line) does NOT count as any of
// those names' own marker, exactly like the real slicer fails to match it either.

const MARK = /\/\*\s*@component\s+([a-z0-9-]+)\s*\*\//gi;

function findMarkers(css) {
  const out = [];
  const re = new RegExp(MARK.source, MARK.flags);
  let m;
  while ((m = re.exec(css)) !== null) out.push({ name: m[1], start: m.index });
  return out; // ordered by position (regex walks forward)
}

// Blank out comment contents (keep length/offsets stable) so a selector-shaped
// mention inside a comment (this codebase comments heavily, e.g. "compose with
// .label") doesn't get mistaken for the real CSS rule.
function maskComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, (m) => ' '.repeat(m.length));
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// First occurrence of a selector *rule* for `.<name>` (own base class, BEM element,
// or modifier) outside comments — anchored at line-start (allowing leading
// whitespace/combinators like `,`) so a merely descendant/compound mention such as
// `.command__input-wrapper .input-group {` doesn't get mistaken for the component's
// own defining rule.
function findSelectorOffset(maskedCss, name) {
  const re = new RegExp(`^[\\s,]*\\.${escapeRegex(name)}(?:__|--|(?![a-zA-Z0-9_-]))`, 'm');
  const m = maskedCss.match(re);
  return m ? m.index : -1;
}

// Marker whose segment (its start → the next marker's start) contains `offset`.
function segmentFor(markers, offset) {
  let seg = null;
  for (const mk of markers) {
    if (mk.start <= offset) seg = mk;
    else break;
  }
  return seg;
}

/**
 * @param {object} args
 * @param {string[]} args.selected - component names selected for one tier (e.g. componentsForTier(...)).
 * @param {{name:string, kind:'primitive'|'composite', tier:number}[]} args.registry - full parsed registry.
 * @param {string} args.primitivesCss - source primitives/primitives.css text.
 * @param {string} args.compositesCss - source composites/composites.css text.
 * @returns {{ok: string[], errors: {name:string, host:string, hostTier:number}[], warns: {name:string, host:string|null}[]}}
 */
export function markerCoverage({ selected, registry, primitivesCss, compositesCss }) {
  const byName = new Map(registry.map((c) => [c.name, c]));
  const primMarkers = findMarkers(primitivesCss);
  const compMarkers = findMarkers(compositesCss);
  const primNames = new Set(primMarkers.map((m) => m.name));
  const compNames = new Set(compMarkers.map((m) => m.name));
  const primMasked = maskComments(primitivesCss);
  const compMasked = maskComments(compositesCss);

  const ok = [];
  const errors = [];
  const warns = [];

  for (const name of selected) {
    const entry = byName.get(name);
    if (!entry) continue; // not this check's concern (unknown-to-registry is a different validation)

    const isComposite = entry.kind === 'composite';
    const markers = isComposite ? compMarkers : primMarkers;
    const hasOwnMarker = (isComposite ? compNames : primNames).has(name);

    if (hasOwnMarker) {
      ok.push(name);
      continue;
    }

    // Markerless: resolve host = the marker segment whose block contains this
    // component's selector.
    const masked = isComposite ? compMasked : primMasked;
    const offset = findSelectorOffset(masked, name);
    const hostMarker = offset === -1 ? null : segmentFor(markers, offset);

    if (!hostMarker) {
      // No distinct selector found anywhere (e.g. a variant that reuses another
      // component's classes wholesale) — host truly unresolvable. Can't prove a
      // break, so don't block; surface for visibility.
      warns.push({ name, host: null });
      continue;
    }

    const hostEntry = byName.get(hostMarker.name);
    const hostTier = hostEntry ? hostEntry.tier : null;

    if (hostTier != null && hostTier > entry.tier) {
      errors.push({ name, host: hostMarker.name, hostTier });
    } else {
      warns.push({ name, host: hostMarker.name });
    }
  }

  return { ok, errors, warns };
}
