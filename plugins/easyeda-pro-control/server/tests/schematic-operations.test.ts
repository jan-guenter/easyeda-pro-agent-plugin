import assert from "node:assert/strict";
import { test } from "node:test";
import {
  SCHEMATIC_OPERATION_UNIMPLEMENTED,
  buildSchematicOperationCallExpression,
  compileSchematicOperation,
  compileSchematicOperationBatch,
  prepareSchematicOperation,
  schematicOperationBatchSchema,
  schematicOperationSchema,
} from "../src/schematic-operations.ts";

const style = { color: null, fillColor: null, lineWidth: null, lineType: null };
const fixtures = [
  { family: "wire", documentType: 1, properties: { line: [0, 0, 20, 0], net: "VCC", color: null, lineWidth: null, lineType: null }, expression: 'eda.sch_PrimitiveWire.create([0,0,20,0],"VCC",null,null,null)' },
  { family: "bus", documentType: 1, properties: { busName: "D[0:7]", line: [[0, 0, 100, 0]], color: null, lineWidth: null, lineType: null }, expression: 'eda.sch_PrimitiveBus.create("D[0:7]",[[0,0,100,0]],null,null,null)' },
  { family: "pin", documentType: 2, properties: { x: 0, y: 0, pinNumber: "1", pinName: "IN", rotation: 0, pinLength: 20, pinColor: null, pinShape: "None", pinType: "IN" }, expression: 'eda.sch_PrimitivePin.create(0,0,"1","IN",0,20,null,"None","IN")' },
  { family: "text", documentType: 1, properties: { x: 1, y: 2, content: "Fixture", rotation: 90, textColor: null, fontName: null, fontSize: null, bold: false, italic: false, underLine: false, alignMode: 5 }, expression: 'eda.sch_PrimitiveText.create(1,2,"Fixture",90,null,null,null,false,false,false,5)' },
  { family: "polygon", documentType: 1, properties: { line: [0, 0, 30, 0, 30, 30], ...style }, expression: 'eda.sch_PrimitivePolygon.create([0,0,30,0,30,30],null,null,null,null)' },
  { family: "rectangle", documentType: 1, properties: { topLeftX: 1, topLeftY: 2, width: 30, height: 40, cornerRadius: 0, rotation: 0, ...style, fillStyle: null }, expression: 'eda.sch_PrimitiveRectangle.create(1,2,30,40,0,0,null,null,null,null,null)' },
  { family: "arc", documentType: 1, properties: { startX: 0, startY: 0, referenceX: 10, referenceY: 10, endX: 20, endY: 0, ...style }, expression: 'eda.sch_PrimitiveArc.create(0,0,10,10,20,0,null,null,null,null)' },
  { family: "circle", documentType: 1, properties: { centerX: 10, centerY: 20, radius: 30, ...style, fillStyle: null }, expression: 'eda.sch_PrimitiveCircle.create(10,20,30,null,null,null,null,null)' },
  { family: "component", documentType: 1, properties: { component: { libraryUuid: "library", uuid: "device" }, x: 10, y: 20, subPartName: "A", rotation: 90, mirror: false, addIntoBom: true, addIntoPcb: true }, expression: 'eda.sch_PrimitiveComponent.create({"libraryUuid":"library","uuid":"device"},10,20,"A",90,false,true,true)' },
  { family: "port", documentType: 1, properties: { direction: "BI", net: "DATA", x: 20, y: 30, rotation: 0, mirror: false }, expression: 'eda.sch_PrimitiveComponent.createNetPort("BI","DATA",20,30,0,false)' },
  { family: "net-flag", documentType: 1, properties: { identification: "Ground", net: "GND", x: 20, y: 30, rotation: 0, mirror: false }, expression: 'eda.sch_PrimitiveComponent.createNetFlag("Ground","GND",20,30,0,false)' },
  { family: "net-label", documentType: 1, properties: { x: 20, y: 30, net: "DATA" }, expression: 'eda.sch_PrimitiveAttribute.createNetLabel(20,30,"DATA")' },
];

