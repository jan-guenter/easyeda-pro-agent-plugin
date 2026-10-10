import { canonicalJson, sha256Json } from "./core.ts";
import { verifyDesignBaseline } from "./design-persistence.ts";
import type { NativeSourceSnapshot } from "./document-source.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { projectSchematicCoordinateCheckpoint } from "./schematic-coordinate-lifecycle.ts";
import { correlateSchematicNativeSource } from "./schematic-source-proof.ts";
import { verifySchematicStoragePersistence } from "./schematic-storage-persistence.ts";
import { yieldProofEventLoop } from "./cooperative-proof.ts";

type StorageInput = Parameters<typeof verifySchematicStoragePersistence>[0];
interface MaterializationInput {
  readonly history: NativeHistorySnapshot;
  readonly source: NativeSourceSnapshot;
  readonly native: unknown;
}
const same = (left: unknown, right: unknown): boolean => canonicalJson(left) === canonicalJson(right);

/** A comparison-only projection, never a checkpoint or evidence of a write.
 * Native source omits durable META and can expose unpersisted initialization.
 * Replacing the entire target in a comparison copy makes every source body an
 * asserted baseline, including records outside the requested display patch.
 * The maintained no-op storage proof must account for every resulting delta.
 */
async function materialization(input: MaterializationInput): Promise<{
  readonly proof: Readonly<Record<string, unknown>>; readonly coordinateCheckpoint: NativeHistorySnapshot;
}> {
  const { history, source } = input;
  verifyDesignBaseline({ checkpoint: history, source, targets: [] });
  const native = correlateSchematicNativeSource(source, input.native);
  const nativeComponents = new Map(native.components.map((component) => [component.id, component]));
  const target = history.documents.find((document) => document.uuid === source.document["uuid"]);
  if (target?.docType !== "SCH_PAGE") { throw new Error("Flat display materialization requires its saved ordinary page."); }
  const durable = new Map(target.records.map((record) => [record.id, record]));
  const exported = new Map(source.objects.map((record) => [record.id, record]));
  const meta = durable.get("META");
  if (meta?.type !== "META" || target.records.filter((record) => record.type === "META").length !== 1 ||
      source.objects.some((record) => record.type === "META" && record.id !== "META") ||
      (exported.has("META") && !same(exported.get("META"), { id: meta.id, type: meta.type, body: meta.body })) ||
      target.records.some((record) => record.id !== "META" && !exported.has(record.id)) ||
      source.objects.some((record) => !durable.has(record.id) && record.id !== "CANVAS")) {
    throw new Error("Flat display requires complete stored/source target record membership except its exact durable META and default CANVAS.");
  }
  const canvas = exported.get("CANVAS");
  if (!durable.has("CANVAS") && canvas !== undefined &&
      (canvas.type !== "CANVAS" || !same(canvas.body, { originX: 0, originY: 0 }))) {
    throw new Error("Flat display source-only CANVAS is not the exact native default origin.");
  }
  for (const record of target.records.filter((entry) => entry.type === "COMPONENT" && entry.body["zIndex"] === null)) {
    const current = exported.get(record.id);
    if (current?.body["zIndex"] !== null && (nativeComponents.get(record.id)?.kind !== "sheet" ||
        current?.type !== "COMPONENT" || current.body["zIndex"] !== 0 || !same(current.body, { ...record.body, zIndex: 0 }))) {
      throw new Error("Flat display admits only the exact null-to-zero native drawing-frame initialization.");
    }
  }
  await yieldProofEventLoop();
  const coordinates = projectSchematicCoordinateCheckpoint(history, source, native);
  const rows = source.objects.map((record) => ({ ...structuredClone(record), ticket: durable.get(record.id)?.ticket ?? 0,
    client: durable.get(record.id)?.client ?? null }));
  if (!exported.has("META")) { rows.push(structuredClone(meta)); }
  rows.sort((left, right) => left.id.localeCompare(right.id));
  const comparisonTarget = { ...target, records: rows, semanticSha256: sha256Json({ uuid: target.uuid, docType: target.docType,
    metadata: target.metadata, records: rows.map(({ id, type, body }) => ({ id, type, body })) }) };
  const documents = history.documents.map((document) => document.uuid === target.uuid ? comparisonTarget : document);
  const candidate = { ...history, documents, semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
  await yieldProofEventLoop();
  const comparison = verifySchematicStoragePersistence({ before: coordinates.checkpoint, after: candidate,
    expectedBefore: source, expectedAfter: source, beforeNative: native, afterNative: native });
  const scope = { rawCheckpointSha256: history.checkpointSha256, rawHistorySemanticSha256: history.semanticSha256,
    sourceSha256: source.sha256, comparisonOnly: true, candidateSemanticSha256: candidate.semanticSha256,
    durableMetaSha256: sha256Json({ id: meta.id, type: meta.type, body: meta.body }), coordinateProof: coordinates.proof, comparison };
  await yieldProofEventLoop();
  return { coordinateCheckpoint: coordinates.checkpoint,
    proof: { ok: true, schema: "easyeda-pro-control.flat-display-materialization.v1", ...scope, scopeSha256: sha256Json(scope) } };
}

export async function verifyFlatDisplayMaterialization(input: MaterializationInput): Promise<Readonly<Record<string, unknown>>> {
  const result = await materialization(structuredClone(input));
  return result.proof;
}

/** Full original-to-restored durable proof for flat-only rollback/reconciliation.
 * No write, Save, receipt or raw history is synthesized by this comparison.
 */
export async function verifyFlatDisplayRestoration(input: StorageInput): Promise<Readonly<Record<string, unknown>>> {
  const captured = structuredClone(input);
  const before = await materialization({ history: captured.before, source: captured.expectedBefore, native: captured.beforeNative });
  const after = await materialization({ history: captured.after, source: captured.expectedAfter, native: captured.afterNative });
  const comparison = verifySchematicStoragePersistence({ ...captured, before: before.coordinateCheckpoint, after: after.coordinateCheckpoint });
  return { ok: true, schema: "easyeda-pro-control.flat-display-restoration.v1", beforeMaterialization: before.proof,
    afterMaterialization: after.proof, comparison };
}
