/* oxlint-disable unicorn/max-nested-calls -- Each closed Inspector phase has a strict complete schema. */
/** Read-only finite vocabulary. There is no arm, resume, sender or app call. */
import { z } from "zod";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_NATIVE_PROGRAMS as P } from "./current-schematic-relevance-publication-native-programs.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_UI_PUBLICATION_CALLS as UI } from "./current-schematic-relevance-ui-publication-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_SDK_GATE_CALLS as SDK } from "./current-schematic-relevance-sdk-gate-protocol.ts";
import { CURRENT_NATIVE_SERIALIZED_ORIGIN_PROGRAMS as ORIGIN } from "./current-native-serialized-origin.ts";

export const CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_NATIVE_FLAGS = Object.freeze({ objectGroup: "easyeda-pro-control-schematic-publication-native-v1", silent: true, generatePreview: false, throwOnSideEffect: true } as const);
export const CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_NATIVE_CALLS = freezeDeep([
  ...UI.filter(row => ["novel", "merge", "prototypes", "snapshot", "same-snapshot", "functions", "same-functions", "same-globals"].some(role => role === row[0])),
  ...SDK.filter(row => ["hooks", "reflection-reprove", "native-defaultInstance", "native-hooks"].some(role => role === row[0])),
  ["roots", P.roots, 4, false], ["methods", P.methods, 2, false], ["dependencies", P.dependencies, 3, false], ["subscriptions", P.subscriptions, 2, true], ["stores", P.stores, 2, false], ["records", P.records, 2, false], ["tuple-same", P.same, 2, true],
  ["native-roots", P.nativeRoots, 7, false], ["native-functions", P.nativeFunctions, 3, false], ["native-proof", P.nativeProof, 5, true],
  ["origin-begin", ORIGIN.begin, 0, false], ["origin-step", ORIGIN.step, 2, false], ["origin-append", ORIGIN.append, 2, false], ["origin-read", ORIGIN.read, 2, true],
] as const);
/** At most thirty-two graph stages, twelve prototype waves each, 384 new
 * objects total, twelve complete record waves and eight origin owners. Each
 * counted request is paired with one helper reply by the enclosing owner.
 * Each prototype wave reserves twelve bookkeeping requests in addition to
 * the separately capped correlated object-metadata reads. */
const reads = 32 * (12 * 12 + 2) + 384 + 384 + 12 * 6 + 8 * 10 + 160;
export const CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_NATIVE_REQUESTS = Object.freeze({ reads, helpers: reads, total: reads * 2, reproofReads: 24, reproofHelpers: 24, graphStages: 32, prototypeWaves: 12, recordWaves: 12, objects: 384, originOwners: 8, controls: 0 } as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const arg = z.strictObject({ objectId: handle });
const flags = { objectGroup: z.literal(CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_NATIVE_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true) };
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("publication-native-properties"), method: z.literal("Runtime.getProperties"), params: z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) }) }),
  z.strictObject({ phase: z.literal("publication-native-source"), method: z.literal("Debugger.getScriptSource"), params: z.strictObject({ scriptId: handle }) }),
  z.strictObject({ phase: z.literal("publication-native-frame"), method: z.literal("Debugger.evaluateOnCallFrame"), params: z.strictObject({ ...flags, callFrameId: handle, expression: z.literal("[this]"), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) }) }),
  z.strictObject({ phase: z.literal("publication-native-call"), role: z.string().max(64), method: z.literal("Runtime.callFunctionOn"), params: z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.string().max(16_384), arguments: z.array(arg).max(7), returnByValue: z.boolean(), awaitPromise: z.literal(false), userGesture: z.literal(false) }) }),
]);
export type CurrentSchematicRelevancePublicationNativeCommand = z.infer<typeof schema>;
/** Copy the bounded reply-safe input, then enforce the exact proof program,
 * reference count, result mode and readonly flags for its closed role.
 * Freeze accepted data without granting native dispatch or application work. */
export function validateCurrentSchematicRelevancePublicationNativeCommand(input: unknown): CurrentSchematicRelevancePublicationNativeCommand {
  const command = schema.parse(captureCurrentPcbStringClockReply(input).value);
  if (command.phase === "publication-native-call") { const row = CURRENT_SCHEMATIC_RELEVANCE_PUBLICATION_NATIVE_CALLS.find(value => value[0] === command.role); if (row === undefined || row[1] !== command.params.functionDeclaration || row[2] !== command.params.arguments.length || row[3] !== command.params.returnByValue) { throw new Error("SCH_PUBLICATION_NATIVE_FIXED_CALL"); } }
  return freezeDeep(command);
}
