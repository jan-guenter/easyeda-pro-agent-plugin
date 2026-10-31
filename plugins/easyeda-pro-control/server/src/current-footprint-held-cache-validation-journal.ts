/** Append-only private diagnostic evidence. A complete chain can block another
 * launch or describe history, but cannot recreate an original native owner. */
import { constants } from "node:fs";
import type { BigIntStats, Dirent } from "node:fs";
import { lstat, mkdir, open, opendir } from "node:fs/promises";
import { join } from "node:path";
import { controlDataDirectory, controlRootCapability, publishManagedAttachmentExclusive } from "./artifacts.ts";
import type { ControlRootDirectory } from "./control-root.ts";
import { canonicalJson, sha256Json } from "./core.ts";
import { CURRENT_FOOTPRINT_HELD_CACHE_VALIDATION_RECORD_BYTES as RECORD_BYTES, assertFootprintHeldCacheJournalBudget,
  currentFootprintHeldCacheValidationIdSchema, currentFootprintHeldCacheValidationRecordSchema, currentFootprintHeldCacheValidationRequestSchema } from "./current-footprint-held-cache-validation-schema.ts";
import type { CurrentFootprintHeldCacheValidationRecord as RecordEntry } from "./current-footprint-held-cache-validation-schema.ts";

const DIRECTORY = "footprint-held-cache-validation-v1", MAX_OPERATIONS = 128, MAX_RECORDS = 512, OPERATION_BYTES = 8 * 1024 * 1024;
export interface FootprintHeldCacheValidationJournal { readonly operationId: string; readonly records: readonly RecordEntry[]; readonly bytes: number }

/** Refuse malformed durable evidence without turning it into native authority. */
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`HELD_CACHE_VALIDATION_JOURNAL_${code}`); } }

/** Identify only actual missing managed paths; other filesystem errors refuse. */
function absent(error: unknown): boolean { return error instanceof Error && "code" in error && error.code === "ENOENT"; }

/** Compare complete retained file/directory metadata around bounded reads. */
function same(a: BigIntStats, b: BigIntStats): boolean {
  return (["dev", "ino", "mode", "nlink", "size", "mtimeNs", "ctimeNs"] as const).every(key => a[key] === b[key]);
}

/** Validate consumed intent/result relationships independently of the hash
 * chain. In particular a standalone release row cannot settle a native launch. */
