/** Complete seven-row comparison, with no native registry or authority. */
import { canonicalJson, sha256Text } from "./core.ts";
import { parseNativeRecords } from "./native-history.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { generatedSchematicRelevanceDisplayStageResultSchema } from "./generated-schematic-relevance-display.ts";
import type { GeneratedSchematicRelevanceDisplayStageResult } from "./generated-schematic-relevance-display.ts";
import type { GeneratedSchematicRelevanceDisplayNativeArguments } from "./generated-schematic-relevance-display-source.ts";

export interface GeneratedSchematicRelevanceDisplayProjectedEffect {
  readonly schema: "private.generated-schematic-relevance-display-effect.v1";
  readonly operationId: string; readonly documentUuid: string; readonly textId: string; readonly windowTabId: string;
  readonly beforeSourceSha256: string; readonly modifiedSourceSha256: string; readonly observedSourceSha256: string;
  readonly rootIndices: readonly Readonly<{ id: string; zIndex: number }>[];
  readonly normalizedBaseline: "already-normalized-native-capture";
  readonly rootIndexNormalizationIsInMemoryBookkeeping: true; readonly exactProjectedTextBodyVerified: true;
  readonly completePeerBodyRosterPreserved: true; readonly explicitRelevanceAttributePreserved: true;
  readonly originalNativeStageProvenanceVerified: false; readonly workerClockProvenanceVerified: false;
  readonly connectivityVerified: false; readonly selectedSqlAuthorized: false; readonly persistenceVerified: false; readonly inverseAvailable: false;
}
function need(value: boolean, reason: string): asserts value { if (!value) { throw new Error(`SCH209_RELEVANCE_DISPLAY_EFFECT_${reason}`); } }
function stagePacket(input: unknown, stage: "preflight" | "modify" | "observe"): GeneratedSchematicRelevanceDisplayStageResult {
  const result = generatedSchematicRelevanceDisplayStageResultSchema.parse(input);
  need(result.stage === stage && result.ok && result.originalContextIntact && result.source !== null &&
    (stage === "preflight" ? !result.modifyAttempted && !result.saveAttempted : result.modifyAttempted && result.modifyAcknowledged && !result.saveAttempted), "ORIGINAL_STAGE_STATE"); return result;
}
function source(result: Pick<GeneratedSchematicRelevanceDisplayStageResult, "source">, args: GeneratedSchematicRelevanceDisplayNativeArguments,
  expectedText: Readonly<Record<string, unknown>>): readonly Readonly<{ id: string; zIndex: number }>[] {
  need(result.source !== null && result.source.isWellFormed() && Buffer.byteLength(result.source) <= 16_384, "SOURCE_BOUND");
  const [head, ...rows] = parseNativeRecords(result.source), { target, operation } = args;
  need(head?.header["type"] === "DOCHEAD" && head.body?.["docType"] === "SCH_PAGE" && head.body["uuid"] === target.pageUuid && rows.length === 7, "SOURCE_DOCUMENT");
  const ids = new Set<string>(); const roots: { id: string; zIndex: number }[] = []; const peers: { id: string; type: string; body: unknown }[] = []; let textCount = 0;
  for (const row of rows) {
    const id = row.header["id"], type = row.header["type"]; need(typeof id === "string" && typeof type === "string" && !ids.has(id) && row.body !== null, "COMPLETE_RECORD_ROSTER"); ids.add(id);
    let projectedBody = row.body;
    if (operation.rootIds.includes(id)) {
      const { zIndex, ...body } = row.body; need(typeof zIndex === "number" && Number.isSafeInteger(zIndex) && zIndex >= 0 && zIndex <= 2 && !Object.is(zIndex, -0), "ROOT_INDEX");
      roots.push({ id, zIndex }); projectedBody = body;
    }
    if (id === operation.textId) { need(type === "TEXT" && canonicalJson(projectedBody) === canonicalJson(expectedText), "EXACT_LITERAL_TEXT_BODY"); textCount += 1; }
    else { peers.push({ id, type, body: projectedBody }); }
  }
  need(textCount === 1 && roots.length === 3 && new Set(roots.map(row => row.zIndex)).size === 3 && canonicalJson(roots.map(row => row.id).toSorted()) === canonicalJson(operation.rootIds), "ROOT_PERMUTATION");
  need(canonicalJson(peers.toSorted((left, right) => left.id.localeCompare(right.id))) === canonicalJson(operation.peers), "COMPLETE_PEER_BODY_ROSTER");
  return roots.toSorted((left, right) => left.id.localeCompare(right.id));
}
export function compareGeneratedSchematicRelevanceDisplayEffect(args: GeneratedSchematicRelevanceDisplayNativeArguments, beforeInput: unknown, modifiedInput: unknown, observedInput: unknown): GeneratedSchematicRelevanceDisplayProjectedEffect {
  const before = stagePacket(beforeInput, "preflight"), modified = stagePacket(modifiedInput, "modify"), observed = stagePacket(observedInput, "observe");
  need(before.windowTabId === modified.windowTabId && before.windowTabId === observed.windowTabId, "ORIGINAL_WINDOW_CHANGED");
  const roots = source(before, args, args.operation.beforeBody);
  need(canonicalJson(source(modified, args, args.operation.afterBody)) === canonicalJson(roots) && canonicalJson(source(observed, args, args.operation.afterBody)) === canonicalJson(roots), "ROOT_INDEX_CHANGED");
  need(before.source !== null && modified.source !== null && observed.source !== null, "COMPLETE_SOURCES");
  return freezeDeep({ schema: "private.generated-schematic-relevance-display-effect.v1", operationId: args.operation.operationId,
    documentUuid: args.target.pageUuid, textId: args.operation.textId, windowTabId: before.windowTabId,
    beforeSourceSha256: sha256Text(before.source), modifiedSourceSha256: sha256Text(modified.source), observedSourceSha256: sha256Text(observed.source), rootIndices: roots,
    normalizedBaseline: "already-normalized-native-capture", rootIndexNormalizationIsInMemoryBookkeeping: true,
    exactProjectedTextBodyVerified: true, completePeerBodyRosterPreserved: true, explicitRelevanceAttributePreserved: true,
    originalNativeStageProvenanceVerified: false, workerClockProvenanceVerified: false, connectivityVerified: false, selectedSqlAuthorized: false, persistenceVerified: false, inverseAvailable: false });
}

