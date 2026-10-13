import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

import { SCHEMATIC_NETGROUP_GUARD_CODES, SCHEMATIC_NETGROUP_READ_METHODS, buildSchematicNetGroupReadExpression, isSchematicNetGroupReadMethod, schematicNetGroupReadRequestSchema, schematicNetGroupStatesSchema, validateSchematicNetGroupStates } from "../src/schematic-netgroup-read.ts";

interface Model extends Record<string, unknown> {
  id: string; modelType: string; tagName: string; cmdKey: string; shapeManager: unknown; parent?: Model; children?: Model[]; isConnected: boolean;
}
const forbidden = (): never => { throw new Error("Forbidden public/compiler/serializer/RPC/display path."); };
const request = (family: "Wire" | "Bus" = "Wire", primitiveIds?: string | string[]): object => ({
  method: `eda.sch_Primitive${family}.${primitiveIds === undefined ? "getAll" : "get"}`,
  arguments: primitiveIds === undefined ? {} : { primitiveIds },
});
function fixture(): {
  scope: Record<string, unknown>; page: Record<string, unknown>; shapes: Record<string, unknown>; root: Model;
  index: Map<string, Model>; sources: Map<string, number>; family: Set<Model>; modelMap: Map<string, Set<Model>>;
  handler: { getSourceCodeIdMap: () => Map<string, number> }; wire: Model; bus: Model; line: Model; name: Model;
  addGroup: (id: string, kind: "wire" | "bus") => Model; addLine: (group: Model, id: string) => Model;
  addName: (group: Model, id: string, value: string) => Model; addChild: (group: Model, child: Model, stored?: boolean) => void;
} {
  const family = new Set<Model>(), index = new Map<string, Model>(), modelMap = new Map([["NetGroup", family]]), sources = new Map<string, number>();
  const handler = { getSourceCodeIdMap: (): Map<string, number> => new Map(sources) }, ids = { idMap: index };
  const shapes: Record<string, unknown> = { idManager: ids, modelMap, getModels: (): Model[] => [...family], actionRunner: { running: false } };
  const root: Model = { id: "root", modelType: "Root", tagName: "Root", cmdKey: "root", shapeManager: shapes, children: [], isConnected: true };
  shapes["root"] = root;
  const page: Record<string, unknown> = { uuid: "page", project_uuid: "project", tabId: "page@project", projectMgr: { uuid: "project" },
    shapeManager: shapes, idManager: ids, isSchSheetDoc: (): boolean => true, isBlockSymbolInstancePage: false,
    consistencyImpl: { state: "initialized", decodeAndRealTimeSyncHandler: handler }, getSourceCode: forbidden };
  shapes["docManager"] = page; Reflect.set(ids, "docManager", page);
  const consistency = page["consistencyImpl"]; assert.ok(consistency !== null && typeof consistency === "object");
  Reflect.set(consistency, "docManager", page); Reflect.set(consistency, "handler", handler);
  Reflect.set(handler, "docManager", page); Reflect.set(handler, "consistencyImpl", consistency);
  const scope: Record<string, unknown> = { Map, Set, SCH: { docMemoryManager: { getActiveDoc: (): unknown => page } },
    UI: { tabBar: { getActiveTab: (): string => "page@project" } }, EXPECTED_DOCUMENT_TYPE: 1, EXPECTED_DOCUMENT_UUID: "page", EXPECTED_PROJECT_UUID: "project", EXPECTED_TAB_ID: "page@project",
    eda: { sch_PrimitiveWire: { get: forbidden, getAll: forbidden }, sch_PrimitiveBus: { get: forbidden, getAll: forbidden }, sch_Netlist: { getNetlist: forbidden } } };
  const addChild = (group: Model, child: Model, stored = true): void => {
    child.parent = group; group.children ??= []; group.children.push(child); index.set(child.id, child); if (stored) { sources.set(child.id, 1); }
    for (const method of ["getApiShapeData", "getConsistencyData", "uploadTo"]) { child[method] = forbidden; }
    Object.defineProperty(child, "attributes", { get: forbidden });
  };
  const addGroup = (id: string, kind: "wire" | "bus"): Model => {
    const group: Model = { id, modelType: "NetGroup", tagName: "NetGroup", cmdKey: "netGroup", type: kind, shapeManager: shapes, isConnected: true,
      lines: [], netNames: [], children: [] };
    family.add(group); addChild(root, group);
    const custom: Model = { id: `${id}-relevance`, modelType: "Attr", tagName: "Attr", cmdKey: "attr", shapeManager: shapes, isConnected: true };
    Object.defineProperty(custom, "value", { get: forbidden }); addChild(group, custom);
    return group;
  };
  const addLine = (group: Model, id: string): Model => {
    const kind = group["type"]; assert.ok(kind === "wire" || kind === "bus");
    const line: Model = { id, modelType: kind === "wire" ? "Wire" : "Bus", tagName: "NetGroupLine", cmdKey: kind, type: kind, shapeManager: shapes, isConnected: true,
      points: [{ x: 0, y: -10 }, { x: 20, y: -30 }], strokeColor: null, strokeWidth: null, strokeStyle: null };
    for (const field of ["displayStrokeColor", "displayStrokeWidth", "displayStrokeStyle"]) { Object.defineProperty(line, field, { get: forbidden }); }
    const lines = group["lines"]; assert.ok(Array.isArray(lines)); lines.push(line); addChild(group, line); return line;
  };
  const addName = (group: Model, id: string, value: string): Model => {
    // Native ad extends xb: the modelType is NetLabel, not NetName. Its tag
    // Distinguishes the stored group-name child from a standalone label.
    const name: Model = { id, modelType: "NetLabel", tagName: "NetName", cmdKey: "netlabel", key: "Name", keyInSourceCode: "NET", value, shapeManager: shapes, isConnected: true };
    const names = group["netNames"]; assert.ok(Array.isArray(names)); names.push(name); addChild(group, name); return name;
  };
  const bus = addGroup("a-bus", "bus"), wire = addGroup("z-wire", "wire");
  const line = addLine(wire, "z-line"), name = addName(wire, "z-name", "NET_A");
  const other = addLine(wire, "a-line"); other["strokeColor"] = "#112233"; other["strokeWidth"] = 2; other["strokeStyle"] = 3;
  addName(wire, "a-name", "NET_B"); addLine(bus, "bus-line"); addName(bus, "bus-name", "DATA[0:7]");
  for (const type of ["Junction", "UnConnectDot"]) {
    addChild(wire, { id: type, modelType: type, tagName: type, cmdKey: type.toLowerCase(), notAddHistory: true, shapeManager: shapes, isConnected: true }, false);
  }
  return { scope, page, shapes, root, index, sources, family, modelMap, handler, wire, bus, line, name, addGroup, addLine, addName, addChild };
}
type Fixture = ReturnType<typeof fixture>;
function read(current: Fixture, input: unknown = request()): unknown {
  const value: unknown = runInNewContext(buildSchematicNetGroupReadExpression(input), current.scope, { timeout: 1000 }); return structuredClone(value);
}

