import assert from "node:assert/strict";
import { test } from "node:test";
import { isRecord, loadReviewedCompatibilityManifest, reviewedCompatibilityManifestFingerprint, sha256Json } from "../src/core.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "../src/document-source.ts";
import { buildExactReadCode, decodeExactReadEnvelope, validateExactReadPayload } from "../src/exact-readers.ts";
import { PCB_NET_MEMBERSHIP_API_SHA256, PCB_NET_MEMBERSHIP_LIMITATIONS, PCB_NET_MEMBERSHIP_METHOD, PCB_NET_MEMBERSHIP_PCB_SHA256,
  derivePcbNetMembership, pcbNetMembershipItemsSchema, pcbNetMembershipRequestSchema } from "../src/pcb-net-membership.ts";
import { readPcbNetMembership } from "../src/pcb-net-membership-read.ts";
import type { PcbNetMembershipEngine } from "../src/pcb-net-membership-read.ts";
import { PCB_PRIMITIVE_TYPE_METHOD, derivePcbPrimitiveType, readPcbPrimitiveType } from "../src/pcb-primitive-type-read.ts";

type Value = Record<string, unknown>;
interface Item { primitiveId: string; primitiveType: string; net: string | null; parentComponentPrimitiveId?: string; padNumber?: string; }
interface Family { count: number; primitiveIds: string[]; byPrimitiveId: Record<string, Item>; }
interface ComponentFamily { status: string; count: number; primitiveIds: string[]; }
interface Link { primitiveId: string; parentComponentPrimitiveId: string; padNumber: string; net: string | null; }
interface Inventory { ok: true; kind: "pcb-inventory"; documentType: 3; families: Record<string, Family | ComponentFamily>;
  componentPadCorrelation: { status: "exact-subset"; count: number; primitiveIds: string[]; byPrimitiveId: Record<string, Link>; byComponentPrimitiveId: Record<string, string[]> }; }
interface Fixture { objects: NativeSourceObject[]; inventory: Inventory; }
const request = { method: PCB_NET_MEMBERSHIP_METHOD, arguments: { net: "signal", primitiveTypes: ["Line", "Arc", "Via", "Pad", "ComponentPad"] } };
const context = { project: { uuid: "project", path: "/fixture/project.eprj2" }, document: { uuid: "board", documentType: 3, tabId: "board@project", parentProjectUuid: "project" } };
function object(type: string, id: string, body: Value): NativeSourceObject { return { type, id, body }; }
function snapshot(objects: NativeSourceObject[]): NativeSourceSnapshot {
  const value = { schema: "easyeda-pro-control.document-source.v1" as const, document: { uuid: "board", docType: "PCB", editVersion: "3.2.149.88089769" },
    objects: objects.toSorted((left, right) => left.id.localeCompare(right.id)) };
  return { ...value, sha256: sha256Json(value) };
}
function family(rows: Item[]): Family { return { count: rows.length, primitiveIds: rows.map((row) => row.primitiveId).toSorted(), byPrimitiveId: Object.fromEntries(rows.map((row) => [row.primitiveId, row])) }; }
function fixture(): Fixture {
  const objects = [object("LINE", "line", { netName: "SIGNAL", parentId: "" }), object("LINE", "other-line", { netName: "OTHER" }),
    object("LINE", "unassigned", { netName: "" }), object("ARC", "arc", { netName: "Signal" }), object("VIA", "via", { netName: "SIGNAL" }),
    object("PAD", "pad", { netName: "SIGNAL", num: "3" }), object("COMPONENT", "component", { footprintUuid: "footprint" }),
    object("PAD_NET", '["PAD_NET","component","1","local"]', { padNet: "SIGNAL" }), object("NET", '["NET","SIGNAL"]', {}),
    object("CANVAS", "origin", { x: 0, y: 0 }), object("FILL", "fill", { netName: "SIGNAL", isBridgingCopper: false })];
  return { objects, inventory: { ok: true, kind: "pcb-inventory", documentType: 3, families: {
    lines: family([{ primitiveId: "line", primitiveType: "Line", net: "SIGNAL" }, { primitiveId: "other-line", primitiveType: "Line", net: "OTHER" }, { primitiveId: "unassigned", primitiveType: "Line", net: null }]),
    arcs: family([{ primitiveId: "arc", primitiveType: "Arc", net: "Signal" }]), vias: family([{ primitiveId: "via", primitiveType: "Via", net: "SIGNAL" }]),
    pads: family([{ primitiveId: "pad", primitiveType: "Pad", net: "SIGNAL", padNumber: "3" },
      { primitiveId: "componentlocal", primitiveType: "Pad", net: "SIGNAL", padNumber: "1", parentComponentPrimitiveId: "component" }]),
    components: { status: "adapter-enumerated", count: 1, primitiveIds: ["component"] },
  }, componentPadCorrelation: { status: "exact-subset", count: 1, primitiveIds: ["componentlocal"],
    byPrimitiveId: { componentlocal: { primitiveId: "componentlocal", parentComponentPrimitiveId: "component", padNumber: "1", net: "SIGNAL" } },
    byComponentPrimitiveId: { component: ["componentlocal"] } } } };
}
function item(state: Fixture, name: string, id: string): Item {
  const row = getFamily(state, name).byPrimitiveId[id]; assert.ok(row); return row;
}
function getFamily(state: Fixture, name: string): Family { const value = state.inventory.families[name]; assert.ok(value && "byPrimitiveId" in value); return value; }
function getComponents(state: Fixture): ComponentFamily { const value = state.inventory.families["components"]; assert.ok(value && "status" in value); return value; }
function source(state: Fixture, id: string): NativeSourceObject { const value = state.objects.find((row) => row.id === id); assert.ok(value); return value; }
function derive(state: Fixture, input: unknown = request): ReturnType<typeof derivePcbNetMembership> {
  return derivePcbNetMembership(snapshot(state.objects), state.inventory, input, "board");
}
function disabledPanel(): Value {
  const stamp = { on: false, stampHoleGroupQuantity: 1, stampHoleDiameter: 20, stampHoleQuantityPerGroup: 8, stampHoleSpacing: 30 };
  const side = { on: false, sideHeight: 200, positionHoleDiameter: 80, markDiameter: 40, markExpansion: 20 };
  return { on: false, row: 1, column: 1, rowSpacing: 0, columnSpacing: 0, onlyOutline: true,
    horizontalStamp: { ...stamp }, verticalStamp: { ...stamp }, horizontalSize: { ...side }, verticalSize: { ...side, on: true } };
}

