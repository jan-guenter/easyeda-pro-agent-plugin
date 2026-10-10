import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseDocumentSource } from "../src/document-source.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "../src/document-source.ts";
import { SCHEMATIC_NATIVE_PROFILE, schematicNativeSnapshotSchema } from "../src/schematic-native-adapter.ts";
import type { SchematicNativeSnapshot } from "../src/schematic-native-adapter.ts";
import { compileSchematicOperation } from "../src/schematic-operations.ts";
import { assertSchematicSourceProfileSupported, buildInverseSchematicOperation, correlateSchematicNativeSource, prepareSchematicSourceOperation, verifySchematicSourceEffect } from "../src/schematic-source-proof.ts";

function rows(objects: readonly NativeSourceObject[]): string {
  return `{"type":"DOCHEAD"}||{"docType":"SCH_PAGE","uuid":"page"}|\n${objects.map(({ id, type, body }) => `${JSON.stringify({ id, type })}||${JSON.stringify(body)}`).join("|\n")  }|\n`;
}
function source(objects: readonly NativeSourceObject[]): NativeSourceSnapshot {
  return parseDocumentSource(rows(objects));
}
function fixture(x = 10, count = "5"): { source: NativeSourceSnapshot; native: SchematicNativeSnapshot } {
  const component: NativeSourceObject = { id: "part", type: "COMPONENT", body: { partId: "p1", x, y: -20, rotation: 0, isMirror: false, attrs: {}, zIndex: 1 } };
  const attributes = [
    { id: "a", key: "3D Model", value: "model", symbolValue: "model", blockValue: null, instanceValue: null, body: { parentId: "part", key: "3D Model", value: null, x: null, y: null } },
    { id: "b", key: "Count", value: count, symbolValue: "5", blockValue: count, instanceValue: null, body: { parentId: "part", key: "Count", value: count, x: null, y: null } },
  ];
  const objects = [component, ...attributes.map(({ id, body }): NativeSourceObject => ({ id, type: "ATTR", body })), { id: "CANVAS", type: "CANVAS", body: { originX: 0, originY: 0 } }];
  const publicSource = source(objects);
  const native = schematicNativeSnapshotSchema.parse({ profile: SCHEMATIC_NATIVE_PROFILE, document: { documentUuid: "page", tabId: "page@project" }, source: rows(publicSource.objects), components: [{ id: "part", kind: "part", locked: false, body: component.body, attributes, pins: [{ id: "part_pin", body: { x: x + 5, y: -20, rotation: 0, length: 10 }, attributes: [], net: "N1", noConnect: null }] }] });
  return { source: publicSource, native };
}
const lineBody = { fillColor: null, fillStyle: null, strokeColor: null, strokeStyle: null, strokeWidth: null, startX: 10, startY: -20, endX: 40, endY: -20, lineGroup: "wire" };

