import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { webcrypto } from "node:crypto";
import { sha256Json } from "../src/core.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "../src/document-source.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";
import { SCHEMATIC_NATIVE_PROFILE } from "../src/schematic-native-adapter.ts";
import type { SchematicNativeSnapshot } from "../src/schematic-native-adapter.ts";
import { expectedSchematicLayout, verifySchematicLayoutBaseline, verifySchematicLayoutBaselineCooperatively,
  verifySchematicLayoutPersistence, verifySchematicLayoutPersistenceCooperatively as verifySchematicLayoutPersistenceAsync } from "../src/schematic-layout-batch.ts";
import { inverseDesignAction, inverseDesignActionCooperatively as inverseDesignActionAsync, prepareDesignAction, prepareDesignActionCooperatively as prepareDesignActionAsync,
  verifyDesignAction, verifyDesignActionCooperatively as verifyDesignActionAsync } from "../src/design-action.ts";

function source(objects: readonly NativeSourceObject[]): NativeSourceSnapshot {
  const value = { schema: "easyeda-pro-control.document-source.v1" as const,
    document: { docType: "SCH_PAGE", uuid: "page", editVersion: "3.2.149.88089769" }, objects: objects.toSorted((a, b) => a.id.localeCompare(b.id)) };
  return { ...value, sha256: sha256Json(value) };
}
function encode(value: NativeSourceSnapshot): string {
  return `{"type":"DOCHEAD"}||${JSON.stringify(value.document)}|\n${value.objects.map((row) => `${JSON.stringify({ type: row.type, id: row.id })}||${JSON.stringify(row.body)}`).join("|\n")}|\n`;
}
function history(snapshot: NativeSourceSnapshot, peerValue = "unchanged"): NativeHistorySnapshot {
  const target = { uuid: "page", docType: "SCH_PAGE", metadata: snapshot.document, records: snapshot.objects };
  const peer = { uuid: "peer", docType: "CONFIG", metadata: { uuid: "peer", docType: "CONFIG" },
    records: [{ id: "entry", type: "META", body: { value: peerValue } }] };
  const documents = [target, peer].map((document) => Object.assign(structuredClone(document), {
    records: document.records.map((row) => Object.assign(structuredClone(row), { ticket: 1, client: null })), semanticSha256: sha256Json(document) }));
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), headHistoryUuid: "c".repeat(32),
    checkpointSha256: sha256Json(documents), historyRowCount: 1, chunkCount: 1, plaintextBytes: 100, documents,
    semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
}
function fixture(): { source: NativeSourceSnapshot; schematic: SchematicNativeSnapshot; history: NativeHistorySnapshot } {
  const body = { partId: "A", x: 10, y: -20, rotation: 0, isMirror: false, attrs: {}, zIndex: 1, locked: false, groupId: "" };
  const attr = { id: "name", key: "Name", value: "1k", symbolValue: "1k", blockValue: "1k", instanceValue: null,
    body: { parentId: "part", key: "Name", value: "1k", x: 10, y: -30, rotation: 0, fontSize: 15, fontFamily: null,
      fontWeight: null, italic: null, underline: null, align: "LEFT_BOTTOM", keyVisible: false, valueVisible: true, zIndex: 1 } };
  const snapshot = source([{ id: "part", type: "COMPONENT", body }, { id: attr.id, type: "ATTR", body: attr.body },
    { id: "wire", type: "WIRE", body: { zIndex: 10.5, locked: false, groupId: "" } },
    { id: "segment", type: "LINE", body: { fillColor: null, fillStyle: null, strokeColor: null, strokeStyle: null, strokeWidth: null,
      startX: 15, startY: -20, endX: 45, endY: -20, lineGroup: "wire" } },
    { id: "heading", type: "TEXT", body: { x: 0, y: 0, value: "Heading", rotation: 0, fontSize: 15, zIndex: 11.1 } },
    { id: "future", type: "FUTURE", body: { nested: { preserve: [false, 0] } } }]);
  const schematic: SchematicNativeSnapshot = { profile: SCHEMATIC_NATIVE_PROFILE, document: { documentUuid: "page", tabId: "page@project" }, source: encode(snapshot),
    components: [{ id: "part", kind: "part", locked: false, body, attributes: [attr],
      pins: [{ id: "part-pin", body: { x: 15, y: -20, rotation: 0, length: 10 }, attributes: [], net: "N1", noConnect: null }] }] };
  return { source: snapshot, schematic, history: history(snapshot) };
}
function batch(): { id: string; action: string; operations: unknown[] } {
  return { id: "cooperative-layout", action: "sch.layout.batch", operations: [
    { id: "move", action: "sch.component.translate", target: { primitiveId: "part" }, x: 20, y: 20 },
    { id: "display", action: "sch.attribute.display", target: { primitiveId: "name" }, patch: { x: 20, y: 35, fontSize: 12 } },
    { id: "heading", action: "sch.text.display", target: { primitiveId: "heading" }, patch: { x: 0, y: 50 } },
  ] };
}
async function turnsDuring<T>(run: () => Promise<T>): Promise<{ result: T; turns: number }> {
  let turns = 0;
  let handle: ReturnType<typeof setImmediate> | undefined;
  const tick = (): void => { turns += 1; handle = setImmediate(tick); };
  handle = setImmediate(tick);
  try { return { result: await run(), turns }; } finally { clearImmediate(handle); }
}

