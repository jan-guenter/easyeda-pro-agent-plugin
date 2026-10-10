import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { webcrypto } from "node:crypto";
import { sha256Json } from "../src/core.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "../src/document-source.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";
import { SCHEMATIC_NATIVE_PROFILE } from "../src/schematic-native-adapter.ts";
import type { SchematicNativeComponent, SchematicNativeSnapshot } from "../src/schematic-native-adapter.ts";
import { expectedSchematicLayout, schematicLayoutBatchSchema } from "../src/schematic-layout-batch.ts";
import type { SchematicLayoutBatch } from "../src/schematic-layout-batch.ts";
import { prepareSchematicLayoutVisibilityRepair, verifySchematicLayoutVisibilityRepairPersistence } from "../src/schematic-layout-visibility-repair.ts";

function source(objects: readonly NativeSourceObject[]): NativeSourceSnapshot {
  const semantic = { schema: "easyeda-pro-control.document-source.v1" as const,
    document: { docType: "SCH_PAGE", uuid: "page", editVersion: "3.2.149.88089769" }, objects: objects.toSorted((a, b) => a.id.localeCompare(b.id)) };
  return { ...semantic, sha256: sha256Json(semantic) };
}
function encode(value: NativeSourceSnapshot): string {
  return `{"type":"DOCHEAD"}||${JSON.stringify(value.document)}|\n${value.objects.map((row) => `${JSON.stringify({ type: row.type, id: row.id })}||${JSON.stringify(row.body)}`).join("|\n")}|\n`;
}
const batch = { id: "move-port-hide-name", action: "sch.layout.batch", documentType: 1, operations: [
  { id: "move-port", action: "sch.component.translate", target: { primitiveId: "port" }, x: 100, y: 0 },
  { id: "hide-duplicate", action: "sch.attribute.display", target: { primitiveId: "net" }, patch: { valueVisible: false } },
] };
const history: NativeHistorySnapshot = { profile: "easyeda.native-history.linear-gcm-gzip.v1", checkpointSha256: "ab".repeat(32), semanticSha256: "cd".repeat(32), projectUuid: "project",
  branchUuid: "branch", headHistoryUuid: "head", historyRowCount: 1, chunkCount: 1, plaintextBytes: 1, documents: [] };
const evidence = { history, templates: {} };
function fixture(): { before: NativeSourceSnapshot; oldNative: SchematicNativeSnapshot; current: NativeSourceSnapshot; native: SchematicNativeSnapshot } {
  const body = { partId: "A", x: 0, y: 0, rotation: 0, isMirror: false, attrs: {}, zIndex: 1, locked: false };
  const name = { id: "name", key: "Name", value: "SIGNAL", symbolValue: "", blockValue: "SIGNAL", instanceValue: null,
    body: { parentId: "port", key: "Name", value: "SIGNAL", x: 0, y: -10, rotation: 0, fontSize: 9, align: "LEFT_BOTTOM", keyVisible: false, valueVisible: true, zIndex: 1 } };
  const port: SchematicNativeComponent = { id: "port", kind: "netport", locked: false, body, attributes: [name],
    pins: [{ id: "port-pin", body: { x: 0, y: 0, rotation: 0, length: 10 }, attributes: [], net: "SIGNAL", noConnect: null }] };
  const before = source([
    { id: "port", type: "COMPONENT", body }, { id: "name", type: "ATTR", body: name.body },
    { id: "wire", type: "WIRE", body: { zIndex: 3, locked: false } },
    { id: "line", type: "LINE", body: { startX: 100, startY: 0, endX: 150, endY: 0, lineGroup: "wire", strokeWidth: 1 } },
    { id: "relevance", type: "ATTR", body: { key: "Relevance", parentId: "wire", value: "[]", x: null, y: null, zIndex: 0 } },
    { id: "net", type: "ATTR", body: { key: "NET", parentId: "wire", value: "SIGNAL", x: 125, y: -4, zIndex: 1, keyVisible: false, valueVisible: true, locked: false } },
    { id: "note", type: "TEXT", body: { value: "Untouched", x: 20, y: 20, fontSize: 10, zIndex: 4 } },
  ]);
  const oldNative: SchematicNativeSnapshot = { profile: SCHEMATIC_NATIVE_PROFILE, document: { documentUuid: "page", tabId: "page@project" }, source: encode(before), components: [port] };
  const intended = expectedSchematicLayout(batch, before, oldNative, {}, evidence);
  const records = structuredClone(intended.expected.objects); const net = records.find((row) => row.id === "net"); assert.ok(net);
  net.body["valueVisible"] = true;
  const current = source(records), native = structuredClone(intended.native); native.source = encode(current);
  return { before, oldNative, current, native };
}
function prepare(value: ReturnType<typeof fixture>): ReturnType<typeof prepareSchematicLayoutVisibilityRepair> {
  return prepareSchematicLayoutVisibilityRepair(batch, value.before, value.oldNative, {}, evidence, value.current, value.native);
}
function changeSource(value: ReturnType<typeof fixture>, mutate: (records: NativeSourceObject[]) => void): void {
  const records = [...structuredClone(value.current.objects)]; mutate(records); value.current = source(records); value.native.source = encode(value.current);
}

