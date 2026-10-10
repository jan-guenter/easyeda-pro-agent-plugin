import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import type { NativeDocumentHeaderHistory, NativeDocumentSnapshot, NativeHistorySnapshot } from "./native-history.ts";
import { isNativeDocumentDeleted } from "./native-history.ts";
import type { NativeSourceObject, NativeSourceSnapshot } from "./document-source.ts";
import { parseDocumentSource } from "./document-source.ts";
import { schematicNonDrawingStoredAttributes } from "./schematic-lifecycle.ts";
import { normalizeSchematicNativeSnapshot } from "./schematic-native-adapter.ts";

type RecordValue = Record<string, unknown>;
const HASH = /^[a-f0-9]{64}$/u;
const VOLATILE_METADATA = new Set(["client", "updateTime", "version"]);
function equal(left: unknown, right: unknown): boolean { return canonicalJson(left) === canonicalJson(right); }

function jsonChildren(entry: object): readonly unknown[] {
  const result: unknown[] = [];
  const descriptors = Object.getOwnPropertyDescriptors(entry);
  for (const [key, descriptor] of Object.entries(descriptors)) {
    if (!(Array.isArray(entry) && key === "length")) {
      if (["__proto__", "constructor", "prototype"].includes(key) || !Object.hasOwn(descriptor, "value") || descriptor.enumerable !== true ||
          (Array.isArray(entry) && (!/^(?:0|[1-9][0-9]*)$/u.test(key) || Number(key) >= entry.length))) {
        throw new Error("Persistence input contains unsupported JSON properties.");
      }
      result.push(descriptor.value as unknown);
    }
  }
  if (Array.isArray(entry) && Object.keys(descriptors).length !== entry.length + 1) {
    throw new Error("Persistence input contains sparse or extended arrays.");
  }
  return result;
}

