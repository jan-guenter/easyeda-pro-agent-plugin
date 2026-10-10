import { canonicalJson, sha256Json } from "./core.ts";
import { verifyDesignBaseline, verifyDesignPersistence } from "./design-persistence.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "./document-source.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot, NativeObjectSnapshot } from "./native-history.ts";
import { correlateSchematicNativeSource } from "./schematic-source-proof.ts";
import type { SchematicNativeSnapshot } from "./schematic-native-adapter.ts";
import { schematicNewWireOrders } from "./schematic-wire-order.ts";
import { schematicHiddenNullOrder } from "./schematic-hidden-order.ts";
import type { SchematicHiddenOrderProof } from "./schematic-hidden-order.ts";
import { schematicLibraryStyle } from "./schematic-library-style.ts";
import type { SchematicLibraryStyleProof } from "./schematic-library-style.ts";

type Input = Parameters<typeof verifyDesignPersistence>[0];
type Body = Record<string, unknown>;
interface EncodingDifference {
  readonly side: "before" | "after"; readonly id: string; readonly parentId: string; readonly parentKind: string; readonly key: string;
  readonly fields: readonly string[]; readonly storedBodySha256: string; readonly sourceBodySha256: string;
  readonly storedZIndex: unknown; readonly sourceZIndex: unknown; readonly storedStrikeoutPresent: boolean; readonly sourceStrikeoutPresent: boolean;
  readonly hiddenNullOrder?: SchematicHiddenOrderProof;
  readonly libraryStyle?: SchematicLibraryStyleProof;
}
const equal = (a: unknown, b: unknown): boolean => canonicalJson({ value: a }) === canonicalJson({ value: b });
const fieldEqual = (a: Body, b: Body, key: string): boolean => Object.hasOwn(a, key) === Object.hasOwn(b, key) && equal(a[key], b[key]);
const semantic = ({ id, type, body }: NativeSourceObject): NativeSourceObject => ({ id, type, body });

function target(history: NativeHistorySnapshot, source: NativeSourceSnapshot): NativeDocumentSnapshot {
  const result = history.documents.find((entry) => entry.uuid === source.document["uuid"]);
  if (source.document["docType"] !== "SCH_PAGE" || source.document["editVersion"] !== "3.2.149.88089769" || result?.docType !== "SCH_PAGE") { throw new Error("Schematic storage requires the reviewed native page profile."); }
  return result;
}
function parentKind(record: NativeSourceObject, source: NativeSourceSnapshot, native: SchematicNativeSnapshot): string {
  const id = record.body["parentId"];
  const parent = source.objects.find((entry) => entry.id === id);
  if (parent?.type === "WIRE") { return "wire"; }
  const pins = native.components.flatMap((entry) => entry.pins).filter((entry) => entry.id === id);
  if (parent === undefined && record.body["key"] === "Pin Number" && pins.length === 1 &&
      pins[0]?.attributes.some((entry) => entry.id === record.id && entry.key === record.body["key"] && equal(entry.body, record.body)) === true) { return "pin"; }
  const model = native.components.find((entry) => entry.id === id);
  if (parent?.type !== "COMPONENT" || model === undefined || !["part", "sheet", "netflag", "netport"].includes(model.kind) ||
      !model.attributes.some((entry) => entry.id === record.id && entry.key === record.body["key"] && equal(entry.body, record.body))) {
    throw new Error("Schematic storage attribute has no exact supported source/native owner.");
  }
  return model.kind;
}

/** Pinned Zr.getConsistencyData emits _strikeout, whose missing value is omitted
 * by JSON. el.strikeout returns false for that missing value; template clone
 * copies it. createSchSymbolWithTemplate then recalculates child array order.
 * Existing durable order may remain old until that child is uploaded. Admit
 * only unchanged durable order or the exact independently captured model order.
 * Every other body field, including visible positions and values, stays exact.
 */
