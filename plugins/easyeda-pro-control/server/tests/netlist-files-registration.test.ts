import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { z } from "zod";
import { SerializedGate } from "../src/engine.ts";
import { facadeToolRegistered } from "../src/facade-mode.ts";
import { netlistFilesRequestSchema, queryNetlistFiles, validateNetlistFilesArguments } from "../src/netlist-files.ts";
import { apiRequestSchema, queryOfflineApi } from "../src/offline-api.ts";

const prepared = { action: "prepare-file", name: "sample.tel", text: "$PACKAGES\nR ; R1\n$NETS\nN ; R1.1\n$END\n", confirmLocalArtifact: true };
const artifact = { schema: "easyeda-pro-control.netlist-file.v1", format: "allegro-ascii-subset", name: "sample.tel",
  path: "/synthetic/managed/sample.tel", bytes: 49, sha256: "a".repeat(64) };
const comparison = { action: "compare-files", left: artifact, right: artifact };
const expectedFingerprint = Object.freeze({ marker: "synthetic-runtime" });
type Handler = (input: unknown) => Promise<unknown>;
interface Forwarded { request: unknown; fingerprint?: unknown }

async function registration(options: { deny?: boolean; failComparison?: boolean } = {}): Promise<{
  calls: string[]; forwarded: Forwarded[]; gate: SerializedGate; invoke: (input: unknown) => Promise<unknown>;
}> {
  const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");
  const registrationStart = source.indexOf('registerFacadeTool(\n  "easyeda_control_netlist_files",');
  const registrationEnd = source.indexOf("\n);\n", registrationStart);
  const guardedStart = source.indexOf("function guarded<Input>(");
  const guardedEnd = source.indexOf("\nfunction serializedGuarded<Input>(", guardedStart);
  const registerStart = source.indexOf("function registerFacadeTool<InputArgs extends z.ZodRawShape>(");
  const registerEnd = source.indexOf("\nregisterFacadeTool(", registerStart);
  assert.ok(registrationStart > 0 && registrationEnd > registrationStart && guardedStart > 0 && guardedEnd > guardedStart && registerStart > 0 && registerEnd > registerStart);
  const calls: string[] = [], forwarded: Forwarded[] = [], gate = new SerializedGate();
  let handler: Handler | undefined, inputSchema: z.ZodType | undefined, scoped = false;
  const engine = { assertBridgeDispatchAllowed: (): Promise<boolean> => {
    calls.push("admission"); return options.deny === true ? Promise.reject(new Error("synthetic authentication refusal")) : Promise.resolve(true);
  } };
  const scope = {
    z, netlistFilesRequestSchema, privateFingerprintSchema: z.record(z.string(), z.unknown()),
    facadeMode: "public-utilities-only", facadeToolRegistered, bridgeGate: gate, engine,
    toolOutputSchemas: { easyeda_control_netlist_files: z.unknown() },
    success: (value: unknown): unknown => value,
    failure: (error: unknown): object => ({ failed: true, message: String(error) }),
    server: { registerTool: (name: string, config: { inputSchema: z.ZodRawShape; annotations: object; description: string; outputSchema: z.ZodType }, registeredHandler: Handler): void => {
      assert.equal(name, "easyeda_control_netlist_files"); assert.ok(config.outputSchema instanceof z.ZodType);
      assert.deepEqual(structuredClone(config.annotations), { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false });
      assert.match(config.description, /prepare-file requires no expectedFingerprint/u);
      assert.match(config.description, /compare-files requires the actual authenticated expectedFingerprint/u);
      inputSchema = z.object(config.inputSchema); handler = registeredHandler;
    } },
    prepareNetlistFile: (request: unknown): Promise<unknown> => {
      calls.push("prepare"); assert.equal(scoped, false); forwarded.push({ request });
      return Promise.resolve({ offline: true, localArtifactWritten: true });
    },
    compareNetlistFiles: async (actualEngine: unknown, request: unknown, fingerprint: unknown): Promise<unknown> => {
      calls.push("compare"); assert.equal(actualEngine, engine); assert.equal(scoped, true); forwarded.push({ request, fingerprint });
      await Promise.resolve();
      if (options.failComparison === true) { throw new Error("synthetic comparison refusal"); }
      return { connectedValidation: false, cadAuthority: false };
    },
    upstream: { withAuthenticatedBridgeDispatchScope: async (task: () => Promise<unknown>): Promise<unknown> => {
      assert.equal(scoped, false); scoped = true; calls.push("authenticated-enter");
      try { return await task(); }
      finally { scoped = false; calls.push("authenticated-exit"); }
    } },
  };
  runInNewContext(stripTypeScriptTypes(`${source.slice(guardedStart, guardedEnd)}\n${source.slice(registerStart, registerEnd)}\n${source.slice(registrationStart, registrationEnd + "\n);".length)}`), scope);
  assert.ok(handler); assert.ok(inputSchema);
  const selectedHandler = handler, selectedSchema = inputSchema;
  return { calls, forwarded, gate, invoke: async (input): Promise<unknown> => {
    const response = await selectedHandler(selectedSchema.parse(input)); return response;
  } };
}

