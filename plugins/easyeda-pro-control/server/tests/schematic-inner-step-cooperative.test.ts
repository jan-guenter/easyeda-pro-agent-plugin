import assert from "node:assert/strict";
import { test } from "node:test";
import { setImmediate as nextTurn } from "node:timers/promises";
import { sha256Json } from "../src/core.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "../src/document-source.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "../src/native-history.ts";
import { SCHEMATIC_NATIVE_PROFILE } from "../src/schematic-native-adapter.ts";
import type { SchematicNativeComponent, SchematicNativeSnapshot } from "../src/schematic-native-adapter.ts";
import { buildSchematicLayoutAdapter, buildSchematicLayoutAdapterCooperatively, expectedSchematicLayout, expectedSchematicLayoutCooperatively,
  inverseSchematicLayout, inverseSchematicLayoutCooperatively, verifySchematicLayoutEffect, verifySchematicLayoutEffectCooperatively,
  verifySchematicLayoutPersistence, verifySchematicLayoutPersistenceCooperatively } from "../src/schematic-layout-batch.ts";
import type { SchematicLayoutBatch, SchematicLayoutEvidence } from "../src/schematic-layout-batch.ts";
import { assertDesignActionSupported, assertDesignActionSupportedCooperatively, inverseDesignAction, inverseDesignActionCooperatively,
  prepareDesignAction, prepareDesignActionCooperatively, verifyDesignAction, verifyDesignActionCooperatively } from "../src/design-action.ts";

