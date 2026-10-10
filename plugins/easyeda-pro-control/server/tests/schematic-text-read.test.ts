import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

import { SCHEMATIC_TEXT_GUARD_CODES, SCHEMATIC_TEXT_READ_METHODS, buildSchematicTextReadExpression, schematicTextReadRequestSchema, schematicTextStatesSchema } from "../src/schematic-text-read.ts";
import { buildPublicSdkReadCode, publicSdkReadDescriptors, validatePublicSdkReadPayload, validatePublicSdkReadRequest } from "../src/public-sdk-read.ts";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import { wrapWithContextGuard } from "../src/runtime-scripts.ts";
import { EasyedaControlEngine } from "../src/engine.ts";
import { extractToolPayload } from "../src/core.ts";
import { inventoryExtensionApiCoverage } from "../src/extension-api-coverage.ts";
import type { ContextProbePayload, ExpectedContext } from "../src/engine.ts";

const context: ExpectedContext = { project: { uuid: "fixture-project", path: "/tmp/fixture.eprj2" }, document: { uuid: "fixture-page", documentType: 1, tabId: "fixture-page@fixture-project" } };
const request = { method: SCHEMATIC_TEXT_READ_METHODS[1], arguments: {} };
const selectedRequest = (primitiveIds: string | string[]): object => ({ method: SCHEMATIC_TEXT_READ_METHODS[0], arguments: { primitiveIds } });
interface Model extends Record<string, unknown> {
  id: string; modelType: string; shapeManager: unknown; parent?: Model; children?: Model[]; isConnected: boolean; cmdKey?: string;
}
const forbidden = (): never => { throw new Error("Forbidden public/compiler/display/serialization/RPC/write path."); };
function fixture(): {
  scope: Record<string, unknown>; page: Record<string, unknown>; shapes: Record<string, unknown>;
  root: Model; frame: Model; first: Model; last: Model; sources: Map<string, number>; index: Map<string, Model>;
  family: Set<Model>; modelMap: Map<string, Set<Model>>; handler: { getSourceCodeIdMap: () => Map<string, number> };
  addText: (id: string) => Model; addChild: (parent: Model, model: Model, stored?: boolean) => void;
} {
  const family = new Set<Model>(), index = new Map<string, Model>(), sources = new Map<string, number>();
  const handler = { getSourceCodeIdMap: (): Map<string, number> => new Map(sources) }, ids = { idMap: index }, modelMap = new Map([["Text", family]]);
  const shapes: Record<string, unknown> = { idManager: ids, modelMap, actionRunner: { running: false }, getModels: (type: string): Model[] => [...(modelMap.get(type) ?? [])] };
  const root: Model = { id: "root", modelType: "Root", shapeManager: shapes, children: [], isConnected: true };
  shapes["root"] = root;
  const page: Record<string, unknown> = { uuid: "fixture-page", project_uuid: "fixture-project", tabId: "fixture-page@fixture-project",
    projectMgr: { uuid: "fixture-project" }, isSchSheetDoc: (): boolean => true, isBlockSymbolInstancePage: false,
    shapeManager: shapes, idManager: ids, consistencyImpl: { state: "initialized", decodeAndRealTimeSyncHandler: handler }, getSourceCode: forbidden };
  shapes["docManager"] = page; Reflect.set(ids, "docManager", page);
  const consistency = page["consistencyImpl"]; assert.ok(consistency !== null && typeof consistency === "object");
  Reflect.set(consistency, "docManager", page); Reflect.set(consistency, "handler", handler);
  Reflect.set(handler, "docManager", page); Reflect.set(handler, "consistencyImpl", consistency);
  const scope: Record<string, unknown> = { Map, Set, SCH: { docMemoryManager: { getActiveDoc: (): unknown => page } },
    UI: { tabBar: { getActiveTab: (): string => "fixture-page@fixture-project" } },
    EXPECTED_DOCUMENT_UUID: "fixture-page", EXPECTED_PROJECT_UUID: "fixture-project", EXPECTED_DOCUMENT_TYPE: 1, EXPECTED_TAB_ID: "fixture-page@fixture-project",
    eda: { sch_PrimitiveText: { get: forbidden, getAll: forbidden }, sch_Netlist: { getNetlist: forbidden },
      dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve(context.project) },
      dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => Promise.resolve(context.document) } } };
  const addChild = (parent: Model, model: Model, stored = false): void => {
    model.parent = parent; parent.children ??= []; parent.children.push(model); index.set(model.id, model); if (stored) { sources.set(model.id, 1); }
  };
  const addText = (id: string): Model => {
    const model: Model = { id, modelType: "Text", cmdKey: "text", shapeManager: shapes, isConnected: true, x: 10, y: -20, value: id,
      rotation: null, color: null, fontFamily: null, fontSize: null, fontWeight: null, italic: null, underline: null, hAlign: null, vAlign: null };
    for (const field of ["attributes", "textContent", "displayHAlign", "displayVAlign", "displayFontFamily", "displayColor"]) { Object.defineProperty(model, field, { get: forbidden }); }
    for (const method of ["getApiShapeData", "getConsistencyData", "getAlignConsistencyValue", "uploadTo"]) { model[method] = forbidden; }
    family.add(model); addChild(root, model, true); return model;
  };
  const last = addText("z-text");
  const first = addText("a-text");
  const frame: Model = { id: "frame", modelType: "Symbol", cmdKey: "sheet", shapeManager: shapes, children: [], isConnected: true };
  addChild(root, frame, true);
  for (const id of ["generated-grid-text", "generated-frame-attr"]) {
    const model: Model = { id, modelType: id.endsWith("text") ? "Text" : "Attr", shapeManager: shapes, isConnected: true };
    Object.defineProperty(model, "value", { get: forbidden }); addChild(frame, model);
  }
  return { scope, page, shapes, root, frame, first, last, sources, index, family, modelMap, handler, addText, addChild };
}
type Fixture = ReturnType<typeof fixture>;
function read(current: Fixture, input: unknown = request): unknown {
  const result: unknown = runInNewContext(buildSchematicTextReadExpression(input), current.scope, { timeout: 1000 }); return structuredClone(result);
}

