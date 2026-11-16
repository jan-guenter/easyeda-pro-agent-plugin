/** Original V4 native DEL caller. Every point is armed before Clock resumes;
 * no completed drain, JSON shape or old GET owner can create this custody. */
import{types}from"node:util";
import{performance}from"node:perf_hooks";
import{z}from"zod";
import type{DiagnosticEvent}from"./current-pcb-diagnostic-protocol.ts";
import{collectCurrentFootprintInverseNativeDeleteCaller as collect}from"./current-footprint-inverse-native-delete-caller-collector.ts";
import type{CurrentFootprintInverseNativeDeleteCallerPreparationBindings as Preparation,CurrentFootprintInverseNativeDeleteCallerPrepared as Prepared}from"./current-footprint-inverse-native-delete-caller-collector.ts";
import{CurrentFootprintInverseNativeDeleteCallerCursor as Cursor}from"./current-footprint-inverse-native-delete-caller-cursor.ts";
import type{CurrentFootprintInverseNativeDeleteCallerCursorBindings as CursorBindings,CurrentFootprintInverseNativeDeleteCallerHeld as Held}from"./current-footprint-inverse-native-delete-caller-cursor.ts";
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CALLER_REQUESTS as MAX}from"./current-footprint-inverse-native-delete-caller-budget.ts";
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CALLER_ROLES as ROLES,currentFootprintInverseNativeDeleteCallerCondition as condition,currentFootprintInverseNativeDeleteCallerProgram as program,currentFootprintInverseNativeDeleteCallerRealm as realmFor,currentFootprintInverseNativeDeleteCallerSite as site,validateCurrentFootprintInverseNativeDeleteCallerCommand as validate}from"./current-footprint-inverse-native-delete-caller-protocol.ts";
import type{CurrentFootprintInverseNativeDeleteCallerCommand as Command,CurrentFootprintInverseNativeDeleteCallerRole as Role}from"./current-footprint-inverse-native-delete-caller-protocol.ts";

