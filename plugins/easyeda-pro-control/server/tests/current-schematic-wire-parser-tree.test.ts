import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { Worker } from "node:worker_threads";
import { CurrentSchematicWireParserServiceCoordinator } from "../src/current-schematic-wire-parser-service-coordinator.ts";
import type { CurrentSchematicWireParserServiceCommand } from "../src/current-schematic-wire-parser-service-coordinator.ts";
import { CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_SOURCE as SOURCE } from "../src/current-schematic-wire-classic-rpc-source.ts";
import { wireSharedUiFixture } from "./helpers/current-schematic-wire-shared-ui-fixture.ts";
import { wireParserTreeFixture } from "./helpers/current-schematic-wire-parser-tree-fixture.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON,readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";

async function tick():Promise<void>{const task=Promise.withResolvers<null>();setImmediate(()=>{task.resolve(null);});await task.promise;}
for(const variant of[0,1]as const){for(const role of["objectContent","pageContent"]as const){void test(`Wire original parser and selected serial child ${String(variant)} / ${role}`,{timeout:45_000},async context=>{
 const source=await readConfiguredEasyedaAsset(SOURCE[variant].relativePath),uiSource=await readConfiguredEasyedaAsset(SOURCE[2].relativePath);if(source===null||uiSource===null){context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return;}
 const key=`__wireParserRpc${String(variant)}`,session=new Session(),uiKey=`${key}Ui`;session.connect();await session.post("Debugger.enable");let busScriptId="",scriptId="";
 session.on("Debugger.scriptParsed",event=>{if(event.params.url===`${key}.js`){scriptId=event.params.scriptId;}if(event.params.url===`${uiKey}.js`){busScriptId=event.params.scriptId;}});
 const ui:unknown=runInThisContext(`${wireSharedUiFixture(uiSource,"complete")}\n//# sourceURL=${uiKey}.js`);Object.defineProperty(globalThis,uiKey,{value:ui,configurable:true});
 const graph:unknown=runInThisContext(`${wireParserTreeFixture(source,variant,uiKey,role)}\n//# sourceURL=${key}.js`);assert.ok(graph!==null&&typeof graph==="object");Object.defineProperty(globalThis,key,{value:graph,configurable:true});session.disconnect();
 const done=Promise.withResolvers<unknown>(),worker=new Worker(new URL("helpers/current-schematic-wire-parser-tree-worker.ts",import.meta.url),{workerData:{key,scriptId,busScriptId,source,busSource:uiSource,variant}});
 context.after(async()=>{Reflect.deleteProperty(globalThis,key);Reflect.deleteProperty(globalThis,uiKey);await worker.terminate();});worker.on("error",done.reject);worker.on("message",(raw:unknown)=>{assert.ok(raw!==null&&typeof raw==="object");if("ready"in raw){const drive:unknown=Reflect.get(graph,"drive");assert.ok(typeof drive==="function");Reflect.apply(drive,graph,[]);}else{done.resolve(raw);}});
 const result=await done.promise;assert.ok(result!==null&&typeof result==="object");assert.ok(!("fixtureCleanupError"in result),JSON.stringify(result));
 assert.ok(!("error"in result)&&!("fixtureError"in result)&&!("fixtureTimeout"in result),JSON.stringify(result));assert.equal(Reflect.get(result,"completed"),true);assert.equal(Reflect.get(result,"pauses"),77);
 for(const field of["serviceDeliveryJoined","parserCompleted","saveAuthorized"]){assert.equal(Reflect.get(result,field),false);}
 const counts:unknown=Reflect.get(graph,"counts");assert.ok(counts!==null&&typeof counts==="object");assert.equal(Reflect.get(counts,"tree"),1);assert.equal(Reflect.get(counts,"annotation"),1);assert.equal(Reflect.get(counts,"titleData"),"{}");context.diagnostic(JSON.stringify(result));
});}}
void test("Wire unsupported idle tree tab refuses before any observation or mutation",{timeout:30_000},async context=>{
 const source=await readConfiguredEasyedaAsset(SOURCE[0].relativePath),uiSource=await readConfiguredEasyedaAsset(SOURCE[2].relativePath);if(source===null||uiSource===null){context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return;}
 const key="__wireUnsupportedTree",session=new Session(),uiKey=`${key}Ui`;session.connect();await session.post("Debugger.enable");let busScriptId="",scriptId="";
 session.on("Debugger.scriptParsed",event=>{if(event.params.url===`${key}.js`){scriptId=event.params.scriptId;}if(event.params.url===`${uiKey}.js`){busScriptId=event.params.scriptId;}});
 const ui:unknown=runInThisContext(`${wireSharedUiFixture(uiSource,"complete")}\n//# sourceURL=${uiKey}.js`);Object.defineProperty(globalThis,uiKey,{value:ui,configurable:true});
 const graph:unknown=runInThisContext(`${wireParserTreeFixture(source,0,uiKey).replace("C.leftTreeActiveTab=0","C.leftTreeActiveTab=2")}\n//# sourceURL=${key}.js`);Object.defineProperty(globalThis,key,{value:graph,configurable:true});session.disconnect();
 const done=Promise.withResolvers<unknown>(),worker=new Worker(new URL("helpers/current-schematic-wire-parser-tree-worker.ts",import.meta.url),{workerData:{key,scriptId,busScriptId,source,busSource:uiSource,variant:0}});
 context.after(async()=>{Reflect.deleteProperty(globalThis,key);Reflect.deleteProperty(globalThis,uiKey);await worker.terminate();});worker.on("error",done.reject);worker.on("message",done.resolve);
 const result=await done.promise;assert.ok(result!==null&&typeof result==="object"&&"fixtureError"in result,JSON.stringify(result));assert.ok(!("fixtureCleanupError"in result),JSON.stringify(result));assert.equal(Reflect.get(result,"armedRequests"),0);assert.equal(Reflect.get(result,"resumes"),0);
});


