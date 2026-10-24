/** Join actual inert-runner packets to a synthetic lifecycle journal. No native owner is issued. */
import assert from "node:assert/strict";
import { rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import { controlDataDirectory } from "../../src/artifacts.ts";
import { sha256Json } from "../../src/core.ts";
import { CURRENT_PCB_209_OPENING_SCRIPTS } from "../../src/current-pcb-209-opening-profile.ts";
import type { CurrentPcb209EmptyBaselinePacket } from "../../src/current-pcb-209-empty-baseline-session.ts";
import { diagnosticLifecycleRecordSchemas, publishCurrentPcbDiagnosticLifecycleRecord, readCurrentPcbDiagnosticLifecycles,
  reserveCurrentPcbDiagnosticLifecycle } from "../../src/current-pcb-diagnostic-lifecycle-journal.ts";
import type { DiagnosticLifecycleRecordName } from "../../src/current-pcb-diagnostic-lifecycle-journal.ts";

export async function assertEmptyStartupJournal(baseline: CurrentPcb209EmptyBaselinePacket, rawWindowsPath: string,
  nativeCommands: number): Promise<void> {
  const createdAt = new Date(0).toISOString(), digest = "a".repeat(64), operationId = "pcb209-empty-real-packet-journal";
  const base = { operationId, createdAt }, directory = join(controlDataDirectory(), "pcb-diagnostic-lifecycle-v1", operationId);
  const target = { rawWindowsPath, ...baseline.common.identity, expectedSourceSha256: digest };
  const binding = { helperInstance: "a".repeat(32), jobId: "b".repeat(32), rootPid: 123, rootCreated: "123456789012345" };
  const record: Partial<Record<DiagnosticLifecycleRecordName, unknown>> = {};
  async function publish(name: DiagnosticLifecycleRecordName, input: unknown): Promise<unknown> {
    const parsed = diagnosticLifecycleRecordSchemas[name].parse({ ...base, ...z.record(z.string(), z.unknown()).parse(input) });
    await publishCurrentPcbDiagnosticLifecycleRecord(operationId, name, parsed); record[name] = parsed; return parsed;
  }
  await reserveCurrentPcbDiagnosticLifecycle(operationId);
  try {
    const intent = await publish("intent.json", { schema: "easyeda-pro-control.pcb209-empty-startup-launch-intent.v1", purpose: "worker-startup",
      facadeSha256: digest, installationSha256: digest, confirmValidationOnly: true, confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true });
    const bound = await publish("binding.json", { schema: "easyeda-pro-control.pcb-diagnostic-launch-binding.v1",
      intentSha256: sha256Json(intent), binding, launchAcknowledged: true });
    let script: unknown;
    for (const stage of ["browser", "frames", "script"] as const) {
      const observed = await publish(`${stage}-intent.json`, { schema: "easyeda-pro-control.pcb-diagnostic-observation-intent.v1",
        bindingSha256: sha256Json(bound), stage, ...(stage === "frames" ? { targetId: "parent" } : {}),
        ...(stage === "script" ? { frameId: "ui-frame", family: "ui" } : {}) });
      script = await publish(`${stage}-result.json`, { schema: "easyeda-pro-control.pcb-diagnostic-observation-result.v1",
        intentSha256: sha256Json(observed), stage, result: stage === "script" ? { family: "ui", sourceVerified: true,
          sourceSha256: CURRENT_PCB_209_OPENING_SCRIPTS.ui.scriptSha256, sourceBytes: CURRENT_PCB_209_OPENING_SCRIPTS.ui.scriptBytes,
          relativePath: CURRENT_PCB_209_OPENING_SCRIPTS.ui.relativePath } : {}, executionAuthorized: false });
    }
    const handoff = await publish("worker-startup-handoff-intent.json", { schema: "easyeda-pro-control.pcb-worker-startup-handoff-intent.v1",
      bindingSha256: sha256Json(bound), scriptResultSha256: sha256Json(script) });
    const handedOff = await publish("worker-startup-handoff-result.json", { schema: "easyeda-pro-control.pcb-worker-startup-handoff-result.v1",
      intentSha256: sha256Json(handoff), originalParentRetained: true, handoffIrreversible: true, executionAuthorized: false });
    const opening = await publish("worker-startup-opening-intent.json", { schema: "easyeda-pro-control.pcb-worker-startup-opening-intent.v1",
      bindingSha256: sha256Json(bound), handoffResultSha256: sha256Json(handedOff), target,
      preparationCheckpoint: { path: "/synthetic/checkpoint.eprj2", bytes: 8192, sha256: baseline.common.historicalHeader.checkpointSha256 },
      checkpointReceiptSha256: digest, beforeSqlSha256: baseline.common.historicalHeader.beforeSqlSha256,
      confirmDisposableProject: true, acceptNormalOpenEffects: true, acceptDebuggerPauseEffects: true });
    const construction = { profile: "private.current-pcb209-worker-construction.v1", pauses: 9,
      originalConstructorAndFactoryEventsRetained: true, originalProjectReceiverMatched: true,
      channelNativeIntrinsicAndPeerOwnershipVerified: false, wrapperAssignmentRelationVerified: false,
      nativeStartupIntegrationVerified: false, writeDestinationsContained: false, executionAuthorized: false };
    const opened = await publish("worker-startup-opening-result.json", { schema: "easyeda-pro-control.pcb-worker-startup-opening-result.v1",
      intentSha256: sha256Json(opening), result: { construction, opening: {
        schema: "easyeda-pro-control.pcb-diagnostic-opening.v1", phase: "open-project", ...baseline.common.identity,
        ok: true, status: "opened-prefix-observed", failure: null, dispatchAttempted: true, observation: { windowTabId: "window" },
        executionAuthorized: false, persistenceVerified: false }, workerIdentity: { projectUuid: target.projectUuid,
        branchUuid: target.branchUuid, windowTabId: "window" }, ancillaryFrame: null, executionAuthorized: false, persistenceVerified: false },
      executionAuthorized: false });
    const empty = await publish("worker-startup-empty-intent.json", { schema: "easyeda-pro-control.pcb209-worker-startup-empty-intent.v1",
      bindingSha256: sha256Json(bound), openingIntentSha256: sha256Json(opening), openingResultSha256: sha256Json(opened), acceptNormalOpenEffects: true });
    const tabId = `${target.documentUuid}@${target.projectUuid}`;
    const pcb = { profile: "private.current-pcb209-worker-startup-pcb-session.v1", targetSha256: sha256Json(target),
      constructionPacketSha256: sha256Json(construction), sourceObservation: {
        schema: "easyeda-pro-control.pcb-diagnostic-pcb-frame-observation.v1", projectUuid: target.projectUuid, documentUuid: target.documentUuid,
        tabId, family: "pcb", sourceVerified: true, sourceSha256: CURRENT_PCB_209_OPENING_SCRIPTS.pcb.scriptSha256,
        sourceBytes: CURRENT_PCB_209_OPENING_SCRIPTS.pcb.scriptBytes, domOwnerVerified: true, targetId: "parent", sessionId: "parent-session",
        frame: { id: "pcb-frame", loaderId: "loader", url: "https://client/editor?entry=pcb", securityOrigin: "https://client", parentId: "ui-frame" },
        context: { id: 2, uniqueId: "pcb-context" }, scriptId: "pcb-script", projectWorkerAssociationVerified: false,
        compilerOwnerVerified: false, startupQualified: false, executionAuthorized: false, continuousObservation: false },
      openingObservation: { schema: "easyeda-pro-control.pcb-diagnostic-pcb-opening.v1", phase: "observe", ...baseline.common.identity, tabId,
        ok: true, status: "frame-observed", failure: null, dispatchAttempted: false, publicResult: null, nativeWorkMayRemain: false,
        frameObserved: true, windowTabId: "window", frameSourceVerified: false, restorationCompletionVerified: false,
        startupQualified: false, persistenceVerified: false, queueCompletionVerified: false, executionAuthorized: false, nativeIntrinsicsVerified: false },
      originalSessionContinued: true, nativeCommands: 20, completeLiveBaselineVerified: false, startupCompletionVerified: false,
      executionAuthorized: false, saveAuthorized: false };
    const result = { profile: "private.current-pcb209-worker-startup-empty-session.v1", pcbPacketSha256: sha256Json(pcb), baseline,
      originalPcbSessionRetained: true, originalNativeDependencyRetained: true, nativeCommands,
      completeLiveBaselineVerified: false, startupCompletionVerified: false, executionAuthorized: false, saveAuthorized: false };
    const schema = diagnosticLifecycleRecordSchemas["worker-startup-empty-result.json"];
    const completed = schema.parse(await publish("worker-startup-empty-result.json", { schema: "easyeda-pro-control.pcb209-worker-startup-empty-result.v1",
      intentSha256: sha256Json(empty), pcb, result, validationOnly: true, executionAuthorized: false, saveAuthorized: false }));
    const operations = await readCurrentPcbDiagnosticLifecycles();
    assert.deepEqual(operations.find(value => value.operationId === operationId)?.records, record);
    for (const changed of [{ ...completed, executionAuthorized: true }, { ...completed, unexpected: true },
      { ...completed, result: { ...result, pcbPacketSha256: digest } },
      { ...completed, result: { ...result, nativeCommands: 3100 } },
      { ...completed, pcb: { ...pcb, nativeCommands: 21 } },
      { ...completed, result: { ...result, baseline: { ...baseline, completeLiveBaselineVerified: true } } }]) {
      assert.equal(schema.safeParse(changed).success, false);
    }
    const path = join(directory, "worker-startup-empty-result.json");
    // The real scanner must reject a structurally valid packet transplanted to
    // Another sealed target, even after recomputing its enclosing PCB digest.
    const changedPcb = { ...completed.pcb, targetSha256: digest };
    const transplanted = schema.parse({ ...completed, pcb: changedPcb,
      result: { ...completed.result, pcbPacketSha256: sha256Json(changedPcb) } });
    await writeFile(path, JSON.stringify(transplanted));
    await assert.rejects(readCurrentPcbDiagnosticLifecycles(), /EMPTY209_RESULT_CHAIN/u);
    await writeFile(path, JSON.stringify(completed));
    // Reserved empty operation IDs cannot be made ordinary diagnostic owners.
    await writeFile(join(directory, "intent.json"), JSON.stringify({ ...base,
      schema: "easyeda-pro-control.pcb-diagnostic-launch-intent.v1", facadeSha256: digest, installationSha256: digest,
      confirmValidationOnly: true, confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true }));
    await assert.rejects(readCurrentPcbDiagnosticLifecycles(), /RESERVED_WORKER_STARTUP_EMPTY209_PURPOSE_ID/u);
  } finally { await rm(directory, { recursive: true, force: true }); }
}
