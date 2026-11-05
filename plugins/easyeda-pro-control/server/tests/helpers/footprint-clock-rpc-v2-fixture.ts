/** Synthetic native facade and two independent VM realms. Actual fixed join
 * programs run on real objects; native getter text/metadata are explicitly
 * synthetic. No application, project, native clock service or writer connects. */
/* oxlint-disable import/max-dependencies -- A single synthetic fixture joins both real runners and their unchanged descriptor programs across original shared objects. */
import assert from "node:assert/strict";
import { createContext, runInContext } from "node:vm";
import type { Context } from "node:vm";
import { CURRENT_FOOTPRINT_COPY_DEPENDENCY_PROFILES } from "../../src/current-footprint-copy-dependency-profiles.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_RPC_SOURCE as SOURCE } from "../../src/current-footprint-copy-clock-rpc-source.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_RPC_V2_CALLER as CALLER, CURRENT_FOOTPRINT_COPY_CLOCK_RPC_V2_SITES as SITES } from "../../src/current-footprint-copy-clock-rpc-v2-profile.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_REGISTRATION_V2_SOURCE as REGISTRATION } from "../../src/current-footprint-copy-clock-registration-v2-source.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_RPC_V2_ORDER as ORDER } from "../../src/current-footprint-copy-clock-rpc-v2-protocol.ts";
import type { CurrentFootprintCopyClockRpcV2Command as Command } from "../../src/current-footprint-copy-clock-rpc-v2-protocol.ts";
import type { CurrentFootprintCopyClockRpcV2Event, CurrentFootprintCopyClockRpcV2Transport } from "../../src/current-footprint-copy-clock-rpc-v2-retention.ts";
import type { CurrentFootprintCopyClockRpcConstructionLease } from "../../src/current-footprint-copy-clock-rpc-leases.ts";
import type { CurrentFootprintCopyClockRegistrationV2Command as RegistrationCommand } from "../../src/current-footprint-copy-clock-registration-v2-contract.ts";
import type { CurrentFootprintCopyClockRegistrationV2Transport } from "../../src/current-footprint-copy-clock-registration-v2-runner.ts";

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
Object.defineProperty(BroadcastChannel.prototype,"name",{...Object.getOwnPropertyDescriptor(BroadcastChannel.prototype,"name"),enumerable:true});
nativeText.set(Object.getOwnPropertyDescriptor(BroadcastChannel.prototype,"name").get,"function get name() { [native code] }");
nativeText.set(BroadcastChannel.prototype.postMessage,"function postMessage() { [native code] }");globalThis.BroadcastChannel=BroadcastChannel;`;
function isObject(value: unknown): value is ObjectValue { return value !== null && typeof value === "object"; }
function object(value: unknown): ObjectValue { assert.ok(isObject(value)); return value; }
function array(context: Context, values: readonly unknown[]): unknown[] { const result: unknown = runInContext("[]", context); assert.ok(Array.isArray(result)); result.push(...values); return result; }
function fnApply(fn: unknown, receiver: unknown = null, args: readonly unknown[] = []): unknown { assert.ok(typeof fn === "function"); return Reflect.apply(fn, receiver, args); }
function property(name: string, value: ObjectValue, writable = true, enumerable = true, configurable = true): ObjectValue { return { name, value, writable, enumerable, configurable, isOwn: true }; }
function metadata(role: "push" | "dispatch" | "reply" | "wrapper" | "callback"): ObjectValue {
  const p = role === "callback" || role === "wrapper" ? REGISTRATION[role].function : SOURCE.worker.functions[role];
  let scriptId = "worker-script"; if (role === "callback") { scriptId = "callback-script"; } else if (role === "wrapper") { scriptId = "ui-script"; }
  return { result: [property("name", { type: "string", value: p.name }, false, false), property("length", { type: "number", value: p.arity }, false, false)], internalProperties: [
    { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId, lineNumber: p.lineNumber, columnNumber: p.columnNumber } } },
    { name: "[[Prototype]]", value: { type: "function", className: "Function", objectId: "function-prototype" } },
    { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[2]", objectId: role === "wrapper" ? "wrapper-scopes" : "callback-scopes" } },
  ] };
}
function frameFor(role: keyof typeof SITES): ObjectValue {
  const site = SITES[role]; const scriptId = site.realm === "worker" ? "worker-script" : "ui-script";
  return { callFrameId: "frame", functionName: site.functionName, functionLocation: { scriptId, lineNumber: site.functionLine, columnNumber: site.functionColumn }, location: { scriptId, lineNumber: site.lineNumber, columnNumber: site.columnNumber } };
}
const wrapperSource = "B=>{try{let{message:q,replyTopic:Q}=B;try{let ee=v(q);ee instanceof Promise?ee.then(oe=>{this.publish(Q,{success:!0,result:oe})}).catch(oe=>{console.error(oe),this.publish(Q,{success:!1,err:String(oe)})}):this.publish(Q,{success:!0,result:ee})}catch(ee){this.publish(Q,{success:!1,err:String(ee)})}}finally{this.pull(y,k)}}";
const callerSource = "onReceivedIGive(y,v,k,B,q){console.debug(\"BCMSG(\",this.uuid,\")\",\"from\",y,\"IGIVE\",v,\"id\",k,\"target\",B,\"message\",q);let Q=this.pulled[v];if(Q&&this.uuid===B){let ee=!1;for(;Q.length>0;){let oe=Q.shift();if(oe.running()){oe.execute(q),ee=!0;break}}ee||this.push(v,q),Q.length===0&&delete this.pulled[v]}}";
export const SYNTHETIC_SOURCES = Object.freeze(Object.fromEntries((["wrapper", "callback"] as const).map(role => {
  const profile = REGISTRATION[role]; const body = role === "wrapper" ? wrapperSource : "()=>Date.now()+Jd";
  let source = " ".repeat(profile.bytes); source = source.slice(0, profile.function.start) + body + source.slice(profile.function.end);
  if (role === "wrapper") { source = source.slice(0, CALLER.start) + callerSource + source.slice(CALLER.end); }
  return [role, source];
})));

export function clockRpcV2Fixture(): Readonly<{
  transport: CurrentFootprintCopyClockRpcV2Transport; registrationTransport: CurrentFootprintCopyClockRegistrationV2Transport;
  workerLease: CurrentFootprintCopyClockRpcConstructionLease; construction: ObjectValue; workerSource: object;
  commands: Command[]; registrationCommands: RegistrationCommand[];
  state: { started: boolean; exited: boolean; stage: number; lostResume: boolean; wrongTarget: boolean; reusedUiTask: boolean; changedResult: boolean; lostWorkerLease: boolean; retired: boolean; clockCalls: number; semanticFailures: number };
}> {
  const worker = createContext({}); const ui = createContext({}); runInContext(nativeSetup, worker); runInContext(nativeSetup, ui);
  const dependencyIndexes = Object.fromEntries(CURRENT_FOOTPRINT_COPY_DEPENDENCY_PROFILES.map((value, index) => [value.key, index]));
  runInContext(`class Mb{rpcCall(){}subscribeOnce(){}}class KP extends Mb{${pushSource}${dispatchSource}${replySource}}class JP extends KP{}
