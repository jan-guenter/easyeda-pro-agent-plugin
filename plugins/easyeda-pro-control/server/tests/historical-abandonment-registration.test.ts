import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import { z } from "zod";
import { historicalAbandonmentRequestSchema } from "../src/historical-abandonment.ts";

void test("historical abandonment registration retains only the local serialized recovery gate", async () => {
  const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");
  const start = source.indexOf('registerFacadeTool(\n  "easyeda_control_history",');
  const end = source.indexOf('registerFacadeTool(\n  "easyeda_control_pcb_identities",', start);
  assert.ok(start > 0 && end > start);
  type Callback = (input: { request: unknown }) => Promise<unknown>;
  let invoke: Callback | undefined, requestSchema: z.ZodType | undefined;
  let gateRegistrations = 0;
  const requests: unknown[] = [];
  const historical = Object.freeze({ classification: "historical-abandonment-verified", completionProved: false,
    executionAuthorized: false, authorityRestored: false, replayAllowed: false, saved: false, reopened: false });
  const scope = vm.createContext({ z, historicalAbandonmentRequestSchema,
    runHistoricalAbandonment: (request: unknown): Promise<typeof historical> => {
      requests.push(request); return Promise.resolve(historical);
    },
    serializedGuarded: (handler: Callback, options: { allowDuringOrphanRisk: unknown }): Callback => {
      assert.deepEqual(Object.keys(options), ["allowDuringOrphanRisk"]);
      assert.equal(options.allowDuringOrphanRisk, true); gateRegistrations += 1; return handler;
    },
    registerFacadeTool: (name: string, config: { inputSchema: { request: z.ZodType };
      annotations: { readOnlyHint: boolean; destructiveHint: boolean; idempotentHint: boolean; openWorldHint: boolean } },
    handler: Callback): void => {
      assert.equal(name, "easyeda_control_history");
      assert.deepEqual(Object.keys(config.inputSchema), ["request"]);
      assert.equal(config.annotations.readOnlyHint, false); assert.equal(config.annotations.destructiveHint, false);
      assert.equal(config.annotations.idempotentHint, true); assert.equal(config.annotations.openWorldHint, false);
      invoke = handler; requestSchema = config.inputSchema.request;
    },
  });
  // Run the actual registration with only its local delegate doubled. No engine,
  // Authenticated scope, native owner or bridge exists in this VM.
  vm.runInContext(stripTypeScriptTypes(source.slice(start, end)), scope);
  assert.equal(gateRegistrations, 1); assert.ok(invoke); assert.ok(requestSchema);
  const operationId = "easyeda-synthetic-registration";
  const request = { action: "abandon-before-navigation", operationId, confirmation: `${operationId}:abandoned-before-navigation` };
  for (const invalid of [
    { ...request, confirmation: "wrong" },
    { ...request, action: "reconciled-no-mutation" },
    { ...request, runtimeRestartConfirmation: "invented" },
    { ...request, confirmDiscardAnyUnsavedState: false },
    { ...request, code: "arbitrary()" },
  ]) { assert.equal(requestSchema.safeParse(invalid).success, false); }
  assert.equal(requests.length, 0);
  const parsed = requestSchema.parse(request);
  const response = await invoke({ request: parsed });
  assert.equal(requests.length, 1); assert.equal(requests[0], parsed);
  assert.ok(response !== null && typeof response === "object" && "result" in response);
  assert.equal(response.result, historical);
  const baselineId = "1-Current-Baseline-Registration";
  const baseline = { action: "abandon-baseline-before-relaunch", operationId: baselineId, confirmDisposableProject: true,
    confirmation: `${baselineId}:abandoned-before-relaunch` };
  assert.equal(requestSchema.safeParse({ ...baseline, confirmDisposableProject: false }).success, false);
  const parsedBaseline = requestSchema.parse(baseline);
  const baselineResponse = await invoke({ request: parsedBaseline });
  assert.equal(requests.length, 2); assert.equal(requests[1], parsedBaseline);
  assert.ok(baselineResponse !== null && typeof baselineResponse === "object" && "result" in baselineResponse);
  assert.equal(baselineResponse.result, historical); assert.equal(gateRegistrations, 1);
});
