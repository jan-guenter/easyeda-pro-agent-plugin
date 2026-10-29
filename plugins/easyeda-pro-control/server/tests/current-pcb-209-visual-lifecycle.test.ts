/** Actual public lifecycle/journal with explicit synthetic native owner and
 * checkpoint. No application, browser, gateway or user design is connected. */
/* oxlint-disable import/max-dependencies -- Check the mounted lifecycle, exact decoded packet, durable journal and checkpoint ownership together. */
import assert from "node:assert/strict";
import { readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import type { TestContext } from "node:test";
import { isRecord, sha256Text } from "../src/core.ts";
import { CurrentPcb209DiagnosticLifecycle, CurrentPcb209VisualLifecycle } from "../src/current-pcb-diagnostic-lifecycle.ts";
import type { CurrentPcbDiagnosticLifecycleDependencies, CurrentPcbDiagnosticLifecycleOptions,
  CurrentPcbDiagnosticLifecycleOwner } from "../src/current-pcb-diagnostic-lifecycle.ts";
import { createCurrentPcb209DiagnosticInstallationPlan } from "../src/current-pcb-diagnostic-installation.ts";
import { diagnosticLifecycleRecordSchemas, publishCurrentPcbDiagnosticLifecycleRecord,
  readCurrentPcbDiagnosticLifecycles } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";
import { CURRENT_PCB_209_OPENING_SCRIPTS } from "../src/current-pcb-209-opening-profile.ts";
import { decodeCurrentPcb209VisualReply } from "../src/current-pcb-209-visual-actions.ts";
import type { CurrentPcb209VisualOperation } from "../src/current-pcb-209-visual-actions.ts";
import { currentPcb209VisualRequestSchema } from "../src/current-pcb-209-visual-validation.ts";
import { currentWindowCaptureReadiness } from "../src/current-pcb-diagnostic-window-capture-readiness.ts";
import { windowRestorePacket } from "./helpers/window-restore-packet.ts";
import { windowResizePacket } from "./helpers/window-resize-packet.ts";
import { windowCapturePacket } from "./helpers/window-capture-png.ts";
import { queryOfflineApi } from "../src/offline-api.ts";

const PATH = String.raw`C:\Fixtures\Visual.eprj2`;
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
const launch = (operationId: string): Record<string, unknown> => ({ action: "launch", operationId, confirmValidationOnly: true,
  confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true, acceptVisualStateChanges: true });
function directory(id: string): string {
  const root = process.env["EASYEDA_CONTROL_DATA_DIR"]; assert.ok(root !== undefined && root.includes("easyeda-test-control-"));
  assert.match(id, /^pcb209-visual-test-[a-z-]+$/u); return join(root, "pcb-diagnostic-lifecycle-v1", id);
}
const unavailable = (): Promise<never> => Promise.reject(new Error("unused synthetic native route"));
function fixture(context: TestContext, id: string): Readonly<{
  lifecycle: CurrentPcb209VisualLifecycle; options: CurrentPcbDiagnosticLifecycleOptions;
  dependencies: CurrentPcbDiagnosticLifecycleDependencies; calls: string[];
  state: { bound: boolean; released: boolean; terminated: boolean; publicationLoss: boolean; throwVisual: boolean; wrongTarget: boolean;
    maximized: boolean; restoreCalls: number; restoreReadinessObserved: boolean; resizeCalls: number; resizeReadinessObserved: boolean; readinessCalls: number; captureCalls: number; throwCapture: boolean; methodCalls: number; abortCalls: number; abortPublicationLoss: boolean; lostAbort: boolean };
  request: (action: string, extra?: Record<string, unknown>) => Promise<Record<string, unknown>>;
}> {
  const calls: string[] = [], state = { bound: false, released: false, terminated: false, publicationLoss: false, throwVisual: false,
    wrongTarget: false, maximized: false, restoreCalls: 0, restoreReadinessObserved: false, resizeCalls: 0, resizeReadinessObserved: false, readinessCalls: 0, captureCalls: 0, throwCapture: false, methodCalls: 0, abortCalls: 0, abortPublicationLoss: false, lostAbort: false };
  const valueReadinessCalls = (): void => { state.readinessCalls += 1; };
  const binding = { helperInstance: "b".repeat(32), jobId: "c".repeat(32), rootPid: 123, rootCreated: "123456789012345" };
  const owner: CurrentPcbDiagnosticLifecycleOwner = {
    status: () => ({ windowRestore209AttemptConsumed: state.restoreCalls > 0, windowRestore209ReadinessObserved: state.restoreReadinessObserved,
      windowRestore209RequestCapacity: state.restoreCalls === 0 && state.resizeCalls === 0 && state.captureCalls === 0 && state.readinessCalls <= 6,
      windowResize209AttemptConsumed: state.resizeCalls > 0, windowResize209ReadinessObserved: state.resizeReadinessObserved,
      windowResize209RequestCapacity: state.resizeCalls === 0 && state.captureCalls === 0 && state.readinessCalls < 8 && (state.restoreCalls === 0 || state.restoreReadinessObserved), profile: "visual209", stringPrecreateConsumed: false, helperPid: 456, binding: state.bound ? binding : null,
      failure: null, busy: false, launchConsumed: state.bound, closeConsumed: calls.includes("close"), released: state.released, helperClosed: state.released,
      browserObservationConsumed: calls.includes("browser"), frameInspectionConsumed: calls.includes("frames"), scriptInspectionConsumed: calls.includes("script"),
      diagnosticFailure: null, diagnosticFailureObservation: null, projectOpeningConsumed: calls.includes("project"), projectOpeningResult: calls.includes("project") ? OPEN : null,
      modelObservationConsumed: false, pcbOpeningConsumed: calls.includes("pcb"), pcbOpeningResult: calls.includes("pcb") ? PCB : null,
      pcbObservationConsumed: calls.includes("source"), pcbFrameObservation: calls.includes("source") ? OBSERVED : null,
      pcbSourceQualified: calls.includes("source"), nativeLaunchError: null, nativeSendError: null, createProcessError: null,
      noProcessCleanupAvailable: false, cleanupOnly: false, frameWorkerVerified: false, executionAuthorized: false }),
    launch: async () => {
      calls.push("launch"); const intentPath = join(directory(id), "intent.json");
      assert.match(await readFile(intentPath, "utf8"), /pcb209-visual-launch-intent/u); state.bound = true; return binding;
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
    observeSelectionRelations209: unavailable,
    terminateVisualJob: async (confirmed) => {
      assert.equal(confirmed, true); state.abortCalls += 1;
      const intentPath = join(directory(id), "visual-abort-intent.json");
      assert.match(await readFile(intentPath, "utf8"), /confirmAbortOriginalVisualJob/u);
      if (state.lostAbort) { throw new Error("synthetic lost original visual abort acknowledgment"); }
    },
    openProject: async (target, verify) => { assert.deepEqual(target, SEALED); await verify(); calls.push("project"); return structuredClone(OPEN); },
    openPcb: async (target, verify) => { assert.deepEqual(target, SEALED); await verify(); calls.push("pcb"); return structuredClone(PCB); },
    observePcbOpening: (target, profile) => { assert.deepEqual(target, SEALED); assert.equal(profile, CURRENT_PCB_209_OPENING_SCRIPTS.pcb); calls.push("source");
      return Promise.resolve({ family: "pcb", projectUuid: TARGET.projectUuid, documentUuid: TARGET.documentUuid,
        tabId: TAB, sourceVerified: true, domOwnerVerified: true, openingObservation: OBSERVED, executionAuthorized: false }); },
    observeWindowCaptureReadiness209: () => {
      valueReadinessCalls(); if (state.restoreCalls > 0 && !state.maximized) { state.restoreReadinessObserved = true; }
      if (state.resizeCalls > 0) { state.resizeReadinessObserved = true; }
      return Promise.resolve(currentWindowCaptureReadiness({ hwnd: "12345", bounds: { left: 0, top: 0, right: state.restoreCalls > 0 && state.resizeCalls === 0 ? 3840 : 1920, bottom: state.restoreCalls > 0 && state.resizeCalls === 0 ? 2160 : 1080 },
        queriesUsed: state.readinessCalls, restoreAttempted: state.restoreCalls > 0, restoreRequestSubmitted: state.restoreCalls > 0, restoreStateObserved: state.restoreReadinessObserved, maximized: state.maximized, resizeAttempted: state.resizeCalls > 0,
        resizeRequestSubmitted: state.resizeCalls > 0, resizeGeometryObserved: state.resizeReadinessObserved, captureAttempted: state.captureCalls > 0, paintDispatched: state.captureCalls > 0, nativeResourcesRetained: state.captureCalls > 0 },
        { helperStdoutBytes: 1024, cdpRequests: 60, readerAvailable: true, sourceQualified: calls.includes("source"),
          captureConsumed: state.captureCalls > 0, restoreConsumed: state.restoreCalls > 0, queriesUsed: state.readinessCalls }));
    },
    restoreWindowForCapture209: async (target) => {
      state.restoreCalls += 1; assert.deepEqual(target, SEALED); assert.equal(state.maximized, true); state.restoreReadinessObserved = false;
      const intentFile = join(directory(id), "window-restore209-intent.json");
      assert.match(await readFile(intentFile, "utf8"), /acceptWindowRestoreEffects/u); state.maximized = false; return windowRestorePacket();
    },
    resizeWindowForCapture209: async (target) => {
      state.resizeCalls += 1; assert.deepEqual(target, SEALED); state.resizeReadinessObserved = false;
      const intentFile = join(directory(id), "window-resize209-intent.json");
      assert.match(await readFile(intentFile, "utf8"), /acceptWindowResizeEffects/u); return windowResizePacket();
    },
    captureWindow209: async (target, hwnd) => {
      state.captureCalls += 1; assert.deepEqual(target, SEALED); assert.equal(hwnd, "12345");
      const intentFile = join(directory(id), "window-capture209-intent.json");
      assert.match(await readFile(intentFile, "utf8"), /acceptWindowPaintEffects/u);
      if (state.throwCapture) { throw new Error("synthetic paint failed after possible dispatch"); }
      return windowCapturePacket();
    },
    performVisual209: async (target, operation) => {
      state.methodCalls += 1; assert.deepEqual(target, SEALED);
      const raw = await readFile(join(directory(id), "visual-viewport209-intent.json"), "utf8");
      assert.match(raw, /confirmVisualStateChanges/u); assert.match(raw, /visualOperation/u);
      if (state.throwVisual) { throw new Error("synthetic native visual acknowledgment lost"); }
      const value = { ok: true, kind: "pcb209-original-visual-action", target: { projectUuid: target.projectUuid,
        branchUuid: target.branchUuid, documentUuid: target.documentUuid, tabId: TAB }, operation, stage: "viewport-acknowledged",
        previousSelection: operation.kind === "fit-selected" ? operation.expectedSelection : [],
        observedSelection: operation.kind === "fit-selected" ? operation.expectedSelection : [], viewportAttempted: true,
        viewportAcknowledged: true, nativeBounds: { minX: 1, maxX: 11, minY: 2, maxY: 22 } };
      const result = decodeCurrentPcb209VisualReply({ result: { type: "string", value: JSON.stringify(value) } }, target, operation);
      return state.wrongTarget ? { ...result, target: { ...value.target, documentUuid: "f".repeat(16) } } : result;
    },
  };
  const options: CurrentPcbDiagnosticLifecycleOptions = { pluginRoot: "/mnt/c/Reviewed/Plugin", assetsRoot: "/mnt/c/Reviewed/EasyEDA/resources/app/assets",
    powershellSha256: "d".repeat(64), powershellBytes: 123, assertLocalAllowed: (): void => {
      // No mutable facade collaborators in this explicit synthetic owner.
    },
    assertAllowed: (): Promise<void> => Promise.resolve(), assertOtherLaunchesSettled: (): Promise<void> => Promise.resolve() };
  const dependencies: CurrentPcbDiagnosticLifecycleDependencies = {
    verifyInstallation: () => Promise.resolve({ ...createCurrentPcb209DiagnosticInstallationPlan(options), facadeSha256: "a".repeat(64) }),
    allocateOwner: () => { calls.push("allocate"); return Promise.resolve(owner); },
    prepareCheckpoint: (target) => { assert.deepEqual(target, TARGET); return Promise.resolve(CHECKPOINT); },
    verifyCheckpoint: (checkpoint, target) => { assert.equal(checkpoint, CHECKPOINT); assert.deepEqual(target, TARGET); return Promise.resolve(); },
    verifyHistoricalCheckpoint: () => Promise.resolve(),
    publishRecord: (operationId, name, record) => {
      if ((name === "visual-viewport209-result.json" || name === "window-capture209-result.json") && state.publicationLoss) { return Promise.reject(new Error("synthetic lost visual result publication")); }
      if (name === "visual-abort-intent.json" && state.abortPublicationLoss) { return Promise.reject(new Error("synthetic visual abort intent publication lost")); }
      return publishCurrentPcbDiagnosticLifecycleRecord(operationId, name, record);
    },
  };
  const lifecycle = new CurrentPcb209VisualLifecycle(options, dependencies);
  const request = async (action: string, extra: Record<string, unknown> = {}): Promise<Record<string, unknown>> => {
    const current = await lifecycle.run({ action: "inspect", operationId: id });
    return lifecycle.run({ action, operationId: id, expectedBindingSha256: current["bindingSha256"], ...extra });
  };
  context.after(async () => {
    state.publicationLoss = false; state.abortPublicationLoss = false;
    let current = await lifecycle.run({ action: "inspect", operationId: id });
    if (typeof current["intentSha256"] === "string") {
      await lifecycle.run({ action: "settle-records", operationId: id, expectedIntentSha256: current["intentSha256"] });
      current = await lifecycle.run({ action: "inspect", operationId: id });
    }
    if (typeof current["bindingSha256"] === "string" && !state.released) {
      state.terminated = true; await request("observe-termination"); await request("release-closed");
    } else if (typeof current["intentSha256"] === "string" && !state.released && !state.bound) {
      await lifecycle.run({ action: "cleanup-unlaunched", operationId: id, expectedIntentSha256: current["intentSha256"] });
    }
    await rm(directory(id), { recursive: true, force: true });
  });
  return { lifecycle, options, dependencies, calls, state, request };
}
async function ready(value: ReturnType<typeof fixture>, id: string): Promise<void> {
  await value.lifecycle.run(launch(id)); await value.request("browser-observation");
  await value.request("inspect-frames", { targetId: "target" }); await value.request("inspect-script", { frameId: "frame", family: "ui" });
  await value.request("open-project", { target: TARGET, confirmDisposableProject: true, acceptNormalOpenEffects: true });
  await value.request("open-pcb", { acceptNormalOpenEffects: true }); await value.request("observe-pcb-opening");
}
function visualObservation(value: Record<string, unknown>): Record<string, unknown> {
  const observations = value["observations"]; assert.ok(Array.isArray(observations));
  const selected: unknown = observations.find((item: unknown) => isRecord(item) && item["stage"] === "visual-viewport209");
  assert.ok(isRecord(selected)); return selected;
}
void test("visual lifecycle requires launch effects and rejects selection writes or ordinary-purpose reuse", async context => {
  const id = "pcb209-visual-test-contract", value = fixture(context, id);
  await assert.rejects(value.lifecycle.run({ ...launch(id), acceptVisualStateChanges: false })); assert.equal(value.calls.length, 0);
  const ordinary = new CurrentPcb209DiagnosticLifecycle(value.options, value.dependencies);
  await assert.rejects(ordinary.run(launch(id))); assert.equal(value.calls.length, 0);
  for (const operation of [{ kind: "select", primitiveIds: ["a"] }, { kind: "clear-selection" }, { kind: "capture" }]) {
    const request = { action: "perform-visual", operationId: id, expectedBindingSha256: "a".repeat(64), operation, confirmVisualStateChanges: true };
    assert.equal(currentPcb209VisualRequestSchema.safeParse(request).success, false);
    const result = queryOfflineApi({ action: "pcb209-visual-validate", query: { request } });
    assert.ok(isRecord(result.result)); assert.equal(result.result["valid"], false);
  }
});
void test("successful visual lifecycle retains exact target, pre-dispatch intent and decoded camera result once", async context => {
  const id = "pcb209-visual-test-success", value = fixture(context, id); await ready(value, id);
  const operation: CurrentPcb209VisualOperation = { kind: "fit-selected", expectedSelection: ["component", "pad"] };
  const response = await value.request("perform-visual", { operation, confirmVisualStateChanges: true });
  assert.equal(value.state.methodCalls, 1); assert.equal(response["stage"], "visual-viewport209");
  const inspected = await value.lifecycle.run({ action: "inspect", operationId: id, observation: "visual-viewport209" });
  const observation = visualObservation(inspected); assert.equal(observation["published"], true); assert.equal(typeof observation["result"], "object");
  await assert.rejects(value.request("perform-visual", { operation, confirmVisualStateChanges: true }), /CONSUMED/u);
  assert.equal(value.state.methodCalls, 1);
});
void test("publication loss retains the actual visual result and consumed attempt without a second dispatch", async context => {
  const id = "pcb209-visual-test-publication", value = fixture(context, id); await ready(value, id); value.state.publicationLoss = true;
  const operation = { kind: "fit-all" };
  await assert.rejects(value.request("perform-visual", { operation, confirmVisualStateChanges: true }), /publication/u);
  assert.equal(value.state.methodCalls, 1);
  await assert.rejects(value.request("perform-visual", { operation, confirmVisualStateChanges: true })); assert.equal(value.state.methodCalls, 1);
  const inspected = await value.lifecycle.run({ action: "inspect", operationId: id, observation: "visual-viewport209" });
  const observation = visualObservation(inspected); assert.equal(observation["published"], false); assert.equal(typeof observation["result"], "object");
});
void test("lost native visual acknowledgment remains consumed and never grants a retry", async context => {
  const id = "pcb209-visual-test-native-failure", value = fixture(context, id); await ready(value, id); value.state.throwVisual = true;
  const request = { operation: { kind: "zoom-to", xMil: 1, yMil: 2, scaleRatio: 1 }, confirmVisualStateChanges: true };
  await assert.rejects(value.request("perform-visual", request), /acknowledgment/u);
  await assert.rejects(value.request("perform-visual", request), /CONSUMED/u); assert.equal(value.state.methodCalls, 1);
});

void test("foreign visual result target refuses publication while retaining the original consumed observation", async context => {
  const id = "pcb209-visual-test-target-drift", value = fixture(context, id); await ready(value, id); value.state.wrongTarget = true;
  const request = { operation: { kind: "fit-all" }, confirmVisualStateChanges: true };
  await assert.rejects(value.request("perform-visual", request), /RESULT_TARGET/u);
  await assert.rejects(value.request("perform-visual", request), /CONSUMED/u); assert.equal(value.state.methodCalls, 1);
  const inspected = await value.lifecycle.run({ action: "inspect", operationId: id, observation: "visual-viewport209" });
  const observation = visualObservation(inspected); assert.equal(observation["published"], false); assert.equal(observation["resultRetained"], true);
});

void test("historical visual journal independently rejects target, converted bounds, digest and authority drift", async context => {
  const id = "pcb209-visual-test-historical-drift", value = fixture(context, id); await ready(value, id);
  await value.request("perform-visual", { operation: { kind: "fit-all" }, confirmVisualStateChanges: true });
  const path = join(directory(id), "visual-viewport209-result.json"), raw = await readFile(path, "utf8");
  const original = diagnosticLifecycleRecordSchemas["visual-viewport209-result.json"].parse(JSON.parse(raw) as unknown);
  assert.ok(isRecord(original.result["target"]));
  for (const patch of [{ target: { ...original.result["target"], documentUuid: "f".repeat(16) } },
    { boundsMil: { left: 0, right: 110, bottom: 20, top: 220 } }, { resultSha256: "0".repeat(64) }, { executionAuthorized: true }]) {
    try {
      await writeFile(path, JSON.stringify({ ...original, result: { ...original.result, ...patch } }));
      await assert.rejects(readCurrentPcbDiagnosticLifecycles(), /VISUAL/u);
    } finally { await writeFile(path, raw); }
  }
  const operations = await readCurrentPcbDiagnosticLifecycles(); assert.equal(operations.some(operation => operation.operationId === id), true);
});

void test("original visual Job abort remains available after normal close and requests termination only once", async context => {
  const id = "pcb209-visual-test-abort-after-close", value = fixture(context, id); await ready(value, id);
  await value.request("normal-close", { hwnd: "12345", confirmNormalClose: true });
  const aborted = await value.request("abort-visual", { confirmAbortOriginalVisualJob: true });
  assert.equal(aborted["terminationDispatched"], true); assert.equal(aborted["terminationProved"], false); assert.equal(value.state.abortCalls, 1);
  await assert.rejects(value.request("abort-visual", { confirmAbortOriginalVisualJob: true }), /CONSUMED/u);
  await assert.rejects(value.request("observe-window")); assert.equal(value.state.abortCalls, 1);
});

void test("lost original visual abort acknowledgment blocks normal work without retrying termination", async context => {
  const id = "pcb209-visual-test-abort-ack", value = fixture(context, id); await ready(value, id); value.state.lostAbort = true;
  await assert.rejects(value.request("abort-visual", { confirmAbortOriginalVisualJob: true }), /acknowledgment/u);
  await assert.rejects(value.request("abort-visual", { confirmAbortOriginalVisualJob: true }), /CONSUMED/u);
  await assert.rejects(value.request("perform-visual", { operation: { kind: "fit-all" }, confirmVisualStateChanges: true }));
  assert.equal(value.state.abortCalls, 1); assert.equal(value.state.methodCalls, 0);
});

void test("visual abort intent publication loss consumes the attempt before any native termination", async context => {
  const id = "pcb209-visual-test-abort-intent", value = fixture(context, id); await ready(value, id); value.state.abortPublicationLoss = true;
  await assert.rejects(value.request("abort-visual", { confirmAbortOriginalVisualJob: true }), /publication lost/u);
  await assert.rejects(value.request("abort-visual", { confirmAbortOriginalVisualJob: true }), /CONSUMED/u);
  await assert.rejects(value.request("perform-visual", { operation: { kind: "fit-all" }, confirmVisualStateChanges: true }));
  assert.equal(value.state.abortCalls, 0); assert.equal(value.state.methodCalls, 0);
});

void test("window pixels publish one managed PNG after intent and settle lost metadata without recapture", async context => {
  const id = "pcb209-visual-test-window", value = fixture(context, id); await ready(value, id);
  value.state.publicationLoss = true;
  await assert.rejects(value.request("capture-window", { hwnd: "12345", acceptWindowPaintEffects: true, confirmLocalArtifact: true }), /synthetic lost/u);
  assert.equal(value.state.captureCalls, 1);
  const current = await value.lifecycle.run({ action: "inspect", operationId: id }); value.state.publicationLoss = false;
  await value.lifecycle.run({ action: "settle-records", operationId: id, expectedIntentSha256: current["intentSha256"] });
  const journals = await readCurrentPcbDiagnosticLifecycles(); const result = journals.find(item => item.operationId === id)?.records["window-capture209-result.json"]?.result;
  assert.ok(isRecord(result)); assert.equal(result["canvasOnly"], false); assert.equal(result["renderCompletionVerified"], false);
  assert.equal(result["nativeResourcesRetained"], true); assert.equal(Object.hasOwn(result, "pngBase64"), false);
  const image = result["image"]; assert.ok(isRecord(image)); assert.equal(typeof image["path"], "string");
  assert.ok(typeof image["path"] === "string"); const png = await readFile(image["path"]); assert.equal(png.length, image["bytes"]);
  await assert.rejects(value.request("capture-window", { hwnd: "12345", acceptWindowPaintEffects: true, confirmLocalArtifact: true }), /CONSUMED/u);
  assert.equal(value.state.captureCalls, 1);
});
void test("window capture refusal consumes its own paint attempt without granting a second native call", async context => {
  const id = "pcb209-visual-test-window-failure", value = fixture(context, id); await ready(value, id);
  await assert.rejects(value.request("capture-window", { hwnd: "12345", acceptWindowPaintEffects: false, confirmLocalArtifact: true }));
  assert.equal(value.state.captureCalls, 0); value.state.throwCapture = true;
  await assert.rejects(value.request("capture-window", { hwnd: "12345", acceptWindowPaintEffects: true, confirmLocalArtifact: true }), /synthetic paint/u);
  await assert.rejects(value.request("capture-window", { hwnd: "12345", acceptWindowPaintEffects: true, confirmLocalArtifact: true }), /CONSUMED/u);
  assert.equal(value.state.captureCalls, 1);
});

void test("readiness observes original geometry/capacity without consuming or publishing capture", async context => {
  const id = "pcb209-visual-test-readiness", value = fixture(context, id); await ready(value, id);
  const result = await value.request("observe-capture-readiness"); assert.ok(isRecord(result["readiness"]));
  assert.equal(result["readiness"]["capacityAvailable"], true); assert.equal(result["readiness"]["snapshotOnly"], true);
  assert.equal(result["readiness"]["paintIssued"], false); assert.equal(result["readiness"]["executionAuthorized"], false);
  const operations = await readCurrentPcbDiagnosticLifecycles(); const operation = operations.find(item => item.operationId === id);
  assert.equal(operation?.records["window-capture209-intent.json"], undefined); assert.equal(value.state.captureCalls, 0);
  await value.request("capture-window", { hwnd: "12345", acceptWindowPaintEffects: true, confirmLocalArtifact: true });
  assert.equal(value.state.captureCalls, 1); assert.equal(value.state.readinessCalls, 1);
});

void test("fixed resize consumes intent once and requires a new geometry observation before any capture intent", async context => {
  const id = "pcb209-visual-test-resize", value = fixture(context, id); await ready(value, id);
  await assert.rejects(value.request("resize-window-for-capture", { acceptWindowResizeEffects: false })); assert.equal(value.state.resizeCalls, 0);
  const resized = await value.request("resize-window-for-capture", { acceptWindowResizeEffects: true }); assert.ok(isRecord(resized["result"]));
  assert.equal(resized["result"]["requestSubmitted"], true); assert.equal(resized["result"]["geometryVerified"], false);
  await assert.rejects(value.request("capture-window", { hwnd: "12345", acceptWindowPaintEffects: true, confirmLocalArtifact: true }), /READINESS_REQUIRED/u);
  const operations = await readCurrentPcbDiagnosticLifecycles(); const current = operations.find(item => item.operationId === id);
  assert.equal(current?.records["window-capture209-intent.json"], undefined); assert.equal(value.state.captureCalls, 0);
  const readiness = await value.request("observe-capture-readiness"); assert.ok(isRecord(readiness["readiness"]));
  assert.equal(readiness["readiness"]["resizeGeometryObserved"], true);
  await value.request("capture-window", { hwnd: "12345", acceptWindowPaintEffects: true, confirmLocalArtifact: true });
  await assert.rejects(value.request("resize-window-for-capture", { acceptWindowResizeEffects: true }), /CONSUMED/u);
  assert.equal(value.state.resizeCalls, 1); assert.equal(value.state.captureCalls, 1);
});

void test("restore submission needs later normal-state readiness before fixed resize and capture", async context => {
  const id = "pcb209-visual-test-restore", value = fixture(context, id); await ready(value, id); value.state.maximized = true;
  await assert.rejects(value.request("restore-window-for-capture", { acceptWindowRestoreEffects: false })); assert.equal(value.state.restoreCalls, 0);
  const restored = await value.request("restore-window-for-capture", { acceptWindowRestoreEffects: true }); assert.ok(isRecord(restored["result"]));
  assert.equal(restored["result"]["requestSubmitted"], true); assert.equal(restored["result"]["restoreCompletionVerified"], false);
  assert.equal(restored["result"]["positionMayChange"], true);
  await assert.rejects(value.request("resize-window-for-capture", { acceptWindowResizeEffects: true }), /RESTORE209_.*READINESS_REQUIRED/u);
  await assert.rejects(value.request("capture-window", { hwnd: "12345", acceptWindowPaintEffects: true, confirmLocalArtifact: true }), /RESTORE209_.*READINESS_REQUIRED/u);
  const operations = await readCurrentPcbDiagnosticLifecycles(); const current = operations.find(item => item.operationId === id);
  assert.equal(current?.records["window-resize209-intent.json"], undefined); assert.equal(current?.records["window-capture209-intent.json"], undefined);
  const readiness = await value.request("observe-capture-readiness"); assert.ok(isRecord(readiness["readiness"]));
  assert.equal(readiness["readiness"]["restoreStateObserved"], true);
  await value.request("resize-window-for-capture", { acceptWindowResizeEffects: true }); await value.request("observe-capture-readiness");
  await value.request("capture-window", { hwnd: "12345", acceptWindowPaintEffects: true, confirmLocalArtifact: true });
  await assert.rejects(value.request("restore-window-for-capture", { acceptWindowRestoreEffects: true }), /CONSUMED/u);
  assert.equal(value.state.restoreCalls, 1); assert.equal(value.state.resizeCalls, 1); assert.equal(value.state.captureCalls, 1);
});
