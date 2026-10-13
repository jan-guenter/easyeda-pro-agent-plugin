import {
  assertSubset,
  assertUpstreamReplySettled,
  canonicalJson,
  extractToolPayload,
  sha256Json,
} from "./core.ts";
import { decodeExactReadEnvelope } from "./exact-readers.ts";
import { SDK_LOCAL_RUNTIME_PROFILE, validateSdkLocalRuntimeFingerprint } from "./sdk-local-runtime.ts";
import type { SdkLocalEngine } from "./sdk-local-runtime.ts";
import {
  SDK_SYSTEM_MAX_BYTES,
  buildSdkSystemProgram,
  parseSdkSystemRequest,
  validateSdkSystemResult,
} from "./sdk-system.ts";

/** Only fixed reviewed local getters and supplied-value conversions. This does
 * not enable editor context reads, project access, settings or navigation.
 */
export const SDK_SYSTEM_RUNTIME_PROFILE = {
  ...SDK_LOCAL_RUNTIME_PROFILE,
  schema: "easyeda-pro-control.sdk-system-runtime.v1",
} as const;

export type SdkSystemEngine = SdkLocalEngine;

/** Use the existing serialized authenticated owner, with no replacement client
 * or launch authority. One execute carries both synchronous adapter samples.
 */
export async function readSdkSystem(engine: SdkSystemEngine, requestInput: unknown,
  expectedFingerprint: Record<string, unknown>): Promise<Record<string, unknown>> {
  const request = parseSdkSystemRequest(requestInput);
  const expected = structuredClone(expectedFingerprint);
  validateSdkLocalRuntimeFingerprint(expected);
  await engine.assertBridgeDispatchAllowed();
  const initialStatus = await engine.status();
  const initial = structuredClone(initialStatus.stableFingerprint);
  validateSdkLocalRuntimeFingerprint(initial);
  assertSubset(initial, expected, "SDK system expected runtime");
  await engine.assertBridgeDispatchAllowed();
  const raw = await engine.upstream.callTool("easyeda_execute", {
    code: buildSdkSystemProgram(request), timeoutMs: 60_000, confirmWrite: true,
  }, 70_000);
  assertUpstreamReplySettled(raw);
  const envelope = extractToolPayload(raw);
  if (Buffer.byteLength(JSON.stringify(envelope), "utf8") > SDK_SYSTEM_MAX_BYTES) {
    throw new Error("SDK system reply exceeds its byte bound.");
  }
  const result = validateSdkSystemResult(request, decodeExactReadEnvelope(envelope));
  await engine.assertBridgeDispatchAllowed();
  const finalStatus = await engine.status();
  const finalFingerprint = finalStatus.stableFingerprint;
  validateSdkLocalRuntimeFingerprint(finalFingerprint);
  if (canonicalJson(finalFingerprint) !== canonicalJson(initial)) {
    throw new Error("SDK system runtime changed around the local operation.");
  }
  const response = { ...result, runtimeAdmission: {
    profile: SDK_SYSTEM_RUNTIME_PROFILE.schema,
    fingerprintSha256: sha256Json(initial),
    beforeAndAfterChecked: true,
    scope: "fixed-local-sdk-system",
    liveValidation: "not-recorded",
  } };
  if (Buffer.byteLength(JSON.stringify(response), "utf8") > SDK_SYSTEM_MAX_BYTES) {
    throw new Error("SDK system result exceeds its byte bound.");
  }
  return response;
}