export function assertFootprintHeldCacheValidationChain(records: readonly RecordEntry[]): void {
  const seen = new Set<RecordEntry["kind"]>(); let branch: RecordEntry["kind"] | null = null, pendingPoll = false, polls = 0, terminal = false, terminated = false;
  const requirePrior = (kind: RecordEntry["kind"]): void => { need(seen.has(kind), "MISSING_INTENT_OR_PREDECESSOR"); };
  for (const [index, record] of records.entries()) {
    need(!terminal && (branch === null || record.kind === "failure" || record.kind === branch), "AFTER_TERMINAL_OR_CLEANUP_BRANCH");
    need(index !== 0 || record.kind === "launch-intent", "LAUNCH_INTENT_REQUIRED");
    if (record.kind !== "failure" && record.kind !== "termination-intent" && record.kind !== "termination-result") { need(!seen.has(record.kind), "DUPLICATE_STAGE"); }
    switch (record.kind) {
      case "launch-intent": {
        const request = currentFootprintHeldCacheValidationRequestSchema.parse(record.evidence["request"]);
        need(index === 0 && request.action === "launch" && request.operationId === record.operationId, "LAUNCH_REQUEST"); break;
      }
      case "prepared": { requirePrior("launch-intent"); break; }
      case "allocation-intent": { requirePrior("prepared"); break; }
      case "allocation-result": { requirePrior("allocation-intent"); need(record.evidence["retained"] === true, "ALLOCATION_RESULT"); break; }
      case "launch-result": { requirePrior("allocation-result"); break; }
      case "observe-first-intent": { requirePrior("launch-result"); break; }
      case "observe-first-result": { requirePrior("observe-first-intent"); break; }
      case "observe-fresh-intent": { requirePrior("observe-first-result"); break; }
      case "observe-fresh-result": { requirePrior("observe-fresh-intent"); break; }
      case "release-cache-intent": { requirePrior("observe-first-result"); break; }
      case "release-cache-result": { requirePrior("release-cache-intent"); need(record.evidence["released"] === true, "CACHE_RELEASE_RESULT"); break; }
      case "normal-close-intent": case "abort-intent": { requirePrior("allocation-intent"); break; }
      case "normal-close-result": { requirePrior("normal-close-intent"); break; }
      case "abort-result": { requirePrior("abort-intent"); break; }
      case "termination-intent": {
        need((seen.has("normal-close-intent") || seen.has("abort-intent")) && !pendingPoll && !terminated && polls < 240 &&
          record.evidence["ordinal"] === polls + 1, "TERMINATION_INTENT"); polls += 1; pendingPoll = true; break;
      }
      case "termination-result": {
        need(pendingPoll && record.evidence["ordinal"] === polls && typeof record.evidence["originalRootAndJobTerminated"] === "boolean", "TERMINATION_RESULT");
        pendingPoll = false; terminated = record.evidence["originalRootAndJobTerminated"]; break;
      }
      case "release-closed-intent": { need(terminated, "ORIGINAL_TERMINATION_REQUIRED"); break; }
      case "release-closed-result": { requirePrior("release-closed-intent"); need(terminated && record.evidence["released"] === true, "RELEASE_RESULT"); terminal = true; break; }
      case "cleanup-unlaunched-intent": case "cleanup-no-process-intent": {
        requirePrior("allocation-intent"); need(!seen.has("launch-result"), "ROOT_LAUNCH_CONTRADICTS_HELPER_ONLY_CLEANUP");
        branch = record.kind === "cleanup-unlaunched-intent" ? "cleanup-unlaunched-result" : "cleanup-no-process-result"; break;
      }
      case "cleanup-unlaunched-result": { requirePrior("cleanup-unlaunched-intent"); need(record.evidence["helperReleased"] === true, "HELPER_RELEASE_RESULT"); terminal = true; break; }
      case "cleanup-no-process-result": { requirePrior("cleanup-no-process-intent"); need(record.evidence["helperReleased"] === true, "HELPER_RELEASE_RESULT"); terminal = true; break; }
      case "cleanup-no-resource-result": {
        requirePrior("allocation-intent"); need(!seen.has("allocation-result") && record.evidence["nativeAllocationOutcome"] === "no-resource", "NO_RESOURCE_RESULT"); terminal = true; break;
      }
      case "failure": {
        if (record.evidence["nativeAllocationNeverAttempted"] === true) { need(!seen.has("allocation-result") && !seen.has("launch-result"), "CONTRADICTORY_NO_ALLOCATION"); terminal = true; }
        if (record.evidence["action"] === "observe-termination") { pendingPoll = false; }
        break;
      }
      default: { throw new Error("HELD_CACHE_VALIDATION_JOURNAL_KIND"); }
    }
    seen.add(record.kind);
  }
}

/** Enumerate a fixed bounded roster through the original directory descriptor. */
async function entries(directory: ControlRootDirectory, bound: number): Promise<Dirent[]> {
  const handle = await opendir(`/proc/self/fd/${directory.handle.fd}`), result: Dirent[] = [];
  for await (const entry of handle) { need(result.length < bound, "ROSTER_BOUND"); result.push(entry); }
  return result.toSorted((a, b) => a.name.localeCompare(b.name));
}

/** Read one complete private regular file with symlink refusal, exact EOF and
 * descriptor/path identity checks. Malformed UTF-8 is never repaired. */