void test("Text observations are sorted native state, preserve raw Y and nullable fields, and exclude descendants", () => {
  const current = fixture(), rows = schematicTextStatesSchema.parse(read(current));
  assert.deepEqual(rows.map((row) => row.primitiveId), ["a-text", "z-text"]);
  const first = rows[0]; assert.ok(first);
  assert.deepEqual(first, { primitiveId: "a-text", modelType: "Text", x: 10, y: -20, value: "a-text", rotation: null, color: null,
    fontFamily: null, fontSize: null, fontWeight: null, italic: null, underline: null, hAlign: null, vAlign: null });
  assert.deepEqual(read(current, selectedRequest("a-text")), [first]);
  assert.deepEqual(read(current, selectedRequest(["z-text", "a-text"])), rows);
  for (const id of ["missing", "frame", "generated-grid-text"]) { assert.throws(() => read(current, selectedRequest(id)), /SCH_TEXT_TARGET/u); }
});

void test("Text values preserve empty, Unicode, control content, signed zero and every native alignment pair", () => {
  const current = fixture();
  current.first["value"] = "\u0000\n é e\u0301 __proto__"; current.first["fontFamily"] = "default"; current.first["color"] = "";
  current.first["x"] = -0; current.first["y"] = -0; current.first["rotation"] = -0; current.first["fontSize"] = 0;
  current.first["fontWeight"] = false; current.first["italic"] = true; current.first["underline"] = false;
  current.last["value"] = "";
  for (const hAlign of [null, 0, 1, 2]) {
    for (const vAlign of [null, 0, 1, 2]) {
      current.first["hAlign"] = hAlign; current.first["vAlign"] = vAlign;
      const rows = schematicTextStatesSchema.parse(read(current)); const first = rows[0]; assert.ok(first);
      assert.equal(first.hAlign, hAlign); assert.equal(first.vAlign, vAlign); assert.equal(first.value, current.first["value"]);
      assert.equal(first.color, ""); assert.equal(first.fontFamily, "default"); assert.equal(first.fontSize, 0);
      assert.equal(first.fontWeight, false); assert.equal(first.italic, true); assert.equal(first.underline, false);
      assert.ok(Object.is(first.x, -0) && Object.is(first.y, -0) && Object.is(first.rotation, -0)); assert.equal(rows[1]?.value, "");
    }
  }
});

void test("Text empty family succeeds only with complete ownership proof; inherited text is not promoted", () => {
  const current = fixture(); current.index.delete(current.first.id); current.index.delete(current.last.id);
  current.sources.delete(current.first.id); current.sources.delete(current.last.id); current.root.children = [current.frame]; current.family.clear();
  assert.deepEqual(read(current), []); current.modelMap.clear(); assert.deepEqual(read(current), []);
  current.scope["SCH"] = {}; assert.throws(() => read(current), /SCH_TEXT_MANAGER/u);
});

