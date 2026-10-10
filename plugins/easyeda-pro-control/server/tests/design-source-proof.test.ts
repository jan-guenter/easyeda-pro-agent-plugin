import assert from "node:assert/strict";
import { test } from "node:test";

import { sha256Json } from "../src/core.ts";
import { compileDesignOperation, designParameterEffects } from "../src/design-operations.ts";
import { assertDesignSourceProfileSupported, buildExpectedDesignSource, buildInverseDesignOperation, verifyDesignSourceEffect } from "../src/design-source-proof.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "../src/document-source.ts";

function snapshot(objects: readonly NativeSourceObject[]): NativeSourceSnapshot {
  const body = {
    schema: "easyeda-pro-control.document-source.v1" as const,
    document: { docType: "PCB", uuid: "test-board", editVersion: "test-version" },
    objects: objects.toSorted((left, right) => left.id.localeCompare(right.id)),
  };
  return { ...body, sha256: sha256Json(body) };
}

const COMPONENT: NativeSourceObject = { id: "component", type: "COMPONENT", body: { partitionId: "", groupId: 0, layerId: 1, x: 20.1, y: -40, angle: 0, attrs: { "Unique ID": "unique-one" }, locked: false, zIndex: -1 } };
const ATTRIBUTE: NativeSourceObject = { id: "component-label", type: "ATTR", body: { parentId: "component", layerId: 3, x: 35.5678, y: -44.4444, angle: 0, key: "Designator", value: "R1", locked: false, mirror: false } };
const HIDDEN: NativeSourceObject = { id: "component-hidden", type: "ATTR", body: { parentId: "component", layerId: 3, x: null, y: null, angle: 0, key: "Device", value: "fixture-device", locked: false } };
const PAD_NET: NativeSourceObject = { id: "pad-net", type: "PAD_NET", body: { netName: "GND", componentId: "component", padId: "pin-one" } };
const OPAQUE: NativeSourceObject = { id: "future", type: "FUTURE_RECORD", body: { nested: { untouched: [1, 2, 3] } } };
const BASELINE = snapshot([COMPONENT, ATTRIBUTE, HIDDEN, PAD_NET, OPAQUE]);
const MOVE = { id: "move", action: "pcb.component.modify", target: { primitiveId: "component" }, patch: { x: 25.6, y: -35 } };
const LINE_PROPERTIES = { net: "", layer: 1, startX: 0, startY: 5, endX: 10, endY: 15, lineWidth: 6, primitiveLock: false };
const LINE: NativeSourceObject = { id: "line-one", type: "LINE", body: { partitionId: "", groupId: 0, netName: "", layerId: 1, startX: 0, startY: 5, endX: 10, endY: 15, width: 6, locked: false, zIndex: -1 } };

void test("native area outline width is explicitly reported and via creation matches its serialized fields", () => {
  const pour = { id: "pour", action: "pcb.pour.create", properties: { net: "", layer: 1, complexPolygon: ["R", 0, 0, 30, 30, 0, 0], pourFillMethod: "solid", preserveSilos: true, pourName: "Test plane", pourPriority: 1, lineWidth: 6, primitiveLock: false } };
  const ids = { createdId: "0123456789abcdef" };
  const after = buildExpectedDesignSource(pour, BASELINE, ids);
  assert.equal(after.objects.find((entry) => entry.id === ids.createdId)?.body["width"], 0.2);
  assert.deepEqual(designParameterEffects(pour).map((entry) => [entry["requested"], entry["effective"]]), [[6, 0.2]]);
  assert.throws(() => verifyDesignSourceEffect(compileDesignOperation(pour), BASELINE, changed(after, { [ids.createdId]: { width: 6 } }), ids), /does not match/u);
  const via = { id: "via", action: "pcb.via.create", properties: { net: "", x: 1, y: 2, holeDiameter: 12, diameter: 24, viaType: 0, designRuleBlindViaName: null, solderMaskExpansion: null, primitiveLock: false } };
  const created = buildExpectedDesignSource(via, BASELINE, ids);
  const body = created.objects.find((entry) => entry.id === ids.createdId)?.body;
  assert.ok(body);
  assert.equal(Object.hasOwn(body, "zIndex"), false);
  assert.deepEqual(body["unusedInnerLayers"], []);
  assert.throws(() => verifyDesignSourceEffect(compileDesignOperation(via), BASELINE, changed(created, { [ids.createdId]: { unusedInnerLayers: [15] } }), ids), /default/u);
});