/** Reject values canonical JSON would silently omit, coerce or execute. */
function validateJson(value: unknown, maximumNodes = 500_000): void {
  const pending = [{ value, depth: 0 }];
  let nodes = 0;
  while (pending.length > 0) {
    const item = pending.pop();
    nodes += 1;
    if (item === undefined || item.depth > 64 || nodes > maximumNodes) { throw new Error("Persistence JSON exceeds its reviewed bounds."); }
    const entry = item.value;
    const scalar = entry === null || typeof entry === "string" || typeof entry === "boolean" || (typeof entry === "number" && Number.isFinite(entry));
    if (!scalar) {
      if (typeof entry !== "object" || entry === null ||
        (!Array.isArray(entry) && Object.getPrototypeOf(entry) !== Object.prototype && Object.getPrototypeOf(entry) !== null) ||
          Object.getOwnPropertySymbols(entry).length > 0) { throw new Error("Persistence input is not exact JSON."); }
      pending.push(...jsonChildren(entry).map((child) => ({ value: child, depth: item.depth + 1 })));
    }
  }
}
function requireHash(value: string): void {
  if (!HASH.test(value)) { throw new Error("Persistence hash is malformed."); }
}
function objectMap<T extends { readonly id: string; readonly type: string; readonly body: RecordValue }>(objects: readonly T[]): Map<string, T> {
  const result = new Map<string, T>();
  for (const object of objects) {
    if (typeof object.id !== "string" || object.id.length === 0 || result.has(object.id) ||
        typeof object.type !== "string" || object.type.length === 0 || !isRecord(object.body)) {
      throw new Error("Persistence record identity is missing or duplicated.");
    }
    result.set(object.id, object);
  }
  return result;
}
function semanticRecord(object: { readonly type: string; readonly body: RecordValue }): RecordValue {
  return { type: object.type, body: object.body };
}
type HiddenAttribute = ReturnType<typeof schematicNonDrawingStoredAttributes>[number];
type OrderProjection = ReadonlyMap<string, HiddenAttribute>;
interface AttributeOrderDifference {
  readonly id: string;
  readonly parentId: string;
  readonly key: string;
  readonly comparison: "baseline-durable-source" | "before-durable-source" | "after-durable-source" | "source-before-after" | "durable-before-after";
  readonly beforeZIndex: number;
  readonly afterZIndex: number;
}
function hiddenAttributes(source: NativeSourceSnapshot, nativeInput: unknown): Map<string, HiddenAttribute> {
  if (source.document["docType"] !== "SCH_PAGE") { throw new Error("Schematic attribute evidence cannot normalize another document family."); }
  const native = normalizeSchematicNativeSnapshot(nativeInput);
  if (parseDocumentSource(native.source).sha256 !== source.sha256) { throw new Error("Schematic attribute evidence is not bound to the exact source."); }
  const records = objectMap(source.objects);
  const result = new Map<string, HiddenAttribute>();
  for (const attribute of schematicNonDrawingStoredAttributes(native)) {
    const record = records.get(attribute.id);
    if (result.has(attribute.id) || attribute.sourceSha256 !== source.sha256 || record === undefined ||
        record.type !== "ATTR" || sha256Json(record.body) !== attribute.bodySha256) {
      throw new Error("Schematic attribute evidence does not identify an exact stored source record.");
    }
    result.set(attribute.id, attribute);
  }
  return result;
}
function matchesHiddenAttribute(record: NativeSourceObject | undefined, attribute: HiddenAttribute): boolean {
  return record !== undefined && record.id === attribute.id && record.type === "ATTR" &&
    record.body["parentId"] === attribute.parentId && record.body["key"] === attribute.key &&
    record.body["x"] === null && record.body["y"] === null &&
    typeof record.body["zIndex"] === "number" && Number.isSafeInteger(record.body["zIndex"]) && record.body["zIndex"] >= 0;
}
/** Comparison copies only: raw source and checkpoint commitments remain intact. */
function projectOrder(record: NativeSourceObject, projection: OrderProjection): NativeSourceObject {
  const attribute = projection.get(record.id);
  return attribute === undefined ? record : { ...record, body: { ...record.body, zIndex: attribute.zIndex } };
}
function orderDifferences(projection: OrderProjection, before: ReadonlyMap<string, NativeSourceObject>,
  after: ReadonlyMap<string, NativeSourceObject>, comparison: AttributeOrderDifference["comparison"]): AttributeOrderDifference[] {
  return [...projection.values()].flatMap((attribute) => {
    const left = before.get(attribute.id)?.body["zIndex"];
    const right = after.get(attribute.id)?.body["zIndex"];
    return typeof left === "number" && typeof right === "number" && left !== right ?
      [{ id: attribute.id, parentId: attribute.parentId, key: attribute.key, comparison, beforeZIndex: left, afterZIndex: right }] : [];
  });
}
function persistenceOrderProjection(input: {
  readonly beforeNative?: unknown; readonly afterNative?: unknown;
  readonly expectedBefore: NativeSourceSnapshot; readonly expectedAfter: NativeSourceSnapshot;
}, before: NativeDocumentSnapshot, after: NativeDocumentSnapshot): Map<string, HiddenAttribute> {
  if (input.beforeNative === undefined && input.afterNative === undefined) { return new Map(); }
  if (input.beforeNative === undefined || input.afterNative === undefined) { throw new Error("Schematic persistence requires both native evidence snapshots."); }
  const oldEligible = hiddenAttributes(input.expectedBefore, input.beforeNative);
  const newEligible = hiddenAttributes(input.expectedAfter, input.afterNative);
  const oldSource = objectMap(input.expectedBefore.objects);
  const oldDurable = objectMap(before.records);
  const newSource = objectMap(input.expectedAfter.objects);
  const newDurable = objectMap(after.records);
  const projection = new Map<string, HiddenAttribute>();
  for (const [id, attribute] of newEligible) {
    const prior = oldEligible.get(id);
    const wasAbsent = !oldSource.has(id) && !oldDurable.has(id);
    const samePrior = prior !== undefined && prior.parentId === attribute.parentId && prior.key === attribute.key &&
      matchesHiddenAttribute(oldSource.get(id), prior) && matchesHiddenAttribute(oldDurable.get(id), prior);
    if ((wasAbsent || samePrior) && matchesHiddenAttribute(newSource.get(id), attribute) && matchesHiddenAttribute(newDurable.get(id), attribute)) {
      projection.set(id, prior ?? attribute);
    }
  }
  return projection;
}
function validateCheckpoint(snapshot: NativeHistorySnapshot): Map<string, NativeDocumentSnapshot> {
  // Whole projects include library documents; their bounded history can exceed
  // A single source document's node budget without excessive depth or size.
  validateJson(snapshot, 2_000_000);
  requireHash(snapshot.checkpointSha256);
  requireHash(snapshot.semanticSha256);
  if (snapshot.profile !== "easyeda.native-history.linear-gcm-gzip.v1" ||
      !/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/u.test(snapshot.projectUuid) ||
      !/^[a-f0-9]{32}$/u.test(snapshot.branchUuid) || !/^[a-f0-9]{32}$/u.test(snapshot.headHistoryUuid) ||
      !Number.isSafeInteger(snapshot.historyRowCount) || snapshot.historyRowCount < 1 || snapshot.historyRowCount > 4096 ||
      !Number.isSafeInteger(snapshot.chunkCount) || snapshot.chunkCount < snapshot.historyRowCount ||
      !Number.isSafeInteger(snapshot.plaintextBytes) || snapshot.plaintextBytes < 1 || snapshot.documents.length === 0) {
    throw new Error("Persistence checkpoint profile or identity is unsupported.");
  }
  const documents = new Map<string, NativeDocumentSnapshot>();
  for (const document of snapshot.documents) {
    if (typeof document.uuid !== "string" || document.uuid.length === 0 || documents.has(document.uuid) ||
        typeof document.docType !== "string" || document.docType.length === 0 ||
        document.metadata["uuid"] !== document.uuid || document.metadata["docType"] !== document.docType) {
      throw new Error("Persistence document identity is inconsistent or duplicated.");
    }
    objectMap(document.records);
    requireHash(document.semanticSha256);
    const projection = { uuid: document.uuid, docType: document.docType, metadata: document.metadata,
      records: document.records.map(({ id, type, body }) => ({ id, type, body })) };
    if (sha256Json(projection) !== document.semanticSha256) { throw new Error("Persistence document semantic hash does not match its contents."); }
    documents.set(document.uuid, document);
  }
  const projection = snapshot.documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }));
  if (sha256Json(projection) !== snapshot.semanticSha256) { throw new Error("Persistence checkpoint semantic hash does not match its documents."); }
  return documents;
}
/** FileSource in pinned PCB 3.2.149 constructs Wk(uuid), whose DOCHEAD is
 * always PCB, even for the separately scoped footprint editor. The durable
 * library keeps FOOTPRINT. Preserve both raw headers and all hash inputs.
 */
