import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { SYMBOL_WITNESS_PROFILE, buildSymbolWitnessReadExpression, validateSymbolWitnessReadResult } from "../src/symbol-predispatch-witness.ts";

type Bag = Record<string, unknown>;
const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), ownerUuid: "c".repeat(32), targetUuid: "f".repeat(32), activeUuid: "1".repeat(32), createdAtLiteral: "2026-10-12 01:00:00" };
const actorUuid = "c".repeat(32), client = "d".repeat(16), time = 1_800_000_000_000;
interface Call { args: unknown[]; receiver: unknown; kind: "project" | "clock" }
interface Fixture {
  host: Bag; project: Bag; actor: Bag; cookies: Bag; ui: Bag; tabs: Bag; tab: Bag; sandbox: Bag; calls: Call[];
  clears: number; onCall?: (call: Call, index: number) => unknown; fireTimeout: () => void; run: () => Promise<unknown>;
}
function fixture(): Fixture {
  // oxlint-disable-next-line eslint/prefer-const -- RPC callbacks require the assembled circular fixture.
  let state: Fixture;
  const actor: Bag = { uuid: actorUuid }, calls: Call[] = [], cookies: Bag = { userInfo: actor };
  const project: Bag = { projectId: target.projectUuid, branchUuid: target.branchUuid, isV2Format: false };
  const tab: Bag = { tabId: `${target.activeUuid}@${target.projectUuid}`, data: { doctype: 3, pid: target.projectUuid, owner: target.ownerUuid }, isUnSaved: false };
  const tabs: Bag = { isOpenProjectDoc: true, isOpenOtherDoc: true, getActiveTab(): string { return `${target.activeUuid}@${target.projectUuid}`; }, getFilterTabs(): Bag[] { return [tab]; }, hasTabUnSaved(): boolean { return false; }, isTabUnSaved(): boolean { return false; } };
  function fallback(call: Call): unknown {
    if (call.kind === "clock") { return time + calls.length; }
    if (call.args[0] === "/PrjDB/project/getClient") { return { message: client }; }
    if (call.args[0] === "/PrjDB/project/getMaxTicket") { return { message: 42 }; }
    assert.equal(call.args[0], "/PrjDB/project/getData");
    return { message: { uuid: target.projectUuid, currentBranch: target.branchUuid, isV2Format: false, owner: { uuid: target.ownerUuid } } };
  }
  function bus(kind: "project" | "clock"): Bag {
    return { rpcCall(...args: unknown[]): Promise<unknown> {
      const call: Call = { args, receiver: this, kind }; calls.push(call);
      return Promise.resolve(state.onCall?.(call, calls.length) ?? fallback(call));
    } };
  }
  const host: Bag = { currentProject: project, sessionStorageTabs: new Set(), globalVariableCookieData: cookies,
    messageBus: bus("project"), concurrentBus: bus("clock"), urlCmd: null, isHistoryMode: false };
  const ui: Bag = { tabBar: tabs, gVars: host, concurrentDesign: { _isConcurrentStrictMode: false, getIframeDisableStatusPanelPcb(): Bag { return { disable: false }; } } };
  const sandbox: Bag = { UI: ui, gVars: host, Date, Object, Set, Reflect, Array,
    location: { href: "https://client/editor?cll=warn#", origin: "https://client" },
    document: { nodeType: 9, URL: "https://client/editor?cll=warn#" },
    PRO_EDITOR_MODE: "CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM",
    setTimeout(callback: () => void, delay: number): number { assert.equal(delay, 10_000); state.fireTimeout = callback; return 7; },
    clearTimeout(id: unknown): void { assert.equal(id, 7); state.clears += 1; },
  };
  state = { host, project, actor, cookies, ui, tabs, tab, sandbox, calls, clears: 0,
    fireTimeout(): never { throw new Error("no timer"); },
    async run(): Promise<unknown> {
      const result: unknown = runInNewContext(`globalThis.top=globalThis;globalThis.window=globalThis;globalThis.document.defaultView=globalThis;${buildSymbolWitnessReadExpression(target)}`, sandbox, { timeout: 1000 });
      return await result;
    },
  };
  return state;
}
function plain(input: unknown): unknown { return structuredClone(input); }
void test("fixed eight readonly RPCs preserve receivers; observation does not grant any authority", async () => {
  const state = fixture(), value = validateSymbolWitnessReadResult(plain(await state.run()), target);
  assert.equal(value["profile"], SYMBOL_WITNESS_PROFILE); assert.equal(value["workerClient"], client);
  assert.equal(value["workerMaxTicket"], 42); assert.equal(value["cachedActorUuid"], actorUuid);
  assert.equal(value["workerTimeBeforeMs"], time + 4); assert.equal(value["workerTimeAfterMs"], time + 8);
  assert.equal(value["rendererParsedCreatedAtMs"], new Date(target.createdAtLiteral).getTime());
  assert.equal(value["rendererTimezoneOffsetMinutes"], new Date().getTimezoneOffset());
  assert.equal(Object.isFrozen(value), true); assert.equal(state.clears, 1);
  const topics = ["/PrjDB/project/getData", "/PrjDB/project/getClient", "/PrjDB/project/getMaxTicket", "/pro-mgr/serverTime/now"];
  for (const [index, call] of state.calls.entries()) {
    assert.equal(call.receiver, state.host[call.kind === "project" ? "messageBus" : "concurrentBus"]);
    assert.deepEqual(plain(call.args), index % 4 === 3 ? [topics[index % 4]] : [topics[index % 4], [target.projectUuid]]);
  }
  assert.equal(state.calls.length, 8);
  for (const field of ["appActorVerified", "appClockVerified", "workerFreshOfflineClockVerified", "producerBindingVerified", "executionAuthorized"]) {
    assert.equal(value[field], false);
    assert.throws(() => validateSymbolWitnessReadResult({ ...value, [field]: true }, target), /SYMBOL_WITNESS_RESULT/u);
  }
});
void test("both admitted project identity lengths compile but branch stays32", () => {
  buildSymbolWitnessReadExpression({ ...target, projectUuid: "a".repeat(32) });
  assert.throws(() => buildSymbolWitnessReadExpression({ ...target, branchUuid: "b".repeat(64) }), /SYMBOL_WITNESS_INPUT/u);
});
for (const field of ["projectUuid", "branchUuid", "ownerUuid", "activeUuid", "targetUuid", "createdAtLiteral"]) {
  for (const bad of ["", "x';throw Error('code');", "a\n", "x".repeat(200), null]) {
    void test(`input refuses ${field} ${JSON.stringify(bad)}`, () => {
      assert.throws(() => buildSymbolWitnessReadExpression({ ...target, [field]: bad }), /SYMBOL_WITNESS_INPUT/u);
    });
  }
}
void test("scope accessor never executes", () => {
  let count = 0;
  const input = { ...target };
  Object.defineProperty(input, "projectUuid", { get(): never { count += 1; throw new Error("unexpected"); } });
  assert.throws(() => buildSymbolWitnessReadExpression(input), /SYMBOL_WITNESS_INPUT/u); assert.equal(count, 0);
});
for (const term of ["fetch(", ".publish(", ".rpcService(", ".open(", ".getUser(", "setMaxTicket", "getUploadedData", "uploadLocal", "saveCanvas", "closeProject", ".evaluate(", "eval("]) {
  void test(`fixed code excludes ${term}`, () => { assert.equal(buildSymbolWitnessReadExpression(target).includes(term), false); });
}
const mutations: [string, (state: Fixture) => void][] = [
  ["UI identity", (s) => { s.sandbox["UI"] = {}; }],
  ["host identity", (s) => { s.sandbox["gVars"] = {}; }],
  ["project identity", (s) => { s.host["currentProject"] = { ...s.project }; }],
  ["project ID", (s) => { s.project["projectId"] = "e".repeat(64); }],
  ["branch ID", (s) => { s.project["branchUuid"] = "e".repeat(32); }],
  ["read-only v2", (s) => { s.project["isV2Format"] = true; }],
  ["tabs identity", (s) => { s.ui["tabBar"] = {}; }],
  ["dirty design tab", (s) => { s.tabs["getFilterTabs"] = (): Bag[] => [s.tab, { tabId: "design" }]; }],
  ["wrong active", (s) => { s.tabs["getActiveTab"] = (): string => "design"; }],
  ["tab owner", (s) => { s.tab["parentProjectUuid"] = "e".repeat(64); }],
  ["tab type", (s) => { s.tab["data"] = { doctype: 3 }; }],
  ["pending startup", (s) => { s.host["sessionStorageTabs"] = new Set(["queued"]); }],
  ["startup command", (s) => { s.host["urlCmd"] = "open"; }],
  ["history mode", (s) => { s.host["isHistoryMode"] = true; }],
  ["project bus", (s) => { s.host["messageBus"] = {}; }],
  ["clock bus", (s) => { s.host["concurrentBus"] = {}; }],
  ["actor cache", (s) => { s.host["globalVariableCookieData"] = { ...s.cookies }; }],
  ["actor object", (s) => { s.cookies["userInfo"] = { ...s.actor }; }],
  ["actor value", (s) => { s.actor["uuid"] = "e".repeat(32); }],
  ["clock object", (s) => { s.sandbox["Date"] = {}; }],
  ["dirty flags", (s) => { s.tabs["hasTabUnSaved"] = (): boolean => true; }],
  ["peer dirty", (s) => { s.tab["isUnSaved"] = true; }],
  ["permission object", (s) => { s.ui["concurrentDesign"] = {}; }],
  ["mode", (s) => { s.sandbox["PRO_EDITOR_MODE"] = "CLIENT-ONLINE-EASYEDA-PCB-SCH-PANEL-SIM"; }],
  ["location", (s) => { s.sandbox["location"] = {}; }],
  ["document", (s) => { s.sandbox["document"] = {}; }],
  ["timeout", (s) => { s.fireTimeout(); }],
];
for (const [label, mutate] of mutations) {
  for (const at of [1, 4, 8]) {
    void test(`stops after awaited drift ${label} at ${at}`, async () => {
      const state = fixture(); state.onCall = (_, index): void => { if (index === at) { mutate(state); } };
      await assert.rejects(state.run(), /SYMBOL_WITNESS_READ_REFUSED:/u);
      assert.equal(state.calls.length, at); assert.equal(state.clears, 1);
    });
  }
}
for (const at of [1, 2, 3, 4, 5, 6, 7, 8]) {
  void test(`no later RPC after timeout then late response at ${at}`, async () => {
    const pending = Promise.withResolvers<unknown>(), state = fixture(); let call: Call | undefined;
    state.onCall = (entry, index): unknown => { if (index === at) { call = entry; return pending.promise; } return undefined; };
    const running = state.run();
    for (let i = 0; i < 60; i += 1) { await Promise.resolve(); }
    assert.equal(state.calls.length, at); state.fireTimeout();
    await assert.rejects(running, /SYMBOL_WITNESS_READ_REFUSED:TIMEOUT/u);
    assert.ok(call !== undefined); pending.resolve({});
    for (let i = 0; i < 20; i += 1) { await Promise.resolve(); }
    assert.equal(state.calls.length, at); assert.equal(state.clears, 1);
  });
}
for (const [at, value] of [
  [1, { message: { uuid: target.projectUuid, currentBranch: "e".repeat(32), isV2Format: false } }],
  [2, { message: "UPPERCASECLIENT00" }], [2, { message: "d".repeat(32) }],
  [3, { message: -1 }], [3, { message: Number.MAX_SAFE_INTEGER }], [3, { message: 1.5 }],
  [4, { message: time }], [4, -1], [4, Number.NaN],
  [5, { message: { uuid: "e".repeat(64), currentBranch: target.branchUuid, isV2Format: false } }],
  [6, { message: "e".repeat(16) }], [7, { message: 43 }], [8, time - 1], [8, time + 10_005],
] as const) {
  void test(`invalid native response at ${at} ${JSON.stringify(value)}`, async () => {
    const state = fixture(); state.onCall = (_, index): unknown => index === at ? value : undefined;
    await assert.rejects(state.run(), /SYMBOL_WITNESS_READ_REFUSED:/u); assert.equal(state.calls.length, at);
  });
}
void test("native rejection does not leak details or retry", async () => {
  const state = fixture(); state.onCall = (): never => { throw new Error("private actor and project details"); };
  await assert.rejects(state.run(), { message: "SYMBOL_WITNESS_READ_REFUSED:PROJECT" }); assert.equal(state.calls.length, 1);
});
void test("method accessor refuses before calling it", async () => {
  const state = fixture(); let calls = 0; const bus = state.host["messageBus"];
  assert.ok(typeof bus === "object" && bus !== null);
  Object.defineProperty(bus, "rpcCall", { get(): never { calls += 1; throw new Error("unexpected"); } });
  await assert.rejects(state.run(), /SYMBOL_WITNESS_READ_REFUSED:HOST/u);
  assert.equal(calls, 0); assert.equal(state.calls.length, 0);
});
void test("result extra authority, getters and semantic corruption refuse", async () => {
  const state = fixture(), value = validateSymbolWitnessReadResult(plain(await state.run()), target);
  assert.throws(() => validateSymbolWitnessReadResult({ ...value, completed: true }, target), /SYMBOL_WITNESS_INPUT/u);
  for (const [field, replacement] of [["workerClient", "wrong"], ["workerMaxTicket", -1], ["rendererParsedCreatedAtMs", "wrong"],
    ["rendererTimezoneOffsetMinutes", 1000], ["workerTimeAfterMs", 0], ["rendererClockAfterMs", 0], ["profile", "other"], ["projectUuid", "other"]] as const) {
    assert.throws(() => validateSymbolWitnessReadResult({ ...value, [field]: replacement }, target), /SYMBOL_WITNESS_RESULT/u);
  }
  let gets = 0; const accessor = { ...value };
  Object.defineProperty(accessor, "workerClient", { get(): never { gets += 1; throw new Error("unexpected"); } });
  assert.throws(() => validateSymbolWitnessReadResult(accessor, target), /SYMBOL_WITNESS_INPUT/u); assert.equal(gets, 0);
});

