/** Synthetic browser/RPC owners only. No live application or project access. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_PROJECT_SCHEMATIC_METADATA_MAX_BYTES, CURRENT_PROJECT_SCHEMATIC_METADATA_TIMEOUT_MS,
  decodeCurrentProjectSchematicMetadataReply, parseCurrentProjectSchematicMetadataRequest, queryCurrentProjectSchematicMetadata,
  validateCurrentProjectSchematicMetadataArguments, validateCurrentProjectSchematicMetadataResult } from "../src/current-project-schematic-metadata.ts";
import { buildCurrentProjectSchematicMetadataProgram } from "../src/current-project-schematic-metadata-program.ts";
import { EXACT_READ_ENVELOPE_SCHEMA, encodeExactReadEnvelope } from "../src/exact-readers.ts";
import { apiRequestSchema, queryOfflineApi } from "../src/offline-api.ts";

const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), schematicUuid: "c".repeat(16) };
const request = { method: "eda.dmt_Schematic.getSchematicInfo", target };
const allRequest = { method: "eda.dmt_Schematic.getAllSchematicsInfo", target: { projectUuid: target.projectUuid, branchUuid: target.branchUuid } };
const pageRequest = { method: "eda.dmt_Schematic.getSchematicPageInfo", target: { ...target, schematicPageUuid: "d".repeat(16) } };
const allPagesRequest = { method: "eda.dmt_Schematic.getAllSchematicPagesInfo", target: allRequest.target };
void test("project schematic offline discovery and validation preserve strict targets without execution authority", () => {
  const discovery = queryOfflineApi(apiRequestSchema.parse({ action: "project-schematic", query: { includeSchemas: true } }));
  assert.equal(discovery.offline, true);
  assert.deepEqual(discovery.result, queryCurrentProjectSchematicMetadata({ includeSchemas: true }));
  const selectedDiscovery = queryOfflineApi(apiRequestSchema.parse({ action: "project-schematic", query: { method: request.method } }));
  assert.deepEqual(selectedDiscovery.result, queryCurrentProjectSchematicMetadata({ method: request.method }));
  for (const input of [request, allRequest, pageRequest, allPagesRequest, { ...allRequest, target }]) {
    const validated = queryOfflineApi(apiRequestSchema.parse({ action: "project-schematic-validate", query: { request: input } }));
    assert.deepEqual(validated.result, validateCurrentProjectSchematicMetadataArguments(input));
  }
  assert.equal(apiRequestSchema.safeParse({ action: "project-schematic", query: { method: "eda.dmt_Schematic.deleteSchematic" } }).success, false);
  assert.equal(apiRequestSchema.safeParse({ action: "project-schematic", query: { includeSchemas: true, code: "caller-code" } }).success, false);
});
function reply(value: unknown): unknown { return { content: [], structuredContent: { ok: true, result: value } }; }
interface Options { readonly before?: string; readonly afterRpc?: string; readonly pendingAt?: number }
function fixture(options: Options = {}): { run: (input?: unknown) => Promise<unknown>; evaluate: (source: string) => unknown; expire: () => void; clears: () => number } {
  let clears = 0, timeout: (() => void) | undefined;
  const context = createContext({ TextEncoder,
    setTimeout(callback: () => void, delay: number): number { assert.equal(delay, CURRENT_PROJECT_SCHEMATIC_METADATA_TIMEOUT_MS); timeout = callback; return 7; },
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
globalThis.fetch=()=>forbidden('network');globalThis.metadata={uuid:target.schematicUuid,project_uuid:target.projectUuid,name:'İω LOWER',display_name:'IΩ Display',source:'template',version:'12345',board:'e'.repeat(16),ticket:12345,updateTime:1000};
globalThis.schematicMap={['f'.repeat(16)]:{...metadata,uuid:'f'.repeat(16),name:'peer',display_name:'Peer'},[target.schematicUuid]:metadata};
globalThis.page={uuid:'d'.repeat(16),project_uuid:target.projectUuid,schematic_uuid:target.schematicUuid,title:'lower Ω',display_title:'Display Ω',docType:1,zIndex:-2.5,source:'',version:'5',ticket:12346,updateTime:1001};
globalThis.sheetMap={['e'.repeat(16)]:{...page,uuid:'e'.repeat(16),schematic_uuid:'f'.repeat(16)},[page.uuid]:page};
globalThis.projectDetail={uuid:target.projectUuid,currentBranch:target.branchUuid,isV2Format:false,owner:{uuid:'d'.repeat(32)},archive:false,cbb_project:false};
class Bus{async rpcCall(topic,args,timeout){if(this!==gVars.messageBus||timeout!==0||!Array.isArray(args))return forbidden('receiver');calls.push([topic,[...args]]);
if(topic==='/PrjDB/schematic/getData'){if(args.length!==2||args[0]!==target.schematicUuid||args[1]!==target.projectUuid)return forbidden('get-args');}
else if(topic==='/PrjDB/sheet/getData'){if(args.length!==2||args[0]!==page.uuid||args[1]!==target.projectUuid)return forbidden('page-get-args');}
else if(topic==='/PrjDB/project/getData'||topic==='/PrjDB/schematic/getAllKVDatas'){if(args.length!==1||args[0]!==target.projectUuid)return forbidden('project-args');}
else if(topic==='/PrjDB/sheet/getAllKVDatas'){if(args.length!==2||args[0]!==undefined||args[1]!==target.projectUuid)return forbidden('sheet-args');}
else return forbidden(topic);
if(calls.length===${options.pendingAt ?? 0})await new Promise(resolve=>{globalThis.release=resolve;});await Promise.resolve();${options.afterRpc ?? ""}
return{message:topic==='/PrjDB/schematic/getData'?metadata:topic==='/PrjDB/sheet/getData'?page:topic==='/PrjDB/schematic/getAllKVDatas'?schematicMap:topic==='/PrjDB/sheet/getAllKVDatas'?sheetMap:projectDetail};}}
class Permission{constructor(){this._isConcurrentStrictMode=false;this.readOnly=false;}get isConcurrentStrictMode(){return this._isConcurrentStrictMode;}set isConcurrentStrictMode(value){this._isConcurrentStrictMode=value;}getIframeDisableStatusPanelPcb(id){if(this!==UI.concurrentDesign||id!==Tabs.currentTabId)return forbidden('permission-receiver');return{disable:this.readOnly};}}
globalThis.gVars={currentProject:{projectId:target.projectUuid,branchUuid:target.branchUuid,isV2Format:false},isHistoryMode:false,messageBus:new Bus(),sessionStorageTabs:new Set(),urlCmd:null};
globalThis.UI={gVars,tabBar:Tabs,concurrentDesign:new Permission()};globalThis.eda={extensionUuid:'7e06d286b1ac846ef7eab9c7f2a9ee40',dmt_Schematic:{getSchematicInfo:()=>forbidden('public-get'),modifySchematicName:()=>forbidden('modify')},dmt_Project:{openProject:()=>forbidden('open')},sys_FileSystem:{save:()=>forbidden('save')}};
globalThis.domRoot={tagName:'DIV',ownerDocument:document,isConnected:true,children:[]};
domRoot.children=['commandWin','exitSmartSizeTool','exitPadShapeTool','project-blank-page','assembly-variant-page'].map(id=>({id,tagName:'DIV',ownerDocument:document,isConnected:true,parentElement:domRoot,getAttribute(){return null;}}));
globalThis.extraMarkers=[];globalThis.extraIframes=[];globalThis.blankPools=[];
document.querySelectorAll=function(selector){if(selector==='[id="tabbar_bodies"]')return[domRoot];if(selector==='iframe')return extraIframes;if(selector==='.blankIframeDiv')return blankPools;if(selector.startsWith('.editframe,'))return extraMarkers;return forbidden('selector');};
${options.before ?? ""}`, context, { timeout: 1000 });
  return {
    run: (input = request): Promise<unknown> => Promise.resolve(runInContext(`(async()=>{${buildCurrentProjectSchematicMetadataProgram(input)}})()`, context, { timeout: 1000 }) as unknown),
    evaluate: (source): unknown => runInContext(source, context, { timeout: 1000 }) as unknown,
    expire(): void { assert.ok(timeout !== undefined); timeout(); }, clears: (): number => clears,
  };
}
async function flush(): Promise<void> { for (let index = 0; index < 40; index += 1) { await Promise.resolve(); } }

void test("project schematic reader retains exact Unicode metadata and complete selected child roster", async () => {
  for (const before of ["", "info.tabs.push(blank);info.activeTabId='0';Tabs.currentTabId='0';"]) {
    const env = fixture({ before }), envelope = structuredClone(await env.run());
    const result = decodeCurrentProjectSchematicMetadataReply(reply(envelope), request);
    assert.equal(result.method, "eda.dmt_Schematic.getSchematicInfo");
    assert.deepEqual(result.target, target); assert.equal(result.schematics.length, 1);
    assert.equal(result.observedSchematicCount, 2); assert.equal(result.observedSheetCount, 2);
    const selected = result.schematics[0]; assert.ok(selected);
    assert.deepEqual(selected, { uuid: target.schematicUuid, source: "template", version: "12345", ticket: 12_345, updateTime: 1000,
      name: "İω LOWER", displayName: "IΩ Display", boardUuid: "e".repeat(16), children: [{ uuid: "d".repeat(16), source: "", version: "5", ticket: 12_346,
        updateTime: 1001, schematicUuid: target.schematicUuid, title: "lower Ω", displayTitle: "Display Ω", docType: 1, zIndex: -2.5 }] });
    assert.ok(Object.isFrozen(result)); assert.ok(Object.isFrozen(selected.children[0])); assert.equal(env.clears(), 1);
    assert.deepEqual(structuredClone(env.evaluate("denied")), []);
    const topics = ["/PrjDB/project/getData", "/PrjDB/schematic/getAllKVDatas", "/PrjDB/sheet/getAllKVDatas", "/PrjDB/schematic/getData", "/PrjDB/project/getData"];
    assert.equal(env.evaluate("JSON.stringify(calls.map(call=>call[0]))"), JSON.stringify([...topics, ...topics]));
  }
});

void test("project schematic inventory reads both complete maps, preserves UUID order and allows an actually empty project", async () => {
  const env = fixture(), envelope = structuredClone(await env.run(allRequest));
  const value = decodeCurrentProjectSchematicMetadataReply(reply(envelope), allRequest);
  assert.equal(value.method, "eda.dmt_Schematic.getAllSchematicsInfo");
  assert.deepEqual(value.schematics.map(item => item.uuid), [target.schematicUuid, "f".repeat(16)]);
  assert.equal(value.schematics[1]?.children[0]?.schematicUuid, "f".repeat(16)); assert.equal(env.evaluate("calls.length"), 8);
  assert.equal(env.evaluate("calls.some(call=>call[0]==='/PrjDB/schematic/getData')"), false);
  const empty = fixture({ before: "schematicMap={};sheetMap={};" });
  const emptyEnvelope = structuredClone(await empty.run(allRequest));
  const noItems = decodeCurrentProjectSchematicMetadataReply(reply(emptyEnvelope), allRequest);
  assert.equal(noItems.method, "eda.dmt_Schematic.getAllSchematicsInfo");
  assert.deepEqual(noItems.schematics, []); assert.equal(noItems.observedSchematicCount, 0); assert.equal(noItems.observedSheetCount, 0);
  await assert.rejects(fixture({ before: "schematicMap={};sheetMap={};" }).run(), /READ_FAILED/u);
});

void test("project page metadata selects an exact parent-bound page and observes the complete globally sorted collection", async () => {
  for (const input of [pageRequest, allPagesRequest]) {
    const env = fixture(), envelope = structuredClone(await env.run(input));
    const result = decodeCurrentProjectSchematicMetadataReply(reply(envelope), input);
    assert.ok(result.method === "eda.dmt_Schematic.getSchematicPageInfo" || result.method === "eda.dmt_Schematic.getAllSchematicPagesInfo");
    assert.deepEqual(result.pages.map(value => value.uuid), input === pageRequest ? ["d".repeat(16)] : ["d".repeat(16), "e".repeat(16)]);
    assert.deepEqual(result.pages[0], { uuid: "d".repeat(16), source: "", version: "5", ticket: 12_346, updateTime: 1001,
      schematicUuid: target.schematicUuid, title: "lower Ω", displayTitle: "Display Ω", docType: 1, zIndex: -2.5 });
    assert.equal(result.observedSchematicCount, 2); assert.equal(result.observedSheetCount, 2);
    assert.ok(Object.isFrozen(result.pages)); assert.ok(Object.isFrozen(result.pages[0]));
    assert.equal(Object.hasOwn(result, "schematics"), false); assert.equal(result.parentMembershipObserved, true);
    assert.deepEqual(structuredClone(env.evaluate("denied")), []);
    const topics = ["/PrjDB/project/getData", "/PrjDB/schematic/getAllKVDatas", "/PrjDB/sheet/getAllKVDatas",
      ...(input === pageRequest ? ["/PrjDB/sheet/getData"] : []), "/PrjDB/project/getData"];
    assert.equal(env.evaluate("JSON.stringify(calls.map(call=>call[0]))"), JSON.stringify([...topics, ...topics]));
  }
  const reordered = fixture({ before: "page.schematic_uuid='f'.repeat(16);sheetMap['e'.repeat(16)].schematic_uuid=target.schematicUuid;" });
  const reorderedEnvelope = structuredClone(await reordered.run(allPagesRequest));
  const result = decodeCurrentProjectSchematicMetadataReply(reply(reorderedEnvelope), allPagesRequest);
  assert.equal(result.method, "eda.dmt_Schematic.getAllSchematicPagesInfo");
  assert.deepEqual(result.pages.map(value => value.uuid), ["d".repeat(16), "e".repeat(16)]);
  for (const before of ["sheetMap={};", "sheetMap={};schematicMap={};"]) {
    const empty = fixture({ before });
    const emptyEnvelope = structuredClone(await empty.run(allPagesRequest));
    const value = decodeCurrentProjectSchematicMetadataReply(reply(emptyEnvelope), allPagesRequest);
    assert.equal(value.method, "eda.dmt_Schematic.getAllSchematicPagesInfo"); assert.deepEqual(value.pages, []); assert.equal(value.observedSheetCount, 0);
    await assert.rejects(fixture({ before }).run(pageRequest), /READ_FAILED/u);
  }
});

void test("project page metadata refuses missing pages, wrong parents, incomplete peers and a contradictory direct getter", async () => {
  for (const before of ["delete sheetMap[page.uuid];", "page.schematic_uuid='f'.repeat(16);", "sheetMap['e'.repeat(16)].schematic_uuid='1'.repeat(16);",
    "schematicMap[target.schematicUuid].source=null;", "sheetMap['e'.repeat(16)].docType=3;",
    "schematicMap[page.uuid]={...metadata,uuid:page.uuid};", "page={...page,title:'getter-only'};",
    "Object.defineProperty(page,'title',{get(){getterReads++;return 'PRIVATE';}});"]) {
    const env = fixture({ before }); await assert.rejects(env.run(pageRequest), /READ_FAILED/u);
    assert.equal(env.evaluate("getterReads"), 0); assert.deepEqual(structuredClone(env.evaluate("denied")), []);
  }
  const tooLarge = fixture({ before: "for(let i=0;i<80;i++){const uuid=i.toString(16).padStart(16,'0'),child=(i+1000).toString(16).padStart(16,'0');schematicMap[uuid]={...metadata,uuid,source:'x'.repeat(4096)};sheetMap[child]={...page,uuid:child,schematic_uuid:uuid,source:'x'.repeat(4096)};}" });
  await assert.rejects(tooLarge.run(pageRequest), /READ_FAILED/u); assert.equal(tooLarge.evaluate("calls.length"), 5);
});

void test("project page metadata rechecks every awaited read, rejects peer drift and consumes a timed-out direct read", async () => {
  for (const count of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]) {
    const env = fixture({ afterRpc: `if(calls.length===${count})gVars.currentProject.branchUuid='e'.repeat(32);` });
    await assert.rejects(env.run(pageRequest), /READ_FAILED/u); assert.equal(env.evaluate("calls.length"), count);
  }
  for (const afterRpc of ["if(calls.length===7)schematicMap['f'.repeat(16)].display_name='peer changed';",
    "if(calls.length===8)sheetMap['e'.repeat(16)].display_title='peer changed';", "if(calls.length===9)page={...page,ticket:7};"]) {
    await assert.rejects(fixture({ afterRpc }).run(pageRequest), /READ_FAILED/u);
  }
  const env = fixture({ pendingAt: 4 }), running = env.run(pageRequest); await flush(); assert.equal(env.evaluate("calls.length"), 4); env.expire();
  await assert.rejects(running, /READ_FAILED/u); env.evaluate("release();"); await flush(); assert.equal(env.evaluate("calls.length"), 4); assert.equal(env.clears(), 1);
});

void test("project page request and result contracts reject cross-family output and incomplete or unbound membership", async () => {
  for (const input of [pageRequest, allPagesRequest]) { assert.deepEqual(parseCurrentProjectSchematicMetadataRequest(input), input); }
  for (const input of [{ ...pageRequest, target }, { ...pageRequest, target: { ...pageRequest.target, schematicPageUuid: "bad" } },
    { ...allPagesRequest, target }, { ...allPagesRequest, arguments: {} }, { ...request, target: pageRequest.target },
    { ...pageRequest, target: Object.defineProperty({ ...pageRequest.target }, "schematicPageUuid", { get(): never { throw new Error("getter"); } }) }]) {
    assert.equal(validateCurrentProjectSchematicMetadataArguments(input)["valid"], false);
  }
  const env = fixture(), envelope = structuredClone(await env.run(pageRequest));
  const value = decodeCurrentProjectSchematicMetadataReply(reply(envelope), pageRequest);
  assert.equal(value.method, "eda.dmt_Schematic.getSchematicPageInfo"); const page = value.pages[0]; assert.ok(page);
  for (const changed of [{ ...value, pages: [] }, { ...value, pages: [page, page] }, { ...value, schematics: [] },
    { ...value, pages: [{ ...page, schematicUuid: "f".repeat(16) }] }, { ...value, pages: [{ ...page, uuid: "f".repeat(16) }] },
    { ...value, observedSchematicCount: 0 }, { ...value, observedSheetCount: 0 }, { ...value, persistenceVerified: true },
    { ...value, target: { ...pageRequest.target, schematicUuid: "f".repeat(16) } }]) {
    assert.throws(() => decodeCurrentProjectSchematicMetadataReply(reply(encodeExactReadEnvelope(changed)), pageRequest));
  }
  const allEnv = fixture(), allEnvelope = structuredClone(await allEnv.run(allPagesRequest));
  const all = decodeCurrentProjectSchematicMetadataReply(reply(allEnvelope), allPagesRequest);
  assert.equal(all.method, "eda.dmt_Schematic.getAllSchematicPagesInfo");
  const selfParentedPages = structuredClone(all.pages);
  for (const item of selfParentedPages) { item.schematicUuid = item.uuid; }
  for (const changed of [{ ...all, pages: all.pages.slice(0, 1) }, { ...all, pages: all.pages.toReversed() },
    { ...all, pages: selfParentedPages }]) {
    assert.throws(() => decodeCurrentProjectSchematicMetadataReply(reply(encodeExactReadEnvelope(changed)), allPagesRequest));
  }
});

void test("project schematic metadata omits unselected private fields without invoking them", async () => {
  const env = fixture({ before: "Object.defineProperty(metadata,'creator',{get(){getterReads++;throw new Error('PRIVATE');}});Object.defineProperty(page,'canvas',{get(){getterReads++;throw new Error('PRIVATE');}});Object.defineProperty(page,'doc_id',{get(){getterReads++;throw new Error('PRIVATE');}});Object.defineProperty(projectDetail,'credentials',{get(){getterReads++;throw new Error('PRIVATE');}});" });
  const envelope = structuredClone(await env.run());
  const value = decodeCurrentProjectSchematicMetadataReply(reply(envelope), request);
  assert.equal(env.evaluate("getterReads"), 0); assert.equal(JSON.stringify(value).includes("credentials"), false);
  assert.equal(JSON.stringify(value).includes("doc_id"), false); assert.equal(JSON.stringify(value).includes("creator"), false);
});

void test("project schematic reader refuses malformed or incomplete native maps rather than returning empty or partial data", async () => {
  for (const before of ["schematicMap=[];", "sheetMap=undefined;", "sheetMap=[];", "schematicMap=null;", "page.schematic_uuid='1'.repeat(16);", "page.project_uuid='1'.repeat(64);",
    "metadata.uuid='1'.repeat(16);", "page.uuid='1'.repeat(16);", "sheetMap.extra=page;", "schematicMap[Symbol('hidden')]=metadata;", "metadata.name=undefined;",
    "page.zIndex=NaN;", "page.zIndex=-0;", "page.docType=3;", "page.ticket=-0;", "metadata.updateTime=8640000000000001;", "metadata.source='x'.repeat(4097);",
    "page.version=undefined;", "metadata.display_name='x'.repeat(513);", "page.source=null;", "metadata.board=null;", "Object.defineProperty(page,'title',{get(){getterReads++;return 'PRIVATE';}});",
    "Object.defineProperty(sheetMap,page.uuid,{get(){getterReads++;return page;}});", "schematicMap=Object.create(schematicMap);", "sheetMap=Object.create(sheetMap);"] ) {
    const env = fixture({ before }); await assert.rejects(env.run(), /READ_FAILED/u); assert.equal(env.evaluate("getterReads"), 0);
    assert.deepEqual(structuredClone(env.evaluate("denied")), []);
  }
  for (const which of ["schematicMap", "sheetMap"]) {
    const env = fixture({ before: `for(let i=0;i<129;i++){const uuid=i.toString(16).padStart(16,'0');${which}[uuid]={...${which === "schematicMap" ? "metadata" : "page"},uuid};}` });
    await assert.rejects(env.run(), /READ_FAILED/u);
  }
});

void test("project schematic reader rejects hidden, dirty, editor, restoration and project flags before metadata calls", async () => {
  for (const before of ["info.tabs.push({tabId:page.uuid+'@'+target.projectUuid,data:{doctype:1}});", "extraMarkers.push({});", "extraIframes.push({});", "blankPools.push({});",
    "start.isUnSaved=true;", "UI.concurrentDesign.readOnly=true;", "UI.concurrentDesign._isConcurrentStrictMode=true;", "gVars.sessionStorageTabs.add('private');",
    "gVars.urlCmd='private';", "gVars.isHistoryMode=true;", "navigator.serviceWorker.controller={};", "gVars.currentProject.projectId='e'.repeat(64);"] ) {
    const env = fixture({ before }); await assert.rejects(env.run(), /READ_FAILED/u); assert.equal(env.evaluate("calls.length"), 0);
  }
  for (const key of ["archive", "store", "cbb_project"]) {
    for (const flag of ["true", "1", "'false'"]) {
      const env = fixture({ before: `projectDetail.${key}=${flag};` }); await assert.rejects(env.run(), /READ_FAILED/u); assert.equal(env.evaluate("calls.length"), 1);
    }
  }
});

void test("project schematic reader bounds the complete combined sample before selected filtering", async () => {
  const env = fixture({ before: "for(let i=0;i<80;i++){const uuid=i.toString(16).padStart(16,'0'),child=(i+1000).toString(16).padStart(16,'0');schematicMap[uuid]={...metadata,uuid,source:'x'.repeat(4096)};sheetMap[child]={...page,uuid:child,schematic_uuid:uuid,source:'x'.repeat(4096)};}" });
  await assert.rejects(env.run(), /READ_FAILED/u);
  // Each native map is individually within bounds. The combined first sample
  // Is not, although the selected container and its one child would fit.
  assert.equal(env.evaluate("calls.length"), 5); assert.equal(env.clears(), 1);
});

void test("project schematic reader rechecks original owners after each await and detects peer or child drift", async () => {
  for (const change of ["gVars.messageBus=new Bus();", "Bus.prototype.rpcCall=async()=>({message:projectDetail});", "gVars.currentProject={...gVars.currentProject};",
    "info.tabs=[...info.tabs];", "domRoot.children=[...domRoot.children];", "UI.concurrentDesign=new Permission();", "document.querySelectorAll=()=>[];", "eda={...eda};", "clearTimeout=()=>{};"]) {
    const env = fixture({ afterRpc: `if(calls.length===1){${change}}` }); await assert.rejects(env.run(), /READ_FAILED/u); assert.equal(env.evaluate("calls.length"), 1);
  }
  for (const count of [2, 3, 4, 5, 6, 7, 8, 9, 10]) {
    const env = fixture({ afterRpc: `if(calls.length===${count})gVars.currentProject.branchUuid='e'.repeat(32);` });
    await assert.rejects(env.run(), /READ_FAILED/u); assert.equal(env.evaluate("calls.length"), count);
  }
  for (const afterRpc of ["if(calls.length===7)schematicMap['f'.repeat(16)].display_name='Changed peer';", "if(calls.length===8)page.title='changed';",
    "if(calls.length===8)page.schematic_uuid='f'.repeat(16);", "if(calls.length===8)delete sheetMap['e'.repeat(16)];", "if(calls.length===9)metadata={...metadata,ticket:9};",
    "if(calls.length===5)projectDetail.owner.uuid='e'.repeat(32);", "if(calls.length===6)projectDetail.owner.uuid='e'.repeat(32);"]) {
    await assert.rejects(fixture({ afterRpc }).run(), /READ_FAILED/u);
  }
});

void test("project schematic reader consumes one pending read on timeout and does not continue after its late reply", async () => {
  const env = fixture({ pendingAt: 3 }), running = env.run(); await flush(); assert.equal(env.evaluate("calls.length"), 3); env.expire();
  await assert.rejects(running, { message: "CURRENT_PROJECT_SCHEMATIC_METADATA_READ_FAILED" }); env.evaluate("release();"); await flush();
  assert.equal(env.evaluate("calls.length"), 3); assert.equal(env.clears(), 1);
  const opaque = fixture({ afterRpc: "throw Object.defineProperty({},'message',{get(){getterReads++;return 'PRIVATE';}});" });
  await assert.rejects(opaque.run(), { message: "CURRENT_PROJECT_SCHEMATIC_METADATA_READ_FAILED" }); assert.equal(opaque.evaluate("getterReads"), 0);
});

void test("project schematic request and discovery reject caller code, accessors, proxies and mismatched method targets", () => {
  assert.deepEqual(parseCurrentProjectSchematicMetadataRequest(request), request); assert.deepEqual(parseCurrentProjectSchematicMetadataRequest(allRequest), allRequest);
  assert.equal(queryCurrentProjectSchematicMetadata({ includeSchemas: true })["total"], 4);
  const discovery = queryCurrentProjectSchematicMetadata({ method: request.method, includeSchemas: true });
  assert.equal(discovery["total"], 1); assert.equal(discovery["invocationEnabledByDiscovery"], false); assert.match(JSON.stringify(discovery), /inputSchema/u);
  for (const invalid of [{ ...request, code: "private()" }, { ...allRequest, target }, { ...request, target: allRequest.target }, { ...request, method: "eda.dmt_Schematic.modifySchematicName" },
    { ...request, target: { ...target, projectUuid: "a".repeat(32) } }, new Proxy(request, {}),
    Object.defineProperty({ ...request }, "target", { get(): never { throw new Error("getter invoked"); } }),
    { ...request, target: Object.defineProperty({ ...target }, "schematicUuid", { get(): never { throw new Error("getter invoked"); } }) }]) {
    assert.throws(() => buildCurrentProjectSchematicMetadataProgram(invalid)); assert.equal(validateCurrentProjectSchematicMetadataArguments(invalid)["valid"], false);
  }
});

void test("project schematic result and envelope validation rejects authority promotion and malformed membership", async () => {
  const env = fixture(), envelope = structuredClone(await env.run());
  const value = decodeCurrentProjectSchematicMetadataReply(reply(envelope), request);
  assert.equal(value.method, "eda.dmt_Schematic.getSchematicInfo");
  assert.equal(validateCurrentProjectSchematicMetadataResult(request, value)["liveValidation"], "not-recorded");
  for (const key of ["workerIdentityVerified", "cadAuthority", "persistenceVerified", "sourceMembershipVerified", "permissionVerified", "startupCompletionVerified", "mutationDispatched", "explicitSaveDispatched"]) {
    assert.throws(() => decodeCurrentProjectSchematicMetadataReply(reply(encodeExactReadEnvelope({ ...value, [key]: true })), request));
  }
  const selected = value.schematics[0]; assert.ok(selected);
  const wrongParent = structuredClone(selected);
  for (const child of wrongParent.children) { child.schematicUuid = "f".repeat(16); }
  for (const changed of [{ ...value, extra: true }, { ...value, target: { ...target, branchUuid: "e".repeat(32) } }, { ...value, samples: 1 },
    { ...value, schematics: [selected, selected] }, { ...value, observedSchematicCount: 0 }, { ...value, observedSheetCount: 0 },
    { ...value, schematics: [{ ...selected, children: [...selected.children, ...selected.children] }] },
    { ...value, schematics: [wrongParent] }]) {
    assert.throws(() => decodeCurrentProjectSchematicMetadataReply(reply(encodeExactReadEnvelope(changed)), request));
  }
  for (const invalid of [{ schema: EXACT_READ_ENVELOPE_SCHEMA, utf8Bytes: 1, json: "{" },
    { schema: EXACT_READ_ENVELOPE_SCHEMA, utf8Bytes: 1, json: "x".repeat(CURRENT_PROJECT_SCHEMATIC_METADATA_MAX_BYTES + 1) }]) {
    assert.throws(() => decodeCurrentProjectSchematicMetadataReply(reply(invalid), request));
  }
});
