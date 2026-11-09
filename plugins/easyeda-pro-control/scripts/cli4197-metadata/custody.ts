/** Descriptor-bound developer inputs. The vendor tree stays external; the
 * exact fixed inventory, bytes, modes, ownership and full roster must match.
 * Readonly binds do not make a mutable host runtime an atomic snapshot. */
/* oxlint-disable eslint/no-bitwise -- POSIX open flags and exact permission bits are explicit descriptor-admission checks in this module. */
import { constants } from "node:fs";
import { lstat, mkdtemp, open, readdir } from "node:fs/promises";
import type { BigIntStats } from "node:fs";
import type { FileHandle } from "node:fs/promises";
import { createHash } from "node:crypto";
import { basename, dirname, join, resolve } from "node:path";
import { z } from "zod";
import { CLI4197_METADATA_PROFILE as PROFILE } from "./profile.ts";

interface InventoryRow { readonly path: string; readonly bytes: number; readonly sha256: string; readonly mode: "0o644" | "0o755" }
const row = z.strictObject({ path: z.string().min(11).max(4096), bytes: z.number().int().nonnegative().max(PROFILE.runtimeBytes),
  sha256: z.string().regex(/^[a-f\d]{64}$/u), mode: z.enum(["0o644", "0o755"]) });
const need = (value: boolean): void => { if (!value) { throw new Error("CLI4197_METADATA_CUSTODY_REFUSED"); } };
const identity = (info: BigIntStats): string => [info.dev, info.ino, info.mode, info.nlink, info.uid, info.gid, info.size, info.mtimeNs, info.ctimeNs].join(":");
const descriptorPath = (handle: FileHandle, child?: string): string => `/proc/self/fd/${String(handle.fd)}${child === undefined ? "" : `/${child}`}`;
/** Canonical host paths cannot cross a symlink or another writable ownership
 * boundary. Private artifacts require an existing caller-owned mode0700 parent. */
export async function requireCli4197Directory(path: string, privateParent = false): Promise<FileHandle> {
  need(resolve(path) === path && path.startsWith("/") && !/[\0\r\n]/u.test(path));
  const segments = path.split("/").filter(Boolean); let current = "/";
  for (const segment of segments) {
    current = join(current, segment); const info = await lstat(current, { bigint: true });
    need(info.isDirectory() && !info.isSymbolicLink() && (info.uid === BigInt(process.getuid?.() ?? -1) || info.uid === 0n) && (info.mode & 0o022n) === 0n);
  }
  const before = await lstat(path, { bigint: true });
  if (privateParent) { need(before.uid === BigInt(process.getuid?.() ?? -1) && (before.mode & 0o7777n) === 0o700n); }
  const handle = await open(path, constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW);
  try { need(identity(await handle.stat({ bigint: true })) === identity(before)); return handle; }
  catch (caughtError) { await handle.close(); throw caughtError; }
}
/** Hash each complete regular file by its held descriptor, with exact metadata
 * before and after every bounded read. No file body is evaluated or imported. */
async function hashFile(handle: FileHandle, before: BigIntStats): Promise<string> {
  const buffer = Buffer.alloc(1_048_576), hash = createHash("sha256"); let position = 0;
  need(before.isFile() && before.nlink === 1n && before.size >= 0n && before.size <= BigInt(PROFILE.runtimeBytes));
  while (BigInt(position) < before.size) {
    const read = await handle.read(buffer, 0, Math.min(buffer.length, Number(before.size) - position), position);
    need(read.bytesRead > 0); hash.update(buffer.subarray(0, read.bytesRead)); position += read.bytesRead;
  }
  need(BigInt(position) === before.size && identity(await handle.stat({ bigint: true })) === identity(before)); return hash.digest("hex");
}
/** Only this exact retained candidate inventory is accepted. A caller-supplied
 * different digest, root prefix, extra file, symlink or mode cannot qualify it. */
