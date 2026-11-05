/** Fresh file-only proof for one historical forward opening. The caller retains
 * the global application-absence premise; this collector issues no native owner. */
/* oxlint-disable import/max-dependencies -- Compose maintained checkpoint, full SQL, history and managed-file readers rather than reconstructing their evidence from JSON. */
import { dirname, join } from "node:path";
import { z } from "zod";
import { controlDataDirectory, readArtifact, verifyExactManagedArtifact } from "./artifacts.ts";
import { compareCompleteClosedSql } from "./closed-sql-equality.ts";
import type { Inventory } from "./closed-sql-equality.ts";
import { canonicalJson, sha256Json } from "./core.ts";
import { currentDisposableOpenPreparationCheckpointSchema, currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import { prepareCurrentDisposableOpenCheckpoint, verifyCurrentDisposableOpenCheckpoint,
  verifyHistoricalCurrentDisposableOpenCheckpoint } from "./current-disposable-open-checkpoint.ts";
import type { CurrentDisposableOpenCheckpoint } from "./current-disposable-open-checkpoint.ts";
import type { DiagnosticLifecycleRecords } from "./current-pcb-diagnostic-lifecycle-journal.ts";
import { loadRuntimeMachineProfile } from "./machine-profile.ts";
import { isNativeDocumentDeleted, readNativeHistoryCheckpoint } from "./native-history.ts";
import type { NativeHistorySnapshot } from "./native-history.ts";
import { noSidecars } from "./sqlite-inventory-core.ts";
import { readExactSqlInventory, readerCompletion } from "./sqlite-inventory.ts";
import type { ReaderCompletion } from "./sqlite-inventory.ts";

const finalRevalidations = new WeakMap<object, () => Promise<void>>();

/** Revalidate only the original completed readers and their exact files.
 * A copied or serialized proof cannot reconstruct the retained validator. */
export async function revalidateCurrentFootprintForwardOpeningFileProof(proof: CurrentFootprintForwardOpeningFileProof): Promise<void> {
  const revalidate = finalRevalidations.get(proof);
  need(revalidate !== undefined, "Original completed file-proof validator is required.");
  await revalidate();
}

const digest = z.string().regex(/^[a-f0-9]{64}$/u);
const identity = z.strictObject({ birthtimeNs: z.string(), ctimeNs: z.string(), dev: z.string(), ino: z.string() });
const receiptSchema = z.looseObject({ schema: z.literal("easyeda-pro-control.checkpoint.v2"), createdAt: z.iso.datetime(),
  source: z.string(), checkpoint: z.string(), sourceIdentity: identity, checkpointIdentity: identity,
  sourceSha256: digest, checkpointSha256: digest, sourceDumpSha256: digest, checkpointDumpSha256: digest,
  receiptSha256: digest, receiptPath: z.string() });

export const currentFootprintForwardOpeningFileProofSchema = z.strictObject({
  profile: z.literal("private.current-footprint-forward-opening-file-proof.v1"),
  projectUuid: digest, branchUuid: z.string().regex(/^[a-f0-9]{32}$/u), documentUuid: z.string().regex(/^(?:[a-f0-9]{16}|[a-f0-9]{32})$/u),
  oldCheckpointSha256: digest, freshCheckpointSha256: digest,
  oldCheckpointReceiptSha256: digest, freshCheckpointReceiptSha256: digest,
  beforeSqlSha256: digest, freshSqlSha256: digest, rawSourceSha256: digest,
  oldHistorySemanticSha256: digest, freshHistorySemanticSha256: digest,
  fullSqlEqual: z.literal(true), historyEqual: z.literal(true), sidecarsAbsent: z.literal(true),
  executionAuthorized: z.literal(false), writerAuthority: z.literal(false), restored: z.literal(false),
});
export type CurrentFootprintForwardOpeningFileProof = Readonly<z.infer<typeof currentFootprintForwardOpeningFileProofSchema>>;
type Opening = NonNullable<DiagnosticLifecycleRecords["worker-startup-opening-intent.json"]>;
export const currentFootprintForwardOpeningFileProofInputSchema = z.object({
  target: currentDisposableOpenSealedTargetSchema,
  preparationCheckpoint: currentDisposableOpenPreparationCheckpointSchema,
  checkpointReceiptSha256: digest, beforeSqlSha256: digest,
}).strict();
export type CurrentFootprintForwardOpeningFileProofInput = Readonly<z.infer<typeof currentFootprintForwardOpeningFileProofInputSchema>>;

function need(value: boolean, message: string): asserts value {
  if (!value) { throw new Error(`FORWARD_OPENING_FILE_PROOF_${message}`); }
}
/** Require the same issued reader completion after every later proof await.
 * Equal inventory JSON cannot supply its private completed-child provenance. */
function completed(inventory: Inventory, original: ReaderCompletion): void {
  need(readerCompletion(inventory) === original && original.observedChildClose && original.exitCode === 0 && original.exitSignal === null,
    "ORIGINAL_READER_COMPLETION");
}
/** Compare the complete materialized history while excluding only the physical
 * checkpoint digest. Whole SQL separately covers every persisted row and cell. */
function comparableHistory(history: NativeHistorySnapshot): string {
  const { checkpointSha256: _checkpoint, ...content } = history;
  return canonicalJson(content);
}

/** Reconstruct the exact old managed preparation, create a fresh like-for-like
 * preparation and compare original completed readers. Raw-source SQL is a
 * separate SHA/sidecar proof and is never equated to a VACUUM preparation. */
export async function collectCurrentFootprintForwardOpeningFileProof(opening: Opening,
  current: () => Promise<void>): Promise<CurrentFootprintForwardOpeningFileProof> {
  const captured = canonicalJson(opening);
  const proof = await collectCurrentFootprintForwardOpeningFileProofInput({ target: opening.target,
    preparationCheckpoint: opening.preparationCheckpoint, checkpointReceiptSha256: opening.checkpointReceiptSha256,
    beforeSqlSha256: opening.beforeSqlSha256 }, async () => {
    need(canonicalJson(opening) === captured, "OPENING_CHANGED");
    await current(); need(canonicalJson(opening) === captured, "OPENING_CHANGED");
  });
  need(canonicalJson(opening) === captured, "OPENING_CHANGED"); return proof;
}

/** Reuse the same file-only proof for a reader-issued Source history without
 * fabricating a legacy opening packet or granting any native authority. */
export async function collectCurrentFootprintForwardOpeningFileProofInput(input: CurrentFootprintForwardOpeningFileProofInput,
  current: () => Promise<void>): Promise<CurrentFootprintForwardOpeningFileProof> {
  const captured = canonicalJson(input), opening = currentFootprintForwardOpeningFileProofInputSchema.parse(input);
  const parsedText = canonicalJson(opening);
  const target = currentDisposableOpenSealedTargetSchema.parse(opening.target);
  const { branchUuid: branch, ...originalTarget } = target;
  const descriptor = currentDisposableOpenPreparationCheckpointSchema.parse(opening.preparationCheckpoint);
  need(dirname(descriptor.path) === join(controlDataDirectory(), "checkpoints") && descriptor.path.endsWith(".eprj2"), "OLD_MANAGED_PATH");
  const receiptPath = descriptor.path.replace(/\.eprj2$/u, ".checkpoint.json");
  const readers: { readonly inventory: Inventory; readonly completion: ReaderCompletion }[] = [];
  /** Preserve the original opening and all already completed reader objects. */
  const unchanged = (): void => {
    need(canonicalJson(input) === captured && canonicalJson(opening) === parsedText, "OPENING_CHANGED");
    for (const item of readers) { completed(item.inventory, item.completion); }
  };
  /** Bracket one maintained operation with the caller's current global premise
   * and the collector's immutable opening and reader-reference assertions. */
  const checked = async <Result,>(operation: () => Promise<Result>): Promise<Result> => {
    await current(); unchanged();
    const result = await operation();
    await current(); unchanged(); return result;
  };

  await checked(() => verifyExactManagedArtifact(descriptor));
  const rawReceipt = await checked(() => readArtifact(receiptPath, 0, 65_536));
  need(rawReceipt.eof, "OLD_RECEIPT_BOUND");
  const receipt = receiptSchema.parse(JSON.parse(rawReceipt.text));
  need(sha256Json(receipt) === opening.checkpointReceiptSha256 && receipt.receiptPath === receiptPath &&
    receipt.checkpoint === descriptor.path && receipt.checkpointSha256 === descriptor.sha256 &&
    receipt.sourceSha256 === target.expectedSourceSha256, "OLD_RECEIPT_BINDING");
  const history = await checked(() => readNativeHistoryCheckpoint({ checkpointPath: descriptor.path, expectedSha256: descriptor.sha256,
    projectUuid: target.projectUuid, libraryAtomHeaders: "preserve" }));
  const documents = history.documents.filter(document => document.uuid === target.documentUuid);
  const document = documents[0];
  need(history.projectUuid === target.projectUuid && history.branchUuid === branch && documents.length === 1 &&
    document !== undefined && document.docType === "PCB" && !isNativeDocumentDeleted(document), "OLD_HISTORY_TARGET");
  const old: CurrentDisposableOpenCheckpoint = Object.freeze({ profile: "easyeda-pro-control.current-disposable-open-checkpoint.v1", checkpoint: receipt,
    preparationCheckpoint: descriptor, targetEvidence: Object.freeze({ projectUuid: history.projectUuid, branchUuid: history.branchUuid,
      documentUuid: document.uuid, docType: "PCB", sourceSha256: receipt.sourceSha256, checkpointSha256: descriptor.sha256,
      documentSemanticSha256: document.semanticSha256, historySemanticSha256: history.semanticSha256, headHistoryUuid: history.headHistoryUuid }) });
  let fresh: CurrentDisposableOpenCheckpoint | undefined;
  /** Rehash the original managed preparation and, once created, verify the fresh
   * preparation against its exact registered source and retained receipt. */
  const revalidate = async (): Promise<void> => {
    await checked(() => verifyHistoricalCurrentDisposableOpenCheckpoint(old, originalTarget));
    const prepared = fresh;
    if (prepared !== undefined) { await checked(() => verifyCurrentDisposableOpenCheckpoint(prepared, originalTarget)); }
  };
  /** Keep complete proof steps between fresh old/new checkpoint observations. */
  const work = async <Result,>(operation: () => Promise<Result>): Promise<Result> => {
    await revalidate(); const result = await checked(operation); await revalidate(); return result;
  };

  await revalidate();
  const { profile } = await work(() => loadRuntimeMachineProfile());
  const runtime = profile.runtime;
  /** Read one immutable database through the machine-pinned isolated child and
   * retain its actual completion object for every subsequent proof boundary. */
  const read = async (checkpointPath: string, expectedSha256: string): Promise<Inventory> => {
    const inventory = await work(() => readExactSqlInventory({ checkpointPath, expectedSha256, runtime }));
    const completion = readerCompletion(inventory); completed(inventory, completion); readers.push({ inventory, completion }); return inventory;
  };

  const before = await read(descriptor.path, descriptor.sha256);
  need(before.logicalSha256 === opening.beforeSqlSha256, "OLD_SQL_BINDING");
  await work(() => noSidecars(receipt.source));
  await work(async () => { fresh = await prepareCurrentDisposableOpenCheckpoint(originalTarget); });
  need(fresh !== undefined && fresh.preparationCheckpoint !== undefined, "FRESH_PREPARATION_REQUIRED");
  const prepared = fresh;
  const freshDescriptor = prepared.preparationCheckpoint;
  need(freshDescriptor !== undefined, "FRESH_PREPARATION_REQUIRED");
  const raw = await read(prepared.checkpoint.source, target.expectedSourceSha256);
  need(raw.checkpointSha256 === target.expectedSourceSha256 && prepared.checkpoint.sourceSha256 === target.expectedSourceSha256, "RAW_SOURCE_BINDING");
  const after = await read(freshDescriptor.path, freshDescriptor.sha256);
  await work(() => compareCompleteClosedSql(before, after));
  const freshHistory = await work(() => readNativeHistoryCheckpoint({ checkpointPath: prepared.checkpoint.checkpoint,
    expectedSha256: prepared.checkpoint.checkpointSha256, projectUuid: target.projectUuid, libraryAtomHeaders: "preserve" }));
  need(comparableHistory(history) === comparableHistory(freshHistory) && freshHistory.projectUuid === target.projectUuid &&
    freshHistory.branchUuid === branch, "HISTORY_CHANGED");
  await work(() => noSidecars(prepared.checkpoint.source));
  unchanged();
  const proof = Object.freeze(currentFootprintForwardOpeningFileProofSchema.parse({
    profile: "private.current-footprint-forward-opening-file-proof.v1", projectUuid: target.projectUuid, branchUuid: branch, documentUuid: target.documentUuid,
    oldCheckpointSha256: descriptor.sha256, freshCheckpointSha256: prepared.checkpoint.checkpointSha256,
    oldCheckpointReceiptSha256: opening.checkpointReceiptSha256, freshCheckpointReceiptSha256: sha256Json(prepared.checkpoint),
    beforeSqlSha256: before.logicalSha256, freshSqlSha256: after.logicalSha256, rawSourceSha256: raw.checkpointSha256,
    oldHistorySemanticSha256: history.semanticSha256, freshHistorySemanticSha256: freshHistory.semanticSha256,
    fullSqlEqual: true, historyEqual: true, sidecarsAbsent: true, executionAuthorized: false, writerAuthority: false, restored: false,
  }));
  finalRevalidations.set(proof, async (): Promise<void> => {
    await checked(() => noSidecars(prepared.checkpoint.source));
    await revalidate();
    await checked(() => noSidecars(prepared.checkpoint.source));
    unchanged();
  });
  return proof;
}