function isFootprintExport(source: NativeSourceSnapshot, document: NativeDocumentSnapshot): boolean {
  return source.document["docType"] === "PCB" && document.docType === "FOOTPRINT" &&
    source.document["uuid"] === document.uuid && source.document["editVersion"] === "3.2.149.88089769";
}
function validateSource(source: NativeSourceSnapshot, documents: ReadonlyMap<string, NativeDocumentSnapshot>): NativeDocumentSnapshot {
  validateJson(source);
  requireHash(source.sha256);
  const uuid = source.document["uuid"];
  const document = typeof uuid === "string" ? documents.get(uuid) : undefined;
  if (source.schema !== "easyeda-pro-control.document-source.v1" || document === undefined || isNativeDocumentDeleted(document) ||
      (source.document["docType"] !== document.docType && !isFootprintExport(source, document))) {
    throw new Error("Persistence source identities disagree.");
  }
  objectMap(source.objects);
  if (sha256Json({ schema: source.schema, document: source.document, objects: source.objects }) !== source.sha256) {
    throw new Error("Persistence source hash does not match its contents.");
  }
  // Export omits user metadata; it is still compared in the durable pair.
  for (const key of Object.keys(source.document)) {
    const footprintHeader = key === "docType" && isFootprintExport(source, document);
    if (!footprintHeader && (VOLATILE_METADATA.has(key) || !Object.hasOwn(document.metadata, key) || !equal(source.document[key], document.metadata[key]))) {
      throw new Error("Source and durable document metadata disagree.");
    }
  }
  return document;
}
function sameField(left: RecordValue, right: RecordValue, field: string): boolean {
  return Object.hasOwn(left, field) === Object.hasOwn(right, field) && equal({ value: left[field] }, { value: right[field] });
}
function changedFields(before: RecordValue, after: RecordValue): readonly string[] {
  return [...new Set([...Object.keys(before), ...Object.keys(after)])].filter((field) => !sameField(before, after, field)).toSorted();
}
// Keep the readonly header type; Array.isArray's predicate otherwise widens it to any[].
function headerArray(value: unknown): boolean { return Array.isArray(value); }
function checkedHeaderHistory(document: NativeDocumentSnapshot, checkpointSha256: string): NativeDocumentHeaderHistory {
  const proof = document.headerHistory;
  if (proof === undefined || proof.profile !== "easyeda.native-history.schematic-header-lineage.v1" ||
      proof.checkpointSha256 !== checkpointSha256 || proof.documentUuid !== document.uuid || document.docType !== "SCH_PAGE" ||
      Object.keys(proof).toSorted().join(",") !== "checkpointSha256,documentUuid,headers,profile,sha256" ||
      !headerArray(proof.headers) || proof.headers.length === 0 || proof.headers.length > 4096) {
    throw new Error("Schematic user restoration lacks checkpoint-bound header history.");
  }
  const { sha256, ...projection } = proof;
  requireHash(sha256);
  if (sha256Json(projection) !== sha256) { throw new Error("Schematic header history digest disagrees."); }
  let ticket = -1;
  for (const header of proof.headers) {
    if (Object.keys(header).toSorted().join(",") !== "metadata,ticket" || !Number.isSafeInteger(header.ticket) || header.ticket <= ticket ||
        !isRecord(header.metadata) || header.metadata["docType"] !== document.docType || header.metadata["uuid"] !== document.uuid) {
      throw new Error("Schematic header history has ambiguous clocks or identity.");
    }
    ticket = header.ticket;
  }
  if (!equal(proof.headers.at(-1)?.metadata, document.metadata)) { throw new Error("Schematic header history does not end at the captured metadata."); }
  return proof;
}
function validNativeMetadata(metadata: RecordValue): boolean {
  const time = metadata["updateTime"];
  return typeof metadata["client"] === "string" && /^[a-f0-9]{16}$/u.test(metadata["client"]) &&
    typeof time === "number" && Number.isSafeInteger(time) && time >= 0 && metadata["version"] === String(time);
}
function saneHeaderUser(user: unknown): user is RecordValue {
  if (!isRecord(user) || Object.keys(user).toSorted().join(",") !== "avatar,nickname,username,uuid" ||
      typeof user["uuid"] !== "string" || !/^[a-f0-9]{32}$/u.test(user["uuid"])) { return false; }
  return ["nickname", "username", "avatar"].every((key) => {
    const value = user[key];
    // oxlint-disable-next-line eslint/no-control-regex -- Header identity text must contain no control characters.
    return typeof value === "string" && value.length <= (key === "avatar" ? 2048 : 128) && (key === "avatar" || value.trim().length > 0) && !/[\u0000-\u001F\u007F]/u.test(value);
  });
}
/** Pinned SCH 3.2.149 Save calls projectWorker/setCanvas; project-worker
 * 3.2.148.154949d9 saveCanvas passes user:this.user to asyncCompressFull.
 * Tree metadata edits can omit it. Admit only restoration of this target's
 * latest earlier exact user, derived from the hash-verified BEFORE checkpoint.
 * Neither peers nor the supplied after-user are authority for that value.
 */
