/** A finite passive vocabulary. No arm, resume, cancellation, callback body,
 * encoder, application method or timer can be supplied by a request. */
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_EVENT_PROGRAMS as P } from "./current-schematic-relevance-modify-echo-event-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_EVENT_SOURCE as SOURCE } from "./current-schematic-relevance-modify-echo-event-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_UI_PUBLICATION_CALLS as UI } from "./current-schematic-relevance-ui-publication-protocol.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_EVENT_FLAGS = Object.freeze({ objectGroup: "easyeda-schematic-relevance-modify-echo-event-v1", silent: true, generatePreview: false, throwOnSideEffect: true } as const);
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_EVENT_CALLS = freezeDeep([
  ...UI.filter(row => ["novel", "merge", "prototypes", "snapshot", "same-snapshot"].some(role => role === row[0])),
  ["entry", P.entry, 2, false], ["members", P.members, 6, false], ["read", P.read, 8, false], ["same-read", P.sameRead, 2, true], ["origin", P.origin, 2, false], ["expected-seed", P.expectedSeed, 2, false], ["expected", P.expected, 5, false],
  ["message", P.message, 3, false], ["row", P.row, 2, false], ["payload", P.payload, 5, true],
  ["receiver-seed", P.receiverSeed, 3, false], ["owners", P.owners, 5, false], ["roster", P.roster, 2, false], ["task", P.task, 2, false], ["branches", P.branches, 3, false], ["methods", P.methods, 4, false], ["receiver-proof", P.receiverProof, 9, true], ["branch-values", P.branchValues, 1, true],
] as const);
/** Each API has six explicit graphs, twelve prototype waves, at most384
 * correlated new metadata replies and a fixed read reserve. Publication
 * dependency reproofs remain separately bounded at24 reads +24 helpers each. */
const preparationReads = 6 * (12 * 12 + 2) + 384 + 96;
const reads = preparationReads + 2 * 24;
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_EVENT_REQUESTS = Object.freeze({ eventReads: reads, receiverReads: reads, preparationReads, publicationReproofs: 2, publicationReproofReads: 24, publicationReproofHelpers: 24, reads: reads * 2, helpers: reads * 2, total: reads * 4, graphStages: 6, prototypeWaves: 12, objects: 384, controls: 0 } as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const argument = z.strictObject({ objectId: handle });
const flags = { objectGroup: z.literal(CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_EVENT_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true) };
const properties = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const source = z.strictObject({ scriptId: handle });
const frame = z.strictObject({ ...flags, callFrameId: handle, expression: z.literal(SOURCE.frame), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) });
const call = z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.string().max(16_384), arguments: z.array(argument).max(9), returnByValue: z.boolean(), awaitPromise: z.literal(false), userGesture: z.literal(false) });
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("modify-echo-event-properties"), method: z.literal("Runtime.getProperties"), params: properties }),
  z.strictObject({ phase: z.literal("modify-echo-event-source"), method: z.literal("Debugger.getScriptSource"), params: source }),
  z.strictObject({ phase: z.literal("modify-echo-event-frame"), method: z.literal("Debugger.evaluateOnCallFrame"), params: frame }),
  z.strictObject({ phase: z.literal("modify-echo-event-call"), role: z.string().max(32), method: z.literal("Runtime.callFunctionOn"), params: call }),
]);
export type CurrentSchematicRelevanceModifyEchoEventCommand = z.infer<typeof schema>;
/** Copy descriptor-safe data before validating its exact fixed program,
 * reference count, result mode, frame expression and readonly effect flags. */
export function validateCurrentSchematicRelevanceModifyEchoEventCommand(input: unknown): CurrentSchematicRelevanceModifyEchoEventCommand {
  const command = schema.parse(captureCurrentPcbStringClockReply(input).value);
  if (command.phase === "modify-echo-event-call") { const row = CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_EVENT_CALLS.find(value => value[0] === command.role); if (row === undefined || row[1] !== command.params.functionDeclaration || row[2] !== command.params.arguments.length || row[3] !== command.params.returnByValue) { throw new Error("SCH_UI_ECHO_FIXED_CALL"); } }
  return freezeDeep(command);
}
