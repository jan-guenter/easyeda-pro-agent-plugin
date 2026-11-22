/* oxlint-disable import/max-dependencies -- Original source/packet/native metadata, fixed grammar and both genuine event/exit boundaries remain independently qualified. */
/** Original RPC-prefix continuation to its actual registered callback. The
 * old hold burns at the real guarded resume; this controller issues no Job. */
import { types } from "node:util";
import { z } from "zod";
import type {CurrentFootprintInverseNativeReferenceNextKind as Kind} from "./current-footprint-inverse-native-reference-next-sender-protocol.ts";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import type { CurrentFootprintInverseNativeReferenceNextSenderPrepared as Sender } from "./current-footprint-inverse-native-reference-next-sender-collector.ts";
import type { CurrentFootprintInverseNativeReferenceNextDependencyGraph as Dependencies } from "./current-footprint-inverse-native-reference-next-dependencies-collector.ts";
import type { CurrentFootprintInverseGetIntrinsicGraph as Native } from "./current-footprint-inverse-get-intrinsics-collector.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_CALLBACK_CALLS as CALLS, CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_CALLBACK_FLAGS as FLAGS, qualifyCurrentFootprintInverseNativeReferenceNextCallbackHelper as qualify, validateCurrentFootprintInverseNativeReferenceNextCallbackCommand as validate } from "./current-footprint-inverse-native-reference-next-callback-protocol.ts";
import type { CurrentFootprintInverseNativeReferenceNextCallbackCommand as Command } from "./current-footprint-inverse-native-reference-next-callback-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_CALLBACK_PROGRAMS as ALL, CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_CALLBACK_EXPRESSIONS as EXPRESSIONS } from "./current-footprint-inverse-native-reference-next-callback-programs.ts";
import { currentFootprintInverseNativeReferenceNextCallbackPause as pause } from "./current-footprint-inverse-native-reference-next-callback-replies.ts";
import { currentFootprintInverseLookupArray as array, currentFootprintInverseLookupObject as object, currentFootprintInverseLookupPoint as point, currentFootprintInverseLookupProperties as properties, currentFootprintInverseLookupResult as result } from "./current-footprint-inverse-lookup-preentry-replies.ts";
import { requireCurrentFootprintInversePublicServiceTrue as truth } from "./current-footprint-inverse-public-service-replies.ts";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";

export interface CurrentFootprintInverseNativeReferenceNextCallbackBindings {
  readonly kind:Kind; readonly receipt: string; readonly originalRpcFrame: string; readonly originalFrame: string; readonly originalPoint: string; readonly sender: Sender; readonly dependencies: Pick<Dependencies,"module"|"handler"|"callbackId">; readonly native: Omit<Native, "reprove">;
  readonly sessionId: string; readonly contextId: number; readonly scripts: Readonly<{ ui: string; prepared: string; invoke: string }>;
  readonly current: () => void; readonly assertOriginalEvent: (event: DiagnosticEvent) => void; readonly assertOriginalExit: () => void;
  readonly send: (command: Command) => Promise<unknown>; readonly poll: () => Promise<void>;
  /** The owner invokes beforeTransfer only immediately before the actual
   * transport submission after its async owner/artifact checks. */
  readonly resume: (command: Command, beforeTransfer: () => void) => Promise<unknown>;
  readonly control: (phase: "prepared" | "armed" | "resuming" | "held" | "complete", point?: string) => Promise<void>;
}
export interface CurrentFootprintInverseNativeReferenceNextCallbackHold { readonly profile: "private.current-footprint-inverse-native-reference-next-callback-hold.v1" }
export interface CurrentFootprintInverseNativeReferenceNextCallbackOriginal {
  readonly event: DiagnosticEvent; readonly point: string; readonly frame: string; readonly lexicals: string; readonly caller: string; readonly prepared: string; readonly payload: string; readonly argument: string;
  readonly rpcPrefixExecuted: true; readonly callbackBodyAuthorized: false; readonly runtimeJobIssued: false;
}
interface Helper { readonly command: Command; scriptId: string | null }
const originals = new WeakSet<object>();
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_NATIVE_REFERENCE_NEXT_CALLBACK_CUSTODY"); } }

