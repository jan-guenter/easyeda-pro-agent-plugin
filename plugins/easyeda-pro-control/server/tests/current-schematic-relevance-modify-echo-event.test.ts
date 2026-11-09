/** Synthetic UI data only. Native Event metadata and original ownership
 * require the independent original host, never this VM fixture. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_EVENT_PROGRAMS as P } from "../src/current-schematic-relevance-modify-echo-event-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_EVENT_CALLS as CALLS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_EVENT_FLAGS as FLAGS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_EVENT_REQUESTS as REQUESTS, validateCurrentSchematicRelevanceModifyEchoEventCommand as validate } from "../src/current-schematic-relevance-modify-echo-event-protocol.ts";
import { currentSchematicRelevanceModifyEchoReceiverBranch as branch, currentSchematicRelevanceModifyEchoEventEvidence as evidence, currentSchematicRelevanceModifyEchoEventMetadata as metadata } from "../src/current-schematic-relevance-modify-echo-event-replies.ts";
import { collectCurrentSchematicRelevanceModifyEchoEvent as collect } from "../src/current-schematic-relevance-modify-echo-event-collector.ts";

function fixture(): ReturnType<typeof createContext> {
  const realm = createContext({});
  runInContext(`"use strict";let eventReads=0,appCalls=0;
    class Publisher{initProject(){appCalls++}pushOnLine(){appCalls++}publishLine(){appCalls++}}
    class Channel{canPush(){appCalls++}}class Bus{subscribe(){appCalls++}}class Task{running(){appCalls++}async execute(){appCalls++}}
    const p=new Publisher,cm={},manager={},page={uuid:"page",project_uuid:"project"},bus=new Bus,bc={},channel=new Channel,topics={projectUpdate:"/pro-mgr/canvas/{uuid}/update"},subscribed={};
    Object.assign(channel,{_locker:1,_temporaryUnlock:1});Object.assign(p,{uuid:"page",path:"project",windowId:"tab",dataBus:bus,channel,busTopic:topics,consistencyManager:cm,isProject:true,isInit:true,isInitIng:false,isDestroy:false,canSave:true,_headType:"SCH_PAGE",onUpdate:undefined});Object.assign(manager,{_base:p,consistencyManager:cm,uuid:"page",project:"project",windowId:"tab"});bus.subscribed=subscribed;
    const callback=(function(){return l=>{this.onUpdate?this.onUpdate(l):this.pushOnLine(l,this.uuid)}}).call(p),job=Object.assign(new Task,{callback,unsafe:true,isRunning:true}),list=[job];subscribed["/pro-mgr/canvas/page/update"]=list;
    const roots=[p,bus,bc,{},{},{},{},"/tab/project/project"],links=[manager,{},p,cm],refs=Array(24).fill(null);refs[9]=page;
    const pending=[p,"page","text",7,"body","TEXT","SCH_PAGE",Promise,()=>{}],pristine=[p,cm,"client","unique",5,{},{}],r=["text",7,"body","TEXT","client",true,"unique",false,undefined],message=[r],envelope={type:"PUBLISH",uuid:"worker-uuid",topic:"/pro-mgr/canvas/page/update",message};
    function Event(){}function MessageEvent(){}Object.setPrototypeOf(MessageEvent,Event);Object.setPrototypeOf(MessageEvent.prototype,Event.prototype);
    const values={target:bc,type:"message",currentTarget:bc,eventPhase:2,data:envelope,origin:"https://client",source:null};
    for(const key of ["target","type","currentTarget","eventPhase"])Object.defineProperty(Event.prototype,key,{get:function(){eventReads++;return values[key]},enumerable:true,configurable:true});
    for(const key of ["data","origin","source"])Object.defineProperty(MessageEvent.prototype,key,{get:function(){eventReads++;return values[key]},enumerable:true,configurable:true});
    const event=Object.create(MessageEvent.prototype);Object.defineProperty(event,"isTrusted",{get:function(){eventReads++;return true},enumerable:true,configurable:false});
    const trusted=Object.getOwnPropertyDescriptor(event,"isTrusted").get,ctors=[Event,MessageEvent],protos=[Event.prototype,MessageEvent.prototype],getters=[...["target","type","currentTarget","eventPhase"].map(k=>Object.getOwnPropertyDescriptor(Event.prototype,k).get),...["data","origin","source"].map(k=>Object.getOwnPropertyDescriptor(MessageEvent.prototype,k).get)],frame=[bus,event],origin=["https://client"];
    const I11=[Object.getOwnPropertyDescriptor,Object.getPrototypeOf,Object.hasOwn,Object.getOwnPropertyNames,Object.getOwnPropertySymbols,Array.isArray,Function.prototype.apply,Object.prototype,Array.prototype,Function.prototype,globalThis];
    const qualified=[globalThis,p,cm,manager,page,bus,bc,channel,topics,subscribed,Publisher,Publisher.prototype,Channel.prototype,Bus.prototype,Task.prototype,callback,job,list,Event,MessageEvent,Event.prototype,MessageEvent.prototype,event,trusted,...getters,envelope,message,r,Object.prototype,Array.prototype,Function.prototype];
    const raw=Array(19).fill(null);raw[0]=Object.getOwnPropertyDescriptor;raw[1]=Object.getOwnPropertyDescriptors;raw[2]=Object.getPrototypeOf;raw[3]=Object.is;raw[4]=Object.hasOwn;raw[5]=Reflect.ownKeys;raw[7]=Array.isArray;`, realm);
  return realm;
}
function evaluate(realm: ReturnType<typeof fixture>, program: string, args: string): unknown { return runInContext(`(${program}).call(I11,${args})`, realm); }
const packet = (value: unknown): unknown => ({ result: { type: "object", value: structuredClone(value) } });

void test("actual getter references stay unread until the qualified native Event read and payload stages", () => {
  const realm = fixture();
  const entry = evaluate(realm, P.entry, "frame,roots"); assert.ok(Array.isArray(entry)); assert.equal(entry[0], runInContext("event", realm));
  runInContext(`const actual=(${P.members}).call(I11,frame,roots,ctors,protos,getters,qualified),expected=(${P.expected}).call(I11,pending,pristine,roots,links,qualified);`, realm);
  assert.equal(runInContext("eventReads", realm), 0);
  runInContext(`const read=(${P.read}).call(I11,frame,roots,ctors,protos,getters,qualified,actual,origin),selected=(${P.message}).call(I11,read,expected,qualified),row=(${P.row}).call(I11,selected,qualified);`, realm);
  const data = evidence(packet(evaluate(realm, P.payload, "read,selected,row,expected,qualified")));
  assert.deepEqual(data, ["worker-uuid", "/pro-mgr/canvas/page/update", "page", "text", 7, "body", "TEXT", "client", true, "unique", false, false, null]);
  runInContext("r[8]=13", realm); const withOrder = evaluate(realm, P.payload, "read,selected,row,expected,qualified"); assert.equal(evidence(packet(withOrder))[12], 13);
  for (const value of [-1, -0, 1.5, Number.NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) { runInContext(`r[8]=${Object.is(value, -0) ? "-0" : String(value)}`, realm); assert.throws(() => { evaluate(realm, P.payload, "read,selected,row,expected,qualified"); }); }
  assert.ok(runInContext("eventReads", realm) > 0); assert.equal(runInContext("appCalls", realm), 0);
});

void test("wrong receiver, inactive dispatch, foreign origin/channel and mismatched row refuse", () => {
  for (const change of ["frame[0]={}", "values.currentTarget=null", "values.eventPhase=0", "values.origin='https://foreign'", "values.target={}", "values.source={}", "values.type='other'"]) {
    const realm = fixture(); runInContext(`const actual=(${P.members}).call(I11,frame,roots,ctors,protos,getters,qualified);${change}`, realm); assert.throws(() => { evaluate(realm, P.read, "frame,roots,ctors,protos,getters,qualified,actual,origin"); }); assert.equal(runInContext("appCalls", realm), 0);
  }
  for (const change of ["r[0]='other'", "r[1]=8", "r[2]='changed'", "r[3]='LINE'", "r[4]='other'", "r[5]=false", "r[6]='other'", "r[7]=true", "r.push('extra')"]) {
    const realm = fixture(); runInContext(`const actual=(${P.members}).call(I11,frame,roots,ctors,protos,getters,qualified),expected=(${P.expected}).call(I11,pending,pristine,roots,links,qualified),read=(${P.read}).call(I11,frame,roots,ctors,protos,getters,qualified,actual,origin),selected=(${P.message}).call(I11,read,expected,qualified),row=(${P.row}).call(I11,selected,qualified);${change}`, realm); assert.throws(() => { evaluate(realm, P.payload, "read,selected,row,expected,qualified"); });
  }
});

void test("selected page roster, class ancestry and callback branches are passive exact references", () => {
  const realm = fixture();
  runInContext(`const seed=(${P.receiverSeed}).call(I11,roots,links,refs),bindings=(${P.owners}).call(I11,seed,roots,links,pending,qualified),roster=(${P.roster}).call(I11,bindings,qualified),task=(${P.task}).call(I11,roster,qualified),branches=(${P.branches}).call(I11,bindings,task,qualified),methods=(${P.methods}).call(I11,bindings,task,branches,qualified);`, realm);
  assert.equal(evaluate(realm, P.receiverProof, "bindings,roster,task,branches,methods,roots,links,pending,qualified"), true);
  const branches = evaluate(realm, P.branchValues, "branches"); assert.deepEqual(branch(packet(branches)), ["undefined", 1, 1]); assert.equal(runInContext("appCalls", realm), 0);
  for (const change of ["list.push(job)", "job.isRunning=false", "job.unsafe=false", "job.callback=()=>{}", "manager._base={}", "p.dataBus={}", "channel._locker=2"]) {
    const fresh = fixture(); runInContext(`const seed=(${P.receiverSeed}).call(I11,roots,links,refs),bindings=(${P.owners}).call(I11,seed,roots,links,pending,qualified),roster=(${P.roster}).call(I11,bindings,qualified),task=(${P.task}).call(I11,roster,qualified),branches=(${P.branches}).call(I11,bindings,task,qualified),methods=(${P.methods}).call(I11,bindings,task,branches,qualified);${change}`, fresh); assert.throws(() => { evaluate(fresh, P.receiverProof, "bindings,roster,task,branches,methods,roots,links,pending,qualified"); }); assert.equal(runInContext("appCalls", fresh), 0);
  }
});

void test("unknown descriptors and Symbols stay exact while string coercion and accessors never run", () => {
  const realm = fixture(); const same = CALLS.find(row => row[0] === "same-snapshot"), snapshot = CALLS.find(row => row[0] === "snapshot"); assert.ok(snapshot !== undefined && same !== undefined);
  runInContext(`const symbol=Symbol("unknown");p[symbol]=-0;const before=(${snapshot[1]}).call(qualified,raw);`, realm);
  assert.equal(runInContext(`(${same[1]}).call(before,raw,qualified)`, realm), true); runInContext("p[symbol]=0", realm); assert.throws(() => { runInContext(`(${same[1]}).call(before,raw,qualified)`, realm); });
  const fresh = fixture(); runInContext(`const seed=(${P.receiverSeed}).call(I11,roots,links,refs);p.windowId={toString(){appCalls++;throw Error("coercion")}};`, fresh); assert.throws(() => { evaluate(fresh, P.owners, "seed,roots,links,pending,qualified"); }); assert.equal(runInContext("appCalls", fresh), 0);
  runInContext(`const actual=(${P.members}).call(I11,frame,roots,ctors,protos,getters,qualified),expected=(${P.expected}).call(I11,pending,pristine,roots,links,qualified),read=(${P.read}).call(I11,frame,roots,ctors,protos,getters,qualified,actual,origin),selected=(${P.message}).call(I11,read,expected,qualified),row=(${P.row}).call(I11,selected,qualified);Object.defineProperty(r,"2",{get(){appCalls++;throw Error("accessor")},enumerable:true,configurable:true});`, fresh); assert.throws(() => { evaluate(fresh, P.payload, "read,selected,row,expected,qualified"); }); assert.equal(runInContext("appCalls", fresh), 0);
});

void test("closed native metadata and scalar replies reject Proxy, forged getter and undefined/null ambiguity", () => {
  const actual = { type: "object", className: "MessageEvent", objectId: "event" } as const;
  const reply = { result: [{ name: "isTrusted", get: { type: "function", className: "Function", description: "function get isTrusted() { [native code] }", objectId: "trusted" }, configurable: false, enumerable: true, isOwn: true }], internalProperties: [{ name: "[[Prototype]]", value: { type: "object", className: "MessageEvent", objectId: "prototype" } }] };
  metadata(reply, actual); assert.throws(() => { metadata(reply, { ...actual, subtype: "proxy" }); }); assert.throws(() => { metadata({ ...reply, result: [...reply.result, ...reply.result] }, actual); });
  const fake = structuredClone(reply); const first = fake.result[0]; assert.ok(first !== undefined); first.get.description = "function () {}"; assert.throws(() => { metadata(fake, actual); });
  assert.throws(() => { evidence(packet(["worker", "/pro-mgr/canvas/page/update", "page", "text", 7, "body", "TEXT", "client", true, "unique", false, true, null])); });
  assert.throws(() => { evidence(packet(["worker", "/pro-mgr/canvas/foreign/update", "page", "text", 7, "body", "TEXT", "client", true, "unique", false, false, null])); });
});

void test("all fixed programs enforce readonly flags and forbid control or replacement code", () => {
  for (const [role, program, arity, byValue] of CALLS) {
    const command = { phase: "modify-echo-event-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: "original", functionDeclaration: program, arguments: Array.from({ length: arity }, () => ({ objectId: "reference" })), returnByValue: byValue, awaitPromise: false, userGesture: false } }; assert.ok(Object.isFrozen(validate(command)));
    for (const key of ["functionDeclaration", "throwOnSideEffect", "returnByValue", "awaitPromise", "userGesture"] as const) { const changed = structuredClone(command); Reflect.set(changed.params, key, key === "functionDeclaration" ? "function(){this.postMessage({})}" : !changed.params[key]); assert.throws(() => { validate(changed); }); }
    const changed = structuredClone(command); changed.params.arguments.push({ objectId: "extra" }); assert.throws(() => { validate(changed); });
  }
  assert.throws(() => { validate({ phase: "modify-echo-event-frame", method: "Debugger.evaluateOnCallFrame", params: { ...FLAGS, callFrameId: "frame", expression: "[this,event]", returnByValue: false, includeCommandLineAPI: false } }); }); assert.throws(() => { validate({ phase: "resume", method: "Debugger.resume", params: {} }); });
  assert.equal(REQUESTS.controls, 0); assert.equal(REQUESTS.publicationReproofReads, 24); assert.equal(REQUESTS.publicationReproofHelpers, 24);
});

void test("collector rejects original dependency drift before frame capture or any Event getter", async () => {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Incomplete data must fail the original dependency gate before traversal.
  const input = { raw: { nativeObjectId: "raw" }, clone: {}, ui: {} } as unknown as Parameters<typeof collect>[2];
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Data cannot reconstruct an original publication or paused handler.
  const publication = { dependencyObjectsObjectId: "dependencies", dependencySnapshotObjectId: "snapshot" } as unknown as Parameters<typeof collect>[3];
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- A copied empty Echo shape must confer no authority.
  const echo = {} as Parameters<typeof collect>[4];
  const calls: string[] = []; let checks = 0;
  await assert.rejects(collect({ current: () => { checks += 1; }, request: command => { calls.push(command.method); return Promise.resolve({ result: { type: "boolean", value: false } }); } }, "frame", input, publication, echo)); assert.deepEqual(calls, ["Runtime.callFunctionOn"]); assert.ok(checks > 0);
});
