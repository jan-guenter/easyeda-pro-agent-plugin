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
  // Complete public/native qualification and GET-preparation groups exclude
  // Each other in both the original Core/native bind and worker queue guards.
  const publicQualification = ACTIONS["footprint-inverse-get-send"] + ACTIONS["footprint-inverse-get-callback"] + ACTIONS["footprint-inverse-public-call"] + ACTIONS["footprint-inverse-public-preferences"] + ACTIONS["footprint-inverse-ui-own-data"] + ACTIONS["footprint-inverse-lookup-preentry"] + ACTIONS["footprint-inverse-get-rpc-entry"] + ACTIONS["footprint-inverse-get-forwarding"] + ACTIONS["footprint-inverse-get-manager"];
  const nativeTask = ACTIONS["footprint-inverse-native-get-task-sender"] + ACTIONS["footprint-inverse-native-get-task-dependencies"] + ACTIONS["footprint-inverse-native-get-task-callback"] + ACTIONS["footprint-inverse-native-get-task-manager"] + ACTIONS["footprint-inverse-native-get-task-channel"] + ACTIONS["footprint-inverse-native-get-task-forward"];
  const nativeQualification = ACTIONS["footprint-inverse-native-delete-bootstrap"] + ACTIONS["footprint-inverse-native-delete-sender"] + ACTIONS["footprint-inverse-native-delete-registration"] + Math.max(ACTIONS["footprint-inverse-native-get-lookup"], nativeTask);
  const alternate = Math.min(publicQualification, nativeQualification) + Math.min(ACTIONS["footprint-inverse-get-worker"], ACTIONS["footprint-inverse-native-get-worker"]) + Math.min(ACTIONS["footprint-inverse-native-get-lookup"], nativeTask) + Math.min(ACTIONS["footprint-inverse-get-intrinsics"], ACTIONS["footprint-inverse-native-get-task-intrinsics"]) + Math.min(ACTIONS["footprint-inverse-get-native"], ACTIONS["footprint-inverse-native-get-task-accept"]);
  assert.equal(PROFILE.controls, Object.values(ACTIONS).reduce((sum, count) => sum + count, 0) - alternate);
  assert.equal(PROFILE.renderer.nativeDeleteBootstrap.cdpRequests, PROFILE.renderer.uiOwnData.cdpRequests);
  assert.equal(ACTIONS["main-reprove"], 2 * PROFILE.main.total + 2 * PROFILE.main.fenceNormal + 2 * PROFILE.main.polls + PROFILE.renderer.polls + PROFILE.renderer.total + 7);
  assert.equal(PROFILE.deleteInvocationAuthorized, false);
});
void test("inverse original cursor refuses a foreign or running paired worker before any command", async () => {
  for (const fault of ["foreign-target", "running", "service", "debug", "same-session"] as const) {
    let failed = false, polls = 0, requests = 0;
    const controller = new CurrentFootprintInverseWorkerController(Object.freeze({ parentSessionId: "parent", projectUuid, windowTabId,
      bindWorker: () => { requests += 1; return Promise.resolve(); }, request: () => { requests += 1; return Promise.resolve({}); },
      poll: () => { polls += 1; return Promise.resolve(); }, assertCurrent: () => Promise.resolve(), projectSourceHeld: () => Promise.resolve(), coldRequest:()=>Promise.reject(new Error("not an issued cold ingress")), startupCallbackRequest:()=>Promise.reject(new Error("not an issued startup callback")), startupCallbackHeld:()=>Promise.reject(new Error("not an issued startup pause")), initialSyncRequest:()=>Promise.reject(new Error("not an original initial sync")),initialSyncHeld:()=>Promise.reject(new Error("not an original sync pause")),initialCacheRequest:()=>Promise.reject(new Error("not an original initial cache")),initialCacheHeld:()=>Promise.reject(new Error("not an original cache pause")), startupQueueRequest:()=>Promise.reject(new Error("not an original startup queue")), conditionSourceRequest:()=>Promise.reject(new Error("not an original condition source")), timerRequest:()=>Promise.reject(new Error("not an issued timer")), getCompletionRequest:()=>Promise.reject(new Error("unexpected GET completion")),getNativeRequest:()=>Promise.reject(new Error("unexpected GET native observation")),getWorkerRequest:()=>Promise.reject(new Error("unexpected GET preparation")),nativeDeliveryRequest:()=>Promise.reject(new Error("unused original native delivery")),nativeChannelRequest:()=>Promise.reject(new Error("unused original native channel")),ownDataRequest:()=>Promise.reject(new Error("unused native own data")),deleteWorkerPeerRequest:()=>Promise.reject(new Error("unused worker peer")),deleteJobRequest:()=>Promise.reject(new Error("unused delete job")),deleteRpcRequest:()=>Promise.reject(new Error("unused delete RPC")),deleteEntryRequest:()=>Promise.reject(new Error("unused delete entry")),clockWorkerRequest:()=>Promise.reject(new Error("unused clock binding")),deleteEncoderRequest:()=>Promise.reject(new Error("unused encoder")),deleteBindingRequest:()=>Promise.reject(new Error("unused original delete binding")),libraryRequest:()=>Promise.reject(new Error("unused original library request")),libraryHeld:()=>Promise.reject(new Error("unused original library hold")),timerHeld:()=>Promise.reject(new Error("not an issued timer hold")), modelStepRequest:()=>Promise.reject(new Error("not an issued model continuation")),startupIdleReady:()=>false,settleStartupPromises:()=>Promise.reject(new Error("not an original startup settlement")),coldStepRequest:()=>Promise.reject(new Error("not an issued cold continuation")), producerArmRequest: () => Promise.reject(new Error("not an issued producer")), constructionRequest: () => Promise.reject(new Error("not an issued constructor")), constructionHeld: () => Promise.reject(new Error("not an issued constructor")), fail: () => { failed = true; } }));
    const waiter = controller.whenSourceHeld();
    assert.throws(() => controller.queueReferencePreparation(() => { requests += 1; return Promise.resolve(); }));
    assert.throws(() => controller.bindReferenceCursor([1]));
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
