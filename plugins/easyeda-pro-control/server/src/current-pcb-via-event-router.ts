/** One retained event reader for the original Via sessions. Actual installed
 * breakpoint identities select collectors; this router never resumes a realm
 * and issues no native/process/SQL authority. */
import { types } from "node:util";
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import type { CurrentPcbViaSaveWorkerEvent } from "./current-pcb-via-save-origin.ts";

export type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
export type CurrentPcbViaRoutedEvent = CurrentPcbViaSaveWorkerEvent;
export type CurrentPcbViaEventLane = "save" | "clock" | "structure" | "structureTransport" | "producer";
export interface CurrentPcbViaEventPoint { readonly sessionId: string; readonly scriptId: string; readonly breakpointId: string;
  readonly lineNumber: number; readonly columnNumber: number; readonly role: string }
export interface CurrentPcbViaEventRouterBindings {
  readonly workerSessionId: string; readonly uiSessionId: string; readonly nextEvent: (allowNativePoll: boolean) => Promise<DiagnosticEvent | null>;
  readonly assertCurrent: () => Promise<void>; readonly fail: () => void;
}
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const pointSchema = location.extend({ sessionId: handle, breakpointId: handle, role: z.string().min(1).max(128) });
const paused = z.looseObject({ hitBreakpoints: z.tuple([handle]), callFrames: z.array(z.looseObject({ location })).min(1).max(64) });
const resolved = z.strictObject({ breakpointId: handle, location });
const empty = z.strictObject({});
const eventSchema = z.strictObject({ method: z.enum(["Debugger.paused", "Debugger.resumed", "Debugger.breakpointResolved"]), sessionId: handle, params: z.record(z.string(), z.unknown()) });
function need(value: boolean): asserts value { if (!value) { throw new Error("PCB_VIA_EVENT_ROUTE"); } }
interface OriginalPausedDelivery { readonly lane: CurrentPcbViaEventLane; readonly point: CurrentPcbViaEventPoint; delivered: boolean; resumeAttempted: boolean }
export class CurrentPcbViaEventRouter {
  readonly #bindings: CurrentPcbViaEventRouterBindings;
  readonly #points = new Map<string, Readonly<{ lane: CurrentPcbViaEventLane; point: CurrentPcbViaEventPoint }>>();
  readonly #paused = new Map<string, OriginalPausedDelivery>();
  readonly #pauseEvents = new WeakMap<CurrentPcbViaSaveWorkerEvent, OriginalPausedDelivery>();
  readonly #queues: Record<CurrentPcbViaEventLane, CurrentPcbViaSaveWorkerEvent[]> = { save: [], clock: [], structure: [], structureTransport: [], producer: [] };
  readonly #reading = { save: false, clock: false, structure: false, structureTransport: false, producer: false };
  readonly #resumeRoles = new WeakMap<CurrentPcbViaSaveWorkerEvent, Readonly<{ lane: CurrentPcbViaEventLane; role: string }>>();
  readonly #completedClock = new Set<string>();
  #poll: Promise<boolean> | null = null; #failed = false; #clockUiPending = false; #changed = Promise.withResolvers<true>();
  public constructor(bindings: CurrentPcbViaEventRouterBindings) {
    need(bindings !== null && typeof bindings === "object" && !types.isProxy(bindings) && Object.getPrototypeOf(bindings) === Object.prototype && Object.isFrozen(bindings));
    const fields = ["workerSessionId", "uiSessionId", "nextEvent", "assertCurrent", "fail"]; need(Reflect.ownKeys(bindings).length === fields.length);
    for (const [index, key] of fields.entries()) { const own = Object.getOwnPropertyDescriptor(bindings, key); need(own !== undefined && Object.hasOwn(own, "value") && typeof own.value === (index < 2 ? "string" : "function") && !types.isProxy(own.value)); }
    handle.parse(bindings.workerSessionId); handle.parse(bindings.uiSessionId); need(bindings.workerSessionId !== bindings.uiSessionId); this.#bindings = bindings; Object.freeze(this);
  }
  public register(lane: CurrentPcbViaEventLane, input: CurrentPcbViaEventPoint): void {
    need(!this.#failed && (lane === "save" || lane === "clock" || lane === "structure" || lane === "structureTransport" || lane === "producer")); const point = Object.freeze(pointSchema.parse(captureCurrentPcbStringClockReply(input).value));
    need((point.sessionId === this.#bindings.workerSessionId || lane === "clock" && point.sessionId === this.#bindings.uiSessionId) && this.#points.size < 59);
    const key = `${point.sessionId}\0${point.breakpointId}`;
    need(!this.#points.has(key) && ![...this.#points.values()].some(value => value.point.sessionId === point.sessionId && value.point.scriptId === point.scriptId &&
      value.point.lineNumber === point.lineNumber && value.point.columnNumber === point.columnNumber));
    this.#points.set(key, Object.freeze({ lane, point }));
  }
  /** Consume only the original collector's current pause before dispatch. An
   * unknown acknowledgement never refunds this one continuation attempt. */
  public reserveResume(lane: CurrentPcbViaEventLane, sessionId: string, role?: string): void {
    const pause = this.#paused.get(sessionId); need(lane !== "producer" && !this.#failed && pause !== undefined && pause.lane === lane && pause.delivered && !pause.resumeAttempted && (role === undefined || pause.point.role === role)); pause.resumeAttempted = true; if (lane === "clock" && sessionId === this.#bindings.workerSessionId && pause.point.role === "push") { this.#clockUiPending = true; } this.notifyEvent();
  }
  /** Consume one exact delivered initial-cache pause. Source/body/job and
   * native one-shot authorization remain separate; generic producer resumes
   * continue to refuse. Copied or previous deliveries cannot select a pause. */
  public reserveInitialCacheResume(event: CurrentPcbViaSaveWorkerEvent, role: "headEntry" | "headPromise" | "headSuccess"): void {
    const original = this.#pauseEvents.get(event); const current = this.#paused.get(this.#bindings.workerSessionId);
    need(!this.#failed && original !== undefined && original === current && original.lane === "producer" && original.delivered && !original.resumeAttempted &&
      ["headEntry", "headPromise", "headSuccess"].includes(role) && original.point.role === role && event.sessionId === this.#bindings.workerSessionId);
    original.resumeAttempted = true; this.notifyEvent();
  }
  public reserveInitialSyncResume(event: CurrentPcbViaSaveWorkerEvent, role: "syncEntry" | "syncFull" | "syncHistory" | "syncMerged" | "syncFinalizing" | "syncReturned"): void {
    const original = this.#pauseEvents.get(event); const current = this.#paused.get(this.#bindings.workerSessionId);
    need(!this.#failed && original !== undefined && original === current && original.lane === "producer" && original.delivered && !original.resumeAttempted &&
      ["syncEntry", "syncFull", "syncHistory", "syncMerged", "syncFinalizing", "syncReturned"].includes(role) && original.point.role === role && event.sessionId === this.#bindings.workerSessionId);
    original.resumeAttempted = true; this.notifyEvent();
  }
  public reservePeriodicSyncResume(event: CurrentPcbViaSaveWorkerEvent, role: "syncEntry" | "syncFull" | "syncLast" | "syncHistory" | "syncMerged" | "syncFinalizing" | "syncReturned"): void {
    const original = this.#pauseEvents.get(event); const current = this.#paused.get(this.#bindings.workerSessionId);
    need(!this.#failed && original !== undefined && original === current && original.lane === "producer" && original.delivered && !original.resumeAttempted &&
      ["syncEntry", "syncFull", "syncLast", "syncHistory", "syncMerged", "syncFinalizing", "syncReturned"].includes(role) && original.point.role === role && event.sessionId === this.#bindings.workerSessionId);
    original.resumeAttempted = true; this.notifyEvent();
  }
  /** Wake readers for an actual queued event or owned continuation. */
  public notifyEvent(): void { const signal = this.#changed; this.#changed = Promise.withResolvers<true>(); signal.resolve(true); }
  /** Revocation wakes parked readers without abandoning an in-flight poll. */
  public revoke(): void { this.#failed = true; this.notifyEvent(); }
  public fail(): void { this.revoke(); this.#bindings.fail(); }
  #canPoll(lane: CurrentPcbViaEventLane): boolean {
    const running = (sessionId: string): boolean => { const pause = this.#paused.get(sessionId); return pause === undefined || pause.resumeAttempted; };
    return running(this.#bindings.workerSessionId) || lane === "clock" && this.#clockUiPending && running(this.#bindings.uiSessionId);
  }
  /** Five delivered original clock resumes and the original still-held body
   * are required together. Descriptive counts or copied events do not pass. */
  public requireClockCompletionWithHeldSaveBody(): void {
    const body = this.#paused.get(this.#bindings.workerSessionId);
    need(!this.#failed && !this.#reading.clock && this.#queues.clock.length === 0 && this.#completedClock.size === 5 &&
      ["push", "dispatch", "result", "reply", "complete"].every(role => this.#completedClock.has(role)) && !this.#paused.has(this.#bindings.uiSessionId) &&
      body?.lane === "save" && body.point.role === "body" && body.delivered && !body.resumeAttempted);
  }
  #dispatch(event: DiagnosticEvent): void {
    const session = event.sessionId; need(typeof session === "string" && (session === this.#bindings.workerSessionId || session === this.#bindings.uiSessionId));
    if (event.method === "Debugger.breakpointResolved") {
      const value = resolved.parse(event.params); const known = this.#points.get(`${session}\0${value.breakpointId}`); need(known !== undefined);
      need(value.location.scriptId === known.point.scriptId && value.location.lineNumber === known.point.lineNumber && value.location.columnNumber === known.point.columnNumber); return;
    }
    let lane: CurrentPcbViaEventLane; let resumeRole: string | null = null;
    if (event.method === "Debugger.paused") {
      const value = paused.parse(event.params); const id = value.hitBreakpoints[0]; const selected = this.#points.get(`${session}\0${id}`), top = value.callFrames[0];
      need(selected !== undefined && top !== undefined && !this.#paused.has(session)); const point = selected.point;
      need(top.location.scriptId === point.scriptId && top.location.lineNumber === point.lineNumber && top.location.columnNumber === point.columnNumber);
      lane = selected.lane; this.#paused.set(session, { lane, point, delivered: false, resumeAttempted: false });
    } else {
      need(event.method === "Debugger.resumed"); empty.parse(event.params); const previous = this.#paused.get(session);
      need(previous !== undefined && previous.resumeAttempted); lane = previous.lane; resumeRole = previous.point.role; this.#paused.delete(session); if (lane === "clock" && session === this.#bindings.uiSessionId && resumeRole === "complete") { this.#clockUiPending = false; }
    }
    const queued = Object.freeze({ method: event.method, sessionId: session, params: event.params });
    if (event.method === "Debugger.paused") { const original = this.#paused.get(session); need(original !== undefined); this.#pauseEvents.set(queued, original); }
    if (resumeRole !== null) { this.#resumeRoles.set(queued, Object.freeze({ lane, role: resumeRole })); }
    need(this.#queues[lane].length < 32); this.#queues[lane].push(queued); this.notifyEvent();
  }
  async #pump(allowNativePoll: boolean): Promise<boolean> {
    try { need(!this.#failed); await this.#bindings.assertCurrent(); need(!this.#failed);
      const raw = await this.#bindings.nextEvent(allowNativePoll); if (raw === null) { need(!allowNativePoll); return false; } const event = eventSchema.parse(captureCurrentPcbStringClockReply(raw).value); Object.freeze(event.params);
      this.#dispatch(Object.freeze(event)); await this.#bindings.assertCurrent(); need(!this.#failed); return true;
    } catch (error) { this.fail(); throw error; } finally { this.#poll = null; }
  }
  #delivered(lane: CurrentPcbViaEventLane, event: CurrentPcbViaSaveWorkerEvent): void {
    if (event.method === "Debugger.paused") { const pause = this.#paused.get(event.sessionId); need(pause !== undefined && pause.lane === lane && !pause.delivered); pause.delivered = true; return; }
    const resumed = this.#resumeRoles.get(event); need(resumed !== undefined && resumed.lane === lane);
    if (lane === "clock") { need(!this.#completedClock.has(resumed.role)); this.#completedClock.add(resumed.role); }
  }
  public async next(lane: CurrentPcbViaEventLane): Promise<CurrentPcbViaSaveWorkerEvent> {
    need(!this.#failed && (lane === "save" || lane === "clock" || lane === "structure" || lane === "structureTransport" || lane === "producer") && !this.#reading[lane]); this.#reading[lane] = true;
    try { for (;;) { need(!this.#failed); const event = this.#queues[lane].shift(); if (event !== undefined) { await this.#bindings.assertCurrent(); need(!this.#failed);
      this.#delivered(lane, event); return event; }
      const changed = this.#changed.promise; const allowNativePoll = this.#canPoll(lane); this.#poll ??= this.#pump(allowNativePoll); const dispatched = await this.#poll;
      if (!dispatched && !this.#canPoll(lane)) { await changed; }
    } } finally { this.#reading[lane] = false; }
  }
}
