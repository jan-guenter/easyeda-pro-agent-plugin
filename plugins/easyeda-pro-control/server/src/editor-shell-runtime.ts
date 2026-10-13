import { assertExpectedFingerprint, assertSubset, assertUpstreamReplySettled, canonicalJson, extractToolPayload, sha256Json } from "./core.ts";
import { CURRENT_UI_IMPLEMENTATION as uiImplementation, verifyCurrentUiImplementation } from "./current-ui-implementation.ts";
import { EDITOR_CONTEXT_MAX_BYTES, buildEditorContextProgram, parseEditorContextRequest, validateEditorContextResult } from "./editor-context.ts";
import { EDITOR_SHELL_MAX_BYTES, buildEditorShellProgram, parseEditorShellRequest, validateEditorShellResult } from "./editor-shell.ts";
import { decodeExactReadEnvelope } from "./exact-readers.ts";
import { SDK_LOCAL_RUNTIME_PROFILE, validateSdkLocalRuntimeFingerprint } from "./sdk-local-runtime.ts";
import type { SdkLocalEngine } from "./sdk-local-runtime.ts";

export const EDITOR_SHELL_RUNTIME_PROFILE = Object.freeze({ ...SDK_LOCAL_RUNTIME_PROFILE,
  schema: "easyeda-pro-control.editor-shell-runtime.v1", uiImplementation });
export const EDITOR_CONTEXT_RUNTIME_PROFILE = Object.freeze({ ...SDK_LOCAL_RUNTIME_PROFILE,
  schema: "easyeda-pro-control.editor-context-runtime.v1", uiImplementation });
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
  const profile = context ? EDITOR_CONTEXT_RUNTIME_PROFILE : EDITOR_SHELL_RUNTIME_PROFILE;
  const expected = structuredClone(expectedFingerprint);
  validateSdkLocalRuntimeFingerprint(expected);
  await engine.assertBridgeDispatchAllowed();
  const initialStatus = await engine.status();
  const initial = structuredClone(initialStatus.stableFingerprint);
  validateSdkLocalRuntimeFingerprint(initial); assertExpectedFingerprint(initial);
  assertSubset(initial, expected, `${label} expected runtime`);
  await verifyCurrentUiImplementation(initial.installedBundles.assetsRoot);
  await engine.assertBridgeDispatchAllowed();
  const raw = await engine.upstream.callTool("easyeda_execute", {
    code: context ? buildEditorContextProgram(request) : buildEditorShellProgram(request), timeoutMs: 60_000, confirmWrite: true,
  }, 70_000);
  assertUpstreamReplySettled(raw);
  const envelope = extractToolPayload(raw);
  if (Buffer.byteLength(JSON.stringify(envelope), "utf8") > maxBytes) { throw new Error(`${label} reply exceeds its byte bound.`); }
  const decoded = decodeExactReadEnvelope(envelope);
  const result = context ? validateEditorContextResult(request, decoded) : validateEditorShellResult(request, decoded);
  await verifyCurrentUiImplementation(initial.installedBundles.assetsRoot);
  await engine.assertBridgeDispatchAllowed();
  const finalStatus = await engine.status();
  const finalFingerprint = finalStatus.stableFingerprint;
  validateSdkLocalRuntimeFingerprint(finalFingerprint);
  if (canonicalJson(finalFingerprint) !== canonicalJson(initial)) { throw new Error(`${label} runtime changed around the observation.`); }
  const response = { ...result, runtimeAdmission: {
    profile: profile.schema, fingerprintSha256: sha256Json(initial), uiImplementation,
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
