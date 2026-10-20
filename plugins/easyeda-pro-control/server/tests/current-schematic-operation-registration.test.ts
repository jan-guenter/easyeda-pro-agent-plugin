import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import { z } from "zod";
import { CURRENT_SCHEMATIC_OPERATION_PURPOSE, currentSchematicOperationRequestSchema,
  queryCurrentSchematicOperation, validateCurrentSchematicOperationArguments } from "../src/current-schematic-operation.ts";
import { currentSchematicRenameOperationRequestSchema } from "../src/current-schematic-rename-operation.ts";
import { SerializedGate } from "../src/engine.ts";
import { apiRequestSchema, queryOfflineApi } from "../src/offline-api.ts";

const ordinaryTool = "easyeda_control_project_schematic_rename";
const disposableTool = "easyeda_control_disposable_schematic_rename";
const rawWindowsPath = String.raw`C:\Synthetic\Schematic validation.eprj2`;
const openingOperationId = "schematic-operation-opening", operationId = "schematic-operation-baseline";
// SHA-256 of the synthetic Windows path; the actual contract rechecks it.
const target = { projectUuid: "ae1e63d56d3a3edecbcdd98bfcfaf76b1705cdf748b7f35ef5fb8d55fb2a337d",
  branchUuid: "b".repeat(32), ownerUuid: "c".repeat(32), schematicUuid: "d".repeat(16) };
const opening = { action: "open", operationId: openingOperationId, rawWindowsPath, projectUuid: target.projectUuid,
  documentUuid: "e".repeat(16), expectedSourceSha256: "f".repeat(64), rename: { target, desiredTitle: "Renamed SCH" },
  acceptNormalOpenEffects: true };
