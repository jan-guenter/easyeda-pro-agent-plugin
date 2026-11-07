/** Append-only historical receipt for the exact reviewed terminated Pad case. */
import { constants } from "node:fs";
import type { BigIntStats } from "node:fs";
import { lstat, open, readdir } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import { controlDataDirectory, controlRootCapability, publishManagedAttachmentExclusive, verifyExactManagedArtifact } from "./artifacts.ts";
import { canonicalJson, sha256Json, sha256Text } from "./core.ts";
// oxlint-disable-next-line import/no-cycle -- Lazy historical checks share the original chain validator without initialization-time calls.
import { readCurrentPcbDiagnosticLifecycles } from "./current-pcb-diagnostic-lifecycle-journal.ts";
import type { DiagnosticLifecycleRecords } from "./current-pcb-diagnostic-lifecycle-journal.ts";
import { GENERATED_READER_KNOWN_FACADE_SHA256, GENERATED_READER_KNOWN_ROSTER_SHA256, GENERATED_READER_RELINQUISHMENT_DIRECTORY,
  currentGeneratedReaderRelinquishmentIntentSchema, currentGeneratedReaderRelinquishmentRequestSchema, currentGeneratedReaderRelinquishmentResultSchema } from "./current-generated-reader-relinquishment-contract.ts";
import type { GeneratedReaderRelinquishmentIntent, GeneratedReaderRelinquishmentResult } from "./current-generated-reader-relinquishment-contract.ts";

const MAX_BYTES = 524_288, ORIGINAL_DIRECTORY = "pcb-diagnostic-lifecycle-v1";
/** Fail closed on an incomplete or replaced managed history boundary. */
function need(value: boolean): asserts value { if (!value) { throw new Error("GENERATED_READER_RELINQUISHMENT_JOURNAL_REFUSED"); } }
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

export interface GeneratedReaderHistoricalSnapshot { readonly profile: "private.generated-reader-closed-historical-snapshot.v1" }
export interface GeneratedReaderHistoricalOriginal {
  readonly operationId: string; readonly records: DiagnosticLifecycleRecords;
  readonly originalRosterSha256: typeof GENERATED_READER_KNOWN_ROSTER_SHA256;
  readonly originalIdentitySha256: string; readonly originalIntentSha256: string; readonly originalCaptureSha256: string;
  readonly originalProducerFacadeSha256: typeof GENERATED_READER_KNOWN_FACADE_SHA256;
}
const issued = new WeakMap<GeneratedReaderHistoricalSnapshot, GeneratedReaderHistoricalOriginal>();
export const GENERATED_READER_ORIGINAL_RECORDS = Object.freeze([
  "binding.json", "browser-intent.json", "browser-result.json", "close-acknowledged.json", "close-intent.json",
  "frames-intent.json", "frames-result.json", "generated-closed-capture-intent.json", "generated-closed-capture-result.json", "intent.json",
  "pcb-open-intent.json", "pcb-open-result.json", "pcb-opening-intent.json", "pcb-opening-result.json", "project-opening-intent.json",
  "project-opening-result.json", "script-intent.json", "script-result.json", "spatial209-intent.json", "spatial209-result.json", "terminated.json",
] as const);
const artifact = z.looseObject({ path: z.string(), bytes: z.number().int().positive().max(67_108_864), sha256: z.string().regex(/^[a-f0-9]{64}$/u) });
const reportSchema = z.looseObject({ schema: z.literal("easyeda-pro-control.generated-pad-reader-closed-snapshot.v1"),
  snapshot: artifact, sql: artifact, rawHistory: artifact, completeSqlInventoryCaptured: z.literal(true), sourceEqualsInitialBytes: z.literal(true),
  originalReaderRootAndJobReobservedClosed: z.literal(true), oldImportDestinationHandlesRetained: z.literal(false), oldImportRuntimeAdopted: z.literal(false),
  newReadOpenTargetIssued: z.literal(false), writerAuthority: z.literal(false), startupEffectsAccepted: z.literal(false), completeSqlEffectsAccepted: z.literal(false) });

