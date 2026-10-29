/** Explicit historical relinquishment. No process handle, app launcher or writer is exposed. */
/* oxlint-disable import/max-dependencies -- Compose the independent managed-history, process-observer, installation and global exclusion boundaries without a caller-selectable recovery bypass. */
import { randomBytes } from "node:crypto";
import { canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { currentFootprintCombinedAbandonUnknownRequestSchema } from "./current-footprint-combined-validation.ts";
import { currentFootprintCombinedAbandonmentIntentSchema, currentFootprintCombinedAbandonmentResultSchema } from "./current-footprint-combined-abandonment-contract.ts";
import type { CurrentFootprintCombinedAbandonmentIntent, CurrentFootprintCombinedAbandonmentResult } from "./current-footprint-combined-abandonment-contract.ts";
import { assertCurrentFootprintCombinedHistoricalSnapshot, publishCurrentFootprintCombinedAbandonment,
  readCurrentFootprintCombinedAbandonment, readCurrentFootprintCombinedHistoricalSnapshot,
  requireCurrentFootprintCombinedHistoricalSnapshot } from "./current-footprint-combined-abandonment-journal.ts";
import type { CurrentFootprintCombinedHistoricalSnapshot } from "./current-footprint-combined-abandonment-journal.ts";
import { acquireCurrentPcbDiagnosticLaunchExclusion, assertCurrentFootprintCombinedAbandonmentIsolated,
  assertCurrentPcbDiagnosticLaunchExclusion, releaseCurrentPcbDiagnosticLaunchExclusion } from "./current-pcb-diagnostic-lifecycle-journal.ts";
import type { CurrentPcbDiagnosticLaunchLease } from "./current-pcb-diagnostic-lifecycle-journal.ts";
import type { CurrentPcbDiagnosticLifecycleOptions } from "./current-pcb-diagnostic-lifecycle.ts";
import { assertNoUnresolvedOrdinaryLaunches } from "./ordinary-launch.ts";
import { verifyCurrentPcb209DiagnosticInstallation } from "./current-pcb-diagnostic-installation.ts";
import { observeOrdinaryLaunchRecovery } from "./ordinary-launch-recovery.ts";
import { observeOtherCurrentFootprintCombinedLinuxFacade } from "./current-footprint-combined-linux-facade-observation.ts";

export interface CurrentFootprintCombinedUnknownAbandonmentOptions extends CurrentPcbDiagnosticLifecycleOptions {
  /** Must reject every retained/reserved/ever-allocated application owner. */
  readonly assertFreshNoOwnedAllocations: () => void;
}
export interface CurrentFootprintCombinedUnknownAbandonmentDependencies {
  readonly verifyInstallation?: typeof verifyCurrentPcb209DiagnosticInstallation;
  readonly observeWindows?: typeof observeOrdinaryLaunchRecovery;
  readonly observeLinux?: typeof observeOtherCurrentFootprintCombinedLinuxFacade;
  readonly publishRecord?: typeof publishCurrentFootprintCombinedAbandonment;
}
interface Pending {
  readonly observationToken: object;
  readonly original: CurrentFootprintCombinedHistoricalSnapshot;
  readonly intent: CurrentFootprintCombinedAbandonmentIntent;
  readonly result: CurrentFootprintCombinedAbandonmentResult;
}
function need(value: boolean, reason: string): asserts value { if (!value) { throw new Error(`COMBINED_UNKNOWN_ABANDONMENT_${reason}`); } }
function requireWindowsAbsence(observation: Awaited<ReturnType<typeof observeOrdinaryLaunchRecovery>>): void {
  if (!observation.otherPowerShellPresent && !observation.sameNameProcessPresent) { return; }
  const error = new Error("COMBINED_UNKNOWN_ABANDONMENT_WINDOWS_PROCESS_PRESENT");
  // Report only the already validated presence flags. This supplies neither
  // Process identity nor authority to close, terminate or adopt either process.
  Object.defineProperty(error, "assertionResults", { enumerable: true, value: Object.freeze({
    profile: "easyeda-pro-control.footprint-combined-recovery-process-presence.v1",
    samples: observation.samples, otherPowerShellPresent: observation.otherPowerShellPresent,
    easyedaProcessPresent: observation.sameNameProcessPresent,
  }) });
  throw error;
}
function publicResult(result: CurrentFootprintCombinedAbandonmentResult): Record<string, unknown> {
  return { ...structuredClone(result), state: "unknown-launch-abandoned", startupBlockerRelinquished: true, executionAuthorized: false };
}
export class CurrentFootprintCombinedUnknownAbandonment {
  readonly #options: CurrentFootprintCombinedUnknownAbandonmentOptions;
  readonly #verify: typeof verifyCurrentPcb209DiagnosticInstallation;
  readonly #windows: typeof observeOrdinaryLaunchRecovery;
  readonly #linux: typeof observeOtherCurrentFootprintCombinedLinuxFacade;
  readonly #publish: typeof publishCurrentFootprintCombinedAbandonment;
  #lease: CurrentPcbDiagnosticLaunchLease | null = null;
  #pending: Pending | null = null;
  readonly #observations = new WeakMap<object, Readonly<{ original: CurrentFootprintCombinedHistoricalSnapshot; nonceSha256: string; nativeText: string }>>();
  #busy = false;
  public constructor(options: CurrentFootprintCombinedUnknownAbandonmentOptions, dependencies: CurrentFootprintCombinedUnknownAbandonmentDependencies = {}) {
    this.#options = Object.freeze({ ...options }); this.#verify = dependencies.verifyInstallation ?? verifyCurrentPcb209DiagnosticInstallation;
    this.#windows = dependencies.observeWindows ?? observeOrdinaryLaunchRecovery;
    this.#linux = dependencies.observeLinux ?? observeOtherCurrentFootprintCombinedLinuxFacade;
    this.#publish = dependencies.publishRecord ?? publishCurrentFootprintCombinedAbandonment;
  }
  public hasActiveReservation(): boolean { return this.#lease !== null; }
  #local(): void {
    this.#options.assertLocalAllowed(); this.#options.assertFreshNoOwnedAllocations();
    if (this.#lease !== null) { assertCurrentPcbDiagnosticLaunchExclusion(this.#lease); }
  }
  async #current(original: CurrentFootprintCombinedHistoricalSnapshot): Promise<void> {
    this.#local(); await assertCurrentFootprintCombinedHistoricalSnapshot(original); this.#local();
    await this.#options.assertOtherLaunchesSettled(); this.#local();
    await assertNoUnresolvedOrdinaryLaunches(); this.#local();
    await assertCurrentFootprintCombinedAbandonmentIsolated(original); this.#local();
  }
  public async run(input: unknown): Promise<Record<string, unknown>> {
    const request = currentFootprintCombinedAbandonUnknownRequestSchema.parse(input);
    need(!this.#busy, "BUSY"); this.#local(); this.#busy = true;
    try {
      const original = this.#pending?.original ?? await readCurrentFootprintCombinedHistoricalSnapshot(request.operationId);
      const source = requireCurrentFootprintCombinedHistoricalSnapshot(original);
      need(source.operationId === request.operationId && source.originalIntentSha256 === request.expectedIntentSha256, "ORIGINAL_DIGEST");
      await this.#current(original);
      this.#lease = acquireCurrentPcbDiagnosticLaunchExclusion(); this.#local();
      let receipt = await readCurrentFootprintCombinedAbandonment(original); await this.#current(original);
      if (receipt?.result !== undefined && receipt.result !== null) { return publicResult(receipt.result); }
      if (this.#pending === null) {
        const installation = await this.#verify(this.#options); await this.#current(original);
        // The nonce is lexical to this observation pair. Caller JSON and a
        // Persisted old nonce can never produce the in-memory Pending plan.
        const nonce = randomBytes(32).toString("hex");
        need(!await this.#linux(), "OTHER_LINUX_FACADE"); await this.#current(original);
        const observation = await this.#windows(this.#options); await this.#current(original);
        requireWindowsAbsence(observation);
        need(!await this.#linux(), "OTHER_LINUX_FACADE"); await this.#current(original);
        const finalInstallation = await this.#verify(this.#options); await this.#current(original);
        need(canonicalJson(finalInstallation) === canonicalJson(installation), "INSTALLATION_CHANGED");
        const fields = { operationId: source.operationId, originalIntentSha256: source.originalIntentSha256,
          originalRosterSha256: source.originalRosterSha256, originalIdentitySha256: source.originalIdentitySha256,
          originalProducerFacadeSha256: source.originalProducerFacadeSha256, originalInstallationSha256: source.originalInstallationSha256 };
        const intent = receipt?.intent ?? currentFootprintCombinedAbandonmentIntentSchema.parse({
          schema: "easyeda-pro-control.footprint-combined-unknown-abandonment-intent.v1", ...fields,
          createdAt: new Date().toISOString(), facadeSha256: installation.facadeSha256, installationSha256: sha256Json(installation),
          confirmAbandonUnknownLaunch: true, acceptUnobservedDescendants: true, acceptUnknownProfileEffects: true,
        });
        need(intent.facadeSha256 === installation.facadeSha256 && intent.installationSha256 === sha256Json(installation), "RECOVERY_PRODUCER_CHANGED");
        const result = currentFootprintCombinedAbandonmentResultSchema.parse({
          schema: "easyeda-pro-control.footprint-combined-unknown-abandoned.v1", ...fields,
          createdAt: new Date().toISOString(), abandonmentIntentSha256: sha256Json(intent), observationNonceSha256: sha256Text(nonce),
          observation, otherLinuxFacadePresent: false, linuxFacadeSamples: 2, launchOutcome: "unknown", nonDispatchProved: false,
          terminationProved: false, nativeResourcesReleased: false, originalLaunchIdentityVerified: false, retainedLaunchAuthority: false,
          designExecutionAuthorized: false, saveAuthorized: false, persistenceVerified: false,
        });
        const observationToken = Object.freeze({ profile: "private.current-footprint-combined-abandonment-observation.v1" });
        this.#observations.set(observationToken, Object.freeze({ original, nonceSha256: sha256Text(nonce), nativeText: canonicalJson(observation) }));
        this.#pending = Object.freeze({ observationToken, original, intent: Object.freeze(intent), result: Object.freeze(result) });
      }
      const pending = this.#pending; await this.#current(original);
      const issued = this.#observations.get(pending.observationToken);
      need(pending.original === original && issued !== undefined && issued.original === original &&
        issued.nonceSha256 === pending.result.observationNonceSha256 && issued.nativeText === canonicalJson(pending.result.observation), "OBSERVATION_ORIGIN_CHANGED");
      if (receipt === null) { await this.#publish(original, "intent.json", pending.intent); await this.#current(original); }
      receipt = await readCurrentFootprintCombinedAbandonment(original); await this.#current(original);
      need(receipt !== null && canonicalJson(receipt.intent) === canonicalJson(pending.intent), "INTENT_PUBLICATION_CHANGED");
      if (receipt.result === null) { await this.#publish(original, "abandoned.json", pending.result); await this.#current(original); }
      receipt = await readCurrentFootprintCombinedAbandonment(original); await this.#current(original);
      need(receipt !== null && canonicalJson(receipt.result) === canonicalJson(pending.result), "RESULT_PUBLICATION_CHANGED");
      return publicResult(pending.result);
    } finally {
      if (this.#lease !== null) { releaseCurrentPcbDiagnosticLaunchExclusion(this.#lease); this.#lease = null; }
      this.#busy = false;
    }
  }
}
