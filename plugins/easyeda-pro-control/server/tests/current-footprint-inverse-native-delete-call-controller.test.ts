/** Real original RPC entry and original-event scheduling regressions. */
import assert from "node:assert/strict";
import { test } from "node:test";
import {setImmediate as yieldQueue}from "node:timers/promises";
import {CurrentFootprintInverseNativeDeleteExecutionCallController as ExecutionController}from "../src/current-footprint-inverse-native-delete-execution-call-controller.ts";
import type {CurrentFootprintInverseNativeDeleteExecutionInvocation as ExecutionInvocation}from "../src/current-footprint-inverse-native-delete-execution-call-controller.ts";
import { Worker } from "node:worker_threads";
import { CurrentFootprintInverseNativeDeleteCallController as Controller } from "../src/current-footprint-inverse-native-delete-call-controller.ts";
import type { CurrentFootprintInverseNativeDeleteInvocation } from "../src/current-footprint-inverse-native-delete-call-controller.ts";
import { FOOTPRINT_INVERSE_NATIVE_CALL_INSPECTOR } from "./helpers/footprint-inverse-native-call-fixture.ts";
import { footprintInverseUiRunFixture } from "./helpers/footprint-inverse-ui-run-fixture.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON, readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";

void test("fresh native Call retains the genuine entry and request without resuming the body or issuing authority", async context => {
  const ui = await readConfiguredEasyedaAsset("pro-ui/3.2.198.2800f583/js/ui.js"); if (ui === null) { context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON); return; }
  for (const mode of ["held", "lateGuard", "badSource", "copiedEvent", "duplicatePause", "unexpectedResume", "pendingReadExit"] as const) {
    const worker = new Worker(FOOTPRINT_INVERSE_NATIVE_CALL_INSPECTOR, { eval: true, workerData: { mode, ui: footprintInverseUiRunFixture(ui), collector: new URL("../src/current-footprint-inverse-native-delete-sender-collector.ts", import.meta.url).href, controller: new URL("../src/current-footprint-inverse-native-delete-call-controller.ts", import.meta.url).href, failureHelper: new URL("helpers/inspector-failure.ts", import.meta.url).href } });
    try {
      // oxlint-disable-next-line promise/avoid-new -- The original Inspector worker supplies its own actual pause and result.
      const result: unknown = await new Promise((resolve, reject) => { worker.once("message", resolve); worker.once("error", reject); worker.once("exit", code => { reject(new Error(`Original Inspector worker exited before a result: ${String(code)}`)); }); });
      assert.ok(result !== null && typeof result === "object" && !("error" in result), JSON.stringify(result));
      if (mode === "pendingReadExit") { assert.deepEqual(result, { pendingReadJoined: true, noCleanupRead: true, invokes: 1 }); }
      else if (mode === "lateGuard" || mode === "badSource") { assert.deepEqual(result, { refused: true, invokes: mode === "lateGuard" ? 0 : 1, attemptRetained: true, requestsUnchanged: true }); }
      else { assert.deepEqual(result, { held: true, forgedHoldRefused: true, originalRequestRetained: true, concurrentStartRetained: true, unobservedExitRefused: true, stickyFailure: mode !== "held", runtimeCallIssued: false, runtimeJobIssued: false, dispatchAuthorized: false, requests: 22, invokes: 1, exitChecks: 3 }); }
    } finally { await worker.terminate(); }
  }
});

void test("a synthetic early invocation reply spoils the attempt before probes and never becomes a runtime Call", async () => {
  let requests = 0, submits = 0;
  const controller = new Controller({ receipt: "original_ref", prepared: { roots: "r", context: "c", bus: "b", methods: "m", queue: "q", task: "t", members: "u", taskMethods: "v", prepared: "p", originalRpc: "rpc", callback: "callback", replyTopic: "reply", publicCallConsumed: false, applicationMethodInvoked: false, runtimeJobIssued: false, dispatchAuthorized: false }, sessionId: "original_ui", contextId: 1, uiScriptId: "ui", preparedScriptId: "prepared", current: (): void => { assert.ok(requests <= 1); }, beforeInvoke: (): void => { assert.equal(submits, 0); }, assertOriginalEvent: (): never => { throw new Error("Synthetic data has no original event custody"); }, assertOriginalExit: (): void => { assert.equal(submits, 1); }, poll: (): never => { throw new Error("Early reply reached pause polling"); }, send: (command): Promise<unknown> => { requests += 1; assert.equal(command.method, "Debugger.setBreakpointOnFunctionCall"); return Promise.resolve({ breakpointId: "original_point" }); }, submit: (command): CurrentFootprintInverseNativeDeleteInvocation => { submits += 1; assert.equal(command.phase, "inverse-native-delete-sender-invoke"); return { request: Promise.resolve({ result: { type: "undefined" } }), written: Promise.resolve(), assertOriginalWritten: (): void => { assert.equal(submits, 1); } }; } });
  const pending = controller.start(); await assert.rejects(pending, /INVERSE_NATIVE_DELETE_CALL_CUSTODY/u); assert.equal(controller.start(), pending); await assert.rejects(controller.start()); assert.equal(requests, 1); assert.equal(submits, 1); await controller.settleAfterOriginalExit();
});

void test("execution cleanup joins the original request installed by a still-pending submit after exit",async()=>{
 for(const rejects of[false,true]){
  const submitted=Promise.withResolvers<ExecutionInvocation>();const entered=Promise.withResolvers<null>();const request=Promise.withResolvers<unknown>();
  let checks=0,closed=false,exited=false,requests=0,submits=0;
  const controller=new ExecutionController({receipt:"original_ref",collateral:{tabProof:"original_tab",storageProof:"original_storage"},
   prepared:{roots:"r",context:"c",bus:"b",methods:"m",queue:"q",task:"t",members:"u",taskMethods:"v",prepared:"p",originalRpc:"rpc",callback:"callback",replyTopic:"reply",publicCallConsumed:false,applicationMethodInvoked:false,runtimeJobIssued:false,dispatchAuthorized:false},
   sessionId:"original_ui",contextId:1,uiScriptId:"ui",preparedScriptId:"prepared",
   current:():void=>{assert.ok(requests<=1);},beforeInvoke:():void=>{assert.equal(exited,false);},
   assertOriginalEvent:():never=>{throw new Error("no synthetic event accepted");},assertOriginalExit:():void=>{checks+=1;assert.equal(exited,true);},
   poll:():never=>{throw new Error("exit cleanup polled the renderer");},send:():Promise<unknown>=>{requests+=1;return Promise.resolve({breakpointId:"original_point"});},
   submit:():Promise<ExecutionInvocation>=>{submits+=1;entered.resolve(null);return submitted.promise;}
  });
  const pending=controller.start();const refused=assert.rejects(pending);
  await entered.promise;exited=true;
  const cleanup=controller.settleAfterOriginalExit();const joining=(async():Promise<void>=>{await cleanup;closed=true;})();
  submitted.resolve({request:request.promise,written:Promise.resolve(),assertOriginalWritten:():never=>{throw new Error("exit resumed the invocation");}});
  await refused;await yieldQueue();assert.equal(closed,false);
  if(rejects){request.reject(new Error("original late request failed"));}else{request.resolve({result:{type:"undefined"}});}
  await cleanup;await joining;assert.equal(closed,true);assert.equal(checks,2);assert.equal(requests,1);assert.equal(submits,1);assert.equal(controller.start(),pending);
 }
});
