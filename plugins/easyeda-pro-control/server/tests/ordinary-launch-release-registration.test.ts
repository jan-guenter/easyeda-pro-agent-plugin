/* oxlint-disable max-classes-per-file -- Actual index callbacks use distinct inert coordinator, runtime and diagnostic collaborators. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import { parse } from "acorn";
import { z } from "zod";
import { ordinaryLaunchRequestSchema } from "../src/ordinary-launch.ts";
import type { OrdinaryLaunchOptions, OrdinaryLaunchRuntime } from "../src/ordinary-launch.ts";

type Row = Record<string, unknown>;
type Invoke = (input: { request: unknown }) => Promise<unknown>;
const launch = { action: "launch", operationId: "ordinary-index-fixture", confirmLaunch: true, acceptExistingProfileEffects: true };
const release = { action: "release-closed", operationId: launch.operationId, expectedLaunchedSha256: "a".repeat(64),
  expectedTerminationSha256: "b".repeat(64), confirmReleaseClosed: true };

/** Select the actual startup dispatcher and its original retained state by
 * AST shape, excluding unrelated declarations without widening source bounds. */
function startupDeclarations(source: string): string {
  const blocks = parse(source, { ecmaVersion: "latest", sourceType: "module" }).body.flatMap(statement =>
    statement.type === "IfStatement" && statement.consequent.type === "BlockStatement" && statement.consequent.body.some(node =>
      node.type === "VariableDeclaration" && node.declarations.some(declaration => declaration.id.type === "Identifier" && declaration.id.name === "runStartup")) ? [statement.consequent] : []);
  assert.equal(blocks.length, 1); const block = blocks[0]; assert.ok(block);
  const selected = ["startupOriginal", "startupCalls", "combinedHistoricalOriginal", "runStartup"].map(name => {
    const matches = block.body.filter(node => node.type === "VariableDeclaration" && node.declarations.length === 1 &&
      node.declarations[0]?.id.type === "Identifier" && node.declarations[0].id.name === name);
    assert.equal(matches.length, 1); const node = matches[0]; assert.ok(node?.type === "VariableDeclaration");
    assert.equal(node.kind, name === "runStartup" ? "const" : "let");
    const initializer = node.declarations[0]?.init;
    if (name === "runStartup") { assert.equal(initializer?.type, "ArrowFunctionExpression"); }
    else if (name === "startupCalls") { assert.ok(initializer?.type === "Literal" && initializer.value === 0); }
    else { assert.equal(initializer, null); }
    assert.ok(node.end > node.start && node.end - node.start < (name === "runStartup" ? 24_000 : 3000));
    return source.slice(node.start, node.end);
  }).join("\n");
  // Bound the actual callback independently of erased type padding and the
  // Unused historical dispatcher/registration descriptions in the same block.
  assert.ok(selected.length < 28_000); return selected;
}

/** Join the real ordinary allocation guard, launch registration and startup
 * dispatcher with inert peers whose helper release can remain pending or fail. */
