import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SYMBOL_WRITE_TIMEOUT_MS, buildCurrentSymbolWriteProgram, decodeCurrentSymbolWriteReply } from "../src/current-symbol-write-program.ts";
import { encodeExactReadEnvelope } from "../src/exact-readers.ts";

const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), symbolUuid: "c".repeat(16), ownerUuid: "d".repeat(32) };
const actor = { uuid: "1".repeat(32), username: "fixture-user", nickname: "Fixture" };
const before = { name: "Original", description: "Description", tagsJson: '["Exact"]', source: "template", version: "900000", ticket: 12 };
const input = { target, expectedBefore: before, desired: { name: "Renamed", description: "Changed\nmetadata" }, peerNames: ["Peer"], expectedActor: actor,
  startup: { sheetUuids: ["2".repeat(16)], templates: [] },
  expectedWorker: { client: "f".repeat(16), maxTicket: 14 }, rendererTimezoneOffsetMinutes: 0,
  backendWindow: { minimumMs: 1_000_000, maximumMs: 1_060_000 }, documentWindow: { minimumMs: 1_000_000, maximumMs: 1_060_000 } };
function reply(value: unknown): unknown { return { content: [], structuredContent: { ok: true, result: value } }; }
interface Options { readonly setup?: string; readonly afterRpc?: string; readonly afterClock?: string; readonly pending?: string }
function fixture(options: Options = {}): { run: (selected?: unknown) => Promise<unknown>; evaluate: (source: string) => unknown; expire: () => void } {
  let timeout: (() => void) | undefined;
  const context = createContext({ TextEncoder,
    setTimeout(callback: () => void, delay: number): number { assert.equal(delay, CURRENT_SYMBOL_WRITE_TIMEOUT_MS); timeout = callback; return 7; },
    clearTimeout(timer: number): void { assert.equal(timer, 7); },
  });
  runInContext(`globalThis.window=globalThis;globalThis.top=globalThis;globalThis.calls=[];globalThis.writes=0;globalThis.forbidden=[];
globalThis.target=${JSON.stringify(target)};globalThis.before=${JSON.stringify(before)};
globalThis.location={href:'https://client/editor?cll=warn#id='+target.projectUuid,origin:'https://client'};
globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href};globalThis.navigator={serviceWorker:{controller:null}};
globalThis.PRO_EDITOR_MODE='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM';globalThis.PRO_EDITOR_VERSION='3.2.206';globalThis._TAB_ID_='1'.repeat(16);
globalThis.start={tabId:'tab_page1',data:{doctype:-1},isAbleDelete:false,group:'start_blank',draggable:true,isDisplayNone:false};
globalThis.info={id:'editor-window-main',belong:'editor-window-main',tabs:[start],activeTabId:'tab_page1'};
class Tabs{static containerIds=['editor-window-main'];static containerTree={id:'editor-window-main'};static belongContainer='editor-window-main';static currentTabId='tab_page1';static isOpenProjectDoc=true;static isOpenOtherDoc=true;static getActiveTab(){return this.currentTabId;}static getContainerInfo(){return info;}static hasTabUnSaved(){return info.tabs.some(tab=>tab.isUnSaved===true);}static isTabUnSaved(){return this.hasTabUnSaved();}}
const denied=name=>{forbidden.push(name);throw new Error('PRIVATE_FORBIDDEN');};
globalThis.fetch=()=>denied('network');globalThis.metadata={uuid:target.symbolUuid,project_uuid:target.projectUuid,path:target.projectUuid,docType:2,owner:{uuid:target.ownerUuid},display_title:before.name,description:before.description,custom_tags:before.tagsJson,source:before.source,version:before.version,ticket:before.ticket,updateTime:900000};
globalThis.projectDetail={uuid:target.projectUuid,currentBranch:target.branchUuid,isV2Format:false,owner:{uuid:target.ownerUuid},archive:false,store:false,cbb_project:false};
globalThis.workerClient='f'.repeat(16);globalThis.workerMaxTicket=14;globalThis.permissionAllowed=true;
globalThis.tick=1000000;globalThis.clockCalls=0;Date.now=()=>tick++;Date.prototype.getTimezoneOffset=()=>0;
class Bus{async rpcCall(topic,args,timeout){if(this!==gVars.messageBus||timeout!==0||!Array.isArray(args))return denied('receiver');calls.push([topic,structuredCloneLocal(args)]);
if(topic==='/PrjDB/symbol/updateData'){if(args.length!==2||args[1]!==target.projectUuid||JSON.stringify(Object.keys(args[0]))!==JSON.stringify(['uuid','title','description'])||args[0].uuid!==target.symbolUuid)return denied('mutation-args');writes++;metadata={...metadata,display_title:args[0].title,description:args[0].description,updateTime:tick++,ticket:++workerMaxTicket};metadata.version=String(metadata.updateTime);}
else if(topic==='/PrjDB/symbol/getData'){if(args.length!==2||args[0]!==target.symbolUuid||args[1]!==target.projectUuid)return denied('symbol-args');}
else if(['/PrjDB/project/getData','/PrjDB/project/getClient','/PrjDB/project/getMaxTicket','canAddLib'].includes(topic)){if(args.length!==1||args[0]!==target.projectUuid)return denied('project-args');}else return denied(topic);
if(topic===${JSON.stringify(options.pending ?? "")})await new Promise(resolve=>{globalThis.release=resolve;});await Promise.resolve();${options.afterRpc ?? ""}
return{message:topic==='/PrjDB/symbol/getData'||topic==='/PrjDB/symbol/updateData'?metadata:topic==='/PrjDB/project/getClient'?workerClient:topic==='/PrjDB/project/getMaxTicket'?workerMaxTicket:topic==='canAddLib'?{hasPermission:permissionAllowed}:projectDetail};}}
globalThis.structuredCloneLocal=value=>JSON.parse(JSON.stringify(value));
class Permission{constructor(){this._isConcurrentStrictMode=false;this.readOnly=false;}get isConcurrentStrictMode(){return this._isConcurrentStrictMode;}set isConcurrentStrictMode(value){this._isConcurrentStrictMode=value;}getIframeDisableStatusPanelPcb(){return{disable:this.readOnly};}}
globalThis.gVars={currentProject:{projectId:target.projectUuid,branchUuid:target.branchUuid,isV2Format:false},isHistoryMode:false,messageBus:new Bus(),sessionStorageTabs:new Set(),urlCmd:null,globalVariableCookieData:{userInfo:${JSON.stringify(actor)}},loginedUserInfo:${JSON.stringify(actor)}};
globalThis.UI={gVars,tabBar:Tabs,concurrentDesign:new Permission()};globalThis.eda={extensionUuid:'7e06d286b1ac846ef7eab9c7f2a9ee40',lib_Symbol:{modify:()=>denied('public-modify')},sch_Document:{save:()=>denied('save')}};
globalThis.projectMgr={uuid:target.projectUuid};projectMgr.componentCache={projectMgr,symbolTemplate:{}};
globalThis.actionRunner={_currentAction:null};actionRunner.realTimeSyncActionManager={transactionRunner:actionRunner,_isRunning:false,_runnerSet:{_idMap:new Map()},_runTimer:{_mark:-1},_localActionOnceDidRunSubscription:null};
globalThis.docMemory={docMap:new Map(),_docFetchPromiseMap:new Map()};globalThis.SCH={gVars:{projectMgr,actionRunner},get docMemoryManager(){return docMemory;}};
class ClockBus{async rpcCall(...args){if(this!==gVars.concurrentBus||args.length!==1||args[0]!=='/pro-mgr/serverTime/now')return denied('clock-receiver');clockCalls++;await Promise.resolve();${options.afterClock ?? ""}return tick++;}}
gVars.concurrentBus=new ClockBus();globalThis['/'+_TAB_ID_+'/notify']=gVars.concurrentBus;
globalThis.domRoot={tagName:'DIV',ownerDocument:document,isConnected:true,children:[]};
domRoot.children=['commandWin','exitSmartSizeTool','exitPadShapeTool','project-blank-page','assembly-variant-page'].map(id=>({id,tagName:'DIV',ownerDocument:document,isConnected:true,parentElement:domRoot,getAttribute(){return null;}}));
globalThis.extraMarkers=[];globalThis.extraIframes=[];
document.querySelectorAll=function(selector){if(selector==='[id="tabbar_bodies"]')return[domRoot];if(selector==='iframe')return extraIframes;if(selector==='.blankIframeDiv')return[];if(selector.startsWith('.editframe,'))return extraMarkers;return denied('selector');};
${options.setup ?? ""}`, context, { timeout: 1000 });
  return { run: (selected: unknown = input): Promise<unknown> => Promise.resolve(runInContext(`(async()=>{${buildCurrentSymbolWriteProgram(selected)}})()`, context, { timeout: 1000 }) as unknown),
    evaluate: (source): unknown => runInContext(source, context, { timeout: 1000 }) as unknown,
    expire(): void { assert.ok(timeout !== undefined); timeout(); } };
}
async function flush(): Promise<void> { for (let index = 0; index < 100; index += 1) { await Promise.resolve(); } }

