import { assertExpectedFingerprint, assertSubset, canonicalJson, sha256Json } from "./core.ts";
import { verifyCurrentProjectOnlyOpenImplementation } from "./current-disposable-open-profile.ts";
import { CURRENT_PROJECT_SCHEMATIC_METADATA_MAX_BYTES, CURRENT_PROJECT_SCHEMATIC_METADATA_TIMEOUT_MS,
  decodeCurrentProjectSchematicMetadataReply, parseCurrentProjectSchematicMetadataRequest, validateCurrentProjectSchematicMetadataResult } from "./current-project-schematic-metadata.ts";
import { buildCurrentProjectSchematicMetadataProgram } from "./current-project-schematic-metadata-program.ts";
import { validateSdkLocalRuntimeFingerprint } from "./sdk-local-runtime.ts";
import type { SdkLocalEngine } from "./sdk-local-runtime.ts";
import type { EasyedaControlEngine } from "./engine.ts";

type MetadataEngine = SdkLocalEngine & {
  readonly upstream: SdkLocalEngine["upstream"] & Pick<EasyedaControlEngine["upstream"], "currentAuthenticatedBridgeDispatchBinding">;
};

/** Original bridge lease plus fixed no-editor metadata program only. This does
 * not create a worker owner, a saved-state witness or a rename preflight. */
export async function readCurrentProjectSchematicMetadata(engine: MetadataEngine, input: unknown,
  expectedFingerprint: Record<string, unknown>): Promise<Record<string, unknown>> {
  const request = parseCurrentProjectSchematicMetadataRequest(input);
  const code = buildCurrentProjectSchematicMetadataProgram(request), expected = structuredClone(expectedFingerprint);
  validateSdkLocalRuntimeFingerprint(expected);
  const scopeReader = engine.upstream.currentAuthenticatedBridgeDispatchBinding;
  if (scopeReader === undefined) { throw new Error("Project schematic metadata requires an authenticated scope."); }
  const scope = scopeReader.call(engine.upstream);
  if (scope === undefined) { throw new Error("Project schematic metadata requires an authenticated scope."); }
  const scopeText = canonicalJson(scope);
  const current = (): void => {
    if (engine.upstream.currentAuthenticatedBridgeDispatchBinding !== scopeReader ||
        canonicalJson(scopeReader.call(engine.upstream) ?? null) !== scopeText) {
      throw new Error("Project schematic metadata authenticated scope changed.");
    }
  };
  await engine.assertBridgeDispatchAllowed(); current();
  const initialStatus = await engine.status(); current();
  const initial = structuredClone(initialStatus.stableFingerprint);
  validateSdkLocalRuntimeFingerprint(initial); assertExpectedFingerprint(initial);
  assertSubset(initial, expected, "Project schematic metadata expected runtime");
  await verifyCurrentProjectOnlyOpenImplementation(initial.installedBundles.assetsRoot); current();
  await engine.assertBridgeDispatchAllowed(); current();
  const raw = await engine.upstream.callTool("easyeda_execute", {
    code, timeoutMs: CURRENT_PROJECT_SCHEMATIC_METADATA_TIMEOUT_MS + 5000, confirmWrite: true,
  }, CURRENT_PROJECT_SCHEMATIC_METADATA_TIMEOUT_MS + 15_000); current();
  const result = validateCurrentProjectSchematicMetadataResult(request, decodeCurrentProjectSchematicMetadataReply(raw, request));
  await verifyCurrentProjectOnlyOpenImplementation(initial.installedBundles.assetsRoot); current();
  await engine.assertBridgeDispatchAllowed(); current();
  const finalStatus = await engine.status(); current();
  validateSdkLocalRuntimeFingerprint(finalStatus.stableFingerprint);
  if (canonicalJson(finalStatus.stableFingerprint) !== canonicalJson(initial)) {
    throw new Error("Project schematic metadata runtime changed around the observation.");
  }
  const response = { ...result, observationSha256: sha256Json(result), runtimeAdmission: {
    profile: "easyeda-pro-control.current-project-schematic-metadata-runtime.v1",
    fingerprintSha256: sha256Json(initial), beforeAndAfterChecked: true,
    scope: "loaded-project-with-no-editor-tabs-schematic-metadata-only",
    workerIdentityVerified: false, designExecutionAuthorized: false, persistenceVerified: false, liveValidation: "not-recorded",
  } };
  if (Buffer.byteLength(JSON.stringify(response), "utf8") > CURRENT_PROJECT_SCHEMATIC_METADATA_MAX_BYTES) {
    throw new Error("Project schematic metadata exceeds its result byte bound.");
  }
  return response;
}
