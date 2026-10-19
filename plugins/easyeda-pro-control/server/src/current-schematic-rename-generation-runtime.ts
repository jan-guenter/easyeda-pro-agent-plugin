/** Original SCH generation stage for the separate disposable rename lifecycle.
 * Only the initial SCH closure can transfer ownership into this continuation.
 */
/* oxlint-disable import/max-dependencies -- Compose original SCH/Windows ownership and fixed document-neutral observation leaves, never symbol owner conversions or caller callbacks. */
import { z } from "zod";
import { loadOperation, updateOperation, writePhaseArtifact } from "./artifacts.ts";
import { assertExpectedFingerprint, assertSubset, canonicalJson, isRecord, sha256Json } from "./core.ts";
import { assertCurrentSchematicRenameOpeningOwner } from "./current-disposable-open-runtime.ts";
import type { CurrentDisposableOpenGenerationSource } from "./current-disposable-open-runtime.ts";
import { verifyCurrentDisposableOpenImplementation, verifyCurrentProjectOnlyOpenImplementation } from "./current-disposable-open-profile.ts";
import { claimCurrentSchematicRenameClosedContinuation } from "./current-schematic-rename-baseline-runtime.ts";
import type { CurrentSchematicRenameClosedContinuation, CurrentSchematicRenameClosedContinuationSource } from "./current-schematic-rename-baseline-runtime.ts";
import { assertOriginalCurrentSchematicRenameBaseline, revalidateCurrentSchematicRenameBaseline } from "./current-schematic-rename-owner-baseline.ts";
import type { CurrentSchematicRenameBaseline } from "./current-schematic-rename-owner-baseline.ts";
import { CURRENT_SCHEMATIC_OPERATION_PURPOSE } from "./current-schematic-operation.ts";
import { assertCurrentSchematicOpeningExpectation } from "./current-schematic-operation-startup.ts";
import { verifyCurrentSchematicRenamePreopenSource } from "./current-schematic-rename-preopen-source.ts";
import type { CurrentSchematicRenamePreopenSourceObservation } from "./current-schematic-rename-preopen-source.ts";
import { CURRENT_PROJECT_ONLY_OPEN_TIMEOUT_MS, buildCurrentProjectOnlyOpenProgram, decodeCurrentProjectOnlyOpenReply } from "./current-project-only-open.ts";
import { assessCurrentStartupPremises } from "./current-startup-premises.ts";
// These checks validate exact journal transitions and carry no symbol ownership.
import { assertCurrentSymbolCacheClear, assertCurrentSymbolCacheMark } from "./current-symbol-cache-journal.ts";
import { CURRENT_UPLOAD_QUEUE_TIMEOUT_MS, buildCurrentUploadQueueReadProgram, decodeCurrentUploadQueueReadReply } from "./current-upload-queue-read.ts";
import type { ClosedSessionAuthorityCapture, EasyedaControlEngine, TrackedDispatchOperationJournal } from "./engine.ts";
import type { MachineProfile } from "./machine-profile.ts";
import { assertOriginalRecordedOrdinaryTermination } from "./ordinary-launch.ts";
import { validateSdkLocalRuntimeFingerprint } from "./sdk-local-runtime.ts";
import { assertCurrentClosedSessionCopyAuthority, assertCurrentClosedSessionTerminationObservation, assertCurrentIssuedWindowsClockObservation, assertIssuedWindowsClockObservation } from "./windows-authority.ts";
import type { ClosedSessionCloseIntent, ClosedSessionCloseReceipt, ClosedSessionTerminationProof, IssuedWindowsClockObservation, WindowsAuthorityLaunch } from "./windows-authority.ts";
import type { WindowsControlRuntime } from "./windows-runtime.ts";
import { assertWindowsRuntimeValidator } from "./windows-runtime-validator.ts";

type Value = Record<string, unknown>;
type Journal = TrackedDispatchOperationJournal;
type Binding = Omit<Parameters<WindowsControlRuntime["prepareClosedSessionClose"]>[0], "windowHandle">;
const CACHE_PHASE = "current-schematic-rename-inactive-caches", OPEN_PHASE = "current-schematic-rename-project-only-open";
const sessionSchema = z.object({ sessionId: z.string().regex(/^[A-Za-z0-9_-]{43}$/u), sequence: z.number().int().positive(),
  authenticationReceiptSha256: z.string().regex(/^[a-f0-9]{64}$/u), authenticatedAtEpochMs: z.number().int().positive() }).strict();
const closedSchema = sessionSchema.extend({ closedAtEpochMs: z.number().int().positive(), closeReason: z.string().min(1).max(160) }).strict();
export interface CurrentProjectOnlySchematicRenameGeneration {
  readonly profile: "private.current-project-only-schematic-rename-generation.v1";
  readonly operationId: string;
}
export interface CurrentProjectOnlySchematicRenameGenerationSource {
  readonly source: CurrentDisposableOpenGenerationSource;
  readonly baseline: CurrentSchematicRenameBaseline;
  readonly capture: ClosedSessionAuthorityCapture;
  readonly launch: WindowsAuthorityLaunch;
  readonly launchClock: IssuedWindowsClockObservation;
  readonly captureClock: IssuedWindowsClockObservation;
  readonly cacheClock: IssuedWindowsClockObservation;
  readonly projectOpenClock: IssuedWindowsClockObservation;
  readonly cacheObservation: Readonly<Value>;
  readonly projectOpenObservation: Readonly<Value>;
  readonly preopenSource: CurrentSchematicRenamePreopenSourceObservation;
}
interface Slot {
  readonly closed: CurrentSchematicRenameClosedContinuationSource; readonly journal: Journal;
  journalText: string; current: (scopeText?: string) => void;
  launchAttempted: boolean;
  launch?: WindowsAuthorityLaunch; launchClock?: IssuedWindowsClockObservation;
  releaseAttempted: boolean; priorReleased: boolean; admissionAttempted: boolean; captureAttempted: boolean; admitted: boolean;
  capture?: ClosedSessionAuthorityCapture; captureClock?: IssuedWindowsClockObservation; source?: CurrentDisposableOpenGenerationSource;
  cacheAttempted: boolean; cacheReplyRetained: boolean; cacheRaw?: unknown; cacheObservation?: Readonly<Value>; cacheClock?: IssuedWindowsClockObservation;
  openAttempted: boolean; openReplyRetained: boolean; openRaw?: unknown; openObservation?: Readonly<Value>; openClock?: IssuedWindowsClockObservation;
  preopen?: CurrentSchematicRenamePreopenSourceObservation; generation?: CurrentProjectOnlySchematicRenameGeneration;
  writerTransfer?: CurrentSchematicRenameWriterOwner; writerOwnershipInvalidated: boolean;
  finishing: boolean; closeAttempted: boolean; closeAcknowledged: boolean; closeIntent?: ClosedSessionCloseIntent;
  closeReceipt?: ClosedSessionCloseReceipt; proof?: ClosedSessionTerminationProof; finishReleaseAttempted: boolean; retired: boolean;
}
const generations = new WeakMap<object, { readonly value: CurrentProjectOnlySchematicRenameGenerationSource;
  readonly current: (scopeText?: string) => void; readonly evidence: (scopeText?: string) => void;
  readonly revalidate: (scopeText?: string) => Promise<void>; readonly transfer: () => CurrentSchematicRenameWriterOwner;
  readonly retainedWriter: () => CurrentSchematicRenameWriterOwner | undefined }>();
