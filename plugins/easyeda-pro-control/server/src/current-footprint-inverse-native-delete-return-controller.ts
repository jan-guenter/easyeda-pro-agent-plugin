/** One actual native DEL method return. The original outer Promise is
 * retained before resume; result inspection never resolves it or joins cloud. */
import{types}from"node:util";
import{z}from"zod";
import type{DiagnosticEvent}from"./current-pcb-diagnostic-protocol.ts";
import{captureCurrentPcbStringClockReply as capture}from"./current-pcb-string-clock-reply.ts";
import{decodeCurrentFootprintCopyClockRpcV2ArrayCapture as arrayCapture}from"./current-footprint-copy-clock-rpc-v2-protocol.ts";
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_RETURN_FLAGS as FLAGS,CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_RETURN_REQUESTS as MAX,currentFootprintInverseNativeDeleteReturnProgram as program,validateCurrentFootprintInverseNativeDeleteReturnCommand as validate}from"./current-footprint-inverse-native-delete-return-protocol.ts";
import type{CurrentFootprintInverseNativeDeleteReturnCommand as Command}from"./current-footprint-inverse-native-delete-return-protocol.ts";
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_RETURN_PROGRAMS as PROGRAMS}from"./current-footprint-inverse-native-delete-return-programs.ts";
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_RETURN_SOURCE as SOURCE,qualifyCurrentFootprintInverseNativeDeleteReturnSource as qualify}from"./current-footprint-inverse-native-delete-return-source.ts";

