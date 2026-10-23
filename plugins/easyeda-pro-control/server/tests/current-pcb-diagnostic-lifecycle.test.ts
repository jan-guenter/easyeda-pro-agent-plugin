/* oxlint-disable import/max-dependencies -- Failure provenance is tested through the existing lifecycle, owner, journal and checkpoint boundaries together. */
import assert from "node:assert/strict";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { canonicalJson, sha256Json, sha256Text } from "../src/core.ts";
import { currentPcbObservationFailure, currentPcbObservationFailureDetail, currentPcbPendingFailure } from "../src/current-pcb-observation-failure.ts";
import type { CurrentPcbDiagnosticOpeningResult } from "../src/current-pcb-diagnostic-opening.ts";
import type { CurrentPcbWorkerStartupHandoff } from "../src/current-pcb-diagnostic-owner.ts";
import { CurrentPcbWorkerStartupChannel } from "../src/current-pcb-worker-startup-channel.ts";
import { CurrentPcbWorkerStartupTransport } from "../src/current-pcb-worker-startup-transport.ts";
import type { CurrentPcbWorkerStartupOpeningResult } from "../src/current-pcb-worker-startup-opening.ts";
import type { CurrentPcbWorkerConstructionAssignments } from "../src/current-pcb-worker-construction-assignment.ts";
import { CurrentPcbWorkerStartupActorRunner } from "../src/current-pcb-worker-startup-actor-runner.ts";
import type { CurrentPcbWorkerStartupActorPacket } from "../src/current-pcb-worker-startup-actor-runner.ts";
import { CURRENT_PCB_WORKER_STARTUP_CHANNEL_OBSERVATION_LIMITS, currentPcbWorkerStartupChannelPacketSchema } from "../src/current-pcb-worker-startup-channel-observation.ts";
import type { CurrentPcbWorkerStartupChannelPacket } from "../src/current-pcb-worker-startup-channel-observation.ts";
import { createCurrentPcbDiagnosticInstallationPlan } from "../src/current-pcb-diagnostic-installation.ts";
import type { CurrentPcbDiagnosticInstallation } from "../src/current-pcb-diagnostic-installation.ts";
import { CurrentPcbDiagnosticLifecycle, CurrentPcbStringPrecreateLifecycle, CurrentPcbWorkerStartupLifecycle } from "../src/current-pcb-diagnostic-lifecycle.ts";
import type { CurrentPcbDiagnosticLifecycleDependencies, CurrentPcbDiagnosticLifecycleOptions, CurrentPcbDiagnosticLifecycleOwner,
  CurrentPcbStringPrecreateLifecycleDependencies, CurrentPcbStringPrecreateLifecycleOwner, CurrentPcbWorkerStartupLifecycleDependencies,
  CurrentPcbWorkerStartupLifecycleOwner, CurrentPcbWorkerStartupOpeningCoordinator } from "../src/current-pcb-diagnostic-lifecycle.ts";
import { LIFECYCLE_MODEL_RESULT as MODEL_RESULT } from "./helpers/current-pcb-diagnostic-lifecycle-model.ts";
import { fixture as sqlFixture } from "./helpers/symbol-sql-fixture.ts";
import { currentPcbCommonBaselineFailureSchema, currentPcbCommonBaselineRefusal, currentPcbCommonBaselineResultSchema } from "../src/current-pcb-common-baseline-validation.ts";
import { CURRENT_PCB_STRING_ACTOR_CLOCK_LIMITS } from "../src/current-pcb-string-actor-clock-runner.ts";
import type { CurrentPcbCommonBaselineFailure } from "../src/current-pcb-common-baseline-validation.ts";
import { acquireCurrentPcbDiagnosticLaunchExclusion, assertCurrentPcbDiagnosticLaunchExclusion, assertNoUnresolvedCurrentPcbDiagnosticLaunches,
  diagnosticLifecycleNoProcessReleaseProofSchema, diagnosticLifecycleRecordSchemas, diagnosticPcbOpeningSourceAccepted,
  publishCurrentPcbDiagnosticLifecycleRecord, readCurrentPcbDiagnosticLifecycles, releaseCurrentPcbDiagnosticLaunchExclusion,
  reserveCurrentPcbDiagnosticLifecycle, withCurrentPcbDiagnosticLaunchExclusion } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";

const RAW_PATH = String.raw`C:\Fixtures\Diagnostic.eprj2`;
type CurrentDisposableOpenCheckpoint = Awaited<ReturnType<NonNullable<CurrentPcbDiagnosticLifecycleDependencies["prepareCheckpoint"]>>>;
type CurrentPcbDiagnosticModelState = Awaited<ReturnType<CurrentPcbDiagnosticLifecycleOwner["observeModelState"]>>;
type CurrentPcbDiagnosticPcbOpeningResult = Awaited<ReturnType<CurrentPcbDiagnosticLifecycleOwner["openPcb"]>>;
const OPEN_TARGET = { rawWindowsPath: RAW_PATH, projectUuid: sha256Text(RAW_PATH), documentUuid: "b".repeat(16), expectedSourceSha256: "a".repeat(64) };
const OPEN_CHECKPOINT: CurrentDisposableOpenCheckpoint = {
  profile: "easyeda-pro-control.current-disposable-open-checkpoint.v1",
  preparationCheckpoint: { path: "/fixture/backup.eprj2", bytes: 8192, sha256: "a".repeat(64) },
  checkpoint: { schema: "easyeda-pro-control.checkpoint.v2", source: "/fixture/source.eprj2", checkpoint: "/fixture/backup.eprj2",
    receiptPath: "/fixture/receipt.json", createdAt: "2026-01-01T00:00:00Z", sourceIdentity: { dev: "1", ino: "2", birthtimeNs: "3", ctimeNs: "4" },
    checkpointIdentity: { dev: "1", ino: "5", birthtimeNs: "6", ctimeNs: "7" }, sourceSha256: "a".repeat(64), checkpointSha256: "a".repeat(64),
    sourceDumpSha256: "a".repeat(64), checkpointDumpSha256: "a".repeat(64), receiptSha256: "a".repeat(64) },
  targetEvidence: { projectUuid: OPEN_TARGET.projectUuid, branchUuid: "c".repeat(32), documentUuid: OPEN_TARGET.documentUuid,
    docType: "PCB", sourceSha256: "a".repeat(64), checkpointSha256: "a".repeat(64), documentSemanticSha256: "d".repeat(64),
    historySemanticSha256: "e".repeat(64), headHistoryUuid: "f".repeat(32) },
};
const OPEN_RESULT: CurrentPcbDiagnosticOpeningResult = { schema: "easyeda-pro-control.pcb-diagnostic-opening.v1", phase: "open-project",
  projectUuid: OPEN_TARGET.projectUuid, branchUuid: OPEN_CHECKPOINT.targetEvidence.branchUuid, documentUuid: OPEN_TARGET.documentUuid,
  ok: true, status: "opened-prefix-observed", failure: null, dispatchAttempted: true, publicResult: true,
  prefixObserved: true, nativeWorkMayRemain: true,
  observation: { projectPresent: true, branchUuid: OPEN_CHECKPOINT.targetEvidence.branchUuid, windowTabId: "fixture-tab",
    containerCount: 1, tabIds: [], activeTabId: "tab_page1", initialTitle: "EasyEDA Pro - V3.2",
    expectedOpenedTitle: "EasyEDA Pro - V3.2", documentTitle: "EasyEDA Pro - V3.2" },
  startupQualified: false, restorationCompletionVerified: false, persistenceVerified: false, compilerOwnerVerified: false,
  queueCompletionVerified: false, executionAuthorized: false, nativeIntrinsicsVerified: false };
const OPEN_INPUT = { target: OPEN_TARGET, confirmDisposableProject: true, acceptNormalOpenEffects: true };
const STARTUP_OPEN_INPUT = { ...OPEN_INPUT, acceptDebuggerPauseEffects: true };
const PCB_OPEN_RESULT: CurrentPcbDiagnosticPcbOpeningResult = {
  schema: "easyeda-pro-control.pcb-diagnostic-pcb-opening.v1", phase: "open-document",
  projectUuid: OPEN_TARGET.projectUuid, branchUuid: OPEN_CHECKPOINT.targetEvidence.branchUuid, documentUuid: OPEN_TARGET.documentUuid,
  tabId: `${OPEN_TARGET.documentUuid}@${OPEN_TARGET.projectUuid}`, ok: true, status: "opened", failure: null,
  dispatchAttempted: true, publicResult: `${OPEN_TARGET.documentUuid}@${OPEN_TARGET.projectUuid}`, nativeWorkMayRemain: true,
  frameObserved: false, windowTabId: "fixture-tab", frameSourceVerified: false, restorationCompletionVerified: false,
  startupQualified: false, persistenceVerified: false, queueCompletionVerified: false, executionAuthorized: false, nativeIntrinsicsVerified: false,
};
const PCB_OBSERVATION: CurrentPcbDiagnosticPcbOpeningResult = { ...PCB_OPEN_RESULT, phase: "observe", status: "frame-observed",
  dispatchAttempted: false, publicResult: null, nativeWorkMayRemain: false, frameObserved: true };
const PCB_SOURCE_RESULT = { family: "pcb", projectUuid: OPEN_TARGET.projectUuid, documentUuid: OPEN_TARGET.documentUuid,
  tabId: PCB_OPEN_RESULT.tabId, sourceVerified: true, domOwnerVerified: true, openingObservation: PCB_OBSERVATION, executionAuthorized: false };

