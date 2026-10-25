/* oxlint-disable eslint/max-classes-per-file -- Fixed PCB and worker wrappers share one closed composite lifecycle. */
/** Join actual construction and bridge/result owners before either continuation.
 * The native adapter adopts the PCB stage only through the first held child
 * import. Callback promises alone do not qualify child source. */
import { CURRENT_PCB_209_RATLINE_NATIVE_PROFILE } from "./current-pcb-209-ratline-budget.ts";
import { types } from "node:util";
import { CurrentPcb209RatlineEventDispatcher } from "./current-pcb-209-ratline-event-dispatcher.ts";
import { CurrentPcb209RatlineChildStartGate } from "./current-pcb-209-ratline-child-start-gate.ts";
import type { CurrentPcb209RatlineBootstrapOwner } from "./current-pcb-209-ratline-bootstrap-owner.ts";
import type { CurrentPcb209RatlineRealmDependency } from "./current-pcb-209-ratline-event-dispatcher.ts";
import type { CurrentPcb209RatlineCreationPacket } from "./current-pcb-209-ratline-creation-runner.ts";
import type { CurrentPcb209RatlineCapturePacket } from "./current-pcb-209-ratline-capture-runner.ts";

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
class CurrentPcb209RatlineStartupCore {
  readonly #dependency: CurrentPcb209RatlineStartupDependency;
  readonly #original: readonly unknown[];
  readonly #releaseSource: CurrentPcb209RatlineStartupDependency["releaseOriginalPinnedSource"];
  readonly #childGate: CurrentPcb209RatlineChildStartGate;
  readonly #dispatcher: CurrentPcb209RatlineEventDispatcher;
  readonly #stages: ReturnType<CurrentPcb209RatlineEventDispatcher["claimOriginalStages"]>;
  readonly #role: Role;
  #consumed = false;
  #settled = false;
  #failed = false;
  #released = false;
  #releaseStarted = false;
  #sourceReleased = false;
  #childArmed = false;
  #construction: Promise<CurrentPcb209RatlineCreationPacket> | null = null;
  #capture: Promise<CurrentPcb209RatlineCapturePacket> | null = null;
  #packet: CurrentPcb209RatlineStartupPacket | null = null;
  public constructor(key: typeof INTERNAL, role: Role, dependency: CurrentPcb209RatlineStartupDependency) {
    need(key === INTERNAL, "PROFILE"); this.#original = members(dependency); this.#dependency = dependency; this.#role = role;
    this.#releaseSource = dependency.releaseOriginalPinnedSource;
    this.#childGate = new CurrentPcb209RatlineChildStartGate(role, dependency.realm, dependency.childBootstrapOwner);
    this.#dispatcher = new CurrentPcb209RatlineEventDispatcher(role, this.#childGate.claimOriginalRealm()); this.#stages = this.#dispatcher.claimOriginalStages();
  }
  public status(): Readonly<Record<string, unknown>> {
    return Object.freeze({ consumed: this.#consumed, settled: this.#settled, failed: this.#failed, released: this.#released,
      sourceReleaseConsumed: this.#sourceReleased, childInstrumentationConsumed: this.#childArmed,
      creation: this.#stages.creation.status(), capture: this.#stages.capture.status() });
  }
  #same(): void { need(members(this.#dependency).every((value, index) => value === this.#original[index]), "OWNER_CHANGED"); }
  async #current(): Promise<void> {
    this.#same(); need(!this.#failed && !this.#released && !this.#releaseStarted, "NOT_CURRENT");
    await bounded(this.#dispatcher.requireOriginal()); this.#same(); need(!this.#failed && !this.#released && !this.#releaseStarted, "NOT_CURRENT");
  }
  #startCapture(): void { need(this.#capture === null, "CAPTURE_CONSUMED"); this.#capture = this.#stages.capture.capture(); void observed(this.#capture); }
  public async capture(): Promise<CurrentPcb209RatlineStartupPacket> {
    need(!this.#consumed, "CONSUMED"); this.#consumed = true;
    try {
      await this.#current(); this.#construction = this.#stages.creation.capture(); void observed(this.#construction);
      // The worker's self bridge and canvas pauses precede its subordinate
      // Constructor. Both fixed stage observers must exist before source runs.
      if (this.#role === "worker") { this.#startCapture(); }
      await this.#stages.creation.whenArmed(); if (this.#role === "worker") { await this.#stages.capture.whenArmed(); }
      await this.#current(); this.#sourceReleased = true; await bounded(this.#dispatcher.continueOriginalSource(() => this.#releaseSource.call(this.#dependency)),
        this.#role === "pcb" ? CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.elapsed.sourceReleaseMilliseconds : CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.elapsed.ordinaryRequestMilliseconds); await this.#current();
      const construction = await this.#construction; await this.#current();
      if (this.#role === "pcb") { this.#startCapture(); await this.#stages.capture.whenArmed(); await this.#current(); }
      await this.#stages.creation.requireOriginal(construction); this.#childArmed = true;
      await bounded(this.#childGate.armOriginalChildBootstrap(this.#stages.creation, construction), CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.elapsed.childArmMilliseconds); await this.#current();
      // Success and abort cleanup share the creation owner's retained start
      // Promise. No second dispatcher or raw child-start request is introduced.
      await this.#stages.creation.continueOriginalParent(construction); await this.#current();
      await this.#stages.creation.startOriginalChild(construction); await this.#current();
      need(this.#capture !== null, "CAPTURE_MISSING"); const capture = await this.#capture; await this.#current();
      await bounded(this.#dispatcher.requireOriginalConstruction(construction, capture)); await this.#current();
      this.#packet = Object.freeze({ profile: "private.current-pcb209-ratline-composite.v1", role: this.#role, construction, capture,
        originalConstructionAndBridgeWorkerMatch: true, originalConstructionAndRegistryMatch: true, childStartConsumedOnce: true,
        nativePreexecutionSourceOwnershipVerified: false, nativeWorkerTargetIdentityVerified: false, childSourceQualified: false,
        callbackReturnCompletionVerified: false, subscribedCanvasPeerOwnershipVerified: false, copperCompletionVerified: false,
        completeLiveBaselineVerified: false, executionAuthorized: false });
      return this.#packet;
    } catch (error) {
      this.#failed = true;
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
  public async requireOriginal(packet: CurrentPcb209RatlineStartupPacket): Promise<void> {
    need(packet === this.#packet && this.#packet !== null, "ORIGINAL_PACKET"); await this.#current();
    await this.#stages.creation.requireOriginal(packet.construction); await this.#stages.capture.requireOriginal(packet.capture); await this.#current();
  }
  public async abort(): Promise<void> { need(this.#consumed && !this.#released, "ABORT_STATE"); this.#failed = true; await this.#cleanup(); }
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
export class CurrentPcb209RatlinePcbStartup extends CurrentPcb209RatlineStartupCore {
  public constructor(dependency: CurrentPcb209RatlineStartupDependency) { super(INTERNAL, "pcb", dependency); }
}
export class CurrentPcb209RatlineWorkerStartup extends CurrentPcb209RatlineStartupCore {
  public constructor(dependency: CurrentPcb209RatlineStartupDependency) { super(INTERNAL, "worker", dependency); }
}
