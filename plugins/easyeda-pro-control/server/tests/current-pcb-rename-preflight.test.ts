import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_PCB_RENAME_PREFLIGHT_MAX_BYTES, CURRENT_PCB_RENAME_PREFLIGHT_TIMEOUT_MS, currentPcbRenamePreflightRequestSchema,
  decodeCurrentPcbRenamePreflightReply, queryCurrentPcbRenamePreflight, validateCurrentPcbRenamePreflightArguments } from "../src/current-pcb-rename-preflight.ts";
import { buildCurrentPcbRenamePreflightProgram } from "../src/current-pcb-rename-preflight-program.ts";
import { encodeExactReadEnvelope } from "../src/exact-readers.ts";

const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), pcbUuid: "c".repeat(16), ownerUuid: "d".repeat(32) };
const expectedBefore = { title: "original pcb", displayTitle: "Original PCB", parentUuid: "", source: "", version: "12345", boardUuid: "",
  ticket: 12_345, updateTime: 12_345, docType: 3 };
const request = { target, expectedBefore, desiredTitle: "Renamed PCB" };
const actor = { uuid: "1".repeat(32), username: "fixture-user", nickname: "Fixture" };
function reply(value: unknown): unknown { return { content: [], structuredContent: { ok: true, result: value } }; }
interface Options { readonly before?: string; readonly afterRpc?: string; readonly afterClock?: string; readonly pendingAt?: number }
function fixture(options: Options = {}): { run: () => Promise<unknown>; evaluate: (source: string) => unknown; expire: () => void; clears: () => number } {
  let cleared = 0, timeout: (() => void) | undefined;
  const context = createContext({ TextEncoder,
    setTimeout(callback: () => void, delay: number): number { assert.equal(delay, CURRENT_PCB_RENAME_PREFLIGHT_TIMEOUT_MS); timeout = callback; return 7; },
    clearTimeout(timer: unknown): void { assert.equal(timer, 7); cleared += 1; },
  });
  runInContext(`globalThis.window=globalThis;globalThis.top=globalThis;globalThis.calls=[];globalThis.denied=[];globalThis.getterReads=0;
globalThis.target=${JSON.stringify(target)};globalThis.beforeValue=${JSON.stringify(expectedBefore)};
globalThis.location={href:'https://client/editor?cll=warn#id='+target.projectUuid,origin:'https://client'};
globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href};globalThis.navigator={serviceWorker:{controller:null}};
globalThis.PRO_EDITOR_MODE='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM';globalThis.PRO_EDITOR_VERSION='3.2.206';globalThis._TAB_ID_='1'.repeat(16);
globalThis.start={tabId:'tab_page1',data:{doctype:-1},isAbleDelete:false,group:'start_blank',draggable:true,isDisplayNone:false};
globalThis.blank={tabId:'0',data:{doctype:0},isAbleDelete:false,group:'start_blank',draggable:false,isDisplayNone:true};
globalThis.info={id:'editor-window-main',belong:'editor-window-main',tabs:[start],activeTabId:'tab_page1'};
class Tabs{static containerIds=['editor-window-main'];static containerTree={id:'editor-window-main'};static belongContainer='editor-window-main';static currentTabId='tab_page1';static isOpenProjectDoc=true;static isOpenOtherDoc=true;static getActiveTab(){return this.currentTabId;}static getContainerInfo(id){return id===info.id?info:undefined;}static hasTabUnSaved(){return info.tabs.some(tab=>tab.isUnSaved===true);}static isTabUnSaved(id){return info.tabs.some(tab=>tab.tabId===id&&tab.isUnSaved===true);}}
const forbidden=name=>{denied.push(name);throw new Error('PRIVATE_FORBIDDEN');};globalThis.fetch=()=>forbidden('network');
globalThis.metadata={uuid:target.pcbUuid,project_uuid:target.projectUuid,docType:3,title:beforeValue.title,display_title:beforeValue.displayTitle,parent_uuid:'',source:'',version:beforeValue.version,board:'',ticket:beforeValue.ticket,updateTime:beforeValue.updateTime};
globalThis.peer={...metadata,uuid:'e'.repeat(16),title:'peer pcb',display_title:'Peer PCB'};globalThis.peerMap={[metadata.uuid]:metadata,[peer.uuid]:peer};
globalThis.projectDetail={uuid:target.projectUuid,currentBranch:target.branchUuid,isV2Format:false,owner:{uuid:target.ownerUuid},archive:false,cbb_project:false};
globalThis.workerClient='f'.repeat(16);globalThis.workerMaxTicket=12345;
globalThis.nameLookup=title=>Object.values(peerMap).find(value=>value.display_title.toLocaleLowerCase()===title.toLocaleLowerCase())?.uuid||'';
class Bus{async rpcCall(topic,args,timeout){if(this!==gVars.messageBus||timeout!==0||!Array.isArray(args))return forbidden('receiver');calls.push([topic,[...args]]);
if(topic==='/PrjDB/pcb/getData'){if(args.length!==2||args[0]!==target.pcbUuid||args[1]!==target.projectUuid)return forbidden('pcb-args');}
else if(topic==='/PrjDB/pcb/getIdByTitle'){if(args.length!==2||args[0]!=='Renamed PCB'||args[1]!==target.projectUuid)return forbidden('name-args');}
else if(['/PrjDB/project/getData','/PrjDB/project/getClient','/PrjDB/project/getMaxTicket','/PrjDB/pcb/getAllKVDatas'].includes(topic)){if(args.length!==1||args[0]!==target.projectUuid)return forbidden('project-args');}else return forbidden(topic);
if(calls.length===${options.pendingAt ?? 0})await new Promise(resolve=>{globalThis.release=resolve;});await Promise.resolve();${options.afterRpc ?? ""}
return{message:topic==='/PrjDB/pcb/getData'?metadata:topic==='/PrjDB/pcb/getAllKVDatas'?peerMap:topic==='/PrjDB/pcb/getIdByTitle'?nameLookup(args[0]):topic==='/PrjDB/project/getClient'?workerClient:topic==='/PrjDB/project/getMaxTicket'?workerMaxTicket:projectDetail};}}
class Permission{constructor(){this._isConcurrentStrictMode=false;this.readOnly=false;}get isConcurrentStrictMode(){return this._isConcurrentStrictMode;}set isConcurrentStrictMode(value){this._isConcurrentStrictMode=value;}getIframeDisableStatusPanelPcb(id){if(this!==UI.concurrentDesign||id!==Tabs.currentTabId)return forbidden('permission-receiver');return{disable:this.readOnly};}}
globalThis.gVars={currentProject:{projectId:target.projectUuid,branchUuid:target.branchUuid,isV2Format:false},isHistoryMode:false,messageBus:new Bus(),sessionStorageTabs:new Set(),urlCmd:null,globalVariableCookieData:{userInfo:${JSON.stringify(actor)}},loginedUserInfo:${JSON.stringify(actor)}};
globalThis.UI={gVars,tabBar:Tabs,concurrentDesign:new Permission()};globalThis.eda={extensionUuid:'7e06d286b1ac846ef7eab9c7f2a9ee40',dmt_Pcb:{modifyPcbName:()=>forbidden('modify'),getAllPcbsInfo:()=>forbidden('public-tree')},dmt_Project:{openProject:()=>forbidden('open')},sys_FileSystem:{save:()=>forbidden('save')}};
globalThis.clockTick=1000;globalThis.clockCalls=0;Date.now=function(){return clockTick++;};
class ClockBus{async rpcCall(...args){if(this!==gVars.concurrentBus||args.length!==1||args[0]!=='/pro-mgr/serverTime/now')return forbidden('clock-receiver');clockCalls++;await Promise.resolve();${options.afterClock ?? ""}return clockTick++;}}
gVars.concurrentBus=new ClockBus();globalThis['/'+_TAB_ID_+'/notify']=gVars.concurrentBus;
globalThis.domRoot={tagName:'DIV',ownerDocument:document,isConnected:true,children:[]};
domRoot.children=['commandWin','exitSmartSizeTool','exitPadShapeTool','project-blank-page','assembly-variant-page'].map(id=>({id,tagName:'DIV',ownerDocument:document,isConnected:true,parentElement:domRoot,getAttribute(){return null;}}));
globalThis.extraMarkers=[];globalThis.extraIframes=[];globalThis.blankPools=[];
document.querySelectorAll=function(selector){if(selector==='[id="tabbar_bodies"]')return[domRoot];if(selector==='iframe')return extraIframes;if(selector==='.blankIframeDiv')return blankPools;if(selector.startsWith('.editframe,'))return extraMarkers;return forbidden('selector');};
${options.before ?? ""}`, context, { timeout: 1000 });
  return {
    run: (): Promise<unknown> => Promise.resolve(runInContext(`(async()=>{${buildCurrentPcbRenamePreflightProgram(request)}})()`, context, { timeout: 1000 }) as unknown),
    evaluate: (source): unknown => runInContext(source, context, { timeout: 1000 }) as unknown,
    expire(): void { assert.ok(timeout !== undefined); timeout(); }, clears: (): number => cleared,
  };
}
async function flush(): Promise<void> { for (let index = 0; index < 50; index += 1) { await Promise.resolve(); } }

