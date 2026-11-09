/** One source-bounded record continuation. It ends at the original AST
 * function-call entry, before the next write or any monitor/publication body. */
/* oxlint-disable unicorn/max-nested-calls -- Each fixed phase has its own exact strict schema rather than an open command envelope. */
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_ACTION_RECEIVER_PROOF as RECEIVER } from "./current-schematic-relevance-action-callback-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_DESCRIPTOR_HOOKS as HOOKS } from "./current-schematic-relevance-publication-globals-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_PRIMITIVE_RAW_DELTA as RAW_DELTA, CURRENT_SCHEMATIC_RELEVANCE_PRIMITIVE_UI_DELTA as UI_DELTA } from "./current-schematic-relevance-primitive-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_RECORD_AST_BEFORE as BEFORE, CURRENT_SCHEMATIC_RELEVANCE_RECORD_AST_EXPRESSIONS as EXPRESSIONS } from "./current-schematic-relevance-record-ast-programs.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_RECORD_AST_REQUESTS = Object.freeze({ before: 7, resume: 1, ast: 7, controls: 3, total: 18 });
export const CURRENT_SCHEMATIC_RELEVANCE_RECORD_AST_FLAGS = Object.freeze({ objectGroup: "easyeda-pro-control-schematic-relevance-record-ast-v1", silent: true, generatePreview: false, throwOnSideEffect: true } as const);
export const CURRENT_SCHEMATIC_RELEVANCE_RECORD_AST_CALLS = freezeDeep([
  ["hooks", HOOKS, 0, true], ["raw-delta", RAW_DELTA, 6, true], ["ui-delta", UI_DELTA, 4, true], ["completion-delta", UI_DELTA, 4, true], ["record-before", BEFORE, 7, true], ["receiver", RECEIVER, 2, true],
] as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), object = z.strictObject({ objectId: handle });
const flags = { objectGroup: z.literal(CURRENT_SCHEMATIC_RELEVANCE_RECORD_AST_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true) };
const frame = z.strictObject({ ...flags, callFrameId: handle, expression: z.string().max(64), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) });
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("frame"), role: z.enum(["record", "ast"]), method: z.literal("Debugger.evaluateOnCallFrame"), params: frame }),
  z.strictObject({ phase: z.literal("properties"), method: z.literal("Runtime.getProperties"), params: z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) }) }),
  z.strictObject({ phase: z.literal("call"), role: z.enum(CURRENT_SCHEMATIC_RELEVANCE_RECORD_AST_CALLS.map(row => row[0])), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.string().max(16_384), arguments: z.array(object).max(10), returnByValue: z.boolean(), awaitPromise: z.literal(false), userGesture: z.literal(false) }) }),
  z.strictObject({ phase: z.literal("resume"), method: z.literal("Debugger.resume"), params: z.strictObject({}) }),
]);
export type CurrentSchematicRelevanceRecordAstCommand = z.infer<typeof schema>;
export function validateCurrentSchematicRelevanceRecordAstCommand(input: unknown): CurrentSchematicRelevanceRecordAstCommand {
  const value = schema.parse(captureCurrentPcbStringClockReply(input).value);
  if (value.phase === "frame" && value.params.expression !== EXPRESSIONS[value.role]) { throw new Error("SCHEMATIC_RECORD_AST_FIXED_FRAME"); }
  if (value.phase === "call") { const row = CURRENT_SCHEMATIC_RELEVANCE_RECORD_AST_CALLS.find(candidate => candidate[0] === value.role); if (row === undefined || value.params.functionDeclaration !== row[1] || value.params.arguments.length !== row[2] || value.params.returnByValue !== row[3]) { throw new Error("SCHEMATIC_RECORD_AST_FIXED_CALL"); } }
  return freezeDeep(value);
}
