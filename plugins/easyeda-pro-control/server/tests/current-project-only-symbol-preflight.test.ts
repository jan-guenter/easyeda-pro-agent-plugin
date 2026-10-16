import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_PROJECT_ONLY_SYMBOL_PREFLIGHT_MAX_BYTES, CURRENT_PROJECT_ONLY_SYMBOL_PREFLIGHT_TIMEOUT_MS,
  buildCurrentProjectOnlySymbolPreflightProgram, currentProjectOnlySymbolPreflightRequestSchema,
  decodeCurrentProjectOnlySymbolPreflightReply, queryCurrentProjectOnlySymbolPreflight,
  validateCurrentProjectOnlySymbolPreflightArguments } from "../src/current-project-only-symbol-preflight.ts";
import { EXACT_READ_ENVELOPE_SCHEMA, encodeExactReadEnvelope } from "../src/exact-readers.ts";

const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), symbolUuid: "c".repeat(16), ownerUuid: "d".repeat(32) };
const expectedBefore = { name: "Ordinary symbol", description: "Original\nmetadata", tagsJson: '["Exact", "Case"]', source: "template", version: "12345", ticket: 12_345 };
const request = { target, expectedBefore };
const actor = { uuid: "1".repeat(32), username: "fixture-user", nickname: "Fixture" };
function reply(value: unknown): unknown { return { content: [], structuredContent: { ok: true, result: value } }; }
interface Options { readonly before?: string; readonly afterRpc?: string; readonly afterClock?: string; readonly pendingAt?: number }
function fixture(options: Options = {}): { run: () => Promise<unknown>; evaluate: (source: string) => unknown; expire: () => void; clears: () => number } {
  let clears = 0, timeout: (() => void) | undefined;
  const context = createContext({ TextEncoder,
    setTimeout(callback: () => void, delay: number): number { assert.equal(delay, CURRENT_PROJECT_ONLY_SYMBOL_PREFLIGHT_TIMEOUT_MS); timeout = callback; return 7; },
    clearTimeout(timer: unknown): void { assert.equal(timer, 7); clears += 1; },
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
const forbidden=name=>{denied.push(name);throw new Error('PRIVATE_FORBIDDEN');};
globalThis.fetch=()=>forbidden('network');globalThis.metadata={uuid:target.symbolUuid,project_uuid:target.projectUuid,path:target.projectUuid,docType:2,owner:{uuid:target.ownerUuid},display_title:beforeValue.name,description:beforeValue.description,custom_tags:beforeValue.tagsJson,source:beforeValue.source,version:beforeValue.version,ticket:beforeValue.ticket};
globalThis.projectDetail={uuid:target.projectUuid,currentBranch:target.branchUuid,isV2Format:false,owner:{uuid:target.ownerUuid},archive:false,store:false,cbb_project:false};
globalThis.workerClient='f'.repeat(16);globalThis.workerMaxTicket=12345;
class Bus{async rpcCall(topic,args,timeout){if(this!==gVars.messageBus||timeout!==0||!Array.isArray(args))return forbidden('receiver');calls.push([topic,[...args]]);
if(topic==='/PrjDB/symbol/getData'){if(args.length!==2||args[0]!==target.symbolUuid||args[1]!==target.projectUuid)return forbidden('symbol-args');}
else if(['/PrjDB/project/getData','/PrjDB/project/getClient','/PrjDB/project/getMaxTicket'].includes(topic)){if(args.length!==1||args[0]!==target.projectUuid)return forbidden('project-args');}else return forbidden(topic);
if(calls.length===${options.pendingAt ?? 0})await new Promise(resolve=>{globalThis.release=resolve;});await Promise.resolve();${options.afterRpc ?? ""}
return{message:topic==='/PrjDB/symbol/getData'?metadata:topic==='/PrjDB/project/getClient'?workerClient:topic==='/PrjDB/project/getMaxTicket'?workerMaxTicket:projectDetail};}}
class Permission{constructor(){this._isConcurrentStrictMode=false;this.readOnly=false;}get isConcurrentStrictMode(){return this._isConcurrentStrictMode;}set isConcurrentStrictMode(value){this._isConcurrentStrictMode=value;}getIframeDisableStatusPanelPcb(id){if(this!==UI.concurrentDesign||id!==Tabs.currentTabId)return forbidden('permission-receiver');return{disable:this.readOnly};}}
globalThis.gVars={currentProject:{projectId:target.projectUuid,branchUuid:target.branchUuid,isV2Format:false},isHistoryMode:false,messageBus:new Bus(),sessionStorageTabs:new Set(),urlCmd:null,globalVariableCookieData:{userInfo:${JSON.stringify(actor)}},loginedUserInfo:${JSON.stringify(actor)}};
globalThis.UI={gVars,tabBar:Tabs,concurrentDesign:new Permission()};globalThis.eda={extensionUuid:'7e06d286b1ac846ef7eab9c7f2a9ee40',lib_Symbol:{get:()=>forbidden('public-symbol'),modify:()=>forbidden('modify')},dmt_Project:{openProject:()=>forbidden('open')},sys_FileSystem:{save:()=>forbidden('save')}};
globalThis.clockTick=1000;globalThis.clockCalls=0;Date.now=function(){return clockTick++;};
class ClockBus{async rpcCall(...args){if(this!==gVars.concurrentBus||args.length!==1||args[0]!=='/pro-mgr/serverTime/now')return forbidden('clock-receiver');clockCalls++;await Promise.resolve();${options.afterClock ?? ""}return clockTick++;}}
gVars.concurrentBus=new ClockBus();globalThis['/'+_TAB_ID_+'/notify']=gVars.concurrentBus;
globalThis.domRoot={tagName:'DIV',ownerDocument:document,isConnected:true,children:[]};
domRoot.children=['commandWin','exitSmartSizeTool','exitPadShapeTool','project-blank-page','assembly-variant-page'].map(id=>({id,tagName:'DIV',ownerDocument:document,isConnected:true,parentElement:domRoot,getAttribute(){return null;}}));
globalThis.extraMarkers=[];globalThis.extraIframes=[];globalThis.blankPools=[];
document.querySelectorAll=function(selector){if(selector==='[id="tabbar_bodies"]')return[domRoot];if(selector==='iframe')return extraIframes;if(selector==='.blankIframeDiv')return blankPools;if(selector.startsWith('.editframe,'))return extraMarkers;return forbidden('selector');};
${options.before ?? ""}`, context, { timeout: 1000 });
  return {
    run: (): Promise<unknown> => Promise.resolve(runInContext(`(async()=>{${buildCurrentProjectOnlySymbolPreflightProgram(request)}})()`, context, { timeout: 1000 }) as unknown),
    evaluate: (source): unknown => runInContext(source, context, { timeout: 1000 }) as unknown,
    expire(): void { assert.ok(timeout !== undefined); timeout(); }, clears: (): number => clears,
  };
}
async function flush(): Promise<void> { for (let i = 0; i < 40; i += 1) { await Promise.resolve(); } }

void test("project-only symbol preflight accepts Start or native hidden blank without editor navigation", async () => {
  for (const before of ["", "info.tabs.push(blank);info.activeTabId='0';Tabs.currentTabId='0';", "location.href='https://client/editor?cll=warn#';document.URL=location.href;"]) {
    const env = fixture({ before });
    const envelope = structuredClone(await env.run());
    const result = decodeCurrentProjectOnlySymbolPreflightReply(reply(envelope), request);
    assert.deepEqual(result.target, target); assert.deepEqual(result.expectedBefore, expectedBefore);
    assert.equal(result.currentTabId, before.includes("info.tabs.push") ? "0" : "tab_page1");
    assert.deepEqual(result.clientTicketObservation, { client: "f".repeat(16), maxTicket: 12_345, samples: 4 });
    assert.deepEqual(result.runtimeObservation.actor, actor);
    assert.equal(result.runtimeObservation.clockSamples.length, 4); assert.equal(env.evaluate("clockCalls"), 4);
    assert.deepEqual(structuredClone(env.evaluate("denied")), []); assert.equal(env.evaluate("calls.length"), 14); assert.equal(env.clears(), 1);
    const topics = ["/PrjDB/project/getClient", "/PrjDB/project/getMaxTicket", "/PrjDB/project/getData", "/PrjDB/symbol/getData",
      "/PrjDB/project/getData", "/PrjDB/project/getClient", "/PrjDB/project/getMaxTicket"];
    assert.equal(env.evaluate("JSON.stringify(calls.map(call=>call[0]))"), JSON.stringify([...topics, ...topics]));
    for (const key of ["permissionVerified", "backendActorVerified", "backendClockVerified", "startupQualified", "workerIdentityVerified", "sourceMembershipVerified",
      "persistenceVerified", "writerAuthority", "executionAuthorized", "mutationDispatched", "explicitSaveDispatched"] as const) { assert.equal(result[key], false); }
    assert.equal(Object.isFrozen(result), true);
  }
});

void test("project-only symbol preflight refuses editors, dirty and read-only state, restoration and service workers before native reads", async () => {
  for (const before of ["info.tabs.push({tabId:target.symbolUuid+'@'+target.projectUuid,data:{doctype:2}});", "extraMarkers.push({});", "extraIframes.push({});",
    "blankPools.push({});", "domRoot.children.push({});", "domRoot.children[0].id='other';", "domRoot.children[0].getAttribute=()=>target.symbolUuid;",
    "start.isUnSaved=true;", "start.data.isReadOnlyMode=true;", "UI.concurrentDesign.readOnly=true;", "UI.concurrentDesign._isConcurrentStrictMode=true;",
    "gVars.sessionStorageTabs.add('private');", "gVars.urlCmd='private';", "gVars.isHistoryMode=true;", "navigator.serviceWorker.controller={};",
    "gVars.currentProject.projectId='e'.repeat(64);", "gVars.currentProject.branchUuid='e'.repeat(32);", "gVars.currentProject.isV2Format=true;",
    "location.href+=',tab='+target.symbolUuid+'@'+target.projectUuid;document.URL=location.href;", "info.tabs.push({...start});",
    "Tabs.containerIds.push('hidden');", "Tabs.containerTree.children=[Tabs.containerTree];", "info.tabs.push(blank);blank.isDisplayNone=false;",
    "PRO_EDITOR_MODE='ONLINE';", "PRO_EDITOR_VERSION='3.2.182';"]) {
    const env = fixture({ before }); await assert.rejects(env.run(), /CURRENT_PROJECT_ONLY_SYMBOL_PREFLIGHT_REFUSED:HOST/u);
    assert.equal(env.evaluate("calls.length"), 0); assert.equal(env.evaluate("clockCalls"), 0);
  }
});

void test("project-only symbol preflight retains every registry, DOM, permission, bus and actor owner across native awaits", async () => {
  for (const change of ["gVars.messageBus=new Bus();", "gVars.currentProject={...gVars.currentProject};", "info.tabs=[...info.tabs];",
    "domRoot.children=[...domRoot.children];", "domRoot.children[0]={...domRoot.children[0]};", "document.querySelectorAll=()=>[];",
    "UI.concurrentDesign=new Permission();", "Permission.prototype.getIframeDisableStatusPanelPcb=()=>({disable:false});", "UI.concurrentDesign.readOnly=true;",
    "Object.defineProperty(Permission.prototype,'isConcurrentStrictMode',{get(){return false;},set(value){}});",
    "gVars.sessionStorageTabs=new Set();", "gVars.globalVariableCookieData.userInfo={...gVars.globalVariableCookieData.userInfo};",
    "gVars.loginedUserInfo={...gVars.loginedUserInfo};", "gVars.loginedUserInfo.username='changed';", "navigator.serviceWorker.controller={};",
    "Tabs.hasTabUnSaved=()=>false;", "extraIframes.push({});", "gVars.urlCmd='private';"]) {
    const env = fixture({ afterRpc: `if(calls.length===1){${change}}` });
    await assert.rejects(env.run(), /CURRENT_PROJECT_ONLY_SYMBOL_PREFLIGHT_REFUSED:/u);
    assert.equal(env.evaluate("calls.length"), 1); assert.deepEqual(structuredClone(env.evaluate("denied")), []);
  }
});

void test("project-only symbol preflight binds exact expected metadata and independent project identity without leaking unused fields", async () => {
  const safe = fixture({ before: "Object.defineProperty(metadata,'canvas',{get(){getterReads++;throw new Error('PRIVATE');}});Object.defineProperty(projectDetail,'credentials',{get(){getterReads++;throw new Error('PRIVATE');}});" });
  await safe.run(); assert.equal(safe.evaluate("getterReads"), 0);
  for (const before of ["metadata.owner.uuid='e'.repeat(32);", "projectDetail.owner.uuid='e'.repeat(32);", "projectDetail.currentBranch='e'.repeat(32);",
    "projectDetail.archive=true;", "projectDetail.store='false';", "projectDetail.cbb_project=true;", "projectDetail.isV2Format=true;",
    "metadata.path='e'.repeat(64);", "metadata.project_uuid='e'.repeat(64);", "metadata.docType=4;", "metadata.uuid='e'.repeat(16);",
    "metadata.display_title+='changed';", "metadata.description+='changed';", "metadata.source='other';", "metadata.version='other';",
    "metadata.custom_tags='[\"Exact\",\"Case\"]';", "metadata.ticket=NaN;", "metadata.ticket=-0;", "workerMaxTicket=12344;",
    "Object.defineProperty(metadata,'description',{get(){getterReads++;throw new Error('PRIVATE');}});"]) {
    const env = fixture({ before }); await assert.rejects(env.run(), /CURRENT_PROJECT_ONLY_SYMBOL_PREFLIGHT_REFUSED:/u);
    assert.equal(env.evaluate("getterReads"), 0); assert.deepEqual(structuredClone(env.evaluate("denied")), []);
  }
  for (const afterRpc of ["if(calls.length===5)projectDetail.owner.uuid='e'.repeat(32);", "if(calls.length===7)workerMaxTicket++;",
    "if(calls.length===6)workerClient='e'.repeat(16);", "if(calls.length===11)metadata.description+='changed';"]) {
    await assert.rejects(fixture({ afterRpc }).run(), /CURRENT_PROJECT_ONLY_SYMBOL_PREFLIGHT_REFUSED:/u);
  }
});

void test("project-only symbol preflight rejects actor disagreement and clock substitution, malformed scalars or brackets", async () => {
  for (const before of ["gVars.loginedUserInfo.uuid='e'.repeat(32);", "gVars.loginedUserInfo.nickname='other';", "gVars.loginedUserInfo.username='';",
    "Object.defineProperty(gVars.loginedUserInfo,'nickname',{get(){getterReads++;throw new Error('PRIVATE');}});"]) {
    const env = fixture({ before }); await assert.rejects(env.run(), /CURRENT_PROJECT_ONLY_SYMBOL_PREFLIGHT_REFUSED:/u); assert.equal(env.evaluate("getterReads"), 0);
  }
  for (const afterClock of ["return{message:clockTick};", "return -0;", "return Number.MAX_SAFE_INTEGER+1;", "return clockTick+10;",
    "clockTick+=10001;", "gVars.concurrentBus=new ClockBus();", "globalThis['/'+_TAB_ID_+'/notify']=new ClockBus();",
    "Date.now=()=>clockTick++;", "gVars.loginedUserInfo.nickname='changed';", "if(clockCalls===2)clockTick=1;"]) {
    await assert.rejects(fixture({ afterClock }).run(), /CURRENT_PROJECT_ONLY_SYMBOL_PREFLIGHT_REFUSED:/u);
  }
});

void test("project-only symbol preflight deadline consumes no retry and prevents later reads after delayed native completion", async () => {
  const env = fixture({ pendingAt: 1 }), running = env.run();
  await flush(); assert.equal(env.evaluate("calls.length"), 1); env.expire();
  await assert.rejects(running, { message: "CURRENT_PROJECT_ONLY_SYMBOL_PREFLIGHT_REFUSED:TIMEOUT" });
  env.evaluate("release();"); await flush(); assert.equal(env.evaluate("calls.length"), 1); assert.equal(env.clears(), 1);
  const opaque = fixture({ afterRpc: "throw Object.defineProperty({},'message',{get(){getterReads++;return 'PRIVATE';}});" });
  await assert.rejects(opaque.run(), { message: "CURRENT_PROJECT_ONLY_SYMBOL_PREFLIGHT_REFUSED:CLIENT_TICKET" }); assert.equal(opaque.evaluate("getterReads"), 0);
});

void test("project-only preflight input and envelope validation reject authority promotion, extra data and accessors", async () => {
  assert.equal(currentProjectOnlySymbolPreflightRequestSchema.safeParse(request).success, true);
  assert.equal(validateCurrentProjectOnlySymbolPreflightArguments(request)["valid"], true);
  const discovery = queryCurrentProjectOnlySymbolPreflight({ includeSchemas: true });
  assert.equal(discovery["total"], 1); assert.equal(discovery["invocationEnabledByDiscovery"], false);
  assert.match(JSON.stringify(discovery), /inputSchema/u); assert.match(JSON.stringify(discovery), /resultSchema/u);
  assert.throws(() => queryCurrentProjectOnlySymbolPreflight({ runtime: true }));
  for (const invalid of [{ ...request, code: "private()" }, { ...request, target: { ...target, projectUuid: "a".repeat(32) } },
    { ...request, target: { ...target, tabId: "0" } }, { ...request, expectedBefore: { ...expectedBefore, tagsJson: "[1]" } },
    { ...request, expectedBefore: { ...expectedBefore, ticket: -0 } }, { ...request, expectedBefore: { ...expectedBefore, name: "x".repeat(513) } },
    Object.defineProperty({ ...request }, "target", { get(): never { throw new Error("getter invoked"); } }),
    { ...request, expectedBefore: Object.defineProperty({ ...expectedBefore }, "description", { get(): never { throw new Error("getter invoked"); } }) }]) {
    assert.throws(() => buildCurrentProjectOnlySymbolPreflightProgram(invalid));
    assert.equal(validateCurrentProjectOnlySymbolPreflightArguments(invalid)["valid"], false);
  }
  const envelope = structuredClone(await fixture().run()), value = decodeCurrentProjectOnlySymbolPreflightReply(reply(envelope), request);
  for (const key of ["permissionVerified", "backendActorVerified", "backendClockVerified", "startupQualified", "workerIdentityVerified", "sourceMembershipVerified",
    "persistenceVerified", "writerAuthority", "executionAuthorized", "mutationDispatched", "explicitSaveDispatched"] as const) {
    assert.throws(() => decodeCurrentProjectOnlySymbolPreflightReply(reply(encodeExactReadEnvelope({ ...value, [key]: true })), request));
  }
  for (const invalid of [{ ...value, extra: true }, { ...value, expectedBefore: { ...expectedBefore, description: "changed" } },
    { ...value, target: { ...target, branchUuid: "e".repeat(32) } }, { ...value, runtimeObservation: { ...value.runtimeObservation, clockProducerOwnershipVerified: true } },
    { ...value, clientTicketObservation: { ...value.clientTicketObservation, maxTicket: 0 } }]) {
    assert.throws(() => decodeCurrentProjectOnlySymbolPreflightReply(reply(encodeExactReadEnvelope(invalid)), request));
  }
  for (const invalid of [{ schema: EXACT_READ_ENVELOPE_SCHEMA, utf8Bytes: 1, json: "{" },
    { schema: EXACT_READ_ENVELOPE_SCHEMA, utf8Bytes: 1, json: "x".repeat(CURRENT_PROJECT_ONLY_SYMBOL_PREFLIGHT_MAX_BYTES + 1) },
    Object.defineProperty({ schema: EXACT_READ_ENVELOPE_SCHEMA, utf8Bytes: 0, json: "" }, "json", { get(): never { throw new Error("getter invoked"); } })]) {
    assert.throws(() => decodeCurrentProjectOnlySymbolPreflightReply(reply(invalid), request));
  }
  assert.throws(() => decodeCurrentProjectOnlySymbolPreflightReply({ isError: true, content: [], structuredContent: { ok: false, error: "PRIVATE" } }, request));
});
