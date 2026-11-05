/** Separate historical sidecars. Original Source journals and native leases are never written. */
/* oxlint-disable import/max-dependencies -- Join the maintained Source chain, strict file-only input and original managed descriptor boundaries. */
import { constants } from "node:fs";
import { createHash } from "node:crypto";
import type { BigIntStats } from "node:fs";
import { lstat, open, readdir } from "node:fs/promises";
import { basename, join } from "node:path";
import { z } from "zod";
import { controlDataDirectory, controlRootCapability, operationPath, publishManagedAttachmentExclusive } from "./artifacts.ts";
import { canonicalJson, sha256Json } from "./core.ts";
import { currentDisposableOpenPreparationCheckpointSchema, currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { readCurrentFootprintForwardExecutionOpeningHistory } from "./current-footprint-forward-execution-opening-journal.ts";
import { currentFootprintForwardExecutionOpeningIdSchema, currentFootprintForwardExecutionOpeningRequestSchema } from "./current-footprint-forward-execution-opening-contract.ts";
import { currentFootprintForwardOpeningFileProofInputSchema } from "./current-footprint-forward-opening-relinquishment-file-proof.ts";
import type { CurrentFootprintForwardOpeningFileProofInput } from "./current-footprint-forward-opening-relinquishment-file-proof.ts";
import { CURRENT_FOOTPRINT_FORWARD_SOURCE_RELINQUISHMENT_DIRECTORY as DIRECTORY, CURRENT_FOOTPRINT_FORWARD_SOURCE_HISTORICAL_KINDS as KINDS,
  CURRENT_FOOTPRINT_FORWARD_SOURCE_HISTORICAL_PROFILE as PROFILE, currentFootprintForwardSourceRelinquishmentIntentSchema,
  currentFootprintForwardSourceRelinquishmentResultSchema } from "./current-footprint-forward-source-relinquishment-contract.ts";
import type { CurrentFootprintForwardSourceRelinquishmentIntent as Intent, CurrentFootprintForwardSourceRelinquishmentResult as Result } from "./current-footprint-forward-source-relinquishment-contract.ts";

const MAX_BYTES = 65_536;
const digest = z.string().regex(/^[a-f\d]{64}$/u);
const preparedTargetSchema = z.object({ branchUuid: z.string().regex(/^[a-f\d]{32}$/u), historySemanticSha256: digest }).loose();
const preparedCheckpointSchema = z.object({ profile: z.literal("easyeda-pro-control.current-disposable-open-checkpoint.v1"),
  checkpoint: z.record(z.string(), z.unknown()), preparationCheckpoint: currentDisposableOpenPreparationCheckpointSchema, targetEvidence: preparedTargetSchema }).loose();
const preparedSchema = z.object({ checkpoint: preparedCheckpointSchema, beforeSqlSha256: digest, originalSqlReaderCompleted: z.literal(true) }).strict();
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`FORWARD_SOURCE_RELINQUISHMENT_${code}`); } }
function absent(error: unknown): boolean { return error instanceof Error && "code" in error && error.code === "ENOENT"; }
function identity(stat: BigIntStats): string { return [stat.dev, stat.ino, stat.mode, stat.uid, stat.nlink, stat.size, stat.mtimeNs, stat.ctimeNs].join(":"); }
function hashBytes(bytes: Buffer): string { return createHash("sha256").update(bytes).digest("hex"); }
function parseBytes(bytes: Buffer): unknown {
  const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  return JSON.parse(text) as unknown;
}
interface Slot { readonly identity: string; readonly files: ReadonlyMap<string, Readonly<{ bytes: Buffer; identity: string }>> }
/** Capture fixed leaves through original regular descriptors. Selected mode
 * permits unrelated operations; exact/subset modes reject every extra leaf. */
