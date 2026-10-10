import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Json } from "../src/core.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "../src/document-source.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";
import { schematicNativeSnapshotSchema } from "../src/schematic-native-adapter.ts";
import type { SchematicNativeSnapshot } from "../src/schematic-native-adapter.ts";
import { verifySchematicStorageBaseline, verifySchematicStoragePersistence } from "../src/schematic-storage-persistence.ts";
import { verifyDesignBaseline } from "../src/design-persistence.ts";

const header = { uuid: "page", docType: "SCH_PAGE", editVersion: "3.2.149.88089769" };
const component = { id: "frame", type: "COMPONENT", body: { x: 0, y: 0, rotation: 0, isMirror: false, zIndex: 0 } };
const attribute = { id: "label", type: "ATTR", body: { x: 10, y: 20, value: "unchanged", key: "Company", parentId: "frame", zIndex: 3, strikeout: false } };
const canvas = { id: "CANVAS", type: "CANVAS", body: { originX: 0, originY: 0 } };
function native(records: readonly NativeSourceObject[]): SchematicNativeSnapshot {
  const attr = records.find((entry) => entry.id === "label"); assert.ok(attr);
  const frame = records.find((entry) => entry.id === "frame"); assert.ok(frame);
  const source = `{"type":"DOCHEAD"}||${JSON.stringify(header)}|\n${records.map((entry) => `${JSON.stringify({ id: entry.id, type: entry.type })}||${JSON.stringify(entry.body)}|\n`).join("")}`;
  return schematicNativeSnapshotSchema.parse({ profile: "easyeda-pro-control.schematic-native.v1", document: { documentUuid: "page", tabId: "page@project" }, source,
    components: [{ id: frame.id, kind: "sheet", locked: false, body: frame.body, pins: [], attributes: [{ id: attr.id, key: "Company", value: "unchanged", symbolValue: "unchanged", blockValue: null, instanceValue: null, body: attr.body }] }] });
}
function checkpoint(records: readonly NativeSourceObject[], foreignValue = "unchanged"): NativeHistorySnapshot {
  const target = { uuid: "page", docType: "SCH_PAGE", metadata: header, records: records.toSorted((a, b) => a.id.localeCompare(b.id)) };
  const other = { uuid: "other", docType: "CONFIG", metadata: { uuid: "other", docType: "CONFIG" }, records: [{ id: "entry", type: "META", body: { value: foreignValue } }] };
  const documents = [target, other].map((entry) => Object.assign(structuredClone(entry), { records: entry.records.map((record) => Object.assign(structuredClone(record), { ticket: 1, client: null })), semanticSha256: sha256Json(entry) }));
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "a".repeat(64), projectOwnerUuid: "b".repeat(32), branchUuid: "c".repeat(32), headHistoryUuid: "d".repeat(32),
    checkpointSha256: sha256Json(documents), historyRowCount: 1, chunkCount: 1, plaintextBytes: 100, documents,
    semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
}
function fixture(): { input: Parameters<typeof verifySchematicStoragePersistence>[0]; saved: NativeSourceObject[]; expected: NativeSourceSnapshot } {
  const beforeNative = native([component, attribute, canvas]);
  const expectedRecords = [component, { ...attribute, body: { ...attribute.body, x: 30 } }, canvas, { id: "line", type: "LINE", body: { startX: 0, startY: 0, endX: 10, endY: 0 } }];
  const afterNative = native(expectedRecords);
  const noStrike = Object.fromEntries(Object.entries(attribute.body).filter(([key]) => key !== "strikeout"));
  const before = checkpoint([{ ...component, body: { ...component.body, zIndex: null } }, { ...attribute, body: { ...noStrike, zIndex: 2 } }]);
  const saved = expectedRecords.map((entry) => entry.id === "label" ? Object.assign(structuredClone(entry), { body: { ...noStrike, x: 30, zIndex: 2 } }) : entry);
  const expected = parseDocumentSource(afterNative.source);
  return { input: { before, after: checkpoint(saved), expectedBefore: parseDocumentSource(beforeNative.source), expectedAfter: expected, beforeNative, afterNative }, saved, expected };
}

