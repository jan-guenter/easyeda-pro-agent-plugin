import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

import { SCHEMATIC_COMPONENT_PROPERTY_GUARD_CODES, SCHEMATIC_COMPONENT_PROPERTY_METHOD, buildSchematicComponentPropertyNamesExpression, schematicComponentPropertyNamesSchema } from "../src/schematic-component-properties.ts";
import { buildPublicSdkReadCode, publicSdkReadDescriptors, validatePublicSdkReadPayload, validatePublicSdkReadRequest } from "../src/public-sdk-read.ts";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import { wrapWithContextGuard } from "../src/runtime-scripts.ts";
import { EasyedaControlEngine } from "../src/engine.ts";
import { extractToolPayload } from "../src/core.ts";
import { inventoryExtensionApiCoverage } from "../src/extension-api-coverage.ts";
import type { ContextProbePayload, ExpectedContext } from "../src/engine.ts";

const context: ExpectedContext = { project: { uuid: "fixture-project", path: "/tmp/fixture.eprj2" }, document: { uuid: "fixture-page", documentType: 1, tabId: "fixture-page@fixture-project" } };
const request = { method: SCHEMATIC_COMPONENT_PROPERTY_METHOD, arguments: {} };

// oxlint-disable eslint/no-underscore-dangle -- Fixtures must retain the pinned native Symbol._attrMap field name.
interface Model {
  id: string; modelType: string; shapeManager: unknown; parent?: Model; children?: Model[];
  isConnected: boolean; cmdKey?: string; key?: string; _attrMap?: Map<string, Model>; getAttr?: () => Model[];
}

