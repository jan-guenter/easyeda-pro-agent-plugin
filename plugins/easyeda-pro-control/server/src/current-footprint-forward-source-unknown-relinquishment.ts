/** Historical metadata only. No process handles, native owners or application control are exposed. */
/* oxlint-disable import/max-dependencies -- Compose the separate original-history, global exclusion, installation and file-proof boundaries. */
import { randomBytes } from "node:crypto";
import { canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { currentFootprintForwardSourceRelinquishmentIntentSchema, currentFootprintForwardSourceRelinquishmentRequestSchema,
  currentFootprintForwardSourceRelinquishmentResultSchema } from "./current-footprint-forward-source-relinquishment-contract.ts";
import type { CurrentFootprintForwardSourceRelinquishmentIntent as Intent, CurrentFootprintForwardSourceRelinquishmentResult as Result } from "./current-footprint-forward-source-relinquishment-contract.ts";
import { assertCurrentFootprintForwardSourceHistoricalSnapshot, publishCurrentFootprintForwardSourceRelinquishment,
  readCurrentFootprintForwardSourceHistoricalSnapshot, readCurrentFootprintForwardSourceRelinquishment,
  requireCurrentFootprintForwardSourceHistoricalSnapshot } from "./current-footprint-forward-source-relinquishment-journal.ts";
import type { CurrentFootprintForwardSourceHistoricalSnapshot } from "./current-footprint-forward-source-relinquishment-journal.ts";
import { acquireCurrentPcbDiagnosticLaunchExclusion, assertCurrentFootprintForwardSourceRelinquishmentIsolated,
  assertCurrentPcbDiagnosticLaunchExclusion, releaseCurrentPcbDiagnosticLaunchExclusion } from "./current-pcb-diagnostic-lifecycle-journal.ts";
import type { CurrentPcbDiagnosticLaunchLease } from "./current-pcb-diagnostic-lifecycle-journal.ts";
import type { CurrentPcbDiagnosticLifecycleOptions } from "./current-pcb-diagnostic-lifecycle.ts";
import { assertNoUnresolvedOrdinaryLaunches } from "./ordinary-launch.ts";
import { verifyCurrentPcb209DiagnosticInstallation } from "./current-pcb-diagnostic-installation.ts";
import { observeOrdinaryLaunchRecovery } from "./ordinary-launch-recovery.ts";
import { observeOtherCurrentFootprintCombinedLinuxFacade } from "./current-footprint-combined-linux-facade-observation.ts";
import { collectCurrentFootprintForwardOpeningFileProofInput, revalidateCurrentFootprintForwardOpeningFileProof } from "./current-footprint-forward-opening-relinquishment-file-proof.ts";

export type CurrentFootprintForwardSourceUnknownRelinquishmentOptions = Omit<CurrentPcbDiagnosticLifecycleOptions, "assertOtherLaunchesSettled" | "assertAllowed"> & Readonly<{
  assertFreshNoOwnedAllocations: () => void;
  assertOtherLaunchesSettled: (snapshot: CurrentFootprintForwardSourceHistoricalSnapshot) => Promise<void>;
}>;
/** Offline observation seams cannot select a different historical profile or original snapshot. */
export interface CurrentFootprintForwardSourceUnknownRelinquishmentDependencies {
  readonly verifyInstallation?: typeof verifyCurrentPcb209DiagnosticInstallation;
  readonly observeWindows?: typeof observeOrdinaryLaunchRecovery;
  readonly observeLinux?: typeof observeOtherCurrentFootprintCombinedLinuxFacade;
  readonly publishRecord?: typeof publishCurrentFootprintForwardSourceRelinquishment;
  readonly collectFileProof?: typeof collectCurrentFootprintForwardOpeningFileProofInput;
  readonly revalidateFileProof?: typeof revalidateCurrentFootprintForwardOpeningFileProof;
}
interface Pending { readonly token: object; readonly original: CurrentFootprintForwardSourceHistoricalSnapshot; readonly intent: Intent; readonly result: Result }
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`FORWARD_SOURCE_RELINQUISHMENT_${code}`); } }
function windowsAbsent(observation: Awaited<ReturnType<typeof observeOrdinaryLaunchRecovery>>): void {
  need(!observation.otherPowerShellPresent && !observation.sameNameProcessPresent, "WINDOWS_PROCESS_PRESENT");
}
export class CurrentFootprintForwardSourceUnknownRelinquishment {
  readonly #options: CurrentFootprintForwardSourceUnknownRelinquishmentOptions;
  readonly #verify: typeof verifyCurrentPcb209DiagnosticInstallation;
  readonly #windows: typeof observeOrdinaryLaunchRecovery;
  readonly #linux: typeof observeOtherCurrentFootprintCombinedLinuxFacade;
  readonly #publish: typeof publishCurrentFootprintForwardSourceRelinquishment;
  readonly #files: typeof collectCurrentFootprintForwardOpeningFileProofInput;
  readonly #revalidateFiles: typeof revalidateCurrentFootprintForwardOpeningFileProof;
  readonly #observations = new WeakMap<object, Readonly<{ original: CurrentFootprintForwardSourceHistoricalSnapshot; nonceSha256: string; text: string }>>();
  #lease: CurrentPcbDiagnosticLaunchLease | null = null;
  #pending: Pending | null = null;
  #busy = false;
  /** Capture the original fixed collectors once. Caller JSON cannot supply a
   * profile, observation, nonce, process target or native recovery authority. */
  public constructor(options: CurrentFootprintForwardSourceUnknownRelinquishmentOptions, dependencies: CurrentFootprintForwardSourceUnknownRelinquishmentDependencies = {}) {
    this.#options = Object.freeze({ ...options }); this.#verify = dependencies.verifyInstallation ?? verifyCurrentPcb209DiagnosticInstallation;
    this.#windows = dependencies.observeWindows ?? observeOrdinaryLaunchRecovery;
    this.#linux = dependencies.observeLinux ?? observeOtherCurrentFootprintCombinedLinuxFacade;
    this.#publish = dependencies.publishRecord ?? publishCurrentFootprintForwardSourceRelinquishment;
    this.#files = dependencies.collectFileProof ?? collectCurrentFootprintForwardOpeningFileProofInput;
    this.#revalidateFiles = dependencies.revalidateFileProof ?? revalidateCurrentFootprintForwardOpeningFileProof;
  }
  /** Unknown publication acknowledgments retain this metadata reservation until
   * the same original pending bytes are settled. It owns no native resources. */
  public hasActiveReservation(): boolean { return this.#busy || this.#lease !== null || this.#pending !== null; }
  #local(): void {
    this.#options.assertLocalAllowed(); this.#options.assertFreshNoOwnedAllocations();
    if (this.#lease !== null) { assertCurrentPcbDiagnosticLaunchExclusion(this.#lease); }
  }
  /** Keep the original immutable history and unused coordinator current at
   * every file await. This metadata-only path allocates no application owner. */
  async #current(original: CurrentFootprintForwardSourceHistoricalSnapshot): Promise<void> {
    this.#local(); await assertCurrentFootprintForwardSourceHistoricalSnapshot(original); this.#local();
  }
  /** Recheck every foreign operation before producing new receipt bytes.
   * Process and completed-file observations are refreshed after this potentially
   * expensive read. This gate grants no live or cached quarantine clearance. */
  async #publicationGate(original: CurrentFootprintForwardSourceHistoricalSnapshot): Promise<void> {
    await this.#current(original);
    await this.#options.assertOtherLaunchesSettled(original); await this.#current(original);
    await assertNoUnresolvedOrdinaryLaunches(); await this.#current(original);
    await assertCurrentFootprintForwardSourceRelinquishmentIsolated(original); await this.#current(original);
  }
  /** Collect one lexical observation plan and publish only separate sidecars.
   * Repeated calls settle original pending bytes; no application work is replayed. */
  public async run(input: unknown): Promise<Record<string, unknown>> {
    const request = currentFootprintForwardSourceRelinquishmentRequestSchema.parse(input);
    need(!this.#busy, "BUSY"); this.#local(); this.#busy = true;
    try {
      const original = this.#pending?.original ?? await readCurrentFootprintForwardSourceHistoricalSnapshot(request.operationId);
      const source = requireCurrentFootprintForwardSourceHistoricalSnapshot(original);
      need(source.operationId === request.operationId && source.originalManifestSha256 === request.expectedManifestSha256 &&
        source.originalRosterSha256 === request.expectedRosterSha256 && source.originalIntentSha256 === request.expectedIntentSha256 &&
        source.originalBindingSha256 === request.expectedBindingSha256, "ORIGINAL_DIGEST");
      await this.#current(original);
      this.#lease = acquireCurrentPcbDiagnosticLaunchExclusion(); this.#local();
      let receipt = await readCurrentFootprintForwardSourceRelinquishment(original); await this.#current(original);
      if (receipt?.result !== undefined && receipt.result !== null) {
        need(this.#pending === null || canonicalJson(receipt.result) === canonicalJson(this.#pending.result), "RESULT_PUBLICATION_CHANGED");
        this.#pending = null; return structuredClone(receipt.result);
      }
      if (request.action === "settle-unknown-source-opening") {
        // This lane can publish only the privately retained observation plan.
        // Missing pending bytes never authorize new collectors or a new nonce.
        need(this.#pending !== null, "RETAINED_METADATA_REQUIRED");
      }
      if (this.#pending === null) {
        const installation = await this.#verify(this.#options); await this.#current(original);
        if (receipt !== null) {
          need(receipt.intent.installationSha256 === sha256Json(installation) &&
            receipt.intent.facadeSha256 === installation.facadeSha256, "INTENT_INSTALLATION_CHANGED");
        }
        need(!await this.#linux(), "OTHER_LINUX_FACADE"); await this.#current(original);
        const nonce = randomBytes(32).toString("hex");
        const observationBefore = await this.#windows(this.#options); await this.#current(original); windowsAbsent(observationBefore);
        const fileProof = await this.#files(source.fileInput, () => this.#current(original)); await this.#current(original);
        await this.#publicationGate(original);
        await this.#revalidateFiles(fileProof); await this.#current(original);
        const finalInstallation = await this.#verify(this.#options); await this.#current(original);
        need(canonicalJson(finalInstallation) === canonicalJson(installation), "INSTALLATION_CHANGED");
        const observation = await this.#windows(this.#options); await this.#current(original); windowsAbsent(observation);
        need(!await this.#linux(), "OTHER_LINUX_FACADE"); await this.#current(original);
        await this.#revalidateFiles(fileProof); await this.#current(original);
        const { fileInput: _input, historySemanticSha256: _history, ...fields } = source;
        const intent = receipt?.intent ?? currentFootprintForwardSourceRelinquishmentIntentSchema.parse({
          schema: "easyeda-pro-control.footprint-forward-source-relinquishment-intent.v1", ...fields,
          createdAt: new Date().toISOString(), facadeSha256: installation.facadeSha256, installationSha256: sha256Json(installation),
          confirmRelinquishUnknownSourceOpening: true, acceptUnknownCaptureOutcome: true,
        });
        const result = currentFootprintForwardSourceRelinquishmentResultSchema.parse({
          schema: "easyeda-pro-control.footprint-forward-source-relinquished.v1", ...fields, createdAt: new Date().toISOString(),
          relinquishmentIntentSha256: sha256Json(intent), observationNonceSha256: sha256Text(nonce), observationBefore, observation,
          otherLinuxFacadePresent: false, linuxFacadeSamples: 2, fileProof, captureOutcome: "unknown", terminationOutcome: "unknown", helperReleaseOutcome: "unknown",
          terminationProved: false, nativeResourcesReleased: false, helperReleaseAcknowledged: false, originalLaunchIdentityVerified: false,
          retainedLaunchAuthority: false, originalJournalUntouched: true, startupBlockerRelinquished: true, historicalCompletionVerified: false,
          authorityRestored: false, replayAllowed: false, executionReady: false, executionAuthorized: false, designExecutionAuthorized: false, saveAuthorized: false,
        });
        const token = Object.freeze({ profile: "private.forward-source-relinquishment-observation.v1" });
        this.#observations.set(token, Object.freeze({ original, nonceSha256: sha256Text(nonce), text: canonicalJson({ observationBefore, observation, fileProof }) }));
        this.#pending = Object.freeze({ token, original, intent: Object.freeze(intent), result: Object.freeze(result) });
      } else { await this.#publicationGate(original); }
      const pending = this.#pending; await this.#current(original);
      const issued = this.#observations.get(pending.token);
      need(pending.original === original && issued !== undefined && issued.original === original && issued.nonceSha256 === pending.result.observationNonceSha256 &&
        issued.text === canonicalJson({ observationBefore: pending.result.observationBefore, observation: pending.result.observation, fileProof: pending.result.fileProof }), "OBSERVATION_ORIGIN_CHANGED");
      if (receipt === null) { await this.#publish(original, "intent.json", pending.intent); await this.#current(original); }
      receipt = await readCurrentFootprintForwardSourceRelinquishment(original); await this.#current(original);
      need(receipt !== null && canonicalJson(receipt.intent) === canonicalJson(pending.intent), "INTENT_PUBLICATION_CHANGED");
      if (receipt.result === null) { await this.#publish(original, "relinquished.json", pending.result); await this.#current(original); }
      receipt = await readCurrentFootprintForwardSourceRelinquishment(original); await this.#current(original);
      need(receipt !== null && canonicalJson(receipt.result) === canonicalJson(pending.result), "RESULT_PUBLICATION_CHANGED");
      this.#pending = null; return structuredClone(pending.result);
    } finally {
      if (this.#lease !== null) { releaseCurrentPcbDiagnosticLaunchExclusion(this.#lease); this.#lease = null; }
      this.#busy = false;
    }
  }
}
