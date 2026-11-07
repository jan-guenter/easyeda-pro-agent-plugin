/** One separate original call delivery. Source/receiver proof never authorizes
 * execution of the held uploader body or another callback. */
/* oxlint-disable unicorn/max-nested-calls -- Closed nested schemas preserve exact unknown-field and program refusals. */
import {z} from "zod";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {captureCurrentPcbStringClockReply} from "./current-pcb-string-clock-reply.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_UPLOAD_ENTRY_EXPRESSION as ENTRY,CURRENT_SCHEMATIC_RELEVANCE_UPLOAD_ENTRY_MODULES as MODULES,CURRENT_SCHEMATIC_RELEVANCE_UPLOAD_ENTRY_MODULE_PROOF as MODULE_PROOF,CURRENT_SCHEMATIC_RELEVANCE_UPLOAD_ENTRY_PROOF as PROOF,CURRENT_SCHEMATIC_RELEVANCE_UPLOAD_ENTRY_SCOPE as SCOPE} from "./current-schematic-relevance-upload-entry-programs.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_DESCRIPTOR_HOOKS as HOOKS} from "./current-schematic-relevance-publication-globals-programs.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_SNAPSHOT_SAME as SAME} from "./current-schematic-relevance-publication-snapshot-programs.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_NOECHO_INTRINSICS as INTRINSICS,CURRENT_SCHEMATIC_RELEVANCE_NOECHO_MAPS_SAME as MAPS} from "./current-schematic-relevance-noecho-programs.ts";
import {currentSchematicRelevanceNormalRecordDelta} from "./current-schematic-relevance-normal-record-programs.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_NORMAL_ITERATOR_PROOF as ITERATOR} from "./current-schematic-relevance-normal-update-programs.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_UPLOAD_ENTRY_REQUESTS=Object.freeze({beforeReads:26,entryReads:10,arms:1,resumes:1,controls:3,total:41});
export const CURRENT_SCHEMATIC_RELEVANCE_UPLOAD_ENTRY_FLAGS=Object.freeze({objectGroup:"easyeda-pro-control-schematic-relevance-upload-entry-v1",silent:true,generatePreview:false,throwOnSideEffect:true} as const);
export const CURRENT_SCHEMATIC_RELEVANCE_UPLOAD_ENTRY_CALLS=freezeDeep([["hooks",HOOKS,0,true],["scope",SCOPE,7,false],["modules",MODULE_PROOF,3,true],["entry",PROOF,5,true],["same",SAME,2,true],["maps",MAPS,1,true],["record",currentSchematicRelevanceNormalRecordDelta("didRecord"),6,true],["intrinsics",INTRINSICS,4,true],["iterator",ITERATOR,4,true]] as const);
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u); const argument=z.strictObject({objectId:handle}); const flags={objectGroup:z.literal(CURRENT_SCHEMATIC_RELEVANCE_UPLOAD_ENTRY_FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
const schema=z.discriminatedUnion("phase",[
 z.strictObject({phase:z.literal("source"),method:z.literal("Debugger.getScriptSource"),params:z.strictObject({scriptId:handle})}),
 z.strictObject({phase:z.literal("modules"),variant:z.union([z.literal(0),z.literal(1)]),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({...flags,callFrameId:handle,expression:z.string().max(80),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)})}),
 z.strictObject({phase:z.literal("entry"),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({...flags,callFrameId:handle,expression:z.literal(ENTRY),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)})}),
 z.strictObject({phase:z.literal("properties"),method:z.literal("Runtime.getProperties"),params:z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)})}),
 z.strictObject({phase:z.literal("call"),role:z.enum(CURRENT_SCHEMATIC_RELEVANCE_UPLOAD_ENTRY_CALLS.map(row=>row[0])),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.string().max(16_384),arguments:z.array(argument).max(7),returnByValue:z.boolean(),awaitPromise:z.literal(false),userGesture:z.literal(false)})}),
 z.strictObject({phase:z.literal("arm"),method:z.literal("Debugger.setBreakpointOnFunctionCall"),params:z.strictObject({objectId:handle,condition:z.literal("")})}),
 z.strictObject({phase:z.literal("resume"),method:z.literal("Debugger.resume"),params:z.strictObject({})})]);
export type CurrentSchematicRelevanceUploadEntryCommand=z.infer<typeof schema>;
export function validateCurrentSchematicRelevanceUploadEntryCommand(input:unknown):CurrentSchematicRelevanceUploadEntryCommand{const command=schema.parse(captureCurrentPcbStringClockReply(input).value);if(command.phase==="modules"&&command.params.expression!==MODULES[command.variant]){throw new Error("SCH_UPLOAD_ENTRY_FIXED_MODULE");}if(command.phase==="call"){const row=CURRENT_SCHEMATIC_RELEVANCE_UPLOAD_ENTRY_CALLS.find(value=>value[0]===command.role);if(!row||command.params.functionDeclaration!==row[1]||command.params.arguments.length!==row[2]||command.params.returnByValue!==row[3]){throw new Error("SCH_UPLOAD_ENTRY_FIXED_CALL");}}return freezeDeep(command);}
