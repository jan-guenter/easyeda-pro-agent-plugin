import assert from "node:assert/strict";
import { rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { z } from "zod";
import { controlDataDirectory } from "../src/artifacts.ts";
import { apiRequestSchema, queryOfflineApi } from "../src/offline-api.ts";
import { currentPcb209WorkerStartupToolRequestSchema } from "../src/current-pcb-209-empty-startup-validation.ts";
import { currentPcb209RatlineContinuationLifecycleRequestSchema, currentPcb209RatlineContinuationValidationRequestSchema,
  queryCurrentPcb209RatlineContinuationValidation } from "../src/current-pcb-209-ratline-continuation-validation.ts";
import { diagnosticLifecycleRecordSchemas, publishCurrentPcbDiagnosticLifecycleRecord, readCurrentPcbDiagnosticLifecycles,
  reserveCurrentPcbDiagnosticLifecycle } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";

void test("continuation public contracts and durable launch purpose cannot adopt held or ordinary owners", async () => {
  const digest = "a".repeat(64), operationId = "pcb209-continuation-contract";
  const launch = { action: "launch", operationId, confirmValidationOnly: true, confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true };
  const observe = { action: "observe-ratline-continuation", operationId, expectedBindingSha256: digest, acceptNormalOpenEffects: true, acceptDebuggerPause: true };
  assert.equal(currentPcb209RatlineContinuationLifecycleRequestSchema.safeParse(launch).success, true);
  assert.equal(currentPcb209RatlineContinuationLifecycleRequestSchema.safeParse(observe).success, false);
  assert.equal(currentPcb209RatlineContinuationValidationRequestSchema.safeParse(observe).success, true);
  assert.equal(currentPcb209WorkerStartupToolRequestSchema.safeParse({ action: "ratline-continuation", request: observe }).success, true);
  for (const action of ["ratline-held-import", "empty-baseline"]) {
    assert.equal(currentPcb209WorkerStartupToolRequestSchema.safeParse({ action, request: observe }).success, false);
  }
  for (const changed of [{ operationId: "pcb209-ratline-contract" }, { operationId: "pcb209-startup-contract" }, { operationId: "pcb209-empty-contract" },
    { action: "observe-ratline-held-import" }, { action: "observe-current-assignments" }, { action: "save" }, { acceptDebuggerPause: false },
    { acceptNormalOpenEffects: false }, { target: {} }, { method: "Runtime.evaluate" }]) {
    assert.equal(currentPcb209RatlineContinuationValidationRequestSchema.safeParse({ ...observe, ...changed }).success, false);
  }
  const query = queryOfflineApi(apiRequestSchema.parse({ action: "pcb209-ratline-continuation", query: { includeSchemas: true } }));
  assert.equal(query.offline, true); assert.deepEqual(query.result, queryCurrentPcb209RatlineContinuationValidation(true));
  const validated = queryOfflineApi(apiRequestSchema.parse({ action: "pcb209-ratline-continuation-validate", query: { request: observe } }));
  assert.equal(z.record(z.string(), z.unknown()).parse(validated.result)["valid"], true);
  const directory = join(controlDataDirectory(), "pcb-diagnostic-lifecycle-v1", operationId);
  await readCurrentPcbDiagnosticLifecycles(); await reserveCurrentPcbDiagnosticLifecycle(operationId);
  try {
    const intent = diagnosticLifecycleRecordSchemas["intent.json"].parse({ schema: "easyeda-pro-control.pcb209-ratline-continuation-launch-intent.v1",
      operationId, createdAt: new Date(0).toISOString(), purpose: "worker-startup", facadeSha256: digest, installationSha256: digest,
      confirmValidationOnly: true, confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true });
    await publishCurrentPcbDiagnosticLifecycleRecord(operationId, "intent.json", intent);
    const operations = await readCurrentPcbDiagnosticLifecycles();
    assert.equal(operations.find(item => item.operationId === operationId)?.records["intent.json"]?.schema, intent.schema);
    await writeFile(join(directory, "intent.json"), JSON.stringify({ ...intent, schema: "easyeda-pro-control.pcb-diagnostic-launch-intent.v1", purpose: undefined }));
    await assert.rejects(readCurrentPcbDiagnosticLifecycles(), /RESERVED_WORKER_STARTUP_CONTINUATION209_PURPOSE_ID/u);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