void test("current fixed symbol writer performs exactly one local metadata patch and retains both clock samples", async () => {
  const env = fixture(), envelope = structuredClone(await env.run()), result = decodeCurrentSymbolWriteReply(reply(envelope), input);
  assert.equal(env.evaluate("writes"), 1); assert.equal(env.evaluate("clockCalls"), 2);
  assert.deepEqual(structuredClone(env.evaluate("forbidden")), []);
  assert.deepEqual(result.before, before); assert.equal(result.after.name, input.desired.name); assert.equal(result.after.ticket, 15);
  assert.equal(result.after.description, input.desired.description); assert.equal(result.documentBefore.notifyTabId, "1".repeat(16));
  assert.equal(result.persistenceVerified, false); assert.equal(result.workerIdentityVerified, false);
  assert.equal(result.crossInvocationReceiverContinuityVerified, false); assert.equal(result.explicitSaveDispatched, false);
  assert.equal(result.atomicCompareAndSwap, false); assert.equal(Object.isFrozen(result), true);
});

void test("current fixed writer refuses wrong metadata, actor, permissions, tickets, editor and clock owners before mutation", async () => {
  for (const setup of ["metadata.description='drift';", "metadata.ticket++;", "metadata.source='other';", "metadata.custom_tags='[]';",
    "metadata.version='other';", "metadata.path='e'.repeat(64);", "metadata.owner.uuid='e'.repeat(32);", "metadata.docType=4;",
    "gVars.loginedUserInfo.uuid='e'.repeat(32);", "permissionAllowed=false;", "UI.concurrentDesign.readOnly=true;",
    "workerClient='e'.repeat(16);", "workerMaxTicket++;", "extraIframes.push({});", "start.isUnSaved=true;",
    "Date.prototype.getTimezoneOffset=()=>60;", "globalThis['/'+_TAB_ID_+'/notify']={};"]) {
    const env = fixture({ setup }); await assert.rejects(env.run(), /CURRENT_SYMBOL_WRITE_REFUSED:/u); assert.equal(env.evaluate("writes"), 0);
  }
  for (const change of ["gVars.messageBus=new Bus();", "gVars.concurrentBus=new ClockBus();", "Bus.prototype.rpcCall=()=>({message:{}});",
    "gVars.currentProject={...gVars.currentProject};", "Date.now=()=>tick++;", "Date.prototype.toISOString=()=>'';",
    "Date.prototype.getTimezoneOffset=()=>0;", "gVars.globalVariableCookieData.userInfo={...gVars.globalVariableCookieData.userInfo};",
    "info.tabs=[...info.tabs];", "extraMarkers.push({});", "navigator.serviceWorker.controller={};"]) {
    const env = fixture({ afterRpc: `if(calls.length===1){${change}}` });
    await assert.rejects(env.run(), /CURRENT_SYMBOL_WRITE_REFUSED:/u); assert.equal(env.evaluate("writes"), 0);
  }
});

