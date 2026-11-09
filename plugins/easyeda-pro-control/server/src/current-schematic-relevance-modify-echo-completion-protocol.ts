/** Passive exact-entry and one-deletion observations. Controls, native sender
 * custody, Event delivery and SDK release remain in the original owner. */
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_COMPLETION_PROGRAMS as P } from "./current-schematic-relevance-modify-echo-completion-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_UI_PUBLICATION_CALLS as RAW } from "./current-schematic-relevance-ui-publication-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_CONTROL_REQUESTS as PUBLICATION } from "./current-schematic-relevance-publication-control-protocol.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_COMPLETION_FLAGS = Object.freeze({ objectGroup: "easyeda-schematic-relevance-modify-echo-completion-v1", silent: true, generatePreview: false, throwOnSideEffect: true } as const);
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_COMPLETION_CALLS = freezeDeep([
  ...RAW.filter(row => ["novel", "merge", "prototypes", "snapshot", "same-snapshot"].some(role => row[0] === role)),
  ["seed", P.seed, 2, false], ["bucket", P.bucket, 4, false], ["pending", P.pending, 4, false], ["methods", P.methods, 2, false], ["before", P.before, 8, true],
  ["function-same", P.functionSame, 2, true], ["handler", P.handler, 2, true], ["task", P.task, 6, true], ["callback", P.callback, 5, true], ["push", P.push, 5, true], ["publish", P.publish, 5, true], ["remote", P.remote, 5, true], ["deletion", P.deletion, 6, true], ["promise-retain", P.retainPromise, 0, false], ["promise", P.promise, 3, true], ["iterator", P.iterator, 4, true],
] as const);
const before = 4 * (12 * 12 + 2) + 384 + 160 + 2 * PUBLICATION.perStage;
const perStep = 2 * PUBLICATION.perStage + 40;
const steps = 12;
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_COMPLETION_REQUESTS = Object.freeze({ before, perStep, steps, reads: before + steps * perStep, helpers: before + steps * perStep, total: 2 * (before + steps * perStep), graphStages: 4, waves: 12, objects: 384, controls: 0 } as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const arg = z.strictObject({ objectId: handle });
const flags = { objectGroup: z.literal(CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_COMPLETION_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true) };
const properties = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const source = z.strictObject({ scriptId: handle });
const call = z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.string().max(16_384), arguments: z.array(arg).max(8), returnByValue: z.boolean(), awaitPromise: z.literal(false), userGesture: z.literal(false) });
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("modify-echo-completion-properties"), method: z.literal("Runtime.getProperties"), params: properties }),
  z.strictObject({ phase: z.literal("modify-echo-completion-source"), method: z.literal("Debugger.getScriptSource"), params: source }),
  z.strictObject({ phase: z.literal("modify-echo-completion-call"), role: z.string().max(32), method: z.literal("Runtime.callFunctionOn"), params: call }),
]);
export type CurrentSchematicRelevanceModifyEchoCompletionCommand = Readonly<z.infer<typeof schema>>;
/** Copy descriptor-safe command data and reject any changed program, arity,
 * result mode or effect flag before a native ledger can encode it. */
export function validateCurrentSchematicRelevanceModifyEchoCompletionCommand(input: unknown): CurrentSchematicRelevanceModifyEchoCompletionCommand {
  const command = schema.parse(captureCurrentPcbStringClockReply(input).value);
  if (command.phase === "modify-echo-completion-call") { const row = CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_COMPLETION_CALLS.find(value => value[0] === command.role); if (row === undefined || row[1] !== command.params.functionDeclaration || row[2] !== command.params.arguments.length || row[3] !== command.params.returnByValue) { throw new Error("SCH_ECHO_COMPLETION_FIXED_CALL"); } }
  return freezeDeep(command);
}
