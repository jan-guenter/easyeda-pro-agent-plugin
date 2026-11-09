/** Original native-task UI result custody. A fresh lane consumes only its
 * genuine IGIVE return, retaining the same invocation and all helper work. */
import { types } from "node:util";
import { z } from "zod";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_RESULT_REQUESTS as LIMIT, currentFootprintInverseNativeGetTaskResultProgram as program, qualifyCurrentFootprintInverseNativeGetTaskResultHelper as qualify, validateCurrentFootprintInverseNativeGetTaskResultCommand as validate } from "./current-footprint-inverse-native-get-task-result-protocol.ts";
import type { CurrentFootprintInverseNativeGetTaskResultCommand as Command } from "./current-footprint-inverse-native-get-task-result-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_RESULT_POINTS as POINTS } from "./current-footprint-inverse-native-get-task-result-programs.ts";
import { currentFootprintInverseNativeGetTaskResultPause as pause } from "./current-footprint-inverse-native-get-task-result-replies.ts";
import type { CurrentFootprintInverseNativeGetTaskResultHeld as Held } from "./current-footprint-inverse-native-get-task-result-replies.ts";
import { observeCurrentFootprintInverseNativeGetTaskResult as observe } from "./current-footprint-inverse-native-get-task-result-observer.ts";
import type { CurrentFootprintInverseNativeGetTaskResultBindings as ObserverBindings, CurrentFootprintInverseNativeGetTaskResultReceipt as Receipt } from "./current-footprint-inverse-native-get-task-result-observer.ts";

export interface CurrentFootprintInverseNativeGetTaskResultBindings extends Omit<ObserverBindings, "request" | "armed" | "wait" | "resumed" | "control"> {
 readonly sessionId:string; readonly contextId:number; readonly originalEvent:DiagnosticEvent;
 readonly assertOriginalUiHeld:()=>void; readonly assertOriginalEvent:(event:DiagnosticEvent)=>void; readonly assertOriginalExit:()=>void;
 readonly send:(command:Command)=>Promise<unknown>;
 /** The original Core consumes the UI hold only inside the first actual
  * transfer callback, after all verification and publication awaits. */
 readonly resume:(command:Command,beforeTransfer:()=>void)=>Promise<unknown>;
 readonly control:(phase:"bind"|"functions"|"armed"|"prepared"|"resumed"|"held"|"complete",fields?:Readonly<Record<string,string>>)=>Promise<void>;
}
interface Helper { readonly command:Command; readonly source:string; scriptId:string|null }
const originals=new WeakSet<object>();
const order=Object.freeze(["onMessage:local","onMessage:native","onMessage:native","reply","execute","callback","returned"]as const);
function need(value:boolean):asserts value { if(!value){throw new Error("INVERSE_NATIVE_GET_TASK_RESULT_CUSTODY");} }
function record(value:unknown):value is Record<string,unknown> { return value!==null&&typeof value==="object"&&!types.isProxy(value)&&!Array.isArray(value); }
/** Keep every original pause and helper behind a sticky once ledger. After
 * completion this observer is closed, so later original work cannot replay it. */
