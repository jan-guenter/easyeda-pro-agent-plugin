import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Json } from "../src/core.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "../src/document-source.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";
import { SCHEMATIC_NATIVE_PROFILE, schematicNativeSnapshotHash } from "../src/schematic-native-adapter.ts";
import type { SchematicNativeComponent, SchematicNativeSnapshot } from "../src/schematic-native-adapter.ts";
import { expectedSchematicLayout, schematicLayoutBatchSchema, verifySchematicLayoutEffect, verifySchematicLayoutPersistence } from "../src/schematic-layout-batch.ts";
import type { SchematicLayoutEvidence } from "../src/schematic-layout-batch.ts";
import { needsSchematicLayoutConstructorWitness, schematicRetainedWireOrders } from "../src/schematic-retained-wire-order.ts";
import { verifySchematicStoragePersistence } from "../src/schematic-storage-persistence.ts";

function source(objects: readonly NativeSourceObject[]): NativeSourceSnapshot {
  const value = { schema: "easyeda-pro-control.document-source.v1" as const, document: { docType: "SCH_PAGE", uuid: "page", editVersion: "3.2.149.88089769" },
    objects: structuredClone(objects).toSorted((a, b) => a.id.localeCompare(b.id)) };
  return { ...value, sha256: sha256Json(value) };
}
function encode(value: NativeSourceSnapshot): string {
  return `{"type":"DOCHEAD"}||${JSON.stringify(value.document)}|\n${value.objects.map((row) => `${JSON.stringify({ id: row.id, type: row.type })}||${JSON.stringify(row.body)}|\n`).join("")}`;
}
const attrs = (parentId: string, order = 0): NativeSourceObject[] => [
  { id: `${parentId}-relevance`, type: "ATTR", body: { parentId, key: "Relevance", value: "[]", x: null, y: null, keyVisible: null, valueVisible: null, zIndex: order } },
  { id: `${parentId}-net`, type: "ATTR", body: { parentId, key: "NET", value: "N", x: 5, y: 5, valueVisible: true, zIndex: order + 1 } },
];
function fixture(endpointOnly = false): { source: NativeSourceSnapshot; native: SchematicNativeSnapshot } {
  const components: SchematicNativeComponent[] = [["port", 100, 100], ["part-a", 10, 0], ["part-b", 0, 10]].map(([name, x, y], index) => ({
    id: String(name), kind: index === 0 ? "netport" : "part", locked: false,
    body: { partId: "symbol", x: Number(x), y: Number(y), rotation: 0, isMirror: false, zIndex: index + 1, locked: false, attrs: {} }, attributes: [],
    pins: [{ id: `${String(name)}-pin`, body: { x: Number(x), y: Number(y), rotation: 0, length: 10 }, attributes: [], net: "N", noConnect: null }],
  }));
  const rows: NativeSourceObject[] = [
    ...components.map((model) => ({ id: model.id, type: "COMPONENT", body: model.body })),
    { id: "destination", type: "WIRE", body: { zIndex: 10, locked: false } }, ...attrs("destination", endpointOnly ? 2 : 0),
    { id: "line-a", type: "LINE", body: { lineGroup: "destination", startX: 0, startY: 0, endX: 10, endY: 0 } },
    ...endpointOnly ? [] : [{ id: "line-b", type: "LINE", body: { lineGroup: "destination", startX: 0, startY: 0, endX: 0, endY: 10 } }],
    { id: "stub", type: "WIRE", body: { zIndex: 11, locked: false } }, ...attrs("stub"),
    { id: "stub-line", type: "LINE", body: { lineGroup: "stub", startX: 100, startY: 100, endX: 105, endY: 100 } },
    { id: "unrelated", type: "TEXT", body: { x: 200, y: 200, value: "Preserved", zIndex: 12 } },
  ];
  const snapshot = source(rows);
  return { source: snapshot, native: { profile: SCHEMATIC_NATIVE_PROFILE, document: { documentUuid: "page", tabId: "page@project" }, source: encode(snapshot), components } };
}
const operation = schematicLayoutBatchSchema.parse({ id: "attachment", action: "sch.layout.batch", operations: [
  { id: "move", action: "sch.component.translate", target: { primitiveId: "port" }, x: 0, y: 0 },
  { id: "stub", action: "sch.wire.delete", target: { primitiveId: "stub" } },
  { id: "name", action: "sch.attribute.display", target: { primitiveId: "destination-net" }, patch: { valueVisible: false } },
] });
function altered(snapshot: NativeSourceSnapshot, id: string, patch: Record<string, unknown>): NativeSourceSnapshot {
  return source(snapshot.objects.map((row) => row.id === id ? { ...row, body: { ...row.body, ...patch } } : row));
}
function checkpoint(snapshot: NativeSourceSnapshot): NativeHistorySnapshot {
  const semantic = { uuid: "page", docType: "SCH_PAGE", metadata: snapshot.document, records: snapshot.objects };
  const document = { ...semantic, records: snapshot.objects.map((row) => ({ ...row, ticket: 1, client: null })), semanticSha256: sha256Json(semantic) };
  const documents = [document];
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "a".repeat(64), projectOwnerUuid: "b".repeat(32), branchUuid: "c".repeat(32), headHistoryUuid: "d".repeat(32),
    checkpointSha256: sha256Json(documents), historyRowCount: 1, chunkCount: 1, plaintextBytes: 100, documents,
    semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
}

void test("retained netport attachment derives both wire child orders from the typed endpoint graph", () => {
  const before = fixture(), raw = JSON.stringify(before), result = expectedSchematicLayout(operation, before.source, before.native, {});
  assert.deepEqual(result.retainedWireOrders, [{ id: "destination", componentId: "port", removedStubId: "stub", relevanceId: "destination-relevance", netId: "destination-net",
    lines: 2, junctions: 1, danglingDots: 0, beforeRelevanceOrder: 0, relevanceOrder: 3, beforeNetOrder: 1, netOrder: 4 }]);
  assert.equal(result.expected.objects.find((row) => row.id === "destination-relevance")?.body["zIndex"], 3);
  assert.equal(result.expected.objects.find((row) => row.id === "destination-net")?.body["zIndex"], 4);
  assert.equal(verifySchematicLayoutEffect(operation, before.source, result.expected, before.native, result.native, {}).removed.length, 4);
  assert.deepEqual(result.createdIds, {});
  assert.equal(JSON.stringify(before), raw);
  const lockedSource = altered(before.source, "destination", { locked: true });
  const attachmentOnly = { ...operation, operations: operation.operations.filter((step) => step.action !== "sch.attribute.display") };
  assert.throws(() => expectedSchematicLayout(attachmentOnly, lockedSource, { ...before.native, source: encode(lockedSource) }, {}), /locked/u);
  for (const [id, patch] of [["destination-net", { zIndex: 5 }], ["destination-relevance", { zIndex: 2 }], ["line-a", { endX: 11 }],
    ["destination-net", { value: "OTHER" }], ["unrelated", { zIndex: 13 }], ["unrelated", { value: "changed" }]] as const) {
    const bad = altered(result.expected, id, patch);
    assert.throws(() => verifySchematicLayoutEffect(operation, before.source, bad, before.native, { ...result.native, source: encode(bad) }, {}));
  }
});