const forbidden = (): never => { throw new Error("Forbidden value/compiler/serialization/RPC/write path."); };
function fixture(): {
  scope: Record<string, unknown>; page: Record<string, unknown>; shapes: Record<string, unknown>;
  root: Model; models: Model[]; attrs: Model[]; sources: Map<string, number>; index: Map<string, Model>;
  family: Set<Model>; modelMap: Map<string, Set<Model>>; handler: { getSourceCodeIdMap: () => Map<string, number> };
  addSymbol: (id: string, kind: string) => Model;
  addAttribute: (symbol: Model, id: string, key: string, stored?: boolean) => Model;
  addChild: (parent: Model, model: Model, stored?: boolean) => void;
} {
  const family = new Set<Model>(), index = new Map<string, Model>(), sources = new Map<string, number>();
  const modelMap = new Map([['Symbol', family]]);
  const handler = { getSourceCodeIdMap: (): Map<string, number> => new Map(sources) };
  const ids = { idMap: index };
  const shapes: Record<string, unknown> = { idManager: ids, modelMap, actionRunner: { running: false },
    getModels: (type: string): Model[] => [...(modelMap.get(type) ?? [])] };
  const root: Model = { id: "root", modelType: "Root", shapeManager: shapes, children: [], isConnected: true };
  shapes["root"] = root;
  const page: Record<string, unknown> = { uuid: "fixture-page", project_uuid: "fixture-project", tabId: "fixture-page@fixture-project",
    projectMgr: { uuid: "fixture-project" }, isSchSheetDoc: (): boolean => true, isBlockSymbolInstancePage: false,
    shapeManager: shapes, idManager: ids, consistencyImpl: { state: "initialized", decodeAndRealTimeSyncHandler: handler }, getSourceCode: forbidden };
  shapes["docManager"] = page;
  Reflect.set(ids, "docManager", page);
  const consistency = page["consistencyImpl"]; assert.ok(consistency !== null && typeof consistency === "object");
  Reflect.set(consistency, "docManager", page); Reflect.set(consistency, "handler", handler);
  Reflect.set(handler, "docManager", page); Reflect.set(handler, "consistencyImpl", consistency);
  const scope: Record<string, unknown> = { Map, Set, SCH: { docMemoryManager: { getActiveDoc: (): unknown => page } },
    UI: { tabBar: { getActiveTab: (): string => "fixture-page@fixture-project" } },
    EXPECTED_DOCUMENT_UUID: "fixture-page", EXPECTED_PROJECT_UUID: "fixture-project", EXPECTED_DOCUMENT_TYPE: 1, EXPECTED_TAB_ID: "fixture-page@fixture-project",
    eda: { sch_PrimitiveComponent: { getAllPropertyNames: forbidden }, sch_Netlist: { getNetlist: forbidden },
      dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve(context.project) },
      dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => Promise.resolve(context.document) } } };
  const addChild = (parent: Model, model: Model, stored = false): void => {
    model.parent = parent; parent.children ??= []; parent.children.push(model); index.set(model.id, model);
    if (stored) { sources.set(model.id, 1); }
  };
  const addSymbol = (id: string, kind: string): Model => {
    const model: Model = { id, modelType: "Symbol", cmdKey: kind, shapeManager: shapes, children: [], isConnected: true, _attrMap: new Map() };
    // These exact map-value semantics follow Symbol.getAttr in pinned SCH.
    model.getAttr = function getAttr(this: Model): Model[] { assert.equal(this, model); return [...(this._attrMap?.values() ?? [])]; };
    Object.defineProperty(model, "multiPart", { get: forbidden });
    Reflect.set(model, "getApiShapeData", forbidden); Reflect.set(model, "uploadTo", forbidden);
    family.add(model); addChild(root, model, true); return model;
  };
  const addAttribute = (symbol: Model, id: string, key: string, stored = false): Model => {
    const attr: Model = { id, key, modelType: "Attr", shapeManager: shapes, isConnected: true };
    for (const field of ["value", "symbolValue", "blockValue", "instanceValue"]) { Object.defineProperty(attr, field, { get: forbidden }); }
    Reflect.set(attr, "getValue", forbidden); Reflect.set(attr, "getConsistencyData", forbidden);
    symbol._attrMap?.set(key, attr); addChild(symbol, attr, stored); return attr;
  };
  const models = [addSymbol("part", "part"), addSymbol("frame", "sheet"), addSymbol("flag", "netflag")];
  const [part, frame, flag] = models; assert.ok(part); assert.ok(frame); assert.ok(flag);
  const attrs = [addAttribute(part, "attr-name", "Name", true), addAttribute(part, "attr-case", "name"),
    addAttribute(part, "attr-custom", "Custom", true), addAttribute(frame, "attr-date", "@Update Date", true),
    addAttribute(frame, "attr-frame-name", "Name"), addAttribute(flag, "attr-relevance", "Relevance"), addAttribute(flag, "attr-empty", "")];
  addChild(frame, { id: "generated-grid-text", modelType: "Text", shapeManager: shapes, isConnected: true });
  const pin: Model = { id: "pin", modelType: "Pin", shapeManager: shapes, isConnected: true, children: [] };
  addChild(part, pin); addChild(pin, { id: "pin-name", key: "Pin Name", modelType: "Attr", shapeManager: shapes, isConnected: true });
  return { scope, page, shapes, root, models, attrs, sources, index, family, modelMap, handler, addSymbol, addAttribute, addChild };
}
type Fixture = ReturnType<typeof fixture>;
function read(current: Fixture): unknown {
  const result: unknown = runInNewContext(buildSchematicComponentPropertyNamesExpression(), current.scope, { timeout: 1000 });
  return structuredClone(result);
}

void test("component property names include every direct inherited/generated key, frames and flags without evaluating values", () => {
  const current = fixture();
  assert.deepEqual(read(current), ["", "@Update Date", "Custom", "Name", "Relevance", "name"]);
  for (const kind of ["netport", "offPageConnector", "nonElectrical_symbol", "short_symbol", "diffPairsFlag"]) {
    const model = current.addSymbol(kind, kind); current.addAttribute(model, `${kind}-attr`, kind);
  }
  const result = schematicComponentPropertyNamesSchema.parse(read(current));
  for (const kind of ["netport", "offPageConnector", "nonElectrical_symbol", "short_symbol", "diffPairsFlag"]) { assert.ok(result.includes(kind)); }
  assert.ok(!result.includes("Pin Name"));
});

void test("property keys preserve case, whitespace, control characters, empty and object-prototype names", () => {
  const current = fixture(), part = current.models[0]; assert.ok(part);
  const keys = [" ", "A", "a", "Z", "z", "\n", "\u0000", "__proto__", "constructor", "prototype", "é", "e\u0301"];
  for (const [index, key] of keys.entries()) { current.addAttribute(part, `key-${String(index)}`, key); }
  const result = schematicComponentPropertyNamesSchema.parse(read(current));
  for (const key of keys) { assert.ok(result.includes(key)); }
});

