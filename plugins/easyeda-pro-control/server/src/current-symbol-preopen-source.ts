/** Raw-file observation after relaunch. The original closed copy remains
 * historical evidence; this reader neither revives its old process authority
 * nor opens the source through SQLite.
 */
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import type { BigIntStats } from "node:fs";
import { lstat, open } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { basename, dirname, isAbsolute, resolve } from "node:path";
import { yieldProofEventLoop } from "./cooperative-proof.ts";
// oxlint-disable-next-line import/no-cycle -- Reuse the baseline issuer's private registry; its retained coordinator calls this reader, and no alternate issuer is exposed.
import { assertOriginalCurrentSymbolBaselineCopy } from "./current-symbol-baseline-copy.ts";
import type { CurrentSymbolBaselineCopy } from "./current-symbol-baseline-copy.ts";
import type { EasyedaControlEngine } from "./engine.ts";

const CHUNK_BYTES = 1_048_576, MAX_BYTES = 268_435_456n;
interface Directory { readonly absolute: string; readonly handle: FileHandle; readonly info: BigIntStats }
export interface CurrentSymbolPreopenSourceObservation {
  readonly profile: "private.current-symbol-preopen-source.v1";
  readonly scope: "point-in-time-before-project-opening";
  readonly source: string;
  readonly sourceSha256: string;
  readonly bytes: number;
  readonly sourceIdentity: CurrentSymbolBaselineCopy["copy"]["sourceIdentity"];
  readonly sourceMatchesClosedBaseline: true;
  readonly sidecarsObservedAbsent: true;
  readonly ongoingSourceContinuity: false;
  readonly startupQualified: false;
  readonly writerAuthority: false;
  readonly executionAuthorized: false;
}
function need(condition: boolean, message: string): asserts condition { if (!condition) { throw new Error(message); } }
function sameInode(a: BigIntStats, b: BigIntStats): boolean { return a.dev === b.dev && a.ino === b.ino; }
function sameFile(a: BigIntStats, b: BigIntStats): boolean {
  return a.isFile() && b.isFile() && !a.isSymbolicLink() && !b.isSymbolicLink() && sameInode(a, b) &&
    a.size === b.size && a.mtimeNs === b.mtimeNs && a.ctimeNs === b.ctimeNs && a.birthtimeNs === b.birthtimeNs &&
    a.mode === b.mode && a.uid === b.uid && a.gid === b.gid && a.nlink === 1n && b.nlink === 1n;
}
async function directory(absolute: string, current: () => void): Promise<Directory> {
  const segments = absolute.split("/").filter(Boolean);
  need(segments.length > 0 && segments.length <= 64, "Current preopen source directory depth refused.");
  // oxlint-disable-next-line no-bitwise -- Walk every component relative to its retained parent without following symlinks.
  const flags = constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW;
  let handle = await open("/", flags);
  try {
    current();
    for (const segment of segments) {
      const path = `/proc/self/fd/${handle.fd}/${segment}`;
      const before = await lstat(path, { bigint: true }); current();
      need(before.isDirectory() && !before.isSymbolicLink(), "Current preopen source parent is not a real directory.");
      const child = await open(path, flags);
      try {
        current();
        const info = await child.stat({ bigint: true }); current();
        need(info.isDirectory() && sameInode(before, info), "Current preopen source parent changed while opening.");
        await handle.close();
      } catch (error) {
        try { await child.close(); }
        catch (cleanupError) { throw new AggregateError([error, cleanupError], "Current preopen source traversal cleanup failed.", { cause: cleanupError }); }
        throw error;
      }
      handle = child; current();
    }
    const info = await handle.stat({ bigint: true }); current();
    return { absolute, handle, info };
  } catch (error) {
    try { await handle.close(); }
    catch (cleanupError) { throw new AggregateError([error, cleanupError], "Current preopen source directory cleanup failed.", { cause: cleanupError }); }
    throw error;
  }
}
async function noSidecars(path: string, current: () => void): Promise<void> {
  for (const suffix of ["-wal", "-shm", "-journal"]) {
    const absent = await lstat(`${path}${suffix}`).then(() => false, (error: unknown) => {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") { return true; }
      throw error;
    }); current();
    need(absent, "Current preopen source has a SQLite sidecar.");
  }
}
function matchesBaseline(stat: BigIntStats, copy: CurrentSymbolBaselineCopy): boolean {
  const checkpoint = copy.checkpoint.sourceIdentity, raw = copy.copy.sourceIdentity;
  return stat.isFile() && !stat.isSymbolicLink() && stat.nlink === 1n && stat.size > 0n && stat.size <= MAX_BYTES &&
    stat.dev.toString() === checkpoint.dev && stat.ino.toString() === checkpoint.ino &&
    stat.birthtimeNs.toString() === checkpoint.birthtimeNs && stat.ctimeNs.toString() === checkpoint.ctimeNs &&
    stat.dev.toString() === raw.device && stat.ino.toString() === raw.inode && stat.size.toString() === raw.size &&
    stat.mtimeNs.toString() === raw.mtimeNs && stat.ctimeNs.toString() === raw.ctimeNs && stat.birthtimeNs.toString() === raw.birthtimeNs &&
    stat.mode.toString() === raw.mode && stat.uid.toString() === raw.uid && stat.gid.toString() === raw.gid && stat.nlink.toString() === raw.links &&
    Number(stat.size) === copy.copy.bytes;
}
async function hash(file: FileHandle, bytes: number, current: () => void): Promise<string> {
  const buffer = Buffer.alloc(Math.min(bytes, CHUNK_BYTES)), digest = createHash("sha256");
  let position = 0;
  while (position < bytes) {
    const read = await file.read(buffer, 0, Math.min(buffer.length, bytes - position), position); current();
    need(read.bytesRead > 0, "Current preopen source ended during its bounded read.");
    digest.update(buffer.subarray(0, read.bytesRead)); position += read.bytesRead;
    await yieldProofEventLoop(); current();
  }
  const eof = await file.read(Buffer.alloc(1), 0, 1, bytes); current();
  need(eof.bytesRead === 0, "Current preopen source grew during its bounded read.");
  return digest.digest("hex");
}

