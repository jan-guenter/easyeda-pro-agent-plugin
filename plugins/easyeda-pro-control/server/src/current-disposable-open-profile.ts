import { createHash } from "node:crypto";
import { constants } from "node:fs";
import type { BigIntStats } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import { dirname, isAbsolute, resolve } from "node:path";
import { CURRENT_UI_IMPLEMENTATION, verifyCurrentUiImplementation } from "./current-ui-implementation.ts";

/** Opening is an ordinary writable application lifecycle. These additional
 * backend pins do not grant the legacy writer's persistence guarantees.
 */
export const CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION = Object.freeze({
  schema: "easyeda-pro-control.current-disposable-open-implementation.v1",
  ui: CURRENT_UI_IMPLEMENTATION,
  files: [
    { relativePath: "../app.js", bytes: 2_657_192, sha256: "52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c" },
    { relativePath: "pro-mgr/3.2.184.355087e9/js/pro-mgr.js", bytes: 2_196_400,
      sha256: "005584e02cd9b2d49fdb387b2f997c1c8d3f88b0c48a7531c8097c483ed0bd2e" },
    { relativePath: "pro-mgr/3.2.184.355087e9/js/project-worker.js", bytes: 2_181_284,
      sha256: "b849bd124dc3e31d7c491381fba301ed0c759ffc3c513519b464c66977951928" },
  ],
});

/** The internal writer witness additionally observes the notify-bus clock.
 * This fixed source qualification does not prove a retained WS responder.
 */
export const CURRENT_SYMBOL_CLOCK_IMPLEMENTATION = Object.freeze({
  relativePath: "pro-mgr/3.2.184.355087e9/js/ws-service.js", bytes: 855_142,
  sha256: "7a372d7271225999c3d16bcef1cd91c0fa2d3a1a402ebcf9761442ecf3187453",
});

/** Extra dependencies for the exact local symbol/history/structure producer.
 * This is source admission only: the original reviewed win32-x64 executable,
 * owned Job, local routing and closed SQL effect still need their own proofs.
 */
export const CURRENT_SYMBOL_PERSISTENCE_IMPLEMENTATION = Object.freeze({
  schema: "easyeda-pro-control.current-symbol-persistence-implementation.v1",
  files: Object.freeze([
    Object.freeze({ relativePath: "../node_modules/sqlite3/package.json", bytes: 3619,
      sha256: "a7d2279dfd425ee3f2f368e5160955491333967f7207ff3690a747a11f049985" }),
    Object.freeze({ relativePath: "../node_modules/sqlite3/lib/sqlite3.js", bytes: 6309,
      sha256: "e453648b76b80be1334dc49bf3ba19672f7acbd11b5d8b1ebe0cab08e3c5edf3" }),
    Object.freeze({ relativePath: "../node_modules/sqlite3/lib/sqlite3-binding.js", bytes: 449,
      sha256: "946769d049dacf8a564ab0f7076e1762ebae7ee7aba43d8ac5d72103089b6ccf" }),
    Object.freeze({ relativePath: "../node_modules/sqlite3/lib/binding/napi-v3-win32-x64/node_sqlite3.node", bytes: 2_742_272,
      sha256: "a851d31983fd21ee3821b1a0ca148c013029f96c6e0d31afc400e6a62ea7b482" }),
  ]),
  absent: Object.freeze(["../node_modules/sqlite3.js", "../node_modules/sqlite3.json", "../node_modules/sqlite3.node",
    "../node_modules/sqlite3/lib/sqlite3"]),
});

/** Pin the implementation that owns linked-sheet initialization, not just its
 * caller. The private writer separately requires its exact no-repair predicate;
 * this shared source profile alone does not admit active-sheet startup effects.
 */
export const CURRENT_PROJECT_ONLY_SCH_IMPLEMENTATION = Object.freeze({
  relativePath: "pro-sch/3.2.192.b79ad524/js/sch-main.js", bytes: 6_289_422,
  sha256: "d9d6a955bf40d57daf9f27f31e0fff3191715ff50582418ad0922beb71b424bd",
});

export async function verifyCurrentProjectOnlyOpenImplementation(assetsRoot: string): Promise<void> {
  await verifyCurrentDisposableOpenImplementation(assetsRoot);
  await verifyFiles(assetsRoot, [CURRENT_PROJECT_ONLY_SCH_IMPLEMENTATION]);
}

/** Observation-only project context plus the existing notify-clock source.
 * This does not qualify SQLite persistence or grant a write route.
 */
export async function verifyCurrentProjectOnlySymbolPreflightImplementation(assetsRoot: string): Promise<void> {
  await verifyCurrentDisposableOpenImplementation(assetsRoot);
  await verifyFiles(assetsRoot, [CURRENT_PROJECT_ONLY_SCH_IMPLEMENTATION, CURRENT_SYMBOL_CLOCK_IMPLEMENTATION]);
}

function requirePinned(condition: boolean): asserts condition {
  if (!condition) { throw new Error("Current disposable-open implementation differs from its reviewed profile."); }
}

