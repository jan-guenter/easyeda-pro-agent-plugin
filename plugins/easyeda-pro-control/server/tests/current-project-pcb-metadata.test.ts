/** Synthetic browser/RPC owners only. No live application or project access. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_PROJECT_PCB_METADATA_MAX_BYTES, CURRENT_PROJECT_PCB_METADATA_TIMEOUT_MS, currentProjectPcbMetadataRequestSchema,
  decodeCurrentProjectPcbMetadataReply, parseCurrentProjectPcbMetadataRequest, queryCurrentProjectPcbMetadata,
  validateCurrentProjectPcbMetadataArguments, validateCurrentProjectPcbMetadataResult } from "../src/current-project-pcb-metadata.ts";
import { buildCurrentProjectPcbMetadataProgram } from "../src/current-project-pcb-metadata-program.ts";
import { EXACT_READ_ENVELOPE_SCHEMA, encodeExactReadEnvelope } from "../src/exact-readers.ts";

const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), pcbUuid: "c".repeat(16) };
const request = { method: "eda.dmt_Pcb.getPcbInfo", target };
function reply(value: unknown): unknown { return { content: [], structuredContent: { ok: true, result: value } }; }
interface Options { readonly before?: string; readonly afterRpc?: string; readonly pendingAt?: number }
function fixture(options: Options = {}): { run: () => Promise<unknown>; evaluate: (source: string) => unknown; expire: () => void; clears: () => number } {
  let clears = 0, timeout: (() => void) | undefined;
  const context = createContext({ TextEncoder,
    setTimeout(callback: () => void, delay: number): number { assert.equal(delay, CURRENT_PROJECT_PCB_METADATA_TIMEOUT_MS); timeout = callback; return 7; },
    clearTimeout(timer: unknown): void { assert.equal(timer, 7); clears += 1; },
  });
  runInContext(`globalThis.window=globalThis;globalThis.top=globalThis;globalThis.calls=[];globalThis.denied=[];globalThis.getterReads=0;
globalThis.target=${JSON.stringify(target)};
globalThis.location={href:'https://client/editor?cll=warn#id='+target.projectUuid,origin:'https://client'};
globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href};globalThis.navigator={serviceWorker:{controller:null}};
globalThis.PRO_EDITOR_MODE='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM';globalThis.PRO_EDITOR_VERSION='3.2.206';
globalThis.start={tabId:'tab_page1',data:{doctype:-1},isAbleDelete:false,group:'start_blank',draggable:true,isDisplayNone:false};
globalThis.blank={tabId:'0',data:{doctype:0},isAbleDelete:false,group:'start_blank',draggable:false,isDisplayNone:true};
globalThis.info={id:'editor-window-main',belong:'editor-window-main',tabs:[start],activeTabId:'tab_page1'};
class Tabs{static containerIds=['editor-window-main'];static containerTree={id:'editor-window-main'};static belongContainer='editor-window-main';static currentTabId='tab_page1';static isOpenProjectDoc=true;static isOpenOtherDoc=true;static getActiveTab(){return this.currentTabId;}static getContainerInfo(id){return id===info.id?info:undefined;}static hasTabUnSaved(){return info.tabs.some(tab=>tab.isUnSaved===true);}static isTabUnSaved(id){return info.tabs.some(tab=>tab.tabId===id&&tab.isUnSaved===true);}}
const forbidden=name=>{denied.push(name);throw new Error('PRIVATE_FORBIDDEN');};
globalThis.fetch=()=>forbidden('network');globalThis.metadata={uuid:target.pcbUuid,project_uuid:target.projectUuid,title:'board Ω',display_title:'Board Ω',docType:3,parent_uuid:'',source:'template',version:'12345',board:'e'.repeat(16),ticket:12345,updateTime:1000};
globalThis.projectDetail={uuid:target.projectUuid,currentBranch:target.branchUuid,isV2Format:false,owner:{uuid:'d'.repeat(32)},archive:false,cbb_project:false};
class Bus{async rpcCall(topic,args,timeout){if(this!==gVars.messageBus||timeout!==0||!Array.isArray(args))return forbidden('receiver');calls.push([topic,[...args]]);
if(topic==='/PrjDB/pcb/getData'){if(args.length!==2||args[0]!==target.pcbUuid||args[1]!==target.projectUuid)return forbidden('pcb-args');}
else if(topic==='/PrjDB/project/getData'){if(args.length!==1||args[0]!==target.projectUuid)return forbidden('project-args');}else return forbidden(topic);
if(calls.length===${options.pendingAt ?? 0})await new Promise(resolve=>{globalThis.release=resolve;});await Promise.resolve();${options.afterRpc ?? ""}
return{message:topic==='/PrjDB/pcb/getData'?metadata:projectDetail};}}
class Permission{constructor(){this._isConcurrentStrictMode=false;this.readOnly=false;}get isConcurrentStrictMode(){return this._isConcurrentStrictMode;}set isConcurrentStrictMode(value){this._isConcurrentStrictMode=value;}getIframeDisableStatusPanelPcb(id){if(this!==UI.concurrentDesign||id!==Tabs.currentTabId)return forbidden('permission-receiver');return{disable:this.readOnly};}}
globalThis.gVars={currentProject:{projectId:target.projectUuid,branchUuid:target.branchUuid,isV2Format:false},isHistoryMode:false,messageBus:new Bus(),sessionStorageTabs:new Set(),urlCmd:null};
globalThis.UI={gVars,tabBar:Tabs,concurrentDesign:new Permission()};globalThis.eda={extensionUuid:'7e06d286b1ac846ef7eab9c7f2a9ee40',dmt_Pcb:{getPcbInfo:()=>forbidden('public-get'),modifyPcbName:()=>forbidden('modify')},dmt_Project:{openProject:()=>forbidden('open')},sys_FileSystem:{save:()=>forbidden('save')}};
globalThis.domRoot={tagName:'DIV',ownerDocument:document,isConnected:true,children:[]};
domRoot.children=['commandWin','exitSmartSizeTool','exitPadShapeTool','project-blank-page','assembly-variant-page'].map(id=>({id,tagName:'DIV',ownerDocument:document,isConnected:true,parentElement:domRoot,getAttribute(){return null;}}));
globalThis.extraMarkers=[];globalThis.extraIframes=[];globalThis.blankPools=[];
document.querySelectorAll=function(selector){if(selector==='[id="tabbar_bodies"]')return[domRoot];if(selector==='iframe')return extraIframes;if(selector==='.blankIframeDiv')return blankPools;if(selector.startsWith('.editframe,'))return extraMarkers;return forbidden('selector');};
${options.before ?? ""}`, context, { timeout: 1000 });
  return {
    run: (): Promise<unknown> => Promise.resolve(runInContext(`(async()=>{${buildCurrentProjectPcbMetadataProgram(request)}})()`, context, { timeout: 1000 }) as unknown),
    evaluate: (source): unknown => runInContext(source, context, { timeout: 1000 }) as unknown,
    expire(): void { assert.ok(timeout !== undefined); timeout(); }, clears: (): number => clears,
  };
}
async function flush(): Promise<void> { for (let index = 0; index < 30; index += 1) { await Promise.resolve(); } }

void test("project-only PCB reader brackets two exact native metadata reads without editor navigation", async () => {
  for (const before of ["", "info.tabs.push(blank);info.activeTabId='0';Tabs.currentTabId='0';", "location.href='https://client/editor?cll=warn#';document.URL=location.href;"]) {
    const env = fixture({ before }), envelope = structuredClone(await env.run());
    const result = decodeCurrentProjectPcbMetadataReply(reply(envelope), request);
    assert.deepEqual(result.target, target);
    assert.deepEqual(result.value, { uuid: target.pcbUuid, projectUuid: target.projectUuid, ownerUuid: "d".repeat(32), title: "board Ω", displayTitle: "Board Ω",
      parentUuid: "", source: "template", version: "12345", boardUuid: "e".repeat(16), ticket: 12_345, updateTime: 1000, docType: 3 });
    assert.equal(result.currentTabId, before.includes("info.tabs.push") ? "0" : "tab_page1");
    assert.deepEqual(structuredClone(env.evaluate("denied")), []); assert.equal(env.clears(), 1);
    const topics = ["/PrjDB/project/getData", "/PrjDB/pcb/getData", "/PrjDB/project/getData"];
    assert.equal(env.evaluate("JSON.stringify(calls.map(call=>call[0]))"), JSON.stringify([...topics, ...topics]));
    assert.ok(Object.isFrozen(result)); assert.ok(Object.isFrozen(result.value)); assert.ok(Object.isFrozen(result.target));
    for (const key of ["workerIdentityVerified", "cadAuthority", "persistenceVerified", "sourceMembershipVerified", "permissionVerified", "mutationDispatched", "explicitSaveDispatched"] as const) {
      assert.equal(result[key], false);
    }
  }
});

void test("project-only PCB reader preserves native title/fallback metadata and ignores unselected private fields", async () => {
  const env = fixture({ before: "metadata.source='';metadata.version='';metadata.board='';metadata.parent_uuid='f'.repeat(32);Object.defineProperty(metadata,'canvas',{get(){getterReads++;throw new Error('PRIVATE');}});Object.defineProperty(metadata,'creator',{get(){getterReads++;throw new Error('PRIVATE');}});Object.defineProperty(projectDetail,'credentials',{get(){getterReads++;throw new Error('PRIVATE');}});" });
  const envelope = structuredClone(await env.run()), result = decodeCurrentProjectPcbMetadataReply(reply(envelope), request);
  assert.equal(result.value.source, ""); assert.equal(result.value.version, ""); assert.equal(result.value.boardUuid, "");
  assert.equal(result.value.parentUuid, "f".repeat(32)); assert.equal(env.evaluate("getterReads"), 0);
  assert.equal(result.value.title, "board Ω"); assert.equal(result.value.displayTitle, "Board Ω");
  assert.equal(JSON.stringify(result).includes("credentials"), false); assert.equal(JSON.stringify(result).includes("creator"), false);
});

void test("project-only PCB reader accepts only the existing optional inactive project flag forms", async () => {
  for (const key of ["archive", "store", "cbb_project"]) {
    for (const change of [`delete projectDetail.${key};`, ...["undefined", "false", "null", "0"].map(value => `projectDetail.${key}=${value};`)]) {
      const env = fixture({ before: change }), envelope = structuredClone(await env.run());
      const result = decodeCurrentProjectPcbMetadataReply(reply(envelope), request);
      assert.equal(result.samples, 2); assert.equal(result.value.title, "board Ω");
      assert.equal(result.cadAuthority, false); assert.equal(result.persistenceVerified, false);
      assert.equal(env.evaluate("calls.length"), 6); assert.equal(env.evaluate("getterReads"), 0);
    }
  }
});

void test("project-only PCB reader rejects inherited/accessor/unsupported project flags and later flag drift", async () => {
  for (const key of ["archive", "store", "cbb_project"]) {
    for (const before of [
      ...["true", "1", "-1", "'false'", "''", "[]", "{}", "NaN", "0n"].map(value => `projectDetail.${key}=${value};`),
      `Object.defineProperty(projectDetail,'${key}',{get(){getterReads++;return false;}});`,
      `delete projectDetail.${key};Object.defineProperty(Object.prototype,'${key}',{value:false,configurable:true});`,
      `delete projectDetail.${key};Object.defineProperty(Object.prototype,'${key}',{get(){getterReads++;return false;},configurable:true});`,
    ]) {
      const env = fixture({ before });
      await assert.rejects(env.run(), /CURRENT_PROJECT_PCB_METADATA_READ_FAILED/u);
      assert.equal(env.evaluate("calls.length"), 1); assert.equal(env.evaluate("getterReads"), 0);
      assert.deepEqual(structuredClone(env.evaluate("denied")), []);
    }
    for (const count of [3, 4, 6]) {
      const env = fixture({ afterRpc: `if(calls.length===${count})projectDetail.${key}=true;` });
      await assert.rejects(env.run(), /CURRENT_PROJECT_PCB_METADATA_READ_FAILED/u);
      assert.equal(env.evaluate("calls.length"), count);
    }
  }
});

void test("project-only PCB reader refuses editor/hidden/dirty/read-only/restoration state before native reads", async () => {
  for (const before of ["info.tabs.push({tabId:target.pcbUuid+'@'+target.projectUuid,data:{doctype:3}});", "extraMarkers.push({});", "extraIframes.push({});",
    "blankPools.push({});", "domRoot.children.push({});", "domRoot.children[0].id='other';", "domRoot.children[0].getAttribute=()=>target.pcbUuid;",
    "start.isUnSaved=true;", "start.data.isReadOnlyMode=true;", "UI.concurrentDesign.readOnly=true;", "UI.concurrentDesign._isConcurrentStrictMode=true;",
    "gVars.sessionStorageTabs.add('private');", "gVars.urlCmd='private';", "gVars.isHistoryMode=true;", "navigator.serviceWorker.controller={};",
    "gVars.currentProject.projectId='e'.repeat(64);", "gVars.currentProject.branchUuid='e'.repeat(32);", "gVars.currentProject.isV2Format=true;",
    "location.href+=',tab='+target.pcbUuid+'@'+target.projectUuid;document.URL=location.href;", "info.tabs.push({...start});",
    "Tabs.containerTree.children=[Tabs.containerTree];", "info.tabs.push(blank);blank.isDisplayNone=false;", "PRO_EDITOR_VERSION='3.2.182';"]) {
    const env = fixture({ before }); await assert.rejects(env.run(), /CURRENT_PROJECT_PCB_METADATA_READ_FAILED/u); assert.equal(env.evaluate("calls.length"), 0);
  }
});

void test("project-only PCB reader rechecks retained RPC, registry, DOM and project owners after every await", async () => {
  for (const change of ["gVars.messageBus=new Bus();", "Bus.prototype.rpcCall=async()=>({message:projectDetail});", "gVars.currentProject={...gVars.currentProject};",
    "info.tabs=[...info.tabs];", "domRoot.children=[...domRoot.children];", "domRoot.children[0]={...domRoot.children[0]};", "document.querySelectorAll=()=>[];",
    "UI.concurrentDesign=new Permission();", "Permission.prototype.getIframeDisableStatusPanelPcb=()=>({disable:false});", "UI.concurrentDesign.readOnly=true;",
    "gVars.sessionStorageTabs=new Set();", "navigator.serviceWorker.controller={};", "Tabs.hasTabUnSaved=()=>false;", "extraIframes.push({});", "gVars.urlCmd='private';",
    "eda={...eda};", "clearTimeout=()=>{};", "gVars.currentProject.branchUuid='e'.repeat(32);"]) {
    const env = fixture({ afterRpc: `if(calls.length===1){${change}}` });
    await assert.rejects(env.run(), /CURRENT_PROJECT_PCB_METADATA_READ_FAILED/u); assert.equal(env.evaluate("calls.length"), 1);
    assert.deepEqual(structuredClone(env.evaluate("denied")), []);
  }
  for (const count of [2, 3, 4, 5, 6]) {
    const env = fixture({ afterRpc: `if(calls.length===${count})gVars.currentProject.branchUuid='e'.repeat(32);` });
    await assert.rejects(env.run(), /CURRENT_PROJECT_PCB_METADATA_READ_FAILED/u); assert.equal(env.evaluate("calls.length"), count);
  }
});

void test("project-only PCB reader rejects wrong owner/branch/PCB, malformed scalars and selected accessors", async () => {
  for (const before of ["projectDetail.owner.uuid='invalid';", "projectDetail.currentBranch='e'.repeat(32);", "projectDetail.uuid='e'.repeat(64);",
    "projectDetail.archive=true;", "projectDetail.store='false';", "projectDetail.cbb_project=true;", "projectDetail.isV2Format=true;",
    "metadata.project_uuid='e'.repeat(64);", "metadata.docType=4;", "metadata.uuid='e'.repeat(16);", "metadata.title=null;", "metadata.parent_uuid='invalid';",
    "metadata.source=undefined;", "metadata.version=12345;", "metadata.board=null;", "metadata.ticket=NaN;", "metadata.ticket=-0;",
    "metadata.updateTime=Infinity;", "metadata.updateTime=-0;", "metadata.updateTime=8640000000000001;", "metadata.source='x'.repeat(4097);",
    "metadata.display_title='x'.repeat(513);", "Object.defineProperty(metadata,'title',{get(){getterReads++;throw new Error('PRIVATE');}});"]) {
    const env = fixture({ before }); await assert.rejects(env.run(), /CURRENT_PROJECT_PCB_METADATA_READ_FAILED/u);
    assert.equal(env.evaluate("getterReads"), 0); assert.deepEqual(structuredClone(env.evaluate("denied")), []);
  }
  for (const afterRpc of ["if(calls.length===3)projectDetail.owner.uuid='e'.repeat(32);", "if(calls.length===4)projectDetail.owner.uuid='e'.repeat(32);",
    "if(calls.length===5)metadata.display_title+='changed';", "if(calls.length===5)metadata.ticket++;", "if(calls.length===5)metadata.title='other';",
    "if(calls.length===5)metadata.parent_uuid='e'.repeat(16);", "if(calls.length===5)metadata.updateTime++;"]) {
    await assert.rejects(fixture({ afterRpc }).run(), /CURRENT_PROJECT_PCB_METADATA_READ_FAILED/u);
  }
});

void test("project-only PCB reader deadline prevents later reads without retrying an outstanding RPC", async () => {
  const env = fixture({ pendingAt: 2 }), running = env.run();
  await flush(); assert.equal(env.evaluate("calls.length"), 2); env.expire();
  await assert.rejects(running, { message: "CURRENT_PROJECT_PCB_METADATA_READ_FAILED" });
  env.evaluate("release();"); await flush(); assert.equal(env.evaluate("calls.length"), 2); assert.equal(env.clears(), 1);
  const opaque = fixture({ afterRpc: "throw Object.defineProperty({},'message',{get(){getterReads++;return 'PRIVATE';}});" });
  await assert.rejects(opaque.run(), { message: "CURRENT_PROJECT_PCB_METADATA_READ_FAILED" }); assert.equal(opaque.evaluate("getterReads"), 0);
  await assert.rejects(fixture({ afterRpc: "return{message:undefined};" }).run(), /CURRENT_PROJECT_PCB_METADATA_READ_FAILED/u);
});

void test("project-only PCB request/discovery validation is strict and grants no execution", () => {
  assert.equal(currentProjectPcbMetadataRequestSchema.safeParse(request).success, true); assert.deepEqual(parseCurrentProjectPcbMetadataRequest(request), request);
  assert.equal(validateCurrentProjectPcbMetadataArguments(request)["valid"], true);
  const discovery = queryCurrentProjectPcbMetadata({ includeSchemas: true });
  assert.equal(discovery["total"], 1); assert.equal(discovery["invocationEnabledByDiscovery"], false);
  assert.match(JSON.stringify(discovery), /inputSchema/u); assert.match(JSON.stringify(discovery), /resultSchema/u);
  assert.match(JSON.stringify(discovery), /fallback/u); assert.match(JSON.stringify(discovery), /not IDMT_PcbItem/u);
  assert.throws(() => queryCurrentProjectPcbMetadata({ runtime: true }));
  for (const invalid of [{ ...request, code: "private()" }, { ...request, arguments: {} }, { ...request, method: "eda.dmt_Pcb.modifyPcbName" },
    { ...request, target: { ...target, projectUuid: "a".repeat(32) } }, { ...request, target: { ...target, tabId: "0" } },
    { ...request, target: { ...target, branchUuid: "b".repeat(16) } }, { ...request, target: { ...target, pcbUuid: "c".repeat(64) } },
    Object.defineProperty({ ...request }, "target", { get(): never { throw new Error("getter invoked"); } }),
    { ...request, target: Object.defineProperty({ ...target }, "pcbUuid", { get(): never { throw new Error("getter invoked"); } }) }]) {
    assert.throws(() => buildCurrentProjectPcbMetadataProgram(invalid)); assert.equal(validateCurrentProjectPcbMetadataArguments(invalid)["valid"], false);
  }
});

void test("project-only PCB result/envelope validation refuses authority promotion and target/output drift", async () => {
  const envelope = structuredClone(await fixture().run()), value = decodeCurrentProjectPcbMetadataReply(reply(envelope), request);
  const result = validateCurrentProjectPcbMetadataResult(request, value);
  assert.equal(result["effect"], "current-project-only-pcb-metadata-read"); assert.equal(result["liveValidation"], "not-recorded");
  for (const key of ["workerIdentityVerified", "cadAuthority", "persistenceVerified", "sourceMembershipVerified", "permissionVerified", "mutationDispatched", "explicitSaveDispatched"] as const) {
    assert.throws(() => decodeCurrentProjectPcbMetadataReply(reply(encodeExactReadEnvelope({ ...value, [key]: true })), request));
  }
  for (const invalid of [{ ...value, extra: true }, { ...value, target: { ...target, branchUuid: "e".repeat(32) } },
    { ...value, value: { ...value.value, uuid: "e".repeat(16) } }, { ...value, value: { ...value.value, projectUuid: "e".repeat(64) } },
    { ...value, value: { ...value.value, source: "x".repeat(4097) } }, { ...value, value: { ...value.value, canvas: "private" } }, { ...value, samples: 1 }]) {
    assert.throws(() => decodeCurrentProjectPcbMetadataReply(reply(encodeExactReadEnvelope(invalid)), request));
  }
  for (const invalid of [{ schema: EXACT_READ_ENVELOPE_SCHEMA, utf8Bytes: 1, json: "{" },
    { schema: EXACT_READ_ENVELOPE_SCHEMA, utf8Bytes: 1, json: "x".repeat(CURRENT_PROJECT_PCB_METADATA_MAX_BYTES + 1) },
    Object.defineProperty({ schema: EXACT_READ_ENVELOPE_SCHEMA, utf8Bytes: 0, json: "" }, "json", { get(): never { throw new Error("getter invoked"); } })]) {
    assert.throws(() => decodeCurrentProjectPcbMetadataReply(reply(invalid), request));
  }
  assert.throws(() => decodeCurrentProjectPcbMetadataReply({ isError: true, content: [], structuredContent: { ok: false, error: "PRIVATE" } }, request));
});
