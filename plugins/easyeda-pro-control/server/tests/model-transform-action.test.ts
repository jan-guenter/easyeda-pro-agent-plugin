import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { sha256Json } from "../src/core.ts";
import { buildModelTransformAdapter, compileModelTransformOperation, decodeModelTransform, encodeModelTransform,
  expectedModelTransformSource, inverseModelTransformOperation, modelTransformOperationSchema, verifyModelTransformSourceEffect } from "../src/model-transform-action.ts";
import type { ModelTransform } from "../src/model-transform-action.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import type { NativeSourceSnapshot } from "../src/document-source.ts";
import { assertDesignActionSupported, compileDesignAction, inverseDesignAction, prepareDesignAction, verifyDesignAction } from "../src/design-action.ts";
import { listDesignActionCapabilities } from "../src/design-capabilities.ts";
import { pcbExactFrameFixture } from "./pcb-exact-frame-fixture.ts";

const legacy: ModelTransform = { format: "legacy", dimensionsMil: { x: 100, y: 200, z: 300 }, rotationDegrees: { x: 10, y: 20, z: 30 }, offsetMil: { x: 1, y: 2, z: -3 } };
const affine: ModelTransform = { format: "affine-v2", linearColumnMajor: [1, 2, 3, 4, 5, 6, 7, 8, 10], translationMil: { x: 11, y: 12, z: 13 } };
const operation = { id: "adjust-model", action: "pcb.component.model-transform" as const, target: { primitiveId: "component" }, attributeId: "transform", transform: legacy };
const scope = { libraryUuid: "collection", metadataOwnerUuid: "owner", footprintUuid: "document", footprintName: "Fixture footprint" };
function snapshot(footprint = false): NativeSourceSnapshot {
  const parentId = footprint ? "" : "component";
  const objects = [
    { id: "transform", type: "ATTR", body: { parentId, key: "3D Model Transform", value: "10,20,30,0,0,0,0,0,0", x: null, y: null, color: "#000000", locked: false } },
    { id: "model", type: "ATTR", body: { parentId, key: "3D Model", value: "model-uuid|collection" } },
    { id: "model-title", type: "ATTR", body: { parentId, key: "3D Model Title", value: "Fixture socket" } },
    { id: "footprint", type: "ATTR", body: { parentId, key: "Footprint", value: "Fixture footprint" } },
    { id: "pad", type: "PAD", body: { parentId: footprint ? "" : "component", x: 10, y: 20, number: "1", net: footprint ? "" : "GND", hole: { diameter: 40 }, locked: false } },
    ...(footprint ? [] : [{ id: "component", type: "COMPONENT", body: { x: 100, y: 200, angle: 90, layerId: 1, locked: false, footprintUuid: "fixture-footprint" } },
      { id: "locked-neighbor", type: "COMPONENT", body: { x: 1000, y: 1000, angle: 0, layerId: 1, locked: true } }]),
  ];
  const result = { schema: "easyeda-pro-control.document-source.v1" as const, document: { uuid: "document", docType: "PCB", editVersion: "3.2.149.88089769" }, objects: objects.toSorted((a, b) => a.id.localeCompare(b.id)) };
  return { ...result, sha256: sha256Json(result) };
}
function change(source: NativeSourceSnapshot, id: string, patch: Record<string, unknown>): NativeSourceSnapshot {
  const objects = source.objects.map((record) => record.id === id ? { id: record.id, type: record.type, body: { ...record.body, ...patch } } : record);
  const result = { schema: source.schema, document: source.document, objects };
  return { ...result, sha256: sha256Json(result) };
}
function encodeSource(source: NativeSourceSnapshot): string {
  return `{"type":"DOCHEAD"}||${JSON.stringify(source.document)}|\n${source.objects.map((entry) => `${JSON.stringify({ id: entry.id, type: entry.type })}||${JSON.stringify(entry.body)}|\n`).join("")}`;
}

