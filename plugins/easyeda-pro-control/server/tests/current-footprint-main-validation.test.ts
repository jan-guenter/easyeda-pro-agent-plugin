import assert from "node:assert/strict";
import { test } from "node:test";
import { queryOfflineApi } from "../src/offline-api.ts";
import { currentPcb209WorkerStartupToolRequestSchema } from "../src/current-pcb-209-empty-startup-validation.ts";
import { currentFootprintMainValidationRequestSchema, queryCurrentFootprintMain, validateCurrentFootprintMainArguments } from "../src/current-footprint-main-validation.ts";

void test("main diagnostic arguments exclude caller transport and consume a distinct confirmed purpose", () => {
  const expectedBindingSha256 = "a".repeat(64), operationId = "footprint-main-disposable-01";
  const launch = { action: "launch", operationId, confirmValidationOnly: true, confirmDiagnosticLaunch: true,
    acceptExistingProfileEffects: true, acceptDebuggerPauseEffects: true };
  assert.equal(validateCurrentFootprintMainArguments(launch)["valid"], true);
  for (const input of [{ ...launch, acceptDebuggerPauseEffects: false }, { ...launch, operationId: "footprint-route-other-purpose" },
    { ...launch, inspectorUrl: "ws://127.0.0.1:1/caller" }, { ...launch, executable: "caller" },
    { action: "terminate-main", operationId, expectedBindingSha256 },
    { action: "observe-main-construction", operationId, expectedBindingSha256, program: "caller" },
    { action: "capture-project", operationId, expectedBindingSha256 }]) {
    assert.equal(currentFootprintMainValidationRequestSchema.safeParse(input).success, false);
  }
  const close = { action: "terminate-main", operationId, expectedBindingSha256, confirmTerminateOriginalDiagnosticJob: true };
  assert.equal(currentPcb209WorkerStartupToolRequestSchema.safeParse({ action: "footprint-main", request: close }).success, true);
  assert.equal(currentPcb209WorkerStartupToolRequestSchema.safeParse({ action: "footprint-copy-route-preparation", request: close }).success, false);
  assert.equal(queryCurrentFootprintMain(true)["executionAuthorized"], false);
  assert.deepEqual(queryOfflineApi({ action: "footprint-main", query: { includeSchemas: true } }),
    { offline: true, result: queryCurrentFootprintMain(true) });
  assert.deepEqual(queryOfflineApi({ action: "footprint-main-validate", query: { request: close } }),
    { offline: true, result: validateCurrentFootprintMainArguments(close) });
});
