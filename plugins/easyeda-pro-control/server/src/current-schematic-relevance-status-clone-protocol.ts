/** Fixed original task/clone/native reads. No caller program or owner table. */
/* oxlint-disable unicorn/max-nested-calls -- Complete schemas preserve every fixed phase and argument count. */
import {z} from "zod";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {captureCurrentPcbStringClockReply} from "./current-pcb-string-clock-reply.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_STATUS_BUS_SOURCE as SOURCE} from "./current-schematic-relevance-status-bus-source.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_STATUS_DELIVERY_CALLS as DELIVERY} from "./current-schematic-relevance-status-delivery-protocol.ts";
import {CURRENT_FOOTPRINT_INVERSE_GET_INTRINSICS_CALLS as NATIVE,CURRENT_FOOTPRINT_INVERSE_GET_INTRINSICS_REQUESTS as NATIVE_REQUESTS} from "./current-footprint-inverse-get-intrinsics-protocol.ts";
import {CURRENT_NATIVE_OWN_DATA_REPROVE as REPROVE} from "./current-native-own-data-intrinsics.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_STATUS_CLONE_NATIVE_BIND as BIND,CURRENT_SCHEMATIC_RELEVANCE_STATUS_CLONE_NATIVE_MEMBERS as MEMBERS,CURRENT_SCHEMATIC_RELEVANCE_STATUS_CLONE_MODULE as MODULE,CURRENT_SCHEMATIC_RELEVANCE_STATUS_CLONE_TASK as TASK} from "./current-schematic-relevance-status-clone-programs.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_STATUS_CLONE_FLAGS=Object.freeze({objectGroup:"easyeda-pro-control-schematic-relevance-status-clone-v1",silent:true,generatePreview:false,throwOnSideEffect:true}as const);
export const CURRENT_SCHEMATIC_RELEVANCE_STATUS_CLONE_REQUESTS=Object.freeze({beforeReads:19,entryReads:2+8+NATIVE_REQUESTS.cdpRequests+13+1,nativeReads:NATIVE_REQUESTS.cdpRequests,arms:1,resumes:1,controls:3,total:19+2+8+NATIVE_REQUESTS.cdpRequests+13+1+1+1+3});
const keep=["hooks","same","maps","intrinsics","iterator","command-attributes","parsed-same","document-proof","status-delta"]as const;
export const CURRENT_SCHEMATIC_RELEVANCE_STATUS_CLONE_CALLS=freezeDeep([...DELIVERY.filter(row=>keep.some(role=>role===row[0])),...Object.entries(NATIVE).map(([role,row])=>[`native-${role}`,row.program,row.refs,row.byValue]as const),["reflection-members",MEMBERS,5,false],["reflection-bind",BIND,6,false],["reflection-reprove",REPROVE,0,true],["task",TASK,5,true],["module",MODULE,4,true]]as const);
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u),arg=z.strictObject({objectId:handle});const flags={objectGroup:z.literal(CURRENT_SCHEMATIC_RELEVANCE_STATUS_CLONE_FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
const schema=z.discriminatedUnion("phase",[
 z.strictObject({phase:z.literal("source"),method:z.literal("Debugger.getScriptSource"),params:z.strictObject({scriptId:handle})}),
 z.strictObject({phase:z.literal("frame"),stage:z.enum(["capture","entry"]),variant:z.union([z.literal(0),z.literal(1),z.literal(2)]),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({...flags,callFrameId:handle,expression:z.string().max(64),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)})}),
 z.strictObject({phase:z.literal("properties"),method:z.literal("Runtime.getProperties"),params:z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)})}),
 z.strictObject({phase:z.literal("call"),role:z.string().max(64),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.string().max(16_384),arguments:z.array(arg).max(6),returnByValue:z.boolean(),awaitPromise:z.literal(false),userGesture:z.literal(false)})}),
 z.strictObject({phase:z.literal("arm"),variant:z.union([z.literal(0),z.literal(1),z.literal(2)]),method:z.literal("Debugger.setBreakpointOnFunctionCall"),params:z.strictObject({objectId:handle,condition:z.literal("")})}),
 z.strictObject({phase:z.literal("resume"),method:z.literal("Debugger.resume"),params:z.strictObject({})})]);
export type CurrentSchematicRelevanceStatusCloneCommand=z.infer<typeof schema>;
export function validateCurrentSchematicRelevanceStatusCloneCommand(input:unknown):CurrentSchematicRelevanceStatusCloneCommand{const command=schema.parse(captureCurrentPcbStringClockReply(input).value);if(command.phase==="frame"&&command.params.expression!==(command.stage==="capture"?SOURCE[command.variant].cloneCaptureExpression:SOURCE[command.variant].cloneModuleExpression)){throw new Error("SCH_STATUS_CLONE_FIXED_FRAME");}if(command.phase==="call"){const row=CURRENT_SCHEMATIC_RELEVANCE_STATUS_CLONE_CALLS.find(value=>value[0]===command.role);if(!row||command.params.functionDeclaration!==row[1]||command.params.arguments.length!==row[2]||command.params.returnByValue!==row[3]){throw new Error("SCH_STATUS_CLONE_FIXED_CALL");}}return freezeDeep(command);}
