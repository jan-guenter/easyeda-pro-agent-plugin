import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { z } from "zod";
import { sha256Json } from "../src/core.ts";
import { buildDesignBatchAdapter, compileDesignBatchOperation, designBatchOperationSchema, expectedDesignBatchSource, inverseDesignBatchOperation, verifyDesignBatchSourceEffect } from "../src/design-batch-adapter.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "../src/document-source.ts";

function snapshot(objects: readonly NativeSourceObject[]): NativeSourceSnapshot {
  const value = { schema: "easyeda-pro-control.document-source.v1" as const,
    document: { uuid: "fixture", docType: "PCB", editVersion: "3.2.149.88089769" },
    objects: objects.toSorted((left, right) => left.id.localeCompare(right.id)) };
  return { ...value, sha256: sha256Json(value) };
}
function component(id: string, x: number, locked = false): NativeSourceObject {
  return { id, type: "COMPONENT", body: { partitionId: "", groupId: 0, layerId: 1, x, y: 10, angle: 0, attrs: { "Unique ID": id }, locked, zIndex: -1 } };
}
const A = component("component-a", 10);
const B = component("component-b", 100);
const LABEL: NativeSourceObject = { id: "label-a", type: "ATTR", body: { parentId: A.id, layerId: 3, x: 12, y: 15, angle: 0, key: "Designator", value: "R1", locked: false, mirror: false } };
const OPAQUE: NativeSourceObject = { id: "opaque", type: "FUTURE_RECORD", body: { preserve: { nested: [1, 2, 3] } } };
const BEFORE = snapshot([A, B, LABEL, OPAQUE, component("locked-anchor", 200, true)]);
const MOVE = { id: "move-a", action: "pcb.component.modify", target: { primitiveId: A.id }, patch: { x: 20 } };
const BATCH = { id: "placement", action: "pcb.batch", operations: [MOVE,
  { id: "move-b", action: "pcb.component.modify", target: { primitiveId: B.id }, patch: { y: 30 } },
  { id: "move-a-again", action: "pcb.component.modify", target: { primitiveId: A.id }, patch: { x: 25 } }] };
const CREATE = { id: "new-line", action: "pcb.line.create", properties: { net: "", layer: 1, startX: 0, startY: 0, endX: 10, endY: 20, lineWidth: 6, primitiveLock: false } };

function source(state: NativeSourceSnapshot): string {
  return `{"type":"DOCHEAD"}||${JSON.stringify({ ...state.document, client: "0123456789abcdef", updateTime: 100, version: "100" })}|\n${
    state.objects.map((object, index) => `${JSON.stringify({ type: object.type, id: object.id, ticket: index + 1 })}||${JSON.stringify(object.body)}|\n`).join("")}`;
}

void test("placement batch validates sequential component/attribute changes and invokes one guarded native merge", async () => {
  const adapter = buildDesignBatchAdapter(BATCH, BEFORE);
  assert.equal(compileDesignBatchOperation(BATCH).resultKind, "boolean");
  assert.deepEqual(adapter.createdIds, {});
  assert.equal(adapter.stepProofs.length, 3);
  assert.equal(adapter.stepProofs[0]?.afterSha256, adapter.stepProofs[1]?.beforeSha256);
  assert.equal(adapter.stepProofs[1]?.afterSha256, adapter.stepProofs[2]?.beforeSha256);
  const calls: string[] = [];
  const result: unknown = runInNewContext(`(async()=>{const EXPECTED_DOCUMENT_UUID='fixture',EXPECTED_TAB_ID='tab',EXPECTED_DOCUMENT_TYPE=3;${adapter.code}})()`, { eda: {
    dmt_SelectControl: { getCurrentDocumentInfo: () => Promise.resolve({ uuid: "fixture", tabId: "tab", documentType: 3 }) },
    sys_FileManager: { getDocumentSource: () => Promise.resolve(source(BEFORE)), setDocumentSource: (next: string) => { calls.push(next); return Promise.resolve(true); } },
  } });
  assert.equal(await result, true);
  assert.equal(calls.length, 1);
  const saved = calls[0];
  assert.notEqual(saved, undefined);
  const after = parseDocumentSource(saved ?? "");
  assert.equal(after.sha256, adapter.expected.sha256);
  assert.equal(after.objects.find((object) => object.id === A.id)?.body["x"], 25);
  assert.equal(after.objects.find((object) => object.id === LABEL.id)?.body["x"], 27);
  const delta = verifyDesignBatchSourceEffect(BATCH, BEFORE, after);
  assert.deepEqual(delta.changed.map((entry) => entry.after.id), [A.id, B.id, LABEL.id]);
  const inverse = inverseDesignBatchOperation(BATCH, BEFORE);
  assert.ok(inverse);
  assert.equal(expectedDesignBatchSource(inverse, after).sha256, BEFORE.sha256);
});

