/** Original native lookup entry custody. The retained invocation and original
 * first-frame event supply no worker acceptance, GetJob or body permit. */
import { types } from "node:util";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_LOOKUP_FRAME as FRAME, CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_LOOKUP_PROGRAMS as P } from "./current-footprint-inverse-native-get-lookup-programs.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_LOOKUP_FLAGS as FLAGS, CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_LOOKUP_REQUESTS as LIMIT, qualifyCurrentFootprintInverseNativeGetLookupHelper as helperSource, currentFootprintInverseNativeGetLookupProgram as program, validateCurrentFootprintInverseNativeGetLookupCommand as validate } from "./current-footprint-inverse-native-get-lookup-protocol.ts";
import type { CurrentFootprintInverseNativeGetLookupCommand as Command } from "./current-footprint-inverse-native-get-lookup-protocol.ts";
import { currentFootprintInverseLookupArray as array, currentFootprintInverseLookupObject as object, currentFootprintInverseLookupPoint as point, currentFootprintInverseLookupProperties as properties, currentFootprintInverseLookupResult as result } from "./current-footprint-inverse-lookup-preentry-replies.ts";
import { requireCurrentFootprintInversePublicLookupDescription as description, decodeCurrentFootprintInversePublicLookupFunction as metadata } from "./current-footprint-inverse-public-lookup-replies.ts";
import { requireCurrentFootprintInversePublicServiceTrue as truth } from "./current-footprint-inverse-public-service-replies.ts";
import { currentFootprintInverseNativeGetLookupPause as pause } from "./current-footprint-inverse-native-get-lookup-replies.ts";

export interface CurrentFootprintInverseNativeGetLookupInvocation { readonly request: Promise<unknown>; readonly written: Promise<void>; readonly assertOriginalWritten: () => void }
export interface CurrentFootprintInverseNativeGetLookupBindings {
  readonly receipt: string; readonly scope: string; readonly sender: string; readonly uiScriptId: string; readonly sessionId: string; readonly contextId: number;
  readonly target: Readonly<{ projectUuid: string; branchUuid: string; documentUuid: string }>;
  readonly current: () => void; readonly beforeInvoke: () => void;
  readonly assertOriginalEvent: (event: DiagnosticEvent) => void; readonly assertOriginalExit: () => void;
  readonly poll: () => Promise<void>; readonly send: (command: Command) => Promise<unknown>;
  readonly submit: (command: Command) => CurrentFootprintInverseNativeGetLookupInvocation | Promise<CurrentFootprintInverseNativeGetLookupInvocation>;
}
export interface CurrentFootprintInverseNativeGetLookupHold { readonly profile: "private.current-footprint-inverse-native-get-lookup-hold.v1" }
export interface CurrentFootprintInverseNativeGetLookupOriginal {
  readonly event: DiagnosticEvent; readonly frame: string; readonly tuple: string; readonly roots: string; readonly context: string; readonly prepared: string;
  readonly lookup: string; readonly getter: string; readonly request: Promise<unknown>; readonly originalInvocationIssued: true;
  readonly getterBodyAuthorized: false; readonly runtimeJobIssued: false; readonly referenceResultsVerified: false; readonly dispatchAuthorized: false;
}
interface Helper { readonly command: Command; scriptId: string | null }
/** Reject a failed inverse native get lookup custody predicate with its fixed refusal code. */
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_NATIVE_GET_LOOKUP_CUSTODY"); } }
const originalControllers = new WeakSet<object>();

/** Prepare one actual original getter invocation and retain its first frame.
 * Attempts burn before the first await, original events and writes remain
 * owner checked, and cleanup joins every retained original pending Promise. */
export class CurrentFootprintInverseNativeGetLookupController {
  readonly #b: CurrentFootprintInverseNativeGetLookupBindings;
  #pending: Promise<CurrentFootprintInverseNativeGetLookupHold> | null = null;
  #settlement: Promise<void> | null = null; #invocation: CurrentFootprintInverseNativeGetLookupInvocation | null = null;
  #failed = false; #invoked = false; #helper: Helper | null = null; #point: string | null = null; #invokeScript: string | null = null;
  #queued: DiagnosticEvent | null = null; #held: DiagnosticEvent | null = null; #token: CurrentFootprintInverseNativeGetLookupHold | null = null;
  #original: CurrentFootprintInverseNativeGetLookupOriginal | null = null; #normal = 0; #helpers = 0;

