/** Pure projected-effect comparison. JSON matching this function creates no
 * native owner, dispatch authority, Save permission or persistence proof. */
import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import { CURRENT_PCB_209_PRIMITIVE_FAMILIES } from "./current-pcb-209-primitives.ts";
import { currentPcb209SpatialTrackResultSchema } from "./current-pcb-209-spatial-track-read.ts";
import type { CurrentPcb209SpatialTrackResult } from "./current-pcb-209-spatial-track-read.ts";
import { currentPcbGeometryResultSchema } from "./current-pcb-geometry.ts";
import { currentPcbViaWriteStageResultSchema } from "./current-pcb-via-write-contract.ts";
import type { CurrentPcbViaWritePlan } from "./current-pcb-via-write-plan.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

function need(condition: boolean): asserts condition { if (!condition) { throw new Error("PCB_VIA_PROJECTED_EFFECT"); } }
function same(left: unknown, right: unknown): void { need(canonicalJson(left) === canonicalJson(right)); }
type Geometry = ReturnType<typeof currentPcbGeometryResultSchema.parse>;
type Row = Geometry["rows"][number];
type Roster = ReadonlyMap<string, readonly Row[]>;
function rows(raw: Readonly<Record<string, unknown>>, plan: CurrentPcbViaWritePlan): Roster {
  need(raw["schema"] === "easyeda-pro-control.pcb209-primitives-observation.v1" && raw["matchingSamples"] === true && raw["samples"] === 2);
  const target = { projectUuid: plan.target.projectUuid, branchUuid: plan.target.branchUuid, documentUuid: plan.target.documentUuid,
    tabId: `${plan.target.documentUuid}@${plan.target.projectUuid}` };
  same(raw["target"], target); const families = raw["families"]; need(Array.isArray(families) && families.length === 4);
  const ids = new Set<string>(), result = new Map<string, readonly Row[]>();
  for (const [index, family] of CURRENT_PCB_209_PRIMITIVE_FAMILIES.entries()) {
    const item: unknown = families[index]; need(isRecord(item));
    need(item["family"] === family && item["method"] === `eda.pcb_Primitive${family}.getAll`);
    const parsed = currentPcbGeometryResultSchema.parse({ ok: true, kind: "current-pcb-geometry-observation", method: item["method"],
      target, rows: item["rows"], samples: 2, implementationKind: "native-task-equivalent", cadAuthority: false,
      persistenceVerified: false, sourceMembershipVerified: false });
    same(item["primitiveIds"], parsed.rows.map(row => row.primitiveId)); need(item["observedRowCount"] === parsed.rows.length);
    for (const row of parsed.rows) { need(!ids.has(row.primitiveId)); ids.add(row.primitiveId); }
    result.set(family, parsed.rows);
  }
  need(result.get("Arc")?.length === 0 && result.get("String")?.length === 0); return result;
}
const wholeQuery = Object.freeze({ kind: "region", mode: "inside", leftMil: -10_000_000, rightMil: 10_000_000,
  bottomMil: -10_000_000, topMil: 10_000_000 });
