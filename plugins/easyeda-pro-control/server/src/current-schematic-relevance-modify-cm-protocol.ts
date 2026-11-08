/** Closed passive CM graph vocabulary. No application invocation, timer
 * cancellation, worker continuation, connection selector or resume exists. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_PROGRAMS as P } from "./current-schematic-relevance-modify-cm-programs.ts";
import type { CurrentSchematicRelevanceModifyWorkerPrepared } from "./current-schematic-relevance-modify-worker-collector.ts";
import type { CurrentSchematicRelevanceModifyBodyPrepared } from "./current-schematic-relevance-modify-body-collector.ts";
import type { CurrentSchematicRelevanceModifyEventPrepared } from "./current-schematic-relevance-modify-event-collector.ts";
import type { CurrentSchematicRelevancePublicationPayload } from "./current-schematic-relevance-publication-body-replies.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export { decodeCurrentSchematicRelevancePublicationPayload as decodeCurrentSchematicRelevanceModifyCmPayload } from "./current-schematic-relevance-publication-body-replies.ts";

export interface CurrentSchematicRelevanceModifyCmInputs {
  readonly worker: CurrentSchematicRelevanceModifyWorkerPrepared;
  readonly body: CurrentSchematicRelevanceModifyBodyPrepared;
  readonly event: CurrentSchematicRelevanceModifyEventPrepared;
  readonly payload: Readonly<CurrentSchematicRelevancePublicationPayload>;
  readonly batchFrameObjectId: string;
}
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_FLAGS = Object.freeze({ objectGroup: "easyeda-schematic-relevance-modify-cm-v1", silent: true, generatePreview: false, throwOnSideEffect: true } as const);
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CALLS = freezeDeep([
  ["batch", P.batch, 5, false], ["native-roots", P.nativeRoots, 0, false], ["native-prototypes", P.nativePrototypes, 2, false], ["native", P.native, 2, false],
  ["order", P.order, 2, false], ["state", P.state, 3, false], ["functions", P.functions, 3, false], ["references", P.references, 2, false], ["unique-sets", P.uniqueSets, 2, false],
  ["collections", P.collections, 3, false], ["map-members", P.mapMembers, 3, false], ["document-maps", P.documentMaps, 4, false], ["nodes", P.nodes, 4, false], ["node-lists", P.nodeLists, 3, false],
  ["collection-snapshot", P.collectionSnapshot, 3, false], ["collection-same", P.collectionSame, 4, true], ["selected", P.selected, 4, false], ["selected-details", P.selectedDetails, 4, false], ["delta-roots", P.deltaRoots, 5, false],
  ["before-proof", P.beforeProof, 7, true], ["branch", P.branch, 6, true], ["entry", P.entry, 6, false], ["statics", P.statics, 2, false],
  ["novel", P.novel, 2, false], ["merge", P.merge, 2, false], ["parents", P.parents, 2, false], ["snapshot", P.snapshot, 1, false], ["same", P.same, 2, true], ["reprove", P.reprove, 0, true], ["event-payload", P.eventPayload, 4, true],
] as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const reference = z.strictObject({ objectId: handle });
const flags = { objectGroup: z.literal(CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true) };
const frame = z.strictObject({ ...flags, callFrameId: handle, expression: z.enum([P.frame, "[this,s]"]), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) });
const properties = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const call = z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.string().max(16_384), arguments: z.array(reference).max(7), returnByValue: z.boolean(), awaitPromise: z.literal(false), userGesture: z.literal(false) });
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("modify-cm-frame"), role: z.enum(["entry", "caller"]), method: z.literal("Debugger.evaluateOnCallFrame"), params: frame }),
  z.strictObject({ phase: z.literal("modify-cm-properties"), method: z.literal("Runtime.getProperties"), params: properties }),
  z.strictObject({ phase: z.literal("modify-cm-call"), role: z.string().max(32), method: z.literal("Runtime.callFunctionOn"), params: call }),
]);
export type CurrentSchematicRelevanceModifyCmCommand = z.infer<typeof schema>;
/** Bind every helper byte, arity, result mode and actual frame expression to
 * its reviewed role before the original owner may submit the request. */
export function validateCurrentSchematicRelevanceModifyCmCommand(input: unknown): CurrentSchematicRelevanceModifyCmCommand {
  const command = schema.parse(captureCurrentPcbStringClockReply(input).value);
  if (command.phase === "modify-cm-call") {
    const row = CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CALLS.find(item => item[0] === command.role);
    if (row === undefined || row[1] !== command.params.functionDeclaration || row[2] !== command.params.arguments.length || row[3] !== command.params.returnByValue) { throw new Error("SCH_MODIFY_CM_FIXED_CALL"); }
  } else if (command.phase === "modify-cm-frame" && command.params.expression !== (command.role === "entry" ? P.frame : "[this,s]")) { throw new Error("SCH_MODIFY_CM_FIXED_FRAME"); }
  return freezeDeep(command);
}
const entryStages = 2, fixed = 160, objects = 256, prototypeWaves = 12, stages = 20;
// A graph wave includes four original descriptor/collection reproof pairs;
// Metadata is charged once for each newly observed object.
const beforeReads = stages * (prototypeWaves * 16 + 2) + objects + fixed;
const entryReads = entryStages * (prototypeWaves * 16 + 2) + objects + fixed;
const reads = beforeReads + entryReads;
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_REQUESTS = Object.freeze({ beforeReads, entryReads, reads, helpers: reads, total: reads * 2, stages, entryStages, prototypeWaves, objects, controls: 0 } as const);
