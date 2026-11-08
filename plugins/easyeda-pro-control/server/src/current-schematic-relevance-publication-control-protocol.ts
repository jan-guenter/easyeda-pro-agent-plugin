/** Original publisher execution has its own bounded vocabulary. The fixed
 * receiver/return guards cannot invoke a supplied function or completion hook. */
import {z} from "zod";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {captureCurrentPcbStringClockReply} from "./current-pcb-string-clock-reply.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_BROADCAST_CALLEE_SOURCE as BUS} from "./current-schematic-relevance-broadcast-callee-source.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_CALLEE_SOURCE as PUBLISHER} from "./current-schematic-relevance-publication-callee-source.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_NATIVE_REQUESTS as NATIVE} from "./current-schematic-relevance-publication-native-protocol.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_SDK_GATE_CALLS as SDK} from "./current-schematic-relevance-sdk-gate-protocol.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_BODY_PROGRAMS as P} from "./current-schematic-relevance-publication-body-programs.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_CONTROL_FLAGS=Object.freeze({objectGroup:"easyeda-pro-control-schematic-publication-control-v1",silent:true,generatePreview:false,throwOnSideEffect:true}as const);
export const CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_CONTROL_CALLS=freezeDeep([...SDK.filter(row=>["hooks","reflection-reprove","native-defaultInstance","native-hooks","run","native","wait","context-same","pending-delta","timer-id"].some(role=>role===row[0])).map(row=>[`prior-${row[0]}`,row[1],row[2],row[3]]as const),["before",P.before,4,true],["post",P.post,5,true],["payload",P.payload,5,true],["post-same",P.postSame,2,true],["target",P.target,1,true],["cache",P.cache,2,false],["cleared",P.cleared,7,true],["timer",P.timer,7,true]]as const);
export const CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_CONTROL_FRAMES=freezeDeep({post:"[this,j]",publisher:"[this]",timer:"[this,a,Promise]"}as const);
export const CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_RETURN_ROLES=Object.freeze(["post","publisher","timer","loopback"]as const);
export type CurrentSchematicRelevancePublicationReturnRole=typeof CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_RETURN_ROLES[number];
/** These exact return positions were independently obtained from uninvoked
 * source-preserving V8 functions in both complete pinned bundles. */
/** Select the exact uninvoked V8 return coordinate from the pinned bundle
 * variant; no caller supplies or rounds a breakpoint location. */
export function currentSchematicRelevancePublicationReturnPoint(variant:0|1,role:CurrentSchematicRelevancePublicationReturnRole):Readonly<{lineNumber:number;columnNumber:number}>{
 const b=BUS[variant].roles,p=PUBLISHER[variant].roles;
 if(role==="post"){return Object.freeze({lineNumber:b.post.lineNumber,columnNumber:116_711});}
 if(role==="loopback"){return Object.freeze({lineNumber:b.onMessage.lineNumber,columnNumber:116_222});}
 return Object.freeze({lineNumber:p.publishPendData.lineNumber,columnNumber:role==="publisher"?23_631:23_370});
}
/** Retain the source function start separately from its first statement,
 * so entry and return frames can prove the same original callee. */
