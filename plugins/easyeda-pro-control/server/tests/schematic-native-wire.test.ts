import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { test } from "node:test";
import { sha256Json } from "../src/core.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import type { NativeSourceObject } from "../src/document-source.ts";
import { prepareDesignAction, prepareDesignActionCooperatively, verifyDesignAction, verifyDesignActionCooperatively } from "../src/design-action.ts";
import { buildSchematicNativeReadExpression, schematicNativeSnapshotSchema } from "../src/schematic-native-adapter.ts";
import type { SchematicNativeSnapshot } from "../src/schematic-native-adapter.ts";
import { buildSchematicNativeWireAdapter, verifySchematicNativeWireEffect } from "../src/schematic-native-wire.ts";
import { compileSchematicOperation } from "../src/schematic-operations.ts";
import { verifySchematicSourceEffect } from "../src/schematic-source-proof.ts";

function execute(expression: string, runtime: object): unknown {
  // oxlint-disable-next-line no-new-func, typescript/no-implied-eval -- Execute only this maintained builder against a synthetic native model; no editor or caller program.
  const run = new Function("globalThis", `return ${expression};`);
  // oxlint-disable-next-line typescript/no-unsafe-call -- Generated output is unknown until independently checked below.
  return run(runtime);
}
class Point {
  public x: number;
  public y: number;
  public constructor(x: number, y: number) { this.x = x; this.y = y; }
  public scale(value: number): Point { return new Point(this.x * value, this.y * value); }
}
interface Line {
  id: string;
  parent: object | null;
  isConnected: boolean;
  points: Point[];
  strokeColor: string | null;
  strokeWidth: number | null;
  strokeStyle: number | null;
  getConsistencyData: () => object;
}
interface Change { id: string; points: Point[]; strokeColor: string | null; strokeWidth: number | null; strokeStyle: number | null }
interface State {
  runs: number; mutations: number; updates: number; prematureSourceReads: number; foreign: string; innerDrift: boolean;
  collateral: "none" | "net" | "visibility" | "position" | "style" | "order"; afterRunDrift: boolean; rejectRun: boolean;
  finishGate?: Promise<boolean>; callbackComplete?: () => void;
}
function fixture(netVisible = false): {
  runtime: object; state: State; ids: Map<string, object>;
  capture: () => SchematicNativeSnapshot; recategorize: () => void;
} {
  const state: State = { runs: 0, mutations: 0, updates: 0, prematureSourceReads: 0, foreign: "unchanged", innerDrift: false,
    collateral: "none", afterRunDrift: false, rejectRun: false };
  const ids = new Map<string, object>();
  const sourceIds = new Set<string>();
  const attrs = [
    { id: "net", key: "NET", value: "SYNTHETIC_NET", zIndex: 15, visible: netVisible },
    { id: "relevance", key: "Relevance", value: "[]", zIndex: 14, visible: false },
  ].map((data) => ({ id: data.id, key: data.key, value: data.value, zIndex: data.zIndex, visible: data.visible, parent: null as object | null, isConnected: true,
    x: data.key === "Relevance" ? null : 0, y: data.key === "Relevance" ? null : -4,
    getConsistencyData(): object { return { parentId: "wire", key: this.key, value: this.value, zIndex: this.zIndex,
      ...(this.key === "Relevance" ? {} : { locked: false }), x: this.x, y: this.y, rotation: 0, fontSize: null, color: null, keyVisible: false, valueVisible: this.visible }; },
  }));
  const derived = { id: "derived", parent: null as object | null, isConnected: true, notAddHistory: true,
    modelType: "Junction", tagName: "Junction", cmdKey: "junction", getConsistencyData(): undefined { return undefined; } };
  const wire = {
    id: "wire", tagName: "NetGroup", type: "wire", parent: { id: "$$root" }, isConnected: true, locked: false,
    lines: [] as Line[], children: [] as object[],
    getConsistencyData(): object { return { zIndex: 1, locked: false }; },
    getAttr(): typeof attrs { return attrs; },
    setLines(changes: Change[]): void {
      state.mutations += 1;
      const previous = new Map(this.lines.map((line) => [line.id, line]));
      const next = changes.map((change) => {
        const line = previous.get(change.id) ?? makeLine(change.id, change.points);
        Object.assign(line, change); previous.delete(change.id); return line;
      });
      for (const line of previous.values()) { line.parent = null; line.isConnected = false; ids.delete(line.id); }
      this.lines = next; this.children = [...next, ...attrs, derived];
    },
  };
  function makeLine(id: string, points: Point[]): Line {
    const line: Line = { id, parent: wire, isConnected: true, points, strokeColor: null, strokeWidth: 1, strokeStyle: 0,
      getConsistencyData(): object {
        const a = this.points[0], b = this.points[1]; assert.ok(a && b);
        return { fillColor: null, fillStyle: null, strokeColor: this.strokeColor, strokeWidth: this.strokeWidth,
          strokeStyle: this.strokeStyle === null ? null : ["SOLID", "SHORT_DASH", "DOT", "DOT_DASH"][this.strokeStyle],
          startX: a.x, startY: a.y, endX: b.x, endY: b.y, lineGroup: "wire" };
      },
    };
    ids.set(id, line); return line;
  }
  derived.parent = wire;
  for (let index = 0; index < 12; index += 1) {
    wire.lines.push(makeLine(`line${String(index).padStart(2, "0")}`, [new Point(index * 10, 0), new Point(index * 10 + 10, 0)]));
  }
  for (const attr of attrs) { attr.parent = wire; ids.set(attr.id, attr); }
  wire.children = [...wire.lines, ...attrs, derived]; ids.set(wire.id, wire);
  function recategorize(): void {
    // Independent no-pin endpoint counts for this synthetic group. A delayed
    // Native category pass must retain the already-proved projected order.
    const endpoints = new Map<string, Set<string>>();
    for (const line of wire.lines) {
      for (const point of line.points) {
        const key = JSON.stringify([point.x, point.y]), lines = endpoints.get(key) ?? new Set<string>();
        lines.add(line.id); endpoints.set(key, lines);
      }
    }
    const dots = [...endpoints.values()].filter((lines) => lines.size === 1 || lines.size >= 3).length;
    for (const attr of attrs) { attr.zIndex = wire.lines.length + dots + (attr.key === "NET" ? 1 : 0); }
  }
  for (const id of ids.keys()) { sourceIds.add(id); }
  sourceIds.add("foreign");
  let exports = 0;
  const doc = {
    uuid: "page", tabId: "page@project", isSchSheetDoc(): boolean { return true; },
    shapeManager: {
      getModels(): never[] { return []; }, idManager: { get(id: string): object | undefined { return ids.get(id); } },
      actionRunner: {
        // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Match native run(callback), including its awaited completion and false-on-cancel contract.
        async run(callback: () => void): Promise<boolean> {
          state.runs += 1;
          if (state.rejectRun) { return false; }
          if (state.innerDrift) { state.foreign = "inner drift"; }
          // oxlint-disable-next-line promise/prefer-await-to-callbacks, node/callback-return -- Native run invokes its synchronous mutation callback before delayed history completion; this fixture must preserve that ordering.
          try { callback(); } catch { return false; }
          state.callbackComplete?.();
          if (state.finishGate !== undefined) { await state.finishGate; }
          // Match pinned history onDidRecord registration at action end.
          // Direct setLines/idManager insertion is earlier, during the callback.
          sourceIds.clear(); for (const id of ids.keys()) { sourceIds.add(id); } sourceIds.add("foreign");
          recategorize();
          if (state.collateral === "order") { const attr = attrs[0]; assert.ok(attr); attr.zIndex += 1; }
          if (state.afterRunDrift) { state.foreign = "after-run drift"; }
          return true;
        },
      },
      bboxMonitor: { update(): void {
        state.updates += 1;
        for (const attr of attrs) { attr.zIndex += 100; }
        if (state.collateral === "net") { const attr = attrs[0]; assert.ok(attr); attr.value = "UNEXPECTED_NET"; }
        if (state.collateral === "visibility") { const attr = attrs[0]; assert.ok(attr); attr.visible = true; }
        if (state.collateral === "position") { const attr = attrs[0]; assert.ok(attr); attr.x = 1; }
        if (state.collateral === "style") { const line = wire.lines[0]; assert.ok(line); line.strokeWidth = 2; }
      } },
    },
    consistencyImpl: { getSourceCode(): string {
      exports += 1; const time = 1000 + exports;
      if (state.mutations > 0 && wire.lines.some((line) => !sourceIds.has(line.id))) { state.prematureSourceReads += 1; }
      const rows = [{ id: wire.id, type: "WIRE", body: wire.getConsistencyData() },
        ...wire.lines.map((line) => ({ id: line.id, type: "LINE", body: line.getConsistencyData() })),
        ...attrs.map((attr) => ({ id: attr.id, type: "ATTR", body: attr.getConsistencyData() })),
        { id: "foreign", type: "TEXT", body: { value: state.foreign } }].filter((row) => sourceIds.has(row.id)).toSorted((a, b) => a.id.localeCompare(b.id));
      return `{"type":"DOCHEAD"}||${JSON.stringify({ docType: "SCH_PAGE", uuid: "page", client: exports.toString(16).padStart(16, "0"), updateTime: time, version: String(time) })}|\n${rows.map((row, index) => `${JSON.stringify({ id: row.id, type: row.type, ticket: index + 1 })}||${JSON.stringify(row.body)}|\n`).join("")}`;
    } },
  };
  const runtime = { crypto: webcrypto, SCH: { docMemoryManager: { getActiveDoc(): typeof doc { return doc; } } } };
  return { runtime, state, ids, recategorize, capture: () => schematicNativeSnapshotSchema.parse(execute(buildSchematicNativeReadExpression({ documentUuid: "page", tabId: "page@project" }), runtime)) };
}
function operation(): object {
  const lines = Array.from({ length: 10 }, (_value, index) => [index * 10, 0, index * 10 + 10, 0]);
  return { id: "reroute", action: "sch.wire.modify", target: { primitiveId: "wire" },
    patch: { line: [...lines, [0, 0, 10, 0], [5, 0, 15, 0], [100, 0, 100, 30]], color: null, lineWidth: 1, lineType: 0 } };
}