function schematicUserRestoration(previous: NativeDocumentSnapshot, current: NativeDocumentSnapshot,
  beforeCheckpointSha256: string, afterCheckpointSha256: string): RecordValue {
  const before = previous.metadata;
  const after = current.metadata;
  if (previous.docType !== "SCH_PAGE" || current.docType !== "SCH_PAGE" || Object.hasOwn(before, "user") ||
      !Object.hasOwn(after, "user") || !saneHeaderUser(after["user"]) ||
      before["editVersion"] !== "3.2.149.88089769" || after["editVersion"] !== before["editVersion"] ||
      !validNativeMetadata(before) || !validNativeMetadata(after) || Number(after["updateTime"]) <= Number(before["updateTime"])) {
    throw new Error("Saved schematic user metadata is not an exact historical restoration.");
  }
  const oldHistory = checkedHeaderHistory(previous, beforeCheckpointSha256);
  const newHistory = checkedHeaderHistory(current, afterCheckpointSha256);
  if (newHistory.headers.length <= oldHistory.headers.length ||
      !equal(newHistory.headers.slice(0, oldHistory.headers.length), oldHistory.headers)) {
    throw new Error("Restored user lacks the original linear document-header prefix.");
  }
  const originalIndex = oldHistory.headers.findLastIndex((header) => Object.hasOwn(header.metadata, "user"));
  const original = oldHistory.headers[originalIndex];
  if (original === undefined || !saneHeaderUser(original.metadata["user"]) || !equal(original.metadata["user"], after["user"])) {
    throw new Error("Restored user differs from the latest original target header.");
  }
  let updateTime = -1;
  for (const [offset, header] of newHistory.headers.slice(originalIndex).entries()) {
    const index = originalIndex + offset;
    const metadata = header.metadata;
    const absent = index > originalIndex && index < oldHistory.headers.length;
    if (!validNativeMetadata(metadata) || Number(metadata["updateTime"]) <= updateTime ||
        metadata["editVersion"] !== "3.2.149.88089769" ||
        changedFields(before, metadata).some((field) => field !== "user" && !VOLATILE_METADATA.has(field)) ||
        (absent ? Object.hasOwn(metadata, "user") : !equal(metadata["user"], original.metadata["user"]))) {
      throw new Error("Schematic user restoration crosses an altered or ambiguous header.");
    }
    updateTime = Number(metadata["updateTime"]);
  }
  return { profile: "easyeda-pro-control.schematic-header-user-restoration.v1", documentUuid: previous.uuid,
    beforeCheckpointSha256, afterCheckpointSha256, originalHeaderTicket: original.ticket,
    omittedHeaderTicket: oldHistory.headers.at(-1)?.ticket, restoredHeaderTicket: newHistory.headers.at(-1)?.ticket,
    beforeHeaderHistorySha256: oldHistory.sha256, afterHeaderHistorySha256: newHistory.sha256,
    restoredUserSha256: sha256Json(original.metadata["user"]), originalHeaderSha256: sha256Json(original.metadata) };
}
function verifyTargetMetadata(previous: NativeDocumentSnapshot, current: NativeDocumentSnapshot,
  beforeCheckpointSha256: string, afterCheckpointSha256: string): RecordValue | undefined {
  const before = previous.metadata;
  const after = current.metadata;
  const fields = changedFields(before, after);
  if (fields.some((field) => field !== "user" && !VOLATILE_METADATA.has(field))) { throw new Error("Saved document metadata changed outside the intended edit."); }
  if (fields.includes("user")) { return schematicUserRestoration(previous, current, beforeCheckpointSha256, afterCheckpointSha256); }
  if (fields.length === 0) { return undefined; }
  // Imported library version strings may differ. Only changed target edit
  // Headers must match the observed native tuple; unchanged values are retained.
  const time = after["updateTime"];
  if (!validNativeMetadata(after) || typeof time !== "number" ||
      (typeof before["updateTime"] === "number" && time < before["updateTime"])) {
    throw new Error("Changed native edit metadata has an unsupported shape.");
  }
  return undefined;
}
export interface DesignBaselineTarget {
  readonly id: string;
  /** Empty means identity only, never every field or a clean-unsaved claim. */
  readonly fields: readonly string[];
}