void test("empty result requires a proved empty component family, not a missing receiver fallback", () => {
  const current = fixture(); current.index.clear(); current.sources.clear(); current.family.clear(); current.root.children = [];
  assert.deepEqual(read(current), []);
  current.modelMap.clear(); assert.deepEqual(read(current), []);
  current.scope["SCH"] = {}; assert.throws(() => read(current), /SCH_COMPONENT_PROPERTIES_MANAGER/u);
});

const corruptions: Record<string, (current: Fixture, part: Model, attr: Model) => void> = {
  "foreign page": (current) => { current.page["uuid"] = "foreign"; },
  "foreign project": (current) => { current.page["project_uuid"] = "foreign"; },
  "foreign tab": (current) => { current.page["tabId"] = "foreign"; },
  "symbol scene": (current) => { current.page["isSchSheetDoc"] = (): boolean => false; },
  "block instance": (current) => { current.page["isBlockSymbolInstancePage"] = true; },
  "busy action": (current) => { current.shapes["actionRunner"] = { running: true }; },
  "foreign owner": (current) => { current.shapes["docManager"] = {}; },
  "uninitialized consistency": (current) => { const value = current.page["consistencyImpl"]; assert.ok(value !== null && typeof value === "object"); Reflect.set(value, "state", "loading"); },
  "inactive source handler": (current) => { const value = current.page["consistencyImpl"]; assert.ok(value !== null && typeof value === "object"); Reflect.set(value, "handler", {}); },
  "missing source model": (current) => { current.sources.set("missing", 1); },
  "structural GROUP": (current) => { current.sources.set("structural-group", 1); },
  "wrong source marker": (current) => { current.sources.set("part", 2); },
  "unstored component": (current) => { current.sources.delete("part"); },
  "missing root family": (current) => { current.modelMap.clear(); },
  "missing root member": (current, part) => { current.family.delete(part); },
  "foreign root member": (current, part) => { current.family.add({ ...part }); },
  "duplicate model list": (current, part) => { current.shapes["getModels"] = (): Model[] => [part, part, part]; },
  "unknown Symbol kind": (_current, part) => { part.cmdKey = "unknown"; },
  "hierarchical block Symbol": (_current, part) => { part.cmdKey = "block_symbol"; },
  "missing attribute map": (_current, part) => { delete part._attrMap; },
  "missing attribute reader": (_current, part) => { delete part.getAttr; },
  "missing inherited attribute": (_current, part) => { part._attrMap?.delete("name"); },
  "map key differs from attribute": (_current, part, attr) => { part._attrMap?.delete("Name"); part._attrMap?.set("NAME", attr); },
  "duplicate getAttr result": (_current, part, attr) => { part.getAttr = (): Model[] => [attr, attr, attr]; },
  "duplicate attribute key": (current, part) => { current.addAttribute(part, "second-name", "Name"); },
  "foreign inherited attribute": (_current, _part, attr) => { attr.shapeManager = {}; },
  "wrong attr parent": (current, _part, attr) => { attr.parent = current.root; },
  "wrong attr type": (_current, _part, attr) => { attr.modelType = "Text"; },
  "disconnected attr": (_current, _part, attr) => { attr.isConnected = false; },
  "missing attr index": (current, _part, attr) => { current.index.delete(attr.id); },
  "index-only attr": (current, _part, attr) => { current.index.set("unattached", { ...attr, id: "unattached" }); },
  "different attr index object": (current, _part, attr) => { current.index.set(attr.id, { ...attr }); },
  "missing reciprocal attr child": (_current, part) => { part.children?.shift(); },
  "unknown attribute key": (_current, _part, attr) => { delete attr.key; },
  "long attribute key": (_current, _part, attr) => { attr.key = "x".repeat(1025); },
  "control ID": (_current, _part, attr) => { attr.id = "invalid\nID"; },
  "disconnected root": (current) => { current.root.isConnected = false; },
  "cyclic tree": (current, part) => { part.children?.push(current.root); },
  "cross-linked junction": (current, part, attr) => { current.addChild(part, attr); },
  "unbounded source": (current) => { current.handler.getSourceCodeIdMap = (): Map<string, number> => new Map(Array.from({ length: 100_001 }, (_, index) => [`id-${String(index)}`, 1])); },
  "unbounded model list": (current) => { current.shapes["getModels"] = (): unknown[] => Array.from({ length: 20_001 }); },
  "unbounded attributes": (_current, part, attr) => { part.getAttr = (): Model[] => Array.from({ length: 4097 }, () => attr); },
};
for (const [name, corrupt] of Object.entries(corruptions)) {
  void test(`property reader refuses ${name} instead of publishing a partial set`, () => {
    const current = fixture();
    const attr = current.attrs[0], part = current.models[0]; assert.ok(part); assert.ok(attr);
    corrupt(current, part, attr); assert.throws(() => read(current), /SCH_COMPONENT_PROPERTIES_/u);
  });
}

