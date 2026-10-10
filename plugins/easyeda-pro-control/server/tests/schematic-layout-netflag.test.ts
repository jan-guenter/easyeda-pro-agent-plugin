/* oxlint-disable import/max-dependencies -- Net-flag tests exercise source/native, checkpoint, wire identity and guarded writer contracts together. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { webcrypto } from "node:crypto";
import { runInNewContext } from "node:vm";
import { sha256Json } from "../src/core.ts";
import { parseDocumentSource } from "../src/document-source.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "../src/document-source.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "../src/native-history.ts";
import { SCHEMATIC_NATIVE_PROFILE } from "../src/schematic-native-adapter.ts";
import type { SchematicNativeComponent, SchematicNativeSnapshot } from "../src/schematic-native-adapter.ts";
import { alignSchematicNetFlagCloneLifecycle, netFlagCloneStepSchema, planHistoricalSchematicNetFlagClone, planSchematicNetFlagClone, verifySchematicNetFlagClone } from "../src/schematic-layout-netflag.ts";
import { expectedSchematicLayout, inverseSchematicLayout, prepareSchematicLayoutWireGroupRepair, verifySchematicLayoutEffect, verifySchematicLayoutPersistence } from "../src/schematic-layout-batch.ts";
import { deriveSchematicWireGroupRepair, verifySchematicFlagWireGroups } from "../src/schematic-layout-wire-groups.ts";
import { schematicNewWireOrders } from "../src/schematic-wire-order.ts";

function source(objects: readonly NativeSourceObject[], uuid = "sheet"): NativeSourceSnapshot {
  const value = { schema: "easyeda-pro-control.document-source.v1" as const, document: { docType: "SCH_PAGE", uuid, editVersion: "3.2.149.88089769" }, objects: objects.toSorted((a, b) => a.id.localeCompare(b.id)) };
  return { ...value, sha256: sha256Json(value) };
}
function encode(snapshot: NativeSourceSnapshot): string {
  return `{"type":"DOCHEAD"}||${JSON.stringify(snapshot.document)}|\n${snapshot.objects.map((entry) => `${JSON.stringify({ type: entry.type, id: entry.id })}||${JSON.stringify(entry.body)}`).join("|\n")}|\n`;
}
function document(uuid: string, docType: string, records: readonly NativeSourceObject[]): NativeDocumentSnapshot {
  const value = { uuid, docType, metadata: { docType, uuid }, records: records.toSorted((a, b) => a.id.localeCompare(b.id)) };
  return { ...value, records: value.records.map((entry, index) => ({ ...entry, ticket: index + 1, client: null })), semanticSha256: sha256Json(value) };
}
function fixture(): { source: NativeSourceSnapshot; native: SchematicNativeSnapshot; history: NativeHistorySnapshot } {
  const component: SchematicNativeComponent = { id: "flag", kind: "netflag", locked: false,
    body: { partId: "part", x: 10, y: -20, rotation: 0, isMirror: false, attrs: {}, zIndex: 10.5 },
    attributes: ["Symbol", "Device", "Name", "Global Net Name", "Relevance"].map((key, index) => {
      const value = ["symbol", "device", "GND", "GND", "[]"][index]; assert.notEqual(value, undefined); if (value === undefined) { throw new Error("Fixture attribute missing."); }
      return { id: `attr${index}`, key, value, symbolValue: value, blockValue: value, instanceValue: null,
        body: { parentId: "flag", key, value, x: key === "Name" ? 10 : null, y: key === "Name" ? -10 : null, zIndex: index + 1, strikeout: false, valueVisible: null, keyVisible: null } };
    }),
    pins: [{ id: "flag-pin", body: { x: 10, y: -20, rotation: 270, length: 10, locked: false }, net: "GND", noConnect: null,
      attributes: [{ id: "a".repeat(16), key: "Pin Number", value: "1", symbolValue: "1", blockValue: null, instanceValue: null,
        body: { parentId: "flag-pin", key: "Pin Number", value: null, x: 10, y: -10, zIndex: 1, strikeout: false } }] }],
  };
  const anchor: SchematicNativeComponent = { id: "part-anchor", kind: "part", locked: false,
    body: { partId: "anchor-part", x: 10, y: -20, rotation: 0, isMirror: false, attrs: {}, zIndex: 9.5, locked: false }, attributes: [],
    pins: [{ id: "anchor-pin", body: { x: 10, y: -20, rotation: 0, length: 10, locked: false }, attributes: [], net: "GND", noConnect: null }] };
  const current = source([{ id: anchor.id, type: "COMPONENT", body: anchor.body }, { id: component.id, type: "COMPONENT", body: component.body }, ...component.attributes.map((entry) => ({ id: entry.id, type: "ATTR", body: entry.body }))]);
  component.attributes.push({ id: "b".repeat(16), key: "Description", value: "", symbolValue: "", blockValue: "", instanceValue: null,
    body: { parentId: "flag", key: "Description", value: "", x: null, y: null, zIndex: 6 } });
  const documents = [document("sheet", "SCH_PAGE", current.objects), document("destination", "SCH_PAGE", []),
    document("symbol", "SYMBOL", [{ id: "META", type: "META", body: { docType: 18 } }, { id: "part", type: "PART", body: {} }, { id: "pin", type: "PIN", body: { partId: "part", x: 0, y: 0, rotation: 270, length: 10 } }]),
    document("device", "DEVICE", [{ id: "META", type: "META", body: { attributes: { Symbol: "symbol", Description: "" } } }])];
  const history: NativeHistorySnapshot = { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: "project", branchUuid: "b", headHistoryUuid: "h",
    checkpointSha256: "a".repeat(64), historyRowCount: 1, chunkCount: 1, plaintextBytes: 1, documents,
    semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
  return { source: current, native: { profile: SCHEMATIC_NATIVE_PROFILE, document: { documentUuid: "sheet", tabId: "sheet@project" }, source: encode(current), components: [anchor, component].toSorted((a, b) => a.id.localeCompare(b.id)) }, history };
}
const step = { id: "clone", action: "sch.net-flag.clone", template: { sheetUuid: "sheet", componentId: "flag" }, x: 100, y: 50 };
function allocate(): (key: string) => string { let counter = 100; return () => { counter += 1; return counter.toString(16).padStart(16, "0"); }; }
function nativeAttributes(values: SchematicNativeComponent["attributes"]): unknown[] {
  return values.map((attr) => ({ ...attr, getConsistencyData: (): typeof attr.body => attr.body,
    getValue: (): typeof attr.value => attr.value, getInstanceValue: (): typeof attr.instanceValue => attr.instanceValue }));
}

void test("checkpoint-bound flag cloning preserves the rail and inheritance, remaps owned records and proves new native pins", () => {
  const before = fixture(), destination = source([], "destination");
  const planned = planSchematicNetFlagClone(step, destination, before.history, before.native, allocate());
  assert.equal(planned.records.length, 7);
  assert.equal(planned.descriptor.materializedDeviceAttributes[0]?.key, "Description");
  assert.equal(planned.component.body["x"], 100); assert.equal(planned.component.body["y"], -50);
  assert.equal(planned.component.pins[0]?.net, "GND");
  assert.equal(planned.descriptor.excludedFromBomAndPcbBy, "native-symbol-type-18");
  assert.equal(planned.descriptor.watchedOmittedStrikeout.length, 6);
  assert.ok(planned.component.attributes.every((entry) => !Object.hasOwn(entry.body, "strikeout")));
  assert.equal(planned.component.pins[0]?.attributes[0]?.body["strikeout"], undefined);
  assert.equal(planned.component.attributes.find((entry) => entry.key === "Device")?.body["x"], null);
  const afterSource = source(planned.records, "destination"); const actual = structuredClone(planned.component);
  const inherited = actual.pins[0]?.attributes[0]; assert.ok(inherited); inherited.id = "b".repeat(16);
  const after = { profile: SCHEMATIC_NATIVE_PROFILE, document: { documentUuid: "destination", tabId: "destination@project" }, source: encode(afterSource), components: [actual] };
  verifySchematicNetFlagClone(planned.descriptor, afterSource, after);
  const pin = actual.pins[0]; assert.ok(pin); pin.net = "FOREIGN";
  assert.throws(() =>{  verifySchematicNetFlagClone(planned.descriptor, afterSource, after); }, /unsupported or changed/u);
  assert.equal(netFlagCloneStepSchema.safeParse({ ...step, net: "FOREIGN" }).success, false);
});

void test("flag templates reject altered checkpoint bodies, nonflag libraries, inclusion overrides and missing journal IDs", () => {
  const before = fixture(), destination = source([], "destination");
  const changed = structuredClone(before.history), record = changed.documents[0]?.records[0]; assert.ok(record); record.body["value"] = "OTHER";
  assert.throws(() => planSchematicNetFlagClone(step, destination, changed, before.native, allocate()), /unsupported or changed/u);
  const inclusion = structuredClone(before.native); const model = inclusion.components[0]; const attr = model?.attributes[0]; assert.ok(model); assert.ok(attr);
  model.attributes.push({ ...attr, id: "inclusion", key: "Add into BOM", value: "yes", body: { ...attr.body, key: "Add into BOM", value: "yes" } });
  assert.throws(() => planSchematicNetFlagClone(step, destination, before.history, inclusion, allocate()), /unsupported or changed/u);
  assert.throws(() => planSchematicNetFlagClone(step, destination, before.history, before.native, () => ""), /unsupported or changed/u);
  const symbol = before.history.documents.find((entry) => entry.uuid === "symbol"); assert.ok(symbol);
  const records = symbol.records.map(({ id, type, body }) => ({ id, type, body: type === "META" ? { docType: 2 } : body }));
  const history = { ...before.history, documents: before.history.documents.map((entry) => entry.uuid === "symbol" ? document("symbol", "SYMBOL", records) : entry) };
  assert.throws(() => planSchematicNetFlagClone(step, destination, history, before.native, allocate()), /unsupported or changed/u);
});

void test("reopened flag templates require the complete first-clock null-Relevance order before allocating", () => {
  const make = (): ReturnType<typeof fixture> => {
    const f = fixture(), model = f.native.components.find((entry) => entry.id === "flag"); assert.ok(model);
    const keys = ["Symbol", "Global Net Name", "Name", "Device", "Relevance", "Description"];
    for (const attr of model.attributes) { attr.body["zIndex"] = keys.indexOf(attr.key) + 1; }
    const relevance = model.attributes.find((attr) => attr.key === "Relevance"); assert.ok(relevance); relevance.body["rotation"] = null;
    const rows = f.source.objects.map((row) => {
      const attr = model.attributes.find((entry) => entry.id === row.id);
      return attr === undefined ? structuredClone(row) : { id: attr.id, type: "ATTR", body: structuredClone(attr.body) };
    });
    f.source = source(rows); f.native.source = encode(f.source);
    const page = document("sheet", "SCH_PAGE", rows.map((row) => row.id === relevance.id ? Object.assign(structuredClone(row), { body: { ...row.body, zIndex: null } }) : row));
    const firstKeys = ["Symbol", "Device", "Relevance", "Global Net Name", "Name"];
    for (const row of page.records.filter((entry) => entry.type === "ATTR")) {
      const firstTicket = firstKeys.indexOf(String(row.body["key"])) + 10;
      Object.assign(row, { firstTicket, firstClient: "creator", ticket: row.body["key"] === "Device" ? 50 : firstTicket });
    }
    const original = f.history.documents.find((entry) => entry.uuid === "symbol"); assert.ok(original);
    const symbol = document("symbol", "SYMBOL", [...original.records.map(({ id, type, body }) => ({ id, type, body })), ...keys.slice(0, 3).map((key, index) => ({
      id: `library-${key}`, type: "ATTR", body: { partId: "part", parentId: "part", key, zIndex: index + 1 },
    }))]);
    const documents = f.history.documents.map((entry) => {
      if (entry.uuid === "sheet") { return page; }
      return entry.uuid === "symbol" ? symbol : entry;
    });
    f.history = { ...f.history, documents, semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
    return f;
  };
  const before = make(), destination = source([], "destination"), unchanged = JSON.stringify(before);
  const planned = planSchematicNetFlagClone(step, destination, before.history, before.native, allocate());
  assert.equal(JSON.stringify(before), unchanged);
  assert.deepEqual(planned.descriptor.templateHydration, [{ id: "attr4", fields: ["zIndex"] }]);
  const actualSource = source(planned.records, "destination");
  verifySchematicNetFlagClone(planned.descriptor, actualSource, {
    profile: SCHEMATIC_NATIVE_PROFILE, document: { documentUuid: "destination", tabId: "destination@project" },
    source: encode(actualSource), components: [planned.component],
  });
  const mutations: ((f: ReturnType<typeof fixture>) => void)[] = [
    (f) => { const row = f.history.documents.find((d) => d.uuid === "sheet")?.records.find((r) => r.body["key"] === "Device"); assert.ok(row); Reflect.deleteProperty(row, "firstTicket"); },
    (f) => { const row = f.history.documents.find((d) => d.uuid === "sheet")?.records.find((r) => r.body["key"] === "Device"); assert.ok(row); Reflect.deleteProperty(row, "firstClient"); },
    (f) => { const row = f.history.documents.find((d) => d.uuid === "sheet")?.records.find((r) => r.body["key"] === "Device"); assert.ok(row); Object.assign(row, { firstTicket: 12, firstClient: "creator" }); },
    (f) => { const row = f.history.documents.find((d) => d.uuid === "sheet")?.records.find((r) => r.body["key"] === "Device"); assert.ok(row); Object.assign(row, { firstTicket: 13 }); },
    (f) => { const attr = f.native.components.find((m) => m.id === "flag")?.attributes.find((a) => a.key === "Description"); assert.ok(attr); attr.body["zIndex"] = 99; },
    (f) => { const pin = f.native.components.find((m) => m.id === "flag")?.pins[0]; assert.ok(pin); pin.net = "FOREIGN"; },
    (f) => { const pin = f.native.components.find((m) => m.id === "flag")?.pins[0]; assert.ok(pin); pin.noConnect = { id: "nc", value: "yes", body: { parentId: pin.id, key: "NO_CONNECT", value: "yes" } }; },
    (f) => {
      const page = f.history.documents.find((d) => d.uuid === "sheet"); assert.ok(page);
      const changed = document("sheet", "SCH_PAGE", page.records.map(({ id, type, body }) => ({ id, type, body: body["key"] === "Name" ? { ...body, x: 11 } : body })));
      const records = changed.records.map((row) => { const prior = page.records.find((entry) => entry.id === row.id); assert.ok(prior); return { ...prior, body: row.body }; });
      f.history = { ...f.history, documents: f.history.documents.map((d) => d.uuid === "sheet" ? { ...changed, records } : d) };
    },
  ];
  for (const mutate of mutations) {
    const changed = make(); mutate(changed); let allocations = 0;
    assert.throws(() => planSchematicNetFlagClone(step, destination, changed.history, changed.native, () => { allocations += 1; return "f".repeat(16); }));
    assert.equal(allocations, 0);
  }
});

void test("layout batch proves a cloned flag's lead and rejects a floating flag without offering a lossy inverse", () => {
  const before = fixture(), evidence = { history: before.history, templates: { sheet: before.native } };
  const operation = { id: "layout", action: "sch.layout.batch", operations: [
    { ...step, x: 30, y: 20 },
    { id: "lead", action: "sch.wire.create", properties: { line: [10, 20, 30, 20], color: null, lineWidth: null, lineType: null } },
  ] };
  const result = expectedSchematicLayout(operation, before.source, before.native, undefined, evidence);
  assert.equal(verifySchematicLayoutEffect(operation, before.source, result.expected, before.native, result.native, result.createdIds, evidence).added.length, 10);
  assert.equal(inverseSchematicLayout(operation, before.source, before.native, result.createdIds, evidence), undefined);
  const floating = { ...operation, operations: [operation.operations[0]] };
  assert.throws(() => expectedSchematicLayout(floating, before.source, before.native, undefined, evidence), /not physically wired/u);
});

void test("flag preflight rejects touching distinct WIRE groups and retained repair preserves exact line identity", () => {
  const before = fixture(), evidence = { history: before.history, templates: { sheet: before.native } };
  const main = { id: "main", action: "sch.wire.create", properties: { line: [10, 20, 30, 20, 30, 40], color: null, lineWidth: null, lineType: null } };
  const clone = { ...step, x: 30, y: 40 };
  const result = expectedSchematicLayout({ id: "one-group", action: "sch.layout.batch", operations: [main, clone] }, before.source, before.native, undefined, evidence);
  verifySchematicFlagWireGroups(result.expected, result.native, result.netFlags);
  const leadId = result.createdIds["main:segment:1"], mainId = result.createdIds["main"];
  assert.ok(mainId !== undefined); assert.ok(leadId !== undefined);
  const dropId = "d".repeat(16), relevanceId = "e".repeat(16);
  const group = result.expected.objects.find((row) => row.id === mainId), relevance = result.expected.objects.find((row) => row.id === result.createdIds["main:relevance"]);
  assert.ok(group); assert.ok(relevance);
  const rows = result.expected.objects.map((row) => row.id === leadId ? { ...row, body: { ...row.body, lineGroup: dropId } } : structuredClone(row));
  rows.push({ ...group, id: dropId, body: { ...group.body, zIndex: 99 } },
    { ...relevance, id: relevanceId, body: { ...relevance.body, parentId: dropId, zIndex: 1 } });
  const legacy = source(rows), native = { ...result.native, source: encode(legacy) };
  assert.throws(() => { verifySchematicFlagWireGroups(legacy, native, result.netFlags); }, /ONE native WIRE/u);
  const operations = [{ ...main, properties: { ...main.properties, line: [10, 20, 30, 20] } },
    { ...main, id: "drop", properties: { ...main.properties, line: [30, 20, 30, 40] } }, clone];
  const ids = { ...result.createdIds, drop: dropId, "drop:relevance": relevanceId, "drop:segment:0": leadId };
  const repaired = deriveSchematicWireGroupRepair({ operations }, before.source, legacy, native, ids, result.netFlags);
  assert.deepEqual(repaired.descriptor.merges, [{ flagId: result.createdIds["clone"], mainWireId: mainId, dropWireId: dropId, lineId: leadId, relevanceId }]);
  assert.equal(repaired.source.objects.find((row) => row.id === leadId)?.body["lineGroup"], mainId);
  assert.ok(!repaired.source.objects.some((row) => [dropId, relevanceId].includes(row.id)));
  const noPart = { ...result.native, components: result.native.components.filter((model) => model.kind !== "part") };
  assert.throws(() => { verifySchematicFlagWireGroups(result.expected, noPart, result.netFlags); }, /ONE native WIRE/u);
  const ambiguous = source([...rows, { ...relevance, id: "f".repeat(16), body: { ...relevance.body, parentId: dropId, key: "NET", value: "GND" } }]);
  assert.throws(() => deriveSchematicWireGroupRepair({ operations }, before.source, ambiguous, native, ids, result.netFlags), /unknown, named or locked/u);
  const diagonalRows = structuredClone(rows);
  const diagonalLead = diagonalRows.find((row) => row.id === leadId); assert.ok(diagonalLead); diagonalLead.body["endX"] = 31;
  const diagonal = source(diagonalRows);
  assert.throws(() => deriveSchematicWireGroupRepair({ operations }, before.source, diagonal, native, ids, result.netFlags), /geometry/u);
});

void test("retained wire-group writer guards and detaches only the defective group before exact import", async () => {
  const template = fixture();
  const anchor = template.native.components.find((model) => model.kind === "part"); assert.ok(anchor);
  const before = source(template.source.objects.filter((row) => row.id === anchor.id), "destination");
  const oldNative: SchematicNativeSnapshot = { profile: SCHEMATIC_NATIVE_PROFILE, document: { documentUuid: "destination", tabId: "destination@project" }, source: encode(before), components: [structuredClone(anchor)] };
  const evidence = { history: template.history, templates: { sheet: template.native } };
  const main = { id: "main", action: "sch.wire.create", properties: { line: [10, 20, 30, 20], color: null, lineWidth: null, lineType: null } };
  const drop = { ...main, id: "drop", properties: { ...main.properties, line: [30, 20, 30, 40] } };
  const clone = { ...step, x: 30, y: 40 };
  const prefix = expectedSchematicLayout({ id: "legacy", action: "sch.layout.batch", operations: [main, drop] }, before, oldNative, undefined, evidence);
  const ids = { ...prefix.createdIds };
  const allocateId = allocate();
  const flag = planSchematicNetFlagClone(clone, prefix.expected, template.history, template.native, (key) => { const id = allocateId(key); ids[key] = id; return id; });
  const records = new Map([...prefix.expected.objects, ...flag.records].map((row) => [row.id, structuredClone(row)]));
  const actual: SchematicNativeSnapshot = { ...prefix.native, components: [...prefix.native.components, flag.component].toSorted((a, b) => a.id.localeCompare(b.id)) };
  const groups = new Map(["main", "drop"].map((key) => { const id = ids[key], relevanceId = ids[`${key}:relevance`]; assert.ok(id !== undefined); assert.ok(relevanceId !== undefined); return [id, relevanceId]; }));
  for (const order of schematicNewWireOrders(before, records, actual, groups)) { const row = records.get(order.relevanceId); assert.ok(row); row.body["zIndex"] = order.zIndex; }
  const currentSource = source([...records.values()], "destination"); actual.source = encode(currentSource);
  const badPin = actual.components.find((model) => model.id === anchor.id)?.pins[0]; assert.ok(badPin); badPin.net = "$1N1";
  const operation = { id: "legacy", action: "sch.layout.batch", operations: [main, drop, clone] };
  const correction = prepareSchematicLayoutWireGroupRepair(operation, before, oldNative, ids, evidence, currentSource, actual);
  assert.equal(correction.misnamedPins.length, 1);
  assert.equal(correction.descriptor.merges.length, 1);
  assert.throws(() => expectedSchematicLayout(operation, before, oldNative, ids, evidence), /ONE native WIRE/u);
  const foreign = structuredClone(actual), foreignPin = foreign.components.find((model) => model.id === anchor.id)?.pins[0]; assert.ok(foreignPin); foreignPin.net = "OTHER";
  assert.throws(() => prepareSchematicLayoutWireGroupRepair(operation, before, oldNative, ids, evidence, currentSource, foreign), /generated-name defect/u);
  const tampered = structuredClone(correction.descriptor); const merge = tampered.merges[0]; assert.ok(merge); merge.mainWireId = "f".repeat(16);
  assert.throws(() => expectedSchematicLayout(operation, before, oldNative, ids, { ...evidence, wireGroupRepair: tampered }), /descriptor differs/u);

  const calls: string[] = [];
  const components = actual.components.map((model) => {
    const pins = model.pins.map((pin) => ({ ...pin, getConsistencyData: (): typeof pin.body => pin.body, getAttr: (): unknown[] => nativeAttributes(pin.attributes) }));
    return { ...model, cmdKey: model.kind, getConsistencyData: (): typeof model.body => model.body, getAttr: (): unknown[] => nativeAttributes(model.attributes),
      traversePins: (visit: (pin: unknown) => void): void => { for (const pin of pins) { visit(pin); } } };
  });
  interface Removable { id: string; parent: { id: string } | null; isConnected: boolean; getConsistencyData: () => Record<string, unknown> }
  const map = new Map<string, Removable>();
  const intent = correction.descriptor.merges[0]; assert.ok(intent);
  const attrRow = currentSource.objects.find((row) => row.id === intent.relevanceId), groupRow = currentSource.objects.find((row) => row.id === intent.dropWireId), leadRow = currentSource.objects.find((row) => row.id === intent.lineId);
  assert.ok(groupRow); assert.ok(leadRow); assert.ok(attrRow);
  const attr: Removable = { id: attrRow.id, parent: null, isConnected: true, getConsistencyData: () => attrRow.body };
  const lead: Removable = { id: leadRow.id, parent: null, isConnected: true, getConsistencyData: () => leadRow.body };
  const group = { id: groupRow.id, parent: { id: "$$root" } as { id: string } | null, isConnected: true, tagName: "NetGroup", type: "wire", locked: false,
    getConsistencyData: (): typeof groupRow.body => groupRow.body, lines: [] as Removable[], netNames: [], getCustomAttr: (): Removable[] => [attr],
    remove: (): boolean => { calls.push("remove"); group.parent = null; for (const item of [group, lead, attr]) { item.isConnected = false; map.delete(item.id); } return true; } };
  attr.parent = group; lead.parent = group;
  group.lines.push(lead); for (const item of [group, lead, attr]) { map.set(item.id, item); }
  let written = "";
  const head = { ...currentSource.document, client: "a".repeat(16), updateTime: 1, version: "1" };
  const raw = actual.source.replace(JSON.stringify(currentSource.document), JSON.stringify(head));
  const doc = { uuid: "destination", tabId: "destination@project", isSchSheetDoc: (): boolean => true,
    shapeManager: { getModels: (): typeof components => components, modelHelpers: { pin: { getSchPinNet: (pin: { net: string }): string => pin.net } },
      idManager: { get: (id: string): Removable | undefined => map.get(id), idMap: map },
      actionRunner: { run: async (action: () => Promise<void>): Promise<boolean> => { calls.push("action"); await action(); return true; } } },
    consistencyImpl: { getSourceCode: (): string => raw, setSourceCode: (value: string): Promise<boolean> => { calls.push("import"); assert.equal(map.size, 0); written = value; return Promise.resolve(true); } } };
  const context = { SCH: { docMemoryManager: { getActiveDoc: (): typeof doc => doc } }, Blob, DecompressionStream, Uint8Array, DataView, TextDecoder, atob, btoa, crypto: webcrypto };
  group.locked = true;
  await assert.rejects(Promise.resolve(runInNewContext(`(async()=>{${correction.code}})()`, context)), /WIRE_REMOVE_GUARD/u);
  assert.deepEqual(calls, ["action"]); assert.equal(map.size, 3);
  calls.length = 0; group.locked = false;
  assert.equal(await runInNewContext(`(async()=>{${correction.code}})()`, context), true);
  assert.deepEqual(calls, ["action", "remove", "import"]);
  assert.deepEqual(parseDocumentSource(written), correction.expectedSource);
});

void test("only reconstructed clone false backing fields align, while true strikeout and existing fields remain strict", () => {
  const before = fixture(), destination = source([], "destination");
  const planned = planSchematicNetFlagClone(step, destination, before.history, before.native, allocate());
  const component = structuredClone(planned.component), records = structuredClone(planned.records);
  const attributes = [...component.attributes, ...component.pins.flatMap((pin) => pin.attributes)];
  for (const field of planned.descriptor.watchedOmittedStrikeout) {
    const attr = attributes.find((entry) => entry.id === field.id); assert.ok(attr); attr.body["strikeout"] = false;
    const record = records.find((entry) => entry.id === field.id); if (record !== undefined) { record.body["strikeout"] = false; }
  }
  const observedSource = source(records, "destination");
  const observed = { profile: SCHEMATIC_NATIVE_PROFILE, document: { documentUuid: "destination", tabId: "destination@project" }, source: encode(observedSource), components: [component] };
  assert.throws(() => { verifySchematicNetFlagClone(planned.descriptor, observedSource, observed); }, /unsupported or changed/u);
  const aligned = alignSchematicNetFlagCloneLifecycle(planned.descriptor, observedSource, observed);
  assert.equal(aligned.proof.hydratedAttributes.length, 6);
  assert.equal(aligned.proof.rawSourceSha256, observedSource.sha256);
  assert.deepEqual(aligned.source, source(planned.records, "destination"));
  const attr = attributes[0]; assert.ok(attr); attr.body["strikeout"] = true;
  const record = records.find((entry) => entry.id === attr.id); assert.ok(record); record.body["strikeout"] = true;
  const changedSource = source(records, "destination"); observed.source = encode(changedSource);
  assert.throws(() => alignSchematicNetFlagCloneLifecycle(planned.descriptor, changedSource, observed), /unsupported or changed/u);
});

void test("reconstructed hidden clone order follows native Device-first rebuilding and rejects any other field or partial swap", () => {
  const before = fixture(), model = before.native.components[0]; assert.ok(model);
  const keys = ["Symbol", "Name", "Global Net Name", "Device", "Relevance", "Description"];
  for (const attr of model.attributes) {
    attr.body["zIndex"] = keys.indexOf(attr.key) + 1;
    if (attr.key === "Device") { attr.id = "attr9"; }
  }
  const template = source([...before.source.objects.filter((row) => row.id === "part-anchor"), { id: model.id, type: "COMPONENT", body: model.body },
    ...model.attributes.filter((attr) => attr.key !== "Description").map((attr) => ({ id: attr.id, type: "ATTR", body: attr.body }))]);
  before.native.source = encode(template);
  const documents = before.history.documents.map((entry) => {
    if (entry.uuid === "sheet") {
      const result = document("sheet", "SCH_PAGE", template.objects);
      for (const record of result.records) {
        Object.assign(record, { ticket: record.type === "ATTR" ? keys.indexOf(String(record.body["key"])) + 2 : 1 });
      }
      return result;
    }
    if (entry.uuid !== "symbol") { return entry; }
    return document("symbol", "SYMBOL", [...entry.records.map(({ id, type, body }) => ({ id, type, body })), ...keys.slice(0, 3).map((key, index) => ({
      id: `library-attr-${index}`, type: "ATTR", body: { partId: "part", parentId: "part", key, zIndex: index },
    }))]);
  });
  const history = { ...before.history, documents, semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
  const planned = planSchematicNetFlagClone(step, source([], "destination"), history, before.native, allocate());
  assert.equal(planned.descriptor.reconstructedHiddenAttributeOrder.length, 2);
  const component = structuredClone(planned.component), records = structuredClone(planned.records);
  for (const field of planned.descriptor.reconstructedHiddenAttributeOrder) {
    const attr = component.attributes.find((entry) => entry.id === field.id), record = records.find((entry) => entry.id === field.id);
    assert.ok(attr); assert.ok(record); attr.body["zIndex"] = field.reconstructedZIndex; record.body["zIndex"] = field.reconstructedZIndex;
  }
  const observedSource = source(records, "destination");
  const native = { profile: SCHEMATIC_NATIVE_PROFILE, document: { documentUuid: "destination", tabId: "destination@project" }, source: encode(observedSource), components: [component] };
  const originals = structuredClone({ observedSource, native });
  assert.throws(() => { verifySchematicNetFlagClone(planned.descriptor, observedSource, native); }, /unsupported or changed/u);
  const aligned = alignSchematicNetFlagCloneLifecycle(planned.descriptor, observedSource, native);
  assert.equal(aligned.proof.reorderedHiddenAttributes.length, 2);
  assert.equal(aligned.proof.rawSourceSha256, observedSource.sha256);
  assert.deepEqual(aligned.source, source(planned.records, "destination"));
  assert.deepEqual({ observedSource, native }, originals);
  const first = planned.descriptor.reconstructedHiddenAttributeOrder[0]; assert.ok(first);
  for (const patch of [{ zIndex: first.initialZIndex }, { x: 1 }, { value: "OTHER" }]) {
    const changedNative = structuredClone(native), changedRecords = structuredClone(records);
    const attr = changedNative.components[0]?.attributes.find((entry) => entry.id === first.id), row = changedRecords.find((entry) => entry.id === first.id);
    assert.ok(row); assert.ok(attr); Object.assign(row.body, patch); Object.assign(attr.body, patch);
    const changedSource = source(changedRecords, "destination"); changedNative.source = encode(changedSource);
    assert.throws(() => alignSchematicNetFlagCloneLifecycle(planned.descriptor, changedSource, changedNative), /unsupported or changed/u);
  }
});

function threeOrderFixture(): ReturnType<typeof fixture> {
  const before = fixture(), model = before.native.components.find((entry) => entry.id === "flag"); assert.ok(model);
  const keys = ["Symbol", "Global Net Name", "Name", "Device", "Relevance", "Description"];
  for (const attr of model.attributes) {
    attr.body["zIndex"] = keys.indexOf(attr.key) + 1;
    if (attr.key === "Description") { attr.id = "attr6"; attr.body["keyVisible"] = null; attr.body["valueVisible"] = null; }
    if (attr.key === "Relevance") { attr.id = "attr7"; }
    if (attr.key === "Device") { attr.id = "attr9"; }
  }
  model.attributes.sort((a, b) => a.id.localeCompare(b.id));
  const template = source([...before.source.objects.filter((row) => row.id === "part-anchor"), { id: model.id, type: "COMPONENT", body: model.body },
    ...model.attributes.filter((attr) => attr.key !== "Description").map((attr) => ({ id: attr.id, type: "ATTR", body: attr.body }))]);
  before.source = template; before.native.source = encode(template);
  const documents = before.history.documents.map((entry) => {
    if (entry.uuid === "sheet") {
      const result = document("sheet", "SCH_PAGE", template.objects);
      for (const record of result.records) { Object.assign(record, { ticket: record.type === "ATTR" ? keys.indexOf(String(record.body["key"])) + 2 : 1 }); }
      return result;
    }
    if (entry.uuid !== "symbol") { return entry; }
    return document("symbol", "SYMBOL", [...entry.records.map(({ id, type, body }) => ({ id, type, body })), ...keys.slice(0, 3).map((key, index) => ({
      id: `library-attr-${index}`, type: "ATTR", body: { partId: "part", parentId: "part", key, zIndex: index },
    }))]);
  });
  before.history = { ...before.history, documents, semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
  return before;
}

void test("reconstructed materialized Description order accepts only the exact hidden Device-first three-cycle", () => {
  const before = threeOrderFixture(), planned = planSchematicNetFlagClone(step, source([], "destination"), before.history, before.native, allocate());
  const order = planned.descriptor.reconstructedHiddenAttributeOrder;
  assert.deepEqual(order.map(({ key, initialZIndex, reconstructedZIndex }) => ({ key, initialZIndex, reconstructedZIndex })).toSorted((a, b) => a.key.localeCompare(b.key)), [
    { key: "Description", initialZIndex: 4, reconstructedZIndex: 5 }, { key: "Device", initialZIndex: 6, reconstructedZIndex: 4 },
    { key: "Relevance", initialZIndex: 5, reconstructedZIndex: 6 },
  ]);
  const component = structuredClone(planned.component), records = structuredClone(planned.records);
  for (const field of order) {
    const attr = component.attributes.find((entry) => entry.id === field.id), row = records.find((entry) => entry.id === field.id);
    assert.ok(row); assert.ok(attr); row.body["zIndex"] = field.reconstructedZIndex; attr.body["zIndex"] = field.reconstructedZIndex;
  }
  const observedSource = source(records, "destination");
  const native = { profile: SCHEMATIC_NATIVE_PROFILE, document: { documentUuid: "destination", tabId: "destination@project" }, source: encode(observedSource), components: [component] };
  const original = structuredClone({ observedSource, native });
  const aligned = alignSchematicNetFlagCloneLifecycle(planned.descriptor, observedSource, native);
  assert.equal(aligned.proof.reorderedHiddenAttributes.length, 3);
  assert.deepEqual(aligned.source, source(planned.records, "destination"));
  assert.deepEqual({ observedSource, native }, original);
  const description = order.find((entry) => entry.key === "Description"); assert.ok(description);
  for (const patch of [{ zIndex: description.initialZIndex }, { zIndex: 6 }, { x: 1 }, { valueVisible: true }, { value: "OTHER" }]) {
    const changedNative = structuredClone(native), changedRows = structuredClone(records);
    const attr = changedNative.components[0]?.attributes.find((entry) => entry.id === description.id), row = changedRows.find((entry) => entry.id === description.id);
    assert.ok(row); assert.ok(attr); Object.assign(row.body, patch); Object.assign(attr.body, patch);
    const changedSource = source(changedRows, "destination"); changedNative.source = encode(changedSource);
    assert.throws(() => alignSchematicNetFlagCloneLifecycle(planned.descriptor, changedSource, changedNative), /unsupported or changed/u);
  }
  const mixedRows = structuredClone(records);
  const mixed = mixedRows.find((row) => row.id === description.id); assert.ok(mixed); mixed.body["zIndex"] = description.initialZIndex;
  const mixedSource = source(mixedRows, "destination");
  assert.throws(() => alignSchematicNetFlagCloneLifecycle(planned.descriptor, mixedSource, { ...native, source: encode(mixedSource) }), /unsupported or changed|differs/u);
  const inverseNative = structuredClone(native), inverseRows = structuredClone(records);
  const inverseOrder: Record<string, number> = { Description: 6, Device: 5, Relevance: 4 };
  for (const field of order) {
    const attr = inverseNative.components[0]?.attributes.find((entry) => entry.id === field.id), row = inverseRows.find((entry) => entry.id === field.id);
    const inverseZ = inverseOrder[field.key]; assert.ok(typeof inverseZ === "number");
    assert.ok(row); assert.ok(attr); attr.body["zIndex"] = inverseZ; row.body["zIndex"] = inverseZ;
  }
  const inverseSource = source(inverseRows, "destination"); inverseNative.source = encode(inverseSource);
  assert.throws(() => alignSchematicNetFlagCloneLifecycle(planned.descriptor, inverseSource, inverseNative), /unsupported or changed/u);
});

void test("three-cycle clone persistence admits exact complete, Device-only and Description/Device durable orders", () => {
  const before = threeOrderFixture(), projectUuid = "c".repeat(32); before.native.document.tabId = `sheet@${projectUuid}`;
  const sourceMetadata = (entry: NativeDocumentSnapshot): NativeDocumentSnapshot => {
    const value = { uuid: entry.uuid, docType: entry.docType, metadata: before.source.document, records: entry.records.map(({ id, type, body }) => ({ id, type, body })) };
    return { ...entry, metadata: value.metadata, semanticSha256: sha256Json(value) };
  };
  const baselineDocuments = before.history.documents.map((entry) => entry.uuid === "sheet" ? sourceMetadata(entry) : entry);
  const history = { ...before.history, projectUuid, branchUuid: "d".repeat(32), headHistoryUuid: "e".repeat(32), checkpointSha256: "1".repeat(64),
    documents: baselineDocuments, semanticSha256: sha256Json(baselineDocuments.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
  const evidence = { history, templates: { sheet: before.native } };
  const operation = { id: "three-cycle-layout", action: "sch.layout.batch", operations: [
    { ...step, x: 30, y: 20 },
    { id: "lead", action: "sch.wire.create", properties: { line: [10, 20, 30, 20], color: null, lineWidth: null, lineType: null } },
  ] };
  const result = expectedSchematicLayout(operation, before.source, before.native, undefined, evidence);
  const descriptor = result.netFlags[0]; assert.ok(descriptor); assert.equal(descriptor.reconstructedHiddenAttributeOrder.length, 3);
  const exportedRows = structuredClone(result.expected.objects), reopened = structuredClone(result.native);
  const clone = reopened.components.find((entry) => entry.id === descriptor.component.id); assert.ok(clone);
  for (const field of descriptor.reconstructedHiddenAttributeOrder) {
    const attr = clone.attributes.find((entry) => entry.id === field.id), row = exportedRows.find((entry) => entry.id === field.id);
    assert.ok(attr); assert.ok(row); attr.body["zIndex"] = field.reconstructedZIndex; row.body["zIndex"] = field.reconstructedZIndex;
  }
  const exported = source(exportedRows); reopened.source = encode(exported);
  const aligned = alignSchematicNetFlagCloneLifecycle(descriptor, exported, reopened);
  assert.deepEqual(aligned.native.components, result.native.components);
  assert.deepEqual(aligned.source, result.expected);
  const checkpoint = (rows: readonly NativeSourceObject[]): NativeHistorySnapshot => {
    const documents = history.documents.map((entry) => entry.uuid === "sheet" ? sourceMetadata(document("sheet", "SCH_PAGE", rows)) : entry);
    return { ...history, checkpointSha256: "2".repeat(64), documents,
      semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
  };
  const input = { before: history, expectedBefore: before.source, expectedAfter: exported, beforeNative: before.native, afterNative: reopened };
  for (const variant of ["initial", "reconstructed", "device-only", "description-device"]) {
    const rows = structuredClone(result.expected.objects);
    for (const field of descriptor.reconstructedHiddenAttributeOrder) {
      const row = rows.find((entry) => entry.id === field.id); assert.ok(row);
      const refreshed = variant === "reconstructed" || (variant === "device-only" && field.key === "Device") ||
        (variant === "description-device" && field.key !== "Relevance");
      row.body["zIndex"] = refreshed ? field.reconstructedZIndex : field.initialZIndex;
    }
    assert.equal(verifySchematicLayoutPersistence(operation, { ...input, after: checkpoint(rows) }, result.createdIds, evidence)["ok"], true, variant);
  }
  const description = descriptor.reconstructedHiddenAttributeOrder.find((entry) => entry.key === "Description"); assert.ok(description);
  for (const patch of [{ zIndex: description.reconstructedZIndex }, { x: 1 }, { valueVisible: true }, { value: "OTHER" }]) {
    const rows = structuredClone(result.expected.objects);
    const row = rows.find((entry) => entry.id === description.id); assert.ok(row); Object.assign(row.body, patch);
    assert.throws(() => verifySchematicLayoutPersistence(operation, { ...input, after: checkpoint(rows) }, result.createdIds, evidence), /[Ss]chematic|[Cc]lone|[Ll]ayout/u);
  }
  for (const refreshed of [["Relevance"], ["Description", "Relevance"], ["Device", "Relevance"]]) {
    const rows = structuredClone(result.expected.objects);
    for (const field of descriptor.reconstructedHiddenAttributeOrder) {
      const row = rows.find((entry) => entry.id === field.id); assert.ok(row);
      row.body["zIndex"] = refreshed.includes(field.key) ? field.reconstructedZIndex : field.initialZIndex;
    }
    assert.throws(() => verifySchematicLayoutPersistence(operation, { ...input, after: checkpoint(rows) }, result.createdIds, evidence), /[Ss]chematic|[Cc]lone|[Ll]ayout/u);
  }
  for (const patch of [{ zIndex: 100 }, { x: 1 }, { valueVisible: true }, { value: "OTHER" }]) {
    const rows = structuredClone(result.expected.objects);
    for (const field of descriptor.reconstructedHiddenAttributeOrder) {
      const row = rows.find((entry) => entry.id === field.id); assert.ok(row);
      row.body["zIndex"] = field.key === "Relevance" ? field.initialZIndex : field.reconstructedZIndex;
    }
    const row = rows.find((entry) => entry.id === description.id); assert.ok(row); Object.assign(row.body, patch);
    assert.throws(() => verifySchematicLayoutPersistence(operation, { ...input, after: checkpoint(rows) }, result.createdIds, evidence), /[Ss]chematic|[Cc]lone|[Ll]ayout/u);
  }
  const inverseOrder: Record<string, number> = { Description: 6, Device: 5, Relevance: 4 }, inverseRows = structuredClone(result.expected.objects);
  for (const field of descriptor.reconstructedHiddenAttributeOrder) {
    const inverseZ = inverseOrder[field.key], row = inverseRows.find((entry) => entry.id === field.id);
    assert.ok(row); assert.ok(typeof inverseZ === "number"); row.body["zIndex"] = inverseZ;
  }
  assert.throws(() => verifySchematicLayoutPersistence(operation, { ...input, after: checkpoint(inverseRows) }, result.createdIds, evidence), /[Ss]chematic|[Cc]lone|[Ll]ayout/u);
});

void test("layout persistence retains raw checkpoint hashes and proves only clone false-field reconstruction", () => {
  const before = fixture();
  const projectUuid = "c".repeat(32);
  before.native.document.tabId = `sheet@${projectUuid}`;
  const checkpoint = (snapshot: NativeSourceSnapshot, hash: string): NativeHistorySnapshot => {
    const documents = before.history.documents.map((entry) => {
      if (entry.uuid !== "sheet") { return structuredClone(entry); }
      const value = { uuid: "sheet", docType: "SCH_PAGE", metadata: snapshot.document, records: snapshot.objects };
      return { ...value, records: value.records.map((record, index) => ({ ...record, ticket: index + 1, client: null })), semanticSha256: sha256Json(value) };
    });
    return { ...before.history, projectUuid, branchUuid: "d".repeat(32), headHistoryUuid: "e".repeat(32), checkpointSha256: hash,
      documents, semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
  };
  const history = checkpoint(before.source, "1".repeat(64));
  const evidence = { history, templates: { sheet: before.native } };
  const operation = { id: "layout", action: "sch.layout.batch", operations: [
    { ...step, x: 30, y: 20 },
    { id: "lead", action: "sch.wire.create", properties: { line: [10, 20, 30, 20], color: null, lineWidth: null, lineType: null } },
  ] };
  const result = expectedSchematicLayout(operation, before.source, before.native, undefined, evidence);
  const after = checkpoint(result.expected, "2".repeat(64)), reopened = structuredClone(result.native), rows = structuredClone(result.expected.objects);
  const descriptor = result.netFlags[0]; assert.ok(descriptor);
  const clone = reopened.components.find((component) => component.id === descriptor.component.id); assert.ok(clone);
  const attributes = [...clone.attributes, ...clone.pins.flatMap((pin) => pin.attributes)];
  for (const field of descriptor.watchedOmittedStrikeout) {
    const attr = attributes.find((entry) => entry.id === field.id); assert.ok(attr); attr.body["strikeout"] = false;
    const row = rows.find((entry) => entry.id === field.id); if (row !== undefined) { row.body["strikeout"] = false; }
  }
  const reopenedSource = source(rows); reopened.source = encode(reopenedSource);
  const input = { before: history, after, expectedBefore: before.source, expectedAfter: reopenedSource, beforeNative: before.native, afterNative: reopened };
  const originals = structuredClone(input);
  const proof = verifySchematicLayoutPersistence(operation, input, result.createdIds, evidence);
  assert.equal(proof["ok"], true);
  assert.equal(proof["beforeCheckpointSha256"], history.checkpointSha256);
  assert.equal(proof["afterCheckpointSha256"], after.checkpointSha256);
  assert.equal(proof["rawExpectedAfterSourceSha256"], reopenedSource.sha256);
  assert.equal(proof["comparisonSourceSha256"], result.expected.sha256);
  assert.deepEqual(input, originals);
  const changed = structuredClone(result.expected.objects);
  const name = changed.find((entry) => entry.body["parentId"] === clone.id && entry.body["key"] === "Name"); assert.ok(name); name.body["value"] = "OTHER";
  assert.throws(() => verifySchematicLayoutPersistence(operation, { ...input, after: checkpoint(source(changed), "3".repeat(64)) }, result.createdIds, evidence), /another cloned attribute field/u);
  const foreign = structuredClone(result.expected.objects);
  const existing = foreign.find((entry) => entry.id === "flag"); assert.ok(existing); existing.body["x"] = 11;
  assert.throws(() => verifySchematicLayoutPersistence(operation, { ...input, after: checkpoint(source(foreign), "4".repeat(64)) }, result.createdIds, evidence), /Unreviewed schematic component coordinate reconstruction|Schematic storage changed an unrequested record: flag\/COMPONENT/u);
});

void test("historical clone recovery preserves the retained ID pool and validates the sole materialized Description", () => {
  const before = fixture(), destination = source([], "destination");
  const planned = planSchematicNetFlagClone(step, destination, before.history, before.native, allocate());
  const component = structuredClone(planned.component), records = structuredClone(planned.records).map(({ id, type, body }) => ({ id, type, body }));
  const description = component.attributes.find((attr) => attr.key === "Description"); assert.ok(description);
  const record = records.find((entry) => entry.id === description.id); assert.ok(record);
  description.id = "c".repeat(16); record.id = description.id;
  const actualSource = source(records, "destination");
  const keys: string[] = [], oldAllocate = allocate();
  const recovered = planHistoricalSchematicNetFlagClone(step, destination, before.history, before.native, (key) => { keys.push(key); return oldAllocate(key); }, actualSource);
  assert.deepEqual(keys, ["clone", "clone:attr:0", "clone:attr:1", "clone:attr:2", "clone:attr:3", "clone:attr:4"]);
  assert.deepEqual(recovered.records.toSorted((a, b) => a.id.localeCompare(b.id)), actualSource.objects);
  verifySchematicNetFlagClone(recovered.descriptor, actualSource, { profile: SCHEMATIC_NATIVE_PROFILE,
    document: { documentUuid: "destination", tabId: "destination@project" }, source: encode(actualSource), components: [component] });
  record.body["value"] = "Foreign text";
  assert.throws(() => planHistoricalSchematicNetFlagClone(step, destination, before.history, before.native, allocate(), source(records, "destination")), /unsupported or changed/u);
});