/** Derive prewrite field checks from the compiler's complete expected source,
 * including moved component attributes. New identities have no durable before
 * value; removals and type replacements require the entire former record.
 */
export function deriveDesignBaselineTargets(before: NativeSourceSnapshot, expectedAfter: NativeSourceSnapshot): readonly DesignBaselineTarget[] {
  for (const snapshot of [before, expectedAfter]) {
    validateJson(snapshot);
    requireHash(snapshot.sha256);
    if (snapshot.schema !== "easyeda-pro-control.document-source.v1" ||
        sha256Json({ schema: snapshot.schema, document: snapshot.document, objects: snapshot.objects }) !== snapshot.sha256) {
      throw new Error("Baseline derivation source hash is invalid.");
    }
  }
  if (!equal(before.document, expectedAfter.document)) { throw new Error("Baseline derivation cannot change document metadata."); }
  const prior = objectMap(before.objects);
  const next = objectMap(expectedAfter.objects);
  return [...prior.values()].flatMap((record) => {
    const after = next.get(record.id);
    if (after === undefined || after.type !== record.type) { return [{ id: record.id, fields: Object.keys(record.body).toSorted() }]; }
    const fields = changedFields(record.body, after.body);
    return fields.length === 0 ? [] : [{ id: record.id, fields }];
  }).toSorted((left, right) => left.id.localeCompare(right.id));
}

/** Prove compiler-selected existing fields before write and retain the complete
 * checkpoint for commit comparison. Visibility differences are not proof that
 * the whole live editor has no unsaved edits.
 */
