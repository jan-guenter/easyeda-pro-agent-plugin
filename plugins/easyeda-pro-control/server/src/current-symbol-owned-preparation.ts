/** Internal current-runtime composition. No public request registration or
 * writer admission is provided by a checkpoint-only preparation.
 */
import { canonicalJson, sha256Json } from "./core.ts";
// oxlint-disable-next-line import/no-cycle -- Only the retained opener can issue the original generation consumed here; no caller-provided issuer exists.
import { assertCurrentDisposableOpenGeneration, revalidateCurrentDisposableOpenGeneration } from "./current-disposable-open-runtime.ts";
import type { CurrentDisposableOpenGeneration, CurrentDisposableOpenGenerationSource } from "./current-disposable-open-runtime.ts";
import { currentSymbolMetadataPreparationRequestSchema, prepareCurrentSymbolMetadata } from "./current-symbol-metadata-preparation.ts";
import type { CurrentSymbolMetadataPreparationResult } from "./current-symbol-metadata-preparation.ts";
import { currentClosedSymbolMetadataProjection } from "./current-symbol-closed-target.ts";
import { readCurrentClosedSymbolMetadata } from "./current-symbol-closed-target-runtime.ts";
import type { EasyedaControlEngine } from "./engine.ts";

export interface CurrentOwnedSymbolMetadataPreparation {
  readonly profile: "private.current-owned-symbol-metadata-preparation.v1";
  readonly openingOperationId: string;
  readonly closedTargetWitness: Awaited<ReturnType<typeof readCurrentClosedSymbolMetadata>>;
  readonly checkpointPreparation: CurrentSymbolMetadataPreparationResult;
  readonly preparationSha256: string;
  readonly postOpeningBaselineVerified: false;
  readonly writerReady: false;
  readonly executionAuthorized: false;
}
export interface OriginalCurrentOwnedSymbolPreparation {
  readonly preparation: CurrentOwnedSymbolMetadataPreparation;
  readonly generation: CurrentDisposableOpenGeneration;
  readonly source: CurrentDisposableOpenGenerationSource;
}
const issuedPreparations = new WeakMap<object, {
  readonly original: OriginalCurrentOwnedSymbolPreparation;
  readonly engine: EasyedaControlEngine;
  readonly text: string;
}>();
function need(condition: boolean, message: string): asserts condition { if (!condition) { throw new Error(message); } }

/** Original-object lookup only, never a parser for caller-supplied authority. */
export function assertOriginalCurrentOwnedSymbolPreparation(value: unknown, engine: EasyedaControlEngine): OriginalCurrentOwnedSymbolPreparation {
  need(value !== null && typeof value === "object", "Original current symbol preparation is missing.");
  const issued = issuedPreparations.get(value);
  need(issued !== undefined && issued.engine === engine && canonicalJson(value) === issued.text,
    "Current symbol preparation was not issued unchanged by this engine.");
  need(assertCurrentDisposableOpenGeneration(issued.original.generation, engine) === issued.original.source,
    "Current symbol preparation original generation changed.");
  return issued.original;
}

/** Actual checkpoint decoder and metadata preparer, bound to the retained
 * successful opening. Supplied checkpoint descriptors remain evidence inputs:
 * they are not an operation-owned post-opening baseline or full SQL inventory.
 */
export async function prepareCurrentOwnedSymbolMetadata(engine: EasyedaControlEngine, generation: CurrentDisposableOpenGeneration,
  input: unknown): Promise<CurrentOwnedSymbolMetadataPreparation> {
  const source = assertCurrentDisposableOpenGeneration(generation, engine);
  // The core projection comes only from this scope's fresh fixed collector.
  // Caller observations remain supported by the separate offline API, not here.
  const request = currentSymbolMetadataPreparationRequestSchema.omit({ observationProjection: true }).parse(input);
  need(request.target.projectUuid === source.target.projectUuid && request.target.branchUuid === source.target.branchUuid &&
    request.target.symbolUuid !== source.target.documentUuid,
  "Current symbol preparation differs from its original opening target.");
  const scopeReader = engine.upstream.currentAuthenticatedBridgeDispatchBinding;
  need(scopeReader !== undefined, "Current symbol preparation cannot inspect its authenticated scope.");
  const scope = scopeReader.call(engine.upstream), session = source.bridgeSession;
  need(scope !== undefined && scope.gatewayInstanceId === session.gatewayInstanceId && scope.sessionId === session.sessionId &&
    scope.sessionSequence === session.sequence, "Current symbol preparation scope does not belong to its original session.");
  const scopeText = canonicalJson(scope);
  const current = (): void => {
    need(assertCurrentDisposableOpenGeneration(generation, engine) === source && engine.upstream.currentAuthenticatedBridgeDispatchBinding === scopeReader &&
      canonicalJson(scopeReader.call(engine.upstream)) === scopeText, "Current symbol preparation owner or authenticated scope changed.");
  };
  await revalidateCurrentDisposableOpenGeneration(generation, engine); current();
  const target = { projectUuid: source.target.projectUuid, branchUuid: source.target.branchUuid, documentUuid: source.target.documentUuid,
    tabId: `${source.target.documentUuid}@${source.target.projectUuid}` };
  const closedTargetWitness = await readCurrentClosedSymbolMetadata(engine,
    { method: "eda.lib_Symbol.get", arguments: { symbolUuid: request.target.symbolUuid }, target }, source.expectedFingerprint); current();
  const checkpointPreparation = await prepareCurrentSymbolMetadata({ ...request,
    observationProjection: currentClosedSymbolMetadataProjection(closedTargetWitness.observation) }); current();
  await revalidateCurrentDisposableOpenGeneration(generation, engine); current();
  const body = { profile: "private.current-owned-symbol-metadata-preparation.v1" as const, openingOperationId: generation.operationId,
    closedTargetWitness, checkpointPreparation, postOpeningBaselineVerified: false as const, writerReady: false as const, executionAuthorized: false as const };
  const preparation = Object.freeze({ ...body, preparationSha256: sha256Json(body) });
  issuedPreparations.set(preparation, { original: Object.freeze({ preparation, generation, source }), engine, text: canonicalJson(preparation) });
  return preparation;
}
