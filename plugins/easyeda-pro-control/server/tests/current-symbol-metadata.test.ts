import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { buildCurrentSymbolMetadataProgram } from "../src/current-symbol-metadata-program.ts";
import { parseCurrentSymbolMetadataRequest, queryCurrentSymbolMetadata, validateCurrentSymbolMetadataArguments,
  validateCurrentSymbolMetadataResult } from "../src/current-symbol-metadata.ts";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";

const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16),
  tabId: `${"c".repeat(16)}@${"a".repeat(64)}` };
const ownerUuid = "e".repeat(32), symbolUuid = "d".repeat(16);
const request = parseCurrentSymbolMetadataRequest({ method: "eda.lib_Symbol.get", arguments: { symbolUuid }, target });
const value = { uuid: symbolUuid, projectUuid: target.projectUuid, ownerUuid, name: "MixedCase symbol", description: "exact\ntext",
  tagsJson: '[" Tag ","Tag","Tag"]', source: "", version: "12345", ticket: 12_345 };
interface Options { before?: string; afterRpc?: string; afterIdentity?: string; fastDeadline?: boolean }
function fixture(options: Options = {}): { run: () => Promise<unknown>; evaluate: (source: string) => unknown } {
  const childContext = createContext({});
  runInContext(`globalThis.identityCalls=0;class Bus{async rpcCall(topic,arg,timeout){if(this!==MSG_BUS_PCB.messageBus||topic!=='getTabIdAndDocType'||arg!==undefined||timeout!==0)throw new Error('PRIVATE');identityCalls++;await Promise.resolve();${options.afterIdentity ?? ""}return{message:{tabId:${JSON.stringify(target.tabId)},docType:3}};}}globalThis.MSG_BUS_PCB={messageBus:new Bus()};`, childContext);
  const child: unknown = runInContext("globalThis", childContext);
  const context = createContext({ child, TextEncoder, setTimeout: options.fastDeadline === true
    ? (callback: () => void, delay: number): ReturnType<typeof setTimeout> => { assert.equal(delay, 10_000); return setTimeout(callback, 1); }
    : setTimeout, clearTimeout });
  runInContext(`globalThis.window=globalThis;globalThis.top=globalThis;globalThis.calls=[];globalThis.getterReads=0;
globalThis.location={href:'https://client/editor?cll=warn#id='+${JSON.stringify(target.projectUuid)}+',tab=*'+${JSON.stringify(target.tabId)},origin:'https://client'};
globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href,querySelectorAll(){return[frame];}};
globalThis.PRO_EDITOR_MODE='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM';globalThis.target=${JSON.stringify(target)};
globalThis.tab={tabId:target.tabId,data:{doctype:3,pid:target.projectUuid}};
globalThis.containerInfo={id:'editor-window-main',belong:'editor-window-main',tabs:[tab],activeTabId:target.tabId};
class Tabs{static containerIds=['editor-window-main'];static containerTree={id:'editor-window-main'};static belongContainer='editor-window-main';static currentTabId=target.tabId;static getActiveTab(){return this.currentTabId;}static getTabById(id){return containerInfo.tabs.find(t=>t.tabId===id);}static getContainerInfo(id){return id==='editor-window-main'?containerInfo:undefined;}}
globalThis.metadata={uuid:${JSON.stringify(symbolUuid)},project_uuid:target.projectUuid,display_title:${JSON.stringify(value.name)},description:${JSON.stringify(value.description)},custom_tags:${JSON.stringify(value.tagsJson)},source:'',version:'12345',ticket:12345,docType:2,path:target.projectUuid,owner:{uuid:${JSON.stringify(ownerUuid)}}};
globalThis.projectDetail={uuid:target.projectUuid,owner:{uuid:${JSON.stringify(ownerUuid)}},currentBranch:target.branchUuid,isV2Format:false};
class Bus{async rpcCall(topic,args,timeout){if(this!==gVars.messageBus||timeout!==0||!Array.isArray(args))throw new Error('PRIVATE');calls.push([topic,[...args]]);if(topic==='/PrjDB/symbol/getData'){if(args.length!==2||args[0]!==metadata.uuid||args[1]!==target.projectUuid)throw new Error('PRIVATE');}else if(topic==='/PrjDB/project/getData'){if(args.length!==1||args[0]!==target.projectUuid)throw new Error('PRIVATE');}else throw new Error('PRIVATE');await Promise.resolve();${options.afterRpc ?? ""}return{message:topic==='/PrjDB/symbol/getData'?metadata:projectDetail};}}
globalThis.gVars={currentProject:{projectId:target.projectUuid,branchUuid:target.branchUuid,isV2Format:false},isHistoryMode:false,messageBus:new Bus()};
globalThis.UI={gVars,tabBar:Tabs};globalThis.eda={extensionUuid:'7e06d286b1ac846ef7eab9c7f2a9ee40'};
globalThis.attributes={c_dbid:target.tabId,c_doctype:'3',src:'editor?entry=pcb','pcb-canvas':'true'};
globalThis.frame={tagName:'IFRAME',id:'frame_'+target.tabId,ownerDocument:document,isConnected:true,contentWindow:child,classList:{contains(name){return name==='editframe';}},getAttribute(name){return attributes[name]??null;},hasAttribute(name){return Object.hasOwn(attributes,name);},parentElement:{getAttribute(name){return name==='uuid'?target.tabId:null;}}};
child.document={defaultView:child,nodeType:9};child.frameElement=frame;child.parent=globalThis;child.top=globalThis;
${options.before ?? ""}`, context);
  return { run: (): Promise<unknown> => Promise.resolve(runInContext(`(async()=>{${buildCurrentSymbolMetadataProgram(request)}})()`, context, { timeout: 1000 }) as unknown),
    evaluate: (source: string): unknown => runInContext(source, context, { timeout: 1000 }) as unknown };
}

