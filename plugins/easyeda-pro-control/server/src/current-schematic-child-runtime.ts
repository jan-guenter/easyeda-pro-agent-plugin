/** Unregistered fixed observer; no SCH lifecycle or writer is issued. */
/* oxlint-disable import/max-dependencies -- Keep the independent transport, fixed-source verifier and original historical SQL identities explicit. */
import { types } from "node:util";
import { assertExpectedFingerprint, assertSubset, canonicalJson, sha256Json } from "./core.ts";
import { verifyCurrentProjectOnlySymbolPreflightImplementation } from "./current-disposable-open-profile.ts";
import { decodeCurrentSchematicChildObservation } from "./current-schematic-child-observation.ts";
import { CURRENT_SCHEMATIC_CHILD_MAX_BYTES, CURRENT_SCHEMATIC_CHILD_TIMEOUT_MS, buildCurrentSchematicChildProgram } from "./current-schematic-child-program.ts";
import { assertOriginalCurrentSchematicChildRoster, compareCurrentSchematicChildRoster } from "./current-schematic-child-roster.ts";
import type { CurrentSchematicChildRoster } from "./current-schematic-child-roster.ts";
import type { CurrentSchematicNativeMetadata } from "./current-schematic-native-metadata.ts";
import type { EasyedaControlEngine } from "./engine.ts";
import { validateSdkLocalRuntimeFingerprint } from "./sdk-local-runtime.ts";
import type { SdkLocalEngine } from "./sdk-local-runtime.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import type { readExactSqlInventory } from "./sqlite-inventory.ts";

type Engine = SdkLocalEngine & { readonly upstream: SdkLocalEngine["upstream"] & Pick<EasyedaControlEngine["upstream"], "currentAuthenticatedBridgeDispatchBinding"> };
type Input = Readonly<{ before: Awaited<ReturnType<typeof readExactSqlInventory>>; metadata: CurrentSchematicNativeMetadata; roster: CurrentSchematicChildRoster }>;
function inputData(input: Input): Input {
  if (input === null || typeof input !== "object" || types.isProxy(input) || Array.isArray(input) ||
      (Object.getPrototypeOf(input) !== Object.prototype && Object.getPrototypeOf(input) !== null) || Reflect.ownKeys(input).length !== 3) {
    throw new Error("SCH child observer requires original own-data SQL identities.");
  }
  const before = Object.getOwnPropertyDescriptor(input, "before"), metadata = Object.getOwnPropertyDescriptor(input, "metadata"), roster = Object.getOwnPropertyDescriptor(input, "roster");
  if (before === undefined || !Object.hasOwn(before, "value") || metadata === undefined || !Object.hasOwn(metadata, "value") || roster === undefined || !Object.hasOwn(roster, "value")) {
    throw new Error("SCH child observer refuses input accessors.");
  }
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Capture own fields once; the original reader/metadata/roster WeakMap identities are checked immediately.
  const captured = { before: before.value as Input["before"], metadata: metadata.value as Input["metadata"], roster: roster.value as Input["roster"] };
  assertOriginalCurrentSchematicChildRoster(captured.roster, captured.before, captured.metadata); return Object.freeze(captured);
}
/** Source admission and an authenticated bridge scope are checked around the
 * fixed observation. Its holders exist only within that original invocation.
 * Matching original historical metadata is not a current worker/producer lease,
 * complete AST source proof, decoder success, subscriber barrier or persistence.
 */
export async function readCurrentSchematicChildren(engine: Engine, input: Input, expectedFingerprint: Record<string, unknown>): Promise<Readonly<Record<string, unknown>>> {
  const { before, metadata, roster } = inputData(input), expected = structuredClone(expectedFingerprint);
  validateSdkLocalRuntimeFingerprint(expected);
  const code = buildCurrentSchematicChildProgram(metadata.request), upstream = engine.upstream;
  const execute = upstream.callTool, scopeReader = upstream.currentAuthenticatedBridgeDispatchBinding;
  const guard = engine.assertBridgeDispatchAllowed, status = engine.status;
  if (scopeReader === undefined) { throw new Error("SCH child observer requires an authenticated scope."); }
  const scope = scopeReader.call(upstream);
  if (scope === undefined) { throw new Error("SCH child observer requires an authenticated scope."); }
  const scopeText = canonicalJson(scope);
  const current = (): void => {
    assertOriginalCurrentSchematicChildRoster(roster, before, metadata);
    if (engine.upstream !== upstream || upstream.callTool !== execute || engine.assertBridgeDispatchAllowed !== guard || engine.status !== status ||
        upstream.currentAuthenticatedBridgeDispatchBinding !== scopeReader || canonicalJson(scopeReader.call(upstream) ?? null) !== scopeText) {
      throw new Error("SCH child observer authenticated scope or retained receiver changed.");
    }
  };
  current(); await guard.call(engine); current();
  const initialStatus = await status.call(engine); current(); const initial = structuredClone(initialStatus.stableFingerprint);
  validateSdkLocalRuntimeFingerprint(initial); assertExpectedFingerprint(initial); assertSubset(initial, expected, "SCH child expected runtime");
  await verifyCurrentProjectOnlySymbolPreflightImplementation(initial.installedBundles.assetsRoot); current();
  await guard.call(engine); current();
  const raw = await execute.call(upstream, "easyeda_execute", { code, timeoutMs: CURRENT_SCHEMATIC_CHILD_TIMEOUT_MS + 5000, confirmWrite: true },
    CURRENT_SCHEMATIC_CHILD_TIMEOUT_MS + 15_000); current();
  const observation = decodeCurrentSchematicChildObservation(raw, metadata.request);
  const comparison = compareCurrentSchematicChildRoster(roster, before, observation);
  await verifyCurrentProjectOnlySymbolPreflightImplementation(initial.installedBundles.assetsRoot); current();
  await guard.call(engine); current(); const finalStatus = await status.call(engine); current(); validateSdkLocalRuntimeFingerprint(finalStatus.stableFingerprint);
  if (canonicalJson(finalStatus.stableFingerprint) !== canonicalJson(initial)) { throw new Error("SCH child observer runtime changed around the observation."); }
  const response = { observation, comparison, observationSha256: sha256Json(observation), runtimeAdmission: {
    profile: "private.current-schematic-child-observer-runtime.v1", fingerprintSha256: sha256Json(initial), beforeAndAfterChecked: true,
    scope: "loaded-project-no-editor-tabs-child-metadata-and-existing-ast-projection-only", originalHistoricalSqlMatched: true,
    workerIdentityVerified: false, producerBindingVerified: false, startupQualified: false, designExecutionAuthorized: false, persistenceVerified: false, liveValidation: "not-recorded",
  } };
  if (Buffer.byteLength(JSON.stringify(response)) > CURRENT_SCHEMATIC_CHILD_MAX_BYTES) { throw new Error("SCH child observer result bound exceeded."); }
  return freezeDeep(response);
}
