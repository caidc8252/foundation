import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { markReleasedVersions, normalizeReviewDraft, normalizeReviewSubject, readReleaseInfo } from "./publish-server.mjs";

test("readReleaseInfo reads the currently published version from release manifest", () => {
  const dir = mkdtempSync(join(tmpdir(), "foundation-release-"));
  try {
    writeFileSync(
      join(dir, "manifest.json"),
      `${JSON.stringify(
        {
          version: "v1",
          releasedAt: "2026-06-30T00:51:34.649Z",
          release: {
            version: "v3",
          },
        },
        null,
        2,
      )}\n`,
      "utf8",
    );

    assert.deepEqual(readReleaseInfo(dir), {
      version: "v3",
      releasedAt: "2026-06-30T00:51:34.649Z",
    });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("markReleasedVersions marks only the version currently in release", () => {
  const versions = markReleasedVersions(
    [
      { version: "v1", status: "clean" },
      { version: "v2", status: "clean" },
    ],
    {
      version: "v2",
      releasedAt: "2026-06-30T00:51:34.649Z",
    },
  );

  assert.equal(versions[0].released, false);
  assert.equal(versions[0].releasedAt, "");
  assert.equal(versions[1].released, true);
  assert.equal(versions[1].releasedAt, "2026-06-30T00:51:34.649Z");
});

test("normalizeReviewSubject keeps only safe visible review target fields", () => {
  assert.deepEqual(
    normalizeReviewSubject({
      label: "客户列表里的表格",
      visualName: "表格",
      selector: ".data-table",
      className: "data-table",
      sourceFile: "composites/composites.css",
      owner: {
        layer: "composite",
        name: "data-table",
        title: "Data table",
        injected: "drop me",
      },
      injected: "drop me",
    }),
    {
      label: "客户列表里的表格",
      visualName: "表格",
      selector: ".data-table",
      className: "data-table",
      sourceFile: "composites/composites.css",
      owner: {
        layer: "composite",
        name: "data-table",
        title: "Data table",
      },
    },
  );

  assert.equal(normalizeReviewSubject({ selector: "body", sourceFile: "release/composites.css" }), null);
});

test("normalizeReviewDraft converts exported review packages into publish payloads", () => {
  assert.deepEqual(
    normalizeReviewDraft({
      kind: "foundation-prototype-review-draft",
      schemaVersion: 1,
      exportedAt: "2026-07-01T00:00:00.000Z",
      page: { file: "customer-list.html", title: "Customers", href: "https://example.test/customer-list.html" },
      baseVersion: "current",
      reviewSubject: {
        label: "按钮",
        visualName: "按钮",
        selector: ".btn",
        className: "btn",
        sourceFile: "primitives/primitives.css",
      },
      tokenOverrides: { "--space-2": "10px" },
      classOverrides: { ".btn": { "border-radius": "var(--radius-lg)" } },
      classOverrideMeta: {
        ".btn": {
          "border-radius": {
            visualName: "按钮",
            sourceFile: "primitives/primitives.css",
            ignored: "drop me",
          },
        },
      },
      conflicts: [{ selector: ".btn", prop: "color" }],
      ignored: "drop me",
    }),
    {
      page: "customer-list.html",
      href: "https://example.test/customer-list.html",
      title: "Customers",
      publishedAt: "2026-07-01T00:00:00.000Z",
      baseVersion: "current",
      reviewSubject: {
        label: "按钮",
        visualName: "按钮",
        selector: ".btn",
        className: "btn",
        sourceFile: "primitives/primitives.css",
        owner: null,
      },
      tokens: { "--space-2": "10px" },
      classOverrides: { ".btn": { "border-radius": "var(--radius-lg)" } },
      classOverrideMeta: {
        ".btn": {
          "border-radius": {
            ownerLayer: "",
            ownerName: "",
            ownerTitle: "",
            ownerClass: "",
            compositeName: "",
            compositeTitle: "",
            visualName: "按钮",
            reviewLabel: "",
            sourceFile: "primitives/primitives.css",
          },
        },
      },
      elementOverrides: {},
      conflicts: [{ selector: ".btn", prop: "color" }],
    },
  );

  assert.equal(normalizeReviewDraft({ kind: "unknown" }), null);
});
