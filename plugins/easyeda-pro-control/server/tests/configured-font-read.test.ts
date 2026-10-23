import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

import { CONFIGURED_FONT_GUARD_CODES, CONFIGURED_FONT_LIMITATIONS, CONFIGURED_FONT_MAX_CHARACTERS, CONFIGURED_FONT_MAX_ROWS, CONFIGURED_FONT_MAX_TITLE, CONFIGURED_FONT_METHOD, buildConfiguredFontReadExpression } from "../src/configured-font-read.ts";
import { EasyedaControlEngine } from "../src/engine.ts";
import type { ContextProbePayload, ExpectedContext } from "../src/engine.ts";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import { inventoryExtensionApiCoverage } from "../src/extension-api-coverage.ts";
import { buildPublicSdkReadCode, publicSdkReadDescriptors, publicSdkReadRequestSchema, validatePublicSdkReadPayload, validatePublicSdkReadRequest } from "../src/public-sdk-read.ts";
import { wrapWithContextGuard } from "../src/runtime-scripts.ts";
import { extractToolPayload } from "../src/core.ts";
// oxlint-disable-next-line import/max-dependencies -- Exercise the maintained diagnostic classifier and core error pipeline, not a copied refusal map.
import { nativeFailureCategory } from "../src/native-diagnostics.ts";

const context: ExpectedContext = { project: { uuid: "fixture-project", path: "/tmp/configured-font-fixture.eprj2" },
  document: { uuid: "fixture-document", documentType: 3, tabId: "fixture-document@fixture-project" } };
const request = { method: CONFIGURED_FONT_METHOD, arguments: {} };
const forbidden = (): never => assert.fail("Public fallback, unrelated preferences, persistence or private data must not be accessed.");

// Exact installed API59236967 @1488634 and UI12414b9d @17039256 bodies.
// These prove both false-empty fallbacks, without invoking them in the adapter.
const oldPublicGetter = `async()=>{try{return(await _.extensionApiMessageBus2.rpcCall("extensionApi.SYS_FontManager.getFontsList")).map(i=>i.title)}catch{return[]}}`;
const oldNativeGetter = `()=>{var i,o,n,r;let e=(r=(n=(o=(i=w.profileSetting)==null?void 0:i.commSystemSetting)==null?void 0:o.COMM_TYPEFACE)==null?void 0:n.commonlyList)==null?void 0:r.value;return e||[]}`;

function fixture(titles: string[] = ["default", "Arial", "Arial", "", "  Case  ", "宋体"]): {
  scope: Record<string, unknown>; ui: Record<string, unknown>; host: Record<string, unknown>;
  tabs: Record<string, unknown>; tab: Record<string, unknown>; tabData: Record<string, unknown>;
  project: Record<string, unknown>; profile: Record<string, unknown>; settings: Record<string, unknown>;
  typeface: Record<string, unknown>; list: Record<string, unknown>; rows: Record<string, unknown>[];
} {
  const rows = titles.map((title, index) => ({ title, id: String(index), isAllowDelete: false }));
  const list = { value: rows }, typeface = { commonlyList: list };
  const settings = { COMM_TYPEFACE: typeface };
  const profile = { commSystemSetting: settings };
  const project = { projectId: "fixture-project" };
  const host = { currentProject: project, profileSetting: profile };
  const tabData = { doctype: 3, pid: "fixture-project" };
  const tab = { tabId: context.document.tabId, data: tabData };
  const tabs: Record<string, unknown> = {
    getActiveTab(this: unknown): string | undefined { assert.equal(this, tabs); return context.document.tabId; },
    getActiveTabData(this: unknown): unknown { assert.equal(this, tabs); return tab; },
  };
  const ui = { gVars: host, tabBar: tabs };
  for (const [owner, fields] of [[host, ["loginedUserInfo", "apis", "savePreference", "messageBus"]], [profile, ["credentials", "pcbCommandTab"]],
    [settings, ["PROPERTY", "SAVE"]], [list, ["disabled"]], [ui, ["savePreference", "setCacheObj"]]] as const) {
    for (const key of fields) { Object.defineProperty(owner, key, { get: forbidden }); }
  }
  for (const row of rows) { Object.defineProperty(row, "private", { get: forbidden }); }
  const fonts = {};
  for (const key of ["getFontsList", "addFont", "deleteFont"]) { Object.defineProperty(fonts, key, { get: forbidden }); }
  const scope = { TextEncoder, UI: ui, gVars: host,
    eda: { sys_FontManager: fonts,
      dmt_Project: { getCurrentProjectInfo: (): Promise<unknown> => Promise.resolve(context.project) },
      dmt_SelectControl: { getCurrentDocumentInfo: (): Promise<unknown> => Promise.resolve(context.document) } } };
  return { scope, ui, host, tabs, tab, tabData, project, profile, settings, typeface, list, rows };
}
type Fixture = ReturnType<typeof fixture>;
async function read(current: Fixture): Promise<Record<string, unknown>> {
  const code = wrapWithContextGuard(buildPublicSdkReadCode(request), context);
  const envelope: unknown = await runInNewContext(`(async()=>{${code}})()`, current.scope, { timeout: 1000 });
  return validatePublicSdkReadPayload(decodeExactReadEnvelope(envelope), request);
}

