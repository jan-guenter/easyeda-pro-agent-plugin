/** Two fixed original streams share mechanics, never caller-selected source
 * roles. Worker delivery still uses its single original router; UI events stay
 * on the original callback stream. This controller issues no body permit. */
import { types } from "node:util";
import { z } from "zod";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_CONTROL_FUNCTIONS as FUNCTIONS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_CONTROL_RETURNS as RETURNS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_UI_ROLES as UI, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_ECHO_WORKER_ROLES as WORKER, currentSchematicRelevanceModifyEchoControlFunction as functionPoint, currentSchematicRelevanceModifyEchoControlCaller as sourceCaller, currentSchematicRelevanceModifyEchoControlPoint as sourcePoint, validateCurrentSchematicRelevanceModifyEchoControlCommand as validate } from "./current-schematic-relevance-modify-echo-control-protocol.ts";
import type { CurrentSchematicRelevanceModifyEchoControlCommand as Command, CurrentSchematicRelevanceModifyEchoControlRole as Role } from "./current-schematic-relevance-modify-echo-control-protocol.ts";

export interface CurrentSchematicRelevanceModifyEchoControlHeld { readonly event: DiagnosticEvent; readonly role: Role; readonly callFrameId: string }
export interface CurrentSchematicRelevanceModifyEchoControlResume { readonly original: CurrentSchematicRelevanceModifyEchoControlHeld; readonly target: Role | null; readonly ordinal: number }
export interface CurrentSchematicRelevanceModifyEchoControlHost {
  readonly current: () => void;
  readonly request: (command: Command) => Promise<unknown>;
  readonly assertOriginalEvent: (event: DiagnosticEvent) => void;
  readonly register: (role: Role, id: string, point: Readonly<{ scriptId: string; lineNumber: number; columnNumber: number }>) => void;
  readonly retire: (role: Role, id: string, held: CurrentSchematicRelevanceModifyEchoControlHeld) => void;
  readonly reserveOriginalResume: (held: CurrentSchematicRelevanceModifyEchoControlHeld) => void;
  readonly held: (held: CurrentSchematicRelevanceModifyEchoControlHeld) => void;
  readonly resumed: () => void;
  readonly fail: () => void;
}
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const point = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const frame = z.object({ callFrameId: handle, functionLocation: point, location: point, returnValue: z.unknown().optional() });
const functionReply = z.strictObject({ breakpointId: handle });
const pointReply = z.strictObject({ breakpointId: handle, actualLocation: point });
const possiblePoint = point.extend({ type: z.string().optional() });
const possibleReply = z.strictObject({ locations: z.array(possiblePoint).max(64) });
const empty = z.strictObject({});
const undefinedReturn = z.strictObject({ type: z.literal("undefined") });
const falseReturn = z.strictObject({ type: z.literal("boolean"), value: z.literal(false) });
const promiseReturn = z.strictObject({ type: z.literal("object"), subtype: z.literal("promise"), className: z.literal("Promise"), description: z.literal("Promise"), objectId: handle });
const originals = new WeakSet<object>();
/** Refuse an unproved original state before the next source transition. */
function need(value: boolean): asserts value { if (!value) { throw new Error("SCH_ECHO_CONTROL_ORIGINAL"); } }

