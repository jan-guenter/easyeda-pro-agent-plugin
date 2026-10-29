/** Actual fixed209 queue program and envelopes in an isolated synthetic page.
 * No native CacheStorage identity, live absence or saved acceptance is claimed. */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { CURRENT_FOOTPRINT_COPY_SAVED_QUEUE_FUNCTION, currentFootprintCopySavedQueueCommand, decodeCurrentFootprintCopySavedQueueReply } from "../src/current-footprint-copy-saved-queue.ts";
import { CURRENT_FOOTPRINT_COPY_SAVED_START_PAGE_GUARD, CURRENT_FOOTPRINT_COPY_SAVED_START_PAGE_PROFILE } from "../src/current-footprint-copy-saved-start-page.ts";
import { currentFootprintCopySavedQueueWire } from "../src/current-footprint-copy-saved-queue-wire.ts";
import { buildCurrentStartPageGuard } from "../src/current-start-page.ts";
import { CURRENT_UPLOAD_QUEUE_PROFILE, buildCurrentUploadQueueReadExpression } from "../src/current-upload-queue-read.ts";

const target = Object.freeze({ projectUuid: "a".repeat(64), branchUuid: "b".repeat(32) });
const command = currentFootprintCopySavedQueueCommand({ sessionId: "parent", uniqueContextId: "original", ...target });
function fixture(version = "3.2.209"): Readonly<{ run: () => Promise<unknown>; legacy: () => Promise<unknown>; calls: () => unknown }> {
  const context = createContext({
    setTimeout(_callback: () => void, milliseconds: number): number { assert.equal(milliseconds, 10_000); return 7; },
    clearTimeout(timer: unknown): void { assert.equal(timer, 7); },
  });
  runInContext(`globalThis.window=globalThis;globalThis.top=globalThis;
globalThis.location={href:'https://client/editor?cll=warn#',origin:'https://client'};
globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href};
globalThis.navigator={serviceWorker:{controller:null}};globalThis.calls=[];
globalThis.PRO_EDITOR_MODE='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM';globalThis.PRO_EDITOR_VERSION=${JSON.stringify(version)};
globalThis.start={tabId:'tab_page1',data:{doctype:-1},isAbleDelete:false,group:'start_blank',draggable:true,isDisplayNone:false};
globalThis.info={id:'editor-window-main',belong:'editor-window-main',tabs:[start],activeTabId:'tab_page1'};
class Tabs{static containerIds=['editor-window-main'];static containerTree={id:'editor-window-main'};static belongContainer='editor-window-main';static currentTabId='tab_page1';static isOpenProjectDoc=true;static isOpenOtherDoc=true;static getActiveTab(){return this.currentTabId;}static getContainerInfo(id){return id===info.id?info:null;}}
class Registry{async rpcCall(...args){if(this!==gVars.messageBus)throw Error('RPC_RECEIVER');calls.push(['rpc',...args]);return {message:false};}}
class SyntheticCacheStorage{async match(...args){if(this!==caches)throw Error('CACHE_RECEIVER');calls.push(['match',...args]);return undefined;}open(){throw Error('FORBIDDEN_OPEN');}keys(){throw Error('FORBIDDEN_KEYS');}delete(){throw Error('FORBIDDEN_DELETE');}}
globalThis.CacheStorage=SyntheticCacheStorage;globalThis.caches=new SyntheticCacheStorage();
globalThis.gVars={currentProject:{projectId:undefined,branchUuid:''},isHistoryMode:false,messageBus:new Registry(),sessionStorageTabs:new Set(),urlCmd:null};
globalThis.UI={gVars,tabBar:Tabs};`, context, { timeout: 1000 });
  return Object.freeze({
    run: (): Promise<unknown> => Promise.resolve(runInContext(`(${command.params.functionDeclaration})(${JSON.stringify(target.projectUuid)},${JSON.stringify(target.branchUuid)})`, context, { timeout: 1000 }) as unknown),
    legacy: (): Promise<unknown> => Promise.resolve(runInContext(buildCurrentUploadQueueReadExpression(target), context, { timeout: 1000 }) as unknown),
    calls: (): unknown => structuredClone(runInContext("calls", context, { timeout: 1000 }) as unknown),
  });
}

void test("fixed209 saved queue probes both inactive-target namespaces and decodes its actual CDP envelope", async () => {
  const page = fixture(), value = await page.run(); assert.equal(typeof value, "string");
  const decoded = decodeCurrentFootprintCopySavedQueueReply({ result: { type: "string", value } }, target);
  assert.deepEqual(decoded, { profile: CURRENT_UPLOAD_QUEUE_PROFILE, ...target, origin: "https://client", projectV6UploadAbsent: true,
    localProjectV1UploadAbsent: true, scope: "point-in-time-inactive-target", startupQualified: false, persistenceVerified: false,
    writerAuthority: false, executionAuthorized: false });
  const rpc = ["rpc", "/pro-mgr/hasProject", [target.projectUuid]];
  const cache = (name: string): unknown => ["match", `https://client/upload/${target.branchUuid}`,
    { cacheName: name, ignoreSearch: true, ignoreMethod: false, ignoreVary: true }];
  assert.deepEqual(page.calls(), [rpc, cache(`project_${target.projectUuid}_v6`), rpc, cache(`localProject_${target.projectUuid}_v1`), rpc]);
  assert.equal(currentFootprintCopySavedQueueWire({ ...command, phase: "saved-upload-queue" }, 1).request["action"], "footprint-saved-upload-queue");
  assert.ok(Buffer.byteLength(JSON.stringify(command)) <= 16_384);
  assert.equal(CURRENT_FOOTPRINT_COPY_SAVED_QUEUE_FUNCTION.includes("version!=='3.2.209'"), true);
  assert.equal(CURRENT_FOOTPRINT_COPY_SAVED_QUEUE_FUNCTION.includes("version!=='3.2.206'"), false);
});

void test("saved209 and legacy206 guards remain separate and refuse wrong versions before any native call", async () => {
  const currentPage = fixture(), oldPage = fixture("3.2.206");
  await assert.rejects(oldPage.run(), /CURRENT_UPLOAD_QUEUE_READ_REFUSED:HOST/u); assert.deepEqual(oldPage.calls(), []);
  await assert.rejects(currentPage.legacy(), /CURRENT_UPLOAD_QUEUE_READ_REFUSED:HOST/u); assert.deepEqual(currentPage.calls(), []);
  const profile = CURRENT_FOOTPRINT_COPY_SAVED_START_PAGE_PROFILE;
  assert.equal(createHash("sha256").update(buildCurrentStartPageGuard()).digest("hex"), profile.legacyGuard.sha256);
  assert.equal(createHash("sha256").update(CURRENT_FOOTPRINT_COPY_SAVED_START_PAGE_GUARD).digest("hex"), profile.savedGuard.sha256);
  assert.equal(profile.ui.scriptSha256, "3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6");
  assert.equal(profile.nativeCacheMatchQualified, false); assert.equal(Object.isFrozen(profile), true);
});
