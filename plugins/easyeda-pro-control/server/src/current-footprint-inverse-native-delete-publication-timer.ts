/* oxlint-disable unicorn/no-useless-undefined -- Retain the exact original undefined barriers through request and exit settlement. */
/** Natural original DEL timer, with no conditional predicate evaluation. */
import {z} from "zod";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_PUBLICATION_TIMER_PROGRAMS as PROGRAMS} from "./current-footprint-inverse-native-delete-publication-timer-programs.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_PUBLICATION_TIMER_FLAGS as FLAGS,validateCurrentFootprintInverseNativeDeletePublicationTimerCommand} from "./current-footprint-inverse-native-delete-publication-timer-protocol.ts";
import type {CurrentFootprintInverseNativeDeletePublicationTimerCommand as Command} from "./current-footprint-inverse-native-delete-publication-timer-protocol.ts";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_SITES as SITES} from "./current-footprint-forward-writer-ticket-timer-source.ts";
import {decodeCurrentFootprintCopyClockRpcV2ArrayCapture as arrayCapture,decodeCurrentFootprintCopyClockRpcV2Array as arrayProperties} from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import {captureCurrentPcbStringClockReply} from "./current-pcb-string-clock-reply.ts";
import {currentFootprintInverseNativeDeletePublicationTimerFrame,currentFootprintInverseNativeDeletePublicationTimerSlotSchema} from "./current-footprint-inverse-native-delete-publication-timer-replies.ts";

type Role="entry"|"returned"|"selfReturned";
export interface CurrentFootprintInverseNativeDeletePublicationTimerBindings{
 readonly actual:Readonly<{reflection:string;capture:string;scriptId:string}>;readonly assertCurrent:()=>Promise<void>;
 readonly request:(command:Command)=>Promise<unknown>;readonly qualifyHelper:(command:Command)=>Promise<void>;
 readonly originalUploadWritten:()=>boolean;readonly requireOriginalCallbacksCompleted:()=>void;
 readonly point:(role:Role,id:string)=>void;readonly fail:(error:unknown)=>void;
 readonly control:(phase:"bind"|"ready"|"held"|"resumed"|"complete",role?:Role,ordinal?:number)=>Promise<void>;
 readonly journal:(kind:string,fields:Readonly<Record<string,unknown>>)=>Promise<void>;readonly assertOriginalGenerationExited:()=>Promise<void>;
}
type Bindings=CurrentFootprintInverseNativeDeletePublicationTimerBindings;
const FRAME_FLAGS={objectGroup:FLAGS.objectGroup,silent:true,generatePreview:false,throwOnSideEffect:true,returnByValue:false,includeCommandLineAPI:false}as const;

