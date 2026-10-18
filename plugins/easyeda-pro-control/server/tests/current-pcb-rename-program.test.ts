import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_PCB_RENAME_PROGRAM_MAX_BYTES, CURRENT_PCB_RENAME_TIMEOUT_MS, buildCurrentPcbRenameProgram,
  decodeCurrentPcbRenameReply, decodeCurrentPcbRenameStoppedReply } from "../src/current-pcb-rename-program.ts";
import { encodeExactReadEnvelope } from "../src/exact-readers.ts";
import { PCB_PROGRAM_ACTOR, PCB_PROGRAM_TARGET, pcbProgramPreparation } from "./helpers/current-pcb-rename-program-fixture.ts";

type Prepared = Awaited<ReturnType<typeof pcbProgramPreparation>>;
interface Options { readonly setup?: string; readonly afterRpc?: string; readonly afterClock?: string; readonly pending?: string;
  readonly pendingAfterWrite?: boolean; readonly cleanupFails?: boolean }
function fixture(prepared: Prepared, options: Options = {}): { run: () => Promise<unknown>; evaluate: (source: string) => unknown; expire: () => void } {
  let timeout: (() => void) | undefined;
  const context = createContext({ TextEncoder,
    setTimeout(callback: () => void, delay: number): number { assert.equal(delay, CURRENT_PCB_RENAME_TIMEOUT_MS); timeout = callback; return 7; },
    clearTimeout(timer: number): void { assert.equal(timer, 7); if (options.cleanupFails === true) { throw new Error("PRIVATE_CLEANUP"); } },
  });
  runInContext(`globalThis.window=globalThis;globalThis.top=globalThis;globalThis.calls=[];globalThis.writes=0;globalThis.forbidden=[];globalThis.getterReads=0;
globalThis.target=${JSON.stringify(PCB_PROGRAM_TARGET)};globalThis.expectedPeers=${JSON.stringify(prepared.binding.peers)};
globalThis.location={href:'https://client/editor?cll=warn#id='+target.projectUuid,origin:'https://client'};
globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href};globalThis.navigator={serviceWorker:{controller:null}};
globalThis.PRO_EDITOR_MODE='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM';globalThis.PRO_EDITOR_VERSION='3.2.206';globalThis._TAB_ID_='1'.repeat(16);
globalThis.start={tabId:'tab_page1',data:{doctype:-1},isAbleDelete:false,group:'start_blank',draggable:true,isDisplayNone:false};
globalThis.info={id:'editor-window-main',belong:'editor-window-main',tabs:[start],activeTabId:'tab_page1'};
class Tabs{static containerIds=['editor-window-main'];static containerTree={id:'editor-window-main'};static belongContainer='editor-window-main';static currentTabId='tab_page1';static isOpenProjectDoc=true;static isOpenOtherDoc=true;static getActiveTab(){return this.currentTabId;}static getContainerInfo(){return info;}static hasTabUnSaved(){return info.tabs.some(tab=>tab.isUnSaved===true);}static isTabUnSaved(){return this.hasTabUnSaved();}}
const denied=name=>{forbidden.push(name);throw new Error('PRIVATE_FORBIDDEN');};globalThis.fetch=()=>denied('network');
globalThis.roster=Object.fromEntries(expectedPeers.map(peer=>[peer.uuid,{uuid:peer.uuid,project_uuid:target.projectUuid,docType:3,title:peer.title,display_title:peer.displayTitle,parent_uuid:peer.parentUuid,source:peer.source,version:peer.version,board:peer.boardUuid,ticket:peer.ticket,updateTime:peer.updateTime}]));
globalThis.metadata=roster[target.pcbUuid];globalThis.peer=Object.values(roster).find(value=>value.uuid!==target.pcbUuid);
globalThis.projectDetail={uuid:target.projectUuid,currentBranch:target.branchUuid,isV2Format:false,owner:{uuid:target.ownerUuid},archive:false,cbb_project:false};
globalThis.workerClient='a'.repeat(16);globalThis.workerMaxTicket=100;globalThis.nameLookup=()=>'';globalThis.tick=1000000;globalThis.clockCalls=0;
Date.now=()=>tick++;Date.prototype.getTimezoneOffset=()=>0;
class Bus{async rpcCall(topic,args,timeout){if(this!==gVars.messageBus||timeout!==0||!Array.isArray(args))return denied('receiver');calls.push([topic,JSON.parse(JSON.stringify(args))]);
if(topic==='/PrjDB/pcb/updateData'){if(args.length!==2||args[1]!==target.projectUuid||JSON.stringify(args[0])!==JSON.stringify({uuid:target.pcbUuid,display_title:'Renamed PCB'}))return denied('mutation-args');writes++;const stamp=tick++;Object.assign(metadata,{display_title:'Renamed PCB',title:'renamed pcb',version:String(stamp),ticket:101,updateTime:stamp});workerMaxTicket=101;ast.transId++;temp.transId=ast.transId;ast.lastModify++;projectMgr.componentCache.symbolTemplate.changed={};}
else if(topic==='/PrjDB/pcb/getData'){if(args.length!==2||args[0]!==target.pcbUuid||args[1]!==target.projectUuid)return denied('pcb-args');}
else if(topic==='/PrjDB/pcb/getIdByTitle'){if(args.length!==2||args[0]!=='Renamed PCB'||args[1]!==target.projectUuid)return denied('name-args');}
else if(['/PrjDB/project/getData','/PrjDB/project/getClient','/PrjDB/project/getMaxTicket','/PrjDB/pcb/getAllKVDatas'].includes(topic)){if(args.length!==1||args[0]!==target.projectUuid)return denied('project-args');}else return denied(topic);
if(topic===${JSON.stringify(options.pending ?? "")}&&(${JSON.stringify(options.pendingAfterWrite !== true)}||writes>0))await new Promise(resolve=>{globalThis.release=resolve;});await Promise.resolve();${options.afterRpc ?? ""}
return{message:topic==='/PrjDB/pcb/updateData'?{success:true,result:metadata}:topic==='/PrjDB/pcb/getData'?metadata:topic==='/PrjDB/pcb/getAllKVDatas'?roster:topic==='/PrjDB/pcb/getIdByTitle'?nameLookup():topic==='/PrjDB/project/getClient'?workerClient:topic==='/PrjDB/project/getMaxTicket'?workerMaxTicket:projectDetail};}}
class Permission{constructor(){this._isConcurrentStrictMode=false;this.readOnly=false;}get isConcurrentStrictMode(){return this._isConcurrentStrictMode;}set isConcurrentStrictMode(value){this._isConcurrentStrictMode=value;}getIframeDisableStatusPanelPcb(){return{disable:this.readOnly};}}
globalThis.gVars={currentProject:{projectId:target.projectUuid,branchUuid:target.branchUuid,isV2Format:false},isHistoryMode:false,messageBus:new Bus(),sessionStorageTabs:new Set(),urlCmd:null,globalVariableCookieData:{userInfo:${JSON.stringify(PCB_PROGRAM_ACTOR)}},loginedUserInfo:${JSON.stringify(PCB_PROGRAM_ACTOR)}};
globalThis.UI={gVars,tabBar:Tabs,concurrentDesign:new Permission()};globalThis.eda={extensionUuid:'7e06d286b1ac846ef7eab9c7f2a9ee40',dmt_Pcb:{modifyPcbName:()=>denied('public-rename')},pcb_Document:{save:()=>denied('save')}};
globalThis.projectMgr={uuid:target.projectUuid};projectMgr.componentCache={projectMgr,symbolTemplate:{}};
globalThis.actionRunner={_currentAction:null};actionRunner.realTimeSyncActionManager={transactionRunner:actionRunner,_isRunning:false,_runnerSet:{_idMap:new Map()},_runTimer:{_mark:-1},_localActionOnceDidRunSubscription:null};
globalThis.docMemory={docMap:new Map(),_docFetchPromiseMap:new Map()};globalThis.SCH={gVars:{projectMgr,actionRunner},get docMemoryManager(){return docMemory;}};
class AstManager{constructor(){this.prjUuid=target.projectUuid;this.batchDepth=0;this._isClose=false;this.CBB=false;}}
globalThis.astManager=new AstManager();globalThis.ast={isBuild:true,isPass:false,transId:1,lastModify:123};globalThis.temp={isBuild:false,isPass:false,transId:1,lastModify:100};
globalThis.tree={manager(){return astManager;},ast(){return ast;},tempAst(){return temp;}};SCH.D={leftTree:tree};
class ClockBus{async rpcCall(...args){if(this!==gVars.concurrentBus||args.length!==1||args[0]!=='/pro-mgr/serverTime/now')return denied('clock-receiver');clockCalls++;await Promise.resolve();${options.afterClock ?? ""}return tick++;}}
gVars.concurrentBus=new ClockBus();globalThis['/'+_TAB_ID_+'/notify']=gVars.concurrentBus;
globalThis.domRoot={tagName:'DIV',ownerDocument:document,isConnected:true,children:[]};
domRoot.children=['commandWin','exitSmartSizeTool','exitPadShapeTool','project-blank-page','assembly-variant-page'].map(id=>({id,tagName:'DIV',ownerDocument:document,isConnected:true,parentElement:domRoot,getAttribute(){return null;}}));
globalThis.extraIframes=[];globalThis.extraMarkers=[];globalThis.standardPanels=[];
class FixtureNode{constructor(state){this.fixtureState=state;}get ownerDocument(){return this.fixtureState.ownerDocument;}get isConnected(){return this.fixtureState.isConnected;}get parentElement(){return this.fixtureState.parentElement;}get childNodes(){return this.fixtureState.childNodes;}}
class FixtureElement extends FixtureNode{get tagName(){return this.fixtureState.tagName;}get id(){return this.fixtureState.attributes.id??'';}get childElementCount(){return this.fixtureState.childElementCount;}getAttribute(name){return this.fixtureState.attributes[name.toLowerCase()]??null;}}
class FixtureHTMLElement extends FixtureElement{get style(){return this.fixtureState.style;}}
class FixtureHTMLDivElement extends FixtureHTMLElement{}
const panelState=(attributes,parentElement=null)=>({tagName:'DIV',ownerDocument:document,isConnected:true,parentElement,attributes,style:{display:'none'},childElementCount:0,childNodes:[{nodeType:3},{nodeType:8}]});
globalThis.standardBox=new FixtureHTMLDivElement(panelState({id:'bottomBarBox'}));
globalThis.standardParent=new FixtureHTMLDivElement(panelState({},standardBox));
globalThis.standardMarkerState=panelState({id:'device-standardization',class:'log-container',style:'display: none;'},standardParent);
globalThis.standardMarker=new FixtureHTMLDivElement(standardMarkerState);
standardMarker.__reactContainer$fixture={};standardMarker._reactListeningfixture=true;
globalThis.standardMarkers=[standardMarker];
class FixtureDocument{querySelectorAll(selector){if(this!==document)return denied('selector-receiver');if(selector==='[id="tabbar_bodies"]')return[domRoot];if(selector==='iframe')return extraIframes;if(selector==='.blankIframeDiv')return[];if(selector.startsWith('.editframe,'))return extraMarkers;if(selector==='div[data-activekey="device-standardization"]')return standardPanels;if(selector==='[id="device-standardization"]')return standardMarkers;return denied('selector');}}
class FixtureHTMLDocument extends FixtureDocument{}Object.setPrototypeOf(document,FixtureHTMLDocument.prototype);
${options.setup ?? ""}`, context, { timeout: 1000 });
  return { run: (): Promise<unknown> => Promise.resolve(runInContext(`(async()=>{${buildCurrentPcbRenameProgram(prepared.preparation, prepared.binding, prepared.input)}})()`, context, { timeout: 1000 }) as unknown),
    evaluate: (source): unknown => runInContext(source, context, { timeout: 1000 }) as unknown,
    expire(): void { assert.ok(timeout !== undefined); timeout(); } };
}
function reply(value: unknown): unknown { return { content: [], structuredContent: { ok: true, result: value } }; }
async function flush(): Promise<void> { for (let index = 0; index < 100; index += 1) { await Promise.resolve(); } }
function decode(raw: unknown, prepared: Prepared): ReturnType<typeof decodeCurrentPcbRenameReply> { return decodeCurrentPcbRenameReply(reply(raw), prepared.preparation, prepared.binding, prepared.input); }
function stopped(raw: unknown, prepared: Prepared): ReturnType<typeof decodeCurrentPcbRenameStoppedReply> { return decodeCurrentPcbRenameStoppedReply(reply(raw), prepared.preparation, prepared.binding, prepared.input); }

