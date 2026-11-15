/* oxlint-disable import/max-dependencies -- Exercise three independent emitted owner fragments and their fixed syntax without an authority adapter. */
/** Fixed native rows and actual inert V8 breakpoint behavior; no owner, app or helper is issued. */
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {Session} from "node:inspector/promises";
import {test} from "node:test";
import {createContext,runInContext} from "node:vm";
import {gunzipSync} from "node:zlib";
import {z} from "zod";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_COMPLETE_TAIL_ACTIONS,currentFootprintForwardWriterCompleteHistoryCodebookSource,currentFootprintForwardWriterCompleteTailDispatch,currentFootprintForwardWriterCompleteTailNativeSource} from "../src/current-footprint-forward-writer-complete-tail-native.ts";
import {currentFootprintForwardWriterFrontierCases,currentFootprintForwardWriterFrontierTemplate} from "../src/current-footprint-forward-writer-frontier-protocol.ts";
import {currentFootprintForwardWriterFrontierNativeSource} from "../src/current-footprint-forward-writer-frontier-native.ts";
import {currentFootprintForwardWriterCacheNativeSource} from "../src/current-footprint-forward-writer-cache-native.ts";
import {currentFootprintForwardWriterStartupWsNativeSource} from "../src/current-footprint-forward-writer-startup-ws-protocol.ts";
import {currentFootprintForwardWriterSyncNativeSource} from "../src/current-footprint-forward-writer-sync-native.ts";
import {currentFootprintForwardWriterTicketTimerNativeSource} from "../src/current-footprint-forward-writer-ticket-timer-native.ts";
import {currentFootprintInverseMainHistoryNativeSource} from "../src/current-footprint-inverse-main-history-native.ts";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_RENDERER_CLASS_NATIVE,currentFootprintForwardWriterRendererRoleSource} from "../src/current-footprint-forward-writer-renderer-class.ts";

