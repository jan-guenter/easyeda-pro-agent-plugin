import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { SYMBOL_PIN_ENUMERATION_GUARD_CODES, SYMBOL_PIN_ENUMERATION_METHOD, SYMBOL_PIN_GETTER_FIELDS, buildSymbolPinEnumerationExpression } from "../src/symbol-pin-enumeration.ts";
import { buildPublicSdkReadCode, publicSdkReadDescriptors, validatePublicSdkReadPayload, validatePublicSdkReadRequest } from "../src/public-sdk-read.ts";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import { wrapWithContextGuard } from "../src/runtime-scripts.ts";
import { EasyedaControlEngine } from "../src/engine.ts";
import { extractToolPayload } from "../src/core.ts";
import { inventoryExtensionApiCoverage } from "../src/extension-api-coverage.ts";
import type { ContextProbePayload, ExpectedContext } from "../src/engine.ts";

const context: ExpectedContext = { project: { uuid: "project", path: "/tmp/fixture.eprj2" }, document: { uuid: "symbol", documentType: 2, tabId: "symbol@project" } };
const request = { method: SYMBOL_PIN_ENUMERATION_METHOD, arguments: {} };

interface Model {
  id: string; modelType: string; shapeManager: unknown; parent?: Model; children: Model[];
  isConnected: boolean; locked?: boolean; [key: string]: unknown;
}
type PinApi = Record<string, () => unknown>;
const forbidden = (): never => { throw new Error("Forbidden sorting, compiler, serializer or write call."); };
const identity = (_id: string, result: PinApi): unknown => result;
function attributeValue(attrs: Map<unknown, unknown>, key: string): unknown {
  const attribute = attrs.get(key); assert.ok(attribute !== null && typeof attribute === "object"); return Reflect.get(attribute, "value");
}
function fixture(count = 2): {
  scope: Record<string, unknown>; doc: Record<string, unknown>; shapes: Record<string, unknown>; part: Model; root: Model;
  index: Map<string, Model>; sources: Map<string, number>; pins: Model[]; calls: string[];
  handler: { getSourceCodeIdMap: () => Map<string, number> }; api: { get: (id: string) => Promise<unknown>; getAll: () => never };
  onLookup: (hook: (id: string, result: PinApi) => unknown) => void; publicPin: (id: string) => PinApi;
} {
  const calls: string[] = [], families = new Map<string, Set<Model>>(), index = new Map<string, Model>(), sources = new Map<string, number>();
  const ids: Record<string, unknown> = { idMap: index };
  const shapes: Record<string, unknown> = { idManager: ids, actionRunner: { running: false } };
  const root: Model = { id: "root", modelType: "Root", shapeManager: shapes, children: [], locked: false, isConnected: true };
  const part: Model = { id: "part", partId: "part", modelType: "Symbol", cmdKey: "part", shapeManager: shapes, parent: root, children: [],
    isConnected: true, isActive: true, symbolUuid: "symbol", deviceUuid: "", shapes: families };
  root.children.push(part); index.set(part.id, part); sources.set(part.id, 1);
  shapes["root"] = root; shapes["_parts"] = [part]; shapes["_partIdMap"] = { part };
  Object.defineProperty(shapes, "parts", { get: forbidden });
  const handler = { getSourceCodeIdMap: (): Map<string, number> => new Map(sources) };
  const consistency = { state: "initialized", decodeAndRealTimeSyncHandler: handler, handler, getSourceCode: forbidden };
  const doc: Record<string, unknown> = { uuid: "symbol", project_uuid: "project", tabId: "symbol@project", docType: 2, cmdKey: "part", componentCache: {},
    projectMgr: { uuid: "project" }, shapeManager: shapes, idManager: ids, isSymbolDoc: (): boolean => true, consistencyImpl: consistency };
  shapes["docManager"] = doc; ids["docManager"] = doc;
  Reflect.set(consistency, "docManager", doc); Reflect.set(handler, "consistencyImpl", consistency); Reflect.set(handler, "docManager", doc);
  const pins: Model[] = [];
  for (let number = 0; number < count; number += 1) {
    const pin: Model = { id: `pin-${String(number)}`, modelType: "Pin", shapeManager: shapes, parent: part, children: [], locked: number === 1, isConnected: true,
      origin: { x: number * 10, y: 20 - number * 5 }, rotation: number * 90, length: number * 20, color: number === 0 ? null : "#123456", pinShape: number === 0 ? "None" : "Inverted Clock",
      _attrMap: new Map<string, Model>(), _attrIdMap: new Map<string, Model>() };
    for (const [key, value] of [["Pin Name", number === 0 ? "" : "CLOCK"], ["Pin Number", String(number + 1)], ["Pin Type", number === 0 ? "Passive" : "IN"]]) {
      assert.ok(key !== undefined && value !== undefined);
      const attr: Model = { id: `${pin.id}-${key}`, modelType: "Attr", shapeManager: shapes, parent: pin, children: [], locked: false, isConnected: true, key, value };
      const attrIds = pin["_attrIdMap"], attrs = pin["_attrMap"]; assert.ok(attrs instanceof Map && attrIds instanceof Map);
      attrs.set(key, attr); attrIds.set(attr.id, attr); pin.children.push(attr); index.set(attr.id, attr); sources.set(attr.id, 1);
    }
    const dot: Model = { id: `${pin.id}-dot`, modelType: "UnConnectDot", shapeManager: shapes, parent: pin, children: [], isConnected: true };
    pin["unConnectDotModel"] = dot; pin.children.push(dot); index.set(dot.id, dot);
    pins.push(pin); part.children.push(pin); index.set(pin.id, pin); sources.set(pin.id, 1);
  }
  if (count > 0) { families.set("Pin", new Set(pins)); }
  // Ordinary symbol loading materializes a PART Symbol attribute outside the
  // Source inventory. It is a checked descendant, not an omitted pin member.
  const generated: Model = { id: "part-symbol", modelType: "Attr", key: "Symbol", value: "symbol", parent: part, shapeManager: shapes, children: [], locked: false, isConnected: true };
  part.children.push(generated); index.set(generated.id, generated);
  const publicPin = (id: string): PinApi => {
    const pin = pins.find((entry) => entry.id === id); assert.ok(pin);
    const attrs = pin["_attrMap"], origin = pin["origin"]; assert.ok(origin !== null && typeof origin === "object" && attrs instanceof Map);
    const values: Record<string, unknown> = { PrimitiveType: "Pin", PrimitiveId: id, X: Reflect.get(origin, "x"), Y: -Number(Reflect.get(origin, "y")), PinName: attributeValue(attrs, "Pin Name"),
      PinNumber: attributeValue(attrs, "Pin Number"), pinType: attributeValue(attrs, "Pin Type"), Rotation: pin["rotation"], PinLength: pin["length"], PinColor: pin["color"], PinShape: pin["pinShape"], OtherProperty: undefined };
    const result: PinApi = Object.fromEntries(SYMBOL_PIN_GETTER_FIELDS.map((field) => [`getState_${field}`, function getter(this: PinApi): unknown { assert.equal(this, result); return values[field]; }]));
    return result;
  };
  let hook: (id: string, result: PinApi) => unknown = identity;
  const api = { get: (id: string): Promise<unknown> => { calls.push(id); return Promise.resolve(hook(id, publicPin(id))); }, getAll: forbidden };
  const scope: Record<string, unknown> = { Map, Set, SCH: { docMemoryManager: { getActiveDoc: (): unknown => doc } }, UI: { tabBar: { getActiveTab: (): string => "symbol@project" } },
    eda: { sch_PrimitivePin: api, dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve(context.project) },
      dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => Promise.resolve(context.document) } },
    EXPECTED_DOCUMENT_UUID: "symbol", EXPECTED_PROJECT_UUID: "project", EXPECTED_DOCUMENT_TYPE: 2, EXPECTED_TAB_ID: "symbol@project" };
  return { scope, doc, shapes, part, root, index, sources, pins, calls, handler, api, onLookup: (next): void => { hook = next; }, publicPin };
}
type Fixture = ReturnType<typeof fixture>;
async function read(current: Fixture): Promise<unknown> {
  const result: unknown = await runInNewContext(`(async()=>${buildSymbolPinEnumerationExpression()})()`, current.scope);
  assert.ok(Array.isArray(result));
  return structuredClone(result.map((pin: PinApi) => Object.fromEntries(SYMBOL_PIN_GETTER_FIELDS.map((field) => { const get = pin[`getState_${field}`]; assert.ok(get); return [field, get.call(pin)]; }))));
}

