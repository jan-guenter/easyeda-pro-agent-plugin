import assert from "node:assert/strict";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_UPLOAD_QUEUE_MAX_BYTES, CURRENT_UPLOAD_QUEUE_PROFILE, buildCurrentUploadQueueReadExpression, buildCurrentUploadQueueReadProgram,
  decodeCurrentUploadQueueReadReply, validateCurrentUploadQueueReadResult } from "../src/current-upload-queue-read.ts";
import { EXACT_READ_ENVELOPE_SCHEMA, encodeExactReadEnvelope } from "../src/exact-readers.ts";

const target = { projectUuid: "a".repeat(64), branchUuid: "b".repeat(32) };
function upstreamReply(value: unknown): unknown { return { content: [], structuredContent: { ok: true, result: value } }; }
interface Options { readonly before?: string; readonly afterNative?: string; readonly pendingAt?: number; readonly presentAt?: number }
function environment(options: Options = {}): {
  run: () => Promise<unknown>; runProgram: () => Promise<unknown>; evaluate: (source: string) => unknown; expire: () => void; clears: () => number;
} {
  let clears = 0, timeout: (() => void) | undefined;
  const context = createContext({
    TextEncoder,
    setTimeout(callback: () => void, delay: number): number { assert.equal(delay, 10_000); timeout = callback; return 7; },
    clearTimeout(timer: unknown): void { assert.equal(timer, 7); clears += 1; },
  });
  runInContext(`globalThis.window=globalThis;globalThis.top=globalThis;
globalThis.target=${JSON.stringify(target)};globalThis.calls=[];globalThis.denied=[];
globalThis.location={href:'https://client/editor?cll=warn#',origin:'https://client'};
globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href};
globalThis.navigator={serviceWorker:{controller:null}};
globalThis.PRO_EDITOR_MODE='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM';globalThis.PRO_EDITOR_VERSION='3.2.206';
globalThis.start={tabId:'tab_page1',data:{doctype:-1},isAbleDelete:false,group:'start_blank',draggable:true,isDisplayNone:false};
globalThis.info={id:'editor-window-main',belong:'editor-window-main',tabs:[start],activeTabId:'tab_page1'};
class Tabs{static containerIds=['editor-window-main'];static containerTree={id:'editor-window-main'};static belongContainer='editor-window-main';static currentTabId='tab_page1';static isOpenProjectDoc=true;static isOpenOtherDoc=true;static getActiveTab(){return this.currentTabId;}static getContainerInfo(id){return id===info.id?info:null;}}
const forbidden=name=>{denied.push(name);throw new Error('PRIVATE_FORBIDDEN');};
globalThis.fetch=()=>forbidden('network');
const call=async(kind,args)=>{calls.push({kind,args});const index=calls.length;if(index===${options.pendingAt ?? 0})await new Promise(resolve=>{globalThis.release=resolve;});await Promise.resolve();${options.afterNative ?? ""}
if(kind==='rpc')return {message:index===${options.presentAt ?? 0}};
if(index===${options.presentAt ?? 0})return Object.defineProperty({},'text',{get(){return forbidden('body');}});return undefined;};
class Registry{rpcCall(...args){if(this!==gVars.messageBus)throw new Error('WRONG_RPC_RECEIVER');return call('rpc',args);}}
class SyntheticCacheStorage{match(...args){if(this!==caches)throw new Error('WRONG_CACHE_RECEIVER');return call('match',args);}open(){return forbidden('open');}keys(){return forbidden('keys');}delete(){return forbidden('delete');}}
globalThis.CacheStorage=SyntheticCacheStorage;globalThis.caches=new SyntheticCacheStorage();
globalThis.gVars={currentProject:{projectId:undefined,branchUuid:''},isHistoryMode:false,messageBus:new Registry(),sessionStorageTabs:new Set(),urlCmd:null};
globalThis.UI={gVars,tabBar:Tabs};${options.before ?? ""}`, context, { timeout: 1000 });
  return {
    run: (): Promise<unknown> => Promise.resolve(runInContext(buildCurrentUploadQueueReadExpression(target), context, { timeout: 1000 }) as unknown),
    runProgram: (): Promise<unknown> => Promise.resolve(runInContext(`(async()=>{${buildCurrentUploadQueueReadProgram(target)}})()`, context, { timeout: 1000 }) as unknown),
    evaluate: (source): unknown => runInContext(source, context, { timeout: 1000 }) as unknown,
    expire(): void { assert.ok(timeout !== undefined); timeout(); }, clears: (): number => clears,
  };
}