void test("disabled default PANELIZE retains dormant settings without adding members or weakening type proof", () => {
  const state = fixture();
  const original = derive(state);
  state.objects.push(object("PANELIZE", "PANELIZE", disabledPanel()));
  const before = structuredClone(state);
  assert.deepEqual(derive(state), original);
  for (const [id, type] of [["line", "Line"], ["arc", "Arc"], ["via", "Via"], ["pad", "Pad"], ["componentlocal", "ComponentPad"]]) {
    assert.equal(derivePcbPrimitiveType(snapshot(state.objects), state.inventory, { method: PCB_PRIMITIVE_TYPE_METHOD, arguments: { id } }, "board"), type);
  }
  assert.deepEqual(state, before);
});
const panelDefects: [string, (body: Value) => void][] = [
  ["enabled", (body) => { body["on"] = true; }], ["coerced off", (body) => { body["on"] = 0; }],
  ["extra field", (body) => { body["futureGeometry"] = []; }],
  ...["row", "column", "rowSpacing", "columnSpacing", "onlyOutline"].map((key): [string, (body: Value) => void] =>
    [`nondefault ${key}`, (body) => { body[key] = key === "onlyOutline" ? false : 2; }]),
  ...Object.keys(disabledPanel()).map((key): [string, (body: Value) => void] => [`missing ${key}`, (body) => { Reflect.deleteProperty(body, key); }]),
];
for (const group of ["horizontalStamp", "verticalStamp", "horizontalSize", "verticalSize"]) {
  const nested = disabledPanel()[group]; assert.ok(isRecord(nested));
  for (const key of [...Object.keys(nested), "extra"]) {
    panelDefects.push([`${group} ${key} malformed`, (body): void => {
      const fields = body[group]; assert.ok(isRecord(fields)); fields[key] = key === "on" ? 0 : "invalid";
    }]);
    if (key !== "extra") { panelDefects.push([`${group} ${key} missing`, (body): void => { const fields = body[group]; assert.ok(isRecord(fields)); Reflect.deleteProperty(fields, key); }]); }
  }
}
for (const value of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, "20", null]) {
  panelDefects.push([`invalid nested dimension ${String(value)}`, (body): void => { const fields = body["verticalSize"]; assert.ok(isRecord(fields)); fields["markDiameter"] = value; }]);
}
for (const value of [0, -1, 1.5, 20_001, Number.POSITIVE_INFINITY]) {
  panelDefects.push([`invalid nested quantity ${String(value)}`, (body): void => { const fields = body["horizontalStamp"]; assert.ok(isRecord(fields)); fields["stampHoleGroupQuantity"] = value; }]);
}
for (const [label, mutate] of panelDefects) {
  void test(`PANELIZE refuses ${label} for membership and type`, () => {
    const body = disabledPanel(), state = fixture(); mutate(body); state.objects.push(object("PANELIZE", "PANELIZE", body));
    assert.throws(() => derive(state), /PANELIZE/u);
    assert.throws(() => derivePcbPrimitiveType(snapshot(state.objects), state.inventory, { method: PCB_PRIMITIVE_TYPE_METHOD, arguments: { id: "via" } }, "board"), /PANELIZE/u);
  });
}
for (const rows of [
  [object("PANELIZE", "alias", disabledPanel())], [object("CANVAS", "PANELIZE", disabledPanel())],
  [object("PANELIZE", "PANELIZE", disabledPanel()), object("PANELIZE", "alias", disabledPanel())],
  [object("PANELIZE", "PANELIZE", disabledPanel()), object("PANELIZE", "PANELIZE", disabledPanel())],
  [object("PANELIZE", "PANELIZE", disabledPanel()), object("PANELIZE_STAMP", "stamp", { on: false })],
]) {
  void test(`PANELIZE refuses noncanonical/ambiguous/descendant headers ${JSON.stringify(rows.map((row) => [row.type, row.id]))}`, () => {
    const state = fixture(); state.objects.push(...rows); assert.throws(() => derive(state));
  });
}
void test("disabled PANELIZE never excuses missing or inherited inventory and never discards source fields", () => {
  const state = fixture(); state.objects.push(object("PANELIZE", "PANELIZE", disabledPanel()));
  const before = snapshot(state.objects), panel = source(state, "PANELIZE").body["verticalSize"]; assert.ok(isRecord(panel));
  panel["markDiameter"] = 41;
  assert.throws(() => derivePcbNetMembership({ ...before, objects: state.objects }, state.inventory, request, "board"), /commitment/u);
  const lines = getFamily(state, "lines"); lines.primitiveIds.push("component-silk-line"); lines.count += 1;
  lines.byPrimitiveId["component-silk-line"] = { primitiveId: "component-silk-line", primitiveType: "Line", net: "" };
  assert.throws(() => derive(state), /incomplete or ambiguous/u);
  assert.throws(() => derivePcbPrimitiveType(snapshot(state.objects), state.inventory, { method: PCB_PRIMITIVE_TYPE_METHOD, arguments: { id: "via" } }, "board"), /incomplete or ambiguous/u);
  const narrowed = { ...request, arguments: { net: "SIGNAL", primitiveTypes: ["Via", "Arc", "ComponentPad"] } };
  assert.deepEqual(derive(state, narrowed).map((row) => row.primitiveId), ["arc", "componentlocal", "via"]);
  const vias = getFamily(state, "vias"); vias.primitiveIds = []; vias.count = 0; vias.byPrimitiveId = {};
  assert.throws(() => derive(state, narrowed), /incomplete or ambiguous/u);
});

