import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SCHEMATIC_ELECTRICAL_READ_METHOD, currentSchematicElectricalObservationSchema } from "../src/current-schematic-page-electrical-read.ts";
import { buildCurrentSchematicPageReadProgram } from "../src/current-schematic-page-read-program.ts";
import { validateCurrentSchematicPageReadArguments, validateCurrentSchematicPageReadResult } from "../src/current-schematic-page-read.ts";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import { currentSchematicElectricalFixture } from "./helpers/current-schematic-electrical-fixture.ts";

function read(value: ReturnType<typeof currentSchematicElectricalFixture>): ReturnType<typeof currentSchematicElectricalObservationSchema.parse> {
  const request = { target: value.target, operation: { method: CURRENT_SCHEMATIC_ELECTRICAL_READ_METHOD, arguments: {} } };
  const scope = createContext({ ...value.scope, TextEncoder });
  runInContext("globalThis.window=globalThis;globalThis.top=globalThis;document.defaultView=globalThis;", scope);
  const result: unknown = runInContext(`(function(){${buildCurrentSchematicPageReadProgram(request)}})()`, scope, { timeout: 1000 });
  const observed = validateCurrentSchematicPageReadResult(request, decodeExactReadEnvelope(structuredClone(result)));
  return currentSchematicElectricalObservationSchema.parse(observed.value[0]);
}
void test("current209 pure component/pin/net observation uses raw fields and original built contacts without effective getters or AST", () => {
  const value = currentSchematicElectricalFixture();
  const points = [...value.contactCache.points], sources = [...value.sources];
  const result = read(value);
  const component = result.components[0]; assert.ok(component);
  assert.equal(component.kind, "part"); assert.deepEqual(component.origin, [10, -20]); assert.equal(component.pins.length, 2);
  assert.deepEqual(component.attributes[0]?.rawFields["_blockValue"], { presence: "value", value: "U1" });
  assert.deepEqual(component.pins[0]?.attributes[0]?.rawFields["_symbolValue"], { presence: "value", value: "1" });
  assert.equal(component.pins[0]?.sourceIndexed, false); assert.equal(result.contacts.length, 3); assert.equal(result.groups.length, 2);
  assert.equal(result.compiledCacheUsed, false); assert.equal(result.effectiveAttributeValuesVerified, false);
  assert.equal(result.completeTopologyVerified, false); assert.equal(result.writerAuthorized, false); assert.equal(result.contactCacheFreshnessVerified, false);
  assert.deepEqual([...value.sources], sources); assert.deepEqual([...value.contactCache.points], points);
});
void test("pure electrical observation refuses missing or contradictory native cache, family, source and pin membership", () => {
  const mutations: ((value: ReturnType<typeof currentSchematicElectricalFixture>) => void)[] = [
    value => { delete value.netManager["_netPointData"]; }, value => { value.contactCache.points.clear(); },
    value => { if (value.contactNodes[0]?.["Pin"] instanceof Set) { value.contactNodes[0]["Pin"].clear(); } },
    value => { if (value.contactNodes[1]?.["Pin"] instanceof Set) { value.contactNodes[1]["Pin"].add(value.pins[0]); } },
    value => { if (value.contactNodes[0]?.["Wire"] instanceof Set) { value.contactNodes[0]["Wire"].add({ id: "foreign" }); } },
    value => { if (value.contactNodes[0]?.["BusEntry"] instanceof Set) { value.contactNodes[0]["BusEntry"].add(value.component); } },
    value => { value.sources.delete("component"); }, value => { value.modelMap.get("Symbol")?.clear(); },
    value => { value.component["cmdKey"] = "block_symbol"; }, value => { value.component["_origin"] = { x: -0, y: 0 }; },
    value => { Object.defineProperty(value.attribute, "_blockValue", { get: (): string => "foreign" }); },
    value => { value.attribute["_symbolValue"] = "\uD800"; },
  ];
  for (const mutate of mutations) { const value = currentSchematicElectricalFixture(); mutate(value); assert.throws(() => read(value)); }
});
void test("raw electrical route keeps fixed empty arguments and rejects caller compiler, cache rebuild or topology opt-ins", () => {
  const value = currentSchematicElectricalFixture();
  const request = { target: value.target, operation: { method: CURRENT_SCHEMATIC_ELECTRICAL_READ_METHOD, arguments: {} } };
  assert.equal(validateCurrentSchematicPageReadArguments(request)["valid"], true);
  for (const extra of [{ compile: true }, { rebuild: true }, { allSchematicPages: true }, { connectivityVerified: true }, { code: "caller" }]) {
    assert.equal(validateCurrentSchematicPageReadArguments({ ...request, operation: { ...request.operation, arguments: extra } })["valid"], false);
  }
  assert.ok(Buffer.byteLength(buildCurrentSchematicPageReadProgram(request)) < 65_536);
});