void test("schematic creates preserve reviewed positional order for all twelve forms", () => {
  for (const fixture of fixtures) {
    const operation = { id: fixture.family, action: `sch.${fixture.family}.create`, documentType: fixture.documentType, properties: fixture.properties };
    if (fixture.family === "net-label") { assert.throws(() => buildSchematicOperationCallExpression(operation), /fixed native/u); }
    else { assert.equal(buildSchematicOperationCallExpression(operation), fixture.expression); }
    const compiled = compileSchematicOperation(operation);
    assert.equal(compiled.resultKind, "created-primitive");
    assert.equal(compiled.documentType, fixture.documentType);
    assert.ok(compiled.beforeReads.some((read) => read.purpose === "complete-document-source"));
    assert.ok(compiled.afterReads.some((read) => read.purpose === "target"));
  }
});

void test("component modify requires complete captured properties and merges without clearing omitted fields", () => {
  const operation = { id: "move", action: "sch.component.modify", target: { primitiveId: "component" }, patch: { x: 40, otherProperty: { Voltage: "5V" } } };
  const compiled = compileSchematicOperation(operation);
  assert.equal(compiled.requiredPreservation?.kind, "complete-schematic-properties");
  assert.throws(() => buildSchematicOperationCallExpression(operation), /baseline is required/u);
  const baseline = { otherProperty: { "3D Model": "model-id", "Channel ID": "channel", Voltage: "3V3", Custom: true }, manufacturer: "Maker", manufacturerId: "part", supplier: "Vendor", supplierId: "stock" };
  assert.equal(buildSchematicOperationCallExpression(operation, {}, { move: baseline }), 'eda.sch_PrimitiveComponent.modify("component",{"otherProperty":{"3D Model":"model-id","Channel ID":"channel","Voltage":"5V","Custom":true},"manufacturer":"Maker","manufacturerId":"part","supplier":"Vendor","supplierId":"stock","x":40})');
  assert.equal(baseline.otherProperty.Voltage, "3V3");
  const prepared = prepareSchematicOperation(operation, { move: baseline });
  assert.deepEqual(prepared.expectedFields.find((field) => field.field === "otherProperty")?.value, { ...baseline.otherProperty, Voltage: "5V" });
  assert.equal(prepared.expectedFields.find((field) => field.field === "supplier")?.value, "Vendor");
  assert.deepEqual(compiled.inverse, { kind: "restore-patch-from-before", api: "sch_PrimitiveComponent", target: { primitiveId: "component" }, fields: ["x", "otherProperty"] });
});

void test("generic metadata patches reject every native library binding while retaining captured bindings", () => {
  const operation = { id: "edit", action: "sch.component.modify", target: { primitiveId: "part" } };
  const keys = ["Device", "Symbol", "Footprint", "OBJ", "3D Model", "3D Model Title", "Origin 3D Model Title", "3D Model Transform", "Origin Footprint"];
  for (const key of keys) {
    assert.equal(schematicOperationSchema.safeParse({ ...operation, patch: { otherProperty: { [key]: "replacement" } } }).success, false, key);
    assert.throws(() => compileSchematicOperation({ ...operation, patch: { otherProperty: { [key]: "" } } }), /Library-binding/u, key);
  }
  const baseline = { otherProperty: Object.fromEntries(keys.map((key) => [key, `captured:${key}`])), manufacturer: "Maker", manufacturerId: "part", supplier: "Vendor", supplierId: "stock" };
  const prepared = prepareSchematicOperation({ ...operation, patch: { manufacturer: "Other Maker" } }, { edit: baseline });
  assert.deepEqual(prepared.expectedFields.find((field) => field.field === "otherProperty")?.value, baseline.otherProperty);
  assert.equal(prepared.expectedFields.find((field) => field.field === "manufacturer")?.value, "Other Maker");
  assert.equal(schematicOperationSchema.safeParse({ ...operation, patch: { otherProperty: { Manufacturer: "Other Maker", Comment: "ordinary metadata" } } }).success, true);
});

