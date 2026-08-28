import assert from "node:assert/strict";
import { describe, test } from "node:test";

import {
  BASE_RELEASE_VERSION,
  validateReleaseVersionParity,
} from "../../scripts/release-version.ts";
import type { ReleaseVersionCoordinates } from "../../scripts/release-version.ts";

function coordinates(
  pluginManifest: string = BASE_RELEASE_VERSION,
): ReleaseVersionCoordinates {
  return {
    bridgeExtensionManifest: BASE_RELEASE_VERSION,
    bridgePackageManifest: BASE_RELEASE_VERSION,
    controlVersion: BASE_RELEASE_VERSION,
    packageLockRoot: BASE_RELEASE_VERSION,
    packageLockTopLevel: BASE_RELEASE_VERSION,
    packageManifest: BASE_RELEASE_VERSION,
    pluginManifest,
    reviewedBundle: BASE_RELEASE_VERSION,
    reviewedSourceTree: BASE_RELEASE_VERSION,
  };
}

void describe("release version parity", () => {
  void test("accepts the bare release version and one numeric Codex cachebuster", () => {
    assert.equal(validateReleaseVersionParity(coordinates()).ok, true);
    assert.equal(
      validateReleaseVersionParity(
        coordinates("0.3.0+codex.20260828133742"),
      ).ok,
      true,
    );
  });

  void test("rejects non-Codex, nonnumeric, or repeated cachebusters", () => {
    for (const version of [
      "0.3.0+local.1",
      "0.3.0+codex.release",
      "0.3.0+codex.1+codex.2",
      "0.3.1",
    ]) {
      const result = validateReleaseVersionParity(coordinates(version));
      assert.equal(result.ok, false);
      assert.deepEqual(result.mismatches, ["pluginManifest"]);
    }
  });

  void test("can require a numeric Codex cachebuster after release stamping", () => {
    const bare = validateReleaseVersionParity(coordinates(), {
      requirePluginCachebuster: true,
    });
    assert.equal(bare.ok, false);
    assert.deepEqual(bare.mismatches, ["pluginManifest"]);
    assert.equal(
      validateReleaseVersionParity(
        coordinates("0.3.0+codex.20260828133742"),
        { requirePluginCachebuster: true },
      ).ok,
      true,
    );
  });

  void test("rejects drift in every base-version coordinate", () => {
    const baseline = coordinates();
    for (const name of Object.keys(baseline)) {
      if (name !== "pluginManifest") {
        const drifted = { ...baseline, [name]: "0.2.0" };
        const result = validateReleaseVersionParity(drifted);
        assert.equal(result.ok, false);
        assert.deepEqual(result.mismatches, [name]);
      }
    }
  });
});
