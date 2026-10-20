import assert from "node:assert/strict";
import { test } from "node:test";
import { apiRequestSchema, queryOfflineApi } from "../src/offline-api.ts";
import { currentPcbDiagnosticValidationRequestSchema, queryCurrentPcbDiagnosticValidation,
  validateCurrentPcbDiagnosticValidationArguments } from "../src/current-pcb-diagnostic-validation.ts";

void test("diagnostic discovery is offline, validation-only and does not imply execution or startup qualification", () => {
  const catalog = queryCurrentPcbDiagnosticValidation({ includeSchemas: true });
  assert.equal(catalog["offline"], true); assert.equal(catalog["validationOnly"], true);
  for (const key of ["executionAuthorized", "connectedValidation", "frameWorkerVerified", "startupQualified", "projectFreeVerified", "profileIsolated", "savedStateVerified"]) {
    assert.equal(catalog[key], false);
  }
  assert.equal(catalog["tool"], "easyeda_control_pcb_diagnostic_validation"); assert.notEqual(catalog["inputSchema"], undefined);
  const result = queryOfflineApi(apiRequestSchema.parse({ action: "pcb-diagnostic-validation", query: { includeSchemas: true } }));
  assert.deepEqual(result.result, catalog);
});

void test("diagnostic request grammar rejects arbitrary executables, hashes, CDP, expressions and missing acknowledgments", () => {
  const request = { action: "launch", operationId: "validation-test", confirmValidationOnly: true,
    confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true };
  assert.equal(validateCurrentPcbDiagnosticValidationArguments(request)["valid"], true);
  for (const key of ["confirmValidationOnly", "confirmDiagnosticLaunch", "acceptExistingProfileEffects"]) {
    const absent = Object.fromEntries(Object.entries(request).filter(([name]) => name !== key));
    assert.equal(currentPcbDiagnosticValidationRequestSchema.safeParse(absent).success, false);
  }
  for (const [key, value] of Object.entries({ executable: "C:\\Other.exe", args: [], powershellSha256: "a".repeat(64),
    sessionId: "session-1", expression: "1+1", method: "Runtime.evaluate", profile: {}, sourceHash: "b".repeat(64) })) {
    assert.equal(currentPcbDiagnosticValidationRequestSchema.safeParse({ ...request, [key]: value }).success, false);
  }
  const inspect = { action: "inspect-script", operationId: "validation-test", expectedBindingSha256: "a".repeat(64), frameId: "frame-1", family: "pcb" };
  assert.equal(currentPcbDiagnosticValidationRequestSchema.safeParse(inspect).success, true);
  assert.equal(currentPcbDiagnosticValidationRequestSchema.safeParse({ ...inspect, family: "worker" }).success, false);
  assert.equal(currentPcbDiagnosticValidationRequestSchema.safeParse({ ...inspect, frameId: "../other" }).success, false);
  const worker = { action: "inspect-worker-script", operationId: "validation-test", expectedBindingSha256: "a".repeat(64), targetId: "worker-1" };
  assert.equal(currentPcbDiagnosticValidationRequestSchema.safeParse(worker).success, true);
  const state = { action: "observe-worker-state", operationId: "validation-test", expectedBindingSha256: "a".repeat(64) };
  assert.equal(currentPcbDiagnosticValidationRequestSchema.safeParse(state).success, true);
  for (const fields of [{ expression: "1+1" }, { uniqueContextId: "supplied-context" }, { sourceHash: "b".repeat(64) },
    { method: "Runtime.evaluate" }, { targetId: "worker-1" }, { throwOnSideEffect: false }]) {
    assert.equal(currentPcbDiagnosticValidationRequestSchema.safeParse({ ...state, ...fields }).success, false);
  }
  const cleanup = { action: "cleanup-no-process", operationId: "validation-test", expectedIntentSha256: "a".repeat(64) };
  assert.equal(currentPcbDiagnosticValidationRequestSchema.safeParse(cleanup).success, true);
  for (const fields of [{ pid: 123 }, { executable: "C:\\Other.exe" }, { processCreated: false }, { creationState: "not-entered" }]) {
    assert.equal(currentPcbDiagnosticValidationRequestSchema.safeParse({ ...cleanup, ...fields }).success, false);
  }
  const validated = queryOfflineApi(apiRequestSchema.parse({ action: "pcb-diagnostic-validation-validate", query: { request } }));
  assert.deepEqual(validated.result, validateCurrentPcbDiagnosticValidationArguments(request));
});
