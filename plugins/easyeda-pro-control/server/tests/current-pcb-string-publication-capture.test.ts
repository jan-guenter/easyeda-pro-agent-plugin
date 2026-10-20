import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import type { Context } from "node:vm";
import { z } from "zod";
import { planCurrentPcbStringCreate } from "../src/current-pcb-string-create.ts";
import { planCurrentPcbStringCreateObservation } from "../src/current-pcb-string-create-observation.ts";
import { planCurrentPcbStringPublication } from "../src/current-pcb-string-publication.ts";
import { CURRENT_PCB_STRING_CAPTURE_NATIVE, CURRENT_PCB_STRING_CAPTURE_TOPIC,
  CURRENT_PCB_STRING_PUBLICATION_CAPTURE_ARM_EXPRESSION, CURRENT_PCB_STRING_PUBLICATION_CAPTURE_FINISH_FUNCTION,
  CURRENT_PCB_STRING_PUBLICATION_CAPTURE_READ_FUNCTION, compareCapturedCurrentPcbStringPublication,
  decodeCurrentPcbStringPublicationCapture } from "../src/current-pcb-string-publication-capture.ts";

const FIXTURE = `
globalThis.getterReads=0;globalThis.nativeChanges=0;
const topic=${JSON.stringify(CURRENT_PCB_STRING_CAPTURE_TOPIC)};
const Ac=(o,k)=>o[k]||(o[k]=[]);
const Hg=(a,v)=>{for(let i=0;i<a.length;i++)if(a[i]===v)a.splice(i--,1);};
class wu{constructor(e,t){this.callback=e;this.unsafe=t;this.isRunning=true;}
${CURRENT_PCB_STRING_CAPTURE_NATIVE.cancel}
${CURRENT_PCB_STRING_CAPTURE_NATIVE.running}
${CURRENT_PCB_STRING_CAPTURE_NATIVE.execute}}
class KP{constructor(){this.subscribed={};this.uuid="11111111-1111-4111-8111-111111111111";}
${CURRENT_PCB_STRING_CAPTURE_NATIVE.subscribe}
${CURRENT_PCB_STRING_CAPTURE_NATIVE.received}}
class JP extends KP{constructor(){super();this.bc={};}}
class Lg{constructor(){this.uuid="a".repeat(64);this._branchUuid="b".repeat(32);this.workerBus=new JP();
this.consistencyManager={remoteChange(){nativeChanges++;}};}
install(){this.workerBus.subscribe(topic,${CURRENT_PCB_STRING_CAPTURE_NATIVE.callback});}}
globalThis.PROJECT=new Lg();PROJECT.install();globalThis._TAB_ID_="window_1";
globalThis["/window_1/project/"+PROJECT.uuid]=PROJECT.workerBus;
globalThis.originalTask=PROJECT.workerBus.subscribed[topic][0];
globalThis.payload=[{["d".repeat(16)]:{type:"PCB",pend:[["e".repeat(16),2,"STRING",'{"layer":3}']]}},"client","token","d".repeat(16)];
`;
const remoteResult = z.object({ type: z.literal("object"), objectId: z.string().min(1) });
const armReply = z.object({ result: remoteResult }).strict();
function fixture(change = ""): Context {
  const context = createContext({}, { name: "pcb-string-publication-capture-synthetic" });
  runInContext(FIXTURE + change, context, { timeout: 1000 });
  return context;
}
function arm(context: Context): void {
  // VM tests retain a test-local global solely to invoke the fixed handle calls.
  // The actual program never installs a global handle; CDP test below retains
  // Its original objectId without that convenience.
  runInContext(`globalThis.captureHandle=${CURRENT_PCB_STRING_PUBLICATION_CAPTURE_ARM_EXPRESSION}`, context, { timeout: 1000 });
}
function read(context: Context, finish = false): ReturnType<typeof decodeCurrentPcbStringPublicationCapture> {
  const source = finish ? CURRENT_PCB_STRING_PUBLICATION_CAPTURE_FINISH_FUNCTION : CURRENT_PCB_STRING_PUBLICATION_CAPTURE_READ_FUNCTION;
  const value: unknown = runInContext(`(${source}).call(captureHandle)`, context, { timeout: 1000 });
  return decodeCurrentPcbStringPublicationCapture({ result: { type: "string", value } });
}
function publish(context: Context): void {
  runInContext('PROJECT.workerBus.onReceivedPublish("foreign-sender",topic,payload)', context, { timeout: 1000 });
}

