/** Original notification entry/return boundaries only. No supplied code,
 * breakpoint coordinates or alternate dispatcher can enter this vocabulary. */
import {z} from "zod";
import {freezeDeep} from "./sqlite-inventory-core.ts";
import {captureCurrentPcbStringClockReply} from "./current-pcb-string-clock-reply.ts";
import {CURRENT_SCHEMATIC_RELEVANCE_NORMAL_UI_SOURCE as SOURCE} from "./current-schematic-relevance-normal-ui-source.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_NOTIFICATION_POINTS=freezeDeep({jobReturned:{role:"notification",lineNumber:1172,columnNumber:1_832_309},visit:{role:"notificationVisit",lineNumber:1172,columnNumber:1_832_203},visitReturned:{role:"notificationVisit",lineNumber:1172,columnNumber:1_832_279},dispatchReturned:{role:"reactDispatch",lineNumber:1039,columnNumber:25_312}}as const);
export const CURRENT_SCHEMATIC_RELEVANCE_NOTIFICATION_CONTROL_REQUESTS=Object.freeze({possible:3,promisePrototypeMetadata:1,targetIdentityReads:24,targetIdentityHelpers:24,arms:5,resumes:105,controls:107,total:3+1+24+24+5+105+107});
const token=z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const point=z.strictObject({scriptId:token,lineNumber:z.number().int().nonnegative(),columnNumber:z.number().int().nonnegative()});
const possibleParams=z.strictObject({start:point,end:point,restrictToFunction:z.literal(true)});
const armParams=z.strictObject({location:point,condition:z.literal("")});
const functionParams=z.strictObject({objectId:token,condition:z.literal("")});
const resumeParams=z.strictObject({});
const schema=z.discriminatedUnion("phase",[
 z.strictObject({phase:z.literal("notification-possible"),kind:z.enum(["jobReturned","visitReturned","dispatchReturned"]),method:z.literal("Debugger.getPossibleBreakpoints"),params:possibleParams}),
 z.strictObject({phase:z.literal("notification-arm"),kind:z.enum(["jobReturned","visit","visitReturned","dispatchReturned"]),method:z.literal("Debugger.setBreakpoint"),params:armParams}),
 z.strictObject({phase:z.literal("notification-arm-dispatch"),method:z.literal("Debugger.setBreakpointOnFunctionCall"),params:functionParams}),
 z.strictObject({phase:z.literal("notification-resume"),method:z.literal("Debugger.resume"),params:resumeParams})]);
export type CurrentSchematicRelevanceNotificationControlCommand=z.infer<typeof schema>;
/** Validate the fixed source coordinates before any command reaches an original owner. */
export function validateCurrentSchematicRelevanceNotificationControlCommand(input:unknown):CurrentSchematicRelevanceNotificationControlCommand{const command=schema.parse(captureCurrentPcbStringClockReply(input).value);if(command.phase==="notification-possible"){const expected=CURRENT_SCHEMATIC_RELEVANCE_NOTIFICATION_POINTS[command.kind],start=SOURCE.roles[expected.role];const actual=command.params;if(actual.start.scriptId!==actual.end.scriptId||actual.start.lineNumber!==start.lineNumber||actual.start.columnNumber!==start.columnNumber||actual.end.lineNumber!==expected.lineNumber||actual.end.columnNumber!==expected.columnNumber+1){throw new Error("SCH_NOTIFICATION_POSSIBLE_RANGE");}}if(command.phase==="notification-arm"){const actual=command.params.location,expected=CURRENT_SCHEMATIC_RELEVANCE_NOTIFICATION_POINTS[command.kind];if(actual.lineNumber!==expected.lineNumber||actual.columnNumber!==expected.columnNumber){throw new Error("SCH_NOTIFICATION_FIXED_POINT");}}return freezeDeep(command);}
