import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { z } from "zod";
import { apiRequestSchema, queryOfflineApi } from "../src/offline-api.ts";
import { publicSystemCatalogRequestSchema } from "../src/public-system-catalog.ts";
import { inventoryExtensionApiCoverage } from "../src/extension-api-coverage.ts";

interface Input { request: z.infer<typeof publicSystemCatalogRequestSchema> }
type Callback = (input: Input) => Promise<Record<string, unknown>>;
const request = publicSystemCatalogRequestSchema.parse({ action: "search-footprints", query: "R0603", page: 1, pageSize: 5, confirmNetwork: true });

void test("actual component catalog registration forwards strict requests without app or SDK authority", async () => {
  const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");
  const start = source.indexOf('registerFacadeTool(\n  "easyeda_control_catalog_components",');
  const end = source.indexOf("\n);\n", start); assert.ok(start > 0 && end > start);
  const calls: unknown[] = [];
  let expectedRequest = request, fail = false, inputSchema: z.ZodType | undefined, invoke: Callback | undefined;
  runInNewContext(stripTypeScriptTypes(source.slice(start, end + "\n);".length)), {
    z, publicSystemCatalogRequestSchema, guarded: (handler: Callback): Callback => handler,
    registerFacadeTool: (name: string, config: { inputSchema: { request: z.ZodType }; annotations: object }, handler: Callback): void => {
      assert.equal(name, "easyeda_control_catalog_components");
      assert.deepEqual(structuredClone(config.annotations), { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true });
      inputSchema = z.object(config.inputSchema); invoke = handler;
    },
    readPublicSystemCatalog: (...args: unknown[]): Promise<object> => {
      calls.push(args); assert.equal(args.length, 1); assert.equal(args[0], expectedRequest);
      return fail ? Promise.reject(new Error("synthetic refusal")) : Promise.resolve({ ok: true });
    },
  });
  assert.ok(inputSchema); assert.ok(invoke);
  for (const candidate of [{ ...request, confirmNetwork: false }, { ...request, pageSize: 21 },
    { ...request, url: "https://example.com" }, { ...request, token: "secret" },
    { ...request, libraryUuid: "b".repeat(32) }, { ...request, action: "write" }]) {
    assert.equal(inputSchema.safeParse({ request: candidate }).success, false);
  }
  assert.deepEqual(calls, []);
  assert.equal(inputSchema.safeParse({ request }).success, true);
  assert.deepEqual(structuredClone(await invoke({ request })), { result: { ok: true } });
  for (const action of ["search-symbols", "search-devices"]) {
    expectedRequest = publicSystemCatalogRequestSchema.parse({ ...request, action });
    assert.equal(inputSchema.safeParse({ request: expectedRequest }).success, true);
    assert.deepEqual(structuredClone(await invoke({ request: expectedRequest })), { result: { ok: true } });
  }
  expectedRequest = publicSystemCatalogRequestSchema.parse({ action: "search-symbols-by-name", name: "R0603", confirmNetwork: true });
  assert.equal(inputSchema.safeParse({ request: expectedRequest }).success, true);
  for (const extra of [{ libraryUuid: "b".repeat(32) }, { url: "https://example.com" }, { page: 1 }, { confirmNetwork: false }]) {
    assert.equal(inputSchema.safeParse({ request: { ...expectedRequest, ...extra } }).success, false);
  }
  assert.deepEqual(structuredClone(await invoke({ request: expectedRequest })), { result: { ok: true } });
  fail = true; await assert.rejects(invoke({ request: expectedRequest }), /synthetic refusal/u); assert.equal(calls.length, 5);
});

void test("component catalog discovery exposes all six exact actions but grants no execution", () => {
  const catalog = queryOfflineApi(apiRequestSchema.parse({ action: "catalog-components", query: { includeSchemas: true } }));
  assert.equal(catalog.offline, true);
  assert.ok(typeof catalog.result === "object" && catalog.result !== null && "total" in catalog.result);
  assert.equal(catalog.result.total, 6);
  for (const candidate of [request, { action: "get-symbol", symbolUuid: "a".repeat(32), confirmNetwork: true },
    { action: "get-device", deviceUuid: "b".repeat(32), confirmNetwork: true },
    { ...request, action: "search-symbols" }, { ...request, action: "search-devices" },
    { action: "search-symbols-by-name", name: "R0603", confirmNetwork: true }]) {
    const reply = queryOfflineApi(apiRequestSchema.parse({ action: "catalog-components-validate", query: { request: candidate } }));
    assert.ok(typeof reply.result === "object" && reply.result !== null && "valid" in reply.result && "executionAuthorized" in reply.result);
    assert.equal(reply.result.valid, true); assert.equal(reply.result.executionAuthorized, false);
  }
  assert.throws(() => apiRequestSchema.parse({ action: "catalog-components", query: { action: "get-device" } }));
});

void test("component coverage retains vendor HTTP scope without claiming desktop SDK support", () => {
  const rows = inventoryExtensionApiCoverage();
  for (const path of ["eda.lib_Footprint.search", "eda.lib_Symbol.search", "eda.lib_Device.search", "eda.lib_Symbol.get", "eda.lib_Device.get"]) {
    const row = rows.find((entry) => entry.path === path); assert.ok(row);
    const route = row.routes.find((entry) => entry.tool === "easyeda_control_catalog_components"); assert.ok(route);
    assert.equal(route.implementation, "vendor-http-task-equivalent");
    assert.equal(route.executionState, "available-with-network-guards");
    assert.equal(row.completeDeclaredContractSupported, false);
    assert.equal(row.currentGenerationLiveValidation, "not-recorded");
    assert.match(route.scope, /not public SDK execution/u);
    assert.match(route.scope, /pin mapping/u);
  }
});
