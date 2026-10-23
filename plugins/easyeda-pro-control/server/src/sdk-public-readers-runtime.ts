import { assertSubset, assertUpstreamReplySettled, canonicalJson, extractToolPayload, sha256Json } from "./core.ts";
import { decodeExactReadEnvelope } from "./exact-readers.ts";
import type { SdkLocalEngine } from "./sdk-local-runtime.ts";
import { SDK_PUBLIC_READERS_MAX_BYTES, buildSdkPublicReadersProgram, parseSdkPublicReadersRequest, validateSdkPublicReadersResult } from "./sdk-public-readers.ts";
import { SDK_PUBLIC_UTILITIES_209_PROFILE, selectSdkPublicUtilitiesRuntimeProfile } from "./sdk-public-utilities-profile.ts";

export type SdkPublicReadersEngine = SdkLocalEngine;

/** Common identity checks do not expand this scope to the selector's older
 * 206 branch. These reader closures were reviewed only in installed API0.3.59.
 */
export function validateSdkPublicReadersFingerprint(fingerprint: unknown): true {
  if (selectSdkPublicUtilitiesRuntimeProfile(fingerprint) !== SDK_PUBLIC_UTILITIES_209_PROFILE) {
    throw new Error("Public readers require the reviewed EasyEDA 3.2.209 runtime.");
  }
  return true;
}

/** The registered callback must supply its existing serialized bridge owner.
 * One fixed execution contains both samples; this function never launches or
 * creates a new client, substitutes a fingerprint, or retries a failed read.
 */
export async function readSdkPublicReaders(engine: SdkPublicReadersEngine, requestInput: unknown,
  expectedFingerprint: Record<string, unknown>): Promise<Record<string, unknown>> {
  const expected = structuredClone(expectedFingerprint), request = parseSdkPublicReadersRequest(requestInput);
  validateSdkPublicReadersFingerprint(expected);
  await engine.assertBridgeDispatchAllowed();
  const initialStatus = await engine.status();
  const initial = structuredClone(initialStatus.stableFingerprint);
  validateSdkPublicReadersFingerprint(initial);
  assertSubset(initial, expected, "SDK public readers expected runtime");
  await engine.assertBridgeDispatchAllowed();
  const raw = await engine.upstream.callTool("easyeda_execute", {
    code: buildSdkPublicReadersProgram(request), timeoutMs: 60_000, confirmWrite: true,
  }, 70_000);
  assertUpstreamReplySettled(raw);
  const envelope = extractToolPayload(raw);
  if (Buffer.byteLength(JSON.stringify(envelope), "utf8") > SDK_PUBLIC_READERS_MAX_BYTES) {
    throw new Error("SDK public readers reply exceeds its byte bound.");
  }
  const result = validateSdkPublicReadersResult(request, decodeExactReadEnvelope(envelope));
  await engine.assertBridgeDispatchAllowed();
  const finalStatus = await engine.status();
  const finalFingerprint = finalStatus.stableFingerprint;
  validateSdkPublicReadersFingerprint(finalFingerprint);
  if (canonicalJson(finalFingerprint) !== canonicalJson(initial)) {
    throw new Error("SDK public readers runtime changed around the read.");
  }
  const response = { ...result, runtimeAdmission: {
    profile: SDK_PUBLIC_UTILITIES_209_PROFILE.schema, fingerprintSha256: sha256Json(initial),
    beforeAndAfterChecked: true, scope: "fixed-language-catalog-or-extension-page-viewport", liveValidation: "not-recorded",
  } };
  if (Buffer.byteLength(JSON.stringify(response), "utf8") > SDK_PUBLIC_READERS_MAX_BYTES) {
    throw new Error("SDK public readers result exceeds its byte bound.");
  }
  return response;
}
