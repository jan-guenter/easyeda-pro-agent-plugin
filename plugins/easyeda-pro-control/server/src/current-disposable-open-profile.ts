import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import { isAbsolute, resolve } from "node:path";
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
      for await (const chunk of handle.createReadStream({ autoClose: false })) {
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
