import { createHash, randomUUID } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import type { BigIntStats } from "node:fs";
import { open, unlink } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import process from "node:process";

export interface PrivateRuntimePayload {
  readonly bytes: number;
  readonly descriptor: number;
  readonly handle: FileHandle;
  readonly sha256: string;
  readonly assertCurrent: () => Promise<void>;
  readonly dispose: () => Promise<void>;
}

function permissionMode(mode: bigint): number {
  return Number(mode % 512n);
}

function sameStableFile(left: BigIntStats, right: BigIntStats): boolean {
  return (
    left.isFile() &&
    right.isFile() &&
    left.dev === right.dev &&
    left.ino === right.ino &&
    left.size === right.size &&
    left.mode === right.mode &&
    left.mtimeNs === right.mtimeNs
  );
}

async function readExact(
  handle: FileHandle,
  size: number,
): Promise<Buffer> {
  const bytes = Buffer.alloc(size);
  let offset = 0;
  while (offset < bytes.length) {
    const result = await handle.read(
      bytes,
      offset,
      bytes.length - offset,
      offset,
    );
    if (result.bytesRead === 0) {
      throw new Error("Private runtime payload ended before its recorded size.");
    }
    offset += result.bytesRead;
  }
  return bytes;
}

async function writeExact(handle: FileHandle, bytes: Buffer): Promise<void> {
  let offset = 0;
  while (offset < bytes.length) {
    const result = await handle.write(
      bytes,
      offset,
      bytes.length - offset,
      offset,
    );
    if (result.bytesWritten === 0) {
      throw new Error("Private runtime payload write made no progress.");
    }
    offset += result.bytesWritten;
  }
}

export async function stagePrivateRuntimePayload(
  source: Buffer,
  privateDirectory: FileHandle,
): Promise<PrivateRuntimePayload> {
  if (process.platform !== "linux") {
    throw new Error("Private runtime payload staging requires Linux descriptors.");
  }
  if (source.length === 0 || source.length > 16 * 1024 * 1024) {
    throw new Error("Private runtime payload has an unsupported byte length.");
  }
  const directoryInformation = await privateDirectory.stat({ bigint: true });
  if (
    !directoryInformation.isDirectory() ||
    permissionMode(directoryInformation.mode) !== 0o700 ||
    (typeof process.getuid === "function" &&
      directoryInformation.uid !== BigInt(process.getuid()))
  ) {
    throw new Error("Runtime payload directory must be owner-owned mode 0700.");
  }
  const path = `/proc/self/fd/${privateDirectory.fd}/.${randomUUID()}.graph`;
  let writable: FileHandle | undefined;
  let readable: FileHandle | undefined;
  try {
    writable = await open(
      path,
      fsConstants.O_CREAT |
        fsConstants.O_EXCL |
        fsConstants.O_RDWR |
        fsConstants.O_NOFOLLOW,
      0o600,
    );
    // Positional writes preserve offset zero in the open-file description.
    // Bubblewrap consumes seccomp bytecode from that exact offset.
    await writeExact(writable, source);
    await writable.sync();
    await writable.chmod(0o400);
    const written = await writable.stat({ bigint: true });
    if (
      !written.isFile() ||
      written.size !== BigInt(source.length) ||
      written.nlink !== 1n ||
      permissionMode(written.mode) !== 0o400 ||
      (typeof process.getuid === "function" &&
        written.uid !== BigInt(process.getuid()))
    ) {
      throw new Error("Private runtime payload publication is not owner-only.");
    }
    // Retain the exact created inode through verification and unlink. Closing
    // Then reopening its name would permit a FIFO substitution that blocks open.
    readable = writable;
    writable = undefined;
    const opened = await readable.stat({ bigint: true });
    if (
      !sameStableFile(written, opened) ||
      written.nlink !== opened.nlink ||
      written.ctimeNs !== opened.ctimeNs
    ) {
      throw new Error("Private runtime payload changed before descriptor open.");
    }
    const captured = await readExact(readable, source.length);
    const sha256 = createHash("sha256").update(captured).digest("hex");
    if (!captured.equals(source)) {
      throw new Error("Private runtime payload differs from its captured source bytes.");
    }
    await unlink(path);
    await privateDirectory.sync();
    const unlinked = await readable.stat({ bigint: true });
    if (
      !sameStableFile(opened, unlinked) ||
      opened.nlink !== 1n ||
      unlinked.nlink !== 0n ||
      unlinked.ctimeNs < opened.ctimeNs
    ) {
      throw new Error("Private runtime payload did not become descriptor-only.");
    }
    let disposed = false;
    const assertCurrent = async (): Promise<void> => {
      if (disposed || readable === undefined) {
        throw new Error("Private runtime payload descriptor is closed.");
      }
      const before = await readable.stat({ bigint: true });
      const current = await readExact(readable, source.length);
      const after = await readable.stat({ bigint: true });
      if (
        !sameStableFile(unlinked, before) ||
        !sameStableFile(before, after) ||
        before.nlink !== 0n ||
        after.nlink !== 0n ||
        before.ctimeNs !== unlinked.ctimeNs ||
        after.ctimeNs !== before.ctimeNs ||
        createHash("sha256").update(current).digest("hex") !== sha256
      ) {
        throw new Error("Private runtime payload changed before sandbox spawn.");
      }
    };
    const dispose = async (): Promise<void> => {
      if (!disposed && readable !== undefined) {
        await readable.close();
        disposed = true;
        readable = undefined;
      }
    };
    await assertCurrent();
    return {
      assertCurrent,
      bytes: source.length,
      descriptor: readable.fd,
      dispose,
      handle: readable,
      sha256,
    };
  } catch (error) {
    const cleanupErrors: unknown[] = [];
    await writable?.close().catch((cleanupError: unknown) => {
      cleanupErrors.push(cleanupError);
    });
    await readable?.close().catch((cleanupError: unknown) => {
      cleanupErrors.push(cleanupError);
    });
    try {
      await unlink(path);
    } catch (cleanupError) {
      if (
        cleanupError === null ||
        typeof cleanupError !== "object" ||
        !("code" in cleanupError) ||
        cleanupError.code !== "ENOENT"
      ) {
        cleanupErrors.push(cleanupError);
      }
    }
    await privateDirectory.sync().catch((cleanupError: unknown) => {
      cleanupErrors.push(cleanupError);
    });
    if (cleanupErrors.length > 0) {
      throw new AggregateError(
        [error, ...cleanupErrors],
        "Private runtime payload staging and cleanup both failed.",
        { cause: error },
      );
    }
    throw error;
  }
}
