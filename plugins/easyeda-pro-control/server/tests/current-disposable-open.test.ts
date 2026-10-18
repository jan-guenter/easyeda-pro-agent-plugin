import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { sha256Text } from "../src/core.ts";
import type { CurrentDisposableOpenPhase } from "../src/current-disposable-open.ts";
import { buildCurrentDisposableOpenProgram, parseCurrentDisposableOpenRequest, queryCurrentDisposableOpen,
  validateCurrentDisposableOpenArguments, validateCurrentDisposableOpenResult } from "../src/current-disposable-open.ts";
import { decodeExactReadEnvelope } from "../src/exact-readers.ts";

const rawWindowsPath = String.raw`C:\Disposable\Selected.eprj2`;
const target = { rawWindowsPath, projectUuid: sha256Text(rawWindowsPath), documentUuid: "d".repeat(16), expectedSourceSha256: "e".repeat(64), branchUuid: "b".repeat(32) };
const { branchUuid: _branchUuid, ...publicTarget } = target;
const request = { action: "open", operationId: "disposable-open-test", ...publicTarget, confirmDisposableProject: true, acceptNormalOpenEffects: true };
interface Options { opened?: boolean; document?: boolean; before?: string; afterRegistry?: string; projectBody?: string; projectEvent?: string; subscriptionBody?: string; documentBody?: string; afterNative?: string; fastDeadline?: boolean; }
function environment(options: Options = {}): { run: (phase: CurrentDisposableOpenPhase) => Promise<unknown>; evaluate: (source: string) => unknown } {
  const childContext = createContext({});
  runInContext(`globalThis.nativeCalls=0;class Bus{async rpcCall(topic,arg,timeout){if(this!==MSG_BUS_PCB.messageBus||topic!=='getTabIdAndDocType'||arg!==undefined||timeout!==0)throw new Error('PRIVATE_NATIVE');nativeCalls++;await Promise.resolve();${options.afterNative ?? ""}return {message:{tabId:parent.targetTabId,docType:3},bridge:undefined,source:undefined};}}globalThis.MSG_BUS_PCB={messageBus:new Bus()};`, childContext, { timeout: 1000 });
  const child: unknown = runInContext("globalThis", childContext);
  const context = createContext({ child, TextEncoder, clearTimeout, setTimeout: options.fastDeadline === true
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Preserve the browser timer interface while shortening only the test deadline.
    ? (callback: () => void): ReturnType<typeof setTimeout> => setTimeout(callback, 1) : setTimeout });
  runInContext(`globalThis.window=globalThis;globalThis.top=globalThis;globalThis.target=${JSON.stringify(target)};
globalThis.targetTabId=target.documentUuid+'@'+target.projectUuid;
globalThis.location={href:'https://client/editor?cll=warn#',origin:'https://client'};
globalThis.frames=[];globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href,querySelectorAll(){return frames;}};
globalThis.PRO_EDITOR_MODE='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM';
globalThis.start={tabId:'tab_page1',data:{doctype:-1},isAbleDelete:false,group:'start_blank',draggable:true,isDisplayNone:false};
globalThis.info={id:'editor-window-main',belong:'editor-window-main',tabs:[start],activeTabId:'tab_page1'};
class Tabs{static containerIds=['editor-window-main'];static containerTree={id:'editor-window-main'};static belongContainer='editor-window-main';static currentTabId='tab_page1';static getActiveTab(){return this.currentTabId;}static getContainerInfo(id){return id===info.id?info:null;}static getTabById(id){return info.tabs.find(tab=>tab.tabId===id)??null;}}
globalThis.registryCalls=0;globalThis.projectCalls=0;globalThis.documentCalls=0;globalThis.getterCalls=0;
globalThis.listeners=[];globalThis.cancelCalls=0;
class Task{constructor(callback){this.callback=callback;this.isRunning=true;}cancel(){cancelCalls++;this.callback=null;this.isRunning=false;}}
globalThis.publish=(...args)=>{for(const task of listeners)if(task.isRunning)task.callback(...args);};
globalThis.registration={[target.projectUuid]:{path:target.rawWindowsPath,isCbb:false}};
class Registry{async rpcCall(topic,args,timeout){if(this!==gVars.messageBus||topic!=='/pro-mgr/api/client/getProjectPaths'||Object.keys(args).length||timeout!==0)throw new Error('PRIVATE_REGISTRY');registryCalls++;await Promise.resolve();${options.afterRegistry ?? ""}return {message:{success:true,result:registration},bridge:undefined,source:undefined};}subscribe(topic,callback){if(this!==gVars.messageBus||topic!=='loadProjectCompleted')throw new Error('PRIVATE_SUBSCRIPTION');const task=new Task(callback);listeners.push(task);${options.subscriptionBody ?? ""}return task;}}
globalThis.gVars={currentProject:{projectId:undefined,branchUuid:''},isHistoryMode:false,messageBus:new Registry()};
globalThis.UI={gVars,tabBar:Tabs};
globalThis.openedProject=()=>{gVars.currentProject={projectId:target.projectUuid,branchUuid:target.branchUuid,isV2Format:false};location.href=location.href.split('#')[0]+'#id='+target.projectUuid;document.URL=location.href;};
globalThis.openedDocument=()=>{globalThis.targetTab={tabId:targetTabId,data:{doctype:3,pid:target.projectUuid}};info.tabs=[start,targetTab];info.activeTabId=targetTabId;Tabs.currentTabId=targetTabId;location.href=location.href.split('#')[0]+'#id='+target.projectUuid+',tab=*'+targetTabId;document.URL=location.href;
globalThis.attributes={c_dbid:targetTabId,c_doctype:'3',src:'editor?entry=pcb','pcb-canvas':'true'};
globalThis.frame={tagName:'IFRAME',id:'frame_'+targetTabId,ownerDocument:document,isConnected:true,contentWindow:child,classList:{contains(name){return name==='editframe';}},getAttribute(name){return attributes[name]??null;},hasAttribute(name){return Object.hasOwn(attributes,name);},parentElement:{getAttribute(name){return name==='uuid'?targetTabId:null;}}};
frames=[frame];child.document={defaultView:child,nodeType:9};child.frameElement=frame;child.parent=globalThis;child.top=globalThis;};
class Project{async openProject(id){if(this!==eda.dmt_Project||arguments.length!==1||id!==target.projectUuid)throw new Error('PRIVATE_PROJECT');projectCalls++;await Promise.resolve();const result=await(async()=>{${options.projectBody ?? "openedProject();return true;"}})();${options.projectEvent ?? "if(result===true)publish(null,undefined,undefined);"}return result;}}
class Editor{async openDocument(id){if(this!==eda.dmt_EditorControl||arguments.length!==1||id!==target.documentUuid)throw new Error('PRIVATE_DOCUMENT');documentCalls++;await Promise.resolve();${options.documentBody ?? "openedDocument();return targetTabId;"}}}
globalThis.eda={extensionUuid:'7e06d286b1ac846ef7eab9c7f2a9ee40',dmt_Project:new Project(),dmt_EditorControl:new Editor()};
${options.opened === true ? "openedProject();" : ""}${options.document === true ? "openedDocument();" : ""}${options.before ?? ""}`, context, { timeout: 1000 });
  return { run: (phase): Promise<unknown> => Promise.resolve(runInContext(`(async()=>{${buildCurrentDisposableOpenProgram(target, phase)}})()`, context, { timeout: 1000 }) as unknown),
    evaluate: (source): unknown => runInContext(source, context, { timeout: 1000 }) as unknown };
}
async function flush(): Promise<void> { for (let i = 0; i < 30; i += 1) { await Promise.resolve(); } }