const project = "a".repeat(64);
function source(objects: readonly NativeSourceObject[], uuid = "page"): NativeSourceSnapshot {
  const value = { schema: "easyeda-pro-control.document-source.v1" as const,
    document: { docType: "SCH_PAGE", uuid, editVersion: "3.2.149.88089769" }, objects: objects.toSorted((a, b) => a.id.localeCompare(b.id)) };
  return { ...value, sha256: sha256Json(value) };
}
function encode(value: NativeSourceSnapshot): string {
  return `{"type":"DOCHEAD"}||${JSON.stringify(value.document)}|\n${value.objects.map((row) => `${JSON.stringify({ type: row.type, id: row.id })}||${JSON.stringify(row.body)}`).join("|\n")}|\n`;
}
function document(uuid: string, docType: string, records: readonly NativeSourceObject[], metadata?: Record<string, unknown>): NativeDocumentSnapshot {
  const value = { uuid, docType, metadata: metadata ?? { uuid, docType }, records: records.toSorted((a, b) => a.id.localeCompare(b.id)) };
  return { ...value, records: value.records.map((row, index) => ({ ...structuredClone(row), ticket: index + 1, client: null })), semanticSha256: sha256Json(value) };
}
function history(snapshot: NativeSourceSnapshot, peers: readonly NativeDocumentSnapshot[] = []): NativeHistorySnapshot {
  const documents = [document("page", "SCH_PAGE", snapshot.objects, snapshot.document), ...peers,
    document("peer", "CONFIG", [{ id: "entry", type: "META", body: { nested: { preserve: [false, 0] } } }])];
  return { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: project, branchUuid: "b".repeat(32), headHistoryUuid: "c".repeat(32),
    checkpointSha256: sha256Json(documents), historyRowCount: 1, chunkCount: 1, plaintextBytes: 100, documents,
    semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
}
function fixture(): { source: NativeSourceSnapshot; schematic: SchematicNativeSnapshot; history: NativeHistorySnapshot; layoutTemplates: Record<string, SchematicNativeSnapshot> } {
  const body = { partId: "A", x: 10, y: -20, rotation: 0, isMirror: false, attrs: {}, zIndex: 1, locked: false, groupId: "" };
  const attr = { id: "name", key: "Name", value: "1k", symbolValue: "1k", blockValue: "1k", instanceValue: null,
    body: { parentId: "part", key: "Name", value: "1k", x: 10, y: -30, rotation: 0, fontSize: 15, fontFamily: null,
      fontWeight: null, italic: null, underline: null, align: "LEFT_BOTTOM", keyVisible: false, valueVisible: true, zIndex: 1 } };
  const snapshot = source([{ id: "part", type: "COMPONENT", body }, { id: attr.id, type: "ATTR", body: attr.body },
    { id: "wire", type: "WIRE", body: { zIndex: 10.5, locked: false, groupId: "" } },
    { id: "segment", type: "LINE", body: { fillColor: null, fillStyle: null, strokeColor: null, strokeStyle: null, strokeWidth: null,
      startX: 15, startY: -20, endX: 45, endY: -20, lineGroup: "wire" } },
    { id: "heading", type: "TEXT", body: { x: 0, y: 0, value: "Synthetic heading", rotation: 0, fontSize: 15, zIndex: 11.1 } },
    { id: "future", type: "FUTURE", body: { nested: { preserve: [false, 0] } } }]);
  const schematic: SchematicNativeSnapshot = { profile: SCHEMATIC_NATIVE_PROFILE, document: { documentUuid: "page", tabId: `page@${project}` }, source: encode(snapshot),
    components: [{ id: "part", kind: "part", locked: false, body, attributes: [attr],
      pins: [{ id: "part-pin", body: { x: 15, y: -20, rotation: 0, length: 10 }, attributes: [], net: "GND", noConnect: null }] }] };
  return { source: snapshot, schematic, history: history(snapshot), layoutTemplates: {} };
}
const stepCount = 24;
function batch(): SchematicLayoutBatch {
  return { id: "inner-steps", action: "sch.layout.batch", documentType: 1, operations: [
    { id: "move", action: "sch.component.translate", target: { primitiveId: "part" }, x: 20, y: 20 },
    { id: "display", action: "sch.attribute.display", target: { primitiveId: "name" }, patch: { x: 20, y: 35, fontSize: 12 } },
    ...Array.from({ length: stepCount }, (_, index) => ({ id: `heading-${index}`, action: "sch.text.display" as const,
      target: { primitiveId: "heading" }, patch: { y: index + 1 } })),
  ] };
}
function cloneFixture(): { before: ReturnType<typeof fixture>; operation: SchematicLayoutBatch; ids: Record<string, string>; evidence: SchematicLayoutEvidence } {
  const before = fixture();
  before.source = source(before.source.objects.filter((row) => !["WIRE", "LINE"].includes(row.type))); before.schematic.source = encode(before.source);
  const flag: SchematicNativeComponent = { id: "flag", kind: "netflag", locked: false,
    body: { partId: "flag-part", x: 10, y: -20, rotation: 0, isMirror: false, attrs: {}, zIndex: 10.5 },
    attributes: ["Symbol", "Device", "Name", "Global Net Name", "Relevance"].map((key, index) => {
      const value = ["symbol", "device", "GND", "GND", "[]"][index]; assert.equal(typeof value, "string");
      if (value === undefined) { throw new Error("Missing synthetic attribute value."); }
      return { id: `attr${index}`, key, value, symbolValue: value, blockValue: value, instanceValue: null,
        body: { parentId: "flag", key, value, x: key === "Name" ? 10 : null, y: key === "Name" ? -10 : null,
          zIndex: index + 1, strikeout: false, valueVisible: null, keyVisible: null } };
    }), pins: [{ id: "flag-pin", body: { x: 10, y: -20, rotation: 270, length: 10, locked: false }, net: "GND", noConnect: null, attributes: [] }] };
  const templateSource = source([{ id: flag.id, type: "COMPONENT", body: flag.body }, ...flag.attributes.map((a) => ({ id: a.id, type: "ATTR", body: a.body }))], "template");
  before.layoutTemplates["template"] = { profile: SCHEMATIC_NATIVE_PROFILE, document: { documentUuid: "template", tabId: `template@${project}` }, source: encode(templateSource), components: [flag] };
  before.history = history(before.source, [document("template", "SCH_PAGE", templateSource.objects, templateSource.document),
    document("symbol", "SYMBOL", [{ id: "META", type: "META", body: { docType: 18 } }, { id: "flag-part", type: "PART", body: {} },
      { id: "pin", type: "PIN", body: { partId: "flag-part", x: 0, y: 0, rotation: 270, length: 10 } }]),
    document("device", "DEVICE", [{ id: "META", type: "META", body: { attributes: { Symbol: "symbol" } } }])]);
  const operation = batch(); operation.operations.splice(0, 2);
  operation.operations.push({ id: "clone", action: "sch.net-flag.clone", template: { sheetUuid: "template", componentId: "flag" }, x: 100, y: 50 },
    { id: "new-wire", action: "sch.wire.create", properties: { line: [15, 20, 100, 20, 100, 50], color: null, lineWidth: 1, lineType: 0 } },
    { id: "new-label", action: "sch.net-label.create", properties: { x: 15, y: 20, net: "GND" } });
  const keys = ["clone", ...Array.from({ length: 5 }, (_, i) => `clone:attr:${i}`), "new-wire", "new-wire:relevance", "new-wire:segment:0", "new-wire:segment:1", "new-label"];
  const ids = Object.fromEntries(keys.map((key, index) => [key, (index + 100).toString(16).padStart(16, "0")]));
  return { before, operation, ids, evidence: { history: before.history, templates: before.layoutTemplates } };
}
async function turnsDuring<T>(run: (turns: () => number) => Promise<T>): Promise<{ result: T; turns: number }> {
  let turns = 0;
  let handle: ReturnType<typeof setImmediate> | undefined;
  const tick = (): void => { turns += 1; handle = setImmediate(tick); }; handle = setImmediate(tick);
  try { return { result: await run(() => turns), turns }; } finally { clearImmediate(handle); }
}
function record(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === "object" && !Array.isArray(value); }
function errorOf(run: () => unknown): { name: string; message: string } {
  try { run(); } catch (error) { assert.ok(error instanceof Error); return { name: error.name, message: error.message }; }
  throw new Error("Expected refusal");
}
async function sameRefusal(sync: () => unknown, asyncRun: () => Promise<unknown>): Promise<void> {
  const expected = errorOf(sync); let downstream = 0;
  await assert.rejects(asyncRun().then(() => { downstream += 1; return null; }), (error: unknown) => {
    assert.ok(error instanceof Error); assert.deepEqual({ name: error.name, message: error.message }, expected); return true;
  }); assert.equal(downstream, 0);
}

void test("inner simulation yields BETWEEN distinct step snapshots with complete synchronous projection parity", async (t) => {
  const before = fixture(), operation = batch(), raw = JSON.stringify({ before, operation });
  const expected = expectedSchematicLayout(operation, before.source, before.schematic, {}), trace = new Map<number, number>();
  const originalClone = globalThis.structuredClone;
  const observed = await turnsDuring(async (turns) => {
    const spy = t.mock.method(globalThis, "structuredClone", <T>(value: T, options?: StructuredSerializeOptions): T => {
      if (Array.isArray(value)) {
        const heading: unknown = value.find((entry: unknown) => record(entry) && entry["id"] === "heading");
        if (record(heading) && record(heading["body"])) {
          const y = heading["body"]["y"]; if (typeof y === "number" && y < 0 && !trace.has(y)) { trace.set(y, turns()); }
        }
      }
      return originalClone(value, options);
    });
    try { return await expectedSchematicLayoutCooperatively(operation, before.source, before.schematic, {}); }
    finally { spy.mock.restore(); }
  });
  assert.deepEqual(observed.result, expected); assert.equal(trace.size, stepCount);
  for (let step = 2; step <= stepCount; step += 1) {
    const previous = trace.get(-(step - 1)); const next = trace.get(-step); assert.notEqual(previous, undefined); assert.notEqual(next, undefined);
    assert.ok(next !== undefined && previous !== undefined && next > previous, `No event-loop turn between simulation steps ${step - 1} and ${step}`);
  }
  assert.equal(JSON.stringify({ before, operation }), raw);
});

void test("inner-step creation keeps every ID, native/source field, clone/order proof and adapter byte identical", async () => {
  const f = cloneFixture(), raw = JSON.stringify(f);
  const projected = expectedSchematicLayout(f.operation, f.before.source, f.before.schematic, f.ids, f.evidence);
  assert.equal(projected.netFlags.length, 1); assert.equal(projected.labelBindings.length, 1); assert.ok(projected.wireOrders.length > 0);
  assert.deepEqual(await expectedSchematicLayoutCooperatively(f.operation, f.before.source, f.before.schematic, f.ids, f.evidence), projected);
  const adapter = await turnsDuring(() => buildSchematicLayoutAdapterCooperatively(f.operation, f.before.source, f.before.schematic, f.ids, f.evidence));
  assert.deepEqual(adapter.result, buildSchematicLayoutAdapter(f.operation, f.before.source, f.before.schematic, f.ids, f.evidence));
  assert.ok(adapter.turns >= f.operation.operations.length);
  const prepared = await turnsDuring(() => prepareDesignActionCooperatively(f.operation, f.before, { createdIds: f.ids }));
  assert.deepEqual(prepared.result, prepareDesignAction(f.operation, f.before, { createdIds: f.ids })); assert.ok(prepared.turns >= f.operation.operations.length);
  assert.equal(JSON.stringify(f), raw);
});

void test("cooperative direct and coordinator effect proofs retain every synchronous field", async () => {
  const f = cloneFixture(), projected = expectedSchematicLayout(f.operation, f.before.source, f.before.schematic, f.ids, f.evidence);
  const after = { source: projected.expected, schematic: projected.native }, prepared = prepareDesignAction(f.operation, f.before, { createdIds: f.ids });
  const expected = verifySchematicLayoutEffect(f.operation, f.before.source, after.source, f.before.schematic, after.schematic, f.ids, f.evidence, true);
  const observed = await turnsDuring(() => verifySchematicLayoutEffectCooperatively(f.operation, f.before.source, after.source, f.before.schematic, after.schematic, f.ids, f.evidence, true));
  assert.deepEqual(observed.result, expected); assert.ok(observed.turns >= f.operation.operations.length);
  assert.deepEqual(await verifyDesignActionCooperatively(prepared.compiled, f.before, after, { createdIds: f.ids, layoutCloneLifecycle: true }),
    verifyDesignAction(prepared.compiled, f.before, after, { createdIds: f.ids, layoutCloneLifecycle: true }));
});

void test("inner-step inverse preserves complete forward/reverse proof and unavailable rollback", async () => {
  const before = fixture(), operation = batch(); const expected = inverseSchematicLayout(operation, before.source, before.schematic, {}); assert.ok(expected);
  const observed = await turnsDuring(() => inverseSchematicLayoutCooperatively(operation, before.source, before.schematic, {}));
  assert.deepEqual(observed.result, expected); assert.ok(observed.turns >= operation.operations.length * 2);
  assert.deepEqual(await inverseDesignActionCooperatively(operation, before, { createdIds: {} }), inverseDesignAction(operation, before, { createdIds: {} }));
  const forward = expectedSchematicLayout(operation, before.source, before.schematic, {});
  assert.deepEqual(expectedSchematicLayout(expected, forward.expected, forward.native, {}).expected, before.source);
  const f = cloneFixture(); assert.equal(await inverseSchematicLayoutCooperatively(f.operation, f.before.source, f.before.schematic, f.ids, f.evidence),
    inverseSchematicLayout(f.operation, f.before.source, f.before.schematic, f.ids, f.evidence));
});

void test("inner-step persistence preserves all complete-project proof fields and peer guards", async () => {
  const before = fixture(), operation = batch(), projected = expectedSchematicLayout(operation, before.source, before.schematic, {});
  const input = { before: before.history, after: history(projected.expected), expectedBefore: before.source, expectedAfter: projected.expected,
    beforeNative: before.schematic, afterNative: projected.native }; const evidence = { history: before.history, templates: {} };
  const expected = verifySchematicLayoutPersistence(operation, input, {}, evidence);
  const observed = await turnsDuring(() => verifySchematicLayoutPersistenceCooperatively(operation, input, {}, evidence));
  assert.deepEqual(observed.result, expected); assert.ok(observed.turns >= operation.operations.length * 2);
  const invalid = structuredClone(input), peer = invalid.after.documents.find((d) => d.uuid === "peer")?.records[0]; assert.ok(peer); peer.body["nested"] = { preserve: [true, 0] };
  await sameRefusal(() => verifySchematicLayoutPersistence(operation, invalid, {}, evidence), () => verifySchematicLayoutPersistenceCooperatively(operation, invalid, {}, evidence));
  const pending = verifySchematicLayoutPersistenceCooperatively(operation, input, {}, evidence);
  await nextTurn();
  const row = input.after.documents[0]?.records[0]; assert.ok(row); row.body["nested"] = { mutation: true };
  assert.deepEqual(await pending, expected);
});

void test("all cooperative preparation entries capture nested operation, source, native, template, history and IDs before await", async () => {
  const runners = [
    (f: ReturnType<typeof cloneFixture>): Promise<unknown> => expectedSchematicLayoutCooperatively(f.operation, f.before.source, f.before.schematic, f.ids, f.evidence),
    (f: ReturnType<typeof cloneFixture>): Promise<unknown> => buildSchematicLayoutAdapterCooperatively(f.operation, f.before.source, f.before.schematic, f.ids, f.evidence),
    (f: ReturnType<typeof cloneFixture>): Promise<unknown> => assertDesignActionSupportedCooperatively(f.operation, f.before, { createdIds: f.ids }),
    (f: ReturnType<typeof cloneFixture>): Promise<unknown> => prepareDesignActionCooperatively(f.operation, f.before, { createdIds: f.ids }),
  ];
  for (const run of runners) {
    const f = cloneFixture(); const expected = await run(structuredClone(f)), pending = run(f);
    await nextTurn();
    f.operation.operations.splice(0); f.ids["clone"] = "f".repeat(16);
    const component = f.before.schematic.components[0], future = f.before.source.objects.find((row) => row.id === "future"); assert.ok(component); assert.ok(future);
    component.body["x"] = 999; future.body["nested"] = { preserve: [true, 1] };
    const pin = f.before.layoutTemplates["template"]?.components[0]?.pins[0]; assert.ok(pin); pin.net = "FOREIGN";
    const library = f.before.history.documents.find((d) => d.uuid === "symbol")?.records.find((r) => r.type === "PIN"); assert.ok(library); library.body["length"] = 999;
    assert.deepEqual(await pending, expected);
  }
});

void test("cooperative effect snapshots both states, late template evidence and journal IDs before await", async () => {
  const f = cloneFixture(), projected = expectedSchematicLayout(f.operation, f.before.source, f.before.schematic, f.ids, f.evidence);
  const after = { source: projected.expected, schematic: projected.native };
  const expected = verifySchematicLayoutEffect(f.operation, f.before.source, after.source, f.before.schematic, after.schematic, f.ids, f.evidence, true);
  const pending = verifySchematicLayoutEffectCooperatively(f.operation, f.before.source, after.source, f.before.schematic, after.schematic, f.ids, f.evidence, true);
  await nextTurn();
  const pin = after.schematic.components.find((c) => c.id === "part")?.pins[0]; assert.ok(pin); pin.net = "FOREIGN";
  const attr = f.evidence.templates["template"]?.components[0]?.attributes[0]; assert.ok(attr); attr.body["value"] = "changed";
  const row = f.evidence.history.documents[0]?.records[0]; assert.ok(row); row.body["nested"] = { mutation: true };
  f.ids["new-label"] = "f".repeat(16);
  assert.deepEqual(await pending, expected);
});

void test("inner-step validation keeps exact refusal messages and never reaches a downstream dispatch", async () => {
  const locked = fixture(); const component = locked.schematic.components[0]; assert.ok(component); component.locked = true;
  await sameRefusal(() => { assertDesignActionSupported(batch(), locked, { createdIds: {} }); }, () => assertDesignActionSupportedCooperatively(batch(), locked, { createdIds: {} }));
  await sameRefusal(() => prepareDesignAction(batch(), locked, { createdIds: {} }), () => prepareDesignActionCooperatively(batch(), locked, { createdIds: {} }));
  const f = cloneFixture(); f.ids["unused"] = "f".repeat(16);
  await sameRefusal(() => expectedSchematicLayout(f.operation, f.before.source, f.before.schematic, f.ids, f.evidence),
    () => expectedSchematicLayoutCooperatively(f.operation, f.before.source, f.before.schematic, f.ids, f.evidence));
  await sameRefusal(() => buildSchematicLayoutAdapter(f.operation, f.before.source, f.before.schematic, f.ids, f.evidence),
    () => buildSchematicLayoutAdapterCooperatively(f.operation, f.before.source, f.before.schematic, f.ids, f.evidence));
  const valid = fixture(); const operation = batch(), projected = expectedSchematicLayout(operation, valid.source, valid.schematic, {});
  const pin = projected.native.components[0]?.pins[0]; assert.ok(pin); pin.net = "FOREIGN";
  await sameRefusal(() => verifySchematicLayoutEffect(operation, valid.source, projected.expected, valid.schematic, projected.native, {}),
    () => verifySchematicLayoutEffectCooperatively(operation, valid.source, projected.expected, valid.schematic, projected.native, {}));
});
