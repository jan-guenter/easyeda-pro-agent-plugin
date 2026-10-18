import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import { z } from "zod";
import { currentPcbRenameOperationRequestSchema, queryCurrentPcbRenameOperation, validateCurrentPcbRenameOperationArguments } from "../src/current-pcb-rename-operation.ts";
import { apiRequestSchema, queryOfflineApi } from "../src/offline-api.ts";

const openingOperationId = "pcb-rename-opening", operationId = "pcb-rename-registration";
const begin = { action: "baseline-begin", operationId, openingOperationId, target: {
  projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), ownerUuid: "c".repeat(32), pcbUuid: "d".repeat(16) },
  desiredTitle: "Renamed PCB", confirmDisposableProject: true, acceptPcbRename: true };
type Handler = (input: { request: unknown }) => Promise<unknown>;
async function registration(retainedOpener: boolean): Promise<{
  invoke: (input: unknown) => Promise<unknown>; allocations: unknown[][]; history: string[]; calls: unknown[]; failNext: () => void;
}> {
  const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");
  const start = source.indexOf('if (facadeToolRegistered(facadeMode, "easyeda_control_disposable_pcb_rename")) {');
  const end = source.indexOf("\nconst transport =", start); assert.ok(start > 0 && end > start);
  const allocations: unknown[][] = [], calls: unknown[] = [], engine = {}, history: string[] = [], opener = {};
  let fail = false, handler: Handler | undefined, inputSchema: z.ZodType | undefined;
  const scope = vm.createContext({ z, currentPcbRenameOperationRequestSchema, currentSymbolOperationToolOutputSchema: z.unknown(),
    currentPcbRenameOperationCoordinator: undefined, currentDisposableOpenCoordinator: retainedOpener ? opener : undefined,
    engine, facadeMode: "calculation-only", facadeToolRegistered: (): boolean => true,
    CurrentPcbRenameOperationCoordinator: class {
      private readonly selectedEngine: unknown;
      public constructor(selectedEngine: unknown, selectedOpener: unknown) {
        assert.equal(selectedEngine, engine); assert.equal(selectedOpener, opener); allocations.push([selectedEngine, selectedOpener]);
        this.selectedEngine = selectedEngine;
      }
      public run(request: unknown): Promise<unknown> {
        assert.equal(this.selectedEngine, engine);
        calls.push(request); if (fail) { fail = false; return Promise.reject(new Error("consumed fixture phase")); }
        return Promise.resolve({ originalOwnerRetained: true, executionAuthorized: false });
      }
    },
    inspectCurrentPcbRenameHistory: (selected: string): Promise<unknown> => {
      history.push(selected); return Promise.resolve({ historicalOnly: true, originalOwnerRetained: false, executionAuthorized: false });
    },
    serializedGuarded: (callback: Handler, options: { allowDuringOrphanRisk: boolean }): Handler => {
      assert.deepEqual(Object.keys(options), ["allowDuringOrphanRisk"]); assert.equal(options.allowDuringOrphanRisk, true); return callback;
    },
    server: { registerTool: (name: string, config: { inputSchema: z.ZodType; annotations: Record<string, boolean> }, registered: Handler): void => {
      assert.equal(name, "easyeda_control_disposable_pcb_rename");
      assert.deepEqual(structuredClone(config.annotations), { readOnlyHint: false, destructiveHint: true, idempotentHint: false });
      inputSchema = config.inputSchema; handler = registered;
    } },
  });
  vm.runInContext(stripTypeScriptTypes(source.slice(start, end)), scope);
  assert.ok(handler !== undefined && inputSchema !== undefined);
  const selectedHandler = handler, selectedSchema = inputSchema;
  return { allocations, calls, history, failNext: (): void => { fail = true; },
    invoke: async input => {
      const parsed = selectedSchema.parse(input); assert.ok(parsed !== null && typeof parsed === "object" && "request" in parsed);
      const response = await selectedHandler({ request: parsed.request }); assert.notEqual(response, undefined); return response;
    } };
}