export interface CurrentSchematicRenameWriterOwner {
  readonly profile: "private.current-schematic-rename-writer-owner.v1";
  readonly operationId: string;
}
export interface CurrentSchematicRenameWriterOwnerSource {
  readonly generation: CurrentProjectOnlySchematicRenameGeneration;
  readonly original: CurrentProjectOnlySchematicRenameGenerationSource;
  readonly journal: TrackedDispatchOperationJournal;
  readonly sqlRuntime: MachineProfile["runtime"];
  readonly current: (scopeText?: string) => void;
  readonly beginFinish: () => void;
  /** Invalidation only. The caller must first retain original terminal proof
   * and finish capture cleanup; this method proves neither and writes nothing.
   */
  readonly retire: () => void;
}
const writerOwners = new WeakMap<object, { readonly engine: EasyedaControlEngine; readonly source: CurrentSchematicRenameWriterOwnerSource }>();
function need(condition: boolean, message: string): asserts condition { if (!condition) { throw new Error(`Current SCH generation: ${message}`); } }
export function assertCurrentProjectOnlySchematicRenameGeneration(value: unknown, engine: EasyedaControlEngine,
  scopeText?: string): CurrentProjectOnlySchematicRenameGenerationSource {
  need(value !== null && typeof value === "object", "original generation is missing");
  const issued = generations.get(value); need(issued !== undefined && issued.value.source.engine === engine, "generation was not issued by this engine");
  issued.current(scopeText); return issued.value;
}
export async function revalidateCurrentProjectOnlySchematicRenameGeneration(value: unknown, engine: EasyedaControlEngine,
  scopeText?: string): Promise<CurrentProjectOnlySchematicRenameGenerationSource> {
  const original = assertCurrentProjectOnlySchematicRenameGeneration(value, engine, scopeText);
  need(value !== null && typeof value === "object", "original generation is missing");
  const issued = generations.get(value); need(issued !== undefined, "generation issuer was lost"); await issued.revalidate(scopeText);
  need(assertCurrentProjectOnlySchematicRenameGeneration(value, engine, scopeText) === original, "generation changed"); return original;
}
/** Historical observations may be checked by the same original active writer.
 * This does not permit a new collector, another transfer or a finished owner.
 */
export function assertOriginalCurrentSchematicRenameGenerationEvidence(value: unknown, engine: EasyedaControlEngine,
  scopeText?: string): CurrentProjectOnlySchematicRenameGenerationSource {
  need(value !== null && typeof value === "object", "original generation evidence is missing");
  const issued = generations.get(value); need(issued !== undefined && issued.value.source.engine === engine, "generation evidence issuer differs");
  issued.evidence(scopeText); return issued.value;
}
export function transferCurrentProjectOnlySchematicRenameGeneration(value: CurrentProjectOnlySchematicRenameGeneration,
  engine: EasyedaControlEngine): CurrentSchematicRenameWriterOwner {
  assertCurrentProjectOnlySchematicRenameGeneration(value, engine);
  const issued = generations.get(value); need(issued !== undefined, "original generation transfer was lost"); return issued.transfer();
}
export function assertCurrentSchematicRenameWriterOwner(value: unknown, engine: EasyedaControlEngine,
  scopeText?: string): CurrentSchematicRenameWriterOwnerSource {
  need(value !== null && typeof value === "object", "original SCH writer owner is absent");
  const issued = writerOwners.get(value); need(issued !== undefined && issued.engine === engine, "original SCH writer owner issuer differs");
  issued.source.current(scopeText); return issued.source;
}
/** Recovery lookup only: no owner issuance, renewal or live assertion. A writer
 * must retain this token before trying its fallible source/cleanup checks.
 */
export function retainedCurrentSchematicRenameWriterOwner(value: CurrentProjectOnlySchematicRenameGeneration,
  engine: EasyedaControlEngine): CurrentSchematicRenameWriterOwner | undefined {
  const issued = generations.get(value); need(issued !== undefined && issued.value.source.engine === engine, "original writer lookup generation differs");
  return issued.retainedWriter();
}
function methods(engine: EasyedaControlEngine, runtime: WindowsControlRuntime): readonly unknown[] {
  /* oxlint-disable typescript/unbound-method -- Retain method identities only; all calls keep the original receiver. */
  return [runtime.launch, runtime.status, runtime.clockObservationForLaunch, runtime.releaseCapture, runtime.normalClose, runtime.observeLaunchTermination,
    runtime.observeApplicationWindow, runtime.prepareClosedSessionClose, runtime.requestClosedSessionNormalClose, runtime.probeClosedSessionTermination,
    engine.captureClosedSessionAuthority, engine.releaseClosedSessionAuthority, engine.clockObservationForClosedCapture, engine.runtimeIdentity,
    engine.status, engine.assertBridgeAndRecoveryAdmission, engine.assertRecoveryOperationIsolated, engine.assertBridgeDispatchAllowed,
    engine.dispatchWithOrphanTracking, engine.markOrphanedCallRisk, engine.clearOrphanedCallRisk, engine.clockObservationForTrackedDispatch,
    engine.upstream.withAuthenticatedBridgeDispatchScope, engine.upstream.callTool, engine.upstream.assertClosedAuthenticatedBridgeDispatchReleased];
  /* oxlint-enable typescript/unbound-method */
}
function binding(capture: ClosedSessionAuthorityCapture): Binding {
  return { operationId: capture.operationId, phase: capture.phase, challengeAttempt: capture.challengeAttempt,
    bridgeSession: capture.bridgeSession, runtimeIdentity: capture.runtimeIdentity, executionAuthority: capture.executionAuthority };
}
function summary(slot: Slot): Value {
  return { operationId: slot.journal.operationId, state: slot.journal.state, launchAttempted: slot.launchAttempted, launchRetained: slot.launch !== undefined,
    previousCaptureReleased: slot.priorReleased, admissionAttempted: slot.admissionAttempted, admissionCaptureRetained: slot.capture !== undefined,
    captureAcquisitionCleanupUncertain: slot.captureAttempted && slot.capture === undefined,
    admitted: slot.admitted, cacheAttempted: slot.cacheAttempted, cacheReplyRetained: slot.cacheReplyRetained,
    cachesObserved: slot.cacheObservation !== undefined, projectOpenAttempted: slot.openAttempted,
    projectOpenReplyRetained: slot.openReplyRetained, generationIssued: slot.generation !== undefined,
    closeAttempted: slot.closeAttempted, closeAcknowledged: slot.closeAcknowledged, terminationProved: slot.proof !== undefined,
    releaseAttempted: slot.releaseAttempted, finishReleaseAttempted: slot.finishReleaseAttempted,
    finishObservationAvailable: slot.writerTransfer === undefined && slot.finishing && slot.launch !== undefined &&
      (slot.capture === undefined ? slot.closeAttempted : slot.closeAcknowledged) && !slot.finishReleaseAttempted && !slot.retired,
    closedBaselineRetirementAvailable: slot.writerTransfer === undefined && !slot.launchAttempted && slot.launch === undefined &&
      slot.journal.state === "stopped" && !slot.releaseAttempted && !slot.retired,
    cleanupCloseAvailable: slot.writerTransfer === undefined && slot.launch !== undefined && !slot.closeAttempted && !slot.retired,
    retired: slot.retired, artifacts: slot.journal.artifacts, nextSafeAction: slot.journal.nextSafeAction,
    writerOwnershipTransferred: slot.writerTransfer !== undefined, writerOwnershipInvalidated: slot.writerOwnershipInvalidated,
    startupQualified: false, producerBindingVerified: false, openingEffectsVerified: false, writerAuthority: false,
    executionAuthorized: false, explicitSaveDispatched: false, replayAllowed: false };
}

