/** The original router remains the only worker reader. This finite controller
 * owns nested CM boundaries and joins actual submission, ACK and resumed events;
 * its descriptive receipts cannot grant a native worker or Save operation. */
import { z } from "zod";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_WORKER_SOURCE as WORKER } from "./current-schematic-relevance-modify-worker-replies.ts";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_KINDS as KINDS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_RETURN_KINDS as RETURNS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CONTROL_ROLES as ROLES, currentSchematicRelevanceModifyCmControlFunctionPoint as functionPoint, currentSchematicRelevanceModifyCmControlPoint as sourcePoint, validateCurrentSchematicRelevanceModifyCmControlCommand as validate } from "./current-schematic-relevance-modify-cm-control-protocol.ts";
import type { CurrentSchematicRelevanceModifyCmControlCommand as Command, CurrentSchematicRelevanceModifyCmControlKind as Kind, CurrentSchematicRelevanceModifyCmControlRole as Role } from "./current-schematic-relevance-modify-cm-control-protocol.ts";

export interface CurrentSchematicRelevanceModifyCmControlHeld { readonly event: DiagnosticEvent; readonly role: Role; readonly callFrameId: string; readonly callerFrameId: string | null; readonly workerCompleted: false; readonly modifyCompleted: false; readonly saveAuthorized: false }
export interface CurrentSchematicRelevanceModifyCmControlResume { readonly original: CurrentSchematicRelevanceModifyCmControlHeld; readonly ordinal: number; readonly target: Role | null }
export interface CurrentSchematicRelevanceModifyCmControlHost {
  readonly current: () => void;
  readonly request: (command: Command) => Promise<unknown>;
  readonly register: (role: Role, breakpointId: string, point: Readonly<{ scriptId: string; lineNumber: number; columnNumber: number }>) => void;
  readonly retire: (role: Role, breakpointId: string, originalEvent: DiagnosticEvent) => void;
  readonly reserveOriginalResume: (event: DiagnosticEvent, role: Role) => void;
  readonly fail: () => void;
}
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const point = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const frame = z.looseObject({ callFrameId: handle, location: point, functionLocation: point, returnValue: z.unknown().optional() });
const breakpointType = z.enum(["call", "return", "debuggerStatement"]).optional();
const breakpointPoint = z.strictObject({ ...point.shape, type: breakpointType });
const possible = z.strictObject({ locations: z.array(breakpointPoint) });
const empty = z.strictObject({});
const functionArm = z.strictObject({ breakpointId: handle });
const returnArm = z.strictObject({ breakpointId: handle, actualLocation: point });
const handles = z.strictObject({ remote: handle, onChange: handle, ticket: handle, canWs: handle });
function need(value: boolean): asserts value { if (!value) { throw new Error("SCH_MODIFY_CM_CONTROL"); } }
function kindOf(role: Role): Kind { if (role === "remoteReturned") { return "remote"; } if (role === "ticketReturned") { return "ticket"; } if (role === "canWsReturned") { return "canWs"; } return role; }
function returned(kind: typeof RETURNS[number]): Role { if (kind === "remote") { return "remoteReturned"; } return kind === "ticket" ? "ticketReturned" : "canWsReturned"; }

