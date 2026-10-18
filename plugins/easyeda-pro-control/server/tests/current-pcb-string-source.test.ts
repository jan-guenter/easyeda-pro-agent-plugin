import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Text } from "../src/core.ts";
import { correlateCurrentPcbStringSource, parseCurrentPcbStringSource } from "../src/current-pcb-string-source.ts";

const branchUuid = "b".repeat(32), documentUuid = "c".repeat(16), projectUuid = "a".repeat(64);
const target = { projectUuid, branchUuid, documentUuid, tabId: `${documentUuid}@${projectUuid}` };
const firstId = "d".repeat(16), secondId = "e".repeat(16);
const body = { partitionId: "", groupId: 0, layerId: 3, x: 12.3457, y: -23.4568, text: "Text Ω={Value}\n\"label\"",
  fontFamily: "default", fontSize: 120, strokeWidth: 8, bold: 0, italic: 0, origin: "LEFT_BOTTOM", angle: 45,
  reverse: false, expansion: 0, mirror: false, locked: false, zIndex: -1, specialColor: "#000000" };
const row = { primitiveId: firstId, primitiveType: "String", primitiveLock: false, layer: 3,
  x: 1.234567 * 10, y: -2.345678 * 10, text: body.text, fontFamily: "default", fontSize: 120,
  lineWidth: 8, alignMode: 3, rotation: 45, reverse: false, expansion: 0, mirror: false,
  key: "", showKey: false, showValue: true, positionIsNull: false, silkColor: "#000000" };
function record(header: Record<string, unknown>, value: Record<string, unknown>): string {
  return `${JSON.stringify(header)}||${JSON.stringify(value)}|\n`;
}
function source(patch: Record<string, unknown> = {}, extra = ""): string {
  const framed = record({ type: "DOCHEAD" }, { docType: "PCB", uuid: documentUuid, editVersion: "3.2.193.682ed44e",
    client: "f".repeat(16), version: "100", updateTime: 100, unknownHeaderData: { retained: true } }) +
    record({ type: "CANVAS", id: "CANVAS", ticket: 1 }, { x: 0, y: 0, opaque: [1, "retain", null] }) +
    record({ type: "STRING", id: firstId, ticket: 2, unknownHeader: "keep" }, { ...body, ...patch }) + extra;
  return framed.slice(0, -2);
}
function geometry(rows: Record<string, unknown>[], selected = false): Record<string, unknown> {
  return { ok: true, kind: "current-pcb-geometry-observation", method: selected ? "eda.pcb_PrimitiveString.get" : "eda.pcb_PrimitiveString.getAll",
    target, rows, samples: 2, implementationKind: "native-task-equivalent", cadAuthority: false,
    persistenceVerified: false, sourceMembershipVerified: false, ...(selected ? { observedRowCount: 1 } : {}) };
}
function evidence(rows: Record<string, unknown>[] = [row]): { identities: Record<string, unknown>; all: Record<string, unknown>; selected: Record<string, unknown> } {
  return { identities: { ok: true, kind: "current-pcb-identity-observation", method: "eda.pcb_PrimitiveString.getAllPrimitiveId",
    target, observations: [{ family: "String", ids: rows.map(value => value["primitiveId"]) }], samples: 2,
    implementationKind: "native-task-equivalent", cadAuthority: false, persistenceVerified: false, sourceMembershipVerified: false },
  all: geometry(rows), selected: { primitiveIds: [firstId], result: geometry([rows[0] ?? row], true) } };
}

void test("current STRING parser retains raw source, headers, unknown body fields and peer order", () => {
  const original = source({ futureField: { retained: [false, null, "raw"] }, toJSON: "inert data" });
  const parsed = parseCurrentPcbStringSource(original, documentUuid);
  assert.equal(parsed.source, original); assert.equal(parsed.sourceSha256, sha256Text(original));
  assert.deepEqual(parsed.records.map(value => value.header["type"]), ["DOCHEAD", "CANVAS", "STRING"]);
  assert.equal(parsed.records.map(value => value.raw).join("|\n"), original);
  assert.equal(parsed.records[0]?.body["client"], "f".repeat(16));
  assert.equal(parsed.records[2]?.header["unknownHeader"], "keep");
  assert.deepEqual(parsed.strings[0]?.body["futureField"], { retained: [false, null, "raw"] });
  assert.equal(parsed.strings[0]?.body["toJSON"], "inert data");
  assert.equal(parsed.strings[0]?.body, parsed.records[2]?.body);
  assert.ok(Object.isFrozen(parsed.records[2]?.body)); assert.ok(Object.isFrozen(parsed.strings));
  assert.equal(parsed.executionAuthorized, false);
});