const replacements: Record<string, (current: Fixture, part: Model, attr: Model) => void> = {
  SCH: (current) => { current.scope["SCH"] = { docMemoryManager: { getActiveDoc: (): unknown => current.page } }; },
  UI: (current) => { current.scope["UI"] = { tabBar: { getActiveTab: (): string => "fixture-page@fixture-project" } }; },
  project: (current) => { current.page["projectMgr"] = { uuid: "fixture-project" }; },
  shapes: (current) => { current.page["shapeManager"] = { ...current.shapes }; },
  modelMap: (current) => { current.shapes["modelMap"] = new Map(current.modelMap); },
  family: (current) => { current.modelMap.set("Symbol", new Set(current.family)); },
  source: (current) => { current.sources.delete("attr-name"); },
  rootOrder: (current) => { current.root.children?.reverse(); },
  attrOrder: (_current, part) => { part.children?.reverse(); },
  attrMap: (_current, part) => { part._attrMap = new Map(part._attrMap); },
  reader: (_current, part) => { part.getAttr = (): Model[] => [...(part._attrMap?.values() ?? [])]; },
  key: (_current, part, attr) => { part._attrMap?.delete("Name"); part._attrMap?.set("Changed", attr); attr.key = "Changed"; },
  kind: (_current, part) => { part.cmdKey = "sheet"; },
  modelIdentity: (current, part) => { const replacement = { ...part }; current.family.delete(part); current.family.add(replacement); current.index.set(part.id, replacement); },
  attrIdentity: (current, part, attr) => { const replacement = { ...attr }; part._attrMap?.set("Name", replacement); current.index.set(attr.id, replacement); },
};
for (const [name, replace] of Object.entries(replacements)) {
  void test(`property reader refuses ${name} drift between membership observations`, () => {
    const current = fixture();
    const attr = current.attrs[0], part = current.models[0]; assert.ok(part); assert.ok(attr);
    let calls = 0;
    current.handler.getSourceCodeIdMap = (): Map<string, number> => { calls += 1; if (calls === 2) { replace(current, part, attr); } return new Map(current.sources); };
    assert.throws(() => read(current), /SCH_COMPONENT_PROPERTIES_/u);
  });
}

void test("bounded names fail rather than truncating and the host checks exact sorted unique strings", () => {
  const current = fixture(), part = current.models[0]; assert.ok(part);
  for (let index = 0; index < 140; index += 1) { current.addAttribute(part, `large-${String(index)}`, `${String(index)}${"x".repeat(1000)}`); }
  assert.throws(() => read(current), /SCH_COMPONENT_PROPERTIES_RESULT_BOUND/u);
  for (const value of [["a", "a"], ["b", "a"], [null], ["x".repeat(1025)], Array.from({ length: 20_001 }, () => "x")]) {
    assert.throws(() => schematicComponentPropertyNamesSchema.parse(value));
  }
  assert.deepEqual(schematicComponentPropertyNamesSchema.parse(["", "A", "a"]), ["", "A", "a"]);
});