class wu{constructor(e,t){this.callback=e,this.unsafe=t,this.isRunning=!0}cancel(){this.callback=null,this.isRunning=!1}running(){return this.isRunning}async execute(e){try{e=this.unsafe?e:op(e),this.callback(e)}catch(t){console.error(t)}}}
const bus=new JP();Object.assign(bus,{uuid:${JSON.stringify(workerUuid)},rpcTicket:0,pushCnt:0,bc:new BroadcastChannel('/tab_1/notify'),pushed:{},subscribed:{}});
const project={},manager={user:undefined,projectManager:project};Object.assign(project,{footprint:manager,wsBus:bus});globalThis.PROJECT=project;globalThis._TAB_ID_='tab_1';globalThis['/tab_1/notify']=bus;
async function qe(){}const lexicals=Array(10).fill(null);lexicals[2]=qe;const dependencies=Array(70).fill(null);dependencies[61]=bus;
dependencies[${String(dependencyIndexes["Mb.rpcCall"])}]=Mb.prototype.rpcCall;dependencies[${String(dependencyIndexes["Mb.subscribeOnce"])}]=Mb.prototype.subscribeOnce;dependencies[${String(dependencyIndexes["KP.push"])}]=KP.prototype.push;
globalThis.refs={bus,project,manager,qe,lexicals,dependencies,createPending:()=>{let s=new wu(null,true),t=r=>{globalThis.resolved=r.result;};s.callback=r=>{s.cancel(),t(r)};return s;}};`, worker);
  runInContext(`let Jd=5;let fixedNow=${String(baseTime - 5)};const actualNow=function now(){return fixedNow;};Date.now=actualNow;nativeText.set(actualNow,'function now() { [native code] }');
