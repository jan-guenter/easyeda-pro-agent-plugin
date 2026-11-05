#!/usr/bin/env node
/** Independent single-file frontend publication. It changes neither the
 * historical facade/supervisor pair journal nor native runtime identity. */
import { createHash, randomBytes } from "node:crypto";
import { constants } from "node:fs";
import type { BigIntStats } from "node:fs";
import { lstat, open, realpath, rename, unlink } from "node:fs/promises";
import type { FileHandle } from "node:fs/promises";
import { join, resolve } from "node:path";
import { buildForegroundManagerBundle, requireForegroundManagerBundle } from "./build-server.ts";
import type { ForegroundManagerBundle } from "./build-server.ts";
import { captureContainedRegularFile } from "./bundled-runtime-license.ts";

export const FOREGROUND_MANAGER_OUTPUT_NAME = "control-session-manager.mjs";
const MAXIMUM_BYTES = 16_777_216;
/** Refuse only known absence; permission failures and malformed paths retain
 * their original publication failure instead of being treated as first build. */
function absent(error: unknown): boolean { return error !== null && typeof error === "object" && "code" in error && error.code === "ENOENT"; }
/** Reprove the same output directory without comparing read-sensitive atime or
 * directory timestamps that our own exclusive staging legitimately changes. */
function sameDirectory(expected: BigIntStats, actual: BigIntStats): boolean {
  return actual.isDirectory() && !actual.isSymbolicLink() && expected.dev === actual.dev && expected.ino === actual.ino && expected.mode === actual.mode;
}
/** The existing output keeps its own unchanged descriptor identity while our
 * exclusive sibling staging legitimately changes only directory timestamps. */
function sameFile(expected: BigIntStats, actual: BigIntStats): boolean {
  return actual.isFile() && !actual.isSymbolicLink() && actual.nlink === 1n && expected.dev === actual.dev && expected.ino === actual.ino &&
    expected.mode === actual.mode && expected.size === actual.size && expected.mtimeNs === actual.mtimeNs && expected.ctimeNs === actual.ctimeNs;
}
/** Read the retained original descriptor without moving its offset and bind
 * the same bounded bytes to its current pathname before replacement. */
async function readPreviousFile(file: FileHandle, path: string, expected: BigIntStats): Promise<Buffer> {
  if (!sameFile(expected, await file.stat({ bigint: true }))) { throw new Error("Foreground manager previous output changed."); }
  const bytes = Buffer.alloc(Number(expected.size) + 1); let length = 0;
  while (length < bytes.length) {
    const read = await file.read(bytes, length, bytes.length - length, length);
    if (read.bytesRead === 0) { break; } length += read.bytesRead;
  }
  if (length !== Number(expected.size) || !sameFile(expected, await file.stat({ bigint: true })) || !sameFile(expected, await lstat(path, { bigint: true }))) {
    throw new Error("Foreground manager previous output changed.");
  }
  return bytes.subarray(0, length);
}
/** Atomically replace one complete frontend from its original sealed bytes.
 * A failed build never mutates the facade pair, selected native owner or profile. */
