import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { sha256Text } from "../src/core.ts";
import { CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION, CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION_SHA256,
  currentPcbDiagnosticPcbOpeningArguments, decodeCurrentPcbDiagnosticPcbOpeningReply } from "../src/current-pcb-diagnostic-pcb-opening.ts";
import type { CurrentPcbDiagnosticPcbOpeningPhase, CurrentPcbDiagnosticPcbOpeningResult } from "../src/current-pcb-diagnostic-pcb-opening.ts";
import { CURRENT_PCB_209_RATLINE_OPENING_FUNCTION, CURRENT_PCB_209_RATLINE_OPENING_MAX_MS,
  currentPcb209RatlineOpeningAcknowledged } from "../src/current-pcb-209-ratline-opening-program.ts";

const rawWindowsPath = String.raw`C:\Disposable\Selected.eprj2`;
const target = { rawWindowsPath, projectUuid: sha256Text(rawWindowsPath), branchUuid: "b".repeat(32),
  documentUuid: "d".repeat(16), expectedSourceSha256: "e".repeat(64) };
interface Options { readonly before?: string; readonly afterRegistry?: string; readonly openBody?: string; readonly nativeBody?: string; readonly fastDeadline?: boolean;
  readonly program?: string; readonly nativeRemainingMilliseconds?: number; }
function fixture(options: Options = {}): Readonly<{
  run: (phase: CurrentPcbDiagnosticPcbOpeningPhase) => Promise<CurrentPcbDiagnosticPcbOpeningResult>;
  evaluate: (source: string) => unknown;
}> {
  const context = createContext({ clearTimeout, setTimeout: options.fastDeadline === true
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Preserve the browser timer signature, shortening only the self-authored fixture deadline.
    ? (callback: () => void): ReturnType<typeof setTimeout> => setTimeout(callback, 1) : setTimeout });
  runInContext(`globalThis.window=globalThis;globalThis.top=globalThis;globalThis.target=${JSON.stringify(target)};
globalThis.tabId=target.documentUuid+"@"+target.projectUuid;
globalThis.location={href:"https://client/editor?cll=warn#id="+target.projectUuid,origin:"https://client"};
globalThis.frames=[];globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href,querySelectorAll(selector){if(selector!=="iframe")throw new Error("QUERY");return frames;}};
globalThis.PRO_EDITOR_MODE="CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM";globalThis._TAB_ID_="original-window";
globalThis.start={tabId:"tab_page1",data:{doctype:-1},isAbleDelete:false,group:"start_blank",draggable:true,isDisplayNone:false};
globalThis.info={id:"editor-window-main",belong:"editor-window-main",tabs:[start],activeTabId:"tab_page1"};
class Tabs{static containerIds=["editor-window-main"];static containerTree={id:"editor-window-main"};static belongContainer="editor-window-main";static currentTabId="tab_page1";static getActiveTab(){return this.currentTabId;}static getContainerInfo(id){return id===info.id?info:null;}static getTabById(id){return info.tabs.find(t=>t.tabId===id)??null;}}
globalThis.getterCalls=0;globalThis.registryCalls=0;globalThis.documentCalls=0;globalThis.nativeCalls=0;
globalThis.registration={[target.projectUuid]:{path:target.rawWindowsPath,isCbb:false}};
class Registry{async rpcCall(topic,args,timeout){if(this!==gVars.messageBus||topic!=="/pro-mgr/api/client/getProjectPaths"||Object.keys(args).length||timeout!==0)throw new Error("REGISTRY");registryCalls++;await Promise.resolve();${options.afterRegistry ?? ""}return {message:{success:true,result:registration}};}}
class Api{async rpcCall(topic,args){if(this!==gVars.extensionApiMessageBus2||arguments.length!==2||topic!=="extensionApi.DMT_EditorControl.openDocument"||Reflect.ownKeys(args).length!==2||args.documentUuid!==target.documentUuid||!Object.hasOwn(args,"splitScreenId")||args.splitScreenId!==undefined)throw new Error("OPEN");documentCalls++;await Promise.resolve();${options.openBody ?? "opened();return tabId;"}}}
globalThis.gVars={currentProject:{projectId:target.projectUuid,branchUuid:target.branchUuid,isV2Format:false},isHistoryMode:false,messageBus:new Registry(),extensionApiMessageBus2:new Api()};
globalThis._MSG_BUS2_EXTAPI_=gVars.extensionApiMessageBus2;globalThis.UI={gVars,tabBar:Tabs};
globalThis.opened=()=>{
const tab={tabId,data:{doctype:3,pid:target.projectUuid},parentProjectUuid:target.projectUuid};
info.tabs.push(tab);info.activeTabId=tabId;Tabs.currentTabId=tabId;
location.href=location.href.split("#")[0]+"#id="+target.projectUuid+",tab=*"+tabId;document.URL=location.href;
globalThis.attrs={id:"frame_"+tabId,c_dbid:tabId,c_doctype:"3",src:"editor?entry=pcb","pcb-canvas":"true"};
globalThis.frame={tagName:"IFRAME",id:attrs.id,ownerDocument:document,isConnected:true,
parentElement:{getAttribute(key){return key==="uuid"?tabId:null;}},
classList:{contains(key){return key==="editframe";}},
getAttribute(key){return attrs[key]??null;},hasAttribute(key){return Object.hasOwn(attrs,key);}};
class Native{async rpcCall(topic,args,timeout){if(this!==child.MSG_BUS_PCB.messageBus||topic!=="getTabIdAndDocType"||args!==undefined||timeout!==0)throw new Error("NATIVE");nativeCalls++;await Promise.resolve();${options.nativeBody ?? "return {message:{tabId,docType:3}};"}}}
globalThis.child={parent:globalThis,top:globalThis,frameElement:frame,Object,location:{href:"https://client/editor?entry=pcb"},MSG_BUS_PCB:{messageBus:new Native()}};
child.document={defaultView:child,nodeType:9};frame.contentWindow=child;frames.push(frame);
};
${options.before ?? ""}`, context, { timeout: 1000 });
  return {
    run: async (phase): Promise<CurrentPcbDiagnosticPcbOpeningResult> => {
      const value: unknown = await (runInContext(`(${options.program ?? CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION})(target,${JSON.stringify(phase)},${String(options.nativeRemainingMilliseconds)})`,
        context, { timeout: 1000 }) as unknown);
      return decodeCurrentPcbDiagnosticPcbOpeningReply({ result: { type: "string", value } }, target, phase);
    },
    evaluate: (source): unknown => runInContext(source, context, { timeout: 1000 }) as unknown,
  };
}

