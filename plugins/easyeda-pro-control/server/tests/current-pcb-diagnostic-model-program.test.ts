import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION, CURRENT_PCB_DIAGNOSTIC_MODEL_HANDLER_FUNCTION,
  CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_FUNCTION, decodeCurrentPcbDiagnosticModelReply } from "../src/current-pcb-diagnostic-model-program.ts";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_OBJECT_GROUP, CurrentPcbDiagnosticModelRunner } from "../src/current-pcb-diagnostic-model-runner.ts";
import type { CurrentPcbDiagnosticModelCommand } from "../src/current-pcb-diagnostic-model-runner.ts";
import { CURRENT_PCB_DIAGNOSTIC_MODEL_LOCATIONS, decodeCurrentPcbDiagnosticModelFunction,
  decodeCurrentPcbDiagnosticModelScope, decodeCurrentPcbDiagnosticModelScopeList } from "../src/current-pcb-diagnostic-model-scope.ts";

const SETUP = `(()=>{
globalThis.vendorCalls=0;globalThis.getterReads=0;
class mCe{constructor(){this.compiler={PCB:new Map(),FOOTPRINT:new Map()};}}
class sCe{constructor(unique){Object.assign(this,{unique,maxTicket:80000,isPendChange:false,isLocalChange:false});}}
class A8e{constructor(uuid,unique,type,channel){Object.assign(this,{uuid,consistencyManager:new sCe(unique),channel,_headType:type,isProject:true,isInit:true,canSave:true,isInitIng:false,pendCacheLength:80001,pendCache:{},cache:{},deleteCache:new Map(),sub:[],pendTimer:null,pendPromise:null});channel.compiler[type].set(unique,this);}}
class Zu{constructor(uuid,unique,channel){this.uuid=uuid;this.base=new A8e(uuid,unique,"PCB",channel);this.consistencyManager=this.base.consistencyManager;}}
class XS{constructor(uuid,unique,channel){this.uuid=uuid;this.base=new A8e(uuid,unique,"FOOTPRINT",channel);this.consistencyManager=this.base.consistencyManager;}}
class x{constructor(){this._id="a".repeat(32);this._doctype=3;this.compilerChannel=new mCe();this._compiler=new Zu(this._id,"b".repeat(16),this.compilerChannel);}}
x.env=new x();
Object.defineProperty(x.prototype,"compiler",{get(){getterReads++;throw new Error("LAZY_COMPILER");}});
class aC{}class Al extends aC{constructor(){super();this._uuid="a".repeat(32)+"_"+"c".repeat(16);this.instance=new XS(this._uuid,"d".repeat(16),x.env.compilerChannel);}}
class wi{constructor(){this.map=new Map();const f=new Al();this.map.set(f._uuid,f);this.map.set("e".repeat(32),new aC());}}
wi.manager=new wi();
class FP{constructor(){this.openPcb=true;this.workerName=0;}}
FP.manager=new FP();
class Z1e{constructor(callback){this.isRunning=true;this.callback=callback;}}
class HJ{constructor(){this.messageBus=new Oet();}}
class Oet{constructor(){this.subscribed={};}rpcService(topic,t){this.subscribed[topic]=[new Z1e(`;
const WRAPPER = `(e,r,i)=>{globalThis.vendorCalls++;return t(e,r,i);}`;
const BETWEEN = `)];}}
globalThis.MSG_BUS_PCB=new HJ();
MSG_BUS_PCB.messageBus.rpcService("pcb/saveCompiler",`;
const HANDLER = `async o=>{globalThis.vendorCalls++;return[x,wi,FP,mCe,Zu,XS,A8e,sCe,Al,aC,o];});
globalThis.syntheticState={x,wi,FP};})()`;
function pad(source: string, line: number, column: number): string {
  const lines = source.split("\n");
  const currentColumn = lines.at(-1)?.length ?? 0, currentLine = lines.length - 1;
  assert.ok(currentLine < line || currentLine === line && currentColumn <= column);
  return source + "\n".repeat(line - currentLine) + " ".repeat(column - (currentLine === line ? currentColumn : 0));
}
const wrapperLocation = CURRENT_PCB_DIAGNOSTIC_MODEL_LOCATIONS["rpc-wrapper"];
const handlerLocation = CURRENT_PCB_DIAGNOSTIC_MODEL_LOCATIONS["save-handler"];
const FIXTURE = pad(pad(SETUP, wrapperLocation.lineNumber, wrapperLocation.columnNumber) + WRAPPER + BETWEEN,
  handlerLocation.lineNumber, handlerLocation.columnNumber) + HANDLER;
