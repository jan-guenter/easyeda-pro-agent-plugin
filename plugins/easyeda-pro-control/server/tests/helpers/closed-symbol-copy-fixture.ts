/* oxlint-disable import/max-dependencies -- This integration suite exercises the actual managed store, engine, runtime and supervisor together. */
import assert from "node:assert/strict";
import { ClosedSymbolCloseStage } from "../../src/closed-symbol-close.ts";
import { ClosedSymbolCopyStage } from "../../src/closed-symbol-copy.ts";
import { chmod, mkdtemp } from "node:fs/promises";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { syntheticSqlRoot, syntheticSqlRuntime } from "./sqlite-inventory-fixture.ts";
import { ClosedSymbolBootstrapLaunchStage } from "../../src/closed-symbol-launch.ts";
import { FAMILY, appendClosedSymbolEvent, createClosedSymbolJournal } from "../../src/closed-symbol-journal.ts";
import { loadOperation, updateOperation } from "../../src/artifacts.ts";
import { newOperationId, sha256Json } from "../../src/core.ts";
import { EasyedaControlEngine } from "../../src/engine.ts";
import type { AuthenticatedBridgeDispatchBinding } from "../../src/engine.ts";
import { WindowsControlRuntime } from "../../src/windows-runtime.ts";
import type { WindowsControlRuntimeOptions } from "../../src/windows-runtime.ts";
import type { ClosedSessionTerminationProof } from "../../src/windows-authority.ts";
import { closedSessionFixture } from "./windows-closed-session-fixture.ts";

const hash = "a".repeat(64), project = "b".repeat(64), target = "c".repeat(32);
type CloseInput = Parameters<ClosedSymbolCloseStage["close"]>[0];
type Upstream = WindowsControlRuntimeOptions["upstream"];
export interface Fixture {
  source: string; directory: string; proof: ClosedSessionTerminationProof; copyStage: ClosedSymbolCopyStage;
  stage: ClosedSymbolCloseStage; journal: CloseInput["journal"]; generation: CloseInput["generation"]; capture: CloseInput["capture"];
  runtime: WindowsControlRuntime; owner: ReturnType<typeof closedSessionFixture>; engine: EasyedaControlEngine;
  upstream: { -readonly [Key in keyof Upstream]: Upstream[Key] }; state: { scope: boolean; runtimeReads: number }; operationId: string;
  input: { -readonly [Key in keyof CloseInput]: CloseInput[Key] };
  calls: (action: string) => number; dispose: () => Promise<void>;
}
export async function copyFixture(): Promise<Fixture> {
  const directory = await mkdtemp(join(syntheticSqlRoot(), "closed-copy-stage-"));
  const source = join(directory, "synthetic.eprj2");
  const database = new DatabaseSync(source);
  database.exec("PRAGMA schema_version=99; CREATE TABLE synthetic (value TEXT); INSERT INTO synthetic(rowid,value) VALUES(55,'not native project data')");
  database.close(); await chmod(source, 0o600);
  const owner = closedSessionFixture();
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
    reviewedExecutionScopeSha256: owner.policy.reviewedExecutionScopeSha256 }, {
    hashExecutable: (): Promise<string> => Promise.resolve(owner.policy.expectedExecutableSha256),
    startSupervisor: (): Promise<typeof owner.supervisor> => Promise.resolve(owner.supervisor),
  });
  const engine = new EasyedaControlEngine(upstream, { executionAuthorityValidator: runtime });
  await engine.controlFingerprintPromise;
  const journal = await createClosedSymbolJournal(newOperationId(), { profile: FAMILY, projectUuid: project, branchUuid: "d".repeat(32), ownerUuid: "e".repeat(32), targetUuid: target,
    activeUuid: "f".repeat(32), projectPath: source, operation: { id: "copy-synthetic", action: "library.symbol.modify", libraryUuid: project, target: { uuid: target }, patch: { name: "Synthetic" } },
    marker: { namespaceNonce: "1".repeat(64), keyNonce: "2".repeat(64), bodyNonce: "3".repeat(64) }, nativePinsSha256: hash, facadeSha256: hash, expectedFingerprintSha256: hash });
  const operationId = journal.operationId;
  const first = await new ClosedSymbolBootstrapLaunchStage(engine, runtime).launch(journal);
  await appendClosedSymbolEvent(journal, { step: "baseline-admission", kind: "intent", generation: first.generation, requestSha256: hash, data: { synthetic: "capture next" } });
  state.scope = true;
  const capture = await engine.captureClosedSessionAuthority(operationId, "closed-baseline", 1);
  const generation = { ...first.generation, captureSha256: sha256Json(capture), runtimeSha256: sha256Json(capture.runtimeIdentity), sessionSha256: sha256Json(capture.bridgeSession) };
  await appendClosedSymbolEvent(journal, { step: "baseline-admission", kind: "result", generation, requestSha256: hash, data: { capture } });
  // This suite tests only closed-copy orchestration. Marker records are synthetic
  // Prerequisites, not claims that a storage operation or bridge program ran.
  for (const kind of ["intent", "result"] as const) {
    await appendClosedSymbolEvent(journal, { step: "baseline-marker-create", kind, generation, requestSha256: hash, data: { synthetic: "marker prerequisite" } });
  }
  state.scope = false;
  const stage = new ClosedSymbolCloseStage(engine, runtime);
  const closed = await stage.close({ journal, generation, capture, phase: "baseline-close", windowHandle: "12345" });
  const proof = await stage.prove(closed);
  const copyStage = new ClosedSymbolCopyStage(engine, await syntheticSqlRuntime());
  return { source, directory, proof, copyStage, stage, journal, generation, capture, runtime, owner, upstream, state, engine, operationId,
    input: { journal, generation, capture, phase: "baseline-close" as const, windowHandle: "12345" },
    calls: (action: string): number => owner.requests.filter((request) => request["action"] === action).length,
    async dispose(): Promise<void> { const loaded = await loadOperation(operationId); loaded["state"] = "completed"; loaded["orphanedCallPossible"] = false; await updateOperation(loaded); },
  };
}