void test("current STRING relation correlates all three existing readers without issuing authority", () => {
  const result = correlateCurrentPcbStringSource(source({ futureField: "preserved" }), target, evidence());
  assert.equal(result["stringCount"], 1); assert.equal(result["selectedReaderCompared"], true);
  assert.equal(result["sourceSha256"], sha256Text(source({ futureField: "preserved" })));
  assert.deepEqual(result["sourceStringOrder"], [firstId]); assert.deepEqual(result["readerStringOrder"], [firstId]);
  for (const field of ["completeSourceProvenanceVerified", "liveReceiverVerified", "parentOwnershipVerified", "renderingVerified",
    "persistenceVerified", "writerSupported", "executionAuthorized"]) { assert.equal(result[field], false); }
  assert.equal(result["unknownFieldsPreserved"], true);
  assert.equal(result["rawModelColorVerified"], false);
  assert.deepEqual(result["readerOnlyFields"], ["key", "showKey", "showValue", "positionIsNull"]);
});

void test("current STRING relation preserves source order separately from native reader order", () => {
  const second = { ...row, primitiveId: secondId }; const observations = evidence([second, row]);
  observations.selected = { primitiveIds: [firstId, secondId], result: { ...geometry([row, second], true), observedRowCount: 2 } };
  const result = correlateCurrentPcbStringSource(source({}, record({ type: "STRING", id: secondId, ticket: 3 }, body)), target, observations);
  assert.deepEqual(result["sourceStringOrder"], [firstId, secondId]); assert.deepEqual(result["readerStringOrder"], [secondId, firstId]);
});

void test("current STRING relation supports the nine explicit alignment encodings", () => {
  const names = ["LEFT_TOP", "LEFT_MIDDLE", "LEFT_BOTTOM", "CENTER_TOP", "CENTER_MIDDLE", "CENTER_BOTTOM", "RIGHT_TOP", "RIGHT_MIDDLE", "RIGHT_BOTTOM"];
  for (const [index, origin] of names.entries()) {
    const projected = { ...row, alignMode: index + 1 };
    assert.equal(correlateCurrentPcbStringSource(source({ origin }), target, evidence([projected]))["stringCount"], 1);
  }
});

void test("current STRING relation compares serialized silkscreen color without collapsing null and black", () => {
  const black = parseCurrentPcbStringSource(source(), documentUuid); const absent = parseCurrentPcbStringSource(source({ specialColor: null }), documentUuid);
  assert.notEqual(black.sourceSha256, absent.sourceSha256);
  assert.equal(black.strings[0]?.body.specialColor, "#000000"); assert.equal(absent.strings[0]?.body.specialColor, null);
  const first = correlateCurrentPcbStringSource(black.source, target, evidence());
  const second = correlateCurrentPcbStringSource(absent.source, target, evidence([{ ...row, silkColor: null }]));
  assert.notEqual(first["sourceSha256"], second["sourceSha256"]);
  assert.deepEqual(first["omittedReaderFields"], second["omittedReaderFields"]);
  assert.throws(() => correlateCurrentPcbStringSource(black.source, target, evidence([{ ...row, silkColor: null }])));
  assert.throws(() => correlateCurrentPcbStringSource(absent.source, target, evidence()));
  assert.equal(correlateCurrentPcbStringSource(source({ layerId: 1, specialColor: null }), target,
    evidence([{ ...row, layer: 1 }]))["colorRelation"], "silkscreen-serialized-color-exact;other-layers-encode-null");
});

void test("current STRING source rejects missing fields, ambiguous ownership and unsupported encoding", () => {
  const patches = [{ partitionId: "partition" }, { groupId: 1 }, { parentId: "" }, { componentId: firstId }, { groupID: 0 },
    { positionIsNull: false }, { key: "" }, { showValue: true }, { x: null }, { x: 1.234567 }, { origin: "UNKNOWN" },
    { layerId: 1.5 }, { layerId: 1 }, { bold: 1 }, { italic: 1 }, { locked: 0 }, { zIndex: -2 }, { specialColor: "" },
    { text: "x".repeat(65_537) }, { fontFamily: "x".repeat(1025) }];
  for (const patch of patches) { assert.throws(() => parseCurrentPcbStringSource(source(patch), documentUuid)); }
  for (const field of Object.keys(body)) { assert.throws(() => parseCurrentPcbStringSource(source({ [field]: undefined }), documentUuid)); }
  for (const type of ["DOCHEAD", "EDIT_HEAD", "DELETE", "DELETE_DOC", "GROUP", "PARTITION"]) {
    assert.throws(() => parseCurrentPcbStringSource(source({}, record({ type, id: "extra", ticket: 3 }, {})), documentUuid));
  }
  assert.throws(() => parseCurrentPcbStringSource(source({}, record({ type: "ATTR", id: firstId, ticket: 3 }, {})), documentUuid));
});

void test("current STRING source refuses lossy raw framing and duplicate JSON keys", () => {
  const original = source();
  for (const malformed of [original.slice(0, -2), `${original}|\n`, original.replace('"x":12.3457', '"x":1,"x":12.3457'),
    original.replace('"x":12.3457', '"x":12.34570'), original.replace('"y":-23.4568', '"y":-0'),
    original.replace('"groupId":0', '"groupId":1e999'), original.replace('"docType":"PCB"', '"docType":"FOOTPRINT"'),
    original.replace('"ticket":2', '"ticket":-1'), original.replace('"ticket":2', '"ticket":0.5'),
    original.replace('"origin":"LEFT_BOTTOM"', '"origin":"LEFT_BOTTOM","origin":"LEFT_BOTTOM"')]) {
    assert.throws(() => parseCurrentPcbStringSource(malformed, documentUuid));
  }
  assert.throws(() => parseCurrentPcbStringSource(original, secondId));
});