void test("deferred wire visibility proof binds the sole original hide and exact moved port without mutating inputs", () => {
  const value = fixture(); const retained = structuredClone(value); const result = prepare(value);
  assert.deepEqual(value, retained);
  assert.equal(result.descriptor.labels.length, 1);
  assert.deepEqual(result.descriptor.labels[0], { stepId: "hide-duplicate", attributeId: "net", wireId: "wire", net: "SIGNAL", portId: "port", pinId: "port-pin", beforePoint: [0, 0], afterPoint: [100, 0] });
  assert.equal(result.expectedSource.objects.find((row) => row.id === "net")?.body["valueVisible"], false);
  assert.deepEqual(result.correctedNative.components, value.native.components);
  assert.equal(result.currentSourceSha256, value.current.sha256);
  assert.equal(result.correctedSourceSha256, result.expectedSource.sha256);
});

void test("deferred visibility proof refuses unrelated visibility, text, styles, coordinates and wire parent changes", () => {
  const mutations: ((rows: NativeSourceObject[]) => void)[] = [
    (rows) => { const row = rows.find((item) => item.id === "note"); assert.ok(row); row.body["valueVisible"] = false; },
    (rows) => { const row = rows.find((item) => item.id === "net"); assert.ok(row); row.body["value"] = "OTHER"; },
    (rows) => { const row = rows.find((item) => item.id === "net"); assert.ok(row); row.body["fontSize"] = 30; },
    (rows) => { const row = rows.find((item) => item.id === "net"); assert.ok(row); row.body["x"] = 126; },
    (rows) => { const row = rows.find((item) => item.id === "net"); assert.ok(row); row.body["parentId"] = "foreign"; },
    (rows) => { const row = rows.find((item) => item.id === "line"); assert.ok(row); row.body["endX"] = 151; },
  ];
  for (const mutation of mutations) { const value = fixture(); changeSource(value, mutation); assert.throws(() => prepare(value)); }
});

void test("deferred visibility proof refuses physical pin drift, net drift and changed netport names", () => {
  const value = fixture(); const pin = value.native.components[0]?.pins[0]; assert.ok(pin); pin.body["x"] = 101;
  assert.throws(() => prepare(value));
  const netValue = fixture(); const netPin = netValue.native.components[0]?.pins[0]; assert.ok(netPin); netPin.net = "OTHER";
  assert.throws(() => prepare(netValue));
  const styled = fixture(); const styledPin = styled.native.components[0]?.pins[0]; assert.ok(styledPin); styledPin.body["color"] = "#ff0000";
  assert.throws(() => prepare(styled));
  const named = fixture(); const attr = named.native.components[0]?.attributes[0]; assert.ok(attr); attr.value = "OTHER"; attr.body["value"] = "OTHER";
  changeSource(named, (rows) => { const row = rows.find((item) => item.id === "name"); assert.ok(row); row.body["value"] = "OTHER"; });
  assert.throws(() => prepare(named));
});

void test("deferred visibility proof refuses already corrected state or absent original hide or move authority", () => {
  const value = fixture(); changeSource(value, (rows) => { const row = rows.find((item) => item.id === "net"); assert.ok(row); row.body["valueVisible"] = false; });
  assert.throws(() => prepare(value), /visibility profile/u);
  const current = fixture();
  for (const operation of batch.operations) {
    assert.throws(() => prepareSchematicLayoutVisibilityRepair({ ...batch, operations: [operation] }, current.before, current.oldNative, {}, evidence, current.current, current.native));
  }
});