function directory(id: string): string {
  const root = process.env["EASYEDA_CONTROL_DATA_DIR"];
  assert.ok(root !== undefined && root.includes("easyeda-test-control-")); assert.match(id, /^(?:diagnostic-test|string-precreate-test|worker-startup-test)-[a-z0-9-]+$/u);
  return join(root, "pcb-diagnostic-lifecycle-v1", id);
}
function launch(id: string): Record<string, unknown> {
  return { action: "launch", operationId: id, confirmValidationOnly: true, confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true };
}
type FixtureDependencies = CurrentPcbDiagnosticLifecycleDependencies & Pick<CurrentPcbWorkerStartupLifecycleDependencies, "createStartupOpening">;
function fixture(context: TestContext, id: string, dependencies: FixtureDependencies = {}, sharedAdmission?: () => Promise<void>): {
  coordinator: CurrentPcbDiagnosticLifecycle; owner: CurrentPcbStringPrecreateLifecycleOwner & CurrentPcbWorkerStartupLifecycleOwner;
  options: CurrentPcbDiagnosticLifecycleOptions; calls: string[];
  state: { bound: boolean; closed: boolean; terminated: boolean; released: boolean; failLaunch: boolean;
    failClose: boolean; cleanupOnly: boolean; failOther: boolean; failAllowed: boolean; installationDrift: boolean;
    rootless: "not-issued" | "native-refused" | null; creationState: "not-entered" | "returned-false"; noProcessHealthy: boolean };
  request: (action: string, extra?: Record<string, unknown>) => Promise<Record<string, unknown>>;
} {
  const calls: string[] = [];
  const state: { bound: boolean; closed: boolean; terminated: boolean; released: boolean; failLaunch: boolean;
    failClose: boolean; cleanupOnly: boolean; failOther: boolean; failAllowed: boolean; installationDrift: boolean;
    rootless: "not-issued" | "native-refused" | null; creationState: "not-entered" | "returned-false"; noProcessHealthy: boolean } = {
    bound: false, closed: false, terminated: false, released: false, failLaunch: false,
    failClose: false, cleanupOnly: false, failOther: false, failAllowed: false, installationDrift: false,
    rootless: null, creationState: "not-entered", noProcessHealthy: true };
  const binding = (): { helperInstance: string; jobId: string; rootPid: number; rootCreated: string } => ({
    helperInstance: "b".repeat(32), jobId: "c".repeat(32), rootPid: 123,
    rootCreated: state.cleanupOnly ? "0" : "123456789012345",
  });
  const stringPurpose = id.startsWith("string-precreate-");
  const startupPurpose = id.startsWith("worker-startup-");
  let ownerPurpose: "diagnostic" | "string-precreate" | "worker-startup" = "diagnostic";
  if (stringPurpose) { ownerPurpose = "string-precreate"; }
  else if (startupPurpose) { ownerPurpose = "worker-startup"; }
  let originalInventory: Awaited<ReturnType<typeof sqlFixture>>["before"] | null = null;
  let originalCheckpoint = structuredClone(OPEN_CHECKPOINT);
  const owner: CurrentPcbStringPrecreateLifecycleOwner & CurrentPcbWorkerStartupLifecycleOwner = {
    status: () => ({ profile: ownerPurpose, stringPrecreateConsumed: calls.includes("string-precreate"), helperPid: 456, binding: state.bound ? binding() : null, failure: null, busy: false,
      launchConsumed: state.bound, closeConsumed: state.closed, released: state.released, helperClosed: state.released,
      browserObservationConsumed: calls.includes("browser"), frameInspectionConsumed: calls.includes("frames"),
      scriptInspectionConsumed: calls.includes("script"), diagnosticFailure: null, diagnosticFailureObservation: null,
      projectOpeningConsumed: calls.includes("open-preflight"), projectOpeningResult: calls.includes("native-opening-reply") ? OPEN_RESULT : null,
      modelObservationConsumed: calls.includes("model-state"),
      pcbOpeningConsumed: calls.includes("pcb-preflight"), pcbOpeningResult: calls.includes("native-pcb-reply") ? PCB_OPEN_RESULT : null,
      pcbObservationConsumed: calls.includes("pcb-observation"), pcbFrameObservation: calls.includes("pcb-observation") ? PCB_OBSERVATION : null,
      pcbSourceQualified: calls.includes("pcb-observation"), nativeLaunchError: null, nativeSendError: null, createProcessError: null,
      noProcessCleanupAvailable: state.rootless !== null && calls.includes("launch") && state.noProcessHealthy && !state.released,
      cleanupOnly: state.cleanupOnly, frameWorkerVerified: false, executionAuthorized: false }),
    launch: async () => {
      calls.push("launch");
      const intent = await readFile(join(directory(id), "intent.json"), "utf8");
      assert.match(intent, { diagnostic: /diagnostic-launch-intent/u, "string-precreate": /string-precreate-launch-intent/u,
        "worker-startup": /worker-startup-launch-intent/u }[ownerPurpose]);
      if (state.rootless !== null) { throw new Error("synthetic settled rootless refusal"); }
      state.bound = true;
      if (state.failLaunch || state.cleanupOnly) { throw new Error("synthetic lost launch acknowledgment"); }
      return binding();
    },
    observeApplicationWindow: () => { calls.push("window"); return Promise.resolve("12345"); },
    requestNormalClose: async hwnd => {
      calls.push("close"); assert.equal(hwnd, "12345");
      const intent = await readFile(join(directory(id), "close-intent.json"), "utf8"); assert.match(intent, /12345/u);
      state.closed = true;
      if (state.failClose) { throw new Error("synthetic lost close acknowledgment"); }
    },
    observeTermination: () => { calls.push("termination"); return Promise.resolve(state.terminated); },
    releaseClosed: async () => {
      calls.push("release"); assert.equal(state.terminated, true);
      const intent = await readFile(join(directory(id), "release-intent.json"), "utf8"); assert.match(intent, /diagnostic-release-intent/u);
      state.released = true;
    },
    releaseUnlaunched: async () => {
      calls.push("release-unlaunched"); assert.equal(state.bound, false);
      const intent = await readFile(join(directory(id), "unlaunched-release-intent.json"), "utf8");
      assert.match(intent, /nativeLaunchInvoked/u); state.released = true;
    },
    releaseNoProcess: async () => {
      calls.push("release-no-process"); assert.equal(state.bound, false); assert.ok(state.rootless !== null && state.noProcessHealthy);
      const intent = await readFile(join(directory(id), "no-process-release-intent.json"), "utf8");
      assert.match(intent, /originalLaunchMethodInvoked/u); state.released = true;
      return { launchRequestOutcome: state.rootless, creationState: state.creationState, processCreated: false, released: true };
    },
    browserObservation: () => { calls.push("browser"); return Promise.resolve({ targets: [{ targetId: "target-1" }], executionAuthorized: false }); },
    inspectFrames: targetId => { calls.push("frames"); assert.equal(targetId, "target-1"); return Promise.resolve({ frames: [{ id: "frame-1" }], executionAuthorized: false }); },
    inspectScript: (frameId, profile) => {
      calls.push("script"); assert.equal(frameId, "frame-1");
      return Promise.resolve({ sourceVerified: true, family: profile.family, executionAuthorized: false });
    },
    inspectWorkers: () => {
      calls.push("workers");
      return Promise.resolve({ workers: [{ targetId: "worker-1" }], executionAuthorized: false });
    },
    inspectWorkerScript: targetId => {
      calls.push("worker-script"); assert.equal(targetId, "worker-1");
      return Promise.resolve({ sourceVerified: true, executionAuthorized: false });
    },
    observeWorkerState: () => {
      calls.push("worker-state");
      return Promise.resolve({ queueCompletionVerified: false, executionAuthorized: false });
    },
    observeStringPrecreate: async before => {
      calls.push("string-precreate"); assert.ok(originalInventory); assert.equal(before, originalInventory);
      const intent = await readFile(join(directory(id), "string-precreate-intent.json"), "utf8");
      assert.match(intent, /pcbOpeningResultSha256/u);
      return { schema: "easyeda-pro-control.pcb-string-precreate-observation.v1",
        target: { projectUuid: OPEN_TARGET.projectUuid, branchUuid: OPEN_CHECKPOINT.targetEvidence.branchUuid,
          documentUuid: OPEN_TARGET.documentUuid, windowTabId: "fixture-tab" },
        first: { synthetic: true }, second: { synthetic: true }, matchingSamples: true, originalContextsRechecked: true,
        atomicSnapshotVerified: false, projectWorkerAssociationVerified: false, publicationCaptureVerified: false,
        completeLiveSourceVerified: false, continuousObservation: false, queueCompletionVerified: false, saveAuthorized: false, executionAuthorized: false };
    },
    observeCommonBaseline: async before => {
      calls.push("common-baseline"); assert.equal(before, originalInventory);
      const intent = await readFile(join(directory(id), "common-baseline-intent.json"), "utf8");
      assert.match(intent, new RegExp(before.logicalSha256, "u"));
      return currentPcbCommonBaselineResultSchema.parse({ schema: "easyeda-pro-control.pcb-common-baseline-observation.v1",
        identity: { projectUuid: OPEN_TARGET.projectUuid, branchUuid: OPEN_CHECKPOINT.targetEvidence.branchUuid, documentUuid: OPEN_TARGET.documentUuid },
        beforeSqlSha256: before.logicalSha256, checkpointSha256: before.checkpointSha256, historicalHeaderSha256: "a".repeat(64),
        observationSha256: "b".repeat(64), relationSha256: "c".repeat(64), packetSha256: "d".repeat(64),
        retainedReplySha256: Object.fromEntries(["presentation", "rules", "preference", "assets", "metadata"].map(name => [name, "e".repeat(64)])),
        commonRowCount: 62, documentCount: 2, originalRunnerIssued: true, originalCompletedSqlReaderRetained: true,
        historicalHeaderJoined: true, completeTargetCommonAndMetaMatched: true,
        atomicSnapshotVerified: false, continuousObservation: false, completeLiveBaselineVerified: false,
        completeStoredAssetsOwnershipVerified: false, queueCompletionVerified: false, completeEffectVerified: false,
        closedFileOwnershipVerified: false, savedVerified: false, reopenedVerified: false, saveAuthorized: false, executionAuthorized: false });
    },
    retainedCommonBaselineFailure: () => null,
    handoffWorkerStartup: async () => {
      calls.push("worker-startup-handoff");
      const intent = await readFile(join(directory(id), "worker-startup-handoff-intent.json"), "utf8");
      assert.match(intent, /scriptResultSha256/u);
      throw new Error("synthetic consumed handoff failure");
    },
    observeModelState: () => {
      calls.push("model-state");
      return Promise.resolve(structuredClone(MODEL_RESULT));
    },
    openProject: async (target, reverify) => {
      calls.push("open-preflight");
      assert.deepEqual(target, { ...OPEN_TARGET, branchUuid: OPEN_CHECKPOINT.targetEvidence.branchUuid });
      const intent = await readFile(join(directory(id), "project-opening-intent.json"), "utf8");
      assert.match(intent, /diagnostic-project-opening-intent/u);
      await reverify(); calls.push("open-dispatch", "native-opening-reply");
      return structuredClone(OPEN_RESULT);
    },
    openPcb: async (target, reverify) => {
      calls.push("pcb-preflight");
      assert.deepEqual(target, { ...OPEN_TARGET, branchUuid: OPEN_CHECKPOINT.targetEvidence.branchUuid });
      const intent = await readFile(join(directory(id), "pcb-open-intent.json"), "utf8");
      assert.match(intent, /diagnostic-pcb-open-intent/u);
      await reverify(); calls.push("pcb-dispatch", "native-pcb-reply");
      return structuredClone(PCB_OPEN_RESULT);
    },
    observePcbOpening: (target, profile) => {
      calls.push("pcb-observation");
      assert.deepEqual(target, { ...OPEN_TARGET, branchUuid: OPEN_CHECKPOINT.targetEvidence.branchUuid }); assert.equal(profile.family, "pcb");
      return Promise.resolve(structuredClone(PCB_SOURCE_RESULT));
    },
  };
  const options: CurrentPcbDiagnosticLifecycleOptions = {
    pluginRoot: "/mnt/c/Reviewed/Plugin", assetsRoot: "/mnt/c/Reviewed/EasyEDA/resources/app/assets",
    powershellSha256: "d".repeat(64), powershellBytes: 123,
    assertLocalAllowed: (): void => {
      // The fixture has no mutable facade collaborators.
    },
    assertAllowed: (): Promise<void> => state.failAllowed ? Promise.reject(new Error("synthetic admission refused")) : Promise.resolve(),
    assertOtherLaunchesSettled: (): Promise<void> => state.failOther ? Promise.reject(new Error("synthetic unresolved project")) : Promise.resolve(),
    ...(sharedAdmission === undefined ? {} : { assertAllowed: sharedAdmission, assertOtherLaunchesSettled: sharedAdmission }),
  };
  const commonDependencies: FixtureDependencies = {
    verifyInstallation: (): Promise<CurrentPcbDiagnosticInstallation> => Promise.resolve({ ...createCurrentPcbDiagnosticInstallationPlan(options), facadeSha256: (state.installationDrift ? "e" : "a").repeat(64) }),
    allocateOwner: (): Promise<CurrentPcbDiagnosticLifecycleOwner> => { calls.push("allocate"); return Promise.resolve(owner); },
    prepareCheckpoint: async (target): Promise<CurrentDisposableOpenCheckpoint> => {
      calls.push("prepare-checkpoint"); assert.deepEqual(target, OPEN_TARGET);
      if (stringPurpose || startupPurpose) {
        const sampled = await sqlFixture(); originalInventory = sampled.before;
        originalCheckpoint = { ...structuredClone(OPEN_CHECKPOINT),
          checkpoint: { ...OPEN_CHECKPOINT.checkpoint, checkpointSha256: sampled.before.checkpointSha256 },
          preparationCheckpoint: { path: "/fixture/backup.eprj2", bytes: 8192, sha256: sampled.before.checkpointSha256 },
          targetEvidence: { ...OPEN_CHECKPOINT.targetEvidence, checkpointSha256: sampled.before.checkpointSha256 } };
      }
      return originalCheckpoint;
    },
    verifyCheckpoint: (prepared, target): Promise<void> => {
      calls.push("verify-checkpoint"); assert.deepEqual(prepared, originalCheckpoint); assert.deepEqual(target, OPEN_TARGET);
      return Promise.resolve();
    },
    verifyHistoricalCheckpoint: (prepared, target): Promise<void> => {
      calls.push("verify-historical-checkpoint"); assert.deepEqual(prepared, originalCheckpoint); assert.deepEqual(target, OPEN_TARGET);
      return Promise.resolve();
    },
    ...dependencies,
  };
  let coordinator: CurrentPcbDiagnosticLifecycle = new CurrentPcbDiagnosticLifecycle(options, commonDependencies);
  if (stringPurpose) { coordinator = new CurrentPcbStringPrecreateLifecycle(options, { ...commonDependencies,
    readCommonInventory: (prepared): ReturnType<NonNullable<CurrentPcbStringPrecreateLifecycleDependencies["readCommonInventory"]>> => {
      calls.push("common-inventory"); assert.equal(prepared, originalCheckpoint); assert.ok(originalInventory); return Promise.resolve(originalInventory);
    },
    allocateOwner: (): Promise<CurrentPcbStringPrecreateLifecycleOwner> => { calls.push("allocate"); return Promise.resolve(owner); } }); }
  else if (startupPurpose) { coordinator = new CurrentPcbWorkerStartupLifecycle(options, { ...commonDependencies,
      readCommonInventory: (prepared): ReturnType<NonNullable<CurrentPcbWorkerStartupLifecycleDependencies["readCommonInventory"]>> => {
        calls.push("common-inventory"); assert.equal(prepared, originalCheckpoint); assert.ok(originalInventory); return Promise.resolve(originalInventory);
      },
      allocateOwner: async (): Promise<CurrentPcbWorkerStartupLifecycleOwner> => {
        calls.push("allocate");
        const intent = await readFile(join(directory(id), "intent.json"), "utf8");
        assert.match(intent, /worker-startup-launch-intent/u); return owner;
      } }); }
  async function request(action: string, extra: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const inspected = await coordinator.run({ action: "inspect", operationId: id });
    assert.equal(typeof inspected["bindingSha256"], "string");
    return coordinator.run({ action, operationId: id, expectedBindingSha256: inspected["bindingSha256"], ...extra });
  }
  context.after(async () => {
    state.failAllowed = false; state.failOther = false; state.installationDrift = false; state.noProcessHealthy = true;
    const inspected = await coordinator.run({ action: "inspect", operationId: id });
    if (state.released && !["released", "not-dispatched", "no-process-released"].includes(String(inspected["state"]))) {
      await coordinator.run({ action: "settle-records", operationId: id, expectedIntentSha256: inspected["intentSha256"] });
    }
    if (typeof inspected["bindingSha256" ] === "string" && !state.released) {
      state.terminated = true;
      await request("observe-termination"); await request("release-closed");
    }
    if (!state.bound && !state.released && typeof inspected["intentSha256"] === "string" && inspected["state"] !== "not-dispatched") {
      await coordinator.run({ action: state.rootless === null ? "cleanup-unlaunched" : "cleanup-no-process", operationId: id, expectedIntentSha256: inspected["intentSha256"] });
    }
    await rm(directory(id), { recursive: true, force: true });
  });
  return { coordinator, owner, options, calls, state, request };
}

async function readyForOpening(id: string, value: ReturnType<typeof fixture>): Promise<void> {
  await value.coordinator.run(launch(id));
  await value.request("browser-observation");
  await value.request("inspect-frames", { targetId: "target-1" });
  await value.request("inspect-script", { frameId: "frame-1", family: "ui" });
}
async function readyForString(id: string, value: ReturnType<typeof fixture>): Promise<void> {
  await readyForOpening(id, value); await value.request("open-project", OPEN_INPUT);
  await value.request("open-pcb", { acceptNormalOpenEffects: true }); await value.request("observe-pcb-opening");
  await value.request("inspect-workers"); await value.request("inspect-worker-script", { targetId: "worker-1" });
}
function comparisonRefusal(value: ReturnType<typeof fixture>, fatal = false): void {
  const original = value.owner.observeCommonBaseline;
  let retained: CurrentPcbCommonBaselineFailure | null = null;
  value.owner.observeCommonBaseline = async (before): ReturnType<CurrentPcbStringPrecreateLifecycleOwner["observeCommonBaseline"]> => {
    const result = await original.call(value.owner, before);
    retained = currentPcbCommonBaselineFailureSchema.parse({ schema: "easyeda-pro-control.pcb-common-baseline-failure.v1",
      identity: result.identity, phase: fatal ? "owner-after" : "stored-relation", runnerFailure: null,
      historicalHeader: { headerText: "{}", headerSha256: sha256Text("{}"), beforeSqlSha256: before.logicalSha256, checkpointSha256: before.checkpointSha256 },
      originalReplies: Object.fromEntries(["presentation", "rules", "preference", "assets", "metadata"].map(name => [name, { result: { type: "string", value: "{}" } }])),
      retainedReplySha256: Object.fromEntries(["presentation", "rules", "preference", "assets", "metadata"].map(name => [name, sha256Text("{}")])),
      observationSha256: result.observationSha256, originalRunnerIssued: true, comparisonAccepted: false,
      nativeContinuationAllowed: !fatal, executionAuthorized: false });
    if (fatal) { throw new Error("synthetic original owner failure"); }
    return currentPcbCommonBaselineRefusal(retained, result.observationSha256);
  };
  value.owner.retainedCommonBaselineFailure = (): CurrentPcbCommonBaselineFailure | null => retained;
}

async function successfulStartupHandoff(context: TestContext, value: ReturnType<typeof fixture>): Promise<CurrentPcbWorkerStartupHandoff> {
  const parent = Object.freeze({ targetId: "parent-target", sessionId: "parent-session", nextRequestId: 17 });
  const selected = Object.freeze({ sessionId: parent.sessionId, uniqueContextId: "parent-context" });
  const channel = new CurrentPcbWorkerStartupChannel({
    requireOriginalParent: (): Promise<typeof parent> => Promise.resolve(parent),
    assertOriginalTermination: (): Promise<void> => { assert.equal(value.state.terminated, true); return Promise.resolve(); },
    observeOriginalParentEvent: (): never => { throw new Error("No parent events in lifecycle-only fixture"); },
    exchange: (): never => { throw new Error("No native exchange in lifecycle-only fixture"); },
  });
  const handoff = Object.freeze({ channel, dependency: await channel.start(), opening: Object.freeze({
    context: (): typeof selected => selected,
    reprove: (): Promise<void> => Promise.resolve(),
    begin: (): never => { throw new Error("No project opening in lifecycle-only fixture"); },
    finish: (): never => { throw new Error("No project opening in lifecycle-only fixture"); },
    observeParent: (): never => { throw new Error("No project opening in lifecycle-only fixture"); },
    ancillaryFrame: (): null => null,
    observeAncillary: (): never => { throw new Error("No project opening in lifecycle-only fixture"); },
    ancillaryObservation: (): null => null,
  }) });
  value.owner.handoffWorkerStartup = async (): Promise<CurrentPcbWorkerStartupHandoff> => {
    value.calls.push("worker-startup-handoff");
    const operations = await readCurrentPcbDiagnosticLifecycles();
    assert.equal(operations.at(-1)?.records["worker-startup-handoff-intent.json"]?.schema,
      "easyeda-pro-control.pcb-worker-startup-handoff-intent.v1");
    return handoff;
  };
  context.after(async () => { value.state.terminated = true; await channel.releaseAfterTermination(); });
  return handoff;
}

function startupActorReply(sample: unknown): Promise<unknown> {
  return Promise.resolve({ result: { type: "string", value: JSON.stringify(sample) } });
}
/** Synthetic coordinator packet only. The separate channel collector tests
 * qualify original V8 methods; this fixture supplies no connected evidence. */
