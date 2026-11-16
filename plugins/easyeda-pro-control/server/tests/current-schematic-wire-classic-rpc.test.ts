import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { test } from "node:test";
import { runInThisContext } from "node:vm";
import { Worker } from "node:worker_threads";
import { CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_SOURCE as SOURCE } from "../src/current-schematic-wire-classic-rpc-source.ts";
import { wireClassicRpcFixture } from "./helpers/current-schematic-wire-classic-rpc-fixture.ts";
import { INSTALLED_EASYEDA_SOURCE_SKIP_REASON,readConfiguredEasyedaAsset } from "./helpers/installed-easyeda-source.ts";

function object(input:unknown):object{assert.ok(input!==null&&typeof input==="object");return input;}
for(const[variant,mode]of[[0,"complete"],[1,"complete"],[0,"foreign"]]as const){void test(`Wire original classic RPC callbacks/races ${String(variant)} / ${mode}`,{timeout:40_000},async context=>{
 const source=await readConfiguredEasyedaAsset(SOURCE[variant].relativePath);if(source===null){context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return;}
 const key=`__wireClassicRpc${String(variant)}${mode}`,url=`${key}.js`;const session=new Session();session.connect();await session.post("Debugger.enable");let scriptId="";
 session.on("Debugger.scriptParsed",event=>{if(event.params.url===url){scriptId=event.params.scriptId}});
 const graph=object(runInThisContext(`${wireClassicRpcFixture(source,variant,mode)}\n//# sourceURL=${url}`));assert.ok(scriptId.length>0);Object.defineProperty(globalThis,key,{value:graph,configurable:true});session.disconnect();
 const done=Promise.withResolvers<unknown>();const worker=new Worker(new URL("helpers/current-schematic-wire-classic-rpc-worker.ts",import.meta.url),{workerData:{key,scriptId,variant}});
 context.after(async()=>{Reflect.deleteProperty(globalThis,key);await worker.terminate();});worker.on("error",done.reject);
 worker.on("message",(input:unknown)=>{const value=object(input);if("ready"in value){const drive:unknown=Reflect.get(graph,"drive");assert.ok(typeof drive==="function");Reflect.apply(drive,graph,[]);}else{done.resolve(input);}});
 const result=object(await done.promise);assert.ok(!("fixtureCleanupError"in result),JSON.stringify(result));if(mode==="foreign"){assert.ok("error"in result,JSON.stringify(result));assert.match(String(Reflect.get(result,"error")),/SCH209_WIRE_CLASSIC_RPC/u);return;}assert.ok(!("error"in result),JSON.stringify(result));assert.deepEqual(Reflect.get(result,"roles"),["closing","language","titles"]);assert.equal(Reflect.get(result,"same"),true);
 for(const field of["rpcCompleted","saveAuthorized","timeoutCleanupVerified"]){assert.equal(Reflect.get(result,field),false);}
 const timers:unknown=Reflect.get(graph,"timers");assert.ok(Array.isArray(timers));assert.equal(timers.length,3);context.diagnostic(JSON.stringify(result));
});}
