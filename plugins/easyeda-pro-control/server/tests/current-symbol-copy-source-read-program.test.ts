/** Synthetic original SQLite plans and isolated native-receiver models only. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { prepareCurrentSymbolCopyPlan } from "../src/current-symbol-copy-plan.ts";
import type { CurrentSymbolCopyPlan } from "../src/current-symbol-copy-plan.ts";
import { buildCurrentSymbolCopySourceReadProgram, decodeCurrentSymbolCopySourceReadReply } from "../src/current-symbol-copy-source-read-program.ts";
import { CURRENT_SAVED_SYMBOL_READ_TIMEOUT_MS, buildCurrentSavedSymbolReadProgram } from "../src/current-symbol-saved-read-program.ts";
import { encodeExactReadEnvelope } from "../src/exact-readers.ts";
import { expectedSavedSymbolContent, prepareCurrentCanvasSegmentsSavedSymbolProjection, prepareSavedSymbolProjection } from "../src/saved-symbol-projection.ts";
import { IDS, encrypted, inventory, mutate, fixture as sqlFixture } from "./helpers/symbol-sql-fixture.ts";

const target = { projectUuid: "a".repeat(64), branchUuid: IDS.branch, symbolUuid: IDS.target, ownerUuid: IDS.actor };
const actor = { uuid: IDS.actor, username: "fixture-user", nickname: "Fixture" };
const metadata = { name: "Source", description: "Exact\nmetadata", tagsJson: '["Exact"]', source: "template", version: "100", ticket: 90 };
const input = { target, expectedBefore: metadata, expectedActor: actor, maximumTicket: 100, startup: { sheetUuids: ["2".repeat(16)], templates: [] } };
function row(type: string, ticket: number, id: string, body?: unknown): string {
  return `${JSON.stringify({ type, ticket, id })}||${body === undefined ? "" : JSON.stringify(body)}`;
}
function header(uuid: string, ticket: number, time: number): string {
  return `${JSON.stringify({ type: "DOCHEAD", ticket })}||${JSON.stringify({ docType: "SYMBOL", client: "b".repeat(16), uuid,
    updateTime: time, version: String(time), editVersion: "3.2.206" })}`;
}
const edit = `{"type":"EDIT_HEAD"}||${JSON.stringify({ ...actor, updateTime: 500 })}`;
const canvas = [row("PART", 3, "part", { title: "A" }), row("RECT", 4, "rect", { partId: "part", x: 0, y: 0 })];
const sourceMeta = { title: "Source", description: metadata.description, tags: ["Exact"], docType: 2, source: "template" };
const raw = [edit, header(IDS.target, 100, 100), row("META", 90, "META", sourceMeta), ...canvas].join("|\n");
let original: Promise<CurrentSymbolCopyPlan> | undefined;
function plan(): Promise<CurrentSymbolCopyPlan> {
  original ??= (async (): Promise<CurrentSymbolCopyPlan> => {
    const baseline = await sqlFixture();
    mutate(baseline.path, `UPDATE projects SET uuid='${target.projectUuid}'; UPDATE branches SET project_uuid='${target.projectUuid}';
      UPDATE project_structures SET project_uuid='${target.projectUuid}'; UPDATE history_data SET dataStr='${encrypted(raw, IDS.oldHead, IDS.oldKey)}' WHERE id=7`);
    return prepareCurrentSymbolCopyPlan(await inventory(baseline.path), { projectUuid: target.projectUuid, branchUuid: target.branchUuid, symbolUuid: IDS.target });
  })();
  return original;
}
function reply(value: unknown): unknown { return { content: [], structuredContent: { ok: true, result: value } }; }
interface Options { readonly setup?: string; readonly afterRpc?: string; readonly pendingAt?: number; readonly content?: string }
function fixture(copy: CurrentSymbolCopyPlan, options: Options = {}): { run: (selected?: unknown) => Promise<unknown>; evaluate: (source: string) => unknown; expire: () => void } {
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
globalThis.workerClient='f'.repeat(16);globalThis.workerMaxTicket=100;globalThis.savedContent=${JSON.stringify(options.content ?? "exact native text")};
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
  return { run: (selected: unknown = input): Promise<unknown> => Promise.resolve(runInContext(`(async()=>{${buildCurrentSymbolCopySourceReadProgram(copy, selected)}})()`, context, { timeout: 1000 }) as unknown),
    evaluate: (source): unknown => runInContext(source, context, { timeout: 1000 }) as unknown,
    expire(): void { assert.ok(timeout !== undefined); timeout(); } };
}
async function flush(): Promise<void> { for (let index = 0; index < 100; index += 1) { await Promise.resolve(); } }

void test("original-source reader accepts exact raw/cache projections and binds the source atom ticket below the worker maximum", async () => {
  const copy = await plan(), projectionInput = { chunks: [raw], targetUuid: IDS.target, maximumTicket: 100, currentEditVersion: "3.2.206" };
  const models = [await prepareSavedSymbolProjection(projectionInput), await prepareCurrentCanvasSegmentsSavedSymbolProjection(projectionInput)];
  for (const model of models) {
    const content = expectedSavedSymbolContent(model, "f".repeat(16)), env = fixture(copy, { content });
    const envelope = structuredClone(await env.run()), result = decodeCurrentSymbolCopySourceReadReply(reply(envelope), copy, input);
    assert.equal(result.target.symbolUuid, IDS.target); assert.equal(result.expectedBefore.ticket, 90); assert.equal(result.observation.maximumTicket, 100);
    assert.equal(result.expectedBefore.source, "template"); assert.equal(result.observation.content, content); assert.equal(Object.isFrozen(result.observation), true);
    assert.equal(env.evaluate("contentReads"), 2); assert.equal(env.evaluate("calls.length"), 18); assert.deepEqual(structuredClone(env.evaluate("forbidden")), []);
    assert.equal(result.mutationDispatched, false); assert.equal(result.explicitSaveDispatched, false); assert.equal(result.observation.producerBindingVerified, false);
  }
  assert.throws(() => buildCurrentSavedSymbolReadProgram(input));
});

void test("original-source compiler requires original plan, existing source, exact owner/metadata and reserved maximum", async () => {
  const copy = await plan();
  assert.throws(() => buildCurrentSymbolCopySourceReadProgram(structuredClone(copy), input), /original/u);
  for (const selected of [{ ...input, target: { ...target, symbolUuid: "c".repeat(16) } }, { ...input, target: { ...target, ownerUuid: IDS.peer } },
    { ...input, target: { ...target, projectUuid: "f".repeat(64) } }, { ...input, expectedBefore: { ...metadata, name: "chosen" } },
    { ...input, expectedBefore: { ...metadata, source: "" } }, { ...input, expectedBefore: { ...metadata, ticket: 100 } },
    { ...input, expectedBefore: { ...metadata, version: "101" } }, { ...input, maximumTicket: 101 }, { ...input, maximumTicket: 90 },
    { ...input, maximumTicket: Number.MAX_SAFE_INTEGER }, { ...input, extra: true }]) {
    assert.throws(() => buildCurrentSymbolCopySourceReadProgram(copy, selected));
  }
  let getter = false;
  assert.throws(() => buildCurrentSymbolCopySourceReadProgram(copy, { ...input, get expectedActor() { getter = true; return actor; } })); assert.equal(getter, false);
});

void test("original-source reader rejects project, metadata, worker, actor and editor changes before drawing reads", async () => {
  const copy = await plan();
  for (const setup of ["metadata.ticket++;", "metadata.description='drift';", "metadata.version='200';", "metadata.source='';", "workerMaxTicket--;",
    "projectDetail.currentBranch='e'.repeat(32);", "metadata.owner={uuid:'e'.repeat(32)};", "gVars.loginedUserInfo.uuid='e'.repeat(32);",
    "extraIframes.push({});", "start.isUnSaved=true;", "docMemory.docMap.set('other',{});", "actionRunner._currentAction={};",
    "UI.concurrentDesign.readOnly=true;", "PRO_EDITOR_VERSION='3.2.207';"]) {
    const env = fixture(copy, { setup }); await assert.rejects(env.run(), /CURRENT_SYMBOL_COPY_SOURCE_READ_REFUSED/u);
    assert.equal(env.evaluate("contentReads"), 0); assert.deepEqual(structuredClone(env.evaluate("forbidden")), []);
  }
});

void test("original-source reader retains receivers across awaits and refuses unequal, oversized or late results", async () => {
  const copy = await plan();
  for (const afterRpc of ["if(calls.length===1)gVars.messageBus=new Bus();", "if(contentReads)workerClient='e'.repeat(16);",
    "if(contentReads)workerMaxTicket++;", "if(contentReads)metadata.description='changed';", "if(contentReads)extraMarkers.push({});",
    "if(contentReads)gVars.globalVariableCookieData.userInfo={...gVars.globalVariableCookieData.userInfo};",
    "if(contentReads)savedContent='é'.repeat(32769);", "if(contentReads===2)savedContent+='changed';", "if(contentReads)throw new Error('PRIVATE_NATIVE_ERROR');"]) {
    const env = fixture(copy, { afterRpc }); await assert.rejects(env.run(), /^Error: CURRENT_SYMBOL_COPY_SOURCE_READ_REFUSED$/u);
    assert.deepEqual(structuredClone(env.evaluate("forbidden")), []);
  }
  const env = fixture(copy, { pendingAt: 5 }), pending = env.run(); await flush(); assert.equal(env.evaluate("calls.length"), 5); env.expire();
  await assert.rejects(pending, /CURRENT_SYMBOL_COPY_SOURCE_READ_REFUSED/u); env.evaluate("release()"); await flush(); assert.equal(env.evaluate("calls.length"), 5);
});

void test("original-source decoder binds exact saved drawing bytes rather than accepting stable arbitrary content", async () => {
  const copy = await plan();
  const projection = await prepareSavedSymbolProjection({ chunks: [raw], targetUuid: IDS.target, maximumTicket: 100, currentEditVersion: "3.2.206" });
  const content = expectedSavedSymbolContent(projection, "f".repeat(16)), env = fixture(copy, { content });
  const envelope = structuredClone(await env.run()), result = decodeCurrentSymbolCopySourceReadReply(reply(envelope), copy, input);
  for (const value of [{ ...result, profile: "private.current-symbol-copy-saved-read-observation.v1" }, { ...result, samples: 1 }, { ...result, mutationDispatched: true },
    { ...result, observation: { ...result.observation, maximumTicket: 101 } }, { ...result, target: { ...result.target, ownerUuid: IDS.peer } },
    { ...result, observation: { ...result.observation, content: "é".repeat(32_769) } }, { ...result, observation: { ...result.observation, content: "\\uD800" } },
    { ...result, observation: { ...result.observation, content: `${content} ` } }, { ...result, observation: { ...result.observation, content: "stable arbitrary native text" } }]) {
    assert.throws(() => decodeCurrentSymbolCopySourceReadReply(reply(encodeExactReadEnvelope(value)), copy, input));
  }
  assert.throws(() => decodeCurrentSymbolCopySourceReadReply(reply(envelope), structuredClone(copy), input), /original/u);
});