function startupChannelPacket(identity: CurrentPcbWorkerStartupOpeningResult["workerIdentity"]): CurrentPcbWorkerStartupChannelPacket {
  const publisherSenderUuid = "12345678-1234-4234-8234-123456789abc";
  const gates = JSON.stringify({ schema: "easyeda-pro-control.pcb-string-worker-gates.v1", identity,
    raw: { isTemporary: false, isHistoryBack: false, isV2Format: false, isReady: true,
      isSyncing: { state: "absent", value: null }, privateMode: false },
    predicates: { isReadOnly: false, canWsPublish: false, cooperationCallbackGateOpen: true, structureCallbackStateGateOpen: true },
    privateModeSource: "jr=L1.IS_PRIVATE", gateMethodReferencesMatched: true,
    publisher: { senderUuid: publisherSenderUuid, methodChainReferencesMatched: true, nativeChannelVerified: false,
      nativeOnMessageReceiverVerified: false, completePublishersVerified: false },
    hiddenCallbackReceiversVerified: false, writeDestinationsContained: false, atomicSample: false });
  const body = { profile: "private.current-pcb-worker-startup-channel-observation.v1", identity,
    originalRunnerIssued: true, originalConstructorChannelRelationsObserved: true, currentPublisherMethodRelationsQualified: true,
    pairedGateSamplesMatched: true, channelRelationChecks: 2, requestCount: 18,
    qualifiedMethodKinds: ["readOnly", "format", "canPublish", "publish", "broadcast", "post", "message", "received"],
    gateReplies: [gates, gates], publisherSenderUuid, ...CURRENT_PCB_WORKER_STARTUP_CHANNEL_OBSERVATION_LIMITS };
  return Object.freeze(currentPcbWorkerStartupChannelPacketSchema.parse({ ...body, packetSha256: sha256Json(body) }));
}
function startupOpeningFixture(value: ReturnType<typeof fixture>, handoff: CurrentPcbWorkerStartupHandoff,
  failAfterDispatch = false, assignmentsFailure?: "prove" | "reproof" | "actor-prove" | "actor-reproof" | "channel-prove" | "channel-reproof"): Readonly<{ owner: CurrentPcbWorkerStartupOpeningCoordinator; result: CurrentPcbWorkerStartupOpeningResult;
    transport: CurrentPcbWorkerStartupTransport }> {
  const result: CurrentPcbWorkerStartupOpeningResult = Object.freeze({ opening: OPEN_RESULT, construction: Object.freeze({
    profile: "private.current-pcb-worker-construction.v1", pauses: 9, originalConstructorAndFactoryEventsRetained: true,
    originalProjectReceiverMatched: true, channelNativeIntrinsicAndPeerOwnershipVerified: false,
    wrapperAssignmentRelationVerified: false, nativeStartupIntegrationVerified: false, writeDestinationsContained: false, executionAuthorized: false,
  }), workerIdentity: Object.freeze({ projectUuid: OPEN_TARGET.projectUuid, branchUuid: OPEN_CHECKPOINT.targetEvidence.branchUuid, windowTabId: "fixture-tab" }),
  ancillaryFrame: null, executionAuthorized: false, persistenceVerified: false });
  const transport = new CurrentPcbWorkerStartupTransport(handoff.dependency);
  const assignments: CurrentPcbWorkerConstructionAssignments = Object.freeze({
    profile: "private.current-pcb-worker-construction-assignments.v1",
    callbackKinds: Object.freeze(["uploadStructure", "structure", "cooperation", "upload"] as const),
    originalConstructionCallbacksMatched: true, originalCallbackReceiversVerified: true, currentProjectWrapperRelationsVerified: true,
    continuousAssignmentOwnershipVerified: false, nativeChannelIntrinsicAndPeerOwnershipVerified: false, completePublishersVerified: false,
    writeDestinationsContained: false, atomicSnapshotVerified: false, queueCompletionVerified: false, executionAuthorized: false,
  });
  let dispatched = false;
  let actor: CurrentPcbWorkerStartupActorRunner | null = null, actorPacket: CurrentPcbWorkerStartupActorPacket | null = null;
  let channelPacket: CurrentPcbWorkerStartupChannelPacket | null = null;
  const owner: CurrentPcbWorkerStartupOpeningCoordinator = {
    open: async (target, reverify): Promise<CurrentPcbWorkerStartupOpeningResult> => {
      value.calls.push("startup-preflight");
      assert.deepEqual(target, { ...OPEN_TARGET, branchUuid: OPEN_CHECKPOINT.targetEvidence.branchUuid });
      const operations = await readCurrentPcbDiagnosticLifecycles();
      const intent = operations.at(-1)?.records["worker-startup-opening-intent.json"];
      assert.ok(intent); assert.deepEqual(intent.target, target); assert.equal(typeof intent.beforeSqlSha256, "string");
      assert.equal(intent.acceptDebuggerPauseEffects, true);
      assert.equal(diagnosticLifecycleRecordSchemas["worker-startup-opening-intent.json"].safeParse({ ...intent, acceptDebuggerPauseEffects: false }).success, false);
      assert.equal(intent.handoffResultSha256, sha256Json(operations.at(-1)?.records["worker-startup-handoff-result.json"]));
      await reverify(); value.calls.push("startup-dispatch"); dispatched = true;
      if (failAfterDispatch) { throw new Error("synthetic uncertain startup opening"); }
      return result;
    },
    status: () => ({ consumed: dispatched, settled: dispatched, openingAttempted: dispatched, openingResultRetained: dispatched,
      constructionRetained: dispatched && !failAfterDispatch, completed: dispatched && !failAfterDispatch,
      transport: transport.status(), diagnostics: { stage: "idle", step: "idle", failure: null }, executionAuthorized: false }),
    retainedOpeningResult: (): CurrentPcbDiagnosticOpeningResult | null => dispatched ? OPEN_RESULT : null,
    requireOriginal: (selected): Promise<CurrentPcbWorkerStartupTransport> => {
      assert.equal(selected, result); assert.equal(dispatched && !failAfterDispatch, true); value.calls.push("startup-require");
      return Promise.resolve(transport);
    },
    proveCurrentAssignments: async selected => {
      assert.equal(selected, result); assert.equal(dispatched && !failAfterDispatch, true);
      value.calls.push("startup-assignments-prove");
      const operations = await readCurrentPcbDiagnosticLifecycles();
      const operation = operations.at(-1);
      const intent = operation?.records["worker-startup-assignments-intent.json"]; assert.ok(intent);
      assert.equal(intent.openingResultSha256, sha256Json(operation?.records["worker-startup-opening-result.json"]));
      if (assignmentsFailure === "prove") { throw new Error("synthetic assignment proof failure"); }
      return assignments;
    },
    requireCurrentAssignments: (selected, observed): Promise<void> => {
      assert.equal(selected, result); assert.equal(observed, assignments); value.calls.push("startup-assignments-require");
      if (assignmentsFailure === "reproof") { return Promise.reject(new Error("synthetic assignment reproof failure")); }
      return Promise.resolve();
    },
    retainedActorObservation: (): Readonly<Record<string, unknown>> | null => actor === null ? null : { status: actor.status(), samples: actor.retainedSamples() },
    observeActorClock: async (selected, observed): Promise<CurrentPcbWorkerStartupActorPacket> => {
      assert.equal(selected, result); assert.equal(observed, assignments); value.calls.push("startup-actor-observe");
      const operations = await readCurrentPcbDiagnosticLifecycles();
      const operation = operations.at(-1);
      const intent = operation?.records["worker-startup-actor-intent.json"]; assert.ok(intent);
      assert.equal(intent.assignmentsResultSha256, sha256Json(operation?.records["worker-startup-assignments-result.json"]));
      if (assignmentsFailure === "actor-prove") { throw new Error("synthetic actor observation failure"); }
      const workerUser = { uuid: "d".repeat(32), nickname: "", username: "", avatar: "" };
      const stamp = { milliseconds: 1000, iso: new Date(1000).toISOString(), timezoneOffsetMinutes: 0 };
      const base = { schema: "easyeda-pro-control.pcb-worker-startup-actor.v1", identity: result.workerIdentity,
        workerUser, workerUserText: JSON.stringify(workerUser), clock: { before: stamp, after: stamp } };
      const uiActor = { uuid: workerUser.uuid, username: "", nickname: "" };
      actor = new CurrentPcbWorkerStartupActorRunner(Object.freeze({
        observeUi: (): Promise<unknown> => startupActorReply({ ...base, phase: "ui", cachedActor: uiActor, startupActor: uiActor }),
        observeWorker: (): Promise<unknown> => startupActorReply({ ...base, phase: "worker", originalProjectReceiverMatched: true, originalWorkerBusMatched: true }),
        assertCurrent: (): Promise<void> => Promise.resolve(),
      }), result.workerIdentity);
      actorPacket = await actor.observe(); return actorPacket;
    },
    requireActorClock: async (selected, observed, packet): Promise<void> => {
      assert.equal(selected, result); assert.equal(observed, assignments); assert.equal(packet, actorPacket); assert.ok(actor);
      value.calls.push("startup-actor-require");
      if (assignmentsFailure === "actor-reproof") { throw new Error("synthetic actor reproof failure"); }
      await actor.requireOriginal(packet);
    },
    retainedChannelObservation: (): Readonly<Record<string, unknown>> | null => channelPacket === null ? null :
      { status: { phase: "completed" }, gateReplies: channelPacket.gateReplies },
    observeCurrentChannel: async (selected, observed): Promise<CurrentPcbWorkerStartupChannelPacket> => {
      assert.equal(selected, result); assert.equal(observed, assignments); value.calls.push("startup-channel-observe");
      const operations = await readCurrentPcbDiagnosticLifecycles();
      const operation = operations.at(-1);
      const intent = operation?.records["worker-startup-channel-intent.json"]; assert.ok(intent);
      assert.equal(intent.assignmentsResultSha256, sha256Json(operation?.records["worker-startup-assignments-result.json"]));
      assert.equal(operation?.records["worker-startup-actor-intent.json"], undefined);
      if (assignmentsFailure === "channel-prove") { throw new Error("synthetic channel observation failure"); }
      channelPacket = startupChannelPacket(result.workerIdentity); return channelPacket;
    },
    requireCurrentChannel: async (selected, observed, packet): Promise<void> => {
      await Promise.resolve(); assert.equal(selected, result); assert.equal(observed, assignments); assert.equal(packet, channelPacket);
      value.calls.push("startup-channel-require");
      if (assignmentsFailure === "channel-reproof") { throw new Error("synthetic channel reproof failure"); }
    },
    releaseAfterTermination: (): Promise<void> => {
      assert.equal(value.state.terminated, true); assert.equal(value.state.released, false);
      value.calls.push("startup-release"); return Promise.resolve();
    },
  };
  return { owner, result, transport };
}

for (const outcome of ["success", "intent-publication", "result-publication", "prove", "reproof"] as const) {
  void test(`startup assignments ${outcome} preserves one-shot original proof and exact settlement`, async context => {
    const id = `worker-startup-test-assignments-${outcome}`;
    let original: ReturnType<typeof startupOpeningFixture> | null = null, refuse = true;
    const value = fixture(context, id, {
      createStartupOpening: () => { assert.ok(original); return original.owner; },
      publishRecord: async (operationId, name, record) => {
        if (refuse && (outcome === "intent-publication" && name === "worker-startup-assignments-intent.json" ||
          outcome === "result-publication" && name === "worker-startup-assignments-result.json")) {
          refuse = false; throw new Error("synthetic assignment publication failure");
        }
        await publishCurrentPcbDiagnosticLifecycleRecord(operationId, name, record);
      },
    });
    const handoff = await successfulStartupHandoff(context, value);
    original = startupOpeningFixture(value, handoff, false, outcome === "prove" || outcome === "reproof" ? outcome : undefined);
    await readyForOpening(id, value); assert.ok(value.coordinator instanceof CurrentPcbWorkerStartupLifecycle);
    const before = await value.coordinator.run({ action: "inspect", operationId: id });
    const binding = before["bindingSha256"]; assert.ok(typeof binding === "string");
    await assert.rejects(value.coordinator.observeWorkerStartupAssignments(id, binding), /ORIGINAL_STARTUP_RESULT_REQUIRED/u);
    await value.coordinator.captureWorkerStartup(id, binding, STARTUP_OPEN_INPUT);
    if (outcome === "success") {
      const observed = await value.coordinator.observeWorkerStartupAssignments(id, binding);
      assert.equal(observed["pointInTimeObservation"], true); assert.equal(observed["saveAuthorized"], false);
      assert.equal(observed["executionAuthorized"], false);
      const result = observed["result"]; assert.ok(result !== null && typeof result === "object");
      assert.equal(Reflect.get(result, "currentProjectWrapperRelationsVerified"), true);
      for (const field of ["continuousAssignmentOwnershipVerified", "nativeChannelIntrinsicAndPeerOwnershipVerified",
        "completePublishersVerified", "writeDestinationsContained", "atomicSnapshotVerified", "queueCompletionVerified"]) {
        assert.equal(Reflect.get(result, field), false);
      }
    } else { await assert.rejects(value.coordinator.observeWorkerStartupAssignments(id, binding), /synthetic assignment/u); }
    await assert.rejects(value.coordinator.observeWorkerStartupAssignments(id, binding), /WORKER_STARTUP_ASSIGNMENTS_CONSUMED/u);
    let inspected = await value.coordinator.run({ action: "inspect", operationId: id });
    assert.equal(inspected["workerStartupAssignmentsAttemptConsumed"], true);
    assert.equal(inspected["workerStartupAssignmentsResultRetained"], outcome !== "prove" && outcome !== "intent-publication");
    assert.equal(inspected["workerStartupAssignmentsResultPublished"], outcome === "success");
    const count = value.calls.length;
    await value.coordinator.run({ action: "settle-records", operationId: id, expectedIntentSha256: before["intentSha256"] });
    assert.equal(value.calls.slice(count).some(call => call.startsWith("startup-assignments")), false);
    inspected = await value.coordinator.run({ action: "inspect", operationId: id });
    assert.equal(inspected["workerStartupAssignmentsResultPublished"], outcome === "success" || outcome === "result-publication");
    assert.equal(value.calls.filter(call => call === "startup-assignments-prove").length, outcome === "intent-publication" ? 0 : 1);
    assert.equal(value.calls.filter(call => call === "startup-dispatch").length, 1);
    if (outcome === "success") {
      const path = join(directory(id), "worker-startup-assignments-intent.json"), text = await readFile(path, "utf8");
      const recorded = diagnosticLifecycleRecordSchemas["worker-startup-assignments-intent.json"].parse(JSON.parse(text) as unknown);
      try {
        await writeFile(path, JSON.stringify({ ...recorded, openingResultSha256: "f".repeat(64) }), { mode: 0o600 });
        await assert.rejects(readCurrentPcbDiagnosticLifecycles(), /WORKER_STARTUP_ASSIGNMENTS_CHAIN/u);
      } finally { await writeFile(path, text, { mode: 0o600 }); }
      const resultPath = join(directory(id), "worker-startup-assignments-result.json"), resultText = await readFile(resultPath, "utf8");
      const result = diagnosticLifecycleRecordSchemas["worker-startup-assignments-result.json"].parse(JSON.parse(resultText) as unknown);
      assert.equal(diagnosticLifecycleRecordSchemas["worker-startup-assignments-result.json"].safeParse({ ...result,
        result: { ...result.result, continuousAssignmentOwnershipVerified: true } }).success, false);
      try {
        await writeFile(resultPath, JSON.stringify({ ...result, intentSha256: "f".repeat(64) }), { mode: 0o600 });
        await assert.rejects(readCurrentPcbDiagnosticLifecycles(), /WORKER_STARTUP_ASSIGNMENTS_RESULT_CHAIN/u);
      } finally { await writeFile(resultPath, resultText, { mode: 0o600 }); }
    }
    const historical = new CurrentPcbWorkerStartupLifecycle(value.options);
    await assert.rejects(historical.observeWorkerStartupAssignments(id, binding), /ORIGINAL_STARTUP_RESULT_REQUIRED/u);
    await value.request("normal-close", { hwnd: "12345", confirmNormalClose: true });
    await assert.rejects(value.coordinator.observeWorkerStartupAssignments(id, binding), /ORIGINAL_STARTUP_RESULT_REQUIRED/u);
    value.state.terminated = true; await value.request("observe-termination"); await value.request("release-closed");
    assert.ok(value.calls.indexOf("startup-release") < value.calls.indexOf("release"));
    await assertNoUnresolvedCurrentPcbDiagnosticLaunches();
  });
}

for (const outcome of ["success", "intent-publication", "result-publication", "prove", "reproof"] as const) {
  void test(`startup actor ${outcome} retains original stage and never replays samples during settlement`, async context => {
    const id = `worker-startup-test-actor-${outcome}`;
    let original: ReturnType<typeof startupOpeningFixture> | null = null, refuse = true;
    const value = fixture(context, id, {
      createStartupOpening: () => { assert.ok(original); return original.owner; },
      publishRecord: async (operationId, name, record) => {
        if (refuse && (outcome === "intent-publication" && name === "worker-startup-actor-intent.json" ||
          outcome === "result-publication" && name === "worker-startup-actor-result.json")) {
          refuse = false; throw new Error("synthetic actor publication failure");
        }
        await publishCurrentPcbDiagnosticLifecycleRecord(operationId, name, record);
      },
    });
    const handoff = await successfulStartupHandoff(context, value);
    const failure = outcome === "prove" || outcome === "reproof" ? `actor-${outcome}` as const : undefined;
    original = startupOpeningFixture(value, handoff, false, failure);
    await readyForOpening(id, value); assert.ok(value.coordinator instanceof CurrentPcbWorkerStartupLifecycle);
    const before = await value.coordinator.run({ action: "inspect", operationId: id });
    const binding = before["bindingSha256"]; assert.ok(typeof binding === "string");
    await value.coordinator.captureWorkerStartup(id, binding, STARTUP_OPEN_INPUT);
    await assert.rejects(value.coordinator.observeWorkerStartupActor(id, binding), /ORIGINAL_STARTUP_ASSIGNMENTS_REQUIRED/u);
    await value.coordinator.observeWorkerStartupAssignments(id, binding);
    if (outcome === "success") {
      const observed = await value.coordinator.observeWorkerStartupActor(id, binding);
      assert.equal(observed["pointInTimeObservation"], true); assert.equal(observed["saveAuthorized"], false);
      assert.equal(observed["executionAuthorized"], false);
      const result = observed["result"]; assert.ok(result !== null && typeof result === "object");
      assert.equal(Reflect.get(result, "pairedActorValuesMatched"), true);
      for (const field of ["continuousObservation", "pcbRealmObserved", "clockProvenanceVerified", "backendActorProvenanceVerified",
        "completePublicationIntervalVerified", "writeDestinationsContained", "atomicSnapshotVerified"]) {
        assert.equal(Reflect.get(result, field), false);
      }
    } else { await assert.rejects(value.coordinator.observeWorkerStartupActor(id, binding), /synthetic actor/u); }
    await assert.rejects(value.coordinator.observeWorkerStartupActor(id, binding), /WORKER_STARTUP_ACTOR_CONSUMED/u);
    let inspected = await value.coordinator.run({ action: "inspect", operationId: id });
    assert.equal(inspected["workerStartupActorAttemptConsumed"], true);
    assert.equal(inspected["workerStartupActorResultRetained"], outcome !== "prove" && outcome !== "intent-publication");
    assert.equal(inspected["workerStartupActorResultPublished"], outcome === "success");
    const count = value.calls.length;
    await value.coordinator.run({ action: "settle-records", operationId: id, expectedIntentSha256: before["intentSha256"] });
    assert.equal(value.calls.slice(count).some(call => call.startsWith("startup-actor")), false);
    inspected = await value.coordinator.run({ action: "inspect", operationId: id });
    assert.equal(inspected["workerStartupActorResultPublished"], outcome === "success" || outcome === "result-publication");
    if (outcome === "success" || outcome === "result-publication") {
      const summary = inspected["workerStartupActorResult"]; assert.ok(summary !== null && typeof summary === "object");
      assert.equal(Reflect.get(summary, "summaryOnly"), true); assert.equal(Reflect.get(summary, "sampleCount"), 4);
      assert.equal(Reflect.has(summary, "samples"), false); assert.equal(Reflect.has(summary, "workerUserText"), false);
    }
    assert.equal(value.calls.filter(call => call === "startup-actor-observe").length, outcome === "intent-publication" ? 0 : 1);
    assert.equal(value.calls.filter(call => call === "startup-dispatch").length, 1);
    if (outcome === "success") {
      const path = join(directory(id), "worker-startup-actor-intent.json"), text = await readFile(path, "utf8");
      const recorded = diagnosticLifecycleRecordSchemas["worker-startup-actor-intent.json"].parse(JSON.parse(text) as unknown);
      try {
        await writeFile(path, JSON.stringify({ ...recorded, assignmentsResultSha256: "f".repeat(64) }), { mode: 0o600 });
        await assert.rejects(readCurrentPcbDiagnosticLifecycles(), /WORKER_STARTUP_ACTOR_CHAIN/u);
      } finally { await writeFile(path, text, { mode: 0o600 }); }
      const resultPath = join(directory(id), "worker-startup-actor-result.json"), resultText = await readFile(resultPath, "utf8");
      const result = diagnosticLifecycleRecordSchemas["worker-startup-actor-result.json"].parse(JSON.parse(resultText) as unknown);
      try {
        await writeFile(resultPath, JSON.stringify({ ...result, intentSha256: "f".repeat(64) }), { mode: 0o600 });
        await assert.rejects(readCurrentPcbDiagnosticLifecycles(), /WORKER_STARTUP_ACTOR_RESULT_CHAIN/u);
      } finally { await writeFile(resultPath, resultText, { mode: 0o600 }); }
    }
    const historical = new CurrentPcbWorkerStartupLifecycle(value.options);
    await assert.rejects(historical.observeWorkerStartupActor(id, binding), /ORIGINAL_STARTUP_ASSIGNMENTS_REQUIRED/u);
    await value.request("normal-close", { hwnd: "12345", confirmNormalClose: true });
    await assert.rejects(value.coordinator.observeWorkerStartupActor(id, binding), /ORIGINAL_STARTUP_ASSIGNMENTS_REQUIRED/u);
    value.state.terminated = true; await value.request("observe-termination"); await value.request("release-closed");
    assert.ok(value.calls.indexOf("startup-release") < value.calls.indexOf("release"));
    await assertNoUnresolvedCurrentPcbDiagnosticLaunches();
  });
}

