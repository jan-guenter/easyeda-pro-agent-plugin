/** Original same-stream callback/timer driver. Its component journal and
 * native counters stay separate from the opening's fixed37 producer steps. */
import { z } from "zod";
// oxlint-disable-next-line import/no-cycle -- Original Core registries are resolved only by later cursor construction; module evaluation dispatches nothing.
import { CurrentFootprintForwardWriterStartupCallbacks } from "./current-footprint-forward-writer-startup-callbacks.ts";
// oxlint-disable-next-line import/no-cycle -- Original Core registries are resolved only by later cursor construction; module evaluation dispatches nothing.
import { CurrentFootprintForwardWriterStartupTimer } from "./current-footprint-forward-writer-startup-timer.ts";
import { CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_CALLBACK_ROLES, validateCurrentFootprintForwardWriterFrontierCommand } from "./current-footprint-forward-writer-frontier-protocol.ts";
import type { CurrentFootprintForwardWriterFrontierCommand, CurrentFootprintForwardWriterFrontierLane } from "./current-footprint-forward-writer-frontier-protocol.ts";
// oxlint-disable-next-line import/no-cycle -- The original Core installs this registry before its constructor creates this retained driver.
import { requireOriginalCurrentFootprintForwardWriterStartupFrontierOrigin } from "./current-footprint-forward-writer-frontier-origin.ts";
import type { CurrentFootprintForwardWriterStartupFrontierBindings, CurrentFootprintForwardWriterStartupFrontierEvent, CurrentFootprintForwardWriterStartupFrontierOrigin } from "./current-footprint-forward-writer-frontier-origin.ts";
import type { CurrentProjectSyncQuiesceCommand } from "./current-project-sync-quiesce-protocol.ts";

