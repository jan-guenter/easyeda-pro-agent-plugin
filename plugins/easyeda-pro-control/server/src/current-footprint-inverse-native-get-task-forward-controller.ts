/** One original inner RPC continuation to a held native IGIVE normal return.
 * Public Calls and the readonly worker preparation ledger remain untouched. */
import { types } from "node:util";
import { z } from "zod";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_FORWARD_REQUESTS as LIMIT, currentFootprintInverseNativeGetTaskForwardProgram as program, qualifyCurrentFootprintInverseNativeGetTaskForwardHelper as qualify, validateCurrentFootprintInverseNativeGetTaskForwardCommand as validate } from "./current-footprint-inverse-native-get-task-forward-protocol.ts";
import type { CurrentFootprintInverseNativeGetTaskForwardCommand as Command } from "./current-footprint-inverse-native-get-task-forward-protocol.ts";
import { currentFootprintInverseNativeGetTaskForwardPause as pause } from "./current-footprint-inverse-native-get-task-forward-replies.ts";
import type { CurrentFootprintInverseGetSendHeld as Held } from "./current-footprint-inverse-get-send-replies.ts";
import type { CURRENT_FOOTPRINT_INVERSE_GET_SEND_POINTS as POINTS } from "./current-footprint-inverse-get-send-source.ts";
import { observeCurrentFootprintInverseNativeGetTaskForward as observe } from "./current-footprint-inverse-native-get-task-forward-observer.ts";
import type { CurrentFootprintInverseNativeGetTaskForwardBindings as ObserverBindings, CurrentFootprintInverseNativeGetTaskForwardReceipt as Receipt } from "./current-footprint-inverse-native-get-task-forward-observer.ts";

export interface CurrentFootprintInverseNativeGetTaskForwardBindings extends Omit<ObserverBindings, "request" | "armed" | "wait" | "resumed"> {
  readonly sessionId: string; readonly contextId: number;
  readonly assertOriginalEvent: (event: DiagnosticEvent) => void; readonly assertOriginalExit: () => void;
  readonly send: (command: Command) => Promise<unknown>; readonly poll: () => Promise<void>;
  /** Reprove after all submission awaits, and spend the original channel hold
   * only inside the first actual transport callback. */
  readonly resume: (command: Command, beforeTransfer: () => void) => Promise<unknown>;
}
export interface CurrentFootprintInverseNativeGetTaskForwardHold { readonly profile: "private.current-footprint-inverse-native-get-task-forward-hold.v1" }
export interface CurrentFootprintInverseNativeGetTaskForwardOriginal { readonly event: DiagnosticEvent; readonly receipt: Receipt; readonly runtimeJobIssued: false; readonly getBodyAuthorized: false }
interface Helper { readonly command: Command; readonly source: string; scriptId: string | null }
const originals = new WeakSet<object>();
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_NATIVE_GET_TASK_FORWARD_CUSTODY"); } }
/** Retain each actual pause/helper/request and its original settlement. A
 * copied event, duplicate resume or failed dependency permanently closes it. */
