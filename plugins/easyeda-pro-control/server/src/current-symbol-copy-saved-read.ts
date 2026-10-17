/** One original current verification-generation read. Never a public route. */
import { assertExpectedFingerprint, assertSubset, canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { verifyCurrentProjectOnlySymbolPreflightImplementation, verifyCurrentSymbolPersistenceImplementation } from "./current-disposable-open-profile.ts";
// oxlint-disable-next-line import/no-cycle -- Public composition retains the original writer/source registry; a caller-supplied source verifier cannot replace that owner.
import { assertCurrentCopiedSymbolSource, revalidateCurrentCopiedSymbolSource, verifyCurrentCopiedSymbolContent } from "./current-symbol-copy-saved-source.ts";
import type { CurrentCopiedSymbolSource } from "./current-symbol-copy-saved-source.ts";
import { buildCurrentSymbolCopySavedReadProgram, decodeCurrentSymbolCopySavedReadReply } from "./current-symbol-copy-saved-read-program.ts";
import type { CurrentSymbolCopySavedReadObservation } from "./current-symbol-copy-saved-read-program.ts";
// oxlint-disable-next-line import/no-cycle -- Only the original verification coordinator issues this generation; the collector cannot manufacture or restore it.
import { assertCurrentSymbolCopyVerificationGeneration, revalidateCurrentSymbolCopyVerificationGeneration } from "./current-symbol-copy-verification-runtime.ts";
import type { CurrentSymbolCopyVerificationGeneration } from "./current-symbol-copy-verification-runtime.ts";
import { CURRENT_SAVED_SYMBOL_READ_TIMEOUT_MS } from "./current-symbol-saved-read-program.ts";
import type { EasyedaControlEngine } from "./engine.ts";
import { validateSdkLocalRuntimeFingerprint } from "./sdk-local-runtime.ts";

export interface CurrentCopiedSymbolRead {
  readonly profile: "private.current-symbol-copy-saved-read.v1";
  readonly operationId: string; readonly sourceSha256: string;
  readonly rawReplySha256: string; readonly requestSha256: string;
  readonly relation: Readonly<Record<string, unknown>>;
  readonly originalGenerationVerified: true; readonly exactSavedContent: true;
  readonly executionAuthorized: false; readonly persistenceLifecycleComplete: false;
}
interface Collection {
  readonly engine: EasyedaControlEngine; readonly source: CurrentCopiedSymbolSource;
  raw?: unknown; rawText?: string; result?: CurrentCopiedSymbolRead; resultText?: string;
  observation?: CurrentSymbolCopySavedReadObservation; observationText?: string;
}
const collections = new WeakMap<CurrentSymbolCopyVerificationGeneration, Collection>();
function need(value: boolean): asserts value { if (!value) { throw new Error("Current saved symbol read requires its original verification generation."); } }

export function currentCopiedSymbolReadEvidence(generation: CurrentSymbolCopyVerificationGeneration,
  engine: EasyedaControlEngine): Readonly<Record<string, unknown>> | undefined {
  const collection = collections.get(generation); if (collection === undefined) { return undefined; }
  need(collection.engine === engine);
  return Object.freeze({ rawRetained: Object.hasOwn(collection, "raw"), raw: collection.raw ?? null,
    result: collection.result ?? null, source: collection.source, executionAuthorized: false });
}

export function assertCurrentCopiedSymbolRead(value: unknown, engine: EasyedaControlEngine,
  generation: CurrentSymbolCopyVerificationGeneration): CurrentCopiedSymbolRead {
  const collection = collections.get(generation);
  need(collection !== undefined && collection.engine === engine && collection.result !== undefined && value === collection.result &&
    canonicalJson(value) === collection.resultText && canonicalJson(collection.raw) === collection.rawText);
  return collection.result;
}

/** Retained data provenance only, including after normal retirement. This does
 * not revive the verification generation or issue a write/open capability.
 */
export function assertCurrentCopiedSymbolReadSource(value: unknown, engine: EasyedaControlEngine,
  generation: CurrentSymbolCopyVerificationGeneration): Readonly<{ observation: CurrentSymbolCopySavedReadObservation; source: CurrentCopiedSymbolSource }> {
  assertCurrentCopiedSymbolRead(value, engine, generation);
  const collection = collections.get(generation);
  need(collection !== undefined && collection.observation !== undefined && canonicalJson(collection.observation) === collection.observationText);
  return Object.freeze({ observation: collection.observation, source: collection.source });
}

/** Called inside the coordinator's original authenticated scope. Every awaited
 * boundary retains its generation and exact journal. The coordinator keeps its
 * close ownership even if result retention, decode or post-source checks fail.
 */
export async function collectCurrentCopiedSymbolContent(engine: EasyedaControlEngine,
  generation: CurrentSymbolCopyVerificationGeneration, sourceValue: CurrentCopiedSymbolSource): Promise<CurrentCopiedSymbolRead> {
  const scopeReader = engine.upstream.currentAuthenticatedBridgeDispatchBinding;
  need(scopeReader !== undefined); const scope = scopeReader.call(engine.upstream); need(scope !== undefined);
  const scopeText = canonicalJson(scope), source = assertCurrentSymbolCopyVerificationGeneration(generation, engine, scopeText);
  const saved = assertCurrentCopiedSymbolSource(sourceValue, engine, source.continuation);
  need(!collections.has(generation) && source.operationId === sourceValue.operationId);
  const collection: Collection = { engine, source: sourceValue }; collections.set(generation, collection);
  // oxlint-disable-next-line typescript/unbound-method -- Identity only; dispatch always uses the original engine receiver.
  const dispatch = engine.dispatchWithOrphanTracking;
  const current = (): void => {
    need(engine.upstream.currentAuthenticatedBridgeDispatchBinding === scopeReader && canonicalJson(scopeReader.call(engine.upstream)) === scopeText &&
      engine.dispatchWithOrphanTracking === dispatch && assertCurrentSymbolCopyVerificationGeneration(generation, engine, scopeText) === source &&
      assertCurrentCopiedSymbolSource(sourceValue, engine, source.continuation) === saved);
    source.current(scopeText);
    if (collection.rawText !== undefined) { need(canonicalJson(collection.raw) === collection.rawText); }
  };
  current(); await revalidateCurrentSymbolCopyVerificationGeneration(generation, engine, scopeText); current();
  await revalidateCurrentCopiedSymbolSource(sourceValue, engine, source.continuation); current();
  const initial = await engine.status(); current();
  const fingerprint = structuredClone(initial.stableFingerprint);
  assertExpectedFingerprint(fingerprint); validateSdkLocalRuntimeFingerprint(fingerprint);
  assertSubset(fingerprint, source.expectedFingerprint, "Current saved symbol runtime");
  const assetsRoot = fingerprint.installedBundles.assetsRoot;
  await verifyCurrentProjectOnlySymbolPreflightImplementation(assetsRoot); current();
  await verifyCurrentSymbolPersistenceImplementation(assetsRoot); current();
  await engine.assertBridgeDispatchAllowed(); current();
  const code = buildCurrentSymbolCopySavedReadProgram(saved.copyPlan, saved.request), phase = "current-symbol-copy-verification-saved-read";
  await source.record("verify-saved-read-intent", { request: saved.request, source: sourceValue, codeSha256: sha256Text(code), replayAllowed: false }, scopeText); current();
  const before = structuredClone(source.journal);
  let marked: typeof before | undefined;
  let raw: unknown;
  try {
    raw = await dispatch.call(engine, source.journal, phase, "easyeda_execute",
      { code, timeoutMs: CURRENT_SAVED_SYMBOL_READ_TIMEOUT_MS + 5000, confirmWrite: true }, CURRENT_SAVED_SYMBOL_READ_TIMEOUT_MS + 15_000,
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
  const observation = decodeCurrentSymbolCopySavedReadReply(raw, saved.copyPlan, saved.request);
  const relation = verifyCurrentCopiedSymbolContent(sourceValue, engine, source.continuation, observation.observation);
  await verifyCurrentProjectOnlySymbolPreflightImplementation(assetsRoot); current();
  await verifyCurrentSymbolPersistenceImplementation(assetsRoot); current();
  await revalidateCurrentCopiedSymbolSource(sourceValue, engine, source.continuation); current();
  await revalidateCurrentSymbolCopyVerificationGeneration(generation, engine, scopeText); current();
  const final = await engine.status(); current();
  need(canonicalJson(final.stableFingerprint) === canonicalJson(fingerprint));
  const result: CurrentCopiedSymbolRead = Object.freeze({ profile: "private.current-symbol-copy-saved-read.v1", operationId: source.operationId,
    sourceSha256: sourceValue.sourceSha256, rawReplySha256: sha256Json(raw), requestSha256: sha256Json(saved.request), relation,
    originalGenerationVerified: true, exactSavedContent: true, executionAuthorized: false, persistenceLifecycleComplete: false });
  await source.record("verify-saved-content-result", result, scopeText); current();
  collection.observation = observation; collection.observationText = canonicalJson(observation);
  collection.result = result; collection.resultText = canonicalJson(result);
  return result;
}
