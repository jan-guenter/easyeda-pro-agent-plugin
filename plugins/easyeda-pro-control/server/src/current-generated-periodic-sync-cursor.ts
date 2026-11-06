/** Serial original periodic calls over the immutable initial head. Changed
 * branch/history replies refuse before their original property reads/merge. */
import { z } from "zod";
import { CURRENT_GENERATED_PERIODIC_SYNC_FLAGS as FLAGS, CURRENT_GENERATED_PERIODIC_SYNC_MAXIMUM as MAXIMUM, CURRENT_GENERATED_PERIODIC_SYNC_REQUESTS as REQUESTS, validateCurrentGeneratedPeriodicSyncCommand } from "./current-generated-periodic-sync-protocol.ts";
import type { CurrentGeneratedPeriodicSyncCommand } from "./current-generated-periodic-sync-protocol.ts";
import { CURRENT_GENERATED_PERIODIC_SYNC_PROGRAMS as PROGRAMS } from "./current-generated-periodic-sync-programs.ts";
import { CURRENT_GENERATED_PERIODIC_SYNC_CALLEES as CALLEES, CURRENT_GENERATED_PERIODIC_SYNC_CALLER as CALLER } from "./current-generated-periodic-sync-source.ts";
import { decodeCurrentGeneratedSyncCallee } from "./current-generated-initial-sync-replies.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_CACHE_PROMISE_CAPTURE, currentProjectSaveProducerCachePromiseHandle, decodeCurrentProjectSaveProducerCachePromise } from "./current-project-save-producer-cache-replies.ts";
import { currentFootprintCopyClockRpcV2ArrayObject, decodeCurrentFootprintCopyClockRpcV2Array, decodeCurrentFootprintCopyClockRpcV2ArrayCapture } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { CurrentGeneratedInitialBranchData } from "./current-generated-initial-branch-plan.ts";

