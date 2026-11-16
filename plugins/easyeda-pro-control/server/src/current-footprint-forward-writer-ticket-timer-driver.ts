/* oxlint-disable unicorn/no-useless-undefined -- Pinned original PromiseWithResolvers<undefined> receipts require their exact explicit settlement. */
/** Three original source-held callbacks. No event label, source match or
 * matching descriptor packet can construct this driver's native origin. */
import {z} from "zod";
// oxlint-disable-next-line import/no-cycle -- Original Core installs this private registry before later driver construction.
import {requireOriginalCurrentFootprintForwardWriterTicketTimerOrigin} from "./current-footprint-forward-writer-ticket-timer-origin.ts";
import type {CurrentFootprintForwardWriterTicketTimerBindings as Bindings,CurrentFootprintForwardWriterTicketTimerOrigin as Origin,CurrentFootprintForwardWriterTicketTimerRole as Role} from "./current-footprint-forward-writer-ticket-timer-origin.ts";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_METHOD_METADATA as METHODS,CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_NATIVE_METADATA as NATIVES,CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_BINDING_PROGRAMS as PROGRAMS,qualifyCurrentFootprintForwardWriterTicketTimerBindingSource} from "./current-footprint-forward-writer-ticket-timer-bindings.ts";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_FLAGS as FLAGS,CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_FRAME_FLAGS as FRAME_FLAGS,CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_SELF_CONDITION as SELF_CONDITION,validateCurrentFootprintForwardWriterTicketTimerCommand} from "./current-footprint-forward-writer-ticket-timer-protocol.ts";
import type {CurrentFootprintForwardWriterTicketTimerCommand as Command} from "./current-footprint-forward-writer-ticket-timer-protocol.ts";
import {currentFootprintForwardWriterTicketTimerFrame,currentFootprintForwardWriterTicketTimerSlotSchema,qualifyCurrentFootprintForwardWriterTicketTimerGuard,qualifyCurrentFootprintForwardWriterTicketTimerMethod,qualifyCurrentFootprintForwardWriterTicketTimerNative} from "./current-footprint-forward-writer-ticket-timer-replies.ts";
import {CURRENT_FOOTPRINT_FORWARD_WRITER_TICKET_TIMER_SITES as SITES} from "./current-footprint-forward-writer-ticket-timer-source.ts";
import {decodeCurrentFootprintCopyClockRpcV2ArrayCapture as arrayCapture,currentFootprintCopyClockRpcV2ArrayObject as arrayObject,decodeCurrentFootprintCopyClockRpcV2Array as arrayProperties} from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import {CURRENT_PCB_209_WORKER_STARTUP_SOURCE} from "./current-pcb-209-worker-startup-profile.ts";
import {captureCurrentPcbStringClockReply} from "./current-pcb-string-clock-reply.ts";

