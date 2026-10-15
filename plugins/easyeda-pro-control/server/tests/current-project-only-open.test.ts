import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { sha256Text } from "../src/core.ts";
import { CURRENT_PROJECT_ONLY_OPEN_MAX_BYTES, CURRENT_PROJECT_ONLY_OPEN_TIMEOUT_MS, buildCurrentProjectOnlyOpenProgram, decodeCurrentProjectOnlyOpenReply } from "../src/current-project-only-open.ts";
import { EXACT_READ_ENVELOPE_SCHEMA, encodeExactReadEnvelope } from "../src/exact-readers.ts";

const rawWindowsPath = String.raw`C:\Disposable\project-only.eprj2`;
const target = { rawWindowsPath, projectUuid: sha256Text(rawWindowsPath), branchUuid: "b".repeat(32), documentUuid: "c".repeat(32), expectedSourceSha256: "d".repeat(64) };
function upstreamReply(value: unknown): unknown { return { content: [], structuredContent: { ok: true, result: value } }; }
interface Options { readonly before?: string; readonly afterNative?: string; readonly pendingAt?: number; readonly presentAt?: number; readonly projectBody?: string; readonly eventBody?: string }
function environment(options: Options = {}): {
  run: () => Promise<unknown>; evaluate: (source: string) => unknown; expire: () => void; clears: () => number;
} {
  let clears = 0, timeout: (() => void) | undefined;
  const context = createContext({
    TextEncoder,
    setTimeout(callback: () => void, delay: number): number { assert.equal(delay, CURRENT_PROJECT_ONLY_OPEN_TIMEOUT_MS - 10_000); timeout = callback; return 7; },
    clearTimeout(timer: unknown): void { assert.equal(timer, 7); clears += 1; },
  });
  runInContext(`globalThis.window=globalThis;globalThis.top=globalThis;
globalThis.target=${JSON.stringify(target)};globalThis.calls=[];globalThis.denied=[];globalThis.listeners=[];
globalThis.location={href:'https://client/editor?cll=warn#',origin:'https://client'};
globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href};
globalThis.navigator={serviceWorker:{controller:null}};
globalThis.PRO_EDITOR_MODE='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM';globalThis.PRO_EDITOR_VERSION='3.2.206';
globalThis.start={tabId:'tab_page1',data:{doctype:-1},isAbleDelete:false,group:'start_blank',draggable:true,isDisplayNone:false};
globalThis.info={id:'editor-window-main',belong:'editor-window-main',tabs:[start],activeTabId:'tab_page1'};
class Tabs{static containerIds=['editor-window-main'];static containerTree={id:'editor-window-main'};static belongContainer='editor-window-main';static currentTabId='tab_page1';static isOpenProjectDoc=true;static isOpenOtherDoc=true;static getActiveTab(){return this.currentTabId;}static getContainerInfo(id){return id===info.id?info:null;}}
const forbidden=name=>{denied.push(name);throw new Error('PRIVATE_FORBIDDEN');};
globalThis.fetch=()=>forbidden('network');
globalThis.registration={[target.projectUuid]:{path:target.rawWindowsPath,isCbb:false}};
globalThis.openedProject=()=>{gVars.currentProject={projectId:target.projectUuid,branchUuid:target.branchUuid,isV2Format:false};location.href=location.href.split('#')[0]+'#id='+target.projectUuid;document.URL=location.href;};
const call=async(kind,args)=>{calls.push({kind,args});const index=calls.length;if(index===${options.pendingAt ?? 0})await new Promise(resolve=>{globalThis.release=resolve;});await Promise.resolve();${options.afterNative ?? ""}
if(kind==='rpc'){if(args[0]==='/pro-mgr/api/client/getProjectPaths')return{message:{success:true,result:registration}};return{message:index===${options.presentAt ?? 0}};}
if(kind==='project'){const result=(()=>{${options.projectBody ?? "openedProject();return true;"}})();${options.eventBody ?? "publish(null,undefined,undefined);"}return result;}
if(index===${options.presentAt ?? 0})return Object.defineProperty({},'text',{get(){return forbidden('body');}});return undefined;};
class Task{constructor(callback){this.callback=callback;this.isRunning=true;}cancel(){this.callback=null;this.isRunning=false;}}
globalThis.publish=(...args)=>{for(const task of listeners)if(task.isRunning)task.callback(...args);};
class Registry{rpcCall(...args){if(this!==gVars.messageBus)throw new Error('WRONG_RPC_RECEIVER');return call('rpc',args);}subscribe(topic,callback){if(this!==gVars.messageBus||topic!=='loadProjectCompleted')throw new Error('WRONG_SUBSCRIPTION');const task=new Task(callback);listeners.push(task);return task;}}
class SyntheticCacheStorage{match(...args){if(this!==caches)throw new Error('WRONG_CACHE_RECEIVER');return call('match',args);}open(){return forbidden('open');}keys(){return forbidden('keys');}delete(){return forbidden('delete');}}
class Project{openProject(...args){if(this!==eda.dmt_Project||args.length!==1||args[0]!==target.projectUuid)throw new Error('WRONG_PROJECT_RECEIVER');return call('project',args);}}
globalThis.CacheStorage=SyntheticCacheStorage;globalThis.caches=new SyntheticCacheStorage();
globalThis.gVars={currentProject:{projectId:undefined,branchUuid:''},isHistoryMode:false,messageBus:new Registry(),sessionStorageTabs:new Set(),urlCmd:null};
globalThis.UI={gVars,tabBar:Tabs};globalThis.eda={extensionUuid:'7e06d286b1ac846ef7eab9c7f2a9ee40',dmt_Project:new Project(),dmt_EditorControl:{openDocument:()=>forbidden('document')},sys_FileSystem:{save:()=>forbidden('save')}};
${options.before ?? ""}`, context, { timeout: 1000 });
  return {
    run: (): Promise<unknown> => Promise.resolve(runInContext(`(async()=>{${buildCurrentProjectOnlyOpenProgram(target)}})()`, context, { timeout: 1000 }) as unknown),
    evaluate: (source): unknown => runInContext(source, context, { timeout: 1000 }) as unknown,
    expire(): void { assert.ok(timeout !== undefined); timeout(); }, clears: (): number => clears,
  };
}
async function flush(): Promise<void> { for (let i = 0; i < 40; i += 1) { await Promise.resolve(); } }

