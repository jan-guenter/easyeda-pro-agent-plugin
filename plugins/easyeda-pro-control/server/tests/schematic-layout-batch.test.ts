import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { webcrypto } from "node:crypto";
import { sha256Json } from "../src/core.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "../src/document-source.ts";
import { SCHEMATIC_NATIVE_PROFILE } from "../src/schematic-native-adapter.ts";
import type { SchematicNativeComponent, SchematicNativeSnapshot } from "../src/schematic-native-adapter.ts";
import { buildSchematicLayoutAdapter, expectedSchematicLayout, inverseSchematicLayout, schematicLayoutBatchSchema, verifyHistoricalSchematicLayoutEffect, verifySchematicLayoutEffect } from "../src/schematic-layout-batch.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";
import { designActionSchema, prepareDesignAction, verifyDesignAction } from "../src/design-action.ts";

function source(objects: readonly NativeSourceObject[]): NativeSourceSnapshot {
  const value = { schema: "easyeda-pro-control.document-source.v1" as const,
    document: { docType: "SCH_PAGE", uuid: "page", editVersion: "3.2.149.88089769" }, objects: objects.toSorted((a, b) => a.id.localeCompare(b.id)) };
  return { ...value, sha256: sha256Json(value) };
}
function encode(value: NativeSourceSnapshot, nativeMetadata = true): string {
  const head = nativeMetadata ? { ...value.document, client: "ab".repeat(8), updateTime: 1, version: "1" } : value.document;
  return `{"type":"DOCHEAD"}||${JSON.stringify(head)}|\n${value.objects.map((record) => `${JSON.stringify({ type: record.type, id: record.id })}||${JSON.stringify(record.body)}`).join("|\n")}|\n`;
}
function fixture(): { source: NativeSourceSnapshot; native: SchematicNativeSnapshot } {
  const body = { partId: "A", x: 10, y: -20, rotation: 0, isMirror: false, attrs: {}, zIndex: 1, locked: false, groupId: "" };
  const attribute = { id: "name", key: "Name", value: "1k", symbolValue: "1k", blockValue: "1k", instanceValue: null,
    body: { parentId: "part", key: "Name", value: "1k", x: 10, y: -30, rotation: 0, fontSize: 15, fontFamily: null, fontWeight: null, italic: null, underline: null, align: "LEFT_BOTTOM", keyVisible: false, valueVisible: true, zIndex: 1 } };
  const component: SchematicNativeComponent = { id: "part", kind: "part", locked: false, body, attributes: [attribute],
    pins: [{ id: "part-pin", body: { x: 15, y: -20, rotation: 0, length: 10 }, attributes: [], net: "N1", noConnect: null }] };
  const objects: NativeSourceObject[] = [{ id: "part", type: "COMPONENT", body }, { id: "name", type: "ATTR", body: attribute.body },
    { id: "wire", type: "WIRE", body: { zIndex: 10.5, locked: false, groupId: "" } },
    { id: "segment", type: "LINE", body: { fillColor: null, fillStyle: null, strokeColor: null, strokeStyle: null, strokeWidth: null, startX: 15, startY: -20, endX: 45, endY: -20, lineGroup: "wire" } },
    { id: "heading", type: "TEXT", body: { x: 0, y: 0, value: "Heading", rotation: 0, fontSize: 15, zIndex: 11.1 } },
    { id: "unknown", type: "FUTURE", body: { nested: { preserve: [false, 0] } } }];
  const snapshot = source(objects);
  return { source: snapshot, native: { profile: SCHEMATIC_NATIVE_PROFILE, document: { documentUuid: "page", tabId: "page@project" }, source: encode(snapshot, false), components: [component] } };
}
const batch = { id: "layout", action: "sch.layout.batch", operations: [
  { id: "move", action: "sch.component.translate", target: { primitiveId: "part" }, x: 20, y: 20 },
  { id: "display", action: "sch.attribute.display", target: { primitiveId: "name" }, patch: { x: 20, y: 35, fontSize: 12, valueVisible: true } },
  { id: "heading", action: "sch.text.display", target: { primitiveId: "heading" }, patch: { x: 0, y: 50 } },
] };