void test("Text selectors remain literal data, including quoted JavaScript-looking IDs", () => {
  const current = fixture(), id = String.raw`quoted"');globalThis.unexpected=true;//\é`;
  current.addText(id);
  const rows = schematicTextStatesSchema.parse(read(current, selectedRequest(id)));
  assert.equal(rows.length, 1); assert.equal(rows[0]?.primitiveId, id); assert.equal(current.scope["unexpected"], undefined);
});

const corruptions: Record<string, (current: Fixture) => void> = {
  "foreign page": (current) => { current.page["uuid"] = "other"; },
  "foreign project": (current) => { current.page["project_uuid"] = "other"; },
  "foreign tab": (current) => { current.page["tabId"] = "other"; },
  "non-schematic document": (current) => { current.scope["EXPECTED_DOCUMENT_TYPE"] = 2; },
  "symbol scene": (current) => { current.page["isSchSheetDoc"] = (): boolean => false; },
  "block instance": (current) => { current.page["isBlockSymbolInstancePage"] = true; },
  "foreign project manager": (current) => { current.page["projectMgr"] = { uuid: "other" }; },
  "foreign owner": (current) => { current.shapes["docManager"] = {}; },
  "busy action": (current) => { current.shapes["actionRunner"] = { running: true }; },
  "uninitialized consistency": (current) => { const value = current.page["consistencyImpl"]; assert.ok(value !== null && typeof value === "object"); Reflect.set(value, "state", "loading"); },
  "inactive source handler": (current) => { const value = current.page["consistencyImpl"]; assert.ok(value !== null && typeof value === "object"); Reflect.set(value, "handler", {}); },
  "disconnected root": (current) => { current.root.isConnected = false; },
  "foreign root parent": (current) => { current.root.parent = current.frame; },
  "missing children": (current) => { delete current.root.children; },
  "duplicate children": (current) => { current.root.children?.push(current.first); },
  "cyclic tree": (current) => { current.frame.children?.push(current.root); },
  "wrong child parent": (current) => { current.first.parent = current.frame; },
  "disconnected child": (current) => { current.first.isConnected = false; },
  "foreign shape manager": (current) => { current.first.shapeManager = {}; },
  "missing index member": (current) => { current.index.delete(current.first.id); },
  "index-only member": (current) => { current.index.set("unowned", { ...current.first, id: "unowned" }); },
  "cloned index member": (current) => { current.index.set(current.first.id, { ...current.first }); },
  "hidden incomplete frame subtree": (current) => { current.frame.children?.pop(); },
  "control identity": (current) => { current.first.id = "bad\nID"; },
  "non-boolean lock": (current) => { current.first["locked"] = 1; },
  "source-only member": (current) => { current.sources.set("missing", 1); },
  "structural GROUP": (current) => { current.sources.set("structural-group", 1); },
  "wrong source marker": (current) => { current.sources.set(current.first.id, 2); },
  "unstored Text": (current) => { current.sources.delete(current.first.id); },
  "missing root family": (current) => { current.modelMap.clear(); },
  "missing family member": (current) => { current.family.delete(current.first); },
  "foreign family member": (current) => { current.family.add({ ...current.first }); },
  "duplicate model list": (current) => { current.shapes["getModels"] = (): Model[] => [current.first, current.first]; },
  "wrong model type": (current) => { current.first.modelType = "Attr"; },
  "wrong Text kind": (current) => { current.first.cmdKey = "attr"; },
  "inherited Text in root family": (current) => { const child = current.frame.children?.[0]; assert.ok(child); current.family.add(child); },
  "async source": (current) => { Reflect.set(current.handler, "getSourceCodeIdMap", (): Promise<Map<string, number>> => Promise.resolve(current.sources)); },
  "async models": (current) => { current.shapes["getModels"] = (): Promise<Model[]> => Promise.resolve([...current.family]); },
  "oversized source": (current) => { current.handler.getSourceCodeIdMap = (): Map<string, number> => new Map(Array.from({ length: 20_001 }, (_, index) => [`id-${String(index)}`, 1])); },
  "oversized model list": (current) => { current.shapes["getModels"] = (): unknown[] => Array.from({ length: 257 }); },
};
for (const [name, corrupt] of Object.entries(corruptions)) {
  void test(`Text reader refuses ${name} without a partial observation`, () => { const current = fixture(); corrupt(current); assert.throws(() => read(current), /SCH_TEXT_/u); });
}

