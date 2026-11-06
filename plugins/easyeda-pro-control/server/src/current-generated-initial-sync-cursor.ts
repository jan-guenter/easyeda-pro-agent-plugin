/** One original initial sync. A changed API row is refused while its
 * actual response pause is still held, before hd/du or model parsing. */
import { z } from "zod";
import { CURRENT_GENERATED_INITIAL_SYNC_FLAGS as FLAGS, CURRENT_GENERATED_INITIAL_SYNC_REQUESTS as REQUESTS, validateCurrentGeneratedInitialSyncCommand } from "./current-generated-initial-sync-protocol.ts";
import type { CurrentGeneratedInitialSyncCommand } from "./current-generated-initial-sync-protocol.ts";
import { CURRENT_GENERATED_INITIAL_SYNC_PROGRAMS as PROGRAMS } from "./current-generated-initial-sync-programs.ts";
import { CURRENT_GENERATED_INITIAL_SYNC_CALLER as CALLER, CURRENT_GENERATED_INITIAL_SYNC_MODULE_EXPRESSION as MODULE } from "./current-generated-initial-sync-source.ts";
import { decodeCurrentGeneratedInitialSyncCallee, requireCurrentGeneratedInitialSyncCalleeDescription } from "./current-generated-initial-sync-replies.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_CACHE_PROMISE_CAPTURE, currentProjectSaveProducerCachePromiseHandle, decodeCurrentProjectSaveProducerCachePromise } from "./current-project-save-producer-cache-replies.ts";
import { currentFootprintCopyClockRpcV2ArrayObject, decodeCurrentFootprintCopyClockRpcV2Array, decodeCurrentFootprintCopyClockRpcV2ArrayCapture } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { CurrentGeneratedInitialFlowCacheData } from "./current-generated-initial-flow-cache-plan.ts";

