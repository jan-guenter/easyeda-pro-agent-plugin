import assert from "node:assert/strict";
import { test } from "node:test";
import { currentPcbDiagnosticValidationRequestSchema } from "../src/current-pcb-diagnostic-validation.ts";
import { currentPcbStringPrecreateRequestSchema, queryCurrentPcbStringPrecreate, validateCurrentPcbStringPrecreateArguments } from "../src/current-pcb-string-precreate-validation.ts";
import { apiRequestSchema, queryOfflineApi } from "../src/offline-api.ts";

void test("fixed String discovery is offline, distinct and excludes arbitrary knobs or diagnostic upgrades", () => {
  const request = { action: "launch", operationId: "string-precreate-contract", confirmValidationOnly: true,
    confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true };
  assert.equal(validateCurrentPcbStringPrecreateArguments(request)["valid"], true);
  assert.equal(currentPcbDiagnosticValidationRequestSchema.safeParse(request).success, false);
  assert.equal(currentPcbStringPrecreateRequestSchema.safeParse({ ...request, operationId: "diagnostic-contract" }).success, false);
  for (const extra of [{ purpose: "string-precreate" }, { requestCap: 90 }, { expression: "1+1" }, { method: "Runtime.evaluate" },
    { executable: "C:\\other.exe" }, { sourceSha256: "a".repeat(64) }]) {
    assert.equal(currentPcbStringPrecreateRequestSchema.safeParse({ ...request, ...extra }).success, false);
  }
  const bound = { operationId: request.operationId, expectedBindingSha256: "a".repeat(64) };
  assert.equal(currentPcbStringPrecreateRequestSchema.safeParse({ action: "observe-string-precreate", ...bound }).success, true);
  for (const action of ["observe-model-state", "observe-worker-state", "create", "save", "upgrade"]) {
    assert.equal(currentPcbStringPrecreateRequestSchema.safeParse({ action, ...bound }).success, false);
  }
  assert.equal(currentPcbStringPrecreateRequestSchema.safeParse({ action: "inspect-script", ...bound, frameId: "frame", family: "pcb" }).success, false);
  const discovery = queryCurrentPcbStringPrecreate({ includeSchemas: true });
  for (const key of ["executionAuthorized", "connectedValidation", "saveAuthorized", "projectWorkerAssociationVerified"]) {
    assert.equal(discovery[key], false);
  }
  assert.equal(discovery["offline"], true);
  assert.deepEqual(queryOfflineApi(apiRequestSchema.parse({ action: "pcb-string-precreate-validation", query: { includeSchemas: true } })).result, discovery);
  assert.deepEqual(queryOfflineApi(apiRequestSchema.parse({ action: "pcb-string-precreate-validation-validate",
    query: { request } })).result, validateCurrentPcbStringPrecreateArguments(request));
});
