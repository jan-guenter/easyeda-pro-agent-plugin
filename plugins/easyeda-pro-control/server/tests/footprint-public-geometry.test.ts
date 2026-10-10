import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { sha256Json } from "../src/core.ts";
import { prepareDesignAction } from "../src/design-action.ts";
import type { NativeSourceSnapshot } from "../src/document-source.ts";
import { expectedFootprintSource, inverseFootprintOperation } from "../src/footprint-action.ts";
import { buildFootprintPublicGeometryExpression } from "../src/footprint-public-geometry.ts";

function record(value: unknown): Record<string, unknown> { assert.ok(value !== null && typeof value === "object" && !Array.isArray(value)); return Object.fromEntries(Object.entries(value)); }

const scope = { libraryUuid: "project", metadataOwnerUuid: "owner", footprintUuid: "footprint", footprintName: "Test" };
const base = { schema: "easyeda-pro-control.document-source.v1" as const, document: { uuid: "footprint", docType: "PCB", editVersion: "3.2.149.88089769" }, objects: [
  { id: '["RULE_SELECTOR",["NET",""]]', type: "RULE_SELECTOR", body: { ruleOrder: 4, ruleKeyValue: {}, copperValue: {}, innerPlaneValue: {} } },
  { id: "name", type: "ATTR", body: { key: "Footprint", value: "Test", parentId: "", locked: false } },
] };
const before: NativeSourceSnapshot = { ...base, sha256: sha256Json(base) }, createdId = "a".repeat(16);
const creates = [
  { id: "arc", action: "footprint.arc.create", properties: { net: "", layer: 3, startX: 0, startY: 0, endX: 100, endY: 0, arcAngle: 90, lineWidth: 6, interactiveMode: 1, primitiveLock: false } },
  { id: "poly", action: "footprint.polyline.create", properties: { net: "", layer: 3, polygon: [0, 0, "L", 100, 0, 100, 100], lineWidth: 6, primitiveLock: false } },
  { id: "fill", action: "footprint.fill.create", properties: { net: "", layer: 1, complexPolygon: ["CIRCLE", 0, 0, 40], fillMode: 0, lineWidth: 0.2, primitiveLock: false } },
  { id: "text", action: "footprint.text.create", properties: { layer: 3, x: 5, y: 10, text: "TEST", fontSize: 50, lineWidth: 8, origin: "LEFT_BOTTOM", rotation: 0, mirror: false, reverse: false, expansion: 20, primitiveLock: false } },
] as const;
function source(snapshot: NativeSourceSnapshot): string {
  return `{"type":"DOCHEAD"}||${JSON.stringify({ ...snapshot.document, client: "b".repeat(16), updateTime: 1, version: "1" })}|\n${snapshot.objects.map((object) => `${JSON.stringify({ type: object.type, id: object.id })}||${JSON.stringify(object.body)}|\n`).join("")}`;
}
async function execute(code: string, baseline: NativeSourceSnapshot, handler: (method: string, request: unknown) => unknown): Promise<unknown> {
  const result: unknown = runInNewContext(code, {
    eda: {
      dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve({ uuid: scope.libraryUuid }) },
      dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => Promise.resolve({ uuid: scope.footprintUuid, documentType: 4, tabId: "footprint@project", parentLibraryUuid: scope.metadataOwnerUuid }) },
      lib_Footprint: { get: (): Promise<unknown> => Promise.resolve({ uuid: scope.footprintUuid, libraryUuid: scope.metadataOwnerUuid, name: scope.footprintName, libraryType: "4" }) },
      sys_FileManager: { getDocumentSource: (): Promise<string> => Promise.resolve(source(baseline)), setDocumentSource: (): never => assert.fail("No full-source decoder") },
    },
    window: { top: { frames: [], MSG_BUS_PCB: { messageBus: { rpcCall: (method: string, request: unknown): Promise<unknown> => {
      if (method === "getTabIdAndDocType") { return Promise.resolve({ message: { tabId: "footprint@project", docType: 4 } }); }
      if (method === "FileSource") { return Promise.resolve({ message: source(baseline) }); }
      return Promise.resolve({ message: handler(method, structuredClone(request)) });
    } } } } },
  });
  return await result;
}

