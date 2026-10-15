import { assertExpectedFingerprint, assertSubset, assertUpstreamReplySettled, canonicalJson, extractToolPayload, sha256Json } from "./core.ts";
import { CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION, verifyCurrentDisposableOpenImplementation } from "./current-disposable-open-profile.ts";
import { CURRENT_SYMBOL_METADATA_MAX_BYTES, parseCurrentSymbolMetadataRequest, validateCurrentSymbolMetadataResult } from "./current-symbol-metadata.ts";
import { buildCurrentSymbolMetadataProgram } from "./current-symbol-metadata-program.ts";
import { decodeExactReadEnvelope } from "./exact-readers.ts";
import { SDK_LOCAL_RUNTIME_PROFILE, validateSdkLocalRuntimeFingerprint } from "./sdk-local-runtime.ts";
import type { SdkLocalEngine } from "./sdk-local-runtime.ts";

export const CURRENT_SYMBOL_METADATA_RUNTIME_PROFILE = Object.freeze({ ...SDK_LOCAL_RUNTIME_PROFILE,
  schema: "easyeda-pro-control.current-symbol-metadata-runtime.v1",
  implementation: CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION });

/** Project-local metadata only. The shared installation verifier pins the
 * manager/worker/app closure; reusing it does not authorize project opening.
 */
export async function readCurrentSymbolMetadata(engine: SdkLocalEngine, requestInput: unknown,
  expectedFingerprint: Record<string, unknown>): Promise<Record<string, unknown>> {
  const request = parseCurrentSymbolMetadataRequest(requestInput);
  const expected = structuredClone(expectedFingerprint);
  validateSdkLocalRuntimeFingerprint(expected);
  await engine.assertBridgeDispatchAllowed();
  const initialStatus = await engine.status();
  const initial = structuredClone(initialStatus.stableFingerprint);
  validateSdkLocalRuntimeFingerprint(initial); assertExpectedFingerprint(initial);
  assertSubset(initial, expected, "Project symbol metadata expected runtime");
  await verifyCurrentDisposableOpenImplementation(initial.installedBundles.assetsRoot);
  await engine.assertBridgeDispatchAllowed();
  const raw = await engine.upstream.callTool("easyeda_execute", {
    code: buildCurrentSymbolMetadataProgram(request), timeoutMs: 60_000, confirmWrite: true,
  }, 70_000);
  assertUpstreamReplySettled(raw);
  const envelope = extractToolPayload(raw);
  if (Buffer.byteLength(JSON.stringify(envelope), "utf8") > CURRENT_SYMBOL_METADATA_MAX_BYTES) {
    throw new Error("Project symbol metadata reply exceeds its byte bound.");
  }
  const result = validateCurrentSymbolMetadataResult(request, decodeExactReadEnvelope(envelope));
  await verifyCurrentDisposableOpenImplementation(initial.installedBundles.assetsRoot);
  await engine.assertBridgeDispatchAllowed();
  const finalStatus = await engine.status();
  const finalFingerprint = finalStatus.stableFingerprint;
  validateSdkLocalRuntimeFingerprint(finalFingerprint);
  if (canonicalJson(finalFingerprint) !== canonicalJson(initial)) { throw new Error("Project symbol metadata runtime changed around the observation."); }
  const response = { ...result, observationSha256: sha256Json(result), runtimeAdmission: {
    profile: CURRENT_SYMBOL_METADATA_RUNTIME_PROFILE.schema, fingerprintSha256: sha256Json(initial),
    implementation: CURRENT_DISPOSABLE_OPEN_IMPLEMENTATION, beforeAndAfterChecked: true,
    scope: "explicit-project-local-symbol-metadata-only", designExecutionAuthorized: false,
    persistenceVerified: false, liveValidation: "not-recorded" } };
  if (Buffer.byteLength(JSON.stringify(response), "utf8") > CURRENT_SYMBOL_METADATA_MAX_BYTES) {
    throw new Error("Project symbol metadata result exceeds its byte bound.");
  }
  return response;
}