async function fixture(): Promise<{ invoke: Invoke; startup: () => Promise<unknown>; scope: vm.Context; finish: () => void;
  state: { releaseCalls: number; released: boolean; failRelease: boolean; runtimeCount: number; diagnosticAllocations: number } }> {
  const barrier = Promise.withResolvers<null>();
  const state = { releaseCalls: 0, released: false, failRelease: false, runtimeCount: 0, diagnosticAllocations: 0 };
  class Runtime implements OrdinaryLaunchRuntime {
    private readonly original = state;
    public constructor() { state.runtimeCount += 1; }
    public launch(): ReturnType<OrdinaryLaunchRuntime["launch"]> {
      assert.equal(this.original, state);
      return Promise.resolve({ jobId: "a".repeat(32), helperInstance: "b".repeat(32),
        root: { pid: 42, role: "easyeda-main", startIdentity: `win32:123456789012345:job:${"a".repeat(32)}` } });
    }
    public observeExistingApplication(): ReturnType<OrdinaryLaunchRuntime["observeExistingApplication"]> {
      assert.equal(this.original, state); return Promise.resolve({ running: false });
    }
    public observeLaunchTermination(): ReturnType<OrdinaryLaunchRuntime["observeLaunchTermination"]> {
      assert.equal(this.original, state); return Promise.resolve({ jobId: "a".repeat(32), helperInstance: "b".repeat(32), terminated: true });
    }
    /** Hold synthetic helper closure until the test permits it, then retain
     * success only if closure acknowledges; a request alone releases no owner. */
    public async release(): Promise<void> {
      assert.equal(this.original, state); state.releaseCalls += 1; await barrier.promise;
      if (state.failRelease) { throw new Error("synthetic helper closure failure"); }
      state.released = true;
    }
  }
  // The ordinary-launch-record suite covers the production issuer and journals.
  // This fixture joins real index callbacks through inert lifecycle peers.
  class Coordinator {
    private runtime: OrdinaryLaunchRuntime | undefined;
    private consumed = false;
    private readonly options: OrdinaryLaunchOptions;
    public constructor(options: OrdinaryLaunchOptions) { this.options = options; }
    /** Drive the actual index allocation and release hooks in their original
     * order, consuming release before the deliberately delayed helper result. */
    public async run(raw: unknown): Promise<Row> {
      const request = ordinaryLaunchRequestSchema.parse(raw); await this.options.assertAllowed();
      if (request.action === "launch") {
        this.runtime = this.options.allocateRuntime({ expectedExecutableSha256: "a".repeat(64), expectedHelperSha256: "b".repeat(64), reviewedExecutionScopeSha256: "c".repeat(64) });
        await this.runtime.launch(); this.consumed = false; return { synthetic: true };
      }
      assert.equal(request.action, "release-closed"); assert.equal(this.consumed, false, "release consumed");
      const runtime = this.runtime; assert.ok(runtime?.release); assert.ok(this.options.assertReleaseAllowed); assert.ok(this.options.completeRuntimeRelease);
      this.options.assertReleaseAllowed(runtime); this.consumed = true;
      await runtime.release(); this.options.completeRuntimeRelease(runtime); this.runtime = undefined;
      return { synthetic: true, indexAllocationReleased: true };
    }
  }
  class Diagnostic {
    private allocated = false;
    private reserved = false;
    private readonly options: { assertAllowed: () => Promise<void> };
    public constructor(options: { assertAllowed: () => Promise<void> }) { this.options = options; }
    /** Model a diagnostic reservation through its captured admission hook so
     * the real index must exclude it while ordinary helper custody is retained. */
    public async run(request: { action: string }): Promise<Row> {
      if (request.action === "release-closed") { this.reserved = false; return { synthetic: true }; }
      assert.equal(request.action, "launch"); await this.options.assertAllowed();
      this.reserved = true; this.allocated = true; state.diagnosticAllocations += 1;
      return { synthetic: true };
    }
    public hasActiveReservation(): boolean { return this.reserved; }
    public hasAttemptedNativeOwnerAllocation(): boolean { return this.allocated; }
  }
  for (const key of ["captureWorkerStartup", "handoffWorkerStartup", "openWorkerStartup", "handoffStartup", "openStartup", "requireStartup",
    "observeWorkerStartupAssignments", "observeStartupAssignments", "requireStartupAssignments", "observeWorkerStartupFootprint", "observeStartupFootprint", "observeWorkerStartupActor", "observeStartupActor",
    "observeWorkerStartupFootprintSource", "observeStartupFootprintSource",
    "prepareWorkerStartupFootprintCopy", "prepareStartupFootprintCopy",
    "observeWorkerStartupChannel", "observeStartupChannel", "observeWorkerStartupEmpty", "observeStartupEmpty", "prepareWorkerStartupEmpty", "prepareStartupEmpty",
    "observeWorkerStartupRatline", "observeStartupRatline", "observeWorkerStartupRatlineContinuation", "observeStartupRatlineContinuation"]) {
    Object.defineProperty(Diagnostic.prototype, key, { value: (): never => { throw new Error("Unexpected diagnostic operation"); } });
  }
  let invoke: Invoke | undefined;
  const upstream = {};
  const engine = { upstream, controlFingerprintPromise: Promise.resolve(), executionAuthorityValidator: (): void => {
    // Stable inert authority owner.
  },
    assertBridgeDispatchAllowed: (): Promise<void> => Promise.resolve(), assertDiagnosticLaunchOtherOperationsSettled: (): Promise<void> => Promise.resolve() };
  const scope = vm.createContext({ z, ordinaryLaunchRequestSchema, OrdinaryLaunchCoordinator: Coordinator, WindowsControlRuntime: Runtime,
    CurrentPcbDiagnosticLifecycle: Diagnostic, CurrentPcbWorkerStartupLifecycle: Diagnostic, CurrentPcb209WorkerStartupLifecycle: Diagnostic,
    CurrentPcb209EmptyStartupLifecycle: Diagnostic, CurrentPcb209RatlineStartupLifecycle: Diagnostic,
    CurrentPcb209RatlineContinuationLifecycle: Diagnostic, CurrentFootprintCopyPreparationLifecycle: Diagnostic,
    CurrentFootprintCopyRoutePreparationLifecycle: Diagnostic, diagnostic209: true,
    upstream, engine, bridgeGate: { run: async (work: () => Promise<unknown>): Promise<unknown> => { await Promise.resolve(); return work(); } },
    process: { env: { EASYEDA_ASSETS_ROOT: "/synthetic/assets", WSL_DISTRO_NAME: "synthetic" } },
    resolve: (): string => "/synthetic/plugin", controlDataDirectory: (): string => "/synthetic/control", retainedControlRoot: { path: "/synthetic/control" },
    CURRENT_PCB_DIAGNOSTIC_PROFILE: { powershell: { sha256: "a".repeat(64), bytes: 1 } },
    ordinaryLaunchCoordinator: undefined, ordinaryLaunchRuntime: undefined, windowsRuntime: undefined,
    currentPcbDiagnosticLifecycle: undefined, currentPcbStringPrecreateLifecycle: undefined, currentPcbWorkerStartupLifecycle: undefined, currentFootprintMainLifecycle: undefined, currentFootprintHeldCacheValidation: undefined, currentFootprintHeadAgeValidation: undefined,
    currentDisposableOpenCoordinator: undefined, currentPcbRenameOperationCoordinator: undefined, currentSchematicRenameOperationCoordinator: undefined,
    closedSymbolIndexReservation: undefined, closedSymbolUnreservedFailure: { observed: false }, scheduledShutdown: undefined,
    serializedGuarded: (handler: Invoke): Invoke => handler,
    registerFacadeTool: (name: string, _config: unknown, handler: Invoke): void => { assert.equal(name, "easyeda_control_launch"); invoke = handler; },
  });
  const source = stripTypeScriptTypes(await readFile(new URL("../src/index.ts", import.meta.url), "utf8"));
  const helperStart = source.indexOf("function disposableOwnData(");
  const helperEnd = source.indexOf("\n}", source.indexOf("function disposableOwnerMethod(", helperStart)) + 2;
  const allocationStart = source.indexOf("function assertOrdinaryRuntimeAllocationAllowed(");
  const allocationEnd = source.indexOf("\n}", allocationStart) + 2;
  const registrationStart = source.indexOf('registerFacadeTool(\n  "easyeda_control_launch",');
  const registrationEnd = source.indexOf('registerFacadeTool(\n  "easyeda_control_project_open",', registrationStart);
  for (const [begin, end] of [[helperStart, helperEnd], [allocationStart, allocationEnd], [registrationStart, registrationEnd]] as const) {
    assert.ok(begin > 0 && end > begin && end - begin < 24_000);
    vm.runInContext(source.slice(begin, end).replaceAll("import.meta.dirname", '"/synthetic/server/src"'), scope);
  }
  vm.runInContext(startupDeclarations(source).replaceAll("import.meta.dirname", '"/synthetic/server/src"'), scope);
  assert.ok(invoke);
  return { invoke, scope, state, finish: (): void => { barrier.resolve(null); }, startup: (): Promise<unknown> =>
    Promise.resolve(vm.runInContext("runStartup({action:'launch'})", scope) as unknown) };
}

