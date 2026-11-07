/* oxlint-disable import/max-dependencies -- Source-owned monitor and callback roles share one original event stream and separate fixed metadata profiles. */
import {CURRENT_SCHEMATIC_RELEVANCE_HISTORY_CALLEE_SOURCE as HISTORY_COMMAND} from "./current-schematic-relevance-history-callee-source.ts";
import {validateCurrentSchematicRelevanceHistoryCommand as historyCommand} from "./current-schematic-relevance-history-command-protocol.ts";
import type {CurrentSchematicRelevanceHistoryCommand as HistoryCommand} from "./current-schematic-relevance-history-command-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODEL_CALLEE_SOURCE as MODEL } from "./current-schematic-relevance-model-callee-source.ts";
import { GENERATED_SCHEMATIC_DISPLAY_ACTION_SOURCE as ACTION } from "./generated-schematic-display-action-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MONITOR_BATCH_ROLES as MONITORS, validateCurrentSchematicRelevanceMonitorBatchCommand as monitorCommand } from "./current-schematic-relevance-monitor-batch-protocol.ts";
import type { CurrentSchematicRelevanceMonitorBatchCommand as MonitorCommand } from "./current-schematic-relevance-monitor-batch-protocol.ts";
import type { CurrentSchematicRelevanceActiveHistoryReceipt } from "./current-schematic-relevance-active-history-cursor.ts";
/** One original UI pause lane. It shares the owner's existing event stream;
 * it never polls, resumes a pause or treats a timeout as completion. */
