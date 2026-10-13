import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { lstat, open, realpath } from "node:fs/promises";
import { isAbsolute, join } from "node:path";
import { assertExpectedFingerprint, assertSubset, assertUpstreamReplySettled, canonicalJson, extractToolPayload, sha256Json } from "./core.ts";
import { decodeExactReadEnvelope } from "./exact-readers.ts";
import { SDK_LOCAL_RUNTIME_PROFILE, validateSdkLocalRuntimeFingerprint } from "./sdk-local-runtime.ts";
import type { SdkLocalEngine } from "./sdk-local-runtime.ts";
import {
  STARTUP_EXTENSIONS_MAX_BYTES,
  STARTUP_EXTENSIONS_UI_SHA256,
  STARTUP_EXTENSIONS_UI_VERSION,
  buildStartupExtensionsProgram,
  parseStartupExtensionsRequest,
  validateStartupExtensionsResult,
} from "./startup-extensions.ts";

const uiImplementation = Object.freeze({
  version: STARTUP_EXTENSIONS_UI_VERSION,
  relativePath: `pro-ui/${STARTUP_EXTENSIONS_UI_VERSION}/js/ui.js`,
  sha256: STARTUP_EXTENSIONS_UI_SHA256,
});

/** Observed initialized extension index only. This profile neither binds the
 * database actor nor qualifies launch, built-ins or queued activations.
 */
export const STARTUP_EXTENSIONS_RUNTIME_PROFILE = Object.freeze({
  ...SDK_LOCAL_RUNTIME_PROFILE,
  schema: "easyeda-pro-control.startup-extensions-runtime.v1",
  uiImplementation,
});

export type StartupExtensionsEngine = SdkLocalEngine;

function needUi(value: boolean): asserts value {
  if (!value) { throw new Error("Startup extension-index UI implementation differs from its reviewed profile."); }
}

/** The root comes only from the fresh admitted fingerprint. Keep the bounded
 * descriptor/stream identity checks used by maintained native-profile readers;
 * no configurable file selector, pin or verifier is accepted by this route.
 */
async function verifyUiImplementation(assetsRoot: string): Promise<void> {
  needUi(isAbsolute(assetsRoot) && await realpath(assetsRoot) === assetsRoot);
  const path = join(assetsRoot, uiImplementation.relativePath);
  const before = await lstat(path, { bigint: true });
  needUi(before.isFile() && !before.isSymbolicLink() && before.size > 0n && before.size <= 128n * 1024n * 1024n && await realpath(path) === path);
  // oxlint-disable-next-line eslint/no-bitwise -- Never follow a substituted installed UI bundle symlink.
  const file = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const hash = createHash("sha256");
    let consumed = 0n;
    for await (const chunk of file.createReadStream({ autoClose: false })) {
      needUi(Buffer.isBuffer(chunk));
      consumed += BigInt(chunk.length);
      needUi(consumed <= before.size && consumed <= 128n * 1024n * 1024n);
      hash.update(chunk);
    }
    const after = await file.stat({ bigint: true }), named = await lstat(path, { bigint: true });
    needUi(consumed === before.size && before.dev === after.dev && before.ino === after.ino && before.size === after.size &&
      before.mtimeNs === after.mtimeNs && before.ctimeNs === after.ctimeNs && after.dev === named.dev && after.ino === named.ino &&
      after.size === named.size && after.mtimeNs === named.mtimeNs && after.ctimeNs === named.ctimeNs &&
      named.isFile() && !named.isSymbolicLink() && await realpath(path) === path && hash.digest("hex") === uiImplementation.sha256);
  } finally { await file.close(); }
}

/** The caller supplies the existing serialized authenticated bridge owner.
 * One fixed execute performs the adapter's stable-actor index samples. That
 * does not prove the database switched actors. No new owner, launcher, private
 * user selector or old design admission is created.
 */
export async function readStartupExtensions(engine: StartupExtensionsEngine, requestInput: unknown,
  expectedFingerprint: Record<string, unknown>): Promise<Record<string, unknown>> {
  const request = parseStartupExtensionsRequest(requestInput);
  const expected = structuredClone(expectedFingerprint);
  validateSdkLocalRuntimeFingerprint(expected);
  await engine.assertBridgeDispatchAllowed();
  const initialStatus = await engine.status();
  const initial = structuredClone(initialStatus.stableFingerprint);
  validateSdkLocalRuntimeFingerprint(initial);
  assertExpectedFingerprint(initial);
  assertSubset(initial, expected, "Startup extension-index expected runtime");
  await verifyUiImplementation(initial.installedBundles.assetsRoot);
  await engine.assertBridgeDispatchAllowed();
  const raw = await engine.upstream.callTool("easyeda_execute", {
    code: buildStartupExtensionsProgram(request), timeoutMs: 60_000, confirmWrite: true,
  }, 70_000);
  assertUpstreamReplySettled(raw);
  const envelope = extractToolPayload(raw);
  if (Buffer.byteLength(JSON.stringify(envelope), "utf8") > STARTUP_EXTENSIONS_MAX_BYTES) {
    throw new Error("Startup extension-index reply exceeds its byte bound.");
  }
  const result = validateStartupExtensionsResult(request, decodeExactReadEnvelope(envelope));
  await verifyUiImplementation(initial.installedBundles.assetsRoot);
  await engine.assertBridgeDispatchAllowed();
  const finalStatus = await engine.status();
  const finalFingerprint = finalStatus.stableFingerprint;
  validateSdkLocalRuntimeFingerprint(finalFingerprint);
  if (canonicalJson(finalFingerprint) !== canonicalJson(initial)) {
    throw new Error("Startup extension-index runtime changed around the observation.");
  }
  const response = { ...result, runtimeAdmission: {
    profile: STARTUP_EXTENSIONS_RUNTIME_PROFILE.schema,
    fingerprintSha256: sha256Json(initial),
    uiImplementation,
    beforeAndAfterChecked: true,
    scope: "observed-initialized-extension-index-only",
    databaseActorBound: false,
    startupQualified: false,
    launcherQualified: false,
    builtInsIncluded: false,
    queuedActivationsIncluded: false,
    liveValidation: "not-recorded",
  } };
  if (Buffer.byteLength(JSON.stringify(response), "utf8") > STARTUP_EXTENSIONS_MAX_BYTES) {
    throw new Error("Startup extension-index result exceeds its byte bound.");
  }
  return response;
}