function scene(raw: CurrentPcb209SpatialTrackResult, roster: Roster, plan: CurrentPcbViaWritePlan): CurrentPcb209SpatialTrackResult {
  const value = currentPcb209SpatialTrackResultSchema.parse(raw); same(value.query, wholeQuery);
  need(value.documentUuid === plan.target.documentUuid && value.identities.length === value.sceneLineCount + value.sceneViaCount);
  need(value.selectedPrimitiveIds.every(id => value.identities.some(row => row.primitiveId === id)));
  const line = roster.get("Line"), via = roster.get("Via"); need(line !== undefined && via !== undefined);
  need(line.length === value.sceneLineCount && via.length === value.sceneViaCount);
  for (const [family, members] of [["Line", line], ["Via", via]] as const) {
    same(value.identities.filter(row => row.family === family).map(row => row.primitiveId).toSorted(), members.map(row => row.primitiveId).toSorted());
  }
  return value;
}
function initialRows(history: NativeHistorySnapshot, plan: CurrentPcbViaWritePlan): Readonly<{ Line: readonly Row[]; Via: readonly Row[] }> {
  need(history.projectUuid === plan.target.projectUuid && history.branchUuid === plan.target.branchUuid && history.documents.length === 1);
  const document = history.documents[0]; need(document !== undefined && document.uuid === plan.target.documentUuid && document.docType === "PCB");
  const result: { Line: Row[]; Via: Row[] } = { Line: [], Via: [] };
  for (const record of document.records) {
    if (record.type === "META") { need(record.id === "META"); } else {
    const body = record.body; const base = { primitiveId: record.id, primitiveLock: body["locked"], net: body["netName"] };
    if (record.type === "VIA") {
      need(body["viaType"] === "NORMAL" && body["ruleName"] === "");
      // The qualified generated baseline has explicit zero solder expansions;
      // Native u6.finish selects expansionType2 and ordinary layers1/2.
      const parsed = currentPcbGeometryResultSchema.parse({ ok: true, kind: "current-pcb-geometry-observation", method: "eda.pcb_PrimitiveVia.getAll",
        target: { projectUuid: plan.target.projectUuid, branchUuid: plan.target.branchUuid, documentUuid: document.uuid, tabId: `${document.uuid}@${plan.target.projectUuid}` },
        rows: [{ ...base, primitiveType: "Via", x: body["centerX"], y: body["centerY"], holeDiameter: body["holeDiameter"], diameter: body["viaDiameter"],
          viaType: 0, designRuleBlindViaName: "", startLayer: 1, endLayer: 2, maskExpansionMode: 2, topMaskExpansion: body["topSolderExpansion"], bottomMaskExpansion: body["bottomSolderExpansion"] }],
        samples: 2, implementationKind: "native-task-equivalent", cadAuthority: false, persistenceVerified: false, sourceMembershipVerified: false });
      result.Via.push(...parsed.rows);
    } else if (record.type === "LINE") {
      const parsed = currentPcbGeometryResultSchema.parse({ ok: true, kind: "current-pcb-geometry-observation", method: "eda.pcb_PrimitiveLine.getAll",
        target: { projectUuid: plan.target.projectUuid, branchUuid: plan.target.branchUuid, documentUuid: document.uuid, tabId: `${document.uuid}@${plan.target.projectUuid}` },
        rows: [{ ...base, primitiveType: "Line", layer: body["layerId"], startX: body["startX"], startY: body["startY"], endX: body["endX"], endY: body["endY"], lineWidth: body["width"] }],
        samples: 2, implementationKind: "native-task-equivalent", cadAuthority: false, persistenceVerified: false, sourceMembershipVerified: false });
      result.Line.push(...parsed.rows);
    } else { need(false); }
    }
  }
  need(result.Via.length === 1 && result.Line.length <= 1 && document.records.length === result.Via.length + result.Line.length + 1);
  return result;
}
export interface CurrentPcbViaProjectedEffect {
  readonly schema: "easyeda-pro-control.pcb209-via-projected-effect.v1";
  readonly operationId: string; readonly documentUuid: string; readonly primitiveId: string;
  readonly beforeProjectionSha256: string; readonly afterProjectionSha256: string;
  readonly baselineSourceRosterVerified: true; readonly completeLoadedSceneRosterVerified: true; readonly peerProjectionPreserved: true;
  readonly actualSerializedSourceVerified: false; readonly selectedSqlAuthorized: false; readonly persistenceVerified: false; readonly inverseAvailable: false;
}
/** A data leaf used only after the issuing adapter proves the original owner,
 * exact before/after packets and original create acknowledgement. */
export function compareCurrentPcbViaProjectedEffect(plan: CurrentPcbViaWritePlan, history: NativeHistorySnapshot,
  before: Readonly<Record<string, unknown>>, after: Readonly<Record<string, unknown>>,
  beforeScene: CurrentPcb209SpatialTrackResult, afterScene: CurrentPcb209SpatialTrackResult, acknowledgement: unknown): CurrentPcbViaProjectedEffect {
  const ack = currentPcbViaWriteStageResultSchema.parse(acknowledgement);
  need(ack.stage === "create" && ack.ok && ack.dispatchAttempted && ack.originalPromiseAcknowledged && ack.createAttempted && ack.createAcknowledged &&
    !ack.saveAttempted && !ack.saveAcknowledged && ack.primitiveId !== null); const primitiveId = ack.primitiveId;
  const expected = initialRows(history, plan), left = rows(before, plan), right = rows(after, plan);
  same(left.get("Via"), expected.Via); same(left.get("Line"), expected.Line);
  const finalScene = scene(afterScene, right, plan), initialScene = scene(beforeScene, left, plan);
  same(initialScene.selectedPrimitiveIds, finalScene.selectedPrimitiveIds);
  need(!initialScene.identities.some(row => row.primitiveId === primitiveId));
  same(finalScene.identities.filter(row => row.primitiveId !== primitiveId), initialScene.identities);
  need(finalScene.sceneLineCount === initialScene.sceneLineCount && finalScene.sceneViaCount === initialScene.sceneViaCount + 1);
  same(right.get("Line"), left.get("Line")); const finalVias = right.get("Via"); need(finalVias !== undefined);
  same(finalVias.filter(row => row.primitiveId !== primitiveId), left.get("Via"));
  const added = finalVias.filter(row => row.primitiveId === primitiveId); need(added.length === 1);
  const native = plan.expectedNative;
  // Keep the exact native operation order: the renderer scales radius/center
  // To mil, then the DTO doubles radii. No tolerance hides a changed value.
  same(added[0], { primitiveId, primitiveType: "Via", primitiveLock: false, net: "", x: native.x * 10, y: native.y * 10,
    holeDiameter: native.holeRadius * 10 * 2, diameter: native.radius * 10 * 2, viaType: 0, designRuleBlindViaName: "",
    startLayer: 1, endLayer: 2, maskExpansionMode: 2, topMaskExpansion: 0, bottomMaskExpansion: 0 });
  return freezeDeep({ schema: "easyeda-pro-control.pcb209-via-projected-effect.v1", operationId: plan.operationId, documentUuid: plan.target.documentUuid,
    primitiveId, beforeProjectionSha256: sha256Json({ families: [...left], scene: initialScene }), afterProjectionSha256: sha256Json({ families: [...right], scene: finalScene }),
    baselineSourceRosterVerified: true, completeLoadedSceneRosterVerified: true, peerProjectionPreserved: true, actualSerializedSourceVerified: false,
    selectedSqlAuthorized: false, persistenceVerified: false, inverseAvailable: false });
}