import { z } from "zod";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import type { CurrentSchematicRelevanceDisplayAccessorFunctions } from "./current-schematic-relevance-display-accessor-observer.ts";
import { GENERATED_SCHEMATIC_DISPLAY_ACCESSOR_SOURCE as SOURCES } from "./generated-schematic-display-accessor-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_ACTION_MARKERS as MARKERS } from "./current-schematic-relevance-display-action-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_DISPLAY_CALLBACK_LOCATION as CALLBACK } from "./current-schematic-relevance-display-modify-entry-replies.ts";
import { validateCurrentSchematicRelevanceDisplayModifyEntryCommand as validate } from "./current-schematic-relevance-display-modify-entry-protocol.ts";
import type { CurrentSchematicRelevanceDisplayModifyEntryCommand as Command } from "./current-schematic-relevance-display-modify-entry-protocol.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const point = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const frame = z.object({ callFrameId: handle, functionLocation: point, location: point });
const roles = ["setAttribute", "record", "ast"] as const;
const functionKeys = Object.freeze({ setAttribute: "setAttributeObjectId", record: "recordObjectId", ast: "astObjectId" } as const);
const sourceKeys = Object.freeze({ setAttribute: "monitorSetAttribute", record: "monitorRecord", ast: "monitorAst" } as const);
const historyRoles=["historyGetModel","commandAttribute","finish"] as const;
type HistoryRole=typeof historyRoles[number];
export interface CurrentSchematicRelevanceHistoryResume{readonly original:CurrentSchematicRelevanceActionCallbackHeld;readonly target:HistoryRole}
type MonitorRole = typeof MONITORS[number];
export interface CurrentSchematicRelevanceMonitorResume {readonly original:CurrentSchematicRelevanceActionCallbackHeld;readonly target:MonitorRole}
export type CurrentSchematicRelevanceActionCallbackRole = "entry" | "setter" | "finish" | "failure" | "historyGetModel" | "commandAttribute" | MonitorRole | typeof roles[number];
export interface CurrentSchematicRelevanceActionCallbackHeld { readonly event: DiagnosticEvent; readonly role: CurrentSchematicRelevanceActionCallbackRole; readonly callFrameId: string }
export interface CurrentSchematicRelevanceActionEntryResume { readonly original: CurrentSchematicRelevanceActionCallbackHeld }
export interface CurrentSchematicRelevanceActionSetterResume { readonly original: CurrentSchematicRelevanceActionCallbackHeld }
export interface CurrentSchematicRelevanceActionPrimitiveResume { readonly original: CurrentSchematicRelevanceActionCallbackHeld }
export interface CurrentSchematicRelevanceActionRecordResume { readonly original: CurrentSchematicRelevanceActionCallbackHeld }
export interface CurrentSchematicRelevanceActionCallbackHost {
  readonly sessionId: string; readonly callbackScriptId: string; readonly sourceScriptId: string; readonly variant: 0 | 1; readonly functions: Pick<CurrentSchematicRelevanceDisplayAccessorFunctions, "setAttributeObjectId" | "recordObjectId" | "astObjectId" | "normalRequests">;
  readonly historyRequest?:(command:HistoryCommand)=>Promise<unknown>; readonly monitorRequest?: (command:MonitorCommand)=>Promise<unknown>; readonly request: (command: Command) => Promise<unknown>; readonly assertCurrent: () => void; readonly fail: () => void;
}
function need(value: boolean): asserts value { if (!value) { throw new Error("SCHEMATIC_RELEVANCE_ORIGINAL_CALLBACK_EVENT"); } }
export class CurrentSchematicRelevanceActionCallbackController {
  readonly #host: CurrentSchematicRelevanceActionCallbackHost;
  readonly #points = new Map<string, typeof roles[number] | MonitorRole | "historyGetModel" | "commandAttribute">(); readonly #entry = Promise.withResolvers<CurrentSchematicRelevanceActionCallbackHeld | null>();
  readonly #setter = Promise.withResolvers<CurrentSchematicRelevanceActionCallbackHeld | null>();
  readonly #setAttribute = Promise.withResolvers<CurrentSchematicRelevanceActionCallbackHeld | null>();
  readonly #ast = Promise.withResolvers<CurrentSchematicRelevanceActionCallbackHeld | null>(); readonly #recordResumedSignal = Promise.withResolvers<boolean>();
  readonly #record = Promise.withResolvers<CurrentSchematicRelevanceActionCallbackHeld | null>(); readonly #primitiveResumedSignal = Promise.withResolvers<boolean>();
  readonly #setterResumedSignal = Promise.withResolvers<boolean>();
  readonly #resumed = Promise.withResolvers<boolean>();
  #attempted = false; #armed = false; #failed = false; #entryResumed = false; #entryResumeAttempted = false; #entryResumeCompleted = false; #entryResumeSubmitted = false; #reservation: CurrentSchematicRelevanceActionEntryResume | null = null; #held: CurrentSchematicRelevanceActionCallbackHeld | null = null;
  #setterResumed = false; #setterResumeAttempted = false; #setterResumeCompleted = false; #setterResumeSubmitted = false; #setterReservation: CurrentSchematicRelevanceActionSetterResume | null = null;
  #recordObserved = false; #primitiveResumeAttempted = false; #primitiveResumeSubmitted = false; #primitiveResumed = false; #primitiveResumeCompleted = false; #primitiveReservation: CurrentSchematicRelevanceActionPrimitiveResume | null = null;
  #astObserved = false; #recordResumeAttempted = false; #recordResumeSubmitted = false; #recordResumed = false; #recordResumeCompleted = false; #recordReservation: CurrentSchematicRelevanceActionRecordResume | null = null;
  readonly #monitorSignals = new Map<MonitorRole, ReturnType<typeof Promise.withResolvers<CurrentSchematicRelevanceActionCallbackHeld|null>>>(MONITORS.map(role=>[role,Promise.withResolvers<CurrentSchematicRelevanceActionCallbackHeld|null>()]));
  readonly #monitorObserved=new Set<MonitorRole>();#monitorArmAttempted=false;#monitorsArmed=false;#monitorAt=0;#monitorReservation:CurrentSchematicRelevanceMonitorResume|null=null;#monitorSubmitted=false;#monitorResumed=false;#monitorResumedSignal:ReturnType<typeof Promise.withResolvers<boolean>>|null=null;
  public async armOriginalMonitors(held:CurrentSchematicRelevanceActionCallbackHeld,functions:Pick<CurrentSchematicRelevanceActiveHistoryReceipt["functions"],"modifyAttributeChange"|"bboxAttributeChange"|"watchAttributeChange"|"historyActiveAttribute">):Promise<void>{
    this.requireHeld(held);need(held.role==="ast"&&this.#recordResumeCompleted&&!this.#monitorArmAttempted&&this.#host.monitorRequest!==undefined);this.#monitorArmAttempted=true;
    const keys={modify:"modifyAttributeChange",bbox:"bboxAttributeChange",watch:"watchAttributeChange",history:"historyActiveAttribute"} as const;
    try{for(const role of MONITORS){this.requireHeld(held);const command=monitorCommand({phase:"arm",role,method:"Debugger.setBreakpointOnFunctionCall",params:{objectId:functions[keys[role]],condition:""}});const reply=z.strictObject({breakpointId:handle}).parse(captureCurrentPcbStringClockReply(await this.#host.monitorRequest(command)).value);this.requireHeld(held);need(!this.#points.has(reply.breakpointId));this.#points.set(reply.breakpointId,role);}this.#monitorsArmed=true;}catch(error){this.fail();throw error;}
  }
  public reserveMonitorResume(held:CurrentSchematicRelevanceActionCallbackHeld):CurrentSchematicRelevanceMonitorResume{this.requireHeld(held);const expected=this.#monitorAt===0?"ast":MONITORS[this.#monitorAt-1],target=MONITORS[this.#monitorAt];need(this.#monitorsArmed&&held.role===expected&&target!==undefined&&this.#monitorReservation===null);const token=Object.freeze({original:held,target});this.#monitorReservation=token;this.#monitorSubmitted=false;this.#monitorResumed=false;this.#monitorResumedSignal=Promise.withResolvers<boolean>();return token;}
  public requireMonitorResume(token:CurrentSchematicRelevanceMonitorResume):void{this.#host.assertCurrent();need(!this.#failed&&this.#monitorReservation===token);}
  public markMonitorResumeSubmitted(token:CurrentSchematicRelevanceMonitorResume):void{this.requireMonitorResume(token);need(!this.#monitorSubmitted&&this.#held===token.original);this.#monitorSubmitted=true;}
  public async waitMonitorResumed(token:CurrentSchematicRelevanceMonitorResume):Promise<void>{this.requireMonitorResume(token);const signal=this.#monitorResumedSignal;need(signal!==null);const seen=await signal.promise;this.requireMonitorResume(token);need(seen&&this.#monitorResumed);}
  public completeMonitorResume(token:CurrentSchematicRelevanceMonitorResume):void{this.requireMonitorResume(token);need(this.#monitorResumed);this.#monitorAt += 1;this.#monitorReservation=null;}
  public async waitOriginalMonitor(role:MonitorRole):Promise<CurrentSchematicRelevanceActionCallbackHeld>{const signal=this.#monitorSignals.get(role);need(signal!==undefined);const held=await signal.promise;need(held!==null&&MONITORS[this.#monitorAt-1]===role);this.requireHeld(held);return held;}
  readonly #historySignals=new Map<HistoryRole,ReturnType<typeof Promise.withResolvers<CurrentSchematicRelevanceActionCallbackHeld|null>>>(historyRoles.map(role=>[role,Promise.withResolvers<CurrentSchematicRelevanceActionCallbackHeld|null>()]));readonly #historyObserved=new Set<HistoryRole>();#historyArmAttempted=false;#historyArmed=false;#historyAt=0;#historyReservation:CurrentSchematicRelevanceHistoryResume|null=null;#historySubmitted=false;#historyResumed=false;#historyResumedSignal:ReturnType<typeof Promise.withResolvers<boolean>>|null=null;
  public async armOriginalHistoryAttribute(held:CurrentSchematicRelevanceActionCallbackHeld,methods:Readonly<{getModel:string;attribute:string}>):Promise<void>{this.requireHeld(held);need(held.role==="history"&&this.#monitorAt===4&&!this.#historyArmAttempted&&this.#host.historyRequest!==undefined);this.#historyArmAttempted=true;try{for(const role of ["getModel","attribute"] as const){const command=historyCommand({phase:"arm",role,method:"Debugger.setBreakpointOnFunctionCall",params:{objectId:methods[role],condition:""}});const reply=z.strictObject({breakpointId:handle}).parse(captureCurrentPcbStringClockReply(await this.#host.historyRequest(command)).value);this.requireHeld(held);need(!this.#points.has(reply.breakpointId));this.#points.set(reply.breakpointId,role==="getModel"?"historyGetModel":"commandAttribute");}this.#historyArmed=true;}catch(error){this.fail();throw error;}}
  public reserveHistoryResume(held:CurrentSchematicRelevanceActionCallbackHeld):CurrentSchematicRelevanceHistoryResume{this.requireHeld(held);const expected=this.#historyAt===0?"history":historyRoles[this.#historyAt-1];const target=historyRoles[this.#historyAt];need(this.#historyArmed&&this.#historyAt<historyRoles.length&&target!==undefined&&held.role===expected&&this.#historyReservation===null);const token=Object.freeze({original:held,target});this.#historyReservation=token;this.#historySubmitted=false;this.#historyResumed=false;this.#historyResumedSignal=Promise.withResolvers<boolean>();return token;}
  public requireHistoryResume(token:CurrentSchematicRelevanceHistoryResume):void{this.#host.assertCurrent();need(!this.#failed&&this.#historyReservation===token);}
  public markHistoryResumeSubmitted(token:CurrentSchematicRelevanceHistoryResume):void{this.requireHistoryResume(token);need(!this.#historySubmitted&&this.#held===token.original);this.#historySubmitted=true;}
  public async waitHistoryResumed(token:CurrentSchematicRelevanceHistoryResume):Promise<void>{this.requireHistoryResume(token);const signal=this.#historyResumedSignal;need(signal!==null);const seen=await signal.promise;this.requireHistoryResume(token);need(seen&&this.#historyResumed);}
  public completeHistoryResume(token:CurrentSchematicRelevanceHistoryResume):void{this.requireHistoryResume(token);need(this.#historyResumed);this.#historyAt+=1;this.#historyReservation=null;}
  public async waitOriginalHistoryStep(role:HistoryRole):Promise<CurrentSchematicRelevanceActionCallbackHeld>{const signal=this.#historySignals.get(role);need(signal!==undefined);const held=await signal.promise;const expected=historyRoles[this.#historyAt-1];need(held!==null&&expected===role);this.requireHeld(held);return held;}
  public constructor(host: CurrentSchematicRelevanceActionCallbackHost) { this.#host = host; handle.parse(host.sessionId); handle.parse(host.callbackScriptId); handle.parse(host.sourceScriptId); Object.freeze(this); }
  public async arm(): Promise<void> {
    need(!this.#attempted && !this.#failed); this.#attempted = true;
    try {
      for (const role of roles) {
        this.#host.assertCurrent(); const objectId = this.#host.functions[functionKeys[role]];
        const command = validate({ phase: `schematic-callback-arm-${role}`, method: "Debugger.setBreakpointOnFunctionCall", params: { objectId, condition: "" } });
        const reply = z.strictObject({ breakpointId: handle }).parse(captureCurrentPcbStringClockReply(await this.#host.request(command)).value); this.#host.assertCurrent(); need(!this.#points.has(reply.breakpointId)); this.#points.set(reply.breakpointId, role);
      }
      this.#armed = true; this.assertArmed();
    } catch (caughtError) { this.fail(); throw caughtError; }
  }
  public assertArmed(): void { this.#host.assertCurrent(); need(!this.#failed && this.#armed && this.#points.size === roles.length && this.#held === null); }
  #role(event: DiagnosticEvent): CurrentSchematicRelevanceActionCallbackRole | null {
    const ids = event.params["hitBreakpoints"]; const frames = event.params["callFrames"]; if (!Array.isArray(frames) || frames.length === 0 || !Array.isArray(ids)) { return null; }
    const first = frame.parse(frames[0]);
    if (ids.some(id => typeof id === "string" && this.#points.has(id))) {
      need(ids.length === 1 && typeof ids[0] === "string"); const role = this.#points.get(ids[0]); need(role !== undefined);
      let expected:{readonly lineNumber:number;readonly columnNumber:number};
      if(role==="historyGetModel"){expected=ACTION[this.#host.variant].methods.historyGetModelCommand;}
      else if(role==="commandAttribute"){expected=HISTORY_COMMAND[this.#host.variant].roles.commandAttribute;}
      else if(role==="modify"){expected=MODEL[this.#host.variant].roles.modifyAttributeChange;}
      else if(role==="bbox"){expected=MODEL[this.#host.variant].roles.bboxAttributeChange;}
      else if(role==="watch"){expected=MODEL[this.#host.variant].roles.watchAttributeChange;}
      else if(role==="history"){expected=ACTION[this.#host.variant].methods.historyActiveAttribute;}
      else{expected=SOURCES[this.#host.variant].methods[sourceKeys[role]];}
      need(first.functionLocation.scriptId === this.#host.sourceScriptId && first.functionLocation.lineNumber === expected.lineNumber && first.functionLocation.columnNumber === expected.columnNumber && first.location.scriptId === this.#host.sourceScriptId); return role;
    }
    if (first.functionLocation.scriptId !== this.#host.callbackScriptId) { return null; }
    need(ids.length === 0 && first.functionLocation.lineNumber === CALLBACK.lineNumber && first.functionLocation.columnNumber === CALLBACK.columnNumber && first.location.scriptId === this.#host.callbackScriptId);
    const marker = MARKERS.find(value => value.lineNumber === first.location.lineNumber && value.columnNumber === first.location.columnNumber); need(marker !== undefined); return marker.role;
  }
  public observeOriginalEvent(event: DiagnosticEvent): boolean {
    if (event.sessionId !== this.#host.sessionId) { return false; }
    if (event.method === "Debugger.resumed") {
      if(this.#historyReservation!==null){try{this.#host.assertCurrent();need(!this.#failed&&this.#historySubmitted&&!this.#historyResumed&&this.#held===this.#historyReservation.original&&Reflect.ownKeys(event.params).length===0);this.#held=null;this.#historyResumed=true;this.#historyResumedSignal?.resolve(true);}catch{this.fail();}return true;}
      if(this.#monitorReservation!==null){try{this.#host.assertCurrent();need(!this.#failed&&this.#monitorSubmitted&&!this.#monitorResumed&&this.#held===this.#monitorReservation.original&&Reflect.ownKeys(event.params).length===0);this.#held=null;this.#monitorResumed=true;this.#monitorResumedSignal?.resolve(true);}catch{this.fail();}return true;}
      if (this.#recordReservation !== null) {
        try { this.#host.assertCurrent(); need(!this.#failed && this.#recordResumeSubmitted && !this.#recordResumed && this.#held === this.#recordReservation.original && Reflect.ownKeys(event.params).length === 0); this.#held = null; this.#recordResumed = true; this.#recordResumedSignal.resolve(true); }
        catch { this.fail(); } return true;
      }
      if (this.#primitiveReservation !== null) {
        try { this.#host.assertCurrent(); need(!this.#failed && this.#primitiveResumeSubmitted && !this.#primitiveResumed && this.#held === this.#primitiveReservation.original && Reflect.ownKeys(event.params).length === 0); this.#held = null; this.#primitiveResumed = true; this.#primitiveResumedSignal.resolve(true); }
        catch { this.fail(); } return true;
      }
      if (this.#setterReservation !== null) {
        try { this.#host.assertCurrent(); need(!this.#failed && this.#setterResumeSubmitted && !this.#setterResumed && this.#held === this.#setterReservation.original && Reflect.ownKeys(event.params).length === 0); this.#held = null; this.#setterResumed = true; this.#setterResumedSignal.resolve(true); }
        catch { this.fail(); } return true;
      }
      if (this.#reservation === null) { return false; }
      try { this.#host.assertCurrent(); need(!this.#failed && this.#entryResumeSubmitted && !this.#entryResumed && this.#held === this.#reservation.original && Reflect.ownKeys(event.params).length === 0); this.#held = null; this.#entryResumed = true; this.#resumed.resolve(true); }
      catch { this.fail(); } return true;
    }
    if (event.method !== "Debugger.paused") { return false; }
    try {
      const role = this.#role(event); if (role === null) { return false; } this.#host.assertCurrent(); need(!this.#failed && this.#armed && this.#held === null && event.params["reason"] === "other");
      const frames = event.params["callFrames"]; need(Array.isArray(frames)); const first = frame.parse(frames[0]); const held = Object.freeze({ event, role, callFrameId: first.callFrameId }); this.#held = held;
      if (role === "entry") { need(!this.#entryResumeAttempted); this.#entry.resolve(held); }
      else if (role === "setter") { need(this.#entryResumeAttempted && this.#entryResumed && !this.#setterResumeAttempted); this.#setter.resolve(held); }
      else if(role==="historyGetModel"||role==="commandAttribute"||role==="finish"){const pending=this.#historyReservation;const completed=historyRoles[this.#historyAt-1];need(this.#historyArmed&&(pending?.target??completed)===role&&this.#historyResumed&&!this.#historyObserved.has(role));this.#historyObserved.add(role);const signal=this.#historySignals.get(role);need(signal!==undefined);signal.resolve(held);}
      else if(role==="modify"||role==="bbox"||role==="watch"||role==="history"){const pending=this.#monitorReservation;need(this.#monitorsArmed&&(pending?.target??MONITORS[this.#monitorAt-1])===role&&this.#monitorResumed&&!this.#monitorObserved.has(role));this.#monitorObserved.add(role);const signal=this.#monitorSignals.get(role);need(signal!==undefined);signal.resolve(held);}
      else if (role === "ast") { need(this.#recordResumeAttempted && this.#recordResumed && !this.#astObserved); this.#astObserved = true; this.#ast.resolve(held); }
      else if (role === "record") { need(this.#primitiveResumeAttempted && this.#primitiveResumed && !this.#recordObserved); this.#recordObserved = true; this.#record.resolve(held); }
      else { need(role === "setAttribute" && this.#entryResumeCompleted && this.#setterResumeAttempted && this.#setterResumed); this.#setAttribute.resolve(held); }
      return true;
    } catch { this.fail(); return true; }
  }
  public async waitOriginalEntry(): Promise<CurrentSchematicRelevanceActionCallbackHeld> { const held = await this.#entry.promise; need(held !== null && !this.#failed && this.#held === held); this.#host.assertCurrent(); return held; }
  public reserveEntryResume(held: CurrentSchematicRelevanceActionCallbackHeld): CurrentSchematicRelevanceActionEntryResume {
    this.requireHeld(held); need(held.role === "entry" && !this.#entryResumeAttempted && this.#reservation === null); this.#entryResumeAttempted = true; const token = Object.freeze({ original: held }); this.#reservation = token; return token;
  }
  public requireEntryResume(token: CurrentSchematicRelevanceActionEntryResume): void { need(!this.#failed && this.#reservation === token); this.#host.assertCurrent(); }
  public markEntryResumeSubmitted(token: CurrentSchematicRelevanceActionEntryResume): void { this.requireEntryResume(token); need(!this.#entryResumeSubmitted && this.#held === token.original); this.#entryResumeSubmitted = true; }
  public async waitEntryResumed(token: CurrentSchematicRelevanceActionEntryResume): Promise<void> { this.requireEntryResume(token); const seen = await this.#resumed.promise; this.requireEntryResume(token); need(seen && this.#entryResumed); }
  public completeEntryResume(token: CurrentSchematicRelevanceActionEntryResume): void { this.requireEntryResume(token); need(this.#entryResumed && !this.#entryResumeCompleted); this.#entryResumeCompleted = true; this.#reservation = null; }
  public async waitOriginalFirstSetter(): Promise<CurrentSchematicRelevanceActionCallbackHeld> { const held = await this.#setter.promise; need(held !== null && this.#entryResumeCompleted); this.requireHeld(held); return held; }
  public reserveSetterResume(held: CurrentSchematicRelevanceActionCallbackHeld): CurrentSchematicRelevanceActionSetterResume { this.requireHeld(held); need(held.role === "setter" && this.#entryResumeCompleted && !this.#setterResumeAttempted && this.#reservation === null && this.#setterReservation === null); this.#setterResumeAttempted = true; const token = Object.freeze({ original: held }); this.#setterReservation = token; return token; }
  public requireSetterResume(token: CurrentSchematicRelevanceActionSetterResume): void { need(!this.#failed && this.#setterReservation === token); this.#host.assertCurrent(); }
  public markSetterResumeSubmitted(token: CurrentSchematicRelevanceActionSetterResume): void { this.requireSetterResume(token); need(!this.#setterResumeSubmitted && this.#held === token.original); this.#setterResumeSubmitted = true; }
  public async waitSetterResumed(token: CurrentSchematicRelevanceActionSetterResume): Promise<void> { this.requireSetterResume(token); const seen = await this.#setterResumedSignal.promise; this.requireSetterResume(token); need(seen && this.#setterResumed); }
  public completeSetterResume(token: CurrentSchematicRelevanceActionSetterResume): void { this.requireSetterResume(token); need(this.#setterResumed && !this.#setterResumeCompleted); this.#setterResumeCompleted = true; this.#setterReservation = null; }
  public async waitOriginalSetAttribute(): Promise<CurrentSchematicRelevanceActionCallbackHeld> { const held = await this.#setAttribute.promise; need(held !== null && this.#setterResumeCompleted); this.requireHeld(held); return held; }
  public reservePrimitiveResume(held: CurrentSchematicRelevanceActionCallbackHeld): CurrentSchematicRelevanceActionPrimitiveResume { this.requireHeld(held); need(held.role === "setAttribute" && this.#setterResumeCompleted && !this.#primitiveResumeAttempted && this.#primitiveReservation === null); this.#primitiveResumeAttempted = true; const token = Object.freeze({ original: held }); this.#primitiveReservation = token; return token; }
  public requirePrimitiveResume(token: CurrentSchematicRelevanceActionPrimitiveResume): void { need(!this.#failed && this.#primitiveReservation === token); this.#host.assertCurrent(); }
  public markPrimitiveResumeSubmitted(token: CurrentSchematicRelevanceActionPrimitiveResume): void { this.requirePrimitiveResume(token); need(!this.#primitiveResumeSubmitted && this.#held === token.original); this.#primitiveResumeSubmitted = true; }
  public async waitPrimitiveResumed(token: CurrentSchematicRelevanceActionPrimitiveResume): Promise<void> { this.requirePrimitiveResume(token); const seen = await this.#primitiveResumedSignal.promise; this.requirePrimitiveResume(token); need(seen && this.#primitiveResumed); }
  public completePrimitiveResume(token: CurrentSchematicRelevanceActionPrimitiveResume): void { this.requirePrimitiveResume(token); need(this.#primitiveResumed && !this.#primitiveResumeCompleted); this.#primitiveResumeCompleted = true; this.#primitiveReservation = null; }
  public async waitOriginalRecord(): Promise<CurrentSchematicRelevanceActionCallbackHeld> { const held = await this.#record.promise; need(held !== null && this.#primitiveResumeCompleted); this.requireHeld(held); return held; }
  public reserveRecordResume(held: CurrentSchematicRelevanceActionCallbackHeld): CurrentSchematicRelevanceActionRecordResume { this.requireHeld(held); need(held.role === "record" && this.#primitiveResumeCompleted && !this.#recordResumeAttempted && this.#recordReservation === null); this.#recordResumeAttempted = true; const token = Object.freeze({ original: held }); this.#recordReservation = token; return token; }
  public requireRecordResume(token: CurrentSchematicRelevanceActionRecordResume): void { need(!this.#failed && this.#recordReservation === token); this.#host.assertCurrent(); }
  public markRecordResumeSubmitted(token: CurrentSchematicRelevanceActionRecordResume): void { this.requireRecordResume(token); need(!this.#recordResumeSubmitted && this.#held === token.original); this.#recordResumeSubmitted = true; }
  public async waitRecordResumed(token: CurrentSchematicRelevanceActionRecordResume): Promise<void> { this.requireRecordResume(token); const seen = await this.#recordResumedSignal.promise; this.requireRecordResume(token); need(seen && this.#recordResumed); }
  public completeRecordResume(token: CurrentSchematicRelevanceActionRecordResume): void { this.requireRecordResume(token); need(this.#recordResumed && !this.#recordResumeCompleted); this.#recordResumeCompleted = true; this.#recordReservation = null; }
  public async waitOriginalAst(): Promise<CurrentSchematicRelevanceActionCallbackHeld> { const held = await this.#ast.promise; need(held !== null && this.#recordResumeCompleted); this.requireHeld(held); return held; }
  public requireHeld(held: CurrentSchematicRelevanceActionCallbackHeld): void { this.#host.assertCurrent(); need(!this.#failed && this.#held === held && held.event.sessionId === this.#host.sessionId); }
  public fail(): void { if (!this.#failed) { this.#failed = true;for(const signal of this.#historySignals.values()){signal.resolve(null);}this.#historyResumedSignal?.resolve(false);for(const signal of this.#monitorSignals.values()){signal.resolve(null);}this.#monitorResumedSignal?.resolve(false); this.#entry.resolve(null); this.#setter.resolve(null); this.#setAttribute.resolve(null); this.#resumed.resolve(false); this.#setterResumedSignal.resolve(false); this.#record.resolve(null); this.#primitiveResumedSignal.resolve(false); this.#ast.resolve(null); this.#recordResumedSignal.resolve(false); this.#host.fail(); } }
}