function changedNative(native: SchematicNativeSnapshot, mutate: (rows: NativeSourceObject[]) => void): SchematicNativeSnapshot {
  const source = parseDocumentSource(native.source);
  const rows = source.objects.map((row) => structuredClone(row));
  mutate(rows);
  return schematicNativeSnapshotSchema.parse({ ...structuredClone(native),
    source: `{"type":"DOCHEAD"}||${JSON.stringify(source.document)}|\n${rows.map((row) => `${JSON.stringify({ id: row.id, type: row.type })}||${JSON.stringify(row.body)}|\n`).join("")}` });
}
function requiredRow(rows: readonly NativeSourceObject[], id: string): NativeSourceObject {
  const row = rows.find((entry) => entry.id === id); assert.ok(row); return row;
}
type Attribute = SchematicNativeSnapshot["components"][number]["attributes"][number];
const attribute = (id: string, key: string, zIndex: number, parentId = "part"): Attribute => ({
  id, key, value: key, symbolValue: key, blockValue: null, instanceValue: null,
  body: { parentId, key, value: key, x: null, y: null, zIndex, keyVisible: false, valueVisible: false },
});
const findAttribute = (native: SchematicNativeSnapshot, key: string): Attribute => {
  const found = native.components.flatMap((part) => [...part.attributes, ...part.pins.flatMap((pin) => pin.attributes)]).find((attr) => attr.key === key);
  assert.ok(found); return found;
};