void test("actual ordinary allocation callback waits for helper closure then permits a fresh ordinary allocation", async () => {
  const value = await fixture(); await value.invoke({ request: launch });
  const original: unknown = value.scope["windowsRuntime"]; assert.notEqual(original, undefined); assert.equal(value.scope["ordinaryLaunchRuntime"], original);
  const pending = value.invoke({ request: release });
  for (let turn = 0; turn < 50 && value.state.releaseCalls === 0; turn += 1) { await Promise.resolve(); }
  assert.equal(value.state.releaseCalls, 1); assert.equal(value.scope["windowsRuntime"], original); assert.equal(value.scope["ordinaryLaunchRuntime"], original);
  value.finish(); await pending; assert.equal(value.state.released, true);
  assert.equal(value.scope["windowsRuntime"], undefined); assert.equal(value.scope["ordinaryLaunchRuntime"], undefined);
  await value.invoke({ request: { ...launch, operationId: "ordinary-index-next" } });
  assert.equal(value.state.runtimeCount, 2); assert.notEqual(value.scope["windowsRuntime"], original);
});

void test("actual ordinary allocation refuses active held-cache and head-age reservations before constructing a runtime", async () => {
  for (const key of ["currentFootprintHeldCacheValidation", "currentFootprintHeadAgeValidation"]) {
    const value = await fixture(); let active = true;
    value.scope[key] = { hasActiveReservation: (): boolean => active };
    await assert.rejects(value.invoke({ request: launch }), /diagnostic lifecycle reserves application startup/u);
    assert.equal(value.state.runtimeCount, 0); assert.equal(value.scope["windowsRuntime"], undefined);
    assert.equal(value.scope["ordinaryLaunchRuntime"], undefined);
    active = false; await value.invoke({ request: launch }); assert.equal(value.state.runtimeCount, 1);
  }
});

