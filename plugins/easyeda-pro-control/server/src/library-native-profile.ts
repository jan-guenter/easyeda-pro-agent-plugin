import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import { isAbsolute, join } from "node:path";

export const LIBRARY_NATIVE_IMPLEMENTATION = Object.freeze({
  profile: "easyeda-pro-control.library-native.v1", version: "3.2.149.43637efe",
  relativePath: "pro-ui/3.2.149.43637efe/js/ui.js",
  sha256: "12414b9ded97913f7d7f30522a2265d2a6c995281e3347bfd1752206e647497a",
});
export async function verifyLibraryNativeProfile(assetsRoot: string): Promise<typeof LIBRARY_NATIVE_IMPLEMENTATION> {
  if (!isAbsolute(assetsRoot) || await realpath(assetsRoot) !== assetsRoot) { throw new Error("Library implementation root is not canonical."); }
  const path = join(assetsRoot, LIBRARY_NATIVE_IMPLEMENTATION.relativePath);
  const before = await lstat(path, { bigint: true });
  if (!before.isFile() || before.isSymbolicLink() || before.size <= 0n || before.size > 128n * 1024n * 1024n || await realpath(path) !== path) { throw new Error("Library implementation is not a bounded regular file."); }
  // oxlint-disable-next-line eslint/no-bitwise -- Never follow a substituted native implementation symlink.
  const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const hash = createHash("sha256");
    for await (const chunk of file.createReadStream({ autoClose: false })) {
      if (!Buffer.isBuffer(chunk)) { throw new TypeError("Native implementation stream is not binary."); }
      hash.update(chunk);
    }
    const after = await file.stat({ bigint: true });
    const current = await lstat(path, { bigint: true });
    if (before.dev !== after.dev || before.ino !== after.ino || before.size !== after.size || before.mtimeNs !== after.mtimeNs || before.ctimeNs !== after.ctimeNs || after.dev !== current.dev || after.ino !== current.ino || after.mtimeNs !== current.mtimeNs || after.ctimeNs !== current.ctimeNs || hash.digest("hex") !== LIBRARY_NATIVE_IMPLEMENTATION.sha256) { throw new Error("Native library implementation differs from the reviewed profile."); }
    return LIBRARY_NATIVE_IMPLEMENTATION;
  } finally { await file.close(); }
}
