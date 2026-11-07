/** Source-expected inverse startup jobs only. Original native custody is
 * supplied solely by Core's private same-worker bindings, never data labels. */
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentProjectSaveProducerCachePromise } from "./current-project-save-producer-cache-replies.ts";
import { CURRENT_FOOTPRINT_INVERSE_INITIAL_CACHE_PROGRAMS as PROGRAMS } from "./current-footprint-inverse-initial-cache-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_INITIAL_CACHE_FLAGS as FLAGS, currentFootprintInverseInitialCacheBudget, validateCurrentFootprintInverseInitialCacheCommand } from "./current-footprint-inverse-initial-cache-protocol.ts";
import type { CurrentFootprintInverseInitialCacheCommand, CurrentFootprintInverseInitialCacheRole } from "./current-footprint-inverse-initial-cache-protocol.ts";
import type { CurrentFootprintInverseInitialCacheData } from "./current-footprint-inverse-initial-cache-data.ts";

export interface CurrentFootprintInverseInitialCacheHeld {
  readonly packet: object; readonly role: CurrentFootprintInverseInitialCacheRole; readonly key: string; readonly joinedId: string;
  readonly cache: Readonly<{ role: "flow" | "openCloudHead"; joinedId: string }> | null;
  readonly promise: Readonly<{ objectId: string }> | null;
}
export interface CurrentFootprintInverseInitialCacheBindings {
  readonly assertCurrent: () => Promise<void>;
  readonly requireHeld: (packet: object) => CurrentFootprintInverseInitialCacheHeld;
  readonly request: (command: CurrentFootprintInverseInitialCacheCommand) => Promise<unknown>;
  readonly resume: (held: CurrentFootprintInverseInitialCacheHeld, command: CurrentFootprintInverseInitialCacheCommand) => Promise<void>;
  readonly complete: () => Promise<void>; readonly fail: () => void;
}
interface Job { readonly slot: number; readonly key: string; readonly body: string; readonly kind: "flow" | "head"; stage: number; entry: string | null; pending: string | null; promise: string | null }
const yes = z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) });
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_INVERSE_INITIAL_CACHE_ORIGINAL_JOB"); } }
export class CurrentFootprintInverseInitialCacheCursor {
  readonly #data: CurrentFootprintInverseInitialCacheData; readonly #bindings: CurrentFootprintInverseInitialCacheBindings; readonly #jobs: readonly Job[];
  readonly #attempts = new WeakSet<object>(); #requests = 0; #resumes = 0; #settlementPasses = 0; #busy = false; #failed = false; #complete = false;
  public constructor(data: CurrentFootprintInverseInitialCacheData, bindings: CurrentFootprintInverseInitialCacheBindings) {
    need(Object.isFrozen(data) && data.schema === "private.current-footprint-inverse-initial-cache-data.v1"); currentFootprintInverseInitialCacheBudget(data.jobs.length);
    need(new Set(data.jobs.map(job => job.key)).size === data.jobs.length && data.jobs.filter(job => job.kind === "head").length === 1);
    this.#data = data; this.#bindings = bindings; this.#jobs = Object.freeze(data.jobs.map((job, slot) => { need(slot === job.slot); return { ...job, stage: 0, entry: null, pending: null, promise: null }; })); Object.freeze(this);
  }
  async #current(): Promise<void> { need(!this.#failed); await this.#bindings.assertCurrent(); need(!this.#failed); }
  async #send(input: CurrentFootprintInverseInitialCacheCommand): Promise<unknown> {
    const command = validateCurrentFootprintInverseInitialCacheCommand(input); await this.#current(); this.#requests += 1; need(this.#requests <= currentFootprintInverseInitialCacheBudget(this.#jobs.length).cursorNormal);
    const result = captureCurrentPcbStringClockReply(await this.#bindings.request(command)).value; await this.#current(); return result;
  }
  public async continue(packet: object): Promise<void> {
    need(!this.#busy && !this.#failed && !this.#complete && !this.#attempts.has(packet)); this.#attempts.add(packet); this.#busy = true;
    try {
      const held = this.#bindings.requireHeld(packet), job = this.#jobs.find(value => value.key === held.key); need(job !== undefined && held.packet === packet);
      await this.#current(); need(this.#bindings.requireHeld(packet) === held); let command: CurrentFootprintInverseInitialCacheCommand;
      if (held.role === "headEntry") {
        need(job.stage === 0 && held.cache !== null && held.cache.role === (job.kind === "flow" ? "flow" : "openCloudHead")); job.stage = 1; job.entry = held.cache.joinedId;
        if (job.kind === "flow") { command = { phase: "inverse-initial-cache-flow", slot: job.slot, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: job.entry, functionDeclaration: PROGRAMS.flow, arguments: [{ value: job.key }, { value: job.body }] } }; }
        else { const limits = this.#data.headLimits; command = { phase: "inverse-initial-cache-head", slot: job.slot, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: job.entry, functionDeclaration: PROGRAMS.head, arguments: [{ value: job.key }, { value: job.body }, { value: limits.nodes }, { value: limits.depth }, { value: limits.array }, { value: limits.keys }, { value: limits.string }] } }; }
      } else if (held.role === "headPromise") {
        need(job.stage === 2 && job.entry !== null && held.promise !== null); job.stage = 3; job.pending = held.joinedId; job.promise = held.promise.objectId;
        command = { phase: "inverse-initial-cache-promise", slot: job.slot, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: held.joinedId, functionDeclaration: PROGRAMS.promise, arguments: [{ objectId: job.entry }] } };
      } else {
        need(held.role === "headSuccess" && job.stage === 4 && job.entry !== null && job.pending !== null); job.stage = 5;
        command = { phase: "inverse-initial-cache-success", slot: job.slot, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: held.joinedId, functionDeclaration: PROGRAMS.success, arguments: [{ objectId: job.entry }, { objectId: job.pending }] } };
      }
      yes.parse(await this.#send(command)); await this.#current(); need(this.#bindings.requireHeld(packet) === held);
      const resume = validateCurrentFootprintInverseInitialCacheCommand({ phase: "inverse-initial-cache-resume", slot: job.slot, role: held.role, method: "Debugger.resume", params: {} });
      this.#requests += 1; need(this.#requests <= currentFootprintInverseInitialCacheBudget(this.#jobs.length).cursorNormal); await this.#bindings.resume(held, resume); this.#resumes += 1; await this.#current(); job.stage += 1;
      if (this.#jobs.every(value => value.stage === 6)) { await this.#settle(); }
    } catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; }
  }
  async #settle(): Promise<void> {
    need(this.#jobs.every(job => job.stage === 6 && job.promise !== null) && this.#settlementPasses < 2); this.#settlementPasses += 1; let fulfilled = true;
    for (const job of this.#jobs) { need(job.promise !== null); const state = decodeCurrentProjectSaveProducerCachePromise(await this.#send({ phase: "inverse-initial-cache-settled", slot: job.slot, method: "Runtime.getProperties", params: { objectId: job.promise, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } })); fulfilled &&= state === "fulfilled"; }
    if (fulfilled) { await this.#current(); await this.#bindings.complete(); await this.#current(); this.#complete = true; }
  }
  public async settle(): Promise<void> { need(!this.#busy && !this.#failed && !this.#complete); this.#busy = true; try { await this.#settle(); } catch (error) { this.#failed = true; this.#bindings.fail(); throw error; } finally { this.#busy = false; } }
  public originalHeadEntry(): string { need(!this.#failed); const head = this.#jobs.find(job => job.kind === "head"); need(head !== undefined && head.stage >= 2 && head.entry !== null); return head.entry; }
  public requireCompleted(): void { need(this.#complete && !this.#failed); }
  public status(): Readonly<{ jobs: number; acknowledgedResumes: number; allCallsResumed: boolean; settlementPasses: number; canSettle: boolean; complete: boolean; failed: boolean; completeProducerFrontierVerified: false }> {
    const allCallsResumed = this.#jobs.every(job => job.stage === 6); return Object.freeze({ jobs: this.#jobs.length, acknowledgedResumes: this.#resumes, allCallsResumed, settlementPasses: this.#settlementPasses,
      canSettle: !this.#busy && !this.#failed && !this.#complete && allCallsResumed && this.#settlementPasses < 2, complete: this.#complete, failed: this.#failed, completeProducerFrontierVerified: false });
  }
}