/** Retain one original callback entry after one actual original RPC resume.
 * Every helper/read is bounded, and old pre-attempt guards are never invoked
 * after transfer. A copied event or helper permanently spoils the lane. */
export class CurrentFootprintInverseNativeReferenceNextCallbackController {
  readonly #b: CurrentFootprintInverseNativeReferenceNextCallbackBindings;
  #pending: Promise<CurrentFootprintInverseNativeReferenceNextCallbackHold> | null = null;
  #failed = false; #transferred = false; #resumed = false; #resumeAttempted = false;
  #helper: Helper | null = null; #point: string | null = null;
  #queued: DiagnosticEvent | null = null; #held: DiagnosticEvent | null = null;
  #token: CurrentFootprintInverseNativeReferenceNextCallbackHold | null = null;
  #original: CurrentFootprintInverseNativeReferenceNextCallbackOriginal | null = null;
  #requests = 0; #entryConsumed = false;
  /** Capture only the original private owner-provided bindings. */
  public constructor(bindings: CurrentFootprintInverseNativeReferenceNextCallbackBindings) { this.#b = Object.freeze({ ...bindings }); originals.add(this); }
  /** Reprove current original custody and keep the first failure sticky. */
  #current(): void { try { this.#b.current(); need(!this.#failed); } catch (caughtError) { this.#failed = true; throw caughtError; } }
  /** Accept only the owner's actual helper, resumed event and one callback
   * pause from the same original UI context/session. */
  public observe(event: DiagnosticEvent): boolean {
    if (this.#entryConsumed || event.sessionId !== this.#b.sessionId) { return false; }
    try { this.#current(); this.#b.assertOriginalEvent(event);
      if (event.method === "Debugger.scriptParsed" && event.params["url"] === "") { const helper = this.#helper; need(helper !== null && helper.scriptId === null && event.params["executionContextId"] === this.#b.contextId && typeof event.params["scriptId"] === "string"); helper.scriptId = event.params["scriptId"]; return true; }
      if (event.method === "Debugger.resumed") { need(this.#transferred && !this.#resumed && this.#held === null); this.#resumed = true; return true; }
      if (event.method === "Debugger.paused") { need(this.#transferred && this.#resumed && this.#point !== null && this.#queued === null && this.#held === null); this.#queued = event; return true; }
      return false;
    } catch (caughtError) { this.#failed = true; throw caughtError; }
  }
  /** Spend the first start synchronously and retain its exact Promise. */
  public start(): Promise<CurrentFootprintInverseNativeReferenceNextCallbackHold> { if (this.#pending !== null) { return this.#pending; } const pending = Promise.withResolvers<CurrentFootprintInverseNativeReferenceNextCallbackHold>(); this.#pending = pending.promise; void (async (): Promise<void> => { try { pending.resolve(await this.#run()); } catch (caughtError) { pending.reject(caughtError); } })(); return pending.promise; }
  /** Issue only one literal read and its exact original helper-source join. */
  async #read(input: Command): Promise<unknown> {
    this.#current(); const command = validate({...input,queryKind:this.#b.kind}); need(command.method !== "Debugger.resume" && this.#helper === null && (this.#requests += 1) <= 31);
    const helper: Helper | null = command.method === "Runtime.callFunctionOn" || command.method === "Debugger.evaluateOnCallFrame" ? { command, scriptId: null } : null; this.#helper = helper;
    try { const raw = await this.#b.send(command); this.#current(); if (helper !== null) { need(this.#helper === helper && helper.scriptId !== null && (this.#requests += 1) <= 31); const source = await this.#b.send(validate({ queryKind:this.#b.kind,phase: "inverse-native-reference-next-callback-helper", method: "Debugger.getScriptSource", params: { scriptId: helper.scriptId } })); this.#current(); qualify(source, command); this.#helper = null; } return raw; } catch (caughtError) { this.#failed = true; throw caughtError; }
  }
  /** Validate opaque metadata before traversing newly returned tuple members. */
  async #tuple(role: "prepare" | "payload", references: readonly string[]): Promise<Readonly<{ id: string; values: ReturnType<typeof array> }>> { const id = result(await this.#call(role, references), CALLS[role].size); const values = array(await this.#props(id), CALLS[role].size); for (const value of values) { if (value.type === "function" || value.type === "object" && value.subtype !== "null") { properties(await this.#props(object(value))); } } return { id, values }; }
  /** Read one already selected object's complete non-accessor packet. */
  #props(objectId: string): Promise<unknown> { return this.#read(validate({ queryKind:this.#b.kind,phase: "inverse-native-reference-next-callback-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } })); }
  /** Select only a fixed role and its exact original reference arity. */
  #call(role: keyof typeof CALLS, references: readonly string[]): Promise<unknown> { return this.#read(validate({ queryKind:this.#b.kind,phase: "inverse-native-reference-next-callback-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: this.#b.receipt, functionDeclaration: ALL[this.#b.kind][role], arguments: references.map(objectId => ({ objectId })), returnByValue: CALLS[role].size === 0 } })); }
  /** Retain a fresh frame tuple, keeping its opaque members untraversed until
   * the next fixed program has compared their known JS identities. */
  async #frame(role: keyof typeof EXPRESSIONS, callFrameId: string): Promise<Readonly<{ id: string; values: ReturnType<typeof array> }>> { const id = result(await this.#read(validate({ queryKind:this.#b.kind,phase: "inverse-native-reference-next-callback-frame", role, method: "Debugger.evaluateOnCallFrame", params: { callFrameId, expression: EXPRESSIONS[role], objectGroup: FLAGS.objectGroup, silent: true, generatePreview: false, throwOnSideEffect: true, returnByValue: false, includeCommandLineAPI: false } })), 20); return { id, values: array(await this.#props(id), 20) }; }
  /** Pump only original events while retaining the same pending invocation. */
  async #wait(): Promise<DiagnosticEvent> {
    const deadline = performance.now() + 30_000;
    while (this.#queued === null) {
      this.#current();
      need(performance.now() < deadline);
      await this.#b.poll();
      this.#current();
      need(performance.now() < deadline);
    }
    const event = this.#queued;
    this.#queued = null;
    this.#held = event;
    return event;
  }
  /** Prepare the exact prefix, reprove a fresh original RPC frame, spend the
   * old entry at actual resume and qualify the actual callback before receipt. */
  async #run(): Promise<CurrentFootprintInverseNativeReferenceNextCallbackHold> {
    try { this.#current(); const b = this.#b; const s = b.sender; const g = b.dependencies; const n = b.native;
      const prepared = await this.#tuple("prepare", [b.originalFrame, s.prepared, s.context, s.bus, s.methods, s.queue, s.task, s.members, s.taskMethods, g.module, n.roots, n.members, n.qualified]); await b.control("prepared"); this.#current();
      this.#point = point(await this.#read(validate({ queryKind:this.#b.kind,phase: "inverse-native-reference-next-callback-arm", method: "Debugger.setBreakpointOnFunctionCall", params: { objectId: g.callbackId, condition: "" } }))); await b.control("armed", this.#point); this.#current();
      const fresh = await this.#frame("rpc", b.originalRpcFrame); truth(await this.#call("before", [prepared.id, fresh.id, b.originalFrame]));
      const removed = await this.#read(validate({ queryKind:this.#b.kind,phase: "inverse-native-reference-next-callback-remove", method: "Debugger.removeBreakpoint", params: { breakpointId: b.originalPoint } })); z.strictObject({}).parse(capture(removed)); await b.control("resuming"); this.#current(); need(!this.#resumeAttempted); this.#resumeAttempted = true; need((this.#requests += 1) <= 31);
      const resumed = await b.resume(validate({ queryKind:this.#b.kind,phase: "inverse-native-reference-next-callback-resume", method: "Debugger.resume", params: {} }), (): void => { this.#current(); need(!this.#transferred && this.#resumeAttempted); this.#transferred = true; }); this.#current(); need(this.#transferred); z.strictObject({}).parse(capture(resumed));
      const event = await this.#wait(); b.assertOriginalEvent(event); need(this.#point !== null); const held = pause(event, b.sessionId, b.scripts, this.#point,b.kind); await b.control("held"); this.#current();
      const frame = await this.#frame("callback", held.callback); const caller = await this.#frame("rpc", held.caller); truth(await this.#call("lexical", [frame.id, caller.id, b.originalFrame, prepared.id, g.module, g.handler, n.roots]));
      const argument = frame.values[1]; need(argument !== undefined); properties(await this.#props(object(argument))); const payload = await this.#tuple("payload", [frame.id, prepared.id]);
      truth(await this.#call("entry", [frame.id, caller.id, b.originalFrame, prepared.id, payload.id])); need(this.#requests === 31); await b.control("complete"); this.#current();
      const cloned = payload.values[0]; need(cloned !== undefined); const token: CurrentFootprintInverseNativeReferenceNextCallbackHold = Object.freeze({ profile: "private.current-footprint-inverse-native-reference-next-callback-hold.v1" }); this.#original = Object.freeze({ event, point: this.#point, frame: held.callback, lexicals: frame.id, caller: held.caller, prepared: prepared.id, payload: payload.id, argument: object(cloned), rpcPrefixExecuted: true, callbackBodyAuthorized: false, runtimeJobIssued: false }); this.#token = token; return token;
    } catch (caughtError) { this.#failed = true; throw caughtError; }
  }
  /** Copied tokens/events cannot retrieve this actual callback hold. */
  public requireOriginalHold(token: CurrentFootprintInverseNativeReferenceNextCallbackHold): CurrentFootprintInverseNativeReferenceNextCallbackOriginal { this.#current(); need(!this.#entryConsumed && token === this.#token && this.#original !== null && this.#original.event === this.#held && this.#point !== null); this.#b.assertOriginalEvent(this.#original.event); pause(this.#original.event, this.#b.sessionId, this.#b.scripts, this.#point,this.#b.kind); return this.#original; }
  /** Retain only the original source identities before consuming this actual
   * callback. The original event and fixed stack are reproved first. */
  public originalTransitionData(original: CurrentFootprintInverseNativeReferenceNextCallbackOriginal): Readonly<{ scripts: CurrentFootprintInverseNativeReferenceNextCallbackBindings["scripts"] }> { this.#current(); need(!this.#entryConsumed && original === this.#original && this.#token !== null); this.requireOriginalHold(this.#token); return Object.freeze({ scripts: this.#b.scripts }); }
  /** Spend this exact callback only inside the owner's actual guarded resume.
   * Later origins cannot ask this completed hold for new permission. */
  public consumeOriginalHold(original: CurrentFootprintInverseNativeReferenceNextCallbackOriginal): void { this.originalTransitionData(original); this.#entryConsumed = true; }
  /** Join the same in-flight proof after independently observed original exit. */
  public async settleAfterOriginalExit(): Promise<void> { this.#b.assertOriginalExit(); this.#failed = true; await Promise.allSettled([this.#pending]); this.#b.assertOriginalExit(); }
}
const methods = Object.getOwnPropertyDescriptors(CurrentFootprintInverseNativeReferenceNextCallbackController.prototype);
/** Refuse copied instances, Proxy traps and any substituted prototype member. */
export function assertOriginalCurrentFootprintInverseNativeReferenceNextCallbackController(value: CurrentFootprintInverseNativeReferenceNextCallbackController): void { need(value !== null && typeof value === "object" && !types.isProxy(value) && originals.has(value) && Object.getPrototypeOf(value) === CurrentFootprintInverseNativeReferenceNextCallbackController.prototype && Reflect.ownKeys(value).length === 0); const observed = Object.getOwnPropertyDescriptors(CurrentFootprintInverseNativeReferenceNextCallbackController.prototype); need(Reflect.ownKeys(observed).length === Reflect.ownKeys(methods).length && Object.entries(methods).every(([name, d]) => { const now = observed[name]; return now !== undefined && now.value === d.value && now.get === d.get && now.set === d.set && now.writable === d.writable && now.enumerable === d.enumerable && now.configurable === d.configurable; })); }
