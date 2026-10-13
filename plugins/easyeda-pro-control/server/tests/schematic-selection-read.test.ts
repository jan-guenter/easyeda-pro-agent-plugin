import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

import { SCHEMATIC_SELECTION_GUARD_CODES, SCHEMATIC_SELECTION_LIMITATIONS, SCHEMATIC_SELECTION_METHOD, SCHEMATIC_SELECTION_REPLACEMENT, buildSchematicSelectionReadExpression } from "../src/schematic-selection-read.ts";
import { buildPublicSdkReadCode, publicSdkReadDescriptors, validatePublicSdkReadPayload, validatePublicSdkReadRequest } from "../src/public-sdk-read.ts";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import { wrapWithContextGuard } from "../src/runtime-scripts.ts";
import { EasyedaControlEngine } from "../src/engine.ts";
import type { ContextProbePayload, ExpectedContext } from "../src/engine.ts";
import { inventoryExtensionApiCoverage } from "../src/extension-api-coverage.ts";
import { extractToolPayload, isRecord } from "../src/core.ts";
// oxlint-disable-next-line import/max-dependencies -- Validate fixed refusal categories through the real core pipeline as well as the actual coordinator.
import { nativeFailureCategory } from "../src/native-diagnostics.ts";

const context: ExpectedContext = { project: { uuid: "fixture-project", path: "/tmp/fixture.eprj2" },
  document: { uuid: "fixture-page", documentType: 1, tabId: "fixture-page@fixture-project" } };
const request = { method: SCHEMATIC_SELECTION_METHOD, arguments: {} };

// Exact installed api.js bodies, SHA5923696711fc5e4f3027ce500d5ba6aee57b9d8f9903fdba84820432066125fc,
// UTF-16 offsets1614681 and1620184. No fixture reimplementation of the fallback.
const publicWrappers = `new(class{
async getAllSelectedPrimitives_PrimitiveId(){return await _.extensionApiMessageBus2.rpcCall("extensionApi.SCH_SelectControl.getAllSelectedPrimitives_PrimitiveId")}
async getSelectedPrimitives_PrimitiveId(){try{let t=await _.extensionApiMessageBus2.rpcCall("extensionApi.SCH_SelectControl.getSelectedPrimitives_PrimitiveId");return t?t.map(i=>i.id):[]}catch(t){throw new Error(t)}}
})()`;
// Exact sch.js handler body @6074441, SHA3f50136fb4ba2d5593beac7ef3e20ebe5275177b56bbcfdd297e79f176a6618f.
const modernHandler = `()=>{let i=fe.instance.getActiveDoc();if(!i){console.error("\\u8BF7\\u6253\\u5F00\\u4E00\\u4E2A\\u753B\\u5E03");return}if(i.isSymbolDoc())return i.shapeManager.selectManager.get().map(e=>e.id);if(i.isSchSheetDoc()){let e=C.projectMgr.selectMgr.getTarget(Le()),t=new Set;for(let r of e){let n=i.shapeManager.idManager.get(r);n&&Sr(n)&&n.parent?t.add(n.parent.id):t.add(r)}return[...t]}}`;
// Exact UI An shim @15819414; LR @17040899 calls An("getSelected").
// UI SHA12414b9ded97913f7d7f30522a2265d2a6c995281e3347bfd1752206e647497a.
const legacyShim = `function An(t,e=void 0,i=fi(),o){let n=fe.getTabById(i),r=fe.getUuidAndPathByTab(i).path,a=((n==null?void 0:n.data)||{})["data-model-sheet-uuid"],s=a?\`\${a}@\${r}\`:i;var c=(Gn("frame_"+s)||{}).contentWindow;try{if(!c||!c.document||c.document.readyState!=="complete")return}catch(u){console.error(u);return}if(c.callCommand&&c.callCommand.hooks&&Object.hasOwnProperty.call(c.callCommand.hooks,t))return c.callCommand.invoke.apply(c,[t,e]);try{if(t.indexOf(".")>-1){var d=t.split(".");return d.length===2?t=c[d[0]][d[1]]:d.length===3?t=c[d[0]][d[1]][d[2]]:d.length===4&&(t=c[d[0]][d[1]][d[2]][d[4]]),t.apply(c,e)}else return c[t].apply(c,e)}catch{console.warn("Invalid editorCall cmd: "+t)}}`;

