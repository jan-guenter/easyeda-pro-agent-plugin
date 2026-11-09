/** Isolated historical resolution. This owner has no application launcher,
 * original native handle, writer, Save action or owner-adoption method. */
import { randomBytes } from "node:crypto";
import { canonicalJson, sha256Json, sha256Text } from "./core.ts";
import { currentPcbViaPreopeningRelinquishmentIntentSchema, currentPcbViaPreopeningRelinquishmentRequestSchema, currentPcbViaPreopeningRelinquishmentResultSchema } from "./current-pcb-via-preopening-relinquishment-contract.ts";
import type { CurrentPcbViaPreopeningRelinquishmentIntent as Intent, CurrentPcbViaPreopeningRelinquishmentResult as Result } from "./current-pcb-via-preopening-relinquishment-contract.ts";
import { assertCurrentPcbViaPreopeningHistoricalSnapshot, publishCurrentPcbViaPreopeningRelinquishment, readCurrentPcbViaPreopeningHistoricalSnapshot, readCurrentPcbViaPreopeningRelinquishment, requireCurrentPcbViaPreopeningHistoricalSnapshot } from "./current-pcb-via-preopening-relinquishment-journal.ts";
import type { CurrentPcbViaPreopeningHistoricalSnapshot as Snapshot } from "./current-pcb-via-preopening-relinquishment-journal.ts";
import { acquireCurrentPcbDiagnosticLaunchExclusion, assertCurrentPcbDiagnosticLaunchExclusion, assertNoUnresolvedCurrentPcbDiagnosticLaunches, releaseCurrentPcbDiagnosticLaunchExclusion } from "./current-pcb-diagnostic-lifecycle-journal.ts";
import type { CurrentPcbDiagnosticLaunchLease } from "./current-pcb-diagnostic-lifecycle-journal.ts";
import type { CurrentPcbDiagnosticInstallationOptions } from "./current-pcb-diagnostic-installation.ts";
import { verifyCurrentPcb209DiagnosticInstallation } from "./current-pcb-diagnostic-installation.ts";
import { assertCurrentPcbViaPreopeningRelinquishmentIsolated } from "./current-pcb-via-write-journal.ts";
import { assertNoUnresolvedOrdinaryLaunches } from "./ordinary-launch.ts";
import { observeOrdinaryLaunchRecovery } from "./ordinary-launch-recovery.ts";
import { observeOtherCurrentFootprintCombinedLinuxFacade } from "./current-footprint-combined-linux-facade-observation.ts";