void test("model transform formats have exact native field order and reject untyped or malformed input", () => {
  assert.equal(encodeModelTransform(legacy), "100,200,300,30,10,20,1,2,-3");
  assert.deepEqual(decodeModelTransform(encodeModelTransform(legacy)), legacy);
  assert.equal(encodeModelTransform(affine), "v2:[1,2,3,4,5,6,7,8,10,11,12,13]");
  assert.deepEqual(decodeModelTransform(encodeModelTransform(affine)), affine);
  assert.equal(compileModelTransformOperation(operation).documentType, 3);
  assert.equal(compileModelTransformOperation({ id: "footprint", action: "footprint.model-transform", attributeId: "transform", transform: affine }).documentType, 4);
  assert.throws(() => modelTransformOperationSchema.parse({ ...operation, code: "arbitrary" }));
  assert.throws(() => modelTransformOperationSchema.parse({ ...operation, transform: "1,2,3,4,5,6,7,8,9" }));
  assert.throws(() => encodeModelTransform({ ...legacy, dimensionsMil: { x: 1, y: -1, z: 1 } }));
  for (const value of ["1,2,3,4,5,6,7,8", "1junk,2,3,4,5,6,7,8,9", "NaN,2,3,4,5,6,7,8,9", "v2:[1,2,3]", "v2:[1,2,3,4,5,6,7,8,9,10,11,null]"]) {
    assert.throws(() => decodeModelTransform(value));
  }
});

void test("native mixed-zero dimensions survive typed edits and exact inverses without collapsing model height", () => {
  const raw = "31.8897,63.7794,0,90,0,0,0,0,0";
  const transform = decodeModelTransform(raw);
  assert.equal(encodeModelTransform(transform), raw);
  for (const x of [0, 10]) { for (const y of [0, 20]) { for (const z of [0, 30]) {
    const value: ModelTransform = { ...legacy, dimensionsMil: { x, y, z } };
    assert.deepEqual(decodeModelTransform(encodeModelTransform(value)), value);
  } } }
  const before = change(snapshot(), "transform", { value: raw });
  const after = expectedModelTransformSource(operation, before);
  const inverse = inverseModelTransformOperation(operation, before);
  assert.ok(inverse);
  assert.deepEqual(expectedModelTransformSource(inverse, after), before);
  const capabilities = listDesignActionCapabilities();
  assert.ok(Array.isArray(capabilities["actions"]));
  assert.ok(capabilities["actions"].includes("pcb.component.model-transform"));
  assert.ok(capabilities["actions"].includes("footprint.model-transform"));

  // Exact native VJ from pcb3d.js 3.2.149.5378b690, SHA-256
  // 751def6c9cdaefe5034eb627ac192df38c0ace7c8a99342658639b161b10ba9d.
  // The downstream smt-gl engine uses the same positive-finite ratio filter.
  const native = "function VJ(e,t,i){if(e){let r=e.maxX-e.minX,s=e.maxY-e.minY,n=e.maxZ-e.minZ,a=[tt.dx/r,tt.dy/s,tt.dz/n].filter(l=>isFinite(l)&&l>0),o=Math.min(...a);o=isFinite(o)&&o>0?o:i||1,tt.dx=r*o,tt.dy=s*o,tt.dz=n*o,tt.ox=r*t,tt.oy=s*t,tt.oz=n*t}}";
  const tt = { dx: 31.8897, dy: 63.7794, dz: 0 };
  runInNewContext(`${native}; VJ({minX:0,maxX:1,minY:0,maxY:2,minZ:0,maxZ:0.5},1,1);`, { tt });
  assert.equal(tt.dx, 31.8897);
  assert.equal(tt.dy, 63.7794);
  assert.equal(tt.dz, 15.94485);
});