for (const outcome of ["success", "intent-publication", "result-publication", "prove", "reproof"] as const) {
  void test(`startup channel ${outcome} retains original stage and never replays samples during settlement`, async context => {
    const id = `worker-startup-test-channel-${outcome}`;
    let original: ReturnType<typeof startupOpeningFixture> | null = null, refuse = true;
    const value = fixture(context, id, {
      createStartupOpening: () => { assert.ok(original); return original.owner; },
      publishRecord: async (operationId, name, record) => {
        if (refuse && (outcome === "intent-publication" && name === "worker-startup-channel-intent.json" ||
          outcome === "result-publication" && name === "worker-startup-channel-result.json")) {
          refuse = false; throw new Error("synthetic channel publication failure");
        }
        await publishCurrentPcbDiagnosticLifecycleRecord(operationId, name, record);
      },
    });
    const handoff = await successfulStartupHandoff(context, value);
    const failure = outcome === "prove" || outcome === "reproof" ? `channel-${outcome}` as const : undefined;
    original = startupOpeningFixture(value, handoff, false, failure);
    await readyForOpening(id, value); assert.ok(value.coordinator instanceof CurrentPcbWorkerStartupLifecycle);
    const before = await value.coordinator.run({ action: "inspect", operationId: id });
    const binding = before["bindingSha256"]; assert.ok(typeof binding === "string");
    await value.coordinator.captureWorkerStartup(id, binding, STARTUP_OPEN_INPUT);
    await assert.rejects(value.coordinator.observeWorkerStartupChannel(id, binding), /ORIGINAL_STARTUP_ASSIGNMENTS_REQUIRED/u);
    await value.coordinator.observeWorkerStartupAssignments(id, binding);
    if (outcome === "success") {
      const observed = await value.coordinator.observeWorkerStartupChannel(id, binding);
      assert.equal(observed["pointInTimeObservation"], true); assert.equal(observed["saveAuthorized"], false);
      assert.equal(observed["executionAuthorized"], false);
      const result = observed["result"]; assert.ok(result !== null && typeof result === "object");
      assert.equal(Reflect.get(result, "pairedGateSamplesMatched"), true);
      for (const field of ["continuousObservation", "nativeIntrinsicsVerified", "nativeChannelIntrinsicAndPeerOwnershipVerified", "completePublishersVerified",
        "queueCompletionVerified", "writeDestinationsContained", "atomicSnapshotVerified"]) {
        assert.equal(Reflect.get(result, field), false);
      }
    } else { await assert.rejects(value.coordinator.observeWorkerStartupChannel(id, binding), /synthetic channel/u); }
    await assert.rejects(value.coordinator.observeWorkerStartupChannel(id, binding), /WORKER_STARTUP_CHANNEL_CONSUMED/u);
    let inspected = await value.coordinator.run({ action: "inspect", operationId: id });
    assert.equal(inspected["workerStartupChannelAttemptConsumed"], true);
    assert.equal(inspected["workerStartupChannelResultRetained"], outcome !== "prove" && outcome !== "intent-publication");
    assert.equal(inspected["workerStartupChannelResultPublished"], outcome === "success");
    const count = value.calls.length;
    await value.coordinator.run({ action: "settle-records", operationId: id, expectedIntentSha256: before["intentSha256"] });
    assert.equal(value.calls.slice(count).some(call => call.startsWith("startup-channel")), false);
    inspected = await value.coordinator.run({ action: "inspect", operationId: id });
    assert.equal(inspected["workerStartupChannelResultPublished"], outcome === "success" || outcome === "result-publication");
    if (outcome === "success" || outcome === "result-publication") {
      const summary = inspected["workerStartupChannelResult"]; assert.ok(summary !== null && typeof summary === "object");
      assert.equal(Reflect.get(summary, "summaryOnly"), true); assert.equal(Reflect.get(summary, "sampleCount"), 2);
      assert.equal(Reflect.has(summary, "gateReplies"), false);
    }
    assert.equal(value.calls.filter(call => call === "startup-channel-observe").length, outcome === "intent-publication" ? 0 : 1);
    assert.equal(value.calls.filter(call => call === "startup-dispatch").length, 1);
    if (outcome === "success") {
      const path = join(directory(id), "worker-startup-channel-intent.json"), text = await readFile(path, "utf8");
      const recorded = diagnosticLifecycleRecordSchemas["worker-startup-channel-intent.json"].parse(JSON.parse(text) as unknown);
      try {
        await writeFile(path, JSON.stringify({ ...recorded, assignmentsResultSha256: "f".repeat(64) }), { mode: 0o600 });
        await assert.rejects(readCurrentPcbDiagnosticLifecycles(), /WORKER_STARTUP_CHANNEL_CHAIN/u);
      } finally { await writeFile(path, text, { mode: 0o600 }); }
      const resultPath = join(directory(id), "worker-startup-channel-result.json"), resultText = await readFile(resultPath, "utf8");
      const result = diagnosticLifecycleRecordSchemas["worker-startup-channel-result.json"].parse(JSON.parse(resultText) as unknown);
      try {
        await writeFile(resultPath, JSON.stringify({ ...result, intentSha256: "f".repeat(64) }), { mode: 0o600 });
        await assert.rejects(readCurrentPcbDiagnosticLifecycles(), /WORKER_STARTUP_CHANNEL_RESULT_CHAIN/u);
        const foreign = startupChannelPacket({ ...original.result.workerIdentity, branchUuid: "f".repeat(32) });
        await writeFile(resultPath, JSON.stringify({ ...result, result: foreign }), { mode: 0o600 });
        await assert.rejects(readCurrentPcbDiagnosticLifecycles(), /WORKER_STARTUP_CHANNEL_RESULT_CHAIN/u);
      } finally { await writeFile(resultPath, resultText, { mode: 0o600 }); }
    }
    const historical = new CurrentPcbWorkerStartupLifecycle(value.options);
    await assert.rejects(historical.observeWorkerStartupChannel(id, binding), /ORIGINAL_STARTUP_ASSIGNMENTS_REQUIRED/u);
    await value.request("normal-close", { hwnd: "12345", confirmNormalClose: true });
    await assert.rejects(value.coordinator.observeWorkerStartupChannel(id, binding), /ORIGINAL_STARTUP_ASSIGNMENTS_REQUIRED/u);
    value.state.terminated = true; await value.request("observe-termination"); await value.request("release-closed");
    assert.ok(value.calls.indexOf("startup-release") < value.calls.indexOf("release"));
    await assertNoUnresolvedCurrentPcbDiagnosticLaunches();
  });
}

void test("worker startup seals its third purpose before allocation and excludes both older facades through cleanup", async context => {
  const id = "worker-startup-test-purpose", value = fixture(context, id);
  await readyForOpening(id, value);
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
  assert.equal(inspected["state"], "launched");
  const operations = await readCurrentPcbDiagnosticLifecycles();
  const operation = operations.find(entry => entry.operationId === id); assert.ok(operation);
  assert.equal(operation.records["intent.json"]?.schema, "easyeda-pro-control.pcb-worker-startup-launch-intent.v1");
  assert.deepEqual(value.calls.slice(0, 2), ["allocate", "launch"]);
  for (const coordinator of [new CurrentPcbDiagnosticLifecycle(value.options), new CurrentPcbStringPrecreateLifecycle(value.options)]) {
    for (const action of ["inspect", "observe-window", "observe-termination", "release-closed", "cleanup-unlaunched", "cleanup-no-process", "settle-records"]) {
      let request: Record<string, unknown> = { action, operationId: id, expectedBindingSha256: inspected["bindingSha256"] };
      if (action === "inspect") { request = { action, operationId: id }; }
      else if (action.startsWith("cleanup-") || action === "settle-records") { request = { action, operationId: id, expectedIntentSha256: inspected["intentSha256"] }; }
      await assert.rejects(coordinator.run(request));
    }
  }
  for (const action of ["open-project", "open-pcb", "inspect-workers", "inspect-worker-script", "observe-worker-state", "observe-model-state", "observe-pcb-opening", "observe-string-precreate", "observe-common-baseline"]) {
    await assert.rejects(value.request(action, action === "open-project" ? OPEN_INPUT : {}));
  }
  await assert.rejects(value.request("inspect-script", { frameId: "frame-1", family: "pcb" }));
  await assert.rejects(assertNoUnresolvedCurrentPcbDiagnosticLaunches(), /UNRESOLVED_LAUNCH/u);
  assert.throws(acquireCurrentPcbDiagnosticLaunchExclusion, /LAUNCH_BUSY/u);
  await value.request("normal-close", { hwnd: "12345", confirmNormalClose: true });
  value.state.terminated = true; await value.request("observe-termination"); await value.request("release-closed");
  await assertNoUnresolvedCurrentPcbDiagnosticLaunches();
});

void test("ordinary lifecycle rejects reserved startup launch IDs before allocation and historical journal relabeling", async context => {
  const ordinary = fixture(context, "diagnostic-test-startup-reserved");
  await assert.rejects(ordinary.coordinator.run(launch("worker-startup-test-reserved")), /prefixes are reserved/u);
  assert.deepEqual(ordinary.calls, []);
  const id = "worker-startup-test-relabel", value = fixture(context, id);
  await value.coordinator.run(launch(id));
  const path = join(directory(id), "intent.json"), text = await readFile(path, "utf8");
  const record = diagnosticLifecycleRecordSchemas["intent.json"].parse(JSON.parse(text) as unknown);
  const changed = { ...record, schema: "easyeda-pro-control.pcb-diagnostic-launch-intent.v1" };
  Reflect.deleteProperty(changed, "purpose");
  try {
    await writeFile(path, JSON.stringify(changed), { mode: 0o600 });
    await assert.rejects(readCurrentPcbDiagnosticLifecycles(), /RESERVED_WORKER_STARTUP_PURPOSE_ID/u);
  } finally { await writeFile(path, text, { mode: 0o600 }); }
});

void test("private startup handoff journals before dispatch and returns the same capability without serializing it", async context => {
  const id = "worker-startup-test-handoff", value = fixture(context, id);
  const handoff = await successfulStartupHandoff(context, value);
  assert.ok(value.coordinator instanceof CurrentPcbWorkerStartupLifecycle);
  await value.coordinator.run(launch(id));
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
  const binding = inspected["bindingSha256"]; assert.equal(typeof binding, "string");
  assert.ok(typeof binding === "string");
  await assert.rejects(value.coordinator.handoffWorkerStartup(id, binding), /ORIGINAL_UI_SOURCE_REQUIRED/u);
  await value.request("browser-observation"); await value.request("inspect-frames", { targetId: "target-1" });
  await value.request("inspect-script", { frameId: "frame-1", family: "ui" });
  assert.equal(await value.coordinator.handoffWorkerStartup(id, binding), handoff);
  await assert.rejects(value.coordinator.handoffWorkerStartup(id, binding), /WORKER_STARTUP_HANDOFF_CONSUMED/u);
  const historical = new CurrentPcbWorkerStartupLifecycle(value.options);
  await assert.rejects(historical.handoffWorkerStartup(id, binding), /ORIGINAL_OWNER_REQUIRED/u);
  const result = await historical.run({ action: "inspect", operationId: id });
  assert.equal(result["workerStartupHandoffResultPublished"], true);
  assert.equal(result["workerStartupHandoffRetained"], false);
  assert.doesNotMatch(JSON.stringify(result), /parent-session|parent-target|channel|dependency/u);
  assert.equal(value.calls.filter(call => call === "worker-startup-handoff").length, 1);
});

for (const failedRecord of ["worker-startup-handoff-intent.json", "worker-startup-handoff-result.json"] as const) {
  void test(`startup ${failedRecord} publication failure consumes handoff and permits settlement without replay`, async context => {
    const id = `worker-startup-test-${failedRecord.includes("intent") ? "intent" : "result"}-publication`;
    let refuse = true;
    const value = fixture(context, id, { publishRecord: async (operationId, name, record) => {
      if (name === failedRecord && refuse) { refuse = false; throw new Error("synthetic startup publication failure"); }
      await publishCurrentPcbDiagnosticLifecycleRecord(operationId, name, record);
    } });
    await successfulStartupHandoff(context, value); await readyForOpening(id, value);
    assert.ok(value.coordinator instanceof CurrentPcbWorkerStartupLifecycle);
    const before = await value.coordinator.run({ action: "inspect", operationId: id });
    const binding = before["bindingSha256"]; assert.ok(typeof binding === "string");
    await assert.rejects(value.coordinator.handoffWorkerStartup(id, binding), /startup publication failure/u);
    await assert.rejects(value.coordinator.handoffWorkerStartup(id, binding), /WORKER_STARTUP_HANDOFF_CONSUMED/u);
    await value.coordinator.run({ action: "settle-records", operationId: id, expectedIntentSha256: before["intentSha256"] });
    const result = await value.coordinator.run({ action: "inspect", operationId: id });
    const transferred = failedRecord === "worker-startup-handoff-result.json";
    assert.equal(result["workerStartupHandoffResultPublished"], transferred);
    assert.equal(result["workerStartupHandoffRetained"], transferred);
    assert.equal(value.calls.filter(call => call === "worker-startup-handoff").length, transferred ? 1 : 0);
    await value.request("normal-close", { hwnd: "12345", confirmNormalClose: true });
  });
}

void test("startup native handoff refusal retains original cleanup and cannot recreate capability from journal", async context => {
  const id = "worker-startup-test-handoff-refusal", value = fixture(context, id); await readyForOpening(id, value);
  assert.ok(value.coordinator instanceof CurrentPcbWorkerStartupLifecycle);
  const before = await value.coordinator.run({ action: "inspect", operationId: id });
  const binding = before["bindingSha256"]; assert.ok(typeof binding === "string");
  await assert.rejects(value.coordinator.handoffWorkerStartup(id, binding), /consumed handoff failure/u);
  await assert.rejects(value.coordinator.handoffWorkerStartup(id, binding), /WORKER_STARTUP_HANDOFF_CONSUMED/u);
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
  assert.equal(inspected["workerStartupHandoffAttemptConsumed"], true);
  assert.equal(inspected["workerStartupHandoffResultPublished"], false);
  assert.equal(inspected["workerStartupHandoffRetained"], false);
  assert.equal(value.calls.filter(call => call === "worker-startup-handoff").length, 1);
  await value.request("normal-close", { hwnd: "12345", confirmNormalClose: true });
});

for (const outcome of ["success", "capture-success", "result-publication", "native-failure"] as const) {
  void test(`startup private opening ${outcome} keeps checkpoint/SQL provenance and releases coordinator before original helper`, async context => {
    const id = `worker-startup-test-open-${outcome}`;
    let handoff: CurrentPcbWorkerStartupHandoff | null = null;
    let original: ReturnType<typeof startupOpeningFixture> | null = null, refuse = outcome === "result-publication";
    const value = fixture(context, id, {
      createStartupOpening: selected => {
        assert.ok(original); assert.equal(selected, handoff); value.calls.push("startup-create"); return original.owner;
      },
      publishRecord: async (operationId, name, record) => {
        if (name === "worker-startup-opening-result.json" && refuse) { refuse = false; throw new Error("synthetic startup result publication"); }
        await publishCurrentPcbDiagnosticLifecycleRecord(operationId, name, record);
      },
    });
    handoff = await successfulStartupHandoff(context, value);
    original = startupOpeningFixture(value, handoff, outcome === "native-failure");
    await readyForOpening(id, value); assert.ok(value.coordinator instanceof CurrentPcbWorkerStartupLifecycle);
    const before = await value.coordinator.run({ action: "inspect", operationId: id });
    const binding = before["bindingSha256"]; assert.ok(typeof binding === "string");
    await assert.rejects(value.coordinator.openWorkerStartup(id, binding, OPEN_INPUT), /acceptDebuggerPauseEffects/u);
    await assert.rejects(value.coordinator.openWorkerStartup(id, binding, STARTUP_OPEN_INPUT), /ORIGINAL_STARTUP_HANDOFF_REQUIRED/u);
    if (outcome === "capture-success") {
      await assert.rejects(value.coordinator.captureWorkerStartup(id, binding, { ...OPEN_INPUT, acceptDebuggerPauseEffects: false }));
      assert.equal(value.calls.includes("worker-startup-handoff"), false);
      const data = await value.coordinator.captureWorkerStartup(id, binding, STARTUP_OPEN_INPUT);
      assert.deepEqual(data, { ...original.result, operationId: id, validationOnly: true, saveAuthorized: false });
      assert.notEqual(data.construction, original.result.construction);
      await assert.rejects(value.coordinator.captureWorkerStartup(id, binding, STARTUP_OPEN_INPUT),
        /WORKER_STARTUP_HANDOFF_CONSUMED/u);
    } else {
      await value.coordinator.handoffWorkerStartup(id, binding);
      await assert.rejects(value.coordinator.openWorkerStartup(id, binding, { ...STARTUP_OPEN_INPUT, acceptDebuggerPauseEffects: false }));
      await assert.rejects(value.coordinator.openWorkerStartup(id, binding, { ...STARTUP_OPEN_INPUT, confirmDisposableProject: false }));
    }
    if (outcome === "success") {
      assert.equal(await value.coordinator.openWorkerStartup(id, binding, STARTUP_OPEN_INPUT), original.result);
      assert.equal(await value.coordinator.requireWorkerStartup(id, binding, original.result), original.transport);
    } else if (outcome !== "capture-success") {
      await assert.rejects(value.coordinator.openWorkerStartup(id, binding, STARTUP_OPEN_INPUT), /synthetic/u);
      await assert.rejects(value.coordinator.requireWorkerStartup(id, binding, original.result), /ORIGINAL_STARTUP_RESULT_REQUIRED/u);
      await value.coordinator.run({ action: "settle-records", operationId: id, expectedIntentSha256: before["intentSha256"] });
      if (outcome === "result-publication") {
        assert.equal(await value.coordinator.requireWorkerStartup(id, binding, original.result), original.transport);
      }
    }
    await assert.rejects(value.coordinator.openWorkerStartup(id, binding, STARTUP_OPEN_INPUT), /WORKER_STARTUP_OPENING_CONSUMED/u);
    await assert.rejects(value.coordinator.requireWorkerStartup(id, binding, structuredClone(original.result)), /ORIGINAL_STARTUP_RESULT_REQUIRED/u);
    assert.ok(value.calls.indexOf("common-inventory") < value.calls.indexOf("startup-create"));
    assert.equal(value.calls.filter(call => call === "startup-dispatch").length, 1);
    assert.equal(value.calls.filter(call => call === "verify-checkpoint").length, 2);
    const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
    assert.equal(inspected["workerStartupOpeningResultPublished"], outcome !== "native-failure");
    assert.equal(inspected["workerStartupOpeningAttemptConsumed"], true);
    assert.deepEqual(inspected["workerStartupOpeningNativeReply"], OPEN_RESULT);
    if (outcome === "success") {
      const path = join(directory(id), "worker-startup-opening-result.json"), text = await readFile(path, "utf8");
      const recorded = diagnosticLifecycleRecordSchemas["worker-startup-opening-result.json"].parse(JSON.parse(text) as unknown);
      try {
        await writeFile(path, JSON.stringify({ ...recorded, result: { ...recorded.result,
          workerIdentity: { ...recorded.result.workerIdentity, windowTabId: "other-window" } } }), { mode: 0o600 });
        await assert.rejects(readCurrentPcbDiagnosticLifecycles(), /WORKER_STARTUP_OPENING_RESULT_CHAIN/u);
      } finally { await writeFile(path, text, { mode: 0o600 }); }
    }
    await value.request("normal-close", { hwnd: "12345", confirmNormalClose: true });
    value.state.terminated = true; await value.request("observe-termination"); await value.request("release-closed");
    assert.ok(value.calls.indexOf("startup-release") < value.calls.indexOf("release"));
    await assertNoUnresolvedCurrentPcbDiagnosticLaunches();
    const historical = new CurrentPcbWorkerStartupLifecycle(value.options);
    await assert.rejects(historical.openWorkerStartup(id, binding, STARTUP_OPEN_INPUT), /ORIGINAL_OWNER_REQUIRED/u);
    await assert.rejects(historical.requireWorkerStartup(id, binding, original.result), /ORIGINAL_STARTUP_RESULT_REQUIRED/u);
  });
}

