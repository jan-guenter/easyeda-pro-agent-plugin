/** Complete Wire stage/data relations. Parsing these packets establishes no
 * original invocation, pending-node, Main, callback or durable provenance. */
import { z } from "zod";
import { canonicalJson, sha256Text } from "./core.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { generatedSchematicWireEditStageResultSchema } from "./generated-schematic-wire-edit-program.ts";
import { generatedSchematicWireLifecycleStageResultSchema } from "./generated-schematic-wire-lifecycle-program.ts";
import type { GeneratedSchematicWireEditNativeArguments } from "./generated-schematic-wire-edit.ts";
import { compareGeneratedSchematicWireEditEffect, compareGeneratedSchematicWireSourceData } from "./generated-schematic-wire-edit-effect.ts";

export type GeneratedSchematicWireEditStageResult = z.infer<typeof generatedSchematicWireEditStageResultSchema>;
type Stage = GeneratedSchematicWireEditStageResult | z.infer<typeof generatedSchematicWireLifecycleStageResultSchema>;
const schema = z.union([generatedSchematicWireEditStageResultSchema, generatedSchematicWireLifecycleStageResultSchema]);
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`SCH209_WIRE_LIFECYCLE_EFFECT_${code}`); } }
function packet(value: unknown, stage: "preflight" | "modify" | "observe"): Stage {
  const result = schema.parse(value);
  need(result.stage === stage && result.ok && result.originalContextIntact && result.source !== null && !result.saveAttempted &&
    (stage === "preflight" ? !result.modifyAttempted && !result.dispatchAttempted && !result.originalPromiseSettled : result.modifyAttempted && result.modifyAcknowledged) &&
    (stage !== "modify" || result.dispatchAttempted && result.originalPromiseSettled) &&
    (stage !== "observe" || !result.dispatchAttempted && !result.originalPromiseSettled), "STAGE_STATE"); return result;
}
export function compareGeneratedSchematicWireLifecycleEffect(args: GeneratedSchematicWireEditNativeArguments, beforeInput: unknown, modifiedInput: unknown, observedInput: unknown): Readonly<{
  schema: "private.generated-schematic-wire-lifecycle-effect.v2";
  operationId: string; documentUuid: string; wireId: string; lineId: string; windowTabId: string;
  projection: ReturnType<typeof compareGeneratedSchematicWireEditEffect>;
  rootIndices: readonly Readonly<{ id: string; zIndex: number }>[];
  originalNativeStagesJoined: false; originalCallbackCompletionVerified: false; originalWorkerCompletionVerified: false;
  originalStructureCompletionVerified: false; selectedSqlAuthorized: false; persistenceVerified: false; inverseAvailable: false;
}> {
  const before = packet(beforeInput, "preflight"), modified = packet(modifiedInput, "modify"), observed = packet(observedInput, "observe");
  need(before.schema === modified.schema && before.schema === observed.schema && before.windowTabId === modified.windowTabId && before.windowTabId === observed.windowTabId, "ORIGINAL_GENERATION");
  need(before.source !== null && modified.source !== null && observed.source !== null, "SOURCE");
  const projection = compareGeneratedSchematicWireEditEffect(args, before.source, modified.source, observed.source);
  const roots = compareGeneratedSchematicWireSourceData(args, observed.source, args.operation.afterBody).roots;
  return freezeDeep({ schema: "private.generated-schematic-wire-lifecycle-effect.v2", operationId: args.operation.operationId, documentUuid: args.target.pageUuid,
    wireId: args.operation.wireId, lineId: args.operation.lineId, windowTabId: before.windowTabId, projection, rootIndices: roots,
    originalNativeStagesJoined: false, originalCallbackCompletionVerified: false, originalWorkerCompletionVerified: false,
    originalStructureCompletionVerified: false, selectedSqlAuthorized: false, persistenceVerified: false, inverseAvailable: false });
}
export type GeneratedSchematicWireLifecycleProjectedEffect = ReturnType<typeof compareGeneratedSchematicWireLifecycleEffect>;

/** A Save acknowledgement has its own v2 grammar. Its complete current scene
 * must match the effect's roots; native Save and SQL provenance stay separate. */
export function compareGeneratedSchematicWireSaveStage(args: GeneratedSchematicWireEditNativeArguments, effect: GeneratedSchematicWireLifecycleProjectedEffect, input: unknown): Readonly<{
  schema: "private.generated-schematic-wire-save-stage-data.v2"; operationId: string; documentUuid: string; wireId: string; lineId: string;
  sourceSha256: string; originalSaveInvocationVerified: false; selectedSqlAuthorized: false; persistenceVerified: false;
}> {
  const saved = generatedSchematicWireLifecycleStageResultSchema.parse(input);
  need(saved.stage === "save" && saved.ok && saved.originalContextIntact && saved.dispatchAttempted && saved.originalPromiseSettled && saved.modifyAttempted && saved.modifyAcknowledged &&
    saved.saveAttempted && saved.saveAcknowledged && saved.savePromiseSettled && saved.source !== null && saved.windowTabId === effect.windowTabId &&
    effect.operationId === args.operation.operationId && effect.documentUuid === args.target.pageUuid && effect.lineId === args.operation.lineId && effect.wireId === args.operation.wireId, "SAVE_STATE");
  need(saved.source !== null && canonicalJson(compareGeneratedSchematicWireSourceData(args, saved.source, args.operation.afterBody).roots) === canonicalJson(effect.rootIndices), "SAVE_ROOTS");
  return freezeDeep({ schema: "private.generated-schematic-wire-save-stage-data.v2", operationId: args.operation.operationId, documentUuid: args.target.pageUuid,
    wireId: args.operation.wireId, lineId: args.operation.lineId, sourceSha256: sha256Text(saved.source), originalSaveInvocationVerified: false, selectedSqlAuthorized: false, persistenceVerified: false });
}

/** Fresh source data has no writer flags or old window ID. The new reader's
 * original cold load and final complete SQL comparison remain mandatory. */
export function compareGeneratedSchematicWireSavedSourceData(args: GeneratedSchematicWireEditNativeArguments, source: string): Readonly<{
  schema: "private.generated-schematic-wire-saved-source-data.v1"; operationId: string; projectUuid: string; branchUuid: string; schematicUuid: string; pageUuid: string;
  wireId: string; lineId: string; sourceSha256: string; rootIndices: readonly Readonly<{ id: string; zIndex: number }>[];
  exactLineGeometryVerified: true; completePeerBodyRosterPreserved: true; explicitRelevanceAttributePreserved: true;
  originalReaderVerified: false; coldLoadVerified: false; persistenceVerified: false; reopenedVerified: false; executionAuthorized: false;
}> {
  const native = compareGeneratedSchematicWireSourceData(args, source, args.operation.afterBody);
  return freezeDeep({ schema: "private.generated-schematic-wire-saved-source-data.v1", operationId: args.operation.operationId,
    projectUuid: args.target.projectUuid, branchUuid: args.target.branchUuid, schematicUuid: args.target.schematicUuid, pageUuid: args.target.pageUuid,
    wireId: args.operation.wireId, lineId: args.operation.lineId, sourceSha256: sha256Text(source), rootIndices: native.roots,
    exactLineGeometryVerified: true, completePeerBodyRosterPreserved: true, explicitRelevanceAttributePreserved: true,
    originalReaderVerified: false, coldLoadVerified: false, persistenceVerified: false, reopenedVerified: false, executionAuthorized: false });
}
