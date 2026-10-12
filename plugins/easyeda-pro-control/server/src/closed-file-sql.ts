/** Internal copy-to-inventory binding. No project-open or execution authority. */
import { lstat } from "node:fs/promises";
import { assertIssuedClosedFileCopy } from "./closed-file-copy.ts";
import type { ClosedFileCopyReceipt } from "./closed-file-copy.ts";
import type { MachineProfile } from "./machine-profile.ts";
import { readExactSqlInventory } from "./sqlite-inventory.ts";

async function assertArtifact(receipt: ClosedFileCopyReceipt): Promise<void> {
  assertIssuedClosedFileCopy(receipt);
  const value = await lstat(receipt.artifact, { bigint: true });
  const expected = receipt.artifactIdentity;
  if (!value.isFile() || value.isSymbolicLink() || value.dev.toString() !== expected.device ||
    value.ino.toString() !== expected.inode || value.size.toString() !== expected.size ||
    value.mtimeNs.toString() !== expected.mtimeNs || value.ctimeNs.toString() !== expected.ctimeNs ||
    value.birthtimeNs.toString() !== expected.birthtimeNs || value.mode.toString() !== expected.mode ||
    value.uid.toString() !== expected.uid || value.gid.toString() !== expected.gid ||
    value.nlink.toString() !== expected.links) {
    throw new Error("Closed-copy artifact differs from its issued receipt.");
  }
}

/** A later application launch does not invalidate historical private evidence.
 * This rebinds only the issued artifact and its bytes, never the source project.
 * The coordinator must separately prove project/generation ownership and effects.
 */
export async function readClosedCopySqlInventory(input: Readonly<{
  copy: ClosedFileCopyReceipt;
  runtime: MachineProfile["runtime"];
}>): ReturnType<typeof readExactSqlInventory> {
  await assertArtifact(input.copy);
  const inventory = await readExactSqlInventory({ checkpointPath: input.copy.artifact,
    expectedSha256: input.copy.sha256, runtime: input.runtime });
  await assertArtifact(input.copy);
  return inventory;
}