void test("project opening waits for its contextual native prefix before freezing tab observations", async () => {
  const fixture = environment({ projectEvent: "" });
  const running = fixture.run("open-project"); await flush();
  assert.equal(fixture.evaluate("projectCalls"), 1); assert.equal(fixture.evaluate("registryCalls"), 1);
  assert.equal(fixture.evaluate("documentCalls"), 0); assert.equal(fixture.evaluate("listeners[0].isRunning"), true);
  fixture.evaluate("info.tabs.push({tabId:'0',data:{doctype:0},isAbleDelete:false,group:'start_blank',draggable:false,isDisplayNone:true});info.activeTabId='0';Tabs.currentTabId='0';publish(null,undefined,undefined);");
  const result = validateCurrentDisposableOpenResult(target, "open-project", decodeExactReadEnvelope(await running));
  assert.equal(result.projectPresent, true); assert.equal(result.documentPresent, false);
  assert.equal(result.restorationCompletionVerified, false); assert.equal(result.writerAuthority, false);
  assert.equal(fixture.evaluate("projectCalls"), 1); assert.equal(fixture.evaluate("registryCalls"), 2);
  assert.equal(fixture.evaluate("cancelCalls"), 1); assert.equal(fixture.evaluate("listeners[0].callback"), null);
});

