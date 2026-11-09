/** Original fresh native-task GET RPC entry custody. The owner supplies its private
 * event/write provenance; these held-data receipts issue neither Call nor Job
 * authority and the controller deliberately contains no resume command. */
import { types } from "node:util";
import { z } from "zod";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import { currentFootprintInverseNativeGetTaskSenderPause as pause } from "./current-footprint-inverse-native-get-task-sender-replies.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_SENDER_ENTRY as ENTRY, CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_SENDER_PROGRAMS as P } from "./current-footprint-inverse-native-get-task-sender-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_SENDER_FLAGS as FLAGS, qualifyCurrentFootprintInverseNativeGetTaskSenderHelper as helperSource, validateCurrentFootprintInverseNativeGetTaskSenderCommand as validate } from "./current-footprint-inverse-native-get-task-sender-protocol.ts";
import type { CurrentFootprintInverseNativeGetTaskSenderCommand as Command } from "./current-footprint-inverse-native-get-task-sender-protocol.ts";
import type { CurrentFootprintInverseNativeGetTaskSenderPrepared as Prepared } from "./current-footprint-inverse-native-get-task-sender-collector.ts";
import { currentFootprintInverseLookupArray as array, currentFootprintInverseLookupObject as object, currentFootprintInverseLookupPoint as point, currentFootprintInverseLookupProperties as properties, currentFootprintInverseLookupResult as result } from "./current-footprint-inverse-lookup-preentry-replies.ts";
import { requireCurrentFootprintInversePublicServiceTrue as truth } from "./current-footprint-inverse-public-service-replies.ts";

export interface CurrentFootprintInverseNativeGetTaskInvocation {
  /** Exact original pipe request, retained while its genuine RPC is paused. */
  readonly request: Promise<unknown>;
  readonly written: Promise<void>;
  readonly assertOriginalWritten: () => void;
}
export interface CurrentFootprintInverseNativeGetTaskCallControllerBindings {
  readonly receipt: string;
  readonly prepared: Prepared;
  readonly sessionId: string;
  readonly contextId: number;
  readonly uiScriptId: string;
  /** Source-correlated prepare helper from this fresh qualification. */
  readonly preparedScriptId: string;
  readonly current: () => void;
  /** Original fresh native-task intent/readiness gate for this readonly GET.
   * No reference/collateral or DEL body authority is inferred. */
  readonly beforeInvoke: () => void;
  /** Checks this very event against the owner's actual original pipe delivery. */
  readonly assertOriginalEvent: (event: DiagnosticEvent) => void;
  readonly assertOriginalExit: () => void;
  readonly poll: () => Promise<void>;
  readonly send: (command: Command) => Promise<unknown>;
  /** Must retain the original request and acknowledged write, never a DTO. */
  readonly submit: (command: Command) => CurrentFootprintInverseNativeGetTaskInvocation | Promise<CurrentFootprintInverseNativeGetTaskInvocation>;
}
export interface CurrentFootprintInverseNativeGetTaskSenderHold { readonly profile: "private.current-footprint-inverse-native-get-task-sender-hold.v1" }
export interface CurrentFootprintInverseNativeGetTaskOriginalSenderHold {
  readonly event: DiagnosticEvent;
  readonly frame: string;
  readonly tuple: string;
  readonly request: Promise<unknown>;
  readonly runtimeCallIssued: false;
  readonly runtimeJobIssued: false;
  readonly dispatchAuthorized: false;
}
interface Helper { readonly command: Command; scriptId: string | null }
const originalControllers = new WeakSet<object>();
/** Reject a missing custody invariant before the next read or receipt. */
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_NATIVE_GET_TASK_CALL_CUSTODY"); } }

/** Retain one genuine original sender attempt through its still-held first
 * statement. Event identity, original write and helpers are independently
 * joined. This adapter supplies no Core issuer, body resume or worker permit. */
