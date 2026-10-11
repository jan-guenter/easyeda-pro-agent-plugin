import assert from "node:assert/strict";
import { test } from "node:test";
import { parseDocumentSource } from "../src/document-source.ts";
import type { NativeSourceObject } from "../src/document-source.ts";
import { SCHEMATIC_FLAT_TOPOLOGY_PROFILE, buildSchematicFlatTopologyExpression, schematicFlatTopologyObservationSchema, verifySchematicFlatTopology } from "../src/schematic-flat-topology.ts";
import type { SchematicFlatTopologyObservation } from "../src/schematic-flat-topology.ts";

function encode(uuid: string, records: readonly NativeSourceObject[]): string {
  return `${JSON.stringify({ type: "DOCHEAD" })}||${JSON.stringify({ docType: "SCH_PAGE", uuid })}|\n${records.map(({ id, type, body }) => `${JSON.stringify({ id, type })}||${JSON.stringify(body)}|\n`).join("")}`;
}
function fixture(): SchematicFlatTopologyObservation {
  const attributes = ["Unique ID", "Designator", "Convert to PCB"].map((key, index) => ({ id: `attribute${String(index)}`, key,
    value: ["unique-part", "R1", "yes"][index] ?? "", body: { parentId: "part", key, value: ["unique-part", "R1", "yes"][index] ?? "" } }));
  const pinAttributes = [{ id: "pin-number", key: "Pin Number", value: "1", body: { parentId: "pin", key: "Pin Number", value: "1" } }];
  const symbolBody = { x: 0, y: 0, partId: "library-part" };
  const pinBody = { x: 0, y: 0 };
  const wireBody = { zIndex: 1 };
  const lineBody = { startX: 0, startY: 0, endX: 10, endY: 0, lineGroup: "wire" };
  const nameBody = { key: "NET", value: "SIGNAL", parentId: "wire" };
  const records = [{ id: "part", type: "COMPONENT", body: symbolBody }, ...attributes.map(({ id, body }) => ({ id, type: "ATTR", body })),
    ...pinAttributes.map(({ id, body }) => ({ id, type: "ATTR", body })), { id: "wire", type: "WIRE", body: wireBody },
    { id: "line", type: "LINE", body: lineBody }, { id: "net-name", type: "ATTR", body: nameBody }];
  return schematicFlatTopologyObservationSchema.parse({ profile: SCHEMATIC_FLAT_TOPOLOGY_PROFILE,
    scope: { projectUuid: "project", schematicUuid: "schematic", activePageUuid: "page", activeTabId: "page@project", pageIds: ["page"] },
    settings: { defaultNetName: true, netLabelInterPageConnection: true }, pages: [{ uuid: "page", tabId: "page@project", source: encode("page", records),
      symbols: [{ id: "part", kind: "part", body: symbolBody, partCount: 1, partNumber: 1, attributes,
        pins: [{ id: "pin", number: "1", origin: [0, 0], noConnect: false, noConnectAttribute: null, body: pinBody, attributes: pinAttributes }] }],
      wires: [{ id: "wire", body: wireBody, names: [{ id: "net-name", key: "Name", value: "SIGNAL", body: nameBody }], lines: [{ id: "line", body: lineBody, points: [[0, 0], [10, 0]] }] }],
      contacts: [{ point: [0, 0], lineIds: ["line"], pinIds: ["pin"] }, { point: [10, 0], lineIds: ["line"], pinIds: [] }] }] });
}
function pageOf(value: SchematicFlatTopologyObservation): SchematicFlatTopologyObservation["pages"][number] {
  const page = value.pages[0]; assert.ok(page); return page;
}
function rewriteSource(value: SchematicFlatTopologyObservation, mutate: (records: NativeSourceObject[]) => void): void {
  const page = pageOf(value);
  const records = [...parseDocumentSource(page.source).objects];
  mutate(records); page.source = encode(page.uuid, records);
}
function refuses(mutate: (value: SchematicFlatTopologyObservation) => void, reason: RegExp): void {
  const value = fixture(); mutate(value); assert.throws(() => verifySchematicFlatTopology(value), reason);
}

