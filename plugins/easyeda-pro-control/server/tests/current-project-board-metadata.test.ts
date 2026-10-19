/** Synthetic browser/RPC owners only. No live application or project access. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_PROJECT_BOARD_METADATA_MAX_BYTES, CURRENT_PROJECT_BOARD_METADATA_MAX_ITEMS, CURRENT_PROJECT_BOARD_METADATA_TIMEOUT_MS, currentProjectBoardMetadataRequestSchema,
  decodeCurrentProjectBoardMetadataReply, parseCurrentProjectBoardMetadataRequest, queryCurrentProjectBoardMetadata,
  validateCurrentProjectBoardMetadataArguments, validateCurrentProjectBoardMetadataResult } from "../src/current-project-board-metadata.ts";
import { buildCurrentProjectBoardMetadataProgram } from "../src/current-project-board-metadata-program.ts";
import { EXACT_READ_ENVELOPE_SCHEMA, encodeExactReadEnvelope } from "../src/exact-readers.ts";

const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), boardUuid: "c".repeat(16) };
const request = { method: "eda.dmt_Board.getBoardInfo", target } as const;
const inventoryRequest = { method: "eda.dmt_Board.getAllBoardsInfo", target: { projectUuid: target.projectUuid, branchUuid: target.branchUuid } } as const;
function reply(value: unknown): unknown { return { content: [], structuredContent: { ok: true, result: value } }; }
interface Options { readonly before?: string; readonly afterRpc?: string; readonly pendingAt?: number; readonly inventory?: boolean }
function fixture(options: Options = {}): { run: () => Promise<unknown>; evaluate: (source: string) => unknown; expire: () => void; clears: () => number } {
  let clears = 0, timeout: (() => void) | undefined;
  const context = createContext({ TextEncoder,
    setTimeout(callback: () => void, delay: number): number { assert.equal(delay, CURRENT_PROJECT_BOARD_METADATA_TIMEOUT_MS); timeout = callback; return 7; },
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
globalThis.fetch=()=>forbidden('network');globalThis.metadata={uuid:target.boardUuid,title:'Board Ω',zIndex:1.5,ticket:12345};
globalThis.boardMap={[target.boardUuid]:metadata};globalThis.individual=undefined;
globalThis.projectDetail={uuid:target.projectUuid,currentBranch:target.branchUuid,isV2Format:false,owner:{uuid:'d'.repeat(32)},archive:false,cbb_project:false};
class Bus{async rpcCall(topic,args,timeout){if(this!==gVars.messageBus||timeout!==0||!Array.isArray(args))return forbidden('receiver');calls.push([topic,[...args]]);
if(topic==='/PrjDB/board/getData'){if(args.length!==2||args[0]!==target.boardUuid||args[1]!==target.projectUuid)return forbidden('board-args');}
else if(topic==='/PrjDB/board/getAllKVData'){if(args.length!==1||args[0]!==target.projectUuid)return forbidden('inventory-args');}
else if(topic==='/PrjDB/project/getData'){if(args.length!==1||args[0]!==target.projectUuid)return forbidden('project-args');}else return forbidden(topic);
if(calls.length===${options.pendingAt ?? 0})await new Promise(resolve=>{globalThis.release=resolve;});await Promise.resolve();${options.afterRpc ?? ""}
return{message:topic==='/PrjDB/board/getData'?(individual===undefined?metadata:individual):topic==='/PrjDB/board/getAllKVData'?boardMap:projectDetail};}}
class Permission{constructor(){this._isConcurrentStrictMode=false;this.readOnly=false;}get isConcurrentStrictMode(){return this._isConcurrentStrictMode;}set isConcurrentStrictMode(value){this._isConcurrentStrictMode=value;}getIframeDisableStatusPanelPcb(id){if(this!==UI.concurrentDesign||id!==Tabs.currentTabId)return forbidden('permission-receiver');return{disable:this.readOnly};}}
globalThis.gVars={currentProject:{projectId:target.projectUuid,branchUuid:target.branchUuid,isV2Format:false},isHistoryMode:false,messageBus:new Bus(),sessionStorageTabs:new Set(),urlCmd:null};
globalThis.UI={gVars,tabBar:Tabs,concurrentDesign:new Permission()};globalThis.eda={extensionUuid:'7e06d286b1ac846ef7eab9c7f2a9ee40',dmt_Board:{getBoardInfo:()=>forbidden('public-get'),modifyBoardName:()=>forbidden('modify')},dmt_Project:{openProject:()=>forbidden('open')},sys_FileSystem:{save:()=>forbidden('save')}};
globalThis.domRoot={tagName:'DIV',ownerDocument:document,isConnected:true,children:[]};
domRoot.children=['commandWin','exitSmartSizeTool','exitPadShapeTool','project-blank-page','assembly-variant-page'].map(id=>({id,tagName:'DIV',ownerDocument:document,isConnected:true,parentElement:domRoot,getAttribute(){return null;}}));
globalThis.extraMarkers=[];globalThis.extraIframes=[];globalThis.blankPools=[];
document.querySelectorAll=function(selector){if(selector==='[id="tabbar_bodies"]')return[domRoot];if(selector==='iframe')return extraIframes;if(selector==='.blankIframeDiv')return blankPools;if(selector.startsWith('.editframe,'))return extraMarkers;return forbidden('selector');};
${options.before ?? ""}`, context, { timeout: 1000 });
  return {
    run: (): Promise<unknown> => Promise.resolve(runInContext(`(async()=>{${buildCurrentProjectBoardMetadataProgram(options.inventory === true ? inventoryRequest : request)}})()`, context, { timeout: 1000 }) as unknown),
    evaluate: (source): unknown => runInContext(source, context, { timeout: 1000 }) as unknown,
    expire(): void { assert.ok(timeout !== undefined); timeout(); }, clears: (): number => clears,
  };
}
async function flush(): Promise<void> { for (let index = 0; index < 30; index += 1) { await Promise.resolve(); } }

void test("project board selected reader compares two complete maps and UUID GETs under the original owner", async () => {
  for (const before of ["", "info.tabs.push(blank);info.activeTabId='0';Tabs.currentTabId='0';", "location.href='https://client/editor?cll=warn#';document.URL=location.href;"]) {
    const env = fixture({ before }), raw = structuredClone(await env.run());
    const result = decodeCurrentProjectBoardMetadataReply(reply(raw), request);
    assert.deepEqual(result.target, target); assert.deepEqual(result.value, { uuid: target.boardUuid, title: "Board Ω", zIndex: 1.5, ticket: 12_345 });
    assert.equal(result.observedBoardCount, 1); assert.equal(result.selectedGetMatchesMapObserved, true); assert.equal(result.completeNativeBoardMapObserved, true);
    assert.equal(result.currentTabId, before.includes("info.tabs.push") ? "0" : "tab_page1");
    const topics = ["/PrjDB/project/getData", "/PrjDB/board/getAllKVData", "/PrjDB/board/getData", "/PrjDB/project/getData"];
    assert.equal(env.evaluate("JSON.stringify(calls.map(call=>call[0]))"), JSON.stringify([...topics, ...topics]));
    assert.deepEqual(structuredClone(env.evaluate("denied")), []); assert.equal(env.clears(), 1);
    assert.ok(Object.isFrozen(result)); assert.ok(Object.isFrozen(result.value)); assert.ok(Object.isFrozen(result.target));
    for (const key of ["workerIdentityVerified", "cadAuthority", "persistenceVerified", "sourceMembershipVerified", "childMembershipVerified", "publicWrapperParityVerified", "permissionVerified", "mutationDispatched", "explicitSaveDispatched"] as const) {
      assert.equal(result[key], false);
    }
  }
});

void test("project board inventory preserves raw titles and numeric order while sorting UUIDs, including genuine empty maps", async () => {
  for (const before of ["boardMap={};", "boardMap['a'.repeat(32)]={...metadata,uuid:'a'.repeat(32),zIndex:-2};"]) {
    const env = fixture({ inventory: true, before }), raw = structuredClone(await env.run());
    const result = decodeCurrentProjectBoardMetadataReply(reply(raw), inventoryRequest);
    const empty = before === "boardMap={};";
    assert.equal(result.observedBoardCount, empty ? 0 : 2); assert.equal(result.ownerUuid, "d".repeat(32));
    assert.deepEqual(result.boards.map(value => value.uuid), empty ? [] : ["a".repeat(32), target.boardUuid]);
    assert.deepEqual(result.boards.map(value => value.title), empty ? [] : ["Board Ω", "Board Ω"]);
    assert.deepEqual(result.boards.map(value => value.zIndex), empty ? [] : [-2, 1.5]);
    assert.ok(Object.isFrozen(result.boards)); for (const board of result.boards) { assert.ok(Object.isFrozen(board)); }
    const topics = ["/PrjDB/project/getData", "/PrjDB/board/getAllKVData", "/PrjDB/project/getData"];
    assert.equal(env.evaluate("JSON.stringify(calls.map(call=>call[0]))"), JSON.stringify([...topics, ...topics]));
    assert.deepEqual(structuredClone(env.evaluate("denied")), []);
  }
});

void test("project board both modes reject malformed or oversized complete maps before selected GET or filtering", async () => {
  for (const inventory of [false, true]) {
    for (const before of ["boardMap=undefined;", "boardMap=null;", "boardMap=[];", "boardMap=Object.create({});", "boardMap.invalid=metadata;",
      "boardMap[Symbol('extra')]=metadata;", "boardMap['a'.repeat(16)]={...metadata};", "metadata.uuid='e'.repeat(16);",
      "metadata.title=null;", "metadata.title='x'.repeat(513);", "metadata.ticket=-0;", "metadata.ticket=NaN;", "metadata.ticket=0.5;",
      "metadata.zIndex=Infinity;", "metadata.zIndex=-0;", "metadata.zIndex='1';", "delete metadata.zIndex;", "metadata.canvas='PRIVATE';",
      "Object.defineProperty(boardMap,target.boardUuid,{get(){getterReads++;return metadata;}});",
      "Object.defineProperty(metadata,'title',{get(){getterReads++;return 'PRIVATE';}});",
      `boardMap=Object.fromEntries(Array.from({length:${CURRENT_PROJECT_BOARD_METADATA_MAX_ITEMS + 1}},(_,i)=>{const id=i.toString(16).padStart(16,'0');return[id,{...metadata,uuid:id}];}));boardMap[target.boardUuid]=metadata;`,
      "boardMap=Object.fromEntries(Array.from({length:100},(_,i)=>{const id=i.toString(16).padStart(16,'0');return[id,{...metadata,uuid:id,title:'Ω'.repeat(512)}];}));boardMap[target.boardUuid]=metadata;"]) {
      const env = fixture({ inventory, before });
      await assert.rejects(env.run(), /CURRENT_PROJECT_BOARD_METADATA_READ_FAILED/u);
      assert.equal(env.evaluate("calls.length"), 2); assert.equal(env.evaluate("getterReads"), 0); assert.deepEqual(structuredClone(env.evaluate("denied")), []);
    }
  }
});

void test("project board selected mode refuses missing membership, conflicting GET and unselected peer drift", async () => {
  const missing = fixture({ before: "boardMap={};" });
  await assert.rejects(missing.run(), /CURRENT_PROJECT_BOARD_METADATA_READ_FAILED/u); assert.equal(missing.evaluate("calls.length"), 2);
  for (const before of ["individual=null;", "individual={...metadata,title:'different'};", "individual={...metadata,zIndex:2};",
    "individual={...metadata,ticket:12346};", "individual={...metadata,uuid:'e'.repeat(16)};", "individual={...metadata,child:{}};"]) {
    const env = fixture({ before }); await assert.rejects(env.run(), /CURRENT_PROJECT_BOARD_METADATA_READ_FAILED/u); assert.equal(env.evaluate("calls.length"), 3);
  }
  for (const afterRpc of ["if(calls.length===6)boardMap['a'.repeat(16)].title='changed';", "if(calls.length===6)delete boardMap['a'.repeat(16)];",
    "if(calls.length===7)individual={...metadata,ticket:99999};", "if(calls.length===8)projectDetail.owner.uuid='e'.repeat(32);"]) {
    const env = fixture({ before: "boardMap['a'.repeat(16)]={...metadata,uuid:'a'.repeat(16)};", afterRpc });
    await assert.rejects(env.run(), /CURRENT_PROJECT_BOARD_METADATA_READ_FAILED/u);
  }
});

void test("project board no-editor restrictions refuse before native reads", async () => {
  for (const before of ["info.tabs.push({tabId:target.boardUuid+'@'+target.projectUuid,data:{doctype:3}});", "extraMarkers.push({});", "extraIframes.push({});",
    "blankPools.push({});", "domRoot.children.push({});", "start.isUnSaved=true;", "start.data.isReadOnlyMode=true;",
    "UI.concurrentDesign.readOnly=true;", "UI.concurrentDesign._isConcurrentStrictMode=true;", "gVars.sessionStorageTabs.add('private');",
    "gVars.urlCmd='private';", "gVars.isHistoryMode=true;", "navigator.serviceWorker.controller={};", "gVars.currentProject.isV2Format=true;",
    "gVars.currentProject.projectId='e'.repeat(64);", "gVars.currentProject.branchUuid='e'.repeat(32);", "PRO_EDITOR_VERSION='3.2.182';"]) {
    const env = fixture({ before }); await assert.rejects(env.run(), /CURRENT_PROJECT_BOARD_METADATA_READ_FAILED/u); assert.equal(env.evaluate("calls.length"), 0);
  }
});

void test("project board project metadata validates owner and inactive flags without reading unrelated private data", async () => {
  for (const key of ["archive", "store", "cbb_project"]) {
    for (const value of ["undefined", "false", "null", "0"]) {
      const env = fixture({ before: `projectDetail.${key}=${value};Object.defineProperty(projectDetail,'credentials',{get(){getterReads++;throw new Error('PRIVATE');}});` });
      const raw = structuredClone(await env.run()), result = decodeCurrentProjectBoardMetadataReply(reply(raw), request);
      assert.equal(result.samples, 2); assert.equal(env.evaluate("getterReads"), 0);
    }
    for (const before of [`projectDetail.${key}=true;`, `projectDetail.${key}='false';`,
      `Object.defineProperty(projectDetail,'${key}',{get(){getterReads++;return false;}});`,
      `delete projectDetail.${key};Object.defineProperty(Object.prototype,'${key}',{value:false});`]) {
      const env = fixture({ before }); await assert.rejects(env.run(), /CURRENT_PROJECT_BOARD_METADATA_READ_FAILED/u);
      assert.equal(env.evaluate("calls.length"), 1); assert.equal(env.evaluate("getterReads"), 0);
    }
  }
  for (const before of ["projectDetail.uuid='e'.repeat(64);", "projectDetail.currentBranch='e'.repeat(32);", "projectDetail.owner.uuid='wrong';", "projectDetail.isV2Format=true;"]) {
    const env = fixture({ before }); await assert.rejects(env.run(), /CURRENT_PROJECT_BOARD_METADATA_READ_FAILED/u); assert.equal(env.evaluate("calls.length"), 1);
  }
});

void test("project board retains RPC, context, DOM and authenticated extension identities across every await", async () => {
  for (const change of ["gVars.messageBus=new Bus();", "Bus.prototype.rpcCall=async()=>({message:projectDetail});", "gVars.currentProject={...gVars.currentProject};",
    "info.tabs=[...info.tabs];", "domRoot.children=[...domRoot.children];", "document.querySelectorAll=()=>[];", "UI.concurrentDesign=new Permission();",
    "gVars.sessionStorageTabs=new Set();", "eda={...eda};", "clearTimeout=()=>{};", "extraIframes.push({});"]) {
    const env = fixture({ afterRpc: `if(calls.length===1){${change}}` });
    await assert.rejects(env.run(), /CURRENT_PROJECT_BOARD_METADATA_READ_FAILED/u); assert.equal(env.evaluate("calls.length"), 1);
  }
  for (const count of [2, 3, 4, 5, 6, 7, 8]) {
    const env = fixture({ afterRpc: `if(calls.length===${count})gVars.currentProject.branchUuid='e'.repeat(32);` });
    await assert.rejects(env.run(), /CURRENT_PROJECT_BOARD_METADATA_READ_FAILED/u); assert.equal(env.evaluate("calls.length"), count);
  }
  for (const count of [4, 5, 8]) {
    await assert.rejects(fixture({ afterRpc: `if(calls.length===${count})projectDetail.owner.uuid='e'.repeat(32);` }).run(), /CURRENT_PROJECT_BOARD_METADATA_READ_FAILED/u);
  }
});

void test("project board deadline consumes only the outstanding read and opaque native errors remain private", async () => {
  for (const pendingAt of [2, 3]) {
    const env = fixture({ pendingAt }), running = env.run(); await flush(); assert.equal(env.evaluate("calls.length"), pendingAt); env.expire();
    await assert.rejects(running, { message: "CURRENT_PROJECT_BOARD_METADATA_READ_FAILED" }); env.evaluate("release();"); await flush();
    assert.equal(env.evaluate("calls.length"), pendingAt); assert.equal(env.clears(), 1);
  }
  const env = fixture({ afterRpc: "throw Object.defineProperty({},'message',{get(){getterReads++;return 'PRIVATE';}});" });
  await assert.rejects(env.run(), { message: "CURRENT_PROJECT_BOARD_METADATA_READ_FAILED" }); assert.equal(env.evaluate("getterReads"), 0);
});

void test("project board request and discovery reject name selection, executable data and malformed targets", () => {
  for (const candidate of [request, inventoryRequest]) {
    assert.deepEqual(parseCurrentProjectBoardMetadataRequest(candidate), candidate);
    assert.equal(currentProjectBoardMetadataRequestSchema.safeParse(candidate).success, true);
    assert.equal(validateCurrentProjectBoardMetadataArguments(candidate)["valid"], true);
  }
  const discovery = queryCurrentProjectBoardMetadata({ includeSchemas: true });
  assert.equal(discovery["total"], 2); assert.equal(discovery["invocationEnabledByDiscovery"], false); assert.match(JSON.stringify(discovery), /not IDMT_BoardItem/u);
  assert.match(JSON.stringify(discovery), /inputSchema/u); assert.match(JSON.stringify(discovery), /resultSchema/u);
  assert.equal(queryCurrentProjectBoardMetadata({ method: inventoryRequest.method })["total"], 1);
  for (const invalid of [{ ...request, code: "private()" }, { ...request, method: "eda.dmt_Board.deleteBoard" }, { ...request, arguments: { boardName: "Board Ω" } },
    { ...request, target: { ...target, boardName: "Board Ω" } }, { ...inventoryRequest, target }, { ...request, target: { ...target, boardUuid: "bad" } },
    { ...request, target: { ...target, projectUuid: "a".repeat(32) } }, { ...request, target: { ...target, branchUuid: "b".repeat(16) } },
    Object.defineProperty({ ...request }, "target", { get(): never { throw new Error("getter invoked"); } }), new Proxy(request, {}),
    { ...request, target: Object.defineProperty({ ...target }, "boardUuid", { get(): never { throw new Error("getter invoked"); } }) }]) {
    assert.throws(() => buildCurrentProjectBoardMetadataProgram(invalid)); assert.equal(validateCurrentProjectBoardMetadataArguments(invalid)["valid"], false);
  }
});

void test("project board strict results reject authority promotion, count/identity drift and malformed envelopes", async () => {
  const selectedRaw = structuredClone(await fixture().run());
  const selected = decodeCurrentProjectBoardMetadataReply(reply(selectedRaw), request);
  assert.equal(validateCurrentProjectBoardMetadataResult(request, selected)["effect"], "current-project-only-board-metadata-read");
  for (const key of ["workerIdentityVerified", "cadAuthority", "persistenceVerified", "sourceMembershipVerified", "childMembershipVerified", "publicWrapperParityVerified", "permissionVerified", "mutationDispatched", "explicitSaveDispatched"] as const) {
    assert.throws(() => decodeCurrentProjectBoardMetadataReply(reply(encodeExactReadEnvelope({ ...selected, [key]: true })), request));
  }
  for (const invalid of [{ ...selected, observedBoardCount: 0 }, { ...selected, selectedGetMatchesMapObserved: false }, { ...selected, completeNativeBoardMapObserved: false },
    { ...selected, target: { ...target, branchUuid: "e".repeat(32) } }, { ...selected, value: { ...selected.value, uuid: "e".repeat(16) } },
    { ...selected, value: { ...selected.value, children: [] } }, { ...selected, value: { ...selected.value, title: "x".repeat(513) } }, { ...selected, samples: 1 }]) {
    assert.throws(() => decodeCurrentProjectBoardMetadataReply(reply(encodeExactReadEnvelope(invalid)), request));
  }
  const inventoryRaw = structuredClone(await fixture({ inventory: true }).run());
  const inventory = decodeCurrentProjectBoardMetadataReply(reply(inventoryRaw), inventoryRequest);
  for (const invalid of [{ ...inventory, observedBoardCount: 0 }, { ...inventory, boards: [selected.value, selected.value], observedBoardCount: 2 },
    { ...inventory, boards: [selected.value, { ...selected.value, uuid: "a".repeat(16) }], observedBoardCount: 2 }, { ...inventory, value: selected.value }]) {
    assert.throws(() => decodeCurrentProjectBoardMetadataReply(reply(encodeExactReadEnvelope(invalid)), inventoryRequest));
  }
  assert.throws(() => decodeCurrentProjectBoardMetadataReply(reply(encodeExactReadEnvelope(inventory)), request));
  for (const invalid of [{ schema: EXACT_READ_ENVELOPE_SCHEMA, utf8Bytes: 1, json: "{" },
    { schema: EXACT_READ_ENVELOPE_SCHEMA, utf8Bytes: 1, json: "x".repeat(CURRENT_PROJECT_BOARD_METADATA_MAX_BYTES + 1) },
    Object.defineProperty({ schema: EXACT_READ_ENVELOPE_SCHEMA, utf8Bytes: 0, json: "" }, "json", { get(): never { throw new Error("getter invoked"); } })]) {
    assert.throws(() => decodeCurrentProjectBoardMetadataReply(reply(invalid), request));
  }
  assert.throws(() => decodeCurrentProjectBoardMetadataReply({ isError: true, content: [], structuredContent: { ok: false, error: "PRIVATE" } }, request));
});
