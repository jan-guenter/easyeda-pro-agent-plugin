/** Fixed original listener cleanup/recording steps. No public input can select
 * a function or resume a body from another origin or stage. */
/* oxlint-disable unicorn/max-nested-calls -- Strict finite schemas retain all original unknown-field refusals. */
import {z} from "zod";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {captureCurrentPcbStringClockReply} from "./current-pcb-string-clock-reply.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_NORMAL_RECORD_COMMAND_ATTRIBUTES as ATTRIBUTES,CURRENT_SCHEMATIC_RELEVANCE_NORMAL_RECORD_BEFORE as BEFORE,CURRENT_SCHEMATIC_RELEVANCE_NORMAL_RECORD_EXPRESSIONS as EXPRESSIONS,CURRENT_SCHEMATIC_RELEVANCE_NORMAL_RECORD_STAGES as STAGES,currentSchematicRelevanceNormalRecordDelta as delta,currentSchematicRelevanceNormalRecordFrame as frame} from "./current-schematic-relevance-normal-record-programs.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_DESCRIPTOR_HOOKS as HOOKS} from "./current-schematic-relevance-publication-globals-programs.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_NORMAL_DOCUMENT_PROOF as DOCUMENT,CURRENT_SCHEMATIC_RELEVANCE_NORMAL_ITERATOR_PROOF as ITERATOR} from "./current-schematic-relevance-normal-update-programs.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_NORMAL_RECORD_READS=Object.freeze({canRecord:9,dispose:8,reset:8,removal:8,remove:8,record:8,willRecord:8,didRecord:8});
export const CURRENT_SCHEMATIC_RELEVANCE_NORMAL_RECORD_REQUESTS=Object.freeze({reads:65,arms:7,resumes:7,controls:9,total:88});
export const CURRENT_SCHEMATIC_RELEVANCE_NORMAL_RECORD_FLAGS=Object.freeze({objectGroup:"easyeda-pro-control-schematic-relevance-normal-record-v1",silent:true,generatePreview:false,throwOnSideEffect:true} as const);
export const CURRENT_SCHEMATIC_RELEVANCE_NORMAL_RECORD_ARMS=Object.freeze(["dispose","reset","removal","remove","record","willRecord","didRecord"] as const);
export const CURRENT_SCHEMATIC_RELEVANCE_NORMAL_RECORD_CALLS=freezeDeep([["hooks",HOOKS,0,true],["before",BEFORE,8,true],["attributes",ATTRIBUTES,4,true],["document",DOCUMENT,2,true],["iterator",ITERATOR,4,true],...STAGES.flatMap(stage=>[[`delta-${stage}`,delta(stage),6,true],[`frame-${stage}`,frame(stage),6,true]] as const)] as const);
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);const object=z.strictObject({objectId:handle});const flags={objectGroup:z.literal(CURRENT_SCHEMATIC_RELEVANCE_NORMAL_RECORD_FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
const schema=z.discriminatedUnion("phase",[
 z.strictObject({phase:z.literal("arm"),role:z.enum(CURRENT_SCHEMATIC_RELEVANCE_NORMAL_RECORD_ARMS),method:z.literal("Debugger.setBreakpointOnFunctionCall"),params:z.strictObject({objectId:handle,condition:z.literal("")})}),
 z.strictObject({phase:z.literal("frame"),role:z.enum(["canRecord","dispose","reset","removal","removeMain","removeChild","record","willRecord","didRecord"]),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({...flags,callFrameId:handle,expression:z.string().max(80),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)})}),
 z.strictObject({phase:z.literal("properties"),method:z.literal("Runtime.getProperties"),params:z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)})}),
 z.strictObject({phase:z.literal("call"),role:z.enum(CURRENT_SCHEMATIC_RELEVANCE_NORMAL_RECORD_CALLS.map(row=>row[0])),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.string().max(16_384),arguments:z.array(object).max(8),returnByValue:z.literal(true),awaitPromise:z.literal(false),userGesture:z.literal(false)})}),
 z.strictObject({phase:z.literal("resume"),method:z.literal("Debugger.resume"),params:z.strictObject({})})]);
export type CurrentSchematicRelevanceNormalRecordCommand=z.infer<typeof schema>;
export function validateCurrentSchematicRelevanceNormalRecordCommand(input:unknown):CurrentSchematicRelevanceNormalRecordCommand{const value=schema.parse(captureCurrentPcbStringClockReply(input).value);if(value.phase==="frame"&&value.params.expression!==EXPRESSIONS[value.role]){throw new Error("SCH_RECORD_FIXED_FRAME");}if(value.phase==="call"){const row=CURRENT_SCHEMATIC_RELEVANCE_NORMAL_RECORD_CALLS.find(candidate=>candidate[0]===value.role);if(!row||value.params.functionDeclaration!==row[1]||value.params.arguments.length!==row[2]){throw new Error("SCH_RECORD_FIXED_CALL");}}return freezeDeep(value);}