function fixture(): {
  scope: Record<string, unknown>; page: Record<string, unknown>; shapes: Record<string, unknown>;
  selection: Record<string, unknown>; selected: string[]; calls: string[]; warnings: string[];
} {
  const calls: string[] = [], selected = ["component", "line-one", "line-two"], warnings: string[] = [];
  const group = { id: "wire-group" }, index = new Map<string, unknown>([
    ["component", { id: "component", tagName: "Symbol" }],
    ["line-one", { id: "line-one", tagName: "NetGroupLine", parent: group }],
    ["line-two", { id: "line-two", tagName: "NetGroupLine", parent: group }],
  ]);
  const shapes: Record<string, unknown> = { actionRunner: { running: false }, idManager: { get: (id: string): unknown => index.get(id) } };
  const consistency = { state: "initialized" }, page: Record<string, unknown> = {
    uuid: "fixture-page", project_uuid: "fixture-project", tabId: "fixture-page@fixture-project",
    projectMgr: { uuid: "fixture-project" }, shapeManager: shapes, consistencyImpl: consistency,
    isSchSheetDoc: (): boolean => true, isSymbolDoc: (): boolean => false, isBlockSymbolInstancePage: false,
  };
  shapes["docManager"] = page; Reflect.set(consistency, "docManager", page);
  const nativeScope = { fe: { instance: { getActiveDoc: (): unknown => page } },
    C: { projectMgr: { selectMgr: { getTarget: (tabId: string): string[] => { assert.equal(tabId, context.document.tabId); return selected; } } } },
    Le: (): string | undefined => context.document.tabId,
    Sr: (model: { tagName: string }): boolean => model.tagName === "NetGroupLine" };
  const modern: unknown = runInNewContext(modernHandler, nativeScope); assert.equal(typeof modern, "function");
  const legacy: unknown = runInNewContext(`${legacyShim};()=>An("getSelected")`, {
    fi: (): string | undefined => context.document.tabId,
    fe: { getTabById: (): unknown => ({}), getUuidAndPathByTab: (): unknown => ({ path: "fixture-project" }) },
    // A ready modern frame has no old getSelected global; the exact shim catches it.
    Gn: (): unknown => ({ contentWindow: { document: { readyState: "complete" } } }),
    console: { warn: (message: string): void => { warnings.push(message); }, error: (): never => assert.fail("Unexpected legacy error.") },
  }); assert.equal(typeof legacy, "function");
  const bus = { rpcCall: function rpcCall(this: unknown, method: string): Promise<unknown> {
    assert.equal(this, bus); calls.push(method);
    const route = method === "extensionApi.SCH_SelectControl.getAllSelectedPrimitives_PrimitiveId" ? modern : legacy;
    assert.ok(typeof route === "function");
    return Promise.resolve(Reflect.apply(route, undefined, []));
  } };
  const selection: unknown = runInNewContext(publicWrappers, { _: { extensionApiMessageBus2: bus } });
  assert.ok(isRecord(selection));
  const scope: Record<string, unknown> = { TextEncoder, SCH: { docMemoryManager: { getActiveDoc: (): unknown => page } },
    UI: { tabBar: { getActiveTab: (): string | undefined => context.document.tabId } },
    eda: { sch_SelectControl: selection,
      dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve(context.project) },
      dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => Promise.resolve(context.document) } } };
  return { scope, page, shapes, selection, selected, calls, warnings };
}
type Fixture = ReturnType<typeof fixture>;
async function read(current: Fixture): Promise<Record<string, unknown>> {
  const code = wrapWithContextGuard(buildPublicSdkReadCode(request), context);
  const envelope: unknown = await runInNewContext(`(async()=>{${code}})()`, current.scope);
  return validatePublicSdkReadPayload(decodeExactReadEnvelope(envelope), request);
}
const neverLegacy = (): never => assert.fail("Deprecated public wrapper must never be accessed.");

