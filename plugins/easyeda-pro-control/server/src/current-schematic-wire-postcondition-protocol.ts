/** A new finite source-only continuation; historical result shapes stay fixed. */
import {z} from "zod";
import {CURRENT_SCHEMATIC_WIRE_POSTCONDITION_PROGRAMS as PROGRAMS} from "./current-schematic-wire-postcondition-programs.ts";
import {CURRENT_SCHEMATIC_WIRE_WRITER_V4_SCRIPT as SCRIPT} from "./current-schematic-wire-writer-v4-programs.ts";
import {CURRENT_SCHEMATIC_WIRE_WRITER_FLAGS as FLAGS} from "./current-schematic-wire-writer-protocol.ts";
import {captureCurrentPcbStringClockReply as capture} from "./current-pcb-string-clock-reply.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import type {CurrentSchematicWireWriterStageResult} from "./current-schematic-wire-writer-programs.ts";

function point(marker:string,extra=0):Readonly<{lineNumber:number;columnNumber:number}>{
 if(SCRIPT.split(marker).length!==2){throw new Error("WIRE_POSTCONDITION_SITE");}const at=SCRIPT.indexOf(marker)+extra,prefix=SCRIPT.slice(0,at);return Object.freeze({lineNumber:prefix.split("\n").length-1,columnNumber:prefix.length-prefix.lastIndexOf("\n")-1});
}
const receiptPrefix='const receipt=(ok,source=null)=>(';
export const CURRENT_SCHEMATIC_WIRE_POSTCONDITION_SITES=freezeDeep({
 receipt:{...point(receiptPrefix,receiptPrefix.length),functionLocation:point(receiptPrefix,"const receipt=".length),callerSuccess:point('return receipt(true,after);\n }\n if(stage==="observe")',7),callerFailure:point('return receipt(false);',7)},
 accepted:point('return receipt(true,after);\n }\n if(stage==="observe")','return receipt(true,after);'.length),
 refused:point('return receipt(false);','return receipt(false);'.length),
});
/** Two original pauses and three resumes, including ce6's consumed held frame.
 * 128 reads reserve 64 paired Promise-cell/metadata polls. Sixteen Promise and
 * sixteen weak-entry rereads reprove the prior completed observations.
 * Remaining fixed reads/arms/sources reserve 31 requests: total 191. */
export const CURRENT_SCHEMATIC_WIRE_POSTCONDITION_LIMIT=Object.freeze({normalMaximum:191,helperSourcesMaximum:7,eventsMaximum:12,pauses:2,resumes:3,cleanup:11,promisePasses:64}as const);
export const CURRENT_SCHEMATIC_WIRE_POSTCONDITION_FRAMES=Object.freeze({before:"[tuple,b,state,ownedAction,original,result,before,operation,target,stage,dispatchAttempted,originalPromiseSettled]",receipt:"[tuple,b,state,stage,ok,source,dispatchAttempted,originalPromiseSettled,ownedAction,operation]",returned:"[tuple,b,state,stage,dispatchAttempted,originalPromiseSettled,ownedAction,operation]"}as const);
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),ref=z.strictObject({objectId:handle});
const flags={objectGroup:z.literal(FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
const arities=Object.freeze({guardFactory:7,seal:3,entry:4,returned:5,retain:0,settled:7}as const);
const callRoles=["guardFactory","seal","entry","returned","retain","settled"]as const;
const calls=callRoles.map(role=>z.strictObject({phase:z.literal("wire-postcondition-call"),role:z.literal(role),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(PROGRAMS[role]),arguments:z.array(ref).length(arities[role]),returnByValue:z.literal(role==="settled"),awaitPromise:z.literal(false),userGesture:z.literal(false)})}));
const frames=Object.entries(CURRENT_SCHEMATIC_WIRE_POSTCONDITION_FRAMES).map(([role,expression])=>z.strictObject({phase:z.literal("wire-postcondition-frame"),role:z.literal(role),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({...flags,callFrameId:handle,expression:z.literal(expression),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)})}));
const arms=Object.entries(CURRENT_SCHEMATIC_WIRE_POSTCONDITION_SITES).map(([role,row])=>{const locationSchema=z.strictObject({scriptId:handle,lineNumber:z.literal(row.lineNumber),columnNumber:z.literal(row.columnNumber)});return z.strictObject({phase:z.literal("wire-postcondition-arm"),role:z.literal(role),method:z.literal("Debugger.setBreakpoint"),params:z.strictObject({location:locationSchema,condition:z.literal("")})});});
const schema=z.union([...calls,...frames,...arms,z.strictObject({phase:z.literal("wire-postcondition-step"),method:z.literal("Debugger.resume"),params:z.strictObject({})})]);
export type CurrentSchematicWirePostconditionCommand=Readonly<z.infer<typeof schema>>;
export function validateCurrentSchematicWirePostconditionCommand(input:unknown):CurrentSchematicWirePostconditionCommand{return freezeDeep(schema.parse(capture(input).value));}
export function currentSchematicWirePostconditionCall(role:keyof typeof PROGRAMS,receiver:string,refs:readonly string[]):CurrentSchematicWirePostconditionCommand{return validateCurrentSchematicWirePostconditionCommand({phase:"wire-postcondition-call",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:receiver,functionDeclaration:PROGRAMS[role],arguments:refs.map(objectId=>({objectId})),returnByValue:role==="settled",awaitPromise:false,userGesture:false}});}
export function currentSchematicWirePostconditionFrame(role:keyof typeof CURRENT_SCHEMATIC_WIRE_POSTCONDITION_FRAMES,callFrameId:string):CurrentSchematicWirePostconditionCommand{return validateCurrentSchematicWirePostconditionCommand({phase:"wire-postcondition-frame",role,method:"Debugger.evaluateOnCallFrame",params:{...flagsValue(),callFrameId,expression:CURRENT_SCHEMATIC_WIRE_POSTCONDITION_FRAMES[role],returnByValue:false,includeCommandLineAPI:false}});}
function flagsValue():Readonly<{objectGroup:string;silent:true;generatePreview:false;throwOnSideEffect:true}>{return{...FLAGS};}
export interface CurrentSchematicWirePostconditionData{
 readonly schema:"private.schematic-wire-original-postconditions-receipt.v1";
 readonly originalRunCompletionConsumed:true;readonly originalWriterPostconditionsRun:true;readonly originalWriterPostconditionsAccepted:boolean;
 readonly originalGeneratedReceiptReturned:true;readonly originalInnerWriterPromiseFulfilledWithSameReceipt:true;
 readonly originalPrivateStateAndActionConsistencyRecompared:true;readonly originalCompletedPromiseAndWeakEntriesRecompared:true;
 readonly markerGeometryMatchedAtEntry:boolean;readonly receipt:CurrentSchematicWireWriterStageResult;
 readonly normalRequests:number;readonly helperSources:number;readonly cleanupRequests:0;
 readonly originalNativeOwnerJoined:false;readonly continuousGlobalsVerified:false;readonly workerCompleted:false;readonly mainCompleted:false;readonly sqlCompleted:false;readonly modifyCompleted:false;readonly saveAuthorized:false;readonly suppliedTransportOnly:true;
}