void describe("schematic native-source proof", () => {
  void it("correlates all source records and native component/attribute identities", () => {
    const before = fixture();
    assert.deepEqual(correlateSchematicNativeSource(before.source, before.native), before.native);
    assert.throws(() => correlateSchematicNativeSource(before.source, { ...before.native, components: [] }), /inventory/u);
    assert.throws(() => correlateSchematicNativeSource(before.source, { ...before.native, source: rows(before.source.objects.filter(({ id }) => id !== "CANVAS")) }), /disagrees/u);
    assert.throws(() => correlateSchematicNativeSource({ ...before.source, sha256: "0".repeat(64) }, before.native), /Invalid/u);
  });

  void it("proves exact component translation and its identity-preserving inverse", () => {
    const before = fixture();
    const after = fixture(15);
    const operation = { id: "move", action: "sch.component.modify", target: { primitiveId: "part" }, patch: { x: 15 } };
    const compiled = prepareSchematicSourceOperation(operation, before.source, before.native);
    const delta = verifySchematicSourceEffect(compiled, before.source, after.source, {}, { before: before.native, after: after.native });
    assert.equal(delta.changed.length, 1);
    const inverse = buildInverseSchematicOperation(operation, before.source, {}, before.native);
    assert.deepEqual(inverse, { id: "inverse:move", action: "sch.component.modify", documentType: 1, target: { primitiveId: "part" }, patch: { x: 10 } });
    const reverse = prepareSchematicSourceOperation(inverse, after.source, after.native);
    verifySchematicSourceEffect(reverse, after.source, before.source, {}, { before: after.native, after: before.native });
    const pinChanged = structuredClone(after.native);
    const model = pinChanged.components[0];
    assert.ok(model?.pins[0]);
    model.pins[0].net = "WRONG";
    assert.throws(() => verifySchematicSourceEffect(compiled, before.source, after.source, {}, { before: before.native, after: pinChanged }), /pins, nets/u);
    assert.throws(() =>{  assertSchematicSourceProfileSupported({ ...operation, patch: { rotation: 90 } }, before.source, {}, before.native); }, /graphic-transform/u);
  });

  void it("proves a zero-valued property without clearing hidden inherited metadata", () => {
    const before = fixture();
    const after = fixture(10, "0");
    const operation = { id: "property", action: "sch.component.modify", target: { primitiveId: "part" }, patch: { otherProperty: { Count: 0 } } };
    const compiled = prepareSchematicSourceOperation(operation, before.source, before.native);
    verifySchematicSourceEffect(compiled, before.source, after.source, {}, { before: before.native, after: after.native });
    assert.equal(buildInverseSchematicOperation(operation, before.source, {}, before.native), undefined);
    const lossy = structuredClone(after.native);
    const model = lossy.components[0];
    assert.ok(model);
    model.attributes = model.attributes.filter(({ key }) => key !== "3D Model");
    assert.throws(() => verifySchematicSourceEffect(compiled, before.source, after.source, {}, { before: before.native, after: lossy }), /attribute preservation/u);
    assert.throws(() => prepareSchematicSourceOperation({ ...operation, patch: { otherProperty: { New: 0 } } }, before.source, before.native), /creation\/default/u);
    const instance = structuredClone(before.native);
    const count = instance.components[0]?.attributes.find(({ key }) => key === "Count");
    assert.ok(count);
    count.instanceValue = "5";
    assert.throws(() => prepareSchematicSourceOperation(operation, before.source, instance), /instance-document/u);
  });

  void it("proves complete unnamed wire create/delete and rejects hidden line collateral", () => {
    const before = source([{ id: "CANVAS", type: "CANVAS", body: { originX: 0, originY: 0 } }]);
    const created = source([...before.objects, { id: "wire", type: "WIRE", body: { zIndex: 1 } }, { id: "segment", type: "LINE", body: lineBody }]);
    const operation = { id: "wire-op", action: "sch.wire.create", properties: { line: [10, 20, 40, 20], net: "", color: null, lineWidth: null, lineType: null } };
    const compiled = prepareSchematicSourceOperation(operation, before);
    verifySchematicSourceEffect(compiled, before, created, { createdId: "wire" });
    const inverse = buildInverseSchematicOperation(operation, before, { createdId: "wire" });
    verifySchematicSourceEffect(compileSchematicOperation(inverse), created, before);
    assert.equal(buildInverseSchematicOperation(inverse, created), undefined);
    const hiddenObjects = structuredClone(created.objects);
    const hiddenLine = hiddenObjects.find((entry) => entry.type === "LINE");
    assert.ok(hiddenLine);
    hiddenLine.body["locked"] = true;
    const hidden = source(hiddenObjects);
    assert.throws(() => verifySchematicSourceEffect(compiled, before, hidden, { createdId: "wire" }), /unknown wire-line/u);
    const collateralObjects = structuredClone(created.objects);
    const canvas = collateralObjects.find((entry) => entry.id === "CANVAS");
    assert.ok(canvas);
    canvas.body["originX"] = 99;
    const collateral = source(collateralObjects);
    assert.throws(() => verifySchematicSourceEffect(compiled, before, collateral, { createdId: "wire" }), /unrelated/u);
    assert.throws(() => prepareSchematicSourceOperation({ ...operation, properties: { ...operation.properties, net: "NAMED" } }, before), /named-net/u);
  });
});
