import { assertExpectedFingerprint, assertSubset, assertUpstreamReplySettled, canonicalJson, extractToolPayload, sha256Json } from "./core.ts";
import { CURRENT_UI_IMPLEMENTATION as uiImplementation, verifyCurrentUiImplementation } from "./current-ui-implementation.ts";
import { CURRENT_PCB_IDENTITIES_MAX_BYTES, parseCurrentPcbIdentitiesRequest, validateCurrentPcbIdentitiesResult } from "./current-pcb-identities.ts";
import { buildCurrentPcbIdentitiesProgram } from "./current-pcb-identities-program.ts";
import { decodeExactReadEnvelope } from "./exact-readers.ts";
import { SDK_LOCAL_RUNTIME_PROFILE, validateSdkLocalRuntimeFingerprint } from "./sdk-local-runtime.ts";
import type { SdkLocalEngine } from "./sdk-local-runtime.ts";

export const CURRENT_PCB_IDENTITIES_RUNTIME_PROFILE = Object.freeze({ ...SDK_LOCAL_RUNTIME_PROFILE,
  schema: "easyeda-pro-control.current-pcb-identities-runtime.v1", uiImplementation });

/** Current-version loaded-view identities only. Caller must retain the same
 * serialized authenticated execution boundary used by current layer reads.
 */
export async function readCurrentPcbIdentities(engine: SdkLocalEngine, requestInput: unknown,
  expectedFingerprint: Record<string, unknown>): Promise<Record<string, unknown>> {
  const request = parseCurrentPcbIdentitiesRequest(requestInput);
  const expected = structuredClone(expectedFingerprint);
  validateSdkLocalRuntimeFingerprint(expected);
  await engine.assertBridgeDispatchAllowed();
  const initialStatus = await engine.status();
  const initial = structuredClone(initialStatus.stableFingerprint);
  validateSdkLocalRuntimeFingerprint(initial); assertExpectedFingerprint(initial);
  assertSubset(initial, expected, "PCB identities expected runtime");
  await verifyCurrentUiImplementation(initial.installedBundles.assetsRoot);
  await engine.assertBridgeDispatchAllowed();
  const raw = await engine.upstream.callTool("easyeda_execute", {
    code: buildCurrentPcbIdentitiesProgram(request), timeoutMs: 60_000, confirmWrite: true,
  }, 70_000);
  assertUpstreamReplySettled(raw);
  const envelope = extractToolPayload(raw);
  if (Buffer.byteLength(JSON.stringify(envelope), "utf8") > CURRENT_PCB_IDENTITIES_MAX_BYTES) { throw new Error("PCB identities reply exceeds its byte bound."); }
  const result = validateCurrentPcbIdentitiesResult(request, decodeExactReadEnvelope(envelope));
  await verifyCurrentUiImplementation(initial.installedBundles.assetsRoot);
  await engine.assertBridgeDispatchAllowed();
  const finalStatus = await engine.status();
  const finalFingerprint = finalStatus.stableFingerprint;
  validateSdkLocalRuntimeFingerprint(finalFingerprint);
  if (canonicalJson(finalFingerprint) !== canonicalJson(initial)) { throw new Error("PCB identities runtime changed around the observation."); }
  const response = { ...result, observationSha256: sha256Json(result), runtimeAdmission: { profile: CURRENT_PCB_IDENTITIES_RUNTIME_PROFILE.schema,
    fingerprintSha256: sha256Json(initial), uiImplementation, beforeAndAfterChecked: true,
    scope: "explicit-current-pcb-loaded-view-identities-only", designExecutionAuthorized: false,
    persistenceVerified: false, liveValidation: "not-recorded" } };
  if (Buffer.byteLength(JSON.stringify(response), "utf8") > CURRENT_PCB_IDENTITIES_MAX_BYTES) { throw new Error("PCB identities result exceeds its byte bound."); }
  return response;
}
