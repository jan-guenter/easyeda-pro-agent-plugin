/** Fixed original Canvas sender and selected UI Echo boundaries. This book
 * contains only source-owned guards, frames, removals and original resumes. */
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_SOURCE as WORKER } from "./current-schematic-relevance-modify-worker-replies.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_SOURCE as HANDLER } from "./current-schematic-relevance-modify-echo-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_CANVAS_ECHO_SOURCE as PAGE } from "./current-schematic-relevance-canvas-echo-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_CONSISTENCY_CALLEE_SOURCE as CM } from "./current-schematic-relevance-consistency-callee-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_BROADCAST_CALLEE_SOURCE as BUS } from "./current-schematic-relevance-broadcast-callee-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CALLEE_SOURCE as WORKER_CM } from "./current-schematic-relevance-modify-cm-callee-source.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_WORKER_ROLES = Object.freeze(["workerPublish", "workerPost", "workerPostReturned", "workerLoopback", "workerLoopbackReturned"] as const);
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_UI_ROLES = Object.freeze(["uiHandler", "uiExecute", "uiCallback", "uiPush", "uiPublish", "uiRemote", "uiRemoteReturned", "uiPublishReturned", "uiPushReturned", "uiCallbackReturned", "uiExecuteReturned", "uiHandlerReturned"] as const);
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_CONTROL_ROLES = Object.freeze([...CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_WORKER_ROLES, ...CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_UI_ROLES] as const);
export type CurrentSchematicRelevanceModifyEchoControlRole = typeof CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_CONTROL_ROLES[number];
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_CONTROL_FUNCTIONS = Object.freeze(["workerPublish", "workerPost", "workerLoopback", "uiHandler", "uiExecute", "uiCallback", "uiPush", "uiPublish", "uiRemote"] as const);
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_CONTROL_RETURNS = Object.freeze(["workerPostReturned", "workerLoopbackReturned", "uiRemoteReturned", "uiPublishReturned", "uiPushReturned", "uiCallbackReturned", "uiExecuteReturned", "uiHandlerReturned"] as const);
type Role = CurrentSchematicRelevanceModifyEchoControlRole;
type Point = Readonly<{ lineNumber: number; columnNumber: number }>;

/** Select the independently pinned callee. Suffixes describe observations of
 * the same function; they cannot select another source or receiver. */
export function currentSchematicRelevanceModifyEchoControlFunction(variant: 0 | 1, role: Role): Point {
  let row: Point;
  if (role === "workerPublish") { row = WORKER.roles.publish; }
  else if (role === "workerPost" || role === "workerPostReturned") { row = WORKER.roles.post; }
  else if (role === "workerLoopback" || role === "workerLoopbackReturned") { row = WORKER.roles.onMessage; }
  else if (role === "uiHandler" || role === "uiHandlerReturned") { row = HANDLER[variant]; }
  else if (role === "uiExecute" || role === "uiExecuteReturned") { row = PAGE[variant].roles.taskExecute; }
  else if (role === "uiCallback" || role === "uiCallbackReturned") { row = PAGE[variant].roles.projectUpdateCallback; }
  else if (role === "uiPush" || role === "uiPushReturned") { row = PAGE[variant].roles.pushOnLine; }
  else if (role === "uiPublish" || role === "uiPublishReturned") { row = PAGE[variant].roles.publishLine; }
  else { row = CM[variant].roles.consistencyRemoteChange; }
  return Object.freeze({ lineNumber: row.lineNumber, columnNumber: row.columnNumber });
}
const offsets = freezeDeep({ workerPublish: 6, workerPost: 4, workerPostReturned: 74, workerLoopback: 13, workerLoopbackReturned: 407, uiHandler: 4, uiExecute: 15, uiCallback: 4, uiPush: 14, uiPublish: 42, uiRemote: 41, uiRemoteReturned: 409, uiPublishReturned: 156, uiPushReturned: 115, uiCallbackReturned: 63, uiExecuteReturned: 72, uiHandlerReturned: 26 } as const);
/** Actual Node24 possible-breakpoint coordinates include the successful false
 * publishLine return. Its other cache-write return is deliberately excluded. */