void test("optional common stage retains original pre-open SQL and permits one unchanged precreate after success", async context => {
  const id = "string-precreate-test-common-success", value = fixture(context, id);
  await readyForString(id, value);
  assert.ok(value.calls.indexOf("common-inventory") < value.calls.indexOf("open-dispatch"));
  const result = await value.request("observe-common-baseline"); assert.equal(result["stage"], "common-baseline");
  await assert.rejects(value.request("observe-common-baseline"), /COMMON_OBSERVATION_CONSUMED/u);
  await value.request("observe-string-precreate");
  const operations = await readCurrentPcbDiagnosticLifecycles();
  const operation = operations.find(entry => entry.operationId === id); assert.ok(operation);
  assert.equal(operation.records["common-baseline-result.json"]?.result.schema, "easyeda-pro-control.pcb-common-baseline-observation.v1");
  assert.equal(operation.records["common-baseline-intent.json"]?.beforeSqlSha256, operation.records["project-opening-intent.json"]?.commonBeforeSqlSha256);
  assert.equal(operation.records["common-baseline-failure.json"], undefined);
});

void test("explicit common comparison refusal retains bounded evidence and permits independent precreate", async context => {
  const id = "string-precreate-test-common-refusal", value = fixture(context, id); comparisonRefusal(value);
  await readyForString(id, value); const result = await value.request("observe-common-baseline");
  assert.match(JSON.stringify(result), /pcb-common-baseline-refusal/u);
  await value.request("observe-string-precreate");
  const operations = await readCurrentPcbDiagnosticLifecycles();
  const operation = operations.find(entry => entry.operationId === id); assert.ok(operation);
  assert.equal(operation.records["common-baseline-failure.json"]?.failure.nativeContinuationAllowed, true);
  assert.equal(operation.records["common-baseline-result.json"]?.result.schema, "easyeda-pro-control.pcb-common-baseline-refusal.v1");
  await assert.rejects(value.request("observe-common-baseline"), /COMMON_OBSERVATION_CONSUMED/u);
});

for (const name of ["common-baseline-failure.json", "common-baseline-result.json"] as const) {
  void test(`common refusal ${name} publication must settle before independent precreate`, async context => {
    const id = `string-precreate-test-common-${name.includes("failure") ? "failure" : "result"}-publication`;
    let refuse = true;
    const value = fixture(context, id, { publishRecord: async (operationId, selected, record) => {
      if (selected === name && refuse) { refuse = false; throw new Error("synthetic common publication failure"); }
      await publishCurrentPcbDiagnosticLifecycleRecord(operationId, selected, record);
    } });
    comparisonRefusal(value); await readyForString(id, value);
    await assert.rejects(value.request("observe-common-baseline"), /publication failure/u);
    await assert.rejects(value.request("observe-string-precreate"), /COMMON_RESULT_PUBLICATION_REQUIRED/u);
    assert.equal(value.calls.includes("string-precreate"), false);
    const pending = await value.coordinator.run({ action: "inspect", operationId: id, observation: "common-baseline" });
    await value.coordinator.run({ action: "settle-records", operationId: id, expectedIntentSha256: pending["intentSha256"] });
    await value.request("observe-string-precreate"); assert.equal(value.calls.filter(call => call === "common-baseline").length, 1);
    assert.equal(value.calls.filter(call => call === "string-precreate").length, 1);
  });
}

void test("fatal common owner failure cannot authorize precreate but original cleanup remains available", async context => {
  const id = "string-precreate-test-common-fatal", value = fixture(context, id); comparisonRefusal(value, true);
  await readyForString(id, value);
  await assert.rejects(value.request("observe-common-baseline"), /original owner failure/u);
  await assert.rejects(value.request("observe-string-precreate"), /COMMON_RESULT_PUBLICATION_REQUIRED/u);
  const operations = await readCurrentPcbDiagnosticLifecycles();
  const operation = operations.find(entry => entry.operationId === id); assert.ok(operation);
  assert.equal(operation.records["common-baseline-failure.json"]?.failure.nativeContinuationAllowed, false);
  assert.equal(operation.records["common-baseline-result.json"], undefined);
  await value.request("normal-close", { hwnd: "12345", confirmNormalClose: true }); assert.equal(value.state.closed, true);
});

void test("common stage cannot follow precreate or accept caller-owned baseline input", async context => {
  const id = "string-precreate-test-common-order", value = fixture(context, id);
  await readyForString(id, value);
  await assert.rejects(value.request("observe-common-baseline", { before: {} }));
  await value.request("observe-string-precreate");
  await assert.rejects(value.request("observe-common-baseline"), /COMMON_OBSERVATION_UNAVAILABLE/u);
  assert.equal(value.calls.includes("common-baseline"), false);
});
void test("primary observation failure survives publication failure, settlement and historical inspection without replay", async context => {
  for (const stringPurpose of [false, true]) {
    const id = `${stringPurpose ? "string-precreate" : "diagnostic"}-test-primary-failure`;
    let failPublication = true;
    const value = fixture(context, id, { publishRecord: async (operationId, name, record) => {
      if (name === "observation-failure.json" && failPublication) { failPublication = false; throw new Error("synthetic failure publication"); }
      await publishCurrentPcbDiagnosticLifecycleRecord(operationId, name, record);
    } });
    const primary = currentPcbObservationFailure(stringPurpose ? "STRING_PRECREATE" : "MODEL", "pending",
      [currentPcbPendingFailure("teardrops", "own")], false);
    const fail = (): Promise<never> => { value.calls.push("failure-observation"); return Promise.reject(primary); };
    if (stringPurpose) { value.owner.observeStringPrecreate = fail; await readyForString(id, value); }
    else {
      value.owner.observeModelState = fail; await value.coordinator.run(launch(id));
      await value.request("browser-observation"); await value.request("inspect-frames", { targetId: "target-1" });
      await value.request("inspect-script", { frameId: "frame-1", family: "pcb" });
    }
    const action = stringPurpose ? "observe-string-precreate" : "observe-model-state";
    await assert.rejects(value.request(action), (error: unknown) => {
      assert.ok(error instanceof AggregateError); assert.equal(error.cause, primary); return true;
    });
    const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
    assert.deepEqual(inspected["observationFailure"], currentPcbObservationFailureDetail(primary));
    assert.equal(inspected["observationFailurePublished"], false);
    await assert.rejects(value.request(action), /OBSERVATION_CONSUMED/u);
    await value.coordinator.run({ action: "settle-records", operationId: id, expectedIntentSha256: inspected["intentSha256"] });
    const historical = stringPurpose ? new CurrentPcbStringPrecreateLifecycle(value.options) : new CurrentPcbDiagnosticLifecycle(value.options);
    const result = await historical.run({ action: "inspect", operationId: id });
    assert.deepEqual(result["observationFailure"], currentPcbObservationFailureDetail(primary));
    assert.equal(result["observationFailurePublished"], true); assert.equal(result["historicalOwnershipRecreated"], false);
    assert.equal(value.calls.filter(call => call === "failure-observation").length, 1);
    const records = await readCurrentPcbDiagnosticLifecycles();
    const operation = records.find(item => item.operationId === id);
    assert.ok(operation !== undefined);
    const record = operation.records["observation-failure.json"]; assert.ok(record !== undefined);
    assert.equal(record.intentSha256, sha256Json(operation.records[`${record.stage}-intent.json`]));
    value.state.terminated = true; await value.request("observe-termination"); await value.request("release-closed");
  }
});
void test("fixed String lifecycle seals purpose, journals the joined source chain and preserves historical read-only inspection", async context => {
  const id = "string-precreate-test-chain", value = fixture(context, id);
  await readyForOpening(id, value);
  await assert.rejects(value.request("inspect-workers"), /PROJECT_OPENING_UNCONFIRMED/u);
  await value.request("open-project", OPEN_INPUT);
  await assert.rejects(value.request("inspect-workers"), /ORIGINAL_PCB_SOURCE_REQUIRED/u);
  await value.request("open-pcb", { acceptNormalOpenEffects: true });
  await assert.rejects(value.request("inspect-workers"), /ORIGINAL_PCB_SOURCE_REQUIRED/u);
  await value.request("observe-pcb-opening");
  await assert.rejects(value.request("observe-string-precreate"), /ORIGINAL_WORKER_SOURCE_REQUIRED/u);
  await value.request("inspect-workers");
  await assert.rejects(value.request("observe-string-precreate"), /ORIGINAL_WORKER_SOURCE_REQUIRED/u);
  await value.request("inspect-worker-script", { targetId: "worker-1" });
  const observed = await value.request("observe-string-precreate");
  assert.equal(observed["stage"], "string-precreate");
  await assert.rejects(value.request("observe-string-precreate"), /OBSERVATION_CONSUMED/u);
  await assert.rejects(value.request("observe-model-state"));
  await assert.rejects(value.request("observe-worker-state"));
  assert.equal(value.calls.filter(call => call === "string-precreate").length, 1);
  const operations = await readCurrentPcbDiagnosticLifecycles();
  const operation = operations.find(entry => entry.operationId === id);
  assert.ok(operation);
  assert.equal(operation.records["intent.json"]?.schema, "easyeda-pro-control.pcb-string-precreate-launch-intent.v1");
  assert.equal(operation.records["string-precreate-intent.json"]?.pcbOpeningResultSha256, sha256Json(operation.records["pcb-opening-result.json"]));
  assert.equal(operation.records["string-precreate-intent.json"]?.workerScriptResultSha256, sha256Json(operation.records["worker-script-result.json"]));
  await assert.rejects(assertNoUnresolvedCurrentPcbDiagnosticLaunches(), /UNRESOLVED_LAUNCH/u);
  const historical = new CurrentPcbStringPrecreateLifecycle(value.options);
  const inspected = await historical.run({ action: "inspect", operationId: id, observation: "string-precreate" });
  assert.match(JSON.stringify(inspected), /pcb-string-precreate-observation/u);
  await assert.rejects(historical.run({ action: "observe-string-precreate", operationId: id,
    expectedBindingSha256: sha256Json(operation.records["binding.json"]) }), /ORIGINAL_OWNER_REQUIRED/u);
  await assert.rejects(new CurrentPcbDiagnosticLifecycle(value.options).run({ action: "inspect", operationId: id }), /PURPOSE_MISMATCH/u);
});
void test("String V2 summary bounds initial and historical responses while retaining the complete original record", async context => {
  const id = "string-precreate-test-v2-summary", value = fixture(context, id);
  const original = value.owner.observeStringPrecreate, retained: { result?: Readonly<Record<string, unknown>> } = {};
  const target = { projectUuid: OPEN_TARGET.projectUuid, branchUuid: OPEN_CHECKPOINT.targetEvidence.branchUuid,
    documentUuid: OPEN_TARGET.documentUuid, windowTabId: "fixture-tab" };
  value.owner.observeStringPrecreate = async (before): ReturnType<CurrentPcbStringPrecreateLifecycleOwner["observeStringPrecreate"]> => {
    const sample = { synthetic: "x".repeat(200 * 1024) };
    const result = { ...await original.call(value.owner, before), schema: "easyeda-pro-control.pcb-string-precreate-observation.v2",
      first: sample, second: sample,
      workerProducers: { schema: "easyeda-pro-control.pcb-string-worker-producer-observation.v1",
        identity: { projectUuid: target.projectUuid, branchUuid: target.branchUuid, windowTabId: target.windowTabId },
        originalRunnerIssued: true, hiddenCallbackReceiversVerified: false, completePublishersVerified: false,
        writeDestinationsContained: false, atomicSnapshotVerified: false, continuousObservation: false,
        queueCompletionVerified: false, saveAuthorized: false, executionAuthorized: false, synthetic: "w".repeat(80 * 1024) },
      actorClock: { profile: "private.current-pcb-string-actor-clock-packet.v1", identity: target,
        originalRunnerIssued: true, pairedActorValuesMatched: true, packetSha256: "c".repeat(64),
        ...CURRENT_PCB_STRING_ACTOR_CLOCK_LIMITS, synthetic: "a".repeat(80 * 1024) } };
    retained.result = result; return result;
  };
  await readyForString(id, value);
  const observed = await value.request("observe-string-precreate");
  assert.ok(retained.result !== undefined);
  const resultBytes = Buffer.byteLength(canonicalJson(retained.result));
  assert.ok(resultBytes > 512 * 1024 && resultBytes < 680 * 1024);
  const expected = { schema: "easyeda-pro-control.pcb-string-precreate-summary.v1",
    observationSchema: "easyeda-pro-control.pcb-string-precreate-observation.v2", target,
    matchingSamples: true, originalContextsRechecked: true, summaryOnly: true,
    record: { path: join(directory(id), "string-precreate-result.json"), published: true,
      resultSha256: sha256Json(retained.result), resultBytes },
    projectWorkerAssociationVerified: false, publicationCaptureVerified: false, completeLiveSourceVerified: false,
    queueCompletionVerified: false, saveAuthorized: false, executionAuthorized: false };
  assert.deepEqual(observed["result"], expected);
  assert.ok(Buffer.byteLength(canonicalJson(observed)) < 8192);
  const operations = await readCurrentPcbDiagnosticLifecycles();
  const operation = operations.find(entry => entry.operationId === id);
  assert.ok(operation !== undefined);
  assert.deepEqual(operation.records["string-precreate-result.json"]?.result, retained.result);
  for (const coordinator of [value.coordinator, new CurrentPcbStringPrecreateLifecycle(value.options)]) {
    const inspected = await coordinator.run({ action: "inspect", operationId: id, observation: "string-precreate" });
    assert.ok(Buffer.byteLength(canonicalJson(inspected)) < 16_384);
    assert.ok(Array.isArray(inspected["observations"]));
    const observation: unknown = inspected["observations"].find((item: { stage: string }) => item.stage === "string-precreate");
    assert.ok(typeof observation === "object" && observation !== null && "result" in observation);
    assert.deepEqual(observation.result, expected);
  }
  await assert.rejects(value.request("observe-string-precreate"), /OBSERVATION_CONSUMED/u);
  assert.equal(value.calls.filter(call => call === "string-precreate").length, 1);
});
void test("String publication uncertainty consumes once, retains the result and settles only original bytes", async context => {
  let fail = true;
  const id = "string-precreate-test-publication", value = fixture(context, id, { publishRecord: async (operationId, name, record) => {
    if (name === "string-precreate-result.json" && fail) { fail = false; throw new Error("synthetic String publication failure"); }
    await publishCurrentPcbDiagnosticLifecycleRecord(operationId, name, record);
  } });
  await readyForString(id, value);
  await assert.rejects(value.request("observe-string-precreate"), /publication failure/u);
  await assert.rejects(value.request("observe-string-precreate"), /OBSERVATION_CONSUMED/u);
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id, observation: "string-precreate" });
  assert.match(JSON.stringify(inspected), /"resultRetained":true,"published":false/u);
  await value.coordinator.run({ action: "settle-records", operationId: id, expectedIntentSha256: inspected["intentSha256"] });
  assert.equal(value.calls.filter(call => call === "string-precreate").length, 1);
  const operations = await readCurrentPcbDiagnosticLifecycles();
  assert.ok(operations.find(entry => entry.operationId === id)?.records["string-precreate-result.json"]);
});
void test("String purpose admits its bounded pair above the old diagnostic bound without enlarging diagnostic records", async context => {
  const id = "string-precreate-test-bound", sample = { synthetic: "x".repeat(160 * 1024) }, value = fixture(context, id);
  const original = value.owner.observeStringPrecreate;
  value.owner.observeStringPrecreate = async (before): ReturnType<CurrentPcbStringPrecreateLifecycleOwner["observeStringPrecreate"]> =>
    ({ ...await original.call(value.owner, before), first: sample, second: sample });
  await readyForString(id, value);
  await value.request("observe-string-precreate");
  const operations = await readCurrentPcbDiagnosticLifecycles();
  const record = operations.find(entry => entry.operationId === id)?.records["string-precreate-result.json"];
  assert.ok(record);
  assert.equal(diagnosticLifecycleRecordSchemas["browser-result.json"].safeParse({ ...record,
    schema: "easyeda-pro-control.pcb-diagnostic-observation-result.v1", stage: "browser" }).success, false);
  assert.equal(diagnosticLifecycleRecordSchemas["string-precreate-result.json"].safeParse({ ...record,
    result: { ...record.result, first: { value: "x".repeat(188_416) }, second: { value: "x".repeat(188_416) } } }).success, false);
  assert.equal(diagnosticLifecycleRecordSchemas["string-precreate-result.json"].safeParse({ ...record,
    result: { ...record.result, saveAuthorized: true } }).success, false);
});
void test("journal refuses changing String intent to diagnostic and method/profile drift cannot select another owner purpose", async context => {
  const id = "string-precreate-test-purpose", value = fixture(context, id);
  await readyForString(id, value);
  const path = join(directory(id), "intent.json"), text = await readFile(path, "utf8");
  const record = diagnosticLifecycleRecordSchemas["intent.json"].parse(JSON.parse(text) as unknown);
  assert.equal(record.schema, "easyeda-pro-control.pcb-string-precreate-launch-intent.v1");
  const changed = { ...record, schema: "easyeda-pro-control.pcb-diagnostic-launch-intent.v1" };
  Reflect.deleteProperty(changed, "purpose");
  await writeFile(path, JSON.stringify(changed), { mode: 0o600 });
  await assert.rejects(readCurrentPcbDiagnosticLifecycles(), /RESERVED_STRING_PURPOSE_ID/u);
  await writeFile(path, text, { mode: 0o600 });
  const original = value.owner.observeStringPrecreate;
  value.owner.observeStringPrecreate = (): ReturnType<CurrentPcbStringPrecreateLifecycleOwner["observeStringPrecreate"]> => Promise.resolve({});
  await assert.rejects(value.request("observe-string-precreate"), /OWNER_PURPOSE_CHANGED/u);
  value.owner.observeStringPrecreate = original;
  await value.request("observe-string-precreate");
});
void test("String result with a changed window cannot be published and original cleanup remains available", async context => {
  const id = "string-precreate-test-window", value = fixture(context, id);
  const original = value.owner.observeStringPrecreate;
  value.owner.observeStringPrecreate = async (before): ReturnType<CurrentPcbStringPrecreateLifecycleOwner["observeStringPrecreate"]> =>
    ({ ...await original.call(value.owner, before), target: { projectUuid: OPEN_TARGET.projectUuid,
      branchUuid: OPEN_CHECKPOINT.targetEvidence.branchUuid, documentUuid: OPEN_TARGET.documentUuid, windowTabId: "different-window" } });
  await readyForString(id, value);
  await assert.rejects(value.request("observe-string-precreate"), /STRING_PRECREATE_TARGET/u);
  const operations = await readCurrentPcbDiagnosticLifecycles();
  assert.equal(operations.find(entry => entry.operationId === id)?.records["string-precreate-result.json"], undefined);
  assert.equal(value.calls.filter(call => call === "string-precreate").length, 1);
  await assert.rejects(value.request("observe-string-precreate"), /OBSERVATION_CONSUMED/u);
  await value.request("normal-close", { hwnd: "12345", confirmNormalClose: true });
  value.state.terminated = true; await value.request("observe-termination"); await value.request("release-closed");
  assert.equal(value.coordinator.hasActiveReservation(), false);
});
void test("PCB source proof requires matching original target and accepted native readiness, not DOM/source alone", () => {
  const target = { ...OPEN_TARGET, branchUuid: OPEN_CHECKPOINT.targetEvidence.branchUuid };
  assert.equal(diagnosticPcbOpeningSourceAccepted(PCB_SOURCE_RESULT, target), true);
  for (const result of [{ ...PCB_SOURCE_RESULT, openingObservation: undefined },
    { ...PCB_SOURCE_RESULT, openingObservation: { ...PCB_OBSERVATION, ok: false } },
    { ...PCB_SOURCE_RESULT, openingObservation: { ...PCB_OBSERVATION, frameObserved: false } },
    { ...PCB_SOURCE_RESULT, openingObservation: { ...PCB_OBSERVATION, documentUuid: "a".repeat(16) } },
    { ...PCB_SOURCE_RESULT, openingObservation: { ...PCB_OBSERVATION, branchUuid: "a".repeat(32) } },
    { ...PCB_SOURCE_RESULT, documentUuid: "a".repeat(16) }]) {
    assert.equal(diagnosticPcbOpeningSourceAccepted(result, target), false);
  }
});
void test("original PCB opening is two one-shot stages before separate model observation", async context => {
  const id = "diagnostic-test-pcb-open", value = fixture(context, id);
  await readyForOpening(id, value);
  await assert.rejects(value.request("open-pcb", { acceptNormalOpenEffects: true }), /PROJECT_OPENING_UNCONFIRMED/u);
  await value.request("open-project", OPEN_INPUT);
  await assert.rejects(value.request("observe-pcb-opening"), /PCB_OPENING_UNCONFIRMED/u);
  const opened = await value.request("open-pcb", { acceptNormalOpenEffects: true });
  assert.deepEqual(opened["result"], PCB_OPEN_RESULT);
  await assert.rejects(value.request("open-pcb", { acceptNormalOpenEffects: true }), /PCB_OPENING_CONSUMED/u);
  await assert.rejects(value.request("observe-model-state"), /ORIGINAL_PCB_SOURCE_REQUIRED/u);
  await assert.rejects(value.request("inspect-workers"), /PCB_BRANCH_SELECTED/u);
  const observed = await value.request("observe-pcb-opening");
  assert.deepEqual(observed["result"], PCB_SOURCE_RESULT);
  await assert.rejects(value.request("observe-pcb-opening"), /OBSERVATION_CONSUMED/u);
  await value.request("observe-model-state");
  assert.equal(value.calls.filter(action => action === "pcb-dispatch").length, 1);
  assert.equal(value.calls.filter(action => action === "verify-checkpoint").length, 2);
  assert.equal(value.calls.filter(action => action === "verify-historical-checkpoint").length, 1);
});
void test("worker inspection excludes the PCB document branch", async context => {
  const id = "diagnostic-test-pcb-worker-exclusive", value = fixture(context, id);
  await readyForOpening(id, value); await value.request("open-project", OPEN_INPUT); await value.request("inspect-workers");
  await assert.rejects(value.request("open-pcb", { acceptNormalOpenEffects: true }), /PCB_OPENING_UNAVAILABLE/u);
  assert.equal(value.calls.includes("pcb-preflight"), false);
});
void test("lost PCB result publication settles original result without dispatch replay", async context => {
  const id = "diagnostic-test-pcb-settlement"; let fail = true;
  const value = fixture(context, id, { publishRecord: async (operationId, name, record) => {
    if (name === "pcb-open-result.json" && fail) { fail = false; throw new Error("synthetic PCB publication failure"); }
    await publishCurrentPcbDiagnosticLifecycleRecord(operationId, name, record);
  } });
  await readyForOpening(id, value); await value.request("open-project", OPEN_INPUT);
  await assert.rejects(value.request("open-pcb", { acceptNormalOpenEffects: true }), /PCB publication failure/u);
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
  assert.equal(inspected["pcbOpeningResultRetained"], true); assert.deepEqual(inspected["pcbOpeningResult"], PCB_OPEN_RESULT);
  await assert.rejects(value.request("observe-pcb-opening"), /PCB_OPENING_UNCONFIRMED/u);
  await value.coordinator.run({ action: "settle-records", operationId: id, expectedIntentSha256: inspected["intentSha256"] });
  await value.request("observe-pcb-opening");
  assert.equal(value.calls.filter(action => action === "pcb-dispatch").length, 1);
});
void test("PCB opening reuses original checkpoint and failure consumes without native replay", async context => {
  const id = "diagnostic-test-pcb-checkpoint";
  const value = fixture(context, id, { verifyHistoricalCheckpoint: () => Promise.reject(new Error("synthetic original checkpoint changed")) });
  await readyForOpening(id, value); await value.request("open-project", OPEN_INPUT);
  await assert.rejects(value.request("open-pcb", { acceptNormalOpenEffects: true }), /original checkpoint changed/u);
  await assert.rejects(value.request("open-pcb", { acceptNormalOpenEffects: true }), /PCB_OPENING_CONSUMED/u);
  assert.equal(value.calls.includes("pcb-dispatch"), false);
  await value.request("normal-close", { hwnd: "12345", confirmNormalClose: true });
});