void test("dormant PCB compiler performs one fixed title-only update with wrapped native reply and complete peer comparison", async () => {
  const prepared = await pcbProgramPreparation(); const env = fixture(prepared), raw = structuredClone(await env.run()), result = decode(raw, prepared);
  assert.equal(env.evaluate("writes"), 1); assert.equal(env.evaluate("clockCalls"), 2); assert.deepEqual(structuredClone(env.evaluate("forbidden")), []);
  assert.equal(result.before.ticket, 100); assert.equal(result.after.ticket, 101); assert.equal(result.afterMaxTicket, 101);
  assert.equal(result.after.title, "renamed pcb"); assert.equal(result.after.displayTitle, "Renamed PCB"); assert.deepEqual(result.after, result.acknowledged);
  assert.equal(result.peerMetadataMatched, true); assert.equal(result.peerCount, 2); assert.ok(Object.isFrozen(result.after));
  for (const key of ["permissionVerified", "startupQualified", "postRenameStartupQualified", "peerDesignInvarianceVerified", "backendActorVerified", "backendClockVerified",
    "workerIdentityVerified", "producerBindingVerified", "crossInvocationReceiverContinuityVerified", "atomicCompareAndSwap", "persistenceVerified", "reopened", "executionAuthorized", "explicitSaveDispatched"] as const) {
    assert.equal(result[key], false);
  }
  assert.ok(Buffer.byteLength(buildCurrentPcbRenameProgram(prepared.preparation, prepared.binding, prepared.input)) < CURRENT_PCB_RENAME_PROGRAM_MAX_BYTES);
});

