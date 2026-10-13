import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { verifyGeneratedNativeAtomHeaderHistory } from "./native-atom-header-history.ts";
import type { NativeLibraryHeaderEvidence } from "./native-library-header-evidence.ts";

export const FLAT_DISPLAY_IMPORTED_TRANSACTION_PROFILE = "easyeda-pro-control.flat-display-transaction.v2";
const hash = z.string().regex(/^[a-f0-9]{64}$/u);
const memberSchema = z.strictObject({ documentUuid: z.string().min(1).max(128), docType: z.enum(["SYMBOL", "FOOTPRINT"]),
  occurrenceCount: z.number().int().min(1).max(1_000_000), occurrencesSha256: hash });
export const flatDisplayLibrarySealSchema = z.strictObject({ profile: z.literal("easyeda-pro-control.flat-library-peers.v1"),
  documents: z.array(memberSchema).min(1).max(100_000), contentSha256: hash }).superRefine((value, context) => {
  if (new Set(value.documents.map((entry) => entry.documentUuid)).size !== value.documents.length ||
      sha256Json(value.documents) !== value.contentSha256 ||
      value.documents.some((entry, index) => index > 0 && (value.documents[index - 1]?.documentUuid.localeCompare(entry.documentUuid) ?? 0) >= 0)) {
    context.addIssue({ code: "custom", message: "Imported library peer seal is inconsistent." });
  }
});
export type FlatDisplayLibrarySeal = z.infer<typeof flatDisplayLibrarySealSchema>;
const headerSummarySchema = z.strictObject({ profile: z.literal("easyeda.native-history.library-header-evidence.v1"),
  checkpointSha256: hash, projectUuid: z.string(), documents: z.array(z.strictObject({ ...memberSchema.shape, proofSha256: hash })).max(100_000),
  contentSha256: hash, sha256: hash });

/** These peers are immutable inputs to display-only page edits. The proof is
 * accepted only from the maintained in-process checkpoint materializer, never
 * from a deserialized artifact. Its frozen occurrence graph is shared safely.
 */
export function flatDisplayLibrarySeal(history: NativeHistorySnapshot): FlatDisplayLibrarySeal | undefined {
  const documents: FlatDisplayLibrarySeal["documents"] = [];
  for (const document of history.documents) {
    if (document.atomHeaderHistory !== undefined) {
      if ((document.docType !== "SYMBOL" && document.docType !== "FOOTPRINT") ||
          document.metadata["uuid"] !== document.uuid || document.metadata["docType"] !== document.docType) {
        throw new Error("Flat display imported history must belong to unchanged SYMBOL or FOOTPRINT peers.");
      }
      const proof = verifyGeneratedNativeAtomHeaderHistory(document.atomHeaderHistory,
        { checkpointSha256: history.checkpointSha256, documentUuid: document.uuid, docType: document.docType });
      documents.push({ documentUuid: document.uuid, docType: document.docType,
        occurrenceCount: proof.occurrences.length, occurrencesSha256: proof.occurrencesSha256 });
    }
  }
  if (documents.length === 0) { return undefined; }
  documents.sort((left, right) => left.documentUuid.localeCompare(right.documentUuid));
  return flatDisplayLibrarySealSchema.parse({ profile: "easyeda-pro-control.flat-library-peers.v1", documents, contentSha256: sha256Json(documents) });
}

/** A retained summary is evidence, not a second source of authority. Match its
 * complete strict shape and every digest against the fresh reader's proof.
 */
export function assertFlatDisplayLibrarySummary(history: NativeHistorySnapshot, summary: NativeLibraryHeaderEvidence | undefined,
  checkpointSha256: string): void {
  const seal = flatDisplayLibrarySeal(history);
  if (seal === undefined) {
    if (summary !== undefined) { throw new Error("Flat display header summary has no imported peer history."); }
    return;
  }
  const parsed = headerSummarySchema.parse(summary);
  const proofs = new Map(history.documents.map((document) => [document.uuid, document.atomHeaderHistory]));
  const documents = seal.documents.map((document) => ({ ...document, proofSha256: proofs.get(document.documentUuid)?.sha256 }));
  const expected = { profile: "easyeda.native-history.library-header-evidence.v1", checkpointSha256,
    projectUuid: history.projectUuid, documents, contentSha256: seal.contentSha256 };
  if (canonicalJson(parsed) !== canonicalJson({ ...expected, sha256: sha256Json(expected) })) {
    throw new Error("Flat display imported peers lack their exact fresh checkpoint-bound header summary.");
  }
}

/** Preserve immutable generated proof identities while capturing every mutable
 * history field before a cooperative operation yields. A clone supplied by a
 * caller cannot acquire the fresh-reader brand through this function.
 */
export function captureFlatDisplayHistory(history: NativeHistorySnapshot): NativeHistorySnapshot {
  flatDisplayLibrarySeal(history);
  const documents = history.documents.map((document) => {
    const { atomHeaderHistory, ...body } = document;
    return { ...structuredClone(body), ...(atomHeaderHistory === undefined ? {} : { atomHeaderHistory }) };
  });
  return { ...structuredClone({ ...history, documents: [] }), documents };
}

export function assertFlatDisplayLibraryPeers(binding: { readonly profile: string; readonly libraryHeaders?: FlatDisplayLibrarySeal },
  history: NativeHistorySnapshot): void {
  const seal = flatDisplayLibrarySeal(history);
  if (binding.profile === FLAT_DISPLAY_IMPORTED_TRANSACTION_PROFILE) {
    if (seal === undefined || binding.libraryHeaders === undefined || canonicalJson(seal) !== canonicalJson(binding.libraryHeaders)) {
      throw new Error("Flat display imported library header peers changed or lost their sealed provenance.");
    }
  } else if (seal !== undefined || binding.libraryHeaders !== undefined) {
    throw new Error("Legacy flat display does not admit imported library header provenance.");
  }
}
