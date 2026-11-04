/** Explicit historical relinquishment. No process handle, app launcher or writer is exposed. */
/* oxlint-disable import/max-dependencies -- Compose the independent managed-history, process-observer, installation and global exclusion boundaries without a caller-selectable recovery bypass. */
import { randomBytes } from "node:crypto";
import { canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { currentFootprintForwardOpeningRelinquishmentIntentSchema,currentFootprintForwardOpeningRelinquishmentRequestSchema,currentFootprintForwardOpeningRelinquishmentResultSchema } from "./current-footprint-forward-opening-relinquishment-contract.ts";
import type { CurrentFootprintForwardOpeningRelinquishmentIntent, CurrentFootprintForwardOpeningRelinquishmentResult } from "./current-footprint-forward-opening-relinquishment-contract.ts";
import { assertCurrentFootprintForwardOpeningHistoricalSnapshot, publishCurrentFootprintForwardOpeningRelinquishment,
  readCurrentFootprintForwardOpeningHistoricalSnapshot, readCurrentFootprintForwardOpeningRelinquishment,
  requireCurrentFootprintForwardOpeningHistoricalSnapshot } from "./current-footprint-forward-opening-relinquishment-journal.ts";
import type { CurrentFootprintForwardOpeningHistoricalSnapshot } from "./current-footprint-forward-opening-relinquishment-journal.ts";
import { acquireCurrentPcbDiagnosticLaunchExclusion, assertCurrentFootprintForwardOpeningRelinquishmentIsolated,
  assertCurrentPcbDiagnosticLaunchExclusion, releaseCurrentPcbDiagnosticLaunchExclusion } from "./current-pcb-diagnostic-lifecycle-journal.ts";
import type { CurrentPcbDiagnosticLaunchLease } from "./current-pcb-diagnostic-lifecycle-journal.ts";
import type { CurrentPcbDiagnosticLifecycleOptions } from "./current-pcb-diagnostic-lifecycle.ts";
import { assertNoUnresolvedOrdinaryLaunches } from "./ordinary-launch.ts";
import { verifyCurrentPcb209DiagnosticInstallation } from "./current-pcb-diagnostic-installation.ts";
import { observeOrdinaryLaunchRecovery } from "./ordinary-launch-recovery.ts";
import { observeOtherCurrentFootprintCombinedLinuxFacade } from "./current-footprint-combined-linux-facade-observation.ts";
import { collectCurrentFootprintForwardOpeningFileProof } from "./current-footprint-forward-opening-relinquishment-file-proof.ts";

export interface CurrentFootprintForwardOpeningUnknownRelinquishmentOptions extends CurrentPcbDiagnosticLifecycleOptions {
  /** Must reject every retained/reserved/ever-allocated application owner. */
  readonly assertFreshNoOwnedAllocations: () => void;
}
export interface CurrentFootprintForwardOpeningUnknownRelinquishmentDependencies {
  readonly verifyInstallation?: typeof verifyCurrentPcb209DiagnosticInstallation;
  readonly observeWindows?: typeof observeOrdinaryLaunchRecovery;
  readonly observeLinux?: typeof observeOtherCurrentFootprintCombinedLinuxFacade;
  readonly publishRecord?: typeof publishCurrentFootprintForwardOpeningRelinquishment;
  readonly collectFileProof?: typeof collectCurrentFootprintForwardOpeningFileProof;
}
interface Pending {
  readonly observationToken: object;
  readonly original: CurrentFootprintForwardOpeningHistoricalSnapshot;
  readonly intent: CurrentFootprintForwardOpeningRelinquishmentIntent;
  readonly result: CurrentFootprintForwardOpeningRelinquishmentResult;
}
/** Refuse a missing invariant before it can produce a relinquishment record. */
function need(value: boolean, reason: string): asserts value { if (!value) { throw new Error(`FORWARD_OPENING_RELINQUISHMENT_${reason}`); } }
/** Presence flags only block this resolver; they never identify or authorize control of a process. */
function requireWindowsAbsence(observation: Awaited<ReturnType<typeof observeOrdinaryLaunchRecovery>>): void {
  if (!observation.otherPowerShellPresent && !observation.sameNameProcessPresent) { return; }
  const error = new Error("FORWARD_OPENING_RELINQUISHMENT_WINDOWS_PROCESS_PRESENT");
  // Report only the already validated presence flags. This supplies neither
  // Process identity nor authority to close, terminate or adopt either process.
  Object.defineProperty(error, "assertionResults", { enumerable: true, value: Object.freeze({
    profile: "easyeda-pro-control.footprint-forward-opening-recovery-process-presence.v1",
    samples: observation.samples, otherPowerShellPresent: observation.otherPowerShellPresent,
    easyedaProcessPresent: observation.sameNameProcessPresent,
  }) });
  throw error;
}
function publicResult(result: CurrentFootprintForwardOpeningRelinquishmentResult): Record<string, unknown> {
  return { ...structuredClone(result), state: "unknown-opening-relinquished", startupBlockerRelinquished: true, executionAuthorized: false };
}
export class CurrentFootprintForwardOpeningUnknownRelinquishment {
  readonly #options: CurrentFootprintForwardOpeningUnknownRelinquishmentOptions;
  readonly #verify: typeof verifyCurrentPcb209DiagnosticInstallation;
  readonly #windows: typeof observeOrdinaryLaunchRecovery;
  readonly #linux: typeof observeOtherCurrentFootprintCombinedLinuxFacade;
  readonly #publish: typeof publishCurrentFootprintForwardOpeningRelinquishment;
  readonly #files: typeof collectCurrentFootprintForwardOpeningFileProof;
  #lease: CurrentPcbDiagnosticLaunchLease | null = null;
  #pending: Pending | null = null;
  readonly #observations = new WeakMap<object, Readonly<{ original: CurrentFootprintForwardOpeningHistoricalSnapshot; nonceSha256: string; nativeText: string }>>();
  #busy = false;
  /** Capture original collectors once; later requests cannot replace their proof or publication functions. */
  public constructor(options: CurrentFootprintForwardOpeningUnknownRelinquishmentOptions, dependencies: CurrentFootprintForwardOpeningUnknownRelinquishmentDependencies = {}) {
    this.#options = Object.freeze({ ...options }); this.#verify = dependencies.verifyInstallation ?? verifyCurrentPcb209DiagnosticInstallation;
    this.#windows = dependencies.observeWindows ?? observeOrdinaryLaunchRecovery;
    this.#linux = dependencies.observeLinux ?? observeOtherCurrentFootprintCombinedLinuxFacade;
    this.#publish = dependencies.publishRecord ?? publishCurrentFootprintForwardOpeningRelinquishment;
    this.#files = dependencies.collectFileProof ?? collectCurrentFootprintForwardOpeningFileProof;
  }
  /** Keep the global launch exclusion visible through collection and durable publication. */
  public hasActiveReservation(): boolean { return this.#lease !== null; }
  /** Recheck the original facade and reject every native allocation before any observation. */
  #local(): void {
    this.#options.assertLocalAllowed(); this.#options.assertFreshNoOwnedAllocations();
    if (this.#lease !== null) { assertCurrentPcbDiagnosticLaunchExclusion(this.#lease); }
  }
  /** Reprove the exact original roster and all independent journal exclusions after each await. */
  async #current(original: CurrentFootprintForwardOpeningHistoricalSnapshot): Promise<void> {
    this.#local(); await assertCurrentFootprintForwardOpeningHistoricalSnapshot(original); this.#local();
    await this.#options.assertOtherLaunchesSettled(); this.#local();
    await assertNoUnresolvedOrdinaryLaunches(); this.#local();
    await assertCurrentFootprintForwardOpeningRelinquishmentIsolated(original); this.#local();
  }
  /** Issue one lexical observation plan, then exclusively settle its sidecars without replaying collection. */
  public async run(input: unknown): Promise<Record<string, unknown>> {
    const request = currentFootprintForwardOpeningRelinquishmentRequestSchema.parse(input);
    need(!this.#busy, "BUSY"); this.#local(); this.#busy = true;
    try {
      const original = this.#pending?.original ?? await readCurrentFootprintForwardOpeningHistoricalSnapshot(request.operationId);
      const source = requireCurrentFootprintForwardOpeningHistoricalSnapshot(original);
      need(source.operationId === request.operationId && source.originalIntentSha256 === request.expectedIntentSha256 &&
        source.originalBindingSha256 === request.expectedBindingSha256 && source.originalOpeningIntentSha256 === request.expectedOpeningIntentSha256, "ORIGINAL_DIGEST");
      await this.#current(original);
      this.#lease = acquireCurrentPcbDiagnosticLaunchExclusion(); this.#local();
      let receipt = await readCurrentFootprintForwardOpeningRelinquishment(original); await this.#current(original);
      if (receipt?.result !== undefined && receipt.result !== null) { return publicResult(receipt.result); }
      if (this.#pending === null) {
        const installation = await this.#verify(this.#options); await this.#current(original);
        // The nonce is lexical to this observation pair. Caller JSON and a
        // Persisted old nonce can never produce the in-memory Pending plan.
        const nonce = randomBytes(32).toString("hex");
        need(!await this.#linux(), "OTHER_LINUX_FACADE"); await this.#current(original);
        const observationBefore = await this.#windows(this.#options); await this.#current(original);
        requireWindowsAbsence(observationBefore);
        const fileProof = await this.#files(source.opening, () => this.#current(original)); await this.#current(original);
        const observation = await this.#windows(this.#options); await this.#current(original); requireWindowsAbsence(observation);
        need(!await this.#linux(), "OTHER_LINUX_FACADE"); await this.#current(original);
        const finalInstallation = await this.#verify(this.#options); await this.#current(original);
        need(canonicalJson(finalInstallation) === canonicalJson(installation), "INSTALLATION_CHANGED");
        const fields = { operationId: source.operationId, originalIntentSha256: source.originalIntentSha256,
          originalBindingSha256: source.originalBindingSha256, originalOpeningIntentSha256: source.originalOpeningIntentSha256,
          originalRosterSha256: source.originalRosterSha256, originalIdentitySha256: source.originalIdentitySha256,
          originalProducerFacadeSha256: source.originalProducerFacadeSha256, originalInstallationSha256: source.originalInstallationSha256 };
        const intent = receipt?.intent ?? currentFootprintForwardOpeningRelinquishmentIntentSchema.parse({
          schema: "easyeda-pro-control.footprint-forward-opening-relinquishment-intent.v1", ...fields,
          createdAt: new Date().toISOString(), facadeSha256: installation.facadeSha256, installationSha256: sha256Json(installation),
          confirmRelinquishUnknownOpening: true, acceptUnknownCaptureOutcome: true,
        });
        need(intent.facadeSha256 === installation.facadeSha256 && intent.installationSha256 === sha256Json(installation), "RECOVERY_PRODUCER_CHANGED");
        const result = currentFootprintForwardOpeningRelinquishmentResultSchema.parse({
          schema: "easyeda-pro-control.footprint-forward-opening-relinquished.v1", ...fields,
          createdAt: new Date().toISOString(), relinquishmentIntentSha256: sha256Json(intent), observationNonceSha256: sha256Text(nonce),
          observationBefore, observation, fileProof, otherLinuxFacadePresent: false, linuxFacadeSamples: 2, captureOutcome: "unknown",
          terminationOutcome: "unknown", helperReleaseOutcome: "unknown", terminationProved: false, nativeResourcesReleased: false, helperReleaseAcknowledged: false, originalLaunchIdentityVerified: false, retainedLaunchAuthority: false,
          executionReady: false, executionAuthorized: false, designExecutionAuthorized: false, saveAuthorized: false,
        });
        const observationToken = Object.freeze({ profile: "private.current-footprint-forward-opening-relinquishment-observation.v1" });
        this.#observations.set(observationToken, Object.freeze({ original, nonceSha256: sha256Text(nonce), nativeText: canonicalJson({ observationBefore, observation, fileProof }) }));
        this.#pending = Object.freeze({ observationToken, original, intent: Object.freeze(intent), result: Object.freeze(result) });
      }
      const pending = this.#pending; await this.#current(original);
      const issued = this.#observations.get(pending.observationToken);
      need(pending.original === original && issued !== undefined && issued.original === original &&
        issued.nonceSha256 === pending.result.observationNonceSha256 && issued.nativeText === canonicalJson({ observationBefore: pending.result.observationBefore, observation: pending.result.observation, fileProof: pending.result.fileProof }), "OBSERVATION_ORIGIN_CHANGED");
      if (receipt === null) { await this.#publish(original, "intent.json", pending.intent); await this.#current(original); }
      receipt = await readCurrentFootprintForwardOpeningRelinquishment(original); await this.#current(original);
      need(receipt !== null && canonicalJson(receipt.intent) === canonicalJson(pending.intent), "INTENT_PUBLICATION_CHANGED");
      if (receipt.result === null) { await this.#publish(original, "relinquished.json", pending.result); await this.#current(original); }
      receipt = await readCurrentFootprintForwardOpeningRelinquishment(original); await this.#current(original);
      need(receipt !== null && canonicalJson(receipt.result) === canonicalJson(pending.result), "RESULT_PUBLICATION_CHANGED");
      return publicResult(pending.result);
    } finally {
      if (this.#lease !== null) { releaseCurrentPcbDiagnosticLaunchExclusion(this.#lease); this.#lease = null; }
      this.#busy = false;
    }
  }
}