void test("configured-font equivalent distinguishes exact installed false-empty fallbacks from a real empty configuration", async () => {
  const oldError: unknown = await runInNewContext(`(${oldPublicGetter})()`, { _: { extensionApiMessageBus2: { rpcCall: (): never => { throw new Error("private failure"); } } } });
  assert.deepEqual(structuredClone(oldError), []);
  const oldMissing: unknown = runInNewContext(`(${oldNativeGetter})()`, { w: {} });
  assert.deepEqual(structuredClone(oldMissing), []);
  const current = fixture([]), result = await read(current); assert.deepEqual(result["value"], []);
  delete current.host["profileSetting"];
  await assert.rejects(read(current), /CONFIGURED_FONTS_CONFIGURATION/u);
});

void test("configured-font reader returns only titles with exact order, duplicates, empties, whitespace, case and Unicode", async () => {
  const titles = ["default", "Arial", "Arial", "", "  Case  ", "case", "宋体", "line\nname", "__proto__"];
  const current = fixture(titles), result = await read(current);
  assert.deepEqual(result["value"], titles); assert.deepEqual(result["undefinedPaths"], []);
  assert.equal(result["implementationKind"], "native-task-equivalent");
  assert.equal(result["assurance"], "bounded-configured-font-titles-not-installed-font-or-rendering-proof");
  assert.equal(JSON.stringify(result["value"]).includes("isAllowDelete"), false);
  assert.equal(JSON.stringify(result["value"]).includes("private"), false);
  assert.deepEqual(current.rows.map((row) => row["title"]), titles);
});

const corruptions: Record<string, (current: Fixture) => void> = {
  "missing UI": (current) => { delete current.scope["UI"]; },
  "missing gVars": (current) => { delete current.scope["gVars"]; },
  "foreign top window": (current) => { current.scope["top"] = { UI: current.ui, gVars: current.host }; },
  "ambiguous UI host": (current) => { current.ui["gVars"] = {}; },
  "missing tab bar": (current) => { delete current.ui["tabBar"]; },
  "missing active reader": (current) => { delete current.tabs["getActiveTab"]; },
  "missing tab reader": (current) => { delete current.tabs["getActiveTabData"]; },
  "foreign project": (current) => { current.project["projectId"] = "foreign"; },
  "foreign active tab": (current) => { current.tabs["getActiveTab"] = (): string => "foreign"; },
  "foreign tab identity": (current) => { current.tab["tabId"] = "foreign"; },
  "foreign document type": (current) => { current.tabData["doctype"] = 15; },
  "missing profile": (current) => { delete current.host["profileSetting"]; },
  "missing settings": (current) => { delete current.profile["commSystemSetting"]; },
  "missing typeface": (current) => { delete current.settings["COMM_TYPEFACE"]; },
  "missing list": (current) => { delete current.typeface["commonlyList"]; },
  "missing rows": (current) => { delete current.list["value"]; },
};
for (const [label, corrupt] of Object.entries(corruptions)) {
  void test(`configured-font reader refuses ${label} without public fallback`, async () => {
    const current = fixture(); corrupt(current); await assert.rejects(read(current), /CONFIGURED_FONTS_/u);
  });
}

