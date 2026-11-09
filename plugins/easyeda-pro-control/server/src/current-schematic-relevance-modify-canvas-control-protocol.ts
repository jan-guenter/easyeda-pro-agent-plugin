/** Fixed source boundaries for one original Sheet/canvas invocation. Created
 * callbacks are guarded by pinned source points before their handles exist;
 * receiver, resolver and Promise lineage remain separate original proofs. */
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_FRAMES as PASSIVE_FRAMES } from "./current-schematic-relevance-modify-canvas-protocol.ts";
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CALLEE_SOURCE as SOURCE } from "./current-schematic-relevance-modify-cm-callee-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_ROLES = Object.freeze(["onDataChange", "publishCanvas", "executor", "constructed", "publishCanvasReturned", "onDataChangeReturned", "timer", "timerReturned"] as const);
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_FUNCTION_ROLES = Object.freeze(["onDataChange", "publishCanvas"] as const);
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_SOURCE_ROLES = Object.freeze(["executor", "constructed", "publishCanvasReturned", "onDataChangeReturned", "timer", "timerReturned"] as const);
export type CurrentSchematicRelevanceModifyCanvasRole = typeof CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_ROLES[number];
export type CurrentSchematicRelevanceModifyCanvasFunctionRole = typeof CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_FUNCTION_ROLES[number];
export type CurrentSchematicRelevanceModifyCanvasSourceRole = typeof CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_SOURCE_ROLES[number];

const points = freezeDeep({ onDataChange: [109, 70_191], publishCanvas: [109, 10_513], executor: [109, 11_348], constructed: [109, 11_352], publishCanvasReturned: [109, 11_629], onDataChangeReturned: [109, 71_058], timer: [109, 11_444], timerReturned: [109, 11_622] } as const);
/** These exact byte-preserving Inspector locations refuse rounding. The
 * constructed point is inside the block, after native Promise construction;
 * method return cannot read its already out-of-scope resolver/Promise locals. */
export function currentSchematicRelevanceModifyCanvasPoint(role: CurrentSchematicRelevanceModifyCanvasRole): Readonly<{ lineNumber: number; columnNumber: number }> {
 const value = points[role]; return Object.freeze({ lineNumber: value[0], columnNumber: value[1] });
}
/** Bind each boundary to the independently source-qualified original function,
 * including the actual enclosing publishCanvas for the constructed point. */