void test("PCB compiler refuses original-data substitution, argument escapes and unqualified input getters", async () => {
  const prepared = await pcbProgramPreparation(); let read = false;
  const getter = Object.defineProperty({ ...prepared.input }, "expectedActor", { get() { read = true; return PCB_PROGRAM_ACTOR; } });
  for (const input of [getter, { ...prepared.input, code: "write()" }, { ...prepared.input, desiredTitle: "Other" },
    { ...prepared.input, expectedWorker: { client: "f".repeat(16), maxTicket: 100 } }, { ...prepared.input, rendererTimezoneOffsetMinutes: -0 },
    { ...prepared.input, expectedActor: { ...PCB_PROGRAM_ACTOR, uuid: "f".repeat(32) } }]) {
    assert.throws(() => buildCurrentPcbRenameProgram(prepared.preparation, prepared.binding, input));
  }
  assert.throws(() => buildCurrentPcbRenameProgram(structuredClone(prepared.preparation), prepared.binding, prepared.input), /original/u);
  assert.throws(() => buildCurrentPcbRenameProgram(prepared.preparation, structuredClone(prepared.binding), prepared.input), /original/u); assert.equal(read, false);
});

void test("PCB compiler requires a wholly newer document window and opposite renderer/native timezone signs", async () => {
  // Original preparation already rejects a lower endpoint at or below the
  // Latest historical header; the compiler independently retains that guard.
  for (const documentMinimumMs of [0, 1]) { await assert.rejects(pcbProgramPreparation({ documentMinimumMs }), /window overlaps prior headers/u); }
  const prepared = await pcbProgramPreparation({ backendOffsetMinutes: 120 });
  for (const rendererTimezoneOffsetMinutes of [0, 120, -60]) {
    assert.throws(() => buildCurrentPcbRenameProgram(prepared.preparation, prepared.binding, { ...prepared.input, rendererTimezoneOffsetMinutes }), /CLOCK_OFFSET/u);
  }
  const env = fixture(prepared, { setup: "Date.prototype.getTimezoneOffset=()=>-120;" });
  const result = decode(structuredClone(await env.run()), prepared);
  assert.equal(result.documentBefore.rendererTimezoneOffsetMinutes, -120); assert.equal(result.documentAfter.rendererTimezoneOffsetMinutes, -120);
  assert.equal(result.backendClockVerified, false);
});

