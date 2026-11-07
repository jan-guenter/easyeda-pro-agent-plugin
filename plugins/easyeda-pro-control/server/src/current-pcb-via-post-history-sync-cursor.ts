/* oxlint-disable import/max-dependencies -- This closed cursor composes fixed codecs, source pins and data-only types, with no runtime owner import. */
/** One original upload-finally sync. Prospective branch comparison precedes
 * its GET; original SQLite-backed rows late-bind before merge/model replay. */
import { z } from "zod";
import { CURRENT_PCB_VIA_POST_HISTORY_SYNC_FLAGS as FLAGS, CURRENT_PCB_VIA_POST_HISTORY_SYNC_REQUESTS as REQUESTS, validateCurrentPcbViaPostHistorySyncCommand } from "./current-pcb-via-post-history-sync-protocol.ts";
import type { CurrentPcbViaPostHistorySyncCommand } from "./current-pcb-via-post-history-sync-protocol.ts";
import { CURRENT_PCB_VIA_POST_HISTORY_SYNC_PROGRAMS as PROGRAMS } from "./current-pcb-via-post-history-sync-programs.ts";
import { CURRENT_PCB_VIA_POST_HISTORY_SYNC_CALLEES as CALLEES, CURRENT_PCB_VIA_POST_HISTORY_SYNC_CALLER as CALLER, CURRENT_PCB_VIA_POST_HISTORY_SYNC_MODULE as MODULE } from "./current-pcb-via-post-history-sync-source.ts";
import { currentPcbViaPostSyncOwnProperties, currentPcbViaPostSyncPlainHandle, readCurrentPcbViaPostSyncGraph } from "./current-pcb-via-post-history-sync-graph.ts";
import { decodeCurrentGeneratedSyncCallee } from "./current-generated-initial-sync-replies.ts";
import { CURRENT_PROJECT_SAVE_PRODUCER_CACHE_PROMISE_CAPTURE as RETAIN, currentProjectSaveProducerCachePromiseHandle, decodeCurrentProjectSaveProducerCachePromise } from "./current-project-save-producer-cache-replies.ts";
import { currentFootprintCopyClockRpcV2ArrayObject, decodeCurrentFootprintCopyClockRpcV2Array, decodeCurrentFootprintCopyClockRpcV2ArrayCapture } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { CurrentPcbViaProspectiveSyncData } from "./current-pcb-via-prospective-sync-data.ts";
import type { CurrentPcbViaLiveHistoryCacheData } from "./current-pcb-via-live-history-cache-data.ts";

export type CurrentPcbViaPostHistorySyncRole = "syncEntry" | "syncFull" | "syncLast" | "syncHistory" | "syncMerged" | "syncFinalizing" | "syncReturned";
export interface CurrentPcbViaPostHistorySyncHeld { readonly packet: object; readonly role: CurrentPcbViaPostHistorySyncRole; readonly joinedId: string; readonly callFrameId: string; readonly callerFrameId: string | null; readonly returnPromiseId: string | null }
/** Only the original Core registry may supply these closures. A cursor/data
 * object alone is inert and cannot issue a native command or continuation. */