export class CurrentSchematicRenameGenerationCoordinator {
  private readonly engine: EasyedaControlEngine;
  private readonly runtime: WindowsControlRuntime;
  private readonly slots = new Map<string, Slot>();
  private busy = false;
  public constructor(engine: EasyedaControlEngine, runtime: WindowsControlRuntime) { this.engine = engine; this.runtime = runtime; }
  private async unchanged(slot: Slot, scopeText?: string): Promise<void> {
    need(this.slots.get(slot.journal.operationId) === slot, "original slot changed");
    slot.current(scopeText); const persisted = await loadOperation(slot.journal.operationId); slot.current(scopeText);
    need(canonicalJson(persisted) === slot.journalText && canonicalJson(slot.journal) === slot.journalText, "journal changed");
  }
  private static async record(slot: Slot, phase: string, value: unknown): Promise<void> {
    slot.journal.sequence += 1; slot.journal.artifacts.push(await writePhaseArtifact(slot.journal.operationId, slot.journal.sequence, phase, value));
    slot.journal.updatedAt = new Date().toISOString(); await updateOperation(slot.journal); slot.journalText = canonicalJson(slot.journal);
  }
  private static async fail(slot: Slot, phase: string, error: unknown): Promise<never> {
    slot.journal.state = "stopped"; slot.journal.hardStop = true;
    slot.journal.nextSafeAction = "Retain this facade and original handles. Inspect retained evidence; only original-owner cleanup may continue. Never replay launch, capture, navigation or Save.";
    try {
      const persisted = await loadOperation(slot.journal.operationId);
      if (canonicalJson(persisted) === slot.journalText) {
        await CurrentSchematicRenameGenerationCoordinator.record(slot, "generation-stopped", { phase, launch: slot.launch ?? null,
          capture: slot.capture ?? null, cacheRaw: slot.cacheRaw ?? null, projectOpenRaw: slot.openRaw ?? null,
          closeIntent: slot.closeIntent ?? null, closeReceipt: slot.closeReceipt ?? null, proof: slot.proof ?? null,
          previousCaptureReleased: slot.priorReleased, replayAllowed: false, executionAuthorized: false });
      }
    } catch (recordError) { throw new AggregateError([error, recordError], "SCH generation failed and failure publication failed.", { cause: recordError }); }
    throw error;
  }
  private async captureCurrent(slot: Slot, scopeText?: string): Promise<void> {
    await this.unchanged(slot, scopeText); need(slot.capture !== undefined && slot.captureClock !== undefined, "original admission capture is absent");
    const clock = await this.engine.clockObservationForClosedCapture(slot.capture); await this.unchanged(slot, scopeText);
    need(clock === slot.captureClock && await assertIssuedWindowsClockObservation(clock) === clock, "admission capture clock changed");
    await this.unchanged(slot, scopeText);
  }

