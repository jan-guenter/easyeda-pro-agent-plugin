import { assertExpectedFingerprint, assertSubset, assertUpstreamReplySettled, canonicalJson, extractToolPayload, sha256Json } from "./core.ts";
import { CURRENT_UI_IMPLEMENTATION as uiImplementation, verifyCurrentUiImplementation } from "./current-ui-implementation.ts";
import { EDITOR_CONTEXT_MAX_BYTES, buildEditorContextProgram, parseEditorContextRequest, validateEditorContextResult } from "./editor-context.ts";
import { EDITOR_OBSERVATION_209_PROVENANCE, EDITOR_OBSERVATION_209_UI, verifyEditorObservation209Ui } from "./editor-observation209-profile.ts";
import { EDITOR_SHELL_MAX_BYTES, buildEditorShellProgram, parseEditorShellRequest, validateEditorShellResult } from "./editor-shell.ts";
import { decodeExactReadEnvelope } from "./exact-readers.ts";
import { SDK_LOCAL_RUNTIME_PROFILE } from "./sdk-local-runtime.ts";
import type { SdkLocalEngine } from "./sdk-local-runtime.ts";
import { SDK_PUBLIC_UTILITIES_209_PROFILE, selectSdkPublicUtilitiesRuntimeProfile } from "./sdk-public-utilities-profile.ts";

export const EDITOR_SHELL_RUNTIME_PROFILE = Object.freeze({ ...SDK_LOCAL_RUNTIME_PROFILE,
  schema: "easyeda-pro-control.editor-shell-runtime.v1", uiImplementation });
export const EDITOR_CONTEXT_RUNTIME_PROFILE = Object.freeze({ ...SDK_LOCAL_RUNTIME_PROFILE,
  schema: "easyeda-pro-control.editor-context-runtime.v1", uiImplementation });
export const EDITOR_SHELL_209_RUNTIME_PROFILE = Object.freeze({ ...SDK_PUBLIC_UTILITIES_209_PROFILE,
  schema: "easyeda-pro-control.editor-shell-runtime-209.v1", uiImplementation: EDITOR_OBSERVATION_209_UI });
export const EDITOR_CONTEXT_209_RUNTIME_PROFILE = Object.freeze({ ...SDK_PUBLIC_UTILITIES_209_PROFILE,
  schema: "easyeda-pro-control.editor-context-runtime-209.v1", uiImplementation: EDITOR_OBSERVATION_209_UI });
export type EditorShellEngine = SdkLocalEngine;
export type EditorContextEngine = SdkLocalEngine;

/** Only the two fixed public wrappers select a mode. No caller code, callback,
 * verifier or runtime profile can enter the shared observer coordinator.
 */
async function readEditorObservation(engine: SdkLocalEngine, requestInput: unknown,
  expectedFingerprint: Record<string, unknown>, mode: "shell" | "context"): Promise<Record<string, unknown>> {
  const context = mode === "context";
  const request = context ? parseEditorContextRequest(requestInput) : parseEditorShellRequest(requestInput);
  const label = context ? "Editor-context" : "Editor-shell";
  const maxBytes = context ? EDITOR_CONTEXT_MAX_BYTES : EDITOR_SHELL_MAX_BYTES;
  const expected = structuredClone(expectedFingerprint);
  const generation209 = selectSdkPublicUtilitiesRuntimeProfile(expected) === SDK_PUBLIC_UTILITIES_209_PROFILE;
  const contextProfile = generation209 ? EDITOR_CONTEXT_209_RUNTIME_PROFILE : EDITOR_CONTEXT_RUNTIME_PROFILE;
  const shellProfile = generation209 ? EDITOR_SHELL_209_RUNTIME_PROFILE : EDITOR_SHELL_RUNTIME_PROFILE;
  const profile = context ? contextProfile : shellProfile;
  const verifyUi = generation209 ? verifyEditorObservation209Ui : verifyCurrentUiImplementation;
  await engine.assertBridgeDispatchAllowed();
  const initialStatus = await engine.status();
  const initial = structuredClone(initialStatus.stableFingerprint);
  selectSdkPublicUtilitiesRuntimeProfile(initial); assertExpectedFingerprint(initial);
  assertSubset(initial, expected, `${label} expected runtime`);
  await verifyUi(initial.installedBundles.assetsRoot);
  await engine.assertBridgeDispatchAllowed();
  const raw = await engine.upstream.callTool("easyeda_execute", {
    code: context ? buildEditorContextProgram(request) : buildEditorShellProgram(request), timeoutMs: 60_000, confirmWrite: true,
  }, 70_000);
  assertUpstreamReplySettled(raw);
  const envelope = extractToolPayload(raw);
  if (Buffer.byteLength(JSON.stringify(envelope), "utf8") > maxBytes) { throw new Error(`${label} reply exceeds its byte bound.`); }
  const decoded = decodeExactReadEnvelope(envelope);
  const result = context ? validateEditorContextResult(request, decoded) : validateEditorShellResult(request, decoded);
  await verifyUi(initial.installedBundles.assetsRoot);
  await engine.assertBridgeDispatchAllowed();
  const finalStatus = await engine.status();
  const finalFingerprint = finalStatus.stableFingerprint;
  selectSdkPublicUtilitiesRuntimeProfile(finalFingerprint);
  if (canonicalJson(finalFingerprint) !== canonicalJson(initial)) { throw new Error(`${label} runtime changed around the observation.`); }
  const response = { ...result, ...(generation209 ? EDITOR_OBSERVATION_209_PROVENANCE : {}), runtimeAdmission: {
    profile: profile.schema, fingerprintSha256: sha256Json(initial), uiImplementation: profile.uiImplementation,
    beforeAndAfterChecked: true, scope: context ? "registered-editor-context-only" : "registered-editor-shell-only", startupQualified: false,
    cadAuthority: false, persistenceVerified: false, liveValidation: "not-recorded",
  } };
  if (Buffer.byteLength(JSON.stringify(response), "utf8") > maxBytes) { throw new Error(`${label} result exceeds its byte bound.`); }
  return response;
}

/** Registered shell entries only, never a complete CAD or startup lifecycle. */
export function readEditorShell(engine: EditorShellEngine, requestInput: unknown,
  expectedFingerprint: Record<string, unknown>): Promise<Record<string, unknown>> {
  return readEditorObservation(engine, requestInput, expectedFingerprint, "shell");
}

/** Registered UI identity only, never legacy context or design admission. */
export function readEditorContext(engine: EditorContextEngine, requestInput: unknown,
  expectedFingerprint: Record<string, unknown>): Promise<Record<string, unknown>> {
  return readEditorObservation(engine, requestInput, expectedFingerprint, "context");
}
