/* oxlint-disable import/max-dependencies -- The composite retains its separate creation, capture, child gate, dispatcher and private completed-capture seal contracts. */
/* oxlint-disable eslint/max-classes-per-file -- Fixed PCB and worker wrappers share one closed composite lifecycle. */
/** Join actual construction and bridge/result owners before either continuation.
 * The native adapter adopts the PCB stage only through the first held child
 * import. Callback promises alone do not qualify child source. */
import { CURRENT_PCB_209_RATLINE_NATIVE_PROFILE } from "./current-pcb-209-ratline-budget.ts";
import { types } from "node:util";
import { CurrentPcb209RatlineStageDiagnostics } from "./current-pcb-209-ratline-diagnostics.ts";
import { CurrentPcb209RatlineEventDispatcher } from "./current-pcb-209-ratline-event-dispatcher.ts";
import { CurrentPcb209RatlineChildStartGate } from "./current-pcb-209-ratline-child-start-gate.ts";
import type { CurrentPcb209RatlineBootstrapOwner } from "./current-pcb-209-ratline-bootstrap-owner.ts";
import type { CurrentPcb209RatlineRealmDependency } from "./current-pcb-209-ratline-event-dispatcher.ts";
import type { CurrentPcb209RatlineCreationPacket } from "./current-pcb-209-ratline-creation-runner.ts";
import type { CurrentPcb209RatlineAnyCapturePacket, CurrentPcb209RatlineCapturePacket, CurrentPcb209RatlineHeldCapturePacket } from "./current-pcb-209-ratline-capture-runner.ts";
import type { CurrentPcb209RatlineCaptureReplyEvidence } from "./current-pcb-209-ratline-capture-reply.ts";
import type { CurrentPcb209RatlineCaptureScope } from "./current-pcb-209-ratline-capture-profile.ts";
import { currentPcb209RatlineContinuationTiming } from "./current-pcb-209-ratline-continuation-timing.ts";
import { isCurrentPcb209CompletedCaptureSeal, issueCurrentPcb209CompletedCaptureSeal } from "./current-pcb-209-ratline-continuation-handoff.ts";
import type { CurrentPcb209CompletedCaptureSeal } from "./current-pcb-209-ratline-continuation-handoff.ts";