void test("footprint public geometry creates actual history identities without decoder defaults", async () => {
  for (const operation of creates) {
    const prepared = prepareDesignAction(operation, { source: before, footprintScope: scope });
    assert.equal(prepared.adapterProfile, "easyeda-pro-control.footprint-public-geometry.v1");
    assert.equal(prepared.createdId, undefined);
    let calls = 0;
    const value = await execute(`(async()=>{${prepared.code}})()`, before, (method, request) => {
      calls += 1; assert.match(method, /^pcb\/extensionAPI\/(arc|polylines|fill|string)-create$/u);
      if (operation.id === "text") { assert.equal(record(request)["expansion"], 2); }
      return { primitiveId: createdId };
    });
    assert.equal(record(value)["createdId"], createdId); assert.equal(calls, 1);
    const after = expectedFootprintSource(operation, before, { createdId });
    assert.deepEqual(after.objects.find((object) => object.type === "RULE_SELECTOR"), before.objects[0]);
    if (operation.id === "poly") { assert.equal(after.objects.find((object) => object.id === createdId)?.body["polyType"], "NORMAL"); }
    assert.ok(inverseFootprintOperation(operation, before, { createdId }));
  }
});

void test("polyline modification preserves identity and shape; shape replacement refuses before dispatch", async () => {
  const baseline = expectedFootprintSource(creates[1], before, { createdId });
  const operation = { id: "width", action: "footprint.polyline.modify", target: { primitiveId: createdId }, patch: { lineWidth: 8 } };
  const code = buildFootprintPublicGeometryExpression(operation, baseline, scope);
  const calls: string[] = [];
  const value = await execute(code, baseline, (method, request) => {
    calls.push(method);
    if (method.endsWith("getByIds")) { return [{ globalIndex: createdId, net: "", layerId: 3, path: [creates[1].properties.polygon], strokeWidth: 6, locked: false }]; }
    assert.deepEqual(request, { primitiveId: createdId, data: { net: "", layerId: 3, polygonSource: creates[1].properties.polygon, lineWidth: 8, primitiveLock: false } });
    return { globalIndex: createdId };
  });
  assert.equal(record(value)["primitiveId"], createdId); assert.equal(calls.length, 2);
  assert.throws(() => buildFootprintPublicGeometryExpression({ ...operation, patch: { polygon: [0, 0, "L", 30, 40] } }, baseline, scope), /distinct identities/u);
  assert.throws(() => buildFootprintPublicGeometryExpression({ ...creates[3], properties: { ...creates[3].properties, reverse: true } }, before, scope), /reverse rendering/u);
  assert.throws(() => buildFootprintPublicGeometryExpression({ ...creates[0], properties: { ...creates[0].properties, arcAngle: 360 } }, before, scope), /full revolution/u);
});

void test("native getter mismatch prevents modification; delete requires exactly its retained ID", async () => {
  const baseline = expectedFootprintSource(creates[1], before, { createdId });
  const modify = { id: "width", action: "footprint.polyline.modify", target: { primitiveId: createdId }, patch: { lineWidth: 8 } };
  let writes = 0;
  await assert.rejects(execute(buildFootprintPublicGeometryExpression(modify, baseline, scope), baseline, (method) => {
    if (method.endsWith("getByIds")) { return [{ globalIndex: createdId, net: "", layerId: 3, path: [[0, 0, "L", 99, 0]], strokeWidth: 6, locked: false }]; }
    writes += 1; return {};
  }), /BASELINE/u); assert.equal(writes, 0);
  const remove = { id: "delete", action: "footprint.polyline.delete", target: { primitiveId: createdId } };
  assert.equal(await execute(buildFootprintPublicGeometryExpression(remove, baseline, scope), baseline, (method, request) => { assert.equal(method, "pcb/extensionAPI/polylines-delete"); assert.deepEqual(request, { primitiveIds: [createdId] }); return [createdId]; }), true);
  await assert.rejects(execute(buildFootprintPublicGeometryExpression(remove, baseline, scope), baseline, () => []), /RESULT/u);
});
