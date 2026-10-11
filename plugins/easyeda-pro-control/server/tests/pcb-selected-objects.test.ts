import assert from "node:assert/strict";
import { test } from "node:test";
import { PCB_SELECTED_OBJECTS_METHOD, derivePcbSelectedObjects, pcbSelectedObjectsRequestSchema, pcbSelectedObjectsResultSchema } from "../src/pcb-selected-objects.ts";
import { fixture, getFamily, object, snapshot, sourceRow } from "./pcb-selected-objects-fixture.ts";
import type { Fixture } from "./pcb-selected-objects-fixture.ts";

const request = { method: PCB_SELECTED_OBJECTS_METHOD, arguments: {} };
function derive(state: Fixture, ids: unknown = ["text", "component", "line", "arc", "via", "pad"]): ReturnType<typeof derivePcbSelectedObjects> {
  return derivePcbSelectedObjects(snapshot(state.objects), state.inventory, ids, request, "board");
}
void test("complete selected source DTOs preserve selection order, STRING and raw source fields without mutation", () => {
  const state = fixture(); const before = structuredClone(state), result = derive(state);
  assert.deepEqual(result.map((row) => [row.primitiveId, row.primitiveType]), [["text", "String"], ["component", "Component"], ["line", "Line"], ["arc", "Arc"], ["via", "Via"], ["pad", "Pad"]]);
  assert.deepEqual(result[0]?.sourceRecord, sourceRow(state, "text"));
  assert.deepEqual(result[1]?.sourceAttributes, [sourceRow(state, "name")]);
  assert.deepEqual(result[2]?.sourceAttributes, []);
  assert.deepEqual(state, before);
  assert.equal(result[0]?.sourceRecord.body["y"], -56);
  assert.equal(result[0]?.sourceRecord.body["specialColor"], null);
});
void test("empty, reverse and singleton selections preserve literal order and never infer absence", () => {
  const state = fixture();
  assert.deepEqual(derive(state, []), []);
  assert.deepEqual(derive(state, ["component", "text"]).map((row) => row.primitiveId), ["component", "text"]);
  assert.equal(derive(state, ["unassigned"])[0]?.sourceRecord.body["netName"], "");
});
for (const id of ["missing", "componentlocal", "local", "name", "fill", "outline", "origin", '["PAD_NET","component","1","local"]']) {
  void test(`selected source refuses unsupported/inherited identity ${id} without partial output`, () => {
    assert.throws(() => derive(fixture(), ["text", id]), /supported root source object|generated or inherited/u);
  });
}
for (const ids of [null, {}, ["text", "text"], [""], ["line\n"], ["x".repeat(257)], Array.from({ length: 257 }, (_, index) => `id${String(index)}`)]) {
  void test(`selected source refuses malformed ordered IDs ${JSON.stringify(ids).slice(0, 60)}`, () => { assert.throws(() => derive(fixture(), ids)); });
}
for (const name of ["lines", "arcs", "vias", "pads", "components", "strings"]) {
  for (const defect of ["missing", "extra", "duplicate", "count", "family-absent"]) {
    void test(`selected owning-family proof refuses ${name} ${defect}`, () => {
      const state = fixture(); const family = getFamily(state, name);
      if (defect === "missing") { family.count -= 1; family.primitiveIds.pop(); }
      if (defect === "extra") { family.count += 1; family.primitiveIds.push("extra"); }
      if (defect === "duplicate") { family.count += 1; family.primitiveIds.push(family.primitiveIds[0] ?? "extra"); }
      if (defect === "count") { family.count += 1; }
      if (defect === "family-absent") { state.inventory.families = Object.fromEntries(Object.entries(state.inventory.families).filter(([key]) => key !== name)); }
      assert.throws(() => derive(state));
    });
  }
}
const defects: [string, (state: Fixture) => void][] = [
  ["cross-family collision", (state) => { const family = getFamily(state, "objects"); family.count = 1; family.primitiveIds.push("text"); }],
  ["unselected cross-family collision", (state) => { const family = getFamily(state, "images"); family.count = 1; family.primitiveIds.push("fill"); }],
  ["extra unknown family", (state) => { state.inventory.families["future"] = { status: "adapter-enumerated", count: 0, primitiveIds: [] }; }],
  ["missing unselected Text", (state) => { state.objects = state.objects.filter((row) => row.id !== "peer-text"); }],
  ["inherited Text source", (state) => { sourceRow(state, "text").body["parentId"] = "component"; }],
  ["grouped Text source", (state) => { sourceRow(state, "text").body["groupId"] = 1; }],
  ["grouped peer Text", (state) => { sourceRow(state, "peer-text").body["groupID"] = 1; }],
  ["inherited Component source", (state) => { sourceRow(state, "component").body["parentId"] = "owner"; }],
  ["partition", (state) => { sourceRow(state, "text").body["partitionId"] = "partition"; }],
  ["source collision", (state) => { state.objects.push(object("STRING", "line", { text: "collision" })); }],
  ["unresolved source attribute", (state) => { sourceRow(state, "name").body["parentId"] = "missing"; }],
  ["malformed attribute owner", (state) => { sourceRow(state, "name").body["parentId"] = null; }],
  ["wrong non-target line net", (state) => { sourceRow(state, "unassigned").body["netName"] = "new"; }],
  ["component pad owner dropout", (state) => { state.inventory.componentPadCorrelation.byComponentPrimitiveId["component"] = []; }],
  ["unknown source family", (state) => { state.objects.push(object("FUTURE", "future", {})); }],
  ["inherited Line without checkpoint", (state) => { state.objects.push(object("ATTR", "footprint", { parentId: "component", key: "Footprint", value: "library" })); }],
];
for (const [name, mutate] of defects) {
  void test(`selected source refuses ${name}`, () => { const state = fixture(); mutate(state); assert.throws(() => derive(state)); });
}
void test("only selected owning families demand complete source parity; unrelated inventory collisions still refuse", () => {
  const state = fixture(); sourceRow(state, "unassigned").body["netName"] = "other";
  assert.equal(derive(state, ["text"]).length, 1);
  assert.throws(() => derive(state, ["line"]));
});
void test("selected source retains every source-backed ATTR in stable identity order, not just public property names", () => {
  const state = fixture(); state.objects.push(object("ATTR", "a-hidden", { parentId: "component", key: "Private field", value: { nested: [1, null, true] }, valueVisible: false }));
  const attrs = derive(state, ["component"])[0]?.sourceAttributes;
  assert.deepEqual(attrs?.map((row) => row.id), ["a-hidden", "name"]);
  assert.deepEqual(attrs?.[0]?.body["value"], { nested: [1, null, true] });
});
void test("selected source verifies exact document hash, owner, version and bounded result", () => {
  const state = fixture(); const source = snapshot(state.objects);
  assert.throws(() => derivePcbSelectedObjects({ ...source, sha256: "0".repeat(64) }, state.inventory, ["text"], request, "board"));
  assert.throws(() => derivePcbSelectedObjects(source, state.inventory, ["text"], request, "foreign"));
  sourceRow(state, "text").body["text"] = "x".repeat(2_097_152);
  assert.throws(() => derive(state, ["text"]), /byte bound/u);
});
for (const invalid of [undefined, {}, { ...request, code: "execute" }, { ...request, method: "eda.pcb_SelectControl.getSelectedPrimitives" },
  { ...request, arguments: { ids: ["text"] } }, { ...request, arguments: { all: true } }]) {
  void test("selected source input rejects caller code/selectors and legacy raw method", () => { assert.equal(pcbSelectedObjectsRequestSchema.safeParse(invalid).success, false); });
}
void test("DTO schema refuses duplicate/substituted identities and hidden extra output fields", () => {
  const [row] = derive(fixture(), ["text"]); assert.ok(row);
  for (const invalid of [[row, row], [{ ...row, primitiveId: "other" }], [{ ...row, publicInstance: true }]]) {
    assert.equal(pcbSelectedObjectsResultSchema.safeParse(invalid).success, false);
  }
});

void test("derived pour-piece collision outside ordinary family indexes refuses the entire read", () => {
  const state = fixture();
  state.inventory.pouredFillPieceCount = 1;
  state.inventory.pouredCorrelation = { status: "derived-subset", count: 1, pourPrimitiveIds: ["pour"], byPourPrimitiveId: {
    pour: { primitiveId: "pour", primitiveType: "Poured", pourPrimitiveId: "pour", pourFills: [{ id: "text", path: [0, 0, 10, 10], lineWidth: 1, fill: true }] },
  } };
  assert.throws(() => derive(state, ["text"]));
});
for (const id of ["outlinel0", "outlinea999", "componentfootprinttext", "rat123"]) {
  void test(`source-backed selected STRING cannot impersonate generated identity ${id}`, () => {
    const state = fixture(); state.objects.push(object("STRING", id, { text: "collision" }));
    const strings = getFamily(state, "strings"); strings.count += 1; strings.primitiveIds.push(id);
    assert.throws(() => derive(state, [id]), /generated or inherited/u);
  });
}