void test("native wire retains thirteen segments and NET content with exact derived category orders", async () => {
  const f = fixture();
  const before = f.capture();
  const source = parseDocumentSource(before.source);
  const input = operation();
  const adapter = buildSchematicNativeWireAdapter(input, source, before);
  assert.equal(adapter.profile, "easyeda-pro-control.schematic-native-wire.v2");
  const prepared = prepareDesignAction(input, { source, schematic: before }, { targetId: "wire" });
  assert.equal(prepared.adapterProfile, adapter.profile);
  assert.deepEqual(prepared.expectedSource, adapter.expected);
  assert.equal(prepared.code.includes("eda.sch_PrimitiveWire.modify"), false);
  assert.ok(prepared.code.includes(adapter.expression));
  assert.deepEqual(await prepareDesignActionCooperatively(input, { source, schematic: before }, { targetId: "wire" }), prepared);
  assert.deepEqual(adapter.descriptor, buildSchematicNativeWireAdapter(input, source, before).descriptor);
  assert.deepEqual(adapter.descriptor.attributeOrders.toSorted((a, b) => a.id.localeCompare(b.id)), [
    { id: "net", key: "NET", beforeOrder: 15, order: 18 },
    { id: "relevance", key: "Relevance", beforeOrder: 14, order: 17 },
  ]);
  assert.deepEqual(adapter.descriptor.preservedAttributeIds, ["net", "relevance"]);
  assert.equal(adapter.descriptor.allocatedLineIds.length, 1); assert.equal(adapter.descriptor.lineIds.length, 13);
  assert.deepEqual(adapter.descriptor.allocatedLineIds, [sha256Json({ profile: "easyeda-pro-control.schematic-native-wire.v1",
    operation: compileSchematicOperation(input).operation, beforeSourceSha256: source.sha256, wireId: "wire", index: 12 }).slice(0, 16)]);
  assert.deepEqual(await execute(adapter.expression, f.runtime), { primitiveId: "wire" });
  const afterNative = f.capture();
  const after = parseDocumentSource(afterNative.source);
  assert.deepEqual(after, adapter.expected);
  assert.deepEqual(requiredRow(after.objects, "wire"), requiredRow(source.objects, "wire"));
  for (const order of adapter.descriptor.attributeOrders) {
    const prior = requiredRow(source.objects, order.id);
    const current = requiredRow(after.objects, order.id);
    assert.deepEqual(current, { ...prior, body: { ...prior.body, zIndex: order.order } });
  }
  assert.throws(() => verifySchematicSourceEffect(compileSchematicOperation(input), source, after), /attributes changed outside the patch/u);
  verifySchematicNativeWireEffect(input, source, after, before, afterNative);
  verifyDesignAction(compileSchematicOperation(input), { source, schematic: before }, { source: after, schematic: afterNative }, { targetId: "wire" });
  await verifyDesignActionCooperatively(compileSchematicOperation(input), { source, schematic: before }, { source: after, schematic: afterNative }, { targetId: "wire" });
  f.recategorize();
  const delayedNative = f.capture();
  assert.deepEqual(parseDocumentSource(delayedNative.source), after);
  verifySchematicNativeWireEffect(input, source, after, before, delayedNative);
  const reprepared = buildSchematicNativeWireAdapter(input, source, before);
  assert.deepEqual(reprepared.descriptor, adapter.descriptor); assert.deepEqual(reprepared.expected, after);
  assert.equal(f.state.runs, 1); assert.equal(f.state.mutations, 1); assert.equal(f.state.updates, 1);
  assert.equal(f.state.prematureSourceReads, 0);
});