void test("Wire coordinator retains its original preflight request through simulated exit",{timeout:20_000},async context=>{
 const source=await readConfiguredEasyedaAsset(SOURCE[0].relativePath),uiSource=await readConfiguredEasyedaAsset(SOURCE[2].relativePath);
 if(source===null||uiSource===null){context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return;}
 const commands:CurrentSchematicWireParserServiceCommand[]=[],original=Promise.withResolvers<unknown>();let exited=false;
 const current=new CurrentSchematicWireParserServiceCoordinator({sessionId:"123.session",scriptId:"123.sch",busScriptId:"123.ui",holder:"123.holder",native:"123.native",variant:0,source:{scriptSource:source},busSource:{scriptSource:uiSource}},{
  request:(command:CurrentSchematicWireParserServiceCommand):Promise<unknown>=>{commands.push(command);return original.promise;},
  assertCurrent:():void=>{assert.equal(exited,false);},assertOriginalExit:():void=>{assert.equal(exited,true);},fail:(_cause:unknown):void=>{
   // The original rejection remains in the coordinator and request records.
  },
 });
 const run=current.run();let runCause:unknown="unsettled";const runSettlement=(async():Promise<void>=>{try{await run;}catch(error){runCause=error;}})();
 await tick();assert.equal(commands.length,1);exited=true;
 const retired=current.retireAfterOriginalExit();assert.equal(current.retireAfterOriginalExit(),retired);let observed=false;
 const observedRetirement=(async():Promise<void>=>{await retired;observed=true;})();await tick();assert.equal(observed,false);
 original.reject(null);await retired;await observedRetirement;await runSettlement;
 assert.equal(observed,true);assert.equal(runCause,null);assert.equal(commands.length,1);
 const kept=current.retained();assert.equal(kept.attempts[0]?.pending,original.promise);assert.equal(kept.attempts[0]?.cause,null);
});