void test("removing the last dangling dot does not reset a retained group's previous category order", () => {
  const before = fixture(true), result = expectedSchematicLayout(operation, before.source, before.native, {});
  assert.deepEqual(result.retainedWireOrders, []);
  assert.equal(result.expected.objects.find((row) => row.id === "destination-relevance")?.body["zIndex"], 2);
  assert.equal(result.expected.objects.find((row) => row.id === "destination-net")?.body["zIndex"], 3);
});

void test("retained order candidate proof rejects changed geometry, hidden fields, unrequested attributes and ambiguous endpoints", () => {
  const before = fixture(), expected = expectedSchematicLayout(operation, before.source, before.native, {});
  const unprojected = source(expected.expected.objects.map((row) => {
    if (row.id === "destination-relevance") { return { ...row, body: { ...row.body, zIndex: 0 } }; }
    return row.id === "destination-net" ? { ...row, body: { ...row.body, zIndex: 1 } } : row;
  }));
  const run = (snapshot: NativeSourceSnapshot, native = expected.native): unknown => schematicRetainedWireOrders(operation, before.source, new Map(snapshot.objects.map((row) => [row.id, row])), before.native, native);
  for (const [id, patch] of [["line-a", { endX: 11 }], ["destination", { zIndex: 9 }], ["destination-net", { fontSize: 15 }],
    ["destination-relevance", { valueVisible: true }], ["destination-relevance", { zIndex: 9 }], ["destination-net", { zIndex: 9 }]] as const) {
    assert.throws(() => run(altered(unprojected, id, patch)));
  }
  assert.throws(() => run(source([...unprojected.objects, { id: "extra", type: "ATTR", body: { parentId: "destination", key: "Extra", value: "", zIndex: 2 } }])));
  const near = structuredClone(expected.native), pin = near.components.find((model) => model.id === "part-b")?.pins[0]; assert.ok(pin); pin.body["x"] = 0.1;
  assert.throws(() => run(unprojected, near), /near-coincident/u);
  const noStub = { ...operation, operations: operation.operations.filter((step) => step.action !== "sch.wire.delete") };
  const records = new Map(unprojected.objects.map((row) => [row.id, row]));
  assert.deepEqual(schematicRetainedWireOrders(noStub, before.source, records, before.native, expected.native), []);
});

void test("retained wire durable orders must remain original or exactly match the independently derived model", () => {
  const before = fixture(), expected = expectedSchematicLayout(operation, before.source, before.native, {});
  const stored = altered(altered(expected.expected, "destination-relevance", { zIndex: 0 }), "destination-net", { zIndex: 1 });
  const input = { before: checkpoint(before.source), after: checkpoint(stored), expectedBefore: before.source, expectedAfter: expected.expected, beforeNative: before.native, afterNative: expected.native };
  const raw = JSON.stringify(input);
  assert.equal(verifySchematicStoragePersistence(input)["ok"], true);
  assert.equal(verifySchematicStoragePersistence({ ...input, after: checkpoint(expected.expected) })["ok"], true);
  assert.equal(JSON.stringify(input), raw);
  for (const [id, patch] of [["destination-relevance", { zIndex: 1 }], ["destination-net", { zIndex: 2 }], ["destination-net", { value: "OTHER" }],
    ["line-a", { endX: 11 }], ["unrelated", { value: "changed" }]] as const) {
    assert.throws(() => verifySchematicStoragePersistence({ ...input, after: checkpoint(altered(stored, id, patch)) }));
  }
});

function fullImportFixture(junction = false): { source: NativeSourceSnapshot; native: SchematicNativeSnapshot } {
  const original = fixture(!junction);
  const components = original.native.components.filter((model) => model.id !== "port");
  if (junction) {
    components.push({ id: "junction-part", kind: "part", locked: false,
      body: { partId: "symbol", x: 0, y: 0, rotation: 0, isMirror: false, zIndex: 1, locked: false, attrs: {} }, attributes: [],
      pins: [{ id: "junction-part-pin", body: { x: 0, y: 0, rotation: 0, length: 10 }, attributes: [], net: "N", noConnect: null }] });
  }
  const records = original.source.objects.filter((row) => !["port", "stub", "stub-line", "stub-net", "stub-relevance"].includes(row.id));
  if (junction) { const model = components.at(-1); assert.ok(model); records.push({ id: model.id, type: "COMPONENT", body: model.body }); }
  const snapshot = altered(altered(source(records), "destination-relevance", { zIndex: 1 }), "destination-net", { zIndex: 2 });
  return { source: snapshot, native: { ...original.native, source: encode(snapshot), components } };
}
const fullImportOperation = schematicLayoutBatchSchema.parse({ id: "circuit-redraw", action: "sch.layout.batch", operations: [
  { id: "wire", action: "sch.wire.create", properties: { line: [300, 300, 310, 300], color: null, lineWidth: 1, lineType: 0 } },
  { id: "label", action: "sch.net-label.create", properties: { x: 305, y: 300, net: "N" } },
] });
const fullImportIds = { wire: "a".repeat(16), "wire:relevance": "b".repeat(16), "wire:segment:0": "c".repeat(16), label: "d".repeat(16) };