export interface CurrentPcbViaPreopeningRelinquishmentOptions extends CurrentPcbDiagnosticInstallationOptions {
  readonly assertLocalAllowed: () => void;
  readonly assertFreshNoOwnedAllocations: () => void;
  readonly assertOtherOperationsSettled: (snapshot: Snapshot) => Promise<unknown>;
}
export interface CurrentPcbViaPreopeningRelinquishmentDependencies {
  readonly verifyInstallation?: typeof verifyCurrentPcb209DiagnosticInstallation;
  readonly observeWindows?: typeof observeOrdinaryLaunchRecovery;
  readonly observeLinux?: typeof observeOtherCurrentFootprintCombinedLinuxFacade;
}
interface Pending { readonly snapshot: Snapshot; readonly token: object; readonly intent: Intent; readonly result: Result }
function need(value: boolean): asserts value { if (!value) { throw new Error("PCB_VIA_PREOPENING_RELINQUISHMENT"); } }
export class CurrentPcbViaPreopeningRelinquishment {
  readonly #options: CurrentPcbViaPreopeningRelinquishmentOptions;
  readonly #verify: typeof verifyCurrentPcb209DiagnosticInstallation;
  readonly #windows: typeof observeOrdinaryLaunchRecovery;
  readonly #linux: typeof observeOtherCurrentFootprintCombinedLinuxFacade;
  readonly #observations = new WeakMap<object, Readonly<{ snapshot: Snapshot; nonceSha256: string; nativeText: string }>>();
  #lease: CurrentPcbDiagnosticLaunchLease | null = null;
  #pending: Pending | null = null;
  #busy = false;
  public constructor(options: CurrentPcbViaPreopeningRelinquishmentOptions, dependencies: CurrentPcbViaPreopeningRelinquishmentDependencies = {}) {
    this.#options = Object.freeze({ ...options }); this.#verify = dependencies.verifyInstallation ?? verifyCurrentPcb209DiagnosticInstallation;
    this.#windows = dependencies.observeWindows ?? observeOrdinaryLaunchRecovery; this.#linux = dependencies.observeLinux ?? observeOtherCurrentFootprintCombinedLinuxFacade;
  }
  public hasActiveReservation(): boolean { return this.#busy || this.#lease !== null || this.#pending !== null; }
  #local(): void { this.#options.assertLocalAllowed(); this.#options.assertFreshNoOwnedAllocations(); if (this.#lease !== null) { assertCurrentPcbDiagnosticLaunchExclusion(this.#lease); } }
  async #current(snapshot: Snapshot): Promise<void> {
    this.#local(); await assertCurrentPcbViaPreopeningHistoricalSnapshot(snapshot); this.#local();
    await assertNoUnresolvedCurrentPcbDiagnosticLaunches(); this.#local();
    await assertNoUnresolvedOrdinaryLaunches(); this.#local();
    await assertCurrentPcbViaPreopeningRelinquishmentIsolated(snapshot); this.#local();
  }
  /** Full admission is fresh at entry and immediately before each metadata
   * publication. Intermediate observations grant no authority and retain the
   * original journal, local owner and exclusion checks at every await. Never
   * cache the admission result or carry it into another publication. */
  async #admission(snapshot: Snapshot): Promise<void> {
    await this.#current(snapshot);
    await this.#options.assertOtherOperationsSettled(snapshot);
    await this.#current(snapshot);
  }
  public async run(input: unknown): Promise<Record<string, unknown>> {
    const request = currentPcbViaPreopeningRelinquishmentRequestSchema.parse(input); this.#local(); need(!this.#busy); this.#busy = true;
    try {
      const snapshot = this.#pending?.snapshot ?? await readCurrentPcbViaPreopeningHistoricalSnapshot(request.operationId);
      const original = requireCurrentPcbViaPreopeningHistoricalSnapshot(snapshot);
      need(original.operationId === request.operationId && original.originalEntireJournalSha256 === request.expectedEntireJournalSha256);
      await this.#admission(snapshot); this.#lease = acquireCurrentPcbDiagnosticLaunchExclusion(); this.#local();
      let receipt = await readCurrentPcbViaPreopeningRelinquishment(snapshot); await this.#current(snapshot);
      if (receipt?.result !== null && receipt?.result !== undefined) { return this.#public(receipt.result); }
      if (this.#pending === null) {
        const installation = await this.#verify(this.#options); await this.#current(snapshot);
        const nonce = randomBytes(32).toString("hex"); need(!await this.#linux()); await this.#current(snapshot);
        const observation = await this.#windows(this.#options); await this.#current(snapshot);
        need(!observation.otherPowerShellPresent && !observation.sameNameProcessPresent);
        need(!await this.#linux()); await this.#current(snapshot);
        const finalInstallation = await this.#verify(this.#options); await this.#current(snapshot); need(canonicalJson(finalInstallation) === canonicalJson(installation));
        const fields = { operationId: original.operationId, originalEntireJournalSha256: original.originalEntireJournalSha256, originalStoredJournalSha256: original.originalStoredJournalSha256, originalPlanSha256: original.originalPlanSha256 };
        const intent = receipt?.intent ?? currentPcbViaPreopeningRelinquishmentIntentSchema.parse({ schema: "easyeda-pro-control.pcb-via-preopening-relinquishment-intent.v1", ...fields, createdAt: new Date().toISOString(), facadeSha256: installation.facadeSha256, installationSha256: sha256Json(installation), confirmHistoricalRelinquishment: true, acceptMissingOriginalJobAndReleaseProof: true, acceptUnknownProfileEffects: true });
        need(intent.facadeSha256 === installation.facadeSha256 && intent.installationSha256 === sha256Json(installation));
        const nonceSha256 = sha256Text(nonce);
        const result = currentPcbViaPreopeningRelinquishmentResultSchema.parse({ schema: "easyeda-pro-control.pcb-via-preopening-relinquished.v1", ...fields, createdAt: new Date().toISOString(), relinquishmentIntentSha256: sha256Json(intent), observationNonceSha256: nonceSha256, observation, otherLinuxFacadePresent: false, linuxFacadeSamples: 2, originalJournalModified: false, originalJobEmptyProved: false, originalHelperReleaseAcknowledged: false, originalNativeHandlesAdopted: false, terminationProved: false, nativeResourcesReleased: false, projectOpeningRecorded: false, createRecorded: false, saveRecorded: false, completionClaimed: false, persistenceVerified: false, retainedLaunchAuthority: false, designExecutionAuthorized: false, saveAuthorized: false });
        const token = Object.freeze({ profile: "private.current-pcb-via-preopening-relinquishment-observation.v1" });
        this.#observations.set(token, Object.freeze({ snapshot, nonceSha256, nativeText: canonicalJson(observation) }));
        this.#pending = Object.freeze({ snapshot, token, intent: Object.freeze(intent), result: Object.freeze(result) });
      }
      const pending = this.#pending; const observed = this.#observations.get(pending.token); await this.#current(snapshot);
      need(pending.snapshot === snapshot && observed?.snapshot === snapshot && observed.nonceSha256 === pending.result.observationNonceSha256 && observed.nativeText === canonicalJson(pending.result.observation));
      if (receipt === null) { await this.#admission(snapshot); await publishCurrentPcbViaPreopeningRelinquishment(snapshot, "intent.json", pending.intent); await this.#current(snapshot); }
      receipt = await readCurrentPcbViaPreopeningRelinquishment(snapshot); await this.#current(snapshot); need(receipt !== null && canonicalJson(receipt.intent) === canonicalJson(pending.intent));
      if (receipt.result === null) { await this.#admission(snapshot); await publishCurrentPcbViaPreopeningRelinquishment(snapshot, "relinquished.json", pending.result); await this.#current(snapshot); }
      receipt = await readCurrentPcbViaPreopeningRelinquishment(snapshot); await this.#current(snapshot); need(receipt !== null && canonicalJson(receipt.result) === canonicalJson(pending.result));
      return this.#public(pending.result);
    } finally { if (this.#lease !== null) { releaseCurrentPcbDiagnosticLaunchExclusion(this.#lease); this.#lease = null; } this.#busy = false; }
  }
  #public(result: Result): Record<string, unknown> { this.#pending = null; return { ...structuredClone(result), state: "historical-failed-via-relinquished", startupBlockerRelinquished: true, executionAuthorized: false }; }
}
/** Retain a failed original publication in the registered metadata slot. */
export async function runOriginalCurrentPcbViaPreopeningMetadata(owner: CurrentPcbViaPreopeningRelinquishment, run: CurrentPcbViaPreopeningRelinquishment["run"], request: unknown, slot: Readonly<{ current: () => object | undefined; set: (value: CurrentPcbViaPreopeningRelinquishment | undefined) => void; assertOriginal: () => void }>): Promise<Record<string, unknown>> {
  slot.assertOriginal(); need(slot.current() === undefined || slot.current() === owner); slot.set(owner); slot.assertOriginal();
  try { const result = await run.call(owner, request); slot.assertOriginal(); need(slot.current() === owner); return result; }
  finally { slot.assertOriginal(); if (slot.current() === owner && !owner.hasActiveReservation()) { slot.set(undefined); } }
}