void test("exact pinned legacy false-empty and modern parent-group producer prove explicit replacement without old invocation", async () => {
  const current = fixture(), legacy = current.selection["getSelectedPrimitives_PrimitiveId"];
  assert.ok(typeof legacy === "function");
  assert.deepEqual(structuredClone(await Reflect.apply(legacy, current.selection, [])), []);
  assert.deepEqual(current.warnings, ["Invalid editorCall cmd: getSelected"]);
  current.calls.length = 0;
  Object.defineProperty(current.selection, "getSelectedPrimitives_PrimitiveId", { get: neverLegacy });
  const payload = await read(current);
  assert.deepEqual(payload["value"], ["component", "wire-group"]);
  assert.deepEqual(current.calls, ["extensionApi.SCH_SelectControl.getAllSelectedPrimitives_PrimitiveId"]);
  assert.equal(payload["implementationKind"], "native-task-equivalent");
  assert.equal(payload["assurance"], "bounded-public-replacement-selection-observation-not-complete-ownership-source-or-persistence-proof");
  current.selected.length = 0; const empty = await read(current); assert.deepEqual(empty["value"], []);
});

void test("replacement preserves namespace receiver and ordered IDs without sorting or identity coercion", async () => {
  const current = fixture();
  current.selection["getAllSelectedPrimitives_PrimitiveId"] = function getAllSelectedPrimitives_PrimitiveId(this: unknown): Promise<string[]> {
    assert.equal(this, current.selection); return Promise.resolve(["z", "a"]);
  };
  Object.defineProperty(current.selection, "getSelectedPrimitives_PrimitiveId", { get: neverLegacy });
  const result = await read(current); assert.deepEqual(result["value"], ["z", "a"]);
});

const corruptions: Record<string, (current: Fixture) => void> = {
  "missing manager": (current) => { current.scope["SCH"] = {}; },
  "wrong page": (current) => { current.page["uuid"] = "other"; },
  "wrong project": (current) => { current.page["project_uuid"] = "other"; },
  "wrong tab": (current) => { current.page["tabId"] = "other"; },
  "symbol scene": (current) => { current.page["isSchSheetDoc"] = (): boolean => false; },
  "block instance": (current) => { current.page["isBlockSymbolInstancePage"] = true; },
  "wrong project owner": (current) => { current.page["projectMgr"] = { uuid: "other" }; },
  "wrong shape owner": (current) => { current.shapes["docManager"] = {}; },
  "uninitialized page": (current) => { const consistency = current.page["consistencyImpl"]; assert.ok(isRecord(consistency)); consistency["state"] = "loading"; },
  "busy action": (current) => { current.shapes["actionRunner"] = { running: true }; },
  "missing replacement": (current) => { current.selection["getAllSelectedPrimitives_PrimitiveId"] = undefined; },
};
for (const [label, corrupt] of Object.entries(corruptions)) {
  void test(`selection replacement refuses ${label} before public dispatch`, async () => {
    const current = fixture(); corrupt(current);
    await assert.rejects(read(current), /SCH_SELECTION_/u); assert.equal(current.calls.length, 0);
  });
}

void test("malformed, absent, sparse, accessor, duplicate and over-bound replacement results never become empty success", async () => {
  const accessor: unknown[] = []; Object.defineProperty(accessor, "0", { enumerable: true, get: (): never => assert.fail("Result accessor ran.") });
  const sparse: unknown[] = []; sparse.length = 1;
  const extra = ["id"]; Reflect.set(extra, "extra", true);
  for (const value of [undefined, null, false, {}, "id", [""], ["bad\n"], ["x".repeat(257)], ["id", "id"], [1], [undefined],
    Array.from({ length: 20_001 }, (_, index) => String(index)), sparse, accessor, extra, ["[Truncated]"]]) {
    const current = fixture(); current.selection["getAllSelectedPrimitives_PrimitiveId"] = (): Promise<unknown> => Promise.resolve(value);
    Object.defineProperty(current.selection, "getSelectedPrimitives_PrimitiveId", { get: neverLegacy });
    await assert.rejects(read(current));
  }
});