const begin = { action: "baseline-begin", operationId, openingOperationId, target, desiredTitle: "Renamed SCH", acceptSchematicRename: true };
const batch = { action: "advance-batch", operationId, steps: [
  { expectedPhase: "rename-write", confirmWrite: true, acceptSchematicRename: true },
  { expectedPhase: "rename-close", confirmNormalClose: true, acceptUnknownFileEffects: true },
] };
interface Input { request: unknown; expectedFingerprint?: unknown }
type Handler = (input: Input) => Promise<unknown>;
interface Registered { handler: Handler; schema: z.ZodType }
interface Observation { route: "ordinary" | "disposable"; request: unknown; fingerprint: unknown; coordinator: object }
interface Fixture {
  invoke: (input: unknown, tool?: string) => Promise<unknown>; invokeRaw: Handler; allocations: object[];
  openerAllocations: object[]; history: unknown[]; calls: Observation[]; gate: SerializedGate; failNext: () => void;
}
async function registration(retainedOpener: boolean): Promise<Fixture> {
  const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");
  const start = source.indexOf(`if (facadeToolRegistered(facadeMode, "${disposableTool}")) {`);
  const end = source.indexOf("\nconst transport =", start); assert.ok(start > 0 && end > start);
  const allocations: object[] = [], calls: Observation[] = [], history: unknown[] = [], openerAllocations: object[] = [];
  const engine = {}, gate = new SerializedGate(), opener = {}, ownedRuntime = { status: (): { state: string } => ({ state: "owned" }) };
  const registered = new Map<string, Registered>(); let fail = false;
  function CurrentDisposableOpenCoordinator(this: object, options: { engine: unknown; assertOwner: () => void; runtime: () => unknown }): void {
    assert.equal(options.engine, engine); options.assertOwner(); assert.equal(options.runtime(), ownedRuntime); openerAllocations.push(this);
  }
  const scope = vm.createContext({ z, currentSchematicOperationRequestSchema, currentSchematicRenameOperationRequestSchema,
    CURRENT_SCHEMATIC_OPERATION_PURPOSE, currentSymbolOperationToolOutputSchema: z.unknown(), privateFingerprintSchema: z.unknown(),
    currentSchematicRenameOperationCoordinator: undefined, currentDisposableOpenCoordinator: retainedOpener ? opener : undefined,
    engine, facadeMode: "calculation-only", facadeToolRegistered: (): boolean => true,
    process: { env: { EASYEDA_ASSETS_ROOT: "/synthetic/assets" } }, closedSymbolIndexReservation: undefined, scheduledShutdown: undefined,
    ordinaryLaunchRuntime: ownedRuntime, windowsRuntime: ownedRuntime, ownedWindowsRuntime: (): typeof ownedRuntime => ownedRuntime,
    CurrentDisposableOpenCoordinator,
    CurrentSchematicRenameOperationCoordinator: class {
      public constructor(selectedEngine: unknown, selectedOpener: unknown) {
        assert.equal(selectedEngine, engine); assert.equal(selectedOpener, retainedOpener ? opener : openerAllocations[0]); allocations.push(this);
      }
      public run(request: unknown): Promise<unknown> { return this.observe("disposable", request); }
      public runOrdinary(request: unknown, fingerprint?: unknown): Promise<unknown> { return this.observe("ordinary", request, fingerprint); }
      private observe(route: Observation["route"], request: unknown, fingerprint?: unknown): Promise<unknown> {
        calls.push({ route, request, fingerprint, coordinator: this });
        if (fail) { fail = false; return Promise.reject(new Error("consumed synthetic phase")); }
        return Promise.resolve({ originalOwnerRetained: true, executionAuthorized: false });
      }
    },
    inspectCurrentSchematicRenameHistory: (id: string, purpose?: string): Promise<unknown> => {
      history.push({ kind: "rename", id, purpose }); return Promise.resolve({ historicalOnly: true, originalOwnerRetained: false });
    },
    inspectCurrentSchematicOpeningHistory: (id: string): Promise<unknown> => {
      history.push({ kind: "opening", id }); return Promise.resolve({ historicalOnly: true, originalOwnerRetained: false });
    },
    guarded: (task: Handler): Handler => task, bridgeGate: gate,
    server: { registerTool: (name: string, config: { inputSchema: z.ZodType; annotations: Record<string, boolean> }, handler: Handler): void => {
      assert.ok(name === ordinaryTool || name === disposableTool);
      assert.deepEqual(structuredClone(config.annotations), { readOnlyHint: false, destructiveHint: true, idempotentHint: false });
      registered.set(name, { schema: config.inputSchema, handler });
    } },
  });
  // Exercise actual registration and callbacks with synthetic owners. Lifecycle
  // And authenticated runtime behavior have separate coordinator tests.
  vm.runInContext(stripTypeScriptTypes(source.slice(start, end)), scope);
  const ordinary = registered.get(ordinaryTool); assert.ok(ordinary);
  return { allocations, openerAllocations, history, calls, gate, invokeRaw: ordinary.handler, failNext: (): void => { fail = true; },
    invoke: async (input, tool = ordinaryTool) => {
      const entry = registered.get(tool); assert.ok(entry);
      const parsed = entry.schema.parse(input); assert.ok(parsed !== null && typeof parsed === "object" && "request" in parsed);
      const result = await entry.handler({ request: parsed.request, ...("expectedFingerprint" in parsed ? { expectedFingerprint: parsed.expectedFingerprint } : {}) });
      assert.notEqual(result, undefined); return result;
    } };
}

