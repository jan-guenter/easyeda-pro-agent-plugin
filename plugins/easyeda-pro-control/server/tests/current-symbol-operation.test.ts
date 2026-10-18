import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Text } from "../src/core.ts";
import { apiRequestSchema, queryOfflineApi } from "../src/offline-api.ts";
import { CURRENT_SYMBOL_OPERATION_PURPOSE, currentSymbolOperationRequestSchema, currentSymbolOperationStepSchema,
  parseCurrentSymbolOperationRequest, queryCurrentSymbolOperation, validateCurrentSymbolOperationArguments } from "../src/current-symbol-operation.ts";

const openingOperationId = "ordinary-opening-schema", operationId = "ordinary-symbol-schema";
const rawWindowsPath = String.raw`C:\Synthetic\Metadata.eprj2`;
const target = { rawWindowsPath, projectUuid: sha256Text(rawWindowsPath), documentUuid: "a".repeat(16), expectedSourceSha256: "b".repeat(64) };
const preparation = { checkpoint: { path: "/synthetic/metadata.eprj2", bytes: 4096, sha256: "c".repeat(64) },
  target: { projectUuid: target.projectUuid, branchUuid: "d".repeat(32), ownerUuid: "e".repeat(32), symbolUuid: "f".repeat(16) },
  patch: { name: "Synthetic ordinary name", description: "" } };
const opening = { action: "open", operationId: openingOperationId, ...target, acceptNormalOpenEffects: true };
const baseline = { action: "baseline-begin", operationId, openingOperationId, preparation, confirmNormalClose: true, acceptNormalOpenEffects: true };
const steps = [
  { expectedPhase: "forward-write", confirmWrite: true, acceptMetadataMutation: true },
  { expectedPhase: "forward-close", confirmNormalClose: true, acceptUnknownFileEffects: true },
  { expectedPhase: "forward-observe-termination" },
  { expectedPhase: "forward-verification-start", acceptNormalOpenEffects: true },
  { expectedPhase: "forward-verification-admit" },
  { expectedPhase: "forward-verification-caches" },
  { expectedPhase: "forward-verification-open", acceptNormalOpenEffects: true },
  { expectedPhase: "forward-verification-read" },
  { expectedPhase: "forward-verification-close", confirmNormalClose: true, acceptUnknownFileEffects: true },
  { expectedPhase: "forward-verification-finish" },
  { expectedPhase: "cleanup-close", confirmNormalClose: true, acceptUnknownFileEffects: true },
  { expectedPhase: "cleanup-observe-termination" },
];
const requests = [opening, baseline,
  ...["observe", "inspect", "baseline-observe-termination", "baseline-admit", "baseline-observe-caches", "baseline-observe-clock",
    "baseline-observe-finish", "baseline-inspect", "metadata-inspect"].map((action) => ({ action, operationId })),
  { action: "request-normal-close", operationId, confirmNormalClose: true, acceptUnknownFileEffects: true },
  { action: "retire-after-termination", operationId, confirmRetire: true, acceptUnknownFileEffects: true },
  { action: "baseline-prepare-clock", operationId, acceptScratchProcessEffects: true },
  ...["baseline-relaunch", "baseline-open-project"].map((action) => ({ action, operationId, acceptNormalOpenEffects: true })),
  { action: "baseline-finish-close", operationId, confirmNormalClose: true, acceptUnknownFileEffects: true },
  { action: "metadata-begin", operationId, confirmWrite: true },
  ...steps.map((step) => ({ action: "metadata-advance", operationId, step })),
];

void test("ordinary contract preserves all opening/baseline actions and exactly twelve forward or cleanup phases", () => {
  assert.equal(CURRENT_SYMBOL_OPERATION_PURPOSE, "ordinary-symbol-metadata");
  assert.equal(new Set(requests.map((request) => request.action)).size, 19);
  assert.equal(new Set(steps.map((step) => step.expectedPhase)).size, 12);
  for (const request of requests) {
    assert.deepEqual(parseCurrentSymbolOperationRequest(request), request);
    assert.deepEqual(validateCurrentSymbolOperationArguments(request), { valid: true, request, registrationEnabled: true, executionAuthorized: false });
  }
  for (const step of steps) { assert.deepEqual(currentSymbolOperationStepSchema.parse(step), step); }
});

