import { canonicalJson, isRecord, sha256Json } from "./core.ts";
import { deriveDesignBaselineTargets, verifyDesignBaseline, verifyDesignPersistence } from "./design-persistence.ts";
import type { DesignBaselineTarget } from "./design-persistence.ts";
import type { NativeSourceSnapshot } from "./document-source.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { expectedNativeEmptyNetDefault } from "./native-empty-net-default.ts";
import { projectFootprintPadHistory } from "./footprint-pad-persistence.ts";

const SELECTOR = '["RULE_SELECTOR",["NET",""]]';
const NET = '["NET",""]';
const DEFAULT_NET = { netType: null, specialColor: null, retLine: true, differentialName: null, isPositiveNet: false, equalLengthGroupName: null };

function footprint(source: NativeSourceSnapshot, checkpoint: NativeHistorySnapshot): NativeHistorySnapshot["documents"][number] {
  const document = checkpoint.documents.find((entry) => entry.uuid === source.document["uuid"]);
  if (source.document["docType"] !== "PCB" || source.document["editVersion"] !== "3.2.149.88089769" || document?.docType !== "FOOTPRINT") { throw new Error("Empty-net storage projection requires the reviewed footprint editor and durable asset."); }
  return document;
}

function exportOnlySelector(before: NativeSourceSnapshot, after: NativeSourceSnapshot, checkpoint: NativeHistorySnapshot): boolean {
  const document = footprint(before, checkpoint);
  // The generic validator checks the complete checkpoint and source hashes.
  // Run source derivation here as well before using the intended record delta.
  deriveDesignBaselineTargets(before, after);
  const previous = before.objects.find((record) => record.id === SELECTOR);
  const next = after.objects.find((record) => record.id === SELECTOR);
  if (previous === undefined && next === undefined) { return false; }
  const expected = expectedNativeEmptyNetDefault(before).objects.find((record) => record.id === SELECTOR);
  if (canonicalJson(next) !== canonicalJson(expected) && canonicalJson(next) !== canonicalJson(previous)) { throw new Error("Unreviewed footprint empty-net selector effect."); }
  return document.records.every((record) => record.id !== SELECTOR);
}

function omit(source: NativeSourceSnapshot, ids: ReadonlySet<string>): NativeSourceSnapshot {
  const base = { schema: source.schema, document: source.document, objects: source.objects.filter((record) => !ids.has(record.id)) };
  return { ...base, sha256: sha256Json(base) };
}

/** Only the exact source-only empty-net selector is excluded from target-field
 * baseline selection. All geometry targets still use the generic verifier.
 */
export function deriveFootprintBaselineTargets(before: NativeSourceSnapshot, after: NativeSourceSnapshot, checkpoint: NativeHistorySnapshot): readonly DesignBaselineTarget[] {
  const targets = deriveDesignBaselineTargets(before, after);
  return exportOnlySelector(before, after, checkpoint) ? targets.filter((target) => target.id !== SELECTOR) : targets;
}

export function verifyFootprintBaseline(input: Parameters<typeof verifyDesignBaseline>[0]): ReturnType<typeof verifyDesignBaseline> {
  const projected = projectFootprintPadHistory(input);
  const proof = verifyDesignBaseline({ ...input, checkpoint: projected.checkpoint });
  return { ...proof, footprintPadEncoding: { schema: "easyeda-pro-control.footprint-pad-encoding.v1",
    sourceSha256: input.source.sha256, checkpointSemanticSha256: input.checkpoint.semanticSha256,
    projectedCheckpointSemanticSha256: projected.checkpoint.semanticSha256, differences: projected.differences } };
}

/** The pinned footprint encoder exposes the empty-net rule selector without
 * durable rule storage. Its ordinary NET record may be materialized with the
 * exact exported default body. Nothing else is ignored or reconstructed.
 */