void test("symbol Pin enumeration preserves zero/null/empty values, locked pins and generated unstored dots", async () => {
  const current = fixture();
  const result = await read(current);
  assert.deepEqual(current.calls, ["pin-0", "pin-1"]);
  assert.deepEqual(result, [
    { PrimitiveType: "Pin", PrimitiveId: "pin-0", X: 0, Y: -20, PinNumber: "1", PinName: "", Rotation: 0, PinLength: 0, PinColor: null, PinShape: "None", pinType: "Passive", OtherProperty: undefined },
    { PrimitiveType: "Pin", PrimitiveId: "pin-1", X: 10, Y: -15, PinNumber: "2", PinName: "CLOCK", Rotation: 90, PinLength: 20, PinColor: "#123456", PinShape: "Inverted Clock", pinType: "IN", OtherProperty: undefined },
  ]);
});
void test("independently proven empty PART returns empty without calling public get", async () => {
  const current = fixture(0); assert.deepEqual(await read(current), []); assert.deepEqual(current.calls, []);
});

void test("source-backed drawing families remain direct PART children and never become Pins", async () => {
  const current = fixture(), families = current.part["shapes"]; assert.ok(families instanceof Map);
  /* The pinned symbol loader attaches drawing models to the PART and Symbol
   * onChildChange maintains their family Sets. This synthetic graph exercises
   * those ownership facts; it does not execute the installed loader or prove
   * complete drawing geometry/source preservation. */
  for (const modelType of ["Text", "Rect", "Circle", "Polyline"]) {
    const drawing: Model = { id: `drawing-${modelType}`, modelType, shapeManager: current.shapes, parent: current.part,
      children: [], isConnected: true, locked: false };
    current.part.children.push(drawing); current.index.set(drawing.id, drawing); current.sources.set(drawing.id, 1);
    families.set(modelType, new Set([drawing]));
  }
  const result = await read(current); assert.ok(Array.isArray(result));
  assert.equal(result.length, 2); assert.deepEqual(current.calls, ["pin-0", "pin-1"]);
  assert.deepEqual(result.map((row: Record<string, unknown>) => row["PrimitiveId"]), ["pin-0", "pin-1"]);
});