  public async relaunch(continuation: CurrentSchematicRenameClosedContinuation): Promise<Value> {
    need(!this.busy && !this.slots.has(continuation.operationId), "replacement launch attempt already exists"); this.busy = true;
    let slot: Slot | undefined;
    try {
      const closed = await claimCurrentSchematicRenameClosedContinuation(continuation, this.engine, this.runtime), { original, baseline, capture, proof, journal } = closed;
      const entry: Slot = { closed, journal, journalText: canonicalJson(journal), current: (): void => {
        need(this.slots.get(continuation.operationId) === entry && !entry.retired && original.source.runtime === this.runtime,
          "original closed recipient changed");
        assertOriginalCurrentSchematicRenameBaseline(baseline, this.engine); assertCurrentClosedSessionCopyAuthority(proof);
      }, launchAttempted: false, releaseAttempted: false, priorReleased: false, admissionAttempted: false, captureAttempted: false, admitted: false,
      cacheAttempted: false, cacheReplyRetained: false, openAttempted: false, openReplyRetained: false,
      writerOwnershipInvalidated: false,
      finishing: false, closeAttempted: false, closeAcknowledged: false, finishReleaseAttempted: false, retired: false };
      // Retain the transferred original before lifecycle readers, projections or
      // Validators can throw. Failed prelaunch setup remains cleanup-only.
      slot = entry; this.slots.set(continuation.operationId, entry);
      const source = original.source;
      const prior = source.launchProjection, priorSession = source.bridgeSession;
      const upstream = this.engine.upstream, validator = this.engine.executionAuthorityValidator;
      const lifecycleReader = upstream.bridgeSessionLifecycle, scopeReader = upstream.currentAuthenticatedBridgeDispatchBinding;
      need(lifecycleReader !== undefined && scopeReader !== undefined, "original lifecycle readers are unavailable");
      const pinned = methods(this.engine, this.runtime), priorText = canonicalJson(prior);
      const sourceProjection = (): unknown => ({ target: source.target, expectedFingerprint: source.expectedFingerprint,
        preNavigationCheckpoint: source.preNavigationCheckpoint, bridgeSession: source.bridgeSession });
      const sourceText = canonicalJson(sourceProjection());
      const initial = lifecycleReader.call(upstream); need(isRecord(initial), "gateway lifecycle is absent");
      const endpointText = canonicalJson(initial["publicEndpoint"]);
      let replacementText: string | undefined;
      const infrastructure = (launched: boolean, scopeText?: string): void => {
        need(this.engine.upstream === upstream && this.engine.executionAuthorityValidator === validator &&
          upstream.bridgeSessionLifecycle === lifecycleReader && upstream.currentAuthenticatedBridgeDispatchBinding === scopeReader &&
          methods(this.engine, this.runtime).every((method, index) => method === pinned[index]) && this.slots.get(continuation.operationId) === entry &&
          canonicalJson(sourceProjection()) === sourceText && canonicalJson(source.launchProjection) === priorText && !entry.retired,
        "original infrastructure changed or retired");
        assertWindowsRuntimeValidator(validator, this.runtime); assertOriginalCurrentSchematicRenameBaseline(baseline, this.engine);
        const scope = scopeReader.call(upstream);
        need(scopeText === undefined ? scope === undefined : scope !== undefined && canonicalJson(scope) === scopeText, "dispatch scope changed");
        const lifecycle = lifecycleReader.call(upstream);
        need(isRecord(lifecycle) && lifecycle["schema"] === "easyeda-pro-control.authenticated-bridge-lifecycle.v1" &&
          lifecycle["gatewayInstanceId"] === priorSession.gatewayInstanceId && canonicalJson(lifecycle["publicEndpoint"]) === endpointText &&
          Array.isArray(lifecycle["recentClosedSessions"]), "gateway changed");
        const ended = lifecycle["recentClosedSessions"].filter((item: unknown) => isRecord(item) && item["sessionId"] === priorSession.sessionId);
        need(ended.length === 1, "original disconnected session is absent");
        const old = closedSchema.parse(ended[0]), { closeReason: _oldReason, closedAtEpochMs: oldClosed, ...identity } = old;
        const { gatewayInstanceId: _gateway, ...expected } = priorSession;
        need(canonicalJson(identity) === canonicalJson(expected) && oldClosed >= priorSession.authenticatedAtEpochMs, "original disconnected session differs");
        const active = lifecycle["activeSession"];
        if (!launched) { need(active === null, "launch requires a disconnected bridge"); }
        else if (active !== null) {
          const selected = sessionSchema.parse(active); need(selected.sequence > priorSession.sequence && selected.sessionId !== priorSession.sessionId, "replacement session is invalid");
          replacementText ??= canonicalJson(selected); need(canonicalJson(selected) === replacementText, "replacement session changed");
        } else if (replacementText !== undefined) {
          need(entry.finishing, "replacement session disconnected before cleanup");
          const selected = sessionSchema.parse(JSON.parse(replacementText) as unknown);
          const matches = lifecycle["recentClosedSessions"].filter((item: unknown) => isRecord(item) && item["sessionId"] === selected.sessionId);
          need(matches.length === 1, "replacement closed session is absent");
          const closedSession = closedSchema.parse(matches[0]), { closeReason: _reason, closedAtEpochMs, ...closedIdentity } = closedSession;
          need(canonicalJson(closedIdentity) === replacementText && closedAtEpochMs >= selected.authenticatedAtEpochMs, "replacement closed session changed");
        }
        if (scope !== undefined) {
          need(launched && replacementText !== undefined, "scoped replacement ownership is absent");
          const selected = sessionSchema.parse(JSON.parse(replacementText) as unknown);
          need(scope.gatewayInstanceId === priorSession.gatewayInstanceId && scope.sessionId === selected.sessionId && scope.sessionSequence === selected.sequence,
            "dispatch scope belongs to another replacement session");
        }
      };
      entry.current = (): void => {
        infrastructure(false); need(canonicalJson(this.runtime.status().launch) === priorText, "original launch changed"); assertCurrentClosedSessionCopyAuthority(proof);
      };
      await this.unchanged(entry); await revalidateCurrentSchematicRenameBaseline(baseline, this.engine); await this.unchanged(entry);
      const ordinary = await assertOriginalRecordedOrdinaryTermination(this.runtime, prior); await this.unchanged(entry);
      journal.state = "relaunch-dispatching"; journal.hardStop = true;
      await CurrentSchematicRenameGenerationCoordinator.record(entry, "schematic-relaunch-intent", { proof, ordinaryTermination: ordinary,
        baselineCopyReceiptSha256: baseline.copy.receiptSha256, executionAuthorized: false }); await this.unchanged(entry);
      await revalidateCurrentSchematicRenameBaseline(baseline, this.engine); await this.unchanged(entry);
      await assertOriginalRecordedOrdinaryTermination(this.runtime, prior); await this.unchanged(entry);
      // This call invalidates the original proof epoch. Never use the old owner
      // Or live proof again, including in fallible post-launch publication.
      entry.launchAttempted = true;
      const launch = await this.runtime.launch(); entry.launch = launch;
      const launchText = canonicalJson(launch);
      entry.current = (scopeText?: string): void => {
        infrastructure(true, scopeText); const status = this.runtime.status();
        need(status.state === "owned" && canonicalJson(status.launch) === launchText && canonicalJson(launch) === launchText &&
          launch.helperInstance === prior.helperInstance && launch.jobId !== prior.jobId && launch.root.startIdentity !== prior.root.startIdentity,
        "original replacement launch changed");
      };
      await this.unchanged(entry);
      await CurrentSchematicRenameGenerationCoordinator.record(entry, "schematic-relaunch-result", { launch, admissionProved: false }); await this.unchanged(entry);
      entry.launchClock = await this.runtime.clockObservationForLaunch(launch); await this.unchanged(entry);
      need(await assertIssuedWindowsClockObservation(entry.launchClock) === entry.launchClock, "original launch clock changed"); await this.unchanged(entry);
      entry.releaseAttempted = true;
      await CurrentSchematicRenameGenerationCoordinator.record(entry, "schematic-prior-release-intent", { captureSha256: sha256Json(capture) }); await this.unchanged(entry);
      await this.engine.releaseClosedSessionAuthority(capture); entry.priorReleased = true; await this.unchanged(entry);
      journal.state = "relaunched"; journal.nextSafeAction = "Admit only this replacement session. Do not relaunch, open a document, Save or write.";
      await CurrentSchematicRenameGenerationCoordinator.record(entry, "schematic-prior-release-result", { previousCaptureReleased: true }); await this.unchanged(entry);
      return summary(entry);
    } catch (error) { if (slot !== undefined) { return await CurrentSchematicRenameGenerationCoordinator.fail(slot, "relaunch", error); } throw error; }
    finally { this.busy = false; }
  }

