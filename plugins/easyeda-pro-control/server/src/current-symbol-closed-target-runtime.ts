import { assertExpectedFingerprint, assertSubset, assertUpstreamReplySettled, canonicalJson, extractToolPayload, sha256Json } from "./core.ts";
import { verifyCurrentDisposableOpenImplementation } from "./current-disposable-open-profile.ts";
import { validateCurrentClosedSymbolMetadataResult } from "./current-symbol-closed-target.ts";
import type { CurrentClosedSymbolMetadataResult } from "./current-symbol-closed-target.ts";
import { CURRENT_SYMBOL_METADATA_MAX_BYTES, parseCurrentSymbolMetadataRequest } from "./current-symbol-metadata.ts";
import { buildCurrentClosedSymbolMetadataProgram } from "./current-symbol-metadata-program.ts";
import { decodeExactReadEnvelope } from "./exact-readers.ts";
import { validateSdkLocalRuntimeFingerprint } from "./sdk-local-runtime.ts";
import type { SdkLocalEngine } from "./sdk-local-runtime.ts";

export interface CurrentClosedSymbolMetadataWitness {
  readonly observation: CurrentClosedSymbolMetadataResult;
  readonly observationSha256: string;
  readonly runtimeFingerprintSha256: string;
  readonly sourceImplementationVerified: true;
  readonly executionAuthorized: false;
}

/** Internal collector. Its owner must retain/recheck the original authenticated
 * scope and generation around this call. No scope is allocated or recovered.
 */
export async function readCurrentClosedSymbolMetadata(engine: SdkLocalEngine, requestInput: unknown,
  expectedFingerprint: Record<string, unknown>): Promise<CurrentClosedSymbolMetadataWitness> {
  const expected = structuredClone(expectedFingerprint), request = parseCurrentSymbolMetadataRequest(requestInput);
  validateSdkLocalRuntimeFingerprint(expected);
  await engine.assertBridgeDispatchAllowed();
  const initialStatus = await engine.status();
  const initial = structuredClone(initialStatus.stableFingerprint);
  validateSdkLocalRuntimeFingerprint(initial); assertExpectedFingerprint(initial);
  assertSubset(initial, expected, "Current closed-symbol witness runtime");
  await verifyCurrentDisposableOpenImplementation(initial.installedBundles.assetsRoot);
  await engine.assertBridgeDispatchAllowed();
  const raw = await engine.upstream.callTool("easyeda_execute", {
    code: buildCurrentClosedSymbolMetadataProgram(request), timeoutMs: 60_000, confirmWrite: true,
  }, 70_000);
  assertUpstreamReplySettled(raw);
  const envelope = extractToolPayload(raw);
  if (Buffer.byteLength(JSON.stringify(envelope), "utf8") > CURRENT_SYMBOL_METADATA_MAX_BYTES) {
    throw new Error("Current closed-symbol witness reply exceeds its byte bound.");
  }
  const observation = validateCurrentClosedSymbolMetadataResult(request, decodeExactReadEnvelope(envelope));
  await verifyCurrentDisposableOpenImplementation(initial.installedBundles.assetsRoot);
  await engine.assertBridgeDispatchAllowed();
  const finalStatus = await engine.status();
  const final = finalStatus.stableFingerprint;
  validateSdkLocalRuntimeFingerprint(final);
  if (canonicalJson(final) !== canonicalJson(initial)) { throw new Error("Current closed-symbol witness runtime changed around the observation."); }
  return { observation, observationSha256: sha256Json(observation), runtimeFingerprintSha256: sha256Json(initial),
    sourceImplementationVerified: true, executionAuthorized: false };
}
