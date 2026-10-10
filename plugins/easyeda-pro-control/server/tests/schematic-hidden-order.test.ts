import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Json } from "../src/core.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "../src/document-source.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot, NativeObjectSnapshot } from "../src/native-history.ts";
import { schematicNativeSnapshotSchema } from "../src/schematic-native-adapter.ts";
import type { SchematicNativeSnapshot } from "../src/schematic-native-adapter.ts";
import { schematicHiddenNullOrder } from "../src/schematic-hidden-order.ts";
import { verifyDesignBaseline } from "../src/design-persistence.ts";
import { verifySchematicStorageBaseline, verifySchematicStoragePersistence } from "../src/schematic-storage-persistence.ts";

function document(uuid: string, docType: string, records: readonly NativeSourceObject[]): NativeDocumentSnapshot {
  const metadata = { uuid, docType, editVersion: "3.2.149.88089769" };
  const ordered = records.map((row, index) => ({ ...structuredClone(row), ticket: index + 1, client: null,
    ...(docType === "SCH_PAGE" && row.type === "ATTR" ? { firstTicket: index + 1, firstClient: null } : {}) })).toSorted((a, b) => a.id.localeCompare(b.id));
  return { uuid, docType, metadata, records: ordered, semanticSha256: sha256Json({ uuid, docType, metadata,
    records: ordered.map(({ id, type, body }) => ({ id, type, body })) }) };
}
function history(documents: readonly NativeDocumentSnapshot[]): NativeHistorySnapshot {
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "a".repeat(64), projectOwnerUuid: "b".repeat(32),
    branchUuid: "c".repeat(32), headHistoryUuid: "d".repeat(32), checkpointSha256: sha256Json(documents), historyRowCount: 1, chunkCount: 1,
    plaintextBytes: 100, documents, semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
}
const value = (name: string): string => ({ Symbol: "symbol", Device: "device", Relevance: "[]", "Unique ID": "fixture-id" }[name] ?? "fixture");
const makeAttribute = (name: string, order: number): NativeSourceObject => ({ id: `attr-${name}`, type: "ATTR", body: { key: name, value: value(name),
  parentId: "component", x: null, y: null, rotation: null, keyVisible: null, valueVisible: null, zIndex: order } });
function fixture(kind: "netflag" | "part"): {
  kind: "netflag" | "part"; key: string; native: SchematicNativeSnapshot; source: NativeSourceSnapshot; checkpoint: NativeHistorySnapshot;
  page: NativeDocumentSnapshot; symbol: NativeDocumentSnapshot; device: NativeDocumentSnapshot; target: NativeObjectSnapshot;
  stored: NativeSourceObject[]; records: NativeSourceObject[];
} {
  const key = kind === "netflag" ? "Relevance" : "Unique ID";
  const libraryKeys = kind === "netflag" ? ["Symbol", "Global Net Name", "Name"] : ["Symbol", "Designator", "Footprint"];
  const keys = [...(kind === "part" ? ["Add into BOM", "Convert to PCB"] : []), ...libraryKeys, "Device", key,
    ...(kind === "part" ? ["Name"] : []), "Description"];
  const component = { id: "component", type: "COMPONENT", body: { x: 0, y: 0, partId: "part", rotation: 0, isMirror: false, attrs: {}, zIndex: 1 } };
  const attrs = keys.map((name, index) => makeAttribute(name, 1 + index));
  const storedKeys = ["Symbol", "Device", key, ...keys.filter((name) => !["Symbol", "Device", key, "Description"].includes(name))];
  const stored = [component, ...storedKeys.map((name) => {
    const row = attrs.find((entry) => entry.body["key"] === name); assert.ok(row);
    return name === key ? Object.assign(structuredClone(row), { body: { ...row.body, zIndex: null } }) : row;
  })];
  const page = document("page", "SCH_PAGE", stored);
  const symbol = document("symbol", "SYMBOL", [
    { id: "META", type: "META", body: { docType: kind === "part" ? 2 : 18 } },
    { id: "part", type: "PART", body: {} },
    { id: "shape", type: "RECT", body: { partId: "part", zIndex: 0 } },
    ...libraryKeys.map((name, index) => ({ id: `library-${name}`, type: "ATTR", body: { partId: "part", parentId: "part", key: name, value: value(name), zIndex: index + 1 } })),
  ]);
  const device = document("device", "DEVICE", [{ id: "META", type: "META", body: { attributes: { Symbol: "symbol", Description: "fixture" } } }]);
  const records = [component, ...attrs.filter((row) => row.body["key"] !== "Description")];
  const rawSource = `${[`{"type":"DOCHEAD"}||${JSON.stringify(page.metadata)}`, ...records.map((row) => `${JSON.stringify({ type: row.type, id: row.id })}||${JSON.stringify(row.body)}`)].join("|\n")  }|\n`;
  const native = schematicNativeSnapshotSchema.parse({ profile: "easyeda-pro-control.schematic-native.v1", document: { documentUuid: "page", tabId: "page@project" }, source: rawSource,
    components: [{ id: component.id, kind, locked: false, body: component.body, pins: [], attributes: attrs.map((row) => ({ id: row.id,
      key: row.body["key"], value: row.body["value"], symbolValue: row.body["value"], blockValue: row.body["value"], instanceValue: null, body: row.body })) }] });
  const checkpoint = history([page, symbol, device]), source = parseDocumentSource(rawSource);
  const target = page.records.find((row) => row.body["key"] === key); assert.ok(target);
  return { kind, key, native, source, checkpoint, page, symbol, device, target, stored, records };
}

