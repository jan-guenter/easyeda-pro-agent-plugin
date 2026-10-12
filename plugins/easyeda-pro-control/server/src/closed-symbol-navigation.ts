/** Internal stage. One same-journal companion open, never a transaction terminalizer. */
import { join } from "node:path";
import { controlDataDirectory, controlRootCapability } from "./artifacts.ts";
import { verifyCheckpoint } from "./checkpoint.ts";
import type { CheckpointReceipt } from "./checkpoint.ts";
import { assertSubset, canonicalJson, extractToolPayload, isRecord, sha256Json, sha256Text, validatePrivateFingerprint } from "./core.ts";
import type { EasyedaControlEngine, ExpectedContext } from "./engine.ts";
import { verifyLibraryNativeProfile } from "./library-native-profile.ts";
import { prepareRecoveryNavigation } from "./recovery-navigation.ts";
import { appendClosedSymbolEvent, loadClosedSymbolJournal } from "./closed-symbol-journal.ts";
import type { ClosedJournal, Generation } from "./closed-symbol-journal.ts";

type Value = Record<string, unknown>;
type OpenPhase = "edit-open" | "verify-open";
type Engine = Pick<EasyedaControlEngine, "assertContext" | "assertBridgeDispatchAllowed" | "assertRecoveryOperationIsolated" | "dispatchWithOrphanTracking" | "executionAuthorityValidator" | "runtimeIdentity" | "upstream"> & {
  readonly status: () => Promise<{ readonly stableFingerprint: Value }>;
};
const services = { verifyCheckpoint, verifyLibraryNativeProfile, prepareRecoveryNavigation };
const attempts = new WeakMap<Engine, Set<string>>();

function requireValue(value: boolean, message: string): asserts value { if (!value) { throw new Error(message); } }

/** The production constructor uses maintained checkpoint/source readers and the
 * actual engine. Test overrides replace those existing I/O boundaries only.
 */
export class ClosedSymbolNavigationStage {
  private readonly engine: Engine;
  private readonly fingerprint: Value;
  private readonly io: typeof services;
  private readonly retainedReturns = new Map<string, unknown>();

  public constructor(engine: Engine, expectedFingerprint: Value, overrides: Partial<typeof services> = {}) {
    this.engine = engine;
    this.fingerprint = structuredClone(expectedFingerprint);
    validatePrivateFingerprint(this.fingerprint);
    this.io = { ...services, ...overrides };
  }

  /** Inspection only. A retained reply never grants another navigation attempt. */
  public originalReturn(operationId: string, phase: OpenPhase): unknown {
    return this.retainedReturns.get(`${operationId}:${phase}`);
  }

  private async admission(journal: ClosedJournal): Promise<string> {
    requireValue(this.engine.executionAuthorityValidator !== undefined, "Closed navigation needs retained process authority.");
    requireValue(this.engine.upstream.currentAuthenticatedBridgeDispatchBinding?.() !== undefined, "Closed navigation requires its outer authenticated scope.");
    requireValue(sha256Json(this.fingerprint) === journal.plan.expectedFingerprintSha256, "Closed navigation fingerprint differs from its sealed plan.");
    await this.engine.assertBridgeDispatchAllowed();
    await this.engine.assertRecoveryOperationIsolated(journal.operationId);
    const status = await this.engine.status();
    assertSubset(status.stableFingerprint, this.fingerprint, "Closed navigation runtime");
    const bundles = await this.engine.upstream.installedEasyedaBundles?.();
    requireValue(bundles !== undefined, "Closed navigation installed implementation is unavailable.");
    await this.io.verifyLibraryNativeProfile(bundles.assetsRoot);
    return bundles.assetsRoot;
  }

  private async unchanged(checkpoint: CheckpointReceipt, source: string): Promise<void> {
    requireValue(checkpoint.source === source, "Closed navigation checkpoint selects another source.");
    const verified = await this.io.verifyCheckpoint(checkpoint.receiptPath, {
      expectedSource: source, artifactRoots: [join(controlDataDirectory(), "checkpoints")], controlRoot: await controlRootCapability(),
    });
    requireValue(verified.ok && verified.sourceMatchesReceipt && verified.checkpointMatchesReceipt && verified.sourceEqualsCheckpoint && !verified.sourceChanged &&
      verified.source === source && verified.checkpoint === checkpoint.checkpoint && verified.receiptPath === checkpoint.receiptPath &&
      verified.checkpointSha256 === checkpoint.checkpointSha256 && verified.sourceSha256 === checkpoint.sourceSha256 &&
      verified.sourceDumpSha256 === checkpoint.sourceDumpSha256 && verified.sourceDumpSha256 === checkpoint.checkpointDumpSha256 &&
      verified.checkpointDumpSha256 === checkpoint.checkpointDumpSha256, "Closed navigation lost its exact unchanged checkpoint.");
  }

