/** Separate finite setter return lane; historical subgroups and results stay immutable. */
import {z} from "zod";
import {CURRENT_SCHEMATIC_WIRE_SETTER_RETURN_PROGRAMS as PROGRAMS} from "./current-schematic-wire-setter-return-programs.ts";
import {CURRENT_SCHEMATIC_WIRE_WRITER_FLAGS as FLAGS} from "./current-schematic-wire-writer-protocol.ts";
import {captureCurrentPcbStringClockReply as capture} from "./current-pcb-string-clock-reply.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

// For R<=16 original scope rows: normal351+2R, helpers112+R, events154+R.
// Prelude29+2R; two captures6;22 reproofs11; selectors/Promise53;21 steps.
export const CURRENT_SCHEMATIC_WIRE_SETTER_RETURN_LIMIT=Object.freeze({normalMaximum:383,helperSourcesMaximum:128,eventsMaximum:170,pauses:21,resumes:21,cleanup:1,scopeMaximum:8,scopeRowsMaximum:16}as const);
export type SetterReturnKind="method"|"tryGroup"|"history"|"record"|"setter"|"filter"|"outer"|"stage";
export const CURRENT_SCHEMATIC_WIRE_SETTER_RETURN_SITES=freezeDeep([
 ["method",126,"tryGroup",72],["method",127,"tryGroup",72],["tryGroup",129,"history",49],["tryGroup",132,"history",49],["history",199,"record",207],["record",233,"setter",54],["setter",134,"filter",66],["filter",106,"outer",95],["filter",108,"outer",95],
 ["outer",224,"stage",870],["outer",237,"stage",870],["outer",248,"stage",870],["outer",265,"stage",870],["outer",268,"stage",870],["outer",331,"stage",870],["outer",429,"stage",870],["outer",433,"stage",870],["outer",438,"stage",870],["outer",476,"stage",870],["stage",947,"runner",0],["stage",1008,"runner",0],
]as const);
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),ref=z.strictObject({objectId:handle});
const flags={objectGroup:z.literal(FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
const calls=Object.entries(PROGRAMS).map(([role,program])=>z.strictObject({phase:z.literal("wire-setter-return-call"),role:z.literal(role),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(program),arguments:z.array(ref).length(role==="aliases"?3:9),returnByValue:z.literal(false),awaitPromise:z.literal(false),userGesture:z.literal(false)})}));
const expressions=["[this,t,r,n]","[this,t,r,n,s]","[this,s]","[this,n]","[this,t]","[u,h,d]","[this,t,r,n,s,a]","[this,t,r,n,s,a,o]","[this,t,r,n,s,a,o,l]","[this,t,r,n,s,a,o,l,c]","[originalContext,originalPoints]"]as const;
const frames=expressions.map(expression=>z.strictObject({phase:z.literal("wire-setter-return-frame"),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({...flags,callFrameId:handle,expression:z.literal(expression),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)})}));
const schema=z.union([...calls,...frames,z.strictObject({phase:z.literal("wire-setter-return-step"),method:z.literal("Debugger.stepInto"),params:z.strictObject({})})]);
export type CurrentSchematicWireSetterReturnCommand=Readonly<z.infer<typeof schema>>;
export function validateCurrentSchematicWireSetterReturnCommand(input:unknown):CurrentSchematicWireSetterReturnCommand{return freezeDeep(schema.parse(capture(input).value));}
export function currentSchematicWireSetterReturnCall(role:keyof typeof PROGRAMS,receiver:string,refs:readonly string[]):CurrentSchematicWireSetterReturnCommand{return validateCurrentSchematicWireSetterReturnCommand({phase:"wire-setter-return-call",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:receiver,functionDeclaration:PROGRAMS[role],arguments:refs.map(objectId=>({objectId})),returnByValue:false,awaitPromise:false,userGesture:false}});}
export function currentSchematicWireSetterReturnFrame(expression:typeof expressions[number],callFrameId:string):CurrentSchematicWireSetterReturnCommand{return validateCurrentSchematicWireSetterReturnCommand({phase:"wire-setter-return-frame",method:"Debugger.evaluateOnCallFrame",params:{...FLAGS,callFrameId,expression,returnByValue:false,includeCommandLineAPI:false}});}
export interface CurrentSchematicWireSetterReturnHeldData{
 readonly schema:"private.schematic-wire-complete-setter-callback-return-held.v1";readonly originalInitCallbackAndGroupHistoryBodiesReturned:true;readonly originalRecordAndPointsSetterBodiesReturned:true;readonly nativePrerequisitesQualifiedBeforeOriginalSetLinesDispatch:true;readonly originalFilterEmptyResultAndMapIteratorRetained:true;readonly originalCompleteSetLinesBodyReturned:true;readonly completeOriginalGraphsPointsBirthsScratchAndPromiseRecompared:true;readonly generatedCallbackReturnPromiseRetained:true;readonly generatedCallbackPromiseState:"pending"|"fulfilled";readonly generatedCallbackReturnInstructionStillHeld:true;readonly normalRequests:number;readonly helperSources:number;readonly scopeReads:number;readonly cleanupRequests:0;readonly fullSetterComplete:true;readonly callbackReturned:false;readonly tickBodyResumed:false;readonly willDidRunJoined:false;readonly workerCompleted:false;readonly modifyCompleted:false;readonly originalNativeOwnerJoined:false;readonly continuousGlobalsVerified:false;readonly saveAuthorized:false;readonly suppliedTransportOnly:true;
}
