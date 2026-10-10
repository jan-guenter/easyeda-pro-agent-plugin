import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { sha256Json } from "../src/core.ts";
import { buildFootprintNativeAdapter, compileFootprintOperation, expectedFootprintSource, footprintOperationSchema, inverseFootprintOperation, verifyFootprintSourceEffect } from "../src/footprint-action.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "../src/document-source.ts";

function snapshot(objects: readonly NativeSourceObject[]): NativeSourceSnapshot {
  const base = { schema: "easyeda-pro-control.document-source.v1" as const, document: { docType: "PCB", uuid: "fixture-footprint", editVersion: "3.2.149.88089769" }, objects: objects.toSorted((left, right) => left.id.localeCompare(right.id)) };
  return { ...base, sha256: sha256Json(base) };
}
const baseline = snapshot([{ id: '["RULE_SELECTOR",["NET",""]]', type: "RULE_SELECTOR", body: { ruleOrder: 4, ruleKeyValue: { NET_LENGTH_TOLERANCE: ["default", null] }, copperValue: {}, innerPlaneValue: {} } }, { id: "name", type: "ATTR", body: { key: "Footprint", value: "Fixture", parentId: "", locked: false } }, { id: "opaque", type: "FUTURE", body: { retain: [1, 2, 3] } }]);
const scope = { libraryUuid: "library", metadataOwnerUuid: "metadata-owner", footprintUuid: "fixture-footprint", footprintName: "Fixture" };
const create = { id: "outline", action: "footprint.line.create", properties: { net: "", layer: 3, startX: 0, startY: 0, endX: 100, endY: 0, lineWidth: 6, primitiveLock: false } };

void test("footprint geometry preserves actual library document identity and guards the owner before one history write", async () => {
  const adapter = buildFootprintNativeAdapter(create, baseline, scope);
  assert.ok(typeof adapter.createdId === "string" && adapter.createdId.length > 0);
  assert.equal(compileFootprintOperation(create).documentType, 4);
  assert.equal(adapter.expected.document["docType"], "PCB");
  assert.equal(Object.hasOwn(adapter.expected.objects.find((object) => object.id === adapter.createdId)?.body ?? {}, "partitionId"), false);
  assert.equal(verifyFootprintSourceEffect(create, baseline, adapter.expected, { createdId: adapter.createdId }).added.length, 1);
  const inverse = inverseFootprintOperation(create, baseline, { createdId: adapter.createdId });
  assert.ok(inverse);
  assert.deepEqual(expectedFootprintSource(inverse, adapter.expected), baseline);
  assert.equal(footprintOperationSchema.safeParse({ ...create, action: "pcb.line.create" }).success, false);
  assert.equal(footprintOperationSchema.safeParse({ ...create, properties: { ...create.properties, net: "UNREQUESTED" } }).success, false);
  const source = `{"type":"DOCHEAD"}||${JSON.stringify(baseline.document)}|\n${baseline.objects.map((entry) => `${JSON.stringify({ id: entry.id, type: entry.type })}||${JSON.stringify(entry.body)}|\n`).join("")}`;
  let writes = 0;
  const execute = async (documentType: number, libraryUuid: string): Promise<unknown> => {
    let currentSource = source;
    const value: unknown = runInNewContext(`(async()=>{const EXPECTED_DOCUMENT_UUID='fixture-footprint',EXPECTED_TAB_ID='fixture-footprint@library',EXPECTED_DOCUMENT_TYPE=${documentType};${adapter.code}})()`, {
      eda: {
        dmt_SelectControl: { getCurrentDocumentInfo: () => Promise.resolve({ uuid: "fixture-footprint", tabId: "fixture-footprint@library", documentType, parentLibraryUuid: libraryUuid }) },
        lib_Footprint: { get: () => Promise.resolve({ uuid: scope.footprintUuid, name: scope.footprintName, libraryUuid: scope.metadataOwnerUuid }) },
        sys_FileManager: { getDocumentSource: () => Promise.resolve(source), setDocumentSource: () => { assert.fail("Footprint must not invoke the dialog-closing public setter."); } },
      },
      window: { top: { frames: [], MSG_BUS_PCB: { messageBus: { rpcCall: (method: string, payload: unknown): Promise<unknown> => {
        if (method === "getTabIdAndDocType") { return Promise.resolve({ message: { tabId: "fixture-footprint@library", docType: 4 } }); }
        if (method === "FileSource") { return Promise.resolve({ message: currentSource }); }
        assert.equal(method, "pcb/decode"); writes += 1; assert.equal(typeof payload, "string"); assert.match(String(payload), /"docType":"PCB"/u); currentSource = String(payload); return Promise.resolve({ message: true });
      } } } } },
    });
    return await value;
  };
  await execute(4, "metadata-owner");
  assert.equal(writes, 1);
  await assert.rejects(execute(3, "metadata-owner"), /scope drift/u);
  await assert.rejects(execute(4, "another-library"), /scope drift/u);
  assert.equal(writes, 1);
  assert.equal(buildFootprintNativeAdapter(create, baseline, scope, { createdId: adapter.createdId }).createdId, adapter.createdId);
  assert.throws(() => buildFootprintNativeAdapter(create, snapshot(baseline.objects.filter((object) => object.id !== "name")), scope), /required/u);
});

