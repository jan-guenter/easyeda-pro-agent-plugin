/** One original event stream. Every body resume consumes its reservation
 * before transfer and joins both the actual ACK and Debugger.resumed. */
import {z} from "zod";
import type {DiagnosticEvent} from "./current-pcb-diagnostic-protocol.ts";
import {captureCurrentPcbStringClockReply} from "./current-pcb-string-clock-reply.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_NOTIFICATION_POINTS as POINTS,CURRENT_SCHEMATIC_RELEVANCE_NOTIFICATION_CONTROL_REQUESTS as REQUESTS,validateCurrentSchematicRelevanceNotificationControlCommand as validate} from "./current-schematic-relevance-notification-control-protocol.ts";
import type {CurrentSchematicRelevanceNotificationControlCommand as Command} from "./current-schematic-relevance-notification-control-protocol.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_NORMAL_UI_SOURCE as SOURCE} from "./current-schematic-relevance-normal-ui-source.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_SDK_GATE_SOURCE as SDK} from "./current-schematic-relevance-sdk-gate-programs.ts";

interface NotificationPlan {readonly scriptId:string;readonly jobs:readonly Readonly<{watchers:readonly Readonly<{targetObjectId:string}>[]}>[]}


export type CurrentSchematicRelevanceNotificationRole="notificationJob"|"notificationJobReturned"|"notificationVisit"|"notificationVisitReturned"|"notificationDispatch"|"notificationDispatchReturned"|"sdkRunFulfilled";
export interface CurrentSchematicRelevanceNotificationOriginal {readonly event:DiagnosticEvent;readonly role:string;readonly callFrameId:string}
export interface CurrentSchematicRelevanceNotificationHeld extends CurrentSchematicRelevanceNotificationOriginal {readonly role:CurrentSchematicRelevanceNotificationRole;readonly returnPromiseObjectId?:string}
export interface CurrentSchematicRelevanceNotificationResume {readonly original:CurrentSchematicRelevanceNotificationOriginal;readonly target:CurrentSchematicRelevanceNotificationRole;readonly job:number;readonly watcher:number;readonly ordinal:number}
export interface CurrentSchematicRelevanceNotificationControllerHost {readonly current:()=>void;readonly request:(command:Command)=>Promise<unknown>;readonly held:(value:CurrentSchematicRelevanceNotificationHeld)=>void;readonly resumed:()=>void;readonly fail:()=>void}
const token=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const point=z.strictObject({scriptId:token,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const frame=z.object({callFrameId:token,functionLocation:point,location:point,returnValue:z.unknown().optional()});
const optionalPoint=point.extend({type:z.string().optional()});
const possibleReply=z.strictObject({locations:z.array(optionalPoint).max(128)});
const armReply=z.strictObject({breakpointId:token,actualLocation:point});
const armFunctionReply=z.strictObject({breakpointId:token});
function need(value:boolean):asserts value {if(!value){throw new Error("SCH_NOTIFICATION_ORIGINAL_EVENT");}}
export class CurrentSchematicRelevanceNotificationController {
 readonly #host:CurrentSchematicRelevanceNotificationControllerHost;
 readonly #session:string;readonly #script:string;readonly #sdkScript:string;readonly #prepared:NotificationPlan;
 readonly #points=new Map<string,CurrentSchematicRelevanceNotificationRole>();readonly #foreign:ReadonlySet<string>;
 #held:CurrentSchematicRelevanceNotificationOriginal|null;#attempted=false;#armed=false;#failed=false;#ordinal=0;#job=0;#watcher=0;
 #reservation:CurrentSchematicRelevanceNotificationResume|null=null;#submitted=false;#resumed=false;
 #resumeSignal:ReturnType<typeof Promise.withResolvers<boolean>>|null=null;#nextSignal:ReturnType<typeof Promise.withResolvers<CurrentSchematicRelevanceNotificationHeld|null>>|null=null;
 /** Bind the same original final command pause and its already armed queued breakpoint. */
 public constructor(host:CurrentSchematicRelevanceNotificationControllerHost,session:string,script:string,sdkScript:string,prepared:NotificationPlan,original:CurrentSchematicRelevanceNotificationOriginal,queuedPoint:string,foreign:readonly string[]){this.#host=host;this.#session=token.parse(session);this.#script=token.parse(script);this.#sdkScript=token.parse(sdkScript);this.#prepared=prepared;this.#held=original;this.#foreign=new Set(foreign);need(original.role==="commandReturned"&&prepared.scriptId===script&&prepared.jobs.length > 0&&prepared.jobs.length<=4&&!this.#foreign.has(queuedPoint));this.#points.set(token.parse(queuedPoint),"notificationJob");Object.freeze(this);}
 async #request(command:Command):Promise<unknown>{this.#host.current();const result=await this.#host.request(command);this.#host.current();return captureCurrentPcbStringClockReply(result).value;}
 /** Prove exact V8 return locations before arming only the original callback boundaries. */
 public async arm():Promise<void>{
  need(!this.#attempted&&!this.#failed);this.#attempted=true;const original=this.#held;need(original!==null);
  try{
   for(const kind of["jobReturned","visitReturned","dispatchReturned"]as const){const target=POINTS[kind];const start=SOURCE.roles[target.role];const reply=possibleReply.parse(await this.#request(validate({phase:"notification-possible",kind,method:"Debugger.getPossibleBreakpoints",params:{start:{scriptId:this.#script,lineNumber:start.lineNumber,columnNumber:start.columnNumber},end:{scriptId:this.#script,lineNumber:target.lineNumber,columnNumber:target.columnNumber+1},restrictToFunction:true}})));this.requireHeld(original);need(reply.locations.filter(value=>value.scriptId===this.#script&&value.lineNumber===target.lineNumber&&value.columnNumber===target.columnNumber&&value.type==="return").length===1);if(kind==="visitReturned"){need(reply.locations.filter(value=>value.scriptId===this.#script&&value.lineNumber===POINTS.visit.lineNumber&&value.columnNumber===POINTS.visit.columnNumber).length===1);}}
   const roles={jobReturned:"notificationJobReturned",visit:"notificationVisit",visitReturned:"notificationVisitReturned",dispatchReturned:"notificationDispatchReturned"}as const;
   for(const kind of["jobReturned","visit","visitReturned","dispatchReturned"]as const){const target=POINTS[kind];const reply=armReply.parse(await this.#request(validate({phase:"notification-arm",kind,method:"Debugger.setBreakpoint",params:{location:{scriptId:this.#script,lineNumber:target.lineNumber,columnNumber:target.columnNumber},condition:""}})));this.requireHeld(original);need(reply.actualLocation.scriptId===this.#script&&reply.actualLocation.lineNumber===target.lineNumber&&reply.actualLocation.columnNumber===target.columnNumber&&!this.#points.has(reply.breakpointId)&&!this.#foreign.has(reply.breakpointId));this.#points.set(reply.breakpointId,roles[kind]);}
   const watcher=this.#prepared.jobs.flatMap(value=>value.watchers)[0];if(watcher!==undefined){const reply=armFunctionReply.parse(await this.#request(validate({phase:"notification-arm-dispatch",method:"Debugger.setBreakpointOnFunctionCall",params:{objectId:watcher.targetObjectId,condition:""}})));this.requireHeld(original);need(!this.#points.has(reply.breakpointId)&&!this.#foreign.has(reply.breakpointId));this.#points.set(reply.breakpointId,"notificationDispatch");}
   this.#armed=true;this.requireHeld(original);
  }catch(error){this.fail();throw error;}
 }
 /** Refuse stale metadata after the original pause has resumed or been replaced. */
 public requireHeld(held:CurrentSchematicRelevanceNotificationOriginal):void{this.#host.current();need(!this.#failed&&this.#held===held);}
 #next(held:CurrentSchematicRelevanceNotificationOriginal):Readonly<{target:CurrentSchematicRelevanceNotificationRole;job:number;watcher:number}>{
  const job=this.#prepared.jobs[this.#job];need(job!==undefined);
  if(held.role==="commandReturned"){return{target:"notificationJob",job:0,watcher:0};}
  if(held.role==="notificationJob"){return{target:job.watchers.length===0?"notificationJobReturned":"notificationVisit",job:this.#job,watcher:0};}
  if(held.role==="notificationVisit"){return{target:"notificationDispatch",job:this.#job,watcher:this.#watcher};}
  if(held.role==="notificationDispatch"){return{target:"notificationDispatchReturned",job:this.#job,watcher:this.#watcher};}
  if(held.role==="notificationDispatchReturned"){return{target:"notificationVisitReturned",job:this.#job,watcher:this.#watcher};}
  if(held.role==="notificationVisitReturned"){return{target:this.#watcher+1<job.watchers.length?"notificationVisit":"notificationJobReturned",job:this.#job,watcher:this.#watcher+1};}
  need(held.role==="notificationJobReturned");return{target:this.#job+1<this.#prepared.jobs.length?"notificationJob":"sdkRunFulfilled",job:this.#job+1,watcher:0};
 }
 /** Reserve exactly the next source-owned callback before any transfer can await. */
 public reserve(held:CurrentSchematicRelevanceNotificationOriginal):CurrentSchematicRelevanceNotificationResume{this.requireHeld(held);need(this.#armed&&this.#reservation===null&&this.#ordinal<REQUESTS.resumes);const reservation=Object.freeze({original:held,...this.#next(held),ordinal:this.#ordinal});this.#reservation=reservation;this.#submitted=false;this.#resumed=false;this.#resumeSignal=Promise.withResolvers<boolean>();this.#nextSignal=Promise.withResolvers<CurrentSchematicRelevanceNotificationHeld|null>();return reservation;}
 /** Only the exact unused private reservation can reach the transport. */
 public requireResume(value:CurrentSchematicRelevanceNotificationResume):void{this.requireHeld(value.original);need(this.#reservation===value&&!this.#submitted&&!this.#resumed);}
 /** Mark submission synchronously inside the actual transfer to reject early events. */
 public markSubmitted(value:CurrentSchematicRelevanceNotificationResume):void{this.requireResume(value);this.#submitted=true;}
 /** Join the actual same-session resumed event without assuming ACK order. */
 public async waitResumed(value:CurrentSchematicRelevanceNotificationResume):Promise<void>{need(this.#reservation===value&&this.#resumeSignal!==null);need(await this.#resumeSignal.promise);this.#host.current();need(!this.#failed&&this.#resumed);}
 /** Called after the actual empty ACK; join the exact next pause and consume the step. */
 public async complete(value:CurrentSchematicRelevanceNotificationResume):Promise<CurrentSchematicRelevanceNotificationHeld>{need(this.#reservation===value&&this.#submitted&&this.#resumed&&this.#nextSignal!==null);const held=await this.#nextSignal.promise;need(held!==null&&this.#reservation===value&&value.ordinal===this.#ordinal);this.requireHeld(held);this.#job=value.job;this.#watcher=value.watcher;this.#ordinal+=1;this.#reservation=null;return held;}
 #role(event:DiagnosticEvent):CurrentSchematicRelevanceNotificationRole|null{
  const frames=event.params["callFrames"],ids=event.params["hitBreakpoints"];
  if(!Array.isArray(frames)||!Array.isArray(ids)||frames.length===0){return null;}
  const first=frame.parse(frames[0]);
  if(ids.some(id=>typeof id==="string"&&this.#points.has(id))){
   need(ids.length===1&&typeof ids[0]==="string");const role=this.#points.get(ids[0]);need(role!==undefined&&role!=="sdkRunFulfilled");
   let key:"notification"|"notificationVisit"|"reactDispatch"="reactDispatch";
   if(role==="notificationJob"||role==="notificationJobReturned"){key="notification";}else if(role==="notificationVisit"||role==="notificationVisitReturned"){key="notificationVisit";}
   const expected=SOURCE.roles[key];need(first.functionLocation.scriptId===this.#script&&first.functionLocation.lineNumber===expected.lineNumber&&first.functionLocation.columnNumber===expected.columnNumber&&first.location.scriptId===this.#script);
   let at:{readonly lineNumber:number;readonly columnNumber:number};
   if(role==="notificationJob"){at={lineNumber:1172,columnNumber:1_832_165};}else if(role==="notificationDispatch"){at={lineNumber:1039,columnNumber:24_871};}else if(role==="notificationJobReturned"){at=POINTS.jobReturned;}else if(role==="notificationVisit"){at=POINTS.visit;}else if(role==="notificationVisitReturned"){at=POINTS.visitReturned;}else{at=POINTS.dispatchReturned;}
   need(first.location.lineNumber===at.lineNumber&&first.location.columnNumber===at.columnNumber);
   if(role!=="notificationJob"&&role!=="notificationJobReturned"){
    const caller=frame.parse(frames[1]);let owner:{readonly lineNumber:number;readonly columnNumber:number}=SOURCE.roles.notificationVisit;
    if(role==="notificationVisit"||role==="notificationVisitReturned"){owner=SOURCE.roles.notification;}
    need(caller.functionLocation.scriptId===this.#script&&caller.location.scriptId===this.#script&&caller.functionLocation.lineNumber===owner.lineNumber&&caller.functionLocation.columnNumber===owner.columnNumber);
   }
   return role;
  }
  if(first.functionLocation.scriptId!==this.#sdkScript){return null;}
  need(ids.length===0&&first.location.scriptId===this.#sdkScript&&first.functionLocation.lineNumber===SDK.functionLocation.lineNumber&&first.functionLocation.columnNumber===SDK.functionLocation.columnNumber&&first.location.lineNumber===SDK.markers.runFulfilled.lineNumber&&first.location.columnNumber===SDK.markers.runFulfilled.columnNumber);
  return"sdkRunFulfilled";
 }
 /** Consume only this lane's correlated pauses and reserved resumed events on the shared stream. */
 public observe(event:DiagnosticEvent):boolean{if(event.sessionId!==this.#session){return false;}if(event.method==="Debugger.resumed"){if(this.#reservation===null){return false;}try{this.#host.current();need(!this.#failed&&this.#submitted&&!this.#resumed&&this.#held===this.#reservation.original&&Reflect.ownKeys(event.params).length===0);this.#held=null;this.#resumed=true;this.#host.resumed();this.#resumeSignal?.resolve(true);}catch{this.fail();}return true;}if(event.method!=="Debugger.paused"){return false;}try{const role=this.#role(event);if(role===null){return false;}this.#host.current();need(!this.#failed&&this.#armed&&this.#reservation!==null&&this.#submitted&&this.#resumed&&this.#held===null&&this.#nextSignal!==null&&this.#reservation.target===role&&event.params["reason"]==="other");const frames=event.params["callFrames"];need(Array.isArray(frames));const first=frame.parse(frames[0]);let promise:string|undefined;if(role==="notificationVisitReturned"){const value=z.strictObject({type:z.literal("object"),subtype:z.literal("promise"),className:z.literal("Promise"),description:z.literal("Promise"),objectId:token}).parse(first.returnValue);promise=value.objectId;}else if(role==="notificationJobReturned"||role==="notificationDispatchReturned"){z.strictObject({type:z.literal("undefined")}).parse(first.returnValue);}const held=Object.freeze({event,role,callFrameId:first.callFrameId,...(promise===undefined?{}:{returnPromiseObjectId:promise})});this.#held=held;this.#host.held(held);this.#nextSignal.resolve(held);return true;}catch{this.fail();return true;}}
 /** Settle this lane's original waiters and preserve the owner's existing failure custody. */
 public fail():void{this.#resumeSignal?.resolve(false);this.#nextSignal?.resolve(null);if(!this.#failed){this.#failed=true;this.#host.fail();}}
}