void test("created IDs are facade-allocated once and reused by prior result references, readback and inverse", () => {
  const batch = { id: "create-route", action: "pcb.batch", operations: [CREATE,
    { id: "widen", action: "pcb.line.modify", target: { resultOf: CREATE.id }, patch: { lineWidth: 8 } }] };
  const adapter = buildDesignBatchAdapter(batch, BEFORE);
  const createdId = adapter.createdIds[CREATE.id];
  assert.match(createdId ?? "", /^[a-f0-9]{16}$/u);
  assert.equal(adapter.stepProofs[1]?.targetId, createdId);
  assert.equal(adapter.expected.objects.find((object) => object.id === createdId)?.body["width"], 8);
  assert.equal(buildDesignBatchAdapter(batch, BEFORE, adapter.createdIds).code, adapter.code);
  assert.equal(verifyDesignBatchSourceEffect(batch, BEFORE, adapter.expected, adapter.createdIds).added.length, 1);
  const inverse = inverseDesignBatchOperation(batch, BEFORE, adapter.createdIds);
  assert.ok(inverse);
  assert.deepEqual(inverse.operations.map((operation) => operation.action), ["pcb.line.modify", "pcb.line.delete"]);
  assert.equal(expectedDesignBatchSource(inverse, adapter.expected).sha256, BEFORE.sha256);
  assert.throws(() => expectedDesignBatchSource(batch, BEFORE), /exact journal-owned/u);
  assert.throws(() => verifyDesignBatchSourceEffect(batch, BEFORE, adapter.expected, { [CREATE.id]: "ab".repeat(8) }), /differs/u);
});

void test("mapping gaps, surplus keys, duplicate native IDs and existing IDs are rejected", () => {
  const batch = { id: "create-two", action: "pcb.batch", operations: [CREATE, { ...CREATE, id: "second" }] };
  for (const ids of [{}, { "new-line": "ab".repeat(8) }, { "new-line": "ab".repeat(8), second: "ab".repeat(8) },
    { "new-line": "ab".repeat(8), second: "cd".repeat(8), extra: "ef".repeat(8) }, { "new-line": "not-a-native-id", second: "cd".repeat(8) }]) {
    assert.throws(() => buildDesignBatchAdapter(batch, BEFORE, ids), /mapping|identity/u);
  }
  const existing = snapshot([...BEFORE.objects, { id: "ab".repeat(8), type: "OPAQUE", body: {} }]);
  assert.throws(() => buildDesignBatchAdapter(batch, existing, { "new-line": "ab".repeat(8), second: "cd".repeat(8) }), /already present/u);
});

