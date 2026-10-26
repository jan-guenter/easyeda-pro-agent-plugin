/** Actual registered index callback and schemas, with inert lifecycle peers.
 * This verifies routing/ownership refusal, not a Windows launch or live CAD. */
/* oxlint-disable max-classes-per-file -- Distinct inert lifecycle classes preserve the production instanceof and fixed-purpose routing checks. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import { z } from "zod";
import { SerializedGate } from "../src/engine.ts";
import { currentPcb209WorkerStartupToolRequestSchema } from "../src/current-pcb-209-empty-startup-validation.ts";
import { apiRequestSchema, queryOfflineApi } from "../src/offline-api.ts";

type Row = Record<string, unknown>;
type Handler = (input: { request: unknown }) => Promise<unknown>;
const expectedBindingSha256 = "a".repeat(64), operationId = "footprint-preparation-registration";
const wrap = (request: object): { request: object } => ({ request: { action: "footprint-copy-preparation", request } });
const launch = { action: "launch", operationId, confirmValidationOnly: true, confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true };
const bound = (action: string): object => ({ action, operationId, expectedBindingSha256 });
async function fixture(): Promise<Readonly<{ invoke: Handler; calls: readonly Row[]; allocations: readonly string[];
  gate: SerializedGate; replaceMethod: () => void; failNext: () => void }>> {
  const allocations: string[] = [], calls: Row[] = []; let fail = false;
  class Base {
    readonly #kind: string;
    readonly #options: { assertAllowed: () => Promise<void> };
    #reserved = false;
    public constructor(kind: string, options: { assertAllowed: () => Promise<void> }) {
      this.#kind = kind; this.#options = options; allocations.push(kind);
    }
    public async run(request: Row): Promise<Row> {
      if (request["action"] === "launch") { await this.#options.assertAllowed(); this.#reserved = true; }
      if (request["action"] === "release-closed") { this.#reserved = false; }
      return this.record("run", [request]);
    }
    public hasActiveReservation(): boolean { return this.#reserved; }
    public record(method: string, args: unknown[]): Promise<Row> {
      calls.push({ kind: this.#kind, method, args });
      if (fail) { fail = false; return Promise.reject(new Error("synthetic consumed stage")); }
      return Promise.resolve({ synthetic: true, executionAuthorized: false });
    }
  }
  class Preparation extends Base { public constructor(options: ConstructorParameters<typeof Base>[1]) { super("preparation", options); } }
  class Ordinary extends Base { public constructor(options: ConstructorParameters<typeof Base>[1]) { super("ordinary", options); } }
  class Empty extends Base { public constructor(options: ConstructorParameters<typeof Base>[1]) { super("empty", options); } }
  class Ratline extends Base { public constructor(options: ConstructorParameters<typeof Base>[1]) { super("ratline", options); } }
  class Continuation extends Base { public constructor(options: ConstructorParameters<typeof Base>[1]) { super("continuation", options); } }
  for (const name of ["captureWorkerStartup", "handoffWorkerStartup", "openWorkerStartup", "handoffStartup", "openStartup", "requireStartup",
    "observeWorkerStartupAssignments", "observeStartupAssignments", "requireStartupAssignments", "observeWorkerStartupActor", "observeStartupActor",
    "observeWorkerStartupChannel", "observeStartupChannel", "observeWorkerStartupFootprint", "observeStartupFootprint",
    "observeWorkerStartupFootprintSource", "observeStartupFootprintSource", "prepareWorkerStartupFootprintCopy", "prepareStartupFootprintCopy",
    "prepareWorkerStartupFootprintBindings", "prepareStartupFootprintCopyBindings", "observeWorkerStartupFootprintUi", "observeStartupFootprintCopyUi",
    "prepareWorkerStartupFootprintDependencies", "prepareStartupFootprintCopyDependencies",
    "observeWorkerStartupFootprintManagerRoute", "observeStartupFootprintCopyManagerRoute",
    "observeWorkerStartupEmpty", "observeStartupEmpty", "prepareWorkerStartupEmpty", "prepareStartupEmpty",
    "observeWorkerStartupRatline", "observeStartupRatline", "observeWorkerStartupRatlineContinuation", "observeStartupRatlineContinuation"]) {
    Object.defineProperty(Base.prototype, name, { value(this: Base, ...args: unknown[]): Promise<Row> { return this.record(name, args); } });
  }
  const gate = new SerializedGate(), upstream = {};
  const engine = { upstream, controlFingerprintPromise: Promise.resolve(), executionAuthorityValidator: (): void => undefined,
    assertDiagnosticLaunchOtherOperationsSettled: (): Promise<void> => Promise.resolve() };
  let handler: Handler | null = null;
  const scope = vm.createContext({ z, currentPcb209WorkerStartupToolRequestSchema, currentSymbolOperationToolOutputSchema: z.unknown(),
    CurrentPcbWorkerStartupLifecycle: Ordinary, CurrentPcb209WorkerStartupLifecycle: Ordinary, CurrentFootprintCopyPreparationLifecycle: Preparation,
    CurrentPcb209EmptyStartupLifecycle: Empty, CurrentPcb209RatlineStartupLifecycle: Ratline, CurrentPcb209RatlineContinuationLifecycle: Continuation,
    diagnostic209: true, facadeMode: "public-utilities-only", facadeToolRegistered: (): boolean => true,
    process: { env: { EASYEDA_ASSETS_ROOT: "/synthetic/assets", WSL_DISTRO_NAME: "synthetic" } },
    resolve: (): string => "/synthetic/plugin", retainedControlRoot: { path: "/synthetic/control" }, controlDataDirectory: (): string => "/synthetic/control",
    CURRENT_PCB_DIAGNOSTIC_PROFILE: { powershell: { sha256: "a".repeat(64), bytes: 1 } }, engine, upstream, bridgeGate: gate,
    windowsRuntime: undefined, ordinaryLaunchRuntime: undefined, currentPcbWorkerStartupLifecycle: undefined,
    currentDisposableOpenCoordinator: undefined, currentPcbRenameOperationCoordinator: undefined, currentSchematicRenameOperationCoordinator: undefined,
    closedSymbolIndexReservation: undefined, closedSymbolUnreservedFailure: { observed: false }, scheduledShutdown: undefined,
    currentPcbDiagnosticLifecycle: undefined, currentPcbStringPrecreateLifecycle: undefined,
    guarded: (registered: Handler): Handler => async (input): Promise<unknown> => { const result = await registered(input); return result; },
    server: { registerTool: (name: string, config: { inputSchema: z.ZodType; annotations: object }, registered: Handler): void => {
      assert.equal(name, "easyeda_control_pcb209_worker_startup");
      assert.deepEqual(structuredClone(config.annotations), { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true });
      handler = registered;
    } },
  });
  const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");
  const helperStart = source.indexOf("function disposableOwnData(");
  const helperEnd = source.indexOf("\n}", source.indexOf("function disposableOwnerMethod(", helperStart)) + 2;
  const start = source.indexOf("  let startupOriginal:");
  const end = source.indexOf("\n  server.registerTool(diagnosticTool,", start);
  for (const [begin, finish] of [[helperStart, helperEnd], [start, end]] as const) {
    assert.ok(begin > 0 && finish > begin && finish - begin < 40_000);
    vm.runInContext(stripTypeScriptTypes(source.slice(begin, finish)).replaceAll("import.meta.dirname", '"/synthetic/server/src"'), scope);
  }
  assert.ok(handler !== null);
  return { invoke: handler, calls, allocations, gate, failNext: (): void => { fail = true; }, replaceMethod: (): void => {
    Object.defineProperty(Preparation.prototype, "prepareWorkerStartupFootprintBindings", { value: (): never => assert.fail("Replacement must not execute") });
  } };
}
void test("registered preparation route forwards each action only through its original lifecycle receiver", async () => {
  const f = await fixture(); await f.invoke(wrap(launch));
  for (const action of ["observe-current-assignments", "observe-actor-clock", "observe-footprint-state", "prepare-footprint-copy", "prepare-footprint-bindings", "observe-footprint-ui", "prepare-footprint-dependencies", "observe-footprint-manager-route"]) {
    await f.invoke(wrap(bound(action)));
  }
  await f.invoke(wrap({ ...bound("observe-footprint-source"), footprintUuid: "c".repeat(16) }));
  assert.deepEqual(f.allocations, ["preparation"]);
  assert.deepEqual(f.calls.map(row => row["method"]), ["run", "observeWorkerStartupAssignments", "observeWorkerStartupActor",
    "observeWorkerStartupFootprint", "prepareWorkerStartupFootprintCopy", "prepareWorkerStartupFootprintBindings",
    "observeWorkerStartupFootprintUi", "prepareWorkerStartupFootprintDependencies", "observeWorkerStartupFootprintManagerRoute", "observeWorkerStartupFootprintSource"]);
  for (const row of f.calls.slice(1, -1)) { assert.deepEqual(structuredClone(row["args"]), [operationId, expectedBindingSha256]); }
  assert.deepEqual(structuredClone(f.calls.at(-1)?.["args"]), [operationId, expectedBindingSha256, { footprintUuid: "c".repeat(16) }]);
  const bindings = wrap(bound("prepare-footprint-bindings"));
  f.failNext(); await assert.rejects(f.invoke(bindings), /consumed stage/u);
  await f.invoke(wrap({ action: "inspect", operationId })); assert.deepEqual(f.allocations, ["preparation"]);
  f.replaceMethod(); const count = f.calls.length;
  await assert.rejects(f.invoke(bindings), /methods changed/u); assert.equal(f.calls.length, count);
});
void test("registered preparation schema rejects wrong purpose and injected authority before allocation", async () => {
  const f = await fixture();
  for (const request of [bound("prepare-footprint-bindings"), bound("observe-footprint-ui"), bound("prepare-footprint-dependencies"), bound("observe-footprint-manager-route"),
    { action: "footprint-copy-preparation", request: { ...bound("prepare-footprint-bindings"), operationId: "pcb209-startup-wrong" } },
    { action: "footprint-copy-preparation", request: { ...bound("prepare-footprint-bindings"), requestLimit: 9999 } },
    { action: "footprint-copy-preparation", request: { action: "create", operationId, confirmWrite: true } }]) {
    await assert.rejects(f.invoke({ request }));
  }
  assert.deepEqual(f.allocations, []); assert.deepEqual(f.calls, []);
  await f.invoke(wrap(launch));
  await assert.rejects(f.invoke({ request: { ...launch, operationId: "pcb209-startup-replacement" } }), /purpose cannot change/u);
  assert.deepEqual(f.allocations, ["preparation"]);
});
void test("queued preparation launch prevents a purpose switch before its lifecycle reservation exists", async () => {
  const entered = Promise.withResolvers<null>(), f = await fixture(), release = Promise.withResolvers<null>();
  const held = f.gate.run(async () => { entered.resolve(null); await release.promise; }); await entered.promise;
  const pending = f.invoke(wrap(launch));
  try {
    await assert.rejects(f.invoke({ request: { ...launch, operationId: "pcb209-startup-queued-replacement" } }), /purpose cannot change/u);
    assert.deepEqual(f.calls, []); assert.deepEqual(f.allocations, ["preparation"]);
  } finally { release.resolve(null); await held; await pending; }
});
void test("offline preparation discovery uses the registered strict action schema without execution authority", () => {
  const response = queryOfflineApi(apiRequestSchema.parse({ action: "footprint-copy-preparation", query: { includeSchemas: true } }));
  const discovery = z.record(z.string(), z.unknown()).parse(response.result);
  assert.equal(discovery["toolWrapperAction"], "footprint-copy-preparation"); assert.equal(discovery["executionAuthorized"], false);
  for (const request of [launch, bound("prepare-footprint-bindings"), bound("observe-footprint-ui"), bound("prepare-footprint-dependencies"), bound("observe-footprint-manager-route")]) {
    const validation = queryOfflineApi(apiRequestSchema.parse({ action: "footprint-copy-preparation-validate", query: { request } }));
    const result = z.record(z.string(), z.unknown()).parse(validation.result);
    assert.equal(result["valid"], true); assert.equal(result["executionAuthorized"], false);
    assert.equal(currentPcb209WorkerStartupToolRequestSchema.safeParse(wrap(request).request).success, true);
  }
});