void test("NetGroup DTOs preserve every line style, literal name and native coordinate while sorting stable identities", () => {
  const current = fixture(), rows = schematicNetGroupStatesSchema.parse(read(current)); const row = rows[0]; assert.ok(row);
  assert.deepEqual(row, { primitiveId: "z-wire", modelType: "NetGroup", kind: "wire", lines: [
    { primitiveId: "a-line", points: [[0, -10], [20, -30]], color: "#112233", width: 2, strokeStyle: "DOT_DASH" },
    { primitiveId: "z-line", points: [[0, -10], [20, -30]], color: null, width: null, strokeStyle: null },
  ], names: [{ primitiveId: "a-name", value: "NET_B" }, { primitiveId: "z-name", value: "NET_A" }], customAttributeIds: ["z-wire-relevance"] });
  assert.deepEqual(read(current, request("Wire", "z-wire")), rows);
  const bus = schematicNetGroupStatesSchema.parse(read(current, request("Bus"))); assert.equal(bus[0]?.kind, "bus"); assert.equal(bus[0]?.names[0]?.value, "DATA[0:7]");
  validateSchematicNetGroupStates(rows, request()); validateSchematicNetGroupStates(bus, request("Bus"));
  for (const target of ["a-bus", "z-line", "z-name", "missing"]) { assert.throws(() => read(current, request("Wire", target)), /SCH_NETGROUP_TARGET/u); }
});

