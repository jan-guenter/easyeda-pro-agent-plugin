/** Original native DEL buffered callback -> first cloud/history call.
 * Immutable Via programs are data algorithms, with independent original
 * event, local receipt and continuation custody supplied by Core. */
/* oxlint-disable import/max-dependencies -- Actual producer frames, immutable receiver recipes, independent cursor and exact private protocol are composed here. */
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_UPLOAD_RECEIVERS as RECEIVERS,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_UPLOAD_RECIPE as RECIPE}from"./current-footprint-inverse-native-delete-upload-programs.ts";
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_UPLOAD_NATIVE_PROFILES as PROFILES,qualifyCurrentFootprintInverseNativeDeleteUploadSet as qualifySet}from"./current-footprint-inverse-native-delete-upload-metadata.ts";
import{decodeCurrentFootprintCopyClockRpcV2ArrayCapture as arrayCapture,decodeCurrentFootprintCopyClockRpcV2Array as decodeArray,currentFootprintCopyClockRpcV2ArrayObject as objectAt}from"./current-footprint-copy-clock-rpc-v2-protocol.ts";
import{currentFootprintInverseLookupNativeCallable as callable}from"./current-footprint-inverse-lookup-native-metadata.ts";
import{decodeCurrentNativeFunctionMetadata}from"./current-native-function-metadata.ts";
import{types}from"node:util";
import{z}from"zod";
import type{DiagnosticEvent}from"./current-pcb-diagnostic-protocol.ts";
import{captureCurrentPcbStringClockReply as capture}from"./current-pcb-string-clock-reply.ts";
import{CURRENT_PROJECT_SAVE_PRODUCER_SITES as SITES,qualifyCurrentProjectSaveProducerSource}from"./current-project-save-producer-source.ts";
import{CurrentFootprintInverseNativeDeleteUploadCursor as Cursor}from"./current-footprint-inverse-native-delete-upload-cursor.ts";
import type{CurrentFootprintInverseNativeDeleteUploadDispatched as Dispatched,CurrentFootprintInverseNativeDeleteUploadHeld as Held}from"./current-footprint-inverse-native-delete-upload-cursor.ts";
import type{CurrentFootprintInverseNativeDeleteLocalCompleted as Local}from"./current-footprint-inverse-native-delete-local-cursor.ts";
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_UPLOAD_FLAGS as FLAGS,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_UPLOAD_REQUESTS as MAX,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_UPLOAD_ROLES as ROLES,currentFootprintInverseNativeDeleteUploadKey as key,currentFootprintInverseNativeDeleteUploadProgram as program,validateCurrentFootprintInverseNativeDeleteUploadCommand as validate}from"./current-footprint-inverse-native-delete-upload-protocol.ts";
import type{CurrentFootprintInverseNativeDeleteUploadCommand as Command,CurrentFootprintInverseNativeDeleteUploadRole as Role}from"./current-footprint-inverse-native-delete-upload-protocol.ts";

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);const empty=z.strictObject({});
const location=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const topFrame=z.looseObject({callFrameId:handle,location,functionLocation:location});
const paused=z.looseObject({reason:z.literal("other"),hitBreakpoints:z.tuple([handle]),callFrames:z.array(z.unknown()).min(1).max(32)});
function need(value:boolean,code:string):asserts value{if(!value){throw new Error(`INVERSE_NATIVE_DELETE_UPLOAD_${code}`);}}
export interface CurrentFootprintInverseNativeDeleteUploadBindings{
 readonly source:string;readonly scriptId:string;readonly sessionId:string;readonly contextId:number;
 readonly project:string;readonly wrapper:string;readonly callback:string;readonly intrinsics:string;readonly segments:string;readonly publication:string;
 readonly current:()=>void;readonly originalPoint:(role:Role)=>string;readonly local:()=>Promise<Local>;
 readonly assertOriginalEvent:(event:DiagnosticEvent)=>void;readonly assertOriginalExit:()=>void;
 readonly originalUploadWritten:()=>boolean;readonly consumeOriginalHeld:(event:DiagnosticEvent)=>void;
 readonly send:(command:Command,beforeTransfer:()=>void)=>Promise<unknown>;readonly poll:()=>Promise<void>;
 readonly control:(phase:"bind"|"ready"|"held"|"resumed"|"complete",role?:Role)=>Promise<void>;
 readonly fail:(cause:unknown)=>void;
}
export interface CurrentFootprintInverseNativeDeleteUploadData extends Dispatched{
 readonly originalBufferedCallbackJoined:true;readonly originalCloudEntryObserved:true;readonly originalHistoryCallResumed:true;
 readonly actualMainRequestJoined:false;readonly cloudCompleted:false;readonly originalDeleteCallerJoined:false;readonly wholeInverseVerified:false;
}
interface Helper{readonly origin:Command;readonly command:Command;issued:boolean;attempted:boolean;scriptId:string|null}
interface Resume{readonly held:Held;readonly event:DiagnosticEvent;readonly barrier:ReturnType<typeof Promise.withResolvers<null>>;attempted:boolean;observed:boolean}
const originals=new WeakSet<object>();
export class CurrentFootprintInverseNativeDeleteUploadController{
 readonly #b:CurrentFootprintInverseNativeDeleteUploadBindings;readonly #requests:Promise<unknown>[]=[];readonly #controls:Promise<void>[]=[];
 readonly #held=new WeakMap<object,Held>();readonly #eventsByPacket=new WeakMap<object,DiagnosticEvent>();readonly #consumed=new WeakSet<object>();
 #helper:Helper|null=null;#resume:Resume|null=null;#active:Held|null=null;#received:DiagnosticEvent|null=null;#cursor:Cursor|null=null;
 #prepare:Promise<void>|null=null;#run:Promise<Readonly<CurrentFootprintInverseNativeDeleteUploadData>>|null=null;#work:Promise<void>|null=null;#poll:Promise<void>|null=null;
 #prepared=false;#started=false;#reading=false;#ended=false;#failed=false;#failure:unknown;#step=0;#accepted=0;#normal=0;#helpers=0;#eventCount=0;
 #recipe:string|null=null;#data:Readonly<CurrentFootprintInverseNativeDeleteUploadData>|null=null;
 public constructor(bindings:CurrentFootprintInverseNativeDeleteUploadBindings){qualifyCurrentProjectSaveProducerSource(bindings.source);this.#b=Object.freeze({...bindings});originals.add(this);Object.freeze(this);}
 #current():void{this.#b.current();if(this.#failed){throw this.#failure;}need(!this.#ended,"ENDED");}
 #fail(cause:unknown):void{if(!this.#failed){this.#failed=true;this.#failure=cause;this.#resume?.barrier.reject(cause);this.#b.fail(cause);}}
 async #handled(pending:Promise<unknown>):Promise<void>{try{await pending;}catch(error){this.#fail(error);}}
 async #control(phase:"bind"|"ready"|"held"|"resumed"|"complete",role?:Role):Promise<void>{this.#current();need(this.#controls.length<9,"CONTROL_BOUND");const pending=this.#b.control(phase,role);need(types.isPromise(pending),"ORIGINAL_CONTROL");this.#controls.push(pending);await pending;this.#current();}
 public prepare():Promise<void>{
  need(this.#prepare===null,"PREPARE_ONCE");const out=Promise.withResolvers<undefined>();this.#prepare=out.promise;
  void(async():Promise<void>=>{try{this.#current();need(new Set(ROLES.map(role=>this.#b.originalPoint(role))).size===3,"DISTINCT_POINTS");await this.#control("bind");await this.#prepareRecipe();this.#current();await this.#control("ready");this.#prepared=true;
   // oxlint-disable-next-line unicorn/no-useless-undefined -- The retained PromiseWithResolvers<undefined> requires its explicit fulfillment argument.
   out.resolve(undefined);
  }catch(error){this.#fail(error);out.reject(error);}})();void this.#handled(out.promise);return out.promise;
 }
 async #prepareRecipe():Promise<void>{
  const call=(role:"set"|"capture"|"reprove",refs:readonly string[],returnByValue:boolean):Promise<unknown>=>this.#observeRead({phase:"inverse-native-delete-upload-recipe",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:this.#b.intrinsics,functionDeclaration:RECIPE[role],arguments:refs.map(objectId=>({objectId})),returnByValue}});
  const props=(role:string,objectId:string):Promise<unknown>=>this.#observeRead({phase:"inverse-native-delete-upload-recipe-properties",role,method:"Runtime.getProperties",params:{objectId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}});
  const setRemote=z.strictObject({result:z.unknown()}).parse(await call("set",[],false)).result;const set=callable(setRemote,"Set");
  qualifySet(await props("set",set),setRemote);this.#current();
  const recipe=arrayCapture(await call("capture",[this.#b.segments,this.#b.publication,set],false),12);
  const members=decodeArray(await props("recipe",recipe),12);
  for(const row of PROFILES){const remote=members.get(String(row.index));need(remote!==undefined,"RECIPE_FUNCTION");callable(remote,row.name);decodeCurrentNativeFunctionMetadata(await props(`native-${row.role}`,objectAt(members,row.index)),row);this.#current();}
  z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.literal(true)})}).parse(await call("reprove",[recipe],true));
  this.#current();need(this.#requests.length===12&&this.#normal===MAX.recipeNormal&&this.#helpers===MAX.recipeHelpers&&this.#helper===null,"RECIPE_ROSTER");this.#recipe=recipe;
 }
 public requireArmed():void{this.#current();need(this.#prepared&&!this.#started&&this.#step===0&&this.#requests.length===12&&this.#recipe!==null,"ARMED");}
 public originalPreparedRecipe():string{this.#current();need(this.#prepared&&this.#recipe!==null,"ORIGINAL_RECIPE");return this.#recipe;}
 public start():Promise<Readonly<CurrentFootprintInverseNativeDeleteUploadData>>{
  this.requireArmed();this.#started=true;const out=Promise.withResolvers<Readonly<CurrentFootprintInverseNativeDeleteUploadData>>();this.#run=out.promise;
  void(async():Promise<void>=>{try{const began=performance.now();for(let polls=0;this.#data===null;polls+=1){this.#current();need(polls<24_000&&performance.now()-began<30_000,"EVENT_DEADLINE");const pending=this.#b.poll();need(types.isPromise(pending)&&this.#poll===null,"ORIGINAL_POLL");this.#poll=pending;try{await pending;}finally{this.#poll=null;}}const work=this.#work;need(work!==null,"ORIGINAL_WORK");await work;this.#current();need(this.#data!==null,"DATA");out.resolve(this.#data);}catch(error){this.#fail(error);out.reject(error);}})();void this.#handled(out.promise);return out.promise;
 }
 public observe(event:DiagnosticEvent):boolean{
  if(event.sessionId!==this.#b.sessionId||this.#data!==null){return false;}
  if(event.method==="Debugger.scriptParsed"){if(this.#helper===null||!this.#helper.issued){return false;}}
  else if(event.method==="Debugger.resumed"){if(this.#resume===null||this.#resume.observed){return false;}}
  else if(event.method==="Debugger.paused"){const hits=event.params["hitBreakpoints"];if(!Array.isArray(hits)||!ROLES.some(role=>hits.includes(this.#b.originalPoint(role)))){return false;}}
  else{return false;}
  try{this.#current();this.#b.assertOriginalEvent(event);need((this.#eventCount+=1)<=MAX.events,"EVENT_BOUND");
   if(event.method==="Debugger.scriptParsed"){const h=this.#helper;need(h!==null&&h.issued&&!h.attempted&&h.scriptId===null&&event.params["url"]===""&&event.params["executionContextId"]===this.#b.contextId,"HELPER_EVENT");h.scriptId=handle.parse(event.params["scriptId"]);return true;}
   if(event.method==="Debugger.resumed"){const r=this.#resume;need(r!==null&&r.attempted&&!r.observed&&this.#active===r.held,"ORIGINAL_RESUMED");empty.parse(event.params);r.observed=true;this.#active=null;r.barrier.resolve(null);return true;}
   const role=ROLES[this.#accepted];need(this.#prepared&&this.#started&&this.#active===null&&(this.#resume===null||this.#resume.observed)&&this.#received===null&&role!==undefined&&this.#b.originalUploadWritten(),"ORIGINAL_PAUSE");
   const raw=paused.parse(event.params);const frame=topFrame.parse(raw.callFrames[0]);const site=SITES[role];need(raw.hitBreakpoints[0]===this.#b.originalPoint(role)&&frame.location.scriptId===this.#b.scriptId&&frame.location.lineNumber===site.lineNumber&&frame.location.columnNumber===site.columnNumber&&frame.functionLocation.scriptId===this.#b.scriptId&&frame.functionLocation.lineNumber===site.functionLineNumber&&frame.functionLocation.columnNumber===site.functionColumnNumber,"EXACT_FRAME");
   this.#received=event;this.#accepted+=1;const previous=this.#work;const pending=(async():Promise<void>=>{if(previous!==null){await previous;}this.#current();await this.#serve(event,role,frame.callFrameId);})();this.#work=pending;void this.#handled(pending);return true;
  }catch(error){this.#fail(error);throw error;}
 }
 async #request(input:Command,before?:()=>void):Promise<unknown>{
  this.#current();const command=validate(input);const pending=this.#b.send(command,():void=>{this.#current();if(program(command)!==null){const h=this.#helper;need(h!==null&&h.command===input&&!h.issued,"HELPER_WRITE");h.issued=true;}before?.();});
  need(types.isPromise(pending)&&this.#requests.length<MAX.cdpRequests,"ORIGINAL_REQUEST");this.#requests.push(pending);const value=capture(await pending).value;this.#current();return value;
 }
 async #read(input:Command):Promise<unknown>{
  this.#current();need(!this.#reading&&this.#helper===null,"SINGLE_REQUEST");this.#reading=true;
  try{const c=validate(input);need((this.#normal+=1)<=MAX.normal,"NORMAL_BOUND");if(program(c)!==null){this.#helper={origin:input,command:c,issued:false,attempted:false,scriptId:null};}return await this.#request(c);}catch(error){this.#fail(error);throw error;}finally{this.#reading=false;}
 }
 async #qualify(input:Command):Promise<void>{
  this.#current();const h=this.#helper;need(!this.#reading&&h!==null&&h.origin===input&&h.issued&&!h.attempted&&h.scriptId!==null,"ORIGINAL_HELPER");h.attempted=true;this.#reading=true;
  try{const c=validate({phase:"inverse-native-delete-upload-helper",role:key(input),method:"Debugger.getScriptSource",params:{scriptId:h.scriptId}});z.strictObject({scriptSource:z.literal(program(input))}).parse(await this.#request(c));need((this.#helpers+=1)<=MAX.helpers,"HELPER_BOUND");this.#helper=null;}catch(error){this.#fail(error);throw error;}finally{this.#reading=false;}
 }
 async #observeRead(input:unknown):Promise<unknown>{const c=validate(input),value=await this.#read(c);if(program(c)!==null){await this.#qualify(c);}return value;}
 async #serve(event:DiagnosticEvent,role:Role,frame:string):Promise<void>{
  this.#current();need(this.#received===event,"RECEIVED_EVENT");if(this.#cursor===null){const local=await this.#b.local();this.#current();need(role==="bufferDrain"&&this.#cursor===null&&this.#recipe!==null,"ORIGINAL_LOCAL");this.#cursor=new Cursor({scriptId:this.#b.scriptId,local,reflection:this.#b.intrinsics,recipe:this.#recipe,assertCurrent:():Promise<void>=>{this.#current();return Promise.resolve();},
   requireHeld:(packet):Held=>{this.#current();const held=this.#held.get(packet),original=this.#eventsByPacket.get(packet);need(held!==undefined&&this.#active===held&&!this.#consumed.has(packet)&&original!==undefined,"ORIGINAL_HELD");this.#b.assertOriginalEvent(original);return held;},
   request:(c):Promise<unknown>=>this.#read(c),qualifyHelper:(c):Promise<void>=>this.#qualify(c),
   resume:async(held,c):Promise<void>=>{this.#current();const original=this.#eventsByPacket.get(held.packet);need(original!==undefined&&this.#active===held&&!this.#consumed.has(held.packet),"ORIGINAL_RESUME");const resume:Resume={held,event:original,barrier:Promise.withResolvers<null>(),attempted:false,observed:false};this.#resume=resume;void this.#handled(resume.barrier.promise);
    need((this.#normal+=1)<=MAX.normal,"RESUME_BOUND");empty.parse(await this.#request(c,():void=>{this.#current();need(this.#resume===resume&&!resume.attempted&&this.#active===held,"RESUME_WRITE");this.#b.assertOriginalEvent(original);this.#b.consumeOriginalHeld(original);this.#consumed.add(held.packet);resume.attempted=true;}));
    await resume.barrier.promise;this.#current();need(this.#resume===resume&&resume.attempted&&resume.observed&&this.#active===null,"RESUME_JOIN");this.#resume=null;await this.#control("resumed",held.role);},fail:(cause):void=>{this.#fail(cause);}
  });}
  await this.#control("held",role);this.#current();const site=SITES[role];const raw=arrayCapture(await this.#observeRead({phase:"inverse-native-delete-upload-frame",role,method:"Debugger.evaluateOnCallFrame",params:{objectGroup:FLAGS.objectGroup,silent:true,generatePreview:false,throwOnSideEffect:true,callFrameId:frame,expression:site.expression,returnByValue:false,includeCommandLineAPI:false}}),site.length);
  const joined=arrayCapture(await this.#observeRead({phase:"inverse-native-delete-upload-receiver",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:raw,functionDeclaration:RECEIVERS[role],arguments:[this.#b.project,this.#b.wrapper,this.#b.callback,this.#b.intrinsics].map(objectId=>({objectId})),returnByValue:false}}),site.length);
  const packet=Object.freeze({profile:"private.current-footprint-inverse-native-delete-upload-held.v1"});const held=Object.freeze({packet,role,joinedId:joined});this.#held.set(packet,held);this.#eventsByPacket.set(packet,event);this.#active=held;this.#received=null;
  const cursor=this.#cursor;need(cursor!==null,"ORIGINAL_CURSOR");await cursor.continue(packet);this.#current();this.#step+=1;
  if(this.#step===ROLES.length){cursor.requireDispatched();need(this.#normal===MAX.normal&&this.#helpers===MAX.helpers&&this.#requests.length===MAX.cdpRequests&&this.#active===null&&this.#helper===null,"COMPLETE_ROSTER");await this.#control("complete");this.#current();this.#data=Object.freeze({...cursor.originalDispatched(),originalBufferedCallbackJoined:true,originalCloudEntryObserved:true,originalHistoryCallResumed:true,actualMainRequestJoined:false,cloudCompleted:false,originalDeleteCallerJoined:false,wholeInverseVerified:false});}
 }
 public requireOriginal(data:Readonly<CurrentFootprintInverseNativeDeleteUploadData>):void{this.#current();need(this.#data===data&&this.#run!==null&&!this.#reading&&this.#active===null&&this.#resume===null,"ORIGINAL_DATA");}
 public async settleAfterOriginalExit():Promise<void>{this.#b.assertOriginalExit();this.#ended=true;this.#resume?.barrier.reject(new Error("INVERSE_NATIVE_DELETE_UPLOAD_ORIGINAL_EXIT"));const pending:Promise<unknown>[]=[...this.#requests,...this.#controls];for(const value of[this.#prepare,this.#run,this.#work,this.#poll]){if(value!==null){pending.push(value);}}await Promise.allSettled(pending);this.#b.assertOriginalExit();}
}
Object.freeze(CurrentFootprintInverseNativeDeleteUploadController.prototype);Object.freeze(CurrentFootprintInverseNativeDeleteUploadController);
export function assertOriginalCurrentFootprintInverseNativeDeleteUploadController(value:CurrentFootprintInverseNativeDeleteUploadController):void{need(value!==null&&typeof value==="object"&&!types.isProxy(value)&&originals.has(value)&&Object.getPrototypeOf(value)===CurrentFootprintInverseNativeDeleteUploadController.prototype&&Reflect.ownKeys(value).length===0,"ORIGINAL_CONTROLLER");}
