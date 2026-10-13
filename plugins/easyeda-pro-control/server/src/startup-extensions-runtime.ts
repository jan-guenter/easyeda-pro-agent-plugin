import { assertExpectedFingerprint, assertSubset, assertUpstreamReplySettled, canonicalJson, extractToolPayload, sha256Json } from "./core.ts";
import { CURRENT_UI_IMPLEMENTATION as uiImplementation, verifyCurrentUiImplementation } from "./current-ui-implementation.ts";
import { decodeExactReadEnvelope } from "./exact-readers.ts";
import { SDK_LOCAL_RUNTIME_PROFILE, validateSdkLocalRuntimeFingerprint } from "./sdk-local-runtime.ts";
import type { SdkLocalEngine } from "./sdk-local-runtime.ts";
import {
  STARTUP_EXTENSIONS_MAX_BYTES,
  buildStartupExtensionsProgram,
  parseStartupExtensionsRequest,
  validateStartupExtensionsResult,
} from "./startup-extensions.ts";

/** Observed initialized extension index only. This profile neither binds the
 * database actor nor qualifies launch, built-ins or queued activations.
 */
export const STARTUP_EXTENSIONS_RUNTIME_PROFILE = Object.freeze({
  ...SDK_LOCAL_RUNTIME_PROFILE,
  schema: "easyeda-pro-control.startup-extensions-runtime.v1",
  uiImplementation,
});

export type StartupExtensionsEngine = SdkLocalEngine;

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
  await verifyCurrentUiImplementation(initial.installedBundles.assetsRoot);
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
  await verifyCurrentUiImplementation(initial.installedBundles.assetsRoot);
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