for (const [field, values] of Object.entries({ x: [undefined, Number.NaN, Infinity, 1_000_000_001, "0"], y: [false], rotation: [Infinity], fontSize: [-1, Infinity],
  value: [null, undefined, 1, "x".repeat(65_537)], color: [false, "x".repeat(4097)], fontFamily: [0, "x".repeat(4097)], fontWeight: [0, undefined],
  italic: [1], underline: ["false"], hAlign: [-1, 3, 0.5, "0"], vAlign: [undefined, 9] })) {
  void test(`Text reader refuses invalid ${field} states`, () => {
    for (const value of values) { const current = fixture(); current.first[field] = value; assert.throws(() => read(current), /SCH_TEXT_STATE/u); }
  });
}

const replacements: Record<string, (current: Fixture) => void> = {
  SCH: (current) => { current.scope["SCH"] = { docMemoryManager: { getActiveDoc: (): unknown => current.page } }; },
  UI: (current) => { current.scope["UI"] = { tabBar: { getActiveTab: (): string => "fixture-page@fixture-project" } }; },
  project: (current) => { current.page["projectMgr"] = { uuid: "fixture-project" }; },
  shapes: (current) => { current.page["shapeManager"] = { ...current.shapes }; },
  modelMap: (current) => { current.shapes["modelMap"] = new Map(current.modelMap); },
  family: (current) => { current.modelMap.set("Text", new Set(current.family)); },
  source: (current) => { current.sources.delete("frame"); },
  rootOrder: (current) => { current.root.children?.reverse(); },
  descendantOrder: (current) => { current.frame.children?.reverse(); },
  descendantType: (current) => { const child = current.frame.children?.[0]; assert.ok(child); child.modelType = "Attr"; },
  lock: (current) => { current.first["locked"] = true; },
  value: (current) => { current.first["value"] = "changed"; },
  nullableStyle: (current) => { current.first["fontWeight"] = false; },
  alignment: (current) => { current.first["hAlign"] = 0; },
  sign: (current) => { current.first["x"] = -0; },
  kind: (current) => { current.first.cmdKey = "attr"; },
  identity: (current) => { current.index.set(current.first.id, { ...current.first }); },
};
for (const [name, replace] of Object.entries(replacements)) {
  void test(`Text reader refuses ${name} drift at the second scalar capture`, () => {
    const current = fixture(); current.first["x"] = 0;
    let calls = 0; current.shapes["getModels"] = (): Model[] => { calls += 1; if (calls === 2) { replace(current); } return [...current.family]; };
    assert.throws(() => read(current), /SCH_TEXT_/u);
  });
}

void test("Text reader reproves full tree after source/getter calls, including final-source subtree drift", () => {
  for (const call of [1, 2, 3, 4]) {
    const current = fixture(); let calls = 0;
    current.handler.getSourceCodeIdMap = (): Map<string, number> => { calls += 1; if (calls === call) { current.frame.children?.reverse(); } return new Map(current.sources); };
    assert.throws(() => read(current), /SCH_TEXT_CHANGED/u);
  }
  const current = fixture(); Object.defineProperty(current.first, "value", { get: (): string => { current.frame.children?.reverse(); return "a-text"; } });
  assert.throws(() => read(current), /SCH_TEXT_CHANGED/u);
});

void test("Text bounds apply to the entire family even when selecting one identity", () => {
  const current = fixture();
  for (let index = 0; index < 255; index += 1) { current.addText(`text-${String(index)}`); }
  assert.throws(() => read(current, selectedRequest("a-text")), /SCH_TEXT_FAMILY/u);
  const large = fixture(); large.first["value"] = "x".repeat(65_536); large.last["value"] = "x".repeat(65_536);
  large.addText("large1")["value"] = "x".repeat(65_536); large.addText("large2")["value"] = "x".repeat(65_536);
  assert.equal(schematicTextStatesSchema.parse(read(large)).length, 4);
  large.first["color"] = "x"; assert.throws(() => read(large, selectedRequest("a-text")), /SCH_TEXT_BOUND/u);
});

