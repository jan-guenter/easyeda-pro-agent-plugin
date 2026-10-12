import assert from "node:assert/strict";
import { test } from "node:test";
import { buildWorkerBoundProjectSymbolMetadataExpression } from "../src/project-symbol-metadata.ts";
import { context, expectedActor, expectedWorker, fixture, plan } from "./helpers/project-symbol-worker-fixture.ts";
import type { Bag, Fixture } from "./helpers/project-symbol-worker-fixture.ts";

function isBag(value: unknown): value is Bag { return value !== null && typeof value === "object" && !Array.isArray(value); }
function target(value: unknown): Bag {
  assert.ok(isBag(value)); return value;
}
void test("worker-bound writer performs two fixed final reads then one exact update", async () => {
  const state = fixture(); const result = target(await state.run());
  assert.equal(result["schema"], "easyeda-pro-control.exact-json.v1");
  assert.equal(Object.hasOwn(state.sandbox, "eda"), false);
  assert.equal(state.calls.length, 22); assert.equal(state.updates, 1);
  assert.deepEqual(state.calls.slice(14, 17).map(({ name }) => name), ["/PrjDB/project/getClient", "/PrjDB/project/getMaxTicket", "/PrjDB/symbol/updateData"]);
  for (const entry of state.calls.filter(({ name }) => name.startsWith("/PrjDB/") || name === "canAddLib")) {
    assert.equal(entry.receiver, state.host["messageBus"]);
  }
  assert.deepEqual(structuredClone(state.calls[16]?.args), [{ uuid: plan.targetUuid, title: plan.desiredTitle, description: plan.desiredDescription }, plan.projectUuid]);
});
const changes: Readonly<Record<string, (state: Fixture) => void>> = {
  "actor uuid": (s) => { s.startup["uuid"] = "c".repeat(32); },
  "project object": (s) => { s.host["currentProject"] = { ...target(s.host["currentProject"]) }; },
  "branch scalar": (s) => { target(s.host["currentProject"])["branchUuid"] = "c".repeat(32); },
  "pending tabs": (s) => { Reflect.set(s.host, "sessionStorageTabs", new Set(["unknown"])); },
  "UI identity": (s) => { s.sandbox["UI"] = { ...target(s.sandbox["UI"]) }; },
  "bus identity": (s) => { s.host["messageBus"] = { ...target(s.host["messageBus"]) }; },
  "bus prototype": (s) => { Object.setPrototypeOf(s.host["messageBus"], {}); },
  "rpc receiver": (s) => { target(s.host["messageBus"])["rpcCall"] = (): never => { throw new Error("forbidden later invocation"); }; },
  "tab method": (s) => { s.tabs["getActiveTab"] = (): string => context.document.tabId; },
  "permission object": (s) => { const ui = target(s.sandbox["UI"]); ui["concurrentDesign"] = { ...target(ui["concurrentDesign"]) }; },
  "permission flag": (s) => { target(target(s.sandbox["UI"])["concurrentDesign"])["_isConcurrentStrictMode"] = true; },
  "permission method": (s) => { target(target(s.sandbox["UI"])["concurrentDesign"])["getIframeDisableStatusPanelPcb"] = (): Bag => ({ disable: false }); },
  "history mode": (s) => { s.host["isHistoryMode"] = true; },
  "pending URL": (s) => { s.host["urlCmd"] = "unknown"; },
  "tab readiness": (s) => { s.tabs["isOpenProjectDoc"] = false; },
  "SDK method": (s) => { target(s.eda["dmt_Project"])["getCurrentProjectInfo"] = (): never => { throw new Error("forbidden later invocation"); }; },
  "SDK prototype": (s) => { Object.setPrototypeOf(s.eda["dmt_EditorControl"], {}); },
  "Date constructor": (s) => { s.sandbox["Date"] = Date; },
  "Date now": (s) => { Object.defineProperty(s.sandbox["Date"], "now", { value: (): number => s.clockMs }); },
  "window expired": (s) => { s.clockMs = expectedWorker.notAfterMs + 1; },
};
for (let at = 1; at <= 22; at += 1) {
  for (const [label, mutate] of Object.entries(changes)) {
    void test(`${label} after await ${at} blocks every later native call`, async () => {
      const state = fixture(); state.onCall = (_, index): void => { if (index === at) { mutate(state); } };
      await assert.rejects(state.run(), /Symbol metadata operation refused at/u);
      assert.equal(state.calls.length, at); assert.equal(state.updates, at >= 17 ? 1 : 0);
    });
  }
}
for (let previous = 1; previous < 22; previous += 1) {
  for (const label of ["actor uuid", "rpc receiver", "window expired"] as const) {
    void test(`${label} queued microtask before call ${previous + 1} prevents invocation`, async () => {
      const state = fixture(); state.afterResolve = (_, index): void => { if (index === previous) { changes[label]?.(state); } };
      await assert.rejects(state.run(), /Symbol metadata operation refused at/u);
      assert.equal(state.calls.length, previous); assert.equal(state.updates, previous >= 17 ? 1 : 0);
    });
  }
}
for (const [field, invalid] of [["client", "c".repeat(16)], ["client", null], ["client", "b".repeat(32)], ["ticket", 101], ["ticket", "100"], ["ticket", Number.NaN]] as const) {
  void test(`final ${field} ${String(invalid)} drift refuses before update`, async () => {
    const state = fixture(); Reflect.set(state, field, invalid);
    await assert.rejects(state.run(), field === "client" ? /WORKER_CLIENT_DRIFT/u : /WORKER_TICKET_DRIFT/u);
    assert.equal(state.updates, 0); assert.equal(state.calls.length, field === "client" ? 15 : 16);
  });
}
for (const time of [expectedWorker.notBeforeMs, expectedWorker.notAfterMs]) {
  void test(`preselected window includes exact endpoint ${time}`, async () => { const state = fixture(); state.clockMs = time; await state.run(); assert.equal(state.updates, 1); });
}
for (const time of [expectedWorker.notBeforeMs - 1, expectedWorker.notAfterMs + 1, Number.NaN, Number.POSITIVE_INFINITY, 1.5]) {
  void test(`invalid or out-of-window clock ${time} refuses before native reads`, async () => {
    const state = fixture(); state.clockMs = time;
    await assert.rejects(state.run(), /WORKER_WINDOW/u); assert.equal(state.calls.length, 0); assert.equal(state.updates, 0);
  });
}
void test("clock moving backward inside fixed interval refuses", async () => {
  const state = fixture(); state.onCall = (_, index): void => { if (index === 16) { state.clockMs -= 1; } };
  await assert.rejects(state.run(), /WORKER_WINDOW/u); assert.equal(state.calls.length, 16); assert.equal(state.updates, 0);
});
for (const at of [1, 12, 14, 15, 16, 17, 22]) {
  for (const drift of [false, true]) {
    void test(`native rejection ${at} with receiver drift ${drift} cannot retry or continue`, async () => {
      const state = fixture(); state.rejectAt = at; state.onCall = (_, index): void => { if (drift && index === at) { changes["rpc receiver"]?.(state); } };
      await assert.rejects(state.run(), /Symbol metadata operation refused at/u);
      assert.equal(state.calls.length, at); assert.equal(state.updates, at >= 17 ? 1 : 0);
    });
  }
}
for (const [field, value] of [["projectUuid", "wrong"], ["client", "B".repeat(16)], ["maxTicket", -1], ["maxTicket", Number.MAX_SAFE_INTEGER],
  ["notBeforeMs", -1], ["notAfterMs", expectedWorker.notBeforeMs - 1], ["notAfterMs", expectedWorker.notBeforeMs + 60_001], ["extra", true]] as const) {
  void test(`strict worker expectation rejects ${field}=${String(value)}`, () => {
    assert.throws(() => buildWorkerBoundProjectSymbolMetadataExpression(plan, context, expectedActor, { ...expectedWorker, [field]: value }), /SYMBOL_WORKER_INPUT/u);
  });
}
void test("worker expectation accessors never run", () => {
  let gets = 0; const input = { ...expectedWorker };
  Object.defineProperty(input, "client", { get(): never { gets += 1; throw new Error("not observable"); } });
  assert.throws(() => buildWorkerBoundProjectSymbolMetadataExpression(plan, context, expectedActor, input), /SYMBOL_WORKER_INPUT/u); assert.equal(gets, 0);
});
void test("worker variant requires a different exact companion PCB", () => {
  for (const document of [{ ...context.document, documentType: 1 }, { ...context.document, uuid: plan.targetUuid }, { ...context.document, tabId: "wrong" }]) {
    assert.throws(() => buildWorkerBoundProjectSymbolMetadataExpression(plan, { ...context, document }, expectedActor, expectedWorker), /SYMBOL_WORKER_INPUT/u);
  }
});
for (const [label, mutate] of Object.entries(changes)) {
  void test(`late synchronous tab read ${label} after final ticket prevents write`, async () => {
    const state = fixture(); const getTabs = state.tabs["getFilterTabs"];
    assert.equal(typeof getTabs, "function");
    let armed = false;
    state.tabs["getFilterTabs"] = function getFilterTabs(this: unknown): unknown {
      assert.ok(typeof getTabs === "function");
      const result: unknown = Reflect.apply(getTabs, this, [[]]);
      if (armed) { armed = false; mutate(state); }
      return result;
    };
    state.onCall = (_, index): void => { if (index === 16) { armed = true; } };
    await assert.rejects(state.run(), /Symbol metadata operation refused at/u);
    assert.equal(state.calls.length, 16); assert.equal(state.updates, 0);
  });
}
for (const field of ["tabId", "data", "documentType", "parentProjectUuid", "parentLibraryUuid", "isUnSaved"] as const) {
  void test(`late peer ${field} change from final dirty-tab callback prevents write`, async () => {
    const state = fixture(); const getTabs = state.tabs["getFilterTabs"];
    assert.ok(typeof getTabs === "function");
    const tabs: unknown = Reflect.apply(getTabs, state.tabs, [[]]); assert.ok(Array.isArray(tabs)); const peer = target(tabs[0]);
    let armed = false;
    state.tabs["isTabUnSaved"] = (): boolean => { if (armed) { armed = false; peer[field] = field === "data" ? { ...target(peer["data"]) } : "changed"; } return false; };
    state.onCall = (_, index): void => { if (index === 16) { armed = true; } };
    await assert.rejects(state.run(), /Symbol metadata operation refused at/u); assert.equal(state.calls.length, 16); assert.equal(state.updates, 0);
  });
}
for (const [label, code] of [["actor uuid", "ACTOR_DRIFT"], ["project object", "WORKER_SCOPE_DRIFT"], ["rpc receiver", "WORKER_RECEIVER_DRIFT"],
  ["Date constructor", "WORKER_DATE_DRIFT"], ["window expired", "WORKER_WINDOW"]] as const) {
  void test(`fixed diagnostic distinguishes ${label}`, async () => {
    const state = fixture(); state.onCall = (_, index): void => { if (index === 16) { changes[label]?.(state); } };
    await assert.rejects(state.run(), new RegExp(`:${code}$`, "u")); assert.equal(state.updates, 0);
  });
}
void test("fixed worker compiler has no Save, cloud getter, callback installation or caller-selectable RPC", () => {
  const code = buildWorkerBoundProjectSymbolMetadataExpression(plan, context, expectedActor, expectedWorker);
  for (const term of ["/api/user", "web.db", ".save(", ".modify(", ".publish(", ".subscribe(", "rpcCall=", "rpcCall ="]) { assert.equal(code.includes(term), false); }
  assert.equal(code.split("'/PrjDB/project/getClient'").length - 1, 1);
  assert.equal(code.split("'/PrjDB/project/getMaxTicket'").length - 1, 1);
  assert.equal(code.split("'/PrjDB/symbol/updateData'").length - 1, 1);
});