  public async admit(operationId: string): Promise<Value> {
    const slot = this.slots.get(operationId);
    need(!this.busy && slot !== undefined && slot.journal.state === "relaunched" && slot.priorReleased && slot.launch !== undefined &&
      slot.launchClock !== undefined && !slot.admissionAttempted, "original unused admission is unavailable"); this.busy = true;
    try {
      await this.unchanged(slot);
      const reader = this.engine.upstream.bridgeSessionLifecycle, scope = this.engine.upstream.withAuthenticatedBridgeDispatchScope;
      need(reader !== undefined && scope !== undefined, "admission lifecycle/scope is absent");
      const lifecycle = reader.call(this.engine.upstream); need(isRecord(lifecycle), "admission lifecycle is absent");
      if (lifecycle["activeSession"] === null) { return { ...summary(slot), authentication: "pending" }; }
      slot.admissionAttempted = true;
      const selected = sessionSchema.parse(lifecycle["activeSession"]), session = { ...selected, gatewayInstanceId: slot.closed.original.source.bridgeSession.gatewayInstanceId };
      const launch = slot.launch;
      await this.engine.assertBridgeAndRecoveryAdmission(operationId); await this.unchanged(slot);
      slot.journal.state = "admission-dispatching";
      await CurrentSchematicRenameGenerationCoordinator.record(slot, "schematic-admission-intent", { session, launch }); await this.unchanged(slot);
      let completed = false;
      await scope.call(this.engine.upstream, async dispatch => {
        const scopeText = canonicalJson(dispatch); await this.unchanged(slot, scopeText);
        need(dispatch.gatewayInstanceId === session.gatewayInstanceId && dispatch.sessionId === session.sessionId && dispatch.sessionSequence === session.sequence,
          "admission scope differs from selected session");
        slot.captureAttempted = true;
        const capture = await this.engine.captureClosedSessionAuthority(operationId, "closed-edit", 1); slot.capture = capture;
        await this.unchanged(slot, scopeText);
        need(capture.operationId === operationId && capture.phase === "closed-edit" && capture.challengeAttempt === 1 &&
          canonicalJson(capture.bridgeSession) === canonicalJson(session), "admission capture identity differs");
        const roots = capture.executionAuthority.processes.filter(process => process.role === "easyeda-main");
        need(roots.length === 1 && canonicalJson(roots[0]) === canonicalJson(launch.root) &&
          capture.executionAuthority.processes.every(process => process.startIdentity.endsWith(`:job:${launch.jobId}`)), "admission captured another Job/root");
        const identity = await this.engine.runtimeIdentity(dispatch); await this.unchanged(slot, scopeText);
        need(canonicalJson(identity) === canonicalJson(capture.runtimeIdentity), "admission runtime identity differs");
        slot.captureClock = await this.engine.clockObservationForClosedCapture(capture); await this.captureCurrent(slot, scopeText);
        await CurrentSchematicRenameGenerationCoordinator.record(slot, "schematic-admission-capture", { capture, captureClock: slot.captureClock });
        await this.captureCurrent(slot, scopeText); completed = true;
      });
      need(completed && slot.capture !== undefined, "admission scope did not complete"); await this.captureCurrent(slot);
      slot.source = Object.freeze({ ...slot.closed.original.source, launchProjection: launch, bridgeSession: slot.capture.bridgeSession });
      slot.journal.state = "admitted"; slot.journal.nextSafeAction = "Observe inactive caches on this original session; no editor opening or writer authority.";
      await CurrentSchematicRenameGenerationCoordinator.record(slot, "schematic-admission-result", { admitted: true, startupQualified: false }); await this.captureCurrent(slot);
      slot.admitted = true; return summary(slot);
    } catch (error) { return await CurrentSchematicRenameGenerationCoordinator.fail(slot, "admission", error); }
    finally { this.busy = false; }
  }

  public observeCaches(operationId: string): Promise<Value> { return this.observe(operationId, false, false); }
  public openProject(operationId: string, acceptUnqualifiedSchematicStartupEffects: unknown = false): Promise<Value> {
    need(typeof acceptUnqualifiedSchematicStartupEffects === "boolean", "opening-effect acknowledgement must be boolean");
    return this.observe(operationId, true, acceptUnqualifiedSchematicStartupEffects);
  }
  private async observe(operationId: string, open: boolean, acceptEffects: boolean): Promise<Value> {
    const slot = this.slots.get(operationId);
    need(!this.busy && slot !== undefined && slot.admitted && slot.source !== undefined && slot.capture !== undefined && slot.launch !== undefined &&
      (open ? slot.journal.state === "caches-observed" && slot.cacheObservation !== undefined && !slot.openAttempted :
        slot.journal.state === "admitted" && !slot.cacheAttempted), "original unused observation is unavailable");
    this.busy = true;
    const { source, capture, launch } = slot, baseline = slot.closed.baseline;
    try {
      await this.captureCurrent(slot);
      const ordinary = source.purpose === CURRENT_SCHEMATIC_OPERATION_PURPOSE;
      if (ordinary) {
        need(!acceptEffects, "ordinary SCH opening cannot accept unqualified startup effects");
        assertCurrentSchematicOpeningExpectation(source.schematicExpectation, baseline.metadata, baseline.children);
        need(canonicalJson(source.startupExpectation) === canonicalJson(baseline.children.startupInput), "ordinary startup expectation changed");
      }
      // Startup needs the initial PCB as its nonzero native-count witness;
      // The intended SCH target is separately bound by the original baseline.
      const premises = open ? await assessCurrentStartupPremises({ inventory: baseline.inventory, sourceSha256: baseline.copy.sha256,
        checkpointSha256: baseline.copy.sha256, history: baseline.history, target: baseline.intent.target, documentUuid: source.target.documentUuid }) : undefined;
      await this.captureCurrent(slot);
      need(premises === undefined || premises.historicalSubsetSatisfied || ((ordinary || acceptEffects) && premises.activeSchematicPages > 0 &&
        premises.blockers.length === 1 && premises.blockers[0] === "active-schematic-pages"), "startup prerequisites require unsupported opening effects");
      if (open) { slot.openAttempted = true; } else { slot.cacheAttempted = true; }
      await this.engine.assertBridgeAndRecoveryAdmission(operationId); await this.captureCurrent(slot);
      const target = { ...source.target, expectedSourceSha256: baseline.copy.sha256 };
      const cacheTarget = { projectUuid: target.projectUuid, branchUuid: target.branchUuid };
      const phase = open ? OPEN_PHASE : CACHE_PHASE, timeout = open ? CURRENT_PROJECT_ONLY_OPEN_TIMEOUT_MS : CURRENT_UPLOAD_QUEUE_TIMEOUT_MS;
      const code = open ? buildCurrentProjectOnlyOpenProgram(target) : buildCurrentUploadQueueReadProgram(cacheTarget);
      const verify = open ? verifyCurrentProjectOnlyOpenImplementation : verifyCurrentDisposableOpenImplementation;
      const scope = this.engine.upstream.withAuthenticatedBridgeDispatchScope; need(scope !== undefined, "observation scope is absent");
      let completed = false;
      await scope.call(this.engine.upstream, async dispatch => {
        const scopeText = canonicalJson(dispatch); await this.captureCurrent(slot, scopeText);
        need(dispatch.gatewayInstanceId === capture.bridgeSession.gatewayInstanceId && dispatch.sessionId === capture.bridgeSession.sessionId &&
          dispatch.sessionSequence === capture.bridgeSession.sequence, "observation scope differs");
        const status = await this.engine.status(); await this.captureCurrent(slot, scopeText);
        const fingerprint = structuredClone(status.stableFingerprint);
        validateSdkLocalRuntimeFingerprint(fingerprint); assertExpectedFingerprint(fingerprint); assertSubset(fingerprint, source.expectedFingerprint, "SCH generation runtime");
        await verify(fingerprint.installedBundles.assetsRoot); await this.captureCurrent(slot, scopeText);
        if (open) { slot.preopen = await verifyCurrentSchematicRenamePreopenSource(this.engine, baseline); await this.captureCurrent(slot, scopeText); }
        slot.journal.state = open ? "project-only-dispatching" : "cache-dispatching";
        if (open) { slot.journal.mutationMayHaveOccurred = true; }
        await CurrentSchematicRenameGenerationCoordinator.record(slot, `${phase}-intent`, { target, programSha256: sha256Json({ code }),
          preopenSource: slot.preopen ?? null, startupPremises: premises ?? null, unqualifiedSchematicStartupEffectsAccepted: open && acceptEffects,
          ordinarySchematicStartupExpectation: ordinary ? source.schematicExpectation : null,
          startupQualified: false, executionAuthorized: false }); await this.captureCurrent(slot, scopeText);
        const before = structuredClone(slot.journal); let marked: Journal | undefined;
        await this.engine.dispatchWithOrphanTracking(slot.journal, phase, "easyeda_execute", { code, timeoutMs: timeout + (open ? 0 : 5000), confirmWrite: true },
          timeout + 15_000, async () => {
            slot.current(scopeText); assertCurrentSymbolCacheMark(before, slot.journal, { phase, bridgeDispatch: dispatch, capture, launch });
            const text = canonicalJson(slot.journal);
            const persisted = await loadOperation(operationId); slot.current(scopeText);
            need(canonicalJson(persisted) === text && canonicalJson(slot.journal) === text, "tracked mark changed");
            slot.journalText = text; marked = structuredClone(slot.journal);
            const clock = await this.engine.clockObservationForTrackedDispatch(slot.journal, phase);
            if (open) { slot.openClock = clock; } else { slot.cacheClock = clock; }
            await this.captureCurrent(slot, scopeText); need(await assertIssuedWindowsClockObservation(clock) === clock, "tracked dispatch clock changed");
            await this.captureCurrent(slot, scopeText); await this.engine.assertRecoveryOperationIsolated(operationId); await this.captureCurrent(slot, scopeText);
            if (open) { slot.preopen = await verifyCurrentSchematicRenamePreopenSource(this.engine, baseline); await this.captureCurrent(slot, scopeText); }
          }, async raw => {
            // Preserve the actual settled result even when decoding or ownership fails.
            if (open) { slot.openRaw = raw; slot.openReplyRetained = true; } else { slot.cacheRaw = raw; slot.cacheReplyRetained = true; }
            await this.captureCurrent(slot, scopeText);
            if (open) { slot.openObservation = decodeCurrentProjectOnlyOpenReply(raw, target); }
            else { slot.cacheObservation = decodeCurrentUploadQueueReadReply(raw, cacheTarget); }
            await this.captureCurrent(slot, scopeText);
          }, async () => { need(marked !== undefined, "unaccepted mark cannot be cleared"); await this.captureCurrent(slot, scopeText); });
        slot.current(scopeText); need(marked !== undefined, "tracked dispatch did not retain its original mark");
        assertCurrentSymbolCacheClear(marked, slot.journal, phase);
        const cleared = canonicalJson(slot.journal), persisted = await loadOperation(operationId); slot.current(scopeText);
        need(canonicalJson(persisted) === cleared && canonicalJson(slot.journal) === cleared, "tracked clear changed"); slot.journalText = cleared;
        await this.captureCurrent(slot, scopeText); await this.engine.assertBridgeDispatchAllowed(); await this.captureCurrent(slot, scopeText);
        await verify(fingerprint.installedBundles.assetsRoot); await this.captureCurrent(slot, scopeText);
        const final = await this.engine.status(); await this.captureCurrent(slot, scopeText);
        validateSdkLocalRuntimeFingerprint(final.stableFingerprint);
        need(canonicalJson(final.stableFingerprint) === canonicalJson(fingerprint), "runtime changed around observation"); completed = true;
      });
      need(completed, "observation scope did not complete"); await this.captureCurrent(slot);
      slot.journal.state = open ? "project-only-opened" : "caches-observed";
      slot.journal.nextSafeAction = open ? "Original SCH generation retained. Startup, actor/clock and writer qualification are separate; no edit or Save is authorized." :
        "Point-in-time inactive caches observed. One separately checked project-only open remains; no editor or writer authority.";
      await CurrentSchematicRenameGenerationCoordinator.record(slot, `${phase}-result`, { observation: open ? slot.openObservation : slot.cacheObservation,
        dispatchClock: open ? slot.openClock : slot.cacheClock, preopenSource: slot.preopen ?? null, startupQualified: false, executionAuthorized: false });
      await this.captureCurrent(slot); if (open) { this.issue(slot); } return summary(slot);
    } catch (error) { return await CurrentSchematicRenameGenerationCoordinator.fail(slot, open ? "project-only-open" : "inactive-caches", error); }
    finally { this.busy = false; }
  }

