/* oxlint-disable import/max-dependencies -- Join real actor collectors with the managed publisher and full journal reader so an accepted packet must also survive its complete generation-bound chain. */
/** Synthetic combined lifecycle and original collector packets. No live
 * control root, EasyEDA process, inspector or design file is accessed. */
import assert from "node:assert/strict";
import { readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { controlDataDirectory } from "../src/artifacts.ts";
import { sha256Json, sha256Text } from "../src/core.ts";
import { CURRENT_PCB_209_OPENING_SCRIPTS } from "../src/current-pcb-209-opening-profile.ts";
import { currentPcb209WorkerStartupActorPacketSchema } from "../src/current-pcb-209-worker-startup-actor.ts";
import { CurrentPcb209StartupActorCollection } from "../src/current-pcb-209-worker-startup-actor-runner.ts";
import type { CurrentPcb209StartupActorCollectionPacket } from "../src/current-pcb-209-worker-startup-actor-runner.ts";
import { CurrentPcbWorkerStartupActorRunner } from "../src/current-pcb-worker-startup-actor-runner.ts";
import type { CurrentPcbWorkerStartupActorPacket, CurrentPcbWorkerStartupActorTransport } from "../src/current-pcb-worker-startup-actor-runner.ts";
import { diagnosticLifecycleRecordSchemas, publishCurrentPcbDiagnosticLifecycleRecord, readCurrentPcbDiagnosticLifecycles,
  reserveCurrentPcbDiagnosticLifecycle } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";
import type { DiagnosticLifecycleRecordName } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE } from "../src/current-footprint-copy-main-backend-source.ts";