void test("raw electrical observation preserves absent, undefined, null and an independently stored no-connect backing value", () => {
  const value = currentSchematicElectricalFixture();
  const pin = value.index.get("pin-1"); assert.ok(pin);
  value.attribute["_variantDeviceValue"] = undefined;
  const flag = { id: "pin-1-no-connect", modelType: "noConnect", tagName: "noConnect", cmdKey: "noconnect", shapeManager: value.shapes,
    isConnected: true, _symbolValue: "no", _blockValue: "yes" };
  value.addChild(pin, flag); pin["_noConnect"] = flag;
  const result = read(value);
  const model = result.components[0]; assert.ok(model);
  const fields = model.attributes[0]?.rawFields;
  assert.deepEqual(fields?.["_variantDeviceValue"], { presence: "undefined" });
  assert.deepEqual(fields?.["_variantValue"], { presence: "value", value: null });
  assert.deepEqual(fields?.["_color"], { presence: "absent" });
  assert.deepEqual(model.pins[0]?.noConnect?.rawFields["_blockValue"], { presence: "value", value: "yes" });
});

void test("final pure reproof refuses drift introduced by the final copying source-reader callback", () => {
  const baseline = currentSchematicElectricalFixture(), baselineReader = baseline.handler.getSourceCodeIdMap;
  let finalCall = 0;
  baseline.handler.getSourceCodeIdMap = (): Map<string, number> => { finalCall += 1; return baselineReader(); };
  read(baseline); assert.ok(finalCall > 2);
  const lastCall = finalCall;
  const mutations: ((value: ReturnType<typeof currentSchematicElectricalFixture>) => void)[] = [
    value => { value.attribute["_blockValue"] = "late"; },
    value => { value.name["_value"] = "late"; },
    value => { const points = value.line["_points"]; assert.ok(Array.isArray(points)); Reflect.set(points[0], "x", 99); },
    value => { assert.ok(value.contactNodes[0]); value.contactNodes[0]["x"] = 99; },
    value => { const map = value.component["_attrMap"]; assert.ok(map instanceof Map); value.component["_attrMap"] = new Map(map); },
    value => { const map = value.component["_attrMap"]; assert.ok(map instanceof Map); map.clear(); },
    value => { value.sources.delete("component-designator"); },
    value => { const node = value.contactNodes[0]; assert.ok(node?.["Pin"] instanceof Set); node["Pin"] = new Set(node["Pin"]); },
  ];
  for (const mutate of mutations) {
    const value = currentSchematicElectricalFixture();
    const original = value.handler.getSourceCodeIdMap;
    let calls = 0;
    value.handler.getSourceCodeIdMap = (): Map<string, number> => {
      const snapshot = original(); calls += 1;
      if (calls === lastCall) { mutate(value); }
      return snapshot;
    };
    assert.throws(() => read(value)); assert.equal(calls, lastCall);
  }
});

void test("transport validation rejects wrong contact family, duplicate identities and unmatched contact indexes", () => {
  const value = currentSchematicElectricalFixture();
  const result = read(value);
  for (const mutate of [(candidate: typeof result): void => { candidate.contacts[0]?.wirePrimitiveIds.push("bus-line"); },
    (candidate: typeof result): void => { const pin = candidate.components[0]?.pins[0]; assert.ok(pin); pin.contactIndex = 2; },
    (candidate: typeof result): void => { const attr = candidate.components[0]?.attributes[0]; assert.ok(attr); attr.primitiveId = "pin-1"; }]) {
    const candidate = structuredClone(result); mutate(candidate);
    assert.equal(currentSchematicElectricalObservationSchema.safeParse(candidate).success, false);
  }
});

void test("an independently complete empty page and built empty contact Set return an honest empty roster", () => {
  const value = currentSchematicElectricalFixture();
  value.root.children = []; value.index.clear(); value.sources.clear(); value.contactCache.points.clear();
  for (const family of value.modelMap.values()) { family.clear(); }
  const result = read(value);
  assert.deepEqual(result.components, []); assert.deepEqual(result.groups, []); assert.deepEqual(result.contacts, []);
  assert.equal(result.completeTopologyVerified, false);
});
