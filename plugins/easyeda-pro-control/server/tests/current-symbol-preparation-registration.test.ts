import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import { z } from "zod";
import { apiRequestSchema, offlineApiToolConfiguration, queryOfflineApi, runOfflineApi } from "../src/offline-api.ts";
import { currentSymbolMetadataRequestSchema } from "../src/current-symbol-metadata.ts";
import { currentProjectOnlySymbolPreflightRequestSchema } from "../src/current-project-only-symbol-preflight.ts";

const preparation = { checkpoint: { path: "/synthetic/checkpoints/symbol.eprj2", bytes: 4096, sha256: "a".repeat(64) },
  target: { projectUuid: "b".repeat(64), branchUuid: "c".repeat(32), ownerUuid: "d".repeat(32), symbolUuid: "e".repeat(16) },
  patch: { name: "New symbol title" } };
const preflight = { target: preparation.target,
  expectedBefore: { name: "Before", description: "", tagsJson: "[]", source: "", version: "", ticket: 1 } };

void test("project-only preflight is discoverable and validates without granting execution", async () => {
  const catalog = await runOfflineApi(apiRequestSchema.parse({ action: "project-symbol-preflight", query: { includeSchemas: true } }));
  assert.equal(catalog.offline, true);
  assert.ok(catalog.result !== null && typeof catalog.result === "object" && "entries" in catalog.result && Array.isArray(catalog.result.entries));
  const entry: unknown = catalog.result.entries[0];
  assert.ok(entry !== null && typeof entry === "object" && "inputSchema" in entry && "resultSchema" in entry);
  for (const request of [preflight, { ...preflight, code: "caller-code" }, { ...preflight, expectedBefore: { ...preflight.expectedBefore, ticket: -0 } }]) {
    const result = await runOfflineApi(apiRequestSchema.parse({ action: "project-symbol-preflight-validate", query: { request } }));
    assert.ok(result.result !== null && typeof result.result === "object" && "valid" in result.result && "executionAuthorized" in result.result);
    assert.equal(result.result.valid, request === preflight); assert.equal(result.result.executionAuthorized, false);
  }
});

void test("project-symbol tool routes both strict read shapes through the authenticated wrapper", async () => {
  const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");
  const start = source.indexOf('registerFacadeTool(\n  "easyeda_control_project_symbol",');
  const end = source.indexOf("\nregisterFacadeTool(", start + 1);
  assert.ok(start > 0 && end > start);
  type Callback = (value: { request: unknown; expectedFingerprint: Record<string, unknown> }) => Promise<unknown>;
  let invoke: Callback | undefined, schema: z.ZodType | undefined, wrappers = 0;
  const calls: string[] = [], engine = Object.freeze({ synthetic: true });
  const reader = (name: string) => (received: unknown): Promise<{ route: string }> => {
    assert.equal(received, engine); calls.push(name); return Promise.resolve({ route: name });
  };
  const scope = vm.createContext({ z, currentSymbolMetadataRequestSchema, currentProjectOnlySymbolPreflightRequestSchema,
    privateFingerprintSchema: z.record(z.string(), z.unknown()), engine,
    readCurrentSymbolMetadata: reader("pcb"), readCurrentProjectOnlySymbolPreflight: reader("project-only"),
    serializedLiveGuarded: (handler: Callback): Callback => { wrappers += 1; return handler; },
    registerFacadeTool: (name: string, config: { inputSchema: { request: z.ZodType } }, handler: Callback): void => {
      assert.equal(name, "easyeda_control_project_symbol"); schema = config.inputSchema.request; invoke = handler;
    },
  });
  vm.runInContext(stripTypeScriptTypes(source.slice(start, end)), scope);
  assert.ok(invoke !== undefined && schema !== undefined); assert.equal(wrappers, 1);
  const pcb = { method: "eda.lib_Symbol.get", arguments: { symbolUuid: preparation.target.symbolUuid }, target: {
    projectUuid: preparation.target.projectUuid, branchUuid: preparation.target.branchUuid, documentUuid: "f".repeat(16),
    tabId: `${"f".repeat(16)}@${preparation.target.projectUuid}` } };
  await invoke({ request: schema.parse(pcb), expectedFingerprint: {} });
  await invoke({ request: schema.parse(preflight), expectedFingerprint: {} });
  assert.deepEqual(calls, ["pcb", "project-only"]);
  assert.equal(schema.safeParse({ ...preflight, method: pcb.method }).success, false);
  assert.equal(schema.safeParse({ ...pcb, expectedBefore: preflight.expectedBefore }).success, false);
});