void test("PCB transform changes only the exact ATTR value and inverse preserves raw evidence", () => {
  const before = snapshot(), original = JSON.stringify(before);
  const after = expectedModelTransformSource(operation, before);
  const delta = verifyModelTransformSourceEffect(operation, before, after);
  assert.equal(delta.changed.length, 1);
  assert.equal(delta.changed[0]?.before.id, "transform");
  assert.deepEqual(delta.changed[0]?.fields, ["value"]);
  const inverse = inverseModelTransformOperation(operation, before);
  assert.ok(inverse);
  assert.deepEqual(expectedModelTransformSource(inverse, after), before);
  const compiled = compileDesignAction(operation);
  const prepared = prepareDesignAction(operation, { source: before }, { targetId: "component" });
  assert.equal(compiled.profile, "easyeda-pro-control.model-transform.v1");
  assert.equal(prepared.adapterProfile, compiled.profile);
  assert.deepEqual(prepared.expectedSource, after);
  assert.deepEqual(verifyDesignAction(compiled, { source: before }, { source: after }), delta);
  assert.deepEqual(inverseDesignAction(operation, { source: before }), inverse);
  assert.throws(() => { assertDesignActionSupported(operation, { source: before }, { targetId: "wrong" }); }, /journal identity/u);
  assert.equal(JSON.stringify(before), original);
  assert.equal(inverseModelTransformOperation(operation, change(before, "transform", { value: "10.0,20,30,0,0,0,0,0,0" })), undefined);
  for (const [id, patch] of [["component", { x: 101 }], ["pad", { net: "POWER" }], ["model", { value: "different-model" }],
    ["model-title", { value: "different-title" }], ["footprint", { value: "different-footprint" }], ["transform", { x: 1 }]] as const) {
    assert.throws(() => verifyModelTransformSourceEffect(operation, before, change(after, id, patch)), /beyond its single ATTR/u);
  }
  assert.throws(() => expectedModelTransformSource(operation, change(before, "component", { locked: true })), /unlocked/u);
  assert.throws(() => expectedModelTransformSource(operation, change(before, "transform", { locked: true })), /separate explicit unlock/u);
  assert.throws(() => expectedModelTransformSource(operation, change(before, "transform", { parentId: "locked-neighbor" })), /belong/u);
  assert.throws(() => expectedModelTransformSource({ ...operation, attributeId: "missing-inherited" }, before), /existing stored ATTR/u);
  assert.throws(() => expectedModelTransformSource(operation, { ...before, sha256: "0".repeat(64) }), /baseline/u);
});

void test("footprint transform binds its native library owner and preserves geometry and model identity", () => {
  const before = snapshot(true);
  const action = { id: "footprint", action: "footprint.model-transform", attributeId: "transform", transform: affine };
  const adapter = buildModelTransformAdapter(action, before, scope);
  assert.throws(() => prepareDesignAction(action, { source: before }), /checkpoint-bound library scope/u);
  assert.deepEqual(prepareDesignAction(action, { source: before, footprintScope: scope }).expectedSource, adapter.expected);
  assert.match(adapter.code, /parentLibraryUuid !== MODEL_FOOTPRINT_SCOPE.metadataOwnerUuid/u);
  assert.match(adapter.code, /EXPECTED_DOCUMENT_TYPE !== 4/u);
  assert.equal(verifyModelTransformSourceEffect(action, before, adapter.expected).changed[0]?.before.id, "transform");
  const inverse = inverseModelTransformOperation(action, before);
  assert.ok(inverse);
  assert.deepEqual(expectedModelTransformSource(inverse, adapter.expected), before);
  assert.throws(() => buildModelTransformAdapter(action, before), /Invalid input/u);
  assert.throws(() => buildModelTransformAdapter(action, before, { ...scope, footprintUuid: "different" }), /scope disagree/u);
  assert.throws(() => buildModelTransformAdapter(action, change(before, "model-title", { key: "3D Model Transform" }), scope), /implicit native repair/u);
});

void test("generated native merge dispatches once and refuses complete baseline drift before mutation", async () => {
  const before = snapshot();
  const adapter = buildModelTransformAdapter(operation, before);
  const fixture = pcbExactFrameFixture("document", encodeSource(before));
  assert.equal(await fixture.run(adapter.code), true);
  assert.equal(fixture.state.writes.length, 1);
  assert.deepEqual(parseDocumentSource(fixture.state.source), adapter.expected);
  fixture.state.source = encodeSource(change(before, "pad", { net: "OTHER" }));
  await assert.rejects(fixture.run(adapter.code), /baseline drift/u);
  assert.equal(fixture.state.writes.length, 1);
});
