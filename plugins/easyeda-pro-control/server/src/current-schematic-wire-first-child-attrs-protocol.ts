/** Separate source-only superclass/scale subgroup; no map or constructor execution. */
import {z} from "zod";
import {CURRENT_SCHEMATIC_WIRE_FIRST_CHILD_ATTR_PROGRAMS as PROGRAMS} from "./current-schematic-wire-first-child-attrs-programs.ts";
import {CURRENT_SCHEMATIC_WIRE_GROUP_DATA_DEPENDENCY_SOURCE as SOURCE} from "./current-schematic-wire-group-data-dependency-source.ts";
import {CURRENT_SCHEMATIC_WIRE_GROUP_CHILD_SOURCE as CHILD} from "./current-schematic-wire-group-child-source.ts";
import {CURRENT_SCHEMATIC_WIRE_WRITER_FLAGS as FLAGS} from "./current-schematic-wire-writer-protocol.ts";
import {captureCurrentPcbStringClockReply as capture} from "./current-pcb-string-clock-reply.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

// Nine fresh scope views <=8: R<=72. Normal199+2R+2I, helpers66+R+I,
// Events86+R+I; I<=1 original highlight object identity. Only original tick cleanup.
export const CURRENT_SCHEMATIC_WIRE_FIRST_CHILD_ATTR_LIMIT=Object.freeze({normalMaximum:345,cleanup:1,pauses:10,resumes:10,helperSourcesMaximum:139,eventsMaximum:159,scopeMaximum:8}as const);
export const CURRENT_SCHEMATIC_WIRE_FIRST_CHILD_ATTR_SITES=freezeDeep(([0,1]as const).map(variant=>{const d=SOURCE[variant];const b=d.baseAttributes,c=CHILD[variant];return[
 [b,9,c,30,"receiver","[this]"],[b,111,c,30,"born","[this,e]"],
 [d.highlightGet,13,b,141,"highlight","[this,t]"],[d.highlightGet,117,b,141,"highlight","[this,t]"],
 [b,165,c,30,"afterHighlight","[this,e,t]"],[d.numeric,4,b,172,"numeric","[i]"],[d.numeric,29,b,172,"numeric","[i]"],
 [b,205,c,30,"combination","[this,e,t]"],[b,253,c,30,"finalBase","[this,e,t]"],[b,254,c,30,"baseReturned","[this,e,t]"]
]as const;}));
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),reference=z.strictObject({objectId:handle});
const flags={objectGroup:z.literal(FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
const calls=Object.entries(PROGRAMS).map(([role,program])=>{const count=role.startsWith("self")||role.startsWith("constructor")?5:11;return z.strictObject({phase:z.literal("wire-first-child-attrs-call"),role:z.literal(role),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(program),arguments:z.array(reference).length(count),returnByValue:z.literal(false),awaitPromise:z.literal(false),userGesture:z.literal(false)})});});
const expressions=["[this]","[this,e]","[this,t]","[this,e,t]","[i]"]as const;
const frames=expressions.map(expression=>z.strictObject({phase:z.literal("wire-first-child-attrs-frame"),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({...flags,callFrameId:handle,expression:z.literal(expression),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)})}));
const schema=z.union([...calls,...frames,z.strictObject({phase:z.literal("wire-first-child-attrs-step"),method:z.literal("Debugger.stepInto"),params:z.strictObject({})})]);
export type CurrentSchematicWireFirstChildAttrCommand=Readonly<z.infer<typeof schema>>;
export function validateCurrentSchematicWireFirstChildAttrCommand(input:unknown):CurrentSchematicWireFirstChildAttrCommand{return freezeDeep(schema.parse(capture(input).value));}
export function currentSchematicWireFirstChildAttrCall(role:keyof typeof PROGRAMS,receiver:string,refs:readonly string[]):CurrentSchematicWireFirstChildAttrCommand{return validateCurrentSchematicWireFirstChildAttrCommand({phase:"wire-first-child-attrs-call",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:receiver,functionDeclaration:PROGRAMS[role],arguments:refs.map(objectId=>({objectId})),returnByValue:false,awaitPromise:false,userGesture:false}});}
export function currentSchematicWireFirstChildAttrFrame(expression:typeof expressions[number],callFrameId:string):CurrentSchematicWireFirstChildAttrCommand{return validateCurrentSchematicWireFirstChildAttrCommand({phase:"wire-first-child-attrs-frame",method:"Debugger.evaluateOnCallFrame",params:{...FLAGS,callFrameId,expression,returnByValue:false,includeCommandLineAPI:false}});}
export interface CurrentSchematicWireFirstChildAttrHeldData{
 readonly schema:"private.schematic-wire-first-child-super-return-held.v1";readonly actualSuperDestinationAndReceiverJoined:true;readonly genuineFirstChildBaseAttributesReturnJoined:true;readonly originalBornChildAttributesPersistentReferenceRetained:true;readonly originalScaleSourceAndSameConstructorSelfBindingCompared:true;readonly originalConstructorDependencyDataReferencesRecompared:true;readonly originalNativeMapAndAssignedPointPrerequisitesRecompared:true;readonly freshOriginalObjectAndNumericBindingsRecompared:true;readonly completeOriginalGraphsAndPendingPromiseAndTickRecompared:true;readonly originalBaseAttributeReturnInstructionStillHeld:true;readonly normalRequests:number;readonly helperSources:number;readonly scopeReads:number;readonly cleanupRequests:0;readonly normalMethodSourceQualified:false;readonly constructorScratchEffectsQualified:false;readonly pointScaleExecuted:false;readonly firstChildAttributeGetterBodyReturned:false;readonly firstChildTagGetterJoined:false;readonly nativeChildrenIterationCompleted:false;readonly groupGetDataBodyReturned:false;readonly oldDataGraphJoined:false;readonly initOldDataBodyReturned:false;readonly callbackReturned:false;readonly methodBodyReturned:false;readonly groupBodyReturned:false;readonly historyBodyReturned:false;readonly tickBodyResumed:false;readonly fullSetterComplete:false;readonly workerCompleted:false;readonly modifyCompleted:false;readonly originalNativeOwnerJoined:false;readonly continuousGlobalsVerified:false;readonly saveAuthorized:false;readonly suppliedTransportOnly:true;
}
