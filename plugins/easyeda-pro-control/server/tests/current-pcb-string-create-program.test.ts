import assert from "node:assert/strict";
import { test } from "node:test";
import { setImmediate as yieldToEventLoop } from "node:timers/promises";
import { createContext, runInContext } from "node:vm";
import { planCurrentPcbStringCreate } from "../src/current-pcb-string-create.ts";
import { compareCurrentPcbStringCreateObservation, planCurrentPcbStringCreateObservation } from "../src/current-pcb-string-create-observation.ts";
import { buildDormantCurrentPcbStringCreateProgram } from "../src/current-pcb-string-create-program.ts";

const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16),
  tabId: `${"c".repeat(16)}@${"a".repeat(64)}` };
const id = "0123456789abcdef";
interface Options { before?: string; beforeChild?: string; afterCall?: string; fastDeadline?: boolean; }
interface Fixture {
  run: () => Promise<ReturnType<typeof compareCurrentPcbStringCreateObservation>>;
  child: (source: string) => unknown;
}

/** Entirely isolated synthetic realms: no application, RPC socket, browser,
 * filesystem, native bridge or network operation is supplied to either VM. */
function environment(options: Options = {}): Fixture {
  const plan = planCurrentPcbStringCreateObservation(planCurrentPcbStringCreate({ x: 100, y: -20, text: 'Board "A"' }), target);
  const childContext = createContext({ checkCall: (topic: unknown, arg: unknown, timeout: unknown): void => {
    assert.equal(timeout, 0);
    if (topic === "getTabIdAndDocType") { assert.equal(arg, undefined); }
    else if (topic === "pcb/extensionAPI/string-create") { assert.equal(JSON.stringify(arg), JSON.stringify(plan.candidateArguments)); }
    else { assert.equal(topic, "pcb/extensionAPI/string-getAll"); assert.equal(JSON.stringify(arg), "{}"); }
  } });
  runInContext(`globalThis.rows=[];globalThis.calls=0;globalThis.dataReads=0;globalThis.createCalls=0;globalThis.getterReads=0;
globalThis.expected=${JSON.stringify(plan.expectedExposedScalars)};globalThis.identity={tabId:${JSON.stringify(target.tabId)},docType:3};
class Bus {async rpcCall(topic,arg,timeout){if(this!==MSG_BUS_PCB.messageBus)throw new Error('PRIVATE_RECEIVER');checkCall(topic,arg,timeout);calls++;await Promise.resolve();
if(topic==='pcb/extensionAPI/string-getAll')dataReads++;
if(topic==='pcb/extensionAPI/string-create'){createCalls++;rows=[{globalIndex:${JSON.stringify(id)},...expected,formulaName:undefined,font:{privateCache:true}}];}
const result=topic==='getTabIdAndDocType'?identity:topic==='pcb/extensionAPI/string-create'?{primitiveId:${JSON.stringify(id)}}:rows;
${options.afterCall ?? ""}
return {message:result,bridge:undefined,source:undefined};}}
globalThis.MSG_BUS_PCB={messageBus:new Bus()};${options.beforeChild ?? ""}`, childContext, { timeout: 1000 });
  const child: unknown = runInContext("globalThis", childContext);
  const context = createContext({ child, setTimeout: options.fastDeadline === true
    ? (callback: () => void, delay: number): ReturnType<typeof setTimeout> => { assert.equal(delay, 10_000); return setTimeout(callback, 1); }
    : setTimeout, clearTimeout });
  runInContext(`globalThis.window=globalThis;globalThis.top=globalThis;
globalThis.location={href:'https://client/editor?cll=warn#',origin:'https://client'};
globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href,querySelectorAll(){return [frame];}};
globalThis.PRO_EDITOR_MODE='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM';
globalThis.target=${JSON.stringify(target)};globalThis.tab={tabId:target.tabId,data:{doctype:3,pid:target.projectUuid}};globalThis.activeTab=target.tabId;
class Tabs {static getActiveTab(){return activeTab;}static getTabById(value){return value===tab.tabId?tab:null;}}
globalThis.gVars={currentProject:{projectId:target.projectUuid,branchUuid:target.branchUuid,isV2Format:false},isHistoryMode:false};
globalThis.UI={gVars,tabBar:Tabs};globalThis.eda={extensionUuid:'7e06d286b1ac846ef7eab9c7f2a9ee40'};
globalThis.attributes={'c_dbid':target.tabId,'c_doctype':'3',src:'editor?entry=pcb','pcb-canvas':'true'};
globalThis.frame={tagName:'IFRAME',id:'frame_'+target.tabId,ownerDocument:document,isConnected:true,contentWindow:child,
classList:{contains(name){return name==='editframe';}},getAttribute(name){return attributes[name]??null;},hasAttribute(name){return Object.hasOwn(attributes,name);},
parentElement:{getAttribute(name){return name==='uuid'?target.tabId:null;}}};
child.document={defaultView:child,nodeType:9};child.frameElement=frame;child.parent=globalThis;child.top=globalThis;
${options.before ?? ""}`, context, { timeout: 1000 });
  return { run: async (): Promise<ReturnType<typeof compareCurrentPcbStringCreateObservation>> => {
    const raw: unknown = await Promise.resolve(runInContext(`(async()=>{${buildDormantCurrentPcbStringCreateProgram(plan)}})()`, context, { timeout: 1000 }) as unknown);
    return compareCurrentPcbStringCreateObservation(plan, raw);
  }, child: (source: string): unknown => runInContext(source, childContext, { timeout: 1000 }) as unknown };
}