export function parseCli4197Inventory(bytes: Buffer): readonly InventoryRow[] {
  need(bytes.length === PROFILE.inventoryBytes && createHash("sha256").update(bytes).digest("hex") === PROFILE.inventorySha256);
  const parsed: unknown = JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  const rows = z.array(row).length(PROFILE.runtimeFiles).parse(parsed), seen = new Set<string>(); let total = 0;
  for (const entry of rows) {
    // oxlint-disable-next-line eslint/no-control-regex -- Inventory paths must reject literal control characters before any filesystem lookup.
    need(entry.path.startsWith("lceda-pro/") && entry.path.isWellFormed() && !/[\u0000-\u001F\u007F\\]/u.test(entry.path));
    const parts = entry.path.split("/"); need(parts.every(part => part !== "" && part !== "." && part !== "..") && parts.length <= 24 && !seen.has(entry.path));
    seen.add(entry.path); total += entry.bytes;
  }
  need(total === PROFILE.runtimeBytes); return Object.freeze(rows.map(entry => Object.freeze({ ...entry, path: entry.path.slice("lceda-pro/".length) })));
}
/** Read an inventory by a canonical, nonsymlink descriptor with its fixed cap. */
async function inventoryFile(path: string): Promise<readonly InventoryRow[]> {
  const parent = await requireCli4197Directory(dirname(path)); let file: FileHandle | null = null;
  try {
    need(resolve(path) === path); file = await open(descriptorPath(parent, basename(path)), constants.O_RDONLY | constants.O_NOFOLLOW);
    const before = await file.stat({ bigint: true }); need(before.isFile() && before.nlink === 1n && before.size === BigInt(PROFILE.inventoryBytes) && (before.mode & 0o022n) === 0n &&
      (before.uid === BigInt(process.getuid?.() ?? -1) || before.uid === 0n));
    const bytes = Buffer.alloc(PROFILE.inventoryBytes + 1); let position = 0;
    while (position < bytes.length) { const read = await file.read(bytes, position, bytes.length - position, position); if (read.bytesRead === 0) { break; } position += read.bytesRead; }
    need(identity(await file.stat({ bigint: true })) === identity(before) && position === PROFILE.inventoryBytes);
    return parseCli4197Inventory(bytes.subarray(0, position));
  } finally { await file?.close(); await parent.close(); }
}
export interface Cli4197Runtime {
  readonly directory: FileHandle; readonly executable: FileHandle;
  readonly assertCurrent: () => Promise<void>; readonly dispose: () => Promise<void>;
}
/** Verify every expected directory/file and reject all unlisted peers. Parent
 * directory descriptors anchor each file lookup; no intermediate symlink runs. */
