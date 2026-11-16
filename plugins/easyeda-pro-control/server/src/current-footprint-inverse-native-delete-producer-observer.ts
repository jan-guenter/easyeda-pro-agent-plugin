/* oxlint-disable import/max-dependencies -- Exact original producer frames, cache callers and descriptor-safe Promise projections form one fixed reader. */
/** The same inverse worker's retained producer points. There is no resume in
 * this reader. Only its enclosing original native controller consumes packets. */
import {z} from "zod";
import {captureCurrentPcbStringClockReply} from "./current-pcb-string-clock-reply.ts";
import type {DiagnosticEvent} from "./current-pcb-diagnostic-protocol.ts";
import {CURRENT_PROJECT_SAVE_PRODUCER_SITES as SITES} from "./current-project-save-producer-source.ts";
import {CURRENT_PROJECT_SAVE_PRODUCER_RECEIVER_CALLS as RECEIVERS} from "./current-project-save-producer-programs.ts";
import {CURRENT_PROJECT_SAVE_PRODUCER_FRAME_FLAGS as FRAME} from "./current-project-save-producer-protocol.ts";
import {CURRENT_PROJECT_SAVE_PRODUCER_CACHE_CALLS as CACHE_CALLS} from "./current-project-save-producer-cache-programs.ts";
import {CURRENT_PROJECT_SAVE_PRODUCER_CACHE_CALLERS as CALLERS,currentProjectSaveProducerCacheCallerFrame} from "./current-project-save-producer-cache-source.ts";
import {CURRENT_PROJECT_SAVE_PRODUCER_CACHE_PROMISE_CAPTURE,currentProjectSaveProducerCachePromiseHandle,decodeCurrentProjectSaveProducerCachePromise} from "./current-project-save-producer-cache-replies.ts";
import {decodeCurrentFootprintCopyClockRpcV2Array as array,decodeCurrentFootprintCopyClockRpcV2ArrayCapture as captured,currentFootprintCopyClockRpcV2ArrayObject as objectAt} from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_PRODUCER_FLAGS as FLAGS,validateCurrentFootprintInverseNativeDeleteProducerCommand as validate} from "./current-footprint-inverse-native-delete-producer-protocol.ts";
import type {CurrentFootprintInverseNativeDeleteProducerCommand as Command} from "./current-footprint-inverse-native-delete-producer-protocol.ts";