export class CurrentFootprintInverseNativeGetTaskForwardController {
  readonly #b: CurrentFootprintInverseNativeGetTaskForwardBindings;
  readonly #points = new Map<string, keyof typeof POINTS>();
  #pending: Promise<CurrentFootprintInverseNativeGetTaskForwardHold> | null = null;
  #helper: Helper | null = null; #queued: DiagnosticEvent | null = null; #held: DiagnosticEvent | null = null;
  #token: CurrentFootprintInverseNativeGetTaskForwardHold | null = null; #original: CurrentFootprintInverseNativeGetTaskForwardOriginal | null = null;
  #consumed = false; #requests = 0; #helpers = 0; #pauses = 0; #resumes = 0; #failed = false; #requesting = false; #awaitingResume = false; #resumed = false;
  /** Keep only this original owner's closures and exact channel-held event. */
  public constructor(bindings: CurrentFootprintInverseNativeGetTaskForwardBindings) { this.#b = Object.freeze({ ...bindings }); this.#held = bindings.original.event; originals.add(this); }
  /** Reprove original owner/invocation custody without replaying spent holds. */
  #current(): void { try { this.#b.current(); need(!this.#failed); } catch (caughtError) { this.#failed = true; throw caughtError; } }
  /** Accept only original same-session helpers and one pause after each actual
   * resumed event. Source/stack validation runs before any frame traversal. */
  public observe(event: DiagnosticEvent): boolean { if (event.sessionId !== this.#b.sessionId || this.#consumed) { return false; } try { this.#current(); this.#b.assertOriginalEvent(event);
    if (event.method === "Debugger.scriptParsed" && event.params["url"] === "") { const helper = this.#helper; need(helper !== null && helper.scriptId === null && event.params["executionContextId"] === this.#b.contextId && typeof event.params["scriptId"] === "string"); helper.scriptId = event.params["scriptId"]; return true; }
    if (event.method === "Debugger.resumed") { need(this.#awaitingResume && !this.#resumed); this.#awaitingResume = false; this.#resumed = true; this.#held = null; return true; }
    if (event.method === "Debugger.paused") { need(this.#resumed && !this.#awaitingResume && this.#queued === null && this.#held === null && (this.#pauses += 1) <= LIMIT.events); pause(event, this.#b.sessionId, this.#b.scripts, this.#points); this.#queued = event; return true; } return false;
  } catch (caughtError) { this.#failed = true; throw caughtError; } }
  /** Burn start synchronously and retain the exact original outer Promise. */
  public start(): Promise<CurrentFootprintInverseNativeGetTaskForwardHold> { if (this.#pending !== null) { return this.#pending; } const pending = Promise.withResolvers<CurrentFootprintInverseNativeGetTaskForwardHold>(); this.#pending = pending.promise; void (async (): Promise<void> => { try { const receipt = await observe({ ...this.#b, request: (command): Promise<unknown> => this.#read(command),
      /** Retain one point per fixed role before the original native arm ACK;
       * duplicate points or roles fail rather than replacing held custody. */
      armed: async (role, point): Promise<void> => { this.#current(); need(!this.#points.has(point) && ![...this.#points.values()].includes(role)); this.#points.set(point, role); await this.#b.control("armed", { pointRole: role, breakpointId: point }); this.#current(); }, wait: (): Promise<Held> => this.#wait(), resumed: (): Promise<void> => this.#waitResumed() }); this.#current(); need(this.#held !== null && this.#helper === null && !this.#requesting && receipt.heldReturn.role === "postReturned" && this.#points.get(receipt.postReturnedPoint) === "postReturned" && this.#points.get(receipt.onMessagePoint) === "onMessage"); const same = pause(this.#held, this.#b.sessionId, this.#b.scripts, this.#points); need(same.frame === receipt.heldReturn.frame && same.role === "postReturned"); const token = Object.freeze({ profile: "private.current-footprint-inverse-native-get-task-forward-hold.v1" } as const); this.#original = Object.freeze({ event: this.#held, receipt, runtimeJobIssued: false, getBodyAuthorized: false }); this.#token = token; pending.resolve(token); } catch (caughtError) { this.#failed = true; pending.reject(caughtError); } })(); return pending.promise; }
  /** Submit one finite request and qualify its actual helper before exposing
   * the reply. Resume state is set only in the actual transfer callback. */
  async #read(input: Command): Promise<unknown> { try { this.#current(); need(!this.#requesting && this.#helper === null && this.#original === null && (this.#requests += 1) <= LIMIT.cdpRequests); this.#requesting = true; const command = validate(input); const source = program(command); const helper: Helper | null = source === null ? null : { command, source, scriptId: null }; this.#helper = helper; let raw: unknown;
    if (command.method === "Debugger.resume") { need(this.#held !== null && this.#queued === null && !this.#awaitingResume && (this.#resumes += 1) <= LIMIT.resumes); raw = await this.#b.resume(command, (): void => { this.#current(); need(!this.#awaitingResume && this.#held !== null); this.#awaitingResume = true; this.#resumed = false; }); } else { raw = await this.#b.send(command); } this.#current();
    if (helper !== null) { need(this.#helper === helper && helper.scriptId !== null && (this.#helpers += 1) <= LIMIT.helpers && (this.#requests += 1) <= LIMIT.cdpRequests); const actual = await this.#b.send(validate({ phase: "inverse-native-get-task-forward-helper", method: "Debugger.getScriptSource", params: { scriptId: helper.scriptId } })); this.#current(); qualify(actual, source ?? ""); this.#helper = null; }
    if (command.method === "Debugger.removeBreakpoint") { z.strictObject({}).parse(capture(raw)); this.#points.delete(command.params.breakpointId); } return raw;
  } catch (caughtError) { this.#failed = true; throw caughtError; } finally { this.#requesting = false; } }
  /** Wait only on this original event stream with a finite deadline. */
  async #wait(): Promise<Held> { const started = performance.now(); while (this.#queued === null) { this.#current(); need(performance.now() - started < 30_000); await this.#b.poll(); this.#current(); } const event = this.#queued; this.#queued = null; this.#held = event; this.#b.assertOriginalEvent(event); return pause(event, this.#b.sessionId, this.#b.scripts, this.#points); }
  /** Join the actual resumed notification rather than accepting an empty ACK
   * as proof that the original paused source continuation ran. */
  async #waitResumed(): Promise<void> { const started = performance.now(); while (!this.#resumed) { this.#current(); need(performance.now() - started < 30_000); await this.#b.poll(); this.#current(); } await this.#b.control("resumed"); this.#current(); }
  /** Require this same final return pause and receipt. Matching JSON cannot
   * replace its native source, invocation Promise or original UI event. */
  public requireOriginalHold(token: CurrentFootprintInverseNativeGetTaskForwardHold): CurrentFootprintInverseNativeGetTaskForwardOriginal { this.#current(); need(!this.#consumed && token === this.#token && this.#original !== null && this.#original.event === this.#held && !this.#awaitingResume && this.#queued === null); this.#b.assertOriginalEvent(this.#original.event); const selected = pause(this.#original.event, this.#b.sessionId, this.#b.scripts, this.#points); need(selected.role === "postReturned" && selected.frame === this.#original.receipt.heldReturn.frame); return this.#original; }
  /** Spend this exact original UI hold once, synchronously inside the later
   * Core transfer callback. Historical receipt data survives without granting
   * a second resume or observing events belonging to the new result lane. */
  public consumeOriginalHold(token: CurrentFootprintInverseNativeGetTaskForwardHold): void { this.requireOriginalHold(token); this.#consumed = true; this.#held = null; }
  /** Join the same in-flight proof only after actual original root/Job exit. */
  public async settleAfterOriginalExit(): Promise<void> { this.#b.assertOriginalExit(); this.#failed = true; await Promise.allSettled([this.#pending]); this.#b.assertOriginalExit(); }
}
const methods = Object.getOwnPropertyDescriptors(CurrentFootprintInverseNativeGetTaskForwardController.prototype);
/** Refuse copied controllers, Proxy traps and substituted prototype members. */
export function assertOriginalCurrentFootprintInverseNativeGetTaskForwardController(value: CurrentFootprintInverseNativeGetTaskForwardController): void { need(value !== null && typeof value === "object" && !types.isProxy(value) && originals.has(value) && Object.getPrototypeOf(value) === CurrentFootprintInverseNativeGetTaskForwardController.prototype && Reflect.ownKeys(value).length === 0); const observed = Object.getOwnPropertyDescriptors(CurrentFootprintInverseNativeGetTaskForwardController.prototype); need(Reflect.ownKeys(observed).length === Reflect.ownKeys(methods).length && Object.entries(methods).every(([name, d]) => { const now = observed[name]; return now !== undefined && now.value === d.value && now.get === d.get && now.set === d.set && now.writable === d.writable && now.enumerable === d.enumerable && now.configurable === d.configurable; })); }
