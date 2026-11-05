/** Offline purpose and durable-schema boundaries, without allocating EasyEDA. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { currentPcb209EmptyStartupLifecycleRequestSchema, currentPcb209EmptyStartupValidationRequestSchema,
  currentPcb209WorkerStartupToolRequestSchema, queryCurrentPcb209EmptyStartupValidation,
  validateCurrentPcb209EmptyStartupArguments } from "../src/current-pcb-209-empty-startup-validation.ts";
import { apiRequestSchema, isStaticOfflineApiReference, queryOfflineApi } from "../src/offline-api.ts";
import { currentFootprintForwardPrewriteValidationRequestSchema } from "../src/current-footprint-forward-prewrite-validation.ts";
import { currentFootprintForwardOpeningRelinquishmentRequestSchema } from "../src/current-footprint-forward-opening-relinquishment-contract.ts";
import { currentPcb209WorkerStartupValidationRequestSchema } from "../src/current-pcb-209-worker-startup-validation.ts";
import { diagnosticLifecycleRecordSchemas } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";
import { CURRENT_PCB_209_EMPTY_STARTUP_RESULT_MAX_BYTES } from "../src/current-pcb-209-empty-startup-packet-schema.ts";
import { CURRENT_PCB_209_EMPTY_BASELINE_PACKET_MAX_BYTES } from "../src/current-pcb-209-empty-baseline-session.ts";

const digest = "a".repeat(64), operationId = "pcb209-empty-contract";
const launch = { action: "launch", operationId, confirmValidationOnly: true, confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true };
const observe = { action: "observe-empty-baseline", operationId, expectedBindingSha256: digest, acceptNormalOpenEffects: true };

void test("forward opening relinquishment has a separate strict historical wrapper and static discovery", () => {
  const request = { action: "relinquish-unknown-opening", operationId: "footprint-copy-qualify-contract",
    expectedIntentSha256: digest, expectedBindingSha256: digest, expectedOpeningIntentSha256: digest,
    confirmRelinquishUnknownOpening: true, acceptUnknownCaptureOutcome: true };
  assert.equal(currentFootprintForwardOpeningRelinquishmentRequestSchema.safeParse(request).success, true);
  assert.equal(currentPcb209WorkerStartupToolRequestSchema.safeParse({ action: "footprint-forward-opening-relinquishment", request }).success, true);
  assert.equal(currentPcb209WorkerStartupToolRequestSchema.safeParse(request).success, false);
  assert.equal(currentFootprintForwardPrewriteValidationRequestSchema.safeParse(request).success, false);
  for (const wrapper of ["footprint-forward-prewrite", "footprint-combined", "footprint-copy-preparation"]) {
    assert.equal(currentPcb209WorkerStartupToolRequestSchema.safeParse({ action: wrapper, request }).success, false);
  }
  for (const change of [{ confirmRelinquishUnknownOpening: false }, { acceptUnknownCaptureOutcome: false }, { originalPid: 42 },
    { operationId: "footprint-combined-old" }, { expectedIntentSha256: "invalid" }, { observationNonce: digest },
    { action: "capture-project" }, { executionReady: true }, { sourceReferenceApi: true }]) {
    assert.equal(currentFootprintForwardOpeningRelinquishmentRequestSchema.safeParse({ ...request, ...change }).success, false);
  }
  const discovery = apiRequestSchema.parse({ action: "footprint-forward-opening-relinquishment", query: { includeSchemas: true } });
  const query = queryOfflineApi(discovery).result;
  assert.ok(query !== null && typeof query === "object" && "executionReady" in query && "inputSchema" in query && "actions" in query && "wrapperAction" in query);
  assert.equal(query.wrapperAction, "footprint-forward-opening-relinquishment");
  assert.equal(query.executionReady, false); assert.notEqual(query.inputSchema, undefined);
  assert.deepEqual(query.actions, ["relinquish-unknown-opening"]);
  const validation = apiRequestSchema.parse({ action: "footprint-forward-opening-relinquishment-validate", query: { request } });
  const validated = queryOfflineApi(validation).result;
  assert.ok(validated !== null && typeof validated === "object" && "valid" in validated && "executionReady" in validated);
  assert.equal(validated.valid, true); assert.equal(validated.executionReady, false);
  assert.equal(isStaticOfflineApiReference(discovery), true); assert.equal(isStaticOfflineApiReference(validation), true);
  assert.equal(isStaticOfflineApiReference({ ...discovery, sourceReferenceApi: true }), false);
  assert.equal(isStaticOfflineApiReference({ action: "unknown-future-action" }), false);
});

void test("forward prewrite wrapper and discovery preserve a separate qualification-only grammar", () => {
  const id = "footprint-copy-qualify-contract";
  const qualify = { action: "qualify-footprint-source", operationId: id, expectedBindingSha256: digest, footprintUuid: "b".repeat(32) };
  const forwardLaunch = { ...launch, operationId: id, acceptDebuggerPauseEffects: true };
  assert.equal(currentFootprintForwardPrewriteValidationRequestSchema.safeParse(forwardLaunch).success, true);
  assert.equal(currentPcb209WorkerStartupToolRequestSchema.safeParse({ action: "footprint-forward-prewrite", request: qualify }).success, true);
  assert.equal(currentPcb209WorkerStartupToolRequestSchema.safeParse(qualify).success, false);
  for (const wrapper of ["footprint-combined", "footprint-copy-preparation", "footprint-copy-route-preparation", "empty-baseline"]) {
    assert.equal(currentPcb209WorkerStartupToolRequestSchema.safeParse({ action: wrapper, request: qualify }).success, false);
  }
  for (const change of [{ action: "create" }, { action: "execute" }, { action: "save" }, { action: "observe-saved-cache-accessor" },
    { scheduler: {} }, { executionOwner: {} }, { executionReady: true }, { callerCode: "unavailable" }, { operationId: "footprint-combined-old" }]) {
    assert.equal(currentFootprintForwardPrewriteValidationRequestSchema.safeParse({ ...qualify, ...change }).success, false);
  }
  const query = queryOfflineApi(apiRequestSchema.parse({ action: "footprint-forward-prewrite", query: { includeSchemas: true } })).result;
  assert.ok(query !== null && typeof query === "object" && "executionReady" in query && "inputSchema" in query && "actions" in query);
  assert.equal(query.executionReady, false); assert.notEqual(query.inputSchema, undefined);
  assert.ok(Array.isArray(query.actions) && query.actions.includes("qualify-footprint-source") && query.actions.includes("abort-generation"));
  for (const action of ["seal-footprint-source", "prove-closed-baseline"]) {
    const request = { action, operationId: id, expectedBindingSha256: digest };
    assert.equal(currentFootprintForwardPrewriteValidationRequestSchema.safeParse(request).success, true);
    assert.equal(currentPcb209WorkerStartupToolRequestSchema.safeParse({ action: "footprint-forward-prewrite", request }).success, true);
    for (const change of [{ footprintUuid: "b".repeat(32) }, { checkpoint: {} }, { nativeOwner: {} }, { result: {} }, { executionReady: true }, { saveAuthorized: true }]) {
      assert.equal(currentFootprintForwardPrewriteValidationRequestSchema.safeParse({ ...request, ...change }).success, false);
    }
    assert.ok(Array.isArray(query.actions) && query.actions.includes(action));
  }
  const page = { action: "read-qualified-source", operationId: id, expectedBindingSha256: digest,
    expectedSourcePacketSha256: "c".repeat(64), offsetBytes: 0, lengthBytes: 65_536 };
  assert.equal(currentFootprintForwardPrewriteValidationRequestSchema.safeParse(page).success, true);
  assert.equal(currentPcb209WorkerStartupToolRequestSchema.safeParse({ action: "footprint-forward-prewrite", request: page }).success, true);
  assert.ok(Array.isArray(query.actions) && query.actions.includes("read-qualified-source"));
  for (const change of [{ path: "caller.json" }, { packet: {} }, { nativeOwner: {} }, { code: "caller" },
    { expectedSourcePacketSha256: "invalid" }, { offsetBytes: -1 }, { offsetBytes: -0 }, { offsetBytes: 0.5 },
    { lengthBytes: 0 }, { lengthBytes: 65_537 }, { executionReady: true }, { saveAuthorized: true }]) {
    assert.equal(currentFootprintForwardPrewriteValidationRequestSchema.safeParse({ ...page, ...change }).success, false);
  }
  const validated = queryOfflineApi(apiRequestSchema.parse({ action: "footprint-forward-prewrite-validate", query: { request: qualify } })).result;
  assert.ok(validated !== null && typeof validated === "object" && "valid" in validated && "executionReady" in validated);
  assert.equal(validated.valid, true); assert.equal(validated.executionReady, false);
});

void test("empty startup has a separate strict wrapper and cannot upgrade legacy startup IDs or authority", () => {
  assert.equal(currentPcb209EmptyStartupLifecycleRequestSchema.safeParse(launch).success, true);
  assert.equal(currentPcb209EmptyStartupLifecycleRequestSchema.safeParse(observe).success, false);
  assert.equal(currentPcb209EmptyStartupValidationRequestSchema.safeParse(observe).success, true);
  assert.equal(currentPcb209WorkerStartupToolRequestSchema.safeParse({ action: "empty-baseline", request: observe }).success, true);
  assert.equal(currentPcb209WorkerStartupToolRequestSchema.safeParse(observe).success, false);
  assert.equal(currentPcb209WorkerStartupValidationRequestSchema.safeParse(observe).success, false);
  assert.equal(currentPcb209WorkerStartupValidationRequestSchema.safeParse(launch).success, false);
  for (const other of ["pcb209-startup-contract", "worker-startup-contract", "pcb209-contract"]) {
    assert.equal(currentPcb209EmptyStartupValidationRequestSchema.safeParse({ ...launch, operationId: other }).success, false);
    assert.equal(currentPcb209EmptyStartupValidationRequestSchema.safeParse({ ...observe, operationId: other }).success, false);
  }
  for (const change of [{ acceptNormalOpenEffects: false }, { target: {} }, { checkpoint: {} }, { nativeCommands: 4000 },
    { method: "Runtime.evaluate" }, { action: "observe-current-assignments" }, { action: "observe-actor-clock" },
    { action: "observe-current-channel" }, { action: "save" }]) {
    assert.equal(currentPcb209EmptyStartupValidationRequestSchema.safeParse({ ...observe, ...change }).success, false);
  }
  const query = queryCurrentPcb209EmptyStartupValidation(true);
  assert.notEqual(query["inputSchema"], undefined); assert.equal(query["executionAuthorized"], false); assert.equal(query["connectedValidation"], false);
  assert.equal(validateCurrentPcb209EmptyStartupArguments(observe)["valid"], true);
  assert.equal(validateCurrentPcb209EmptyStartupArguments({ ...observe, target: {} })["valid"], false);
});

void test("empty journal reserves a separate launch schema and excludes legacy assignment/actor/channel stages", () => {
  const record = { schema: "easyeda-pro-control.pcb209-empty-startup-launch-intent.v1", operationId, createdAt: new Date(0).toISOString(),
    purpose: "worker-startup", facadeSha256: digest, installationSha256: digest,
    confirmValidationOnly: true, confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true };
  assert.equal(diagnosticLifecycleRecordSchemas["intent.json"].safeParse(record).success, true);
  for (const schema of ["easyeda-pro-control.pcb209-worker-startup-launch-intent.v1", "easyeda-pro-control.pcb-worker-startup-launch-intent.v1"]) {
    assert.equal(diagnosticLifecycleRecordSchemas["intent.json"].safeParse({ ...record, schema }).success, false);
  }
  const intent = { schema: "easyeda-pro-control.pcb209-worker-startup-empty-intent.v1", operationId, createdAt: record.createdAt,
    bindingSha256: digest, openingIntentSha256: digest, openingResultSha256: digest, acceptNormalOpenEffects: true };
  const schema = diagnosticLifecycleRecordSchemas["worker-startup-empty-intent.json"];
  assert.equal(schema.safeParse(intent).success, true);
  for (const other of ["pcb209-startup-contract", "worker-startup-contract", "ordinary"]) {
    assert.equal(schema.safeParse({ ...intent, operationId: other }).success, false);
  }
  assert.equal(schema.safeParse({ ...intent, target: {} }).success, false);
  for (const stage of ["assignments", "actor", "channel"] as const) {
    assert.equal(diagnosticLifecycleRecordSchemas[`worker-startup-${stage}-intent.json`].safeParse({ operationId, createdAt: record.createdAt,
      schema: `easyeda-pro-control.pcb-worker-startup-${stage}-intent.v1`, bindingSha256: digest,
      ...(stage === "assignments" ? { openingResultSha256: digest } : { assignmentsResultSha256: digest }) }).success, false);
  }
  assert.equal(CURRENT_PCB_209_EMPTY_STARTUP_RESULT_MAX_BYTES,
    CURRENT_PCB_209_EMPTY_BASELINE_PACKET_MAX_BYTES + 128 * 1024 + 16_384 + 8192);
});
