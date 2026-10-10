import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sha256Json } from "../src/core.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import type { NativeSourceSnapshot } from "../src/document-source.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "../src/native-history.ts";
import { buildSchematicComponentCreate, verifySchematicComponentCreate } from "../src/schematic-component-create.ts";
import { SCHEMATIC_NATIVE_PROFILE, schematicNativeSnapshotSchema } from "../src/schematic-native-adapter.ts";
import type { SchematicNativeSnapshot } from "../src/schematic-native-adapter.ts";

function document(uuid: string, docType: string, records: { id: string; type: string; body: Record<string, unknown> }[]): NativeDocumentSnapshot {
  return { uuid, docType, metadata: { uuid, docType }, records: records.map((record) => ({ ...record, ticket: 1, client: null })), semanticSha256: "0".repeat(64) };
}
const pinBody = { partId: "part", groupId: "", locked: false, zIndex: 2, display: true, x: 5, y: 0, rotation: 0, length: 10, color: null, pinShape: "NONE" };
const pinAttributes = ["Pin Name", "Pin Number", "Pin Type"].map((key, index) => ({ id: `symbol-attr-${index}`, type: "ATTR", body: {
  partId: "part", groupId: "", locked: false, zIndex: index + 3, parentId: "pin", key, value: key === "Pin Type" ? "IN" : "1", keyVisible: false, valueVisible: false,
  x: 5, y: 0, rotation: 0, color: null, fillColor: null, fontFamily: null, fontSize: null, strikeout: null, underline: false, italic: false, fontWeight: false, align: "LEFT_BOTTOM", version: "2.0",
} }));
const history: NativeHistorySnapshot = {
  profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "project", branchUuid: "branch", headHistoryUuid: "head", checkpointSha256: "0".repeat(64), historyRowCount: 1, chunkCount: 1, plaintextBytes: 1, semanticSha256: "0".repeat(64),
  documents: [
    document("page", "SCH_PAGE", []),
    document("device", "DEVICE", [{ id: "META", type: "META", body: { attributes: { Symbol: "symbol", Footprint: "footprint", Designator: "R?", Name: "={Value}", Value: "10k", "Supplier Part": "C123", "3D Model": "model" } } }]),
    document("symbol", "SYMBOL", [{ id: "part", type: "PART", body: { title: "R.1" } }, { id: "pin", type: "PIN", body: pinBody }, ...pinAttributes]),
    document("footprint", "FOOTPRINT", [{ id: "META", type: "META", body: { title: "R0603" } }]),
  ],
};
function encode(source: NativeSourceSnapshot): string {
  return `{"type":"DOCHEAD"}||${JSON.stringify(source.document)}|\n${source.objects.map(({ id, type, body }) => `${JSON.stringify({ id, type })}||${JSON.stringify(body)}`).join("|\n")}`;
}
const source = parseDocumentSource('{"type":"DOCHEAD"}||{"docType":"SCH_PAGE","uuid":"page"}|\n{"id":"CANVAS","type":"CANVAS"}||{"originX":0,"originY":0}');
const before = schematicNativeSnapshotSchema.parse({ profile: SCHEMATIC_NATIVE_PROFILE, document: { documentUuid: "page", tabId: "page@project" }, source: encode(source), components: [] });
const operation = { id: "create", action: "sch.component.create", properties: { component: { uuid: "device", libraryUuid: "project" }, x: 100, y: 200, subPartName: "R.1", rotation: 0, mirror: false, addIntoBom: true, addIntoPcb: true } };
function nativeAfter(adapter: ReturnType<typeof buildSchematicComponentCreate>): SchematicNativeSnapshot {
  const component = adapter.expected.objects.find((record) => record.id === adapter.createdId);
  assert.ok(component);
  const attributes = adapter.expected.objects.filter((record) => record.type === "ATTR" && record.body["parentId"] === adapter.createdId).map(({ id, body }) => ({ id, key: body["key"], value: body["value"], symbolValue: null, blockValue: body["value"], instanceValue: null, body }));
  const inherited = pinAttributes.map(({ body }, index) => ({ id: String(index + 1).repeat(16), key: body.key, value: body.value, symbolValue: body.value, blockValue: null, instanceValue: null,
    body: { x: 105, y: -200, rotation: 0, color: null, fontFamily: null, fontSize: null, fontWeight: false, italic: false, underline: false, strikeout: false, align: "LEFT_BOTTOM", value: null, keyVisible: null, valueVisible: null, key: body.key, fillColor: null, parentId: `${adapter.createdId}-pin`, zIndex: body.zIndex, locked: false } }));
  return schematicNativeSnapshotSchema.parse({ profile: SCHEMATIC_NATIVE_PROFILE, document: before.document, source: encode(adapter.expected), components: [{ id: adapter.createdId, kind: "part", locked: false, body: component.body, attributes, pins: [{ id: `${adapter.createdId}-pin`, body: { display: true, x: 105, y: -200, rotation: 0, length: 10, color: null, pinShape: "NONE", locked: false, zIndex: 0 }, attributes: inherited, noConnect: null, net: "" }] }] });
}

