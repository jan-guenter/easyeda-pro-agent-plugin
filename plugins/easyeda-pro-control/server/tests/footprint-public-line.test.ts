import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { sha256Json } from "../src/core.ts";
import { prepareDesignAction } from "../src/design-action.ts";
import { expectedFootprintSource, inverseFootprintOperation, verifyFootprintSourceEffect } from "../src/footprint-action.ts";
import { buildFootprintPublicLineExpression } from "../src/footprint-public-line.ts";
import type { NativeSourceSnapshot } from "../src/document-source.ts";

const scope = { libraryUuid: "project", metadataOwnerUuid: "owner", footprintUuid: "footprint", footprintName: "Test" };
const base = { schema: "easyeda-pro-control.document-source.v1" as const,
  document: { uuid: "footprint", docType: "PCB", editVersion: "3.2.149.88089769" },
  objects: [{ id: '["RULE_SELECTOR",["NET",""]]', type: "RULE_SELECTOR", body: { ruleOrder: 4, ruleKeyValue: {}, copperValue: {}, innerPlaneValue: {} } },
    { id: "name", type: "ATTR", body: { key: "Footprint", value: "Test", parentId: "", locked: false } }] };
const before: NativeSourceSnapshot = { ...base, sha256: sha256Json(base) };
const createdId = "a".repeat(16);
const create = { id: "line-create", action: "footprint.line.create", properties: { net: "", layer: 3, startX: 0, startY: 80, endX: 100, endY: 80, lineWidth: 6, primitiveLock: false } };
function source(snapshot: NativeSourceSnapshot): string {
  const head = { ...snapshot.document, client: "b".repeat(16), updateTime: 1, version: "1" };
  return `{"type":"DOCHEAD"}||${JSON.stringify(head)}|\n${snapshot.objects.map((object) => `${JSON.stringify({ type: object.type, id: object.id })}||${JSON.stringify(object.body)}|\n`).join("")}`;
}
function fixture(snapshot: NativeSourceSnapshot): { eda: Record<string, unknown>; calls: string[] } {
  const calls: string[] = [];
  return { calls, eda: {
    dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve({ uuid: scope.libraryUuid }) },
    dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => Promise.resolve({ uuid: scope.footprintUuid, documentType: 4, tabId: "footprint@project", parentLibraryUuid: scope.metadataOwnerUuid }) },
    lib_Footprint: { get: (): Promise<unknown> => Promise.resolve({ uuid: scope.footprintUuid, libraryUuid: scope.metadataOwnerUuid, name: scope.footprintName, libraryType: "4" }) },
    sys_FileManager: { getDocumentSource: (): Promise<string> => Promise.resolve(source(snapshot)), setDocumentSource: (): never => assert.fail("No full-source decoder") },
  } };
}
async function run(code: string, eda: unknown): Promise<unknown> {
  const result: unknown = runInNewContext(`(async()=>{${code}})()`, { eda });
  return await result;
}

void test("public footprint create retains returned identity and does not assume decoder rule correction", async () => {
  const prepared = prepareDesignAction(create, { source: before, footprintScope: scope });
  assert.equal(prepared.adapterProfile, "easyeda-pro-control.footprint-public-line.v1");
  assert.equal(prepared.createdId, undefined);
  assert.equal(prepared.expectedSource, undefined);
  const value = fixture(before);
  value.eda["pcb_PrimitiveLine"] = { create: (...args: unknown[]): Promise<unknown> => {
    value.calls.push("create"); assert.deepEqual(args, ["", 3, 0, 80, 100, 80, 6, false]);
    return Promise.resolve({ getState_PrimitiveId: (): string => createdId });
  } };
  assert.deepEqual(structuredClone(await run(prepared.code, value.eda)), { ok: true, kind: "typed-design-result", id: create.id, primitiveId: createdId, createdId });
  const after = expectedFootprintSource(create, before, { createdId });
  assert.deepEqual(after.objects.find((object) => object.type === "RULE_SELECTOR"), before.objects[0]);
  assert.equal(verifyFootprintSourceEffect(create, before, after, { createdId }).changed.length, 0);
  const inverse = inverseFootprintOperation(create, before, { createdId });
  assert.ok(inverse);
  assert.deepEqual(expectedFootprintSource(inverse, after), before);
  assert.deepEqual(value.calls, ["create"]);
});

void test("footprint line modify explicitly awaits done and rejects unsupported layer changes before calls", async () => {
  const baseline = expectedFootprintSource(create, before, { createdId });
  const operation = { id: "move", action: "footprint.line.modify", target: { primitiveId: createdId }, patch: { startY: 90, endY: 90, lineWidth: 8 } };
  const value = fixture(baseline);
  let finished = false;
  const properties = { ...create.properties };
  const line = { isAsync: (): boolean => true, getState_PrimitiveId: (): string => createdId,
    getState_Net: (): string => properties.net, getState_Layer: (): number => properties.layer,
    getState_StartX: (): number => properties.startX, getState_StartY: (): number => properties.startY,
    getState_EndX: (): number => properties.endX, getState_EndY: (): number => properties.endY,
    getState_LineWidth: (): number => properties.lineWidth, getState_PrimitiveLock: (): boolean => properties.primitiveLock,
    setState_StartY: (next: number): void => { properties.startY = next; },
    setState_EndY: (next: number): void => { properties.endY = next; },
    setState_LineWidth: (next: number): void => { properties.lineWidth = next; },
    done: async (): Promise<unknown> => { value.calls.push("done"); await Promise.resolve(); finished = true; return line; },
  };
  value.eda["pcb_PrimitiveLine"] = { get: (id: string): Promise<unknown> => { assert.equal(id, createdId); return Promise.resolve(line); }, modify: (): never => assert.fail("SDK modify drops done Promise") };
  const code = prepareDesignAction(operation, { source: baseline, footprintScope: scope }, { targetId: createdId }).code;
  await run(code, value.eda); assert.equal(finished, true); assert.deepEqual(value.calls, ["done"]);
  assert.deepEqual(properties, { ...create.properties, ...operation.patch });
  assert.throws(() => buildFootprintPublicLineExpression({ ...operation, patch: { layer: 4 } }, baseline, scope), /layer changes/u);
  properties.startX = 1;
  await assert.rejects(run(code, value.eda), /BASELINE_DRIFT/u);
  assert.deepEqual(value.calls, ["done"]);
});

void test("public footprint deletion calls one history delete with the exact retained ID", async () => {
  const baseline = expectedFootprintSource(create, before, { createdId });
  const operation = { id: "delete", action: "footprint.line.delete", target: { primitiveId: createdId } };
  const value = fixture(baseline);
  value.eda["pcb_PrimitiveLine"] = { delete: (id: string): Promise<boolean> => { assert.equal(id, createdId); value.calls.push("delete"); return Promise.resolve(true); } };
  const prepared = prepareDesignAction(operation, { source: baseline, footprintScope: scope }, { targetId: createdId });
  await run(prepared.code, value.eda); assert.deepEqual(value.calls, ["delete"]);
  assert.deepEqual(expectedFootprintSource(operation, baseline), before);
});