void test("PCB compiler checks SCH and PCB AST startup, native name policy, metadata and fresh clocks before writing", async () => {
  const prepared = await pcbProgramPreparation();
  for (const setup of ["metadata.display_title='drift';", "metadata.ticket++;", "peer.source='changed';", "delete roster[peer.uuid];", "roster.extra={};",
    "nameLookup=()=>undefined;", "nameLookup=()=>null;", "nameLookup=()=>peer.uuid;", "workerClient='f'.repeat(16);", "workerMaxTicket++;",
    "extraIframes.push({});", "standardPanels.push({});", "standardMarkers.push({});", "standardMarkers=[];", "standardMarkerState.style.display='block';",
    "standardMarkerState.attributes.devicestandardizationuuid='';", "standardMarkerState.childElementCount=1;",
    "projectMgr.componentCache.symbolTemplate.extra={};", "astManager.batchDepth=1;", "ast.transId++;", "temp.isPass=true;",
    "gVars.loginedUserInfo.uuid='f'.repeat(32);", "tick=1060001;", "Date.prototype.getTimezoneOffset=()=>60;", "globalThis['/'+_TAB_ID_+'/notify']={};",
    "Object.defineProperty(peer,'ticket',{get(){getterReads++;throw new Error('PRIVATE_GETTER');}});"]) {
    const env = fixture(prepared, { setup }); await assert.rejects(env.run(), /CURRENT_PCB_RENAME_REFUSED/u); assert.equal(env.evaluate("writes"), 0); assert.equal(env.evaluate("getterReads"), 0);
  }
  for (const change of ["gVars.messageBus=new Bus();", "gVars.concurrentBus=new ClockBus();", "gVars.currentProject={...gVars.currentProject};",
    "info.tabs=[...info.tabs];", "Date.now=()=>tick++;", "metadata.display_title='changed';", "peer.ticket++;", "ast.lastModify++;", "standardPanels.push({});", "standardMarkers.push({});",
    "standardMarkerState.style={display:'none'};", "standardMarkers=[new FixtureHTMLDivElement({...standardMarkerState})];",
    "standardMarkerState.attributes.devicestandardizationuuid='';", "standardMarkerState.childElementCount=1;"]) {
    const env = fixture(prepared, { afterRpc: `if(calls.length===1){${change}}` }); await assert.rejects(env.run(), /CURRENT_PCB_RENAME_REFUSED/u); assert.equal(env.evaluate("writes"), 0);
  }
});

