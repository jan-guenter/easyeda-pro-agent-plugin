import assert from "node:assert/strict";
import { test } from "node:test";
import { apiRequestSchema, queryOfflineApi } from "../src/offline-api.ts";
import { nativeRuntimeReleaseRequestSchema, nativeRuntimeReleaseResultSchema } from "../src/native-runtime-release.ts";

void test("native release discovery admits no historical ownership and validates the exact cleanup grammar", () => {
  const discovery = queryOfflineApi(apiRequestSchema.parse({ action: "native-release", query: { includeSchemas: true } })).result;
  assert.ok(typeof discovery === "object" && discovery !== null && "executionAuthorized" in discovery);
  assert.equal(discovery.executionAuthorized, false);
  const request = { action: "release-completed", kind: "pcb-rename", operationId: "original-release-example", confirmReleaseOriginalRuntime: true };
  for (const [value, valid] of [[request, true], [{ ...request, pid: 12_345 }, false],
    [{ ...request, confirmReleaseOriginalRuntime: false }, false],
    [{ action: "settle-release-records", kind: "symbol-copy", operationId: "original-release-example" }, true]] as const) {
    const result = queryOfflineApi(apiRequestSchema.parse({ action: "native-release-validate", query: { request: value } })).result;
    assert.ok(typeof result === "object" && result !== null && "valid" in result);
    assert.equal(result.valid, valid);
  }
  assert.equal(nativeRuntimeReleaseRequestSchema.safeParse({ ...request, force: true }).success, false);
});

void test("native release result requires acknowledged helper and index disposal while preserving final operation identity", () => {
  const artifact = { path: "/private/original-release.json", sha256: "a".repeat(64), bytes: 1024 };
  const result = { schema: "easyeda-pro-control.native-runtime-release-result.v1", requestedOperationId: "original-operation",
    kind: "symbol-metadata", disposal: { profile: "easyeda-pro-control.original-terminal-runtime-disposal.v1",
      operationId: "original-operation-inverse", family: "symbol-metadata", intentArtifact: artifact, releaseArtifact: artifact,
      helperReleaseAcknowledged: true, indexAllocationReleased: true, executionAuthorized: false, replayAllowed: false } };
  assert.equal(nativeRuntimeReleaseResultSchema.safeParse(result).success, true);
  assert.equal(nativeRuntimeReleaseResultSchema.safeParse({ ...result, disposal: { ...result.disposal, helperReleaseAcknowledged: false } }).success, false);
  assert.equal(nativeRuntimeReleaseResultSchema.safeParse({ ...result, disposal: { ...result.disposal, indexAllocationReleased: false } }).success, false);
  assert.equal(nativeRuntimeReleaseResultSchema.safeParse({ ...result, kind: "pcb-rename" }).success, false);
});
