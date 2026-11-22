/* oxlint-disable import/max-dependencies -- This one original event dispatcher composes four separately fixed cursor vocabularies and their descriptor-safe readers. */
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_FLOW_MAXIMUM}from "./current-footprint-inverse-native-delete-flow-budget.ts";
/** One original worker's fixed parser/cache/callback/ticket-timer continuation.
 * Local completion proves no cloud upload, Main SQL, DEL return or Save. */
import {types} from "node:util";
import {z} from "zod";
import type {DiagnosticEvent} from "./current-pcb-diagnostic-protocol.ts";
import {captureCurrentPcbStringClockReply as capture} from "./current-pcb-string-clock-reply.ts";
import {decodeCurrentFootprintCopyClockRpcV2Array as array,decodeCurrentFootprintCopyClockRpcV2ArrayCapture as arrayCapture,currentFootprintCopyClockRpcV2ArrayObject as objectAt} from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_LOCAL_CAPTURE as CAPTURE} from "./current-footprint-inverse-native-delete-local-programs.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_LOCAL_FLAGS as LOCAL_FLAGS} from "./current-footprint-inverse-native-delete-local-protocol.ts";
import type {CurrentFootprintInverseNativeDeleteLocalCommand as LocalCommand,CurrentFootprintInverseNativeDeleteLocalRole as LocalRole} from "./current-footprint-inverse-native-delete-local-protocol.ts";
import {CurrentFootprintInverseNativeDeleteLocalCursor} from "./current-footprint-inverse-native-delete-local-cursor.ts";
import type {CurrentFootprintInverseNativeDeleteLocalCompleted as LocalCompleted,CurrentFootprintInverseNativeDeleteLocalHeld as LocalHeld} from "./current-footprint-inverse-native-delete-local-cursor.ts";
import {CurrentFootprintInverseNativeDeleteProducerObserver} from "./current-footprint-inverse-native-delete-producer-observer.ts";
import type {CurrentFootprintInverseNativeDeleteProducerCommand as ProducerCommand} from "./current-footprint-inverse-native-delete-producer-protocol.ts";
import {CurrentFootprintInverseNativeDeletePublicationCallbacks} from "./current-footprint-inverse-native-delete-publication-callbacks.ts";
import type {CurrentFootprintInverseNativeDeletePublicationCallbackCommand as CallbackCommand} from "./current-footprint-inverse-native-delete-publication-callback-protocol.ts";
import {CurrentFootprintInverseNativeDeletePublicationTimer} from "./current-footprint-inverse-native-delete-publication-timer.ts";
import type {CurrentFootprintInverseNativeDeletePublicationTimerCommand as TimerCommand} from "./current-footprint-inverse-native-delete-publication-timer-protocol.ts";
import {CURRENT_PROJECT_SAVE_STRUCTURE_SITES as CALLBACK_SITES} from "./current-project-save-structure-protocol.ts";
import {CURRENT_FOOTPRINT_INVERSE_STARTUP_CALLBACK_ROLES as CALLBACK_ROLES} from "./current-footprint-inverse-startup-callback-protocol.ts";
import type {CurrentFootprintInverseStartupCallbackRole as CallbackRole} from "./current-footprint-inverse-startup-callback-protocol.ts";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_SITES as TIMER_SITES} from "./current-footprint-forward-writer-ticket-timer-source.ts";
import {currentFootprintInverseNativeDeleteFlowHelper as helperCommand,currentFootprintInverseNativeDeleteFlowProgram as program,qualifyCurrentFootprintInverseNativeDeleteFlowHelper as qualify,validateCurrentFootprintInverseNativeDeleteFlowCommand as validate} from "./current-footprint-inverse-native-delete-flow-protocol.ts";
import type {CurrentFootprintInverseNativeDeleteFlowCommand as Command} from "./current-footprint-inverse-native-delete-flow-protocol.ts";

type Kind="local"|"producer"|"callback"|"timer";
type Normal=Extract<Command,{phase:"inverse-native-delete-flow"}>;
type Child=LocalCommand|ProducerCommand|CallbackCommand|TimerCommand;
type Lane="local"|"callback"|"timer";
const handle=z.string().regex(/^[A-Za-z0-9_.:-]{1,256}$/u);
const point=z.strictObject({breakpointId:handle,actualLocation:z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()})});
const pausedLocation=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const pausedFrame=z.looseObject({callFrameId:handle,location:pausedLocation});
const pause=z.looseObject({reason:z.literal("other"),hitBreakpoints:z.tuple([handle]),callFrames:z.array(pausedFrame).min(1).max(32)});
const empty=z.strictObject({});
const PRODUCER_ROLES=["headEntry","headPromise","headSuccess","bufferIngress","bufferScheduled","localReturned"]as const;