  private issue(slot: Slot): void {
    need(slot.source !== undefined && slot.capture !== undefined && slot.launch !== undefined && slot.launchClock !== undefined && slot.captureClock !== undefined &&
      slot.cacheClock !== undefined && slot.openClock !== undefined && slot.cacheObservation !== undefined && slot.openObservation !== undefined && slot.preopen !== undefined,
    "original complete generation evidence is absent");
    const token: CurrentProjectOnlySchematicRenameGeneration = Object.freeze({ profile: "private.current-project-only-schematic-rename-generation.v1", operationId: slot.journal.operationId });
    const value = Object.freeze({ source: slot.source, baseline: slot.closed.baseline, capture: slot.capture, launch: slot.launch, launchClock: slot.launchClock,
      captureClock: slot.captureClock, cacheClock: slot.cacheClock, projectOpenClock: slot.openClock, cacheObservation: slot.cacheObservation,
      projectOpenObservation: slot.openObservation, preopenSource: slot.preopen });
    const journalText = slot.journalText, text = canonicalJson({ ...value, source: { ...value.source, engine: null, runtime: null } });
    const current = (scopeText?: string): void => {
      slot.current(scopeText);
      need(slot.generation === token && slot.writerTransfer === undefined && !slot.finishing && !slot.closeAttempted && !slot.retired && slot.journal.state === "project-only-opened" &&
        !slot.journal.orphanedCallPossible && slot.journalText === journalText && canonicalJson(slot.journal) === journalText &&
        canonicalJson({ ...value, source: { ...value.source, engine: null, runtime: null } }) === text, "generation changed, stopped or retired");
      assertCurrentIssuedWindowsClockObservation(value.launchClock); assertCurrentIssuedWindowsClockObservation(value.captureClock);
    };
    const transfer = (): CurrentSchematicRenameWriterOwner => {
      current(); need(!this.busy && slot.writerTransfer === undefined, "writer transfer is busy or already consumed");
      const owner: CurrentSchematicRenameWriterOwner = Object.freeze({ profile: "private.current-schematic-rename-writer-owner.v1", operationId: token.operationId });
      const originalCurrent = slot.current;
      const transferredCurrent = (scopeText?: string): void => {
        need(this.slots.get(token.operationId) === slot && slot.writerTransfer === owner && slot.generation === token &&
          !slot.writerOwnershipInvalidated && !slot.retired && slot.current === originalCurrent &&
          slot.capture === value.capture && slot.launch === value.launch && slot.closed.baseline === value.baseline &&
          canonicalJson({ ...value, source: { ...value.source, engine: null, runtime: null } }) === text,
        "SCH writer original ownership changed or was invalidated");
        originalCurrent(scopeText); assertOriginalCurrentSchematicRenameBaseline(value.baseline, this.engine);
      };
      const source: CurrentSchematicRenameWriterOwnerSource = Object.freeze({ generation: token, original: value,
        journal: slot.journal, sqlRuntime: Object.freeze(structuredClone(slot.closed.sqlRuntime)), current: transferredCurrent,
        beginFinish: (): void => {
          transferredCurrent(); need(!slot.finishing && !slot.closeAttempted, "writer finishing is already consumed");
          slot.finishing = true;
        }, retire: (): void => {
          transferredCurrent(); need(slot.finishing, "writer ownership cannot be invalidated before finishing begins");
          slot.writerOwnershipInvalidated = true;
        } });
      // Retain both issuer and recipient before the fallible final current check.
      // No failed publication or transfer return can restore generation access.
      writerOwners.set(owner, { engine: this.engine, source }); slot.writerTransfer = owner;
      transferredCurrent(); return owner;
    };
    const evidence = (scopeText?: string): void => {
      if (slot.writerTransfer === undefined) { current(scopeText); return; }
      need(!slot.finishing && !slot.writerOwnershipInvalidated, "finished writer cannot revive generation evidence");
      const original = assertCurrentSchematicRenameWriterOwner(slot.writerTransfer, this.engine, scopeText);
      need(original.generation === token && original.original === value, "writer generation evidence changed");
    };
    generations.set(token, { value, current, evidence, transfer, retainedWriter: (): CurrentSchematicRenameWriterOwner | undefined => slot.writerTransfer,
      revalidate: async (scopeText?: string): Promise<void> => {
      current(scopeText); await this.captureCurrent(slot, scopeText); current(scopeText);
      for (const clock of [value.launchClock, value.captureClock, value.cacheClock, value.projectOpenClock]) {
        need(await assertIssuedWindowsClockObservation(clock) === clock, "generation original clock changed"); current(scopeText);
      }
      await this.unchanged(slot, scopeText); current(scopeText);
    } }); slot.generation = token; current();
  }
  public generation(operationId: string): CurrentProjectOnlySchematicRenameGeneration {
    const slot = this.slots.get(operationId); need(!this.busy && slot?.generation !== undefined, "original generation is unavailable");
    assertCurrentProjectOnlySchematicRenameGeneration(slot.generation, this.engine); return slot.generation;
  }
  /** Cleanup recovery lookup only: this retains the exact token even if the
   * transfer's final current check threw. The owner assertion remains mandatory.
   */
  public retainedWriterOwner(operationId: string): CurrentSchematicRenameWriterOwner {
    const slot = this.slots.get(operationId); need(!this.busy && slot?.writerTransfer !== undefined, "retained original writer owner is absent");
    return slot.writerTransfer;
  }

