/** Source-owned worker guards and explicit continuations. This vocabulary
 * selects no caller listener and issues no worker/Modify/Save authority. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_NATIVE_OWN_DATA_CHECK as CHECK } from "./current-native-own-data-intrinsics.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_SOURCE as SOURCE } from "./current-schematic-relevance-modify-worker-replies.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_BODY_PROGRAMS as BODY } from "./current-schematic-relevance-modify-body-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_PROGRAMS as WORKER } from "./current-schematic-relevance-modify-worker-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CONTROL_FLAGS = Object.freeze({ objectGroup: "easyeda-schematic-relevance-modify-control-v1", silent: true, generatePreview: false, throwOnSideEffect: true } as const);
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CONTROL_KINDS = Object.freeze(["handler", "batch"] as const);
export type CurrentSchematicRelevanceModifyControlKind = typeof CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CONTROL_KINDS[number];
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CONTROL_ROLES = Object.freeze(["handler", "batch", "batchReturned", "handlerReturned"] as const);
export type CurrentSchematicRelevanceModifyControlRole = typeof CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CONTROL_ROLES[number];
/** Exact coordinates come from uninvoked source-preserving V8 functions in
 * the fully SHA-qualified original worker script. */
export function currentSchematicRelevanceModifyControlFunctionPoint(kind: CurrentSchematicRelevanceModifyControlKind): Readonly<{ lineNumber: number; columnNumber: number }> { const row = SOURCE.roles[kind]; return Object.freeze({ lineNumber: row.lineNumber, columnNumber: row.columnNumber }); }
/** Select only the original entry or normal-return coordinate for a fixed
 * role; matching coordinates alone authorize no continuation. */