export class CurrentSchematicRelevanceModifyCmControlController {
  readonly #host: CurrentSchematicRelevanceModifyCmControlHost; readonly #session: string; readonly #script: string; readonly #foreign: ReadonlySet<string>;
  readonly #points = new Map<string, Role>(); readonly #initial = Promise.withResolvers<CurrentSchematicRelevanceModifyCmControlHeld | null>();
  #attempted = false; #armed = false; #parentSubmitted = false; #failed = false; #retireAttempted = false; #retired = false; #completed = false;
  #held: CurrentSchematicRelevanceModifyCmControlHeld | null = null; #reservation: CurrentSchematicRelevanceModifyCmControlResume | null = null; #ordinal = 0;
  #submitted = false; #acknowledged = false; #resumed = false;
  #resumeSignal: PromiseWithResolvers<boolean> | null = null; #nextSignal: PromiseWithResolvers<CurrentSchematicRelevanceModifyCmControlHeld | null> | null = null;
  /** Bind one original worker session and exclude the already-owned points.
   * This constructor performs no transport or application operation. */
  public constructor(host: CurrentSchematicRelevanceModifyCmControlHost, session: string, script: string, foreign: readonly string[]) { handle.parse(session); handle.parse(script); this.#host = host; this.#session = session; this.#script = script; this.#foreign = new Set(foreign); }
  async #request(command: Command): Promise<unknown> { this.#host.current(); need(!this.#failed); const reply = await this.#host.request(command); this.#host.current(); need(!this.#failed); return captureCurrentPcbStringClockReply(reply).value; }
  #register(id: string, role: Role): void { need(!this.#points.has(id) && !this.#foreign.has(id)); this.#points.set(id, role); this.#host.register(role, id, { scriptId: this.#script, ...sourcePoint(role) }); }
  /** Arm only original callee handles and their fixed normal returns. Any
   * rounded reply/collision burns setup before the parent batch may resume. */
  public async arm(input: Readonly<Record<Kind, string>>): Promise<void> {
    try {
      need(!this.#failed && !this.#attempted); this.#attempted = true;
      const original = handles.parse(captureCurrentPcbStringClockReply(input).value);
      for (const kind of RETURNS) {
        const at = { scriptId: this.#script, ...sourcePoint(returned(kind)) }, start = { scriptId: this.#script, ...functionPoint(kind) };
        const available = possible.parse(await this.#request(validate({ phase: "modify-cm-control-possible", kind, method: "Debugger.getPossibleBreakpoints", params: { start, end: { ...at, columnNumber: at.columnNumber + 1 }, restrictToFunction: true } })));
        need(available.locations.filter(value => value.scriptId === at.scriptId && value.lineNumber === at.lineNumber && value.columnNumber === at.columnNumber && value.type === "return").length === 1);
        const reply = returnArm.parse(await this.#request(validate({ phase: "modify-cm-control-return", kind, method: "Debugger.setBreakpoint", params: { location: at, condition: "" } })));
        need(reply.actualLocation.scriptId === at.scriptId && reply.actualLocation.lineNumber === at.lineNumber && reply.actualLocation.columnNumber === at.columnNumber); this.#register(reply.breakpointId, returned(kind));
      }
      for (const kind of KINDS) { const reply = functionArm.parse(await this.#request(validate({ phase: "modify-cm-control-function", kind, method: "Debugger.setBreakpointOnFunctionCall", params: { objectId: original[kind], condition: "" } }))); this.#register(reply.breakpointId, kind); }
      need(!this.#failed && this.#held === null && this.#points.size === ROLES.length); this.#armed = true;
    } catch (error) { this.fail(); throw error; }
  }
  /** Reprove all seven guards before submitting the separate parent resume. */
  public assertArmed(): void { this.#host.current(); need(this.#armed && !this.#failed && !this.#parentSubmitted && this.#held === null && this.#reservation === null); }
  /** Called synchronously inside Core's actual parent-batch transfer. An
   * earlier unsolicited CM pause cannot stand in for this submission. */
  public markParentSubmitted(): void { this.assertArmed(); this.#parentSubmitted = true; }
  /** Reprove the exact delivered event object, rather than copied frame data. */
  public requireHeld(original: CurrentSchematicRelevanceModifyCmControlHeld): void { this.#host.current(); need(!this.#failed && this.#held === original); }
  /** Await the first callee only after the real parent submission marker.
   * A failed setup settles this wait without issuing another request. */
  public async waitInitial(): Promise<CurrentSchematicRelevanceModifyCmControlHeld> { need(this.#parentSubmitted); const held = await this.#initial.promise; need(held !== null && held.role === "remote"); this.requireHeld(held); return held; }
  /** Consume the exact delivered role before transport. A failed or lost
   * acknowledgement never replenishes this original continuation. */
  public reserve(original: CurrentSchematicRelevanceModifyCmControlHeld): CurrentSchematicRelevanceModifyCmControlResume {
    this.requireHeld(original); need(this.#reservation === null && this.#ordinal < ROLES.length && original.role === ROLES[this.#ordinal] && (original.role !== "remoteReturned" || this.#retired));
    const value = Object.freeze({ original, ordinal: this.#ordinal, target: ROLES[this.#ordinal + 1] ?? null }); this.#reservation = value; this.#submitted = false; this.#acknowledged = false; this.#resumed = false; this.#resumeSignal = Promise.withResolvers<boolean>(); this.#nextSignal = Promise.withResolvers<CurrentSchematicRelevanceModifyCmControlHeld | null>();
    try { this.#host.reserveOriginalResume(original.event, original.role); } catch (error) { this.fail(); throw error; } return value;
  }
  /** Reject a copied, submitted or spent reservation before any transfer. */
  public requireResume(value: CurrentSchematicRelevanceModifyCmControlResume): void { this.requireHeld(value.original); need(this.#reservation === value && !this.#submitted && !this.#resumed); }
  /** Establish submission after all asynchronous Core verification completes. */
  public markSubmitted(value: CurrentSchematicRelevanceModifyCmControlResume): void { this.requireResume(value); this.#submitted = true; }
  /** Accept one empty native response only after synchronous submission.
   * Malformed or duplicate replies permanently fail the original lane. */
  public acknowledge(value: CurrentSchematicRelevanceModifyCmControlResume, reply: unknown): void { try { this.#host.current(); need(!this.#failed && this.#reservation === value && this.#submitted && !this.#acknowledged); empty.parse(captureCurrentPcbStringClockReply(reply).value); this.#acknowledged = true; } catch (error) { this.fail(); throw error; } }
  /** Join the original resumed event without treating its CDP ACK as a pause
   * or an application-completion receipt. */
  public async waitResumed(value: CurrentSchematicRelevanceModifyCmControlResume): Promise<void> { need(this.#reservation === value && this.#resumeSignal !== null); need(await this.#resumeSignal.promise); this.#host.current(); need(!this.#failed && this.#resumed); }
  /** A subsequent pause may arrive before the preceding CDP response. Join
   * both original signals without consuming another reader or stale frame. */
  public async complete(value: CurrentSchematicRelevanceModifyCmControlResume): Promise<CurrentSchematicRelevanceModifyCmControlHeld> { need(this.#reservation === value && value.target !== null && this.#submitted && this.#acknowledged && this.#resumed && this.#nextSignal !== null); const held = await this.#nextSignal.promise; need(held !== null && held.role === value.target && this.#reservation === value); this.requireHeld(held); this.#ordinal += 1; this.#reservation = null; return held; }
  /** Retire every acknowledged guard while the exact normal return is held.
   * Core separately retires its routing epochs; the delivery token survives. */
  public async retire(original: CurrentSchematicRelevanceModifyCmControlHeld): Promise<void> { this.requireHeld(original); need(original.role === "remoteReturned" && this.#ordinal === ROLES.length - 1 && this.#reservation === null && !this.#retireAttempted); this.#retireAttempted = true; try { for (const [id, role] of this.#points) { empty.parse(await this.#request(validate({ phase: "modify-cm-control-remove", role, method: "Debugger.removeBreakpoint", params: { breakpointId: id } }))); this.requireHeld(original); this.#host.retire(role, id, original.event); } this.#retired = true; } catch (error) { this.fail(); throw error; } }
  /** Terminal ACK and resumed end only this nested CM lane. Actual batch,
   * handler, TEXT serial, canvas, SDK and Save completion remain separate. */
  public completeReturned(value: CurrentSchematicRelevanceModifyCmControlResume): void { this.#host.current(); need(!this.#failed && this.#retired && this.#reservation === value && value.target === null && value.ordinal === ROLES.length - 1 && this.#submitted && this.#acknowledged && this.#resumed && this.#held === null); this.#ordinal += 1; this.#reservation = null; this.#completed = true; }
  /** Require all seven original continuations and guard removals; this says
   * nothing about the enclosing batch, worker publication or SDK Promise. */
  public requireCompleted(): void { this.#host.current(); need(!this.#failed && this.#completed && this.#retired && this.#held === null && this.#reservation === null && this.#ordinal === ROLES.length); }
  #role(event: DiagnosticEvent): Role | null {
    const ids = event.params["hitBreakpoints"]; const frames = event.params["callFrames"]; if (!Array.isArray(ids) || !Array.isArray(frames) || frames.length === 0) { return null; }
    const selected = ids.filter((id: unknown): id is string => typeof id === "string" && this.#points.has(id)); if (selected.length === 0) { return null; } need(ids.length === 1 && selected.length === 1); const id = selected[0]; need(id !== undefined); const role = this.#points.get(id); need(role !== undefined); const top = frame.parse(frames[0]); const source = functionPoint(kindOf(role)); const at = sourcePoint(role);
    need(top.functionLocation.scriptId === this.#script && top.functionLocation.lineNumber === source.lineNumber && top.functionLocation.columnNumber === source.columnNumber && top.location.scriptId === this.#script && top.location.lineNumber === at.lineNumber && top.location.columnNumber === at.columnNumber);
    if (role === "ticketReturned" || role === "remoteReturned") { z.strictObject({ type: z.literal("undefined") }).parse(top.returnValue); }
    if (role === "canWsReturned") { z.strictObject({ type: z.literal("boolean"), value: z.literal(false) }).parse(top.returnValue); }
    return role;
  }
  /** Consume only this original session's owned points or pending resumed
   * event. Caller/receiver and exact state proofs still precede every resume. */
  public observe(event: DiagnosticEvent): boolean {
    if (event.sessionId !== this.#session || this.#completed) { return false; }
    if (event.method === "Debugger.resumed") { if (this.#reservation === null) { return false; } try { this.#host.current(); need(!this.#failed && this.#submitted && !this.#resumed && this.#held === this.#reservation.original); empty.parse(event.params); this.#held = null; this.#resumed = true; this.#resumeSignal?.resolve(true); } catch { this.fail(); } return true; }
    if (event.method !== "Debugger.paused") { return false; }
    try { const role = this.#role(event); if (role === null) { return false; } this.#host.current(); need(!this.#failed && this.#armed && this.#parentSubmitted && this.#held === null && event.params["reason"] === "other");
      const initial = this.#ordinal === 0 && this.#reservation === null; if (initial) { need(role === "remote"); } else { need(this.#reservation !== null && this.#submitted && this.#resumed && this.#reservation.target === role && this.#nextSignal !== null); }
      const frames = event.params["callFrames"]; need(Array.isArray(frames)); const top = frame.parse(frames[0]); let caller: string | null = null;
      if (role === "remote") { const parent = frame.parse(frames[1]), source = WORKER.roles.batch; need(parent.functionLocation.scriptId === this.#script && parent.functionLocation.lineNumber === source.lineNumber && parent.functionLocation.columnNumber === source.columnNumber && parent.location.scriptId === this.#script && parent.location.lineNumber === source.lineNumber && parent.location.columnNumber >= source.columnNumber && parent.location.columnNumber < source.columnNumber + source.bytes); caller = parent.callFrameId; }
      const held = Object.freeze({ event, role, callFrameId: top.callFrameId, callerFrameId: caller, workerCompleted: false, modifyCompleted: false, saveAuthorized: false }); this.#held = held; if (initial) { this.#initial.resolve(held); } else { this.#nextSignal?.resolve(held); } return true;
    } catch { this.fail(); return true; }
  }
  /** Settle every pending waiter once and notify Core to retain the failure.
   * No attempted guard, resume or acknowledgement is replenished. */
  public fail(): void { if (this.#failed) { return; } this.#failed = true; this.#initial.resolve(null); this.#resumeSignal?.resolve(false); this.#nextSignal?.resolve(null); this.#host.fail(); }
}
