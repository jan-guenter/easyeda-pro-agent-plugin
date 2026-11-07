import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { test } from "node:test";
import { createContext, runInContext } from "node:vm";
import { qualifyGeneratedFixtureInitialSql } from "../src/managed-fixture-initial-sql.ts";
import type { QualifiedGeneratedPcbReadTarget as QualifiedGeneratedFixtureTarget } from "../src/managed-pcb-fixture-read-target.ts";
import { qualifyGeneratedPadFixtureInitialSql } from "../src/managed-pad-fixture-initial-sql.ts";
import { MANAGED_PAD_FIXTURE_KIND } from "../src/managed-pad-fixture-generator.ts";
import { buildGeneratedFixtureRegistrationProgram, generatedFixtureRegistrationResultSchema } from "../src/managed-fixture-registration-program.ts";
import { managedFixtureInitialSqlFixture } from "./helpers/managed-fixture-initial-sql.ts";

function environment(qualification: QualifiedGeneratedFixtureTarget, options: Readonly<{ prior?: boolean; changedPeer?: boolean; wrongPath?: boolean; loadedProject?: boolean }> = {}): Readonly<{
  run: () => Promise<unknown>; registrations: () => number;
}> {
  const target = qualification.target; let registrations = 0;
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
  const program = buildGeneratedFixtureRegistrationProgram(qualification);
  return { registrations: () => registrations, run: async () => {
    const result: unknown = runInContext(`(async function(){${program}})()`, context); return await result;
  } };
}
void test("fixed generated registration uses the inherited original RPC method, one exact path and unchanged complete peer roster", async () => {
  const result = await qualifyGeneratedFixtureInitialSql(await managedFixtureInitialSqlFixture());
  const native = environment(result.qualification), value = generatedFixtureRegistrationResultSchema.parse(await native.run());
  assert.equal(native.registrations(), 1); assert.equal(value.beforeCount, 1); assert.equal(value.afterCount, 2);
  assert.equal(value.registrationDispatched, true); assert.equal(value.recentPathRowMayHaveChanged, true);
  assert.equal(value.projectNavigationDispatched, false); assert.equal(value.persistentRegistrationVerified, false);
  const prior = environment(result.qualification, { prior: true });
  assert.equal(generatedFixtureRegistrationResultSchema.parse(await prior.run()).registrationDispatched, false); assert.equal(prior.registrations(), 0);
  assert.throws(() => buildGeneratedFixtureRegistrationProgram(structuredClone(result.qualification)));
});
void test("registration refuses loaded state before dispatch, wrong selected path and unrelated registry mutation without replay", async () => {
  const result = await qualifyGeneratedFixtureInitialSql(await managedFixtureInitialSqlFixture());
  for (const options of [{ loadedProject: true }, { wrongPath: true }, { changedPeer: true }]) {
    const native = environment(result.qualification, options); await assert.rejects(native.run());
    assert.equal(native.registrations(), options.loadedProject === true ? 0 : 1);
  }
});
void test("a genuine separate Pad initial target uses the same exact native-path registration prefix", async () => {
  const result = await qualifyGeneratedPadFixtureInitialSql(await managedFixtureInitialSqlFixture(undefined, MANAGED_PAD_FIXTURE_KIND));
  const native = environment(result.qualification), value = generatedFixtureRegistrationResultSchema.parse(await native.run());
  assert.equal(native.registrations(), 1); assert.equal(value.rawWindowsPath, result.qualification.target.rawWindowsPath);
  assert.equal(value.exactOtherRegistrationRosterUnchanged, true); assert.equal(value.persistentRegistrationVerified, false);
  assert.throws(() => buildGeneratedFixtureRegistrationProgram(structuredClone(result.qualification)));
});