type Realm="worker"|"ui";type Phase="bind"|"ready"|"held"|"resumed"|"preupload-ready"|"return-armed"|"complete";
const workerOrder=["returned","serviceReturn","success","successReturn"];const uiOrder=["innerSubscribe","innerRpc","managerReturned","handlerReturned","outerCallback","outerReturned"];
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);const location=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});const empty=z.strictObject({});
const frame=z.looseObject({callFrameId:handle,functionName:z.string(),functionLocation:location,location,returnValue:z.unknown().optional()});
const pause=z.looseObject({reason:z.literal("other"),hitBreakpoints:z.tuple([handle]),callFrames:z.array(frame).min(1).max(32)});
interface Helper{readonly command:Command;issued:boolean;attempted:boolean;scriptId:string|null}
interface Resume{readonly held:Held;readonly barrier:ReturnType<typeof Promise.withResolvers<null>>;attempted:boolean;observed:boolean}
interface Arming{readonly role:Role;resolved:string|null}
export interface CurrentFootprintInverseNativeDeleteCallerBindings extends Omit<Preparation,"request">,Pick<CursorBindings,"workerUuid"|"managerProject"|"managerSelected"|"originalInnerDelete"|"beforeWorkerPublish">{
 readonly targetUuid:string;readonly scripts:Readonly<{worker:string;ui:string;manager:string}>;readonly sessions:Readonly<Record<Realm,string>>;readonly contexts:Readonly<Record<Realm,number>>;
 readonly assertOriginalEvent:(event:DiagnosticEvent)=>void;readonly assertOriginalHeld:()=>void;readonly assertOriginalExit:()=>void;
 readonly originalClockWorkerFrontier:()=>Promise<void>;
 readonly send:(command:Command,beforeTransfer:()=>void)=>Promise<unknown>;readonly poll:()=>Promise<void>;
 readonly control:(phase:Phase,fields?:Readonly<Record<string,string>>)=>Promise<void>;
 readonly requireOriginalDrainFinished:()=>Promise<void>;readonly joinOriginalConditionRouter:()=>Promise<void>;
 readonly fail:(cause:unknown)=>void;
}
export interface CurrentFootprintInverseNativeDeleteCallerData{
 readonly profile:"private.current-footprint-inverse-native-delete-caller-data.v1";
 readonly originalWorkerHandlerPromiseJoined:true;readonly originalWorkerSuccessCallbackReturned:true;
 readonly originalTrustedReplyJoined:true;readonly originalManagerReturnsJoined:true;readonly originalUiCallbackReturned:true;
 readonly originalInnerAndRacePromisesJoined:true;readonly originalNativeTaskResult:true;readonly originalDrainJoined:true;
 readonly publicSdkParity:false;readonly preferencesVerified:false;readonly persistenceVerified:false;readonly coldAbsenceVerified:false;readonly wholeInverseVerified:false;
 readonly requests:number;readonly sourceCandidates:number;readonly resumes:10;
}
function need(v:boolean,code:string):asserts v{if(!v){throw new Error(`INVERSE_NATIVE_DELETE_CALLER_${code}`);}}
const originals=new WeakSet<object>();
export class CurrentFootprintInverseNativeDeleteCallerController{
 readonly #b:CurrentFootprintInverseNativeDeleteCallerBindings;readonly #points=new Map<Role,string>();readonly #removed=new Set<Role>();
 readonly #requests:Promise<unknown>[]=[];readonly #controls:Promise<void>[]=[];readonly #conditions:Readonly<{event:DiagnosticEvent;text:string}>[]=[];
 readonly #helpers:Record<Realm,Helper|null>={worker:null,ui:null};readonly #reading={worker:false,ui:false};
 readonly #held:Record<Realm,Held|null>={worker:null,ui:null};readonly #resume:Record<Realm,Resume|null>={worker:null,ui:null};
 readonly #arming:Record<Realm,Arming|null>={worker:null,ui:null};readonly #work:Record<Realm,Promise<void>>={worker:Promise.resolve(),ui:Promise.resolve()};
 readonly #successHeld=Promise.withResolvers<undefined>();
 readonly #steps={worker:0,ui:0};readonly #resumes={worker:0,ui:0};readonly #finished={worker:false,ui:false};
 #completion:Promise<Readonly<CurrentFootprintInverseNativeDeleteCallerData>>|null=null;
 #prepare:Promise<void>|null=null;#run:ReturnType<typeof Promise.withResolvers<Readonly<CurrentFootprintInverseNativeDeleteCallerData>>>|null=null;#final:Promise<void>|null=null;
 #prepared:Prepared|null=null;#cursor:Cursor|null=null;#started=false;#ended=false;#failed=false;#cause:unknown;#preupload=false;
 #normal=0;#helperCount=0;#cleanup=0;#events=0;#sourceCandidates=0;#data:Readonly<CurrentFootprintInverseNativeDeleteCallerData>|null=null;
 public constructor(bindings:CurrentFootprintInverseNativeDeleteCallerBindings){this.#b=Object.freeze({...bindings});originals.add(this);void this.#handled(this.#successHeld.promise);Object.freeze(this);}
 #current():void{if(this.#failed){throw this.#cause;}this.#b.current();need(!this.#ended,"ENDED");}
 #fail(cause:unknown):void{if(!this.#failed){this.#failed=true;this.#cause=cause;this.#successHeld.reject(cause);for(const pending of Object.values(this.#resume)){pending?.barrier.reject(cause);}this.#run?.reject(cause);try{this.#b.fail(cause);}catch{
 // Original failure identity survives even a failed cleanup handoff.
 }}}
 async #handled(pending:Promise<unknown>):Promise<void>{try{await pending;}catch(error){this.#fail(error);}}
 async #control(phase:Phase,fields:Readonly<Record<string,string>>={}):Promise<void>{this.#current();need(this.#controls.length<MAX.controls,"CONTROL_BOUND");const pending=this.#b.control(phase,fields);need(types.isPromise(pending),"ORIGINAL_CONTROL");this.#controls.push(pending);await pending;this.#current();}
 async #send(c:Command,before?:()=>void):Promise<unknown>{this.#current();const raw=this.#b.send(c,():void=>{this.#current();const h=this.#helpers[c.realm];if(program(c)!==null){need(h!==null&&h.command===c&&!h.issued,"HELPER_WRITE");h.issued=true;}before?.();});need(types.isPromise(raw)&&this.#requests.length<MAX.cdpRequests,"ORIGINAL_REQUEST");this.#requests.push(raw);const value=await raw;this.#current();return value;}
 async #read(input:Command):Promise<unknown>{this.#current();const c=validate(input);const realm=c.realm;need(!this.#reading[realm]&&this.#helpers[realm]===null,"SINGLE_READER");this.#reading[realm]=true;
  try{if(c.method==="Debugger.removeBreakpoint"){need((this.#cleanup+=1)<=MAX.cleanup,"CLEANUP_BOUND");}else{need((this.#normal+=1)<=MAX.normal,"NORMAL_BOUND");}
   if(program(c)!==null){this.#helpers[realm]={command:c,issued:false,attempted:false,scriptId:null};}const raw=await this.#send(c);
   if(program(c)!==null){const h=this.#helpers[realm];need(h!==null&&h.command===c&&h.issued&&!h.attempted&&h.scriptId!==null,"HELPER_SOURCE");h.attempted=true;need("role"in c,"HELPER_ROLE");
    const helper=validate({phase:"inverse-native-delete-caller-helper",realm,role:c.method==="Runtime.callFunctionOn"&&"kind"in c?`call-${c.kind}-${c.role}-${String(c.slot)}`:`frame-${c.role}`,method:"Debugger.getScriptSource",params:{scriptId:h.scriptId}});
    z.strictObject({scriptSource:z.literal(program(c))}).parse(await this.#send(helper));need((this.#helperCount+=1)<=MAX.helpers,"HELPER_BOUND");this.#helpers[realm]=null;}
   return raw;
  }catch(error){this.#fail(error);throw error;}finally{this.#reading[realm]=false;}
 }
 public hasOriginalIssuedHelper(event:DiagnosticEvent):boolean{const realm=this.#realm(event);if(realm===null||event.method!=="Debugger.scriptParsed"){return false;}const h=this.#helpers[realm];return h!==null&&h.issued&&!h.attempted&&h.scriptId===null;}
 #realm(event:DiagnosticEvent):Realm|null{if(event.sessionId===this.#b.sessions.worker){return"worker";}return event.sessionId===this.#b.sessions.ui?"ui":null;}
 public ownsOriginalCondition(text:string,realm:Realm):boolean{this.#current();if(realm==="ui"){return text===condition("managerReturned",this.#targetUuid());}const reply=this.#b.forwarded.replyTopic;return ROLES.some(role=>realmFor(role)==="worker"&&condition(role,["returned","success","successReturn","failure"].includes(role)?reply:undefined)===text);}
 #targetUuid():string{const match=this.#b.sender.replyTopic.startsWith('_MSG_BUS_RPC_-');need(match,"SENDER_REPLY");return this.#b.targetUuid;}
 public requestOriginalConditionSource(event:DiagnosticEvent,ordinal:number):Promise<unknown>{this.#current();this.#b.assertOriginalEvent(event);const realm=this.#realm(event);need(realm!==null&&ordinal===this.#sourceCandidates&&ordinal<MAX.candidateSources,"CONDITION_ORDINAL");this.#sourceCandidates+=1;need((this.#normal+=1)<=MAX.normal,"CONDITION_BOUND");return this.#send(validate({phase:"inverse-native-delete-caller-condition",realm,slot:ordinal,method:"Debugger.getScriptSource",params:{scriptId:handle.parse(event.params["scriptId"])}}),():void=>{this.#b.assertOriginalEvent(event);});}
 public retainOriginalCondition(event:DiagnosticEvent,text:string):void{this.#current();this.#b.assertOriginalEvent(event);const realm=this.#realm(event);need(realm!==null&&this.ownsOriginalCondition(text,realm)&&this.#conditions.length<8&&!this.#conditions.some(row=>row.event===event),"CONDITION_SOURCE");this.#conditions.push(Object.freeze({event,text}));}
 #script(role:Role):string{if(realmFor(role)==="worker"){return this.#b.scripts.worker;}return role==="outerCallback"||role==="outerReturned"?this.#b.scripts.ui:this.#b.scripts.manager;}
 async #arm(role:Role,functionId?:string):Promise<void>{
  this.#current();const realm=realmFor(role);const at=site(role);need(this.#arming[realm]===null&&!this.#points.has(role),"ARM_ONCE");this.#arming[realm]={role,resolved:null};
  let value:string|undefined;if(["returned","success","successReturn","failure"].includes(role)){value=this.#b.forwarded.replyTopic;}else if(role==="managerReturned"||role==="handlerReturned"){value=this.#targetUuid();}
  const command=functionId===undefined?validate({phase:"inverse-native-delete-caller-arm",realm,role,method:"Debugger.setBreakpoint",params:{location:{scriptId:this.#script(role),lineNumber:at.lineNumber,columnNumber:at.columnNumber},condition:condition(role,value)}}):validate({phase:"inverse-native-delete-caller-function",realm,role,method:"Debugger.setBreakpointOnFunctionCall",params:{objectId:functionId,condition:""}});
  const raw=z.strictObject({breakpointId:handle,actualLocation:location.optional()}).parse(await this.#read(command));const arming=this.#arming[realm];need(arming!==null&&arming.role===role&&!this.#points.has(role)&&![...this.#points.values()].includes(raw.breakpointId)&&(arming.resolved===null||arming.resolved===raw.breakpointId),"POINT_REPLY");
  if(command.phase==="inverse-native-delete-caller-arm"){need(raw.actualLocation?.scriptId===command.params.location.scriptId&&raw.actualLocation.lineNumber===at.lineNumber&&raw.actualLocation.columnNumber===at.columnNumber,"POINT_LOCATION");}
  this.#points.set(role,raw.breakpointId);this.#arming[realm]=null;
 }
 public prepare():Promise<void>{need(this.#prepare===null,"PREPARE_ONCE");const out=Promise.withResolvers<undefined>();this.#prepare=out.promise;void(async():Promise<void>=>{try{this.#current();this.#b.assertOriginalHeld();await this.#control("bind",{workerScript:this.#b.scripts.worker,uiScript:this.#b.scripts.ui,managerScript:this.#b.scripts.manager});
  const prepared=await collect({...this.#b,request:(c):Promise<unknown>=>this.#read(c)});this.#current();this.#prepared=prepared;
  this.#cursor=new Cursor({...this.#b,prepared,request:(c):Promise<unknown>=>this.#read(c)});
  for(const role of["returned","serviceReturn","success","successReturn","failure","outerFailure","managerReturned","handlerReturned"]as const){await this.#arm(role);}
  for(const[role,id]of[["innerSubscribe",prepared.innerFunction],["innerRpc",prepared.rpcFunction],["outerCallback",prepared.outerFunction]]as const){await this.#arm(role,id);}
  need(this.#normal===MAX.prepareNormal&&this.#helperCount===MAX.prepareHelpers&&this.#cleanup===0&&this.#requests.length===MAX.prepareRequests&&this.#points.size===11,"PREPARE_ROSTER");
  await this.#control("ready",Object.freeze(Object.fromEntries(this.#points)));this.#b.assertOriginalHeld();
  // oxlint-disable-next-line unicorn/no-useless-undefined -- Original retained prearm has an explicit undefined fulfillment type.
  out.resolve(undefined);
 }catch(error){this.#fail(error);out.reject(error);}})();void this.#handled(out.promise);return out.promise;}
 public requirePrepared():void{this.#current();need(this.#prepared!==null&&this.#cursor!==null&&this.#prepare!==null&&this.#controls.length>=2&&this.#points.size===11&&!this.#started,"PREPARED");}
 public start():Promise<Readonly<CurrentFootprintInverseNativeDeleteCallerData>>{this.requirePrepared();this.#b.assertOriginalHeld();this.#started=true;this.#run=Promise.withResolvers<Readonly<CurrentFootprintInverseNativeDeleteCallerData>>();void this.#handled(this.#run.promise);return this.#run.promise;}
 #parse(event:DiagnosticEvent,role:Role):Held{const p=pause.parse(event.params);const top=p.callFrames[0];const at=site(role);const script=this.#script(role);need(top!==undefined&&p.hitBreakpoints[0]===this.#points.get(role)&&top.functionName===at.functionName&&top.functionLocation.scriptId===script&&top.functionLocation.lineNumber===at.functionLine&&top.functionLocation.columnNumber===at.functionColumn&&top.location.scriptId===script&&top.location.lineNumber===at.lineNumber&&top.location.columnNumber===at.columnNumber,"HELD_SOURCE");const listener=role==="innerSubscribe"?p.callFrames.find(f=>f.functionLocation.scriptId===this.#b.scripts.manager&&f.functionLocation.lineNumber===0&&f.functionLocation.columnNumber===11_785):undefined;return Object.freeze({event,role,frame:top.callFrameId,caller:p.callFrames[1]?.callFrameId??null,nativeListener:listener?.callFrameId??null,returned:top.returnValue});}
 public observe(event:DiagnosticEvent):boolean{
  const realm=this.#realm(event);if(realm===null||this.#data!==null){return false;}
  if(event.method==="Debugger.scriptParsed"){if(!this.hasOriginalIssuedHelper(event)){return false;}}
  else if(event.method==="Debugger.breakpointResolved"){if(this.#arming[realm]===null){return false;}}
  else if(event.method==="Debugger.resumed"){if(this.#resume[realm]===null){return false;}}
  else if(event.method==="Debugger.paused"){const hits=event.params["hitBreakpoints"];if(!Array.isArray(hits)||hits.length!==1||![...this.#points.values()].includes(handle.parse(hits[0]))){return false;}}
  else{return false;}
  try{this.#current();this.#b.assertOriginalEvent(event);need((this.#events+=1)<=MAX.events,"EVENT_BOUND");
   if(event.method==="Debugger.scriptParsed"){const h=this.#helpers[realm];need(h!==null&&h.issued&&!h.attempted&&h.scriptId===null&&event.params["url"]===""&&event.params["executionContextId"]===this.#b.contexts[realm],"HELPER_EVENT");h.scriptId=handle.parse(event.params["scriptId"]);return true;}
   if(event.method==="Debugger.breakpointResolved"){const arming=this.#arming[realm];need(arming!==null&&arming.resolved===null,"POINT_RESOLVED");const raw=z.strictObject({breakpointId:handle,location}).parse(event.params);const at=site(arming.role);need(raw.location.scriptId===this.#script(arming.role)&&raw.location.lineNumber===at.lineNumber&&raw.location.columnNumber===at.columnNumber,"POINT_RESOLVED_SOURCE");arming.resolved=raw.breakpointId;return true;}
   if(event.method==="Debugger.resumed"){const r=this.#resume[realm];need(r!==null&&r.attempted&&!r.observed&&this.#held[realm]===r.held,"ORIGINAL_RESUME");empty.parse(event.params);r.observed=true;this.#held[realm]=null;r.barrier.resolve(null);return true;}
   need(this.#started&&this.#held[realm]===null,"ORIGINAL_PAUSE");const role=[...this.#points].find(([,id])=>id===z.tuple([handle]).parse(event.params["hitBreakpoints"])[0])?.[0];need(role!==undefined&&realmFor(role)===realm,"POINT_ROLE");const held=this.#parse(event,role);this.#held[realm]=held;
   const previous=this.#work[realm];const pending=(async():Promise<void>=>{await previous;this.#current();if(realm==="worker"&&role==="returned"){await this.#b.originalClockWorkerFrontier();this.#current();}await this.#serve(held);})();this.#work[realm]=pending;void this.#handled(pending);return true;
  }catch(error){this.#fail(error);throw error;}
 }
 async #remove(role:Role):Promise<void>{const id=this.#points.get(role);need(id!==undefined&&!this.#removed.has(role),"REMOVE_ONCE");const command=validate({phase:"inverse-native-delete-caller-remove",realm:realmFor(role),role,method:"Debugger.removeBreakpoint",params:{breakpointId:id}});empty.parse(await this.#read(command));this.#removed.add(role);}
 async #serve(held:Held):Promise<void>{
  this.#current();const realm=realmFor(held.role);const order=realm==="worker"?workerOrder:uiOrder;const cursor=this.#cursor;need(cursor!==null&&this.#held[realm]===held&&order[this.#steps[realm]]===held.role,"SOURCE_ORDER");this.#b.assertOriginalEvent(held.event);await this.#control("held",{realm,role:held.role});if(held.role==="success"){
    // oxlint-disable-next-line unicorn/no-useless-undefined -- The retained original frontier has an explicit undefined fulfillment type.
    this.#successHeld.resolve(undefined);
  }await cursor.read(held);this.#current();
  if(held.role==="outerCallback"){await this.#arm("outerReturned");const point=this.#points.get("outerReturned");need(point!==undefined,"RETURN_POINT");await this.#control("return-armed",{breakpointId:point});}await this.#remove(held.role);
  const r:Resume={held,barrier:Promise.withResolvers<null>(),attempted:false,observed:false};need(this.#resume[realm]===null,"ONE_RESUME");this.#resume[realm]=r;void this.#handled(r.barrier.promise);
  const c=validate({phase:"inverse-native-delete-caller-resume",realm,role:held.role,method:"Debugger.resume",params:{}});need((this.#normal+=1)<=MAX.normal,"RESUME_BOUND");
  empty.parse(await this.#send(c,():void=>{this.#current();need(this.#resume[realm]===r&&!r.attempted&&!r.observed&&this.#held[realm]===held,"RESUME_WRITE");this.#b.assertOriginalEvent(held.event);r.attempted=true;}));
  const started=performance.now();for(let polls=0;!r.observed;polls += 1){need(polls<24_000&&performance.now()-started<30_000,"RESUME_DEADLINE");await this.#b.poll();this.#current();}await r.barrier.promise;this.#current();need(this.#resume[realm]===r&&r.attempted&&r.observed,"ORIGINAL_RESUME_JOIN");this.#resume[realm]=null;await this.#control("resumed",{realm,role:held.role});this.#steps[realm]+=1;this.#resumes[realm]+=1;
  // A synchronously coalesced next pause remains retained in #held and its
  // Original queued serve. The previous acknowledgment never consumes it.
  if(this.#steps[realm]===order.length){need(!this.#finished[realm],"COMPLETE_ONCE");if(realm==="worker"){await this.#remove("failure");await this.#remove("outerFailure");}await cursor.complete(realm);this.#current();this.#finished[realm]=true;this.#finish();}
 }
 /** Start only through the original Core after local publication. Polls use
  * the existing coalesced renderer/Main lanes and their unchanged global cap. */
 public joinOriginalCompletion():Promise<Readonly<CurrentFootprintInverseNativeDeleteCallerData>>{
  this.#current();need(this.#started&&this.#run!==null,"JOIN_STARTED");if(this.#completion!==null){return this.#completion;}
  const gate=Promise.withResolvers<null>();const pending=(async():Promise<Readonly<CurrentFootprintInverseNativeDeleteCallerData>>=>{await gate.promise;try{
   const began=performance.now();for(let polls=0;this.#data===null;polls+=1){this.#current();need(polls<24_000&&performance.now()-began<30_000,"COMPLETION_DEADLINE");await this.#b.poll();this.#current();}
   const final=this.#final;need(final!==null,"FINAL_PENDING");await final;this.#current();need(this.#data!==null,"JOIN_DATA");this.requireOriginal(this.#data);return this.#data;
  }catch(error){this.#fail(error);throw error;}})();this.#completion=pending;void this.#handled(pending);gate.resolve(null);return pending;
 }
 public originalWorkerSuccessHeld():Promise<void>{return this.#successHeld.promise;}
 public async requireBeforeOriginalUpload():Promise<void>{this.#current();need(this.#started&&this.#cursor!==null&&this.#steps.worker===2&&this.#resumes.worker===2&&this.#steps.ui===0&&this.#held.worker===null&&this.#resume.worker===null&&this.#helpers.worker===null&&!this.#preupload,"PREUPLOAD_CHAIN");await this.#work.worker;this.#current();await this.#control("preupload-ready");this.#current();this.#preupload=true;}
 public requireOriginalUploadPrepared():void{this.#current();need(this.#preupload&&this.#started&&this.#steps.worker===2&&this.#resumes.worker===2&&this.#steps.ui===0&&this.#held.worker===null&&this.#held.ui===null&&this.#resume.worker===null&&this.#resume.ui===null,"ORIGINAL_PREUPLOAD");}
 #finish():void{if(!this.#finished.worker||!this.#finished.ui||this.#final!==null){return;}const pending=(async():Promise<void>=>{try{const cursor=this.#cursor;need(cursor!==null&&this.#run!==null,"FINAL_CURSOR");cursor.requireComplete();await this.#b.requireOriginalDrainFinished();this.#current();await this.#b.joinOriginalConditionRouter();this.#current();need(this.#preupload&&this.#cleanup===12&&this.#helperCount===49&&this.#normal>=154&&this.#normal<=175&&this.#requests.length>=215&&this.#requests.length<=236&&this.#removed.size===12&&this.#resumes.worker===4&&this.#resumes.ui===6,"COMPLETE_ROSTER");await this.#control("complete");this.#current();const data:Readonly<CurrentFootprintInverseNativeDeleteCallerData>=Object.freeze({profile:"private.current-footprint-inverse-native-delete-caller-data.v1",originalWorkerHandlerPromiseJoined:true,originalWorkerSuccessCallbackReturned:true,originalTrustedReplyJoined:true,originalManagerReturnsJoined:true,originalUiCallbackReturned:true,originalInnerAndRacePromisesJoined:true,originalNativeTaskResult:true,originalDrainJoined:true,publicSdkParity:false,preferencesVerified:false,persistenceVerified:false,coldAbsenceVerified:false,wholeInverseVerified:false,requests:this.#requests.length,sourceCandidates:this.#sourceCandidates,resumes:10});this.#data=data;this.#run.resolve(data);}catch(error){this.#fail(error);}})();this.#final=pending;void this.#handled(pending);}
 public requireOriginal(data:Readonly<CurrentFootprintInverseNativeDeleteCallerData>):void{this.#current();need(this.#data===data&&this.#run!==null&&this.#final!==null&&this.#held.worker===null&&this.#held.ui===null&&this.#resume.worker===null&&this.#resume.ui===null&&this.#helpers.worker===null&&this.#helpers.ui===null&&!this.#reading.worker&&!this.#reading.ui,"ORIGINAL_DATA");this.#cursor?.requireComplete();}
 public async settleAfterOriginalExit():Promise<void>{this.#b.assertOriginalExit();this.#ended=true;const cause=new Error("INVERSE_NATIVE_DELETE_CALLER_ORIGINAL_EXIT");this.#successHeld.reject(cause);for(const r of Object.values(this.#resume)){r?.barrier.reject(cause);}this.#run?.reject(cause);await Promise.allSettled([this.#prepare,this.#final,this.#completion,this.#run?.promise,...Object.values(this.#work),...this.#requests,...this.#controls]);this.#b.assertOriginalExit();}
}
Object.freeze(CurrentFootprintInverseNativeDeleteCallerController.prototype);Object.freeze(CurrentFootprintInverseNativeDeleteCallerController);
export function assertOriginalCurrentFootprintInverseNativeDeleteCallerController(value:CurrentFootprintInverseNativeDeleteCallerController):void{need(value!==null&&typeof value==="object"&&!types.isProxy(value)&&originals.has(value)&&Object.getPrototypeOf(value)===CurrentFootprintInverseNativeDeleteCallerController.prototype&&Reflect.ownKeys(value).length===0,"ORIGINAL_CONTROLLER");}