void test("full source import derives unchanged retained dangling and junction category refresh, including exact requested display", () => {
  for (const junction of [false, true]) {
    const before = fullImportFixture(junction), raw = JSON.stringify(before);
    const request = schematicLayoutBatchSchema.parse({ ...fullImportOperation, operations: [...fullImportOperation.operations,
      { id: "display", action: "sch.attribute.display", target: { primitiveId: "destination-net" }, patch: { x: 15, y: -5, fontSize: 9, valueVisible: false } }] });
    const result = expectedSchematicLayout(request, before.source, before.native, fullImportIds);
    assert.deepEqual(result.retainedWireOrders, [{ profile: "full-import-unchanged-retained-wire", id: "destination", relevanceId: "destination-relevance", netId: "destination-net",
      lines: junction ? 2 : 1, junctions: junction ? 1 : 0, danglingDots: junction ? 0 : 1,
      beforeRelevanceOrder: 1, relevanceOrder: junction ? 3 : 2, beforeNetOrder: 2, netOrder: junction ? 4 : 3 }]);
    assert.equal(verifySchematicLayoutEffect(request, before.source, result.expected, before.native, result.native, fullImportIds).removed.length, 0);
    assert.deepEqual(result.native.components, before.native.components);
    assert.equal(JSON.stringify(before), raw);
  }
});

void test("full-import effect rejects wrong category order, geometry, extra attributes and foreign net", () => {
  const before = fullImportFixture(), result = expectedSchematicLayout(fullImportOperation, before.source, before.native, fullImportIds);
  for (const [id, patch] of [["destination-relevance", { zIndex: 3 }], ["destination-net", { zIndex: 4 }], ["line-a", { endX: 11 }],
    ["destination-relevance", { valueVisible: true }], ["destination-net", { value: "FOREIGN" }], ["destination-net", { fontSize: 15 }]] as const) {
    const changed = altered(result.expected, id, patch);
    assert.throws(() => verifySchematicLayoutEffect(fullImportOperation, before.source, changed, before.native, { ...result.native, source: encode(changed) }, fullImportIds));
  }
  const extra = source([...result.expected.objects, { id: "extra", type: "ATTR", body: { parentId: "destination", key: "Extra", value: "", zIndex: 4 } }]);
  assert.throws(() => verifySchematicLayoutEffect(fullImportOperation, before.source, extra, before.native, { ...result.native, source: encode(extra) }, fullImportIds));
});

void test("full-import preserves exact inactive NC records but refuses active, malformed, contradictory and foreign endpoints", () => {
  const before = fullImportFixture(), pin = before.native.components.find((model) => model.id === "part-a")?.pins[0]; assert.ok(pin);
  const marker = { id: "inactive-nc", type: "ATTR", body: { parentId: pin.id, key: "NO_CONNECT", value: "no", x: 10, y: 0, zIndex: 3 } };
  pin.noConnect = { id: marker.id, value: "no", body: structuredClone(marker.body) };
  before.source = source([...before.source.objects, marker]); before.native.source = encode(before.source);
  const raw = JSON.stringify(before), result = expectedSchematicLayout(fullImportOperation, before.source, before.native, fullImportIds);
  assert.equal(result.retainedWireOrders.length, 1);
  assert.deepEqual(result.native.components, before.native.components);
  assert.deepEqual(result.expected.objects.find((row) => row.id === marker.id), marker);
  assert.equal(verifySchematicLayoutEffect(fullImportOperation, before.source, result.expected, before.native, result.native, fullImportIds).removed.length, 0);
  assert.equal(verifySchematicLayoutPersistence(fullImportOperation, { before: checkpoint(before.source), after: checkpoint(result.expected),
    expectedBefore: before.source, expectedAfter: result.expected, beforeNative: before.native, afterNative: result.native }, fullImportIds,
  { history: checkpoint(before.source), templates: {} })["ok"], true);
  assert.equal(JSON.stringify(before), raw);
  const unprojected = altered(altered(result.expected, "destination-relevance", { zIndex: 1 }), "destination-net", { zIndex: 2 });
  const run = (snapshot: NativeSourceSnapshot, native: SchematicNativeSnapshot): unknown => schematicRetainedWireOrders(fullImportOperation,
    before.source, new Map(snapshot.objects.map((row) => [row.id, row])), before.native, native);
  for (const value of ["yes", "NO", "", null, false, 0]) {
    const native = structuredClone(result.native);
    const current = native.components.find((model) => model.id === "part-a")?.pins[0];
    assert.ok(current?.noConnect); current.noConnect.value = value;
    assert.throws(() => run(unprojected, native), /foreign-net or NC/u);
  }
  for (const patch of [{ value: "yes" }, { key: "OTHER" }, { parentId: "other-pin" }, { zIndex: 4 }]) {
    const native = structuredClone(result.native);
    const current = native.components.find((model) => model.id === "part-a")?.pins[0];
    assert.ok(current?.noConnect); Object.assign(current.noConnect.body, patch);
    assert.throws(() => run(unprojected, native), /foreign-net or NC/u);
  }
  for (const snapshot of [source(unprojected.objects.filter((row) => row.id !== marker.id)),
    altered(unprojected, marker.id, { value: "yes" }), source([...unprojected.objects, { ...marker, id: "duplicate-nc" }])]) {
    assert.throws(() => run(snapshot, result.native), /foreign-net or NC/u);
  }
  const foreign = structuredClone(result.native), foreignPin = foreign.components.find((model) => model.id === "part-a")?.pins[0];
  assert.ok(foreignPin); foreignPin.net = "FOREIGN"; assert.throws(() => run(unprojected, foreign), /foreign-net or NC/u);
  for (const patch of [{ id: "changed-nc-id" }, { value: "yes" }, { body: { ...marker.body, zIndex: 4 } }]) {
    const native = structuredClone(result.native);
    const current = native.components.find((model) => model.id === "part-a")?.pins[0];
    assert.ok(current?.noConnect); Object.assign(current.noConnect, patch);
    assert.throws(() => verifySchematicLayoutEffect(fullImportOperation, before.source, result.expected, before.native, native, fullImportIds));
  }
});

