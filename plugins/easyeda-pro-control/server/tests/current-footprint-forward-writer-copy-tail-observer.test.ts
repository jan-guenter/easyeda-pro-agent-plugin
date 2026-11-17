/** Actual retained observer and delete sampler with explicit inert origin/CDP
 * peers. No production native owner, app, cache or SDK action is created. */
import assert from "node:assert/strict";
import {test} from "node:test";
import {setImmediate as nextTurn} from "node:timers/promises";
import {CurrentPcbViaSaveTailObservationCursor} from "../src/current-pcb-via-save-tail-observation-cursor.ts";
import type {CurrentProjectSaveProducerObserver} from "../src/current-project-save-producer-observer.ts";
import type {CurrentProjectSaveProducerBindings,CurrentProjectSaveProducerHeldCall} from "../src/current-project-save-producer-origin.ts";
import type {CurrentFootprintForwardWriterCopyTailObservationBindings} from "../src/current-footprint-forward-writer-copy-tail-origin.ts";
import type {CurrentPcbViaSaveTailDeleteRole} from "../src/current-pcb-via-save-tail-observation-source.ts";
import {CURRENT_PCB_VIA_SAVE_TAIL_DELETE_CALLER as CALLER,CURRENT_PCB_VIA_SAVE_TAIL_DELETE_SITES as SITES,CURRENT_PCB_VIA_SAVE_TAIL_DELETE_SOURCE as SOURCE} from "../src/current-pcb-via-save-tail-observation-source.ts";
import {currentFootprintForwardWriterCopyTailObservationWire} from "../src/current-footprint-forward-writer-copy-tail-observation-wire.ts";
import {loadSyntheticRegistryModule} from "./helpers/load-synthetic-registry-module.ts";

