import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_PCB_RENAME_PREFLIGHT_TIMEOUT_MS } from "../src/current-pcb-rename-preflight.ts";
import { CURRENT_PCB_RENAME_STARTUP_STAGES } from "../src/current-pcb-rename-startup-guard.ts";
import { buildCurrentPcbRenameStartupObservation, decodeCurrentPcbRenameStartupObservation } from "../src/current-pcb-rename-startup-runtime.ts";
import { decodeExactReadEnvelope, encodeExactReadEnvelope } from "../src/exact-readers.ts";

const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), pcbUuid: "c".repeat(16), ownerUuid: "d".repeat(32) };
const expectedBefore = { title: "original pcb", displayTitle: "Original PCB", parentUuid: "", source: "", version: "12345", boardUuid: "",
  ticket: 12_345, updateTime: 12_345, docType: 3 } as const;
const request = { target, expectedBefore, desiredTitle: "Renamed PCB" }, startup = { sheetUuids: ["2".repeat(16)], templates: [] };
const actor = { uuid: "1".repeat(32), username: "fixture-user", nickname: "Fixture" };
function reply(value: unknown): unknown { return { content: [], structuredContent: { ok: true, result: value } }; }
interface Options { readonly before?: string; readonly afterRpc?: string; readonly pendingAt?: number; readonly nativeCbb?: string }
function fixture(options: Options = {}): { run: () => Promise<unknown>; evaluate: (source: string) => unknown; expire: () => void } {
  let timeout: (() => void) | undefined;
  const context = createContext({ TextEncoder,
    setTimeout(callback: () => void, delay: number): number { assert.equal(delay, CURRENT_PCB_RENAME_PREFLIGHT_TIMEOUT_MS); timeout = callback; return 7; },
    clearTimeout(timer: unknown): void { assert.equal(timer, 7); },
  });
  runInContext(`globalThis.window=globalThis;globalThis.top=globalThis;globalThis.calls=[];globalThis.denied=[];globalThis.getterReads=0;
globalThis.target=${JSON.stringify(target)};globalThis.beforeValue=${JSON.stringify(expectedBefore)};
globalThis.location={href:'https://client/editor?cll=warn#id='+target.projectUuid,origin:'https://client'};
globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href};globalThis.navigator={serviceWorker:{controller:null}};
globalThis.PRO_EDITOR_MODE='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM';globalThis.PRO_EDITOR_VERSION='3.2.206';globalThis._TAB_ID_='1'.repeat(16);
globalThis.start={tabId:'tab_page1',data:{doctype:-1},isAbleDelete:false,group:'start_blank',draggable:true,isDisplayNone:false};
globalThis.info={id:'editor-window-main',belong:'editor-window-main',tabs:[start],activeTabId:'tab_page1'};
class Tabs{static containerIds=['editor-window-main'];static containerTree={id:'editor-window-main'};static belongContainer='editor-window-main';static currentTabId='tab_page1';static isOpenProjectDoc=true;static isOpenOtherDoc=true;static getActiveTab(){return this.currentTabId;}static getContainerInfo(){return info;}static hasTabUnSaved(){return info.tabs.some(tab=>tab.isUnSaved===true);}static isTabUnSaved(){return this.hasTabUnSaved();}}
const forbidden=name=>{denied.push(name);throw new Error('PRIVATE_FORBIDDEN');};globalThis.fetch=()=>forbidden('network');
globalThis.metadata={uuid:target.pcbUuid,project_uuid:target.projectUuid,docType:3,title:beforeValue.title,display_title:beforeValue.displayTitle,parent_uuid:'',source:'',version:beforeValue.version,board:'',ticket:beforeValue.ticket,updateTime:beforeValue.updateTime};
globalThis.peer={...metadata,uuid:'e'.repeat(16),title:'peer pcb',display_title:'Peer PCB'};globalThis.peerMap={[metadata.uuid]:metadata,[peer.uuid]:peer};
globalThis.projectDetail={uuid:target.projectUuid,currentBranch:target.branchUuid,isV2Format:false,owner:{uuid:target.ownerUuid},archive:false,cbb_project:${options.nativeCbb ?? "false"}};
globalThis.workerClient='f'.repeat(16);globalThis.workerMaxTicket=12345;
class Bus{async rpcCall(topic,args,timeout){if(this!==gVars.messageBus||timeout!==0||!Array.isArray(args))return forbidden('receiver');calls.push([topic,[...args]]);
if(topic==='/PrjDB/pcb/getData'){if(args.length!==2||args[0]!==target.pcbUuid||args[1]!==target.projectUuid)return forbidden('pcb-args');}
else if(topic==='/PrjDB/pcb/getIdByTitle'){if(args.length!==2||args[0]!=='Renamed PCB'||args[1]!==target.projectUuid)return forbidden('name-args');}
else if(['/PrjDB/project/getData','/PrjDB/project/getClient','/PrjDB/project/getMaxTicket','/PrjDB/pcb/getAllKVDatas'].includes(topic)){if(args.length!==1||args[0]!==target.projectUuid)return forbidden('project-args');}else return forbidden(topic);
if(calls.length===${options.pendingAt ?? 0})await new Promise(resolve=>{globalThis.release=resolve;});await Promise.resolve();${options.afterRpc ?? ""}
return{message:topic==='/PrjDB/pcb/getData'?metadata:topic==='/PrjDB/pcb/getAllKVDatas'?peerMap:topic==='/PrjDB/pcb/getIdByTitle'?'':topic==='/PrjDB/project/getClient'?workerClient:topic==='/PrjDB/project/getMaxTicket'?workerMaxTicket:projectDetail};}}
class Permission{constructor(){this._isConcurrentStrictMode=false;this.readOnly=false;}get isConcurrentStrictMode(){return this._isConcurrentStrictMode;}set isConcurrentStrictMode(value){this._isConcurrentStrictMode=value;}getIframeDisableStatusPanelPcb(){return{disable:this.readOnly};}}
globalThis.gVars={currentProject:{projectId:target.projectUuid,branchUuid:target.branchUuid,isV2Format:false},isHistoryMode:false,messageBus:new Bus(),sessionStorageTabs:new Set(),urlCmd:null,globalVariableCookieData:{userInfo:${JSON.stringify(actor)}},loginedUserInfo:${JSON.stringify(actor)}};
globalThis.UI={gVars,tabBar:Tabs,concurrentDesign:new Permission()};globalThis.eda={extensionUuid:'7e06d286b1ac846ef7eab9c7f2a9ee40'};
globalThis.clockTick=1000;globalThis.clockCalls=0;Date.now=function(){return clockTick++;};
class ClockBus{async rpcCall(...args){if(this!==gVars.concurrentBus||args.length!==1||args[0]!=='/pro-mgr/serverTime/now')return forbidden('clock-receiver');clockCalls++;await Promise.resolve();return clockTick++;}}
gVars.concurrentBus=new ClockBus();globalThis['/'+_TAB_ID_+'/notify']=gVars.concurrentBus;
globalThis.projectMgr={uuid:target.projectUuid};projectMgr.componentCache={projectMgr,symbolTemplate:{}};
globalThis.actionRunner={_currentAction:null};actionRunner.realTimeSyncActionManager={transactionRunner:actionRunner,_isRunning:false,_runnerSet:{_idMap:new Map()},_runTimer:{_mark:-1},_localActionOnceDidRunSubscription:null};
globalThis.docMemory={docMap:new Map(),_docFetchPromiseMap:new Map()};globalThis.SCH={gVars:{projectMgr,actionRunner},get docMemoryManager(){return docMemory;}};
class AstManager{constructor(cbb){this.prjUuid=target.projectUuid;this.batchDepth=0;this._isClose=false;this.CBB=cbb;}startBatch(){return forbidden('startBatch');}endBatch(){return forbidden('endBatch');}}
globalThis.astManager=new AstManager(projectDetail.cbb_project);globalThis.ast={isBuild:true,isPass:false,transId:1,lastModify:123};globalThis.temp={isBuild:false,isPass:false,transId:1,lastModify:100};
globalThis.tree={manager(){return astManager;},ast(){return ast;},tempAst(){return temp;}};SCH.D={leftTree:tree};
globalThis.domRoot={tagName:'DIV',ownerDocument:document,isConnected:true,children:[]};
domRoot.children=['commandWin','exitSmartSizeTool','exitPadShapeTool','project-blank-page','assembly-variant-page'].map(id=>({id,tagName:'DIV',ownerDocument:document,isConnected:true,parentElement:domRoot,getAttribute(){return null;}}));
globalThis.extraMarkers=[];globalThis.extraIframes=[];globalThis.standardPanels=[];globalThis.standardMarkers=[];
document.querySelectorAll=function(selector){if(selector==='[id="tabbar_bodies"]')return[domRoot];if(selector==='iframe')return extraIframes;if(selector==='.blankIframeDiv')return[];if(selector.startsWith('.editframe,'))return extraMarkers;if(selector==='div[data-activekey="device-standardization"]')return standardPanels;if(selector==='[id="device-standardization"]')return standardMarkers;return forbidden('selector');};
${options.before ?? ""}`, context, { timeout: 1000 });
  return { run: (): Promise<unknown> => Promise.resolve(runInContext(`(async()=>{${buildCurrentPcbRenameStartupObservation(request, startup)}})()`, context, { timeout: 1000 }) as unknown),
    evaluate: (source): unknown => runInContext(source, context, { timeout: 1000 }) as unknown,
    expire(): void { assert.ok(timeout !== undefined); timeout(); } };
}
async function flush(): Promise<void> { for (let index = 0; index < 100; index += 1) { await Promise.resolve(); } }

