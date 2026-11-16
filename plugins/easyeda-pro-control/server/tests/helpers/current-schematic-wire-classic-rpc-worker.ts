/* oxlint-disable promise/prefer-await-to-then, unicorn/prefer-top-level-await -- The worker observes real main-thread source pauses while retaining independent Promise settlement. */
import assert from "node:assert/strict";
import { Session } from "node:inspector/promises";
import { parentPort,workerData } from "node:worker_threads";
import { z } from "zod";
import { wireFixtureCallQueue } from "./current-schematic-wire-worker-lifecycle.ts";
import { CurrentSchematicWireClassicRpcReplySelector } from "../../src/current-schematic-wire-classic-rpc-selector.ts";
import { CurrentSchematicWireClassicRpcCursor } from "../../src/current-schematic-wire-classic-rpc-cursor.ts";
import type { CurrentSchematicWireClassicRpcData,CurrentSchematicWireClassicRpcInput } from "../../src/current-schematic-wire-classic-rpc-cursor.ts";
import { CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_SOURCE as SOURCE,decodeCurrentSchematicWireClassicRpcPause as decode } from "../../src/current-schematic-wire-classic-rpc-source.ts";
import { CURRENT_SCHEMATIC_WIRE_CLASSIC_RPC_FLAGS as FLAGS } from "../../src/current-schematic-wire-classic-rpc-protocol.ts";