void test("full-import candidates reject altered roots/lines/children and foreign pins without borrowing observed differences", () => {
  const before = fullImportFixture(), result = expectedSchematicLayout(fullImportOperation, before.source, before.native, fullImportIds);
  const raw = altered(altered(result.expected, "destination-relevance", { zIndex: 1 }), "destination-net", { zIndex: 2 });
  const run = (snapshot: NativeSourceSnapshot, native = result.native): unknown => schematicRetainedWireOrders(fullImportOperation, before.source,
    new Map(snapshot.objects.map((row) => [row.id, row])), before.native, native);
  for (const [id, patch] of [["destination", { zIndex: 20 }], ["line-a", { endX: 11 }], ["destination-net", { value: "FOREIGN" }],
    ["destination-relevance", { zIndex: 9 }]] as const) { assert.throws(() => run(altered(raw, id, patch))); }
  assert.throws(() => run(source([...raw.objects, { id: "extra", type: "ATTR", body: { parentId: "destination", key: "Extra", value: "", zIndex: 4 } }])));
  const foreign = structuredClone(result.native), pin = foreign.components.find((model) => model.id === "part-a")?.pins[0]; assert.ok(pin); pin.net = "FOREIGN";
  assert.throws(() => run(raw, foreign), /foreign-net/u);
  const shared = source([...raw.objects, { id: "other-wire", type: "WIRE", body: { zIndex: 50 } },
    { id: "other-line", type: "LINE", body: { lineGroup: "other-wire", startX: 0, startY: 0, endX: -10, endY: 0 } }]);
  assert.throws(() => run(shared), /shares an endpoint/u);
});

void test("full-import storage admits only exact original-source materialization from null before derived recategorization", () => {
  const before = fullImportFixture(), result = expectedSchematicLayout(fullImportOperation, before.source, before.native, fullImportIds);
  const nullOrders = altered(altered(before.source, "destination-relevance", { zIndex: null }), "destination-net", { zIndex: null });
  const materialized = altered(altered(result.expected, "destination-relevance", { zIndex: 1 }), "destination-net", { zIndex: 2 });
  const history = checkpoint(nullOrders), input = { before: history, after: checkpoint(materialized), expectedBefore: before.source,
    expectedAfter: result.expected, beforeNative: before.native, afterNative: result.native };
  const raw = JSON.stringify(input);
  assert.throws(() => verifySchematicStoragePersistence(input), /neither retained/u);
  const proof = verifySchematicLayoutPersistence(fullImportOperation, input, fullImportIds, { history, templates: {} });
  assert.equal(proof["ok"], true);
  assert.ok(Array.isArray(proof["retainedWireInitialOrderMaterializations"]));
  assert.equal(proof["retainedWireInitialOrderMaterializations"].length, 2);
  assert.equal(JSON.stringify(input), raw);
  for (const saved of [nullOrders, before.source, result.expected]) {
    const retained = saved.objects.filter((row) => ["destination-net", "destination-relevance"].includes(row.id));
    const rows = result.expected.objects.map((row) => retained.find((old) => old.id === row.id) ?? row);
    const after = checkpoint(source(rows));
    assert.equal(verifySchematicLayoutPersistence(fullImportOperation, { ...input, after }, fullImportIds, { history, templates: {} })["ok"], true);
  }
  for (const [id, patch] of [["destination-relevance", { zIndex: 4 }], ["destination-net", { zIndex: 4 }],
    ["destination-net", { value: "FOREIGN" }], ["destination-net", { valueVisible: false }], ["line-a", { endX: 11 }]] as const) {
    assert.throws(() => verifySchematicLayoutPersistence(fullImportOperation, { ...input, after: checkpoint(altered(materialized, id, patch)) }, fullImportIds, { history, templates: {} }));
  }
  const nonNullHistory = checkpoint(altered(nullOrders, "destination-relevance", { zIndex: 0 }));
  assert.throws(() => verifySchematicLayoutPersistence(fullImportOperation, { ...input, before: nonNullHistory }, fullImportIds, { history: nonNullHistory, templates: {} }), /neither retained/u);
});

function multipleNetFixture(): ReturnType<typeof fullImportFixture> {
  const before = fullImportFixture();
  // IDs deliberately disagree with order. Import/category order must follow
  // The original unique zIndex, not IDs or an observed result.
  const first = before.source.objects.find((row) => row.id === "destination-net"); assert.ok(first);
  before.source = source([...before.source.objects,
    { ...first, id: "z-net-second", body: { ...first.body, x: 7, zIndex: 3 } },
    { ...first, id: "a-net-third", body: { ...first.body, x: 9, zIndex: 4 } }]);
  before.native.source = encode(before.source);
  return before;
}
const multipleNetOperation = schematicLayoutBatchSchema.parse({ ...fullImportOperation, operations: [
  { id: "move-part", action: "sch.component.translate", target: { primitiveId: "part-a" }, x: 50, y: 0 },
  ...fullImportOperation.operations,
] });

void test("multiple-NET full import derives preserved child order from the intended moved-pin graph", () => {
  const before = multipleNetFixture(), raw = JSON.stringify(before);
  const result = expectedSchematicLayout(multipleNetOperation, before.source, before.native, fullImportIds);
  assert.deepEqual(result.retainedWireOrders, [{ profile: "full-import-unchanged-retained-multiple-net-wire", id: "destination", relevanceId: "destination-relevance",
    lines: 1, junctions: 0, danglingDots: 2, beforeRelevanceOrder: 1, relevanceOrder: 3,
    nets: [{ id: "destination-net", beforeOrder: 2, order: 4 }, { id: "z-net-second", beforeOrder: 3, order: 5 }, { id: "a-net-third", beforeOrder: 4, order: 6 }] }]);
  assert.equal(verifySchematicLayoutEffect(multipleNetOperation, before.source, result.expected, before.native, result.native, fullImportIds).removed.length, 0);
  assert.equal(JSON.stringify(before), raw);
});

