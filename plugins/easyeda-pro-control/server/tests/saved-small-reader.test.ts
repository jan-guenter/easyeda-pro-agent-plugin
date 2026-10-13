import assert from "node:assert/strict";
import { test } from "node:test";
import { context, expectedActor, expectedWorker, fixture, plan } from "./helpers/project-symbol-worker-fixture.ts";
import type { Bag, Fixture } from "./helpers/project-symbol-worker-fixture.ts";
import { buildClosedSymbolSavedContentExpression } from "../src/saved-symbol-reader.ts";
import { isRecord } from "../src/core.ts";

const INPUT = Object.freeze({ projectUuid: plan.projectUuid, branchUuid: plan.branchUuid, ownerUuid: plan.ownerUuid, targetUuid: plan.targetUuid,
  headerEditVersion: plan.headerEditVersion, maximumTicket: expectedWorker.maxTicket, notBeforeMs: expectedWorker.notBeforeMs, notAfterMs: expectedWorker.notAfterMs });
const CONTENT = 'Synthetic raw native content Ω';
function record(value: unknown): Bag { assert.ok(isRecord(value)); return value; }
function setup(): Fixture & { reads: unknown[][]; content: unknown } {
  const reads: unknown[][] = [];
  const state: Fixture & { reads: unknown[][]; content: unknown } = Object.assign(fixture(), { reads, content: CONTENT });
  const bus = record(state.host["messageBus"]);
  const original = bus["rpcCall"]; assert.ok(typeof original === "function");
  bus["rpcCall"] = async function rpcCall(this: unknown, topic: string, args: unknown[]): Promise<unknown> {
    if (topic !== "/PrjDB/symbol/getStr") { const value: unknown = await Reflect.apply(original, this, [topic, args]); return value; }
    state.reads.push(args);
    const entry = { name: topic, receiver: this, args }; state.calls.push(entry); const index = state.calls.length; state.onCall?.(entry, index);
    const result = index === state.rejectAt ? Promise.reject(new Error("synthetic read rejection")) : Promise.resolve({ message: state.content });
    if (state.afterResolve !== undefined) { queueMicrotask(() => { queueMicrotask(() => state.afterResolve?.(entry, index)); }); }
    return result;
  };
  return state;
}
function code(): string { return buildClosedSymbolSavedContentExpression(INPUT, context, expectedActor); }
void test("fixed reader reads a closed symbol once without writer or canvas-open API", async () => {
  const state = setup(); const result = record(await state.run(code()));
  assert.equal(result["content"], CONTENT); assert.equal(result["workerClient"], state.client);
  assert.equal(result["executionAuthorized"], false); assert.equal(result["producerBindingVerified"], false); assert.equal(result["completionProved"], false);
  assert.deepEqual(structuredClone(state.reads), [[plan.targetUuid, plan.projectUuid]]); assert.equal(state.updates, 0);
  assert.deepEqual(state.calls.map((call) => call.name), ["project", "document", "tree", "/PrjDB/project/getData", "/PrjDB/project/getClient", "/PrjDB/project/getMaxTicket", "/PrjDB/symbol/getStr",
    "/PrjDB/project/getClient", "/PrjDB/project/getMaxTicket", "project", "document", "tree"]);
});
const mutations: Readonly<Record<string, (state: Fixture) => void>> = {
  actor: (state) => { state.startup["uuid"] = "f".repeat(32); },
  cached: (state) => { state.cached["nickname"] = "Changed"; },
  project: (state) => { record(state.host["currentProject"])["projectId"] = "f".repeat(64); },
  branch: (state) => { record(state.host["currentProject"])["branchUuid"] = "f".repeat(32); },
  dirty: (state) => { state.tabs["hasTabUnSaved"] = (): boolean => true; },
  pending: (state) => { state.host["sessionStorageTabs"] = new Set(["pending"]); },
  receiver: (state) => { record(state.host["messageBus"])["rpcCall"] = (): never => { throw new Error("substituted receiver must not run"); }; },
  window: (state) => { state.clockMs = INPUT.notAfterMs + 1; },
  version: (state) => { state.sandbox["PRO_EDITOR_VERSION"] = "different"; },
};
for (const [name, mutate] of Object.entries(mutations)) {
  for (let index = 1; index <= 12; index += 1) {
    void test(`reader rejects ${name} drift at native await ${index} without later calls`, async () => {
      const state = setup(); state.onCall = (_entry, current): void => { if (current === index) { mutate(state); } };
      await assert.rejects(state.run(code()), /Saved symbol read refused/u);
      assert.equal(state.calls.length, index); assert.equal(state.reads.length, index < 7 ? 0 : 1); assert.equal(state.updates, 0);
    });
  }
}
for (const index of [6, 7, 8, 9, 12]) {
  void test(`reader rejects drift accompanying rejected native await ${index}`, async () => {
    const state = setup(); state.rejectAt = index; state.onCall = (_entry, current): void => { if (current === index) { state.cached["nickname"] = "changed"; } };
    await assert.rejects(state.run(code()), /ACTOR_DRIFT/u); assert.equal(state.calls.length, index); assert.equal(state.updates, 0);
  });
}
for (let index = 1; index < 12; index += 1) {
  void test(`queued actor drift after await ${index} prevents the next native invocation`, async () => {
    const state = setup(); state.afterResolve = (_entry, current): void => { if (current === index) { state.cached["nickname"] = "queued drift"; } };
    await assert.rejects(state.run(code()), /ACTOR_DRIFT/u); assert.equal(state.calls.length, index); assert.equal(state.updates, 0);
  });
}
for (const [name, changed] of [["missing", undefined], ["object", {}], ["empty", ""], ["over-bound", "x".repeat(8_388_609)]] as const) {
  void test(`native content ${name} refuses without another getStr`, async () => {
    const state = setup(); state.content = changed; await assert.rejects(state.run(code()), /SAVED_SYMBOL_OUTPUT/u);
    assert.equal(state.reads.length, 1); assert.equal(state.calls.length, 7);
  });
}
for (const name of ["client", "ticket"] as const) {
  void test(`reader rejects ${name} changing during content read`, async () => {
    const state = setup(); state.onCall = (_entry, index): void => { if (index === 7) { if (name === "client") { state.client = "f".repeat(16); } else { state.ticket += 1; } } };
    await assert.rejects(state.run(code()), new RegExp(`SAVED_SYMBOL_${name.toUpperCase()}`, "u")); assert.equal(state.reads.length, 1);
  });
}
void test("compiler rejects accessors without invoking and context aliases before generating observer", () => {
  const input = { ...INPUT }; Object.defineProperty(input, "maximumTicket", { get(): never { assert.fail("caller accessor must not run"); } });
  assert.throws(() => buildClosedSymbolSavedContentExpression(input, context, expectedActor), /INPUT/u);
  assert.throws(() => buildClosedSymbolSavedContentExpression(INPUT, { ...context, project: { ...context.project, projectUuid: "f".repeat(64) } }, expectedActor), /INPUT/u);
});
