import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import { z } from "zod";
import { currentSymbolMetadataRequestSchema } from "../src/current-symbol-metadata.ts";
import { currentProjectOnlySymbolPreflightRequestSchema } from "../src/current-project-only-symbol-preflight.ts";

void test("project symbol metadata callback preserves strict inputs and the live guard", async () => {
  const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");
  const start = source.indexOf('registerFacadeTool(\n  "easyeda_control_project_symbol",');
  const end = source.indexOf("\nregisterFacadeTool(", start + 1);
  assert.ok(start > 0 && end > start);
  type Callback = (input: { request: unknown; expectedFingerprint: unknown }) => Promise<unknown>;
  let invoke: Callback | undefined, requestSchema: z.ZodType | undefined;
  let gates = 0;
  const engine = Object.freeze({ synthetic: true }), expectedFingerprint = Object.freeze({ synthetic: true });
  const calls: unknown[] = [], observed = Object.freeze({ cadAuthority: false, persistenceVerified: false });
  const scope = vm.createContext({ z, currentSymbolMetadataRequestSchema, currentProjectOnlySymbolPreflightRequestSchema,
    engine, privateFingerprintSchema: z.unknown(),
    readCurrentSymbolMetadata: (actualEngine: unknown, request: unknown, fingerprint: unknown): Promise<typeof observed> => {
      assert.equal(actualEngine, engine); assert.equal(fingerprint, expectedFingerprint);
      calls.push(request); return Promise.resolve(observed);
    },
    serializedLiveGuarded: (handler: Callback, ...options: unknown[]): Callback => {
      assert.equal(options.length, 0); gates += 1; return handler;
    },
    registerFacadeTool: (name: string, config: { inputSchema: { request: z.ZodType; expectedFingerprint: z.ZodType };
      annotations: { readOnlyHint: boolean; destructiveHint: boolean; idempotentHint: boolean; openWorldHint: boolean } }, handler: Callback): void => {
      assert.equal(name, "easyeda_control_project_symbol");
      assert.deepEqual(Object.keys(config.inputSchema), ["request", "expectedFingerprint"]);
      assert.equal(config.annotations.readOnlyHint, true); assert.equal(config.annotations.destructiveHint, false);
      assert.equal(config.annotations.idempotentHint, true); assert.equal(config.annotations.openWorldHint, false);
      invoke = handler; requestSchema = config.inputSchema.request;
    },
  });
  // Exercise the actual registration with its fixed I/O boundary doubled.
  // This is callback composition evidence, not connected runtime admission.
  vm.runInContext(stripTypeScriptTypes(source.slice(start, end)), scope);
  assert.equal(gates, 1); assert.ok(invoke); assert.ok(requestSchema);
  const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16),
    tabId: `${"c".repeat(16)}@${"a".repeat(64)}` };
  const request = { method: "eda.lib_Symbol.get", arguments: { symbolUuid: "d".repeat(16) }, target };
  for (const invalid of [{ ...request, method: "eda.lib_Symbol.modify" },
    { ...request, arguments: { ...request.arguments, libraryUuid: "foreign-library" } },
    { ...request, target: { ...target, tabId: "wrong" } }, { ...request, code: "caller-code" }]) {
    assert.equal(requestSchema.safeParse(invalid).success, false);
  }
  assert.equal(calls.length, 0);
  const parsed: unknown = requestSchema.parse(request);
  const result: unknown = await invoke({ request: parsed, expectedFingerprint });
  assert.equal(calls.length, 1); assert.equal(calls[0], parsed);
  assert.ok(result !== null && typeof result === "object" && "result" in result); assert.equal(result.result, observed);
});
