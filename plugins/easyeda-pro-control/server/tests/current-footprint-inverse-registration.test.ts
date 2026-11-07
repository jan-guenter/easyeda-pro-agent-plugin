/** Fixed function in an inert VM and real Node streams only. No native owner,
 * application, config row, file path authority or connected SQL grant exists. */
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { once } from "node:events";
import { PassThrough, Writable } from "node:stream";
import { test } from "node:test";
import { setImmediate } from "node:timers/promises";
import { createContext, runInContext } from "node:vm";
import { sha256Text } from "../src/core.ts";
import { CurrentFootprintInversePipe, assertOriginalCurrentFootprintInversePipe } from "../src/current-pcb-diagnostic-pipe.ts";
import { CURRENT_FOOTPRINT_INVERSE_REGISTRATION_FUNCTION, decodeCurrentFootprintInverseRegistrationReply } from "../src/current-footprint-inverse-registration.ts";

const rawWindowsPath = String.raw`C:\Synthetic\Footprint_Validation.eprj2`;
const TARGET = Object.freeze({ rawWindowsPath, projectUuid: sha256Text(rawWindowsPath), branchUuid: "b".repeat(32), documentUuid: "c".repeat(16), expectedSourceSha256: "d".repeat(64) });
function wire(value: unknown): Buffer { return Buffer.from(`${JSON.stringify(value)}\0`); }
function environment(target: typeof TARGET, options: Readonly<{ prior?: boolean; changedPeer?: boolean; wrongPath?: boolean; loadedProject?: boolean }> = {}): Readonly<{
  run: () => Promise<unknown>; registrations: () => number;
}> {
  let registrations = 0;
  const context = createContext({ crypto: webcrypto, TextEncoder, target, register: () => { registrations += 1; }, options });
  runInContext(`
globalThis.location={href:'https://client/editor?cll=debug',origin:'https://client'};
globalThis.top=globalThis;globalThis.window=globalThis;
globalThis.document={defaultView:globalThis,nodeType:9,URL:location.href,querySelectorAll(selector){if(selector!=='iframe')throw new Error('selector');return {length:0};}};
globalThis.PRO_EDITOR_MODE='CLIENT-HALF_OFFLINE-EASYEDA-PCB-SCH-PANEL-SIM';
globalThis.registry={['9'.repeat(64)]:{path:'C:\\SyntheticPeer.eprj2',isCbb:false,name:'SyntheticPeer'}};
if(options.prior)registry[target.projectUuid]={path:target.rawWindowsPath,isCbb:false,readOnly:false};
class Bus { async rpcCall(name,args){if(name==='/pro-mgr/api/client/getProjectPaths')return {message:{success:true,result:registry}};
 if(name!=='/pro-mgr/api/client/openProject'||args.length!==1||args[0]!==target.rawWindowsPath)throw new Error('rpc');register();
 registry[target.projectUuid]={path:options.wrongPath?target.rawWindowsPath+'x':target.rawWindowsPath,isCbb:false,readOnly:false};
 if(options.changedPeer)registry['9'.repeat(64)].name='changed';return {message:{success:true,result:{[target.projectUuid]:registry[target.projectUuid]}}};} }
globalThis.gVars={currentProject:options.loadedProject?{projectId:target.projectUuid,branchUuid:target.branchUuid}:{branchUuid:''},isHistoryMode:false,messageBus:new Bus()};
globalThis.UI={gVars};
globalThis.start={tabId:'tab_page1',isAbleDelete:false,group:'start_blank',draggable:true,data:{doctype:-1},isDisplayNone:false};
globalThis.container={id:'editor-window-main',belong:'editor-window-main',tabs:[start],activeTabId:'tab_page1'};
class Tabs { static getActiveTab(){return this.currentTabId;} static getContainerInfo(id){if(id!==container.id)throw new Error('container');return container;} }
Tabs.currentTabId='tab_page1';Tabs.belongContainer='editor-window-main';Tabs.containerIds=['editor-window-main'];Tabs.containerTree={id:'editor-window-main'};UI.tabBar=Tabs;
`, context);
  const program = `(${CURRENT_FOOTPRINT_INVERSE_REGISTRATION_FUNCTION})(${JSON.stringify(target)})`;
  return { registrations: () => registrations, run: async () => {
    const pending: unknown = runInContext(program, context); const result: unknown = await pending; assert.equal(typeof result, "string"); assert.ok(typeof result === "string"); return JSON.parse(result) as unknown;
  } };
}
void test("inverse fixed registration preserves both original registry branches for the canonical copied footprint", async () => {
  for (const prior of [false, true]) {
    const env = environment(TARGET, { prior }), value = await env.run();
    const result = decodeCurrentFootprintInverseRegistrationReply({ result: { type: "string", value: JSON.stringify(value) } }, TARGET);
    assert.equal(env.registrations(), Number(!prior)); assert.equal(result.priorRegistrationPresent, prior);
    assert.equal(result.registrationDispatched, !prior); assert.equal(result.recentPathRowMayHaveChanged, !prior);
    assert.equal(result.projectNavigationDispatched, false); assert.equal(result.writerAuthority, false);
  }
});
void test("inverse fixed registration refuses path/hash mismatch, loaded UI and collateral registry mutation", async () => {
  for (const options of [{ loadedProject: true }, { wrongPath: true }, { changedPeer: true }]) {
    const env = environment(TARGET, options); await assert.rejects(env.run()); assert.equal(env.registrations(), options.loadedProject === true ? 0 : 1);
  }
  const wrong = environment({ ...TARGET, projectUuid: "e".repeat(64) }); await assert.rejects(wrong.run()); assert.equal(wrong.registrations(), 0);
});
void test("inverse intent pending proof requires its actual written original registration request", async context => {
  // oxlint-disable-next-line promise/prefer-await-to-callbacks -- Exercise the real Writable write-completion callback boundary.
  const input = new PassThrough(), output = new Writable({ write(_chunk, _encoding, callback): void { callback(); } });
  const pipe = new CurrentFootprintInversePipe(input, output); pipe.start();
  context.after(async () => { const closed = [input, output].filter(stream => !stream.closed).map(stream => once(stream, "close")); input.destroy(); output.destroy(); await Promise.all(closed); pipe.releaseClosedListeners(); });
  const events: unknown[] = []; const attach = pipe.attachTarget("target-1", event => { events.push(event); }); input.write(wire({ id: 1, result: { sessionId: "session-1" } })); await attach;
  assert.throws(() =>{  pipe.requireOriginalInverseProjectOpeningPending(TARGET); });
  assert.throws(() =>{  pipe.requireOriginalInverseNoDispatchResult(TARGET); });
  const preflight = pipe.preflightInverseProject("unique-1", TARGET); input.write(wire({ id: 2, result: {}, sessionId: "session-1" })); await preflight;
  assert.throws(() =>{  pipe.requireOriginalInverseProjectOpeningPending(TARGET); });
  const opening = pipe.dispatchInverseRegistration("unique-1", TARGET);
  const settled = (async (): Promise<unknown> => { try { return await opening; } catch (error) { return error; } })(); assert.throws(() =>{  pipe.requireOriginalInverseProjectOpeningPending(TARGET); });
  await setImmediate(); pipe.requireOriginalInverseProjectOpeningPending(TARGET); assert.throws(() =>{  pipe.requireOriginalInverseNoDispatchResult(TARGET); });
  assert.throws(() =>{  pipe.requireOriginalInverseProjectOpeningPending({ ...TARGET, documentUuid: "f".repeat(16) }); });
  assert.throws(() => pipe.dispatchInverseRegistration("unique-1", TARGET));
  const result = await environment(TARGET, { prior: true }).run();
  input.write(wire({ id: 3, result: { result: { type: "string", value: JSON.stringify(result) } }, sessionId: "session-1" })); assert.deepEqual(await opening, await settled);
  pipe.requireOriginalInverseNoDispatchResult(TARGET); assert.throws(() =>{  pipe.requireOriginalInverseNoDispatchResult({ ...TARGET, documentUuid: "e".repeat(16) }); });
  assert.throws(() =>{  pipe.requireOriginalInverseProjectOpeningPending(TARGET); }); assertOriginalCurrentFootprintInversePipe(pipe);
  const copy: unknown = Object.create(CurrentFootprintInversePipe.prototype); assert.throws(() => { Reflect.apply(assertOriginalCurrentFootprintInversePipe, undefined, [copy]); });
});