void test("PCB rename preflight samples complete native map, target, name policy, client and actors without writes", async () => {
  for (const before of ["", "info.tabs.push(blank);info.activeTabId='0';Tabs.currentTabId='0';", "peerMap={[peer.uuid]:peer,[metadata.uuid]:metadata};"]) {
    const env = fixture({ before }), envelope = structuredClone(await env.run());
    const value = decodeCurrentPcbRenamePreflightReply(reply(envelope), request);
    assert.deepEqual(value.expectedBefore, expectedBefore); assert.deepEqual(value.target, target); assert.equal(value.desiredTitle, request.desiredTitle);
    assert.deepEqual(value.peers.map((peer) => peer.uuid), [target.pcbUuid, "e".repeat(16)]);
    assert.deepEqual(value.clientTicketObservation, { client: "f".repeat(16), maxTicket: 12_345, samples: 4 });
    assert.deepEqual(value.runtimeObservation.actor, actor); assert.equal(env.evaluate("clockCalls"), 4); assert.equal(env.evaluate("calls.length"), 18);
    assert.equal(value.nativeNameAvailableObserved, true); assert.equal(value.producerBindingVerified, false); assert.equal(value.writerAuthority, false);
    const topics = ["/PrjDB/project/getClient", "/PrjDB/project/getMaxTicket", "/PrjDB/project/getData", "/PrjDB/pcb/getAllKVDatas",
      "/PrjDB/pcb/getData", "/PrjDB/pcb/getIdByTitle", "/PrjDB/project/getData", "/PrjDB/project/getClient", "/PrjDB/project/getMaxTicket"];
    assert.equal(env.evaluate("JSON.stringify(calls.map(call=>call[0]))"), JSON.stringify([...topics, ...topics]));
    assert.deepEqual(structuredClone(env.evaluate("denied")), []); assert.equal(env.clears(), 1); assert.equal(Object.isFrozen(value.peers), true);
  }
});