const corruptions: Record<string, (current: Fixture) => void> = {
  "foreign symbol": (current) => { current.doc["uuid"] = "foreign"; },
  "foreign project": (current) => { current.doc["project_uuid"] = "foreign"; },
  "schematic document": (current) => { current.scope["EXPECTED_DOCUMENT_TYPE"] = 1; },
  "drawing symbol": (current) => { current.doc["docType"] = 20; },
  "foreign manager": (current) => { current.shapes["docManager"] = {}; },
  "multipart": (current) => { current.shapes["_parts"] = [current.part, current.part]; },
  "inactive part": (current) => { current.part["isActive"] = false; },
  "associated device": (current) => { current.doc["componentCache"] = { device: {} }; },
  "device identity without matching cache": (current) => { current.part["deviceUuid"] = "unbound-device"; },
  "empty PART groups": (current) => { current.part["groups"] = []; },
  "extra PART map key": (current) => {
    const parts = current.shapes["_partIdMap"]; assert.ok(parts !== null && typeof parts === "object");
    Reflect.set(parts, "extra-part", current.part);
  },
  "Pin no-connect pointer": (current) => { const pin = current.pins[0]; assert.ok(pin); pin["noConnect"] = {}; },
  "Pin junction pointer": (current) => { const pin = current.pins[0]; assert.ok(pin); pin["junctionModel"] = {}; },
  "initially absent Pin Type": (current) => {
    const pin = current.pins[0]; assert.ok(pin);
    const attrIds = pin["_attrIdMap"], attrs = pin["_attrMap"]; assert.ok(attrs instanceof Map && attrIds instanceof Map);
    const attr = pin.children.find((child) => child["key"] === "Pin Type"); assert.ok(attr);
    pin.children.splice(pin.children.indexOf(attr), 1); attrs.delete("Pin Type"); attrIds.delete(attr.id);
    current.index.delete(attr.id); current.sources.delete(attr.id);
  },
  "foreign source identity": (current) => { current.sources.set("absent", 1); },
  "GROUP record": (current) => { current.sources.set("group", 1); },
  "invalid source marker": (current) => { current.sources.set("part", 2); },
  "hidden index pin": (current) => { current.index.set("hidden", { ...current.part, id: "hidden", modelType: "Pin" }); },
  "cycle": (current) => { current.part.children.push(current.root); },
  "unknown model": (current) => { const pin = current.pins[0]; assert.ok(pin); pin.modelType = "Unknown"; },
  "missing pin source": (current) => { current.sources.delete("pin-0"); },
  "lost pin family": (current) => { const shapes = current.part["shapes"]; assert.ok(shapes instanceof Map); shapes.delete("Pin"); },
  "missing attribute": (current) => { const pin = current.pins[0]; assert.ok(pin); pin.children.shift(); },
  "stored generated dot": (current) => { current.sources.set("pin-0-dot", 1); },
  "wrong dot pointer": (current) => { const pin = current.pins[0]; assert.ok(pin); pin["unConnectDotModel"] = {}; },
  "nonfinite coordinate": (current) => { const pin = current.pins[0]; assert.ok(pin); pin["origin"] = { x: Infinity, y: 0 }; },
  "unknown shape": (current) => { const pin = current.pins[0]; assert.ok(pin); pin["pinShape"] = "future"; },
  "busy action": (current) => { current.shapes["actionRunner"] = { running: true }; },
};
for (const [name, corrupt] of Object.entries(corruptions)) {
  void test(`symbol Pin enumeration refuses ${name} before public lookup`, async () => {
    const current = fixture(); corrupt(current); await assert.rejects(read(current), /SYMBOL_PIN_ENUM_/u); assert.deepEqual(current.calls, []);
  });
}
for (const [name, corrupt] of Object.entries(corruptions)) {
  void test(`symbol Pin enumeration reproves ${name} after an awaited lookup`, async () => {
    const current = fixture(); current.onLookup((_id, result) => { corrupt(current); return result; });
    await assert.rejects(read(current), /SYMBOL_PIN_ENUM_/u); assert.deepEqual(current.calls, ["pin-0"]);
  });
}
void test("Pin public failures, omissions, mapper defaults, wrong IDs and getters never produce a partial array", async () => {
  for (const corrupt of [(_pin: PinApi): unknown => undefined, (_pin: PinApi): unknown => [], (_pin: PinApi): unknown => { throw new Error("RPC failed"); },
    (pin: PinApi): unknown => { pin["getState_PrimitiveId"] = (): unknown => "other"; return pin; },
    (pin: PinApi): unknown => { pin["getState_PinLength"] = (): unknown => 20; return pin; },
    (pin: PinApi): unknown => { pin["getState_OtherProperty"] = (): unknown => ({ hidden: true }); return pin; },
    (pin: PinApi): unknown => { Reflect.set(pin, "getState_PinName", undefined); return pin; },
    (pin: PinApi): unknown => { pin["getState_PinName"] = (): unknown => { throw new Error("bad getter"); }; return pin; }]) {
    const current = fixture(); current.onLookup((_id, pin) => corrupt(pin)); await assert.rejects(read(current)); assert.deepEqual(current.calls, ["pin-0"]);
  }
});
void test("same-ID object substitution, scalar drift and lock drift after await are refused", async () => {
  for (const mutate of [(pin: Model): void => { pin["length"] = 1; }, (pin: Model): void => { pin.locked = pin.locked !== true; },
    (pin: Model): void => { const name = pin.children[0]; assert.ok(name); name["value"] = "changed"; }]) {
    const current = fixture(); current.onLookup((_id, result) => { const pin = current.pins[0]; assert.ok(pin); mutate(pin); return result; });
    await assert.rejects(read(current), /SYMBOL_PIN_ENUM_CHANGED/u);
  }
  const current = fixture(); current.onLookup((_id, result) => { const pin = current.pins[0]; assert.ok(pin); current.index.set(pin.id, { ...pin }); return result; });
  await assert.rejects(read(current), /SYMBOL_PIN_ENUM_TREE/u);
});
void test("snapshot reproof preserves signed zero for every numeric field after await", async () => {
  for (const field of ["x", "y", "rotation", "length"] as const) {
    for (const baseline of [0, -0]) {
      const current = fixture(), pin = current.pins[0]; assert.ok(pin);
      const target = field === "x" || field === "y" ? pin["origin"] : pin;
      assert.ok(target !== null && typeof target === "object");
      Reflect.set(target, field, baseline);
      current.onLookup((_id, result) => { Reflect.set(target, field, -baseline); return result; });
      await assert.rejects(read(current), /SYMBOL_PIN_ENUM_CHANGED/u);
      assert.deepEqual(current.calls, ["pin-0"]);
    }
  }
});
void test("custom properties, duplicate pin attributes and missing attribute source membership refuse", async () => {
  for (const key of ["custom", "duplicate", "missing-source", "wrong-owner", "non-string", "too-long", "foreign-attribute-map"]) {
    const current = fixture(), pin = current.pins[0]; assert.ok(pin);
    const attr = pin.children[0]; assert.ok(attr);
    if (key === "custom") { attr["key"] = "Extra"; }
    if (key === "duplicate") { attr["key"] = "Pin Number"; }
    if (key === "missing-source") { current.sources.delete(attr.id); }
    if (key === "wrong-owner") { attr.parent = current.part; }
    if (key === "non-string") { attr["value"] = 0; }
    if (key === "too-long") { attr["value"] = "x".repeat(4097); }
    if (key === "foreign-attribute-map") { const attrs = pin["_attrMap"]; assert.ok(attrs instanceof Map); attrs.set("Pin Name", { ...attr }); }
    await assert.rejects(read(current), /SYMBOL_PIN_ENUM_/u); assert.deepEqual(current.calls, []);
  }
});
void test("pin bounds refuse before dispatch and all returned getters require exact native parity", async () => {
  const excessive = fixture(257); await assert.rejects(read(excessive), /SYMBOL_PIN_ENUM_PIN_SET/u); assert.deepEqual(excessive.calls, []);
  for (const field of SYMBOL_PIN_GETTER_FIELDS) {
    const current = fixture(); current.onLookup((_id, pin) => { pin[`getState_${field}`] = (): unknown => Symbol("wrong"); return pin; });
    await assert.rejects(read(current), /SYMBOL_PIN_ENUM_PARITY/u); assert.deepEqual(current.calls, ["pin-0"]);
  }
});
void test("snapshot reproof refuses receiver, attribute-index and undefined-lock substitution", async () => {
  for (const substitution of ["receiver", "attributes", "part-lock"]) {
    const current = fixture(); current.onLookup((_id, result) => {
      if (substitution === "receiver") { current.api.get = (): Promise<unknown> => Promise.resolve(result); }
      if (substitution === "attributes") { const pin = current.pins[0]; assert.ok(pin); const attrs = pin["_attrMap"]; assert.ok(attrs instanceof Map); pin["_attrMap"] = new Map(attrs); }
      if (substitution === "part-lock") { current.part.locked = false; }
      return result;
    });
    await assert.rejects(read(current), /SYMBOL_PIN_ENUM_(?:OWNER|CHANGED)/u); assert.deepEqual(current.calls, ["pin-0"]);
  }
});

