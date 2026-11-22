/** Natural branch/history/body continuation of one original DELETE. Backend
 * retains the production instance; equal source labels or data grant no I/O. */
/* oxlint-disable import/max-dependencies -- Each fixed read grammar, original Source and independent data comparison remains separate. */
import {z}from"zod";
import {createHash}from"node:crypto";
import {freezeDeep}from"./sqlite-inventory-core.ts";
import {captureCurrentPcbStringClockReply}from"./current-pcb-string-clock-reply.ts";
import type {CurrentProjectHistorySqlEffects}from"./current-project-history-sql-effects.ts";
import type {CurrentFootprintSavedFlowCacheData}from"./current-footprint-saved-flow-cache-data.ts";
import type {CurrentFootprintInverseMainHistoryBaseline}from"./current-footprint-inverse-main-history-baseline.ts";
import type {CurrentFootprintInverseNativeDeleteMainSource,CurrentFootprintInverseNativeDeleteMainSourceOriginal}from"./current-footprint-inverse-native-delete-main-source.ts";
import type {CurrentFootprintInverseNativeDeleteMainEvent}from"./current-footprint-inverse-native-delete-main-origin.ts";
import type {CurrentFootprintInverseNativeDeleteMainHistoryCompletion}from"./current-footprint-inverse-native-delete-main-history-observer.ts";
import {CurrentFootprintInverseNativeDeleteMainReadCustody}from"./current-footprint-inverse-native-delete-main-read-custody.ts";
import type {CurrentFootprintInverseNativeDeleteMainReadExpectation,CurrentFootprintInverseNativeDeleteMainReadHost,CurrentFootprintInverseNativeDeleteMainReadValue}from"./current-footprint-inverse-native-delete-main-read-custody.ts";
import {CurrentFootprintInverseNativeDeleteMainReadCollector}from"./current-footprint-inverse-native-delete-main-read-collector.ts";
import type {CurrentFootprintInverseNativeDeleteMainReadCommand,CurrentFootprintInverseNativeDeleteMainReadKind as Kind}from"./current-footprint-inverse-native-delete-main-read-protocol.ts";
import {compareCurrentFootprintInverseNativeDeleteMainTailBranch,compareCurrentFootprintInverseNativeDeleteMainTailRows,deriveCurrentFootprintInverseNativeDeleteMainTailCache,deriveCurrentFootprintInverseNativeDeleteMainTailPreflight}from"./current-footprint-inverse-native-delete-main-tail-data.ts";
import type {CurrentFootprintInverseNativeDeleteMainTailBranch,CurrentFootprintInverseNativeDeleteMainTailPreflight}from"./current-footprint-inverse-native-delete-main-tail-data.ts";
import type {CurrentSelectedFileMainRequestObservation}from"./current-selected-file-main-request-reader.ts";

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_MAIN_TAIL_REQUESTS=freezeDeep({
 returned:{branch:{normal:8,cleanup:2},history:{normal:11,cleanup:2},body:{normal:8,cleanup:2}},
 drivers:{calls:3,capture:15,resume:3},selectedReadonly:{maximumCalls:9,commandsPerCall:3},
 normal:72,cleanup:6,total:78,preUpload:1,nativeWireNormal:30,nativeWireCleanup:6,
 wholeInverseReserved:false,nativeReadWireMounted:false,runtimeSegmentCompletenessVerified:false,
});
/** Core must supply this from its original renderer slot and include its
 * assertCurrent in Source.current at actual stdin cutoff. No issuer exists in
 * this source leaf; its absence refuses before the first new arm. */
