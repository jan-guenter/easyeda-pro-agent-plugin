/* oxlint-disable import/max-dependencies -- Exercise the actual engine dispatcher, original runtime forwarder, managed journal and cleanup owner together in one isolated synthetic fixture. */
import assert from "node:assert/strict";
import { rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { TestContext } from "node:test";
import { createOperation, loadOperation, operationPath } from "../../src/artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash, canonicalJson, sha256Json } from "../../src/core.ts";
import { EasyedaControlEngine } from "../../src/engine.ts";
import type { AuthenticatedBridgeDispatchBinding, AuthenticatedBridgeSessionIdentity, ExecutionAuthorityCaptureInput, ExecutionAuthorityEvidence,
  RuntimeIdentity, TrackedDispatchOperationJournal, UpstreamClient } from "../../src/engine.ts";
import { OrdinaryTrackedOpenCleanup } from "../../src/ordinary-tracked-open-cleanup.ts";
import type { OrdinaryTrackedOpenCleanupDependencies } from "../../src/ordinary-tracked-open-cleanup.ts";
import { WindowsControlRuntime } from "../../src/windows-runtime.ts";
import type { WindowsAuthorityLaunch } from "../../src/windows-authority.ts";
import { createWindowsRuntimeValidator } from "../../src/windows-runtime-validator.ts";

export async function ordinaryTrackedCleanupFixture(context: TestContext, id: string, options: { profile?: string; phase?: string; deferred?: boolean; settledResult?: boolean; normalCloseUncertain?: boolean;
  cleanupDependencies?: OrdinaryTrackedOpenCleanupDependencies } = {}): Promise<{
  engine: EasyedaControlEngine; runtime: WindowsControlRuntime; journal: TrackedDispatchOperationJournal; cleanup: OrdinaryTrackedOpenCleanup;
  calls: string[]; behavior: { terminated: boolean; sessionClosed: boolean; leaseReleased: boolean; launchCurrent: boolean };
  work: Promise<unknown>; nativeEntered: Promise<boolean>; settle: () => void;
}> {
  const behavior = { terminated: false, sessionClosed: false, leaseReleased: false, launchCurrent: true }, calls: string[] = [];
  const session: AuthenticatedBridgeSessionIdentity = { gatewayInstanceId: "G".repeat(43), sessionId: "S".repeat(43), sequence: 1,
    authenticatedAtEpochMs: 100, authenticationReceiptSha256: "a".repeat(64) };
  const binding: AuthenticatedBridgeDispatchBinding = { schema: "easyeda-pro-control.bridge-dispatch-lease.v1", gatewayInstanceId: session.gatewayInstanceId,
    sessionId: session.sessionId, sessionSequence: 1, begunAtEpochMs: 101, leaseId: "L".repeat(43), bindingReceipt: "B".repeat(43) };
  const identity: RuntimeIdentity = { kind: "runtime-identity", generation: "original-synthetic-renderer-generation", timeOrigin: 1, processId: null };
  const launch: WindowsAuthorityLaunch = { jobId: "c".repeat(32), helperInstance: "d".repeat(32),
    root: { pid: 123, role: "easyeda-main", startIdentity: `win32:123456789012345:job:${"c".repeat(32)}` } };
  const deferred = Promise.withResolvers<unknown>(), nativeEntry = Promise.withResolvers<boolean>();
  const settle = (): void => { deferred.reject(new Error("synthetic lost native reply")); };
  const nativeEntered = nativeEntry.promise, pending = deferred.promise;
  const upstream: UpstreamClient = {
    listTools: (): Promise<never> => Promise.reject(new Error("No discovery permitted")),
    callTool: (): Promise<unknown> => {
      calls.push("native-call"); nativeEntry.resolve(true);
      if (options.deferred === true) { return pending; }
      if (options.settledResult === true) { return Promise.resolve({ content: [], structuredContent: { ok: true, result: "acknowledged" } }); }
      return Promise.reject(new Error("synthetic lost native reply"));
    },
    bridgeSessionLifecycle: (): unknown => ({ schema: "easyeda-pro-control.authenticated-bridge-lifecycle.v1", gatewayInstanceId: session.gatewayInstanceId,
      activeSession: behavior.sessionClosed ? null : session, publicEndpoint: { host: "127.0.0.1", port: 49_621 }, recentClosedSessions: [] }),
    currentAuthenticatedBridgeDispatchBinding: (): undefined => undefined,
    beginAuthenticatedBridgeDispatch: (): AuthenticatedBridgeDispatchBinding => binding,
    endAuthenticatedBridgeDispatch: (): void => { calls.push("end-dispatch"); },
    abortAuthenticatedBridgeDispatch: (): { released: boolean; retainedUntilSessionClose: boolean } => ({ released: false, retainedUntilSessionClose: true }),
    assertClosedAuthenticatedBridgeDispatchReleased: (actual, prior): unknown => {
      calls.push("closed-dispatch"); assert.deepEqual(actual, binding); assert.deepEqual(prior, session);
      if (!behavior.sessionClosed || !behavior.leaseReleased) { throw new Error("Original HMAC session or lease still pending"); }
      return { ...session, closedAtEpochMs: 1000, closeReason: "synthetic-process-closed" };
    },
  };
  const runtime = new WindowsControlRuntime({ upstream: { callTool: (): Promise<never> => Promise.reject(new Error("No runtime bridge calls permitted")),
    currentAuthenticatedBridgeDispatchBinding: (): undefined => undefined, bridgeSessionLifecycle: (): undefined => undefined }, pluginRoot: "/opt/synthetic-control", assetsRoot: "/mnt/c/Synthetic/resources/app/assets",
    wslDistribution: "SyntheticReview", reviewedExecutionScopeSha256: "e".repeat(64) });
  const supervisor = {
    capture: (input: ExecutionAuthorityCaptureInput): Promise<ExecutionAuthorityEvidence> => {
      calls.push("capture"); const body = { schema: "easyeda-pro-control.execution-authority.v1" as const, bindingSha256: input.bindingSha256,
        capturedAt: new Date().toISOString(), policyId: "synthetic-original-owned-job", policySha256: "f".repeat(64), processes: [launch.root], processTreeSha256: sha256Json([launch.root]) };
      return Promise.resolve({ ...body, authoritySha256: sha256Json(body) });
    },
    releaseCapture: async (): Promise<void> => { const stored = await loadOperation(id); assert.equal(stored["orphanedCallPossible"], false); calls.push("release-capture"); },
    requestNormalClose: (input: { confirmNormalClose: true; windowHandle: string; launch: WindowsAuthorityLaunch }): Promise<void> => {
      assert.equal(input.confirmNormalClose, true); assert.equal(input.windowHandle, "12345"); assert.deepEqual(input.launch, launch);
      calls.push("normal-close");
      if (options.normalCloseUncertain === true) { return Promise.reject(new Error("synthetic normal-close acknowledgment lost")); }
      return Promise.resolve();
    },
    observeApplicationWindow: (): Promise<unknown> => Promise.resolve({ jobId: launch.jobId, helperInstance: launch.helperInstance, outcome: "available", hwnd: "12345" }),
    observeLaunchTermination: (): Promise<unknown> => {
      calls.push("original-termination"); return Promise.resolve({ jobId: launch.jobId, helperInstance: launch.helperInstance, terminated: behavior.terminated });
    },
  };
  // This is a real runtime receiver around a synthetic in-memory supervisor.
  // No process, Job, helper, socket or native launch is allocated by the test.
  Object.defineProperties(runtime, { supervisor: { value: supervisor }, currentLaunch: { value: launch }, state: { value: "owned" } });
  const engine = new EasyedaControlEngine(upstream, { executionAuthorityValidator: createWindowsRuntimeValidator(() => runtime) });
  await engine.controlFingerprintPromise;
  context.mock.method(engine, "runtimeIdentity", (): Promise<RuntimeIdentity> => Promise.resolve(identity));
  const plan = { profile: options.profile ?? "easyeda-pro-control.current-schematic-page-opening.v1", purpose: "synthetic-owned-page-open" };
  const journal: TrackedDispatchOperationJournal = { schema: OPERATION_SCHEMA, operationId: id, journalPath: operationPath(id), plan,
    planHash: buildPlanHash(plan), state: "prepared", mutationState: "navigation-intent", saved: false, reopened: false, hardStop: true,
    mutationMayHaveOccurred: true, orphanedCallPossible: false, nextSafeAction: "Synthetic retained call only", sequence: 0, artifacts: [], updatedAt: new Date().toISOString() };
  await createOperation(journal);
  const assertCurrent = (): void => { assert.equal(behavior.launchCurrent, true, "Original ordinary allocation changed"); };
  const cleanup = new OrdinaryTrackedOpenCleanup(engine, runtime, assertCurrent, options.cleanupDependencies); cleanup.retain(journal);
  const work = engine.dispatchWithOrphanTracking(journal, options.phase ?? "schematic-page-open209", "easyeda_execute", { code: "synthetic fixed program", confirmWrite: true }, 1000);
  // Preserve the actual rejected Promise for assertion without an unhandled
  // Rejection while another test step inspects its original engine settlement.
  void (async (): Promise<void> => {
    try { await work; }
    catch {
      // The original work Promise remains available to the test assertion.
    }
  })();
  const root = process.env["EASYEDA_CONTROL_DATA_DIR"];
  assert.ok(root !== undefined && root.includes("easyeda-test-control-"));
  context.after(async () => {
    const journalPath = operationPath(id), operationDirectory = dirname(journalPath);
    await rm(journalPath, { force: true }); await rm(join(operationDirectory, id), { recursive: true, force: true });
  });
  assert.equal(canonicalJson(journal.plan), canonicalJson(plan));
  return { engine, runtime, journal, cleanup, calls, behavior, work, nativeEntered, settle };
}