async function readSlot(directory: string, names: readonly string[], mode: "selected" | "exact" | "subset", optional = false): Promise<Slot | null> {
  const root = await controlRootCapability(false);
  let slot;
  try { slot = await root.openDirectory(directory, false); }
  catch (error) { if (optional && absent(error)) { return null; } throw error; }
  try {
    const before = await slot.handle.stat({ bigint: true }), path = `/proc/self/fd/${String(slot.handle.fd)}`;
    const files = new Map<string, Readonly<{ bytes: Buffer; identity: string }>>();
    let selected = [...names];
    if (mode !== "selected") {
      const entries = await readdir(path, { withFileTypes: true });
      need(entries.length <= names.length && (mode !== "exact" || entries.length === names.length), "ROSTER");
      need(entries.every(entry => entry.isFile() && names.includes(entry.name)), "LEAF"); selected = entries.map(entry => entry.name);
    }
    for (const name of selected) {
      // oxlint-disable-next-line no-bitwise -- Fixed managed leaves never follow links or block on nonregular objects.
      const file = await open(join(path, name), constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
      try {
        const first = await file.stat({ bigint: true });
        need(first.isFile() && first.nlink === 1n && first.mode % 4096n === 0o600n && first.uid === BigInt(process.getuid?.() ?? -1) && first.size > 0n && first.size <= BigInt(MAX_BYTES), "FILE_AUTHORITY");
        const bytes = Buffer.alloc(Number(first.size) + 1); let ended = false; let offset = 0;
        while (offset < bytes.length && !ended) { const read = await file.read(bytes, offset, bytes.length - offset, offset); offset += read.bytesRead; ended = read.bytesRead === 0; }
        const after = await file.stat({ bigint: true }); const named = await lstat(join(path, name), { bigint: true });
        need(offset === Number(first.size) && identity(first) === identity(after) && identity(first) === identity(named), "FILE_CHANGED");
        files.set(name, Object.freeze({ bytes: bytes.subarray(0, offset), identity: identity(first) }));
      } finally { await file.close(); }
    }
    need(identity(before) === identity(await slot.handle.stat({ bigint: true })), "DIRECTORY_CHANGED");
    const current = await root.openDirectory(directory, false);
    try { need(identity(before) === identity(await current.handle.stat({ bigint: true })), "DIRECTORY_REPLACED"); }
    finally { await current.handle.close(); }
    await root.assertCurrent(); return Object.freeze({ identity: identity(before), files });
  } finally { await slot.handle.close(); }
}
function sameSlot(left: Slot, right: Slot | null): boolean {
  return right !== null && left.identity === right.identity && left.files.size === right.files.size && [...left.files].every(([name, file]) =>
    right.files.get(name)?.identity === file.identity && right.files.get(name)?.bytes.equals(file.bytes) === true);
}
export interface CurrentFootprintForwardSourceHistoricalSnapshot {
  readonly profile: "private.current-footprint-forward-source-historical-snapshot.v1"; readonly executionAuthorized: false;
}
export interface CurrentFootprintForwardSourceHistoricalOriginal {
  readonly operationId: string; readonly originalManifestSha256: typeof PROFILE.manifestSha256;
  readonly originalCanonicalManifestSha256: typeof PROFILE.canonicalManifestSha256; readonly originalRosterSha256: typeof PROFILE.rosterSha256;
  readonly originalStoredJournalSha256: string; readonly originalIntentSha256: string; readonly originalBindingSha256: string; readonly originalIdentitySha256: string;
  readonly externallyReviewedSourceCodeTuple: typeof PROFILE.code;
  readonly fileInput: CurrentFootprintForwardOpeningFileProofInput; readonly historySemanticSha256: string;
}
const originals = new WeakMap<object, CurrentFootprintForwardSourceHistoricalOriginal>();
/** Require the externally reviewed whole raw manifest and all 23 original
 * artifacts, then reuse the maintained complete Source chain validator. */
async function readOriginal(operationId: string): Promise<CurrentFootprintForwardSourceHistoricalOriginal> {
  currentFootprintForwardExecutionOpeningIdSchema.parse(operationId);
  const parent = join(controlDataDirectory(), "operations"); const filename = basename(operationPath(operationId));
  const manifestSlot = await readSlot(parent, [filename], "selected"); need(manifestSlot !== null, "MANIFEST_REQUIRED");
  const manifest = manifestSlot.files.get(filename); need(manifest !== undefined && manifest.bytes.length === PROFILE.manifestBytes &&
    hashBytes(manifest.bytes) === PROFILE.manifestSha256, "EXTERNAL_PROFILE_MANIFEST");
  const names = KINDS.map((kind, index) => `${String(index).padStart(2, "0")}-${kind}.json`);
  const directory = join(parent, operationId); const artifacts = await readSlot(directory, names, "exact"); need(artifacts !== null, "ARTIFACTS_REQUIRED");
  const history = await readCurrentFootprintForwardExecutionOpeningHistory(operationId);
  need(canonicalJson(parseBytes(manifest.bytes)) === canonicalJson(history.operation) &&
    sha256Json(history.operation) === PROFILE.canonicalManifestSha256 && history.operation["state"] === "prepared", "MANIFEST_CHANGED");
  const records = history.records; need(records.length === KINDS.length, "RECORD_COUNT");
  const fileIdentities = []; const roster = [];
  for (const [index, kind] of KINDS.entries()) {
    const record = records[index]; const name = names[index]; need(record !== undefined && name !== undefined && record.kind === kind, "RECORD_KIND");
    const file = artifacts.files.get(name); need(file !== undefined && canonicalJson(parseBytes(file.bytes)) === canonicalJson(record), "RECORD_BYTES");
    roster.push({ sequence: index, kind, name, bytes: file.bytes.length, sha256: hashBytes(file.bytes), canonicalRecordSha256: sha256Json(record) });
    fileIdentities.push({ name, identity: file.identity });
  }
  need(sha256Json(roster) === PROFILE.rosterSha256, "EXTERNAL_PROFILE_ROSTER");
  const request = currentFootprintForwardExecutionOpeningRequestSchema.parse(records[0]?.evidence["request"]);
  const prepared = preparedSchema.parse(records[2]?.evidence);
  const fileInput = currentFootprintForwardOpeningFileProofInputSchema.parse({
    target: currentDisposableOpenSealedTargetSchema.parse({ ...request.target, branchUuid: prepared.checkpoint.targetEvidence.branchUuid }),
    preparationCheckpoint: prepared.checkpoint.preparationCheckpoint, checkpointReceiptSha256: sha256Json(prepared.checkpoint.checkpoint), beforeSqlSha256: prepared.beforeSqlSha256,
  });
  const storedHash = history.operation["journalSha256"]; need(typeof storedHash === "string", "STORED_HASH");
  need(sameSlot(manifestSlot, await readSlot(parent, [filename], "selected")) && sameSlot(artifacts, await readSlot(directory, names, "exact")), "ORIGINAL_CHANGED");
  return freezeDeep({ operationId, originalManifestSha256: PROFILE.manifestSha256, originalCanonicalManifestSha256: PROFILE.canonicalManifestSha256,
    originalRosterSha256: PROFILE.rosterSha256, originalStoredJournalSha256: storedHash, originalIntentSha256: sha256Json(records[0]),
    originalBindingSha256: sha256Json(records[6]), originalIdentitySha256: sha256Json({ manifest: manifest.identity, directory: artifacts.identity, files: fileIdentities }),
    externallyReviewedSourceCodeTuple: PROFILE.code, fileInput, historySemanticSha256: prepared.checkpoint.targetEvidence.historySemanticSha256 });
}
/** Mint custody of original historical bytes only; copied token fields cannot recover it. */
export async function readCurrentFootprintForwardSourceHistoricalSnapshot(operationId: string): Promise<CurrentFootprintForwardSourceHistoricalSnapshot> {
  const original = await readOriginal(operationId);
  const token = Object.freeze({ profile: "private.current-footprint-forward-source-historical-snapshot.v1" as const, executionAuthorized: false as const });
  originals.set(token, original); return token;
}
/** Resolve only a token issued by this module, never a reconstructed native descriptor. */
export function requireCurrentFootprintForwardSourceHistoricalSnapshot(token: CurrentFootprintForwardSourceHistoricalSnapshot): CurrentFootprintForwardSourceHistoricalOriginal {
  const original = originals.get(token); need(original !== undefined, "ORIGINAL_SNAPSHOT"); return original;
}
/** Reopen complete original bytes and identities at every later proof/publication boundary. */
export async function assertCurrentFootprintForwardSourceHistoricalSnapshot(token: CurrentFootprintForwardSourceHistoricalSnapshot): Promise<void> {
  const original = requireCurrentFootprintForwardSourceHistoricalSnapshot(token);
  need(canonicalJson(await readOriginal(original.operationId)) === canonicalJson(original), "ORIGINAL_CHANGED");
}
function matches(record: Intent | Result, original: CurrentFootprintForwardSourceHistoricalOriginal): boolean {
  return (["operationId", "originalManifestSha256", "originalCanonicalManifestSha256", "originalRosterSha256", "originalStoredJournalSha256", "originalIntentSha256", "originalBindingSha256", "originalIdentitySha256"] as const)
    .every(key => record[key] === original[key]) && canonicalJson(record.externallyReviewedSourceCodeTuple) === canonicalJson(original.externallyReviewedSourceCodeTuple);
}
/** Partial or contradictory sidecars never clear a blocker. Their data joins
 * the original full snapshot and proof input, without restoring native custody. */
export async function readCurrentFootprintForwardSourceRelinquishment(token: CurrentFootprintForwardSourceHistoricalSnapshot): Promise<Readonly<{ intent: Intent; result: Result | null }> | null> {
  const original = requireCurrentFootprintForwardSourceHistoricalSnapshot(token); await assertCurrentFootprintForwardSourceHistoricalSnapshot(token);
  const directory = join(controlDataDirectory(), DIRECTORY, original.operationId);
  const slot = await readSlot(directory, ["intent.json", "relinquished.json"], "subset", true);
  if (slot === null) { return null; }
  if (slot.files.size === 0) {
    // Failed publication may leave an empty directory after removing its file.
    // No receipt or admission follows; retained pending metadata can settle.
    need(sameSlot(slot, await readSlot(directory, ["intent.json", "relinquished.json"], "subset")), "SIDECAR_CHANGED");
    await assertCurrentFootprintForwardSourceHistoricalSnapshot(token); return null;
  }
  const intentBytes = slot.files.get("intent.json")?.bytes; need(intentBytes !== undefined, "INTENT_REQUIRED");
  const intent = currentFootprintForwardSourceRelinquishmentIntentSchema.parse(parseBytes(intentBytes)); need(matches(intent, original), "INTENT_BINDING");
  const bytes = slot.files.get("relinquished.json")?.bytes;
  const result = bytes === undefined ? null : currentFootprintForwardSourceRelinquishmentResultSchema.parse(parseBytes(bytes));
  const input = original.fileInput;
  need(result === null || matches(result, original) && result.relinquishmentIntentSha256 === sha256Json(intent) &&
    result.fileProof.projectUuid === input.target.projectUuid && result.fileProof.branchUuid === input.target.branchUuid && result.fileProof.documentUuid === input.target.documentUuid &&
    result.fileProof.rawSourceSha256 === input.target.expectedSourceSha256 && result.fileProof.oldCheckpointSha256 === input.preparationCheckpoint.sha256 &&
    result.fileProof.oldCheckpointReceiptSha256 === input.checkpointReceiptSha256 && result.fileProof.beforeSqlSha256 === input.beforeSqlSha256 &&
    result.fileProof.freshSqlSha256 === input.beforeSqlSha256 && result.fileProof.oldHistorySemanticSha256 === original.historySemanticSha256 &&
    result.fileProof.freshHistorySemanticSha256 === original.historySemanticSha256, "RESULT_BINDING");
  need(sameSlot(slot, await readSlot(directory, ["intent.json", "relinquished.json"], "subset")), "SIDECAR_CHANGED");
  await assertCurrentFootprintForwardSourceHistoricalSnapshot(token); return freezeDeep({ intent, result });
}
/** Append only this new sidecar, retaining original descriptor/chain reproof around durable publication. */
export async function publishCurrentFootprintForwardSourceRelinquishment(token: CurrentFootprintForwardSourceHistoricalSnapshot, name: "intent.json" | "relinquished.json", value: Intent | Result): Promise<void> {
  const original = requireCurrentFootprintForwardSourceHistoricalSnapshot(token);
  const record = (name === "intent.json" ? currentFootprintForwardSourceRelinquishmentIntentSchema : currentFootprintForwardSourceRelinquishmentResultSchema).parse(value);
  need(matches(record, original), "PUBLICATION_BINDING"); await assertCurrentFootprintForwardSourceHistoricalSnapshot(token);
  await publishManagedAttachmentExclusive(join(controlDataDirectory(), DIRECTORY, original.operationId, name), "Source historical relinquishment",
    Buffer.from(`${JSON.stringify(record)}\n`), "easyeda-pro-control.forward-source-historical-relinquishment.v1",
    () => assertCurrentFootprintForwardSourceHistoricalSnapshot(token));
  await assertCurrentFootprintForwardSourceHistoricalSnapshot(token);
}
/** Requalify the exact historical receipt on every admission scan. Unsupported
 * Source histories remain ordinary blockers, with no profile promotion. */
export async function inspectCurrentFootprintForwardSourceRelinquishment(operationId: string): Promise<Readonly<{
  originalStoredJournalSha256: string; originalCanonicalManifestSha256: string; result: Result;
}> | null> {
  const history = await readCurrentFootprintForwardExecutionOpeningHistory(operationId);
  if (sha256Json(history.operation) !== PROFILE.canonicalManifestSha256) { return null; }
  const token = await readCurrentFootprintForwardSourceHistoricalSnapshot(operationId);
  const original = requireCurrentFootprintForwardSourceHistoricalSnapshot(token);
  const receipt = await readCurrentFootprintForwardSourceRelinquishment(token);
  return receipt?.result === undefined || receipt.result === null ? null : freezeDeep({
    originalStoredJournalSha256: original.originalStoredJournalSha256, originalCanonicalManifestSha256: original.originalCanonicalManifestSha256, result: receipt.result,
  });
}
