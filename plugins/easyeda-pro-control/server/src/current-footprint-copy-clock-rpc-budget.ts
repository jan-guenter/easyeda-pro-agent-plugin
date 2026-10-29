/** Pure finite accounting. This reserves no native owner, allocator, message
 * bytes, lifetime or complete writer lifecycle and issues no execution token. */
import { CURRENT_FOOTPRINT_COMBINED_PROFILE as COMBINED } from "./current-footprint-copy-combined-profile.ts";
import { CURRENT_FOOTPRINT_COPY_CACHE_CONSTRUCTION_REQUESTS as CACHE } from "./current-footprint-copy-cache-construction-contract.ts";
import { CURRENT_FOOTPRINT_PARENT_CONSTRUCTION_REQUESTS as PARENT } from "./current-footprint-copy-parent-construction-contract.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_RPC_REQUESTS as RPC } from "./current-footprint-copy-clock-rpc-protocol.ts";

const handoffMaximum = CACHE.release + PARENT.release;
export const CURRENT_FOOTPRINT_COPY_CLOCK_RPC_BUDGET = Object.freeze({
  normal: RPC.normal, cleanup: RPC.cleanup, total: RPC.total, handoffMaximum,
  maximumNormalId: COMBINED.renderer.normalRequestLimit,
  maximumRequestId: COMBINED.renderer.requestLimit,
  handoffAndUnit: handoffMaximum + RPC.total,
});

function error(code: string): Error { return new Error(`FOOTPRINT_CLOCK_RPC_BUDGET_${code}`); }
function startId(value: number, prefix: number): number {
  const limits = CURRENT_FOOTPRINT_COPY_CLOCK_RPC_BUDGET;
  if (!Number.isSafeInteger(value) || value < 1 || value > limits.maximumRequestId) { throw error("START_ID"); }
  const last = value + prefix + limits.total - 1;
  // Even cleanup IDs use the unchanged normal-ID space for this unit. This
  // Conservative condition preserves every existing post-normal cleanup ID.
  if (last > limits.maximumNormalId || last > limits.maximumRequestId) { throw error("HEADROOM"); }
  return last;
}

/** Check BEFORE either original group release. Actual release commands still
 * use their existing allocator; the unit starts at its later actual next ID. */
export function requireCurrentFootprintCopyClockRpcHandoffHeadroom(nextId: number): Readonly<{
  nextId: number; lastReservedId: number; handoffMaximum: number; reservedIds: number;
}> {
  const limits = CURRENT_FOOTPRINT_COPY_CLOCK_RPC_BUDGET;
  return Object.freeze({ nextId, lastReservedId: startId(nextId, limits.handoffMaximum),
    handoffMaximum: limits.handoffMaximum, reservedIds: limits.handoffAndUnit });
}

export interface CurrentFootprintCopyClockRpcBudgetSnapshot {
  readonly startId: number;
  readonly nextId: number;
  readonly lastReservedId: number;
  readonly normalConsumed: number;
  readonly cleanupConsumed: number;
  readonly consumed: number;
  readonly failed: boolean;
  readonly retired: boolean;
  readonly firstFailure: string | null;
  readonly originalGenerationExitRequired: boolean;
  readonly executionAuthorized: false;
}

/** The genuine channel supplies each original contiguous ID and derives its
 * cleanup class from the fixed validated command. Consume before native send.
 * A failed acknowledgement never refunds an ID. Retiring this accounting object
 * grants no restored transport role; its owner separately retains ambiguity
 * through actual original-generation exit. No data-only exit setter exists. */
export class CurrentFootprintCopyClockRpcBudget {
  readonly #start: number;
  readonly #last: number;
  #next: number;
  #normal = 0;
  #cleanup = 0;
  #failed = false;
  #retired = false;
  #firstFailure: string | null = null;

  public constructor(firstRequestId: number) {
    this.#last = startId(firstRequestId, 0); this.#start = firstRequestId; this.#next = firstRequestId;
  }
  #refuse(code: string): never {
    this.#failed = true; this.#firstFailure ??= code; throw error(code);
  }
  /** Accounting only. This boolean is not accepted from an external request. */
  public consume(id: number, cleanup: boolean): void {
    if (this.#retired || this.#failed) { throw error("UNAVAILABLE"); }
    if (!Number.isSafeInteger(id) || id !== this.#next) { this.#refuse("CONTIGUOUS_ID"); }
    if (typeof cleanup !== "boolean") { this.#refuse("CLASSIFICATION"); }
    const limits = CURRENT_FOOTPRINT_COPY_CLOCK_RPC_BUDGET;
    if (id > this.#last || this.#normal + this.#cleanup >= limits.total) { this.#refuse("TOTAL"); }
    if (cleanup ? this.#cleanup >= limits.cleanup : this.#normal >= limits.normal) { this.#refuse("CLASS_LIMIT"); }
    this.#next += 1;
    if (cleanup) { this.#cleanup += 1; } else { this.#normal += 1; }
  }
  /** Native ambiguity is sticky even when the last command consumed an ID. */
  public fail(): void {
    this.#failed = true; this.#firstFailure ??= "NATIVE_OUTCOME";
  }
  #completed(): boolean {
    const limits = CURRENT_FOOTPRINT_COPY_CLOCK_RPC_BUDGET;
    return this.#normal === limits.normal && this.#cleanup === limits.cleanup && this.#next === this.#last + 1;
  }
  /** Count witness only. The original owner must separately prove native
   * breakpoint removal, observed resumes, group release and an idle channel. */
  public requireCompleted(): void {
    if (this.#retired || this.#failed) { throw error("UNAVAILABLE"); }
    if (!this.#completed()) { throw error("INCOMPLETE"); }
  }
  /** Only the complete fixed count pattern permits normal retirement. An
   * uninvoked prefix still needs actual original-generation exit in its owner;
   * this pure budget cannot attest that exit or return the remaining capacity. */
  public retire(): void {
    if (this.#retired || this.#failed) { throw error("UNAVAILABLE"); }
    if (!this.#completed()) { this.#refuse("INCOMPLETE"); }
    this.#retired = true;
  }
  public snapshot(): CurrentFootprintCopyClockRpcBudgetSnapshot {
    return Object.freeze({ startId: this.#start, nextId: this.#next, lastReservedId: this.#last,
      normalConsumed: this.#normal, cleanupConsumed: this.#cleanup, consumed: this.#normal + this.#cleanup,
      failed: this.#failed, retired: this.#retired, firstFailure: this.#firstFailure,
      originalGenerationExitRequired: this.#failed, executionAuthorized: false });
  }
}