void test("ratline opening survives deliberate pauses beyond45s using only the native remaining allowance", async context => {
  context.mock.timers.enable({ apis: ["setTimeout"] });
  const env = fixture({ program: CURRENT_PCB_209_RATLINE_OPENING_FUNCTION, nativeRemainingMilliseconds: 60_000,
    openBody: "await new Promise(resolve=>setTimeout(resolve,46000));opened();return tabId;" });
  const work = env.run("open-document");
  // The synthetic API must be entered before advancing the browser timer.
  for (let index = 0; index < 20 && env.evaluate("documentCalls") === 0; index += 1) { await Promise.resolve(); }
  assert.equal(env.evaluate("documentCalls"), 1); await Promise.resolve();
  context.mock.timers.tick(45_000); await Promise.resolve();
  context.mock.timers.tick(1000); const result = await work;
  assert.equal(result.ok, true); assert.equal(currentPcb209RatlineOpeningAcknowledged(result), true);
  assert.equal(env.evaluate("documentCalls"), 1);
});

void test("aged ratline navigation times out once and refused replies are never acknowledged", async context => {
  context.mock.timers.enable({ apis: ["setTimeout"] });
  const env = fixture({ program: CURRENT_PCB_209_RATLINE_OPENING_FUNCTION, nativeRemainingMilliseconds: 1234,
    openBody: "await new Promise(()=>{});" });
  const work = env.run("open-document");
  for (let index = 0; index < 20 && env.evaluate("documentCalls") === 0; index += 1) { await Promise.resolve(); }
  assert.equal(env.evaluate("documentCalls"), 1); context.mock.timers.tick(1234);
  const result = await work; assert.equal(result.ok, false); assert.equal(result.failure?.code, "TIMEOUT");
  assert.equal(result.dispatchAttempted, true); assert.equal(result.nativeWorkMayRemain, true);
  assert.equal(currentPcb209RatlineOpeningAcknowledged(result), false);
  assert.equal(currentPcb209RatlineOpeningAcknowledged(null), false); assert.equal(env.evaluate("documentCalls"), 1);
});