void test("configured-font reader refuses accessors on every retained path without evaluating them", async () => {
  const paths: ((current: Fixture) => [Record<string, unknown>, string])[] = [
    (current) => [current.scope, "UI"], (current) => [current.scope, "gVars"], (current) => [current.ui, "gVars"],
    (current) => [current.ui, "tabBar"], (current) => [current.tabs, "getActiveTab"], (current) => [current.tabs, "getActiveTabData"],
    (current) => [current.host, "currentProject"], (current) => [current.project, "projectId"], (current) => [current.tab, "data"],
    (current) => [current.tab, "tabId"], (current) => [current.tabData, "doctype"], (current) => [current.host, "profileSetting"],
    (current) => [current.profile, "commSystemSetting"], (current) => [current.settings, "COMM_TYPEFACE"],
    (current) => [current.typeface, "commonlyList"], (current) => [current.list, "value"],
    (current) => { const row = current.rows[0]; assert.ok(row); return [row, "title"]; },
  ];
  for (const path of paths) {
    const current = fixture(), [owner, key] = path(current); let accesses = 0;
    Object.defineProperty(owner, key, { get: (): never => { accesses += 1; return forbidden(); } });
    await assert.rejects(read(current), /CONFIGURED_FONTS_/u); assert.equal(accesses, 0, key);
  }
});

void test("configured-font reader refuses inherited, non-array, sparse, accessor, extra-property and malformed row lists", async () => {
  const sparse: unknown[] = []; sparse.length = 1;
  const accessor: unknown[] = []; Object.defineProperty(accessor, "0", { enumerable: true, get: forbidden });
  const hidden = [{ title: "Arial" }]; Object.defineProperty(hidden, "0", { enumerable: false });
  const extra = [{ title: "Arial" }]; Reflect.set(extra, "extra", true);
  const symbol = [{ title: "Arial" }]; Reflect.set(symbol, Symbol("extra"), true);
  const inherited: unknown = Object.create({ title: "Arial" });
  for (const value of [null, undefined, false, "Arial", {}, sparse, accessor, hidden, extra, symbol, [null], [1], ["Arial"], [[]], [inherited], [{ title: undefined }], [{ title: 1 }]]) {
    const current = fixture(); current.list["value"] = value;
    await assert.rejects(read(current), /CONFIGURED_FONTS_/u);
  }
  const current = fixture(); current.settings["COMM_TYPEFACE"] = Object.create({ commonlyList: current.list });
  await assert.rejects(read(current), /CONFIGURED_FONTS_CONFIGURATION/u);
});

void test("configured-font reader and host validate exact per-title, row and aggregate bounds", async () => {
  for (const titles of [Array.from({ length: CONFIGURED_FONT_MAX_ROWS }, () => ""), ["x".repeat(CONFIGURED_FONT_MAX_TITLE)],
    ["😀".repeat(CONFIGURED_FONT_MAX_TITLE / 2)],
    Array.from({ length: CONFIGURED_FONT_MAX_CHARACTERS / CONFIGURED_FONT_MAX_TITLE }, () => "x".repeat(CONFIGURED_FONT_MAX_TITLE))]) {
    const result = await read(fixture(titles)); assert.deepEqual(result["value"], titles);
  }
  const payload = { ok: true, kind: "public-sdk-read", method: request.method, present: true, value: [], undefinedPaths: [] };
  for (const titles of [Array.from({ length: CONFIGURED_FONT_MAX_ROWS + 1 }, () => ""), ["x".repeat(CONFIGURED_FONT_MAX_TITLE + 1)],
    [`${"😀".repeat(CONFIGURED_FONT_MAX_TITLE / 2)}x`],
    [...Array.from({ length: CONFIGURED_FONT_MAX_CHARACTERS / CONFIGURED_FONT_MAX_TITLE }, () => "x".repeat(CONFIGURED_FONT_MAX_TITLE)), "x"]]) {
    await assert.rejects(read(fixture(titles)), /CONFIGURED_FONTS_/u);
    assert.throws(() => validatePublicSdkReadPayload({ ...payload, value: titles }, request));
  }
  for (const value of [null, [undefined], [1], ["[Truncated]"], ["[Circular]"], ["[Function secret]"]]) {
    assert.throws(() => validatePublicSdkReadPayload({ ...payload, value }, request));
  }
  assert.throws(() => validatePublicSdkReadPayload({ ...payload, present: false, value: null, undefinedPaths: ["/value"] }, request));
  assert.throws(() => validatePublicSdkReadPayload({ ...payload, value: ["Arial"], undefinedPaths: ["/value/0"] }, request));
});