  private static dispatchGeneration(journal: ClosedJournal, generation: Generation): void {
    // The engine has just captured these original per-call observations. This
    // Comparison cannot mint or restore the separate closure capture.
    requireValue(sha256Json(journal.bridgeSessionBeforeOrphan) === generation.sessionSha256 &&
      sha256Json(journal.runtimeIdentityBeforeOrphan) === generation.runtimeSha256, "Closed navigation dispatch generation changed.");
    const roots = journal.executionAuthorityBeforeOrphan?.processes.filter((entry) => entry.role === "easyeda-main");
    requireValue(roots?.length === 1 && roots[0]?.pid === generation.rootPid && roots[0].startIdentity === generation.rootStartIdentity &&
      generation.rootStartIdentity.endsWith(`:job:${generation.jobId}`), "Closed navigation retained process differs.");
  }

  private currentSession(journal: ClosedJournal, generation: Generation): void {
    const binding = journal.bridgeDispatchBeforeOrphan, expected = journal.bridgeSessionBeforeOrphan;
    requireValue(binding !== undefined && expected !== undefined, "Closed navigation lacks its dispatch binding.");
    const { gatewayInstanceId, ...activeSession } = expected;
    const current = this.engine.upstream.bridgeSessionLifecycle?.();
    requireValue(isRecord(current) && current["schema"] === "easyeda-pro-control.authenticated-bridge-lifecycle.v1" &&
      current["gatewayInstanceId"] === gatewayInstanceId && canonicalJson(current["activeSession"]) === canonicalJson(activeSession) &&
      canonicalJson(this.engine.upstream.currentAuthenticatedBridgeDispatchBinding?.()) === canonicalJson(binding), "Closed navigation current session changed.");
    ClosedSymbolNavigationStage.dispatchGeneration(journal, generation);
  }

  private async currentGeneration(journal: ClosedJournal, generation: Generation): Promise<void> {
    const binding = journal.bridgeDispatchBeforeOrphan;
    this.currentSession(journal, generation);
    const runtime = await this.engine.runtimeIdentity(binding);
    this.currentSession(journal, generation);
    requireValue(sha256Json(runtime) === generation.runtimeSha256, "Closed navigation current runtime changed.");
  }

