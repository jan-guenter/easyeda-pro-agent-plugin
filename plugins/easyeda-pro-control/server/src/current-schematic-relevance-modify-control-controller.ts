/** One original worker guard lane. The router supplies every event and owns
 * the only reader; this controller never submits a worker resume itself. */
import { z } from "zod";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CONTROL_KINDS as KINDS, currentSchematicRelevanceModifyControlFunctionPoint as functionPoint, currentSchematicRelevanceModifyControlPoint as sourcePoint, validateCurrentSchematicRelevanceModifyControlCommand as validate } from "./current-schematic-relevance-modify-control-protocol.ts";
import type { CurrentSchematicRelevanceModifyControlCommand as Command, CurrentSchematicRelevanceModifyControlKind as Kind, CurrentSchematicRelevanceModifyControlRole as Role } from "./current-schematic-relevance-modify-control-protocol.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_SOURCE as SOURCE } from "./current-schematic-relevance-modify-worker-replies.ts";

export interface CurrentSchematicRelevanceModifyControlHeld { readonly event: DiagnosticEvent; readonly role: Role; readonly callFrameId: string; readonly nativeSenderVerified: false; readonly workerCompleted: false; readonly modifyCompleted: false; readonly saveAuthorized: false }
export interface CurrentSchematicRelevanceModifyControlResume { readonly original: CurrentSchematicRelevanceModifyControlHeld; readonly target: Role | null; readonly ordinal: number; readonly terminal: boolean }
export interface CurrentSchematicRelevanceModifyControlHost {
  readonly current: () => void; readonly request: (command: Command) => Promise<unknown>;
  readonly register: (role: Role, breakpointId: string, point: Readonly<{ scriptId: string; lineNumber: number; columnNumber: number }>) => void;
  readonly retire?: (role: Role, breakpointId: string, originalEvent: DiagnosticEvent) => void;
  readonly reserveOriginalResume: (event: DiagnosticEvent, role: Role) => void; readonly fail: () => void;
}
const token = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const point = z.strictObject({ scriptId: token, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const frame = z.object({ callFrameId: token, functionLocation: point, location: point, returnValue: z.unknown().optional() });
const possibleLocation = point.extend({ type: z.string().optional() }); const possibleLocations = z.array(possibleLocation).max(64);
const possible = z.strictObject({ locations: possibleLocations });
const armedReturn = z.strictObject({ breakpointId: token, actualLocation: point });
const armedFunction = z.strictObject({ breakpointId: token }); const empty = z.strictObject({});
function need(value: boolean): asserts value { if (!value) { throw new Error("SCH_MODIFY_CONTROL_ORIGINAL_EVENT"); } }
export class CurrentSchematicRelevanceModifyControlController {
  readonly #host: CurrentSchematicRelevanceModifyControlHost; readonly #session: string; readonly #script: string; readonly #foreign: ReadonlySet<string>;
  readonly #points = new Map<string, Role>(); readonly #initial = Promise.withResolvers<CurrentSchematicRelevanceModifyControlHeld | null>();
  #attempted = false; #armed = false; #failed = false; #held: CurrentSchematicRelevanceModifyControlHeld | null = null; #ordinal = 0;
  #reservation: CurrentSchematicRelevanceModifyControlResume | null = null; #submitted = false; #acknowledged = false; #resumed = false;
  #resumeSignal: ReturnType<typeof Promise.withResolvers<boolean>> | null = null; #nextSignal: ReturnType<typeof Promise.withResolvers<CurrentSchematicRelevanceModifyControlHeld | null>> | null = null;
  #retireAttempted = false; #retired = false; #completed = false;
  /** Bind only the original worker session and fixed source. The initial
   * registered-handler pause must arrive from the separately issued UI send. */
  public constructor(host: CurrentSchematicRelevanceModifyControlHost, session: string, script: string, foreignBreakpointIds: readonly string[]) { this.#host = host; this.#session = token.parse(session); this.#script = token.parse(script); this.#foreign = new Set(foreignBreakpointIds.map(value => token.parse(value))); Object.freeze(this); }
  /** Retain request custody around each original metadata/removal await. */
  async #request(command: Command): Promise<unknown> { this.#host.current(); need(!this.#failed); const result = await this.#host.request(command); this.#host.current(); need(!this.#failed); return captureCurrentPcbStringClockReply(result).value; }
  /** Register only a fresh native ID at its exact source-owned point. */
  #register(id: string, role: Role): void { need(!this.#foreign.has(id) && !this.#points.has(id)); this.#points.set(id, role); this.#host.register(role, id, Object.freeze({ scriptId: this.#script, ...sourcePoint(role) })); }
  /** Arm six exact requests without running any handler or taking another
   * reader. Rounded replies or original/foreign ID collisions burn this arm. */
  public async arm(handlerObjectId: string, batchObjectId: string): Promise<void> {
    need(!this.#attempted && !this.#failed); this.#attempted = true;
    try {
      for (const kind of KINDS) {
        const start = functionPoint(kind); const role = kind === "handler" ? "handlerReturned" : "batchReturned"; const at = { scriptId: this.#script, ...sourcePoint(role) };
        const reply = possible.parse(await this.#request(validate({ phase: "modify-control-possible", kind, method: "Debugger.getPossibleBreakpoints", params: { start: { scriptId: this.#script, ...start }, end: { ...at, columnNumber: at.columnNumber + 1 }, restrictToFunction: true } })));
        need(reply.locations.filter(value => value.scriptId === this.#script && value.lineNumber === at.lineNumber && value.columnNumber === at.columnNumber && value.type === "return").length === 1);
        const result = armedReturn.parse(await this.#request(validate({ phase: "modify-control-return", kind, method: "Debugger.setBreakpoint", params: { location: at, condition: "" } })));
        need(result.actualLocation.scriptId === this.#script && result.actualLocation.lineNumber === at.lineNumber && result.actualLocation.columnNumber === at.columnNumber); this.#register(result.breakpointId, role);
      }
      for (const [kind, objectId] of [["handler", handlerObjectId], ["batch", batchObjectId]] as const) { const result = armedFunction.parse(await this.#request(validate({ phase: "modify-control-function", kind, method: "Debugger.setBreakpointOnFunctionCall", params: { objectId, condition: "" } }))); this.#register(result.breakpointId, kind); }
      need(!this.#failed && this.#points.size === 4 && this.#held === null); this.#armed = true;
    } catch (error) { this.fail(); throw error; }
  }
  /** Require the exact still-held router delivery, never an old frame ID. */
  public requireHeld(original: CurrentSchematicRelevanceModifyControlHeld): void { this.#host.current(); need(!this.#failed && this.#held === original && original.event.sessionId === this.#session); }
  /** Await the handler pause caused by UI sending. No worker resume is issued
   * to obtain it, and unsolicited earlier source activity refuses. */
  public async waitInitial(): Promise<CurrentSchematicRelevanceModifyControlHeld> { need(this.#armed && !this.#failed); const original = await this.#initial.promise; need(original !== null && original.role === "handler"); this.requireHeld(original); return original; }
  /** Consume router bookkeeping before any asynchronous transport begins. */
  #reserve(original: CurrentSchematicRelevanceModifyControlHeld, target: Role | null, terminal: boolean): CurrentSchematicRelevanceModifyControlResume {
    this.requireHeld(original); need(this.#armed && !this.#completed && this.#reservation === null && this.#ordinal < 4);
    const value = Object.freeze({ original, target, ordinal: this.#ordinal, terminal }); this.#reservation = value; this.#submitted = false; this.#acknowledged = false; this.#resumed = false; this.#resumeSignal = Promise.withResolvers<boolean>(); this.#nextSignal = Promise.withResolvers<CurrentSchematicRelevanceModifyControlHeld | null>();
    try { this.#host.reserveOriginalResume(original.event, original.role); } catch (error) { this.fail(); throw error; } return value;
  }
  /** Burn one of the three source transitions before the genuine transport.
   * This calls only the original router's bookkeeping reservation. */
  public reserve(original: CurrentSchematicRelevanceModifyControlHeld): CurrentSchematicRelevanceModifyControlResume {
    const expected = ["handler", "batch", "batchReturned"] as const, targets = ["batch", "batchReturned", "handlerReturned"] as const; const target = targets[this.#ordinal];
    need(target !== undefined && original.role === expected[this.#ordinal] && !this.#retireAttempted); return this.#reserve(original, target, false);
  }
  /** Recheck the exact unused reservation immediately before native transfer. */
  public requireResume(value: CurrentSchematicRelevanceModifyControlResume): void { this.requireHeld(value.original); need(this.#reservation === value && !this.#submitted && !this.#resumed); }
  /** Mark actual submission synchronously so earlier resumed events refuse. */
  public markSubmitted(value: CurrentSchematicRelevanceModifyControlResume): void { this.requireResume(value); this.#submitted = true; }
  /** Join the actual empty CDP response once. Unknown or duplicate replies
   * fail without refunding the consumed original continuation. */
  public acknowledge(value: CurrentSchematicRelevanceModifyControlResume, reply: unknown): void { try { this.#host.current(); need(!this.#failed && this.#reservation === value && this.#submitted && !this.#acknowledged); empty.parse(captureCurrentPcbStringClockReply(reply).value); this.#acknowledged = true; } catch (error) { this.fail(); throw error; } }
  /** Await only the same-session resumed event belonging to this transfer. */
  public async waitResumed(value: CurrentSchematicRelevanceModifyControlResume): Promise<void> { need(this.#reservation === value && this.#resumeSignal !== null); need(await this.#resumeSignal.promise); this.#host.current(); need(!this.#failed && this.#resumed); }
  /** Join the exact next pause after both original ACK and resumed, accepting
   * either ACK/pause order without a second event read. */
  public async complete(value: CurrentSchematicRelevanceModifyControlResume): Promise<CurrentSchematicRelevanceModifyControlHeld> {
    need(this.#reservation === value && !value.terminal && this.#submitted && this.#acknowledged && this.#resumed && this.#nextSignal !== null);
    const held = await this.#nextSignal.promise; need(held !== null && this.#reservation === value && this.#ordinal === value.ordinal); this.requireHeld(held); this.#ordinal += 1; this.#reservation = null; return held;
  }
  /** Remove all four original guard IDs while handler return is held. Each
   * removal is attempted once; a lost ACK cannot authorize a second round. */
  public async retire(original: CurrentSchematicRelevanceModifyControlHeld): Promise<void> {
    this.requireHeld(original); need(original.role === "handlerReturned" && this.#ordinal === 3 && this.#reservation === null && !this.#retireAttempted && this.#points.size === 4); this.#retireAttempted = true;
    try { for (const [breakpointId, role] of this.#points) { empty.parse(await this.#request(validate({ phase: "modify-control-remove", method: "Debugger.removeBreakpoint", params: { breakpointId } }))); this.requireHeld(original); this.#host.retire?.(role, breakpointId, original.event); } this.#retired = true; } catch (error) { this.fail(); throw error; }
  }
  /** Reserve the fourth return release only after all original guards have
   * been removed. Core still owns the final TEXT/Nd completion authorization. */
  public reserveTerminal(original: CurrentSchematicRelevanceModifyControlHeld): CurrentSchematicRelevanceModifyControlResume { need(original.role === "handlerReturned" && this.#ordinal === 3 && this.#retired); return this.#reserve(original, null, true); }
  /** Join the terminal ACK and resumed without waiting for another pause or
   * claiming worker, Modify, publication or Save completion. */
  public completeReturned(value: CurrentSchematicRelevanceModifyControlResume): void { this.#host.current(); need(!this.#failed && this.#reservation === value && value.terminal && value.target === null && value.ordinal === 3 && this.#ordinal === 3 && this.#submitted && this.#acknowledged && this.#resumed && this.#held === null && this.#retired); this.#ordinal = 4; this.#reservation = null; this.#completed = true; }
  /** Reprove this original finite lane's consumed terminal release only. */
  public requireCompleted(): void { this.#host.current(); need(!this.#failed && this.#completed && this.#retired && this.#ordinal === 4 && this.#held === null && this.#reservation === null); }
  /** Retain consumed IDs for collision refusal even after guard retirement. */
  public breakpointIds(): readonly string[] { this.#host.current(); need(this.#armed && !this.#failed); return Object.freeze([...this.#points.keys()]); }
  /** Require the actual source callee and the original wu.execute caller
   * for batch entry/return; return values must be exactly undefined. */
  #role(event: DiagnosticEvent): Role | null {
    const ids = event.params["hitBreakpoints"]; const frames = event.params["callFrames"]; if (!Array.isArray(ids) || !Array.isArray(frames) || frames.length === 0) { return null; }
    const selected = ids.filter((id: unknown): id is string => typeof id === "string" && this.#points.has(id)); if (selected.length === 0) { return null; } need(ids.length === 1 && selected.length === 1); const id = selected[0]; need(id !== undefined); const role = this.#points.get(id); need(role !== undefined);
    const first = frame.parse(frames[0]); const kind: Kind = role === "handler" || role === "handlerReturned" ? "handler" : "batch"; const source = functionPoint(kind); const at = sourcePoint(role);
    need(first.functionLocation.scriptId === this.#script && first.functionLocation.lineNumber === source.lineNumber && first.functionLocation.columnNumber === source.columnNumber && first.location.scriptId === this.#script && first.location.lineNumber === at.lineNumber && first.location.columnNumber === at.columnNumber);
    if (role === "batch" || role === "batchReturned") { const caller = frame.parse(frames[1]); const execute = SOURCE.roles.execute; need(caller.functionLocation.scriptId === this.#script && caller.functionLocation.lineNumber === execute.lineNumber && caller.functionLocation.columnNumber === execute.columnNumber && caller.location.scriptId === this.#script && caller.location.lineNumber === 0 && caller.location.columnNumber === 8125); }
    if (role === "batchReturned" || role === "handlerReturned") { z.strictObject({ type: z.literal("undefined") }).parse(first.returnValue); }
    return role;
  }
  /** Classify only original router deliveries. The initial native handler
   * pause requires no reservation; all later signals require actual submit. */
  public observe(event: DiagnosticEvent): boolean {
    if (event.sessionId !== this.#session || this.#completed) { return false; }
    if (event.method === "Debugger.resumed") {
      if (this.#reservation === null) { return false; }
      try { this.#host.current(); need(!this.#failed && this.#submitted && !this.#resumed && this.#held === this.#reservation.original && Reflect.ownKeys(event.params).length === 0); this.#held = null; this.#resumed = true; this.#resumeSignal?.resolve(true); } catch { this.fail(); } return true;
    }
    if (event.method !== "Debugger.paused") { return false; }
    try {
      const role = this.#role(event); if (role === null) { return false; } this.#host.current(); need(this.#armed && !this.#failed && this.#held === null && event.params["reason"] === "other");
      const initial = this.#ordinal === 0 && this.#reservation === null; if (initial) { need(role === "handler"); } else { need(this.#reservation !== null && !this.#reservation.terminal && this.#submitted && this.#resumed && this.#reservation.target === role && this.#nextSignal !== null); }
      const frames = event.params["callFrames"]; need(Array.isArray(frames)); const first = frame.parse(frames[0]); const held = Object.freeze({ event, role, callFrameId: first.callFrameId, nativeSenderVerified: false, workerCompleted: false, modifyCompleted: false, saveAuthorized: false }); this.#held = held;
      if (initial) { this.#initial.resolve(held); } else { this.#nextSignal?.resolve(held); } return true;
    } catch { this.fail(); return true; }
  }
  /** Wake every original waiter and keep all attempted controls consumed. */
  public fail(): void { this.#initial.resolve(null); this.#resumeSignal?.resolve(false); this.#nextSignal?.resolve(null); if (!this.#failed) { this.#failed = true; this.#host.fail(); } }
}
