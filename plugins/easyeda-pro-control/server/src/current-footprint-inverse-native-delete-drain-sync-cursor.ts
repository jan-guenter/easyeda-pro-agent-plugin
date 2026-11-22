/** This original upload-finally sync(undefined), independently from startup's
 * nine holds. The branch/history stage Promises join before their own worker
 * return resumes; the later binary tail joins after the worker's real fetch. */
import{z}from"zod";
import{captureCurrentPcbStringClockReply as capture}from"./current-pcb-string-clock-reply.ts";
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_FLAGS as FLAGS,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_SYNC_ROLES as ROLES,currentFootprintInverseNativeDeleteDrainCall as call,validateCurrentFootprintInverseNativeDeleteDrainCommand as validate}from"./current-footprint-inverse-native-delete-drain-protocol.ts";
import type{CurrentFootprintInverseNativeDeleteDrainCommand as Command}from"./current-footprint-inverse-native-delete-drain-protocol.ts";
import{CURRENT_PCB_VIA_POST_HISTORY_SYNC_CALLER as CALLER,CURRENT_PCB_VIA_POST_HISTORY_SYNC_MODULE as MODULE}from"./current-pcb-via-post-history-sync-source.ts";
import{currentProjectSaveProducerCachePromiseHandle as promiseHandle,decodeCurrentProjectSaveProducerCachePromise as promiseState}from"./current-project-save-producer-cache-replies.ts";
import{decodeCurrentFootprintCopyClockRpcV2Array as array,decodeCurrentFootprintCopyClockRpcV2ArrayCapture as arrayCapture,currentFootprintCopyClockRpcV2ArrayObject as objectAt}from"./current-footprint-copy-clock-rpc-v2-protocol.ts";
import{currentFootprintInverseNativeDeleteMainTailApiRows as apiRows}from"./current-footprint-inverse-native-delete-main-tail-data.ts";
import type{CurrentFootprintInverseNativeDeleteMainTailBranch as Branch}from"./current-footprint-inverse-native-delete-main-tail-data.ts";
import type{CurrentFootprintInverseNativeDeleteMainTailProjection as Projection}from"./current-footprint-inverse-native-delete-main-tail-controller.ts";