export interface CurrentPcbViaPostHistorySyncBindings {
  readonly scriptId: string; readonly originalInitialCapture: () => string; readonly assertCurrent: () => Promise<void>;
  readonly requireHeld: (packet: object) => CurrentPcbViaPostHistorySyncHeld;
  readonly liveData: () => Promise<CurrentPcbViaLiveHistoryCacheData>;
  readonly request: (command: CurrentPcbViaPostHistorySyncCommand) => Promise<unknown>;
  readonly resume: (held: CurrentPcbViaPostHistorySyncHeld, command: CurrentPcbViaPostHistorySyncCommand) => Promise<void>;
  readonly complete: () => Promise<void>; readonly fail: () => void;
}
const yes = z.strictObject({ result: z.strictObject({ type: z.literal("boolean"), value: z.literal(true) }) });
function need(value: boolean): asserts value { if (!value) { throw new Error("PCB_VIA_POST_SYNC_ORIGINAL_CALL"); } }
const properties = (objectId: string): Readonly<{ objectId: string; ownProperties: true; accessorPropertiesOnly: false; generatePreview: false }> => ({ objectId, ownProperties: true as const, accessorPropertiesOnly: false as const, generatePreview: false as const });
type CallRole = Extract<CurrentPcbViaPostHistorySyncCommand, { phase: "via-post-sync-call" }>["role"];
type PropertyRole = Extract<CurrentPcbViaPostHistorySyncCommand, { phase: "via-post-sync-properties" }>["role"];
type Argument = Readonly<{ objectId: string }> | Readonly<{ value: string }>;
export class CurrentPcbViaPostHistorySyncCursor {
  readonly #data: CurrentPcbViaProspectiveSyncData; readonly #bindings: CurrentPcbViaPostHistorySyncBindings; readonly #initial: string; readonly #attempted = new WeakSet<object>();
  #capture: string | null = null; #full: string | null = null; #last: string | null = null; #index: string | null = null; #task: string | null = null; #outer: string | null = null; #live: CurrentPcbViaLiveHistoryCacheData | null = null;
  #step = 0; #requests = 0; #resumes = 0; #passes = 0; #busy = false; #failed = false; #completed = false;
  public constructor(data: CurrentPcbViaProspectiveSyncData, bindings: CurrentPcbViaPostHistorySyncBindings) { this.#data = data; this.#bindings = bindings; this.#initial = bindings.originalInitialCapture(); Object.freeze(this); }
  async #current(): Promise<void> { need(!this.#failed && this.#bindings.originalInitialCapture() === this.#initial); await this.#bindings.assertCurrent(); need(!this.#failed && this.#bindings.originalInitialCapture() === this.#initial); }
  #refuse(): void { if (!this.#failed) { this.#failed = true; this.#bindings.fail(); } }
  async #send(input: CurrentPcbViaPostHistorySyncCommand): Promise<unknown> { const command = validateCurrentPcbViaPostHistorySyncCommand(input); await this.#current(); this.#requests += 1; need(this.#requests <= REQUESTS.total); const reply = captureCurrentPcbStringClockReply(await this.#bindings.request(command)).value; await this.#current(); return reply; }
  #properties(role: PropertyRole, objectId: string, slot = 0): Promise<unknown> { return this.#send({ phase: "via-post-sync-properties", role, slot, method: "Runtime.getProperties", params: properties(objectId) }); }
  #call(role: CallRole, objectId: string, args: readonly Argument[]): Promise<unknown> { return this.#send({ phase: "via-post-sync-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId, returnByValue: !["capture", "index", "retain"].includes(role), functionDeclaration: role === "retain" ? RETAIN : PROGRAMS[role], arguments: [...args] } }); }
  async #entry(held: CurrentPcbViaPostHistorySyncHeld): Promise<void> {
    need(held.role === "syncEntry" && held.callerFrameId !== null);
    const frameFlags = { objectGroup: FLAGS.objectGroup, silent: true as const, generatePreview: false as const, throwOnSideEffect: true as const, includeCommandLineAPI: false as const, returnByValue: false as const };
    const module = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await this.#send({ phase: "via-post-sync-frame", role: "module", method: "Debugger.evaluateOnCallFrame", params: { ...frameFlags, callFrameId: held.callFrameId, expression: MODULE } }), 10);
    const moduleFields = decodeCurrentFootprintCopyClockRpcV2Array(await this.#properties("module", module), 10); const group = currentPcbViaPostSyncPlainHandle(moduleFields.get("9"), true);
    const caller = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await this.#send({ phase: "via-post-sync-frame", role: "caller", method: "Debugger.evaluateOnCallFrame", params: { ...frameFlags, callFrameId: held.callerFrameId, expression: CALLER.expression } }), 1);
    this.#capture = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(await this.#call("capture", held.joinedId, [{ objectId: this.#initial }, { objectId: module }, { objectId: caller }, { objectId: group }, { value: this.#data.historyUuid }, { value: this.#data.initialHeadIndexBody }]), 18);
    const fields = decodeCurrentFootprintCopyClockRpcV2Array(await this.#properties("capture", this.#capture), 18);
    for (let slot = 0; slot < CALLEES.length; slot += 1) { const profile = CALLEES[slot], value = fields.get(String(slot + 6)); need(profile !== undefined && value?.type === "function" && value.description === profile.source); decodeCurrentGeneratedSyncCallee(await this.#properties("callee", currentFootprintCopyClockRpcV2ArrayObject(fields, slot + 6), slot), profile, this.#bindings.scriptId); }
  }
  async #branch(held: CurrentPcbViaPostHistorySyncHeld, capture: string, full: string): Promise<void> {
    const frame = decodeCurrentFootprintCopyClockRpcV2Array(await this.#properties("frame", held.joinedId), 6), reply = currentPcbViaPostSyncPlainHandle(frame.get("5"), false);
    const fields = currentPcbViaPostSyncOwnProperties(await this.#properties("reply", reply), false), row = currentPcbViaPostSyncPlainHandle(fields.get("result"), false);
    yes.parse(await this.#call("branch", held.joinedId, [{ objectId: capture }, { objectId: full }, { objectId: reply }, { objectId: row }, { value: this.#data.branchBody }]));
  }
  async #history(held: CurrentPcbViaPostHistorySyncHeld, capture: string, full: string): Promise<void> {
    const live = await this.#bindings.liveData(); await this.#current();
    need(live.projectUuid === this.#data.projectUuid && live.branchUuid === this.#data.branchUuid && live.documentUuid === this.#data.documentUuid && live.historyUuid === this.#data.historyUuid && live.mode === this.#data.mode && live.historyNum === this.#data.historyNum && live.branch.body === this.#data.branchBody && live.historyBodySha256 === this.#data.historyBodySha256); this.#live = live;
    const frame = decodeCurrentFootprintCopyClockRpcV2Array(await this.#properties("frame", held.joinedId), 9), reply = currentPcbViaPostSyncPlainHandle(frame.get("7"), false);
    const fields = currentPcbViaPostSyncOwnProperties(await this.#properties("reply", reply), false), result = currentPcbViaPostSyncPlainHandle(fields.get("result"), true);
    const rows = decodeCurrentFootprintCopyClockRpcV2Array(await this.#properties("result", result), live.historyApiRows.length); const row0 = currentPcbViaPostSyncPlainHandle(rows.get("0"), false); const row1 = live.mode === "mutable" ? row0 : currentPcbViaPostSyncPlainHandle(rows.get("1"), false);
    yes.parse(await this.#call("history", held.joinedId, [{ objectId: capture }, { objectId: full }, { objectId: reply }, { objectId: result }, { objectId: row0 }, { objectId: row1 }, { value: JSON.stringify(live.historyApiRows) }])); this.#last = held.joinedId;
  }
  public async continue(packet: object): Promise<void> {
    need(!this.#busy && !this.#failed && !this.#completed && !this.#attempted.has(packet)); this.#attempted.add(packet); this.#busy = true;
    try {
      const held = this.#bindings.requireHeld(packet); need(held.packet === packet); await this.#current(); need(this.#bindings.requireHeld(packet) === held);
      const roles = ["syncEntry", "syncFull", "syncLast", "syncHistory", "syncMerged", "syncFinalizing", "syncReturned"] as const; need(held.role === roles[this.#step]);
      if (this.#step === 0) { await this.#entry(held); }
      else { const capture = this.#capture; need(capture !== null);
        if (this.#step === 1) { this.#full = held.joinedId; const fields = decodeCurrentFootprintCopyClockRpcV2Array(await this.#properties("full", held.joinedId), 5), task = fields.get("4"); need(task?.type === "object" && task.subtype === "promise" && task.className === "Promise" && task.description === "Promise"); this.#task = currentFootprintCopyClockRpcV2ArrayObject(fields, 4); yes.parse(await this.#call("full", held.joinedId, [{ objectId: capture }])); }
        else { const full = this.#full; need(full !== null);
          if (this.#step === 2) { await this.#branch(held, capture, full); }
          else if (this.#step === 3) { await this.#history(held, capture, full); }
          else if (this.#step === 4) { need(this.#last !== null && this.#live !== null); yes.parse(await this.#call("merged", held.joinedId, [{ objectId: capture }, { objectId: full }, { objectId: this.#last }])); yes.parse(await this.#send({ phase: "via-post-sync-replay" })); }
          else if (this.#step === 5) { need(this.#live !== null); const reply = z.strictObject({ result: z.unknown() }).parse(await this.#call("index", held.joinedId, [{ objectId: capture }, { objectId: full }])); this.#index = currentPcbViaPostSyncPlainHandle(reply.result, true);
            const text = await readCurrentPcbViaPostSyncGraph(reply.result, (objectId, ordinal) => this.#properties("graph", objectId, ordinal)); need(text === this.#live.headIndex.body); yes.parse(await this.#call("finalizing", held.joinedId, [{ objectId: capture }, { objectId: full }, { objectId: this.#index }]));
          } else { need(this.#step === 6 && this.#index !== null && held.returnPromiseId !== null); yes.parse(await this.#call("returned", held.joinedId, [{ objectId: capture }, { objectId: full }, { objectId: this.#index }])); const returned = z.strictObject({ result: z.unknown() }).parse(await this.#call("retain", held.returnPromiseId, [])); this.#outer = currentProjectSaveProducerCachePromiseHandle(returned.result); }
        }
      }
      await this.#current(); need(this.#bindings.requireHeld(packet) === held); this.#requests += 1; need(this.#requests <= REQUESTS.total); this.#step += 1;
      await this.#bindings.resume(held, validateCurrentPcbViaPostHistorySyncCommand({ phase: "via-post-sync-resume", role: held.role, method: "Debugger.resume", params: {} })); this.#resumes += 1; await this.#current(); if (this.#step === 7) { await this.#settle(); }
    } catch (error) { this.#refuse(); throw error; } finally { this.#busy = false; }
  }
  async #settle(): Promise<void> { need(this.#step === 7 && this.#task !== null && this.#outer !== null && this.#passes < 2); this.#passes += 1; let fulfilled = true;
    for (const [role, objectId] of [["task", this.#task], ["outer", this.#outer]] as const) { const state = decodeCurrentProjectSaveProducerCachePromise(await this.#properties(role, objectId)); fulfilled &&= state === "fulfilled"; }
    if (fulfilled) { await this.#bindings.complete(); await this.#current(); this.#completed = true; }
  }
  public async settle(): Promise<void> { need(!this.#busy && !this.#failed && !this.#completed); this.#busy = true; try { await this.#settle(); } catch (error) { this.#refuse(); throw error; } finally { this.#busy = false; } }
  public progress(): Readonly<{ acknowledgedResumes: number; canSettle: boolean; completed: boolean; failed: boolean; completeUploadFrontierVerified: false }> { return Object.freeze({ acknowledgedResumes: this.#resumes, canSettle: !this.#busy && !this.#failed && !this.#completed && this.#step === 7 && this.#passes < 2, completed: this.#completed, failed: this.#failed, completeUploadFrontierVerified: false }); }
  public requireCompleted(): void { need(this.#completed && !this.#failed); }
}