void test("ordinary contract requires every stage acknowledgement without coercion or unrelated permissions", () => {
  for (const request of requests) {
    for (const [key] of Object.entries(request).filter(([, value]) => value === true)) {
      const missing = Object.fromEntries(Object.entries(request).filter(([name]) => name !== key));
      assert.equal(currentSymbolOperationRequestSchema.safeParse(missing).success, false);
      for (const replacement of [false, "true", 1, null]) {
        assert.equal(currentSymbolOperationRequestSchema.safeParse({ ...request, [key]: replacement }).success, false);
      }
    }
  }
  for (const step of steps) {
    for (const key of Object.keys(step)) {
      const missing = Object.fromEntries(Object.entries(step).filter(([name]) => name !== key));
      assert.equal(currentSymbolOperationStepSchema.safeParse(missing).success, false);
    }
    for (const [key, value] of Object.entries(step)) {
      if (value === true) { assert.equal(currentSymbolOperationStepSchema.safeParse({ ...step, [key]: false }).success, false); }
    }
  }
  assert.equal(currentSymbolOperationStepSchema.safeParse({ expectedPhase: "forward-verification-read", confirmWrite: true }).success, false);
});

void test("ordinary contract rejects every inverse and disposable-only request or startup acceptance", () => {
  for (const expectedPhase of ["inverse-prepare", "inverse-relaunch", "inverse-admit", "inverse-caches", "inverse-open", "inverse-clock", "inverse-write",
    "inverse-close", "inverse-observe-termination", "inverse-verification-start", "inverse-verification-admit", "inverse-verification-caches",
    "inverse-verification-open", "inverse-verification-read", "inverse-verification-close", "inverse-verification-finish"]) {
    assert.equal(currentSymbolOperationStepSchema.safeParse({ expectedPhase }).success, false);
    assert.equal(currentSymbolOperationRequestSchema.safeParse({ action: "metadata-advance", operationId, step: { expectedPhase } }).success, false);
  }
  for (const request of requests) {
    assert.equal(currentSymbolOperationRequestSchema.safeParse({ ...request, confirmDisposableProject: true }).success, false);
    assert.equal(currentSymbolOperationRequestSchema.safeParse({ ...request, acceptUnqualifiedSchematicStartupEffects: true }).success, false);
  }
  for (const action of ["validation-begin", "validation-advance", "validation-inspect", "execute", "rollback", "save"]) {
    assert.equal(currentSymbolOperationRequestSchema.safeParse({ action, operationId, confirmWrite: true, confirmDisposableProject: true }).success, false);
  }
  assert.equal(currentSymbolOperationStepSchema.safeParse({ expectedPhase: "forward-write", confirmDisposableProject: true, acceptMetadataMutation: true }).success, false);
  assert.equal(currentSymbolOperationStepSchema.safeParse({ expectedPhase: "forward-write", confirmWrite: true, acceptMetadataMutation: true,
    acceptDerivedInverseMutation: true }).success, false);
});

void test("ordinary targets and metadata retain canonical identity, distinct IDs and name/description-only bounds", () => {
  for (const invalid of [{ ...opening, projectUuid: "1".repeat(64) }, { ...opening, rawWindowsPath: String.raw`C:\Synthetic\..\Metadata.eprj2` },
    { ...opening, operationId: "short" }, { ...opening, operationId: "Uppercase-operation" }, { ...opening, operationId: "a".repeat(97) },
    { ...baseline, operationId: openingOperationId }, { ...baseline, preparation: { ...preparation, observationProjection: {} } },
    { ...baseline, preparation: { ...preparation, checkpoint: { ...preparation.checkpoint, path: "relative.eprj2" } } },
    { ...baseline, preparation: { ...preparation, target: { ...preparation.target, symbolUuid: "unknown" } } }]) {
    assert.equal(currentSymbolOperationRequestSchema.safeParse(invalid).success, false);
  }
  for (const patch of [{}, { name: " " }, { name: "a".repeat(513) }, { description: null }, { description: "a".repeat(65_537) },
    { name: "Allowed", tags: [] }, { name: "Allowed", source: "other" }, { name: "Allowed", classification: [] },
    { name: "Allowed", otherProperty: {} }]) {
    assert.equal(currentSymbolOperationRequestSchema.safeParse({ ...baseline, preparation: { ...preparation, patch } }).success, false);
  }
  for (const patch of [{ name: "a".repeat(512) }, { description: "" }, { description: "a".repeat(65_536) }]) {
    assert.equal(currentSymbolOperationRequestSchema.safeParse({ ...baseline, preparation: { ...preparation, patch } }).success, true);
  }
});

