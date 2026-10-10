import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import { buildPublicSdkReadCode, publicSdkReadDescriptors, validatePublicSdkReadPayload, validatePublicSdkReadRequest } from "../src/public-sdk-read.ts";
import { buildSchematicNativeIdsExpression } from "../src/schematic-native-ids.ts";
import { inventoryExtensionApiCoverage } from "../src/extension-api-coverage.ts";
import { wrapWithContextGuard } from "../src/runtime-scripts.ts";
import { EasyedaControlEngine } from "../src/engine.ts";
import type { ContextProbePayload, ExpectedContext } from "../src/engine.ts";

const context: ExpectedContext = { project: { uuid: "fixture-project", path: "/tmp/fixture.eprj2" }, document: { uuid: "fixture-page", documentType: 1, tabId: "fixture-page@fixture-project" } };
const request = (family = "Text"): { method: string; arguments: Record<string, unknown> } => ({ method: `eda.sch_Primitive${family}.getAllPrimitiveId`, arguments: {} });
interface Model { id: string; modelType: string; type?: string; shapeManager: unknown }
const forbidden = (): never => { throw new Error("Forbidden public SDK/compiler/serialization/write path."); };
function fixture(): {
  scope: Record<string, unknown>; page: Record<string, unknown>; shapes: Record<string, unknown>;
  index: Map<string, Model>; sources: Map<string, number>; families: Map<string, Set<Model>>;
  handler: { getSourceCodeIdMap: () => Map<string, number> }; manager: { getActiveDoc: () => unknown };
  models: Model[]; add: (model: Model) => void;
} {
  const families = new Map<string, Set<Model>>(), index = new Map<string, Model>(), sources = new Map<string, number>();
  const handler = { getSourceCodeIdMap: (): Map<string, number> => new Map(sources) };
  const ids = { idMap: index };
  const shapes: Record<string, unknown> = { idManager: ids, modelMap: families, actionRunner: { running: false },
    getModels: (type: string): Model[] => [...(families.get(type) ?? [])] };
  const page: Record<string, unknown> = { uuid: "fixture-page", project_uuid: "fixture-project", tabId: "fixture-page@fixture-project", projectMgr: { uuid: "fixture-project" },
    isSchSheetDoc: (): boolean => true, isBlockSymbolInstancePage: false, shapeManager: shapes, idManager: ids,
    consistencyImpl: { state: "initialized", decodeAndRealTimeSyncHandler: handler } };
  shapes["docManager"] = page;
  Reflect.set(ids, "docManager", page);
  const consistency = page["consistencyImpl"]; assert.ok(consistency !== null && typeof consistency === "object");
  Reflect.set(consistency, "docManager", page); Reflect.set(consistency, "handler", handler);
  Reflect.set(handler, "consistencyImpl", consistency); Reflect.set(handler, "docManager", page);
  const manager = { getActiveDoc: (): unknown => page };
  page["getSourceCode"] = forbidden;
  const scope: Record<string, unknown> = { Map, Set, TextEncoder, SCH: { docMemoryManager: manager }, UI: { tabBar: { getActiveTab: (): string => "fixture-page@fixture-project" } },
    EXPECTED_DOCUMENT_UUID: "fixture-page", EXPECTED_PROJECT_UUID: "fixture-project", EXPECTED_DOCUMENT_TYPE: 1, EXPECTED_TAB_ID: "fixture-page@fixture-project",
    eda: { sch_PrimitiveText: { getAllPrimitiveId: forbidden }, sch_PrimitiveWire: { getAllPrimitiveId: forbidden }, sch_PrimitiveBus: { getAllPrimitiveId: forbidden },
      dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve(context.project) }, dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => Promise.resolve(context.document) } } };
  const add = (model: Model): void => {
    index.set(model.id, model); sources.set(model.id, 1);
    const members = families.get(model.modelType) ?? new Set<Model>(); members.add(model); families.set(model.modelType, members);
  };
  const models: Model[] = [{ id: "text-z", modelType: "Text", shapeManager: shapes }, { id: "text-a", modelType: "Text", shapeManager: shapes },
    { id: "wire-group", modelType: "NetGroup", type: "wire", shapeManager: shapes }, { id: "bus-group", modelType: "NetGroup", type: "bus", shapeManager: shapes },
    { id: "line-child", modelType: "Wire", shapeManager: shapes }];
  for (const model of models) { add(model); }
  return { scope, page, shapes, index, sources, families, handler, manager, models, add };
}
type Fixture = ReturnType<typeof fixture>;
function read(current: Fixture, family = "Text"): unknown {
  const result: unknown = runInNewContext(buildSchematicNativeIdsExpression(request(family).method), current.scope, { timeout: 1000 });
  return structuredClone(result);
}

