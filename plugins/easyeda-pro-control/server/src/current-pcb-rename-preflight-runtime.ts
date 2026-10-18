import { assertExpectedFingerprint, assertSubset, canonicalJson, sha256Json } from "./core.ts";
import { verifyCurrentProjectOnlySymbolPreflightImplementation } from "./current-disposable-open-profile.ts";
import { CURRENT_PCB_RENAME_PREFLIGHT_MAX_BYTES, CURRENT_PCB_RENAME_PREFLIGHT_TIMEOUT_MS,
  decodeCurrentPcbRenamePreflightReply, parseCurrentPcbRenamePreflightRequest, validateCurrentPcbRenamePreflightResult } from "./current-pcb-rename-preflight.ts";
import { buildCurrentPcbRenamePreflightProgram } from "./current-pcb-rename-preflight-program.ts";
import { validateSdkLocalRuntimeFingerprint } from "./sdk-local-runtime.ts";
import type { SdkLocalEngine } from "./sdk-local-runtime.ts";
import type { EasyedaControlEngine } from "./engine.ts";

type PreflightEngine = SdkLocalEngine & {
  readonly upstream: SdkLocalEngine["upstream"] & Pick<EasyedaControlEngine["upstream"], "currentAuthenticatedBridgeDispatchBinding">;
};

/** Project-only observations, not an original worker lease or rename authority.
 * The existing fixed source verifier includes APP, manager, project worker,
 * UI, schematic startup and notify-clock code; it issues no symbol owner token.
 */
export async function readCurrentPcbRenamePreflight(engine: PreflightEngine, input: unknown,
  expectedFingerprint: Record<string, unknown>): Promise<Record<string, unknown>> {
  const request = parseCurrentPcbRenamePreflightRequest(input);
  const code = buildCurrentPcbRenamePreflightProgram(request), expected = structuredClone(expectedFingerprint);
  validateSdkLocalRuntimeFingerprint(expected);
  const scopeReader = engine.upstream.currentAuthenticatedBridgeDispatchBinding;
  if (scopeReader === undefined) { throw new Error("PCB rename preflight requires an authenticated scope."); }
  const scope = scopeReader.call(engine.upstream);
  if (scope === undefined) { throw new Error("PCB rename preflight requires an authenticated scope."); }
  const scopeText = canonicalJson(scope);
  const current = (): void => {
    if (engine.upstream.currentAuthenticatedBridgeDispatchBinding !== scopeReader ||
        canonicalJson(scopeReader.call(engine.upstream) ?? null) !== scopeText) {
      throw new Error("PCB rename preflight authenticated scope changed.");
    }
  };
  await engine.assertBridgeDispatchAllowed(); current();
  const initialStatus = await engine.status(); current();
  const initial = structuredClone(initialStatus.stableFingerprint);
  validateSdkLocalRuntimeFingerprint(initial); assertExpectedFingerprint(initial);
  assertSubset(initial, expected, "PCB rename preflight expected runtime");
  await verifyCurrentProjectOnlySymbolPreflightImplementation(initial.installedBundles.assetsRoot); current();
  await engine.assertBridgeDispatchAllowed(); current();
  const raw = await engine.upstream.callTool("easyeda_execute", {
    code, timeoutMs: CURRENT_PCB_RENAME_PREFLIGHT_TIMEOUT_MS + 5000, confirmWrite: true,
  }, CURRENT_PCB_RENAME_PREFLIGHT_TIMEOUT_MS + 15_000); current();
  const result = validateCurrentPcbRenamePreflightResult(request, decodeCurrentPcbRenamePreflightReply(raw, request));
  await verifyCurrentProjectOnlySymbolPreflightImplementation(initial.installedBundles.assetsRoot); current();
  await engine.assertBridgeDispatchAllowed(); current();
  const finalStatus = await engine.status(); current();
  validateSdkLocalRuntimeFingerprint(finalStatus.stableFingerprint);
  if (canonicalJson(finalStatus.stableFingerprint) !== canonicalJson(initial)) {
    throw new Error("PCB rename preflight runtime changed around the observation.");
  }
  const response = { ...result, observationSha256: sha256Json(result), runtimeAdmission: {
    profile: "easyeda-pro-control.current-pcb-rename-preflight-runtime.v1",
    fingerprintSha256: sha256Json(initial), beforeAndAfterChecked: true,
    scope: "loaded-project-with-no-editor-tabs-pcb-rename-preflight-only",
    workerIdentityVerified: false, designExecutionAuthorized: false, persistenceVerified: false, liveValidation: "not-recorded",
  } };
  if (Buffer.byteLength(JSON.stringify(response), "utf8") > CURRENT_PCB_RENAME_PREFLIGHT_MAX_BYTES) {
    throw new Error("PCB rename preflight exceeds its result byte bound.");
  }
  return response;
}