void test("append-only capture preserves native order and exact post-handler payload including duplicates", () => {
  const context = fixture(); arm(context);
  assert.equal(runInContext("PROJECT.workerBus.subscribed[topic][0]===originalTask", context) as unknown, true);
  publish(context); publish(context);
  const captured = read(context);
  assert.equal(captured.events.length, 2);
  assert.equal(captured.events[0]?.payloadJson, captured.events[1]?.payloadJson);
  assert.equal(captured.events[0]?.payloadJson,
    JSON.stringify([{ ["d".repeat(16)]: { type: "PCB", pend: [["e".repeat(16), 2, "STRING", '{"layer":3}']], length: 0 } },
      "client", "token", "d".repeat(16)]));
  assert.equal(captured.originalPublicationVerified, false);
  assert.equal(captured.workerHandlerSucceeded, false);
  assert.equal(captured.observedSubscriptionIntervalComplete, false);
  assert.equal(runInContext("nativeChanges", context) as unknown, 2);
  const terminal = read(context, true);
  assert.equal(terminal.observedSubscriptionIntervalComplete, true);
  assert.equal(terminal.cleanup, "cancelled-tombstone-retained");
  assert.equal(terminal.executionAuthorized, false);
  assert.equal(runInContext("PROJECT.workerBus.subscribed[topic].length", context) as unknown, 2);
  assert.equal(runInContext("originalTask.callback!==null&&originalTask.isRunning", context) as unknown, true);
  assert.equal(runInContext("PROJECT.workerBus.subscribed[topic][1].callback===null", context) as unknown, true);
  assert.throws(() => read(context, true), /PCB_STRING_CAPTURE_STATE/u);
});

void test("capture retains bounded failures and refuses completeness on overflow or hostile payload descriptors", () => {
  const context = fixture(); arm(context);
  for (let i = 0; i < 18; i += 1) { publish(context); }
  const overflow = read(context, true);
  assert.equal(overflow.events.length, 16);
  assert.equal(overflow.observedCallbacks, 17);
  assert.equal(overflow.callbackCountExact, false);
  assert.equal(overflow.firstFailure, "CAPACITY");
  assert.equal(overflow.observedSubscriptionIntervalComplete, false);
  const hostile = fixture(); arm(hostile);
  // Native loops still see the ordinary document fields. Observer must never
  // Invoke this unrelated accessor while copying the exact delivered payload.
  runInContext('Object.defineProperty(payload[0]["d".repeat(16)],"secret",{enumerable:true,get(){getterReads++;return "private";}})', hostile);
  publish(hostile);
  const refused = read(hostile, true);
  assert.equal(refused.firstFailure, "PAYLOAD");
  assert.equal(refused.events[0]?.error, "PAYLOAD");
  assert.equal(refused.observedSubscriptionIntervalComplete, false);
  assert.equal(runInContext("getterReads", hostile) as unknown, 0);
});

void test("reply bound includes the second JSON escaping layer without truncating admissible raw payloads", () => {
  const context = fixture(); arm(context);
  runInContext('payload[0]["d".repeat(16)].extra=String.fromCharCode(92).repeat(3500)', context);
  for (let index = 0; index < 9; index += 1) { publish(context); }
  const captured = read(context, true);
  assert.equal(captured.events.length, 9);
  assert.equal(captured.firstFailure, null);
  assert.ok(captured.totalPayloadBytes <= 65_536);
  assert.equal(captured.observedSubscriptionIntervalComplete, true);
});

void test("arm refuses additional native peers, substituted methods and accessors before subscribing", () => {
  for (const change of [
    'PROJECT.workerBus.subscribe(topic,()=>{});',
    'KP.prototype.subscribe=function(){throw new Error("not-native");};',
    'originalTask.callback=()=>{};',
    'originalTask.unsafe=false;',
    'originalTask.running=()=>true;',
    'originalTask.execute=()=>{};',
    'originalTask.cancel=()=>{};',
    'Object.defineProperty(originalTask,"isRunning",{value:true,writable:false});',
    'PROJECT.workerBus.subscribe=KP.prototype.subscribe;',
    'Object.defineProperty(PROJECT,"workerBus",{get(){getterReads++;return {};}});',
  ]) {
    const context = fixture(change);
    assert.throws(() => { arm(context); }, /PCB_STRING_CAPTURE_STATE/u, change);
    assert.equal(runInContext("getterReads", context) as unknown, 0);
  }
});

