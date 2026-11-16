// Four actual steps: base return, fresh child graph, native callback and first getter entry.
import {z} from "zod";
import {CURRENT_SCHEMATIC_WIRE_GROUP_CHILD_PROGRAMS as PROGRAMS} from "./current-schematic-wire-group-child-programs.ts";
import {CURRENT_SCHEMATIC_WIRE_GROUP_CHILD_SOURCE as CHILD} from "./current-schematic-wire-group-child-source.ts";
import {CURRENT_SCHEMATIC_WIRE_TRANSITION_SOURCE as SOURCE} from "./current-schematic-wire-transition-source.ts";
import {CURRENT_SCHEMATIC_WIRE_WRITER_FLAGS as FLAGS} from "./current-schematic-wire-writer-protocol.ts";
import {captureCurrentPcbStringClockReply as capture} from "./current-pcb-string-clock-reply.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

// Normal 51+2R, helpers 14+R, events 22+R; two fresh scope views each <=8, so R<=16.
// Four pauses/resumes add no breakpoint. Cleanup reserves only the original tick.
export const CURRENT_SCHEMATIC_WIRE_GROUP_CHILD_REQUESTS=Object.freeze({normalMaximum:83,cleanup:1,pauses:4,resumes:4,helperSourcesMaximum:30,eventsMaximum:38,scopeMaximum:8}as const);
export const CURRENT_SCHEMATIC_WIRE_GROUP_CHILD_SITES=freezeDeep(([0,1]as const).map(variant=>{const m=SOURCE[variant].methods;const g=m.historyGroupData;const c={lineNumber:g.lineNumber,columnNumber:g.columnNumber+77};return[
 [g,37,m.historyInitOldData,58,"initial","[this,t,r]"],
 [g,60,m.historyInitOldData,58,"born","[this,t,r]"],
 [c,6,g,69,"callback","[n,r]"],
 [CHILD[variant],3,c,48,"getter","[this]"]
]as const;}));
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),reference=z.strictObject({objectId:handle});
const flags={objectGroup:z.literal(FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
const calls=Object.entries(PROGRAMS).map(([role,program])=>z.strictObject({phase:z.literal("wire-group-child-call"),role:z.literal(role),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.literal(program),arguments:z.array(reference).length(10),returnByValue:z.literal(false),awaitPromise:z.literal(false),userGesture:z.literal(false)})}));
const frames=["[this,e]","[this,t,r]","[n,r]","[this]"]as const;
const selectors=frames.map(expression=>z.strictObject({phase:z.literal("wire-group-child-frame"),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({...flags,callFrameId:handle,expression:z.literal(expression),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)})}));
const schema=z.union([...calls,...selectors,z.strictObject({phase:z.literal("wire-group-child-step"),method:z.literal("Debugger.stepInto"),params:z.strictObject({})})]);
export type CurrentSchematicWireGroupChildCommand=Readonly<z.infer<typeof schema>>;
export function validateCurrentSchematicWireGroupChildCommand(input:unknown):CurrentSchematicWireGroupChildCommand{return freezeDeep(schema.parse(capture(input).value));}
export function currentSchematicWireGroupChildCall(role:keyof typeof PROGRAMS,receiver:string,refs:readonly string[]):CurrentSchematicWireGroupChildCommand{return validateCurrentSchematicWireGroupChildCommand({phase:"wire-group-child-call",role,method:"Runtime.callFunctionOn",params:{...FLAGS,objectId:receiver,functionDeclaration:PROGRAMS[role],arguments:refs.map(objectId=>({objectId})),returnByValue:false,awaitPromise:false,userGesture:false}});}
export function currentSchematicWireGroupChildFrame(expression:typeof frames[number],callFrameId:string):CurrentSchematicWireGroupChildCommand{return validateCurrentSchematicWireGroupChildCommand({phase:"wire-group-child-frame",method:"Debugger.evaluateOnCallFrame",params:{...FLAGS,callFrameId,expression,returnByValue:false,includeCommandLineAPI:false}});}
export interface CurrentSchematicWireGroupChildHeldData{
 readonly schema:"private.schematic-wire-first-child-attribute-entry-held.v1";readonly originalBaseReturnToGroupContinuationJoined:true;readonly originalGroupResultIdentityRecompared:true;readonly originalEmptyChildrenObjectBirthJoined:true;readonly actualNativeForEachFirstCallbackJoined:true;readonly actualFirstChildCallbackOperandsCompared:true;readonly firstChildAttributeGetterSourceAndMetadataQualified:true;readonly actualFirstChildGetterEntryAndReceiverJoined:true;readonly originalNumericAndObjectBindingsFreshlyRecompared:true;readonly completeOriginalPeerDescriptorsAndMembershipRecompared:true;readonly originalOldNewDataBirthsStillEmpty:true;readonly originalSamePendingPromiseRetained:true;readonly originalTickPointRetained:true;readonly firstChildAttributeGetterEntryStillHeld:true;readonly normalRequests:number;readonly cleanupRequests:0;readonly scopeReads:number;readonly helperSources:number;readonly baseGetDataBodyReturned:true;readonly firstChildAttributeGetterBodyReturned:false;readonly firstChildTagGetterJoined:false;readonly nativeChildrenIterationCompleted:false;readonly groupGetDataBodyReturned:false;readonly oldDataGraphJoined:false;readonly initOldDataBodyReturned:false;readonly callbackReturned:false;readonly methodBodyReturned:false;readonly groupBodyReturned:false;readonly historyBodyReturned:false;readonly tickBodyResumed:false;readonly fullSetterComplete:false;readonly workerCompleted:false;readonly modifyCompleted:false;readonly originalNativeOwnerJoined:false;readonly continuousGlobalsVerified:false;readonly saveAuthorized:false;readonly suppliedTransportOnly:true;
}
