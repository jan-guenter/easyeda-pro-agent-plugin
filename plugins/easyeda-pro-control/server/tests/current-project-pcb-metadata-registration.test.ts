/** Actual source registration with synthetic collaborators, not live admission. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import { z } from "zod";
import { currentProjectPcbMetadataRequestSchema } from "../src/current-project-pcb-metadata.ts";

void test("project PCB registration preserves strict read inputs and the authenticated live wrapper", async () => {
  const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");
  const start = source.indexOf('registerFacadeTool(\n  "easyeda_control_project_pcb",');
  const end = source.indexOf("\nregisterFacadeTool(", start + 1); assert.ok(start > 0 && end > start);
  type Callback = (input: { request: unknown; expectedFingerprint: unknown }) => Promise<unknown>;
  let invoke: Callback | undefined, requestSchema: z.ZodType | undefined, wrappers = 0;
  const calls: unknown[] = [], engine = Object.freeze({ synthetic: true }), expectedFingerprint = Object.freeze({ synthetic: true });
  const observed = Object.freeze({ cadAuthority: false, persistenceVerified: false, sourceMembershipVerified: false });
  const scope = vm.createContext({ z, currentProjectPcbMetadataRequestSchema, engine, privateFingerprintSchema: z.unknown(),
    readCurrentProjectPcbMetadata: (actualEngine: unknown, request: unknown, fingerprint: unknown): Promise<typeof observed> => {
      assert.equal(actualEngine, engine); assert.equal(fingerprint, expectedFingerprint); calls.push(request); return Promise.resolve(observed);
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
  for (const invalid of [{ ...request, method: "eda.dmt_Pcb.modifyPcbName" }, { ...request, arguments: {} }, { ...request, code: "caller-code" },
    { ...request, target: { ...request.target, pcbUuid: "wrong" } }, { ...request, target: { ...request.target, tabId: "0" } }]) {
    assert.equal(requestSchema.safeParse(invalid).success, false);
  }
  assert.equal(calls.length, 0); const parsed: unknown = requestSchema.parse(request);
  const result: unknown = await invoke({ request: parsed, expectedFingerprint });
  assert.equal(calls.length, 1); assert.equal(calls[0], parsed);
  assert.ok(result !== null && typeof result === "object" && "result" in result); assert.equal(result.result, observed);
});
