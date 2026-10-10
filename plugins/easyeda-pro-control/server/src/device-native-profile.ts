import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import { isAbsolute, join } from "node:path";
import { verifyLibraryNativeProfile } from "./library-native-profile.ts";

export const DEVICE_NATIVE_IMPLEMENTATIONS = Object.freeze([
  { relativePath: "pro-mgr/3.2.148.154949d9/js/pro-mgr.js", sha256: "23089ec50bf701191c52af4a214b0d19b14e3233ead1bb5ccd50cf443e9e8742" },
  { relativePath: "pro-mgr/3.2.148.154949d9/js/project-worker.js", sha256: "2792c6c87e3c60e09c43f03494a9cbb24e4ebe9c385372bbaf877ed75083a949" },
]);
export async function verifyDeviceAssociationNativeProfile(assetsRoot: string): Promise<void> {
  await verifyLibraryNativeProfile(assetsRoot);
  if (!isAbsolute(assetsRoot) || await realpath(assetsRoot) !== assetsRoot) { throw new Error("Device implementation root is not canonical."); }
  for (const implementation of DEVICE_NATIVE_IMPLEMENTATIONS) {
    const path = join(assetsRoot, implementation.relativePath);
    const before = await lstat(path, { bigint: true });
    if (!before.isFile() || before.isSymbolicLink() || before.size <= 0n || before.size > 128n * 1024n * 1024n || await realpath(path) !== path) { throw new Error("Device native implementation is not a bounded regular file."); }
    // oxlint-disable-next-line eslint/no-bitwise -- Do not follow a substituted manager/worker implementation.
    const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
    try {
      const hash = createHash("sha256");
      for await (const chunk of file.createReadStream({ autoClose: false })) {
        if (!Buffer.isBuffer(chunk)) { throw new TypeError("Native device implementation stream is not binary."); }
        hash.update(chunk);
      }
      const after = await file.stat({ bigint: true });
      const current = await lstat(path, { bigint: true });
      if (before.dev !== after.dev || before.ino !== after.ino || before.size !== after.size || before.mtimeNs !== after.mtimeNs || before.ctimeNs !== after.ctimeNs || after.dev !== current.dev || after.ino !== current.ino || after.mtimeNs !== current.mtimeNs || after.ctimeNs !== current.ctimeNs || hash.digest("hex") !== implementation.sha256) { throw new Error("Native device implementation differs from the reviewed profile."); }
    } finally { await file.close(); }
  }
}