void test("model observation requires original PCB source, preserves exact results and consumes once", async context => {
  const id = "diagnostic-test-model-state", value = fixture(context, id);
  await value.coordinator.run(launch(id));
  await assert.rejects(value.request("observe-model-state"), /ORIGINAL_PCB_SOURCE_REQUIRED/u);
  await value.request("browser-observation"); await value.request("inspect-frames", { targetId: "target-1" });
  await value.request("inspect-script", { frameId: "frame-1", family: "pcb" });
  const result = await value.request("observe-model-state");
  assert.equal(result["stage"], "model-state"); assert.deepEqual(result["result"], MODEL_RESULT);
  await assert.rejects(value.request("observe-model-state"), /OBSERVATION_CONSUMED/u);
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id, observation: "model-state" });
  assert.ok(Array.isArray(inspected["observations"]));
  assert.deepEqual(inspected["observations"].find((item: { stage: string }) => item.stage === "model-state"),
    { stage: "model-state", consumed: true, resultRetained: true, published: true, result: MODEL_RESULT });
  const historical = await new CurrentPcbDiagnosticLifecycle(value.options).run({ action: "inspect", operationId: id, observation: "model-state" });
  assert.equal(historical["designExecutionAuthorized"], false);
  assert.equal(value.calls.filter(call => call === "model-state").length, 1);
});

void test("UI source and a completed UI opening cannot authorize PCB model observation", async context => {
  const id = "diagnostic-test-model-ui", value = fixture(context, id);
  await readyForOpening(id, value);
  await assert.rejects(value.request("observe-model-state"), /ORIGINAL_PCB_SOURCE_REQUIRED/u);
  await value.request("open-project", OPEN_INPUT);
  await assert.rejects(value.request("observe-model-state"), /ORIGINAL_PCB_SOURCE_REQUIRED/u);
  assert.equal(value.calls.includes("model-state"), false);
});

void test("model observation retains exact outcome across journal drift without replaying its native read", async context => {
  const id = "diagnostic-test-model-drift", value = fixture(context, id);
  const intentPath = join(directory(id), "model-state-intent.json");
  let originalIntent = "";
  value.owner.observeModelState = async (): Promise<CurrentPcbDiagnosticModelState> => {
    value.calls.push("model-state");
    originalIntent = await readFile(intentPath, "utf8");
    const changed = diagnosticLifecycleRecordSchemas["model-state-intent.json"].parse(JSON.parse(originalIntent) as unknown);
    changed.createdAt = "2026-01-01T00:00:00.000Z";
    await writeFile(intentPath, JSON.stringify(changed));
    return structuredClone(MODEL_RESULT);
  };
  await value.coordinator.run(launch(id));
  await value.request("browser-observation"); await value.request("inspect-frames", { targetId: "target-1" });
  await value.request("inspect-script", { frameId: "frame-1", family: "pcb" });
  try { await assert.rejects(value.request("observe-model-state"), /JOURNAL_CHANGED/u); }
  finally { if (originalIntent !== "") { await writeFile(intentPath, originalIntent); } }
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id, observation: "model-state" });
  assert.ok(Array.isArray(inspected["observations"]));
  assert.deepEqual(inspected["observations"].find((item: { stage: string }) => item.stage === "model-state"),
    { stage: "model-state", consumed: true, resultRetained: true, published: false, result: MODEL_RESULT });
  await value.coordinator.run({ action: "settle-records", operationId: id, expectedIntentSha256: inspected["intentSha256"] });
  await assert.rejects(value.request("observe-model-state"), /OBSERVATION_CONSUMED/u);
  const operations = await readCurrentPcbDiagnosticLifecycles();
  const operation = operations.find(item => item.operationId === id);
  assert.deepEqual(operation?.records["model-state-result.json"]?.result, MODEL_RESULT);
  assert.equal(value.calls.filter(call => call === "model-state").length, 1);
});

void test("diagnostic opening checkpoints before durable dispatch and rechecks the same source immediately before opening", async context => {
  const id = "diagnostic-test-project-opening", value = fixture(context, id);
  await readyForOpening(id, value);
  const result = await value.request("open-project", OPEN_INPUT);
  assert.deepEqual(result["result"], OPEN_RESULT);
  assert.deepEqual(result["preparationCheckpoint"], OPEN_CHECKPOINT.preparationCheckpoint);
  assert.deepEqual(value.calls.filter(call => call.includes("checkpoint") || call.startsWith("open-")),
    ["prepare-checkpoint", "verify-checkpoint", "open-preflight", "verify-checkpoint", "open-dispatch"]);
  const operations = await readCurrentPcbDiagnosticLifecycles();
  const operation = operations.find(item => item.operationId === id);
  assert.ok(operation !== undefined);
  const intent = operation.records["project-opening-intent.json"];
  assert.ok(intent !== undefined);
  assert.equal(intent.checkpointReceiptSha256, sha256Json(OPEN_CHECKPOINT.checkpoint));
  assert.equal(intent.scriptResultSha256, sha256Json(operation.records["script-result.json"]));
  assert.deepEqual(intent.target, { ...OPEN_TARGET, branchUuid: OPEN_CHECKPOINT.targetEvidence.branchUuid });
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
  assert.equal(inspected["projectOpeningAttemptConsumed"], true);
  assert.equal(inspected["projectOpeningResultRetained"], true);
  assert.equal(inspected["projectOpeningResultPublished"], true);
  assert.equal(inspected["projectOpeningState"], "opened-prefix-observed");
  assert.equal(inspected["designExecutionAuthorized"], false);
  await assert.rejects(value.request("open-project", OPEN_INPUT), /PROJECT_OPENING_CONSUMED/u);
  await value.request("inspect-workers");
  assert.equal(value.calls.filter(call => call === "open-dispatch").length, 1);
});

void test("maximum-width Unicode opening paths roundtrip through the journal and allow release", async context => {
  const id = "diagnostic-test-project-unicode", rawWindowsPath = `C:\\${"界".repeat(4087)}.eprj2`;
  const target = { ...OPEN_TARGET, rawWindowsPath, projectUuid: sha256Text(rawWindowsPath) };
  const prepared = { ...structuredClone(OPEN_CHECKPOINT),
    targetEvidence: { ...OPEN_CHECKPOINT.targetEvidence, projectUuid: target.projectUuid },
    preparationCheckpoint: { path: `/${"界".repeat(4089)}.eprj2`, bytes: 8192, sha256: "a".repeat(64) } };
  const value = fixture(context, id, {
    prepareCheckpoint: (actual): Promise<CurrentDisposableOpenCheckpoint> => {
      assert.deepEqual(actual, target); return Promise.resolve(prepared);
    },
    verifyCheckpoint: (actual, actualTarget): Promise<void> => {
      assert.deepEqual(actual, prepared); assert.deepEqual(actualTarget, target); return Promise.resolve();
    },
  });
  value.owner.openProject = async (actual, reverify): Promise<CurrentPcbDiagnosticOpeningResult> => {
    assert.deepEqual(actual, { ...target, branchUuid: prepared.targetEvidence.branchUuid });
    await reverify(); return { ...OPEN_RESULT, projectUuid: target.projectUuid };
  };
  await readyForOpening(id, value);
  await value.request("open-project", { ...OPEN_INPUT, target });
  const bytes = await readFile(join(directory(id), "project-opening-intent.json"));
  assert.ok(bytes.length > 8192 && bytes.length < 64 * 1024);
  const operations = await readCurrentPcbDiagnosticLifecycles();
  const operation = operations.find(item => item.operationId === id);
  assert.equal(operation?.records["project-opening-intent.json"]?.target.rawWindowsPath, rawWindowsPath);
  assert.equal(operation?.records["project-opening-intent.json"]?.preparationCheckpoint.path, prepared.preparationCheckpoint.path);
  value.state.terminated = true; await value.request("observe-termination");
  const released = await value.request("release-closed");
  assert.equal(released["state"], "released");
});

void test("opening requires the original UI source and cannot begin after worker discovery", async context => {
  const id = "diagnostic-test-project-prerequisites", value = fixture(context, id);
  await value.coordinator.run(launch(id));
  await assert.rejects(value.request("open-project", OPEN_INPUT), /ORIGINAL_UI_SOURCE_REQUIRED/u);
  await value.request("browser-observation"); await value.request("inspect-frames", { targetId: "target-1" });
  await value.request("inspect-script", { frameId: "frame-1", family: "pcb" });
  await assert.rejects(value.request("open-project", OPEN_INPUT), /ORIGINAL_UI_SOURCE_REQUIRED/u);
  await value.request("inspect-workers");
  await assert.rejects(value.request("open-project", OPEN_INPUT), /PROJECT_OPENING_UNAVAILABLE/u);
  assert.equal(value.calls.includes("prepare-checkpoint"), false);
});

void test("checkpoint preparation failure consumes opening without native preflight and permits original cleanup", async context => {
  const id = "diagnostic-test-project-checkpoint-fail";
  const value = fixture(context, id, { prepareCheckpoint: () => Promise.reject(new Error("synthetic checkpoint failure")) });
  await readyForOpening(id, value);
  await assert.rejects(value.request("open-project", OPEN_INPUT), /checkpoint failure/u);
  await assert.rejects(value.request("open-project", OPEN_INPUT), /PROJECT_OPENING_CONSUMED/u);
  await assert.rejects(value.request("inspect-workers"), /PROJECT_OPENING_UNCONFIRMED/u);
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
  assert.equal(inspected["projectOpeningState"], "opening-unknown");
  assert.equal(inspected["projectOpeningAttemptConsumed"], true);
  assert.equal(value.calls.includes("open-preflight"), false);
  await value.request("normal-close", { hwnd: "12345", confirmNormalClose: true });
});

