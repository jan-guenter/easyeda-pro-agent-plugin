/** Internal fixed SCH observation only; no tool, owner lease or writer is registered. */
/* oxlint-disable import/max-dependencies -- Keep Proxy refusal, fixed source verification and original SQL identities explicit at this boundary. */
import { types } from "node:util";
import { assertExpectedFingerprint, assertSubset, canonicalJson, sha256Json } from "./core.ts";
import { verifyCurrentProjectOnlySymbolPreflightImplementation } from "./current-disposable-open-profile.ts";
import { assertOriginalCurrentSchematicNativeMetadata } from "./current-schematic-native-metadata.ts";
import type { CurrentSchematicNativeMetadata } from "./current-schematic-native-metadata.ts";
import { CURRENT_SCHEMATIC_RENAME_PREFLIGHT_TIMEOUT_MS, compareCurrentSchematicRenameObservation, decodeCurrentSchematicRenameObservation } from "./current-schematic-rename-observation.ts";
import { CURRENT_SCHEMATIC_RENAME_PREFLIGHT_MAX_BYTES } from "./current-schematic-rename-preflight.ts";
import { buildCurrentSchematicRenamePreflightProgram } from "./current-schematic-rename-preflight-program.ts";
import type { EasyedaControlEngine } from "./engine.ts";
import { validateSdkLocalRuntimeFingerprint } from "./sdk-local-runtime.ts";
import type { SdkLocalEngine } from "./sdk-local-runtime.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import type { readExactSqlInventory } from "./sqlite-inventory.ts";

type PreflightEngine = SdkLocalEngine & {
  readonly upstream: SdkLocalEngine["upstream"] & Pick<EasyedaControlEngine["upstream"], "currentAuthenticatedBridgeDispatchBinding">;
};
type Input = Readonly<{ before: Awaited<ReturnType<typeof readExactSqlInventory>>; metadata: CurrentSchematicNativeMetadata }>;
function inputData(input: Input): Input {
  if (input === null || typeof input !== "object" || types.isProxy(input) || Array.isArray(input) ||
      (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null) || Reflect.ownKeys(input).length !== 2) {
    throw new Error("SCH preflight requires original own-data SQL metadata.");
  }
  const before = Object.getOwnPropertyDescriptor(input, "before"), metadata = Object.getOwnPropertyDescriptor(input, "metadata");
  if (before === undefined || !Object.hasOwn(before, "value") || metadata === undefined || !Object.hasOwn(metadata, "value")) {
    throw new Error("SCH preflight refuses input accessors.");
  }
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Capture declared own-data fields without rereading input; the original SQL WeakMap identity is required immediately below.
  const captured = { before: before.value as Input["before"], metadata: metadata.value as Input["metadata"] };
  assertOriginalCurrentSchematicNativeMetadata(captured.metadata, captured.before); return Object.freeze(captured);
}
/** The original SQL reader is a historical data identity, not a live worker
 * lease. Complete agreeing peer/actor/clock samples cannot prove that worker's
 * queue, producer, subscriber or persistence lifecycle. The neutral fixed
 * source verifier admits UI/APP/MGR/worker/SCH/notify code, not an owner token.
 */
export async function readCurrentSchematicRenamePreflight(engine: PreflightEngine, input: Input,
  expectedFingerprint: Record<string, unknown>): Promise<Readonly<Record<string, unknown>>> {
  const { before, metadata } = inputData(input), expected = structuredClone(expectedFingerprint);
  validateSdkLocalRuntimeFingerprint(expected);
  const code = buildCurrentSchematicRenamePreflightProgram(metadata.request), upstream = engine.upstream;
  const execute = upstream.callTool, scopeReader = upstream.currentAuthenticatedBridgeDispatchBinding;
  const guard = engine.assertBridgeDispatchAllowed, status = engine.status;
  if (scopeReader === undefined) { throw new Error("SCH preflight requires an authenticated scope."); }
  const scope = scopeReader.call(upstream);
  if (scope === undefined) { throw new Error("SCH preflight requires an authenticated scope."); }
  const scopeText = canonicalJson(scope);
  const current = (): void => {
    assertOriginalCurrentSchematicNativeMetadata(metadata, before);
    if (engine.upstream !== upstream || upstream.callTool !== execute || engine.assertBridgeDispatchAllowed !== guard || engine.status !== status ||
        upstream.currentAuthenticatedBridgeDispatchBinding !== scopeReader || canonicalJson(scopeReader.call(upstream) ?? null) !== scopeText) {
      throw new Error("SCH preflight authenticated scope or retained receiver changed.");
    }
  };
  current(); await guard.call(engine); current();
  const initialStatus = await status.call(engine); current();
  const initial = structuredClone(initialStatus.stableFingerprint);
  validateSdkLocalRuntimeFingerprint(initial); assertExpectedFingerprint(initial); assertSubset(initial, expected, "SCH preflight expected runtime");
  await verifyCurrentProjectOnlySymbolPreflightImplementation(initial.installedBundles.assetsRoot); current();
  await guard.call(engine); current();
  const raw = await execute.call(upstream, "easyeda_execute", { code, timeoutMs: CURRENT_SCHEMATIC_RENAME_PREFLIGHT_TIMEOUT_MS + 5000, confirmWrite: true },
    CURRENT_SCHEMATIC_RENAME_PREFLIGHT_TIMEOUT_MS + 15_000); current();
  const result = decodeCurrentSchematicRenameObservation(raw, metadata.request);
  const comparison = compareCurrentSchematicRenameObservation(metadata, before, result);
  await verifyCurrentProjectOnlySymbolPreflightImplementation(initial.installedBundles.assetsRoot); current();
  await guard.call(engine); current();
  const finalStatus = await status.call(engine); current(); validateSdkLocalRuntimeFingerprint(finalStatus.stableFingerprint);
  if (canonicalJson(finalStatus.stableFingerprint) !== canonicalJson(initial)) { throw new Error("SCH preflight runtime changed around the observation."); }
  const response = { ...result, comparison, observationSha256: sha256Json(result), runtimeAdmission: {
    profile: "private.current-schematic-rename-preflight-runtime.v1", fingerprintSha256: sha256Json(initial), beforeAndAfterChecked: true,
    scope: "loaded-project-with-no-editor-tabs-schematic-container-rename-preflight-only", originalHistoricalSqlMetadataMatched: true,
    workerIdentityVerified: false, designExecutionAuthorized: false, persistenceVerified: false, liveValidation: "not-recorded",
  } };
  if (Buffer.byteLength(JSON.stringify(response)) > CURRENT_SCHEMATIC_RENAME_PREFLIGHT_MAX_BYTES) { throw new Error("SCH preflight result bound exceeded."); }
  return freezeDeep(response);
}
