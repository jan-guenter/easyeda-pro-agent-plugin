/* oxlint-disable unicorn/max-nested-calls -- Each finite phase has a complete strict Zod schema; nested constructors preserve exact unknown-field rejection. */
import { CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_GLOBALS_CAPTURE as GLOBALS,CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_DESCRIPTOR_HOOKS as HOOKS,CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_GLOBALS_MEMBERS as MEMBERS,CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_GLOBALS_SAME as SAME_GLOBALS,CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_GLOBAL_SEED as SEED } from "./current-schematic-relevance-publication-globals-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_SNAPSHOT_SAME as SAME_SNAPSHOT, CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_SNAPSHOT as SNAPSHOT } from "./current-schematic-relevance-publication-snapshot-programs.ts";
/** Fixed own-seven UI publisher reads. No program, receiver realm or resume
 * permission can be supplied by a public request. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_ACTIVE_HISTORY_MERGE as MERGE, CURRENT_SCHEMATIC_RELEVANCE_ACTIVE_HISTORY_NOVEL as NOVEL, CURRENT_SCHEMATIC_RELEVANCE_ACTIVE_HISTORY_PROTOTYPES as PROTOTYPES } from "./current-schematic-relevance-active-history-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_UI_PUBLICATION_FUNCTIONS_PROGRAM as FUNCTIONS, CURRENT_SCHEMATIC_RELEVANCE_UI_PUBLICATION_LINKS_PROGRAM as LINKS, CURRENT_SCHEMATIC_RELEVANCE_UI_PUBLICATION_NAMESPACE_EXPRESSIONS as NAMESPACE, CURRENT_SCHEMATIC_RELEVANCE_UI_PUBLICATION_PRISTINE_PROGRAM as PRISTINE, CURRENT_SCHEMATIC_RELEVANCE_UI_PUBLICATION_FUNCTIONS_SAME_PROGRAM as SAME_FUNCTIONS, CURRENT_SCHEMATIC_RELEVANCE_UI_PUBLICATION_STATE_PROGRAM as STATE } from "./current-schematic-relevance-display-ui-publication-programs.ts";

/** Eight staged graphs, each with at most twelve prototype waves and six
 * bookkeeping reads per wave; at most 384 new object metadata reads total. */
export const CURRENT_SCHEMATIC_RELEVANCE_UI_PUBLICATION_READ_BOUND = 8 * (12 * 6 + 2) + 384 + 7 + 7 + 14;
export const CURRENT_SCHEMATIC_RELEVANCE_UI_PUBLICATION_REQUESTS = Object.freeze({ reads: CURRENT_SCHEMATIC_RELEVANCE_UI_PUBLICATION_READ_BOUND, controls: 2, total: CURRENT_SCHEMATIC_RELEVANCE_UI_PUBLICATION_READ_BOUND + 2 });
export const CURRENT_SCHEMATIC_RELEVANCE_UI_PUBLICATION_GROUP = "easyeda-pro-control-schematic-relevance-ui-publication-v1";
export const CURRENT_SCHEMATIC_RELEVANCE_UI_PUBLICATION_FLAGS = Object.freeze({ objectGroup: CURRENT_SCHEMATIC_RELEVANCE_UI_PUBLICATION_GROUP, silent: true, generatePreview: false, throwOnSideEffect: true } as const);
export const CURRENT_SCHEMATIC_RELEVANCE_UI_PUBLICATION_CALLS = freezeDeep([
  ["descriptor-hooks", HOOKS, 0, true], ["links", LINKS, 1, false], ["functions", FUNCTIONS, 3, false], ["same-functions", SAME_FUNCTIONS, 2, true], ["state", STATE, 5, false], ["pristine", PRISTINE, 5, false],
  ["novel", NOVEL, 2, false], ["merge", MERGE, 2, false], ["prototypes", PROTOTYPES, 1, false],
  ["snapshot", SNAPSHOT, 1, false], ["same-snapshot", SAME_SNAPSHOT, 2, true], ["seed", SEED, 0, false], ["globals", GLOBALS, 2, false], ["global-members", MEMBERS, 2, false], ["same-globals", SAME_GLOBALS, 4, true],
] as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const flags = { objectGroup: z.literal(CURRENT_SCHEMATIC_RELEVANCE_UI_PUBLICATION_GROUP), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true) };
const object = z.strictObject({ objectId: handle });
const frameParams = z.strictObject({ ...flags, callFrameId: handle, expression: z.string().max(64), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) });
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("global"), method: z.literal("Runtime.evaluate"), params: z.strictObject({ ...flags, expression: z.literal("this"), uniqueContextId: handle, returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false), awaitPromise: z.literal(false), userGesture: z.literal(false) }) }),
  z.strictObject({ phase: z.literal("namespace"), variant: z.union([z.literal(0), z.literal(1)]), method: z.literal("Debugger.evaluateOnCallFrame"), params: frameParams }),
  z.strictObject({ phase: z.literal("properties"), method: z.literal("Runtime.getProperties"), params: z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) }) }),
  z.strictObject({ phase: z.literal("source"), method: z.literal("Debugger.getScriptSource"), params: z.strictObject({ scriptId: handle }) }),
  z.strictObject({ phase: z.literal("call"), role: z.enum(CURRENT_SCHEMATIC_RELEVANCE_UI_PUBLICATION_CALLS.map(row => row[0])), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.string().max(16_384), arguments: z.array(object).max(8), returnByValue: z.boolean(), awaitPromise: z.literal(false), userGesture: z.literal(false) }) }),
]);
export type CurrentSchematicRelevanceUiPublicationCommand = z.infer<typeof schema>;
export function validateCurrentSchematicRelevanceUiPublicationCommand(input: unknown): CurrentSchematicRelevanceUiPublicationCommand {
  const command = schema.parse(captureCurrentPcbStringClockReply(input).value);
  if (command.phase === "namespace" && command.params.expression !== NAMESPACE[command.variant]) { throw new Error("SCHEMATIC_UI_PUBLICATION_FIXED_FRAME"); }
  if (command.phase === "call") { const row = CURRENT_SCHEMATIC_RELEVANCE_UI_PUBLICATION_CALLS.find(value => value[0] === command.role); if (row === undefined || command.params.functionDeclaration !== row[1] || command.params.arguments.length !== row[2] || command.params.returnByValue !== row[3]) { throw new Error("SCHEMATIC_UI_PUBLICATION_FIXED_CALL"); } }
  return freezeDeep(command);
}
