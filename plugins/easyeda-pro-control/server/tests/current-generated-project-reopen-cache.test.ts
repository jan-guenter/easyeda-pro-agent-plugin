import {INSTALLED_EASYEDA_SOURCE_SKIP_REASON,readConfiguredEasyedaAsset} from "./helpers/installed-easyeda-source.ts";
/** Inert VM fixtures exercise fixed programs. They do not qualify native
 * CacheStorage metadata, issue worker custody or exercise a browser cache. */
import assert from "node:assert/strict";
import { test } from "node:test";
import vm from "node:vm";
import { CURRENT_GENERATED_PROJECT_REOPEN_CACHE_CALLS as CALLS, decodeCurrentGeneratedProjectReopenCacheAbsence } from "../src/current-generated-project-reopen-cache-programs.ts";
import { qualifyCurrentGeneratedProjectReopenCacheSource } from "../src/current-generated-project-reopen-cache-source.ts";

const project = "a".repeat(64);
function fixture(names: readonly string[] = []): Readonly<{ context: vm.Context; capture: unknown; bind: unknown; query: () => Promise<unknown>; stats: () => unknown; run: (code: string) => unknown }> {
  const context = vm.createContext({ names: [...names] });
  vm.runInContext(`let getterCalls=0,keyCalls=0,mutationCalls=0,pending=null;
function CacheStorage(){};Object.defineProperty(CacheStorage.prototype,"keys",{value:function keys(){keyCalls++;return pending||Promise.resolve([...names]);},writable:true,configurable:true,enumerable:true});
for(const name of ["open","delete"])Object.defineProperty(CacheStorage.prototype,name,{value:()=>{mutationCalls++;throw Error("mutation");},writable:true,configurable:true,enumerable:true});
const storage=new CacheStorage();Object.defineProperty(globalThis,"caches",{get:function(){getterCalls++;return storage;},configurable:true,enumerable:true});`, context);
  const capture: unknown = vm.runInContext(`(${CALLS.capture.program})()`, context);
  context["original"] = capture;
  const bind: unknown = vm.runInContext(`(${CALLS.bind.program}).call(original)`, context); context["bound"] = bind;
  return Object.freeze({ context, capture, bind, query: (): Promise<unknown> => Promise.resolve(vm.runInContext(`(${CALLS.absent.program}).call(bound,"${project}")`, context)),
    stats: (): unknown => vm.runInContext("JSON.stringify({getterCalls,keyCalls,mutationCalls})", context), run: (code: string): unknown => vm.runInContext(code, context) });
}
void test("fixed pre-script observation queries only native keys candidates and exposes no names or mutation", async () => {
  const f = fixture(["unrelated-user-cache", `project_${"b".repeat(64)}_v6`]);
  assert.equal(f.stats(), '{"getterCalls":1,"keyCalls":0,"mutationCalls":0}');
  const raw = await f.query(); const observation = decodeCurrentGeneratedProjectReopenCacheAbsence(structuredClone(raw));
  assert.equal(observation.cacheNamesExamined, 2); assert.equal(observation.executionAuthorized, false);
  assert.equal(f.stats(), '{"getterCalls":4,"keyCalls":1,"mutationCalls":0}');
  assert.throws(() => decodeCurrentGeneratedProjectReopenCacheAbsence({ ...observation, projectScriptStarted: true }));
  assert.throws(() => decodeCurrentGeneratedProjectReopenCacheAbsence({ ...observation, cacheNamesExamined: -0 }));
});
void test("either existing selected namespace refuses without opening, deleting or reading its values", async () => {
  for (const name of [`project_${project}_v6`, `localProject_${project}_v1`]) {
    const f = fixture([name]); await assert.rejects(f.query(), /GENERATED_REOPEN_CACHE/u);
    assert.equal(f.stats(), '{"getterCalls":3,"keyCalls":1,"mutationCalls":0}');
  }
});
void test("original project-script or native method drift during the original pending keys call refuses", async () => {
  for (const mutation of ["globalThis.PROJECT={}", "CacheStorage.prototype.keys=function keys(){return Promise.resolve([])}"]) {
    const f = fixture(); f.run("let finish;pending=new Promise(resolve=>finish=resolve)");
    const original = f.query(); f.run(mutation); f.run("finish([])"); await assert.rejects(original, /GENERATED_REOPEN_CACHE/u);
    assert.equal(f.run("mutationCalls"), 0);
  }
});
void test("candidate enumeration accessors and oversized replies refuse without invoking them", async () => {
  const f = fixture(); f.run('let touched=0;const reply=[];Object.defineProperty(reply,"0",{get(){touched++;return "x"},enumerable:true,configurable:true});pending=Promise.resolve(reply)');
  await assert.rejects(f.query(), /GENERATED_REOPEN_CACHE/u); assert.equal(f.run("touched"), 0);
  const large = fixture(); large.run("pending=Promise.resolve(Array(4097).fill('unrelated'))"); await assert.rejects(large.query(), /GENERATED_REOPEN_CACHE/u);
});
void test("actual pinned ordinary worker qualifies both cached and native loading branches", async t => {
  const source=await readConfiguredEasyedaAsset("pro-mgr/3.2.185.bf63a159/js/project-worker.js");if(source===null){t.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return;}
  qualifyCurrentGeneratedProjectReopenCacheSource(source);
  assert.throws(() => { qualifyCurrentGeneratedProjectReopenCacheSource(source.replace("function ud(e)", "function uD(e)")); }, /GENERATED_REOPEN_CACHE_SOURCE/u);
});
