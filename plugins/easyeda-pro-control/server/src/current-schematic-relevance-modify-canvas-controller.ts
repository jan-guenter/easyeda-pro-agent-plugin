/** The existing original worker reader supplies these Canvas boundaries.
 * Controls retain exact delivered events, burn before transport and require
 * separate private receiver/state proofs before every original body resumes. */
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CM_CALLEE_SOURCE as SOURCE } from "./current-schematic-relevance-modify-cm-callee-source.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_STRUCTURE_SOURCE as STRUCTURE } from "./current-schematic-relevance-modify-structure-source.ts";
import { z } from "zod";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_FUNCTION_ROLES as FUNCTIONS, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_ROLES as ROLES, CURRENT_SCHEMATIC_RELEVANCE_MODIFY_CANVAS_SOURCE_ROLES as SOURCES, currentSchematicRelevanceModifyCanvasFunctionPoint as functionPoint, currentSchematicRelevanceModifyCanvasPoint as sourcePoint, validateCurrentSchematicRelevanceModifyCanvasControlCommand as validate } from "./current-schematic-relevance-modify-canvas-control-protocol.ts";
import type { CurrentSchematicRelevanceModifyCanvasControlCommand as Command, CurrentSchematicRelevanceModifyCanvasFunctionRole as FunctionRole, CurrentSchematicRelevanceModifyCanvasRole as Role } from "./current-schematic-relevance-modify-canvas-control-protocol.ts";

export interface CurrentSchematicRelevanceModifyCanvasHeld { readonly event: DiagnosticEvent; readonly role: Role; readonly callFrameId: string; readonly callerFrameId: string | null; readonly canvasCompleted: false; readonly modifyCompleted: false; readonly saveAuthorized: false }
export interface CurrentSchematicRelevanceModifyCanvasResume { readonly original: CurrentSchematicRelevanceModifyCanvasHeld; readonly ordinal: number; readonly target: Role | null }
export interface CurrentSchematicRelevanceModifyCanvasHost {
 readonly current: () => void;
 readonly request: (command: Command) => Promise<unknown>;
 readonly register: (role: Role, breakpointId: string, point: Readonly<{ scriptId: string; lineNumber: number; columnNumber: number }>) => void;
 readonly reserveOriginalResume: (event: DiagnosticEvent, role: Role) => void;
 readonly retire: (role: Role, breakpointId: string, originalEvent: DiagnosticEvent) => void;
 readonly fail: () => void;
}
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const functionHandles = z.strictObject({ onDataChange: handle, publishCanvas: handle });
const point = z.strictObject({ scriptId: handle, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() });
const frame = z.looseObject({ callFrameId: handle, location: point, functionLocation: point, returnValue: z.unknown().optional() });
const breakpointType = z.enum(["call", "return", "debuggerStatement"]).optional();
const possiblePoint = point.extend({ type: breakpointType });
const locations = z.array(possiblePoint).max(256);
const possible = z.strictObject({ locations });
const armFunction = z.strictObject({ breakpointId: handle }), armPoint = z.strictObject({ breakpointId: handle, actualLocation: point }), empty = z.strictObject({});
function need(value: boolean): asserts value { if (!value) { throw new Error("SCH_MODIFY_CANVAS_ORIGINAL"); } }
const returned = (role: Role): boolean => role === "publishCanvasReturned" || role === "onDataChangeReturned" || role === "timerReturned";

