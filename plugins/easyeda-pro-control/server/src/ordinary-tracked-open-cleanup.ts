import { dirname, join } from "node:path";
import { loadOperation, operationPath, readArtifact, updateOperation, writePhaseArtifact } from "./artifacts.ts";
import type { ArtifactDescriptor } from "./artifacts.ts";
import { canonicalJson, sha256Json, sha256Text } from "./core.ts";
import type { EasyedaControlEngine, OriginalSettledTrackedDispatch, TrackedDispatchOperationJournal } from "./engine.ts";
import { WindowsControlRuntime } from "./windows-runtime.ts";
import { assertWindowsRuntimeValidator } from "./windows-runtime-validator.ts";
import type { WindowsAuthorityLaunch, WindowsLaunchTerminationObservation } from "./windows-authority.ts";

export type OrdinaryTrackedOpenCleanupAction = "request-cleanup-close" | "observe-cleanup-termination" | "finish-cleanup" | "settle-cleanup-records";
export interface OrdinaryTrackedOpenCleanupRequest {
  readonly action: OrdinaryTrackedOpenCleanupAction;
  readonly operationId: string;
  readonly cleanupNonce: string;
  readonly confirmNormalClose?: true;
  readonly acceptUnknownFileEffects?: true;
}
type Engine = Pick<EasyedaControlEngine, "upstream" | "originalSettledTrackedDispatch" | "assertRecoveryOperationIsolated">;
export interface OrdinaryTrackedOpenCleanupDependencies {
  readonly loadOperation?: typeof loadOperation;
  readonly readArtifact?: typeof readArtifact;
  readonly updateOperation?: typeof updateOperation;
  readonly writePhaseArtifact?: typeof writePhaseArtifact;
}
interface PendingPublication {
  readonly baseText: string;
  readonly terminal: boolean;
  readonly record?: { readonly phase: string; readonly value: Record<string, unknown>; readonly closeIntent: boolean };
  candidate?: TrackedDispatchOperationJournal;
}
interface Slot {
  readonly journal: TrackedDispatchOperationJournal;
  readonly planText: string;
  readonly launch: WindowsAuthorityLaunch;
  readonly launchText: string;
  readonly methods: readonly unknown[];
  readonly upstream: Engine["upstream"];
  readonly engineMethods: readonly unknown[];
  source?: OriginalSettledTrackedDispatch;
  closeAttempted: boolean;
  closeAcknowledged: boolean;
  closeDispatched: boolean;
  closeIntentPublished: boolean;
  closeHwnd?: string;
  pending?: PendingPublication;
  captureReleaseAttempted: boolean;
  captureReleased: boolean;
  observations: number;
  terminated?: WindowsLaunchTerminationObservation;
  complete: boolean;
  consumed: boolean;
}
const profiles = new Map([
  ["easyeda-pro-control.current-schematic-page-opening.v1", "schematic-page-open209"],
  ["managed-fixture-import209-v1", "managed-fixture-import"],
]);
function need(value: boolean): asserts value { if (!value) { throw new Error("ORIGINAL_TRACKED_OPEN_CLEANUP_REFUSED"); } }
function content(journal: Record<string, unknown>): string {
  const core = { ...journal }; delete core["journalSha256"]; return canonicalJson(core);
}
function replaceJournal(target: TrackedDispatchOperationJournal, value: Record<string, unknown>): void {
  need(Object.keys(target).every(key => Object.hasOwn(value, key) || key === "runtimeRestartChallenge" || key === "runtimeRestartChallengeIssuedAt"));
  if (!Object.hasOwn(value, "runtimeRestartChallenge")) { delete target.runtimeRestartChallenge; }
  if (!Object.hasOwn(value, "runtimeRestartChallengeIssuedAt")) { delete target.runtimeRestartChallengeIssuedAt; }
  Object.assign(target, value);
}
function methods(runtime: WindowsControlRuntime): readonly unknown[] {
  // oxlint-disable-next-line typescript/unbound-method -- Pin method identities only; calls always keep the original runtime receiver.
  return [runtime.status, runtime.normalClose, runtime.observeApplicationWindow, runtime.observeLaunchTermination, runtime.releaseCapture];
}
function engineMethods(engine: Engine): readonly unknown[] {
  return [engine.originalSettledTrackedDispatch, engine.assertRecoveryOperationIsolated, engine.upstream.assertClosedAuthenticatedBridgeDispatchReleased];
}