const digest = "a".repeat(64), rawWindowsPath = String.raw`C:\synthetic-combined-actor.eprj2`;
const identity = Object.freeze({ projectUuid: sha256Text(rawWindowsPath), branchUuid: "b".repeat(32), windowTabId: "synthetic" });
function actorTransport(times: readonly number[] = []): CurrentPcbWorkerStartupActorTransport {
  let index = 0;
  const workerUser = { uuid: "f".repeat(32), nickname: "nick", username: "user", avatar: "" };
  const actor = { uuid: workerUser.uuid, username: workerUser.username, nickname: workerUser.nickname };
  const read = (phase: "ui" | "worker"): Promise<unknown> => {
    const milliseconds = 1_700_000_000_000 + (times[index] ?? 0); index += 1;
    const stamp = { milliseconds, iso: new Date(milliseconds).toISOString(), timezoneOffsetMinutes: 0 };
    return Promise.resolve({ result: { type: "string", value: JSON.stringify({ schema: "easyeda-pro-control.pcb-worker-startup-actor.v1",
      phase, identity, workerUser, workerUserText: JSON.stringify(workerUser), clock: { before: stamp, after: stamp },
      ...(phase === "ui" ? { cachedActor: actor, startupActor: actor } : { originalProjectReceiverMatched: true, originalWorkerBusMatched: true }),
    }) } });
  };
  return { observeUi: (): Promise<unknown> => read("ui"), observeWorker: (): Promise<unknown> => read("worker"), assertCurrent: (): Promise<void> => Promise.resolve() };
}
function wrap(originalActorPacket: CurrentPcbWorkerStartupActorPacket | CurrentPcb209StartupActorCollectionPacket): ReturnType<typeof currentPcb209WorkerStartupActorPacketSchema.parse> {
  const body = { profile: "private.current-pcb209-worker-startup-actor.v1", sourceClosureSha256: digest, originalActorPacket,
    originalConstructorOwnerVerified: false, nativeSourceContextsOwned: false, nativeIntrinsicsVerified: false, clockProvenanceVerified: false,
    futureSaveClockVerified: false, compatibilityAdmitted: false, executionAuthorized: false, saveAuthorized: false };
  return currentPcb209WorkerStartupActorPacketSchema.parse({ ...body, packetSha256: sha256Json(body) });
}
async function combinedChain(operationId: string): Promise<Readonly<{ intentSha256: string; directory: string }>> {
  assert.match(controlDataDirectory(), /easyeda-test-control-/u);
  const base = { operationId, createdAt: new Date(0).toISOString() };
  async function publish(name: DiagnosticLifecycleRecordName, input: Readonly<Record<string, unknown>>): Promise<unknown> {
    const parsed = diagnosticLifecycleRecordSchemas[name].parse({ ...base, ...input });
    await publishCurrentPcbDiagnosticLifecycleRecord(operationId, name, parsed); return parsed;
  }
  await reserveCurrentPcbDiagnosticLifecycle(operationId);
  const intent = await publish("intent.json", { schema: "easyeda-pro-control.footprint-combined-launch-intent.v2", purpose: "worker-startup",
    dispatchProtocol: "challenge-ready-before-launch.v1", facadeSha256: digest, installationSha256: digest,
    confirmValidationOnly: true, confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true, acceptDebuggerPauseEffects: true });
  const binding = await publish("binding.json", { schema: "easyeda-pro-control.pcb-diagnostic-launch-binding.v1", intentSha256: sha256Json(intent),
    binding: { helperInstance: "a".repeat(32), jobId: "b".repeat(32), rootPid: 123, rootCreated: "123456789012345" }, launchAcknowledged: true });
  const main = await publish("main-construction-intent.json", { schema: "easyeda-pro-control.footprint-main-construction-intent.v1", bindingSha256: sha256Json(binding) });
  await publish("main-construction-result.json", { schema: "easyeda-pro-control.footprint-main-construction-result.v1", intentSha256: sha256Json(main),
    result: { profile: "private.current-footprint-copy-main-backend-construction.v1", originalMainTransportRetained: true, runtimeAppSourceQualified: true,
      runtimeAppSourceSha256: CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE.sha256, initialContinuationCount: 1,
      registrationBreakpointArmedBeforeInitialContinuation: true, actualRegistrationLocationVerified: true,
      originalProtocolCallbackAndBackendRetained: true, originalDriverCallbackAndRouterRetained: true, originalActorClockAndSqlFunctionsRetained: true,
      originalNativeDateNowRetained: true, protocolRegistrationObserved: false, requestContextRetained: false, actualActorClockInvocationObserved: false,
      projectSqlInvocationObserved: false, responderExclusivityProven: false, executionAuthorized: false } });
  let script: unknown;
  for (const stage of ["browser", "frames", "script"] as const) {
    const observed = await publish(`${stage}-intent.json`, { schema: "easyeda-pro-control.pcb-diagnostic-observation-intent.v1", bindingSha256: sha256Json(binding), stage,
      ...(stage === "frames" ? { targetId: "parent" } : {}), ...(stage === "script" ? { frameId: "ui-frame", family: "ui" } : {}) });
    script = await publish(`${stage}-result.json`, { schema: "easyeda-pro-control.pcb-diagnostic-observation-result.v1", intentSha256: sha256Json(observed), stage,
      result: stage === "script" ? { family: "ui", sourceVerified: true, sourceSha256: CURRENT_PCB_209_OPENING_SCRIPTS.ui.scriptSha256,
        sourceBytes: CURRENT_PCB_209_OPENING_SCRIPTS.ui.scriptBytes, relativePath: CURRENT_PCB_209_OPENING_SCRIPTS.ui.relativePath } : {}, executionAuthorized: false });
  }
  const handoff = await publish("worker-startup-handoff-intent.json", { schema: "easyeda-pro-control.pcb-worker-startup-handoff-intent.v1",
    bindingSha256: sha256Json(binding), scriptResultSha256: sha256Json(script) });
  const handedOff = await publish("worker-startup-handoff-result.json", { schema: "easyeda-pro-control.pcb-worker-startup-handoff-result.v1",
    intentSha256: sha256Json(handoff), originalParentRetained: true, handoffIrreversible: true, executionAuthorized: false });
  const target = { rawWindowsPath, projectUuid: identity.projectUuid, branchUuid: identity.branchUuid, documentUuid: "d".repeat(16), expectedSourceSha256: digest };
  const opening = await publish("worker-startup-opening-intent.json", { schema: "easyeda-pro-control.pcb-worker-startup-opening-intent.v1", bindingSha256: sha256Json(binding),
    handoffResultSha256: sha256Json(handedOff), target, preparationCheckpoint: { path: "/synthetic/checkpoint.eprj2", bytes: 8192, sha256: digest },
    checkpointReceiptSha256: digest, beforeSqlSha256: digest, confirmDisposableProject: true, acceptNormalOpenEffects: true, acceptDebuggerPauseEffects: true });
  const opened = await publish("worker-startup-opening-result.json", { schema: "easyeda-pro-control.pcb-worker-startup-opening-result.v1", intentSha256: sha256Json(opening),
    result: { opening: { schema: "easyeda-pro-control.pcb-diagnostic-opening.v1", phase: "open-project", projectUuid: target.projectUuid,
      branchUuid: target.branchUuid, documentUuid: target.documentUuid, ok: true, status: "opened-prefix-observed", failure: null, dispatchAttempted: true,
      observation: { windowTabId: identity.windowTabId }, executionAuthorized: false, persistenceVerified: false },
    construction: { profile: "private.current-footprint-copy-construction.v1", pauses: 11, originalConstructorAndFactoryEventsRetained: true,
      originalProjectReceiverMatched: true, channelNativeIntrinsicAndPeerOwnershipVerified: false, wrapperAssignmentRelationVerified: false,
      nativeStartupIntegrationVerified: false, writeDestinationsContained: false, executionAuthorized: false },
    workerIdentity: identity, ancillaryFrame: null, executionAuthorized: false, persistenceVerified: false }, executionAuthorized: false });
  const assignments = await publish("worker-startup-assignments-intent.json", { schema: "easyeda-pro-control.pcb-worker-startup-assignments-intent.v1",
    bindingSha256: sha256Json(binding), openingResultSha256: sha256Json(opened) });
  const assigned = await publish("worker-startup-assignments-result.json", { schema: "easyeda-pro-control.pcb-worker-startup-assignments-result.v1", intentSha256: sha256Json(assignments),
    result: { profile: "private.current-pcb-worker-construction-assignments.v1", callbackKinds: ["uploadStructure", "structure", "cooperation", "upload"],
      originalConstructionCallbacksMatched: true, originalCallbackReceiversVerified: true, currentProjectWrapperRelationsVerified: true,
      continuousAssignmentOwnershipVerified: false, nativeChannelIntrinsicAndPeerOwnershipVerified: false, completePublishersVerified: false,
      writeDestinationsContained: false, atomicSnapshotVerified: false, queueCompletionVerified: false, executionAuthorized: false },
    pointInTimeObservation: true, executionAuthorized: false, saveAuthorized: false });
  const actor = await publish("worker-startup-actor-intent.json", { schema: "easyeda-pro-control.pcb-worker-startup-actor-intent.v1",
    bindingSha256: sha256Json(binding), assignmentsResultSha256: sha256Json(assigned) });
  return { intentSha256: sha256Json(actor), directory: join(controlDataDirectory(), "pcb-diagnostic-lifecycle-v1", operationId) };
}