const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const paused = z.looseObject({ reason: z.literal("other"), hitBreakpoints: z.tuple([handle]), callFrames: z.array(z.looseObject({ callFrameId: handle })).min(1).max(64) });
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`FORWARD_WRITER_STARTUP_FRONTIER_${code}`); } }
type Event = CurrentFootprintForwardWriterStartupFrontierEvent;
interface Active { readonly lane: "callback" | "timer"; readonly role: string; readonly event: Event; resumeAttempted: boolean }
export class CurrentFootprintForwardWriterStartupFrontier {
  readonly #origin: CurrentFootprintForwardWriterStartupFrontierOrigin; readonly #owner: object; readonly #operation: object;
  readonly #binding: CurrentFootprintForwardWriterStartupFrontierBindings;
  readonly #points = new Map<string, Readonly<{ lane: "callback" | "timer"; role: string }>>();
  readonly #events = new Map<CurrentFootprintForwardWriterFrontierLane, Event[]>();
  readonly #waiters = new Map<CurrentFootprintForwardWriterFrontierLane, ReturnType<typeof Promise.withResolvers<Event>>>();
  #callbacks: CurrentFootprintForwardWriterStartupCallbacks | null = null; #timer: CurrentFootprintForwardWriterStartupTimer | null = null;
  #callbackTail: Promise<void> = Promise.resolve(); #active: Active | null = null;
  #arming = false; #armed = false; #failed = false; #closed = false; #complete = false; #completionAttempted = false;
  public constructor(origin: CurrentFootprintForwardWriterStartupFrontierOrigin, owner: object, operation: object) {
    this.#origin = origin; this.#owner = owner; this.#operation = operation;
    this.#binding = requireOriginalCurrentFootprintForwardWriterStartupFrontierOrigin(origin, owner, operation); Object.freeze(this);
  }
  #current(): void {
    need(!this.#failed && !this.#closed && requireOriginalCurrentFootprintForwardWriterStartupFrontierOrigin(this.#origin, this.#owner, this.#operation) === this.#binding, "ORIGINAL");
    this.#binding.assertCurrent();
  }
  #fail(cause: unknown): void { if (!this.#failed) { this.#failed = true; this.#binding.fail(cause); } }
  public point(lane: "callback" | "timer", role: string, id: string): void {
    this.#current(); need(this.#arming && !this.#points.has(id) && (lane === "timer" ? role === "entry" || role === "returned" : CURRENT_FOOTPRINT_FORWARD_WRITER_STARTUP_CALLBACK_ROLES.some(value => value === role)), "POINT_ONCE");
    this.#points.set(id, Object.freeze({ lane, role }));
  }
  public async arm(): Promise<void> {
    this.#current(); need(!this.#arming && !this.#armed, "ARM_ONCE"); this.#arming = true;
    try {
      const callbacks = new CurrentFootprintForwardWriterStartupCallbacks(this.#origin, this.#owner, this.#operation), timer = new CurrentFootprintForwardWriterStartupTimer(this.#origin, this.#owner, this.#operation);
      this.#callbacks = callbacks; this.#timer = timer; await callbacks.arm(); this.#current(); await timer.arm(); this.#current();
      need(this.#points.size === 6, "POINT_ROSTER"); this.#armed = true;
      await this.#binding.journal("setup-result", { callbackPoints: 4, timerPoints: 2, timerSetupRequests: 17 }); this.#current();
    } catch (error) { this.#fail(error); throw error; } finally { this.#arming = false; }
  }
  /** This predicate is used only by the original constructor subscriber. */
  public acceptsPause(input: unknown): boolean {
    try { const value = paused.parse(input); return this.#points.has(value.hitBreakpoints[0]); } catch { return false; }
  }
  #enqueue(lane: CurrentFootprintForwardWriterFrontierLane, event: Event): void {
    const waiter = this.#waiters.get(lane);
    if (waiter !== undefined) { this.#waiters.delete(lane); waiter.resolve(event); return; }
    const events = this.#events.get(lane) ?? []; need(events.length < 2, "EVENT_QUEUE"); events.push(event); this.#events.set(lane, events);
  }
  /** Retain the actual source pause synchronously before scheduling its own
   * callback work. Later pauses wait behind the previous receipt publication. */
  public paused(input: unknown): void {
    try {
      this.#current(); need(this.#armed && this.#active === null && !this.#complete, "PAUSE_ONCE");
      const value = paused.parse(input); const point = this.#points.get(value.hitBreakpoints[0]); need(point !== undefined, "OWNED_POINT");
      const event: Event = Object.freeze({ method: "Debugger.paused", sessionId: this.#binding.actual.sessionId, params: input });
      this.#active = { ...point, event, resumeAttempted: false }; this.#enqueue(point.lane, event);
      if (point.lane === "callback") {
        const callbacks = this.#callbacks; need(callbacks !== null, "CALLBACKS_REQUIRED");
        const prior = this.#callbackTail; const work = (async (): Promise<void> => { await prior; this.#current(); await callbacks.serviceOriginalHeld(); this.#current(); })(); this.#callbackTail = work;
        void (async (): Promise<void> => { try { await work; } catch (error) { this.#fail(error); } })();
      }
    } catch (error) { this.#fail(error); }
  }
  /** Exact retained callback event only; this getter creates no pause or
   * continuation and never consumes the ordinary eight-command receipt. */
  public originalCallbackEvent(role:string):Event{
    this.#current();const active=this.#active;need(active!==null&&active.lane==="callback"&&active.role===role&&!active.resumeAttempted,"ORIGINAL_CALLBACK_EVENT");return active.event;
  }
  public hasActivePause(): boolean { return this.#active !== null; }
  public resumed(): void {
    try {
      this.#current(); const active = this.#active; need(active !== null && active.resumeAttempted, "ORIGINAL_RESUMED"); this.#active = null;
      this.#enqueue(active.lane, Object.freeze({ method: "Debugger.resumed", sessionId: this.#binding.actual.sessionId, params: Object.freeze({}) }));
    } catch (error) { this.#fail(error); }
  }
  public nextEvent(lane: CurrentFootprintForwardWriterFrontierLane): Promise<Event> {
    this.#current(); need(lane !== "queue" && !this.#waiters.has(lane), "EVENT_ONCE"); const event = this.#events.get(lane)?.shift(); if (event !== undefined) { return Promise.resolve(event); }
    const waiter = Promise.withResolvers<Event>(); this.#waiters.set(lane, waiter); void (async (): Promise<void> => { try { await waiter.promise; } catch {
      // Original observer and exit cleanup retain this same rejection.
    } })(); return waiter.promise;
  }
  /** Burn the same original pause before its one normal native resume. */
  public requireRequest(input: CurrentFootprintForwardWriterFrontierCommand): void {
    this.#current(); const value = validateCurrentFootprintForwardWriterFrontierCommand(input); const command = value.command;
    if (this.#arming) { need(command.method === "Debugger.setBreakpoint" || value.lane === "timer", "SETUP_ONLY"); return; }
    need(this.#armed && !this.#complete, "ARMED_REQUIRED");
    if (value.lane === "queue") { need(this.#completionAttempted && this.#active === null, "ORIGINAL_QUEUE_BOUNDARY"); return; }
    const active = this.#active; need(active !== null && active.lane === value.lane && !active.resumeAttempted, "ORIGINAL_HELD_REQUEST");
    if (command.method === "Debugger.resume") { need("role" in command && command.role === active.role, "ORIGINAL_RESUME_ROLE"); active.resumeAttempted = true; }
  }
  public requestTimer(command: CurrentProjectSyncQuiesceCommand): Promise<unknown> { this.#current(); need(this.#timer !== null, "TIMER_REQUIRED"); return this.#timer.requestOriginal(command); }
  public nextTimerEvent(): Promise<Event> { this.#current(); need(this.#timer !== null, "TIMER_REQUIRED"); return this.#timer.nextOriginalEvent(); }
  public completeTimer(): Promise<void> { this.#current(); need(this.#timer !== null, "TIMER_REQUIRED"); return this.#timer.completeOriginal(); }
  /** Core first proves the original completed opening and cache/sync cursors.
   * Only then may this historical queue/timer receipt be completed. */
  public async finish(): Promise<Readonly<{ startupComplete: true; executionAuthorized: false; completeProducerFrontierVerified: false }>> {
    this.#current(); need(!this.#completionAttempted && this.#callbacks !== null && this.#timer !== null, "FINISH_ONCE"); this.#completionAttempted = true;
    try {
      await this.#timer.pending(); this.#current(); await this.#callbackTail; this.#current(); need(this.#active === null, "NO_HELD_CALLBACK");
      await this.#timer.requireCompleted(); this.#current(); await this.#callbacks.verifyOriginalQueue(); this.#current();
      await this.#binding.control("complete"); this.#current();
      const result = Object.freeze({ startupComplete: true as const, executionAuthorized: false as const, completeProducerFrontierVerified: false as const });
      await this.#binding.journal("frontier-result", result); this.#current(); this.#complete = true; return result;
    } catch (error) { this.#fail(error); throw error; }
  }
  /** Local waits end only after the original root and whole Job exit proof.
   * Joining these same Promises issues no inspector command or retry. */
  public async endAfterOriginalExit(): Promise<void> {
    need(!this.#closed, "EXIT_ONCE"); await this.#binding.assertOriginalGenerationExited(); this.#closed = true;
    for (const waiter of this.#waiters.values()) { waiter.reject(new Error("FORWARD_WRITER_STARTUP_FRONTIER_ORIGINAL_EXIT")); } this.#waiters.clear();
    const timerPending = this.#timer?.retainedPending() ?? null;
    await Promise.allSettled([this.#callbackTail, ...(timerPending === null ? [] : [timerPending])]);
    this.#events.clear(); this.#active = null;
  }
  public status(): Readonly<Record<string, unknown>> {
    return Object.freeze({ armed: this.#armed, failed: this.#failed, closed: this.#closed, completed: this.#complete,
      heldLane: this.#active?.lane ?? null, callbacks: this.#callbacks?.status() ?? null, timer: this.#timer?.status() ?? null,
      completeProducerFrontierVerified: false, executionAuthorized: false });
  }
}