export function verifyDesignBaseline(input: {
  readonly checkpoint: NativeHistorySnapshot;
  readonly source: NativeSourceSnapshot;
  readonly targets: readonly DesignBaselineTarget[];
  readonly native?: unknown;
}): RecordValue {
  const documents = validateCheckpoint(input.checkpoint);
  const document = validateSource(input.source, documents);
  const durable = objectMap(document.records);
  const source = objectMap(input.source.objects);
  const orderProjection = new Map<string, HiddenAttribute>();
  if (input.native !== undefined) {
    for (const [id, attribute] of hiddenAttributes(input.source, input.native)) {
      if (matchesHiddenAttribute(durable.get(id), attribute) && matchesHiddenAttribute(source.get(id), attribute)) {
        orderProjection.set(id, attribute);
      }
    }
  }
  const targetIds = new Set<string>();
  for (const target of input.targets) {
    const previous = durable.get(target.id);
    const live = source.get(target.id);
    if (targetIds.has(target.id) || previous === undefined || live === undefined || previous.type !== live.type ||
        new Set(target.fields).size !== target.fields.length || target.fields.some((field) => typeof field !== "string" || field.length === 0 ||
          !sameField(projectOrder(previous, orderProjection).body, projectOrder(live, orderProjection).body, field))) {
      throw new Error("Intended target baseline is absent, ambiguous or differs from durable state.");
    }
    targetIds.add(target.id);
  }
  return { ok: true, schema: "easyeda-pro-control.design-baseline.v1", targetUuid: document.uuid,
    checkpointSha256: input.checkpoint.checkpointSha256, checkpointSemanticSha256: input.checkpoint.semanticSha256,
    sourceSha256: input.source.sha256, scope: "selected-target-fields-not-whole-editor-cleanliness",
    sourceDocumentType: input.source.document["docType"], durableDocumentType: document.docType,
    schematicAttributeOrderDifferences: orderDifferences(orderProjection, durable, source, "baseline-durable-source"),
    targets: input.targets, documentCount: documents.size,
    exportOnlyCount: input.source.objects.filter((object) => !durable.has(object.id)).length,
    durableOnlyCount: document.records.filter((object) => !source.has(object.id)).length,
    representationDifferenceCount: document.records.filter((object) => {
      const live = source.get(object.id);
      return live !== undefined && !equal(semanticRecord(object), semanticRecord(live));
    }).length };
}
function verifyChangedRecord(before: NativeSourceObject, after: NativeSourceObject,
  sourceBefore: NativeSourceObject, sourceAfter: NativeSourceObject): void {
  if (before.type !== sourceBefore.type || after.type !== sourceAfter.type) { throw new Error("Intended record type does not match durable state."); }
  const intendedFields = new Set(changedFields(sourceBefore.body, sourceAfter.body));
  if (changedFields(before.body, after.body).some((field) => !intendedFields.has(field))) {
    throw new Error("A durable record field changed outside the intended source delta.");
  }
  for (const field of intendedFields) {
    if (!sameField(before.body, sourceBefore.body, field) || !sameField(after.body, sourceAfter.body, field)) {
      throw new Error("Intended durable field does not match captured source values.");
    }
  }
}
function verifyTargetRecords(previous: NativeDocumentSnapshot, current: NativeDocumentSnapshot,
  expectedBefore: NativeSourceSnapshot, expectedAfter: NativeSourceSnapshot, projection: OrderProjection): void {
  const oldSource = objectMap(expectedBefore.objects.map((record) => projectOrder(record, projection)));
  const newSource = objectMap(expectedAfter.objects.map((record) => projectOrder(record, projection)));
  const oldDurable = objectMap(previous.records.map((record) => projectOrder(record, projection)));
  const newDurable = objectMap(current.records.map((record) => projectOrder(record, projection)));
  const changed = new Set([...oldSource.keys(), ...newSource.keys()].filter((id) => {
    const before = oldSource.get(id);
    const after = newSource.get(id);
    return before === undefined || after === undefined || !equal(before, after);
  }));
  for (const id of new Set([...oldDurable.keys(), ...newDurable.keys()])) {
    const before = oldDurable.get(id);
    const after = newDurable.get(id);
    if (!changed.has(id) && (before === undefined || after === undefined || !equal(semanticRecord(before), semanticRecord(after)))) {
      throw new Error("An unchanged or export-invisible durable record changed during save.");
    }
  }
  for (const id of changed) {
    const before = oldDurable.get(id);
    const after = newDurable.get(id);
    const sourceBefore = oldSource.get(id);
    const sourceAfter = newSource.get(id);
    if (sourceAfter === undefined) {
      if (after !== undefined) { throw new Error("Deleted record remains in durable storage."); }
    } else {
      if (after === undefined) { throw new Error("An intended native record is absent from durable storage."); }
      if (sourceBefore === undefined || before === undefined) {
        if ((sourceBefore === undefined && before !== undefined) || !equal(semanticRecord(after), semanticRecord(sourceAfter))) {
          throw new Error("Created durable record does not match the exact reopened source.");
        }
      } else {
        verifyChangedRecord(before, after, sourceBefore, sourceAfter);
      }
    }
  }
}
/** Compare all documents materialized from the selected native history branch.
 * Input source delta must already be authorized by the typed operation proof.
 * This does not prove unselected branches, non-history SQLite tables, history
 * ancestry or file hashes: readNativeHistoryCheckpoint owns file verification.
 */
