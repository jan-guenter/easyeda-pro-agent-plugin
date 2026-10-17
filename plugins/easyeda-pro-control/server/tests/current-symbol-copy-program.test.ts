/** Completed synthetic SQL readers and an isolated VM, never an application. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SYMBOL_COPY_PROGRAM_MAX_BYTES, CURRENT_SYMBOL_COPY_TIMEOUT_MS, buildCurrentSymbolCopyProgram,
  currentSymbolCopyProgramInputSchema, decodeCurrentSymbolCopyReply, decodeCurrentSymbolCopyStoppedReply } from "../src/current-symbol-copy-program.ts";
import { currentSymbolCopyProgramSource, prepareCurrentSymbolCopyPlan } from "../src/current-symbol-copy-plan.ts";
import { expectedSavedSymbolContent, prepareSavedSymbolProjection } from "../src/saved-symbol-projection.ts";
import { encodeExactReadEnvelope } from "../src/exact-readers.ts";
import { IDS, encrypted, inventory, mutate, fixture as sqlFixture } from "./helpers/symbol-sql-fixture.ts";

const target = { projectUuid: "1".repeat(64), branchUuid: IDS.branch, symbolUuid: IDS.target, ownerUuid: IDS.actor };
const actor = { uuid: IDS.actor, username: "synthetic-user", nickname: "Synthetic" };
const CLIENT = "a".repeat(16), CREATED = "e".repeat(16);
const META = { title: "Source", description: "Description", tags: ["tag"], docType: 2, source: "template" };
function record(header: unknown, body?: unknown): string { return `${JSON.stringify(header)}||${body === undefined ? "" : JSON.stringify(body)}`; }
function head(uuid: string, ticket: number): string {
  return record({ type: "DOCHEAD", ticket }, { docType: "SYMBOL", client: CLIENT, uuid, updateTime: 900_000,
    version: "900000", editVersion: "3.2.206" });
}
async function preparation(description = "Description"): Promise<{
  plan: Awaited<ReturnType<typeof prepareCurrentSymbolCopyPlan>>;
  input: Record<string, unknown>;
}> {
  const sourceMeta = { ...META, description };
  const chunks = [[record({ type: "EDIT_HEAD" }, { ...actor, updateTime: 900_000 }), head(IDS.target, 100),
    record({ type: "META", ticket: 100, id: "META" }, sourceMeta), record({ type: "PART", ticket: 3, id: "part" }, { title: "A" }),
    record({ type: "RECT", ticket: 4, id: "rect" }, { partId: "part", x: 0, y: 0 }), head(IDS.peer, 2),
    record({ type: "META", ticket: 2, id: "META" }, { title: "Peer", description: "Keep", tags: [], docType: 18, source: "" })].join("|\n")];
  const database = await sqlFixture();
  mutate(database.path, `UPDATE projects SET uuid='${target.projectUuid}'; UPDATE branches SET project_uuid='${target.projectUuid}';
    UPDATE project_structures SET project_uuid='${target.projectUuid}'; UPDATE project_images SET project_uuid='${target.projectUuid}';
    UPDATE history_data SET dataStr='${encrypted(chunks[0] ?? "", IDS.oldHead, IDS.oldKey)}' WHERE uuid='${IDS.oldHead}'`);
  const before = await inventory(database.path), plan = await prepareCurrentSymbolCopyPlan(before, {
    projectUuid: target.projectUuid, branchUuid: target.branchUuid, symbolUuid: target.symbolUuid });
  const projection = await prepareSavedSymbolProjection({ chunks, targetUuid: target.symbolUuid, maximumTicket: 100, currentEditVersion: "3.2.206" });
  const sourceObservation = { profile: "private.saved-symbol-content-observation.v1", targetUuid: target.symbolUuid, maximumTicket: 100,
    workerClient: CLIENT, content: expectedSavedSymbolContent(projection, CLIENT) };
  return { plan, input: { target, expectedBefore: { name: sourceMeta.title, description, tagsJson: JSON.stringify(sourceMeta.tags),
    source: sourceMeta.source, version: "900000", ticket: 100 }, expectedActor: actor, expectedWorker: { client: CLIENT, maxTicket: 100 },
  startup: { sheetUuids: ["2".repeat(16)], templates: [] }, rendererTimezoneOffsetMinutes: 0,
  backendWindow: { minimumMs: 1_000_000, maximumMs: 1_060_000 }, documentWindow: { minimumMs: 1_000_000, maximumMs: 1_060_000 }, sourceObservation } };
}
type Prepared = Awaited<ReturnType<typeof preparation>>;
interface Options {
  readonly setup?: string; readonly afterRpc?: string; readonly afterClock?: string; readonly pending?: string;
  readonly pendingAfterCopy?: boolean; readonly cleanupFails?: boolean;
}
function fixture(prepared: Prepared, options: Options = {}): { run: (selected?: unknown) => Promise<unknown>; evaluate: (source: string) => unknown; expire: () => void } {
  let timeout: (() => void) | undefined;
  const source = currentSymbolCopyProgramSource(prepared.plan, prepared.input["sourceObservation"]);
  const context = createContext({ TextEncoder,
    setTimeout(callback: () => void, delay: number): number { assert.equal(delay, CURRENT_SYMBOL_COPY_TIMEOUT_MS); timeout = callback; return 7; },
    clearTimeout(timer: number): void { assert.equal(timer, 7); if (options.cleanupFails === true) { throw new Error("PRIVATE_CLEANUP_FAILURE"); } },
  });
  runInContext(`globalThis.window=globalThis;globalThis.top=globalThis;globalThis.calls=[];globalThis.writes=0;globalThis.forbidden=[];
globalThis.target=${JSON.stringify(target)};globalThis.before=${JSON.stringify(prepared.input["expectedBefore"])};
globalThis.sourceContent=${JSON.stringify(source.sourceContent)};globalThis.sourceContentAfterCopy=${JSON.stringify(source.sourceContentAfterCopy)};
globalThis.location={href:'https://client/editor?cll=warn#id='+target.projectUuid,origin:'https://client'};
globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href};globalThis.navigator={serviceWorker:{controller:null}};
globalThis.PRO_EDITOR_MODE='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM';globalThis.PRO_EDITOR_VERSION='3.2.206';globalThis._TAB_ID_='1'.repeat(16);
globalThis.start={tabId:'tab_page1',data:{doctype:-1},isAbleDelete:false,group:'start_blank',draggable:true,isDisplayNone:false};
globalThis.info={id:'editor-window-main',belong:'editor-window-main',tabs:[start],activeTabId:'tab_page1'};
class Tabs{static containerIds=['editor-window-main'];static containerTree={id:'editor-window-main'};static belongContainer='editor-window-main';static currentTabId='tab_page1';static isOpenProjectDoc=true;static isOpenOtherDoc=true;static getActiveTab(){return this.currentTabId;}static getContainerInfo(){return info;}static hasTabUnSaved(){return info.tabs.some(tab=>tab.isUnSaved===true);}static isTabUnSaved(){return this.hasTabUnSaved();}}
const denied=name=>{forbidden.push(name);throw new Error('PRIVATE_FORBIDDEN');};
globalThis.fetch=()=>denied('network');globalThis.metadata={uuid:target.symbolUuid,project_uuid:target.projectUuid,path:target.projectUuid,docType:2,owner:{uuid:target.ownerUuid},display_title:before.name,title:before.name.toLowerCase(),description:before.description,custom_tags:before.tagsJson,source:before.source,version:before.version,ticket:before.ticket,updateTime:900000};
globalThis.peer={...metadata,uuid:${JSON.stringify(IDS.peer)},docType:18,display_title:'Peer',title:'peer',description:'Keep',custom_tags:'[]',source:'',ticket:2};
globalThis.roster={[target.symbolUuid]:metadata,[peer.uuid]:peer};globalThis.created=null;globalThis.createdUuid=${JSON.stringify(CREATED)};
globalThis.projectDetail={uuid:target.projectUuid,currentBranch:target.branchUuid,isV2Format:false,owner:{uuid:target.ownerUuid},archive:false,store:false,cbb_project:false};
globalThis.workerClient=${JSON.stringify(CLIENT)};globalThis.workerMaxTicket=100;globalThis.permissionAllowed=true;
globalThis.tick=1000000;globalThis.clockCalls=0;Date.now=()=>tick++;Date.prototype.getTimezoneOffset=()=>0;
class Bus{async rpcCall(topic,args,timeout){if(this!==gVars.messageBus||timeout!==0||!Array.isArray(args))return denied('receiver');calls.push([topic,JSON.parse(JSON.stringify(args))]);
if(topic==='/PrjDB/symbol/cloneData'){if(args.length!==2||args[1]!==target.projectUuid||JSON.stringify(args[0])!==JSON.stringify({source:target.symbolUuid,renameKey:true,keepSource:false}))return denied('mutation-args');writes++;const stamp=tick++;created={...metadata,uuid:createdUuid,display_title:'Source_1',title:'source_1',source:'',version:String(stamp),updateTime:stamp,ticket:101};workerMaxTicket+=2;roster[createdUuid]=created;projectMgr.componentCache.symbolTemplate[createdUuid]={newEntry:true};}
else if(topic==='/PrjDB/symbol/getData'){if(args.length!==2||(args[0]!==target.symbolUuid&&args[0]!==createdUuid)||args[1]!==target.projectUuid)return denied('symbol-args');}
else if(topic==='/PrjDB/symbol/getStr'){if(args.length!==2||args[0]!==target.symbolUuid||args[1]!==target.projectUuid)return denied('source-args');}
else if(['/PrjDB/project/getData','/PrjDB/project/getClient','/PrjDB/project/getMaxTicket','/PrjDB/symbol/getAllKVDatas','canAddLib'].includes(topic)){if(args.length!==1||args[0]!==target.projectUuid)return denied('project-args');}else return denied(topic);
if(topic===${JSON.stringify(options.pending ?? "")}&&(${JSON.stringify(options.pendingAfterCopy !== true)}||writes>0))await new Promise(resolve=>{globalThis.release=resolve;});await Promise.resolve();${options.afterRpc ?? ""}
return{message:topic==='/PrjDB/symbol/cloneData'?created:topic==='/PrjDB/symbol/getData'?roster[args[0]]:topic==='/PrjDB/symbol/getStr'?(writes?sourceContentAfterCopy:sourceContent):topic==='/PrjDB/symbol/getAllKVDatas'?roster:topic==='/PrjDB/project/getClient'?workerClient:topic==='/PrjDB/project/getMaxTicket'?workerMaxTicket:topic==='canAddLib'?{hasPermission:permissionAllowed}:projectDetail};}}
class Permission{constructor(){this._isConcurrentStrictMode=false;this.readOnly=false;}get isConcurrentStrictMode(){return this._isConcurrentStrictMode;}set isConcurrentStrictMode(value){this._isConcurrentStrictMode=value;}getIframeDisableStatusPanelPcb(){return{disable:this.readOnly};}}
globalThis.gVars={currentProject:{projectId:target.projectUuid,branchUuid:target.branchUuid,isV2Format:false},isHistoryMode:false,messageBus:new Bus(),sessionStorageTabs:new Set(),urlCmd:null,globalVariableCookieData:{userInfo:${JSON.stringify(actor)}},loginedUserInfo:${JSON.stringify(actor)}};
globalThis.UI={gVars,tabBar:Tabs,concurrentDesign:new Permission()};globalThis.eda={extensionUuid:'7e06d286b1ac846ef7eab9c7f2a9ee40',lib_Symbol:{copy:()=>denied('public-copy')},sch_Document:{save:()=>denied('save')}};
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
  return { run: (selected: unknown = prepared.input): Promise<unknown> => Promise.resolve(runInContext(`(async()=>{${buildCurrentSymbolCopyProgram(prepared.plan, selected)}})()`, context, { timeout: 1000 }) as unknown),
    evaluate: (sourceText): unknown => runInContext(sourceText, context, { timeout: 1000 }) as unknown,
    expire(): void { assert.ok(timeout !== undefined); timeout(); } };
}
function reply(value: unknown): unknown { return { content: [], structuredContent: { ok: true, result: value } }; }
async function flush(): Promise<void> { for (let index = 0; index < 100; index += 1) { await Promise.resolve(); } }

void test("copy compiler performs one fixed native clone and retains its original UUID and distinct ticket effects", async () => {
  const prepared = await preparation();
  const env = fixture(prepared);
  const envelope = structuredClone(await env.run());
  const result = decodeCurrentSymbolCopyReply(reply(envelope), prepared.plan, prepared.input);
  assert.equal(env.evaluate("writes"), 1); assert.equal(env.evaluate("clockCalls"), 2);
  assert.deepEqual(structuredClone(env.evaluate("forbidden")), []);
  assert.equal(result.createdUuid, CREATED); assert.equal(result.created.ticket, 101); assert.equal(result.afterMaxTicket, 102);
  assert.equal(result.created.name, "Source_1"); assert.equal(result.created.source, ""); assert.deepEqual(result.sourceBefore, result.sourceAfter);
  assert.equal(result.sourceContentMatched, true); assert.equal(result.peerMetadataMatched, true);
  for (const key of ["postCopyStartupQualified", "peerDesignInvarianceVerified", "persistenceVerified", "producerBindingVerified",
    "workerIdentityVerified", "executionAuthorized", "explicitSaveDispatched", "atomicCompareAndSwap"] as const) { assert.equal(result[key], false); }
  assert.ok(Object.isFrozen(result)); assert.ok(Buffer.byteLength(buildCurrentSymbolCopyProgram(prepared.plan, prepared.input)) < CURRENT_SYMBOL_COPY_PROGRAM_MAX_BYTES);
});

void test("copy compiler rejects source, peer roster, startup, identity and clock drift before cloning", async () => {
  const prepared = await preparation();
  for (const setup of ["metadata.description='drift';", "metadata.ticket++;", "metadata.source='changed';", "metadata.title='wrong';", "sourceContent+=' ';",
    "peer.display_title='Renamed peer';", "delete roster[peer.uuid];", "roster.extra={};", "permissionAllowed=false;", "workerClient='f'.repeat(16);",
    "workerMaxTicket++;", "metadata.owner={uuid:'f'.repeat(32)};", "extraIframes.push({});", "projectMgr.componentCache.symbolTemplate.extra={};", "gVars.loginedUserInfo.uuid='f'.repeat(32);",
    "tick=1060001;", "Date.prototype.getTimezoneOffset=()=>60;", "globalThis['/'+_TAB_ID_+'/notify']={};"]) {
    const env = fixture(prepared, { setup }); await assert.rejects(env.run(), /CURRENT_SYMBOL_COPY_REFUSED/u); assert.equal(env.evaluate("writes"), 0);
  }
  for (const change of ["gVars.messageBus=new Bus();", "gVars.concurrentBus=new ClockBus();", "gVars.currentProject={...gVars.currentProject};",
    "info.tabs=[...info.tabs];", "Date.now=()=>tick++;", "metadata.description='changed';", "sourceContent+=' ';", "workerMaxTicket++;"]) {
    const env = fixture(prepared, { afterRpc: `if(calls.length===1){${change}}` });
    await assert.rejects(env.run(), /CURRENT_SYMBOL_COPY_REFUSED/u); assert.equal(env.evaluate("writes"), 0);
  }
});

void test("copy compiler treats missing/invalid returns and post-copy drift as consumed failures without replay or Save", async () => {
  const prepared = await preparation();
  for (const change of ["throw new Error('PRIVATE_NATIVE_FAILURE');", "created.uuid=target.symbolUuid;", "created=null;"]) {
    const env = fixture(prepared, { afterRpc: `if(writes){${change}}` });
    await assert.rejects(env.run(), /CURRENT_SYMBOL_COPY_REFUSED/u); assert.equal(env.evaluate("writes"), 1);
  }
  for (const change of ["created.ticket=102;", "created.source='template';", "created.version='wrong';", "created.display_title='Caller rename';",
    "created.owner={uuid:'f'.repeat(32)};", "Object.defineProperty(created,'updateTime',{get(){throw new Error('PRIVATE_GETTER');}});",
    "metadata.description='source changed';", "sourceContentAfterCopy+=' ';", "peer.description='peer changed';", "workerMaxTicket++;",
    "gVars.messageBus=new Bus();", "extraIframes.push({});", "tick=1060001;"]) {
    const env = fixture(prepared, { afterRpc: `if(writes){${change}}` });
    const envelope = structuredClone(await env.run());
    const stopped = decodeCurrentSymbolCopyStoppedReply(reply(envelope), prepared.plan, prepared.input);
    assert.equal(env.evaluate("writes"), 1); assert.equal(stopped.createdUuid, CREATED); assert.equal(stopped.readbackComplete, false);
    assert.equal(stopped.nativeReturnAcknowledged, !change.startsWith("created.") && !change.startsWith("Object.defineProperty"));
    assert.throws(() => decodeCurrentSymbolCopyReply(reply(envelope), prepared.plan, prepared.input));
    assert.equal(JSON.stringify(envelope).includes("PRIVATE_"), false);
    assert.deepEqual(structuredClone(env.evaluate("forbidden")), []);
  }
  const colliding = fixture(prepared, { setup: "createdUuid=target.symbolUuid.slice(0,16);" });
  const envelope = structuredClone(await colliding.run());
  const stopped = decodeCurrentSymbolCopyStoppedReply(reply(envelope), prepared.plan, prepared.input);
  assert.equal(stopped.failureStage, "ACK"); assert.equal(stopped.createdUuid, target.symbolUuid.slice(0, 16));
  assert.equal(stopped.destinationCollision, true); assert.equal(stopped.acknowledged, null); assert.equal(colliding.evaluate("writes"), 1);
});

void test("copy compiler timeout cannot continue after a delayed permission or clone reply", async () => {
  const prepared = await preparation();
  for (const pending of ["canAddLib", "/PrjDB/symbol/cloneData"]) {
    const env = fixture(prepared, { pending }), running = env.run(); await flush();
    assert.equal(env.evaluate("typeof release"), "function"); const count = env.evaluate("calls.length"); env.expire();
    await assert.rejects(running, /CURRENT_SYMBOL_COPY_REFUSED:TIMEOUT/u); env.evaluate("release();"); await flush();
    assert.equal(env.evaluate("calls.length"), count); assert.equal(env.evaluate("writes"), pending === "canAddLib" ? 0 : 1);
  }
});

void test("copy compiler accepts only its original plan and strict source-bound own data", async () => {
  const prepared = await preparation();
  assert.throws(() => buildCurrentSymbolCopyProgram(structuredClone(prepared.plan), prepared.input), /original/u);
  let getter = false;
  const accessor = { ...prepared.input }; Object.defineProperty(accessor, "target", { get() { getter = true; return target; } });
  const before = currentSymbolCopyProgramInputSchema.parse(prepared.input).expectedBefore;
  for (const invalid of [accessor, { ...prepared.input, code: "native()" }, { ...prepared.input, renameKey: false },
    { ...prepared.input, desired: { name: "Chosen" } }, { ...prepared.input, expectedBefore: { ...before, version: "changed" } },
    { ...prepared.input, target: { ...target, ownerUuid: "f".repeat(32) } },
    { ...prepared.input, expectedWorker: { client: "f".repeat(16), maxTicket: 100 } }, { ...prepared.input, rendererTimezoneOffsetMinutes: -0 }]) {
    assert.throws(() => buildCurrentSymbolCopyProgram(prepared.plan, invalid));
  }
  assert.equal(getter, false);
});

void test("copy decoder cannot substitute returned UUID, source metadata, tickets or authority claims", async () => {
  const prepared = await preparation();
  const env = fixture(prepared);
  const envelope = structuredClone(await env.run());
  const result = decodeCurrentSymbolCopyReply(reply(envelope), prepared.plan, prepared.input);
  for (const changed of [{ ...result, createdUuid: "f".repeat(16) }, { ...result, afterMaxTicket: 101 }, { ...result, persistenceVerified: true },
    { ...result, producerBindingVerified: true }, { ...result, executionAuthorized: true }, { ...result, postCopyStartupQualified: true },
    { ...result, peerDesignInvarianceVerified: true }, { ...result, sourceAfter: { ...result.sourceAfter, source: "other" } },
    { ...result, created: { ...result.created, ticket: 102 } }, { ...result, documentAfter: { ...result.documentAfter, notifyTabId: "f".repeat(16) } }]) {
    assert.throws(() => decodeCurrentSymbolCopyReply(reply(encodeExactReadEnvelope(changed)), prepared.plan, prepared.input));
  }
});

void test("copy compiler bounds source embedding and escaped result envelopes before any native call", async () => {
  for (const text of ["a".repeat(65_536), "\n".repeat(65_536)]) {
    const prepared = await preparation(text);
    const env = fixture(prepared);
    assert.throws(() => env.run(), /CURRENT_SYMBOL_COPY_(?:OUTPUT_BUDGET|PROGRAM_BUDGET|INPUT|SAVED_READ_CAPACITY|SAVED_REQUEST_CAPACITY)/u);
    assert.equal(env.evaluate("calls.length"), 0); assert.equal(env.evaluate("writes"), 0);
  }
});

void test("copy compiler retains its acknowledged return across post-copy timeout and cleanup failure", async () => {
  const prepared = await preparation();
  for (const cleanupFails of [false, true]) {
    const env = fixture(prepared, { pending: "/PrjDB/symbol/getData", pendingAfterCopy: true, cleanupFails });
    const running = env.run(); await flush(); assert.equal(env.evaluate("typeof release"), "function");
    const count = env.evaluate("calls.length"); env.expire();
    const envelope = structuredClone(await running);
    const stopped = decodeCurrentSymbolCopyStoppedReply(reply(envelope), prepared.plan, prepared.input);
    assert.equal(stopped.createdUuid, CREATED); assert.equal(stopped.acknowledged?.uuid, CREATED); assert.equal(stopped.nativeReturnAcknowledged, true);
    assert.equal(stopped.failureStage, cleanupFails ? "TIMEOUT_CLEANUP" : "TIMEOUT");
    env.evaluate("release();"); await flush(); assert.equal(env.evaluate("calls.length"), count); assert.equal(env.evaluate("writes"), 1);
  }
  const env = fixture(prepared, { cleanupFails: true });
  const envelope = structuredClone(await env.run());
  const stopped = decodeCurrentSymbolCopyStoppedReply(reply(envelope), prepared.plan, prepared.input);
  assert.equal(stopped.failureStage, "CLEANUP"); assert.equal(stopped.createdUuid, CREATED);
  assert.equal(stopped.readbackComplete, false); assert.equal(Object.isFrozen(stopped.acknowledged), true);
  for (const changed of [{ ...stopped, createdUuid: "f".repeat(16) }, { ...stopped, destinationCollision: true },
    { ...stopped, acknowledged: null }, { ...stopped, nativeReturnAcknowledged: false }, { ...stopped, readbackComplete: true },
    { ...stopped, failureStage: "PRIVATE_EXCEPTION" }, { ...stopped, persistenceVerified: true }, { ...stopped, executionAuthorized: true }]) {
    assert.throws(() => decodeCurrentSymbolCopyStoppedReply(reply(encodeExactReadEnvelope(changed)), prepared.plan, prepared.input));
  }
});