export function verifyFootprintEmptyNetPersistence(input: Parameters<typeof verifyDesignPersistence>[0]): ReturnType<typeof verifyDesignPersistence> {
  const before = footprint(input.expectedBefore, input.before);
  const after = footprint(input.expectedAfter, input.after);
  const sourceOnly = exportOnlySelector(input.expectedBefore, input.expectedAfter, input.before);
  const beforeOmit = new Set<string>();
  const afterOmit = new Set<string>();
  if (sourceOnly) {
    if (after.records.some((record) => record.id === SELECTOR)) { throw new Error("Export-only footprint selector unexpectedly persisted."); }
    beforeOmit.add(SELECTOR); afterOmit.add(SELECTOR);
  }
  const oldNet = before.records.find((record) => record.id === NET);
  const newNet = after.records.find((record) => record.id === NET);
  let materialized = false;
  if (oldNet === undefined && newNet !== undefined) {
    const oldSource = input.expectedBefore.objects.find((record) => record.id === NET);
    const newSource = input.expectedAfter.objects.find((record) => record.id === NET);
    const expected = { id: NET, type: "NET", body: DEFAULT_NET };
    if (canonicalJson(oldSource) !== canonicalJson(expected) || canonicalJson(newSource) !== canonicalJson(expected) || newNet.type !== "NET" || canonicalJson(newNet.body) !== canonicalJson(DEFAULT_NET)) { throw new Error("Unreviewed footprint empty-net materialization."); }
    beforeOmit.add(NET); materialized = true;
  }
  const padTargets = deriveDesignBaselineTargets(input.expectedBefore, input.expectedAfter).filter((target) =>
    input.expectedBefore.objects.some((record) => record.id === target.id && record.type === "PAD"));
  const padProjection = projectFootprintPadHistory({ checkpoint: input.before, source: input.expectedBefore, targets: padTargets });
  let history = padProjection.checkpoint;
  let userStamp: Record<string, unknown> | null = null;
  if (!Object.hasOwn(before.metadata, "user") && Object.hasOwn(after.metadata, "user")) {
    const user = after.metadata["user"];
    if (!isRecord(user) || canonicalJson(Object.keys(user).toSorted()) !== canonicalJson(["avatar", "nickname", "username", "uuid"]) ||
        typeof user["uuid"] !== "string" || !/^[a-f0-9]{32}$/u.test(user["uuid"]) || ["avatar", "nickname", "username"].some((key) => typeof user[key] !== "string") ||
        user["uuid"] !== input.before.projectOwnerUuid || input.before.projectOwnerUuid !== input.after.projectOwnerUuid) { throw new Error("Unreviewed footprint user-stamp identity."); }
    const anchors = input.before.documents.filter((document) => document.uuid !== before.uuid && isRecord(document.metadata["user"]) && document.metadata["user"]["uuid"] === user["uuid"]);
    if (anchors.length === 0 || anchors.some((document) => canonicalJson(document.metadata["user"]) !== canonicalJson(user))) { throw new Error("Footprint user stamp lacks unambiguous same-owner baseline evidence."); }
    // Native Kv emits its supplied user verbatim; compress selects the saved
    // User or existing DOCHEAD user. Admit insertion only, never replacement.
    // Validate the original checkpoint before constructing a comparison-only projection.
    verifyDesignBaseline({ checkpoint: input.before, source: input.expectedBefore, targets: [] });
    const documents = history.documents.map((document) => {
      if (document.uuid !== before.uuid) { return document; }
      const metadata = { ...document.metadata, user };
      return { ...document, metadata, semanticSha256: sha256Json({ uuid: document.uuid, docType: document.docType, metadata, records: document.records.map(({ id, type, body }) => ({ id, type, body })) }) };
    });
    history = { ...history, documents, semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
    userStamp = { field: "user", beforePresent: false, afterSha256: sha256Json(user), ownerUuid: user["uuid"], baselineDocumentIds: anchors.map((document) => document.uuid).toSorted() };
  }
  const proof = verifyDesignPersistence({ ...input, before: history, expectedBefore: omit(input.expectedBefore, beforeOmit), expectedAfter: omit(input.expectedAfter, afterOmit) });
  return { ...proof, footprintPadEncoding: { schema: "easyeda-pro-control.footprint-pad-encoding.v1", beforeSourceSha256: input.expectedBefore.sha256, afterSourceSha256: input.expectedAfter.sha256, beforeCheckpointSemanticSha256: input.before.semanticSha256, projectedCheckpointSemanticSha256: padProjection.checkpoint.semanticSha256, differences: padProjection.differences }, footprintEmptyNetStorage: { schema: "easyeda-pro-control.footprint-empty-net-storage.v1", beforeSourceSha256: input.expectedBefore.sha256, afterSourceSha256: input.expectedAfter.sha256, beforeCheckpointSemanticSha256: input.before.semanticSha256, afterCheckpointSemanticSha256: input.after.semanticSha256, exportOnlySelector: sourceOnly ? SELECTOR : null, materializedNet: materialized ? NET : null, userStamp } };
}
