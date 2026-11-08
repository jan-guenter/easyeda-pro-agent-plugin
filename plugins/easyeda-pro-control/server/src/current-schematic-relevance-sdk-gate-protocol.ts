/** Source-owned private SDK wait; release is the sole effectful row and requires
 * the original completed normal/publication/worker proof at its Core issuer. */
/* oxlint-disable unicorn/max-nested-calls -- Closed Inspector variants retain their complete fixed packet. */
import {z} from "zod";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {captureCurrentPcbStringClockReply} from "./current-pcb-string-clock-reply.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_SDK_GATE_BIND as BIND,CURRENT_SCHEMATIC_RELEVANCE_SDK_GATE_NATIVE_PROOF as NATIVE,CURRENT_SCHEMATIC_RELEVANCE_SDK_GATE_RELEASE as RELEASE,CURRENT_SCHEMATIC_RELEVANCE_SDK_GATE_RUN_PROOF as RUN,CURRENT_SCHEMATIC_RELEVANCE_SDK_GATE_RUN_SAME as RUN_SAME,CURRENT_SCHEMATIC_RELEVANCE_SDK_GATE_SAME as SAME,CURRENT_SCHEMATIC_RELEVANCE_SDK_GATE_SNAPSHOT as SNAPSHOT,CURRENT_SCHEMATIC_RELEVANCE_SDK_GATE_SOURCE as SOURCE,CURRENT_SCHEMATIC_RELEVANCE_SDK_GATE_WAIT_PROOF as WAIT} from "./current-schematic-relevance-sdk-gate-programs.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_NORMAL_COMMAND_UI_CALLS as PRIOR} from "./current-schematic-relevance-normal-command-ui-protocol.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_SDK_GATE_FLAGS=Object.freeze({objectGroup:"easyeda-pro-control-schematic-relevance-sdk-gate-v1",silent:true,generatePreview:false,throwOnSideEffect:true}as const);
export const CURRENT_SCHEMATIC_RELEVANCE_SDK_GATE_CALLS=freezeDeep([...PRIOR.filter(row=>["hooks","reflection-reprove","native-defaultInstance","native-hooks","same"].some(role=>role===row[0])),["run",RUN,3,true],["native",NATIVE,3,true],["bind",BIND,2,false],["wait",WAIT,4,true],["snapshot",SNAPSHOT,1,false],["context-same",SAME,3,true],["run-same",RUN_SAME,2,true],["release",RELEASE,3,true]]as const);
/** Run and wait captures each have their own finite metadata/reproof allowance.
 * A retry cannot consume a second resolver invocation. */
export const CURRENT_SCHEMATIC_RELEVANCE_SDK_GATE_REQUESTS=Object.freeze({runReads:48,waitReads:48,settlementReads:16,resumes:2,releases:1,controls:4,total:48+48+16+2+1+4});
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const arg=z.strictObject({objectId:handle});
const flags={objectGroup:z.literal(CURRENT_SCHEMATIC_RELEVANCE_SDK_GATE_FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
const schema=z.discriminatedUnion("phase",[
 z.strictObject({phase:z.literal("sdk-properties"),method:z.literal("Runtime.getProperties"),params:z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)})}),
 z.strictObject({phase:z.literal("sdk-frame"),stage:z.enum(["run","gate"]),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({...flags,callFrameId:handle,expression:z.string().max(256),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)})}),
 z.strictObject({phase:z.literal("sdk-call"),role:z.string().max(64),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.string().max(16_384),arguments:z.array(arg).max(4),returnByValue:z.boolean(),awaitPromise:z.literal(false),userGesture:z.literal(false)})}),
 z.strictObject({phase:z.literal("sdk-release"),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,throwOnSideEffect:z.literal(false),objectId:handle,functionDeclaration:z.literal(RELEASE),arguments:z.tuple([arg,arg,arg]),returnByValue:z.literal(true),awaitPromise:z.literal(false),userGesture:z.literal(false)})}),
 z.strictObject({phase:z.literal("sdk-resume"),method:z.literal("Debugger.resume"),params:z.strictObject({})})]);
export type CurrentSchematicRelevanceSdkGateCommand=z.infer<typeof schema>;
/** Accept only the fixed frame expressions and reviewed call rows; resolver invocation has its own effectful command variant. */
export function validateCurrentSchematicRelevanceSdkGateCommand(input:unknown):CurrentSchematicRelevanceSdkGateCommand{const command=schema.parse(captureCurrentPcbStringClockReply(input).value);if(command.phase==="sdk-frame"&&command.params.expression!==SOURCE.expressions[command.stage]){throw new Error("SCH_SDK_GATE_FIXED_FRAME");}if(command.phase==="sdk-call"){const row=CURRENT_SCHEMATIC_RELEVANCE_SDK_GATE_CALLS.find(value=>value[0]===command.role);if(!row||row[0]==="release"||command.params.functionDeclaration!==row[1]||command.params.arguments.length!==row[2]||command.params.returnByValue!==row[3]){throw new Error("SCH_SDK_GATE_FIXED_CALL");}}return freezeDeep(command);}
