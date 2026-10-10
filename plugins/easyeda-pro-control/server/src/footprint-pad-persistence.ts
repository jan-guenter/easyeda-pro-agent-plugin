import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import { verifyDesignBaseline } from "./design-persistence.ts";
import type { DesignBaselineTarget } from "./design-persistence.ts";
import type { NativeSourceSnapshot } from "./document-source.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";

interface PadEncodingDifference {
  readonly targetId: string;
  readonly field: string;
  readonly durablePresent: boolean;
  readonly durableValue: unknown;
  readonly sourceValue: unknown;
}

/** PCB bundle 3.2.149.5378b690: G4.feed divides mask values by ten;
 * the PAD encoder uses De(value*10,4). This is the exact codec, not epsilon.
 */
function exportedPaste(value: number): number {
  return Math.round(((value / 10) * 10) * 10_000 + 1e-10) / 10_000;
}

/** Native PAD history uploads the complete encoded model. For a modified
 * standalone SMD pad only, prove the narrow load/export differences before
 * comparing that complete upload. All other fields must already agree.
 */
export function projectFootprintPadHistory(input: {
  readonly checkpoint: NativeHistorySnapshot;
  readonly source: NativeSourceSnapshot;
  readonly targets: readonly DesignBaselineTarget[];
}): { readonly checkpoint: NativeHistorySnapshot; readonly differences: readonly PadEncodingDifference[] } {
  verifyDesignBaseline({ checkpoint: input.checkpoint, source: input.source, targets: [] });
  const document = input.checkpoint.documents.find((entry) => entry.uuid === input.source.document["uuid"]);
  if (input.source.document["docType"] !== "PCB" || input.source.document["editVersion"] !== "3.2.149.88089769" || document?.docType !== "FOOTPRINT") {
    throw new Error("Pad history representation requires the reviewed footprint editor.");
  }
  const targetIds = new Set(input.targets.map((target) => target.id));
  if (targetIds.size !== input.targets.length) { throw new Error("Duplicate footprint baseline target."); }
  const differences: PadEncodingDifference[] = [];
  const replacements = new Map<string, NativeSourceSnapshot["objects"][number]>();
  for (const live of input.source.objects.filter((record) => record.type === "PAD" && targetIds.has(record.id))) {
    const stored = document.records.find((entry) => entry.id === live.id);
    if (stored === undefined || stored.type !== "PAD") { throw new Error("Footprint pad target is absent from durable baseline."); }
    const after = live.body, before = stored.body;
    const fields = [...new Set([...Object.keys(before), ...Object.keys(after)])].filter((field) =>
      canonicalJson({ value: before[field] }) !== canonicalJson({ value: after[field] }));
    if (fields.length > 0) {
    const land = before["defaultPad"];
    if (before["hole"] !== null || after["hole"] !== null || (before["layerId"] !== 1 && before["layerId"] !== 2) ||
        before["layerId"] !== after["layerId"] || before["netName"] !== "" ||
        (before["parentId"] !== undefined && before["parentId"] !== null && before["parentId"] !== "") ||
        canonicalJson(before["specialPad"]) !== "[]" || !isRecord(land) ||
        !["ELLIPSE", "OVAL", "RECT"].includes(String(land["padType"]))) {
      throw new Error("Unsupported footprint pad load/export representation.");
    }
    for (const field of fields) {
      const observed = after[field], value = before[field];
      let admitted = false;
      if (field === "padOffsetX" || field === "padOffsetY") {
        admitted = typeof value === "number" && Number.isFinite(value) && observed === 0;
      } else if (field === "relativeAngle") {
        admitted = (value === null || (typeof value === "number" && Number.isFinite(value))) && observed === null;
      } else if (field === "unusedInnerLayers") {
        admitted = !Object.hasOwn(before, field) && canonicalJson(observed) === "[]";
      } else if (field === "attrsMap") {
        admitted = !Object.hasOwn(before, field) && canonicalJson(observed) === "{}";
      } else if (field === "topPasteExpansion" || field === "bottomPasteExpansion") {
        admitted = typeof value === "number" && Number.isFinite(value) && before["topPasteExpansion"] === before["bottomPasteExpansion"] &&
          observed === exportedPaste(value);
      }
      if (!admitted) { throw new Error("Unreviewed footprint pad load/export field difference."); }
      differences.push({ targetId: live.id, field, durablePresent: Object.hasOwn(before, field), durableValue: value ?? null, sourceValue: observed });
    }
    replacements.set(live.id, live);
    }
  }
  if (replacements.size === 0) { return { checkpoint: input.checkpoint, differences }; }
  const documents = input.checkpoint.documents.map((entry) => {
    if (entry.uuid !== document.uuid) { return entry; }
    const records = entry.records.map((record) => {
      const replacement = replacements.get(record.id);
      return replacement === undefined ? record : { ...record, body: replacement.body };
    });
    return { ...entry, records, semanticSha256: sha256Json({ uuid: entry.uuid, docType: entry.docType, metadata: entry.metadata,
      records: records.map(({ id, type, body }) => ({ id, type, body })) }) };
  });
  return { checkpoint: { ...input.checkpoint, documents,
    semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) }, differences };
}
