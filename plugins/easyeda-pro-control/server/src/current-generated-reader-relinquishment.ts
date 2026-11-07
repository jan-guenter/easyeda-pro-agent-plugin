import { randomBytes } from "node:crypto";
import { canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { currentGeneratedReaderRelinquishmentIntentSchema, currentGeneratedReaderRelinquishmentRequestSchema,
  currentGeneratedReaderRelinquishmentResultSchema } from "./current-generated-reader-relinquishment-contract.ts";
import type { GeneratedReaderRelinquishmentIntent, GeneratedReaderRelinquishmentResult } from "./current-generated-reader-relinquishment-contract.ts";
import { assertGeneratedReaderHistoricalSnapshot, publishGeneratedReaderRelinquishment, readGeneratedReaderHistoricalSnapshot,
  readGeneratedReaderRelinquishment, requireGeneratedReaderHistoricalSnapshot } from "./current-generated-reader-relinquishment-journal.ts";
import type { GeneratedReaderHistoricalSnapshot } from "./current-generated-reader-relinquishment-journal.ts";
import { acquireCurrentPcbDiagnosticLaunchExclusion, assertCurrentPcbDiagnosticLaunchExclusion,
  assertGeneratedReaderRelinquishmentIsolated, releaseCurrentPcbDiagnosticLaunchExclusion } from "./current-pcb-diagnostic-lifecycle-journal.ts";
import type { CurrentPcbDiagnosticLaunchLease } from "./current-pcb-diagnostic-lifecycle-journal.ts";
import type { CurrentPcbDiagnosticLifecycleOptions } from "./current-pcb-diagnostic-lifecycle.ts";
import { assertNoUnresolvedOrdinaryLaunches } from "./ordinary-launch.ts";
import { verifyCurrentPcb209DiagnosticInstallation } from "./current-pcb-diagnostic-installation.ts";
import { observeOrdinaryLaunchRecovery } from "./ordinary-launch-recovery.ts";
import { observeOtherCurrentFootprintCombinedLinuxFacade } from "./current-footprint-combined-linux-facade-observation.ts";

export interface GeneratedReaderRelinquishmentOptions extends CurrentPcbDiagnosticLifecycleOptions {
  readonly assertFreshNoOwnedAllocations: () => void;
}
export interface GeneratedReaderRelinquishmentDependencies {
  readonly verifyInstallation?: typeof verifyCurrentPcb209DiagnosticInstallation;
  readonly observeWindows?: typeof observeOrdinaryLaunchRecovery;
  readonly observeLinux?: typeof observeOtherCurrentFootprintCombinedLinuxFacade;
  readonly publishRecord?: typeof publishGeneratedReaderRelinquishment;
  /** Offline provenance seams only. The registered facade supplies no overrides. */
  readonly readHistoricalSnapshot?: typeof readGeneratedReaderHistoricalSnapshot;
  readonly requireHistoricalSnapshot?: typeof requireGeneratedReaderHistoricalSnapshot;
  readonly assertHistoricalSnapshot?: typeof assertGeneratedReaderHistoricalSnapshot;
  readonly readReceipt?: typeof readGeneratedReaderRelinquishment;
  readonly assertIsolated?: typeof assertGeneratedReaderRelinquishmentIsolated;
}
interface Pending {
  readonly original: GeneratedReaderHistoricalSnapshot; readonly observationToken: object;
  readonly intent: GeneratedReaderRelinquishmentIntent; readonly result: GeneratedReaderRelinquishmentResult;
}
function need(value: boolean, reason: string): asserts value { if (!value) { throw new Error(`GENERATED_READER_RELINQUISHMENT_${reason}`); } }
/** This owner issues historical metadata only. It never adopts the closed
 * reader, closes a process or turns missing helper acknowledgment into success. */
export class CurrentGeneratedReaderRelinquishment {
  readonly #options: GeneratedReaderRelinquishmentOptions;
  readonly #verify: typeof verifyCurrentPcb209DiagnosticInstallation;
  readonly #windows: typeof observeOrdinaryLaunchRecovery;
  readonly #linux: typeof observeOtherCurrentFootprintCombinedLinuxFacade;
  readonly #publish: typeof publishGeneratedReaderRelinquishment;
  readonly #history: Readonly<{
    read: typeof readGeneratedReaderHistoricalSnapshot; require: typeof requireGeneratedReaderHistoricalSnapshot;
    assert: typeof assertGeneratedReaderHistoricalSnapshot; receipt: typeof readGeneratedReaderRelinquishment;
    isolated: typeof assertGeneratedReaderRelinquishmentIsolated;
  }>;
  readonly #observations = new WeakMap<object, Readonly<{ original: GeneratedReaderHistoricalSnapshot; nonceSha256: string; nativeText: string }>>();
  #lease: CurrentPcbDiagnosticLaunchLease | null = null;
  #pending: Pending | null = null;
  #busy = false;
  public constructor(options: GeneratedReaderRelinquishmentOptions, dependencies: GeneratedReaderRelinquishmentDependencies = {}) {
    this.#options = Object.freeze({ ...options }); this.#verify = dependencies.verifyInstallation ?? verifyCurrentPcb209DiagnosticInstallation;
    this.#windows = dependencies.observeWindows ?? observeOrdinaryLaunchRecovery;
    this.#linux = dependencies.observeLinux ?? observeOtherCurrentFootprintCombinedLinuxFacade;
    this.#publish = dependencies.publishRecord ?? publishGeneratedReaderRelinquishment;
    this.#history = Object.freeze({ read: dependencies.readHistoricalSnapshot ?? readGeneratedReaderHistoricalSnapshot,
      require: dependencies.requireHistoricalSnapshot ?? requireGeneratedReaderHistoricalSnapshot,
      assert: dependencies.assertHistoricalSnapshot ?? assertGeneratedReaderHistoricalSnapshot,
      receipt: dependencies.readReceipt ?? readGeneratedReaderRelinquishment,
      isolated: dependencies.assertIsolated ?? assertGeneratedReaderRelinquishmentIsolated });
  }
  public hasActiveReservation(): boolean { return this.#busy || this.#lease !== null || this.#pending !== null; }
  #local(): void {
    this.#options.assertLocalAllowed(); this.#options.assertFreshNoOwnedAllocations();
    if (this.#lease !== null) { assertCurrentPcbDiagnosticLaunchExclusion(this.#lease); }
  }
  async #current(original: GeneratedReaderHistoricalSnapshot): Promise<void> {
    this.#local(); await this.#history.assert(original); this.#local();
    await this.#options.assertOtherLaunchesSettled(); this.#local();
    await assertNoUnresolvedOrdinaryLaunches(); this.#local();
    await this.#history.isolated(original); this.#local();
  }
  public async run(input: unknown): Promise<Record<string, unknown>> {
    const request = currentGeneratedReaderRelinquishmentRequestSchema.parse(input);
    this.#local(); need(!this.#busy, "BUSY"); this.#busy = true;
    try {
      const original = this.#pending?.original ?? await this.#history.read(request.operationId);
      const source = this.#history.require(original);
      need(source.operationId === request.operationId && source.originalRosterSha256 === request.expectedOriginalRosterSha256, "ORIGINAL_DIGEST");
      await this.#current(original); this.#lease = acquireCurrentPcbDiagnosticLaunchExclusion(); this.#local();
      let receipt = await this.#history.receipt(original); await this.#current(original);
      if (receipt?.result !== undefined && receipt.result !== null) { return this.#public(receipt.result); }
      if (this.#pending === null) {
        const installation = await this.#verify(this.#options); await this.#current(original);
        need(!await this.#linux(), "OTHER_LINUX_FACADE"); await this.#current(original);
        const observation = await this.#windows(this.#options); await this.#current(original);
        need(!observation.otherPowerShellPresent && !observation.sameNameProcessPresent, "WINDOWS_PROCESS_PRESENT");
        need(!await this.#linux(), "OTHER_LINUX_FACADE"); await this.#current(original);
        const finalInstallation = await this.#verify(this.#options); await this.#current(original);
        need(canonicalJson(finalInstallation) === canonicalJson(installation), "INSTALLATION_CHANGED");
        const fields = { operationId: source.operationId, originalRosterSha256: source.originalRosterSha256, originalIdentitySha256: source.originalIdentitySha256,
          originalIntentSha256: source.originalIntentSha256, originalCaptureSha256: source.originalCaptureSha256, originalProducerFacadeSha256: source.originalProducerFacadeSha256 };
        const intent = receipt?.intent ?? currentGeneratedReaderRelinquishmentIntentSchema.parse({ schema: "easyeda-pro-control.generated-reader-closed-relinquishment-intent.v1",
          ...fields, createdAt: new Date().toISOString(), facadeSha256: installation.facadeSha256, installationSha256: sha256Json(installation),
          confirmRelinquishClosedReader: true, acceptMissingHelperReleaseAcknowledgment: true });
        need(intent.facadeSha256 === installation.facadeSha256 && intent.installationSha256 === sha256Json(installation), "RECOVERY_PRODUCER_CHANGED");
        const nonceSha256 = sha256Text(randomBytes(32).toString("hex"));
        const result = currentGeneratedReaderRelinquishmentResultSchema.parse({ schema: "easyeda-pro-control.generated-reader-closed-relinquished.v1", ...fields,
          createdAt: new Date().toISOString(), relinquishmentIntentSha256: sha256Json(intent), observationNonceSha256: nonceSha256, observation,
          otherLinuxFacadePresent: false, linuxFacadeSamples: 2, originalTerminationRecordRetained: true, originalClosedDataArtifactsVerified: true,
          originalHelperReleaseAcknowledged: false, originalNativeHandlesAdopted: false, nativeResourcesReleased: false, originalJournalModified: false,
          retainedLaunchAuthority: false, designExecutionAuthorized: false, saveAuthorized: false, persistenceVerified: false });
        const observationToken = Object.freeze({ profile: "private.generated-reader-relinquishment-observation.v1" });
        this.#observations.set(observationToken, Object.freeze({ original, nonceSha256, nativeText: canonicalJson(observation) }));
        this.#pending = Object.freeze({ original, observationToken, intent: Object.freeze(intent), result: Object.freeze(result) });
      }
      const pending = this.#pending; const observed = this.#observations.get(pending.observationToken); await this.#current(original);
      need(pending.original === original && observed?.original === original && observed.nonceSha256 === pending.result.observationNonceSha256 &&
        observed.nativeText === canonicalJson(pending.result.observation), "OBSERVATION_ORIGIN_CHANGED");
      if (receipt === null) { await this.#publish(original, "intent.json", pending.intent); await this.#current(original); }
      receipt = await this.#history.receipt(original); await this.#current(original);
      need(receipt !== null && canonicalJson(receipt.intent) === canonicalJson(pending.intent), "INTENT_PUBLICATION_CHANGED");
      if (receipt.result === null) { await this.#publish(original, "relinquished.json", pending.result); await this.#current(original); }
      receipt = await this.#history.receipt(original); await this.#current(original);
      need(receipt !== null && canonicalJson(receipt.result) === canonicalJson(pending.result), "RESULT_PUBLICATION_CHANGED");
      return this.#public(pending.result);
    } finally {
      if (this.#lease !== null) { releaseCurrentPcbDiagnosticLaunchExclusion(this.#lease); this.#lease = null; }
      this.#busy = false;
    }
  }
  #public(result: GeneratedReaderRelinquishmentResult): Record<string, unknown> {
    this.#pending = null;
    return { ...structuredClone(result), state: "historical-closed-reader-relinquished", startupBlockerRelinquished: true, executionAuthorized: false };
  }
}

/** The registered index uses this same slot barrier. Failed publication keeps
 * the original metadata owner visible to every competing native allocation. */
export async function runOriginalGeneratedReaderMetadata(owner: CurrentGeneratedReaderRelinquishment,
  run: CurrentGeneratedReaderRelinquishment["run"], request: unknown, slot: Readonly<{
    current: () => object | undefined; set: (value: CurrentGeneratedReaderRelinquishment | undefined) => void; assertOriginal: () => void;
  }>): Promise<Record<string, unknown>> {
  slot.assertOriginal(); need(slot.current() === undefined || slot.current() === owner, "INDEX_SLOT_CHANGED"); slot.set(owner); slot.assertOriginal();
  try { const result = await run.call(owner, request); slot.assertOriginal(); need(slot.current() === owner, "INDEX_SLOT_CHANGED"); return result; }
  finally { slot.assertOriginal(); if (slot.current() === owner && !owner.hasActiveReservation()) { slot.set(undefined); } }
}