async function read(directory: ControlRootDirectory, name: string): Promise<Readonly<{ record: RecordEntry; bytes: number }>> {
  const path = `/proc/self/fd/${directory.handle.fd}/${name}`;
  // oxlint-disable-next-line no-bitwise -- Private journal evidence must not follow links or block on a substituted device.
  const handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const before = await handle.stat({ bigint: true });
    need(before.isFile() && before.nlink === 1n && before.mode % 512n === 0o600n && typeof process.getuid === "function" &&
      before.uid === BigInt(process.getuid()) && before.size > 0n && before.size <= BigInt(RECORD_BYTES), "FILE_AUTHORITY");
    const bytes = Buffer.alloc(Number(before.size) + 1); let count = 0;
    while (count < bytes.length) { const chunk = await handle.read(bytes, count, bytes.length - count, count); if (chunk.bytesRead === 0) { break; } count += chunk.bytesRead; }
    need(count === Number(before.size) && same(before, await handle.stat({ bigint: true })) && same(before, await lstat(path, { bigint: true })), "FILE_CHANGED");
    const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(0, count));
    const value: unknown = JSON.parse(text);
    return { record: currentFootprintHeldCacheValidationRecordSchema.parse(value), bytes: count };
  } finally { await handle.close(); }
}

/** Read a complete immutable operation roster and verify every sequence/hash
 * link. Replaced parents, extra files and partial publications refuse. */
export async function readFootprintHeldCacheValidation(operationId: string): Promise<FootprintHeldCacheValidationJournal | null> {
  currentFootprintHeldCacheValidationIdSchema.parse(operationId);
  const absolute = join(controlDataDirectory(), DIRECTORY, operationId), root = await controlRootCapability(false);
  const directory = await root.openDirectory(absolute, false).catch((error: unknown) => { if (absent(error)) { return null; } throw error; });
  if (directory === null) { await root.assertCurrent(); return null; }
  try {
    const initial = await directory.handle.stat({ bigint: true }), records: RecordEntry[] = [], roster = await entries(directory, MAX_RECORDS);
    let bytes = 0;
    for (const entry of roster) {
      need(entry.isFile() && /^\d{3}-[a-z-]+\.json$/u.test(entry.name), "UNKNOWN_RECORD");
      const captured = await read(directory, entry.name), record = captured.record;
      need(record.operationId === operationId && record.sequence === records.length &&
        entry.name === `${String(record.sequence).padStart(3, "0")}-${record.kind}.json` &&
        record.previousSha256 === (records.length === 0 ? null : sha256Json(records.at(-1))), "CHAIN");
      bytes += captured.bytes; need(bytes <= OPERATION_BYTES, "OPERATION_BYTES"); records.push(record);
    }
    assertFootprintHeldCacheValidationChain(records); assertFootprintHeldCacheJournalBudget(records); need(same(initial, await directory.handle.stat({ bigint: true })), "ROSTER_CHANGED");
    const current = await root.openDirectory(absolute, false);
    try { need(current.info.dev === directory.info.dev && current.info.ino === directory.info.ino, "PATH_CHANGED"); }
    finally { await current.handle.close(); }
    await root.assertCurrent(); return Object.freeze({ operationId, records: Object.freeze(records), bytes });
  } finally { await directory.handle.close(); }
}

/** Visit one bounded operation at a time under the original parent roster.
 * A global gate never accumulates128 complete8MiB record graphs in memory. */
async function visitOperations(visit: (operation: FootprintHeldCacheValidationJournal) => void): Promise<void> {
  const absolute = join(controlDataDirectory(), DIRECTORY), root = await controlRootCapability(false);
  const parent = await root.openDirectory(absolute, false).catch((error: unknown) => { if (absent(error)) { return null; } throw error; });
  if (parent === null) { await root.assertCurrent(); return; }
  try {
    const before = await parent.handle.stat({ bigint: true }), roster = await entries(parent, MAX_OPERATIONS);
    for (const entry of roster) {
      need(entry.isDirectory() && currentFootprintHeldCacheValidationIdSchema.safeParse(entry.name).success, "UNKNOWN_OPERATION");
      const operation = await readFootprintHeldCacheValidation(entry.name); need(operation !== null, "OPERATION_DISAPPEARED"); visit(operation);
    }
    need(same(before, await parent.handle.stat({ bigint: true })), "PARENT_CHANGED");
    const current = await root.openDirectory(absolute, false);
    try { need(current.info.dev === parent.info.dev && current.info.ino === parent.info.ino, "PARENT_PATH_CHANGED"); }
    finally { await current.handle.close(); }
    await root.assertCurrent();
  } finally { await parent.handle.close(); }
}

