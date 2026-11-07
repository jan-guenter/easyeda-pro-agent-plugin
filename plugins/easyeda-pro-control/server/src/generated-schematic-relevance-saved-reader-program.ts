/** Separate fixed readonly scene program. The writer syntax is a reviewed
 * build input; every mutation, SDK Save binding and writer flag is removed. */
import { requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan } from "./generated-schematic-relevance-saved-readback-plan.ts";
import type { GeneratedSchematicRelevanceSavedReadbackPlan } from "./generated-schematic-relevance-saved-readback-plan.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export { GENERATED_SCHEMATIC_RELEVANCE_SAVED_READER_FUNCTION } from "./generated-schematic-relevance-saved-reader-function.ts";

/** Plain fixed arguments, issued only from the original closed preparation.
 * This data does not admit native dispatch or transfer its historical owner. */
export function generatedSchematicRelevanceSavedReaderArguments(plan: GeneratedSchematicRelevanceSavedReadbackPlan): Readonly<{
  target: Readonly<{ rawWindowsPath: string; projectUuid: string; branchUuid: string; schematicUuid: string; pageUuid: string; expectedSourceSha256: string }>;
  operation: Readonly<{ operationId: string; textId: string; body: Readonly<Record<string, unknown>>; peers: readonly Readonly<{ id: string; type: string; body: Readonly<Record<string, unknown>> }>[]; rootIds: readonly string[] }>;
}> {
  const original = requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan(plan); const target = original.data.target; const operation = original.closed.args.operation;
  return freezeDeep({ target: { rawWindowsPath: target.rawWindowsPath, projectUuid: target.projectUuid, branchUuid: target.branchUuid, schematicUuid: target.schematicUuid, pageUuid: target.pageUuid, expectedSourceSha256: target.sourceSha256 },
    operation: { operationId: operation.operationId, textId: operation.textId, body: operation.afterBody, peers: operation.peers, rootIds: operation.rootIds } });
}