const captured=(length:number,objectId:string):object=>({result:{type:"object",subtype:"array",className:"Array",description:`Array(${String(length)})`,objectId}});
async function fixture(holdSecondArm=false):Promise<Readonly<{
 armEntered:Promise<null>;releaseArm:()=>void;rejectArm:(cause:Error)=>void;
 observer:CurrentProjectSaveProducerObserver;select:(role:CurrentPcbViaSaveTailDeleteRole,success?:boolean)=>void;
 state:{arms:number;reads:number;samplerRequests:number;retained:number;continued:number;failed:boolean;exited:boolean};
}>>{
 const origin=Object.freeze({profile:"private.current-footprint-forward-writer-save-producer-origin.v1" as const});
 const owner=Object.freeze({explicitSyntheticOwner:true});const operation=Object.freeze({explicitSyntheticOperation:true});
 const state={arms:0,reads:0,samplerRequests:0,retained:0,continued:0,failed:false,exited:false};
 const armEntered=Promise.withResolvers<null>(),armGate=Promise.withResolvers<null>();
 const event=Promise.withResolvers<Awaited<ReturnType<CurrentProjectSaveProducerBindings["nextEvent"]>>>();
 let currentEvent:unknown=null;let packet:CurrentProjectSaveProducerHeldCall|null=null;
 const points=new Map<CurrentPcbViaSaveTailDeleteRole,string>();
 const sampler=new CurrentPcbViaSaveTailObservationCursor(Object.freeze({
  scriptId:"script42",sessionId:"session27",originalProject:()=>"project12",originalIntrinsics:()=>"intrinsics17",
  currentEvent:()=>currentEvent,assertCurrent:()=>Promise.resolve(),fail:()=>{state.failed=true;},
  bindBreakpoint:(role:CurrentPcbViaSaveTailDeleteRole,id:string):void=>{points.set(role,id);},
  retainHeldCall:():CurrentProjectSaveProducerHeldCall=>{state.retained+=1;packet=Object.freeze({profile:"private.current-project-save-producer-held-call.v1"});return packet;},
  request:async(command:Parameters<typeof currentFootprintForwardWriterCopyTailObservationWire>[0]):Promise<unknown>=>{
   await Promise.resolve();state.samplerRequests+=1;const wire=currentFootprintForwardWriterCopyTailObservationWire(command,state.samplerRequests);
   assert.equal(wire.request["action"],"footprint-forward-copy-tail-observe");const value=wire.command;
   if(value.phase==="via-tail-arm"){if(holdSecondArm&&state.samplerRequests===2){armEntered.resolve(null);await armGate.promise;}return{breakpointId:`${value.role}-12`,actualLocation:value.params.location};}
   if(value.phase==="via-tail-frame"){return captured(4,"frame12");}
   if(value.phase==="via-tail-caller"){return captured(6,"caller42");}
   if(value.phase==="via-tail-call"||value.phase==="via-tail-returned"){return captured(value.phase==="via-tail-call"?5:3,"joined17");}
   const length=value.role==="cacheDeleteCall"?5:3;
   return{result:[...Array.from({length},(_,index)=>({name:String(index),isOwn:true,writable:true,enumerable:true,configurable:true,value:{type:"object",objectId:`original-${String(index)}`}})),{name:"length",isOwn:true,writable:true,enumerable:false,configurable:false,value:{type:"number",value:length}}],internalProperties:[{name:"[[Prototype]]",value:{type:"object",subtype:"array",objectId:"array-prototype12"}}]};
  },
 }));
 const tail:CurrentFootprintForwardWriterCopyTailObservationBindings=Object.freeze({additionalHeadJobs:4,additionalSharedRequests:56,
  arm:()=>sampler.arm(),originalBreakpoint:(role:CurrentPcbViaSaveTailDeleteRole)=>sampler.originalBreakpoint(role),
  captureHeldCall:(role:CurrentPcbViaSaveTailDeleteRole)=>sampler.captureHeldCall(role),assertCurrent:()=>Promise.resolve()});
 const binding:CurrentProjectSaveProducerBindings=Object.freeze({
  scriptId:"script42",sessionId:"session27",originalIntrinsics:()=>"intrinsics17",originalReceivers:()=>Object.freeze({project:"project12",wrapper:"wrapper12",callback:"callback12"}),
  originalBreakpoint:(role:Parameters<CurrentProjectSaveProducerBindings["originalBreakpoint"]>[0]):string=>`original-${role}-12`,assertCurrent:()=>Promise.resolve(),
  assertOriginalGenerationExited:()=>state.exited?Promise.resolve():Promise.reject(new Error("original still live")),
  fail:()=>{state.failed=true;},retainHeldCall:()=>{throw new Error("normal producer capture not expected");},
  nextEvent:()=>{state.reads+=1;return event.promise;},
  request:(input:Parameters<CurrentProjectSaveProducerBindings["request"]>[0]):Promise<unknown>=>{assert.equal(input.phase,"project-save-producer-arm");assert.ok(input.phase==="project-save-producer-arm");state.arms+=1;return Promise.resolve({breakpointId:`original-${input.role}-12`,actualLocation:input.params.location});},
 });
 const module=await loadSyntheticRegistryModule(new URL("../src/current-project-save-producer-observer.ts",import.meta.url),(name,actual)=>{
  if(name==="./current-footprint-forward-writer-copy-tail-origin.ts"){return{...actual,originalCurrentFootprintForwardWriterCopyTailObservation:():CurrentFootprintForwardWriterCopyTailObservationBindings=>tail};}
  if(name==="./current-footprint-forward-writer-copy-drain-origin.ts"){return{...actual,continueOriginalCurrentFootprintForwardWriterCopyDrainCall:(a:unknown,b:unknown,c:unknown,d:unknown):Promise<void>=>{assert.equal(a,origin);assert.equal(b,owner);assert.equal(c,operation);assert.equal(d,packet);state.continued+=1;return Promise.resolve();}};}
  if(name==="./current-pcb-diagnostic-owner.ts"){return{...actual,requireOriginalCurrentProjectSaveProducerOrigin:(a:unknown,b:unknown,c:unknown):CurrentProjectSaveProducerBindings=>{assert.equal(a,origin);assert.equal(b,owner);assert.equal(c,operation);return binding;}};}
  return actual;
 });
 const Constructor=module["CurrentProjectSaveProducerObserver"];assert.ok(typeof Constructor==="function");
 // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Actual maintained class with only explicit inert original issuer/CDP peers in this isolated module.
 const observer=Reflect.construct(Constructor,[origin,owner,operation]) as CurrentProjectSaveProducerObserver;
 return{observer,state,armEntered:armEntered.promise,releaseArm:()=>{armGate.resolve(null);},rejectArm:(cause):void=>{armGate.reject(cause);},select:(role,success=true):void=>{
  const site=SITES[role];const id=points.get(role);assert.ok(id!==undefined);
  const value={method:"Debugger.paused" as const,sessionId:"session27",params:{reason:"other",hitBreakpoints:[id],callFrames:[
   {callFrameId:"frame12",location:{scriptId:"script42",lineNumber:site.lineNumber,columnNumber:site.columnNumber},functionLocation:{scriptId:"script42",lineNumber:SOURCE.functionLineNumber,columnNumber:SOURCE.functionColumnNumber},...(role==="cacheDeleteReturned"?{returnValue:{type:"boolean",value:success}}:{})},
   {callFrameId:"caller42",location:{scriptId:"script42",lineNumber:CALLER.lineNumber,columnNumber:CALLER.columnNumber},functionLocation:{scriptId:"script42",lineNumber:CALLER.functionLineNumber,columnNumber:CALLER.functionColumnNumber}},
  ]}};currentEvent=value;event.resolve(value);
 }};
}
void test("full tail enrolls on the same pending producer read and consumes its exact delete packet once",async()=>{
 const f=await fixture();await f.observer.arm();const originalRead=f.observer.observeHeldCall();await nextTurn();assert.equal(f.state.reads,1);
 await f.observer.enrollFootprintForwardWriterCopyTailObservation();assert.equal(f.state.samplerRequests,3);assert.equal(f.state.arms,27);await assert.rejects(f.observer.enrollFootprintForwardWriterCopyTailObservation());
 f.select("cacheDeleteCall");const packet=await originalRead;assert.equal(f.state.reads,1);assert.equal(f.state.retained,1);assert.equal(f.state.samplerRequests,7);
 await assert.rejects(f.observer.continueFootprintForwardWriterCopyDrainCall({...packet}));assert.equal(f.state.continued,0);
 await f.observer.continueFootprintForwardWriterCopyDrainCall(packet);assert.equal(f.state.continued,1);await assert.rejects(f.observer.continueFootprintForwardWriterCopyDrainCall(packet));
 await assert.rejects(f.observer.retireAfterOriginalExit());f.state.exited=true;await f.observer.retireAfterOriginalExit();assert.equal(f.state.reads,1);
});
void test("original delete failure or false native result stays held before capture, continuation or retry",async()=>{
 for(const role of ["cacheDeleteFailed","cacheDeleteReturned"] as const){
  const f=await fixture();await f.observer.arm();await f.observer.enrollFootprintForwardWriterCopyTailObservation();const read=f.observer.observeHeldCall();await nextTurn();f.select(role,false);
  await assert.rejects(read);assert.equal(f.state.samplerRequests,3);assert.equal(f.state.retained,0);assert.equal(f.state.continued,0);assert.equal(f.state.failed,true);
  f.state.exited=true;await f.observer.retireAfterOriginalExit();
 }
});