export function verifyDesignPersistence(input: {
  readonly before: NativeHistorySnapshot;
  readonly after: NativeHistorySnapshot;
  readonly expectedBefore: NativeSourceSnapshot;
  readonly expectedAfter: NativeSourceSnapshot;
  readonly beforeNative?: unknown;
  readonly afterNative?: unknown;
}): RecordValue {
  const beforeDocuments = validateCheckpoint(input.before);
  const afterDocuments = validateCheckpoint(input.after);
  const previousTarget = validateSource(input.expectedBefore, beforeDocuments);
  const currentTarget = validateSource(input.expectedAfter, afterDocuments);
  if (input.before.projectUuid !== input.after.projectUuid || input.before.branchUuid !== input.after.branchUuid ||
      !equal(input.expectedBefore.document, input.expectedAfter.document) || previousTarget.uuid !== currentTarget.uuid) {
    throw new Error("Persistence source or selected project/branch identities disagree.");
  }
  if (!equal([...beforeDocuments.keys()].toSorted(), [...afterDocuments.keys()].toSorted())) {
    throw new Error("A document or library identity changed outside this transaction.");
  }
  const projection = persistenceOrderProjection(input, previousTarget, currentTarget);
  const oldSource = objectMap(input.expectedBefore.objects);
  const newSource = objectMap(input.expectedAfter.objects);
  const oldDurable = objectMap(previousTarget.records);
  const newDurable = objectMap(currentTarget.records);
  const schematicAttributeOrderDifferences = [
    ...orderDifferences(projection, oldDurable, oldSource, "before-durable-source"),
    ...orderDifferences(projection, newDurable, newSource, "after-durable-source"),
    ...orderDifferences(projection, oldSource, newSource, "source-before-after"),
    ...orderDifferences(projection, oldDurable, newDurable, "durable-before-after"),
  ];
  const schematicMetadataUserRestoration = verifyTargetMetadata(previousTarget, currentTarget,
    input.before.checkpointSha256, input.after.checkpointSha256);
  for (const [uuid, previous] of beforeDocuments) {
    const current = afterDocuments.get(uuid);
    if (current === undefined || previous.docType !== current.docType) { throw new Error("Saved document identity changed."); }
    if (uuid === previousTarget.uuid) {
      verifyTargetRecords(previous, current, input.expectedBefore, input.expectedAfter, projection);
    } else if (previous.semanticSha256 !== current.semanticSha256) {
      throw new Error("Another document or library metadata/record changed during save.");
    }
  }
  const scope = { profile: input.before.profile, projectUuid: input.before.projectUuid, branchUuid: input.before.branchUuid,
    beforeSemanticSha256: input.before.semanticSha256, afterSemanticSha256: input.after.semanticSha256,
    beforeCheckpointSha256: input.before.checkpointSha256, afterCheckpointSha256: input.after.checkpointSha256,
    beforeSourceSha256: input.expectedBefore.sha256, afterSourceSha256: input.expectedAfter.sha256,
    sourceDocumentType: input.expectedAfter.document["docType"], durableDocumentType: currentTarget.docType,
    schematicAttributeOrderDifferences,
    ...(schematicMetadataUserRestoration === undefined ? {} : { schematicMetadataUserRestoration }) };
  return { ok: true, schema: "easyeda-pro-control.design-persistence.v1", targetUuid: previousTarget.uuid, ...scope,
    scope: "all-materialized-selected-branch-documents", documentCount: beforeDocuments.size, scopeSha256: sha256Json(scope) };
}
