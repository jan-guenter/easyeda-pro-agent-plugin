/* oxlint-disable import/max-dependencies -- Original saved-reader termination and plan, new retained descriptors, exclusive artifacts and independent complete SQL are joined here; cold/open acceptance stays separate. */
import { createHash, randomUUID } from "node:crypto";
import { constants } from "node:fs";
import type { BigIntStats } from "node:fs";
import { lstat, open, readdir, realpath } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { basename, dirname, join, win32 } from "node:path";
import { controlDataDirectory, ensureManagedDirectory, publishManagedAttachmentExclusive } from "./artifacts.ts";
import { canonicalJson, normalizeEasyedaProjectPath, sha256Json } from "./core.ts";
import { assertOriginalCurrentSchematicRelevanceSavedReadbackOwner, assertOriginalCurrentSchematicRelevanceSavedReadbackTermination,
  originalCurrentSchematicRelevanceSavedReadbackTarget } from "./current-schematic-relevance-saved-readback-owner.ts";
import type { CurrentSchematicRelevanceSavedReadbackOwner } from "./current-schematic-relevance-saved-readback-owner.ts";
import { requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan } from "./generated-schematic-relevance-saved-readback-plan.ts";
import { requireOriginalGeneratedSchematicRelevanceDisplayClosedSnapshot } from "./generated-schematic-relevance-display-closed-snapshot.ts";
import { decodeGeneratedReaderRawHistory } from "./managed-fixture-reader-closed-snapshot.ts";
import { currentProcessSqlRuntime } from "./machine-profile.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import type { NativeSqlInventory } from "./sqlite-inventory-core.ts";
import { readExactSqlInventory, readerCompletion } from "./sqlite-inventory.ts";

type Attachment = Awaited<ReturnType<typeof publishManagedAttachmentExclusive>>;
export interface CurrentSchematicRelevanceSavedReadbackClosedData {
  readonly schema: "private.current-schematic-relevance-saved-readback-closed-data.v1";
  readonly sourceSha256: string; readonly inventoryLogicalSha256: string; readonly report: Readonly<Record<string, unknown>>;
  readonly originalRootAndJobReobservedClosed: true; readonly completeSqlInventoryCaptured: true;
  readonly completeSqlEffectsAccepted: true; readonly exactSavedSourceBytesUnchanged: true; readonly exactSavedCompleteSqlUnchanged: true; readonly persistenceVerified: false; readonly reopenedVerified: false;
}
interface Original {
  readonly capture: CurrentSchematicRelevanceSavedReadbackClosedCapture; readonly owner: CurrentSchematicRelevanceSavedReadbackOwner; readonly termination: object;
  readonly prepared: ReturnType<typeof originalCurrentSchematicRelevanceSavedReadbackTarget>; readonly inventory: NativeSqlInventory;
  readonly rawHistory: Readonly<Record<string, unknown>> | null; readonly snapshot: Attachment; readonly text: string;
}
const issued = new WeakMap<CurrentSchematicRelevanceSavedReadbackClosedData, Original>();
const attempted = new WeakSet<CurrentSchematicRelevanceSavedReadbackOwner>();
function need(value: boolean, reason: string): asserts value { if (!value) { throw new Error(`SCHEMATIC_SAVED_READBACK_CLOSED_${reason}`); } }
function same(left: BigIntStats, right: BigIntStats): boolean {
  return left.dev === right.dev && left.ino === right.ino && left.size === right.size && left.mtimeNs === right.mtimeNs &&
    left.ctimeNs === right.ctimeNs && left.birthtimeNs === right.birthtimeNs && left.nlink === right.nlink;
}

/** New original saved-reader closure and read-only descriptors only. Complete
 * byte/SQL equality grants no cold-load, scene, persistence or reopened flag. */
