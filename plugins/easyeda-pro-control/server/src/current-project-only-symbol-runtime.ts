import { assertExpectedFingerprint, assertSubset, canonicalJson, sha256Json } from "./core.ts";
import { verifyCurrentProjectOnlySymbolPreflightImplementation } from "./current-disposable-open-profile.ts";
import { CURRENT_PROJECT_ONLY_SYMBOL_PREFLIGHT_MAX_BYTES, CURRENT_PROJECT_ONLY_SYMBOL_PREFLIGHT_TIMEOUT_MS,
  buildCurrentProjectOnlySymbolPreflightProgram, currentProjectOnlySymbolPreflightRequestSchema,
  decodeCurrentProjectOnlySymbolPreflightReply } from "./current-project-only-symbol-preflight.ts";
import { validateSdkLocalRuntimeFingerprint } from "./sdk-local-runtime.ts";
import type { SdkLocalEngine } from "./sdk-local-runtime.ts";
import type { EasyedaControlEngine } from "./engine.ts";

type PreflightEngine = SdkLocalEngine & {
  readonly upstream: SdkLocalEngine["upstream"] & Pick<EasyedaControlEngine["upstream"], "currentAuthenticatedBridgeDispatchBinding">;
};

/** Non-mutating fixed metadata comparison in a loaded project with no editor
 * tabs. The caller supplies expectations, not a source or lifecycle witness.
 * An authenticated lease owns every status and native read; a successful
 * observation neither leases the worker nor permits a later write.
 */
export async function readCurrentProjectOnlySymbolPreflight(engine: PreflightEngine, input: unknown,
  expectedFingerprint: Record<string, unknown>): Promise<Record<string, unknown>> {
  const request = currentProjectOnlySymbolPreflightRequestSchema.parse(input);
  const code = buildCurrentProjectOnlySymbolPreflightProgram(request);
  const expected = structuredClone(expectedFingerprint);
  validateSdkLocalRuntimeFingerprint(expected);
  const scopeReader = engine.upstream.currentAuthenticatedBridgeDispatchBinding;
  if (scopeReader === undefined) { throw new Error("Project-only symbol observation requires an authenticated scope."); }
  const scope = scopeReader.call(engine.upstream);
  if (scope === undefined) { throw new Error("Project-only symbol observation requires an authenticated scope."); }
  const scopeText = canonicalJson(scope);
  const current = (): void => {
    if (engine.upstream.currentAuthenticatedBridgeDispatchBinding !== scopeReader ||
        canonicalJson(scopeReader.call(engine.upstream) ?? null) !== scopeText) {
      throw new Error("Project-only symbol observation authenticated scope changed.");
    }
  };
  await engine.assertBridgeDispatchAllowed(); current();
  const initialStatus = await engine.status(); current();
  const initial = structuredClone(initialStatus.stableFingerprint);
  validateSdkLocalRuntimeFingerprint(initial); assertExpectedFingerprint(initial);
  assertSubset(initial, expected, "Project-only symbol expected runtime");
  await verifyCurrentProjectOnlySymbolPreflightImplementation(initial.installedBundles.assetsRoot); current();
  await engine.assertBridgeDispatchAllowed(); current();
  const raw = await engine.upstream.callTool("easyeda_execute", {
    code, timeoutMs: CURRENT_PROJECT_ONLY_SYMBOL_PREFLIGHT_TIMEOUT_MS + 5000, confirmWrite: true,
  }, CURRENT_PROJECT_ONLY_SYMBOL_PREFLIGHT_TIMEOUT_MS + 15_000); current();
  const result = decodeCurrentProjectOnlySymbolPreflightReply(raw, request);
  await verifyCurrentProjectOnlySymbolPreflightImplementation(initial.installedBundles.assetsRoot); current();
  await engine.assertBridgeDispatchAllowed(); current();
  const finalStatus = await engine.status(); current();
  validateSdkLocalRuntimeFingerprint(finalStatus.stableFingerprint);
  if (canonicalJson(finalStatus.stableFingerprint) !== canonicalJson(initial)) {
    throw new Error("Project-only symbol observation runtime changed around the observation.");
  }
  const response = { ...result, observationSha256: sha256Json(result), runtimeAdmission: {
    profile: "easyeda-pro-control.current-project-only-symbol-preflight-runtime.v1",
    fingerprintSha256: sha256Json(initial), beforeAndAfterChecked: true,
    scope: "loaded-project-with-no-editor-tabs-metadata-comparison-only",
    expectedBeforeProvenanceVerified: false, designExecutionAuthorized: false, persistenceVerified: false, liveValidation: "not-recorded",
  } };
  if (Buffer.byteLength(JSON.stringify(response), "utf8") > CURRENT_PROJECT_ONLY_SYMBOL_PREFLIGHT_MAX_BYTES) {
    throw new Error("Project-only symbol observation exceeds its result byte bound.");
  }
  return response;
}
