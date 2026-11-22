/** Original native DELETE Main request/SQL component. Backend alone retains
 * its production host; constructing another component never registers it. */
/* oxlint-disable import/max-dependencies -- Each independent fixed vocabulary retains its own decoder and original custody. */
import { z } from "zod";
import type { CurrentFootprintInverseNativeDeleteMainSource, CurrentFootprintInverseNativeDeleteMainSourceOriginal } from "./current-footprint-inverse-native-delete-main-source.ts";
import type { CurrentFootprintInverseNativeDeleteMainBindings, CurrentFootprintInverseNativeDeleteMainEvent, CurrentFootprintInverseNativeDeleteMainPlan, CurrentFootprintInverseNativeDeleteMainRequestOrigin } from "./current-footprint-inverse-native-delete-main-origin.ts";
import { CurrentFootprintInverseNativeDeleteMainRequestObserver } from "./current-footprint-inverse-native-delete-main-request-observer.ts";
import { CurrentFootprintInverseNativeDeleteMainBeginObserver } from "./current-footprint-inverse-native-delete-main-begin-observer.ts";
import { CurrentFootprintInverseNativeDeleteMainHistoryObserver, requireOriginalCurrentFootprintInverseNativeDeleteMainHistoryCompletion } from "./current-footprint-inverse-native-delete-main-history-observer.ts";
import type { CurrentFootprintInverseNativeDeleteMainHistoryCompletion } from "./current-footprint-inverse-native-delete-main-history-observer.ts";
import type { CurrentProjectHistorySqlEffects } from "./current-project-history-sql-effects.ts";
import { CurrentFootprintInverseNativeDeleteMainBeginCustody } from "./current-footprint-inverse-native-delete-main-begin-custody.ts";
import type { CurrentFootprintInverseNativeDeleteMainBeginPause } from "./current-footprint-inverse-native-delete-main-begin-custody.ts";
import { CurrentFootprintInverseNativeDeleteMainHistoryCustody } from "./current-footprint-inverse-native-delete-main-history-custody.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_HISTORY_SITES as HISTORY_SITES, validateCurrentFootprintInverseNativeDeleteMainHistoryCommand } from "./current-footprint-inverse-native-delete-main-history-protocol.ts";
import type { CurrentFootprintInverseNativeDeleteMainHistoryNativeWindow } from "./current-footprint-inverse-native-delete-main-history-ack.ts";
import { validateCurrentFootprintInverseNativeDeleteMainBeginCommand } from "./current-footprint-inverse-native-delete-main-begin-protocol.ts";
import { validateCurrentFootprintInverseNativeDeleteMainCommand } from "./current-footprint-inverse-native-delete-main-protocol.ts";
import { validateCurrentFootprintInverseNativeDeleteMainStepCommand } from "./current-footprint-inverse-native-delete-main-step-protocol.ts";
import { deriveCurrentFootprintInverseNativeDeleteMainBaseline, requireCurrentFootprintInverseNativeDeleteMainBaseline } from "./current-footprint-inverse-native-delete-main-baseline.ts";
import { canonicalJson } from "./core.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_CALLS as CALLS, CURRENT_FOOTPRINT_COPY_MAIN_BACKEND_FLAGS as FLAGS } from "./current-footprint-copy-main-backend-programs.ts";
import type { CurrentFootprintCopyMainRequestSource } from "./current-footprint-copy-main-request-source.ts";
import type { CurrentSelectedFileMainRequestObservation } from "./current-selected-file-main-request-reader.ts";

export type CurrentFootprintInverseNativeDeleteMainCommandInput =
 ReturnType<typeof validateCurrentFootprintInverseNativeDeleteMainCommand> |
 ReturnType<typeof validateCurrentFootprintInverseNativeDeleteMainStepCommand> |
 ReturnType<typeof validateCurrentFootprintInverseNativeDeleteMainBeginCommand> |
 ReturnType<typeof validateCurrentFootprintInverseNativeDeleteMainHistoryCommand>;