void test("PCB compiler returns a consumed stopped result for native throws, swallowed replies and invalid acknowledgments", async () => {
  const prepared = await pcbProgramPreparation();
  for (const change of ["throw new Error('PRIVATE_NATIVE');", "return{message:undefined};", "return{message:metadata};", "return{message:{success:false,result:metadata}};",
    "Object.defineProperty(metadata,'ticket',{get(){getterReads++;throw new Error('PRIVATE_GETTER');}});"]) {
    const env = fixture(prepared, { afterRpc: `if(topic==='/PrjDB/pcb/updateData'){${change}}` }); const raw = structuredClone(await env.run()), result = stopped(raw, prepared);
    assert.equal(env.evaluate("writes"), 1); assert.equal(result.acknowledged, null); assert.equal(result.nativeReturnAcknowledged, false);
    assert.equal(env.evaluate("getterReads"), 0); assert.throws(() => decode(raw, prepared)); assert.equal(JSON.stringify(raw).includes("PRIVATE_"), false);
  }
});

void test("PCB compiler retains parsed acknowledgments before context, clock, target-effect and peer failures", async () => {
  const prepared = await pcbProgramPreparation();
  for (const change of ["metadata.ticket=102;", "metadata.display_title='Wrong';", "metadata.updateTime=1060001;", "peer.source='changed';",
    "workerMaxTicket++;", "gVars.messageBus=new Bus();", "extraIframes.push({});", "tick=1060001;"]) {
    const env = fixture(prepared, { afterRpc: `if(topic==='/PrjDB/pcb/updateData'){${change}}` }); const raw = structuredClone(await env.run()), result = stopped(raw, prepared);
    assert.equal(env.evaluate("writes"), 1); assert.equal(result.nativeReturnAcknowledged, true); assert.ok(result.acknowledged !== null);
    assert.equal(result.readbackComplete, false); assert.throws(() => decode(raw, prepared)); assert.deepEqual(structuredClone(env.evaluate("forbidden")), []);
  }
  const env = fixture(prepared, { afterClock: "if(clockCalls===2)return -0;" }); const raw = structuredClone(await env.run());
  assert.equal(stopped(raw, prepared).failureStage, "CLOCK_AFTER"); assert.equal(stopped(raw, prepared).nativeReturnAcknowledged, true);
});

