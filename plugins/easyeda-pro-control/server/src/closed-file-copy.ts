/** Internal, non-authorizing evidence. This proves one stable raw-byte copy after
 * retained process closure. It does not bind a project to that generation,
 * prove queued writes persisted, rule out durable replay, or accept a rename.
 */
import { createHash, randomUUID } from "node:crypto";
import { constants } from "node:fs";
import type { BigIntStats } from "node:fs";
import { lstat, open } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, resolve } from "node:path";
import { openControlRootCapability } from "./control-root.ts";
import { sha256Json } from "./core.ts";
import { assertClosedSessionCopyAuthority } from "./windows-authority.ts";

const MAX_FILE_BYTES = 268_435_456n;
const CHUNK_BYTES = 1_048_576;
const copies = new WeakSet<ClosedFileCopyReceipt>();
interface BoundDirectory { readonly absolute: string; readonly handle: FileHandle; readonly info: BigIntStats }
interface FileIdentity {
  readonly device: string; readonly inode: string; readonly size: string;
  readonly mtimeNs: string; readonly ctimeNs: string; readonly birthtimeNs: string;
  readonly mode: string; readonly uid: string; readonly gid: string; readonly links: string;
}
export interface ClosedFileCopyReceipt {
  readonly schema: "easyeda-pro-control.closed-file-byte-copy.v1";
  readonly source: string;
  readonly artifact: string;
  readonly bytes: number;
  readonly sha256: string;
  readonly sourceIdentity: FileIdentity;
  readonly artifactIdentity: FileIdentity;
  readonly closureProofSha256: string;
  readonly sourceEqualsArtifactBytes: true;
  readonly sourceProjectGenerationBindingVerified: false;
  readonly executionAuthorized: false;
  readonly receiptSha256: string;
}
function check(condition: boolean, message: string): asserts condition {
  if (!condition) { throw new Error(message); }
}
function identity(info: BigIntStats): FileIdentity {
  return Object.freeze({ device: info.dev.toString(), inode: info.ino.toString(), size: info.size.toString(),
    mtimeNs: info.mtimeNs.toString(), ctimeNs: info.ctimeNs.toString(), birthtimeNs: info.birthtimeNs.toString(),
    mode: info.mode.toString(), uid: info.uid.toString(), gid: info.gid.toString(), links: info.nlink.toString() });
}
function sameInode(left: BigIntStats, right: BigIntStats): boolean {
  return left.dev === right.dev && left.ino === right.ino;
}
function sameStableFile(left: BigIntStats, right: BigIntStats): boolean {
  return left.isFile() && right.isFile() && sameInode(left, right) &&
    left.size === right.size && left.mtimeNs === right.mtimeNs && left.ctimeNs === right.ctimeNs &&
    left.birthtimeNs === right.birthtimeNs && left.nlink === 1n && right.nlink === 1n &&
    left.mode === right.mode && left.uid === right.uid && left.gid === right.gid;
}
function validSource(info: BigIntStats): boolean {
  return info.isFile() && !info.isSymbolicLink() && info.nlink === 1n && info.size > 0n && info.size <= MAX_FILE_BYTES;
}
function validOutput(info: BigIntStats): boolean {
  return validSource(info) && info.mode % 512n === 0o600n &&
    typeof process.getuid === "function" && info.uid === BigInt(process.getuid());
}
async function bindDirectory(absolute: string): Promise<BoundDirectory> {
  check(isAbsolute(absolute) && resolve(absolute) === absolute, "Source directory must be canonical and absolute.");
  const segments = absolute.split("/").filter((value) => value.length > 0);
  check(segments.length > 0 && segments.length <= 64, "Source parent directory depth refused.");
  // These native open flags enforce directory-only, non-symlink traversal.
  // oxlint-disable-next-line no-bitwise
  const flags = constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW;
  let handle = await open("/", flags);
  try {
    for (const segment of segments) {
      const path = `/proc/self/fd/${handle.fd}/${segment}`;
      const before = await lstat(path, { bigint: true });
      check(before.isDirectory() && !before.isSymbolicLink(), "Source parent contains a symlink or non-directory.");
      const child = await open(path, flags);
      try {
        const current = await child.stat({ bigint: true });
        check(current.isDirectory() && sameInode(before, current), "Source directory changed while opening.");
      } catch (error) { await child.close(); throw error; }
      try { await handle.close(); }
      catch (error) {
        const closed = await Promise.allSettled([child.close()]);
        const first = closed[0];
        if (first?.status === "rejected") { throw new AggregateError([error, first.reason], "Source traversal cleanup failed.", { cause: error }); }
        throw error;
      }
      handle = child;
    }
    return { absolute, handle, info: await handle.stat({ bigint: true }) };
  } catch (error) { await handle.close(); throw error; }
}
async function assertDirectory(directory: BoundDirectory): Promise<void> {
  const current = await bindDirectory(directory.absolute);
  try {
    check(sameInode(directory.info, current.info) && sameInode(directory.info, await directory.handle.stat({ bigint: true })),
      "Source directory path changed during copy.");
  } finally { await current.handle.close(); }
}
async function absentSidecars(path: string): Promise<void> {
  for (const suffix of ["-wal", "-shm", "-journal"]) {
    const absent = await lstat(`${path}${suffix}`).then(() => false, (error: unknown) => {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") { return true; }
      throw error;
    });
    check(absent, "Closed source or artifact has a SQLite sidecar.");
  }
}
async function hashFile(handle: FileHandle, bytes: number): Promise<string> {
  const hash = createHash("sha256");
  const buffer = Buffer.alloc(Math.min(CHUNK_BYTES, bytes));
  let position = 0;
  while (position < bytes) {
    const result = await handle.read(buffer, 0, Math.min(buffer.length, bytes - position), position);
    check(result.bytesRead > 0, "File ended during bounded hash read.");
    hash.update(buffer.subarray(0, result.bytesRead));
    position += result.bytesRead;
  }
  const eof = await handle.read(Buffer.alloc(1), 0, 1, bytes);
  check(eof.bytesRead === 0, "File grew during bounded hash read.");
  return hash.digest("hex");
}
async function copyBytes(source: FileHandle, artifact: FileHandle, bytes: number): Promise<string> {
  const hash = createHash("sha256");
  const buffer = Buffer.alloc(Math.min(CHUNK_BYTES, bytes));
  let position = 0;
  while (position < bytes) {
    const result = await source.read(buffer, 0, Math.min(buffer.length, bytes - position), position);
    check(result.bytesRead > 0, "Source ended during bounded copy.");
    hash.update(buffer.subarray(0, result.bytesRead));
    let written = 0;
    while (written < result.bytesRead) {
      const output = await artifact.write(buffer, written, result.bytesRead - written, position + written);
      check(output.bytesWritten > 0, "Artifact write made no progress.");
      written += output.bytesWritten;
    }
    position += result.bytesRead;
  }
  return hash.digest("hex");
}