void test("selection boundaries and host validation preserve valid IDs without accepting absence evidence", async () => {
  const current = fixture();
  const ids = Array.from({ length: 20_000 }, (_, index) => `id-${String(index)}`);
  ids[0] = "x".repeat(256);
  current.selection["getAllSelectedPrimitives_PrimitiveId"] = (): Promise<string[]> => Promise.resolve(ids);
  const result = await read(current); assert.deepEqual(result["value"], ids);
  const payload = { ok: true, kind: "public-sdk-read", method: request.method, present: true, value: [], undefinedPaths: [] };
  assert.deepEqual(validatePublicSdkReadPayload(payload, request)["value"], []);
  for (const value of [null, [""], ["bad\u0000"], ["same", "same"], ["x".repeat(257)]]) {
    assert.throws(() => validatePublicSdkReadPayload({ ...payload, value }, request));
  }
  assert.throws(() => validatePublicSdkReadPayload({ ...payload, present: false }, request));
  assert.throws(() => validatePublicSdkReadPayload({ ...payload, undefinedPaths: ["/value"] }, request));
});

void test("awaited replacement rechecks exact page, project, manager, API, receiver, readiness and tab identities", async () => {
  const replacements: Record<string, (current: Fixture) => void> = {
    ...corruptions,
    "new same-identity page": (current) => { current.scope["SCH"] = { docMemoryManager: { getActiveDoc: (): unknown => ({ ...current.page }) } }; },
    "same-identity project owner": (current) => { current.page["projectMgr"] = { uuid: "fixture-project" }; },
    "new receiver": (current) => { const eda = current.scope["eda"]; assert.ok(isRecord(eda)); eda["sch_SelectControl"] = { ...current.selection }; },
    "new same-result method": (current) => { current.selection["getAllSelectedPrimitives_PrimitiveId"] = (): string[] => ["id"]; },
  };
  for (const corrupt of Object.values(replacements)) {
    const current = fixture();
    current.selection["getAllSelectedPrimitives_PrimitiveId"] = async (): Promise<string[]> => {
      await Promise.resolve(); corrupt(current); return ["id"];
    };
    await assert.rejects(read(current), /SCH_SELECTION_/u);
  }
});

void test("selection descriptor and catalog identify a narrowed equivalent, not successful legacy public execution", () => {
  const descriptor = publicSdkReadDescriptors().find((entry) => entry.path === request.method); assert.ok(descriptor);
  assert.deepEqual(descriptor.documentTypes, [1]); assert.equal(descriptor.parameterSupport, "narrowed");
  assert.equal(descriptor.implementation.kind, "native-task-equivalent");
  assert.equal(descriptor.implementation.source, "server/src/schematic-selection-read.ts");
  assert.equal(descriptor.implementation.test, "server/tests/schematic-selection-read.test.ts");
  assert.deepEqual(descriptor.limitations, [...SCHEMATIC_SELECTION_LIMITATIONS]);
  assert.equal(descriptor.limitations[0]?.includes(SCHEMATIC_SELECTION_REPLACEMENT), true);
  assert.equal(descriptor.liveValidation, "not-yet-validated");
  assert.deepEqual(validatePublicSdkReadRequest(request, 1), request);
  for (const type of [2, 3, 4, 15]) { assert.throws(() => validatePublicSdkReadRequest(request, type)); }
  for (const args of [{ all: true }, { code: "caller" }, { primitiveIds: ["id"] }]) { assert.throws(() => validatePublicSdkReadRequest({ ...request, arguments: args }, 1)); }
  const row = inventoryExtensionApiCoverage().find((entry) => entry.path === request.method); assert.ok(row);
  assert.equal(row.status, "implemented-native-equivalent"); assert.equal(row.completeDeclaredContractSupported, false);
  assert.equal(row.currentGenerationLiveValidation, "not-recorded"); assert.equal(row.omission, null);
});