function startTab(): Bag { return { tabId: "tab_page1", isAbleDelete: false, data: { doctype: -1 } }; }
function placeholderTab(): Bag {
  return { tabId: "0", isAbleDelete: false, isDisplayNone: true, draggable: false, group: "start_blank", data: { doctype: 0 } };
}
void test("actual clean PCB peer with source-native StartPage and project placeholder is admitted", async () => {
  const state = fixture(); state.tabs["getFilterTabs"] = (): Bag[] => [startTab(), placeholderTab(), state.tab];
  validateSymbolWitnessReadResult(plain(await state.run()), target); assert.equal(state.calls.length, 8);
});
void test("target cannot be the active peer", () => {
  assert.throws(() => buildSymbolWitnessReadExpression({ ...target, activeUuid: target.targetUuid }), /SYMBOL_WITNESS_INPUT/u);
});
for (const kind of ["start-only", "dirty", "dirty-peer", "strict-mode", "disabled", "duplicate-placeholder", "duplicate-start", "wrong-owner", "too-many", "sparse", "missing-user", "missing-branch", "symbol-peer"]) {
  void test(`caller state refuses ${kind} before any worker RPC`, async () => {
    const state = fixture();
    if (kind === "start-only") { state.tabs["getFilterTabs"] = (): Bag[] => [startTab()]; }
    else if (kind === "dirty") { state.tabs["hasTabUnSaved"] = (): boolean => true; }
    else if (kind === "dirty-peer") { state.tabs["isTabUnSaved"] = (): boolean => true; }
    else if (kind === "strict-mode") { state.ui["concurrentDesign"] = { _isConcurrentStrictMode: true, getIframeDisableStatusPanelPcb(): Bag { return { disable: false }; } }; }
    else if (kind === "disabled") { state.ui["concurrentDesign"] = { _isConcurrentStrictMode: false, getIframeDisableStatusPanelPcb(): Bag { return { disable: true }; } }; }
    else if (kind === "duplicate-placeholder") { state.tabs["getFilterTabs"] = (): Bag[] => [placeholderTab(), placeholderTab(), state.tab]; }
    else if (kind === "duplicate-start") { state.tabs["getFilterTabs"] = (): Bag[] => [startTab(), startTab(), state.tab]; }
    else if (kind === "wrong-owner") { state.tab["data"] = { doctype: 3, pid: target.projectUuid, owner: "e".repeat(32) }; }
    else if (kind === "too-many") { state.tabs["getFilterTabs"] = (): Bag[] => [state.tab, state.tab, startTab(), placeholderTab()]; }
    else if (kind === "sparse") { state.tabs["getFilterTabs"] = (): unknown[] => { const list: unknown[] = []; list.length = 1; return list; }; }
    else if (kind === "missing-user") { Reflect.deleteProperty(state.cookies, "userInfo"); }
    else if (kind === "missing-branch") { Reflect.deleteProperty(state.project, "branchUuid"); }
    else { state.tab["data"] = { doctype: 2, owner: target.ownerUuid }; }
    await assert.rejects(state.run(), /SYMBOL_WITNESS_READ_REFUSED:/u); assert.equal(state.calls.length, 0); assert.equal(state.clears, 1);
  });
}
void test("project owner response is bound independently of cached actor", async () => {
  const state = fixture(); state.onCall = (_, index): unknown => index === 1 ? { message: {
    uuid: target.projectUuid, currentBranch: target.branchUuid, isV2Format: false, owner: { uuid: "e".repeat(32) },
  } } : undefined;
  await assert.rejects(state.run(), /SYMBOL_WITNESS_READ_REFUSED:PROJECT/u); assert.equal(state.calls.length, 1);
});
void test("cached actor may differ from project owner without being mislabeled APP actor", async () => {
  const state = fixture(); state.actor["uuid"] = "e".repeat(32);
  const value = validateSymbolWitnessReadResult(plain(await state.run()), target);
  assert.equal(value["cachedActorUuid"], "e".repeat(32)); assert.equal(value["ownerUuid"], target.ownerUuid); assert.equal(value["appActorVerified"], false);
});
