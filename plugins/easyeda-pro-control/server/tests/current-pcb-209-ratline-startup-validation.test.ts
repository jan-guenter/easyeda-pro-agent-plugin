/* oxlint-disable import/max-dependencies -- The focused test joins strict contracts with the real isolated durable journal scanner; no native owner is allocated. */
import assert from "node:assert/strict";
import { rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { z } from "zod";
import { apiRequestSchema, queryOfflineApi } from "../src/offline-api.ts";
import { controlDataDirectory } from "../src/artifacts.ts";
import { sha256Json, sha256Text } from "../src/core.ts";
import { CURRENT_PCB_209_OPENING_SCRIPTS } from "../src/current-pcb-209-opening-profile.ts";
import { currentPcb209WorkerStartupToolRequestSchema } from "../src/current-pcb-209-empty-startup-validation.ts";
import { currentPcb209RatlineStartupLifecycleRequestSchema, currentPcb209RatlineStartupValidationRequestSchema,
  queryCurrentPcb209RatlineStartupValidation, validateCurrentPcb209RatlineStartupArguments } from "../src/current-pcb-209-ratline-startup-validation.ts";
import { CURRENT_PCB_209_RATLINE_STARTUP_RESULT_MAX_BYTES, currentPcb209RatlineNativePacketSchema } from "../src/current-pcb-209-ratline-startup-packet-schema.ts";
import { diagnosticLifecycleRecordSchemas, publishCurrentPcbDiagnosticLifecycleRecord,
  readCurrentPcbDiagnosticLifecycles, reserveCurrentPcbDiagnosticLifecycle } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";
import { captureCurrentPcb209RatlineOriginEvidence, inspectCurrentPcb209RatlineOriginEvidence } from "../src/current-pcb-209-ratline-origin-observation.ts";
import type { DiagnosticLifecycleRecordName } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";

const digest = "a".repeat(64), operationId = "pcb209-ratline-contract";
const launch = { action: "launch", operationId, confirmValidationOnly: true, confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true };
const observe = { action: "observe-ratline-held-import", operationId, expectedBindingSha256: digest,
  acceptNormalOpenEffects: true, acceptDebuggerPause: true };
const sourceFlags = { completeImportedSourceQualified: true, importedSourceHeldBeforeExecution: true,
  nativeWorkerTargetIdentityVerified: false, continuousInstallationLeaseVerified: false, executionAuthorized: false };
const nativeOriginEvidence = captureCurrentPcb209RatlineOriginEvidence({ metadata: { parentDebuggerId: "parent-debugger", childDebuggerId: "child-debugger",
  childUniqueContextId: "child-context", childScriptId: "bootstrap-script", childUrl: "https://client/editor?entry=pcb-ratline-worker.js",
  parentSessionId: "parent-session", parentScriptId: "pcb-script" }, firstPause: {}, constructorBefore: {}, constructorAfter: {}, stackReply: null });
const nativeOrigin = inspectCurrentPcb209RatlineOriginEvidence(nativeOriginEvidence);
const packet = { nativeOrigin, nativeOriginEvidence, profile: "private.pcb209-ratline-native-held-import.v1", targetSha256: digest, originalProjectConstructionSha256: digest,
  pcbSource: { profile: "private.pcb209-ratline-pcb-bootstrap.v1", sessionId: "parent-session", parentTargetId: "parent", frameId: "pcb-frame",
    contextId: 10, uniqueContextId: "pcb-context", origin: "https://client", frameUrl: "https://client/editor?entry=pcb", scriptId: "pcb-script",
    ...sourceFlags, nativeFrameAncestryVerified: false },
  childSource: { profile: "private.pcb209-ratline-bootstrap.v1", childTargetId: "child", childSessionId: "child-session", scriptId: "child-script",
    uniqueContextId: "child-context", ...sourceFlags }, originalFrameProofSets: 3, pcbNavigationAcknowledged: false, firstChildImportHeld: true,
  nativeWorkerTargetIdentityVerified: false, completeStartupVerified: false, completeLiveBaselineVerified: false,
  executionAuthorized: false, saveAuthorized: false };

void test("ratline lifecycle is a distinct bounded purpose and requires explicit opening and pause effects", () => {
  assert.equal(currentPcb209RatlineStartupLifecycleRequestSchema.safeParse(launch).success, true);
  assert.equal(currentPcb209RatlineStartupLifecycleRequestSchema.safeParse(observe).success, false);
  assert.equal(currentPcb209RatlineStartupValidationRequestSchema.safeParse(observe).success, true);
  assert.equal(currentPcb209WorkerStartupToolRequestSchema.safeParse({ action: "ratline-held-import", request: observe }).success, true);
  assert.equal(currentPcb209WorkerStartupToolRequestSchema.safeParse(observe).success, false);
  assert.equal(currentPcb209WorkerStartupToolRequestSchema.safeParse({ action: "empty-baseline", request: observe }).success, false);
  for (const other of ["pcb209-empty-contract", "pcb209-startup-contract", "worker-startup-contract", "pcb209-contract"]) {
    assert.equal(currentPcb209RatlineStartupValidationRequestSchema.safeParse({ ...launch, operationId: other }).success, false);
    assert.equal(currentPcb209RatlineStartupValidationRequestSchema.safeParse({ ...observe, operationId: other }).success, false);
  }
  for (const change of [{ acceptNormalOpenEffects: false }, { acceptDebuggerPause: false }, { acceptDebuggerPause: undefined },
    { acceptDebuggerPauseEffects: true }, { target: {} }, { method: "Runtime.evaluate" }, { action: "observe-empty-baseline" },
    { action: "observe-current-assignments" }, { action: "observe-actor-clock" }, { action: "observe-current-channel" }, { action: "save" }]) {
    assert.equal(currentPcb209RatlineStartupValidationRequestSchema.safeParse({ ...observe, ...change }).success, false);
  }
  const query = queryCurrentPcb209RatlineStartupValidation(true);
  assert.notEqual(query["inputSchema"], undefined); assert.equal(query["connectedValidation"], false); assert.equal(query["executionAuthorized"], false);
  assert.equal(validateCurrentPcb209RatlineStartupArguments(observe)["valid"], true);
  const catalog = queryOfflineApi(apiRequestSchema.parse({ action: "pcb209-ratline-held-import", query: { includeSchemas: true } }));
  assert.equal(catalog.offline, true); assert.deepEqual(catalog.result, query);
  const validated = queryOfflineApi(apiRequestSchema.parse({ action: "pcb209-ratline-held-import-validate", query: { request: observe } }));
  assert.equal(validated.offline, true); assert.equal(z.record(z.string(), z.unknown()).parse(validated.result)["valid"], true);
  assert.equal(validateCurrentPcb209RatlineStartupArguments({ ...observe, executionAuthorized: true })["valid"], false);
});

void test("strict held-import packet rejects stronger claims, incomplete sources and contradictory identities", () => {
  assert.equal(currentPcb209RatlineNativePacketSchema.safeParse(packet).success, true);
  for (const changed of [{ ...packet, nativeWorkerTargetIdentityVerified: true }, { ...packet, completeStartupVerified: true },
    { ...packet, completeLiveBaselineVerified: true }, { ...packet, executionAuthorized: true }, { ...packet, saveAuthorized: true },
    { ...packet, nativeOrigin: { ...nativeOrigin, evidenceSha256: "f".repeat(64) } },
    { ...packet, nativeOriginEvidence: { ...nativeOriginEvidence, firstPause: { changed: true } } },
    { ...packet, nativeOrigin: { ...nativeOrigin, constructorLocationMatched: true } },
    { ...packet, originalFrameProofSets: 2 }, { ...packet, firstChildImportHeld: false }, { ...packet, unknown: true },
    { ...packet, pcbSource: { ...packet.pcbSource, frameUrl: null } },
    { ...packet, pcbSource: { ...packet.pcbSource, nativeFrameAncestryVerified: true } },
    { ...packet, childSource: { ...packet.childSource, completeImportedSourceQualified: false } },
    { ...packet, childSource: { ...packet.childSource, childSessionId: packet.pcbSource.sessionId } },
    { ...packet, childSource: { ...packet.childSource, childTargetId: packet.pcbSource.parentTargetId } },
    { ...packet, childSource: { ...packet.childSource, unknown: true } }]) {
    assert.equal(currentPcb209RatlineNativePacketSchema.safeParse(changed).success, false);
  }
  const maximumEvidence = captureCurrentPcb209RatlineOriginEvidence({ ...nativeOriginEvidence,
    metadata: { ...nativeOriginEvidence.metadata, parentSessionId: "p".repeat(256), parentScriptId: "p".repeat(256), childUniqueContextId: "c".repeat(256) } });
  const maximum = currentPcb209RatlineNativePacketSchema.parse({ ...packet, nativeOriginEvidence: maximumEvidence,
    nativeOrigin: inspectCurrentPcb209RatlineOriginEvidence(maximumEvidence),
    pcbSource: { ...packet.pcbSource, sessionId: "p".repeat(256), parentTargetId: "p".repeat(256), frameId: "p".repeat(256),
      contextId: Number.MAX_SAFE_INTEGER, uniqueContextId: "p".repeat(256), scriptId: "p".repeat(256) },
    childSource: { ...packet.childSource, childTargetId: "c".repeat(256), childSessionId: "c".repeat(256),
      scriptId: "c".repeat(256), uniqueContextId: "c".repeat(256) } });
  assert.ok(Buffer.byteLength(JSON.stringify(maximum)) + 1024 < CURRENT_PCB_209_RATLINE_STARTUP_RESULT_MAX_BYTES);
});

void test("ratline durable journal binds original launch, opening and result while reserving its purpose", async () => {
  const createdAt = new Date(0).toISOString();
  const base = { operationId, createdAt };
  const directory = join(controlDataDirectory(), "pcb-diagnostic-lifecycle-v1", operationId);
  const rawWindowsPath = String.raw`C:\Disposable\RatlineFixture.eprj2`;
  const target = { rawWindowsPath, projectUuid: sha256Text(rawWindowsPath), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16), expectedSourceSha256: digest };
  async function publish(name: DiagnosticLifecycleRecordName, input: unknown): Promise<unknown> {
    const value = diagnosticLifecycleRecordSchemas[name].parse({ ...base, ...z.record(z.string(), z.unknown()).parse(input) });
    await publishCurrentPcbDiagnosticLifecycleRecord(operationId, name, value); return value;
  }
  await readCurrentPcbDiagnosticLifecycles(); await reserveCurrentPcbDiagnosticLifecycle(operationId);
  try {
    const intent = await publish("intent.json", { schema: "easyeda-pro-control.pcb209-ratline-startup-launch-intent.v1", purpose: "worker-startup",
      facadeSha256: digest, installationSha256: digest, confirmValidationOnly: true, confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true });
    const binding = await publish("binding.json", { schema: "easyeda-pro-control.pcb-diagnostic-launch-binding.v1", intentSha256: sha256Json(intent),
      binding: { helperInstance: "a".repeat(32), jobId: "b".repeat(32), rootPid: 123, rootCreated: "123456789012345" }, launchAcknowledged: true });
    let script: unknown;
    for (const stage of ["browser", "frames", "script"] as const) {
      const observed = await publish(`${stage}-intent.json`, { schema: "easyeda-pro-control.pcb-diagnostic-observation-intent.v1", bindingSha256: sha256Json(binding),
        stage, ...(stage === "frames" ? { targetId: "parent" } : {}), ...(stage === "script" ? { frameId: "ui-frame", family: "ui" } : {}) });
      script = await publish(`${stage}-result.json`, { schema: "easyeda-pro-control.pcb-diagnostic-observation-result.v1", intentSha256: sha256Json(observed), stage,
        result: stage === "script" ? { family: "ui", sourceVerified: true, sourceSha256: CURRENT_PCB_209_OPENING_SCRIPTS.ui.scriptSha256,
          sourceBytes: CURRENT_PCB_209_OPENING_SCRIPTS.ui.scriptBytes, relativePath: CURRENT_PCB_209_OPENING_SCRIPTS.ui.relativePath } : {}, executionAuthorized: false });
    }
    const handoff = await publish("worker-startup-handoff-intent.json", { schema: "easyeda-pro-control.pcb-worker-startup-handoff-intent.v1",
      bindingSha256: sha256Json(binding), scriptResultSha256: sha256Json(script) });
    const handedOff = await publish("worker-startup-handoff-result.json", { schema: "easyeda-pro-control.pcb-worker-startup-handoff-result.v1",
      intentSha256: sha256Json(handoff), originalParentRetained: true, handoffIrreversible: true, executionAuthorized: false });
    const opening = await publish("worker-startup-opening-intent.json", { schema: "easyeda-pro-control.pcb-worker-startup-opening-intent.v1",
      bindingSha256: sha256Json(binding), handoffResultSha256: sha256Json(handedOff), target,
      preparationCheckpoint: { path: "/synthetic/checkpoint.eprj2", bytes: 8192, sha256: digest }, checkpointReceiptSha256: digest, beforeSqlSha256: digest,
      confirmDisposableProject: true, acceptNormalOpenEffects: true, acceptDebuggerPauseEffects: true });
    const construction = { profile: "private.current-pcb209-worker-construction.v1", pauses: 9, originalConstructorAndFactoryEventsRetained: true,
      originalProjectReceiverMatched: true, channelNativeIntrinsicAndPeerOwnershipVerified: false, wrapperAssignmentRelationVerified: false,
      nativeStartupIntegrationVerified: false, writeDestinationsContained: false, executionAuthorized: false };
    const opened = await publish("worker-startup-opening-result.json", { schema: "easyeda-pro-control.pcb-worker-startup-opening-result.v1",
      intentSha256: sha256Json(opening), result: { construction, opening: { schema: "easyeda-pro-control.pcb-diagnostic-opening.v1", phase: "open-project",
        projectUuid: target.projectUuid, branchUuid: target.branchUuid, documentUuid: target.documentUuid, ok: true, status: "opened-prefix-observed",
        failure: null, dispatchAttempted: true, observation: { windowTabId: "window" }, executionAuthorized: false, persistenceVerified: false },
      workerIdentity: { projectUuid: target.projectUuid, branchUuid: target.branchUuid, windowTabId: "window" }, ancillaryFrame: null,
      executionAuthorized: false, persistenceVerified: false }, executionAuthorized: false });
    const ratline = await publish("worker-startup-ratline-intent.json", { schema: "easyeda-pro-control.pcb209-worker-startup-ratline-intent.v1",
      bindingSha256: sha256Json(binding), openingIntentSha256: sha256Json(opening), openingResultSha256: sha256Json(opened),
      acceptNormalOpenEffects: true, acceptDebuggerPause: true });
    const result = diagnosticLifecycleRecordSchemas["worker-startup-ratline-result.json"].parse(await publish("worker-startup-ratline-result.json", {
      schema: "easyeda-pro-control.pcb209-worker-startup-ratline-result.v1", intentSha256: sha256Json(ratline),
      result: { ...packet, targetSha256: sha256Json(target), originalProjectConstructionSha256: sha256Json(construction) },
      validationOnly: true, executionAuthorized: false, saveAuthorized: false }));
    const operations = await readCurrentPcbDiagnosticLifecycles();
    assert.equal(sha256Json(operations.find(value => value.operationId === operationId)?.records["worker-startup-ratline-result.json"]), sha256Json(result));
    const path = join(directory, "worker-startup-ratline-result.json");
    for (const change of [{ targetSha256: digest }, { originalProjectConstructionSha256: digest }]) {
      const changed = diagnosticLifecycleRecordSchemas["worker-startup-ratline-result.json"].parse({ ...result, result: { ...result.result, ...change } });
      await writeFile(path, JSON.stringify(changed)); await assert.rejects(readCurrentPcbDiagnosticLifecycles(), /RATLINE209_RESULT_CHAIN/u);
    }
    await writeFile(path, JSON.stringify(result));
    for (const stage of ["assignments", "actor", "channel"] as const) {
      assert.equal(diagnosticLifecycleRecordSchemas[`worker-startup-${stage}-intent.json`].safeParse({ ...base,
        schema: `easyeda-pro-control.pcb-worker-startup-${stage}-intent.v1`, bindingSha256: digest,
        ...(stage === "assignments" ? { openingResultSha256: digest } : { assignmentsResultSha256: digest }) }).success, false);
    }
    await writeFile(join(directory, "intent.json"), JSON.stringify({ ...base, schema: "easyeda-pro-control.pcb-diagnostic-launch-intent.v1",
      facadeSha256: digest, installationSha256: digest, confirmValidationOnly: true, confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true }));
    await assert.rejects(readCurrentPcbDiagnosticLifecycles(), /RESERVED_WORKER_STARTUP_RATLINE209_PURPOSE_ID/u);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
