/** Copy-only original-generation qualification. No clone, transfer or public
 * registration. A referenced source is unchanged by the proposed native clone.
 */
import { readExactUtf8Artifact, writePhaseArtifact } from "./artifacts.ts";
import type { ArtifactDescriptor } from "./artifacts.ts";
import { assertExpectedFingerprint, canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { verifyCurrentProjectOnlySymbolPreflightImplementation, verifyCurrentSymbolPersistenceImplementation } from "./current-disposable-open-profile.ts";
// oxlint-disable-next-line import/no-cycle -- Startup consumes the baseline coordinator's original generation; an alternate issuer would weaken ownership.
import { assertCurrentProjectOnlySymbolCopyGeneration, revalidateCurrentProjectOnlySymbolCopyGeneration } from "./current-symbol-baseline-runtime.ts";
import type { CurrentProjectOnlySymbolCopyGeneration, CurrentProjectOnlySymbolCopyGenerationSource } from "./current-symbol-baseline-runtime.ts";
import { assertCurrentSymbolCopyPlanInventory } from "./current-symbol-copy-plan.ts";
import { selectCurrentSymbolStartupExpectation } from "./current-symbol-startup.ts";
import type { CurrentSymbolStartupExpectation } from "./current-symbol-startup.ts";
// oxlint-disable-next-line import/no-cycle -- Reuse the fixed startup observer while keeping copy and metadata issuance in separate original-owner registries.
import { buildCurrentSymbolStartupObservation, decodeCurrentSymbolStartupObservation } from "./current-symbol-startup-runtime.ts";
import type { EasyedaControlEngine } from "./engine.ts";
import { readNativeHistoryCheckpoint } from "./native-history.ts";
import { validateSdkLocalRuntimeFingerprint } from "./sdk-local-runtime.ts";

export interface CurrentSymbolCopyStartup {
  readonly profile: "private.current-symbol-copy-startup.v1";
  readonly operationId: string;
  readonly expectation: CurrentSymbolStartupExpectation;
  readonly baselineSha256: string;
  readonly copyPlanSha256: string;
  readonly sourceDocumentSemanticSha256: string;
  readonly startupLocalChangesExcluded: true;
  readonly runtimeHoldersObserved: true;
  readonly liveSourceInvarianceVerified: false;
  readonly crossInvocationReceiverContinuityVerified: false;
  readonly globalIdleVerified: false;
  readonly persistenceVerified: false;
  readonly executionAuthorized: false;
}
interface Original {
  readonly engine: EasyedaControlEngine;
  readonly generation: CurrentProjectOnlySymbolCopyGeneration;
  readonly source: CurrentProjectOnlySymbolCopyGenerationSource;
  readonly expectation: CurrentSymbolStartupExpectation;
  readonly text: string;
  readonly resultArtifact: ArtifactDescriptor;
}
interface Collection {
  readonly engine: EasyedaControlEngine;
  raw?: unknown;
  intentArtifact?: Readonly<ArtifactDescriptor>;
  resultArtifact?: Readonly<ArtifactDescriptor>;
  resultPublicationAttempted: boolean;
  failureObserved: boolean;
}
const attempts = new WeakSet<CurrentProjectOnlySymbolCopyGeneration>(), issued = new WeakMap<object, Original>();
const collections = new WeakMap<CurrentProjectOnlySymbolCopyGeneration, Collection>();
function need(condition: boolean): asserts condition { if (!condition) { throw new Error("Current symbol copy startup qualification refused."); } }

export function currentSymbolCopyStartupCollectionEvidence(generation: CurrentProjectOnlySymbolCopyGeneration,
  engine: EasyedaControlEngine): Readonly<Record<string, unknown>> | undefined {
  const collection = collections.get(generation); if (collection === undefined) { return undefined; } need(collection.engine === engine);
  return Object.freeze({ profile: "private.current-symbol-copy-startup-collection.v1", raw: collection.raw ?? null,
    rawRetained: Object.hasOwn(collection, "raw"), intentArtifact: collection.intentArtifact ?? null, resultArtifact: collection.resultArtifact ?? null,
    resultPublicationAttempted: collection.resultPublicationAttempted, failureObserved: collection.failureObserved, executionAuthorized: false });
}

export function assertCurrentSymbolCopyStartup(value: unknown, engine: EasyedaControlEngine,
  generation: CurrentProjectOnlySymbolCopyGeneration): Original {
  need(value !== null && typeof value === "object"); const original = issued.get(value);
  need(original !== undefined && original.engine === engine && original.generation === generation && original.text === canonicalJson(value));
  const scope = engine.upstream.currentAuthenticatedBridgeDispatchBinding?.();
  need(assertCurrentProjectOnlySymbolCopyGeneration(generation, engine, scope === undefined ? undefined : canonicalJson(scope)) === original.source);
  assertCurrentSymbolCopyPlanInventory(original.source.baseline.preparation, original.source.baseline.inventory);
  return original;
}
export async function revalidateCurrentSymbolCopyStartup(value: unknown, engine: EasyedaControlEngine,
  generation: CurrentProjectOnlySymbolCopyGeneration): Promise<Original> {
  const original = assertCurrentSymbolCopyStartup(value, engine, generation);
  const check = (): void => { need(assertCurrentSymbolCopyStartup(value, engine, generation) === original); };
  const fingerprint = original.source.source.expectedFingerprint;
  assertExpectedFingerprint(fingerprint); validateSdkLocalRuntimeFingerprint(fingerprint);
  const root = fingerprint.installedBundles.assetsRoot;
  await verifyCurrentProjectOnlySymbolPreflightImplementation(root); check();
  await verifyCurrentSymbolPersistenceImplementation(root); check();
  await readExactUtf8Artifact(original.resultArtifact); check();
  return original;
}

/** Once per original copy generation and authenticated dispatch lease. The
 * complete closed baseline supplies the unchanged source and no-repair page
 * model. The fixed synchronous observation only inspects existing UI holders;
 * it does not prove current worker bytes or persistence, flush or call clone.
 */
export async function qualifyCurrentSymbolCopyStartup(engine: EasyedaControlEngine,
  generation: CurrentProjectOnlySymbolCopyGeneration): Promise<CurrentSymbolCopyStartup> {
  const scopeReader = engine.upstream.currentAuthenticatedBridgeDispatchBinding;
  need(scopeReader !== undefined); const scope = scopeReader.call(engine.upstream); need(scope !== undefined);
  const scopeText = canonicalJson(scope), source = assertCurrentProjectOnlySymbolCopyGeneration(generation, engine, scopeText);
  need(source.source.purpose === "disposable-validation" && !attempts.has(generation)); attempts.add(generation);
  const collection: Collection = { engine, resultPublicationAttempted: false, failureObserved: false }; collections.set(generation, collection);
  const evidenceId = `current-copy-startup-${sha256Json({ operationId: generation.operationId })}`;
  try {
    const call = engine.upstream.callTool;
    const check = (): void => {
      need(engine.upstream.currentAuthenticatedBridgeDispatchBinding === scopeReader && canonicalJson(scopeReader.call(engine.upstream)) === scopeText &&
        engine.upstream.callTool === call && assertCurrentProjectOnlySymbolCopyGeneration(generation, engine, scopeText) === source);
    };
    await revalidateCurrentProjectOnlySymbolCopyGeneration(generation, engine, scopeText); check();
    const baseline = source.baseline, plan = baseline.preparation, premises = baseline.startupPremises;
    assertCurrentSymbolCopyPlanInventory(plan, baseline.inventory);
    need(premises.sqlSchemaSupported && premises.databaseVersion === "25.10.31.1" && premises.targetPcbSuppliesNonzeroNativeCount &&
      premises.blockers.every(entry => entry === "active-schematic-pages"));
    const history = await readNativeHistoryCheckpoint({ checkpointPath: baseline.checkpoint.checkpoint, expectedSha256: baseline.checkpoint.checkpointSha256,
      projectUuid: plan.source.projectUuid, libraryAtomHeaders: "preserve", documentRecordHistory: "preserve" }); check();
    need(history.semanticSha256 === premises.historySemanticSha256 && history.semanticSha256 === plan.beforeRecordsSha256 &&
      history.projectUuid === plan.source.projectUuid && history.branchUuid === plan.source.branchUuid && history.projectOwnerUuid === plan.ownerUuid &&
      plan.beforeCheckpointSha256 === baseline.copy.sha256 && plan.beforeSqlSha256 === baseline.inventory.logicalSha256);
    const initial = source.originalPreparation.checkpointPreparation, matches = history.documents.filter(entry => entry.uuid === plan.source.symbolUuid);
    const document = matches[0];
    need(matches.length === 1 && document?.docType === "SYMBOL" && document.semanticSha256 === initial.sourceDocumentSemanticSha256 &&
      sha256Json(document.metadata) === initial.sourceDocumentHeaderSha256 && document.documentRecordHistory?.chainSha256 === initial.sourceDocumentRecordsSha256 &&
      canonicalJson(plan.sourceMetadata) === canonicalJson(initial.sourceMetadata) && canonicalJson(initial.target) === canonicalJson({ ...plan.source, ownerUuid: plan.ownerUuid }));
    const expectation = selectCurrentSymbolStartupExpectation(history);
    need(expectation.sheetUuids.length === premises.activeSchematicPages);
    // A copy emits a new symbol, not an update to this source. Its presence in
    // Direct component references is therefore not the metadata writer's
    // SYMBOL.ON_UPDATE propagation case. Full copied-source checks remain.
    const fingerprint = source.source.expectedFingerprint;
    assertExpectedFingerprint(fingerprint); validateSdkLocalRuntimeFingerprint(fingerprint);
    const assetsRoot = fingerprint.installedBundles.assetsRoot;
    await verifyCurrentProjectOnlySymbolPreflightImplementation(assetsRoot); check();
    await verifyCurrentSymbolPersistenceImplementation(assetsRoot); check();
    await engine.assertBridgeDispatchAllowed(); check();
    const target = { projectUuid: history.projectUuid, branchUuid: history.branchUuid };
    const code = buildCurrentSymbolStartupObservation(target, expectation);
    const intent = await writePhaseArtifact(evidenceId, 0, "startup-intent", { target, expectation, codeSha256: sha256Text(code),
      baselineSha256: sha256Json(baseline), copyPlanSha256: sha256Json(plan), sourceDocumentSemanticSha256: document.semanticSha256,
      sourceDocumentRecordsSha256: initial.sourceDocumentRecordsSha256, captureSha256: sha256Json(source.capture), executionAuthorized: false });
    collection.intentArtifact = Object.freeze(intent); check();
    await readExactUtf8Artifact(intent); check();
    const raw = await call.call(engine.upstream, "easyeda_execute", { code, timeoutMs: 15_000, confirmWrite: true }, 25_000);
    collection.raw = raw;
    collection.resultPublicationAttempted = true;
    const resultArtifact = await writePhaseArtifact(evidenceId, 0, "startup-result", { raw }); collection.resultArtifact = Object.freeze(resultArtifact); check();
    decodeCurrentSymbolStartupObservation(raw, target, expectation);
    await verifyCurrentProjectOnlySymbolPreflightImplementation(assetsRoot); check();
    await verifyCurrentSymbolPersistenceImplementation(assetsRoot); check();
    await revalidateCurrentProjectOnlySymbolCopyGeneration(generation, engine, scopeText); check();
    const token: CurrentSymbolCopyStartup = Object.freeze({ profile: "private.current-symbol-copy-startup.v1", operationId: generation.operationId,
      expectation, baselineSha256: sha256Json(baseline), copyPlanSha256: sha256Json(plan), sourceDocumentSemanticSha256: document.semanticSha256,
      startupLocalChangesExcluded: true, runtimeHoldersObserved: true, liveSourceInvarianceVerified: false,
      crossInvocationReceiverContinuityVerified: false, globalIdleVerified: false, persistenceVerified: false, executionAuthorized: false });
    issued.set(token, Object.freeze({ engine, generation, source, expectation, text: canonicalJson(token), resultArtifact })); return token;
  } catch (error) {
    collection.failureObserved = true;
    if (collection.intentArtifact !== undefined && !collection.resultPublicationAttempted) {
      collection.resultPublicationAttempted = true;
      try { collection.resultArtifact = Object.freeze(await writePhaseArtifact(evidenceId, 0, "startup-result", currentSymbolCopyStartupCollectionEvidence(generation, engine))); }
      catch (retentionError) { throw new AggregateError([error, retentionError], "Current copy startup failed and partial evidence publication failed; original attempt is retained.", { cause: retentionError }); }
    }
    throw error;
  }
}