void test("native prefix requires one contextual delivery and never retries navigation", async () => {
  for (const projectEvent of ["publish({private:'payload'},undefined,undefined);", "publish(null,{},undefined);",
    "publish(null,undefined,undefined);publish(null,undefined,undefined);",
    "gVars.currentProject.branchUuid='a'.repeat(32);publish(null,undefined,undefined);"]) {
    const fixture = environment({ projectEvent });
    await assert.rejects(fixture.run("open-project"), /CURRENT_DISPOSABLE_OPEN_FAILED:(?:project-acknowledgement|prefix-event):PREFIX/u);
    assert.equal(fixture.evaluate("projectCalls"), 1); assert.equal(fixture.evaluate("registryCalls"), 1);
    assert.equal(fixture.evaluate("documentCalls"), 0); assert.equal(fixture.evaluate("cancelCalls"), 1);
  }
  const early = environment({ subscriptionBody: "callback(null,undefined,undefined);" });
  await assert.rejects(early.run("open-project"), { message: "CURRENT_DISPOSABLE_OPEN_FAILED:prefix-subscribe:PREFIX" });
  assert.equal(early.evaluate("projectCalls"), 0); assert.equal(early.evaluate("cancelCalls"), 1);
  const missing = environment({ projectEvent: "", fastDeadline: true });
  await assert.rejects(missing.run("open-project"), { message: "CURRENT_DISPOSABLE_OPEN_FAILED:prefix-event:TIMEOUT" });
  assert.equal(missing.evaluate("projectCalls"), 1); assert.equal(missing.evaluate("registryCalls"), 1);
  assert.equal(missing.evaluate("cancelCalls"), 1); missing.evaluate("publish(null,undefined,undefined);"); await flush();
  assert.equal(missing.evaluate("registryCalls"), 1); assert.equal(missing.evaluate("documentCalls"), 0);
  const changedAfterPrefix = environment({ projectEvent: "" });
  const running = changedAfterPrefix.run("open-project"); await flush();
  changedAfterPrefix.evaluate("publish(null,undefined,undefined);location.href+=',tab='+targetTabId;document.URL=location.href;");
  await assert.rejects(running, { message: "CURRENT_DISPOSABLE_OPEN_FAILED:prefix-event:URL" });
  assert.equal(changedAfterPrefix.evaluate("registryCalls"), 1); assert.equal(changedAfterPrefix.evaluate("cancelCalls"), 1);
});

