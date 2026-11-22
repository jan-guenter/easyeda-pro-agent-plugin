/** One original native DEL upload drain, with its own post-action source
 * frames and pending work. Startup's holds/ledgers are never consumed here.
 * The completed subgroup proves neither SDK caller return nor persistence. */
/* oxlint-disable import/max-dependencies -- Five finite readers, exact source qualification and helper/event custody are composed by this single original controller. */
import{types}from"node:util";
import{CURRENT_GENERATED_INITIAL_SYNC_CONDITION as SYNC_CONDITION}from"./current-generated-initial-sync-condition.ts";
import{z}from"zod";
import type{DiagnosticEvent}from"./current-pcb-diagnostic-protocol.ts";
import{captureCurrentFootprintInverseDeleteBindingReply as capture}from"./current-footprint-inverse-delete-binding-capture.ts";
import{qualifyCurrentProjectSaveProducerSource}from"./current-project-save-producer-source.ts";
import{qualifyCurrentProjectSaveProducerCacheSource}from"./current-project-save-producer-cache-source.ts";
import{qualifyCurrentPcbViaPostHistorySyncSource}from"./current-pcb-via-post-history-sync-source.ts";
import{CURRENT_PCB_VIA_SAVE_TAIL_DELETE_SITES as DELETE_SITES}from"./current-pcb-via-save-tail-observation-source.ts";
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_SOURCE_ROLES as SOURCE_ROLES,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_SYNC_ROLES as SYNC_ROLES,currentFootprintInverseNativeDeleteDrainKey as key,currentFootprintInverseNativeDeleteDrainProgram as program,validateCurrentFootprintInverseNativeDeleteDrainCommand as validate}from"./current-footprint-inverse-native-delete-drain-protocol.ts";
import type{CurrentFootprintInverseNativeDeleteDrainCommand as Command,CurrentFootprintInverseNativeDeleteDrainSourceRole as Role}from"./current-footprint-inverse-native-delete-drain-protocol.ts";
import{CurrentFootprintInverseNativeDeleteDrainRecipe as Recipe}from"./current-footprint-inverse-native-delete-drain-recipe.ts";
import{CurrentFootprintInverseNativeDeleteDrainObserver as Observer}from"./current-footprint-inverse-native-delete-drain-observer.ts";
import{CurrentFootprintInverseNativeDeleteDrainCursor as Cursor}from"./current-footprint-inverse-native-delete-drain-cursor.ts";
import type{CurrentFootprintInverseNativeDeleteDrainHeld as SourceHeld}from"./current-footprint-inverse-native-delete-drain-cursor.ts";
import{CurrentFootprintInverseNativeDeleteDrainSyncCursor as Sync}from"./current-footprint-inverse-native-delete-drain-sync-cursor.ts";
import type{CurrentFootprintInverseNativeDeleteDrainSyncHeld as SyncHeld}from"./current-footprint-inverse-native-delete-drain-sync-cursor.ts";
import{CurrentFootprintInverseNativeDeleteDrainDeleteCursor as Delete}from"./current-footprint-inverse-native-delete-drain-delete-cursor.ts";
import type{CurrentFootprintInverseNativeDeleteLocalCompleted as Local}from"./current-footprint-inverse-native-delete-local-cursor.ts";
import type{CurrentFootprintInverseNativeDeleteUploadData as Upload}from"./current-footprint-inverse-native-delete-upload-controller.ts";
import type{CurrentFootprintInverseNativeDeleteMainTailProjection as Projection}from"./current-footprint-inverse-native-delete-main-tail-controller.ts";
import type{CurrentFootprintInverseNativeDeleteMainTailBranch as Branch}from"./current-footprint-inverse-native-delete-main-tail-data.ts";

export{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_REQUESTS}from"./current-footprint-inverse-native-delete-drain-budget.ts";

