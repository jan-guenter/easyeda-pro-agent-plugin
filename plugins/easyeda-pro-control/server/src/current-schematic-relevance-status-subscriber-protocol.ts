/** Fixed original task/clone/native reads. No caller program or owner table. */
/* oxlint-disable unicorn/max-nested-calls -- Complete schemas preserve every fixed phase and argument count. */
import {z} from "zod";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {captureCurrentPcbStringClockReply} from "./current-pcb-string-clock-reply.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_STATUS_CLONE_CALLS as CLONE} from "./current-schematic-relevance-status-clone-protocol.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_STATUS_SUBSCRIBER_CALLBACK as CALLBACK,CURRENT_SCHEMATIC_RELEVANCE_STATUS_SUBSCRIBER_BEFORE as BEFORE,CURRENT_SCHEMATIC_RELEVANCE_STATUS_SUBSCRIBER_WRAPPER as WRAPPER,CURRENT_SCHEMATIC_RELEVANCE_STATUS_SUBSCRIBER_TARGET as TARGET,CURRENT_SCHEMATIC_RELEVANCE_STATUS_SUBSCRIBER_EXPRESSIONS as EXPRESSIONS} from "./current-schematic-relevance-status-subscriber-programs.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_STATUS_SUBSCRIBER_FLAGS=Object.freeze({objectGroup:"easyeda-pro-control-schematic-relevance-status-subscriber-v1",silent:true,generatePreview:false,throwOnSideEffect:true}as const);
export const CURRENT_SCHEMATIC_RELEVANCE_STATUS_SUBSCRIBER_REQUESTS=Object.freeze({beforeReads:25,wrapperReads:22,targetReads:21,arms:2,retireClone:1,resumes:2,controls:4,total:25+22+21+2+1+2+4});
const keep=["hooks","same","maps","intrinsics","iterator","command-attributes","parsed-same","document-proof","status-delta","reflection-reprove","native-defaultInstance","native-hooks"]as const;
export const CURRENT_SCHEMATIC_RELEVANCE_STATUS_SUBSCRIBER_CALLS=freezeDeep([...CLONE.filter(row=>keep.some(role=>role===row[0])),["callback",CALLBACK,2,false],["before",BEFORE,8,true],["wrapper",WRAPPER,7,true],["target",TARGET,5,true]]as const);
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),arg=z.strictObject({objectId:handle});const flags={objectGroup:z.literal(CURRENT_SCHEMATIC_RELEVANCE_STATUS_SUBSCRIBER_FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
const schema=z.discriminatedUnion("phase",[
 z.strictObject({phase:z.literal("source"),method:z.literal("Debugger.getScriptSource"),params:z.strictObject({scriptId:handle})}),
 z.strictObject({phase:z.literal("frame"),stage:z.enum(["wrapper","target","wrapperCaller","targetCaller"]),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({...flags,callFrameId:handle,expression:z.string().max(64),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)})}),
 z.strictObject({phase:z.literal("properties"),method:z.literal("Runtime.getProperties"),params:z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)})}),
 z.strictObject({phase:z.literal("call"),role:z.string().max(64),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.string().max(16_384),arguments:z.array(arg).max(9),returnByValue:z.boolean(),awaitPromise:z.literal(false),userGesture:z.literal(false)})}),
 z.strictObject({phase:z.literal("arm"),role:z.enum(["wrapper","target"]),method:z.literal("Debugger.setBreakpointOnFunctionCall"),params:z.strictObject({objectId:handle,condition:z.literal("")})}),
 z.strictObject({phase:z.literal("remove"),method:z.literal("Debugger.removeBreakpoint"),params:z.strictObject({breakpointId:handle})}),
 z.strictObject({phase:z.literal("resume"),method:z.literal("Debugger.resume"),params:z.strictObject({})})]);
export type CurrentSchematicRelevanceStatusSubscriberCommand=z.infer<typeof schema>;
export function validateCurrentSchematicRelevanceStatusSubscriberCommand(input:unknown):CurrentSchematicRelevanceStatusSubscriberCommand{const command=schema.parse(captureCurrentPcbStringClockReply(input).value);if(command.phase==="frame"&&command.params.expression!==EXPRESSIONS[command.stage]){throw new Error("SCH_STATUS_SUBSCRIBER_FIXED_FRAME");}if(command.phase==="call"){const row=CURRENT_SCHEMATIC_RELEVANCE_STATUS_SUBSCRIBER_CALLS.find(value=>value[0]===command.role);if(!row||command.params.functionDeclaration!==row[1]||command.params.arguments.length!==row[2]||command.params.returnByValue!==row[3]){throw new Error("SCH_STATUS_SUBSCRIBER_FIXED_CALL");}}return freezeDeep(command);}
