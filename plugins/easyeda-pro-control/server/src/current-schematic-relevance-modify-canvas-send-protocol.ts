/** Finite passive worker sender observations. All continuation and native
 * posting controls remain in the original, separately checked controller. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_SEND_PROGRAMS as P } from "./current-schematic-relevance-modify-canvas-send-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_SEND_FLAGS = Object.freeze({ objectGroup: "easyeda-schematic-relevance-modify-canvas-send-v1", silent: true, generatePreview: false, throwOnSideEffect: true } as const);
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_SEND_CALLS = freezeDeep([
  ["bindings", P.bindings, 8, false], ["bindings-returned", P.bindingsReturned, 8, false], ["publish", P.publish, 5, true], ["envelope", P.envelope, 2, false], ["payload", P.payload, 6, true], ["timer-delta", P.timerDelta, 3, true], ["collection-delta", P.collectionDelta, 7, true], ["loopback", P.loopback, 5, true], ["timer-frame", P.timerFrame, 4, true], ["same-frame", P.sameFrame, 2, true],
  ["novel", P.novel, 2, false], ["merge", P.merge, 2, false], ["parents", P.parents, 2, false], ["snapshot", P.snapshot, 1, false], ["same", P.same, 2, true], ["reprove", P.reprove, 0, true], ["collection-same", P.collectionSame, 4, true],
] as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const properties = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const call = z.strictObject({ objectGroup: z.literal(CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_SEND_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true), objectId: handle, functionDeclaration: z.string().max(16_384), arguments: z.array(z.strictObject({ objectId: handle })).max(8), returnByValue: z.boolean(), awaitPromise: z.literal(false), userGesture: z.literal(false) });
const schema = z.discriminatedUnion("phase", [z.strictObject({ phase: z.literal("modify-canvas-send-properties"), method: z.literal("Runtime.getProperties"), params: properties }), z.strictObject({ phase: z.literal("modify-canvas-send-call"), role: z.string().max(32), method: z.literal("Runtime.callFunctionOn"), params: call })]);
export type CurrentSchematicRelevanceModifyCanvasSendCommand = z.infer<typeof schema>;
/** Reject arbitrary recipes, result modes, arities and all effect controls. */
export function validateCurrentSchematicRelevanceModifyCanvasSendCommand(input: unknown): CurrentSchematicRelevanceModifyCanvasSendCommand {
  const command = schema.parse(captureCurrentPcbStringClockReply(input).value);
  if (command.phase === "modify-canvas-send-call") { const row = CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_SEND_CALLS.find(item => item[0] === command.role); if (row === undefined || row[1] !== command.params.functionDeclaration || row[2] !== command.params.arguments.length || row[3] !== command.params.returnByValue) { throw new Error("SCH_CANVAS_SEND_FIXED_CALL"); } }
  return freezeDeep(command);
}
const objects = 256, prototypeWaves = 12, stages = 2;
const beforeReads = 32, loopbackReads = 32, postReads = stages * (prototypeWaves * 16 + 2) + objects + 64, publishReads = 32, timerReturnReads = 32;
const reads = beforeReads + publishReads + postReads * 2 + timerReturnReads + loopbackReads * 2;
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_SEND_REQUESTS = Object.freeze({ objects, prototypeWaves, stages, beforeReads, publishReads, postReads, timerReturnReads, loopbackReads, reads, helpers: reads, controls: 0, total: reads * 2 } as const);
