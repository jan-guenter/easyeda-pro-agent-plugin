/* oxlint-disable import/max-dependencies -- Exercise actual installed source, original Inspector owner, lifecycle and strict request budgets together. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { Worker } from "node:worker_threads";
import { CurrentSchematicWireParserServiceCoordinator } from "../src/current-schematic-wire-parser-service-coordinator.ts";
import type { CurrentSchematicWireParserServiceCommand } from "../src/current-schematic-wire-parser-service-coordinator.ts";
import {CURRENT_SCHEMATIC_WIRE_TITLE_FT_REQUESTS as FT_LIMIT,validateCurrentSchematicWireTitleFtCommand as validateFt}from"../src/current-schematic-wire-title-ft-protocol.ts";
import {CURRENT_SCHEMATIC_WIRE_TITLE_REQUESTS as TITLE_LIMIT,validateCurrentSchematicWireTitleCommand as validateTitle}from"../src/current-schematic-wire-title-protocol.ts";
import { CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_SOURCE as SOURCE } from "../src/current-schematic-wire-classic-rpc-source.ts";
import { wireSharedUiFixture } from "./helpers/current-schematic-wire-shared-ui-fixture.ts";
import { wireTitleFixture } from "./helpers/current-schematic-wire-title-fixture.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON,readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";

async function tick():Promise<void>{const task=Promise.withResolvers<null>();setImmediate(()=>{task.resolve(null);});await task.promise;}
for(const variant of[0,1]as const){for(const role of["objectContent","pageContent"]as const){void test(`Wire original flat title callback ${String(variant)} / ${role}`,{timeout:45_000},async context=>{
 const source=await readConfiguredEasyedaAsset(SOURCE[variant].relativePath),uiSource=await readConfiguredEasyedaAsset(SOURCE[2].relativePath);if(source===null||uiSource===null){context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return;}
 const key=`__wireParserRpc${String(variant)}`,session=new Session(),uiKey=`${key}Ui`;session.connect();await session.post("Debugger.enable");let busScriptId="",scriptId="";
 session.on("Debugger.scriptParsed",event=>{if(event.params.url===`${key}.js`){scriptId=event.params.scriptId;}if(event.params.url===`${uiKey}.js`){busScriptId=event.params.scriptId;}});
 const ui:unknown=runInThisContext(`${wireSharedUiFixture(uiSource,"complete")}\n//# sourceURL=${uiKey}.js`);Object.defineProperty(globalThis,uiKey,{value:ui,configurable:true});
 const graph:unknown=runInThisContext(`${wireTitleFixture(source,variant,uiKey,role)}\n//# sourceURL=${key}.js`);assert.ok(graph!==null&&typeof graph==="object");Object.defineProperty(globalThis,key,{value:graph,configurable:true});session.disconnect();
 const done=Promise.withResolvers<unknown>(),worker=new Worker(new URL("helpers/current-schematic-wire-title-worker.ts",import.meta.url),{workerData:{key,scriptId,busScriptId,source,busSource:uiSource,variant}});
 context.after(async()=>{Reflect.deleteProperty(globalThis,key);Reflect.deleteProperty(globalThis,uiKey);await worker.terminate();});worker.on("error",done.reject);worker.on("message",(raw:unknown)=>{assert.ok(raw!==null&&typeof raw==="object");if("ready"in raw){const drive:unknown=Reflect.get(graph,"drive");assert.ok(typeof drive==="function");Reflect.apply(drive,graph,[]);}else{done.resolve(raw);}});
 const result=await done.promise;assert.ok(result!==null&&typeof result==="object");assert.ok(!("fixtureCleanupError"in result),JSON.stringify(result));
 assert.ok(!("error"in result)&&!("fixtureError"in result)&&!("fixtureTimeout"in result),JSON.stringify(result));assert.equal(Reflect.get(result,"completed"),true);assert.equal(Reflect.get(result,"pauses"),82);assert.equal(Reflect.get(result,"attempts"),1430);assert.equal(Reflect.get(result,"sourceReads"),305);
 for(const field of["serviceDeliveryJoined","parserCompleted","saveAuthorized"]){assert.equal(Reflect.get(result,field),false);}
 const counts:unknown=Reflect.get(graph,"counts");assert.ok(counts!==null&&typeof counts==="object");assert.equal(Reflect.get(counts,"tree"),1);assert.equal(Reflect.get(counts,"annotation"),1);assert.equal(Reflect.get(counts,"titleData"),"{}");context.diagnostic(JSON.stringify(result));
});}}

for(const mode of["surplus-sheet","wrong-enum","swap-helper","missing-return"]as const){void test(`Wire title refuses ${mode} with its original source owner`,{timeout:45_000},async context=>{
 const source=await readConfiguredEasyedaAsset(SOURCE[0].relativePath),uiSource=await readConfiguredEasyedaAsset(SOURCE[2].relativePath);if(source===null||uiSource===null){context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return;}
 const key=`__wireTitleRefusal${mode.replaceAll("-","")}`,session=new Session(),uiKey=`${key}Ui`;session.connect();await session.post("Debugger.enable");let busScriptId="",scriptId="";
 session.on("Debugger.scriptParsed",event=>{if(event.params.url===`${key}.js`){scriptId=event.params.scriptId;}if(event.params.url===`${uiKey}.js`){busScriptId=event.params.scriptId;}});
 const ui:unknown=runInThisContext(`${wireSharedUiFixture(uiSource,"complete")}\n//# sourceURL=${uiKey}.js`);Object.defineProperty(globalThis,uiKey,{value:ui,configurable:true});
 let fixture=wireTitleFixture(source,0,uiKey);const marker="state.modifyAttempted=false;return{";assert.equal(fixture.split(marker).length,2);
 if(mode==="surplus-sheet"){fixture=fixture.replace(marker,`Z.pureSheets.surplus={};${marker}`);}else if(mode==="wrong-enum"){fixture=fixture.replace("SCH:1","SCH:9");}else if(mode==="swap-helper"){fixture=fixture.replace(marker,"state.modifyAttempted=false;return{faultTitle(){oi=value=>value;},");}
 const graph:unknown=runInThisContext(`${fixture}\n//# sourceURL=${key}.js`);assert.ok(graph!==null&&typeof graph==="object");Object.defineProperty(globalThis,key,{value:graph,configurable:true});session.disconnect();
 const done=Promise.withResolvers<unknown>(),worker=new Worker(new URL("helpers/current-schematic-wire-title-worker.ts",import.meta.url),{workerData:{key,scriptId,busScriptId,source,busSource:uiSource,variant:0,mode}});
 context.after(async()=>{Reflect.deleteProperty(globalThis,key);Reflect.deleteProperty(globalThis,uiKey);await worker.terminate();});worker.on("error",done.reject);worker.on("message",(raw:unknown)=>{assert.ok(raw!==null&&typeof raw==="object");if("ready"in raw){if(mode==="swap-helper"){const fault:unknown=Reflect.get(graph,"faultTitle");assert.ok(typeof fault==="function");Reflect.apply(fault,graph,[]);}const drive:unknown=Reflect.get(graph,"drive");assert.ok(typeof drive==="function");Reflect.apply(drive,graph,[]);}else{done.resolve(raw);}});
 const result=await done.promise;assert.ok(result!==null&&typeof result==="object",JSON.stringify(result));assert.ok(!("fixtureCleanupError"in result),JSON.stringify(result));assert.ok("error"in result||"fixtureError"in result,JSON.stringify(result));assert.ok(!("fixtureTimeout"in result),JSON.stringify(result));
 if(mode==="surplus-sheet"||mode==="wrong-enum"){assert.equal(Reflect.get(result,"armedRequests"),0);assert.equal(Reflect.get(result,"resumes"),0);}else{const failure:unknown=Reflect.get(result,"firstFailure");assert.equal(typeof failure,"string");if(typeof failure==="string"){assert.ok(failure.includes(mode==="missing-return"?"current-schematic-wire-title-source":"current-schematic-wire-completion-source"),failure);}}
 const counts:unknown=Reflect.get(graph,"counts");assert.ok(counts!==null&&typeof counts==="object");if(mode==="surplus-sheet"||mode==="wrong-enum"){assert.equal(Reflect.get(counts,"annotation"),undefined);}else{const calls:unknown=Reflect.get(counts,"annotation");assert.ok(calls===undefined||calls===1);}
});}
void test("Wire title typed programs reject arbitrary source and preserve the finite joint",()=>{
 assert.throws(()=>validateTitle({phase:"wire-title-call",role:"query",method:"Runtime.callFunctionOn",params:{functionDeclaration:"function(){return true}"}}));
 assert.throws(()=>validateTitle({phase:"wire-title-arm",variant:0,point:"entry",method:"Debugger.setBreakpoint",params:{location:{scriptId:"123.4",lineNumber:3697,columnNumber:41_924}}}));
 assert.equal(TITLE_LIMIT.aggregateNormal,1981+TITLE_LIMIT.preflight+TITLE_LIMIT.preflightSources+TITLE_LIMIT.runtime);
 assert.equal(TITLE_LIMIT.aggregateCleanup,61+TITLE_LIMIT.cleanup);assert.equal(TITLE_LIMIT.pauseCount,5);
});
void test("Wire title preparation drains the same pending original request through simulated exit",{timeout:20_000},async context=>{
 const source=await readConfiguredEasyedaAsset(SOURCE[0].relativePath),uiSource=await readConfiguredEasyedaAsset(SOURCE[2].relativePath);if(source===null||uiSource===null){context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return;}
 const commands:CurrentSchematicWireParserServiceCommand[]=[],original=Promise.withResolvers<unknown>();let exited=false;
 const current=new CurrentSchematicWireParserServiceCoordinator({sessionId:"123.session",scriptId:"123.sch",busScriptId:"123.ui",holder:"123.holder",native:"123.native",variant:0,source:{scriptSource:source},busSource:{scriptSource:uiSource}},{
  request:(command:CurrentSchematicWireParserServiceCommand):Promise<unknown>=>{commands.push(command);return original.promise;},assertCurrent:():void=>{assert.equal(exited,false);},assertOriginalExit:():void=>{assert.equal(exited,true);},fail:(_cause:unknown):void=>{
   // Keep the original rejection through this fixture's simulated exit.
  },
 });
 const pending=current.prepareTitleFtReturn();assert.equal(pending,current.prepareTitleFtReturn());let cause:unknown="unsettled";const finished=(async():Promise<void>=>{try{await pending;}catch(error){cause=error;}})();
 await tick();assert.equal(commands.length,1);exited=true;const retired=current.retireAfterOriginalExit();assert.equal(retired,current.retireAfterOriginalExit());let observed=false;const watch=(async():Promise<void>=>{await retired;observed=true;})();await tick();assert.equal(observed,false);original.reject(null);await retired;await watch;await finished;assert.equal(observed,true);assert.equal(cause,null);assert.equal(commands.length,1);assert.equal(current.retained().attempts[0]?.pending,original.promise);
});

for(const [variant,role,mode]of[[0,"objectContent","ft-return"],[1,"pageContent","ft-return"],[0,"objectContent","ft-missing-return"],[0,"objectContent","ft-foreign-request"],[0,"objectContent","ft-native-predicate"]]as const){
 void test(`Wire shared ft original return ${String(variant)} / ${mode}`,{timeout:45_000},async context=>{
  const source=await readConfiguredEasyedaAsset(SOURCE[variant].relativePath),uiSource=await readConfiguredEasyedaAsset(SOURCE[2].relativePath);if(source===null||uiSource===null){context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return;}
  const key=`__wireFt${String(variant)}${mode.replaceAll("-","")}`,uiKey=`${key}Ui`;const session=new Session();session.connect();await session.post("Debugger.enable");let busScriptId="",scriptId="";
  session.on("Debugger.scriptParsed",event=>{if(event.params.url===`${key}.js`){scriptId=event.params.scriptId;}if(event.params.url===`${uiKey}.js`){busScriptId=event.params.scriptId;}});
  const ui:unknown=runInThisContext(`${wireSharedUiFixture(uiSource,"complete")}\n//# sourceURL=${uiKey}.js`);Object.defineProperty(globalThis,uiKey,{value:ui,configurable:true});
  const graph:unknown=runInThisContext(`${wireTitleFixture(source,variant,uiKey,role)}\n//# sourceURL=${key}.js`);assert.ok(graph!==null&&typeof graph==="object");Object.defineProperty(globalThis,key,{value:graph,configurable:true});session.disconnect();
  const done=Promise.withResolvers<unknown>(),worker=new Worker(new URL("helpers/current-schematic-wire-title-worker.ts",import.meta.url),{workerData:{key,scriptId,busScriptId,source,busSource:uiSource,variant,mode}});
  context.after(async()=>{Reflect.deleteProperty(globalThis,key);Reflect.deleteProperty(globalThis,uiKey);await worker.terminate();});
  worker.on("error",done.reject);worker.on("message",(raw:unknown)=>{assert.ok(raw!==null&&typeof raw==="object");if("ready"in raw){const drive:unknown=Reflect.get(graph,"drive");assert.ok(typeof drive==="function");Reflect.apply(drive,graph,[]);}else{done.resolve(raw);}});
  const result=await done.promise;assert.ok(result!==null&&typeof result==="object",JSON.stringify(result));assert.ok(!("fixtureCleanupError"in result),JSON.stringify(result));assert.ok(!("fixtureTimeout"in result),JSON.stringify(result));
  if(mode==="ft-return"){
   assert.ok(!("error"in result)&&!("fixtureError"in result),JSON.stringify(result));assert.equal(Reflect.get(result,"completed"),true);
   assert.equal(Reflect.get(result,"attempts"),1461);assert.equal(Reflect.get(result,"pauses"),83);assert.equal(Reflect.get(result,"sourceReads"),315);
   const ft:unknown=Reflect.get(result,"ft");assert.ok(ft!==null&&typeof ft==="object");assert.equal(Reflect.get(ft,"normalRequests"),30);assert.equal(Reflect.get(ft,"cleanupRequests"),FT_LIMIT.cleanup);
   assert.equal(Reflect.get(ft,"originalFtNormalReturnPromiseRetainedBeforeResume"),true);assert.equal(Reflect.get(ft,"sameOriginalPromiseFulfilledUndefinedAfterResume"),true);
   for(const flag of["originalNativeOwnerJoined","nativeGlobalsQualified","titleHelperRuntimeQualified","annotationReturnJoined","saveAuthorized"]){assert.equal(Reflect.get(ft,flag),false);}
  }
  else{assert.ok("error"in result||"fixtureError"in result,JSON.stringify(result));assert.equal(Reflect.get(result,"ft"),undefined);if(mode==="ft-native-predicate"){assert.equal(Reflect.get(result,"armedRequests"),0);assert.equal(Reflect.get(result,"resumes"),0);}else{assert.equal(Reflect.get(result,"ftResumes"),0);const failure:unknown=Reflect.get(result,"firstFailure");assert.equal(typeof failure,"string");if(typeof failure==="string"){assert.ok(failure.includes(mode==="ft-missing-return"?"decodeCurrentSchematicWireTitleFtPause":"#processFt"),failure);}}}context.diagnostic(JSON.stringify(result));
 });
}
void test("shared ft vocabulary and reservation remain separate from historical title V1",()=>{
 assert.equal(FT_LIMIT.normal,42);assert.equal(FT_LIMIT.cleanup,1);assert.equal(FT_LIMIT.aggregateNormal,TITLE_LIMIT.aggregateNormal+42);
 assert.throws(()=>validateFt({phase:"wire-title-ft-frame",method:"Debugger.evaluateOnCallFrame",params:{expression:"caller supplied"}}));
 assert.throws(()=>validateFt({phase:"wire-title-ft-arm",variant:0,method:"Debugger.setBreakpoint",params:{location:{scriptId:"123.4",lineNumber:6,columnNumber:4892}}}));
});
