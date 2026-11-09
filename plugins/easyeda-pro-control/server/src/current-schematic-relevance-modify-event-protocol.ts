/** Fixed passive own7 Event vocabulary. There is no listener selection,
 * breakpoint, control, callback invocation or resume command. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_EVENT_PROGRAMS as P } from "./current-schematic-relevance-modify-event-programs.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_EVENT_FLAGS = Object.freeze({ objectGroup: "easyeda-schematic-relevance-modify-event-v1", silent: true, generatePreview: false, throwOnSideEffect: true } as const);
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_EVENT_CALLS = freezeDeep([
  ["entry", P.entry, 2, false], ["members", P.members, 6, false], ["read", P.read, 7, false], ["envelope", P.envelope, 2, false], ["message", P.message, 2, false], ["cache", P.cache, 2, false], ["row", P.row, 2, false], ["pending", P.pending, 2, false], ["payload", P.payload, 4, true], ["same-read", P.sameRead, 2, true],
  ["novel", P.novel, 2, false], ["merge", P.merge, 2, false], ["parents", P.parents, 2, false], ["snapshot", P.snapshot, 1, false], ["same", P.same, 2, true], ["native", P.native, 4, true], ["handler-same", P.handlerSame, 3, true], ["reprove", P.reprove, 0, true],
] as const);
const reads = 8 * (12 * 12 + 2) + 256 + 96;
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_EVENT_REQUESTS = Object.freeze({ reads, helpers: reads, total: reads * 2, stages: 8, prototypeWaves: 12, objects: 256, reproofReads: 16, reproofHelpers: 16, controls: 0 } as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const argument = z.strictObject({ objectId: handle });
const flags = { objectGroup: z.literal(CURRENT_SCHEMATIC_RELEVANCE_MODIFY_EVENT_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true) };
const frame = z.strictObject({ ...flags, callFrameId: handle, expression: z.literal("[this,s]"), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) });
const properties = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const call = z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.string().max(16_384), arguments: z.array(argument).max(7), returnByValue: z.boolean(), awaitPromise: z.literal(false), userGesture: z.literal(false) });
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("modify-event-frame"), method: z.literal("Debugger.evaluateOnCallFrame"), params: frame }),
  z.strictObject({ phase: z.literal("modify-event-properties"), method: z.literal("Runtime.getProperties"), params: properties }),
  z.strictObject({ phase: z.literal("modify-event-call"), role: z.string().max(32), method: z.literal("Runtime.callFunctionOn"), params: call }),
]);
export type CurrentSchematicRelevanceModifyEventCommand = z.infer<typeof schema>;
/** Validate every source string, exact argument count and side-effect flag
 * before an original owner may use this data-only request grammar. */
export function validateCurrentSchematicRelevanceModifyEventCommand(input: unknown): CurrentSchematicRelevanceModifyEventCommand {
  const command = schema.parse(captureCurrentPcbStringClockReply(input).value);
  if (command.phase === "modify-event-call") {
    const row = CURRENT_SCHEMATIC_RELEVANCE_MODIFY_EVENT_CALLS.find(value => value[0] === command.role);
    if (row === undefined || row[1] !== command.params.functionDeclaration || row[2] !== command.params.arguments.length || row[3] !== command.params.returnByValue) { throw new Error("SCH_MODIFY_EVENT_FIXED_CALL"); }
  }
  return freezeDeep(command);
}