void test("NetGroup reads retain one-point lines, signed zero, duplicate name values and nullable numeric style enums", () => {
  const current = fixture(); current.line["points"] = [{ x: -0, y: -0 }]; current.line["strokeWidth"] = -0; current.line["strokeColor"] = "";
  current.name["value"] = "\u0000\n é e\u0301 __proto__"; current.addName(current.wire, "second-name", "NET_B");
  for (const [style, expected] of [[null, null], [0, "SOLID"], [-0, "SOLID"], [1, "SHORT_DASH"], [2, "DOT"], [3, "DOT_DASH"]] as const) {
    current.line["strokeStyle"] = style; const rows = schematicNetGroupStatesSchema.parse(read(current)); const line = rows[0]?.lines.find((item) => item.primitiveId === "z-line"); assert.ok(line);
    assert.equal(line.strokeStyle, expected); assert.equal(line.color, ""); assert.equal(line.points.length, 1); assert.ok(Object.is(line.points[0]?.[0], -0) && Object.is(line.points[0]?.[1], -0) && Object.is(line.width, -0));
    assert.equal(rows[0]?.names.find((item) => item.primitiveId === "z-name")?.value, current.name["value"]);
  }
});

void test("pinned NetGroupLine source decoding and serialization agree with native style reads", () => {
  // Pinned SCH 3f50136f: Ka at 2141617 is used by source decoding at
  // 2144276 and getConsistencyData at 2146362. Keep the exact small converter
  // Independent from the reader: source strings are not backing-field values.
  const pinnedConversion = `var k8e={SOLID:0,SHORT_DASH:1,DOT:2,DOT_DASH:3,0:"SOLID",1:"SHORT_DASH",2:"DOT",3:"DOT_DASH"};
function Ka(i){return i==null?null:k8e[i]}
({native:Ka(sourceStyle),serialized:Ka(Ka(sourceStyle))})`;
  for (const [sourceStyle, nativeStyle] of [[null, null], ["SOLID", 0], ["SHORT_DASH", 1], ["DOT", 2], ["DOT_DASH", 3]] as const) {
    const decoded: unknown = structuredClone(runInNewContext(pinnedConversion, { sourceStyle }, { timeout: 1000 }));
    assert.deepEqual(decoded, { native: nativeStyle, serialized: sourceStyle });
    assert.ok(decoded !== null && typeof decoded === "object" && "native" in decoded);
    const current = fixture(); current.line["strokeStyle"] = decoded.native;
    const rows = schematicNetGroupStatesSchema.parse(read(current));
    assert.equal(rows[0]?.lines.find((item) => item.primitiveId === current.line.id)?.strokeStyle, sourceStyle);
  }
});

void test("four synthetic stored wire groups with eleven decoded SOLID lines are complete", () => {
  const current = fixture(); current.index.clear(); current.sources.clear(); current.family.clear(); current.root.children = [];
  const expectedCounts = [6, 1, 1, 3];
  for (const [groupIndex, count] of expectedCounts.entries()) {
    const group = current.addGroup(`wire-${String(groupIndex)}`, "wire");
    for (let lineIndex = 0; lineIndex < count; lineIndex += 1) {
      const line = current.addLine(group, `line-${String(groupIndex)}-${String(lineIndex)}`);
      line["strokeStyle"] = 0; line["strokeWidth"] = 1;
    }
  }
  const rows = schematicNetGroupStatesSchema.parse(read(current));
  assert.deepEqual(rows.map((row) => row.lines.length), expectedCounts);
  assert.ok(rows.flatMap((row) => row.lines).every((line) => line.strokeStyle === "SOLID" && line.width === 1 && line.color === null));
  assert.deepEqual(read(current, request("Bus")), []);
  validateSchematicNetGroupStates(rows, request());
});

void test("an empty family requires complete ownership and source inventory", () => {
  const current = fixture(); current.index.clear(); current.sources.clear(); current.family.clear(); current.root.children = [];
  assert.deepEqual(read(current), []); current.modelMap.clear(); assert.deepEqual(read(current, request("Bus")), []);
  current.sources.set("orphan-source", 1); assert.throws(() => read(current), /SCH_NETGROUP_SOURCE/u);
});