const token=z.string().regex(/^[A-Za-z0-9_.:-]{1,256}$/u);
const yes=z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.literal(true)})});
const empty=z.strictObject({});
const point=z.strictObject({breakpointId:token,actualLocation:z.strictObject({scriptId:token,lineNumber:z.number().int(),columnNumber:z.number().int()})});
const pause=z.looseObject({hitBreakpoints:z.tuple([token])});
const roles=["entry","returned","selfReturned"]as const;
type Receipt=Readonly<{naturalSelfReturnsJoined:true;timers:1|2;executionAuthorized:false}>;
function need(value:boolean,code:string):asserts value{if(!value){throw new Error(`FORWARD_TICKET_TIMER_${code}`);}}
export class CurrentFootprintForwardWriterTicketTimerDriver{
 readonly #origin:Origin;readonly #owner:object;readonly #operation:object;readonly #binding:Bindings;
 readonly #points=new Map<string,Role>();#capture:string|null=null;#roots:string|null=null;#baseline:string|null=null;#entry:string|null=null;
 #setupPending:Promise<void>|null=null;#beforePending:Promise<void>|null=null;#finishPending:Promise<Receipt>|null=null;
 #tail:Promise<void>=Promise.resolve();#active:Readonly<{role:Role;params:unknown}>|null=null;#resumed:ReturnType<typeof Promise.withResolvers<undefined>>|null=null;
 #expected:Command|null=null;#resumeAttempted=false;#ready=false;#before=false;#failed=false;#closed=false;#complete=false;#holds=0;#timers=0;#requests=0;#progress=Promise.withResolvers<undefined>();
 public constructor(origin:Origin,owner:object,operation:object){
  this.#origin=origin;this.#owner=owner;this.#operation=operation;this.#binding=requireOriginalCurrentFootprintForwardWriterTicketTimerOrigin(origin,owner,operation);Object.freeze(this);
 }
 #current():void{need(!this.#failed&&!this.#closed&&requireOriginalCurrentFootprintForwardWriterTicketTimerOrigin(this.#origin,this.#owner,this.#operation)===this.#binding,"ORIGINAL");}
 async #fresh():Promise<void>{this.#current();await this.#binding.assertCurrent();this.#current();}
 #fail(cause:unknown):void{if(!this.#failed){this.#failed=true;this.#binding.fail(cause);this.#resumed?.reject(cause);this.#progress.resolve(undefined);}}
 #call(role:keyof typeof PROGRAMS,args:readonly string[]):Command{return validateCurrentFootprintForwardWriterTicketTimerCommand({phase:"ticket-timer-call",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:this.#binding.actual.reflection,functionDeclaration:PROGRAMS[role],arguments:args.map(objectId=>({objectId})),returnByValue:role==="before"||role==="returned"||role==="selfReturned"||role==="slot"}});}
 #properties(phase:string,objectId:string,role?:string,slot?:number):Command{this.#current();return validateCurrentFootprintForwardWriterTicketTimerCommand({phase,...(role===undefined?{}:{role}),...(slot===undefined?{}:{slot}),method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});}
 async #send(command:Command):Promise<unknown>{
  await this.#fresh();need(this.#expected===null&&this.#requests<61,"REQUEST_BOUND");this.#expected=command;this.#requests+=1;
  try{const raw=await this.#binding.request(command);await this.#fresh();return captureCurrentPcbStringClockReply(raw).value;}finally{this.#expected=null;}
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
  await this.#fresh();qualifyCurrentFootprintForwardWriterTicketTimerBindingSource(this.#binding.actual.source);
  await this.#binding.journal("setup-intent",{sourceSha256:CURRENT_PCB_209_WORKER_STARTUP_SOURCE.sha256,inputSha256:this.#binding.inputSha256,originalReflectionPacketRetained:true});
  await this.#binding.control("bind");this.#capture=arrayCapture(await this.#send(this.#call("capture",[this.#binding.actual.project,this.#binding.actual.dependencies,this.#binding.actual.destinations])),49);
  const members=arrayProperties(await this.#send(this.#properties("ticket-timer-properties",this.#capture,"capture")),49);
  for(const profile of NATIVES){const actual=members.get(String(profile.slot));need(actual!==undefined,"NATIVE_SLOT");const objectId=arrayObject(members,profile.slot);qualifyCurrentFootprintForwardWriterTicketTimerNative(await this.#send(this.#properties("ticket-timer-native",objectId,undefined,profile.slot)),actual,profile);}
  for(const profile of METHODS){const actual=members.get(String(profile.slot));need(actual!==undefined,"METHOD_SLOT");const objectId=arrayObject(members,profile.slot);qualifyCurrentFootprintForwardWriterTicketTimerMethod(await this.#send(this.#properties("ticket-timer-method",objectId,undefined,profile.slot)),actual,profile,this.#binding.actual.scriptId);}
  const guard=members.get("48");need(guard!==undefined,"GUARD_SLOT");const guardObject=arrayObject(members,48);const guardScript=qualifyCurrentFootprintForwardWriterTicketTimerGuard(await this.#send(this.#properties("ticket-timer-guard",guardObject)),guard);
  const source=await this.#send(validateCurrentFootprintForwardWriterTicketTimerCommand({phase:"ticket-timer-guard-source",method:"Debugger.getScriptSource",params:{scriptId:guardScript}}));
  need(z.strictObject({scriptSource:z.literal(`(${PROGRAMS.capture})`)}).safeParse(source).success,"ORIGINAL_GUARD_SCRIPT");
  this.#roots=arrayCapture(await this.#send(this.#call("binding",[this.#capture])),15);this.#baseline=arrayCapture(await this.#send(this.#call("baseline",[this.#roots,this.#capture])),7);
  arrayProperties(await this.#send(this.#properties("ticket-timer-properties",this.#baseline,"baseline")),7);
  for(const role of roles){const site=SITES[role];const parsed=point.parse(await this.#send(validateCurrentFootprintForwardWriterTicketTimerCommand({phase:"ticket-timer-arm",role,method:"Debugger.setBreakpoint",params:{location:{scriptId:this.#binding.actual.scriptId,lineNumber:site.lineNumber,columnNumber:site.columnNumber},...(role==="selfReturned"?{condition:SELF_CONDITION}:{})}})));
   need(parsed.actualLocation.scriptId===this.#binding.actual.scriptId&&parsed.actualLocation.lineNumber===site.lineNumber&&parsed.actualLocation.columnNumber===site.columnNumber&&!this.#points.has(parsed.breakpointId),"EXACT_POINT");this.#points.set(parsed.breakpointId,role);this.#binding.point(role,parsed.breakpointId);
  }
  need(this.#requests===37&&this.#points.size===3,"COMPLETE_SETUP");await this.#binding.control("ready");
  await this.#binding.journal("setup-result",{commands:37,points:3,baselinePublishTimerNull:true,originalSubscribersRetained:true,canvasTimersExcluded:true});await this.#fresh();this.#ready=true;
 }
 public beforeCreate():Promise<void>{
  this.#current();need(this.#ready&&!this.#before&&this.#beforePending===null&&!this.#binding.originalCreateWritten(),"PRECREATE_ONCE");
  const completion=Promise.withResolvers<undefined>();this.#beforePending=completion.promise;
  void(async():Promise<void>=>{try{await this.#binding.journal("precreate-intent",{});need(this.#roots!==null&&this.#baseline!==null&&this.#capture!==null,"SETUP_REQUIRED");
   yes.parse(await this.#send(this.#call("before",[this.#roots,this.#baseline,this.#capture])));await this.#binding.journal("precreate-result",{commands:1,originalBaselineUnchanged:true});await this.#fresh();this.#before=true;completion.resolve(undefined);
  }catch(error){this.#fail(error);completion.reject(error);}})();return completion.promise;
 }
 public acceptsPause(input:unknown):boolean{try{return this.#points.has(pause.parse(input).hitBreakpoints[0]);}catch{return false;}}
 public paused(input:unknown):void{
  try{this.#current();need(this.#before&&this.#binding.originalCreateWritten()&&!this.#complete&&this.#active===null,"ORIGINAL_MUTATION");const id=pause.parse(input).hitBreakpoints[0],role=this.#points.get(id);need(role!==undefined&&role===roles[this.#holds%3]&&this.#holds<6,"NATURAL_ORDER");
   currentFootprintForwardWriterTicketTimerFrame(input,role,id,this.#binding.actual.scriptId);this.#active=Object.freeze({role,params:input});this.#resumeAttempted=false;
   const prior=this.#tail,work=(async():Promise<void>=>{await prior;await this.#service();})();this.#tail=work;void(async():Promise<void>=>{try{await work;}catch(error){this.#fail(error);}})();
  }catch(error){this.#fail(error);}
 }
 public hasActivePause():boolean{return this.#active!==null;}
 public resumed():void{try{this.#current();need(this.#active!==null&&this.#resumeAttempted&&this.#resumed!==null,"ORIGINAL_RESUMED");this.#active=null;this.#holds+=1;this.#resumed.resolve(undefined);}catch(error){this.#fail(error);}}
 async #service():Promise<void>{
  await this.#fresh();const held=this.#active;need(held!==null&&this.#capture!==null&&this.#roots!==null&&this.#baseline!==null,"HELD_REQUIRED");const role=held.role;const ordinal=this.#holds+1;const timerOrdinal=Math.floor(this.#holds/3)+1;
  const id=[...this.#points].find(([,candidate])=>candidate===role)?.[0];need(id!==undefined,"ORIGINAL_POINT");
  const callFrameId=currentFootprintForwardWriterTicketTimerFrame(held.params,role,id,this.#binding.actual.scriptId);
  await this.#binding.journal("timer-intent",{ordinal,timerOrdinal,role});await this.#binding.control("held",role,timerOrdinal);
  const frame=arrayCapture(await this.#send(validateCurrentFootprintForwardWriterTicketTimerCommand({phase:"ticket-timer-frame",role,method:"Debugger.evaluateOnCallFrame",params:{...FRAME_FLAGS,callFrameId,expression:SITES[role].expression}})),role==="selfReturned"?2:1);
  if(role==="entry"){this.#entry=arrayCapture(await this.#send(this.#call(role,[frame,this.#roots,this.#baseline,this.#capture])),8);arrayProperties(await this.#send(this.#properties("ticket-timer-properties",this.#entry,"entry")),8);}
  else{need(this.#entry!==null,"ENTRY_RETAINED");yes.parse(await this.#send(this.#call(role,[frame,this.#roots,this.#entry,this.#capture])));}
  const barrier=Promise.withResolvers<undefined>();this.#resumed=barrier;void(async():Promise<void>=>{try{await barrier.promise;}catch{
   // The original service and exit retain this same rejection.
  }})();
  empty.parse(await this.#send(validateCurrentFootprintForwardWriterTicketTimerCommand({phase:"ticket-timer-resume",role,method:"Debugger.resume",params:{}})));
  await barrier.promise;await this.#fresh();need(this.#active===null,"RESUMED_REQUIRED");this.#resumed=null;if(role==="selfReturned"){this.#timers+=1;this.#entry=null;}
  await this.#binding.journal("timer-result",{ordinal,timerOrdinal,role,commands:role==="entry"?4:3,originalResumed:true});await this.#fresh();const progress=this.#progress;this.#progress=Promise.withResolvers<undefined>();progress.resolve(undefined);
 }
 public finish():Promise<Receipt>{
  this.#current();need(this.#before&&this.#finishPending===null,"FINISH_ONCE");this.#binding.requireOriginalCallbacksCompleted();const completion=Promise.withResolvers<Receipt>();this.#finishPending=completion.promise;
  void(async():Promise<void>=>{try{completion.resolve(await this.#finish());}catch(error){this.#fail(error);completion.reject(error);}})();return completion.promise;
 }
 async #finish():Promise<Receipt>{
  await this.#binding.journal("quiesce-intent",{});let queries=0;
  for(;queries<3;){await this.#tail;await this.#fresh();this.#binding.requireOriginalCallbacksCompleted();need(this.#active===null&&this.#roots!==null&&this.#baseline!==null&&this.#capture!==null,"QUIESCE_BOUNDARY");
   const snapshot=currentFootprintForwardWriterTicketTimerSlotSchema.parse(await this.#send(this.#call("slot",[this.#roots,this.#baseline,this.#capture])));queries+=1;
   if(snapshot.result.value.timer===null){need(this.#active===null&&this.#holds===3*this.#timers&&(this.#timers===1||this.#timers===2),"ORIGINAL_SELF_RETURN_REQUIRED");
    await this.#binding.journal("quiesce-result",{commands:queries,timers:this.#timers,publishTimerNull:true,originalParserAndPostSyncReturned:true,originalCallbacksJoined:true});
    await this.#binding.control("complete");await this.#fresh();const receipt=Object.freeze({naturalSelfReturnsJoined:true as const,timers:this.#timers,executionAuthorized:false as const});await this.#binding.journal("complete",{timers:this.#timers,naturalSelfReturnsJoined:true,executionAuthorized:false});this.#complete=true;return receipt;
   }
   // Keep the exact natural-progress waits. Original same-worker events and
   // Original Job exit own their settlement; no app timer is invoked here.
   const target=this.#timers+1;const deadline=Promise.withResolvers<never>();
   const timer=setTimeout(()=>{deadline.reject(new Error("FORWARD_TICKET_TIMER_NATURAL_DEADLINE"));},20_000);
   try{for(let wait=0;this.#timers<target&&wait<3;wait+=1){const progress=this.#progress.promise;await this.#binding.pump();await this.#fresh();if(this.#timers<target){await Promise.race([progress,deadline.promise]);await this.#fresh();}}}
   finally{clearTimeout(timer);}need(this.#timers>=target,"NATURAL_PROGRESS");

  }throw new Error("FORWARD_TICKET_TIMER_QUIESCE_BOUND");
 }
 public async endAfterOriginalExit():Promise<void>{
  need(!this.#closed,"EXIT_ONCE");await this.#binding.assertOriginalGenerationExited();this.#closed=true;this.#progress.resolve(undefined);this.#resumed?.reject(new Error("FORWARD_TICKET_TIMER_ORIGINAL_EXIT"));
  await Promise.allSettled([this.#tail,...[this.#setupPending,this.#beforePending,this.#finishPending].filter((value):value is Promise<void>|Promise<Receipt>=>value!==null)]);
  this.#active=null;this.#resumed=null;
 }
 public status():Readonly<Record<string,unknown>>{return Object.freeze({ready:this.#ready,beforeCreate:this.#before,holds:this.#holds,timers:this.#timers,requests:this.#requests,complete:this.#complete,failed:this.#failed,closed:this.#closed,executionAuthorized:false});}
}
Object.freeze(CurrentFootprintForwardWriterTicketTimerDriver.prototype);Object.freeze(CurrentFootprintForwardWriterTicketTimerDriver);