const MAX=CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_FLOW_MAXIMUM;
function need(ok:boolean,part:string):asserts ok{if(!ok){throw new Error(`INVERSE_NATIVE_DELETE_FLOW_${part}`);}}
interface Held{readonly event:DiagnosticEvent;readonly lane:Lane;readonly role:string}
type Resume=Readonly<{held:Held;barrier:ReturnType<typeof Promise.withResolvers<undefined>>}>;
interface Helper{readonly origin:Child;readonly command:Normal;issued:boolean;scriptId:string|null;attempted:boolean}
export interface CurrentFootprintInverseNativeDeleteFlowBindings{
 readonly scriptId:string;readonly sessionId:string;readonly contextId:number;readonly branchUuid:string;readonly body:string;
 readonly initialEvent:DiagnosticEvent;readonly serialization:Readonly<{bundle:string;upload:string}>;
 readonly actual:Readonly<{reflection:string;capture:string;project:string;wrapper:string;callback:string;cacheIntrinsics:string}>;
 readonly originalProducerPoint:(role:LocalRole)=>string;readonly originalCallbackPoint:(role:CallbackRole)=>string;
 readonly current:()=>void;readonly assertOriginalHeld:()=>void;readonly assertOriginalEvent:(event:DiagnosticEvent)=>void;
 readonly requireOriginalMainArmed:()=>void;readonly consumeOriginalUpload:()=>void;readonly originalUploadWritten:()=>boolean;
 readonly send:(command:Command,beforeTransfer:()=>void)=>Promise<unknown>;readonly poll:()=>Promise<void>;
 readonly control:(lane:Lane,phase:string,fields:Readonly<Record<string,string|number|boolean>>)=>Promise<void>;
 readonly journal:(lane:Lane,kind:string,fields:Readonly<Record<string,unknown>>)=>Promise<void>;
 readonly assertOriginalExit:()=>void;readonly fail:(error:unknown)=>void;
}
export interface CurrentFootprintInverseNativeDeleteFlowData{
 readonly local:LocalCompleted;readonly originalSingleReadyCallbackJoined:true;readonly originalSerialQueueEmpty:true;
 readonly originalNaturalTicketTimerJoined:true;readonly actualTimerResumes:3;readonly originalUploadResumeObserved:true;
 readonly cloudUploadCompleted:false;readonly mainSqlCompleted:false;readonly deleteReturned:false;readonly publicationComplete:false;readonly saveAuthorized:false;
}
const originals=new WeakSet<object>();
export class CurrentFootprintInverseNativeDeleteFlowController{
 readonly #b:CurrentFootprintInverseNativeDeleteFlowBindings;readonly #requests:Promise<unknown>[]=[];
 readonly #points=new Map<string,Readonly<{lane:Lane;role:string}>>();readonly #callbackPoints=new Map<CallbackRole,string>();
 readonly #callbackEvents:DiagnosticEvent[]=[];readonly #locals=new WeakMap<object,LocalHeld>();readonly #consumed=new WeakSet<object>();#initialPacket:object|null=null;
 #producer:CurrentFootprintInverseNativeDeleteProducerObserver|null=null;#local:CurrentFootprintInverseNativeDeleteLocalCursor|null=null;
 #callbacks:CurrentFootprintInverseNativeDeletePublicationCallbacks|null=null;#timer:CurrentFootprintInverseNativeDeletePublicationTimer|null=null;
 #held:Held|null=null;#resuming:Resume|null=null;
 #helper:Helper|null=null;#arming:Readonly<{lane:Lane;role:string;line:number;column:number;resolved:string|null}>|null=null;
 #tail:Promise<void>=Promise.resolve();#prepare:Promise<void>|null=null;#pending:Promise<Readonly<CurrentFootprintInverseNativeDeleteFlowData>>|null=null;
 #ready=false;#started=false;#failed=false;#closed=false;#reading=false;#normal=0;#helpers=0;#events=0;#resumes=0;#callbacksCompleted=false;
 readonly #counts={local:0,producer:0,callback:0,timer:0};#data:Readonly<CurrentFootprintInverseNativeDeleteFlowData>|null=null;
 public constructor(binding:CurrentFootprintInverseNativeDeleteFlowBindings){this.#b=Object.freeze({...binding});originals.add(this);Object.freeze(this);}
 #current():void{this.#b.current();need(!this.#failed&&!this.#closed,"CURRENT");}
 #fail(error:unknown):void{if(!this.#failed){this.#failed=true;this.#resuming?.barrier.reject(error);this.#b.fail(error);}}
 #outer(kind:Kind,command:Child):Normal{this.#current();const c=validate({phase:"inverse-native-delete-flow",kind,command});need(c.phase==="inverse-native-delete-flow","NORMAL");return c;}
 #actual(c:Normal):Readonly<{method:string;params:Readonly<Record<string,unknown>>;role?:string}>{this.#current();return c.kind==="callback"||c.kind==="producer"?c.command.command:c.command;}
 async #issue(c:Command,before:()=>void):Promise<unknown>{this.#current();const request=this.#b.send(c,():void=>{this.#current();before();});need(types.isPromise(request)&&this.#requests.length<MAX.cdpRequests,"ORIGINAL_REQUEST");this.#requests.push(request);const raw=capture(await request).value;this.#current();return raw;}
 async #request(kind:Kind,input:Child):Promise<unknown>{
  this.#current();need(!this.#reading&&this.#helper===null&&this.#data===null,"SINGLE_REQUEST");this.#reading=true;
  try{const c=this.#outer(kind,input);const actual=this.#actual(c);need((this.#normal+=1)<=MAX.normal,"NORMAL_BOUND");this.#counts[kind]+=1;
   if(program(c)!==null){this.#helper={origin:input,command:c,issued:false,scriptId:null,attempted:false};}
   let resume:Resume|null=null;
   if(actual.method==="Debugger.resume"){const held=this.#held;need(held!==null&&this.#resuming===null&&held.lane===(kind==="producer"?"local":kind)&&actual.role===held.role&&this.#started,"ORIGINAL_RESUME");this.#b.assertOriginalEvent(held.event);const barrier=Promise.withResolvers<undefined>();resume=Object.freeze({held,barrier});this.#resuming=resume;void(async():Promise<void>=>{try{await barrier.promise;}catch{
    // The same original resume and exit settlement retain this rejection.
   }})();}
   const raw=await this.#issue(c,():void=>{if(resume!==null){need(this.#held===resume.held,"RESUME_HELD_CURRENT");this.#b.assertOriginalEvent(resume.held.event);}if(this.#helper!==null){need(this.#helper.command===c&&!this.#helper.issued,"HELPER_ONCE");this.#helper.issued=true;}
    if(resume!==null&&resume.held.role==="localIngress"){need(this.#resumes===0,"UPLOAD_ONCE");this.#b.requireOriginalMainArmed();this.#b.consumeOriginalUpload();}});
   if(resume!==null){empty.parse(raw);await this.#wait(()=>this.#resuming!==resume);await resume.barrier.promise;this.#current();}return raw;
  }catch(error){this.#fail(error);throw error;}finally{this.#reading=false;}
 }
 async #qualify(input:Child):Promise<void>{
  this.#current();const h=this.#helper;need(!this.#reading&&h!==null&&h.origin===input&&h.issued&&!h.attempted&&h.scriptId!==null,"ORIGINAL_HELPER");h.attempted=true;this.#reading=true;
  try{need((this.#helpers+=1)<=MAX.helpers,"HELPER_BOUND");const raw=await this.#issue(helperCommand(h.command,h.scriptId),()=>{this.#current();});qualify(raw,h.command);this.#helper=null;}catch(error){this.#fail(error);throw error;}finally{this.#reading=false;}
 }
 async #wait(predicate:()=>boolean):Promise<void>{const start=performance.now();while(!predicate()){this.#current();need(performance.now()-start<30_000,"EVENT_TIMEOUT");await this.#b.poll();this.#current();}}
 async #read(kind:Kind,c:Child):Promise<unknown>{const raw=await this.#request(kind,c);if(program(this.#outer(kind,c))!==null){await this.#qualify(c);this.#current();}return raw;}
 public prepare():Promise<void>{if(this.#prepare!==null){return this.#prepare;}const result=Promise.withResolvers<undefined>();this.#prepare=result.promise;void(async():Promise<void>=>{try{await this.#setup();// oxlint-disable-next-line unicorn/no-useless-undefined -- The original PromiseWithResolvers<undefined> requires its fulfillment argument.
 result.resolve(undefined);}catch(error){this.#fail(error);result.reject(error);}})();return result.promise;}
 async #setup():Promise<void>{
  this.#current();this.#b.assertOriginalHeld();this.#b.assertOriginalEvent(this.#b.initialEvent);await this.#b.control("local","bind",{});this.#current();
  const captured=arrayCapture(await this.#read("local",{phase:"inverse-native-delete-local-capture",role:"sourceBody",method:"Runtime.callFunctionOn",params:{...LOCAL_FLAGS,returnByValue:false,objectId:this.#b.actual.reflection,functionDeclaration:CAPTURE,arguments:[{objectId:this.#b.serialization.upload},{objectId:this.#b.serialization.bundle},{objectId:this.#b.actual.cacheIntrinsics}]}}),2);
  const members=array(await this.#request("local",{phase:"inverse-native-delete-local-capture-properties",role:"sourceBody",method:"Runtime.getProperties",params:{objectId:captured,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}}),2);
  const ingress=objectAt(members,0);const bodyObject=objectAt(members,1);const frame=pause.parse(this.#b.initialEvent.params).callFrames[0];need(frame!==undefined,"INITIAL_FRAME");
  const packet=Object.freeze({profile:"private.current-footprint-inverse-native-delete-local-held.v1"});const initial:LocalHeld=Object.freeze({packet,role:"localIngress",joinedId:ingress,callFrameId:frame.callFrameId,key:null,cache:null,promise:null,bufferPromise:null});this.#locals.set(packet,initial);this.#initialPacket=packet;this.#held=Object.freeze({event:this.#b.initialEvent,lane:"local",role:"localIngress"});
  for(const role of PRODUCER_ROLES){const id=this.#b.originalProducerPoint(role);need(!this.#points.has(id),"PRODUCER_POINTS");this.#points.set(id,Object.freeze({lane:"local",role}));}
  this.#producer=new CurrentFootprintInverseNativeDeleteProducerObserver({...this.#b.actual,scriptId:this.#b.scriptId,sessionId:this.#b.sessionId,intrinsics:this.#b.actual.cacheIntrinsics,current:():void=>{ this.#current(); },originalPoint:(role):string=>this.#b.originalProducerPoint(role),assertOriginalEvent:(event):void=>{ this.#b.assertOriginalEvent(event); },request:(c):Promise<unknown>=>this.#request("producer",c),qualifyHelper:(c):Promise<void>=>this.#qualify(c)});
  this.#local=new CurrentFootprintInverseNativeDeleteLocalCursor({scriptId:this.#b.scriptId,body:this.#b.body,bodyObject,branchUuid:this.#b.branchUuid,assertCurrent:():Promise<void>=>{this.#current();return Promise.resolve();},requireHeld:(p):LocalHeld=>{this.#current();need(!this.#consumed.has(p),"HELD_CONSUMED");const local=this.#locals.get(p);if(local!==undefined){return local;}need(this.#producer!==null,"PRODUCER_REQUIRED");return this.#producer.requireOriginal(p);},request:(c):Promise<unknown>=>this.#request("local",c),qualifyHelper:(c):Promise<void>=>this.#qualify(c),resume:async(held,c):Promise<void>=>{this.#current();need(this.#held?.lane==="local"&&this.#held.role===held.role,"LOCAL_HELD");await this.#b.control("local","held",{role:held.role});this.#current();empty.parse(await this.#request("local",c));this.#current();if(held.role==="localIngress"){this.#consumed.add(held.packet);await this.#b.journal("local","upload-result",{originalPhysicalWriteObserved:true,originalResumed:true});this.#current();}else{need(this.#producer!==null,"PRODUCER_REQUIRED");this.#producer.consumeOriginalResume(held.packet);}await this.#b.control("local","resumed",{role:held.role});this.#current();},fail:():void=>{ this.#fail(new Error("INVERSE_NATIVE_DELETE_LOCAL_FAILED")); }});
  await this.#b.control("callback","bind",{});this.#current();
  for(const role of CALLBACK_ROLES){empty.parse(await this.#request("callback",{phase:"inverse-native-delete-publication-callback",lane:"setup",command:{phase:"inverse-native-delete-publication-callback-retire",role,method:"Debugger.removeBreakpoint",params:{breakpointId:this.#b.originalCallbackPoint(role)}}}));}
  for(const role of CALLBACK_ROLES){const site=CALLBACK_SITES[role];await this.#arm("callback",role,site.lineNumber,site.columnNumber,{phase:"inverse-native-delete-publication-callback",lane:"setup",command:{phase:"inverse-native-delete-publication-callback-arm",role,method:"Debugger.setBreakpoint",params:{location:{scriptId:this.#b.scriptId,lineNumber:site.lineNumber,columnNumber:site.columnNumber},condition:""}}});}
  const callbackBinding=Object.freeze({sourceRecords:1 as const,actual:Object.freeze({...this.#b.actual,scriptId:this.#b.scriptId,sessionId:this.#b.sessionId}),originalPoint:(role:CallbackRole):string=>{this.#current();const id=this.#callbackPoints.get(role);need(id!==undefined,"CALLBACK_POINT");return id;},assertCurrent:()=>{ this.#current(); },request:(c:CallbackCommand):Promise<unknown>=>this.#request("callback",c),qualifyHelper:(c:CallbackCommand["command"]):Promise<void>=>{const h=this.#helper;need(h!==null&&"command"in h.origin&&h.origin.command===c,"CALLBACK_HELPER");return this.#qualify(h.origin);},event:async():Promise<unknown>=>{await this.#wait(()=>this.#callbackEvents.length>0);const event=this.#callbackEvents.shift();need(event!==undefined,"CALLBACK_EVENT");return event;},journal:(kind:string,fields:Readonly<Record<string,unknown>>):Promise<void>=>this.#b.journal("callback",kind,fields),control:(phase:string,role?:CallbackRole):Promise<void>=>this.#b.control("callback",phase,role===undefined?{}:{role}),fail:(error:unknown)=>{ this.#fail(error); }});
  this.#callbacks=new CurrentFootprintInverseNativeDeletePublicationCallbacks(callbackBinding);await this.#b.control("callback","ready",{});this.#current();
  this.#timer=new CurrentFootprintInverseNativeDeletePublicationTimer(Object.freeze({actual:Object.freeze({reflection:this.#b.actual.reflection,capture:this.#b.actual.capture,scriptId:this.#b.scriptId}),assertCurrent:():Promise<void>=>{this.#current();return Promise.resolve();},request:(c:TimerCommand):Promise<unknown>=>{const timer=this.#timer;need(timer!==null,"TIMER_REQUIRED");timer.requireRequest(c);if(c.method==="Debugger.setBreakpoint"){const site=TIMER_SITES[c.role];return this.#arm("timer",c.role,site.lineNumber,site.columnNumber,c);}return this.#request("timer",c);},qualifyHelper:(c:TimerCommand):Promise<void>=>this.#qualify(c),originalUploadWritten:():boolean=>this.#b.originalUploadWritten(),requireOriginalCallbacksCompleted:():void=>{this.#current();need(this.#callbacksCompleted,"CALLBACK_JOIN_REQUIRED");},point:(role:string,id:string):void=>{this.#current();need(this.#points.get(id)?.lane==="timer"&&this.#points.get(id)?.role===role,"TIMER_POINT");},fail:(error:unknown)=>{ this.#fail(error); },control:(phase:string,role?:string,ordinal?:number):Promise<void>=>this.#b.control("timer",phase,{...(role===undefined?{}:{role}),...(ordinal===undefined?{}:{ordinal})}),journal:(kind:string,fields:Readonly<Record<string,unknown>>):Promise<void>=>this.#b.journal("timer",kind,fields),assertOriginalGenerationExited:():Promise<void>=>{this.#b.assertOriginalExit();return Promise.resolve();}}));
  await this.#timer.prepare();this.#current();await this.#timer.beforeUpload();this.#current();this.#b.assertOriginalHeld();need(this.#helper===null&&this.#held?.event===this.#b.initialEvent,"SETUP_ORIGINAL");this.#ready=true;
 }
 async #arm(lane:"callback"|"timer",role:string,line:number,column:number,c:CallbackCommand|TimerCommand):Promise<unknown>{
  this.#current();need(this.#arming===null,"ARM_ONCE");this.#arming=Object.freeze({lane,role,line,column,resolved:null});const raw=await this.#request(lane,c);const value=point.parse(raw);const armed=this.#arming;need(armed!==null&&value.actualLocation.scriptId===this.#b.scriptId&&value.actualLocation.lineNumber===line&&value.actualLocation.columnNumber===column&&!this.#points.has(value.breakpointId)&&(armed.resolved===null||armed.resolved===value.breakpointId),"EXACT_POINT");this.#points.set(value.breakpointId,Object.freeze({lane,role}));if(lane==="callback"){this.#callbackPoints.set(z.enum(CALLBACK_ROLES).parse(role),value.breakpointId);}this.#arming=null;return raw;
 }
 public observe(event:DiagnosticEvent):boolean{
  if(this.#data!==null||event.sessionId!==this.#b.sessionId||!["Debugger.scriptParsed","Debugger.breakpointResolved","Debugger.paused","Debugger.resumed"].includes(event.method)){return false;}
  try{this.#current();this.#b.assertOriginalEvent(event);need((this.#events+=1)<=MAX.events,"EVENT_BOUND");
   if(event.method==="Debugger.scriptParsed"){const h=this.#helper;need(h!==null&&h.issued&&!h.attempted&&h.scriptId===null&&event.params["url"]===""&&event.params["executionContextId"]===this.#b.contextId,"FIXED_HELPER_EVENT");h.scriptId=handle.parse(event.params["scriptId"]);return true;}
   if(event.method==="Debugger.breakpointResolved"){const a=this.#arming;const value=z.strictObject({breakpointId:handle,location:z.strictObject({scriptId:z.literal(this.#b.scriptId),lineNumber:z.number().int(),columnNumber:z.number().int()})}).parse(event.params);need(a!==null&&a.resolved===null&&a.line===value.location.lineNumber&&a.column===value.location.columnNumber,"ARM_EVENT");this.#arming=Object.freeze({...a,resolved:value.breakpointId});return true;}
   if(event.method==="Debugger.resumed"){const resume=this.#resuming;need(resume!==null&&this.#held===resume.held&&this.#b.originalUploadWritten(),"ORIGINAL_RESUMED");empty.parse(event.params);this.#held=null;this.#resuming=null;this.#resumes+=1;need(this.#resumes<=MAX.resumes,"RESUME_BOUND");if(resume.held.lane==="callback"){this.#callbackEvents.push(event);}if(resume.held.lane==="timer"){need(this.#timer!==null,"TIMER_REQUIRED");this.#timer.resumed();}// oxlint-disable-next-line unicorn/no-useless-undefined -- This original resume barrier requires its actual fulfillment argument.
 resume.barrier.resolve(undefined);return true;}
   need(this.#started&&this.#held===null&&this.#resuming===null,"SINGLE_HELD");const raw=pause.parse(event.params);const selected=this.#points.get(raw.hitBreakpoints[0]);need(selected!==undefined,"OWN_POINT");this.#held=Object.freeze({event,...selected});const held=this.#held;const prior=this.#tail;this.#tail=(async():Promise<void>=>{await prior;this.#current();need(this.#held===held,"QUEUED_ORIGINAL");await this.#service(held);this.#current();})();const work=this.#tail;void(async():Promise<void>=>{try{await work;}catch(error){this.#fail(error);}})();return true;
  }catch(error){this.#fail(error);throw error;}
 }
 async #service(held:Held):Promise<void>{
  this.#current();if(held.lane==="callback"){need(this.#callbacks!==null,"CALLBACK_REQUIRED");this.#callbackEvents.push(held.event);await this.#callbacks.serviceOriginalHeld();return;}
  if(held.lane==="timer"){need(this.#timer!==null,"TIMER_REQUIRED");this.#timer.paused(held.event.params);await this.#timer.waitForOriginalPauseJoined();return;}
  need(this.#producer!==null&&this.#local!==null,"LOCAL_REQUIRED");const role=z.enum(PRODUCER_ROLES).parse(held.role);const packet=await this.#producer.capture(held.event,role);this.#current();await this.#local.continue(packet.packet);
 }
 public start():Promise<Readonly<CurrentFootprintInverseNativeDeleteFlowData>>{
  if(this.#pending!==null){return this.#pending;}this.#current();need(this.#ready&&!this.#started&&this.#held?.event===this.#b.initialEvent&&this.#local!==null&&this.#initialPacket!==null,"PREPARED_ORIGINAL");this.#b.assertOriginalHeld();this.#b.requireOriginalMainArmed();this.#started=true;const packet=this.#initialPacket;const cursor=this.#local;
  const result=Promise.withResolvers<Readonly<CurrentFootprintInverseNativeDeleteFlowData>>();this.#pending=result.promise;
  void(async():Promise<void>=>{try{await this.#b.journal("local","upload-intent",{originalMainRequestArmed:true,oneOriginalUploadResume:true});this.#current();await this.#b.control("local","ready",{});this.#current();this.#tail=cursor.continue(packet);await this.#tail;await this.#wait(()=>this.#local?.progress().completed===true&&this.#callbacks?.status().originalFinalizersObserved===1&&this.#timer?.status()["timers"]===1);await this.#tail;this.#current();need(this.#held===null&&this.#helper===null&&this.#producer!==null&&this.#callbacks!==null&&this.#timer!==null,"ALL_ORIGINAL_JOINS");this.#producer.requireCompleted();const queue=await this.#callbacks.verifyOriginalQueue();this.#current();need(queue.calls===1&&queue.finalizers===1,"ONE_CALLBACK");this.#callbacksCompleted=true;await this.#b.control("callback","complete",{});await this.#timer.finish();this.#current();
   cursor.requireCompleted();need(this.#resumes===13&&this.#counts.local===22&&this.#counts.producer===23&&this.#counts.callback>=31&&this.#counts.callback<=32&&this.#counts.timer===21&&this.#helpers===42&&this.#requests.length>=139&&this.#requests.length<=140,"COMPLETE_LOCAL_ROSTER");
   const data=Object.freeze({local:cursor.originalCompleted(),originalSingleReadyCallbackJoined:true as const,originalSerialQueueEmpty:true as const,originalNaturalTicketTimerJoined:true as const,actualTimerResumes:3 as const,originalUploadResumeObserved:true as const,cloudUploadCompleted:false as const,mainSqlCompleted:false as const,deleteReturned:false as const,publicationComplete:false as const,saveAuthorized:false as const});await this.#b.journal("local","join-result",{originalCachePutFulfilled:true,originalBufferedCallbackScheduled:true,originalSingleReadyCallbackJoined:true,originalNaturalTicketTimerJoined:true,cloudUploadCompleted:false,mainSqlCompleted:false,deleteReturned:false});this.#current();await this.#b.control("local","complete",{});this.#current();this.#data=data;result.resolve(data);
  }catch(error){this.#fail(error);result.reject(error);}})();return result.promise;
 }
 /** Same original local cursor only. These retained references grant no
  * cloud/request continuation; the new worker owner supplies that authority. */
 public originalLocalReadyForUpload():boolean{this.#current();const state=this.#local?.progress();return state!==undefined&&state.completed&&!state.busy&&!state.failed;}
 public originalLocalCompletedForUpload():LocalCompleted{this.#current();need(this.#local!==null&&this.originalLocalReadyForUpload(),"LOCAL_UPLOAD_RECEIPT");return this.#local.originalCompleted();}
 public requireOriginal(data:Readonly<CurrentFootprintInverseNativeDeleteFlowData>):void{this.#current();need(this.#data===data&&this.#pending!==null&&this.#held===null&&this.#resuming===null,"ORIGINAL_RESULT");}
 public async settleAfterOriginalExit():Promise<void>{this.#b.assertOriginalExit();this.#closed=true;this.#resuming?.barrier.reject(new Error("INVERSE_NATIVE_DELETE_FLOW_ORIGINAL_EXIT"));if(this.#timer!==null){await this.#timer.endAfterOriginalExit();}await Promise.allSettled([this.#prepare,this.#pending,this.#tail,...this.#requests]);this.#b.assertOriginalExit();}
}
Object.freeze(CurrentFootprintInverseNativeDeleteFlowController.prototype);Object.freeze(CurrentFootprintInverseNativeDeleteFlowController);
export function assertOriginalCurrentFootprintInverseNativeDeleteFlowController(value:CurrentFootprintInverseNativeDeleteFlowController):void{need(value!==null&&typeof value==="object"&&!types.isProxy(value)&&originals.has(value)&&Object.getPrototypeOf(value)===CurrentFootprintInverseNativeDeleteFlowController.prototype&&Reflect.ownKeys(value).length===0,"ORIGINAL_CLASS");}
