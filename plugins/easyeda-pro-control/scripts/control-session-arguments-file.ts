/** One bounded arguments snapshot for the foreground clients. The file names
 * data only and cannot supply a tool, control selector or executable source. */
import { createHash } from "node:crypto";
import { constants } from "node:fs";
import type { BigIntStats } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import { dirname, isAbsolute, resolve } from "node:path";

import { z } from "zod";

export const sessionArgumentsFileSchema = z.strictObject({
  path: z.string().min(1).max(4096).refine(path => isAbsolute(path) && resolve(path) === path),
  expectedSha256: z.string().regex(/^[a-f\d]{64}$/u),
});

/** Compare the named file with its original descriptor, including metadata
 * changes that could otherwise hide replacement, truncation or permission drift. */
function same(left: BigIntStats, right: BigIntStats): boolean {
  return left.dev === right.dev && left.ino === right.ino && left.mode === right.mode &&
    left.uid === right.uid && left.gid === right.gid && left.nlink === right.nlink &&
    left.size === right.size && left.mtimeNs === right.mtimeNs && left.ctimeNs === right.ctimeNs &&
    left.birthtimeNs === right.birthtimeNs;
}

/** Read through one original regular-file descriptor and verify its complete
 * byte snapshot before UTF-8 or JSON decoding. No reload or retry follows drift. */
export async function readSessionArgumentsFile(input: z.infer<typeof sessionArgumentsFileSchema>, maximumBytes: number): Promise<Readonly<{ value: unknown; bytes: number }>> {
  try {
    const selected = sessionArgumentsFileSchema.parse(input);
    if (!Number.isSafeInteger(maximumBytes) || maximumBytes < 1 || maximumBytes > 65_536) { throw new Error("arguments-file-rejected"); }
    const directory = dirname(selected.path), parent = await lstat(directory, { bigint: true });
    if (!parent.isDirectory() || parent.mode % 4096n !== 0o700n || parent.uid !== BigInt(process.getuid?.() ?? -1) ||
      await realpath(directory) !== directory || await realpath(selected.path) !== selected.path) { throw new Error("arguments-file-rejected"); }
    const named = await lstat(selected.path, { bigint: true });
    // oxlint-disable-next-line eslint/no-bitwise -- Kernel open flags must exclude final symlinks and avoid blocking on a non-regular substitute.
    const file = await open(selected.path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    try {
      const before = await file.stat({ bigint: true });
      if (!named.isFile() || !before.isFile() || named.isSymbolicLink() || before.nlink !== 1n ||
        before.mode % 4096n !== 0o600n || before.uid !== parent.uid || before.size < 1n ||
        before.size > BigInt(maximumBytes) || !same(named, before)) { throw new Error("arguments-file-rejected"); }
      const bytes = Buffer.alloc(Number(before.size)); let offset = 0;
      while (offset < bytes.length) {
        const read = await file.read(bytes, offset, bytes.length - offset, offset);
        if (read.bytesRead === 0) { throw new Error("arguments-file-rejected"); }
        offset += read.bytesRead;
      }
      const tail = await file.read(Buffer.alloc(1), 0, 1, bytes.length);
      const after = await file.stat({ bigint: true });
      const end = await lstat(selected.path, { bigint: true }), parentEnd = await lstat(directory, { bigint: true });
      if (tail.bytesRead !== 0 || !same(before, after) || !same(before, end) || end.isSymbolicLink() ||
        !same(parent, parentEnd) || await realpath(selected.path) !== selected.path ||
        createHash("sha256").update(bytes).digest("hex") !== selected.expectedSha256) { throw new Error("arguments-file-rejected"); }
      const text = new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes);
      const value: unknown = JSON.parse(text);
      return Object.freeze({ value, bytes: bytes.length });
    } finally { await file.close(); }
  } catch { throw new Error("arguments-file-rejected"); }
}