/** Strict internal original-owner cleanup for two ordinary navigation families.
 * It never accepts loaded journals, caller proof objects, replacement owners,
 * new application sessions, native force termination or a design-state claim. */
export class OrdinaryTrackedOpenCleanup {
  readonly #engine: Engine;
  readonly #runtime: WindowsControlRuntime;
  readonly #assertOriginalLaunch: () => void;
  readonly #slots = new Map<string, Slot>();
  readonly #load: typeof loadOperation;
  readonly #read: typeof readArtifact;
  readonly #update: typeof updateOperation;
  readonly #write: typeof writePhaseArtifact;
  #busy = false;
  public constructor(engine: Engine, runtime: WindowsControlRuntime, assertOriginalLaunch: () => void, dependencies: OrdinaryTrackedOpenCleanupDependencies = {}) {
    need(runtime instanceof WindowsControlRuntime);
    this.#engine = engine; this.#runtime = runtime; this.#assertOriginalLaunch = assertOriginalLaunch;
    this.#load = dependencies.loadOperation ?? loadOperation; this.#read = dependencies.readArtifact ?? readArtifact;
    this.#update = dependencies.updateOperation ?? updateOperation; this.#write = dependencies.writePhaseArtifact ?? writePhaseArtifact;
  }
  /** Called only with the actual newly created journal before original dispatch.
   * A later serialized copy cannot replace this retained object. */
  public retain(journal: TrackedDispatchOperationJournal): void {
    this.#assertOriginalLaunch();
    const launch = this.#runtime.status().launch, profile = journal.plan["profile"];
    need(!this.#busy && this.#slots.size < 4096 && !this.#slots.has(journal.operationId) && typeof profile === "string" && profiles.has(profile) && launch !== null);
    this.#slots.set(journal.operationId, { journal, planText: canonicalJson(journal.plan), launch, launchText: canonicalJson(launch),
      methods: methods(this.#runtime), upstream: this.#engine.upstream, engineMethods: engineMethods(this.#engine),
      closeAttempted: false, closeAcknowledged: false, closeDispatched: false, closeIntentPublished: false, captureReleaseAttempted: false, captureReleased: false, observations: 0, complete: false, consumed: false });
  }
  /** Local capability availability only. No process observation, bridge call,
   * close or historical-owner reconstruction occurs here. A settled actual
   * original dispatch can issue its technical cleanup nonce. */
  public inspect(operationId: string): Record<string, unknown> {
    const slot = this.#slots.get(operationId);
    if (slot === undefined) { return { originalCleanupOwnerRetained: false, cleanupAvailable: false }; }
    if (slot.complete) { return { originalCleanupOwnerRetained: true, cleanupComplete: true, navigationEffects: "unknown", replayAllowed: false,
      cleanupCaptureReleaseAttempted: slot.captureReleaseAttempted, cleanupCaptureReleased: slot.captureReleased }; }
    if (slot.pending !== undefined) { return { originalCleanupOwnerRetained: true, cleanupPublicationPending: true, cleanupNonce: slot.source?.nonce,
      cleanupCloseConsumed: slot.closeAttempted, cleanupCloseDispatched: slot.closeDispatched, cleanupCloseAcknowledged: slot.closeAcknowledged,
      navigationEffects: "unknown", replayAllowed: false }; }
    try {
      this.#current(slot);
      return { originalCleanupOwnerRetained: true, cleanupAvailable: true, cleanupNonce: slot.source?.nonce,
        cleanupCloseConsumed: slot.closeAttempted, cleanupCloseDispatched: slot.closeDispatched, cleanupCloseAcknowledged: slot.closeAcknowledged,
        originalTerminationObserved: slot.terminated?.terminated === true, navigationEffects: "unknown", replayAllowed: false };
    } catch { return { originalCleanupOwnerRetained: true, cleanupAvailable: false, cleanupCloseConsumed: slot.closeAttempted, replayAllowed: false }; }
  }
  #owner(slot: Slot): void {
    this.#assertOriginalLaunch();
    need(!slot.complete && this.#slots.get(slot.journal.operationId) === slot && canonicalJson(slot.journal.plan) === slot.planText &&
      canonicalJson(this.#runtime.status().launch) === slot.launchText && methods(this.#runtime).every((value, index) => value === slot.methods[index]) &&
      this.#engine.upstream === slot.upstream && engineMethods(this.#engine).every((value, index) => value === slot.engineMethods[index]));
    if (slot.source !== undefined) { slot.source.assertRetainedOwner(); assertWindowsRuntimeValidator(slot.source.validator, this.#runtime); }
  }
  #current(slot: Slot): OriginalSettledTrackedDispatch {
    this.#owner(slot); need(!slot.consumed);
    const source = slot.source ?? this.#engine.originalSettledTrackedDispatch(slot.journal);
    need(profiles.get(String(slot.journal.plan["profile"])) === source.phase);
    source.assertCurrent(); assertWindowsRuntimeValidator(source.validator, this.#runtime);
    const roots = source.authority.processes.filter(process => process.role === "easyeda-main");
    need(roots.length === 1 && canonicalJson(roots[0]) === canonicalJson(slot.launch.root) && source.authority.processes.every(process =>
      process.startIdentity.endsWith(`:job:${slot.launch.jobId}`)));
    slot.source = source; return source;
  }
  async #revalidate(slot: Slot): Promise<OriginalSettledTrackedDispatch> {
    const source = this.#current(slot);
    need(canonicalJson(await this.#load(slot.journal.operationId)) === canonicalJson(slot.journal));
    this.#current(slot); await this.#engine.assertRecoveryOperationIsolated(slot.journal.operationId); this.#current(slot); return source;
  }
  async #event(slot: Slot, phase: string, data: unknown, closeIntent = false): Promise<void> {
    need(slot.pending === undefined);
    const source = await this.#revalidate(slot);
    const record = { schema: "easyeda-pro-control.original-tracked-open-cleanup-event.v1", operationId: slot.journal.operationId,
      createdAt: new Date().toISOString(), phase, originalPhase: source.phase, nonceSha256: sha256Text(source.nonce),
      originalAuthoritySha256: source.authority.authoritySha256, originalLaunch: slot.launch,
      navigationEffects: "unknown", unchangedStorageVerified: false, explicitSaveDispatched: false, replayAllowed: false, data };
    slot.pending = { baseText: content(slot.journal), terminal: false, record: { phase, value: record, closeIntent } };
    await this.#publish(slot);
  }
  async #artifact(slot: Slot, pending: PendingPublication): Promise<ArtifactDescriptor> {
    const record = pending.record; need(record !== undefined);
    const sequence = slot.journal.sequence + 1, text = `${JSON.stringify(record.value)}\n`;
    need(Buffer.byteLength(text) <= 256 * 1024);
    const directory = dirname(operationPath(slot.journal.operationId));
    const path = join(directory, slot.journal.operationId, `${String(sequence).padStart(2, "0")}-${record.phase}.json`);
    let existing;
    try { existing = await this.#read(path, 0, Buffer.byteLength(text)); }
    catch (error) {
      this.#current(slot);
      if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") { throw error; }
      const artifact = await this.#write(slot.journal.operationId, sequence, record.phase, record.value); this.#current(slot);
      need(artifact.path === path && artifact.sha256 === sha256Text(text) && artifact.bytes === Buffer.byteLength(text)); return artifact;
    }
    this.#current(slot);
    need(existing.path === path && existing.offset === 0 && existing.eof && existing.text === text && existing.size === Buffer.byteLength(text));
    return { path, bytes: existing.size, sha256: sha256Text(text) };
  }
  async #publish(slot: Slot): Promise<void> {
    const pending = slot.pending; need(pending !== undefined); this.#owner(slot);
    need(content(slot.journal) === pending.baseText);
    if (pending.terminal) {
      need(slot.consumed && slot.source !== undefined && pending.candidate !== undefined);
      const termination = await this.#runtime.observeLaunchTermination(); this.#owner(slot);
      need(termination.terminated && termination.jobId === slot.launch.jobId && termination.helperInstance === slot.launch.helperInstance);
      const released = this.#engine.upstream.assertClosedAuthenticatedBridgeDispatchReleased; need(released !== undefined);
      released.call(this.#engine.upstream, slot.source.bridgeDispatch, slot.source.bridgeSession);
    } else { this.#current(slot); }
    const before = await this.#load(slot.journal.operationId); this.#owner(slot);
    need(content(before) === pending.baseText || pending.candidate !== undefined && content(before) === content(pending.candidate));
    await this.#engine.assertRecoveryOperationIsolated(slot.journal.operationId); this.#owner(slot);
    if (pending.candidate === undefined) {
      const artifact = await this.#artifact(slot, pending), candidate = structuredClone(slot.journal);
      candidate.sequence += 1; candidate.artifacts.push(artifact); candidate.updatedAt = String(pending.record?.value["createdAt"]);
      pending.candidate = candidate;
    }
    const candidate = pending.candidate;
    const current = await this.#load(slot.journal.operationId); this.#owner(slot);
    need(content(current) === pending.baseText || content(current) === content(candidate));
    if (content(current) === pending.baseText) { await this.#update(candidate); this.#owner(slot); }
    const published = await this.#load(slot.journal.operationId); this.#owner(slot);
    need(content(published) === content(candidate) && content(slot.journal) === pending.baseText);
    if (!pending.terminal) { this.#current(slot); }
    replaceJournal(slot.journal, published); delete slot.pending;
    if (pending.record?.closeIntent === true) { slot.closeIntentPublished = true; }
    if (pending.terminal) {
      slot.complete = true;
      // A consumed capture release is never retried. If it fails, the durable
      // Quarantine clear remains valid and the original helper still owns its
      // Final all-resource release after observed termination.
      if (slot.source?.orphanRiskAtIssue === true) {
        slot.captureReleaseAttempted = true; await this.#runtime.releaseCapture(slot.source.authority); slot.captureReleased = true;
      }
      this.#assertOriginalLaunch();
    }
  }
  async #continueClose(slot: Slot): Promise<void> {
    need(slot.closeAttempted && !slot.closeDispatched);
    if (slot.closeHwnd === undefined) {
      const window = await this.#runtime.observeApplicationWindow(); this.#current(slot);
      need(window.outcome === "available" && window.hwnd !== null && window.jobId === slot.launch.jobId && window.helperInstance === slot.launch.helperInstance);
      slot.closeHwnd = window.hwnd;
    }
    if (!slot.closeIntentPublished) {
      await this.#event(slot, "cleanup-normal-close-intent", { hwnd: slot.closeHwnd, confirmNormalClose: true, acceptUnknownFileEffects: true }, true);
    }
    const window = await this.#runtime.observeApplicationWindow(); this.#current(slot);
    need(window.outcome === "available" && window.hwnd === slot.closeHwnd && window.jobId === slot.launch.jobId && window.helperInstance === slot.launch.helperInstance);
    await this.#revalidate(slot); slot.closeDispatched = true;
    await this.#runtime.normalClose(slot.closeHwnd); this.#current(slot); slot.closeAcknowledged = true;
    await this.#event(slot, "cleanup-normal-close-acknowledged", { closeDispatched: true, terminationProved: false });
  }
  public async run(request: OrdinaryTrackedOpenCleanupRequest): Promise<Record<string, unknown>> {
    const slot = this.#slots.get(request.operationId);
    need(!this.#busy && slot !== undefined && !slot.complete); this.#owner(slot);
    const source = slot.source ?? this.#current(slot);
    need(request.cleanupNonce === source.nonce); this.#busy = true;
    try {
      if (request.action === "settle-cleanup-records") {
        if (slot.pending !== undefined) { await this.#publish(slot); }
        if (!slot.complete && slot.closeAttempted && !slot.closeDispatched) { await this.#continueClose(slot); }
        return this.inspect(request.operationId);
      }
      need(slot.pending === undefined); this.#current(slot); await this.#revalidate(slot);
      if (request.action === "request-cleanup-close") {
        need(!slot.closeAttempted && slot.terminated === undefined && request.confirmNormalClose === true && request.acceptUnknownFileEffects === true);
        slot.closeAttempted = true; await this.#continueClose(slot);
        return this.inspect(request.operationId);
      }
      if (request.action === "observe-cleanup-termination") {
        need(slot.observations < 32); slot.observations += 1;
        const observation = await this.#runtime.observeLaunchTermination(); this.#current(slot);
        need(observation.jobId === slot.launch.jobId && observation.helperInstance === slot.launch.helperInstance);
        if (observation.terminated) { slot.terminated = observation; }
        await this.#event(slot, "cleanup-original-termination", { observation, attempt: slot.observations });
        return this.inspect(request.operationId);
      }
      need(request.action === "finish-cleanup" && slot.terminated?.terminated === true);
      // Reobserve retained handles now. Earlier snapshots or source-only JSON
      // Never substitute for this original root and complete empty-Job proof.
      const termination = await this.#runtime.observeLaunchTermination(); this.#current(slot);
      need(termination.terminated && termination.jobId === slot.launch.jobId && termination.helperInstance === slot.launch.helperInstance);
      const released = this.#engine.upstream.assertClosedAuthenticatedBridgeDispatchReleased;
      need(released !== undefined);
      const closed = released.call(this.#engine.upstream, source.bridgeDispatch, source.bridgeSession);
      await this.#event(slot, "cleanup-closed-session-and-dispatch", { termination, closed });
      await this.#revalidate(slot);
      need(canonicalJson(released.call(this.#engine.upstream, source.bridgeDispatch, source.bridgeSession)) === canonicalJson(closed));
      // Consume the original technical nonce before the durable clear. No new
      // Navigation, replacement process, Save or effect classification occurs.
      source.consume(); slot.consumed = true;
      const candidate = structuredClone(slot.journal);
      candidate["originalTrackedOpenCleanup"] = { schema: "easyeda-pro-control.original-tracked-open-cleanup.v1",
        originalPhase: source.phase, nonceSha256: sha256Text(source.nonce), authoritySha256: source.authority.authoritySha256,
        originalRootAndJobTerminated: true, originalDispatchPromiseSettled: true, originalSessionClosedAndLeaseReleased: true,
        navigationEffects: "unknown", unchangedStorageVerified: false, explicitSaveDispatched: false, replayAllowed: false,
        proofSha256: sha256Json({ termination, closed }) };
      candidate.runtimeRestartChallengeConsumedAt = new Date().toISOString(); delete candidate.runtimeRestartChallenge;
      delete candidate.runtimeRestartChallengeIssuedAt; candidate.orphanedCallPossible = false;
      candidate.state = "completed"; candidate.mutationState = "closed-navigation-effects-unknown"; candidate.hardStop = false;
      candidate.updatedAt = new Date().toISOString();
      candidate.nextSafeAction = "The original process and dispatch are closed. Navigation/storage effects remain unknown. Finish the original ordinary-launch termination record and helper release; never replay this operation or Save.";
      slot.pending = { baseText: content(slot.journal), terminal: true, candidate };
      await this.#publish(slot);
      return this.inspect(request.operationId);
    } finally { this.#busy = false; }
  }
}