function table(name:string):readonly string[][]{
 const source=currentFootprintForwardWriterCompleteTailNativeSource(),start=source.indexOf(`internal static class ${name} {`);assert.notEqual(start,-1);
 const end=source.indexOf("\n}",start);assert.ok(end>start);
 const found=/EasyedaDiagnosticFixedTable\.Load\("([A-Za-z0-9+/=]+)",([0-9]+),"([a-f0-9]{64})","([a-f0-9]{64})",([0-9]+),4\)/u.exec(source.slice(start,end));assert.ok(found!==null);
 const [,packedText,length,decodedHash,packedHash,count]=found;assert.ok(packedText!==undefined&&length!==undefined&&decodedHash!==undefined&&packedHash!==undefined&&count!==undefined);
 const packed=Buffer.from(packedText,"base64");assert.equal(packed.toString("base64"),packedText);assert.equal(createHash("sha256").update(packed).digest("hex"),packedHash);
 // oxlint-disable-next-line node/no-sync -- Independently decode bounded immutable build-time codebook bytes, never supplied input.
 const bytes=gunzipSync(packed,{maxOutputLength:60_000});assert.equal(bytes.length,Number(length));assert.equal(createHash("sha256").update(bytes).digest("hex"),decodedHash);
 const rows=bytes.toString("utf8").split("\0").map(row=>row.split("\t"));assert.equal(rows.length,Number(count));for(const row of rows){assert.equal(row.length,4);}return rows;
}
const locationSchema=z.strictObject({scriptId:z.string(),lineNumber:z.number(),columnNumber:z.number()});
const commandSchema=z.strictObject({method:z.literal("Debugger.setBreakpoint"),params:z.strictObject({location:locationSchema,condition:z.string().optional()})});
function arm(row:readonly string[]):z.infer<typeof commandSchema>{assert.ok(row[3]!==undefined);return commandSchema.parse(JSON.parse(row[3]));}
async function retain(pending:Promise<unknown>,failures:unknown[]):Promise<void>{try{await pending;}catch(error){failures.push(error);}}
void test("complete fixed arms observe ready callbacks in actual inert V8 while historical startup arms remain suppressed",async()=>{
 const before=currentFootprintForwardWriterFrontierNativeSource(),session=new Session();session.connect();
 const script:{value:Readonly<{id:string;context:number}>|null}={value:null};const failures:unknown[]=[];let pauses=0;
 session.on("Debugger.scriptParsed",event=>{if(event.params.url==="synthetic-forward-ready-arms.js"){script.value={id:event.params.scriptId,context:event.params.executionContextId};}});
 session.on("Debugger.paused",()=>{pauses+=1;void retain(session.post("Debugger.resume"),failures);});
 const points:string[]=[];
 try{
  await session.post("Runtime.enable");await session.post("Debugger.enable");
  const context=createContext({});runInContext('globalThis.PROJECT={isReady:true};\nglobalThis.entry=function entry(){\n return 1;\n};\n//# sourceURL=synthetic-forward-ready-arms.js',context);
  const selected=script.value;assert.ok(selected!==null);
  const original=currentFootprintForwardWriterFrontierCases().find(value=>value.command.phase==="project-save-structure-arm"&&value.command.role==="startupEntry");assert.ok(original!==undefined);
  const old=commandSchema.parse(JSON.parse(currentFootprintForwardWriterFrontierTemplate(original).template));assert.ok(old.params.condition!==undefined);
  const current=arm(table("EasyedaForwardWriterCompleteArmRows")[0]??[]);assert.equal(current.params.condition,undefined);
  for(const [params,expected]of[[old.params,0],[current.params,1]]as const){
   const point=await session.post("Debugger.setBreakpoint",{...params,location:{scriptId:selected.id,lineNumber:2,columnNumber:1}});points.push(point.breakpointId);
   const result:unknown=await session.post("Runtime.evaluate",{contextId:selected.context,expression:"entry.call(PROJECT)",returnByValue:true});assert.deepEqual(result,{result:{type:"number",value:1,description:"1"}});assert.equal(pauses,expected);
   await session.post("Debugger.removeBreakpoint",{breakpointId:point.breakpointId});points.pop();
  }
  assert.deepEqual(failures,[]);assert.equal(currentFootprintForwardWriterFrontierNativeSource(),before);
 }finally{try{for(const breakpointId of points){await session.post("Debugger.removeBreakpoint",{breakpointId});}}finally{session.disconnect();}}
});
void test("ready native rows and complete-only dispatch preserve closed programs, numeric handles and original birth isolation",()=>{
 const ready=table("EasyedaForwardWriterReadyPublicationRows");assert.equal(ready.length,3);
 for(const row of ready){assert.ok(row[3]!==undefined);assert.match(row[3],/own\(project,\\"isReady\\"\)!==true/u);assert.doesNotMatch(row[3],/own\(project,\\"isReady\\"\)!==false/u);}
 assert.equal(table("EasyedaForwardWriterCompleteBranchProtocol").length,10);
 const dispatch=currentFootprintForwardWriterCompleteTailDispatch();assert.equal(new Set(CURRENT_FOOTPRINT_FORWARD_WRITER_COMPLETE_TAIL_ACTIONS).size,17);
 for(const action of CURRENT_FOOTPRINT_FORWARD_WRITER_COMPLETE_TAIL_ACTIONS){assert.equal(dispatch.split(`'${action}' {`).length,2);}
 assert.equal(dispatch.match(/if\(-not \$WorkerStartupFootprintForwardWriterComplete209 -or -not \$launched/gu)?.length,17);
 assert.doesNotMatch(dispatch,/functionDeclaration|sessionId|WorkerStartupFootprintForwardWriter209 -or/u);
 assert.match(dispatch,/\$role=\[System\.Management\.Automation\.Language\.NullString\]::Value;\$records=0/u);assert.doesNotMatch(dispatch,/\$role=\$null/u);
 const native=currentFootprintForwardWriterCompleteTailNativeSource();assert.match(native,/\[A-Za-z0-9_.:-\]\{1,256\}/u);
 assert.match(native,/bool forwardWriterCompleteBirth=false,forwardWriterCompleteTimerBaseline=false,forwardWriterCompletePublishTimerComplete=false;/u);
 assert.match(native,/forward-complete-natural-timer-required/u);assert.doesNotMatch(native,/\bviaDrainRequests\b|\bviaPostSyncStep\b|\bpcbViaWrite209\b/u);
});


// Mechanically execute only the emitted ledger method bodies with inert
// Validation/write fixtures. The separate C#5 check covers native syntax.
function ownerMethod(source:string,name:string):string{
 const declaration=new RegExp(`\\b(?:void|bool|string) ${name}\\(`,"u").exec(source);assert.ok(declaration!==null);const start=declaration.index;const open=source.indexOf("{",start);let depth=1,end=open+1;
 for(;end<source.length&&depth>0;end+=1){if(source[end]==="{"){depth+=1;}else if(source[end]==="}"){depth-=1;}}
 assert.equal(depth,0);
 return source.slice(open+1,end-1).replaceAll(' as string',"").replaceAll(/\b(?:int|string|bool) /gu,"let ")
  .replaceAll(".Length",".length").replaceAll(".Substring(",".slice(").replaceAll(".StartsWith(",".startsWith(")
  .replaceAll(",StringComparison.Ordinal","").replaceAll(".Count",".size").replaceAll('fields.Contains("body")','Object.hasOwn(fields,"body")').replaceAll(".Contains(",".has(").replaceAll(".Add(",".add(")
  .replaceAll(" as EasyedaForwardWriterAllocatedClockLedger","").replaceAll(".ToString(CultureInfo.InvariantCulture)",".toString()")
  .replaceAll("let count;fullDrainCounts.TryGetValue(phase,out count);","let count=fullDrainCounts[phase]??0;")
  .replaceAll("catch{","catch(caughtError){").replaceAll("throw;","throw caughtError;");
}
void test("cache settlement records only validated attempts and failed dispatch cannot complete",()=>{
 const failure=new Error("inert-write-or-validation"),source=currentFootprintForwardWriterCacheNativeSource();
 for(const refusal of ["encode","work","live","write"] as const){
  const state={forwardWriterProducerEnrolled:true,forwardWriterCacheJobs:2,forwardWriterCacheCompleted:false,forwardWriterCacheFailed:false,
   forwardWriterCacheRequests:0,forwardWriterCacheStages:[6,6],forwardWriterCacheSamples:[0,1],forwardWriterCacheHeld:null,forwardWriterCacheSlot:-1,
   footprintCopyWorkerSession:"original7"};let attempts=0;
  const context=createContext({...state,RequireForwardWriterProducer:():void=>{assert.equal(state.forwardWriterCacheJobs,2);},Error:():Error=>failure,
   EasyedaForwardWriterInitialCacheProtocol:{Observation:():boolean=>false,Encode:():string=>{if(refusal==="encode"){throw failure;}return "encoded";}},
   CheckFootprintWork:():void=>{if(refusal==="work"){throw failure;}},AssertLive:():void=>{if(refusal==="live"){throw failure;}},
   SendMessage:():never=>{attempts+=1;throw failure;}});
  const send=`(function(id,phase,method,fields){${ownerMethod(source,"SendForwardWriterInitialCache")}})`;
  const invoke=():unknown=>runInContext(`${send}(1,'inverse-initial-cache-settled-0','Runtime.getProperties',{})`,context);
  let caught:unknown;try{invoke();}catch(error){caught=error;}assert.equal(caught,failure);assert.deepEqual([...state.forwardWriterCacheSamples],refusal==="write"?[1,1]:[0,1]);
  assert.equal(context["forwardWriterCacheRequests"],refusal==="write"?1:0);assert.equal(attempts,refusal==="write"?1:0);
  assert.equal(context["forwardWriterCacheFailed"],refusal==="write");
  const complete=`(function(){${ownerMethod(source,"CompleteForwardWriterInitialCache")}})()`;
  assert.throws(()=>runInContext(complete,context));assert.equal(context["forwardWriterCacheCompleted"],false);
  if(refusal==="write"){assert.throws(invoke);assert.equal(attempts,1);}
 }
});
void test("frontier validation preserves held state while a partial write permanently consumes the attempt",()=>{
 const source=currentFootprintForwardWriterFrontierNativeSource();
 for(const lane of ["callback","timer","queue","arm"] as const){
  for(const refusal of ["encode","work","live","write"] as const){
   const failure=new Error("inert-partial-or-validation");let attempts=0;
   const state={forwardWriterFrontierRecords:1,forwardWriterFrontierComplete:false,forwardWriterFrontierFailed:false,footprintCreateClockBegun:false,
    forwardWriterProducerEnrolled:lane!=="arm",forwardWriterProducerScript:"script7",forwardWriterProducerContext:"context8",footprintCopyWorkerSession:"session9",
    forwardWriterFrontierCallbackHeld:lane==="callback"?"startupEntry":null,forwardWriterFrontierTimerHeld:lane==="timer"?"entry":null,
    forwardWriterFrontierQueueOpened:lane==="queue",forwardWriterFrontierArms:new Set<string>(),forwardWriterFrontierCallbackRequests:0,
    forwardWriterFrontierTimerStep:17,ForwardWriterFrontierTimerPhases:Array.from({length:28},()=>"sync-quiesce-resume-entry"),
    forwardWriterFrontierQueueRequests:0,forwardWriterFrontierQueueSeen:false};
   const context=createContext({...state,RequireForwardWriterProducer:():void=>{assert.equal(state.forwardWriterFrontierRecords,1);},Error:():Error=>failure,
    ForwardWriterFrontierCallbackPhase:():boolean=>true,
    EasyedaForwardWriterFrontierProtocol:{Encode:():string=>{if(refusal==="encode"){throw failure;}return "possibly-partial";}},
    CheckFootprintWork:():void=>{if(refusal==="work"){throw failure;}},AssertLive:():void=>{if(refusal==="live"){throw failure;}},
    SendMessage:():never=>{attempts+=1;throw failure;}});
   runInContext(`globalThis.RequireForwardWriterFrontier=function(){${ownerMethod(source,"RequireForwardWriterFrontier")}}`,context);
   const phase={callback:"project-save-structure-resume-startupEntry",timer:"sync-quiesce-resume-entry",queue:"inverse-startup-queue-empty",arm:"project-save-structure-arm-startupEntry"}[lane];
   const method={arm:"Debugger.setBreakpoint",queue:"Runtime.callFunctionOn",timer:"Debugger.resume",callback:"Debugger.resume"}[lane];
   const send=`(function(id,lane,phase,method,fields){${ownerMethod(source,"SendForwardWriterFrontier")}})`;
   const invoke=():unknown=>runInContext(`${send}(1,${JSON.stringify(lane==="arm"?"callback":lane)},${JSON.stringify(phase)},${JSON.stringify(method)},{scriptId:'script7'})`,context);
   let caught:unknown;try{invoke();}catch(error){caught=error;}assert.equal(caught,failure);const dispatched=refusal==="write";
   assert.equal(context["forwardWriterFrontierFailed"],dispatched);assert.equal(attempts,dispatched?1:0);
   assert.equal(context["forwardWriterFrontierCallbackRequests"],dispatched&&lane==="callback"?1:0);
   assert.equal(context["forwardWriterFrontierCallbackHeld"],lane==="callback"&&!dispatched?"startupEntry":null);
   assert.equal(context["forwardWriterFrontierTimerStep"],dispatched&&lane==="timer"?18:17);
   assert.equal(context["forwardWriterFrontierTimerHeld"],lane==="timer"&&!dispatched?"entry":null);
   assert.equal(context["forwardWriterFrontierQueueRequests"],dispatched&&lane==="queue"?1:0);
   assert.equal(context["forwardWriterFrontierQueueSeen"],dispatched&&lane==="queue");
   assert.equal(state.forwardWriterFrontierArms.size,dispatched&&lane==="arm"?1:0);
   if(dispatched){assert.throws(invoke);assert.equal(attempts,1);}
  }
 }
});
void test("renderer fragment requires one explicit cold-enum composition and cannot grant a live writer",()=>{
 const original="public class Owner { enum RendererWriteRole { Existing, ClockRpc, NativeCreate, ForwardCold } }";
 const composed=currentFootprintForwardWriterRendererRoleSource(original);
 assert.match(composed,/NativeCreate, ForwardCold, ForwardWriterProducer/u);
 assert.match(CURRENT_FOOTPRINT_FORWARD_WRITER_RENDERER_CLASS_NATIVE,/RendererWriteRole.ForwardWriterProducer/u);
 assert.throws(()=>currentFootprintForwardWriterRendererRoleSource(composed));
 assert.throws(()=>currentFootprintForwardWriterRendererRoleSource(original+original));
 assert.throws(()=>currentFootprintForwardWriterRendererRoleSource(original.replace(", ForwardCold","")));
 assert.throws(()=>currentFootprintForwardWriterRendererRoleSource(original+CURRENT_FOOTPRINT_FORWARD_WRITER_RENDERER_CLASS_NATIVE));
});

void test("unmounted complete tail exposes its exact stateless Main history composition dependency",()=>{
 const dependency=currentFootprintForwardWriterCompleteHistoryCodebookSource(),inverse=currentFootprintInverseMainHistoryNativeSource();
 const marker="public sealed partial class EasyedaDiagnosticOwner {";
 assert.equal(dependency,inverse.slice(0,inverse.indexOf(marker)).replaceAll("EasyedaFootprintInverseMainHistoryProtocol","EasyedaForwardWriterMainHistoryProtocol"));
 assert.equal(dependency.split("public static class EasyedaForwardWriterMainHistoryProtocol {").length,2);
 assert.doesNotMatch(dependency,/class EasyedaDiagnosticOwner|SendFootprintInverseMainHistory|footprintInverse209/u);
 assert.match(currentFootprintForwardWriterCompleteTailNativeSource(),/EasyedaForwardWriterMainHistoryProtocol.Encode/u);
 assert.doesNotMatch(currentFootprintForwardWriterCompleteTailNativeSource(),/class EasyedaForwardWriterMainHistoryProtocol/u);
});
void test("ticket baseline is successful-send-only and uncertain setup/held/slot sends block every later stage",()=>{
 const source=currentFootprintForwardWriterTicketTimerNativeSource(),tail=currentFootprintForwardWriterCompleteTailNativeSource();
 for(const role of ["baseline","setup","held","slot"]as const){
  for(const failSend of [false,true]){
   const failure=new Error("inert-partial-write");let attempts=0;
   const state={fullTicketBound:true,fullTicketReady:role!=="setup",fullTicketFailed:false,fullCompleteSendFailed:false,forwardWriterCompletePublishTimerComplete:false,
    footprintCreateClockBegun:role==="held"||role==="slot",fullTicketSetup:role==="setup"?0:37,
    forwardWriterCompleteTimerBaseline:role!=="baseline",fullTicketRole:role==="held"?"entry":null,fullTicketHeldStep:0,fullTicketHolds:0,fullTicketSlots:0,
    fullPublicationComplete:true,fullPostComplete:true,fullDrainComplete:true,forwardWriterCompleteTimerArms:3,
    forwardWriterCompleteBirth:true,forwardWriterProducerEnrolled:true,forwardWriterCacheCompleted:true,forwardWriterInitialSyncComplete:true,
    forwardWriterFrontierComplete:true,fullComplete:false,footprintCopyWorkerSession:"session7",forwardWriterProducerScript:"script8"};
   const phase={baseline:"ticket-timer-call-before",setup:"setup-0",held:"held-38",slot:"ticket-timer-call-slot"}[role];
   const method=role==="held"?"Debugger.resume":"Runtime.callFunctionOn";
   const context=createContext({...state,Error:():Error=>failure,RequireForwardWriterProducer:():void=>{assert.equal(state.forwardWriterCompleteBirth,true);},
    AssertLive:():void=>{assert.equal(state.forwardWriterCompleteBirth,true);},
    RequireForwardWriterCompleteCreated:():void=>{assert.equal(state.footprintCreateClockBegun,true);},
    EasyedaForwardWriterTicketTimerProtocol:{Phase:(index:number):string=>({0:"setup-0",37:"ticket-timer-call-before",38:"held-38",48:"ticket-timer-call-slot"})[index]??"wrong",Encode:():string=>"inert-frame"},
    SendForwardWriterNormalMessage:():void=>{attempts+=1;if(failSend){throw failure;}}});
   runInContext(`globalThis.RequireForwardWriterCompleteBase=function(){${ownerMethod(tail,"RequireForwardWriterCompleteBase")}}`,context);
   const invoke=():unknown=>runInContext(`(function(id,phase,method,fields){${ownerMethod(source,"SendForwardWriterTicketTimer")}})(1,${JSON.stringify(phase)},${JSON.stringify(method)},{})`,context);
   let caught:unknown;try{invoke();}catch(error){caught=error;}
   assert.equal(caught,failSend?failure:undefined);assert.equal(attempts,1);assert.equal(context["fullTicketFailed"],failSend);
   assert.equal(context["forwardWriterCompleteTimerBaseline"],role!=="baseline"||!failSend);
   assert.equal(context["fullTicketSetup"],role==="setup"?1:37);
   assert.equal(context["fullTicketHeldStep"],role==="held"?1:0);assert.equal(context["fullTicketSlots"],role==="slot"?1:0);
   if(failSend){
    assert.throws(invoke);assert.equal(attempts,1);
    assert.throws(()=>runInContext(`(function(operation,role,ordinal){${ownerMethod(source,"ControlForwardWriterTicketTimer")}})('complete',null,0)`,context));
    assert.equal(context["forwardWriterCompletePublishTimerComplete"],false);
   }
  }
 }
});

void test("initial sync failed sends consume their step but cannot advance or complete",()=>{
 const source=currentFootprintForwardWriterSyncNativeSource();
 for(const initialStage of [42,44]){
  for(const refusal of ["encode","work","live","write"]as const){
   const failure=new Error("inert-sync-failure");let attempts=0;
   const state={forwardWriterProducerEnrolled:true,forwardWriterCacheCompleted:true,forwardHeadCompleted:true,forwardWriterInitialSyncComplete:false,
    forwardWriterInitialSyncFailed:false,footprintCreateClockBegun:false,forwardWriterInitialSyncStage:initialStage,
    forwardWriterInitialSyncHeld:initialStage===42?"syncReturned":null,forwardWriterInitialSyncHolds:9,forwardWriterHistoryStep:52,footprintCopyWorkerSession:"session7"};
   const context=createContext({...state,Error:():Error=>failure,RequireForwardWriterProducer:():void=>{assert.equal(state.forwardHeadCompleted,true);},
    EasyedaForwardWriterInitialSyncProtocol:{Observation:():boolean=>false,Index:():number=>initialStage,Encode:():string=>{if(refusal==="encode"){throw failure;}return "inert-frame";}},
    CheckFootprintWork:():void=>{if(refusal==="work"){throw failure;}},AssertLive:():void=>{if(refusal==="live"){throw failure;}},
    SendMessage:():never=>{attempts+=1;throw failure;}});
   runInContext(`globalThis.RequireForwardWriterInitialSync=function(){${ownerMethod(source,"RequireForwardWriterInitialSync")}}`,context);
   const invoke=():unknown=>runInContext(`(function(id,phase,method,fields){${ownerMethod(source,"SendForwardWriterInitialSync")}})(1,'inert-phase','Debugger.resume',{})`,context);
   let caught:unknown;try{invoke();}catch(error){caught=error;}assert.equal(caught,failure);
   const attempted=refusal==="write";assert.equal(attempts,attempted?1:0);assert.equal(context["forwardWriterInitialSyncStage"],initialStage+(attempted?1:0));
   assert.equal(context["forwardWriterInitialSyncHeld"],initialStage===42&&!attempted?"syncReturned":null);
   assert.equal(context["forwardWriterInitialSyncFailed"],attempted);
   if(attempted){
    assert.throws(invoke);assert.equal(attempts,1);
    assert.throws(()=>runInContext(`(function(){${ownerMethod(source,"CompleteForwardWriterInitialSync")}})()`,context));
    assert.throws(()=>runInContext(`(function(role){${ownerMethod(source,"HoldForwardWriterInitialSync")}})('syncReturned')`,context));
    assert.equal(context["forwardWriterInitialSyncComplete"],false);
   }
  }
 }
});

void test("startup success follows the send; pre-dispatch refusal is correctable and ambiguous write stays consumed",()=>{
 const source=currentFootprintForwardWriterStartupWsNativeSource(),tail=currentFootprintForwardWriterCompleteTailNativeSource();
 for(const failureKind of ["none","before-write","partial-write"]as const){
  const failure=new Error("inert-startup-send"),state={protocolFailed:false,nextRequest:2,writes:0};
  const context=createContext({fullStartupWsConsumed:false,forwardWriterCompleteBirth:true,footprintCreateClockBegun:false,
   forwardWriterProducerEnrolled:true,forwardWriterFrontierComplete:false,forwardWriterFrontierCallbackHeld:"startupEntry",
   forwardWriterFrontierCalls:1,forwardWriterFrontierCallbackRequests:0,footprintCopyWorkerSession:"original7",
   fullCopyBodyEscapedMaximum:1,fullTailStep:3,fullPublicationRecords:2,fullBranchMainStep:10,fullBranchWorkerStep:5,fullOwnDataReady:true,
   forwardWriterCompleteTimerBaseline:true,forwardWriterCompleteTimerArms:3,RequireForwardWriterCompleteBase:():void=>{
    // Other base invariants are fixed by this inert fixture.
   },
   RequireForwardWriterProducer:():void=>{
    // Fixed admission here allocates no native producer.
   },Error:():Error=>failure,ForwardWriterStartupWsMessage:():string=>"fixed-startup-read",
   // The original sender checks its ID before write; a write attempt consumes
   // The ID and a write exception permanently poisons its channel.
   SendForwardWriterNormalMessage:(id:number):void=>{
    if(state.protocolFailed||id!==state.nextRequest){throw failure;}state.nextRequest+=1;state.writes+=1;
    if(failureKind==="partial-write"){state.protocolFailed=true;throw failure;}
   }});
  const send=`(function(id,frame){${ownerMethod(source,"SendForwardWriterStartupWs")}})`;
  const invoke=(id:number):unknown=>runInContext(`${send}(${String(id)},'original-frame')`,context);
  const precreate=():unknown=>runInContext(`(function(){${ownerMethod(tail,"RequireForwardWriterCompletePrecreate")}})()`,context);
  if(failureKind==="none"){invoke(2);assert.equal(context["fullStartupWsConsumed"],true);precreate();}
  else{
   assert.throws(()=>invoke(failureKind==="before-write"?1:2));assert.equal(context["fullStartupWsConsumed"],false);assert.throws(precreate);
   if(failureKind==="before-write"){assert.equal(state.writes,0);invoke(2);assert.equal(context["fullStartupWsConsumed"],true);precreate();}
   else{assert.equal(state.writes,1);assert.throws(()=>invoke(3));assert.equal(context["fullStartupWsConsumed"],false);assert.equal(state.writes,1);assert.throws(precreate);}
  }
  assert.throws(()=>invoke(state.nextRequest));assert.equal(state.writes,1);
 }
});

function completeContext(extra:Readonly<Record<string,unknown>>,refusal:"none"|"encode"|"send"="none"):ReturnType<typeof createContext>{
 const failure=new Error("inert-complete-send");const context=createContext({
  forwardWriterCompleteBirth:true,forwardWriterProducerEnrolled:true,forwardWriterCacheCompleted:true,forwardWriterInitialSyncComplete:true,
  forwardWriterFrontierComplete:true,fullTicketFailed:false,fullCompleteSendFailed:false,fullComplete:false,
  forwardWriterBirth:true,forwardWriterRendererNormalId:0,protocolFailed:false,launchCompleted:true,nextRequest:2,EffectiveRequestLimit:10,
  footprintCreateClockBegun:false,footprintCreateClockActive:false,footprintCreateClockLedger:null,footprintCopyWorkerSession:"session7",
  forwardWriterProducerScript:"script8",forwardWriterProducerContext:"context9",writes:0,
  RequireForwardWriterProducer:():void=>{
   // This inert fixture grants no original producer.
  },AssertLive:():void=>{
   // The separate transport fixture controls native liveness.
  },Error:():Error=>failure,
  RendererWriteRole:{ForwardWriterProducer:7},...extra
 });
 context["SendMessage"]=(id:number):void=>{assert.equal(id,context["nextRequest"]);context["nextRequest"]=id+1;context["writes"]=Number(context["writes"])+1;if(refusal==="send"){throw failure;}};
 const codec={Phase:():"fixed-phase"=>"fixed-phase",Encode:():string=>{if(refusal==="encode"){throw failure;}return "fixed-frame";}};
 for(const name of ["BranchQuery","CopyLocal","PcbViaUploadRequest","PcbViaSaveTailObservation","PcbViaSaveTailDeleteControl","Publication","PcbViaSaveDrain","CopyPost"]){
  const prefix=name.startsWith("Pcb")?"Easyeda":"EasyedaForwardWriter";context[`${prefix+name}Protocol`]=codec;
 }
 const tail=currentFootprintForwardWriterCompleteTailNativeSource();
 for(const name of ["RequireForwardWriterCompleteBase","RequireForwardWriterCompleteRendererId","SendForwardWriterCompleteNormalMessage"]){
  runInContext(`globalThis.${name}=function(id,message){${ownerMethod(tail,name)}}`,context);
 }
 runInContext(`globalThis.SendForwardWriterNormalMessage=function(id,message){${ownerMethod(CURRENT_FOOTPRINT_FORWARD_WRITER_RENDERER_CLASS_NATIVE,"SendForwardWriterNormalMessage")}}`,context);
 // Inert created/drain/post admission invokes the actual common base;
 // It creates no original clock, owner or application permission.
 runInContext("globalThis.RequireForwardWriterCompleteCreated=globalThis.RequireForwardWriterCopyDrain=globalThis.RequireForwardWriterCopyPost=RequireForwardWriterCompleteBase",context);
 return context;
}
void test("all complete renderer lanes reject a wrong physical ID before consuming their own phase",()=>{
 const tail=currentFootprintForwardWriterCompleteTailNativeSource();
 const lanes=[
  {name:"BranchQuery",counter:"fullBranchWorkerStep",initial:{fullBranchMainStep:1,fullBranchWorkerStep:0},args:"'fixed-phase','Runtime.callFunctionOn',{}"},
  {name:"CopyLocal",counter:"fullLocalStep",initial:{fullLocalStep:0},args:"'fixed-phase','Runtime.callFunctionOn',{}"},
  {name:"CopyUpload",counter:"fullUploadStep",initial:{fullLocalStep:21,fullUploadStep:0},args:"'fixed-phase','Runtime.callFunctionOn',{}"},
  {name:"CopyTailObservation",counter:"fullTailStep",initial:{fullTailStep:0},args:"'fixed-phase','Runtime.getProperties',{scriptId:'script8'}"},
  {name:"CopyDelete",counter:"fullDeleteStep",initial:{fullUploadStep:9,fullDeleteStep:0,fullTailStep:7,fullDrainResumed:new Set(["historyReply","detachedEntry"]),fullDrainJobs:[3,0,0]},args:"'fixed-phase','Runtime.callFunctionOn',{}"},
  {name:"Publication",counter:"fullPublicationQueueRequests",initial:{fullPublicationRecords:2,fullPublicationBodyBound:true,fullPublicationComplete:false,fullPublicationQueueOpened:true,fullPublicationHeld:null,fullPublicationQueueRequests:0,fullPublicationQueueSeen:false},args:"'queue','inverse-startup-queue-empty','Runtime.callFunctionOn',{}"},
  {name:"CopyDrain",counter:"fullDrainRequests",initial:{fullDrainRequests:0,fullDrainCounts:{}},args:"'via-drain-call-capture-0','Runtime.callFunctionOn',{}"},
  {name:"CopyPost",counter:"fullPostRequests",initial:{fullPostRequests:0,fullPostStep:0,FullPostRoles:["syncEntry"],fullPostSeen:{add:():boolean=>true},FullPostAllowed:():boolean=>true},args:"'via-post-sync-call-capture','Runtime.callFunctionOn',{}"}
 ]as const;
 for(const lane of lanes){
  for(const refusal of ["none","send"]as const){
   const context=completeContext({...lane.initial,...(lane.name==="CopyDrain"?{fullDrainCounts:{}}:{})},refusal);
   const invoke=(id:number):unknown=>runInContext(`(function(id,${lane.name==="Publication"?"lane,":""}phase,method,fields){${ownerMethod(tail,`SendForwardWriter${lane.name}`)}})(${String(id)},${lane.args})`,context);
   assert.throws(()=>invoke(3),lane.name);assert.equal(context[lane.counter],0);assert.equal(context["writes"],0);assert.equal(context["fullCompleteSendFailed"],false);
   if(refusal==="send"){
    assert.throws(()=>invoke(2));assert.equal(context[lane.counter],1);assert.equal(context["writes"],1);assert.equal(context["nextRequest"],3);assert.equal(context["fullCompleteSendFailed"],true);
    assert.throws(()=>invoke(3));assert.equal(context["writes"],1);assert.throws(()=>runInContext("RequireForwardWriterCompleteBase()",context));
   }else{invoke(2);assert.equal(context[lane.counter],1);assert.equal(context["writes"],1);assert.equal(context["fullCompleteSendFailed"],false);}
  }
 }
});

void test("complete publication queue proof survives no encoding failure and cannot complete after an uncertain send",()=>{
 const tail=currentFootprintForwardWriterCompleteTailNativeSource();
 for(const refusal of ["encode","send"]as const){
  const context=completeContext({fullPublicationRecords:2,fullPublicationBodyBound:true,fullPublicationComplete:false,fullPublicationQueueOpened:true,
   fullPublicationHeld:null,fullPublicationQueueRequests:2,fullPublicationQueueSeen:false,fullPublicationCalls:0},refusal);
  const invoke=():unknown=>runInContext(`(function(id,lane,phase,method,fields){${ownerMethod(tail,"SendForwardWriterPublication")}})(2,'queue','inverse-startup-queue-empty','Runtime.callFunctionOn',{})`,context);
  assert.throws(invoke);assert.equal(context["fullPublicationQueueSeen"],refusal==="send");assert.equal(context["fullPublicationQueueRequests"],refusal==="send"?3:2);
  assert.equal(context["writes"],refusal==="send"?1:0);
  const complete=():unknown=>runInContext(`(function(operation,role,records){${ownerMethod(tail,"ControlForwardWriterPublication")}})('complete',null,0)`,context);
  assert.throws(complete);assert.equal(context["fullPublicationComplete"],false);
  if(refusal==="send"){assert.throws(invoke);assert.equal(context["writes"],1);}
  else{
   context["EasyedaForwardWriterPublicationProtocol"]={Encode:():"fixed-frame"=>"fixed-frame"};
   invoke();assert.equal(context["fullPublicationQueueSeen"],true);assert.equal(context["writes"],1);
   complete();assert.equal(context["fullPublicationComplete"],true);
  }
 }
});
void test("complete Main phase and physical ID are consumed only after validation, and partial sends poison the common owner",()=>{
 const tail=currentFootprintForwardWriterCompleteTailNativeSource();
 for(const lane of ["BranchMain","LiveHistory"]as const){
  for(const refusal of ["id","encode","frame","purpose","live","send","after-send"]as const){
   let checks=0,writes=0;const failure=new Error("inert-main-refusal");const context=completeContext({
    mainRequest:1,stockMainRequests:0,mainCompletionBegun:false,mainCompletionRetired:true,mainCompletionFailed:false,
    fullBranchMainStep:lane==="BranchMain"?0:11,fullLiveStep:0,FullBranchPhases:["fixed-phase"],FullLivePhases:["fixed-phase"],
    EasyedaFootprintForwardExecutionLimits:{MainRequests:10},originalMain:{ForwardExecutionProfile:true,SendFixed:():void=>{writes+=1;if(refusal==="send"){throw failure;}}},
    ForwardWriterHistoryMessage:(message:string):string=>{if(refusal==="frame"){throw failure;}return message;},
    MainPurpose:():void=>{if(refusal==="purpose"){throw failure;}},
    AssertLive:():void=>{checks+=1;if(refusal==="live"||refusal==="after-send"&&writes>0){throw failure;}},
    EasyedaForwardWriterCompleteBranchProtocol:{Encode:():string=>{if(refusal==="encode"){throw failure;}return "framed";}},
    EasyedaForwardWriterMainHistoryProtocol:{Encode:():string=>{if(refusal==="encode"){throw failure;}return "framed";}}
   });
   runInContext(`globalThis.SendForwardWriterCompleteMain=function(id,framed,cleanup,consume){${ownerMethod(tail,"SendForwardWriterCompleteMain")}}`,context);
   const invoke=(id:number):unknown=>runInContext(`(function(id,phase,method,fields){${ownerMethod(tail,`SendForwardWriter${lane}`)}})(${String(id)},'fixed-phase','Runtime.callFunctionOn',{})`,context);
   assert.throws(()=>invoke(refusal==="id"?3:2));
   const counter=lane==="BranchMain"?"fullBranchMainStep":"fullLiveStep",dispatched=refusal==="send"||refusal==="after-send";
   assert.equal(context[counter],dispatched?1:0);assert.equal(context["mainRequest"],dispatched?2:1);assert.equal(context["fullCompleteSendFailed"],dispatched);assert.equal(writes,dispatched?1:0);
   if(dispatched){assert.throws(()=>invoke(3));assert.equal(writes,1);}
   if(refusal==="id"){invoke(2);assert.equal(context[counter],1);assert.equal(writes,1);}
   assert.ok(checks>0);
  }
 }
});
