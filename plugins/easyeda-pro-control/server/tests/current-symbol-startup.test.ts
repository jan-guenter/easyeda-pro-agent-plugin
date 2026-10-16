import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Json } from "../src/core.ts";
import { currentSymbolStartupExpectationSchema, selectCurrentSymbolStartupExpectation } from "../src/current-symbol-startup.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot, NativeObjectSnapshot } from "../src/native-history.ts";

const DEVICE = "d".repeat(16), FOOTPRINT = "e".repeat(16), SCH = "b".repeat(16), SHEET = "a".repeat(16), SYMBOL = "c".repeat(16);
function record(type: string, id: string, body: Record<string, unknown>): NativeObjectSnapshot { return { type, id, body, ticket: 1, client: null }; }
function withBody(entry: NativeObjectSnapshot, body: Record<string, unknown>): NativeObjectSnapshot { return { ...entry, body }; }
function document(uuid: string, docType: string, entries: readonly NativeObjectSnapshot[]): NativeDocumentSnapshot {
  return { uuid, docType, records: entries, metadata: {}, semanticSha256: sha256Json(entries) };
}
function fixture(): NativeHistorySnapshot {
  const documents = [
    document(SHEET, "SCH_PAGE", [record("META", "META", { schematic: SCH }), record("COMPONENT", "component", { partId: "sole-part", attrs: {} }),
      record("ATTR", "symbol-attr", { parentId: "component", key: "Symbol", value: SYMBOL }),
      record("ATTR", "device-attr", { parentId: "component", key: "Device", value: DEVICE })]),
    document(SCH, "SCH", [record("META", "META", {})]),
    document(SYMBOL, "SYMBOL", [record("META", "META", { docType: 2 }), record("PART", "sole-part", { title: "Only part" }),
      record("LINE", "line", { partId: "sole-part" })]),
    document(DEVICE, "DEVICE", [record("META", "META", { attributes: { Symbol: SYMBOL, Footprint: FOOTPRINT } })]),
    document(FOOTPRINT, "FOOTPRINT", [record("META", "META", {})]),
  ];
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "1".repeat(64), branchUuid: "2".repeat(32),
    headHistoryUuid: "3".repeat(32), checkpointSha256: "4".repeat(64), historyRowCount: 1, chunkCount: 1, plaintextBytes: 1,
    documents, semanticSha256: sha256Json(documents) };
}
function replace(history: NativeHistorySnapshot, uuid: string, entries: readonly NativeObjectSnapshot[]): NativeHistorySnapshot {
  return { ...history, documents: history.documents.map((value) => value.uuid === uuid ? { ...value, records: entries } : value) };
}
function records(history: NativeHistorySnapshot, uuid: string): readonly NativeObjectSnapshot[] {
  const selected = history.documents.find((entry) => entry.uuid === uuid); assert.ok(selected !== undefined); return selected.records;
}

void test("linked-sheet startup derives complete immutable template expectations, including reused symbols and empty pages", () => {
  const input = fixture();
  const history = { ...input, documents: [...input.documents, document("f".repeat(16), "SCH_PAGE", [record("META", "META", { schematic: SCH })])] };
  const expectation = selectCurrentSymbolStartupExpectation(history);
  assert.deepEqual(expectation, { sheetUuids: [SHEET, "f".repeat(16)], templates: [{ uuid: SYMBOL, docType: 2, partId: "sole-part" }] });
  assert.ok(Object.isFrozen(expectation) && Object.isFrozen(expectation.templates) && Object.isFrozen(expectation.templates[0]) && Object.isFrozen(expectation.sheetUuids));
  assert.equal(Object.hasOwn(expectation, "executionAuthorized"), false);
});

void test("startup input refuses every part-repair and implicit-reference path", () => {
  const history = fixture(), page = records(history, SHEET), symbol = records(history, SYMBOL);
  const unsupported = [
    replace(history, SHEET, page.map((entry) => entry.type === "COMPONENT" ? { ...entry, body: { ...entry.body, partId: "missing" } } : entry)),
    replace(history, SHEET, page.map((entry) => entry.type === "COMPONENT" ? { ...entry, body: { ...entry.body, attrs: { DeviceName: "override" } } } : entry)),
    replace(history, SHEET, page.filter((entry) => entry.id !== "symbol-attr")),
    replace(history, SHEET, [...page, record("ATTR", "duplicate", { parentId: "component", key: "Symbol", value: SYMBOL })]),
    replace(history, SYMBOL, [...symbol, record("PART", "other-part", {})]),
    replace(history, SYMBOL, [...symbol, record("LINE", "foreign", { partId: "other-part" })]),
    replace(history, SYMBOL, symbol.map((entry) => entry.id === "META" ? withBody(entry, { docType: 21 }) : entry)),
    replace(history, DEVICE, [record("META", "META", { attributes: { Symbol: "f".repeat(16) } })]),
    replace(history, DEVICE, [record("META", "META", { attributes: { Symbol: SYMBOL, Footprint: "f".repeat(16) } })]),
    replace(history, SHEET, page.map((entry) => entry.id === "META" ? withBody(entry, {}) : entry)),
  ];
  for (const candidate of unsupported) { assert.throws(() => selectCurrentSymbolStartupExpectation(candidate), /supported no-repair/u); }
});

void test("startup input refuses active simulation, deleted dependencies, duplicate documents and lazy-manager cases", () => {
  const history = fixture(), symbol = records(history, SYMBOL);
  assert.throws(() => selectCurrentSymbolStartupExpectation({ ...history, documents: [...history.documents, document("f".repeat(16), "SIMULATION", [])] }), /supported no-repair/u);
  assert.throws(() => selectCurrentSymbolStartupExpectation(replace(history, SYMBOL, [...symbol, record("DELETE_DOC", "DELETE_DOC", { isDelete: true })])), /supported no-repair/u);
  assert.throws(() => selectCurrentSymbolStartupExpectation({ ...history, documents: [...history.documents, document(SYMBOL, "SYMBOL", symbol)] }), /supported no-repair/u);
  assert.throws(() => selectCurrentSymbolStartupExpectation({ ...history, documents: history.documents.filter((entry) => entry.docType !== "SCH_PAGE") }));
  assert.equal(currentSymbolStartupExpectationSchema.safeParse({ sheetUuids: [SHEET, SHEET], templates: [] }).success, false);
  assert.equal(currentSymbolStartupExpectationSchema.safeParse({ sheetUuids: [SHEET], templates: [], authorize: true }).success, false);
});

void test("deleted irrelevant pages are not silently revived by startup analysis", () => {
  const history = fixture();
  const deleted = document("f".repeat(16), "SCH_PAGE", [record("META", "META", {}), record("DELETE_DOC", "DELETE_DOC", { isDelete: true })]);
  assert.deepEqual(selectCurrentSymbolStartupExpectation({ ...history, documents: [...history.documents, deleted] }), selectCurrentSymbolStartupExpectation(history));
});
