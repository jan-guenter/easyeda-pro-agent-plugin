/** One private startup cursor owns distinct original document/index jobs.
 * It neither serializes their native puts nor treats pending as fulfilled. */
import { CURRENT_FOOTPRINT_INITIAL_CACHE_CALL_FLAGS as FLAGS, CURRENT_FOOTPRINT_INITIAL_CACHE_REQUESTS as REQUESTS, validateCurrentFootprintInitialCacheCommand } from "./current-footprint-initial-cache-protocol.ts";
import type { CurrentFootprintInitialCacheCommand } from "./current-footprint-initial-cache-protocol.ts";
import type { CurrentFootprintSavedFlowCacheData } from "./current-footprint-saved-flow-cache-data.ts";
import { CURRENT_FOOTPRINT_INITIAL_CACHE_PROGRAMS as PROGRAMS, requireCurrentFootprintInitialCacheHeadData } from "./current-footprint-initial-cache-programs.ts";
import { decodeCurrentProjectSaveProducerCachePromise } from "./current-project-save-producer-cache-replies.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { z } from "zod";
import { types } from "node:util";

export interface CurrentFootprintInitialCacheProgress {
  readonly jobs: number; readonly acknowledgedResumes: number; readonly allCallsResumed: boolean; readonly settlementPasses: number;
  readonly canSettle: boolean; readonly completed: boolean; readonly failed: boolean; readonly nativeOwnershipVerified: false; readonly completeUploadFrontierVerified: false;
}
export interface CurrentFootprintInitialCacheHeld {
  readonly packet: object; readonly role: "headEntry" | "headPromise" | "headSuccess";
  readonly key: string; readonly joinedId: string;
  readonly cache: Readonly<{ role: string; joinedId: string }> | null;
  readonly promise: Readonly<{ objectId: string }> | null;
}
export interface CurrentFootprintInitialCacheBindings {
  readonly assertCurrent: () => Promise<void>;
  readonly requireHeld: (packet: object) => CurrentFootprintInitialCacheHeld;
  readonly request: (command: CurrentFootprintInitialCacheCommand) => Promise<unknown>;
  /** Burns the exact delivered original event before sending Debugger.resume;
   * awaits its empty ACK and the same lane’s actual Debugger.resumed event. */
  readonly resume: (held: CurrentFootprintInitialCacheHeld, command: CurrentFootprintInitialCacheCommand) => Promise<void>;
  readonly complete: () => Promise<void>;
  readonly fail: () => void;
}
interface Job { readonly slot: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7; readonly key: string; readonly body: string; readonly role: "document" | "head"; entry: string | null; pending: string | null; promise: string | null; stage: number }
const yes = z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) });
function need(value: boolean): asserts value { if (!value) { throw new Error("FOOTPRINT_INITIAL_CACHE_ORIGINAL_JOB"); } }
export class CurrentFootprintInitialCacheCursor {
  readonly #bindings: CurrentFootprintInitialCacheBindings; readonly #jobs: readonly Job[]; readonly #attempts = new WeakSet<object>();
  #requests = 0; #resumes = 0; #settlementPasses = 0; #busy = false; #failed = false; #completed = false;
  public constructor(data: CurrentFootprintSavedFlowCacheData, bindings: CurrentFootprintInitialCacheBindings) {
    captureCurrentPcbStringClockReply(data);
    need(data.bodies.length > 0 && data.bodies.length <= 7 && Object.isFrozen(data) && bindings !== null && typeof bindings === "object" && !types.isProxy(bindings) && Object.getPrototypeOf(bindings) === Object.prototype && Object.isFrozen(bindings));
    const methods = ["assertCurrent", "requireHeld", "request", "resume", "complete", "fail"];
    need(Reflect.ownKeys(bindings).length === methods.length);
    for (const method of methods) { const own = Object.getOwnPropertyDescriptor(bindings, method); need(own !== undefined && Object.hasOwn(own, "value") && typeof own.value === "function" && !types.isProxy(own.value)); }
    requireCurrentFootprintInitialCacheHeadData(data.headIndex.body); this.#bindings = bindings;
    const jobs = [...data.bodies.map(document => ({ key: document.url, body: document.body, role: "document" as const })), { key: data.headIndex.url, body: data.headIndex.body, role: "head" as const }];
    this.#jobs = Object.freeze(jobs.map((job, slot): Job => { need(slot === 0 || slot === 1 || slot === 2 || slot === 3 || slot === 4 || slot === 5 || slot === 6 || slot === 7); return { key: job.key, body: job.body, role: job.role, slot, entry: null, pending: null, promise: null, stage: 0 }; }));
    need(new Set(this.#jobs.map(job => job.key)).size === this.#jobs.length); Object.freeze(this);
  }
  async #current(): Promise<void> { need(!this.#failed); await this.#bindings.assertCurrent(); need(!this.#failed); }
  async #send(command: CurrentFootprintInitialCacheCommand): Promise<unknown> { const fixed = validateCurrentFootprintInitialCacheCommand(command); await this.#current(); this.#requests += 1; need(this.#requests <= REQUESTS.cursorRequests); const reply = captureCurrentPcbStringClockReply(await this.#bindings.request(fixed)).value; await this.#current(); return reply; }
  #refuse(): void { if (!this.#failed) { this.#failed = true; this.#bindings.fail(); } }
  public async continue(packet: object): Promise<void> {
    need(!this.#busy && !this.#failed && !this.#completed && !this.#attempts.has(packet)); this.#attempts.add(packet); this.#busy = true;
    try {
      const held = this.#bindings.requireHeld(packet), job = this.#jobs.find(value => value.key === held.key); need(job !== undefined && held.packet === packet);
      await this.#current(); need(this.#bindings.requireHeld(packet) === held);
      let command: CurrentFootprintInitialCacheCommand;
      if (held.role === "headEntry") {
        need(job.stage === 0 && held.cache !== null && held.cache.role === (job.role === "document" ? "flow" : "openCloudHead")); job.stage = 1; job.entry = held.cache.joinedId;
        command = { phase: "footprint-initial-cache-entry", slot: job.slot, role: job.role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: job.entry, functionDeclaration: PROGRAMS[job.role], arguments: [{ value: job.key }, { value: job.body }] } };
      } else if (held.role === "headPromise") {
        need(job.stage === 2 && job.entry !== null && held.promise !== null); job.stage = 3; job.pending = held.joinedId; job.promise = held.promise.objectId;
        command = { phase: "footprint-initial-cache-promise", slot: job.slot, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: held.joinedId, functionDeclaration: PROGRAMS.promise, arguments: [{ objectId: job.entry }] } };
      } else {
        need(held.role === "headSuccess" && job.stage === 4 && job.entry !== null && job.pending !== null); job.stage = 5;
        command = { phase: "footprint-initial-cache-success", slot: job.slot, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: held.joinedId, functionDeclaration: PROGRAMS.success, arguments: [{ objectId: job.entry }, { objectId: job.pending }] } };
      }
      yes.parse(await this.#send(command)); await this.#current(); need(this.#bindings.requireHeld(packet) === held);
      const resume = validateCurrentFootprintInitialCacheCommand({ phase: "footprint-initial-cache-resume", slot: job.slot, role: held.role, method: "Debugger.resume", params: {} });
      this.#requests += 1; need(this.#requests <= REQUESTS.cursorRequests); await this.#bindings.resume(held, resume); this.#resumes += 1; await this.#current(); job.stage += 1;
      if (this.#jobs.every(value => value.stage === 6)) { await this.#settle(); }
    } catch (error) { this.#refuse(); throw error; } finally { this.#busy = false; }
  }
  async #settle(): Promise<void> {
    need(this.#jobs.every(job => job.stage === 6 && job.promise !== null) && this.#settlementPasses < 2); this.#settlementPasses += 1;
    let fulfilled = true;
    for (const job of this.#jobs) { need(job.promise !== null); const state = decodeCurrentProjectSaveProducerCachePromise(await this.#send({ phase: "footprint-initial-cache-settled-properties", slot: job.slot, method: "Runtime.getProperties", params: { objectId: job.promise, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } })); fulfilled &&= state === "fulfilled"; }
    if (fulfilled) { await this.#current(); await this.#bindings.complete(); await this.#current(); this.#completed = true; }
  }
  /** One further actual metadata pass is available after original collectors
   * make progress. No timer, delay, mutation or inferred settlement is used. */
  public async settle(): Promise<void> { need(!this.#busy && !this.#failed && !this.#completed); this.#busy = true; try { await this.#settle(); } catch (error) { this.#refuse(); throw error; } finally { this.#busy = false; } }
  public originalHeadEntry(): string { const job = this.#jobs.find(value => value.role === "head"); need(!this.#failed && job !== undefined && job.stage >= 4 && job.entry !== null); return job.entry; }
  public startupProgress(): CurrentFootprintInitialCacheProgress {
    const allCallsResumed = this.#jobs.every(job => job.stage === 6);
    return Object.freeze({ jobs: this.#jobs.length, acknowledgedResumes: this.#resumes, allCallsResumed, settlementPasses: this.#settlementPasses,
      canSettle: !this.#busy && !this.#failed && !this.#completed && allCallsResumed && this.#settlementPasses < 2, completed: this.#completed, failed: this.#failed, nativeOwnershipVerified: false, completeUploadFrontierVerified: false });
  }
  public requireCompleted(): void { need(!this.#failed && this.#completed); }
}