void test("project-only opening samples fresh path and inactive caches before one public open, accepting Start or native hidden blank", async () => {
  for (const projectBody of ["openedProject();return true;", "openedProject();info.tabs.push({tabId:'0',data:{doctype:0},isAbleDelete:false,group:'start_blank',draggable:false,isDisplayNone:true});info.activeTabId='0';Tabs.currentTabId='0';return true;"]) {
    const fixture = environment({ projectBody });
    const envelope = structuredClone(await fixture.run());
    const result = decodeCurrentProjectOnlyOpenReply(upstreamReply(envelope), target);
    assert.equal(result.currentTabId, projectBody.includes("info.tabs.push") ? "0" : "tab_page1");
    assert.equal(result.navigationDispatched, true); assert.equal(result.noEditorTabsObserved, true);
    assert.equal(result.startupQualified, false); assert.equal(result.openingEffectsVerified, false); assert.equal(result.writerAuthority, false);
    assert.equal(result.runtimeExamStateVerified, false); assert.equal(result.restorationCompletionVerified, false); assert.equal(result.executionAuthorized, false);
    assert.equal(result.loadProjectCompletedObserved, true); assert.equal(result.prefixEventProducerVerified, false);
    assert.equal(Object.isFrozen(result), true);
    const absent = { kind: "rpc", args: ["/pro-mgr/hasProject", [target.projectUuid]] };
    const cache = (name: string): unknown => ({ kind: "match", args: [`https://client/upload/${target.branchUuid}`,
      { cacheName: name, ignoreSearch: true, ignoreMethod: false, ignoreVary: true }] });
    assert.deepEqual(structuredClone(fixture.evaluate("calls")), [{ kind: "rpc", args: ["/pro-mgr/api/client/getProjectPaths", {}, 0] },
      absent, cache(`project_${target.projectUuid}_v6`), absent, cache(`localProject_${target.projectUuid}_v1`), absent, { kind: "project", args: [target.projectUuid] }]);
    assert.deepEqual(structuredClone(fixture.evaluate("denied")), []); assert.equal(fixture.clears(), 1);
    assert.equal(fixture.evaluate("listeners.length"), 1); assert.equal(fixture.evaluate("listeners[0].isRunning"), false); assert.equal(fixture.evaluate("listeners[0].callback"), null);
    assert.ok(!JSON.stringify(envelope).includes(rawWindowsPath)); assert.ok(!JSON.stringify(envelope).includes(target.documentUuid));
  }
});

