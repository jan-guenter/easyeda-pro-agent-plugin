import assert from "node:assert/strict";
import { test } from "node:test";
import type { DesignTopology } from "../src/design-topology.ts";
import { SCHEMATIC_NATIVE_PROFILE } from "../src/schematic-native-adapter.ts";
import type { SchematicNativeComponent, SchematicNativeSnapshot } from "../src/schematic-native-adapter.ts";
import { verifyLayoutWireGroupRepairTopology } from "../src/schematic-layout-repair-topology.ts";

function attribute(owner: string, key: string, value: string, inherited = false): SchematicNativeComponent["attributes"][number] {
  return { id: `${owner}-${key}`, key, value, symbolValue: inherited ? value : null, blockValue: inherited ? null : value, instanceValue: null,
    body: { parentId: owner, key, value: inherited ? null : value } };
}
function fixture(): { native: SchematicNativeSnapshot; before: DesignTopology; current: DesignTopology; changes: { componentId: string; pinId: string; expectedNet: string; observedNet: string; wireId: string }[] } {
  const native: SchematicNativeSnapshot = { profile: SCHEMATIC_NATIVE_PROFILE, document: { documentUuid: "page", tabId: "page@project" }, source: "native-source", components: [
    { id: "part", kind: "part", locked: false, body: {}, attributes: [attribute("part", "Unique ID", "uid"), attribute("part", "Designator", "U1")], pins: [
      { id: "pin", body: {}, attributes: [attribute("pin", "Pin Number", "3", true)], net: "GND", noConnect: null },
      { id: "other-pin", body: {}, attributes: [attribute("other-pin", "Pin Number", "4", true)], net: "DATA", noConnect: null },
    ] },
  ] };
  const before: DesignTopology = [{ uniqueId: "uid", designator: "U1", pins: [{ pinNumber: "3", net: "GND" }, { pinNumber: "4", net: "DATA" }] },
    { uniqueId: "off-sheet", designator: "R2", pins: [{ pinNumber: "1", net: "SUPPLY" }] }];
  const current = structuredClone(before); const pin = current[0]?.pins[0]; assert.ok(pin); pin.net = "$12N10";
  return { native, before, current, changes: [{ componentId: "part", pinId: "pin", expectedNet: "GND", observedNet: "$12N10", wireId: "0123456789abcdef" }] };
}

void test("wire-group repair admits only exact inherited-number native-to-compiled differences across the whole project", () => {
  const f = fixture();
  const proof = verifyLayoutWireGroupRepairTopology(f.native, f.before, f.current, f.changes);
  assert.equal(proof.componentCount, 2); assert.equal(proof.pinCount, 3);
  assert.deepEqual(proof.changedPins, [{ ...f.changes[0], uniqueId: "uid", designator: "U1", pinNumber: "3" }]);
  const component = f.native.components[0], pin = component?.pins[0]; assert.ok(pin);
  pin.noConnect = { id: "inactive", value: "no", body: { parentId: pin.id, key: "NO_CONNECT", value: "no" } };
  assert.deepEqual(verifyLayoutWireGroupRepairTopology(f.native, f.before, f.current, f.changes), proof);
});

void test("wire-group repair rejects extra/missing/duplicate or named-net contracts and unrelated compiled changes", () => {
  const f = fixture(); const change = f.changes[0]; assert.ok(change);
  for (const changes of [[], [...f.changes, change], [{ ...change, componentId: "foreign" }], [{ ...change, pinId: "missing" }],
    [{ ...change, pinId: "other-pin" }], [{ ...change, expectedNet: "GND_PIANO_ISO" }], [{ ...change, observedNet: "GROUND" }],
    [{ ...change, observedNet: "$12N11" }], [{ ...change, extra: true }]]) {
    assert.throws(() => verifyLayoutWireGroupRepairTopology(f.native, f.before, f.current, changes));
  }
  for (const target of [0, 1]) {
    const changed = structuredClone(f.current), part = changed[target]; assert.ok(part);
    part.designator = "WRONG";
    assert.throws(() => verifyLayoutWireGroupRepairTopology(f.native, f.before, changed, f.changes));
  }
  const offSheet = structuredClone(f.current); const offPin = offSheet[1]?.pins[0]; assert.ok(offPin); offPin.net = "OTHER";
  assert.throws(() => verifyLayoutWireGroupRepairTopology(f.native, f.before, offSheet, f.changes));
  const missing = structuredClone(f.current); const first = missing[0]; assert.ok(first); first.pins.pop();
  assert.throws(() => verifyLayoutWireGroupRepairTopology(f.native, f.before, missing, f.changes));
  assert.throws(() => verifyLayoutWireGroupRepairTopology(f.native, f.before, f.before, f.changes));
});

void test("wire-group repair rejects non-parts, NCs and malformed native identity inheritance", () => {
  for (const mutate of [
    (part: SchematicNativeComponent): void => { part.kind = "netflag"; },
    (part: SchematicNativeComponent): void => { const pin = part.pins[0]; assert.ok(pin); pin.net = "OTHER"; },
    (part: SchematicNativeComponent): void => { const pin = part.pins[0]; assert.ok(pin); pin.noConnect = { id: "nc", value: "yes", body: { parentId: pin.id, key: "NO_CONNECT", value: "yes" } }; },
    (part: SchematicNativeComponent): void => { const pin = part.pins[0]; assert.ok(pin); part.pins.push(structuredClone(pin)); },
    (part: SchematicNativeComponent): void => { part.attributes.pop(); },
    (part: SchematicNativeComponent): void => { const attr = part.attributes[0]; assert.ok(attr); attr.key = "UniqueID"; },
    (part: SchematicNativeComponent): void => { const attr = part.attributes[0]; assert.ok(attr); attr.body["parentId"] = "other"; },
    (part: SchematicNativeComponent): void => { const attr = part.pins[0]?.attributes[0]; assert.ok(attr); attr.value = "4"; },
    (part: SchematicNativeComponent): void => { const attr = part.pins[0]?.attributes[0]; assert.ok(attr); attr.instanceValue = "3"; },
  ]) {
    const f = fixture(), part = f.native.components[0]; assert.ok(part); mutate(part);
    assert.throws(() => verifyLayoutWireGroupRepairTopology(f.native, f.before, f.current, f.changes));
  }
});
