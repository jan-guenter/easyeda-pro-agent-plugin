/** Separate append-only relinquishment receipts. The original journal is read-only. */
import { constants } from "node:fs";
import type { BigIntStats } from "node:fs";
import { lstat, open, readdir } from "node:fs/promises";
import { join } from "node:path";
import type { z } from "zod";
import { controlDataDirectory, controlRootCapability, publishManagedAttachmentExclusive } from "./artifacts.ts";
import { canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { CURRENT_FOOTPRINT_COMBINED_ABANDONMENT_DIRECTORY, currentFootprintCombinedAbandonmentIntentSchema,
  currentFootprintCombinedAbandonmentResultSchema, currentFootprintCombinedHistoricalIntentSchema } from "./current-footprint-combined-abandonment-contract.ts";
import type { CurrentFootprintCombinedAbandonmentIntent, CurrentFootprintCombinedAbandonmentResult } from "./current-footprint-combined-abandonment-contract.ts";

const MAX_BYTES = 16_384, ORIGINAL_DIRECTORY = "pcb-diagnostic-lifecycle-v1";
function need(value: boolean): asserts value { if (!value) { throw new Error("COMBINED_ABANDONMENT_JOURNAL_REFUSED"); } }
function absent(error: unknown): boolean { return error instanceof Error && "code" in error && error.code === "ENOENT"; }
function identity(stat: BigIntStats): string { return [stat.dev, stat.ino, stat.mode, stat.uid, stat.nlink, stat.size, stat.mtimeNs, stat.ctimeNs].join(":"); }
interface ReadSlot { readonly identity: string; readonly files: ReadonlyMap<string, Readonly<{ bytes: Buffer; identity: string }>> }
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
export interface CurrentFootprintCombinedHistoricalSnapshot { readonly profile: "private.current-footprint-combined-historical-snapshot.v1"; readonly executionAuthorized: false }
interface Original {
  readonly operationId: string; readonly originalIntentSha256: string; readonly originalRosterSha256: string; readonly originalIdentitySha256: string;
  readonly originalProducerFacadeSha256: typeof currentFootprintCombinedHistoricalIntentSchema.shape.facadeSha256.value;
  readonly originalInstallationSha256: string; readonly intent: z.infer<typeof currentFootprintCombinedHistoricalIntentSchema>;
}
const originals = new WeakMap<object, Original>();
async function readOriginal(operationId: string): Promise<Original> {
  currentFootprintCombinedHistoricalIntentSchema.shape.operationId.parse(operationId);
  const slot = await readSlot(join(controlDataDirectory(), ORIGINAL_DIRECTORY, operationId), ["intent.json"], false);
  const file = slot?.files.get("intent.json"); need(slot !== null && slot.files.size === 1 && file !== undefined);
  const decoded = new TextDecoder("utf-8", { fatal: true }).decode(file.bytes);
  const intent = currentFootprintCombinedHistoricalIntentSchema.parse(JSON.parse(decoded) as unknown); need(intent.operationId === operationId);
  const rawSha256 = sha256Text(file.bytes.toString("utf8"));
  return Object.freeze({ operationId, originalIntentSha256: sha256Json(intent),
    originalRosterSha256: sha256Json([{ name: "intent.json", bytes: file.bytes.length, sha256: rawSha256 }]),
    originalIdentitySha256: sha256Json({ directory: slot.identity, file: file.identity }),
    originalProducerFacadeSha256: intent.facadeSha256, originalInstallationSha256: intent.installationSha256, intent: Object.freeze(intent) });
}
export async function readCurrentFootprintCombinedHistoricalSnapshot(operationId: string): Promise<CurrentFootprintCombinedHistoricalSnapshot> {
  const original = await readOriginal(operationId);
  const token = Object.freeze({ profile: "private.current-footprint-combined-historical-snapshot.v1" as const, executionAuthorized: false as const });
  originals.set(token, original); return token;
}
export function requireCurrentFootprintCombinedHistoricalSnapshot(token: CurrentFootprintCombinedHistoricalSnapshot): Original {
  const original = originals.get(token); need(original !== undefined); return original;
}
export async function assertCurrentFootprintCombinedHistoricalSnapshot(token: CurrentFootprintCombinedHistoricalSnapshot): Promise<void> {
  const original = requireCurrentFootprintCombinedHistoricalSnapshot(token);
  need(canonicalJson(await readOriginal(original.operationId)) === canonicalJson(original));
}
function matchingOriginal(record: Original | CurrentFootprintCombinedAbandonmentIntent | CurrentFootprintCombinedAbandonmentResult, original: Original): boolean {
  return (["operationId", "originalIntentSha256", "originalRosterSha256", "originalIdentitySha256", "originalProducerFacadeSha256", "originalInstallationSha256"] as const)
    .every(key => record[key] === original[key]);
}
export async function readCurrentFootprintCombinedAbandonment(token: CurrentFootprintCombinedHistoricalSnapshot): Promise<Readonly<{
  intent: CurrentFootprintCombinedAbandonmentIntent; result: CurrentFootprintCombinedAbandonmentResult | null;
}> | null> {
  const original = requireCurrentFootprintCombinedHistoricalSnapshot(token);
  await assertCurrentFootprintCombinedHistoricalSnapshot(token);
  const slot = await readSlot(join(controlDataDirectory(), CURRENT_FOOTPRINT_COMBINED_ABANDONMENT_DIRECTORY, original.operationId), ["intent.json", "abandoned.json"], true);
  if (slot === null) { return null; }
  const intentBytes = slot.files.get("intent.json")?.bytes; need(intentBytes !== undefined);
  const intent = currentFootprintCombinedAbandonmentIntentSchema.parse(JSON.parse(intentBytes.toString("utf8")) as unknown); need(matchingOriginal(intent, original));
  const resultBytes = slot.files.get("abandoned.json")?.bytes;
  const result = resultBytes === undefined ? null : currentFootprintCombinedAbandonmentResultSchema.parse(JSON.parse(resultBytes.toString("utf8")) as unknown);
  need(result === null || matchingOriginal(result, original) && result.abandonmentIntentSha256 === sha256Json(intent));
  await assertCurrentFootprintCombinedHistoricalSnapshot(token); return Object.freeze({ intent, result });
}
export async function publishCurrentFootprintCombinedAbandonment(token: CurrentFootprintCombinedHistoricalSnapshot,
  name: "intent.json" | "abandoned.json", value: CurrentFootprintCombinedAbandonmentIntent | CurrentFootprintCombinedAbandonmentResult): Promise<void> {
  const original = requireCurrentFootprintCombinedHistoricalSnapshot(token);
  const record = (name === "intent.json" ? currentFootprintCombinedAbandonmentIntentSchema : currentFootprintCombinedAbandonmentResultSchema).parse(value); need(matchingOriginal(record, original));
  await assertCurrentFootprintCombinedHistoricalSnapshot(token);
  await publishManagedAttachmentExclusive(join(controlDataDirectory(), CURRENT_FOOTPRINT_COMBINED_ABANDONMENT_DIRECTORY, original.operationId, name),
    "Combined historical relinquishment", Buffer.from(`${JSON.stringify(record)}\n`), "easyeda-pro-control.combined-unknown-abandonment.v1",
    () => assertCurrentFootprintCombinedHistoricalSnapshot(token));
  await assertCurrentFootprintCombinedHistoricalSnapshot(token);
}