for (const [family, expected] of [["Text", ["text-a", "text-z"]], ["Wire", ["wire-group"]], ["Bus", ["bus-group"]]] as const) {
  void test(`native ${family} IDs use the complete source-backed family, not public wrappers or LINE children`, async () => {
    const current = fixture();
    assert.deepEqual(read(current, family), expected);
    const code = wrapWithContextGuard(buildPublicSdkReadCode(request(family)), context);
    const envelope: unknown = await runInNewContext(`(async()=>{${code}})()`, current.scope);
    const payload = validatePublicSdkReadPayload(decodeExactReadEnvelope(envelope), request(family));
    assert.deepEqual(payload["value"], expected); assert.equal(payload["implementationKind"], "native-task-equivalent");
    assert.equal(payload["assurance"], "bounded-native-id-observation-not-complete-source-connectivity-or-persistence-proof");
    current.index.clear(); current.sources.clear(); current.families.clear();
    assert.deepEqual(read(current, family), []);
  });
}

const corruptions: Record<string, (current: Fixture) => void> = {
  "missing manager": (current) => { current.scope["SCH"] = {}; },
  "foreign page": (current) => { current.page["uuid"] = "foreign"; },
  "foreign project": (current) => { current.page["project_uuid"] = "foreign"; },
  "foreign tab": (current) => { current.page["tabId"] = "foreign"; },
  "symbol scene": (current) => { current.page["isSchSheetDoc"] = (): boolean => false; },
  "block instance": (current) => { current.page["isBlockSymbolInstancePage"] = true; },
  "missing project": (current) => { current.page["projectMgr"] = undefined; },
  "foreign project owner UUID": (current) => { current.page["projectMgr"] = { uuid: "foreign-project" }; },
  "not initialized": (current) => { const consistency = current.page["consistencyImpl"]; assert.ok(consistency !== null && typeof consistency === "object"); Reflect.set(consistency, "state", "loading"); },
  "busy action": (current) => { current.shapes["actionRunner"] = { running: true }; },
  "foreign shape owner": (current) => { current.shapes["docManager"] = {}; },
  "different ID manager": (current) => { current.shapes["idManager"] = {}; },
  "foreign ID index owner": (current) => { const ids = current.page["idManager"]; assert.ok(ids !== null && typeof ids === "object"); Reflect.set(ids, "docManager", {}); },
  "foreign source owner": (current) => { Reflect.set(current.handler, "docManager", {}); },
  "foreign source consistency": (current) => { Reflect.set(current.handler, "consistencyImpl", {}); },
  "foreign consistency owner": (current) => { const consistency = current.page["consistencyImpl"]; assert.ok(consistency !== null && typeof consistency === "object"); Reflect.set(consistency, "docManager", {}); },
  "inactive source handler": (current) => { const consistency = current.page["consistencyImpl"]; assert.ok(consistency !== null && typeof consistency === "object"); Reflect.set(consistency, "handler", {}); },
  "missing source model": (current) => { current.sources.set("missing", 1); },
  "invalid source marker": (current) => { current.sources.set("text-a", 2); },
  "untracked text": (current) => { current.sources.delete("text-a"); },
  "untracked bus": (current) => { current.sources.delete("bus-group"); },
  "source omitted by family": (current) => { current.families.get("Text")?.clear(); },
  "same ID different index object": (current) => { const model = current.models[0]; assert.ok(model); current.index.set(model.id, { ...model }); },
  "same ID different family object": (current) => { const model = current.models[0]; assert.ok(model); current.families.get("Text")?.add({ ...model }); },
  "duplicate getModels result": (current) => { current.shapes["getModels"] = (): Model[] => { const model = current.models[0]; assert.ok(model); return [model, model]; }; },
  "extra index-only family": (current) => { current.index.set("missing", { id: "missing", modelType: "Text", shapeManager: current.shapes }); },
  "unknown group type": (current) => { const model = current.models[2]; assert.ok(model); model.type = "unknown"; },
  "foreign model owner": (current) => { const model = current.models[0]; assert.ok(model); model.shapeManager = {}; },
  "wrong native model type": (current) => { const model = current.models[0]; assert.ok(model); model.modelType = "Attr"; },
  "control character ID": (current) => { current.add({ id: "bad\nID", modelType: "Text", shapeManager: current.shapes }); },
  "long ID": (current) => { current.add({ id: "x".repeat(257), modelType: "Text", shapeManager: current.shapes }); },
  "oversized source inventory": (current) => { current.handler.getSourceCodeIdMap = (): Map<string, number> => new Map(Array.from({ length: 100_001 }, (_, i) => [`id-${String(i)}`, 1])); },
  "oversized model list": (current) => { current.shapes["getModels"] = (): unknown[] => Array.from({ length: 20_001 }); },
};
for (const [name, corrupt] of Object.entries(corruptions)) {
  void test(`native ID reader refuses ${name} without an empty fallback`, () => {
    const current = fixture(); corrupt(current); assert.throws(() => read(current), name === "not initialized" ? /SCH_NATIVE_IDS_NOT_READY/u : /SCH_NATIVE_IDS_/u);
  });
}

