import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import { isAbsolute, join } from "node:path";
import { MANAGED_FIXTURE_GENERATOR_PROFILE } from "./managed-fixture-generator.ts";
import { verifyEditorObservation209Ui } from "./editor-observation209-profile.ts";
import { SDK_PUBLIC_UTILITIES_209_PROFILE, selectSdkPublicUtilitiesRuntimeProfile } from "./sdk-public-utilities-profile.ts";

export const MANAGED_FIXTURE_IMPORT_PROFILE = Object.freeze({
  schema: "easyeda-pro-control.managed-fixture-import209-v1",
  sources: Object.freeze([
    ...MANAGED_FIXTURE_GENERATOR_PROFILE.sources,
    Object.freeze({ relativePath: "../app.js", bytes: 2_657_192, sha256: "52f51ce43cfebc81a362addde6cd27e39fa58c8fc1ab4ee5adacca4551e5ef0c" }),
    Object.freeze({ relativePath: "pro-api/0.3.59.1ca9efb5/api.js", bytes: 1_980_754, sha256: "e7c31b0de9dcbe4806e6b3cf8879b31c9e44425361bb8e67c3e8480ae359c8b1" }),
  ]),
  autoOpen: false, importOption: "ImportDocument", saveOperation: "Offline Client Local Path",
  structureTicket: 1, delayedStructureRoute: "manager-direct-main-setProfile", workerNdQaUsed: false,
  emptyAssetTemplateOnly: true, nativeImportLiveValidation: "not-recorded",
});

/** Compare full current fingerprints; no old-generation field substitution. */
export function assertManagedFixtureImportFingerprint(fingerprint: unknown): void {
  if (selectSdkPublicUtilitiesRuntimeProfile(fingerprint) !== SDK_PUBLIC_UTILITIES_209_PROFILE) { throw new Error("Managed fixture import requires the reviewed 209 runtime."); }
}

/** Read-only source admission on every import, fixed paths and complete hashes.
 * No installed helper is started and no source pin can be supplied by callers.
 */
export async function verifyManagedFixtureImportSources(assetsRoot: string): Promise<void> {
  if (!isAbsolute(assetsRoot) || await realpath(assetsRoot) !== assetsRoot) { throw new Error("Fixture import assets root differs from its canonical installation."); }
  await verifyEditorObservation209Ui(assetsRoot);
  for (const profile of MANAGED_FIXTURE_IMPORT_PROFILE.sources) {
    const path = join(assetsRoot, profile.relativePath); const before = await lstat(path, { bigint: true });
    if (!before.isFile() || before.isSymbolicLink() || before.size !== BigInt(profile.bytes) || await realpath(path) !== path) { throw new Error("Fixture import installed source differs from its fixed profile."); }
    // oxlint-disable-next-line eslint/no-bitwise -- Retain a nonblocking read-only descriptor without following a substituted symlink/FIFO.
    const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    try {
      const opened = await file.stat({ bigint: true }); const hash = createHash("sha256"); let consumed = 0n;
      for await (const chunk of file.createReadStream({ autoClose: false, highWaterMark: 1_048_576 })) {
        if (!Buffer.isBuffer(chunk)) { throw new TypeError("Fixture source hashing returned non-binary data."); }
        consumed += BigInt(chunk.length); if (consumed > before.size) { throw new Error("Fixture import source grew during admission."); } hash.update(chunk);
      }
      const after = await file.stat({ bigint: true }), named = await lstat(path, { bigint: true });
      for (const item of [opened, after, named]) {
        if (!item.isFile() || item.dev !== before.dev || item.ino !== before.ino || item.size !== before.size || item.mtimeNs !== before.mtimeNs || item.ctimeNs !== before.ctimeNs) { throw new Error("Fixture import installed source changed during admission."); }
      }
      if (consumed !== before.size || await realpath(path) !== path || hash.digest("hex") !== profile.sha256) { throw new Error("Fixture import source bytes differ from their reviewed identity."); }
    } finally { await file.close(); }
  }
}
