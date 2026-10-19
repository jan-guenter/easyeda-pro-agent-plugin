import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import { isAbsolute, join } from "node:path";

export const CURRENT_UI_IMPLEMENTATION = Object.freeze({
  version: "3.2.196.26ed3d6c",
  relativePath: "pro-ui/3.2.196.26ed3d6c/js/ui.js",
  sha256: "3823ed6eb2798c5ff4bdd7f2428dad07282115914da70a1852710542e0e6ad0a",
});

function needUi(value: boolean): asserts value {
  if (!value) { throw new Error("Current UI implementation differs from its reviewed profile."); }
}

/** The fresh admitted fingerprint supplies the installation root. The bundle,
 * version and checksum are fixed; no caller file, pin or verifier is accepted.
 */
export async function verifyCurrentUiImplementation(assetsRoot: string): Promise<void> {
  needUi(isAbsolute(assetsRoot) && await realpath(assetsRoot) === assetsRoot);
  const path = join(assetsRoot, CURRENT_UI_IMPLEMENTATION.relativePath);
  const before = await lstat(path, { bigint: true });
  needUi(before.isFile() && !before.isSymbolicLink() && before.size > 0n && before.size <= 128n * 1024n * 1024n && await realpath(path) === path);
  // oxlint-disable-next-line eslint/no-bitwise -- Refuse symlinks and avoid blocking if a FIFO replaces the inspected UI bundle.
  const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const opened = await file.stat({ bigint: true });
    needUi(opened.isFile() && before.dev === opened.dev && before.ino === opened.ino && before.size === opened.size &&
      before.mtimeNs === opened.mtimeNs && before.ctimeNs === opened.ctimeNs);
    const hash = createHash("sha256");
    let consumed = 0n;
    // Bound stream buffering while retaining every fresh byte and identity check.
    for await (const chunk of file.createReadStream({ autoClose: false, highWaterMark: 1_048_576 })) {
      needUi(Buffer.isBuffer(chunk)); consumed += BigInt(chunk.length);
      needUi(consumed <= before.size && consumed <= 128n * 1024n * 1024n); hash.update(chunk);
    }
    const after = await file.stat({ bigint: true }), named = await lstat(path, { bigint: true });
    needUi(after.isFile() && consumed === before.size && before.dev === after.dev && before.ino === after.ino && before.size === after.size &&
      before.mtimeNs === after.mtimeNs && before.ctimeNs === after.ctimeNs && after.dev === named.dev && after.ino === named.ino &&
      after.size === named.size && after.mtimeNs === named.mtimeNs && after.ctimeNs === named.ctimeNs &&
      named.isFile() && !named.isSymbolicLink() && await realpath(path) === path && hash.digest("hex") === CURRENT_UI_IMPLEMENTATION.sha256);
  } finally { await file.close(); }
}