  /** Capture only the private owner's bindings, with no caller token lookup. */
  public constructor(bindings: CurrentFootprintInverseNativeGetLookupBindings) { this.#b = Object.freeze({ ...bindings, target: Object.freeze({ projectUuid: bindings.target.projectUuid, branchUuid: bindings.target.branchUuid, documentUuid: bindings.target.documentUuid }) }); originalControllers.add(this); }
  /** Sticky failure stops later reads, event adoption and receipt retrieval. */
  #current(): void { try { this.#b.current(); need(!this.#failed); } catch (caughtError) { this.#failed = true; throw caughtError; } }
  /** Correlate only this original context's current helper and single pause. */
  public observe(event: DiagnosticEvent): boolean {
    if (event.sessionId !== this.#b.sessionId) { return false; }
    try {
      this.#current(); this.#b.assertOriginalEvent(event);
      if (event.method === "Debugger.scriptParsed" && event.params["url"] === "") { const h = this.#helper; need(h !== null && h.scriptId === null && event.params["executionContextId"] === this.#b.contextId && typeof event.params["scriptId"] === "string"); h.scriptId = event.params["scriptId"]; if (h.command.phase === "inverse-native-get-lookup-invoke") { need(this.#invokeScript === null); this.#invokeScript = h.scriptId; } return true; }
      if (event.method === "Debugger.paused") { need(this.#invoked && this.#point !== null && this.#queued === null && this.#held === null); this.#queued = event; return true; }
      if (event.method === "Debugger.resumed") { need(!this.#invoked); }
      return false;
    } catch (caughtError) { this.#failed = true; throw caughtError; }
  }
  /** Return the same pending Promise on concurrent and later spent starts. */
  public start(): Promise<CurrentFootprintInverseNativeGetLookupHold> { if (this.#pending !== null) { return this.#pending; } const p = Promise.withResolvers<CurrentFootprintInverseNativeGetLookupHold>(); this.#pending = p.promise; void (async (): Promise<void> => { try { p.resolve(await this.#run()); } catch (caughtError) { p.reject(caughtError); } })(); return p.promise; }
  /** Check the exact original source event before exposing generated values. */
  async #qualify(h: Helper): Promise<void> { this.#current(); need(h === this.#helper && h.scriptId !== null && (this.#helpers += 1) <= LIMIT.helpers); const source = await this.#b.send(validate({ phase: "inverse-native-get-lookup-source", method: "Debugger.getScriptSource", params: { scriptId: h.scriptId } })); this.#current(); helperSource(source, h.command); need(h === this.#helper); this.#helper = null; }
  /** Spend the finite normal slot and synchronously check custody at submit. */
  async #request(input: Command): Promise<unknown> { this.#current(); need(this.#helper === null && (this.#normal += 1) <= LIMIT.normal); const c = validate(input); need(c.phase !== "inverse-native-get-lookup-invoke" && c.phase !== "inverse-native-get-lookup-source"); const h: Helper | null = program(c) === null ? null : { command: c, scriptId: null }; this.#helper = h; try { this.#current(); const raw = await this.#b.send(c); this.#current(); if (h !== null) { await this.#qualify(h); } return raw; } catch (caughtError) { this.#failed = true; throw caughtError; } }
  /** Read a freshly returned opaque object before any later traversal. */
  #properties(id: string): Promise<unknown> { return this.#request(validate({ phase: "inverse-native-get-lookup-properties", method: "Runtime.getProperties", params: { objectId: id, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } })); }
  /** Build only fixed catalogue calls with original object handles. */
  #call(role: "roots" | "context" | "prepare" | "before" | "entry", refs: readonly string[]): Promise<unknown> { return this.#request(validate({ phase: "inverse-native-get-lookup-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: this.#b.receipt, functionDeclaration: P[role], arguments: [...refs.map(objectId => ({ objectId })), ...(role === "prepare" ? [{ value: this.#b.target }] : [])], returnByValue: role === "before" || role === "entry" } })); }
  /** Join actual descriptors and source metadata before invoking tw; its
   * held frame then reproves Ze/w from live lexicals, not scope mirrors. */
  async #run(): Promise<CurrentFootprintInverseNativeGetLookupHold> {
    try {
      this.#current(); const b = this.#b; b.beforeInvoke();
      const roots = result(await this.#call("roots", [b.scope]), 4), rv = array(await this.#properties(roots), 4); need(rv.length === 4);
      for (const [index, value] of rv.entries()) { if (index > 0) { const id = object(value), raw = await this.#properties(id); if (index === 1) { need(value.type === "function" && typeof value.description === "string"); description(value.description, "lookup"); metadata(raw, "lookup", b.uiScriptId); } else { properties(raw); } } }
      const lookup = rv[1]; need(lookup !== undefined);
      const context = result(await this.#call("context", [roots]), 2), cv = array(await this.#properties(context), 2); need(cv.length === 2);
      for (const [index, value] of cv.entries()) { const raw = await this.#properties(object(value)); if (index === 1) { need(value.type === "function" && typeof value.description === "string"); description(value.description, "facadeGet"); metadata(raw, "facadeGet", b.uiScriptId); } else { properties(raw); } }
      const getter = cv[1]; need(getter !== undefined);
      const prepared = result(await this.#call("prepare", [roots, context, b.sender]), 8); const pv = array(await this.#properties(prepared), 8); const used = pv[6]; const guard = pv[7]; need(used !== undefined && guard !== undefined); array(await this.#properties(object(used)), 1); properties(await this.#properties(object(guard)));
      truth(await this.#call("before", [prepared])); this.#current(); b.beforeInvoke();
      const arm = validate({ phase: "inverse-native-get-lookup-arm", method: "Debugger.setBreakpointOnFunctionCall", params: { objectId: object(lookup), condition: "" } }); this.#point = point(await this.#request(arm)); this.#current(); b.beforeInvoke();
      need(!this.#invoked && this.#helper === null && (this.#normal += 1) <= LIMIT.normal); this.#invoked = true;
      const command = validate({ phase: "inverse-native-get-lookup-invoke", method: "Runtime.callFunctionOn", params: { ...FLAGS, throwOnSideEffect: false, objectId: b.receipt, functionDeclaration: P.invokeOnce, arguments: [{ objectId: prepared }], returnByValue: false } }); const h: Helper = { command, scriptId: null }; this.#helper = h;
      b.beforeInvoke(); const supplied = await b.submit(command); const invocation = Object.freeze({ request: supplied.request, written: supplied.written, assertOriginalWritten: supplied.assertOriginalWritten }); need(types.isPromise(invocation.request) && types.isPromise(invocation.written)); this.#invocation = invocation;
      this.#settlement = (async (): Promise<void> => { try { await invocation.request; } catch {
        // Retained original request preserves its own rejection.
      } finally { this.#failed = true; } })();
      await invocation.written; this.#current(); invocation.assertOriginalWritten(); const started = performance.now();
      while (this.#queued === null) { this.#current(); need(performance.now() - started < 30_000); await b.poll(); this.#current(); }
      const event = this.#queued; this.#queued = null; this.#held = event; this.#current(); invocation.assertOriginalWritten(); need(this.#invokeScript !== null && h.scriptId === this.#invokeScript);
      const frame = pause(event, b.sessionId, b.uiScriptId, this.#invokeScript, this.#point); await this.#qualify(h);
      const tuple = result(await this.#request(validate({ phase: "inverse-native-get-lookup-frame", method: "Debugger.evaluateOnCallFrame", params: { callFrameId: frame, expression: FRAME, objectGroup: FLAGS.objectGroup, silent: true, generatePreview: false, throwOnSideEffect: true, returnByValue: false, includeCommandLineAPI: false } })), 6); array(await this.#properties(tuple), 6); truth(await this.#call("entry", [tuple, prepared]));
      this.#current(); need(this.#normal === LIMIT.normal && this.#helpers === LIMIT.helpers);
      const token = Object.freeze({ profile: "private.current-footprint-inverse-native-get-lookup-hold.v1" as const }); this.#token = token; this.#original = Object.freeze({ event, frame, tuple, roots, context, prepared, lookup: object(lookup), getter: object(getter), request: invocation.request, originalInvocationIssued: true, getterBodyAuthorized: false, runtimeJobIssued: false, referenceResultsVerified: false, dispatchAuthorized: false }); return token;
    } catch (caughtError) { this.#failed = true; throw caughtError; }
  }
  /** Require this controller's actual token and still-held original event. */
  public requireOriginalHold(token: CurrentFootprintInverseNativeGetLookupHold): CurrentFootprintInverseNativeGetLookupOriginal { this.#current(); need(token === this.#token && this.#original !== null && this.#held === this.#original.event && this.#invocation !== null); this.#b.assertOriginalEvent(this.#original.event); this.#invocation.assertOriginalWritten(); return this.#original; }
  /** After actual original exit, join the same pending work and invocation.
   * Cleanup never sends reads, manufactures a response or refunds an attempt. */
  public async settleAfterOriginalExit(): Promise<void> { this.#b.assertOriginalExit(); this.#failed = true; await Promise.allSettled([...(this.#pending === null ? [] : [this.#pending]), ...(this.#settlement === null ? [] : [this.#settlement])]); this.#b.assertOriginalExit(); }
}
const originalMethods = Object.getOwnPropertyDescriptors(CurrentFootprintInverseNativeGetLookupController.prototype);
/** Require this module's actual private instance and unchanged method table.
 * A copied token, Proxy or substituted controller method is never an owner. */
export function assertOriginalCurrentFootprintInverseNativeGetLookupController(value: CurrentFootprintInverseNativeGetLookupController): void {
  need(value !== null && typeof value === "object" && !types.isProxy(value) && originalControllers.has(value) && Object.getPrototypeOf(value) === CurrentFootprintInverseNativeGetLookupController.prototype && Reflect.ownKeys(value).length === 0);
  const observed = Object.getOwnPropertyDescriptors(CurrentFootprintInverseNativeGetLookupController.prototype);
  need(Reflect.ownKeys(observed).length === Reflect.ownKeys(originalMethods).length && Object.entries(originalMethods).every(([name, d]) => { const now = observed[name]; return now !== undefined && now.value === d.value && now.get === d.get && now.set === d.set && now.writable === d.writable && now.enumerable === d.enumerable && now.configurable === d.configurable; }));
}
