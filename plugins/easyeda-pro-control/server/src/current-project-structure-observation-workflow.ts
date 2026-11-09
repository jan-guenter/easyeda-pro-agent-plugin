/** Original native main/worker observer choreography. The caller's lifecycle
 * must journal the frozen intent before arm and retain this exact instance.
 * This workflow never triggers a structure update, edit, callback or Save. */
import { requireOriginalProjectStructureObservationInput } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentProjectStructureNativeOwner } from "./current-pcb-diagnostic-owner.ts";
import { CurrentProjectStructureMainObserver, requireCurrentProjectStructureMainObservation } from "./current-project-structure-main-observer.ts";
import type { CurrentProjectStructureMainObservation } from "./current-project-structure-main-observer.ts";
import { validateCurrentProjectStructureMainPlan } from "./current-project-structure-main-protocol.ts";
import type { CurrentProjectStructureMainPlan } from "./current-project-structure-main-protocol.ts";
import { requireCurrentProjectStructureMainPlanTransportCapacity } from "./current-project-structure-main-wire.ts";
import { CurrentProjectStructureWorkerObserver, requireCurrentProjectStructureWorkerObservation } from "./current-project-structure-worker-observer.ts";
import type { CurrentProjectStructureWorkerObservation } from "./current-project-structure-worker-observer.ts";
import type { CurrentProjectStructureWorkerLease } from "./current-project-structure-worker-lease.ts";

type Input = ReturnType<typeof requireOriginalProjectStructureObservationInput>;
export interface CurrentProjectStructureJoinedObservation {
  readonly profile: "private.current-project-structure-joined-observation.v1";
  readonly projectUuid: string;
  readonly branchUuid: string;
  readonly ticket: number;
  readonly structureText: string;
  readonly sameOriginalNativeFactoryAndDependencyRetained: true;
  readonly completeWorkerAndMainPacketEquality: true;
  readonly originalMainConnectionAndWorkerCallbacksRetained: true;
  readonly completeUploadFrontierVerified: false;
  readonly originatingWriteEligibilityVerified: false;
  readonly completeSqlEffectVerified: false;
  readonly executionAuthorized: false;
  readonly saveAuthorized: false;
}
interface Retained {
  readonly owner: CurrentProjectStructureNativeOwner;
  readonly lease: CurrentProjectStructureWorkerLease;
  readonly input: Input;
  readonly worker: CurrentProjectStructureWorkerObservation;
  readonly main: CurrentProjectStructureMainObservation;
}
const joined = new WeakMap<CurrentProjectStructureJoinedObservation, Retained>();
const consumed = new WeakSet<CurrentProjectStructureNativeOwner>();
/** Fail with a fixed code without returning private tree text or remote IDs. */
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`PROJECT_STRUCTURE_WORKFLOW_${code}`); } }
/** Reprove original construction membership while both leases remain held.
 * After release, the frozen result is historical data and this lookup refuses.
 * JSON and an equal genuine observation from another owner are insufficient. */
