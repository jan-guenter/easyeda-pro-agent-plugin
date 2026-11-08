/** One original status callback may reach only its original local publish body. */
/* oxlint-disable unicorn/max-nested-calls -- Fixed source programs, expressions and argument counts form a closed command vocabulary. */
import {z} from "zod";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {captureCurrentPcbStringClockReply} from "./current-pcb-string-clock-reply.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_STATUS_BUS_BEFORE as BEFORE,CURRENT_SCHEMATIC_RELEVANCE_STATUS_BUS_ENTRY as ENTRY,CURRENT_SCHEMATIC_RELEVANCE_STATUS_BUS_EXPRESSIONS as EXPRESSIONS,CURRENT_SCHEMATIC_RELEVANCE_STATUS_BUS_FUNCTION as FUNCTION,CURRENT_SCHEMATIC_RELEVANCE_STATUS_BUS_OBJECTS as OBJECTS,CURRENT_SCHEMATIC_RELEVANCE_STATUS_BUS_ROOTS as ROOTS} from "./current-schematic-relevance-status-bus-programs.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_HISTORY_STATUS_CALLS as STATUS} from "./current-schematic-relevance-history-status-protocol.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_UPLOAD_RETURN_CALLS as RETURN} from "./current-schematic-relevance-upload-return-protocol.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_STATUS_BUS_FLAGS=Object.freeze({objectGroup:"easyeda-pro-control-schematic-relevance-status-bus-v1",silent:true,generatePreview:false,throwOnSideEffect:true}as const);
export const CURRENT_SCHEMATIC_RELEVANCE_STATUS_BUS_REQUESTS=Object.freeze({beforeFixedReads:22,graphWaves:1,prototypeDepth:12,qualifiedLimit:384,beforeReads:12*6+384+22,entryReads:21,arms:1,resumes:1,controls:3,total:12*6+384+22+21+1+1+3});
const reused=["hooks","snapshot","same","maps","intrinsics","iterator","command-attributes","parsed-same","document-proof","delta"]as const;
export const CURRENT_SCHEMATIC_RELEVANCE_STATUS_BUS_CALLS=freezeDeep([...STATUS.filter(row=>reused.some(role=>role===row[0])).map(row=>row[0]==="delta"?["status-delta",row[1],row[2],row[3]]as const:row),...RETURN.filter(row=>row[0]==="novel"||row[0]==="merge"||row[0]==="prototypes"),...STATUS.filter(row=>row[0]==="array-proof"),["roots",ROOTS,2,false],["function",FUNCTION,2,false],["before",BEFORE,14,true],["entry",ENTRY,5,true],["objects",OBJECTS,1,false]]as const);
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);const arg=z.strictObject({objectId:handle});const flags={objectGroup:z.literal(CURRENT_SCHEMATIC_RELEVANCE_STATUS_BUS_FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
const schema=z.discriminatedUnion("phase",[
 z.strictObject({phase:z.literal("source"),method:z.literal("Debugger.getScriptSource"),params:z.strictObject({scriptId:handle})}),
 z.strictObject({phase:z.literal("frame"),role:z.enum(["schematic","ui"]),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({...flags,callFrameId:handle,expression:z.string().max(32),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)})}),
 z.strictObject({phase:z.literal("properties"),method:z.literal("Runtime.getProperties"),params:z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)})}),
 z.strictObject({phase:z.literal("call"),role:z.enum(CURRENT_SCHEMATIC_RELEVANCE_STATUS_BUS_CALLS.map(row=>row[0])),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.string().max(16_384),arguments:z.array(arg).max(14),returnByValue:z.boolean(),awaitPromise:z.literal(false),userGesture:z.literal(false)})}),
 z.strictObject({phase:z.literal("arm"),role:z.literal("publish"),method:z.literal("Debugger.setBreakpointOnFunctionCall"),params:z.strictObject({objectId:handle,condition:z.literal("")})}),
 z.strictObject({phase:z.literal("resume"),method:z.literal("Debugger.resume"),params:z.strictObject({})})]);
export type CurrentSchematicRelevanceStatusBusCommand=z.infer<typeof schema>;
export function validateCurrentSchematicRelevanceStatusBusCommand(input:unknown):CurrentSchematicRelevanceStatusBusCommand{const command=schema.parse(captureCurrentPcbStringClockReply(input).value);if(command.phase==="frame"&&command.params.expression!==EXPRESSIONS[command.role]){throw new Error("SCH_STATUS_BUS_FIXED_FRAME");}if(command.phase==="call"){const row=CURRENT_SCHEMATIC_RELEVANCE_STATUS_BUS_CALLS.find(value=>value[0]===command.role);if(!row||command.params.functionDeclaration!==row[1]||command.params.arguments.length!==row[2]||command.params.returnByValue!==row[3]){throw new Error("SCH_STATUS_BUS_FIXED_CALL");}}return freezeDeep(command);}
