/** Real original RPC entry and original-event scheduling regressions. */
import { currentFootprintInverseNativeGetTaskSenderNativeSource } from "../src/current-footprint-inverse-native-get-task-sender-native.ts";
import assert from "node:assert/strict";
import { test } from "node:test";
import { Worker } from "node:worker_threads";
import { CurrentFootprintInverseNativeGetTaskCallController as Controller, assertOriginalCurrentFootprintInverseNativeGetTaskCallController as assertOriginal } from "../src/current-footprint-inverse-native-get-task-call-controller.ts";
import type { CurrentFootprintInverseNativeGetTaskInvocation } from "../src/current-footprint-inverse-native-get-task-call-controller.ts";
import { FOOTPRINT_INVERSE_NATIVE_GET_TASK_CALL_INSPECTOR } from "./helpers/footprint-inverse-native-get-task-call-fixture.ts";
import { footprintInverseUiRunFixture } from "./helpers/footprint-inverse-ui-run-fixture.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";

const inert = (): void => {
  // This fixture has no original application grant.
};

void test("fresh native Call retains the genuine entry and request without resuming the body or issuing authority", async context => {
  const ui = await readConfiguredEasyedaAsset("pro-ui/3.2.198.2800f583/js/ui.js"); if (ui === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
  for (const mode of ["held", "lateGuard", "badSource", "copiedEvent", "duplicatePause", "unexpectedResume", "pendingReadExit"] as const) {
    const worker = new Worker(FOOTPRINT_INVERSE_NATIVE_GET_TASK_CALL_INSPECTOR, { eval: true, workerData: { mode, ui: footprintInverseUiRunFixture(ui).replace('w.messageBus.rpcService("/PrjDB/footprint/delete",()=>true)', 'w.messageBus.rpcService("/PrjDB/footprint/getData",()=>true)'), collector: new URL("../src/current-footprint-inverse-native-get-task-sender-collector.ts", import.meta.url).href, controller: new URL("../src/current-footprint-inverse-native-get-task-call-controller.ts", import.meta.url).href, failureHelper: new URL("helpers/inspector-failure.ts", import.meta.url).href } });
    try {
      // oxlint-disable-next-line promise/avoid-new -- The original Inspector worker supplies its own actual pause and result.
      const result: unknown = await new Promise((resolve, reject) => { worker.once("message", resolve); worker.once("error", reject); worker.once("exit", code => { reject(new Error(`Original Inspector worker exited before a result: ${String(code)}`)); }); });
      assert.ok(result !== null && typeof result === "object" && !("error" in result), JSON.stringify(result));
      if (mode === "pendingReadExit") { assert.deepEqual(result, { pendingReadJoined: true, noCleanupRead: true, invokes: 1 }); }
      else if (mode === "lateGuard" || mode === "badSource") { assert.deepEqual(result, { refused: true, invokes: mode === "lateGuard" ? 0 : 1, attemptRetained: true, requestsUnchanged: true }); }
      else { assert.ok("preparationOrder" in result && "entryOrder" in result); const source = currentFootprintInverseNativeGetTaskSenderNativeSource(); const match = /NativeGetTaskOrder=\{([^}]+)\}/u.exec(source); assert.ok(match !== null && match[1] !== undefined); const expected: unknown = JSON.parse(`[${match[1].replaceAll('@"', '"')}]`); assert.ok(Array.isArray(expected)); assert.deepEqual(result.preparationOrder, expected.slice(2, 61)); assert.deepEqual(result.entryOrder, expected.slice(61)); const rest = { ...result }; Reflect.deleteProperty(rest, "preparationOrder"); Reflect.deleteProperty(rest, "entryOrder"); assert.deepEqual(rest, { held: true, forgedHoldRefused: true, originalRequestRetained: true, concurrentStartRetained: true, unobservedExitRefused: true, stickyFailure: mode !== "held", runtimeCallIssued: false, runtimeJobIssued: false, dispatchAuthorized: false, requests: 22, invokes: 1, exitChecks: 3 }); }
    } finally { await worker.terminate(); }
  }
});

void test("a synthetic early invocation reply spoils the attempt before probes and never becomes a runtime Call", async () => {
  let requests = 0, submits = 0;
  const controller = new Controller({ receipt: "original_ref", prepared: { roots: "r", context: "c", bus: "b", methods: "m", queue: "q", task: "t", members: "u", taskMethods: "v", prepared: "p", originalRpc: "rpc", callback: "callback", replyTopic: "reply", publicCallConsumed: false, applicationMethodInvoked: false, runtimeJobIssued: false, dispatchAuthorized: false }, sessionId: "original_ui", contextId: 1, uiScriptId: "ui", preparedScriptId: "prepared", current: (): void => { assert.ok(requests <= 1); }, beforeInvoke: (): void => { assert.equal(submits, 0); }, assertOriginalEvent: (): never => { throw new Error("Synthetic data has no original event custody"); }, assertOriginalExit: (): void => { assert.equal(submits, 1); }, poll: (): never => { throw new Error("Early reply reached pause polling"); }, send: (command): Promise<unknown> => { requests += 1; assert.equal(command.method, "Debugger.setBreakpointOnFunctionCall"); return Promise.resolve({ breakpointId: "original_point" }); }, submit: (command): CurrentFootprintInverseNativeGetTaskInvocation => { submits += 1; assert.equal(command.phase, "inverse-native-get-task-sender-invoke"); return { request: Promise.resolve({ result: { type: "undefined" } }), written: Promise.resolve(), assertOriginalWritten: (): void => { assert.equal(submits, 1); } }; } });
  const pending = controller.start(); await assert.rejects(pending, /INVERSE_NATIVE_GET_TASK_CALL_CUSTODY/u); assert.equal(controller.start(), pending); await assert.rejects(controller.start()); assert.equal(requests, 1); assert.equal(submits, 1); await controller.settleAfterOriginalExit();
});

void test("the task Call controller rejects copied instances, Proxy traps and changed prototype members", () => {
  const original = new Controller({ receipt: "original_ref", prepared: { roots: "r", context: "c", bus: "b", methods: "m", queue: "q", task: "t", members: "u", taskMethods: "v", prepared: "p", originalRpc: "rpc", callback: "callback", replyTopic: "reply", publicCallConsumed: false, applicationMethodInvoked: false, runtimeJobIssued: false, dispatchAuthorized: false }, sessionId: "original_ui", contextId: 1, uiScriptId: "ui", preparedScriptId: "prepared", current: inert, beforeInvoke: inert, assertOriginalEvent: inert, assertOriginalExit: inert, poll: (): Promise<void> => Promise.resolve(), send: (): Promise<unknown> => Promise.resolve({}), submit: (): never => { throw new Error("No original request exists"); } });
  assertOriginal(original); assert.throws(() => Reflect.apply(assertOriginal, undefined, [{}])); let traps = 0;
  const proxy = new Proxy(original, { get: (): never => { traps += 1; throw new Error("Proxy trap must stay unused"); }, getPrototypeOf: (): never => { traps += 1; throw new Error("Proxy trap must stay unused"); } }); assert.throws(() => { assertOriginal(proxy); }); assert.equal(traps, 0);
  const descriptor = Object.getOwnPropertyDescriptor(Controller.prototype, "start"); assert.ok(descriptor !== undefined);
  try { Object.defineProperty(Controller.prototype, "start", { ...descriptor, value: inert }); assert.throws(() => { assertOriginal(original); }); } finally { Object.defineProperty(Controller.prototype, "start", descriptor); } assertOriginal(original);
});