export class CurrentFootprintInverseNativeGetTaskCallController {
  readonly #b: CurrentFootprintInverseNativeGetTaskCallControllerBindings;
  #pending: Promise<CurrentFootprintInverseNativeGetTaskSenderHold> | null = null;
  #failed = false;
  #breakpoint: string | null = null;
  #helper: Helper | null = null;
  #invokeScript: string | null = null;
  #invocation: CurrentFootprintInverseNativeGetTaskInvocation | null = null;
  #settlement: Promise<void> | null = null;
  #queued: DiagnosticEvent | null = null;
  #held: DiagnosticEvent | null = null;
  #token: CurrentFootprintInverseNativeGetTaskSenderHold | null = null;
  #original: CurrentFootprintInverseNativeGetTaskOriginalSenderHold | null = null;
  #requests = 0;
  #invoked = false;
  #entryConsumed = false;

  /** Capture the private owner bindings before any asynchronous work starts. */
  public constructor(bindings: CurrentFootprintInverseNativeGetTaskCallControllerBindings) { this.#b = Object.freeze({ ...bindings }); originalControllers.add(this); }

  /** Sticky failure prevents every later read or receipt lookup. */
  #current(): void { try { this.#b.current(); need(!this.#failed); } catch (caughtError) { this.#failed = true; throw caughtError; } }

  /** Accept only the original context's one invocation helper and exact pause.
   * A second pause/helper or a resumed event permanently spoils this hold. */
  public observe(event: DiagnosticEvent): boolean {
    if (event.sessionId !== this.#b.sessionId || this.#entryConsumed) { return false; }
    try {
      this.#current(); this.#b.assertOriginalEvent(event);
      if (event.method === "Debugger.scriptParsed" && event.params["url"] === "") {
        const helper = this.#helper;
        need(helper !== null && helper.scriptId === null && event.params["executionContextId"] === this.#b.contextId && typeof event.params["scriptId"] === "string");
        helper.scriptId = event.params["scriptId"];
        if (helper.command.phase === "inverse-native-get-task-sender-invoke") { need(this.#invokeScript === null); this.#invokeScript = helper.scriptId; }
        return true;
      }
      if (event.method === "Debugger.paused") { need(this.#invoked && this.#breakpoint !== null && this.#queued === null && this.#held === null); this.#queued = event; return true; }
      if (event.method === "Debugger.resumed") { need(!this.#invoked); }
      return false;
    } catch (caughtError) { this.#failed = true; throw caughtError; }
  }

  /** A failed or concurrent start returns the same original retained Promise.
   * The attempt is spent synchronously before arm, publication or transport. */
  public start(): Promise<CurrentFootprintInverseNativeGetTaskSenderHold> {
    if (this.#pending !== null) { return this.#pending; }
    const pending = Promise.withResolvers<CurrentFootprintInverseNativeGetTaskSenderHold>(); this.#pending = pending.promise;
    void (async (): Promise<void> => { try { pending.resolve(await this.#run()); } catch (caughtError) { pending.reject(caughtError); } })(); return pending.promise;
  }

  /** Bound each fixed request, recheck custody around its await and correlate
   * every generated probe with its actual original helper-source delivery. */
  async #request(input: Command): Promise<unknown> {
    this.#current(); need(this.#helper === null && (this.#requests += 1) <= 32);
    const command = validate(input); need(command.phase !== "inverse-native-get-task-sender-invoke");
    let program: string | null = null;
    if (command.method === "Runtime.callFunctionOn") { program = command.params.functionDeclaration; }
    else if (command.method === "Debugger.evaluateOnCallFrame") { program = command.params.expression; }
    const helper: Helper | null = program === null ? null : { command, scriptId: null }; this.#helper = helper;
    try {
      this.#current(); const raw = await this.#b.send(command); this.#current();
      if (helper !== null) {
        need(helper === this.#helper && helper.scriptId !== null && (this.#requests += 1) <= 32);
        const source = await this.#b.send(validate({ phase: "inverse-native-get-task-sender-helper", method: "Debugger.getScriptSource", params: { scriptId: helper.scriptId } })); this.#current(); helperSource(source, command); this.#helper = null;
      }
      return raw;
    } catch (caughtError) { this.#failed = true; throw caughtError; }
  }

  /** Await an original pause without resolving or replacing its pending RPC. */
  async #wait(): Promise<DiagnosticEvent> {
    const started = performance.now();
    while (this.#queued === null) { this.#current(); need(performance.now() - started < 30_000); await this.#b.poll(); this.#current(); }
    const event = this.#queued; this.#queued = null; this.#held = event; return event;
  }

  /** Join write, complete original stack, both exact generated callers and
   * the twenty live entry operands before retaining the opaque hold. */
  async #run(): Promise<CurrentFootprintInverseNativeGetTaskSenderHold> {
    try {
      this.#current(); const b = this.#b, p = b.prepared; b.beforeInvoke();
      need(!p.publicCallConsumed && !p.applicationMethodInvoked && !p.runtimeJobIssued && !p.dispatchAuthorized && b.uiScriptId !== b.preparedScriptId);
      this.#breakpoint = point(await this.#request(validate({ phase: "inverse-native-get-task-sender-arm", method: "Debugger.setBreakpointOnFunctionCall", params: { objectId: p.originalRpc, condition: "" } }))); this.#current(); b.beforeInvoke();
      const command = validate({ phase: "inverse-native-get-task-sender-invoke", method: "Runtime.callFunctionOn", params: { ...FLAGS, throwOnSideEffect: false, objectId: b.receipt, functionDeclaration: P.invokeOnce, arguments: [{ objectId: p.prepared }], returnByValue: false } });
      need(this.#helper === null && !this.#invoked); this.#invoked = true; this.#helper = { command, scriptId: null };
      b.beforeInvoke(); const submitted = await b.submit(command);
      const invocation = Object.freeze({ request: submitted.request, written: submitted.written, assertOriginalWritten: submitted.assertOriginalWritten });
      need(types.isPromise(invocation.request) && types.isPromise(invocation.written)); this.#invocation = invocation;
      // Preserve the exact request for exit settlement without awaiting its
      // Reply while the original application function remains paused.
      this.#settlement = (async (): Promise<void> => { try { await invocation.request; } catch {
        // Original request failure remains retained by invocation.request.
      } finally { this.#failed = true; } })();
      await invocation.written; this.#current(); invocation.assertOriginalWritten();
      const event = await this.#wait(); this.#current(); invocation.assertOriginalWritten();
      need(this.#invokeScript !== null && this.#helper?.command === command && this.#helper.scriptId === this.#invokeScript);
      const scripts = { ui: b.uiScriptId, prepared: b.preparedScriptId, invoke: this.#invokeScript };
      const frame = pause(event, b.sessionId, scripts, this.#breakpoint);
      // The original prepare helper was correlated during qualification and
      // Is read again here. Stack coordinates alone never establish its bytes.
      this.#helper = null;
      for (const [scriptId, program] of [[scripts.prepared, P.prepare], [scripts.invoke, P.invokeOnce]] as const) {
        const source = await this.#request(validate({ phase: "inverse-native-get-task-sender-helper", method: "Debugger.getScriptSource", params: { scriptId } }));
        const raw = z.strictObject({ scriptSource: z.string().max(16_386) }).parse(capture(source)); need(raw.scriptSource === `(${program})`);
      }
      const tuple = result(await this.#request(validate({ phase: "inverse-native-get-task-sender-frame", method: "Debugger.evaluateOnCallFrame", params: { callFrameId: frame, expression: ENTRY, objectGroup: FLAGS.objectGroup, silent: true, generatePreview: false, throwOnSideEffect: true, returnByValue: false, includeCommandLineAPI: false } })), 20);
      const props = (objectId: string): Promise<unknown> => this.#request(validate({ phase: "inverse-native-get-task-sender-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } }));
      const values = array(await props(tuple), 20);
      for (const value of values) { if (value.type === "function" || value.type === "object" && value.subtype !== "null") { properties(await props(object(value))); } }
      truth(await this.#request(validate({ phase: "inverse-native-get-task-sender-call", role: "entry", method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: b.receipt, functionDeclaration: P.entry, arguments: [{ objectId: tuple }, { objectId: p.prepared }, { objectId: p.bus }, { objectId: p.taskMethods }], returnByValue: true } })));
      this.#current(); invocation.assertOriginalWritten(); b.assertOriginalEvent(event);
      const token: CurrentFootprintInverseNativeGetTaskSenderHold = Object.freeze({ profile: "private.current-footprint-inverse-native-get-task-sender-hold.v1" });
      this.#original = Object.freeze({ event, frame, tuple, request: invocation.request, runtimeCallIssued: false, runtimeJobIssued: false, dispatchAuthorized: false }); this.#token = token; return token;
    } catch (caughtError) { this.#failed = true; throw caughtError; }
  }

  /** Equal-shaped tokens and copied events cannot retrieve the retained hold.
   * This remains held-frame data, never a substitute for a Core Call issuer. */
  public requireOriginalHold(token: CurrentFootprintInverseNativeGetTaskSenderHold): CurrentFootprintInverseNativeGetTaskOriginalSenderHold {
    need(token === this.#token && !this.#entryConsumed);
    try {
      this.#current(); const invocation = this.#invocation, original = this.#original;
      need(original !== null && original.event === this.#held && invocation !== null && original.request === invocation.request);
      invocation.assertOriginalWritten(); this.#b.assertOriginalEvent(original.event);
      need(this.#breakpoint !== null && this.#invokeScript !== null); pause(original.event, this.#b.sessionId, { ui: this.#b.uiScriptId, prepared: this.#b.preparedScriptId, invoke: this.#invokeScript }, this.#breakpoint); return original;
    } catch (caughtError) { this.#failed = true; throw caughtError; }
  }

  /** Retrieve the actual original point and both source-correlated generated
   * callers before transfer. Matching copies cannot retrieve these originals. */
  public originalTransitionData(original: CurrentFootprintInverseNativeGetTaskOriginalSenderHold): Readonly<{ point: string; scripts: Readonly<{ ui: string; prepared: string; invoke: string }> }> {
    need(original === this.#original && this.#token !== null); this.requireOriginalHold(this.#token); need(this.#breakpoint !== null && this.#invokeScript !== null);
    return Object.freeze({ point: this.#breakpoint, scripts: Object.freeze({ ui: this.#b.uiScriptId, prepared: this.#b.preparedScriptId, invoke: this.#invokeScript }) });
  }
  /** Spend the original held entry only at the actual guarded resume seam.
   * Its pending request is still retained for a new origin and exit cleanup. */
  public consumeOriginalHold(original: CurrentFootprintInverseNativeGetTaskOriginalSenderHold): void { this.originalTransitionData(original); this.#entryConsumed = true; }

  /** Original-exit cleanup joins the same pending transport, including failure.
   * Merely calling this method cannot establish exit or release native custody. */
  public async settleAfterOriginalExit(): Promise<void> {
    this.#b.assertOriginalExit(); this.#failed = true;
    await Promise.allSettled([this.#pending, this.#settlement]); this.#b.assertOriginalExit();
  }
}

const originalMethods = Object.getOwnPropertyDescriptors(CurrentFootprintInverseNativeGetTaskCallController.prototype);
/** Require this module's private instance and unchanged complete prototype. */
export function assertOriginalCurrentFootprintInverseNativeGetTaskCallController(value: CurrentFootprintInverseNativeGetTaskCallController): void {
  need(value !== null && typeof value === "object" && !types.isProxy(value) && originalControllers.has(value) && Object.getPrototypeOf(value) === CurrentFootprintInverseNativeGetTaskCallController.prototype && Reflect.ownKeys(value).length === 0);
  const observed = Object.getOwnPropertyDescriptors(CurrentFootprintInverseNativeGetTaskCallController.prototype); need(Reflect.ownKeys(observed).length === Reflect.ownKeys(originalMethods).length && Object.entries(originalMethods).every(([name, d]) => { const now = observed[name]; return now !== undefined && now.value === d.value && now.get === d.get && now.set === d.set && now.writable === d.writable && now.enumerable === d.enumerable && now.configurable === d.configurable; }));
}
