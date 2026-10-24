/* oxlint-disable eslint/max-classes-per-file -- Fixed PCB and worker wrappers share one closed composite lifecycle. */
/** Join actual construction and bridge/result owners before either continuation.
 * This private stage is executable with original authority callbacks, but no
 * native adapter adopts it. Callback promises alone do not qualify child source. */
import { types } from "node:util";
import { CurrentPcb209RatlineEventDispatcher } from "./current-pcb-209-ratline-event-dispatcher.ts";
import type { CurrentPcb209RatlineRealmDependency } from "./current-pcb-209-ratline-event-dispatcher.ts";
import type { CurrentPcb209RatlineCreationPacket, CurrentPcb209RatlinePcbCreation, CurrentPcb209RatlineWorkerCreation } from "./current-pcb-209-ratline-creation-runner.ts";
import type { CurrentPcb209RatlineCapturePacket } from "./current-pcb-209-ratline-capture-runner.ts";

type Role = "pcb" | "worker";
type Creation = CurrentPcb209RatlinePcbCreation | CurrentPcb209RatlineWorkerCreation;
export interface CurrentPcb209RatlineStartupDependency {
  readonly realm: CurrentPcb209RatlineRealmDependency;
  /** Release the original source pause once after all fixed observers arm.
   * This acknowledges only source continuation, not the whole application run. */
  readonly releaseOriginalPinnedSource: () => Promise<void>;
  /** Arm the original waiting child's bootstrap observers before its sole start.
   * The actual construction owner and its issued packet remain mandatory. */
  readonly armOriginalChildBootstrap: (creation: Creation, packet: CurrentPcb209RatlineCreationPacket) => Promise<void>;
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
async function bounded<T>(work: Promise<T>): Promise<T> {
  const expired = Promise.withResolvers<never>(), timer = setTimeout(() => { expired.reject(new Error("PCB209_RATLINE_COMPOSITE_DEADLINE")); }, 2500);
  try { return await Promise.race([work, expired.promise]); } finally { clearTimeout(timer); }
}
function members(value: CurrentPcb209RatlineStartupDependency): readonly unknown[] {
  need(value !== null && typeof value === "object" && !types.isProxy(value) && Object.getPrototypeOf(value) === Object.prototype, "DEPENDENCY");
  const keys = ["realm", "releaseOriginalPinnedSource", "armOriginalChildBootstrap"] as const;
  need(Reflect.ownKeys(value).length === keys.length, "DEPENDENCY");
  return keys.map((key, index) => { const descriptor = Object.getOwnPropertyDescriptor(value, key);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && typeof descriptor.value === (index === 0 ? "object" : "function"), "DEPENDENCY");
    return descriptor.value as unknown; });
}
class CurrentPcb209RatlineStartupCore {
  readonly #dependency: CurrentPcb209RatlineStartupDependency;
  readonly #original: readonly unknown[];
  readonly #releaseSource: CurrentPcb209RatlineStartupDependency["releaseOriginalPinnedSource"];
  readonly #armChild: CurrentPcb209RatlineStartupDependency["armOriginalChildBootstrap"];
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
    this.#releaseSource = dependency.releaseOriginalPinnedSource; this.#armChild = dependency.armOriginalChildBootstrap;
    this.#dispatcher = new CurrentPcb209RatlineEventDispatcher(role, dependency.realm); this.#stages = this.#dispatcher.claimOriginalStages();
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
      await this.#current(); this.#sourceReleased = true; await bounded(this.#dispatcher.continueOriginalSource(() => this.#releaseSource.call(this.#dependency))); await this.#current();
      const construction = await this.#construction; await this.#current();
      if (this.#role === "pcb") { this.#startCapture(); await this.#stages.capture.whenArmed(); await this.#current(); }
      await this.#stages.creation.requireOriginal(construction); this.#childArmed = true;
      await bounded(this.#armChild.call(this.#dependency, this.#stages.creation, construction)); await this.#current();
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
    this.#dispatcher.abort(); const work: Promise<void>[] = [];
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
      await this.#dispatcher.releaseAfterTermination(); this.#released = true;
    } finally { this.#releaseStarted = false; }
  }
}
export class CurrentPcb209RatlinePcbStartup extends CurrentPcb209RatlineStartupCore {
  public constructor(dependency: CurrentPcb209RatlineStartupDependency) { super(INTERNAL, "pcb", dependency); }
}
export class CurrentPcb209RatlineWorkerStartup extends CurrentPcb209RatlineStartupCore {
  public constructor(dependency: CurrentPcb209RatlineStartupDependency) { super(INTERNAL, "worker", dependency); }
}
