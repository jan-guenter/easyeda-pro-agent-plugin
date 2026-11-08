/** One original publisher/timer lane on the existing callback event stream.
 * A reservation burns before transport and every transition joins resumed,
 * the original empty ACK and the exact next source boundary. */
import {z} from "zod";
import type {DiagnosticEvent} from "./current-pcb-diagnostic-protocol.ts";
import {captureCurrentPcbStringClockReply} from "./current-pcb-string-clock-reply.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_BROADCAST_CALLEE_SOURCE as BUS} from "./current-schematic-relevance-broadcast-callee-source.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_RETURN_ROLES as RETURNS,currentSchematicRelevancePublicationFunctionPoint as functionPoint,currentSchematicRelevancePublicationReturnPoint as returnPoint,validateCurrentSchematicRelevancePublicationControlCommand as validate} from "./current-schematic-relevance-publication-control-protocol.ts";
import type {CurrentSchematicRelevancePublicationControlCommand as Command,CurrentSchematicRelevancePublicationReturnRole as ReturnRole} from "./current-schematic-relevance-publication-control-protocol.ts";

const roles=["publicationPost","publicationPostReturned","publicationPublisherReturned","publicationTimerReturned","publicationLoopback","publicationLoopbackReturned"]as const;
export type CurrentSchematicRelevancePublicationRole=typeof roles[number];
export interface CurrentSchematicRelevancePublicationOriginal{readonly event:DiagnosticEvent;readonly role:string;readonly callFrameId:string}
export interface CurrentSchematicRelevancePublicationHeld extends CurrentSchematicRelevancePublicationOriginal{readonly role:CurrentSchematicRelevancePublicationRole}
export interface CurrentSchematicRelevancePublicationResume{readonly original:CurrentSchematicRelevancePublicationOriginal;readonly target:CurrentSchematicRelevancePublicationRole;readonly ordinal:number}
export interface CurrentSchematicRelevancePublicationControllerHost{readonly current:()=>void;readonly request:(command:Command)=>Promise<unknown>;readonly held:(value:CurrentSchematicRelevancePublicationHeld)=>void;readonly resumed:()=>void;readonly fail:()=>void}
const token=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const point=z.strictObject({scriptId:token,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const frame=z.object({callFrameId:token,functionLocation:point,location:point,returnValue:z.unknown().optional()});
const optionalPoint=point.extend({type:z.string().optional()});
const locations=z.array(optionalPoint).max(64);
const possibleReply=z.strictObject({locations});
const armReply=z.strictObject({breakpointId:token,actualLocation:point});
const functionReply=z.strictObject({breakpointId:token});
function need(value:boolean):asserts value{if(!value){throw new Error("SCH_PUBLICATION_ORIGINAL_EVENT");}}
export class CurrentSchematicRelevancePublicationController{
 readonly #host:CurrentSchematicRelevancePublicationControllerHost;readonly #session:string;readonly #script:string;readonly #variant:0|1;readonly #foreign:ReadonlySet<string>;
 readonly #points=new Map<string,CurrentSchematicRelevancePublicationRole>();
 #held:CurrentSchematicRelevancePublicationOriginal|null;#attempted=false;#armed=false;#failed=false;#ordinal=0;
 #reservation:CurrentSchematicRelevancePublicationResume|null=null;#submitted=false;#resumed=false;
 #resumeSignal:ReturnType<typeof Promise.withResolvers<boolean>>|null=null;#heldSignal:ReturnType<typeof Promise.withResolvers<CurrentSchematicRelevancePublicationHeld|null>>|null=null;
 /** Retain the exact held publisher and original source/receiver handles. */
 public constructor(host:CurrentSchematicRelevancePublicationControllerHost,session:string,script:string,variant:0|1,original:CurrentSchematicRelevancePublicationOriginal,foreign:readonly string[]){this.#host=host;this.#session=token.parse(session);this.#script=token.parse(script);this.#variant=variant;this.#held=original;this.#foreign=new Set(foreign);need(original.role==="publicationPublish");Object.freeze(this);}
 /** Keep every fixed request inside the original owner generation across awaits. */
 async #request(command:Command):Promise<unknown>{this.#host.current();const value=await this.#host.request(command);this.#host.current();return captureCurrentPcbStringClockReply(value).value;}
 /** Refuse collisions with any earlier original lane before storing a guard. */
 #insert(id:string,role:CurrentSchematicRelevancePublicationRole):void{need(!this.#foreign.has(id)&&!this.#points.has(id));this.#points.set(id,role);}
 /** Arm exact source returns and the two original function-call guards
  * before any publisher body or native send can execute. */
 public async arm(post:string,onMessage:string):Promise<void>{
  need(!this.#attempted&&!this.#failed);this.#attempted=true;const original=this.#held;need(original!==null);
  try{
   for(const role of RETURNS){const start=functionPoint(this.#variant,role),target=returnPoint(this.#variant,role);const at={scriptId:this.#script,lineNumber:target.lineNumber,columnNumber:target.columnNumber};
    const possible=possibleReply.parse(await this.#request(validate({phase:"publication-control-possible",variant:this.#variant,role,method:"Debugger.getPossibleBreakpoints",params:{start:{scriptId:this.#script,lineNumber:start.lineNumber,columnNumber:start.columnNumber},end:{...at,columnNumber:at.columnNumber+1},restrictToFunction:true}})));this.requireHeld(original);
    need(possible.locations.filter(p=>p.scriptId===this.#script&&p.lineNumber===at.lineNumber&&p.columnNumber===at.columnNumber&&p.type==="return").length===1);
    const result=armReply.parse(await this.#request(validate({phase:"publication-control-return",variant:this.#variant,role,method:"Debugger.setBreakpoint",params:{location:at,condition:""}})));this.requireHeld(original);need(result.actualLocation.scriptId===this.#script&&result.actualLocation.lineNumber===at.lineNumber&&result.actualLocation.columnNumber===at.columnNumber);
    const selected:Record<ReturnRole,CurrentSchematicRelevancePublicationRole>={post:"publicationPostReturned",publisher:"publicationPublisherReturned",timer:"publicationTimerReturned",loopback:"publicationLoopbackReturned"};this.#insert(result.breakpointId,selected[role]);
   }
   for(const[role,objectId,target]of[["post",post,"publicationPost"],["loopback",onMessage,"publicationLoopback"]]as const){const result=functionReply.parse(await this.#request(validate({phase:"publication-control-function",role,method:"Debugger.setBreakpointOnFunctionCall",params:{objectId,condition:""}})));this.requireHeld(original);this.#insert(result.breakpointId,target);}
   this.#armed=true;
  }catch(error){this.fail();throw error;}
 }
 /** Require the same retained pause, never a historical frame identifier. */
 public requireHeld(original:CurrentSchematicRelevancePublicationOriginal):void{this.#host.current();need(!this.#failed&&this.#held===original);}
 /** Burn the single next resume before its asynchronous original transfer. */
 public reserve(original:CurrentSchematicRelevancePublicationOriginal):CurrentSchematicRelevancePublicationResume{this.requireHeld(original);need(this.#armed&&this.#reservation===null);const target=roles[this.#ordinal];need(target!==undefined&&original.role===(this.#ordinal===0?"publicationPublish":roles[this.#ordinal-1]));const value=Object.freeze({original,target,ordinal:this.#ordinal});this.#reservation=value;this.#submitted=false;this.#resumed=false;this.#resumeSignal=Promise.withResolvers<boolean>();this.#heldSignal=Promise.withResolvers<CurrentSchematicRelevancePublicationHeld|null>();return value;}
 /** Reprove the unused reservation immediately before its original transport. */
 public requireResume(value:CurrentSchematicRelevancePublicationResume):void{this.requireHeld(value.original);need(this.#reservation===value&&!this.#submitted&&!this.#resumed);}
 /** Mark submission inside transfer so pre-dispatch resumed events fail. */
 public markSubmitted(value:CurrentSchematicRelevancePublicationResume):void{this.requireResume(value);this.#submitted=true;}
 /** Join only the resumed signal belonging to this consumed reservation. */
 public async waitResumed(value:CurrentSchematicRelevancePublicationResume):Promise<void>{need(this.#reservation===value&&this.#resumeSignal!==null);need(await this.#resumeSignal.promise);this.#host.current();need(!this.#failed&&this.#resumed);}
 /** Called only after the actual empty ACK; an early next-pause remains retained. */
 public async complete(value:CurrentSchematicRelevancePublicationResume):Promise<CurrentSchematicRelevancePublicationHeld>{need(this.#reservation===value&&this.#submitted&&this.#resumed&&this.#heldSignal!==null);const held=await this.#heldSignal.promise;need(held!==null&&this.#reservation===value&&this.#ordinal===value.ordinal);this.requireHeld(held);this.#ordinal+=1;this.#reservation=null;return held;}
 /** Classify exact source locations and the original local-loopback caller. */
 #eventRole(event:DiagnosticEvent):CurrentSchematicRelevancePublicationRole|null{
  const ids=event.params["hitBreakpoints"];const frames=event.params["callFrames"];if(!Array.isArray(ids)||!Array.isArray(frames)||frames.length===0){return null;}const matches=ids.filter((id:unknown):id is string=>typeof id==="string"&&this.#points.has(id));if(matches.length===0){return null;}need(ids.length===1&&matches.length===1);const id=matches[0];need(id!==undefined);const role=this.#points.get(id);need(role!==undefined);const first=frame.parse(frames[0]);
  let sourceRole:ReturnRole="post";if(role==="publicationPublisherReturned"){sourceRole="publisher";}else if(role==="publicationTimerReturned"){sourceRole="timer";}else if(role==="publicationLoopback"||role==="publicationLoopbackReturned"){sourceRole="loopback";}const at=functionPoint(this.#variant,sourceRole);need(first.functionLocation.scriptId===this.#script&&first.functionLocation.lineNumber===at.lineNumber&&first.functionLocation.columnNumber===at.columnNumber&&first.location.scriptId===this.#script);
  if(role==="publicationPost"||role==="publicationLoopback"){need(first.location.lineNumber===at.lineNumber&&first.location.columnNumber===at.columnNumber+(role==="publicationPost"?4:13));if(role==="publicationLoopback"){const caller=frame.parse(frames[1]);const arrow=BUS[this.#variant].roles.loopback;need(caller.functionLocation.scriptId===this.#script&&caller.functionLocation.lineNumber===arrow.lineNumber&&caller.functionLocation.columnNumber===arrow.columnNumber&&caller.location.scriptId===this.#script&&caller.location.lineNumber===arrow.lineNumber&&caller.location.columnNumber===arrow.columnNumber+10);}}
  else{const end=returnPoint(this.#variant,sourceRole);need(first.location.lineNumber===end.lineNumber&&first.location.columnNumber===end.columnNumber&&z.strictObject({type:z.literal("undefined")}).safeParse(first.returnValue).success);}
  return role;
 }
 /** Consume only this source lane on the original callback reader. */
 public observe(event:DiagnosticEvent):boolean{
  if(event.sessionId!==this.#session){return false;}
  if(event.method==="Debugger.resumed"){if(this.#reservation===null){return false;}try{this.#host.current();need(!this.#failed&&this.#submitted&&!this.#resumed&&this.#held===this.#reservation.original&&Reflect.ownKeys(event.params).length===0);this.#held=null;this.#resumed=true;this.#host.resumed();this.#resumeSignal?.resolve(true);}catch{this.fail();}return true;}
  if(event.method!=="Debugger.paused"){return false;}
  try{const role=this.#eventRole(event);if(role===null){return false;}this.#host.current();need(!this.#failed&&this.#armed&&this.#reservation!==null&&this.#submitted&&this.#resumed&&this.#held===null&&this.#reservation.target===role&&this.#heldSignal!==null&&event.params["reason"]==="other");const frames=event.params["callFrames"];need(Array.isArray(frames));const first=frame.parse(frames[0]),held=Object.freeze({event,role,callFrameId:first.callFrameId});this.#held=held;this.#host.held(held);this.#heldSignal.resolve(held);return true;}catch{this.fail();return true;}
 }
 /** Stop every original waiter without repeating a body or native control. */
 public fail():void{this.#resumeSignal?.resolve(false);this.#heldSignal?.resolve(null);if(!this.#failed){this.#failed=true;this.#host.fail();}}
}
