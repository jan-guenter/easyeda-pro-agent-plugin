import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { z } from "zod";
import { apiRequestSchema, queryOfflineApi } from "../src/offline-api.ts";
import { publicSystemFootprintRequestSchema } from "../src/public-system-footprint.ts";
import { extensionApiCoverageSummary, inventoryExtensionApiCoverage } from "../src/extension-api-coverage.ts";

interface Input { request: z.infer<typeof publicSystemFootprintRequestSchema> }
type Callback = (input: Input) => Promise<Record<string, unknown>>;
const request = publicSystemFootprintRequestSchema.parse({ footprintUuid: "a".repeat(32), confirmNetwork: true });

void test("actual catalog footprint registration requires explicit network confirmation without SDK or runtime authority", async () => {
  const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");
  const start = source.indexOf('registerFacadeTool(\n  "easyeda_control_catalog_footprint",');
  const end = source.indexOf("\n);\n", start);
  assert.ok(start > 0 && end > start);
  const calls: string[] = [];
  let fail = false, inputSchema: z.ZodType | undefined, invoke: Callback | undefined;
  runInNewContext(stripTypeScriptTypes(source.slice(start, end + "\n);".length)), {
    z, publicSystemFootprintRequestSchema,
    guarded: (handler: Callback): Callback => handler,
    registerFacadeTool: (tool: string, config: { inputSchema: { request: z.ZodType }; annotations: object; description: string }, handler: Callback): void => {
      assert.equal(tool, "easyeda_control_catalog_footprint");
      assert.deepEqual(structuredClone(config.annotations), { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true });
      assert.match(config.description, /HTTPS/u); assert.match(config.description, /confirmNetwork/u);
      // MCP normalizes the raw root shape; the nested operation stays strict.
      inputSchema = z.object(config.inputSchema); invoke = handler;
    },
    readPublicSystemFootprint: (...args: unknown[]): Promise<object> => {
      calls.push("vendor-http"); assert.equal(args.length, 1); assert.equal(args[0], request);
      return fail ? Promise.reject(new Error("synthetic catalog refusal")) : Promise.resolve({ synthetic: true });
    },
  });
  assert.ok(inputSchema); assert.ok(invoke);
  for (const invalid of [
    { request: { footprintUuid: request.footprintUuid } },
    { request: { ...request, confirmNetwork: false } },
    { request: { ...request, libraryUuid: "b".repeat(32) } },
    { request: { ...request, url: "https://example.com" } },
    { request: { ...request, footprintUuid: "A".repeat(32) } },
    { request: { ...request, method: "eda.lib_Footprint.get" } },
    { request: { ...request, token: "credential" } },
  ]) { assert.equal(inputSchema.safeParse(invalid).success, false); }
  assert.deepEqual(calls, []);
  assert.equal(inputSchema.safeParse({ request }).success, true);
  assert.deepEqual(inputSchema.parse({ request, expectedFingerprint: {} }), { request });
  assert.deepEqual(structuredClone(await invoke({ request })), { result: { synthetic: true } });
  assert.deepEqual(calls, ["vendor-http"]);
  fail = true;
  await assert.rejects(invoke({ request }), /synthetic catalog refusal/u);
  assert.deepEqual(calls, ["vendor-http", "vendor-http"]);
});

void test("offline catalog discovery and validation cannot grant network or SDK execution authority", () => {
  const catalog = queryOfflineApi(apiRequestSchema.parse({ action: "catalog-footprint", query: { includeSchemas: true } }));
  assert.equal(catalog.offline, true);
  assert.ok(typeof catalog.result === "object" && catalog.result !== null && "entries" in catalog.result && "invocationEnabledByDiscovery" in catalog.result);
  assert.equal(catalog.result.invocationEnabledByDiscovery, false); assert.ok(Array.isArray(catalog.result.entries));
  assert.equal(catalog.result.entries.length, 1);
  const entry: unknown = catalog.result.entries[0];
  assert.ok(typeof entry === "object" && entry !== null && "implementationKind" in entry && "publicSdkMethodExecuted" in entry && "installedRuntimeAdmission" in entry);
  assert.equal(entry.implementationKind, "vendor-http-task-equivalent"); assert.equal(entry.publicSdkMethodExecuted, false);
  assert.equal(entry.installedRuntimeAdmission, false);
  const serialized = JSON.stringify(catalog.result);
  assert.match(serialized, /confirmNetwork/u); assert.match(serialized, /inputSchema/u);
  for (const [candidate, valid] of [[request, true], [{ footprintUuid: request.footprintUuid }, false],
    [{ ...request, confirmNetwork: false }, false], [{ ...request, libraryUuid: "b".repeat(32) }, false]] as const) {
    const value = queryOfflineApi(apiRequestSchema.parse({ action: "catalog-footprint-validate", query: { request: candidate } }));
    assert.ok(typeof value.result === "object" && value.result !== null && "valid" in value.result && "executionAuthorized" in value.result);
    assert.equal(value.result.valid, valid); assert.equal(value.result.executionAuthorized, false);
  }
  assert.throws(() => apiRequestSchema.parse({ action: "catalog-footprint", query: { method: "eda.lib_Symbol.get" } }));
  assert.throws(() => apiRequestSchema.parse({ action: "catalog-footprint-validate", query: { request, extra: true } }));
});

void test("catalog footprint coverage labels vendor HTTP separately and retains the public getter omission", () => {
  const row = inventoryExtensionApiCoverage().find((entry) => entry.path === "eda.lib_Footprint.get"); assert.ok(row);
  assert.equal(row.status, "implemented-public-subset"); assert.equal(row.currentGenerationLiveValidation, "not-recorded");
  assert.equal(row.completeDeclaredContractSupported, false); assert.equal(row.runtimeAdmission, "not-granted-by-inventory");
  const legacy = row.routes.find((entry) => entry.tool === "easyeda_control_library"); assert.ok(legacy);
  assert.equal(legacy.selector, "library.footprint.get"); assert.equal(legacy.implementation, "public-method");
  const catalog = row.routes.find((entry) => entry.tool === "easyeda_control_catalog_footprint"); assert.ok(catalog);
  assert.equal(catalog.implementation, "vendor-http-task-equivalent"); assert.equal(catalog.executionState, "available-with-network-guards");
  assert.equal(catalog.validation, "offline-regression;current-live-unclaimed");
  assert.equal(row.routes.some((entry) => entry.tool === "easyeda_control_system_footprint"), false);
  for (const text of ["Application-independent", "not public lib_Footprint.get execution", "confirmNetwork:true", "no caller destination/library/path", "credentials or redirects", "public getter remains unregistered", "unqualified CWD path", "remote UI", "No project opening"]) {
    assert.ok(catalog.scope.includes(text));
  }
  assert.deepEqual(catalog.inputDiscovery, { tool: "easyeda_control_api", arguments: { request: { action: "catalog-footprint", query: { includeSchemas: true } } } });
  assert.equal(queryOfflineApi(apiRequestSchema.parse(catalog.inputDiscovery.arguments.request)).offline, true);
  const summary = extensionApiCoverageSummary();
  const states = summary["executionRoutes"];
  assert.ok(typeof states === "object" && states !== null && "available-with-network-guards" in states);
  assert.equal(states["available-with-network-guards"], 1);
});
