/** Separate allocation/create/clock unit. Its accounting is not a writer
 * purpose, original invocation lease or whole-lifecycle reservation. */
import { CURRENT_FOOTPRINT_COPY_CLOCK_RPC_BUDGET as CLOCK } from "./current-footprint-copy-clock-rpc-budget.ts";

export const CURRENT_FOOTPRINT_COPY_ALLOCATION_NATIVE_ORDER = Object.freeze([
  "allocation-arm", "allocation-frame-build", "allocation-frame-create", "allocation-frame-wrapper", "allocation-source",
  "allocation-join", "allocation-properties", "allocation-remove", "allocation-resume", "allocation-release",
] as const);
export const CURRENT_FOOTPRINT_COPY_ALLOCATED_CREATE_CLOCK_BUDGET = Object.freeze({
  clockNormal: CLOCK.normal, clockCleanup: CLOCK.cleanup, allocationNormal: 7, allocationCleanup: 3,
  create: 1, normal: CLOCK.normal + 8, cleanup: CLOCK.cleanup + 3, total: CLOCK.total + 11,
  armPrefix: 14, createOffset: 14, handoffMaximum: CLOCK.handoffMaximum, handoffAndUnit: CLOCK.handoffAndUnit + 11,
  maximumNormalId: CLOCK.maximumNormalId, maximumRequestId: CLOCK.maximumRequestId,
});
const LIMITS = CURRENT_FOOTPRINT_COPY_ALLOCATED_CREATE_CLOCK_BUDGET;
function fail(code: string): Error { return new Error(`FOOTPRINT_ALLOCATED_CREATE_CLOCK_BUDGET_${code}`); }
function lastId(first: number, prefix: number): number {
  if (!Number.isSafeInteger(first) || first < 1 || first > LIMITS.maximumRequestId) { throw fail("START_ID"); }
  const last = first + prefix + LIMITS.total - 1;
  if (last > LIMITS.maximumNormalId || last > LIMITS.maximumRequestId) { throw fail("HEADROOM"); } return last;
}
export function requireCurrentFootprintCopyAllocatedCreateClockHandoffHeadroom(nextId: number): Readonly<{
  nextId: number; lastReservedId: number; handoffMaximum: number; reservedIds: number;
}> {
  return Object.freeze({ nextId, lastReservedId: lastId(nextId, LIMITS.handoffMaximum),
    handoffMaximum: LIMITS.handoffMaximum, reservedIds: LIMITS.handoffAndUnit });
}
export class CurrentFootprintCopyAllocatedCreateClockBudget {
  readonly #first: number;
  readonly #last: number;
  #next: number;
  #normal = 0;
  #cleanup = 0;
  #allocation = 0;
  #create = 0;
  #failed = false;
  #retired = false;
  #failure: string | null = null;
  public constructor(first: number) { this.#last = lastId(first, 0); this.#first = first; this.#next = first; }
  #refuse(code: string): never { this.#failed = true; this.#failure ??= code; throw fail(code); }
  #id(id: number): void {
    if (this.#failed || this.#retired) { throw fail("UNAVAILABLE"); }
    if (!Number.isSafeInteger(id) || id !== this.#next || id !== this.#first + this.#normal + this.#cleanup + this.#allocation + this.#create) { this.#refuse("CONTIGUOUS_ID"); }
    if (id > this.#last) { this.#refuse("TOTAL"); }
  }
  public consume(id: number, cleanup: boolean): void {
    this.#id(id);
    if (typeof cleanup !== "boolean") { this.#refuse("CLASSIFICATION"); }
    if (this.#create === 0 ? this.#allocation !== 1 || cleanup || this.#normal >= 13 : this.#allocation < 9) { this.#refuse("ALLOCATION_SEQUENCE"); }
    if (cleanup ? this.#cleanup >= LIMITS.clockCleanup : this.#normal >= LIMITS.clockNormal) { this.#refuse("CLASS_LIMIT"); }
    this.#next += 1; if (cleanup) { this.#cleanup += 1; } else { this.#normal += 1; }
  }
  public consumeAllocation(id: number, phase: string, cleanup: boolean): void {
    this.#id(id);
    if (phase !== CURRENT_FOOTPRINT_COPY_ALLOCATION_NATIVE_ORDER[this.#allocation] || cleanup !== (this.#allocation >= 7)) { this.#refuse("ALLOCATION_PHASE"); }
    if (this.#allocation === 0 ? this.#normal !== 0 || this.#cleanup !== 0 || this.#create !== 0 : this.#create !== 1) { this.#refuse("ALLOCATION_SEQUENCE"); }
    if (this.#allocation > 0 && this.#allocation < 9 && (this.#normal !== 13 || this.#cleanup !== 0)) { this.#refuse("ALLOCATION_SEQUENCE"); }
    if (this.#allocation === 9 && this.#normal !== LIMITS.clockNormal) { this.#refuse("ALLOCATION_RELEASE"); }
    this.#allocation += 1; this.#next += 1;
  }
  public consumeCreate(id: number): void {
    this.#id(id);
    if (this.#create !== 0 || this.#allocation !== 1 || this.#normal !== 13 || this.#cleanup !== 0 || id !== this.#first + LIMITS.createOffset) { this.#refuse("CREATE_SLOT"); }
    this.#create = 1; this.#next += 1;
  }
  public fail(): void { this.#failed = true; this.#failure ??= "NATIVE_OUTCOME"; }
  #complete(): boolean { return this.#normal === LIMITS.clockNormal && this.#cleanup === LIMITS.clockCleanup && this.#allocation === 10 && this.#create === 1 && this.#next === this.#last + 1; }
  public requireCompleted(): void { if (this.#failed || this.#retired) { throw fail("UNAVAILABLE"); } if (!this.#complete()) { throw fail("INCOMPLETE"); } }
  public retire(): void {
    if (this.#failed || this.#retired) { throw fail("UNAVAILABLE"); }
    if (!this.#complete()) { this.#refuse("INCOMPLETE"); } this.#retired = true;
  }
  public snapshot(): Readonly<{
    startId: number; nextId: number; lastReservedId: number; clockNormalConsumed: number; clockCleanupConsumed: number;
    allocationNormalConsumed: number; allocationCleanupConsumed: number; allocationPhase: number; createConsumed: number;
    normalConsumed: number; cleanupConsumed: number; consumed: number; failed: boolean; retired: boolean;
    firstFailure: string | null; originalGenerationExitRequired: boolean; executionAuthorized: false;
  }> {
    return Object.freeze({ startId: this.#first, nextId: this.#next, lastReservedId: this.#last,
      clockNormalConsumed: this.#normal, clockCleanupConsumed: this.#cleanup,
      allocationNormalConsumed: Math.min(this.#allocation, 7), allocationCleanupConsumed: Math.max(0, this.#allocation - 7), allocationPhase: this.#allocation,
      createConsumed: this.#create, normalConsumed: this.#normal + Math.min(this.#allocation, 7) + this.#create,
      cleanupConsumed: this.#cleanup + Math.max(0, this.#allocation - 7), consumed: this.#next - this.#first,
      failed: this.#failed, retired: this.#retired, firstFailure: this.#failure, originalGenerationExitRequired: this.#failed, executionAuthorized: false });
  }
}