void test("multiple-NET effect admits only derived orders and exact requested label display", () => {
  const before = multipleNetFixture();
  const request = schematicLayoutBatchSchema.parse({ ...multipleNetOperation, operations: [...multipleNetOperation.operations,
    { id: "display-second", action: "sch.attribute.display", target: { primitiveId: "z-net-second" }, patch: { x: 15, y: -5, valueVisible: false } }] });
  const result = expectedSchematicLayout(request, before.source, before.native, fullImportIds);
  assert.equal(verifySchematicLayoutEffect(request, before.source, result.expected, before.native, result.native, fullImportIds).removed.length, 0);
  assert.equal(result.expected.objects.find((row) => row.id === "z-net-second")?.body["x"], 15);
  assert.equal(result.expected.objects.find((row) => row.id === "a-net-third")?.body["x"], 9);
  for (const [id, patch] of [["destination-relevance", { zIndex: 4 }], ["destination-net", { zIndex: 5 }], ["a-net-third", { zIndex: 5 }],
    ["z-net-second", { value: "FOREIGN" }], ["z-net-second", { x: 16 }], ["a-net-third", { valueVisible: false }],
    ["line-a", { endX: 11 }], ["unrelated", { zIndex: 13 }]] as const) {
    const changed = altered(result.expected, id, patch);
    assert.throws(() => verifySchematicLayoutEffect(request, before.source, changed, before.native, { ...result.native, source: encode(changed) }, fullImportIds));
  }
  const swapped = altered(altered(result.expected, "destination-net", { zIndex: 6 }), "a-net-third", { zIndex: 4 });
  assert.throws(() => verifySchematicLayoutEffect(request, before.source, swapped, before.native, { ...result.native, source: encode(swapped) }, fullImportIds));
  const extra = source([...result.expected.objects, { id: "extra", type: "ATTR", body: { parentId: "destination", key: "NET", value: "N", zIndex: 7 } }]);
  assert.throws(() => verifySchematicLayoutEffect(request, before.source, extra, before.native, { ...result.native, source: encode(extra) }, fullImportIds));
  const locked = altered(before.source, "destination", { locked: true });
  assert.throws(() => expectedSchematicLayout(multipleNetOperation, locked, { ...before.native, source: encode(locked) }, fullImportIds), /locked/u);
});

void test("unsupported original multiple-NET profiles receive no ordering allowance", () => {
  const before = multipleNetFixture();
  const run = (snapshot: NativeSourceSnapshot): unknown => schematicRetainedWireOrders(fullImportOperation, snapshot,
    new Map(snapshot.objects.map((row) => [row.id, row])), before.native, before.native);
  for (const patch of [{ zIndex: 2 }, { zIndex: 1 }, { zIndex: 8 }, { zIndex: null }, { zIndex: -1 }, { zIndex: 3.5 }, { zIndex: Number.POSITIVE_INFINITY },
    { value: "FOREIGN" }, { value: "" }, { key: "OTHER" }, { parentId: "foreign", lineGroup: "destination" }]) {
    assert.deepEqual(run(altered(before.source, "z-net-second", patch)), []);
  }
  for (const patch of [{ zIndex: 2 }, { zIndex: null }, { valueVisible: true }]) {
    assert.deepEqual(run(altered(before.source, "destination-relevance", patch)), []);
  }
  assert.deepEqual(run(source([...before.source.objects,
    { id: "unknown-child", type: "ATTR", body: { parentId: "destination", key: "Other", value: "", zIndex: 5 } }])), []);
});

void test("sparse retained multiple-NET order stays exact and refuses attempted category correction or changed inventory", () => {
  const before = fullImportFixture();
  before.source = altered(altered(before.source, "destination-relevance", { zIndex: 2 }), "destination-net", { zIndex: 3 });
  const first = before.source.objects.find((row) => row.id === "destination-net"); assert.ok(first);
  before.source = source([...before.source.objects, { ...first, id: "sparse-net", body: { ...first.body, zIndex: 5 } }]);
  before.native.source = encode(before.source);
  const raw = JSON.stringify(before), result = expectedSchematicLayout(fullImportOperation, before.source, before.native, fullImportIds);
  assert.deepEqual(result.retainedWireOrders, []);
  for (const id of ["destination-relevance", "destination-net", "sparse-net"]) {
    assert.deepEqual(result.expected.objects.find((row) => row.id === id), before.source.objects.find((row) => row.id === id));
  }
  assert.equal(verifySchematicLayoutEffect(fullImportOperation, before.source, result.expected, before.native, result.native, fullImportIds).removed.length, 0);
  const corrected = altered(result.expected, "sparse-net", { zIndex: 4 });
  assert.throws(() => verifySchematicLayoutEffect(fullImportOperation, before.source, corrected, before.native, { ...result.native, source: encode(corrected) }, fullImportIds));
  for (const changed of [source(result.expected.objects.filter((row) => row.id !== "sparse-net")),
    source([...result.expected.objects, { ...first, id: "extra-net", body: { ...first.body, zIndex: 6 } }])]) {
    assert.throws(() => schematicRetainedWireOrders(fullImportOperation, before.source, new Map(changed.objects.map((row) => [row.id, row])), before.native, result.native), /inventory/u);
    assert.throws(() => verifySchematicLayoutEffect(fullImportOperation, before.source, changed, before.native, { ...result.native, source: encode(changed) }, fullImportIds));
  }
  assert.equal(JSON.stringify(before), raw);
});

const sparseDetachmentOperation = schematicLayoutBatchSchema.parse({ ...fullImportOperation, operations: [
  { id: "depart", action: "sch.component.translate", target: { primitiveId: "part-a" }, x: 100, y: -100 }, ...fullImportOperation.operations,
] });
function sparseDetachmentFixture(): ReturnType<typeof fixture> {
  const before = fullImportFixture(), retained = before.native.components.find((model) => model.id === "part-b");
  assert.ok(retained?.pins[0]); retained.body["y"] = 0; retained.pins[0].body["y"] = 0;
  before.source = altered(altered(altered(before.source, "part-b", { y: 0 }), "destination-relevance", { zIndex: 2 }), "destination-net", { zIndex: 3 });
  const net = before.source.objects.find((row) => row.id === "destination-net"); assert.ok(net);
  before.source = source([...before.source.objects, { ...net, id: "a-sparse-second", body: { ...net.body, x: 8, zIndex: 5 } }]);
  before.native.source = encode(before.source);
  before.native.document.tabId = `page@${"a".repeat(64)}`;
  return before;
}
function sparseEvidence(before: ReturnType<typeof fixture>): SchematicLayoutEvidence {
  const history = checkpoint(before.source);
  for (const page of history.documents) {
    for (const row of page.records) {
      Object.assign(row, { ticket: 100, client: "b".repeat(16) });
      if (row.type === "ATTR") {
        let firstTicket = 30;
        if (row.id === "destination-relevance") { firstTicket = 10; }
        else if (row.id === "destination-net") { firstTicket = 20; }
        Object.assign(row, { firstTicket, firstClient: "c".repeat(16) });
      }
    }
  }
  return { history, templates: {}, constructorWitness: {
    profile: "easyeda-pro-control.schematic-layout-constructor-witness.v1", sourceSha256: before.source.sha256,
    nativeSha256: schematicNativeSnapshotHash(before.native), checkpointSha256: history.checkpointSha256,
    projectUuid: history.projectUuid, documentUuid: "page", predecessorOperationId: "easyeda-20260921t000000z-12345678",
    predecessorJournalSha256: "1".repeat(64), lifecycleArtifactSha256: "2".repeat(64), terminalArtifactSha256: "3".repeat(64),
    nativeProfile: { schSha256: "3f50136fb4ba2d5593beac7ef3e20ebe5275177b56bbcfdd297e79f176a6618f",
      workerSha256: "2792c6c87e3c60e09c43f03494a9cbb24e4ebe9c385372bbaf877ed75083a949" },
  } };
}