void test("ordinary SCH registration inspects purpose-bound history without allocating or reconstructing continuation", async () => {
  for (const retainedOpener of [false, true]) {
    const fixture = await registration(retainedOpener);
    await fixture.invoke({ request: { action: "inspect", operationId } });
    await fixture.invoke({ request: { action: "inspect-opening", operationId: openingOperationId } });
    assert.deepEqual(fixture.history, [{ kind: "rename", id: operationId, purpose: CURRENT_SCHEMATIC_OPERATION_PURPOSE },
      { kind: "opening", id: openingOperationId }]);
    for (const request of [begin, batch, { action: "advance", operationId, step: { expectedPhase: "baseline-admit" } },
      { action: "observe", operationId: openingOperationId }, { action: "cleanup", operationId, confirmAbort: true },
      { action: "request-normal-close", operationId: openingOperationId, confirmNormalClose: true, acceptUnknownFileEffects: true },
      { action: "retire-after-termination", operationId: openingOperationId, confirmRetire: true, acceptUnknownFileEffects: true }]) {
      await assert.rejects(fixture.invoke({ request }), /cannot reconstruct ownership/u);
    }
    assert.equal(fixture.allocations.length, 0); assert.equal(fixture.openerAllocations.length, 0); assert.equal(fixture.calls.length, 0);
  }
});

void test("ordinary SCH inspection bypasses a held mutation gate while opening remains serialized", async () => {
  const entered = Promise.withResolvers<boolean>(), fixture = await registration(false), released = Promise.withResolvers<boolean>();
  const held = fixture.gate.run(async () => { entered.resolve(true); await released.promise; }); await entered.promise;
  const pending = fixture.invoke({ request: opening });
  try {
    for (const action of ["inspect", "inspect-opening"]) {
      await fixture.invoke({ request: { action, operationId } });
      await assert.rejects(fixture.invokeRaw({ request: { action, operationId, code: "caller()" } }));
      await assert.rejects(fixture.invokeRaw({ request: { action, operationId }, expectedFingerprint: {} }));
    }
    assert.equal(fixture.history.length, 2); assert.equal(fixture.allocations.length, 0); assert.equal(fixture.calls.length, 0);
  } finally { released.resolve(true); await held; await pending; }
  assert.equal(fixture.openerAllocations.length, 1); assert.equal(fixture.allocations.length, 1); assert.equal(fixture.calls.length, 1);
});

void test("ordinary and disposable SCH registrations share their single original coordinator through failures", async () => {
  const expectedFingerprint = { synthetic: true }, fixture = await registration(true);
  await fixture.invoke({ request: opening, expectedFingerprint });
  await fixture.invoke({ request: begin });
  await fixture.invoke({ request: { ...begin, confirmDisposableProject: true } }, disposableTool);
  fixture.failNext(); await assert.rejects(fixture.invoke({ request: batch }), /consumed synthetic phase/u);
  await fixture.invoke({ request: { action: "inspect", operationId } });
  assert.equal(fixture.allocations.length, 1); assert.equal(fixture.openerAllocations.length, 0); assert.equal(fixture.history.length, 0);
  assert.deepEqual(fixture.calls.map(call => call.route), ["ordinary", "ordinary", "disposable", "ordinary", "ordinary"]);
  assert.ok(fixture.calls.every(call => call.coordinator === fixture.allocations[0]));
  assert.deepEqual(fixture.calls[0]?.fingerprint, expectedFingerprint);
  assert.ok(fixture.calls.slice(1).every(call => call.fingerprint === undefined));
});

void test("ordinary SCH registration preserves omitted or legacy disposal confirmation at dispatch", async () => {
  for (const request of [opening, { ...opening, confirmDisposableProject: true }]) {
    const fixture = await registration(false);
    await fixture.invoke({ request });
    assert.equal(fixture.calls.length, 1); assert.deepEqual(fixture.calls[0]?.request, request);
    assert.equal(Object.hasOwn(fixture.calls[0]?.request ?? {}, "confirmDisposableProject"), Object.hasOwn(request, "confirmDisposableProject"));
  }
  // The distinct disposable route still requires its own explicit confirmation.
  const fixture = await registration(false);
  await assert.rejects(fixture.invoke({ request: begin }, disposableTool));
  assert.equal(fixture.allocations.length, 0); assert.equal(fixture.calls.length, 0);
});