const config=z.strictObject({key:z.string(),scriptId:z.string(),variant:z.union([z.literal(0),z.literal(1)])}).parse(workerData);
const port=parentPort??(():never=>{throw new Error("port")})();port.on("message",()=>{
 // Keep this worker alive while the main fixture frame is held.
});
const session=new Session();session.connectToMainThread();const row=SOURCE[config.variant].rows;
type Kind="entry"|"request"|"timer"|"returned"|"reply"|"replyReturned";
type Role="closing"|"language"|"titles";
const points=new Map<string,Readonly<{kind:Kind;role:Role|null}>>();const data=new Map<Role,CurrentSchematicWireClassicRpcData>();
const order:Role[]=["closing","titles","language"];let started=0;let preparing:Role|null=null;let replying:Role|null=null;
let holder="";let native="";let active:string|null=null;let activeScripts:string[]=[];let reads=0;let sources=0;let pauses=0;let resumes=0;let stopped=false;
const settlements:Promise<void>[]=[];const retained:CurrentSchematicWireClassicRpcData[]=[];const stages:Record<string,number[]>={};
session.on("Debugger.scriptParsed",event=>{if(active!==null&&event.params.url===""&&event.params.length===active.length+2){activeScripts.push(event.params.scriptId);}});
const attributedCall=wireFixtureCallQueue();
async function dispatch(method:string,params:unknown):Promise<unknown>{
 let program:string|null=null;
 if(method==="Runtime.callFunctionOn"){const value:unknown=params!==null&&typeof params==="object"?Reflect.get(params,"functionDeclaration"):null;assert.equal(typeof value,"string");assert.ok(typeof value==="string");program=value;active=program;activeScripts=[];}
 const pending:unknown=Reflect.apply(session.post.bind(session),session,[method,params]);const raw:unknown=await pending;
 if(raw!==null&&typeof raw==="object"&&"exceptionDetails"in raw){throw new Error(JSON.stringify(Reflect.get(raw,"exceptionDetails")));}
 if(program!==null){assert.equal(activeScripts.length,1);const id=activeScripts[0];assert.ok(id!==undefined);active=null;const actual=await session.post("Debugger.getScriptSource",{scriptId:id});assert.equal(actual.scriptSource,`(${program})`);sources+=1;}
 return raw;
}
function post(method:string,params:unknown):Promise<unknown>{
 // Detached settlement keeps its timing; only generated source attribution waits.
 return method==="Runtime.callFunctionOn"?attributedCall(()=>dispatch(method,params)):dispatch(method,params);
}
async function collect(input:CurrentSchematicWireClassicRpcInput):Promise<CurrentSchematicWireClassicRpcData>{
 if(input.stage!=="entry"){assert.throws(()=>new CurrentSchematicWireClassicRpcCursor({...input,previous:structuredClone(input.previous)}));}
 const originalFrame="frame"in input?input.frame:null,stage=input.stage;
 const cursor=new CurrentSchematicWireClassicRpcCursor(input);let local=0;
 if(originalFrame!==null){Reflect.set(input,"frame","invalid/caller/frame");}
 for(let command=cursor.next();command!==null;command=cursor.next()){
  if(local===0&&command.phase==="classic-rpc-frame"){assert.equal(command.params.callFrameId,originalFrame);}
  cursor.reserve(command);reads+=1;local+=1;
  if(stage==="entry"&&local===1){Reflect.set(input,"stage","settled");Reflect.set(input,"holder","foreign");Reflect.set(input,"native","foreign");}
  cursor.accept(command,await post(command.method,command.params));
 }
 const result=cursor.requireCompleted();assert.equal(result.stage,stage);assert.equal(result.sameOuterRaceResultCompared,stage==="settled");
 (stages[result.role]??=[]).push(local);if(stage!=="entry"){assert.throws(()=>new CurrentSchematicWireClassicRpcCursor(input));}
 return result;
}
async function remove():Promise<void>{for(const breakpointId of points.keys()){await session.post("Debugger.removeBreakpoint",{breakpointId});}}
async function failure(error:unknown):Promise<void>{if(stopped){return;}stopped=true;try{await remove();await session.post("Runtime.releaseObjectGroup",{objectGroup:FLAGS.objectGroup});await session.post("Debugger.resume");}catch{
 // The explicit inert producer may already have finished.
}port.postMessage({error:String(error),reads,sources,stages,pauses,resumes});session.disconnect();port.close();}
session.on("Debugger.paused",event=>{void(async():Promise<void>=>{
 if(stopped){return;}pauses+=1;const id=event.params.hitBreakpoints?.[0];const point=id===undefined?undefined:points.get(id);assert.ok(point!==undefined&&id!==undefined);
 let role=point.role??preparing;const kind=point.kind;
 if(kind==="entry"){role=order[started]??null;started+=1;assert.ok(preparing===null&&role!==null);preparing=role;}
 if(kind==="replyReturned"){role=replying;}
 if(kind==="reply"){
  const frame=event.params.callFrames[0];assert.ok(frame!==undefined);
  const values=(["closing","language","titles"]as const).map(name=>{const item=data.get(name);return item?.stage==="returned"?item:null;});
  const selector=new CurrentSchematicWireClassicRpcReplySelector(frame.callFrameId,values);
  for(let command=selector.next();command!==null;command=selector.next()){selector.reserve(command);reads+=1;selector.accept(command,await post(command.method,command.params));}role=selector.requireCompleted();
 }
 assert.ok(role!==null);
 const sourceRole=({entry:"MessageBus_rpcCall",request:"MessageBus_rpcCall_child0",timer:"MessageBus_rpcCall_child2",returned:"MessageBus_rpcCall",reply:"MessageBus_rpcCall_child1",replyReturned:"MessageBus_rpcCall_child1"}as const)[kind];
 let when:"publishing"|"returned"|"entry"="entry";
 if(kind==="request"){when="publishing";}else if(kind==="timer"||kind==="returned"||kind==="replyReturned"){when="returned";}
 const held=decode(event.params,config.variant,sourceRole,when,config.scriptId,id);
 const previous=data.get(role);let observed:CurrentSchematicWireClassicRpcData;
 if(kind==="entry"){observed=await collect({stage:"entry",frame:held.frame,holder,native,scriptId:config.scriptId,variant:config.variant,role});}
 else{
  assert.ok(previous!==undefined);
  if(kind==="returned"){
   const value=z.strictObject({type:z.literal("object"),subtype:z.literal("promise"),className:z.literal("Promise"),description:z.literal("Promise"),objectId:z.string()}).parse(held.returnValue);
   observed=await collect({stage:"returned",frame:held.frame,outerPromise:value.objectId,previous});
   assert.ok(observed.originalReplyCallback!==null);preparing=null;
  }else if(kind==="timer"){const caller=event.params.callFrames[1];assert.ok(caller!==undefined);observed=await collect({stage:"timer",frame:held.frame,callerFrame:caller.callFrameId,previous});
  }else if(kind==="reply"){
   assert.equal(replying,null);replying=role;const caller=event.params.callFrames[1];assert.ok(caller!==undefined);observed=await collect({stage:"reply",frame:held.frame,callerFrame:caller.callFrameId,previous});
  }else{
   observed=await collect({stage:kind,frame:held.frame,previous});
  }
 }
 data.set(role,observed);await session.post("Debugger.resume");resumes+=1;
 if(kind==="replyReturned"){
  replying=null;const final=observed;
  const pending=(async():Promise<void>=>{const result=await collect({stage:"settled",previous:final});data.set(role,result);retained.push(result);})();settlements.push(pending);
  if(settlements.length===3){await Promise.all(settlements);await remove();await session.post("Runtime.releaseObjectGroup",{objectGroup:FLAGS.objectGroup});stopped=true;port.postMessage({reads,sources,stages,pauses,resumes,roles:retained.map(item=>item.role).toSorted(),same:retained.every(item=>item.sameOuterRaceResultCompared),rpcCompleted:retained.some(item=>item.rpcCompleted),saveAuthorized:retained.some(item=>item.saveAuthorized),timeoutCleanupVerified:retained.some(item=>item.timeoutCleanupVerified)});session.disconnect();port.close();}
 }
})().catch(failure);});
async function initialize():Promise<void>{
 await session.post("Debugger.enable");
 for(const name of["holder","native"]){const result=await session.post("Runtime.evaluate",{expression:`globalThis.${config.key}.${name}`});assert.ok(result.result.objectId!==undefined);if(name==="holder"){holder=result.result.objectId;}else{native=result.result.objectId;}}
 const setup=[["entry",row.MessageBus_rpcCall.points.entry],["request",row.MessageBus_rpcCall_child0.points.publishing],["timer",row.MessageBus_rpcCall_child2.points.returned],["returned",row.MessageBus_rpcCall.points.returned],["reply",row.MessageBus_rpcCall_child1.points.entry],["replyReturned",row.MessageBus_rpcCall_child1.points.returned]]as const;
 for(const[kind,point]of setup){const value=await session.post("Debugger.setBreakpoint",{location:{scriptId:config.scriptId,lineNumber:point.lineNumber,columnNumber:point.columnNumber}});assert.deepEqual(value.actualLocation,{scriptId:config.scriptId,lineNumber:point.lineNumber,columnNumber:point.columnNumber});points.set(value.breakpointId,{kind,role:null});}port.postMessage({ready:true});
}
void initialize().catch(failure);
