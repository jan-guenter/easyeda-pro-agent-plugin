import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import { isAbsolute, join } from "node:path";
import { verifyDocumentContainerRenameNativeProfile } from "./document-container-rename-native-profile.ts";

// Retain UI/manager/worker/active-PCB pins, then pin the schematic manager's
// ON_ADD/AST subscribers even when no schematic canvas is open.
export const PROJECT_SCHEMATIC_CREATE_NATIVE_IMPLEMENTATION = Object.freeze({
  relativePath: "pro-sch/3.2.149.35ae2987/js/sch-main.js",
  sha256: "0ed765f9fbc6482a0d8c209a73316aee1e4605c3faa5dd6c434dbfe96019a88d",
});
export async function verifyProjectSchematicCreateNativeProfile(assetsRoot: string): Promise<void> {
  await verifyDocumentContainerRenameNativeProfile(assetsRoot);
  if (!isAbsolute(assetsRoot) || await realpath(assetsRoot) !== assetsRoot) { throw new Error("Schematic creation implementation root is not canonical."); }
  const implementation = PROJECT_SCHEMATIC_CREATE_NATIVE_IMPLEMENTATION, path = join(assetsRoot, implementation.relativePath);
  const before = await lstat(path, { bigint: true });
  if (!before.isFile() || before.isSymbolicLink() || before.size <= 0n || before.size > 128n * 1024n * 1024n || await realpath(path) !== path) { throw new Error("Schematic creation native implementation is not a bounded regular file."); }
  // oxlint-disable-next-line eslint/no-bitwise -- Do not follow a substituted editor implementation.
  const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const hash = createHash("sha256");
    for await (const chunk of file.createReadStream({ autoClose: false })) {
      if (!Buffer.isBuffer(chunk)) { throw new TypeError("Native schematic creation implementation stream is not binary."); }
      hash.update(chunk);
    }
    const after = await file.stat({ bigint: true }), current = await lstat(path, { bigint: true });
    if (before.dev !== after.dev || before.ino !== after.ino || before.size !== after.size || before.mtimeNs !== after.mtimeNs || before.ctimeNs !== after.ctimeNs || after.dev !== current.dev || after.ino !== current.ino || after.mtimeNs !== current.mtimeNs || after.ctimeNs !== current.ctimeNs || hash.digest("hex") !== implementation.sha256) { throw new Error("Native schematic creation implementation differs from the reviewed profile."); }
  } finally { await file.close(); }
}
