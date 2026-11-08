/** Actual lifecycle and private journal with an explicitly synthetic owner.
 * No application, native transport, gateway or user project is connected. */
/* oxlint-disable import/max-dependencies -- Exercise original lifecycle, checkpoint custody, exact result schema and durable private chain together. */
import assert from "node:assert/strict";
import { readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import type { TestContext } from "node:test";
import { sha256Json, sha256Text } from "../src/core.ts";
import { CurrentPcb209DiagnosticLifecycle, CurrentPcbSpatialLifecycle } from "../src/current-pcb-diagnostic-lifecycle.ts";
import type { CurrentPcbDiagnosticLifecycleDependencies, CurrentPcbDiagnosticLifecycleOptions,
  CurrentPcbDiagnosticLifecycleOwner } from "../src/current-pcb-diagnostic-lifecycle.ts";
import { createCurrentPcb209DiagnosticInstallationPlan } from "../src/current-pcb-diagnostic-installation.ts";
import { diagnosticLifecycleRecordSchemas, publishCurrentPcbDiagnosticLifecycleRecord,
  readCurrentPcbDiagnosticLifecycles, reserveCurrentPcbDiagnosticLifecycle } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";
import { CURRENT_PCB_209_OPENING_SCRIPTS } from "../src/current-pcb-209-opening-profile.ts";
import { currentPcb209SpatialResultSchema } from "../src/current-pcb-209-spatial-read.ts";
import type { CurrentPcb209SpatialQuery } from "../src/current-pcb-209-spatial-read.ts";
import { currentPcbSpatialObservation, currentPcbSpatialRequestSchema, queryCurrentPcbSpatial,
  validateCurrentPcbSpatialArguments } from "../src/current-pcb-spatial-validation.ts";
import { CurrentPcbSpatialCaptureRunner } from "../src/current-pcb-spatial-capture-runner.ts";

const PATH = String.raw`C:\Fixtures\Spatial.eprj2`;
const TARGET = { rawWindowsPath: PATH, projectUuid: sha256Text(PATH), documentUuid: "b".repeat(16), expectedSourceSha256: "a".repeat(64) };
const SEALED = { ...TARGET, branchUuid: "c".repeat(32) };
const TAB = `${TARGET.documentUuid}@${TARGET.projectUuid}`;
type Checkpoint = Awaited<ReturnType<NonNullable<CurrentPcbDiagnosticLifecycleDependencies["prepareCheckpoint"]>>>;
const CHECKPOINT: Checkpoint = { profile: "easyeda-pro-control.current-disposable-open-checkpoint.v1",
  preparationCheckpoint: { path: "/fixture/backup.eprj2", bytes: 8192, sha256: "a".repeat(64) },
  checkpoint: { schema: "easyeda-pro-control.checkpoint.v2", source: "/fixture/source.eprj2", checkpoint: "/fixture/backup.eprj2",
    receiptPath: "/fixture/receipt.json", createdAt: "2026-01-01T00:00:00Z", sourceIdentity: { dev: "1", ino: "2", birthtimeNs: "3", ctimeNs: "4" },
    checkpointIdentity: { dev: "1", ino: "5", birthtimeNs: "6", ctimeNs: "7" }, sourceSha256: "a".repeat(64), checkpointSha256: "a".repeat(64),
    sourceDumpSha256: "a".repeat(64), checkpointDumpSha256: "a".repeat(64), receiptSha256: "a".repeat(64) },
  targetEvidence: { projectUuid: TARGET.projectUuid, branchUuid: SEALED.branchUuid, documentUuid: TARGET.documentUuid,
    docType: "PCB", sourceSha256: "a".repeat(64), checkpointSha256: "a".repeat(64), documentSemanticSha256: "d".repeat(64),
    historySemanticSha256: "e".repeat(64), headHistoryUuid: "f".repeat(32) } };
const OPEN: Awaited<ReturnType<CurrentPcbDiagnosticLifecycleOwner["openProject"]>> = {
  schema: "easyeda-pro-control.pcb-diagnostic-opening.v1", phase: "open-project", projectUuid: TARGET.projectUuid,
  branchUuid: SEALED.branchUuid, documentUuid: TARGET.documentUuid, ok: true, status: "opened-prefix-observed", failure: null,
  dispatchAttempted: true, publicResult: true, prefixObserved: true, nativeWorkMayRemain: true,
  observation: { projectPresent: true, branchUuid: SEALED.branchUuid, windowTabId: "fixture-tab", containerCount: 1,
    tabIds: [], activeTabId: "tab_page1", initialTitle: "EasyEDA Pro - V3.2", expectedOpenedTitle: "EasyEDA Pro - V3.2", documentTitle: "EasyEDA Pro - V3.2" },
  startupQualified: false, restorationCompletionVerified: false, persistenceVerified: false, compilerOwnerVerified: false,
  queueCompletionVerified: false, executionAuthorized: false, nativeIntrinsicsVerified: false };
const PCB: Awaited<ReturnType<CurrentPcbDiagnosticLifecycleOwner["openPcb"]>> = {
  schema: "easyeda-pro-control.pcb-diagnostic-pcb-opening.v1", phase: "open-document", projectUuid: TARGET.projectUuid,
  branchUuid: SEALED.branchUuid, documentUuid: TARGET.documentUuid, tabId: TAB, ok: true, status: "opened", failure: null,
  dispatchAttempted: true, publicResult: TAB, nativeWorkMayRemain: true, frameObserved: false, windowTabId: "fixture-tab",
  frameSourceVerified: false, restorationCompletionVerified: false, startupQualified: false, persistenceVerified: false,
  queueCompletionVerified: false, executionAuthorized: false, nativeIntrinsicsVerified: false };
const OBSERVED = { ...PCB, phase: "observe" as const, status: "frame-observed" as const,
  dispatchAttempted: false, publicResult: null, nativeWorkMayRemain: false, frameObserved: true };

const QUERIES: readonly CurrentPcb209SpatialQuery[] = [{ kind: "point", xMil: 1, yMil: 2 }];
const launch = (operationId: string): Record<string, unknown> => ({ action: "launch", operationId, confirmValidationOnly: true,
  confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true });
function directory(id: string): string {
  const root = process.env["EASYEDA_CONTROL_DATA_DIR"]; assert.ok(root !== undefined && root.includes("easyeda-test-control-"));
  assert.match(id, /^pcb209-spatial-test-[a-z-]+$/u); return join(root, "pcb-diagnostic-lifecycle-v1", id);
}
const unavailable = (): Promise<never> => Promise.reject(new Error("unused synthetic native route"));
interface SpatialFixture {
  readonly calls: string[];
  readonly dependencies: CurrentPcbDiagnosticLifecycleDependencies;
  readonly lifecycle: CurrentPcbSpatialLifecycle;
  readonly options: CurrentPcbDiagnosticLifecycleOptions;
  readonly owner: CurrentPcbDiagnosticLifecycleOwner;
  readonly request: (action: string, extra?: Record<string, unknown>) => Promise<Record<string, unknown>>;
  readonly state: { bound: boolean; terminated: boolean; released: boolean; nativeLoss: boolean; publicationLoss: boolean; wrongTarget: boolean; decodeFailure: unknown };
}
function fixture(context: TestContext, id: string, large = false): SpatialFixture {
  // Refuse an omitted preload before constructing a lifecycle or registering cleanup.
  directory(id);
  const calls: string[] = [];
  const state = { bound: false, terminated: false, released: false, nativeLoss: false, publicationLoss: false, wrongTarget: false, decodeFailure: null as unknown };
  const binding = { helperInstance: "b".repeat(32), jobId: "c".repeat(32), rootPid: 123, rootCreated: "123456789012345" };
  const owner: CurrentPcbDiagnosticLifecycleOwner = {
    status: () => ({ profile: "pcb-spatial209", stringPrecreateConsumed: false, helperPid: 456, binding: state.bound ? binding : null,
      failure: null, busy: false, launchConsumed: state.bound, closeConsumed: calls.includes("close"), released: state.released, helperClosed: state.released,
      browserObservationConsumed: calls.includes("browser"), frameInspectionConsumed: calls.includes("frames"), scriptInspectionConsumed: calls.includes("script"),
      diagnosticFailure: null, diagnosticFailureObservation: null, projectOpeningConsumed: calls.includes("project"), projectOpeningResult: calls.includes("project") ? OPEN : null,
      modelObservationConsumed: false, pcbOpeningConsumed: calls.includes("pcb"), pcbOpeningResult: calls.includes("pcb") ? PCB : null,
      pcbObservationConsumed: calls.includes("source"), pcbFrameObservation: calls.includes("source") ? OBSERVED : null,
      pcbSourceQualified: calls.includes("source"), nativeLaunchError: null, nativeSendError: null, createProcessError: null,
      noProcessCleanupAvailable: false, cleanupOnly: false, frameWorkerVerified: false, executionAuthorized: false }),
    launch: async () => {
      const path = join(directory(id), "intent.json"), raw = await readFile(path, "utf8");
      assert.match(raw, /pcb209-spatial-launch-intent/u); calls.push("launch"); state.bound = true; return binding;
    },
    observeApplicationWindow: () => Promise.resolve("12345"),
    requestNormalClose: () => { calls.push("close"); return Promise.resolve(); },
    observeTermination: () => Promise.resolve(state.terminated),
    releaseClosed: () => { assert.equal(state.terminated, true); state.released = true; return Promise.resolve(); },
    releaseUnlaunched: () => { state.released = true; return Promise.resolve(); }, releaseNoProcess: unavailable,
    browserObservation: () => { calls.push("browser"); return Promise.resolve({ targets: [{ targetId: "target" }], executionAuthorized: false }); },
    inspectFrames: () => { calls.push("frames"); return Promise.resolve({ frames: [{ id: "frame" }], executionAuthorized: false }); },
    inspectScript: (_frame, profile) => { assert.equal(profile, CURRENT_PCB_209_OPENING_SCRIPTS.ui); calls.push("script"); return Promise.resolve({ sourceVerified: true, family: "ui", executionAuthorized: false }); },
    inspectWorkers: unavailable, inspectWorkerScript: unavailable, observeWorkerState: unavailable, observeModelState: unavailable,
    openProject: async (target, verify) => { assert.deepEqual(target, SEALED); await verify(); calls.push("project"); return structuredClone(OPEN); },
    openPcb: async (target, verify) => { assert.deepEqual(target, SEALED); await verify(); calls.push("pcb"); return structuredClone(PCB); },
    observePcbOpening: (target, profile) => { assert.deepEqual(target, SEALED); assert.equal(profile, CURRENT_PCB_209_OPENING_SCRIPTS.pcb); calls.push("source");
      return Promise.resolve({ family: "pcb", projectUuid: TARGET.projectUuid, documentUuid: TARGET.documentUuid,
        tabId: TAB, sourceVerified: true, domOwnerVerified: true, openingObservation: OBSERVED, executionAuthorized: false }); },
    observeSpatial209: async (target, input) => {
      assert.deepEqual(target, SEALED);
      const path = join(directory(id), "spatial209-intent.json"), raw = await readFile(path, "utf8");
      const parsed: unknown = JSON.parse(raw);
      const intent = diagnosticLifecycleRecordSchemas["spatial209-intent.json"].parse(parsed);
      assert.deepEqual(intent.queries, input); assert.equal(intent.acceptNativeScratchEffects, true); calls.push("spatial");
      if (state.nativeLoss) { throw new Error("synthetic lost native spatial reply"); }
      if (state.decodeFailure instanceof Error) { throw state.decodeFailure; }
      return intent.queries.map(query => currentPcb209SpatialResultSchema.parse({ schema: "easyeda-pro-control.pcb209-spatial-via-read.v1",
        documentUuid: state.wrongTarget ? "f".repeat(16) : TARGET.documentUuid, query, identities: [], sceneViaCount: 0,
        selectedPrimitiveIds: [], samples: 2, nativeOrderingPreserved: true, retainedSceneDescriptorsUnchanged: true, selectionUnchanged: true,
        allowedExistingStateEffect: "D0.code;vMe.boxCache;Jdt-local-bbox-scratch;BLe.JJ", scope: "standalone-via-ready-bbox-scene-no-region-border-crossings",
        nativeFunctionGraphVerified: false, nativeIntrinsicsVerified: false, sourceMembershipVerified: false, persistenceVerified: false }));
    },
    observeSpatialTrack209: async (target, input) => {
      assert.deepEqual(target, SEALED);
      const raw = await readFile(join(directory(id), "spatial209-intent.json"), "utf8");
      const intent = diagnosticLifecycleRecordSchemas["spatial209-intent.json"].parse(JSON.parse(raw) as unknown);
      assert.equal(intent.schema, "easyeda-pro-control.pcb209-spatial-line-via-observation-intent.v1");
      assert.deepEqual(intent.queries, input); calls.push("spatial-lines");
      return intent.queries.map(query => ({ schema: "easyeda-pro-control.pcb209-spatial-line-via-read.v1",
        documentUuid: TARGET.documentUuid, query, identities: large ? Array.from({ length: 256 }, (_, index) => ({ primitiveId: `${String(index)}-${"a".repeat(128)}`, family: "Line" })) : [{ primitiveId: "track", family: "Line" }],
        sceneViaCount: 0, sceneLineCount: large ? 256 : 1, selectedPrimitiveIds: [], samples: 2, nativeOrderingPreserved: true,
        retainedSceneDescriptorsUnchanged: true, selectionUnchanged: true,
        allowedExistingStateEffect: "D0.code;vMe.boxCache;Jdt-local-bbox-scratch;BLe.JJ", scope: "standalone-line-via-ready-bbox-scene-no-region-border-crossings",
        nativeFunctionGraphVerified: false, nativeIntrinsicsVerified: false, sourceMembershipVerified: false, persistenceVerified: false }));
    },
    observeSpatialArc209: async (target, input) => {
      assert.deepEqual(target, SEALED);
      const raw = await readFile(join(directory(id), "spatial209-intent.json"), "utf8");
      const intent = diagnosticLifecycleRecordSchemas["spatial209-intent.json"].parse(JSON.parse(raw) as unknown);
      assert.equal(intent.schema, "easyeda-pro-control.pcb209-spatial-arc-line-via-observation-intent.v1");
      assert.deepEqual(intent.queries, input); calls.push("spatial-arcs");
      return intent.queries.map(query => ({ schema: "easyeda-pro-control.pcb209-spatial-arc-line-via-read.v1",
        documentUuid: TARGET.documentUuid, query, identities: large ? Array.from({ length: 256 }, (_, index) => ({ primitiveId: `${String(index)}-${"a".repeat(128)}`, family: "Arc" })) : [{ primitiveId: "arc", family: "Arc" }],
        sceneViaCount: 0, sceneLineCount: 0, sceneArcCount: large ? 256 : 1, selectedPrimitiveIds: [], samples: 2, nativeOrderingPreserved: true,
        retainedSceneDescriptorsUnchanged: true, selectionUnchanged: true,
        allowedExistingStateEffect: "D0.code;vMe.boxCache;Jdt-local-bbox-scratch;BLe.JJ", scope: "standalone-arc-line-via-ready-bbox-scene-no-region-border-crossings",
        nativeFunctionGraphVerified: false, nativeIntrinsicsVerified: false, sourceMembershipVerified: false, persistenceVerified: false }));
    },
    observeSpatialPad209: async (target, input) => {
      assert.deepEqual(target, SEALED);
      const raw = await readFile(join(directory(id), "spatial209-intent.json"), "utf8");
      const intent = diagnosticLifecycleRecordSchemas["spatial209-intent.json"].parse(JSON.parse(raw) as unknown);
      assert.equal(intent.schema, "easyeda-pro-control.pcb209-spatial-pad-point-observation-intent.v1");
      assert.deepEqual(intent.queries, input); calls.push("spatial-pads");
      return intent.queries.map(query => ({ schema: "easyeda-pro-control.pcb209-spatial-pad-point-read.v1",
        documentUuid: TARGET.documentUuid, query, identities: [{ primitiveId: "arc", family: "Pad" }],
        scenePadCount: 1, selectedPrimitiveIds: [], samples: 2, nativeOrderingPreserved: true,
        retainedSceneDescriptorsUnchanged: true, selectionUnchanged: true,
        allowedExistingStateEffect: "D0.code;vMe.boxCache;Jdt-local-bbox-scratch;BLe.JJ", scope: "standalone-circular-pad-ready-point-scene",
        nativeFunctionGraphVerified: false, nativeIntrinsicsVerified: false, sourceMembershipVerified: false, persistenceVerified: false }));
    },
  };
  const options: CurrentPcbDiagnosticLifecycleOptions = { pluginRoot: "/mnt/c/Reviewed/Plugin", assetsRoot: "/mnt/c/Reviewed/EasyEDA/resources/app/assets",
    powershellSha256: "d".repeat(64), powershellBytes: 123, assertLocalAllowed: (): void => {
      // This explicit synthetic owner has no mutable facade collaborators.
    },
    assertAllowed: (): Promise<void> => Promise.resolve(), assertOtherLaunchesSettled: (): Promise<void> => Promise.resolve() };
  const dependencies: CurrentPcbDiagnosticLifecycleDependencies = {
    verifyInstallation: () => Promise.resolve({ ...createCurrentPcb209DiagnosticInstallationPlan(options), facadeSha256: "a".repeat(64) }),
    allocateOwner: () => { calls.push("allocate"); return Promise.resolve(owner); },
    prepareCheckpoint: target => { assert.deepEqual(target, TARGET); return Promise.resolve(CHECKPOINT); },
    verifyCheckpoint: (checkpoint, target) => { assert.equal(checkpoint, CHECKPOINT); assert.deepEqual(target, TARGET); return Promise.resolve(); },
    verifyHistoricalCheckpoint: () => Promise.resolve(),
    publishRecord: (operationId, name, record) => name === "spatial209-result.json" && state.publicationLoss
      ? Promise.reject(new Error("synthetic lost result publication")) : publishCurrentPcbDiagnosticLifecycleRecord(operationId, name, record),
  };
  const lifecycle = new CurrentPcbSpatialLifecycle(options, dependencies);
  const request = async (action: string, extra: Record<string, unknown> = {}): Promise<Record<string, unknown>> => {
    const current = await lifecycle.run({ action: "inspect", operationId: id });
    return lifecycle.run({ action, operationId: id, expectedBindingSha256: current["bindingSha256"], ...extra });
  };
  context.after(async () => {
    state.publicationLoss = false;
    const current = await lifecycle.run({ action: "inspect", operationId: id });
    if (typeof current["intentSha256"] === "string" && !state.released) {
      await lifecycle.run({ action: "settle-records", operationId: id, expectedIntentSha256: current["intentSha256"] });
    }
    if (state.bound && !state.released) { state.terminated = true; await request("observe-termination"); await request("release-closed"); }
    await rm(directory(id), { recursive: true, force: true });
  });
  return { calls, dependencies, lifecycle, options, owner, request, state };
}
async function ready(value: ReturnType<typeof fixture>, id: string): Promise<void> {
  await value.lifecycle.run(launch(id)); await value.request("browser-observation");
  await value.request("inspect-frames", { targetId: "target" }); await value.request("inspect-script", { frameId: "frame", family: "ui" });
  await value.request("open-project", { target: TARGET, confirmDisposableProject: true, acceptNormalOpenEffects: true });
  await value.request("open-pcb", { acceptNormalOpenEffects: true }); await value.request("observe-pcb-opening");
}
void test("the real journal retains failed inspector data privately and offers no observation replay", async context => {
  const id = "pcb209-spatial-test-private-failure", value = fixture(context, id);
  const runner = new CurrentPcbSpatialCaptureRunner({ assertCurrent(): void {
    // Stable synthetic inspector.
  },
    request: (command): Promise<unknown> => Promise.resolve(command.spatialPhase === "release" ? {} : { exceptionDetails: { text: "private-inspector-marker" } }),
  }, "original-script", "original-context", TARGET.documentUuid);
  try { await runner.observe(); } catch (error) { value.state.decodeFailure = error; }
  assert.ok(value.state.decodeFailure instanceof AggregateError);
  await ready(value, id);
  await assert.rejects(value.request("observe-spatial", { queries: QUERIES, acceptNativeScratchEffects: true }), /PCB_SPATIAL_CAPTURE/u);
  const path = join(directory(id), "spatial209-failure.json"), source = await readFile(path, "utf8");
  const record = diagnosticLifecycleRecordSchemas["spatial209-failure.json"].parse(JSON.parse(source) as unknown);
  assert.equal(record.observationAccepted, false); assert.equal(record.replayAllowed, false);
  assert.match(record.diagnostic.replyJson ?? "", /private-inspector-marker/u);
  const observed = await value.lifecycle.run({ action: "inspect", operationId: id }); assert.equal(JSON.stringify(observed).includes("private-inspector-marker"), false);
  assert.equal(JSON.stringify(observed).includes("spatial209-failure.json"), true);
  await assert.rejects(value.request("observe-spatial", { queries: QUERIES, acceptNativeScratchEffects: true }), /OBSERVATION_CONSUMED/u);
  assert.equal(value.calls.filter(call => call === "spatial").length, 1);
});
void test("mixed native batch retains a distinct immutable result and consumes the shared Via slot", async context => {
  const id = "pcb209-spatial-test-mixed", value = fixture(context, id);
  await ready(value, id);
  await value.request("observe-spatial-lines", { queries: QUERIES, acceptNativeScratchEffects: true });
  assert.equal(value.calls.filter(call => call === "spatial-lines").length, 1);
  assert.equal(value.calls.includes("spatial"), false);
  const raw = await readFile(join(directory(id), "spatial209-result.json"), "utf8");
  const result = diagnosticLifecycleRecordSchemas["spatial209-result.json"].parse(JSON.parse(raw) as unknown);
  assert.equal(result.schema, "easyeda-pro-control.pcb209-spatial-line-via-observation-result.v1");
  assert.equal(result.result.results[0]?.identities[0]?.family, "Line");
  await assert.rejects(value.request("observe-spatial", { queries: QUERIES, acceptNativeScratchEffects: true }), /OBSERVATION_CONSUMED/u);
  await assert.rejects(value.request("observe-spatial-lines", { queries: QUERIES, acceptNativeScratchEffects: true }), /OBSERVATION_CONSUMED/u);
});
void test("Arc native batch has its own immutable contract and consumes both earlier alternatives", async context => {
  const id = "pcb209-spatial-test-arcs", value = fixture(context, id);
  await ready(value, id);
  await value.request("observe-spatial-arcs", { queries: QUERIES, acceptNativeScratchEffects: true });
  assert.equal(value.calls.filter(call => call === "spatial-arcs").length, 1);
  const raw = await readFile(join(directory(id), "spatial209-result.json"), "utf8");
  const result = diagnosticLifecycleRecordSchemas["spatial209-result.json"].parse(JSON.parse(raw) as unknown);
  assert.equal(result.schema, "easyeda-pro-control.pcb209-spatial-arc-line-via-observation-result.v1");
  assert.equal(result.result.results[0]?.identities[0]?.family, "Arc");
  for (const action of ["observe-spatial", "observe-spatial-lines", "observe-spatial-arcs"]) {
    await assert.rejects(value.request(action, { queries: QUERIES, acceptNativeScratchEffects: true }), /OBSERVATION_CONSUMED/u);
  }
});
void test("Pad native batch has its own immutable contract and consumes both earlier alternatives", async context => {
  const id = "pcb209-spatial-test-pads", value = fixture(context, id);
  await ready(value, id);
  await value.request("observe-spatial-pads", { queries: QUERIES, acceptNativeScratchEffects: true });
  assert.equal(value.calls.filter(call => call === "spatial-pads").length, 1);
  const raw = await readFile(join(directory(id), "spatial209-result.json"), "utf8");
  const result = diagnosticLifecycleRecordSchemas["spatial209-result.json"].parse(JSON.parse(raw) as unknown);
  assert.equal(result.schema, "easyeda-pro-control.pcb209-spatial-pad-point-observation-result.v1");
  assert.equal(result.result.results[0]?.identities[0]?.family, "Pad");
  for (const action of ["observe-spatial", "observe-spatial-lines", "observe-spatial-arcs", "observe-spatial-pads"]) {
    await assert.rejects(value.request(action, { queries: QUERIES, acceptNativeScratchEffects: true }), /OBSERVATION_CONSUMED/u);
  }
});
void test("spatial grammar preserves purpose, query limits and explicit scratch-effect acceptance", async context => {
  const id = "pcb209-spatial-test-contract", value = fixture(context, id);
  const binding = "a".repeat(64);
  const input = { action: "observe-spatial", operationId: id, expectedBindingSha256: binding, queries: QUERIES, acceptNativeScratchEffects: true };
  const invalid: Record<string, unknown>[] = [{ ...input, acceptNativeScratchEffects: false }, { ...input, queries: [] },
    { ...input, queries: Array.from({ length: 17 }, () => QUERIES[0]) }, { ...input, queries: [{ kind: "point", xMil: -0, yMil: 0 }] }];
  for (const action of ["observe-model-state", "inspect-workers", "observe-layers", "perform-visual"]) { invalid.push({ ...input, action }); }
  for (const changed of invalid) {
    assert.equal(currentPcbSpatialRequestSchema.safeParse(changed).success, false); await assert.rejects(value.lifecycle.run(changed));
  }
  const legacy = new CurrentPcb209DiagnosticLifecycle(value.options, value.dependencies);
  await assert.rejects(legacy.run(launch(id))); assert.equal(value.calls.length, 0);
  assert.equal(queryCurrentPcbSpatial()["wrapperAction"], "spatial");
  assert.equal(validateCurrentPcbSpatialArguments(input)["executionAuthorized"], false);
  assert.equal(validateCurrentPcbSpatialArguments({ ...input, acceptNativeScratchEffects: false })["executionAuthorized"], false);
});
void test("spatial batches retain their larger aggregate bound without enlarging each native reply", () => {
  const row = { schema: "easyeda-pro-control.pcb209-spatial-via-read.v1", documentUuid: TARGET.documentUuid,
    query: { kind: "region", mode: "inside", leftMil: 0, rightMil: 10, bottomMil: 0, topMil: 10 },
    identities: Array.from({ length: 256 }, (_, index) => ({ primitiveId: `${String(index)}-${"a".repeat(128)}`, family: "Via" })),
    sceneViaCount: 256, selectedPrimitiveIds: [], samples: 2, nativeOrderingPreserved: true,
    retainedSceneDescriptorsUnchanged: true, selectionUnchanged: true,
    allowedExistingStateEffect: "D0.code;vMe.boxCache;Jdt-local-bbox-scratch;BLe.JJ", scope: "standalone-via-ready-bbox-scene-no-region-border-crossings",
    nativeFunctionGraphVerified: false, nativeIntrinsicsVerified: false, sourceMembershipVerified: false, persistenceVerified: false };
  const batch = currentPcbSpatialObservation(Array.from({ length: 16 }, () => row));
  assert.ok(Buffer.byteLength(JSON.stringify(batch)) > 131_072);
  const oversized = { ...row, identities: Array.from({ length: 256 }, (_, index) => ({ primitiveId: `${String(index)}-${"\u0001".repeat(240)}`, family: "Via" })) };
  assert.throws(() => currentPcbSpatialObservation([oversized]));
});
void test("historical broad-prefix journals retain their original generation without spatial authority", async context => {
  const id = "pcb209-spatial-test-legacy", value = fixture(context, id);
  await reserveCurrentPcbDiagnosticLifecycle(id);
  try {
    await publishCurrentPcbDiagnosticLifecycleRecord(id, "intent.json", {
      schema: "easyeda-pro-control.pcb-diagnostic-launch-intent.v1", operationId: id, createdAt: "2026-01-01T00:00:00Z",
      facadeSha256: "a".repeat(64), installationSha256: "b".repeat(64), confirmValidationOnly: true,
      confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true,
    });
    const legacy = new CurrentPcb209DiagnosticLifecycle(value.options, value.dependencies);
    const inspected = await legacy.run({ action: "inspect", operationId: id });
    assert.equal(inspected["operationId"], id);
    await assert.rejects(value.lifecycle.run({ action: "inspect", operationId: id }), /GENERATION_MISMATCH/u);
    assert.equal(value.calls.length, 0);
  } finally { await rm(directory(id), { recursive: true, force: true }); }
});
void test("one original spatial batch journals before dispatch, binds queries and closes through common cleanup", async context => {
  const id = "pcb209-spatial-test-success", value = fixture(context, id); await ready(value, id);
  const result = await value.request("observe-spatial", { queries: QUERIES, acceptNativeScratchEffects: true });
  assert.equal(result["stage"], "spatial209"); assert.equal(value.calls.filter(call => call === "spatial").length, 1);
  await assert.rejects(value.request("observe-spatial", { queries: QUERIES, acceptNativeScratchEffects: true }), /OBSERVATION_CONSUMED/u);
  const operations = await readCurrentPcbDiagnosticLifecycles();
  const journal = operations.find(operation => operation.operationId === id);
  assert.deepEqual(journal?.records["spatial209-result.json"]?.result.results.map(row => row.query), QUERIES);
  await value.request("normal-close", { hwnd: "12345", confirmNormalClose: true }); value.state.terminated = true;
  await value.request("observe-termination"); await value.request("release-closed"); assert.equal(value.state.released, true);
});
void test("lost native acknowledgment remains consumed and cannot replay the spatial batch", async context => {
  const id = "pcb209-spatial-test-native-loss", value = fixture(context, id); await ready(value, id); value.state.nativeLoss = true;
  await assert.rejects(value.request("observe-spatial", { queries: QUERIES, acceptNativeScratchEffects: true }), /lost native spatial reply/u);
  await assert.rejects(value.request("observe-spatial", { queries: QUERIES, acceptNativeScratchEffects: true }), /OBSERVATION_CONSUMED/u);
  assert.equal(value.calls.filter(call => call === "spatial").length, 1);
});
void test("lost result publication settles retained bytes without another native batch", async context => {
  const id = "pcb209-spatial-test-publication-loss", value = fixture(context, id); await ready(value, id); value.state.publicationLoss = true;
  await assert.rejects(value.request("observe-spatial", { queries: QUERIES, acceptNativeScratchEffects: true }), /lost result publication/u);
  value.state.publicationLoss = false;
  const inspected = await value.lifecycle.run({ action: "inspect", operationId: id });
  await value.lifecycle.run({ action: "settle-records", operationId: id, expectedIntentSha256: inspected["intentSha256"] });
  await assert.rejects(value.request("observe-spatial", { queries: QUERIES, acceptNativeScratchEffects: true }), /OBSERVATION_CONSUMED/u);
  assert.equal(value.calls.filter(call => call === "spatial").length, 1);
  const operations = await readCurrentPcbDiagnosticLifecycles();
  assert.ok(operations.find(operation => operation.operationId === id)?.records["spatial209-result.json"] !== undefined);
});
void test("historical query substitution fails even after its local intent digest is recomputed", async context => {
  const id = "pcb209-spatial-test-history", value = fixture(context, id); await ready(value, id);
  await value.request("observe-spatial", { queries: QUERIES, acceptNativeScratchEffects: true });
  const intentPath = join(directory(id), "spatial209-intent.json"), resultPath = join(directory(id), "spatial209-result.json");
  const originalIntent = await readFile(intentPath), originalResult = await readFile(resultPath);
  try {
    const intent = diagnosticLifecycleRecordSchemas["spatial209-intent.json"].parse(JSON.parse(originalIntent.toString()) as unknown);
    intent.queries = [{ kind: "point", xMil: 9, yMil: 8 }];
    const result = diagnosticLifecycleRecordSchemas["spatial209-result.json"].parse(JSON.parse(originalResult.toString()) as unknown); result.intentSha256 = sha256Json(intent);
    await writeFile(intentPath, JSON.stringify(intent)); await writeFile(resultPath, JSON.stringify(result));
    await assert.rejects(readCurrentPcbDiagnosticLifecycles(), /SPATIAL_OBSERVATION_BINDING/u);
  } finally { await writeFile(intentPath, originalIntent); await writeFile(resultPath, originalResult); }
  const browserPath = join(directory(id), "browser-intent.json"), foreignPath = join(directory(id), "workers-intent.json");
  const raw = await readFile(browserPath, "utf8");
  const browser = diagnosticLifecycleRecordSchemas["browser-intent.json"].parse(JSON.parse(raw) as unknown);
  try {
    await writeFile(foreignPath, JSON.stringify({ ...browser, stage: "workers" }), { mode: 0o600 });
    await assert.rejects(readCurrentPcbDiagnosticLifecycles(), /SPATIAL_STAGE_PURPOSE/u);
  } finally { await rm(foreignPath); }
});
void test("a changed original spatial method or a wrong result target cannot publish a successful observation", async context => {
  for (const mode of ["method", "target"] as const) {
    await context.test(mode, async child => {
      const id = `pcb209-spatial-test-drift-${mode}`, value = fixture(child, id); await ready(value, id);
      const original = value.owner.observeSpatial209;
      assert.ok(original !== undefined);
      if (mode === "method") { value.owner.observeSpatial209 = unavailable; } else { value.state.wrongTarget = true; }
      try {
        await assert.rejects(value.request("observe-spatial", { queries: QUERIES, acceptNativeScratchEffects: true }), /OWNER_PURPOSE_CHANGED|SPATIAL_OBSERVATION_BINDING/u);
      } finally { if (mode === "method") { value.owner.observeSpatial209 = original; } }
    });
  }
});

void test("large Line and Arc observations remain inspectable after their original publication", async context => {
  for (const family of ["lines", "arcs"]) {
    const id = `pcb209-spatial-test-large-${family}`, value = fixture(context, id, true);
    await ready(value, id);
    const queries = Array.from({ length: 6 }, () => ({ kind: "region", mode: "inside", leftMil: 0, rightMil: 10, bottomMil: 0, topMil: 10 }));
    const observed = await value.request(`observe-spatial-${family}`, { queries, acceptNativeScratchEffects: true });
    const summary = observed["result"]; assert.ok(summary !== null && typeof summary === "object");
    assert.equal(Reflect.get(summary, "schema"), "easyeda-pro-control.pcb209-spatial-summary.v1");
    assert.equal(Reflect.get(summary, "summaryOnly"), true);
    const inspected = await value.lifecycle.run({ action: "inspect", operationId: id, observation: "spatial209" });
    assert.ok(JSON.stringify(inspected).includes('"summaryOnly":true'));
    assert.equal(value.calls.filter(call => call === `spatial-${family}`).length, 1);
    value.state.terminated = true; await value.request("observe-termination"); await value.request("release-closed");
  }
});