void test("current symbol metadata observes exact project-local fields with no canvas or public SDK call", async () => {
  const env = fixture({ before: "Object.defineProperty(metadata,'creator',{get(){getterReads++;throw new Error('PRIVATE');}});Object.defineProperty(metadata,'canvas',{get(){getterReads++;throw new Error('PRIVATE');}});" });
  const result = validateCurrentSymbolMetadataResult(request, decodeExactReadEnvelope(await env.run()));
  assert.deepEqual(result["value"], value);
  assert.equal(env.evaluate("calls.length"), 6); assert.equal(env.evaluate("child.identityCalls"), 4); assert.equal(env.evaluate("getterReads"), 0);
  assert.equal(result["targetClosedInRegistry"], true);
  for (const key of ["workerIdentityVerified", "hiddenEditorsVerified", "cadAuthority", "persistenceVerified", "sourceMembershipVerified"]) { assert.equal(result[key], false); }
  assert.match(JSON.stringify(result["limitations"]), /not establish a safe-to-write/u);
});

void test("current symbol metadata schemas bind exact local target and reject unsupported arguments/results", async () => {
  assert.equal(validateCurrentSymbolMetadataArguments(request)["valid"], true);
  const query = queryCurrentSymbolMetadata({ includeSchemas: true }); assert.equal(query["total"], 1); assert.match(JSON.stringify(query), /inputSchema/u);
  for (const invalid of [{ ...request, code: "private()" }, { ...request, arguments: { symbolUuid, libraryUuid: target.projectUuid } },
    { ...request, arguments: { symbolUuid: target.documentUuid } }, { ...request, arguments: { symbolUuid: "absent" } },
    { ...request, target: { ...target, projectUuid: "a".repeat(32), tabId: `${target.documentUuid}@${"a".repeat(32)}` } },
    { ...request, target: { ...target, tabId: "wrong" } }, { ...request, method: "eda.lib_Symbol.modify" }]) {
    assert.equal(validateCurrentSymbolMetadataArguments(invalid)["valid"], false); assert.throws(() => buildCurrentSymbolMetadataProgram(invalid));
  }
  const raw: unknown = decodeExactReadEnvelope(await fixture().run()); assert.ok(raw !== null && typeof raw === "object");
  for (const invalid of [{ ...raw, cadAuthority: true }, { ...raw, targetClosed: true }, { ...raw, samples: 1 },
    { ...raw, target: { ...target, branchUuid: "f".repeat(32) } }, { ...raw, value: { ...value, uuid: "f".repeat(16) } },
    { ...raw, value: { ...value, ticket: -0 } }, { ...raw, value: { ...value, tagsJson: "{}" } }]) {
    assert.throws(() => validateCurrentSymbolMetadataResult(request, invalid));
  }
});

