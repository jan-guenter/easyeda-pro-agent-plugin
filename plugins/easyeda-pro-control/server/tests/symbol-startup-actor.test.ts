import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { buildStartupActorReadExpression, validateStartupActorReadResult } from "../src/symbol-startup-actor.ts";

type Bag = Record<string, unknown>;
const actor = { uuid: "a".repeat(32), username: "synthetic", nickname: "Synthetic" };
interface Fixture { host: Bag; project: Bag; owner: Bag; startup: Bag; cached: Bag; cookies: Bag; tabs: Bag; tab: Bag; ui: Bag; sandbox: Bag; calls: string[]; onCall?: (name: string, index: number) => void; run: () => unknown }
function fixture(): Fixture {
  const cached = { ...actor }, calls: string[] = [], owner: Bag = { nickname: "", uuid: "" }, startup = { ...actor };
  const cookies = { userInfo: cached }, project: Bag = { projectId: undefined, title: undefined, isCBB: undefined, isPublic: undefined,
    isPublish: undefined, settings: undefined, branchNum: undefined, isV2Format: undefined, owner: "", projectManagerName: "", branchUuid: "", ownerData: owner };
  const tab = { tabId: "tab_page1", isAbleDelete: false, data: { doctype: -1 } };
  const tabs: Bag = { isOpenProjectDoc: true, isOpenOtherDoc: true };
  const host: Bag = { currentProject: project, sessionStorageTabs: new Set(), loginedUserInfo: startup, globalVariableCookieData: cookies, urlCmd: null, isHistoryMode: false };
  const ui = { gVars: host, tabBar: tabs };
  const sandbox: Bag = { UI: ui, gVars: host, Object, Set, Array, Reflect,
    location: { href: "https://client/editor?cll=warn#", origin: "https://client" }, document: { nodeType: 9, URL: "https://client/editor?cll=warn#" },
    PRO_EDITOR_MODE: "CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM" };
  const state: Fixture = { host, project, owner, startup, cached, cookies, tabs, tab, ui, sandbox, calls,
    run(): unknown {
      return runInNewContext(`globalThis.top=globalThis;globalThis.window=globalThis;globalThis.document.defaultView=globalThis;${buildStartupActorReadExpression()}`, sandbox, { timeout: 1000 });
    } };
  for (const [name, result] of [["getActiveTab", "tab_page1"], ["getFilterTabs", [tab]], ["hasTabUnSaved", false], ["isTabUnSaved", false]]) {
    assert.ok(typeof name === "string");
    tabs[name] = function method(this: unknown): unknown { assert.equal(this, tabs); calls.push(name); state.onCall?.(name, calls.length); return result; };
  }
  return state;
}
void test("startup observer projects only matching identities in the empty native StartPage", () => {
  const state = fixture(), value = validateStartupActorReadResult(structuredClone(state.run()));
  assert.deepEqual(value["startupActor"], actor); assert.deepEqual(value["cachedActor"], actor);
  assert.equal(state.calls.length, 8); assert.equal(Object.isFrozen(value), true);
  for (const key of ["appActorVerified", "appClockVerified", "workerFreshOfflineClockVerified", "producerBindingVerified", "executionAuthorized"]) { assert.equal(value[key], false); }
});
void test("startup has no RPC, cache, profile, identity endpoint, Save or async work", () => {
  const source = buildStartupActorReadExpression();
  for (const term of ["await ", ".rpcCall(", "fetch(", "/api/user", "web.db", "caches", "save(", "setTimeout", "password", "cas_info"]) { assert.equal(source.includes(term), false); }
});
const mutations: [string, (state: Fixture) => void][] = [
  ["startup identity", (s) => { s.host["loginedUserInfo"] = { ...s.startup }; }],
  ["cache identity", (s) => { s.cookies["userInfo"] = { ...s.cached }; }],
  ["cache container", (s) => { s.host["globalVariableCookieData"] = { ...s.cookies }; }],
  ["startup uuid", (s) => { s.startup["uuid"] = "b".repeat(32); }],
  ["cache uuid", (s) => { s.cached["uuid"] = "b".repeat(32); }],
  ["startup username", (s) => { s.startup["username"] = "other"; }],
  ["cache nickname", (s) => { s.cached["nickname"] = "other"; }],
  ["both names", (s) => { s.startup["nickname"] = "new"; s.cached["nickname"] = "new"; }],
  ["document", (s) => { s.sandbox["document"] = {}; }],
  ["mode", (s) => { s.sandbox["PRO_EDITOR_MODE"] = "CLIENT-ONLINE"; }],
  ["location", (s) => { s.sandbox["location"] = {}; }],
  ["host", (s) => { s.sandbox["gVars"] = {}; }],
  ["UI", (s) => { s.sandbox["UI"] = {}; }],
  ["tabs", (s) => { s.ui["tabBar"] = {}; }],
];
for (const [label, mutate] of mutations) {
  for (const at of [1, 4, 5, 8]) {
    void test(`startup refuses ${label} drift during native tab read ${at}`, () => {
      const state = fixture(); state.onCall = (_, index): void => { if (index === at) { mutate(state); } };
      assert.throws(state.run, /STARTUP_ACTOR_READ_REFUSED/u);
      assert.ok(state.calls.length >= at);
    });
  }
}
for (const kind of ["loaded", "extra-project-key", "bad-owner", "pending", "url-command", "history", "not-ready", "active-peer", "dirty", "extra-tab", "placeholder", "missing-startup", "mismatch", "inherited-actor"] as const) {
  void test(`startup refuses inadmissible initial ${kind}`, () => {
    const state = fixture();
    if (kind === "loaded") { state.project["projectId"] = "b".repeat(32); }
    else if (kind === "extra-project-key") { state.project["future"] = true; }
    else if (kind === "bad-owner") { state.owner["uuid"] = "b".repeat(32); }
    else if (kind === "pending") { state.host["sessionStorageTabs"] = new Set(["tab"]); }
    else if (kind === "url-command") { state.host["urlCmd"] = "open"; }
    else if (kind === "history") { state.host["isHistoryMode"] = true; }
    else if (kind === "not-ready") { state.tabs["isOpenOtherDoc"] = false; }
    else if (kind === "active-peer") { state.tabs["getActiveTab"] = (): string => "other"; }
    else if (kind === "dirty") { state.tabs["hasTabUnSaved"] = (): boolean => true; }
    else if (kind === "extra-tab") { state.tabs["getFilterTabs"] = (): unknown[] => [state.tab, state.tab]; }
    else if (kind === "placeholder") { state.tabs["getFilterTabs"] = (): unknown[] => [{ tabId: "0", data: { doctype: 0 } }]; }
    else if (kind === "missing-startup") { state.host["loginedUserInfo"] = null; }
    else if (kind === "mismatch") { state.startup["username"] = "other"; }
    else { Reflect.deleteProperty(state.startup, "uuid"); Object.setPrototypeOf(state.startup, actor); }
    assert.throws(state.run, /STARTUP_ACTOR_READ_REFUSED/u);
  });
}
void test("initial projected accessors never run and sensitive fields are never observed", () => {
  const invalid = fixture(); let gets = 0;
  Object.defineProperty(invalid.startup, "username", { get(): never { gets += 1; throw new Error("private"); } });
  assert.throws(invalid.run, /STARTUP_ACTOR_READ_REFUSED/u); assert.equal(gets, 0);
  const valid = fixture();
  Object.defineProperty(valid.startup, "password", { get(): never { gets += 1; throw new Error("secret"); } });
  validateStartupActorReadResult(structuredClone(valid.run())); assert.equal(gets, 0);
});
void test("startup result rejects extra fields, true authorities, actor disagreement and accessors", () => {
  const value = validateStartupActorReadResult(structuredClone(fixture().run()));
  assert.throws(() => validateStartupActorReadResult({ ...value, other: true }), /STARTUP_ACTOR_RESULT/u);
  for (const key of ["appActorVerified", "appClockVerified", "workerFreshOfflineClockVerified", "producerBindingVerified", "executionAuthorized"]) {
    assert.throws(() => validateStartupActorReadResult({ ...value, [key]: true }), /STARTUP_ACTOR_RESULT/u);
  }
  assert.throws(() => validateStartupActorReadResult({ ...value, cachedActor: { ...actor, nickname: "other" } }), /STARTUP_ACTOR_RESULT/u);
  let gets = 0; const accessor = { ...value }; Object.defineProperty(accessor, "startupActor", { get(): never { gets += 1; throw new Error("private"); } });
  assert.throws(() => validateStartupActorReadResult(accessor), /STARTUP_ACTOR_RESULT/u); assert.equal(gets, 0);
});
const lateMutations: [string, (state: Fixture) => void][] = [
  ...["projectId", "title", "isCBB", "isPublic", "isPublish", "settings", "branchNum", "isV2Format"].map((key): [string, (state: Fixture) => void] =>
    [`project ${key}`, (s) => { s.project[key] = "changed"; }]),
  ...["owner", "projectManagerName", "branchUuid"].map((key): [string, (state: Fixture) => void] =>
    [`project empty ${key}`, (s) => { s.project[key] = "changed"; }]),
  ...["nickname", "uuid"].map((key): [string, (state: Fixture) => void] =>
    [`owner ${key}`, (s) => { s.owner[key] = "changed"; }]),
  ["owner object", (s) => { s.project["ownerData"] = { ...s.owner }; }],
  ["project key", (s) => { s.project["other"] = true; }],
  ["owner key", (s) => { s.owner["other"] = true; }],
  ["pending content", (s) => { const value = s.host["sessionStorageTabs"]; assert.ok(value instanceof Set); value.add("pending"); }],
  ["pending own field", (s) => { Object.defineProperty(s.host["sessionStorageTabs"], "extra", { value: true }); }],
  ["URL command", (s) => { s.host["urlCmd"] = "open"; }],
  ["history flag", (s) => { s.host["isHistoryMode"] = true; }],
  ["project readiness", (s) => { s.tabs["isOpenProjectDoc"] = false; }],
  ["other readiness", (s) => { s.tabs["isOpenOtherDoc"] = false; }],
  ...["getActiveTab", "getFilterTabs", "hasTabUnSaved", "isTabUnSaved"].map((key): [string, (state: Fixture) => void] =>
    [`method ${key}`, (s) => { s.tabs[key] = (): never => { throw new Error("replacement must not execute"); }; }]),
];
for (const [label, mutate] of lateMutations) {
  void test(`final startup tab getter cannot hide later ${label} drift`, () => {
    const state = fixture(); state.onCall = (_, index): void => { if (index === 8) { mutate(state); } };
    assert.throws(state.run, /STARTUP_ACTOR_READ_REFUSED/u);
    assert.equal(state.calls.length, 8);
  });
}