/** List bounded summaries; detailed records remain available only per operation. */
export async function readFootprintHeldCacheValidations(): Promise<readonly Readonly<{ operationId: string; records: number; bytes: number }>[]> {
  const result: { operationId: string; records: number; bytes: number }[] = [];
  await visitOperations(operation => { result.push({ operationId: operation.operationId, records: operation.records.length, bytes: operation.bytes }); });
  return result;
}

/** Fail closed on every unsettled diagnostic, including an empty reserved
 * directory. Excluding one's current operation never recreates its owner. */
export async function assertNoUnresolvedFootprintHeldCacheValidation(exceptOperationId?: string): Promise<void> {
  if (exceptOperationId !== undefined) { currentFootprintHeldCacheValidationIdSchema.parse(exceptOperationId); }
  await visitOperations(operation => {
    if (operation.operationId !== exceptOperationId) {
      const last = operation.records.at(-1);
      need(last !== undefined && (last.kind === "release-closed-result" && last.evidence["released"] === true ||
        (last.kind === "cleanup-unlaunched-result" || last.kind === "cleanup-no-process-result") && last.evidence["helperReleased"] === true ||
        last.kind === "cleanup-no-resource-result" && last.evidence["nativeAllocationOutcome"] === "no-resource" ||
        last.kind === "failure" && last.evidence["nativeAllocationNeverAttempted"] === true), "UNRESOLVED_OWNER");
    }
  });
}

/** Reserve a fresh operation directory before checkpoint or native work. */
export async function reserveFootprintHeldCacheValidation(operationId: string): Promise<void> {
  currentFootprintHeldCacheValidationIdSchema.parse(operationId);
  const root = await controlRootCapability();
  const parent = await root.openDirectory(join(controlDataDirectory(), DIRECTORY));
  try { await mkdir(`/proc/self/fd/${parent.handle.fd}/${operationId}`, { mode: 0o700 }); await parent.handle.sync(); await root.assertCurrent(); }
  finally { await parent.handle.close(); }
}

/** Publish one original retained record, or observe its exact already-published
 * bytes after an acknowledgment failure. This retries no native operation. */
export async function publishFootprintHeldCacheValidationRecord(input: RecordEntry): Promise<void> {
  const record = currentFootprintHeldCacheValidationRecordSchema.parse(input);
  const prior = await readFootprintHeldCacheValidation(record.operationId);
  need(prior !== null && prior.records.length >= record.sequence && prior.records.length <= record.sequence + 1, "PUBLICATION_POSITION");
  if (prior.records.length === record.sequence + 1) { need(canonicalJson(prior.records.at(-1)) === canonicalJson(record), "PUBLICATION_CHANGED"); return; }
  need(record.previousSha256 === (record.sequence === 0 ? null : sha256Json(prior.records.at(-1))), "PUBLICATION_PREDECESSOR");
  assertFootprintHeldCacheValidationChain([...prior.records, record]);
  const bytes = Buffer.from(`${JSON.stringify(record)}\n`); need(bytes.length <= RECORD_BYTES, "PUBLICATION_BOUND");
  need(prior.bytes + bytes.length <= OPERATION_BYTES, "OPERATION_BYTES"); assertFootprintHeldCacheJournalBudget([...prior.records, record]);
  await publishManagedAttachmentExclusive(join(controlDataDirectory(), DIRECTORY, record.operationId,
    `${String(record.sequence).padStart(3, "0")}-${record.kind}.json`), "Held-cache validation evidence", bytes,
  "easyeda-pro-control.footprint-held-cache-validation.v1");
}
