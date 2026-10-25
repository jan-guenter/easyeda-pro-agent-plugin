/** Observe the final held source's sole continuation. The enclosing original
 * router proves its subordinate ancestry; this owner neither constructs a
 * fourth realm nor treats script-loaded notification as callback completion. */
import { types } from "node:util";
import { CurrentPcb209RatlineBootstrapOwner } from "./current-pcb-209-ratline-bootstrap-owner.ts";
import type { CurrentPcb209RatlineBootstrapPacket } from "./current-pcb-209-ratline-bootstrap-owner.ts";
import { currentPcb209RatlineContinuationTiming } from "./current-pcb-209-ratline-continuation-timing.ts";

export interface CurrentPcb209RatlineSubordinateContinuationPacket {
  readonly profile: "private.pcb209-ratline-subordinate-continuation.v1";
  readonly source: CurrentPcb209RatlineBootstrapPacket;
  readonly sourceResumeAcknowledged: true;
  readonly sourceResumeObserved: true;
  readonly nativeWorkerTargetIdentityVerified: false;
  readonly callbackReturnCompletionVerified: false;
  readonly completeLiveBaselineVerified: false;
  readonly executionAuthorized: false;
}
const prototype = CurrentPcb209RatlineBootstrapOwner.prototype;
const methods = Object.freeze(Object.fromEntries(Object.getOwnPropertyNames(prototype).filter(key => key !== "constructor")
  .map(key => [key, Object.getOwnPropertyDescriptor(prototype, key)?.value as unknown])));
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`PCB209_RATLINE_SUBORDINATE_CONTINUATION_${code}`); } }
async function bounded<T>(work: Promise<T>, milliseconds = 2500): Promise<T> {
  const expired = Promise.withResolvers<never>(), timer = setTimeout(() => { expired.reject(new Error("PCB209_RATLINE_SUBORDINATE_CONTINUATION_DEADLINE")); }, milliseconds);
  try { return await Promise.race([work, expired.promise]); } finally { clearTimeout(timer); }
}
export class CurrentPcb209RatlineSubordinateContinuation {
  readonly #owner: CurrentPcb209RatlineBootstrapOwner;
  readonly #source: CurrentPcb209RatlineBootstrapPacket;
  readonly #termination: () => Promise<void>;
  #consumed = false;
  #resumeRequested = false;
  #resumed = false;
  #failed = false;
  #released = false;
  #releasing = false;
  #terminationVerified = false;
  #subscriptionAttempted = false;
  #subscriptionReturned = false;
  #unsubscribe: (() => void) | null = null;
  #unsubscribeConsumed = false;
  #cleanupFailure: "SUBSCRIPTION_UNCERTAIN" | "UNSUBSCRIBE_FAILED" | null = null;
  #packet: CurrentPcb209RatlineSubordinateContinuationPacket | null = null;
  public constructor(owner: CurrentPcb209RatlineBootstrapOwner, source: CurrentPcb209RatlineBootstrapPacket,
    assertOriginalTermination: () => Promise<void>) {
    this.#owner = owner; this.#source = source; this.#termination = assertOriginalTermination;
    need(typeof assertOriginalTermination === "function", "TERMINATION_OWNER"); this.#same();
  }
  #same(): void {
    need(!types.isProxy(this.#owner) && Object.getPrototypeOf(this.#owner) === prototype, "ORIGINAL_OWNER");
    for (const [key, method] of Object.entries(methods)) {
      need(!Object.hasOwn(this.#owner, key) && Object.getOwnPropertyDescriptor(prototype, key)?.value === method, "ORIGINAL_METHOD");
    }
  }
  async #current(): Promise<void> {
    this.#same(); need(!this.#failed && !this.#released && !this.#releasing && !this.#terminationVerified && this.#cleanupFailure === null, "NOT_CURRENT");
    await bounded(this.#owner.requireOriginal(this.#source), currentPcb209RatlineContinuationTiming(this.#owner)?.ownerMilliseconds); this.#same();
    need(!this.#failed && !this.#released && !this.#releasing && !this.#terminationVerified && this.#cleanupFailure === null, "NOT_CURRENT");
  }
  readonly #unexpected = (): void => {
    if (!this.#terminationVerified) { this.#failed = true; }
  };
  public async continue(): Promise<CurrentPcb209RatlineSubordinateContinuationPacket> {
    need(!this.#consumed, "CONSUMED"); this.#consumed = true;
    try {
      await this.#current(); const realm = await this.#owner.claimOriginalWorkerRealm(this.#source); await this.#current();
      this.#subscriptionAttempted = true;
      this.#unsubscribe = realm.subscribe({ paused: this.#unexpected, attached: this.#unexpected, lost: this.#unexpected,
        resumed: (): void => {
          if (this.#terminationVerified) { return; }
          if (!this.#resumeRequested || this.#resumed || this.#failed) { this.#unexpected(); return; } this.#resumed = true;
        },
      });
      need(typeof this.#unsubscribe === "function", "SUBSCRIPTION"); this.#subscriptionReturned = true;
      await this.#current(); this.#resumeRequested = true;
      await this.#owner.releaseOriginalPinnedSource(this.#source); await this.#current(); need(this.#resumed, "RESUME_OBSERVATION");
      this.#packet = Object.freeze({ profile: "private.pcb209-ratline-subordinate-continuation.v1", source: this.#source,
        sourceResumeAcknowledged: true, sourceResumeObserved: true, nativeWorkerTargetIdentityVerified: false,
        callbackReturnCompletionVerified: false, completeLiveBaselineVerified: false, executionAuthorized: false }); return this.#packet;
    } catch (error) { this.#failed = true; throw error; }
  }
  public async requireOriginal(packet: CurrentPcb209RatlineSubordinateContinuationPacket): Promise<void> {
    need(packet === this.#packet && this.#packet !== null, "ORIGINAL_PACKET"); await this.#current();
  }
  public abort(): void { this.#same(); need(!this.#released, "RELEASED"); this.#failed = true; }
  /** The worker composite's child gate releases the bootstrap owner separately.
   * This consumes only this observer's original realm subscription. */
  public async releaseAfterTermination(): Promise<void> {
    this.#same(); need(!this.#released && !this.#releasing && this.#cleanupFailure === null, "RELEASE_STATE"); this.#releasing = true;
    try {
      await bounded(this.#termination()); this.#same(); this.#terminationVerified = true;
      if (this.#subscriptionAttempted && !this.#subscriptionReturned) {
        this.#cleanupFailure = "SUBSCRIPTION_UNCERTAIN"; throw new Error("PCB209_RATLINE_SUBORDINATE_CONTINUATION_SUBSCRIPTION_UNCERTAIN");
      }
      if (this.#unsubscribe !== null) {
        const unsubscribe = this.#unsubscribe; this.#unsubscribe = null; this.#unsubscribeConsumed = true;
        try { unsubscribe(); } catch (error) {
          this.#cleanupFailure = "UNSUBSCRIBE_FAILED"; throw new Error("PCB209_RATLINE_SUBORDINATE_CONTINUATION_UNSUBSCRIBE_FAILED", { cause: error });
        }
      }
      this.#released = true;
    } finally { this.#releasing = false; }
  }
  public status(): Readonly<Record<string, unknown>> {
    return Object.freeze({ consumed: this.#consumed, failed: this.#failed, sourceResumeRequested: this.#resumeRequested,
      sourceResumeObserved: this.#resumed, packetRetained: this.#packet !== null, released: this.#released,
      terminationVerified: this.#terminationVerified, subscriptionUncertain: this.#subscriptionAttempted && !this.#subscriptionReturned,
      unsubscribeConsumed: this.#unsubscribeConsumed, cleanupFailure: this.#cleanupFailure,
      nativeWorkerTargetIdentityVerified: false, callbackReturnCompletionVerified: false, executionAuthorized: false });
  }
}
