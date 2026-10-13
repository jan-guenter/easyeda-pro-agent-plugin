import { retireSyntheticJournal } from "./synthetic-journal-retirement.ts";
import assert from "node:assert/strict";
import type { TestContext } from "node:test";
import { ClosedSymbolCloseStage } from "../../src/closed-symbol-close.ts";
import { ClosedSymbolBootstrapLaunchStage } from "../../src/closed-symbol-launch.ts";
import { FAMILY, appendClosedSymbolEvent, createClosedSymbolJournal } from "../../src/closed-symbol-journal.ts";
import { newOperationId, sha256Json } from "../../src/core.ts";
import { EasyedaControlEngine } from "../../src/engine.ts";
import type { AuthenticatedBridgeDispatchBinding } from "../../src/engine.ts";
import { WindowsControlRuntime } from "../../src/windows-runtime.ts";
import type { WindowsControlRuntimeOptions } from "../../src/windows-runtime.ts";
import { qualifiedNativeFixture } from "./windows-pending-fixture.ts";

const hash = "a".repeat(64), project = "b".repeat(64), target = "c".repeat(32);
type CloseInput = Parameters<ClosedSymbolCloseStage["close"]>[0];
type Upstream = WindowsControlRuntimeOptions["upstream"];
interface Fixture {
  stage: ClosedSymbolCloseStage; journal: CloseInput["journal"]; generation: CloseInput["generation"]; capture: CloseInput["capture"];
  runtime: WindowsControlRuntime; owner: Awaited<ReturnType<typeof qualifiedNativeFixture>>; engine: EasyedaControlEngine;
  upstream: { -readonly [Key in keyof Upstream]: Upstream[Key] }; state: { scope: boolean; runtimeReads: number }; operationId: string;
  input: { -readonly [Key in keyof CloseInput]: CloseInput[Key] };
  calls: (action: string) => number; dispose: () => Promise<void>;
}
export async function closeFixture(context: TestContext): Promise<Fixture> {
  const owner = await qualifiedNativeFixture(context);
  const state = { scope: false, runtimeReads: 0 };
  const upstream = {
    findTool(): Promise<{ name: string }> { return Promise.resolve({ name: "easyeda_execute" }); },
    callTool(name: string): Promise<{ content: { type: "text"; text: string }[] }> {
      assert.equal(name, "easyeda_execute"); state.runtimeReads += 1;
      return Promise.resolve({ content: [{ type: "text", text: JSON.stringify({ kind: "runtime-identity", generation: "synthetic-runtime-generation-0001", timeOrigin: 1000, processId: 101 }) }] });
    },
    bridgeSessionLifecycle(): ReturnType<Upstream["bridgeSessionLifecycle"]> { return { schema: "easyeda-pro-control.authenticated-bridge-lifecycle.v1" as const,
      gatewayInstanceId: "g".repeat(43), activeSession: { sessionId: "s".repeat(43), sequence: 1, authenticationReceiptSha256: "2".repeat(64), authenticatedAtEpochMs: 1000 },
      publicEndpoint: { host: "127.0.0.1" as const, port: 49_100 }, recentClosedSessions: [] }; },
    currentAuthenticatedBridgeDispatchBinding(): AuthenticatedBridgeDispatchBinding | undefined {
      return state.scope ? { schema: "easyeda-pro-control.bridge-dispatch-lease.v1", gatewayInstanceId: "g".repeat(43), sessionId: "s".repeat(43), sessionSequence: 1,
        begunAtEpochMs: 1001, leaseId: "l".repeat(43), bindingReceipt: "b".repeat(43) } : undefined;
    },
  };
  const runtime = new WindowsControlRuntime({ upstream, pluginRoot: "/opt/synthetic-control", assetsRoot: "/mnt/c/Synthetic/resources/app/assets", wslDistribution: "SyntheticReview",
    reviewedExecutionScopeSha256: owner.options.reviewedExecutionScopeSha256 }, {
    hashExecutable: (): Promise<string> => Promise.resolve(owner.options.expectedExecutableSha256),
    startSupervisor: (): Promise<typeof owner.supervisor> => Promise.resolve(owner.supervisor),
  });
  const engine = new EasyedaControlEngine(upstream, { executionAuthorityValidator: runtime });
  await engine.controlFingerprintPromise;
  const journal = await createClosedSymbolJournal(newOperationId(), { profile: FAMILY, projectUuid: project, branchUuid: "d".repeat(32), ownerUuid: "e".repeat(32), targetUuid: target,
    activeUuid: "f".repeat(32), projectPath: "/synthetic/not-opened.eprj2", operation: { id: "close-synthetic", action: "library.symbol.modify", libraryUuid: project, target: { uuid: target }, patch: { name: "Synthetic" } },
    marker: { namespaceNonce: "1".repeat(64), keyNonce: "2".repeat(64), bodyNonce: "3".repeat(64) }, nativePinsSha256: hash, facadeSha256: hash, expectedFingerprintSha256: hash });
  const operationId = journal.operationId;
  const first = await new ClosedSymbolBootstrapLaunchStage(engine, runtime).launch(journal);
  await appendClosedSymbolEvent(journal, { step: "baseline-admission", kind: "intent", generation: first.generation, requestSha256: hash, data: { synthetic: "capture next" } });
  state.scope = true;
  const capture = await engine.captureClosedSessionAuthority(operationId, "closed-baseline", 1);
  const generation = { ...first.generation, captureSha256: sha256Json(capture), runtimeSha256: sha256Json(capture.runtimeIdentity), sessionSha256: sha256Json(capture.bridgeSession) };
  await appendClosedSymbolEvent(journal, { step: "baseline-admission", kind: "result", generation, requestSha256: hash, data: { capture } });
  // This suite tests only close orchestration. Marker records are synthetic
  // Prerequisites, not claims that a storage operation or bridge program ran.
  for (const kind of ["intent", "result"] as const) {
    await appendClosedSymbolEvent(journal, { step: "baseline-marker-create", kind, generation, requestSha256: hash, data: { synthetic: "marker prerequisite" } });
  }
  state.scope = false;
  const stage = new ClosedSymbolCloseStage(engine, runtime);
  context.after(async (): Promise<void> => { await retireSyntheticJournal(operationId); });
  return { stage, journal, generation, capture, runtime, owner, upstream, state, engine, operationId,
    input: { journal, generation, capture, phase: "baseline-close" as const, windowHandle: "12345" },
    calls: (action: string): number => owner.requests.filter((request) => request["action"] === action).length,
    async dispose(): Promise<void> { await retireSyntheticJournal(operationId); },
  };
}
