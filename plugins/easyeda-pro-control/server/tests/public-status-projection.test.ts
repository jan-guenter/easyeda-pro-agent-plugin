import assert from "node:assert/strict";
import { test } from "node:test";
import type { ControlImplementationFingerprint } from "../src/core.ts";
import { projectPublicEngineStatus } from "../src/public-status-projection.ts";

function fixture(): ControlImplementationFingerprint {
  return { version: "0.3.0", operationSchema: "easyeda-pro-control.operation.v2", mode: "source-tree", sha256: "a".repeat(64),
    files: Array.from({ length: 900 }, (_, index) => {
      const relativePath = `server/src/${"long-file".repeat(10)}-${String(index)}.ts`;
      return { relativePath, path: `/installed/cache/easyeda-pro-agent-plugin/plugins/easyeda-pro-control/${relativePath}`,
        bytes: index + 1, sha256: "b".repeat(64) };
    }) };
}
void test("public status keeps one complete admission fingerprint within the existing response cap", () => {
  const facadeImplementation = fixture(), stableFingerprint = { facadeImplementation, upstreamImplementationDrift: true };
  const mismatch = { expected: "original", actual: "different" };
  const status = { facadeImplementation, stableFingerprint, upstreamLauncherState: { drift: true, mismatch },
    health: { error: { message: "retained probe failure" } } };
  const fingerprintBytes = JSON.stringify(stableFingerprint), original = JSON.stringify(status);
  assert.ok(Buffer.byteLength(original) > 512 * 1024);
  const projected = projectPublicEngineStatus(status);
  assert.ok(Buffer.byteLength(JSON.stringify(projected)) < 512 * 1024);
  assert.equal(projected.stableFingerprint, stableFingerprint);
  assert.equal(JSON.stringify(projected.stableFingerprint), fingerprintBytes);
  assert.equal(projected.upstreamLauncherState, status.upstreamLauncherState);
  assert.equal(projected.health, status.health); assert.equal(JSON.stringify(status), original);
  assert.deepEqual(projected.facadeImplementation, { schema: "easyeda-pro-control.implementation-summary.v1",
    version: facadeImplementation.version, operationSchema: facadeImplementation.operationSchema, mode: "source-tree",
    sha256: facadeImplementation.sha256, fileCount: 900, totalBytes: 405_450,
    filesPointer: "/upstream/stableFingerprint/facadeImplementation/files" });
});
void test("public status refuses distinct inventories even when aggregate hashes match", () => {
  const facadeImplementation = fixture();
  const changed = structuredClone(facadeImplementation);
  const file = changed.files[0]; assert.ok(file); file.sha256 = "c".repeat(64);
  assert.throws(() => projectPublicEngineStatus({ facadeImplementation, stableFingerprint: { facadeImplementation: changed } }), /original fingerprint/u);
  assert.equal(facadeImplementation.files[0]?.sha256, "b".repeat(64));
});
