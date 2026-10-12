/* oxlint-disable eslint/max-classes-per-file -- Separate browser interfaces must keep distinct receiver brands. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { UPLOAD_QUEUE_PROFILE, buildUploadQueueReadExpression, validateUploadQueueReadResult } from "../src/upload-queue-read.ts";

const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32) };
type Bag = Record<string, unknown>;
interface Call { kind: "rpc" | "match"; args: unknown[]; receiver: unknown }
interface Fixture {
  sandbox: Bag;
  host: Bag;
  ui: Bag;
  tabs: Bag;
  tab: Bag;
  storage: object;
  calls: Call[];
  denied: string[];
  timerClears: number;
  fireTimeout: () => void;
  onCall?: (call: Call, index: number) => unknown;
  matchValue?: unknown;
  rpcValue?: unknown;
  run: () => Promise<unknown>;
}

// Exact UI source initializer at UTF-16 offset 8067212, not its post-close {}.
function initialProject(): Bag {
  return { projectId: undefined, title: undefined, isCBB: undefined, owner: "", isPublic: undefined, isPublish: undefined,
    ownerData: { nickname: "", uuid: "" }, projectManagerName: "", settings: undefined, branchUuid: "", branchNum: undefined, isV2Format: undefined };
}

function fixture(): Fixture {
  // The callbacks close over state before the circular fixture is assembled.
  // oxlint-disable-next-line eslint/prefer-const
  let state: Fixture;
  const calls: Call[] = [], denied: string[] = [];
  const tab: Bag = { tabId: "tab_page1", isAbleDelete: false, data: { doctype: -1 } };
  const tabs: Bag = {
    isOpenProjectDoc: true, isOpenOtherDoc: true,
    getActiveTab(): string { return "tab_page1"; },
    getFilterTabs(): Bag[] { return [tab]; },
  };
  const host: Bag = { currentProject: initialProject(), sessionStorageTabs: new Set(), urlCmd: null, isHistoryMode: false };
  const ui: Bag = { tabBar: tabs, gVars: host };
  const nativeCall = (call: Call): unknown => {
    calls.push(call);
    return state.onCall?.(call, calls.length) ?? (call.kind === "rpc" ? state.rpcValue : state.matchValue);
  };
  class SyntheticCacheStorage {
    public match(...args: unknown[]): Promise<unknown> { return Promise.resolve(nativeCall({ kind: "match", args, receiver: this })); }
    public readonly open = (): never => { assert.ok(this instanceof SyntheticCacheStorage); denied.push("open"); throw new Error("forbidden"); };
    public readonly keys = (): never => { assert.ok(this instanceof SyntheticCacheStorage); denied.push("keys"); throw new Error("forbidden"); };
    public readonly delete = (): never => { assert.ok(this instanceof SyntheticCacheStorage); denied.push("delete"); throw new Error("forbidden"); };
  }
  class SyntheticBus {
    public rpcCall(...args: unknown[]): Promise<unknown> { return Promise.resolve(nativeCall({ kind: "rpc", args, receiver: this })); }
  }
  const bus = new SyntheticBus(), storage = new SyntheticCacheStorage();
  host["messageBus"] = bus;
  const sandbox: Bag = {
    UI: ui, gVars: host, CacheStorage: SyntheticCacheStorage, caches: storage,
    location: { href: "https://client/editor?cll=warn#", origin: "https://client" },
    document: { nodeType: 9, URL: "https://client/editor?cll=warn#" },
    navigator: { serviceWorker: { controller: null } }, PRO_EDITOR_MODE: "CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM",
    Object, Set, Reflect, Array,
    setTimeout(callback: () => void, delay: number): number {
      assert.equal(delay, 10_000); state.fireTimeout = callback; return 7;
    },
    clearTimeout(timer: unknown): void { assert.equal(timer, 7); state.timerClears += 1; },
  };
  state = {
    sandbox, host, ui, tabs, tab, storage, calls, denied, timerClears: 0,
    fireTimeout(): void { throw new Error("timer not installed"); }, rpcValue: { message: false },
    async run(): Promise<unknown> {
      const result: unknown = runInNewContext(`globalThis.top=globalThis;globalThis.window=globalThis;if(globalThis.document){globalThis.document.defaultView=globalThis;}${buildUploadQueueReadExpression(target)}`, sandbox, { timeout: 1000 });
      return await result;
    },
  };
  return state;
}

function plain(input: unknown): unknown { return structuredClone(input); }

function clean(state: Fixture): void {
  assert.deepEqual(state.denied, []);
  assert.equal(state.timerClears, 1);
}

void test("two fixed native non-creating matches with three inactive-target checks", async () => {
  const state = fixture(), value = plain(await state.run());
  assert.deepEqual(value, { profile: UPLOAD_QUEUE_PROFILE, ...target, origin: "https://client",
    projectV6UploadAbsent: true, localProjectV1UploadAbsent: true, scope: "point-in-time-inactive-target" });
  assert.equal(Object.isFrozen(validateUploadQueueReadResult(value, target)), true);
  assert.deepEqual(state.calls.map((call) => call.kind), ["rpc", "match", "rpc", "match", "rpc"]);
  for (const call of state.calls.filter((entry) => entry.kind === "rpc")) {
    assert.deepEqual(plain(call.args), ["/pro-mgr/hasProject", [target.projectUuid]]);
    assert.equal(call.receiver, state.host["messageBus"]);
  }
  const matches = state.calls.filter((entry) => entry.kind === "match");
  for (const [index, call] of matches.entries()) {
    assert.equal(call.receiver, state.storage);
    assert.deepEqual(plain(call.args), [`https://client/upload/${target.branchUuid}`, {
      cacheName: (index === 0 ? `project_${target.projectUuid}_v6` : `localProject_${target.projectUuid}_v1`),
      ignoreSearch: true, ignoreMethod: false, ignoreVary: true,
    }]);
  }
  clean(state);
});

void test("exact offline client mode is also source-admitted", async () => {
  const state = fixture(); state.sandbox["PRO_EDITOR_MODE"] = "CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM";
  const value = plain(await state.run());
  assert.equal(validateUploadQueueReadResult(value, target)["scope"], "point-in-time-inactive-target");
  assert.equal(state.calls.length, 5); clean(state);
});

for (const level of ["trace", "debug", "info", "warn", "error"]) {
  for (const fragment of ["", "#"]) {
    void test(`native named log level ${level} fragment ${JSON.stringify(fragment)} is admitted`, async () => {
      const state = fixture(), url = `https://client/editor?cll=${level}${fragment}`;
      state.sandbox["location"] = { href: url, origin: "https://client" };
      state.sandbox["document"] = { nodeType: 9, URL: url };
      const value = plain(await state.run()); validateUploadQueueReadResult(value, target);
      assert.equal(state.calls.length, 5); clean(state);
    });
  }
}
for (const suffix of ["3#", "03#", "WARN#", "dummy#", "fatal#", "unknown#", "#", "warn&cmd=open#", "warn&cll=error#", "warn#id=target", "warn#prjPath=target", "%77arn#", "warn%23", "warn/#"]) {
  void test(`non-native or nonempty startup URL refuses ${suffix}`, async () => {
    const state = fixture(), url = `https://client/editor?cll=${suffix}`;
    state.sandbox["location"] = { href: url, origin: "https://client" };
    state.sandbox["document"] = { nodeType: 9, URL: url };
    await assert.rejects(state.run(), /UPLOAD_QUEUE_READ_REFUSED:/u);
    assert.equal(state.calls.length, 0); clean(state);
  });
}

for (const forbidden of [".open(", ".keys(", ".put(", ".delete(", ".text(", ".json(", ".arrayBuffer(", ".body", "getUploadedData", "initCache", "fetch(", "startupFinished"]) {
  void test(`expression excludes ${forbidden}`, () => { assert.equal(buildUploadQueueReadExpression(target).includes(forbidden), false); });
}

for (const id of ["", "x".repeat(129), ".", "..", "p/q", "p?q", "p#q", "%61", "with space", "a\n", "é", String.raw`a\b`, "a:b", "a\0b"]) {
  for (const field of ["projectUuid", "branchUuid"]) {
    void test(`rejects unsafe/bounded identity ${field} ${JSON.stringify(id)}`, () => {
      assert.throws(() => buildUploadQueueReadExpression({ ...target, [field]: id }), /UPLOAD_QUEUE_INPUT/u);
    });
  }
}
for (const input of [null, undefined, [], "value", 42, { ...target, cacheName: "anything" }, { ...target, script: "anything" }]) {
  void test(`strict scope shape ${JSON.stringify(input)}`, () => { assert.throws(() => buildUploadQueueReadExpression(input), /UPLOAD_QUEUE_INPUT/u); });
}
void test("scope getters are not invoked", () => {
  let reads = 0;
  const input = { branchUuid: target.branchUuid, get projectUuid(): string { reads += 1; return target.projectUuid; } };
  assert.throws(() => buildUploadQueueReadExpression(input), /UPLOAD_QUEUE_INPUT/u); assert.equal(reads, 0);
});

const invalidContexts: [string, (state: Fixture) => void][] = [
  ["wrong origin", (s) => { s.sandbox["location"] = { href: "https://other/editor?cll=warn#", origin: "https://other" }; }],
  ["online mode", (s) => { s.sandbox["PRO_EDITOR_MODE"] = "EASYEDA-PRO-CLIENT-ONLINE"; }],
  ["non-client mode", (s) => { s.sandbox["PRO_EDITOR_MODE"] = "EASYEDA-PRO-OFFLINE"; }],
  ["unknown mode tokens", (s) => { s.sandbox["PRO_EDITOR_MODE"] = "UNKNOWN-CLIENT-OFFLINE"; }],
  ["prior synthetic mode spelling", (s) => { s.sandbox["PRO_EDITOR_MODE"] = "EASYEDA-PRO-CLIENT-HALF_OFFLINE"; }],
  ["unreviewed brand", (s) => { s.sandbox["PRO_EDITOR_MODE"] = "CLIENT-OFFLINE-LCEDA-PCB-SCH-PANEL-SIM"; }],
  ["extra mode token", (s) => { s.sandbox["PRO_EDITOR_MODE"] = "CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM-PRIVATE"; }],
  ["native online mode", (s) => { s.sandbox["PRO_EDITOR_MODE"] = "CLIENT-ONLINE-EASYEDA-PCB-SCH-PANEL-SIM"; }],
  ["project hash", (s) => { s.sandbox["location"] = { href: "https://client/editor?cll=warn#id=target", origin: "https://client" }; }],
  ["export query", (s) => { s.sandbox["location"] = { href: "https://client/editor?cll=warn&export=target#", origin: "https://client" }; }],
  ["current project", (s) => { s.host["currentProject"] = { projectId: target.projectUuid }; }],
  ["post-close empty project", (s) => { s.host["currentProject"] = {}; }],
  ["queued startup tabs", (s) => { s.host["sessionStorageTabs"] = new Set(["document"]); }],
  ["wrong pending-tab type", (s) => { s.host["sessionStorageTabs"] = { size: 0 }; }],
  ["queued command", (s) => { s.host["urlCmd"] = "open"; }],
  ["history mode", (s) => { s.host["isHistoryMode"] = true; }],
  ["first flag", (s) => { s.tabs["isOpenProjectDoc"] = false; }],
  ["second flag", (s) => { s.tabs["isOpenOtherDoc"] = false; }],
  ["missing flag", (s) => { Reflect.deleteProperty(s.tabs, "isOpenOtherDoc"); }],
  ["extra tab", (s) => { s.tabs["getFilterTabs"] = (): Bag[] => [s.tab, { tabId: "foreign" }]; }],
  ["no tab", (s) => { s.tabs["getFilterTabs"] = (): Bag[] => []; }],
  ["sparse tabs", (s) => { s.tabs["getFilterTabs"] = (): unknown[] => { const list: unknown[] = []; list.length = 1; return list; }; }],
  ["wrong active", (s) => { s.tabs["getActiveTab"] = (): string => "other"; }],
  ["wrong tab type", (s) => { s.tab["data"] = { doctype: 0 }; }],
  ["tab project owner", (s) => { s.tab["parentProjectUuid"] = target.projectUuid; }],
  ["tab library owner", (s) => { s.tab["parentLibraryUuid"] = target.projectUuid; }],
  ["tab raw owner", (s) => { s.tab["data"] = { doctype: -1, owner: target.projectUuid }; }],
  ["tab type alias", (s) => { s.tab["documentType"] = 3; }],
  ["deletable tab", (s) => { s.tab["isAbleDelete"] = true; }],
  ["active service worker", (s) => { s.sandbox["navigator"] = { serviceWorker: { controller: {} } }; }],
  ["missing caches", (s) => { Reflect.deleteProperty(s.sandbox, "caches"); }],
  ["wrong receiver", (s) => { s.sandbox["caches"] = {}; }],
  ["wrong host alias", (s) => { s.ui["gVars"] = {}; }],
  ["missing document", (s) => { Reflect.deleteProperty(s.sandbox, "document"); }],
  ["wrong document node", (s) => { s.sandbox["document"] = { nodeType: 1, URL: "https://client/editor?cll=warn#" }; }],
  ["wrong document URL", (s) => { s.sandbox["document"] = { nodeType: 9, URL: "https://client/editor?cll=warn#prjPath=target" }; }],
];
for (const [label, mutate] of invalidContexts) {
  void test(`refuses context ${label} before any native call`, async () => {
    const state = fixture(); mutate(state);
    await assert.rejects(state.run(), /UPLOAD_QUEUE_READ_REFUSED:/u); assert.equal(state.calls.length, 0); clean(state);
  });
}

for (const field of Object.keys(initialProject())) {
  for (const kind of ["missing", "wrong", "accessor"]) {
    void test(`exact native initial project field ${field} ${kind} refuses`, async () => {
      const project = initialProject(), state = fixture(); let reads = 0;
      if (kind === "missing") { Reflect.deleteProperty(project, field); }
      else if (kind === "wrong") { project[field] = "unadmitted value"; }
      else { Object.defineProperty(project, field, { get(): undefined { reads += 1; return undefined; } }); }
      state.host["currentProject"] = project;
      await assert.rejects(state.run(), /UPLOAD_QUEUE_READ_REFUSED:/u);
      assert.equal(reads, 0); assert.equal(state.calls.length, 0); clean(state);
    });
  }
}
for (const invalid of [
  { ...initialProject(), extra: true },
  { ...initialProject(), ownerData: { nickname: "", uuid: "other" } },
  { ...initialProject(), ownerData: { nickname: "", uuid: "", extra: true } },
  { ...initialProject(), ownerData: {} },
]) {
  void test(`exact initial project rejects ${JSON.stringify(invalid)}`, async () => {
    const state = fixture(); state.host["currentProject"] = invalid;
    await assert.rejects(state.run(), /UPLOAD_QUEUE_READ_REFUSED:/u); assert.equal(state.calls.length, 0); clean(state);
  });
}

void test("context accessors refuse without calling them", async () => {
  const state = fixture(); let reads = 0;
  Object.defineProperty(state.tabs, "isOpenProjectDoc", { get(): boolean { reads += 1; return true; } });
  await assert.rejects(state.run(), /UPLOAD_QUEUE_READ_REFUSED:/u); assert.equal(reads, 0); assert.equal(state.calls.length, 0); clean(state);
});

for (const value of [null, {}, false, "", { body: null }]) {
  void test(`any non-undefined match refuses ${JSON.stringify(value)}`, async () => {
    const state = fixture(); state.matchValue = value;
    await assert.rejects(state.run(), /UPLOAD_QUEUE_READ_REFUSED:PROJECT_CACHE/u); assert.equal(state.calls.length, 2); clean(state);
  });
}
void test("present response body is never read", async () => {
  const state = fixture(); let reads = 0;
  state.matchValue = { get body(): never { reads += 1; throw new Error("private body"); }, text(): never { reads += 1; throw new Error("private body"); } };
  await assert.rejects(state.run(), /UPLOAD_QUEUE_READ_REFUSED:PROJECT_CACHE/u); assert.equal(reads, 0); clean(state);
});
void test("second cache presence refuses without another native call", async () => {
  const state = fixture(); state.onCall = (_, index): unknown => index === 4 ? {} : undefined;
  await assert.rejects(state.run(), /UPLOAD_QUEUE_READ_REFUSED:LOCAL_CACHE/u); assert.equal(state.calls.length, 4); clean(state);
});
for (const value of [undefined, null, false, {}, { message: true }, { message: "false" }, { success: true, result: false }]) {
  void test(`inactive-target requires exact native envelope ${JSON.stringify(value)}`, async () => {
    const state = fixture(); state.rpcValue = value;
    await assert.rejects(state.run(), /UPLOAD_QUEUE_READ_REFUSED:TARGET_INACTIVE/u); assert.equal(state.calls.length, 1); clean(state);
  });
}

for (const index of [1, 2, 3, 4, 5]) {
  for (const kind of ["host", "tabs", "project", "project-id", "owner-data", "origin", "document", "match", "bus", "active", "storage", "constructor", "navigator", "controller", "mode", "pending-tabs", "first-flag", "second-flag", "url-command", "history", "tab-data", "timeout"]) {
    void test(`receiver/context drift after await ${index} ${kind}`, async () => {
      const state = fixture();
      state.onCall = (_, current): void => {
        if (current !== index) { return; }
        if (kind === "host") { state.sandbox["gVars"] = {}; }
        else if (kind === "tabs") { state.ui["tabBar"] = {}; }
        else if (kind === "project") { state.host["currentProject"] = {}; }
        else if (kind === "project-id" || kind === "owner-data") {
          const project = state.host["currentProject"];
          assert.ok(project !== null && typeof project === "object");
          Object.defineProperty(project, kind === "project-id" ? "projectId" : "ownerData", { value: kind === "project-id" ? target.projectUuid : { nickname: "", uuid: "" } });
        }
        else if (kind === "origin") { state.sandbox["location"] = { href: "https://client/editor?cll=warn#", origin: "https://client" }; }
        else if (kind === "document") { state.sandbox["document"] = {}; }
        else if (kind === "match") { const prototype: unknown = Object.getPrototypeOf(state.storage); assert.ok(prototype !== null && typeof prototype === "object"); Object.defineProperty(prototype, "match", { value: (): Promise<void> => Promise.resolve() }); }
        else if (kind === "bus") { state.host["messageBus"] = {}; }
        else if (kind === "active") { state.tabs["getActiveTab"] = (): string => "tab_page1"; }
        else if (kind === "storage") { state.sandbox["caches"] = {}; }
        else if (kind === "constructor") { state.sandbox["CacheStorage"] = Object; }
        else if (kind === "navigator") { state.sandbox["navigator"] = { serviceWorker: { controller: null } }; }
        else if (kind === "controller") {
          const navigator = state.sandbox["navigator"];
          assert.ok(navigator !== null && typeof navigator === "object" && "serviceWorker" in navigator);
          const serviceWorker = navigator.serviceWorker;
          assert.ok(serviceWorker !== null && typeof serviceWorker === "object");
          Object.defineProperty(serviceWorker, "controller", { value: {} });
        }
        else if (kind === "mode") { state.sandbox["PRO_EDITOR_MODE"] = "EASYEDA-PRO-CLIENT-ONLINE"; }
        else if (kind === "pending-tabs") { state.host["sessionStorageTabs"] = new Set(); }
        else if (kind === "first-flag") { state.tabs["isOpenProjectDoc"] = false; }
        else if (kind === "second-flag") { state.tabs["isOpenOtherDoc"] = false; }
        else if (kind === "url-command") { state.host["urlCmd"] = "open"; }
        else if (kind === "history") { state.host["isHistoryMode"] = true; }
        else if (kind === "tab-data") { state.tab["data"] = { doctype: 3 }; }
        else { state.fireTimeout(); }
      };
      await assert.rejects(state.run(), /UPLOAD_QUEUE_READ_REFUSED:/u); assert.equal(state.calls.length, index); clean(state);
    });
  }
}

for (const pendingAt of [1, 2, 3, 4, 5]) {
  void test(`timeout leaves no further calls after late native settlement ${pendingAt}`, async () => {
    const pending = Promise.withResolvers<unknown>(), state = fixture();
    state.onCall = (_, index): unknown => index === pendingAt ? pending.promise : undefined;
    const running = state.run();
    for (let index = 0; index < 16; index += 1) { await Promise.resolve(); }
    assert.equal(state.calls.length, pendingAt); state.fireTimeout();
    await assert.rejects(running, /UPLOAD_QUEUE_READ_REFUSED:TIMEOUT/u);
    pending.resolve(pendingAt % 2 === 1 ? { message: false } : undefined);
    for (let index = 0; index < 12; index += 1) { await Promise.resolve(); }
    assert.equal(state.calls.length, pendingAt); clean(state);
  });
}
void test("native rejection stays private and never retries", async () => {
  const state = fixture(); state.onCall = (): never => { throw new Error("credential and unrelated project source"); };
  await assert.rejects(state.run(), { message: "UPLOAD_QUEUE_READ_REFUSED:TARGET_INACTIVE" }); assert.equal(state.calls.length, 1); clean(state);
});

void test("strict result validation does not create completion authority", async () => {
  const state = fixture(), value = validateUploadQueueReadResult(plain(await state.run()), target);
  for (const [name, replacement] of [["projectUuid", "other"], ["branchUuid", "other"], ["origin", "https://other"], ["profile", "other"], ["scope", "completed"], ["projectV6UploadAbsent", false], ["localProjectV1UploadAbsent", false]] as const) {
    assert.throws(() => validateUploadQueueReadResult({ ...value, [name]: replacement }, target), /UPLOAD_QUEUE_RESULT/u);
  }
  assert.throws(() => validateUploadQueueReadResult({ ...value, completed: true }, target), /UPLOAD_QUEUE_INPUT/u);
  clean(state);
});