void test("reference order, family, uniqueness, operation bounds and raw source/code input are schema checked", () => {
  for (const operations of [[MOVE, MOVE],
    [{ id: "early", action: "pcb.line.modify", target: { resultOf: CREATE.id }, patch: { lineWidth: 8 } }, CREATE],
    [CREATE, { id: "wrong-family", action: "pcb.component.modify", target: { resultOf: CREATE.id }, patch: { x: 3 } }],
    [{ id: "copper", action: "pcb.pour.rebuild", target: { primitiveId: "pour" } }], [],
    Array.from({ length: 257 }, (_, index) => ({ ...MOVE, id: `move-${index}` }))]) {
    assert.equal(designBatchOperationSchema.safeParse({ id: "bad", action: "pcb.batch", operations }).success, false);
  }
  assert.equal(designBatchOperationSchema.safeParse({ ...BATCH, code: "caller-code" }).success, false);
  assert.equal(designBatchOperationSchema.safeParse({ ...BATCH, source: "caller-source" }).success, false);
  const maximum = { id: "max", action: "pcb.batch", operations: Array.from({ length: 256 }, (_, index) => ({ ...MOVE, id: `move-${index}`, patch: { x: index + 1 } })) };
  assert.equal(expectedDesignBatchSource(maximum, BEFORE).objects.find((object) => object.id === A.id)?.body["x"], 256);
  assert.doesNotThrow(() => z.toJSONSchema(designBatchOperationSchema, { io: "input" }));
});

void test("initial locks and locked descendants cannot be bypassed by explicit unlock steps inside a batch", () => {
  const unlock = { id: "unlock", action: "pcb.component.modify", target: { primitiveId: "locked-anchor" }, patch: { primitiveLock: false } };
  assert.throws(() => buildDesignBatchAdapter({ id: "unlock-move", action: "pcb.batch", operations: [unlock,
    { id: "move-anchor", action: "pcb.component.modify", target: unlock.target, patch: { x: 300 } }] }, BEFORE), /initially locked/u);
  const lockedChild = snapshot(BEFORE.objects.map((object) => object.id === LABEL.id ? { ...object, body: { ...object.body, locked: true } } : object));
  assert.throws(() => buildDesignBatchAdapter(BATCH, lockedChild), /initially locked/u);
  const locking = { id: "lock-created-state", action: "pcb.batch", operations: [{ ...MOVE, patch: { primitiveLock: true } }] };
  assert.equal(inverseDesignBatchOperation(locking, BEFORE), undefined);
});

void test("unrelated source changes, corrupt hashes and invalid late steps reject the whole batch", () => {
  const adapter = buildDesignBatchAdapter(BATCH, BEFORE);
  const altered = snapshot(adapter.expected.objects.map((object) => object.id === OPAQUE.id ? { id: object.id, type: object.type, body: { changed: true } } : object));
  assert.throws(() => verifyDesignBatchSourceEffect(BATCH, BEFORE, altered), /unrelated/u);
  assert.throws(() => buildDesignBatchAdapter(BATCH, { ...BEFORE, sha256: "00".repeat(32) }), /hash/u);
  assert.throws(() => buildDesignBatchAdapter({ ...BATCH, operations: [...BATCH.operations, { id: "unsupported", action: "pcb.component.create",
    properties: { libraryUuid: "caller-cannot-add-source" } }] }, BEFORE));
  const withCopper = snapshot([...BEFORE.objects, { id: "derived", type: "POURED", body: {} }]);
  assert.throws(() => buildDesignBatchAdapter(BATCH, withCopper), /POURED/u);
});

void test("deletion batches do not claim UUID-preserving inverse or automatic checkpoint restoration", () => {
  const created = buildDesignBatchAdapter({ id: "seed", action: "pcb.batch", operations: [CREATE] }, BEFORE);
  const createdId = created.createdIds[CREATE.id];
  assert.notEqual(createdId, undefined);
  const removal = { id: "remove", action: "pcb.batch", operations: [{ id: "delete-line", action: "pcb.line.delete", target: { primitiveId: createdId } }] };
  assert.equal(expectedDesignBatchSource(removal, created.expected).sha256, BEFORE.sha256);
  assert.equal(inverseDesignBatchOperation(removal, created.expected), undefined);
});
