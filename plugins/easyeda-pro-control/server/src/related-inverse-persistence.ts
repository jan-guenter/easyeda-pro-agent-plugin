import { canonicalJson, sha256Json } from "./core.ts";
import { verifyDesignBaseline, verifyDesignPersistence } from "./design-persistence.ts";
import { verifyFootprintEmptyNetPersistence } from "./footprint-empty-net-persistence.ts";
import type { NativeDocumentSnapshot, NativeHistorySnapshot } from "./native-history.ts";
import type { NativeSourceSnapshot } from "./document-source.ts";

type PersistenceInput = Parameters<typeof verifyDesignPersistence>[0];
export interface SettledPriorInverse {
  readonly operationId: string;
  readonly journalSha256: string;
  readonly inversePhaseSha256: string;
  readonly checkpoint: NativeHistorySnapshot;
  readonly before: NativeSourceSnapshot;
  readonly after: NativeSourceSnapshot;
  readonly restored: NativeSourceSnapshot;
}

function replaceDocument(history: NativeHistorySnapshot, replacement: NativeDocumentSnapshot): NativeHistorySnapshot {
  if (!history.documents.some((document) => document.uuid === replacement.uuid)) { throw new Error("Related inverse document is missing."); }
  const documents = history.documents.map((document) => document.uuid === replacement.uuid ? replacement : document);
  return { ...history, documents, semanticSha256: sha256Json(documents.map(({ uuid, docType, semanticSha256 }) => ({ uuid, docType, semanticSha256 }))) };
}

/** Recover one already-journaled inverse that reached disk after a later
 * transaction's baseline. The caller authenticates its terminal journal and
 * inverse phase. Both forward and inverse effects still require complete
 * project proofs. These comparison copies never replace retained evidence.
 */
export function projectSettledPriorInverse(input: PersistenceInput, prior: SettledPriorInverse): {
  readonly before: NativeHistorySnapshot;
  readonly evidence: Record<string, unknown>;
} {
  if (!/^easyeda-[a-z0-9-]+$/u.test(prior.operationId) ||
      ![prior.journalSha256, prior.inversePhaseSha256].every((hash) => /^[a-f0-9]{64}$/u.test(hash)) ||
      prior.restored.sha256 !== prior.before.sha256 || canonicalJson(prior.restored) !== canonicalJson(prior.before)) {
    throw new Error("Related inverse lacks exact retained restoration evidence.");
  }
  verifyDesignBaseline({ checkpoint: input.before, source: input.expectedBefore, targets: [] });
  verifyDesignBaseline({ checkpoint: input.after, source: input.expectedAfter, targets: [] });
  if (prior.checkpoint.projectOwnerUuid !== input.before.projectOwnerUuid || input.before.projectOwnerUuid !== input.after.projectOwnerUuid) { throw new Error("Related inverse project owner changed."); }
  const targetUuid = input.expectedBefore.document["uuid"];
  const priorUuid = prior.before.document["uuid"];
  if (typeof priorUuid !== "string" || priorUuid === targetUuid || prior.after.document["uuid"] !== priorUuid) { throw new Error("Related inverse must concern a distinct exact document."); }
  const targetBefore = input.before.documents.find((document) => document.uuid === targetUuid);
  const priorAfter = input.after.documents.find((document) => document.uuid === priorUuid);
  if (targetBefore === undefined || priorAfter === undefined) { throw new Error("Related inverse project identities are incomplete."); }
  const verifier = priorAfter.docType === "FOOTPRINT" ? verifyFootprintEmptyNetPersistence : verifyDesignPersistence;
  const forward = verifier({ before: prior.checkpoint, after: input.before, expectedBefore: prior.before, expectedAfter: prior.after });
  // Isolate the current target only after preserving/validating both original
  // Snapshots. Every other document must fit the earlier inverse exactly.
  const inverse = verifier({ before: input.before, after: replaceDocument(input.after, targetBefore), expectedBefore: prior.after, expectedAfter: prior.restored });
  return {
    before: replaceDocument(input.before, priorAfter),
    evidence: { profile: "easyeda-pro-control.settled-prior-inverse.v1", operationId: prior.operationId,
      journalSha256: prior.journalSha256, inversePhaseSha256: prior.inversePhaseSha256,
      priorTargetUuid: priorUuid, currentTargetUuid: targetUuid,
      beforeCheckpointSha256: input.before.checkpointSha256, afterCheckpointSha256: input.after.checkpointSha256,
      beforeSemanticSha256: input.before.semanticSha256, afterSemanticSha256: input.after.semanticSha256,
      forward, inverse },
  };
}