void test("managed combined actor publication and complete journal read preserve both distinct timing packet generations", async () => {
  const legacy = await new CurrentPcbWorkerStartupActorRunner(actorTransport(), identity).observe();
  const current = await new CurrentPcb209StartupActorCollection(actorTransport([0, 10_000, 20_000, 30_000]), identity).observe();
  await assert.rejects(new CurrentPcbWorkerStartupActorRunner(actorTransport([0, 10_000, 20_000, 30_000]), identity).observe(), /paired local clock bracket/u);
  for (const [index, packet] of [legacy, current].entries()) {
    const operationId = `footprint-combined-actor-journal-${String(index)}`;
    const chain = await combinedChain(operationId);
    try {
      const record = diagnosticLifecycleRecordSchemas["worker-startup-actor-result.json"].parse({ operationId, createdAt: new Date(0).toISOString(),
        schema: "easyeda-pro-control.pcb-worker-startup-actor-result.v1", intentSha256: chain.intentSha256,
        result: wrap(packet), pointInTimeObservation: true, executionAuthorized: false, saveAuthorized: false });
      await publishCurrentPcbDiagnosticLifecycleRecord(operationId, "worker-startup-actor-result.json", record);
      const operations = await readCurrentPcbDiagnosticLifecycles();
      assert.deepEqual(operations.find(value => value.operationId === operationId)?.records["worker-startup-actor-result.json"], record);
      assert.equal(record.result.profile, "private.current-pcb209-worker-startup-actor.v1");
      if (record.result.profile === "private.current-pcb209-worker-startup-actor.v1") { assert.deepEqual(record.result.originalActorPacket, packet); }
      const path = join(chain.directory, "worker-startup-actor-result.json");
      const original = await readFile(path);
      await writeFile(path, JSON.stringify({ ...record, intentSha256: digest }), { mode: 0o600 });
      await assert.rejects(readCurrentPcbDiagnosticLifecycles(), /WORKER_STARTUP_ACTOR_RESULT_CHAIN/u);
      await writeFile(path, original, { mode: 0o600 });
    } finally { await rm(chain.directory, { recursive: true, force: true }); }
  }
});