const replacements: Record<string, (current: Fixture) => void> = {
  SCH: (current) => { current.scope["SCH"] = { docMemoryManager: current.manager }; },
  UI: (current) => { current.scope["UI"] = { tabBar: { getActiveTab: (): string => "fixture-page@fixture-project" } }; },
  manager: (current) => { current.scope["SCH"] = { docMemoryManager: { getActiveDoc: (): unknown => current.page } }; },
  page: (current) => { current.manager.getActiveDoc = (): unknown => ({ ...current.page }); },
  project: (current) => { current.page["projectMgr"] = {}; },
  projectUuid: (current) => { const project = current.page["projectMgr"]; assert.ok(project !== null && typeof project === "object"); Reflect.set(project, "uuid", "foreign-project"); },
  shapes: (current) => { current.page["shapeManager"] = { ...current.shapes }; },
  index: (current) => { current.page["idManager"] = { idMap: new Map(current.index) }; },
  modelMap: (current) => { current.shapes["modelMap"] = new Map(current.families); },
  familySet: (current) => { current.families.set("Text", new Set(current.families.get("Text"))); },
  action: (current) => { current.shapes["actionRunner"] = { running: false }; },
  consistency: (current) => { current.page["consistencyImpl"] = { state: "initialized", decodeAndRealTimeSyncHandler: current.handler }; },
  handler: (current) => { current.page["consistencyImpl"] = { state: "initialized", decodeAndRealTimeSyncHandler: { ...current.handler } }; },
  model: (current) => {
    const model = current.models[0]; assert.ok(model);
    const replacement = { ...model }; current.index.set(model.id, replacement);
    const members = current.families.get("Text"); members?.delete(model); members?.add(replacement);
  },
  source: (current) => { current.sources.delete("text-a"); },
  groupType: (current) => { const model = current.models[2]; assert.ok(model); model.type = "bus"; },
};
for (const [name, replace] of Object.entries(replacements)) {
  void test(`native ID reader refuses same-identity ${name} replacement during collection`, () => {
    const current = fixture(); let reads = 0;
    current.handler.getSourceCodeIdMap = (): Map<string, number> => { reads += 1; if (reads === 2) { replace(current); } return new Map(current.sources); };
    assert.throws(() => read(current), /SCH_NATIVE_IDS_/u);
  });
}

