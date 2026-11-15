/** Actual inert Inspector reflection metadata and same-root joins. Synthetic
 * old cache tuples supply no native owner or production provenance. */
import assert from "node:assert/strict";
import {Session} from "node:inspector/promises";
import {test} from "node:test";
import {createContext,runInContext} from "node:vm";
import {z} from "zod";
import {captureCurrentFootprintForwardWriterOwnData} from "../src/current-footprint-forward-writer-own-data-collector.ts";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_OWN_DATA_PROGRAMS as PROGRAMS,currentFootprintForwardWriterOwnDataProgram,qualifyCurrentFootprintForwardWriterOwnDataHelper,validateCurrentFootprintForwardWriterOwnDataCommand} from "../src/current-footprint-forward-writer-own-data-protocol.ts";
import type {CurrentFootprintForwardWriterOwnDataCommand as Command} from "../src/current-footprint-forward-writer-own-data-protocol.ts";

async function fixture(mode:"valid"|"foreign-root"|"foreign-project"|"project-getter"|"wrong-metadata"):Promise<void>{
 const name=`synthetic-full-own-data-${mode}`,session=new Session();session.connect();const contexts:{id:number;unique:string}[]=[];const helpers:{id:string;length:number|undefined;url:string}[]=[];
 session.on("Runtime.executionContextCreated",event=>{const actual=z.looseObject({name:z.string(),id:z.number(),uniqueId:z.string()}).parse(event.params.context);if(actual.name===name){contexts.push({id:actual.id,unique:actual.uniqueId});}});
 session.on("Debugger.scriptParsed",event=>{helpers.push({id:event.params.scriptId,length:event.params.length,url:event.params.url});});
 try{
  await session.post("Runtime.enable");await session.post("Debugger.enable");
  const context=createContext({},{name});runInContext('globalThis.PROJECT={};globalThis.foreign={};globalThis.getterCalls=0;globalThis.cacheTuple=Array.from({length:28},(_,i)=>i===0?globalThis:{});',context);
  if(mode==="foreign-root"){runInContext("cacheTuple[0]={}",context);}
  if(mode==="project-getter"){runInContext('Object.defineProperty(globalThis,"PROJECT",{get(){getterCalls+=1;return foreign;}})',context);}
  const selected=contexts[0];assert.ok(selected!==undefined&&contexts.length===1);
  const originalCache=await session.post("Runtime.evaluate",{contextId:selected.id,expression:"cacheTuple",returnByValue:false});assert.ok(originalCache.result.objectId!==undefined);
  const project=await session.post("Runtime.evaluate",{contextId:selected.id,expression:mode==="valid"||mode==="foreign-root"||mode==="wrong-metadata"?"PROJECT":"foreign",returnByValue:false});assert.ok(project.result.objectId!==undefined);
  let lastStart=0,normal=0,readSources=0;const phases:string[]=[];
  const request=async(command:Command):Promise<unknown>=>{
   validateCurrentFootprintForwardWriterOwnDataCommand(command);normal+=1;phases.push(command.phase);lastStart=helpers.length;
   if(mode==="wrong-metadata"&&command.phase==="forward-writer-own-data-native-0"){
    const wrong=await session.post("Runtime.evaluate",{contextId:selected.id,expression:"Object.hasOwn",returnByValue:false});assert.ok(wrong.result.objectId!==undefined);
    return session.post("Runtime.getProperties",{objectId:wrong.result.objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false});
   }
   if(command.method==="Runtime.callFunctionOn"){return session.post(command.method,command.params);}
   if(command.method==="Runtime.getProperties"){return session.post(command.method,command.params);}
   throw new Error("test-helper-source-uses-separate-custody");
  };
  const qualifyHelper=async(command:Command,program:string):Promise<void>=>{
   assert.equal(currentFootprintForwardWriterOwnDataProgram(command),program);const candidates=helpers.slice(lastStart).filter(row=>row.length===program.length+2&&row.url==="");assert.equal(candidates.length,1);
   const selectedHelper=candidates[0];assert.ok(selectedHelper!==undefined);const captured=await session.post("Debugger.getScriptSource",{scriptId:selectedHelper.id});readSources+=1;qualifyCurrentFootprintForwardWriterOwnDataHelper(captured.scriptSource,program);
  };
  const pending=captureCurrentFootprintForwardWriterOwnData({uniqueContextId:selected.unique,originalCacheTuple:originalCache.result.objectId,originalProject:project.result.objectId,assertCurrent:()=>{assert.equal(contexts.length,1);},request,qualifyHelper});
  if(mode==="valid"){const captured=await pending;assert.equal(captured.packets.length,20);assert.equal(normal,20);assert.equal(readSources,5);assert.equal(phases.at(-1),"forward-writer-own-data-rootJoin");assert.ok(captured.tuple!==originalCache.result.objectId&&captured.root!==project.result.objectId);}
  else{await assert.rejects(pending);assert.ok(normal<=20);if(mode==="wrong-metadata"){assert.equal(phases.at(-1),"forward-writer-own-data-native-0");assert.equal(readSources,1);}else{assert.equal(phases.at(-1),"forward-writer-own-data-rootJoin");}}
  assert.equal(runInContext("getterCalls",context),0);
 }finally{session.disconnect();}
}
void test("full reflection builds the exact eleven-item packet from qualified native metadata then joins its original root",async()=>{await fixture("valid");});
void test("foreign roots/projects, a PROJECT getter and substituted native metadata refuse before a packet can be retained",async()=>{
 for(const mode of ["foreign-root","foreign-project","project-getter","wrong-metadata"]as const){await fixture(mode);}
});
void test("a cache packet cannot be relabeled as reflection source and fixed programs cannot be supplied or changed",()=>{
 const params={objectGroup:"easyeda-footprint-forward-writer-own-data-v1",silent:true,generatePreview:false,throwOnSideEffect:true,awaitPromise:false,userGesture:false,objectId:"packet27",functionDeclaration:PROGRAMS.rootJoin,arguments:[{objectId:"cache28"},{objectId:"project29"}],returnByValue:true};
 assert.equal(validateCurrentFootprintForwardWriterOwnDataCommand({phase:"forward-writer-own-data-rootJoin",method:"Runtime.callFunctionOn",params}).phase,"forward-writer-own-data-rootJoin");
 assert.throws(()=>validateCurrentFootprintForwardWriterOwnDataCommand({phase:"forward-writer-own-data-rootJoin",method:"Runtime.callFunctionOn",params:{...params,functionDeclaration:"function(){return true;}"}}));
 assert.throws(()=>validateCurrentFootprintForwardWriterOwnDataCommand({phase:"forward-writer-own-data-rootJoin",method:"Runtime.callFunctionOn",params:{...params,arguments:[]}}));
 assert.throws(()=>{qualifyCurrentFootprintForwardWriterOwnDataHelper(`(${PROGRAMS.rootJoin}) `,PROGRAMS.rootJoin);});
});