void test("schematic storage reports origin hydration, frame initialization and exact attribute encoding without changing raw evidence", () => {
  const f = fixture(); const original = JSON.stringify(f.input);
  const proof = verifySchematicStoragePersistence(f.input);
  assert.equal(proof["ok"], true); assert.equal(proof["documentCount"], 2);
  assert.deepEqual(proof["materializedCanvas"], { id: "CANVAS", bodySha256: sha256Json(canvas.body) });
  assert.equal(JSON.stringify(f.input), original);
  assert.equal(proof["beforeCheckpointSha256"], f.input.before.checkpointSha256);
  assert.notEqual(proof["beforeSemanticSha256"], proof["comparisonBeforeSemanticSha256"]);
});
void test("schematic storage rejects arbitrary order, style, origin, foreign records and missing intended geometry", () => {
  const f = fixture();
  const changed = (id: string, patch: Record<string, unknown>): NativeHistorySnapshot => checkpoint(f.saved.map((record) => record.id === id ? { ...record, body: { ...record.body, ...patch } } : record));
  for (const after of [changed("label", { zIndex: 999 }), changed("label", { strikeout: true }), changed("label", { value: "wrong" }), changed("CANVAS", { originX: 5 }),
    changed("frame", { zIndex: 4 }), checkpoint(f.saved, "changed"), checkpoint(f.saved.filter((record) => record.id !== "line"))]) {
    assert.throws(() => verifySchematicStoragePersistence({ ...f.input, after }));
  }
  assert.throws(() => verifySchematicStoragePersistence({ ...f.input, afterNative: undefined }));
});

void test("one null-order frame initializes immediately below the exact unchanged minimum root order", () => {
  const frame = { ...component, body: { ...component.body, zIndex: 1 } };
  const wire = { id: "existing-wire", type: "WIRE", body: { zIndex: 2 } };
  const records = [frame, attribute, canvas, wire];
  const captured = native(records);
  const source = parseDocumentSource(captured.source);
  const stored = records.map((row) => row.id === frame.id ? Object.assign(structuredClone(row), { body: { ...row.body, zIndex: null } }) : row);
  const input = { before: checkpoint(stored), after: checkpoint(records), expectedBefore: source, expectedAfter: source, beforeNative: captured, afterNative: captured };
  const raw = JSON.stringify(input);
  const proof = verifySchematicStoragePersistence(input);
  assert.equal(JSON.stringify(input), raw);
  assert.equal(proof["documentCount"], 2);
  assert.ok(Array.isArray(proof["frameOrderInitializations"]));
  assert.equal(proof["frameOrderInitializations"].length, 1);
  for (const badBefore of [
    stored.map((row) => row.id === wire.id ? Object.assign(structuredClone(row), { body: { zIndex: null } }) : row),
    stored.map((row) => row.id === wire.id ? Object.assign(structuredClone(row), { body: { zIndex: 3 } }) : row),
    stored.map((row) => row.id === frame.id ? Object.assign(structuredClone(row), { body: { ...row.body, zIndex: 0 } }) : row),
  ]) { assert.throws(() => verifySchematicStoragePersistence({ ...input, before: checkpoint(badBefore) })); }
  const arbitraryRecords = records.map((row) => row.id === frame.id ? Object.assign(structuredClone(row), { body: { ...row.body, zIndex: 3 } }) : row);
  const arbitraryNative = native(arbitraryRecords), arbitrarySource = parseDocumentSource(arbitraryNative.source);
  assert.throws(() => verifySchematicStoragePersistence({ ...input, after: checkpoint(arbitraryRecords), expectedBefore: arbitrarySource,
    expectedAfter: arbitrarySource, beforeNative: arbitraryNative, afterNative: arbitraryNative }));
  const rootLabel = { id: "standalone-label", type: "ATTR", body: { parentId: "$$root", key: "_NETLABEL_", value: "SIGNAL", x: 10, y: 20, zIndex: 0 } };
  const withLabel = [...records, rootLabel];
  const labelNative = native(withLabel), labelSource = parseDocumentSource(labelNative.source);
  assert.throws(() => verifySchematicStoragePersistence({ ...input, before: checkpoint([...stored, rootLabel]), after: checkpoint(withLabel),
    expectedBefore: labelSource, expectedAfter: labelSource, beforeNative: labelNative, afterNative: labelNative }));
});

function changedRootRows(rows: NativeSourceObject[], id: string, patch: Record<string, unknown>): NativeSourceObject[] {
  return rows.map((row) => row.id === id ? { ...row, body: { ...row.body, ...patch } } : row);
}

