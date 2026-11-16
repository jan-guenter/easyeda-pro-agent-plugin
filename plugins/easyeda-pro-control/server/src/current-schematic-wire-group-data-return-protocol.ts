/** Separate finite source-only stepping through the original getter dependency calls. */
import {z} from "zod";
import {CURRENT_SCHEMATIC_WIRE_GROUP_DATA_RETURN_PROGRAMS as PROGRAMS} from "./current-schematic-wire-group-data-return-programs.ts";
import {CURRENT_SCHEMATIC_WIRE_GROUP_DATA_DEPENDENCY_SOURCE as DEPENDENCY} from "./current-schematic-wire-group-data-dependency-source.ts";
import {CURRENT_SCHEMATIC_WIRE_TRANSITION_SOURCE as SOURCE} from "./current-schematic-wire-transition-source.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_MODEL_CALLEE_SOURCE as MODEL} from "./current-schematic-relevance-model-callee-source.ts";
import {CURRENT_SCHEMATIC_WIRE_WRITER_FLAGS as FLAGS} from "./current-schematic-wire-writer-protocol.ts";
import {captureCurrentPcbStringClockReply as capture} from "./current-pcb-string-clock-reply.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_WIRE_GROUP_DATA_RETURN_REQUESTS=Object.freeze({normalMaximum:206,cleanup:1,pauses:17,resumes:17,helperSourcesMaximum:72,eventsMaximum:106,scopeMaximum:8}as const);
const rows=([0,1]as const).map(variant=>{const d=DEPENDENCY[variant],m=SOURCE[variant].methods,p=MODEL[variant].roles.parentGet;return[
 [m.historyBaseData,15,m.historyGroupData,27,"base","[this,e]"],
 [d.groupAttributes,3,m.historyBaseData,30,"group","[this]"],
 [d.baseAttributes,9,d.groupAttributes,30,"group","[this]"],
 [d.baseAttributes,111,d.groupAttributes,30,"born","[this,e]"],
 [d.highlightGet,13,d.baseAttributes,141,"highlight","[this,t]"],
 [d.highlightGet,117,d.baseAttributes,141,"highlight","[this,t]"],
 [d.baseAttributes,165,d.groupAttributes,30,"afterHighlight","[this,e,t]"],
 [d.numeric,4,d.baseAttributes,172,"numeric","[i]"],
 [d.numeric,29,d.baseAttributes,172,"numeric","[i]"],
 [d.baseAttributes,205,d.groupAttributes,30,"combination","[this,e,t]"],
 [d.baseAttributes,253,d.groupAttributes,30,"finalBase","[this,e,t]"],
 [d.baseAttributes,254,d.groupAttributes,30,"baseReturned","[this,e,t]"],
 [d.groupAttributes,17,m.historyBaseData,30,"assign","[this]"],
 [d.groupAttributes,145,m.historyBaseData,30,"groupReturned","[this]"],
 [p,15,m.historyBaseData,50,"parent","[this]"],
 [p,22,m.historyBaseData,50,"parent","[this]"],
 [m.historyBaseData,57,m.historyGroupData,27,"baseReturnedData","[this,e]"]
]as const;});
export const CURRENT_SCHEMATIC_WIRE_GROUP_DATA_RETURN_SITES=freezeDeep(rows);
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),reference=z.strictObject({objectId:handle});
const flags={objectGroup:z.literal(FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
const calls=Object.entries(PROGRAMS).map(([role,program])=>z.strictObject({phase:z.literal("wire-group-data-return-call"),role:z.literal(role),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(program),arguments:z.array(reference).length(role==="objectScope"||role==="identity"?2:13),returnByValue:z.literal(false),awaitPromise:z.literal(false),userGesture:z.literal(false)})}));
const frames=["[this,e]","[this]","[this,e,t]","[this,t]","[i]"]as const;
const selectors=frames.map(expression=>z.strictObject({phase:z.literal("wire-group-data-return-frame"),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({...flags,callFrameId:handle,expression:z.literal(expression),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)})}));
const step=z.strictObject({phase:z.literal("wire-group-data-return-step"),method:z.literal("Debugger.stepInto"),params:z.strictObject({})});
const schema=z.union([...calls,...selectors,step]);
export type CurrentSchematicWireGroupDataReturnCommand=Readonly<z.infer<typeof schema>>;
export function validateCurrentSchematicWireGroupDataReturnCommand(input:unknown):CurrentSchematicWireGroupDataReturnCommand{return freezeDeep(schema.parse(capture(input).value));}
export function currentSchematicWireGroupDataReturnCall(role:keyof typeof PROGRAMS,receiver:string,refs:readonly string[]):CurrentSchematicWireGroupDataReturnCommand{return validateCurrentSchematicWireGroupDataReturnCommand({phase:"wire-group-data-return-call",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:receiver,functionDeclaration:PROGRAMS[role],arguments:refs.map(objectId=>({objectId})),returnByValue:false,awaitPromise:false,userGesture:false}});}
export function currentSchematicWireGroupDataReturnFrame(expression:typeof frames[number],callFrameId:string):CurrentSchematicWireGroupDataReturnCommand{return validateCurrentSchematicWireGroupDataReturnCommand({phase:"wire-group-data-return-frame",method:"Debugger.evaluateOnCallFrame",params:{...FLAGS,callFrameId,expression,returnByValue:false,includeCommandLineAPI:false}});}
export interface CurrentSchematicWireGroupDataReturnHeldData{
 readonly schema:"private.schematic-wire-group-base-data-return-held.v1";readonly originalSuperDispatchDestinationsJoined:true;readonly originalGroupGetterLexicalObjectBindingCompared:true;readonly originalNumericBindingFreshlyRecompared:true;readonly genuineHighlightAndNumericReturnsCompared:true;readonly genuineBaseAndGroupAttributeReturnsJoined:true;readonly genuineParentReturnJoined:true;readonly originalBaseGetDataReturnValueJoined:true;readonly originalAttributeResultIdentityRetained:true;readonly completeOriginalPeerDescriptorsAndMembershipRecompared:true;readonly originalOldNewDataBirthsStillEmpty:true;readonly originalSamePendingPromiseRetained:true;readonly originalTickPointRetained:true;readonly originalBaseGetDataReturnInstructionStillHeld:true;readonly normalRequests:number;readonly cleanupRequests:0;readonly scopeReads:number;readonly helperSources:number;readonly modelAttributeGetterReturned:true;readonly baseGetDataBodyReturned:false;readonly groupGetDataBodyReturned:false;readonly nativeChildrenIterationJoined:false;readonly oldDataGraphJoined:false;readonly initOldDataBodyReturned:false;readonly callbackReturned:false;readonly methodBodyReturned:false;readonly groupBodyReturned:false;readonly historyBodyReturned:false;readonly tickBodyResumed:false;readonly fullSetterComplete:false;readonly workerCompleted:false;readonly modifyCompleted:false;readonly originalNativeOwnerJoined:false;readonly continuousGlobalsVerified:false;readonly saveAuthorized:false;readonly suppliedTransportOnly:true;
}
