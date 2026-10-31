/** Actual registered index callback and schemas, with inert lifecycle peers.
 * This verifies routing/ownership refusal, not a Windows launch or live CAD. */
/* oxlint-disable max-classes-per-file -- Distinct inert lifecycle classes preserve the production instanceof and fixed-purpose routing checks. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import { parse } from "acorn";
import { z } from "zod";
import { SerializedGate } from "../src/engine.ts";
import { currentPcb209WorkerStartupToolRequestSchema } from "../src/current-pcb-209-empty-startup-validation.ts";
import { apiRequestSchema, queryOfflineApi } from "../src/offline-api.ts";

type Row = Record<string, unknown>;
type Handler = (input: { request: unknown }) => Promise<unknown>;
const expectedBindingSha256 = "a".repeat(64), operationId = "footprint-preparation-registration";
const wrap = (request: object): { request: object } => ({ request: { action: "footprint-copy-preparation", request } });
const route = (request: object): { request: object } => ({ request: { action: "footprint-copy-route-preparation", request } });
const launch = { action: "launch", operationId, confirmValidationOnly: true, confirmDiagnosticLaunch: true, acceptExistingProfileEffects: true };
const bound = (action: string): object => ({ action, operationId, expectedBindingSha256 });

/** Select the actual startup state, dispatcher and registration independently
 * of unrelated historical dispatchers and their erased type padding. */
function startupRegistration(source: string): string {
  const blocks = parse(source, { ecmaVersion: "latest", sourceType: "module" }).body.flatMap(statement =>
    statement.type === "IfStatement" && statement.consequent.type === "BlockStatement" && statement.consequent.body.some(node =>
      node.type === "VariableDeclaration" && node.declarations.some(declaration => declaration.id.type === "Identifier" && declaration.id.name === "runStartup")) ? [statement.consequent] : []);
  assert.equal(blocks.length, 1); const block = blocks[0]; assert.ok(block);
  const declarations = ["startupOriginal", "startupCalls", "combinedHistoricalOriginal", "runStartup"].map(name => {
    const matches = block.body.filter(node => node.type === "VariableDeclaration" && node.declarations.length === 1 &&
      node.declarations[0]?.id.type === "Identifier" && node.declarations[0].id.name === name);
    assert.equal(matches.length, 1); const node = matches[0]; assert.ok(node?.type === "VariableDeclaration");
    assert.equal(node.kind, name === "runStartup" ? "const" : "let");
    assert.ok(node.end > node.start && node.end - node.start < 24_000); return source.slice(node.start, node.end);
  });
  const registrations = block.body.filter(node => node.type === "IfStatement" && node.consequent.type === "BlockStatement" &&
    node.consequent.body.some(statement => statement.type === "ExpressionStatement" && statement.expression.type === "CallExpression" &&
      statement.expression.callee.type === "MemberExpression" && statement.expression.callee.object.type === "Identifier" &&
      statement.expression.callee.object.name === "server" && statement.expression.callee.property.type === "Identifier" &&
      statement.expression.callee.property.name === "registerTool" && statement.expression.arguments[0]?.type === "Literal" &&
      statement.expression.arguments[0].value === "easyeda_control_pcb209_worker_startup"));
  assert.equal(registrations.length, 1); const registration = registrations[0]; assert.ok(registration);
  assert.ok(registration.end > registration.start && registration.end - registration.start < 16_000);
  return [...declarations, source.slice(registration.start, registration.end)].join("\n");
}