const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const remote=z.strictObject({type:z.string(),subtype:z.string().optional(),className:z.string().optional(),description:z.string().optional(),value:z.unknown().optional(),objectId:handle.optional()});
const nativePromise=z.strictObject({type:z.literal("object"),subtype:z.literal("promise"),className:z.literal("Promise"),description:z.literal("Promise"),objectId:handle});
const plainResult=z.strictObject({type:z.literal("object"),className:z.literal("Object"),description:z.literal("Object"),objectId:handle});
const internal=z.strictObject({name:z.string(),value:remote});
const promisePacket=z.strictObject({result:z.tuple([]),internalProperties:z.array(internal).length(3)});
const resultProperty=z.strictObject({name:z.literal("success"),value:z.strictObject({type:z.literal("boolean"),value:z.literal(true)}),writable:z.literal(true),enumerable:z.literal(true),configurable:z.literal(true),isOwn:z.literal(true)});
const objectPrototype=z.strictObject({name:z.literal("[[Prototype]]"),value:plainResult});
const resultPacket=z.strictObject({result:z.tuple([resultProperty]),internalProperties:z.tuple([objectPrototype])});
const empty=z.strictObject({}),yes=z.strictObject({result:z.strictObject({type:z.literal("boolean"),value:z.literal(true)})});
const location=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const point=z.strictObject({breakpointId:handle,actualLocation:location});
const returnedFrame=z.looseObject({functionName:z.literal("deleteData"),functionLocation:location,location,callFrameId:handle,returnValue:z.unknown()});
const paused=z.looseObject({reason:z.literal("other"),hitBreakpoints:z.tuple([handle]),callFrames:z.array(z.unknown()).min(1).max(SOURCE.maximumFrames)});
function need(value:boolean,code:string):asserts value{if(!value){throw new Error(`INVERSE_NATIVE_DELETE_RETURN_${code}`);}}
export interface CurrentFootprintInverseNativeDeleteReturnBindings{
 readonly source:string;readonly scriptId:string;readonly sessionId:string;readonly contextId:number;
 readonly intrinsics:string;readonly serializationBundle:string;readonly targetUuid:string;
 readonly current:()=>void;readonly assertOriginalExit:()=>void;readonly assertOriginalEvent:(event:DiagnosticEvent)=>void;
 readonly originalUploadWritten:()=>boolean;readonly consumeOriginalHeld:(event:DiagnosticEvent)=>void;
 readonly send:(command:Command,beforeTransfer:()=>void)=>Promise<unknown>;readonly poll:()=>Promise<void>;
 readonly control:(phase:"bind"|"armed"|"held"|"resumed"|"complete",point?:string)=>Promise<void>;
 /** Private V4 composition may prearm its distinct caller at this exact
  * original method return. It cannot replace the held event or resume. */
 readonly beforeOriginalResume?:(event:DiagnosticEvent)=>Promise<void>;
 readonly beforeOriginalResultProof?:()=>Promise<void>;
 readonly fail:(cause:unknown)=>void;
}
export interface CurrentFootprintInverseNativeDeleteReturnData{
 readonly originalEvent:DiagnosticEvent;readonly promise:string;readonly result:string;readonly targetUuid:string;readonly cdpRequests:number;
 readonly originalMethodReturned:true;readonly originalOuterPromiseFulfilled:true;readonly originalResultSuccess:true;
 readonly originalSdkCallerJoined:false;readonly originalCloudJoined:false;readonly persistenceVerified:false;readonly wholeInverseVerified:false;
}
interface Helper{readonly command:Command;issued:boolean;attempted:boolean;scriptId:string|null}
interface Resume{readonly event:DiagnosticEvent;readonly barrier:ReturnType<typeof Promise.withResolvers<null>>;attempted:boolean;observed:boolean}
const originals=new WeakSet<object>();
export class CurrentFootprintInverseNativeDeleteReturnController{
 readonly #b:CurrentFootprintInverseNativeDeleteReturnBindings;readonly #requests:Promise<unknown>[]=[];readonly #controls:Promise<void>[]=[];readonly #callerJoins:Promise<void>[]=[];
 #prepare:Promise<void>|null=null;#run:Promise<Readonly<CurrentFootprintInverseNativeDeleteReturnData>>|null=null;#work:Promise<void>|null=null;
 #poll:Promise<void>|null=null;#helper:Helper|null=null;#resume:Resume|null=null;#held:DiagnosticEvent|null=null;
 #point:string|null=null;#resolved:string|null=null;#arming=false;#prepared=false;#started=false;#failed=false;#failure:unknown;#ended=false;
 #normal=0;#helpers=0;#cleanup=0;#events=0;#reading=false;#data:Readonly<CurrentFootprintInverseNativeDeleteReturnData>|null=null;
 public constructor(bindings:CurrentFootprintInverseNativeDeleteReturnBindings){qualify(bindings.source);this.#b=Object.freeze({...bindings});originals.add(this);Object.freeze(this);}
 #current():void{this.#b.current();if(this.#failed){throw this.#failure;}need(!this.#ended,"ENDED");}
 #fail(cause:unknown):void{if(!this.#failed){this.#failed=true;this.#failure=cause;this.#resume?.barrier.reject(cause);this.#b.fail(cause);}}
 async #handled(pending:Promise<unknown>):Promise<void>{try{await pending;}catch(error){this.#fail(error);}}
 async #control(phase:"bind"|"armed"|"held"|"resumed"|"complete"):Promise<void>{this.#current();need(this.#controls.length<5,"CONTROL_BOUND");const pending=this.#b.control(phase,this.#point??undefined);need(types.isPromise(pending),"ORIGINAL_CONTROL");this.#controls.push(pending);await pending;this.#current();}
 public observe(event:DiagnosticEvent):boolean{
  if(event.sessionId!==this.#b.sessionId||this.#data!==null){return false;}
  if(event.method==="Debugger.scriptParsed"){if(this.#helper===null||!this.#helper.issued){return false;}}
  else if(event.method==="Debugger.breakpointResolved"){const at=event.params["location"];if(at===null||typeof at!=="object"||Reflect.get(at,"scriptId")!==this.#b.scriptId||Reflect.get(at,"lineNumber")!==SOURCE.returned.lineNumber||Reflect.get(at,"columnNumber")!==SOURCE.returned.columnNumber){return false;}}
  else if(event.method==="Debugger.resumed"){if(this.#resume===null||this.#resume.observed){return false;}}
  else if(event.method==="Debugger.paused"){const hits=event.params["hitBreakpoints"];if(!Array.isArray(hits)||this.#point===null||!hits.includes(this.#point)){return false;}}
  else{return false;}
  try{
   this.#current();this.#b.assertOriginalEvent(event);need((this.#events+=1)<=MAX.events,"EVENT_BOUND");
   if(event.method==="Debugger.scriptParsed"){const h=this.#helper;need(h!==null&&h.issued&&!h.attempted&&h.scriptId===null&&event.params["url"]===""&&event.params["executionContextId"]===this.#b.contextId,"HELPER_EVENT");h.scriptId=handle.parse(event.params["scriptId"]);return true;}
   if(event.method==="Debugger.breakpointResolved"){const row=z.strictObject({breakpointId:handle,location}).parse(event.params);need(this.#arming&&this.#resolved===null,"POINT_RESOLUTION");this.#resolved=row.breakpointId;return true;}
   if(event.method==="Debugger.resumed"){const r=this.#resume;need(r!==null&&r.attempted&&!r.observed&&this.#held===r.event&&this.#b.originalUploadWritten(),"ORIGINAL_RESUME");empty.parse(event.params);r.observed=true;this.#held=null;r.barrier.resolve(null);return true;}
   const row=paused.parse(event.params);const frame=returnedFrame.parse(row.callFrames[0]);need(this.#prepared&&this.#started&&this.#held===null&&this.#work===null&&this.#resume===null&&this.#b.originalUploadWritten()&&frame!==undefined&&row.hitBreakpoints[0]===this.#point&&frame.location.scriptId===this.#b.scriptId&&frame.location.lineNumber===SOURCE.returned.lineNumber&&frame.location.columnNumber===SOURCE.returned.columnNumber&&frame.functionLocation.scriptId===this.#b.scriptId&&frame.functionLocation.lineNumber===SOURCE.functionLocation.lineNumber&&frame.functionLocation.columnNumber===SOURCE.functionLocation.columnNumber,"ORIGINAL_RETURN");
   nativePromise.parse(frame.returnValue);this.#held=event;const pending=this.#serve(event,frame.callFrameId,frame.returnValue);this.#work=pending;void this.#handled(pending);return true;
  }catch(error){this.#fail(error);throw error;}
 }
 async #send(input:Command):Promise<unknown>{
  this.#current();const c=validate(input);const pending=this.#b.send(c,():void=>{this.#current();const h=this.#helper;if(program(c)!==null){need(h!==null&&h.command===input&&!h.issued,"HELPER_WRITE");h.issued=true;}
   if(c.phase==="inverse-native-delete-return-resume"){const r=this.#resume;need(r!==null&&!r.attempted&&!r.observed&&this.#held===r.event,"RESUME_WRITE");this.#b.assertOriginalEvent(r.event);this.#b.consumeOriginalHeld(r.event);r.attempted=true;}
  });need(types.isPromise(pending)&&this.#requests.length<MAX.total,"ORIGINAL_REQUEST");this.#requests.push(pending);const raw=capture(await pending).value;this.#current();return raw;
 }
 async #read(input:unknown):Promise<unknown>{
  this.#current();need(!this.#reading&&this.#helper===null&&this.#data===null,"SINGLE_REQUEST");this.#reading=true;
  try{const c=validate(input);if(c.phase==="inverse-native-delete-return-remove"){need((this.#cleanup+=1)<=MAX.cleanup,"CLEANUP_BOUND");}else{need((this.#normal+=1)<=MAX.normal,"NORMAL_BOUND");}
   if(program(c)!==null){this.#helper={command:c,issued:false,attempted:false,scriptId:null};}
   const value=await this.#send(c);if(program(c)!==null){const h=this.#helper;need(h!==null&&h.command===c&&h.issued&&!h.attempted&&h.scriptId!==null,"ORIGINAL_HELPER");h.attempted=true;
    const helper=validate({phase:"inverse-native-delete-return-helper",role:c.phase.replace("inverse-native-delete-return-",""),method:"Debugger.getScriptSource",params:{scriptId:h.scriptId}});z.strictObject({scriptSource:z.literal(program(c))}).parse(await this.#send(helper));need((this.#helpers+=1)<=MAX.helpers,"HELPER_BOUND");this.#helper=null;}
   this.#current();return value;
  }catch(error){this.#fail(error);throw error;}finally{this.#reading=false;}
 }
 public prepare():Promise<void>{
  need(this.#prepare===null,"PREPARE_ONCE");const out=Promise.withResolvers<undefined>();this.#prepare=out.promise;
  void(async():Promise<void>=>{try{this.#current();await this.#control("bind");this.#arming=true;const row=point.parse(await this.#read({phase:"inverse-native-delete-return-arm",method:"Debugger.setBreakpoint",params:{location:{scriptId:this.#b.scriptId,...SOURCE.returned},condition:""}}));
   need(row.actualLocation.scriptId===this.#b.scriptId&&row.actualLocation.lineNumber===SOURCE.returned.lineNumber&&row.actualLocation.columnNumber===SOURCE.returned.columnNumber&&(this.#resolved===null||this.#resolved===row.breakpointId),"POINT_REPLY");this.#point=row.breakpointId;this.#arming=false;await this.#control("armed");this.#prepared=true;
   // oxlint-disable-next-line unicorn/no-useless-undefined -- Retained PromiseWithResolvers<undefined> requires its fulfillment argument.
   out.resolve(undefined);
  }catch(error){this.#fail(error);out.reject(error);}})();void this.#handled(out.promise);return out.promise;
 }
 public requireArmed():void{this.#current();need(this.#prepared&&!this.#started&&this.#point!==null&&!this.#arming&&this.#requests.length===1&&this.#normal===1&&this.#helpers===0&&this.#cleanup===0,"ARMED");}
 public start():Promise<Readonly<CurrentFootprintInverseNativeDeleteReturnData>>{
  this.requireArmed();this.#started=true;const out=Promise.withResolvers<Readonly<CurrentFootprintInverseNativeDeleteReturnData>>();this.#run=out.promise;
  void(async():Promise<void>=>{try{const began=performance.now();for(let polls=0;this.#data===null;polls+=1){this.#current();need(polls<24_000&&performance.now()-began<30_000,"RETURN_DEADLINE");const pending=this.#b.poll();need(types.isPromise(pending)&&this.#poll===null,"ORIGINAL_POLL");this.#poll=pending;try{await pending;}finally{this.#poll=null;}}
   const pending=this.#work;need(pending!==null,"ORIGINAL_WORK");await pending;this.#current();need(this.#data!==null,"DATA");out.resolve(this.#data);
  }catch(error){this.#fail(error);out.reject(error);}})();void this.#handled(out.promise);return out.promise;
 }
 async #serve(event:DiagnosticEvent,frame:string,returned:unknown):Promise<void>{
  this.#current();await this.#control("held");const joined=arrayCapture(await this.#read({phase:"inverse-native-delete-return-frame",method:"Debugger.evaluateOnCallFrame",params:{...FLAGS,callFrameId:frame,expression:SOURCE.frame,returnByValue:false,includeCommandLineAPI:false}}),2);
  yes.parse(await this.#read({phase:"inverse-native-delete-return-proof",method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:this.#b.intrinsics,functionDeclaration:PROGRAMS.frame,arguments:[{objectId:joined},{objectId:this.#b.serializationBundle},{value:this.#b.targetUuid}],returnByValue:true,awaitPromise:false,userGesture:false}}));
  const original=nativePromise.parse(returned);const retained=z.strictObject({result:nativePromise}).parse(await this.#read({phase:"inverse-native-delete-return-retain",method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:original.objectId,functionDeclaration:PROGRAMS.retain,arguments:[],returnByValue:false,awaitPromise:false,userGesture:false}})).result.objectId;
  need(this.#point!==null&&this.#held===event,"POINT_HELD");empty.parse(await this.#read({phase:"inverse-native-delete-return-remove",method:"Debugger.removeBreakpoint",params:{breakpointId:this.#point}}));
  if(this.#b.beforeOriginalResume!==undefined){this.#current();this.#b.assertOriginalEvent(event);const pending=this.#b.beforeOriginalResume(event);need(types.isPromise(pending),"ORIGINAL_CALLER_JOIN");this.#callerJoins.push(pending);await pending;this.#current();need(this.#held===event&&this.#resume===null,"CALLER_HELD_JOIN");}
  const resume:Resume={event,barrier:Promise.withResolvers<null>(),attempted:false,observed:false};this.#resume=resume;void this.#handled(resume.barrier.promise);
  empty.parse(await this.#read({phase:"inverse-native-delete-return-resume",method:"Debugger.resume",params:{}}));await resume.barrier.promise;this.#current();need(this.#resume===resume&&resume.attempted&&resume.observed&&this.#held===null,"RESUME_JOINED");this.#resume=null;await this.#control("resumed");
  if(this.#b.beforeOriginalResultProof!==undefined){const pending=this.#b.beforeOriginalResultProof();need(types.isPromise(pending),"ORIGINAL_CALLER_RESULT_JOIN");this.#callerJoins.push(pending);await pending;this.#current();}
  let result:string|null=null;
  for(let pass=1;pass<=MAX.promisePasses;pass+=1){const raw=promisePacket.parse(await this.#read({phase:"inverse-native-delete-return-properties",role:"promise",pass,method:"Runtime.getProperties",params:{objectId:retained,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}}));const slots=new Map(raw.internalProperties.map(row=>[row.name,row.value]));need(slots.size===3,"PROMISE_SLOTS");
   const proto=slots.get("[[Prototype]]"),state=slots.get("[[PromiseState]]"),value=slots.get("[[PromiseResult]]");need(proto?.type==="object"&&proto.className==="Promise"&&proto.description==="Promise"&&proto.subtype===undefined&&proto.objectId!==undefined&&state?.type==="string"&&value!==undefined,"PROMISE_METADATA");
   if(state.value==="pending"){need(pass===1&&value.type==="undefined"&&value.objectId===undefined,"ONE_PENDING_PASS");}else{need(state.value==="fulfilled","FULFILLED");result=plainResult.parse(value).objectId;break;}}
  need(result!==null,"ORIGINAL_RESULT");resultPacket.parse(await this.#read({phase:"inverse-native-delete-return-properties",role:"result",pass:1,method:"Runtime.getProperties",params:{objectId:result,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}}));
  yes.parse(await this.#read({phase:"inverse-native-delete-return-result",method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:this.#b.intrinsics,functionDeclaration:PROGRAMS.result,arguments:[{objectId:result}],returnByValue:true,awaitPromise:false,userGesture:false}}));
  need(this.#requests.length>=MAX.minimum&&this.#requests.length<=MAX.total&&this.#normal>=8&&this.#normal<=MAX.normal&&this.#helpers===4&&this.#cleanup===1&&this.#helper===null,"COMPLETE_ROSTER");await this.#control("complete");this.#current();
  this.#data=Object.freeze({originalEvent:event,promise:retained,result,targetUuid:this.#b.targetUuid,cdpRequests:this.#requests.length,originalMethodReturned:true,originalOuterPromiseFulfilled:true,originalResultSuccess:true,originalSdkCallerJoined:false,originalCloudJoined:false,persistenceVerified:false,wholeInverseVerified:false});
 }
 public requireOriginal(data:Readonly<CurrentFootprintInverseNativeDeleteReturnData>):void{this.#current();need(this.#data===data&&this.#run!==null&&!this.#reading&&this.#held===null&&this.#resume===null,"ORIGINAL_DATA");}
 public async settleAfterOriginalExit():Promise<void>{this.#b.assertOriginalExit();this.#ended=true;this.#resume?.barrier.reject(new Error("INVERSE_NATIVE_DELETE_RETURN_ORIGINAL_EXIT"));const promises:Promise<unknown>[]=[...this.#requests,...this.#controls,...this.#callerJoins];for(const pending of[this.#prepare,this.#work,this.#run,this.#poll]){if(pending!==null){promises.push(pending);}}await Promise.allSettled(promises);this.#b.assertOriginalExit();}
}
Object.freeze(CurrentFootprintInverseNativeDeleteReturnController.prototype);Object.freeze(CurrentFootprintInverseNativeDeleteReturnController);
export function assertOriginalCurrentFootprintInverseNativeDeleteReturnController(value:CurrentFootprintInverseNativeDeleteReturnController):void{need(value!==null&&typeof value==="object"&&!types.isProxy(value)&&originals.has(value)&&Object.getPrototypeOf(value)===CurrentFootprintInverseNativeDeleteReturnController.prototype&&Reflect.ownKeys(value).length===0,"ORIGINAL_CONTROLLER");}