const result = (value: unknown): unknown => ({ result: { type: "string", value } });

/** Real in-process inspector, no debug TCP listener, native/helper/child process
 * or vendor source execution. Only synthetic originals use these locations.
 */
void test("original Save closure is reachable without pausing or calling its functions", async () => {
  const session = new Session(); session.connect();
  const file = "pcb-model-scope-synthetic.js", name = "pcb-model-scope-synthetic";
  let paused = false, scriptId = "", uniqueContextId = "";
  session.on("Runtime.executionContextCreated", ({ params }): void => {
    if (params.context.name === name && "uniqueId" in params.context && typeof params.context.uniqueId === "string") {
      uniqueContextId = params.context.uniqueId;
    }
  });
  session.on("Debugger.scriptParsed", ({ params }): void => { if (params.url === file) { scriptId = params.scriptId; } });
  session.on("Debugger.paused", (): void => { paused = true; });
  const properties = (objectId: string): Promise<unknown> => session.post("Runtime.getProperties",
    { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
  const call = (objectId: string, functionDeclaration: string, returnByValue: boolean, callbackObjectId?: string): Promise<unknown> =>
    session.post("Runtime.callFunctionOn", { objectId, functionDeclaration, returnByValue,
      ...(callbackObjectId === undefined ? {} : { arguments: [{ objectId: callbackObjectId }] }),
      throwOnSideEffect: true, silent: true, awaitPromise: false, generatePreview: false, userGesture: false });
  try {
    await session.post("Runtime.enable"); await session.post("Debugger.enable");
    const context = createContext({}, { name });
    runInContext(FIXTURE, context, { filename: file, timeout: 1000 });
    assert.notEqual(uniqueContextId, ""); assert.notEqual(scriptId, "");
    // Node's declarations omit the experimental uniqueContextId field and
    // Select their generic void overload; the actual CDP reply is decoded below.
    const wrapperReply = await (session.post("Runtime.evaluate",
      { expression: CURRENT_PCB_DIAGNOSTIC_MODEL_CALLBACK_EXPRESSION, uniqueContextId, returnByValue: false,
        objectGroup: CURRENT_PCB_DIAGNOSTIC_MODEL_OBJECT_GROUP,
        throwOnSideEffect: true, silent: true, awaitPromise: false, generatePreview: false,
        includeCommandLineAPI: false, allowUnsafeEvalBlockedByCSP: false, userGesture: false, timeout: 1000 }) as Promise<unknown>);
    const wrapper = decodeCurrentPcbDiagnosticModelFunction(wrapperReply, "rpc-wrapper");
    const wrapperProperties = await properties(wrapper);
    const wrapperScopes = decodeCurrentPcbDiagnosticModelScopeList(wrapperProperties, scriptId, "rpc-wrapper");
    assert.throws(() => decodeCurrentPcbDiagnosticModelScopeList(wrapperProperties, "foreign", "rpc-wrapper"), /MODEL_SCOPE/u);
    assert.throws(() => decodeCurrentPcbDiagnosticModelScopeList(wrapperProperties, scriptId, "save-handler"), /MODEL_SCOPE/u);
    const wrapperScope = decodeCurrentPcbDiagnosticModelScope(await properties(wrapperScopes), "rpc-wrapper");
    const handler = decodeCurrentPcbDiagnosticModelFunction(await call(wrapperScope, CURRENT_PCB_DIAGNOSTIC_MODEL_HANDLER_FUNCTION, false), "save-handler");
    const handlerScopes = decodeCurrentPcbDiagnosticModelScopeList(await properties(handler), scriptId, "save-handler");
    const handlerScope = decodeCurrentPcbDiagnosticModelScope(await properties(handlerScopes), "save-handler");
    const reply = await call(handlerScope, CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_FUNCTION, true, wrapper);
    const state = decodeCurrentPcbDiagnosticModelReply(reply);
    assert.equal(state.main.uuid, "a".repeat(32)); assert.equal(state.main.maxTicket, 80_000);
    assert.equal(state.main.pendCacheLength, 80_001); assert.equal(state.loadedFootprintCount, 2);
    assert.equal(state.customFootprints.length, 1); assert.equal(state.dynamicCopper.workerName, 0);
    assert.equal(state.dynamicCopper.workerNameMarker, "present");
    assert.equal(state.dynamicCopper.timer, "absent"); assert.equal(state.queueCompletionVerified, false);
    assert.equal(state.completeModelMembershipVerified, false); assert.equal(state.saveAuthorized, false);
    assert.equal(runInContext("vendorCalls+getterReads", context) as unknown, 0); assert.equal(paused, false);
    runInContext('syntheticState.x.env=new Proxy(syntheticState.x.env,{getOwnPropertyDescriptor(target,key){getterReads++;return Reflect.getOwnPropertyDescriptor(target,key)}});', context);
    assert.throws(() => decodeCurrentPcbDiagnosticModelReply(replyWithException()), /MODEL_REPLY/u);
    const refused = await call(handlerScope, CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_FUNCTION, true, wrapper);
    assert.throws(() => decodeCurrentPcbDiagnosticModelReply(refused), /MODEL_REPLY/u);
    assert.equal(runInContext("vendorCalls+getterReads", context) as unknown, 0); assert.equal(paused, false);
    await session.post("Runtime.releaseObjectGroup", { objectGroup: CURRENT_PCB_DIAGNOSTIC_MODEL_OBJECT_GROUP });
    for (const objectId of [wrapper, wrapperScopes, wrapperScope, handler, handlerScopes, handlerScope]) {
      await assert.rejects(properties(objectId), /Could not find object/u);
    }
  } finally { session.disconnect(); }
});

function replyWithException(): unknown { return { result: { type: "undefined" }, exceptionDetails: {} }; }
function snapshot(change = ""): Readonly<{ raw: unknown; getterReads: unknown }> {
  const context = createContext({});
  runInContext(`${FIXTURE};${change}`, context, { timeout: 1000 });
  // A synthetic scope wrapper tests only the fixed reader, not CDP ownership.
  runInContext(`globalThis.scope={object:{...syntheticState,
mCe:syntheticState.x.env.compilerChannel.constructor,Zu:syntheticState.x.env._compiler.constructor,
XS:[...syntheticState.wi.manager.map.values()][0].instance.constructor,
A8e:syntheticState.x.env._compiler.base.constructor,sCe:syntheticState.x.env._compiler.consistencyManager.constructor,
Al:[...syntheticState.wi.manager.map.values()][0].constructor,aC:[...syntheticState.wi.manager.map.values()][1].constructor}};`, context);
  const raw: unknown = runInContext(`(${CURRENT_PCB_DIAGNOSTIC_MODEL_STATE_FUNCTION}).call(scope,MSG_BUS_PCB.messageBus.subscribed["pcb/saveCompiler"][0].callback)`, context, { timeout: 1000 });
  return { raw, getterReads: runInContext("getterReads", context) as unknown };
}

void test("model reader omits private payloads and refuses wrong membership, lazy getters and unsupported raw state", () => {
  const observed = snapshot(`const base=syntheticState.x.env._compiler.base;
base.pendCache["private-document-title"]={};base.cache["private-project-path"]={};
Object.defineProperty(base,"private",{get(){getterReads++;throw new Error("PRIVATE");}});
Object.defineProperty(base.pendCache["private-document-title"],"data",{get(){getterReads++;throw new Error("PAYLOAD");}});`);
  const state = decodeCurrentPcbDiagnosticModelReply(result(observed.raw));
  assert.equal(state.main.pendingDocumentKeyCount, 1); assert.equal(observed.getterReads, 0);
  assert.doesNotMatch(String(observed.raw), /private-|PAYLOAD/u);
  const shortId = snapshot(`const env=syntheticState.x.env;
env._id=env._compiler.uuid=env._compiler.base.uuid="a".repeat(16);
const entries=[...syntheticState.wi.manager.map],custom=entries[0][1],uuid=env._id+"_"+"c".repeat(16);
custom._uuid=custom.instance.uuid=custom.instance.base.uuid=uuid;
syntheticState.wi.manager.map=new Map([[uuid,custom],entries[1]]);`);
  assert.equal(decodeCurrentPcbDiagnosticModelReply(result(shortId.raw)).customFootprints[0]?.uuid, `${"a".repeat(16)}_${"c".repeat(16)}`);
  for (const change of [
    'syntheticState.x.env._compiler.base.channel={};',
    'syntheticState.x.env.compilerChannel.compiler.PCB.clear();',
    'syntheticState.x.env._compiler.base.consistencyManager={};',
    'syntheticState.wi.otherDecodingProjectId="f".repeat(32);',
    'syntheticState.FP.manager.workerName=-0;',
    'Object.defineProperty(syntheticState.x.env._compiler.base,"pendCache",{get(){getterReads++;throw new Error("GETTER")}});',
    'syntheticState.wi.manager.map.set("unexpected",{});',
  ]) { assert.throws(() => snapshot(change), /PCB_DIAGNOSTIC_MODEL_STATE/u, change); }
});

void test("strict model decoders reject forged claims, duplicate keys, exception handles and hostile descriptors", () => {
  const raw = String(snapshot().raw);
  for (const input of [
    replyWithException(), { result: { type: "string", value: raw, objectId: "remote" } },
    result(raw.replace('"loadedFootprintCount":2', '"loadedFootprintCount":0')),
    result(raw.replace('"loadedFootprintCount":2', '"loadedFootprintCount":-0')),
    result(raw.replace('"loadedFootprintCount":2', '"loadedFootprintCount":2,"loadedFootprintCount":2')),
    result(raw.replace('"main":', '"executionAuthorized":true,"main":')),
    result(raw.replace('"workerName":0', '"workerName":null')),
    result(raw.replace(`${"a".repeat(32)}_${"c".repeat(16)}`, `${"a".repeat(64)}_${"c".repeat(16)}`)),
  ]) { assert.throws(() => decodeCurrentPcbDiagnosticModelReply(input), /MODEL_REPLY/u); }
  let reads = 0;
  const accessor = Object.defineProperty({}, "result", { get(): never { reads += 1; throw new Error("GETTER"); } });
  const proxy = new Proxy({}, { ownKeys(): never { reads += 1; throw new Error("PROXY"); } });
  for (const input of [accessor, proxy]) {
    assert.throws(() => decodeCurrentPcbDiagnosticModelReply(input), /MODEL_REPLY/u);
    assert.throws(() => decodeCurrentPcbDiagnosticModelFunction(input, "rpc-wrapper"), /MODEL_SCOPE/u);
    assert.throws(() => decodeCurrentPcbDiagnosticModelScope(input, "save-handler"), /MODEL_SCOPE/u);
  }
  assert.equal(reads, 0);
});

function property(name: string, value: unknown): unknown {
  return { name, value, writable: false, configurable: true, enumerable: false, isOwn: true };
}
function functionProperties(kind: "rpc-wrapper" | "save-handler", scopes: string): unknown {
  const location = CURRENT_PCB_DIAGNOSTIC_MODEL_LOCATIONS[kind];
  return {
    result: [property("length", { type: "number", value: location.parameterCount }),
      property("name", { type: "string", value: "" })],
    internalProperties: [
      { name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location",
        value: { scriptId: "pcb", lineNumber: location.lineNumber, columnNumber: location.columnNumber }, description: "Object" } },
      { name: "[[Prototype]]", value: { type: "function", objectId: "prototype" } },
      { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: "Scopes[2]", objectId: scopes } },
    ],
  };
}
function scopesReply(kind: "rpc-wrapper" | "save-handler", objectId: string): unknown {
  return { result: [kind === "rpc-wrapper" ? "Closure (rpcService)" : "Closure", "Global"].map((description, index) => ({
    name: String(index), value: { type: "object", subtype: "internal#scope", className: "Object", description,
      objectId: index === 0 ? objectId : "global" }, writable: true, configurable: true, enumerable: true, isOwn: true,
  })) };
}
function runnerReplies(): readonly unknown[] {
  return [
    { result: { type: "function", className: "Function", description: "original wrapper", objectId: "wrapper" } },
    functionProperties("rpc-wrapper", "wrapper-scopes"), scopesReply("rpc-wrapper", "wrapper-scope"),
    { result: { type: "function", className: "AsyncFunction", description: "original handler", objectId: "handler" } },
    functionProperties("save-handler", "handler-scopes"), scopesReply("save-handler", "handler-scope"),
    result(snapshot().raw), {},
  ];
}

