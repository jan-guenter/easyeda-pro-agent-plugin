import assert from "node:assert/strict";
import { test } from "node:test";
import { currentPcbOrdinaryReadRequestSchema, queryCurrentPcbOrdinaryRead, validateCurrentPcbOrdinaryReadArguments } from "../src/current-pcb-ordinary-read-validation.ts";
import { sha256Text } from "../src/core.ts";
import { diagnosticLifecycleRecordSchemas } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";
import { queryOfflineApi } from "../src/offline-api.ts";

const operationId = "pcb209-ordinary-fixture";
const bound = { operationId, expectedBindingSha256: "a".repeat(64) };
const launch = { action: "launch", operationId, confirmOrdinaryReadOnly: true,
  confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true };

void test("ordinary PCB discovery and offline validation expose the registered wrapper with real opening effects", () => {
  const query = queryCurrentPcbOrdinaryRead({ includeSchemas: true });
  assert.equal(query["wrapperAction"], "ordinary"); assert.equal(query["validationOnly"], false);
  assert.equal(query["ordinaryProjectReadOnly"], true); assert.equal(query["connectedValidation"], false);
  assert.equal(query["saveAuthorized"], false); assert.equal(typeof query["inputSchema"], "object");
  assert.match(JSON.stringify(query["limitations"]), /automatically persist or Save/u);
  const offline = queryOfflineApi({ action: "pcb209-ordinary-read" });
  assert.deepEqual(offline.result, queryCurrentPcbOrdinaryRead());
  const validation = queryOfflineApi({ action: "pcb209-ordinary-read-validate", query: { request: launch } });
  assert.match(JSON.stringify(validation.result), /"valid":true/u);
});

void test("ordinary PCB grammar requires exact effects and keeps validation and native writers separate", () => {
  assert.deepEqual(currentPcbOrdinaryReadRequestSchema.parse(launch), launch);
  for (const extra of [{ confirmValidationOnly: true }, { confirmOrdinaryReadOnly: false }, { source: "caller" },
    { executable: "caller.exe" }, { generation: "209-opening" }, { code: "caller" }]) {
    assert.equal(validateCurrentPcbOrdinaryReadArguments({ ...launch, ...extra })["valid"], false);
  }
  for (const action of ["observe-model-state", "observe-common-baseline", "inspect-workers", "perform-visual", "observe-spatial", "save", "edit"]) {
    assert.equal(currentPcbOrdinaryReadRequestSchema.safeParse({ action, ...bound }).success, false);
  }
  const rawWindowsPath = String.raw`C:\Fixtures\ordinary.eprj2`;
  const target = { rawWindowsPath, projectUuid: sha256Text(rawWindowsPath), documentUuid: "a".repeat(16), expectedSourceSha256: "b".repeat(64) };
  const opening = { action: "open-project", ...bound, target, confirmOrdinaryProject: true, acceptNormalOpenEffects: true };
  assert.deepEqual(currentPcbOrdinaryReadRequestSchema.parse(opening), opening);
  assert.equal(currentPcbOrdinaryReadRequestSchema.safeParse({ ...opening, confirmDisposableProject: true }).success, false);
  assert.equal(currentPcbOrdinaryReadRequestSchema.safeParse({ ...opening, target: { ...target, expectedSourceSha256: undefined } }).success, false);
  assert.equal(currentPcbOrdinaryReadRequestSchema.safeParse({ ...opening, target: { ...target, projectUuid: "c".repeat(64) } }).success, false);
});

void test("ordinary immutable launch records do not rewrite released disposable intent shapes", () => {
  const base = { operationId, createdAt: "2026-11-05T00:00:00.000Z", facadeSha256: "a".repeat(64),
    installationSha256: "b".repeat(64), confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true };
  const ordinary = { ...base, schema: "easyeda-pro-control.pcb209-ordinary-read-launch-intent.v1", confirmOrdinaryReadOnly: true };
  const old = { ...base, operationId: "pcb209-disposable-fixture", schema: "easyeda-pro-control.pcb-diagnostic-launch-intent.v1", confirmValidationOnly: true };
  assert.deepEqual(diagnosticLifecycleRecordSchemas["intent.json"].parse(ordinary), ordinary);
  assert.deepEqual(diagnosticLifecycleRecordSchemas["intent.json"].parse(old), old);
  for (const input of [{ ...ordinary, confirmValidationOnly: true }, { ...ordinary, operationId: old.operationId },
    { ...old, confirmOrdinaryReadOnly: true }]) { assert.equal(diagnosticLifecycleRecordSchemas["intent.json"].safeParse(input).success, false); }
});
