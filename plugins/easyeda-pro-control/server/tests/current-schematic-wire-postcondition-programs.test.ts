import assert from "node:assert/strict";
 import type {Runtime} from "node:inspector";
import {Session} from "node:inspector/promises";
 import {test} from "node:test";
 import {Script} from "node:vm";
 import {CURRENT_SCHEMATIC_WIRE_POSTCONDITION_LIMIT as LIMIT,currentSchematicWirePostconditionCall,validateCurrentSchematicWirePostconditionCommand} from "../src/current-schematic-wire-postcondition-protocol.ts";
 import {CURRENT_SCHEMATIC_WIRE_POSTCONDITION_PROGRAMS as PROGRAMS} from "../src/current-schematic-wire-postcondition-programs.ts";
 import {CURRENT_SCHEMATIC_WIRE_WRITER_FLAGS as FLAGS} from "../src/current-schematic-wire-writer-protocol.ts";
import {qualifyCurrentSchematicWirePostconditionGuard} from "../src/current-schematic-wire-postcondition-source.ts";

 void test("postcondition grammar preserves finite fixed programs and rejects caller code",()=>{
  for(const body of Object.values(PROGRAMS)){assert.doesNotThrow(()=>new Script(`(${body})`));assert.ok(body.length<=16_384);}
  const command=currentSchematicWirePostconditionCall("guardFactory","123.1.2",Array.from({length:7},()=>"123.1.3"));
  assert.throws(()=>validateCurrentSchematicWirePostconditionCommand({...command,params:{...command.params,throwOnSideEffect:false}}));
  assert.throws(()=>validateCurrentSchematicWirePostconditionCommand({...command,params:{...command.params,functionDeclaration:"function(){return true}"}}));
  assert.throws(()=>currentSchematicWirePostconditionCall("seal","123.1.2",[]));
  assert.throws(()=>validateCurrentSchematicWirePostconditionCommand({phase:"wire-postcondition-step",method:"Debugger.stepInto",params:{}}));
  assert.equal(LIMIT.normalMaximum,191);assert.equal(LIMIT.eventsMaximum,12);
 });
 void test("generated readonly postcondition guard retains its actual source and refuses copied PCs",async()=>{
  const session=new Session();session.connect();await session.post("Debugger.enable");const seen:string[]=[];
  session.on("Debugger.scriptParsed",event=>{seen.push(event.params.scriptId);});
  try{
   const target=await session.post("Runtime.evaluate",{expression:"({})",returnByValue:false});assert.ok(target.result.objectId!==undefined);
   const command=currentSchematicWirePostconditionCall("guardFactory",target.result.objectId,Array.from({length:7},()=>target.result.objectId??"missing"));
   assert.equal(command.method,"Runtime.callFunctionOn");
   const targetId=target.result.objectId;const params:Runtime.CallFunctionOnParameterType={objectId:targetId,functionDeclaration:PROGRAMS.guardFactory,arguments:Array.from({length:7},()=>({objectId:targetId})),returnByValue:false,awaitPromise:false,userGesture:false,...FLAGS};validateCurrentSchematicWirePostconditionCommand({...command,params});const actual=await session.post("Runtime.callFunctionOn",{...params});assert.equal(actual.exceptionDetails,undefined);assert.ok(actual.result.objectId!==undefined);
   const own=await session.post("Runtime.getProperties",{objectId:actual.result.objectId,ownProperties:true});
   let scriptId:string|null=null;for(const candidate of seen){const source=await session.post("Debugger.getScriptSource",{scriptId:candidate});if(source.scriptSource===`(${PROGRAMS.guardFactory})`){assert.equal(scriptId,null);scriptId=candidate;}}
   assert.ok(scriptId!==null);assert.equal(qualifyCurrentSchematicWirePostconditionGuard(own,actual.result,scriptId),actual.result.objectId);
   const copied=structuredClone(own);const at=copied.internalProperties?.find(row=>row.name==="[[FunctionLocation]]");assert.ok(at?.value!==undefined);const original:unknown=at.value.value;assert.ok(original!==null&&typeof original==="object");assert.notEqual(Reflect.get(original,"scriptId"),"123.99.99");at.value.value={...original,scriptId:"123.99.99"};assert.throws(()=>qualifyCurrentSchematicWirePostconditionGuard(copied,actual.result,scriptId));
  }finally{session.disconnect();}
 });
