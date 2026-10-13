import assert from "node:assert/strict";
import type { TestContext } from "node:test";
import { createOperation, updateOperation } from "../../src/artifacts.ts";
import { OPERATION_SCHEMA, buildPlanHash } from "../../src/core.ts";
import { EasyedaControlEngine } from "../../src/engine.ts";
import type { AuthenticatedBridgeDispatchBinding, TrackedDispatchOperationJournal, UpstreamClient } from "../../src/engine.ts";
import { WindowsControlRuntime } from "../../src/windows-runtime.ts";
import type { WindowsControlRuntimeOptions } from "../../src/windows-runtime.ts";
import type { WindowsAuthoritySupervisor } from "../../src/windows-authority.ts";
import { qualifiedClockFixture } from "./windows-clock-fixture.ts";

export async function clockEngineFixture(context: TestContext): Promise<{
  child: Awaited<ReturnType<typeof qualifiedClockFixture>>; engine: EasyedaControlEngine; runtime: WindowsControlRuntime;
  upstream: UpstreamClient; launch: Awaited<ReturnType<WindowsControlRuntime["launch"]>>;
  state: { generation: string; sequence: number; scope: boolean; runtimeReads: number };
}> {
  const child = await qualifiedClockFixture(context);
  const state = { generation: "synthetic-runtime-generation-0001", sequence: 1, scope: true, runtimeReads: 0 };
  const upstream = {
    findTool(): Promise<{ name: string }> { return Promise.resolve({ name: "easyeda_execute" }); },
    bridgeSessionLifecycle(): ReturnType<WindowsControlRuntimeOptions["upstream"]["bridgeSessionLifecycle"]> { return {
      schema: "easyeda-pro-control.authenticated-bridge-lifecycle.v1", gatewayInstanceId: "g".repeat(43),
      activeSession: { sessionId: "s".repeat(43), sequence: state.sequence,
        authenticationReceiptSha256: "2".repeat(64), authenticatedAtEpochMs: 1000 },
      publicEndpoint: { host: "127.0.0.1", port: 49_621 }, recentClosedSessions: [],
    }; },
    currentAuthenticatedBridgeDispatchBinding(): AuthenticatedBridgeDispatchBinding | undefined {
      return state.scope ? { schema: "easyeda-pro-control.bridge-dispatch-lease.v1", gatewayInstanceId: "g".repeat(43),
        sessionId: "s".repeat(43), sessionSequence: state.sequence, begunAtEpochMs: 1001,
        leaseId: "l".repeat(43), bindingReceipt: "b".repeat(43) } : undefined;
    },
    callTool(name, args, _timeout, lease): ReturnType<WindowsControlRuntimeOptions["upstream"]["callTool"]> {
      assert.equal(name, "easyeda_execute"); assert.equal(typeof args?.["code"], "string"); assert.ok(lease !== undefined);
      state.runtimeReads += 1;
      return Promise.resolve({ content: [{ type: "text" as const, text: JSON.stringify({ kind: "runtime-identity",
        generation: state.generation, timeOrigin: 1000, processId: 101 }) }] });
    },
  } satisfies UpstreamClient;
  const runtime = new WindowsControlRuntime({ upstream, pluginRoot: "/synthetic/plugin",
    assetsRoot: "/mnt/c/Synthetic/resources/app/assets", reviewedExecutionScopeSha256: "e".repeat(64) }, {
    startSupervisor(): Promise<WindowsAuthoritySupervisor> { return Promise.resolve(child.supervisor); },
    hashExecutable(): Promise<string> { return Promise.resolve("d".repeat(64)); },
  });
  const launch = await runtime.launch();
  const engine = new EasyedaControlEngine(upstream, { executionAuthorityValidator: runtime });
  await engine.controlFingerprintPromise;
  return { child, engine, runtime, upstream, launch, state };
}

export async function clockTrackedJournal(context: TestContext, operationId: string): Promise<TrackedDispatchOperationJournal> {
  const plan = { synthetic: "clock-observer" };
  const journal: TrackedDispatchOperationJournal = {
    schema: OPERATION_SCHEMA, operationId, plan, planHash: buildPlanHash(plan), journalPath: "", state: "closed-preopen",
    mutationState: "unchanged", saved: false, reopened: false, orphanedCallPossible: false, hardStop: false,
    mutationMayHaveOccurred: false, nextSafeAction: "Synthetic read only.", sequence: 0, artifacts: [], updatedAt: new Date().toISOString(),
  };
  journal.journalPath = await createOperation(journal);
  context.after(async (): Promise<void> => { await updateOperation({ ...journal, state: "completed", orphanedCallPossible: false }); });
  return journal;
}