export async function publishForegroundManagerBundle(outputRoot: string, bundle: ForegroundManagerBundle): Promise<string> {
  requireForegroundManagerBundle(bundle); const bytes = Buffer.from(bundle.bytes);
  if (await realpath(outputRoot) !== outputRoot) { throw new Error("Foreground manager output root must be canonical."); }
  const before = await lstat(outputRoot, { bigint: true });
  if (!before.isDirectory() || before.isSymbolicLink()) { throw new Error("Foreground manager output root must be a directory."); }
  // oxlint-disable-next-line eslint/no-bitwise -- Bind publication to the original directory rather than a replaceable final pathname.
  const directory = await open(outputRoot, constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW);
  const descriptorRoot = `/proc/self/fd/${directory.fd}`;
  const outputPath = join(outputRoot, FOREGROUND_MANAGER_OUTPUT_NAME);
  const temporaryName = `.foreground-manager-candidate-${randomBytes(16).toString("hex")}`;
  const temporaryPath = join(descriptorRoot, temporaryName); let staged = false; let originalFailure: unknown; let failed = false;
  let previousFile: FileHandle | undefined;
  try {
    if (!sameDirectory(before, await directory.stat({ bigint: true }))) { throw new Error("Foreground manager output directory changed."); }
    let previous: BigIntStats | undefined;
    try { previous = await lstat(outputPath, { bigint: true }); }
    catch (error) { if (!absent(error)) { throw error; } }
    let previousBytes: Buffer | undefined, previousSha256: string | undefined;
    if (previous !== undefined) {
      if (!previous.isFile() || previous.isSymbolicLink() || previous.nlink !== 1n || previous.size <= 0n || previous.size > BigInt(MAXIMUM_BYTES)) {
        throw new Error("Foreground manager previous output must be one bounded regular file.");
      }
      // oxlint-disable-next-line eslint/no-bitwise -- Retain only the original regular output, without following a replaced link or blocking on a nonregular substitution.
      previousFile = await open(outputPath, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
      previousBytes = await readPreviousFile(previousFile, outputPath, previous);
      previousSha256 = createHash("sha256").update(previousBytes).digest("hex");
    }
    const file = await open(temporaryPath, "wx", 0o644); staged = true;
    try { await file.writeFile(bytes); await file.sync(); }
    finally { await file.close(); }
    await bundle.assertCurrent(); requireForegroundManagerBundle(bundle);
    if (previous === undefined) {
      try { await lstat(outputPath); throw new Error("Foreground manager output appeared during publication."); }
      catch (error) { if (!absent(error)) { throw error; } }
    } else {
      if (previousFile === undefined || previousBytes === undefined) { throw new Error("Foreground manager previous descriptor missing."); }
      const current = await readPreviousFile(previousFile, outputPath, previous);
      if (!current.equals(previousBytes) || createHash("sha256").update(current).digest("hex") !== previousSha256) { throw new Error("Foreground manager previous output changed."); }
    }
    if (!sameDirectory(before, await lstat(outputRoot, { bigint: true })) || !sameDirectory(before, await directory.stat({ bigint: true }))) {
      throw new Error("Foreground manager output directory changed.");
    }
    await rename(temporaryPath, join(descriptorRoot, FOREGROUND_MANAGER_OUTPUT_NAME)); staged = false; await directory.sync();
    const published = await captureContainedRegularFile(outputRoot, outputPath, "The published foreground frontend");
    if (!sameDirectory(before, await lstat(outputRoot, { bigint: true })) || !sameDirectory(before, await directory.stat({ bigint: true }))) { throw new Error("Foreground manager output directory changed."); }
    if (published.sha256 !== bundle.sha256 || !published.bytes.equals(bytes)) { throw new Error("Foreground manager output differs from its original build."); }
    return outputPath;
  } catch (error) { failed = true; originalFailure = error; throw error; }
  finally {
    const cleanupFailures: unknown[] = [];
    try { if (staged) { await unlink(temporaryPath); } } catch (error) { cleanupFailures.push(error); }
    try { await previousFile?.close(); } catch (error) { cleanupFailures.push(error); }
    try { await directory.close(); } catch (error) { cleanupFailures.push(error); }
    if (cleanupFailures.length > 0) {
      // oxlint-disable-next-line eslint/no-unsafe-finally -- Cleanup failure must refuse publication while retaining the exact primary failure in the aggregate and cause.
      throw new AggregateError([...(failed ? [originalFailure] : []), ...cleanupFailures], "Foreground manager publication cleanup failed.", { cause: originalFailure });
    }
  }
}

if (import.meta.main) {
  const pluginRoot = resolve(import.meta.dirname, "..");
  // oxlint-disable-next-line node/no-top-level-await -- The build executable captures and publishes only its own separately identified frontend artifact.
  const bundle = await buildForegroundManagerBundle(pluginRoot);
  // oxlint-disable-next-line node/no-top-level-await -- No facade, child client or native owner starts during build/publication.
  const output = await publishForegroundManagerBundle(join(pluginRoot, "server", "dist"), bundle);
  process.stdout.write(`${output}\n`);
}
