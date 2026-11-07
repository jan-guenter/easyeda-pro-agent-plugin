import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import { isAbsolute, join } from "node:path";
import { verifyEditorObservation209Ui } from "./editor-observation209-profile.ts";

/** Current installed SCH getters, root-family/ID ownership and parent-page
 * initialization. These pins are independent of old schematic writer profiles. */
export const CURRENT_SCHEMATIC_PAGE_READ_IMPLEMENTATION = Object.freeze({
  version: "3.2.193.5dbe8bb3",
  files: Object.freeze([
    Object.freeze({ relativePath: "pro-sch/3.2.193.5dbe8bb3/js/sch-main.js", bytes: 6_289_622,
      sha256: "e7fdbc30cadd14fb87c5a50d2c5563241b4cf373d6eea8f7d0c9e7e59588d72c" }),
    Object.freeze({ relativePath: "pro-sch/3.2.193.5dbe8bb3/js/sch.js", bytes: 6_472_538,
      sha256: "b88ad265bb2bc7febb90af92a6f37189b3f90be7cd1f1427522c8f2435dfb4bd" }),
  ]),
});
function need(value: boolean): asserts value { if (!value) { throw new Error("SCH209_PAGE_IMPLEMENTATION_CHANGED"); } }

/** Fixed paths/digests only, rehashed before and after each registered read.
 * Source qualification grants no project-open, compiler or Save authority. */
async function verify(assetsRoot: string, files: readonly Readonly<{ relativePath: string; bytes: number; sha256: string }>[] ): Promise<void> {
  need(isAbsolute(assetsRoot) && await realpath(assetsRoot) === assetsRoot);
  await verifyEditorObservation209Ui(assetsRoot);
  for (const profile of files) {
    const path = join(assetsRoot, profile.relativePath);
    const before = await lstat(path, { bigint: true });
    need(before.isFile() && !before.isSymbolicLink() && before.size === BigInt(profile.bytes) && await realpath(path) === path);
    // oxlint-disable-next-line eslint/no-bitwise -- Refuse symlinks and a FIFO substituted after lstat.
    const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    try {
      const opened = await file.stat({ bigint: true });
      need(opened.isFile() && before.dev === opened.dev && before.ino === opened.ino && before.size === opened.size &&
        before.mtimeNs === opened.mtimeNs && before.ctimeNs === opened.ctimeNs);
      const hash = createHash("sha256"); let consumed = 0n;
      for await (const chunk of file.createReadStream({ autoClose: false, highWaterMark: 1_048_576 })) {
        need(Buffer.isBuffer(chunk)); consumed += BigInt(chunk.length); need(consumed <= before.size); hash.update(chunk);
      }
      const after = await file.stat({ bigint: true }), named = await lstat(path, { bigint: true });
      need(consumed === before.size && before.dev === after.dev && before.ino === after.ino && before.size === after.size &&
        before.mtimeNs === after.mtimeNs && before.ctimeNs === after.ctimeNs && after.dev === named.dev && after.ino === named.ino &&
        after.size === named.size && after.mtimeNs === named.mtimeNs && after.ctimeNs === named.ctimeNs &&
        named.isFile() && !named.isSymbolicLink() && await realpath(path) === path && hash.digest("hex") === profile.sha256);
    } finally { await file.close(); }
  }
}

export const CURRENT_SCHEMATIC_PAGE_OPENING_IMPLEMENTATION = Object.freeze({
  files: Object.freeze([
    ...CURRENT_SCHEMATIC_PAGE_READ_IMPLEMENTATION.files,
    Object.freeze({ relativePath: "../app.js", bytes: 2_657_192,
      sha256: "52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c" }),
    Object.freeze({ relativePath: "pro-mgr/3.2.185.bf63a159/js/pro-mgr.js", bytes: 2_196_424,
      sha256: "b3260ec9d98d6cad5f65a6234aa839b32f6bf5954cb03de0bd6ce003577b388d" }),
    Object.freeze({ relativePath: "pro-mgr/3.2.185.bf63a159/js/project-worker.js", bytes: 2_181_308,
      sha256: "0e7a474385029ac4f69dac08abdfd8beec7346aea8c2a4f71d5afb78bb454046" }),
  ]),
});

export function verifyCurrentSchematicPageReadImplementation(assetsRoot: string): Promise<void> {
  return verify(assetsRoot, CURRENT_SCHEMATIC_PAGE_READ_IMPLEMENTATION.files);
}

export function verifyCurrentSchematicPageOpeningImplementation(assetsRoot: string): Promise<void> {
  return verify(assetsRoot, CURRENT_SCHEMATIC_PAGE_OPENING_IMPLEMENTATION.files);
}