void test("source recheck failure after preflight cannot dispatch or retry opening", async context => {
  const id = "diagnostic-test-project-recheck"; let checked = 0;
  const value = fixture(context, id, { verifyCheckpoint: () => {
    checked += 1;
    return checked === 2 ? Promise.reject(new Error("synthetic source changed")) : Promise.resolve();
  } });
  await readyForOpening(id, value);
  await assert.rejects(value.request("open-project", OPEN_INPUT), /source changed/u);
  assert.equal(value.calls.includes("open-preflight"), true);
  assert.equal(value.calls.includes("open-dispatch"), false);
  await assert.rejects(value.request("open-project", OPEN_INPUT), /PROJECT_OPENING_CONSUMED/u);
  await assert.rejects(value.request("inspect-workers"), /PROJECT_OPENING_UNCONFIRMED/u);
  await value.request("normal-close", { hwnd: "12345", confirmNormalClose: true });
});

void test("opening intent publication failure consumes the attempt before native preflight", async context => {
  const id = "diagnostic-test-project-intent"; let fail = true;
  const value = fixture(context, id, { publishRecord: async (operationId, name, record) => {
    if (name === "project-opening-intent.json" && fail) { fail = false; throw new Error("synthetic opening intent publication"); }
    await publishCurrentPcbDiagnosticLifecycleRecord(operationId, name, record);
  } });
  await readyForOpening(id, value);
  await assert.rejects(value.request("open-project", OPEN_INPUT), /opening intent publication/u);
  assert.equal(value.calls.includes("open-preflight"), false);
  await assert.rejects(value.request("open-project", OPEN_INPUT), /PROJECT_OPENING_CONSUMED/u);
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
  await value.coordinator.run({ action: "settle-records", operationId: id, expectedIntentSha256: inspected["intentSha256"] });
  await value.request("normal-close", { hwnd: "12345", confirmNormalClose: true });
});

void test("opening result publication failure retains and settles exact decoded outcome without dispatch replay", async context => {
  const id = "diagnostic-test-project-result"; let fail = true;
  const value = fixture(context, id, { publishRecord: async (operationId, name, record) => {
    if (name === "project-opening-result.json" && fail) { fail = false; throw new Error("synthetic opening result publication"); }
    await publishCurrentPcbDiagnosticLifecycleRecord(operationId, name, record);
  } });
  await readyForOpening(id, value);
  await assert.rejects(value.request("open-project", OPEN_INPUT), /opening result publication/u);
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
  assert.deepEqual(inspected["projectOpeningResult"], OPEN_RESULT);
  assert.equal(inspected["projectOpeningResultRetained"], true);
  assert.equal(inspected["projectOpeningResultPublished"], false);
  await assert.rejects(value.request("inspect-workers"), /PROJECT_OPENING_UNCONFIRMED/u);
  await value.coordinator.run({ action: "settle-records", operationId: id, expectedIntentSha256: inspected["intentSha256"] });
  await value.request("inspect-workers");
  const historical = await new CurrentPcbDiagnosticLifecycle(value.options).run({ action: "inspect", operationId: id });
  assert.equal(historical["projectOpeningState"], "opened-prefix-observed");
  assert.equal(historical["projectOpeningResultRetained"], false);
  await assert.rejects(new CurrentPcbDiagnosticLifecycle(value.options).run({ action: "open-project", operationId: id,
    expectedBindingSha256: inspected["bindingSha256"], ...OPEN_INPUT }), /ORIGINAL_OWNER_REQUIRED/u);
  assert.equal(value.calls.filter(call => call === "open-dispatch").length, 1);
});

void test("opening uncertainty retains intent and allows cleanup but not worker discovery or replay", async context => {
  const id = "diagnostic-test-project-uncertain", value = fixture(context, id);
  value.owner.openProject = async (_target, reverify): Promise<never> => {
    await reverify(); value.calls.push("open-dispatch"); throw new Error("synthetic lost opening reply");
  };
  await readyForOpening(id, value);
  await assert.rejects(value.request("open-project", OPEN_INPUT), /lost opening reply/u);
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
  assert.equal(inspected["projectOpeningState"], "opening-unknown");
  assert.equal(Object.hasOwn(inspected, "nativeOpeningReply"), false);
  await assert.rejects(value.request("open-project", OPEN_INPUT), /PROJECT_OPENING_CONSUMED/u);
  await assert.rejects(value.request("inspect-workers"), /PROJECT_OPENING_UNCONFIRMED/u);
  await value.request("normal-close", { hwnd: "12345", confirmNormalClose: true });
  assert.equal(value.calls.filter(call => call === "open-dispatch").length, 1);
});

void test("postcheck failure exposes the original native reply without accepting, publishing or replaying opening", async context => {
  const id = "diagnostic-test-project-postcheck", value = fixture(context, id);
  const failure = { schema: "easyeda-pro-control.pcb-diagnostic-pipe-failure.v1", code: "reply",
    reason: "event-callback", request: { id: 25, method: "Runtime.callFunctionOn", phase: "project-open-project" },
    requestPending: true, eventKind: "Page.frameNavigated", executionAuthorized: false, dispatchAbsenceVerified: false } as const;
  const status = value.owner.status;
  value.owner.status = (): ReturnType<CurrentPcbDiagnosticLifecycleOwner["status"]> =>
    ({ ...status(), diagnosticFailure: "reply", diagnosticFailureObservation: failure });
  value.owner.openProject = async (_target, reverify): Promise<never> => {
    value.calls.push("open-preflight"); await reverify(); value.calls.push("open-dispatch", "native-opening-reply");
    throw new Error("synthetic postcheck refused");
  };
  await readyForOpening(id, value);
  await assert.rejects(value.request("open-project", OPEN_INPUT), /postcheck refused/u);
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
  assert.deepEqual(inspected["nativeOpeningReply"], OPEN_RESULT);
  assert.deepEqual(inspected["diagnosticFailureObservation"], failure);
  assert.equal(inspected["hostTransitionAccepted"], false);
  assert.equal(inspected["projectOpeningState"], "opening-unknown");
  assert.equal(inspected["projectOpeningResultRetained"], false);
  assert.equal(inspected["projectOpeningResultPublished"], false);
  assert.equal(Object.hasOwn(inspected, "projectOpeningResult"), false);
  await assert.rejects(value.request("open-project", OPEN_INPUT), /PROJECT_OPENING_CONSUMED/u);
  await assert.rejects(value.request("inspect-workers"), /PROJECT_OPENING_UNCONFIRMED/u);
  await value.coordinator.run({ action: "settle-records", operationId: id, expectedIntentSha256: inspected["intentSha256"] });
  await assert.rejects(value.request("inspect-workers"), /PROJECT_OPENING_UNCONFIRMED/u);
  const operations = await readCurrentPcbDiagnosticLifecycles();
  assert.equal(operations.find(operation => operation.operationId === id)?.records["project-opening-result.json"], undefined);
  const historical = await new CurrentPcbDiagnosticLifecycle(value.options).run({ action: "inspect", operationId: id });
  assert.equal(historical["projectOpeningState"], "opening-unknown");
  assert.equal(Object.hasOwn(historical, "nativeOpeningReply"), false);
  assert.equal(historical["diagnosticFailureObservation"], null);
  assert.equal(value.calls.filter(call => call === "open-dispatch").length, 1);
  await value.request("normal-close", { hwnd: "12345", confirmNormalClose: true });
});

void test("native preflight refusal is retained without pretending navigation or source recheck occurred", async context => {
  const id = "diagnostic-test-project-refused", value = fixture(context, id);
  const refused = { ...OPEN_RESULT, phase: "preflight", ok: false, status: "refused", failure: { stage: "registration-before", code: "OWNERS" },
    dispatchAttempted: false, publicResult: null, prefixObserved: false, nativeWorkMayRemain: false, observation: null } as const;
  value.owner.openProject = (): Promise<typeof refused> => Promise.resolve(refused);
  await readyForOpening(id, value);
  const result = await value.request("open-project", OPEN_INPUT);
  assert.deepEqual(result["result"], refused);
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
  assert.equal(inspected["projectOpeningState"], "refused");
  assert.equal(value.calls.filter(call => call === "verify-checkpoint").length, 1);
  await assert.rejects(value.request("inspect-workers"), /PROJECT_OPENING_UNCONFIRMED/u);
});

void test("private launch gate retains an original lexical lease and rejects JSON copies and competing callers", async () => {
  const original = acquireCurrentPcbDiagnosticLaunchExclusion();
  try {
    assertCurrentPcbDiagnosticLaunchExclusion(original);
    assert.throws(() => { releaseCurrentPcbDiagnosticLaunchExclusion({ ...original }); }, /LEASE_CHANGED/u);
    await assert.rejects(withCurrentPcbDiagnosticLaunchExclusion(() => Promise.resolve()), /LAUNCH_BUSY/u);
    assertCurrentPcbDiagnosticLaunchExclusion(original);
  } finally { releaseCurrentPcbDiagnosticLaunchExclusion(original); }
  assert.throws(() => { releaseCurrentPcbDiagnosticLaunchExclusion(original); }, /LEASE_CHANGED/u);
  await withCurrentPcbDiagnosticLaunchExclusion(() => Promise.resolve());
});

void test("staged diagnostics retain bounded original observations, fixed profiles and one-shot intents", async context => {
  const id = "diagnostic-test-observations", value = fixture(context, id);
  await value.coordinator.run(launch(id));
  await assert.rejects(value.request("inspect-frames", { targetId: "target-1" }), /BROWSER_OBSERVATION_REQUIRED/u);
  await value.request("browser-observation");
  await assert.rejects(value.request("browser-observation"), /OBSERVATION_CONSUMED/u);
  await value.request("inspect-frames", { targetId: "target-1" });
  const result = await value.request("inspect-script", { frameId: "frame-1", family: "pcb" });
  assert.deepEqual(result["result"], { sourceVerified: true, family: "pcb", executionAuthorized: false });
  assert.deepEqual(value.calls.filter(call => ["browser", "frames", "script"].includes(call)), ["browser", "frames", "script"]);
  await assert.rejects(value.request("inspect-script", { frameId: "frame-1", family: "ui" }), /OBSERVATION_CONSUMED/u);
  const historical = await new CurrentPcbDiagnosticLifecycle(value.options).run({ action: "inspect", operationId: id, observation: "browser" });
  const observations = historical["observations"];
  assert.ok(Array.isArray(observations));
  assert.equal(observations.filter((item: unknown) => typeof item === "object" && item !== null && "result" in item && item.result !== undefined).length, 1);
  const operations = await readCurrentPcbDiagnosticLifecycles();
  assert.ok(operations.find(operation => operation.operationId === id)?.records["script-result.json"]);
});

void test("observation publication failure retains its exact successful return without repeating the native stage", async context => {
  const id = "diagnostic-test-observation-publication";
  let fail = true;
  const value = fixture(context, id, { publishRecord: async (operationId, name, record) => {
    if (name === "browser-result.json" && fail) { fail = false; throw new Error("synthetic result publication failure"); }
    await publishCurrentPcbDiagnosticLifecycleRecord(operationId, name, record);
  } });
  await value.coordinator.run(launch(id));
  await assert.rejects(value.request("browser-observation"), /result publication failure/u);
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id, observation: "browser" });
  assert.match(JSON.stringify(inspected["observations"]), /target-1/u);
  await assert.rejects(value.request("browser-observation"), /OBSERVATION_CONSUMED/u);
  await value.coordinator.run({ action: "settle-records", operationId: id, expectedIntentSha256: inspected["intentSha256"] });
  assert.equal(value.calls.filter(call => call === "browser").length, 1);
  await value.request("inspect-frames", { targetId: "target-1" });
});

void test("worker stages require retained frame, child and source results and consume each original action once", async context => {
  const id = "diagnostic-test-worker-stages", value = fixture(context, id);
  await value.coordinator.run(launch(id));
  await assert.rejects(value.request("inspect-workers"), /FRAME_OBSERVATION_REQUIRED/u);
  await value.request("browser-observation");
  await value.request("inspect-frames", { targetId: "target-1" });
  await assert.rejects(value.request("inspect-worker-script", { targetId: "worker-1" }), /WORKER_OBSERVATION_REQUIRED/u);
  await assert.rejects(value.request("observe-worker-state"), /WORKER_SOURCE_REQUIRED/u);
  await value.request("inspect-workers");
  await value.request("inspect-worker-script", { targetId: "worker-1" });
  const result = await value.request("observe-worker-state");
  assert.deepEqual(result["result"], { queueCompletionVerified: false, executionAuthorized: false });
  for (const [action, extra] of [["inspect-workers", {}], ["inspect-worker-script", { targetId: "worker-1" }],
    ["observe-worker-state", {}]] as const) {
    await assert.rejects(value.request(action, extra), /OBSERVATION_CONSUMED/u);
  }
  const operations = await readCurrentPcbDiagnosticLifecycles();
  const records = operations.find(operation => operation.operationId === id)?.records;
  assert.ok(records?.["worker-state-result.json"]);
  const historical = await new CurrentPcbDiagnosticLifecycle(value.options).run({ action: "inspect", operationId: id, observation: "worker-state" });
  assert.match(JSON.stringify(historical["observations"]), /queueCompletionVerified/u);
  assert.deepEqual(value.calls.filter(call => call.startsWith("worker")), ["workers", "worker-script", "worker-state"]);
});

void test("worker result publication can settle without another evaluation", async context => {
  const id = "diagnostic-test-worker-publication"; let fail = true;
  const value = fixture(context, id, { publishRecord: async (operationId, name, record) => {
    if (name === "worker-state-result.json" && fail) { fail = false; throw new Error("synthetic worker publication failure"); }
    await publishCurrentPcbDiagnosticLifecycleRecord(operationId, name, record);
  } });
  await value.coordinator.run(launch(id));
  await value.request("browser-observation");
  await value.request("inspect-frames", { targetId: "target-1" });
  await value.request("inspect-workers");
  await value.request("inspect-worker-script", { targetId: "worker-1" });
  await assert.rejects(value.request("observe-worker-state"), /worker publication failure/u);
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id, observation: "worker-state" });
  assert.match(JSON.stringify(inspected["observations"]), /queueCompletionVerified/u);
  await assert.rejects(value.request("observe-worker-state"), /OBSERVATION_CONSUMED/u);
  await value.coordinator.run({ action: "settle-records", operationId: id, expectedIntentSha256: inspected["intentSha256"] });
  assert.equal(value.calls.filter(call => call === "worker-state").length, 1);
});

void test("original cleanup does not require startup admission after diagnostic launch", async context => {
  const id = "diagnostic-test-local-cleanup", value = fixture(context, id);
  await value.coordinator.run(launch(id)); value.state.failAllowed = true; value.state.failOther = true;
  await value.request("normal-close", { hwnd: "12345", confirmNormalClose: true });
  value.state.terminated = true; await value.request("observe-termination"); await value.request("release-closed");
  assert.equal(value.coordinator.hasActiveReservation(), false);
});

void test("settled rootless refusal releases only the original owner with a distinct durable no-process proof", async context => {
  const combinations = [["not-issued", "not-entered"], ["native-refused", "not-entered"], ["native-refused", "returned-false"]] as const;
  for (const [index, [outcome, creationState]] of combinations.entries()) {
    const id = `diagnostic-test-no-process-${String(index)}`, value = fixture(context, id);
    value.state.rootless = outcome; value.state.creationState = creationState;
    await assert.rejects(value.coordinator.run(launch(id)), /settled rootless refusal/u);
    const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
    assert.equal(inspected["noProcessCleanupAvailable"], true); assert.equal(inspected["bindingSha256"], undefined);
    await assert.rejects(value.coordinator.run({ action: "cleanup-unlaunched", operationId: id, expectedIntentSha256: inspected["intentSha256"] }), /NONDISPATCH_NOT_PROVED/u);
    value.state.failAllowed = true; value.state.failOther = true; value.state.installationDrift = true;
    const result = await value.coordinator.run({ action: "cleanup-no-process", operationId: id, expectedIntentSha256: inspected["intentSha256"] });
    assert.equal(result["state"], "no-process-released");
    assert.deepEqual(result["noProcessReleaseProof"], { launchRequestOutcome: outcome, creationState, processCreated: false, released: true });
    assert.equal(value.coordinator.hasActiveReservation(), false); await assertNoUnresolvedCurrentPcbDiagnosticLaunches();
    const operations = await readCurrentPcbDiagnosticLifecycles();
    const records = operations.find(operation => operation.operationId === id)?.records;
    assert.ok(records?.["no-process-released.json"]); assert.equal(records["not-dispatched.json"], undefined);
    assert.equal(value.calls.filter(call => call === "release-no-process").length, 1);
    await assert.rejects(value.coordinator.run({ action: "cleanup-no-process", operationId: id, expectedIntentSha256: inspected["intentSha256"] }), /ORIGINAL_ATTEMPT_REQUIRED/u);
  }
  assert.equal(diagnosticLifecycleNoProcessReleaseProofSchema.safeParse({ launchRequestOutcome: "not-issued", creationState: "returned-false", processCreated: false, released: true }).success, false);
  const failed = { launchRequestOutcome: "native-refused", creationState: "returned-false", processCreated: false, released: true };
  for (const code of [0, 87, 4_294_967_295]) {
    assert.equal(diagnosticLifecycleNoProcessReleaseProofSchema.safeParse({ ...failed, createProcessError: code }).success, true);
  }
  for (const code of [-1, -0, 4_294_967_296, "87", Number.NaN]) {
    assert.equal(diagnosticLifecycleNoProcessReleaseProofSchema.safeParse({ ...failed, createProcessError: code }).success, false);
  }
  assert.equal(diagnosticLifecycleNoProcessReleaseProofSchema.safeParse({ ...failed, creationState: "not-entered", createProcessError: 87 }).success, false);
});

