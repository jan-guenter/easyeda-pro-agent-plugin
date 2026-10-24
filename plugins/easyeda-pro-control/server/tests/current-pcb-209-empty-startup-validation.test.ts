/** Offline purpose and durable-schema boundaries, without allocating EasyEDA. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { currentPcb209EmptyStartupLifecycleRequestSchema, currentPcb209EmptyStartupValidationRequestSchema,
  currentPcb209WorkerStartupToolRequestSchema, queryCurrentPcb209EmptyStartupValidation,
  validateCurrentPcb209EmptyStartupArguments } from "../src/current-pcb-209-empty-startup-validation.ts";
import { currentPcb209WorkerStartupValidationRequestSchema } from "../src/current-pcb-209-worker-startup-validation.ts";
import { diagnosticLifecycleRecordSchemas } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";
import { CURRENT_PCB_209_EMPTY_STARTUP_RESULT_MAX_BYTES } from "../src/current-pcb-209-empty-startup-packet-schema.ts";
import { CURRENT_PCB_209_EMPTY_BASELINE_PACKET_MAX_BYTES } from "../src/current-pcb-209-empty-baseline-session.ts";

const digest = "a".repeat(64), operationId = "pcb209-empty-contract";
const launch = { action: "launch", operationId, confirmValidationOnly: true, confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true };
const observe = { action: "observe-empty-baseline", operationId, expectedBindingSha256: digest, acceptNormalOpenEffects: true };
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
