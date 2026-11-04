/** Separate append-only relinquishment receipts. The original journal is read-only. */
import { constants } from "node:fs";
import type { BigIntStats } from "node:fs";
import { lstat, open, readdir } from "node:fs/promises";
import { join } from "node:path";
import type { z } from "zod";
// oxlint-disable-next-line import/no-cycle -- These lazy reader calls retain one maintained chain validator; neither journal invokes the other during module initialization.
import { readCurrentPcbDiagnosticLifecycles } from "./current-pcb-diagnostic-lifecycle-journal.ts";
import type { DiagnosticLifecycleRecords } from "./current-pcb-diagnostic-lifecycle-journal.ts";
import { controlDataDirectory, controlRootCapability, publishManagedAttachmentExclusive } from "./artifacts.ts";
import { canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { CURRENT_FOOTPRINT_FORWARD_OPENING_RELINQUISHMENT_DIRECTORY, currentFootprintForwardOpeningHistoricalIntentSchema,
  currentFootprintForwardOpeningRelinquishmentIntentSchema, currentFootprintForwardOpeningRelinquishmentResultSchema } from "./current-footprint-forward-opening-relinquishment-contract.ts";
import type { CurrentFootprintForwardOpeningRelinquishmentIntent, CurrentFootprintForwardOpeningRelinquishmentResult } from "./current-footprint-forward-opening-relinquishment-contract.ts";

const MAX_BYTES = 65_536, ORIGINAL_DIRECTORY = "pcb-diagnostic-lifecycle-v1";
/** Fail closed on an incomplete or replaced managed history boundary. */
function need(value: boolean): asserts value { if (!value) { throw new Error("FORWARD_OPENING_RELINQUISHMENT_JOURNAL_REFUSED"); } }
/** Only a genuinely missing optional sidecar slot is empty; unreadable storage remains a blocker. */
function absent(error: unknown): boolean { return error instanceof Error && "code" in error && error.code === "ENOENT"; }
function identity(stat: BigIntStats): string { return [stat.dev, stat.ino, stat.mode, stat.uid, stat.nlink, stat.size, stat.mtimeNs, stat.ctimeNs].join(":"); }
interface ReadSlot { readonly identity: string; readonly files: ReadonlyMap<string, Readonly<{ bytes: Buffer; identity: string }>> }
/** Bind every allowed leaf and directory to unchanged regular descriptors; refuse additions and aliases. */
async function readSlot(directory: string, allowed: readonly string[], missingAllowed: boolean): Promise<ReadSlot | null> {
  const root = await controlRootCapability(false);
  let slot;
  try { slot = await root.openDirectory(directory, false); }
  catch (error) { if (missingAllowed && absent(error)) { return null; } throw error; }
  try {
    const before = await slot.handle.stat({ bigint: true }), files = new Map<string, Readonly<{ bytes: Buffer; identity: string }>>();
    const path = `/proc/self/fd/${String(slot.handle.fd)}`;
    const entries = await readdir(path, { withFileTypes: true }); need(entries.length <= allowed.length);
    for (const entry of entries) {
      need(entry.isFile() && allowed.includes(entry.name) && !files.has(entry.name));
      // oxlint-disable-next-line no-bitwise -- Fixed managed leaves must never follow links or block on nonregular descriptors.
      const file = await open(join(path, entry.name), constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
      try {
        const first = await file.stat({ bigint: true });
        need(first.isFile() && first.nlink === 1n && first.mode % 4096n === 0o600n && first.uid === BigInt(process.getuid?.() ?? -1) && first.size > 0n && first.size <= BigInt(MAX_BYTES));
        const bytes = Buffer.alloc(Number(first.size) + 1); let offset = 0;
        let end = false;
        while (offset < bytes.length && !end) { const read = await file.read(bytes, offset, bytes.length - offset, offset); offset += read.bytesRead; end = read.bytesRead === 0; }
        const finalFile = await file.stat({ bigint: true }), finalPath = await lstat(join(path, entry.name), { bigint: true });
        need(offset === Number(first.size) && identity(first) === identity(finalFile) && identity(first) === identity(finalPath));
        files.set(entry.name, Object.freeze({ bytes: bytes.subarray(0, offset), identity: identity(first) }));
      } finally { await file.close(); }
    }
    need(identity(before) === identity(await slot.handle.stat({ bigint: true })));
    const current = await root.openDirectory(directory, false);
    try { need(identity(before) === identity(await current.handle.stat({ bigint: true }))); }
    finally { await current.handle.close(); }
    await root.assertCurrent(); return Object.freeze({ identity: identity(before), files });
  } finally { await slot.handle.close(); }
}
export interface CurrentFootprintForwardOpeningHistoricalSnapshot { readonly profile: "private.current-footprint-forward-opening-historical-snapshot.v1"; readonly executionAuthorized: false }
export interface CurrentFootprintForwardOpeningOriginal {
  readonly records: DiagnosticLifecycleRecords;
  readonly opening: NonNullable<DiagnosticLifecycleRecords["worker-startup-opening-intent.json"]>;
  readonly originalBindingSha256: string; readonly originalOpeningIntentSha256: string;
  readonly operationId: string; readonly originalIntentSha256: string; readonly originalRosterSha256: string; readonly originalIdentitySha256: string;
  readonly originalProducerFacadeSha256: typeof currentFootprintForwardOpeningHistoricalIntentSchema.shape.facadeSha256.value;
  readonly originalInstallationSha256: string; readonly intent: z.infer<typeof currentFootprintForwardOpeningHistoricalIntentSchema>;
}
const originals = new WeakMap<object, CurrentFootprintForwardOpeningOriginal>();
/** Every opening stage must be present and no later result, route or cleanup
 * may be inferred absent from a subset of the original directory. */
export const CURRENT_FOOTPRINT_FORWARD_OPENING_ORIGINAL_RECORDS = Object.freeze([
  "intent.json", "binding.json", "main-construction-intent.json", "main-construction-result.json",
  "browser-intent.json", "browser-result.json", "frames-intent.json", "frames-result.json",
  "script-intent.json", "script-result.json", "worker-startup-handoff-intent.json",
  "worker-startup-handoff-result.json", "worker-startup-opening-intent.json",
] as const);
async function readOriginal(operationId: string): Promise<CurrentFootprintForwardOpeningOriginal> {
  currentFootprintForwardOpeningHistoricalIntentSchema.shape.operationId.parse(operationId);
  const directory = join(controlDataDirectory(), ORIGINAL_DIRECTORY, operationId);
  const slot = await readSlot(directory, CURRENT_FOOTPRINT_FORWARD_OPENING_ORIGINAL_RECORDS, false);
  need(slot !== null && slot.files.size === CURRENT_FOOTPRINT_FORWARD_OPENING_ORIGINAL_RECORDS.length);
  // The maintained reader checks every predecessor/digest and all other journal
  // Schemas. Its parsed chain must match the exact descriptor-captured bytes.
  const operations = await readCurrentPcbDiagnosticLifecycles();
  const operation = operations.find(value => value.operationId === operationId); need(operation !== undefined);
  const records = operation.records;
  need(Object.keys(records).length === CURRENT_FOOTPRINT_FORWARD_OPENING_ORIGINAL_RECORDS.length);
  const identities = [], roster = [];
  for (const name of CURRENT_FOOTPRINT_FORWARD_OPENING_ORIGINAL_RECORDS) {
    const file = slot.files.get(name); need(file !== undefined);
    const text = new TextDecoder("utf-8", { fatal: true }).decode(file.bytes);
    need(canonicalJson(JSON.parse(text) as unknown) === canonicalJson(records[name]));
    roster.push({ name, bytes: file.bytes.length, sha256: sha256Text(file.bytes.toString("utf8")) }); identities.push({ name, identity: file.identity });
  }
  const intent = currentFootprintForwardOpeningHistoricalIntentSchema.parse(records["intent.json"]);
  const binding = records["binding.json"], opening = records["worker-startup-opening-intent.json"];
  need(binding !== undefined && binding.launchAcknowledged && opening !== undefined && intent.operationId === operationId &&
    records["main-construction-result.json"] !== undefined && records["script-intent.json"]?.family === "ui" &&
    records["script-result.json"]?.result["sourceVerified"] === true);
  const after = await readSlot(directory, CURRENT_FOOTPRINT_FORWARD_OPENING_ORIGINAL_RECORDS, false);
  need(after !== null && after.identity === slot.identity && [...slot.files].every(([name, file]) =>
    after.files.get(name)?.identity === file.identity && after.files.get(name)?.bytes.equals(file.bytes) === true));
  return Object.freeze({ operationId, records: Object.freeze(records), opening: Object.freeze(opening),
    originalIntentSha256: sha256Json(intent), originalBindingSha256: sha256Json(binding), originalOpeningIntentSha256: sha256Json(opening),
    originalRosterSha256: sha256Json(roster), originalIdentitySha256: sha256Json({ directory: slot.identity, files: identities }),
    originalProducerFacadeSha256: intent.facadeSha256, originalInstallationSha256: intent.installationSha256, intent: Object.freeze(intent) });
}
/** Mint an opaque token only after validating every original byte, identity and chain predecessor. */
export async function readCurrentFootprintForwardOpeningHistoricalSnapshot(operationId: string): Promise<CurrentFootprintForwardOpeningHistoricalSnapshot> {
  const original = await readOriginal(operationId);
  const token = Object.freeze({ profile: "private.current-footprint-forward-opening-historical-snapshot.v1" as const, executionAuthorized: false as const });
  originals.set(token, original); return token;
}
/** Copied token fields cannot recover the private immutable original record binding. */
export function requireCurrentFootprintForwardOpeningHistoricalSnapshot(token: CurrentFootprintForwardOpeningHistoricalSnapshot): CurrentFootprintForwardOpeningOriginal {
  const original = originals.get(token); need(original !== undefined); return original;
}
/** Reopen the original slot and compare its complete raw/descriptor binding before publication or admission. */
export async function assertCurrentFootprintForwardOpeningHistoricalSnapshot(token: CurrentFootprintForwardOpeningHistoricalSnapshot): Promise<void> {
  const original = requireCurrentFootprintForwardOpeningHistoricalSnapshot(token);
  need(canonicalJson(await readOriginal(original.operationId)) === canonicalJson(original));
}
/** Join sidecars to every original digest, rather than to the operation name alone. */
function matchingOriginal(record: CurrentFootprintForwardOpeningOriginal | CurrentFootprintForwardOpeningRelinquishmentIntent | CurrentFootprintForwardOpeningRelinquishmentResult, original: CurrentFootprintForwardOpeningOriginal): boolean {
  return (["operationId", "originalIntentSha256", "originalBindingSha256", "originalOpeningIntentSha256", "originalRosterSha256", "originalIdentitySha256", "originalProducerFacadeSha256", "originalInstallationSha256"] as const)
    .every(key => record[key] === original[key]);
}
/** A partial or contradictory sidecar cannot relinquish the original launch blocker. */
export async function readCurrentFootprintForwardOpeningRelinquishment(token: CurrentFootprintForwardOpeningHistoricalSnapshot): Promise<Readonly<{
  intent: CurrentFootprintForwardOpeningRelinquishmentIntent; result: CurrentFootprintForwardOpeningRelinquishmentResult | null;
}> | null> {
  const original = requireCurrentFootprintForwardOpeningHistoricalSnapshot(token);
  await assertCurrentFootprintForwardOpeningHistoricalSnapshot(token);
  const slot = await readSlot(join(controlDataDirectory(), CURRENT_FOOTPRINT_FORWARD_OPENING_RELINQUISHMENT_DIRECTORY, original.operationId), ["intent.json", "relinquished.json"], true);
  if (slot === null) { return null; }
  const intentBytes = slot.files.get("intent.json")?.bytes; need(intentBytes !== undefined);
  const intent = currentFootprintForwardOpeningRelinquishmentIntentSchema.parse(JSON.parse(intentBytes.toString("utf8")) as unknown); need(matchingOriginal(intent, original));
  const resultBytes = slot.files.get("relinquished.json")?.bytes;
  const result = resultBytes === undefined ? null : currentFootprintForwardOpeningRelinquishmentResultSchema.parse(JSON.parse(resultBytes.toString("utf8")) as unknown);
  need(result === null || matchingOriginal(result, original) && result.relinquishmentIntentSha256 === sha256Json(intent) &&
    result.fileProof.projectUuid === original.opening.target.projectUuid && result.fileProof.branchUuid === original.opening.target.branchUuid &&
    result.fileProof.documentUuid === original.opening.target.documentUuid && result.fileProof.rawSourceSha256 === original.opening.target.expectedSourceSha256 &&
    result.fileProof.oldCheckpointSha256 === original.opening.preparationCheckpoint.sha256 &&
    result.fileProof.oldCheckpointReceiptSha256 === original.opening.checkpointReceiptSha256 &&
    result.fileProof.beforeSqlSha256 === original.opening.beforeSqlSha256 && result.fileProof.freshSqlSha256 === original.opening.beforeSqlSha256 &&
    result.fileProof.oldHistorySemanticSha256 === result.fileProof.freshHistorySemanticSha256);
  await assertCurrentFootprintForwardOpeningHistoricalSnapshot(token); return Object.freeze({ intent, result });
}
/** Exclusively append a sidecar while rechecking the original slot around durable publication. */
export async function publishCurrentFootprintForwardOpeningRelinquishment(token: CurrentFootprintForwardOpeningHistoricalSnapshot,
  name: "intent.json" | "relinquished.json", value: CurrentFootprintForwardOpeningRelinquishmentIntent | CurrentFootprintForwardOpeningRelinquishmentResult): Promise<void> {
  const original = requireCurrentFootprintForwardOpeningHistoricalSnapshot(token);
  const record = (name === "intent.json" ? currentFootprintForwardOpeningRelinquishmentIntentSchema : currentFootprintForwardOpeningRelinquishmentResultSchema).parse(value); need(matchingOriginal(record, original));
  await assertCurrentFootprintForwardOpeningHistoricalSnapshot(token);
  await publishManagedAttachmentExclusive(join(controlDataDirectory(), CURRENT_FOOTPRINT_FORWARD_OPENING_RELINQUISHMENT_DIRECTORY, original.operationId, name),
    "Forward opening historical relinquishment", Buffer.from(`${JSON.stringify(record)}\n`), "easyeda-pro-control.forward-opening-unknown-relinquishment.v1",
    () => assertCurrentFootprintForwardOpeningHistoricalSnapshot(token));
  await assertCurrentFootprintForwardOpeningHistoricalSnapshot(token);
}
