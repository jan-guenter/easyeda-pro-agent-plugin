/* oxlint-disable unicorn/max-nested-calls -- The fixed passive schema keeps complete argument and flag shapes at its boundary. */
/** Closed passive projections and original notification boundary controls. */
import {z} from "zod";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {captureCurrentPcbStringClockReply} from "./current-pcb-string-clock-reply.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_NORMAL_COMMAND_UI_CALLS as PRIOR} from "./current-schematic-relevance-normal-command-ui-protocol.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_NOTIFICATION_ARGUMENTS_SAME as ARGUMENTS_SAME,CURRENT_SCHEMATIC_RELEVANCE_NOTIFICATION_BOUND_PROTOTYPE as BOUND_PROTOTYPE,CURRENT_SCHEMATIC_RELEVANCE_NOTIFICATION_DELEGATE as DELEGATE,CURRENT_SCHEMATIC_RELEVANCE_NOTIFICATION_DELEGATE_IMMUTABLE as DELEGATE_IMMUTABLE,CURRENT_SCHEMATIC_RELEVANCE_NOTIFICATION_DELEGATE_OBJECTS as DELEGATE_OBJECTS,CURRENT_SCHEMATIC_RELEVANCE_NOTIFICATION_DELTAS as DELTAS,CURRENT_SCHEMATIC_RELEVANCE_NOTIFICATION_DISPATCH as DISPATCH,CURRENT_SCHEMATIC_RELEVANCE_NOTIFICATION_DISPATCH_RETURNED as DISPATCH_RETURNED,CURRENT_SCHEMATIC_RELEVANCE_NOTIFICATION_EXPRESSIONS as EXPRESSIONS,CURRENT_SCHEMATIC_RELEVANCE_NOTIFICATION_FUNCTIONS as FUNCTIONS,CURRENT_SCHEMATIC_RELEVANCE_NOTIFICATION_IDENTITY as IDENTITY,CURRENT_SCHEMATIC_RELEVANCE_NOTIFICATION_JOB as JOB,CURRENT_SCHEMATIC_RELEVANCE_NOTIFICATION_JOB_RETURNED as JOB_RETURNED,CURRENT_SCHEMATIC_RELEVANCE_NOTIFICATION_PLAN as PLAN,CURRENT_SCHEMATIC_RELEVANCE_NOTIFICATION_PROMISE_PROTOTYPE as PROMISE_PROTOTYPE,CURRENT_SCHEMATIC_RELEVANCE_NOTIFICATION_PROMISE_RETAIN as PROMISE_RETAIN,CURRENT_SCHEMATIC_RELEVANCE_NOTIFICATION_REDUCER as REDUCER,CURRENT_SCHEMATIC_RELEVANCE_NOTIFICATION_ROWS as ROWS,CURRENT_SCHEMATIC_RELEVANCE_NOTIFICATION_VISIT as VISIT} from "./current-schematic-relevance-notification-programs.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_NOTIFICATION_FLAGS=Object.freeze({objectGroup:"easyeda-pro-control-schematic-relevance-notification-v1",silent:true,generatePreview:false,throwOnSideEffect:true}as const);
const keep=["hooks","reflection-reprove","native-defaultInstance","native-hooks","same","snapshot","map-same"]as const;
export const CURRENT_SCHEMATIC_RELEVANCE_NOTIFICATION_CALLS=freezeDeep([...PRIOR.filter(row=>keep.some(role=>role===row[0])),["plan",PLAN,6,false],["rows",ROWS,1,false],["functions",FUNCTIONS,1,false],["reducer",REDUCER,1,false],["delegate-objects",DELEGATE_OBJECTS,3,false],["delegate-immutable",DELEGATE_IMMUTABLE,1,false],["delegate",DELEGATE,5,true],["arguments-same",ARGUMENTS_SAME,2,true],["identity",IDENTITY,2,true],["job",JOB,3,true],["job-returned",JOB_RETURNED,3,true],["visit",VISIT,3,true],["dispatch",DISPATCH,6,true],["dispatch-returned",DISPATCH_RETURNED,5,true],["promise-retain",PROMISE_RETAIN,0,false],["bound-prototype",BOUND_PROTOTYPE,2,true],["promise-prototype",PROMISE_PROTOTYPE,2,true],...DELTAS.map((program,index)=>[`delta-${String(index)}`,program,3,true]as const)]as const);
/** Passive reads only. Separate original control vocabulary owns all arms,
 * removals, resumes and event/Promise settlement counts. */