void test("constructor-bound sparse two-NET detachment derives one dot and preserves first-clock caption order", () => {
  const before = sparseDetachmentFixture(), evidence = sparseEvidence(before), raw = JSON.stringify({ before, evidence });
  assert.equal(needsSchematicLayoutConstructorWitness(sparseDetachmentOperation, before.source, before.native), true);
  const result = expectedSchematicLayout(sparseDetachmentOperation, before.source, before.native, fullImportIds, evidence);
  assert.deepEqual(result.retainedWireOrders, [{ profile: "full-import-detached-pin-sparse-two-net-wire", id: "destination", relevanceId: "destination-relevance",
    lines: 1, junctions: 0, danglingDots: 1, beforeRelevanceOrder: 2, relevanceOrder: 2,
    nets: [{ id: "destination-net", beforeOrder: 3, order: 3 }, { id: "a-sparse-second", beforeOrder: 5, order: 4 }],
    departingComponentId: "part-a", departingPinId: "part-a-pin", retainedPinId: "part-b-pin", constructorOperationId: evidence.constructorWitness?.predecessorOperationId,
    firstClockOrderSha256: sha256Json([{ id: "destination-net", firstTicket: 20, firstClient: "c".repeat(16) }, { id: "a-sparse-second", firstTicket: 30, firstClient: "c".repeat(16) }]),
  }]);
  assert.equal(result.expected.objects.find((row) => row.id === "a-sparse-second")?.body["zIndex"], 4);
  assert.equal(verifySchematicLayoutEffect(sparseDetachmentOperation, before.source, result.expected, before.native, result.native, fullImportIds, evidence).removed.length, 0);
  assert.equal(JSON.stringify({ before, evidence }), raw);
  const persistence = verifySchematicLayoutPersistence(sparseDetachmentOperation, { before: evidence.history, after: checkpoint(result.expected),
    expectedBefore: before.source, expectedAfter: result.expected, beforeNative: before.native, afterNative: result.native }, fullImportIds, evidence);
  assert.equal(persistence["ok"], true);
  assert.deepEqual(persistence["retainedWireInitialOrderMaterializations"], []);
  // Existing storage proof can retain the exact original durable order.
  // This profile adds no numeric materialization and admits no third order.
  const lag = altered(result.expected, "a-sparse-second", { zIndex: 5 });
  const retained = verifySchematicLayoutPersistence(sparseDetachmentOperation, { before: evidence.history, after: checkpoint(lag),
    expectedBefore: before.source, expectedAfter: result.expected, beforeNative: before.native, afterNative: result.native }, fullImportIds, evidence);
  assert.equal(retained["ok"], true); assert.deepEqual(retained["retainedWireInitialOrderMaterializations"], []);
  assert.throws(() => verifySchematicLayoutPersistence(sparseDetachmentOperation, { before: evidence.history,
    after: checkpoint(altered(result.expected, "a-sparse-second", { zIndex: 6 })), expectedBefore: before.source,
    expectedAfter: result.expected, beforeNative: before.native, afterNative: result.native }, fullImportIds, evidence));
});

void test("sparse detachment has no admission without the constructor witness, typed move or wire import", () => {
  const before = sparseDetachmentFixture(), evidence = sparseEvidence(before);
  for (const absent of [undefined, { history: evidence.history, templates: {} }]) {
    const result = expectedSchematicLayout(sparseDetachmentOperation, before.source, before.native, fullImportIds, absent);
    assert.deepEqual(result.retainedWireOrders, []);
    const changed = altered(result.expected, "a-sparse-second", { zIndex: 4 });
    assert.throws(() => verifySchematicLayoutEffect(sparseDetachmentOperation, before.source, changed, before.native, { ...result.native, source: encode(changed) }, fullImportIds, absent));
  }
  const moveOnly = schematicLayoutBatchSchema.parse({ ...sparseDetachmentOperation, operations: sparseDetachmentOperation.operations.filter((step) => step.action === "sch.component.translate") });
  for (const request of [fullImportOperation, moveOnly]) {
    assert.equal(needsSchematicLayoutConstructorWitness(request, before.source, before.native), false);
    assert.deepEqual(expectedSchematicLayout(request, before.source, before.native, request === moveOnly ? {} : fullImportIds, evidence).retainedWireOrders, []);
  }
  const numeric = source(before.source.objects.map((row) => row.id === "a-sparse-second" ? { ...row, id: "2" } : row));
  assert.equal(needsSchematicLayoutConstructorWitness(sparseDetachmentOperation, numeric, { ...before.native, source: encode(numeric) }), false);
});

void test("sparse detachment rejects missing, ambiguous, reversed clocks and mismatched complete durable group", () => {
  const before = sparseDetachmentFixture(), evidence = sparseEvidence(before);
  const mutate = (patch: Record<string, unknown>): SchematicLayoutEvidence => ({ ...evidence, history: { ...evidence.history,
    documents: evidence.history.documents.map((page) => ({ ...page, records: page.records.map((row) => row.id === "a-sparse-second" ? { ...row, ...patch } : row) })),
  } });
  for (const patch of [{ firstTicket: undefined }, { firstClient: null }, { firstTicket: 20 }, { firstTicket: 19 }, { firstTicket: 101 }, { firstTicket: 0 }, { firstClient: "bad" }]) {
    assert.throws(() => expectedSchematicLayout(sparseDetachmentOperation, before.source, before.native, fullImportIds, mutate(patch)), /clock|order/u);
  }
  const badDurable = sparseEvidence({ ...before, source: altered(before.source, "a-sparse-second", { zIndex: 4 }) });
  assert.throws(() => expectedSchematicLayout(sparseDetachmentOperation, before.source, before.native, fullImportIds,
    { ...evidence, history: { ...badDurable.history, checkpointSha256: evidence.history.checkpointSha256 } }), /durable group/u);
  const brokenHash = { ...evidence, history: { ...evidence.history, semanticSha256: "0".repeat(64) } };
  assert.throws(() => expectedSchematicLayout(sparseDetachmentOperation, before.source, before.native, fullImportIds, brokenHash), /history/u);
  for (const patch of [{ sourceSha256: "0".repeat(64) }, { nativeSha256: "0".repeat(64) }, { checkpointSha256: "0".repeat(64) }, { documentUuid: "other" }]) {
    const constructorWitness = evidence.constructorWitness; assert.ok(constructorWitness);
    assert.throws(() => expectedSchematicLayout(sparseDetachmentOperation, before.source, before.native, fullImportIds,
      { ...evidence, constructorWitness: { ...constructorWitness, ...patch } }));
  }
});