void test("configured-font synchronous observations reject owner, receiver, path, row, length and title drift", async () => {
  const changes: Record<string, (current: Fixture) => void> = {
    "UI owner": (current) => { current.scope["UI"] = { ...current.ui }; },
    "host owner": (current) => { current.scope["gVars"] = { ...current.host }; },
    "project receiver": (current) => { current.host["currentProject"] = { ...current.project }; },
    "tab receiver": (current) => { current.tabs["getActiveTabData"] = (): unknown => ({ ...current.tab }); },
    "tab data": (current) => { current.tab["data"] = { ...current.tabData }; },
    "profile owner": (current) => { current.host["profileSetting"] = { ...current.profile }; },
    "settings owner": (current) => { current.profile["commSystemSetting"] = { ...current.settings }; },
    "typeface owner": (current) => { current.settings["COMM_TYPEFACE"] = { ...current.typeface }; },
    "list owner": (current) => { current.typeface["commonlyList"] = { ...current.list }; },
    "array owner": (current) => { current.list["value"] = [...current.rows]; },
    "same-title row": (current) => { const row = current.rows[0]; assert.ok(row); current.rows[0] = { ...row }; },
    "title": (current) => { const row = current.rows[0]; assert.ok(row); row["title"] = "changed"; },
    "row order": (current) => { current.rows.reverse(); },
    "row count": (current) => { current.rows.push({ title: "extra" }); },
  };
  for (const change of Object.values(changes)) {
    const current = fixture(); let checks = 0;
    current.tabs["getActiveTab"] = (): string | undefined => {
      checks += 1; if (checks === 2) { change(current); } return context.document.tabId;
    };
    await assert.rejects(read(current), /CONFIGURED_FONTS_/u);
  }
});

void test("configured-font descriptor and coverage expose only the bounded native read with strict empty arguments", () => {
  for (const documentType of [1, 2, 3, 4]) { assert.deepEqual(validatePublicSdkReadRequest(request, documentType), request); }
  for (const documentType of [0, 5, 15, 29]) { assert.throws(() => validatePublicSdkReadRequest(request, documentType)); }
  for (const args of [{ path: "profileSetting" }, { all: true }, { fontName: "Arial" }, { callback: "code" }, [], null]) {
    assert.equal(publicSdkReadRequestSchema.safeParse({ ...request, arguments: args }).success, false);
  }
  for (const method of ["addFont", "deleteFont"]) {
    assert.equal(publicSdkReadRequestSchema.safeParse({ ...request, method: `eda.sys_FontManager.${method}` }).success, false);
  }
  const descriptor = publicSdkReadDescriptors().find((row) => row.path === request.method); assert.ok(descriptor);
  assert.equal(descriptor.implementation.kind, "native-task-equivalent"); assert.equal(descriptor.result.optional, false);
  assert.equal(descriptor.implementation.source, "server/src/configured-font-read.ts");
  assert.equal(descriptor.implementation.test, "server/tests/configured-font-read.test.ts");
  assert.deepEqual(descriptor.limitations, [...CONFIGURED_FONT_LIMITATIONS]);
  assert.equal(descriptor.liveValidation, "not-yet-validated"); assert.equal(descriptor.parameterSupport, "narrowed");
  const coverage = inventoryExtensionApiCoverage().find((row) => row.path === request.method); assert.ok(coverage);
  assert.equal(coverage.status, "implemented-native-equivalent"); assert.equal(coverage.omission, null);
  assert.equal(coverage.currentGenerationLiveValidation, "not-recorded"); assert.equal(coverage.completeDeclaredContractSupported, false);
  assert.deepEqual(coverage.routes[0]?.tests, ["configured-font-read.test.ts"]);
  for (const method of ["addFont", "deleteFont"]) {
    const row = inventoryExtensionApiCoverage().find((entry) => entry.path === `eda.sys_FontManager.${method}`); assert.ok(row);
    assert.equal(row.status, "omitted"); assert.equal(row.omission?.code, "extension-or-global-settings-state");
  }
});