void test("flat topology proves the exact named-wire endpoint and full page source", () => {
  const value = fixture();
  const before = JSON.stringify(value);
  const proof = verifySchematicFlatTopology(value);
  assert.deepEqual(proof.topology, [{ uniqueId: "unique-part", designator: "R1", pins: [{ pinNumber: "1", net: "SIGNAL" }] }]);
  assert.equal(proof.compiledCacheUsed, false); assert.equal(proof.componentCount, 1); assert.equal(proof.pinCount, 1);
  assert.equal(proof.sourceSha256ByPage["page"], parseDocumentSource(pageOf(value).source).sha256);
  assert.equal(JSON.stringify(value), before);
});
void test("flat topology admits a proved disconnected pin without inventing a generated net", () => {
  const value = fixture();
  const page = pageOf(value);
  const pin = page.symbols[0]?.pins[0]; assert.ok(pin);
  pin.origin = [20, 0]; pin.body = { x: 20, y: 0 }; pin.noConnect = true;
  pin.noConnectAttribute = { id: "no-connect", key: "NO_CONNECT", value: "yes", body: { parentId: pin.id, key: "NO_CONNECT", value: "yes" } };
  const first = page.contacts[0]; assert.ok(first); first.pinIds = [];
  page.contacts.push({ point: [20, 0], lineIds: [], pinIds: ["pin"] });
  assert.equal(verifySchematicFlatTopology(value).topology[0]?.pins[0]?.net, "");
});
void test("flat topology refuses omitted pages, duplicate declarations and a changed active binding", () => {
  refuses((value) => { value.scope.pageIds.push("unloaded"); }, /declared pages/u);
  refuses((value) => { value.scope.pageIds.push("page"); }, /duplicate/u);
  refuses((value) => { value.scope.activeTabId = "other"; }, /active page/u);
});
void test("flat topology refuses source omission and contradictory native bodies", () => {
  refuses((value) => { pageOf(value).symbols = []; }, /source components/u);
  refuses((value) => { pageOf(value).wires = []; }, /source wires/u);
  refuses((value) => { const group = pageOf(value).wires[0]; assert.ok(group); group.body["zIndex"] = 99; }, /source record/u);
  refuses((value) => { rewriteSource(value, (records) => { records.push({ id: "unknown", type: "BUS", body: {} }); }); }, /unsupported source/u);
});
void test("flat topology refuses missing, duplicate and unrelated native contact membership", () => {
  refuses((value) => { pageOf(value).contacts.splice(0, 1); }, /contact points/u);
  refuses((value) => { const item = pageOf(value).contacts[0]; assert.ok(item); item.lineIds = []; }, /wire lines/u);
  refuses((value) => { const item = pageOf(value).contacts[0]; assert.ok(item); item.pinIds.push("foreign"); }, /contact pins/u);
  refuses((value) => { const item = pageOf(value).contacts[0]; assert.ok(item); item.lineIds.push("line"); }, /duplicate/u);
});
void test("flat topology refuses stale contacts after a pin moves into a line interior", () => {
  refuses((value) => { const item = pageOf(value).symbols[0]?.pins[0]; assert.ok(item); item.origin = [5, 0]; item.body = { x: 5, y: 0 }; }, /segment interior/u);
});
void test("flat topology refuses contradictory no-connect and compound pin numbers", () => {
  refuses((value) => { const item = pageOf(value).symbols[0]?.pins[0]; assert.ok(item); item.noConnect = true; }, /no-connect/u);
  refuses((value) => { const item = pageOf(value).symbols[0]?.pins[0]; assert.ok(item); item.number = "1,2"; }, /compound pin/u);
});
void test("flat topology refuses a stored no-connect attribute missing from the native pin", () => {
  refuses((value) => { rewriteSource(value, (records) => { records.push({ id: "no-connect", type: "ATTR", body: { parentId: "pin", key: "NO_CONNECT", value: "yes" } }); }); }, /attribute omitted/u);
});
void test("flat topology refuses unnamed and multiply named wires", () => {
  refuses((value) => { const item = pageOf(value).wires[0]?.names[0]; assert.ok(item); item.value = ""; }, /literal simple NET/u);
  refuses((value) => { const group = pageOf(value).wires[0], name = group?.names[0]; assert.ok(group && name); group.names.push({ ...name }); }, /exactly|Too big/u);
});
void test("flat topology refuses net naming settings outside the exact profile", () => {
  const value = fixture();
  assert.throws(() => verifySchematicFlatTopology({ ...value, settings: { ...value.settings, defaultNetName: false } }));
  assert.throws(() => verifySchematicFlatTopology({ ...value, settings: { ...value.settings, netLabelInterPageConnection: false } }));
});
void test("flat topology refuses multipart, hierarchy and reuse rather than silently dropping parts", () => {
  const value = fixture();
  const page = pageOf(value);
  const item = page.symbols[0]; assert.ok(item);
  assert.throws(() => verifySchematicFlatTopology({ ...value, pages: [{ ...page, symbols: [{ ...item, partCount: 2 }] }] }));
  assert.throws(() => verifySchematicFlatTopology({ ...value, pages: [{ ...page, symbols: [{ ...item, kind: "block_symbol" }] }] }));
  refuses((input) => { const model = pageOf(input).symbols[0]; assert.ok(model); model.attributes.push({ id: "reuse", key: "Reuse Block", value: "BLOCK", body: { parentId: model.id, key: "Reuse Block", value: "BLOCK" } }); }, /reuse/u);
});
void test("flat topology refuses duplicate all-page identities", () => {
  refuses((value) => { const page = structuredClone(pageOf(value)); page.uuid = "page2"; page.tabId = "page2@project";
    page.source = encode(page.uuid, parseDocumentSource(page.source).objects); value.pages.push(page); value.scope.pageIds.push(page.uuid); }, /designator|duplicate/u);
});
void test("fixed flat capture contains no compiled-cache, export or mutation dispatch", () => {
  const code = buildSchematicFlatTopologyExpression(fixture().scope);
  for (const forbidden of ["getSchPinNet", "getNetlist", "astPureSheet", "parseSchematic", "getNlSymbolCollects", "saveAll", "rpcCall", "publish(", ".run(", ".multiPart", "template.parts", "library.parts"]) {
    assert.equal(code.includes(forbidden), false, forbidden);
  }
  assert.match(code, /getNetPoint\(value\)/u); assert.match(code, /CONTACT_OWNER/u);
  assert.throws(() => buildSchematicFlatTopologyExpression({ ...fixture().scope, method: "getNetlist" }));
});

