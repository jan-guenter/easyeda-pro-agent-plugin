import assert from"node:assert/strict";
import{test}from"node:test";
import{z}from"zod";
import{sha256Text}from"../src/core.ts";
import{captureCurrentPcbStringClockReply as oldCapture}from"../src/current-pcb-string-clock-reply.ts";
import{CURRENT_SCHEMATIC_WIRE_EVENT_BOUNDS as LIMIT,CurrentSchematicWireEventObserver as Observer}from"../src/current-schematic-wire-event-observer.ts";

function paused():{sessionId:string;method:string;params:{reason:string;hitBreakpoints:string[];callFrames:unknown[]}}{
 const location={scriptId:"123.1",lineNumber:1,columnNumber:2};
 return{sessionId:"123.session",method:"Debugger.paused",params:{reason:"other",hitBreakpoints:["123.point"],callFrames:Array.from({length:16},(_,index)=>({callFrameId:`${String(index)}.123`,functionName:"original",url:"inert.js",location:{...location},functionLocation:{...location},this:{type:"object",className:"Object",objectId:"123.this"},scopeChain:Array.from({length:8},()=>({type:"closure",name:"retained",object:{type:"object",className:"Object",objectId:"123.scope"}}))}))}};
}
void test("Wire observer retains the complete original text and issues only its paired view",()=>{
 const owner={};const observer=new Observer(owner);const input=paused();assert.throws(()=>oldCapture(input));
 const text=` \n${JSON.stringify(input,null,1)}\n `;const result=observer.captureRaw(text,owner);assert.equal(result.originalText,text);assert.equal(result.originalSha256,sha256Text(text));assert.equal(result.transportBytesRetained,true);assert.equal(result.originalFrameCount,16);
 assert.equal(observer.requireOriginal(result,owner),result);assert.doesNotThrow(()=>oldCapture(result.event));const selected:unknown=Reflect.get(z.record(z.string(),z.unknown()).parse(result.event.params),"callFrames");assert.ok(Array.isArray(selected));assert.equal(selected.length,2);
 assert.equal(result.originalNativeEventJoined,false);assert.equal(result.originalNativeOwnerJoined,false);assert.equal(result.saveAuthorized,false);
 assert.throws(()=>observer.requireOriginal(structuredClone(result),owner));assert.throws(()=>observer.requireOriginal(result,{}));assert.throws(()=>new Observer(owner).requireOriginal(result,owner));
 assert.throws(()=>observer.captureObject(result.event,owner));
});
void test("Wire object notifications retain an immutable complete serialization without a wire-byte claim",()=>{
 const owner={};const observer=new Observer(owner);const input=paused();const result=observer.captureObject(input,owner);assert.equal(result.transportBytesRetained,false);assert.deepEqual(JSON.parse(result.originalText),input);
 input.params.hitBreakpoints[0]="changed";const hitBreakpoints=z.array(z.string());const saved=z.object({params:z.object({hitBreakpoints})}).parse(JSON.parse(result.originalText));assert.equal(saved.params.hitBreakpoints[0],"123.point");assert.equal(Object.isFrozen(result.original),true);assert.equal(Object.isFrozen(result.event),true);
});
void test("Wire complete event bounds reject oversized frames, text and getters without invoking them",()=>{
 const owner={};const observer=new Observer(owner);const input=paused();input.params.callFrames=Array.from({length:LIMIT.frames+1},()=>({}));assert.throws(()=>observer.captureObject(input,owner));assert.throws(()=>observer.captureRaw(" ".repeat(LIMIT.bytes+1),owner));
 let reads=0;const getter={sessionId:"123.session",method:"Debugger.resumed"};Object.defineProperty(getter,"params",{enumerable:true,get:()=>{reads+=1;return{};}});assert.throws(()=>observer.captureObject(getter,owner));assert.equal(reads,0);
});