async function readOriginal(operationId: string): Promise<GeneratedReaderHistoricalOriginal> {
  currentGeneratedReaderRelinquishmentRequestSchema.shape.operationId.parse(operationId);
  const directory = join(controlDataDirectory(), ORIGINAL_DIRECTORY, operationId);
  const slot = await readSlot(directory, GENERATED_READER_ORIGINAL_RECORDS, false);
  need(slot !== null && slot.files.size === GENERATED_READER_ORIGINAL_RECORDS.length);
  const operations = await readCurrentPcbDiagnosticLifecycles();
  const operation = operations.find(value => value.operationId === operationId); need(operation !== undefined);
  const records = operation.records; need(Object.keys(records).length === GENERATED_READER_ORIGINAL_RECORDS.length);
  const identities = [], roster = [];
  for (const name of GENERATED_READER_ORIGINAL_RECORDS) {
    const file = slot.files.get(name); need(file !== undefined);
    const text = new TextDecoder("utf-8", { fatal: true }).decode(file.bytes);
    need(canonicalJson(JSON.parse(text) as unknown) === canonicalJson(records[name]));
    roster.push({ name, bytes: file.bytes.length, sha256: sha256Text(text) }); identities.push({ name, identity: file.identity });
  }
  need(sha256Json(roster) === GENERATED_READER_KNOWN_ROSTER_SHA256);
  const captured = records["generated-closed-capture-result.json"], intent = records["intent.json"], terminated = records["terminated.json"];
  need(intent?.schema === "easyeda-pro-control.pcb209-spatial-launch-intent.v1" && intent.facadeSha256 === GENERATED_READER_KNOWN_FACADE_SHA256 &&
    captured !== undefined && captured.failure === null && terminated?.originalRootExited === true && terminated.originalJobEmpty);
  const report = reportSchema.parse(captured.report);
  for (const reference of [report.snapshot, report.sql, report.rawHistory]) { await verifyExactManagedArtifact(reference); }
  const after = await readSlot(directory, GENERATED_READER_ORIGINAL_RECORDS, false);
  need(after !== null && after.identity === slot.identity && [...slot.files].every(([name, file]) =>
    after.files.get(name)?.identity === file.identity && after.files.get(name)?.bytes.equals(file.bytes) === true));
  return Object.freeze({ operationId, records: Object.freeze(records), originalRosterSha256: GENERATED_READER_KNOWN_ROSTER_SHA256,
    originalIdentitySha256: sha256Json({ directory: slot.identity, files: identities }), originalIntentSha256: sha256Json(intent),
    originalCaptureSha256: sha256Json(captured), originalProducerFacadeSha256: GENERATED_READER_KNOWN_FACADE_SHA256 });
}
export async function readGeneratedReaderHistoricalSnapshot(operationId: string): Promise<GeneratedReaderHistoricalSnapshot> {
  const original = await readOriginal(operationId);
  const token = Object.freeze({ profile: "private.generated-reader-closed-historical-snapshot.v1" as const }); issued.set(token, original); return token;
}
export function requireGeneratedReaderHistoricalSnapshot(token: GeneratedReaderHistoricalSnapshot): GeneratedReaderHistoricalOriginal {
  const original = issued.get(token); need(original !== undefined); return original;
}
export async function assertGeneratedReaderHistoricalSnapshot(token: GeneratedReaderHistoricalSnapshot): Promise<void> {
  const original = requireGeneratedReaderHistoricalSnapshot(token); need(canonicalJson(await readOriginal(original.operationId)) === canonicalJson(original));
}
function matches(record: GeneratedReaderRelinquishmentIntent | GeneratedReaderRelinquishmentResult, original: GeneratedReaderHistoricalOriginal): boolean {
  return (["operationId", "originalRosterSha256", "originalIdentitySha256", "originalIntentSha256", "originalCaptureSha256", "originalProducerFacadeSha256"] as const)
    .every(key => record[key] === original[key]);
}
export async function readGeneratedReaderRelinquishment(token: GeneratedReaderHistoricalSnapshot): Promise<Readonly<{
  intent: GeneratedReaderRelinquishmentIntent; result: GeneratedReaderRelinquishmentResult | null;
}> | null> {
  const original = requireGeneratedReaderHistoricalSnapshot(token); await assertGeneratedReaderHistoricalSnapshot(token);
  const slot = await readSlot(join(controlDataDirectory(), GENERATED_READER_RELINQUISHMENT_DIRECTORY, original.operationId), ["intent.json", "relinquished.json"], true);
  if (slot === null) { return null; }
  const first = slot.files.get("intent.json"); need(first !== undefined);
  const intent = currentGeneratedReaderRelinquishmentIntentSchema.parse(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(first.bytes)) as unknown);
  const last = slot.files.get("relinquished.json");
  const result = last === undefined ? null : currentGeneratedReaderRelinquishmentResultSchema.parse(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(last.bytes)) as unknown);
  need(matches(intent, original) && (result === null || matches(result, original) && result.relinquishmentIntentSha256 === sha256Json(intent)));
  await assertGeneratedReaderHistoricalSnapshot(token); return Object.freeze({ intent, result });
}
export async function publishGeneratedReaderRelinquishment(token: GeneratedReaderHistoricalSnapshot,
  name: "intent.json" | "relinquished.json", input: GeneratedReaderRelinquishmentIntent | GeneratedReaderRelinquishmentResult): Promise<void> {
  const original = requireGeneratedReaderHistoricalSnapshot(token);
  const record = (name === "intent.json" ? currentGeneratedReaderRelinquishmentIntentSchema : currentGeneratedReaderRelinquishmentResultSchema).parse(input); need(matches(record, original));
  await assertGeneratedReaderHistoricalSnapshot(token);
  await publishManagedAttachmentExclusive(join(controlDataDirectory(), GENERATED_READER_RELINQUISHMENT_DIRECTORY, original.operationId, name),
    "Historical closed generated reader relinquishment", Buffer.from(`${JSON.stringify(record)}\n`), "generated-reader-closed-relinquishment.v1",
    () => assertGeneratedReaderHistoricalSnapshot(token));
  await assertGeneratedReaderHistoricalSnapshot(token);
}