/** Fixed paths and hashes only. No tool argument may select code or a pin. */
export async function verifyCurrentDisposableOpenImplementation(assetsRoot: string): Promise<void> {
  requirePinned(isAbsolute(assetsRoot) && await realpath(assetsRoot) === assetsRoot);
  await verifyCurrentUiImplementation(assetsRoot);
  await verifyFiles(assetsRoot, CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION.files);
}

/** No caller-selected paths, hashes or profile overrides. Public metadata and
 * ordinary opening retain their existing pins and do not gain this RPC.
 */
export async function verifyCurrentSymbolWitnessImplementation(assetsRoot: string): Promise<void> {
  await verifyCurrentDisposableOpenImplementation(assetsRoot);
  await verifyFiles(assetsRoot, [CURRENT_SYMBOL_CLOCK_IMPLEMENTATION]);
}

/** Separate opt-in dependency check. Existing opening/read profiles do not call
 * this function, and matching these files grants no writer or process authority.
 * The fixed package main and binding loader were reviewed with verbose disabled;
 * no caller-supplied package resolver, paths, hashes or platform is accepted.
 */
export async function verifyCurrentSymbolPersistenceImplementation(assetsRoot: string): Promise<void> {
  requirePinned(isAbsolute(assetsRoot) && await realpath(assetsRoot) === assetsRoot);
  const before = await persistenceResolution(assetsRoot);
  await verifyCurrentDisposableOpenImplementation(assetsRoot);
  await verifyFiles(assetsRoot, CURRENT_SYMBOL_PERSISTENCE_IMPLEMENTATION.files);
  const after = await persistenceResolution(assetsRoot);
  requirePinned(before.length === after.length && before.every((item, index) => item === after[index]));
}

function identity(info: BigIntStats, directory: boolean): string {
  // Parent directory timestamps can change for unrelated sibling activity.
  // Their inode/type stays bound; selected file timestamps and link count do not.
  return [info.dev, info.ino, info.mode, ...(directory ? [] : [info.size, info.mtimeNs, info.ctimeNs, info.nlink])].join(":");
}

async function persistenceResolution(assetsRoot: string): Promise<readonly string[]> {
  const files = CURRENT_SYMBOL_PERSISTENCE_IMPLEMENTATION.files.map((pin) => resolve(assetsRoot, pin.relativePath));
  const directories = new Set<string>([assetsRoot]);
  for (const path of [assetsRoot, ...files]) {
    let directory = dirname(path);
    for (;;) {
      directories.add(directory);
      const parent = dirname(directory);
      if (parent === directory) { break; }
      directory = parent;
    }
  }
  const result: string[] = [];
  for (const directory of directories) {
    const info = await lstat(directory, { bigint: true });
    requirePinned(info.isDirectory() && !info.isSymbolicLink() && await realpath(directory) === directory);
    result.push(`${directory}:${identity(info, true)}`);
  }
  for (const path of files) {
    const info = await lstat(path, { bigint: true });
    requirePinned(info.isFile() && !info.isSymbolicLink() && info.nlink === 1n && await realpath(path) === path);
    result.push(`${path}:${identity(info, false)}`);
  }
  for (const relativePath of CURRENT_SYMBOL_PERSISTENCE_IMPLEMENTATION.absent) {
    await requireAbsent(resolve(assetsRoot, relativePath));
  }
  return result;
}

async function requireAbsent(path: string): Promise<void> {
  try { await lstat(path); }
  catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") { return; }
    throw error;
  }
  requirePinned(false);
}

async function verifyFiles(assetsRoot: string, pins: readonly Readonly<{ relativePath: string; bytes: number; sha256: string }>[]): Promise<void> {
  for (const pin of pins) {
    const path = resolve(assetsRoot, pin.relativePath);
    requirePinned(await realpath(path) === path);
    // oxlint-disable-next-line no-bitwise -- Do not follow a replaced symlink or block on a substituted FIFO.
    const handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    try {
      const before = await handle.stat({ bigint: true });
      requirePinned(before.isFile() && before.size === BigInt(pin.bytes));
      const hash = createHash("sha256");
      let bytes = 0;
      // Bound stream buffering while retaining every fresh byte and identity check.
      for await (const chunk of handle.createReadStream({ autoClose: false, highWaterMark: 1_048_576 })) {
        requirePinned(Buffer.isBuffer(chunk));
        bytes += chunk.length;
        requirePinned(bytes <= pin.bytes);
        hash.update(chunk);
      }
      const after = await handle.stat({ bigint: true }), named = await lstat(path, { bigint: true });
      requirePinned(bytes === pin.bytes && hash.digest("hex") === pin.sha256 && after.isFile() && named.isFile() &&
        !named.isSymbolicLink() && before.dev === after.dev && before.ino === after.ino && before.size === after.size &&
        before.mtimeNs === after.mtimeNs && before.ctimeNs === after.ctimeNs && after.dev === named.dev &&
        after.ino === named.ino && after.size === named.size && after.mtimeNs === named.mtimeNs &&
        after.ctimeNs === named.ctimeNs && await realpath(path) === path);
    } finally { await handle.close(); }
  }
}
