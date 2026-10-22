/** Original String clock/ledger composition for a retained native owner.
 * This class has no server RPC, create or Save sender. It reserves and consumes
 * accounting around an independently owned fixed runner, never grants that
 * runner eligibility or reconstructs an owner from journal JSON. */
import { CurrentPcbStringLifecycleLedger } from "./current-pcb-string-lifecycle-ledger.ts";
import type { CurrentPcbStringLedgerAttempt, CurrentPcbStringLedgerStatus } from "./current-pcb-string-lifecycle-ledger.ts";
import { CurrentPcbStringNativeClockIssuer } from "./current-pcb-string-native-clock.ts";
import type { CurrentPcbStringNativeClockObservation } from "./current-pcb-string-native-clock.ts";
import { currentPcbStringSaveProvenanceSource } from "./current-pcb-string-save-provenance.ts";
import type { CurrentPcbStringSaveProvenance } from "./current-pcb-string-save-provenance.ts";
import { CurrentPcbStringServerClockRunner } from "./current-pcb-string-server-clock-runner.ts";
import type { CurrentPcbStringServerClockPacket } from "./current-pcb-string-server-clock-runner.ts";
import type { readExactSqlInventory } from "./sqlite-inventory.ts";

type Phase = "ready" | "server-clock-reserved" | "save-clock-armed" | "save-post-recorded" | "closed-sql-compared" | "failed";
const ownedLedgers = new WeakSet<CurrentPcbStringLifecycleLedger>();
const ownedIssuers = new WeakSet<CurrentPcbStringNativeClockIssuer>();
// oxlint-disable typescript/unbound-method -- Only original private-field class methods and their retained receivers are used.
const ledgerProvenance = CurrentPcbStringLifecycleLedger.prototype.originalSaveProvenance;
const ledgerStatus = CurrentPcbStringLifecycleLedger.prototype.status;
const reserveClock = CurrentPcbStringLifecycleLedger.prototype.reserveServerClock;
const recordClock = CurrentPcbStringLifecycleLedger.prototype.recordServerClock;
const stopClock = CurrentPcbStringLifecycleLedger.prototype.stopServerClock;
const armClock = CurrentPcbStringLifecycleLedger.prototype.armSaveClock;
const recordPost = CurrentPcbStringLifecycleLedger.prototype.recordSavePost;
const compareClosed = CurrentPcbStringLifecycleLedger.prototype.compareClosedSql;
const nativeObserve = CurrentPcbStringNativeClockIssuer.prototype.observe;
const nativeOriginal = CurrentPcbStringNativeClockIssuer.prototype.requireOriginal;
const nativeEvidence = CurrentPcbStringNativeClockIssuer.prototype.evidence;
const serverProvenance = CurrentPcbStringServerClockRunner.prototype.requireOriginalProvenance;
const serverOriginal = CurrentPcbStringServerClockRunner.prototype.requireOriginal;
// oxlint-enable typescript/unbound-method
function need(value: boolean, detail: string): asserts value {
  if (!value) { throw new Error(`PCB_STRING_CLOCK_COORDINATOR: ${detail}`); }
}
export class CurrentPcbStringClockCoordinator {
  readonly #ledger: CurrentPcbStringLifecycleLedger;
  readonly #issuer: CurrentPcbStringNativeClockIssuer;
  readonly #provenance: CurrentPcbStringSaveProvenance;
  #phase: Phase = "ready";
  #busy = false;
  #runner: CurrentPcbStringServerClockRunner | null = null;
  #before: CurrentPcbStringNativeClockObservation | null = null;
  #attempt: CurrentPcbStringLedgerAttempt | null = null;
  #termination: CurrentPcbStringNativeClockObservation | null = null;
  private constructor(ledger: CurrentPcbStringLifecycleLedger, issuer: CurrentPcbStringNativeClockIssuer,
    provenance: CurrentPcbStringSaveProvenance) {
    this.#ledger = ledger; this.#issuer = issuer; this.#provenance = provenance;
  }
  /** Own each existing ledger/issuer once. The owner still has to prove actual
   * startup, subscribers, destinations and stable eligibility before any RPC. */
  public static prepare(ledger: CurrentPcbStringLifecycleLedger,
    issuer: CurrentPcbStringNativeClockIssuer): CurrentPcbStringClockCoordinator {
    const provenance = ledgerProvenance.call(ledger), state = ledgerStatus.call(ledger);
    const clocks = nativeEvidence.call(issuer);
    need(!ownedLedgers.has(ledger) && !ownedIssuers.has(issuer) && state.phase === "publication-compared" && !state.busy &&
      !state.serverClockAttemptConsumed && !state.saveAttemptConsumed && !clocks.failed && !clocks.inFlight &&
      clocks.phasesAttempted.length === 0, "unused original ledger/native issuer required");
    currentPcbStringSaveProvenanceSource(provenance); ownedLedgers.add(ledger); ownedIssuers.add(issuer);
    return new CurrentPcbStringClockCoordinator(ledger, issuer, provenance);
  }
  public status(): Readonly<{ profile: "private.current-pcb-string-clock-coordinator.v1"; phase: Phase; busy: boolean;
    ledger: CurrentPcbStringLedgerStatus; nativeTerminationClockRetained: boolean;
    startupOwnershipVerified: false; destinationContainmentVerified: false; eligibilityVerified: false;
    serverRpcSenderImplemented: false; createSenderImplemented: false; saveSenderImplemented: false; executionAuthorized: false }> {
    return Object.freeze({ profile: "private.current-pcb-string-clock-coordinator.v1", phase: this.#phase, busy: this.#busy,
      ledger: ledgerStatus.call(this.#ledger), nativeTerminationClockRetained: this.#termination !== null,
      startupOwnershipVerified: false, destinationContainmentVerified: false, eligibilityVerified: false,
      serverRpcSenderImplemented: false, createSenderImplemented: false, saveSenderImplemented: false, executionAuthorized: false });
  }
  #current(): void {
    need(ledgerProvenance.call(this.#ledger) === this.#provenance, "original ledger provenance changed");
    currentPcbStringSaveProvenanceSource(this.#provenance);
  }
  async #step<T>(expected: Phase, action: () => Promise<T>): Promise<T> {
    need(this.#phase === expected && !this.#busy, "original phase consumed or busy"); this.#busy = true;
    try { return await action(); }
    catch (error) { this.#phase = "failed"; throw error; }
    finally { this.#busy = false; }
  }
  /** Native before plus durable intent only. The returned token deliberately
   * has dispatchAuthorized:false. There is no effectful server request here. */
  public reserveServerClock(runner: CurrentPcbStringServerClockRunner): Promise<CurrentPcbStringLedgerAttempt> {
    return this.#step("ready", async () => {
      this.#current();
      need(serverProvenance.call(runner, this.#provenance).phase === "ready", "unstarted original server runner required");
      this.#runner = runner;
      this.#before = await nativeObserve.call(this.#issuer, "before");
      this.#current(); nativeOriginal.call(this.#issuer, this.#before);
      this.#attempt = await reserveClock.call(this.#ledger, this.#issuer, this.#before, runner);
      this.#current(); nativeOriginal.call(this.#issuer, this.#before);
      this.#phase = "server-clock-reserved"; return this.#attempt;
    });
  }
  /** Join the independently obtained original packet, sample native armed and
   * persist the clock plan. No supplied packet or caller verifier is accepted. */
  public acceptServerClock(attempt: CurrentPcbStringLedgerAttempt,
    packet: CurrentPcbStringServerClockPacket): Promise<CurrentPcbStringLedgerStatus> {
    need(attempt === this.#attempt, "original server clock reservation required");
    return this.#step("server-clock-reserved", async () => {
      this.#current(); need(this.#runner !== null && this.#before !== null, "original clock sources missing");
      const before = this.#before, runner = this.#runner;
      serverOriginal.call(runner, packet); nativeOriginal.call(this.#issuer, before);
      await recordClock.call(this.#ledger, attempt, runner, packet);
      this.#current(); serverOriginal.call(runner, packet);
      const armed = await nativeObserve.call(this.#issuer, "armed");
      this.#current(); nativeOriginal.call(this.#issuer, armed); serverOriginal.call(runner, packet);
      const result = await armClock.call(this.#ledger, this.#issuer, before, armed, runner, packet);
      this.#current(); nativeOriginal.call(this.#issuer, armed); serverOriginal.call(runner, packet);
      this.#phase = "save-clock-armed"; return result;
    });
  }
  /** Missing/error replies never reopen the once-only reservation. */
  public stopServerClock(attempt: CurrentPcbStringLedgerAttempt): Promise<CurrentPcbStringLedgerStatus> {
    need(attempt === this.#attempt, "original server clock reservation required");
    return this.#step("server-clock-reserved", async () => {
      const result = await stopClock.call(this.#ledger, attempt); this.#phase = "failed"; return result;
    });
  }
  public recordSavePost(): Promise<CurrentPcbStringLedgerStatus> {
    return this.#step("save-clock-armed", async () => {
      this.#current(); need(ledgerStatus.call(this.#ledger).phase === "save-acknowledged", "original Save acknowledgment required");
      const post = await nativeObserve.call(this.#issuer, "post");
      this.#current(); nativeOriginal.call(this.#issuer, post);
      const result = await recordPost.call(this.#ledger, post);
      this.#current(); nativeOriginal.call(this.#issuer, post); this.#phase = "save-post-recorded"; return result;
    });
  }
  /** Closure does not revive actor/renderer checks after exit. The native
   * issuer checks original root/whole-Job termination before its clock sample. */
  public compareClosedSql(after: Awaited<ReturnType<typeof readExactSqlInventory>>): Promise<CurrentPcbStringLedgerStatus> {
    return this.#step("save-post-recorded", async () => {
      this.#termination = await nativeObserve.call(this.#issuer, "termination");
      nativeOriginal.call(this.#issuer, this.#termination);
      const result = await compareClosed.call(this.#ledger, after, this.#termination);
      nativeOriginal.call(this.#issuer, this.#termination);
      this.#phase = "closed-sql-compared"; return result;
    });
  }
}