const callback=()=>Date.now()+Jd;const k=B=>{try{let{message:q,replyTopic:Q}=B;try{let ee=v(q);ee instanceof Promise?ee.then(oe=>{this.publish(Q,{success:!0,result:oe})}).catch(oe=>{console.error(oe),this.publish(Q,{success:!1,err:String(oe)})}):this.publish(Q,{success:!0,result:ee})}catch(ee){this.publish(Q,{success:!1,err:String(ee)})}}finally{this.pull(y,k)}},wrapper=k;const bus={uuid:${JSON.stringify(uiUuid)},bc:new BroadcastChannel('/tab_1/notify'),pulled:{},pushed:{},subscribed:{}};
class UiTask{constructor(callback){this.callback=callback;this.isRunning=true;this.unsafe=true;}}
const queue=[],initialTask=new UiTask(wrapper);queue.push(initialTask);bus.pulled[${JSON.stringify(topic)}]=queue;
const host={concurrentBus:bus},project={projectId:"a".repeat(64),branchUuid:"b".repeat(32)};host.currentProject=project;globalThis.gVars=host;globalThis._TAB_ID_='tab_1';globalThis['/tab_1/notify']=bus;
const notification=[wrapper,globalThis,host,project,bus,[],{}],route=Array(17).fill({});route[14]=notification;
const getter=Object.getOwnPropertyDescriptor(BroadcastChannel.prototype,'name').get;
const first=[globalThis,host,project,bus,wrapper,queue,initialTask,bus.bc,getter,route],bindings=[callback,bus,Date,Date.now];
globalThis.refs={bus,queue,initialTask,first,bindings,callback,wrapper,UiTask,route,setOffset:value=>{Jd=value;fixedNow=${String(baseTime)}-value;},offset:()=>Jd};`, ui);
  const w = object(worker["refs"]); const u = object(ui["refs"]); const wb = object(w["bus"]); const ub = object(u["bus"]);
  const realms = new Map([["worker", worker], ["ui", ui]]); const objects = new Map<string, unknown>(); const ids = new WeakMap<object, string>(); let serial = 0;
  const register = (value: unknown, preferred?: string): string => { assert.ok(value !== null && (typeof value === "object" || typeof value === "function")); const old = ids.get(value); if (old !== undefined) { return old; }
    serial += 1; const id = preferred ?? `object-${String(serial)}`; objects.set(id, value); ids.set(value, id); return id; };
  for (const [id, value] of [["dependencies", w["dependencies"]], ["project", w["project"]], ["manager", w["manager"]], ["lexicals", w["lexicals"]], ["first", u["first"]], ["bindings", u["bindings"]], ["callback", u["callback"]], ["wrapper", u["wrapper"]], ["route", u["route"]]] as const) { register(value, id); }
  const remote = (value: unknown, context: Context): ObjectValue => {
    if (value === undefined) { return { type: "undefined" }; } if (value === null) { return { type: "object", subtype: "null", value: null }; }
    if (typeof value !== "object" && typeof value !== "function") { return { type: typeof value, value }; }
    if (typeof value === "function") { const describe: unknown = runInContext("Function.prototype.toString", context); return { type: "function", className: "Function", objectId: register(value), description: fnApply(describe, value) }; }
    if (value === wb["bc"] || value === ub["bc"]) { return { type: "object", className: "BroadcastChannel", objectId: register(value) }; }
    return { type: "object", ...(Array.isArray(value) ? { subtype: "array", className: "Array", description: `Array(${String(value.length)})` } : { className: "Object", description: "Object" }), objectId: register(value) };
  };
  const state = { started: false, exited: false, stage: 0, lostResume: false, wrongTarget: false, reusedUiTask: false, changedResult: false, lostWorkerLease: false, retired: false, clockCalls: 0, semanticFailures: 0 };
  const commands: Command[] = [], events: CurrentFootprintCopyClockRpcV2Event[] = [], points = new Map<string, string>(), registrationCommands: RegistrationCommand[] = [];
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
    if (role === "result") { frames.push({ callFrameId: "caller", functionName: "onReceivedIGive", functionLocation: { scriptId, lineNumber: CALLER.functionLine, columnNumber: CALLER.functionColumn }, location: { scriptId, lineNumber: CALLER.lineNumber, columnNumber: CALLER.columnNumber } }); }
    events.push({ method: "Debugger.paused", sessionId: site.realm === "worker" ? "worker" : "ui", params: { reason: "other", hitBreakpoints: [points.get(role)], callFrames: frames } });
  };
  const check = (): void => { assert.equal(state.exited, false); };
  const workerSource = Object.freeze({ profile: "private.current-footprint-copy-clock-rpc-source.v1", realm: "worker", sha256: SOURCE.worker.sha256, invocationObserved: false });
  const current = (): Promise<void> => { check(); assert.equal(state.retired, false); return Promise.resolve(); };
  const cleanupCurrent = (): Promise<void> => { check(); return Promise.resolve(); };
  const workerCurrent = (): Promise<void> => { check(); assert.equal(state.lostWorkerLease, false, "synthetic original worker lease lost"); return Promise.resolve(); };
  const construction = Object.freeze({ issuer: {}, scriptId: "worker-script", projectObjectId: "project", managerObjectId: "manager", lexicalBundleObjectId: "lexicals", dependencyBundleObjectId: "dependencies", qualifiedSource: workerSource, assertOriginal: workerCurrent, assertCleanup: check });
  const workerLease = Object.freeze({ profile: "private.current-footprint-clock-rpc-construction-lease.v1" as const });
  const transport: CurrentFootprintCopyClockRpcV2Transport = {
    assertOriginal: current, assertCleanup: cleanupCurrent,
    assertOriginalGenerationExited: (): Promise<void> => state.exited ? Promise.resolve() : Promise.reject(new Error("synthetic generation remains live")),
    request: (command: Command): Promise<unknown> => {
      commands.push(command); const context = realms.get(command.sessionId); assert.ok(context !== undefined);
      if (command.method === "Debugger.setBreakpoint") { assert.ok(command.role !== undefined); const id = `point-${command.role}`; points.set(command.role, id); return Promise.resolve({ breakpointId: id, actualLocation: command.params["location"] }); }
      if (command.method === "Debugger.evaluateOnCallFrame") {
        const values = command.params["callFrameId"] === "caller" ? callerFrame : currentFrame; assert.ok(Array.isArray(values));
        const expression = String(command.params["expression"]), names = expression.slice(6, -1);
        const select: unknown = runInContext(`(function(${names}){return ${expression};})`, context);
        const argumentsForFrame = values.slice(1), selected = fnApply(select, values[0], argumentsForFrame);
        return Promise.resolve({ result: remote(selected, context) });
      }
      if (command.method === "Runtime.callFunctionOn") { const declaration = command.params["functionDeclaration"]; const args = command.params["arguments"]; assert.equal(typeof declaration, "string"); assert.ok(Array.isArray(args));
        const fn: unknown = runInContext(`(${String(declaration)})`, context); const receiver = objects.get(String(command.params["objectId"]));
        const values = args.map((arg: unknown) => { const selected = object(arg); return "objectId" in selected ? objects.get(String(selected["objectId"])) : selected["value"]; });
        return Promise.resolve({ result: remote(fnApply(fn, receiver, values), context) }); }
      if (command.method === "Runtime.getProperties") {
        const id = String(command.params["objectId"]); if (id === "callback" || id === "wrapper") { return Promise.resolve(metadata(id)); }
        if (id === "wrapper-scopes") {
          const scope = { object: { v: u["callback"], y: topic, k: u["wrapper"] } };
          return Promise.resolve({ result: ["Closure (rpcService)", "Global"].map((description, index) => property(String(index), { type: "object", subtype: "internal#scope", className: "Object", description, objectId: index === 0 ? register(scope) : "global-scope" })) });
        }
        const nativeValue = objects.get(id); const initial = u["first"]; const bindings = u["bindings"]; assert.ok(Array.isArray(initial) && Array.isArray(bindings));
        if (nativeValue === initial[8] || nativeValue === bindings[3]) {
          return Promise.resolve({ result: [property("name", { type: "string", value: nativeValue === initial[8] ? "get name" : "now" }, false, false), property("length", { type: "number", value: 0 }, false, false)], internalProperties: [
            { name: "[[Prototype]]", value: { type: "function", className: "Function", objectId: "native-parent" } },
            { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[0]", objectId: "native-scopes" } }] });
        }
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
    takeEvent: (): CurrentFootprintCopyClockRpcV2Event | null => events.shift() ?? null, fail: (): void => { state.semanticFailures += 1; }, retire: (): Promise<void> => { state.retired = true; return Promise.resolve(); },
  };
  const registrationTransport: CurrentFootprintCopyClockRegistrationV2Transport = { assertCurrent: current, request: async (command): Promise<unknown> => {
    registrationCommands.push(command);
    if (command.method === "Debugger.getScriptSource") { return { scriptSource: SYNTHETIC_SOURCES[command.phase === "wrapper-source" ? "wrapper" : "callback"] }; }
    // The same actual object registry and fixed descriptor evaluator serve both
    // Stages; registration commands are kept out of the RPC counter witness.
    const reply = await transport.request(command, false); commands.pop(); return reply;
  } };
  return Object.freeze({ transport, registrationTransport, workerLease, construction, workerSource, commands, registrationCommands, state });
}
export { documentUuid };
