/** One original current verification-generation read. Never a public route. */
import { assertExpectedFingerprint, assertSubset, canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { verifyCurrentProjectOnlySymbolPreflightImplementation, verifyCurrentSymbolPersistenceImplementation } from "./current-disposable-open-profile.ts";
import { assertCurrentSavedSymbolSource, revalidateCurrentSavedSymbolSource, verifyCurrentSavedSymbolContent } from "./current-symbol-saved-source.ts";
import type { CurrentSavedSymbolSource } from "./current-symbol-saved-source.ts";
import { CURRENT_SAVED_SYMBOL_READ_TIMEOUT_MS, buildCurrentSavedSymbolReadProgram, decodeCurrentSavedSymbolReadReply } from "./current-symbol-saved-read-program.ts";
// oxlint-disable-next-line import/no-cycle -- Only the original verification coordinator issues this generation; the collector cannot manufacture or restore it.
import { assertCurrentSymbolVerificationGeneration, revalidateCurrentSymbolVerificationGeneration } from "./current-symbol-verification-runtime.ts";
import type { CurrentSymbolVerificationGeneration } from "./current-symbol-verification-runtime.ts";
import type { EasyedaControlEngine } from "./engine.ts";
import { validateSdkLocalRuntimeFingerprint } from "./sdk-local-runtime.ts";

export interface CurrentSavedSymbolRead {
  readonly profile: "private.current-symbol-saved-read.v1";
  readonly operationId: string; readonly sourceSha256: string;
  readonly rawReplySha256: string; readonly requestSha256: string;
  readonly relation: Readonly<Record<string, unknown>>;
  readonly originalGenerationVerified: true; readonly exactSavedContent: true;
  readonly executionAuthorized: false; readonly persistenceLifecycleComplete: false;
}
interface Collection {
  readonly engine: EasyedaControlEngine; readonly source: CurrentSavedSymbolSource;
  raw?: unknown; rawText?: string; result?: CurrentSavedSymbolRead; resultText?: string;
}
const collections = new WeakMap<CurrentSymbolVerificationGeneration, Collection>();
function need(value: boolean): asserts value { if (!value) { throw new Error("Current saved symbol read requires its original verification generation."); } }

export function currentSavedSymbolReadEvidence(generation: CurrentSymbolVerificationGeneration,
  engine: EasyedaControlEngine): Readonly<Record<string, unknown>> | undefined {
  const collection = collections.get(generation); if (collection === undefined) { return undefined; }
  need(collection.engine === engine);
  return Object.freeze({ rawRetained: Object.hasOwn(collection, "raw"), raw: collection.raw ?? null,
    result: collection.result ?? null, source: collection.source, executionAuthorized: false });
}

export function assertCurrentSavedSymbolRead(value: unknown, engine: EasyedaControlEngine,
  generation: CurrentSymbolVerificationGeneration): CurrentSavedSymbolRead {
  const collection = collections.get(generation);
  need(collection !== undefined && collection.engine === engine && collection.result !== undefined && value === collection.result &&
    canonicalJson(value) === collection.resultText && canonicalJson(collection.raw) === collection.rawText);
  return collection.result;
}

/** Called inside the coordinator's original authenticated scope. Every awaited
 * boundary retains its generation and exact journal. The coordinator keeps its
 * close ownership even if result retention, decode or post-source checks fail.
 */
export async function collectCurrentSavedSymbolContent(engine: EasyedaControlEngine,
  generation: CurrentSymbolVerificationGeneration, sourceValue: CurrentSavedSymbolSource): Promise<CurrentSavedSymbolRead> {
  const scopeReader = engine.upstream.currentAuthenticatedBridgeDispatchBinding;
  need(scopeReader !== undefined); const scope = scopeReader.call(engine.upstream); need(scope !== undefined);
  const scopeText = canonicalJson(scope), source = assertCurrentSymbolVerificationGeneration(generation, engine, scopeText);
  const saved = assertCurrentSavedSymbolSource(sourceValue, engine, source.continuation);
  need(!collections.has(generation) && source.operationId === sourceValue.operationId);
  const collection: Collection = { engine, source: sourceValue }; collections.set(generation, collection);
  // oxlint-disable-next-line typescript/unbound-method -- Identity only; dispatch always uses the original engine receiver.
  const dispatch = engine.dispatchWithOrphanTracking;
  const current = (): void => {
    need(engine.upstream.currentAuthenticatedBridgeDispatchBinding === scopeReader && canonicalJson(scopeReader.call(engine.upstream)) === scopeText &&
      engine.dispatchWithOrphanTracking === dispatch && assertCurrentSymbolVerificationGeneration(generation, engine, scopeText) === source &&
      assertCurrentSavedSymbolSource(sourceValue, engine, source.continuation) === saved);
    source.current(scopeText);
    if (collection.rawText !== undefined) { need(canonicalJson(collection.raw) === collection.rawText); }
  };
  current(); await revalidateCurrentSymbolVerificationGeneration(generation, engine, scopeText); current();
  await revalidateCurrentSavedSymbolSource(sourceValue, engine, source.continuation); current();
  const initial = await engine.status(); current();
  const fingerprint = structuredClone(initial.stableFingerprint);
  assertExpectedFingerprint(fingerprint); validateSdkLocalRuntimeFingerprint(fingerprint);
  assertSubset(fingerprint, source.expectedFingerprint, "Current saved symbol runtime");
  const assetsRoot = fingerprint.installedBundles.assetsRoot;
  await verifyCurrentProjectOnlySymbolPreflightImplementation(assetsRoot); current();
  await verifyCurrentSymbolPersistenceImplementation(assetsRoot); current();
  await engine.assertBridgeDispatchAllowed(); current();
  const code = buildCurrentSavedSymbolReadProgram(saved.request), phase = "current-symbol-verification-saved-read";
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
  const observation = decodeCurrentSavedSymbolReadReply(raw, saved.request);
  const relation = verifyCurrentSavedSymbolContent(sourceValue, engine, source.continuation, observation.observation);
  await verifyCurrentProjectOnlySymbolPreflightImplementation(assetsRoot); current();
  await verifyCurrentSymbolPersistenceImplementation(assetsRoot); current();
  await revalidateCurrentSavedSymbolSource(sourceValue, engine, source.continuation); current();
  await revalidateCurrentSymbolVerificationGeneration(generation, engine, scopeText); current();
  const final = await engine.status(); current();
  need(canonicalJson(final.stableFingerprint) === canonicalJson(fingerprint));
  const result: CurrentSavedSymbolRead = Object.freeze({ profile: "private.current-symbol-saved-read.v1", operationId: source.operationId,
    sourceSha256: sourceValue.sourceSha256, rawReplySha256: sha256Json(raw), requestSha256: sha256Json(saved.request), relation,
    originalGenerationVerified: true, exactSavedContent: true, executionAuthorized: false, persistenceLifecycleComplete: false });
  await source.record("verify-saved-content-result", result, scopeText); current();
  collection.result = result; collection.resultText = canonicalJson(result);
  return result;
}
