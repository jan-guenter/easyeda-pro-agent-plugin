/** One exact status calculation stops before the first original callback. */
/* oxlint-disable unicorn/max-nested-calls -- Closed schemas constrain every source program, argument count and fixed expression. */
import {z} from "zod";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {captureCurrentPcbStringClockReply} from "./current-pcb-string-clock-reply.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_HISTORY_STATUS_ARGS as ARGS,CURRENT_SCHEMATIC_RELEVANCE_HISTORY_STATUS_BEFORE as BEFORE,CURRENT_SCHEMATIC_RELEVANCE_HISTORY_STATUS_CALLERS as CALLERS,CURRENT_SCHEMATIC_RELEVANCE_HISTORY_STATUS_DELTA as DELTA,CURRENT_SCHEMATIC_RELEVANCE_HISTORY_STATUS_EXPRESSIONS as EXPRESSIONS,CURRENT_SCHEMATIC_RELEVANCE_HISTORY_STATUS_OBJECTS as OBJECTS} from "./current-schematic-relevance-history-status-programs.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_UPLOAD_RETURN_CALLS as RETURN} from "./current-schematic-relevance-upload-return-protocol.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_UPLOAD_SERIALIZE_CALLS as SERIALIZE} from "./current-schematic-relevance-upload-serialize-protocol.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_HISTORY_STATUS_REQUESTS=Object.freeze({beforeReads:17,entryReads:29,arms:3,resumes:1,controls:3,total:17+29+3+1+3});
export const CURRENT_SCHEMATIC_RELEVANCE_HISTORY_STATUS_FLAGS=Object.freeze({objectGroup:"easyeda-pro-control-schematic-relevance-history-status-v1",silent:true,generatePreview:false,throwOnSideEffect:true}as const);
const reused=["hooks","snapshot","same","maps","record","intrinsics","iterator","command-attributes","parsed-same","delta","document-proof"]as const;
export const CURRENT_SCHEMATIC_RELEVANCE_HISTORY_STATUS_CALLS=freezeDeep([...RETURN.filter(row=>reused.some(role=>role===row[0])).map(row=>row[0]==="delta"?["cache-delta",row[1],row[2],row[3]]as const:row),...SERIALIZE.filter(row=>row[0]==="array-proof"),["before",BEFORE,15,true],["args",ARGS,1,false],["objects",OBJECTS,1,false],["delta",DELTA,4,true],["callers",CALLERS,9,true]]as const);
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u); const arg=z.strictObject({objectId:handle});const flags={objectGroup:z.literal(CURRENT_SCHEMATIC_RELEVANCE_HISTORY_STATUS_FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
const schema=z.discriminatedUnion("phase",[
 z.strictObject({phase:z.literal("frame"),role:z.enum(["callback","deliver","queue","dispatch","record"]),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({...flags,callFrameId:handle,expression:z.string().max(16),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)})}),
 z.strictObject({phase:z.literal("properties"),method:z.literal("Runtime.getProperties"),params:z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)})}),
 z.strictObject({phase:z.literal("call"),role:z.enum(CURRENT_SCHEMATIC_RELEVANCE_HISTORY_STATUS_CALLS.map(row=>row[0])),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.string().max(16_384),arguments:z.array(arg).max(15),returnByValue:z.boolean(),awaitPromise:z.literal(false),userGesture:z.literal(false)})}),
 z.strictObject({phase:z.literal("arm"),role:z.enum(["statusUnsaved","statusMenu","statusToolbar"]),method:z.literal("Debugger.setBreakpointOnFunctionCall"),params:z.strictObject({objectId:handle,condition:z.literal("")})}),
 z.strictObject({phase:z.literal("resume"),method:z.literal("Debugger.resume"),params:z.strictObject({})})]);
export type CurrentSchematicRelevanceHistoryStatusCommand=z.infer<typeof schema>;
export function validateCurrentSchematicRelevanceHistoryStatusCommand(input:unknown):CurrentSchematicRelevanceHistoryStatusCommand{const command=schema.parse(captureCurrentPcbStringClockReply(input).value);if(command.phase==="frame"&&command.params.expression!==EXPRESSIONS[command.role]){throw new Error("SCH_HISTORY_STATUS_FIXED_FRAME");}if(command.phase==="call"){const row=CURRENT_SCHEMATIC_RELEVANCE_HISTORY_STATUS_CALLS.find(value=>value[0]===command.role);if(!row||command.params.functionDeclaration!==row[1]||command.params.arguments.length!==row[2]||command.params.returnByValue!==row[3]){throw new Error("SCH_HISTORY_STATUS_FIXED_CALL");}}return freezeDeep(command);}
