/** The original 78-command allocation/clock ledger owns logical phase IDs.
 * The genuine full channel alone records separately charged producer IDs on
 * its physical cursor; none can replace or consume a clock phase. */
import { CurrentFootprintCopyAllocatedCreateClockBudget, CURRENT_FOOTPRINT_COPY_ALLOCATED_CREATE_CLOCK_BUDGET as UNIT } from "./current-footprint-copy-allocated-create-clock-budget.ts";
import { currentFootprintForwardWriterProfile } from "./current-footprint-forward-writer-profile.ts";

import {types} from "node:util";
import type {CurrentFootprintForwardWriterCompleteBirthOrigin} from "./current-footprint-forward-writer-complete-birth-origin.ts";

const COMPLETE_BUDGET_INTERNAL=Symbol("original-complete-forward-clock-budget");
type CompleteClockBudgetInput=Readonly<{key:typeof COMPLETE_BUDGET_INTERNAL;limit:number}>;

export class CurrentFootprintForwardWriterAllocatedCreateClockBudget {
  readonly #first: number;
  readonly #limit:number;
  readonly #unit = new CurrentFootprintCopyAllocatedCreateClockBudget(1);
  #next: number;
  #interleaved = 0;
  // oxlint-disable-next-line typescript/no-useless-default-assignment, unicorn/no-useless-undefined -- Keep the existing one-argument constructor length for original class metadata.
  public constructor(first: number,complete:CompleteClockBudgetInput|undefined=undefined) {
    if(complete!==undefined&&(types.isProxy(complete)||Object.getOwnPropertyDescriptor(complete,"key")?.value!==COMPLETE_BUDGET_INTERNAL)){throw new Error("FORWARD_COMPLETE_CLOCK_ORIGINAL_FACTORY");}
    this.#limit=complete===undefined?currentFootprintForwardWriterProfile().renderer.requestLimit:complete.limit;
    if (!Number.isSafeInteger(first) || first < 1 || first + UNIT.total - 1 > this.#limit) { throw new Error("FORWARD_WRITER_CLOCK_FIRST_ID"); }
    this.#first = first; this.#next = first;
  }
  #physical(id: number): number {
    const unit = this.#unit.snapshot();
    if (unit.failed || unit.retired || !Number.isSafeInteger(id) || id !== this.#next || id > this.#limit) {
      this.#unit.fail(); throw new Error("FORWARD_WRITER_CLOCK_ORIGINAL_PHYSICAL_ID");
    }
    return unit.nextId;
  }
  public consume(id: number, cleanup: boolean): void { this.#unit.consume(this.#physical(id), cleanup); this.#next += 1; }
  public consumeAllocation(id: number, phase: string, cleanup: boolean): void { this.#unit.consumeAllocation(this.#physical(id), phase, cleanup); this.#next += 1; }
  public consumeCreate(id: number): void { this.#unit.consumeCreate(this.#physical(id)); this.#next += 1; }
  /** Called only by this channel's original fixed full producer path after
   * that path has independently validated and charged its request. */
  public consumeOriginalProducerRequest(id: number): void { this.#physical(id); this.#next += 1; this.#interleaved += 1; }
  public fail(): void { this.#unit.fail(); }
  public requireCompleted(): void { this.#unit.requireCompleted(); }
  public retire(): void { this.#unit.retire(); }
  public snapshot(): ReturnType<CurrentFootprintCopyAllocatedCreateClockBudget["snapshot"]> & Readonly<{ logicalNextId: number; interleavedProducerRequests: number }> {
    const unit = this.#unit.snapshot();
    return Object.freeze({ ...unit, startId: this.#first, nextId: this.#next, lastReservedId: this.#limit,
      logicalNextId: unit.nextId, interleavedProducerRequests: this.#interleaved });
  }
}

/** Only the actual original pre-I/O complete allocation selects this fixed
 * physical ceiling. Old public constructor selectors cannot request it. */
export async function createCurrentFootprintForwardWriterCompleteAllocatedClockBudget(first:number,origin:CurrentFootprintForwardWriterCompleteBirthOrigin):Promise<CurrentFootprintForwardWriterAllocatedCreateClockBudget>{
 const original=await import("./current-footprint-forward-writer-complete-birth-origin.ts");const profile=original.requireOriginalCurrentFootprintForwardWriterCompleteBirth(origin);
 return new CurrentFootprintForwardWriterAllocatedCreateClockBudget(first,Object.freeze({key:COMPLETE_BUDGET_INTERNAL,limit:profile.renderer.requestLimit}));
}