void test("cleanup drift is explicit and never cancels another task or splices peers", () => {
  for (const change of [
    'PROJECT.workerBus.subscribed[topic].push(new wu(()=>{},true));',
    'wu.prototype.cancel=function(){throw new Error("foreign");};',
    'PROJECT.uuid="f".repeat(64);',
  ]) {
    const context = fixture(); arm(context); publish(context); runInContext(change, context);
    const terminal = read(context, true);
    assert.equal(terminal.cleanup, "unresolved");
    assert.equal(terminal.firstFailure, "CLEANUP");
    assert.equal(terminal.observedSubscriptionIntervalComplete, false);
    assert.equal(runInContext("originalTask.isRunning", context) as unknown, true);
    assert.equal(runInContext("PROJECT.workerBus.subscribed[topic][1].isRunning", context) as unknown, true);
    assert.throws(() => read(context, true), /PCB_STRING_CAPTURE_STATE/u);
  }
});

void test("own observer task overrides cannot hide missed delivery behind a complete interval", () => {
  for (const property of ["running", "execute", "cancel"]) {
    const context = fixture(); arm(context);
    runInContext(`PROJECT.workerBus.subscribed[topic][1][${JSON.stringify(property)}]=()=>true`, context);
    publish(context);
    const result = read(context, true);
    assert.equal(result.cleanup, "unresolved");
    assert.equal(result.observedSubscriptionIntervalComplete, false);
    assert.equal(runInContext("originalTask.isRunning", context) as unknown, true);
  }
});

void test("late retained callback invalidates count exactness and completion without changing the closed interval count", () => {
  const context = fixture(); arm(context);
  runInContext("globalThis.retainedCallback=PROJECT.workerBus.subscribed[topic][1].callback", context);
  publish(context);
  const terminal = read(context, true);
  assert.equal(terminal.observedCallbacks, 1);
  assert.equal(terminal.callbackCountExact, true);
  runInContext("retainedCallback(payload);retainedCallback(payload)", context);
  const late = read(context);
  assert.equal(late.observedCallbacks, 1);
  assert.equal(late.events.length, 1);
  assert.equal(late.lateCallbackObserved, true);
  assert.equal(late.firstFailure, "LATE_CALLBACK");
  assert.equal(late.callbackCountExact, false);
  assert.equal(late.observedSubscriptionIntervalComplete, false);
});

void test("strict snapshot decoder refuses forged totals, duplicate keys and hostile envelopes", () => {
  const context = fixture(); arm(context); publish(context);
  const raw: unknown = runInContext(`(${CURRENT_PCB_STRING_PUBLICATION_CAPTURE_READ_FUNCTION}).call(captureHandle)`, context);
  assert.equal(typeof raw, "string"); if (typeof raw !== "string") { throw new TypeError("fixture"); }
  for (const changed of [
    raw.replace('"observedCallbacks":1', '"observedCallbacks":2'),
    raw.replace('"observedCallbacks":1', '"observedCallbacks":1,"observedCallbacks":1'),
    raw.replace('"observedSubscriptionIntervalComplete":false', '"observedSubscriptionIntervalComplete":true'),
    raw.replace('"schema":', '"executionAuthorized":true,"schema":'),
  ]) {
    assert.throws(() => decodeCurrentPcbStringPublicationCapture({ result: { type: "string", value: changed } }), /PCB_STRING_CAPTURE_REPLY/u);
  }
  let reads = 0;
  const getter = Object.defineProperty({}, "result", { get(): never { reads += 1; throw new Error("getter"); } });
  const proxy = new Proxy({}, { ownKeys(): never { reads += 1; throw new Error("proxy"); } });
  for (const value of [getter, proxy]) { assert.throws(() => decodeCurrentPcbStringPublicationCapture(value), /PCB_STRING_CAPTURE_REPLY/u); }
  assert.equal(reads, 0);
});

