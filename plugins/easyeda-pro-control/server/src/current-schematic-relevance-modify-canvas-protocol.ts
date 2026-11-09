/** A fixed passive canvas vocabulary. The host owns original pauses; no
 * timer registration, callback invocation, continuation or sender is issued. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_PROGRAMS as P } from "./current-schematic-relevance-modify-canvas-programs.ts";
import type { CurrentSchematicRelevanceModifyWorkerPrepared } from "./current-schematic-relevance-modify-worker-collector.ts";
import type { CurrentSchematicRelevanceModifyBodyPrepared } from "./current-schematic-relevance-modify-body-collector.ts";
import type { CurrentSchematicRelevanceModifyCmBefore, CurrentSchematicRelevanceModifyCmEntry } from "./current-schematic-relevance-modify-cm-collector.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export interface CurrentSchematicRelevanceModifyCanvasInputs {
  readonly worker: CurrentSchematicRelevanceModifyWorkerPrepared;
  readonly body: CurrentSchematicRelevanceModifyBodyPrepared;
  readonly cmBefore: CurrentSchematicRelevanceModifyCmBefore;
  readonly cmEntry: CurrentSchematicRelevanceModifyCmEntry;
  /** Original Core supplies these exact post-CM data handles; their shape
   * alone confers no completion or same-owner provenance. */
  readonly cmDelta: Readonly<{ frameObjectId: string; qualifiedObjectId: string; snapshotObjectId: string; collectionsObjectId: string; collectionSnapshotObjectId: string }>;
}
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_FLAGS = Object.freeze({ objectGroup: "easyeda-schematic-relevance-modify-canvas-v1", silent: true, generatePreview: false, throwOnSideEffect: true } as const);
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_FRAMES = Object.freeze({ enums: "[ve,De]", entry: "[this,s,r,i,n,a,o,c,l,u,h,p]", dataChange: "[this,s,r,i,n,a,o,c,l,u,h,p]", caller: "[this,s,r,i,n,a,o,c,l,u,h,p]", constructed: "[this,m,f]", executor: "[g]", onChangeCaller: "[this,n,a,o,c,l,u,h,p,d,m,f,g,y]" } as const);
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_CALLS = freezeDeep([
  ["enums", P.enums, 4, true], ["roots", P.roots, 6, false], ["selected", P.selected, 4, false], ["complete", P.complete, 3, false], ["functions", P.functions, 2, false],
  ["native-roots", P.nativeRoots, 0, false], ["native-prototype", P.nativePrototype, 2, false], ["native-parts", P.nativeParts, 6, false], ["map-iterator", P.mapIterator, 4, false], ["iterator-parents", P.iteratorParents, 3, false], ["iterator-functions", P.iteratorFunctions, 3, false],
  ["data-entry", P.dataEntry, 6, true], ["proof", P.proof, 8, true], ["branch", P.branch, 5, true], ["entry", P.entry, 6, true], ["ticket-delta", P.ticketDelta, 4, true], ["dependencies", P.dependencies, 7, false],
  ["executor", P.executor, 6, false], ["executor-proof", P.executorProof, 6, true], ["registration-delta", P.registrationDelta, 3, false], ["registered-collections", P.registeredCollections, 7, true], ["returned", P.returned, 3, true], ["constructed-after-executor", P.constructedAfterExecutor, 6, false], ["constructed", P.constructed, 6, false], ["cache-row", P.cacheRow, 2, false], ["constructed-proof", P.constructedProof, 6, true], ["cache-delta", P.cacheDelta, 7, true],
  ["novel", P.novel, 2, false], ["merge", P.merge, 2, false], ["parents", P.parents, 2, false], ["snapshot", P.snapshot, 1, false], ["same", P.same, 2, true], ["reprove", P.reprove, 0, true], ["collection-same", P.collectionSame, 4, true], ["collection-snapshot", P.collectionSnapshot, 3, false],
] as const);
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const flags = { objectGroup: z.literal(CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_FLAGS.objectGroup), silent: z.literal(true), generatePreview: z.literal(false), throwOnSideEffect: z.literal(true) };
const reference = z.strictObject({ objectId: handle });
const frame = z.strictObject({ ...flags, callFrameId: handle, expression: z.string().max(256), returnByValue: z.literal(false), includeCommandLineAPI: z.literal(false) });
const properties = z.strictObject({ objectId: handle, ownProperties: z.literal(true), accessorPropertiesOnly: z.literal(false), generatePreview: z.literal(false) });
const call = z.strictObject({ ...flags, objectId: handle, functionDeclaration: z.string().max(16_384), arguments: z.array(reference).max(8), returnByValue: z.boolean(), awaitPromise: z.literal(false), userGesture: z.literal(false) });
const schema = z.discriminatedUnion("phase", [
  z.strictObject({ phase: z.literal("modify-canvas-frame"), role: z.enum(["enums", "entry", "dataChange", "caller", "constructed", "executor", "onChangeCaller"]), method: z.literal("Debugger.evaluateOnCallFrame"), params: frame }),
  z.strictObject({ phase: z.literal("modify-canvas-properties"), method: z.literal("Runtime.getProperties"), params: properties }),
  z.strictObject({ phase: z.literal("modify-canvas-call"), role: z.string().max(32), method: z.literal("Runtime.callFunctionOn"), params: call }),
]);
export type CurrentSchematicRelevanceModifyCanvasCommand = z.infer<typeof schema>;
/** Match the exact reviewed row, frame expression and result mode. Caller
 * data cannot substitute source text, control commands or side-effect flags. */
export function validateCurrentSchematicRelevanceModifyCanvasCommand(input: unknown): CurrentSchematicRelevanceModifyCanvasCommand {
  const command = schema.parse(captureCurrentPcbStringClockReply(input).value);
  if (command.phase === "modify-canvas-frame" && command.params.expression !== CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_FRAMES[command.role]) { throw new Error("SCH_CANVAS_FIXED_FRAME"); }
  if (command.phase === "modify-canvas-call") { const row = CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_CALLS.find(item => item[0] === command.role); if (row === undefined || row[1] !== command.params.functionDeclaration || row[2] !== command.params.arguments.length || row[3] !== command.params.returnByValue) { throw new Error("SCH_CANVAS_FIXED_CALL"); } }
  return freezeDeep(command);
}
const objects = 256, prototypeWaves = 12, stages = 16;
const beforeReads = stages * (prototypeWaves * 16 + 2) + objects + 192;
const dataChangeReads = 24, entryReads = 64;
const constructedReads = 2 * (prototypeWaves * 16 + 2) + objects + 96;
const executorReads = constructedReads + 16, registeredReads = 48, returnedReads = 24;
const reads = beforeReads + dataChangeReads + entryReads + executorReads + constructedReads + registeredReads + returnedReads;
export const CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_REQUESTS = Object.freeze({ reads, helpers: reads, total: reads * 2, beforeReads, dataChangeReads, entryReads, executorReads, constructedReads, registeredReads, returnedReads, stages, objects, prototypeWaves, controls: 0 } as const);
