/** Finite passive CM-delta recipes. The caller cannot supply a program or
 * authorize a worker continuation, timer operation or native completion. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_DELTA_PROGRAMS as DELTA } from "./current-schematic-relevance-modify-cm-delta-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_FRAMES } from "./current-schematic-relevance-modify-cm-control-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_PROGRAMS as WORKER } from "./current-schematic-relevance-modify-worker-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_DELTA_CALLS = freezeDeep([
  ["opaque", DELTA.opaque, 4, false], ["page", DELTA.page, 4, false], ["descriptors", DELTA.descriptors, 8, true], ["collections", DELTA.collections, 7, true], ["collection-snapshot", DELTA.collectionSnapshot, 4, false],
  ["novel", WORKER.novel, 2, false], ["merge", WORKER.merge, 2, false], ["parents", WORKER.parents, 2, false], ["snapshot", WORKER.snapshot, 1, false],
] as const);
/** At most four source-created objects in two waves per two opaque stages.
 * The final old-delta checks bracket the fresh full descriptor snapshot. */
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_DELTA_REQUESTS = Object.freeze({ stages: 2, prototypeWaves: 2, objects: 4, reads: 2 + 4 + 2 * (4 + 2 + 2) + 4 + 4 + 4, helpers: 1 + 2 + 2 * (2 + 1 + 1) + 4 + 2, total: 51, controls: 0 } as const);
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_DELTA_FLAGS = Object.freeze({ objectGroup: "easyeda-schematic-relevance-modify-cm-delta-v1", silent: true, generatePreview: false, throwOnSideEffect: true } as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const flags = { objectGroup: z.literal(CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_DELTA_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true) };
const argument = z.strictObject({ objectId: handle });
const call = z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.string().max(16_384), arguments: z.array(argument).max(8), returnByValue: z.boolean(), awaitPromise: z.literal(false), userGesture: z.literal(false) });
const frame = z.strictObject({ ...flags, callFrameId: handle, expression: z.literal(CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_FRAMES.onChange), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) });
const properties = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("modify-cm-delta-frame"), method: z.literal("Debugger.evaluateOnCallFrame"), params: frame }),
  z.strictObject({ phase: z.literal("modify-cm-delta-properties"), method: z.literal("Runtime.getProperties"), params: properties }),
  z.strictObject({ phase: z.literal("modify-cm-delta-call"), role: z.string().max(32), method: z.literal("Runtime.callFunctionOn"), params: call }),
]);
export type CurrentSchematicRelevanceModifyCmDeltaCommand = Readonly<z.infer<typeof schema>>;
/** Copy inert data and match the exact source-owned helper, arity and result
 * shape before a genuine owner may submit the passive request. */
export function validateCurrentSchematicRelevanceModifyCmDeltaCommand(input: unknown): CurrentSchematicRelevanceModifyCmDeltaCommand {
  const command = schema.parse(captureCurrentPcbStringClockReply(input).value);
  if (command.phase === "modify-cm-delta-call") { const row = CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_DELTA_CALLS.find(item => item[0] === command.role); if (row === undefined || command.params.functionDeclaration !== row[1] || command.params.arguments.length !== row[2] || command.params.returnByValue !== row[3]) { throw new Error("SCH_MODIFY_CM_DELTA_FIXED_CALL"); } }
  return freezeDeep(command);
}