export type CurrentGeneratedPeriodicSyncRole = "syncEntry" | "syncFull" | "syncLast" | "syncHistory" | "syncMerged" | "syncFinalizing" | "syncReturned";
export interface CurrentGeneratedPeriodicSyncHeld { readonly packet: object; readonly role: CurrentGeneratedPeriodicSyncRole; readonly joinedId: string; readonly callFrameId: string; readonly callerFrameId: string | null; readonly returnPromiseId: string | null }
export interface CurrentGeneratedPeriodicSyncBindings {
  readonly scriptId: string; readonly assertCurrent: () => Promise<void>; readonly originalCompletedCapture: () => string;
  readonly requireHeld: (packet: object) => CurrentGeneratedPeriodicSyncHeld;
  readonly request: (command: CurrentGeneratedPeriodicSyncCommand) => Promise<unknown>;
  readonly resume: (held: CurrentGeneratedPeriodicSyncHeld, command: CurrentGeneratedPeriodicSyncCommand) => Promise<void>;
  readonly complete: () => Promise<void>; readonly fail: () => void;
}
const yes = z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) });
function need(value: boolean): asserts value { if (!value) { throw new Error("GENERATED_PERIODIC_SYNC_ORIGINAL_CALL"); } }
const properties = (objectId: string): Readonly<{ objectId: string; ownProperties: true; accessorPropertiesOnly: false; generatePreview: false }> => ({ objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false });
function plainObjects(reply: unknown, count: number): void {
  const objects = decodeCurrentFootprintCopyClockRpcV2Array(reply, count);
  for (let index = 0; index < count; index += 1) { const value = objects.get(String(index)); need(value?.type === "object" && value.objectId !== undefined && value.value === undefined && (value.subtype === undefined || value.subtype === "array") && (value.className === "Object" || value.className === "Array")); }
}
export class CurrentGeneratedPeriodicSyncCursor {
  readonly #data: CurrentGeneratedInitialBranchData; readonly #bindings: CurrentGeneratedPeriodicSyncBindings; readonly #attempted = new WeakSet<object>();
  #step = 0; #calls = 0; #requests = 0; #capture: string | null = null; #full: string | null = null; #last: string | null = null; #task: string | null = null; #outer: string | null = null;
  #passes = 0; #busy = false; #failed = false;
  public constructor(data: CurrentGeneratedInitialBranchData, bindings: CurrentGeneratedPeriodicSyncBindings) { this.#data = data; this.#bindings = bindings; Object.freeze(this); }
  async #current(): Promise<void> { need(!this.#failed); this.#bindings.originalCompletedCapture(); await this.#bindings.assertCurrent(); need(!this.#failed); this.#bindings.originalCompletedCapture(); }
  async #send(input: CurrentGeneratedPeriodicSyncCommand): Promise<unknown> { const fixed = validateCurrentGeneratedPeriodicSyncCommand(input); await this.#current(); this.#requests += 1; need(this.#requests <= REQUESTS.perCall); const reply = captureCurrentPcbStringClockReply(await this.#bindings.request(fixed)).value; await this.#current(); return reply; }
  #refuse(): void { if (!this.#failed) { this.#failed = true; this.#bindings.fail(); } }
  public async continue(packet: object): Promise<void> {
    need(!this.#busy && !this.#failed && this.#calls < MAXIMUM && !this.#attempted.has(packet)); this.#attempted.add(packet); this.#busy = true;
    try {
      const held = this.#bindings.requireHeld(packet); need(held.packet === packet); await this.#current(); need(this.#bindings.requireHeld(packet) === held);
      if (this.#step === 0) {
        need(held.role === "syncEntry" && held.callerFrameId !== null); const frame = { objectGroup: FLAGS.objectGroup, silent: true, generatePreview: false, throwOnSideEffect: true, returnByValue: false, includeCommandLineAPI: false } as const;
        const caller = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await this.#send({ phase: "periodic-sync-caller", method: "Debugger.evaluateOnCallFrame", params: { ...frame, callFrameId: held.callerFrameId, expression: CALLER.expression } }), 1);
        this.#capture = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await this.#send({ phase: "periodic-sync-capture", method: "Runtime.callFunctionOn", params: { ...FLAGS, returnByValue: false, objectId: held.joinedId, functionDeclaration: PROGRAMS.capture, arguments: [{ objectId: this.#bindings.originalCompletedCapture() }, { objectId: caller }] } }), 6);
        const fields = decodeCurrentFootprintCopyClockRpcV2Array(await this.#send({ phase: "periodic-sync-capture-properties", method: "Runtime.getProperties", params: properties(this.#capture) }), 6);
        for (const slot of [0, 1] as const) { const value = fields.get(String(slot + 3)); const profile = CALLEES[slot]; need(profile !== undefined && value?.type === "function" && value.description === profile.source); const handle = currentFootprintCopyClockRpcV2ArrayObject(fields, slot + 3), reply = await this.#send({ phase: "periodic-sync-callee", slot, method: "Runtime.getProperties", params: properties(handle) }); decodeCurrentGeneratedSyncCallee(reply, profile, this.#bindings.scriptId); }
        this.#step = 1;
      } else {
        need(this.#capture !== null);
        if (this.#step === 1) {
          need(held.role === "syncFull"); this.#full = held.joinedId;
          const fields = decodeCurrentFootprintCopyClockRpcV2Array(await this.#send({ phase: "periodic-sync-full-properties", method: "Runtime.getProperties", params: properties(held.joinedId) }), 5), task = fields.get("4");
          need(task?.type === "object" && task.subtype === "promise" && task.className === "Promise" && task.description === "Promise"); this.#task = currentFootprintCopyClockRpcV2ArrayObject(fields, 4);
          yes.parse(await this.#send({ phase: "periodic-sync-full", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: held.joinedId, functionDeclaration: PROGRAMS.full, arguments: [{ objectId: this.#capture }] } })); this.#step = 2;
        } else {
          need(this.#full !== null);
          if (this.#step === 2 || this.#step === 3) {
            const branch = this.#step === 2; need(held.role === (branch ? "syncLast" : "syncHistory"));
            const objects = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await this.#send(branch ? { phase: "periodic-sync-branchObjects", method: "Runtime.callFunctionOn", params: { ...FLAGS, returnByValue: false, objectId: held.joinedId, functionDeclaration: PROGRAMS.branchObjects, arguments: [] } } : { phase: "periodic-sync-responseObjects", method: "Runtime.callFunctionOn", params: { ...FLAGS, returnByValue: false, objectId: held.joinedId, functionDeclaration: PROGRAMS.responseObjects, arguments: [] } }), branch ? 2 : 3);
            plainObjects(await this.#send({ phase: branch ? "periodic-sync-branch-properties" : "periodic-sync-response-properties", method: "Runtime.getProperties", params: properties(objects) }), branch ? 2 : 3);
            yes.parse(await this.#send(branch ? { phase: "periodic-sync-branch", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: held.joinedId, functionDeclaration: PROGRAMS.branch, arguments: [{ objectId: this.#capture }, { objectId: this.#full }, { value: this.#data.body }] } } : { phase: "periodic-sync-history", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: held.joinedId, functionDeclaration: PROGRAMS.history, arguments: [{ objectId: this.#capture }, { objectId: this.#full }] } }));
            // oxlint-disable-next-line max-depth -- The closed seven-step cursor records only its original history frame inside the shared response branch.
            if (!branch) { this.#last = held.joinedId; } this.#step += 1;
          } else if (this.#step === 4) {
            need(held.role === "syncMerged" && this.#last !== null); yes.parse(await this.#send({ phase: "periodic-sync-merged", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: held.joinedId, functionDeclaration: PROGRAMS.merged, arguments: [{ objectId: this.#capture }, { objectId: this.#full }, { objectId: this.#last }] } })); this.#step = 5;
          } else if (this.#step === 5) {
            need(held.role === "syncFinalizing"); yes.parse(await this.#send({ phase: "periodic-sync-finalizing", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: held.joinedId, functionDeclaration: PROGRAMS.finalizing, arguments: [{ objectId: this.#capture }, { objectId: this.#full }] } })); this.#step = 6;
          } else {
            need(this.#step === 6 && held.role === "syncReturned" && held.returnPromiseId !== null);
            yes.parse(await this.#send({ phase: "periodic-sync-returned", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: held.joinedId, functionDeclaration: PROGRAMS.returned, arguments: [{ objectId: this.#capture }, { objectId: this.#full }] } }));
            const returned = z.strictObject({ result: z.unknown() }).parse(await this.#send({ phase: "periodic-sync-return-promise", method: "Runtime.callFunctionOn", params: { ...FLAGS, returnByValue: false, objectId: held.returnPromiseId, functionDeclaration: CURRENT_PROJECT_SAVE_PRODUCER_CACHE_PROMISE_CAPTURE, arguments: [] } }));
            this.#outer = currentProjectSaveProducerCachePromiseHandle(returned.result); this.#step = 7;
          }
        }
      }
      await this.#current(); need(this.#bindings.requireHeld(packet) === held); this.#requests += 1; need(this.#requests <= REQUESTS.perCall);
      await this.#bindings.resume(held, validateCurrentGeneratedPeriodicSyncCommand({ phase: "periodic-sync-resume", role: held.role, method: "Debugger.resume", params: {} })); await this.#current();
      if (this.#step === 7) { await this.#settle(); }
    } catch (error) { this.#refuse(); throw error; } finally { this.#busy = false; }
  }
  async #settle(): Promise<void> {
    need(this.#step === 7 && this.#task !== null && this.#outer !== null && this.#passes < 2); this.#passes += 1;
    let fulfilled = true; for (const [role, objectId] of [["task", this.#task], ["outer", this.#outer]] as const) { const state = decodeCurrentProjectSaveProducerCachePromise(await this.#send({ phase: "periodic-sync-settled", role, method: "Runtime.getProperties", params: properties(objectId) })); fulfilled &&= state === "fulfilled"; }
    if (fulfilled) { await this.#current(); await this.#bindings.complete(); await this.#current(); this.#calls += 1; this.#step = 0; this.#requests = 0; this.#passes = 0; this.#capture = null; this.#full = null; this.#last = null; this.#task = null; this.#outer = null; }
  }
  public async settle(): Promise<void> { need(!this.#busy && !this.#failed); this.#busy = true; try { await this.#settle(); } catch (error) { this.#refuse(); throw error; } finally { this.#busy = false; } }
  public requireIdle(): void { need(!this.#failed && !this.#busy && this.#step === 0); }
}