void test("PCB preflight refuses editors and contaminated owner state before native calls", async () => {
  for (const before of ["info.tabs.push({tabId:target.pcbUuid+'@'+target.projectUuid,data:{doctype:3}});", "extraMarkers.push({});", "extraIframes.push({});",
    "start.isUnSaved=true;", "UI.concurrentDesign.readOnly=true;", "UI.concurrentDesign._isConcurrentStrictMode=true;", "gVars.sessionStorageTabs.add('pending');",
    "gVars.urlCmd='pending';", "gVars.currentProject.branchUuid='e'.repeat(32);", "gVars.isHistoryMode=true;", "navigator.serviceWorker.controller={};",
    "PRO_EDITOR_MODE='ONLINE';", "gVars.loginedUserInfo.nickname='different';"]) {
    const env = fixture({ before }); await assert.rejects(env.run(), /CURRENT_PCB_RENAME_PREFLIGHT_REFUSED:HOST/u); assert.equal(env.evaluate("calls.length"), 0);
  }
});

void test("PCB preflight refuses native name collisions, missing name replies and malformed native metadata", async () => {
  for (const before of ["peer.display_title='ReNaMeD PcB';", "nameLookup=()=>peer.uuid;", "nameLookup=()=>undefined;", "nameLookup=()=>null;", "nameLookup=()=>false;", "projectDetail.owner.uuid='e'.repeat(32);",
    "projectDetail.store=true;", "metadata.display_title='changed';", "metadata.parent_uuid='e'.repeat(16);", "metadata.source='reused';",
    "metadata.updateTime=-0;", "peer.ticket=12346;", "peer.project_uuid='e'.repeat(64);", "peer.uuid=target.pcbUuid;", "peer.docType=4;",
    "delete peerMap[metadata.uuid];", "peerMap={};", "peerMap=[];", "peerMap=undefined;", "peerMap[Symbol('hidden')]=peer;",
    "Object.defineProperty(peerMap,peer.uuid,{get(){getterReads++;throw new Error('private');}});",
    "Object.defineProperty(peer,'display_title',{get(){getterReads++;throw new Error('private');}});"]) {
    const env = fixture({ before }); await assert.rejects(env.run(), /CURRENT_PCB_RENAME_PREFLIGHT_REFUSED:/u); assert.equal(env.evaluate("getterReads"), 0);
  }
  await assert.rejects(fixture({ afterRpc: "if(topic==='/PrjDB/pcb/getIdByTitle')return{};" }).run(), /:NAME/u);
  const safe = fixture({ before: "Object.defineProperty(metadata,'canvas',{get(){getterReads++;throw new Error('private');}});" });
  await safe.run(); assert.equal(safe.evaluate("getterReads"), 0);
});

