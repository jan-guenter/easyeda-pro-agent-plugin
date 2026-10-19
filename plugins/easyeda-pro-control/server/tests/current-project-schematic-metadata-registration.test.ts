/** Actual source registration with synthetic collaborators, not live admission. */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import { z } from "zod";
import { currentProjectSchematicMetadataRequestSchema } from "../src/current-project-schematic-metadata.ts";

void test("project schematic registration preserves strict selected/inventory methods and authenticated callback routing", async () => {
  const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");
  const start = source.indexOf('registerFacadeTool(\n  "easyeda_control_project_schematic",');
  const end = source.indexOf("\nregisterFacadeTool(", start + 1); assert.ok(start > 0 && end > start);
  type Callback = (input: { request: unknown; expectedFingerprint: unknown }) => Promise<unknown>;
  let invoke: Callback | undefined, requestSchema: z.ZodType | undefined, wrappers = 0;
  const calls: unknown[] = [], engine = Object.freeze({ synthetic: true }), expectedFingerprint = Object.freeze({ synthetic: true });
  const observed = Object.freeze({ cadAuthority: false, persistenceVerified: false, sourceMembershipVerified: false });
  const scope = vm.createContext({ z, currentProjectSchematicMetadataRequestSchema, engine, privateFingerprintSchema: z.unknown(),
    readCurrentProjectSchematicMetadata: (actualEngine: unknown, request: unknown, fingerprint: unknown): Promise<typeof observed> => {
      assert.equal(actualEngine, engine); assert.equal(fingerprint, expectedFingerprint); calls.push(request); return Promise.resolve(observed);
    },
    serializedLiveGuarded: (handler: Callback, ...options: unknown[]): Callback => {
      assert.equal(options.length, 0); wrappers += 1; return handler;
    },
    registerFacadeTool: (name: string, config: { inputSchema: { request: z.ZodType; expectedFingerprint: z.ZodType };
      annotations: { readOnlyHint: boolean; destructiveHint: boolean; idempotentHint: boolean; openWorldHint: boolean } }, handler: Callback): void => {
      assert.equal(name, "easyeda_control_project_schematic"); assert.deepEqual(Object.keys(config.inputSchema), ["request", "expectedFingerprint"]);
      assert.equal(config.annotations.readOnlyHint, true); assert.equal(config.annotations.destructiveHint, false);
      assert.equal(config.annotations.idempotentHint, true); assert.equal(config.annotations.openWorldHint, false);
      invoke = handler; requestSchema = config.inputSchema.request;
    },
  });
  vm.runInContext(stripTypeScriptTypes(source.slice(start, end)), scope);
  assert.equal(wrappers, 1); assert.ok(invoke !== undefined && requestSchema !== undefined);
  const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32) };
  const selected = { method: "eda.dmt_Schematic.getSchematicInfo", target: { ...target, schematicUuid: "c".repeat(16) } };
  const all = { method: "eda.dmt_Schematic.getAllSchematicsInfo", target };
  const page = { method: "eda.dmt_Schematic.getSchematicPageInfo", target: { ...selected.target, schematicPageUuid: "d".repeat(16) } };
  const allPages = { method: "eda.dmt_Schematic.getAllSchematicPagesInfo", target };
  for (const invalid of [{ ...selected, method: "eda.dmt_Schematic.modifySchematicName" }, { ...selected, arguments: {} }, { ...selected, code: "caller-code" },
    { ...selected, target: { ...selected.target, schematicUuid: "wrong" } }, { ...selected, target: { ...selected.target, tabId: "0" } },
    { ...selected, desiredTitle: "Renamed" }, { ...selected, target }, { ...all, target: selected.target }, { ...all, expectedBefore: {} },
    { ...page, target: selected.target }, { ...allPages, target: page.target }, { ...page, arguments: {} }]) {
    assert.equal(requestSchema.safeParse(invalid).success, false);
  }
  assert.equal(calls.length, 0);
  for (const request of [selected, all, page, allPages]) {
    const parsed: unknown = requestSchema.parse(request), result: unknown = await invoke({ request: parsed, expectedFingerprint });
    assert.equal(calls.at(-1), parsed);
    assert.ok(result !== null && typeof result === "object" && "result" in result); assert.equal(result.result, observed);
  }
  assert.equal(calls.length, 4);
});