void test("project-only attempt refuses nonempty startup, wrong registration or present queues before navigation", async () => {
  for (const before of ["gVars.sessionStorageTabs.add('private');", "gVars.urlCmd='private';", "info.tabs.push({tabId:'hidden',data:{doctype:3}});", "navigator.serviceWorker.controller={};", "PRO_EDITOR_VERSION='3.2.182';"]) {
    const fixture = environment({ before }); await assert.rejects(fixture.run(), { message: "CURRENT_PROJECT_ONLY_OPEN_FAILED:HOST" });
    assert.equal(fixture.evaluate("calls.length"), 0);
  }
  const wrongPath = environment({ before: "registration[target.projectUuid].path='PRIVATE_OTHER_PATH';" });
  await assert.rejects(wrongPath.run(), { message: "CURRENT_PROJECT_ONLY_OPEN_FAILED:REGISTRY" }); assert.equal(wrongPath.evaluate("calls.length"), 1);
  for (const [presentAt, stage] of [[2, "TARGET_INACTIVE"], [3, "PROJECT_CACHE"], [5, "LOCAL_CACHE"], [6, "TARGET_INACTIVE"]] as const) {
    const fixture = environment({ presentAt }); await assert.rejects(fixture.run(), { message: `CURRENT_PROJECT_ONLY_OPEN_FAILED:${stage}` });
    assert.equal(fixture.evaluate("calls.length"), presentAt); assert.deepEqual(structuredClone(fixture.evaluate("denied")), []);
  }
});

void test("project-only attempt retains registry, public method, restore and tab owners across each awaited observation", async () => {
  for (const [index, change] of [[1, "gVars.messageBus=new Registry();"], [3, "gVars.sessionStorageTabs=new Set();"], [5, "info.tabs=[...info.tabs];"],
    [6, "Project.prototype.openProject=()=>forbidden('replacement');"], [6, "gVars.urlCmd='private';"], [6, "SyntheticCacheStorage.prototype.match=()=>Promise.resolve(undefined);"]] as const) {
    const fixture = environment({ afterNative: `if(index===${index}){${change}}` }); await assert.rejects(fixture.run(), /CURRENT_PROJECT_ONLY_OPEN_FAILED:/u);
    assert.equal(fixture.evaluate("calls.length"), index); assert.deepEqual(structuredClone(fixture.evaluate("denied")), []);
  }
  const rejection = environment({ afterNative: "throw Object.defineProperty({},'message',{get(){denied.push('error-getter');return 'PRIVATE';}});" });
  await assert.rejects(rejection.run(), { message: "CURRENT_PROJECT_ONLY_OPEN_FAILED:REGISTRY" }); assert.deepEqual(structuredClone(rejection.evaluate("denied")), []);
});

void test("post-open transition rejects document tabs, wrong branch, restore work, owner replacement and false public acknowledgement without replay", async () => {
  for (const projectBody of ["openedProject();return false;", "openedProject();gVars.currentProject.branchUuid='a'.repeat(32);return true;",
    "openedProject();info.tabs.push({tabId:target.documentUuid+'@'+target.projectUuid,data:{doctype:3,pid:target.projectUuid}});return true;",
    "openedProject();gVars.sessionStorageTabs.add('private');return true;", "openedProject();gVars.sessionStorageTabs=new Set();return true;",
    "openedProject();info.tabs=[...info.tabs];return true;", "openedProject();location.href+=',tab='+target.documentUuid+'@'+target.projectUuid;document.URL=location.href;return true;",
    "openedProject();gVars.urlCmd='private';return true;"]) {
    const fixture = environment({ projectBody }); await assert.rejects(fixture.run(), /CURRENT_PROJECT_ONLY_OPEN_FAILED:(?:POST_OPEN|PREFIX_EVENT)/u);
    assert.equal(fixture.evaluate("calls.length"), 7); assert.equal(fixture.evaluate("calls.filter(c=>c.kind==='project').length"), 1);
    assert.deepEqual(structuredClone(fixture.evaluate("denied")), []); assert.equal(fixture.clears(), 1);
  }
});

