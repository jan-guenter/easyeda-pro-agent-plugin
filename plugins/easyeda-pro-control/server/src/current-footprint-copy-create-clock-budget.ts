/** Accounting for one original create inside the paired-clock observation.
 * Separate from the existing67-ID unit. This grants no writer purpose. */
import { CURRENT_FOOTPRINT_COPY_CLOCK_RPC_BUDGET as CLOCK } from "./current-footprint-copy-clock-rpc-budget.ts";

export const CURRENT_FOOTPRINT_COPY_CREATE_CLOCK_BUDGET = Object.freeze({
  clockNormal: CLOCK.normal, clockCleanup: CLOCK.cleanup, create: 1, normal: CLOCK.normal + 1,
  cleanup: CLOCK.cleanup, total: CLOCK.total + 1, armPrefix: 13, createOffset: 13,
  handoffMaximum: CLOCK.handoffMaximum, handoffAndUnit: CLOCK.handoffAndUnit + 1,
  maximumNormalId: CLOCK.maximumNormalId, maximumRequestId: CLOCK.maximumRequestId,
});
const LIMITS = CURRENT_FOOTPRINT_COPY_CREATE_CLOCK_BUDGET;
function fail(code: string): Error { return new Error(`FOOTPRINT_CREATE_CLOCK_BUDGET_${code}`); }
function lastId(first: number, prefix: number): number {
  if (!Number.isSafeInteger(first) || first < 1 || first > LIMITS.maximumRequestId) { throw fail("START_ID"); }
  const last = first + prefix + LIMITS.total - 1;
  if (last > LIMITS.maximumNormalId || last > LIMITS.maximumRequestId) { throw fail("HEADROOM"); }
  return last;
}
export function requireCurrentFootprintCopyCreateClockHandoffHeadroom(nextId: number): Readonly<{
  nextId: number; lastReservedId: number; handoffMaximum: number; reservedIds: number;
}> {
  return Object.freeze({ nextId, lastReservedId: lastId(nextId, LIMITS.handoffMaximum),
    handoffMaximum: LIMITS.handoffMaximum, reservedIds: LIMITS.handoffAndUnit });
}
export interface CurrentFootprintCopyCreateClockBudgetSnapshot {
  readonly startId: number;
  readonly nextId: number;
  readonly lastReservedId: number;
  readonly clockNormalConsumed: number;
  readonly clockCleanupConsumed: number;
  readonly createConsumed: number;
  readonly normalConsumed: number;
  readonly cleanupConsumed: number;
  readonly consumed: number;
  readonly failed: boolean;
  readonly retired: boolean;
  readonly firstFailure: string | null;
  readonly originalGenerationExitRequired: boolean;
  readonly executionAuthorized: false;
}
/** Consume before dispatch. Native acknowledgments cannot refund any ID.
 * The original native boundary independently duplicates this ledger. */
export class CurrentFootprintCopyCreateClockBudget {
  readonly #first: number;
  readonly #last: number;
  #next: number;
  #clockNormal = 0;
  #clockCleanup = 0;
  #create = 0;
  #failed = false;
  #retired = false;
  #failure: string | null = null;
  public constructor(firstRequestId: number) {
    this.#last = lastId(firstRequestId, 0); this.#first = firstRequestId; this.#next = firstRequestId;
  }
  #refuse(code: string): never { this.#failed = true; this.#failure ??= code; throw fail(code); }
  #id(id: number): void {
    if (this.#failed || this.#retired) { throw fail("UNAVAILABLE"); }
    if (!Number.isSafeInteger(id) || id !== this.#next || id !== this.#first + this.#clockNormal + this.#clockCleanup + this.#create) {
      this.#refuse("CONTIGUOUS_ID");
    }
    if (id > this.#last) { this.#refuse("TOTAL"); }
  }
  /** Before create, exactly13 normal arm commands are admitted. */
  public consume(id: number, cleanup: boolean): void {
    this.#id(id);
    if (typeof cleanup !== "boolean") { this.#refuse("CLASSIFICATION"); }
    if (this.#create === 0 && (cleanup || this.#clockNormal >= LIMITS.armPrefix)) { this.#refuse("CREATE_SLOT"); }
    if (cleanup ? this.#clockCleanup >= LIMITS.clockCleanup : this.#clockNormal >= LIMITS.clockNormal) { this.#refuse("CLASS_LIMIT"); }
    this.#next += 1;
    if (cleanup) { this.#clockCleanup += 1; } else { this.#clockNormal += 1; }
  }
  public consumeCreate(id: number): void {
    this.#id(id);
    if (this.#create !== 0 || this.#clockNormal !== LIMITS.armPrefix || this.#clockCleanup !== 0 || id !== this.#first + LIMITS.createOffset) {
      this.#refuse("CREATE_SLOT");
    }
    this.#create = 1; this.#next += 1;
  }
  public fail(): void { this.#failed = true; this.#failure ??= "NATIVE_OUTCOME"; }
  #complete(): boolean {
    return this.#clockNormal === LIMITS.clockNormal && this.#clockCleanup === LIMITS.clockCleanup && this.#create === 1 && this.#next === this.#last + 1;
  }
  public requireCompleted(): void {
    if (this.#failed || this.#retired) { throw fail("UNAVAILABLE"); }
    if (!this.#complete()) { throw fail("INCOMPLETE"); }
  }
  public retire(): void {
    if (this.#failed || this.#retired) { throw fail("UNAVAILABLE"); }
    if (!this.#complete()) { this.#refuse("INCOMPLETE"); }
    this.#retired = true;
  }
  public snapshot(): CurrentFootprintCopyCreateClockBudgetSnapshot {
    return Object.freeze({ startId: this.#first, nextId: this.#next, lastReservedId: this.#last,
      clockNormalConsumed: this.#clockNormal, clockCleanupConsumed: this.#clockCleanup, createConsumed: this.#create,
      normalConsumed: this.#clockNormal + this.#create, cleanupConsumed: this.#clockCleanup,
      consumed: this.#clockNormal + this.#clockCleanup + this.#create, failed: this.#failed, retired: this.#retired,
      firstFailure: this.#failure, originalGenerationExitRequired: this.#failed, executionAuthorized: false });
  }
}
