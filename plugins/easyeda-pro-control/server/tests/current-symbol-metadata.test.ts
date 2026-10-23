import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { buildCurrentClosedSymbolMetadataProgram, buildCurrentSymbolMetadataProgram } from "../src/current-symbol-metadata-program.ts";
import { currentClosedSymbolMetadataProjection, validateCurrentClosedSymbolMetadataResult } from "../src/current-symbol-closed-target.ts";
import { parseCurrentSymbolMetadataRequest, queryCurrentSymbolMetadata, validateCurrentSymbolMetadataArguments,
  validateCurrentSymbolMetadataResult } from "../src/current-symbol-metadata.ts";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";

const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16),
  tabId: `${"c".repeat(16)}@${"a".repeat(64)}` };
const ownerUuid = "e".repeat(32), symbolUuid = "d".repeat(16);
const request = parseCurrentSymbolMetadataRequest({ method: "eda.lib_Symbol.get", arguments: { symbolUuid }, target });
const value = { uuid: symbolUuid, projectUuid: target.projectUuid, ownerUuid, name: "MixedCase symbol", description: "exact\ntext",
  tagsJson: '[" Tag ","Tag","Tag"]', source: "", version: "12345", ticket: 12_345 };
const clientTicketObservation = { client: "f".repeat(16), maxTicket: 12_345, samples: 4 };
const runtimeObservation = { editorVersion: "3.2.206", actor: { uuid: "1".repeat(32), username: "fixture-user", nickname: "Fixture" },
  clockSamples: Array.from({ length: 4 }, (_, index) => ({ rendererBeforeMs: 1000 + index * 3,
    serverTimeMs: 1001 + index * 3, rendererAfterMs: 1002 + index * 3 })),
  backendActorVerified: false, backendClockVerified: false, clockProducerOwnershipVerified: false };