void test("PCB preflight detects peer, project, client, receiver and actor changes across awaits", async () => {
  for (const afterRpc of ["if(calls.length===13)peer.title='changed';", "if(calls.length===13)peerMap['9'.repeat(16)]={...peer,uuid:'9'.repeat(16)};",
    "if(calls.length===9)workerMaxTicket++;", "if(calls.length===8)workerClient='9'.repeat(16);", "if(calls.length===7)projectDetail.owner.uuid='e'.repeat(32);",
    "if(calls.length===1)gVars.messageBus=new Bus();", "if(calls.length===1)gVars.currentProject={...gVars.currentProject};",
    "if(calls.length===1)gVars.loginedUserInfo={...gVars.loginedUserInfo};", "if(calls.length===1)info.tabs=[...info.tabs];",
    "if(calls.length===1)UI.concurrentDesign=new Permission();", "if(calls.length===1)extraIframes.push({});"]) {
    await assert.rejects(fixture({ afterRpc }).run(), /CURRENT_PCB_RENAME_PREFLIGHT_REFUSED:/u);
  }
});

void test("PCB preflight retains the clock receiver and rejects invalid independent renderer brackets", async () => {
  for (const afterClock of ["return{message:clockTick};", "return -0;", "return clockTick+10;", "clockTick+=10001;",
    "Date.now=()=>clockTick++;", "gVars.concurrentBus=new ClockBus();", "globalThis['/'+_TAB_ID_+'/notify']=new ClockBus();",
    "gVars.loginedUserInfo.nickname='changed';", "if(clockCalls===2)clockTick=1;"]) {
    await assert.rejects(fixture({ afterClock }).run(), /CURRENT_PCB_RENAME_PREFLIGHT_REFUSED:/u);
  }
});

