import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import type { z } from "zod";
import { apiRequestSchema, offlineApiToolConfiguration, queryOfflineApi, runOfflineApi } from "../src/offline-api.ts";

const preparation = { checkpoint: { path: "/synthetic/checkpoints/symbol.eprj2", bytes: 4096, sha256: "a".repeat(64) },
  target: { projectUuid: "b".repeat(64), branchUuid: "c".repeat(32), ownerUuid: "d".repeat(32), symbolUuid: "e".repeat(16) },
  patch: { name: "New symbol title" } };

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

void test("the registered offline API callback awaits preparation without allocating a live gate", async () => {
  const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");
  const start = source.indexOf('registerFacadeTool(\n  "easyeda_control_api",');
  const end = source.indexOf('registerFacadeTool(\n  "easyeda_control_discover",', start);
  assert.ok(start > 0 && end > start);
  type Request = z.infer<typeof apiRequestSchema>;
  type Callback = (input: { request: Request }) => Promise<unknown>;
  let invoke: Callback | undefined;
  const calls: unknown[] = [], completion = Promise.withResolvers<unknown>();
  const scope = vm.createContext({ offlineApiToolConfiguration,
    guarded: (handler: Callback): Callback => handler,
    runOfflineApi: (request: Request): Promise<unknown> => { calls.push(request); return completion.promise; },
    registerFacadeTool: (name: string, config: unknown, handler: Callback): void => {
      assert.equal(name, "easyeda_control_api"); assert.equal(config, offlineApiToolConfiguration); invoke = handler;
    },
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