export class CurrentSchematicRelevanceSavedReadbackClosedCapture {
  readonly #owner: CurrentSchematicRelevanceSavedReadbackOwner; readonly #termination: object;
  readonly #prepared: ReturnType<typeof originalCurrentSchematicRelevanceSavedReadbackTarget>;
  readonly #descriptors: FileHandle[] = []; readonly #attachments: Attachment[] = [];
  #capture: Promise<CurrentSchematicRelevanceSavedReadbackClosedData> | undefined;
  #release: Promise<void> | undefined; #released = false; #settled = false;
  public constructor(owner: CurrentSchematicRelevanceSavedReadbackOwner, termination: object) {
    assertOriginalCurrentSchematicRelevanceSavedReadbackOwner(owner); assertOriginalCurrentSchematicRelevanceSavedReadbackTermination(owner, termination);
    need(!attempted.has(owner), "ORIGINAL_ATTEMPT_CONSUMED"); attempted.add(owner);
    this.#owner = owner; this.#termination = termination; this.#prepared = originalCurrentSchematicRelevanceSavedReadbackTarget(owner); this.#current();
  }
  #current(): void {
    assertOriginalCurrentSchematicRelevanceSavedReadbackOwner(this.#owner); assertOriginalCurrentSchematicRelevanceSavedReadbackTermination(this.#owner, this.#termination);
    need(originalCurrentSchematicRelevanceSavedReadbackTarget(this.#owner) === this.#prepared, "ORIGINAL_TARGET");
  }
  public status(): Readonly<Record<string, unknown>> {
    return Object.freeze({ attempted: this.#capture !== undefined, settled: this.#settled, descriptorReleaseAcknowledged: this.#released,
      attachments: Object.freeze([...this.#attachments]), persistenceVerified: false, reopenedVerified: false });
  }
  /** Joins only the original close promises. Failed closes stay unresolved. */
  public settleRelease(): Promise<void> { return this.#release ?? Promise.reject(new Error("SCHEMATIC_SAVED_READBACK_CLOSED_RELEASE_NOT_SUBMITTED")); }
  public isReleaseAcknowledged(): boolean { return this.#released; }
  public capture(): Promise<CurrentSchematicRelevanceSavedReadbackClosedData> {
    need(this.#capture === undefined, "COPY_CANNOT_REPEAT"); this.#current(); const original = this.#run(); this.#capture = original; return original;
  }
  async #close(): Promise<void> {
    const results = await Promise.allSettled(this.#descriptors.map(descriptor => descriptor.close())); const failures: unknown[] = [];
    for (const result of results) { if (result.status === "rejected") { const reason: unknown = result.reason; failures.push(reason); } }
    if (failures.length > 0) { throw new AggregateError(failures, "Original saved schematic reader descriptor release failed."); } this.#released = true;
  }
  async #open(path: string, flags: number): Promise<FileHandle> { const descriptor = await open(path, flags); this.#descriptors.push(descriptor); this.#current(); return descriptor; }
  async #parent(path: string): Promise<FileHandle> {
    const segments = path.split("/").filter(value => value.length > 0); need(segments.length <= 64, "PARENT_BOUND");
    // oxlint-disable-next-line no-bitwise -- Every original parent component remains retained and never follows a substituted symlink.
    const flags = constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW;
    let parent = await this.#open("/", flags);
    for (const segment of segments) {
      const entry = `/proc/self/fd/${parent.fd}/${segment}`; const before = await lstat(entry, { bigint: true }); this.#current();
      need(before.isDirectory() && !before.isSymbolicLink(), "PARENT_SYMLINK"); const next = await this.#open(entry, flags); const after = await next.stat({ bigint: true }); this.#current();
      need(after.isDirectory() && before.dev === after.dev && before.ino === after.ino, "PARENT_REPLACED"); parent = next;
    }
    return parent;
  }
  async #run(): Promise<CurrentSchematicRelevanceSavedReadbackClosedData> {
    try {
      this.#current(); const path = normalizeEasyedaProjectPath(requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan(this.#prepared).data.target.rawWindowsPath), raw = requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan(this.#prepared).data.target.rawWindowsPath;
      const nativeParent = win32.dirname(raw);
      need(/^CodexEasyedaFixture_[a-f0-9]{32}$/u.test(win32.basename(nativeParent)) && /^Codex_schematic_relevance_[a-f0-9]{16}\.eprj2$/u.test(win32.basename(raw)), "FIXED_GENERATED_PATH");
      const parent = await this.#parent(dirname(path)); const parentStat = await parent.stat({ bigint: true }); this.#current();
      need(await realpath(path) === path, "CANONICAL_SOURCE"); this.#current();
      // oxlint-disable-next-line no-bitwise -- Read-only no-follow nonblocking leaf refuses substituted links/FIFOs and cannot write the source.
      const source = await this.#open(`/proc/self/fd/${parent.fd}/${basename(path)}`, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
      const before = await source.stat({ bigint: true }); this.#current();
      need(before.isFile() && before.nlink === 1n && before.size >= 512n && before.size <= 67_108_864n, "SOURCE_BOUND");
      const reprove = async (): Promise<void> => {
        this.#current(); const after = await source.stat({ bigint: true }), named = await lstat(path, { bigint: true }), namedParent = await lstat(dirname(path), { bigint: true });
        const names = await readdir(`/proc/self/fd/${parent.fd}`); this.#current();
        need(after.isFile() && named.isFile() && !named.isSymbolicLink() && same(before, after) && same(before, named) && namedParent.isDirectory() &&
          !namedParent.isSymbolicLink() && namedParent.dev === parentStat.dev && namedParent.ino === parentStat.ino && names.length === 1 && names[0] === basename(path) &&
          await realpath(path) === path, "SOURCE_OR_ROSTER_CHANGED"); this.#current();
      };
      const read = async (): Promise<Buffer> => { const chunks: Buffer[] = []; let total = 0;
        for await (const chunk of source.createReadStream({ autoClose: false, start: 0, highWaterMark: 1_048_576 })) {
          this.#current(); need(Buffer.isBuffer(chunk), "BINARY_SOURCE"); total += chunk.length; need(BigInt(total) <= before.size, "COPY_BOUND"); chunks.push(chunk);
        }
        need(BigInt(total) === before.size, "COMPLETE_COPY"); return Buffer.concat(chunks);
      };
      await reprove(); const bytes = await read(); await reprove(); const sourceSha256 = createHash("sha256").update(bytes).digest("hex");
      const directory = await ensureManagedDirectory(join(controlDataDirectory(), "artifacts", "schematic-relevance-saved-readback-closed")), id = randomUUID(); this.#current();
      const publish = async (suffix: string, value: Buffer): Promise<Attachment> => {
        need(value.length <= 67_108_864, "ATTACHMENT_BOUND"); const attachment = await publishManagedAttachmentExclusive(join(directory, `${id}.${suffix}`), "Original saved schematic reader closed data", value, "schematic-relevance-saved-readback-closed", reprove);
        this.#attachments.push(attachment); this.#current(); return attachment;
      };
      const snapshot = await publish("eprj2", bytes); need(snapshot.sha256 === sourceSha256 && snapshot.bytes === bytes.length, "EXACT_SNAPSHOT");
      const inventory = await readExactSqlInventory({ checkpointPath: snapshot.path, expectedSha256: snapshot.sha256, runtime: await currentProcessSqlRuntime() }); this.#current();
      const original = requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan(this.#prepared);
      const beforeInventory = requireOriginalGeneratedSchematicRelevanceDisplayClosedSnapshot(original.closed.snapshot, original.closed.owner).inventory;
      need(sourceSha256 === original.data.target.sourceSha256, "SAVED_SOURCE_BYTES_CHANGED");
      need(readerCompletion(beforeInventory).exitCode === 0 && readerCompletion(inventory).exitCode === 0 &&
        canonicalJson({ schema: beforeInventory.schema, properties: beforeInventory.properties, tables: beforeInventory.tables }) ===
        canonicalJson({ schema: inventory.schema, properties: inventory.properties, tables: inventory.tables }) &&
        beforeInventory.logicalSha256 === inventory.logicalSha256 && beforeInventory.schemaSha256 === inventory.schemaSha256, "SAVED_COMPLETE_SQL_CHANGED");
      this.#current();
      const sql = await publish("sql.json", Buffer.from(JSON.stringify(inventory), "utf8")); let rawHistory = null; let rawHistoryAttachment = null; let rawHistoryFailure = null;
      try { rawHistory = await decodeGeneratedReaderRawHistory(inventory); this.#current(); rawHistoryAttachment = await publish("raw-history.json", Buffer.from(JSON.stringify(rawHistory), "utf8")); }
      catch { this.#current(); rawHistoryFailure = "complete-raw-history-profile-refused"; }
      need(rawHistory !== null && rawHistoryFailure === null, "COMPLETE_RAW_HISTORY_REQUIRED");
      await reprove(); const final = await read(); need(createHash("sha256").update(final).digest("hex") === sourceSha256, "FINAL_SOURCE_HASH"); await reprove(); this.#current();
      const report = freezeDeep({ schema: "easyeda-pro-control.schematic-relevance-saved-readback-closed-capture.v1", target: requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan(this.#prepared).data.target,
        originalReadbackDataSha256: sha256Json(requireOriginalGeneratedSchematicRelevanceSavedReadbackPlan(this.#prepared).data), snapshot, sql, rawHistory: rawHistoryAttachment, rawHistoryFailure,
        sourceIdentity: { device: before.dev.toString(), inode: before.ino.toString(), bytes: before.size.toString(), links: before.nlink.toString(),
          birthtimeNs: before.birthtimeNs.toString(), mtimeNs: before.mtimeNs.toString(), ctimeNs: before.ctimeNs.toString() },
        sqlReaderCompletion: readerCompletion(inventory), tableRoster: inventory.tables.map(table => ({ name: table.name, rowCount: table.rows.length, sha256: table.sha256 })),
        originalRootAndJobReobservedClosed: true, completeSqlInventoryCaptured: true, oldImportHandlesRetained: false, sourceSqliteAttached: false,
        completeSqlEffectsAccepted: true, exactSavedSourceBytesUnchanged: true, exactSavedCompleteSqlUnchanged: true, persistenceVerified: false, reopenedVerified: false, writerAuthority: false, filesDeleted: false });
      const token: CurrentSchematicRelevanceSavedReadbackClosedData = freezeDeep({ schema: "private.current-schematic-relevance-saved-readback-closed-data.v1", sourceSha256,
        inventoryLogicalSha256: inventory.logicalSha256, report, originalRootAndJobReobservedClosed: true, completeSqlInventoryCaptured: true,
        completeSqlEffectsAccepted: true, exactSavedSourceBytesUnchanged: true, exactSavedCompleteSqlUnchanged: true, persistenceVerified: false, reopenedVerified: false });
      issued.set(token, { capture: this, owner: this.#owner, termination: this.#termination, prepared: this.#prepared, inventory, rawHistory, snapshot, text: canonicalJson(token) }); return token;
    } finally { this.#release = this.#close(); try { await this.#release; } finally { this.#settled = true; } }
  }
}

/** Historical data retrieval only; never reconstructs a native owner from the
 * attached report or issues a new opening target after a write. */
export function requireOriginalCurrentSchematicRelevanceSavedReadbackClosedData(value: CurrentSchematicRelevanceSavedReadbackClosedData, owner: CurrentSchematicRelevanceSavedReadbackOwner): Readonly<{
  inventory: NativeSqlInventory; rawHistory: Readonly<Record<string, unknown>> | null; sourceSnapshot: Attachment;
}> {
  const original = issued.get(value); need(original !== undefined && original.owner === owner && original.text === canonicalJson(value) && original.capture.isReleaseAcknowledged(), "ORIGINAL_SNAPSHOT");
  assertOriginalCurrentSchematicRelevanceSavedReadbackOwner(owner); assertOriginalCurrentSchematicRelevanceSavedReadbackTermination(owner, original.termination);
  need(originalCurrentSchematicRelevanceSavedReadbackTarget(owner) === original.prepared && readerCompletion(original.inventory).exitCode === 0, "ORIGINAL_CAPTURE_BINDING");
  return Object.freeze({ inventory: original.inventory, rawHistory: original.rawHistory, sourceSnapshot: original.snapshot });
}