void test("combined actor publication rejects crossed generations and forged timing/hash without writing a result", async () => {
  const legacy = await new CurrentPcbWorkerStartupActorRunner(actorTransport(), identity).observe();
  const current = await new CurrentPcb209StartupActorCollection(actorTransport([0, 10_000, 20_000, 30_000]), identity).observe();
  const operationId = "footprint-combined-actor-refusal";
  const chain = await combinedChain(operationId), wrapped = wrap(current);
  const record = { operationId, createdAt: new Date(0).toISOString(), schema: "easyeda-pro-control.pcb-worker-startup-actor-result.v1",
    intentSha256: chain.intentSha256, result: wrapped, pointInTimeObservation: true, executionAuthorized: false, saveAuthorized: false };
  const schema = diagnosticLifecycleRecordSchemas["worker-startup-actor-result.json"];
  try {
    for (const changed of [{ ...record, result: legacy }, { ...record, operationId: "worker-startup-actor-crossed" },
      { ...record, result: { ...wrapped, packetSha256: "f".repeat(64) } }, { ...record, saveAuthorized: true },
      { ...record, result: { ...wrapped, executionAuthorized: true } }]) {
      assert.equal(schema.safeParse(changed).success, false);
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Deliberately exercise the real managed publisher with runtime-invalid records.
      await assert.rejects(publishCurrentPcbDiagnosticLifecycleRecord(changed.operationId, "worker-startup-actor-result.json", changed as Parameters<typeof publishCurrentPcbDiagnosticLifecycleRecord<"worker-startup-actor-result.json">>[2]));
      await assert.rejects(readFile(join(chain.directory, "worker-startup-actor-result.json")), { code: "ENOENT" });
    }
    const { packetSha256: _hash, ...body } = current;
    const lateBody = { ...body, collectionElapsedMs: 70_001 };
    const late = { ...lateBody, packetSha256: sha256Json(lateBody) };
    assert.throws(() => wrap(late));
    assert.equal(schema.safeParse({ ...record, result: legacy, operationId: "worker-startup-actor-legacy" }).success, true);
    assert.equal(schema.safeParse({ ...record, result: wrap(legacy) }).success, true);
    await readCurrentPcbDiagnosticLifecycles();
  } finally { await rm(chain.directory, { recursive: true, force: true }); }
});