void test("native net membership preserves spelling, case-folds lookup and proves disjoint physical pad owners", () => {
  const state = fixture();
  const before = structuredClone(state);
  const result = derive(state);
  assert.deepEqual(result.map((row) => [row.primitiveId, row.primitiveType, row.net, row.parentComponentPrimitiveId]), [
    ["arc", "Arc", "Signal", null], ["componentlocal", "ComponentPad", "SIGNAL", "component"], ["line", "Line", "SIGNAL", null],
    ["pad", "Pad", "SIGNAL", null], ["via", "Via", "SIGNAL", null],
  ]);
  assert.equal(result[1]?.sourceRecordId, '["PAD_NET","component","1","local"]');
  assert.deepEqual(state, before);
  assert.deepEqual(derive(state, { ...request, arguments: { net: "UNKNOWN", primitiveTypes: ["Line"] } }), []);
});
for (const type of ["Line", "Arc", "Via", "Pad", "ComponentPad"]) {
  void test(`native net membership returns only the complete selected ${type} role`, () => {
    const result = derive(fixture(), { ...request, arguments: { net: "SIGNAL", primitiveTypes: [type] } });
    assert.equal(result.length, 1); assert.equal(result[0]?.primitiveType, type);
  });
}
void test("native net membership uses Unicode uppercase without normalizing the stored net spelling", () => {
  const state = fixture(); source(state, "line").body["netName"] = "straße"; item(state, "lines", "line").net = "straße";
  assert.equal(derive(state, { ...request, arguments: { net: "STRASSE", primitiveTypes: ["Line"] } })[0]?.net, "straße");
});
void test("ordinary native STRING records do not block or contribute electrical membership", () => {
  const state = fixture();
  const original = derive(state);
  state.objects.push(object("STRING", "silkscreen", { partitionId: "", layerId: 3, text: "SIGNAL", fontFamily: "default", fontSize: 60,
    x: 100, y: 200, strokeWidth: 6, bold: false, italic: false, origin: "LEFT", angle: 0, reverse: false, mirror: false, locked: false }));
  assert.deepEqual(derive(state), original);
  const lines = getFamily(state, "lines");
  lines.primitiveIds.push("silkscreen"); lines.count += 1;
  lines.byPrimitiveId["silkscreen"] = { primitiveId: "silkscreen", primitiveType: "Line", net: "SIGNAL" };
  assert.throws(() => derive(state), /incomplete or ambiguous/u);
});
void test("STRING admission does not admit partition descendants or additional request families", () => {
  const state = fixture(); state.objects.push(object("STRING", "silkscreen", { partitionId: "child", text: "SIGNAL" }));
  assert.throws(() => derive(state), /partition descendants/u);
  assert.equal(pcbNetMembershipRequestSchema.safeParse({ ...request, arguments: { net: "SIGNAL", primitiveTypes: ["Text"] } }).success, false);
  assert.equal(pcbNetMembershipRequestSchema.safeParse({ ...request, arguments: { net: "SIGNAL", primitiveTypes: ["STRING"] } }).success, false);
});
const nonselectedMetadata: [string, Value][] = [
  ["FONT", { text: "SIGNAL", fontFamily: "default", fontSize: 60, width: 300, height: 60, bold: false, italic: false, reverse: false,
    expansion: 0, path: [[0, 0, "L", 10, 0, "ARC", 90, 20, 10]] }],
  ["RULE_TEMPLATE", { name: "default" }], ["PRIMITIVE", { display: false, pick: false }],
  ["PREFERENCE", { startTrackWidthFollowLast: true, lastTrackWidth: 10, startViaSizeFollowLast: true, lastViaInnerDiameter: 12,
    lastViaDiameter: 24, snap: true, routingMode: "single", routingCorner: "45", removeLoop: true, removeAntenna: true }],
  ["SILK_OPTS", { defaultColor: "#ffffff", baseColor: "#000000" }],
];
for (const [type, body] of nonselectedMetadata) {
  void test(`reviewed ${type} metadata contributes no selected membership and cannot hide incomplete inventory`, () => {
    const state = fixture();
    const original = derive(state);
    state.objects.push(object(type, JSON.stringify([type, "fixture"]), body));
    assert.deepEqual(derive(state), original);
    const lines = getFamily(state, "lines");
    delete lines.byPrimitiveId["unassigned"]; lines.primitiveIds = lines.primitiveIds.filter((id) => id !== "unassigned"); lines.count -= 1;
    assert.throws(() => derive(state), /incomplete or ambiguous/u);
    assert.equal(pcbNetMembershipRequestSchema.safeParse({ ...request, arguments: { net: "SIGNAL", primitiveTypes: [type] } }).success, false);
  });
}
const boardPaths: [string, unknown[]][] = [
  ["polygon with drawing Line and Arc children", [0, 0, "L", 100, 0, "ARC", 90, 100, 100, "L", 0, 0]],
  ["nested polygon", [[0, 0, "L", 100, 0, 100, 100, 0, 100, 0, 0]]],
  ["rectangle", ["R", 0, 0, 100, 100, 0, 0]],
  ["circle", ["CIRCLE", 0, 0, 100]],
];
for (const [label, path] of boardPaths) {
  void test(`BOARD ${label} contributes no electrical identities or source changes`, () => {
    const state = fixture();
    const expected = derive(state);
    // The native decoder reads path only, not an apparent net field.
    // That field is not an electrical assignment and cannot fabricate a member.
    state.objects.push(object("BOARD", "board-outline", { path, netName: "SIGNAL" }));
    const before = structuredClone(state);
    assert.deepEqual(derive(state), expected);
    assert.deepEqual(state, before);
    for (const primitiveType of ["Line", "Arc", "Via", "Pad", "ComponentPad"]) {
      const input = { ...request, arguments: { net: "SIGNAL", primitiveTypes: [primitiveType] } };
      assert.deepEqual(derive(state, input), derive(fixture(), input));
    }
  });
}
for (const [name, type] of [["lines", "Line"], ["arcs", "Arc"]] as const) {
  for (const assignedNet of [null, "", "OTHER", "SIGNAL"]) {
    void test(`BOARD cannot excuse an extra ${type} inventory identity with net ${String(assignedNet)}`, () => {
      const state = fixture(); state.objects.push(object("BOARD", "board-outline", { path: boardPaths[0]?.[1] }));
      const rows = getFamily(state, name);
      rows.primitiveIds.push("board-outline-child"); rows.count += 1;
      rows.byPrimitiveId["board-outline-child"] = { primitiveId: "board-outline-child", primitiveType: type, net: assignedNet };
      assert.throws(() => derive(state), /incomplete or ambiguous/u);
    });
  }
}
for (const id of ["line", "other-line", "unassigned"]) {
  void test(`BOARD cannot excuse the missing electrical inventory identity ${id}`, () => {
    const state = fixture(); state.objects.push(object("BOARD", "board-outline", { path: boardPaths[0]?.[1] }));
    const rows = getFamily(state, "lines");
    rows.byPrimitiveId = Object.fromEntries(Object.entries(rows.byPrimitiveId).filter(([key]) => key !== id));
    rows.primitiveIds = rows.primitiveIds.filter((value) => value !== id); rows.count -= 1;
    assert.throws(() => derive(state), /incomplete or ambiguous/u);
  });
}
void test("BOARD admission retains partition, source commitment and request/result family restrictions", () => {
  const state = fixture(); state.objects.push(object("BOARD", "board-outline", { path: boardPaths[0]?.[1] }));
  const before = snapshot(state.objects);
  source(state, "board-outline").body["path"] = ["CIRCLE", 1, 1, 100];
  assert.throws(() => derivePcbNetMembership({ ...before, objects: state.objects }, state.inventory, request, "board"), /commitment/u);
  source(state, "board-outline").body["partitionId"] = "partition";
  assert.throws(() => derive(state), /partition descendants/u);
  assert.equal(pcbNetMembershipRequestSchema.safeParse({ ...request, arguments: { net: "SIGNAL", primitiveTypes: ["BOARD"] } }).success, false);
  assert.equal(pcbNetMembershipItemsSchema.safeParse([{ primitiveId: "board-outline", primitiveType: "Line", net: "SIGNAL",
    parentComponentPrimitiveId: null, sourceRecordId: "board-outline", sourceType: "BOARD" }]).success, false);
});
for (const invalid of [undefined, {}, { ...request, code: "arbitrary()" }, { ...request, method: "eda.pcb_Net.selectNet" },
  { ...request, arguments: { net: "SIGNAL" } }, { ...request, arguments: { net: "SIGNAL", primitiveTypes: [] } },
  { ...request, arguments: { net: "SIGNAL", primitiveTypes: ["Line", "Line"] } }, { ...request, arguments: { net: "SIGNAL", primitiveTypes: ["Fill"] } },
  { ...request, arguments: { net: "", primitiveTypes: ["Line"] } }, { ...request, arguments: { net: "SIGNAL\n", primitiveTypes: ["Line"] } },
  { ...request, arguments: { net: "n".repeat(1025), primitiveTypes: ["Line"] } }, { ...request, arguments: { net: "SIGNAL", primitiveTypes: ["Line"], limit: 1 } }]) {
  void test(`net membership rejects unsupported request ${JSON.stringify(invalid)?.slice(0, 90) ?? "undefined"}`, () => { assert.equal(pcbNetMembershipRequestSchema.safeParse(invalid).success, false); });
}
const defects: [string, (state: Fixture) => void][] = [
  ["missing nonmatching-net line", (state) => { const rows = getFamily(state, "lines"); delete rows.byPrimitiveId["other-line"]; rows.primitiveIds = rows.primitiveIds.filter((id) => id !== "other-line"); rows.count -= 1; }],
  ["missing unassigned line", (state) => { const rows = getFamily(state, "lines"); delete rows.byPrimitiveId["unassigned"]; rows.primitiveIds = rows.primitiveIds.filter((id) => id !== "unassigned"); rows.count -= 1; }],
  ["extra native line", (state) => { const rows = getFamily(state, "lines"); rows.byPrimitiveId["phantom"] = { primitiveId: "phantom", primitiveType: "Line", net: "OTHER" }; rows.primitiveIds.push("phantom"); rows.count += 1; }],
  ["wrong line net", (state) => { item(state, "lines", "other-line").net = "SIGNAL"; }],
  ["wrong native line type", (state) => { item(state, "lines", "line").primitiveType = "Arc"; }],
  ["contradictory row ID", (state) => { item(state, "lines", "line").primitiveId = "other-line"; }],
  ["repeated family ID", (state) => { getFamily(state, "lines").primitiveIds[1] = "line"; }],
  ["wrong family count", (state) => { getFamily(state, "lines").count = 0; }],
  ["missing family", (state) => { delete state.inventory.families["arcs"]; }],
  ["unsupported source record", (state) => { state.objects.push(object("FUTURE_LINE", "new", { netName: "OTHER" })); }],
  ["derived copper source", (state) => { state.objects.push(object("POURED", "poured", { netName: "OTHER" })); }],
  ["partition owner", (state) => { source(state, "line").body["partitionId"] = "partition"; }],
  ["inherited line", (state) => { source(state, "line").body["parentId"] = "component"; }],
  ["unknown native parent", (state) => { item(state, "lines", "line").parentComponentPrimitiveId = "component"; }],
  ["missing native net field", (state) => { delete source(state, "line").body["netName"]; }],
  ["PAD_NET without component", (state) => { state.objects = state.objects.filter((row) => row.type !== "COMPONENT"); }],
  ["PAD_NET noncanonical ID", (state) => { const index = state.objects.findIndex((row) => row.type === "PAD_NET"); state.objects[index] = object("PAD_NET", '["PAD_NET", "component", "1", "local"]', { padNet: "SIGNAL" }); }],
  ["PAD_NET identity too long", (state) => { const index = state.objects.findIndex((row) => row.type === "PAD_NET"); state.objects[index] = object("PAD_NET", '["PAD_NET","component","1","local","extra"]', { padNet: "SIGNAL" }); }],
  ["PAD_NET contradictory explicit parent", (state) => { const row = state.objects.find((entry) => entry.type === "PAD_NET"); assert.ok(row); row.body["parentId"] = "other"; }],
  ["PAD_NET missing assignment", (state) => { const row = state.objects.find((entry) => entry.type === "PAD_NET"); assert.ok(row); delete row.body["padNet"]; }],
  ["two records alias same physical pad", (state) => { state.objects.push(object("PAD", "componentlocal", { num: "1", netName: "SIGNAL" })); }],
  ["inherited local-only ID", (state) => { item(state, "pads", "componentlocal").primitiveId = "local"; }],
  ["inherited parent lost", (state) => { delete item(state, "pads", "componentlocal").parentComponentPrimitiveId; }],
  ["standalone falsely inherited", (state) => { item(state, "pads", "pad").parentComponentPrimitiveId = "component"; }],
  ["pad number contradiction", (state) => { item(state, "pads", "componentlocal").padNumber = "2"; }],
  ["component count missing", (state) => { getComponents(state).count = 0; }],
  ["component identity substitution", (state) => { getComponents(state).primitiveIds = ["other"]; }],
  ["component enumeration status substitution", (state) => { getComponents(state).status = "unknown"; }],
  ["component duplicate identity", (state) => { getComponents(state).primitiveIds.push("component"); getComponents(state).count += 1; }],
  ["component fabricated state index", (state) => { state.inventory.families["components"] = { ...getComponents(state), byPrimitiveId: { component: { primitiveId: "component", primitiveType: "Component", net: null } } }; }],
  ["component correlation extra key", (state) => { state.inventory.componentPadCorrelation.byPrimitiveId["extra"] = { primitiveId: "extra", parentComponentPrimitiveId: "component", net: "SIGNAL", padNumber: "2" }; }],
  ["component correlation missing owner", (state) => { delete state.inventory.componentPadCorrelation.byComponentPrimitiveId["component"]; }],
  ["component correlation duplicate child", (state) => { state.inventory.componentPadCorrelation.byComponentPrimitiveId["component"] = ["componentlocal", "componentlocal"]; }],
  ["component correlation wrong child", (state) => { state.inventory.componentPadCorrelation.byComponentPrimitiveId["component"] = ["pad"]; }],
  ["component correlation wrong count", (state) => { state.inventory.componentPadCorrelation.count = 0; }],
  ["component correlation wrong parent", (state) => { const row = state.inventory.componentPadCorrelation.byPrimitiveId["componentlocal"]; assert.ok(row); row.parentComponentPrimitiveId = "other"; }],
  ["component correlation wrong net", (state) => { const row = state.inventory.componentPadCorrelation.byPrimitiveId["componentlocal"]; assert.ok(row); row.net = "OTHER"; }],
];
for (const [label, mutate] of defects) {
  void test(`net membership refuses ${label} before publishing a subset`, () => { const state = fixture(); mutate(state); assert.throws(() => derive(state)); });
}
void test("Pad-only requests still prove all inherited physical pad ownership before filtering", () => {
  const state = fixture(); delete item(state, "pads", "componentlocal").parentComponentPrimitiveId;
  assert.throws(() => derive(state, { ...request, arguments: { net: "SIGNAL", primitiveTypes: ["Pad"] } }));
});
void test("unrequested families do not require a fabricated completeness claim", () => {
  const state = fixture(); delete state.inventory.families["arcs"];
  assert.equal(derive(state, { ...request, arguments: { net: "SIGNAL", primitiveTypes: ["Line"] } }).length, 1);
});
void test("source commitments, identities, editor versions and duplicate source IDs are mandatory", () => {
  const state = fixture();
  const original = snapshot(state.objects);
  for (const changed of [{ ...original, sha256: "0".repeat(64) }, { ...original, document: { ...original.document, uuid: "foreign" } },
    { ...original, document: { ...original.document, editVersion: "latest" } }, snapshot([...state.objects, source(state, "line")])]) {
    assert.throws(() => derivePcbNetMembership(changed, state.inventory, request, "board"));
  }
  assert.throws(() => derivePcbNetMembership(original, state.inventory, request, "foreign"));
});
void test("source row and result byte bounds never truncate membership", () => {
  const state = fixture(); const empty = Array.from({ length: 20_001 }, (_, index) => object("NET", `n${index}`, {}));
  assert.throws(() => derivePcbNetMembership(snapshot(empty), state.inventory, request, "board"));
  const rows: NativeSourceObject[] = [];
  const items: Item[] = [];
  const longNet = "N".repeat(1024);
  for (let index = 0; index < 2500; index += 1) { const id = `line${index}`; rows.push(object("LINE", id, { netName: longNet })); items.push({ primitiveId: id, primitiveType: "Line", net: longNet }); }
  state.objects = rows; state.inventory.families["lines"] = family(items);
  assert.throws(() => derive(state, { ...request, arguments: { net: longNet, primitiveTypes: ["Line"] } }), /byte bound/u);
});
void test("strict result schema refuses extra fields, duplicates and mismatched physical owner roles", () => {
  const rows = derive(fixture());
  const row = rows[0];
  const inherited = rows[1]; assert.ok(row && inherited);
  for (const value of [[{ ...row, x: 12 }], [row, row], [{ ...row, sourceType: "PAD" }], [{ ...row, parentComponentPrimitiveId: "component" }],
    [{ ...inherited, sourceRecordId: '["PAD_NET","other","1","local"]' }], [{ ...inherited, parentComponentPrimitiveId: null }],
    [{ ...inherited, primitiveId: "component", sourceRecordId: '["PAD_NET","component","1",""]' }]]) {
    assert.equal(pcbNetMembershipItemsSchema.safeParse(value).success, false);
  }
});