void test("current symbol metadata refuses malformed fields and owner/type mismatches without invoking accessors", async () => {
  for (const before of ["metadata.owner.uuid='f'.repeat(32);", "projectDetail.currentBranch='f'.repeat(32);", "projectDetail.isV2Format=true;",
    "metadata.path='f'.repeat(64);", "metadata.docType=4;", "metadata.ticket=NaN;", "metadata.ticket=-0;", "metadata.ticket='12345';",
    "metadata.description=null;", "metadata.version=undefined;", "metadata.custom_tags='[1]';", "metadata.custom_tags='not-json';",
    "metadata.display_title='x'.repeat(513);", "metadata.source='x'.repeat(4097);",
    "Object.defineProperty(metadata,'description',{get(){getterReads++;throw new Error('PRIVATE');}});"]) {
    const env = fixture({ before }); await assert.rejects(env.run(), { message: "CURRENT_SYMBOL_METADATA_READ_FAILED" }); assert.equal(env.evaluate("getterReads"), 0);
  }
});

void test("current symbol metadata rejects registry/context drift and another registered symbol before metadata dispatch", async () => {
  for (const before of ["gVars.isHistoryMode=true;", "gVars.currentProject.isV2Format=true;", "gVars.currentProject.branchUuid='f'.repeat(32);",
    "containerInfo.tabs.push({tabId:metadata.uuid+'@'+target.projectUuid,data:{doctype:2,owner:metadata.owner.uuid}});",
    "UI.tabBar.containerIds.push('missing');", "UI.tabBar.containerTree={id:'other'};", "attributes.blankIframe='true';",
    "location.href='https://client/editor?cll=warn#id='+ 'f'.repeat(64);document.URL=location.href;"]) {
    const env = fixture({ before }); await assert.rejects(env.run(), { message: "CURRENT_SYMBOL_METADATA_READ_FAILED" }); assert.equal(env.evaluate("calls.length"), 0);
  }
  for (const afterRpc of ["if(calls.length===1)gVars.messageBus=new Bus();", "if(calls.length===1)UI.tabBar.getContainerInfo=()=>containerInfo;",
    "if(calls.length===1)containerInfo.tabs=[...containerInfo.tabs];", "if(calls.length===1)projectDetail.owner.uuid='f'.repeat(32);",
    "if(calls.length===5)metadata.description+='changed';", "if(calls.length===1){location.href='https://client/editor?cll=warn#';document.URL=location.href;}"]) {
    await assert.rejects(fixture({ afterRpc }).run(), { message: "CURRENT_SYMBOL_METADATA_READ_FAILED" });
  }
  await assert.rejects(fixture({ afterIdentity: "if(identityCalls===1)parent.gVars.currentProject.branchUuid='f'.repeat(32);" }).run(), { message: "CURRENT_SYMBOL_METADATA_READ_FAILED" });
});

void test("current symbol metadata deadline refuses a pending native read and exposes no cancellation claim", async () => {
  const env = fixture({ fastDeadline: true, afterRpc: "if(calls.length===1)await new Promise(()=>{});" });
  await assert.rejects(env.run(), { message: "CURRENT_SYMBOL_METADATA_READ_FAILED" }); assert.equal(env.evaluate("calls.length"), 1);
});