void test("frame initialization admits only unchanged complete TEXT roots across both durable and source states", () => {
  const frame = { ...component, body: { ...component.body, zIndex: 2 } };
  const wire = { id: "existing-wire", type: "WIRE", body: { zIndex: 3 } };
  const text = { id: "note", type: "TEXT", body: { text: "Keep this note", x: 100, y: 200, zIndex: 269, fontSize: 14 } };
  const records: NativeSourceObject[] = [frame, attribute, canvas, wire, text];
  const stored = records.map((row) => row.id === frame.id ? { ...row, body: { ...row.body, zIndex: null } } : row);
  const inputFor = (beforeRows = stored, beforeSourceRows = records, afterRows = records, afterSourceRows = records): Parameters<typeof verifySchematicStoragePersistence>[0] => {
    const afterNative = native(afterSourceRows), beforeNative = native(beforeSourceRows);
    return { before: checkpoint(beforeRows), after: checkpoint(afterRows), expectedBefore: parseDocumentSource(beforeNative.source),
      expectedAfter: parseDocumentSource(afterNative.source), beforeNative, afterNative };
  };
  const input = inputFor(), raw = JSON.stringify(input);
  const proof = verifySchematicStoragePersistence(input);
  assert.deepEqual(proof["frameOrderInitializations"], [{ id: frame.id, beforeBodySha256: sha256Json({ ...frame.body, zIndex: null }), afterBodySha256: sha256Json(frame.body) }]);
  assert.equal(JSON.stringify(input), raw);
  const changed = changedRootRows;
  const wrongText = changed(records, text.id, { text: "Altered note" });
  const absentText = records.filter((row) => row.id !== text.id);
  const unknownRoot = { id: "unknown-root", type: "RECT", body: { x: 0, y: 0, zIndex: 4 } };
  const cases: [string, Parameters<typeof verifySchematicStoragePersistence>[0]][] = [
    ["before TEXT body differs from source", inputFor(changed(stored, text.id, { fontSize: 15 }))],
    ["before source TEXT differs", inputFor(stored, wrongText)],
    ["after TEXT body differs from source", inputFor(stored, records, wrongText)],
    ["after source TEXT differs", inputFor(stored, records, records, wrongText)],
    ["requested TEXT change is not this profile", inputFor(stored, records, wrongText, wrongText)],
    ["requested TEXT order change", inputFor(stored, records, changed(records, text.id, { zIndex: 270 }), changed(records, text.id, { zIndex: 270 }))],
    ["source root inventory omits TEXT", inputFor(stored, absentText)],
    ["stored root inventory omits TEXT", inputFor(stored.filter((row) => row.id !== text.id))],
    ["after TEXT missing", inputFor(stored, records, absentText, absentText)],
    ["second invalid root", inputFor(changed(stored, wire.id, { zIndex: null }))],
    ["TEXT order invalid in all states", inputFor(changed(stored, text.id, { zIndex: null }), changed(records, text.id, { zIndex: null }), changed(records, text.id, { zIndex: null }), changed(records, text.id, { zIndex: null }))],
    ["finite peer order drift", inputFor(changed(stored, wire.id, { zIndex: 4 }))],
    ["unsupported root", inputFor([...stored, unknownRoot], [...records, unknownRoot], [...records, unknownRoot], [...records, unknownRoot])],
    ["frame body differs", inputFor(changed(stored, frame.id, { x: 1 }))],
    ["frame order differs after save", inputFor(stored, records, changed(records, frame.id, { zIndex: 1 }))],
    ["captured frame order not minimum minus one", inputFor(stored, changed(records, frame.id, { zIndex: 1 }), changed(records, frame.id, { zIndex: 1 }), changed(records, frame.id, { zIndex: 1 }))],
  ];
  for (const [name, invalid] of cases) { assert.throws(() => verifySchematicStoragePersistence(invalid), name); }
});

