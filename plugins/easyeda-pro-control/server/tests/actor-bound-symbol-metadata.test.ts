import assert from "node:assert/strict";
import { test } from "node:test";
import { runInNewContext } from "node:vm";
import { buildActorBoundProjectSymbolMetadataExpression, buildProjectSymbolMetadataExpression } from "../src/project-symbol-metadata.ts";
import type { ProjectSymbolMetadataPlan } from "../src/project-symbol-metadata.ts";

type Bag = Record<string, unknown>;
const expectedActor = { uuid: "a".repeat(32), username: "synthetic", nickname: "Synthetic" };
const plan: ProjectSymbolMetadataPlan = { profile: "easyeda-pro-control.project-symbol-metadata.v1", projectUuid: "project", branchUuid: "branch", ownerUuid: "owner", targetUuid: "symbol",
  beforeProjectSha256: "a".repeat(64), beforeTitle: "Original", beforeDescription: "", beforeTags: [], beforeSource: "", peerTitles: [],
  desiredTitle: "Renamed", desiredDescription: "New description", headerEditVersion: "3.0" };
const context = { project: { uuid: "project", path: "/synthetic/project.eprj2" }, document: { uuid: "board", documentType: 3, tabId: "board@project" } };
interface Call { name: string; receiver: unknown; args: unknown[] }
interface Fixture { host: Bag; startup: Bag; cached: Bag; cookies: Bag; sandbox: Bag; eda: Bag; tabs: Bag; metadata: Bag; calls: Call[]; updates: number;
  rejectAt?: number;
  onCall?: (entry: Call, index: number) => void; afterResolve?: (entry: Call, index: number) => void;
  run: (source?: string) => Promise<unknown> }