  /** Retire a transferred closed baseline when setup failed before dispatching
   * any replacement launch. No extra close, capture, source change or retry.
   */
  public async retireClosedBaseline(operationId: string): Promise<Value> {
    const slot = this.slots.get(operationId);
    need(!this.busy && slot !== undefined && slot.writerTransfer === undefined && !slot.launchAttempted && slot.launch === undefined && slot.journal.state === "stopped" &&
      !slot.releaseAttempted && !slot.retired, "original held closed baseline is unavailable"); this.busy = true;
    try {
      await this.unchanged(slot); await revalidateCurrentSchematicRenameBaseline(slot.closed.baseline, this.engine); await this.unchanged(slot);
      assertCurrentClosedSessionCopyAuthority(slot.closed.proof);
      const pinned = methods(this.engine, this.runtime), upstream = this.engine.upstream;
      const scopeReader = upstream.currentAuthenticatedBridgeDispatchBinding;
      need(scopeReader !== undefined, "held cleanup lost its ended-scope reader");
      const historicalCurrent = (): void => {
        need(this.slots.get(operationId) === slot && !slot.retired && this.engine.upstream === upstream &&
          upstream.currentAuthenticatedBridgeDispatchBinding === scopeReader && scopeReader.call(upstream) === undefined &&
          methods(this.engine, this.runtime).every((method, index) => method === pinned[index]) &&
          assertCurrentSchematicRenameOpeningOwner(slot.closed.baseline.owner, this.engine) === slot.closed.original,
        "held cleanup original owner, runtime methods or ended scope changed");
        assertOriginalCurrentSchematicRenameBaseline(slot.closed.baseline, this.engine);
      };
      historicalCurrent();
      slot.releaseAttempted = true;
      await CurrentSchematicRenameGenerationCoordinator.record(slot, "schematic-held-closure-retirement", { proof: slot.closed.proof,
        captureSha256: sha256Json(slot.closed.capture), launchDispatched: false, durableEffects: "unknown" });
      await this.unchanged(slot); assertCurrentClosedSessionCopyAuthority(slot.closed.proof);
      // The release invalidates this proof epoch. Preserve its journal first;
      // No further original proof assertion is valid after acknowledgement.
      await this.engine.releaseClosedSessionAuthority(slot.closed.capture); slot.priorReleased = true;
      slot.current = historicalCurrent; await this.unchanged(slot);
      slot.journal.state = "plan-invalidated"; slot.journal.hardStop = false;
      slot.journal.nextSafeAction = "Transferred closed SCH baseline retired before replacement launch. No write or persistence verification was inferred.";
      await CurrentSchematicRenameGenerationCoordinator.record(slot, "schematic-held-closure-retired", { captureReleased: true, executionAuthorized: false });
      await this.unchanged(slot);
      slot.retired = true; return summary(slot);
    } catch (error) { return await CurrentSchematicRenameGenerationCoordinator.fail(slot, "held-closure-retirement", error); }
    finally { this.busy = false; }
  }

