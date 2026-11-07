/** Complete inert Text/peer comparison. This module owns no native issuer,
 * mutable capability registry, app method, process, clock or SQL authority. */
import { canonicalJson, sha256Text } from "./core.ts";
import type { GeneratedSchematicDisplayNativeArguments } from "./generated-schematic-display-source.ts";
import { generatedSchematicDisplayStageResultSchema } from "./generated-schematic-display.ts";
import type { GeneratedSchematicDisplayStageResult } from "./generated-schematic-display.ts";
import { parseNativeRecords } from "./native-history.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export interface GeneratedSchematicDisplayEffect {
  readonly schema: "private.generated-schematic-display-effect.v1";
  readonly operationId: string; readonly documentUuid: string; readonly textId: string; readonly windowTabId: string;
  readonly beforeSourceSha256: string; readonly modifiedSourceSha256: string; readonly observedSourceSha256: string;
  readonly originalNativeStageProvenanceVerified: true; readonly exactProjectedTextBodyVerified: true; readonly completePeerBodyRosterPreserved: true;
  readonly workerClockProvenanceVerified: false; readonly connectivityVerified: false; readonly selectedSqlAuthorized: false; readonly persistenceVerified: false;
}
function need(value: boolean, reason: string): asserts value { if (!value) { throw new Error(`SCH209_DISPLAY_EFFECT_${reason}`); } }
function stagePacket(packet: unknown, stage: "preflight" | "modify" | "observe"): GeneratedSchematicDisplayStageResult {
  const result = generatedSchematicDisplayStageResultSchema.parse(packet);
  need(result.stage === stage && result.ok && result.originalContextIntact && result.source !== null &&
    (stage === "preflight" ? !result.modifyAttempted && !result.saveAttempted : result.modifyAttempted && result.modifyAcknowledged && !result.saveAttempted), "ORIGINAL_STAGE_STATE"); return result;
}
function source(result: GeneratedSchematicDisplayStageResult, argumentsValue: GeneratedSchematicDisplayNativeArguments,
  expectedText: Readonly<Record<string, unknown>>): void {
  need(result.source !== null && result.source.isWellFormed() && Buffer.byteLength(result.source) <= 16_384, "SOURCE_BOUND");
  const records = parseNativeRecords(result.source), [head, ...rows] = records; const { target, operation } = argumentsValue;
  need(head?.header["type"] === "DOCHEAD" && head.body?.["docType"] === "SCH_PAGE" && head.body["uuid"] === target.pageUuid && rows.length === 6, "SOURCE_DOCUMENT");
  const ids = new Set<string>(); const peers: { id: string; type: string; body: unknown }[] = []; let textCount = 0;
  for (const row of rows) {
    const id = row.header["id"], type = row.header["type"]; need(typeof id === "string" && typeof type === "string" && !ids.has(id) && row.body !== null, "COMPLETE_RECORD_ROSTER"); ids.add(id);
    if (id === operation.textId) { need(type === "TEXT" && canonicalJson(row.body) === canonicalJson(expectedText), "EXACT_LITERAL_TEXT_BODY"); textCount += 1; }
    else { peers.push({ id, type, body: row.body }); }
  }
  need(textCount === 1 && canonicalJson(peers.toSorted((left, right) => left.id.localeCompare(right.id))) === canonicalJson(operation.peers), "COMPLETE_PEER_BODY_ROSTER");
}
export type GeneratedSchematicDisplayProjectedEffect = Omit<GeneratedSchematicDisplayEffect, "originalNativeStageProvenanceVerified"> & Readonly<{ originalNativeStageProvenanceVerified: false }>;
/** Inert complete-source comparison only. Actual native packet provenance is
 * added only by the original central issuer after its private registry joins. */
export function compareGeneratedSchematicDisplayEffect(argumentsValue: GeneratedSchematicDisplayNativeArguments, beforePacket: unknown, modifiedPacket: unknown, observedPacket: unknown): GeneratedSchematicDisplayProjectedEffect {
  const before = stagePacket(beforePacket, "preflight"), modified = stagePacket(modifiedPacket, "modify"), observed = stagePacket(observedPacket, "observe");
  need(before.windowTabId === modified.windowTabId && before.windowTabId === observed.windowTabId, "ORIGINAL_WINDOW_CHANGED");
  source(before, argumentsValue, argumentsValue.operation.beforeBody); source(modified, argumentsValue, argumentsValue.operation.afterBody); source(observed, argumentsValue, argumentsValue.operation.afterBody);
  need(before.source !== null && modified.source !== null && observed.source !== null, "COMPLETE_SOURCES");
  return freezeDeep({ schema: "private.generated-schematic-display-effect.v1", operationId: argumentsValue.operation.operationId,
    documentUuid: argumentsValue.target.pageUuid, textId: argumentsValue.operation.textId, windowTabId: before.windowTabId,
    beforeSourceSha256: sha256Text(before.source), modifiedSourceSha256: sha256Text(modified.source), observedSourceSha256: sha256Text(observed.source),
    originalNativeStageProvenanceVerified: false, exactProjectedTextBodyVerified: true, completePeerBodyRosterPreserved: true, workerClockProvenanceVerified: false,
    connectivityVerified: false, selectedSqlAuthorized: false, persistenceVerified: false });
}