void test("property diagnostics use the exact fixed literal inventory and reject caller modes", () => {
  const expression = buildSchematicComponentPropertyNamesExpression();
  const guards = [...new Set([...expression.matchAll(/bad\('([A-Z_]+)'\)/gu)].map((match) => { assert.notEqual(match[1], undefined); return match[1] ?? ""; }))].toSorted();
  assert.deepEqual(guards, [...SCHEMATIC_COMPONENT_PROPERTY_GUARD_CODES].toSorted());
  assert.throws(() => Reflect.apply(buildSchematicComponentPropertyNamesExpression, undefined, ["caller-code"]));
  const current = fixture(); current.scope["SCH"] = {}; current.scope["failureCode"] = "initial";
  assert.throws(() => runInNewContext(buildSchematicComponentPropertyNamesExpression("sdk-failure-code"), current.scope), /SCH_COMPONENT_PROPERTIES_MANAGER/u);
  assert.equal(current.scope["failureCode"], "SCH_COMPONENT_PROPERTIES_MANAGER");
});

void test("synchronous property reader refuses asynchronous source, model and attribute inventories", () => {
  for (const reader of ["source", "models", "attributes"]) {
    const current = fixture(), part = current.models[0]; assert.ok(part);
    if (reader === "source") { Reflect.set(current.handler, "getSourceCodeIdMap", (): Promise<Map<string, number>> => Promise.resolve(new Map(current.sources))); }
    else if (reader === "models") { current.shapes["getModels"] = (): Promise<Model[]> => Promise.resolve(current.models); }
    else { Reflect.set(part, "getAttr", (): Promise<Model[]> => Promise.resolve(current.attrs)); }
    assert.throws(() => read(current), /SCH_COMPONENT_PROPERTIES_/u);
  }
});

void test("registered property reader has strict empty arguments and native-only method coverage", async () => {
  const descriptor = publicSdkReadDescriptors().find((entry) => entry.path === request.method); assert.ok(descriptor);
  assert.deepEqual(descriptor.documentTypes, [1]); assert.equal(descriptor.implementation.kind, "native-task-equivalent");
  assert.equal(descriptor.implementation.source, "server/src/schematic-component-properties.ts");
  assert.equal(descriptor.implementation.test, "server/tests/schematic-component-properties.test.ts");
  assert.equal(descriptor.parameterSupport, "narrowed"); assert.equal(descriptor.liveValidation, "not-yet-validated");
  assert.deepEqual(validatePublicSdkReadRequest(request, 1), request);
  for (const documentType of [2, 3, 4, 15]) { assert.throws(() => validatePublicSdkReadRequest(request, documentType)); }
  for (const args of [{ allSchematicPages: true }, { code: "caller code" }, { component: "part" }, { inherited: false }]) {
    assert.throws(() => validatePublicSdkReadRequest({ ...request, arguments: args }, 1));
  }
  const row = inventoryExtensionApiCoverage().find((entry) => entry.path === request.method); assert.ok(row);
  assert.equal(row.status, "implemented-native-equivalent"); assert.equal(row.omission, null); assert.equal(row.completeDeclaredContractSupported, false);
  assert.equal(row.currentGenerationLiveValidation, "not-recorded");
  assert.match(row.routes[0]?.scope ?? "", /native task-equivalent/u); assert.doesNotMatch(row.routes[0]?.scope ?? "", /native ID observation/u);
  const current = fixture(), eda = current.scope["eda"]; assert.ok(eda !== null && typeof eda === "object");
  // The native route neither calls nor requires an installed public wrapper.
  Reflect.deleteProperty(eda, "sch_PrimitiveComponent");
  const code = wrapWithContextGuard(buildPublicSdkReadCode(request), context);
  const envelope: unknown = await runInNewContext(`(async()=>{${code}})()`, { ...current.scope, TextEncoder });
  const payload = validatePublicSdkReadPayload(decodeExactReadEnvelope(envelope), request);
  assert.deepEqual(payload["value"], ["", "@Update Date", "Custom", "Name", "Relevance", "name"]);
  assert.equal(payload["implementationKind"], "native-task-equivalent");
  assert.equal(payload["assurance"], "bounded-native-property-name-observation-not-complete-source-connectivity-or-persistence-proof");
});