export function currentSchematicRelevanceModifyEchoControlPoint(variant: 0 | 1, role: Role): Point {
  const at = currentSchematicRelevanceModifyEchoControlFunction(variant, role);
  return Object.freeze({ lineNumber: at.lineNumber, columnNumber: at.columnNumber + offsets[role] });
}
/** Pin each reached caller to the original source member call. Handler
 * delivery has a native caller and is instead qualified by its actual Event. */
export function currentSchematicRelevanceModifyEchoControlCaller(variant: 0 | 1, role: Role): Readonly<{ functionLocation: Point; location: Point }> | null {
  let caller: Point; let offset: number;
  if (role === "workerPublish") { caller = WORKER_CM.roles.canvasTimer; offset = 67; }
  else if (role === "workerPost" || role === "workerPostReturned") { caller = WORKER.roles.broadcastPublish; offset = 11; }
  else if (role === "workerLoopback" || role === "workerLoopbackReturned") { caller = WORKER.roles.loopback; offset = 10; }
  else if (role === "uiExecute" || role === "uiExecuteReturned") { caller = BUS[variant].roles.onReceivedPublish; offset = 152; }
  else if (role === "uiCallback" || role === "uiCallbackReturned") { caller = PAGE[variant].roles.taskExecute; offset = 34; }
  else if (role === "uiPush" || role === "uiPushReturned") { caller = PAGE[variant].roles.projectUpdateCallback; offset = 40; }
  else if (role === "uiPublish" || role === "uiPublishReturned") { caller = PAGE[variant].roles.pushOnLine; offset = 53; }
  else if (role === "uiRemote" || role === "uiRemoteReturned") { caller = PAGE[variant].roles.publishLine; offset = 91; }
  else { return null; }
  const fn = Object.freeze({ lineNumber: caller.lineNumber, columnNumber: caller.columnNumber });
  return Object.freeze({ functionLocation: fn, location: Object.freeze({ lineNumber: caller.lineNumber, columnNumber: caller.columnNumber + offset }) });
}
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_CONTROL_FRAMES = freezeDeep({
  workerPublish: "[this,e,t]", workerPost: "[this,e]", workerPostReturned: "[this,e]", workerLoopback: "[this,e]", workerLoopbackReturned: "[this,e]",
  uiHandler: "[this,K]", uiHandlerReturned: "[this,K]", uiExecute: "[this,j]", uiExecuteReturned: "[this,j]", uiCallback: "[this,l]", uiCallbackReturned: "[this,l]", uiPush: "[this,i,e]", uiPushReturned: "[this,i,e]", uiPublish: "[this,i,e,t,r,n,s,a,o,l,c,u]", uiPublishReturned: "[this,i,e,t,r,n,s,a,o,l,c,u]", uiRemote: "[this,i,e,t,r,n,s,a,o,l,c,u,h,d,p]", uiRemoteReturned: "[this,i,e,t,r,n,s,a,o,l,c,u,h,d,p]",
} as const);
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_CONTROL_FLAGS = Object.freeze({ objectGroup: "easyeda-schematic-relevance-modify-echo-control-v1", silent: true, generatePreview: false, throwOnSideEffect: true } as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const role = z.enum(CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_CONTROL_ROLES); const returned = z.enum(CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_CONTROL_RETURNS);
const point = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const flags = { objectGroup: z.literal(CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_CONTROL_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true) };
const possibleParams = z.strictObject({ start: point, end: point, restrictToFunction: z.literal(true) });
const pointParams = z.strictObject({ location: point, condition: z.literal("") });
const functionParams = z.strictObject({ objectId: handle, condition: z.literal("") });
const frameParams = z.strictObject({ ...flags, callFrameId: handle, expression: z.string().max(128), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) });
const removeParams = z.strictObject({ breakpointId: handle });
const variant = z.union([z.literal(0), z.literal(1)]); const empty = z.strictObject({});
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("modify-echo-control-prior-remove"), role: z.literal("cmRemote"), method: z.literal("Debugger.removeBreakpoint"), params: removeParams }),
  z.strictObject({ phase: z.literal("modify-echo-control-publication-remove"), role: z.enum(["publicationPost", "publicationPostReturned", "publicationPublisherReturned", "publicationTimerReturned", "publicationLoopback", "publicationLoopbackReturned"]), method: z.literal("Debugger.removeBreakpoint"), params: removeParams }),
  z.strictObject({ phase: z.literal("modify-echo-control-publication-resume"), role: z.literal("publicationLoopbackReturned"), method: z.literal("Debugger.resume"), params: empty }),
  z.strictObject({ phase: z.literal("modify-echo-control-function"), role: z.enum(CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_CONTROL_FUNCTIONS), method: z.literal("Debugger.setBreakpointOnFunctionCall"), params: functionParams }),
  z.strictObject({ phase: z.literal("modify-echo-control-possible"), role: returned, variant, method: z.literal("Debugger.getPossibleBreakpoints"), params: possibleParams }),
  z.strictObject({ phase: z.literal("modify-echo-control-point"), role: returned, variant, method: z.literal("Debugger.setBreakpoint"), params: pointParams }),
  z.strictObject({ phase: z.literal("modify-echo-control-frame"), role, method: z.literal("Debugger.evaluateOnCallFrame"), params: frameParams }),
  z.strictObject({ phase: z.literal("modify-echo-control-remove"), role, method: z.literal("Debugger.removeBreakpoint"), params: removeParams }),
  z.strictObject({ phase: z.literal("modify-echo-control-resume"), role, method: z.literal("Debugger.resume"), params: empty }),
]);
export type CurrentSchematicRelevanceModifyEchoControlCommand = Readonly<z.infer<typeof schema>>;
/** Match every source point, fixed expression and effect flag before the
 * owner may encode it. A worker variant cannot select a UI source profile. */