void test("typed schematic layout moves part/attributes in one exact batch, preserving nets and reversible identities", () => {
  const before = fixture(), expected = expectedSchematicLayout(batch, before.source, before.native, {});
  const prepared = prepareDesignAction(batch, { source: before.source, schematic: before.native }, { createdIds: {} });
  assert.equal(designActionSchema.parse(batch).action, "sch.layout.batch");
  assert.deepEqual(prepared.expectedSource, expected.expected);
  assert.deepEqual(expected.native.components[0]?.pins[0]?.body, { x: 25, y: -20, rotation: 0, length: 10 });
  assert.equal(expected.native.components[0]?.pins[0]?.net, "N1");
  assert.equal(expected.native.components[0]?.attributes[0]?.value, "1k");
  assert.equal(verifyDesignAction(prepared.compiled, { source: before.source, schematic: before.native }, { source: expected.expected, schematic: expected.native }, { createdIds: {} }).changed.length, 3);
  const inverse = inverseSchematicLayout(batch, before.source, before.native, {});
  assert.ok(inverse);
  assert.deepEqual(expectedSchematicLayout(inverse, expected.expected, expected.native, {}).expected, before.source);
  const altered = structuredClone(expected.native); const pin = altered.components[0]?.pins[0]; assert.ok(pin); pin.net = "OTHER";
  assert.throws(() => verifySchematicLayoutEffect(batch, before.source, expected.expected, before.native, altered, {}), /changed content/u);
  const locked = fixture(); const model = locked.native.components[0]; assert.ok(model); model.locked = true;
  assert.throws(() => expectedSchematicLayout(batch, locked.source, locked.native, {}), /initially locked/u);
  assert.equal(schematicLayoutBatchSchema.safeParse({ ...batch, operations: [{ id: "bad", action: "sch.attribute.display", target: { primitiveId: "name" }, patch: { value: "2k" } }] }).success, false);
});

void test("new wire and existing-net label IDs are journaled, foreign nets and frame movement are rejected", () => {
  const before = fixture();
  const input = { id: "add", action: "sch.layout.batch", operations: [
    { id: "new-wire", action: "sch.wire.create", properties: { line: [15, 20, 15, 30], color: null, lineWidth: null, lineType: null } },
    { id: "new-label", action: "sch.net-label.create", properties: { x: 15, y: 30, net: "N1" } },
    { id: "label-display", action: "sch.net-label.display", target: { resultOf: "new-label" }, patch: { fontSize: 12 } },
  ] };
  const result = expectedSchematicLayout(input, before.source, before.native);
  assert.deepEqual(Object.keys(result.createdIds), ["new-wire", "new-wire:relevance", "new-wire:segment:0", "new-label"]);
  assert.deepEqual(expectedSchematicLayout(input, before.source, before.native, result.createdIds).expected, result.expected);
  assert.equal(verifySchematicLayoutEffect(input, before.source, result.expected, before.native, result.native, result.createdIds).added.length, 4);
  const wire = result.expected.objects.find((row) => row.type === "WIRE" && row.id === result.createdIds["new-wire"]);
  assert.ok(wire); assert.equal(Object.hasOwn(wire.body, "groupId"), false);
  assert.equal(result.expected.objects.find((row) => row.id === result.createdIds["new-wire:relevance"])?.body["value"], "[]");
  assert.throws(() => expectedSchematicLayout({ id: "replace", action: "sch.layout.batch", operations: [{ id: "wire", action: "sch.wire.replace", target: { primitiveId: "wire" }, line: [15, 20, 45, 20] }] }, before.source, before.native), /child-order profile/u);
  assert.equal(inverseSchematicLayout(input, before.source, before.native, result.createdIds), undefined);
  assert.throws(() => expectedSchematicLayout(input, before.source, before.native, {}), /identity/u);
  const foreign = { id: "foreign", action: "sch.layout.batch", operations: [{ id: "label", action: "sch.net-label.create", properties: { x: 0, y: 0, net: "NEW" } }] };
  assert.throws(() => expectedSchematicLayout(foreign, before.source, before.native), /existing exact net/u);
  const frame = fixture(); const model = frame.native.components[0]; assert.ok(model); model.kind = "sheet";
  assert.throws(() => expectedSchematicLayout(batch, frame.source, frame.native, {}), /never a frame/u);
});