void test("post-prefix registration keeps strict owner and projection stability", async () => {
  for (const [change, code] of [["gVars.currentProject={...gVars.currentProject};", "OWNERS"],
    ["info.tabs.push({tabId:'0',data:{doctype:0},isAbleDelete:false,group:'start_blank',draggable:false,isDisplayNone:true});", "PROJECTION"],
    ["gVars.currentProject.branchUuid='a'.repeat(32);", "BRANCH"],
    ["start.group='private';", "TABSHAPE"], ["publish(null,undefined,undefined);", "PREFIX"]] as const) {
    const fixture = environment({ afterRegistry: `if(registryCalls===2){${change}}` });
    await assert.rejects(fixture.run("open-project"), { message: `CURRENT_DISPOSABLE_OPEN_FAILED:after-registration:${code}` });
    assert.equal(fixture.evaluate("projectCalls"), 1); assert.equal(fixture.evaluate("documentCalls"), 0);
    assert.equal(fixture.evaluate("cancelCalls"), 1);
  }
});

void test("disposable opener uses separate one-shot public stages and exact native post-observation", async () => {
  const fixture = environment();
  const preflight = validateCurrentDisposableOpenResult(target, "preflight", decodeExactReadEnvelope(await fixture.run("preflight")));
  assert.equal(preflight.projectPresent, false); assert.equal(preflight.dispatchAttempted, false);
  const project = validateCurrentDisposableOpenResult(target, "open-project", decodeExactReadEnvelope(await fixture.run("open-project")));
  assert.equal(project.publicResult, true); assert.equal(project.projectPresent, true); assert.equal(project.branchUuid, target.branchUuid);
  assert.equal(project.documentPresent, false); assert.equal(fixture.evaluate("projectCalls"), 1); assert.equal(fixture.evaluate("documentCalls"), 0);
  const document = validateCurrentDisposableOpenResult(target, "open-document", decodeExactReadEnvelope(await fixture.run("open-document")));
  assert.equal(document.publicResult, `${target.documentUuid}@${target.projectUuid}`); assert.equal(document.nativeIdentityVerified, true); assert.equal(document.activeTarget, true);
  const observed = validateCurrentDisposableOpenResult(target, "observe", decodeExactReadEnvelope(await fixture.run("observe")));
  assert.equal(observed.dispatchAttempted, false); assert.equal(observed.publicResult, null); assert.equal(observed.nativeIdentityVerified, true);
  assert.equal(fixture.evaluate("projectCalls"), 1); assert.equal(fixture.evaluate("documentCalls"), 1); assert.equal(fixture.evaluate("child.nativeCalls"), 4);
  assert.equal(observed.persistenceVerified, false); assert.equal(observed.writerAuthority, false); assert.equal(observed.restorationCompletionVerified, false);
  assert.ok(!JSON.stringify(observed).includes(rawWindowsPath));
});

void test("ordinary URL transitions stay target-bound and are frozen outside navigation", async () => {
  const preflight = environment({ before: "location.href+='#id='+target.projectUuid;document.URL=location.href;" });
  await assert.rejects(preflight.run("open-project"), /CURRENT_DISPOSABLE_OPEN_FAILED:setup:(?:URL|GUARD)/u);
  assert.equal(preflight.evaluate("projectCalls"), 0);
  for (const change of ["location.href=location.href.replace('cll=warn','cll=info');",
    "location.href+='&cmd=private';", "location.href=location.href.replace(target.projectUuid,'f'.repeat(64));"]) {
    const fixture = environment({ projectBody: `openedProject();${change}document.URL=location.href;return true;` });
    await assert.rejects(fixture.run("open-project"), /CURRENT_DISPOSABLE_OPEN_FAILED:project-acknowledgement:(?:URL|GUARD)/u);
    assert.equal(fixture.evaluate("projectCalls"), 1); assert.equal(fixture.evaluate("documentCalls"), 0);
  }
  const missingTab = environment({ opened: true,
    documentBody: "openedDocument();location.href+='|'+ 'f'.repeat(16)+'@'+target.projectUuid;document.URL=location.href;return targetTabId;" });
  await assert.rejects(missingTab.run("open-document"), /CURRENT_DISPOSABLE_OPEN_FAILED:after-registration:URL/u);
  assert.equal(missingTab.evaluate("documentCalls"), 1);
  const drift = environment({ opened: true, document: true,
    afterRegistry: "location.href=location.href.split(',tab=')[0];document.URL=location.href;" });
  await assert.rejects(drift.run("observe"), /CURRENT_DISPOSABLE_OPEN_FAILED:before-registration:URL/u);
  assert.equal(drift.evaluate("projectCalls"), 0); assert.equal(drift.evaluate("documentCalls"), 0);
});