void test("hidden constructor null orders derive the full flag and part child sequence without changing evidence", () => {
  for (const kind of ["netflag", "part"] as const) {
    const f = fixture(kind), raw = JSON.stringify(f);
    const input = { checkpoint: f.checkpoint, source: f.source, native: f.native, targets: [{ id: f.target.id, fields: ["zIndex"] }] };
    assert.throws(() => verifyDesignBaseline(input), /baseline/u);
    const proof = verifySchematicStorageBaseline(input);
    assert.equal(proof["ok"], true);
    assert.equal(JSON.stringify(f), raw);
    const persistence = { before: f.checkpoint, after: f.checkpoint, expectedBefore: f.source, expectedAfter: f.source,
      beforeNative: f.native, afterNative: f.native };
    assert.equal(verifySchematicStoragePersistence(persistence)["ok"], true);
    const initialized = document("page", "SCH_PAGE", f.stored.map((row) => row.id === f.target.id ? f.records.find((entry) => entry.id === row.id) ?? row : row));
    assert.equal(verifySchematicStoragePersistence({ ...persistence, after: history([initialized, f.symbol, f.device]) })["ok"], true);
  }
});

void test("hidden null reconstruction rejects wrong order, peer sequence, drawing state, value, owner and library", () => {
  for (const kind of ["netflag", "part"] as const) {
    const f = fixture(kind);
    for (const patch of [{ x: 0 }, { valueVisible: true }, { value: "changed" }, { parentId: "foreign" }]) {
      const stored = f.stored.map((row) => row.id === f.target.id ? { ...row, body: { ...row.body, ...patch } } : row);
      assert.throws(() => verifySchematicStorageBaseline({ checkpoint: history([document("page", "SCH_PAGE", stored), f.symbol, f.device]),
        source: f.source, native: f.native, targets: [{ id: f.target.id, fields: ["zIndex"] }] }));
    }
    const changedNative = structuredClone(f.native), model = changedNative.components[0]; assert.ok(model);
    const peer = model.attributes.find((attr) => attr.key === "Description"); assert.ok(peer); peer.body["zIndex"] = 99;
    assert.throws(() => schematicHiddenNullOrder(f.checkpoint, f.page, f.source, changedNative, f.target), /library reconstruction/u);
    const wrongOrder = structuredClone(f.native), wrongOwner = wrongOrder.components[0]; assert.ok(wrongOwner);
    const targetAttr = wrongOwner.attributes.find((attr) => attr.id === f.target.id); assert.ok(targetAttr); targetAttr.body["zIndex"] = 99;
    assert.throws(() => schematicHiddenNullOrder(f.checkpoint, f.page, f.source, wrongOrder, f.target), /library reconstruction/u);
    const changedSymbol = document("symbol", "SYMBOL", f.symbol.records.filter((row) => row.id !== "shape"));
    assert.throws(() => schematicHiddenNullOrder(history([f.page, changedSymbol, f.device]), f.page, f.source, f.native, f.target), /library reconstruction/u);
    const changedTickets = structuredClone(f.page), first = changedTickets.records[0], second = changedTickets.records[1]; assert.ok(first && second);
    Object.assign(first, { firstTicket: second.firstTicket, firstClient: second.firstClient });
    assert.throws(() => schematicHiddenNullOrder(f.checkpoint, changedTickets, f.source, f.native, f.target), /library reconstruction/u);
  }
});

