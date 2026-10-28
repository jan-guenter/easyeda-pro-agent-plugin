/** Real managed journal/core with an injected synthetic native owner. These
 * cases prove ordering and consumed cleanup, not inspector or CAD execution. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { controlDataDirectory } from "../src/artifacts.ts";
import { CurrentFootprintMainLifecycle } from "../src/current-pcb-diagnostic-lifecycle.ts";
import type { CurrentPcbDiagnosticLifecycleOptions, CurrentPcbDiagnosticLifecycleOwner } from "../src/current-pcb-diagnostic-lifecycle.ts";
import { createCurrentPcb209DiagnosticInstallationPlan } from "../src/current-pcb-diagnostic-installation.ts";
import type { CurrentPcbDiagnosticInstallation } from "../src/current-pcb-diagnostic-installation.ts";
import type { CurrentFootprintMainNativeOwner } from "../src/current-pcb-diagnostic-owner.ts";
import { currentFootprintCopyMainBackendObservationSchema } from "../src/current-footprint-copy-main-backend-runner.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE } from "../src/current-footprint-copy-main-backend-source.ts";
// oxlint-disable-next-line import/max-dependencies -- Compose the real lifecycle/journal and independent source/observation contracts with original native-owner callback types in one focused test.
import { assertNoUnresolvedCurrentPcbDiagnosticLaunches } from "../src/current-pcb-diagnostic-lifecycle-journal.ts";

const unavailable = (): Promise<never> => Promise.reject(new Error("Unexpected synthetic native operation"));
type MainOwner = CurrentPcbDiagnosticLifecycleOwner & Pick<CurrentFootprintMainNativeOwner,
  "observeFootprintMainConstruction" | "retainedFootprintMainConstruction" | "terminateFootprintMain" | "handoffWorkerStartup">;
function fixture(operationId: string, lostTerminate: boolean, failedLaunch = false): { lifecycle: CurrentFootprintMainLifecycle; calls: string[] } {
  const calls: string[] = []; let bound = false, released = false, terminated = false;
  const binding = { helperInstance: "b".repeat(32), jobId: "c".repeat(32), rootPid: 123, rootCreated: "123456789012345" };
  const path = (name: string): string => join(controlDataDirectory(), "pcb-diagnostic-lifecycle-v1", operationId, name);
  const owner: MainOwner = {
    status: () => ({ profile: "worker-startup-footprint-main209", helperPid: 456, binding: bound ? binding : null, failure: null, busy: false,
      launchConsumed: bound, closeConsumed: false, released, helperClosed: released, cleanupOnly: false, noProcessCleanupAvailable: false,
      frameWorkerVerified: false, executionAuthorized: false, nativeLaunchError: null, nativeSendError: null, createProcessError: null,
      browserObservationConsumed: false, frameInspectionConsumed: false, scriptInspectionConsumed: false, diagnosticFailure: null,
      diagnosticFailureObservation: null, projectOpeningConsumed: false, projectOpeningResult: null, modelObservationConsumed: false,
      pcbOpeningConsumed: false, pcbOpeningResult: null, pcbObservationConsumed: false, pcbFrameObservation: null,
      pcbSourceQualified: false, stringPrecreateConsumed: false }),
    launch: async () => { assert.match(await readFile(path("intent.json"), "utf8"), /"acceptDebuggerPauseEffects":true/u);
      calls.push("launch"); bound = true; if (failedLaunch) { throw new Error("synthetic partial launch"); } return binding; },
    observeApplicationWindow: unavailable, requestNormalClose: unavailable, releaseUnlaunched: unavailable, releaseNoProcess: unavailable,
    browserObservation: unavailable, inspectFrames: unavailable, inspectScript: unavailable, inspectWorkers: unavailable,
    inspectWorkerScript: unavailable, observeWorkerState: unavailable, observeModelState: unavailable, openProject: unavailable,
    openPcb: unavailable, observePcbOpening: unavailable, handoffWorkerStartup: unavailable,
    observeFootprintMainConstruction: async () => {
      assert.match(await readFile(path("main-construction-intent.json"), "utf8"), /footprint-main-construction-intent/u); calls.push("observe");
      return currentFootprintCopyMainBackendObservationSchema.parse({ profile: "private.current-footprint-copy-main-backend-construction.v1",
        originalMainTransportRetained: true, runtimeAppSourceQualified: true, runtimeAppSourceSha256: CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_SOURCE.sha256,
        initialContinuationCount: 1, registrationBreakpointArmedBeforeInitialContinuation: true, actualRegistrationLocationVerified: true,
        originalProtocolCallbackAndBackendRetained: true, originalDriverCallbackAndRouterRetained: true,
        originalActorClockAndSqlFunctionsRetained: true, originalNativeDateNowRetained: true, protocolRegistrationObserved: false,
        requestContextRetained: false, actualActorClockInvocationObserved: false, projectSqlInvocationObserved: false,
        responderExclusivityProven: false, executionAuthorized: false });
    },
    retainedFootprintMainConstruction: () => null,
    terminateFootprintMain: async confirm => {
      assert.equal(confirm, true); assert.match(await readFile(path("main-terminate-intent.json"), "utf8"), /confirmTerminateOriginalDiagnosticJob/u);
      calls.push("terminate"); terminated = true; if (lostTerminate) { throw new Error("synthetic lost termination acknowledgment"); }
    },
    observeTermination: () => { calls.push("termination"); return Promise.resolve(terminated); },
    releaseClosed: async () => { assert.ok(terminated); assert.match(await readFile(path("release-intent.json"), "utf8"), /diagnostic-release-intent/u);
      calls.push("release"); released = true; },
  };
  const options: CurrentPcbDiagnosticLifecycleOptions = { pluginRoot: "/mnt/c/Reviewed/Plugin",
    assetsRoot: "/mnt/c/Reviewed/EasyEDA/resources/app/assets", powershellSha256: "d".repeat(64), powershellBytes: 123,
    assertAllowed: (): Promise<void> => Promise.resolve(), assertOtherLaunchesSettled: (): Promise<void> => Promise.resolve(), assertLocalAllowed: (): void => undefined };
  const lifecycle = new CurrentFootprintMainLifecycle(options, {
    verifyInstallation: (): Promise<CurrentPcbDiagnosticInstallation> => Promise.resolve({ ...createCurrentPcb209DiagnosticInstallationPlan(options), facadeSha256: "a".repeat(64) }),
    allocateOwner: (): Promise<MainOwner> => { calls.push("allocate"); return Promise.resolve(owner); },
  });
  return { lifecycle, calls };
}

void test("retained partial original-main launch can terminate without a window or successful launch acknowledgment", async () => {
  const operationId = "footprint-main-lifecycle-partial"; const f = fixture(operationId, false, true);
  await assert.rejects(f.lifecycle.run({ action: "launch", operationId, confirmValidationOnly: true,
    confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true, acceptDebuggerPauseEffects: true }), /partial launch/u);
  const inspected = await f.lifecycle.run({ action: "inspect", operationId });
  const expectedBindingSha256 = inspected["bindingSha256"]; assert.equal(inspected["launchAcknowledged"], false);
  await f.lifecycle.run({ action: "terminate-main", operationId, expectedBindingSha256, confirmTerminateOriginalDiagnosticJob: true });
  await f.lifecycle.run({ action: "observe-termination", operationId, expectedBindingSha256 });
  const released = await f.lifecycle.run({ action: "release-closed", operationId, expectedBindingSha256 });
  assert.equal(released["state"], "released"); assert.equal(f.lifecycle.hasActiveReservation(), false);
  assert.deepEqual(f.calls, ["allocate", "launch", "terminate", "termination", "release"]);
});

for (const lostTerminate of [false, true]) {
  void test(`original main lifecycle journals construction and consumes termination once, lost reply=${String(lostTerminate)}`, async () => {
    const operationId = `footprint-main-lifecycle-${lostTerminate ? "lost" : "normal"}`; const f = fixture(operationId, lostTerminate);
    const launch = await f.lifecycle.run({ action: "launch", operationId, confirmValidationOnly: true,
      confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true, acceptDebuggerPauseEffects: true });
    const expectedBindingSha256 = launch["bindingSha256"]; assert.equal(typeof expectedBindingSha256, "string");
    const observed = await f.lifecycle.run({ action: "observe-main-construction", operationId, expectedBindingSha256 });
    assert.equal(observed["executionAuthorized"], false); await assert.rejects(f.lifecycle.run({ action: "observe-main-construction", operationId, expectedBindingSha256 }), /CONSUMED/u);
    const terminate = { action: "terminate-main", operationId, expectedBindingSha256, confirmTerminateOriginalDiagnosticJob: true };
    if (lostTerminate) { await assert.rejects(f.lifecycle.run(terminate), /lost termination acknowledgment/u); }
    else { const reply = await f.lifecycle.run(terminate); assert.equal(reply["terminationProved"], false); }
    await assert.rejects(f.lifecycle.run(terminate), /CONSUMED/u);
    const terminated = await f.lifecycle.run({ action: "observe-termination", operationId, expectedBindingSha256 }); assert.equal(terminated["state"], "terminated");
    const released = await f.lifecycle.run({ action: "release-closed", operationId, expectedBindingSha256 }); assert.equal(released["state"], "released");
    assert.equal(f.lifecycle.hasActiveReservation(), false); await assertNoUnresolvedCurrentPcbDiagnosticLaunches();
    assert.deepEqual(f.calls, ["allocate", "launch", "observe", "terminate", "termination", "release"]);
  });
}
