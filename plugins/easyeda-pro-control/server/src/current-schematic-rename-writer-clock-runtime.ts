/** Private SCH writer-clock collector. It owns one fixed N0 dispatch, not a
 * rename. Original raw replies and Windows brackets survive failed checks.
 * Its retained dispatch mark belongs to the writer coordinator through the
 * post-write clock; collection alone proves no backend or saved result.
 */
/* oxlint-disable import/max-dependencies -- Bind SCH-owned generation/startup/clock issuers to maintained journal transitions; no PCB ownership or injectable production callbacks. */
import { loadOperation, updateOperation, writePhaseArtifact } from "./artifacts.ts";
import type { ArtifactDescriptor } from "./artifacts.ts";
import { CURRENT_SCHEMATIC_OPERATION_PURPOSE } from "./current-schematic-operation.ts";
import { assertExpectedFingerprint, assertUpstreamReplySettled, canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { qualifyCurrentSchematicAgedSqlHead } from "./current-schematic-aged-sql-issuer.ts";
import type { OriginalCurrentSchematicAgedSqlClock } from "./current-schematic-aged-sql-issuer.ts";
import { verifyCurrentProjectOnlySymbolPreflightImplementation, verifyCurrentSymbolPersistenceImplementation } from "./current-disposable-open-profile.ts";
import { assertOriginalCurrentSchematicRenameClock, prepareCurrentSchematicRenameClock } from "./current-schematic-rename-clock.ts";
import type { CurrentSchematicRenameClockPlan, CurrentSchematicRenameDocumentClockSample } from "./current-schematic-rename-clock.ts";
import { assertCurrentSchematicRenameWriterOwner } from "./current-schematic-rename-generation-runtime.ts";
import type { CurrentSchematicRenameWriterOwner, CurrentSchematicRenameWriterOwnerSource } from "./current-schematic-rename-generation-runtime.ts";
import { assertOriginalCurrentSchematicRenameStartup, revalidateCurrentSchematicRenameStartupObservation } from "./current-schematic-rename-startup-runtime.ts";
import type { CurrentSchematicRenameStartupObservation } from "./current-schematic-rename-startup-runtime.ts";
import { buildCurrentSchematicRenameWriterClockProgram, decodeCurrentSchematicRenameWriterClockReply } from "./current-schematic-rename-writer-clock-program.ts";
import { assertCurrentSymbolCacheClear, assertCurrentSymbolCacheMark } from "./current-symbol-cache-journal.ts";
import type { EasyedaControlEngine, TrackedDispatchOperationJournal } from "./engine.ts";
import { validateSdkLocalRuntimeFingerprint } from "./sdk-local-runtime.ts";
import type { IssuedWindowsClockObservation } from "./windows-authority.ts";

export const CURRENT_SCHEMATIC_RENAME_WRITER_DISPATCH_PHASE = "current-schematic-rename-writer-once";
const PHASE = CURRENT_SCHEMATIC_RENAME_WRITER_DISPATCH_PHASE;
const LIMITATIONS = Object.freeze({ mutationDispatched: false, explicitSaveDispatched: false, backendActorVerified: false,
  producerBindingVerified: false, startupQualified: false, schematicSubscriberCompletionVerified: false,
  generationClosureVerified: false, persistentUploadReplayExcluded: false, reopened: false, writerReady: false, executionAuthorized: false } as const);
type Journal = TrackedDispatchOperationJournal;
type Dispatch = Awaited<ReturnType<EasyedaControlEngine["markOrphanedCallRisk"]>>;
interface Collection {
  readonly engine: EasyedaControlEngine; readonly owner: CurrentSchematicRenameWriterOwner;
  readonly startup: CurrentSchematicRenameStartupObservation; readonly source: CurrentSchematicRenameWriterOwnerSource;
  readonly upstream: EasyedaControlEngine["upstream"]; readonly methods: readonly unknown[];
  readonly artifacts: Map<string, ArtifactDescriptor>; journalText: string;
  dispatchAttempted: boolean; failureObserved: boolean; cleanupUncertain: boolean;
  beforeClock?: IssuedWindowsClockObservation; armedClock?: IssuedWindowsClockObservation;
  raw?: unknown; documentBefore?: CurrentSchematicRenameDocumentClockSample; clockPlan?: CurrentSchematicRenameClockPlan;
  token?: CurrentSchematicRenameWriterClockObservation;
  dispatch?: Dispatch;
}
export interface CurrentSchematicRenameWriterClockObservation extends Readonly<typeof LIMITATIONS> {
  readonly profile: "private.current-schematic-rename-writer-clock-observation.v1";
  readonly operationId: string; readonly clockPlanSha256: string; readonly rawReplySha256: string;
  readonly originalDispatchRetained: true; readonly documentSampleProvenanceVerified: true;
  readonly originalWindowsObservationsRetained: true;
}
export interface CurrentSchematicRenameWriterClockSource {
  readonly owner: CurrentSchematicRenameWriterOwner; readonly startup: CurrentSchematicRenameStartupObservation;
  readonly source: CurrentSchematicRenameWriterOwnerSource; readonly clockPlan: CurrentSchematicRenameClockPlan;
  readonly raw: unknown; readonly documentBefore: CurrentSchematicRenameDocumentClockSample;
  readonly beforeClock: IssuedWindowsClockObservation; readonly armedClock: IssuedWindowsClockObservation;
  readonly journalText: string;
  readonly dispatch: Dispatch;
}
const attempts = new WeakMap<CurrentSchematicRenameWriterOwner, Collection>();
const issued = new WeakMap<CurrentSchematicRenameWriterClockObservation, Readonly<{
  collection: Collection; source: CurrentSchematicRenameWriterClockSource; text: string;
}>>();
function need(value: boolean, message = "Current SCH writer clock collection refused."): asserts value {
  if (!value) { throw new Error(message); }
}
function methods(engine: EasyedaControlEngine): readonly unknown[] {
  /* oxlint-disable typescript/unbound-method -- Identity capture only; calls preserve the original engine/upstream receiver. */
  return [engine.markOrphanedCallRisk, engine.clearOrphanedCallRisk, engine.freshClockObservationForClosedCapture,
    engine.assertBridgeDispatchAllowed, engine.assertRecoveryOperationIsolated, engine.upstream.callTool,
    engine.upstream.currentAuthenticatedBridgeDispatchBinding];
  /* oxlint-enable typescript/unbound-method */
}
function current(collection: Collection, scopeText?: string): void {
  const { engine, owner, source } = collection;
  need(attempts.get(owner) === collection && engine.upstream === collection.upstream &&
    methods(engine).every((method, index) => method === collection.methods[index]) &&
    assertCurrentSchematicRenameWriterOwner(owner, engine, scopeText) === source);
  need(assertOriginalCurrentSchematicRenameStartup(collection.startup, engine, source.generation).source === source.original);
}
async function unchanged(collection: Collection, scopeText: string): Promise<void> {
  current(collection, scopeText);
  const disk = await loadOperation(collection.owner.operationId); current(collection, scopeText);
  need(canonicalJson(disk) === collection.journalText && canonicalJson(collection.source.journal) === collection.journalText,
    "Current SCH writer clock journal changed.");
}
async function record(collection: Collection, phase: string, value: unknown, scopeText: string): Promise<void> {
  await unchanged(collection, scopeText); const journal = collection.source.journal;
  const sequence = journal.sequence + 1;
  const artifact = await writePhaseArtifact(collection.owner.operationId, sequence, phase, value);
  // Retain the exclusive artifact even if a later owner or journal check fails.
  collection.artifacts.set(phase, Object.freeze(artifact)); current(collection, scopeText);
  journal.sequence = sequence; journal.artifacts.push(artifact); journal.updatedAt = new Date().toISOString();
  await updateOperation(journal); current(collection, scopeText);
  collection.journalText = canonicalJson(journal); await unchanged(collection, scopeText);
}
async function acceptMark(collection: Collection, before: Journal, scopeText: string): Promise<Journal> {
  current(collection, scopeText); const { source, engine } = collection;
  const lease = engine.upstream.currentAuthenticatedBridgeDispatchBinding?.(); need(lease !== undefined);
  assertCurrentSymbolCacheMark(before, source.journal, { phase: PHASE, bridgeDispatch: lease,
    capture: source.original.capture, launch: source.original.launch });
  const text = canonicalJson(source.journal); const disk = await loadOperation(collection.owner.operationId); current(collection, scopeText);
  need(canonicalJson(disk) === text && canonicalJson(source.journal) === text, "Current SCH writer clock marked journal changed.");
  collection.journalText = text; return structuredClone(source.journal);
}
async function acceptClear(collection: Collection, marked: Journal, scopeText: string): Promise<void> {
  current(collection, scopeText); assertCurrentSymbolCacheClear(marked, collection.source.journal, PHASE);
  const text = canonicalJson(collection.source.journal); const disk = await loadOperation(collection.owner.operationId); current(collection, scopeText);
  need(canonicalJson(disk) === text && canonicalJson(collection.source.journal) === text, "Current SCH writer clock cleared journal changed.");
  collection.journalText = text;
}
async function retainEngineFailure(collection: Collection, marked: Journal | undefined, scopeText: string): Promise<void> {
  current(collection, scopeText);
  if (canonicalJson(collection.source.journal) === collection.journalText) { await unchanged(collection, scopeText); return; }
  need(marked !== undefined, "Current SCH writer clock has no retained engine mark.");
  await acceptClear(collection, marked, scopeText);
  // A durable clear can precede a failed native capture release. Do not infer
  // Cleanup or retry that release from its cleared journal alone.
  collection.cleanupUncertain = true;
}

/** Diagnostic evidence remains available after owner drift. It cannot revive
 * a token or authorize a new collection, mutation, cleanup or rebind.
 */
export function currentSchematicRenameWriterClockEvidence(owner: CurrentSchematicRenameWriterOwner,
  engine: EasyedaControlEngine): Readonly<Record<string, unknown>> | undefined {
  const collection = attempts.get(owner); if (collection === undefined) { return undefined; } need(collection.engine === engine);
  return Object.freeze({ profile: "private.current-schematic-rename-writer-clock-evidence.v1", operationId: owner.operationId,
    dispatchAttempted: collection.dispatchAttempted, attemptConsumed: true, failureObserved: collection.failureObserved,
    dispatchCaptureCleanupUncertain: collection.cleanupUncertain, rawRetained: Object.hasOwn(collection, "raw"), raw: collection.raw ?? null,
    beforeClock: collection.beforeClock ?? null, armedClock: collection.armedClock ?? null, documentBefore: collection.documentBefore ?? null,
    clockPlan: collection.clockPlan ?? null, artifacts: [...collection.artifacts.values()], observationIssued: collection.token !== undefined,
    replayAllowed: false, ...LIMITATIONS });
}

/** Hand off only this collector's last checked journal transition. The writer
 * still re-reads that exact disk journal before recording or normal closure.
 * Failure evidence never grants a clock token or a repeated dispatch.
 */
export function retainedCurrentSchematicRenameWriterClockJournal(owner: CurrentSchematicRenameWriterOwner,
  engine: EasyedaControlEngine): Readonly<{ journalText: string; cleanupUncertain: boolean }> | undefined {
  const collection = attempts.get(owner); if (collection === undefined) { return undefined; } need(collection.engine === engine);
  const scope = engine.upstream.currentAuthenticatedBridgeDispatchBinding?.(); current(collection, scope === undefined ? undefined : canonicalJson(scope));
  need(canonicalJson(collection.source.journal) === collection.journalText, "SCH clock retained journal publication is incomplete.");
  return Object.freeze({ journalText: collection.journalText, cleanupUncertain: collection.cleanupUncertain });
}

/** The caller must already own this original SCH transfer and authenticated
 * scope. Its mark deliberately stays held through the rename/post clocks:
 * releasing or acquiring a capture would invalidate these clock epochs.
 * This collector neither transfers the generation nor closes it.
 */
export async function collectCurrentSchematicRenameWriterClock(engine: EasyedaControlEngine, owner: CurrentSchematicRenameWriterOwner,
  startup: CurrentSchematicRenameStartupObservation, agedHead?: OriginalCurrentSchematicAgedSqlClock): Promise<CurrentSchematicRenameWriterClockObservation> {
  const scope = engine.upstream.currentAuthenticatedBridgeDispatchBinding?.(); need(scope !== undefined);
  const scopeText = canonicalJson(scope), source = assertCurrentSchematicRenameWriterOwner(owner, engine, scopeText);
  const originalStartup = assertOriginalCurrentSchematicRenameStartup(startup, engine, source.generation);
  need(originalStartup.source === source.original && (source.original.source.purpose === "disposable-validation" ||
    source.original.source.purpose === CURRENT_SCHEMATIC_OPERATION_PURPOSE));
  need(!attempts.has(owner), "Current SCH writer clock attempt already consumed.");
  const collection: Collection = { engine, owner, startup, source, upstream: engine.upstream, methods: methods(engine),
    journalText: canonicalJson(source.journal), artifacts: new Map(), dispatchAttempted: false, failureObserved: false, cleanupUncertain: false };
  attempts.set(owner, collection);
  try {
    await unchanged(collection, scopeText);
    await revalidateCurrentSchematicRenameStartupObservation(startup, engine, source.generation); current(collection, scopeText);
    const fingerprint = source.original.source.expectedFingerprint;
    assertExpectedFingerprint(fingerprint); validateSdkLocalRuntimeFingerprint(fingerprint);
    await verifyCurrentProjectOnlySymbolPreflightImplementation(fingerprint.installedBundles.assetsRoot); current(collection, scopeText);
    await verifyCurrentSymbolPersistenceImplementation(fingerprint.installedBundles.assetsRoot); current(collection, scopeText);
    await engine.assertBridgeDispatchAllowed(); current(collection, scopeText);
    await engine.assertRecoveryOperationIsolated(owner.operationId); current(collection, scopeText);
    const request = { target: source.original.baseline.intent.target, expectedActor: originalStartup.observation.runtimeObservation.actor,
      startup: originalStartup.expectation }; const code = buildCurrentSchematicRenameWriterClockProgram(request);
    await record(collection, "schematic-writer-n0-intent", { request, codeSha256: sha256Text(code), replayAllowed: false, ...LIMITATIONS }, scopeText);
    const unmarked = structuredClone(source.journal); let marked: Journal | undefined;
    let dispatch: Dispatch;
    try { dispatch = await engine.markOrphanedCallRisk(source.journal, PHASE, async () => { marked = await acceptMark(collection, unmarked, scopeText); }); }
    catch (error) { await retainEngineFailure(collection, marked, scopeText); throw error; }
    collection.dispatch = Object.freeze(dispatch);
    marked = await acceptMark(collection, unmarked, scopeText); await unchanged(collection, scopeText);
    collection.beforeClock = await engine.freshClockObservationForClosedCapture(source.original.capture); current(collection, scopeText);
    collection.dispatchAttempted = true;
    const raw = await engine.upstream.callTool("easyeda_execute", { code, timeoutMs: 15_000, confirmWrite: true }, 25_000, dispatch.binding);
    collection.raw = raw; current(collection, scopeText);
    // Retain the actual reply before the independently owned trailing clock or
    // Any parser/publication can fail. A failed trailing clock consumes N0.
    collection.armedClock = await engine.freshClockObservationForClosedCapture(source.original.capture); current(collection, scopeText);
    collection.documentBefore = decodeCurrentSchematicRenameWriterClockReply(raw, request);
    const age = agedHead === undefined ? undefined : qualifyCurrentSchematicAgedSqlHead(agedHead, engine, source.generation, collection.beforeClock);
    collection.clockPlan = await prepareCurrentSchematicRenameClock({ engine, generation: source.generation, startup, dispatchOwner: owner,
      beforeClock: collection.beforeClock, armedClock: collection.armedClock, documentBefore: collection.documentBefore,
      ...(age === undefined ? {} : { agedHead: age }) }); current(collection, scopeText);
    assertUpstreamReplySettled(raw);
    await record(collection, "schematic-writer-n0-result", { raw, beforeClock: collection.beforeClock, armedClock: collection.armedClock,
      documentBefore: collection.documentBefore, clockPlan: collection.clockPlan, ...LIMITATIONS }, scopeText);
    await unchanged(collection, scopeText);
    const token: CurrentSchematicRenameWriterClockObservation = Object.freeze({ profile: "private.current-schematic-rename-writer-clock-observation.v1",
      operationId: owner.operationId, clockPlanSha256: sha256Json(collection.clockPlan), rawReplySha256: sha256Json(raw),
      originalDispatchRetained: true, documentSampleProvenanceVerified: true, originalWindowsObservationsRetained: true, ...LIMITATIONS });
    const retained = Object.freeze({ owner, startup, source, clockPlan: collection.clockPlan, raw, documentBefore: collection.documentBefore,
      beforeClock: collection.beforeClock, armedClock: collection.armedClock, journalText: collection.journalText, dispatch: collection.dispatch });
    collection.token = token; issued.set(token, { collection, source: retained, text: canonicalJson(token) }); return token;
  } catch (error) {
    collection.failureObserved = true;
    try { await record(collection, "schematic-writer-n0-failure", currentSchematicRenameWriterClockEvidence(owner, engine), scopeText); }
    catch (retentionError) {
      throw new AggregateError([error, retentionError], "SCH writer clock failed; original attempt and partial evidence remain retained.", { cause: retentionError });
    }
    throw error;
  }
}

export function assertOriginalCurrentSchematicRenameWriterClock(value: CurrentSchematicRenameWriterClockObservation,
  engine: EasyedaControlEngine, owner: CurrentSchematicRenameWriterOwner): CurrentSchematicRenameWriterClockSource {
  const retained = issued.get(value); need(retained !== undefined && retained.collection.engine === engine && retained.collection.owner === owner &&
    retained.collection.token === value && !retained.collection.failureObserved && !retained.collection.cleanupUncertain && canonicalJson(value) === retained.text,
  "Original completed SCH writer clock observation required.");
  const scope = engine.upstream.currentAuthenticatedBridgeDispatchBinding?.(); current(retained.collection, scope === undefined ? undefined : canonicalJson(scope));
  const source = retained.source; const plan = assertOriginalCurrentSchematicRenameClock(source.clockPlan, engine, source.source.generation, source.startup, owner);
  need(plan.writer === source.source && plan.before.token === source.beforeClock && plan.armed.token === source.armedClock &&
    canonicalJson(plan.documentBefore) === canonicalJson(source.documentBefore) && sha256Json(source.raw) === value.rawReplySha256 &&
    source.journalText === retained.collection.journalText && canonicalJson(source.source.journal) === source.journalText &&
    source.dispatch === retained.collection.dispatch && source.source.journal.orphanedCallPossible && source.source.journal.orphanedCallPhase === PHASE);
  return source;
}
