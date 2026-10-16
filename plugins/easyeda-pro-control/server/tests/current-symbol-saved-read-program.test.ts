import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SAVED_SYMBOL_READ_TIMEOUT_MS, buildCurrentSavedSymbolReadProgram, decodeCurrentSavedSymbolReadReply } from "../src/current-symbol-saved-read-program.ts";
import { encodeExactReadEnvelope } from "../src/exact-readers.ts";

const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), symbolUuid: "c".repeat(16), ownerUuid: "d".repeat(32) };
const actor = { uuid: "1".repeat(32), username: "fixture-user", nickname: "Fixture" };
const metadata = { name: "Saved symbol", description: "Exact\nmetadata", tagsJson: '["Exact"]', source: "template", version: "123456", ticket: 15 };
const input = { target, expectedBefore: metadata, expectedActor: actor, maximumTicket: 15, startup: { sheetUuids: ["2".repeat(16)], templates: [] } };
function reply(value: unknown): unknown { return { content: [], structuredContent: { ok: true, result: value } }; }
interface Options { readonly setup?: string; readonly afterRpc?: string; readonly pendingAt?: number }
function fixture(options: Options = {}): { run: (selected?: unknown) => Promise<unknown>; evaluate: (source: string) => unknown; expire: () => void } {
  let timeout: (() => void) | undefined;
  const context = createContext({ TextEncoder,
    setTimeout(callback: () => void, delay: number): number { assert.equal(delay, CURRENT_SAVED_SYMBOL_READ_TIMEOUT_MS); timeout = callback; return 7; },
    clearTimeout(timer: unknown): void { assert.equal(timer, 7); },
  });
  runInContext(`globalThis.window=globalThis;globalThis.top=globalThis;globalThis.calls=[];globalThis.forbidden=[];globalThis.contentReads=0;
globalThis.target=${JSON.stringify(target)};globalThis.before=${JSON.stringify(metadata)};
globalThis.location={href:'https://client/editor?cll=warn#id='+target.projectUuid,origin:'https://client'};
globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href};globalThis.navigator={serviceWorker:{controller:null}};
globalThis.PRO_EDITOR_MODE='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM';globalThis.PRO_EDITOR_VERSION='3.2.206';
globalThis.start={tabId:'tab_page1',data:{doctype:-1},isAbleDelete:false,group:'start_blank',draggable:true,isDisplayNone:false};
globalThis.info={id:'editor-window-main',belong:'editor-window-main',tabs:[start],activeTabId:'tab_page1'};
class Tabs{static containerIds=['editor-window-main'];static containerTree={id:'editor-window-main'};static belongContainer='editor-window-main';static currentTabId='tab_page1';static isOpenProjectDoc=true;static isOpenOtherDoc=true;static getActiveTab(){return this.currentTabId;}static getContainerInfo(){return info;}static hasTabUnSaved(){return info.tabs.some(tab=>tab.isUnSaved===true);}static isTabUnSaved(){return this.hasTabUnSaved();}}
const denied=name=>{forbidden.push(name);throw new Error('PRIVATE_FORBIDDEN');};
globalThis.fetch=()=>denied('network');globalThis.metadata={uuid:target.symbolUuid,project_uuid:target.projectUuid,path:target.projectUuid,docType:2,owner:{uuid:target.ownerUuid},display_title:before.name,description:before.description,custom_tags:before.tagsJson,source:before.source,version:before.version,ticket:before.ticket};
globalThis.projectDetail={uuid:target.projectUuid,currentBranch:target.branchUuid,isV2Format:false,owner:{uuid:target.ownerUuid},archive:false,store:false,cbb_project:false};
globalThis.workerClient='f'.repeat(16);globalThis.workerMaxTicket=15;globalThis.savedContent='exact native text';
class Bus{async rpcCall(topic,args,timeout){if(this!==gVars.messageBus||timeout!==0||!Array.isArray(args))return denied('receiver');calls.push([topic,JSON.parse(JSON.stringify(args))]);
if(topic==='/PrjDB/symbol/getData'||topic==='/PrjDB/symbol/getStr'){if(args.length!==2||args[0]!==target.symbolUuid||args[1]!==target.projectUuid)return denied('symbol-args');}
else if(['/PrjDB/project/getData','/PrjDB/project/getClient','/PrjDB/project/getMaxTicket'].includes(topic)){if(args.length!==1||args[0]!==target.projectUuid)return denied('project-args');}else return denied(topic);
if(topic==='/PrjDB/symbol/getStr')contentReads++;
if(calls.length===${options.pendingAt ?? 0})await new Promise(resolve=>{globalThis.release=resolve;});await Promise.resolve();${options.afterRpc ?? ""}
return{message:topic==='/PrjDB/symbol/getStr'?savedContent:topic==='/PrjDB/symbol/getData'?metadata:topic==='/PrjDB/project/getClient'?workerClient:topic==='/PrjDB/project/getMaxTicket'?workerMaxTicket:projectDetail};}}
class Permission{constructor(){this._isConcurrentStrictMode=false;this.readOnly=false;}get isConcurrentStrictMode(){return this._isConcurrentStrictMode;}set isConcurrentStrictMode(value){this._isConcurrentStrictMode=value;}getIframeDisableStatusPanelPcb(){return{disable:this.readOnly};}}
globalThis.gVars={currentProject:{projectId:target.projectUuid,branchUuid:target.branchUuid,isV2Format:false},isHistoryMode:false,messageBus:new Bus(),sessionStorageTabs:new Set(),urlCmd:null,globalVariableCookieData:{userInfo:${JSON.stringify(actor)}},loginedUserInfo:${JSON.stringify(actor)}};
globalThis.UI={gVars,tabBar:Tabs,concurrentDesign:new Permission()};globalThis.eda={extensionUuid:'7e06d286b1ac846ef7eab9c7f2a9ee40'};
globalThis.projectMgr={uuid:target.projectUuid};projectMgr.componentCache={projectMgr,symbolTemplate:{}};
globalThis.actionRunner={_currentAction:null};actionRunner.realTimeSyncActionManager={transactionRunner:actionRunner,_isRunning:false,_runnerSet:{_idMap:new Map()},_runTimer:{_mark:-1},_localActionOnceDidRunSubscription:null};
globalThis.docMemory={docMap:new Map(),_docFetchPromiseMap:new Map()};globalThis.SCH={gVars:{projectMgr,actionRunner},get docMemoryManager(){return docMemory;}};
globalThis.domRoot={tagName:'DIV',ownerDocument:document,isConnected:true,children:[]};
domRoot.children=['commandWin','exitSmartSizeTool','exitPadShapeTool','project-blank-page','assembly-variant-page'].map(id=>({id,tagName:'DIV',ownerDocument:document,isConnected:true,parentElement:domRoot,getAttribute(){return null;}}));
globalThis.extraMarkers=[];globalThis.extraIframes=[];
document.querySelectorAll=function(selector){if(selector==='[id="tabbar_bodies"]')return[domRoot];if(selector==='iframe')return extraIframes;if(selector==='.blankIframeDiv')return[];if(selector.startsWith('.editframe,'))return extraMarkers;return denied('selector');};
${options.setup ?? ""}`, context, { timeout: 1000 });
  return { run: (selected: unknown = input): Promise<unknown> => Promise.resolve(runInContext(`(async()=>{${buildCurrentSavedSymbolReadProgram(selected)}})()`, context, { timeout: 1000 }) as unknown),
    evaluate: (source): unknown => runInContext(source, context, { timeout: 1000 }) as unknown,
    expire(): void { assert.ok(timeout !== undefined); timeout(); } };
}
async function flush(): Promise<void> { for (let index = 0; index < 100; index += 1) { await Promise.resolve(); } }

