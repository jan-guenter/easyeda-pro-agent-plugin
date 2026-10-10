import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseDocumentSource } from "../src/document-source.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "../src/document-source.ts";
import { assertSchematicElectricalSupported, buildSchematicElectricalAdapter, inverseSchematicElectricalOperation, verifySchematicElectricalEffect } from "../src/schematic-electrical-adapter.ts";
import { SCHEMATIC_NATIVE_PROFILE, schematicNativeSnapshotSchema } from "../src/schematic-native-adapter.ts";
import type { SchematicNativeComponent, SchematicNativeSnapshot } from "../src/schematic-native-adapter.ts";
import { buildSchematicOperationCallExpression } from "../src/schematic-operations.ts";

const canvas: NativeSourceObject = { id: "CANVAS", type: "CANVAS", body: { originX: 0, originY: 0 } };
const component: SchematicNativeComponent = { id: "part", kind: "part", locked: false, body: { partId: "p1", x: 10, y: -20, rotation: 0, isMirror: false, attrs: {}, zIndex: 1 }, attributes: [], pins: [{ id: "pin", body: { x: 15, y: -20, rotation: 0, length: 10 }, attributes: [], net: "N1", noConnect: null }] };
function snapshot(objects: readonly NativeSourceObject[], components: readonly SchematicNativeComponent[]): { source: NativeSourceSnapshot; native: SchematicNativeSnapshot } {
  const text = `{"type":"DOCHEAD"}||{"docType":"SCH_PAGE","uuid":"page"}|\n${objects.map(({ id, type, body }) => `${JSON.stringify({ id, type })}||${JSON.stringify(body)}`).join("|\n")}`;
  return { source: parseDocumentSource(text), native: schematicNativeSnapshotSchema.parse({ profile: SCHEMATIC_NATIVE_PROFILE, document: { documentUuid: "page", tabId: "page@project" }, source: text, components }) };
}
function baseline(): ReturnType<typeof snapshot> {
  return snapshot([canvas, { id: component.id, type: "COMPONENT", body: component.body }], [component]);
}

void describe("fixed schematic electrical operations", () => {
  void it("creates one explicit standalone net label and verifies exact identity-preserving deletion", () => {
    const before = baseline();
    const operation = { id: "label", action: "sch.net-label.create", properties: { net: "N2", x: 15, y: 20 } };
    const prepared = buildSchematicElectricalAdapter(operation, before.source, before.native, { createdId: "label-id" });
    assert.equal(prepared.createdId, "label-id");
    assert.match(prepared.expression, /shapeManager\.netLabel\(/u);
    assert.doesNotMatch(prepared.expression, /createNetLabel\(/u);
    const body = { x: 15, y: -20, rotation: 0, color: null, fontFamily: null, fontSize: null, fontWeight: null, italic: null, underline: null, strikeout: null, align: "LEFT_BOTTOM", value: "N2", keyVisible: false, valueVisible: true, key: "_NETLABEL_", fillColor: null, parentId: "$$root", zIndex: 2, locked: false, groupId: "" };
    const newComponent = structuredClone(component);
    assert.ok(newComponent.pins[0]); newComponent.pins[0].net = "N2";
    const after = snapshot([...before.source.objects, { id: "label-id", type: "ATTR", body }], [newComponent]);
    assert.equal(verifySchematicElectricalEffect(operation, before.source, after.source, before.native, after.native, { createdId: "label-id" }).added.length, 1);
    const inverse = inverseSchematicElectricalOperation(operation, { createdId: "label-id" });
    verifySchematicElectricalEffect(inverse, after.source, before.source, after.native, before.native);
    assert.throws(() => buildSchematicOperationCallExpression(operation), /fixed native/u);
    const malformed = snapshot([...before.source.objects, { id: "label-id", type: "ATTR", body: { ...body, color: "red" } }], [newComponent]);
    assert.throws(() => verifySchematicElectricalEffect(operation, before.source, malformed.source, before.native, malformed.native, { createdId: "label-id" }), /unplanned/u);
  });

  void it("adds only the no-connect marker without rewriting the pin or hidden properties", () => {
    const before = baseline();
    const operation = { id: "nc", action: "sch.component-pin.no-connect", target: { primitiveId: "pin" }, noConnected: true };
    const code = buildSchematicElectricalAdapter(operation, before.source, before.native).expression;
    assert.match(code, /getOrCreateNoConnect/u);
    assert.doesNotMatch(code, /\.done\(/u);
    const body = { parentId: "pin", key: "NO_CONNECT", x: 15, y: -20, value: "yes", zIndex: 2, locked: false, groupId: "" };
    const current = structuredClone(component);
    assert.ok(current.pins[0]); current.pins[0].noConnect = { id: "marker", value: "yes", body };
    const after = snapshot([...before.source.objects, { id: "marker", type: "ATTR", body }], [current]);
    assert.equal(verifySchematicElectricalEffect(operation, before.source, after.source, before.native, after.native).added.length, 1);
    current.pins[0].net = "unexpected";
    const drift = snapshot(after.source.objects, [current]);
    assert.throws(() => verifySchematicElectricalEffect(operation, before.source, drift.source, before.native, drift.native), /another native pin/u);
    assert.throws(() => buildSchematicOperationCallExpression(operation), /fixed native/u);
  });

  void it("deletes exactly the component-owned source records and preserves all other records", () => {
    const before = baseline();
    const operation = { id: "delete", action: "sch.component.delete", target: { primitiveId: "part" } };
    const after = snapshot([canvas], []);
    const code = buildSchematicElectricalAdapter(operation, before.source, before.native).expression;
    assert.match(code, /model\.remove\(\)/u);
    assert.match(code, /return true;/u);
    assert.equal(verifySchematicElectricalEffect(operation, before.source, after.source, before.native, after.native).removed.length, 1);
    assert.equal(inverseSchematicElectricalOperation(operation, {}), undefined);
    const drift = snapshot([{ ...canvas, body: { originX: 1, originY: 0 } }], []);
    assert.throws(() => verifySchematicElectricalEffect(operation, before.source, drift.source, before.native, drift.native), /unplanned/u);
  });

  void it("rejects wrong targets, locked components, ID collisions, and nonfinite pin geometry before dispatch", () => {
    const before = baseline();
    assert.throws(() => { assertSchematicElectricalSupported({ id: "d", action: "sch.net-label.delete", target: { primitiveId: "part" } }, before.source, before.native); }, /standalone/u);
    assert.throws(() => buildSchematicElectricalAdapter({ id: "l", action: "sch.net-label.create", properties: { net: "N", x: 0, y: 0 } }, before.source, before.native, { createdId: "part" }), /collides/u);
    const locked = structuredClone(component); locked.locked = true;
    const lockedSnapshot = snapshot(before.source.objects, [locked]);
    assert.throws(() => { assertSchematicElectricalSupported({ id: "n", action: "sch.component-pin.no-connect", target: { primitiveId: "pin" }, noConnected: true }, lockedSnapshot.source, lockedSnapshot.native); }, /unlocked/u);
    const malformed = structuredClone(component); assert.ok(malformed.pins[0]); delete malformed.pins[0].body["x"];
    const invalid = snapshot(before.source.objects, [malformed]);
    assert.throws(() => { assertSchematicElectricalSupported({ id: "n", action: "sch.component-pin.no-connect", target: { primitiveId: "pin" }, noConnected: true }, invalid.source, invalid.native); }, /finite/u);
  });
});
