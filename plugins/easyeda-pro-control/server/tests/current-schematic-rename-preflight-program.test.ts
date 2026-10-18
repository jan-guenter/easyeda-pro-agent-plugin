/** Native-shaped read-only VM. No application launch, helper or network. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_SCHEMATIC_RENAME_PREFLIGHT_TIMEOUT_MS, compareCurrentSchematicRenameObservation, decodeCurrentSchematicRenameObservation } from "../src/current-schematic-rename-observation.ts";
import { buildCurrentSchematicRenamePreflightProgram } from "../src/current-schematic-rename-preflight-program.ts";
import { ACTOR as actor, REQUEST as request, schematicBaseline, TARGET as target } from "./helpers/current-schematic-rename-observer-fixture.ts";

const expectedBefore = request.expectedBefore;
interface Options { readonly before?: string; readonly afterRpc?: string; readonly afterClock?: string; readonly pendingAt?: number }
function fixture(options: Options = {}): { run: () => Promise<unknown>; evaluate: (source: string) => unknown; expire: () => void; clears: () => number } {
  let cleared = 0, timeout: (() => void) | undefined;
  const context = createContext({ TextEncoder,
    setTimeout(callback: () => void, delay: number): number { assert.equal(delay, CURRENT_SCHEMATIC_RENAME_PREFLIGHT_TIMEOUT_MS); timeout = callback; return 7; },
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
globalThis.metadata={uuid:target.schematicUuid,project_uuid:target.projectUuid,name:beforeValue.name,display_name:beforeValue.displayName,source:'',version:beforeValue.version,board:'',ticket:beforeValue.ticket,updateTime:beforeValue.updateTime};
globalThis.peer={...metadata,uuid:'9'.repeat(32),name:'peer sch',display_name:'Peer SCH',ticket:2};globalThis.peerMap={[metadata.uuid]:metadata,[peer.uuid]:peer};
globalThis.projectDetail={uuid:target.projectUuid,currentBranch:target.branchUuid,isV2Format:false,owner:{uuid:target.ownerUuid},archive:false,cbb_project:false};
globalThis.workerClient='f'.repeat(16);globalThis.workerMaxTicket=100;
globalThis.nameLookup=title=>Object.values(peerMap).find(value=>value.display_name.toLocaleLowerCase()===title.toLocaleLowerCase())?.uuid||'';
class Bus{async rpcCall(topic,args,timeout){if(this!==gVars.messageBus||timeout!==0||!Array.isArray(args))return forbidden('receiver');calls.push([topic,[...args]]);
if(topic==='/PrjDB/schematic/getData'){if(args.length!==2||args[0]!==target.schematicUuid||args[1]!==target.projectUuid)return forbidden('schematic-args');}
else if(topic==='/PrjDB/schematic/getIdByName'){if(args.length!==2||args[0]!=='Renamed SCH'||args[1]!==target.projectUuid)return forbidden('name-args');}
else if(['/PrjDB/project/getData','/PrjDB/project/getClient','/PrjDB/project/getMaxTicket','/PrjDB/schematic/getAllKVDatas'].includes(topic)){if(args.length!==1||args[0]!==target.projectUuid)return forbidden('project-args');}else return forbidden(topic);
if(calls.length===${options.pendingAt ?? 0})await new Promise(resolve=>{globalThis.release=resolve;});await Promise.resolve();${options.afterRpc ?? ""}
return{message:topic==='/PrjDB/schematic/getData'?metadata:topic==='/PrjDB/schematic/getAllKVDatas'?peerMap:topic==='/PrjDB/schematic/getIdByName'?nameLookup(args[0]):topic==='/PrjDB/project/getClient'?workerClient:topic==='/PrjDB/project/getMaxTicket'?workerMaxTicket:projectDetail};}}
class Permission{constructor(){this._isConcurrentStrictMode=false;this.readOnly=false;}get isConcurrentStrictMode(){return this._isConcurrentStrictMode;}set isConcurrentStrictMode(value){this._isConcurrentStrictMode=value;}getIframeDisableStatusPanelPcb(id){if(this!==UI.concurrentDesign||id!==Tabs.currentTabId)return forbidden('permission-receiver');return{disable:this.readOnly};}}
globalThis.gVars={currentProject:{projectId:target.projectUuid,branchUuid:target.branchUuid,isV2Format:false},isHistoryMode:false,messageBus:new Bus(),sessionStorageTabs:new Set(),urlCmd:null,globalVariableCookieData:{userInfo:${JSON.stringify(actor)}},loginedUserInfo:${JSON.stringify(actor)}};
globalThis.UI={gVars,tabBar:Tabs,concurrentDesign:new Permission()};globalThis.eda={extensionUuid:'7e06d286b1ac846ef7eab9c7f2a9ee40',dmt_Schematic:{modifySchematicName:()=>forbidden('modify'),getAllSchematicsInfo:()=>forbidden('public-tree')},dmt_Project:{openProject:()=>forbidden('open')},sys_FileSystem:{save:()=>forbidden('save')}};
globalThis.clockTick=1000;globalThis.clockCalls=0;Date.now=function(){return clockTick++;};
class ClockBus{async rpcCall(...args){if(this!==gVars.concurrentBus||args.length!==1||args[0]!=='/pro-mgr/serverTime/now')return forbidden('clock-receiver');clockCalls++;await Promise.resolve();${options.afterClock ?? ""}return clockTick++;}}
gVars.concurrentBus=new ClockBus();globalThis['/'+_TAB_ID_+'/notify']=gVars.concurrentBus;
globalThis.domRoot={tagName:'DIV',ownerDocument:document,isConnected:true,children:[]};
domRoot.children=['commandWin','exitSmartSizeTool','exitPadShapeTool','project-blank-page','assembly-variant-page'].map(id=>({id,tagName:'DIV',ownerDocument:document,isConnected:true,parentElement:domRoot,getAttribute(){return null;}}));
globalThis.extraMarkers=[];globalThis.extraIframes=[];globalThis.blankPools=[];
document.querySelectorAll=function(selector){if(selector==='[id="tabbar_bodies"]')return[domRoot];if(selector==='iframe')return extraIframes;if(selector==='.blankIframeDiv')return blankPools;if(selector.startsWith('.editframe,'))return extraMarkers;return forbidden('selector');};
${options.before ?? ""}`, context, { timeout: 1000 });
  return {
    run: (): Promise<unknown> => Promise.resolve(runInContext(`(async()=>{${buildCurrentSchematicRenamePreflightProgram(request)}})()`, context, { timeout: 1000 }) as unknown),
    evaluate: (source): unknown => runInContext(source, context, { timeout: 1000 }) as unknown,
    expire(): void { assert.ok(timeout !== undefined); timeout(); }, clears: (): number => cleared,
  };
}
async function flush(): Promise<void> { for (let index = 0; index < 50; index += 1) { await Promise.resolve(); } }


void test("SCH fixed program observes the exact map/name/client routes twice without calling a writer", async () => {
  const { before: historical, metadata } = await schematicBaseline();
  for (const before of ["", "info.tabs.push(blank);info.activeTabId='0';Tabs.currentTabId='0';", "peerMap={[peer.uuid]:peer,[metadata.uuid]:metadata};"]) {
    const env = fixture({ before }), envelope = structuredClone(await env.run());
    const value = decodeCurrentSchematicRenameObservation({ content: [], structuredContent: { ok: true, result: envelope } }, request);
    assert.deepEqual(value.expectedBefore, expectedBefore); assert.deepEqual(value.target, target); assert.equal(value.desiredTitle, request.desiredTitle);
    assert.deepEqual(value.peers.map(peer => peer.uuid), [target.schematicUuid, "9".repeat(32)]);
    assert.equal(compareCurrentSchematicRenameObservation(metadata, historical, value)["historicalMetadataMatched"], true);
    assert.deepEqual(value.clientTicketObservation, { client: "f".repeat(16), maxTicket: 100, samples: 4 });
    assert.deepEqual(value.runtimeObservation.actor, actor); assert.equal(env.evaluate("clockCalls"), 4); assert.equal(env.evaluate("calls.length"), 18);
    assert.equal(value.completeNativeSchematicMapObserved, true); assert.equal(value.writerAuthority, false); assert.equal(value.schematicSubscriberCompletionVerified, false);
    const topics = ["/PrjDB/project/getClient", "/PrjDB/project/getMaxTicket", "/PrjDB/project/getData", "/PrjDB/schematic/getAllKVDatas",
      "/PrjDB/schematic/getData", "/PrjDB/schematic/getIdByName", "/PrjDB/project/getData", "/PrjDB/project/getClient", "/PrjDB/project/getMaxTicket"];
    assert.equal(env.evaluate("JSON.stringify(calls.map(call=>call[0]))"), JSON.stringify([...topics, ...topics]));
    assert.deepEqual(structuredClone(env.evaluate("denied")), []); assert.equal(env.clears(), 1);
  }
});
void test("SCH program refuses owner/editor contamination before native metadata reads", async () => {
  for (const before of ["info.tabs.push({tabId:target.schematicUuid+'@'+target.projectUuid,data:{doctype:1}});", "extraMarkers.push({});",
    "extraIframes.push({});", "start.isUnSaved=true;", "UI.concurrentDesign.readOnly=true;", "UI.concurrentDesign._isConcurrentStrictMode=true;",
    "gVars.sessionStorageTabs.add('pending');", "gVars.currentProject.branchUuid='e'.repeat(32);", "navigator.serviceWorker.controller={};",
    "gVars.loginedUserInfo.nickname='different';"]) {
    const env = fixture({ before }); await assert.rejects(env.run(), /CURRENT_SCHEMATIC_RENAME_PREFLIGHT_REFUSED:HOST/u);
    assert.equal(env.evaluate("calls.length"), 0);
  }
});
void test("SCH program refuses collisions, incomplete replies and noncanonical native SCH fields", async () => {
  for (const before of ["peer.name='renamed sch';peer.display_name='ReNaMeD SCH';", "nameLookup=()=>peer.uuid;", "nameLookup=()=>undefined;",
    "nameLookup=()=>null;", "projectDetail.owner.uuid='e'.repeat(32);", "projectDetail.store=true;", "metadata.display_name='changed';",
    "metadata.source='reused';", "metadata.version='';", "metadata.board='invalid';", "metadata.updateTime=-0;", "peer.ticket=101;",
    "peer.project_uuid='e'.repeat(64);", "peer.uuid=target.schematicUuid;", "peer.display_name='Unqualified I';", "delete peerMap[metadata.uuid];",
    "peerMap={};", "peerMap=[];", "peerMap=undefined;", "peerMap[Symbol('hidden')]=peer;",
    "Object.defineProperty(peerMap,peer.uuid,{get(){getterReads++;throw new Error('private');}});",
    "Object.defineProperty(peer,'display_name',{get(){getterReads++;throw new Error('private');}});"]) {
    const env = fixture({ before }); await assert.rejects(env.run(), /CURRENT_SCHEMATIC_RENAME_PREFLIGHT_REFUSED:/u); assert.equal(env.evaluate("getterReads"), 0);
  }
  await assert.rejects(fixture({ afterRpc: "if(topic==='/PrjDB/schematic/getIdByName')return{};" }).run(), /:NAME/u);
  /* Native SCH getters have no PCB docType or parent fields: observing them
   * would conflate contracts. Neither they nor canvas properties are touched. */
  const safe = fixture({ before: "for(const key of ['canvas','docType','parent_uuid'])Object.defineProperty(metadata,key,{get(){getterReads++;throw new Error('private');}});" });
  await safe.run(); assert.equal(safe.evaluate("getterReads"), 0);
});
void test("SCH program rechecks complete peers, retained owners, actors and client around awaits", async () => {
  for (const afterRpc of ["if(calls.length===13){peer.name='changed';peer.display_name='Changed';}",
    "if(calls.length===13)peerMap['9'.repeat(16)]={...peer,uuid:'9'.repeat(16)};", "if(calls.length===9)workerMaxTicket++;",
    "if(calls.length===8)workerClient='9'.repeat(16);", "if(calls.length===7)projectDetail.owner.uuid='e'.repeat(32);",
    "if(calls.length===1)gVars.messageBus=new Bus();", "if(calls.length===1)gVars.currentProject={...gVars.currentProject};",
    "if(calls.length===1)gVars.loginedUserInfo={...gVars.loginedUserInfo};", "if(calls.length===1)info.tabs=[...info.tabs];",
    "if(calls.length===1)UI.concurrentDesign=new Permission();", "if(calls.length===1)extraIframes.push({});"]) {
    await assert.rejects(fixture({ afterRpc }).run(), /CURRENT_SCHEMATIC_RENAME_PREFLIGHT_REFUSED:/u);
  }
  for (const afterClock of ["return{message:clockTick};", "return -0;", "return clockTick+10;", "clockTick+=10001;",
    "Date.now=()=>clockTick++;", "gVars.concurrentBus=new ClockBus();", "globalThis['/'+_TAB_ID_+'/notify']=new ClockBus();",
    "gVars.loginedUserInfo.nickname='changed';"]) {
    await assert.rejects(fixture({ afterClock }).run(), /CURRENT_SCHEMATIC_RENAME_PREFLIGHT_REFUSED:/u);
  }
});
void test("SCH deadline stops delayed continuation without retry or cancellation claims", async () => {
  const env = fixture({ pendingAt: 4 }), running = env.run(); await flush(); assert.equal(env.evaluate("calls.length"), 4); env.expire();
  await assert.rejects(running, { message: "CURRENT_SCHEMATIC_RENAME_PREFLIGHT_REFUSED:TIMEOUT" });
  env.evaluate("release();"); await flush(); assert.equal(env.evaluate("calls.length"), 4); assert.equal(env.clears(), 1);
});
void test("SCH native map limits reject complete oversized results without truncation", async () => {
  for (const before of ["for(let i=0;i<4096;i++){let uuid=i.toString(16).padStart(16,'0');peerMap[uuid]={...peer,uuid};}",
    "for(let i=0;i<1000;i++){let uuid=i.toString(16).padStart(16,'0');peerMap[uuid]={...peer,uuid,name:'x'.repeat(512),display_name:'X'.repeat(512)};}"]) {
    const env = fixture({ before }); await assert.rejects(env.run(), /CURRENT_SCHEMATIC_RENAME_PREFLIGHT_REFUSED:PEERS/u);
    assert.equal(env.evaluate("calls.length"), 4); assert.deepEqual(structuredClone(env.evaluate("denied")), []);
  }
});

