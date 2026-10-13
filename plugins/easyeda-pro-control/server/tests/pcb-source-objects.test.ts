import assert from "node:assert/strict";
import { test } from "node:test";
import { PCB_SOURCE_OBJECTS_METHOD, PCB_SOURCE_OBJECT_METHOD, derivePcbSourceObjects, pcbSourceObjectIds, pcbSourceObjectsRequestSchema } from "../src/pcb-source-objects.ts";
import { fixture, getFamily, object, snapshot, sourceRow } from "./pcb-selected-objects-fixture.ts";
import type { Fixture } from "./pcb-selected-objects-fixture.ts";

const allIds = ["text", "component", "line", "arc", "via", "pad"];
function request(ids: unknown = allIds): unknown { return { method: PCB_SOURCE_OBJECTS_METHOD, arguments: { ids } }; }
function derive(state: Fixture, ids: unknown = allIds): ReturnType<typeof derivePcbSourceObjects> {
  return derivePcbSourceObjects(snapshot(state.objects), state.inventory, request(ids), "board");
}
void test("explicit source IDs retain all six families, caller order, complete raw fields and ATTR without mutation", () => {
  const state = fixture(); const before = structuredClone(state), result = derive(state);
  assert.deepEqual(result.map((row) => [row.primitiveId, row.primitiveType]), [["text", "String"], ["component", "Component"], ["line", "Line"], ["arc", "Arc"], ["via", "Via"], ["pad", "Pad"]]);
  for (const row of result) { assert.deepEqual(row.sourceRecord, sourceRow(state, row.primitiveId)); }
  assert.deepEqual(result[1]?.sourceAttributes, [sourceRow(state, "name")]);
  assert.equal(result[0]?.sourceRecord.body["specialColor"], null); assert.equal(result[0]?.sourceRecord.body["y"], -56);
  assert.deepEqual(state, before);
  assert.deepEqual(derive(state, allIds.toReversed()).map((row) => row.primitiveId), allIds.toReversed());
  assert.deepEqual(derivePcbSourceObjects(snapshot(state.objects), state.inventory,
    { method: PCB_SOURCE_OBJECT_METHOD, arguments: { id: "text" } }, "board"), [result[0]]);
});
for (const ids of [null, {}, [], ["text", "text"], [""], ["line\n"], ["x".repeat(257)], Array.from({ length: 257 }, (_, index) => `id${String(index)}`)]) {
  void test(`explicit source request rejects malformed or ambiguous IDs ${JSON.stringify(ids).slice(0, 70)}`, () => {
    assert.equal(pcbSourceObjectsRequestSchema.safeParse(request(ids)).success, false);
    assert.throws(() => derive(fixture(), ids));
  });
}
void test("explicit request bounds do not coerce, trim, deduplicate or reorder", () => {
  const ids = Array.from({ length: 256 }, (_, index) => `literal ${String(index)} `);
  assert.deepEqual(pcbSourceObjectIds(request(ids)), ids);
  for (const input of [{}, { method: PCB_SOURCE_OBJECT_METHOD, arguments: {} }, { method: PCB_SOURCE_OBJECT_METHOD, arguments: { id: ["text"] } },
    { method: PCB_SOURCE_OBJECT_METHOD, arguments: { id: "text", all: true } }, { method: PCB_SOURCE_OBJECTS_METHOD, arguments: { ids: ["text"], code: "caller()" } },
    { method: PCB_SOURCE_OBJECT_METHOD, arguments: { id: "text" }, code: "caller()" }]) { assert.equal(pcbSourceObjectsRequestSchema.safeParse(input).success, false); }
});
for (const id of ["missing", "componentlocal", "local", "name", "fill", "outline", "origin", '["PAD_NET","component","1","local"]']) {
  void test(`explicit source refuses ${id} without returning an earlier valid DTO`, () => {
    assert.throws(() => derive(fixture(), ["text", id]), /supported root source object|generated or inherited/u);
  });
}
for (const name of ["lines", "arcs", "vias", "pads", "components", "strings"]) {
  for (const defect of ["missing", "extra", "duplicate", "count"]) {
    void test(`explicit owning-family proof refuses ${name} ${defect}`, () => {
      const state = fixture(); const family = getFamily(state, name);
      if (defect === "missing") { family.count -= 1; family.primitiveIds.pop(); }
      if (defect === "extra") { family.count += 1; family.primitiveIds.push("extra"); }
      if (defect === "duplicate") { family.count += 1; family.primitiveIds.push(family.primitiveIds[0] ?? "extra"); }
      if (defect === "count") { family.count += 1; }
      assert.throws(() => derive(state));
    });
  }
}
void test("explicit source preserves custom direct ATTR and refuses unowned or generated identities", () => {
  const state = fixture(); state.objects.push(object("ATTR", "custom", { parentId: "text", value: { nested: [null, true] } }));
  assert.deepEqual(derive(state, ["text"])[0]?.sourceAttributes, [sourceRow(state, "custom")]);
  sourceRow(state, "custom").body["parentId"] = "missing"; assert.throws(() => derive(state, ["text"]));
  for (const id of ["outlinel0", "outlinea999", "componentchild", "rat123"]) {
    const changed = fixture(); changed.objects.push(object("STRING", id, {}));
    const strings = getFamily(changed, "strings"); strings.count += 1; strings.primitiveIds.push(id);
    assert.throws(() => derive(changed, [id]), /generated or inherited/u);
  }
});
void test("explicit source rejects stale commitments, wrong owner, grouped source and unselected inventory collisions", () => {
  const state = fixture(); const source = snapshot(state.objects);
  assert.throws(() => derivePcbSourceObjects({ ...source, sha256: "0".repeat(64) }, state.inventory, request(), "board"));
  assert.throws(() => derivePcbSourceObjects(source, state.inventory, request(), "foreign"));
  sourceRow(state, "text").body["groupId"] = 1; assert.throws(() => derive(state, ["text"]));
  const collision = fixture(), images = getFamily(collision, "images"); images.count = 1; images.primitiveIds.push("fill");
  assert.throws(() => derive(collision, ["text"]));
  const huge = fixture(); sourceRow(huge, "text").body["text"] = "x".repeat(2_097_152);
  assert.throws(() => derive(huge, ["text"]), /byte bound/u);
});
