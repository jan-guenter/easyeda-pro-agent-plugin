/** Finite caller readers. Only the enclosing original controller can supply a
 * held event or resume; data packets never issue a caller/runtime capability. */
import{z}from"zod";
import type{DiagnosticEvent}from"./current-pcb-diagnostic-protocol.ts";
import type{CurrentFootprintInverseNativeDeleteCallerPreparationBindings as Preparation,CurrentFootprintInverseNativeDeleteCallerPrepared as Prepared}from"./current-footprint-inverse-native-delete-caller-collector.ts";
import{currentFootprintInverseLookupArray as array,currentFootprintInverseLookupResult as captureTuple,currentFootprintInverseLookupObject as object,currentFootprintInverseLookupProperties as properties}from"./current-footprint-inverse-lookup-preentry-replies.ts";
import type{CurrentFootprintInverseLookupRemote as Remote}from"./current-footprint-inverse-lookup-preentry-replies.ts";
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CALLER_FLAGS as FLAGS,currentFootprintInverseNativeDeleteCallerCall as callCommand,currentFootprintInverseNativeDeleteCallerExpression as expression,validateCurrentFootprintInverseNativeDeleteCallerCommand as validate}from"./current-footprint-inverse-native-delete-caller-protocol.ts";
import type{CurrentFootprintInverseNativeDeleteCallerCommand as Command,CurrentFootprintInverseNativeDeleteCallerRole as Role}from"./current-footprint-inverse-native-delete-caller-protocol.ts";
import{currentFootprintInverseClockNativeCallable as callable,qualifyCurrentFootprintInverseClockNativeFunction as native}from"./current-footprint-inverse-clock-native-metadata.ts";
import{currentNativeMessageEventCallable,qualifyCurrentNativeMessageEventFunction}from"./current-native-message-event-metadata.ts";
import{qualifyCurrentFootprintInverseNativeDeliveryEvent}from"./current-footprint-inverse-native-delivery-replies.ts";