void test("native wire awaits complete action and detects drift after the callback", async () => {
  const f = fixture();
  const before = f.capture();
  const gate = Promise.withResolvers<boolean>();
  const callback = Promise.withResolvers<boolean>();
  f.state.finishGate = gate.promise; f.state.callbackComplete = (): void => { callback.resolve(true); };
  const adapter = buildSchematicNativeWireAdapter(operation(), parseDocumentSource(before.source), before);
  let resolved = false;
  const result = (async (): Promise<unknown> => { const value: unknown = await execute(adapter.expression, f.runtime); resolved = true; return value; })();
  await callback.promise; assert.equal(resolved, false); f.state.afterRunDrift = true; gate.resolve(true);
  await assert.rejects(result, /SCH_WIRE_EFFECT_MISMATCH/u); assert.equal(resolved, false);
});

void test("native wire rejects unsupported patches and stale source or native identity before mutation", async () => {
  const f = fixture();
  const before = f.capture();
  const source = parseDocumentSource(before.source);
  for (const patch of [{ line: [0, 0, 1, 0], color: null, lineWidth: 1, lineType: 0, net: "" },
    { line: [0, 0, 1, 0], color: null, lineWidth: 1 }, { color: null, lineWidth: 1, lineType: 0 }]) {
    assert.throws(() => buildSchematicNativeWireAdapter({ id: "bad", action: "sch.wire.modify", target: { primitiveId: "wire" }, patch }, source, before), /omitted net/u);
    assert.throws(() => prepareDesignAction({ id: "bad", action: "sch.wire.modify", target: { primitiveId: "wire" }, patch }, { source, schematic: before }, { targetId: "wire" }), /omitted net/u);
  }
  const adapter = buildSchematicNativeWireAdapter(operation(), source, before);
  f.state.foreign = "drift";
  await assert.rejects(async () => { await execute(adapter.expression, f.runtime); }, /SCH_WIRE_BASELINE_CHANGED/u);
  assert.equal(f.state.runs, 0); assert.equal(f.state.mutations, 0);
  f.state.foreign = "unchanged";
  const allocated = adapter.descriptor.allocatedLineIds[0]; assert.ok(allocated !== undefined && allocated.length > 0); f.ids.set(allocated, { id: allocated });
  await assert.rejects(async () => { await execute(adapter.expression, f.runtime); }, /SCH_WIRE_ID_COLLISION/u);
  assert.equal(f.state.runs, 0); assert.equal(f.state.mutations, 0);
  f.ids.delete(allocated); f.state.innerDrift = true;
  await assert.rejects(async () => { await execute(adapter.expression, f.runtime); }, /SCH_WIRE_ACTION_REJECTED/u);
  assert.equal(f.state.mutations, 0);
});