function projectAttributes(side: "before" | "after", document: NativeDocumentSnapshot, source: NativeSourceSnapshot,
  native: SchematicNativeSnapshot, before: NativeDocumentSnapshot, differences: EncodingDifference[], history: NativeHistorySnapshot,
  newWireOrders: ReadonlyMap<string, number> = new Map()): NativeObjectSnapshot[] {
  const old = new Map(before.records.map((entry) => [entry.id, entry]));
  const sourceRecords = new Map(source.objects.map((entry) => [entry.id, entry]));
  return document.records.map((record) => {
    const exported = sourceRecords.get(record.id);
    if (record.type !== "ATTR" || exported === undefined || equal(record.body, exported.body)) { return record; }
    if (exported.type !== "ATTR" || typeof exported.body["parentId"] !== "string" || typeof exported.body["key"] !== "string" ||
        record.body["parentId"] !== exported.body["parentId"] || record.body["key"] !== exported.body["key"]) { throw new Error("Schematic stored attribute identity differs from source."); }
    const kind = parentKind(exported, source, native);
    const fields = [...new Set([...Object.keys(record.body), ...Object.keys(exported.body)])].filter((key) => !fieldEqual(record.body, exported.body, key)).toSorted();
    if (kind === "pin" && fields.some((key) => key !== "strikeout")) { throw new Error("Pin attributes admit only the reviewed strikeout storage encoding."); }
    const styleFields = fields.filter((key) => !["zIndex", "strikeout"].includes(key));
    const libraryStyle = styleFields.length === 0 ? undefined : schematicLibraryStyle(history, native, record, exported, styleFields);
    if (side === "after" && styleFields.some((key) => !fieldEqual(old.get(record.id)?.body ?? {}, record.body, key))) {
      throw new Error("Changed durable attribute style is neither retained nor the exact captured model style.");
    }
    if (fields.includes("strikeout") && !((!Object.hasOwn(record.body, "strikeout") && exported.body["strikeout"] === false) ||
        (record.body["strikeout"] === false && !Object.hasOwn(exported.body, "strikeout")))) { throw new Error("Schematic strikeout difference is not the exact missing/false encoding."); }
    let hiddenNullOrder: SchematicHiddenOrderProof | undefined;
    if (fields.includes("zIndex")) {
      const current = exported.body["zIndex"];
      const stored = record.body["zIndex"];
      // NetGroup.sortChildrenByCategory initializes null-order NET/Relevance attributes.
      // Untouched durable rows retain null until their next upload.
      const uninitializedWireOrder = stored === null && kind === "wire" && ["Relevance", "NET"].includes(exported.body["key"]);
      if (stored === null && ((kind === "part" && exported.body["key"] === "Unique ID") || (kind === "netflag" && exported.body["key"] === "Relevance"))) {
        hiddenNullOrder = schematicHiddenNullOrder(history, document, source, native, record);
      }
      if ((!uninitializedWireOrder && hiddenNullOrder === undefined && (typeof stored !== "number" || !Number.isSafeInteger(stored))) || typeof current !== "number" || !Number.isSafeInteger(current) || current < 0) { throw new Error("Schematic attribute order is not an exact native integer."); }
      const prior = old.get(record.id);
      const exactNewWireCreation = prior === undefined && stored === 0 && newWireOrders.get(record.id) === current;
      if (side === "after" && !exactNewWireCreation && (prior?.type !== "ATTR" || prior.body["parentId"] !== record.body["parentId"] || prior.body["key"] !== record.body["key"] || !fieldEqual(prior.body, record.body, "zIndex"))) {
        throw new Error("Changed durable attribute order is neither retained nor the exact captured model order.");
      }
    }
    differences.push({ side, id: record.id, parentId: exported.body["parentId"], parentKind: kind, key: exported.body["key"], fields,
      storedBodySha256: sha256Json(record.body), sourceBodySha256: sha256Json(exported.body), storedZIndex: record.body["zIndex"], sourceZIndex: exported.body["zIndex"],
      storedStrikeoutPresent: Object.hasOwn(record.body, "strikeout"), sourceStrikeoutPresent: Object.hasOwn(exported.body, "strikeout"),
      ...(hiddenNullOrder === undefined ? {} : { hiddenNullOrder }), ...(libraryStyle === undefined ? {} : { libraryStyle }) });
    return { ...record, body: structuredClone(exported.body) };
  });
}
/** NetGroup uploads its new hidden Relevance[] at constructor order zero.
 * Endpoint categorization later recalculates its source-only child position.
 * Reuse the independently reviewed complete endpoint graph, never an order range.
 */