void test("current STRING relation refuses every projected-field contradiction", () => {
  const patches = [{ primitiveLock: true }, { layer: 4 }, { x: 13 }, { y: 24 }, { text: "other" }, { fontFamily: "other" },
    { fontSize: 121 }, { lineWidth: 9 }, { alignMode: 2 }, { rotation: 46 }, { reverse: true }, { expansion: 1 }, { mirror: true }];
  for (const patch of patches) { assert.throws(() => correlateCurrentPcbStringSource(source(), target, evidence([{ ...row, ...patch }]))); }
  assert.throws(() => correlateCurrentPcbStringSource(source(), target, evidence([{ ...row, rotation: 45.00005 }])));
});

void test("current STRING relation rejects incomplete, duplicate, wrong-target or contradictory reader families", () => {
  for (const mutate of [
    (value: ReturnType<typeof evidence>): void => { value.all = geometry([]); },
    (value: ReturnType<typeof evidence>): void => { value.all = geometry([row, row]); },
    (value: ReturnType<typeof evidence>): void => { value.all["target"] = { ...target, branchUuid: "9".repeat(32) }; },
    (value: ReturnType<typeof evidence>): void => { value.identities["observations"] = [{ family: "String", ids: [secondId] }]; },
    (value: ReturnType<typeof evidence>): void => { value.selected["result"] = { ...geometry([row], true), observedRowCount: 2 }; },
    (value: ReturnType<typeof evidence>): void => { value.selected["result"] = geometry([{ ...row, text: "changed" }], true); },
    (value: ReturnType<typeof evidence>): void => { value.selected["primitiveIds"] = [firstId, firstId]; },
    (value: ReturnType<typeof evidence>): void => { value.selected["result"] = geometry([{ ...row, primitiveId: secondId }], true); },
  ]) { const value = evidence(); mutate(value); assert.throws(() => correlateCurrentPcbStringSource(source(), target, value)); }
});

void test("current STRING relation refuses getters, toJSON functions, cycles and sparse arrays without invoking them", () => {
  let calls = 0;
  const getter = evidence(); Object.defineProperty(getter.all, "rows", { get() { calls += 1; return [row]; }, enumerable: true });
  const coercion = evidence(); coercion.all["toJSON"] = (): never => { calls += 1; throw new Error("called"); };
  const cycle = evidence(); cycle.all["cycle"] = cycle;
  const sparse = evidence(); const sparseRows = [row, row]; Reflect.deleteProperty(sparseRows, "0"); sparse.all["rows"] = sparseRows;
  for (const value of [getter, coercion, cycle, sparse]) { assert.throws(() => correlateCurrentPcbStringSource(source(), target, value)); }
  const maskedHole = evidence(); const maskedRows = [row, row]; Reflect.deleteProperty(maskedRows, "0");
  Object.defineProperty(maskedRows, "4294967295", { value: row, enumerable: true }); maskedHole.all["rows"] = maskedRows;
  assert.throws(() => correlateCurrentPcbStringSource(source(), target, maskedHole), /unsupported JSON field/u);
  assert.equal(calls, 0);
});

void test("current STRING source and relation bound input depth, bytes and family size", () => {
  let nested: unknown = true; for (let index = 0; index < 34; index += 1) { nested = { nested }; }
  assert.throws(() => parseCurrentPcbStringSource(source({ future: nested }), documentUuid));
  assert.throws(() => parseCurrentPcbStringSource(source({ future: "x".repeat(8_388_608) }), documentUuid));
  const extras = Array.from({ length: 256 }, (_, index) => record({ type: "STRING", id: index.toString(16).padStart(16, "0"), ticket: index + 3 }, body)).join("");
  assert.throws(() => parseCurrentPcbStringSource(source({}, extras), documentUuid));
  const oversized = evidence([{ ...row, text: "x".repeat(65_537) }]);
  assert.throws(() => correlateCurrentPcbStringSource(source(), target, oversized));
});

void test("current STRING relation bounds expanded shared data before whole-object serialization", context => {
  const shared = { ...row, text: "\0".repeat(100_000) };
  const observations = evidence([shared, shared, shared]), original = source();
  const serialize = JSON.stringify; let wholeObjectCalls = 0;
  context.mock.method(JSON, "stringify", (value: unknown): string | undefined => {
    if (value === observations) { wholeObjectCalls += 1; }
    return serialize(value);
  });
  assert.throws(() => correlateCurrentPcbStringSource(original, target, observations), /JSON byte bound exceeded/u);
  assert.equal(wholeObjectCalls, 0);
});
