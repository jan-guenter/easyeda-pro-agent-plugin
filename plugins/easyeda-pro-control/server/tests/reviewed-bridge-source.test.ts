import assert from "node:assert/strict";
import { chmod, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, test } from "node:test";

import {
  REVIEWED_BRIDGE_SOURCE,
  assertStagedVendoredSourceUnchanged,
  prepareStagedVendoredSourceRemoval,
  stageSealedReviewedVendoredSource,
} from "../../scripts/reviewed-bridge-source.ts";
import { AUTHENTICATED_BRIDGE_REVIEWED_SOURCE_IDENTITY } from "../src/authenticated-bridge-build-identity.ts";

const pluginRoot = resolve(import.meta.dirname, "../..");
const vendoredBridgeRoot = join(pluginRoot, "easyeda-bridge-extension");
const temporaryDirectories: string[] = [];

async function temporaryDirectory(): Promise<string> {
  const path = await mkdtemp(join(tmpdir(), "easyeda-reviewed-bridge-test-"));
  temporaryDirectories.push(path);
  return path;
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map(async (path) => {
      await prepareStagedVendoredSourceRemoval(
        join(path, "reviewed-source"),
      );
      await rm(path, { recursive: true, force: true });
    }),
  );
});

void describe("reviewed bridge build snapshot", () => {
  void test("keeps runtime bridge admission bound to the reviewed source closure", () => {
    assert.deepEqual(AUTHENTICATED_BRIDGE_REVIEWED_SOURCE_IDENTITY, {
      closureSha256: REVIEWED_BRIDGE_SOURCE.closureSha256,
      commit: REVIEWED_BRIDGE_SOURCE.commit,
      fileCount: REVIEWED_BRIDGE_SOURCE.fileCount,
      repository: REVIEWED_BRIDGE_SOURCE.repository,
      totalBytes: REVIEWED_BRIDGE_SOURCE.totalBytes,
      upstreamTreeSha1: REVIEWED_BRIDGE_SOURCE.upstreamTreeSha1,
    });
  });

  void test("seals the private tree and detects an attempted source mutation", async () => {
    const directory = await temporaryDirectory();
    const stagedRoot = join(directory, "reviewed-source");
    const snapshot = await stageSealedReviewedVendoredSource(
      vendoredBridgeRoot,
      stagedRoot,
    );
    const readmePath = join(stagedRoot, "README.md");
    const stagedRootInformation = await stat(stagedRoot);
    const readmeInformation = await stat(readmePath);
    assert.equal(stagedRootInformation.mode % 512, 0o500);
    assert.equal(readmeInformation.mode % 512, 0o400);

    const original = await readFile(readmePath, "utf8");
    try {
      await writeFile(readmePath, `${original}\nattempted mutation\n`, "utf8");
    } catch (error) {
      assert.ok(error instanceof Error);
      assert.ok("code" in error);
      assert.ok(["EACCES", "EPERM", "EROFS"].includes(String(error.code)));
      await chmod(readmePath, 0o600);
      await writeFile(readmePath, `${original}\nattempted mutation\n`, "utf8");
      await chmod(readmePath, 0o400);
    }
    await assert.rejects(
      assertStagedVendoredSourceUnchanged(stagedRoot, snapshot),
      /changed|differs from reviewed upstream commit/iu,
    );
    await prepareStagedVendoredSourceRemoval(stagedRoot);
  });

  void test("detects chmod-and-restore metadata tampering with unchanged bytes", async () => {
    const directory = await temporaryDirectory();
    const stagedRoot = join(directory, "reviewed-source");
    const snapshot = await stageSealedReviewedVendoredSource(
      vendoredBridgeRoot,
      stagedRoot,
    );
    const readmePath = join(stagedRoot, "README.md");
    await chmod(readmePath, 0o600);
    await chmod(readmePath, 0o400);
    await assert.rejects(
      assertStagedVendoredSourceUnchanged(stagedRoot, snapshot),
      /identity or metadata changed/iu,
    );
    await prepareStagedVendoredSourceRemoval(stagedRoot);
  });
});
