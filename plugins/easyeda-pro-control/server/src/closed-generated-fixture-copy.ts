/* oxlint-disable import/max-dependencies -- Fresh closed data capture retains component file descriptors, new managed bytes, a genuine complete SQL reader and an independently held Windows read-only lease. */
import { createHash, randomUUID } from "node:crypto";
import { constants } from "node:fs";
import type { BigIntStats } from "node:fs";
import { lstat, open, readdir, realpath } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { types } from "node:util";
import { controlDataDirectory, ensureManagedDirectory, publishManagedAttachmentExclusive } from "./artifacts.ts";
import { normalizeEasyedaProjectPath } from "./core.ts";
import { assertSameClosedGeneratedData, qualifyClosedGeneratedDataSql } from "./closed-generated-fixture-data.ts";
import type { ClosedGeneratedDataQualification, ClosedGeneratedFixtureDataLocator } from "./closed-generated-fixture-data.ts";
import type { ClosedGeneratedFixtureFileObservation } from "./closed-generated-fixture-file.ts";
import { currentProcessSqlRuntime } from "./machine-profile.ts";
import { readExactSqlInventory, readerCompletion } from "./sqlite-inventory.ts";

function need(value: boolean, message: string): asserts value { if (!value) { throw new Error(`Fresh closed data capture refused: ${message}.`); } }
function same(left: BigIntStats, right: BigIntStats): boolean {
  return left.dev === right.dev && left.ino === right.ino && left.size === right.size && left.mtimeNs === right.mtimeNs &&
    left.ctimeNs === right.ctimeNs && left.birthtimeNs === right.birthtimeNs && left.nlink === right.nlink;
}
async function parentDirectory(path: string, retain: (handle: FileHandle) => void): Promise<FileHandle> {
  const segments = path.split("/").filter(value => value.length > 0); need(segments.length <= 64, "bounded source parent chain");
  // oxlint-disable-next-line no-bitwise -- Every original component stays retained and never follows a substituted symlink.
  const flags = constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW;
  let current = await open("/", flags); retain(current);
  for (const segment of segments) {
    const entry = `/proc/self/fd/${current.fd}/${segment}`; const before = await lstat(entry, { bigint: true });
    need(before.isDirectory() && !before.isSymbolicLink(), "non-symlink source parent"); const next = await open(entry, flags); retain(next);
    const after = await next.stat({ bigint: true }); need(after.isDirectory() && before.dev === after.dev && before.ino === after.ino, "stable source parent"); current = next;
  }
  return current;
}
function plainData(input: object, names: readonly string[]): void {
  need(!types.isProxy(input) && Object.getPrototypeOf(input) === Object.prototype && Reflect.ownKeys(input).length === names.length &&
    names.every(name => { const value = Object.getOwnPropertyDescriptor(input, name); return value !== undefined && Object.hasOwn(value, "value"); }), "plain exact original capture data inputs");
}
export interface ClosedGeneratedFixtureCopyOptions {
  readonly locator: ClosedGeneratedFixtureDataLocator;
  readonly lease: ClosedGeneratedFixtureFileObservation;
  readonly assertOriginalOwner: () => void;
  readonly inspectOriginalLease: () => Promise<ClosedGeneratedFixtureFileObservation>;
  readonly observeNoApplication: () => Promise<void>;
}
/** New current-process read-only data evidence only. Original Windows handles
 * remain held throughout the full Linux copy/SQL/final hash. No old native
 * owner, termination receipt, dispatcher, bridge or source SQLite attachment. */