void test("actual release callback allows a preflight-refused never-allocated diagnostic and then its startup", async () => {
  const value = await fixture(); await value.invoke({ request: launch });
  await assert.rejects(value.startup(), /no retained ordinary/u); assert.equal(value.state.diagnosticAllocations, 0);
  const diagnostic: unknown = value.scope["currentPcbWorkerStartupLifecycle"]; assert.notEqual(diagnostic, undefined);
  const pending = value.invoke({ request: release }); value.finish(); await pending;
  assert.equal(value.scope["windowsRuntime"], undefined); assert.equal(value.scope["ordinaryLaunchRuntime"], undefined);
  await value.startup(); assert.equal(value.state.diagnosticAllocations, 1);
  assert.equal(value.scope["currentPcbWorkerStartupLifecycle"], diagnostic);
});

void test("actual release allocation callback rejects other owners and preserves allocations on helper failure", async () => {
  const value = await fixture(); await value.invoke({ request: launch }); const original: unknown = value.scope["windowsRuntime"];
  for (const key of ["currentDisposableOpenCoordinator", "currentPcbRenameOperationCoordinator", "currentSchematicRenameOperationCoordinator", "closedSymbolIndexReservation"]) {
    value.scope[key] = {}; await assert.rejects(value.invoke({ request: release }), /reserved|unavailable/u); value.scope[key] = undefined;
  }
  await vm.runInContext(`(async()=>{const prior=new CurrentPcbDiagnosticLifecycle({assertAllowed:async()=>{}});
    await prior.run({action:'launch'});await prior.run({action:'release-closed'});currentPcbDiagnosticLifecycle=prior;})()`, value.scope);
  await assert.rejects(value.invoke({ request: release }), /no native allocation attempt/u);
  value.scope["currentPcbDiagnosticLifecycle"] = undefined;
  assert.equal(value.state.releaseCalls, 0);
  value.state.failRelease = true; const pending = value.invoke({ request: release }); value.finish();
  await assert.rejects(pending, /helper closure failure/u);
  assert.equal(value.scope["windowsRuntime"], original); assert.equal(value.scope["ordinaryLaunchRuntime"], original);
  await assert.rejects(value.invoke({ request: release }), /release consumed/u); assert.equal(value.state.releaseCalls, 1);
});