function fixture(): Fixture {
  const cached = { ...expectedActor }, calls: Call[] = [], metadata: Bag = { uuid: plan.targetUuid, project_uuid: plan.projectUuid, owner: { uuid: plan.ownerUuid },
    docType: 2, display_title: plan.beforeTitle, description: plan.beforeDescription, source: "", custom_tags: "[]" }, startup = { ...expectedActor };
  const cookies = { userInfo: cached };
  const host: Bag = { globalVariableCookieData: cookies, loginedUserInfo: startup,
    currentProject: { projectId: plan.projectUuid, branchUuid: plan.branchUuid, isV2Format: false }, isHistoryMode: false };
  const peer = { tabId: context.document.tabId, documentType: 3, parentProjectUuid: plan.projectUuid, data: { doctype: 3, pid: plan.projectUuid } };
  const tabs: Bag = { getFilterTabs: (): unknown[] => [peer], getActiveTab: (): string => context.document.tabId,
    hasTabUnSaved: (): boolean => false, isTabUnSaved: (): boolean => false };
  const sandbox: Bag = { gVars: host, Object, Array, Set, Reflect, TextEncoder, PRO_EDITOR_VERSION: "3.0",
    PRO_EDITOR_MODE: "CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM",
    location: { href: "https://client/editor?cll=warn#", origin: "https://client" }, document: { nodeType: 9, URL: "https://client/editor?cll=warn#" },
    UI: { gVars: host, tabBar: tabs, concurrentDesign: { isConcurrentStrictMode: false, getIframeDisableStatusPanelPcb: (): Bag => ({ disable: false }) } } };
  const eda: Bag = {};
  const state: Fixture = { host, startup, cached, cookies, sandbox, eda, tabs, metadata, calls, updates: 0,
    async run(source = buildActorBoundProjectSymbolMetadataExpression(plan, context, expectedActor)): Promise<unknown> {
      sandbox["eda"] = eda;
      const result: unknown = runInNewContext(`globalThis.top=globalThis;globalThis.window=globalThis;globalThis.document.defaultView=globalThis;${source}`,
        sandbox, { timeout: 1000 }); return await result;
    } };
  function reply(name: string, receiver: unknown, args: unknown[], value: unknown): Promise<unknown> {
    const entry = { name, receiver, args }; calls.push(entry); const index = calls.length; state.onCall?.(entry, index);
    // Two queued microtasks model drift after the native await's guard runs
    // But before the enclosing continuation starts its next guarded call.
    const result = index === state.rejectAt ? Promise.reject(new Error("synthetic native rejection")) : Promise.resolve(value);
    if (state.afterResolve !== undefined) { queueMicrotask(() => { queueMicrotask(() => state.afterResolve?.(entry, index)); }); }
    return result;
  }
  eda["dmt_Project"] = { getCurrentProjectInfo(this: unknown): unknown { return reply("project", this, [], context.project); } };
  eda["dmt_SelectControl"] = { getCurrentDocumentInfo(this: unknown): unknown { return reply("document", this, [], context.document); } };
  eda["dmt_EditorControl"] = { getSplitScreenTree(this: unknown): unknown { return reply("tree", this, [], { tabs: [peer] }); } };
  eda["lib_Symbol"] = { modify(): never { throw new Error("public modifier forbidden"); } };
  host["messageBus"] = { rpcCall(this: unknown, topic: string, args: unknown[]): unknown {
    let value: unknown;
    if (topic === "canAddLib") { value = { hasPermission: true }; }
    else if (topic === "/PrjDB/project/getData") { value = { uuid: plan.projectUuid, owner: { uuid: plan.ownerUuid }, currentBranch: plan.branchUuid, isV2Format: false }; }
    else {
      if (topic === "/PrjDB/symbol/updateData") { state.updates += 1; metadata["display_title"] = plan.desiredTitle; metadata["description"] = plan.desiredDescription; }
      else { assert.equal(topic, "/PrjDB/symbol/getData"); }
      value = structuredClone(metadata);
    }
    return reply(topic, this, args, { message: value });
  } };
  return state;
}
void test("actor-bound compiler preserves one native update, arguments, receivers and legacy payload", async () => {
  const bound = fixture(), legacy = fixture();
  const oldResult = await legacy.run(buildProjectSymbolMetadataExpression(plan, context));
  assert.deepEqual(structuredClone(await bound.run()), structuredClone(oldResult));
  assert.deepEqual(bound.calls.map(({ name, args }) => [name, structuredClone(args)]), legacy.calls.map(({ name, args }) => [name, structuredClone(args)]));
  assert.equal(bound.updates, 1); assert.equal(bound.calls.length, 20);
  const receivers = new Map<string, unknown>([["project", bound.eda["dmt_Project"]], ["document", bound.eda["dmt_SelectControl"]], ["tree", bound.eda["dmt_EditorControl"]]]);
  for (const call of bound.calls) { assert.equal(call.receiver, receivers.get(call.name) ?? bound.host["messageBus"]); }
  const update = bound.calls[14]; assert.equal(update?.name, "/PrjDB/symbol/updateData");
  assert.deepEqual(structuredClone(update?.args), [{ uuid: "symbol", title: "Renamed", description: "New description" }, "project"]);
});
const changes: [string, (state: Fixture) => void][] = [
  ["startup uuid", (s) => { s.startup["uuid"] = "b".repeat(32); }],
  ["cached username", (s) => { s.cached["username"] = "changed"; }],
  ["both nicknames", (s) => { s.startup["nickname"] = "changed"; s.cached["nickname"] = "changed"; }],
  ["equal startup replacement", (s) => { s.host["loginedUserInfo"] = { ...s.startup }; }],
  ["equal cached replacement", (s) => { s.cookies["userInfo"] = { ...s.cached }; }],
  ["cookie container replacement", (s) => { s.host["globalVariableCookieData"] = { ...s.cookies }; }],
];
for (let at = 1; at <= 20; at += 1) {
  for (const [label, mutate] of changes) {
    void test(`actor drift ${label} after native await ${at} blocks every later call`, async () => {
      const state = fixture(); state.onCall = (_, index): void => { if (index === at) { mutate(state); } };
      await assert.rejects(state.run(), /Symbol metadata operation refused at/u);
      assert.equal(state.calls.length, at); assert.equal(state.updates, at >= 15 ? 1 : 0);
    });
  }
}
for (let previous = 1; previous < 20; previous += 1) {
  void test(`actor microtask drift before native call ${previous + 1} prevents dispatch`, async () => {
    const state = fixture(); state.afterResolve = (_, index): void => { if (index === previous) { state.startup["username"] = "changed"; state.cached["username"] = "changed"; } };
    await assert.rejects(state.run(), /Symbol metadata operation refused at/u);
    assert.equal(state.calls.length, previous); assert.equal(state.updates, previous >= 15 ? 1 : 0);
  });
}
void test("expected actor mismatch refuses before any SDK call", async () => {
  const state = fixture(); state.startup["uuid"] = "b".repeat(32); state.cached["uuid"] = "b".repeat(32);
  await assert.rejects(state.run(), /Symbol metadata operation refused at host:ACTOR_DRIFT$/u); assert.equal(state.calls.length, 0); assert.equal(state.updates, 0);
});
void test("actor getter refuses without execution and no expected-actor accessor runs", async () => {
  const state = fixture(); let gets = 0;
  Object.defineProperty(state.startup, "nickname", { get(): never { gets += 1; throw new Error("secret"); } });
  await assert.rejects(state.run(), /Symbol metadata operation refused at host/u); assert.equal(gets, 0); assert.equal(state.calls.length, 0);
  const input = { ...expectedActor }; Object.defineProperty(input, "uuid", { get(): never { gets += 1; throw new Error("secret"); } });
  assert.throws(() => buildActorBoundProjectSymbolMetadataExpression(plan, context, input), /SYMBOL_ACTOR_RESULT/u); assert.equal(gets, 0);
});
void test("expected actor is required and cannot carry authority fields", () => {
  for (const value of [undefined, null, {}, { ...expectedActor, executionAuthorized: true }]) {
    assert.throws(() => buildActorBoundProjectSymbolMetadataExpression(plan, context, value), /SYMBOL_ACTOR_RESULT/u);
  }
});
void test("fixed actor-bound compiler does not expose endpoints, callback override or Save", () => {
  const code = buildActorBoundProjectSymbolMetadataExpression(plan, context, expectedActor);
  for (const term of ["/api/user", "web.db", ".save(", ".modify(", ".publish(", ".subscribe(", "rpcCall=", "rpcCall ="]) { assert.equal(code.includes(term), false); }
  assert.equal(code.split("await actorAwait(()=>").length - 1, 15);
});
void test("shared compiler preserves data containing former anchor strings", () => {
  const description = "await assertContext()";
  const code = buildActorBoundProjectSymbolMetadataExpression({ ...plan, desiredDescription: description }, context, expectedActor);
  assert.ok(code.includes(JSON.stringify(description)));
  const actorCode = buildActorBoundProjectSymbolMetadataExpression(plan, context, { ...expectedActor, username: description });
  assert.ok(actorCode.includes(JSON.stringify(description)));
});
for (const at of [1, 12, 14, 15, 20]) {
  void test(`actor guard rejects main document replacement after native call ${at}`, async () => {
    const state = fixture(); state.onCall = (_, index): void => { if (index === at) { state.sandbox["document"] = {}; } };
    await assert.rejects(state.run(), /Symbol metadata operation refused at/u);
    assert.equal(state.calls.length, at); assert.equal(state.updates, at >= 15 ? 1 : 0);
  });
}
for (const fault of ["target-open", "dirty", "changed-source", "wrong-tags", "wrong-version"] as const) {
  void test(`actor binding preserves existing metadata guard ${fault}`, async () => {
    const state = fixture();
    if (fault === "target-open") { state.tabs["getFilterTabs"] = (): unknown[] => [{ tabId: "symbol@project", data: { doctype: 2, owner: "owner" } }]; }
    else if (fault === "dirty") { state.tabs["hasTabUnSaved"] = (): boolean => true; }
    else if (fault === "changed-source") { state.metadata["source"] = "new"; }
    else if (fault === "wrong-tags") { state.metadata["custom_tags"] = '["new"]'; }
    else { state.sandbox["PRO_EDITOR_VERSION"] = "other"; }
    await assert.rejects(state.run(), /Symbol metadata operation refused at/u); assert.equal(state.updates, 0);
  });
}
for (const at of [14, 15]) {
  for (const actorDrift of [false, true]) {
    void test(`native rejection at ${at} with actor drift ${actorDrift} never retries or continues`, async () => {
      const state = fixture(); state.rejectAt = at;
      state.onCall = (_, index): void => { if (actorDrift && index === at) { state.startup["uuid"] = "b".repeat(32); } };
      await assert.rejects(state.run(), /Symbol metadata operation refused at/u);
      assert.equal(state.calls.length, at); assert.equal(state.updates, at === 15 ? 1 : 0);
    });
  }
}