void test("hidden order follows exact first-clock lexical client ties, never refreshed tickets or ambiguous clients", () => {
  const f = fixture("netflag"), page = structuredClone(f.page);
  const device = page.records.find((row) => row.body["key"] === "Device"), relevance = page.records.find((row) => row.id === f.target.id);
  assert.ok(device && relevance);
  Object.assign(device, { ticket: 50, firstTicket: 3, firstClient: "Z" });
  Object.assign(relevance, { firstTicket: 3, firstClient: "a" });
  assert.equal(schematicHiddenNullOrder(f.checkpoint, page, f.source, f.native, relevance).order, 5);
  Object.assign(relevance, { firstClient: null });
  assert.throws(() => schematicHiddenNullOrder(f.checkpoint, page, f.source, f.native, relevance), /library reconstruction/u);
  Reflect.deleteProperty(relevance, "firstClient");
  assert.throws(() => schematicHiddenNullOrder(f.checkpoint, page, f.source, f.native, relevance), /library reconstruction/u);
});

void test("null style overrides inherit exact bound library fields and never conceal new style writes", () => {
  const f = fixture("part");
  const stored = f.stored.map((row) => row.body["key"] === "Symbol" ? Object.assign(structuredClone(row), { body: { ...row.body, fontSize: null, fontWeight: null } }) : row);
  const records = f.records.map((row) => row.body["key"] === "Symbol" ? Object.assign(structuredClone(row), { body: { ...row.body, fontSize: 6.75, fontWeight: false } }) : row);
  const library = f.symbol.records.map((row) => row.body["key"] === "Symbol" ? Object.assign(structuredClone(row), { body: { ...row.body, fontSize: 6.75, fontWeight: false } }) : row);
  const symbol = document("symbol", "SYMBOL", [...library, { id: "CANVAS", type: "CANVAS", body: { originX: 0, originY: 0 } }]);
  const checkpoint = history([document("page", "SCH_PAGE", stored), symbol, f.device]), native = structuredClone(f.native);
  const attr = native.components[0]?.attributes.find((entry) => entry.key === "Symbol"); assert.ok(attr);
  Object.assign(attr.body, { fontSize: 6.75, fontWeight: false });
  native.source = `${[`{"type":"DOCHEAD"}||${JSON.stringify(f.page.metadata)}`, ...records.map((row) => `${JSON.stringify({ type: row.type, id: row.id })}||${JSON.stringify(row.body)}`)].join("|\n")}|\n`;
  const source = parseDocumentSource(native.source);
  assert.equal(verifySchematicStorageBaseline({ checkpoint, source, native, targets: [{ id: attr.id, fields: ["fontSize"] }] })["ok"], true);
  const input = { before: checkpoint, after: checkpoint, expectedBefore: source, expectedAfter: source, beforeNative: native, afterNative: native };
  assert.equal(verifySchematicStoragePersistence(input)["ok"], true);
  const initializedRows = stored.map((row) => row.id === attr.id ? Object.assign(structuredClone(row), { body: { ...row.body, fontSize: 6.75, fontWeight: false } }) : row);
  const initialized = history([document("page", "SCH_PAGE", initializedRows), symbol, f.device]);
  assert.equal(verifySchematicStoragePersistence({ ...input, after: initialized })["ok"], true);
  assert.throws(() => verifySchematicStoragePersistence({ ...input, before: initialized }), /neither retained/u);
  const wrongRows = stored.map((row) => row.id === attr.id ? Object.assign(structuredClone(row), { body: { ...row.body, fontSize: 6.76 } }) : row);
  assert.throws(() => verifySchematicStoragePersistence({ ...input, after: history([document("page", "SCH_PAGE", wrongRows), symbol, f.device]) }), /library reconstruction/u);
});