void test("host rejects duplicate, unsorted, undefined, malformed and transport-marker property-name observations", () => {
  const payload = { ok: true, kind: "public-sdk-read", method: request.method, present: true, value: ["", "Name", "name"], undefinedPaths: [] };
  assert.deepEqual(validatePublicSdkReadPayload(payload, request)["value"], payload.value);
  for (const value of [["Name", "Name"], ["name", "Name"], [null], ["x".repeat(1025)], ["[Truncated]"], ["[MaxDepth]"], ["[Circular]"]]) {
    assert.throws(() => validatePublicSdkReadPayload({ ...payload, value }, request));
  }
  for (const undefinedPaths of [["/value"], ["/value/0"], ["/unknown"]]) { assert.throws(() => validatePublicSdkReadPayload({ ...payload, undefinedPaths }, request)); }
  assert.throws(() => validatePublicSdkReadPayload({ ...payload, present: false }, request));
});

void test("property reader retains fixed diagnostics without exposing native exception text or getters", async () => {
  for (const kind of ["guard", "native", "accessor"] as const) {
    const current = fixture();
    if (kind === "guard") { current.root.children?.shift(); }
    else {
      current.handler.getSourceCodeIdMap = (): never => {
        if (kind === "native") { throw new Error("SCH_COMPONENT_PROPERTIES_TREE_MEMBERSHIP private credential"); }
        throw Object.defineProperty(new Error("Unobserved private native error."), "message", { get: (): never => { assert.fail("Native exception message getter was read."); } });
      };
    }
    const code = wrapWithContextGuard(buildPublicSdkReadCode(request), context);
    const operation = async (): Promise<unknown> => {
      try { return await runInNewContext(`(async()=>{${code}})()`, { ...current.scope, TextEncoder }) as unknown; }
      catch (error) {
        assert.ok(error !== null && typeof error === "object");
        const message: unknown = Reflect.get(error, "message"); assert.equal(typeof message, "string");
        return extractToolPayload({ structuredContent: { ok: false, error: message } });
      }
    };
    await assert.rejects(operation, { message: `The upstream EasyEDA tool reported failure [native-component-properties:${request.method}:${kind === "guard" ? "TREE_MEMBERSHIP" : "EXCEPTION"}].` });
  }
});

void test("real SDK coordinator double-samples native property names and rejects profile, context, quarantine and result drift", async () => {
  for (const failure of ["none", "context", "profile", "quarantine", "names"]) {
    const current = fixture(); let calls = 0, contexts = 0, gates = 0, profiles = 0;
    class FixtureEngine extends EasyedaControlEngine {
      // oxlint-disable-next-line eslint/class-methods-use-this -- Instance override intercepts the production profile admission seam.
      protected override assertPublicSdkImplementation(): Promise<void> {
        profiles += 1;
        return failure === "profile" && profiles === 2 ? Promise.reject(new Error("fixture profile drift")) : Promise.resolve();
      }
    }
    const engine = new FixtureEngine({ async callTool(name, args): Promise<unknown> {
      assert.equal(name, "easyeda_execute"); assert.ok(typeof args?.["code"] === "string"); calls += 1;
      if (failure === "names" && calls === 2) { const part = current.models[0]; assert.ok(part); current.addAttribute(part, "new-attribute", "New Property"); }
      const result: unknown = await runInNewContext(`(async()=>{${args["code"]}})()`, { ...current.scope, TextEncoder });
      return { structuredContent: { ok: true, result } };
    } });
    engine.assertBridgeDispatchAllowed = (): Promise<true> => { gates += 1; return failure === "quarantine" && gates === 3 ? Promise.reject(new Error("fixture quarantine")) : Promise.resolve(true); };
    engine.assertContext = (expected): Promise<ContextProbePayload> => { contexts += 1; return failure === "context" && contexts === 3 ? Promise.reject(new Error("fixture context drift")) : Promise.resolve({ ...structuredClone(expected), document: { ...structuredClone(expected.document), tabId: "fixture-page@fixture-project" } }); };
    if (failure === "none") {
      const result = await engine.publicSdkRead(request, context); assert.equal(result["authority"], "native-property-name-observation-not-complete-source-connectivity-or-persistence-proof"); assert.equal(calls, 2);
    } else { await assert.rejects(engine.publicSdkRead(request, context), /fixture|changed between consecutive samples/u); assert.equal(calls, ["profile", "names"].includes(failure) ? 2 : 1); }
  }
});
