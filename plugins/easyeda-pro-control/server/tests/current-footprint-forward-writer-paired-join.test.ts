/* oxlint-disable eslint/max-classes-per-file -- Two distinct inert original class issuers are required by the actual paired state machine; neither is a production native owner. */
/** Run the maintained paired state machine against explicit inert issuers.
 * This is an ordering/custody regression, never connected native evidence. */
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {stripTypeScriptTypes} from "node:module";
import {test} from "node:test";
import {types} from "node:util";
import {createContext,runInContext} from "node:vm";

void test("original paired join uses the completed tail and retains Main until the same actual Create reply",async()=>{
 const calls:string[]=[];const capability={};const mainOrigin={};const clockOrigin={};const copy={};const reservation={};const intent={};const pending={};
 const clocks=Object.freeze({samples:[]});const mainPacket=Object.freeze({});const completionOrigin={};
 const timer=Object.freeze({naturalSelfReturnsJoined:true,executionAuthorized:false});
 const reply=Promise.withResolvers<string>();const entered=Promise.withResolvers<null>();
 let released=false;let clockRetired=false;let completionRetired=false;let allocationReleased=false;let owner:object|null=null;let backend:object|null=null;let allocation:object|null=null;
 class Backend{
  public requireForwardWriterRequestOrigin(a:unknown,b:unknown):void{assert.equal(this,backend);assert.equal(a,capability);assert.equal(b,mainOrigin);assert.equal(released,false);}
  public requireForwardWriterRequestArmed():void{assert.equal(this,backend);assert.equal(released,false);}
  public issueForwardWriterCompletionOrigin():Promise<object>{assert.equal(this,backend);calls.push("main-origin");return Promise.resolve(completionOrigin);}
  public release():Promise<void>{assert.equal(this,backend);calls.push("release-main");released=true;return Promise.resolve();}
 }
 backend=new Backend();
 class Allocation{
  public arm():Promise<void>{assert.equal(this,allocation);calls.push("arm-allocation");return Promise.resolve();}
  public collectAndResume():Promise<void>{assert.equal(this,allocation);calls.push("collect-allocation");return Promise.resolve();}
  public consumeBeforeInvocation():void{assert.equal(this,allocation);calls.push("consume-allocation");}
  public observeOriginalGenerationEnded():Promise<void>{assert.equal(this,allocation);return Promise.resolve();}
  public release():Promise<void>{assert.equal(this,allocation);allocationReleased=true;return Promise.resolve();}
  public diagnostics():object{assert.equal(this,allocation);return{phase:allocationReleased?"released":"ready"};}
 }
 allocation=new Allocation();
 const rpc={arm:():Promise<void>=>Promise.resolve(),consumeBeforeInvocation:():void=>{calls.push("consume-clock");},
  collect:():Promise<object>=>{calls.push("clocks");return Promise.resolve(clocks);},requireOriginal:(value:unknown):Promise<void>=>{assert.equal(value,clocks);return Promise.resolve();},
  cleanup:():Promise<void>=>{clockRetired=true;return Promise.resolve();},diagnostics:():object=>({retired:clockRetired})};
 const main={armForCompletion:():Promise<void>=>Promise.resolve(),consumeBeforeInvocation:():void=>{calls.push("consume-main");},
  bindForwardWriterObservedClocks:(a:unknown,b:unknown):Promise<void>=>{assert.equal(a,clockOrigin);assert.equal(b,clocks);return Promise.resolve();},
  collectToHeldFinalPb:():Promise<object>=>{assert.equal(clockRetired,true);calls.push("main");return Promise.resolve({});},
  diagnostics:():object=>({retired:true})};
 const completion={arm:():Promise<void>=>Promise.resolve(),collect:():Promise<object>=>Promise.resolve(mainPacket),
  requireOriginal:(value:unknown):Promise<void>=>{assert.equal(value,mainPacket);return Promise.resolve();},
  cleanup:():Promise<void>=>{completionRetired=true;return Promise.resolve();},diagnostics:():object=>({retired:completionRetired})};
 const lease={};const route={workerSessionId:"synthetic-session27",fail:():void=>{calls.push("fail");}};
 const binding={clockLease:lease,workerSessionId:route.workerSessionId,copyPlan:copy,invocationBinding:{}};
 const source=stripTypeScriptTypes(await readFile(new URL("../src/current-footprint-forward-writer-paired-scheduler.ts",import.meta.url),"utf8"))
  .replaceAll(/^import[\s\S]*?;\n/gmu,"").replaceAll(/\bexport (?=(?:async )?(?:function|const|class))/gu,"");
 const context=createContext({Object,Reflect,Error,Promise,WeakMap,types,backend,capability,mainOrigin,clockOrigin,reservation,intent,copy,pending,
  CurrentFootprintCopyMainBackendRunner:Backend,CurrentFootprintForwardWriterAllocationRunner:Allocation,
  requireOriginalCurrentFootprintForwardWriterOwnData:():void=>{assert.equal(released,false);},
  requireCurrentFootprintForwardWriterMainNativeOwner:():unknown=>owner,
  isCurrentFootprintForwardWriterMainRequestReservation:(value:unknown):boolean=>value===reservation,
  requireOriginalCurrentFootprintForwardWriterMainRequestReservationCopy:():unknown=>copy,
  requireCurrentFootprintForwardWriterPairedCopy:():unknown=>copy,
  createCurrentFootprintForwardWriterMainRequestRunner:():unknown=>main,
  requireCurrentFootprintForwardWriterPairedSchedule:():void=>{assert.equal(released,false);},
  requireRetainedCurrentFootprintForwardPairedSchedule:():void=>{assert.equal(released,true);},
  requireCurrentFootprintForwardWriterCreateClockChannelRoute:(value:unknown):unknown=>{assert.equal(value,route);return binding;},
  requireCurrentFootprintForwardWriterClockRpcOrigin:():unknown=>({workerLease:lease,workerSessionId:route.workerSessionId}),
  requireCurrentFootprintForwardWriterAllocationOrigin:():void=>{assert.equal(released,false);},
  requireCurrentFootprintForwardWriterMainRequestReservationCopy:():void=>{assert.equal(released,false);},
  requireCurrentFootprintForwardWriterAllocationCopyPlan:():void=>{assert.equal(released,false);},
  requireOriginalCurrentFootprintForwardWriterMainRequestReservation:():void=>{assert.equal(released,false);},
  createCurrentFootprintForwardWriterMainCompletionRunner:():unknown=>completion,
 });
 owner={
  originalFootprintForwardWriterCreateRoute:():unknown=>route,originalFootprintForwardWriterClockRunners:():unknown=>({allocation,rpc}),
  dispatchFootprintForwardWriterCreate:(a:unknown,b:unknown):Promise<object>=>{assert.equal(a,clockOrigin);assert.equal(b,intent);calls.push("dispatch");return Promise.resolve(pending);},
  finishFootprintForwardWriterTicketTimer:():Promise<object>=>{assert.equal(completionRetired,true);assert.equal(released,false);calls.push("timer");return Promise.resolve(timer);},
  joinFootprintForwardWriterCreate:(a:unknown,b:unknown):Promise<string>=>{
   assert.equal(a,clockOrigin);assert.equal(b,pending);assert.equal(released,false);calls.push("join");
   const actual:unknown=runInContext("requireOriginalCurrentFootprintForwardWriterCreateJoin(pending,owner,clockOrigin)",context);
   assert.ok(actual!==null&&typeof actual==="object");assert.equal(Reflect.get(actual,"clocks"),clocks);assert.equal(Reflect.get(actual,"main"),mainPacket);assert.equal(Reflect.get(actual,"timer"),timer);
   entered.resolve(null);return reply.promise;
  },
 };
 context["owner"]=owner;
 runInContext(`${source}\nconst paired=new CurrentFootprintForwardWriterPairedScheduler(backend,capability,mainOrigin,reservation);`,context);
 const invoke=(expression:string):Promise<unknown>=>{const value:unknown=runInContext(expression,context);assert.ok(types.isPromise(value));return value;};
 await invoke("paired.armMain()");runInContext("paired.bindClocks(clockOrigin)",context);await invoke("paired.armClocks()");
 runInContext("paired.requireExecutionReady(copy,0,60)",context);await invoke("paired.dispatchCreate(intent)");await invoke("paired.collectClocks()");await invoke("paired.collectMain()");await invoke("paired.finishAfterTail()");
 assert.throws(()=>runInContext("requireOriginalCurrentFootprintForwardWriterCreateJoin(pending,owner,clockOrigin)",context),/ORIGINAL_POST_TAIL_JOIN/u);
 const joined=invoke("paired.joinCreate()");await entered.promise;assert.equal(released,false);
 assert.throws(()=>runInContext("requireOriginalCurrentFootprintForwardWriterCreateJoin({},owner,clockOrigin)",context),/ORIGINAL_PENDING_JOIN_OWNER/u);
 reply.resolve("actual-original-create-reply");const packet=await joined;assert.equal(released,true);
 assert.ok(packet!==null&&typeof packet==="object");assert.equal(Reflect.get(packet,"serializedCreateResult"),"actual-original-create-reply");
 assert.ok(calls.indexOf("clocks")<calls.indexOf("main"));assert.ok(calls.indexOf("main")<calls.indexOf("timer"));assert.ok(calls.indexOf("timer")<calls.indexOf("join"));assert.ok(calls.indexOf("join")<calls.indexOf("release-main"));
 assert.throws(()=>runInContext("requireOriginalCurrentFootprintForwardWriterCreateJoin(pending,owner,clockOrigin)",context),/ORIGINAL_POST_TAIL_JOIN/u);
});
