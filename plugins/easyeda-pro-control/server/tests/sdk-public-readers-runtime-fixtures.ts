import assert from "node:assert/strict";
import crypto from "node:crypto";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { syncBuiltinESMExports } from "node:module";
import { dirname, join } from "node:path";
import type { TestContext } from "node:test";
import type { ExpectedFingerprint } from "../src/core.ts";
import { EDITOR_OBSERVATION_209_SELECTORS, EDITOR_OBSERVATION_209_UI } from "../src/editor-observation209-profile.ts";

/** Only exact synthetic fixture digests are substituted. Production exposes
 * no profile override or injected UI verifier.
 */
export function substituteSyntheticUiDigests(context: TestContext, substitutions: ReadonlyMap<string, string>, calls: string[]): void {
  const createHash = crypto.createHash;
  context.mock.method(crypto, "createHash", (...args: Parameters<typeof createHash>): ReturnType<typeof createHash> => {
    const hash = createHash(...args), originalDigest = hash.digest.bind(hash);
    function digest(): Buffer;
    function digest(encoding: crypto.BinaryToTextEncoding): string;
    function digest(encoding?: crypto.BinaryToTextEncoding): Buffer | string {
      if (encoding === undefined) { return originalDigest(); }
      const actual = originalDigest(encoding), replacement = encoding === "hex" ? substitutions.get(actual) : undefined;
      if (replacement !== undefined) { calls.push("ui-file-hash"); return replacement; }
      return actual;
    }
    context.mock.method(hash, "digest", digest); return hash;
  });
  syncBuiltinESMExports();
  context.after(() => { context.mock.restoreAll(); syncBuiltinESMExports(); });
}

export async function uiFixture(original: ExpectedFingerprint): Promise<{ expected: ExpectedFingerprint; fileCount: number; rewrite: (index: number, changed: boolean) => Promise<void>; substitutions: Map<string, string> }> {
  const root = process.env["EASYEDA_CONTROL_DATA_DIR"];
  assert.ok(root !== undefined); assert.match(root, /easyeda-test-control-/u);
  const parent = await mkdtemp(join(root, "public-readers-ui-runtime-"));
  const assetsRoot = join(parent, "assets");
  await mkdir(assetsRoot, { mode: 0o700 });
  const files: { path: string; contents: string }[] = [], substitutions = new Map<string, string>();
  for (const profile of [EDITOR_OBSERVATION_209_UI, ...EDITOR_OBSERVATION_209_SELECTORS]) {
    const contents = `synthetic public-reader UI fixture: ${profile.relativePath}`, path = join(assetsRoot, profile.relativePath);
    await mkdir(dirname(path), { recursive: true, mode: 0o700 }); await writeFile(path, contents, { mode: 0o600 }); files.push({ path, contents });
    substitutions.set(crypto.createHash("sha256").update(contents).digest("hex"), profile.sha256);
  }
  const expected = structuredClone(original); expected.installedBundles.assetsRoot = assetsRoot;
  return { expected, fileCount: files.length, substitutions, rewrite: async (index, changed): Promise<void> => {
    const file = files[index]; assert.ok(file); await writeFile(file.path, changed ? "changed UI or selector" : file.contents);
  } };
}