type Realm="worker"|"ui";
interface Tuple{readonly id:string;readonly values:readonly Remote[]}
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote=z.strictObject({type:z.enum(["undefined","object","function","string","number","boolean","symbol","bigint"]),subtype:z.string().optional(),className:z.string().optional(),description:z.string().optional(),value:z.unknown().optional(),objectId:handle.optional()});
const promiseRemote=z.strictObject({type:z.literal("object"),subtype:z.literal("promise"),className:z.literal("Promise"),description:z.literal("Promise"),objectId:handle});
// oxlint-disable-next-line unicorn/max-nested-calls -- The complete Inspector internal-properties grammar is one independently parsed packet.
const promisePacket=z.strictObject({result:z.tuple([]),internalProperties:z.array(z.strictObject({name:z.string(),value:remote})).length(3)});
const yes=z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.literal(true)})});
function need(v:boolean):asserts v{if(!v){throw new Error("INVERSE_NATIVE_DELETE_CALLER_CURSOR");}}
export interface CurrentFootprintInverseNativeDeleteCallerHeld{
 readonly event:DiagnosticEvent;readonly role:Role;readonly frame:string;readonly caller:string|null;readonly nativeListener:string|null;readonly returned:unknown;
}
export interface CurrentFootprintInverseNativeDeleteCallerCursorBindings extends Pick<Preparation,"reflection"|"native"|"sender"|"graph"|"forwarded">{
 readonly workerUuid:string;readonly prepared:Prepared;readonly managerProject:string;readonly managerSelected:string;readonly current:()=>void;
 readonly request:(command:Command)=>Promise<unknown>;
 readonly originalInnerDelete:()=>Promise<Readonly<{promise:string;result:string}>>;
 readonly beforeWorkerPublish:()=>Promise<void>;
}
export class CurrentFootprintInverseNativeDeleteCallerCursor{
 readonly #b:CurrentFootprintInverseNativeDeleteCallerCursorBindings;readonly #slots=new Map<string,number>();readonly #done=new Set<Role>();
 readonly #promises=new Map<Role,string>();#workerReturned:Tuple|null=null;#workerService:Tuple|null=null;#workerSuccess:Tuple|null=null;
 #response:Tuple|null=null;#uiResult:string|null=null;#outer:Tuple|null=null;#workerFinal=false;#uiFinal=false;
 public constructor(bindings:CurrentFootprintInverseNativeDeleteCallerCursorBindings){this.#b=Object.freeze({...bindings});Object.freeze(this);}
 #current():void{this.#b.current();}
 async #send(c:Command):Promise<unknown>{this.#current();const raw=await this.#b.request(c);this.#current();return raw;}
 #props(realm:Realm,id:string,role:"tuple"|"native"|"scope"|"promise"|"result"|"object"="object"):Promise<unknown>{const key=`${realm}-${role}`;const slot=this.#slots.get(key)??0;need(slot<=63);this.#slots.set(key,slot+1);return this.#send(validate({phase:"inverse-native-delete-caller-properties",realm,role,slot,pass:0,method:"Runtime.getProperties",params:{objectId:id,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}}));}
 #call(realm:Realm,kind:Realm,role:string,id:string,refs:readonly string[],slot=0,values:readonly string[]=[]):Promise<unknown>{return this.#send(callCommand(realm,kind,role,id,[...refs.map(objectId=>({objectId})),...values.map(value=>({value}))],slot));}
 async #tuple(realm:Realm,kind:Realm,role:string,id:string,refs:readonly string[],count:number,slot=0):Promise<Tuple>{const tuple=captureTuple(await this.#call(realm,kind,role,id,refs,slot),count);return Object.freeze({id:tuple,values:array(await this.#props(realm,tuple,"tuple"),count)});}
 async #frame(realm:Realm,role:Role|"innerCaller"|"outerCaller"|"nativeListener",id:string,count:number):Promise<Tuple>{const command=validate({phase:"inverse-native-delete-caller-frame",realm,role,method:"Debugger.evaluateOnCallFrame",params:{objectGroup:FLAGS.objectGroup,silent:true,generatePreview:false,throwOnSideEffect:true,callFrameId:id,expression:expression(role),returnByValue:false,includeCommandLineAPI:false}});const tuple=captureTuple(await this.#send(command),count);return Object.freeze({id:tuple,values:array(await this.#props(realm,tuple,"tuple"),count)});}
 async #fulfilled(realm:Realm,id:string):Promise<Remote>{for(let pass=1;pass<=2;pass += 1){const packet=promisePacket.parse(await this.#props(realm,id,"promise"));const slots=new Map(packet.internalProperties.map(row=>[row.name,row.value]));need(slots.size===3&&slots.get("[[PromiseState]]")?.type==="string"&&slots.get("[[Prototype]]")?.type==="object"&&slots.get("[[Prototype]]")?.className==="Promise");const state=slots.get("[[PromiseState]]");const value=slots.get("[[PromiseResult]]");need(value!==undefined);if(state?.value==="fulfilled"){return value;}need(realm==="ui"&&pass===1&&state?.value==="pending"&&value.type==="undefined"&&value.objectId===undefined);}throw new Error("INVERSE_NATIVE_DELETE_CALLER_PROMISE_NOT_SETTLED");}
 async #retain(held:CurrentFootprintInverseNativeDeleteCallerHeld,slot:number):Promise<string>{const original=promiseRemote.parse(held.returned);const retained=await this.#call("ui","ui","retain",original.objectId,[],slot);const value=z.strictObject({result:promiseRemote}).parse(retained).result.objectId;yes.parse(await this.#call("ui","ui","promise",this.#b.reflection.ui,[value,this.#b.native.members]));this.#promises.set(held.role,value);return value;}
 public async read(held:CurrentFootprintInverseNativeDeleteCallerHeld):Promise<void>{
  this.#current();need(!this.#done.has(held.role));const b=this.#b;const p=b.prepared;const r=held.role;
  if(r==="failure"||r==="outerFailure"){throw new Error("INVERSE_NATIVE_DELETE_CALLER_ORIGINAL_FAILURE");}
  if(r==="returned"){
   need(this.#workerReturned===null);const frame=await this.#frame("worker",r,held.frame,8);this.#workerReturned=await this.#tuple("worker","worker","returned",frame.id,[p.workerState],3);
   const value=this.#workerReturned.values[2];need(value!==undefined);const pending=promisePacket.parse(await this.#props("worker",object(value),"promise"));const slots=new Map(pending.internalProperties.map(row=>[row.name,row.value]));need(slots.size===3&&slots.get("[[PromiseState]]")?.value==="pending"&&slots.get("[[PromiseResult]]")?.type==="undefined");
  }else if(r==="serviceReturn"){
   need(this.#done.has("returned"));const frame=await this.#frame("worker",r,held.frame,5);this.#workerService=await this.#tuple("worker","worker","serviceReturn",frame.id,[p.workerState],3);
  }else if(r==="success"){
   need(this.#done.has("serviceReturn")&&this.#workerReturned!==null);const original=await b.originalInnerDelete();this.#current();const promise=this.#workerReturned.values[2];need(promise!==undefined);const value=await this.#fulfilled("worker",object(promise));properties(await this.#props("worker",object(value),"result"));const frame=await this.#frame("worker",r,held.frame,3);
   this.#workerSuccess=await this.#tuple("worker","worker","success",frame.id,[p.workerState,this.#workerReturned.id,object(value),original.result],5);await b.beforeWorkerPublish();this.#current();
  }else if(r==="successReturn"){
   need(this.#done.has("success")&&this.#workerSuccess!==null);const frame=await this.#frame("worker",r,held.frame,3);yes.parse(await this.#call("worker","worker","successReturn",frame.id,[p.workerState,this.#workerSuccess.id]));need(this.#workerReturned!==null&&this.#workerService!==null&&!this.#workerFinal);yes.parse(await this.#call("worker","worker","final",b.reflection.worker,[p.workerState,this.#workerReturned.id,this.#workerSuccess.id,this.#workerService.id]));this.#workerFinal=true;
  }else if(r==="innerSubscribe"){
   need(this.#workerSuccess!==null&&held.caller!==null&&held.nativeListener!==null);const frame=await this.#frame("ui",r,held.frame,3);const caller=await this.#frame("ui","innerCaller",held.caller,2);
   const listener=await this.#frame("ui","nativeListener",held.nativeListener,2);const event=listener.values[1];need(event?.type==="object"&&event.className==="MessageEvent"&&event.description==="MessageEvent");qualifyCurrentFootprintInverseNativeDeliveryEvent(await this.#props("ui",object(event)));
   const members=await this.#tuple("ui","ui","eventMembers",p.eventConstructors,[object(event)],12);for(let j=0;j<8;j += 1){const fn=members.values[j+3];need(fn!==undefined);currentNativeMessageEventCallable({result:fn},j+1);qualifyCurrentNativeMessageEventFunction(await this.#props("ui",object(fn),"native"),j+1);}
   const read=await this.#tuple("ui","ui","eventOpaque",members.id,[b.forwarded.channel.broadcastChannel],5);const envelope=read.values[2];need(envelope!==undefined);properties(await this.#props("ui",object(envelope)));
   yes.parse(await this.#call("ui","ui","innerEnvelope",b.reflection.ui,[read.id,frame.id,p.roots.id],0,[b.workerUuid,b.forwarded.nativeOrigin]));
   const body=frame.values[0];need(body!==undefined);properties(await this.#props("ui",object(body)));
   this.#response=await this.#tuple("ui","ui","innerSubscribe",b.reflection.ui,[frame.id,p.roots.id,p.tasks.id,p.callbacks.id,p.callback.id,caller.id],2);
  }else if(r==="innerRpc"){
   need(this.#done.has("innerSubscribe")&&this.#response!==null);const frame=await this.#frame("ui",r,held.frame,3);const result=await this.#tuple("ui","ui","innerRpc",b.reflection.ui,[frame.id,this.#response.id,p.resolvers.id,p.tasks.id,p.callback.id],1);const value=result.values[0];need(value!==undefined);this.#uiResult=object(value);
  }else if(r==="managerReturned"){
   need(this.#done.has("innerRpc"));const frame=await this.#frame("ui",r,held.frame,3);yes.parse(await this.#call("ui","ui","managerReturned",b.reflection.ui,[frame.id,b.managerProject,b.sender.prepared,b.managerSelected]));await this.#retain(held,0);
  }else if(r==="handlerReturned"){
   need(this.#done.has("managerReturned")&&this.#uiResult!==null);const frame=await this.#frame("ui",r,held.frame,4);const row=await this.#tuple("ui","ui","handlerReturned",b.reflection.ui,[frame.id,b.sender.prepared,b.graph.manager],1);const value=row.values[0];need(value!==undefined);yes.parse(await this.#call("ui","ui","same",b.reflection.ui,[object(value),this.#uiResult],0));await this.#retain(held,1);
  }else if(r==="outerCallback"){
   need(this.#done.has("handlerReturned")&&held.caller!==null);const frame=await this.#frame("ui",r,held.frame,5);const caller=await this.#frame("ui","outerCaller",held.caller,6);const module=p.views.values[1];need(module!==undefined);
   this.#outer=await this.#tuple("ui","ui","callback",b.reflection.ui,[frame.id,p.roots.id,p.tasks.id,p.callbacks.id,object(module),caller.id],2);const fn=this.#outer.values[1];need(fn!==undefined);callable({result:fn},10);native(await this.#props("ui",object(fn),"native"),10);
  }else{
   need(r==="outerReturned"&&this.#done.has("outerCallback")&&this.#outer!==null);const frame=await this.#frame("ui",r,held.frame,5);yes.parse(await this.#call("ui","ui","callbackReturned",b.reflection.ui,[frame.id,this.#outer.id]));
  }
  this.#current();this.#done.add(r);
 }
 public async complete(realm:Realm):Promise<void>{
  const b=this.#b;const p=b.prepared;this.#current();
  if(realm==="worker"){need(this.#workerFinal&&this.#done.has("successReturn"));return;}
  need(!this.#uiFinal&&this.#done.has("outerReturned")&&this.#uiResult!==null);
  for(const[role,promise]of this.#promises){need(role==="managerReturned"||role==="handlerReturned");const value=await this.#fulfilled("ui",promise);if(role==="handlerReturned"){need(value.type==="boolean"&&value.value===true&&value.objectId===undefined);}else{yes.parse(await this.#call("ui","ui","same",b.reflection.ui,[object(value),this.#uiResult],1));}}
  const inner=await this.#fulfilled("ui",b.forwarded.innerPromise);yes.parse(await this.#call("ui","ui","same",b.reflection.ui,[object(inner),this.#uiResult],2));
  for(const[slot,promise]of[b.forwarded.outerLocalPromise,b.forwarded.outerPromise].entries()){const value=await this.#fulfilled("ui",promise);properties(await this.#props("ui",object(value),"result"));const command=callCommand("ui","ui","outerResult",b.reflection.ui,[{objectId:object(value)},{value:true}],slot);yes.parse(await this.#send(command));}
  yes.parse(await this.#call("ui","ui","final",b.reflection.ui,[p.roots.id,p.tasks.id,p.callbacks.id]));this.#current();this.#uiFinal=true;
 }
 public requireComplete():void{this.#current();need(this.#workerFinal&&this.#uiFinal&&this.#done.size===10&&this.#promises.size===2);}
}
Object.freeze(CurrentFootprintInverseNativeDeleteCallerCursor.prototype);Object.freeze(CurrentFootprintInverseNativeDeleteCallerCursor);