export function requireCurrentProjectStructureJoinedObservation(result: CurrentProjectStructureJoinedObservation): Retained {
  const held = joined.get(result); need(held !== undefined, "ORIGINAL_RESULT");
  const actual = requireOriginalProjectStructureObservationInput(held.owner, held.lease, true);
  need(actual.main === held.input.main && actual.capability === held.input.capability && actual.target === held.input.target && actual.construction === held.input.construction, "ORIGINAL_OWNER");
  const main = requireCurrentProjectStructureMainObservation(held.main), worker = requireCurrentProjectStructureWorkerObservation(held.worker);
  need(worker.lease === held.lease && main.issuer === held.input.main, "ORIGINAL_CAPTURES"); return held;
}
export class CurrentProjectStructureObservationWorkflow {
  readonly #owner: CurrentProjectStructureNativeOwner;
  readonly #lease: CurrentProjectStructureWorkerLease;
  readonly #input: Input;
  readonly #plan: CurrentProjectStructureMainPlan;
  readonly #worker: CurrentProjectStructureWorkerObserver;
  #main: CurrentProjectStructureMainObserver | null = null;
  #armAttempted = false;
  #armed = false;
  #observationAttempted = false;
  #busy = false;
  #workerCleaned = false;
  #mainCleaned = false;
  #released = false;
  #failed = false;
  #error: unknown = null;
  public constructor(owner: CurrentProjectStructureNativeOwner, lease: CurrentProjectStructureWorkerLease, input: unknown) {
    this.#input = requireOriginalProjectStructureObservationInput(owner, lease);
    this.#plan = validateCurrentProjectStructureMainPlan(input);
    requireCurrentProjectStructureMainPlanTransportCapacity(this.#plan);
    need(this.#plan.projectUuid === this.#input.target.projectUuid && this.#plan.branchUuid === this.#input.target.branchUuid, "SEALED_TARGET");
    need(!consumed.has(owner), "CONSUMED"); consumed.add(owner);
    this.#owner = owner; this.#lease = lease; this.#worker = new CurrentProjectStructureWorkerObserver(lease);
  }
  /** Retain the first failure. Cleanup may settle original resources, never
   * return to normal work or replace either captured allocation. */
  #stop(error: unknown): void {
    if (!this.#failed) {
      this.#failed = true; this.#error = error;
      this.#worker.cancel(); this.#main?.cancel();
    }
  }
  async #retainFailure<T>(pending: Promise<T>): Promise<T> {
    try { return await pending; } catch (error) { this.#stop(error); throw error; }
  }
  #current(cleanup = false): void {
    if (!cleanup && this.#failed) { throw this.#error; }
    need(!this.#released, "RELEASED");
    const actual = requireOriginalProjectStructureObservationInput(this.#owner, this.#lease, cleanup);
    need(actual.main === this.#input.main && actual.capability === this.#input.capability && actual.target === this.#input.target && actual.construction === this.#input.construction, "ORIGINAL_OWNER");
  }
  /** Reserve both original observers before an independently authorized
   * operation. Arming is one-shot and invokes no application producer. */
  public async arm(): Promise<void> {
    this.#current(); need(!this.#busy && !this.#armAttempted, "ARM_CONSUMED"); this.#armAttempted = true; this.#busy = true;
    try {
      const lease = await this.#input.main.issueStructureLease(this.#input.capability, this.#input.construction);
      this.#main = new CurrentProjectStructureMainObserver(lease, this.#plan);
      // Cancellation may have won while the original issuer was pending. Its
      // Newly received lease must be revoked before the retained error escapes.
      if (this.#failed) { this.#main.cancel(); } this.#current();
      await this.#main.arm(); this.#current(); await this.#worker.arm(); this.#current(); this.#armed = true;
    } catch (error) { this.#stop(error); throw error; } finally { this.#busy = false; }
  }
  /** Observe independently running original work and compare the entire posted
   * tree/ticket against the complete main request. Stable polling is not proof. */
  public async observation(): Promise<CurrentProjectStructureJoinedObservation> {
    this.#current(); need(this.#armed && !this.#busy && !this.#observationAttempted && this.#main !== null, "OBSERVATION_CONSUMED");
    this.#observationAttempted = true; this.#busy = true;
    try {
      const results = await Promise.allSettled([this.#retainFailure(this.#worker.observation()), this.#retainFailure(this.#main.observation())]); this.#current();
      const main = results[1], worker = results[0];
      if (worker.status === "rejected") { throw worker.reason; } if (main.status === "rejected") { throw main.reason; }
      need(worker.value.projectUuid === main.value.projectUuid && worker.value.branchUuid === main.value.branchUuid && worker.value.ticket === main.value.ticket &&
        worker.value.structureText === main.value.structureText && main.value.projectPath === this.#input.target.rawWindowsPath, "COMPLETE_PACKET_EQUALITY");
      const result = Object.freeze({ profile: "private.current-project-structure-joined-observation.v1" as const,
        projectUuid: worker.value.projectUuid, branchUuid: worker.value.branchUuid, ticket: worker.value.ticket, structureText: worker.value.structureText,
        sameOriginalNativeFactoryAndDependencyRetained: true as const, completeWorkerAndMainPacketEquality: true as const,
        originalMainConnectionAndWorkerCallbacksRetained: true as const, completeUploadFrontierVerified: false as const,
        originatingWriteEligibilityVerified: false as const, completeSqlEffectVerified: false as const, executionAuthorized: false as const, saveAuthorized: false as const });
      joined.set(result, Object.freeze({ owner: this.#owner, lease: this.#lease, input: this.#input, worker: worker.value, main: main.value }));
      requireCurrentProjectStructureJoinedObservation(result); return result;
    } catch (error) { this.#stop(error); throw error; } finally { this.#busy = false; }
  }
  /** Cooperatively revoke this exact observation while its request is pending.
   * Keep awaiting observation() before cleanup; no native request is forgotten,
   * replaced or retried, and the first failure remains the outward cause. */
  public cancel(): void { this.#stop(new Error("PROJECT_STRUCTURE_WORKFLOW_CANCELLED")); }
  /** Cleanup independently retained allocations. A failed unknown allocation
   * stays retained; only that observer's supported original settlement may help. */
  public async cleanup(): Promise<void> {
    this.#current(true); need(!this.#busy && this.#armAttempted, "CLEANUP_STATE"); this.#busy = true;
    try {
      const errors: unknown[] = [];
      if (!this.#workerCleaned) { try { await this.#worker.cleanup(); this.#workerCleaned = true; } catch (error) { errors.push(error); } }
      if (this.#main !== null && !this.#mainCleaned) { try { await this.#main.cleanup(); this.#mainCleaned = true; } catch (error) { errors.push(error); } }
      if (this.#main === null) { this.#mainCleaned = true; }
      if (errors.length > 0) { throw new AggregateError(errors, "PROJECT_STRUCTURE_WORKFLOW_RETAIN_CLEANUP"); }
    } finally { this.#busy = false; }
  }
  /** Release the original main capture group after consumers finish the join.
   * The construction owner and native process remain separately retained. */
  public async release(): Promise<void> {
    this.#current(true); need(!this.#busy && this.#workerCleaned && this.#mainCleaned, "RELEASE_STATE"); this.#busy = true;
    try { if (this.#main !== null) { await this.#main.release(); } this.#released = true; } finally { this.#busy = false; }
  }
}
