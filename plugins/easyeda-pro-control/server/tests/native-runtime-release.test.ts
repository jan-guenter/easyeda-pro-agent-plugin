import assert from "node:assert/strict";
import { test } from "node:test";
import { apiRequestSchema, queryOfflineApi } from "../src/offline-api.ts";
import { nativeRuntimeReleaseRequestSchema, nativeRuntimeReleaseResultSchema } from "../src/native-runtime-release.ts";
import { currentSymbolBaselineRequestSchema } from "../src/current-symbol-baseline-runtime.ts";

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

void test("release schemas retain each family producer grammar for requested and final disposal IDs", () => {
  const artifact = { path: "/private/original-release.json", sha256: "a".repeat(64), bytes: 1024 };
  for (const kind of ["project-opening", "pcb-rename", "schematic-rename", "symbol-metadata", "symbol-copy"] as const) {
    const symbol = kind === "symbol-metadata" || kind === "symbol-copy";
    for (const operationId of ["Upper.Copy:Baseline_1", "A", "A".repeat(160), "lowercase-original", "a".repeat(96),
      "", "A".repeat(161), "../escape", "original/escape", String.raw`original\escape`, "original with space", "original-ä"]) {
      const baseline = currentSymbolBaselineRequestSchema.shape.operationId.safeParse(operationId).success;
      const valid = symbol ? baseline : operationId === "lowercase-original" || operationId === "a".repeat(96);
      for (const request of [{ action: "release-completed", kind, operationId, confirmReleaseOriginalRuntime: true },
        { action: "settle-release-records", kind, operationId }]) {
        assert.equal(nativeRuntimeReleaseRequestSchema.safeParse(request).success, valid, `${kind}: ${operationId}`);
      }
      const result = { schema: "easyeda-pro-control.native-runtime-release-result.v1", requestedOperationId: operationId, kind,
        disposal: { profile: "easyeda-pro-control.original-terminal-runtime-disposal.v1", operationId, family: kind,
          intentArtifact: artifact, releaseArtifact: artifact, helperReleaseAcknowledged: true,
          indexAllocationReleased: true, executionAuthorized: false, replayAllowed: false } };
      assert.equal(nativeRuntimeReleaseResultSchema.safeParse(result).success, valid, `${kind} result: ${operationId}`);
      assert.equal(nativeRuntimeReleaseResultSchema.safeParse({ ...result, requestedOperationId: "lowercase-original" }).success, valid);
      assert.equal(nativeRuntimeReleaseResultSchema.safeParse({ ...result, disposal: { ...result.disposal, operationId: "lowercase-original" } }).success, valid);
    }
  }
});
