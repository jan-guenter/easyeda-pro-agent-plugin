/** One original current verification-generation read. Never a public route. */
import { assertExpectedFingerprint, assertSubset, canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { verifyCurrentProjectOnlySymbolPreflightImplementation, verifyCurrentSymbolPersistenceImplementation } from "./current-disposable-open-profile.ts";
import { assertCurrentSchematicRenameSavedLifecycleSource, revalidateCurrentSchematicRenameSavedLifecycleSource, verifyCurrentSchematicRenameSavedMetadataAndChildren } from "./current-schematic-rename-saved-lifecycle-source.ts";
import type { CurrentSchematicRenameSavedLifecycleSource } from "./current-schematic-rename-saved-lifecycle-source.ts";
import { buildCurrentSchematicRenameStartupObservation, decodeCurrentSchematicRenameStartupObservation } from "./current-schematic-rename-startup-runtime.ts";
import type { CurrentSchematicRenameObservation } from "./current-schematic-rename-observation.ts";
import type { CurrentSchematicChildObservation } from "./current-schematic-child-roster-contract.ts";
// oxlint-disable-next-line import/no-cycle -- Only the original verification coordinator issues this generation; the collector cannot manufacture or restore it.
import { assertCurrentSchematicRenameVerificationGeneration, revalidateCurrentSchematicRenameVerificationGeneration } from "./current-schematic-rename-verification-runtime.ts";
import type { CurrentSchematicRenameVerificationGeneration } from "./current-schematic-rename-verification-runtime.ts";
import type { EasyedaControlEngine } from "./engine.ts";
import { validateSdkLocalRuntimeFingerprint } from "./sdk-local-runtime.ts";

export interface CurrentSchematicRenameSavedRead {
  readonly profile: "private.current-schematic-rename-saved-read.v1";
  readonly operationId: string; readonly sourceSha256: string;
  readonly rawReplySha256: string; readonly requestSha256: string;
  readonly relation: Readonly<Record<string, unknown>>;
  readonly originalGenerationVerified: true; readonly reopenedSchematicMetadataVerified: true; readonly reopenedSchematicChildRosterVerified: true;
  readonly schematicSubscriberCompletionVerified: false; readonly completeCanvasRead: false;
  readonly executionAuthorized: false; readonly persistenceLifecycleComplete: false;
}
interface Collection {
  readonly engine: EasyedaControlEngine; readonly source: CurrentSchematicRenameSavedLifecycleSource;
  raw?: unknown; rawText?: string; result?: CurrentSchematicRenameSavedRead; resultText?: string;
  observation?: CurrentSchematicRenameObservation; observationText?: string;
  children?: CurrentSchematicChildObservation; childrenText?: string;
}
const CURRENT_SAVED_SCH_METADATA_TIMEOUT_MS = 25_000;
const collections = new WeakMap<CurrentSchematicRenameVerificationGeneration, Collection>();
function need(value: boolean): asserts value { if (!value) { throw new Error("Current saved SCH metadata read requires its original verification generation."); } }

export function currentSchematicRenameSavedReadEvidence(generation: CurrentSchematicRenameVerificationGeneration,
  engine: EasyedaControlEngine): Readonly<Record<string, unknown>> | undefined {
  const collection = collections.get(generation); if (collection === undefined) { return undefined; }
  need(collection.engine === engine);
  return Object.freeze({ rawRetained: Object.hasOwn(collection, "raw"), raw: collection.raw ?? null,
    result: collection.result ?? null, source: collection.source, executionAuthorized: false });
}

export function assertCurrentSchematicRenameSavedRead(value: unknown, engine: EasyedaControlEngine,
  generation: CurrentSchematicRenameVerificationGeneration): CurrentSchematicRenameSavedRead {
  const collection = collections.get(generation);
  need(collection !== undefined && collection.engine === engine && collection.result !== undefined && value === collection.result &&
    canonicalJson(value) === collection.resultText && canonicalJson(collection.raw) === collection.rawText);
  return collection.result;
}

/** Retained data provenance only, including after normal retirement. This does
 * not revive the verification generation or issue a write/open capability.
 */
export function assertCurrentSchematicRenameSavedReadSource(value: unknown, engine: EasyedaControlEngine,
  generation: CurrentSchematicRenameVerificationGeneration): Readonly<{ observation: CurrentSchematicRenameObservation; children: CurrentSchematicChildObservation; source: CurrentSchematicRenameSavedLifecycleSource }> {
  assertCurrentSchematicRenameSavedRead(value, engine, generation);
  const collection = collections.get(generation);
  need(collection !== undefined && collection.observation !== undefined && canonicalJson(collection.observation) === collection.observationText &&
    collection.children !== undefined && canonicalJson(collection.children) === collection.childrenText);
  return Object.freeze({ observation: collection.observation, children: collection.children, source: collection.source });
}

/** Called inside the coordinator's original authenticated scope. Every awaited
 * boundary retains its generation and exact journal. The coordinator keeps its
 * close ownership even if result retention, decode or post-source checks fail.
 */
export async function collectCurrentSchematicRenameSavedMetadata(engine: EasyedaControlEngine,
  generation: CurrentSchematicRenameVerificationGeneration, sourceValue: CurrentSchematicRenameSavedLifecycleSource): Promise<CurrentSchematicRenameSavedRead> {
  const scopeReader = engine.upstream.currentAuthenticatedBridgeDispatchBinding;
  need(scopeReader !== undefined); const scope = scopeReader.call(engine.upstream); need(scope !== undefined);
  const scopeText = canonicalJson(scope), source = assertCurrentSchematicRenameVerificationGeneration(generation, engine, scopeText);
  const saved = assertCurrentSchematicRenameSavedLifecycleSource(sourceValue, engine, source.continuation);
  need(!collections.has(generation) && source.operationId === sourceValue.operationId);
  const collection: Collection = { engine, source: sourceValue }; collections.set(generation, collection);
  // oxlint-disable-next-line typescript/unbound-method -- Identity only; dispatch always uses the original engine receiver.
  const dispatch = engine.dispatchWithOrphanTracking;
  const current = (): void => {
    need(engine.upstream.currentAuthenticatedBridgeDispatchBinding === scopeReader && canonicalJson(scopeReader.call(engine.upstream)) === scopeText &&
      engine.dispatchWithOrphanTracking === dispatch && assertCurrentSchematicRenameVerificationGeneration(generation, engine, scopeText) === source &&
      assertCurrentSchematicRenameSavedLifecycleSource(sourceValue, engine, source.continuation) === saved);
    source.current(scopeText);
    if (collection.rawText !== undefined) { need(canonicalJson(collection.raw) === collection.rawText); }
  };
  current(); await revalidateCurrentSchematicRenameVerificationGeneration(generation, engine, scopeText); current();
  await revalidateCurrentSchematicRenameSavedLifecycleSource(sourceValue, engine, source.continuation); current();
  const initial = await engine.status(); current();
  const fingerprint = structuredClone(initial.stableFingerprint);
  assertExpectedFingerprint(fingerprint); validateSdkLocalRuntimeFingerprint(fingerprint);
  assertSubset(fingerprint, source.expectedFingerprint, "Current saved SCH metadata runtime");
  const assetsRoot = fingerprint.installedBundles.assetsRoot;
  await verifyCurrentProjectOnlySymbolPreflightImplementation(assetsRoot); current();
  await verifyCurrentSymbolPersistenceImplementation(assetsRoot); current();
  await engine.assertBridgeDispatchAllowed(); current();
  const code = buildCurrentSchematicRenameStartupObservation(saved.request, saved.expectation), phase = "current-schematic-rename-verification-saved-read";
  await source.record("verify-saved-read-intent", { request: saved.request, source: sourceValue, codeSha256: sha256Text(code), replayAllowed: false }, scopeText); current();
  const before = structuredClone(source.journal);
  let marked: typeof before | undefined;
  let raw: unknown;
  try {
    raw = await dispatch.call(engine, source.journal, phase, "easyeda_execute",
      { code, timeoutMs: CURRENT_SAVED_SCH_METADATA_TIMEOUT_MS + 5000, confirmWrite: true }, CURRENT_SAVED_SCH_METADATA_TIMEOUT_MS + 15_000,
      async () => { marked = await source.acceptMark(before, phase, scopeText); current(); },
      async (reply) => {
        collection.raw = reply; collection.rawText = canonicalJson(reply); current();
        await source.record("verify-saved-read-reply", { raw: reply }, scopeText); current(); marked = structuredClone(source.journal);
      },
      async () => {
        if (marked === undefined) { marked = await source.acceptMark(before, phase, scopeText); }
        else { await source.revalidate(scopeText); }
        current();
      });
  } catch (error) { await source.retainEngineFailure(marked, phase, scopeText); throw error; }
  need(marked !== undefined);
  await source.acceptClear(marked, phase, scopeText); current();
  need(raw === collection.raw);
  const { observation, children } = decodeCurrentSchematicRenameStartupObservation(raw, saved.request, saved.expectation);
  const relation = verifyCurrentSchematicRenameSavedMetadataAndChildren(sourceValue, engine, source.continuation, observation, children);
  await verifyCurrentProjectOnlySymbolPreflightImplementation(assetsRoot); current();
  await verifyCurrentSymbolPersistenceImplementation(assetsRoot); current();
  await revalidateCurrentSchematicRenameSavedLifecycleSource(sourceValue, engine, source.continuation); current();
  await revalidateCurrentSchematicRenameVerificationGeneration(generation, engine, scopeText); current();
  const final = await engine.status(); current();
  need(canonicalJson(final.stableFingerprint) === canonicalJson(fingerprint));
  const result: CurrentSchematicRenameSavedRead = Object.freeze({ profile: "private.current-schematic-rename-saved-read.v1", operationId: source.operationId,
    sourceSha256: sourceValue.sourceSha256, rawReplySha256: sha256Json(raw), requestSha256: sha256Json({ request: saved.request, expectation: saved.expectation }), relation,
    originalGenerationVerified: true, reopenedSchematicMetadataVerified: true, reopenedSchematicChildRosterVerified: true,
    schematicSubscriberCompletionVerified: false, completeCanvasRead: false, executionAuthorized: false, persistenceLifecycleComplete: false });
  await source.record("verify-saved-metadata-result", result, scopeText); current();
  collection.observation = observation; collection.observationText = canonicalJson(observation);
  collection.children = children; collection.childrenText = canonicalJson(children);
  collection.result = result; collection.resultText = canonicalJson(result);
  return result;
}
