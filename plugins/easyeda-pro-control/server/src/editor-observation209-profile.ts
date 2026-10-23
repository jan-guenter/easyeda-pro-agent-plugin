import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import { isAbsolute, join } from "node:path";
import { SDK_PUBLIC_UTILITIES_209_PROFILE } from "./sdk-public-utilities-profile.ts";

/** Only shell/context and configured-shortcut observations reviewed against
 * this UI use this pin. It does not replace the legacy native UI profile.
 */
export const EDITOR_OBSERVATION_209_UI = Object.freeze({
  version: "3.2.198.2800f583",
  relativePath: "pro-ui/3.2.198.2800f583/js/ui.js",
  sha256: "3515d4c299b353fa7bcd0d859f0b8b59b7eae39b5dc243b2c27f2e54a60a1ee6",
});
export const EDITOR_OBSERVATION_209_PROVENANCE = Object.freeze({
  apiVersion: SDK_PUBLIC_UTILITIES_209_PROFILE.installedBundles.publicApi.version,
  apiSha256: SDK_PUBLIC_UTILITIES_209_PROFILE.installedBundles.publicApi.implementationSha256,
  uiVersion: EDITOR_OBSERVATION_209_UI.version, uiSha256: EDITOR_OBSERVATION_209_UI.sha256,
});
export const EDITOR_OBSERVATION_209_SELECTORS = Object.freeze([
  Object.freeze({ relativePath: "../editor.ini", sha256: "ced74cf98aedf6b04d0f23871b945f4155978d7e35edbc1704b8cdaf566623f9" }),
  Object.freeze({ relativePath: "pro-versions/3.2.209.8a704eab/editor.ini", sha256: "ced74cf98aedf6b04d0f23871b945f4155978d7e35edbc1704b8cdaf566623f9" }),
]);

function needUi(value: boolean): asserts value {
  if (!value) { throw new Error("Editor observation 209 UI implementation differs from its reviewed profile."); }
}

async function verifyPinnedFile(assetsRoot: string, profile: Readonly<{ relativePath: string; sha256: string }>): Promise<void> {
  const path = join(assetsRoot, profile.relativePath);
  const before = await lstat(path, { bigint: true });
  needUi(before.isFile() && !before.isSymbolicLink() && before.size > 0n && before.size <= 128n * 1024n * 1024n && await realpath(path) === path);
  // oxlint-disable-next-line eslint/no-bitwise -- Reject symlinks and avoid a blocking open if a FIFO replaces the inspected UI bundle.
  const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const opened = await file.stat({ bigint: true });
    needUi(opened.isFile() && before.dev === opened.dev && before.ino === opened.ino && before.size === opened.size &&
      before.mtimeNs === opened.mtimeNs && before.ctimeNs === opened.ctimeNs);
    const hash = createHash("sha256"); let consumed = 0n;
    for await (const chunk of file.createReadStream({ autoClose: false, highWaterMark: 1_048_576 })) {
      needUi(Buffer.isBuffer(chunk)); consumed += BigInt(chunk.length);
      needUi(consumed <= before.size && consumed <= 128n * 1024n * 1024n); hash.update(chunk);
    }
    const after = await file.stat({ bigint: true }), named = await lstat(path, { bigint: true });
    needUi(after.isFile() && consumed === before.size && before.dev === after.dev && before.ino === after.ino && before.size === after.size &&
      before.mtimeNs === after.mtimeNs && before.ctimeNs === after.ctimeNs && after.dev === named.dev && after.ino === named.ino &&
      after.size === named.size && after.mtimeNs === named.mtimeNs && after.ctimeNs === named.ctimeNs &&
      named.isFile() && !named.isSymbolicLink() && await realpath(path) === path && hash.digest("hex") === profile.sha256);
  } finally { await file.close(); }
}

/** Fixed 209 paths/digests only; the admitted fingerprint supplies the root.
 * Both installed selector files must name the reviewed UI/API generation.
 */
export async function verifyEditorObservation209Ui(assetsRoot: string): Promise<void> {
  needUi(isAbsolute(assetsRoot) && await realpath(assetsRoot) === assetsRoot);
  for (const profile of [EDITOR_OBSERVATION_209_UI, ...EDITOR_OBSERVATION_209_SELECTORS]) { await verifyPinnedFile(assetsRoot, profile); }
}