export async function openCli4197Runtime(runtimeDirectory: string, inventoryPath: string): Promise<Cli4197Runtime> {
  const inventory = await inventoryFile(inventoryPath); const expected = new Map(inventory.map(entry => [entry.path, entry]));
  const directory = await requireCli4197Directory(runtimeDirectory);
  const directories = new Map<string, Readonly<{ handle: FileHandle; identity: string }>>([["", { handle: directory, identity: identity(await directory.stat({ bigint: true })) }]]);
  let disposed = false, executable: FileHandle | null = null;
  const expectedDirectories = new Set<string>([""]);
  for (const path of expected.keys()) { let parent = dirname(path); while (parent !== ".") { expectedDirectories.add(parent); parent = dirname(parent); } }
  /** Retain only the reviewed candidate ELF's exact already-verified handle. */
  const retainExecutable = async (handle: FileHandle, before: BigIntStats, entry: InventoryRow, child: string): Promise<boolean> => {
    if (child !== PROFILE.executable) { return false; }
    need(entry.sha256 === PROFILE.executableSha256 && entry.bytes === PROFILE.executableBytes && entry.mode === "0o755");
    if (executable === null) { executable = handle; return true; }
    need(identity(await executable.stat({ bigint: true })) === identity(before)); return false;
  };
  /** Every validation rehashes complete files and rechecks the whole roster.
   * Repeated metadata alone never substitutes for expected runtime bytes. */
  const assertCurrent = async (): Promise<void> => {
    need(!disposed && identity(await lstat(runtimeDirectory, { bigint: true })) === directories.get("")?.identity);
    const files = new Set<string>(), foundDirectories = new Set<string>([""]);
    const walk = async (relative: string): Promise<void> => {
      const parent = directories.get(relative); need(parent !== undefined); if (parent === undefined) { throw new Error("CLI4197_METADATA_DIRECTORY_REQUIRED"); }
      need(identity(await parent.handle.stat({ bigint: true })) === parent.identity);
      for (const name of await readdir(descriptorPath(parent.handle))) {
        const child = relative === "" ? name : `${relative}/${name}`, path = descriptorPath(parent.handle, name); const before = await lstat(path, { bigint: true });
        need(!before.isSymbolicLink() && (before.uid === BigInt(process.getuid?.() ?? -1) || before.uid === 0n) && (before.mode & 0o022n) === 0n);
        if (before.isDirectory()) {
          need(expectedDirectories.has(child) && !foundDirectories.has(child)); foundDirectories.add(child);
          let held = directories.get(child);
          if (held === undefined) { const handle = await open(path, constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW); held = { handle, identity: identity(await handle.stat({ bigint: true })) }; directories.set(child, held); }
          need(held.identity === identity(before)); await walk(child);
        } else {
          const entry = expected.get(child); need(entry !== undefined && !files.has(child) && before.isFile());
          if (entry === undefined) { throw new Error("CLI4197_METADATA_FILE_REQUIRED"); }
          const mode = BigInt(Number.parseInt(entry.mode.slice(2), 8));
          need(before.size === BigInt(entry.bytes) && (before.mode & 0o7777n) === mode); files.add(child);
          const handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW); let keep = false;
          try {
            need(identity(await handle.stat({ bigint: true })) === identity(before) && await hashFile(handle, before) === entry.sha256 && identity(await lstat(path, { bigint: true })) === identity(before));
            if (child === PROFILE.executable) {
              keep = await retainExecutable(handle, before, entry, child);
            }
          } finally { if (!keep) { await handle.close(); } }
        }
      }
      need(identity(await parent.handle.stat({ bigint: true })) === parent.identity);
    };
    await walk(""); need(files.size === expected.size && foundDirectories.size === expectedDirectories.size && executable !== null);
  };
  const dispose = async (): Promise<void> => {
    if (disposed) { return; } disposed = true;
    const closed = await Promise.allSettled([executable?.close(), ...[...directories.values()].map(entry => entry.handle.close())]);
    need(closed.every(value => value.status === "fulfilled"));
  };
  try { await assertCurrent(); need(executable !== null); if (executable === null) { throw new Error("CLI4197_METADATA_EXECUTABLE_REQUIRED"); }
    return Object.freeze({ directory, executable, assertCurrent, dispose }); }
  catch (caughtError) { await dispose(); throw caughtError; }
}
export interface Cli4197Artifacts { readonly directory: string; readonly canaries: readonly FileHandle[]; readonly write: (name: string, bytes: Uint8Array) => Promise<void>; readonly dispose: () => Promise<void> }
/** Create a fresh private artifact directory and four unique empty descriptor
 * canaries. Artifact names are fixed by the runner and never caller-selected. */
export async function createCli4197Artifacts(parentPath: string): Promise<Cli4197Artifacts> {
  const parent = await requireCli4197Directory(parentPath, true); let directory: string;
  try { directory = await mkdtemp(join(parentPath, "cli4197-metadata-")); } finally { await parent.close(); }
  const canaries: FileHandle[] = [], handle = await requireCli4197Directory(directory, true);
  const names = new Set(["launch-intent.json", "bootstrap.mjs", "bootstrap-stdout.bin", "bootstrap-stderr.bin", "namespace-report.json", "vendor-stdout.bin", "vendor-stderr.bin", "closed-result.json", "closed-failure.json"]);
  try {
    for (const role of [6, 7, 8, 9]) {
      const path = descriptorPath(handle, `.canary-${String(role)}`); canaries.push(await open(path, constants.O_CREAT | constants.O_EXCL | constants.O_RDWR | constants.O_NOFOLLOW, 0o600));
    }
    const write = async (name: string, bytes: Uint8Array): Promise<void> => {
      need(names.has(name) && bytes.length <= 131_072); const file = await open(descriptorPath(handle, name), constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY | constants.O_NOFOLLOW, 0o600);
      try { await file.writeFile(bytes); await file.sync(); } finally { await file.close(); } await handle.sync();
    };
    return Object.freeze({ directory, canaries: Object.freeze(canaries), write, dispose: async (): Promise<void> => {
      const closed = await Promise.allSettled([...canaries.map(canary => canary.close()), handle.close()]); need(closed.every(value => value.status === "fulfilled"));
    } });
  } catch (caughtError) { await Promise.allSettled([...canaries.map(canary => canary.close()), handle.close()]); throw caughtError; }
}
