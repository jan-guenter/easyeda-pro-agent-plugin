/** One source-bounded partial write. The only resume row ends at the original
 * record function-call entry; no AST, monitor, publisher or Save resume exists. */
/* oxlint-disable unicorn/max-nested-calls -- Each fixed phase has its own exact strict schema rather than an open command envelope. */
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_ACTION_AFTER_RUN_PROOF as AFTER_RUN } from "./current-schematic-relevance-action-callback-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_DESCRIPTOR_HOOKS as HOOKS } from "./current-schematic-relevance-publication-globals-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_SNAPSHOT_SAME as UI_SAME } from "./current-schematic-relevance-publication-snapshot-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_PRIMITIVE_BEFORE as BEFORE, CURRENT_SCHEMATIC_RELEVANCE_PRIMITIVE_EXPRESSIONS as EXPRESSIONS, CURRENT_SCHEMATIC_RELEVANCE_PRIMITIVE_RAW_DELTA as RAW_DELTA, CURRENT_SCHEMATIC_RELEVANCE_PRIMITIVE_RECORD as RECORD, CURRENT_SCHEMATIC_RELEVANCE_PRIMITIVE_UI_DELTA as UI_DELTA } from "./current-schematic-relevance-primitive-programs.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_PRIMITIVE_REQUESTS = Object.freeze({ before: 7, resume: 1, record: 7, controls: 3, total: 18 });
export const CURRENT_SCHEMATIC_RELEVANCE_PRIMITIVE_FLAGS = Object.freeze({ objectGroup: "easyeda-pro-control-schematic-relevance-primitive-v1", silent: true, generatePreview: false, throwOnSideEffect: true } as const);
export const CURRENT_SCHEMATIC_RELEVANCE_PRIMITIVE_CALLS = freezeDeep([
  ["hooks", HOOKS, 0, true], ["before-delta", AFTER_RUN, 4, true], ["before", BEFORE, 10, false], ["ui-same", UI_SAME, 2, true], ["raw-delta", RAW_DELTA, 6, true], ["ui-delta", UI_DELTA, 4, true], ["record", RECORD, 5, true],
] as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), object = z.strictObject({ objectId: handle });
const flags = { objectGroup: z.literal(CURRENT_SCHEMATIC_RELEVANCE_PRIMITIVE_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true) };
const frame = z.strictObject({ ...flags, callFrameId: handle, expression: z.string().max(64), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) });
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("frame"), role: z.enum(["before", "record"]), method: z.literal("Debugger.evaluateOnCallFrame"), params: frame }),
  z.strictObject({ phase: z.literal("properties"), method: z.literal("Runtime.getProperties"), params: z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) }) }),
  z.strictObject({ phase: z.literal("call"), role: z.enum(CURRENT_SCHEMATIC_RELEVANCE_PRIMITIVE_CALLS.map(row => row[0])), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.string().max(16_384), arguments: z.array(object).max(10), returnByValue: z.boolean(), awaitPromise: z.literal(false), userGesture: z.literal(false) }) }),
  z.strictObject({ phase: z.literal("resume"), method: z.literal("Debugger.resume"), params: z.strictObject({}) }),
]);
export type CurrentSchematicRelevancePrimitiveCommand = z.infer<typeof schema>;
export function validateCurrentSchematicRelevancePrimitiveCommand(input: unknown): CurrentSchematicRelevancePrimitiveCommand {
  const value = schema.parse(captureCurrentPcbStringClockReply(input).value);
  if (value.phase === "frame" && value.params.expression !== EXPRESSIONS[value.role]) { throw new Error("SCHEMATIC_PRIMITIVE_FIXED_FRAME"); }
  if (value.phase === "call") { const row = CURRENT_SCHEMATIC_RELEVANCE_PRIMITIVE_CALLS.find(candidate => candidate[0] === value.role); if (row === undefined || value.params.functionDeclaration !== row[1] || value.params.arguments.length !== row[2] || value.params.returnByValue !== row[3]) { throw new Error("SCHEMATIC_PRIMITIVE_FIXED_CALL"); } }
  return freezeDeep(value);
}
