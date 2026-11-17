/** Own original Cache.delete frames, finite empty-condition arms and one
 * successful native await. No Via/public/startup cursor or origin is adopted. */
import{z}from"zod";
import type{DiagnosticEvent}from"./current-pcb-diagnostic-protocol.ts";
import{captureCurrentPcbStringClockReply as capture}from"./current-pcb-string-clock-reply.ts";
import{CURRENT_PCB_VIA_SAVE_TAIL_DELETE_CALLER as CALLER,CURRENT_PCB_VIA_SAVE_TAIL_DELETE_SITES as SITES,CURRENT_PCB_VIA_SAVE_TAIL_DELETE_SOURCE as SOURCE,qualifyCurrentPcbViaSaveTailDeleteSource as qualifySource}from"./current-pcb-via-save-tail-observation-source.ts";
import{CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_FLAGS as FLAGS,currentFootprintInverseNativeDeleteDrainCall as call,validateCurrentFootprintInverseNativeDeleteDrainCommand as validate}from"./current-footprint-inverse-native-delete-drain-protocol.ts";
import type{CurrentFootprintInverseNativeDeleteDrainCommand as Command}from"./current-footprint-inverse-native-delete-drain-protocol.ts";
import{decodeCurrentFootprintCopyClockRpcV2Array as array,decodeCurrentFootprintCopyClockRpcV2ArrayCapture as arrayCapture}from"./current-footprint-copy-clock-rpc-v2-protocol.ts";
import type{CurrentFootprintInverseNativeDeleteDrainHeld as Held}from"./current-footprint-inverse-native-delete-drain-cursor.ts";