export function validateCurrentSchematicRelevanceModifyEchoControlCommand(input: unknown): CurrentSchematicRelevanceModifyEchoControlCommand {
  const command = schema.parse(captureCurrentPcbStringClockReply(input).value);
  if (command.phase === "modify-echo-control-frame" && command.params.expression !== CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_CONTROL_FRAMES[command.role]) { throw new Error("SCH_ECHO_CONTROL_FRAME"); }
  if (command.phase === "modify-echo-control-possible" || command.phase === "modify-echo-control-point") {
    if (command.role.startsWith("worker") && command.variant !== 0) { throw new Error("SCH_ECHO_CONTROL_WORKER_VARIANT"); }
    const at = currentSchematicRelevanceModifyEchoControlPoint(command.variant, command.role);
    if (command.phase === "modify-echo-control-point") {
      if (command.params.location.lineNumber !== at.lineNumber || command.params.location.columnNumber !== at.columnNumber) { throw new Error("SCH_ECHO_CONTROL_POINT"); }
    } else {
      const start = currentSchematicRelevanceModifyEchoControlFunction(command.variant, command.role); const actual = command.params;
      if (actual.start.scriptId !== actual.end.scriptId || actual.start.lineNumber !== start.lineNumber || actual.start.columnNumber !== start.columnNumber || actual.end.lineNumber !== at.lineNumber || actual.end.columnNumber !== at.columnNumber + 1) { throw new Error("SCH_ECHO_CONTROL_POSSIBLE"); }
    }
  }
  return freezeDeep(command);
}
const functions = CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_CONTROL_FUNCTIONS.length;
const returns = CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_CONTROL_RETURNS.length;
const guards = CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_CONTROL_ROLES.length;
const captures = 32; const resumes = guards + 1; const events = guards + resumes; const publicationRemovals = 6; const priorRemovals = 1;
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_CONTROL_REQUESTS = Object.freeze({ functions, returns, guards, setup: functions + returns * 2, captures, helpers: captures, removals: guards + publicationRemovals + priorRemovals, publicationRemovals, priorRemovals, resumes, events, total: functions + returns * 2 + captures * 2 + guards + publicationRemovals + priorRemovals + resumes + events } as const);
