/** Inert seven-row display data; no checkpoint or native owner is issued. */
import { freezeDeep } from "../src/sqlite-inventory-core.ts";
import { MANAGED_SCHEMATIC_FIXTURE_BUS_LINE, MANAGED_SCHEMATIC_FIXTURE_GROUP, MANAGED_SCHEMATIC_FIXTURE_TEXT, MANAGED_SCHEMATIC_FIXTURE_WIRE_LINE } from "../src/managed-schematic-fixture-generator.ts";
import { MANAGED_SCHEMATIC_RELEVANCE_ATTRIBUTE } from "../src/managed-schematic-relevance-fixture-generator.ts";
import { prepareGeneratedSchematicRelevanceDisplayBodyPlan, projectGeneratedSchematicRelevanceNativeAttributeBody } from "../src/generated-schematic-relevance-display-source.ts";
import type { GeneratedSchematicRelevanceDisplayNativeArguments } from "../src/generated-schematic-relevance-display-source.ts";
import type { NativeHistorySnapshot } from "../src/native-history.ts";

export const textId = `0${"8".repeat(15)}`; const wireId = `0${"9".repeat(15)}`; const busId = `0${"a".repeat(15)}`; const lineId = `0${"b".repeat(15)}`; const busLineId = `0${"c".repeat(15)}`; const attrId = `0${"d".repeat(15)}`;
const record = (id: string, type: string, ticket: number, body: Record<string, unknown>): NativeHistorySnapshot["documents"][number]["records"][number] => ({ id, type, ticket, body, client: "test-client" });
export function data(): Readonly<{ args: GeneratedSchematicRelevanceDisplayNativeArguments; history: NativeHistorySnapshot }> {
  const plan = prepareGeneratedSchematicRelevanceDisplayBodyPlan({ x: 25, bold: true });
  const target = { rawWindowsPath: `C:\\SyntheticTemp\\CodexEasyedaFixture_${"1".repeat(32)}\\Codex_schematic_relevance_${"2".repeat(16)}.eprj2`, projectUuid: "3".repeat(64), branchUuid: "4".repeat(32), schematicUuid: "5".repeat(32), pageUuid: "6".repeat(32), expectedSourceSha256: "7".repeat(64) };
  const rawGroups = [record(wireId, "WIRE", 3, { ...MANAGED_SCHEMATIC_FIXTURE_GROUP }), record(lineId, "LINE", 4, { ...MANAGED_SCHEMATIC_FIXTURE_WIRE_LINE, lineGroup: wireId }),
    record(busId, "BUS", 5, { ...MANAGED_SCHEMATIC_FIXTURE_GROUP, busEntry: {} }), record(busLineId, "LINE", 6, { ...MANAGED_SCHEMATIC_FIXTURE_BUS_LINE, lineGroup: busId }), record(attrId, "ATTR", 7, { ...MANAGED_SCHEMATIC_RELEVANCE_ATTRIBUTE, parentId: wireId })];
  const peers: GeneratedSchematicRelevanceDisplayNativeArguments["operation"]["peers"][number][] = [{ id: "CANVAS", type: "CANVAS", body: { originX: 0, originY: 0 } },
    { id: wireId, type: "WIRE", body: { locked: false } }, { id: busId, type: "BUS", body: { locked: false, busEntry: {} } },
    { id: lineId, type: "LINE", body: { ...MANAGED_SCHEMATIC_FIXTURE_WIRE_LINE, lineGroup: wireId } }, { id: busLineId, type: "LINE", body: { ...MANAGED_SCHEMATIC_FIXTURE_BUS_LINE, lineGroup: busId } },
    { id: attrId, type: "ATTR", body: projectGeneratedSchematicRelevanceNativeAttributeBody({ ...MANAGED_SCHEMATIC_RELEVANCE_ATTRIBUTE, parentId: wireId }, wireId) }];
  const args: GeneratedSchematicRelevanceDisplayNativeArguments = freezeDeep({ schema: "private.generated-schematic-relevance-display-args.v1", target, operation: { operationId: "sch209-relevance-display-vm-test", textId, rootIds: [textId, wireId, busId].toSorted(), beforeBody: plan.nativeBeforeBody, afterBody: plan.nativeAfterBody, peers: peers.toSorted((left, right) => left.id.localeCompare(right.id)) } });
  const history: NativeHistorySnapshot = { profile: "easyeda.native-history.linear-gcm-gzip.v1", projectUuid: target.projectUuid, branchUuid: target.branchUuid,
    headHistoryUuid: "e".repeat(32), checkpointSha256: "f".repeat(64), historyRowCount: 1, chunkCount: 1, plaintextBytes: 2048, semanticSha256: "1".repeat(64), documents: [
      { uuid: target.schematicUuid, docType: "SCH", metadata: {}, semanticSha256: "2".repeat(64), records: [record("META", "META", 1, {})] },
      { uuid: target.pageUuid, docType: "SCH_PAGE", metadata: {}, semanticSha256: "3".repeat(64), records: [record("META", "META", 1, { schematic: target.schematicUuid }), record(textId, "TEXT", 2, { ...MANAGED_SCHEMATIC_FIXTURE_TEXT }), ...rawGroups] }] };
  return { args, history };
}