const MAX_JOBS=4,MAX_WATCHERS=24;
const beforeReads=24+4*MAX_JOBS+33*MAX_WATCHERS;const beforeHelpers=19+11*MAX_WATCHERS;
const completionHelpers=7,completionReads=7,delegateHelpers=21,delegateReads=25,jobHelpers=16,jobReads=17,returnHelpers=21,returnReads=26,visitorHelpers=16,visitorReads=17;
const collectorReads=beforeReads+2*MAX_JOBS*jobReads+2*MAX_WATCHERS*visitorReads+MAX_WATCHERS*(delegateReads+returnReads)+completionReads;
const collectorHelpers=beforeHelpers+2*MAX_JOBS*jobHelpers+2*MAX_WATCHERS*visitorHelpers+MAX_WATCHERS*(delegateHelpers+returnHelpers)+completionHelpers;
/** Core selects original visitor promises: one retain, and at most two native
 * prototype+metadata reproofs per visitor (return hold and later SDK hold). */
const promiseReads=5*MAX_WATCHERS;const promiseHelpers=3*MAX_WATCHERS;
export const CURRENT_SCHEMATIC_RELEVANCE_NOTIFICATION_REQUESTS=Object.freeze({jobs:MAX_JOBS,watchers:MAX_WATCHERS,beforeReads,beforeHelpers,jobReads,jobHelpers,visitorReads,visitorHelpers,delegateReads,delegateHelpers,returnReads,returnHelpers,completionReads,completionHelpers,collectorReads,collectorHelpers,promiseReads,promiseHelpers,total:collectorReads+collectorHelpers});
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const arg=z.strictObject({objectId:handle});
const flags={objectGroup:z.literal(CURRENT_SCHEMATIC_RELEVANCE_NOTIFICATION_FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
const schema=z.discriminatedUnion("phase",[
 z.strictObject({phase:z.literal("notification-properties"),method:z.literal("Runtime.getProperties"),params:z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)})}),
 z.strictObject({phase:z.literal("notification-frame"),stage:z.enum(["job","visit","dispatch","dispatchReturned"]),method:z.literal("Debugger.evaluateOnCallFrame"),params:z.strictObject({...flags,callFrameId:handle,expression:z.string().max(128),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)})}),
 z.strictObject({phase:z.literal("notification-call"),role:z.string().max(64),method:z.literal("Runtime.callFunctionOn"),params:z.strictObject({...flags,objectId:handle,functionDeclaration:z.string().max(16_384),arguments:z.array(arg).max(6),returnByValue:z.boolean(),awaitPromise:z.literal(false),userGesture:z.literal(false)})})]);
export type CurrentSchematicRelevanceNotificationCommand=z.infer<typeof schema>;
/** Validate the closed notification schema and require the exact source expression or fixed call row.
 * Call declarations, argument counts and return modes must match the maintained catalogue before the command is frozen.
 */
export function validateCurrentSchematicRelevanceNotificationCommand(input:unknown):CurrentSchematicRelevanceNotificationCommand{const command=schema.parse(captureCurrentPcbStringClockReply(input).value);if(command.phase==="notification-frame"&&command.params.expression!==EXPRESSIONS[command.stage]){throw new Error("SCH_NOTIFICATION_FIXED_FRAME");}if(command.phase==="notification-call"){const row=CURRENT_SCHEMATIC_RELEVANCE_NOTIFICATION_CALLS.find(value=>value[0]===command.role);if(!row||row[1]!==command.params.functionDeclaration||row[2]!==command.params.arguments.length||row[3]!==command.params.returnByValue){throw new Error("SCH_NOTIFICATION_FIXED_CALL");}}return freezeDeep(command);}