type Role=keyof typeof SITES;type Resume=Extract<Command,{phase:"inverse-native-delete-drain-delete-resume"}>;
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),location=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const frame=z.looseObject({callFrameId:handle,location,functionLocation:location,returnValue:z.unknown().optional()});
const paused=z.looseObject({reason:z.literal("other"),hitBreakpoints:z.tuple([handle]),callFrames:z.array(frame).min(1).max(32)});
const point=z.strictObject({breakpointId:handle,actualLocation:location});
export interface CurrentFootprintInverseNativeDeleteDrainDeleteBindings{
 readonly source:string;readonly scriptId:string;readonly sessionId:string;readonly intrinsics:string;readonly reflection:string;readonly recipe:string;readonly dependencies:string;
 readonly current:()=>void;readonly originalDrainCapture:()=>string;readonly assertOriginalEvent:(event:DiagnosticEvent)=>void;readonly assertOriginalExit:()=>void;
 readonly request:(command:Command)=>Promise<unknown>;readonly qualifyHelper:(command:Command)=>Promise<void>;
 readonly armPoint:(role:Role,command:Command)=>Promise<unknown>;
 readonly resume:(event:DiagnosticEvent,packet:object,command:Resume)=>Promise<void>;readonly fail:(cause:unknown)=>void;
}
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_DRAIN_DELETE_REQUESTS=Object.freeze({arms:3,callCapture:4,returnedCapture:3,resumes:2,normal:12,helpers:5,total:17,heldFrames:2,conditionEvaluations:0});
function need(value:boolean,code:string):asserts value{if(!value){throw new Error(`INVERSE_NATIVE_DELETE_DRAIN_DELETE_${code}`);}}
export class CurrentFootprintInverseNativeDeleteDrainDeleteCursor{
 readonly #b:CurrentFootprintInverseNativeDeleteDrainDeleteBindings;readonly #requests:Promise<unknown>[]=[];readonly #work:Promise<unknown>[]=[];
 readonly #points=new Map<Role,string>();readonly #held=new WeakMap<object,Readonly<{event:DiagnosticEvent;data:Held}>>();readonly #used=new WeakSet<DiagnosticEvent>();
 #prepare:Promise<void>|null=null;#active:object|null=null;#call:string|null=null;#step=0;#normal=0;#helpers=0;#busy=false;#failed=false;#failure:unknown;#ended=false;
 public constructor(bindings:CurrentFootprintInverseNativeDeleteDrainDeleteBindings){qualifySource(bindings.source);this.#b=Object.freeze({...bindings});Object.freeze(this);}
 #current():void{if(this.#failed){throw this.#failure;}this.#b.current();need(!this.#ended,"ENDED");}
 #fail(cause:unknown):void{if(!this.#failed){this.#failed=true;this.#failure=cause;try{this.#b.fail(cause);}catch{
 // Failure handoff cannot replace the retained original cause or strand its join.
 }}}
 async #send(input:Command,arm?:Role):Promise<unknown>{this.#current();const c=validate(input);need((this.#normal+=1)<=12,"NORMAL_BOUND");const pending=arm===undefined?this.#b.request(c):this.#b.armPoint(arm,c);this.#requests.push(pending);const value=capture(await pending).value;this.#current();if(c.method==="Runtime.callFunctionOn"||c.method==="Debugger.evaluateOnCallFrame"){need((this.#helpers+=1)<=5,"HELPER_BOUND");const helper=this.#b.qualifyHelper(c);this.#requests.push(helper);await helper;this.#current();}return value;}
 public prepare():Promise<void>{need(this.#prepare===null,"PREPARE_ONCE");const result=Promise.withResolvers<undefined>();this.#prepare=result.promise;this.#work.push(result.promise);
  void(async():Promise<void>=>{try{for(const role of["cacheDeleteCall","cacheDeleteReturned","cacheDeleteFailed"]as const){this.#current();const site=SITES[role];const command=validate({phase:"inverse-native-delete-drain-delete-arm",role,method:"Debugger.setBreakpoint",params:{location:{scriptId:this.#b.scriptId,lineNumber:site.lineNumber,columnNumber:site.columnNumber},condition:""}});const reply=point.parse(await this.#send(command,role));need(reply.actualLocation.scriptId===this.#b.scriptId&&reply.actualLocation.lineNumber===site.lineNumber&&reply.actualLocation.columnNumber===site.columnNumber&&![...this.#points.values()].includes(reply.breakpointId),"EXACT_ARM");this.#points.set(role,reply.breakpointId);}// oxlint-disable-next-line unicorn/no-useless-undefined -- The retained PromiseWithResolvers<undefined> requires its explicit fulfillment argument.
 result.resolve(undefined);}catch(error){this.#fail(error);result.reject(error);}})();void this.#handled(result.promise);return result.promise;}
 async #handled(pending:Promise<unknown>):Promise<void>{try{await pending;}catch(error){this.#fail(error);}}
 public originalPoint(role:Role):string{this.#current();const id=this.#points.get(role);need(id!==undefined,"ORIGINAL_POINT");return id;}
 public requireArmed():void{this.#current();need(this.#points.size===3&&this.#normal===3&&this.#helpers===0&&this.#step===0&&this.#active===null&&!this.#busy,"ARMED");}
 public capture(event:DiagnosticEvent,role:Role):Promise<Held>{this.#current();need(!this.#busy&&this.#active===null&&!this.#used.has(event)&&this.#step<2,"ONE_ORIGINAL_CAPTURE");this.#used.add(event);this.#busy=true;const result=Promise.withResolvers<Held>();this.#work.push(result.promise);
  void(async():Promise<void>=>{try{this.#b.assertOriginalEvent(event);need(role!=="cacheDeleteFailed","NO_RETRY");need(event.sessionId===this.#b.sessionId&&event.method==="Debugger.paused"&&role===(this.#step===0?"cacheDeleteCall":"cacheDeleteReturned"),"ORIGINAL_ROLE");
   const raw=paused.parse(capture(event.params).value),site=SITES[role],top=raw.callFrames[0];need(top!==undefined&&raw.hitBreakpoints[0]===this.originalPoint(role)&&top.location.scriptId===this.#b.scriptId&&top.location.lineNumber===site.lineNumber&&top.location.columnNumber===site.columnNumber&&top.functionLocation.scriptId===this.#b.scriptId&&top.functionLocation.lineNumber===SOURCE.functionLineNumber&&top.functionLocation.columnNumber===SOURCE.functionColumnNumber,"EXACT_SOURCE_FRAME");
   if(role==="cacheDeleteReturned"){z.strictObject({type:z.literal("boolean"),value:z.literal(true)}).parse(top.returnValue);}
   const flags={objectGroup:FLAGS.objectGroup,silent:true as const,generatePreview:false as const,throwOnSideEffect:true as const,includeCommandLineAPI:false as const,returnByValue:false as const};
   const frameCommand=validate({phase:"inverse-native-delete-drain-delete-frame",role,method:"Debugger.evaluateOnCallFrame",params:{...flags,callFrameId:top.callFrameId,expression:site.expression}});const projected=arrayCapture(await this.#send(frameCommand),4);let second:string;
   if(role==="cacheDeleteCall"){const caller=raw.callFrames[1];need(caller!==undefined&&caller.location.scriptId===this.#b.scriptId&&caller.location.lineNumber===CALLER.lineNumber&&caller.location.columnNumber===CALLER.columnNumber&&caller.functionLocation.scriptId===this.#b.scriptId&&caller.functionLocation.lineNumber===CALLER.functionLineNumber&&caller.functionLocation.columnNumber===CALLER.functionColumnNumber,"ORIGINAL_CALLER");second=arrayCapture(await this.#send({phase:"inverse-native-delete-drain-delete-caller",role:"detached",method:"Debugger.evaluateOnCallFrame",params:{...flags,callFrameId:caller.callFrameId,expression:CALLER.expression}}),6);}
   else{need(this.#call!==null,"ORIGINAL_CALL");second=this.#call;}
   const args=role==="cacheDeleteCall"?[projected,second,this.#b.intrinsics,this.#b.originalDrainCapture(),this.#b.reflection,this.#b.recipe,this.#b.dependencies]:[projected,second,this.#b.originalDrainCapture(),this.#b.intrinsics,this.#b.reflection,this.#b.recipe,this.#b.dependencies];
   const program=role==="cacheDeleteCall"?"call":"returned";const command=call("delete",program,projected,args.map(objectId=>({objectId})));const joinedId=arrayCapture(await this.#send(command),role==="cacheDeleteCall"?5:3);
   const members=array(await this.#send({phase:"inverse-native-delete-drain-properties",role:`delete-${program}`,slot:0,pass:0,method:"Runtime.getProperties",params:{objectId:joinedId,ownProperties:true,accessorPropertiesOnly:false,generatePreview:false}}),role==="cacheDeleteCall"?5:3);need([...members.values()].every(value=>value.type==="object"&&value.objectId!==undefined&&value.value===undefined),"ORIGINAL_CAPTURE_MEMBERS");
   const packet=Object.freeze({profile:"private.current-footprint-inverse-native-delete-drain-delete-held.v1"});const held:Held=Object.freeze({packet,role,joinedId,key:null,cache:null,promise:null,returnPromiseId:null});this.#held.set(packet,Object.freeze({event,data:held}));this.#active=packet;result.resolve(held);
  }catch(error){this.#fail(error);result.reject(error);}finally{this.#busy=false;}})();void this.#handled(result.promise);return result.promise;
 }
 public requireOriginal(packet:object):Held{this.#current();const held=this.#held.get(packet);need(!this.#busy&&this.#active===packet&&held!==undefined,"ORIGINAL_HELD");this.#b.assertOriginalEvent(held.event);return held.data;}
 public continue(packet:object):Promise<void>{const held=this.requireOriginal(packet),record=this.#held.get(packet);need(record!==undefined,"ORIGINAL_EVENT");this.#busy=true;const result=Promise.withResolvers<undefined>();this.#work.push(result.promise);
  void(async():Promise<void>=>{try{const role=z.enum(["cacheDeleteCall","cacheDeleteReturned"]).parse(held.role);need((this.#normal+=1)<=12,"RESUME_BOUND");const command=validate({phase:"inverse-native-delete-drain-delete-resume",role,method:"Debugger.resume",params:{}});need(command.phase==="inverse-native-delete-drain-delete-resume","FIXED_RESUME");const pending=this.#b.resume(record.event,packet,command);this.#requests.push(pending);await pending;this.#current();need(this.#active===packet,"ORIGINAL_RESUME_JOIN");if(this.#step===0){this.#call=held.joinedId;}this.#step+=1;this.#active=null;// oxlint-disable-next-line unicorn/no-useless-undefined -- The retained PromiseWithResolvers<undefined> requires its explicit fulfillment argument.
 result.resolve(undefined);}catch(error){this.#fail(error);result.reject(error);}finally{this.#busy=false;}})();void this.#handled(result.promise);return result.promise;
 }
 public requireCompleted():void{this.#current();need(!this.#busy&&this.#active===null&&this.#step===2&&this.#normal===12&&this.#helpers===5&&this.#requests.length===17,"COMPLETE_ROSTER");}
 public async settleAfterOriginalExit():Promise<void>{this.#b.assertOriginalExit();this.#ended=true;await Promise.allSettled([...this.#requests,...this.#work]);this.#b.assertOriginalExit();}
}
Object.freeze(CurrentFootprintInverseNativeDeleteDrainDeleteCursor.prototype);Object.freeze(CurrentFootprintInverseNativeDeleteDrainDeleteCursor);