void test("native wire refuses NET content, visibility, position, style and delayed order collateral", async () => {
  for (const collateral of ["net", "visibility", "position", "style", "order", "none"] as const) {
    const f = fixture();
    const before = f.capture(); f.state.collateral = collateral; f.state.rejectRun = collateral === "none";
    const adapter = buildSchematicNativeWireAdapter(operation(), parseDocumentSource(before.source), before);
    let commitReached = false;
    await assert.rejects(async () => { await execute(adapter.expression, f.runtime); commitReached = true; },
      collateral === "order" ? /SCH_WIRE_ATTR_CHANGED/u : /SCH_WIRE_ACTION_REJECTED/u);
    assert.equal(commitReached, false);
    if (collateral === "none") { assert.equal(f.state.mutations, 0); }
  }
});

void test("native wire preserves an originally visible NET through category ordering", async () => {
  const f = fixture(true);
  const before = f.capture();
  const source = parseDocumentSource(before.source);
  const input = operation();
  const adapter = buildSchematicNativeWireAdapter(input, source, before);
  await execute(adapter.expression, f.runtime);
  f.recategorize();
  const afterNative = f.capture();
  const after = parseDocumentSource(afterNative.source);
  assert.deepEqual(after, adapter.expected);
  assert.equal(requiredRow(after.objects, "net").body["valueVisible"], true);
  assert.equal(requiredRow(after.objects, "net").body["value"], "SYNTHETIC_NET");
  verifySchematicNativeWireEffect(input, source, after, before, afterNative);
});