async function captureClosedGeneratedFixtureData(options: ClosedGeneratedFixtureCopyOptions, retain: (handle: FileHandle) => void): Promise<Readonly<{
  qualification: ClosedGeneratedDataQualification; report: Readonly<Record<string, unknown>>;
}>> {
  const fields = ["locator", "lease", "assertOriginalOwner", "inspectOriginalLease", "observeNoApplication"];
  plainData(options, fields); const locator = options.locator; const lease = options.lease; const assertOwner = options.assertOriginalOwner;
  const inspect = options.inspectOriginalLease, noApplication = options.observeNoApplication;
  need(!types.isProxy(assertOwner) && !types.isProxy(inspect) && !types.isProxy(noApplication) && !types.isProxy(locator.archive), "original capture callbacks/archive");
  const current = (): void => {
    plainData(options, fields); need(options.locator === locator && options.lease === lease && options.assertOriginalOwner === assertOwner && options.inspectOriginalLease === inspect && options.observeNoApplication === noApplication, "original capture callback identities"); assertOwner();
  };
  const raw = locator.rawWindowsPath; const archive = Buffer.from(locator.archive); const observed = lease.observation;
  need(lease.state === "held" && raw === observed.windowsPath && locator.snapshot.sha256 === observed.sha256 && locator.snapshot.bytes === observed.bytes, "fresh native source lease binding");
  const boundary = async (): Promise<void> => {
    current();
    const now = await inspect(); current(); need(now.state === "held" && JSON.stringify(now.observation) === JSON.stringify(observed), "same original fresh file/watch");
    await noApplication(); current();
  };
  await boundary(); const path = normalizeEasyedaProjectPath(raw); const parent = await parentDirectory(dirname(path), retain);
    current(); const originalParent = await parent.stat({ bigint: true });
    need(await realpath(path) === path, "canonical source");
    // oxlint-disable-next-line no-bitwise -- Read-only no-follow nonblocking leaf refuses symlink/FIFO substitution.
    const original = await open(`/proc/self/fd/${parent.fd}/${basename(path)}`, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK); retain(original); const before = await original.stat({ bigint: true });
    need(before.isFile() && before.nlink === 1n && before.size === BigInt(observed.bytes), "bounded original single-link file");
    const reprove = async (): Promise<void> => {
      current(); const after = await original.stat({ bigint: true }), named = await lstat(path, { bigint: true }), namedParent = await lstat(dirname(path), { bigint: true });
      const names = await readdir(`/proc/self/fd/${parent.fd}`);
      need(after.isFile() && named.isFile() && !named.isSymbolicLink() && same(before, after) && same(before, named) &&
        namedParent.isDirectory() && !namedParent.isSymbolicLink() && originalParent.dev === namedParent.dev && originalParent.ino === namedParent.ino &&
        await realpath(path) === path && names.length === 1 && names[0] === basename(path), "stable complete source/parent roster"); current();
    };
    await reprove(); const chunks: Buffer[] = []; let total = 0;
    for await (const chunk of original.createReadStream({ autoClose: false, start: 0, highWaterMark: 1_048_576 })) {
      current(); need(Buffer.isBuffer(chunk), "binary source"); total += chunk.length; need(total <= observed.bytes, "bounded copy"); chunks.push(chunk);
    }
    const bytes = Buffer.concat(chunks); need(total === observed.bytes && createHash("sha256").update(bytes).digest("hex") === observed.sha256, "complete Windows/Linux source hash agreement");
    await reprove(); await boundary();
    const directory = await ensureManagedDirectory(join(controlDataDirectory(), "artifacts", "generated-data-requalification")), id = randomUUID(); current();
    const snapshot = await publishManagedAttachmentExclusive(join(directory, `${id}.eprj2`), "Fresh closed generated data snapshot", bytes, "closed-generated-data", reprove);
    need(snapshot.sha256 === observed.sha256 && snapshot.bytes === observed.bytes, "new snapshot exact source bytes");
    const inventory = await readExactSqlInventory({ checkpointPath: snapshot.path, expectedSha256: snapshot.sha256, runtime: await currentProcessSqlRuntime() }); current();
    const qualification = await qualifyClosedGeneratedDataSql(archive, inventory, raw, observed.createdEpochMs, observed.modifiedEpochMs, locator.kind); current();
    assertSameClosedGeneratedData(locator.oldQualification, qualification);
    const sql = await publishManagedAttachmentExclusive(join(directory, `${id}.sql.json`), "Fresh complete generated data SQL", Buffer.from(JSON.stringify(inventory), "utf8"), "closed-generated-data-sql", reprove);
    await reprove(); await boundary(); const finalHash = createHash("sha256"); let reread = 0;
    for await (const chunk of original.createReadStream({ autoClose: false, start: 0, highWaterMark: 1_048_576 })) {
      current(); need(Buffer.isBuffer(chunk), "binary final source"); reread += chunk.length; need(reread <= observed.bytes, "bounded final hash"); finalHash.update(chunk);
    }
    need(reread === observed.bytes && finalHash.digest("hex") === observed.sha256, "complete final source hash"); await reprove(); await boundary();
    return { qualification, report: Object.freeze({ schema: "easyeda-pro-control.closed-generated-data-capture.v1", snapshot, sql,
      sqlReaderCompletion: readerCompletion(inventory), tableRoster: inventory.tables.map(table => ({ name: table.name, rowCount: table.rows.length, sha256: table.sha256 })),
      currentQualification: structuredClone(qualification), exactInitialSqlAndSourceRequalified: true, initialSourceBytesUnchanged: true,
      sourceWindowsLeaseId: observed.leaseId, sourceWindowsFileIdentity: observed.fileIdentity, sourceWindowsDirectoryIdentity: observed.directoryIdentity,
      sourceLinuxIdentity: { device: before.dev.toString(), inode: before.ino.toString(), bytes: before.size.toString(), links: before.nlink.toString(),
        birthtimeNs: before.birthtimeNs.toString(), mtimeNs: before.mtimeNs.toString(), ctimeNs: before.ctimeNs.toString() },
      oldRuntimeAdopted: false, oldClosureAcceptedAsAuthority: false, postOpenChangesAccepted: false, sourceFileModified: false, sourceSqliteAttached: false,
      registrationVerified: false, writerAuthority: false, filesDeleted: false }) };
}

/** Retains every original Linux descriptor, including the parent component
 * chain and any partly acquired leaf, before another await. Original closes
 * are joined once only. A failed close keeps this owner pending; GC is never
 * counted as acknowledgement or used to issue a new source token. */
export class ClosedGeneratedFixtureCopyOwner {
  readonly #options: ClosedGeneratedFixtureCopyOptions;
  readonly #descriptors: FileHandle[] = [];
  #attempted = false; #release: Promise<void> | undefined; #released = false;
  public constructor(options: ClosedGeneratedFixtureCopyOptions) { this.#options = options; }
  public isReleaseAcknowledged(): boolean { return this.#released; }
  public settleRelease(): Promise<void> {
    if (!this.#attempted) { this.#attempted = true; this.#release = this.#close(); }
    return this.#release ?? Promise.reject(new Error("Original Linux descriptor capture has not yet submitted its release."));
  }
  async #close(): Promise<void> {
    const closures = await Promise.allSettled(this.#descriptors.map(handle => handle.close())); const failures: unknown[] = [];
    for (const closure of closures) { if (closure.status === "rejected") { const reason: unknown = closure.reason; failures.push(reason); } }
    need(failures.length === 0, "all original Linux descriptor close acknowledgements"); this.#released = true;
  }
  public async capture(): ReturnType<typeof captureClosedGeneratedFixtureData> {
    need(!this.#attempted, "original Linux copy attempt cannot repeat"); this.#attempted = true;
    try { return await captureClosedGeneratedFixtureData(this.#options, handle => { this.#descriptors.push(handle); }); }
    finally { this.#release = this.#close(); await this.#release; }
  }
}
