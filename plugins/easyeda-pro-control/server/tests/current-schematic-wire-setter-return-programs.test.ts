/** Source-independent grammar and actual Node Symbol metadata; no application. */
import assert from "node:assert/strict";
import {Session} from "node:inspector/promises";
import {test} from "node:test";
import {Script} from "node:vm";
import {CURRENT_SCHEMATIC_WIRE_SETTER_RETURN_PROGRAMS as PROGRAMS} from "../src/current-schematic-wire-setter-return-programs.ts";
import {currentSchematicWireSetterReturnCall,currentSchematicWireSetterReturnFrame,validateCurrentSchematicWireSetterReturnCommand} from "../src/current-schematic-wire-setter-return-protocol.ts";
import {qualifyCurrentSchematicWireSetterReturnSymbol} from "../src/current-schematic-wire-setter-return-source.ts";

void test("all fixed setter programs and frames parse without installed application source",()=>{
 const roles=["method","aliases","globals","iterators","seal","native","capture","compared","methodFrame","methodReturn","tryGroup","history","record","setter","filter","outer5","outer6","outer7","outer8","outer9","promise","finish"]as const;
 assert.deepEqual(Object.keys(PROGRAMS),roles);
 for(const role of roles){
  assert.doesNotThrow(()=>new Script(`(${PROGRAMS[role]})`),role);
  const refs=Array.from({length:role==="aliases"?3:9},()=>"original");
  assert.equal(currentSchematicWireSetterReturnCall(role,"original",refs).method,"Runtime.callFunctionOn");
  assert.throws(()=>currentSchematicWireSetterReturnCall(role,"original",refs.slice(1)),role);
  assert.throws(()=>currentSchematicWireSetterReturnCall(role,"original",[...refs,"extra"]),role);
 }
 const expressions=["[this,t,r,n]","[this,t,r,n,s]","[this,s]","[this,n]","[this,t]","[u,h,d]","[this,t,r,n,s,a]","[this,t,r,n,s,a,o]","[this,t,r,n,s,a,o,l]","[this,t,r,n,s,a,o,l,c]","[originalContext,originalPoints]"]as const;
 for(const expression of expressions){
  assert.doesNotThrow(()=>new Script(expression),expression);
  const frame=currentSchematicWireSetterReturnFrame(expression,"original");
  assert.equal(frame.method,"Debugger.evaluateOnCallFrame");
  assert.throws(()=>validateCurrentSchematicWireSetterReturnCommand({...frame,params:{...frame.params,expression:"globalThis"}}));
 }
});

void test("original Node Symbol metadata qualifies and altered well-known descriptors refuse",async()=>{
 const session=new Session();session.connect();
 // Widen the fallback void reply to unknown and validate the actual packet.
 const post:(method:string,params:object)=>Promise<unknown>=session.post.bind(session);
 try{
  const symbol=await post("Runtime.evaluate",{expression:"Symbol",silent:true,generatePreview:false,throwOnSideEffect:true});
  assert.ok(symbol!==null&&typeof symbol==="object");
  const actual:unknown=Reflect.get(symbol,"result");assert.ok(actual!==null&&typeof actual==="object");
  const objectId:unknown=Reflect.get(actual,"objectId");assert.ok(typeof objectId==="string");
  const reply=await post("Runtime.getProperties",{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false});
  assert.doesNotThrow(()=>{qualifyCurrentSchematicWireSetterReturnSymbol(reply,actual);});
  assert.ok(reply!==null&&typeof reply==="object");const descriptors:unknown=Reflect.get(reply,"result");assert.ok(Array.isArray(descriptors));
  const alteredDescriptors:unknown[]=[];
  for(const rawRow of descriptors){const row:unknown=rawRow;assert.ok(row!==null&&typeof row==="object");alteredDescriptors.push(Reflect.get(row,"name")==="iterator"?{...row,writable:true}:row);}
  const altered={...reply,result:alteredDescriptors};
  assert.throws(()=>{qualifyCurrentSchematicWireSetterReturnSymbol(altered,actual);},/WIRE_SETTER_RETURN_NATIVE_SYMBOL/u);
  assert.throws(()=>{qualifyCurrentSchematicWireSetterReturnSymbol(reply,{...actual,description:"function Symbol() { return null; }"});},/WIRE_SETTER_RETURN_NATIVE_SYMBOL/u);
 }finally{session.disconnect();}
});