void test("cooperative prepare preserves exact synchronous code, IDs and source while advancing the event loop", async () => {
  const before = fixture(), operation = batch(), raw = JSON.stringify({ before, operation });
  const expected = prepareDesignAction(operation, before, { createdIds: {} });
  const observed = await turnsDuring(() => prepareDesignActionAsync(operation, before, { createdIds: {} }));
  assert.deepEqual(observed.result, expected);
  assert.ok(observed.turns >= 2, "Real event-loop turns must separate maintained validation and adapter work");
  assert.equal(JSON.stringify({ before, operation }), raw);
});

void test("cooperative baseline preserves checkpoint, coordinate and storage guards across event-loop turns", async () => {
  const before = fixture();
  const input = { checkpoint: before.history, source: before.source, native: before.schematic, targets: [{ id: "name", fields: ["x", "y"] }] };
  const expected = verifySchematicLayoutBaseline(input);
  const observed = await turnsDuring(() => verifySchematicLayoutBaselineCooperatively(input));
  assert.deepEqual(observed.result, expected); assert.ok(observed.turns >= 3);
  const pending = verifySchematicLayoutBaselineCooperatively(input);
  const name = input.checkpoint.documents.find((document) => document.uuid === "page")?.records.find((row) => row.id === "name");
  assert.ok(name); name.body["x"] = 999;
  assert.deepEqual(await pending, expected);
  await assert.rejects(verifySchematicLayoutBaselineCooperatively(input));
});

void test("cooperative prepare isolates operation, native and checkpoint inputs before its first await", async () => {
  const before = fixture(), operation = batch();
  const expected = prepareDesignAction(operation, before, { createdIds: {} });
  const pending = prepareDesignActionAsync(operation, before, { createdIds: {} });
  operation.operations.splice(0);
  const component = before.schematic.components[0]; assert.ok(component); component.body["x"] = 999;
  const row = before.history.documents[0]?.records[0]; assert.ok(row); row.body["value"] = "changed during await";
  before.schematic.source = "changed during await";
  assert.deepEqual(await pending, expected);
});

void test("cooperative creation uses isolated journal IDs and refuses failed validation before downstream work", async () => {
  const before = fixture();
  const operation = { id: "create", action: "sch.layout.batch", operations: [
    { id: "new-wire", action: "sch.wire.create", properties: { line: [15, 20, 15, 30], color: null, lineWidth: null, lineType: null } },
    { id: "new-label", action: "sch.net-label.create", properties: { x: 15, y: 30, net: "N1" } },
  ] };
  const ids: Record<string, string> = { "new-wire": "11".repeat(8), "new-wire:relevance": "22".repeat(8), "new-wire:segment:0": "33".repeat(8), "new-label": "44".repeat(8) };
  const expected = prepareDesignAction(operation, before, { createdIds: ids }), pending = prepareDesignActionAsync(operation, before, { createdIds: ids });
  ids["new-wire"] = "ff".repeat(8);
  assert.deepEqual(await pending, expected);
  const locked = fixture(), part = locked.schematic.components[0]; assert.ok(part); part.locked = true;
  let downstream = 0;
  await assert.rejects(prepareDesignActionAsync(batch(), locked, { createdIds: {} }).then(() => { downstream += 1; return null; }), /initially locked/u);
  await assert.rejects(prepareDesignActionAsync(operation, before, { createdIds: {} }).then(() => { downstream += 1; return null; }), /identity/u);
  assert.equal(downstream, 0);
});

void test("cooperative effect proof preserves reconciliation output and captures invalid post-state before awaiting", async () => {
  const before = fixture(), operation = batch(), prepared = prepareDesignAction(operation, before, { createdIds: {} });
  const projected = expectedSchematicLayout(operation, before.source, before.schematic, {});
  const after = { source: projected.expected, schematic: projected.native };
  const expected = verifyDesignAction(prepared.compiled, before, after, { createdIds: {}, layoutCloneLifecycle: true });
  const observed = await turnsDuring(() => verifyDesignActionAsync(prepared.compiled, before, after, { createdIds: {}, layoutCloneLifecycle: true }));
  assert.deepEqual(observed.result, expected); assert.ok(observed.turns >= 1);
  const changed = structuredClone(after), pin = changed.schematic.components[0]?.pins[0]; assert.ok(pin); pin.net = "FOREIGN";
  const rejected = verifyDesignActionAsync(prepared.compiled, before, changed, { createdIds: {} });
  pin.net = "N1";
  await assert.rejects(rejected, /changed content/u);
});

