import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import { verifyDesignBaseline, verifyDesignPersistence } from "./design-persistence.ts";
import type { NativeSourceSnapshot } from "./document-source.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot, NativeObjectSnapshot } from "./native-history.ts";

type Input = Parameters<typeof verifyDesignPersistence>[0];
interface Conversion { readonly id: string; readonly type: string; readonly fields: readonly string[]; readonly beforeBodySha256: string; readonly afterBodySha256: string; }
const equal = (left: unknown, right: unknown): boolean => canonicalJson(left) === canonicalJson(right);

function target(history: NativeHistorySnapshot, source: NativeSourceSnapshot): NativeDocumentSnapshot {
  const document = history.documents.find((entry) => entry.uuid === source.document["uuid"]);
  if (document?.docType !== "SYMBOL" || source.document["docType"] !== "SYMBOL" || source.document["editVersion"] !== "3.2.149.88089769") {
    throw new Error("Symbol storage conversion requires the exact reviewed symbol profile.");
  }
  return document;
}

/** Pinned sch.js imports legacy ATTR version 2.0, resolves an empty parent to
 * its named PART, and re-encodes model fields without the old version marker.
 * setCommonPropsForConsistencyManager omits groupId when no group owns a model.
 * Only observed forward conversions of existing ATTR/PIN records are admitted.
 */
function convertedRecord(record: NativeObjectSnapshot, after: NativeDocumentSnapshot, input: Input, partId: string): {
  readonly record: NativeObjectSnapshot; readonly effect?: Conversion;
} {
  const next = after.records.find((entry) => entry.id === record.id);
  const source = input.expectedBefore.objects.find((entry) => entry.id === record.id);
  const sourceAfter = input.expectedAfter.objects.find((entry) => entry.id === record.id);
  if (!["ATTR", "PIN"].includes(record.type) || next === undefined || source === undefined || sourceAfter === undefined ||
      next.type !== record.type || source.type !== record.type || sourceAfter.type !== record.type || record.body["partId"] !== partId) { return { record }; }
  let body = { ...record.body };
  const fields: string[] = [];
  for (const [field, legacy] of [["groupId", ""], ...(record.type === "ATTR" ? [["version", "2.0"]] : [])] as const) {
    if (field !== undefined && body[field] === legacy && !Object.hasOwn(next.body, field) && !Object.hasOwn(source.body, field) && !Object.hasOwn(sourceAfter.body, field)) {
      body = Object.fromEntries(Object.entries(body).filter(([key]) => key !== field)); fields.push(field);
    }
  }
  if (record.type === "ATTR" && body["parentId"] === "" && source.body["parentId"] === partId &&
      sourceAfter.body["parentId"] === partId && next.body["parentId"] === partId) {
    body["parentId"] = partId; fields.push("parentId");
  }
  if (fields.length === 0) { return { record }; }
  // Complete old model equality is required after the known encoding changes;
  // This cannot conceal coordinates, visibility, values, style or foreign data.
  if (!equal(body, source.body)) { throw new Error("Symbol legacy conversion disagrees with the complete captured model."); }
  return { record: { ...record, body }, effect: { id: record.id, type: record.type, fields: fields.toSorted(),
    beforeBodySha256: sha256Json(record.body), afterBodySha256: sha256Json(body) } };
}

function insertedUserStamp(before: NativeDocumentSnapshot, after: NativeDocumentSnapshot, history: NativeHistorySnapshot): {
  readonly metadata: NativeDocumentSnapshot["metadata"]; readonly evidence: Record<string, unknown> | null;
} {
  if (Object.hasOwn(before.metadata, "user") || !Object.hasOwn(after.metadata, "user")) { return { metadata: before.metadata, evidence: null }; }
  const user = after.metadata["user"];
  if (!isRecord(user) || !equal(Object.keys(user).toSorted(), ["avatar", "nickname", "username", "uuid"]) ||
      typeof user["uuid"] !== "string" || !/^[a-f0-9]{32}$/u.test(user["uuid"]) || user["uuid"] !== history.projectOwnerUuid ||
      ["avatar", "nickname", "username"].some((key) => typeof user[key] !== "string")) { throw new Error("Unreviewed symbol user-stamp identity."); }
  const anchors = history.documents.filter((document) => document.uuid !== before.uuid && isRecord(document.metadata["user"]) && document.metadata["user"]["uuid"] === user["uuid"]);
  if (anchors.length === 0 || anchors.some((document) => !equal(document.metadata["user"], user))) { throw new Error("Symbol user stamp lacks unambiguous same-owner baseline evidence."); }
  // Native W2 emits its supplied user verbatim. This permits insertion of the
  // Already proved project user only, never replacement of existing metadata.
  return { metadata: { ...before.metadata, user }, evidence: { field: "user", beforePresent: false,
    afterSha256: sha256Json(user), ownerUuid: user["uuid"], baselineDocumentIds: anchors.map((document) => document.uuid).toSorted() } };
}

/** Full-project proof with explicit comparison-only symbol encoding conversion.
 * Raw checkpoint/source commitments and every conversion remain in the result.
 * Unrelated delayed writes in another document are still rejected.
 */
export function verifySymbolPersistence(input: Input): Record<string, unknown> {
  verifyDesignBaseline({ checkpoint: input.before, source: input.expectedBefore, targets: [] });
  verifyDesignBaseline({ checkpoint: input.after, source: input.expectedAfter, targets: [] });
  if (input.before.projectOwnerUuid !== input.after.projectOwnerUuid) { throw new Error("Symbol persistence project owner changed."); }
  const before = target(input.before, input.expectedBefore);
  const after = target(input.after, input.expectedAfter);
  const parts = input.expectedBefore.objects.filter((entry) => entry.type === "PART");
  if (parts.length !== 1 || parts[0] === undefined) { throw new Error("Symbol storage conversion requires one exact PART."); }
  const partId = parts[0].id;
  const converted = before.records.map((record) => convertedRecord(record, after, input, partId));
  const { metadata, evidence: userStamp } = insertedUserStamp(before, after, input.before);
  const records = converted.map((entry) => entry.record);
  const replacement = { ...before, metadata, records, semanticSha256: sha256Json({ uuid: before.uuid, docType: before.docType, metadata,
    records: records.map(({ id, type, body }) => ({ id, type, body })) }) };
  const documents = input.before.documents.map((document) => document.uuid === before.uuid ? replacement : document);
  const projected = { ...input.before, documents, semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
  const comparison = verifyDesignPersistence({ ...input, before: projected });
  const scope = { beforeCheckpointSha256: input.before.checkpointSha256, afterCheckpointSha256: input.after.checkpointSha256,
    beforeSemanticSha256: input.before.semanticSha256, afterSemanticSha256: input.after.semanticSha256,
    beforeSourceSha256: input.expectedBefore.sha256, afterSourceSha256: input.expectedAfter.sha256,
    comparisonBeforeSemanticSha256: projected.semanticSha256, conversions: converted.flatMap((entry) => entry.effect === undefined ? [] : [entry.effect]), userStamp };
  return { ok: true, schema: "easyeda-pro-control.symbol-persistence.v1", targetUuid: before.uuid,
    scope: "all-materialized-selected-branch-documents", documentCount: input.before.documents.length, ...scope,
    scopeSha256: sha256Json(scope), comparison };
}