void test("one-shot model runner emits eight fixed commands and releases only its original group", async () => {
  const commands: CurrentPcbDiagnosticModelCommand[] = [], replies = runnerReplies();
  let guards = 0;
  const runner = new CurrentPcbDiagnosticModelRunner({
    assertCurrent: (): void => { guards += 1; },
    request: (command): Promise<unknown> => {
      assert.ok(Object.isFrozen(command)); assert.ok(Object.isFrozen(command.params));
      commands.push(command); return Promise.resolve(replies[commands.length - 1]);
    },
  }, "pcb", "original-context");
  const state = await runner.observe();
  assert.equal(state.customFootprints.length, 1); assert.equal(guards, 15);
  assert.deepEqual(commands.map(command => command.modelPhase),
    ["wrapper", "properties", "properties", "handler", "properties", "properties", "snapshot", "release"]);
  const first = commands[0], last = commands.at(-1), snapshotCommand = commands[6];
  assert.ok(first?.modelPhase === "wrapper"); assert.equal(first.params.uniqueContextId, "original-context");
  assert.equal(first.params.objectGroup, CURRENT_PCB_DIAGNOSTIC_MODEL_OBJECT_GROUP);
  assert.ok(snapshotCommand?.modelPhase === "snapshot"); assert.deepEqual(snapshotCommand.params.arguments, [{ objectId: "wrapper" }]);
  assert.equal(snapshotCommand.params.objectId, "handler-scope");
  assert.equal(Object.hasOwn(snapshotCommand.params, "timeout"), false);
  assert.ok(last?.modelPhase === "release"); assert.equal(last.params.objectGroup, CURRENT_PCB_DIAGNOSTIC_MODEL_OBJECT_GROUP);
  await assert.rejects(runner.observe(), /MODEL_OBSERVATION/u); assert.equal(commands.length, 8);
});