void test("supplied delivered projection permits only source-derived length=0 while retaining exact raw hashes", () => {
  const project = "a".repeat(64), target = "d".repeat(16);
  const candidate = planCurrentPcbStringCreate({ x: 120, y: -450, text: "Captured text" });
  const create = planCurrentPcbStringCreateObservation(candidate, { projectUuid: project, branchUuid: "b".repeat(32),
    documentUuid: target, tabId: `${target}@${project}` });
  const plan = planCurrentPcbStringPublication(candidate, create, { primitiveId: "e".repeat(16),
    client: "f".repeat(16), uniqueId: "c".repeat(16), maximumTicket: 1 });
  const context = fixture(); arm(context);
  runInContext(`payload=${JSON.stringify(plan.expectedPayload)}`, context); publish(context);
  const value: unknown = runInContext(`(${CURRENT_PCB_STRING_PUBLICATION_CAPTURE_FINISH_FUNCTION}).call(captureHandle)`, context);
  const raw = { result: { type: "string", value } };
  const compared = compareCapturedCurrentPcbStringPublication(plan, raw);
  assert.equal(compared.suppliedDeliveredPayloadMatchesPrediction, true);
  assert.equal(compared.capture.deliveredPayloadSha256s[0]?.length, 64);
  assert.equal(compared.capture.originalPublicationVerified, false);
  assert.notEqual(compared.capture.deliveredPayloadSha256s[0], compared.publicationProjectionSha256);
  assert.throws(() => compareCapturedCurrentPcbStringPublication(structuredClone(plan), raw), /original/u);
  let getterReads = 0;
  const getter = Object.defineProperty({ ...plan }, "expectedPayload", { get(): never { getterReads += 1; throw new Error("getter"); } });
  assert.throws(() => compareCapturedCurrentPcbStringPublication(getter, raw), /PCB_STRING_CAPTURE_PUBLICATION/u);
  assert.equal(getterReads, 0);
  for (const change of ['payload[0]["d".repeat(16)].extra=true;', 'payload[0]["d".repeat(16)].pend[0][3]+=" ";']) {
    const altered = fixture(); arm(altered);
    runInContext(`payload=${JSON.stringify(plan.expectedPayload)};${change}`, altered); publish(altered);
    const otherValue: unknown = runInContext(`(${CURRENT_PCB_STRING_PUBLICATION_CAPTURE_FINISH_FUNCTION}).call(captureHandle)`, altered);
    assert.throws(() => compareCapturedCurrentPcbStringPublication(plan, { result: { type: "string", value: otherValue } }));
  }
});

void test("original remote object handle supports a V8 effect-checked read without a global capture cache", async () => {
  const session = new Session(); session.connect();
  let uniqueContextId = "";
  session.on("Runtime.executionContextCreated", ({ params }): void => {
    if (params.context.name === "pcb-string-publication-capture-synthetic" &&
        "uniqueId" in params.context && typeof params.context.uniqueId === "string") { uniqueContextId = params.context.uniqueId; }
  });
  try {
    await session.post("Runtime.enable"); const context = fixture();
    assert.notEqual(uniqueContextId, "");
    // Node's protocol declarations omit uniqueContextId and select a void
    // Overload. The actual CDP response has the ordinary evaluate envelope.
    const armedRaw = await (session.post("Runtime.evaluate", {
      expression: CURRENT_PCB_STRING_PUBLICATION_CAPTURE_ARM_EXPRESSION, uniqueContextId,
      returnByValue: false, silent: true, awaitPromise: false, generatePreview: false,
    }) as Promise<unknown>);
    const armed = armReply.parse(armedRaw);
    const objectId = armed.result.objectId;
    assert.equal(runInContext('Object.hasOwn(globalThis,"captureHandle")', context) as unknown, false);
    publish(context);
    const captured = await (session.post("Runtime.callFunctionOn", { objectId,
      functionDeclaration: CURRENT_PCB_STRING_PUBLICATION_CAPTURE_READ_FUNCTION,
      returnByValue: true, throwOnSideEffect: true, silent: true, awaitPromise: false, generatePreview: false }) as Promise<unknown>);
    assert.equal(decodeCurrentPcbStringPublicationCapture(captured).events.length, 1);
    const finished = await (session.post("Runtime.callFunctionOn", { objectId,
      functionDeclaration: CURRENT_PCB_STRING_PUBLICATION_CAPTURE_FINISH_FUNCTION,
      returnByValue: true, silent: true, awaitPromise: false, generatePreview: false }) as Promise<unknown>);
    assert.equal(decodeCurrentPcbStringPublicationCapture(finished).cleanup, "cancelled-tombstone-retained");
    await session.post("Runtime.releaseObject", { objectId });
  } finally { session.disconnect(); }
});