void test("native layout adapter uses one history/source application and rejects changed baseline before dispatch", async () => {
  const before = fixture();
  const operation = { id: "wire-only", action: "sch.layout.batch", operations: [{ id: "wire", action: "sch.wire.create", properties: { line: [15, 20, 15, 30, 45, 30], color: null, lineWidth: 1, lineType: 0 } }] };
  const adapter = buildSchematicLayoutAdapter(operation, before.source, before.native);
  const calls: string[] = [];
  const component = before.native.components[0]; assert.ok(component);
  const attributes = component.attributes.map((attr) => ({ ...attr, getConsistencyData: (): typeof attr.body => attr.body, getValue: (): typeof attr.value => attr.value, getInstanceValue: (): typeof attr.instanceValue => attr.instanceValue }));
  const pins = component.pins.map((pin) => ({ ...pin, getConsistencyData: (): typeof pin.body => pin.body, getAttr: (): never[] => [] }));
  const model = { id: component.id, cmdKey: component.kind, locked: false, getConsistencyData: (): typeof component.body => component.body, getAttr: (): typeof attributes => attributes,
    traversePins: (visit: (pin: unknown) => void): void => { for (const pin of pins) { visit(pin); } } };
  let raw = encode(before.source), written = "";
  const doc = { uuid: "page", tabId: "page@project", isSchSheetDoc: (): boolean => true,
    shapeManager: { getModels: (): (typeof model)[] => [model], modelHelpers: { pin: { getSchPinNet: (): string => "N1" } },
      actionRunner: { run: async (action: () => Promise<void>): Promise<boolean> => { calls.push("history"); await action(); return true; } } },
    consistencyImpl: { getSourceCode: (): string => raw, setSourceCode: (value: string): Promise<boolean> => { calls.push("source"); written = value; return Promise.resolve(true); } },
  };
  const context = { SCH: { docMemoryManager: { getActiveDoc: (): typeof doc => doc } }, Blob, DecompressionStream, Uint8Array, DataView, TextDecoder, atob, btoa, crypto: webcrypto };
  assert.equal(await runInNewContext(`(async()=>{${adapter.code}})()`, context), true);
  assert.deepEqual(calls, ["history", "source"]);
  assert.deepEqual(parseDocumentSource(written), adapter.expected);
  raw = raw.replace('"startX":15', '"startX":16'); calls.length = 0;
  await assert.rejects(Promise.resolve(runInNewContext(`(async()=>{${adapter.code}})()`, context)), /BASELINE_CHANGED/u);
  assert.deepEqual(calls, []);
});

void test("historical wire replacement proves complete endpoint-derived child order without enabling new writes", () => {
  const before = fixture();
  const pin = before.native.components[0]?.pins[0]; assert.ok(pin);
  before.native.components[0]?.pins.push({ ...structuredClone(pin), id: "part-pin2", body: { ...pin.body, x: 45 } });
  const attrs: NativeSourceObject[] = [
    { id: "relevance", type: "ATTR", body: { parentId: "wire", key: "Relevance", value: "[]", x: null, y: null, zIndex: 0 } },
    { id: "net", type: "ATTR", body: { parentId: "wire", key: "NET", value: "N1", x: null, y: null, zIndex: 2 } },
  ];
  before.source = source([...before.source.objects, ...attrs]); before.native.source = encode(before.source, false);
  const operation = { id: "historical", action: "sch.layout.batch", operations: [{ id: "replace", action: "sch.wire.replace", target: { primitiveId: "wire" }, line: [15, 20, 25, 20, 45, 20] }] };
  const lineId = "12".repeat(8), records = before.source.objects.map((row) => structuredClone(row));
  const segment = records.find((row) => row.id === "segment"); assert.ok(segment); segment.body["endX"] = 25;
  records.push({ id: lineId, type: "LINE", body: { ...segment.body, startX: 25, endX: 45 } });
  for (const row of records) { if (row.id === "relevance") { row.body["zIndex"] = 2; } if (row.id === "net") { row.body["zIndex"] = 3; } }
  const after = source(records), native = { ...structuredClone(before.native), source: encode(after, false) };
  const history: NativeHistorySnapshot = { profile: "easyeda.native-history.linear-gcm-gzip.v1", checkpointSha256: "ab".repeat(32), semanticSha256: "cd".repeat(32), projectUuid: "project",
    branchUuid: "branch", headHistoryUuid: "head", historyRowCount: 1, chunkCount: 1, plaintextBytes: 1, documents: [] };
  assert.throws(() => expectedSchematicLayout(operation, before.source, before.native), /child-order profile/u);
  const proof = verifyHistoricalSchematicLayoutEffect(operation, before.source, after, before.native, native, { "replace:segment:1": lineId }, { history, templates: {} });
  assert.equal(proof["inverseAvailable"], false);
  const altered = structuredClone(records), net = altered.find((row) => row.id === "net"); assert.ok(net); net.body["value"] = "FOREIGN";
  const badSource = source(altered);
  assert.throws(() => verifyHistoricalSchematicLayoutEffect(operation, before.source, badSource, before.native, { ...native, source: encode(badSource, false) }, { "replace:segment:1": lineId }, { history, templates: {} }), /changed|different|unreviewed/u);
});
