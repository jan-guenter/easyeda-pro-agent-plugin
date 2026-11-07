/** Original-cursor/finite-wire checks only. No native worker is issued. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { CurrentPcbViaSavedLoadController } from "../src/current-pcb-via-saved-load-controller.ts";
import { currentPcbViaSavedLoadBootstrapCases, validateCurrentPcbViaSavedLoadBootstrapCommand } from "../src/current-pcb-via-saved-load-bootstrap-protocol.ts";
import { currentPcbViaSavedLoadWorkerFrame, currentPcbViaSavedLoadWorkerNativeFrame } from "../src/current-pcb-via-saved-load-worker-wire.ts";
import { freezeDeep } from "../src/sqlite-inventory-core.ts";

const projectUuid = "a".repeat(64), url = "https://client/editor?entry=mgr-project-worker.js&cll=&debugOpen=0", windowTabId = "window-original";
const pair = Object.freeze({ targetId: "original-worker", url, title: `project_${projectUuid}_${windowTabId}`, browserSessionId: "browser-worker", pageSessionId: "page-worker" });
void test("saved loader accepts only the same suspended browser/page target and refuses every foreign actor before a bootstrap command", () => {
  for (const fault of ["foreign-target", "running", "service", "debug", "same-session"] as const) {
    let failed = false, requests = 0;
    const controller = new CurrentPcbViaSavedLoadController(Object.freeze({ parentSessionId: "parent", projectUuid, windowTabId,
      bindWorker: () => { requests += 1; return Promise.resolve(); }, request: () => { requests += 1; return Promise.resolve({}); }, poll: () => Promise.resolve(),
      assertCurrent: () => Promise.resolve(), projectSourceHeld: () => Promise.resolve(), fail: () => { failed = true; } }));
    controller.observeEvent({ method: "Target.attachedToTarget", params: { sessionId: pair.browserSessionId, waitingForDebugger: true,
      targetInfo: { type: "worker", targetId: pair.targetId, title: pair.title, url, attached: true } } });
    assert.throws(() => { controller.observeEvent({ method: "Target.attachedToTarget", sessionId: "parent", params: {
      sessionId: fault === "same-session" ? pair.browserSessionId : pair.pageSessionId, waitingForDebugger: fault !== "running",
      targetInfo: { type: fault === "service" ? "service_worker" : "worker", targetId: fault === "foreign-target" ? "foreign" : pair.targetId,
        title: pair.title, url: fault === "debug" ? url.replace("debugOpen=0", "debugOpen=1") : url, attached: true } } }); });
    assert.equal(failed, true); assert.equal(requests, 0); assert.equal(controller.status().projectExecutionAuthorized, false);
  }
});
void test("saved readonly wire omits session selectors and rejects cache-policy weakening, retargeting and final project resume", () => {
  const cases = currentPcbViaSavedLoadBootstrapCases(); assert.equal(cases.length, 22);
  for (const command of cases) {
    const frame = currentPcbViaSavedLoadWorkerFrame(command, 73, pair); const bytes = Buffer.from(`${JSON.stringify(frame)}\0`);
    const native = currentPcbViaSavedLoadWorkerNativeFrame(bytes, command, pair); assert.equal(native["action"], "saved-readback-worker");
    assert.equal(Object.hasOwn(native, "sessionId"), false);
    assert.equal(frame.sessionId, command.phase === "saved-load-run-browser" ? pair.browserSessionId : pair.pageSessionId);
    assert.throws(() => currentPcbViaSavedLoadWorkerNativeFrame(Buffer.from(`${JSON.stringify({ ...frame, sessionId: "foreign" })}\0`), command, pair));
  }
  for (const command of [
    { phase: "saved-load-service-worker", method: "Network.setBypassServiceWorker", params: { bypass: false } },
    { phase: "saved-load-http-cache", method: "Network.setCacheDisabled", params: { cacheDisabled: false } },
    { phase: "saved-load-resume", role: "project", method: "Debugger.resume", params: {} },
  ]) { assert.throws(() => validateCurrentPcbViaSavedLoadBootstrapCommand(freezeDeep(command))); }
});
