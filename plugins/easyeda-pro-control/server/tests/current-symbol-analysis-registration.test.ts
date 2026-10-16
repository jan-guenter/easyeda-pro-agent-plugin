import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import { apiRequestSchema, offlineApiToolConfiguration, queryOfflineApi } from "../src/offline-api.ts";
import { isRecord } from "../src/core.ts";

const request = { operationId: "current-baseline-synthetic-analysis" };

void test("retained analysis discovery and exact validation stay offline and non-authorizing", () => {
  const catalog = queryOfflineApi(apiRequestSchema.parse({ action: "baseline-analysis", query: { includeSchemas: true } }));
  assert.equal(catalog.offline, true);
  assert.ok(isRecord(catalog.result));
  assert.equal(catalog.result["invocationEnabledByDiscovery"], false);
  const entries = catalog.result["entries"];
  assert.ok(Array.isArray(entries) && entries.length === 1 && isRecord(entries[0]));
  assert.equal(entries[0]["action"], "baseline-analyze");
  assert.ok(isRecord(entries[0]["inputSchema"]));
  const validated = queryOfflineApi(apiRequestSchema.parse({ action: "baseline-analysis-validate", query: { request } }));
  assert.deepEqual(validated.result, { valid: true, request, executionAuthorized: false });
  assert.deepEqual(offlineApiToolConfiguration.annotations, { readOnlyHint: true, destructiveHint: false, idempotentHint: true });
  const parsed = apiRequestSchema.parse({ action: "baseline-analyze", query: { request } });
  assert.throws(() => queryOfflineApi(parsed), /asynchronous offline API handler/u);
});

void test("retained analysis refuses caller paths, runtimes, unknown fields and noncanonical IDs", () => {
  for (const invalid of [{ ...request, path: "/outside/project.eprj2" }, { ...request, runtime: { node: "/bin/node" } },
    { ...request, code: "caller" }, { operationId: "../other-operation" }, { operationId: "UPPERCASE-ID" },
    { operationId: "underscores_not_allowed" }, { operationId: "short" }, { operationId: "a".repeat(97) }, {}]) {
    assert.equal(apiRequestSchema.safeParse({ action: "baseline-analyze", query: { request: invalid } }).success, false);
    const checked = queryOfflineApi(apiRequestSchema.parse({ action: "baseline-analysis-validate", query: { request: invalid } }));
    assert.ok(isRecord(checked.result));
    assert.equal(checked.result["valid"], false);
    assert.equal(checked.result["executionAuthorized"], false);
  }
});

void test("asynchronous analysis passes only the selected operation and configured runtime to its local reader", async () => {
  const source = await readFile(new URL("../src/offline-api.ts", import.meta.url), "utf8");
  const start = source.indexOf("export async function runOfflineApi(");
  const end = source.indexOf("export function queryOfflineApi(", start);
  assert.ok(start > 0 && end > start);
  const runtime = Object.freeze({ synthetic: "configured-runtime" });
  const expected = Object.freeze({ comparisonComplete: true, executionAuthorized: false });
  const calls: unknown[] = [];
  type Callback = (value: unknown) => Promise<{ offline: boolean; result: unknown }>;
  let invoke: Callback | undefined;
  const scope = vm.createContext({
    register: (handler: Callback): void => { invoke = handler; },
    loadRuntimeMachineProfile: (): Promise<unknown> => { calls.push("profile"); return Promise.resolve({ profile: { runtime } }); },
    analyzeCurrentSymbolBaseline: (operationId: string, selected: unknown): Promise<unknown> => {
      calls.push(operationId, selected); return Promise.resolve(expected);
    },
  });
  vm.runInContext(`${stripTypeScriptTypes(source.slice(start, end).replace("export async function", "async function"))}\nregister(runOfflineApi);`, scope);
  assert.ok(invoke);
  const result = await invoke(apiRequestSchema.parse({ action: "baseline-analyze", query: { request } }));
  assert.equal(result.offline, true); assert.equal(result.result, expected);
  assert.deepEqual(calls, ["profile", request.operationId, runtime]);
});