const originals = new WeakSet<object>();
export class CurrentSchematicRelevanceModifyCanvasController {
 readonly #host: CurrentSchematicRelevanceModifyCanvasHost; readonly #session: string; readonly #script: string; readonly #foreign: ReadonlySet<string>;
 readonly #points = new Map<string, Role>(); readonly #initial = Promise.withResolvers<CurrentSchematicRelevanceModifyCanvasHeld | null>(); readonly #timer = Promise.withResolvers<CurrentSchematicRelevanceModifyCanvasHeld | null>();
 #attempted = false; #armed = false; #parentSubmitted = false; #timerExpected = false; #failed = false; #ordinal = 0; #retireAttempted = false; #retired = false; #completed = false;
 #held: CurrentSchematicRelevanceModifyCanvasHeld | null = null; #reservation: CurrentSchematicRelevanceModifyCanvasResume | null = null; #submitted = false; #acknowledged = false; #resumed = false;
 #resumeSignal: PromiseWithResolvers<boolean> | null = null; #nextSignal: PromiseWithResolvers<CurrentSchematicRelevanceModifyCanvasHeld | null> | null = null;
 /** Bind the original worker and its already owned guards. This constructor
  * neither arms a point nor invokes a source or native function. */
 public constructor(host: CurrentSchematicRelevanceModifyCanvasHost, session: string, script: string, foreign: readonly string[]) { this.#host = host; this.#session = handle.parse(session); this.#script = handle.parse(script); this.#foreign = new Set(foreign); originals.add(this); }
 /** Reprove the same original owner before and after every bounded arm or
  * removal request; a failed await never restores this lane. */
 async #request(command: Command): Promise<unknown> { this.#host.current(); need(!this.#failed); const result = await this.#host.request(command); this.#host.current(); need(!this.#failed); return captureCurrentPcbStringClockReply(result).value; }
 /** Bind one native-acknowledged allocation, excluding all original parent
  * and CM IDs before it can become a routed Canvas source point. */
 #register(id: string, role: Role): void { need(!this.#points.has(id) && !this.#foreign.has(id)); this.#points.set(id, role); this.#host.register(role, id, { scriptId: this.#script, ...sourcePoint(role) }); }
 /** Source-created callbacks have no pre-existing handle. Arm only their
  * observed exact source points, plus two qualified original method handles. */
 public async arm(functions: Readonly<Record<FunctionRole, string>>): Promise<void> {
  try {
   need(!this.#attempted && !this.#failed); this.#attempted = true; const handles = functionHandles.parse(captureCurrentPcbStringClockReply(functions).value);
   for (const role of SOURCES) {
    const at = { scriptId: this.#script, ...sourcePoint(role) }, start = { scriptId: this.#script, ...functionPoint(role) };
    const available = possible.parse(await this.#request(validate({ phase: "modify-canvas-control-possible", role, method: "Debugger.getPossibleBreakpoints", params: { start, end: { ...at, columnNumber: at.columnNumber + 1 }, restrictToFunction: true } })));
    need(available.locations.filter(value => value.scriptId === at.scriptId && value.lineNumber === at.lineNumber && value.columnNumber === at.columnNumber && value.type === (returned(role) ? "return" : undefined)).length === 1);
    const armed = armPoint.parse(await this.#request(validate({ phase: "modify-canvas-control-point", role, method: "Debugger.setBreakpoint", params: { location: at, condition: "" } })));
    need(armed.actualLocation.scriptId === at.scriptId && armed.actualLocation.lineNumber === at.lineNumber && armed.actualLocation.columnNumber === at.columnNumber); this.#register(armed.breakpointId, role);
   }
   for (const role of FUNCTIONS) { const armed = armFunction.parse(await this.#request(validate({ phase: "modify-canvas-control-function", role, method: "Debugger.setBreakpointOnFunctionCall", params: { objectId: handles[role], condition: "" } }))); this.#register(armed.breakpointId, role); }
   need(this.#held === null && this.#points.size === ROLES.length); this.#armed = true;
  } catch (error) { this.fail(); throw error; }
 }
 /** Reprove all eight guards while the original CM onChange body is held. */
 public assertArmed(): void { this.#host.current(); need(!this.#failed && this.#armed && !this.#parentSubmitted && this.#held === null && this.#reservation === null); }
 /** Set only inside the actual original CM transfer after its async checks. */
 public markParentSubmitted(): void { this.assertArmed(); this.#parentSubmitted = true; }
 /** Require the exact original delivered event, never a copied frame packet. */
 public requireHeld(original: CurrentSchematicRelevanceModifyCanvasHeld): void { this.#host.current(); need(!this.#failed && this.#held === original); }
 /** Wait for the already-armed method entry without starting another reader. */
 public async waitInitial(): Promise<CurrentSchematicRelevanceModifyCanvasHeld> { need(this.#parentSubmitted); const value = await this.#initial.promise; need(value !== null); this.requireHeld(value); return value; }
 /** Timer entry can race the final enclosing CM ACK. Core marks expectation
  * synchronously at its actual terminal transfer and proves completion later. */
 public markTimerExpected(): void { this.#host.current(); need(!this.#failed && this.#parentSubmitted && !this.#timerExpected && this.#ordinal === 6 && this.#held === null && this.#reservation === null); this.#timerExpected = true; }
 /** Retain the observed timer body while its real CM/Nd joins finish. */
 public async waitTimer(): Promise<CurrentSchematicRelevanceModifyCanvasHeld> { need(this.#timerExpected); const value = await this.#timer.promise; need(value !== null); this.requireHeld(value); return value; }
 /** Spend a single source boundary before asynchronous native submission.
  * Data-return and timer-return releases are independently terminal. */
 public reserve(original: CurrentSchematicRelevanceModifyCanvasHeld): CurrentSchematicRelevanceModifyCanvasResume {
  this.requireHeld(original); need(this.#reservation === null && ROLES[this.#ordinal] === original.role && (original.role !== "timerReturned" || this.#retired));
  let target: Role | null = ROLES[this.#ordinal + 1] ?? null; if (original.role === "onDataChangeReturned") { target = null; }
  const value = Object.freeze({ original, ordinal: this.#ordinal, target }); this.#reservation = value; this.#submitted = false; this.#acknowledged = false; this.#resumed = false; this.#resumeSignal = Promise.withResolvers<boolean>(); this.#nextSignal = Promise.withResolvers<CurrentSchematicRelevanceModifyCanvasHeld | null>();
  try { this.#host.reserveOriginalResume(original.event, original.role); } catch (error) { this.fail(); throw error; } return value;
 }
 /** Reject replay and copied reservations immediately before transport. */
 public requireResume(value: CurrentSchematicRelevanceModifyCanvasResume): void { this.requireHeld(value.original); need(this.#reservation === value && !this.#submitted && !this.#resumed); }
 /** Establish submission after all original owner/state awaits have finished. */
 public markSubmitted(value: CurrentSchematicRelevanceModifyCanvasResume): void { this.requireResume(value); this.#submitted = true; }
 /** A response is one empty ACK, distinct from resumed or normal return. */
 public acknowledge(value: CurrentSchematicRelevanceModifyCanvasResume, reply: unknown): void { try { this.#host.current(); need(!this.#failed && this.#reservation === value && this.#submitted && !this.#acknowledged); empty.parse(captureCurrentPcbStringClockReply(reply).value); this.#acknowledged = true; } catch (error) { this.fail(); throw error; } }
 /** Join the actual original resumed event before consuming the next pause. */
 public async waitResumed(value: CurrentSchematicRelevanceModifyCanvasResume): Promise<void> { need(this.#reservation === value && this.#resumeSignal !== null); need(await this.#resumeSignal.promise); this.#host.current(); need(!this.#failed && this.#resumed); }
 /** Preserve either ACK/pause order without a second event reader. */
 public async complete(value: CurrentSchematicRelevanceModifyCanvasResume): Promise<CurrentSchematicRelevanceModifyCanvasHeld> { need(this.#reservation === value && value.target !== null && this.#submitted && this.#acknowledged && this.#resumed && this.#nextSignal !== null); const held = await this.#nextSignal.promise; need(held !== null && held.role === value.target && this.#reservation === value); this.requireHeld(held); this.#ordinal += 1; this.#reservation = null; return held; }
 /** The first segment returns only to the original onChange continuation.
  * The later timer segment completes only this guard lane, not its effects. */
 public completeReturned(value: CurrentSchematicRelevanceModifyCanvasResume): void { this.#host.current(); need(!this.#failed && this.#reservation === value && value.target === null && this.#submitted && this.#acknowledged && this.#resumed && this.#held === null && (value.ordinal === 5 || value.ordinal === 7 && this.#retired)); this.#ordinal += 1; this.#reservation = null; if (this.#ordinal === ROLES.length) { this.#completed = true; } }
 /** Remove the eight original points once, while their final timer return is
  * held. Core retires their routing epochs after each actual empty ACK. */
 public async retire(original: CurrentSchematicRelevanceModifyCanvasHeld): Promise<void> { this.requireHeld(original); need(original.role === "timerReturned" && this.#ordinal === ROLES.length - 1 && this.#reservation === null && !this.#retireAttempted); this.#retireAttempted = true; try { for (const [id, role] of this.#points) { empty.parse(await this.#request(validate({ phase: "modify-canvas-control-remove", role, method: "Debugger.removeBreakpoint", params: { breakpointId: id } }))); this.requireHeld(original); this.#host.retire(role, id, original.event); } this.#retired = true; } catch (error) { this.fail(); throw error; } }
 /** Require all original source guards and releases. Actual canvas/native
  * send, Promise, loopback, UI echo and Modify settlement remain separate. */
 public requireCompleted(): void { this.#host.current(); need(!this.#failed && this.#completed && this.#retired && this.#ordinal === ROLES.length && this.#held === null && this.#reservation === null); }
 /** Recognize only one owned hit at its exact callee and statement/return
  * coordinate. Receiver and descriptor proofs remain the collector’s job. */
 #role(event: DiagnosticEvent): Role | null {
  const frames = event.params["callFrames"], ids = event.params["hitBreakpoints"]; if (!Array.isArray(ids) || !Array.isArray(frames) || frames.length === 0) { return null; }
  const matches = ids.filter((id: unknown): id is string => typeof id === "string" && this.#points.has(id)); if (matches.length === 0) { return null; } need(ids.length === 1 && matches.length === 1); const role = this.#points.get(matches[0] ?? ""); need(role !== undefined); const at = sourcePoint(role), source = functionPoint(role), top = frame.parse(frames[0]);
  need(top.functionLocation.scriptId === this.#script && top.functionLocation.lineNumber === source.lineNumber && top.functionLocation.columnNumber === source.columnNumber && top.location.scriptId === this.#script && top.location.lineNumber === at.lineNumber && top.location.columnNumber === at.columnNumber);
  if (returned(role)) { z.strictObject({ type: z.literal("undefined") }).parse(top.returnValue); } return role;
 }
 /** Consume only owned source points and the single pending resumed event.
  * Unsolicited, duplicate, copied or early timer activity permanently refuses. */
 public observe(event: DiagnosticEvent): boolean {
  if (event.sessionId !== this.#session || this.#completed) { return false; }
  if (event.method === "Debugger.resumed") { if (this.#reservation === null) { return false; } try { this.#host.current(); need(!this.#failed && this.#submitted && !this.#resumed && this.#held === this.#reservation.original); empty.parse(event.params); this.#held = null; this.#resumed = true; this.#resumeSignal?.resolve(true); } catch { this.fail(); } return true; }
  if (event.method !== "Debugger.paused") { return false; }
  try {
   const role = this.#role(event); if (role === null) { return false; } this.#host.current(); need(!this.#failed && this.#armed && this.#parentSubmitted && this.#held === null && event.params["reason"] === "other");
   const initial = this.#ordinal === 0 && this.#reservation === null, timer = this.#ordinal === 6 && this.#reservation === null;
   if (initial) { need(role === "onDataChange"); } else if (timer) { need(this.#timerExpected && role === "timer"); } else { need(this.#reservation !== null && this.#submitted && this.#resumed && this.#reservation.target === role && this.#nextSignal !== null); }
   const frames = event.params["callFrames"]; need(Array.isArray(frames)); const top = frame.parse(frames[0]); let callerFrameId: string | null = null;
   if (role === "executor" || role === "publishCanvas" || role === "onDataChange") {
    const caller = frame.parse(frames[1]); let expected: Readonly<{ lineNumber: number; columnNumber: number; bytes: number }> = STRUCTURE.onChange;
    if (role === "executor") { expected = SOURCE.roles.sheetPublishCanvas; } else if (role === "publishCanvas") { expected = SOURCE.roles.sheetOnDataChange; }
    need(caller.functionLocation.scriptId === this.#script && caller.functionLocation.lineNumber === expected.lineNumber && caller.functionLocation.columnNumber === expected.columnNumber && caller.location.scriptId === this.#script && caller.location.lineNumber === expected.lineNumber && caller.location.columnNumber >= expected.columnNumber && caller.location.columnNumber < expected.columnNumber + expected.bytes); callerFrameId = caller.callFrameId;
   }
   const held = Object.freeze({ event, role, callFrameId: top.callFrameId, callerFrameId, canvasCompleted: false, modifyCompleted: false, saveAuthorized: false }); this.#held = held; if (initial) { this.#initial.resolve(held); } else if (timer) { this.#timer.resolve(held); } else { this.#nextSignal?.resolve(held); } return true;
  } catch { this.fail(); return true; }
 }
 /** Settle every retained waiter and spoil the original lane without
  * refunding any arm, removal or consumed native continuation. */
 public fail(): void { if (this.#failed) { return; } this.#failed = true; this.#initial.resolve(null); this.#timer.resolve(null); this.#resumeSignal?.resolve(false); this.#nextSignal?.resolve(null); this.#host.fail(); }
}

const originalPrototype = CurrentSchematicRelevanceModifyCanvasController.prototype;
const originalDescriptors = Object.getOwnPropertyDescriptors(originalPrototype);
for (const descriptor of Object.values(originalDescriptors)) { Object.freeze(descriptor); } Object.freeze(originalDescriptors);
const originalKeys = Object.freeze(Reflect.ownKeys(originalDescriptors));
/** Reprove the original branded controller before Core calls any method.
 * Unknown string/Symbol additions, descriptor changes and copied/Proxy
 * objects refuse without reflecting on an unbranded caller object. */
export function assertOriginalCurrentSchematicRelevanceModifyCanvasController(value: unknown): asserts value is CurrentSchematicRelevanceModifyCanvasController {
 need(typeof value === "object" && value !== null && originals.has(value) && Object.getPrototypeOf(value) === originalPrototype && Reflect.ownKeys(value).length === 0);
 const keys = Reflect.ownKeys(originalPrototype); need(keys.length === originalKeys.length && keys.every((key, index) => key === originalKeys[index]));
 for (const key of originalKeys) { const before: unknown = Reflect.getOwnPropertyDescriptor(originalDescriptors, key)?.value; const after = Object.getOwnPropertyDescriptor(originalPrototype, key); need(before !== null && typeof before === "object" && after !== undefined); const fields = Reflect.ownKeys(before), observedFields = Reflect.ownKeys(after); need(fields.length === observedFields.length && fields.every((field, index) => field === observedFields[index])); for (const field of fields) { need(Object.is(Reflect.get(before, field), Reflect.get(after, field))); } }
}
