/** Inert transport composition. Fixed recipes run in a synthetic realm;
 * timer/source metadata and held frames are supplied test data, never owners. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { collectCurrentSchematicRelevanceModifyReturnBatchReturned as collectBatchReturned, collectCurrentSchematicRelevanceModifyReturnBefore as collectBefore, collectCurrentSchematicRelevanceModifyReturnCleared as collectCleared, collectCurrentSchematicRelevanceModifyReturnHandlerReturned as collectHandlerReturned, collectCurrentSchematicRelevanceModifyReturnIntroduced as collectIntroduced, collectCurrentSchematicRelevanceModifyReturnRemoteReturned as collectRemoteReturned, collectCurrentSchematicRelevanceModifyReturnTimerEntry as collectTimerEntry, collectCurrentSchematicRelevanceModifyReturnWebsocket as collectWebsocket, collectCurrentSchematicRelevanceModifyReturnWebsocketReturned as collectWebsocketReturned } from "../src/current-schematic-relevance-modify-return-collector.ts";
import type { CurrentSchematicRelevanceModifyReturnHost as Host, CurrentSchematicRelevanceModifyReturnInputs as Inputs } from "../src/current-schematic-relevance-modify-return-collector.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_RETURN_PROGRAMS as P } from "../src/current-schematic-relevance-modify-return-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_RETURN_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_RETURN_REQUESTS as REQUESTS } from "../src/current-schematic-relevance-modify-return-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_TICKET_SOURCE as SOURCE } from "../src/current-schematic-relevance-modify-ticket-source.ts";

type Command = Parameters<Host["request"]>[0];
type Remote = Readonly<Record<string, unknown>>;
const field = (name: string, value: Remote): Remote => ({ name, value, writable: false, configurable: true, enumerable: false, isOwn: true });
function fixture(): Readonly<{ host: Host; input: Inputs; commands: Command[]; evaluate: (expression: string) => unknown; failPromise: () => void; wrongNativeArity: () => void; loseCustody: () => void }> {
  const realm = createContext({});
  runInContext(`"use strict";let nativeCalls=0,appCalls=0;const symbol=Symbol("peer"),row={type:"SCH_PAGE",pend:[["text",7,"TEXT","body"]],[symbol]:-0},cache={page:row},message=[cache,"client","unique","page"],envelope={type:"PUBLISH",uuid:"sender",topic:"/pro-mgr/worker/batchPendData",message};
    class Project{localPublishTicket(s){appCalls++;throw "application"}canWsPublish(){appCalls++;throw "application"}}
    const project=new Project;project.isReady=true;project.publishTimer=null;globalThis.PROJECT=project;
    globalThis.setTimeout=function setTimeout(callback){nativeCalls++;throw "native timer"};globalThis.clearTimeout=function clearTimeout(){nativeCalls++;throw "native timer"};
    const sheet={canvasTimer:11},roots=[project,sheet,...Array(12).fill(null)];let resolver;const promise=new Promise(resolve=>{resolver=resolve}),created=[resolver,promise,{}],parts=[Promise.prototype,...Array(13).fill(null)];
    const map=new Map([["peer",row]]),set=new Set([promise]),collections=[map,set],collectionSnapshot=[[map,"map",[["peer",row]]],[set,"set",[[promise]]]];
    const cmNatives=Array(18).fill(null);cmNatives[1]=Map.prototype;cmNatives[3]=Set.prototype;cmNatives[6]=Map.prototype.forEach;cmNatives[7]=Object.getOwnPropertyDescriptor(Map.prototype,"size").get;cmNatives[11]=Set.prototype.forEach;cmNatives[12]=Object.getOwnPropertyDescriptor(Set.prototype,"size").get;
    const bus={},bc={},workerBus=[bus,bc,{}];
    function Event(){}function MessageEvent(){};Object.setPrototypeOf(MessageEvent,Event);Object.setPrototypeOf(MessageEvent.prototype,Event.prototype);
    const event=Object.create(MessageEvent.prototype),eventValues={target:bc,type:"message",currentTarget:bc,eventPhase:2,data:envelope,origin:"https://client",source:null};
    for(const key of ["target","type","currentTarget","eventPhase"])Object.defineProperty(Event.prototype,key,{get:function(){return eventValues[key]},enumerable:true,configurable:true});
    for(const key of ["data","origin","source"])Object.defineProperty(MessageEvent.prototype,key,{get:function(){return eventValues[key]},enumerable:true,configurable:true});
    Object.defineProperty(event,"isTrusted",{get:function(){return true},enumerable:true,configurable:false});
    const trusted=Object.getOwnPropertyDescriptor(event,"isTrusted").get,eventMembers=[event,trusted],read=[event,envelope],constructors=[null,null,Event,MessageEvent],prototypes=[null,null,Event.prototype,MessageEvent.prototype],members=[null,null,null,null,...["target","type","currentTarget","eventPhase"].map(k=>Object.getOwnPropertyDescriptor(Event.prototype,k).get),...["data","origin","source"].map(k=>Object.getOwnPropertyDescriptor(MessageEvent.prototype,k).get)];
    const caller=[project,"page","text","body","TEXT","client",7,0,true,undefined,false,"unique",undefined,"TEXT"],ticket=[project,undefined],websocket=[project,false],remote=[project,...Array(17).fill(undefined)],batch=[project,message],handler=[bus,event],timer=[sheet,resolver,promise];
    const I11=[Object.getOwnPropertyDescriptor,Object.getPrototypeOf,Object.hasOwn,Object.getOwnPropertyNames,Object.getOwnPropertySymbols,Array.isArray,Function.prototype.apply,Object.prototype,Array.prototype,Function.prototype,globalThis];
    const qualified=[globalThis,project,Project.prototype,Project.prototype.localPublishTicket,Project.prototype.canWsPublish,setTimeout,clearTimeout,sheet,promise,resolver,Promise.prototype,row,row.pend,row.pend[0],cache,message,envelope,event,Event.prototype,MessageEvent.prototype,trusted,...members.slice(4),map,set,Object.prototype,Array.prototype,Function.prototype,bus,bc];
    // Node test hooks add their own configurable async ID Symbols to Promises.
    // Remove only those fixture fields before the browser-shaped baseline.
    for(const key of Reflect.ownKeys(promise)){const d=Object.getOwnPropertyDescriptor(promise,key);if(typeof key!=="symbol"||!['async_id_symbol','trigger_async_id_symbol'].includes(key.description)||!d.configurable||!Reflect.deleteProperty(promise,key))throw Error("unexpected fixture Promise own field");}
    const baseline=(${P.snapshot}).call(I11,qualified);`, realm);
  const evaluate = (expression: string): unknown => runInContext(expression, realm);
  const identity = new Map<unknown, string>(), retained = new Map<string, unknown>(); let next = 0;
  const id = (value: unknown): string => { const old = identity.get(value); if (old !== undefined) { return old; } next += 1; const fresh = `object${next}`; identity.set(value, fresh); retained.set(fresh, value); return fresh; };
  const object = (key: string): unknown => { assert.ok(retained.has(key)); return retained.get(key); };
  const clearTimeoutFunction = evaluate("clearTimeout"), local = evaluate("Project.prototype.localPublishTicket"), originalPromise = evaluate("promise"), setTimeoutFunction = evaluate("setTimeout"), websocket = evaluate("Project.prototype.canWsPublish");
  const remote = (value: unknown): Remote => {
    if (value === undefined) { return { type: "undefined" }; } if (value === null) { return { type: "object", subtype: "null", value: null }; }
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") { return { type: typeof value, value }; }
    if (typeof value === "function") { let description = "function () {}"; if (value === setTimeoutFunction) { description = "function setTimeout() { [native code] }"; } else if (value === clearTimeoutFunction) { description = "function clearTimeout() { [native code] }"; } else if (value === local) { description = SOURCE.localPublishTicket.source; } else if (value === websocket) { description = SOURCE.canWsPublish.source; } return { type: "function", className: "Function", description, objectId: id(value) }; }
    if (Array.isArray(value)) { return { type: "object", subtype: "array", className: "Array", description: `Array(${value.length})`, objectId: id(value) }; }
    if (value === originalPromise) { return { type: "object", subtype: "promise", className: "Promise", description: "Promise", objectId: id(value) }; }
    return { type: "object", className: "Object", description: "Object", objectId: id(value) };
  };
  let custody = true, nativeArity = true, promisePending = true;
  const properties = (value: unknown): unknown => {
    if (value === originalPromise) { return { result: [], internalProperties: [{ name: "[[Prototype]]", value: { type: "object", className: "Promise", description: "Promise", objectId: id(evaluate("Promise.prototype")) } }, { name: "[[PromiseState]]", value: { type: "string", value: promisePending ? "pending" : "fulfilled" } }, { name: "[[PromiseResult]]", value: { type: "undefined" } }] }; }
    if (value === setTimeoutFunction || value === clearTimeoutFunction || value === local || value === websocket) {
      const source = value === local ? SOURCE.localPublishTicket : SOURCE.canWsPublish;
      const isNative = value === setTimeoutFunction || value === clearTimeoutFunction;
      let arity: number = source.arity, name: string = source.name; if (isNative) { name = value === setTimeoutFunction ? "setTimeout" : "clearTimeout"; arity = value === setTimeoutFunction && nativeArity ? 1 : 0; }
      const internalProperties: Remote[] = [{ name: "[[Prototype]]", value: { type: "function", className: "Function", description: "function () { [native code] }", objectId: id(evaluate("Function.prototype")) } }, { name: "[[Scopes]]", value: { type: "object", subtype: "internal#scopeList", className: "Array", description: isNative ? "Scopes[0]" : "Scopes[2]", objectId: "scopes" } }];
      if (!isNative) { internalProperties.unshift({ name: "[[FunctionLocation]]", value: { type: "object", subtype: "internal#location", value: { scriptId: "worker-script", lineNumber: source.functionLineNumber, columnNumber: source.functionColumnNumber } } }); }
      return { result: [field("name", { type: "string", value: name }), field("length", { type: "number", value: arity })], internalProperties };
    }
    assert.ok(Array.isArray(value));
    return { result: [...Array.from({ length: value.length }, (_, index) => ({ name: String(index), value: remote(value[index]), writable: true, configurable: true, enumerable: true, isOwn: true })), { name: "length", value: { type: "number", value: value.length }, writable: true, configurable: false, enumerable: false, isOwn: true }], internalProperties: [{ name: "[[Prototype]]", value: remote(evaluate("Array.prototype")) }] };
  };
  const commands: Command[] = [];
  const frames: Readonly<Record<string, string>> = { ticket: "ticket", ticketReturned: "ticket", onChange: "caller", canWs: "websocket", canWsReturned: "websocket", remoteReturned: "remote", batchReturned: "batch", handlerReturned: "handler", timer: "timer" };
  const host: Host = { current: () => { if (!custody) { throw new Error("original custody lost"); } }, request: command => {
    commands.push(command);
    if (command.method === "Runtime.getProperties") { return Promise.resolve(properties(object(command.params.objectId))); }
    if (command.method === "Debugger.evaluateOnCallFrame") { assert.ok("role" in command); const key = frames[command.role]; assert.ok(key !== undefined); return Promise.resolve({ result: remote(evaluate(`${key}.slice()`)) }); }
    assert.equal(command.phase, "modify-return-call"); assert.ok(command.phase === "modify-return-call"); assert.equal(command.params.throwOnSideEffect, true);
    const row = CALLS.find(value => value[0] === command.role); assert.ok(row !== undefined); assert.equal(command.params.functionDeclaration, row[1]);
    const fn: unknown = evaluate(`(${command.params.functionDeclaration})`); assert.ok(typeof fn === "function");
    const result: unknown = Reflect.apply(fn, object(command.params.objectId), command.params.arguments.map(argument => object(argument.objectId)));
    return Promise.resolve({ result: remote(result) });
  } };
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Intentionally supplied inert graph data cannot recreate any canonical original-owner receipt.
  const input = { worker: { nativeObjectId: id(evaluate("I11")), scriptId: "worker-script", busTupleObjectId: id(evaluate("workerBus")), nativeConstructorsObjectId: id(evaluate("constructors")), nativePrototypesObjectId: id(evaluate("prototypes")), nativeMembersObjectId: id(evaluate("members")) }, cmBefore: { nativeMethodsObjectId: id(evaluate("cmNatives")) }, cmEntry: { frameObjectId: id(evaluate("remote.slice()")) }, cmDelta: { frameObjectId: id(evaluate("caller.slice()")) }, event: { frameObjectId: id(evaluate("handler.slice()")), readObjectId: id(evaluate("read")), eventMembersObjectId: id(evaluate("eventMembers")) }, batchFrameObjectId: id(evaluate("batch.slice()")), canvas: { rootsObjectId: id(evaluate("roots")), nativePartsObjectId: id(evaluate("parts")), createdObjectId: id(evaluate("created")), resolverObjectId: id(evaluate("resolver")), promiseObjectId: id(originalPromise), qualifiedObjectId: id(evaluate("qualified")), snapshotObjectId: id(evaluate("baseline")), collectionsObjectId: id(evaluate("collections")), collectionSnapshotObjectId: id(evaluate("collectionSnapshot")), timerId: 11 } } as unknown as Inputs;
  return { host, input, commands, evaluate, failPromise: () => { promisePending = false; }, wrongNativeArity: () => { nativeArity = false; }, loseCustody: () => { custody = false; } };
}

function noAuthority(value: object): void { for (const [key, actual] of Object.entries(value)) { if (typeof actual === "boolean") { assert.equal(actual, false, key); } } assert.ok(Object.isFrozen(value)); }

void test("all nine passive return stages execute fixed inert recipes within their separate budgets", async () => {
  const f = fixture(), { host, input } = f;
  let stageIndex = 0;
  const stage = async <T extends { originalRequests: number }>(limit: number, run: () => Promise<T>): Promise<T> => { stageIndex += 1; const prior = f.commands.length; let result: T; try { result = await run(); } catch (error) { throw new Error(`inert stage ${stageIndex}: ${String(error)}`, { cause: error }); } assert.equal(f.commands.length - prior, result.originalRequests); assert.ok(result.originalRequests <= limit); noAuthority(result); return result; };
  const before = await stage(REQUESTS.beforeReads, () => collectBefore(host, "ticket", "onChange", input));
  f.evaluate("project.publishTimer=22"); const introduced = await stage(REQUESTS.introducedReads, () => collectIntroduced(host, "ticketReturned", input, before)); assert.equal(introduced.timerId, 22);
  f.evaluate("project.publishTimer=null"); const cleared = await stage(REQUESTS.cancelledReads, () => collectCleared(host, "ticketReturned", input, before, introduced));
  const websocket = await stage(REQUESTS.websocketReads, () => collectWebsocket(host, "canWs", "onChange", input, before, cleared));
  await stage(REQUESTS.websocketReturnReads, () => collectWebsocketReturned(host, "canWsReturned", input, before, websocket));
  await stage(REQUESTS.remoteReturnReads, () => collectRemoteReturned(host, "remoteReturned", input));
  f.evaluate("row.length=0"); const batch = await stage(REQUESTS.batchReturnReads, () => collectBatchReturned(host, "batchReturned", input));
  await stage(REQUESTS.handlerReturnReads, () => collectHandlerReturned(host, "handlerReturned", input, batch));
  assert.equal(f.evaluate("Reflect.ownKeys(promise).length"), 0, String(f.evaluate("Reflect.ownKeys(promise).map(String).join(',')")));
  await stage(REQUESTS.timerEntryReads, () => collectTimerEntry(host, "timer", input, batch));
  assert.equal(f.evaluate("nativeCalls"), 0); assert.equal(f.evaluate("appCalls"), 0); assert.equal(f.evaluate("row.pend.length"), 1);
  assert.ok(f.commands.every(command => command.method === "Runtime.getProperties" || command.method === "Debugger.evaluateOnCallFrame" || command.phase === "modify-return-call")); assert.equal(REQUESTS.controls, 0);
});

void test("original drift, wrong native metadata and lost custody refuse before any application or timer call", async () => {
  for (const mutate of [(f: ReturnType<typeof fixture>): void => { f.evaluate("project.isReady=false"); }, (f: ReturnType<typeof fixture>): void => { f.wrongNativeArity(); }, (f: ReturnType<typeof fixture>): void => { f.failPromise(); }, (f: ReturnType<typeof fixture>): void => { f.loseCustody(); }]) {
    const f = fixture(); mutate(f); await assert.rejects(collectBefore(f.host, "ticket", "onChange", f.input)); assert.equal(f.evaluate("nativeCalls"), 0); assert.equal(f.evaluate("appCalls"), 0);
  }
});

void test("timer introduction excludes the Canvas ID and preserves ordered collections and unknown peers", async () => {
  for (const change of ["project.publishTimer=11", "project.publishTimer=22;map.set('other',row)", "project.publishTimer=22;row[symbol]=0"]) {
    const f = fixture(); const before = await collectBefore(f.host, "ticket", "onChange", f.input); f.evaluate(change);
    await assert.rejects(collectIntroduced(f.host, "ticketReturned", f.input, before)); assert.equal(f.evaluate("nativeCalls"), 0);
  }
});

void test("batch and timer boundaries reject consumed pend, peer drift, foreign event, wrong resolver and settled Promise", async () => {
  for (const change of ["row.length=0;row.pend.length=0", "row.length=0;row[symbol]=0", "row.length=1"]) { const f = fixture(); f.evaluate(change); await assert.rejects(collectBatchReturned(f.host, "batchReturned", f.input)); }
  for (const change of ["timer[1]=function(){}", "timer[2]=new Promise(()=>{})", "sheet.canvasTimer=12"]) { const f = fixture(); f.evaluate("row.length=0"); const batch = await collectBatchReturned(f.host, "batchReturned", f.input); f.evaluate(change); await assert.rejects(collectTimerEntry(f.host, "timer", f.input, batch)); assert.equal(f.evaluate("nativeCalls"), 0); }
  const f = fixture(); f.evaluate("row.length=0"); const batch = await collectBatchReturned(f.host, "batchReturned", f.input); f.evaluate("handler[1]={}"); await assert.rejects(collectHandlerReturned(f.host, "handlerReturned", f.input, batch)); f.failPromise(); await assert.rejects(collectTimerEntry(f.host, "timer", f.input, batch));
});

void test("uncleared notification and changed fresh callers or websocket flags cannot advance a return stage", async () => {
  const f = fixture(); const { host, input } = f;
  const before = await collectBefore(host, "ticket", "onChange", input); f.evaluate("project.publishTimer=22"); const introduced = await collectIntroduced(host, "ticketReturned", input, before);
  await assert.rejects(collectCleared(host, "ticketReturned", input, before, introduced)); f.evaluate("project.publishTimer=null");
  const cleared = await collectCleared(host, "ticketReturned", input, before, introduced);
  f.evaluate("websocket[1]=true"); await assert.rejects(collectWebsocket(host, "canWs", "onChange", input, before, cleared)); f.evaluate("websocket[1]=false;caller[1]='foreign'"); await assert.rejects(collectWebsocket(host, "canWs", "onChange", input, before, cleared));
  f.evaluate("caller[1]='page'"); const websocket = await collectWebsocket(host, "canWs", "onChange", input, before, cleared); f.evaluate("websocket[1]=true"); await assert.rejects(collectWebsocketReturned(host, "canWsReturned", input, before, websocket));
  f.evaluate("remote[1]='changed'"); await assert.rejects(collectRemoteReturned(host, "remoteReturned", input));
  assert.equal(f.evaluate("nativeCalls"), 0); assert.equal(f.evaluate("appCalls"), 0);
});

void test("loss of original custody after a transport await prevents a second request", async () => {
  const f = fixture(); const host: Host = { current: f.host.current, request: async command => { const reply = await f.host.request(command); f.loseCustody(); return reply; } };
  await assert.rejects(collectBefore(host, "ticket", "onChange", f.input), /original custody lost/u); assert.equal(f.commands.length, 1); assert.equal(f.evaluate("nativeCalls"), 0); assert.equal(f.evaluate("appCalls"), 0);
});
