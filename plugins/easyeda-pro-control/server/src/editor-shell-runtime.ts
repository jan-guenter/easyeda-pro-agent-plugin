import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import { isAbsolute, join } from "node:path";
import { assertExpectedFingerprint, assertSubset, assertUpstreamReplySettled, canonicalJson, extractToolPayload, sha256Json } from "./core.ts";
import { EDITOR_SHELL_MAX_BYTES, EDITOR_SHELL_UI_SHA256, EDITOR_SHELL_UI_VERSION, buildEditorShellProgram, parseEditorShellRequest, validateEditorShellResult } from "./editor-shell.ts";
import { decodeExactReadEnvelope } from "./exact-readers.ts";
import { SDK_LOCAL_RUNTIME_PROFILE, validateSdkLocalRuntimeFingerprint } from "./sdk-local-runtime.ts";
import type { SdkLocalEngine } from "./sdk-local-runtime.ts";

const uiImplementation = Object.freeze({ version: EDITOR_SHELL_UI_VERSION,
  relativePath: `pro-ui/${EDITOR_SHELL_UI_VERSION}/js/ui.js`, sha256: EDITOR_SHELL_UI_SHA256 });

export const EDITOR_SHELL_RUNTIME_PROFILE = Object.freeze({ ...SDK_LOCAL_RUNTIME_PROFILE,
  schema: "easyeda-pro-control.editor-shell-runtime.v1", uiImplementation });
export type EditorShellEngine = SdkLocalEngine;

function needUi(value: boolean): asserts value {
  if (!value) { throw new Error("Editor-shell UI implementation differs from its reviewed profile."); }
}

/** The fresh admitted fingerprint supplies the fixed installation root. No
 * caller file, checksum override or runtime verifier is accepted.
 */
async function verifyUiImplementation(assetsRoot: string): Promise<void> {
  needUi(isAbsolute(assetsRoot) && await realpath(assetsRoot) === assetsRoot);
  const path = join(assetsRoot, uiImplementation.relativePath);
  const before = await lstat(path, { bigint: true });
  needUi(before.isFile() && !before.isSymbolicLink() && before.size > 0n && before.size <= 128n * 1024n * 1024n && await realpath(path) === path);
  // oxlint-disable-next-line eslint/no-bitwise -- Refuse a substituted installed UI bundle symlink.
  const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const hash = createHash("sha256");
    let consumed = 0n;
    for await (const chunk of file.createReadStream({ autoClose: false })) {
      needUi(Buffer.isBuffer(chunk)); consumed += BigInt(chunk.length);
      needUi(consumed <= before.size && consumed <= 128n * 1024n * 1024n); hash.update(chunk);
    }
    const after = await file.stat({ bigint: true }), named = await lstat(path, { bigint: true });
    needUi(consumed === before.size && before.dev === after.dev && before.ino === after.ino && before.size === after.size &&
      before.mtimeNs === after.mtimeNs && before.ctimeNs === after.ctimeNs && after.dev === named.dev && after.ino === named.ino &&
      after.size === named.size && after.mtimeNs === named.mtimeNs && after.ctimeNs === named.ctimeNs &&
      named.isFile() && !named.isSymbolicLink() && await realpath(path) === path && hash.digest("hex") === uiImplementation.sha256);
  } finally { await file.close(); }
}

/** Use the existing serialized authenticated bridge owner. The result observes
 * registered shell entries, never a complete CAD or startup lifecycle.
 */
export async function readEditorShell(engine: EditorShellEngine, requestInput: unknown,
  expectedFingerprint: Record<string, unknown>): Promise<Record<string, unknown>> {
  const request = parseEditorShellRequest(requestInput);
  const expected = structuredClone(expectedFingerprint);
  validateSdkLocalRuntimeFingerprint(expected);
  await engine.assertBridgeDispatchAllowed();
  const initialStatus = await engine.status();
  const initial = structuredClone(initialStatus.stableFingerprint);
  validateSdkLocalRuntimeFingerprint(initial); assertExpectedFingerprint(initial);
  assertSubset(initial, expected, "Editor-shell expected runtime");
  await verifyUiImplementation(initial.installedBundles.assetsRoot);
  await engine.assertBridgeDispatchAllowed();
  const raw = await engine.upstream.callTool("easyeda_execute", {
    code: buildEditorShellProgram(request), timeoutMs: 60_000, confirmWrite: true,
  }, 70_000);
  assertUpstreamReplySettled(raw);
  const envelope = extractToolPayload(raw);
  if (Buffer.byteLength(JSON.stringify(envelope), "utf8") > EDITOR_SHELL_MAX_BYTES) { throw new Error("Editor-shell reply exceeds its byte bound."); }
  const result = validateEditorShellResult(request, decodeExactReadEnvelope(envelope));
  await verifyUiImplementation(initial.installedBundles.assetsRoot);
  await engine.assertBridgeDispatchAllowed();
  const finalStatus = await engine.status();
  const finalFingerprint = finalStatus.stableFingerprint;
  validateSdkLocalRuntimeFingerprint(finalFingerprint);
  if (canonicalJson(finalFingerprint) !== canonicalJson(initial)) { throw new Error("Editor-shell runtime changed around the observation."); }
  const response = { ...result, runtimeAdmission: {
    profile: EDITOR_SHELL_RUNTIME_PROFILE.schema, fingerprintSha256: sha256Json(initial), uiImplementation,
    beforeAndAfterChecked: true, scope: "registered-editor-shell-only", startupQualified: false,
    cadAuthority: false, persistenceVerified: false, liveValidation: "not-recorded",
  } };
  if (Buffer.byteLength(JSON.stringify(response), "utf8") > EDITOR_SHELL_MAX_BYTES) { throw new Error("Editor-shell result exceeds its byte bound."); }
  return response;
}