void test("pins distinguish editable symbol pins from component-pin no-op setters", () => {
  assert.equal(schematicOperationSchema.safeParse({ id: "p", action: "sch.pin.modify", documentType: 1, target: { primitiveId: "pin" }, patch: { x: 20 } }).success, false);
  const pin = compileSchematicOperation({ id: "p", action: "sch.pin.modify", documentType: 2, target: { primitiveId: "pin" }, patch: { pinType: "Passive" } });
  assert.equal(pin.expectedFields[0]?.getter, "getState_pinType");
  assert.equal(buildSchematicOperationCallExpression({ id: "p", action: "sch.component-pin.renumber", target: { primitiveId: "component.pin" }, pinNumber: "2" }), 'eda.sch_PrimitivePin.modify("component.pin",{"pinNumber":"2"})');
  assert.equal(schematicOperationSchema.safeParse({ id: "p", action: "sch.component-pin.renumber", target: { primitiveId: "pin" }, pinNumber: "2", x: 20 }).success, false);
});

void test("wire verification cannot treat a hidden getter failure as a blank sheet", () => {
  const compiled = compileSchematicOperation({ id: "wire", action: "sch.wire.modify", target: { primitiveId: "wire" }, patch: { line: [0, 0, 30, 30], net: "GND" } });
  assert.ok(compiled.expectedFields.every((field) => field.authority === "document-source-required"));
  assert.ok(compiled.limitations.includes("public-wire-enumerators-hide-rpc-failure-use-document-source"));
  assert.equal(schematicOperationSchema.safeParse({ id: "wire", action: "sch.wire.modify", documentType: 2, target: { primitiveId: "wire" }, patch: { net: "GND" } }).success, false);
  assert.equal(schematicOperationSchema.safeParse({ id: "wire", action: "sch.wire.modify", target: { primitiveId: "wire" }, patch: { line: [0, 0, 30] } }).success, false);
});

void test("sequential references preserve native family aliases and active document type", () => {
  const create = { id: "port", action: "sch.port.create", properties: { direction: "BI", net: "DATA", x: 20, y: 30, rotation: 0, mirror: false } };
  const remove = { id: "remove", action: "sch.component.delete", target: { resultOf: "port" } };
  assert.equal(compileSchematicOperationBatch({ operations: [create, remove] }).length, 2);
  assert.equal(buildSchematicOperationCallExpression(remove, { port: "created-port" }), 'eda.sch_PrimitiveComponent.delete("created-port")');
  assert.equal(schematicOperationBatchSchema.safeParse({ operations: [remove, create] }).success, false);
  assert.equal(schematicOperationBatchSchema.safeParse({ operations: [create, create] }).success, false);
  assert.equal(schematicOperationBatchSchema.safeParse({ operations: [create, { id: "pin", action: "sch.pin.delete", documentType: 2, target: { primitiveId: "pin" } }] }).success, false);
  assert.equal(schematicOperationBatchSchema.safeParse({ operations: [create, { ...remove, action: "sch.wire.delete" }] }).success, false);
});

void test("net-label inverse does not call the no-op generic attribute delete", () => {
  const compiled = compileSchematicOperation({ id: "label", action: "sch.net-label.create", properties: { x: 1, y: 2, net: "DATA" } });
  assert.equal(compiled.inverse.kind, "restore-from-checkpoint");
  assert.equal(compiled.expectedFields.find((field) => field.field === "net")?.authority, "document-source-required");
  assert.equal(schematicOperationSchema.safeParse({ id: "bad", action: "sch.attribute.delete", target: { primitiveId: "label" } }).success, false);
});

void test("schematic data cannot select code, methods or unknown metadata patch keys", () => {
  const hostile = '");globalThis.bad=true;//';
  const operation = { id: "text", action: "sch.text.modify", target: { primitiveId: hostile }, patch: { content: hostile } };
  assert.equal(buildSchematicOperationCallExpression(operation), `eda.sch_PrimitiveText.modify(${JSON.stringify(hostile)},{"content":${JSON.stringify(hostile)}})`);
  assert.equal(schematicOperationSchema.safeParse({ ...operation, code: "arbitrary()" }).success, false);
  assert.equal(schematicOperationSchema.safeParse({ ...operation, patch: { content: "safe", callback: "arbitrary()" } }).success, false);
  assert.equal(schematicOperationSchema.safeParse({ id: "bad", action: "sch.net.delete", name: "GND" }).success, false);
  assert.equal(schematicOperationSchema.safeParse({ id: "bad", action: "sch.junction.create", x: 0, y: 0 }).success, false);
  assert.ok(SCHEMATIC_OPERATION_UNIMPLEMENTED.some((entry) => entry.includes("no-op empty stubs")));
});