void test("sparse detachment rejects changed retained rows, endpoint occupancy, NC and non-typed departure", () => {
  const before = sparseDetachmentFixture(), evidence = sparseEvidence(before);
  const result = expectedSchematicLayout(sparseDetachmentOperation, before.source, before.native, fullImportIds, evidence);
  const unprojected = altered(result.expected, "a-sparse-second", { zIndex: 5 });
  const run = (snapshot = unprojected, native = result.native, request = sparseDetachmentOperation): unknown => schematicRetainedWireOrders(request,
    before.source, new Map(snapshot.objects.map((row) => [row.id, row])), before.native, native, undefined, evidence);
  for (const [id, patch] of [["destination", { zIndex: 9 }], ["line-a", { startX: -1 }], ["a-sparse-second", { x: 9 }],
    ["destination-relevance", { valueVisible: true }], ["a-sparse-second", { value: "OTHER" }]] as const) { assert.throws(() => run(altered(unprojected, id, patch))); }
  for (const change of ["retained-near", "retained-foreign", "retained-nc", "departing-wrong", "duplicate-pin", "vacated-occupied"] as const) {
    const native = structuredClone(result.native);
    const departing = native.components.find((model) => model.id === "part-a"), retained = native.components.find((model) => model.id === "part-b");
    assert.ok(departing?.pins[0]); assert.ok(retained?.pins[0]);
    if (change === "retained-near") { retained.pins[0].body["x"] = 0.1; }
    else if (change === "retained-foreign") { retained.pins[0].net = "OTHER"; }
    else if (change === "retained-nc") { retained.pins[0].noConnect = { id: "nc", value: "yes", body: { key: "NO_CONNECT", value: "yes" } }; }
    else if (change === "departing-wrong") { departing.pins[0].body["x"] = 101; }
    else if (change === "duplicate-pin") { retained.pins.push(structuredClone(retained.pins[0])); }
    else { retained.pins.push({ ...structuredClone(retained.pins[0]), id: "unexpected", body: { ...retained.pins[0].body, x: 10 } }); }
    assert.throws(() => run(unprojected, native));
  }
  for (const [startX, startY, endX, endY] of [[10, 0, 15, 0], [10.1, 0, 15, 0], [5, -5, 5, 5]]) {
    assert.throws(() => run(source([...unprojected.objects, { id: "foreign-wire", type: "WIRE", body: { zIndex: 50 } },
      { id: "foreign-line", type: "LINE", body: { lineGroup: "foreign-wire", startX, startY, endX, endY } }])), /occupancy/u);
  }
  const duplicate = schematicLayoutBatchSchema.parse({ ...sparseDetachmentOperation, operations: [{ id: "duplicate", action: "sch.component.translate", target: { primitiveId: "part-a" }, x: 50, y: -50 }, ...sparseDetachmentOperation.operations] });
  assert.throws(() => run(unprojected, result.native, duplicate), /translation/u);
  for (const [id, patch] of [["a-sparse-second", { zIndex: 5 }], ["destination-net", { zIndex: 4 }], ["a-sparse-second", { x: 9 }]] as const) {
    const changed = altered(result.expected, id, patch);
    assert.throws(() => verifySchematicLayoutEffect(sparseDetachmentOperation, before.source, changed, before.native, { ...result.native, source: encode(changed) }, fullImportIds, evidence));
  }
});

void test("multiple-NET retained candidates preserve source geometry, ownership, exact endpoints and NC guards", () => {
  const before = multipleNetFixture();
  // Keep the attached pin here so foreign-net/NC checks apply at that endpoint.
  const result = expectedSchematicLayout(fullImportOperation, before.source, before.native, fullImportIds);
  const originals = new Map(before.source.objects.map((row) => [row.id, row]));
  const raw = source(result.expected.objects.map((row) => originals.get(row.id) ?? row));
  const run = (snapshot: NativeSourceSnapshot, native = result.native): unknown => schematicRetainedWireOrders(fullImportOperation, before.source,
    new Map(snapshot.objects.map((row) => [row.id, row])), before.native, native);
  for (const [id, patch] of [["destination", { zIndex: 20 }], ["line-a", { endX: 11 }], ["z-net-second", { x: 8 }],
    ["z-net-second", { value: "FOREIGN" }], ["destination-relevance", { zIndex: 9 }], ["z-net-second", { zIndex: 2 }],
    ["z-net-second", { zIndex: null }], ["z-net-second", { zIndex: 3.5 }], ["z-net-second", { key: "OTHER" }],
    ["z-net-second", { parentId: "foreign", lineGroup: "destination" }]] as const) {
    assert.throws(() => run(altered(raw, id, patch)));
  }
  assert.throws(() => run(source(raw.objects.filter((row) => row.id !== "a-net-third"))), /inventory/u);
  assert.throws(() => run(source([...raw.objects,
    { id: "other-wire", type: "WIRE", body: { zIndex: 50 } },
    { id: "other-line", type: "LINE", body: { lineGroup: "other-wire", startX: 0, startY: 0, endX: -10, endY: 0 } }])), /shares an endpoint/u);
  for (const change of ["foreign", "active-nc", "unbound-inactive-nc", "near"] as const) {
    const native = structuredClone(result.native), pin = native.components.find((model) => model.id === "part-a")?.pins[0]; assert.ok(pin);
    if (change === "foreign") { pin.net = "FOREIGN"; }
    else if (change === "near") { pin.body["x"] = 10.1; }
    else { pin.noConnect = { id: "nc", value: change === "active-nc" ? "yes" : "no", body: { parentId: pin.id, key: "NO_CONNECT", value: change === "active-nc" ? "yes" : "no" } }; }
    assert.throws(() => run(raw, native), /foreign-net or NC|near-coincident/u);
  }
});