void test("Text strict arguments narrow primitiveIds to one ID or 1–256 distinct IDs and prohibit scene expansion", () => {
  assert.deepEqual(schematicTextReadRequestSchema.parse(selectedRequest("a-text")), selectedRequest("a-text"));
  for (const primitiveIds of [[], ["a", "a"], ["a\n"], Array.from({ length: 257 }, (_, index) => String(index)), {}, null]) {
    assert.throws(() => schematicTextReadRequestSchema.parse({ method: SCHEMATIC_TEXT_READ_METHODS[0], arguments: { primitiveIds } }));
  }
  for (const argumentsValue of [{}, { primitiveIds: "a", code: "caller" }, { primitiveIds: "a", allSchematicPages: true }]) {
    assert.throws(() => schematicTextReadRequestSchema.parse({ method: SCHEMATIC_TEXT_READ_METHODS[0], arguments: argumentsValue }));
  }
  assert.throws(() => schematicTextReadRequestSchema.parse({ ...request, arguments: { primitiveIds: "a" } }));
});

void test("Text diagnostics expose only the fixed literal inventory and never exception contents", async () => {
  const guards = [...new Set([...buildSchematicTextReadExpression(request).matchAll(/bad\('([A-Z_]+)'\)/gu)].map((match) => match[1] ?? ""))].toSorted();
  assert.deepEqual(guards, [...SCHEMATIC_TEXT_GUARD_CODES].toSorted());
  assert.throws(() => Reflect.apply(buildSchematicTextReadExpression, undefined, [request, "caller-code"]));
  for (const kind of ["guard", "exception"] as const) {
    const current = fixture();
    if (kind === "guard") { current.root.children?.shift(); }
    else { current.handler.getSourceCodeIdMap = (): never => { throw Object.defineProperty(new Error("private"), "message", { get: (): never => assert.fail("Private exception getter read.") }); }; }
    const code = wrapWithContextGuard(buildPublicSdkReadCode(request), context);
    const operation = async (): Promise<unknown> => {
      try { return await runInNewContext(`(async()=>{${code}})()`, { ...current.scope, TextEncoder }) as unknown; }
      catch (error) { assert.ok(error !== null && typeof error === "object"); const message: unknown = Reflect.get(error, "message"); return extractToolPayload({ structuredContent: { ok: false, error: message } }); }
    };
    await assert.rejects(operation, { message: `The upstream EasyEDA tool reported failure [native-schematic-text:${request.method}:${kind === "guard" ? "TREE" : "EXCEPTION"}].` });
  }
});

void test("registered Text readers expose native-only authority, schemas and source provenance through the real wrapper", async () => {
  for (const input of [request, selectedRequest("a-text")]) {
    const parsed = schematicTextReadRequestSchema.parse(input); const method = parsed.method;
    const descriptor = publicSdkReadDescriptors().find((entry) => entry.path === method); assert.ok(descriptor);
    assert.deepEqual(descriptor.documentTypes, [1]); assert.equal(descriptor.implementation.kind, "native-task-equivalent");
    assert.equal(descriptor.implementation.source, "server/src/schematic-text-read.ts"); assert.equal(descriptor.implementation.test, "server/tests/schematic-text-read.test.ts");
    assert.equal(descriptor.parameterSupport, "narrowed"); assert.equal(descriptor.liveValidation, "not-yet-validated");
    assert.deepEqual(validatePublicSdkReadRequest(input, 1), input);
    for (const type of [2, 3, 4, 15]) { assert.throws(() => validatePublicSdkReadRequest(input, type)); }
    const row = inventoryExtensionApiCoverage().find((entry) => entry.path === method); assert.ok(row);
    assert.equal(row.status, "implemented-native-equivalent"); assert.equal(row.omission, null); assert.equal(row.completeDeclaredContractSupported, false);
    assert.equal(row.currentGenerationLiveValidation, "not-recorded");
    const current = fixture(), eda = current.scope["eda"]; assert.ok(eda !== null && typeof eda === "object"); Reflect.deleteProperty(eda, "sch_PrimitiveText");
    const code = wrapWithContextGuard(buildPublicSdkReadCode(input), context);
    const envelope: unknown = await runInNewContext(`(async()=>{${code}})()`, { ...current.scope, TextEncoder });
    const payload = validatePublicSdkReadPayload(decodeExactReadEnvelope(envelope), input);
    assert.deepEqual(payload["value"], read(current, input)); assert.equal(payload["implementationKind"], "native-task-equivalent");
    assert.equal(payload["assurance"], "bounded-native-text-state-observation-not-complete-source-connectivity-or-persistence-proof");
  }
});