async function wrapped(current: Fixture): Promise<Record<string, unknown>> {
  const code = wrapWithContextGuard(buildPublicSdkReadCode(request), context);
  const envelope: unknown = await runInNewContext(`(async()=>{${code}})()`, { ...current.scope, TextEncoder });
  return validatePublicSdkReadPayload(decodeExactReadEnvelope(envelope), request);
}

void test("registered Pin enumeration uses strict symbol-only native membership and the exact twelve getter fields", async () => {
  const descriptor = publicSdkReadDescriptors().find((entry) => entry.path === request.method); assert.ok(descriptor);
  assert.deepEqual(descriptor.documentTypes, [2]); assert.equal(descriptor.implementation.kind, "native-task-equivalent");
  assert.equal(descriptor.implementation.source, "server/src/symbol-pin-enumeration.ts");
  assert.equal(descriptor.implementation.test, "server/tests/symbol-pin-enumeration.test.ts");
  assert.equal(descriptor.parameterSupport, "narrowed"); assert.equal(descriptor.liveValidation, "not-yet-validated");
  assert.deepEqual(descriptor.result, { kind: "primitive", optional: false, getterFields: [...SYMBOL_PIN_GETTER_FIELDS], primitiveType: "Pin" });
  assert.deepEqual(validatePublicSdkReadRequest(request, 2), request);
  for (const documentType of [1, 3, 4, 15, 20]) { assert.throws(() => validatePublicSdkReadRequest(request, documentType)); }
  for (const args of [{ primitiveIds: "pin-0" }, { code: "caller code" }, { part: "part" }, { inherited: false }]) {
    assert.throws(() => validatePublicSdkReadRequest({ ...request, arguments: args }, 2));
  }
  const row = inventoryExtensionApiCoverage().find((entry) => entry.path === request.method); assert.ok(row);
  assert.equal(row.status, "implemented-native-equivalent"); assert.equal(row.omission, null); assert.equal(row.completeDeclaredContractSupported, false);
  assert.equal(row.currentGenerationLiveValidation, "not-recorded"); assert.deepEqual(row.routes[0]?.documentTypes, [2]);
  const current = fixture(); Reflect.deleteProperty(current.api, "getAll");
  const payload = await wrapped(current);
  assert.deepEqual(current.calls, ["pin-0", "pin-1"]);
  assert.equal(payload["implementationKind"], "native-task-equivalent");
  assert.equal(payload["assurance"], "bounded-native-pin-getter-observation-not-complete-source-connectivity-or-persistence-proof");
  assert.deepEqual(payload["undefinedPaths"], ["/value/0/OtherProperty", "/value/1/OtherProperty"]);
  const rows = payload["value"]; assert.ok(Array.isArray(rows));
  assert.deepEqual(rows.map((entry: Record<string, unknown>) => Object.keys(entry).toSorted()), rows.map(() => [...SYMBOL_PIN_GETTER_FIELDS].toSorted()));
  const empty = await wrapped(fixture(0)); assert.deepEqual(empty["value"], []);
});