void test("visibility-only repair adapter rejects changed source before dispatch and never repeats the port move", async () => {
  const value = fixture(); const prepared = prepare(value); const component = value.native.components[0]; assert.ok(component);
  const attributes = component.attributes.map((attr) => ({ ...attr, getConsistencyData: (): typeof attr.body => attr.body, getValue: (): typeof attr.value => attr.value, getInstanceValue: (): typeof attr.instanceValue => attr.instanceValue }));
  const pins = component.pins.map((pin) => ({ ...pin, getConsistencyData: (): typeof pin.body => pin.body, getAttr: (): never[] => [] }));
  const model = { id: component.id, cmdKey: component.kind, locked: false, getConsistencyData: (): typeof component.body => component.body, getAttr: (): typeof attributes => attributes,
    traversePins: (visit: (pin: unknown) => void): void => { for (const pin of pins) { visit(pin); } } };
  const calls: string[] = []; let raw = encode({ ...value.current, document: { ...value.current.document, client: "ab".repeat(8), updateTime: 1, version: "1" } }), written = "";
  const doc = { uuid: "page", tabId: "page@project", isSchSheetDoc: (): boolean => true,
    shapeManager: { getModels: (): (typeof model)[] => [model], modelHelpers: { pin: { getSchPinNet: (): string => "SIGNAL" } },
      actionRunner: { run: async (action: () => Promise<void>): Promise<boolean> => { calls.push("history"); await action(); return true; } } },
    consistencyImpl: { getSourceCode: (): string => raw, setSourceCode: (data: string): Promise<boolean> => { calls.push("source"); written = data; return Promise.resolve(true); } },
  };
  const context = { SCH: { docMemoryManager: { getActiveDoc: (): typeof doc => doc } }, Blob, DecompressionStream, Uint8Array, DataView, TextDecoder, atob, btoa, crypto: webcrypto };
  assert.equal(await runInNewContext(`(async()=>{${prepared.code}})()`, context), true);
  assert.deepEqual(calls, ["history", "source"]);
  assert.deepEqual(parseDocumentSource(written), prepared.correctedSource);
  const writtenPort = parseDocumentSource(written).objects.find((row) => row.id === "port");
  assert.deepEqual(writtenPort?.body, component.body);
  raw = raw.replace('"startX":100', '"startX":101'); calls.length = 0;
  await assert.rejects(Promise.resolve(runInNewContext(`(async()=>{${prepared.code}})()`, context)), /BASELINE_CHANGED/u);
  assert.deepEqual(calls, []);
});