void test("ratline native deadline data refuses missing, expired, oversized and wrong-phase grants before dispatch", async () => {
  for (const nativeRemainingMilliseconds of [undefined, 0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, CURRENT_PCB_209_RATLINE_OPENING_MAX_MS + 1]) {
    const env = fixture({ program: CURRENT_PCB_209_RATLINE_OPENING_FUNCTION, ...(nativeRemainingMilliseconds === undefined ? {} : { nativeRemainingMilliseconds }) });
    const result = await env.run("open-document"); assert.equal(result.ok, false); assert.equal(result.dispatchAttempted, false);
    assert.equal(env.evaluate("documentCalls+registryCalls"), 0);
  }
  const env = fixture({ program: CURRENT_PCB_209_RATLINE_OPENING_FUNCTION, nativeRemainingMilliseconds: 1234 });
  const wrongPhase = await env.run("preflight"); assert.equal(wrongPhase.ok, false); assert.equal(env.evaluate("registryCalls"), 0);
  const preflight = fixture({ program: CURRENT_PCB_209_RATLINE_OPENING_FUNCTION, nativeRemainingMilliseconds: 0 });
  const ready = await preflight.run("preflight"); assert.equal(ready.ok, true);
  assert.equal(currentPcb209RatlineOpeningAcknowledged(ready), false);
});

void test("fixed PCB opening separates empty-editor preflight, one dispatch and native frame observation", async () => {
  const env = fixture(), preflight = await env.run("preflight");
  assert.equal(preflight.ok, true); assert.equal(preflight.status, "ready"); assert.equal(preflight.dispatchAttempted, false);
  assert.equal(env.evaluate("documentCalls+nativeCalls"), 0);
  const opened = await env.run("open-document");
  assert.equal(opened.ok, true); assert.equal(opened.publicResult, `${target.documentUuid}@${target.projectUuid}`);
  assert.equal(opened.dispatchAttempted, true); assert.equal(opened.frameObserved, false);
  assert.equal(env.evaluate("documentCalls"), 1); assert.equal(env.evaluate("nativeCalls"), 0);
  const observed = await env.run("observe");
  assert.equal(observed.ok, true); assert.equal(observed.status, "frame-observed"); assert.equal(observed.frameObserved, true);
  assert.equal(observed.dispatchAttempted, false); assert.equal(env.evaluate("documentCalls"), 1);
  assert.equal(env.evaluate("nativeCalls"), 2); assert.equal(observed.frameSourceVerified, false);
  assert.equal(observed.persistenceVerified, false); assert.equal(observed.executionAuthorized, false);
  assert.equal(env.evaluate("getterCalls"), 0); assert.ok(Object.isFrozen(observed));
  assert.ok(!JSON.stringify(observed).includes(rawWindowsPath));
  assert.equal(CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION_SHA256, sha256Text(CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION));
  assert.equal(currentPcbDiagnosticPcbOpeningArguments(target, "observe").length, 2);
});