void test("schematic baseline maps exact wire-attribute order/defaults but verifies every requested field", () => {
  const wire = { id: "wire", type: "WIRE", body: { zIndex: 1 } };
  const relevance = { id: "wire-attr", type: "ATTR", body: { parentId: "wire", key: "Relevance", value: "net-1", x: null, y: null, zIndex: 5, strikeout: false } };
  const line = { id: "wire-line", type: "LINE", body: { parentId: "wire", startX: 10, startY: 20, endX: 30, endY: 20 } };
  const records = [component, attribute, canvas, wire, relevance, line];
  const nativeSnapshot = native(records);
  const source = parseDocumentSource(nativeSnapshot.source);
  const storedAttribute = { ...relevance, body: Object.fromEntries(Object.entries({ ...relevance.body, zIndex: 0 }).filter(([key]) => key !== "strikeout")) };
  const stored = records.map((record) => record.id === relevance.id ? storedAttribute : record);
  const input = { checkpoint: checkpoint(stored), source, native: nativeSnapshot,
    targets: [{ id: relevance.id, fields: Object.keys(relevance.body) }, { id: line.id, fields: Object.keys(line.body) }] };
  const original = JSON.stringify(input);
  assert.throws(() => verifyDesignBaseline(input), /baseline/u);
  const proof = verifySchematicStorageBaseline(input);
  assert.equal(proof["ok"], true);
  assert.equal(proof["checkpointSha256"], input.checkpoint.checkpointSha256);
  assert.equal(JSON.stringify(input), original);
  const netportNative = structuredClone(nativeSnapshot);
  const netport = netportNative.components[0]; assert.ok(netport);
  netport.kind = "netport";
  const portStored = stored.map((record) => record.id === "label" ? Object.assign(structuredClone(record), { body: { ...record.body, zIndex: 1 } }) : record);
  assert.equal(verifySchematicStorageBaseline({ ...input, checkpoint: checkpoint(portStored), native: netportNative })["ok"], true);
  for (const [id, patch] of [[line.id, { startX: 999 }], [relevance.id, { value: "foreign-net" }], [relevance.id, { strikeout: true }]] as const) {
    const drift = stored.map((record) => record.id === id ? Object.assign(structuredClone(record), { body: { ...record.body, ...patch } }) : record);
    assert.throws(() => verifySchematicStorageBaseline({ ...input, checkpoint: checkpoint(drift) }));
  }
  assert.throws(() => verifySchematicStorageBaseline({ ...input, targets: [...input.targets, { id: "missing", fields: ["x"] }] }));
});

void test("wire NET and Relevance null order is retained or initialized exactly, never generalized to other attributes", () => {
  for (const key of ["Relevance", "NET"]) {
    const wire = { id: "wire", type: "WIRE", body: { zIndex: 1 } };
    const attr = { id: "wire-attr", type: "ATTR", body: { parentId: "wire", key, value: "net-1", x: null, y: null, zIndex: 2 } };
    const records = [component, attribute, canvas, wire, attr];
    const nativeSnapshot = native(records);
    const source = parseDocumentSource(nativeSnapshot.source);
    const stored = records.map((entry) => entry.id === attr.id ? Object.assign(structuredClone(entry), { body: { ...entry.body, zIndex: null } }) : entry);
    const before = checkpoint(stored);
    const baseline = { checkpoint: before, source, native: nativeSnapshot, targets: [{ id: attr.id, fields: Object.keys(attr.body) }] };
    assert.equal(verifySchematicStorageBaseline(baseline)["ok"], true);
    const persistence = { before, after: before, expectedBefore: source, expectedAfter: source, beforeNative: nativeSnapshot, afterNative: nativeSnapshot };
    assert.equal(verifySchematicStoragePersistence(persistence)["ok"], true);
    assert.equal(verifySchematicStoragePersistence({ ...persistence, after: checkpoint(records) })["ok"], true);
    const otherOrder = records.map((entry) => entry.id === attr.id ? Object.assign(structuredClone(entry), { body: { ...entry.body, zIndex: 99 } }) : entry);
    assert.throws(() => verifySchematicStoragePersistence({ ...persistence, after: checkpoint(otherOrder) }), /neither retained/u);
    const nullFrameAttr = stored.map((entry) => entry.id === attribute.id ? Object.assign(structuredClone(entry), { body: { ...entry.body, zIndex: null } }) : entry);
    assert.throws(() => verifySchematicStorageBaseline({ ...baseline, checkpoint: checkpoint(nullFrameAttr) }), /exact native integer/u);
    const otherKey = records.map((entry) => entry.id === attr.id ? Object.assign(structuredClone(entry), { body: { ...entry.body, key: "Other" } }) : entry);
    const otherNative = native(otherKey);
    const nullOtherKey = otherKey.map((entry) => entry.id === attr.id ? Object.assign(structuredClone(entry), { body: { ...entry.body, zIndex: null } }) : entry);
    assert.throws(() => verifySchematicStorageBaseline({ ...baseline, checkpoint: checkpoint(nullOtherKey), source: parseDocumentSource(otherNative.source), native: otherNative }), /exact native integer/u);
  }
});

