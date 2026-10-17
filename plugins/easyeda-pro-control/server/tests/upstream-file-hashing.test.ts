import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { constants as fsConstants } from "node:fs";
import type { Stats } from "node:fs";
import { appendFile, lstat, mkdtemp, open, readFile, symlink, truncate, writeFile } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { stripTypeScriptTypes } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import type { TestContext } from "node:test";
import vm from "node:vm";

type HashFile = (path: string, expected: Stats, buffer?: Buffer) => Promise<{ bytes: number; sha256: string }>;

async function actualHasher(openFile: typeof open = open): Promise<HashFile> {
  const source = await readFile(new URL("../src/upstream-trust.ts", import.meta.url), "utf8");
  const start = source.indexOf("function sameIdentity(");
  const end = source.indexOf("async function detectDependencyLock(", start);
  assert.ok(start > 0 && end > start);
  const exposed: { hashOpenFile?: HashFile } = {};
  // Execute the unchanged private functions, without exporting a production
  // Test hook or allocating an upstream runtime. Files are private fixtures.
  vm.runInNewContext(stripTypeScriptTypes(`${source.slice(start, end)}\nObject.assign(exposed, { hashOpenFile });`),
    { Buffer, createHash, fsConstants, open: openFile, exposed });
  assert.ok(exposed.hashOpenFile);
  return exposed.hashOpenFile;
}

async function fixture(bytes: Buffer): Promise<string> {
  const directory = await mkdtemp(join(tmpdir(), "easyeda-hash-descriptor-"));
  const path = join(directory, "payload.bin");
  await writeFile(path, bytes, { mode: 0o600 });
  return path;
}

function observedOpen(context: TestContext, options: {
  readonly shortReads?: number;
  readonly beforeRead?: (path: string, index: number) => Promise<void> | void;
} = {}): { openFile: typeof open; handles: FileHandle[]; buffers: Set<unknown>; offsets: number[] } {
  const buffers = new Set<unknown>(), handles: FileHandle[] = [], offsets: number[] = [];
  const openFile: typeof open = async (...args): Promise<FileHandle> => {
    const handle = await open(...args); handles.push(handle);
    const nativeRead = handle.read.bind(handle);
    let index = 0;
    context.mock.method(handle, "read", async (...readArgs: unknown[]): Promise<unknown> => {
      assert.ok(Buffer.isBuffer(readArgs[0])); buffers.add(readArgs[0]);
      const position = readArgs[3]; assert.equal(typeof position, "number");
      assert.ok(typeof position === "number"); offsets.push(position);
      if (options.beforeRead !== undefined) { await options.beforeRead(String(args[0]), index); }
      index += 1;
      if (options.shortReads !== undefined) { readArgs[2] = Math.min(Number(readArgs[2]), options.shortReads); }
      const result: unknown = await Reflect.apply(nativeRead, undefined, readArgs);
      return result;
    });
    context.mock.method(handle, "createReadStream", (): never => { throw new Error("Descriptor hashing must not allocate streams."); });
    return handle;
  };
  return { openFile, handles, buffers, offsets };
}

void test("descriptor hashing matches complete bytes for empty, short and multi-buffer files and reuses scratch storage", async (context) => {
  const observed = observedOpen(context);
  const buffer = Buffer.allocUnsafe(65_536), hashFile = await actualHasher(observed.openFile);
  for (const size of [0, 1, 65_535, 65_536, 65_537, 196_621]) {
    const bytes = Buffer.alloc(size);
    for (let index = 0; index < size; index += 1) { bytes[index] = index % 251; }
    const path = await fixture(bytes);
    const actual = await hashFile(path, await lstat(path), buffer);
    assert.deepEqual(structuredClone(actual), { bytes: size, sha256: createHash("sha256").update(bytes).digest("hex") });
  }
  assert.equal(observed.buffers.size, 1); assert.ok(observed.buffers.has(buffer));
  assert.ok(observed.handles.every(handle => handle.fd === -1));
});

void test("descriptor hashing consumes short reads with explicit offsets and hashes only returned bytes", async (context) => {
  const bytes = Buffer.from("complete short-read payload"), path = await fixture(bytes);
  const observed = observedOpen(context, { shortReads: 3 });
  const hashFile = await actualHasher(observed.openFile);
  const actual = await hashFile(path, await lstat(path), Buffer.alloc(65_536, 0xFF));
  assert.deepEqual(structuredClone(actual), { bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") });
  assert.deepEqual(observed.offsets, [0, 3, 6, 9, 12, 15, 18, 21, 24, 27]);
  assert.ok(observed.handles.every(handle => handle.fd === -1));
});

void test("descriptor hashing rejects growth and truncation during reads and closes its descriptor", async (context) => {
  for (const change of ["grow", "truncate"] as const) {
    const path = await fixture(Buffer.alloc(100, 7));
    const observed = observedOpen(context, { beforeRead: async (selected, index): Promise<void> => {
      if (index === 1) {
        await (change === "grow" ? appendFile(selected, Buffer.alloc(17, 8)) : truncate(selected, 30));
      }
    } });
    const hashFile = await actualHasher(observed.openFile);
    await assert.rejects(hashFile(path, await lstat(path), Buffer.allocUnsafe(16)), /changed while hashing/u);
    assert.ok(observed.handles.every(handle => handle.fd === -1));
  }
});

void test("descriptor hashing retains read errors and closes acquired descriptors", async (context) => {
  const failure = new Error("isolated read failure"), path = await fixture(Buffer.alloc(100, 7));
  const observed = observedOpen(context, { beforeRead: (_path, index): void => {
    if (index === 1) { throw failure; }
  } });
  const hashFile = await actualHasher(observed.openFile);
  await assert.rejects(hashFile(path, await lstat(path), Buffer.allocUnsafe(16)), error => error === failure);
  assert.ok(observed.handles.every(handle => handle.fd === -1));
});

void test("descriptor hashing rejects stale identity and substituted symlinks before reading", async (context) => {
  const path = await fixture(Buffer.from("original"));
  const expected = await lstat(path);
  await writeFile(path, "replacement is longer");
  const observed = observedOpen(context);
  const hashFile = await actualHasher(observed.openFile);
  await assert.rejects(hashFile(path, expected), /changed before open/u);
  assert.equal(observed.offsets.length, 0); assert.ok(observed.handles.every(handle => handle.fd === -1));
  const link = `${path}.link`;
  await symlink(path, link);
  await assert.rejects(hashFile(link, await lstat(path)), { code: "ELOOP" });
  assert.equal(observed.offsets.length, 0);
});
