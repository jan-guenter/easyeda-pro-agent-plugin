/* oxlint-disable import/max-dependencies -- Boundary tests join the actual generation facades, journal schemas and private original-method adapter. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Json, sha256Text } from "../src/core.ts";
import { CurrentPcb209DiagnosticLifecycle, CurrentPcb209WorkerStartupLifecycle,
  CurrentPcbWorkerStartupLifecycle } from "../src/current-pcb-diagnostic-lifecycle.ts";
import type { CurrentPcbDiagnosticLifecycleOptions } from "../src/current-pcb-diagnostic-lifecycle.ts";
import { diagnosticLifecycleRecordSchemas } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";
import { currentPcb209WorkerStartupValidationRequestSchema, validateCurrentPcb209WorkerStartupArguments } from "../src/current-pcb-209-worker-startup-validation.ts";
import { currentPcb209WorkerStartupActorPacketSchema } from "../src/current-pcb-209-worker-startup-actor.ts";
import { CurrentPcbWorkerStartupActorRunner } from "../src/current-pcb-worker-startup-actor-runner.ts";
import { adaptCurrentPcb209WorkerStartupLifecycle } from "../src/current-pcb-worker-startup-lifecycle-adapter.ts";
import type { CurrentPcb209WorkerStartupOpeningCoordinator } from "../src/current-pcb-worker-startup-lifecycle-adapter.ts";
import type { CurrentPcb209WorkerStartupOpeningResult } from "../src/current-pcb-209-worker-startup-opening.ts";
import { currentDisposableOpenSealedTargetSchema } from "../src/current-disposable-open.ts";

const digest = "a".repeat(64), id = "pcb209-startup-generation-boundary";
const launch = { action: "launch", operationId: id, confirmValidationOnly: true, confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true };
const identity = { projectUuid: digest, branchUuid: "b".repeat(32), windowTabId: "window" };
const opening = { schema: "easyeda-pro-control.pcb-diagnostic-opening.v1", phase: "open-project", projectUuid: identity.projectUuid,
  branchUuid: identity.branchUuid, documentUuid: "d".repeat(16), ok: true, status: "opened-prefix-observed", failure: null,
  dispatchAttempted: true, observation: { windowTabId: identity.windowTabId }, executionAuthorized: false, persistenceVerified: false };
const construction = { profile: "private.current-pcb209-worker-construction.v1", pauses: 9,
  originalConstructorAndFactoryEventsRetained: true, originalProjectReceiverMatched: true,
  channelNativeIntrinsicAndPeerOwnershipVerified: false, wrapperAssignmentRelationVerified: false,
  nativeStartupIntegrationVerified: false, writeDestinationsContained: false, executionAuthorized: false };

void test("209 startup reserves its own ID and launch schema without adopting either older facade", async () => {
  const options: CurrentPcbDiagnosticLifecycleOptions = { pluginRoot: "/synthetic/plugin", assetsRoot: "/synthetic/assets",
    powershellSha256: digest, powershellBytes: 1, assertAllowed: unused, assertLocalAllowed: unused, assertOtherLaunchesSettled: unused };
  const current = new CurrentPcb209WorkerStartupLifecycle(options, { allocateOwner: unused, verifyInstallation: unused });
  const inspection = await current.run({ action: "inspect", operationId: id });
  assert.equal(inspection["state"], "not-found");
  const openingOnly = new CurrentPcb209DiagnosticLifecycle(options, { allocateOwner: unused, verifyInstallation: unused });
  const legacy = new CurrentPcbWorkerStartupLifecycle(options, { allocateOwner: unused, verifyInstallation: unused });
  await assert.rejects(openingOnly.run({ action: "inspect", operationId: id }), /GENERATION_MISMATCH/u);
  await assert.rejects(legacy.run({ action: "inspect", operationId: id }));
  for (const operationId of ["pcb209-other", "worker-startup-other", "diagnostic-other"]) {
    await assert.rejects(current.run({ action: "inspect", operationId }));
    assert.equal(currentPcb209WorkerStartupValidationRequestSchema.safeParse({ ...launch, operationId }).success, false);
  }
  assert.equal(validateCurrentPcb209WorkerStartupArguments(launch)["valid"], true);
  assert.equal(validateCurrentPcb209WorkerStartupArguments({ ...launch, sourceProfile: {} })["valid"], false);
  const intent = { ...launch, schema: "easyeda-pro-control.pcb209-worker-startup-launch-intent.v1", purpose: "worker-startup",
    createdAt: new Date(0).toISOString(), facadeSha256: digest, installationSha256: digest };
  const { action: ignored, ...record } = intent; assert.equal(ignored, "launch");
  assert.equal(diagnosticLifecycleRecordSchemas["intent.json"].safeParse(record).success, true);
  assert.equal(diagnosticLifecycleRecordSchemas["intent.json"].safeParse({ ...record,
    schema: "easyeda-pro-control.pcb-worker-startup-launch-intent.v1" }).success, false);
  assert.equal(diagnosticLifecycleRecordSchemas["intent.json"].safeParse({ ...record, operationId: "worker-startup-other" }).success, false);
});

void test("startup opening journal binds construction profile to generation without accepting the other profile", () => {
  const record = { schema: "easyeda-pro-control.pcb-worker-startup-opening-result.v1", operationId: id,
    createdAt: new Date(0).toISOString(), intentSha256: digest, executionAuthorized: false,
    result: { opening, construction, workerIdentity: identity, ancillaryFrame: null, executionAuthorized: false, persistenceVerified: false } };
  const schema = diagnosticLifecycleRecordSchemas["worker-startup-opening-result.json"];
  assert.equal(schema.safeParse(record).success, true);
  assert.equal(schema.safeParse({ ...record, operationId: "worker-startup-other" }).success, false);
  assert.equal(schema.safeParse({ ...record, result: { ...record.result,
    construction: { ...construction, profile: "private.current-pcb-worker-construction.v1" } } }).success, false);
});

void test("209 actor wrapper preserves the original four samples and rejects wrong generation or changed hashes", async () => {
  const user = { uuid: "f".repeat(32), nickname: "", username: "", avatar: "" };
  const actor = { uuid: user.uuid, nickname: "", username: "" };
  const stamp = { milliseconds: 1000, iso: new Date(1000).toISOString(), timezoneOffsetMinutes: 0 };
  const base = { schema: "easyeda-pro-control.pcb-worker-startup-actor.v1", identity,
    workerUser: user, workerUserText: JSON.stringify(user), clock: { before: stamp, after: stamp } };
  const runner = new CurrentPcbWorkerStartupActorRunner({
    observeUi: (): Promise<unknown> => reply({ ...base, phase: "ui", cachedActor: actor, startupActor: actor }),
    observeWorker: (): Promise<unknown> => reply({ ...base, phase: "worker", originalProjectReceiverMatched: true, originalWorkerBusMatched: true }),
    assertCurrent: (): Promise<void> => Promise.resolve(),
  }, identity);
  const body = { profile: "private.current-pcb209-worker-startup-actor.v1", sourceClosureSha256: digest,
    originalActorPacket: await runner.observe(), originalConstructorOwnerVerified: false, nativeSourceContextsOwned: false,
    nativeIntrinsicsVerified: false, clockProvenanceVerified: false, futureSaveClockVerified: false,
    compatibilityAdmitted: false, executionAuthorized: false, saveAuthorized: false };
  const packet = currentPcb209WorkerStartupActorPacketSchema.parse({ ...body, packetSha256: sha256Json(body) });
  assert.equal(currentPcb209WorkerStartupActorPacketSchema.safeParse({ ...packet, sourceClosureSha256: "e".repeat(64) }).success, false);
  const record = { schema: "easyeda-pro-control.pcb-worker-startup-actor-result.v1", operationId: id,
    createdAt: new Date(0).toISOString(), intentSha256: digest, result: packet, pointInTimeObservation: true,
    executionAuthorized: false, saveAuthorized: false };
  const schema = diagnosticLifecycleRecordSchemas["worker-startup-actor-result.json"];
  assert.equal(schema.safeParse(record).success, true);
  assert.equal(schema.safeParse({ ...record, operationId: "worker-startup-other" }).success, false);
  assert.equal(schema.safeParse({ ...record, result: packet.originalActorPacket }).success, false);
});

void test("private generation adapter requires its original result and actual captured methods", async () => {
  // The adapter test supplies a typed fixture, not a source/ownership claim.
  const result: CurrentPcb209WorkerStartupOpeningResult = { opening: unusedOpening(), construction: {
    ...construction, profile: "private.current-pcb209-worker-construction.v1", pauses: 9, originalConstructorAndFactoryEventsRetained: true,
    originalProjectReceiverMatched: true, channelNativeIntrinsicAndPeerOwnershipVerified: false, wrapperAssignmentRelationVerified: false,
    nativeStartupIntegrationVerified: false, writeDestinationsContained: false, executionAuthorized: false,
  }, workerIdentity: identity, ancillaryFrame: null, executionAuthorized: false, persistenceVerified: false };
  let checks = 0;
  const owner: CurrentPcb209WorkerStartupOpeningCoordinator = { open: () => Promise.resolve(result), status: unused,
    retainedOpeningResult: unused, requireOriginal: selected => { assert.equal(selected, result); checks += 1; return Promise.reject(new Error("transport deliberately absent")); },
    proveCurrentAssignments: unused, requireCurrentAssignments: unused, retainedActorObservation: unused,
    observeActorClock: unused, requireActorClock: unused, retainedChannelObservation: unused,
    observeCurrentChannel: unused, requireCurrentChannel: unused, releaseAfterTermination: unused };
  const adapter = adaptCurrentPcb209WorkerStartupLifecycle(owner);
  const target = currentDisposableOpenSealedTargetSchema.parse({ rawWindowsPath: String.raw`C:\fixture.eprj2`, projectUuid: sha256Text(String.raw`C:\fixture.eprj2`),
    branchUuid: identity.branchUuid, documentUuid: "d".repeat(16), expectedSourceSha256: digest });
  const retained = await adapter.open(target, () => Promise.resolve());
  assert.throws(() => adapter.requireOriginal(structuredClone(retained)), /ORIGINAL_ADAPTER/u); assert.equal(checks, 0);
  await assert.rejects(adapter.requireOriginal(retained), /deliberately absent/u); assert.equal(checks, 1);
  owner.requireOriginal = unused;
  assert.throws(() => adapter.requireOriginal(retained), /ORIGINAL_ADAPTER/u); assert.equal(checks, 1);
});

function unused(): never { throw new Error("unexpected installation or native method"); }
function reply(value: unknown): Promise<unknown> { return Promise.resolve({ result: { type: "string", value: JSON.stringify(value) } }); }

function unusedOpening(): CurrentPcb209WorkerStartupOpeningResult["opening"] {
  return { schema: "easyeda-pro-control.pcb-diagnostic-opening.v1", phase: "open-project", projectUuid: identity.projectUuid,
    branchUuid: identity.branchUuid, documentUuid: "d".repeat(16), ok: true, status: "opened-prefix-observed", failure: null,
    dispatchAttempted: true, publicResult: true, prefixObserved: true, nativeWorkMayRemain: true,
    observation: { projectPresent: true, branchUuid: identity.branchUuid, windowTabId: identity.windowTabId,
      containerCount: 1, tabIds: [], activeTabId: "tab_page1", initialTitle: "EasyEDA Pro - V3.2",
      expectedOpenedTitle: "EasyEDA Pro - V3.2", documentTitle: "EasyEDA Pro - V3.2" },
    startupQualified: false, restorationCompletionVerified: false, persistenceVerified: false, compilerOwnerVerified: false,
    queueCompletionVerified: false, executionAuthorized: false, nativeIntrinsicsVerified: false };
}
