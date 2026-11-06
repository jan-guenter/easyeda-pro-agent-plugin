/** One private startup cursor owns distinct original document/index jobs.
 * It neither serializes their native puts nor treats pending as fulfilled. */
import { CURRENT_GENERATED_INITIAL_CACHE_CALL_FLAGS as FLAGS, CURRENT_GENERATED_INITIAL_CACHE_REQUESTS as REQUESTS, validateCurrentGeneratedInitialCacheCommand } from "./current-generated-initial-cache-protocol.ts";
import type { CurrentGeneratedInitialCacheCommand } from "./current-generated-initial-cache-protocol.ts";
import type { CurrentGeneratedInitialFlowCacheData } from "./current-generated-initial-flow-cache-plan.ts";
import { CURRENT_GENERATED_INITIAL_CACHE_PROGRAMS as PROGRAMS } from "./current-generated-initial-cache-programs.ts";
import { decodeCurrentProjectSaveProducerCachePromise } from "./current-project-save-producer-cache-replies.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { z } from "zod";

export interface CurrentGeneratedInitialCacheHeld {
  readonly packet: object; readonly role: "headEntry" | "headPromise" | "headSuccess";
  readonly key: string; readonly joinedId: string;
  readonly cache: Readonly<{ role: string; joinedId: string }> | null;
  readonly promise: Readonly<{ objectId: string }> | null;
}
export interface CurrentGeneratedInitialCacheBindings {
  readonly assertCurrent: () => Promise<void>;
  readonly requireHeld: (packet: object) => CurrentGeneratedInitialCacheHeld;
  readonly request: (command: CurrentGeneratedInitialCacheCommand) => Promise<unknown>;
  /** Burns the exact delivered original event before sending Debugger.resume;
   * awaits its empty ACK and the same lane’s actual Debugger.resumed event. */
  readonly resume: (held: CurrentGeneratedInitialCacheHeld, command: CurrentGeneratedInitialCacheCommand) => Promise<void>;
  readonly complete: () => Promise<void>;
  readonly fail: () => void;
}
interface Job { readonly slot: 0 | 1 | 2; readonly key: string; readonly body: string; readonly role: "document" | "head"; entry: string | null; pending: string | null; promise: string | null; stage: number }
const yes = z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) });
function need(value: boolean): asserts value { if (!value) { throw new Error("GENERATED_INITIAL_CACHE_ORIGINAL_JOB"); } }
export class CurrentGeneratedInitialCacheCursor {
  readonly #bindings: CurrentGeneratedInitialCacheBindings; readonly #jobs: readonly Job[]; readonly #attempts = new WeakSet<object>();
  #requests = 0; #settlementPasses = 0; #busy = false; #failed = false; #completed = false;
  public constructor(data: CurrentGeneratedInitialFlowCacheData, bindings: CurrentGeneratedInitialCacheBindings) {
    need(data.documents.length > 0 && data.documents.length <= 2); this.#bindings = bindings;
    const jobs = [...data.documents.map(document => ({ key: document.url, body: document.body, role: "document" as const })), { key: data.headIndex.url, body: data.headIndex.body, role: "head" as const }];
    this.#jobs = Object.freeze(jobs.map((job, slot): Job => { need(slot === 0 || slot === 1 || slot === 2); return { key: job.key, body: job.body, role: job.role, slot, entry: null, pending: null, promise: null, stage: 0 }; }));
    need(new Set(this.#jobs.map(job => job.key)).size === this.#jobs.length); Object.freeze(this);
  }
  async #current(): Promise<void> { need(!this.#failed); await this.#bindings.assertCurrent(); need(!this.#failed); }
  async #send(command: CurrentGeneratedInitialCacheCommand): Promise<unknown> { const fixed = validateCurrentGeneratedInitialCacheCommand(command); await this.#current(); this.#requests += 1; need(this.#requests <= REQUESTS.cdpRequests); const reply = captureCurrentPcbStringClockReply(await this.#bindings.request(fixed)).value; await this.#current(); return reply; }
  #refuse(): void { if (!this.#failed) { this.#failed = true; this.#bindings.fail(); } }
  public async continue(packet: object): Promise<void> {
    need(!this.#busy && !this.#failed && !this.#completed && !this.#attempts.has(packet)); this.#attempts.add(packet); this.#busy = true;
    try {
      const held = this.#bindings.requireHeld(packet), job = this.#jobs.find(value => value.key === held.key); need(job !== undefined && held.packet === packet);
      await this.#current(); need(this.#bindings.requireHeld(packet) === held);
      let command: CurrentGeneratedInitialCacheCommand;
      if (held.role === "headEntry") {
        need(job.stage === 0 && held.cache !== null && held.cache.role === (job.role === "document" ? "flow" : "openCloudHead")); job.stage = 1; job.entry = held.cache.joinedId;
        command = { phase: "initial-cache-entry", slot: job.slot, role: job.role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: job.entry, functionDeclaration: PROGRAMS[job.role], arguments: [{ value: job.key }, { value: job.body }] } };
      } else if (held.role === "headPromise") {
        need(job.stage === 2 && job.entry !== null && held.promise !== null); job.stage = 3; job.pending = held.joinedId; job.promise = held.promise.objectId;
        command = { phase: "initial-cache-promise", slot: job.slot, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: held.joinedId, functionDeclaration: PROGRAMS.promise, arguments: [{ objectId: job.entry }] } };
      } else {
        need(held.role === "headSuccess" && job.stage === 4 && job.entry !== null && job.pending !== null); job.stage = 5;
        command = { phase: "initial-cache-success", slot: job.slot, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: held.joinedId, functionDeclaration: PROGRAMS.success, arguments: [{ objectId: job.entry }, { objectId: job.pending }] } };
      }
      yes.parse(await this.#send(command)); await this.#current(); need(this.#bindings.requireHeld(packet) === held);
      const resume = validateCurrentGeneratedInitialCacheCommand({ phase: "initial-cache-resume", slot: job.slot, role: held.role, method: "Debugger.resume", params: {} });
      this.#requests += 1; need(this.#requests <= REQUESTS.cdpRequests); await this.#bindings.resume(held, resume); await this.#current(); job.stage += 1;
      if (this.#jobs.every(value => value.stage === 6)) { await this.#settle(); }
    } catch (error) { this.#refuse(); throw error; } finally { this.#busy = false; }
  }
  async #settle(): Promise<void> {
    need(this.#jobs.every(job => job.stage === 6 && job.promise !== null) && this.#settlementPasses < 2); this.#settlementPasses += 1;
    let fulfilled = true;
    for (const job of this.#jobs) { need(job.promise !== null); const state = decodeCurrentProjectSaveProducerCachePromise(await this.#send({ phase: "initial-cache-settled-properties", slot: job.slot, method: "Runtime.getProperties", params: { objectId: job.promise, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } })); fulfilled &&= state === "fulfilled"; }
    if (fulfilled) { await this.#current(); await this.#bindings.complete(); await this.#current(); this.#completed = true; }
  }
  /** One further actual metadata pass is available after original collectors
   * make progress. No timer, delay, mutation or inferred settlement is used. */
  public async settle(): Promise<void> { need(!this.#busy && !this.#failed && !this.#completed); this.#busy = true; try { await this.#settle(); } catch (error) { this.#refuse(); throw error; } finally { this.#busy = false; } }
  public requireCompleted(): void { need(!this.#failed && this.#completed); }
}