void test("dormant String program uses exactly one fixed create and four unfiltered bounded reads", async () => {
  const fixture = environment(), result = await fixture.run();
  assert.equal(result.completed, true); assert.equal(result.stage, "complete");
  assert.equal(result.acknowledgedPrimitiveId, id); assert.equal(result.dispatchAttempts, 1);
  assert.equal(result.matchingBeforeSamples, 2); assert.equal(result.matchingAfterSamples, 2);
  assert.equal(fixture.child("calls"), 13); assert.equal(fixture.child("dataReads"), 4); assert.equal(fixture.child("createCalls"), 1);
  assert.equal(result.liveExecutionVerified, false); assert.equal(result.emptyRootPcbVerified, false);
  assert.equal(result.queueCompletionVerified, false); assert.equal(result.persistenceVerified, false);
  assert.equal(result.writerSupported, false); assert.equal(result.executionAuthorized, false);
  assert.equal(result.readback?.["silkColor"], "#000000"); assert.equal(Object.hasOwn(result.readback ?? {}, "font"), false);
});

void test("dormant String program rejects copied plans and wrong exact frames before dispatch", async () => {
  const plan = planCurrentPcbStringCreateObservation(planCurrentPcbStringCreate({ x: 0, y: 0, text: "A" }), target);
  assert.throws(() => buildDormantCurrentPcbStringCreateProgram({ ...plan }), /original dormant plan/u);
  for (const before of ["attributes.fromFile='true';", "tab.data.doctype=4;", "activeTab='foreign';",
    "tab.parentLibraryUuid='library';", "location.href+='id='+ 'f'.repeat(64);document.URL=location.href;"]) {
    const fixture = environment({ before }), result = await fixture.run();
    assert.equal(result.completed, false); assert.equal(result.stage, "setup");
    assert.equal(fixture.child("calls"), 0); assert.equal(result.dispatchAttempts, 0);
  }
});

void test("dormant String program refuses nonempty or accessor-backed baseline without a create", async () => {
  for (const beforeChild of ["rows=[{globalIndex:'foreign'}];",
    "rows.length=100;Object.defineProperty(rows,'0',{get(){getterReads++;throw new Error('GETTER');}});"]) {
    const fixture = environment({ beforeChild }), result = await fixture.run();
    assert.equal(result.stage, "before-first"); assert.equal(result.dispatchAttempts, 0);
    assert.equal(fixture.child("getterReads"), 0); assert.equal(fixture.child("createCalls"), 0);
  }
});