void test("actual netlist registration rejects missing comparison or extra preparation fingerprint before any effect", async () => {
  const route = await registration();
  assert.match(JSON.stringify(await route.invoke({ request: comparison })), /compare-files requires the actual authenticated runtime fingerprint/u);
  assert.match(JSON.stringify(await route.invoke({ request: prepared, expectedFingerprint })), /prepare-file does not accept a runtime fingerprint/u);
  await assert.rejects(route.invoke({ request: comparison, expectedFingerprint: null }));
  assert.deepEqual(route.calls, []); assert.deepEqual(route.forwarded, []);
});

void test("netlist registration rejects strict nested injection before preparation or bridge admission", async () => {
  const route = await registration();
  const invalid = [
    { request: { ...prepared, path: "/private/source.tel" } },
    { request: { ...prepared, confirmLocalArtifact: false } },
    { request: { ...prepared, name: "other.enet" } },
    { request: { ...comparison, code: "caller()" }, expectedFingerprint },
    { request: { ...comparison, left: { ...artifact, extra: true } }, expectedFingerprint },
    { request: { ...comparison, right: { ...artifact, documentUuid: "private" } }, expectedFingerprint },
    { request: { ...comparison, left: "document-uuid" }, expectedFingerprint },
  ];
  for (const input of invalid) { await assert.rejects(route.invoke(input)); }
  assert.deepEqual(route.calls, []); assert.deepEqual(route.forwarded, []);
});

void test("preparation stays offline while comparisons wait for the actual shared serialization gate", async () => {
  const route = await registration();
  const entered = Promise.withResolvers<boolean>(), release = Promise.withResolvers<boolean>();
  const held = route.gate.run(async () => { entered.resolve(true); await release.promise; }); await entered.promise;
  const pending = [route.invoke({ request: comparison, expectedFingerprint }), route.invoke({ request: comparison, expectedFingerprint })];
  try {
    assert.deepEqual(structuredClone(await route.invoke({ request: prepared })), { result: { offline: true, localArtifactWritten: true } });
    assert.deepEqual(route.calls, ["prepare"]); assert.deepEqual(route.forwarded, [{ request: prepared }]);
  } finally { release.resolve(true); await held; }
  const results = await Promise.all(pending);
  for (const value of results) { assert.deepEqual(structuredClone(value), { result: { connectedValidation: false, cadAuthority: false } }); }
  assert.deepEqual(route.calls, ["prepare", "admission", "authenticated-enter", "compare", "authenticated-exit",
    "admission", "authenticated-enter", "compare", "authenticated-exit"]);
  assert.deepEqual(route.forwarded, [{ request: prepared }, { request: comparison, fingerprint: expectedFingerprint }, { request: comparison, fingerprint: expectedFingerprint }]);
});

void test("registration contains comparison refusal and cannot enter an authenticated scope after denied admission", async () => {
  const denied = await registration({ deny: true });
  assert.match(JSON.stringify(await denied.invoke({ request: comparison, expectedFingerprint })), /synthetic authentication refusal/u);
  assert.deepEqual(denied.calls, ["admission"]); assert.deepEqual(denied.forwarded, []);
  const failed = await registration({ failComparison: true });
  assert.match(JSON.stringify(await failed.invoke({ request: comparison, expectedFingerprint })), /synthetic comparison refusal/u);
  assert.deepEqual(failed.calls, ["admission", "authenticated-enter", "compare", "authenticated-exit"]);
  assert.deepEqual(failed.forwarded, [{ request: comparison, fingerprint: expectedFingerprint }]);
});

void test("offline netlist discovery and argument validation forward exact contracts without execution authority", () => {
  const discovered = queryOfflineApi(apiRequestSchema.parse({ action: "netlist-files", query: { includeSchemas: true } }));
  assert.equal(discovered.offline, true); assert.deepEqual(discovered.result, queryNetlistFiles({ includeSchemas: true }));
  assert.match(JSON.stringify(discovered.result), /"invocationEnabledByDiscovery":false/u);
  for (const request of [prepared, { ...prepared, path: "/private/file.tel" }]) {
    const validated = queryOfflineApi(apiRequestSchema.parse({ action: "netlist-files-validate", query: { request } }));
    assert.equal(validated.offline, true); assert.deepEqual(validated.result, validateNetlistFilesArguments(request));
    assert.match(JSON.stringify(validated.result), /"executionAuthorized":false/u);
  }
  assert.throws(() => apiRequestSchema.parse({ action: "netlist-files", query: { code: "caller()" } }));
  assert.throws(() => apiRequestSchema.parse({ action: "netlist-files-validate", query: { request: prepared, extra: true } }));
});