void test("disposable opener distinguishes public acknowledgement from a missing native frame", async () => {
  const fixture = environment({ opened: true, documentBody: "openedDocument();frames=[];return targetTabId;" });
  const result = validateCurrentDisposableOpenResult(target, "open-document", decodeExactReadEnvelope(await fixture.run("open-document")));
  assert.equal(result.documentPresent, true); assert.equal(result.activeTarget, true); assert.equal(result.nativeIdentityVerified, false);
  const refused = environment({ projectBody: "return false;" });
  const payload = validateCurrentDisposableOpenResult(target, "open-project", decodeExactReadEnvelope(await refused.run("open-project")));
  assert.equal(payload.publicResult, false); assert.equal(payload.projectPresent, false); assert.equal(refused.evaluate("projectCalls"), 1);
});

void test("disposable preflight rejects hidden or mismatched project authority before public dispatch", async () => {
  for (const before of ["info.tabs.push({tabId:'private',data:{doctype:3,pid:'private'}});",
    "Tabs.containerTree.children=[{id:'editor-window-main'},{id:'unlisted'}];",
    "gVars.currentProject={projectId:'a'.repeat(64),branchUuid:target.branchUuid,isV2Format:false};",
    String.raw`registration[target.projectUuid].path='C:\\Wrong\\Selected.eprj2';`, "registration[target.projectUuid].isCbb=true;",
    "Object.defineProperty(start.data,'pid',{get(){getterCalls++;return 'private';}});", "gVars.isHistoryMode=true;"]) {
    const fixture = environment({ before });
    await assert.rejects(fixture.run("open-project"), /^Error: CURRENT_DISPOSABLE_OPEN_FAILED:before-registration:(?:GUARD|FIELD|PROJECT|REGISTRY|TABOWNER|HISTORY)$/u);
    assert.equal(fixture.evaluate("projectCalls"), 0); assert.equal(fixture.evaluate("documentCalls"), 0); assert.equal(fixture.evaluate("getterCalls"), 0);
  }
  const wrongBranch = environment({ opened: true, before: "gVars.currentProject.branchUuid='f'.repeat(32);" });
  await assert.rejects(wrongBranch.run("open-document"), { message: "CURRENT_DISPOSABLE_OPEN_FAILED:before-registration:BRANCH" }); assert.equal(wrongBranch.evaluate("documentCalls"), 0);
});

void test("disposable observer refuses registration, receiver and native identity drift without replay", async () => {
  const registry = environment({ afterRegistry: "gVars.currentProject={...gVars.currentProject};" });
  await assert.rejects(registry.run("open-project"), { message: "CURRENT_DISPOSABLE_OPEN_FAILED:before-registration:OWNERS" }); assert.equal(registry.evaluate("projectCalls"), 0);
  for (const [afterNative, code] of [["parent.gVars.currentProject={...parent.gVars.currentProject};", "OBJECT"],
    ["parent.attributes.c_dbid='other';", "GUARD"],
    ["Bus.prototype.rpcCall=async()=>({message:{tabId:parent.targetTabId,docType:3}});", "BINDING"],
    ["parent.info.activeTabId='tab_page1';", "TABACTIVE"]] as const) {
    const fixture = environment({ opened: true, document: true, afterNative });
    await assert.rejects(fixture.run("observe"), { message: `CURRENT_DISPOSABLE_OPEN_FAILED:native-observation:${code}` });
    assert.equal(fixture.evaluate("projectCalls"), 0); assert.equal(fixture.evaluate("documentCalls"), 0);
  }
});