void test("legacy public Pin getter and ID descriptors disclose mapper loss and inventory side effects", () => {
  const descriptors = publicSdkReadDescriptors();
  const getter = descriptors.find((entry) => entry.path === "eda.sch_PrimitivePin.get"), ids = descriptors.find((entry) => entry.path === "eda.sch_PrimitivePin.getAllPrimitiveId");
  assert.ok(getter); assert.ok(ids);
  assert.equal(getter.implementation.kind, "public-method"); assert.equal(ids.implementation.kind, "public-method");
  assert.match(getter.limitations.join(" "), /omits custom attributes from OtherProperty/u);
  assert.match(getter.limitations.join(" "), /native plus 180 degrees/u);
  assert.match(getter.limitations.join(" "), /does not prove complete native Pin membership/u);
  assert.match(ids.limitations.join(" "), /empty object for missing shapes\.pin/u);
  assert.match(ids.limitations.join(" "), /sort the in-memory parts index and clear shouldSortParts/u);
  assert.match(ids.limitations.join(" "), /not proof of pure native-state invariance/u);
});

void test("host Pin validation rejects invalid enums, scalar types, bounds, order and undefined evidence", async () => {
  const observed = await wrapped(fixture());
  const rows = observed["value"]; assert.ok(Array.isArray(rows));
  const original: unknown = rows[0]; assert.ok(original !== null && typeof original === "object");
  const payload = { ok: true, kind: "public-sdk-read", method: request.method, present: true, value: rows, undefinedPaths: ["/value/0/OtherProperty", "/value/1/OtherProperty"] };
  assert.doesNotThrow(() => validatePublicSdkReadPayload(payload, request));
  for (const patch of [{ PinShape: 0 }, { PinShape: "future" }, { pinType: "future" }, { pinType: 0 }, { X: null }, { Y: Infinity },
    { Rotation: Number.NaN }, { PinLength: -1 }, { PinNumber: 1 }, { PinName: "x".repeat(4097) }, { PinColor: "x".repeat(4097) },
    { PinColor: {} }, { OtherProperty: {} }, { PrimitiveId: "" }, { extra: "hidden" }]) {
    assert.throws(() => validatePublicSdkReadPayload({ ...payload, value: [{ ...original, ...patch }, rows[1]] }, request));
  }
  for (const undefinedPaths of [[], ["/value/0/OtherProperty"], ["/value/0/OtherProperty", "/value/0/OtherProperty"],
    ["/value/0/OtherProperty", "/value/1/OtherProperty", "/value/0/PinColor"], ["/value/0/OtherProperty", "/value/1/PinColor"]]) {
    assert.throws(() => validatePublicSdkReadPayload({ ...payload, undefinedPaths }, request));
  }
  for (const value of [[rows[1], rows[0]], [rows[0], rows[0]], { ...original }, null, Array.from({ length: 257 }, (_entry, index) => ({ ...original, PrimitiveId: `pin-${String(index).padStart(3, "0")}` }))]) {
    assert.throws(() => validatePublicSdkReadPayload({ ...payload, value }, request));
  }
  const missing = { ...original }; Reflect.deleteProperty(missing, "OtherProperty");
  assert.throws(() => validatePublicSdkReadPayload({ ...payload, value: [missing, rows[1]] }, request));
  assert.throws(() => validatePublicSdkReadPayload({ ...payload, present: false }, request));
});