void test("public pad creation preserves empty-net defaults and models its native inner-layer list", () => {
  const operation = { id: "native-pad", action: "footprint.pad.create", properties: { layer: 12, padNumber: "1", x: 0, y: 0, rotation: 0, pad: ["ELLIPSE", 60, 60], net: "", hole: ["ROUND", 30], holeOffsetX: 0, holeOffsetY: 0, holeRotation: 0, metallization: true, padType: 0, solderMaskAndPasteMaskExpansion: null, heatWelding: null, primitiveLock: false } };
  const initial = snapshot(baseline.objects.map((object) => object.type === "RULE_SELECTOR" ? { ...object, body: { ...object.body, ruleKeyValue: {} } } : object));
  const expected = expectedFootprintSource(operation, initial, { createdId: "a".repeat(16) });
  const delta = verifyFootprintSourceEffect(operation, initial, expected, { createdId: "a".repeat(16) });
  assert.equal(delta.added.length, 1);
  assert.equal(delta.changed.length, 0);
  assert.deepEqual(delta.added[0]?.body["unusedInnerLayers"], []);
  assert.ok(inverseFootprintOperation(operation, initial, { createdId: "a".repeat(16) }));
});

void test("default-font text create and inverse preserve attributes and reject unintended font or source collateral", () => {
  const operation = { id: "label", action: "footprint.text.create", properties: { layer: 3, x: 0, y: 0, text: "TEST", fontSize: 50, lineWidth: 8, origin: "LEFT_BOTTOM", rotation: 0, mirror: false, reverse: false, expansion: 0, primitiveLock: false } };
  const ids = { createdId: "a".repeat(16) };
  const created = expectedFootprintSource(operation, baseline, ids);
  assert.equal(verifyFootprintSourceEffect(operation, baseline, created, ids).added[0]?.type, "STRING");
  const modify = { id: "text-move", action: "footprint.text.modify", target: { primitiveId: ids.createdId }, patch: { text: "MARK", x: 10, rotation: 90 } };
  const modified = expectedFootprintSource(modify, created);
  const inverse = inverseFootprintOperation(modify, created);
  assert.ok(inverse);
  assert.deepEqual(expectedFootprintSource(inverse, modified), created);
  const wrongObjects = structuredClone(modified.objects);
  const opaqueObject = wrongObjects.find((object) => object.id === "opaque");
  assert.ok(opaqueObject);
  opaqueObject.body["retain"] = [];
  const wrong = snapshot(wrongObjects);
  assert.throws(() => verifyFootprintSourceEffect(modify, created, wrong), /unrelated/u);
  const customObjects = structuredClone(created.objects);
  const textObject = customObjects.find((object) => object.id === ids.createdId);
  assert.ok(textObject);
  textObject.body["fontFamily"] = "external";
  const customFont = snapshot(customObjects);
  assert.throws(() => expectedFootprintSource(modify, customFont), /default-font/u);
});