void test("current fixed writer checks immutable deadlines immediately before dispatch and does not refresh them", async () => {
  for (const options of [{ setup: "tick=1060001;" }, { afterRpc: "if(calls.length===9)tick=1060001;" },
    { afterRpc: "if(calls.length===9)tick=999999;" }, { afterRpc: "if(calls.length===9)tick=1000000;" },
    { afterClock: "return tick+100;" }, { afterClock: "tick+=10001;" }]) {
    const env = fixture(options); await assert.rejects(env.run(), /CURRENT_SYMBOL_WRITE_REFUSED:/u); assert.equal(env.evaluate("writes"), 0);
  }
});

void test("current fixed writer treats uncertain post-write effects as failure without retry or Save", async () => {
  for (const afterRpc of ["if(writes)throw new Error('PRIVATE_NATIVE_FAILURE');", "if(writes)metadata.ticket++;",
    "if(writes)metadata.version='wrong';", "if(writes)metadata.source='changed';", "if(writes)gVars.messageBus=new Bus();",
    "if(writes)workerMaxTicket++;", "if(writes)tick=1060001;"]) {
    const env = fixture({ afterRpc }); await assert.rejects(env.run(), /^Error: CURRENT_SYMBOL_WRITE_REFUSED:/u);
    assert.equal(env.evaluate("writes"), 1); assert.deepEqual(structuredClone(env.evaluate("forbidden")), []);
  }
});