void test("selected identities are literal data and result selection never bypasses the complete family", () => {
  const current = fixture(), id = String.raw`literal-';throw new Error('code');//`;
  const group = current.addGroup(id, "wire"); current.addLine(group, "literal-line");
  const rows = schematicNetGroupStatesSchema.parse(read(current, request("Wire", ["z-wire", id]))); assert.deepEqual(rows.map((row) => row.primitiveId), [id, "z-wire"].toSorted());
  current.bus["type"] = "unknown"; assert.throws(() => read(current, request("Wire", "z-wire")), /SCH_NETGROUP_FAMILY/u);
});

const corruptions: Record<string, (current: Fixture) => void> = {
  "symbol scene": (current) => { current.scope["EXPECTED_DOCUMENT_TYPE"] = 2; },
  "instance page": (current) => { current.page["isBlockSymbolInstancePage"] = true; },
  "wrong owner": (current) => { current.page["projectMgr"] = { uuid: "foreign" }; },
  "running action": (current) => { current.shapes["actionRunner"] = { running: true }; },
  "missing manager": (current) => { current.scope["SCH"] = {}; },
  "bad ID": (current) => { current.line.id = "bad\n"; },
  "missing source": (current) => { current.sources.delete(current.line.id); },
  "structural group": (current) => { current.sources.set("structural-group", 1); },
  "wrong source marker": (current) => { current.sources.set(current.wire.id, 0); },
  "missing family": (current) => { current.family.delete(current.bus); },
  "duplicate family": (current) => { current.shapes["getModels"] = (): Model[] => [current.wire, current.wire]; },
  "root descendant promoted": (current) => { current.wire.parent = current.bus; },
  "missing line index": (current) => { current.index.delete(current.line.id); },
  "line collection omission": (current) => { current.wire["lines"] = []; },
  "line collection alias": (current) => { current.wire["lines"] = [current.line, current.line]; },
  "name collection omission": (current) => { current.wire["netNames"] = []; },
  "wrong line family": (current) => { current.line.modelType = "Bus"; },
  "wrong line owner": (current) => { current.line.parent = current.bus; },
  "wrong line kind": (current) => { current.line["type"] = "bus"; },
  "synthetic NetName type": (current) => { current.name.modelType = "NetName"; },
  "standalone label": (current) => { current.name.tagName = "NetLabel"; },
  "wrong name key": (current) => { current.name["keyInSourceCode"] = "_NETLABEL_"; },
  "stored generated marker": (current) => { current.sources.set("Junction", 1); },
  "custom child omission": (current) => { current.sources.delete("z-wire-relevance"); },
  "unknown child": (current) => { const child = current.index.get("z-wire-relevance"); assert.ok(child); child.modelType = "Text"; },
  "line descendants": (current) => { current.addChild(current.line, { id: "unexpected", modelType: "Attr", tagName: "Attr", cmdKey: "attr", shapeManager: current.shapes, isConnected: true }); },
  "combination": (current) => { current.wire["combination"] = {}; },
  "nonreciprocal tree": (current) => { current.wire.children?.pop(); },
  "async inventory": (current) => { Reflect.set(current.handler, "getSourceCodeIdMap", (): Promise<Map<string, number>> => Promise.resolve(current.sources)); },
};
for (const [name, corrupt] of Object.entries(corruptions)) {
  void test(`NetGroup read refuses ${name} without accepting partial geometry`, () => { const current = fixture(); corrupt(current); assert.throws(() => read(current), /SCH_NETGROUP_/u); });
}

for (const [field, values] of Object.entries({ points: [[], [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }], [{ x: Number.NaN, y: 0 }], [{ x: 0, y: Infinity }], [{ x: "0", y: 0 }], [{ x: 1_000_000_001, y: 0 }]],
  strokeColor: [undefined, false, "x".repeat(4097)], strokeWidth: [undefined, -1, Infinity, "1"], strokeStyle: [undefined, false, Number.NaN, Infinity, -Infinity, -1, 0.5, 4, "0", "SOLID", "SHORT_DASH", "DOT", "DOT_DASH", "DASHED", "unknown"] })) {
  void test(`NetGroup read refuses malformed ${field}`, () => { for (const value of values) { const current = fixture(); current.line[field] = value; assert.throws(() => read(current), /SCH_NETGROUP_STATE/u); } });
}
void test("NetGroup name strings are explicit and bounded", () => {
  for (const value of [undefined, null, 0, "x".repeat(65_537)]) { const current = fixture(); current.name["value"] = value; assert.throws(() => read(current), /SCH_NETGROUP_STATE/u); }
});

