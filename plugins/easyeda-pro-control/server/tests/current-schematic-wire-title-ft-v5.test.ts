/** Exact original-source Inspector fixtures; no native Job or app mutation. */
import assert from "node:assert/strict";
import {Session} from "node:inspector/promises";
import {test} from "node:test";
import {runInThisContext} from "node:vm";
import {Worker} from "node:worker_threads";
import {CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_SOURCE as SOURCE} from "../src/current-schematic-wire-classic-rpc-source.ts";
import {wireSharedUiFixture} from "./helpers/current-schematic-wire-shared-ui-fixture.ts";
import {wireTitleFixture} from "./helpers/current-schematic-wire-title-fixture.ts";
import {INSTALLED_EASYEDA_SOURCE_SKIP_REASON,readConfiguredEasyedaAsset} from "./helpers/installed-easyeda-source.ts";

for(const[variant,tree,mode]of[[0,"objectContent","ft-v5-return"],[1,"pageContent","ft-v5-return"],[0,"objectContent","ft-v5-missing-return"],[0,"objectContent","ft-v5-foreign-request"]]as const){
 void test(`Wire V5 unconditional ft original return ${String(variant)} / ${mode}`,{timeout:45_000},async context=>{
  const source=await readConfiguredEasyedaAsset(SOURCE[variant].relativePath);const busSource=await readConfiguredEasyedaAsset(SOURCE[2].relativePath);if(source===null||busSource===null){context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return;}
  const key=`__wireV5Ft${String(variant)}${mode.replaceAll("-","")}`;const busKey=`${key}Ui`;const session=new Session();session.connect();await session.post("Debugger.enable");let scriptId="";let busScriptId="";
  session.on("Debugger.scriptParsed",event=>{if(event.params.url===`${key}.js`){scriptId=event.params.scriptId;}if(event.params.url===`${busKey}.js`){busScriptId=event.params.scriptId;}});
  const ui:unknown=runInThisContext(`${wireSharedUiFixture(busSource,"complete")}\n//# sourceURL=${busKey}.js`);Object.defineProperty(globalThis,busKey,{value:ui,configurable:true});
  const graph:unknown=runInThisContext(`${wireTitleFixture(source,variant,busKey,tree)}\n//# sourceURL=${key}.js`);assert.ok(graph!==null&&typeof graph==="object");Object.defineProperty(globalThis,key,{value:graph,configurable:true});session.disconnect();
  const done=Promise.withResolvers<unknown>();const worker=new Worker(new URL("helpers/current-schematic-wire-title-worker.ts",import.meta.url),{workerData:{key,scriptId,busScriptId,source,busSource,variant,mode}});context.after(async()=>{Reflect.deleteProperty(globalThis,key);Reflect.deleteProperty(globalThis,busKey);await worker.terminate();});
  worker.on("error",done.reject);worker.on("message",(raw:unknown)=>{assert.ok(raw!==null&&typeof raw==="object");if("ready"in raw){const drive:unknown=Reflect.get(graph,"drive");assert.ok(typeof drive==="function");Reflect.apply(drive,graph,[]);}else{done.resolve(raw);}});
  const result=await done.promise;assert.ok(result!==null&&typeof result==="object",JSON.stringify(result));assert.ok(!("fixtureTimeout"in result),JSON.stringify(result));
  if(mode==="ft-v5-return"){
   assert.ok(!("error"in result)&&!("fixtureError"in result),JSON.stringify(result));assert.equal(Reflect.get(result,"completed"),true);assert.equal(Reflect.get(result,"attempts"),1468);assert.equal(Reflect.get(result,"pauses"),84);assert.equal(Reflect.get(result,"sourceReads"),316);
   const ft:unknown=Reflect.get(result,"ft");assert.ok(ft!==null&&typeof ft==="object");assert.equal(Reflect.get(ft,"schema"),"private.schematic-wire-title-ft-unconditional.v1");assert.equal(Reflect.get(ft,"normalRequests"),37);assert.equal(Reflect.get(ft,"cleanupRequests"),1);assert.equal(Reflect.get(ft,"skippedArrayNormalReturns"),1);
   for(const flag of["unconditionalBreakpointCompared","ambientDebuggerConditionNotEvaluated","actualHeldParameterClassifiedWithRetainedNativePredicate","fixedFilterProgramSourcesCompared","originalFtNormalReturnPromiseRetainedBeforeResume","sameOriginalPromiseFulfilledUndefinedAfterResume"]){assert.equal(Reflect.get(ft,flag),true);}
   for(const flag of["originalNativeOwnerJoined","nativeGlobalsQualified","titleHelperRuntimeQualified","annotationReturnJoined","saveAuthorized"]){assert.equal(Reflect.get(ft,flag),false);}
  }else{assert.ok("error"in result||"fixtureError"in result,JSON.stringify(result));assert.equal(Reflect.get(result,"ft"),undefined);assert.equal(Reflect.get(result,"ftResumes"),1);assert.equal(typeof Reflect.get(result,"firstFailure"),"string");}
  context.diagnostic(JSON.stringify(result));
 });
}