async function settled<T>(pending:Promise<T>):Promise<Readonly<{value:T}|{error:unknown}>>{try{return{value:await pending};}catch(error){return{error};}}

void test("original pending tail read waits for all enrollment arms and propagates an arm failure without capture",async()=>{
 for(const failArm of[false,true]){
  const f=await fixture(true);await f.observer.arm();
  const read=f.observer.observeHeldCall();const readOutcome=settled(read);
  await nextTurn();assert.equal(f.state.reads,1);
  const enrollment=f.observer.enrollFootprintForwardWriterCopyTailObservation();const enrollmentOutcome=settled(enrollment);
  await f.armEntered;f.select("cacheDeleteCall");await nextTurn();
  assert.equal(f.state.samplerRequests,2);assert.equal(f.state.retained,0);assert.equal(f.state.failed,false);
  if(failArm){const failure=new Error("original arm failure");f.rejectArm(failure);const enrolled=await enrollmentOutcome;assert.ok("error"in enrolled);assert.equal(enrolled.error,failure);const outcome=await readOutcome;assert.ok("error"in outcome);assert.equal(outcome.error,failure);assert.equal(f.state.retained,0);assert.equal(f.state.failed,true);}
  else{f.releaseArm();assert.ok("value"in await enrollmentOutcome);const outcome=await readOutcome;assert.ok("value"in outcome);assert.equal(f.state.samplerRequests,7);assert.equal(f.state.retained,1);assert.equal(f.state.failed,false);}
  assert.equal(f.state.reads,1);assert.equal(f.state.continued,0);f.state.exited=true;await f.observer.retireAfterOriginalExit();
 }
});