void test("failed model reads cannot continue to a snapshot, retry, or publish before successful release", async () => {
  for (const failure of ["handler", "release"] as const) {
    const commands: CurrentPcbDiagnosticModelCommand[] = [], replies = runnerReplies();
    const runner = new CurrentPcbDiagnosticModelRunner({
      assertCurrent: (): void => {
        // Synthetic retained owner remains current.
      },
      request: (command): Promise<unknown> => {
        commands.push(command);
        if (command.modelPhase === failure) { return Promise.reject(new Error("SYNTHETIC_TRANSPORT_FAILURE")); }
        return Promise.resolve(command.modelPhase === "release" ? {} : replies[commands.length - 1]);
      },
    }, "pcb", "original-context");
    await assert.rejects(runner.observe(), /SYNTHETIC_TRANSPORT_FAILURE/u);
    assert.equal(commands.at(-1)?.modelPhase, "release");
    assert.equal(commands.filter(command => command.modelPhase === "release").length, 1);
    if (failure === "handler") { assert.equal(commands.some(command => command.modelPhase === "snapshot"), false); }
    await assert.rejects(runner.observe(), /MODEL_OBSERVATION/u);
  }
  let requests = 0;
  const stale = new CurrentPcbDiagnosticModelRunner({
    assertCurrent: (): never => { throw new Error("STALE_OWNER"); },
    request: (): Promise<unknown> => { requests += 1; return Promise.resolve({}); },
  }, "pcb", "original-context");
  await assert.rejects(stale.observe(), /STALE_OWNER/u); assert.equal(requests, 0);
});