export type CurrentGeneratedInitialSyncRole = "syncEntry" | "syncFull" | "syncHistory" | "syncMerged" | "syncFinalizing" | "syncReturned";
export interface CurrentGeneratedInitialSyncHeld { readonly packet: object; readonly role: CurrentGeneratedInitialSyncRole; readonly joinedId: string; readonly callFrameId: string; readonly callerFrameId: string | null; readonly returnPromiseId: string | null }
export interface CurrentGeneratedInitialSyncBindings {
  readonly scriptId: string; readonly projectId: string;
  readonly assertCurrent: () => Promise<void>;
  readonly requireHeld: (packet: object) => CurrentGeneratedInitialSyncHeld;
  readonly headEntry: () => string;
  readonly request: (command: CurrentGeneratedInitialSyncCommand) => Promise<unknown>;
  readonly resume: (held: CurrentGeneratedInitialSyncHeld, command: CurrentGeneratedInitialSyncCommand) => Promise<void>;
  readonly complete: () => Promise<void>; readonly fail: () => void;
}
const yes = z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) });
function need(value: boolean): asserts value { if (!value) { throw new Error("GENERATED_INITIAL_SYNC_ORIGINAL_CALL"); } }
const properties = (objectId: string): Readonly<{ objectId: string; ownProperties: true; accessorPropertiesOnly: false; generatePreview: false }> => ({ objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
function plainObjects(reply: unknown, count: number): void {
  const objects = decodeCurrentFootprintCopyClockRpcV2Array(reply, count);
  for (let index = 0; index < count; index += 1) { const value = objects.get(String(index)); need(value?.type === "object" && value.objectId !== undefined && value.value === undefined && (value.subtype === undefined || value.subtype === "array") && (value.className === "Object" || value.className === "Array")); }
}
export class CurrentGeneratedInitialSyncCursor {
  readonly #data: CurrentGeneratedInitialFlowCacheData; readonly #bindings: CurrentGeneratedInitialSyncBindings; readonly #attempted = new WeakSet<object>();
  #requests = 0; #step = 0; #ordinal: 1 | 2 | 3 | 4 = 1; #capture: string | null = null; #full: string | null = null; #last: string | null = null;
  #task: string | null = null; #outer: string | null = null; #passes = 0; #busy = false; #failed = false; #completed = false;
  public constructor(data: CurrentGeneratedInitialFlowCacheData, bindings: CurrentGeneratedInitialSyncBindings) { this.#data = data; this.#bindings = bindings; Object.freeze(this); }
  async #current(): Promise<void> { need(!this.#failed); await this.#bindings.assertCurrent(); need(!this.#failed); }
  async #send(input: CurrentGeneratedInitialSyncCommand): Promise<unknown> { const fixed = validateCurrentGeneratedInitialSyncCommand(input); await this.#current(); this.#requests += 1; need(this.#requests <= REQUESTS.cdpRequests); const reply = captureCurrentPcbStringClockReply(await this.#bindings.request(fixed)).value; await this.#current(); return reply; }
  #refuse(): void { if (!this.#failed) { this.#failed = true; this.#bindings.fail(); } }
  public async continue(packet: object): Promise<void> {
    need(!this.#busy && !this.#failed && !this.#completed && !this.#attempted.has(packet)); this.#attempted.add(packet); this.#busy = true;
    try {
      const held = this.#bindings.requireHeld(packet); need(held.packet === packet); await this.#current(); need(this.#bindings.requireHeld(packet) === held);
      let resumeRole: Extract<CurrentGeneratedInitialSyncCommand, { phase: "initial-sync-resume" }>["role"];
      if (this.#step === 0) {
        need(held.role === "syncEntry" && held.callerFrameId !== null); const frame = { objectGroup: FLAGS.objectGroup, silent: true, generatePreview: false, throwOnSideEffect: true, returnByValue: false, includeCommandLineAPI: false } as const;
        const module = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await this.#send({ phase: "initial-sync-module", method: "Debugger.evaluateOnCallFrame", params: { ...frame, callFrameId: held.callFrameId, expression: MODULE } }), 6);
        const caller = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await this.#send({ phase: "initial-sync-caller", method: "Debugger.evaluateOnCallFrame", params: { ...frame, callFrameId: held.callerFrameId, expression: CALLER.expression } }), 2);
        const head = this.#bindings.headEntry(); this.#capture = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await this.#send({ phase: "initial-sync-capture", method: "Runtime.callFunctionOn", params: { ...FLAGS, returnByValue: false, objectId: held.joinedId, functionDeclaration: PROGRAMS.capture, arguments: [{ objectId: module }, { objectId: this.#bindings.projectId }, { objectId: head }, { objectId: caller }, { value: this.#data.headIndex.url }, { value: this.#data.headIndex.body }] } }), 16);
        const fields = decodeCurrentFootprintCopyClockRpcV2Array(await this.#send({ phase: "initial-sync-capture-properties", method: "Runtime.getProperties", params: properties(this.#capture) }), 16);
        for (let slot = 0; slot < 10; slot += 1) {
          const value = fields.get(String(slot + 6)); need(value?.type === "function"); requireCurrentGeneratedInitialSyncCalleeDescription(value.description, slot);
          const handle = currentFootprintCopyClockRpcV2ArrayObject(fields, slot + 6);
          // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- This loop enumerates exactly the ten fixed numeric callee slots.
          const fixedSlot = slot as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
          decodeCurrentGeneratedInitialSyncCallee(await this.#send({ phase: "initial-sync-callee", slot: fixedSlot, method: "Runtime.getProperties", params: properties(handle) }), slot, this.#bindings.scriptId);
        }
        // Metadata exposes Proxy wrappers without running their get traps.
        const baseline = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await this.#send({ phase: "initial-sync-baseline-objects", method: "Runtime.callFunctionOn", params: { ...FLAGS, returnByValue: false, objectId: this.#capture, functionDeclaration: PROGRAMS.baselineObjects, arguments: [] } }), 8);
        plainObjects(await this.#send({ phase: "initial-sync-baseline-object-properties", method: "Runtime.getProperties", params: properties(baseline) }), 8);
        resumeRole = "syncEntry"; this.#step = 1;
      } else {
        need(this.#capture !== null);
        if (this.#step === 1) {
          need(held.role === "syncFull"); this.#full = held.joinedId;
          const fields = decodeCurrentFootprintCopyClockRpcV2Array(await this.#send({ phase: "initial-sync-full-properties", method: "Runtime.getProperties", params: properties(held.joinedId) }), 5), task = fields.get("4");
          need(task?.type === "object" && task.subtype === "promise" && task.className === "Promise" && task.description === "Promise"); this.#task = currentFootprintCopyClockRpcV2ArrayObject(fields, 4);
          yes.parse(await this.#send({ phase: "initial-sync-full", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: held.joinedId, functionDeclaration: PROGRAMS.full, arguments: [{ objectId: this.#capture }] } })); resumeRole = "syncFull"; this.#step = 2;
        } else {
          need(this.#full !== null);
          if (this.#step === 2) {
            need(held.role === "syncHistory");
            const objects = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await this.#send({ phase: "initial-sync-response-objects", ordinal: this.#ordinal, method: "Runtime.callFunctionOn", params: { ...FLAGS, returnByValue: false, objectId: held.joinedId, functionDeclaration: PROGRAMS.responseObjects, arguments: [] } }), 3);
            plainObjects(await this.#send({ phase: "initial-sync-response-object-properties", ordinal: this.#ordinal, method: "Runtime.getProperties", params: properties(objects) }), 3);
            yes.parse(await this.#send({ phase: "initial-sync-history", ordinal: this.#ordinal, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: held.joinedId, functionDeclaration: PROGRAMS.history, arguments: [{ objectId: this.#capture }, { objectId: this.#full }, { value: this.#ordinal }] } }));
            this.#last = held.joinedId; const role = (["syncHistory1", "syncHistory2", "syncHistory3", "syncHistory4"] as const)[this.#ordinal - 1]; need(role !== undefined); resumeRole = role;
            this.#advanceHistory();
          } else if (this.#step === 3) {
            need(held.role === "syncMerged" && this.#last !== null); yes.parse(await this.#send({ phase: "initial-sync-merged", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: held.joinedId, functionDeclaration: PROGRAMS.merged, arguments: [{ objectId: this.#capture }, { objectId: this.#full }, { objectId: this.#last }] } })); resumeRole = "syncMerged"; this.#step = 4;
          } else if (this.#step === 4) {
            need(held.role === "syncFinalizing"); yes.parse(await this.#send({ phase: "initial-sync-finalizing", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: held.joinedId, functionDeclaration: PROGRAMS.finalizing, arguments: [{ objectId: this.#capture }, { objectId: this.#full }] } })); resumeRole = "syncFinalizing"; this.#step = 5;
          } else {
            need(this.#step === 5 && held.role === "syncReturned" && held.returnPromiseId !== null);
            yes.parse(await this.#send({ phase: "initial-sync-returned", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: held.joinedId, functionDeclaration: PROGRAMS.returned, arguments: [{ objectId: this.#capture }, { objectId: this.#full }] } }));
            const returned = z.strictObject({ result: z.unknown() }).parse(await this.#send({ phase: "initial-sync-return-promise", method: "Runtime.callFunctionOn", params: { ...FLAGS, returnByValue: false, objectId: held.returnPromiseId, functionDeclaration: CURRENT_PROJECT_SAVE_PRODUCER_CACHE_PROMISE_CAPTURE, arguments: [] } }));
            this.#outer = currentProjectSaveProducerCachePromiseHandle(returned.result); resumeRole = "syncReturned"; this.#step = 6;
          }
        }
      }
      await this.#current(); need(this.#bindings.requireHeld(packet) === held); const resume = validateCurrentGeneratedInitialSyncCommand({ phase: "initial-sync-resume", role: resumeRole, method: "Debugger.resume", params: {} });
      this.#requests += 1; need(this.#requests <= REQUESTS.cdpRequests); await this.#bindings.resume(held, resume); await this.#current();
      if (this.#step === 6) { await this.#settle(); }
    } catch (error) { this.#refuse(); throw error; } finally { this.#busy = false; }
  }
  #advanceHistory(): void { if (this.#ordinal === 4) { this.#step = 3; } else { this.#ordinal += 1; } }
  async #settle(): Promise<void> {
    need(this.#step === 6 && this.#task !== null && this.#outer !== null && this.#passes < 2); this.#passes += 1;
    let fulfilled = true; for (const [role, objectId] of [["task", this.#task], ["outer", this.#outer]] as const) {
      const state = decodeCurrentProjectSaveProducerCachePromise(await this.#send({ phase: "initial-sync-settled", role, method: "Runtime.getProperties", params: properties(objectId) })); fulfilled &&= state === "fulfilled";
    }
    if (fulfilled) { await this.#current(); await this.#bindings.complete(); await this.#current(); this.#completed = true; }
  }
  public async settle(): Promise<void> { need(!this.#busy && !this.#failed && !this.#completed); this.#busy = true; try { await this.#settle(); } catch (error) { this.#refuse(); throw error; } finally { this.#busy = false; } }
  public requireCompleted(): void { need(!this.#failed && this.#completed); }
}