/** Only the original issued baseline selects the source. Each awaited file read
 * rechecks that issuer, but the caller must separately reprove its new session
 * and journal after this returns. Sequential path/hash/sidecar observations are
 * not an atomic snapshot or a promise that another writer cannot act later.
 */
export async function verifyCurrentSymbolPreopenSource(engine: EasyedaControlEngine,
  copy: CurrentSymbolBaselineCopy): Promise<Readonly<CurrentSymbolPreopenSourceObservation>> {
  const current = (): void => { assertOriginalCurrentSymbolBaselineCopy(copy, engine); };
  current();
  const { source, sourceSha256 } = copy.checkpoint;
  need(process.platform === "linux" && source.length <= 4096 && isAbsolute(source) && resolve(source) === source && source.endsWith(".eprj2") &&
    copy.copy.source === source && copy.copy.sha256 === sourceSha256 && /^[a-f0-9]{64}$/u.test(sourceSha256),
  "Current preopen source requires its canonical original baseline binding.");
  const parent = await directory(dirname(source), current);
  let file: FileHandle | undefined;
  let observation: Readonly<CurrentSymbolPreopenSourceObservation> | undefined;
  let failed = false;
  let failure: unknown;
  try {
    current();
    const path = `/proc/self/fd/${parent.handle.fd}/${basename(source)}`;
    await noSidecars(path, current); current();
    const before = await lstat(path, { bigint: true }); current();
    need(matchesBaseline(before, copy), "Current preopen source differs from the original baseline identity or size.");
    // oxlint-disable-next-line no-bitwise -- Reject a substituted symlink and avoid blocking on a replaced FIFO.
    file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK); current();
    const opened = await file.stat({ bigint: true }); current();
    need(sameFile(before, opened), "Current preopen source changed while opening.");
    const sha256 = await hash(file, Number(before.size), current); current();
    need(sha256 === sourceSha256, "Current preopen source hash differs from the original baseline.");
    await noSidecars(path, current); current();
    const rebound = await directory(parent.absolute, current);
    try { need(sameInode(parent.info, rebound.info), "Current preopen source directory path changed."); }
    finally { await rebound.handle.close(); }
    current();
    const parentAfter = await parent.handle.stat({ bigint: true }); current();
    const after = await file.stat({ bigint: true }); current();
    const named = await lstat(path, { bigint: true }); current();
    need(sameInode(parent.info, parentAfter) && sameFile(before, after) && sameFile(before, named),
      "Current preopen source descriptor or path changed during reading.");
    observation = Object.freeze({ profile: "private.current-symbol-preopen-source.v1", scope: "point-in-time-before-project-opening",
      source, sourceSha256, bytes: Number(before.size), sourceIdentity: Object.freeze({ ...copy.copy.sourceIdentity }),
      sourceMatchesClosedBaseline: true, sidecarsObservedAbsent: true, ongoingSourceContinuity: false,
      startupQualified: false, writerAuthority: false, executionAuthorized: false });
  } catch (error) { failed = true; failure = error; }
  const cleanup = await Promise.allSettled([file?.close(), parent.handle.close()]);
  const errors = cleanup.filter((result) => result.status === "rejected").map((result) => result.reason as unknown);
  if (failed) { errors.unshift(failure); }
  if (errors.length > 0) { throw new AggregateError(errors, "Current preopen source verification failed.", { cause: errors[0] }); }
  current();
  need(observation !== undefined, "Current preopen source observation is missing.");
  return observation;
}
