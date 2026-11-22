/** Separate variant-zero empty-listener source continuation, ending before history. */
import {z} from "zod";
import {CURRENT_SCHEMATIC_WIRE_TICK_BODY_PROGRAMS as PROGRAMS} from "./current-schematic-wire-tick-body-programs.ts";
import {CURRENT_SCHEMATIC_WIRE_WRITER_FLAGS as FLAGS} from "./current-schematic-wire-writer-protocol.ts";
import {captureCurrentPcbStringClockReply as capture} from "./current-pcb-string-clock-reply.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";
// Qualification of five functions, two breakpoint arms, six graph/Promise
// Barriers and their exact generated-source reads fit this separate finite cap.
export {CURRENT_SCHEMATIC_WIRE_TICK_BODY_PROGRAMS} from "./current-schematic-wire-tick-body-programs.ts";
export const CURRENT_SCHEMATIC_WIRE_TICK_BODY_LIMIT=Object.freeze({normalMaximum:192,helperSourcesMaximum:44,eventsMaximum:48,pauses:2,resumes:2,cleanup:3}as const);
export const CURRENT_SCHEMATIC_WIRE_TICK_BODY_SITES=freezeDeep([{role:"tick-return",lineNumber:3606,columnNumber:293_506,functionColumn:293_197},{role:"will-did-run",lineNumber:30,columnNumber:65_638,functionColumn:65_498}]as const);
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),ref=z.strictObject({objectId:handle});
const flags={objectGroup:z.literal(FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
const calls=Object.entries(PROGRAMS).map(([role,program])=>z.strictObject({phase:z.literal("wire-tick-body-call"),role:z.literal(role),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(program),arguments:z.array(ref).length(role==="graphWillDidRun"||role==="graphReturned"?36:6),returnByValue:z.literal(false),awaitPromise:z.literal(false),userGesture:z.literal(false)})}));
const frames=(["[this]","[this,n,a,o,l]"]as const).map(expression=>z.strictObject({phase:z.literal("wire-tick-body-frame"),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({...flags,callFrameId:handle,expression:z.literal(expression),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)})}));
const arms=CURRENT_SCHEMATIC_WIRE_TICK_BODY_SITES.map(row=>{const location=z.strictObject({scriptId:handle,lineNumber:z.literal(row.lineNumber),columnNumber:z.literal(row.columnNumber)});const params=z.strictObject({location,condition:z.literal("")});return z.strictObject({phase:z.literal("wire-tick-body-arm"),role:z.literal(row.role),method:z.literal("Debugger.setBreakpoint"),params});});
const schema=z.union([...calls,...frames,...arms,z.strictObject({phase:z.literal("wire-tick-body-step"),method:z.literal("Debugger.resume"),params:z.strictObject({})})]);
export type CurrentSchematicWireTickBodyCommand=Readonly<z.infer<typeof schema>>;
export function validateCurrentSchematicWireTickBodyCommand(input:unknown):CurrentSchematicWireTickBodyCommand{return freezeDeep(schema.parse(capture(input).value));}
export function currentSchematicWireTickBodyCall(role:keyof typeof PROGRAMS,receiver:string,refs:readonly string[]):CurrentSchematicWireTickBodyCommand{return validateCurrentSchematicWireTickBodyCommand({phase:"wire-tick-body-call",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:receiver,functionDeclaration:PROGRAMS[role],arguments:refs.map(objectId=>({objectId})),returnByValue:false,awaitPromise:false,userGesture:false}});}
export function currentSchematicWireTickBodyFrame(expression:"[this]"|"[this,n,a,o,l]",callFrameId:string):CurrentSchematicWireTickBodyCommand{return validateCurrentSchematicWireTickBodyCommand({phase:"wire-tick-body-frame",method:"Debugger.evaluateOnCallFrame",params:{...FLAGS,callFrameId,expression,returnByValue:false,includeCommandLineAPI:false}});}
export interface CurrentSchematicWireTickBodyHeldData{
 readonly schema:"private.schematic-wire-original-tick-empty-listeners-will-did-run-held.v1";
 readonly originalFirstTickEntryConsumed:true;readonly originalTickBodyReturned:true;
 readonly originalEmptyListenerDispatcherBodiesQualified:true;readonly originalAsyncMapClearedAndNextTickReleased:true;
 readonly originalTickPromiseFulfilled:true;readonly originalCallbackAndHelperAndRunPromisesRetained:true;
 readonly realOriginalWillDidRunStatusAndSuccessPayloadJoined:true;readonly willDidRunInstructionStillHeld:true;
 readonly completeOriginalGraphsPointsBirthsScratchAndPromiseDescriptorsRecompared:true;
 readonly listenerScope:"complete-original-empty-roster";readonly shouldUpdateInAsync:false;
 readonly normalRequests:number;readonly helperSources:number;readonly cleanupRequests:0;
 readonly callbackReturned:true;readonly fullSetterComplete:true;readonly tickBodyResumed:true;readonly tickBodyCompleted:true;
 readonly tickDrainVerified:false;readonly historyResolversRun:false;readonly didRunJoined:false;
 readonly workerCompleted:false;readonly modifyCompleted:false;readonly originalNativeOwnerJoined:false;
 readonly continuousGlobalsVerified:false;readonly saveAuthorized:false;readonly suppliedTransportOnly:true;
}
