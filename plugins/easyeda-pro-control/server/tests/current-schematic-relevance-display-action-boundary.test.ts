/** Actual paused Node24 Inspector on the fixed seven-record callback and an
 * inert model. No application owner, setter, SQL or continuation token exists. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { Worker } from "node:worker_threads";
import { fixture } from "./generated-schematic-relevance-display-vm.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_ACTION_CALLBACK as CALLBACK, CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_CAPTURE_FUNCTION as CAPTURE, CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_MODIFY_FUNCTION as MODIFY } from "../src/current-schematic-relevance-display-action-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_STAGE_FUNCTION as BASE } from "../src/generated-schematic-relevance-display-program.ts";

void test("only own seven-record capture/modify use phase variants; shared stages retain their complete bytes", () => {
  assert.notEqual(CAPTURE, BASE); assert.notEqual(MODIFY, BASE);
  assert.equal(CAPTURE.replace("b={root,ui,host,sch,tabs,", "b={ui,host,sch,tabs,"), BASE);
  assert.equal(MODIFY.includes('timeout:0,dependencies:[]'), true);
  assert.equal(CALLBACK.split("debugger;").length - 1, 4);
  // The SDK completion gate has its own result and retained-context pauses.
  assert.equal(MODIFY.split(CALLBACK).length, 2);
  assert.equal(MODIFY.replace(CALLBACK, "").split("debugger;").length - 1, 2);
  assert.ok(MODIFY.includes("const originalCompletionContext=[this,tuple,b,state,before,ownedAction,original,result,originalCompletionWait,originalCompletionResolve]"));
  assert.equal(BASE.includes("debugger;"), false);
});
void test("original callback holds before readers and failure stays held when its private active-action proof is absent", async context => {
  assert.equal(process.versions.node, "24.18.0"); const vm = fixture("action-boundaries"); await vm.call("capture"); await vm.call("preflight");
  const repliesPath = fileURLToPath(new URL("../src/current-schematic-relevance-display-modify-entry-replies.ts", import.meta.url)); const programsPath = fileURLToPath(new URL("../src/current-schematic-relevance-display-action-programs.ts", import.meta.url));
  const worker = new Worker(`const{parentPort}=require("node:worker_threads"),{Session}=require("node:inspector/promises");parentPort.on("message",()=>{});
(async()=>{const{requireCurrentSchematicRelevanceDisplayModifyCallbackSource}=await import(${JSON.stringify(repliesPath)}),{CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_ACTION_MARKERS}=await import(${JSON.stringify(programsPath)}),s=new Session();s.connectToMainThread();await s.post("Debugger.enable");let count=0;const seen=[];
const timer=setTimeout(()=>{void s.post("Debugger.resume").catch(()=>{});parentPort.postMessage({error:"owned callback boundary deadline"});s.disconnect();parentPort.close();},10000);
s.on("Debugger.paused",event=>{void(async()=>{count++;if(count>2)throw Error("unexpected callback pause");const frame=event.params.callFrames[0],expected=CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_ACTION_MARKERS[count===1?0:3];if(frame.location.lineNumber!==expected.lineNumber||frame.location.columnNumber!==expected.columnNumber)throw Error("actual original callback marker mismatch");requireCurrentSchematicRelevanceDisplayModifyCallbackSource(await s.post("Debugger.getScriptSource",{scriptId:frame.location.scriptId}));
const captured=await s.post("Debugger.evaluateOnCallFrame",{callFrameId:frame.callFrameId,expression:'[originalContext.length,typeof originalError,globalThis.callbackReads]',silent:true,throwOnSideEffect:true,returnByValue:true});seen.push(captured.result.value);
await s.post("Debugger.resume");if(count===2){clearTimeout(timer);parentPort.postMessage({seen});s.disconnect();parentPort.close();}})().catch(async error=>{clearTimeout(timer);try{await s.post("Debugger.resume");}catch{}parentPort.postMessage({error:String(error)});s.disconnect();parentPort.close();});});parentPort.postMessage({ready:true});})().catch(error=>{parentPort.postMessage({error:String(error)});parentPort.close();});`, { eval: true });
  context.after(async () => { await worker.terminate(); }); const completed = Promise.withResolvers<unknown>(), original = Promise.withResolvers<unknown>();
  worker.on("error", completed.reject); worker.on("message", (value: unknown): void => {
    if (value !== null && typeof value === "object" && "ready" in value && value.ready === true) { original.resolve(vm.call("modify")); }
    else { completed.resolve(value); }
  });
  const result = await completed.promise; assert.ok(result !== null && typeof result === "object" && "seen" in result, JSON.stringify(result));
  assert.ok(Array.isArray(result.seen)); const entry: unknown = result.seen[0], failure: unknown = result.seen[1]; assert.ok(Array.isArray(entry) && Array.isArray(failure));
  assert.equal(entry[0], 7); assert.equal(entry[1], "undefined"); assert.equal(failure[0], 7); assert.equal(failure[1], "object"); assert.equal(failure[2], entry[2]);
  const actual = await original.promise; assert.ok(actual !== null && typeof actual === "object" && "ok" in actual); assert.equal(actual.ok, false);
  assert.deepEqual(vm.counts(), { setSource: 0, setters: 0, transactions: 1, save: 0 });
});