type Role = "pcb" | "worker";
export interface CurrentPcb209RatlineStartupDependency {
  readonly realm: CurrentPcb209RatlineRealmDependency;
  /** Release the original source pause once after all fixed observers arm.
   * This acknowledges only source continuation, not the whole application run. */
  readonly releaseOriginalPinnedSource: () => Promise<void>;
  /** The actual source owner exists before source continuation. The gate binds
   * the original construction packet and intercepts normal and abort starts. */
  readonly childBootstrapOwner: CurrentPcb209RatlineBootstrapOwner;
}
export interface CurrentPcb209RatlineStartupPacket {
  readonly profile: "private.current-pcb209-ratline-composite.v1";
  readonly role: Role;
  readonly construction: CurrentPcb209RatlineCreationPacket;
  readonly capture: CurrentPcb209RatlineCapturePacket;
  readonly originalConstructionAndBridgeWorkerMatch: true;
  readonly originalConstructionAndRegistryMatch: true;
  readonly childStartConsumedOnce: true;
  readonly nativePreexecutionSourceOwnershipVerified: false;
  readonly nativeWorkerTargetIdentityVerified: false;
  readonly childSourceQualified: false;
  readonly callbackReturnCompletionVerified: false;
  readonly subscribedCanvasPeerOwnershipVerified: false;
  readonly copperCompletionVerified: false;
  readonly completeLiveBaselineVerified: false;
  readonly executionAuthorized: false;
}
export interface CurrentPcb209RatlineHeldStartupPacket extends Omit<CurrentPcb209RatlineStartupPacket,
  "profile" | "role" | "capture"> {
  readonly profile: "private.current-pcb209-ratline-held-prefix-composite.v2";
  readonly role: "pcb";
  readonly capture: CurrentPcb209RatlineHeldCapturePacket;
}
interface Packets { readonly full: CurrentPcb209RatlineStartupPacket; readonly "pcb-held-prefix": CurrentPcb209RatlineHeldStartupPacket }
const INTERNAL = Symbol("fixed209-ratline-composite");
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`PCB209_RATLINE_COMPOSITE_${code}`); } }
async function observed(work: Promise<unknown>): Promise<void> {
  try { await work; } catch {
    // The original attempt reports this failure.
  }
}
async function bounded<T>(work: Promise<T>, milliseconds: number = CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.elapsed.ordinaryRequestMilliseconds): Promise<T> {
  const expired = Promise.withResolvers<never>(), timer = setTimeout(() => { expired.reject(new Error("PCB209_RATLINE_COMPOSITE_DEADLINE")); }, milliseconds);
  try { return await Promise.race([work, expired.promise]); } finally { clearTimeout(timer); }
}
function members(value: CurrentPcb209RatlineStartupDependency): readonly unknown[] {
  need(value !== null && typeof value === "object" && !types.isProxy(value) && Object.getPrototypeOf(value) === Object.prototype, "DEPENDENCY");
  const keys = ["realm", "releaseOriginalPinnedSource", "childBootstrapOwner"] as const;
  need(Reflect.ownKeys(value).length === keys.length, "DEPENDENCY");
  return keys.map((key, index) => { const descriptor = Object.getOwnPropertyDescriptor(value, key);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && typeof descriptor.value === (index === 1 ? "function" : "object"), "DEPENDENCY");
    return descriptor.value as unknown; });
}
class CurrentPcb209RatlineStartupCore<Scope extends CurrentPcb209RatlineCaptureScope> {
  readonly #diagnostics = new CurrentPcb209RatlineStageDiagnostics();
  readonly #dependency: CurrentPcb209RatlineStartupDependency;
  readonly #original: readonly unknown[];
  readonly #releaseSource: CurrentPcb209RatlineStartupDependency["releaseOriginalPinnedSource"];
  readonly #childGate: CurrentPcb209RatlineChildStartGate;
  readonly #dispatcher: CurrentPcb209RatlineEventDispatcher;
  readonly #stages: ReturnType<CurrentPcb209RatlineEventDispatcher["claimOriginalStages"]>;
  readonly #role: Role;
  readonly #scope: Scope;
  #consumed = false;
  #settled = false;
  #failed = false;
  #released = false;
  #releaseStarted = false;
  #sourceReleased = false;
  #childArmed = false;
  #construction: Promise<CurrentPcb209RatlineCreationPacket> | null = null;
  #capture: Promise<CurrentPcb209RatlineAnyCapturePacket> | null = null;
  #packet: Packets[Scope] | null = null;
  #sealConsumed = false;
  #completedSeal: CurrentPcb209CompletedCaptureSeal | null = null;
  public constructor(key: typeof INTERNAL, role: Role, scope: Scope, dependency: CurrentPcb209RatlineStartupDependency) {
    need(key === INTERNAL && (scope === "full" || scope === "pcb-held-prefix" && role === "pcb"), "PROFILE");
    this.#original = members(dependency); this.#dependency = dependency; this.#role = role; this.#scope = scope;
    this.#releaseSource = dependency.releaseOriginalPinnedSource;
    this.#childGate = new CurrentPcb209RatlineChildStartGate(role, dependency.realm, dependency.childBootstrapOwner);
    this.#dispatcher = new CurrentPcb209RatlineEventDispatcher(role, this.#childGate.claimOriginalRealm(), scope); this.#stages = this.#dispatcher.claimOriginalStages();
  }
  public retainedRejectedCaptureReplyEvidence(): CurrentPcb209RatlineCaptureReplyEvidence | null {
    return this.#stages.capture.retainedRejectedReplyEvidence();
  }
  public status(): Readonly<Record<string, unknown>> {
    return Object.freeze({ ...this.#diagnostics.snapshot(), scope: this.#scope, consumed: this.#consumed, settled: this.#settled, failed: this.#failed, released: this.#released,
      sourceReleaseConsumed: this.#sourceReleased, childInstrumentationConsumed: this.#childArmed,
      creation: this.#stages.creation.status(), capture: this.#stages.capture.status(), dispatcher: this.#dispatcher.status() });
  }
  #same(): void { need(members(this.#dependency).every((value, index) => value === this.#original[index]), "OWNER_CHANGED"); }
  async #current(): Promise<void> {
    this.#diagnostics.step = "owner-reproof";
    this.#same(); need(!this.#failed && !this.#released && !this.#releaseStarted, "NOT_CURRENT");
    await bounded(this.#dispatcher.requireOriginal(), currentPcb209RatlineContinuationTiming(this.#dependency.realm)?.ownerMilliseconds);
    this.#same(); need(!this.#failed && !this.#released && !this.#releaseStarted, "NOT_CURRENT");
  }
  #startCapture(): void { need(this.#capture === null, "CAPTURE_CONSUMED"); this.#capture = this.#stages.capture.capture(); void observed(this.#capture); }
  public async capture(): Promise<Packets[Scope]> {
    need(!this.#consumed, "CONSUMED"); this.#consumed = true;
    try {
      this.#diagnostics.stage = "arming"; await this.#current(); this.#construction = this.#stages.creation.capture(); void observed(this.#construction);
      // The worker's self bridge and canvas pauses precede its subordinate
      // Constructor. Both fixed stage observers must exist before source runs.
      if (this.#role === "worker") { this.#startCapture(); }
      await this.#stages.creation.whenArmed(); if (this.#role === "worker") { await this.#stages.capture.whenArmed(); }
      this.#diagnostics.stage = "source-continuation"; await this.#current(); this.#sourceReleased = true; await bounded(this.#dispatcher.continueOriginalSource(() => this.#releaseSource.call(this.#dependency)),
        currentPcb209RatlineContinuationTiming(this.#dependency.realm)?.sourceReleaseMilliseconds ??
        (this.#role === "pcb" ? CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.elapsed.sourceReleaseMilliseconds : CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.elapsed.ordinaryRequestMilliseconds)); await this.#current();
      const construction = await this.#construction; await this.#current();
      if (this.#role === "pcb") { this.#diagnostics.stage = "capture-arming"; this.#startCapture(); await this.#stages.capture.whenArmed(); await this.#current(); }
      this.#diagnostics.stage = "child-arming";
      await this.#stages.creation.requireOriginal(construction); this.#childArmed = true;
      await bounded(this.#childGate.armOriginalChildBootstrap(this.#stages.creation, construction),
        currentPcb209RatlineContinuationTiming(this.#dependency.realm)?.childArmMilliseconds ?? (this.#role === "pcb" ?
          CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.elapsed.childArmMilliseconds : 6 * CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.elapsed.ordinaryRequestMilliseconds)); await this.#current();
      // Success and abort cleanup share the creation owner's retained start
      // Promise. No second dispatcher or raw child-start request is introduced.
      this.#diagnostics.stage = "parent-continuation"; await this.#stages.creation.continueOriginalParent(construction); await this.#current();
      this.#diagnostics.stage = "child-start"; await this.#stages.creation.startOriginalChild(construction); await this.#current();
      this.#diagnostics.stage = "capture"; this.#diagnostics.step = "pause-wait";
      need(this.#capture !== null, "CAPTURE_MISSING"); const capture = await this.#capture; await this.#current();
      const common = { construction, childStartConsumedOnce: true,
        nativePreexecutionSourceOwnershipVerified: false, nativeWorkerTargetIdentityVerified: false, childSourceQualified: false,
        callbackReturnCompletionVerified: false, subscribedCanvasPeerOwnershipVerified: false, copperCompletionVerified: false,
        completeLiveBaselineVerified: false, executionAuthorized: false } as const;
      let packet: CurrentPcb209RatlineStartupPacket | CurrentPcb209RatlineHeldStartupPacket;
      if (this.#scope === "pcb-held-prefix") {
        need(capture.profile === "private.current-pcb209-ratline-pcb-held-prefix-capture.v1", "PROFILE");
        this.#diagnostics.stage = "comparison"; await bounded(this.#dispatcher.requireOriginalConstruction(construction, capture),
          currentPcb209RatlineContinuationTiming(this.#dependency.realm)?.comparisonMilliseconds); await this.#current();
        packet = Object.freeze({ ...common, profile: "private.current-pcb209-ratline-held-prefix-composite.v2", role: "pcb", capture,
          originalConstructionAndBridgeWorkerMatch: true, originalConstructionAndRegistryMatch: true });
      } else {
        need(capture.profile !== "private.current-pcb209-ratline-pcb-held-prefix-capture.v1", "PROFILE");
        this.#diagnostics.stage = "comparison"; await bounded(this.#dispatcher.requireOriginalConstruction(construction, capture),
          currentPcb209RatlineContinuationTiming(this.#dependency.realm)?.comparisonMilliseconds); await this.#current();
        packet = Object.freeze({ ...common, profile: "private.current-pcb209-ratline-composite.v1", role: this.#role, capture,
          originalConstructionAndBridgeWorkerMatch: true, originalConstructionAndRegistryMatch: true });
      }
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The private scope selects its exact capture discriminator and packet branch above; fixed wrappers choose the scope.
      this.#packet = packet as Packets[Scope];
      return this.#packet;
    } catch (error) {
      this.#diagnostics.record(error); this.#failed = true;
      try { await this.#cleanup(); } catch (cleanupError) { throw new AggregateError([error, cleanupError], "PCB209_RATLINE_COMPOSITE_FAILED", { cause: cleanupError }); }
      throw error;
    } finally { this.#settled = true; }
  }
  async #cleanup(): Promise<void> {
    const work: Promise<void>[] = [this.#childGate.abort()]; this.#dispatcher.abort();
    if (this.#construction !== null) { work.push(this.#stages.creation.abort()); }
    if (this.#capture !== null) { work.push(this.#stages.capture.abort()); }
    const results = await Promise.allSettled(work); const errors: unknown[] = [];
    for (const result of results) { if (result.status === "rejected") { errors.push(result.reason); } }
    if (errors.length > 0) { throw new AggregateError(errors, "PCB209_RATLINE_COMPOSITE_CLEANUP"); }
  }
  public async requireOriginal(packet: Packets[Scope]): Promise<void> {
    need(packet === this.#packet && this.#packet !== null, "ORIGINAL_PACKET"); await this.#current();
    await this.#stages.creation.requireOriginal(packet.construction); await this.#dispatcher.requireOriginalCapture(packet.capture); await this.#current();
  }
  /** Seals the actual full worker observation before its parent resumes into
   * deletion. The historical accessor deliberately performs no realm request. */
  public async sealOriginalCompletedCapture(packet: CurrentPcb209RatlineStartupPacket): Promise<CurrentPcb209CompletedCaptureSeal> {
    need(this.#role === "worker" && this.#scope === "full" && currentPcb209RatlineContinuationTiming(this.#dependency.realm) !== null &&
      !this.#sealConsumed && packet === this.#packet, "SEAL_CONSUMED"); this.#sealConsumed = true;
    need(this.#packet !== null, "ORIGINAL_PACKET"); await this.requireOriginal(this.#packet);
    const capture = this.#stages.capture.status(), dispatcher = this.#dispatcher.status();
    need(this.#settled && capture["unresolvedBreakpoints"] === false && capture["paused"] === false &&
      dispatcher["uncertainBreakpoints"] === 0 && dispatcher["paused"] === false && dispatcher["deferredPause"] === false, "SEAL_INCOMPLETE");
    this.#completedSeal = issueCurrentPcb209CompletedCaptureSeal(this, packet); return this.#completedSeal;
  }
  public requireOriginalSealedCapture(seal: CurrentPcb209CompletedCaptureSeal): void {
    this.#same(); need(!this.#failed && !this.#released && this.#completedSeal === seal && this.#packet === seal.packet &&
      isCurrentPcb209CompletedCaptureSeal(seal, this, seal.packet), "ORIGINAL_CAPTURE_SEAL");
  }
  public async abort(): Promise<void> { need(this.#consumed && !this.#released, "ABORT_STATE");
    this.#diagnostics.record(new Error("PCB209_RATLINE_COMPOSITE_ABORTED")); this.#failed = true; await this.#cleanup(); }
  public async releaseAfterTermination(): Promise<void> {
    need(this.#settled && !this.#released && !this.#releaseStarted, "RELEASE_STATE"); this.#releaseStarted = true;
    try {
      this.#same();
      if (this.#construction !== null) { await this.#stages.creation.releaseAfterTermination(); }
      if (this.#capture !== null) { await this.#stages.capture.releaseAfterTermination(); }
      await this.#dispatcher.releaseAfterTermination(); await this.#childGate.releaseAfterTermination(); this.#released = true;
    } finally { this.#releaseStarted = false; }
  }
}
export class CurrentPcb209RatlinePcbStartup extends CurrentPcb209RatlineStartupCore<"full"> {
  public constructor(dependency: CurrentPcb209RatlineStartupDependency) { super(INTERNAL, "pcb", "full", dependency); }
}
export class CurrentPcb209RatlineWorkerStartup extends CurrentPcb209RatlineStartupCore<"full"> {
  public constructor(dependency: CurrentPcb209RatlineStartupDependency) { super(INTERNAL, "worker", "full", dependency); }
}
export class CurrentPcb209RatlinePcbHeldStartup extends CurrentPcb209RatlineStartupCore<"pcb-held-prefix"> {
  public constructor(dependency: CurrentPcb209RatlineStartupDependency) { super(INTERNAL, "pcb", "pcb-held-prefix", dependency); }
}
