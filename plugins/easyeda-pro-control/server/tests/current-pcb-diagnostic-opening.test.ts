import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { sha256Text } from "../src/core.ts";
import type { CurrentPcbDiagnosticOpeningPhase, CurrentPcbDiagnosticOpeningResult } from "../src/current-pcb-diagnostic-opening.ts";
import { CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION, CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION_SHA256,
  currentPcbDiagnosticOpeningArguments, decodeCurrentPcbDiagnosticOpeningReply } from "../src/current-pcb-diagnostic-opening.ts";

const rawWindowsPath = String.raw`C:\Disposable\Selected.eprj2`;
const target = { rawWindowsPath, projectUuid: sha256Text(rawWindowsPath), branchUuid: "b".repeat(32),
  documentUuid: "d".repeat(16), expectedSourceSha256: "e".repeat(64) };
interface Options { before?: string; afterRegistry?: string; projectBody?: string; projectEvent?: string; subscriptionBody?: string; fastDeadline?: boolean; }
function fixture(options: Options = {}): { run: (phase: CurrentPcbDiagnosticOpeningPhase) => Promise<CurrentPcbDiagnosticOpeningResult>; evaluate: (source: string) => unknown } {
  const context = createContext({ clearTimeout, setTimeout: options.fastDeadline === true
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Preserve the browser timer interface while shortening only the synthetic deadline.
    ? (callback: () => void): ReturnType<typeof setTimeout> => setTimeout(callback, 1) : setTimeout });
  runInContext(`globalThis.window=globalThis;globalThis.top=globalThis;globalThis.target=${JSON.stringify(target)};
globalThis.location={href:'https://client/editor?cll=warn#',origin:'https://client'};
globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href,title:'EasyEDA Pro - V3.2.196',querySelector(selector){if(selector!=='meta[name="editorMainVersion"]')throw new Error('PRIVATE_SELECTOR');return meta;}};
globalThis.meta={ownerDocument:document,nodeType:1,localName:'meta',getAttribute(name){if(name!=='content')throw new Error('PRIVATE_ATTRIBUTE');return '3.2.196';}};
globalThis.PRO_EDITOR_MODE='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM';globalThis._TAB_ID_='original-window';
globalThis.start={tabId:'tab_page1',data:{doctype:-1},isAbleDelete:false,group:'start_blank',draggable:true,isDisplayNone:false};
globalThis.info={id:'editor-window-main',belong:'editor-window-main',tabs:[start],activeTabId:'tab_page1'};
class Tabs{static containerIds=['editor-window-main'];static containerTree={id:'editor-window-main'};static belongContainer='editor-window-main';static currentTabId='tab_page1';static getActiveTab(){return this.currentTabId;}static getContainerInfo(id){return id===info.id?info:null;}static getTabById(id){return info.tabs.find(tab=>tab.tabId===id)??null;}}
globalThis.registryCalls=0;globalThis.projectCalls=0;globalThis.getterCalls=0;globalThis.cancelCalls=0;globalThis.listeners=[];
class Task{constructor(callback){this.callback=callback;this.isRunning=true;}cancel(){cancelCalls++;this.callback=null;this.isRunning=false;}}
globalThis.publish=(...args)=>{for(const task of listeners)if(task.isRunning)task.callback(...args);};
globalThis.registration={[target.projectUuid]:{path:target.rawWindowsPath,isCbb:false}};
class Registry{async rpcCall(topic,args,timeout){if(this!==gVars.messageBus||topic!=='/pro-mgr/api/client/getProjectPaths'||Object.keys(args).length||timeout!==0)throw new Error('PRIVATE_REGISTRY');registryCalls++;await Promise.resolve();${options.afterRegistry ?? ""}return {message:{success:true,result:registration},bridge:undefined,source:undefined};}subscribe(topic,callback){if(this!==gVars.messageBus||topic!=='loadProjectCompleted')throw new Error('PRIVATE_SUBSCRIPTION');const task=new Task(callback);listeners.push(task);${options.subscriptionBody ?? ""}return task;}}
class Api{async rpcCall(topic,id){if(this!==gVars.extensionApiMessageBus2||arguments.length!==2||topic!=='extensionApi.DMT_Project.openProject'||id!==target.projectUuid)throw new Error('PRIVATE_OPEN');projectCalls++;await Promise.resolve();const result=await(async()=>{${options.projectBody ?? "openedProject();return true;"}})();${options.projectEvent ?? "if(result===true)publish(null,undefined,undefined);"}return result;}}
globalThis.gVars={client:{},currentProject:{projectId:undefined,branchUuid:''},isHistoryMode:false,messageBus:new Registry(),extensionApiMessageBus2:new Api()};
globalThis._MSG_BUS2_EXTAPI_=gVars.extensionApiMessageBus2;globalThis.UI={gVars,tabBar:Tabs};
globalThis.openedProject=()=>{gVars.currentProject={projectId:target.projectUuid,branchUuid:target.branchUuid,isV2Format:false};gVars.client.currentProjectName='Selected';document.title='Selected | EasyEDA Pro - V3.2.196';location.href=location.href.split('#')[0]+'#id='+target.projectUuid;document.URL=location.href;};
${options.before ?? ""}`, context, { timeout: 1000 });
  return {
    run: async (phase): Promise<CurrentPcbDiagnosticOpeningResult> => {
      const value: unknown = await (runInContext(`(${CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION})(target,${JSON.stringify(phase)})`, context, { timeout: 1000 }) as unknown);
      return decodeCurrentPcbDiagnosticOpeningReply({ result: { type: "string", value } }, target, phase);
    },
    evaluate: (source): unknown => runInContext(source, context, { timeout: 1000 }) as unknown,
  };
}
async function flush(): Promise<void> { for (let i = 0; i < 30; i += 1) { await Promise.resolve(); } }
function resultReply(result: CurrentPcbDiagnosticOpeningResult, change: Record<string, unknown> = {}): unknown {
  const { startupQualified: _startup, restorationCompletionVerified: _restoration, persistenceVerified: _persistence,
    compilerOwnerVerified: _compiler, queueCompletionVerified: _queues, executionAuthorized: _execution,
    nativeIntrinsicsVerified: _intrinsics, ...raw } = result;
  return { result: { type: "string", value: JSON.stringify({ ...raw, ...change }) } };
}