void test("configured-font fixed diagnostics suppress native secrets and reject forged suffixes", async () => {
  const source = buildConfiguredFontReadExpression();
  const emitted = [...new Set([...source.matchAll(/bad\('([A-Z_]+)'\)/gu), ...source.matchAll(/data\([^\n]*?'([A-Z_]+)'\)/gu)]
    .map((match) => { assert.ok(match[1] !== undefined); return match[1]; }))].toSorted();
  assert.deepEqual(emitted, [...CONFIGURED_FONT_GUARD_CODES].toSorted());
  for (const code of [...CONFIGURED_FONT_GUARD_CODES.map((value) => `CONFIGURED_FONTS_${value}`), "native-error"]) {
    const message = `Public SDK read could not produce a complete bounded observation; method=${request.method}|stage=call|code=${code}|getter=none`;
    assert.equal(nativeFailureCategory(message)?.startsWith("native-configured-fonts:"), true);
    for (const suffix of [" private", "\n", "|stack=/private"]) { assert.equal(nativeFailureCategory(message + suffix), null); }
  }
  const current = fixture(); current.tabs["getActiveTab"] = (): never => {
    throw Object.defineProperty(new Error("private error"), "message", { get: forbidden });
  };
  await assert.rejects(async () => {
    try { await read(current); } catch (error) {
      assert.ok(error !== null && typeof error === "object");
      const message: unknown = Reflect.get(error, "message");
      extractToolPayload({ structuredContent: { ok: false, error: message } });
    }
  }, { message: `The upstream EasyEDA tool reported failure [native-configured-fonts:${request.method}:EXCEPTION].` });
});

void test("real configured-font coordinator double-samples and rejects context, runtime, transport, quarantine and state drift without retry", async () => {
  for (const fault of ["none", "context", "initial-profile", "final-profile", "quarantine", "transport", "native", "state"]) {
    const current = fixture(); let calls = 0, contexts = 0, gates = 0, profiles = 0;
    class FixtureEngine extends EasyedaControlEngine {
      // oxlint-disable-next-line eslint/class-methods-use-this -- Synthetic admission seam retains the real coordinator and generated guarded reader.
      protected override assertPublicSdkImplementation(): Promise<void> {
        profiles += 1;
        return fault === "initial-profile" || fault === "final-profile" && profiles === 2 ? Promise.reject(new Error("fixture profile drift")) : Promise.resolve();
      }
    }
    const engine = new FixtureEngine({ async callTool(name, args): Promise<unknown> {
      calls += 1; assert.equal(name, "easyeda_execute"); assert.ok(typeof args?.["code"] === "string");
      if (fault === "transport") { throw new Error("fixture transport failure"); }
      if (fault === "native") { delete current.list["value"]; }
      if (fault === "state" && calls === 2) { current.list["value"] = []; }
      const result: unknown = await runInNewContext(`(async()=>{${args["code"]}})()`, current.scope, { timeout: 1000 });
      return { structuredContent: { ok: true, result } };
    } });
    engine.assertBridgeDispatchAllowed = (): Promise<true> => {
      gates += 1; return fault === "quarantine" && gates === 3 ? Promise.reject(new Error("fixture quarantine")) : Promise.resolve(true);
    };
    engine.assertContext = (expected): Promise<ContextProbePayload> => {
      contexts += 1; return fault === "context" && contexts === 3 ? Promise.reject(new Error("fixture context drift"))
        : Promise.resolve({ ...structuredClone(expected), document: { ...structuredClone(expected.document), tabId: "fixture-document@fixture-project" } });
    };
    if (fault === "none") {
      const result = await engine.publicSdkRead(request, context);
      assert.deepEqual(result["value"], current.rows.map((row) => row["title"]));
      assert.equal(result["authority"], "configured-font-title-observation-not-whole-preferences-or-installed-font-proof");
      assert.deepEqual({ calls, contexts, profiles, gates }, { calls: 2, contexts: 5, profiles: 2, gates: 3 });
    } else {
      await assert.rejects(engine.publicSdkRead(request, context), /fixture|CONFIGURED_FONTS_|changed between consecutive samples/u);
      let expectedCalls = 1;
      if (fault === "initial-profile") { expectedCalls = 0; }
      else if (["final-profile", "state"].includes(fault)) { expectedCalls = 2; }
      assert.equal(calls, expectedCalls);
    }
  }
});
