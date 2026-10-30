/* oxlint-disable import/max-dependencies -- Compose the real managed lifecycle, journal, native-owner callback types and independently qualified source/schema contracts in these synthetic ordering regressions. */
/** Real managed journal/core with an injected synthetic native owner. These
 * cases prove ordering and consumed cleanup, not inspector or CAD execution. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { controlDataDirectory } from "../src/artifacts.ts";
import { CurrentFootprintCombinedLifecycle } from "../src/current-pcb-diagnostic-lifecycle.ts";
import type { CurrentPcbDiagnosticLifecycleOptions, CurrentPcbDiagnosticLifecycleOwner } from "../src/current-pcb-diagnostic-lifecycle.ts";
import { createCurrentPcb209DiagnosticInstallationPlan } from "../src/current-pcb-diagnostic-installation.ts";
import type { CurrentPcbDiagnosticInstallation } from "../src/current-pcb-diagnostic-installation.ts";
import type { CurrentFootprintCombinedNativeOwner } from "../src/current-pcb-diagnostic-owner.ts";
import { currentFootprintCopyMainBackendObservationSchema } from "../src/current-footprint-copy-main-backend-runner.ts";
import { sha256Text } from "../src/core.ts";
import { CURRENT_PCB_209_OPENING_SCRIPTS } from "../src/current-pcb-209-opening-profile.ts";
import { currentFootprintSavedCacheObservationSchema } from "../src/current-footprint-saved-cache-runner.ts";
import { currentFootprintSavedCacheAccessorObservationSchema } from "../src/current-footprint-saved-cache-accessor-runner.ts";
import { currentFootprintCombinedNativeStateSchema, currentFootprintCombinedValidationRequestSchema } from "../src/current-footprint-combined-validation.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE } from "../src/current-footprint-copy-main-backend-source.ts";
import { assertNoUnresolvedCurrentPcbDiagnosticLaunches, publishCurrentPcbDiagnosticLifecycleRecord } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";

const syntheticEngine = { protocolVersion: "synthetic", product: "synthetic", revision: "synthetic", userAgent: "synthetic", jsVersion: "synthetic" };
const unavailable = (): Promise<never> => Promise.reject(new Error("Unexpected synthetic native operation"));
type MainOwner = CurrentPcbDiagnosticLifecycleOwner & Pick<CurrentFootprintCombinedNativeOwner,
  "observeFootprintMainConstruction" | "retainedFootprintMainConstruction" | "abortFootprintCombined" | "reserveFootprintCombinedAbort" | "dispatchFootprintCombinedAbort" | "handoffWorkerStartup" | "observeSavedCacheNative" | "observeSavedCacheAccessor">;
function fixture(operationId: string, options: { lostAbort?: boolean; suspendedMain?: boolean; lostResult?: boolean; suspendedPublication?: boolean; failedCacheProbe?: boolean; failedCacheIntent?: boolean } = {}): { lifecycle: CurrentFootprintCombinedLifecycle; calls: string[]; mainEntered: Promise<null>; publicationEntered: Promise<null>; releasePublication: () => void } {
  const calls: string[] = []; let bound = false, cacheIntentFailed = false, released = false, terminated = false;
  const mainContinue = Promise.withResolvers<null>();
  const mainEntered = Promise.withResolvers<null>();
  const publicationContinue = Promise.withResolvers<null>();
  const publicationEntered = Promise.withResolvers<null>();
  const routeMethods = {
    observeFootprintCopyUi: unavailable, requireFootprintCopyUi: unavailable, retainedFootprintCopyUi: (): null => null,
    observeFootprintCopyManagerRoute: unavailable, requireFootprintCopyManagerRoute: unavailable, retainedFootprintCopyManagerRoute: (): null => null,
    observeFootprintCopyWindowsClock: unavailable, joinFootprintCopyManagerPeer: unavailable,
    observeFootprintCopyClockRegistration: unavailable, sampleFootprintCopyClockRegistration: unavailable,
    retainedFootprintCopyClockRegistration: (): null => null, releaseFootprintCopyClockRegistration: unavailable,
    requireWorkerStartupEmptyDependency209: unavailable, prepareWorkerStartupPcbSession209: unavailable,
  };
  const abortReservation = Object.freeze({ profile: "private.current-footprint-combined-abort-reservation.v1" as const, executionAuthorized: false as const });
  const binding = { helperInstance: "b".repeat(32), jobId: "c".repeat(32), rootPid: 123, rootCreated: "123456789012345" };
  const path = (name: string): string => join(controlDataDirectory(), "pcb-diagnostic-lifecycle-v1", operationId, name);
  const owner: MainOwner = {
    status: () => ({ profile: "worker-startup-footprint-combined209", helperPid: 456, binding: bound ? binding : null, failure: null, busy: false,
      combinedAbortDispatchAttempted: terminated, combinedOutputCleanupOnly: false,
      launchConsumed: bound, closeConsumed: false, released, helperClosed: released, cleanupOnly: false, noProcessCleanupAvailable: false,
      frameWorkerVerified: false, executionAuthorized: false, nativeLaunchError: null, nativeSendError: null, createProcessError: null,
      browserObservationConsumed: false, frameInspectionConsumed: false, scriptInspectionConsumed: false, diagnosticFailure: null,
      diagnosticFailureObservation: null, projectOpeningConsumed: false, projectOpeningResult: null, modelObservationConsumed: false,
      pcbOpeningConsumed: false, pcbOpeningResult: null, pcbObservationConsumed: false, pcbFrameObservation: null,
      pcbSourceQualified: false, stringPrecreateConsumed: false }),
    launch: async () => { assert.match(await readFile(path("intent.json"), "utf8"), /"acceptDebuggerPauseEffects":true/u);
      calls.push("launch"); bound = true; return binding; },
    observeApplicationWindow: unavailable, requestNormalClose: unavailable, releaseUnlaunched: unavailable, releaseNoProcess: unavailable,
    browserObservation: () => Promise.resolve({ version: syntheticEngine, executionAuthorized: false }),
    inspectFrames: () => Promise.resolve({ syntheticFrames: true, executionAuthorized: false }),
    inspectScript: () => Promise.resolve({ family: "ui", sourceVerified: true, sourceSha256: CURRENT_PCB_209_OPENING_SCRIPTS.ui.scriptSha256,
      sourceBytes: CURRENT_PCB_209_OPENING_SCRIPTS.ui.scriptBytes, relativePath: CURRENT_PCB_209_OPENING_SCRIPTS.ui.relativePath, executionAuthorized: false }),
    inspectWorkers: unavailable,
    inspectWorkerScript: unavailable, observeWorkerState: unavailable, observeModelState: unavailable, openProject: unavailable,
    openPcb: unavailable, observePcbOpening: unavailable, handoffWorkerStartup: unavailable,
    observeFootprintMainConstruction: async () => {
      assert.match(await readFile(path("main-construction-intent.json"), "utf8"), /footprint-main-construction-intent/u); calls.push("observe"); mainEntered.resolve(null);
      if (options.suspendedMain === true) { await mainContinue.promise; }
      return currentFootprintCopyMainBackendObservationSchema.parse({ profile: "private.current-footprint-copy-main-backend-construction.v1",
        originalMainTransportRetained: true, runtimeAppSourceQualified: true, runtimeAppSourceSha256: CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE.sha256,
        initialContinuationCount: 1, registrationBreakpointArmedBeforeInitialContinuation: true, actualRegistrationLocationVerified: true,
        originalProtocolCallbackAndBackendRetained: true, originalDriverCallbackAndRouterRetained: true,
        originalActorClockAndSqlFunctionsRetained: true, originalNativeDateNowRetained: true, protocolRegistrationObserved: false,
        requestContextRetained: false, actualActorClockInvocationObserved: false, projectSqlInvocationObserved: false,
        responderExclusivityProven: false, executionAuthorized: false });
    },
    retainedFootprintMainConstruction: (): null => null,
    observeSavedCacheNative: async () => {
      assert.match(await readFile(path("saved-cache-native-intent.json"), "utf8"), /saved-cache-native-intent/u);
      calls.push("cache-probe"); if (options.failedCacheProbe === true) { throw new Error("synthetic consumed native metadata failure"); }
      return syntheticCacheObservation();
    },
    observeSavedCacheAccessor: async () => {
      assert.match(await readFile(path("saved-cache-accessor-intent.json"), "utf8"), /saved-cache-accessor-intent/u);
      calls.push("cache-probe"); if (options.failedCacheProbe === true) { throw new Error("synthetic consumed native metadata failure"); }
      return syntheticCacheAccessorObservation();
    },
    abortFootprintCombined: unavailable,
    reserveFootprintCombinedAbort: () => { calls.push("reserve-abort"); return abortReservation; },
    dispatchFootprintCombinedAbort: async (reservation, confirm) => {
      assert.equal(reservation, abortReservation); assert.equal(confirm, true);
      assert.match(await readFile(path("combined-abort-intent.json"), "utf8"), /confirmAbortOriginalCombinedJob/u);
      calls.push("abort"); terminated = true; mainContinue.resolve(null);
      if (options.lostAbort === true) { throw new Error("synthetic lost abort acknowledgment"); }
    },
    ...routeMethods,
    observeTermination: () => { calls.push("termination"); return Promise.resolve(terminated); },
    releaseClosed: async () => { assert.ok(terminated); assert.match(await readFile(path("release-intent.json"), "utf8"), /diagnostic-release-intent/u);
      calls.push("release"); released = true; },
  };
  const installationOptions: CurrentPcbDiagnosticLifecycleOptions = { pluginRoot: "/mnt/c/Reviewed/Plugin",
    assetsRoot: "/mnt/c/Reviewed/EasyEDA/resources/app/assets", powershellSha256: "d".repeat(64), powershellBytes: 123,
    assertAllowed: (): Promise<void> => Promise.resolve(), assertOtherLaunchesSettled: (): Promise<void> => Promise.resolve(), assertLocalAllowed: (): void => undefined };
  const lifecycle = new CurrentFootprintCombinedLifecycle(installationOptions, {
    verifyInstallation: (): Promise<CurrentPcbDiagnosticInstallation> => Promise.resolve({ ...createCurrentPcb209DiagnosticInstallationPlan(installationOptions), facadeSha256: "a".repeat(64) }),
    publishRecord: async (id, name, record): Promise<void> => {
      if ((name === "saved-cache-native-intent.json" || name === "saved-cache-accessor-intent.json") && options.failedCacheIntent === true && !cacheIntentFailed) { cacheIntentFailed = true; throw new Error("synthetic cache intent publication failure"); }
      if (name === "main-construction-result.json" && options.lostResult === true) { throw new Error("synthetic result publication failure"); }
      if (name === "main-construction-result.json" && options.suspendedPublication === true) {
        publicationEntered.resolve(null); await publicationContinue.promise;
      }
      await publishCurrentPcbDiagnosticLifecycleRecord(id, name, record);
    },
    allocateOwner: (): Promise<MainOwner> => { calls.push("allocate"); return Promise.resolve(owner); },
  });
  return { lifecycle, calls, mainEntered: mainEntered.promise, publicationEntered: publicationEntered.promise, releasePublication: (): void => { publicationContinue.resolve(null); } };
}


function syntheticCacheObservation(): ReturnType<typeof currentFootprintSavedCacheObservationSchema.parse> {
  const flags = { writable: true, configurable: true, enumerable: false };
  return currentFootprintSavedCacheObservationSchema.parse({ profile: "easyeda-pro-control.saved-cache-native-observation.v1", engine: syntheticEngine,
    descriptors: { globalConstructor: flags, constructorPrototype: flags, prototypeConstructor: flags, match: flags },
    arrayMetadata: { synthetic: true }, constructorMetadata: { synthetic: true }, matchMetadata: { synthetic: true },
    originalHandlesRechecked: true, cacheStorageGetterInvoked: false, matchInvoked: false, nativeMatchQualified: false, replayTokenIssued: false, executionAuthorized: false });
}
function syntheticCacheAccessorObservation(): ReturnType<typeof currentFootprintSavedCacheAccessorObservationSchema.parse> {
  const flags = { writable: true, configurable: true, enumerable: false };
  return currentFootprintSavedCacheAccessorObservationSchema.parse({ profile: "easyeda-pro-control.saved-cache-accessor-observation.v1", engine: syntheticEngine,
    descriptors: { globalConstructor: flags, constructorPrototype: flags, prototypeConstructor: flags, match: flags, globalAccessor: { enumerable: true, configurable: true, hasGetter: true, hasSetter: false } },
    arrayMetadata: { synthetic: true }, constructorMetadata: { synthetic: true }, matchMetadata: { synthetic: true }, getterMetadata: { synthetic: true },
    originalHandlesRechecked: true, cacheStorageGetterInvoked: false, matchInvoked: false, nativeGetterQualified: false, nativeMatchQualified: false, replayTokenIssued: false, executionAuthorized: false });
}
const launchRequest = (operationId: string): Record<string, unknown> => ({ action: "launch", operationId, confirmValidationOnly: true,
  confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true, acceptDebuggerPauseEffects: true });
const captureInput = { target: { rawWindowsPath: String.raw`C:\fixture.eprj2`, projectUuid: sha256Text(String.raw`C:\fixture.eprj2`),
  documentUuid: "d".repeat(16), expectedSourceSha256: "a".repeat(64) },
  confirmDisposableProject: true, acceptNormalOpenEffects: true, acceptDebuggerPauseEffects: true };

void test("combined strict namespace requires four launch confirmations and exposes no writer or purpose upgrade", () => {
  const launch = launchRequest("footprint-combined-schema");
  assert.equal(currentFootprintCombinedValidationRequestSchema.safeParse(launch).success, true);
  assert.equal(currentFootprintCombinedNativeStateSchema.safeParse({ combinedAbortDispatchAttempted: true, combinedOutputCleanupOnly: false }).success, true);
  for (const state of [{ combinedAbortDispatchAttempted: "true", combinedOutputCleanupOnly: false },
    { combinedAbortDispatchAttempted: false }, { combinedAbortDispatchAttempted: false, combinedOutputCleanupOnly: false, extra: true }]) {
    assert.equal(currentFootprintCombinedNativeStateSchema.safeParse(state).success, false);
  }
  for (const name of ["confirmValidationOnly", "confirmDiagnosticLaunch", "acceptExistingProfileEffects", "acceptDebuggerPauseEffects"]) {
    assert.equal(currentFootprintCombinedValidationRequestSchema.safeParse({ ...launch, [name]: false }).success, false);
    const missing = Object.fromEntries(Object.entries(launch).filter(([key]) => key !== name)); assert.equal(currentFootprintCombinedValidationRequestSchema.safeParse(missing).success, false);
  }
  for (const operationId of ["footprint-main-old", "footprint-route-old", "footprint-combined-schema\n"]) {
    assert.equal(currentFootprintCombinedValidationRequestSchema.safeParse({ ...launch, operationId }).success, false);
  }
  for (const action of ["execute", "save", "terminate-main", "observe-current-channel", "prepare-footprint-copy"]) {
    assert.equal(currentFootprintCombinedValidationRequestSchema.safeParse({ action, operationId: launch["operationId"], expectedBindingSha256: "a".repeat(64) }).success, false);
  }
  assert.equal(currentFootprintCombinedValidationRequestSchema.safeParse({ action: "abort-generation", operationId: launch["operationId"], expectedBindingSha256: "a".repeat(64), confirmAbortOriginalCombinedJob: false }).success, false);
});

for (const lostAbort of [false, true]) {
  void test(`combined main publication and once-only original abort, lost acknowledgment=${String(lostAbort)}`, async () => {
    const operationId = `footprint-combined-${lostAbort ? "lost" : "normal"}`; const f = fixture(operationId, { lostAbort });
    const launch = await f.lifecycle.run(launchRequest(operationId)); const expectedBindingSha256 = launch["bindingSha256"];
    assert.equal(typeof expectedBindingSha256, "string");
    await assert.rejects(f.lifecycle.captureWorkerStartup(operationId, String(expectedBindingSha256), captureInput), /COMBINED_MAIN_PUBLICATION_REQUIRED/u);
    assert.deepEqual(f.calls, ["allocate", "launch"]);
    const observed = await f.lifecycle.run({ action: "observe-main-construction", operationId, expectedBindingSha256 });
    assert.equal(observed["executionAuthorized"], false);
    const abort = { action: "abort-generation", operationId, expectedBindingSha256, confirmAbortOriginalCombinedJob: true };
    if (lostAbort) { await assert.rejects(f.lifecycle.run(abort), /lost abort acknowledgment/u); }
    else {
      const dispatched = f.lifecycle.run(abort);
      await assert.rejects(f.lifecycle.run({ action: "observe-termination", operationId, expectedBindingSha256 }), /BUSY/u);
      const acknowledged = await dispatched; assert.equal(acknowledged["terminationProved"], false);
    }
    await assert.rejects(f.lifecycle.run(abort), /COMBINED_ABORT_CONSUMED/u);
    await assert.rejects(f.lifecycle.run({ action: "observe-main-construction", operationId, expectedBindingSha256 }), /COMBINED_GENERATION_ABORTED/u);
    await assert.rejects(f.lifecycle.captureWorkerStartup(operationId, String(expectedBindingSha256), captureInput), /COMBINED_GENERATION_ABORTED/u);
    const inspected = await f.lifecycle.run({ action: "inspect", operationId });
    assert.equal(inspected["combinedAbortAttemptConsumed"], true); assert.equal(inspected["combinedAbortAcknowledged"], !lostAbort);
    assert.equal(inspected["combinedAbortDispatchAttempted"], true); assert.equal(inspected["combinedOutputCleanupOnly"], false);
    assert.notEqual(inspected["state"], "terminated");
    await f.lifecycle.run({ action: "observe-termination", operationId, expectedBindingSha256 });
    const released = await f.lifecycle.run({ action: "release-closed", operationId, expectedBindingSha256 }); assert.equal(released["state"], "released");
    await assertNoUnresolvedCurrentPcbDiagnosticLaunches();
    assert.deepEqual(f.calls, ["allocate", "launch", "observe", "reserve-abort", "abort", "termination", "release"]);
  });
}

void test("combined abort bypasses an active main stage and prevents post-abort success publication", async () => {
  const operationId = "footprint-combined-inflight"; const f = fixture(operationId, { suspendedMain: true });
  const launch = await f.lifecycle.run(launchRequest(operationId)); const expectedBindingSha256 = launch["bindingSha256"];
  const observation = f.lifecycle.run({ action: "observe-main-construction", operationId, expectedBindingSha256 });
  const refused = assert.rejects(observation, /COMBINED_GENERATION_ABORTED/u); await f.mainEntered;
  const aborted = await f.lifecycle.run({ action: "abort-generation", operationId, expectedBindingSha256, confirmAbortOriginalCombinedJob: true });
  assert.equal(aborted["abortDispatched"], true); await refused;
  const inspected = await f.lifecycle.run({ action: "inspect", operationId }); assert.equal(inspected["mainConstructionResultPublished"], false);
  await f.lifecycle.run({ action: "observe-termination", operationId, expectedBindingSha256 });
  await f.lifecycle.run({ action: "release-closed", operationId, expectedBindingSha256 });
});

void test("combined abort preserves failed unpublished plans privately while original cleanup settles", async () => {
  const operationId = "footprint-combined-unpublished"; const f = fixture(operationId, { lostResult: true });
  const launch = await f.lifecycle.run(launchRequest(operationId)); const expectedBindingSha256 = launch["bindingSha256"];
  await assert.rejects(f.lifecycle.run({ action: "observe-main-construction", operationId, expectedBindingSha256 }), /publication failure/u);
  await f.lifecycle.run({ action: "abort-generation", operationId, expectedBindingSha256, confirmAbortOriginalCombinedJob: true });
  const inspected = await f.lifecycle.run({ action: "inspect", operationId });
  assert.equal(inspected["mainConstructionResultPublished"], false); assert.equal(inspected["combinedAbortedUnpublishedRecordCount"], 1);
  await f.lifecycle.run({ action: "settle-records", operationId, expectedIntentSha256: inspected["intentSha256"] });
  await f.lifecycle.run({ action: "observe-termination", operationId, expectedBindingSha256 });
  await f.lifecycle.run({ action: "release-closed", operationId, expectedBindingSha256 });
});

void test("combined reservations reject a competing owner before native allocation", async () => {
  const operationId = "footprint-combined-owner"; const first = fixture(operationId); const second = fixture("footprint-combined-competitor");
  const launch = await first.lifecycle.run(launchRequest(operationId)); const expectedBindingSha256 = launch["bindingSha256"];
  await assert.rejects(second.lifecycle.run(launchRequest("footprint-combined-competitor")), /LAUNCH/u); assert.deepEqual(second.calls, []);
  await first.lifecycle.run({ action: "abort-generation", operationId, expectedBindingSha256, confirmAbortOriginalCombinedJob: true });
  await first.lifecycle.run({ action: "observe-termination", operationId, expectedBindingSha256 });
  await first.lifecycle.run({ action: "release-closed", operationId, expectedBindingSha256 });
});

void test("combined abort waits only in-flight publication, freezes its prefix and retains cleanup", async () => {
  const operationId = "footprint-combined-publication"; const f = fixture(operationId, { suspendedPublication: true });
  const launch = await f.lifecycle.run(launchRequest(operationId)); const expectedBindingSha256 = launch["bindingSha256"];
  const observation = f.lifecycle.run({ action: "observe-main-construction", operationId, expectedBindingSha256 });
  const refused = assert.rejects(observation, /COMBINED_GENERATION_ABORTED/u); await f.publicationEntered;
  const abort = f.lifecycle.run({ action: "abort-generation", operationId, expectedBindingSha256, confirmAbortOriginalCombinedJob: true });
  assert.equal(f.calls.includes("reserve-abort"), true); assert.equal(f.calls.includes("abort"), false); f.releasePublication(); await abort; await refused;
  const inspected = await f.lifecycle.run({ action: "inspect", operationId });
  assert.equal(inspected["mainConstructionResultPublished"], true); assert.equal(inspected["combinedAbortAcknowledged"], true);
  await f.lifecycle.run({ action: "observe-termination", operationId, expectedBindingSha256 });
  await f.lifecycle.run({ action: "release-closed", operationId, expectedBindingSha256 });
});

for (const mode of ["success", "metadata-failure", "intent-failure"] as const) {
  void test(`native-cache observation requires original published prerequisites and durable once-only intent: ${mode}`, async () => {
    const operationId = `footprint-combined-cache-${mode}`;
    const f = fixture(operationId, { failedCacheProbe: mode === "metadata-failure", failedCacheIntent: mode === "intent-failure" });
    const launch = await f.lifecycle.run(launchRequest(operationId)); const expectedBindingSha256 = launch["bindingSha256"];
    const request = { action: "observe-saved-cache-native", operationId, expectedBindingSha256 };
    await assert.rejects(f.lifecycle.run(request), /PUBLICATION_REQUIRED/u); assert.equal(f.calls.includes("cache-probe"), false);
    await f.lifecycle.run({ action: "observe-main-construction", operationId, expectedBindingSha256 });
    await assert.rejects(f.lifecycle.run(request), /PUBLICATION_REQUIRED/u);
    await f.lifecycle.run({ action: "browser-observation", operationId, expectedBindingSha256 });
    await f.lifecycle.run({ action: "inspect-frames", operationId, expectedBindingSha256, targetId: "synthetic-target" });
    await assert.rejects(f.lifecycle.run(request), /PUBLICATION_REQUIRED/u);
    await f.lifecycle.run({ action: "inspect-script", operationId, expectedBindingSha256, frameId: "synthetic-frame", family: "ui" });
    if (mode === "success") {
      const observed = await f.lifecycle.run(request), result: unknown = observed["result"];
      assert.ok(result !== null && typeof result === "object"); assert.equal(Reflect.get(result, "nativeMatchQualified"), false);
      assert.equal(Reflect.get(result, "replayTokenIssued"), false);
    } else { await assert.rejects(f.lifecycle.run(request), mode === "intent-failure" ? /intent publication/u : /metadata failure/u); }
    await assert.rejects(f.lifecycle.run(request), /CONSUMED_OR_OPENED/u);
    assert.equal(f.calls.filter(value => value === "cache-probe").length, mode === "intent-failure" ? 0 : 1);
    const inspected = await f.lifecycle.run({ action: "inspect", operationId }); assert.equal(inspected["savedCacheNativeAttemptConsumed"], true);
    if (mode === "intent-failure") { await f.lifecycle.run({ action: "settle-records", operationId, expectedIntentSha256: inspected["intentSha256"] }); }
    await f.lifecycle.run({ action: "abort-generation", operationId, expectedBindingSha256, confirmAbortOriginalCombinedJob: true });
    await f.lifecycle.run({ action: "observe-termination", operationId, expectedBindingSha256 });
    await f.lifecycle.run({ action: "release-closed", operationId, expectedBindingSha256 });
  });
}

for (const mode of ["success", "metadata-failure", "intent-failure"] as const) {
  void test(`native-cache-accessor observation requires original published prerequisites and durable once-only intent: ${mode}`, async () => {
    const operationId = `footprint-combined-cache-accessor-${mode}`;
    const f = fixture(operationId, { failedCacheProbe: mode === "metadata-failure", failedCacheIntent: mode === "intent-failure" });
    const launch = await f.lifecycle.run(launchRequest(operationId)); const expectedBindingSha256 = launch["bindingSha256"];
    const request = { action: "observe-saved-cache-accessor", operationId, expectedBindingSha256 };
    await assert.rejects(f.lifecycle.run(request), /PUBLICATION_REQUIRED/u); assert.equal(f.calls.includes("cache-probe"), false);
    await f.lifecycle.run({ action: "observe-main-construction", operationId, expectedBindingSha256 });
    await assert.rejects(f.lifecycle.run(request), /PUBLICATION_REQUIRED/u);
    await f.lifecycle.run({ action: "browser-observation", operationId, expectedBindingSha256 });
    await f.lifecycle.run({ action: "inspect-frames", operationId, expectedBindingSha256, targetId: "synthetic-target" });
    await assert.rejects(f.lifecycle.run(request), /PUBLICATION_REQUIRED/u);
    await f.lifecycle.run({ action: "inspect-script", operationId, expectedBindingSha256, frameId: "synthetic-frame", family: "ui" });
    if (mode === "success") {
      const observed = await f.lifecycle.run(request), result: unknown = observed["result"];
      assert.ok(result !== null && typeof result === "object"); assert.equal(Reflect.get(result, "nativeMatchQualified"), false);
      assert.equal(Reflect.get(result, "replayTokenIssued"), false);
    } else { await assert.rejects(f.lifecycle.run(request), mode === "intent-failure" ? /intent publication/u : /metadata failure/u); }
    await assert.rejects(f.lifecycle.run(request), /CONSUMED_OR_OPENED/u);
    assert.equal(f.calls.filter(value => value === "cache-probe").length, mode === "intent-failure" ? 0 : 1);
    const inspected = await f.lifecycle.run({ action: "inspect", operationId }); assert.equal(inspected["savedCacheAccessorAttemptConsumed"], true);
    if (mode === "intent-failure") { await f.lifecycle.run({ action: "settle-records", operationId, expectedIntentSha256: inspected["intentSha256"] }); }
    await f.lifecycle.run({ action: "abort-generation", operationId, expectedBindingSha256, confirmAbortOriginalCombinedJob: true });
    await f.lifecycle.run({ action: "observe-termination", operationId, expectedBindingSha256 });
    await f.lifecycle.run({ action: "release-closed", operationId, expectedBindingSha256 });
  });
}