export class CurrentFootprintInverseNativeGetTaskResultController {
 readonly #b:CurrentFootprintInverseNativeGetTaskResultBindings; readonly #points=new Map<string,keyof typeof POINTS>(); readonly #removed=new Set<string>();
 #pending:Promise<Receipt>|null=null; #receipt:Receipt|null=null; #helper:Helper|null=null; #held:DiagnosticEvent|null; #queued:DiagnosticEvent|null=null;
 #arming:keyof typeof POINTS|null=null; #resolved:string|null=null; #functions:Readonly<Record<string,string>>|null=null;
 #requests=0; #helpers=0; #pauses=0; #resumes=0; #delivered=0; #failed=false; #reading=false; #awaitResume=false; #resumed=false; #prepared=false;
 /** Retain the original held event without accepting a matching caller copy. */
 public constructor(bindings:CurrentFootprintInverseNativeGetTaskResultBindings){this.#b=Object.freeze({...bindings});this.#held=bindings.originalEvent;originals.add(this);}
 /** Make any original-owner failure permanent around every awaited operation. */
 #current():void { try{this.#b.current();need(!this.#failed);}catch(caughtError){this.#failed=true;throw caughtError;} }
 /** Admit only the actual original helper/resume/pause stream in its exact
  * order. Metadata and original source PCs are checked before frame reads. */
 public observe(event:DiagnosticEvent):boolean { if(event.sessionId!==this.#b.sessionId||this.#receipt!==null){return false;}try{this.#current();this.#b.assertOriginalEvent(event);
  if(event.method==="Debugger.scriptParsed"&&event.params["url"]===""){const helper=this.#helper;need(helper!==null&&helper.scriptId===null&&event.params["executionContextId"]===this.#b.contextId&&typeof event.params["scriptId"]==="string");helper.scriptId=event.params["scriptId"];return true;}
  if(event.method==="Debugger.breakpointResolved"){const role=this.#arming;const location=event.params["location"];need(role!==null&&this.#resolved===null&&typeof event.params["breakpointId"]==="string"&&record(location));const site=POINTS[role];need(location["scriptId"]===this.#b.scripts.ui&&location["lineNumber"]===site.lineNumber&&location["columnNumber"]===site.columnNumber);this.#resolved=event.params["breakpointId"];return true;}
  if(event.method==="Debugger.resumed"){need(this.#awaitResume&&!this.#resumed&&Reflect.ownKeys(event.params).length===0);this.#awaitResume=false;this.#resumed=true;this.#held=null;return true;}
  if(event.method==="Debugger.paused"){need(this.#resumed&&!this.#awaitResume&&this.#queued===null&&this.#held===null&&(this.#pauses+=1)<=LIMIT.events);const held=pause(event,this.#b.sessionId,this.#b.scripts,this.#points,this.#b.forwarded.onMessagePoint);need((held.role==="onMessage"?`onMessage:${held.kind??""}`:held.role)===order[this.#pauses-1]&&this.#resumes===this.#pauses);this.#queued=event;return true;}return false;
 }catch(caughtError){this.#failed=true;throw caughtError;} }
 /** Burn start before the first await and retain that same promise through
  * final original callback return and actual Promise.race settlement. */
 public start():Promise<Receipt> { if(this.#pending!==null){return this.#pending;}const pending=Promise.withResolvers<Receipt>();this.#pending=pending.promise;void(async():Promise<void>=>{try{this.#current();this.#b.assertOriginalUiHeld();this.#b.assertOriginalEvent(this.#b.originalEvent);await this.#b.control("bind");this.#current();const receipt=await observe({...this.#b,request:input=>this.#read(input),armed:(role,point)=>this.#armed(role,point),wait:()=>this.#wait(),resumed:()=>this.#waitResumed(),control:(phase,fields)=>this.#control(phase,fields)});this.#current();need(this.#receipt===null&&this.#prepared&&this.#resumes===8&&this.#pauses===7&&this.#delivered===7&&this.#held===null&&this.#queued===null&&this.#helper===null&&!this.#reading&&!this.#awaitResume&&this.#points.size===4&&this.#removed.size===6);this.#receipt=receipt;pending.resolve(receipt);}catch(caughtError){this.#failed=true;pending.reject(caughtError);}})();return pending.promise; }
 /** Submit only this finite grammar. Helpers are correlated and qualified
  * immediately; a failed request permanently closes all later transfer paths. */
 async #read(input:Command):Promise<unknown> { try{this.#current();need(!this.#reading&&this.#helper===null&&this.#receipt===null&&(this.#requests+=1)<=LIMIT.cdpRequests);this.#reading=true;const command=validate(input);const source=program(command);const helper:Helper|null=source===null?null:{command,source,scriptId:null};this.#helper=helper;
  if(command.method==="Debugger.setBreakpoint"||command.method==="Debugger.setBreakpointOnFunctionCall"){need(this.#functions!==null&&!this.#prepared&&this.#arming===null);if(command.method==="Debugger.setBreakpointOnFunctionCall"){need(this.#functions[command.role]===command.params.objectId);}this.#arming=command.role;this.#resolved=null;}
  let raw:unknown;if(command.method==="Debugger.resume"){need(this.#prepared&&this.#held!==null&&this.#queued===null&&!this.#awaitResume&&this.#resumes<8);raw=await this.#b.resume(command,():void=>{this.#current();need(this.#held!==null&&!this.#awaitResume);this.#resumes+=1;this.#awaitResume=true;this.#resumed=false;});}else{raw=await this.#b.send(command);}this.#current();
  if(helper!==null){need(this.#helper===helper&&helper.scriptId!==null&&(this.#helpers+=1)<=LIMIT.helpers&&(this.#requests+=1)<=LIMIT.cdpRequests);const actual=await this.#b.send(validate({phase:"inverse-native-get-task-result-helper",method:"Debugger.getScriptSource",params:{scriptId:helper.scriptId}}));this.#current();qualify(actual,helper.source);this.#helper=null;}
  if(command.method==="Debugger.removeBreakpoint"){need(JSON.stringify(capture(raw))==="{}"&&!this.#removed.has(command.params.breakpointId)&&([...this.#points.keys(),this.#b.forwarded.onMessagePoint,this.#b.forwarded.postReturnedPoint]).includes(command.params.breakpointId));this.#removed.add(command.params.breakpointId);}return raw;
 }catch(caughtError){this.#failed=true;throw caughtError;}finally{this.#reading=false;} }
 /** Retain only an actual arm reply paired with its optional resolution. */
 async #armed(role:keyof typeof POINTS,point:string):Promise<void> { this.#current();need(this.#arming===role&&point!==this.#b.forwarded.onMessagePoint&&point!==this.#b.forwarded.postReturnedPoint&&!this.#points.has(point)&&![...this.#points.values()].includes(role)&&(this.#resolved===null||this.#resolved===point));this.#points.set(point,role);this.#arming=null;this.#resolved=null;await this.#b.control("armed",{pointRole:role,breakpointId:point});this.#current(); }
 /** Keep the native causal controls identical to this controller's retained
  * state, with no public result, reference or delete grant inferred. */
 async #control(phase:"functions"|"prepared"|"complete",fields:Readonly<Record<string,string>>={}):Promise<void> { this.#current();if(phase==="functions"){need(this.#functions===null&&Reflect.ownKeys(fields).length===4&&["reply","execute","callback","uiScript"].every(name=>typeof fields[name]==="string")&&fields["uiScript"]===this.#b.scripts.ui);this.#functions=Object.freeze({...fields});}else if(phase==="prepared"){need(!this.#prepared&&this.#functions!==null&&this.#points.size===4&&this.#helper===null);this.#b.assertOriginalUiHeld();this.#prepared=true;}else{need(this.#prepared&&this.#resumes===8&&this.#pauses===7&&this.#delivered===7&&this.#held===null&&this.#helper===null&&this.#removed.size===6&&!this.#awaitResume);}await this.#b.control(phase,fields);this.#current(); }
 /** Deliver each actual pause once, after the paired real resumed event. */
 async #wait():Promise<Held> { const started=performance.now();while(this.#queued===null){this.#current();need(performance.now()-started<30_000);await this.#b.poll();this.#current();}const event=this.#queued;this.#queued=null;this.#held=event;this.#b.assertOriginalEvent(event);const held=pause(event,this.#b.sessionId,this.#b.scripts,this.#points,this.#b.forwarded.onMessagePoint);need((this.#delivered+=1)===this.#pauses);await this.#b.control("held",{role:held.role,breakpointId:z.tuple([z.string()]).parse(event.params["hitBreakpoints"])[0]});this.#current();return held; }
 /** Empty resume ACKs cannot replace the original stream notification. */
 async #waitResumed():Promise<void> { const started=performance.now();while(!this.#resumed){this.#current();need(performance.now()-started<30_000);await this.#b.poll();this.#current();}await this.#b.control("resumed");this.#current(); }
 /** Require the exact completed receipt under current original custody. */
 public requireOriginalCompletion(receipt:Receipt):Receipt { this.#current();need(this.#receipt===receipt&&this.#pending!==null&&!this.#reading&&this.#helper===null&&this.#held===null);return receipt; }
 /** Join the retained original pipeline after real root/Job exit; cleanup
  * issues no replacement helper, Promise, invocation or late read. */
 public async settleAfterOriginalExit():Promise<void> { this.#b.assertOriginalExit();this.#failed=true;await Promise.allSettled([this.#pending]);this.#b.assertOriginalExit(); }
}
const methods=Object.getOwnPropertyDescriptors(CurrentFootprintInverseNativeGetTaskResultController.prototype);
/** Refuse copied controllers, Proxy traps and substituted prototype members. */
export function assertOriginalCurrentFootprintInverseNativeGetTaskResultController(value:CurrentFootprintInverseNativeGetTaskResultController):void { need(value!==null&&typeof value==="object"&&!types.isProxy(value)&&originals.has(value)&&Object.getPrototypeOf(value)===CurrentFootprintInverseNativeGetTaskResultController.prototype&&Reflect.ownKeys(value).length===0);const observed=Object.getOwnPropertyDescriptors(CurrentFootprintInverseNativeGetTaskResultController.prototype);need(Reflect.ownKeys(observed).length===Reflect.ownKeys(methods).length&&Object.entries(methods).every(([name,descriptor])=>{const now=observed[name];return now!==undefined&&now.value===descriptor.value&&now.get===descriptor.get&&now.set===descriptor.set&&now.writable===descriptor.writable&&now.enumerable===descriptor.enumerable&&now.configurable===descriptor.configurable;})); }