void test("fixed opening preflight validates the registered disposable without opening or subscribing", async () => {
  const env = fixture(), result = await env.run("preflight");
  assert.equal(result.ok, true); assert.equal(result.status, "ready"); assert.equal(result.dispatchAttempted, false);
  assert.equal(result.observation?.projectPresent, false); assert.equal(result.nativeWorkMayRemain, false);
  assert.equal(result.observation.initialTitle, "EasyEDA Pro - V3.2.196");
  assert.equal(result.observation.expectedOpenedTitle, "Selected | EasyEDA Pro - V3.2.196");
  assert.equal(result.observation.documentTitle, "EasyEDA Pro - V3.2.196");
  assert.equal(env.evaluate("projectCalls"), 0); assert.equal(env.evaluate("registryCalls"), 2);
  assert.equal(env.evaluate("listeners.length"), 0); assert.equal(env.evaluate("cancelCalls"), 0);
  assert.equal(result.startupQualified, false); assert.equal(result.persistenceVerified, false);
  assert.equal(Object.isFrozen(result), true); assert.equal(Object.isFrozen(result.observation), true);
  assert.ok(!JSON.stringify(result).includes(rawWindowsPath));
  assert.equal(CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION_SHA256,
    createHash("sha256").update(CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION, "utf8").digest("hex"));
});

void test("fixed project service is called once and waits for one contextual prefix", async () => {
  const env = fixture({ projectEvent: "" }), running = env.run("open-project"); await flush();
  assert.equal(env.evaluate("projectCalls"), 1); assert.equal(env.evaluate("registryCalls"), 1);
  env.evaluate("info.tabs.push({tabId:'0',data:{doctype:0},isAbleDelete:false,group:'start_blank',draggable:false,isDisplayNone:true});info.activeTabId='0';Tabs.currentTabId='0';publish(null,undefined,undefined);");
  const result = await running;
  assert.equal(result.ok, true); assert.equal(result.status, "opened-prefix-observed");
  assert.equal(result.publicResult, true); assert.equal(result.prefixObserved, true);
  assert.equal(result.observation?.projectPresent, true); assert.equal(result.observation.branchUuid, target.branchUuid);
  assert.equal(result.observation.documentTitle, "Selected | EasyEDA Pro - V3.2.196");
  assert.equal(result.nativeWorkMayRemain, true); assert.equal(result.restorationCompletionVerified, false);
  assert.equal(result.compilerOwnerVerified, false); assert.equal(result.queueCompletionVerified, false);
  assert.equal(env.evaluate("projectCalls"), 1); assert.equal(env.evaluate("registryCalls"), 2);
  assert.equal(env.evaluate("cancelCalls"), 1); assert.equal(env.evaluate("listeners[0].callback"), null);
});

