import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import { z } from "zod";
import { currentPcbGeometryRequestSchema } from "../src/current-pcb-geometry.ts";

void test("PCB geometry registration preserves strict target requests and the serialized live gate", async () => {
  const source = await readFile(new URL("../src/index.ts", import.meta.url), "utf8");
  const start = source.indexOf('registerFacadeTool(\n  "easyeda_control_pcb_geometry",');
  const end = source.indexOf('registerFacadeTool(\n  "easyeda_control_sdk_read",', start);
  assert.ok(start > 0 && end > start);
  type Callback = (input: { request: unknown; expectedFingerprint: unknown }) => Promise<unknown>;
  let invoke: Callback | undefined, requestSchema: z.ZodType | undefined;
  let gateRegistrations = 0;
  const engine = Object.freeze({ synthetic: true }), expectedFingerprint = Object.freeze({ synthetic: true });
  const calls: unknown[] = [];
  const observed = Object.freeze({ value: [], cadAuthority: false, persistenceVerified: false, sourceMembershipVerified: false });
  const scope = vm.createContext({ z, currentPcbGeometryRequestSchema, engine, privateFingerprintSchema: z.unknown(),
    readCurrentPcbGeometry: (actualEngine: unknown, request: unknown, fingerprint: unknown): Promise<typeof observed> => {
      assert.equal(actualEngine, engine); assert.equal(fingerprint, expectedFingerprint);
      calls.push(request); return Promise.resolve(observed);
    },
    serializedLiveGuarded: (handler: Callback, ...options: unknown[]): Callback => {
      assert.equal(options.length, 0); gateRegistrations += 1; return handler;
    },
    registerFacadeTool: (name: string, config: { inputSchema: { request: z.ZodType; expectedFingerprint: z.ZodType };
      annotations: { readOnlyHint: boolean; destructiveHint: boolean; idempotentHint: boolean; openWorldHint: boolean } }, handler: Callback): void => {
      assert.equal(name, "easyeda_control_pcb_geometry");
      assert.deepEqual(Object.keys(config.inputSchema), ["request", "expectedFingerprint"]);
      assert.equal(config.annotations.readOnlyHint, true); assert.equal(config.annotations.destructiveHint, false);
      assert.equal(config.annotations.idempotentHint, true); assert.equal(config.annotations.openWorldHint, false);
      invoke = handler; requestSchema = config.inputSchema.request;
    },
  });
  // Execute the registered callback with only its fixed reader and live gate
  // Doubled. This checks composition, not authenticated runtime admission.
  vm.runInContext(stripTypeScriptTypes(source.slice(start, end)), scope);
  assert.equal(gateRegistrations, 1); assert.ok(invoke); assert.ok(requestSchema);
  const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16),
    tabId: `${"c".repeat(16)}@${"a".repeat(64)}` };
  const request = { method: "eda.pcb_PrimitiveLine.getAll", arguments: {}, target };
  for (const invalid of [{ ...request, method: "eda.pcb_PrimitiveLine.create" }, { ...request, arguments: { layer: 1 } },
    { ...request, target: { ...target, tabId: "wrong" } }, { ...request, code: "caller-code" },
    { ...request, method: "eda.pcb_PrimitiveLine.get", arguments: { primitiveIds: "one" } },
    { ...request, method: "eda.pcb_PrimitivePad.get", arguments: { primitiveIds: ["one", "one"] } },
    { ...request, method: "eda.pcb_PrimitiveComponent.getAllPinsByPrimitiveId", arguments: { primitiveId: ["one"] } }]) {
    assert.equal(requestSchema.safeParse(invalid).success, false);
  }
  assert.equal(calls.length, 0);
  for (const family of ["Line", "Arc", "Via", "Component", "Pad"]) {
    for (const method of ["getAll", "get"]) {
      const parsed: unknown = requestSchema.parse({ ...request, method: `eda.pcb_Primitive${family}.${method}`,
        arguments: method === "get" ? { primitiveIds: ["one"] } : {} });
      const result: unknown = await invoke({ request: parsed, expectedFingerprint });
      assert.equal(calls.at(-1), parsed);
      assert.ok(result !== null && typeof result === "object" && "result" in result); assert.equal(result.result, observed);
    }
  }
  const association: unknown = requestSchema.parse({ ...request, method: "eda.pcb_PrimitiveComponent.getAllPinsByPrimitiveId",
    arguments: { primitiveId: "one" } });
  const associationResult: unknown = await invoke({ request: association, expectedFingerprint });
  assert.equal(calls.at(-1), association);
  assert.ok(associationResult !== null && typeof associationResult === "object" && "result" in associationResult);
  assert.equal(associationResult.result, observed);
  assert.equal(calls.length, 11);
});