function runtimeFixture(includeFrame = false): { readonly runtime: object; readonly running: { running: boolean }; readonly wireContacts: Set<object>;
  readonly project: { setting: { universal: { defaultNetName: boolean } }; netLabelInterPageConnection: boolean }; readonly libraryParts: object[];
  readonly unsupportedModels: Map<string, object[]>; readonly nativeIds: Map<string, object>;
  readonly pageConsistency: { state: string }; readonly templateConsistency: { state: string }; readonly frameValues: { date: string; time: string };
  readonly wireNames: object[]; readonly wireChildren: object[]; readonly wireModels: object[]; readonly rootChildren: object[];
  readonly sourceIds: Map<string, number>; readonly calls: string[];
  readonly symbolModels: object[];
  readonly root: { id: string; modelType: string; shapeManager?: object; parent: object | null; isConnected: boolean };
  readonly nativeIndex: { get: (id: string) => object | undefined } } {
  const value = fixture();
  const page = pageOf(value);
  const partData = page.symbols[0];
  const pinData = partData?.pins[0];
  const wireData = page.wires[0];
  const lineData = wireData?.lines[0]; assert.ok(partData && pinData && wireData && lineData);
  const templatePart = { partId: "library-part" };
  const libraryParts: object[] = [templatePart];
  const library = { getModels: (): object[] => libraryParts, getPart: (): object => templatePart };
  const templateConsistency = { state: "initialized" };
  const project = { setting: { universal: { defaultNetName: true } }, netLabelInterPageConnection: true,
    componentCache: { symbolTemplate: { "library-symbol": { shapeManager: library, consistencyImpl: templateConsistency } } } };
  const running = { running: false };
  const ids = new Map<string, object>();
  const symbolModels: object[] = [], wireModels: object[] = [];
  const calls: string[] = [], rootChildren: object[] = [];
  const root = { id: "$$root", modelType: "Root", parent: null, isConnected: true, children: rootChildren };
  const unsupportedModels = new Map<string, object[]>();
  const contacts = new Map<string, object>();
  const shapes = { root, actionRunner: running, idManager: { idMap: ids, get: (id: string): object | undefined => ids.get(id) },
    getModels: (kind: string): object[] => { if (kind === "Symbol") { return symbolModels; } if (kind === "NetGroup") { return wireModels; } return unsupportedModels.get(kind) ?? []; },
    netPointManager: { getNetPoint: (position: { x: number; y: number }): object | undefined => contacts.get(JSON.stringify([position.x, position.y])) } };
  Object.assign(root, { shapeManager: shapes });
  const attrs = (values: typeof partData.attributes): object[] => values.map((item) => ({ ...item, getInstanceValue: (): null => null,
    getConsistencyData: (): object => structuredClone(item.body) }));
  const nativePins: object[] = [];
  const part = { id: partData.id, modelType: "Symbol", cmdKey: "part", shapeManager: shapes, isAbnormal: false, symbolUuid: "library-symbol", partId: "library-part",
    getShapes: (): object[] => nativePins, traversePins: (visit: (item: object) => void): void => { for (const item of nativePins) { visit(item); } },
    getAttr: (): object[] => attrs(partData.attributes), getConsistencyData: (): object => structuredClone(partData.body) };
  Object.defineProperty(part, "multiPart", { get: (): never => { throw new Error("Mutating multiPart getter must never execute."); } });
  Object.defineProperty(library, "parts", { get: (): never => { throw new Error("Mutating parts sorter must never execute."); } });
  const nativePin = { id: pinData.id, parent: part, shapeManager: shapes, isNoConnectShow: false, origin: { x: 0, y: 0 },
    getAttr: (): object[] => attrs(pinData.attributes), getConsistencyData: (): object => structuredClone(pinData.body) };
  nativePins.push(nativePin); symbolModels.push(part); ids.set(nativePin.id, nativePin); ids.set(part.id, part);
  const nativeLines: object[] = [], wireChildren: object[] = [], wireNames: object[] = [];
  const nativeWire = { id: wireData.id, modelType: "NetGroup", tagName: "NetGroup", type: "wire", combination: null,
    shapeManager: shapes, parent: root, children: wireChildren, lines: nativeLines, netNames: wireNames,
    getConsistencyData: (): object => structuredClone(wireData.body) };
  for (const item of wireData.names) {
    const name = { ...item, modelType: "NetLabel", tagName: "NetName", cmdKey: "netlabel", keyInSourceCode: "NET", parent: nativeWire, shapeManager: shapes,
      getConsistencyData: (): object => { calls.push("name-body"); return structuredClone(item.body); } };
    wireNames.push(name); wireChildren.push(name); ids.set(name.id, name);
  }
  const nativeLine = { id: lineData.id, modelType: "Wire", parent: nativeWire, shapeManager: shapes, points: [{ x: 0, y: 0 }, { x: 10, y: 0 }],
    getConsistencyData: (): object => structuredClone(lineData.body) };
  nativeLines.push(nativeLine); wireChildren.push(nativeLine); wireModels.push(nativeWire); rootChildren.push(part, nativeWire);
  ids.set(nativeLine.id, nativeLine); ids.set(nativeWire.id, nativeWire);
  const frameValues = { date: "2026-10-10", time: "12:00:00" };
  if (includeFrame) {
    const frameBody = { partId: "frame-template", x: 0, y: 0 };
    const frameAttributes = [{ id: "frame-date", key: "@Update Date", value: "2000-01-01" }, { id: "frame-time", key: "@Update Time", value: "00:00:00" }].map((entry) =>
      ({ id: entry.id, key: entry.key, value: entry.value, body: { key: entry.key, value: entry.value, parentId: "frame" } }));
    const frame = { id: "frame", modelType: "Symbol", cmdKey: "sheet", shapeManager: shapes, isAbnormal: false,
      getShapes: (): object[] => [], traversePins: (): void => undefined,
      getAttr: (): object[] => frameAttributes.map((item) => ({ ...item, value: item.key === "@Update Date" ? frameValues.date : frameValues.time,
        getInstanceValue: (): null => null, getConsistencyData: (): object => structuredClone(item.body) })),
      getConsistencyData: (): object => frameBody };
    symbolModels.push(frame); rootChildren.push(frame); ids.set(frame.id, frame);
    rewriteSource(value, (records) => { records.push({ id: "frame", type: "COMPONENT", body: frameBody }, ...frameAttributes.map((item) => ({ id: item.id, type: "ATTR", body: item.body }))); });
  }
  const sourceIds = new Map(parseDocumentSource(page.source).objects.map((record) => [record.id, 1]));
  for (const record of parseDocumentSource(page.source).objects.filter((entry) => entry.type === "ATTR")) {
    if (!ids.has(record.id)) { ids.set(record.id, { id: record.id, modelType: "Attr" }); }
  }
  const wireContacts = new Set<object>([nativeLine]);
  contacts.set("[0,0]", { x: 0, y: 0, Wire: wireContacts, Pin: new Set([nativePin]), Bus: new Set(), BusEntry: new Set() });
  contacts.set("[10,0]", { x: 10, y: 0, Wire: new Set([nativeLine]), Pin: new Set(), Bus: new Set(), BusEntry: new Set() });
  const source = page.source.replace('"uuid":"page"', '"uuid":"page","client":"0123456789abcdef","updateTime":100,"version":"100"');
  const pageConsistency = { state: "initialized", decodeAndRealTimeSyncHandler: { getSourceCodeIdMap: (): Map<string, number> => sourceIds },
    getSourceCode: (): string => { calls.push("source"); return source; } };
  const document = { uuid: "page", tabId: "page@project", project_uuid: "project", schematicUuid: "schematic", projectMgr: project,
    isSchSheetDoc: (): true => true, isBlockSymbolInstancePage: false, shapeManager: shapes, idManager: shapes.idManager,
    consistencyImpl: pageConsistency };
  const runtime = { SCH: { docMemoryManager: { getActiveDoc: (): object => document, getSchDocs: (): object[] => [document] } } };
  return { runtime, running, wireContacts, project, libraryParts, unsupportedModels, nativeIds: ids, pageConsistency, templateConsistency, frameValues,
    wireNames, wireChildren, wireModels, rootChildren, sourceIds, calls, root, symbolModels, nativeIndex: shapes.idManager };
}
function capture(runtime: object): unknown {
  // oxlint-disable-next-line no-new-func, typescript/no-implied-eval -- Execute this fixed maintained builder against synthetic native objects only.
  const run = new Function("globalThis", `return ${buildSchematicFlatTopologyExpression(fixture().scope)};`);
  // oxlint-disable-next-line typescript/no-unsafe-call -- The generated result remains unknown until the independent schema/verifier checks it.
  return run(runtime);
}
void test("fixed flat capture executes on synchronous native model and proves its complete result", () => {
  const scene = runtimeFixture();
  const name = scene.nativeIds.get("net-name"); assert.ok(name);
  assert.equal(Reflect.get(name, "modelType"), "NetLabel");
  assert.equal(Reflect.get(name, "tagName"), "NetName");
  assert.deepEqual(verifySchematicFlatTopology(capture(scene.runtime)).topology, verifySchematicFlatTopology(fixture()).topology);
  assert.deepEqual(scene.calls, ["name-body", "source"]);
});