export interface CurrentFootprintInverseNativeDeleteMainTailPrerequisite{
 readonly profile:"private.current-footprint-inverse-native-delete-main-tail-prerequisite.v1";
 readonly assertBeforeOriginalUpload:()=>void;readonly assertCurrent:()=>void;
}
function need(value:boolean,code:string):asserts value{if(!value){throw new Error(`INVERSE_NATIVE_DELETE_MAIN_TAIL_${code}`);}}
function isPrerequisite(raw:unknown):raw is CurrentFootprintInverseNativeDeleteMainTailPrerequisite{
 if(raw===null||typeof raw!=="object"||Object.getPrototypeOf(raw)!==Object.prototype||!Object.isFrozen(raw)){return false;}
 const descriptors=Object.getOwnPropertyDescriptors(raw);const before=descriptors["assertBeforeOriginalUpload"],current=descriptors["assertCurrent"],profile=descriptors["profile"];
 return Object.keys(descriptors).length===3&&profile?.value==="private.current-footprint-inverse-native-delete-main-tail-prerequisite.v1"&&before!==undefined&&current!==undefined&&typeof before.value==="function"&&typeof current.value==="function"&&before.writable===false&&before.configurable===false&&current.writable===false&&current.configurable===false;
}
export function requireCurrentFootprintInverseNativeDeleteMainTailPrerequisite(original:CurrentFootprintInverseNativeDeleteMainSourceOriginal):CurrentFootprintInverseNativeDeleteMainTailPrerequisite{
 const field=Object.getOwnPropertyDescriptor(original,"naturalTail");
 need(field!==undefined&&Object.hasOwn(field,"value")&&field.writable===false&&field.configurable===false,"ORIGINAL_RENDERER_PREREQUISITE");
 const raw:unknown=field.value;need(isPrerequisite(raw),"FROZEN_PREREQUISITE");
 // Backend invokes this only on the original Core Source registry result.
 return raw;
}
export interface CurrentFootprintInverseNativeDeleteMainTailResumeReceipt {
 readonly identity:object;
 readonly command:CurrentFootprintInverseNativeDeleteMainReadCommand;
 readonly reply:unknown;
 readonly event:CurrentFootprintInverseNativeDeleteMainEvent;
}
export interface CurrentFootprintInverseNativeDeleteMainTailHost extends Omit<CurrentFootprintInverseNativeDeleteMainReadHost,"expected"|"send"|"resume">{
 readonly nextEvent:()=>Promise<CurrentFootprintInverseNativeDeleteMainEvent>;
 readonly observeRequest:()=>Promise<CurrentSelectedFileMainRequestObservation>;
 readonly requireRequest:(value:CurrentSelectedFileMainRequestObservation)=>void;
 readonly originalRequestObjectId:(value:CurrentSelectedFileMainRequestObservation)=>string;
 readonly send:(command:CurrentFootprintInverseNativeDeleteMainReadCommand,cleanup:boolean)=>Promise<unknown>;
 /** Return the actual event already consumed for this exact delivered pause. */
 readonly resume:(identity:object,command:CurrentFootprintInverseNativeDeleteMainReadCommand)=>Promise<CurrentFootprintInverseNativeDeleteMainTailResumeReceipt>;
 readonly effects:(packet:CurrentFootprintInverseNativeDeleteMainHistoryCompletion)=>Promise<CurrentProjectHistorySqlEffects>;
}
export interface CurrentFootprintInverseNativeDeleteMainTailObservation{
 readonly schema:"private.current-footprint-inverse-native-delete-main-tail-observation.v1";
 readonly historyUuid:string;readonly branchSha256:string;readonly encryptedBodySha256:string;readonly headIndexSha256:string;
 readonly originalNaturalMainResponsesCompleted:true;readonly suppliedObservationsOnly:true;
 readonly workerFetchCompleted:false;readonly workerParserCompleted:false;readonly originalDeletePromiseJoined:false;readonly persistenceVerified:false;
}
export interface CurrentFootprintInverseNativeDeleteMainTailProjection{
 readonly branch:CurrentFootprintInverseNativeDeleteMainTailBranch;
 readonly rows:CurrentFootprintInverseMainHistoryBaseline;readonly cache:CurrentFootprintSavedFlowCacheData;
}
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const callFrame=z.looseObject({callFrameId:handle});
const pausedParams=z.looseObject({hitBreakpoints:z.tuple([handle]),callFrames:z.array(callFrame).min(1).max(64)});
const paused=z.strictObject({method:z.literal("Debugger.paused"),params:pausedParams});
const resumed=z.strictObject({method:z.literal("Debugger.resumed"),params:z.strictObject({})});
const bodyValue=z.strictObject({projectUuid:z.string(),historyUuid:z.string(),cipherHexParts:z.array(z.string().regex(/^(?:[a-f0-9]{2})+$/u)).min(1).max(8)});
export class CurrentFootprintInverseNativeDeleteMainTailController{
 readonly #source:CurrentFootprintInverseNativeDeleteMainSource;readonly #original:CurrentFootprintInverseNativeDeleteMainSourceOriginal;readonly #host:CurrentFootprintInverseNativeDeleteMainTailHost;
 readonly #prerequisite:CurrentFootprintInverseNativeDeleteMainTailPrerequisite;readonly #preflight:CurrentFootprintInverseNativeDeleteMainTailPreflight;
 readonly #custodies=new Map<Kind,CurrentFootprintInverseNativeDeleteMainReadCustody>();readonly #collectors=new Map<Kind,CurrentFootprintInverseNativeDeleteMainReadCollector>();readonly #expected=new Map<Kind,CurrentFootprintInverseNativeDeleteMainReadExpectation>();
 #prepare:Promise<void>|null=null;#run:Promise<CurrentFootprintInverseNativeDeleteMainTailObservation>|null=null;
 #effects:CurrentProjectHistorySqlEffects|null=null;#branch:CurrentFootprintInverseNativeDeleteMainTailBranch|null=null;#rows:CurrentFootprintInverseMainHistoryBaseline|null=null;#cache:CurrentFootprintSavedFlowCacheData|null=null;
 #projection:CurrentFootprintInverseNativeDeleteMainTailProjection|null=null;
 readonly #branchResult=Promise.withResolvers<CurrentFootprintInverseNativeDeleteMainTailBranch>();
 readonly #historyResult=Promise.withResolvers<CurrentFootprintInverseNativeDeleteMainTailProjection>();
 #failed=false;#failure:unknown;#ended=false;#prepared=false;#normal=0;#cleanup=0;
 public constructor(source:CurrentFootprintInverseNativeDeleteMainSource,original:CurrentFootprintInverseNativeDeleteMainSourceOriginal,host:CurrentFootprintInverseNativeDeleteMainTailHost){
  this.#source=source;this.#original=original;this.#host=Object.freeze({...host});original.assertBeforeOriginalUpload();
  this.#prerequisite=requireCurrentFootprintInverseNativeDeleteMainTailPrerequisite(original);this.#prerequisite.assertBeforeOriginalUpload();
  this.#preflight=deriveCurrentFootprintInverseNativeDeleteMainTailPreflight(original);
  void this.#handledStage(this.#branchResult.promise);void this.#handledStage(this.#historyResult.promise);
  for(const kind of["branch","history","body"]as const){
   const same=():void=>{this.#same();};
   const custody=new CurrentFootprintInverseNativeDeleteMainReadCustody(kind,{...host,assertCurrent:same,expected:():CurrentFootprintInverseNativeDeleteMainReadExpectation=>this.#expect(kind),
    send:(command,cleanup):Promise<unknown>=>this.#request(command,cleanup,null),resume:(identity,command):Promise<unknown>=>this.#request(command,false,identity),fail:(cause):void=>{this.#fail(cause);}});
   this.#custodies.set(kind,custody);this.#collectors.set(kind,new CurrentFootprintInverseNativeDeleteMainReadCollector(kind,custody,host.sqlCaptureObjectId));
  }
  Object.freeze(this);
 }
 #same():void{
  need(!this.#failed&&!this.#ended,"FAILED_OR_ENDED");this.#original.assertCurrent();this.#host.assertCurrent();
  need(requireCurrentFootprintInverseNativeDeleteMainTailPrerequisite(this.#original)===this.#prerequisite,"ORIGINAL_PREREQUISITE");this.#prerequisite.assertCurrent();
 }
 #fail(cause:unknown):void{if(!this.#failed){this.#failed=true;this.#failure=cause;this.#branchResult.reject(cause);this.#historyResult.reject(cause);try{this.#host.fail(cause);}catch{
  // Failure handoff cannot replace the retained original cause or strand its join.
  }}}
 async #handledStage(pending:Promise<unknown>):Promise<void>{try{await pending;}catch(error){if(!this.#ended){try{this.#fail(error);}catch{
  // A throwing host handoff cannot replace the original stage rejection.
 }}
  // The retained original run/exit and every caller keep the same rejection.
 }}
 #expect(kind:Kind):CurrentFootprintInverseNativeDeleteMainReadExpectation{
  this.#same();need(this.#effects!==null,"COMPLETED_ORIGINAL_HISTORY");const prior=this.#expected.get(kind);if(prior!==undefined){return prior;}
  const value=Object.freeze({projectUuid:this.#original.projectUuid,branchUuid:this.#original.branchUuid,historyUuid:this.#effects.historyUuid,compare:(role:Kind,input:CurrentFootprintInverseNativeDeleteMainReadValue):void=>{need(role===kind,"ORIGINAL_READ_KIND");this.#compare(kind,input);}});
  this.#expected.set(kind,value);return value;
 }
 #compare(kind:Kind,value:CurrentFootprintInverseNativeDeleteMainReadValue):void{
  this.#same();const effects=this.#effects;need(effects!==null,"ORIGINAL_EFFECTS");
  if(kind==="branch"){need("body"in value&&this.#branch===null,"ONE_BRANCH");this.#branch=compareCurrentFootprintInverseNativeDeleteMainTailBranch(this.#original,this.#preflight,effects,value.body);}
  else if(kind==="history"){need(this.#branch!==null&&this.#rows===null,"ONE_HISTORY");this.#rows=compareCurrentFootprintInverseNativeDeleteMainTailRows(this.#original,this.#preflight,effects,this.#branch,value);this.#cache=deriveCurrentFootprintInverseNativeDeleteMainTailCache(this.#original,this.#preflight,effects,this.#branch,value);}
  else{const body=bodyValue.parse(value);need(body.projectUuid===this.#original.projectUuid&&body.historyUuid===effects.historyUuid&&Buffer.from(body.cipherHexParts.join(""),"hex").toString("base64")===effects.dataBase64,"ORIGINAL_ENCRYPTED_RESPONSE");}
 }
 #collector(kind:Kind):CurrentFootprintInverseNativeDeleteMainReadCollector{const value=this.#collectors.get(kind);need(value!==undefined,"ORIGINAL_COLLECTOR");return value;}
 #custody(kind:Kind):CurrentFootprintInverseNativeDeleteMainReadCustody{const value=this.#custodies.get(kind);need(value!==undefined,"ORIGINAL_CUSTODY");return value;}
 async #request(command:CurrentFootprintInverseNativeDeleteMainReadCommand,cleanup:boolean,identity:object|null):Promise<unknown>{
  this.#same();if(cleanup){this.#cleanup+=1;need(this.#cleanup<=6,"CLEANUP_BOUND");}else{this.#normal+=1;need(this.#normal<=30,"NATIVE_WIRE_BOUND");}
  if(identity===null){const raw=await this.#host.send(command,cleanup);this.#same();return raw;}
  const receipt=await this.#host.resume(identity,command);this.#same();
  need(receipt.identity===identity&&receipt.command===command,"ORIGINAL_RESUME_RECEIPT");
  resumed.parse(captureCurrentPcbStringClockReply(receipt.event).value);
  return receipt.reply;
 }
 public consume(source:CurrentFootprintInverseNativeDeleteMainSource,command:CurrentFootprintInverseNativeDeleteMainReadCommand,id:number):void{
  this.#same();need(source===this.#source,"ORIGINAL_SOURCE");this.#custody(command.kind).consume(command,id);
 }
 async #handled(pending:Promise<unknown>):Promise<void>{try{await pending;}catch(error){this.#fail(error);}}
 public prepare():Promise<void>{need(this.#prepare===null,"PREPARE_CONSUMED");const pending=this.#prepareNow();this.#prepare=pending;void this.#handled(pending);return pending;}
 async #prepareNow():Promise<void>{try{this.#same();this.#original.assertBeforeOriginalUpload();this.#prerequisite.assertBeforeOriginalUpload();await this.#collector("branch").arm(this.#host.scriptId);this.#same();this.#prerequisite.assertBeforeOriginalUpload();this.#prepared=true;}catch(error){this.#fail(error);throw error;}}
 public requireArmed(source:CurrentFootprintInverseNativeDeleteMainSource):void{this.#same();need(source===this.#source&&this.#prepared&&this.#run===null&&this.#normal===1&&this.#cleanup===0,"ONE_PREUPLOAD_ARM");this.#original.assertBeforeOriginalUpload();this.#prerequisite.assertBeforeOriginalUpload();}
 public start(source:CurrentFootprintInverseNativeDeleteMainSource,prefix:Promise<CurrentFootprintInverseNativeDeleteMainHistoryCompletion>):void{
  this.#same();need(source===this.#source&&this.#prepared&&this.#run===null&&this.#original.originalUploadWritten(),"ORIGINAL_UPLOAD");const pending=this.#runNow(prefix);this.#run=pending;void this.#handled(pending);
 }
 async #next(kind:Kind):Promise<string>{
  const custody=this.#custody(kind);
  for(let i=0;i<2;i+=1){
   const event=paused.parse(await this.#host.nextEvent());this.#same();
   if(event.params.hitBreakpoints[0]!==this.#host.persistentDriverBreakpointId){const frame=event.params.callFrames[0];need(frame!==undefined,"RETURN_FRAME");return frame.callFrameId;}
   const packet=await this.#host.observeRequest();this.#same();this.#host.requireRequest(packet);
   need(custody.wantsReadonlyRequest(packet),"ONE_NATURAL_READ_ROUTE");custody.retainReadonlyRequest(packet,this.#host.originalRequestObjectId(packet));
   await custody.request({kind,phase:"inverse-native-delete-main-read-driver-step",method:"Debugger.resume",params:{}},false);this.#same();
  }
  throw new Error("INVERSE_NATIVE_DELETE_MAIN_TAIL_READ_EVENT_BOUND");
 }
 async #runNow(prefix:Promise<CurrentFootprintInverseNativeDeleteMainHistoryCompletion>):Promise<CurrentFootprintInverseNativeDeleteMainTailObservation>{
  try{
   const packet=await prefix;this.#same();this.#effects=await this.#host.effects(packet);this.#same();
   for(const[kind,next]of[["branch","history"],["history","body"],["body",null]]as const){
    const frame=await this.#next(kind);this.#same();await this.#collector(kind).observeHeld(frame);this.#same();
    if(next!==null){await this.#collector(next).arm(this.#host.scriptId);this.#same();}
    await this.#collector(kind).finishHeld();this.#same();
    if(kind==="branch"){need(this.#branch!==null,"ORIGINAL_BRANCH_RESUMED");this.#branchResult.resolve(this.#branch);}
    if(kind==="history"){need(this.#branch!==null&&this.#rows!==null&&this.#cache!==null,"ORIGINAL_HISTORY_RESUMED");this.#projection=Object.freeze({branch:this.#branch,rows:this.#rows,cache:this.#cache});this.#historyResult.resolve(this.#projection);}
   }
   need(this.#normal===30&&this.#cleanup===6&&this.#branch!==null&&this.#rows!==null&&this.#cache!==null,"COMPLETE_READ_ROSTER");
   return freezeDeep({schema:"private.current-footprint-inverse-native-delete-main-tail-observation.v1",historyUuid:this.#effects.historyUuid,branchSha256:this.#branch.sha256,encryptedBodySha256:createHash("sha256").update(Buffer.from(this.#effects.dataBase64,"base64")).digest("hex"),headIndexSha256:this.#cache.headIndex.sha256,originalNaturalMainResponsesCompleted:true,suppliedObservationsOnly:true,workerFetchCompleted:false,workerParserCompleted:false,originalDeletePromiseJoined:false,persistenceVerified:false});
  }catch(error){this.#fail(error);throw error;}
 }
 public completion():Promise<CurrentFootprintInverseNativeDeleteMainTailObservation>|null{return this.#run;}
 /** These are the same retained stage Promises. Waiting for the full binary
  * tail here would block the worker before it can issue that body request. */
 public originalBranch():Promise<CurrentFootprintInverseNativeDeleteMainTailBranch>{this.#same();need(this.#run!==null,"ORIGINAL_BRANCH_RUN");return this.#branchResult.promise;}
 public originalHistoryProjection():Promise<CurrentFootprintInverseNativeDeleteMainTailProjection>{this.#same();need(this.#run!==null,"ORIGINAL_HISTORY_RUN");return this.#historyResult.promise;}
 /** Matching projected data alone cannot enter this getter. The same actual
  * retained completion Promise and exact packet must have joined first. */
 public async originalProjection(packet:CurrentFootprintInverseNativeDeleteMainTailObservation):Promise<CurrentFootprintInverseNativeDeleteMainTailProjection>{
  this.#same();const pending=this.#run;need(pending!==null,"ORIGINAL_COMPLETION");const original=await pending;this.#same();
  need(original===packet&&this.#branch!==null&&this.#rows!==null&&this.#cache!==null,"ORIGINAL_COMPLETED_PROJECTION");
  this.#projection??=Object.freeze({branch:this.#branch,rows:this.#rows,cache:this.#cache});return this.#projection;
 }
 public preflight():CurrentFootprintInverseNativeDeleteMainTailPreflight{this.#same();return this.#preflight;}
 public async endAfterOriginalExit():Promise<void>{
  this.#original.assertOriginalExit();this.#ended=true;
  const ended=new Error("INVERSE_NATIVE_DELETE_MAIN_TAIL_ORIGINAL_EXIT");this.#branchResult.reject(ended);this.#historyResult.reject(ended);
  for(const pending of[this.#prepare,this.#run,this.#branchResult.promise,this.#historyResult.promise]){if(pending!==null){try{await pending;}catch(error){if(!this.#failed&&error!==ended){this.#failed=true;this.#failure=error;}}}}
  this.#original.assertOriginalExit();if(this.#failed){throw this.#failure;}
 }
}
Object.freeze(CurrentFootprintInverseNativeDeleteMainTailController.prototype);
Object.freeze(CurrentFootprintInverseNativeDeleteMainTailController);