function fingerprint(): Value {
  const manifest = loadReviewedCompatibilityManifest();
  const facade = manifest.facadeImplementation["source-tree"];
  const pinnedRuntime = manifest.connectedRuntime;
  return { facadeImplementation: { ...facade, mode: "source-tree", files: facade.files.map((file) => ({ path: `/opt/control/${file.relativePath}`, relativePath: file.relativePath, bytes: file.bytes, sha256: file.sha256 })) },
    upstreamServer: { version: manifest.upstream.serverVersion }, upstreamLauncher: manifest.upstream.launcher, upstreamImplementationDrift: false,
    reviewedCompatibilityManifest: reviewedCompatibilityManifestFingerprint(), toolCount: manifest.upstream.toolCatalog.count, toolCatalogSha256: manifest.upstream.toolCatalog.sha256,
    health: { payload: { version: pinnedRuntime.healthVersion, node_version: pinnedRuntime.nodeVersion, bridge_connected: true, easyeda_version: pinnedRuntime.easyedaVersion,
      extension_version: pinnedRuntime.extensionVersion, extension_version_mismatch: false, registry_mismatch: false } },
    bridge: { payload: { connected: true, bridge_version: pinnedRuntime.bridgeVersion, ...(pinnedRuntime.bridgeEasyedaVersion === null ? {} : { easyeda_version: pinnedRuntime.bridgeEasyedaVersion }), diagnostics: { method_registry_hash: pinnedRuntime.methodRegistryHash } } },
    bridgeDispatcher: { payload: { source: pinnedRuntime.dispatcher.source, dispatcher_build_id: pinnedRuntime.dispatcher.buildId, total: pinnedRuntime.dispatcher.total } },
    installedBundles: { available: true, assetsRoot: "/opt/assets", pcbEditor: { ...manifest.installedBundles.pcbEditor, implementationPath: "/opt/assets/pcb.js" },
      publicApi: { ...manifest.installedBundles.publicApi, implementationPath: "/opt/assets/api.js", adapterPath: "/opt/assets/adapter.js", declarationsPath: "/opt/assets/api.d.ts" } } };
}
function exact(sample: Value): Value { return { ...sample, read_consistency: { stable: true, attempts: 2, snapshotSha256: sha256Json(sample),
  contextBinding: { level: "active-context-stability-required", preAndPostChecked: true, switchAwayAndBackDetectable: false } } }; }