void test("current inactive-cache program uses only the two fixed matches and three explicit target checks", async () => {
  for (const before of ["", "PRO_EDITOR_MODE='CLIENT-OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM';info.tabs.push({tabId:'0',data:{doctype:0},isAbleDelete:false,group:'start_blank',draggable:false,isDisplayNone:true});"]) {
    const fixture = environment({ before }), result = structuredClone(await fixture.run());
    assert.deepEqual(result, { profile: CURRENT_UPLOAD_QUEUE_PROFILE, ...target, origin: "https://client", projectV6UploadAbsent: true,
      localProjectV1UploadAbsent: true, scope: "point-in-time-inactive-target", startupQualified: false, persistenceVerified: false,
      writerAuthority: false, executionAuthorized: false });
    assert.equal(Object.isFrozen(validateCurrentUploadQueueReadResult(result, target)), true);
    const rpc = { kind: "rpc", args: ["/pro-mgr/hasProject", [target.projectUuid]] };
    const cache = (name: string): unknown => ({ kind: "match", args: [`https://client/upload/${target.branchUuid}`,
      { cacheName: name, ignoreSearch: true, ignoreMethod: false, ignoreVary: true }] });
    assert.deepEqual(structuredClone(fixture.evaluate("calls")), [rpc, cache(`project_${target.projectUuid}_v6`), rpc, cache(`localProject_${target.projectUuid}_v1`), rpc]);
    assert.deepEqual(structuredClone(fixture.evaluate("denied")), []); assert.equal(fixture.clears(), 1);
  }
});

void test("current inactive-cache profile refuses nonempty startup authority before any cache or RPC access", async () => {
  for (const before of ["location.href+='#id='+target.projectUuid;document.URL=location.href;", "gVars.currentProject.projectId=target.projectUuid;",
    "info.tabs.push({tabId:'hidden',data:{doctype:3,pid:'private'}});", "gVars.sessionStorageTabs.add('private');", "gVars.urlCmd='private';",
    "navigator.serviceWorker.controller={};", "Tabs.isOpenProjectDoc=false;", "PRO_EDITOR_VERSION='3.2.182';",
    String.raw`Tabs.containerIds[0]='editor-window-main\n';`,
    "Tabs.getActiveTab=function(){this.currentTabId='hidden';return 'tab_page1';};",
    "Tabs.getContainerInfo=function(){this.containerIds=[...this.containerIds];return info;};"]) {
    const fixture = environment({ before }); await assert.rejects(fixture.run(), { message: "CURRENT_UPLOAD_QUEUE_READ_REFUSED:HOST" });
    assert.equal(fixture.evaluate("calls.length"), 0); assert.deepEqual(structuredClone(fixture.evaluate("denied")), []);
  }
});

void test("current inactive-cache observer retains tab, restore, native method and browser owners across awaits", async () => {
  for (const change of ["gVars.sessionStorageTabs=new Set();", "info.tabs=[...info.tabs];", "Object.setPrototypeOf(gVars.messageBus,{rpcCall:Registry.prototype.rpcCall});",
    "SyntheticCacheStorage.prototype.match=()=>Promise.resolve(undefined);", "gVars.urlCmd='private';", "location.href=location.href.slice(0,-1);document.URL=location.href;",
    "Object.defineProperty(start.data,'pid',{get(){denied.push('getter');return undefined;}});"]) {
    const fixture = environment({ afterNative: `if(index===2){${change}}` });
    await assert.rejects(fixture.run(), { message: "CURRENT_UPLOAD_QUEUE_READ_REFUSED:PROJECT_CACHE" });
    assert.equal(fixture.evaluate("calls.length"), 2); assert.deepEqual(structuredClone(fixture.evaluate("denied")), []); assert.equal(fixture.clears(), 1);
  }
});

void test("present target or upload cache stops without reading response bodies or performing cleanup writes", async () => {
  for (const [presentAt, stage] of [[1, "TARGET_INACTIVE"], [2, "PROJECT_CACHE"], [4, "LOCAL_CACHE"]] as const) {
    const fixture = environment({ presentAt }); await assert.rejects(fixture.run(), { message: `CURRENT_UPLOAD_QUEUE_READ_REFUSED:${stage}` });
    assert.equal(fixture.evaluate("calls.length"), presentAt); assert.deepEqual(structuredClone(fixture.evaluate("denied")), []); assert.equal(fixture.clears(), 1);
  }
  const rejection = environment({ afterNative: "throw Object.defineProperty({},'message',{get(){denied.push('error-getter');return 'PRIVATE';}});" });
  await assert.rejects(rejection.run(), { message: "CURRENT_UPLOAD_QUEUE_READ_REFUSED:TARGET_INACTIVE" });
  assert.equal(rejection.evaluate("calls.length"), 1); assert.deepEqual(structuredClone(rejection.evaluate("denied")), []);
});

void test("current cache deadline prevents later calls after a delayed native match settles", async () => {
  const fixture = environment({ pendingAt: 2 }), running = fixture.run();
  for (let i = 0; i < 12; i += 1) { await Promise.resolve(); }
  assert.equal(fixture.evaluate("calls.length"), 2); fixture.expire();
  await assert.rejects(running, { message: "CURRENT_UPLOAD_QUEUE_READ_REFUSED:TIMEOUT" });
  fixture.evaluate("release();");
  for (let i = 0; i < 12; i += 1) { await Promise.resolve(); }
  assert.equal(fixture.evaluate("calls.length"), 2); assert.equal(fixture.clears(), 1); assert.deepEqual(structuredClone(fixture.evaluate("denied")), []);
});