void test("three native ID descriptors preserve public defaults, strict empty arguments and narrow type-1 coverage", () => {
  const coverage = inventoryExtensionApiCoverage(), descriptors = publicSdkReadDescriptors();
  for (const family of ["Text", "Wire", "Bus"]) {
    const input = request(family);
    const descriptor = descriptors.find((entry) => entry.path === input.method);
    assert.ok(descriptor); assert.equal(descriptor.implementation.kind, "native-task-equivalent"); assert.deepEqual(descriptor.documentTypes, [1]);
    assert.equal(descriptor.liveValidation, "not-yet-validated"); assert.equal(descriptor.parameterSupport, "narrowed");
    assert.deepEqual(descriptor.parameters, family === "Wire" ? ["net"] : []);
    assert.deepEqual(validatePublicSdkReadRequest(input, 1), input);
    for (const documentType of [2, 3, 4]) { assert.throws(() => validatePublicSdkReadRequest(input, documentType)); }
    for (const net of ["GND", ["GND"], [], null, undefined]) { assert.throws(() => validatePublicSdkReadRequest({ ...input, arguments: { net } }, 1)); }
    const row = coverage.find((entry) => entry.path === input.method); assert.ok(row);
    assert.equal(row.status, "implemented-native-equivalent"); assert.equal(row.omission, null); assert.equal(row.completeDeclaredContractSupported, false);
  }
  for (const descriptor of descriptors.filter((entry) => !/^eda\.sch_Primitive(?:Text|Wire|Bus)\.getAllPrimitiveId$/u.test(entry.path))) {
    assert.equal(descriptor.implementation.kind, "public-method");
  }
  assert.throws(() => buildSchematicNativeIdsExpression("eda.sch_PrimitiveWire.getAll"));
});

void test("native ID collection refuses thenable inventories instead of publishing a premature empty result", () => {
  for (const reader of ["source", "models"]) {
    const current = fixture();
    if (reader === "source") { Reflect.set(current.handler, "getSourceCodeIdMap", (): Promise<Map<string, number>> => Promise.resolve(new Map(current.sources))); }
    else { current.shapes["getModels"] = (): Promise<Model[]> => Promise.resolve([]); }
    assert.throws(() => read(current), /SCH_NATIVE_IDS_/u);
  }
});

void test("guarded ID collection detects native tab drift across its awaited public context calls", async () => {
  const current = fixture();
  const eda = current.scope["eda"]; assert.ok(eda !== null && typeof eda === "object");
  Reflect.set(eda, "dmt_Project", { getCurrentProjectInfo: async (): Promise<unknown> => {
    await Promise.resolve();
    current.scope["UI"] = { tabBar: { getActiveTab: (): string => "foreign-page@fixture-project" } };
    return context.project;
  } });
  const code = wrapWithContextGuard(buildPublicSdkReadCode(request()), context);
  // The declaration-facing context still reports the original page. The native
  // Reader must independently reject the changed tab after those awaited calls.
  const operation = async (): Promise<unknown> => { const value: unknown = await runInNewContext(`(async()=>{${code}})()`, current.scope); return value; };
  await assert.rejects(operation, /could not produce a complete bounded observation/u);
});

void test("real SDK engine double-samples the native reader and refuses context, profile, quarantine and inventory drift", async () => {
  for (const failure of ["none", "context", "profile", "quarantine", "inventory"]) {
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
      if (failure === "inventory" && calls === 2) { current.add({ id: "new-text", modelType: "Text", shapeManager: current.shapes }); }
      const result: unknown = await runInNewContext(`(async()=>{${args["code"]}})()`, current.scope);
      return { structuredContent: { ok: true, result } };
    } });
    engine.assertBridgeDispatchAllowed = (): Promise<true> => { gates += 1; return failure === "quarantine" && gates === 3 ? Promise.reject(new Error("fixture quarantine")) : Promise.resolve(true); };
    engine.assertContext = (expected): Promise<ContextProbePayload> => { contexts += 1; return failure === "context" && contexts === 3 ? Promise.reject(new Error("fixture context drift")) : Promise.resolve({ ...structuredClone(expected), document: { ...structuredClone(expected.document), tabId: "fixture-page@fixture-project" } }); };
    if (failure === "none") { const result = await engine.publicSdkRead(request(), context); assert.equal(result["authority"], "native-id-observation-not-complete-source-connectivity-or-persistence-proof"); assert.equal(calls, 2); }
    else { await assert.rejects(engine.publicSdkRead(request(), context), /fixture|changed between consecutive samples/u); assert.equal(calls, ["profile", "inventory"].includes(failure) ? 2 : 1); }
  }
});
