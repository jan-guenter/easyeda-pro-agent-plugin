/** Synthetic Inspector packets test cursor snapshots and contradictory metadata.
 * These regressions supply no original event or connected runtime evidence. */
import assert from "node:assert/strict";
import {test} from "node:test";
import {CurrentSchematicWireCallbackCursor} from "../src/current-schematic-wire-callback-cursor.ts";
import {decodeCurrentFootprintCopyClockRpcV2Array as array} from "../src/current-footprint-copy-clock-rpc-v2-protocol.ts";
import {CURRENT_SCHEMATIC_WIRE_DERIVED_RTREE_SOURCE as SOURCE,decodeCurrentSchematicWireDerivedRtreeFunction as decode} from "../src/current-schematic-wire-derived-rtree-source.ts";
import {GENERATED_SCHEMATIC_WIRE_NATIVE_SOURCE as NATIVE} from "../src/generated-schematic-wire-native-source.ts";

function tuple(objectId:string,length:number):object{
 return {result:{type:"object",subtype:"array",className:"Array",description:`Array(${String(length)})`,objectId}};
}
function fields(values:readonly object[]):{result:{name:string;value:object;writable:boolean;enumerable:boolean;configurable:boolean;isOwn:true}[];internalProperties:object[]}{
 return {result:[...values.map((value,index)=>({name:String(index),value,writable:true,enumerable:true,configurable:true,isOwn:true as const})),{name:"length",value:{type:"number",value:values.length},writable:true,enumerable:false,configurable:false,isOwn:true}],internalProperties:[{name:"[[Prototype]]",value:{type:"object",subtype:"array",className:"Array",description:"Array(0)",objectId:"arrayPrototype"}}]};
}
function accept(cursor:CurrentSchematicWireCallbackCursor,reply:unknown):NonNullable<ReturnType<CurrentSchematicWireCallbackCursor["next"]>>{
 const command=cursor.next();assert.ok(command!==null);cursor.reserve(command);cursor.accept(command,reply);return command;
}
void test("callback values use the same input snapshot through completion",()=>{
 const values=Array.from({length:8},(_,index)=>`value${String(index)}`);const input={role:"values" as const,holder:"holder",values};
 const cursor=new CurrentSchematicWireCallbackCursor(input);values[0]="foreignValue";input.holder="foreignHolder";
 const command=accept(cursor,tuple("valuesTuple",8));assert.ok(command.phase==="wire-callback-values");
 assert.ok(command.method==="Runtime.callFunctionOn");assert.equal(command.params.objectId,"holder");assert.deepEqual(command.params.arguments,Array.from({length:8},(_,index)=>({objectId:`value${String(index)}`})));
 accept(cursor,fields(Array.from({length:8},(_,index)=>({type:[0,1,4,5,7].includes(index)?"function":"object",objectId:`value${String(index)}`}))));
 assert.equal(cursor.next(),null);assert.equal(cursor.requireCompleted().tuple,"valuesTuple");
});
void test("callback proof and retained replies keep the validated selectors and point handle",()=>{
 const input={role:"entry" as const,frame:"frame",holder:"holder",native:"native",qualified:"qualified"};
 const cursor=new CurrentSchematicWireCallbackCursor(input);
 input.frame="foreignFrame";input.holder="foreignHolder";input.native="foreignNative";input.qualified="foreignQualified";
 const first=accept(cursor,tuple("frameTuple",2));assert.ok(first.method==="Debugger.evaluateOnCallFrame");assert.equal(first.params.callFrameId,"frame");
 accept(cursor,fields([{type:"object",objectId:"model"},{type:"object",objectId:"state"}]));
 accept(cursor,{result:[],internalProperties:[]});
 const proof=accept(cursor,tuple("resultTuple",13));assert.ok(proof.method==="Runtime.callFunctionOn");
 assert.deepEqual(proof.params.arguments,[{objectId:"native"},{objectId:"holder"},{objectId:"qualified"}]);
 const last=fields(Array.from({length:13},(_,index)=>({type:"object",objectId:`point${String(index)}`})));
 accept(cursor,last);assert.equal(cursor.next(),null);
 const original=last.result[0];assert.ok(original!==undefined);Reflect.set(original.value,"objectId","foreignPoint");last.result.length=0;
 const replies=cursor.retainedReplies(),retained=replies.at(-1);assert.equal(array(retained,13).get("0")?.objectId,"point0");
 assert.notEqual(retained,last);assert.ok(Object.isFrozen(retained));assert.equal(cursor.requireCompleted().tuple,"resultTuple");
});
void test("derived function metadata rejects mixed get/set fields on every data descriptor",()=>{
 const description=NATIVE[0]?.methods.pointConstructor.source,row=SOURCE[0].rows.basicPointClass;assert.ok(description!==undefined);
 const actual={type:"function",className:"Function",description,objectId:"pointClass"};
 const result:{name:string;value:object;writable:boolean;enumerable:boolean;configurable:boolean;isOwn:boolean}[]=row.ownNames.map(name=>{
  if(name==="name"||name==="length"){return{name,value:{type:name==="name"?"string":"number",value:name==="name"?row.name:row.arity},writable:false,enumerable:false,configurable:true,isOwn:true};}
  return{name,value:{type:name==="prototype"?"object":"function",objectId:`point_${name}`},writable:name!=="prototype",enumerable:false,configurable:name!=="prototype",isOwn:true};
 });
 result.push({name:"ORIGIN",value:{type:"object",className:row.name,objectId:"origin"},writable:true,enumerable:true,configurable:true,isOwn:true});
 const packet={result,internalProperties:[
  {name:"[[FunctionLocation]]",value:{type:"object",subtype:"internal#location",value:{scriptId:"script",lineNumber:row.lineNumber,columnNumber:row.columnNumber}}},
  {name:"[[Scopes]]",value:{type:"object",subtype:"internal#scopeList",className:"Array",description:"Scopes[1]",objectId:"scopes"}},
  {name:"[[Prototype]]",value:{type:"function",className:"Function",description:"function () { [native code] }",objectId:"functionPrototype"}}
 ]};
 assert.equal(decode(packet,actual,0,"basicPointClass","script").objectId,"pointClass");
 for(const descriptor of result){for(const key of["get","set"]){
  const changed=structuredClone(packet),field=changed.result.find(value=>value.name===descriptor.name);assert.ok(field!==undefined);
  Reflect.set(field,key,{type:"function",objectId:"accessor"});
  assert.throws(()=>decode(changed,actual,0,"basicPointClass","script"),`${descriptor.name} with ${key}`);
 }}
});

void test("callback input capture refuses property and array getters without invocation", () => {
  let calls = 0;
  const input = {role: "entry" as const, frame: "frame", native: "native", qualified: "qualified", get holder(): string {calls += 1; return "holder";}};
  assert.throws(() => new CurrentSchematicWireCallbackCursor(input)); assert.equal(calls, 0);
  const values = Array.from({length: 8}, () => "value");
  Object.defineProperty(values, "0", {get(): string {calls += 1; return "value";}, enumerable: true, configurable: true});
  assert.throws(() => new CurrentSchematicWireCallbackCursor({role: "values", holder: "holder", values})); assert.equal(calls, 0);
});