function changed(before: NativeSourceSnapshot, patches: Readonly<Record<string, Record<string, unknown>>>): NativeSourceSnapshot {
  return snapshot(before.objects.map((object) => ({ ...object, body: { ...object.body, ...patches[object.id] } })));
}

void test("component translation proves exact attribute movement and preserves all pad nets and opaque records", () => {
  assertDesignSourceProfileSupported(MOVE, BASELINE);
  const after = changed(BASELINE, { component: { x: 25.6, y: -35 }, "component-label": { x: 41.0678, y: -39.4444 } });
  const delta = verifyDesignSourceEffect(compileDesignOperation(MOVE), BASELINE, after);
  assert.deepEqual(delta.changed.map((entry) => entry.after.id), ["component", "component-label"]);
  const inverse = buildInverseDesignOperation(MOVE, BASELINE);
  assert.ok(inverse !== undefined && "patch" in inverse);
  assert.deepEqual(inverse.patch, { x: 20.1, y: -40 });
  verifyDesignSourceEffect(compileDesignOperation(inverse), after, BASELINE);
});

void test("missing child movement, pad-net drift, hidden-attribute edits and unknown collateral fail exactly", () => {
  const expected = changed(BASELINE, { component: { x: 25.6, y: -35 }, "component-label": { x: 41.0678, y: -39.4444 } });
  for (const after of [
    changed(expected, { "component-label": { x: 41.0679 } }),
    changed(expected, { "pad-net": { netName: "VCC" } }),
    changed(expected, { "component-hidden": { value: "another-device" } }),
    changed(expected, { future: { addedField: true } }),
    changed(expected, { component: { attrs: { "Unique ID": "replacement" } } }),
  ]) {
    assert.throws(() => verifyDesignSourceEffect(compileDesignOperation(MOVE), BASELINE, after), /collateral|expected-field/u);
  }
});

void test("unsupported transforms and unknown component children fail before dispatch", () => {
  for (const patch of [{ rotation: 90 }, { layer: 2 }, { x: 25.12345 }]) {
    assert.throws(() =>{  assertDesignSourceProfileSupported({ ...MOVE, patch }, BASELINE); }, /DESIGN_SOURCE_UNSUPPORTED/u);
  }
  const attached = snapshot([...BASELINE.objects, { id: "attached-graphic", type: "LINE", body: { parentId: "component" } }]);
  assert.throws(() =>{  assertDesignSourceProfileSupported(MOVE, attached); }, /non-ATTR/u);
  const locked = changed(BASELINE, { component: { locked: true } });
  assert.throws(() =>{  assertDesignSourceProfileSupported(MOVE, locked); }, /locked target/u);
  assertDesignSourceProfileSupported({ ...MOVE, patch: { primitiveLock: false } }, locked);
});

void test("line create, modify, inverse and delete preserve exact returned identity and every other record", () => {
  const create = { id: "create-line", action: "pcb.line.create", properties: LINE_PROPERTIES };
  assertDesignSourceProfileSupported(create, BASELINE);
  const created = snapshot([...BASELINE.objects, LINE]);
  verifyDesignSourceEffect(compileDesignOperation(create), BASELINE, created, { createdId: LINE.id });
  const modify = { id: "widen", action: "pcb.line.modify", target: { primitiveId: LINE.id }, patch: { lineWidth: 8, endY: 30 } };
  const modified = changed(created, { [LINE.id]: { width: 8, endY: 30 } });
  verifyDesignSourceEffect(compileDesignOperation(modify), created, modified);
  const inverse = buildInverseDesignOperation(modify, created);
  assert.ok(inverse);
  verifyDesignSourceEffect(compileDesignOperation(inverse), modified, created);
  const remove = buildInverseDesignOperation(create, BASELINE, { createdId: LINE.id });
  assert.ok(remove);
  verifyDesignSourceEffect(compileDesignOperation(remove), created, BASELINE);
  assert.equal(buildInverseDesignOperation(remove, created), undefined);
});