void test("public-open deadline preserves unsettled marker and prevents later post-timeout dispatch", async () => {
  const fixture = environment({ fastDeadline: true, projectBody: "return await new Promise(resolve=>{globalThis.release=resolve;});" });
  await assert.rejects(fixture.run("open-project"), { message: "CURRENT_DISPOSABLE_OPEN_FAILED:open-project:TIMEOUT" });
  assert.equal(fixture.evaluate("projectCalls"), 1); assert.equal(fixture.evaluate("registryCalls"), 1);
  fixture.evaluate("release(true);"); await Promise.resolve(); await Promise.resolve();
  assert.equal(fixture.evaluate("registryCalls"), 1); assert.equal(fixture.evaluate("documentCalls"), 0);
  const registry = environment({ fastDeadline: true, afterRegistry: "return await new Promise(()=>{});" });
  await assert.rejects(registry.run("preflight"), { message: "CURRENT_DISPOSABLE_OPEN_FAILED:before-registration:TIMEOUT" });
  assert.equal(registry.evaluate("projectCalls"), 0);
});

void test("native opener diagnostics discard private exceptions and never invoke their message getters", async () => {
  for (const projectBody of ["throw new Error('PRIVATE_PATH_AND_DESIGN_CONTENT');",
    "throw Object.defineProperty({},'message',{get(){getterCalls++;return 'PRIVATE_SECRET';}});",
    "throw new Error('CURRENT_DISPOSABLE_OPEN_FAILED:open-project:ACK');"]) {
    const fixture = environment({ projectBody });
    await assert.rejects(fixture.run("open-project"), { message: "CURRENT_DISPOSABLE_OPEN_FAILED:open-project:EXCEPTION" });
    assert.equal(fixture.evaluate("getterCalls"), 0);
    assert.equal(fixture.evaluate("projectCalls"), 1); assert.equal(fixture.evaluate("documentCalls"), 0);
  }
  const acknowledgement = environment({ projectBody: "return 'PRIVATE_RESULT';" });
  await assert.rejects(acknowledgement.run("open-project"), { message: "CURRENT_DISPOSABLE_OPEN_FAILED:project-acknowledgement:ACK" });
  assert.equal(acknowledgement.evaluate("documentCalls"), 0);
});