void test("symbol checkpoint preparation is discoverable and strictly validates without reading files", async () => {
  const catalog = await runOfflineApi(apiRequestSchema.parse({ action: "project-symbol-preparation", query: { includeSchemas: true } }));
  assert.equal(catalog.offline, true);
  assert.ok(catalog.result !== null && typeof catalog.result === "object");
  const validated = await runOfflineApi(apiRequestSchema.parse({ action: "project-symbol-prepare-validate", query: { request: preparation } }));
  assert.ok(validated.result !== null && typeof validated.result === "object" && "valid" in validated.result);
  assert.equal(validated.result.valid, true);
  assert.ok("executionAuthorized" in validated.result);
  assert.equal(validated.result.executionAuthorized, false);
  for (const request of [{ ...preparation, code: "caller code" }, { ...preparation, patch: { classification: "Other" } },
    { ...preparation, patch: { description: null } }, { ...preparation, patch: {} },
    { ...preparation, target: { ...preparation.target, branchUuid: "wrong" } }]) {
    assert.equal(apiRequestSchema.safeParse({ action: "project-symbol-prepare", query: { request } }).success, false);
  }
  const parsed = apiRequestSchema.parse({ action: "project-symbol-prepare", query: { request: preparation } });
  assert.throws(() => queryOfflineApi(parsed), /asynchronous offline API handler/u);
  // The async route reaches managed-file admission, not an unknown-action branch.
  await assert.rejects(runOfflineApi(parsed), (error: unknown) => error instanceof Error &&
    !/Unknown offline API|asynchronous offline API handler/u.test(error.message));
});

for (const entry of ["index", "offline-control"] as const) {
void test(`${entry} registers asynchronous preparation without allocating a live gate`, async () => {
  const source = await readFile(new URL(`../src/${entry}.ts`, import.meta.url), "utf8");
  const start = source.indexOf(entry === "index" ? 'registerFacadeTool(\n  "easyeda_control_api",' : 'server.registerTool("easyeda_control_api",');
  const end = source.indexOf(entry === "index" ? 'registerFacadeTool(\n  "easyeda_control_discover",' : 'server.registerTool("easyeda_control_status",', start);
  assert.ok(start > 0 && end > start);
  type Request = z.infer<typeof apiRequestSchema>;
  type Callback = (input: { request: Request }) => Promise<unknown>;
  let invoke: Callback | undefined;
  const calls: unknown[] = [], completion = Promise.withResolvers<unknown>();
  const register = (name: string, config: unknown, handler: Callback): void => {
    assert.equal(name, "easyeda_control_api");
    assert.ok(config !== null && typeof config === "object" && "inputSchema" in config);
    assert.equal(config.inputSchema, offlineApiToolConfiguration.inputSchema);
    invoke = handler;
  };
  const scope = vm.createContext({ offlineApiToolConfiguration, outputSchema: {},
    guarded: (handler: Callback): Callback => handler,
    offlineGuard: (handler: Callback): Callback => handler,
    runOfflineApi: (request: Request): Promise<unknown> => { calls.push(request); return completion.promise; },
    registerFacadeTool: register, server: { registerTool: register },
  });
  vm.runInContext(stripTypeScriptTypes(source.slice(start, end)), scope);
  assert.ok(invoke);
  const request = apiRequestSchema.parse({ action: "project-symbol-prepare", query: { request: preparation } });
  const pending = invoke({ request });
  assert.equal(calls.length, 1); assert.equal(calls[0], request);
  const result = Object.freeze({ offline: true, result: { executionAuthorized: false } });
  completion.resolve(result);
  assert.equal(await pending, result);
});
}