  /** Available even after capture/admission/publication failure. Exact original
   * native ownership is mandatory; no lost owner, Save/Discard or close replay.
   */
  public async finishNormalClose(operationId: string, confirmNormalClose: unknown): Promise<Value> {
    const slot = this.slots.get(operationId);
    need(confirmNormalClose === true && !this.busy && slot !== undefined && slot.writerTransfer === undefined && slot.launch !== undefined && !slot.closeAttempted && !slot.retired,
      "cleanup requires an acknowledged original launch and unused close"); this.busy = true; slot.closeAttempted = true;
    try {
      await this.unchanged(slot); await this.engine.assertRecoveryOperationIsolated(operationId); await this.unchanged(slot);
      const window = await this.runtime.observeApplicationWindow(); await this.unchanged(slot);
      need(window.outcome === "available" && window.hwnd !== null && window.jobId === slot.launch.jobId && window.helperInstance === slot.launch.helperInstance,
        "cleanup lacks its original launch window");
      if (slot.capture === undefined) { need(!slot.journal.orphanedCallPossible, "uncaptured cleanup cannot adopt tracked dispatch authority"); } else {
        slot.closeIntent = await this.runtime.prepareClosedSessionClose({ ...binding(slot.capture), windowHandle: window.hwnd }); await this.unchanged(slot);
      }
      slot.journal.state = "finish-close-dispatching"; slot.journal.hardStop = true;
      await CurrentSchematicRenameGenerationCoordinator.record(slot, "schematic-finish-close-intent", { launch: slot.launch, closeIntent: slot.closeIntent ?? null,
        captureRetained: slot.capture !== undefined, acceptUnknownFileEffects: true }); await this.unchanged(slot);
      slot.finishing = true;
      if (slot.capture === undefined) { await this.runtime.normalClose(window.hwnd); } else {
        need(slot.closeIntent !== undefined, "cleanup close intent is absent");
        slot.closeReceipt = await this.runtime.requestClosedSessionNormalClose({ ...binding(slot.capture), intent: slot.closeIntent, confirmNormalClose: true });
      }
      slot.closeAcknowledged = true; await this.unchanged(slot);
      slot.journal.state = "awaiting-finish-termination";
      await CurrentSchematicRenameGenerationCoordinator.record(slot, "schematic-finish-close-result", { closeReceipt: slot.closeReceipt ?? null,
        closeAcknowledged: true, terminationProved: false }); await this.unchanged(slot); return summary(slot);
    } catch (error) { return await CurrentSchematicRenameGenerationCoordinator.fail(slot, "cleanup-close", error); }
    finally { this.busy = false; }
  }
  public async observeFinish(operationId: string): Promise<Value> {
    const slot = this.slots.get(operationId);
    need(!this.busy && slot !== undefined && slot.writerTransfer === undefined && slot.finishing &&
      (slot.capture === undefined ? slot.closeAttempted : slot.closeAcknowledged) && slot.launch !== undefined &&
      !slot.finishReleaseAttempted && !slot.retired, "cleanup observation requires its retained close acknowledgement"); this.busy = true;
    try {
      await this.unchanged(slot);
      if (slot.capture === undefined) {
        const observed = await this.runtime.observeLaunchTermination(); await this.unchanged(slot);
        need(observed.jobId === slot.launch.jobId && observed.helperInstance === slot.launch.helperInstance, "cleanup observed another launch");
        if (!observed.terminated) { return { ...summary(slot), termination: "pending" }; }
      } else {
        need(slot.closeIntent !== undefined && slot.closeReceipt !== undefined, "cleanup original close evidence is absent");
        const observed = await this.runtime.probeClosedSessionTermination({ ...binding(slot.capture), intent: slot.closeIntent, closeReceipt: slot.closeReceipt });
        if (observed.status === "terminated") { slot.proof = observed.proof; }
        assertCurrentClosedSessionTerminationObservation(observed); await this.unchanged(slot);
        if (observed.status === "pending") { return { ...summary(slot), termination: "pending" }; }
        assertCurrentClosedSessionCopyAuthority(observed.proof);
      }
      const lifecycle = this.engine.upstream.bridgeSessionLifecycle?.(); need(isRecord(lifecycle) && lifecycle["activeSession"] === null, "cleanup session is not closed");
      const journal = slot.journal;
      const hadOrphan = journal.orphanedCallPossible;
      const authority = journal.executionAuthorityBeforeOrphan, dispatch = journal.bridgeDispatchBeforeOrphan, prior = journal.bridgeSessionBeforeOrphan;
      const closedDispatch = (): void => {
        slot.current(); if (!hadOrphan && authority === undefined && dispatch === undefined && prior === undefined) { return; }
        const reader = this.engine.upstream.assertClosedAuthenticatedBridgeDispatchReleased;
        need(slot.capture !== undefined && authority !== undefined && dispatch !== undefined && prior !== undefined && reader !== undefined &&
          canonicalJson(prior) === canonicalJson(slot.capture.bridgeSession) && authority.processes.some(process => process.role === "easyeda-main" &&
            process.pid === slot.launch?.root.pid && process.startIdentity === slot.launch.root.startIdentity) &&
          authority.processes.every(process => process.startIdentity.endsWith(`:job:${slot.launch?.jobId}`)), "cleanup lacks original tracked authority");
        const closed = closedSchema.parse(reader.call(this.engine.upstream, dispatch, prior));
        const { closeReason: _reason, closedAtEpochMs, ...identity } = closed, { gatewayInstanceId: _gateway, ...expected } = prior;
        need(canonicalJson(identity) === canonicalJson(expected) && closedAtEpochMs >= prior.authenticatedAtEpochMs, "tracked dispatch was not exactly released");
      };
      closedDispatch(); await this.engine.assertRecoveryOperationIsolated(operationId); await this.unchanged(slot); closedDispatch();
      await CurrentSchematicRenameGenerationCoordinator.record(slot, "schematic-finish-retirement-proof", { launch: slot.launch, proof: slot.proof ?? null,
        closeReceipt: slot.closeReceipt ?? null, priorOrphan: hadOrphan, durableEffects: "unknown", executionAuthorized: false });
      await this.unchanged(slot); closedDispatch(); slot.finishReleaseAttempted = true;
      await CurrentSchematicRenameGenerationCoordinator.record(slot, "schematic-finish-release-intent", { capture: slot.capture ?? null, trackedAuthority: hadOrphan ? authority : null });
      await this.unchanged(slot); closedDispatch();
      if (hadOrphan) { need(authority !== undefined, "tracked authority is absent"); await this.runtime.releaseCapture(authority); await this.unchanged(slot); closedDispatch(); }
      if (slot.capture !== undefined) { await this.engine.releaseClosedSessionAuthority(slot.capture); await this.unchanged(slot); closedDispatch(); }
      if (!slot.priorReleased && !slot.releaseAttempted) {
        slot.releaseAttempted = true;
        await CurrentSchematicRenameGenerationCoordinator.record(slot, "schematic-original-capture-cleanup-intent", { captureSha256: sha256Json(slot.closed.capture) });
        await this.unchanged(slot); closedDispatch();
        await this.engine.releaseClosedSessionAuthority(slot.closed.capture); slot.priorReleased = true; await this.unchanged(slot); closedDispatch();
      }
      // An old release that failed is not retried: preserve its handles and
      // Report partial cleanup rather than invent successful retirement.
      need(slot.priorReleased, "original prelaunch capture release was not acknowledged; retain remaining handles");
      const terminal = { ...journal, state: "plan-invalidated", hardStop: false, orphanedCallPossible: false,
        result: { retired: true, durableEffects: "unknown", executionAuthorized: false }, updatedAt: new Date().toISOString(),
        nextSafeAction: "Original SCH generation normally closed and retired without replay. File effects remain unverified; no writer authority was issued." };
      delete terminal.runtimeRestartChallenge; delete terminal.runtimeRestartChallengeIssuedAt;
      await updateOperation(terminal); slot.current(); closedDispatch(); Object.assign(journal, terminal);
      delete journal.runtimeRestartChallenge; delete journal.runtimeRestartChallengeIssuedAt;
      slot.journalText = canonicalJson(journal); await this.unchanged(slot); slot.retired = true; return summary(slot);
    } catch (error) { return await CurrentSchematicRenameGenerationCoordinator.fail(slot, "cleanup-termination", error); }
    finally { this.busy = false; }
  }
  public inspect(operationId: string): Value {
    const slot = this.slots.get(operationId); need(!this.busy && slot !== undefined, "original operation is unavailable or running"); return summary(slot);
  }
}