void test("disposable schemas and result checks reject injected arguments and false authority", async () => {
  assert.deepEqual(parseCurrentDisposableOpenRequest(request), request); assert.equal(validateCurrentDisposableOpenArguments(request)["valid"], true);
  assert.deepEqual(parseCurrentDisposableOpenRequest({ action: "inspect", operationId: request.operationId }), { action: "inspect", operationId: request.operationId });
  const close = { action: "request-normal-close", operationId: request.operationId, confirmNormalClose: true, acceptUnknownFileEffects: true };
  assert.deepEqual(parseCurrentDisposableOpenRequest(close), close);
  for (const invalid of [{ ...close, confirmNormalClose: false }, { ...close, acceptUnknownFileEffects: false },
    { ...close, pid: 1234 }, { ...close, hwnd: "1234" }, { ...close, expectedFingerprint: {} },
    { ...close, rawWindowsPath }, { ...close, force: true }]) {
    assert.equal(validateCurrentDisposableOpenArguments(invalid)["valid"], false);
  }
  for (const invalid of [{ ...request, topic: "private" }, { ...request, projectUuid: "a".repeat(64) }, { ...request, confirmDisposableProject: false },
    { ...request, operationId: "short" }, { ...request, operationId: "a".repeat(97) },
    { ...request, acceptNormalOpenEffects: false }, { ...request, branchUuid: target.branchUuid }, { action: "observe", operationId: request.operationId, rawWindowsPath },
    { action: "retire-after-termination", operationId: request.operationId, confirmRetire: true, acceptUnknownFileEffects: false }]) {
    assert.equal(validateCurrentDisposableOpenArguments(invalid)["valid"], false);
  }
  for (const path of [String.raw`C:\Disposable\..\Selected.eprj2`, String.raw`C:\NUL\Selected.eprj2`, String.raw`C:\Disposable \Selected.eprj2`, String.raw`C:\TEMP~1\Selected.eprj2`]) {
    assert.equal(validateCurrentDisposableOpenArguments({ ...request, rawWindowsPath: path, projectUuid: sha256Text(path) })["valid"], false);
  }
  const catalog = queryCurrentDisposableOpen({ includeSchemas: true }); assert.equal(catalog["total"], 1); assert.equal(catalog["invocationEnabledByDiscovery"], false);
  assert.equal(catalog["sharedLifecycleConnectedValidation"], "installed101500-disposable-meta-only-roundtrip");
  assert.equal(catalog["canvasSegmentsValidation"], "installed210000-disposable-canvas-segments-roundtrip");
  assert.match(JSON.stringify(catalog), /installed123000 separately passed the ordinary META-only forward lifecycle/u);
  assert.match(JSON.stringify(catalog), /Installed210000 passed the disposable canvas-segments forward\/inverse round trip with complete closed SQL, reopened content and final closure/u);
  assert.match(JSON.stringify(catalog), /Installed080000 passed the ordinary unused drawn-symbol forward lifecycle/u);
  assert.match(JSON.stringify(catalog), /inputSchema/u);
  const preparationCheckpoint = catalog["preparationCheckpoint"]; assert.ok(preparationCheckpoint !== null && typeof preparationCheckpoint === "object");
  assert.equal(Reflect.get(preparationCheckpoint, "resultField"), "preparationCheckpoint");
  assert.equal(Reflect.get(preparationCheckpoint, "inputField"), "baseline-begin.preparation.checkpoint");
  assert.equal(Reflect.get(preparationCheckpoint, "historicalEvidenceOnly"), true);
  assert.equal(Reflect.get(preparationCheckpoint, "omittedWhenNotRetained"), true);
  assert.equal(Reflect.get(preparationCheckpoint, "writerAuthority"), false);
  assert.match(JSON.stringify(preparationCheckpoint), /descriptorSchema/u);
  const clock = catalog["clockPreparation"]; assert.ok(clock !== null && typeof clock === "object");
  assert.equal(Reflect.get(clock, "connectedValidation"), false); assert.equal(Reflect.get(clock, "writerAuthority"), false);
  assert.deepEqual(Reflect.get(clock, "runtimeVersions"), { electron: "41.2.1-jlc-sa-win-x64.5", chrome: "146.0.7680.188", node: "24.14.1" });
  const pins: unknown = Reflect.get(clock, "runtimePins"); assert.ok(pins !== null && typeof pins === "object");
  assert.equal(Object.keys(pins).length, 18);
  assert.equal(Reflect.get(pins, "easyeda-pro.exe"), "e59d159f0f7bb5ac4832ce6583622251750ede7b839050f3aabe774cadfd1f55");
  Reflect.set(pins, "easyeda-pro.exe", "mutated-return-value");
  assert.doesNotMatch(JSON.stringify(queryCurrentDisposableOpen()), /mutated-return-value/u);
  const raw: unknown = decodeExactReadEnvelope(await environment().run("preflight")); assert.ok(raw !== null && typeof raw === "object");
  for (const invalid of [{ ...raw, dispatchAttempted: true }, { ...raw, nativeIdentityVerified: true }, { ...raw, branchUuid: target.branchUuid },
    { ...raw, publicResult: true }, { ...raw, writerAuthority: true }, { ...raw, extra: "PRIVATE" }]) {
    assert.throws(() => validateCurrentDisposableOpenResult(target, "preflight", invalid));
  }
});