void test("cooperative inverse preserves rollback availability and exact forward/reverse proof", async () => {
  const before = fixture(), operation = batch();
  const expected = inverseDesignAction(operation, before, { createdIds: {} });
  assert.ok(expected);
  const observed = await turnsDuring(() => inverseDesignActionAsync(operation, before, { createdIds: {} }));
  assert.deepEqual(observed.result, expected); assert.ok(observed.turns >= 2);
  const projected = expectedSchematicLayout(operation, before.source, before.schematic, {});
  assert.deepEqual(expectedSchematicLayout(observed.result, projected.expected, projected.native, {}).expected, before.source);
  const deletion = { id: "delete", action: "sch.layout.batch", operations: [{ id: "delete-heading", action: "sch.text.delete", target: { primitiveId: "heading" } }] };
  assert.equal(await inverseDesignActionAsync(deletion, before, { createdIds: {} }), inverseDesignAction(deletion, before, { createdIds: {} }));
});

void test("cooperative commit persistence matches synchronous complete-project proof and rejects unrelated changes", async () => {
  const before = fixture(), operation = batch(), projected = expectedSchematicLayout(operation, before.source, before.schematic, {});
  const input = { before: before.history, after: history(projected.expected), expectedBefore: before.source, expectedAfter: projected.expected,
    beforeNative: before.schematic, afterNative: projected.native };
  const evidence = { history: before.history, templates: {} };
  const expected = verifySchematicLayoutPersistence(operation, input, {}, evidence);
  const observed = await turnsDuring(() => verifySchematicLayoutPersistenceAsync(operation, input, {}, evidence));
  assert.deepEqual(observed.result, expected); assert.ok(observed.turns >= 2);
  const invalid = { ...input, after: history(projected.expected, "foreign edit") };
  let downstream = 0;
  await assert.rejects(verifySchematicLayoutPersistenceAsync(operation, invalid, {}, evidence).then(() => { downstream += 1; return null; }));
  const pending = verifySchematicLayoutPersistenceAsync(operation, input, {}, evidence);
  const peer = input.after.documents.find((document) => document.uuid === "peer")?.records[0]; assert.ok(peer);
  peer.body["value"] = "caller mutation during await";
  assert.deepEqual(await pending, expected); assert.equal(downstream, 0);
});

void test("cooperative-prepared native adapter still refuses source drift before any history or source mutation", async () => {
  const before = fixture(), calls: string[] = [];
  const prepared = await prepareDesignActionAsync(batch(), before, { createdIds: {} });
  const exported = before.schematic.source.replace(JSON.stringify(before.source.document),
    JSON.stringify({ ...before.source.document, client: "ab".repeat(8), updateTime: 1, version: "1" }));
  const component = before.schematic.components[0]; assert.ok(component);
  const attributes = component.attributes.map((attr) => ({ ...attr, getConsistencyData: (): typeof attr.body => attr.body,
    getValue: (): typeof attr.value => attr.value, getInstanceValue: (): typeof attr.instanceValue => attr.instanceValue }));
  const pins = component.pins.map((pin) => ({ ...pin, getConsistencyData: (): typeof pin.body => pin.body, getAttr: (): never[] => [] }));
  const model = { id: component.id, cmdKey: component.kind, locked: false, getConsistencyData: (): typeof component.body => component.body,
    getAttr: (): typeof attributes => attributes, traversePins: (visit: (pin: unknown) => void): void => { for (const pin of pins) { visit(pin); } } };
  const doc = { uuid: "page", tabId: "page@project", isSchSheetDoc: (): boolean => true,
    shapeManager: { getModels: (): (typeof model)[] => [model], modelHelpers: { pin: { getSchPinNet: (): string => "N1" } },
      actionRunner: { run: async (action: () => Promise<void>): Promise<boolean> => { calls.push("history"); await action(); return true; } } },
    consistencyImpl: { getSourceCode: (): string => exported.replace('"startX":15', '"startX":16'),
      setSourceCode: (): Promise<boolean> => { calls.push("source"); return Promise.resolve(true); } } };
  const context = { SCH: { docMemoryManager: { getActiveDoc: (): typeof doc => doc } }, Blob, DecompressionStream, Uint8Array, DataView, TextDecoder, atob, btoa, crypto: webcrypto };
  await assert.rejects(Promise.resolve(runInNewContext(`(async()=>{${prepared.code}})()`, context)), /BASELINE_CHANGED/u);
  assert.deepEqual(calls, []);
});
