import assert from "node:assert/strict";
import { test } from "node:test";
import { sha256Json } from "../src/core.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "../src/document-source.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";
import { verifySymbolPersistence } from "../src/symbol-persistence.ts";

const USER = { uuid: "44".repeat(16), username: "fixture", nickname: "fixture", avatar: "" };
const PART = { id: "part", type: "PART", body: { title: "Fixture" } };
const ATTR = { id: "attr", type: "ATTR", body: { partId: "part", parentId: "part", key: "Designator", value: "R?", x: -20, y: -5, locked: false, zIndex: 1 } };
const PIN = { id: "pin", type: "PIN", body: { partId: "part", x: 20, y: 0, length: 10, locked: false, zIndex: 2 } };
function source(objects: readonly NativeSourceObject[]): NativeSourceSnapshot {
  const base = { schema: "easyeda-pro-control.document-source.v1" as const, document: { uuid: "symbol", docType: "SYMBOL", editVersion: "3.2.149.88089769" }, objects: objects.toSorted((a, b) => a.id.localeCompare(b.id)) };
  return { ...base, sha256: sha256Json(base) };
}
function checkpoint(records: readonly NativeSourceObject[], options: { user?: unknown; otherValue?: string } = {}): NativeHistorySnapshot {
  const symbol = { uuid: "symbol", docType: "SYMBOL", metadata: { ...source([]).document, ...(options.user === undefined ? {} : { user: options.user }) }, records };
  const other = { uuid: "other", docType: "FOOTPRINT", metadata: { uuid: "other", docType: "FOOTPRINT", user: USER },
    records: [{ id: "line", type: "LINE", body: { value: options.otherValue ?? "preserve" } }] };
  const documents = [symbol, other].map((document) => Object.assign(structuredClone(document), { records: document.records.map((record) => Object.assign(structuredClone(record), { ticket: 1, client: null })), semanticSha256: sha256Json(document) }));
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "11".repeat(32), projectOwnerUuid: USER.uuid, branchUuid: "22".repeat(16), headHistoryUuid: "33".repeat(16),
    checkpointSha256: sha256Json(documents), historyRowCount: 1, chunkCount: 1, plaintextBytes: 100, documents,
    semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
}

void test("symbol storage admits only complete source-bound legacy encoder conversions and retains raw commitments", () => {
  const expectedBefore = source([PART, ATTR, PIN]);
  const expectedAfter = source([...expectedBefore.objects,
    { id: "circle", type: "CIRCLE", body: { partId: "part", centerX: 40, centerY: -40, radius: 5, zIndex: 3 } }]);
  const legacy = [PART, { ...ATTR, body: { ...ATTR.body, groupId: "", version: "2.0", parentId: "" } }, { ...PIN, body: { ...PIN.body, groupId: "" } }];
  const input = { before: checkpoint(legacy), after: checkpoint(expectedAfter.objects, { user: USER }), expectedBefore, expectedAfter };
  const proof = verifySymbolPersistence(input);
  assert.equal(proof["ok"], true);
  assert.equal(proof["beforeSemanticSha256"], input.before.semanticSha256);
  assert.equal(proof["beforeSourceSha256"], expectedBefore.sha256);
  assert.notEqual(proof["comparisonBeforeSemanticSha256"], input.before.semanticSha256);
  const conversions = proof["conversions"];
  assert.ok(Array.isArray(conversions));
  assert.equal(conversions.length, 2);
  for (const altered of [
    expectedAfter.objects.map((record) => record.id === ATTR.id ? { ...record, body: { ...record.body, value: "changed" } } : record),
    expectedAfter.objects.map((record) => record.id === PIN.id ? { ...record, body: { ...record.body, x: 21 } } : record),
  ]) { assert.throws(() => verifySymbolPersistence({ ...input, after: checkpoint(altered, { user: USER }) }), /unchanged.*durable record/u); }
  assert.throws(() => verifySymbolPersistence({ ...input, after: checkpoint(expectedAfter.objects, { user: USER, otherValue: "prior-delayed-inverse" }) }), /Another document/u);
  assert.throws(() => verifySymbolPersistence({ ...input, before: checkpoint(legacy.map((record) => record.id === ATTR.id ? Object.assign(structuredClone(record), { body: { ...record.body, version: "unreviewed" } }) : record)) }), /complete captured model/u);
  assert.throws(() => verifySymbolPersistence({ ...input, after: checkpoint(expectedAfter.objects, { user: { ...USER, nickname: "changed" } }) }), /same-owner baseline/u);
});
