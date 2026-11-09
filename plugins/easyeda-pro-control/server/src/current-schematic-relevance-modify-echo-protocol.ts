/* oxlint-disable unicorn/max-nested-calls -- Closed strict Inspector schemas retain all readonly flags. */
/** No event, breakpoint, arm, continuation, sender or app invocation exists. */
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_PROGRAMS as P } from "./current-schematic-relevance-modify-echo-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_UI_PUBLICATION_CALLS as UI } from "./current-schematic-relevance-ui-publication-protocol.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_FLAGS = Object.freeze({ objectGroup: "easyeda-pro-control-schematic-modify-echo-v1", silent: true, generatePreview: false, throwOnSideEffect: true } as const);
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_CALLS = freezeDeep([
  ...UI.filter(row => ["novel", "merge", "prototypes", "snapshot", "same-snapshot"].some(role => role === row[0])),
  ["seed", P.seed, 1, false], ["onmessage", P.onmessage, 1, false], ["constructors", P.constructors, 2, false], ["event-prototypes", P.prototypes, 2, false], ["members", P.members, 2, false], ["native", P.native, 5, true],
  ["handler", P.handler, 4, false], ["handler-same", P.handlerSame, 5, true], ["onMessage", P.onMessage, 4, false],
] as const);
/** Seven added graphs, twelve prototype waves, at most384 metadata reads,
 * native function qualification, final seal, and two separately bounded
 * publication dependency reproofs. Each read has its own helper response. */
const preparationReads = 7 * (12 * 12 + 2) + 384 + 48;
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_REQUESTS = Object.freeze({ preparationReads, publicationReproofs: 2, publicationReproofReads: 24, publicationReproofHelpers: 24, reads: preparationReads + 48, helpers: preparationReads + 48, total: (preparationReads + 48) * 2, graphStages: 7, prototypeWaves: 12, objects: 384, controls: 0 } as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const arg = z.strictObject({ objectId: handle });
const flags = { objectGroup: z.literal(CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true) };
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("modify-echo-properties"), method: z.literal("Runtime.getProperties"), params: z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) }) }),
  z.strictObject({ phase: z.literal("modify-echo-source"), method: z.literal("Debugger.getScriptSource"), params: z.strictObject({ scriptId: handle }) }),
  z.strictObject({ phase: z.literal("modify-echo-call"), role: z.string().max(64), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.string().max(16_384), arguments: z.array(arg).max(5), returnByValue: z.boolean(), awaitPromise: z.literal(false), userGesture: z.literal(false) }) }),
]);
export type CurrentSchematicRelevanceModifyEchoCommand = z.infer<typeof schema>;
export function validateCurrentSchematicRelevanceModifyEchoCommand(input: unknown): CurrentSchematicRelevanceModifyEchoCommand {
  const command = schema.parse(captureCurrentPcbStringClockReply(input).value);
  if (command.phase === "modify-echo-call") { const row = CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_CALLS.find(value => value[0] === command.role); if (row === undefined || row[1] !== command.params.functionDeclaration || row[2] !== command.params.arguments.length || row[3] !== command.params.returnByValue) { throw new Error("SCH_MODIFY_ECHO_FIXED_CALL"); } }
  return freezeDeep(command);
}