  /** Requires a genuine current checkpoint derived by the owning coordinator.
   * It records the native return before fallible orphan-capture release. A later
   * readiness error cannot turn the retained Open into another allowed attempt.
   */
  public async openCompanion(journalInput: ClosedJournal, phase: OpenPhase, generationInput: Generation, checkpointInput: CheckpointReceipt): Promise<Readonly<Value>> {
    requireValue(phase === "edit-open" || phase === "verify-open", "Closed navigation phase refused.");
    let used = attempts.get(this.engine);
    if (used === undefined) { used = new Set(); attempts.set(this.engine, used); }
    const key = `${journalInput.operationId}:${phase}`;
    requireValue(!used.has(key), "Closed navigation attempt already consumed.");
    used.add(key);
    // The caller's mutable object must not redirect an engine journal update
    // While capture awaits. The recorder and engine share this single snapshot.
    // Failed stages retain its durable journal; callers must reload, never retry.
    const callerBinding = canonicalJson(journalInput), journal = structuredClone(journalInput);
    const planBinding = canonicalJson({ operationId: journal.operationId, plan: journal.plan, closedPlanSha256: journal.closedPlanSha256, markerSha256: journal.markerSha256 });
    let rawReturnText: string | undefined;
    const returnedUnchanged = (): void => {
      requireValue(rawReturnText !== undefined && canonicalJson(this.retainedReturns.get(key)) === rawReturnText,
        "Closed navigation settled reply changed; retained evidence requires review.");
    };
    const unchangedWorkingPlan = (): void => {
      requireValue(canonicalJson({ operationId: journal.operationId, plan: journal.plan, closedPlanSha256: journal.closedPlanSha256, markerSha256: journal.markerSha256 }) === planBinding,
        "Closed navigation sealed operation changed.");
    };
    const unchangedPlan = (): void => {
      unchangedWorkingPlan();
      if (rawReturnText !== undefined) { returnedUnchanged(); }
      requireValue(canonicalJson(journalInput) === callerBinding, "Closed navigation caller journal changed.");
    };
    const checkpoint = structuredClone(checkpointInput), generation = structuredClone(generationInput);
    const loaded = await loadClosedSymbolJournal(journal.operationId);
    unchangedPlan();
    requireValue(canonicalJson(loaded.journal) === canonicalJson(journal), "Closed navigation supplied journal is stale.");
    const { activeUuid, projectPath, projectUuid } = journal.plan;
    requireValue(typeof projectUuid === "string" && typeof projectPath === "string" && typeof activeUuid === "string", "Closed navigation plan identity missing.");
    requireValue(generation.ordinal === (phase === "edit-open" ? 1 : 2), "Closed navigation ordinal differs.");
    const context: ExpectedContext = { project: { uuid: projectUuid, path: projectPath }, document: { uuid: activeUuid, documentType: 3 } };
    const assetsRoot = await this.admission(journal);
    unchangedPlan();
    await this.unchanged(checkpoint, projectPath);
    unchangedPlan();
    const prepared = await this.io.prepareRecoveryNavigation({ expectedContext: context, preCheckpoint: checkpoint, assetsRoot,
      libraryAtomHeaders: "preserve", navigation: { navigate: true, requireExclusiveTabs: true, requireEditorReadiness: true } });
    unchangedPlan();
    requireValue(canonicalJson(prepared.target) === canonicalJson({ projectUuid, projectPath, documentUuid: activeUuid, documentType: 3 }) &&
      prepared.checkpointSha256 === checkpoint.checkpointSha256 && prepared.libraryHeaderEvidence?.checkpointSha256 === checkpoint.checkpointSha256 &&
      prepared.libraryHeaderEvidence.projectUuid === projectUuid, "Closed navigation prepared target/checkpoint differs.");
    await this.unchanged(checkpoint, projectPath);
    unchangedPlan();
    const request = { target: prepared.target, context, checkpoint, codeSha256: sha256Text(prepared.code), libraryHeaderEvidence: prepared.libraryHeaderEvidence };
    const requestSha256 = sha256Json(request);
    await appendClosedSymbolEvent(journal, { step: phase, kind: "intent", generation, requestSha256, data: request });
    unchangedPlan();
    const raw = await this.engine.dispatchWithOrphanTracking(journal, phase, "easyeda_execute", {
      code: prepared.code, timeoutMs: 60_000, confirmWrite: true,
    }, 70_000, async () => {
      unchangedPlan();
      ClosedSymbolNavigationStage.dispatchGeneration(journal, generation);
      await this.engine.assertRecoveryOperationIsolated(journal.operationId);
      unchangedPlan();
      await this.unchanged(checkpoint, projectPath);
      unchangedPlan();
      ClosedSymbolNavigationStage.dispatchGeneration(journal, generation);
      await this.currentGeneration(journal, generation);
      unchangedPlan();
    }, async (returned) => {
      // Retain a settled return under its original identity even when a caller
      // Changed its own journal during the native await. Never copy that change.
      this.retainedReturns.set(key, returned);
      rawReturnText = canonicalJson(returned);
      unchangedWorkingPlan();
      await appendClosedSymbolEvent(journal, { step: phase, kind: "result", generation, requestSha256, data: { rawReturn: returned } });
      returnedUnchanged();
    });
    unchangedPlan();
    requireValue(this.retainedReturns.get(key) === raw, "Closed navigation dispatcher returned a different reply object.");
    returnedUnchanged();
    const native = extractToolPayload(raw);
    requireValue(isRecord(native) && native["ok"] === true && native["schema"] === "easyeda-pro-control.recovery-navigation.v1" &&
      Reflect.ownKeys(native).length === 6 && typeof native["openedProject"] === "boolean" && typeof native["openedDocument"] === "boolean" &&
      isRecord(native["project"]) && Reflect.ownKeys(native["project"]).length === 2 && native["project"]["uuid"] === projectUuid && native["project"]["path"] === projectPath &&
      isRecord(native["document"]) && Reflect.ownKeys(native["document"]).length === 3 && native["document"]["uuid"] === activeUuid && native["document"]["documentType"] === 3 &&
      typeof native["document"]["tabId"] === "string" && native["document"]["tabId"].length > 0 && native["document"]["tabId"].length <= 256, "Closed navigation acknowledgment missing or contradictory.");
    await this.currentGeneration(journal, generation);
    unchangedPlan();
    const active = structuredClone(await this.engine.assertContext(context, { allowTabChange: true }));
    unchangedPlan();
    requireValue(native["document"]["tabId"] === active.document.tabId, "Closed navigation acknowledgment context differs.");
    await this.currentGeneration(journal, generation);
    unchangedPlan();
    await this.unchanged(checkpoint, projectPath);
    unchangedPlan();
    await this.admission(journal);
    unchangedPlan();
    await this.engine.assertContext(active);
    unchangedPlan();
    await this.currentGeneration(journal, generation);
    unchangedPlan();
    const final = await loadClosedSymbolJournal(journal.operationId);
    unchangedPlan();
    this.currentSession(journal, generation);
    requireValue(canonicalJson(final.journal) === canonicalJson(journal), "Closed navigation durable journal changed.");
    Object.assign(journalInput, journal);
    return Object.freeze({ profile: "easyeda-pro-control.closed-symbol-companion-open.v1", operationId: journal.operationId, phase,
      context: active, native, checkpoint, navigationAcknowledged: true, currentCheckpointUnchanged: true,
      executionAuthorized: false, completionProved: false, saved: false, reopened: false });
  }
}