void describe("deterministic project component source creation", () => {
  void it("constructs exact IDs, property records and source with no placement/import or implicit metadata loss", () => {
    const adapter = buildSchematicComponentCreate(operation, source, before, history);
    const after = nativeAfter(adapter);
    verifySchematicComponentCreate(operation, adapter, source, adapter.expected, before, after, history);
    assert.equal(adapter.designator, "R1");
    assert.match(adapter.uniqueId, /^gge[a-f0-9]{16}$/u);
    assert.match(adapter.expression, /consistencyImpl\.setSourceCode\(source\)/u);
    assert.doesNotMatch(adapter.expression, /sch_PrimitiveComponent\.create|createDevice|placeDevice/u);
    assert.equal(after.components[0]?.attributes.find((attribute) => attribute.key === "3D Model")?.value, "model");
    assert.equal(adapter.expected.objects.filter((record) => record.type === "COMPONENT").length, 1);
  });
  void it("rejects absent assets and unproved transforms before creating a native command", () => {
    assert.throws(() => buildSchematicComponentCreate({ ...operation, properties: { ...operation.properties, component: { uuid: "device", libraryUuid: "cloud" } } }, source, before, history), /exact project/u);
    assert.throws(() => buildSchematicComponentCreate(operation, source, before, { ...history, documents: history.documents.filter((entry) => entry.uuid !== "footprint") }), /asset is missing/u);
    assert.throws(() => buildSchematicComponentCreate({ ...operation, properties: { ...operation.properties, rotation: 90 } }, source, before, history), /unrotated/u);
    assert.throws(() => buildSchematicComponentCreate({ ...operation, properties: { ...operation.properties, subPartName: "wrong" } }, source, before, history), /single-part/u);
    for (const id of ["page", "device", "symbol", "footprint"]) {
      const inactive = { ...history, documents: history.documents.map((entry) => entry.uuid === id ? { ...entry,
        records: [...entry.records, { id: "DELETE_DOC", type: "DELETE_DOC", ticket: 100, client: null, body: { isDelete: true } }] } : entry) };
      assert.throws(() => buildSchematicComponentCreate(operation, source, before, inactive), /missing|absent/u);
    }
  });
  void it("rejects altered native pin geometry and preexisting source collateral", () => {
    const adapter = buildSchematicComponentCreate(operation, source, before, history);
    const after = nativeAfter(adapter);
    const pin = after.components[0]?.pins[0]; assert.ok(pin); pin.body["x"] = 106;
    assert.throws(() => { verifySchematicComponentCreate(operation, adapter, source, adapter.expected, before, after, history); }, /pin geometry/u);
    const changed = structuredClone(adapter.expected);
    const canvas = changed.objects.find((entry) => entry.id === "CANVAS"); assert.ok(canvas); canvas.body["originX"] = 1;
    const malicious = { ...changed, sha256: sha256Json({ schema: changed.schema, document: changed.document, objects: changed.objects }) };
    const drift = nativeAfter({ ...adapter, expected: malicious });
    assert.throws(() => { verifySchematicComponentCreate(operation, { ...adapter, expected: malicious }, source, malicious, before, drift, history); }, /preexisting/u);
  });
  void it("proves inherited pin name/type, visual fields, identity and all override layers", () => {
    const adapter = buildSchematicComponentCreate(operation, source, before, history);
    for (const field of ["value", "symbolValue", "blockValue", "instanceValue"] as const) {
      const changed = nativeAfter(adapter);
      const attr = changed.components[0]?.pins[0]?.attributes.find((entry) => entry.key === "Pin Type"); assert.ok(attr);
      attr[field] = "OUT";
      assert.throws(() => { verifySchematicComponentCreate(operation, adapter, source, adapter.expected, before, changed, history); }, /inherited/u);
    }
    const changed = nativeAfter(adapter), pin = changed.components[0]?.pins[0]; assert.ok(pin); pin.body["display"] = false;
    assert.throws(() => { verifySchematicComponentCreate(operation, adapter, source, adapter.expected, before, changed, history); }, /style/u);
    const moved = nativeAfter(adapter);
    const attr = moved.components[0]?.pins[0]?.attributes[0]; assert.ok(attr); attr.body["x"] = 0;
    assert.throws(() => { verifySchematicComponentCreate(operation, adapter, source, adapter.expected, before, moved, history); }, /inherited/u);
  });
});
