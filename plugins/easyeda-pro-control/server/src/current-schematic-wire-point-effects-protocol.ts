/** New finite source-only point effect lane. Native codebooks are unchanged. */
import {z} from "zod";
import {CURRENT_SCHEMATIC_WIRE_POINT_EFFECT_PROGRAMS as PROGRAMS} from "./current-schematic-wire-point-effects-programs.ts";
import {CURRENT_SCHEMATIC_WIRE_WRITER_FLAGS as FLAGS} from "./current-schematic-wire-writer-protocol.ts";
import {captureCurrentPcbStringClockReply as capture} from "./current-pcb-string-clock-reply.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_WIRE_POINT_EFFECT_LIMIT=Object.freeze({normalMaximum:1196,helperSourcesMaximum:435,eventsMaximum:509,pauses:37,resumes:37,cleanup:1,scopeMaximum:8}as const);
export type PointSiteKind="points"|"child"|"outer"|"callback"|"scale"|"ctor"|"normal";
export const CURRENT_SCHEMATIC_WIRE_POINT_EFFECT_SITES=freezeDeep([
 ["getter","points",15,"child",54,"[this]",0],["pointsReturn","points",22,"child",54,"[this]",0],["getter","child",61,"outer",48,"[this]",0],
 ...([0,1]as const).flatMap(point=>[
 ["callback","callback",5,"child",61,"[t]",point],["scale","scale",4,"callback",5,"[this,e]",point],["empty","ctor",6,"scale",11,"[this,e,t]",point],
 ["normalX","normal",4,"ctor",16,"[this,e]",point],["normalX","normal",19,"ctor",16,"[this,e]",point],["normalX","normal",28,"ctor",16,"[this,e]",point],
 ["x","ctor",32,"scale",11,"[this,e,t]",point],
 ["normalY","normal",4,"ctor",36,"[this,e]",point],["normalY","normal",19,"ctor",36,"[this,e]",point],["normalY","normal",28,"ctor",36,"[this,e]",point],
 ["xy","ctor",52,"scale",11,"[this,e,t]",point],["xy","ctor",61,"scale",11,"[this,e,t]",point],["xy","ctor",75,"scale",11,"[this,e,t]",point],["full","ctor",99,"scale",11,"[this,e,t]",point],
 ["returned","scale",36,"callback",5,"[this,e]",point],["returned","callback",13,"child",61,"[t]",point]
 ]as const),
 ["getter","child",17,"outer",48,"[this]",1],["final","child",168,"outer",48,"[this]",1]
]as const);
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),reference=z.strictObject({objectId:handle});
const flags={objectGroup:z.literal(FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
const calls=Object.entries(PROGRAMS).map(([role,program])=>{let count=20;if(role==="finiteScope"){count=2;}else if(role==="byteScope"||role==="byteTuple"){count=1;}return z.strictObject({phase:z.literal("wire-point-effect-call"),role:z.literal(role),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(program),arguments:z.array(reference).length(count),returnByValue:z.literal(false),awaitPromise:z.literal(false),userGesture:z.literal(false)})});});
const expressions=["[this]","[t]","[this,e]","[this,e,t]"]as const;
const frames=expressions.map(expression=>z.strictObject({phase:z.literal("wire-point-effect-frame"),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({...flags,callFrameId:handle,expression:z.literal(expression),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)})}));
const schema=z.union([...calls,...frames,z.strictObject({phase:z.literal("wire-point-effect-step"),method:z.literal("Debugger.stepInto"),params:z.strictObject({})})]);
export type CurrentSchematicWirePointEffectCommand=Readonly<z.infer<typeof schema>>;
export function validateCurrentSchematicWirePointEffectCommand(input:unknown):CurrentSchematicWirePointEffectCommand{return freezeDeep(schema.parse(capture(input).value));}
export function currentSchematicWirePointEffectCall(role:keyof typeof PROGRAMS,receiver:string,refs:readonly string[]):CurrentSchematicWirePointEffectCommand{return validateCurrentSchematicWirePointEffectCommand({phase:"wire-point-effect-call",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:receiver,functionDeclaration:PROGRAMS[role],arguments:refs.map(objectId=>({objectId})),returnByValue:false,awaitPromise:false,userGesture:false}});}
export function currentSchematicWirePointEffectFrame(expression:typeof expressions[number],callFrameId:string):CurrentSchematicWirePointEffectCommand{return validateCurrentSchematicWirePointEffectCommand({phase:"wire-point-effect-frame",method:"Debugger.evaluateOnCallFrame",params:{...FLAGS,callFrameId,expression,returnByValue:false,includeCommandLineAPI:false}});}
export interface CurrentSchematicWirePointEffectHeldData{
 readonly schema:"private.schematic-wire-first-child-attributes-return-held.v1";readonly originalPointsGetterAndNativeMapCallbacksJoined:true;readonly originalScaleConstructorNormalAndNativeFiniteJoined:true;readonly directNewTargetDerivedFromQualifiedSource:true;readonly newTargetObserved:false;readonly originalOrdinary16ByteScratchIdentityAndTransitionsCompared:true;readonly bothFreshPointBirthsAndReturnedIdentitiesJoined:true;readonly actualFirstChildAttributeReturnValueJoined:true;readonly actualFirstChildAttributeReturnInstructionStillHeld:true;readonly completeOriginalGraphsPendingModifyAndTickRecompared:true;readonly nonResizableBufferQualified:false;readonly normalRequests:number;readonly helperSources:number;readonly scopeReads:number;readonly cleanupRequests:0;readonly firstChildAttributeGetterBodyReturned:false;readonly firstChildTagGetterJoined:false;readonly nativeChildrenIterationCompleted:false;readonly groupGetDataBodyReturned:false;readonly oldDataGraphJoined:false;readonly initOldDataBodyReturned:false;readonly callbackReturned:false;readonly methodBodyReturned:false;readonly groupBodyReturned:false;readonly historyBodyReturned:false;readonly tickBodyResumed:false;readonly fullSetterComplete:false;readonly workerCompleted:false;readonly modifyCompleted:false;readonly originalNativeOwnerJoined:false;readonly continuousGlobalsVerified:false;readonly saveAuthorized:false;readonly suppliedTransportOnly:true;
}
