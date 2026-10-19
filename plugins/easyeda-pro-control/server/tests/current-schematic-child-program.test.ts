/** Synthetic native-shaped VM only. No connected child/startup claim. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { buildCurrentSchematicChildGuard } from "../src/current-schematic-child-guard.ts";
import { decodeCurrentSchematicChildObservation } from "../src/current-schematic-child-observation.ts";
import { CURRENT_SCHEMATIC_CHILD_TIMEOUT_MS, buildCurrentSchematicChildProgram } from "../src/current-schematic-child-program.ts";
import { parseCurrentSchematicChildObservation } from "../src/current-schematic-child-roster-contract.ts";
import { compareCurrentSchematicChildRoster, prepareCurrentSchematicChildRoster } from "../src/current-schematic-child-roster.ts";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";
import { REQUEST, TARGET, schematicBaseline } from "./helpers/current-schematic-rename-observer-fixture.ts";

interface Options { readonly before?: string; readonly afterRpc?: string; readonly pendingAt?: number }
function fixture(options: Options = {}): { run: () => Promise<unknown>; evaluate: (source: string) => unknown; expire: () => void; clears: () => number } {
  let cleared = 0, timeout: (() => void) | undefined;
  const context = createContext({ TextEncoder,
    setTimeout(callback: () => void, delay: number): number { assert.equal(delay, CURRENT_SCHEMATIC_CHILD_TIMEOUT_MS); timeout = callback; return 7; },
    clearTimeout(timer: unknown): void { assert.equal(timer, 7); cleared += 1; },
  });
  runInContext(`globalThis.window=globalThis;globalThis.top=globalThis;globalThis.calls=[];globalThis.denied=[];globalThis.getterReads=0;
globalThis.target=${JSON.stringify(TARGET)};globalThis.location={href:'https://client/editor?cll=warn#id='+target.projectUuid,origin:'https://client'};
globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href};globalThis.navigator={serviceWorker:{controller:null}};
globalThis.PRO_EDITOR_MODE='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM';globalThis.PRO_EDITOR_VERSION='3.2.206';
globalThis.start={tabId:'tab_page1',data:{doctype:-1},isAbleDelete:false,group:'start_blank',draggable:true,isDisplayNone:false};
globalThis.info={id:'editor-window-main',belong:'editor-window-main',tabs:[start],activeTabId:'tab_page1'};
class Tabs{static containerIds=['editor-window-main'];static containerTree={id:'editor-window-main'};static belongContainer='editor-window-main';static currentTabId='tab_page1';static isOpenProjectDoc=true;static isOpenOtherDoc=true;static getActiveTab(){return this.currentTabId;}static getContainerInfo(id){return id===info.id?info:undefined;}static hasTabUnSaved(){return info.tabs.some(tab=>tab.isUnSaved===true);}static isTabUnSaved(id){return info.tabs.some(tab=>tab.tabId===id&&tab.isUnSaved===true);}}
const forbidden=name=>{denied.push(name);throw new Error('PRIVATE_FORBIDDEN');};globalThis.fetch=()=>forbidden('network');
globalThis.projectDetail={uuid:target.projectUuid,currentBranch:target.branchUuid,isV2Format:false,owner:{uuid:target.ownerUuid},archive:false,cbb_project:false};
globalThis.child={uuid:'c'.repeat(16),project_uuid:target.projectUuid,schematic_uuid:target.schematicUuid,title:'child title',display_title:'Child title',docType:1,zIndex:0,source:'',version:'1',updateTime:1,ticket:3};
globalThis.childMap={[child.uuid]:child};
class Bus{async rpcCall(topic,args,timeout){if(this!==gVars.messageBus||timeout!==0||!Array.isArray(args))return forbidden('receiver');calls.push([topic,[...args]]);
if(topic==='/PrjDB/sheet/getAllKVDatas'){if(args.length!==2||args[0]!==undefined||args[1]!==target.projectUuid)return forbidden('sheet-args');}
else if(topic==='/PrjDB/project/getData'){if(args.length!==1||args[0]!==target.projectUuid)return forbidden('project-args');}else return forbidden(topic);
if(calls.length===${options.pendingAt ?? 0})await new Promise(resolve=>{globalThis.release=resolve;});await Promise.resolve();${options.afterRpc ?? ""}
return{message:topic==='/PrjDB/sheet/getAllKVDatas'?childMap:projectDetail};}}
class Permission{constructor(){this._isConcurrentStrictMode=false;this.readOnly=false;}get isConcurrentStrictMode(){return this._isConcurrentStrictMode;}set isConcurrentStrictMode(value){this._isConcurrentStrictMode=value;}getIframeDisableStatusPanelPcb(id){if(this!==UI.concurrentDesign||id!==Tabs.currentTabId)return forbidden('permission-receiver');return{disable:this.readOnly};}}
globalThis.gVars={currentProject:{projectId:target.projectUuid,branchUuid:target.branchUuid,isV2Format:false},isHistoryMode:false,messageBus:new Bus(),sessionStorageTabs:new Set(),urlCmd:null};
globalThis.UI={gVars,tabBar:Tabs,concurrentDesign:new Permission()};globalThis.eda={extensionUuid:'7e06d286b1ac846ef7eab9c7f2a9ee40'};
globalThis.domRoot={tagName:'DIV',ownerDocument:document,isConnected:true,children:[]};
domRoot.children=['commandWin','exitSmartSizeTool','exitPadShapeTool','project-blank-page','assembly-variant-page'].map(id=>({id,tagName:'DIV',ownerDocument:document,isConnected:true,parentElement:domRoot,getAttribute(){return null;}}));
globalThis.extraMarkers=[];globalThis.extraIframes=[];globalThis.blankPools=[];
document.querySelectorAll=function(selector){if(selector==='[id="tabbar_bodies"]')return[domRoot];if(selector==='iframe')return extraIframes;if(selector==='.blankIframeDiv')return blankPools;if(selector.startsWith('.editframe,'))return extraMarkers;return forbidden('selector');};
class Manager{constructor(){this.prjUuid=target.projectUuid;this.batchDepth=0;this._isClose=false;this.CBB=false;}getBatch(){return forbidden('batch');}startBatch(){return forbidden('start');}get isClose(){return forbidden('getter');}}
globalThis.manager=new Manager();globalThis.astSheet={uuid:child.uuid,title:child.title,displayTitle:child.display_title,zIndex:0};
globalThis.astSch={uuid:target.schematicUuid,title:'source sch',displayTitle:'Source SCH',board:'',version:'1',updateTime:1,blockSymbolUuid:'',sort:[child.uuid],sheets:{[child.uuid]:astSheet}};
globalThis.tempSch={...astSch,sort:[...astSch.sort],sheets:{[child.uuid]:{...astSheet}}};
globalThis.ast={isBuild:true,isPass:false,transId:1,lastModify:123,schematics:{[target.schematicUuid]:astSch}};
globalThis.temp={isBuild:false,isPass:false,transId:1,lastModify:100,schematics:{[target.schematicUuid]:tempSch}};
globalThis.tree={manager:()=>manager,ast:()=>ast,tempAst:()=>temp,render:()=>forbidden('render')};
globalThis.SCH={gVars:{projectMgr:{uuid:target.projectUuid},currentProject:{...gVars.currentProject}},D:{leftTree:tree}};
Object.defineProperty(SCH,'docMemoryManager',{get(){return forbidden('init-manager');}});
${options.before ?? ""}`, context, { timeout: 1000 });
  return { run: (): Promise<unknown> => Promise.resolve(runInContext(`(async()=>{${buildCurrentSchematicChildProgram(REQUEST)}})()`, context, { timeout: 1000 }) as unknown),
    evaluate: (source): unknown => runInContext(source, context, { timeout: 1000 }) as unknown,
    expire(): void { assert.ok(timeout !== undefined); timeout(); }, clears: (): number => cleared };
}
async function flush(): Promise<void> { for (let index = 0; index < 50; index += 1) { await Promise.resolve(); } }
function wrapped(result: unknown): unknown { return { content: [], structuredContent: { ok: true, result } }; }

void test("SCH fixed child observer matches original SQL roster without claiming startup or writer authority", async () => {
  const { before, metadata } = await schematicBaseline(), prepared = await prepareCurrentSchematicChildRoster(metadata, before);
  for (const setup of ["", "manager.pendSchematicId=new Set();manager.pendSheetId=new Set();", "manager.CBB=undefined;"]) {
    const env = fixture({ before: setup }), envelope = structuredClone(await env.run());
    const value = decodeCurrentSchematicChildObservation({ content: [], structuredContent: { ok: true, result: envelope } }, REQUEST);
    const comparison = compareCurrentSchematicChildRoster(prepared, before, value);
    assert.deepEqual(value.target, TARGET); assert.deepEqual(value.samples[0].childKv, prepared.childKv);
    assert.equal(comparison["historicalChildRosterMatched"], true); assert.equal(comparison["writerAuthority"], false);
    assert.equal(comparison["childInitializationExcluded"], false); assert.equal(comparison["schematicSubscriberCompletionVerified"], false);
    assert.equal(env.evaluate("calls.length"), 6); assert.equal(env.clears(), 1); assert.deepEqual(structuredClone(env.evaluate("denied")), []);
    assert.deepEqual(structuredClone(env.evaluate("calls.map(call=>call[0])")), ["/PrjDB/project/getData", "/PrjDB/sheet/getAllKVDatas", "/PrjDB/project/getData",
      "/PrjDB/project/getData", "/PrjDB/sheet/getAllKVDatas", "/PrjDB/project/getData"]);
  }
});
void test("SCH guard rejects unbuilt, pending, wrong-project and inconsistent child holders before reads", async () => {
  for (const before of ["manager.batchDepth=1;", "manager.batchDepth=-0;", "manager._isClose=true;", "manager.CBB=-0;", "manager.CBB=true;",
    "SCH.gVars.projectMgr.uuid='foreign';", "SCH.gVars.currentProject.branchUuid='e'.repeat(32);", "SCH.gVars.currentProject.projectId='foreign';",
    "SCH.gVars.currentProject.isV2Format=true;", "manager.prjUuid='foreign';", "ast.isBuild=false;", "temp.isPass=true;", "ast.transId=2;", "temp=ast;",
    "manager.pendSchematicId=new Set();", "manager.pendSchematicId=manager.pendSheetId=new Set();", "manager.pendSchematicId=new Set();manager.pendSheetId=new Set(['pending']);",
    "tempSch.title='changed';", "astSch.sort=[];", "astSch.sort=[child.uuid,child.uuid];", "delete astSch.sheets[child.uuid];", "astSch.sheets['d'.repeat(16)]={...astSheet};",
    "tempSch.version='2';", "astSch.blockSymbolUuid='e'.repeat(16);", "astSch.sheets[child.uuid].uuid='e'.repeat(16);", "astSch.sort=new Array(1);",
    "astSch.sort.extra=1;", "temp.schematics['e'.repeat(16)]={};", "delete manager.CBB;", "Object.setPrototypeOf(astSch,null);",
    "extraIframes.push({});", "start.isUnSaved=true;", "gVars.currentProject.branchUuid='e'.repeat(32);"]) {
    const env = fixture({ before }); await assert.rejects(env.run(), /CURRENT_SCHEMATIC_CHILD_REFUSED:/u, before);
    assert.equal(env.evaluate("calls.length"), 0); assert.deepEqual(structuredClone(env.evaluate("denied")), []);
  }
});
void test("SCH child observers conditionally admit capital I only with exact native ASCII-folded KV and both ASTs", async () => {
  const setTitle = "child.title='child input';child.display_title='Child Input';for(const value of [astSheet,tempSch.sheets[child.uuid]]){value.title=child.title;value.displayTitle=child.display_title;}";
  const { before, metadata } = await schematicBaseline(1, undefined, "Child Input");
  const env = fixture({ before: setTitle }), roster = await prepareCurrentSchematicChildRoster(metadata, before);
  const envelope: unknown = structuredClone(await env.run()), observed = decodeCurrentSchematicChildObservation(wrapped(envelope), REQUEST);
  compareCurrentSchematicChildRoster(roster, before, observed);
  assert.equal(roster.nativeChildTitlePolicy, "ascii-fold-projection-requires-exact-native-match");
  assert.equal(observed.samples[0].childKv["c".repeat(16)]?.display_title, "Child Input");
  for (const change of ["child.title='child ınput';", "astSheet.title='child ınput';", "tempSch.sheets[child.uuid].title='child ınput';",
    "child.display_title='Child İnput';", "astSch.displayTitle='Source Input';astSch.title='source input';tempSch.displayTitle=astSch.displayTitle;tempSch.title=astSch.title;"]) {
    const rejected = fixture({ before: `${setTitle}${change}` });
    await assert.rejects(rejected.run(), /CURRENT_SCHEMATIC_CHILD_REFUSED:/u);
    assert.deepEqual(structuredClone(rejected.evaluate("denied")), []);
  }
  const supplied = structuredClone(observed);
  for (const sample of supplied.samples) {
    const child = sample.childKv["c".repeat(16)]; assert.ok(child !== undefined); child.title = "child ınput";
  }
  assert.throws(() => compareCurrentSchematicChildRoster(roster, before, supplied), /printable ASCII/u);
});
void test("SCH guard rechecks exact receiver, nested object and projected value identity after native awaits", async () => {
  for (const change of ["SCH={...SCH};", "SCH.gVars={...SCH.gVars};", "SCH.gVars.projectMgr={...SCH.gVars.projectMgr};", "SCH.D.leftTree={...tree};",
    "SCH.gVars.currentProject={...SCH.gVars.currentProject};", "SCH.gVars.currentProject.branchUuid='e'.repeat(32);",
    "tree.manager=()=>manager;", "tree.ast=()=>ast;", "tree.tempAst=()=>temp;", "manager=new Manager();", "Object.setPrototypeOf(manager,{});",
    "ast={...ast};", "temp={...temp};", "ast.schematics={...ast.schematics};", "ast.schematics[target.schematicUuid]={...astSch};",
    "astSch.sheets={...astSch.sheets};", "astSch.sort=[...astSch.sort];", "astSch.sheets[child.uuid]={...astSheet};", "ast.transId=temp.transId=2;",
    "ast.lastModify++;", "manager.CBB=null;", "manager.pendSchematicId=new Set();manager.pendSheetId=new Set();", "gVars.messageBus=new Bus();",
    "info.tabs=[...info.tabs];", "extraMarkers.push({});", "globalThis.Set=class extends Set{};", "projectDetail.owner.uuid='e'.repeat(32);"]) {
    const env = fixture({ afterRpc: `if(calls.length===1){${change}}` }); await assert.rejects(env.run(), /CURRENT_SCHEMATIC_CHILD_REFUSED:/u, change);
    assert.equal(env.evaluate("calls.length"), 1); assert.deepEqual(structuredClone(env.evaluate("denied")), []);
  }
});
void test("SCH fixed child reader refuses missing, partial, drifting and oversized KV replies", async () => {
  for (const before of ["childMap=undefined;", "childMap=[];", "childMap={};", "child.project_uuid='e'.repeat(64);", "child.docType=2;", "child.source='reuse';",
    "child.schematic_uuid='';", "child.title='wrong';", "child.updateTime=0;", "child.version='';", "child.zIndex=-0;", "child.ticket=Infinity;",
    "childMap[Symbol('hidden')]=child;", "for(let i=0;i<129;i++)childMap[i.toString(16).padStart(16,'0')]={...child};"]) {
    const env = fixture({ before }); await assert.rejects(env.run(), /CURRENT_SCHEMATIC_CHILD_REFUSED:CHILDREN/u, before); assert.equal(env.evaluate("calls.length"), 2);
  }
  await assert.rejects(fixture({ afterRpc: "if(calls.length===5)child.ticket++;" }).run(), /CURRENT_SCHEMATIC_CHILD_REFUSED:/u);
  await assert.rejects(fixture({ afterRpc: "if(calls.length===2)return{};" }).run(), /CURRENT_SCHEMATIC_CHILD_REFUSED:CHILDREN/u);
});
void test("SCH projected fields use own data and do not invoke inherited convenience or unrelated geometry getters", async () => {
  for (const [owner, key] of [["tree", "ast"], ["manager", "CBB"], ["manager", "pendSheetId"], ["ast", "schematics"], ["astSch", "sort"],
    ["tempSch", "sheets"], ["astSheet", "displayTitle"], ["child", "ticket"], ["childMap", "c".repeat(16)]]) {
    const env = fixture({ before: `Object.defineProperty(${owner},'${key}',{get(){getterReads++;throw new Error('PRIVATE');}});` });
    await assert.rejects(env.run(), /CURRENT_SCHEMATIC_CHILD_REFUSED:/u); assert.equal(env.evaluate("getterReads"), 0);
  }
  const env = fixture({ before: "for(const owner of [astSch,astSheet,child])for(const key of ['canvas','symbols','doc_id','uniqueNumber'])Object.defineProperty(owner,key,{get(){getterReads++;throw new Error('PRIVATE');}});" });
  await env.run(); assert.equal(env.evaluate("getterReads"), 0);
});
void test("SCH child timeout retains a consumed native read and prevents delayed continuation", async () => {
  const env = fixture({ pendingAt: 2 }), running = env.run(); await flush(); assert.equal(env.evaluate("calls.length"), 2); env.expire();
  await assert.rejects(running, { message: "CURRENT_SCHEMATIC_CHILD_REFUSED:TIMEOUT" }); env.evaluate("release();"); await flush();
  assert.equal(env.evaluate("calls.length"), 2); assert.equal(env.clears(), 1);
});
void test("SCH child fragment cannot dispatch rendering, initialization, batching, Save or PCB-token operations", () => {
  assert.doesNotMatch(buildCurrentSchematicChildGuard(), /render\(|getOrInitDoc|startBatch|endBatch|\.publish\(|rpcCall|setTimeout|Save|pcbRenameStartup/u);
  assert.doesNotMatch(buildCurrentSchematicChildProgram(REQUEST), /getAllArrDatas|modifySchematic|updateData|\.publish\(|currentPcbRename|pcbRenameStartup|new Function|eval\(/u);
});
void test("SCH child transport rejects malformed envelopes, target substitutions and attempted authority claims", async () => {
  const env = fixture(), envelope: unknown = structuredClone(await env.run());
  assert.ok(envelope !== null && typeof envelope === "object");
  const raw = decodeExactReadEnvelope(envelope), value = parseCurrentSchematicChildObservation(raw);
  for (const result of [{ ...envelope, utf8Bytes: 1 }, { ...envelope, schema: "other" }, { ...envelope, extra: true },
    { ...envelope, json: "[Truncated]" }, { ...envelope, json: "x".repeat(524_289) }]) {
    assert.throws(() => decodeCurrentSchematicChildObservation(wrapped(result), REQUEST));
  }
  assert.throws(() => decodeCurrentSchematicChildObservation({ pending: true }, REQUEST));
  assert.throws(() => decodeCurrentSchematicChildObservation(wrapped(envelope), { ...REQUEST, target: { ...TARGET, schematicUuid: "e".repeat(16) } }), /target differs/u);
  assert.throws(() => parseCurrentSchematicChildObservation({ ...value, writerAuthority: true }));
  let traps = 0; const trap = (): never => { traps += 1; throw new Error("must not execute"); };
  const hostile = new Proxy(envelope, { get: trap, getPrototypeOf: trap, ownKeys: trap, getOwnPropertyDescriptor: trap });
  assert.throws(() => decodeCurrentSchematicChildObservation(wrapped(hostile), REQUEST), /plain own data/u);
  assert.throws(() => decodeCurrentSchematicChildObservation(Object.defineProperty({}, "structuredContent", { get: trap }), REQUEST), /accessor/u);
  assert.throws(() => decodeCurrentSchematicChildObservation(wrapped(envelope), new Proxy(REQUEST, { get: trap, getPrototypeOf: trap })), /plain own data/u);
  assert.equal(traps, 0);
});