void test("wrapped Pin reader preserves supported enum cases and documents signed-zero JSON normalization", async () => {
  for (const pinShape of ["None", "Inverted", "Clock", "Inverted Clock"]) {
    const current = fixture(1), pin = current.pins[0]; assert.ok(pin); pin["pinShape"] = pinShape;
    const payload = await wrapped(current), rows = payload["value"]; assert.ok(Array.isArray(rows)); assert.equal(Reflect.get(rows[0], "PinShape"), pinShape);
  }
  for (const pinType of ["IN", "OUT", "BI", "Passive", "Open Collector", "Open Emitter", "Power", "Ground", "HIZ", "Terminator", "Undefined"]) {
    const current = fixture(1), pin = current.pins[0]; assert.ok(pin);
    const attr = pin.children.find((child) => child["key"] === "Pin Type"); assert.ok(attr); attr["value"] = pinType;
    const payload = await wrapped(current), rows = payload["value"]; assert.ok(Array.isArray(rows)); assert.equal(Reflect.get(rows[0], "pinType"), pinType);
  }
  const current = fixture(1), pin = current.pins[0]; assert.ok(pin); pin["rotation"] = -0;
  const payload = await wrapped(current), rows = payload["value"]; assert.ok(Array.isArray(rows)); assert.ok(Object.is(Reflect.get(rows[0], "Rotation"), 0));
});