export function currentSchematicRelevanceModifyControlPoint(role: CurrentSchematicRelevanceModifyControlRole): Readonly<{ lineNumber: number; columnNumber: number }> {
  if (role === "handler") { return Object.freeze({ lineNumber: 0, columnNumber: 11_789 }); }
  if (role === "batch") { return Object.freeze({ lineNumber: 110, columnNumber: 98_769 }); }
  if (role === "batchReturned") { return Object.freeze({ lineNumber: 110, columnNumber: 98_916 }); }
  return Object.freeze({ lineNumber: 0, columnNumber: 11_811 });
}
const prefix = "const packet=this,"; if (!CHECK.startsWith(prefix)) { throw new Error("SCH_MODIFY_CONTROL_INTRINSIC_ANCHOR"); }
const frameSame = `function(native,receiver,argument){"use strict";const packet=native,${CHECK.slice(prefix.length)}dense(this,2);if(value(this,"0")!==receiver||value(this,"1")!==argument)bad();return true;}`;
const batchSame = `function(frame,project,read){"use strict";${CHECK}dense(frame,2);dense(project,2);dense(read,2);if(value(frame,"0")!==value(project,"0")||value(frame,"1")!==value(value(read,"1"),"message"))bad();return true;}`;
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CONTROL_CALLS = freezeDeep([
  ["frame-same", frameSame, 3, true], ["batch-same", batchSame, 3, true],
  ["body-roots", BODY.roots, 0, false], ["body-parts", BODY.parts, 2, false], ["body-iterator", BODY.iterator, 2, false], ["body-parents", BODY.parents, 2, false], ["body-next", BODY.next, 2, false], ["body-proof", BODY.proof, 11, true],
  ["worker-same", WORKER.same, 2, true], ["worker-novel", WORKER.novel, 2, false], ["worker-merge", WORKER.merge, 2, false], ["worker-parents", WORKER.parents, 2, false], ["worker-snapshot", WORKER.snapshot, 1, false], ["worker-reprove", WORKER.reprove, 0, true],
] as const);
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CONTROL_REQUESTS = Object.freeze({ arms: 6, frames: 4, properties: 4, proofs: 4, removals: 4, resumes: 4, events: 8, helpers: 8, controls: 0, cdpRequests: 26, total: 42 } as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const point = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const kind = z.enum(CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CONTROL_KINDS), role = z.enum(CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CONTROL_ROLES);
const flags = { objectGroup: z.literal(CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CONTROL_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true) };
const possible = z.strictObject({ start: point, end: point, restrictToFunction: z.literal(true) });
const armReturn = z.strictObject({ location: point, condition: z.literal("") });
const armFunction = z.strictObject({ objectId: handle, condition: z.literal("") });
const properties = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const frame = z.strictObject({ ...flags, callFrameId: handle, expression: z.literal("[this,s]"), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) });
const argument = z.strictObject({ objectId: handle });
const call = z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.string().max(16_384), arguments: z.array(argument).max(11), returnByValue: z.boolean(), awaitPromise: z.literal(false), userGesture: z.literal(false) });
const remove = z.strictObject({ breakpointId: handle }); const empty = z.strictObject({});
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("modify-control-possible"), kind, method: z.literal("Debugger.getPossibleBreakpoints"), params: possible }),
  z.strictObject({ phase: z.literal("modify-control-return"), kind, method: z.literal("Debugger.setBreakpoint"), params: armReturn }),
  z.strictObject({ phase: z.literal("modify-control-function"), kind, method: z.literal("Debugger.setBreakpointOnFunctionCall"), params: armFunction }),
  z.strictObject({ phase: z.literal("modify-control-properties"), method: z.literal("Runtime.getProperties"), params: properties }),
  z.strictObject({ phase: z.literal("modify-control-frame"), role, method: z.literal("Debugger.evaluateOnCallFrame"), params: frame }),
  z.strictObject({ phase: z.literal("modify-control-proof"), role: z.string().max(64), method: z.literal("Runtime.callFunctionOn"), params: call }),
  z.strictObject({ phase: z.literal("modify-control-remove"), method: z.literal("Debugger.removeBreakpoint"), params: remove }),
  z.strictObject({ phase: z.literal("modify-control-resume"), method: z.literal("Debugger.resume"), params: empty }),
]);
export type CurrentSchematicRelevanceModifyControlCommand = z.infer<typeof schema>;
/** Refuse changed coordinates, flags, frame expressions and argument forms
 * before a genuine owner can submit this fixed command. */
export function validateCurrentSchematicRelevanceModifyControlCommand(input: unknown): CurrentSchematicRelevanceModifyControlCommand {
  const command = schema.parse(captureCurrentPcbStringClockReply(input).value);
  if (command.phase === "modify-control-possible") {
    const start = currentSchematicRelevanceModifyControlFunctionPoint(command.kind); const end = currentSchematicRelevanceModifyControlPoint(command.kind === "handler" ? "handlerReturned" : "batchReturned");
    if (command.params.start.scriptId !== command.params.end.scriptId || command.params.start.lineNumber !== start.lineNumber || command.params.start.columnNumber !== start.columnNumber || command.params.end.lineNumber !== end.lineNumber || command.params.end.columnNumber !== end.columnNumber + 1) { throw new Error("SCH_MODIFY_CONTROL_SOURCE_POINT"); }
  }
  if (command.phase === "modify-control-return") {
    const at = currentSchematicRelevanceModifyControlPoint(command.kind === "handler" ? "handlerReturned" : "batchReturned");
    if (command.params.location.lineNumber !== at.lineNumber || command.params.location.columnNumber !== at.columnNumber) { throw new Error("SCH_MODIFY_CONTROL_SOURCE_POINT"); }
  }
  if (command.phase === "modify-control-proof") {
    const row = CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CONTROL_CALLS.find(value => value[0] === command.role);
    if (row === undefined || row[1] !== command.params.functionDeclaration || row[2] !== command.params.arguments.length || row[3] !== command.params.returnByValue) { throw new Error("SCH_MODIFY_CONTROL_FIXED_PROOF"); }
  }
  return freezeDeep(command);
}