void test("ordinary continuations refuse replacement targets, evidence, fingerprints, clocks and code at every boundary", () => {
  const continuation = { action: "metadata-advance", operationId, step: { expectedPhase: "forward-write", confirmWrite: true, acceptMetadataMutation: true } };
  for (const extra of [{ target }, { patch: { name: "Replacement" } }, { expectedFingerprint: {} }, { continuation: {} }, { owner: {} },
    { purpose: CURRENT_SYMBOL_OPERATION_PURPOSE }, { backendWindow: { minimumMs: 1, maximumMs: 2 } }, { agedHead: {} },
    { code: "caller()" }, { verifier: "caller" }]) {
    assert.equal(currentSymbolOperationRequestSchema.safeParse({ ...continuation, ...extra }).success, false);
    assert.equal(currentSymbolOperationRequestSchema.safeParse({ ...continuation, step: { ...continuation.step, ...extra } }).success, false);
    assert.equal(currentSymbolOperationRequestSchema.safeParse({ action: "metadata-begin", operationId, confirmWrite: true, ...extra }).success, false);
    assert.equal(currentSymbolOperationRequestSchema.safeParse({ action: "request-normal-close", operationId,
      confirmNormalClose: true, acceptUnknownFileEffects: true, ...extra }).success, false);
  }
  for (const extra of [{ pid: 1234 }, { windowHandle: "123456" }, { hwnd: "123456" }, { force: true }, { save: false }, { discard: true }]) {
    assert.equal(currentSymbolOperationRequestSchema.safeParse({ action: "request-normal-close", operationId,
      confirmNormalClose: true, acceptUnknownFileEffects: true, ...extra }).success, false);
  }
});

void test("ordinary discovery and validation advertise registration without granting original-owner startup or execution authority", () => {
  const detailed = queryCurrentSymbolOperation({ includeSchemas: true }), discovery = queryCurrentSymbolOperation();
  for (const value of [discovery, detailed]) {
    assert.equal(value["offline"], true); assert.equal(value["purpose"], CURRENT_SYMBOL_OPERATION_PURPOSE);
    assert.equal(value["registrationEnabled"], true); assert.equal(value["tool"], "easyeda_control_project_symbol_metadata");
    for (const key of ["invocationEnabledByDiscovery", "executionAuthorized", "writerReady", "connectedValidation", "inverseSupported", "replayAllowed"]) {
      assert.equal(value[key], false);
    }
    assert.equal(value["forwardOnly"], true);
  }
  assert.equal(discovery["inputSchema"], undefined); assert.equal(discovery["stepSchema"], undefined);
  assert.equal(typeof detailed["inputSchema"], "object"); assert.equal(typeof detailed["stepSchema"], "object");
  assert.deepEqual(discovery["actions"], currentSymbolOperationRequestSchema.options.map((option) => option.shape.action.value));
  const text = JSON.stringify(discovery["limitations"]);
  for (const required of ["Before the first ordinary navigation", "complete closed baseline", "live startup qualification", "original retained owner",
    "saved-content verification", "final closed SQL equality", "without retaining an inverse", "ambiguous failure consumes its stage", "61000 ms",
    "request-normal-close", "Quarantine remains", "ambiguity consumes the close attempt", "META-only or satisfy the bounded canvas-segments profile",
    "every tombstoned occurrence", "reserve exactly one ordinary write", "strictly newer than every target header",
    "No inverse budget", "connected lifecycle is unclaimed"]) {
    assert.ok(text.includes(required));
  }
  assert.throws(() => queryCurrentSymbolOperation({ includeSchemas: true, enable: true }));
  const invalid = validateCurrentSymbolOperationArguments({ action: "metadata-advance", operationId, step: { expectedPhase: "inverse-write" } });
  assert.equal(invalid["valid"], false); assert.equal(invalid["registrationEnabled"], true); assert.equal(invalid["executionAuthorized"], false);
  assert.ok(Array.isArray(invalid["issues"])); assert.ok(invalid["issues"].length > 0 && invalid["issues"].length <= 16);
});

void test("offline API exposes exact ordinary schemas and rejects inverse validation without enabling execution", () => {
  assert.deepEqual(queryOfflineApi({ action: "project-symbol-operation", query: { includeSchemas: true } }),
    { offline: true, result: queryCurrentSymbolOperation({ includeSchemas: true }) });
  for (const request of [opening, baseline, ...requests.filter((value) => value.action === "metadata-advance"),
    { action: "metadata-advance", operationId, step: { expectedPhase: "inverse-write" } }]) {
    assert.deepEqual(queryOfflineApi({ action: "project-symbol-operation-validate", query: { request } }),
      { offline: true, result: validateCurrentSymbolOperationArguments(request) });
  }
  assert.equal(apiRequestSchema.safeParse({ action: "project-symbol-operation", query: { enable: true } }).success, false);
  assert.equal(apiRequestSchema.safeParse({ action: "project-symbol-operation-validate", query: { request: opening, execute: true } }).success, false);
});