export function currentSchematicRelevancePublicationFunctionPoint(variant:0|1,role:CurrentSchematicRelevancePublicationReturnRole):Readonly<{lineNumber:number;columnNumber:number}>{
 const b=BUS[variant].roles,p=PUBLISHER[variant].roles;
 if(role==="post"){return b.post;}if(role==="loopback"){return b.onMessage;}return role==="publisher"?p.publishPendData:p.timerCallback;
}
const perStage=2*(NATIVE.reproofReads+16)+30;
export const CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_CONTROL_REQUESTS=Object.freeze({stages:7,perStage,postSendReproof:perStage,reads:8*perStage,helpers:8*perStage,armReads:10,resumes:6,controls:9,total:2*(8*perStage+10)+6+9});
const handle=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const arg=z.strictObject({objectId:handle});
const point=z.strictObject({scriptId:handle,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const role=z.enum(CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_RETURN_ROLES),variant=z.union([z.literal(0),z.literal(1)]);
const flags={objectGroup:z.literal(CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_CONTROL_FLAGS.objectGroup),silent:z.literal(true),generatePreview:z.literal(false),throwOnSideEffect:z.literal(true)};
const possibleParams=z.strictObject({start:point,end:point,restrictToFunction:z.literal(true)});
const returnParams=z.strictObject({location:point,condition:z.literal("")});
const functionParams=z.strictObject({objectId:handle,condition:z.literal("")});
const propertyParams=z.strictObject({objectId:handle,ownProperties:z.literal(true),accessorPropertiesOnly:z.literal(false),generatePreview:z.literal(false)});
const frameParams=z.strictObject({...flags,callFrameId:handle,expression:z.string().max(64),returnByValue:z.literal(false),includeCommandLineAPI:z.literal(false)});
const callParams=z.strictObject({...flags,objectId:handle,functionDeclaration:z.string().max(16_384),arguments:z.array(arg).max(7),returnByValue:z.boolean(),awaitPromise:z.literal(false),userGesture:z.literal(false)});
const empty=z.strictObject({});
const schema=z.discriminatedUnion("phase",[
 z.strictObject({phase:z.literal("publication-control-possible"),variant,role,method:z.literal("Debugger.getPossibleBreakpoints"),params:possibleParams}),
 z.strictObject({phase:z.literal("publication-control-return"),variant,role,method:z.literal("Debugger.setBreakpoint"),params:returnParams}),
 z.strictObject({phase:z.literal("publication-control-function"),role:z.enum(["post","loopback"]),method:z.literal("Debugger.setBreakpointOnFunctionCall"),params:functionParams}),
 z.strictObject({phase:z.literal("publication-control-properties"),method:z.literal("Runtime.getProperties"),params:propertyParams}),
 z.strictObject({phase:z.literal("publication-control-frame"),stage:z.enum(["post","publisher","timer"]),method:z.literal("Debugger.evaluateOnCallFrame"),params:frameParams}),
 z.strictObject({phase:z.literal("publication-control-call"),role:z.string().max(32),method:z.literal("Runtime.callFunctionOn"),params:callParams}),
 z.strictObject({phase:z.literal("publication-control-resume"),method:z.literal("Debugger.resume"),params:empty}),
]);
export type CurrentSchematicRelevancePublicationControlCommand=z.infer<typeof schema>;
/** Refuse any changed source coordinate, expression, helper body or flags
 * before it can reach the original native pipe. */
/** Copy descriptor-safe input, then accept only a complete fixed command
 * with exact flags, source coordinates, arity and helper bytes. */
export function validateCurrentSchematicRelevancePublicationControlCommand(input:unknown):CurrentSchematicRelevancePublicationControlCommand{
 const c=schema.parse(captureCurrentPcbStringClockReply(input).value);
 if(c.phase==="publication-control-possible"){const f=currentSchematicRelevancePublicationFunctionPoint(c.variant,c.role);const end=currentSchematicRelevancePublicationReturnPoint(c.variant,c.role);if(c.params.start.scriptId!==c.params.end.scriptId||c.params.start.lineNumber!==f.lineNumber||c.params.start.columnNumber!==f.columnNumber||c.params.end.lineNumber!==end.lineNumber||c.params.end.columnNumber!==end.columnNumber+1){throw new Error("SCH_PUBLICATION_CONTROL_POSSIBLE");}}
 if(c.phase==="publication-control-return"){const p=currentSchematicRelevancePublicationReturnPoint(c.variant,c.role);if(c.params.location.lineNumber!==p.lineNumber||c.params.location.columnNumber!==p.columnNumber){throw new Error("SCH_PUBLICATION_CONTROL_RETURN");}}
 if(c.phase==="publication-control-frame"&&c.params.expression!==CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_CONTROL_FRAMES[c.stage]){throw new Error("SCH_PUBLICATION_CONTROL_FRAME");}
 if(c.phase==="publication-control-call"){const row=CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_CONTROL_CALLS.find(value=>value[0]===c.role);if(row===undefined||row[1]!==c.params.functionDeclaration||row[2]!==c.params.arguments.length||row[3]!==c.params.returnByValue){throw new Error("SCH_PUBLICATION_CONTROL_HELPER");}}
 return freezeDeep(c);
}
