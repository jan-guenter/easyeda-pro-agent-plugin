import assert from "node:assert/strict";
import {Session} from "node:inspector/promises";
import {test} from "node:test";
import {runInThisContext} from "node:vm";
import {Worker} from "node:worker_threads";
import {CURRENT_SCHEMATIC_WIRE_PARSER_HELPERS as SOURCE} from "../src/current-schematic-wire-parser-source.ts";
import {wireParserHelperFixture} from "./helpers/current-schematic-wire-parser-helper-fixture.ts";
import {INSTALLED_EASYEDA_SOURCE_SKIP_REASON,readConfiguredEasyedaAsset} from "./helpers/installed-easyeda-source.ts";

function object(value:unknown):object{assert.ok(value!==null&&typeof value==="object");return value;}
for(const variant of[0,1] as const){void test(`Wire all original sheet-parser helpers ${String(variant)}`,{timeout:15_000},async context=>{
 const source=await readConfiguredEasyedaAsset(SOURCE[variant].relativePath);if(source===null){context.skip(INSTALLED_EASYEDA_SOURCE_SKIP_REASON);return;}
 const key=`__wireParserHelpers${String(variant)}`; const url=`${key}.js`;const session=new Session();session.connect();await session.post("Debugger.enable");let scriptId="";session.on("Debugger.scriptParsed",event=>{if(event.params.url===url){scriptId=event.params.scriptId}});const graph=object(runInThisContext(`${wireParserHelperFixture(source,variant)}\n//# sourceURL=${url}`));Object.defineProperty(globalThis,key,{value:graph,configurable:true});assert.ok(scriptId.length>0);session.disconnect();
 const done=Promise.withResolvers<unknown>(); const worker=new Worker(new URL("helpers/current-schematic-wire-parser-helper-worker.ts",import.meta.url),{workerData:{key,scriptId,variant}});context.after(async()=>{Reflect.deleteProperty(globalThis,key);await worker.terminate();});worker.on("error",done.reject);worker.on("message",(value:unknown)=>{const message=object(value);if("ready" in message){const invoke:unknown=Reflect.get(graph,"invoke");assert.ok(typeof invoke==="function");Reflect.apply(invoke,graph,[]);}else {done.resolve(value);}});
 const result=object(await done.promise);assert.ok(!("error" in result),JSON.stringify(result));assert.equal(Reflect.get(result,"reads"),23);assert.equal(Reflect.get(result,"functions"),21);assert.equal(Reflect.get(result,"helperClosureBindingsComplete"),false);assert.equal(Reflect.get(result,"parserCompleted"),false);assert.equal(Reflect.get(result,"saveAuthorized"),false);
});}