void test("PCB startup wraps one fixed readonly preflight with retained SCH/PCB owners and no complete-AST claim", async () => {
  const env = fixture(), raw = structuredClone(await env.run()); const result = decodeCurrentPcbRenameStartupObservation(reply(raw), request, startup);
  assert.deepEqual(result.runtimeObservation.actor, actor); assert.equal(result.clientTicketObservation.client, "f".repeat(16));
  assert.equal(env.evaluate("calls.length"), 18); assert.equal(env.evaluate("clockCalls"), 4); assert.deepEqual(structuredClone(env.evaluate("denied")), []);
  const wrapper = decodeExactReadEnvelope(raw); assert.ok(wrapper !== null && typeof wrapper === "object" && !Array.isArray(wrapper));
  for (const key of ["completeAstSourceBindingVerified", "startupLocalChangesExcluded", "permissionVerified", "backendActorVerified", "backendClockVerified",
    "producerBindingVerified", "writerAuthority", "crossInvocationReceiverContinuityVerified", "globalIdleVerified", "persistenceVerified", "executionAuthorized"]) {
    assert.equal(Reflect.get(wrapper, key), false);
    assert.throws(() => decodeCurrentPcbRenameStartupObservation(reply(encodeExactReadEnvelope({ ...wrapper, [key]: true })), request, startup));
  }
  assert.doesNotMatch(buildCurrentPcbRenameStartupObservation(request, startup), /\/pcb\/updateData|modifyPcbName|\.publish\(|startBatch\(|endBatch\(/u);
});

void test("PCB startup refuses pending holders, dirty ASTs and getters before the first native read", async () => {
  for (const before of ["docMemory.docMap.set('unrequested',{});", "projectMgr.componentCache.symbolTemplate.extra={};", "astManager.batchDepth=1;",
    "ast.transId++;", "temp.isPass=true;", "extraIframes.push({});", "standardPanels.push({});", "standardMarkers.push({});", "gVars.loginedUserInfo.uuid='f'.repeat(32);",
    "Object.defineProperty(ast,'lastModify',{get(){getterReads++;return 123;}});"]) {
    const env = fixture({ before }), raw = structuredClone(await env.run());
    assert.throws(() => decodeCurrentPcbRenameStartupObservation(reply(raw), request, startup), /startup:/u);
    assert.equal(env.evaluate("calls.length"), 0); assert.equal(env.evaluate("getterReads"), 0);
  }
});

void test("PCB startup accepts native raw CBB representations through the composed preflight", async () => {
  for (const value of ["false", "0", "-0", "null", "undefined"]) {
    const env = fixture({ nativeCbb: value });
    const raw = structuredClone(await env.run());
    assert.equal(decodeCurrentPcbRenameStartupObservation(reply(raw), request, startup).clientTicketObservation.client, "f".repeat(16));
    assert.equal(env.evaluate("calls.length"), 18); assert.equal(env.evaluate("denied.length"), 0);
    assert.equal(env.evaluate(`Object.is(astManager.CBB,${value})`), true);
  }
});

void test("PCB startup preserves raw CBB identity across the awaited preflight and reports exact fixed failures", async () => {
  for (const [before, afterRpc, stage, reads] of [
    ["astManager.CBB='private-detail';", "", "pcb-cbb", 0],
    ["astManager.batchDepth=1;", "", "pcb-manager", 0],
    ["ast.transId=2;", "", "pcb-ast-version", 0],
    ["", "if(calls.length===18)astManager.CBB=0;", "pcb-stability", 18],
  ] as const) {
    const env = fixture({ before, afterRpc }), raw = structuredClone(await env.run());
    assert.throws(() => decodeCurrentPcbRenameStartupObservation(reply(raw), request, startup),
      { message: `Current PCB startup observation refused [startup:${stage}].` });
    assert.equal(env.evaluate("calls.length"), reads); assert.equal(env.evaluate("getterReads"), 0);
    assert.equal(env.evaluate("denied.length"), 0);
  }
});

void test("PCB startup decoder accepts only its fixed diagnostic inventory", async () => {
  const raw = structuredClone(await fixture({ before: "astManager.CBB=true;" }).run());
  const wrapper = decodeExactReadEnvelope(raw); assert.ok(wrapper !== null && typeof wrapper === "object");
  for (const stage of [...CURRENT_PCB_RENAME_STARTUP_STAGES, "pcb-ast"]) {
    assert.throws(() => decodeCurrentPcbRenameStartupObservation(reply(encodeExactReadEnvelope({ ...wrapper, stage })), request, startup),
      { message: `Current PCB startup observation refused [startup:${stage}].` });
  }
  for (const stage of ["pcb-cbb:private-detail", "unknown", "", null, ["pcb-cbb"]]) {
    assert.throws(() => decodeCurrentPcbRenameStartupObservation(reply(encodeExactReadEnvelope({ ...wrapper, stage })), request, startup),
      { message: "Current PCB startup observation refused." });
  }
});

void test("PCB startup retains completed preflight even when a subsequent original-holder check refuses", async () => {
  for (const change of ["ast={...ast};", "ast.transId=temp.transId=2;", "ast.lastModify++;", "SCH.D.leftTree={...tree};",
    "projectMgr.componentCache.symbolTemplate.extra={};", "docMemory.docMap.set('unrequested',{});", "standardPanels.push({});", "standardMarkers.push({});"]) {
    const env = fixture({ afterRpc: `if(calls.length===18){${change}}` }), raw = structuredClone(await env.run());
    const wrapper = decodeExactReadEnvelope(raw); assert.ok(wrapper !== null && typeof wrapper === "object");
    assert.equal(Reflect.get(wrapper, "profile"), "private.current-pcb-rename-startup-failure.v1"); assert.notEqual(Reflect.get(wrapper, "preflight"), null);
    assert.throws(() => decodeCurrentPcbRenameStartupObservation(reply(raw), request, startup), /startup:/u); assert.equal(env.evaluate("calls.length"), 18);
  }
});

void test("PCB startup timeout preserves refusal and cannot resume more reads after late completion", async () => {
  const env = fixture({ pendingAt: 1 }), running = env.run(); await flush(); assert.equal(env.evaluate("typeof release"), "function"); env.expire();
  const raw = structuredClone(await running); assert.throws(() => decodeCurrentPcbRenameStartupObservation(reply(raw), request, startup), /startup:preflight/u);
  env.evaluate("release();"); await flush(); assert.equal(env.evaluate("calls.length"), 1); assert.equal(env.evaluate("clockCalls"), 1);
});
