/** Original full-worker timer custody. The generic observer retains native
 * metadata and source proofs; this separate owner retains its fixed sequence,
 * original references, journal intent, pending work and actual resumed events. */
import { z } from "zod";
// oxlint-disable-next-line import/no-cycle -- Original Core registries are resolved only by later cursor construction; module evaluation dispatches nothing.
import { CurrentProjectSyncQuiesceObserver } from "./current-project-sync-quiesce-observer.ts";
import type { CurrentProjectSyncQuiesceCompletion } from "./current-project-sync-quiesce-observer.ts";
import { CURRENT_PROJECT_SYNC_QUIESCE_CAPTURE_LENGTH as LENGTH, currentProjectSyncQuiesceNativeCases, validateCurrentProjectSyncQuiesceCommand } from "./current-project-sync-quiesce-protocol.ts";
import type { CurrentProjectSyncQuiesceCommand } from "./current-project-sync-quiesce-protocol.ts";
import { currentFootprintCopyClockRpcV2ArrayObject, decodeCurrentFootprintCopyClockRpcV2ArrayCapture } from "./current-footprint-copy-clock-rpc-v2-protocol.ts";
import { decodeCurrentProjectSyncQuiesceArray } from "./current-project-sync-quiesce-replies.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
// oxlint-disable-next-line import/no-cycle -- The actual Core installs this registry before constructing its original timer cursor.
import { requireOriginalCurrentFootprintForwardWriterStartupFrontierOrigin } from "./current-footprint-forward-writer-frontier-origin.ts";
import type { CurrentFootprintForwardWriterStartupFrontierBindings, CurrentFootprintForwardWriterStartupFrontierEvent, CurrentFootprintForwardWriterStartupFrontierOrigin } from "./current-footprint-forward-writer-frontier-origin.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const paused = z.looseObject({ hitBreakpoints: z.tuple([handle]), callFrames: z.array(z.looseObject({ callFrameId: handle })).min(1).max(64) });
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`FORWARD_WRITER_STARTUP_TIMER_${code}`); } }
export class CurrentFootprintForwardWriterStartupTimer {
  readonly #origin: CurrentFootprintForwardWriterStartupFrontierOrigin; readonly #owner: object; readonly #operation: object;
  readonly #bindings: CurrentFootprintForwardWriterStartupFrontierBindings;
  readonly #cases = currentProjectSyncQuiesceNativeCases();
  readonly #frames = new Map<string, string>(); readonly #natives = new Map<number, string>(); readonly #points = new Map<"entry" | "returned", string>();
  #observer: CurrentProjectSyncQuiesceObserver | null = null; #pending: Promise<void> | null = null; #completion: CurrentProjectSyncQuiesceCompletion | null = null;
  #step = 0; #capture: string | null = null; #entry: string | null = null; #returned: string | null = null; #method: string | null = null;
  #held: "entry" | "returned" | null = null; #heldFrame: string | null = null; #heldBefore = 0; #resumes = 0;
  #cancelAttempted = false; #completed = false; #failed = false;
  public constructor(origin: CurrentFootprintForwardWriterStartupFrontierOrigin, owner: object, operation: object) {
    this.#origin = origin; this.#owner = owner; this.#operation = operation;
    this.#bindings = requireOriginalCurrentFootprintForwardWriterStartupFrontierOrigin(origin, owner, operation); Object.freeze(this);
  }
  #current(): void {
    need(!this.#failed && requireOriginalCurrentFootprintForwardWriterStartupFrontierOrigin(this.#origin, this.#owner, this.#operation) === this.#bindings, "ORIGINAL");
    this.#bindings.assertCurrent();
  }
  /** Consume the setup once before the original constructor can resume. */
  public async arm(): Promise<void> {
    this.#current(); need(this.#observer === null && this.#pending === null, "ARM_ONCE");
    const observer = new CurrentProjectSyncQuiesceObserver(this.#bindings.timerOrigin, this.#owner, this.#operation); this.#observer = observer;
    try {
      await observer.arm(); this.#current(); need(this.#step === 17 && this.#points.size === 2, "SETUP_COUNTS");
      const pending = (async (): Promise<void> => { this.#completion = await observer.observeFirstTimer(); this.#current(); need(this.#completed && this.#resumes === 2, "COMPLETION"); })();
      this.#pending = pending; void (async (): Promise<void> => { try { await pending; } catch (error) { this.#failed = true; this.#bindings.fail(error); } })();
    } catch (error) { this.#failed = true; this.#bindings.fail(error); throw error; }
  }
  /** Only the generic original observer's fixed next command may reach the
   * native full channel. References are retained before the next await. */
  public async requestOriginal(input: CurrentProjectSyncQuiesceCommand): Promise<unknown> {
    this.#current(); const actual = this.#bindings.actual, command = validateCurrentProjectSyncQuiesceCommand(input), expected = this.#cases[this.#step];
    need(expected !== undefined && command.phase === expected.phase && ("role" in command ? command.role : null) === ("role" in expected ? expected.role : null) &&
      ("index" in command ? command.index : null) === ("index" in expected ? expected.index : null), "SEQUENCE");
    if (command.phase === "sync-quiesce-capture") { need(command.params.uniqueContextId === actual.uniqueContextId, "ORIGINAL_CONTEXT"); }
    else if (command.phase === "sync-quiesce-arm") { need(command.params.location.scriptId === actual.scriptId, "ORIGINAL_SCRIPT"); }
    else if (command.phase === "sync-quiesce-properties") { need(command.params.objectId === { capture: this.#capture, entry: this.#entry, returned: this.#returned }[command.role], "ORIGINAL_PROPERTIES"); }
    else if (command.phase === "sync-quiesce-native") { need(command.params.objectId === this.#natives.get(command.index), "ORIGINAL_NATIVE"); }
    else if (command.phase === "sync-quiesce-callee") { need(command.params.objectId === this.#method, "ORIGINAL_CALLEE"); }
    else if (command.phase === "sync-quiesce-frame") { need(this.#held === command.role && command.params.callFrameId === this.#heldFrame, "ORIGINAL_FRAME"); }
    else if (command.phase === "sync-quiesce-entry") { need(command.params.objectId === this.#frames.get("entry") && command.params.arguments[0].objectId === actual.project && command.params.arguments[1].objectId === this.#capture, "ORIGINAL_ENTRY"); }
    else if (command.phase === "sync-quiesce-returned") { need(command.params.objectId === this.#frames.get("returned") && command.params.arguments[0].objectId === this.#entry, "ORIGINAL_RETURNED"); }
    else if (command.phase === "sync-quiesce-cancel") { need(!this.#cancelAttempted && this.#held === "returned" && command.params.objectId === this.#returned, "ORIGINAL_CANCEL_ONCE"); this.#cancelAttempted = true; }
    else if (command.phase === "sync-quiesce-remove-returned") { need(command.params.breakpointId === this.#points.get("returned"), "ORIGINAL_REMOVE"); }
    else { need(command.phase === "sync-quiesce-resume" && this.#held === command.role, "ORIGINAL_RESUME"); }
    this.#step += 1;
    const raw = captureCurrentPcbStringClockReply(await this.#bindings.request({ phase: "forward-startup-frontier", lane: "timer", command })).value; this.#current();
    if (command.phase === "sync-quiesce-capture") { this.#capture = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(raw, LENGTH); }
    else if (command.phase === "sync-quiesce-frame") { this.#frames.set(command.role, decodeCurrentFootprintCopyClockRpcV2ArrayCapture(raw, 1)); }
    else if (command.phase === "sync-quiesce-entry") { this.#entry = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(raw, 5); }
    else if (command.phase === "sync-quiesce-returned") { this.#returned = decodeCurrentFootprintCopyClockRpcV2ArrayCapture(raw, 3); }
    else if (command.phase === "sync-quiesce-properties") {
      const fields = decodeCurrentProjectSyncQuiesceArray(raw, { capture: LENGTH, entry: 5, returned: 3 }[command.role]);
      if (command.role === "capture") { for (let index = 1; index <= 13; index += 1) { this.#natives.set(index, currentFootprintCopyClockRpcV2ArrayObject(fields, index)); } }
      else if (command.role === "entry") { this.#method = currentFootprintCopyClockRpcV2ArrayObject(fields, 1); }
    } else if (command.phase === "sync-quiesce-arm") {
      const reply = z.strictObject({ breakpointId: handle, actualLocation: location }).parse(raw); this.#points.set(command.role, reply.breakpointId); this.#bindings.point("timer", command.role, reply.breakpointId);
    }
    return raw;
  }
  /** The original stream supplies one pause/resumed pair at a time. No caller
   * event or elapsed timer can establish that the cancellation completed. */
  public async nextOriginalEvent(): Promise<CurrentFootprintForwardWriterStartupFrontierEvent> {
    this.#current(); const event = await this.#bindings.event("timer"); this.#current();
    if (event.method === "Debugger.paused") {
      need(this.#held === null && this.#resumes < 2, "HELD_ONCE"); const role = this.#resumes === 0 ? "entry" : "returned", value = paused.parse(event.params);
      need(value.hitBreakpoints[0] === this.#points.get(role) && value.callFrames[0] !== undefined, "ORIGINAL_HELD_POINT");
      this.#held = role; this.#heldFrame = value.callFrames[0].callFrameId; this.#heldBefore = this.#step;
      await this.#bindings.journal("timer-intent", { ordinal: this.#resumes + 1, role }); this.#current(); await this.#bindings.control("timer-held", role);
    } else {
      const role = this.#held; need(role !== null, "ORIGINAL_RESUMED"); this.#resumes += 1;
      const commands = this.#step - this.#heldBefore; need(commands === (role === "entry" ? 5 : 6), "HELD_COMMANDS");
      this.#held = null; this.#heldFrame = null;
      await this.#bindings.journal("timer-result", { ordinal: this.#resumes, role, originalResumed: true, commands, cancelled: role === "returned" });
    }
    this.#current(); return event;
  }
  public async completeOriginal(): Promise<void> {
    this.#current(); need(this.#step === 28 && this.#resumes === 2 && this.#held === null && this.#cancelAttempted && !this.#completed, "COMPLETE_ONCE");
    await this.#bindings.control("timer-complete"); this.#current(); this.#completed = true;
  }
  public retainedPending(): Promise<void> | null { return this.#pending; }
  public pending(): Promise<void> { need(this.#pending !== null, "ARM_REQUIRED"); return this.#pending; }
  public async requireCompleted(): Promise<void> {
    this.#current(); const completion = this.#completion, observer = this.#observer;
    need(observer !== null && completion !== null && this.#completed && this.#resumes === 2, "COMPLETE_REQUIRED"); await observer.requireOriginal(completion); this.#current();
  }
  public status(): Readonly<{ setup: boolean; completed: boolean; cancelled: boolean; failed: boolean; step: number }> {
    return Object.freeze({ setup: this.#step >= 17, completed: this.#completed, cancelled: this.#cancelAttempted, failed: this.#failed, step: this.#step });
  }
}
