/** Actual original frame/caller/Cache/Promise custody for the new drain.
 * This reader never resumes and cannot enroll an owner or substitute a
 * startup/public/forward event. The enclosing Core registry owns admission. */
/* oxlint-disable import/max-dependencies -- Exact producer/caller source, private wire and original Promise/tuple readers form one fixed observer. */
import{z}from"zod";
import type{DiagnosticEvent}from"./current-pcb-diagnostic-protocol.ts";
import{captureCurrentPcbStringClockReply as capture}from"./current-pcb-string-clock-reply.ts";
import{CURRENT_PROJECT_SAVE_PRODUCER_SITES as SITES}from"./current-project-save-producer-source.ts";
import{CURRENT_PROJECT_SAVE_PRODUCER_CACHE_CALLERS as CALLERS,currentProjectSaveProducerCacheCallerFrame as callerFrame}from"./current-project-save-producer-cache-source.ts";
import{CURRENT_PCB_VIA_POST_HISTORY_SYNC_CALLER as SYNC_CALLER}from"./current-pcb-via-post-history-sync-source.ts";
import{decodeCurrentFootprintCopyClockRpcV2Array as array,decodeCurrentFootprintCopyClockRpcV2ArrayCapture as arrayCapture}from"./current-footprint-copy-clock-rpc-v2-protocol.ts";
import{currentProjectSaveProducerCachePromiseHandle as promiseHandle,decodeCurrentProjectSaveProducerCachePromise as promiseState}from"./current-project-save-producer-cache-replies.ts";
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_FLAGS as FLAGS,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_SOURCE_ROLES as SOURCE_ROLES,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_SYNC_ROLES as SYNC_ROLES,currentFootprintInverseNativeDeleteDrainCall as call,validateCurrentFootprintInverseNativeDeleteDrainCommand as validate}from"./current-footprint-inverse-native-delete-drain-protocol.ts";
import type{CurrentFootprintInverseNativeDeleteDrainCommand as Command,CurrentFootprintInverseNativeDeleteDrainSourceRole as Role}from"./current-footprint-inverse-native-delete-drain-protocol.ts";
import type{CurrentFootprintInverseNativeDeleteDrainHeld as SourceHeld}from"./current-footprint-inverse-native-delete-drain-cursor.ts";
import type{CurrentFootprintInverseNativeDeleteDrainSyncHeld as SyncHeld}from"./current-footprint-inverse-native-delete-drain-sync-cursor.ts";