void test("rootless release publication settles exact terminal bytes without replaying native release", async context => {
  const id = "diagnostic-test-no-process-publication";
  let fail = true;
  const value = fixture(context, id, { publishRecord: async (operationId, name, record) => {
    if (name === "no-process-released.json" && fail) { fail = false; throw new Error("synthetic no-process publication failure"); }
    await publishCurrentPcbDiagnosticLifecycleRecord(operationId, name, record);
  } });
  value.state.rootless = "native-refused";
  await assert.rejects(value.coordinator.run(launch(id)), /settled rootless refusal/u);
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
  await assert.rejects(value.coordinator.run({ action: "cleanup-no-process", operationId: id, expectedIntentSha256: inspected["intentSha256"] }), /publication failure/u);
  assert.equal(value.coordinator.hasActiveReservation(), true); await assert.rejects(assertNoUnresolvedCurrentPcbDiagnosticLaunches(), /UNRESOLVED_LAUNCH/u);
  const settled = await value.coordinator.run({ action: "settle-records", operationId: id, expectedIntentSha256: inspected["intentSha256"] });
  assert.equal(settled["state"], "no-process-released"); assert.equal(value.coordinator.hasActiveReservation(), false);
  assert.equal(value.calls.filter(call => call === "release-no-process").length, 1); await assertNoUnresolvedCurrentPcbDiagnosticLaunches();
});

void test("rootless cleanup refuses unhealthy transport, lost original owner, wrong intent and corrupt journals", async context => {
  const id = "diagnostic-test-no-process-refusals", value = fixture(context, id);
  value.state.rootless = "native-refused";
  await assert.rejects(value.coordinator.run(launch(id)), /settled rootless refusal/u);
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
  const request = { action: "cleanup-no-process", operationId: id, expectedIntentSha256: inspected["intentSha256"] };
  await assert.rejects(new CurrentPcbDiagnosticLifecycle(value.options).run(request), /ORIGINAL_ATTEMPT_REQUIRED/u);
  await assert.rejects(value.coordinator.run({ ...request, expectedIntentSha256: "f".repeat(64) }), /ORIGINAL_ATTEMPT_REQUIRED/u);
  value.state.noProcessHealthy = false;
  await assert.rejects(value.coordinator.run(request), /NO_PROCESS_RELEASE_UNAVAILABLE/u); value.state.noProcessHealthy = true;
  const path = join(directory(id), "intent.json");
  const bytes = await readFile(path);
  try {
    await writeFile(path, "{"); await assert.rejects(value.coordinator.run(request));
    assert.equal(value.calls.includes("release-no-process"), false);
  } finally { await writeFile(path, bytes); }
  await value.coordinator.run(request);
});

void test("post-create bindings cannot enter rootless release", async context => {
  const id = "diagnostic-test-no-process-bound", value = fixture(context, id);
  await value.coordinator.run(launch(id));
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
  await assert.rejects(value.coordinator.run({ action: "cleanup-no-process", operationId: id, expectedIntentSha256: inspected["intentSha256"] }), /ORIGINAL_ROOTLESS_OWNER_REQUIRED/u);
  assert.equal(value.calls.includes("release-no-process"), false);
});

void test("private diagnostic inventory preserves partial reservations and refuses unknown or malformed files", async context => {
  const id = "diagnostic-test-inventory";
  context.after(async () => { await rm(directory(id), { recursive: true, force: true }); });
  await assertNoUnresolvedCurrentPcbDiagnosticLaunches();
  await reserveCurrentPcbDiagnosticLifecycle(id);
  await assert.rejects(assertNoUnresolvedCurrentPcbDiagnosticLaunches(), /UNRESOLVED_LAUNCH/u);
  const operations = await readCurrentPcbDiagnosticLifecycles(); assert.deepEqual(operations, [{ operationId: id, records: {} }]);
  await writeFile(join(directory(id), "unknown.json"), "{}", { mode: 0o600, flag: "wx" });
  await assert.rejects(readCurrentPcbDiagnosticLifecycles(), /UNKNOWN_RECORD/u);
  await rm(join(directory(id), "unknown.json"));
  await writeFile(join(directory(id), "intent.json"), "{", { mode: 0o600, flag: "wx" });
  await assert.rejects(readCurrentPcbDiagnosticLifecycles());
  await assert.rejects(reserveCurrentPcbDiagnosticLifecycle(id), /EEXIST/u);
});

void test("synthetic original-owner lifecycle journals every dispatch and denies broader authority", async context => {
  const id = "diagnostic-test-complete", value = fixture(context, id);
  const result = await value.coordinator.run(launch(id));
  assert.equal(result["state"], "launched"); assert.equal(result["designExecutionAuthorized"], false);
  assert.equal(result["frameWorkerVerified"], false); assert.deepEqual(value.calls, ["allocate", "launch"]);
  await assert.rejects(value.coordinator.run(launch(id)), /LAUNCH_CONSUMED/u);
  await assert.rejects(withCurrentPcbDiagnosticLaunchExclusion(() => Promise.resolve()), /LAUNCH_BUSY/u);
  await assert.rejects(assertNoUnresolvedCurrentPcbDiagnosticLaunches(), /UNRESOLVED_LAUNCH/u);
  const window = await value.request("observe-window"); assert.equal(window["hwnd"], "12345");
  const closed = await value.request("normal-close", { hwnd: "12345", confirmNormalClose: true });
  assert.equal(closed["closeAcknowledged"], true); assert.equal(closed["state"], "launched");
  await assert.rejects(value.request("normal-close", { hwnd: "12345", confirmNormalClose: true }), /CLOSE_CONSUMED/u);
  const ongoing = await value.request("observe-termination"); assert.equal(ongoing["terminationObserved"], false);
  await assert.rejects(value.request("release-closed"), /RELEASE_UNAVAILABLE/u);
  value.state.terminated = true;
  const terminated = await value.request("observe-termination"); assert.equal(terminated["state"], "terminated");
  await assert.rejects(withCurrentPcbDiagnosticLaunchExclusion(() => Promise.resolve()), /LAUNCH_BUSY/u);
  const released = await value.request("release-closed"); assert.equal(released["state"], "released");
  await assertNoUnresolvedCurrentPcbDiagnosticLaunches(); await withCurrentPcbDiagnosticLaunchExclusion(() => Promise.resolve());
  assert.equal(value.calls.filter(action => action === "launch").length, 1);
  assert.equal(value.calls.filter(action => action === "close").length, 1);
  assert.equal(value.calls.filter(action => action === "release").length, 1);
});

void test("request schemas and prelaunch guards reject caller executable paths and unresolved project owners without reservation", async context => {
  const id = "diagnostic-test-preflight", value = fixture(context, id);
  await assert.rejects(value.coordinator.run({ ...launch(id), executable: "C:\\Other\\easyeda-pro.exe" }));
  await assert.rejects(value.coordinator.run({ ...launch(id), acceptExistingProfileEffects: false }));
  value.state.failOther = true;
  await assert.rejects(value.coordinator.run(launch(id)), /unresolved project/u); value.state.failOther = false;
  value.state.failAllowed = true;
  await assert.rejects(value.coordinator.run(launch(id)), /admission refused/u); value.state.failAllowed = false;
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id }); assert.equal(inspected["state"], "not-found");
  assert.deepEqual(value.calls, []);
  await value.coordinator.run(launch(id));
});

void test("one shared admission scan per boundary remains fresh across installation, intent and allocation", async context => {
  for (const prefix of ["diagnostic-test", "string-precreate-test"]) {
    const events: string[] = [], id = `${prefix}-shared-admission`;
    const value = fixture(context, id, { verifyInstallation: options => {
      events.push("installation");
      return Promise.resolve({ ...createCurrentPcbDiagnosticInstallationPlan(options), facadeSha256: "a".repeat(64) });
    } }, () => { events.push("admission"); return Promise.resolve(); });
    await value.coordinator.run(launch(id));
    assert.deepEqual(events, ["admission", "installation", "admission", "installation", "admission"]);
    value.state.terminated = true;
    await value.request("observe-termination"); await value.request("release-closed");
  }
});

void test("shared scan still refuses newly blocked evidence after helper allocation without launching", async context => {
  const id = "diagnostic-test-shared-admission-drift"; let scans = 0;
  const value = fixture(context, id, {}, () => {
    scans += 1;
    return scans === 3 ? Promise.reject(new Error("synthetic new blocker after allocation")) : Promise.resolve();
  });
  await assert.rejects(value.coordinator.run(launch(id)), /new blocker after allocation/u);
  assert.equal(scans, 3); assert.deepEqual(value.calls, ["allocate"]);
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
  await value.coordinator.run({ action: "cleanup-unlaunched", operationId: id, expectedIntentSha256: inspected["intentSha256"] });
  assert.deepEqual(value.calls, ["allocate", "release-unlaunched"]);
});

void test("mandatory ordinary-launch inventory blocks diagnostic allocation even when supplied project guard passes", async context => {
  const id = "diagnostic-test-ordinary", value = fixture(context, id);
  const root = process.env["EASYEDA_CONTROL_DATA_DIR"]; assert.ok(root !== undefined && root.includes("easyeda-test-control-"));
  const ordinary = join(root, "ordinary-launch-v1", "diagnostic-test-partial-ordinary");
  await mkdir(ordinary, { recursive: true, mode: 0o700 });
  try { await assert.rejects(value.coordinator.run(launch(id)), /unresolved ordinary/u); assert.deepEqual(value.calls, []); }
  finally { await rm(ordinary, { recursive: true }); }
  await value.coordinator.run(launch(id));
});

void test("missing launch acknowledgment retains original binding for cleanup and cannot replay", async context => {
  const id = "diagnostic-test-lost-launch", value = fixture(context, id);
  value.state.failLaunch = true;
  await assert.rejects(value.coordinator.run(launch(id)), /lost launch acknowledgment/u);
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
  assert.equal(inspected["state"], "launch-unknown"); assert.equal(inspected["launchAcknowledged"], false);
  await assert.rejects(value.coordinator.run(launch(id)), /LAUNCH_CONSUMED/u);
  await value.request("normal-close", { hwnd: "12345", confirmNormalClose: true });
});

void test("cleanup-only native creation identity never becomes an acknowledged diagnostic launch", async context => {
  const id = "diagnostic-test-cleanup-only", value = fixture(context, id); value.state.cleanupOnly = true;
  await assert.rejects(value.coordinator.run(launch(id)), /lost launch acknowledgment/u);
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
  assert.equal(inspected["state"], "cleanup-only"); assert.equal(inspected["launchAcknowledged"], false);
  await value.request("normal-close", { hwnd: "12345", confirmNormalClose: true });
});

void test("missing normal-close acknowledgment consumes close but preserves original termination and release", async context => {
  const id = "diagnostic-test-lost-close", value = fixture(context, id); await value.coordinator.run(launch(id));
  value.state.failClose = true;
  await assert.rejects(value.request("normal-close", { hwnd: "12345", confirmNormalClose: true }), /lost close acknowledgment/u);
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
  assert.equal(inspected["closeAttemptConsumed"], true); assert.equal(inspected["closeAcknowledged"], false);
  await assert.rejects(value.request("normal-close", { hwnd: "12345", confirmNormalClose: true }), /CLOSE_CONSUMED/u);
  assert.equal(value.calls.filter(action => action === "close").length, 1);
});

void test("uncertain close-intent publication consumes attempt before any native close", async context => {
  const id = "diagnostic-test-close-publication";
  const value = fixture(context, id, {
    publishRecord: async (operationId, name, record) => {
      await publishCurrentPcbDiagnosticLifecycleRecord(operationId, name, record);
      if (name === "close-intent.json") { throw new Error("synthetic lost publication acknowledgment"); }
    },
  });
  await value.coordinator.run(launch(id));
  await assert.rejects(value.request("normal-close", { hwnd: "12345", confirmNormalClose: true }), /lost publication/u);
  await assert.rejects(value.request("normal-close", { hwnd: "12345", confirmNormalClose: true }), /CLOSE_CONSUMED/u);
  assert.equal(value.calls.includes("close"), false);
});

void test("restart inspection cannot reconstruct an original owner or bypass method identity", async context => {
  const id = "diagnostic-test-owner", value = fixture(context, id); await value.coordinator.run(launch(id));
  const restarted = new CurrentPcbDiagnosticLifecycle(value.options, {
    allocateOwner: (): never => { throw new Error("must not allocate"); },
    verifyInstallation: (): never => { throw new Error("must not verify before original owner"); },
  });
  const inspected = await restarted.run({ action: "inspect", operationId: id });
  await assert.rejects(restarted.run({ action: "observe-termination", operationId: id, expectedBindingSha256: inspected["bindingSha256"] }), /ORIGINAL_OWNER/u);
  const replacement = context.mock.method(value.owner, "observeTermination", () => Promise.resolve(true));
  try { await assert.rejects(value.request("observe-termination"), /OWNER_CHANGED/u); }
  finally { replacement.mock.restore(); }
  assert.equal(value.calls.includes("close"), false);
});

void test("startup installation drift does not strand original native cleanup handles", async context => {
  const id = "diagnostic-test-cleanup-drift", value = fixture(context, id); await value.coordinator.run(launch(id));
  value.state.installationDrift = true;
  const closed = await value.request("normal-close", { hwnd: "12345", confirmNormalClose: true });
  assert.equal(closed["closeAcknowledged"], true);
  value.state.terminated = true; await value.request("observe-termination"); await value.request("release-closed");
});

void test("failed binding publication settles original bytes without native launch replay", async context => {
  const id = "diagnostic-test-binding-settlement"; let fail = true;
  const value = fixture(context, id, { publishRecord: async (operationId, name, record) => {
    if (name === "binding.json" && fail) { fail = false; throw new Error("synthetic binding publication failure"); }
    await publishCurrentPcbDiagnosticLifecycleRecord(operationId, name, record);
  } });
  await assert.rejects(value.coordinator.run(launch(id)), /binding publication failure/u);
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
  assert.equal(inspected["publicationSettlementAvailable"], true);
  const settled = await value.coordinator.run({ action: "settle-records", operationId: id, expectedIntentSha256: inspected["intentSha256"] });
  assert.equal(settled["state"], "launched");
  await value.request("normal-close", { hwnd: "12345", confirmNormalClose: true });
  assert.equal(value.calls.filter(action => action === "launch").length, 1);
});

void test("failed release publication settles exact terminal evidence without repeating native release", async context => {
  const id = "diagnostic-test-release-settlement"; let fail = true;
  const value = fixture(context, id, { publishRecord: async (operationId, name, record) => {
    if (name === "released.json" && fail) { fail = false; throw new Error("synthetic release publication failure"); }
    await publishCurrentPcbDiagnosticLifecycleRecord(operationId, name, record);
  } });
  await value.coordinator.run(launch(id)); value.state.terminated = true; await value.request("observe-termination");
  await assert.rejects(value.request("release-closed"), /release publication failure/u);
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
  const settled = await value.coordinator.run({ action: "settle-records", operationId: id, expectedIntentSha256: inspected["intentSha256"] });
  assert.equal(settled["state"], "released"); assert.equal(value.calls.filter(action => action === "release").length, 1);
  await assertNoUnresolvedCurrentPcbDiagnosticLaunches(); await withCurrentPcbDiagnosticLaunchExclusion(() => Promise.resolve());
});

void test("failure after helper allocation permits only original proved-unlaunched cleanup", async context => {
  const id = "diagnostic-test-unlaunched"; let calls = 0;
  const value = fixture(context, id, { verifyInstallation: options => {
    calls += 1;
    if (calls === 2) { return Promise.reject(new Error("synthetic pre-dispatch installation failure")); }
    return Promise.resolve({ ...createCurrentPcbDiagnosticInstallationPlan(options), facadeSha256: "a".repeat(64) });
  } });
  await assert.rejects(value.coordinator.run(launch(id)), /pre-dispatch installation failure/u);
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
  const cleaned = await value.coordinator.run({ action: "cleanup-unlaunched", operationId: id, expectedIntentSha256: inspected["intentSha256"] });
  assert.equal(cleaned["state"], "not-dispatched"); assert.deepEqual(value.calls, ["allocate", "release-unlaunched"]);
  await assertNoUnresolvedCurrentPcbDiagnosticLaunches();
});

void test("wrong HWND and altered receipt chains cannot issue normal close", async context => {
  const id = "diagnostic-test-chain", value = fixture(context, id); await value.coordinator.run(launch(id));
  await assert.rejects(value.request("normal-close", { hwnd: "54321", confirmNormalClose: true }), /WINDOW_CHANGED/u);
  const path = join(directory(id), "binding.json");
  const bytes = await readFile(path);
  const altered: unknown = JSON.parse(bytes.toString("utf8")); assert.ok(altered !== null && typeof altered === "object" && "intentSha256" in altered);
  altered.intentSha256 = "f".repeat(64);
  await writeFile(path, `${JSON.stringify(altered)}\n`);
  try { await assert.rejects(value.coordinator.run({ action: "inspect", operationId: id }), /BINDING_CHAIN/u); }
  finally { await writeFile(path, bytes); }
  assert.equal(value.calls.includes("close"), false);
});

void test("uncertain launch intent blocks repetition and can settle original known nondispatch", async context => {
  const id = "diagnostic-test-last-intent";
  const value = fixture(context, id, {
    publishRecord: async (operationId, name, record) => {
      await publishCurrentPcbDiagnosticLifecycleRecord(operationId, name, record);
      if (name === "intent.json") { throw new Error("synthetic uncertain intent"); }
    },
  });
  await assert.rejects(value.coordinator.run(launch(id)), /uncertain intent/u);
  await assert.rejects(value.coordinator.run(launch(id)), /LAUNCH_CONSUMED/u);
  await assert.rejects(assertNoUnresolvedCurrentPcbDiagnosticLaunches(), /UNRESOLVED_LAUNCH/u);
  await assert.rejects(withCurrentPcbDiagnosticLaunchExclusion(() => Promise.resolve()), /LAUNCH_BUSY/u);
  assert.deepEqual(value.calls, []);
  const inspected = await value.coordinator.run({ action: "inspect", operationId: id });
  const cleaned = await value.coordinator.run({ action: "cleanup-unlaunched", operationId: id, expectedIntentSha256: inspected["intentSha256"] });
  assert.equal(cleaned["state"], "not-dispatched"); await assertNoUnresolvedCurrentPcbDiagnosticLaunches();
});
