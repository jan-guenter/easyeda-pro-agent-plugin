/** Synthetic native facade and two independent VM realms. Actual fixed join
 * programs run on real objects; native getter text/metadata are explicitly
 * synthetic. No application, project, native clock service or writer connects. */
import assert from "node:assert/strict";
import { createContext, runInContext } from "node:vm";
import type { Context } from "node:vm";
import { CURRENT_FOOTPRINT_COPY_DEPENDENCY_PROFILES } from "../../src/current-footprint-copy-dependency-profiles.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_RPC_SITES as SITES, CURRENT_FOOTPRINT_COPY_CLOCK_RPC_SOURCE as SOURCE } from "../../src/current-footprint-copy-clock-rpc-source.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_RPC_ORDER as ORDER } from "../../src/current-footprint-copy-clock-rpc-protocol.ts";
import type { CurrentFootprintCopyClockRpcCommand as Command } from "../../src/current-footprint-copy-clock-rpc-protocol.ts";
import type { CurrentFootprintCopyClockRpcOriginBindings, CurrentFootprintCopyClockRpcOriginEvent } from "../../src/current-footprint-copy-clock-rpc-origin.ts";

type ObjectValue = Record<string, unknown>;
const uiUuid = "22222222-2222-2222-2222-222222222222", workerUuid = "11111111-1111-1111-1111-111111111111";
const topic = "/pro-mgr/serverTime/now"; const documentUuid = "a".repeat(16); const baseTime = 1_700_000_000_123;
// oxlint-disable-next-line eslint/no-template-curly-in-string -- Exact inert vendor method text includes its own runtime interpolation and must retain those bytes.
const pushSource = 'push(e,t){let s=this.pushCnt++;console.debug("BC",this.uuid,"PUSH",e,`(${s})`,t),Ac(this.pushed,e).push({id:s,message:t}),this.broadcastPushedHeadMessage(e)}';
const dispatchSource = 'onReceivedINeed(e,t,s,r){if(console.debug("BCMSG(",this.uuid,")","from",e,"INEED",t,"source",s,"id",r),this.uuid===s){let i=this.pushed[t];if(i&&i[0]&&i[0].id===r){let{message:n}=i.shift();this.broadcastIGive(t,r,e,n),this.broadcastPushedHeadMessage(t),i.length===0&&delete this.pushed[t]}}}';
const replySource = 'onReceivedPublish(e,t,s){console.debug("BCMSG(",this.uuid,")","from",e,"PUBLISH",t,"message",s);let r=this.subscribed[t];if(r){let i;for(let n of r)n.running()?n.execute(s):(i=i||new Array,i.push(n));if(i)for(let n of i)Hg(r,n);r.length===0&&delete this.subscribed[t]}}';
const nativeSetup = String.raw`const nativeText=new WeakMap(),originalString=Function.prototype.toString;
Function.prototype.toString=function(){return nativeText.get(this)??Reflect.apply(originalString,this,[]);};
class BroadcastChannel{constructor(name){this.value=name;}get name(){return this.value;}postMessage(value){void value;}}
nativeText.set(Object.getOwnPropertyDescriptor(BroadcastChannel.prototype,"name").get,"function get name() { [native code] }");
nativeText.set(BroadcastChannel.prototype.postMessage,"function postMessage() { [native code] }");globalThis.BroadcastChannel=BroadcastChannel;`;
function isObject(value: unknown): value is ObjectValue { return value !== null && typeof value === "object"; }
function object(value: unknown): ObjectValue { assert.ok(isObject(value)); return value; }
function array(context: Context, values: readonly unknown[]): unknown[] { const result: unknown = runInContext("[]", context); assert.ok(Array.isArray(result)); result.push(...values); return result; }
function fnApply(fn: unknown, receiver: unknown = null, args: readonly unknown[] = []): unknown { assert.ok(typeof fn === "function"); return Reflect.apply(fn, receiver, args); }
function property(name: string, value: ObjectValue, writable = true, enumerable = true, configurable = true): ObjectValue { return { name, value, writable, enumerable, configurable, isOwn: true }; }
function metadata(role: "push" | "dispatch" | "reply" | "callback"): ObjectValue {
  const p = role === "callback" ? { name: "", arity: 0, lineNumber: 28, columnNumber: 23_421 } : SOURCE.worker.functions[role];
  return { result: [property("name", { type: "string", value: p.name }, false, false), property("length", { type: "number", value: p.arity }, false, false)], internalProperties: [
    { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: role === "callback" ? "ui-script" : "worker-script", lineNumber: p.lineNumber, columnNumber: p.columnNumber } } },
    { name: "[[Prototype]]", value: { type: "function", className: "Function", objectId: "function-prototype" } },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[2]", objectId: "callback-scopes" } },
  ] };
}
function frameFor(role: keyof typeof SITES): ObjectValue {
  const site = SITES[role]; const scriptId = site.realm === "worker" ? "worker-script" : "ui-script";
  return { callFrameId: "frame", functionName: site.functionName, functionLocation: { scriptId, lineNumber: site.functionLine, columnNumber: site.functionColumn }, location: { scriptId, lineNumber: site.lineNumber, columnNumber: site.columnNumber } };
}
export function clockRpcFixture(): Readonly<{
  token: Readonly<{ profile: "private.current-footprint-clock-rpc-origin.v1" }>; binding: CurrentFootprintCopyClockRpcOriginBindings; construction: ObjectValue; registration: ObjectValue;
  workerSource: object; uiSource: object; commands: Command[]; state: { started: boolean; exited: boolean; stage: number; lostResume: boolean; wrongTarget: boolean; reusedUiTask: boolean; changedResult: boolean; lostWorkerLease: boolean; retired: boolean; clockCalls: number; semanticFailures: number };
}> {
  const worker = createContext({}); const ui = createContext({}); runInContext(nativeSetup, worker); runInContext(nativeSetup, ui);
  const dependencyIndexes = Object.fromEntries(CURRENT_FOOTPRINT_COPY_DEPENDENCY_PROFILES.map((value, index) => [value.key, index]));
  runInContext(`class Mb{rpcCall(){}subscribeOnce(){}}class KP extends Mb{${pushSource}${dispatchSource}${replySource}}class JP extends KP{}
class wu{constructor(e,t){this.callback=e,this.unsafe=t,this.isRunning=!0}cancel(){this.callback=null,this.isRunning=!1}running(){return this.isRunning}async execute(e){try{e=this.unsafe?e:op(e),this.callback(e)}catch(t){console.error(t)}}}
const bus=new JP();Object.assign(bus,{uuid:${JSON.stringify(workerUuid)},rpcTicket:0,pushCnt:0,bc:new BroadcastChannel('/tab_1/notify'),pushed:{},subscribed:{}});
const project={},manager={user:undefined,projectManager:project};Object.assign(project,{footprint:manager,wsBus:bus});globalThis.PROJECT=project;globalThis._TAB_ID_='tab_1';globalThis['/tab_1/notify']=bus;
async function qe(){}const lexicals=Array(10).fill(null);lexicals[2]=qe;const dependencies=Array(69).fill(null);dependencies[60]=bus;
dependencies[${String(dependencyIndexes["Mb.rpcCall"])}]=Mb.prototype.rpcCall;dependencies[${String(dependencyIndexes["Mb.subscribeOnce"])}]=Mb.prototype.subscribeOnce;dependencies[${String(dependencyIndexes["KP.push"])}]=KP.prototype.push;
globalThis.refs={bus,project,manager,qe,lexicals,dependencies,createPending:()=>{let s=new wu(null,true),t=r=>{globalThis.resolved=r.result;};s.callback=r=>{s.cancel(),t(r)};return s;}};`, worker);
  runInContext(`let Jd=5;let fixedNow=${String(baseTime - 5)};const actualNow=function now(){return fixedNow;};Date.now=actualNow;nativeText.set(actualNow,'function now() { [native code] }');
const callback=()=>Date.now()+Jd;const wrapper=s=>s;const bus={uuid:${JSON.stringify(uiUuid)},bc:new BroadcastChannel('/tab_1/notify'),pulled:{}};
class UiTask{constructor(callback){this.callback=callback;this.isRunning=true;this.unsafe=true;}}
const queue=[],initialTask=new UiTask(wrapper);queue.push(initialTask);bus.pulled[${JSON.stringify(topic)}]=queue;
const host={concurrentBus:bus},project={};host.currentProject=project;globalThis.gVars=host;globalThis._TAB_ID_='tab_1';
const getter=Object.getOwnPropertyDescriptor(BroadcastChannel.prototype,'name').get;
const first=[globalThis,host,project,bus,wrapper,queue,initialTask,bus.bc,getter,{}],bindings=[callback,bus,Date,Date.now];
globalThis.refs={bus,queue,initialTask,first,bindings,callback,wrapper,UiTask,setOffset:value=>{Jd=value;fixedNow=${String(baseTime)}-value;},offset:()=>Jd};`, ui);
  const w = object(worker["refs"]); const u = object(ui["refs"]); const wb = object(w["bus"]); const ub = object(u["bus"]);
  const realms = new Map([["worker", worker], ["ui", ui]]); const objects = new Map<string, unknown>(); const ids = new WeakMap<object, string>(); let serial = 0;
  const register = (value: unknown, preferred?: string): string => { assert.ok(value !== null && (typeof value === "object" || typeof value === "function")); const old = ids.get(value); if (old !== undefined) { return old; }
    serial += 1; const id = preferred ?? `object-${String(serial)}`; objects.set(id, value); ids.set(value, id); return id; };
  for (const [id, value] of [["dependencies", w["dependencies"]], ["project", w["project"]], ["manager", w["manager"]], ["lexicals", w["lexicals"]], ["first", u["first"]], ["bindings", u["bindings"]], ["callback", u["callback"]]] as const) { register(value, id); }
  const remote = (value: unknown, context: Context): ObjectValue => {
    if (value === undefined) { return { type: "undefined" }; } if (value === null) { return { type: "object", subtype: "null", value: null }; }
    if (typeof value !== "object" && typeof value !== "function") { return { type: typeof value, value }; }
    if (typeof value === "function") { const describe: unknown = runInContext("Function.prototype.toString", context); return { type: "function", className: "Function", objectId: register(value), description: fnApply(describe, value) }; }
    return { type: "object", ...(Array.isArray(value) ? { subtype: "array", className: "Array", description: `Array(${String(value.length)})` } : { className: "Object", description: "Object" }), objectId: register(value) };
  };
  const state = { started: false, exited: false, stage: 0, lostResume: false, wrongTarget: false, reusedUiTask: false, changedResult: false, lostWorkerLease: false, retired: false, clockCalls: 0, semanticFailures: 0 };
  const commands: Command[] = [], events: CurrentFootprintCopyClockRpcOriginEvent[] = [], points = new Map<string, string>();
  let callerFrame: unknown; let currentFrame: unknown; let currentId = 0; let currentMessage: unknown; let currentPending: unknown;
  let currentTopic = ""; let head: unknown[]; let lastUiTask: unknown = null; let replyQueue: unknown[];
  const preparePause = (): void => {
    const role = ORDER[state.stage]; if (role === undefined) { return; } const ordinal = state.stage < 5 ? 1 : 2;
    if (role === "push") {
      currentId = Number(wb["pushCnt"]); wb["pushCnt"] = currentId + 1; const ticket = Number(wb["rpcTicket"]); wb["rpcTicket"] = ticket + 1;
      currentTopic = `_MSG_BUS_RPC_-${topic}-${workerUuid}-${String(ticket)}`; currentMessage = runInContext("({message:undefined,replyTopic:''})", worker); object(currentMessage)["replyTopic"] = currentTopic;
      currentPending = fnApply(w["createPending"]); const entry = object(runInContext("({})", worker)); Object.assign(entry, { id: currentId, message: currentMessage }); head = array(worker, [entry]);
      replyQueue = array(worker, [currentPending]); object(wb["pushed"])[topic] = head; object(wb["subscribed"])[currentTopic] = replyQueue;
      currentFrame = array(worker, [wb, topic, currentMessage, currentId]);
    } else if (role === "dispatch") {
      head.shift(); currentFrame = array(worker, [wb, state.wrongTarget ? workerUuid : uiUuid, topic, workerUuid, currentId, currentMessage, head]);
    } else if (role === "result") {
      const queue = u["queue"]; assert.ok(Array.isArray(queue)); const selected: unknown = queue.shift(); fnApply(u["setOffset"], undefined, [ordinal === 1 ? 5 : 11]);
      const incoming = Object.assign(object(runInContext("({})", ui)), { message: undefined, replyTopic: currentTopic });
      const value = fnApply(u["callback"]); state.clockCalls += 1;
      currentFrame = array(ui, [ub, incoming, undefined, currentTopic, value, u["callback"], topic, u["wrapper"]]);
      callerFrame = array(ui, [ub, workerUuid, topic, currentId, uiUuid, incoming, state.reusedUiTask && ordinal === 2 ? lastUiTask : selected, queue]); lastUiTask = selected;
    } else if (role === "reply") {
      const payload = Object.assign(object(runInContext("({})", worker)), { success: true, result: state.changedResult ? baseTime + 1 : baseTime });
      currentFrame = array(worker, [wb, uiUuid, currentTopic, payload, currentPending, replyQueue]);
    } else { currentFrame = array(worker, [w["manager"], documentUuid, worker["resolved"], w["qe"]]); }
    const site = SITES[role]; const scriptId = site.realm === "worker" ? "worker-script" : "ui-script"; const frames = [frameFor(role)];
    if (role === "push") { frames.push({ callFrameId: "qe", functionName: "qe", functionLocation: { scriptId, lineNumber: 108, columnNumber: 9674 }, location: { scriptId, lineNumber: 108, columnNumber: 9684 } }, frameFor(ordinal === 1 ? "buildString" : "canvasString")); }
    if (role === "result") { frames.push({ callFrameId: "caller", functionName: "onReceivedIGive", functionLocation: { scriptId, lineNumber: 0, columnNumber: 11_387 }, location: { scriptId, lineNumber: 0, columnNumber: 11_589 } }); }
    events.push({ method: "Debugger.paused", sessionId: site.realm === "worker" ? "worker" : "ui", params: { reason: "other", hitBreakpoints: [points.get(role)], callFrames: frames } });
  };
  const check = (): void => { assert.equal(state.exited, false); assert.equal(state.retired, false); };
  const workerSource = Object.freeze({ profile: "private.current-footprint-copy-clock-rpc-source.v1", realm: "worker", sha256: SOURCE.worker.sha256, invocationObserved: false });
  const uiSource = Object.freeze({ profile: "private.current-footprint-copy-clock-rpc-source.v1", realm: "ui", sha256: SOURCE.ui.sha256, invocationObserved: false });
  const current = (): Promise<void> => { check(); return Promise.resolve(); };
  const workerCurrent = (): Promise<void> => { check(); assert.equal(state.lostWorkerLease, false, "synthetic original worker lease lost"); return Promise.resolve(); };
  const construction = Object.freeze({ issuer: {}, scriptId: "worker-script", projectObjectId: "project", managerObjectId: "manager", lexicalBundleObjectId: "lexicals", dependencyBundleObjectId: "dependencies", qualifiedSource: workerSource, assertOriginal: workerCurrent, assertCleanup: check });
  const registration = Object.freeze({ issuer: {}, sessionId: "ui", scriptId: "ui-script", registrationArrayObjectId: "first", bindingsArrayObjectId: "bindings", callbackObjectId: "callback", qualifiedSource: uiSource, assertOriginal: current, assertCleanup: check });
  const token = Object.freeze({ profile: "private.current-footprint-clock-rpc-origin.v1" });
  const binding: CurrentFootprintCopyClockRpcOriginBindings = Object.freeze({ workerLease: { profile: "private.current-footprint-clock-rpc-construction-lease.v1" as const }, registrationLease: { profile: "private.current-footprint-clock-rpc-registration-lease.v1" as const }, workerSessionId: "worker",
    assertOriginal: current, assertCleanup: current,
    assertOriginalGenerationExited: (): Promise<void> => state.exited ? Promise.resolve() : Promise.reject(new Error("synthetic generation remains live")),
    request: (command: Command): Promise<unknown> => {
      commands.push(command); const context = realms.get(command.sessionId); assert.ok(context !== undefined);
      if (command.method === "Debugger.setBreakpoint") { assert.ok(command.role !== undefined); const id = `point-${command.role}`; points.set(command.role, id); return Promise.resolve({ breakpointId: id, actualLocation: command.params["location"] }); }
      if (command.method === "Debugger.evaluateOnCallFrame") { const result = command.params["callFrameId"] === "caller" ? callerFrame : currentFrame; return Promise.resolve({ result: remote(result, context) }); }
      if (command.method === "Runtime.callFunctionOn") { const declaration = command.params["functionDeclaration"]; const args = command.params["arguments"]; assert.equal(typeof declaration, "string"); assert.ok(Array.isArray(args));
        const fn: unknown = runInContext(`(${String(declaration)})`, context); const receiver = objects.get(String(command.params["objectId"]));
        const values = args.map((arg: unknown) => { const selected = object(arg); return "objectId" in selected ? objects.get(String(selected["objectId"])) : selected["value"]; });
        return Promise.resolve({ result: remote(fnApply(fn, receiver, values), context) }); }
      if (command.method === "Runtime.getProperties") {
        const id = String(command.params["objectId"]); if (id === "callback") { return Promise.resolve(metadata("callback")); }
        if (id === "callback-scopes") { const scope = Object.assign(object(runInContext("({object:{}})", ui)), { object: { Ji: ub, Jd: fnApply(u["offset"]) } });
          return Promise.resolve({ result: ["Closure", "Global"].map((description, index) => property(String(index), { type: "object", subtype: "internal#scope", className: "Object", description, objectId: index === 0 ? register(scope) : "global-scope" })) }); }
        const value = objects.get(id); if (typeof value === "function") { for (const role of ["push", "dispatch", "reply"] as const) { const profile = SOURCE.worker.functions[role]; if (value.name === profile.name) { return Promise.resolve(metadata(role)); } } }
        assert.ok(Array.isArray(value)); return Promise.resolve({ result: [...value.map((item: unknown, index: number) => property(String(index), remote(item, context))), property("length", { type: "number", value: value.length }, true, false, false)], internalProperties: [{ name: "[[Prototype]]", value: { type: "object", subtype: "array", className: "Array", objectId: "array-prototype" } }] });
      }
      if (command.method === "Debugger.resume") {
        const role = ORDER[state.stage];
        if (role === "result") { const queue = u["queue"]; assert.ok(Array.isArray(queue)); const task: unknown = runInContext("new refs.UiTask(refs.wrapper)", ui); queue.push(task); }
        if (role === "reply") { const callback = object(currentPending)["callback"]; fnApply(callback, undefined, [{ success: true, result: baseTime }]); }
        events.push({ method: "Debugger.resumed", sessionId: command.sessionId, params: {} }); state.stage += 1; if (state.stage < ORDER.length) { preparePause(); }
        if (state.lostResume) { state.lostResume = false; return Promise.reject(new Error("synthetic lost original resume acknowledgment")); }
      }
      return Promise.resolve({});
    }, pump: (): Promise<void> => { if (state.started && state.stage === 0 && events.length === 0) { preparePause(); } return Promise.resolve(); },
    takeEvent: (): CurrentFootprintCopyClockRpcOriginEvent | null => events.shift() ?? null, fail: (): void => { state.semanticFailures += 1; }, retire: (): Promise<void> => { state.retired = true; return Promise.resolve(); },
  });
  return Object.freeze({ token, binding, construction, registration, workerSource, uiSource, commands, state });
}
export { documentUuid };