void test("line creation refuses unrequested fields, different returned identity, new nets or changed defaults elsewhere", () => {
  const operation = compileDesignOperation({ id: "create-line", action: "pcb.line.create", properties: LINE_PROPERTIES });
  const created = snapshot([...BASELINE.objects, LINE]);
  assert.throws(() => verifyDesignSourceEffect(operation, BASELINE, created, { createdId: "other-id" }), /returned primitive/u);
  assert.throws(() => verifyDesignSourceEffect(operation, BASELINE, changed(created, { [LINE.id]: { unexpected: true } }), { createdId: LINE.id }), /UNSUPPORTED/u);
  assert.throws(() => verifyDesignSourceEffect(operation, BASELINE, snapshot([...created.objects, { id: "new-net", type: "NET", body: {} }]), { createdId: LINE.id }), /outside/u);
  assert.throws(() => verifyDesignSourceEffect(operation, BASELINE, changed(created, { future: { nested: {} } }), { createdId: LINE.id }), /outside/u);
});

void test("malformed hashes, unresolved IDs, group rules and unreviewed primitive fields do not pass", () => {
  assert.throws(() =>{  assertDesignSourceProfileSupported(MOVE, { ...BASELINE, sha256: "0".repeat(64) }); }, /hash/u);
  assert.throws(() =>{  assertDesignSourceProfileSupported({ ...MOVE, target: { resultOf: "earlier" } }, BASELINE); }, /resolved/u);
  assert.throws(() =>{  assertDesignSourceProfileSupported({ id: "rule", action: "pcb.rules.configuration.replace", value: {} }, BASELINE); }, /Incomplete|unreviewed/u);
  const region = snapshot([...BASELINE.objects, { id: "region", type: "REGION", body: { locked: false, prohibitType: ["NO_VIAS"] } }]);
  assert.throws(() =>{  assertDesignSourceProfileSupported({ id: "region-change", action: "pcb.region.modify", target: { primitiveId: "region" }, patch: { ruleType: [3] } }, region); }, /NO_VIAS/u);
});

void test("reviewed rotation and layer flips account for visible and hidden attributes, with exact inverse", () => {
  const before = changed(BASELINE, { "component-hidden": { mirror: false } });
  const rotate = { ...MOVE, patch: { rotation: 90 } };
  const after = changed(before, { component: { angle: 90 }, "component-label": { x: 24.5444, y: -24.5322, angle: 90 }, "component-hidden": { angle: 90 } });
  verifyDesignSourceEffect(compileDesignOperation(rotate), before, after);
  const inverse = buildInverseDesignOperation(rotate, before);
  assert.ok(inverse);
  verifyDesignSourceEffect(compileDesignOperation(inverse), after, before);
  const flip = { ...MOVE, patch: { layer: 2 } };
  const flipped = changed(before, { component: { layerId: 2, angle: 180 }, "component-label": { layerId: 4, x: 4.6322 }, "component-hidden": { layerId: 4 } });
  verifyDesignSourceEffect(compileDesignOperation(flip), before, flipped);
  const unflip = buildInverseDesignOperation(flip, before);
  assert.ok(unflip);
  verifyDesignSourceEffect(compileDesignOperation(unflip), flipped, before);
});