interface Options { before?: string; afterRpc?: string; afterIdentity?: string; afterClock?: string; fastDeadline?: boolean; closedTarget?: boolean }
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
globalThis.workerClient=${JSON.stringify(clientTicketObservation.client)};globalThis.workerMaxTicket=${String(clientTicketObservation.maxTicket)};
class Bus{async rpcCall(topic,args,timeout){if(this!==gVars.messageBus||timeout!==0||!Array.isArray(args))throw new Error('PRIVATE');calls.push([topic,[...args]]);if(topic==='/PrjDB/symbol/getData'){if(args.length!==2||args[0]!==metadata.uuid||args[1]!==target.projectUuid)throw new Error('PRIVATE');}else if(['/PrjDB/project/getData','/PrjDB/project/getClient','/PrjDB/project/getMaxTicket'].includes(topic)){if(args.length!==1||args[0]!==target.projectUuid)throw new Error('PRIVATE');}else throw new Error('PRIVATE');await Promise.resolve();${options.afterRpc ?? ""}return{message:topic==='/PrjDB/symbol/getData'?metadata:topic==='/PrjDB/project/getClient'?workerClient:topic==='/PrjDB/project/getMaxTicket'?workerMaxTicket:projectDetail};}}
globalThis.gVars={currentProject:{projectId:target.projectUuid,branchUuid:target.branchUuid,isV2Format:false},isHistoryMode:false,messageBus:new Bus()};
globalThis.UI={gVars,tabBar:Tabs};globalThis.eda={extensionUuid:'7e06d286b1ac846ef7eab9c7f2a9ee40'};
globalThis.attributes={c_dbid:target.tabId,c_doctype:'3',src:'editor?entry=pcb','pcb-canvas':'true'};
globalThis.frame={tagName:'IFRAME',id:'frame_'+target.tabId,ownerDocument:document,isConnected:true,contentWindow:child,classList:{contains(name){return name==='editframe';}},getAttribute(name){return attributes[name]??null;},hasAttribute(name){return Object.hasOwn(attributes,name);},parentElement:{getAttribute(name){return name==='uuid'?target.tabId:null;}}};
child.document={defaultView:child,nodeType:9};child.frameElement=frame;child.parent=globalThis;child.top=globalThis;
${options.closedTarget === true ? `
globalThis.PRO_EDITOR_VERSION='3.2.206';globalThis._TAB_ID_='1'.repeat(16);
gVars.globalVariableCookieData={userInfo:${JSON.stringify(runtimeObservation.actor)}};gVars.loginedUserInfo=${JSON.stringify(runtimeObservation.actor)};
globalThis.clockTick=1000;globalThis.clockCalls=0;Date.now=function(){return clockTick++;};
class ClockBus{async rpcCall(...args){if(this!==gVars.concurrentBus||args.length!==1||args[0]!=='/pro-mgr/serverTime/now')throw new Error('PRIVATE');clockCalls++;await Promise.resolve();${options.afterClock ?? ""}return clockTick++;}}
gVars.concurrentBus=new ClockBus();globalThis['/'+_TAB_ID_+'/notify']=gVars.concurrentBus;
globalThis.extraMarkers=[];globalThis.extraIframes=[];globalThis.outsideIframes=[];
globalThis.domRoot={tagName:'DIV',ownerDocument:document,isConnected:true,children:[],querySelectorAll(selector){if(selector!=='iframe')throw new Error('PRIVATE');return[frame,...extraIframes];}};
globalThis.activeBody=frame.parentElement;Object.assign(activeBody,{tagName:'DIV',ownerDocument:document,isConnected:true,parentElement:domRoot,children:[frame],classList:{contains(name){return ['tabbar-panel','ruler-theme'].includes(name);}}});
domRoot.children=['commandWin','exitSmartSizeTool','exitPadShapeTool','project-blank-page','assembly-variant-page'].map(id=>({id,tagName:'DIV',ownerDocument:document,isConnected:true,parentElement:domRoot,getAttribute(){return null;}}));domRoot.children.push(activeBody);
document.querySelectorAll=function(selector){if(selector==='[id="tabbar_bodies"]')return[domRoot];if(selector==='iframe')return[frame,...extraIframes,...outsideIframes];if(selector.startsWith('[id="frame_'))return[frame];if(selector.startsWith('.editframe,'))return[frame,...extraMarkers];throw new Error('PRIVATE');};
` : ""}
${options.before ?? ""}`, context);
  const program = options.closedTarget === true ? buildCurrentClosedSymbolMetadataProgram(request) : buildCurrentSymbolMetadataProgram(request);
  return { run: (): Promise<unknown> => Promise.resolve(runInContext(`(async()=>{${program}})()`, context, { timeout: 1000 }) as unknown),
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

void test("symbol metadata decoder retains the native UTF-16 string limits", async () => {
  const raw: unknown = decodeExactReadEnvelope(await fixture().run()); assert.ok(raw !== null && typeof raw === "object");
  for (const [field, maximum] of [["name", 512], ["description", 65_536], ["source", 4096], ["version", 128]] as const) {
    const boundary = "😀".repeat(maximum / 2);
    validateCurrentSymbolMetadataResult(request, { ...raw, value: { ...value, [field]: boundary } });
    assert.throws(() => validateCurrentSymbolMetadataResult(request, { ...raw, value: { ...value, [field]: `${boundary}x` } }), /UTF-16/u);
  }
  assert.throws(() => validateCurrentSymbolMetadataResult(request, { ...raw, value: { ...value, tagsJson: JSON.stringify([`${"😀".repeat(256)}x`]) } }));
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

void test("internal closed-symbol program proves exact ordinary DOM scope without broadening the public reader", async () => {
  const env = fixture({ closedTarget: true });
  const result = validateCurrentClosedSymbolMetadataResult(request, decodeExactReadEnvelope(await env.run()));
  assert.deepEqual(result.value, value); assert.equal(result.hiddenEditorsVerified, true);
  assert.deepEqual(result.clientTicketObservation, clientTicketObservation);
  assert.deepEqual(result.runtimeObservation, runtimeObservation); assert.equal(env.evaluate("clockCalls"), 4);
  assert.equal(env.evaluate("calls.length"), 14); assert.equal(env.evaluate("child.identityCalls"), 4);
  assert.equal(env.evaluate("JSON.stringify(calls.map(call=>call[0]))"), JSON.stringify([
    "/PrjDB/project/getClient", "/PrjDB/project/getMaxTicket", "/PrjDB/project/getData", "/PrjDB/symbol/getData", "/PrjDB/project/getData",
    "/PrjDB/project/getClient", "/PrjDB/project/getMaxTicket",
    "/PrjDB/project/getClient", "/PrjDB/project/getMaxTicket", "/PrjDB/project/getData", "/PrjDB/symbol/getData", "/PrjDB/project/getData",
    "/PrjDB/project/getClient", "/PrjDB/project/getMaxTicket",
  ]));
  for (const key of ["workerIdentityVerified", "cadAuthority", "persistenceVerified", "sourceMembershipVerified"] as const) { assert.equal(result[key], false); }
  assert.throws(() => validateCurrentSymbolMetadataResult(request, result));
  const projection = currentClosedSymbolMetadataProjection(result);
  assert.equal(projection.hiddenEditorsVerified, false); assert.deepEqual(projection.value, value);
  assert.equal(Object.hasOwn(projection, "clientTicketObservation"), false);
  assert.equal(Object.hasOwn(projection, "runtimeObservation"), false);
  assert.throws(() => validateCurrentClosedSymbolMetadataResult(request, projection));
  for (const invalid of [{ ...result, workerIdentityVerified: true }, { ...result, hiddenEditorsVerified: false }, { ...result, writerReady: true }]) {
    assert.throws(() => validateCurrentClosedSymbolMetadataResult(request, invalid));
  }
});

void test("internal closed-symbol runtime observations retain both actors and clock owners across awaits", async () => {
  for (const afterRpc of ["if(calls.length===1)gVars.loginedUserInfo={...gVars.loginedUserInfo};",
    "if(calls.length===1)gVars.globalVariableCookieData.userInfo={...gVars.globalVariableCookieData.userInfo};",
    "if(calls.length===1)gVars.loginedUserInfo.username+='changed';",
    "if(calls.length===1)gVars.globalVariableCookieData.userInfo.nickname+='changed';"]) {
    const env = fixture({ closedTarget: true, afterRpc });
    await assert.rejects(env.run(), { message: "CURRENT_SYMBOL_METADATA_READ_FAILED" }); assert.equal(env.evaluate("calls.length"), 1);
  }
  for (const afterClock of ["gVars.concurrentBus=new ClockBus();", "globalThis['/'+_TAB_ID_+'/notify']=new ClockBus();",
    "Date.now=function(){return clockTick++;};", "globalThis.Date=function(){};", "gVars.globalVariableCookieData={...gVars.globalVariableCookieData};",
    "gVars.loginedUserInfo.nickname+='changed';"]) {
    const env = fixture({ closedTarget: true, afterClock });
    await assert.rejects(env.run(), { message: "CURRENT_SYMBOL_METADATA_READ_FAILED" });
    assert.equal(env.evaluate("clockCalls"), 1); assert.equal(env.evaluate("calls.length"), 0);
  }
  const accessor = fixture({ closedTarget: true, before:
    "Object.defineProperty(gVars.loginedUserInfo,'nickname',{get(){getterReads++;throw new Error('PRIVATE');}});" });
  await assert.rejects(accessor.run(), { message: "CURRENT_SYMBOL_METADATA_READ_FAILED" }); assert.equal(accessor.evaluate("getterReads"), 0);
});

void test("internal closed-symbol clock requires bare safe scalars inside monotone bounded renderer brackets", async () => {
  for (const afterClock of ["return{message:clockTick};", "return Number.MAX_SAFE_INTEGER+1;", "return -0;",
    "return clockTick+5;", "if(clockCalls===2){clockTick=1;return 1;}", "clockTick+=10001;"]) {
    const env = fixture({ closedTarget: true, afterClock });
    await assert.rejects(env.run(), { message: "CURRENT_SYMBOL_METADATA_READ_FAILED" });
  }
  const betweenSamples = fixture({ closedTarget: true, afterRpc: "if(calls.length===7)clockTick=999;" });
  await assert.rejects(betweenSamples.run(), { message: "CURRENT_SYMBOL_METADATA_READ_FAILED" });
  assert.equal(betweenSamples.evaluate("clockCalls"), 2);
  const valid = validateCurrentClosedSymbolMetadataResult(request, decodeExactReadEnvelope(await fixture({ closedTarget: true }).run()));
  for (const observed of [{ ...runtimeObservation, backendActorVerified: true }, { ...runtimeObservation, backendClockVerified: true },
    { ...runtimeObservation, clockProducerOwnershipVerified: true }, { ...runtimeObservation, clockSamples: runtimeObservation.clockSamples.slice(1) },
    { ...runtimeObservation, clockSamples: runtimeObservation.clockSamples.toReversed() },
    { ...runtimeObservation, actor: { ...runtimeObservation.actor, credentials: "forbidden" } },
    { ...runtimeObservation, clockSamples: [{ rendererBeforeMs: -0, serverTimeMs: 1001, rendererAfterMs: 1002 }, ...runtimeObservation.clockSamples.slice(1)] }]) {
    assert.throws(() => validateCurrentClosedSymbolMetadataResult(request, { ...valid, runtimeObservation: observed }));
  }
});

void test("internal closed-symbol scalar observations reject malformed values, nonmatching samples and accessor envelopes", async () => {
  for (const before of ["workerClient=undefined;", "workerClient='';", "workerClient='f'.repeat(17);", "workerClient='F'.repeat(16);",
    "workerClient=17;", "workerMaxTicket=NaN;", "workerMaxTicket=Infinity;", "workerMaxTicket=-0;", "workerMaxTicket=-1;",
    "workerMaxTicket=Number.MAX_SAFE_INTEGER+1;", "workerMaxTicket=1.5;", "workerMaxTicket='12345';", "workerMaxTicket=12344;"]) {
    const env = fixture({ closedTarget: true, before });
    await assert.rejects(env.run(), { message: "CURRENT_SYMBOL_METADATA_READ_FAILED" });
  }
  for (const afterRpc of ["if(calls.length===6)workerClient='a'.repeat(16);", "if(calls.length===7)workerMaxTicket++;",
    "if(calls.length===8)workerClient='a'.repeat(16);", "if(calls.length===14)workerMaxTicket++;",
    "if(topic==='/PrjDB/project/getClient')return Object.create({message:workerClient});",
    "if(topic==='/PrjDB/project/getMaxTicket')return{get message(){getterReads++;throw new Error('PRIVATE');}};"]) {
    const env = fixture({ closedTarget: true, afterRpc });
    await assert.rejects(env.run(), { message: "CURRENT_SYMBOL_METADATA_READ_FAILED" });
    assert.equal(env.evaluate("getterReads"), 0);
  }
  for (const count of [1, 2, 6, 7, 8, 9, 13, 14]) {
    const env = fixture({ closedTarget: true, afterRpc: `if(calls.length===${String(count)})gVars.messageBus=new Bus();` });
    await assert.rejects(env.run(), { message: "CURRENT_SYMBOL_METADATA_READ_FAILED" });
    assert.equal(env.evaluate("calls.length"), count);
  }
});

void test("internal closed-symbol result validator rejects forged scalar witness fields without expanding public results", async () => {
  const result = validateCurrentClosedSymbolMetadataResult(request, decodeExactReadEnvelope(await fixture({ closedTarget: true }).run()));
  for (const observation of [undefined, null, {}, { ...clientTicketObservation, client: "a".repeat(32) },
    { ...clientTicketObservation, maxTicket: -0 }, { ...clientTicketObservation, maxTicket: "12345" },
    { ...clientTicketObservation, maxTicket: 12_344 }, { ...clientTicketObservation, maxTicket: Number.MAX_SAFE_INTEGER + 1 },
    { ...clientTicketObservation, samples: 2 }, { ...clientTicketObservation, workerIdentityVerified: true }]) {
    assert.throws(() => validateCurrentClosedSymbolMetadataResult(request, { ...result, clientTicketObservation: observation }));
  }
  const publicResult = decodeExactReadEnvelope(await fixture().run());
  assert.ok(publicResult !== null && typeof publicResult === "object");
  assert.throws(() => validateCurrentSymbolMetadataResult(request, { ...publicResult, clientTicketObservation }));
});

void test("internal closed-symbol program refuses tabless symbol, export and pooled editors before RPC", async () => {
  for (const before of [
    "extraMarkers.push({tagName:'DIV',id:'frame_'+metadata.uuid+'@'+target.projectUuid});",
    "extraMarkers.push({tagName:'IFRAME',id:'frame_export_'+metadata.uuid});",
    "extraMarkers.push({tagName:'IFRAME',blankIframe:'panel'});",
    "extraIframes.push({tagName:'IFRAME'});",
    "outsideIframes.push({tagName:'IFRAME'});",
    "domRoot.children[0]={...domRoot.children[0],id:'unknown-static'};",
    "domRoot.children[1]={...domRoot.children[1],id:'commandWin'};",
    "activeBody.children=[];", "activeBody.parentElement={};",
    "activeBody.classList.contains=name=>name==='tabbar-panel'||name==='ruler-theme'||name==='blankIframeDiv';",
  ]) {
    const env = fixture({ closedTarget: true, before });
    await assert.rejects(env.run(), { message: "CURRENT_SYMBOL_METADATA_READ_FAILED" });
    assert.equal(env.evaluate("calls.length"), 0); assert.equal(env.evaluate("child.identityCalls"), 0);
  }
});

void test("internal closed-symbol program rechecks DOM identity after native awaits", async () => {
  for (const afterRpc of [
    "if(calls.length===1)extraMarkers.push({tagName:'DIV',id:'frame_orphan'});",
    "if(calls.length===1)extraIframes.push({tagName:'IFRAME'});",
    "if(calls.length===1)outsideIframes.push({tagName:'IFRAME'});",
    "if(calls.length===1)domRoot.children[0]={...domRoot.children[0]};",
    "if(calls.length===1)domRoot.querySelectorAll=function(){return[frame];};",
    "if(calls.length===1)activeBody.classList={contains:activeBody.classList.contains};",
    "if(calls.length===1)activeBody.children.push({tagName:'DIV'});",
  ]) {
    const env = fixture({ closedTarget: true, afterRpc });
    await assert.rejects(env.run(), { message: "CURRENT_SYMBOL_METADATA_READ_FAILED" });
    assert.equal(env.evaluate("calls.length"), 1);
  }
  const changed = fixture({ closedTarget: true, afterIdentity: "if(identityCalls===1)parent.extraMarkers.push({id:'frame_export_hidden'});" });
  await assert.rejects(changed.run(), { message: "CURRENT_SYMBOL_METADATA_READ_FAILED" });
  assert.equal(changed.evaluate("calls.length"), 0);
});