void test("current fixed writer timeout prevents late continuation both before and after its one mutation", async () => {
  for (const pending of ["canAddLib", "/PrjDB/symbol/updateData"]) {
    const env = fixture({ pending }), running = env.run(); await flush();
    assert.equal(env.evaluate("typeof release"), "function"); const count = env.evaluate("calls.length"); env.expire();
    await assert.rejects(running, { message: "CURRENT_SYMBOL_WRITE_REFUSED:TIMEOUT" });
    env.evaluate("release();"); await flush(); assert.equal(env.evaluate("calls.length"), count);
    assert.equal(env.evaluate("writes"), pending === "canAddLib" ? 0 : 1);
  }
});

void test("current fixed writer input and reply cannot promote authority or change the frozen operation", async () => {
  for (const invalid of [{ ...input, code: "private()" }, { ...input, desired: { ...input.desired, classification: [] } },
    { ...input, desired: { name: before.name, description: before.description } }, { ...input, peerNames: [" renamed "] },
    { ...input, backendWindow: { ...input.backendWindow, maximumMs: 1_060_001 } }, { ...input, rendererTimezoneOffsetMinutes: -0 },
    Object.defineProperty({ ...input }, "target", { get(): never { throw new Error("getter invoked"); } }),
    { ...input, expectedBefore: Object.defineProperty({ ...before }, "description", { get(): never { throw new Error("getter invoked"); } }) }]) {
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Node's synchronous assertion predicate verifies that rejecting an accessor did not invoke it.
    assert.throws(() => buildCurrentSymbolWriteProgram(invalid), (error: unknown) => error instanceof Error && error.message !== "getter invoked");
  }
  const env = fixture(), envelope = structuredClone(await env.run()), result = decodeCurrentSymbolWriteReply(reply(envelope), input);
  for (const invalid of [{ ...result, persistenceVerified: true }, { ...result, executionAuthorized: true }, { ...result, workerIdentityVerified: true },
    { ...result, crossInvocationReceiverContinuityVerified: true }, { ...result, after: { ...result.after, source: "changed" } },
    { ...result, afterMaxTicket: 16 }, { ...result, documentAfter: { ...result.documentAfter, notifyTabId: "2".repeat(16) } },
    { ...result, documentAfter: { ...result.documentAfter, rendererBeforeIso: "wrong" } }]) {
    assert.throws(() => decodeCurrentSymbolWriteReply(reply(encodeExactReadEnvelope(invalid)), input));
  }
});

void test("current fixed writer refuses oversized escaped or multibyte results before any RPC or mutation", () => {
  for (const text of ["a", "\n", "\u6F22"]) {
    const large = text.repeat(65_536), tags = JSON.stringify(Array.from({ length: 255 }, () => "t".repeat(511)));
    const oversized = { ...input, expectedBefore: { ...before, description: large, tagsJson: tags }, desired: { ...input.desired, description: large } };
    const env = fixture();
    assert.throws(() => env.run(oversized), /CURRENT_SYMBOL_WRITE_OUTPUT_BUDGET/u);
    assert.equal(env.evaluate("writes"), 0); assert.equal(env.evaluate("calls.length"), 0);
  }
});