void test("native region, fill and via creation mappings include restrictions, geometry and explicit defaults", () => {
  const path = [0, 0, "L", 20, 0, 20, 20, 0, 20, 0, 0];
  const operations = [
    { id: "region", action: "pcb.region.create", properties: { layer: 12, complexPolygon: path, ruleType: [2, 5, 7], regionName: "", lineWidth: 0, primitiveLock: false } },
    { id: "fill", action: "pcb.fill.create", properties: { layer: 1, complexPolygon: path, net: "", fillMode: 0, lineWidth: 0, primitiveLock: false } },
    { id: "via", action: "pcb.via.create", properties: { net: "", x: 1, y: 2, holeDiameter: 12, diameter: 24, viaType: 0, designRuleBlindViaName: null, solderMaskExpansion: null, primitiveLock: false } },
  ];
  for (const operation of operations) {
    const ids = { createdId: "1234567890abcdef" };
    const after = buildExpectedDesignSource(operation, BASELINE, ids);
    verifyDesignSourceEffect(compileDesignOperation(operation), BASELINE, after, ids);
    const inverse = buildInverseDesignOperation(operation, BASELINE, ids);
    assert.ok(inverse);
    verifyDesignSourceEffect(compileDesignOperation(inverse), after, BASELINE);
  }
});

void test("net class membership and rename preserve per-net and associated physical rules", () => {
  const nets = ["DP", "DM"].map((name): NativeSourceObject => ({ id: JSON.stringify(["NET", name]), type: "NET", body: { netType: null, equalLengthGroupName: null, differentialName: null, isPositiveNet: false, specialColor: null, retLine: true } }));
  const before = snapshot([...BASELINE.objects, ...nets]);
  const create = { id: "usb-class", action: "pcb.netclass.create", name: "USB", nets: ["DP", "DM"], color: null };
  const created = buildExpectedDesignSource(create, before);
  verifyDesignSourceEffect(compileDesignOperation(create), before, created);
  const groupId = JSON.stringify(["RULE_SELECTOR", ["NET_CLASS", "USB"]]);
  const custom = changed(created, { [groupId]: { ruleKeyValue: { TRACK: "90ohm" } } });
  const rename = { id: "rename", action: "pcb.netclass.rename", name: "USB", newName: "USB90" };
  const renamed = buildExpectedDesignSource(rename, custom);
  assert.deepEqual(renamed.objects.find((object) => object.id === JSON.stringify(["RULE_SELECTOR", ["NET_CLASS", "USB90"]]))?.body["ruleKeyValue"], { TRACK: "90ohm" });
  verifyDesignSourceEffect(compileDesignOperation(rename), custom, renamed);
  const corrupted = changed(renamed, { [JSON.stringify(["NET", "DP"])]: { specialColor: "#ff0000" } });
  assert.throws(() => verifyDesignSourceEffect(compileDesignOperation(rename), custom, corrupted), /exact typed effect/u);
});

void test("pad creation retains hole units and mask/thermal defaults; current via enum mapping is exact", () => {
  const operation = { id: "pad", action: "pcb.pad.create", properties: { layer: 12, padNumber: "1", x: 10, y: 20, rotation: 0, pad: ["RECT", 60, 80, 0], net: "", hole: ["SLOT", 20, 40], holeOffsetX: 0, holeOffsetY: 0, holeRotation: 90, metallization: true, padType: 0, solderMaskAndPasteMaskExpansion: null, heatWelding: null, primitiveLock: false } };
  const ids = { createdId: "1234567890abcdef" };
  const after = buildExpectedDesignSource(operation, BASELINE, ids);
  verifyDesignSourceEffect(compileDesignOperation(operation), BASELINE, after, ids);
  assert.deepEqual(after.objects.find((object) => object.id === ids.createdId)?.body["hole"], { holeType: "SLOT", width: 40, height: 20 });
  const stitch = { id: "stitch", action: "pcb.via.create", properties: { net: "", x: 1, y: 2, holeDiameter: 12, diameter: 24, viaType: 2, designRuleBlindViaName: null, solderMaskExpansion: null, primitiveLock: false } };
  const stitched = buildExpectedDesignSource(stitch, BASELINE, ids);
  assert.equal(stitched.objects.find((object) => object.id === ids.createdId)?.body["viaType"], "SUTURE");
});