/** SDK Save acknowledgement and complete live source relation only. This
 * check neither establishes durable SQL nor reconstructs native provenance. */
export function assertGeneratedSchematicRelevanceDisplaySaveStage(args: GeneratedSchematicRelevanceDisplayNativeArguments,
  effect: GeneratedSchematicRelevanceDisplayProjectedEffect, input: unknown): void {
  const packet = generatedSchematicRelevanceDisplayStageResultSchema.parse(input);
  need(packet.stage === "save" && packet.ok && packet.originalContextIntact && packet.dispatchAttempted && packet.originalPromiseSettled &&
    packet.modifyAttempted && packet.modifyAcknowledged && packet.saveAttempted && packet.saveAcknowledged && packet.savePromiseSettled && packet.windowTabId === effect.windowTabId &&
    effect.operationId === args.operation.operationId && effect.documentUuid === args.target.pageUuid && effect.textId === args.operation.textId, "ORIGINAL_SAVE_STAGE_STATE");
  need(canonicalJson(source(packet, args, args.operation.afterBody)) === canonicalJson(effect.rootIndices), "SAVE_ROOT_INDEX_CHANGED");
}

/** Readonly comparison for a fresh reader. It deliberately accepts source data
 * without fabricating that new reader's Modify/Save flags or old window ID.
 * The actual closed checkpoint, cold-load origin and reader remain separate. */
export function compareGeneratedSchematicRelevanceSavedSourceData(args: GeneratedSchematicRelevanceDisplayNativeArguments, nativeSource: string): Readonly<{
  schema: "private.generated-schematic-relevance-saved-source-data.v1";
  operationId: string; projectUuid: string; branchUuid: string; pageUuid: string; schematicUuid: string;
  textId: string; sourceSha256: string; rootIndices: readonly Readonly<{ id: string; zIndex: number }>[];
  exactProjectedTextBodyVerified: true; completePeerBodyRosterPreserved: true; explicitRelevanceAttributePreserved: true;
  originalReaderVerified: false; coldLoadVerified: false; persistenceVerified: false; reopenedVerified: false; executionAuthorized: false;
}> {
  const rootIndices = source({ source: nativeSource }, args, args.operation.afterBody);
  return freezeDeep({ schema: "private.generated-schematic-relevance-saved-source-data.v1", operationId: args.operation.operationId,
    projectUuid: args.target.projectUuid, branchUuid: args.target.branchUuid, pageUuid: args.target.pageUuid, schematicUuid: args.target.schematicUuid,
    textId: args.operation.textId, sourceSha256: sha256Text(nativeSource), rootIndices,
    exactProjectedTextBodyVerified: true, completePeerBodyRosterPreserved: true, explicitRelevanceAttributePreserved: true,
    originalReaderVerified: false, coldLoadVerified: false, persistenceVerified: false, reopenedVerified: false, executionAuthorized: false });
}