void test("native wire effect proof admits only projected target attribute orders", async () => {
  const f = fixture();
  const before = f.capture();
  const source = parseDocumentSource(before.source);
  const input = operation();
  const adapter = buildSchematicNativeWireAdapter(input, source, before);
  await execute(adapter.expression, f.runtime);
  const after = f.capture(), originals = structuredClone({ before, source, after });
  const changes: ((rows: NativeSourceObject[]) => void)[] = [
    (rows) => { requiredRow(rows, "net").body["value"] = "UNEXPECTED_NET"; },
    (rows) => { requiredRow(rows, "net").body["valueVisible"] = true; },
    (rows) => { requiredRow(rows, "net").body["keyVisible"] = true; },
    (rows) => { requiredRow(rows, "net").body["x"] = 1; },
    (rows) => { requiredRow(rows, "net").body["zIndex"] = 19; },
    (rows) => { requiredRow(rows, "relevance").body["zIndex"] = 14; },
    (rows) => { requiredRow(rows, "relevance").body["value"] = "[1]"; },
    (rows) => { requiredRow(rows, "foreign").body["value"] = "changed"; },
    (rows) => { requiredRow(rows, "line00").body["strokeWidth"] = 2; },
    (rows) => { requiredRow(rows, "wire").body["zIndex"] = 2; },
    (rows) => { rows.push({ id: "unknown", type: "ATTR", body: { ...requiredRow(rows, "net").body, key: "Unknown" } }); },
  ];
  for (const change of changes) {
    const corrupt = changedNative(after, change), corruptSource = parseDocumentSource(corrupt.source);
    assert.throws(() => verifySchematicNativeWireEffect(input, source, corruptSource, before, corrupt));
    assert.throws(() => verifyDesignAction(compileSchematicOperation(input), { source, schematic: before },
      { source: corruptSource, schematic: corrupt }, { targetId: "wire" }));
  }
  assert.throws(() => verifySchematicNativeWireEffect(input, source, adapter.expected, before, before));
  assert.deepEqual({ before, source, after }, originals);
});

void test("native wire preparation refuses unknown attributes, noncanonical baselines and shared ownership", () => {
  const before = fixture().capture();
  const changes: ((rows: NativeSourceObject[]) => void)[] = [
    (rows) => { requiredRow(rows, "relevance").body["zIndex"] = 3; },
    (rows) => { requiredRow(rows, "net").body["zIndex"] = 4; },
    (rows) => { requiredRow(rows, "relevance").body["x"] = 0; },
    (rows) => { requiredRow(rows, "relevance").body["value"] = ""; },
    (rows) => { requiredRow(rows, "relevance").body["valueVisible"] = true; },
    (rows) => { requiredRow(rows, "net").body["value"] = ""; },
    (rows) => { rows.push({ id: "unknown", type: "ATTR", body: { ...requiredRow(rows, "net").body, key: "Unknown" } }); },
    (rows) => { rows.push({ id: "duplicate-net", type: "ATTR", body: { ...requiredRow(rows, "net").body } }); },
    (rows) => {
      rows.push({ id: "other-wire", type: "WIRE", body: { zIndex: 2, locked: false } },
        { id: "other-line", type: "LINE", body: { ...requiredRow(rows, "line00").body, lineGroup: "other-wire", startX: 0, startY: 0, endX: 0, endY: 20 } });
    },
  ];
  for (const change of changes) {
    const corrupt = changedNative(before, change), source = parseDocumentSource(corrupt.source);
    assert.throws(() => buildSchematicNativeWireAdapter(operation(), source, corrupt));
    assert.throws(() => prepareDesignAction(operation(), { source, schematic: corrupt }, { targetId: "wire" }));
  }
});