export class CurrentSchematicRelevanceModifyEchoControlController {
  readonly #host: CurrentSchematicRelevanceModifyEchoControlHost;
  readonly #realm: "worker" | "ui";
  readonly #session: string;
  readonly #script: string;
  readonly #variant: 0 | 1;
  readonly #roles: readonly Role[];
  readonly #foreign: ReadonlySet<string>;
  readonly #points = new Map<string, Role>();
  readonly #signals = new Map<Role, PromiseWithResolvers<CurrentSchematicRelevanceModifyEchoControlHeld | null>>();
  #attempted = false; #armed = false; #failed = false; #expected = false; #ordinal = 0;
  #held: CurrentSchematicRelevanceModifyEchoControlHeld | null = null;
  #reservation: CurrentSchematicRelevanceModifyEchoControlResume | null = null;
  #submitted = false; #acknowledged = false; #resumed = false; #retireAttempted = false; #retired = false; #completed = false;
  #resumeSignal: PromiseWithResolvers<boolean> | null = null;
  /** The realm selects one immutable role sequence. No supplied program,
   * source point, role list or alternate reader can be installed here. */
  public constructor(host: CurrentSchematicRelevanceModifyEchoControlHost, realm: "worker" | "ui", session: string, script: string, variant: 0 | 1, foreign: readonly string[]) {
    need(realm === "worker" || realm === "ui"); need(realm !== "worker" || variant === 0);
    this.#host = host; this.#realm = realm; this.#session = handle.parse(session); this.#script = handle.parse(script); this.#variant = variant; this.#roles = realm === "worker" ? WORKER : UI; this.#foreign = new Set(foreign);
    for (const role of this.#roles) { this.#signals.set(role, Promise.withResolvers<CurrentSchematicRelevanceModifyEchoControlHeld | null>()); }
    originals.add(this);
  }
  /** Keep custody and failure state current around the original transport. */
  async #request(command: Command): Promise<unknown> { this.#host.current(); need(!this.#failed); const raw = await this.#host.request(command); this.#host.current(); need(!this.#failed); return captureCurrentPcbStringClockReply(raw).value; }
  /** Match the actual native acknowledgement to the fixed role before its
   * point enters routing. Earlier lanes retain their own allocations. */
  #insert(role: Role, id: string): void { need(!this.#foreign.has(id) && !this.#points.has(id)); this.#points.set(id, role); this.#host.register(role, id, { scriptId: this.#script, ...sourcePoint(this.#variant, role) }); }
  /** Qualify handles separately before calling this method. Every source
   * return must be available at its exact coordinate; rounding refuses. */
  public async arm(functions: Readonly<Partial<Record<Role, string>>>): Promise<void> {
    try {
      this.#host.current(); need(!this.#attempted && !this.#failed); this.#attempted = true;
      const expected = FUNCTIONS.filter(role => this.#roles.includes(role));
      need(!types.isProxy(functions) && Reflect.ownKeys(functions).length === expected.length);
      for (const role of expected) { const d = Object.getOwnPropertyDescriptor(functions, role); need(d !== undefined && "value" in d && typeof d.value === "string"); const id = handle.parse(d.value); const command = validate({ phase: "modify-echo-control-function", role, method: "Debugger.setBreakpointOnFunctionCall", params: { objectId: id, condition: "" } }); const reply = await this.#request(command); this.#insert(role, functionReply.parse(reply).breakpointId); }
      for (const role of RETURNS.filter(value => this.#roles.includes(value))) {
        const at = { scriptId: this.#script, ...sourcePoint(this.#variant, role) }, start = { scriptId: this.#script, ...functionPoint(this.#variant, role) };
        const possible = possibleReply.parse(await this.#request(validate({ phase: "modify-echo-control-possible", role, variant: this.#variant, method: "Debugger.getPossibleBreakpoints", params: { start, end: { ...at, columnNumber: at.columnNumber + 1 }, restrictToFunction: true } })));
        need(possible.locations.filter(value => value.scriptId === at.scriptId && value.lineNumber === at.lineNumber && value.columnNumber === at.columnNumber && value.type === "return").length === 1);
        const armed = pointReply.parse(await this.#request(validate({ phase: "modify-echo-control-point", role, variant: this.#variant, method: "Debugger.setBreakpoint", params: { location: at, condition: "" } })));
        need(armed.actualLocation.scriptId === at.scriptId && armed.actualLocation.lineNumber === at.lineNumber && armed.actualLocation.columnNumber === at.columnNumber); this.#insert(role, armed.breakpointId);
      }
      need(this.#points.size === this.#roles.length && this.#held === null); this.#armed = true;
    } catch (caughtError) { this.fail(); throw caughtError; }
  }
  /** Mark the initial original transfer, or the worker's timer-return handoff,
   * synchronously after its final owner checks and before transport. */
  public markExpected(): void { this.#host.current(); need(!this.#failed && this.#armed && !this.#expected && this.#held === null && this.#reservation === null && (this.#ordinal === 0 || this.#realm === "worker" && this.#ordinal === 3)); this.#expected = true; }
  /** Reprove the exact held packet before every passive graph or release. */
  public requireHeld(held: CurrentSchematicRelevanceModifyEchoControlHeld): void { this.#host.current(); need(!this.#failed && this.#held === held); this.#host.assertOriginalEvent(held.event); }
  /** Wait only on this same stream's already-armed source role. */
  public async wait(role: Role): Promise<CurrentSchematicRelevanceModifyEchoControlHeld> { const signal = this.#signals.get(role); need(signal !== undefined); const held = await signal.promise; need(held !== null); this.requireHeld(held); return held; }
  /** Burn a once-only boundary before any await. Worker post return hands
   * back to its original timer guard before local-loopback delivery. */
  public reserve(held: CurrentSchematicRelevanceModifyEchoControlHeld): CurrentSchematicRelevanceModifyEchoControlResume {
    this.requireHeld(held); need(this.#reservation === null && this.#roles[this.#ordinal] === held.role && (this.#ordinal !== this.#roles.length - 1 || this.#retired));
    const target = held.role === "workerPostReturned" ? null : this.#roles[this.#ordinal + 1] ?? null;
    const reservation = Object.freeze({ original: held, target, ordinal: this.#ordinal }); this.#reservation = reservation; this.#submitted = false; this.#acknowledged = false; this.#resumed = false; this.#resumeSignal = Promise.withResolvers<boolean>();
    try { this.#host.reserveOriginalResume(held); } catch (caughtError) { this.fail(); throw caughtError; } return reservation;
  }
  /** Check the unused original reservation inside the actual transfer. */
  public requireResume(reservation: CurrentSchematicRelevanceModifyEchoControlResume): void { this.requireHeld(reservation.original); need(this.#reservation === reservation && !this.#submitted && !this.#resumed); }
  /** Native/event custody begins only at actual submission. */
  public markSubmitted(reservation: CurrentSchematicRelevanceModifyEchoControlResume): void { this.requireResume(reservation); this.#submitted = true; }
  /** An ACK cannot replace the separately observed resumed event. */
  public acknowledge(reservation: CurrentSchematicRelevanceModifyEchoControlResume, raw: unknown): void { try { this.#host.current(); need(!this.#failed && this.#reservation === reservation && this.#submitted && !this.#acknowledged); empty.parse(captureCurrentPcbStringClockReply(raw).value); this.#acknowledged = true; } catch (caughtError) { this.fail(); throw caughtError; } }
  /** Join the original ACK and resumed event before accepting the next held
   * boundary. A next pause may already have arrived while the ACK was pending. */
  public async complete(reservation: CurrentSchematicRelevanceModifyEchoControlResume): Promise<CurrentSchematicRelevanceModifyEchoControlHeld | null> {
    need(this.#reservation === reservation && this.#resumeSignal !== null); need(await this.#resumeSignal.promise); this.#host.current(); need(!this.#failed && this.#acknowledged && this.#resumed && this.#reservation === reservation);
    const held = reservation.target === null ? null : await this.wait(reservation.target); this.#host.current(); need(!this.#failed && this.#reservation === reservation); this.#ordinal += 1; this.#reservation = null;
    if (this.#ordinal === this.#roles.length) { need(this.#retired && held === null); this.#completed = true; } return held;
  }
  /** Retire only this lane's actual allocations while its final return stays
   * held. The router is updated only after each real empty removal ACK. */
  public async retire(held: CurrentSchematicRelevanceModifyEchoControlHeld): Promise<void> {
    try { this.requireHeld(held); need(held.role === this.#roles.at(-1) && !this.#retireAttempted && this.#reservation === null); this.#retireAttempted = true;
      for (const [id, role] of this.#points) { empty.parse(await this.#request(validate({ phase: "modify-echo-control-remove", role, method: "Debugger.removeBreakpoint", params: { breakpointId: id } }))); this.requireHeld(held); this.#host.retire(role, id, held); } this.#retired = true;
    } catch (caughtError) { this.fail(); throw caughtError; }
  }
  /** Accept a fixed source pause only after its actual original transfer.
   * Mixed IDs, rounded locations and an unproved async return all refuse. */
  #role(event: DiagnosticEvent): Role | null {
    const ids = event.params["hitBreakpoints"]; const frames = event.params["callFrames"]; if (!Array.isArray(ids)) { return null; } const owned = ids.filter((id: unknown): id is string => typeof id === "string" && this.#points.has(id)); if (owned.length === 0) { return null; }
    need(ids.length === 1 && owned.length === 1 && Array.isArray(frames) && frames.length > 0); const id = owned[0]; need(id !== undefined); const role = this.#points.get(id); need(role !== undefined); const first = frame.parse(frames[0]); const at = sourcePoint(this.#variant, role); const fn = functionPoint(this.#variant, role);
    need(first.functionLocation.scriptId === this.#script && first.functionLocation.lineNumber === fn.lineNumber && first.functionLocation.columnNumber === fn.columnNumber && first.location.scriptId === this.#script && first.location.lineNumber === at.lineNumber && first.location.columnNumber === at.columnNumber);
    if (role === "uiExecuteReturned") { promiseReturn.parse(first.returnValue); } else if (role === "uiPublishReturned") { falseReturn.parse(first.returnValue); } else if (role.endsWith("Returned")) { undefinedReturn.parse(first.returnValue); }
    const expected = sourceCaller(this.#variant, role);
    if (expected !== null) { const caller = frame.parse(frames[1]); need(caller.functionLocation.scriptId === this.#script && caller.functionLocation.lineNumber === expected.functionLocation.lineNumber && caller.functionLocation.columnNumber === expected.functionLocation.columnNumber && caller.location.scriptId === this.#script && caller.location.lineNumber === expected.location.lineNumber && caller.location.columnNumber === expected.location.columnNumber); }
    return role;
  }
  /** Consume only this original stream; foreign helper and other-lane events
   * stay available to the existing owner router. */
  public observe(event: DiagnosticEvent): boolean {
    if (event === null || typeof event !== "object" || types.isProxy(event)) { return false; }
    const session = Object.getOwnPropertyDescriptor(event, "sessionId");
    if (session === undefined || !("value" in session) || session.value !== this.#session) { return false; }
    try {
      const method = Object.getOwnPropertyDescriptor(event, "method"), params = Object.getOwnPropertyDescriptor(event, "params");
      need(method !== undefined && "value" in method && params !== undefined && "value" in params);
      this.#host.assertOriginalEvent(event);
    } catch { this.fail(); return true; }
    if (event.method === "Debugger.resumed") {
      const reservation = this.#reservation; if (reservation === null) { return false; }
      try { this.#host.current(); this.#host.assertOriginalEvent(event); need(!this.#failed && this.#submitted && !this.#resumed && this.#held === reservation.original); empty.parse(event.params); this.#held = null; this.#resumed = true; this.#expected = reservation.target !== null; this.#host.resumed(); this.#resumeSignal?.resolve(true); } catch { this.fail(); } return true;
    }
    if (event.method !== "Debugger.paused") { return false; }
    try { const role = this.#role(event); if (role === null) { return false; } this.#host.current(); this.#host.assertOriginalEvent(event); const expected = this.#reservation?.target ?? this.#roles[this.#ordinal];
      need(!this.#failed && this.#armed && this.#expected && this.#held === null && role === expected && event.params["reason"] === "other"); const frames = event.params["callFrames"]; need(Array.isArray(frames)); const first = frame.parse(frames[0]); const held = Object.freeze({ event, role, callFrameId: first.callFrameId }); this.#held = held; this.#expected = false; this.#host.held(held); this.#signals.get(role)?.resolve(held); return true;
    } catch { this.fail(); return true; }
  }
  /** Require actual final removal, terminal ACK and resumed joins. */
  public requireCompleted(): void { this.#host.current(); need(!this.#failed && this.#completed && this.#retired && this.#held === null && this.#reservation === null); }
  /** Wake every retained waiter without replaying a read or resume. */
  public fail(): void { this.#resumeSignal?.resolve(false); for (const signal of this.#signals.values()) { signal.resolve(null); } if (!this.#failed) { this.#failed = true; this.#host.fail(); } }
}
const originalMethods = Object.getOwnPropertyDescriptors(CurrentSchematicRelevanceModifyEchoControlController.prototype);
/** Core requires this module's private instance and unchanged complete source
 * methods. A copy, Proxy or late method replacement supplies no custody. */
export function assertOriginalCurrentSchematicRelevanceModifyEchoControlController(value: CurrentSchematicRelevanceModifyEchoControlController): void {
  need(value !== null && typeof value === "object" && !types.isProxy(value) && originals.has(value) && Object.getPrototypeOf(value) === CurrentSchematicRelevanceModifyEchoControlController.prototype && Reflect.ownKeys(value).length === 0);
  const current = Object.getOwnPropertyDescriptors(CurrentSchematicRelevanceModifyEchoControlController.prototype), keys = Reflect.ownKeys(originalMethods);
  need(Reflect.ownKeys(current).length === keys.length && Object.entries(originalMethods).every(([name, before]) => { const now = current[name]; return now !== undefined && before.value === now.value && before.get === now.get && before.set === now.set && before.writable === now.writable && before.enumerable === now.enumerable && before.configurable === now.configurable; }));
}
