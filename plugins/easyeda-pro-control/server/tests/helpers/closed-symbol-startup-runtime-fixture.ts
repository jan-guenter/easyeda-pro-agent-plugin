import { retireSyntheticJournal } from "./synthetic-journal-retirement.ts";
import assert from "node:assert/strict";
import { ClosedSymbolAdmissionStage } from "../../src/closed-symbol-admission.ts";
import type { AdmissionPhase } from "../../src/closed-symbol-admission.ts";
import { FAMILY, STEPS, appendClosedSymbolEvent, createClosedSymbolJournal } from "../../src/closed-symbol-journal.ts";
import type { ClosedJournal, Generation, LaunchGeneration } from "../../src/closed-symbol-journal.ts";
import { newOperationId, sha256Json } from "../../src/core.ts";
import { EasyedaControlEngine } from "../../src/engine.ts";
import type { AuthenticatedBridgeDispatchBinding } from "../../src/engine.ts";
import { WindowsControlRuntime } from "../../src/windows-runtime.ts";
import type { WindowsControlRuntimeOptions } from "../../src/windows-runtime.ts";
import type { WindowsAuthoritySupervisor } from "../../src/windows-authority.ts";
import { closedSessionFixture } from "./windows-closed-session-fixture.ts";

const hash = "a".repeat(64), project = "b".repeat(64), target = "c".repeat(32);
const PHASES = ["baseline-admission", "edit-admission", "verify-admission"] as const;
interface State { scope: boolean; sequence: number; generation: string; reads: number; afterRead: ((count: number) => void | Promise<void>) | undefined }
type Upstream = WindowsControlRuntimeOptions["upstream"] & { findTool: () => Promise<{ name: string }> };
interface Fixture {
  engine: EasyedaControlEngine; journal: ClosedJournal; launch: Awaited<ReturnType<WindowsControlRuntime["launch"]>>;
  operationId: string; ordinal: number; owner: ReturnType<typeof closedSessionFixture>; phase: AdmissionPhase;
  runtime: WindowsControlRuntime; stage: ClosedSymbolAdmissionStage; state: State; upstream: Upstream; beforeCount: number;
  captures: () => number; dispose: () => Promise<void>;
}
export async function fixture(phase: AdmissionPhase = "baseline-admission"): Promise<Fixture> {
  const owner = closedSessionFixture();
  const state: State = { scope: true, sequence: 1, generation: "synthetic-admission-runtime-0001", reads: 0, afterRead: undefined };
  const upstream: Upstream = {
    findTool(): Promise<{ name: string }> { return Promise.resolve({ name: "easyeda_execute" }); },
    bridgeSessionLifecycle(): ReturnType<WindowsControlRuntimeOptions["upstream"]["bridgeSessionLifecycle"]> {
      return { schema: "easyeda-pro-control.authenticated-bridge-lifecycle.v1", gatewayInstanceId: "g".repeat(43), activeSession: {
        sessionId: "s".repeat(43), sequence: state.sequence, authenticationReceiptSha256: "2".repeat(64), authenticatedAtEpochMs: 1000,
      }, publicEndpoint: { host: "127.0.0.1", port: 49_100 }, recentClosedSessions: [] };
    },
    currentAuthenticatedBridgeDispatchBinding(): AuthenticatedBridgeDispatchBinding | undefined {
      return state.scope ? { schema: "easyeda-pro-control.bridge-dispatch-lease.v1", gatewayInstanceId: "g".repeat(43), sessionId: "s".repeat(43),
        sessionSequence: state.sequence, begunAtEpochMs: 1001, leaseId: "l".repeat(43), bindingReceipt: "b".repeat(43) } : undefined;
    },
    async callTool(name: string, args?: Record<string, unknown>, _timeout?: number, binding?: AuthenticatedBridgeDispatchBinding): ReturnType<Upstream["callTool"]> {
      assert.equal(name, "easyeda_execute"); assert.ok(binding !== undefined);
      assert.equal(typeof args?.["code"], "string"); assert.match(String(args?.["code"]), /runtime-identity/u);
      state.reads += 1;
      const identity = { kind: "runtime-identity", generation: state.generation, timeOrigin: 1000, processId: 101 };
      await state.afterRead?.(state.reads);
      return { content: [{ type: "text", text: JSON.stringify(identity) }] };
    },
  };
  const runtime = new WindowsControlRuntime({ upstream, pluginRoot: "/opt/synthetic-control", assetsRoot: "/mnt/c/Synthetic/resources/app/assets",
    wslDistribution: "SyntheticReview", reviewedExecutionScopeSha256: owner.policy.reviewedExecutionScopeSha256 }, {
    hashExecutable(executable, assetsRoot): Promise<string> {
      assert.equal(executable, "/mnt/c/Synthetic/easyeda-pro.exe"); assert.equal(assetsRoot, "/mnt/c/Synthetic/resources/app/assets");
      return Promise.resolve(owner.policy.expectedExecutableSha256);
    },
    startSupervisor(options): Promise<WindowsAuthoritySupervisor> {
      assert.equal(options.expectedExecutable, owner.policy.expectedExecutable);
      assert.equal(options.expectedExecutableSha256, owner.policy.expectedExecutableSha256);
      return Promise.resolve(owner.supervisor);
    },
  });
  const launch = await runtime.launch();
  // Match the actual index-owned stable forwarding wrapper, not validator === runtime.
  const engine = new EasyedaControlEngine(upstream, { executionAuthorityValidator: {
    capture: (input): ReturnType<WindowsControlRuntime["capture"]> => runtime.capture(input),
    proveTerminated: (input): ReturnType<WindowsControlRuntime["proveTerminated"]> => runtime.proveTerminated(input),
    releaseCapture: (input): ReturnType<WindowsControlRuntime["releaseCapture"]> => runtime.releaseCapture(input),
  } }); await engine.controlFingerprintPromise;
  const ordinal = PHASES.indexOf(phase);
  const journal = await createClosedSymbolJournal(newOperationId(), { profile: FAMILY, projectUuid: project, branchUuid: "d".repeat(32), ownerUuid: "e".repeat(32), targetUuid: target,
    activeUuid: "f".repeat(32), projectPath: "/synthetic/not-opened.eprj2", operation: { id: "admission-synthetic", action: "library.symbol.modify", libraryUuid: project, target: { uuid: target }, patch: { name: "Synthetic" } },
    marker: { namespaceNonce: "a".repeat(64), keyNonce: "b".repeat(64), bodyNonce: "c".repeat(64) }, nativePinsSha256: hash, facadeSha256: hash, expectedFingerprintSha256: hash });
  // Prior phases are explicitly synthetic historical data, not executed stage
  // Proofs. The selected current launch is produced by the actual runtime.
  const beforeCount = STEPS.indexOf(phase) * 2;
  for (let index = 0; index < beforeCount; index += 1) {
    const step = STEPS[Math.floor(index / 2)]; assert.ok(step !== undefined);
    const kind = index % 2 === 0 ? "intent" : "result";
    const boundOrdinal = step.startsWith("baseline-") ? 0 : Number(step.startsWith("verify-")) + 1;
    const previousJob = String(boundOrdinal + 7).repeat(32);
    const receipt = boundOrdinal === ordinal ? launch : { jobId: previousJob, helperInstance: "b".repeat(32),
      root: { pid: boundOrdinal + 700, role: "easyeda-main", startIdentity: `win32:13436257345960252${String(boundOrdinal)}:job:${previousJob}` } };
    const partial: LaunchGeneration = { ordinal: boundOrdinal, helperInstance: receipt.helperInstance, jobId: receipt.jobId, rootPid: receipt.root.pid, rootStartIdentity: receipt.root.startIdentity };
    const full: Generation = { ...partial, runtimeSha256: hash, sessionSha256: hash, captureSha256: hash };
    let generation: Generation | LaunchGeneration | null = full;
    if (step.endsWith("-launch")) { generation = kind === "intent" ? null : partial; }
    else if (step.endsWith("-admission") && kind === "intent") { generation = partial; }
    await appendClosedSymbolEvent(journal, { step, kind, generation, requestSha256: sha256Json({ step }),
      data: step.endsWith("-launch") && kind === "result" ? { launchReceipt: receipt, launchReceiptSha256: sha256Json(receipt) } : { syntheticOnly: true } });
  }
  const operationId = journal.operationId, stage = new ClosedSymbolAdmissionStage(engine, runtime);
  return { engine, journal, launch, operationId, ordinal, owner, phase, runtime, stage, state, upstream, beforeCount,
    captures: (): number => owner.requests.filter((request) => request["action"] === "capture").length,
    async dispose(): Promise<void> {
      await retireSyntheticJournal(operationId);
    } };
}