void test("current saved-content observer reads twice without editor navigation, mutation or Save", async () => {
  const env = fixture(), envelope = structuredClone(await env.run()), result = decodeCurrentSavedSymbolReadReply(reply(envelope), input);
  assert.equal(env.evaluate("contentReads"), 2); assert.equal(env.evaluate("calls.length"), 18);
  assert.deepEqual(structuredClone(env.evaluate("forbidden")), []);
  assert.equal(result.observation.content, "exact native text"); assert.equal(result.observation.workerClient, "f".repeat(16));
  assert.deepEqual(result.expectedBefore, metadata); assert.equal(result.noEditorTabsObserved, true);
  assert.equal(result.observation.completionProved, false); assert.equal(result.explicitSaveDispatched, false);
});

void test("current saved-content observer refuses changed metadata, ticket, actor and loaded-editor state", async () => {
  for (const setup of ["metadata.description='drift';", "metadata.ticket++;", "metadata.source='changed';", "metadata.custom_tags='[]';",
    "metadata.version='other';", "metadata.owner.uuid='e'.repeat(32);", "metadata.docType=4;", "workerMaxTicket++;",
    "gVars.loginedUserInfo.uuid='e'.repeat(32);", "extraIframes.push({});", "start.isUnSaved=true;", "docMemory.docMap.set('other',{});",
    "actionRunner._currentAction={};", "UI.concurrentDesign.readOnly=true;", "PRO_EDITOR_VERSION='3.2.207';"]) {
    const env = fixture({ setup }); await assert.rejects(env.run(), /CURRENT_SAVED_SYMBOL_READ_REFUSED/u);
    assert.equal(env.evaluate("contentReads"), 0); assert.deepEqual(structuredClone(env.evaluate("forbidden")), []);
  }
});