void test("Pin diagnostics admit only the exact fixed method/stage/code inventory and redact private exceptions", async () => {
  const guards = [...new Set([...buildSymbolPinEnumerationExpression().matchAll(/bad\('([A-Z_]+)'\)/gu)].map((match) => { assert.ok(match[1] !== undefined && match[1] !== ""); return match[1]; }))].toSorted();
  assert.deepEqual(guards, [...SYMBOL_PIN_ENUMERATION_GUARD_CODES].toSorted());
  assert.throws(() => Reflect.apply(buildSymbolPinEnumerationExpression, undefined, ["caller-mode"]));
  for (const kind of ["guard", "native", "accessor"] as const) {
    const current = fixture();
    if (kind === "guard") { current.root.children.shift(); }
    else { current.onLookup(() => {
      if (kind === "native") { throw new Error("SYMBOL_PIN_ENUM_CHANGED private credential"); }
      throw Object.defineProperty(new Error("private native error"), "message", { get: (): never => { assert.fail("Native exception message accessor was read."); } });
    }); }
    const operation = async (): Promise<unknown> => {
      try { return await wrapped(current); }
      catch (error) {
        assert.ok(error !== null && typeof error === "object");
        const message: unknown = Reflect.get(error, "message"); assert.equal(typeof message, "string");
        return extractToolPayload({ structuredContent: { ok: false, error: message } });
      }
    };
    await assert.rejects(operation, { message: `The upstream EasyEDA tool reported failure [native-symbol-pins:${request.method}:${kind === "guard" ? "TREE" : "EXCEPTION"}].` });
  }
});