const createdBatch = schematicLayoutBatchSchema.parse({ id: "create-wire-move-port-hide-name", action: "sch.layout.batch", documentType: 1, operations: [
  batch.operations[0],
  { id: "create-wire", action: "sch.wire.create", properties: { line: [100, 0, 150, 0], color: null, lineWidth: 1, lineType: 0 } },
  { id: "create-label", action: "sch.net-label.create", properties: { x: 125, y: 0, net: "SIGNAL" } },
  { id: "display-created", action: "sch.net-label.display", target: { resultOf: "create-label" },
    patch: { x: 130, y: 14, fontSize: 11, alignMode: 3, bold: true, keyVisible: false, valueVisible: false } },
] });
const createdIds = { "create-wire": "a1".repeat(8), "create-wire:relevance": "a2".repeat(8), "create-wire:segment:0": "a3".repeat(8), "create-label": "a4".repeat(8) };
function createdFixture(operation: SchematicLayoutBatch = createdBatch, secondPort = false): ReturnType<typeof fixture> {
  const base = fixture();
  const rows = base.before.objects.filter((row) => !["wire", "line", "net", "relevance"].includes(row.id));
  const oldNative = structuredClone(base.oldNative);
  if (secondPort) {
    const other = structuredClone(oldNative.components[0]); assert.ok(other);
    other.id = "other-port"; other.body["y"] = 20;
    const name = other.attributes[0], pin = other.pins[0]; assert.ok(pin && name);
    pin.id = "other-pin"; pin.body["y"] = 20; name.id = "other-name"; name.body["parentId"] = other.id; name.body["y"] = 10;
    rows.push({ id: other.id, type: "COMPONENT", body: other.body }, { id: name.id, type: "ATTR", body: name.body });
    oldNative.components.push(other); oldNative.components.sort((a, b) => a.id.localeCompare(b.id));
  }
  const before = source(rows); oldNative.source = encode(before);
  const intended = expectedSchematicLayout(operation, before, oldNative, createdIds, evidence);
  const currentRows = structuredClone(intended.expected.objects), label = currentRows.find((row) => row.id === createdIds["create-label"]); assert.ok(label);
  label.body["valueVisible"] = true;
  const current = source(currentRows), native = structuredClone(intended.native); native.source = encode(current);
  return { before, oldNative, current, native };
}
function prepareCreated(value: ReturnType<typeof fixture>, operation: SchematicLayoutBatch = createdBatch): ReturnType<typeof prepareSchematicLayoutVisibilityRepair> {
  return prepareSchematicLayoutVisibilityRepair(operation, value.before, value.oldNative, createdIds, evidence, value.current, value.native);
}
function checkpoint(snapshot: NativeSourceSnapshot, foreignValue = "unchanged"): NativeHistorySnapshot {
  const target = { uuid: "page", docType: "SCH_PAGE", metadata: snapshot.document, records: snapshot.objects };
  const other = { uuid: "other", docType: "CONFIG", metadata: { uuid: "other", docType: "CONFIG" }, records: [{ id: "entry", type: "META", body: { value: foreignValue } }] };
  const documents = [target, other].map((entry) => Object.assign(structuredClone(entry), { semanticSha256: sha256Json(entry),
    records: entry.records.map((record) => Object.assign(structuredClone(record), { ticket: 1, client: null })) }));
  return { ...history, projectUuid: "a".repeat(64), projectOwnerUuid: "b".repeat(32), branchUuid: "c".repeat(32), headHistoryUuid: "d".repeat(32),
    checkpointSha256: sha256Json(documents), documents,
    semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
}

void test("new wire visibility repair binds original creation identities and preserves every display field without replay", () => {
  const value = createdFixture(); const raw = structuredClone(value); const operation = structuredClone(createdBatch); const ids = structuredClone(createdIds);
  const result = prepareCreated(value);
  assert.deepEqual(value, raw); assert.deepEqual(createdBatch, operation); assert.deepEqual(createdIds, ids);
  assert.deepEqual(result.descriptor.labels, [{ stepId: "display-created", attributeId: createdIds["create-label"], wireId: createdIds["create-wire"], net: "SIGNAL",
    portId: "port", pinId: "port-pin", beforePoint: [0, 0], afterPoint: [100, 0], created: { labelStepId: "create-label", wireStepId: "create-wire" } }]);
  const intended = expectedSchematicLayout(createdBatch, value.before, value.oldNative, createdIds, evidence);
  assert.deepEqual(result.correctedSource, intended.expected); assert.deepEqual(result.correctedNative.components, intended.native.components);
  assert.deepEqual(result.correctedNative.document, intended.native.document);
  assert.deepEqual(parseDocumentSource(result.correctedNative.source), parseDocumentSource(intended.native.source));
  const changed = value.current.objects.filter((row) => sha256Json(row) !== sha256Json(result.correctedSource.objects.find((after) => after.id === row.id)));
  assert.deepEqual(changed.map((row) => row.id), [createdIds["create-label"]]);
  assert.deepEqual(result.correctedSource.objects.find((row) => row.id === createdIds["create-label"])?.body,
    { ...changed[0]?.body, valueVisible: false });
});

void test("created-label visibility recovery refuses missing creation authority, direct targets, duplicate requests and absent hides", () => {
  const value = createdFixture();
  for (const key of ["create-label", "create-wire", "create-wire:segment:0", "create-wire:relevance"] as const) {
    const ids = Object.fromEntries(Object.entries(createdIds).filter(([entry]) => entry !== key));
    assert.throws(() => prepareSchematicLayoutVisibilityRepair(createdBatch, value.before, value.oldNative, ids, evidence, value.current, value.native));
  }
  const display = createdBatch.operations.at(-1); assert.ok(display?.action === "sch.net-label.display");
  const direct = { ...createdBatch, operations: [...createdBatch.operations.slice(0, -1), { ...display, target: { primitiveId: createdIds["create-label"] } }] };
  assert.throws(() => prepareCreated(value, direct), /visibility profile/u);
  const duplicate = { ...createdBatch, operations: [...createdBatch.operations, { ...display, id: "second-display" }] };
  assert.throws(() => prepareCreated(value, duplicate), /visibility profile/u);
  const visible = { ...createdBatch, operations: [...createdBatch.operations.slice(0, -1), { ...display, patch: { ...display.patch, valueVisible: true } }] };
  assert.throws(() => prepareCreated(value, visible), /visibility profile/u);
  changeSource(value, (rows) => { const label = rows.find((row) => row.id === createdIds["create-label"]); assert.ok(label); label.body["valueVisible"] = false; });
  assert.throws(() => prepareCreated(value), /visibility profile/u);
});

void test("created-label visibility recovery rejects any extra source delta, unrequested pin change or non-unique exact endpoint", () => {
  const mutations: ((rows: NativeSourceObject[]) => void)[] = [
    (rows) => { const row = rows.find((r) => r.id === createdIds["create-label"]); assert.ok(row); row.body["fontSize"] = 12; },
    (rows) => { const row = rows.find((r) => r.id === createdIds["create-label"]); assert.ok(row); row.body["x"] = 131; },
    (rows) => { const row = rows.find((r) => r.id === createdIds["create-label"]); assert.ok(row); row.body["value"] = "OTHER"; },
    (rows) => { const row = rows.find((r) => r.id === createdIds["create-label"]); assert.ok(row); row.body["parentId"] = "foreign"; },
    (rows) => { const row = rows.find((r) => r.id === createdIds["create-wire:segment:0"]); assert.ok(row); row.body["endX"] = 151; },
    (rows) => { const row = rows.find((r) => r.id === "note"); assert.ok(row); row.body["value"] = "Changed"; },
  ];
  for (const mutation of mutations) { const value = createdFixture(); changeSource(value, mutation); assert.throws(() => prepareCreated(value)); }
  const changedPin = createdFixture(), pin = changedPin.native.components[0]?.pins[0]; assert.ok(pin); pin.net = "OTHER";
  assert.throws(() => prepareCreated(changedPin));
  const move = createdBatch.operations[0]; assert.ok(move?.action === "sch.component.translate");
  for (const x of [0, 125, 100.00000000000001]) {
    const operation = { ...createdBatch, operations: [{ ...move, x }, ...createdBatch.operations.slice(1)] };
    assert.throws(() => prepareCreated(createdFixture(operation), operation));
  }
  const ambiguous = { ...createdBatch, operations: [{ ...move, id: "move-other", target: { primitiveId: "other-port" } }, ...createdBatch.operations] };
  assert.throws(() => prepareCreated(createdFixture(ambiguous, true), ambiguous), /visibility profile/u);
});

void test("created-label diagnostic persistence changes only false-to-true, preserves style and checks every durable document", () => {
  const value = createdFixture(); const before = checkpoint(value.before); const after = checkpoint(value.current);
  const input = { before, after, expectedBefore: value.before, expectedAfter: value.current, beforeNative: value.oldNative, afterNative: value.native };
  const operation = structuredClone(createdBatch), raw = structuredClone(input);
  const proof = verifySchematicLayoutVisibilityRepairPersistence(createdBatch, input, createdIds, { history: before, templates: {} });
  assert.equal(proof.originalIntentFulfilled, false); assert.equal(proof.persistence["ok"], true); assert.equal(proof.persistence["documentCount"], 2);
  assert.deepEqual(input, raw); assert.deepEqual(createdBatch, operation);
  const corrupted = structuredClone(value.current.objects), label = corrupted.find((row) => row.id === createdIds["create-label"]); assert.ok(label);
  label.body["x"] = 125;
  for (const bad of [checkpoint(source(corrupted)), checkpoint(value.current, "foreign change")]) {
    assert.throws(() => verifySchematicLayoutVisibilityRepairPersistence(createdBatch, { ...input, after: bad }, createdIds, { history: before, templates: {} }));
  }
});