const drifts: Record<string, (current: Fixture) => void> = {
  "project receiver": (current) => { current.page["projectMgr"] = { uuid: "project" }; },
  "source membership": (current) => { current.sources.delete("z-wire-relevance"); },
  "family identity": (current) => { current.modelMap.set("NetGroup", new Set(current.family)); },
  "group kind": (current) => { current.wire["type"] = "bus"; },
  "line order": (current) => { const lines = current.wire["lines"]; assert.ok(Array.isArray(lines)); lines.reverse(); },
  "child order": (current) => { current.wire.children?.reverse(); },
  "name value": (current) => { current.name["value"] = "changed"; },
  "line style": (current) => { current.line["strokeStyle"] = 0; },
  "point signed zero": (current) => { current.line["points"] = [{ x: -0, y: -10 }, { x: 20, y: -30 }]; },
  "lock": (current) => { current.line["locked"] = true; },
  "identity replacement": (current) => { current.index.set(current.line.id, { ...current.line }); },
};
for (const [name, drift] of Object.entries(drifts)) {
  void test(`NetGroup read refuses ${name} drift between observations`, () => {
    const current = fixture(); let calls = 0; current.shapes["getModels"] = (): Model[] => { calls += 1; if (calls === 2) { drift(current); } return [...current.family]; };
    assert.throws(() => read(current), /SCH_NETGROUP_/u);
  });
}

void test("NetGroup reader reproves scalars changed by the final source-inventory callback", () => {
  for (const field of ["name", "color", "width", "style", "points"]) {
    const current = fixture(); let calls = 0;
    current.handler.getSourceCodeIdMap = (): Map<string, number> => {
      calls += 1;
      if (calls === 4) {
        if (field === "name") { current.name["value"] = "late-name"; }
        if (field === "color") { current.line["strokeColor"] = "#123456"; }
        if (field === "width") { current.line["strokeWidth"] = 3; }
        if (field === "style") { current.line["strokeStyle"] = 2; }
        if (field === "points") { current.line["points"] = [{ x: 99, y: 0 }]; }
      }
      return new Map(current.sources);
    };
    assert.throws(() => read(current), /SCH_NETGROUP_CHANGED/u);
  }
});

void test("style projection cannot conceal native signed-zero drift between captures or after the final source read", () => {
  for (const boundary of ["capture", "source"]) {
    const current = fixture(); current.line["strokeStyle"] = 0; let calls = 0;
    if (boundary === "capture") {
      current.shapes["getModels"] = (): Model[] => { calls += 1; if (calls === 2) { current.line["strokeStyle"] = -0; } return [...current.family]; };
    } else {
      current.handler.getSourceCodeIdMap = (): Map<string, number> => { calls += 1; if (calls === 4) { current.line["strokeStyle"] = -0; } return new Map(current.sources); };
    }
    assert.throws(() => read(current), /SCH_NETGROUP_CHANGED/u);
  }
});

const lateDiscriminators: Record<string, (current: Fixture) => void> = {
  "name tagName": (current) => { current.name.tagName = "NetLabel"; },
  "name cmdKey": (current) => { current.name.cmdKey = "attr"; },
  "name key": (current) => { current.name["key"] = "NET"; },
  "name keyInSourceCode": (current) => { current.name["keyInSourceCode"] = "_NETLABEL_"; },
  "line tagName": (current) => { current.line.tagName = "Polyline"; },
  "line cmdKey": (current) => { current.line.cmdKey = "bus"; },
  "line type": (current) => { current.line["type"] = "bus"; },
  "marker notAddHistory": (current) => { const marker = current.index.get("Junction"); assert.ok(marker); marker["notAddHistory"] = false; },
  "custom attribute tagName": (current) => { const attribute = current.index.get("z-wire-relevance"); assert.ok(attribute); attribute.tagName = "NetName"; },
};
for (const [name, drift] of Object.entries(lateDiscriminators)) {
  void test(`NetGroup reader refuses late ${name} changes after scalar capture`, () => {
    const current = fixture(); let calls = 0;
    current.handler.getSourceCodeIdMap = (): Map<string, number> => { calls += 1; if (calls === 4) { drift(current); } return new Map(current.sources); };
    assert.throws(() => read(current), /SCH_NETGROUP_CHANGED/u);
  });
}