void test("dormant String program retains acknowledged ID when readback fails without Save or retry", async () => {
  for (const mutation of ["rows[0].silkColor=null;", "rows[0].globalIndex='fedcba9876543210';", "rows.push({...rows[0]});",
    "Object.defineProperty(rows[0],'value',{get(){getterReads++;throw new Error('GETTER');}});"]) {
    const fixture = environment({ afterCall: `if(topic==='pcb/extensionAPI/string-create'){${mutation}}` }), result = await fixture.run();
    assert.equal(result.completed, false); assert.equal(result.stage, "after-first");
    assert.equal(result.acknowledgedPrimitiveId, id); assert.equal(result.dispatchAttempts, 1);
    assert.equal(fixture.child("createCalls"), 1); assert.equal(fixture.child("dataReads"), 3);
    assert.equal(fixture.child("getterReads"), 0);
  }
  const later = environment({ afterCall: "if(topic==='pcb/extensionAPI/string-getAll'&&dataReads===4)rows[0].value='changed';" });
  const failed = await later.run();
  assert.equal(failed.stage, "after-second"); assert.equal(failed.matchingAfterSamples, 1);
  assert.equal(failed.acknowledgedPrimitiveId, id); assert.equal(failed.readback?.["value"], 'Board "A"');
  assert.equal(later.child("createCalls"), 1);
});

void test("dormant String program retains native ACK before rejecting replaced original receiver", async () => {
  const fixture = environment({ afterCall: "if(topic==='pcb/extensionAPI/string-create')MSG_BUS_PCB={messageBus:new Bus()};" });
  const result = await fixture.run();
  assert.equal(result.completed, false); assert.equal(result.stage, "create");
  assert.equal(result.acknowledgedPrimitiveId, id); assert.equal(result.dispatchAttempts, 1);
  assert.equal(fixture.child("calls"), 7); assert.equal(fixture.child("dataReads"), 2);
});

void test("dormant String program reports invalid acknowledgment and pre-dispatch context loss", async () => {
  const invalid = environment({ afterCall: "if(topic==='pcb/extensionAPI/string-create')result.primitiveId='bad';" });
  const result = await invalid.run();
  assert.equal(result.stage, "create"); assert.equal(result.dispatchAttempts, 1); assert.equal(result.acknowledgedPrimitiveId, null);
  assert.equal(invalid.child("calls"), 7);
  const lost = environment({ afterCall: "if(calls===3)parent.activeTab='foreign';" });
  const before = await lost.run();
  assert.equal(before.stage, "before-first"); assert.equal(before.dispatchAttempts, 0); assert.equal(lost.child("createCalls"), 0);
});

void test("dormant String program ignores unprojected font and Point cache getters", async () => {
  const fixture = environment({ afterCall: "if(topic==='pcb/extensionAPI/string-create'){Object.defineProperty(rows[0],'font',{get(){getterReads++;throw new Error('FONT');}});Object.defineProperty(rows[0].position,'_hashed',{get(){getterReads++;throw new Error('CACHE');}});}" });
  const result = await fixture.run(); assert.equal(result.completed, true); assert.equal(fixture.child("getterReads"), 0);
});

void test("dormant String deadline cannot cancel native create and never follows its late acknowledgment", async () => {
  const fixture = environment({ fastDeadline: true,
    afterCall: "if(topic==='pcb/extensionAPI/string-create')await new Promise(resolve=>{globalThis.release=resolve;});" });
  const result = await fixture.run();
  assert.equal(result.completed, false); assert.equal(result.deadlineExpired, true); assert.equal(result.stage, "create");
  assert.equal(result.dispatchAttempts, 1); assert.equal(result.acknowledgedPrimitiveId, null);
  assert.equal(fixture.child("calls"), 7); fixture.child("release()");
  await yieldToEventLoop();
  assert.equal(fixture.child("calls"), 7); assert.equal(fixture.child("createCalls"), 1);
  assert.equal(result.acknowledgedPrimitiveId, null);
});