void test("native wire effect permits only unstored inherited identity regeneration across reopen", () => {
  const stored = attribute("stored", "Manufacturer", 0);
  const component = { id: "part", kind: "part", locked: false,
    body: { x: 500, y: 500, rotation: 0, isMirror: false, zIndex: 2 },
    attributes: [attribute("a".repeat(16), "Part", 1), attribute("e".repeat(16), "Description", 2), stored],
    pins: [{ id: "part-pin", body: { x: 500, y: 500 }, net: "", noConnect: null,
      attributes: [attribute("c".repeat(16), "Pin Number", 0, "part-pin")] }],
  };
  const initial = schematicNativeSnapshotSchema.parse({ ...fixture().capture(), components: [component] });
  const before = changedNative(initial, (rows) => {
    rows.push({ id: component.id, type: "COMPONENT", body: component.body }, { id: stored.id, type: "ATTR", body: stored.body });
  });
  before.source = before.source.replace('"docType":"SCH_PAGE"', '"docType":"SCH_PAGE","editVersion":"3.2.149.88089769"');
  const source = parseDocumentSource(before.source);
  const input = operation();
  const adapter = buildSchematicNativeWireAdapter(input, source, before);
  const after = changedNative(before, (rows) => { rows.splice(0, rows.length, ...adapter.expected.objects.map((row) => structuredClone(row))); });
  findAttribute(after, "Part").id = "b".repeat(16);
  findAttribute(after, "Description").id = "f".repeat(16);
  findAttribute(after, "Pin Number").id = "d".repeat(16);
  const originals = structuredClone({ before, source, after });
  const proof = verifySchematicNativeWireEffect(input, source, adapter.expected, before, after);
  assert.equal(proof.nativeIdentity.profile, "native-wire-unstored-attribute-identity.v1");
  assert.deepEqual(proof.nativeIdentity.changes.map(({ key, beforeId, afterId, beforeZ, afterZ, stored: isStored }) =>
    ({ key, beforeId, afterId, beforeZ, afterZ, stored: isStored })).toSorted((a, b) => a.key.localeCompare(b.key)), [
    { key: "Description", beforeId: "e".repeat(16), afterId: "f".repeat(16), beforeZ: 2, afterZ: 2, stored: false },
    { key: "Part", beforeId: "a".repeat(16), afterId: "b".repeat(16), beforeZ: 1, afterZ: 1, stored: false },
    { key: "Pin Number", beforeId: "c".repeat(16), afterId: "d".repeat(16), beforeZ: 0, afterZ: 0, stored: false },
  ]);
  const integrated = verifyDesignAction(compileSchematicOperation(input), { source, schematic: before },
    { source: adapter.expected, schematic: after }, { targetId: "wire" });
  assert.ok("nativeIdentity" in integrated); assert.deepEqual(integrated.nativeIdentity, proof.nativeIdentity);
  const changes: ((native: SchematicNativeSnapshot) => void)[] = [
    (native) => { findAttribute(native, "Manufacturer").id = "9".repeat(16); },
    (native) => { findAttribute(native, "Part").body["value"] = "changed"; },
    (native) => { findAttribute(native, "Part").value = "changed"; },
    (native) => { findAttribute(native, "Part").body["zIndex"] = 2; findAttribute(native, "Description").body["zIndex"] = 1; },
    (native) => { findAttribute(native, "Pin Number").body["zIndex"] = 1; },
    (native) => { findAttribute(native, "Pin Number").id = "malformed-id"; },
    (native) => { findAttribute(native, "Part").body["x"] = 1; },
  ];
  for (const change of changes) {
    const corrupt = structuredClone(after); change(corrupt);
    assert.throws(() => verifySchematicNativeWireEffect(input, source, adapter.expected, before, corrupt));
  }
  assert.deepEqual({ before, source, after }, originals);
});