function newWireCreationOrders(input: Input, before: NativeDocumentSnapshot, after: NativeDocumentSnapshot, native: SchematicNativeSnapshot): ReturnType<typeof schematicNewWireOrders> {
  const beforeIds = new Set([...before.records, ...input.expectedBefore.objects].map((entry) => entry.id));
  const records = new Map(input.expectedAfter.objects.map((entry) => [entry.id, entry]));
  const created = new Map<string, string>();
  for (const wire of [...records.values()].filter((entry) => entry.type === "WIRE" && !beforeIds.has(entry.id))) {
    const relevance = [...records.values()].filter((entry) => entry.type === "ATTR" && entry.body["parentId"] === wire.id && entry.body["key"] === "Relevance");
    const attr = relevance[0];
    if (relevance.length !== 1 || attr === undefined || beforeIds.has(attr.id) || attr.body["x"] !== null || attr.body["y"] !== null || attr.body["value"] !== "[]" ||
        [attr.body["keyVisible"], attr.body["valueVisible"]].some((value) => value !== null && value !== false)) {
      throw new Error("New wire storage lacks its exact hidden constructor Relevance attribute.");
    }
    created.set(wire.id, attr.id);
  }
  return schematicNewWireOrders(input.expectedBefore, records, native, created).filter((order) => {
    const source = records.get(order.relevanceId), stored = after.records.find((entry) => entry.id === order.relevanceId);
    if (source?.body["zIndex"] !== order.zIndex) { throw new Error("New wire source order differs from its complete endpoint graph."); }
    return stored?.type === "ATTR" && stored.body["parentId"] === order.id && stored.body["key"] === "Relevance" && stored.body["zIndex"] === 0 && order.zIndex !== 0;
  });
}
function replace(history: NativeHistorySnapshot, original: NativeDocumentSnapshot, records: readonly NativeObjectSnapshot[]): NativeHistorySnapshot {
  const changed = { ...original, records, semanticSha256: sha256Json({ uuid: original.uuid, docType: original.docType, metadata: original.metadata, records: records.map((entry) => semantic(entry)) }) };
  const documents = history.documents.map((entry) => entry.uuid === original.uuid ? changed : entry);
  return { ...history, documents, semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
}

const isRoot = (row: NativeSourceObject): boolean => row.body["parentId"] === "$$root" || (!["ATTR", "CANVAS", "META"].includes(row.type) && row.body["parentId"] === undefined && row.body["lineGroup"] === undefined);
/** Native ng.trySortChildrenByZIndex (pinned sch.js) places one invalid root at
 * minimumFiniteOrder - 1. The ordinary zIndex setter is non-history; a later
 * source upload can persist this already captured order. Restrict this added
 * profile to one null-order sheet among source-bound COMPONENT/WIRE roots and
 * unchanged TEXT roots with complete before/source/after semantic agreement.
 * Unknown root kinds, another invalid order or a changed peer order fail shut.
 */
function initializedFrameRootOrder(document: NativeDocumentSnapshot, source: NativeSourceSnapshot, frameId: string,
  after: NativeDocumentSnapshot, afterSource: NativeSourceSnapshot): number | undefined {
  const sourceRoots = source.objects.filter(isRoot), storedRoots = document.records.filter(isRoot);
  if (!equal(storedRoots.map((row) => row.id).toSorted(), sourceRoots.map((row) => row.id).toSorted()) ||
      storedRoots.some((row) => !["COMPONENT", "WIRE", "TEXT"].includes(row.type))) { return undefined; }
  let minimum = Number.POSITIVE_INFINITY;
  for (const row of storedRoots) {
    const exported = sourceRoots.find((entry) => entry.id === row.id);
    if (exported?.type !== row.type) { return undefined; }
    if (row.type === "TEXT") {
      const next = after.records.find((entry) => entry.id === row.id);
      const nextExported = afterSource.objects.find((entry) => entry.id === row.id);
      if (next === undefined || !equal(semantic(row), exported) || !equal(exported, nextExported) ||
          !equal(semantic(next), nextExported)) { return undefined; }
    }
    if (row.id === frameId) {
      if (row.type !== "COMPONENT" || row.body["zIndex"] !== null) { return undefined; }
    } else {
      const order = row.body["zIndex"];
      if (typeof order !== "number" || !Number.isFinite(order) || Math.abs(order) > Number.MAX_SAFE_INTEGER || exported.body["zIndex"] !== order) { return undefined; }
      minimum = Math.min(minimum, order);
    }
  }
  const order = minimum - 1;
  return Number.isSafeInteger(order) && order >= 0 ? order : undefined;
}

/** Pre-dispatch counterpart of the same reviewed encoding projection. Every
 * intended target and field still goes through the generic baseline verifier.
 * No source-only identity is materialized here and no geometry/value is mapped.
 */
export function verifySchematicStorageBaseline(input: Parameters<typeof verifyDesignBaseline>[0]): Record<string, unknown> {
  verifyDesignBaseline({ checkpoint: input.checkpoint, source: input.source, targets: [] });
  const document = target(input.checkpoint, input.source);
  const native = correlateSchematicNativeSource(input.source, input.native);
  const differences: EncodingDifference[] = [];
  const records = projectAttributes("before", document, input.source, native, document, differences, input.checkpoint);
  const comparisonCheckpoint = replace(input.checkpoint, document, records);
  const comparison = verifyDesignBaseline({ checkpoint: comparisonCheckpoint, source: input.source, targets: input.targets });
  const scope = { checkpointSha256: input.checkpoint.checkpointSha256, checkpointSemanticSha256: input.checkpoint.semanticSha256,
    sourceSha256: input.source.sha256, comparisonCheckpointSemanticSha256: comparisonCheckpoint.semanticSha256, differences };
  return { ok: true, schema: "easyeda-pro-control.schematic-storage-baseline.v1", targetUuid: document.uuid,
    scope: "selected-target-fields-not-whole-editor-cleanliness", ...scope, scopeSha256: sha256Json(scope), comparison };
}

/** Comparison-only encoding proof. Caller must already prove the typed source
 * effect and independently perform required save/reopen verification. This
 * helper does not attest that reopening occurred, nor modify any raw input.
 */
export function verifySchematicStoragePersistence(input: Input): Record<string, unknown> {
  verifyDesignBaseline({ checkpoint: input.before, source: input.expectedBefore, targets: [] });
  verifyDesignBaseline({ checkpoint: input.after, source: input.expectedAfter, targets: [] });
  if (input.before.projectOwnerUuid !== input.after.projectOwnerUuid) { throw new Error("Schematic storage project owner changed."); }
  const before = target(input.before, input.expectedBefore);
  const after = target(input.after, input.expectedAfter);
  const beforeNative = correlateSchematicNativeSource(input.expectedBefore, input.beforeNative);
  const afterNative = correlateSchematicNativeSource(input.expectedAfter, input.afterNative);
  const differences: EncodingDifference[] = [];
  const newWireOrders = newWireCreationOrders(input, before, after, afterNative);
  const previous = projectAttributes("before", before, input.expectedBefore, beforeNative, before, differences, input.before);
  const current = projectAttributes("after", after, input.expectedAfter, afterNative, before, differences, input.after, new Map(newWireOrders.map((entry) => [entry.relevanceId, entry.zIndex])));
  const frameOrderInitializations: { id: string; beforeBodySha256: string; afterBodySha256: string }[] = [];
  for (const [index, record] of previous.entries()) {
    const model = beforeNative.components.find((entry) => entry.id === record.id);
    const oldSource = input.expectedBefore.objects.find((entry) => entry.id === record.id);
    const nextSource = input.expectedAfter.objects.find((entry) => entry.id === record.id);
    const storedAfter = current.find((entry) => entry.id === record.id);
    const eligible = record.type === "COMPONENT" && model?.kind === "sheet" && record.body["zIndex"] === null;
    let initializedOrder: number | undefined;
    if (eligible) { initializedOrder = oldSource?.body["zIndex"] === 0 ? 0 : initializedFrameRootOrder(before, input.expectedBefore, record.id, after, input.expectedAfter); }
    if (initializedOrder !== undefined && oldSource?.body["zIndex"] === initializedOrder &&
        storedAfter?.type === "COMPONENT" && storedAfter.body["zIndex"] === initializedOrder && equal(oldSource, nextSource) &&
        equal({ ...record.body, zIndex: initializedOrder }, oldSource.body) && equal(storedAfter.body, oldSource.body)) {
      previous[index] = { ...record, body: { ...record.body, zIndex: initializedOrder } };
      frameOrderInitializations.push({ id: record.id, beforeBodySha256: sha256Json(record.body), afterBodySha256: sha256Json(storedAfter.body) });
    }
  }
  const oldCanvas = before.records.find((entry) => entry.id === "CANVAS");
  const newCanvas = after.records.find((entry) => entry.id === "CANVAS");
  let materializedCanvas: { id: "CANVAS"; bodySha256: string } | null = null;
  if (oldCanvas === undefined && newCanvas !== undefined) {
    const sourceBefore = input.expectedBefore.objects.find((entry) => entry.id === "CANVAS");
    const sourceAfter = input.expectedAfter.objects.find((entry) => entry.id === "CANVAS");
    if (sourceBefore?.type !== "CANVAS" || sourceAfter?.type !== "CANVAS" || newCanvas.type !== "CANVAS" || !equal(sourceBefore, sourceAfter) || !equal(semantic(newCanvas), sourceAfter) ||
        !equal(Object.keys(newCanvas.body).toSorted(), ["originX", "originY"]) || ["originX", "originY"].some((key) => typeof newCanvas.body[key] !== "number" || !Number.isFinite(newCanvas.body[key]))) {
      throw new Error("Unreviewed schematic origin CANVAS materialization.");
    }
    previous.push(structuredClone(newCanvas)); previous.sort((a, b) => a.id.localeCompare(b.id));
    materializedCanvas = { id: "CANVAS", bodySha256: sha256Json(newCanvas.body) };
  }
  const comparisonBefore = replace(input.before, before, previous);
  const comparisonAfter = replace(input.after, after, current);
  for (const record of current) {
    const prior = previous.find((entry) => entry.id === record.id);
    const sourceBefore = input.expectedBefore.objects.find((entry) => entry.id === record.id);
    const sourceAfter = input.expectedAfter.objects.find((entry) => entry.id === record.id);
    if (equal(sourceBefore, sourceAfter) && (prior === undefined || !equal(semantic(prior), semantic(record)))) { throw new Error(`Schematic storage changed an unrequested record: ${record.id}/${record.type}.`); }
  }
  const comparison = verifyDesignPersistence({ before: comparisonBefore, after: comparisonAfter, expectedBefore: input.expectedBefore, expectedAfter: input.expectedAfter });
  const scope = { beforeCheckpointSha256: input.before.checkpointSha256, afterCheckpointSha256: input.after.checkpointSha256,
    beforeSemanticSha256: input.before.semanticSha256, afterSemanticSha256: input.after.semanticSha256,
    beforeSourceSha256: input.expectedBefore.sha256, afterSourceSha256: input.expectedAfter.sha256,
    comparisonBeforeSemanticSha256: comparisonBefore.semanticSha256, comparisonAfterSemanticSha256: comparisonAfter.semanticSha256,
    differences, materializedCanvas, frameOrderInitializations, newWireCreationOrders: newWireOrders };
  return { ok: true, schema: "easyeda-pro-control.schematic-storage-persistence.v1", targetUuid: before.uuid,
    scope: "all-materialized-selected-branch-documents", documentCount: input.before.documents.length, ...scope, scopeSha256: sha256Json(scope), comparison };
}