function sourceString(objects: NativeSourceObject[]): string {
  const value = snapshot(objects); return [`{"type":"DOCHEAD"}||${JSON.stringify(value.document)}`,
    ...value.objects.map((row) => `${JSON.stringify({ type: row.type, id: row.id })}||${JSON.stringify(row.body)}`)].join("|\n");
}
interface RuntimeOptions { failContext?: number; quarantine?: number; runtimeDrift?: boolean; corruptHash?: number; sourceDrift?: boolean; failRead?: number; changeKind?: number; cycleDrift?: boolean; inventoryDrift?: boolean; foreignProject?: boolean; metadataDrift?: boolean; boardDrift?: number; panelDrift?: number; }
function runtime(options: RuntimeOptions = {}): { engine: PcbNetMembershipEngine; calls: string[]; counts: { contexts: number; gates: number; statuses: number } } {
  const state = fixture();
  if (options.boardDrift !== undefined) { state.objects.push(object("BOARD", "board-outline", { path: boardPaths[0]?.[1] })); }
  if (options.panelDrift !== undefined) { state.objects.push(object("PANELIZE", "PANELIZE", disabledPanel())); }
  const originalFingerprint = fingerprint();
  const calls: string[] = [];
  const counts = { contexts: 0, gates: 0, statuses: 0 };
  return { calls, counts, engine: {
    checkpoint: (): Promise<never> => Promise.reject(new Error("Unexpected inherited-Line checkpoint.")),
    assertBridgeDispatchAllowed: (): Promise<true> => { counts.gates += 1; return counts.gates === options.quarantine ? Promise.reject(new Error("quarantined")) : Promise.resolve(true); },
    status: (): Promise<{ stableFingerprint: Value }> => { counts.statuses += 1; return Promise.resolve({ stableFingerprint: options.runtimeDrift === true && counts.statuses > 1 ? { ...originalFingerprint, toolCount: 0 } : structuredClone(originalFingerprint) }); },
    assertContext: (): Promise<typeof context> => {
      counts.contexts += 1;
      if (options.foreignProject === true) { return Promise.resolve({ project: { ...context.project, uuid: "foreign" }, document: { ...context.document, parentProjectUuid: "foreign", tabId: "board@foreign" } }); }
      return counts.contexts === options.failContext ? Promise.resolve({ ...structuredClone(context), document: { ...context.document, tabId: "other" } }) : Promise.resolve(structuredClone(context));
    },
    exactRead: (query): ReturnType<PcbNetMembershipEngine["exactRead"]> => {
      assert.ok(isRecord(query)); const kind = query["kind"]; assert.ok(kind === "pcb-source" || kind === "pcb-inventory"); calls.push(kind);
      if (calls.length === options.failRead) { return Promise.reject(new Error("native read failed")); }
      if (options.sourceDrift === true && calls.length === 3) { source(state, "other-line").body["netName"] = "CHANGED"; }
      if (options.metadataDrift === true && calls.length === 3) { state.objects.push(object("PREFERENCE", "routing-settings", { removeAntenna: false })); }
      if (calls.length === options.boardDrift) { source(state, "board-outline").body["path"] = ["CIRCLE", 1, 1, 100]; }
      if (calls.length === options.panelDrift) { const side = source(state, "PANELIZE").body["verticalSize"]; assert.ok(isRecord(side)); side["markDiameter"] = 41; }
      if (options.cycleDrift === true && calls.length === 4) { source(state, "other-line").body["netName"] = "CHANGED"; item(state, "lines", "other-line").net = "CHANGED"; }
      const sample = kind === "pcb-source" ? { ok: true, kind, documentType: 3, source: sourceString(state.objects) } : state.inventory;
      const payload = exact({ ...sample, ...(options.inventoryDrift === true && calls.length === 5 ? { unrelatedNativeMetadata: "changed" } : {}) });
      if (calls.length === options.corruptHash) { payload["source"] = "substitution"; }
      if (calls.length === options.changeKind) { payload["kind"] = "wrong"; }
      return Promise.resolve(payload);
    },
  } };
}
void test("coordinator uses source/inventory/source exact observations and records native authority", async () => {
  const current = runtime(), result = await readPcbNetMembership(current.engine, request, context, fingerprint());
  assert.deepEqual(current.calls, ["pcb-source", "pcb-inventory", "pcb-source", "pcb-source", "pcb-inventory", "pcb-source"]);
  assert.equal(result["authority"], "native-filtered-net-membership-not-connectivity-or-persistence-proof");
  assert.equal(result["implementationKind"], "native-task-equivalent");
  assert.equal(result["assurance"], "bounded-native-net-membership-not-connectivity-or-persistence-proof");
  assert.equal(result["publicApiSha256"], PCB_NET_MEMBERSHIP_API_SHA256);
  assert.equal(result["nativePcbEditorSha256"], PCB_NET_MEMBERSHIP_PCB_SHA256);
  assert.equal(result["liveValidation"], "not-yet-validated");
  assert.deepEqual(result["limitations"], PCB_NET_MEMBERSHIP_LIMITATIONS);
  assert.deepEqual(result["value"], derive(fixture()));
  const { read_consistency: consistency, ...sample } = result; assert.ok(isRecord(consistency)); assert.equal(consistency["snapshotSha256"], sha256Json(sample));
  assert.ok(isRecord(result["proof"])); assert.equal(result["proof"]["observationCycles"], 2); assert.equal(result["proof"]["samplesPerRead"], 2);
  assert.deepEqual(current.counts, { contexts: 14, gates: 8, statuses: 2 });
});
for (const option of [...Array.from({ length: 6 }, (_, index) => ({ failRead: index + 1 })), ...Array.from({ length: 6 }, (_, index) => ({ corruptHash: index + 1 })),
  { changeKind: 1 }, { sourceDrift: true }, { metadataDrift: true }, { boardDrift: 3 }, { boardDrift: 4 }, { panelDrift: 3 }, { panelDrift: 4 }, { cycleDrift: true }, { inventoryDrift: true }, { foreignProject: true }, { runtimeDrift: true }, ...Array.from({ length: 14 }, (_, index) => ({ failContext: index + 1 })),
  ...Array.from({ length: 8 }, (_, index) => ({ quarantine: index + 1 }))]) {
  void test(`coordinator refuses ${JSON.stringify(option)} without retry or a write path`, async () => {
    const current = runtime(option); await assert.rejects(readPcbNetMembership(current.engine, request, context, fingerprint()));
    assert.ok(current.calls.length <= 6); assert.deepEqual(current.calls, ["pcb-source", "pcb-inventory", "pcb-source", "pcb-source", "pcb-inventory", "pcb-source"].slice(0, current.calls.length));
  });
}
for (const document of [{ ...context.document, documentType: 4 }, { ...context.document, parentProjectUuid: "foreign" },
  { ...context.document, parentLibraryUuid: "library" }, { ...context.document, documentUuid: "foreign" }, { ...context.document, tabId: "foreign" }]) {
  void test(`coordinator rejects invalid ownership before read ${JSON.stringify(document)}`, async () => {
    const current = runtime(); await assert.rejects(readPcbNetMembership(current.engine, request, { ...context, document }, fingerprint()));
    assert.equal(current.calls.length, 0); assert.equal(current.counts.gates, 0);
  });
}
void test("coordinator rejects unsupported selectors and contradictory project aliases before read", async () => {
  const current = runtime(); await assert.rejects(readPcbNetMembership(current.engine, { ...request, arguments: { net: "SIGNAL" } }, context, fingerprint()));
  await assert.rejects(readPcbNetMembership(current.engine, request, { ...context, project: { ...context.project, projectUuid: "foreign" } }, fingerprint()));
  assert.equal(current.counts.gates, 0); assert.equal(current.calls.length, 0);
});
void test("coordinator rejects missing or substituted runtime proof before a gate or read", async () => {
  for (const invalid of [{}, { ...fingerprint(), toolCount: 0 }, { ...fingerprint(), installedBundles: {} }]) {
    const current = runtime();
    await assert.rejects(readPcbNetMembership(current.engine, request, context, invalid));
    assert.equal(current.counts.gates, 0); assert.equal(current.calls.length, 0);
  }
});

