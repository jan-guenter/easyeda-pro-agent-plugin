import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import { isAbsolute, join } from "node:path";

export const SCHEMATIC_NATIVE_IMPLEMENTATION = Object.freeze({
  profile: "easyeda-pro-control.schematic-native.v1",
  version: "3.2.149.35ae2987",
  relativePath: "pro-sch/3.2.149.35ae2987/js/sch.js",
  sha256: "3f50136fb4ba2d5593beac7ef3e20ebe5275177b56bbcfdd297e79f176a6618f",
});

/** Private adapters admit one reviewed implementation, never a caller-selected hash. */
export async function verifySchematicNativeProfile(assetsRoot: string): Promise<typeof SCHEMATIC_NATIVE_IMPLEMENTATION> {
  if (!isAbsolute(assetsRoot) || await realpath(assetsRoot) !== assetsRoot) { throw new Error("Native profile assets root is not canonical."); }
  const path = join(assetsRoot, SCHEMATIC_NATIVE_IMPLEMENTATION.relativePath);
  const before = await lstat(path, { bigint: true });
  if (!before.isFile() || before.isSymbolicLink() || before.size <= 0n || before.size > 128n * 1024n * 1024n || await realpath(path) !== path) { throw new Error("Native profile implementation is not a bounded regular file."); }
  // oxlint-disable-next-line eslint/no-bitwise -- The exact reviewed implementation must not follow a substituted symlink.
  const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const hash = createHash("sha256");
    for await (const chunk of file.createReadStream({ autoClose: false })) {
      if (!Buffer.isBuffer(chunk)) { throw new TypeError("Native implementation stream is not binary."); }
      hash.update(chunk);
    }
    const after = await file.stat({ bigint: true });
    const current = await lstat(path, { bigint: true });
    if (before.dev !== after.dev || before.ino !== after.ino || before.size !== after.size || before.mtimeNs !== after.mtimeNs || before.ctimeNs !== after.ctimeNs ||
        after.dev !== current.dev || after.ino !== current.ino || after.mtimeNs !== current.mtimeNs || after.ctimeNs !== current.ctimeNs ||
        hash.digest("hex") !== SCHEMATIC_NATIVE_IMPLEMENTATION.sha256) { throw new Error("Installed schematic native implementation differs from its reviewed profile."); }
    return SCHEMATIC_NATIVE_IMPLEMENTATION;
  } finally { await file.close(); }
}