void test("ordinary SCH registration rejects false disposal confirmation and outer or nested injection before allocation", async () => {
  const fixture = await registration(false);
  for (const extra of [{ code: "caller()" }, { runtime: {} }, { clock: {} }, { verifier: {} }, { title: "replacement" }]) {
    await assert.rejects(fixture.invoke({ request: opening, ...extra }));
    await assert.rejects(fixture.invoke({ request: { ...opening, ...extra } }));
  }
  for (const request of [{ ...opening, confirmDisposableProject: false },
    { ...opening, acceptNormalOpenEffects: false }, { ...opening, projectUuid: "a".repeat(64) },
    { ...opening, rename: { ...opening.rename, target: { ...target, projectUuid: "a".repeat(64) } } },
    { ...opening, rename: { ...opening.rename, code: "caller()" } },
    { ...opening, rename: { ...opening.rename, target: { ...target, symbolUuid: "e".repeat(32) } } },
    { ...opening, acceptUnqualifiedSchematicStartupEffects: true },
    { ...batch, steps: [batch.steps[0], { ...batch.steps[1], caller: "injected" }] }]) {
    await assert.rejects(fixture.invoke({ request }));
  }
  await assert.rejects(fixture.invokeRaw({ request: { ...opening, rename: { ...opening.rename, desiredTitle: "unsupported I" } } }));
  assert.equal(fixture.allocations.length, 0); assert.equal(fixture.openerAllocations.length, 0); assert.equal(fixture.calls.length, 0);
});

void test("ordinary SCH registration rejects replacement fingerprints on every non-open phase before dispatch", async () => {
  const fixture = await registration(true); await fixture.invoke({ request: opening });
  const prior = fixture.calls.length;
  for (const request of [begin, batch, { action: "inspect", operationId }, { action: "inspect-opening", operationId: openingOperationId },
    { action: "observe", operationId: openingOperationId }, { action: "cleanup", operationId, confirmAbort: true }]) {
    await assert.rejects(fixture.invoke({ request, expectedFingerprint: {} }));
  }
  assert.equal(fixture.calls.length, prior); assert.equal(fixture.history.length, 0); assert.equal(fixture.allocations.length, 1);
});

void test("ordinary SCH offline schema reports ordinary scope and historical validation without execution authority", () => {
  const discovery = queryCurrentSchematicOperation({ includeSchemas: true });
  assert.equal(discovery["tool"], ordinaryTool); assert.equal(discovery["purpose"], CURRENT_SCHEMATIC_OPERATION_PURPOSE);
  assert.equal(discovery["validationOnly"], false); assert.equal(discovery["ordinaryProjectsSupported"], true);
  assert.equal(discovery["historicalConnectedValidation"], "installed203733-ordinary-schematic-title-only-lifecycle");
  assert.equal(discovery["connectedValidation"], false); assert.equal(discovery["invocationEnabledByDiscovery"], false);
  assert.equal(discovery["executionAuthorized"], false); assert.notEqual(discovery["inputSchema"], undefined);
  assert.deepEqual(queryOfflineApi(apiRequestSchema.parse({ action: "project-schematic-operation", query: { includeSchemas: true } })).result, discovery);
  for (const request of [opening, { ...opening, confirmDisposableProject: true }, begin, batch, { action: "inspect-opening", operationId: openingOperationId }]) {
    const result = queryOfflineApi(apiRequestSchema.parse({ action: "project-schematic-operation-validate", query: { request } })).result;
    assert.deepEqual(result, validateCurrentSchematicOperationArguments(request));
    assert.equal(z.object({ valid: z.literal(true), executionAuthorized: z.literal(false) }).safeParse(result).success, true);
  }
  for (const request of [{ ...opening, confirmDisposableProject: false }, { ...begin, expectedFingerprint: {} },
    { ...batch, steps: [batch.steps[0], { expectedPhase: "verification-start", acceptNormalOpenEffects: true }] }]) {
    const result = queryOfflineApi(apiRequestSchema.parse({ action: "project-schematic-operation-validate", query: { request } })).result;
    assert.equal(z.object({ valid: z.literal(false), executionAuthorized: z.literal(false) }).safeParse(result).success, true);
  }
});