void test("multiple-NET persistence admits only each exact original or projected order, including null materialization", () => {
  const before = multipleNetFixture(), result = expectedSchematicLayout(multipleNetOperation, before.source, before.native, fullImportIds);
  const originalAttrs = before.source.objects.filter((row) => row.type === "ATTR" && row.body["parentId"] === "destination");
  const nullOrders = source(before.source.objects.map((row) => originalAttrs.some((attr) => attr.id === row.id) ? { ...row, body: { ...row.body, zIndex: null } } : row));
  const materialized = source(result.expected.objects.map((row) => originalAttrs.find((attr) => attr.id === row.id) ?? row));
  for (const durableBefore of [before.source, nullOrders]) {
    const history = checkpoint(durableBefore), input = { before: history, after: checkpoint(materialized), expectedBefore: before.source,
      expectedAfter: result.expected, beforeNative: before.native, afterNative: result.native };
    const evidence = { history, templates: {} }, raw = JSON.stringify(input);
    const proof = verifySchematicLayoutPersistence(multipleNetOperation, input, fullImportIds, evidence);
    assert.equal(proof["ok"], true);
    if (durableBefore === nullOrders) {
      assert.throws(() => verifySchematicStoragePersistence(input), /neither retained/u);
      assert.ok(Array.isArray(proof["retainedWireInitialOrderMaterializations"]));
      assert.equal(proof["retainedWireInitialOrderMaterializations"].length, 4);
    }
    for (const saved of [durableBefore, result.expected]) {
      const retained = saved.objects.filter((row) => originalAttrs.some((attr) => attr.id === row.id));
      const after = checkpoint(source(result.expected.objects.map((row) => retained.find((attr) => attr.id === row.id) ?? row)));
      assert.equal(verifySchematicLayoutPersistence(multipleNetOperation, { ...input, after }, fullImportIds, evidence)["ok"], true);
    }
    for (const [id, patch] of [["destination-relevance", { zIndex: 8 }], ["z-net-second", { zIndex: 6 }], ["a-net-third", { zIndex: 3 }],
      ["a-net-third", { value: "FOREIGN" }], ["z-net-second", { x: 8 }], ["line-a", { endX: 11 }], ["unrelated", { value: "Changed" }]] as const) {
      assert.throws(() => verifySchematicLayoutPersistence(multipleNetOperation, { ...input, after: checkpoint(altered(materialized, id, patch)) }, fullImportIds, evidence));
    }
    assert.equal(JSON.stringify(input), raw);
  }
  const wrongBefore = checkpoint(altered(nullOrders, "z-net-second", { zIndex: -1 }));
  assert.throws(() => verifySchematicLayoutPersistence(multipleNetOperation, { before: wrongBefore, after: checkpoint(materialized), expectedBefore: before.source,
    expectedAfter: result.expected, beforeNative: before.native, afterNative: result.native }, fullImportIds, { history: wrongBefore, templates: {} }), /neither retained/u);
});

void test("multiple-NET persistence admits exact captured-order upload from a lagging safe numeric durable order only", () => {
  const before = multipleNetFixture(), result = expectedSchematicLayout(multipleNetOperation, before.source, before.native, fullImportIds);
  const id = "a-net-third", original = before.source.objects.find((row) => row.id === id); assert.ok(original);
  assert.equal(original.body["zIndex"], 4);
  assert.equal(result.expected.objects.find((row) => row.id === id)?.body["zIndex"], 6);
  const lagging = altered(before.source, id, { zIndex: 5 }), stored = altered(result.expected, id, { zIndex: 4 });
  const history = checkpoint(lagging), input = { before: history, after: checkpoint(stored), expectedBefore: before.source,
    expectedAfter: result.expected, beforeNative: before.native, afterNative: result.native };
  const evidence = { history, templates: {} }, raw = JSON.stringify(input);
  assert.throws(() => verifySchematicStoragePersistence(input), /neither retained/u);
  const proof = verifySchematicLayoutPersistence(multipleNetOperation, input, fullImportIds, evidence);
  assert.equal(proof["ok"], true);
  assert.deepEqual(proof["retainedWireInitialOrderMaterializations"], [{ id, parentId: "destination", key: "NET", initialOrder: 4, modelOrder: 6,
    originalBodySha256: sha256Json(original.body) }]);
  for (const zIndex of [-1, 1.5, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1, "5"]) {
    const badHistory = checkpoint(altered(before.source, id, { zIndex }));
    assert.throws(() => verifySchematicLayoutPersistence(multipleNetOperation, { ...input, before: badHistory }, fullImportIds,
      { history: badHistory, templates: {} }));
  }
  for (const patch of [{ value: "FOREIGN" }, { parentId: "foreign" }, { key: "OTHER" }, { x: 8 }, { valueVisible: false }]) {
    const badHistory = checkpoint(altered(lagging, id, patch));
    assert.throws(() => verifySchematicLayoutPersistence(multipleNetOperation, { ...input, before: badHistory }, fullImportIds,
      { history: badHistory, templates: {} }));
    assert.throws(() => verifySchematicLayoutPersistence(multipleNetOperation, { ...input, after: checkpoint(altered(stored, id, patch)) }, fullImportIds, evidence));
  }
  assert.throws(() => verifySchematicLayoutPersistence(multipleNetOperation, { ...input, after: checkpoint(altered(stored, id, { zIndex: 7 })) }, fullImportIds, evidence));
  assert.equal(JSON.stringify(input), raw);
  // The original one-NET profile keeps its null-only materialization rule.
  const single = fullImportFixture();
  const projected = expectedSchematicLayout(fullImportOperation, single.source, single.native, fullImportIds);
  const singleHistory = checkpoint(altered(single.source, "destination-net", { zIndex: 5 }));
  const singleStored = altered(projected.expected, "destination-net", { zIndex: 2 });
  assert.throws(() => verifySchematicLayoutPersistence(fullImportOperation, { before: singleHistory, after: checkpoint(singleStored), expectedBefore: single.source,
    expectedAfter: projected.expected, beforeNative: single.native, afterNative: projected.native }, fullImportIds, { history: singleHistory, templates: {} }), /neither retained/u);
});