void test("real SDK coordinator double-samples Pins and refuses profile, context, quarantine and getter-state drift", async () => {
  for (const failure of ["none", "context", "profile", "quarantine", "state"]) {
    const current = fixture(); let calls = 0, contexts = 0, gates = 0, profiles = 0;
    class FixtureEngine extends EasyedaControlEngine {
      // oxlint-disable-next-line eslint/class-methods-use-this -- Instance override intercepts the production profile admission seam.
      protected override assertPublicSdkImplementation(): Promise<void> {
        profiles += 1;
        return failure === "profile" && profiles === 2 ? Promise.reject(new Error("fixture profile drift")) : Promise.resolve();
      }
    }
    const engine = new FixtureEngine({ async callTool(name, args): Promise<unknown> {
      assert.equal(name, "easyeda_execute"); assert.ok(typeof args?.["code"] === "string"); calls += 1;
      if (failure === "state" && calls === 2) { const pin = current.pins[0]; assert.ok(pin); pin["length"] = 1; }
      const result: unknown = await runInNewContext(`(async()=>{${args["code"]}})()`, { ...current.scope, TextEncoder });
      return { structuredContent: { ok: true, result } };
    } });
    engine.assertBridgeDispatchAllowed = (): Promise<true> => { gates += 1; return failure === "quarantine" && gates === 3 ? Promise.reject(new Error("fixture quarantine")) : Promise.resolve(true); };
    engine.assertContext = (expected): Promise<ContextProbePayload> => { contexts += 1; return failure === "context" && contexts === 3 ? Promise.reject(new Error("fixture context drift")) : Promise.resolve({ ...structuredClone(expected), document: { ...structuredClone(expected.document), tabId: "symbol@project" } }); };
    if (failure === "none") {
      const result = await engine.publicSdkRead(request, context); assert.equal(result["authority"], "native-pin-getter-observation-not-complete-source-connectivity-or-persistence-proof"); assert.equal(calls, 2);
    } else { await assert.rejects(engine.publicSdkRead(request, context), /fixture|changed between consecutive samples/u); assert.equal(calls, ["profile", "state"].includes(failure) ? 2 : 1); }
  }
});