async function fixture(): Promise<Readonly<{ invoke: Handler; calls: readonly Row[]; allocations: readonly string[];
  gate: SerializedGate; replaceMethod: () => void; replaceRouteMethod: () => void; failNext: () => void }>> {
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
  class RoutePreparation extends Base { public constructor(options: ConstructorParameters<typeof Base>[1]) { super("route-preparation", options); } }
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
    "observeWorkerStartupFootprintRoute", "observeStartupFootprintRoute",
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
    CurrentFootprintCopyRoutePreparationLifecycle: RoutePreparation,
    CurrentPcb209EmptyStartupLifecycle: Empty, CurrentPcb209RatlineStartupLifecycle: Ratline, CurrentPcb209RatlineContinuationLifecycle: Continuation,
    diagnostic209: true, facadeMode: "public-utilities-only", facadeToolRegistered: (): boolean => true,
    process: { env: { EASYEDA_ASSETS_ROOT: "/synthetic/assets", WSL_DISTRO_NAME: "synthetic" } },
    resolve: (): string => "/synthetic/plugin", retainedControlRoot: { path: "/synthetic/control" }, controlDataDirectory: (): string => "/synthetic/control",
    CURRENT_PCB_DIAGNOSTIC_PROFILE: { powershell: { sha256: "a".repeat(64), bytes: 1 } }, engine, upstream, bridgeGate: gate,
    windowsRuntime: undefined, ordinaryLaunchRuntime: undefined, currentPcbWorkerStartupLifecycle: undefined, currentFootprintMainLifecycle: undefined, currentFootprintHeldCacheValidation: undefined,
    currentDisposableOpenCoordinator: undefined, currentPcbRenameOperationCoordinator: undefined, currentSchematicRenameOperationCoordinator: undefined,
    closedSymbolIndexReservation: undefined, closedSymbolUnreservedFailure: { observed: false }, scheduledShutdown: undefined,
    currentPcbDiagnosticLifecycle: undefined, currentPcbStringPrecreateLifecycle: undefined,
    guarded: (registered: Handler): Handler => async (input): Promise<unknown> => { const result = await registered(input); return result; },
    server: { registerTool: (name: string, config: { inputSchema: z.ZodType; annotations: object }, registered: Handler): void => {
      assert.equal(name, "easyeda_control_pcb209_worker_startup");
      assert.deepEqual(structuredClone(config.annotations), { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true });
      handler = registered;
    } },
  });
  const source = stripTypeScriptTypes(await readFile(new URL("../src/index.ts", import.meta.url), "utf8"));
  const helperStart = source.indexOf("function disposableOwnData(");
  const helperEnd = source.indexOf("\n}", source.indexOf("function disposableOwnerMethod(", helperStart)) + 2;
  assert.ok(helperStart > 0 && helperEnd > helperStart);
  for (const selected of [source.slice(helperStart, helperEnd), startupRegistration(source)]) {
    assert.ok(selected.length > 0 && selected.length < 40_000);
    vm.runInContext(selected.replaceAll("import.meta.dirname", '"/synthetic/server/src"'), scope);
  }
  assert.ok(handler !== null);
  return { invoke: handler, calls, allocations, gate, failNext: (): void => { fail = true; }, replaceMethod: (): void => {
    Object.defineProperty(Preparation.prototype, "prepareWorkerStartupFootprintBindings", { value: (): never => assert.fail("Replacement must not execute") });
  }, replaceRouteMethod: (): void => {
    Object.defineProperty(RoutePreparation.prototype, "observeWorkerStartupFootprintRoute", { value: (): never => assert.fail("Replacement must not execute") });
  } };
}
void test("registered route preparation retains its own purpose and original observation receiver", async () => {
  const f = await fixture(), routeId = "footprint-route-registration";
  const stage = { action: "observe-footprint-route", operationId: routeId, expectedBindingSha256 };
  for (const request of [{ ...stage, requestLimit: 9999 }, { ...stage, operationId }, { ...stage, operationId: `${routeId}\n` },
    { ...stage, action: "create" }, { ...stage, action: "save" }]) {
    await assert.rejects(f.invoke(route(request)));
  }
  assert.deepEqual(f.allocations, []);
  await f.invoke(route({ ...launch, operationId: routeId }));
  await f.invoke(route(stage));
  assert.deepEqual(f.allocations, ["route-preparation"]);
  assert.deepEqual(f.calls.map(row => row["method"]), ["run", "observeWorkerStartupFootprintRoute"]);
  assert.deepEqual(structuredClone(f.calls[1]?.["args"]), [routeId, expectedBindingSha256]);
  await assert.rejects(f.invoke(wrap(launch)), /purpose cannot change/u);
  f.replaceRouteMethod(); const count = f.calls.length;
  await assert.rejects(f.invoke(route(stage)), /methods changed/u); assert.equal(f.calls.length, count);
});
void test("offline route preparation matches its registered strict schema without enabling a writer", () => {
  const response = queryOfflineApi(apiRequestSchema.parse({ action: "footprint-copy-route-preparation", query: { includeSchemas: true } }));
  const discovery = z.record(z.string(), z.unknown()).parse(response.result);
  assert.equal(discovery["toolWrapperAction"], "footprint-copy-route-preparation"); assert.equal(discovery["executionAuthorized"], false);
  const request = { action: "observe-footprint-route", operationId: "footprint-route-offline", expectedBindingSha256 };
  const validation = queryOfflineApi(apiRequestSchema.parse({ action: "footprint-copy-route-preparation-validate", query: { request } }));
  assert.equal(z.record(z.string(), z.unknown()).parse(validation.result)["valid"], true);
  assert.equal(currentPcb209WorkerStartupToolRequestSchema.safeParse({ action: "footprint-copy-route-preparation", request }).success, true);
});
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