type StateObject = Record<string, () => unknown>;
interface InventoryApi { getAllPrimitiveId: () => string[]; getAll: () => StateObject[]; getAllPinsByPrimitiveId?: (id: string) => StateObject[]; }
type AsyncFunctionConstructor = new (...parameters: string[]) => (eda: unknown) => Promise<unknown>;
/* oxlint-disable typescript/no-unsafe-type-assertion, typescript/no-unsafe-member-access -- Execute the actual generated exact-reader program with synthetic SDK receivers, never a live bridge. */
const AsyncFunction = Object.getPrototypeOf(async (): Promise<void> => { await Promise.resolve(); }).constructor as AsyncFunctionConstructor;
/* oxlint-enable typescript/no-unsafe-type-assertion, typescript/no-unsafe-member-access */
function stateObject(values: Value): StateObject {
  return Object.fromEntries(Object.entries(values).map(([name, value]) => [`getState_${name}`, () => value]));
}
function physicalState(name: string, row: Item): StateObject {
  const base = { PrimitiveId: row.primitiveId, PrimitiveType: row.primitiveType, Net: row.net, PrimitiveLock: false };
  if (name === "pads") {
    return stateObject({ ...base, Layer: 1, PadNumber: row.padNumber, X: 0, Y: 0, Rotation: 0, Pad: ["ELLIPSE", 20, 20], SpecialPad: null,
      Hole: ["ROUND", 10], HoleOffsetX: 0, HoleOffsetY: 0, HoleRotation: 0, Metallization: true, PadType: 1,
      SolderMaskAndPasteMaskExpansion: { topSolderMask: 4, bottomSolderMask: 4, topPasteMask: 0, bottomPasteMask: 0 },
      HeatWelding: { connectionMethod: "Divergent", divergenceSpacing: 8, divergenceLineWidth: 10, divergenceAngle: 45 } });
  }
  if (name === "vias") {
    return stateObject({ ...base, X: 0, Y: 0, HoleDiameter: 10, Diameter: 20, ViaType: 0, DesignRuleBlindViaName: null,
      SolderMaskExpansion: { topSolderMask: 2, bottomSolderMask: 2 } });
  }
  return stateObject({ ...base, Layer: 1, StartX: 0, StartY: 0, EndX: 10, EndY: 10, LineWidth: 5,
    ...(name === "arcs" ? { ArcAngle: 90, InteractiveMode: 0 } : {}) });
}
function inventoryApis(state: Fixture): Record<string, InventoryApi> {
  const definitions = [["components", "Component"], ["pads", "Pad"], ["vias", "Via"], ["lines", "Line"], ["arcs", "Arc"],
    ["strings", "String"], ["attributes", "Attribute"], ["polylines", "Polyline"], ["regions", "Region"], ["pours", "Pour"],
    ["fills", "Fill"], ["dimensions", "Dimension"], ["images", "Image"], ["objects", "Object"], ["poured", "Poured"]] as const;
  return Object.fromEntries(definitions.map(([name, suffix]): [string, InventoryApi] => {
    const ids = state.inventory.families[name]?.primitiveIds ?? [];
    const objects = name === "components" ? ids.map((id) => stateObject({ PrimitiveId: id })) : ids.map((id) => physicalState(name, item(state, name, id)));
    const api: InventoryApi = { getAllPrimitiveId: () => [...ids], getAll: () => objects };
    if (name === "components") {
      api.getAllPinsByPrimitiveId = (id): StateObject[] => Object.values(getFamily(state, "pads").byPrimitiveId)
        .filter((row) => row.parentComponentPrimitiveId === id)
        .map((row) => stateObject({ PrimitiveId: row.primitiveId, PrimitiveType: "ComponentPad", ParentComponentPrimitiveId: id,
          PadNumber: row.padNumber, Net: row.net }));
    }
    return [`pcb_Primitive${suffix}`, api];
  }));
}
async function producedInventory(state: Fixture): Promise<Value> {
  const query = { kind: "pcb-inventory" } as const;
  const envelope = await new AsyncFunction("eda", buildExactReadCode(query))(inventoryApis(state));
  const payload = validateExactReadPayload(decodeExactReadEnvelope(envelope), query);
  assert.ok(isRecord(payload));
  return payload;
}
function record(value: unknown): Value { assert.ok(isRecord(value)); return value; }
function addEmptyPadAndPadlessOwner(state: Fixture): void {
  state.objects.push(object("PAD_NET", '["PAD_NET","component","2","empty"]', { padNet: "" }), object("COMPONENT", "padless", {}));
  const pads = getFamily(state, "pads"); pads.count += 1; pads.primitiveIds.push("componentempty"); pads.primitiveIds.sort();
  pads.byPrimitiveId["componentempty"] = { primitiveId: "componentempty", primitiveType: "Pad", net: null, padNumber: "2", parentComponentPrimitiveId: "component" };
  const components = getComponents(state); components.count += 1; components.primitiveIds.push("padless");
}
void test("actual exact inventory producer/transport/validator feeds complete membership and type readers", async () => {
  const state = fixture(); addEmptyPadAndPadlessOwner(state);
  const payload = await producedInventory(state);
  const components = record(record(payload["families"])["components"]);
  assert.deepEqual(components, { status: "adapter-enumerated", count: 2, primitiveIds: ["component", "padless"] });
  assert.equal(Object.hasOwn(components, "byPrimitiveId"), false);
  const correlation = record(payload["componentPadCorrelation"]);
  assert.deepEqual(record(correlation["byComponentPrimitiveId"])["padless"], []);
  const result = derivePcbNetMembership(snapshot(state.objects), payload, request, "board");
  assert.deepEqual(result, derive(fixture()));
  for (const [id, type] of [["line", "Line"], ["arc", "Arc"], ["via", "Via"], ["pad", "Pad"], ["componentlocal", "ComponentPad"], ["componentempty", "ComponentPad"]]) {
    assert.equal(derivePcbPrimitiveType(snapshot(state.objects), payload, { method: PCB_PRIMITIVE_TYPE_METHOD, arguments: { id } }, "board"), type);
  }
});
const producedDefects: [string, (payload: Value) => void][] = [
  ["missing component family", (payload) => { delete record(payload["families"])["components"]; }],
  ["missing component IDs", (payload) => { delete record(record(payload["families"])["components"])["primitiveIds"]; }],
  ["duplicate component IDs", (payload) => { record(record(payload["families"])["components"])["primitiveIds"] = ["component", "component"]; }],
  ["wrong component count", (payload) => { record(record(payload["families"])["components"])["count"] = 0; }],
  ["unproved component status", (payload) => { record(record(payload["families"])["components"])["status"] = "unknown"; }],
  ["fabricated component details", (payload) => { record(record(payload["families"])["components"])["byPrimitiveId"] = {}; }],
  ["missing padless owner correlation", (payload) => { delete record(record(payload["componentPadCorrelation"])["byComponentPrimitiveId"])["padless"]; }],
  ["component pad owner substitution", (payload) => { record(record(record(payload["componentPadCorrelation"])["byPrimitiveId"])["componentlocal"])["parentComponentPrimitiveId"] = "padless"; }],
];
for (const [label, corrupt] of producedDefects) {
  void test(`actual inventory integration refuses ${label}`, async () => {
    const state = fixture(); addEmptyPadAndPadlessOwner(state);
    const payload = await producedInventory(state); corrupt(payload);
    assert.throws(() => validateExactReadPayload(payload, { kind: "pcb-inventory" }));
    assert.throws(() => derivePcbNetMembership(snapshot(state.objects), payload, request, "board"));
    assert.throws(() => derivePcbPrimitiveType(snapshot(state.objects), payload, { method: PCB_PRIMITIVE_TYPE_METHOD, arguments: { id: "line" } }, "board"));
  });
}
for (const typeLookup of [false, true]) {
  for (const drift of [false, true]) {
    void test(`coordinator consumes actual produced inventory for type=${String(typeLookup)} drift=${String(drift)}`, async () => {
      const current = runtime(), state = fixture();
      const originalRead = current.engine.exactRead; let inventories = 0;
      current.engine.exactRead = async (query, expected): ReturnType<PcbNetMembershipEngine["exactRead"]> => {
        const sample = await originalRead(query, expected);
        assert.ok(isRecord(query));
        if (query["kind"] !== "pcb-inventory") { return sample; }
        inventories += 1;
        if (drift && inventories === 2) { getComponents(state).primitiveIds = ["different"]; }
        return exact(await producedInventory(state));
      };
      const result = typeLookup
        ? readPcbPrimitiveType(current.engine, { method: PCB_PRIMITIVE_TYPE_METHOD, arguments: { id: "componentlocal" } }, context, fingerprint())
        : readPcbNetMembership(current.engine, request, context, fingerprint());
      if (drift) { await assert.rejects(result, /complete component inventory is incomplete or ambiguous/u); } else {
        const observed = await result;
        assert.deepEqual(observed["value"], typeLookup ? "ComponentPad" : derive(state));
      }
      assert.equal(inventories, 2);
      assert.deepEqual(current.calls, ["pcb-source", "pcb-inventory", "pcb-source", "pcb-source", "pcb-inventory", "pcb-source"]);
    });
  }
}
