/** Inert source/cursor checks. No application, native pair or inverse grant. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentFootprintInverseWorkerController } from "../src/current-footprint-inverse-worker-controller.ts";
import { currentFootprintInverseActorNativeFrame, currentFootprintInverseActorWire, currentFootprintInverseParentNativeFrame, currentFootprintInverseParentWire, currentFootprintInverseWorkerNativeFrame, currentFootprintInverseWorkerWire } from "../src/current-footprint-inverse-worker-wire.ts";
import { currentPcbViaSavedLoadBootstrapCases } from "../src/current-pcb-via-saved-load-bootstrap-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_ACTION_LIMITS as ACTIONS, CURRENT_FOOTPRINT_INVERSE_NATIVE_PROFILE as PROFILE } from "../src/current-footprint-inverse-native-profile.ts";

const projectUuid = "a".repeat(64), url = "https://client/editor?entry=mgr-project-worker.js&cll=&debugOpen=0", windowTabId = "original-window";
const pair = Object.freeze({ targetId: "original-worker", browserSessionId: "browser-worker", pageSessionId: "page-worker", url, title: `project_${projectUuid}_${windowTabId}` });
const bytes = (value: unknown): Buffer => Buffer.from(`${JSON.stringify(value)}\0`);
void test("inverse finite frames retain the original pair and refuse final project resume or foreign sessions", () => {
  for (const stage of ["before", "arm", "after"] as const) {
    const id = ["before", "arm", "after"].indexOf(stage) + 1;
    const actor = currentFootprintInverseActorWire(id, stage);
    assert.deepEqual(currentFootprintInverseActorNativeFrame(bytes(actor), stage), { action: "footprint-inverse-actors", requestId: id, actorStage: stage });
    assert.throws(() => currentFootprintInverseActorWire(id + 1, stage));
  }
  const parent = currentFootprintInverseParentWire(28, "parent");
  assert.deepEqual(currentFootprintInverseParentNativeFrame(bytes(parent), "parent"), { action: "footprint-inverse-parent", requestId: 28, sessionId: "parent" });
  const cases = currentPcbViaSavedLoadBootstrapCases(); assert.equal(cases.length, 22);
  for (const command of cases) {
    const frame = currentFootprintInverseWorkerWire(command, 40, pair), native = currentFootprintInverseWorkerNativeFrame(bytes(frame), command, pair);
    assert.equal(native.action, "footprint-inverse-worker"); assert.equal(Object.hasOwn(native, "sessionId"), false);
    assert.throws(() => currentFootprintInverseWorkerNativeFrame(bytes({ ...frame, sessionId: "foreign" }), command, pair));
    assert.throws(() => currentFootprintInverseWorkerNativeFrame(bytes({ ...frame, savedReadbackWorker: true }), command, pair));
  }
  assert.throws(() => currentFootprintInverseWorkerWire({ phase: "saved-load-resume", role: "project", method: "Debugger.resume", params: {} }, 40, pair));
  assert.equal(PROFILE.renderer.sourceHeldPrefix, 64); assert.equal(PROFILE.renderer.generic, 39);
  assert.equal(PROFILE.controls, Object.values(ACTIONS).reduce((sum, count) => sum + count, 0));
  assert.equal(ACTIONS["main-reprove"], 2 * PROFILE.main.total + 2 * PROFILE.main.fenceNormal + 2 * PROFILE.main.polls + PROFILE.renderer.polls + PROFILE.renderer.total + 7);
  assert.equal(PROFILE.deleteInvocationAuthorized, false);
});
void test("inverse original cursor refuses a foreign or running paired worker before any command", async () => {
  for (const fault of ["foreign-target", "running", "service", "debug", "same-session"] as const) {
    let failed = false, polls = 0, requests = 0;
    const controller = new CurrentFootprintInverseWorkerController(Object.freeze({ parentSessionId: "parent", projectUuid, windowTabId,
      bindWorker: () => { requests += 1; return Promise.resolve(); }, request: () => { requests += 1; return Promise.resolve({}); },
      poll: () => { polls += 1; return Promise.resolve(); }, assertCurrent: () => Promise.resolve(), projectSourceHeld: () => Promise.resolve(), producerArmRequest: () => Promise.reject(new Error("not an issued producer")), constructionRequest: () => Promise.reject(new Error("not an issued constructor")), constructionHeld: () => Promise.reject(new Error("not an issued constructor")), fail: () => { failed = true; } }));
    const waiter = controller.whenSourceHeld();
    controller.observeEvent({ method: "Target.attachedToTarget", params: { sessionId: pair.browserSessionId, waitingForDebugger: true,
      targetInfo: { type: "worker", targetId: pair.targetId, title: pair.title, url, attached: true } } });
    assert.throws(() => { controller.observeEvent({ method: "Target.attachedToTarget", sessionId: "parent", params: {
      sessionId: fault === "same-session" ? pair.browserSessionId : pair.pageSessionId, waitingForDebugger: fault !== "running",
      targetInfo: { type: fault === "service" ? "service_worker" : "worker", targetId: fault === "foreign-target" ? "foreign" : pair.targetId,
        title: pair.title, url: fault === "debug" ? url.replace("debugOpen=0", "debugOpen=1") : url, attached: true } } }); });
    await assert.rejects(waiter, /FOOTPRINT_INVERSE_WORKER_CURSOR/u);
    assert.equal(failed, true); assert.equal(requests, 0); assert.equal(polls, 0);
    assert.equal(controller.status().projectExecutionAuthorized, false);
  }
});