export async function copyClosedProjectBytes(input: Readonly<{
  closureProof: unknown;
  source: string;
  expectedSourceSha256: string;
  artifactDirectory: string;
}>): Promise<ClosedFileCopyReceipt> {
  // The module-level registry verifies an issued object; no injected boolean or
  // Structural supervisor lookalike can stand in for retained Windows proof.
  const { closureProof, source, expectedSourceSha256, artifactDirectory } = input;
  const proof = await assertClosedSessionCopyAuthority(closureProof);
  check(process.platform === "linux" && isAbsolute(source) && resolve(source) === source && source.endsWith(".eprj2") &&
    /^[a-f0-9]{64}$/u.test(expectedSourceSha256), "Closed byte copy requires a canonical pinned source.");
  check(isAbsolute(artifactDirectory) && resolve(artifactDirectory) === artifactDirectory,
    "Artifact directory must be canonical and absolute.");
  const directory = await bindDirectory(dirname(source));
  const sourceBound = `/proc/self/fd/${directory.handle.fd}/${basename(source)}`;
  let sourceHandle: FileHandle | undefined;
  let artifactHandle: FileHandle | undefined;
  let root: Awaited<ReturnType<typeof openControlRootCapability>> | undefined;
  let artifact: string | undefined;
  let failure: unknown;
  let failed = false;
  let completed: ClosedFileCopyReceipt | undefined;
  try {
    await absentSidecars(sourceBound);
    const before = await lstat(sourceBound, { bigint: true });
    check(validSource(before), "Closed source is not a bounded single-link regular file.");
    // O_NOFOLLOW prevents a source leaf substitution after the lstat check.
    // oxlint-disable-next-line no-bitwise
    sourceHandle = await open(sourceBound, constants.O_RDONLY | constants.O_NOFOLLOW);
    check(sameStableFile(before, await sourceHandle.stat({ bigint: true })), "Source identity changed while opening.");
    const bytes = Number(before.size);
    check(await hashFile(sourceHandle, bytes) === expectedSourceSha256, "Closed source hash differs from its independent binding.");
    await assertClosedSessionCopyAuthority(proof);
    root = await openControlRootCapability(artifactDirectory);
    const name = `closed-copy-${randomUUID()}.eprj2`;
    artifact = join(root.path, name);
    const artifactBound = root.childDescriptorPath(artifact);
    // Exclusive creation never overwrites an existing artifact or source.
    // oxlint-disable-next-line no-bitwise
    artifactHandle = await open(artifactBound, constants.O_CREAT | constants.O_EXCL | constants.O_RDWR | constants.O_NOFOLLOW, 0o600);
    const created = await artifactHandle.stat({ bigint: true });
    check(created.isFile() && created.nlink === 1n && created.size === 0n && created.mode % 512n === 0o600n,
      "New raw-copy artifact identity is invalid.");
    check(await copyBytes(sourceHandle, artifactHandle, bytes) === expectedSourceSha256, "Source bytes changed while copying.");
    await artifactHandle.sync();
    await root.handle.sync();
    const copied = await artifactHandle.stat({ bigint: true });
    check(validOutput(copied) && copied.size === before.size && sameInode(created, copied), "Raw copy artifact identity changed.");
    check(await hashFile(sourceHandle, bytes) === expectedSourceSha256 && await hashFile(artifactHandle, bytes) === expectedSourceSha256,
      "Independent post-copy hashes differ.");
    const confirmed = await assertClosedSessionCopyAuthority(proof);
    check(confirmed === proof, "Closed-generation proof identity changed.");
    await absentSidecars(sourceBound);
    await absentSidecars(artifactBound);
    await assertDirectory(directory);
    await root.assertCurrent();
    check(sameStableFile(before, await sourceHandle.stat({ bigint: true })) && sameStableFile(before, await lstat(sourceBound, { bigint: true })),
      "Closed source identity changed during copy.");
    check(sameStableFile(copied, await artifactHandle.stat({ bigint: true })) && sameStableFile(copied, await lstat(artifactBound, { bigint: true })),
      "Raw-copy artifact path changed during copy.");
    const payload = {
      schema: "easyeda-pro-control.closed-file-byte-copy.v1" as const, source, artifact, bytes, sha256: expectedSourceSha256,
      sourceIdentity: identity(before), artifactIdentity: identity(copied), closureProofSha256: proof.proofSha256,
      sourceEqualsArtifactBytes: true as const, sourceProjectGenerationBindingVerified: false as const, executionAuthorized: false as const,
    };
    completed = Object.freeze({ ...payload, receiptSha256: sha256Json(payload) });
  } catch (error) {
    failed = true;
    failure = artifact === undefined ? error : new Error(`Raw-copy verification failed; retain incomplete private evidence at ${artifact}.`, { cause: error });
  }
  const results = await Promise.allSettled([
    artifactHandle?.close(), sourceHandle?.close(), root?.close(), directory.handle.close(),
  ]);
  const errors: unknown[] = [];
  for (const result of results) {
    if (result.status === "rejected") { errors.push(result.reason); }
  }
  if (errors.length > 0) {
    if (failed) { errors.unshift(failure); }
    throw new AggregateError(errors, `Raw-copy cleanup failed; retain private evidence${artifact === undefined ? "." : ` at ${artifact}.`}`);
  }
  if (failed) { throw failure; }
  check(completed !== undefined, "Raw-copy receipt was not prepared.");
  try {
    check(await assertClosedSessionCopyAuthority(proof) === proof, "Final closed-generation copy authority changed.");
  } catch (error) {
    throw new Error(`Final raw-copy authority failed; retain incomplete private evidence at ${completed.artifact}.`, { cause: error });
  }
  copies.add(completed);
  return completed;
}

export function assertIssuedClosedFileCopy(value: ClosedFileCopyReceipt): void {
  check(copies.has(value), "Raw-copy receipt was not issued in this process.");
}
