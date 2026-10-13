import { retireSyntheticJournal } from "./synthetic-journal-retirement.ts";
/** Synthetic transport/UI only; all stages, managed storage and SQL children are real. */
/* oxlint-disable import/max-dependencies -- Exercise concrete maintained owners together instead of fake phase callbacks. */
import assert from "node:assert/strict";
import { chmod, mkdtemp } from "node:fs/promises";
import { join, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { TestContext } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { ClosedSymbolCoordinator } from "../../src/closed-symbol-coordinator.ts";
import { UpstreamEasyedaClient } from "../../src/upstream.ts";
import { EasyedaControlEngine } from "../../src/engine.ts";
import type { AuthenticatedBridgeDispatchBinding } from "../../src/engine.ts";
import { WindowsControlRuntime } from "../../src/windows-runtime.ts";
import { WindowsNativeUiController } from "../../src/windows-native-ui.ts";
import { qualifiedNativeFixture } from "./windows-pending-fixture.ts";
import { startupFixture } from "./closed-symbol-startup-browser-fixture.ts";
import { syntheticSqlRoot, syntheticSqlRuntime } from "./sqlite-inventory-fixture.ts";
import { fingerprint } from "../pcb-selected-objects-fixture.ts";
import { FAMILY } from "../../src/closed-symbol-journal.ts";
import { isRecord, sha256Json } from "../../src/core.ts";

export async function fixture(context: TestContext): Promise<{
  stage: ClosedSymbolCoordinator; engine: EasyedaControlEngine; upstream: UpstreamEasyedaClient; runtime: WindowsControlRuntime;
  ui: WindowsNativeUiController; owner: Awaited<ReturnType<typeof qualifiedNativeFixture>>; browser: ReturnType<typeof startupFixture>;
  plan: Record<string, unknown>; source: string; events: string[]; identity: Record<string, unknown>;
  machine: Awaited<ReturnType<typeof syntheticSqlRuntime>>;
  state: { scope: boolean; launched: boolean; authReads: number; authAfter: number; sessionSequence: number;
    preexisting: boolean; startupFailure: boolean; scopeFailure: boolean; windows: unknown;
    onAuth: (() => void) | undefined; onUi: (() => void | Promise<void>) | undefined; onStartup: (() => void | Promise<void>) | undefined };
}> {
  const directory = await mkdtemp(join(syntheticSqlRoot(), "coordinator-")), source = join(directory, "synthetic.eprj2");
  const database = new DatabaseSync(source);
  database.exec("PRAGMA schema_version=99; CREATE TABLE synthetic(value TEXT); INSERT INTO synthetic VALUES('baseline source, not native project schema')");
  database.close(); await chmod(source, 0o600);
  const browser = startupFixture(), events: string[] = [], owner = await qualifiedNativeFixture(context);
  const state = { scope: false, launched: false, authReads: 0, authAfter: 1, sessionSequence: 1, preexisting: false,
    startupFailure: false, scopeFailure: false, windows: undefined as unknown,
    onAuth: undefined as (() => void) | undefined, onUi: undefined as (() => void | Promise<void>) | undefined,
    onStartup: undefined as (() => void | Promise<void>) | undefined };
  const client = new Client({ name: "synthetic-coordinator", version: "0" }), upstream = new UpstreamEasyedaClient();
  const binding: AuthenticatedBridgeDispatchBinding = { schema: "easyeda-pro-control.bridge-dispatch-lease.v1", gatewayInstanceId: "g".repeat(43),
    sessionId: "s".repeat(43), sessionSequence: 1, begunAtEpochMs: 1001, leaseId: "l".repeat(43), bindingReceipt: "b".repeat(43) };
  context.mock.method(upstream, "connect", (): Promise<Client> => { events.push("connect"); return Promise.resolve(client); });
  context.mock.method(upstream, "currentAuthenticatedBridgeDispatchBinding", (): AuthenticatedBridgeDispatchBinding | undefined => state.scope ? binding : undefined);
  context.mock.method(upstream, "bridgeSessionLifecycle", (): Record<string, unknown> => {
    if (state.launched) { state.authReads += 1; state.onAuth?.(); }
    return { schema: "easyeda-pro-control.authenticated-bridge-lifecycle.v1", gatewayInstanceId: "g".repeat(43), activeSession:
      state.preexisting || (state.launched && state.authReads >= state.authAfter) ? { sessionId: "s".repeat(43), sequence: state.sessionSequence,
        authenticationReceiptSha256: "2".repeat(64), authenticatedAtEpochMs: 1000 } : null,
      publicEndpoint: { host: "127.0.0.1", port: 49_100 }, recentClosedSessions: [] };
  });
  context.mock.method(upstream, "withAuthenticatedBridgeDispatchScope", async <Result,>(task: (lease: AuthenticatedBridgeDispatchBinding) => PromiseLike<Result> | Result): Promise<Result> => {
    assert.equal(state.scope, false); events.push("scope-enter"); state.scope = true;
    try { const value = await task(binding); if (state.scopeFailure) { throw new Error("synthetic scope settlement failed"); } return value; }
    finally { state.scope = false; events.push("scope-exit"); }
  });
  context.mock.method(upstream, "findTool", (): Promise<{ name: string }> => Promise.resolve({ name: "easyeda_execute" }));
  context.mock.method(upstream, "callTool", async (name: string, args?: Record<string, unknown>, _timeout?: number, lease?: AuthenticatedBridgeDispatchBinding): Promise<unknown> => {
    assert.equal(name, "easyeda_execute"); assert.equal(state.scope, true); assert.ok(lease !== undefined);
    const code = String(args?.["code"]);
    let result: unknown;
    if (code.includes("runtime-identity")) { result = { kind: "runtime-identity", generation: "synthetic-coordinator-runtime-0001", timeOrigin: 1000, processId: 101 }; }
    else {
      events.push("startup"); await state.onStartup?.();
      if (state.startupFailure) { throw new Error("synthetic uncertain startup"); }
      result = await browser.run();
    }
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  });
  owner.state.onFrame = (wireAction): void => {
    const action = wireAction.replace(/^clocked-/u, "");
    events.push(action);
    if (action === "launch") { state.launched = true; }
    if (action === "normal-close" || action === "prove-terminated") { assert.equal(state.scope, false); }
  };
  const options = { upstream, pluginRoot: "/opt/synthetic-control", assetsRoot: "/mnt/c/Synthetic/resources/app/assets", wslDistribution: "SyntheticReview",
    reviewedExecutionScopeSha256: owner.options.reviewedExecutionScopeSha256 };
  const runtime = new WindowsControlRuntime(options, {
    hashExecutable: (): Promise<string> => Promise.resolve(owner.options.expectedExecutableSha256),
    startSupervisor: (): Promise<typeof owner.supervisor> => Promise.resolve(owner.supervisor),
  });
  const engine = new EasyedaControlEngine(upstream, { executionAuthorityValidator: {
    capture: (input): ReturnType<WindowsControlRuntime["capture"]> => runtime.capture(input),
    proveTerminated: (input): ReturnType<WindowsControlRuntime["proveTerminated"]> => runtime.proveTerminated(input),
    releaseCapture: (input): ReturnType<WindowsControlRuntime["releaseCapture"]> => runtime.releaseCapture(input),
  } });
  const ui = new WindowsNativeUiController({ ...options, pluginRoot: resolve(import.meta.dirname, "../../.."), runtime }, {
    verifyHelper: (): Promise<void> => Promise.resolve(),
    invoke: async ({ request }): Promise<unknown> => {
      assert.equal(request["action"], "windows"); assert.equal(state.scope, false); events.push("windows"); await state.onUi?.();
      return { schema: "easyeda-pro-control.windows-native-ui.v1", action: "windows",
        binding: { rootPid: request["rootPid"], rootStartTicks: request["rootStartTicks"], executable: request["executable"], executableSha256: request["executableSha256"] },
        result: { windows: state.windows ?? [{ handle: "12345", pid: 100, owner: "0", className: "Chrome_WidgetWin_1", minimized: false, title: "Synthetic" }], mainWindowHandle: "12345" } };
    },
  });
  const identity = fingerprint(), implementation = await engine.controlFingerprintPromise, machine = await syntheticSqlRuntime();
  const plan: Record<string, unknown> = { profile: FAMILY, projectUuid: browser.input.projectUuid, branchUuid: browser.input.branchUuid,
    ownerUuid: browser.input.ownerUuid, targetUuid: "c".repeat(32), activeUuid: "f".repeat(32), projectPath: source,
    operation: { id: "coordinator-synthetic", action: "library.symbol.modify", libraryUuid: browser.input.projectUuid,
      target: { uuid: "c".repeat(32) }, patch: { name: "Synthetic" } }, marker: browser.input.marker,
    nativePinsSha256: "a".repeat(64), facadeSha256: implementation.sha256, expectedFingerprintSha256: sha256Json(identity) };
  assert.ok(isRecord(plan));
  const stage = new ClosedSymbolCoordinator(engine, upstream, runtime, ui, machine, identity);
  context.after(async (): Promise<void> => {
    // Retire only this test's synthetic journal after all assertions. This is
    // Test isolation cleanup, not a coordinator recovery or completion path.
    const operationId = stage.retained()["operationId"];
    if (typeof operationId === "string") {
      await retireSyntheticJournal(operationId);
    }
  });
  return { stage, engine, upstream, runtime, ui, owner, browser, plan, source, events, identity, machine, state };
}