type Role=Command["role"];
const ORDER=["headEntry","headPromise","headSuccess","bufferIngress","bufferScheduled","localReturned"]as const;
const handle=z.string().regex(/^[A-Za-z0-9_.:-]{1,256}$/u),location=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const frame=z.looseObject({callFrameId:handle,location,functionLocation:location,returnValue:z.unknown().optional()});
const pause=z.looseObject({reason:z.literal("other"),hitBreakpoints:z.tuple([handle]),callFrames:z.array(frame).min(1).max(32)});
function need(ok:boolean):asserts ok{if(!ok){throw new Error("INVERSE_NATIVE_DELETE_PRODUCER_ORIGINAL");}}
export interface CurrentFootprintInverseNativeDeleteProducerBindings{
 readonly scriptId:string;readonly sessionId:string;readonly project:string;readonly wrapper:string;readonly callback:string;readonly intrinsics:string;
 readonly current:()=>void;readonly originalPoint:(role:Role)=>string;readonly assertOriginalEvent:(event:DiagnosticEvent)=>void;
 readonly request:(command:Command)=>Promise<unknown>;readonly qualifyHelper:(command:Command)=>Promise<void>;
}
export interface CurrentFootprintInverseNativeDeleteProducerHeld{
 readonly packet:object;readonly event:DiagnosticEvent;readonly role:Role;readonly callFrameId:string;readonly joinedId:string;readonly fields:ReturnType<typeof array>;
 readonly key:string|null;readonly cache:Readonly<{role:"localUpload";joinedId:string}>|null;readonly promise:Readonly<{objectId:string}>|null;readonly bufferPromise:string|null;
}
export class CurrentFootprintInverseNativeDeleteProducerObserver{
 readonly #b:CurrentFootprintInverseNativeDeleteProducerBindings;readonly #held=new WeakMap<object,CurrentFootprintInverseNativeDeleteProducerHeld>();readonly #used=new WeakSet<DiagnosticEvent>();
 #busy=false;#failed=false;#active:CurrentFootprintInverseNativeDeleteProducerHeld|null=null;#normal=0;#helpers=0;#roles=0;
 public constructor(bindings:CurrentFootprintInverseNativeDeleteProducerBindings){this.#b=Object.freeze({...bindings});Object.freeze(this);}
 #current():void{need(!this.#failed);this.#b.current();}
 public async capture(event:DiagnosticEvent,role:Role):Promise<CurrentFootprintInverseNativeDeleteProducerHeld>{
  this.#current();need(!this.#busy&&this.#active===null&&!this.#used.has(event)&&this.#roles<6&&ORDER[this.#roles]===role);this.#used.add(event);this.#busy=true;
  try{this.#b.assertOriginalEvent(event);need(event.method==="Debugger.paused"&&event.sessionId===this.#b.sessionId);const received=pause.parse(captureCurrentPcbStringClockReply(event.params).value);const top=received.callFrames[0];const site=SITES[role];need(top!==undefined&&received.hitBreakpoints[0]===this.#b.originalPoint(role)&&top.location.scriptId===this.#b.scriptId&&top.location.lineNumber===site.lineNumber&&top.location.columnNumber===site.columnNumber&&top.functionLocation.scriptId===this.#b.scriptId&&top.functionLocation.lineNumber===site.functionLineNumber&&top.functionLocation.columnNumber===site.functionColumnNumber);
   const send=async(command:unknown):Promise<unknown>=>{this.#current();const c=validate({phase:"inverse-native-delete-producer",role,command});need((this.#normal+=1)<=23);const raw=captureCurrentPcbStringClockReply(await this.#b.request(c)).value;this.#current();if(c.command.method==="Runtime.callFunctionOn"||c.command.method==="Debugger.evaluateOnCallFrame"){need((this.#helpers+=1)<=15);await this.#b.qualifyHelper(c);this.#current();}return raw;};
   const props=(phase:"project-save-producer-properties"|"project-save-producer-cache-properties"|"project-save-producer-cache-promise-properties",objectId:string):Promise<unknown>=>send({phase,method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});
   const value=captured(await send({phase:"project-save-producer-frame",role,method:"Debugger.evaluateOnCallFrame",params:{...FRAME,objectGroup:FLAGS.objectGroup,callFrameId:top.callFrameId,expression:site.expression}}),site.length);
   const joinedId=captured(await send({phase:"project-save-producer-receiver",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:value,functionDeclaration:RECEIVERS[role],arguments:[this.#b.project,this.#b.wrapper,this.#b.callback].map(objectId=>({objectId}))}}),site.length);
   const fields=array(await props("project-save-producer-properties",joinedId),site.length);let cache:CurrentFootprintInverseNativeDeleteProducerHeld["cache"]=null;let promise:CurrentFootprintInverseNativeDeleteProducerHeld["promise"]=null;
   if(role==="headEntry"){
    const caller=currentProjectSaveProducerCacheCallerFrame(event,this.#b.scriptId);need(caller.role==="localUpload");const callerSite=CALLERS.localUpload;
    const called=captured(await send({phase:"project-save-producer-cache-caller",cacheRole:"localUpload",method:"Debugger.evaluateOnCallFrame",params:{...FRAME,objectGroup:FLAGS.objectGroup,callFrameId:caller.callFrameId,expression:callerSite.expression}}),callerSite.length);
    const tuple=captured(await send({phase:"project-save-producer-cache-receiver",cacheRole:"localUpload",method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:joinedId,functionDeclaration:CACHE_CALLS.localUpload,arguments:[this.#b.project,this.#b.wrapper,this.#b.callback,this.#b.intrinsics,called].map(objectId=>({objectId}))}}),10);
    const members=array(await props("project-save-producer-cache-properties",tuple),10);need(members.get("6")?.value===fields.get("1")?.value);cache=Object.freeze({role:"localUpload",joinedId:tuple});
   }else if(role==="headPromise"){
    const original=currentProjectSaveProducerCachePromiseHandle(top.returnValue),raw=await send({phase:"project-save-producer-cache-promise",method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:original,functionDeclaration:CURRENT_PROJECT_SAVE_PRODUCER_CACHE_PROMISE_CAPTURE,arguments:[]}});
    const owned=currentProjectSaveProducerCachePromiseHandle(z.strictObject({result:z.unknown()}).parse(raw).result);decodeCurrentProjectSaveProducerCachePromise(await props("project-save-producer-cache-promise-properties",owned));promise=Object.freeze({objectId:owned});
   }
   let key:string|null=null;if(role==="headEntry"||role==="headPromise"||role==="headSuccess"){const k=fields.get("1");need(k?.type==="string"&&typeof k.value==="string");key=k.value;}
   const packet=Object.freeze({profile:"private.current-footprint-inverse-native-delete-producer-held.v1"});const held=Object.freeze({packet,event,role,callFrameId:top.callFrameId,joinedId,fields,key,cache,promise,bufferPromise:role==="bufferScheduled"?objectAt(fields,2):null});this.#held.set(packet,held);this.#active=held;this.#roles+=1;this.#current();return held;
  }catch(error){this.#failed=true;throw error;}finally{this.#busy=false;}
 }
 public requireOriginal(packet:object):CurrentFootprintInverseNativeDeleteProducerHeld{this.#current();const h=this.#held.get(packet);need(!this.#busy&&h!==undefined&&h===this.#active);this.#b.assertOriginalEvent(h.event);return h;}
 public consumeOriginalResume(packet:object):void{const h=this.requireOriginal(packet);need(this.#active===h);this.#active=null;}
 public requireCompleted():void{this.#current();need(!this.#busy&&this.#active===null&&this.#roles===6&&this.#normal===23&&this.#helpers===15);}
}
Object.freeze(CurrentFootprintInverseNativeDeleteProducerObserver.prototype);Object.freeze(CurrentFootprintInverseNativeDeleteProducerObserver);