void test("Text exact transport normalizes signed zero only after the synchronous native reproof", async () => {
  const current = fixture(); current.first["x"] = -0; current.first["y"] = -0; current.first["rotation"] = -0;
  const native = schematicTextStatesSchema.parse(read(current)); assert.ok(Object.is(native[0]?.x, -0));
  const code = wrapWithContextGuard(buildPublicSdkReadCode(request), context);
  const envelope: unknown = await runInNewContext(`(async()=>{${code}})()`, { ...current.scope, TextEncoder });
  const payload = validatePublicSdkReadPayload(decodeExactReadEnvelope(envelope), request);
  const first = schematicTextStatesSchema.parse(payload["value"])[0]; assert.ok(first);
  for (const value of [first.x, first.y, first.rotation]) { assert.equal(value, 0); assert.ok(!Object.is(value, -0)); }
});

void test("host refuses incomplete, extra, unsorted, malformed and undefined Text result DTOs", () => {
  const rows = schematicTextStatesSchema.parse(read(fixture())); const first = rows[0]; assert.ok(first);
  const payload = { ok: true, kind: "public-sdk-read", method: request.method, present: true, value: rows, undefinedPaths: [] };
  assert.deepEqual(validatePublicSdkReadPayload(payload, request)["value"], rows);
  for (const value of [[first, first], rows.toReversed(), [{ ...first, y: undefined }], [{ ...first, fontWeight: 0 }], [{ ...first, sdkAlignMode: 1 }],
    [{ ...first, value: "[Truncated]" }], [{ ...first, value: "x".repeat(65_537) }], Array.from({ length: 257 }, () => first)]) {
    assert.throws(() => validatePublicSdkReadPayload({ ...payload, value }, request));
  }
  for (const undefinedPaths of [["/value"], ["/value/0/y"], ["/other"]]) { assert.throws(() => validatePublicSdkReadPayload({ ...payload, undefinedPaths }, request)); }
  assert.throws(() => validatePublicSdkReadPayload({ ...payload, present: false }, request));
  for (const value of [[], rows, [{ ...first, primitiveId: "other" }]]) { assert.throws(() => validatePublicSdkReadPayload({ ...payload, method: SCHEMATIC_TEXT_READ_METHODS[0], value }, selectedRequest("a-text"))); }
});

void test("real Text coordinator double-samples and rejects context/profile/quarantine/state drift", async () => {
  for (const failure of ["none", "context", "profile", "quarantine", "state"]) {
    const current = fixture(); let calls = 0, contexts = 0, gates = 0, profiles = 0;
    class FixtureEngine extends EasyedaControlEngine {
      // oxlint-disable-next-line eslint/class-methods-use-this -- Instance override intercepts the production profile admission seam.
      protected override assertPublicSdkImplementation(): Promise<void> {
        profiles += 1; return failure === "profile" && profiles === 2 ? Promise.reject(new Error("fixture profile drift")) : Promise.resolve();
      }
    }
    const engine = new FixtureEngine({ async callTool(name, args): Promise<unknown> {
      assert.equal(name, "easyeda_execute"); assert.ok(typeof args?.["code"] === "string"); calls += 1;
      if (failure === "state" && calls === 2) { current.first["value"] = "changed"; }
      const result: unknown = await runInNewContext(`(async()=>{${args["code"]}})()`, { ...current.scope, TextEncoder }); return { structuredContent: { ok: true, result } };
    } });
    engine.assertBridgeDispatchAllowed = (): Promise<true> => { gates += 1; return failure === "quarantine" && gates === 3 ? Promise.reject(new Error("fixture quarantine")) : Promise.resolve(true); };
    engine.assertContext = (expected): Promise<ContextProbePayload> => { contexts += 1; return failure === "context" && contexts === 3 ? Promise.reject(new Error("fixture context drift")) : Promise.resolve({ ...structuredClone(expected), document: { ...structuredClone(expected.document), tabId: "fixture-page@fixture-project" } }); };
    if (failure === "none") {
      const result = await engine.publicSdkRead(request, context); assert.equal(result["authority"], "native-text-state-observation-not-complete-source-connectivity-or-persistence-proof"); assert.equal(calls, 2);
    } else { await assert.rejects(engine.publicSdkRead(request, context), /fixture|changed between consecutive samples/u); assert.equal(calls, ["profile", "state"].includes(failure) ? 2 : 1); }
  }
});