type Lane="source"|"sync"|"delete";type DeleteRole=keyof typeof DELETE_SITES;type AnyRole=Role|DeleteRole;
const sourceRoles=[...SOURCE_ROLES,"syncFull","syncLast","syncHistory","syncMerged","syncFinalizing","syncReturned","headEntry","headPromise","headSuccess"]as const;
const empty=z.strictObject({}),handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const resolved=z.strictObject({breakpointId:handle,location});
const paused=z.looseObject({hitBreakpoints:z.tuple([handle])});
interface Helper{readonly origin:Command;readonly command:Command;issued:boolean;attempted:boolean;scriptId:string|null}
interface Held{readonly event:DiagnosticEvent;readonly role:AnyRole;readonly lane:Lane;packet:object|null}
interface Resume{readonly held:Held;readonly barrier:ReturnType<typeof Promise.withResolvers<null>>;attempted:boolean;observed:boolean}
export interface CurrentFootprintInverseNativeDeleteDrainBindings{
 readonly source:string;readonly scriptId:string;readonly sessionId:string;readonly contextId:number;readonly project:string;
 readonly intrinsics:string;readonly reflection:string;readonly uploadRecipe:string;readonly initial:string;readonly segments:string;readonly initialIndexBody:string;
 readonly body:string;readonly branchUuid:string;
 readonly current:()=>void;readonly assertOriginalHeld:()=>void;readonly assertOriginalExit:()=>void;
 readonly assertOriginalEvent:(event:DiagnosticEvent)=>void;readonly originalPoint:(role:Role)=>string;readonly originalUploadWritten:()=>boolean;
 readonly local:()=>Promise<Local>;readonly upload:()=>Promise<Readonly<Upload>>;readonly requireLocalCompleted:()=>Promise<void>;readonly requireInnerDeleteReturned:()=>Promise<void>;
 readonly historyResult:()=>Promise<Readonly<{historyUuid:string;bodySha256:string}>>;readonly originalBranch:()=>Promise<Branch>;readonly originalHistory:()=>Promise<Projection>;readonly requireMainCompleted:()=>Promise<void>;
 readonly send:(command:Command,beforeTransfer:()=>void)=>Promise<unknown>;readonly poll:()=>Promise<void>;
 readonly control:(phase:"bind"|"ready"|"held"|"resumed"|"complete",lane?:Lane,role?:AnyRole)=>Promise<void>;
 readonly fail:(cause:unknown)=>void;
}
export interface CurrentFootprintInverseNativeDeleteDrainData{
 readonly profile:"private.current-footprint-inverse-native-delete-drain-data.v1";readonly originalUploaderJoined:true;
 readonly originalDetachedCacheDeleteJoined:true;readonly originalNaturalSyncJoined:true;readonly originalNewSegmentsJoined:true;
 readonly actualMainResponsesJoined:true;readonly originalInnerDeletePromiseJoined:true;readonly actualResumes:29;readonly originalDeleteCallerJoined:false;readonly persistenceVerified:false;readonly wholeInverseVerified:false;
}
function need(value:boolean,code:string):asserts value{if(!value){throw new Error(`INVERSE_NATIVE_DELETE_DRAIN_${code}`);}}
const originals=new WeakSet<object>();
export class CurrentFootprintInverseNativeDeleteDrainController{
 readonly #b:CurrentFootprintInverseNativeDeleteDrainBindings;readonly #points=new Map<string,AnyRole>();readonly #counts=new Map<AnyRole,number>();
 readonly #requests:Promise<unknown>[]=[];readonly #controls:Promise<void>[]=[];readonly #conditions:DiagnosticEvent[]=[];
 #recipe:Recipe|null=null;#dependencies:string|null=null;#observer:Observer|null=null;#delete:Delete|null=null;#cursor:Cursor|null=null;#sync:Sync|null=null;
 #helper:Helper|null=null;#held:Held|null=null;#resume:Resume|null=null;
 #arming:Readonly<{role:DeleteRole;resolved:string|null}>|null=null;
 #prepare:Promise<void>|null=null;#run:Promise<Readonly<CurrentFootprintInverseNativeDeleteDrainData>>|null=null;#work:Promise<void>=Promise.resolve();#poll:Promise<void>|null=null;
 #prepared=false;#started=false;#reading=false;#settling=false;#ended=false;#failed=false;#failure:unknown;
 #normal=0;#helpers=0;#events=0;#resumes=0;#syncEntries=0;#data:Readonly<CurrentFootprintInverseNativeDeleteDrainData>|null=null;
 public constructor(bindings:CurrentFootprintInverseNativeDeleteDrainBindings){qualifyCurrentProjectSaveProducerSource(bindings.source);qualifyCurrentProjectSaveProducerCacheSource(bindings.source);qualifyCurrentPcbViaPostHistorySyncSource(bindings.source);this.#b=Object.freeze({...bindings});for(const role of sourceRoles){const id=bindings.originalPoint(role);need(!this.#points.has(id),"DISTINCT_SOURCE_POINTS");this.#points.set(id,role);}originals.add(this);Object.freeze(this);}
 #current():void{if(this.#failed){throw this.#failure;}this.#b.current();need(!this.#ended,"ENDED");}
 #fail(cause:unknown):void{if(!this.#failed){this.#failed=true;this.#failure=cause;this.#resume?.barrier.reject(cause);try{this.#b.fail(cause);}catch{
 // Failure handoff cannot replace the retained original cause or strand its join.
 }}}
 async #handled(pending:Promise<unknown>):Promise<void>{try{await pending;}catch(error){this.#fail(error);}}
 async #control(phase:"bind"|"ready"|"held"|"resumed"|"complete",held?:Held):Promise<void>{this.#current();need(this.#controls.length<61,"CONTROL_BOUND");const pending=this.#b.control(phase,held?.lane,held?.role);need(types.isPromise(pending),"ORIGINAL_CONTROL");this.#controls.push(pending);await pending;this.#current();}
 async #request(input:Command,before?:()=>void):Promise<unknown>{this.#current();const c=validate(input);const pending=this.#b.send(c,():void=>{this.#current();if(program(c)!==null){const h=this.#helper;need(h!==null&&h.command===input&&!h.issued,"ORIGINAL_HELPER_WRITE");h.issued=true;}before?.();});need(types.isPromise(pending)&&this.#requests.length<321,"ORIGINAL_REQUEST");this.#requests.push(pending);const value=capture(await pending);this.#current();return value;}
 async #read(input:Command):Promise<unknown>{this.#current();need(!this.#reading&&this.#helper===null,"SINGLE_READ");this.#reading=true;try{const c=validate(input);need((this.#normal+=1)<=213,"NORMAL_BOUND");if(program(c)!==null){this.#helper={origin:input,command:c,issued:false,attempted:false,scriptId:null};}return await this.#request(c);}catch(error){this.#fail(error);throw error;}finally{this.#reading=false;}}
 async #qualify(input:Command):Promise<void>{this.#current();const h=this.#helper;need(!this.#reading&&h!==null&&h.origin===input&&h.issued&&!h.attempted&&h.scriptId!==null,"ORIGINAL_HELPER_SOURCE");h.attempted=true;this.#reading=true;try{const c=validate({phase:"inverse-native-delete-drain-helper",role:key(input),method:"Debugger.getScriptSource",params:{scriptId:h.scriptId}});z.strictObject({scriptSource:z.literal(program(input))}).parse(await this.#request(c));need((this.#helpers+=1)<=108,"HELPER_BOUND");this.#helper=null;}catch(error){this.#fail(error);throw error;}finally{this.#reading=false;}}
 async #arm(role:DeleteRole,input:Command):Promise<unknown>{this.#current();need(this.#arming===null,"ONE_ARM");this.#arming={role,resolved:null};const raw=await this.#read(input);const point=z.strictObject({breakpointId:handle,actualLocation:location}).parse(raw);const arming=this.#arming;need(arming!==null&&!this.#points.has(point.breakpointId)&&(arming.resolved===null||arming.resolved===point.breakpointId),"EXACT_NEW_POINT");this.#points.set(point.breakpointId,role);this.#arming=null;return raw;}
 public prepare():Promise<void>{need(this.#prepare===null,"PREPARE_ONCE");const out=Promise.withResolvers<undefined>();this.#prepare=out.promise;void(async():Promise<void>=>{try{this.#current();this.#b.assertOriginalHeld();await this.#control("bind");
  this.#recipe=new Recipe({reflection:this.#b.reflection,uploadRecipe:this.#b.uploadRecipe,scriptId:this.#b.scriptId,current:():void=>{this.#current();},assertOriginalExit:():void=>{this.#b.assertOriginalExit();},request:(c):Promise<unknown>=>this.#read(c),qualifyHelper:(c):Promise<void>=>this.#qualify(c),fail:(cause):void=>{this.#fail(cause);}});
  const dependencies=await this.#recipe.prepare();this.#current();this.#recipe.requireOriginal(dependencies);this.#dependencies=dependencies;
  this.#delete=new Delete({source:this.#b.source,scriptId:this.#b.scriptId,sessionId:this.#b.sessionId,intrinsics:this.#b.intrinsics,reflection:this.#b.reflection,recipe:this.#b.uploadRecipe,dependencies,current:():void=>{this.#current();},originalDrainCapture:():string=>this.#originalCapture(),assertOriginalEvent:(event):void=>{this.#b.assertOriginalEvent(event);},assertOriginalExit:():void=>{this.#b.assertOriginalExit();},request:(c):Promise<unknown>=>this.#read(c),qualifyHelper:(c):Promise<void>=>this.#qualify(c),armPoint:(role,c):Promise<unknown>=>this.#arm(role,c),resume:(_event,packet,c):Promise<void>=>this.#resumeOriginal(packet,c),fail:(cause):void=>{this.#fail(cause);}});
  await this.#delete.prepare();this.#current();this.#delete.requireArmed();need(this.#normal===15&&this.#helpers===3&&this.#requests.length===18&&this.#helper===null,"PREPARE_ROSTER");await this.#control("ready");this.#prepared=true;
  // oxlint-disable-next-line unicorn/no-useless-undefined -- The retained PromiseWithResolvers<undefined> requires its explicit fulfillment argument.
  out.resolve(undefined);
 }catch(error){this.#fail(error);out.reject(error);}})();void this.#handled(out.promise);return out.promise;}
 public requireArmed():void{this.#current();this.#b.assertOriginalHeld();need(this.#prepared&&!this.#started&&this.#dependencies!==null&&this.#recipe!==null&&this.#delete!==null&&this.#requests.length===18&&this.#held===null&&this.#helper===null,"ARMED");this.#recipe.requireOriginal(this.#dependencies);this.#delete.requireArmed();}
 #originalCapture():string{this.#current();need(this.#cursor!==null,"ORIGINAL_DRAIN_CURSOR");return this.#cursor.originalCapture();}
 /** Residual compiled conditions reach this method only after every actual
  * helper owner declined the event. URL text supplies no source authority.
  * The two retained syncEntry invocations can compile at most two scripts;
  * callback and timer points were replaced by their own empty conditions. */
 public observeOriginalCondition(event:DiagnosticEvent):void{
  this.#current();this.#b.assertOriginalEvent(event);need(this.#prepared&&this.#started&&this.#b.originalUploadWritten()&&event.method==="Debugger.scriptParsed"&&event.sessionId===this.#b.sessionId&&event.params["executionContextId"]===this.#b.contextId&&typeof event.params["url"]==="string"&&this.#conditions.length<2&&!this.#conditions.some(value=>value.params["scriptId"]===event.params["scriptId"]),"ORIGINAL_CONDITION_EVENT");
  const scriptId=handle.parse(event.params["scriptId"]),slot=this.#conditions.length;this.#conditions.push(event);need((this.#events+=1)<=171,"EVENT_BOUND");const previous=this.#work;
  const work=(async():Promise<void>=>{await previous;this.#current();this.#b.assertOriginalEvent(event);const input=validate({phase:"inverse-native-delete-drain-condition",role:"sync",slot,method:"Debugger.getScriptSource",params:{scriptId}});z.strictObject({scriptSource:z.literal(SYNC_CONDITION)}).parse(await this.#read(input));this.#current();})();this.#work=work;void this.#handled(work);
 }
 public observe(event:DiagnosticEvent):boolean{
  if(event.sessionId!==this.#b.sessionId||this.#data!==null){return false;}
  if(event.method==="Debugger.scriptParsed"){if(this.#helper===null||!this.#helper.issued){return false;}}
  else if(event.method==="Debugger.resumed"){if(this.#resume===null||this.#resume.observed){return false;}}
  else if(event.method==="Debugger.breakpointResolved"){if(this.#arming===null){return false;}}
  else if(event.method==="Debugger.paused"){const hits=event.params["hitBreakpoints"];if(!Array.isArray(hits)||hits.length!==1||!this.#points.has(String(hits[0]))){return false;}}
  else{return false;}
  try{this.#current();this.#b.assertOriginalEvent(event);need((this.#events+=1)<=171,"EVENT_BOUND");
   if(event.method==="Debugger.scriptParsed"){const h=this.#helper;need(h!==null&&h.issued&&!h.attempted&&h.scriptId===null&&event.params["url"]===""&&event.params["executionContextId"]===this.#b.contextId,"ORIGINAL_HELPER_EVENT");h.scriptId=handle.parse(event.params["scriptId"]);return true;}
   if(event.method==="Debugger.breakpointResolved"){const a=this.#arming,row=resolved.parse(event.params);need(a!==null&&a.resolved===null&&row.location.scriptId===this.#b.scriptId&&row.location.lineNumber===DELETE_SITES[a.role].lineNumber&&row.location.columnNumber===DELETE_SITES[a.role].columnNumber,"ORIGINAL_ARM_EVENT");this.#arming={...a,resolved:row.breakpointId};return true;}
   if(event.method==="Debugger.resumed"){const r=this.#resume;need(r!==null&&r.attempted&&!r.observed&&this.#held===r.held,"ORIGINAL_RESUMED");empty.parse(event.params);r.observed=true;this.#held=null;r.barrier.resolve(null);return true;}
   const raw=paused.parse(event.params),role=this.#points.get(raw.hitBreakpoints[0]);need(role!==undefined&&role!=="cacheDeleteFailed"&&this.#prepared&&this.#started&&this.#b.originalUploadWritten()&&this.#held===null&&(this.#resume===null||this.#resume.observed),"ORIGINAL_ACTIVE_FRAME");const count=(this.#counts.get(role)??0)+1;let maximum=1;if(role==="syncEntry"){maximum=2;}else if(["headEntry","headPromise","headSuccess"].includes(role)){maximum=3;}need(count<=maximum,"ROLE_BOUND");this.#counts.set(role,count);
   let lane:Lane="source";if(role==="cacheDeleteCall"||role==="cacheDeleteReturned"){lane="delete";}else if(role==="syncEntry"){lane=this.#syncEntries===0?"source":"sync";this.#syncEntries+=1;}else if(SYNC_ROLES.some(value=>value===role)){lane="sync";}
   const held:Held={event,role,lane,packet:null};this.#held=held;const previous=this.#work;const work=(async():Promise<void>=>{await previous;this.#current();need(this.#held===held,"ORIGINAL_QUEUED_EVENT");await this.#serve(held);this.#current();})();this.#work=work;void this.#handled(work);return true;
  }catch(error){this.#fail(error);throw error;}
 }
 async #setupCursors():Promise<void>{
  this.#current();if(this.#cursor!==null){return;}const dependencies=this.#dependencies;need(dependencies!==null&&this.#delete!==null,"PREPARED_READERS");const upload=await this.#b.upload();this.#current();const local=await this.#b.local();this.#current();
  this.#observer=new Observer({scriptId:this.#b.scriptId,sessionId:this.#b.sessionId,project:this.#b.project,intrinsics:this.#b.intrinsics,reflection:this.#b.reflection,recipe:this.#b.uploadRecipe,dependencies,current:():void=>{this.#current();},originalPoint:this.#b.originalPoint,originalDrainCapture:():string=>this.#originalCapture(),assertOriginalEvent:(event):void=>{this.#b.assertOriginalEvent(event);},request:(c):Promise<unknown>=>this.#read(c),qualifyHelper:(c):Promise<void>=>this.#qualify(c)});
  const observer=this.#observer;
  this.#cursor=new Cursor({local,uploadCapture:upload.capture,historyFrame:upload.historyFrame,body:this.#b.body,branchUuid:this.#b.branchUuid,reflection:this.#b.reflection,recipe:this.#b.uploadRecipe,dependencies,assertCurrent:():Promise<void>=>{this.#current();return Promise.resolve();},requireHeld:(packet):SourceHeld=>{this.#current();if(this.#held?.lane==="delete"){need(this.#delete!==null,"DELETE_READER");return this.#delete.requireOriginal(packet);}return observer.requireSource(packet);},historyResult:this.#b.historyResult,liveData:async():Promise<Projection["cache"]>=>{const projection=await this.#b.originalHistory();this.#current();return projection.cache;},postSyncProgress:():Readonly<{replayResumed:boolean;completed:boolean}>=>this.#sync?.progress()??{replayResumed:false,completed:false},request:(c):Promise<unknown>=>this.#read(c),qualifyHelper:(c):Promise<void>=>this.#qualify(c),resume:(held,c):Promise<void>=>this.#resumeOriginal(held.packet,c),continueDelete:async(held):Promise<void>=>{this.#current();need(this.#delete!==null,"DELETE_READER");await this.#delete.continue(held.packet);this.#current();},complete:():Promise<void>=>{this.#current();return Promise.resolve();},fail:(cause):void=>{this.#fail(cause);}});
  const cursor=this.#cursor;
  this.#sync=new Sync({scriptId:this.#b.scriptId,initial:this.#b.initial,segments:this.#b.segments,initialIndexBody:this.#b.initialIndexBody,reflection:this.#b.reflection,recipe:this.#b.uploadRecipe,dependencies,assertCurrent:():Promise<void>=>{this.#current();return Promise.resolve();},requireHeld:(packet):SyncHeld=>observer.requireOriginalSyncHeld(packet),requireOriginalDrainFrontier:():void=>{cursor.requirePostHistorySyncEntry();},originalDrainCapture:():string=>cursor.originalCapture(),originalBranch:this.#b.originalBranch,originalHistory:this.#b.originalHistory,requireMainCompleted:this.#b.requireMainCompleted,request:(c):Promise<unknown>=>this.#read(c),qualifyHelper:(c):Promise<void>=>this.#qualify(c),resume:(held,c):Promise<void>=>this.#resumeOriginal(held.packet,c),complete:():Promise<void>=>{this.#current();return Promise.resolve();},fail:(cause):void=>{this.#fail(cause);}});
 }
 async #serve(held:Held):Promise<void>{await this.#setupCursors();this.#current();need(this.#cursor!==null&&this.#sync!==null&&this.#observer!==null&&this.#delete!==null,"ORIGINAL_READERS");await this.#control("held",held);this.#current();
  if(held.lane==="delete"){const role=z.enum(["cacheDeleteCall","cacheDeleteReturned"]).parse(held.role);const packet=await this.#delete.capture(held.event,role);this.#current();held.packet=packet.packet;await this.#cursor.continue(packet.packet);}
  else{const role=z.enum(sourceRoles).parse(held.role);const packet=await this.#observer.capture(held.event,role,held.lane);this.#current();held.packet=packet.packet;const reader=held.lane==="source"?this.#cursor:this.#sync;await reader.continue(packet.packet);}
 }
 async #resumeOriginal(packet:object,input:Command):Promise<void>{
  this.#current();const held=this.#held;need(held!==null&&held.packet===packet&&this.#resume===null&&this.#helper===null,"ORIGINAL_RESUME_PACKET");this.#b.assertOriginalEvent(held.event);const r:Resume={held,barrier:Promise.withResolvers<null>(),attempted:false,observed:false};this.#resume=r;void this.#handled(r.barrier.promise);need((this.#normal+=1)<=213,"RESUME_BOUND");
  empty.parse(await this.#request(input,():void=>{this.#current();need(this.#resume===r&&this.#held===held&&!r.attempted,"ORIGINAL_RESUME_WRITE");this.#b.assertOriginalEvent(held.event);r.attempted=true;}));await r.barrier.promise;this.#current();
  // One native chunk can contain resumed and the next pause. Its queued held
  // Event stays current; only this exact original resume is consumed here.
  need(this.#resume===r&&r.attempted&&r.observed,"ORIGINAL_RESUME_JOIN");this.#resume=null;if(held.lane!=="delete"){need(this.#observer!==null,"ORIGINAL_OBSERVER");this.#observer.consumeOriginalResume(packet);}need((this.#resumes+=1)<=29,"RESUME_COUNT");await this.#control("resumed",held);
 }
 #queueSettlement():void{
  this.#current();if(this.#settling||this.#held!==null||this.#resume!==null){return;}let reader:Sync|Cursor|null=null;
  if(this.#sync?.progress().canSettle===true){reader=this.#sync;}else if(this.#cursor?.progress().canSettle===true){reader=this.#cursor;}if(reader===null){return;}
  this.#settling=true;const original=reader,previous=this.#work;const work=(async():Promise<void>=>{try{await previous;this.#current();await original.settle();this.#current();}finally{this.#settling=false;}})();this.#work=work;void this.#handled(work);
 }
 public start():Promise<Readonly<CurrentFootprintInverseNativeDeleteDrainData>>{this.#current();need(this.#prepared&&!this.#started&&this.#run===null&&this.#b.originalUploadWritten(),"ORIGINAL_START");this.#started=true;const out=Promise.withResolvers<Readonly<CurrentFootprintInverseNativeDeleteDrainData>>();this.#run=out.promise;
  void(async():Promise<void>=>{try{const began=performance.now();for(let polls=0;this.#cursor?.progress().completed!==true||this.#sync?.progress().completed!==true;polls+=1){this.#current();need(polls<24_000&&performance.now()-began<30_000,"EVENT_DEADLINE");this.#queueSettlement();
    need(this.#poll===null,"ONE_POLL");const pending=this.#b.poll();need(types.isPromise(pending),"ORIGINAL_POLL");this.#poll=pending;try{await pending;}finally{this.#poll=null;}}
   await this.#work;this.#current();await this.#b.requireLocalCompleted();this.#current();await this.#b.requireMainCompleted();this.#current();await this.#b.requireInnerDeleteReturned();this.#current();need(this.#cursor!==null&&this.#sync!==null&&this.#observer!==null&&this.#delete!==null,"COMPLETED_READERS");this.#cursor.requireCompleted();this.#sync.requireCompleted();this.#observer.requireCompleted();this.#delete.requireCompleted();need(this.#normal>=198&&this.#normal<=213&&this.#helpers>=106&&this.#helpers<=108&&this.#requests.length>=304&&this.#requests.length<=321&&this.#resumes===29&&this.#held===null&&this.#resume===null&&this.#helper===null,"COMPLETE_ROSTER");await this.#control("complete");this.#current();need(this.#controls.length===61,"COMPLETE_CONTROLS");this.#data=Object.freeze({profile:"private.current-footprint-inverse-native-delete-drain-data.v1",originalUploaderJoined:true,originalDetachedCacheDeleteJoined:true,originalNaturalSyncJoined:true,originalNewSegmentsJoined:true,actualMainResponsesJoined:true,originalInnerDeletePromiseJoined:true,actualResumes:29,originalDeleteCallerJoined:false,persistenceVerified:false,wholeInverseVerified:false});out.resolve(this.#data);
  }catch(error){this.#fail(error);out.reject(error);}})();void this.#handled(out.promise);return out.promise;}
 public requireOriginal(data:Readonly<CurrentFootprintInverseNativeDeleteDrainData>):void{this.#current();need(this.#data===data&&this.#run!==null&&this.#held===null&&this.#resume===null&&this.#helper===null,"ORIGINAL_DATA");}
 public async settleAfterOriginalExit():Promise<void>{this.#b.assertOriginalExit();this.#ended=true;this.#resume?.barrier.reject(new Error("INVERSE_NATIVE_DELETE_DRAIN_ORIGINAL_EXIT"));const pending:Promise<unknown>[]=[...this.#requests,...this.#controls,this.#work];for(const value of[this.#prepare,this.#run,this.#poll]){if(value!==null){pending.push(value);}}if(this.#recipe!==null){pending.push(this.#recipe.settleAfterOriginalExit());}if(this.#delete!==null){pending.push(this.#delete.settleAfterOriginalExit());}await Promise.allSettled(pending);this.#b.assertOriginalExit();}
}
Object.freeze(CurrentFootprintInverseNativeDeleteDrainController.prototype);Object.freeze(CurrentFootprintInverseNativeDeleteDrainController);
export function assertOriginalCurrentFootprintInverseNativeDeleteDrainController(value:CurrentFootprintInverseNativeDeleteDrainController):void{need(value!==null&&typeof value==="object"&&!types.isProxy(value)&&originals.has(value)&&Object.getPrototypeOf(value)===CurrentFootprintInverseNativeDeleteDrainController.prototype&&Reflect.ownKeys(value).length===0,"ORIGINAL_CONTROLLER");}