void test("inherited pin-number strikeout encoding requires exact unique native pin ownership and unchanged order", () => {
  const pinAttr = { id: "pin-number", type: "ATTR", body: { parentId: "part-pin", key: "Pin Number", value: "1", x: 5, y: 0, zIndex: 2, strikeout: false } };
  const records = [component, attribute, canvas, pinAttr];
  const nativeSnapshot = native(records);
  const owner = nativeSnapshot.components[0]; assert.ok(owner);
  owner.pins.push({ id: "part-pin", body: {}, net: "GND", noConnect: null,
    attributes: [{ id: pinAttr.id, key: "Pin Number", value: "1", symbolValue: "1", blockValue: null, instanceValue: null, body: pinAttr.body }] });
  const stored = records.map((entry) => entry.id === pinAttr.id ? Object.assign(structuredClone(entry), { body: Object.fromEntries(Object.entries(entry.body).filter(([key]) => key !== "strikeout")) }) : entry);
  const input = { checkpoint: checkpoint(stored), source: parseDocumentSource(nativeSnapshot.source), native: nativeSnapshot, targets: [{ id: pinAttr.id, fields: Object.keys(pinAttr.body) }] };
  assert.equal(verifySchematicStorageBaseline(input)["ok"], true);
  for (const patch of [{ zIndex: 0 }, { value: "2" }, { x: 6 }, { strikeout: true }]) {
    const altered = stored.map((entry) => entry.id === pinAttr.id ? Object.assign(structuredClone(entry), { body: { ...entry.body, ...patch } }) : entry);
    assert.throws(() => verifySchematicStorageBaseline({ ...input, checkpoint: checkpoint(altered) }));
  }
  const missing = structuredClone(nativeSnapshot);
  const missingOwner = missing.components[0]; assert.ok(missingOwner); missingOwner.pins = [];
  assert.throws(() => verifySchematicStorageBaseline({ ...input, native: missing }), /supported source\/native owner/u);
});

void test("new hidden wire Relevance may retain only zero constructor order with exact endpoint proof", () => {
  const oldRecords = [component, attribute, canvas];
  const beforeNative = native(oldRecords);
  const wire = { id: "new-wire", type: "WIRE", body: { zIndex: 5, locked: false } };
  const relevance = { id: "new-relevance", type: "ATTR", body: { parentId: wire.id, key: "Relevance", value: "[]", x: null, y: null, keyVisible: null, valueVisible: null, zIndex: 3 } };
  const line = { id: "new-line", type: "LINE", body: { lineGroup: wire.id, startX: 100, startY: 0, endX: 120, endY: 0 } };
  const records = [...oldRecords, wire, relevance, line];
  const afterNative = native(records);
  const stored = records.map((entry) => entry.id === relevance.id ? Object.assign(structuredClone(entry), { body: { ...entry.body, zIndex: 0 } }) : entry);
  const input = { before: checkpoint(oldRecords), after: checkpoint(stored), expectedBefore: parseDocumentSource(beforeNative.source), expectedAfter: parseDocumentSource(afterNative.source), beforeNative, afterNative };
  const raw = JSON.stringify(input);
  const proof = verifySchematicStoragePersistence(input);
  assert.deepEqual(proof["newWireCreationOrders"], [{ id: wire.id, relevanceId: relevance.id, lines: 1, junctions: 0, danglingDots: 2, recategorized: true, zIndex: 3 }]);
  assert.equal(JSON.stringify(input), raw);
  for (const patch of [{ zIndex: 1 }, { value: "foreign" }, { x: 10 }]) {
    const wrong = stored.map((entry) => entry.id === relevance.id ? Object.assign(structuredClone(entry), { body: { ...entry.body, ...patch } }) : entry);
    assert.throws(() => verifySchematicStoragePersistence({ ...input, after: checkpoint(wrong) }));
  }
  const wrongNative = native(records.map((entry) => entry.id === relevance.id ? Object.assign(structuredClone(entry), { body: { ...entry.body, zIndex: 4 } }) : entry));
  assert.throws(() => verifySchematicStoragePersistence({ ...input, afterNative: wrongNative, expectedAfter: parseDocumentSource(wrongNative.source) }), /complete endpoint graph/u);
  const oldWithWire = [...oldRecords, wire];
  const oldNative = native(oldWithWire);
  assert.throws(() => verifySchematicStoragePersistence({ ...input, before: checkpoint(oldWithWire), beforeNative: oldNative, expectedBefore: parseDocumentSource(oldNative.source) }), /neither retained/u);
});
