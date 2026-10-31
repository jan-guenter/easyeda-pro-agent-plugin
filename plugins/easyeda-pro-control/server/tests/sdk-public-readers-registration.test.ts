import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { z } from "zod";
import { apiRequestSchema, queryOfflineApi } from "../src/offline-api.ts";
import { sdkPublicReadersOperationSchema, sdkPublicReadersRequestSchema } from "../src/sdk-public-readers.ts";
import type { SdkPublicReadersOperation } from "../src/sdk-public-readers.ts";

interface Input { request: SdkPublicReadersOperation; expectedFingerprint: Record<string, unknown> }
type Callback = (input: Input) => Promise<Record<string, unknown>>;

void test("actual public reader registration keeps strict nested requests, serialized owner forwarding and refusals", async () => {
  const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");
  const start = source.indexOf('registerFacadeTool(\n  "easyeda_control_public_readers",');
  const end = source.indexOf("\n);\n", start);
  assert.ok(start > 0 && end > start);
  const calls: string[] = [], engine = Object.freeze({ synthetic: true }), expectedFingerprint = { marker: "expected" };
  const request = sdkPublicReadersRequestSchema.parse({ method: "eda.sys_I18n.isLanguageSupported", arguments: { language: "EN" } });
  let expectedRequest: SdkPublicReadersOperation = request;
  let fail = false, inputSchema: z.ZodType | undefined, invoke: Callback | undefined;
  runInNewContext(stripTypeScriptTypes(source.slice(start, end + "\n);".length)), {
    z, sdkPublicReadersOperationSchema, privateFingerprintSchema: z.record(z.string(), z.unknown()), engine,
    serializedLiveGuarded: (handler: Callback): Callback => (input) => { calls.push("serialized-guard"); return handler(input); },
    registerFacadeTool: (name: string, config: { inputSchema: { request: z.ZodType; expectedFingerprint: z.ZodType }; annotations: object; description: string }, handler: Callback): void => {
      assert.equal(name, "easyeda_control_public_readers");
      assert.deepEqual(structuredClone(config.annotations), { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false });
      assert.match(config.description, /exact EasyEDA 3\.2\.209\/API 0\.3\.59/u);
      assert.match(config.description, /not the Windows desktop or PCB geometry/u);
      inputSchema = z.object(config.inputSchema); invoke = handler;
    },
    readSdkPublicReaders: (actualEngine: unknown, actualRequest: unknown, actualFingerprint: unknown): Promise<object> => {
      calls.push("reader"); assert.equal(actualEngine, engine);
      assert.equal(actualRequest, expectedRequest); assert.equal(actualFingerprint, expectedFingerprint);
      return fail ? Promise.reject(new Error("synthetic refusal")) : Promise.resolve({ synthetic: true });
    },
  });
  assert.ok(inputSchema); assert.ok(invoke);
  for (const invalid of [{ request: { ...request, arguments: { language: "en", code: "private()" } }, expectedFingerprint },
    { request: { ...request, private: true }, expectedFingerprint },
    { request: { action: "batch", requests: [request, request] }, expectedFingerprint },
    { request: { action: "batch", requests: [request], code: "private()" }, expectedFingerprint }]) {
    assert.equal(inputSchema.safeParse(invalid).success, false);
  }
  assert.deepEqual(calls, []);
  assert.equal(inputSchema.safeParse({ request, expectedFingerprint }).success, true);
  assert.deepEqual(structuredClone(await invoke({ request, expectedFingerprint })), { result: { synthetic: true } });
  assert.deepEqual(calls, ["serialized-guard", "reader"]);
  const batch = sdkPublicReadersOperationSchema.parse({ action: "batch", requests: [request] });
  expectedRequest = batch;
  assert.equal(inputSchema.safeParse({ request: batch, expectedFingerprint }).success, true);
  assert.deepEqual(structuredClone(await invoke({ request: batch, expectedFingerprint })), { result: { synthetic: true } });
  fail = true;
  await assert.rejects(invoke({ request: batch, expectedFingerprint }), /synthetic refusal/u);
  assert.deepEqual(calls, ["serialized-guard", "reader", "serialized-guard", "reader", "serialized-guard", "reader"]);
});

void test("offline API forwards public reader catalog and strict validation without execution authority", () => {
  const catalog = queryOfflineApi(apiRequestSchema.parse({ action: "public-readers" }));
  assert.equal(catalog.offline, true);
  assert.ok(typeof catalog.result === "object" && catalog.result !== null && "total" in catalog.result);
  assert.equal(catalog.result.total, 9);
  const query = { method: "eda.sys_Window.getViewportSize", includeSchemas: true };
  const detail = queryOfflineApi(apiRequestSchema.parse({ action: "public-readers", query }));
  assert.match(JSON.stringify(detail), /inputSchema/u);
  assert.match(JSON.stringify(detail), /"invocationEnabledByDiscovery":false/u);
  assert.match(JSON.stringify(detail), /"maximumMethods":7/u);
  for (const [argumentsData, expected] of [[{ language: "EN" }, true], [{ language: "en", code: "private()" }, false]] as const) {
    const value = queryOfflineApi(apiRequestSchema.parse({ action: "public-readers-validate", query: {
      request: { method: "eda.sys_I18n.isLanguageSupported", arguments: argumentsData },
    } }));
    assert.ok(typeof value.result === "object" && value.result !== null && "valid" in value.result && "executionAuthorized" in value.result);
    assert.equal(value.result.valid, expected); assert.equal(value.result.executionAuthorized, false);
  }
  const member = { method: "eda.sys_Window.getViewportSize", arguments: {} };
  for (const [requests, expected] of [[[member], true], [[member, member], false], [[], false]] as const) {
    const value = queryOfflineApi(apiRequestSchema.parse({ action: "public-readers-validate", query: { request: { action: "batch", requests } } }));
    assert.ok(typeof value.result === "object" && value.result !== null && "valid" in value.result && "executionAuthorized" in value.result);
    assert.equal(value.result.valid, expected); assert.equal(value.result.executionAuthorized, false);
  }
  assert.throws(() => apiRequestSchema.parse({ action: "public-readers", query: { method: "eda.sys_Window.open" } }));
  assert.throws(() => apiRequestSchema.parse({ action: "public-readers-validate", query: { request: {}, extra: true } }));
});