void test("complete-family bounds remain in force for selected reads", () => {
  const groups = fixture(); for (let index = 0; index < 255; index += 1) { const group = groups.addGroup(`extra-${String(index)}`, "bus"); groups.addLine(group, `extra-line-${String(index)}`); }
  assert.throws(() => read(groups, request("Wire", "z-wire")), /SCH_NETGROUP_FAMILY/u);
  const lines = fixture(); for (let index = 0; index < 1022; index += 1) { lines.addLine(lines.bus, `extra-${String(index)}`); }
  assert.throws(() => read(lines, request("Wire", "z-wire")), /SCH_NETGROUP_BOUND/u);
  const names = fixture(); for (let index = 0; index < 1022; index += 1) { names.addName(names.bus, `name-${String(index)}`, ""); }
  assert.throws(() => read(names, request("Wire", "z-wire")), /SCH_NETGROUP_BOUND/u);
  const values = fixture(); values.name["value"] = "x".repeat(65_536); for (let index = 0; index < 4; index += 1) { values.addName(values.bus, `large-${String(index)}`, "x".repeat(65_536)); }
  assert.throws(() => read(values, request("Wire", "z-wire")), /SCH_NETGROUP_BOUND/u);
});

void test("request and host result schemas refuse extra fields, net filters, wrong family and incomplete selections", () => {
  for (const method of SCHEMATIC_NETGROUP_READ_METHODS) { assert.equal(isSchematicNetGroupReadMethod(method), true); }
  assert.equal(isSchematicNetGroupReadMethod("eda.sch_PrimitiveWire.create"), false);
  for (const primitiveIds of [[], ["a", "a"], ["a\n"], {}, null, Array.from({ length: 257 }, (_, index) => String(index))]) {
    assert.throws(() => schematicNetGroupReadRequestSchema.parse({ method: SCHEMATIC_NETGROUP_READ_METHODS[0], arguments: { primitiveIds } }));
  }
  for (const argumentsValue of [{ net: "NET_A" }, { primitiveIds: "z-wire" }, { code: "caller" }]) { assert.throws(() => schematicNetGroupReadRequestSchema.parse({ method: SCHEMATIC_NETGROUP_READ_METHODS[1], arguments: argumentsValue })); }
  const rows = schematicNetGroupStatesSchema.parse(read(fixture()));
  assert.throws(() => { validateSchematicNetGroupStates(rows, request("Bus")); });
  assert.throws(() => { validateSchematicNetGroupStates(rows, request("Wire", ["z-wire", "missing"])); });
  assert.throws(() => schematicNetGroupStatesSchema.parse([...rows, ...rows]));
  const row = rows[0]; assert.ok(row);
  assert.throws(() => schematicNetGroupStatesSchema.parse([{ ...row, unknown: true }]));
  assert.throws(() => schematicNetGroupStatesSchema.parse([{ ...row, lines: row.lines.toReversed() }]));
  assert.throws(() => schematicNetGroupStatesSchema.parse([{ ...row, customAttributeIds: ["z-line"] }]));
});

void test("diagnostic codes are fixed and private exception text is never interpolated into an accepted observation", () => {
  const guards = [...new Set([...buildSchematicNetGroupReadExpression(request()).matchAll(/bad\('([A-Z_]+)'\)/gu)].map((match) => match[1] ?? ""))].toSorted();
  assert.deepEqual(guards, [...SCHEMATIC_NETGROUP_GUARD_CODES].toSorted());
  assert.throws(() => Reflect.apply(buildSchematicNetGroupReadExpression, undefined, [request(), "caller-code"]));
  const current = fixture(); current.name["value"] = null;
  assert.throws(() => runInNewContext(`let failureCode;try{${buildSchematicNetGroupReadExpression(request(), "sdk-failure-code")}}catch{throw new Error(failureCode);}`, current.scope), /SCH_NETGROUP_STATE/u);
});