void test("operation-local completion prefix requires exact contextual delivery and cancels only its retained listener", async () => {
  for (const eventBody of ["publish({private:'payload'},undefined,undefined);", "publish(null,{},undefined);", "publish(null,undefined,undefined);publish(null,undefined,undefined);",
    "publish(null,undefined,undefined);gVars.currentProject={...gVars.currentProject};"]) {
    const fixture = environment({ eventBody }); await assert.rejects(fixture.run(), /CURRENT_PROJECT_ONLY_OPEN_FAILED:(?:POST_OPEN|PREFIX_EVENT)/u);
    assert.equal(fixture.evaluate("listeners[0].isRunning"), false); assert.equal(fixture.evaluate("listeners[0].callback"), null); assert.equal(fixture.evaluate("calls.length"), 7);
  }
  const fixture = environment({ eventBody: "" });
  const running = fixture.run(); await flush();
  assert.equal(fixture.evaluate("listeners[0].isRunning"), true); fixture.expire();
  await assert.rejects(running, { message: "CURRENT_PROJECT_ONLY_OPEN_FAILED:TIMEOUT" });
  assert.equal(fixture.evaluate("listeners[0].isRunning"), false); assert.equal(fixture.evaluate("listeners[0].callback"), null);
  fixture.evaluate("publish(null,undefined,undefined);"); await flush(); assert.equal(fixture.evaluate("calls.length"), 7);
});

void test("one deadline stops later dispatch after a delayed cache read and never retries an already dispatched public open", async () => {
  for (const pendingAt of [3, 7]) {
    const fixture = environment({ pendingAt });
    const running = fixture.run();
    await flush(); assert.equal(fixture.evaluate("calls.length"), pendingAt); fixture.expire();
    await assert.rejects(running, { message: "CURRENT_PROJECT_ONLY_OPEN_FAILED:TIMEOUT" });
    fixture.evaluate("release();"); await flush();
    assert.equal(fixture.evaluate("calls.length"), pendingAt); assert.equal(fixture.clears(), 1); assert.deepEqual(structuredClone(fixture.evaluate("denied")), []);
  }
});

void test("project-only compiler and exact decoder reject getters, injected selectors, malformed envelopes and authority promotion", async () => {
  for (const invalid of [{ ...target, code: "private" }, { ...target, rawWindowsPath: "PRIVATE" },
    Object.defineProperty({ ...target }, "projectUuid", { get(): never { throw new Error("getter invoked"); } })]) {
    assert.throws(() => buildCurrentProjectOnlyOpenProgram(invalid));
  }
  const valid = structuredClone(await environment().run());
  const result = decodeCurrentProjectOnlyOpenReply(upstreamReply(valid), target);
  const oversized = `"${"é".repeat(CURRENT_PROJECT_ONLY_OPEN_MAX_BYTES / 2)}"`;
  for (const invalid of [{ schema: EXACT_READ_ENVELOPE_SCHEMA, utf8Bytes: 1, json: "{" },
    { schema: EXACT_READ_ENVELOPE_SCHEMA, utf8Bytes: Buffer.byteLength(oversized, "utf8"), json: oversized },
    encodeExactReadEnvelope({ ...result, publicResult: false }), encodeExactReadEnvelope({ ...result, currentTabId: target.documentUuid }),
    encodeExactReadEnvelope({ ...result, writerAuthority: true }), encodeExactReadEnvelope({ ...result, startupQualified: true }),
    encodeExactReadEnvelope({ ...result, openingEffectsVerified: true }), encodeExactReadEnvelope({ ...result, executionAuthorized: true }),
    encodeExactReadEnvelope({ ...result, prefixEventProducerVerified: true }), encodeExactReadEnvelope({ ...result, loadProjectCompletedObserved: false }),
    encodeExactReadEnvelope({ ...result, extra: true }), encodeExactReadEnvelope({ ok: false, error: "CURRENT_PROJECT_ONLY_OPEN_FAILED:TIMEOUT" })]) {
    assert.throws(() => decodeCurrentProjectOnlyOpenReply(upstreamReply(invalid), target));
  }
  assert.throws(() => decodeCurrentProjectOnlyOpenReply(upstreamReply(valid), { ...target, branchUuid: "a".repeat(32) }));
  assert.throws(() => decodeCurrentProjectOnlyOpenReply({ isError: true, content: [], structuredContent: { ok: false, error: "failure" } }, target));
});
