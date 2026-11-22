/** Original empty-roster finish and retained Promise completion; no SDK grant. */
import {z} from "zod";
import {CURRENT_SCHEMATIC_WIRE_ACTION_COMPLETE_PROGRAMS as PROGRAMS} from "./current-schematic-wire-action-complete-programs.ts";
import {CURRENT_SCHEMATIC_WIRE_WRITER_V4_SCRIPT as SCRIPT} from "./current-schematic-wire-writer-v4-programs.ts";
import {CURRENT_SCHEMATIC_WIRE_WRITER_FLAGS as FLAGS} from "./current-schematic-wire-writer-protocol.ts";
import {captureCurrentPcbStringClockReply as capture} from "./current-pcb-string-clock-reply.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

const marker="ownedAction=null;originalPromiseSettled=true;";const offset=SCRIPT.indexOf(marker);if(offset===-1||SCRIPT.split(marker).length!==2){throw new Error("WIRE_ACTION_COMPLETE_WRITER_ANCHOR");}
const prefix=SCRIPT.slice(0,offset),writerSite=Object.freeze({lineNumber:prefix.split("\n").length-1,columnNumber:prefix.length-prefix.lastIndexOf("\n")-1});
export {CURRENT_SCHEMATIC_WIRE_ACTION_COMPLETE_PROGRAMS} from "./current-schematic-wire-action-complete-programs.ts";
export const CURRENT_SCHEMATIC_WIRE_ACTION_COMPLETE_LIMIT=Object.freeze({normalMaximum:512,helperSourcesMaximum:96,eventsMaximum:106,pauses:5,resumes:5,cleanup:8}as const);
export const CURRENT_SCHEMATIC_WIRE_ACTION_COMPLETE_SITES=freezeDeep([{role:"immediate-resume",lineNumber:30,columnNumber:64_096,functionColumn:64_091},{role:"finish-return",lineNumber:30,columnNumber:66_009,functionColumn:65_498},{role:"success-return",lineNumber:30,columnNumber:68_564,functionColumn:68_547},{role:"fulfill-return",lineNumber:6,columnNumber:7363,functionColumn:7352},{role:"writer-await",...writerSite}]as const);
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),ref=z.strictObject({objectId:handle});
const flags={objectGroup:z.literal(FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
const calls=Object.entries(PROGRAMS).map(([role,program])=>z.strictObject({phase:z.literal("wire-action-complete-call"),role:z.literal(role),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(program),arguments:z.array(ref).length(role==="graphDidRun"?37:7),returnByValue:z.literal(false),awaitPromise:z.literal(false),userGesture:z.literal(false)})}));
const frames=(["[this]","[n,s,a]","[e,n]","[tuple,b,state,ownedAction,original,result]"]as const).map(expression=>z.strictObject({phase:z.literal("wire-action-complete-frame"),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({...flags,callFrameId:handle,expression:z.literal(expression),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)})}));
const arms=CURRENT_SCHEMATIC_WIRE_ACTION_COMPLETE_SITES.map(row=>{const location=z.strictObject({scriptId:handle,lineNumber:z.literal(row.lineNumber),columnNumber:z.literal(row.columnNumber)});const params=z.strictObject({location,condition:z.literal("")});return z.strictObject({phase:z.literal("wire-action-complete-arm"),role:z.literal(row.role),method:z.literal("Debugger.setBreakpoint"),params});});
const schema=z.union([...calls,...frames,...arms,z.strictObject({phase:z.literal("wire-action-complete-step"),method:z.literal("Debugger.resume"),params:z.strictObject({})})]);
export type CurrentSchematicWireActionCompleteCommand=Readonly<z.infer<typeof schema>>;
export function validateCurrentSchematicWireActionCompleteCommand(input:unknown):CurrentSchematicWireActionCompleteCommand{return freezeDeep(schema.parse(capture(input).value));}
export function currentSchematicWireActionCompleteCall(role:keyof typeof PROGRAMS,receiver:string,refs:readonly string[]):CurrentSchematicWireActionCompleteCommand{return validateCurrentSchematicWireActionCompleteCommand({phase:"wire-action-complete-call",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:receiver,functionDeclaration:PROGRAMS[role],arguments:refs.map(objectId=>({objectId})),returnByValue:false,awaitPromise:false,userGesture:false}});}
export function currentSchematicWireActionCompleteFrame(expression:"[this]"|"[n,s,a]"|"[e,n]"|"[tuple,b,state,ownedAction,original,result]",callFrameId:string):CurrentSchematicWireActionCompleteCommand{return validateCurrentSchematicWireActionCompleteCommand({phase:"wire-action-complete-frame",method:"Debugger.evaluateOnCallFrame",params:{...FLAGS,callFrameId,expression,returnByValue:false,includeCommandLineAPI:false}});}
export interface CurrentSchematicWireActionCompleteHeldData{
 readonly schema:"private.schematic-wire-original-empty-roster-action-complete-held.v1";
 readonly originalWillDidRunConsumed:true;readonly actualOriginalActionFinishAndDidRunCompleted:true;
 readonly originalCurrentActionReleased:true;readonly originalImmediateConsistencyResumeCompleted:true;
 readonly originalEmptyHistoryAndListenerAndCompilerRostersCompared:true;readonly nativeTimersScheduled:false;
 readonly originalHelperAndRunPromisesFulfilled:true;readonly originalRunResultTrue:true;
 readonly originalCallbackAndTickPromiseDescriptorsRecompared:true;readonly originalWriterPostAwaitStillHeld:true;
 readonly completeOriginalGraphsPointsBirthsScratchAndPromisesRecompared:true;
 readonly normalRequests:number;readonly helperSources:number;readonly cleanupRequests:0;
 readonly callbackReturned:true;readonly fullSetterComplete:true;readonly tickBodyCompleted:true;readonly didRunJoined:true;
 readonly nativeIteratorBirthObserved:false;readonly tickDrainVerified:false;readonly writerPostconditionsRun:false;
 readonly workerCompleted:false;readonly modifyCompleted:false;readonly originalNativeOwnerJoined:false;
 readonly continuousGlobalsVerified:false;readonly saveAuthorized:false;readonly suppliedTransportOnly:true;
}