void test("PCB registration inspects history without allocating an opener, operation owner or runtime", async () => {
  for (const retained of [false, true]) {
    const route = await registration(retained);
    const result = await route.invoke({ request: { action: "inspect", operationId } });
    assert.deepEqual(structuredClone(result), { result: { historicalOnly: true, originalOwnerRetained: false, executionAuthorized: false } });
    assert.deepEqual(route.history, [operationId]); assert.deepEqual(route.allocations, []); assert.deepEqual(route.calls, []);
    for (const request of [{ action: "advance", operationId, step: { expectedPhase: "baseline-admit" } }, { action: "cleanup", operationId, confirmAbort: true }]) {
      await assert.rejects(route.invoke({ request }), /cannot reconstruct ownership/u);
    }
    if (!retained) { await assert.rejects(route.invoke({ request: begin }), /existing retained disposable opening/u); }
    assert.deepEqual(route.allocations, []);
  }
});

void test("PCB registration retains exactly one operation coordinator from the existing original opener, including after failures", async () => {
  const route = await registration(true);
  await route.invoke({ request: begin }); assert.equal(route.allocations.length, 1); assert.equal(route.calls.length, 1);
  route.failNext(); await assert.rejects(route.invoke({ request: { action: "advance", operationId, step: { expectedPhase: "baseline-admit" } } }), /consumed fixture/u);
  await route.invoke({ request: { action: "inspect", operationId } });
  assert.equal(route.allocations.length, 1); assert.equal(route.calls.length, 3); assert.deepEqual(route.history, []);
});

void test("PCB registration rejects outer and nested injection before retaining or invoking any coordinator", async () => {
  const route = await registration(true);
  for (const extra of [{ expectedFingerprint: {} }, { code: "caller()" }, { runtime: {} }, { clock: {} }, { verifier: {} }, { title: "replacement" }]) {
    await assert.rejects(route.invoke({ request: begin, ...extra }));
    await assert.rejects(route.invoke({ request: { ...begin, ...extra } }));
  }
  await assert.rejects(route.invoke({ request: { ...begin, target: { ...begin.target, symbolUuid: "e".repeat(16) } } }));
  await assert.rejects(route.invoke({ request: { action: "advance", operationId, step: { expectedPhase: "rename-write", confirmWrite: true } } }));
  assert.deepEqual(route.allocations, []); assert.deepEqual(route.calls, []); assert.deepEqual(route.history, []);
});

void test("offline PCB rename discovery and exact argument validation never grant runtime or connected-validation authority", () => {
  const discovery = queryCurrentPcbRenameOperation({ includeSchemas: true });
  assert.equal(discovery["connectedValidation"], false); assert.equal(discovery["ordinaryProjectsSupported"], false);
  assert.equal(discovery["executionAuthorized"], false); assert.equal(discovery["invocationEnabledByDiscovery"], false);
  assert.equal(discovery["tool"], "easyeda_control_disposable_pcb_rename"); assert.notEqual(discovery["inputSchema"], undefined);
  assert.deepEqual(queryOfflineApi(apiRequestSchema.parse({ action: "disposable-pcb-rename", query: { includeSchemas: true } })).result, discovery);
  assert.deepEqual(queryOfflineApi(apiRequestSchema.parse({ action: "disposable-pcb-rename-validate", query: { request: begin } })).result,
    validateCurrentPcbRenameOperationArguments(begin));
  for (const request of [{ ...begin, target: { ...begin.target, documentUuid: "replacement" } }, { ...begin, confirmDisposableProject: false }]) {
    const response = queryOfflineApi(apiRequestSchema.parse({ action: "disposable-pcb-rename-validate", query: { request } }));
    assert.equal(z.object({ valid: z.literal(false), executionAuthorized: z.literal(false) }).safeParse(response.result).success, true);
  }
});