void test("flat capture never filters a transient placement preview out of complete source membership", () => {
  const scene = runtimeFixture();
  const ordinary = scene.symbolModels[0]; assert.ok(ordinary);
  const preview = { ...ordinary, id: "placement-preview", getShapes: (): object[] => [], traversePins: (): void => undefined };
  scene.symbolModels.push(preview);
  const observation = capture(scene.runtime);
  const parsed = schematicFlatTopologyObservationSchema.parse(observation);
  assert.deepEqual(parsed.pages[0]?.symbols.map((item) => item.id), ["part", "placement-preview"]);
  assert.throws(() => verifySchematicFlatTopology(observation), /incomplete source components/u);
  assert.deepEqual(scene.calls, ["name-body", "source"]);
});

type FlatRuntime = ReturnType<typeof runtimeFixture>;
function nativeObject(scene: FlatRuntime, id: string): object {
  const result = scene.nativeIds.get(id); assert.ok(result); return result;
}
function setNative(scene: FlatRuntime, id: string, key: string, value: unknown): void {
  assert.equal(Reflect.set(nativeObject(scene, id), key, value), true);
}
function rejectsNetNameScene(mutate: (scene: FlatRuntime) => void, reason: RegExp): void {
  const scene = runtimeFixture(); mutate(scene);
  assert.throws(() => capture(scene.runtime), reason);
  assert.deepEqual(scene.calls, [], "Reject before invoking any NET body or source serializer.");
}