const token=z.string().regex(/^[A-Za-z0-9_.:-]{1,256}$/u);
const yes=z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.literal(true)})});
const empty=z.strictObject({});
const point=z.strictObject({breakpointId:token,actualLocation:z.strictObject({scriptId:token,lineNumber:z.number().int(),columnNumber:z.number().int()})});
const pause=z.looseObject({hitBreakpoints:z.tuple([token])});
const roles=["entry","returned","selfReturned"]as const;
type Receipt=Readonly<{naturalSelfReturnsJoined:true;timers:1;executionAuthorized:false}>;
function need(value:boolean,code:string):asserts value{if(!value){throw new Error(`INVERSE_NATIVE_DELETE_PUBLICATION_TIMER_${code}`);}}
export class CurrentFootprintInverseNativeDeletePublicationTimer{
 readonly #binding:Bindings;
 readonly #points=new Map<string,Role>();#capture:string|null=null;#roots:string|null=null;#baseline:string|null=null;#entry:string|null=null;
 #setupPending:Promise<void>|null=null;#beforePending:Promise<void>|null=null;#finishPending:Promise<Receipt>|null=null;
 #tail:Promise<void>=Promise.resolve();#active:Readonly<{role:Role;params:unknown}>|null=null;#resumed:ReturnType<typeof Promise.withResolvers<undefined>>|null=null;
 #expected:Command|null=null;#resumeAttempted=false;#ready=false;#before=false;#failed=false;#closed=false;#complete=false;#holds=0;#timers=0;#requests=0;#progress=Promise.withResolvers<undefined>();
 public constructor(binding:Bindings){this.#binding=binding;need(Object.isFrozen(binding),"ORIGINAL_BINDING");Object.freeze(this);}
 #current():void{need(!this.#failed&&!this.#closed,"ORIGINAL");}
 async #fresh():Promise<void>{this.#current();await this.#binding.assertCurrent();this.#current();}
 #fail(cause:unknown):void{if(!this.#failed){this.#failed=true;this.#binding.fail(cause);this.#resumed?.reject(cause);this.#progress.resolve(undefined);}}
 #call(role:keyof typeof PROGRAMS,args:readonly string[]):Command{return validateCurrentFootprintInverseNativeDeletePublicationTimerCommand({phase:"inverse-native-delete-publication-timer-call",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:this.#binding.actual.reflection,functionDeclaration:PROGRAMS[role],arguments:args.map(objectId=>({objectId})),returnByValue:role==="before"||role==="returned"||role==="selfReturned"||role==="slot"}});}
 #properties(phase:string,objectId:string,role?:string):Command{this.#current();return validateCurrentFootprintInverseNativeDeletePublicationTimerCommand({phase,...(role===undefined?{}:{role}),method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});}
 async #send(command:Command):Promise<unknown>{
  await this.#fresh();need(this.#expected===null&&this.#requests<21,"REQUEST_BOUND");this.#expected=command;this.#requests+=1;
  try{const raw=await this.#binding.request(command);await this.#fresh();if(command.method==="Runtime.callFunctionOn"||command.method==="Debugger.evaluateOnCallFrame"){await this.#binding.qualifyHelper(command);await this.#fresh();}return captureCurrentPcbStringClockReply(raw).value;}finally{this.#expected=null;}
 }
 /** The original Core request closure must consume exactly this object before
  * dispatch. A reconstructed equal command does not acquire its pause. */
 public requireRequest(command:Command):void{this.#current();need(this.#expected===command,"ORIGINAL_COMMAND");const held=this.#active;
  if(command.method==="Debugger.resume"){need(held!==null&&command.role===held.role&&!this.#resumeAttempted,"RESUME_ONCE");this.#resumeAttempted=true;}
 }
 public prepare():Promise<void>{
  this.#current();need(this.#setupPending===null,"SETUP_ONCE");const completion=Promise.withResolvers<undefined>();this.#setupPending=completion.promise;
  void(async():Promise<void>=>{try{await this.#prepare();completion.resolve(undefined);}catch(error){this.#fail(error);completion.reject(error);}})();return completion.promise;
 }
 async #prepare():Promise<void>{
  await this.#fresh();await this.#binding.journal("setup-intent",{originalPreflightRetained:true,alreadyIncrementedMaximum:true,conditionalPredicates:0});
  await this.#binding.control("bind");this.#capture=this.#binding.actual.capture;
  this.#roots=arrayCapture(await this.#send(this.#call("binding",[this.#capture])),15);this.#baseline=arrayCapture(await this.#send(this.#call("baseline",[this.#roots,this.#capture])),7);
  arrayProperties(await this.#send(this.#properties("inverse-native-delete-publication-timer-properties",this.#baseline,"baseline")),7);
  for(const role of["entry","returned"]as const){await this.#arm(role);}
  need(this.#requests===5&&this.#points.size===2,"COMPLETE_SETUP");await this.#binding.control("ready");
  await this.#binding.journal("setup-result",{commands:5,points:2,baselinePublishTimerNull:true,selfReturnNotArmed:true});await this.#fresh();this.#ready=true;
 }
 async #arm(role:Role):Promise<void>{
  await this.#fresh();const site=SITES[role];const parsed=point.parse(await this.#send(validateCurrentFootprintInverseNativeDeletePublicationTimerCommand({phase:"inverse-native-delete-publication-timer-arm",role,method:"Debugger.setBreakpoint",params:{location:{scriptId:this.#binding.actual.scriptId,lineNumber:site.lineNumber,columnNumber:site.columnNumber},condition:""}})));
  need(parsed.actualLocation.scriptId===this.#binding.actual.scriptId&&parsed.actualLocation.lineNumber===site.lineNumber&&parsed.actualLocation.columnNumber===site.columnNumber&&!this.#points.has(parsed.breakpointId),"EXACT_POINT");this.#points.set(parsed.breakpointId,role);this.#binding.point(role,parsed.breakpointId);
 }
 public beforeUpload():Promise<void>{
  this.#current();need(this.#ready&&!this.#before&&this.#beforePending===null&&!this.#binding.originalUploadWritten(),"PREUPLOAD_ONCE");
  const completion=Promise.withResolvers<undefined>();this.#beforePending=completion.promise;
  void(async():Promise<void>=>{try{await this.#binding.journal("preupload-intent",{});need(this.#roots!==null&&this.#baseline!==null&&this.#capture!==null,"SETUP_REQUIRED");
   yes.parse(await this.#send(this.#call("before",[this.#roots,this.#baseline,this.#capture])));await this.#binding.journal("preupload-result",{commands:1,originalBaselineUnchanged:true});await this.#fresh();this.#before=true;completion.resolve(undefined);
  }catch(error){this.#fail(error);completion.reject(error);}})();return completion.promise;
 }
 public acceptsPause(input:unknown):boolean{try{return this.#points.has(pause.parse(input).hitBreakpoints[0]);}catch{return false;}}
 public paused(input:unknown):void{
  try{this.#current();need(this.#before&&this.#binding.originalUploadWritten()&&!this.#complete&&this.#active===null,"ORIGINAL_MUTATION");const id=pause.parse(input).hitBreakpoints[0],role=this.#points.get(id);need(role!==undefined&&role===roles[this.#holds%3]&&this.#holds<3,"NATURAL_ORDER");
   currentFootprintInverseNativeDeletePublicationTimerFrame(input,role,id,this.#binding.actual.scriptId);this.#active=Object.freeze({role,params:input});this.#resumeAttempted=false;
   const prior=this.#tail,work=(async():Promise<void>=>{await prior;await this.#service();})();this.#tail=work;void(async():Promise<void>=>{try{await work;}catch(error){this.#fail(error);}})();
  }catch(error){this.#fail(error);}
 }
 public hasActivePause():boolean{return this.#active!==null;}
 public async waitForOriginalPauseJoined():Promise<void>{this.#current();await this.#tail;await this.#fresh();need(this.#active===null,"PAUSE_JOIN_REQUIRED");}
 public resumed():void{try{this.#current();need(this.#active!==null&&this.#resumeAttempted&&this.#resumed!==null,"ORIGINAL_RESUMED");this.#active=null;this.#holds+=1;this.#resumed.resolve(undefined);}catch(error){this.#fail(error);}}
 async #service():Promise<void>{
  await this.#fresh();const held=this.#active;need(held!==null&&this.#capture!==null&&this.#roots!==null&&this.#baseline!==null,"HELD_REQUIRED");const role=held.role;const ordinal=this.#holds+1;const timerOrdinal=Math.floor(this.#holds/3)+1;
  const id=[...this.#points].find(([,candidate])=>candidate===role)?.[0];need(id!==undefined,"ORIGINAL_POINT");
  const callFrameId=currentFootprintInverseNativeDeletePublicationTimerFrame(held.params,role,id,this.#binding.actual.scriptId);
  await this.#binding.journal("timer-intent",{ordinal,timerOrdinal,role});await this.#binding.control("held",role,timerOrdinal);
  const frame=arrayCapture(await this.#send(validateCurrentFootprintInverseNativeDeletePublicationTimerCommand({phase:"inverse-native-delete-publication-timer-frame",role,method:"Debugger.evaluateOnCallFrame",params:{...FRAME_FLAGS,callFrameId,expression:SITES[role].expression}})),role==="selfReturned"?2:1);
  if(role==="entry"){this.#entry=arrayCapture(await this.#send(this.#call(role,[frame,this.#roots,this.#baseline,this.#capture])),8);arrayProperties(await this.#send(this.#properties("inverse-native-delete-publication-timer-properties",this.#entry,"entry")),8);await this.#arm("selfReturned");}
  else{need(this.#entry!==null,"ENTRY_RETAINED");yes.parse(await this.#send(this.#call(role,[frame,this.#roots,this.#entry,this.#capture])));}
  if(role==="selfReturned"){for(const [breakpointId,ownedRole]of this.#points){empty.parse(await this.#send(validateCurrentFootprintInverseNativeDeletePublicationTimerCommand({phase:"inverse-native-delete-publication-timer-remove",role:ownedRole,method:"Debugger.removeBreakpoint",params:{breakpointId}})));}}
  const barrier=Promise.withResolvers<undefined>();this.#resumed=barrier;void(async():Promise<void>=>{try{await barrier.promise;}catch{
   // The original service and exit retain this same rejection.
  }})();
  empty.parse(await this.#send(validateCurrentFootprintInverseNativeDeletePublicationTimerCommand({phase:"inverse-native-delete-publication-timer-resume",role,method:"Debugger.resume",params:{}})));
  await barrier.promise;await this.#fresh();need(this.#active===null,"RESUMED_REQUIRED");this.#resumed=null;if(role==="selfReturned"){this.#timers+=1;this.#entry=null;}
  await this.#binding.control("resumed",role,timerOrdinal);await this.#fresh();const commands={entry:5,returned:3,selfReturned:6};await this.#binding.journal("timer-result",{ordinal,timerOrdinal,role,commands:commands[role],originalResumed:true});await this.#fresh();const progress=this.#progress;this.#progress=Promise.withResolvers<undefined>();progress.resolve(undefined);
 }
 public finish():Promise<Receipt>{
  this.#current();need(this.#before&&this.#finishPending===null,"FINISH_ONCE");this.#binding.requireOriginalCallbacksCompleted();const completion=Promise.withResolvers<Receipt>();this.#finishPending=completion.promise;
  void(async():Promise<void>=>{try{completion.resolve(await this.#finish());}catch(error){this.#fail(error);completion.reject(error);}})();return completion.promise;
 }
 async #finish():Promise<Receipt>{
  await this.#binding.journal("quiesce-intent",{});await this.#tail;await this.#fresh();this.#binding.requireOriginalCallbacksCompleted();
  need(this.#active===null&&this.#roots!==null&&this.#baseline!==null&&this.#capture!==null&&this.#holds===3&&this.#timers===1,"ORIGINAL_SELF_RETURN_REQUIRED");
  const snapshot=currentFootprintInverseNativeDeletePublicationTimerSlotSchema.parse(await this.#send(this.#call("slot",[this.#roots,this.#baseline,this.#capture])));
  need(snapshot.result.value.timer===null&&this.#requests===21,"ORIGINAL_TIMER_SLOT");await this.#binding.journal("quiesce-result",{commands:1,timers:1,publishTimerNull:true,originalCallbacksJoined:true});await this.#fresh();await this.#binding.control("complete");await this.#fresh();this.#complete=true;return Object.freeze({naturalSelfReturnsJoined:true,timers:1,executionAuthorized:false});
 }
 public async endAfterOriginalExit():Promise<void>{
  need(!this.#closed,"EXIT_ONCE");await this.#binding.assertOriginalGenerationExited();this.#closed=true;this.#progress.resolve(undefined);this.#resumed?.reject(new Error("INVERSE_NATIVE_DELETE_PUBLICATION_TIMER_ORIGINAL_EXIT"));
  await Promise.allSettled([this.#tail,...[this.#setupPending,this.#beforePending,this.#finishPending].filter((value):value is Promise<void>|Promise<Receipt>=>value!==null)]);
  this.#active=null;this.#resumed=null;
 }
 public status():Readonly<Record<string,unknown>>{return Object.freeze({ready:this.#ready,beforeUpload:this.#before,holds:this.#holds,timers:this.#timers,requests:this.#requests,complete:this.#complete,failed:this.#failed,closed:this.#closed,executionAuthorized:false});}
}
Object.freeze(CurrentFootprintInverseNativeDeletePublicationTimer.prototype);Object.freeze(CurrentFootprintInverseNativeDeletePublicationTimer);