void test("PCB preflight refuses mixed/restored tabs, split containers, branch or registered source drift before dispatch", async () => {
  for (const before of [
    "opened();",
    'info.tabs.push({tabId:"foreign",data:{doctype:3,pid:"foreign"}});',
    'Tabs.containerIds.push("split");',
    'Tabs.containerTree.children=[{id:"editor-window-main"}];',
    'gVars.currentProject.branchUuid="a".repeat(32);',
    "gVars.isHistoryMode=true;", "gVars.currentProject.isV2Format=true;",
    'registration[target.projectUuid].path="C:/wrong.eprj2";',
    "registration[target.projectUuid].isCbb=true;",
    'Object.defineProperty(start.data,"pid",{get(){getterCalls++;throw new Error("GETTER");}});',
    "frames.push({});", "globalThis._MSG_BUS2_EXTAPI_={};",
  ]) {
    const env = fixture({ before }), observed = await env.run("open-document");
    assert.equal(observed.ok, false, before); assert.equal(observed.dispatchAttempted, false, before);
    assert.equal(env.evaluate("documentCalls+getterCalls"), 0, before);
  }
  for (const afterRegistry of ["gVars.currentProject={...gVars.currentProject};", "Api.prototype.rpcCall=async()=>tabId;",
    'globalThis._TAB_ID_="changed";']) {
    const env = fixture({ afterRegistry }), observed = await env.run("open-document");
    assert.equal(observed.ok, false); assert.equal(observed.dispatchAttempted, false);
    assert.equal(env.evaluate("documentCalls"), 0);
  }
});

void test("unknown acknowledgements, timeout and post-open mismatch preserve consumed dispatch without publishing private replies", async () => {
  for (const openBody of [
    'return "private-title".repeat(10000);',
    "opened();return undefined;",
    'opened();gVars.currentProject.branchUuid="a".repeat(32);return tabId;',
    "opened();frames.push({});return tabId;",
    'opened();throw new Error("PRIVATE_ERROR");',
    "await new Promise(()=>{});",
  ]) {
    const env = fixture({ openBody, fastDeadline: true }), observed = await env.run("open-document");
    assert.equal(observed.ok, false); assert.equal(observed.dispatchAttempted, true);
    assert.equal(observed.nativeWorkMayRemain, true); assert.equal(env.evaluate("documentCalls"), 1);
    assert.doesNotMatch(JSON.stringify(observed), /private-title|PRIVATE_ERROR/u);
  }
});

void test("separate PCB observation refuses unready or mismatched child identities and never opens a document", async () => {
  for (const after of [
    'attrs.c_dbid="foreign";', 'attrs.src="editor?entry=sch";', "attrs.blankIframe='pcb';",
    "child.MSG_BUS_PCB=undefined;", "frame.isConnected=false;",
    'child.location.href="https://foreign/editor?entry=pcb";',
    "child.frameElement={};", "frame.parentElement.getAttribute=()=>null;",
    "child.document.defaultView={};", "info.tabs.push({...info.tabs[1]});",
  ]) {
    const env = fixture({ before: `opened();${after}` }), observed = await env.run("observe");
    assert.equal(observed.ok, false, after); assert.equal(observed.dispatchAttempted, false);
    assert.equal(observed.frameObserved, false); assert.equal(env.evaluate("documentCalls"), 0);
  }
  const env = fixture({ before: "opened();", nativeBody: 'return {message:{tabId:"",docType:0}};' });
  const observed = await env.run("observe");
  assert.equal(observed.ok, false); assert.equal(env.evaluate("documentCalls"), 0);
});

void test("PCB reply decoder rejects extra authority, target drift and contradictory stage results", async () => {
  const observed = await fixture().run("preflight");
  const { frameSourceVerified: _frame, restorationCompletionVerified: _restored, startupQualified: _startup,
    persistenceVerified: _saved, queueCompletionVerified: _queue, executionAuthorized: _authority,
    nativeIntrinsicsVerified: _intrinsics, ...raw } = observed;
  for (const change of [
    { executionAuthorized: true }, { projectUuid: "a".repeat(64) }, { phase: "observe" },
    { frameObserved: true }, { dispatchAttempted: true }, { status: "opened" }, { windowTabId: null },
  ]) {
    assert.throws(() => decodeCurrentPcbDiagnosticPcbOpeningReply(
      { result: { type: "string", value: JSON.stringify({ ...raw, ...change }) } }, target, "preflight"), /PCB_OPENING_REPLY/u);
  }
  let reads = 0;
  const hostile = Object.defineProperty({}, "result", { get(): never { reads += 1; throw new Error("GETTER"); } });
  assert.throws(() => decodeCurrentPcbDiagnosticPcbOpeningReply(hostile, target, "preflight"), /PCB_OPENING_REPLY/u);
  assert.equal(reads, 0);
});
