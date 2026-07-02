import { spawnSync } from "node:child_process";

export const GOVERNED_SOURCE_PATHS = Object.freeze([
  "tokens",
  "primitives",
  "composites",
  "patterns",
  "governance",
]);

function git(root, args, options = {}) {
  const result = spawnSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (!options.allowFailure && result.status !== 0) {
    const detail = (result.stderr || result.stdout || "").trim();
    throw new Error(detail || `git ${args.join(" ")} failed`);
  }
  return result;
}

function parseStatusLines(stdout) {
  return stdout
    .split("\n")
    .map((line) => line.trimEnd())
    .filter(Boolean);
}

export function readSourceGitState(root) {
  const head = git(root, ["rev-parse", "--verify", "HEAD"], { allowFailure: true });
  if (head.status !== 0) {
    return {
      available: false,
      commit: "",
      shortCommit: "",
      dirty: false,
      dirtyPaths: [],
      restorePaths: [...GOVERNED_SOURCE_PATHS],
      error: (head.stderr || head.stdout || "git HEAD not available").trim(),
    };
  }

  const commit = head.stdout.trim();
  const status = git(root, [
    "status",
    "--porcelain=v1",
    "--untracked-files=all",
    "--",
    ...GOVERNED_SOURCE_PATHS,
  ]);
  const dirtyPaths = parseStatusLines(status.stdout);
  return {
    available: true,
    commit,
    shortCommit: commit.slice(0, 12),
    dirty: dirtyPaths.length > 0,
    dirtyPaths,
    restorePaths: [...GOVERNED_SOURCE_PATHS],
  };
}

export function sourceGitFromManifest(manifest = {}) {
  const sourceGit = manifest.sourceGit || {};
  const commit = sourceGit.commit || manifest.sourceCommit || "";
  return {
    available: sourceGit.available !== false && Boolean(commit),
    commit,
    shortCommit: sourceGit.shortCommit || commit.slice(0, 12),
    dirty: Boolean(sourceGit.dirty ?? manifest.sourceDirty),
    dirtyPaths: Array.isArray(sourceGit.dirtyPaths) ? sourceGit.dirtyPaths : [],
    restorePaths: Array.isArray(sourceGit.restorePaths) && sourceGit.restorePaths.length
      ? sourceGit.restorePaths
      : [...GOVERNED_SOURCE_PATHS],
  };
}

export function assertVersionSourceRestorable(version, manifest = {}) {
  const sourceGit = sourceGitFromManifest(manifest);
  if (!sourceGit.commit) {
    throw new Error(
      `version ${version} has no sourceCommit. Save the version with the Git-aware publisher before source restore.`,
    );
  }
  if (sourceGit.dirty) {
    const paths = sourceGit.dirtyPaths.length ? ` (${sourceGit.dirtyPaths.join(", ")})` : "";
    throw new Error(
      `version ${version} was saved while governed source was dirty${paths}. ` +
        "Commit or discard source edits before saving a restorable version.",
    );
  }
  return sourceGit;
}

export function restoreGovernedSource(root, commit) {
  if (!commit) throw new Error("source commit is required");
  git(root, ["rev-parse", "--verify", `${commit}^{commit}`]);
  const before = readSourceGitState(root);
  git(root, ["restore", "--source", commit, "--", ...GOVERNED_SOURCE_PATHS]);
  const after = readSourceGitState(root);
  return {
    commit,
    shortCommit: commit.slice(0, 12),
    paths: [...GOVERNED_SOURCE_PATHS],
    beforeDirtyPaths: before.dirtyPaths,
    afterDirtyPaths: after.dirtyPaths,
  };
}
