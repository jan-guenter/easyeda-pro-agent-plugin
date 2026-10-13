import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import { isAbsolute, join } from "node:path";
import { verifyDeviceAssociationNativeProfile } from "./device-native-profile.ts";

// In addition to the UI, manager and worker, pin the only loaded editor's
// Metadata subscribers. A source review alone is not runtime admission.
export const DOCUMENT_CONTAINER_RENAME_NATIVE_IMPLEMENTATION = Object.freeze({
  relativePath: "pro-pcb/3.2.149.5378b690/js/pcb-main.js",
  sha256: "392995aeffcd72311a96f918c1ff68f7e10a087511fd75c9b823008b0ffa3530",
});
export async function verifyDocumentContainerRenameNativeProfile(assetsRoot: string): Promise<void> {
  await verifyDeviceAssociationNativeProfile(assetsRoot);
  if (!isAbsolute(assetsRoot) || await realpath(assetsRoot) !== assetsRoot) { throw new Error("Document rename implementation root is not canonical."); }
  const implementation = DOCUMENT_CONTAINER_RENAME_NATIVE_IMPLEMENTATION, path = join(assetsRoot, implementation.relativePath);
  const before = await lstat(path, { bigint: true });
  if (!before.isFile() || before.isSymbolicLink() || before.size <= 0n || before.size > 128n * 1024n * 1024n || await realpath(path) !== path) { throw new Error("Document rename native implementation is not a bounded regular file."); }
  // oxlint-disable-next-line eslint/no-bitwise -- Do not follow a substituted editor implementation.
  const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const hash = createHash("sha256");
    for await (const chunk of file.createReadStream({ autoClose: false })) {
      if (!Buffer.isBuffer(chunk)) { throw new TypeError("Native document rename implementation stream is not binary."); }
      hash.update(chunk);
    }
    const after = await file.stat({ bigint: true }), current = await lstat(path, { bigint: true });
    if (before.dev !== after.dev || before.ino !== after.ino || before.size !== after.size || before.mtimeNs !== after.mtimeNs || before.ctimeNs !== after.ctimeNs || after.dev !== current.dev || after.ino !== current.ino || after.mtimeNs !== current.mtimeNs || after.ctimeNs !== current.ctimeNs || hash.digest("hex") !== implementation.sha256) { throw new Error("Native document rename implementation differs from the reviewed profile."); }
  } finally { await file.close(); }
}
