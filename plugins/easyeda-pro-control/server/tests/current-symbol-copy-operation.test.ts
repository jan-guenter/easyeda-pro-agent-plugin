import assert from "node:assert/strict";
import { test } from "node:test";
import { apiRequestSchema, queryOfflineApi } from "../src/offline-api.ts";
import { currentSymbolOperationRequestSchema } from "../src/current-symbol-operation.ts";
import { currentSymbolCopyOperationRequestSchema, currentSymbolCopyOperationStepSchema,
  queryCurrentSymbolCopyOperation, validateCurrentSymbolCopyOperationArguments } from "../src/current-symbol-copy-operation.ts";

const openingOperationId = "disposable-copy-opening", operationId = "disposable-copy-schema";
const source = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), symbolUuid: "c".repeat(16) };
const begin = { action: "baseline-begin", operationId, openingOperationId, source,
  confirmDisposableProject: true, confirmNormalClose: true, acceptUnknownFileEffects: true };
const write = { expectedPhase: "copy-write", confirmWrite: true, acceptSymbolCopy: true, confirmDisposableProject: true };
const steps: readonly Record<string, unknown>[] = [write,
  ...["copy-close", "verification-close", "cleanup-close"].map(expectedPhase => ({ expectedPhase, confirmNormalClose: true, acceptUnknownFileEffects: true })),
  ...["verification-start", "verification-open"].map(expectedPhase => ({ expectedPhase, acceptNormalOpenEffects: true })),
  ...["copy-observe-termination", "verification-admit", "verification-caches", "verification-read", "verification-finish", "cleanup-observe-termination"].map(expectedPhase => ({ expectedPhase })),
];

void test("copy contract binds disposable source only and exact twelve forward/cleanup phases", () => {
  assert.deepEqual(currentSymbolCopyOperationRequestSchema.parse(begin), begin);
  assert.equal(steps.length, 12);
  for (const step of steps) {
    assert.deepEqual(currentSymbolCopyOperationStepSchema.parse(step), step);
    assert.equal(currentSymbolCopyOperationRequestSchema.safeParse({ action: "copy-advance", operationId, step }).success, true);
    for (const [key, value] of Object.entries(step)) {
      if (value === true) {
        const missing = Object.fromEntries(Object.entries(step).filter(([name]) => name !== key));
        assert.equal(currentSymbolCopyOperationStepSchema.safeParse(missing).success, false);
        assert.equal(currentSymbolCopyOperationStepSchema.safeParse({ ...step, [key]: "true" }).success, false);
      }
    }
  }
  assert.equal(currentSymbolCopyOperationRequestSchema.safeParse({ ...begin, openingOperationId: operationId }).success, false);
  assert.equal(currentSymbolCopyOperationRequestSchema.safeParse({ ...begin, confirmDisposableProject: false }).success, false);
  assert.equal(currentSymbolCopyOperationRequestSchema.safeParse({ ...begin, source: { ...source, ownerUuid: "d".repeat(32) } }).success, false);
});

void test("copy parsing refuses normal opening, metadata patches, replay inputs and inverse/delete", () => {
  for (const extra of [{ destinationUuid: "d".repeat(16) }, { name: "Replacement" }, { patch: { name: "Replacement" } },
    { checkpoint: "/caller/path" }, { expectedFingerprint: {} }, { code: "clone()" }, { purpose: "ordinary-symbol-metadata" }]) {
    assert.equal(currentSymbolCopyOperationRequestSchema.safeParse({ ...begin, ...extra }).success, false);
  }
  for (const action of ["open", "metadata-begin", "inverse-prepare", "delete"]) {
    assert.equal(currentSymbolCopyOperationRequestSchema.safeParse({ action, operationId }).success, false);
  }
  for (const expectedPhase of ["forward-write", "inverse-write", "delete", "verification-read"]) {
    assert.equal(currentSymbolCopyOperationStepSchema.safeParse({ ...write, expectedPhase }).success, false);
  }
  assert.equal(currentSymbolOperationRequestSchema.safeParse(begin).success, false);
  assert.equal(currentSymbolOperationRequestSchema.safeParse({ action: "metadata-advance", operationId, step: write }).success, false);
});

void test("offline copy discovery separates historical validation from current execution authority", () => {
  const discovery = queryCurrentSymbolCopyOperation({ includeSchemas: true });
  assert.equal(discovery["tool"], "easyeda_control_disposable_symbol_copy");
  assert.equal(discovery["connectedValidation"], false); assert.equal(discovery["ordinaryProjectsSupported"], false);
  assert.equal(discovery["historicalConnectedValidation"], "installed094000-disposable-supported-drawn-symbol-copy");
  assert.equal(discovery["executionAuthorized"], false); assert.equal(discovery["invocationEnabledByDiscovery"], false);
  assert.notEqual(discovery["inputSchema"], undefined); assert.notEqual(discovery["stepSchema"], undefined);
  assert.deepEqual(queryOfflineApi(apiRequestSchema.parse({ action: "disposable-symbol-copy", query: { includeSchemas: true } })).result, discovery);
  assert.deepEqual(queryOfflineApi(apiRequestSchema.parse({ action: "disposable-symbol-copy-validate", query: { request: begin } })).result,
    validateCurrentSymbolCopyOperationArguments(begin));
});