for (const [key, replacement] of [["modelType", "NetName"], ["modelType", "Attr"], ["tagName", "NetLabel"],
  ["cmdKey", "attr"], ["key", "NET"], ["keyInSourceCode", "_NETLABEL_"], ["id", "unindexed-name"]] as const) {
  void test(`fixed capture refuses an unproved wire NET discriminator ${key}=${replacement}`, () => {
    rejectsNetNameScene((scene) => { setNative(scene, "net-name", key, replacement); }, /NET_NAME_MEMBERSHIP/u);
  });
}
for (const [label, mutate] of [
  ["foreign shape manager", (scene: FlatRuntime): void => { setNative(scene, "net-name", "shapeManager", {}); }],
  ["absent parent", (scene: FlatRuntime): void => { setNative(scene, "net-name", "parent", null); }],
  ["inherited symbol parent", (scene: FlatRuntime): void => { setNative(scene, "net-name", "parent", nativeObject(scene, "part")); }],
  ["grouped name", (scene: FlatRuntime): void => { setNative(scene, "net-name", "combination", {}); }],
  ["missing source ID", (scene: FlatRuntime): void => { scene.sourceIds.delete("net-name"); }],
  ["missing ID index", (scene: FlatRuntime): void => { scene.nativeIds.delete("net-name"); }],
  ["aliased ID index", (scene: FlatRuntime): void => { scene.nativeIds.set("net-name", { ...nativeObject(scene, "net-name") }); }],
  ["contradictory native lookup", (scene: FlatRuntime): void => {
    scene.nativeIndex.get = (id): object | undefined => id === "net-name" ? {} : scene.nativeIds.get(id);
  }],
  ["missing reciprocal child", (scene: FlatRuntime): void => { scene.wireChildren.splice(0, 1); }],
  ["aliased reciprocal child", (scene: FlatRuntime): void => { scene.wireChildren[0] = { ...nativeObject(scene, "net-name") }; }],
  ["duplicate reciprocal child", (scene: FlatRuntime): void => { scene.wireChildren.push(nativeObject(scene, "net-name")); }],
  ["duplicate net-name enumeration", (scene: FlatRuntime): void => { scene.wireNames.push(nativeObject(scene, "net-name")); }],
  ["missing reciprocal enumeration", (scene: FlatRuntime): void => { scene.wireNames.length = 0; }],
  ["unindexed extra child", (scene: FlatRuntime): void => { scene.wireChildren.push({ modelType: "NetLabel", tagName: "NetName", id: "extra" }); }],
  ["generic ATTR enumeration alias", (scene: FlatRuntime): void => { scene.wireNames[0] = nativeObject(scene, "attribute0"); }],
] as const) {
  void test(`fixed capture refuses wire NET ${label} before serialization`, () => {
    rejectsNetNameScene(mutate, /NET_NAME_MEMBERSHIP/u);
  });
}
for (const [label, mutate] of [
  ["non-wire group", (scene: FlatRuntime): void => { setNative(scene, "wire", "type", "bus"); }],
  ["foreign model kind", (scene: FlatRuntime): void => { setNative(scene, "wire", "modelType", "Symbol"); }],
  ["foreign tag", (scene: FlatRuntime): void => { setNative(scene, "wire", "tagName", "PartSymbol"); }],
  ["foreign shape manager", (scene: FlatRuntime): void => { setNative(scene, "wire", "shapeManager", {}); }],
  ["inherited owner", (scene: FlatRuntime): void => { setNative(scene, "wire", "parent", nativeObject(scene, "part")); }],
  ["grouped owner", (scene: FlatRuntime): void => { setNative(scene, "wire", "combination", {}); }],
  ["missing root membership", (scene: FlatRuntime): void => { scene.rootChildren.splice(1, 1); }],
  ["root alias", (scene: FlatRuntime): void => { scene.rootChildren[1] = { ...nativeObject(scene, "wire") }; }],
  ["missing source owner", (scene: FlatRuntime): void => { scene.sourceIds.delete("wire"); }],
  ["index alias", (scene: FlatRuntime): void => { scene.nativeIds.set("wire", { ...nativeObject(scene, "wire") }); }],
  ["contradictory native lookup", (scene: FlatRuntime): void => {
    scene.nativeIndex.get = (id): object | undefined => id === "wire" ? {} : scene.nativeIds.get(id);
  }],
  ["foreign root identity", (scene: FlatRuntime): void => { scene.root.id = "inherited-root"; }],
  ["foreign root kind", (scene: FlatRuntime): void => { scene.root.modelType = "Symbol"; }],
  ["foreign root manager", (scene: FlatRuntime): void => { scene.root.shapeManager = {}; }],
  ["nested root", (scene: FlatRuntime): void => { scene.root.parent = nativeObject(scene, "part"); }],
  ["disconnected root", (scene: FlatRuntime): void => { scene.root.isConnected = false; }],
] as const) {
  void test(`fixed capture refuses NET wire owner with ${label} before serialization`, () => {
    rejectsNetNameScene(mutate, /NET_NAME_OWNER/u);
  });
}
void test("fixed capture refuses duplicate root or wire-family ownership", () => {
  rejectsNetNameScene((scene) => { scene.rootChildren.push(nativeObject(scene, "wire")); }, /NET_NAME_MEMBERSHIP/u);
  rejectsNetNameScene((scene) => { scene.wireModels.push(nativeObject(scene, "wire")); }, /NET_NAME_MEMBERSHIP/u);
});
void test("fixed capture bounds complete NET ownership inventories before serialization", () => {
  rejectsNetNameScene((scene) => { scene.wireChildren.length = 100_001; }, /ARRAY/u);
  rejectsNetNameScene((scene) => { scene.wireNames.length = 4097; }, /ARRAY/u);
  rejectsNetNameScene((scene) => { scene.rootChildren.length = 100_001; }, /ARRAY/u);
  rejectsNetNameScene((scene) => {
    const extraChildren = Array.from({ length: 50_000 }, () => ({}));
    scene.wireChildren.push(...extraChildren);
    const wire = { ...nativeObject(scene, "wire"), id: "wire2", children: extraChildren, netNames: [] };
    scene.sourceIds.set(wire.id, 1); scene.nativeIds.set(wire.id, wire); scene.rootChildren.push(wire); scene.wireModels.push(wire);
  }, /NET_NAME_MEMBERSHIP/u);
});
void test("fixed capture refuses persisted unrelated NetLabel and impossible NetName models", () => {
  for (const modelType of ["NetLabel", "NetName"]) {
    rejectsNetNameScene((scene) => {
      scene.nativeIds.set("attribute0", { id: "attribute0", modelType, tagName: "NetName", parent: nativeObject(scene, "part") });
    }, /SOURCE_MODEL_KIND/u);
  }
  rejectsNetNameScene((scene) => {
    scene.sourceIds.set("name-alias", 1); scene.nativeIds.set("name-alias", nativeObject(scene, "net-name"));
  }, /SOURCE_MODEL_KIND/u);
});
void test("fixed capture still refuses native root NetLabel before serialization", () => {
  rejectsNetNameScene((scene) => {
    const label = { id: "standalone", modelType: "NetLabel", tagName: "NetLabel", keyInSourceCode: "_NETLABEL_" };
    scene.sourceIds.set(label.id, 1); scene.nativeIds.set(label.id, label); scene.rootChildren.push(label);
    scene.unsupportedModels.set("NetLabel", [label]);
  }, /SOURCE_MODEL_KIND/u);
  rejectsNetNameScene((scene) => { scene.unsupportedModels.set("NetLabel", [{ modelType: "NetLabel", tagName: "NetLabel" }]); }, /UNSUPPORTED_FAMILY/u);
});
void test("fixed flat capture refuses native transaction and naming-setting drift", () => {
  const scene = runtimeFixture(); scene.running.running = true;
  assert.throws(() => capture(scene.runtime), /SHAPES/u);
  scene.running.running = false; scene.project.netLabelInterPageConnection = false;
  assert.throws(() => capture(scene.runtime), /SETTINGS/u);
});
void test("independent proof rejects stale native contact cache even though capture completes", () => {
  const scene = runtimeFixture(); scene.wireContacts.clear();
  assert.throws(() => verifySchematicFlatTopology(capture(scene.runtime)), /contact wire lines/u);
});
void test("fixed capture rejects a native contact object with a foreign owner", () => {
  const scene = runtimeFixture(); scene.wireContacts.add({ id: "foreign", shapeManager: {} });
  assert.throws(() => capture(scene.runtime), /CONTACT_OWNER/u);
});
void test("fixed capture checks the single library part without evaluating mutating multipart getters", () => {
  const scene = runtimeFixture();
  assert.doesNotThrow(() => capture(scene.runtime));
  scene.libraryParts.push({ partId: "second-part" });
  assert.throws(() => capture(scene.runtime), /MULTIPART/u);
  scene.libraryParts.length = 0;
  assert.throws(() => capture(scene.runtime), /MULTIPART/u);
});
void test("fixed capture rejects images before source serialization can upload an image blob", () => {
  const scene = runtimeFixture(); scene.unsupportedModels.set("Image", [{}]);
  assert.throws(() => capture(scene.runtime), /UNSUPPORTED_FAMILY/u);
});
void test("fixed capture refuses an unknown persisted model before source serialization", () => {
  const scene = runtimeFixture(); scene.nativeIds.set("part", { id: "part", modelType: "UnknownSerializer" });
  assert.throws(() => capture(scene.runtime), /SOURCE_MODEL_KIND/u);
});
void test("fixed capture refuses incomplete page or template initialization", () => {
  for (const state of ["uninitialized", "initializing", "willInitialized", "disposed", ""]) {
    const scene = runtimeFixture(); scene.pageConsistency.state = state;
    assert.throws(() => capture(scene.runtime), /PAGE_NOT_INITIALIZED/u);
    scene.pageConsistency.state = "initialized"; scene.templateConsistency.state = state;
    assert.throws(() => capture(scene.runtime), /TEMPLATE_NOT_INITIALIZED/u);
  }
});
void test("fixed capture normalizes only exact stored drawing-frame update timestamps", () => {
  const scene = runtimeFixture(true);
  const first = verifySchematicFlatTopology(capture(scene.runtime));
  scene.frameValues.time = "12:00:01"; scene.frameValues.date = "2026-10-11";
  assert.deepEqual(verifySchematicFlatTopology(capture(scene.runtime)), first);
  scene.frameValues.time = "unexpected";
  assert.throws(() => capture(scene.runtime), /FRAME_TIMESTAMP/u);
});
void test("flat topology refuses unknown source net labels and hidden extra NET attributes", () => {
  refuses((value) => { rewriteSource(value, (records) => { records.push({ id: "label", type: "ATTR", body: { key: "_NETLABEL_", value: "OTHER", parentId: "$$root" } }); }); }, /standalone net label/u);
  refuses((value) => { rewriteSource(value, (records) => { records.push({ id: "extra-name", type: "ATTR", body: { key: "NET", value: "OTHER", parentId: "wire" } }); }); }, /wire names/u);
});
void test("flat topology refuses excluded and unannotated parts", () => {
  for (const [key, replacement] of [["Convert to PCB", "no"], ["Designator", "R?"]]) {
    refuses((value) => {
      const selected = pageOf(value).symbols[0]?.attributes.find((item) => item.key === key); assert.ok(selected);
      selected.value = replacement ?? ""; selected.body["value"] = replacement ?? "";
      rewriteSource(value, (records) => { const record = records.find((item) => item.id === selected.id); assert.ok(record); record.body["value"] = replacement; });
    }, /excluded|unannotated/u);
  }
});
void test("flat topology refuses incomplete, zero-length and diagonal source lines", () => {
  refuses((value) => { const item = pageOf(value).wires[0]?.lines[0]; assert.ok(item); item.points[1] = [0, 0]; }, /orthogonal source segment/u);
  refuses((value) => { const item = pageOf(value).wires[0]?.lines[0]; assert.ok(item); item.points[1] = [10, 10]; }, /orthogonal source segment/u);
  refuses((value) => { rewriteSource(value, (records) => { records.push({ id: "extra-line", type: "LINE", body: { lineGroup: "wire", startX: 10, startY: 0, endX: 20, endY: 0 } }); }); }, /wire lines/u);
  refuses((value) => { rewriteSource(value, (records) => { records.push({ id: "orphan-line", type: "LINE", body: { startX: 10, startY: 0, endX: 20, endY: 0 } }); }); }, /unrepresented wire owner/u);
});
void test("flat topology refuses orphan electrical attributes and pin-only coincident contacts", () => {
  refuses((value) => { rewriteSource(value, (records) => { records.push({ id: "orphan-net", type: "ATTR", body: { key: "NET", value: "OTHER", parentId: "missing" } }); }); }, /electrical attribute/u);
  refuses((value) => {
    const page = pageOf(value);
    const part = page.symbols[0];
    const first = part?.pins[0]; assert.ok(part && first);
    first.origin = [20, 0]; first.body = { x: 20, y: 0 };
    const second = structuredClone(first); second.id = "pin2"; second.number = "2";
    second.attributes = [{ id: "pin2-number", key: "Pin Number", value: "2", body: { parentId: "pin2", key: "Pin Number", value: "2" } }];
    part.pins.push(second); const originalContact = page.contacts[0]; assert.ok(originalContact); originalContact.pinIds = [];
    page.contacts.push({ point: [20, 0], lineIds: [], pinIds: [first.id, second.id] });
  }, /multiple pins coincide/u);
});
void test("flat topology refuses a wire crossing with no explicitly split contact", () => {
  refuses((value) => {
    const page = pageOf(value);
    const group = page.wires[0]; assert.ok(group);
    const crossing = { id: "crossing", body: { lineGroup: "wire", startX: 5, startY: -10, endX: 5, endY: 10 }, points: [[5, -10], [5, 10]] as [[number, number], [number, number]] };
    group.lines.push(crossing);
    rewriteSource(value, (records) => { records.push({ id: crossing.id, type: "LINE", body: crossing.body }); });
    page.contacts.push({ point: [5, -10], lineIds: ["crossing"], pinIds: [] }, { point: [5, 10], lineIds: ["crossing"], pinIds: [] });
  }, /unsplit segment crossing/u);
});