void test("PCB preflight deadline prevents later reads and never retries a delayed request", async () => {
  const env = fixture({ pendingAt: 4 }), running = env.run(); await flush(); assert.equal(env.evaluate("calls.length"), 4); env.expire();
  await assert.rejects(running, { message: "CURRENT_PCB_RENAME_PREFLIGHT_REFUSED:TIMEOUT" });
  env.evaluate("release();"); await flush(); assert.equal(env.evaluate("calls.length"), 4); assert.equal(env.clears(), 1);
});

void test("PCB preflight refuses oversized native maps without truncation or later name lookup", async () => {
  for (const before of [
    "for(let i=0;i<4096;i++){let uuid=i.toString(16).padStart(16,'0');peerMap[uuid]={...peer,uuid};}",
    "for(let i=0;i<150;i++){let uuid=i.toString(16).padStart(16,'0');peerMap[uuid]={...peer,uuid,source:'x'.repeat(4096)};}",
  ]) {
    const env = fixture({ before }); await assert.rejects(env.run(), /CURRENT_PCB_RENAME_PREFLIGHT_REFUSED:PEERS/u);
    assert.equal(env.evaluate("calls.length"), 4); assert.deepEqual(structuredClone(env.evaluate("denied")), []);
  }
});

void test("PCB preflight rejects extra fields, input accessors, promoted authority and incomplete returned maps", async () => {
  assert.equal(currentPcbRenamePreflightRequestSchema.safeParse(request).success, true);
  assert.equal(validateCurrentPcbRenamePreflightArguments(request)["valid"], true);
  assert.match(JSON.stringify(queryCurrentPcbRenamePreflight({ includeSchemas: true })), /inputSchema/u);
  assert.throws(() => queryCurrentPcbRenamePreflight({ runtime: true }));
  for (const invalid of [{ ...request, code: "write()" }, { ...request, target: { ...target, tabId: "0" } },
    { ...request, desiredTitle: expectedBefore.displayTitle }, { ...request, desiredTitle: " x " },
    { ...request, expectedBefore: { ...expectedBefore, source: "reused" } }, { ...request, expectedBefore: { ...expectedBefore, ticket: -0 } },
    Object.defineProperty({ ...request }, "expectedBefore", { get(): never { throw new Error("getter invoked"); } })]) {
    assert.throws(() => buildCurrentPcbRenamePreflightProgram(invalid)); assert.equal(validateCurrentPcbRenamePreflightArguments(invalid)["valid"], false);
  }
  const envelope = structuredClone(await fixture().run()), value = decodeCurrentPcbRenamePreflightReply(reply(envelope), request);
  for (const key of ["permissionVerified", "backendActorVerified", "backendClockVerified", "startupQualified", "workerIdentityVerified", "producerBindingVerified",
    "sourceMembershipVerified", "persistenceVerified", "writerAuthority", "executionAuthorized", "mutationDispatched", "explicitSaveDispatched"] as const) {
    assert.throws(() => decodeCurrentPcbRenamePreflightReply(reply(encodeExactReadEnvelope({ ...value, [key]: true })), request));
  }
  for (const invalid of [{ ...value, desiredTitle: "Other" }, { ...value, extra: true }, { ...value, peers: [] }, { ...value, peers: value.peers.toReversed() },
    { ...value, peers: [value.peers[0], value.peers[0]] }, { ...value, clientTicketObservation: { ...value.clientTicketObservation, maxTicket: 0 } },
    { ...value, runtimeObservation: { ...value.runtimeObservation, clockProducerOwnershipVerified: true } }]) {
    assert.throws(() => decodeCurrentPcbRenamePreflightReply(reply(encodeExactReadEnvelope(invalid)), request));
  }
  assert.throws(() => decodeCurrentPcbRenamePreflightReply(reply({ schema: "easyeda-pro-control.exact-json.v1", utf8Bytes: 1,
    json: "x".repeat(CURRENT_PCB_RENAME_PREFLIGHT_MAX_BYTES + 1) }), request));
});