const sourceRoles=[...SOURCE_ROLES,"headEntry","headPromise","headSuccess"]as const;
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),location=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const frame=z.looseObject({callFrameId:handle,location,functionLocation:location,returnValue:z.unknown().optional()});
const paused=z.looseObject({reason:z.literal("other"),hitBreakpoints:z.tuple([handle]),callFrames:z.array(frame).min(1).max(32)});
export interface CurrentFootprintInverseNativeDeleteDrainObserverBindings{
 readonly scriptId:string;readonly sessionId:string;readonly project:string;readonly intrinsics:string;
 readonly reflection:string;readonly recipe:string;readonly dependencies:string;
 readonly current:()=>void;readonly originalPoint:(role:Role)=>string;readonly originalDrainCapture:()=>string;
 readonly assertOriginalEvent:(event:DiagnosticEvent)=>void;readonly request:(command:Command)=>Promise<unknown>;readonly qualifyHelper:(command:Command)=>Promise<void>;
}
interface Observed{readonly packet:object;readonly event:DiagnosticEvent;readonly role:Role;readonly mode:"source"|"sync"}
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_OBSERVER_REQUESTS=Object.freeze({heldFrames:27,frameCommands:81,cacheEntryCommands:9,cachePromiseCommands:6,normal:96,helpers:63,total:159,resumes:0});
function need(value:boolean,code:string):asserts value{if(!value){throw new Error(`INVERSE_NATIVE_DELETE_DRAIN_OBSERVER_${code}`);}}
export class CurrentFootprintInverseNativeDeleteDrainObserver{
 readonly #b:CurrentFootprintInverseNativeDeleteDrainObserverBindings;readonly #used=new WeakSet<DiagnosticEvent>();
 readonly #source=new WeakMap<object,SourceHeld>();readonly #sync=new WeakMap<object,SyncHeld>();
 #active:Observed|null=null;#busy=false;#failed=false;#normal=0;#helpers=0;#events=0;
 public constructor(bindings:CurrentFootprintInverseNativeDeleteDrainObserverBindings){this.#b=Object.freeze({...bindings});Object.freeze(this);}
 #current():void{need(!this.#failed,"FAILED");this.#b.current();}
 async #send(input:Command):Promise<unknown>{this.#current();const c=validate(input);need((this.#normal+=1)<=96,"NORMAL_BOUND");const result=capture(await this.#b.request(c)).value;this.#current();if(c.method==="Runtime.callFunctionOn"||c.method==="Debugger.evaluateOnCallFrame"){need((this.#helpers+=1)<=63,"HELPER_BOUND");await this.#b.qualifyHelper(c);this.#current();}return result;}
 #props(role:"frame"|"cache"|"cachePromise",objectId:string):Promise<unknown>{return this.#send({phase:"inverse-native-delete-drain-properties",role,slot:0,pass:0,method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});}
 public async capture(event:DiagnosticEvent,role:Role,mode:"source"|"sync"):Promise<SourceHeld|SyncHeld>{
  this.#current();need(!this.#busy&&this.#active===null&&!this.#used.has(event)&&(this.#events+=1)<=27,"ONE_ORIGINAL_CAPTURE");this.#used.add(event);this.#busy=true;
  try{this.#b.assertOriginalEvent(event);need(event.sessionId===this.#b.sessionId&&event.method==="Debugger.paused","ORIGINAL_WORKER_EVENT");
   const raw=paused.parse(capture(event.params).value),site=SITES[role],top=raw.callFrames[0];need(top!==undefined&&raw.hitBreakpoints[0]===this.#b.originalPoint(role)&&top.location.scriptId===this.#b.scriptId&&top.location.lineNumber===site.lineNumber&&top.location.columnNumber===site.columnNumber&&top.functionLocation.scriptId===this.#b.scriptId&&top.functionLocation.lineNumber===site.functionLineNumber&&top.functionLocation.columnNumber===site.functionColumnNumber,"EXACT_SOURCE_FRAME");
   const frameFlags={objectGroup:FLAGS.objectGroup,silent:true as const,generatePreview:false as const,throwOnSideEffect:true as const,includeCommandLineAPI:false as const,returnByValue:false as const};
   const projected=arrayCapture(await this.#send({phase:"inverse-native-delete-drain-frame",role,slot:0,method:"Debugger.evaluateOnCallFrame",params:{...frameFlags,callFrameId:top.callFrameId,expression:site.expression}}),site.length);
   const refs=[projected,this.#b.project,this.#b.reflection,this.#b.recipe,this.#b.dependencies].map(objectId=>({objectId}));
   const joinedId=arrayCapture(await this.#send(call("receiver",role,projected,refs)),site.length);const fields=array(await this.#props("frame",joinedId),site.length);
   let cache:SourceHeld["cache"]=null,callerId:string|null=null,key:string|null=null,promise:SourceHeld["promise"]=null,returned:string|null=null;
   if(role==="headEntry"||role==="headPromise"||role==="headSuccess"){const value=fields.get("1");need(value?.type==="string"&&typeof value.value==="string","CACHE_KEY");key=value.value;}
   if(role==="headEntry"){
    const caller=callerFrame(event,this.#b.scriptId);need(caller.role==="localSave"||caller.role==="flow"||caller.role==="syncHead","ORIGINAL_DRAIN_CACHE_CALLER");const callerSite=CALLERS[caller.role];
    const called=arrayCapture(await this.#send({phase:"inverse-native-delete-drain-cache-caller",role:caller.role,method:"Debugger.evaluateOnCallFrame",params:{...frameFlags,callFrameId:caller.callFrameId,expression:callerSite.expression}}),callerSite.length);
    const programs={localSave:"captureLocalSave",flow:"captureFlow",syncHead:"captureHead"}as const;
    const args=[joinedId,called,this.#b.intrinsics,this.#b.originalDrainCapture(),this.#b.reflection,this.#b.recipe,this.#b.dependencies].map(objectId=>({objectId}));
    const receipt=arrayCapture(await this.#send(call("cache",programs[caller.role],joinedId,args)),10);const members=array(await this.#props("cache",receipt),10);need(members.get("6")?.value===key,"ORIGINAL_CACHE_KEY");cache=Object.freeze({role:caller.role,joinedId:receipt});
   }else if(role==="headPromise"){
    const original=promiseHandle(top.returnValue),reply=z.strictObject({result:z.unknown()}).parse(await this.#send(call("retain","promise",original,[])));
    const objectId=promiseHandle(reply.result);promiseState(await this.#props("cachePromise",objectId));promise=Object.freeze({objectId});
   }
   if(mode==="sync"&&role==="syncEntry"){
    const caller=raw.callFrames[1];need(caller!==undefined&&caller.location.scriptId===this.#b.scriptId&&caller.location.lineNumber===SYNC_CALLER.lineNumber&&caller.location.columnNumber===SYNC_CALLER.columnNumber&&caller.functionLocation.scriptId===this.#b.scriptId&&caller.functionLocation.lineNumber===SYNC_CALLER.functionLineNumber&&caller.functionLocation.columnNumber===SYNC_CALLER.functionColumnNumber,"ORIGINAL_UPLOAD_FINALLY_CALLER");callerId=caller.callFrameId;
   }
   if(role==="bufferDone"||role==="batchReturned"||role==="detachedReturned"||role==="syncReturned"){returned=promiseHandle(top.returnValue);}
   const packet=Object.freeze({profile:"private.current-footprint-inverse-native-delete-drain-held.v1"});this.#active=Object.freeze({packet,event,role,mode});
   if(mode==="source"){const sourceRole=z.enum(sourceRoles).parse(role);const held:SourceHeld=Object.freeze({packet,role:sourceRole,joinedId,key,cache,promise,returnPromiseId:returned});this.#source.set(packet,held);return held;}
   const syncRole=z.enum(SYNC_ROLES).parse(role);const held:SyncHeld=Object.freeze({packet,role:syncRole,joinedId,callFrameId:top.callFrameId,callerFrameId:callerId,returnPromiseId:returned});this.#sync.set(packet,held);return held;
  }catch(error){this.#failed=true;throw error;}finally{this.#busy=false;}
 }
 #original(packet:object,mode:"source"|"sync"):void{this.#current();const active=this.#active;need(!this.#busy&&active!==null&&active.packet===packet&&active.mode===mode,"ORIGINAL_ACTIVE_HELD");this.#b.assertOriginalEvent(active.event);}
 public requireSource(packet:object):SourceHeld{this.#original(packet,"source");const held=this.#source.get(packet);need(held!==undefined,"ORIGINAL_SOURCE_PACKET");return held;}
 public requireOriginalSyncHeld(packet:object):SyncHeld{this.#original(packet,"sync");const held=this.#sync.get(packet);need(held!==undefined,"ORIGINAL_SYNC_PACKET");return held;}
 public consumeOriginalResume(packet:object):void{this.#current();need(!this.#busy&&this.#active?.packet===packet,"ORIGINAL_RESUME_PACKET");this.#active=null;}
 public requireCompleted():void{this.#current();need(!this.#busy&&this.#active===null&&this.#events===27&&this.#normal===96&&this.#helpers===63,"COMPLETE_ROSTER");}
}
Object.freeze(CurrentFootprintInverseNativeDeleteDrainObserver.prototype);Object.freeze(CurrentFootprintInverseNativeDeleteDrainObserver);