export function currentSchematicRelevanceModifyCanvasFunctionPoint(role: CurrentSchematicRelevanceModifyCanvasRole): Readonly<{ lineNumber: number; columnNumber: number }> {
 let key: "sheetOnDataChange" | "sheetPublishCanvas" | "canvasPromiseExecutor" | "canvasTimer" = "sheetPublishCanvas";
 if (role === "onDataChange" || role === "onDataChangeReturned") { key = "sheetOnDataChange"; }
 else if (role === "executor") { key = "canvasPromiseExecutor"; }
 else if (role === "timer" || role === "timerReturned") { key = "canvasTimer"; }
 const value = SOURCE.roles[key]; return Object.freeze({ lineNumber: value.lineNumber, columnNumber: value.columnNumber });
}
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_FRAMES = freezeDeep({
 onDataChange: PASSIVE_FRAMES.dataChange, publishCanvas: PASSIVE_FRAMES.entry, executor: "[g]", constructed: PASSIVE_FRAMES.constructed,
 publishCanvasReturned: PASSIVE_FRAMES.entry, onDataChangeReturned: PASSIVE_FRAMES.dataChange, timer: PASSIVE_FRAMES.constructed, timerReturned: PASSIVE_FRAMES.constructed,
 executorCaller: PASSIVE_FRAMES.caller, onChangeCaller: PASSIVE_FRAMES.onChangeCaller,
} as const);
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_CONTROL_FLAGS = Object.freeze({ objectGroup: "easyeda-schematic-relevance-modify-canvas-control-v1", silent: true, generatePreview: false, throwOnSideEffect: true } as const);
const setup = CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_SOURCE_ROLES.length * 2 + CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_FUNCTION_ROLES.length;
const count = CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_ROLES.length;
const captures = count + 2;
const beforeTimerResumes = CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_ROLES.indexOf("timer");
/** Parent onChange and later CM/handler events retain their original counters.
 * This ledger describes only eight new guarded boundaries and their readers. */
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_CONTROL_REQUESTS = Object.freeze({ beforeTimerResumes, beforeTimerEvents: beforeTimerResumes * 2 + 2, setup, captures, removals: count, resumes: count, events: count * 2, helpers: captures, total: setup + captures * 2 + count * 4 } as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const point = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const role = z.enum(CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_ROLES), sourceRole = z.enum(CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_SOURCE_ROLES);
const flags = { objectGroup: z.literal(CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_CONTROL_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true) };
const possibleParams = z.strictObject({ start: point, end: point, restrictToFunction: z.literal(true) });
const pointParams = z.strictObject({ location: point, condition: z.literal("") });
const functionParams = z.strictObject({ objectId: handle, condition: z.literal("") });
const frameRoles = z.enum([...CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_ROLES, "executorCaller", "onChangeCaller"]);
const frameParams = z.strictObject({ ...flags, callFrameId: handle, expression: z.string().max(128), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) });
const empty = z.strictObject({}), removeParams = z.strictObject({ breakpointId: handle });
const schema = z.discriminatedUnion("phase", [
 z.strictObject({ phase: z.literal("modify-canvas-control-possible"), role: sourceRole, method: z.literal("Debugger.getPossibleBreakpoints"), params: possibleParams }),
 z.strictObject({ phase: z.literal("modify-canvas-control-point"), role: sourceRole, method: z.literal("Debugger.setBreakpoint"), params: pointParams }),
 z.strictObject({ phase: z.literal("modify-canvas-control-function"), role: z.enum(CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_FUNCTION_ROLES), method: z.literal("Debugger.setBreakpointOnFunctionCall"), params: functionParams }),
 z.strictObject({ phase: z.literal("modify-canvas-control-frame"), role: frameRoles, method: z.literal("Debugger.evaluateOnCallFrame"), params: frameParams }),
 z.strictObject({ phase: z.literal("modify-canvas-control-remove"), role, method: z.literal("Debugger.removeBreakpoint"), params: removeParams }),
 z.strictObject({ phase: z.literal("modify-canvas-control-resume"), role, method: z.literal("Debugger.resume"), params: empty }),
]);
export type CurrentSchematicRelevanceModifyCanvasControlCommand = Readonly<z.infer<typeof schema>>;
/** Freeze descriptor-safe input after matching its complete fixed role,
 * expression, point, flags and arity. This accepts no caller program or grant. */
export function validateCurrentSchematicRelevanceModifyCanvasControlCommand(input: unknown): CurrentSchematicRelevanceModifyCanvasControlCommand {
 const command = schema.parse(captureCurrentPcbStringClockReply(input).value);
 if (command.phase === "modify-canvas-control-frame" && command.params.expression !== CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_FRAMES[command.role]) { throw new Error("SCH_MODIFY_CANVAS_FRAME"); }
 if (command.phase === "modify-canvas-control-possible") {
  const actual = command.params, end = currentSchematicRelevanceModifyCanvasPoint(command.role), start = currentSchematicRelevanceModifyCanvasFunctionPoint(command.role);
  if (actual.start.scriptId !== actual.end.scriptId || actual.start.lineNumber !== start.lineNumber || actual.start.columnNumber !== start.columnNumber || actual.end.lineNumber !== end.lineNumber || actual.end.columnNumber !== end.columnNumber + 1) { throw new Error("SCH_MODIFY_CANVAS_POSSIBLE"); }
 } else if (command.phase === "modify-canvas-control-point") {
  const actual = command.params.location, expected = currentSchematicRelevanceModifyCanvasPoint(command.role);
  if (actual.lineNumber !== expected.lineNumber || actual.columnNumber !== expected.columnNumber) { throw new Error("SCH_MODIFY_CANVAS_POINT"); }
 }
 return freezeDeep(command);
}