void test("pre-dispatch authority, accessor and registration failures never call the project service", async () => {
  for (const before of [
    "info.tabs.push({tabId:'private',data:{doctype:3,pid:'private'}});",
    "Tabs.containerTree.children=[{id:'editor-window-main'},{id:'unlisted'}];",
    "gVars.currentProject={projectId:'a'.repeat(64),branchUuid:target.branchUuid,isV2Format:false};",
    String.raw`registration[target.projectUuid].path='C:\\Wrong\\Selected.eprj2';`,
    "registration[target.projectUuid].isCbb=true;",
    "Object.defineProperty(start.data,'pid',{get(){getterCalls++;return 'private';}});",
    "gVars.isHistoryMode=true;", "globalThis._MSG_BUS2_EXTAPI_={};",
    "gVars.client.currentProjectName='Other';", "document.title='Other | EasyEDA Pro - V3.2.196';",
    "document.title='EasyEDA Pro - V0.0.0';", "meta.localName='div';",
    "meta.getAttribute=()=> 'private-version';",
    "Object.defineProperty(gVars.client,'currentProjectName',{get(){getterCalls++;return 'private';}});",
  ]) {
    const env = fixture({ before }), result = await env.run("open-project");
    assert.equal(result.ok, false); assert.equal(result.dispatchAttempted, false);
    assert.equal(env.evaluate("projectCalls"), 0); assert.equal(env.evaluate("getterCalls"), 0);
  }
  for (const afterRegistry of ["gVars.currentProject={...gVars.currentProject};",
    "Api.prototype.rpcCall=async()=>true;", "globalThis._TAB_ID_='changed-window';"]) {
    const env = fixture({ afterRegistry }), result = await env.run("open-project");
    assert.equal(result.ok, false); assert.equal(result.dispatchAttempted, false); assert.equal(env.evaluate("projectCalls"), 0);
  }
});

void test("prefix shape, branch and duplicate delivery failures retain consumed dispatch without replay", async () => {
  for (const projectEvent of ["publish({private:'payload'},undefined,undefined);", "publish(null,{},undefined);",
    "publish(null,undefined,undefined);publish(null,undefined,undefined);",
    "gVars.currentProject.branchUuid='a'.repeat(32);publish(null,undefined,undefined);"]) {
    const env = fixture({ projectEvent }), result = await env.run("open-project");
    assert.equal(result.ok, false); assert.equal(result.dispatchAttempted, true);
    assert.equal(result.nativeWorkMayRemain, true); assert.equal(env.evaluate("projectCalls"), 1);
    assert.equal(env.evaluate("registryCalls"), 1); assert.equal(env.evaluate("cancelCalls"), 1);
  }
  const early = fixture({ subscriptionBody: "callback(null,undefined,undefined);" });
  const result = await early.run("open-project");
  assert.equal(result.ok, false); assert.equal(result.dispatchAttempted, false);
  assert.equal(early.evaluate("projectCalls"), 0); assert.equal(early.evaluate("cancelCalls"), 1);
});

void test("post-dispatch observations refuse owner, URL and registration drift", async () => {
  for (const afterRegistry of ["gVars.currentProject={...gVars.currentProject};",
    "info.tabs.push({tabId:'0',data:{doctype:0},isAbleDelete:false,group:'start_blank',draggable:false,isDisplayNone:true});",
    "gVars.currentProject.branchUuid='a'.repeat(32);", "publish(null,undefined,undefined);"]) {
    const env = fixture({ afterRegistry: `if(registryCalls===2){${afterRegistry}}` }), result = await env.run("open-project");
    assert.equal(result.ok, false); assert.equal(result.dispatchAttempted, true); assert.equal(env.evaluate("projectCalls"), 1);
    assert.equal(env.evaluate("cancelCalls"), 1);
  }
  for (const projectEvent of ["document.title='EasyEDA Pro - V3.2.196';publish(null,undefined,undefined);",
    "document.title='Arbitrary title';publish(null,undefined,undefined);",
    "gVars.client.currentProjectName='Other';publish(null,undefined,undefined);",
    "gVars.client={...gVars.client};publish(null,undefined,undefined);"]) {
    const env = fixture({ projectEvent }), result = await env.run("open-project");
    assert.equal(result.ok, false); assert.equal(result.dispatchAttempted, true);
    assert.equal(env.evaluate("projectCalls"), 1);
  }
  for (const change of ["location.href=location.href.replace('cll=warn','cll=info');",
    "location.href+='&cmd=private';", "location.href=location.href.replace(target.projectUuid,'f'.repeat(64));"]) {
    const env = fixture({ projectBody: `openedProject();${change}document.URL=location.href;return true;` });
    const result = await env.run("open-project");
    assert.equal(result.ok, false); assert.equal(result.dispatchAttempted, true); assert.equal(env.evaluate("projectCalls"), 1);
  }
});

