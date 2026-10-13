import { assertExpectedFingerprint, assertSubset, assertUpstreamReplySettled, canonicalJson, extractToolPayload, sha256Json } from "./core.ts";
import { CURRENT_UI_IMPLEMENTATION as uiImplementation, verifyCurrentUiImplementation } from "./current-ui-implementation.ts";
import { decodeExactReadEnvelope } from "./exact-readers.ts";
import { SDK_LOCAL_RUNTIME_PROFILE, validateSdkLocalRuntimeFingerprint } from "./sdk-local-runtime.ts";
import type { SdkLocalEngine } from "./sdk-local-runtime.ts";
import { SHORTCUT_KEYS_MAX_BYTES, buildShortcutKeysProgram, parseShortcutKeysRequest, validateShortcutKeysResult } from "./shortcut-keys.ts";

export const SHORTCUT_KEYS_RUNTIME_PROFILE = Object.freeze({ ...SDK_LOCAL_RUNTIME_PROFILE,
  schema: "easyeda-pro-control.shortcut-keys-runtime.v1", uiImplementation });
export type ShortcutKeysEngine = SdkLocalEngine;

/** One fixed public query through the serialized authenticated owner, with
 * current API/UI admission. This grants no legacy read or input authority.
 */
export async function readShortcutKeys(engine: ShortcutKeysEngine, requestInput: unknown,
  expectedFingerprint: Record<string, unknown>): Promise<Record<string, unknown>> {
  const request = parseShortcutKeysRequest(requestInput);
  const expected = structuredClone(expectedFingerprint);
  validateSdkLocalRuntimeFingerprint(expected);
  await engine.assertBridgeDispatchAllowed();
  const initialStatus = await engine.status();
  const initial = structuredClone(initialStatus.stableFingerprint);
  validateSdkLocalRuntimeFingerprint(initial); assertExpectedFingerprint(initial);
  assertSubset(initial, expected, "Shortcut query expected runtime");
  await verifyCurrentUiImplementation(initial.installedBundles.assetsRoot);
  await engine.assertBridgeDispatchAllowed();
  const raw = await engine.upstream.callTool("easyeda_execute", {
    code: buildShortcutKeysProgram(request), timeoutMs: 60_000, confirmWrite: true,
  }, 70_000);
  assertUpstreamReplySettled(raw);
  const envelope = extractToolPayload(raw);
  if (Buffer.byteLength(JSON.stringify(envelope), "utf8") > SHORTCUT_KEYS_MAX_BYTES) { throw new Error("Shortcut query reply exceeds its byte bound."); }
  const result = validateShortcutKeysResult(request, decodeExactReadEnvelope(envelope));
  await verifyCurrentUiImplementation(initial.installedBundles.assetsRoot);
  await engine.assertBridgeDispatchAllowed();
  const finalStatus = await engine.status();
  const finalFingerprint = finalStatus.stableFingerprint;
  validateSdkLocalRuntimeFingerprint(finalFingerprint);
  if (canonicalJson(finalFingerprint) !== canonicalJson(initial)) { throw new Error("Shortcut query runtime changed around the observation."); }
  const response = { ...result, runtimeAdmission: { profile: SHORTCUT_KEYS_RUNTIME_PROFILE.schema,
    fingerprintSha256: sha256Json(initial), uiImplementation, beforeAndAfterChecked: true,
    scope: "configured-shortcut-registry-only", keyboardExecutionAuthorized: false, cadAuthority: false,
    persistenceVerified: false, liveValidation: "not-recorded" } };
  if (Buffer.byteLength(JSON.stringify(response), "utf8") > SHORTCUT_KEYS_MAX_BYTES) { throw new Error("Shortcut query result exceeds its byte bound."); }
  return response;
}
