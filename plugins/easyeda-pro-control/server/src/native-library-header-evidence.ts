import { sha256Json } from "./core.ts";
import { verifyGeneratedNativeAtomHeaderHistory } from "./native-atom-header-history.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { yieldProofEventLoop } from "./cooperative-proof.ts";

export interface NativeLibraryHeaderEvidence {
  readonly profile: "easyeda.native-history.library-header-evidence.v1";
  readonly checkpointSha256: string;
  readonly projectUuid: string;
  readonly documents: readonly {
    readonly documentUuid: string;
    readonly docType: "SYMBOL" | "FOOTPRINT";
    readonly occurrenceCount: number;
    readonly occurrencesSha256: string;
    readonly proofSha256: string;
  }[];
  readonly contentSha256: string;
  readonly sha256: string;
}

/** Retain compact integrity commitments, not another copy of every atom. The
 * immutable, independently verified checkpoint retains the complete raw input.
 * Recompute this evidence from that checkpoint during every reconciliation;
 * never use an old summary as authority to admit a design change.
 * The history container is a freshly returned, privately owned reader result;
 * only its generated deeply frozen occurrence proofs carry an in-process brand.
 */
export async function nativeLibraryHeaderEvidence(history: NativeHistorySnapshot,
  expected: { readonly checkpointSha256: string; readonly projectUuid: string }): Promise<NativeLibraryHeaderEvidence> {
  const { checkpointSha256, projectUuid } = expected;
  if (history.checkpointSha256 !== checkpointSha256 || history.projectUuid !== projectUuid ||
      !/^[a-f0-9]{64}$/u.test(checkpointSha256) || !/^(?:[a-f0-9]{32}|[a-f0-9]{64})$/u.test(projectUuid)) {
    throw new Error("Library header evidence differs from its independently verified checkpoint identity.");
  }
  const documents: NativeLibraryHeaderEvidence["documents"][number][] = [];
  const seen = new Set<string>();
  let batchDocuments = 0;
  for (const document of history.documents) {
    if (seen.has(document.uuid)) { throw new Error("Library header evidence has duplicate document identities."); }
    seen.add(document.uuid);
    batchDocuments += 1;
    if (batchDocuments === 512) { batchDocuments = 0; await yieldProofEventLoop(); }
    if (document.atomHeaderHistory !== undefined) {
      if ((document.docType !== "SYMBOL" && document.docType !== "FOOTPRINT") ||
        document.metadata["uuid"] !== document.uuid || document.metadata["docType"] !== document.docType) {
        throw new Error("Library header evidence belongs to an unsupported document.");
      }
      const proof = verifyGeneratedNativeAtomHeaderHistory(document.atomHeaderHistory, {
        checkpointSha256, documentUuid: document.uuid, docType: document.docType,
      });
      documents.push({ documentUuid: document.uuid, docType: document.docType, occurrenceCount: proof.occurrences.length,
        occurrencesSha256: proof.occurrencesSha256, proofSha256: proof.sha256 });
    }
  }
  documents.sort((left, right) => left.documentUuid.localeCompare(right.documentUuid));
  // File hashes may differ between SQLite backups with an identical logical
  // Dump. The content commitment excludes only that outer file binding.
  const contentSha256 = sha256Json(documents.map(({ documentUuid, docType, occurrenceCount, occurrencesSha256 }) =>
    ({ documentUuid, docType, occurrenceCount, occurrencesSha256 })));
  const evidence = { profile: "easyeda.native-history.library-header-evidence.v1" as const,
    checkpointSha256, projectUuid, documents, contentSha256 };
  return { ...evidence, sha256: sha256Json(evidence) };
}
