/** Actual source registration with synthetic collaborators, not live admission. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import { z } from "zod";
import { currentProjectPcbMetadataRequestSchema } from "../src/current-project-pcb-metadata.ts";
import { currentPcbRenamePreflightRequestSchema } from "../src/current-pcb-rename-preflight.ts";

void test("project PCB registration preserves strict metadata/preflight union and authenticated callback routing", async () => {
  const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");
  const start = source.indexOf('registerFacadeTool(\n  "easyeda_control_project_pcb",');
  const end = source.indexOf("\nregisterFacadeTool(", start + 1); assert.ok(start > 0 && end > start);
  type Callback = (input: { request: unknown; expectedFingerprint: unknown }) => Promise<unknown>;
  let invoke: Callback | undefined, requestSchema: z.ZodType | undefined, wrappers = 0;
  const calls: { route: string; request: unknown }[] = [], engine = Object.freeze({ synthetic: true }), expectedFingerprint = Object.freeze({ synthetic: true });
  const observed = Object.freeze({ cadAuthority: false, persistenceVerified: false, sourceMembershipVerified: false });
  const preflightObserved = Object.freeze({ writerAuthority: false, executionAuthorized: false, producerBindingVerified: false });
  const scope = vm.createContext({ z, currentProjectPcbMetadataRequestSchema, currentPcbRenamePreflightRequestSchema, engine, privateFingerprintSchema: z.unknown(),
    readCurrentProjectPcbMetadata: (actualEngine: unknown, request: unknown, fingerprint: unknown): Promise<typeof observed> => {
      assert.equal(actualEngine, engine); assert.equal(fingerprint, expectedFingerprint); calls.push({ route: "metadata", request }); return Promise.resolve(observed);
    },
    readCurrentPcbRenamePreflight: (actualEngine: unknown, request: unknown, fingerprint: unknown): Promise<typeof preflightObserved> => {
      assert.equal(actualEngine, engine); assert.equal(fingerprint, expectedFingerprint); calls.push({ route: "preflight", request }); return Promise.resolve(preflightObserved);
    },
    serializedLiveGuarded: (handler: Callback, ...options: unknown[]): Callback => {
      assert.equal(options.length, 0); wrappers += 1; return handler;
    },
    registerFacadeTool: (name: string, config: { inputSchema: { request: z.ZodType; expectedFingerprint: z.ZodType };
      annotations: { readOnlyHint: boolean; destructiveHint: boolean; idempotentHint: boolean; openWorldHint: boolean } }, handler: Callback): void => {
      assert.equal(name, "easyeda_control_project_pcb"); assert.deepEqual(Object.keys(config.inputSchema), ["request", "expectedFingerprint"]);
      assert.equal(config.annotations.readOnlyHint, true); assert.equal(config.annotations.destructiveHint, false);
      assert.equal(config.annotations.idempotentHint, true); assert.equal(config.annotations.openWorldHint, false);
      invoke = handler; requestSchema = config.inputSchema.request;
    },
  });
  vm.runInContext(stripTypeScriptTypes(source.slice(start, end)), scope);
  assert.equal(wrappers, 1); assert.ok(invoke !== undefined && requestSchema !== undefined);
  const request = { method: "eda.dmt_Pcb.getPcbInfo", target: { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), pcbUuid: "c".repeat(16) } };
  const inventory = { method: "eda.dmt_Pcb.getAllPcbsInfo", target: { projectUuid: request.target.projectUuid, branchUuid: request.target.branchUuid } };
  const preflight = { target: { ...request.target, ownerUuid: "d".repeat(32) }, desiredTitle: "Renamed PCB",
    expectedBefore: { title: "PCB", displayTitle: "PCB", parentUuid: "", source: "", version: "123", boardUuid: "", ticket: 2, updateTime: 123, docType: 3 } };
  for (const invalid of [{ ...request, method: "eda.dmt_Pcb.modifyPcbName" }, { ...request, arguments: {} }, { ...request, code: "caller-code" },
    { ...request, target: { ...request.target, pcbUuid: "wrong" } }, { ...request, target: { ...request.target, tabId: "0" } },
    { ...request, desiredTitle: "Renamed PCB" }, { ...preflight, method: request.method }, { ...preflight, code: "caller-code" },
    { ...preflight, desiredTitle: preflight.expectedBefore.displayTitle }, { ...preflight, target: { ...preflight.target, ownerUuid: "wrong" } },
    { ...preflight, expectedBefore: { ...preflight.expectedBefore, arbitrary: true } }, { ...inventory, target: request.target },
    { ...inventory, desiredTitle: "Renamed PCB" }, { ...inventory, arguments: {} }]) {
    assert.equal(requestSchema.safeParse(invalid).success, false);
  }
  assert.equal(calls.length, 0); const parsed: unknown = requestSchema.parse(request);
  const result: unknown = await invoke({ request: parsed, expectedFingerprint });
  assert.equal(calls.length, 1); assert.equal(calls[0]?.request, parsed); assert.equal(calls[0]?.route, "metadata");
  assert.ok(result !== null && typeof result === "object" && "result" in result); assert.equal(result.result, observed);
  const parsedPreflight: unknown = requestSchema.parse(preflight), preflightResult: unknown = await invoke({ request: parsedPreflight, expectedFingerprint });
  assert.equal(calls.length, 2); assert.equal(calls[1]?.request, parsedPreflight); assert.equal(calls[1]?.route, "preflight");
  assert.ok(preflightResult !== null && typeof preflightResult === "object" && "result" in preflightResult); assert.equal(preflightResult.result, preflightObserved);
  const parsedInventory: unknown = requestSchema.parse(inventory);
  const inventoryResult: unknown = await invoke({ request: parsedInventory, expectedFingerprint });
  assert.equal(calls.length, 3); assert.equal(calls[2]?.request, parsedInventory); assert.equal(calls[2]?.route, "metadata");
  assert.ok(inventoryResult !== null && typeof inventoryResult === "object" && "result" in inventoryResult); assert.equal(inventoryResult.result, observed);
});
