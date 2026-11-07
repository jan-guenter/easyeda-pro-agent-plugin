/** Exact harmless original early return; no scheduler/SQL/cache continuation. */
import assert from "node:assert/strict";
import { test } from "node:test";
import vm from "node:vm";
import { CURRENT_GENERATED_INITIAL_SYNC_CONDITION as CONDITION } from "../src/current-generated-initial-sync-condition.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_METHOD_SOURCE as METHODS } from "../src/current-project-save-producer-source.ts";
import { currentProjectSaveProducerNativeCases, validateCurrentProjectSaveProducerCommand } from "../src/current-project-save-producer-protocol.ts";

function fixture(): Readonly<{ run: (source: string) => unknown }> {
  const context = vm.createContext({});
  vm.runInContext(`let hooks=0;class Gd{isReadOnly(){return!!(this.isTemporary||this.isHistoryBack||this.isV2Format)}get isV2Format(){return this._isV2Format}set isV2Format(t){this._isV2Format=t,this._projectDetails&&(this._projectDetails.isV2Format=t)}}class Lg extends Gd{};const TP=new Lg;Object.assign(TP,{notSyncCloud:true,isTemporary:false,isHistoryBack:false,_isV2Format:false});
const originalSync=({${METHODS.syncCloud}}).syncCloud,condition=function(){return ${CONDITION}};`, context);
  return { run: (source: string): unknown => vm.runInContext(source, context) };
}
void test("the fixed predicate releases only original TP’s source-proved no-publication early return", async () => {
  const f = fixture(); assert.equal(f.run("condition.call(TP)"), false);
  assert.equal(await f.run('originalSync.call(TP,"unread-unused-argument")'), undefined); assert.equal(f.run("hooks"), 0);
  assert.equal(f.run('Object.hasOwn(TP,"task3")'), false); assert.equal(f.run('Object.hasOwn(TP,"pendingSyncCloud")'), false);
  for (const change of ['TP.notSyncCloud=false', 'delete TP.notSyncCloud', 'TP.isTemporary=true', 'TP.isHistoryBack=true', 'TP._isV2Format=true',
    'Gd.prototype.isReadOnly=function(){hooks++;return false}', 'Object.defineProperty(Gd.prototype,"isV2Format",{get(){hooks++;return false}})',
    'Object.defineProperty(TP,"notSyncCloud",{get(){hooks++;return true}})', 'Object.defineProperty(TP,"isTemporary",{get(){hooks++;return false}})']) {
    const changed = fixture(); changed.run(change); assert.equal(changed.run("condition.call(TP)"), true, change); assert.equal(changed.run("hooks"), 0);
  }
});
void test("foreign/proxy receivers and prototype substitutions pause before any proxy trap", () => {
  for (const invocation of ['condition.call(new Proxy(TP,{getOwnPropertyDescriptor(){hooks++;throw Error("trap")}}))',
    '(Object.setPrototypeOf(TP,new Proxy({}, {getPrototypeOf(){hooks++;throw Error("trap")}})),condition.call(TP))',
    '(Object.setPrototypeOf(Lg.prototype,new Proxy({}, {getOwnPropertyDescriptor(){hooks++;throw Error("trap")}})),condition.call(TP))']) {
    const f = fixture(); assert.equal(f.run(invocation), true); assert.equal(f.run("hooks"), 0);
  }
});
void test("only the fixed syncEntry arm receives this condition; arbitrary or missing conditions refuse", () => {
  for (const command of currentProjectSaveProducerNativeCases().filter(value => value.phase === "project-save-producer-arm")) {
    assert.equal(Object.hasOwn(command.params, "condition"), command.role === "syncEntry");
    if (command.role === "syncEntry") { const params = { location: command.params.location }; assert.throws(() => validateCurrentProjectSaveProducerCommand({ ...command, params })); }
    assert.throws(() => validateCurrentProjectSaveProducerCommand({ ...command, params: { ...command.params, condition: "false" } }));
    if (command.role !== "syncEntry") { assert.throws(() => validateCurrentProjectSaveProducerCommand({ ...command, params: { ...command.params, condition: CONDITION } })); }
  }
});