void test("timeout cancels only the observer and later vendor settlement cannot continue or replay", async () => {
  const env = fixture({ fastDeadline: true, projectBody: "return await new Promise(resolve=>{globalThis.release=resolve;});", projectEvent: "" });
  const result = await env.run("open-project");
  assert.equal(result.ok, false); assert.equal(result.failure?.code, "TIMEOUT");
  assert.equal(result.dispatchAttempted, true); assert.equal(result.nativeWorkMayRemain, true);
  assert.equal(result.publicResult, null); assert.equal(result.prefixObserved, false);
  assert.equal(env.evaluate("projectCalls"), 1); assert.equal(env.evaluate("registryCalls"), 1);
  assert.equal(env.evaluate("cancelCalls"), 1); env.evaluate("release(true);"); await flush();
  assert.equal(env.evaluate("projectCalls"), 1); assert.equal(env.evaluate("registryCalls"), 1);
  const missing = fixture({ fastDeadline: true, projectEvent: "" }), missingResult = await missing.run("open-project");
  assert.equal(missingResult.failure?.code, "TIMEOUT"); assert.equal(missingResult.publicResult, true);
  assert.equal(missingResult.prefixObserved, false); assert.equal(missing.evaluate("cancelCalls"), 1);
});

void test("negative acknowledgement and private exceptions do not become completion or leak details", async () => {
  const declined = fixture({ projectBody: "return false;" }), result = await declined.run("open-project");
  assert.equal(result.ok, false); assert.equal(result.publicResult, false); assert.equal(result.failure?.code, "ACK");
  for (const projectBody of ["throw new Error('PRIVATE_PATH_AND_CONTENT');",
    "throw Object.defineProperty({},'message',{get(){getterCalls++;return 'PRIVATE_SECRET';}});",
    "return 'PRIVATE_RESULT';"]) {
    const env = fixture({ projectBody }), failed = await env.run("open-project");
    assert.equal(failed.ok, false); assert.equal(failed.dispatchAttempted, true);
    assert.ok(!JSON.stringify(failed).includes("PRIVATE")); assert.equal(env.evaluate("getterCalls"), 0);
  }
});

void test("strict typed arguments and exact remote results cannot supply code or assert unsupported authority", async () => {
  const args = currentPcbDiagnosticOpeningArguments(target, "preflight");
  assert.deepEqual(args, [{ value: target }, { value: "preflight" }]); assert.equal(Object.isFrozen(args), true);
  assert.throws(() => currentPcbDiagnosticOpeningArguments({ ...target, expression: "private" }, "preflight"));
  assert.throws(() => currentPcbDiagnosticOpeningArguments({ ...target, projectUuid: "a".repeat(64) }, "preflight"));
  const malformedPath = `${rawWindowsPath.slice(0, -6)}\uD800.eprj2`;
  assert.throws(() => currentPcbDiagnosticOpeningArguments({ ...target, rawWindowsPath: malformedPath,
    projectUuid: sha256Text(malformedPath) }, "preflight"), /PCB_DIAGNOSTIC_OPENING_TARGET/u);
  const result = await fixture().run("preflight");
  const reply = resultReply(result);
  assert.deepEqual(decodeCurrentPcbDiagnosticOpeningReply(reply, target, "preflight"), result);
  for (const change of [{ compilerOwnerVerified: true }, { status: "opened-prefix-observed" },
    { nativeWorkMayRemain: true }, { dispatchAttempted: true }, { phase: "open-project" },
    { projectUuid: "f".repeat(64) }, { publicResult: true }, { prefixObserved: true },
    { observation: { ...result.observation, tabIds: [`${target.documentUuid}@${target.projectUuid}`] } },
    { observation: { ...result.observation, expectedOpenedTitle: "Other | EasyEDA Pro - V3.2.196" } },
    { observation: { ...result.observation, documentTitle: "Selected | EasyEDA Pro - V3.2.196" } },
    { rawWindowsPath }, { failure: { stage: "output", code: "EXCEPTION" } }]) {
    assert.throws(() => decodeCurrentPcbDiagnosticOpeningReply(resultReply(result, change), target, "preflight"), /PCB_DIAGNOSTIC_OPENING_REPLY/u);
  }
  for (const value of [{ result: { type: "object", objectId: "remote" } },
    { result: { type: "string", value: "{}" }, exceptionDetails: {} },
    { result: { type: "string", value: '{"schema":"x","schema":"x"}' } },
    { result: { type: "string", value: " ".repeat(49_153) } }, new Proxy({}, {}),
    Object.defineProperty({}, "result", { get(): never { throw new Error("PRIVATE_GETTER"); } })]) {
    assert.throws(() => decodeCurrentPcbDiagnosticOpeningReply(value, target, "preflight"), /PCB_DIAGNOSTIC_OPENING_REPLY/u);
  }
});
