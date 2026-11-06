/** Fixed forward physical IDs around the existing allocation/clock unit.
 * The legacy unit still owns every phase/class/once-only rule. This counter
 * grants no native owner, invocation lease or whole-writer reservation. */
import { CurrentFootprintCopyAllocatedCreateClockBudget,
  CURRENT_FOOTPRINT_COPY_ALLOCATED_CREATE_CLOCK_BUDGET as UNIT } from "./current-footprint-copy-allocated-create-clock-budget.ts";
import { CURRENT_FOOTPRINT_FORWARD_COLD_NATIVE_LIMITS as LIMITS } from "./current-footprint-forward-cold-native-limits.ts";

function fail(code: string): Error { return new Error(`FOOTPRINT_FORWARD_ALLOCATED_CLOCK_${code}`); }
function lastId(first: number, prefix: number): number {
  if (!Number.isSafeInteger(first) || first < 1 || first > LIMITS.requestLimit) { throw fail("START_ID"); }
  const last = first + prefix + UNIT.total - 1;
  if (last > LIMITS.requestLimit) { throw fail("HEADROOM"); }
  return last;
}

/** Preserve both original handoff releases before reserving the complete unit.
 * Request-ID headroom never substitutes for the original normal-class ledger. */
export function requireCurrentFootprintForwardColdAllocatedClockHandoffHeadroom(nextId: number): Readonly<{
  nextId: number; lastReservedId: number; handoffMaximum: number; reservedIds: number;
}> {
  return Object.freeze({ nextId, lastReservedId: lastId(nextId, UNIT.handoffMaximum),
    handoffMaximum: UNIT.handoffMaximum, reservedIds: UNIT.handoffAndUnit });
}

/** The wire keeps the original physical ID unchanged. Only this private unit
 * counter translates it to the legacy validator's fixed local origin, so no
 * legacy ID ceiling or allocation/create sequence is widened. */
export class CurrentFootprintForwardColdAllocatedCreateClockBudget {
  readonly #first: number;
  readonly #last: number;
  readonly #unit = new CurrentFootprintCopyAllocatedCreateClockBudget(1);
  #failure: string | null = null;

  public constructor(first: number) { this.#last = lastId(first, 0); this.#first = first; }
  #refuse(code: string): never { this.#failure ??= code; this.#unit.fail(); throw fail(code); }
  #logical(id: number): number {
    const state = this.#unit.snapshot();
    if (state.failed || state.retired) { throw fail("UNAVAILABLE"); }
    if (!Number.isSafeInteger(id) || id !== this.#first + state.consumed || id > this.#last) { this.#refuse("CONTIGUOUS_ID"); }
    return id - this.#first + 1;
  }
  public consume(id: number, cleanup: boolean): void { this.#unit.consume(this.#logical(id), cleanup); }
  public consumeAllocation(id: number, phase: string, cleanup: boolean): void { this.#unit.consumeAllocation(this.#logical(id), phase, cleanup); }
  public consumeCreate(id: number): void { this.#unit.consumeCreate(this.#logical(id)); }
  public fail(): void { this.#unit.fail(); }
  public requireCompleted(): void { this.#unit.requireCompleted(); }
  public retire(): void { this.#unit.retire(); }
  public snapshot(): ReturnType<CurrentFootprintCopyAllocatedCreateClockBudget["snapshot"]> {
    const unit = this.#unit.snapshot();
    return Object.freeze({ ...unit, startId: this.#first, nextId: this.#first + unit.consumed,
      lastReservedId: this.#last, firstFailure: this.#failure ?? unit.firstFailure });
  }
}