void test("current saved-content observer retains receivers and rejects late drift, oversized text and unequal samples", async () => {
  for (const afterRpc of ["if(calls.length===1)gVars.messageBus=new Bus();", "if(contentReads)workerClient='e'.repeat(16);",
    "if(contentReads)workerMaxTicket++;", "if(contentReads)metadata.description='changed';", "if(contentReads)extraMarkers.push({});",
    "if(contentReads)gVars.globalVariableCookieData.userInfo={...gVars.globalVariableCookieData.userInfo};",
    "if(contentReads)savedContent='é'.repeat(32769);", "if(contentReads===2)savedContent+='changed';",
    "if(contentReads)throw new Error('PRIVATE_NATIVE_ERROR');"]) {
    const env = fixture({ afterRpc }); await assert.rejects(env.run(), /^Error: CURRENT_SAVED_SYMBOL_READ_REFUSED$/u);
    assert.deepEqual(structuredClone(env.evaluate("forbidden")), []);
  }
});

void test("current saved-content timeout stops late reads and never retries the pending native request", async () => {
  const env = fixture({ pendingAt: 5 }), pending = env.run(); await flush();
  assert.equal(env.evaluate("contentReads"), 1); assert.equal(env.evaluate("calls.length"), 5); env.expire();
  await assert.rejects(pending, /CURRENT_SAVED_SYMBOL_READ_REFUSED/u);
  env.evaluate("release()"); await flush(); assert.equal(env.evaluate("calls.length"), 5);
});

void test("current saved-content compiler and decoder reject malformed data without invoking getters", async () => {
  let getter = false;
  assert.throws(() => buildCurrentSavedSymbolReadProgram({ ...input, get expectedActor() { getter = true; return actor; } }));
  assert.equal(getter, false);
  for (const value of [{ ...input, extra: true }, { ...input, maximumTicket: -0 }, { ...input, maximumTicket: 14 },
    { ...input, target: { ...target, extra: true } }, { ...input, startup: { sheetUuids: [], templates: [] } }]) {
    assert.throws(() => buildCurrentSavedSymbolReadProgram(value));
  }
  const env = fixture(), envelope = structuredClone(await env.run());
  const result = decodeCurrentSavedSymbolReadReply(reply(envelope), input);
  for (const value of [{ ...result, extra: true }, { ...result, samples: 1 }, { ...result, mutationDispatched: true },
    { ...result, observation: { ...result.observation, projectUuid: "e".repeat(64) } },
    { ...result, observation: { ...result.observation, maximumTicket: 16 } },
    { ...result, observation: { ...result.observation, content: "é".repeat(32_769) } },
    { ...result, observation: { ...result.observation, content: "\uD800" } }]) {
    assert.throws(() => decodeCurrentSavedSymbolReadReply(reply(encodeExactReadEnvelope(value)), input));
  }
});
