/** Separate finite callback-exit/real-runner lane; released lanes stay immutable. */
import {z} from "zod";
import {CURRENT_SCHEMATIC_WIRE_RUNNER_RETURN_PROGRAMS as PROGRAMS} from "./current-schematic-wire-runner-return-programs.ts";
import {CURRENT_SCHEMATIC_WIRE_WRITER_FLAGS as FLAGS} from "./current-schematic-wire-writer-protocol.ts";
import {captureCurrentPcbStringClockReply as capture} from "./current-pcb-string-clock-reply.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

export {CURRENT_SCHEMATIC_WIRE_RUNNER_RETURN_PROGRAMS} from "./current-schematic-wire-runner-return-programs.ts";
// Seven exact lexical joins visit at most eight original scopes each (R<=56).
// Prelude/metadata/frames plus eleven complete reproof barriers fit320+4R calls;
// Fixed helper rows fit80+R sources. Five pauses and five resumes add10 events.
export const CURRENT_SCHEMATIC_WIRE_RUNNER_RETURN_LIMIT=Object.freeze({normalMaximum:544,helperSourcesMaximum:136,eventsMaximum:146,scopeMaximum:8,scopeRowsMaximum:56,pauses:5,resumes:5,cleanup:1}as const);
export const CURRENT_SCHEMATIC_WIRE_RUNNER_RETURN_SITES=freezeDeep([["helper",49],["helper",92],["executor",171],["run",198],["tick",9]]as const);
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),ref=z.strictObject({objectId:handle});
const flags={objectGroup:z.literal(FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
const calls=Object.entries(PROGRAMS).map(([role,program])=>{let count=5;if(role==="roots"){count=2;}else if(role==="callbackRetained"){count=3;}else if(role==="pack"){count=8;}else if(role==="seal"){count=11;}else if(role==="natives"||role==="finish"||role==="action"||role==="success"||/^(?:helper|type|tag|native)[01]$/u.test(role)){count=4;}return z.strictObject({phase:z.literal("wire-runner-return-call"),role:z.literal(role),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(program),arguments:z.array(ref).length(count),returnByValue:z.literal(false),awaitPromise:z.literal(false),userGesture:z.literal(false)})});});
const expressions=["[i,e,t]","[this,n,s]","[this,t,r]","[i,e,t,r]","[this]"]as const;
const frames=expressions.map(expression=>z.strictObject({phase:z.literal("wire-runner-return-frame"),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({...flags,callFrameId:handle,expression:z.literal(expression),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)})}));
const steps=(["Debugger.stepInto","Debugger.stepOver","Debugger.resume"]as const).map(method=>z.strictObject({phase:z.literal("wire-runner-return-step"),method:z.literal(method),params:z.strictObject({})}));
const schema=z.union([...calls,...frames,...steps]);
export type CurrentSchematicWireRunnerReturnCommand=Readonly<z.infer<typeof schema>>;
export function validateCurrentSchematicWireRunnerReturnCommand(input:unknown):CurrentSchematicWireRunnerReturnCommand{return freezeDeep(schema.parse(capture(input).value));}
export function currentSchematicWireRunnerReturnCall(role:keyof typeof PROGRAMS,receiver:string,refs:readonly string[]):CurrentSchematicWireRunnerReturnCommand{return validateCurrentSchematicWireRunnerReturnCommand({phase:"wire-runner-return-call",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:receiver,functionDeclaration:PROGRAMS[role],arguments:refs.map(objectId=>({objectId})),returnByValue:false,awaitPromise:false,userGesture:false}});}
export function currentSchematicWireRunnerReturnFrame(expression:typeof expressions[number],callFrameId:string):CurrentSchematicWireRunnerReturnCommand{return validateCurrentSchematicWireRunnerReturnCommand({phase:"wire-runner-return-frame",method:"Debugger.evaluateOnCallFrame",params:{...FLAGS,callFrameId,expression,returnByValue:false,includeCommandLineAPI:false}});}
export interface CurrentSchematicWireRunnerReturnHeldData{
 readonly schema:"private.schematic-wire-real-runner-first-tick-entry-held.v1";readonly originalSynchronousSetterReturnConsumed:true;readonly actualOriginalRunAndUseActionFunctionsQualified:true;readonly originalRunExecutorAndActionStartIdentitiesJoined:true;readonly originalGeneratedCallbackExited:true;readonly originalGeneratedCallbackPromiseRejoinedAfterFrameExit:true;readonly originalHelperAndRunReturnPromisesRetained:true;readonly originalRunPromiseStillPending:true;readonly firstOriginalTickEntryReachedBeforeRunnerCompletion:true;readonly firstOriginalTickEntryStillHeld:true;readonly completeOriginalGraphsPointsBirthsScratchAndPromisesRecompared:true;readonly originalRegularFunctionOwnMetadataObserved:true;readonly originalActiveHelperArgumentsRetainedAndJoined:true;readonly queueOrderingReason:"original-bbox-tick-precedes-original-callback-success-handler";readonly normalRequests:number;readonly helperSources:number;readonly scopeReads:number;readonly cleanupRequests:0;readonly callbackReturned:true;readonly fullSetterComplete:true;readonly tickBodyResumed:false;readonly tickDrainVerified:false;readonly willDidRunJoined:false;readonly workerCompleted:false;readonly modifyCompleted:false;readonly originalNativeOwnerJoined:false;readonly continuousGlobalsVerified:false;readonly saveAuthorized:false;readonly suppliedTransportOnly:true;
}
