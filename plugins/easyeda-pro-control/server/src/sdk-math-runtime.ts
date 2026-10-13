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
  SDK_MATH_MAX_BYTES,
  buildSdkMathProgram,
  parseSdkMathRequest,
  validateSdkMathResult,
} from "./sdk-math.ts";

/** Admission of this tuple is exclusively for the fixed sys_Math programs.
 * PCB bytes identify the installation; no PCB operation or semantic parity is
 * admitted. The legacy private manifest and every native profile stay intact.
 */
export const SDK_MATH_RUNTIME_PROFILE = {
  ...SDK_LOCAL_RUNTIME_PROFILE,
  schema: "easyeda-pro-control.sdk-math-runtime.v1",
} as const;

export type SdkMathEngine = SdkLocalEngine;

/** Keep all common manifest trust fields. Only the explicitly named math tuple
 * replaces the legacy app/bundle fields in this separate scope; never feed a
 * normalized or forged fingerprint into validatePrivateFingerprint.
 */
export function validateSdkMathFingerprint(fingerprint: unknown): true {
  return validateSdkLocalRuntimeFingerprint(fingerprint);
}

/** The registered caller supplies the existing serialized authenticated bridge
 * scope. No client, renderer owner, launch authority or context is constructed.
 * One fixed execute contains the adapter's two synchronous input-only samples.
 */
export async function calculateSdkMath(engine: SdkMathEngine, requestInput: unknown,
  expectedFingerprint: Record<string, unknown>): Promise<Record<string, unknown>> {
  const request = parseSdkMathRequest(requestInput);
  const expected = structuredClone(expectedFingerprint);
  validateSdkMathFingerprint(expected);
  await engine.assertBridgeDispatchAllowed();
  const initialStatus = await engine.status();
  const initial = structuredClone(initialStatus.stableFingerprint);
  validateSdkMathFingerprint(initial);
  assertSubset(initial, expected, "SDK math expected runtime");
  await engine.assertBridgeDispatchAllowed();
  const raw = await engine.upstream.callTool("easyeda_execute", {
    code: buildSdkMathProgram(request), timeoutMs: 60_000, confirmWrite: true,
  }, 70_000);
  assertUpstreamReplySettled(raw);
  const envelope = extractToolPayload(raw);
  // The generic exact envelope permits larger document snapshots. Calculations
  // Deliberately impose their smaller bound before decoding nested JSON.
  if (Buffer.byteLength(JSON.stringify(envelope), "utf8") > SDK_MATH_MAX_BYTES) {
    throw new Error("SDK math reply exceeds its byte bound.");
  }
  const result = validateSdkMathResult(request, decodeExactReadEnvelope(envelope));
  await engine.assertBridgeDispatchAllowed();
  const finalStatus = await engine.status();
  const finalFingerprint = finalStatus.stableFingerprint;
  validateSdkMathFingerprint(finalFingerprint);
  if (canonicalJson(finalFingerprint) !== canonicalJson(initial)) {
    throw new Error("SDK math runtime changed around the calculation.");
  }
  const response = { ...result, runtimeAdmission: {
    profile: SDK_MATH_RUNTIME_PROFILE.schema,
    fingerprintSha256: sha256Json(initial),
    beforeAndAfterChecked: true,
    scope: "fixed-input-only-sdk-math",
    liveValidation: "not-recorded",
  } };
  if (Buffer.byteLength(JSON.stringify(response), "utf8") > SDK_MATH_MAX_BYTES) {
    throw new Error("SDK math result exceeds its byte bound.");
  }
  return response;
}