type Role=typeof ROLES[number];type Arg=Readonly<{objectId:string}>|Readonly<{value:string}>;
export interface CurrentFootprintInverseNativeDeleteDrainSyncHeld{readonly packet:object;readonly role:Role;readonly joinedId:string;readonly callFrameId:string;readonly callerFrameId:string|null;readonly returnPromiseId:string|null}
export interface CurrentFootprintInverseNativeDeleteDrainSyncBindings{
 readonly scriptId:string;readonly initial:string;readonly segments:string;readonly initialIndexBody:string;
 readonly reflection:string;readonly recipe:string;readonly dependencies:string;
 readonly assertCurrent:()=>Promise<void>;readonly requireHeld:(packet:object)=>CurrentFootprintInverseNativeDeleteDrainSyncHeld;
 readonly requireOriginalDrainFrontier:()=>void;readonly originalDrainCapture:()=>string;
 readonly originalBranch:()=>Promise<Branch>;readonly originalHistory:()=>Promise<Projection>;readonly requireMainCompleted:()=>Promise<void>;
 readonly request:(command:Command)=>Promise<unknown>;readonly qualifyHelper:(command:Command)=>Promise<void>;
 readonly resume:(held:CurrentFootprintInverseNativeDeleteDrainSyncHeld,command:Command)=>Promise<void>;
 readonly complete:()=>Promise<void>;readonly fail:(cause:unknown)=>void;
}
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_SYNC_REQUESTS=Object.freeze({frames:2,proofs:7,fullProperties:1,retainedReturn:1,resumes:7,promiseMetadata:4,normal:22,helpers:10,total:32,heldFrames:7,settlementPasses:2});
const yes=z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.literal(true)})});
function need(value:boolean,code:string):asserts value{if(!value){throw new Error(`INVERSE_NATIVE_DELETE_DRAIN_SYNC_${code}`);}}
export class CurrentFootprintInverseNativeDeleteDrainSyncCursor{
 readonly #b:CurrentFootprintInverseNativeDeleteDrainSyncBindings;readonly #attempts=new WeakSet<object>();
 #capture:string|null=null;#full:string|null=null;#last:string|null=null;#index:string|null=null;#task:string|null=null;#outer:string|null=null;#projection:Projection|null=null;
 #normal=0;#helpers=0;#step=0;#resumes=0;#passes=0;#busy=false;#failed=false;#failure:unknown;#completed=false;
 public constructor(bindings:CurrentFootprintInverseNativeDeleteDrainSyncBindings){this.#b=Object.freeze({...bindings});Object.freeze(this);}
 async #current():Promise<void>{if(this.#failed){throw this.#failure;}await this.#b.assertCurrent();if(this.#failed){throw this.#failure;}}
 #fail(cause:unknown):void{if(!this.#failed){this.#failed=true;this.#failure=cause;try{this.#b.fail(cause);}catch{
 // Failure handoff cannot replace the retained original cause or strand its join.
 }}}
 async #send(input:Command):Promise<unknown>{await this.#current();const c=validate(input);need((this.#normal+=1)<=22,"NORMAL_BOUND");const value=capture(await this.#b.request(c)).value;await this.#current();if(c.method==="Runtime.callFunctionOn"||c.method==="Debugger.evaluateOnCallFrame"){need((this.#helpers+=1)<=10,"HELPER_BOUND");await this.#b.qualifyHelper(c);await this.#current();}return value;}
 #refs():readonly Arg[]{return[this.#b.reflection,this.#b.recipe,this.#b.dependencies].map(objectId=>({objectId}));}
 #call(role:string,frame:string,args:readonly Arg[]):Promise<unknown>{return this.#send(call("sync",role,frame,[{objectId:frame},...args,...this.#refs()]));}
 #properties(role:"full"|"settled",objectId:string,slot=0,pass=0):Promise<unknown>{return this.#send({phase:"inverse-native-delete-drain-properties",role,slot,pass,method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});}
 async #entry(held:CurrentFootprintInverseNativeDeleteDrainSyncHeld):Promise<void>{
  need(held.callerFrameId!==null,"ORIGINAL_FINALLY_CALLER");this.#b.requireOriginalDrainFrontier();
  const frameFlags={objectGroup:FLAGS.objectGroup,silent:true as const,generatePreview:false as const,throwOnSideEffect:true as const,includeCommandLineAPI:false as const,returnByValue:false as const};
  const module=arrayCapture(await this.#send({phase:"inverse-native-delete-drain-sync-frame",role:"module",method:"Debugger.evaluateOnCallFrame",params:{...frameFlags,callFrameId:held.callFrameId,expression:MODULE}}),10);
  const caller=arrayCapture(await this.#send({phase:"inverse-native-delete-drain-sync-frame",role:"caller",method:"Debugger.evaluateOnCallFrame",params:{...frameFlags,callFrameId:held.callerFrameId,expression:CALLER.expression}}),1);
  this.#capture=arrayCapture(await this.#call("capture",held.joinedId,[{objectId:this.#b.originalDrainCapture()},{objectId:this.#b.initial},{objectId:module},{objectId:caller},{value:this.#b.initialIndexBody},{objectId:this.#b.segments}]),7);
 }
 public async continue(packet:object):Promise<void>{need(!this.#busy&&!this.#failed&&!this.#completed&&!this.#attempts.has(packet),"ORIGINAL_ATTEMPT");this.#attempts.add(packet);this.#busy=true;
  try{await this.#current();const held=this.#b.requireHeld(packet);need(held.packet===packet&&held.role===ROLES[this.#step],"ORIGINAL_ROLE");
   if(this.#step===0){await this.#entry(held);}else{
    const original=this.#capture;need(original!==null,"ORIGINAL_CAPTURE");
    if(this.#step===1){this.#full=held.joinedId;const fields=array(await this.#properties("full",held.joinedId),5),task=fields.get("4");need(task?.type==="object"&&task.subtype==="promise"&&task.className==="Promise"&&task.description==="Promise","ORIGINAL_TASK");this.#task=objectAt(fields,4);yes.parse(await this.#call("full",held.joinedId,[{objectId:original}]));}
    else{const full=this.#full;need(full!==null,"ORIGINAL_FULL");const args:Arg[]=[{objectId:original},{objectId:full}];
     if(this.#step===2){const branch=await this.#b.originalBranch();await this.#current();yes.parse(await this.#call("branch",held.joinedId,[...args,{value:branch.body}]));}
     else if(this.#step===3){const projection=await this.#b.originalHistory();await this.#current();this.#projection=projection;const expected=JSON.stringify(apiRows(projection.rows));yes.parse(await this.#call("history",held.joinedId,[...args,{value:expected}]));this.#last=held.joinedId;}
     else if(this.#step===4){need(this.#last!==null&&this.#projection!==null,"ORIGINAL_HISTORY");yes.parse(await this.#call("merged",held.joinedId,[...args,{objectId:this.#last}]));}
     else if(this.#step===5){need(this.#projection!==null,"ORIGINAL_PROJECTION");await this.#b.requireMainCompleted();await this.#current();this.#index=arrayCapture(await this.#call("finalizing",held.joinedId,[...args,{value:this.#projection.cache.headIndex.body}]),this.#projection.rows.rows.length);}
     else{need(this.#step===6&&this.#index!==null&&held.returnPromiseId!==null,"ORIGINAL_RETURN");yes.parse(await this.#call("returned",held.joinedId,[...args,{objectId:this.#index}]));const returned=z.strictObject({result:z.unknown()}).parse(await this.#send(call("retain","promise",held.returnPromiseId,[],9)));this.#outer=promiseHandle(returned.result);}
    }
   }
   await this.#current();need(this.#b.requireHeld(packet)===held&&(this.#normal+=1)<=22,"ORIGINAL_RESUME");await this.#b.resume(held,validate({phase:"inverse-native-delete-drain-resume",role:held.role,slot:0,method:"Debugger.resume",params:{}}));await this.#current();this.#step+=1;this.#resumes+=1;if(this.#step===7){await this.#settle();}
  }catch(error){this.#fail(error);throw error;}finally{this.#busy=false;}}
 async #settle():Promise<void>{need(this.#step===7&&this.#task!==null&&this.#outer!==null&&this.#passes<CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_SYNC_REQUESTS.settlementPasses,"SETTLEMENT_FRONTIER");this.#passes+=1;let fulfilled=true;
  for(const[slot,objectId]of[[9,this.#task],[10,this.#outer]]as const){const metadata=await this.#properties("settled",objectId,slot,this.#passes);fulfilled=promiseState(metadata)==="fulfilled"&&fulfilled;}
  if(fulfilled){await this.#b.complete();await this.#current();this.#completed=true;}
  need(this.#completed || this.#passes < CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_SYNC_REQUESTS.settlementPasses, "SETTLEMENT_EXHAUSTED");
 }
 public async settle():Promise<void>{need(!this.#busy&&!this.#failed&&!this.#completed,"SETTLE_ONCE");this.#busy=true;try{await this.#settle();}catch(error){this.#fail(error);throw error;}finally{this.#busy=false;}}
 public progress():Readonly<{replayResumed:boolean;completed:boolean;canSettle:boolean;acknowledgedResumes:number;failed:boolean}>{return Object.freeze({replayResumed:!this.#failed&&this.#resumes>=5,completed:this.#completed,canSettle:!this.#busy&&!this.#failed&&!this.#completed&&this.#step===7&&this.#passes<CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_SYNC_REQUESTS.settlementPasses,acknowledgedResumes:this.#resumes,failed:this.#failed});}
 public requireCompleted():void{need(this.#completed&&!this.#failed,"COMPLETE");}
}
Object.freeze(CurrentFootprintInverseNativeDeleteDrainSyncCursor.prototype);Object.freeze(CurrentFootprintInverseNativeDeleteDrainSyncCursor);
