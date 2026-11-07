/* oxlint-disable import/max-dependencies -- Data-only closed capture composes descriptor-safe bytes, complete SQL and raw history without issuing any project or runtime authority. */
import { createHash, randomUUID } from "node:crypto";
import { constants } from "node:fs";
import type { BigIntStats } from "node:fs";
import { lstat, open, readdir, realpath } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { basename, dirname, join, win32 } from "node:path";
import { types } from "node:util";
import { controlDataDirectory, ensureManagedDirectory, publishManagedAttachmentExclusive } from "./artifacts.ts";
import { normalizeEasyedaProjectPath } from "./core.ts";
import { currentProcessSqlRuntime } from "./machine-profile.ts";
import { decodeNativeHistoryChunk, readNativeHistoryCheckpoint } from "./native-history.ts";
import { readExactSqlInventory, readerCompletion } from "./sqlite-inventory.ts";
import type { NativeSqlInventory, SqlCell, SqlRow, SqlTable } from "./sqlite-inventory-core.ts";

function need(value: boolean, reason: string): asserts value { if (!value) { throw new Error(`Generated reader closed capture refused: ${reason}.`); } }
export function generatedReaderClosedOwnData(input: unknown, names: readonly string[]): Readonly<Record<string, unknown>> {
  need(input !== null && typeof input === "object" && !Array.isArray(input) && !types.isProxy(input) && Object.getPrototypeOf(input) === Object.prototype, "plain original capture inputs");
  const keys = Reflect.ownKeys(input); need(keys.length === names.length && keys.every(key => typeof key === "string" && names.includes(key)), "exact capture input fields");
  return Object.fromEntries(names.map(name => { const descriptor = Object.getOwnPropertyDescriptor(input, name);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value"), "capture data property"); const value: unknown = descriptor.value; return [name, value]; }));
}
/** Inspect a candidate without invoking its fields. The actual provider
 * subsequently requires its genuine private initial-qualification brand. */
export function requireGeneratedReaderClosedQualificationData(input: unknown): void {
  need(input !== null && typeof input === "object" && !types.isProxy(input) && Object.getPrototypeOf(input) === Object.prototype, "original qualification data");
  for (const key of Reflect.ownKeys(input)) {
    need(typeof key === "string", "qualification field"); const descriptor = Object.getOwnPropertyDescriptor(input, key);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value"), "qualification data property");
    const value: unknown = descriptor.value;
    if (key === "target") { const target = generatedReaderClosedOwnData(value, ["rawWindowsPath", "projectUuid", "branchUuid", "documentUuid", "expectedSourceSha256"]); need(Object.values(target).every(field => typeof field === "string"), "qualification target data"); }
    else { need(typeof value === "string" || typeof value === "boolean" || typeof value === "number" && Number.isFinite(value), "qualification scalar data"); }
  }
}
function text(cell: SqlCell | undefined): string {
  need(cell?.kind === "text", "native history text cell"); const bytes = Buffer.from(cell.hex, "hex"), value = bytes.toString("utf8");
  need(Buffer.from(value, "utf8").equals(bytes), "native history UTF-8"); return value;
}
function fields(table: SqlTable, row: SqlRow): ReadonlyMap<string, SqlCell> {
  need(row.cells.length === table.columns.length, "complete native history row");
  return new Map(table.columns.map((column, index) => { const cell = row.cells[index]; need(typeof column["name"] === "string" && cell !== undefined, "native history column"); return [column["name"], cell]; }));
}
/** Complete decrypted data diagnostics, not chain/clock/source acceptance. Every
 * history_data row is covered or the whole raw diagnostic refuses. The original
 * complete SQL attachment still retains ciphertext when this decoder refuses.
 */
export async function decodeGeneratedReaderRawHistory(inventory: NativeSqlInventory): Promise<Readonly<Record<string, unknown>>> {
  readerCompletion(inventory); const history = new Map<string, string>();
  for (const table of inventory.tables.filter(value => /^project_history_[a-f0-9]{32}$/u.test(value.name))) {
    for (const row of table.rows) {
      const value = fields(table, row); const uuid = text(value.get("uuid")); const key = text(value.get("key"));
      need(/^[a-f0-9]{32}$/u.test(uuid) && /^[a-f0-9]{32}$/u.test(key) && (!history.has(uuid) || history.get(uuid) === key), "unambiguous native history key roster"); history.set(uuid, key);
    }
  }
  const dataTable = inventory.tables.find(table => table.name === "history_data"); need(dataTable !== undefined && dataTable.rows.length <= 256, "bounded complete history data table");
  const chunks: Record<string, unknown>[] = []; let total = 0;
  for (const row of dataTable.rows) {
    const value = fields(dataTable, row); const historyUuid = text(value.get("history_uuid")); const chunkUuid = text(value.get("uuid")); const key = history.get(historyUuid);
    need(key !== undefined && new RegExp(`^${historyUuid}(?:-[1-9][0-9]{0,3})?$`, "u").test(chunkUuid), "native history chunk/key linkage");
    const plaintext = await decodeNativeHistoryChunk({ historyUuid, keyHex: key, dataBase64: text(value.get("dataStr")) });
    total += Buffer.byteLength(plaintext); need(total <= 16_777_216, "complete plaintext budget");
    chunks.push({ historyUuid, chunkUuid, plaintext, plaintextBytes: Buffer.byteLength(plaintext), plaintextSha256: createHash("sha256").update(plaintext).digest("hex") });
  }
  readerCompletion(inventory);
  return { schema: "easyeda-pro-control.generated-reader-raw-history.v1", inventoryLogicalSha256: inventory.logicalSha256,
    chunkCount: chunks.length, plaintextBytes: total, chunks, completeHistoryDataRowsDecoded: true, semanticChainAccepted: false,
    clocksAccepted: false, startupEffectsAccepted: false, writerAuthority: false };
}
function same(left: BigIntStats, right: BigIntStats): boolean {
  return left.dev === right.dev && left.ino === right.ino && left.size === right.size && left.mtimeNs === right.mtimeNs &&
    left.ctimeNs === right.ctimeNs && left.birthtimeNs === right.birthtimeNs && left.nlink === right.nlink;
}
async function parentDirectory(path: string): Promise<FileHandle> {
  // oxlint-disable-next-line no-bitwise -- Each parent component must be a directory and must never follow a substituted symbolic link.
  const flags = constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW;
  let current = await open("/", flags);
  try {
    for (const segment of path.split("/").filter(value => value.length > 0)) {
      const entry = `/proc/self/fd/${current.fd}/${segment}`; const before = await lstat(entry, { bigint: true });
      need(before.isDirectory() && !before.isSymbolicLink(), "non-symlink source parent"); const next = await open(entry, flags);
      try { const after = await next.stat({ bigint: true }); need(after.isDirectory() && before.dev === after.dev && before.ino === after.ino, "stable source parent"); }
      catch (error) { await next.close(); throw error; }
      try { await current.close(); } catch (error) { await next.close(); throw error; } current = next;
    }
    return current;
  } catch (error) { await current.close(); throw error; }
}
async function releaseDescriptors(source: FileHandle | undefined, parent: FileHandle): Promise<void> {
  const closures = await Promise.allSettled([...(source === undefined ? [] : [source.close()]), parent.close()]);
  const failures: unknown[] = [];
  for (const closure of closures) { if (closure.status === "rejected") { const reason: unknown = closure.reason; failures.push(reason); } }
  if (failures.length > 0) { throw new AggregateError(failures, "Generated reader closed descriptor release failed."); }
}
export interface GeneratedReaderClosedDataOptions {
  readonly target: Readonly<{ rawWindowsPath: string; projectUuid: string; expectedSourceSha256: string }>;
  readonly originalQualificationSha256: string; readonly archive: Buffer;
  readonly reportSchema: "easyeda-pro-control.generated-reader-closed-snapshot.v1" | "easyeda-pro-control.generated-pad-reader-closed-snapshot.v1" | "easyeda-pro-control.generated-component-reader-closed-snapshot.v1";
  readonly artifactKind: "generated-reader-closed" | "generated-component-reader-closed";
  readonly assertCurrent: () => void; readonly observeOriginalTermination: () => Promise<void>;
  readonly qualifyInitial: (input: Readonly<{ archive: Buffer; inventory: NativeSqlInventory; rawWindowsPath: string; sourceCreatedEpochMs: number; sourceModifiedEpochMs: number }>) => Promise<Readonly<{ qualification: unknown }>>;
}
/** Data-only mechanism. Each separately branded provider must bind its actual
 * source/checkpoint/owner before this function can read its fixed private path. */
export async function captureGeneratedReaderClosedData(options: GeneratedReaderClosedDataOptions): Promise<Readonly<Record<string, unknown>>> {
  const names = ["target", "originalQualificationSha256", "archive", "reportSchema", "artifactKind", "assertCurrent", "observeOriginalTermination", "qualifyInitial"] as const;
  const original = generatedReaderClosedOwnData(options, names); const target = options.target;
  const targetData = generatedReaderClosedOwnData(target, ["rawWindowsPath", "projectUuid", "branchUuid", "documentUuid", "expectedSourceSha256"]);
  need(typeof targetData["rawWindowsPath"] === "string" && typeof targetData["projectUuid"] === "string" && typeof targetData["expectedSourceSha256"] === "string" && Buffer.isBuffer(options.archive) && !types.isProxy(options.archive), "closed source data");
  need(["generated-reader-closed", "generated-component-reader-closed"].includes(options.artifactKind) && ["easyeda-pro-control.generated-reader-closed-snapshot.v1", "easyeda-pro-control.generated-pad-reader-closed-snapshot.v1", "easyeda-pro-control.generated-component-reader-closed-snapshot.v1"].includes(options.reportSchema), "fixed data report profile");
  const archive = Buffer.from(options.archive); const raw = targetData["rawWindowsPath"];
  const parentName = win32.dirname(raw); const childName = win32.basename(parentName);
  need(raw.length <= 1024 && /^CodexEasyedaFixture_[a-f0-9]{32}$/u.test(childName), "original private generated child directory");
  const assertCurrent = options.assertCurrent, observeOriginalTermination = options.observeOriginalTermination, qualifyInitial = options.qualifyInitial;
  need([assertCurrent, observeOriginalTermination, qualifyInitial].every(fn => typeof fn === "function" && !types.isProxy(fn)), "original capture functions");
  const current = (): void => {
    const now = generatedReaderClosedOwnData(options, names); need(names.every(name => now[name] === original[name]), "original closed-data input identities");
    assertCurrent();
  };
  const closed = async (): Promise<void> => { current(); await observeOriginalTermination(); current(); };
  await closed(); const path = normalizeEasyedaProjectPath(raw); const sourceParent = await parentDirectory(dirname(path));
  let source: FileHandle | undefined;
  try {
    await closed(); need(await realpath(path) === path, "canonical original generated source");
    const parent = await sourceParent.stat({ bigint: true }); const bound = `/proc/self/fd/${sourceParent.fd}/${basename(path)}`;
    // oxlint-disable-next-line no-bitwise -- Read-only no-follow nonblocking leaf prevents substituted symlinks, FIFOs and writes.
    source = await open(bound, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK); const originalFile = source;
    const before = await originalFile.stat({ bigint: true }); need(before.isFile() && before.nlink === 1n && before.size >= 512n && before.size <= 67_108_864n, "bounded single-link native file");
    const roster = async (): Promise<void> => {
      const entries = await readdir(`/proc/self/fd/${sourceParent.fd}`);
      need(entries.length === 1 && entries[0] === basename(path), "complete closed directory roster/no sidecars");
    };
    const reprove = async (): Promise<void> => {
      current(); const after = await originalFile.stat({ bigint: true }), named = await lstat(path, { bigint: true }), namedParent = await lstat(dirname(path), { bigint: true });
      need(after.isFile() && named.isFile() && !named.isSymbolicLink() && same(before, after) && same(before, named) &&
        namedParent.isDirectory() && !namedParent.isSymbolicLink() && parent.dev === namedParent.dev && parent.ino === namedParent.ino && await realpath(path) === path, "stable original file/parent identity");
      await roster(); current();
    };
    await roster(); const buffers: Buffer[] = []; let copied = 0;
    for await (const chunk of originalFile.createReadStream({ autoClose: false, start: 0, highWaterMark: 1_048_576 })) { current(); need(Buffer.isBuffer(chunk), "binary closed source"); copied += chunk.length; need(BigInt(copied) <= before.size, "bounded source copy"); buffers.push(chunk); }
    const bytes = Buffer.concat(buffers); need(BigInt(bytes.length) === before.size, "complete bounded source copy");
    const hash = createHash("sha256").update(bytes).digest("hex"); await reprove(); await closed();
    const directory = await ensureManagedDirectory(join(controlDataDirectory(), "artifacts", options.artifactKind)), id = randomUUID(); current();
    const publish = async (suffix: string, value: Buffer): ReturnType<typeof publishManagedAttachmentExclusive> => {
      need(value.length <= 67_108_864, "bounded closed attachment");
      const result = await publishManagedAttachmentExclusive(join(directory, `${id}.${suffix}`), "Original generated reader closed data", value, options.artifactKind, reprove); current(); return result;
    };
    const snapshot = await publish("eprj2", bytes); need(snapshot.sha256 === hash && snapshot.bytes === bytes.length, "exact closed snapshot bytes");
    const inventory = await readExactSqlInventory({ checkpointPath: snapshot.path, expectedSha256: snapshot.sha256, runtime: await currentProcessSqlRuntime() }); current();
    const sql = await publish("sql.json", Buffer.from(JSON.stringify(inventory), "utf8"));
    let rawHistory = null; let decodedHistory = null; let initialQualification = null;
    let rawHistoryFailure = null; let genericHistoryFailure = null; let initialQualificationFailure = null;
    try { const rawData = await decodeGeneratedReaderRawHistory(inventory); current(); rawHistory = await publish("raw-history.json", Buffer.from(JSON.stringify(rawData), "utf8")); }
    catch { current(); rawHistoryFailure = "complete-raw-history-profile-refused"; }
    try { const history = await readNativeHistoryCheckpoint({ checkpointPath: snapshot.path, expectedSha256: snapshot.sha256, projectUuid: target.projectUuid, libraryAtomHeaders: "preserve" });
      current(); decodedHistory = await publish("history.json", Buffer.from(JSON.stringify(history), "utf8")); } catch { current(); genericHistoryFailure = "generic-native-history-profile-refused"; }
    try { const result = await qualifyInitial({ archive, inventory, rawWindowsPath: raw, sourceCreatedEpochMs: Number(before.birthtimeMs), sourceModifiedEpochMs: Number(before.mtimeMs) });
      current(); initialQualification = structuredClone(result.qualification); } catch (error) { current(); initialQualificationFailure = error instanceof Error ? error.message.slice(0, 512) : "initial-generated-profile-refused"; }
    await reprove(); await closed(); const finalHash = createHash("sha256"); let total = 0;
    for await (const chunk of originalFile.createReadStream({ autoClose: false, start: 0, highWaterMark: 1_048_576 })) { current(); need(Buffer.isBuffer(chunk), "binary final source"); total += chunk.length; need(BigInt(total) <= before.size, "final bounded file"); finalHash.update(chunk); }
    need(total === bytes.length && finalHash.digest("hex") === hash, "complete final source hash"); await reprove(); await closed();
    return { schema: options.reportSchema, projectUuid: target.projectUuid, originalQualificationSha256: options.originalQualificationSha256,
      rawWindowsPath: raw, snapshot, sql, rawHistory, decodedHistory, rawHistoryFailure, genericHistoryFailure, initialQualificationFailure,
      sourceIdentity: { device: before.dev.toString(), inode: before.ino.toString(), bytes: before.size.toString(), links: before.nlink.toString(),
        birthtimeNs: before.birthtimeNs.toString(), mtimeNs: before.mtimeNs.toString(), ctimeNs: before.ctimeNs.toString(),
        sourceCreatedEpochMs: Number(before.birthtimeMs), sourceModifiedEpochMs: Number(before.mtimeMs) },
      completeSqlInventoryCaptured: true, tableRoster: inventory.tables.map(table => ({ name: table.name, rowCount: table.rows.length, sha256: table.sha256 })),
      sqlReaderCompletion: readerCompletion(inventory), sourceEqualsInitialBytes: hash === target.expectedSourceSha256,
      completeInitialSqlRowsQualified: initialQualification !== null, currentInitialQualification: initialQualification,
      originalReaderRootAndJobReobservedClosed: true, oldImportDestinationHandlesRetained: false, oldImportRuntimeAdopted: false,
      newReadOpenTargetIssued: false, startupEffectsAccepted: false, persistentRegistrationVerified: false, importedFixtureAccepted: false,
      completeSqlEffectsAccepted: false, writerAuthority: false, filesDeleted: false, sourceSqliteAttached: false };
  } finally { await releaseDescriptors(source, sourceParent); current(); }
}
