import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { buildCurrentSchematicRenameStartupObservation, decodeCurrentSchematicRenameStartupObservation } from "../src/current-schematic-rename-startup-runtime.ts";
import { decodeExactReadEnvelope, encodeExactReadEnvelope } from "../src/exact-readers.ts";
import { prepareCurrentSchematicChildRoster } from "../src/current-schematic-child-roster.ts";
import { ACTOR as SCH_PROGRAM_ACTOR, TARGET as SCH_PROGRAM_TARGET, schematicBaseline } from "./helpers/current-schematic-rename-observer-fixture.ts";

async function schematicProgramPreparation(): Promise<Awaited<ReturnType<typeof schematicBaseline>> & Readonly<{
  roster: Awaited<ReturnType<typeof prepareCurrentSchematicChildRoster>>;
}>> {
  const baseline = await schematicBaseline(), roster = await prepareCurrentSchematicChildRoster(baseline.metadata, baseline.before);
  return { ...baseline, roster };
}

type Prepared = Awaited<ReturnType<typeof schematicProgramPreparation>>;
interface Options { readonly setup?: string; readonly afterRpc?: string; readonly afterClock?: string; readonly pending?: string;
  readonly pendingAfterWrite?: boolean; readonly cleanupFails?: boolean }
function fixture(prepared: Prepared, options: Options = {}): { run: () => Promise<unknown>; evaluate: (source: string) => unknown; expire: () => void } {
  let timeout: (() => void) | undefined;
  const context = createContext({ TextEncoder, structuredClone,
    setTimeout(callback: () => void, delay: number): number { assert.equal(delay, 10_000); timeout = callback; return 7; },
    clearTimeout(timer: number): void { assert.equal(timer, 7); if (options.cleanupFails === true) { throw new Error("PRIVATE_CLEANUP"); } },
  });
  runInContext(`globalThis.window=globalThis;globalThis.top=globalThis;globalThis.calls=[];globalThis.writes=0;globalThis.forbidden=[];globalThis.getterReads=0;
globalThis.target=${JSON.stringify(SCH_PROGRAM_TARGET)};globalThis.expectedPeers=${JSON.stringify(prepared.metadata.peers)};
globalThis.location={href:'https://client/editor?cll=warn#id='+target.projectUuid,origin:'https://client'};
globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href};globalThis.navigator={serviceWorker:{controller:null}};
globalThis.PRO_EDITOR_MODE='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM';globalThis.PRO_EDITOR_VERSION='3.2.206';globalThis._TAB_ID_='1'.repeat(16);
globalThis.start={tabId:'tab_page1',data:{doctype:-1},isAbleDelete:false,group:'start_blank',draggable:true,isDisplayNone:false};
globalThis.info={id:'editor-window-main',belong:'editor-window-main',tabs:[start],activeTabId:'tab_page1'};
class Tabs{static containerIds=['editor-window-main'];static containerTree={id:'editor-window-main'};static belongContainer='editor-window-main';static currentTabId='tab_page1';static isOpenProjectDoc=true;static isOpenOtherDoc=true;static getActiveTab(){return this.currentTabId;}static getContainerInfo(){return info;}static hasTabUnSaved(){return info.tabs.some(tab=>tab.isUnSaved===true);}static isTabUnSaved(){return this.hasTabUnSaved();}}
const denied=name=>{forbidden.push(name);throw new Error('PRIVATE_FORBIDDEN');};globalThis.fetch=()=>denied('network');
globalThis.roster=Object.fromEntries(expectedPeers.map(peer=>[peer.uuid,{uuid:peer.uuid,project_uuid:target.projectUuid,name:peer.name,display_name:peer.displayName,source:peer.source,version:peer.version,board:peer.boardUuid,ticket:peer.ticket,updateTime:peer.updateTime}]));
globalThis.metadata=roster[target.schematicUuid];globalThis.peer=Object.values(roster).find(value=>value.uuid!==target.schematicUuid);
globalThis.projectDetail={uuid:target.projectUuid,currentBranch:target.branchUuid,isV2Format:false,owner:{uuid:target.ownerUuid},archive:false,cbb_project:false};
globalThis.workerClient='a'.repeat(16);globalThis.workerMaxTicket=100;globalThis.nameLookup=()=>'';globalThis.tick=1000000;globalThis.clockCalls=0;
Date.now=()=>tick++;Date.prototype.getTimezoneOffset=()=>0;
class Bus{async rpcCall(topic,args,timeout){if(this!==gVars.messageBus||timeout!==0||!Array.isArray(args))return denied('receiver');calls.push([topic,JSON.parse(JSON.stringify(args))]);
if(topic==='/PrjDB/schematic/updateData'){if(args.length!==2||args[1]!==target.projectUuid||JSON.stringify(args[0])!==JSON.stringify({uuid:target.schematicUuid,display_name:'Renamed SCH'}))return denied('mutation-args');writes++;const stamp=tick++;Object.assign(metadata,{display_name:'Renamed SCH',name:'renamed sch',version:String(stamp),ticket:101,updateTime:stamp});workerMaxTicket=101;ast.transId++;temp.transId=ast.transId;ast.lastModify++;projectMgr.componentCache.symbolTemplate.changed={};}
else if(topic==='/PrjDB/sheet/getAllKVDatas'){if(args.length!==2||args[0]!==undefined||args[1]!==target.projectUuid)return denied('child-args');}
else if(topic==='/PrjDB/schematic/getData'){if(args.length!==2||args[0]!==target.schematicUuid||args[1]!==target.projectUuid)return denied('pcb-args');}
else if(topic==='/PrjDB/schematic/getIdByName'){if(args.length!==2||args[0]!=='Renamed SCH'||args[1]!==target.projectUuid)return denied('name-args');}
else if(['/PrjDB/project/getData','/PrjDB/project/getClient','/PrjDB/project/getMaxTicket','/PrjDB/schematic/getAllKVDatas'].includes(topic)){if(args.length!==1||args[0]!==target.projectUuid)return denied('project-args');}else return denied(topic);
if(topic===${JSON.stringify(options.pending ?? "")}&&(${JSON.stringify(options.pendingAfterWrite !== true)}||writes>0))await new Promise(resolve=>{globalThis.release=resolve;});await Promise.resolve();${options.afterRpc ?? ""}
return{message:topic==='/PrjDB/sheet/getAllKVDatas'?childMap:topic==='/PrjDB/schematic/updateData'?{success:true,result:metadata}:topic==='/PrjDB/schematic/getData'?metadata:topic==='/PrjDB/schematic/getAllKVDatas'?roster:topic==='/PrjDB/schematic/getIdByName'?nameLookup():topic==='/PrjDB/project/getClient'?workerClient:topic==='/PrjDB/project/getMaxTicket'?workerMaxTicket:projectDetail};}}
class Permission{constructor(){this._isConcurrentStrictMode=false;this.readOnly=false;}get isConcurrentStrictMode(){return this._isConcurrentStrictMode;}set isConcurrentStrictMode(value){this._isConcurrentStrictMode=value;}getIframeDisableStatusPanelPcb(){return{disable:this.readOnly};}}
globalThis.gVars={currentProject:{projectId:target.projectUuid,branchUuid:target.branchUuid,isV2Format:false},isHistoryMode:false,messageBus:new Bus(),sessionStorageTabs:new Set(),urlCmd:null,globalVariableCookieData:{userInfo:${JSON.stringify(SCH_PROGRAM_ACTOR)}},loginedUserInfo:${JSON.stringify(SCH_PROGRAM_ACTOR)}};
globalThis.UI={gVars,tabBar:Tabs,concurrentDesign:new Permission()};globalThis.eda={extensionUuid:'7e06d286b1ac846ef7eab9c7f2a9ee40',dmt_Schematic:{modifySchematicName:()=>denied('public-rename')},pcb_Document:{save:()=>denied('save')}};
globalThis.projectMgr={uuid:target.projectUuid};projectMgr.componentCache={projectMgr,symbolTemplate:{}};
globalThis.actionRunner={_currentAction:null};actionRunner.realTimeSyncActionManager={transactionRunner:actionRunner,_isRunning:false,_runnerSet:{_idMap:new Map()},_runTimer:{_mark:-1},_localActionOnceDidRunSubscription:null};
globalThis.docMemory={docMap:new Map(),_docFetchPromiseMap:new Map()};globalThis.SCH={gVars:{projectMgr,actionRunner,currentProject:{...gVars.currentProject}},get docMemoryManager(){return docMemory;}};
class AstManager{constructor(){this.prjUuid=target.projectUuid;this.batchDepth=0;this._isClose=false;this.CBB=false;}}
globalThis.astManager=new AstManager();globalThis.ast={isBuild:true,isPass:false,transId:1,lastModify:123};globalThis.temp={isBuild:false,isPass:false,transId:1,lastModify:100};
globalThis.childMap=${JSON.stringify(prepared.roster.childKv)};globalThis.astSch=${JSON.stringify(prepared.roster.targetAst)};globalThis.tempSch=JSON.parse(JSON.stringify(astSch));ast.schematics={[target.schematicUuid]:astSch};temp.schematics={[target.schematicUuid]:tempSch};
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
  return { run: (): Promise<unknown> => Promise.resolve(runInContext(`(async()=>{${buildCurrentSchematicRenameStartupObservation(prepared.metadata.request, prepared.roster.startupInput)}})()`, context, { timeout: 1000 }) as unknown),
    evaluate: (source): unknown => runInContext(source, context, { timeout: 1000 }) as unknown,
    expire(): void { assert.ok(timeout !== undefined); timeout(); } };
}
function reply(value: unknown): unknown { return { content: [], structuredContent: { ok: true, result: value } }; }
async function flush(): Promise<void> { for (let index = 0; index < 100; index += 1) { await Promise.resolve(); } }

function decode(raw: unknown, prepared: Prepared): ReturnType<typeof decodeCurrentSchematicRenameStartupObservation> {
  return decodeCurrentSchematicRenameStartupObservation(reply(raw), prepared.metadata.request, prepared.roster.startupInput);
}
void test("SCH startup collects fixed metadata and child snapshots under the same retained holders without writing", async () => {
  const prepared = await schematicProgramPreparation();
  const env = fixture(prepared), raw = structuredClone(await env.run()), result = decode(raw, prepared);
  assert.equal(env.evaluate("writes"), 0); assert.equal(env.evaluate("clockCalls"), 4);
  assert.deepEqual(result.observation.peers, prepared.metadata.peers);
  assert.deepEqual(result.children.samples[0].childKv, prepared.roster.childKv);
  assert.deepEqual(structuredClone(env.evaluate("forbidden")), []);
  const wrapper = decodeExactReadEnvelope(raw); assert.ok(wrapper !== null && typeof wrapper === "object");
  for (const key of ["completeAstSourceBindingVerified", "startupLocalChangesExcluded", "permissionVerified", "backendActorVerified", "backendClockVerified",
    "producerBindingVerified", "writerAuthority", "crossInvocationReceiverContinuityVerified", "globalIdleVerified", "persistenceVerified", "executionAuthorized"]) {
    assert.equal(Reflect.get(wrapper, key), false);
    assert.throws(() => decode(encodeExactReadEnvelope({ ...wrapper, [key]: true }), prepared));
  }
});
void test("SCH startup rejects unstable child holders and initialized source holders before any native read", async () => {
  const prepared = await schematicProgramPreparation();
  for (const setup of ["astSch.sort=[];", "astSch.blockSymbolUuid='f'.repeat(16);", "astManager.batchDepth=1;", "temp.isPass=true;",
    "SCH.gVars.currentProject.branchUuid='f'.repeat(32);", "docMemory.docMap.set('unrequested',{});",
    "projectMgr.componentCache.symbolTemplate.extra={};", "standardPanels.push({});", "extraIframes.push({});"]) {
    const env = fixture(prepared, { setup }), raw = structuredClone(await env.run());
    assert.throws(() => decode(raw, prepared), /startup:/u); assert.equal(env.evaluate("calls.length"), 0); assert.equal(env.evaluate("writes"), 0);
  }
});

void test("SCH startup retains completed metadata if the subsequent child read or original-holder check fails", async () => {
  const prepared = await schematicProgramPreparation();
  for (const afterRpc of ["if(topic==='/PrjDB/sheet/getAllKVDatas')childMap={};",
    "if(topic==='/PrjDB/sheet/getAllKVDatas')astSch.sort=[...astSch.sort];",
    "if(topic==='/PrjDB/sheet/getAllKVDatas')standardPanels.push({});"]) {
    const env = fixture(prepared, { afterRpc }), raw = structuredClone(await env.run()), wrapper = decodeExactReadEnvelope(raw);
    assert.ok(wrapper !== null && typeof wrapper === "object"); assert.notEqual(Reflect.get(wrapper, "preflight"), null);
    assert.throws(() => decode(raw, prepared), /startup:/u); assert.equal(env.evaluate("writes"), 0);
  }
});
void test("SCH startup timeout during child collection retains metadata and cannot dispatch after late completion", async () => {
  const prepared = await schematicProgramPreparation();
  const env = fixture(prepared, { pending: "/PrjDB/sheet/getAllKVDatas" });
  const pending = env.run(); await flush(); assert.equal(env.evaluate("typeof release"), "function");
  const calls = env.evaluate("calls.length"); env.expire(); const raw = structuredClone(await pending), wrapper = decodeExactReadEnvelope(raw);
  assert.ok(wrapper !== null && typeof wrapper === "object"); assert.notEqual(Reflect.get(wrapper, "preflight"), null);
  assert.throws(() => decode(raw, prepared), /startup:child-observation/u);
  env.evaluate("release();"); await flush(); assert.equal(env.evaluate("calls.length"), calls); assert.equal(env.evaluate("writes"), 0);
});