void test("PCB compiler timeout never continues after delayed reads or mutation and retains any earlier acknowledgment", async () => {
  const prepared = await pcbProgramPreparation();
  for (const [pending, pendingAfterWrite] of [["/PrjDB/pcb/getIdByTitle", false], ["/PrjDB/pcb/updateData", false], ["/PrjDB/pcb/getData", true]] as const) {
    const env = fixture(prepared, { pending, pendingAfterWrite }), running = env.run(); await flush(); assert.equal(env.evaluate("typeof release"), "function");
    const calls = env.evaluate("calls.length"); env.expire();
    if (pending === "/PrjDB/pcb/getIdByTitle") { await assert.rejects(running, /TIMEOUT/u); assert.equal(env.evaluate("writes"), 0); }
    else { const result = stopped(structuredClone(await running), prepared); assert.equal(result.failureStage, "TIMEOUT"); assert.equal(result.nativeReturnAcknowledged, pendingAfterWrite); }
    env.evaluate("release();"); await flush(); assert.equal(env.evaluate("calls.length"), calls); assert.ok(Number(env.evaluate("writes")) <= 1);
  }
});

void test("PCB cleanup failures preserve stopped evidence and decoders reject promoted authority or forged successful effects", async () => {
  const prepared = await pcbProgramPreparation(); const env = fixture(prepared), raw = structuredClone(await env.run()), result = decode(raw, prepared);
  for (const changed of [{ ...result, after: { ...result.after, ticket: 102 } }, { ...result, bindingSha256: "f".repeat(64) }, { ...result, peerCount: 1 },
    { ...result, producerBindingVerified: true }, { ...result, permissionVerified: true }, { ...result, persistenceVerified: true },
    { ...result, documentAfter: { ...result.documentAfter, notifyTabId: "f".repeat(16) } }]) {
    assert.throws(() => decode(encodeExactReadEnvelope(changed), prepared));
  }
  const cleanup = fixture(prepared, { cleanupFails: true }); const failed = stopped(structuredClone(await cleanup.run()), prepared);
  assert.equal(failed.failureStage, "CLEANUP"); assert.equal(failed.nativeReturnAcknowledged, true); assert.ok(Object.isFrozen(failed.acknowledged));
  for (const changed of [{ ...failed, readbackComplete: true }, { ...failed, failureStage: "PRIVATE" }, { ...failed, nativeReturnAcknowledged: false },
    { ...failed, bindingSha256: "f".repeat(64) }, { ...failed, executionAuthorized: true }]) {
    assert.throws(() => stopped(encodeExactReadEnvelope(changed), prepared));
  }
});