void test("fixed selection diagnostics retain no private exception contents and reject forged suffixes", async () => {
  const guards = [...new Set([...buildSchematicSelectionReadExpression().matchAll(/bad\('([A-Z_]+)'\)/gu)].map((match) => { assert.ok(match[1] !== undefined); return match[1]; }))].toSorted();
  assert.deepEqual(guards, [...SCHEMATIC_SELECTION_GUARD_CODES].toSorted());
  for (const code of [...SCHEMATIC_SELECTION_GUARD_CODES.map((value) => `SCH_SELECTION_${value}`), "native-error"]) {
    const message = `Public SDK read could not produce a complete bounded observation; method=${request.method}|stage=call|code=${code}|getter=none`;
    assert.equal(nativeFailureCategory(message)?.startsWith("native-selection-replacement:"), true);
    for (const suffix of [" private secret", "\n", "|stack=/private"]) { assert.equal(nativeFailureCategory(message + suffix), null); }
  }
  const current = fixture(); current.selection["getAllSelectedPrimitives_PrimitiveId"] = (): never => {
    throw Object.defineProperty(new Error("private exception"), "message", { get: (): never => assert.fail("Private exception accessor ran.") });
  };
  await assert.rejects(async () => {
    try { await read(current); } catch (error) {
      assert.ok(error !== null && typeof error === "object");
      const message: unknown = Reflect.get(error, "message");
      extractToolPayload({ structuredContent: { ok: false, error: message } });
    }
  }, { message: `The upstream EasyEDA tool reported failure [native-selection-replacement:${request.method}:EXCEPTION].` });
});

void test("real coordinator double-samples replacement and refuses context, profile, quarantine and selection drift", async () => {
  for (const failure of ["none", "context", "profile", "quarantine", "selection"]) {
    const current = fixture(); let calls = 0, contexts = 0, gates = 0, profiles = 0;
    Object.defineProperty(current.selection, "getSelectedPrimitives_PrimitiveId", { get: neverLegacy });
    class FixtureEngine extends EasyedaControlEngine {
      // oxlint-disable-next-line eslint/class-methods-use-this -- The production runtime-admission seam must be exercised between samples.
      protected override assertPublicSdkImplementation(): Promise<void> {
        profiles += 1; return failure === "profile" && profiles === 2 ? Promise.reject(new Error("fixture profile drift")) : Promise.resolve();
      }
    }
    const engine = new FixtureEngine({ async callTool(name, args): Promise<unknown> {
      assert.equal(name, "easyeda_execute"); assert.ok(typeof args?.["code"] === "string"); calls += 1;
      if (failure === "selection" && calls === 2) { current.selected.length = 0; }
      const result: unknown = await runInNewContext(`(async()=>{${args["code"]}})()`, current.scope);
      return { structuredContent: { ok: true, result } };
    } });
    engine.assertBridgeDispatchAllowed = (): Promise<true> => { gates += 1; return failure === "quarantine" && gates === 3 ? Promise.reject(new Error("fixture quarantine")) : Promise.resolve(true); };
    engine.assertContext = (expected): Promise<ContextProbePayload> => {
      contexts += 1; return failure === "context" && contexts === 3 ? Promise.reject(new Error("fixture context drift")) : Promise.resolve({ ...structuredClone(expected), document: { ...structuredClone(expected.document), tabId: "fixture-page@fixture-project" } });
    };
    if (failure === "none") {
      const result = await engine.publicSdkRead(request, context);
      assert.equal(result["authority"], "public-replacement-selection-observation-not-complete-ownership-source-or-persistence-proof");
      assert.equal(calls, 2); assert.equal(current.calls.length, 2);
    } else {
      await assert.rejects(engine.publicSdkRead(request, context), /fixture|changed between consecutive samples/u);
      assert.equal(calls, ["profile", "selection"].includes(failure) ? 2 : 1);
    }
  }
});