void test("current cache schemas reject injected selectors, getters and unsupported authority claims", async () => {
  for (const invalid of [{ ...target, code: "private" }, { ...target, projectUuid: "a".repeat(32) }, { ...target, projectUuid: `${target.projectUuid}\n` },
    { ...target, branchUuid: "../private" }, Object.defineProperty({ branchUuid: target.branchUuid }, "projectUuid", { get(): never { throw new Error("getter invoked"); } })]) {
    assert.throws(() => buildCurrentUploadQueueReadExpression(invalid), { message: "CURRENT_UPLOAD_QUEUE_INPUT" });
  }
  const fixture = environment(), result = validateCurrentUploadQueueReadResult(structuredClone(await fixture.run()), target);
  for (const field of ["startupQualified", "persistenceVerified", "writerAuthority", "executionAuthorized"]) {
    assert.throws(() => validateCurrentUploadQueueReadResult({ ...result, [field]: true }, target), { message: "CURRENT_UPLOAD_QUEUE_RESULT" });
  }
  assert.throws(() => validateCurrentUploadQueueReadResult({ ...result, branchUuid: "c".repeat(32) }, target), { message: "CURRENT_UPLOAD_QUEUE_RESULT" });
  assert.throws(() => validateCurrentUploadQueueReadResult({ ...result, complete: true }, target), { message: "CURRENT_UPLOAD_QUEUE_INPUT" });
});

void test("current cache executable returns a bounded exact envelope without converting native failures or deadlines", async () => {
  const fixture = environment();
  const envelope = structuredClone(await fixture.runProgram());
  assert.ok(envelope !== null && typeof envelope === "object" && "json" in envelope && "utf8Bytes" in envelope);
  assert.equal(typeof envelope.json, "string");
  assert.equal(envelope.utf8Bytes, Buffer.byteLength(String(envelope.json), "utf8"));
  assert.ok(Buffer.byteLength(JSON.stringify(envelope), "utf8") <= CURRENT_UPLOAD_QUEUE_MAX_BYTES);
  const result = decodeCurrentUploadQueueReadReply(upstreamReply(envelope), target);
  assert.equal(result["profile"], CURRENT_UPLOAD_QUEUE_PROFILE); assert.equal(result["executionAuthorized"], false);
  assert.equal(Object.isFrozen(result), true); assert.equal(fixture.evaluate("calls.length"), 5);
  await assert.rejects(environment({ presentAt: 2 }).runProgram(), { message: "CURRENT_UPLOAD_QUEUE_READ_REFUSED:PROJECT_CACHE" });
  const pending = environment({ pendingAt: 2 }), running = pending.runProgram();
  for (let i = 0; i < 12; i += 1) { await Promise.resolve(); }
  assert.equal(pending.evaluate("calls.length"), 2); pending.expire();
  await assert.rejects(running, { message: "CURRENT_UPLOAD_QUEUE_READ_REFUSED:TIMEOUT" });
  pending.evaluate("release();");
  for (let i = 0; i < 12; i += 1) { await Promise.resolve(); }
  assert.equal(pending.evaluate("calls.length"), 2); assert.equal(pending.clears(), 1);
});

void test("current cache reply decoder rejects failure, timeout, malformed and oversized transport without granting authority", async () => {
  const payload = validateCurrentUploadQueueReadResult(structuredClone(await environment().run()), target), valid = encodeExactReadEnvelope(payload);
  for (const failure of [{ isError: true, content: [], structuredContent: { ok: false, error: "native failure" } },
    { content: [], structuredContent: { ok: true, result: { ok: false, error: "CURRENT_UPLOAD_QUEUE_READ_REFUSED:TIMEOUT" } } },
    { content: [], structuredContent: { ok: false, error: "Request timed out" } }]) {
    assert.throws(() => decodeCurrentUploadQueueReadReply(failure, target));
  }
  const oversized = `"${"é".repeat(CURRENT_UPLOAD_QUEUE_MAX_BYTES / 2)}"`;
  for (const invalid of [{ ...valid, schema: "wrong" }, { ...valid, utf8Bytes: valid.utf8Bytes + 1 },
    { schema: EXACT_READ_ENVELOPE_SCHEMA, utf8Bytes: 1, json: "{" },
    { schema: EXACT_READ_ENVELOPE_SCHEMA, utf8Bytes: Buffer.byteLength(oversized, "utf8"), json: oversized },
    { ...valid, extra: true }, encodeExactReadEnvelope({ ok: false, error: "CURRENT_UPLOAD_QUEUE_READ_REFUSED:TIMEOUT" }),
    encodeExactReadEnvelope({ ...payload, writerAuthority: true })]) {
    assert.throws(() => decodeCurrentUploadQueueReadReply(upstreamReply(invalid), target));
  }
  assert.throws(() => decodeCurrentUploadQueueReadReply(upstreamReply(valid), { ...target, branchUuid: "c".repeat(32) }));
});