export interface CurrentFootprintInverseNativeDeleteMainHost {
 readonly scriptId:string; readonly constructionObjectId:string; readonly sourceObjectId:string; readonly captureObjectId:string;
 readonly persistentDriverBreakpointId:string; readonly source:CurrentFootprintCopyMainRequestSource;
 readonly assertCurrent:()=>void; readonly pendingRequestId:()=>number|null; readonly busy:()=>boolean;
 readonly send:(command:CurrentFootprintInverseNativeDeleteMainCommandInput,cleanup:boolean)=>Promise<unknown>;
 readonly pause:()=>CurrentFootprintInverseNativeDeleteMainBeginPause;
 readonly nextEvent:()=>Promise<CurrentFootprintInverseNativeDeleteMainEvent>;
 readonly observeRequest:()=>Promise<CurrentSelectedFileMainRequestObservation>;
 readonly requireRequest:(packet:CurrentSelectedFileMainRequestObservation)=>void;
 readonly resume:(identity:object,command:CurrentFootprintInverseNativeDeleteMainCommandInput)=>Promise<unknown>;
 readonly registerPoint:(id:string,location:Readonly<{scriptId:string;lineNumber:number;columnNumber:number}>)=>void;
 readonly pointCurrent:(id:string)=>boolean; readonly removePoint:(id:string)=>void;
 readonly fail:(cause:unknown)=>void;
}
// No post-sync cache hit or readonly HTTP route is assumed by this prefix.
// Those natural calls remain fenced until a separate exact successor exists.
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_PREFIX_REQUESTS=Object.freeze({
 construction:1,request:22,requestSteps:3,begin:19,history:88,selectedReadonly:9,
 normal:142,cleanup:19,total:161,preUpload:16,postSyncBudgetReserved:false,wholeInverseReserved:false,
});
function need(value:boolean,code:string):asserts value{if(!value){throw new Error(`INVERSE_NATIVE_DELETE_MAIN_${code}`);}}
function command(input:unknown):CurrentFootprintInverseNativeDeleteMainCommandInput{
 const phase=z.looseObject({phase:z.string()}).parse(input).phase;
 if(phase.startsWith("inverse-native-delete-main-begin-")){return validateCurrentFootprintInverseNativeDeleteMainBeginCommand(input);}
 if(phase.startsWith("inverse-native-delete-main-history-")){return validateCurrentFootprintInverseNativeDeleteMainHistoryCommand(input);}
 if(["inverse-native-delete-main-driver-step","inverse-native-delete-main-context-step","inverse-native-delete-main-controller-step"].includes(phase)){return validateCurrentFootprintInverseNativeDeleteMainStepCommand(input);}
 return validateCurrentFootprintInverseNativeDeleteMainCommand(input);
}
export class CurrentFootprintInverseNativeDeleteMainController {
 readonly #host:CurrentFootprintInverseNativeDeleteMainHost; readonly #original:CurrentFootprintInverseNativeDeleteMainSourceOriginal;
 readonly #source:CurrentFootprintInverseNativeDeleteMainSource; readonly #origin:CurrentFootprintInverseNativeDeleteMainRequestOrigin;
 readonly #plan:CurrentFootprintInverseNativeDeleteMainPlan; readonly #baseline:ReturnType<typeof deriveCurrentFootprintInverseNativeDeleteMainBaseline>;
 readonly #request:CurrentFootprintInverseNativeDeleteMainRequestObserver; readonly #begin:CurrentFootprintInverseNativeDeleteMainBeginCustody;
 readonly #beginObserver:CurrentFootprintInverseNativeDeleteMainBeginObserver; readonly #history:CurrentFootprintInverseNativeDeleteMainHistoryCustody;
 readonly #historyObserver:CurrentFootprintInverseNativeDeleteMainHistoryObserver;
 #pending:Readonly<{command:CurrentFootprintInverseNativeDeleteMainCommandInput;consumed:{value:boolean}}>|null=null;
 #arming:Readonly<{scriptId:string;lineNumber:number;columnNumber:number}>|null=null;
 #prepare:Promise<void>|null=null; #run:Promise<CurrentFootprintInverseNativeDeleteMainHistoryCompletion>|null=null;
 #completedPacket:CurrentFootprintInverseNativeDeleteMainHistoryCompletion|null=null;
 #prepared=false; #failed=false; #ended=false; #failure:unknown; #normal=0; #cleanup=0;
 public constructor(source:CurrentFootprintInverseNativeDeleteMainSource,original:CurrentFootprintInverseNativeDeleteMainSourceOriginal,origin:CurrentFootprintInverseNativeDeleteMainRequestOrigin,host:CurrentFootprintInverseNativeDeleteMainHost){
  this.#source=source;this.#original=original;this.#origin=origin;this.#host=Object.freeze({...host});
  original.assertBeforeOriginalUpload();host.assertCurrent();need(/^[a-f0-9]{64}$/u.test(original.projectUuid),"PROJECT_ROUTE_WIDTH");
  this.#baseline=deriveCurrentFootprintInverseNativeDeleteMainBaseline(original.beforeInventory,original.historyBaseline,original.bodyPlan);
  need(this.#baseline.headCount<8,"APPEND_CACHE_HEAD_CAPACITY");
  this.#plan=Object.freeze({target:Object.freeze({projectUuid:original.projectUuid,branchUuid:original.branchUuid,rawWindowsPath:original.path})});
  const same=():void=>{ this.#same(); };
  const actor=():ReturnType<CurrentFootprintInverseNativeDeleteMainRequestObserver["originalActorSql"]>=>this.#request.originalActorSql();
  const common={origin,scriptId:host.scriptId,captureObjectId:host.captureObjectId,assertCurrent:same,pause:host.pause,pendingRequestId:host.pendingRequestId,busy:host.busy,registerPoint:host.registerPoint,pointCurrent:host.pointCurrent,removePoint:host.removePoint};
  const begin=new CurrentFootprintInverseNativeDeleteMainBeginCustody({...common,actorSql:actor,send:(value,cleanup):Promise<unknown>=>this.#send(value,cleanup),resume:(identity,value):Promise<unknown>=>this.#resume(identity,value)});
  this.#begin=begin;
  const history=new CurrentFootprintInverseNativeDeleteMainHistoryCustody({...common,before:():typeof original.beforeInventory=>original.beforeInventory,baseline:():ReturnType<typeof deriveCurrentFootprintInverseNativeDeleteMainBaseline>=>this.#baseline,handoff:():ReturnType<typeof begin.consumeHistoryHandoff>=>begin.consumeHistoryHandoff(),actorValue:():ReturnType<typeof actor>["value"]=>actor().value,send:(value,cleanup):Promise<unknown>=>this.#send(value,cleanup),resume:(identity,value):Promise<unknown>=>this.#resume(identity,value)});
  this.#history=history;
  const bindings:CurrentFootprintInverseNativeDeleteMainBindings=Object.freeze<CurrentFootprintInverseNativeDeleteMainBindings>({scriptId:host.scriptId,constructionObjectId:host.constructionObjectId,source:host.source,persistentDriverBreakpointId:host.persistentDriverBreakpointId,sqlCaptureObjectId:host.captureObjectId,
   assertBeforeOriginalUpload:()=>{ original.assertBeforeOriginalUpload(); },assertOriginalUploadWritten:()=>{same();need(original.originalUploadWritten(),"ORIGINAL_UPLOAD_WRITE_REQUIRED");},
   requireOriginalBody:()=>{same();return Object.freeze({dataStr:original.bodyPlan.workerUpload,bodySha256:original.bodyPlan.workerUploadSha256});},
   request:async(value,cleanup)=>{same();const checked=validateCurrentFootprintInverseNativeDeleteMainCommand(value);const point=checked.method==="Debugger.setBreakpoint"?z.strictObject({scriptId:z.string(),lineNumber:z.number(),columnNumber:z.number()}).parse(checked.params["location"]):null;
    const raw=await this.#send(checked,cleanup);if(point!==null){const allocated=z.strictObject({breakpointId:z.string(),actualLocation:z.unknown()}).parse(raw);need(canonicalJson(allocated.actualLocation)===canonicalJson(point),"REQUEST_ARM_LOCATION");host.registerPoint(allocated.breakpointId,point);}
    if(checked.method==="Debugger.removeBreakpoint"){need(typeof checked.params["breakpointId"]==="string","REMOVE_POINT");host.removePoint(checked.params["breakpointId"]);}return raw;},
   beginRequest:(value,cleanup)=>begin.request(value,cleanup),requireBeginArmed:()=>{ begin.requireArmed(); },originalBeginResult:()=>begin.result(),
   historyRequest:(value,cleanup)=>history.request(value,cleanup),requireHistoryArmed:()=>{ history.requireArmed(); },startHistory:()=>history.start(),originalHistoryEffects:()=>history.result(),
   nextEvent:host.nextEvent,observeRequest:host.observeRequest,requireOriginalRequest:host.requireRequest,
   continueReadonlyRequest:():Promise<void>=>{throw new Error("INVERSE_NATIVE_DELETE_MAIN_UNRESERVED_HTTP_READ");},
   requireOriginalControllerBody:same,requireOriginalActorSql:actor,
   continuePlannedDriver:async(packet)=>{host.requireRequest(packet);await this.#resume(host.pause().identity,{phase:"inverse-native-delete-main-driver-step",method:"Debugger.resume",params:{}});},
   continuePlannedContext:async()=>{await this.#resume(host.pause().identity,{phase:"inverse-native-delete-main-context-step",method:"Debugger.resume",params:{}});},
   continuePlannedController:async()=>{await this.#resume(host.pause().identity,{phase:"inverse-native-delete-main-controller-step",method:"Debugger.resume",params:{}});},
   assertCurrent:():Promise<void>=>{same();return Promise.resolve();},fail:(cause):void=>{this.#fail(cause); },
  });
  this.#request=new CurrentFootprintInverseNativeDeleteMainRequestObserver(origin,source,this.#plan,bindings);
  this.#beginObserver=new CurrentFootprintInverseNativeDeleteMainBeginObserver(origin,source,this.#plan,bindings);
  this.#historyObserver=new CurrentFootprintInverseNativeDeleteMainHistoryObserver(origin,source,this.#plan,bindings);Object.freeze(this);
 }
 async #handled(pending:Promise<unknown>):Promise<void>{try{await pending;}catch(error){this.#fail(error);}}
 #same():void{need(!this.#failed&&!this.#ended,"FAILED_OR_ENDED");this.#original.assertCurrent();this.#host.assertCurrent();requireCurrentFootprintInverseNativeDeleteMainBaseline(this.#baseline,this.#original.beforeInventory,this.#original.historyBaseline,this.#original.bodyPlan);}
 #fail(cause:unknown):void{if(!this.#failed){this.#failed=true;this.#failure=cause;this.#host.fail(cause);}}
 public get arming():Readonly<{scriptId:string;lineNumber:number;columnNumber:number}>|null{return this.#arming;}
 public prepare():Promise<void>{need(this.#prepare===null,"PREPARE_CONSUMED");const pending=this.#prepareNow();this.#prepare=pending;void this.#handled(pending);return pending;}
 async #prepareNow():Promise<void>{try{this.#same();this.#original.assertBeforeOriginalUpload();
  z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.literal(true)})}).parse(await this.#send({phase:"inverse-native-delete-main-construction-require",method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:this.#host.sourceObjectId,functionDeclaration:CALLS.require.program,arguments:[{objectId:this.#host.constructionObjectId}],returnByValue:true}},false));
  await this.#request.arm();await this.#beginObserver.arm();await this.#historyObserver.arm();await this.#request.bindOriginalBody();this.#same();this.#original.assertBeforeOriginalUpload();need(this.#normal===16&&this.#cleanup===0,"PREUPLOAD_ROSTER");this.#prepared=true;
 }catch(error){this.#fail(error);throw error;}}
 public requireArmed(source:CurrentFootprintInverseNativeDeleteMainSource):void{this.#same();need(source===this.#source&&this.#prepared&&this.#run===null&&this.#pending===null&&this.#normal===16&&this.#cleanup===0,"ORIGINAL_ARMED_SOURCE");this.#original.assertBeforeOriginalUpload();this.#begin.requireArmed();this.#history.requireArmed();}
 public start(source:CurrentFootprintInverseNativeDeleteMainSource):void{this.#same();need(source===this.#source&&this.#prepared&&this.#run===null&&this.#original.originalUploadWritten(),"START_ORIGINAL_UPLOAD");const pending=this.#runNow();this.#run=pending;void this.#handled(pending);}
 async #runNow():Promise<CurrentFootprintInverseNativeDeleteMainHistoryCompletion>{try{const driver=await this.#request.captureDriver();const context=await this.#request.continueToContext(driver);const controller=await this.#request.continueToController(context);const actor=await this.#request.continueToActor(controller);const begin=await this.#beginObserver.begin(actor);const result=await this.#historyObserver.observe(begin);this.#same();this.#completedPacket=result;return result;}catch(error){this.#fail(error);throw error;}}
 public completion():Promise<CurrentFootprintInverseNativeDeleteMainHistoryCompletion>|null{return this.#run;}
 public async originalCompletedEffects(source:CurrentFootprintInverseNativeDeleteMainSource,packet:CurrentFootprintInverseNativeDeleteMainHistoryCompletion):Promise<CurrentProjectHistorySqlEffects>{
  this.#same();need(source===this.#source&&packet===this.#completedPacket&&this.#run!==null,"ORIGINAL_COMPLETED_HISTORY");
  const observed=await requireOriginalCurrentFootprintInverseNativeDeleteMainHistoryCompletion(packet,source,this.#plan);
  this.#same();need(packet===this.#completedPacket&&observed.origin===this.#origin&&observed.effects===this.#history.result(),"ORIGINAL_COMPLETED_HISTORY_CHANGED");
  return observed.effects;
 }

 async #send(input:unknown,cleanup:boolean):Promise<unknown>{this.#same();need(this.#pending===null,"OVERLAPPING_COMMAND");const checked=command(input);
  if(cleanup){this.#cleanup+=1;need(this.#cleanup<=19,"CLEANUP_BOUND");}else{this.#normal+=1;need(this.#normal<=133,"NORMAL_PREFIX_BOUND");}
  this.#arming=null;
  if(checked.method==="Debugger.setBreakpoint"){this.#arming=z.strictObject({scriptId:z.string(),lineNumber:z.number(),columnNumber:z.number()}).parse(checked.params.location);}
  else if(checked.phase==="inverse-native-delete-main-history-callback-arm"){this.#arming={scriptId:this.#host.scriptId,lineNumber:HISTORY_SITES.callback.lineNumber,columnNumber:HISTORY_SITES.callback.columnNumber};}
  const pending=Object.freeze({command:checked,consumed:{value:false}});this.#pending=pending;
  try{const raw=await this.#host.send(checked,cleanup);this.#same();need(pending.consumed.value,"ORIGINAL_NATIVE_COMMAND_NOT_CONSUMED");return raw;}finally{this.#arming=null;this.#pending=null;}
 }
 async #resume(identity:object,input:unknown):Promise<unknown>{const checked=command(input);this.#same();need(this.#pending===null,"OVERLAPPING_RESUME");this.#normal+=1;need(this.#normal<=133,"NORMAL_PREFIX_BOUND");const pending=Object.freeze({command:checked,consumed:{value:false}});this.#pending=pending;try{const reply=await this.#host.resume(identity,checked);this.#same();need(pending.consumed.value,"ORIGINAL_NATIVE_RESUME_NOT_CONSUMED");return reply;}finally{this.#pending=null;}}
 public pendingCommand(input:unknown):CurrentFootprintInverseNativeDeleteMainCommandInput{const pending=this.#pending;need(pending!==null&&pending.command===input,"ORIGINAL_COMMAND_IDENTITY");return pending.command;}
 public consume(source:CurrentFootprintInverseNativeDeleteMainSource,input:CurrentFootprintInverseNativeDeleteMainCommandInput,id:number):Readonly<{origin:CurrentFootprintInverseNativeDeleteMainRequestOrigin;dataStr:string;nativeSql:boolean}>{
  this.#same();const pending=this.#pending;need(source===this.#source&&pending!==null&&pending.command===input&&!pending.consumed.value&&this.#host.pendingRequestId()===id&&this.#host.busy(),"ORIGINAL_PENDING_COMMAND");
  let nativeSql=false;
  if(input.phase==="inverse-native-delete-main-begin-step"){nativeSql=this.#begin.consume(validateCurrentFootprintInverseNativeDeleteMainBeginCommand(input),id).nativeSql;}
  else if(input.phase==="inverse-native-delete-main-history-step"){const grant=this.#history.consume(validateCurrentFootprintInverseNativeDeleteMainHistoryCommand(input),id);nativeSql=grant.role.startsWith("sql-");}
  pending.consumed.value=true;return Object.freeze({origin:this.#origin,dataStr:this.#original.bodyPlan.workerUpload,nativeSql});
 }
 public acknowledge(input:CurrentFootprintInverseNativeDeleteMainCommandInput,id:number,window:CurrentFootprintInverseNativeDeleteMainHistoryNativeWindow|null):void{if(input.phase==="inverse-native-delete-main-history-step"){this.#history.acknowledge(validateCurrentFootprintInverseNativeDeleteMainHistoryCommand(input),id,window);}}
 public async endAfterOriginalExit():Promise<void>{this.#original.assertOriginalExit();this.#ended=true;for(const pending of [this.#prepare,this.#run]){if(pending!==null){try{await pending;}catch{
 // Retain the first original failure; ending cannot grant a retry.
 }}}if(this.#failed){throw this.#failure;}}
}
Object.freeze(CurrentFootprintInverseNativeDeleteMainController.prototype);
Object.freeze(CurrentFootprintInverseNativeDeleteMainController);
