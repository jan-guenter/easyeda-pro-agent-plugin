/* oxlint-disable import/max-dependencies -- Original source/packet metadata, closed grammar and genuine event/exit boundaries remain independent. */
/** Continue the original registered GET through its wrapper and body, stopping
 * before getData executes. No worker method, accepted Job or result is issued. */
import { types } from "node:util";
import { z } from "zod";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import type { CurrentFootprintInverseNativeGetTaskCallbackOriginal as Callback } from "./current-footprint-inverse-native-get-task-callback-controller.ts";
import type { CurrentFootprintInverseNativeGetTaskSenderPrepared as Sender } from "./current-footprint-inverse-native-get-task-sender-collector.ts";
import type { CurrentFootprintInverseNativeGetTaskDependencyGraph as Dependencies } from "./current-footprint-inverse-native-get-task-dependencies-collector.ts";
import type { CurrentFootprintInverseNativeDeleteRegistrationPrepared as Registration } from "./current-footprint-inverse-native-delete-registration-collector.ts";
import type { CurrentFootprintInverseGetIntrinsicGraph as Native } from "./current-footprint-inverse-get-intrinsics-collector.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_MANAGER_CALLS as CALLS, CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_MANAGER_FLAGS as FLAGS, qualifyCurrentFootprintInverseNativeGetTaskManagerHelper as qualify, validateCurrentFootprintInverseNativeGetTaskManagerCommand as validate } from "./current-footprint-inverse-native-get-task-manager-protocol.ts";
import type { CurrentFootprintInverseNativeGetTaskManagerCommand as Command } from "./current-footprint-inverse-native-get-task-manager-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_MANAGER_EXPRESSIONS as EXPRESSIONS, CURRENT_FOOTPRINT_INVERSE_NATIVE_GET_TASK_MANAGER_PROGRAMS as P } from "./current-footprint-inverse-native-get-task-manager-programs.ts";
import { currentFootprintInverseNativeGetTaskManagerPause as pause } from "./current-footprint-inverse-native-get-task-manager-replies.ts";
import { currentFootprintInverseLookupArray as array, currentFootprintInverseLookupObject as object, currentFootprintInverseLookupPoint as point, currentFootprintInverseLookupProperties as properties, currentFootprintInverseLookupResult as result } from "./current-footprint-inverse-lookup-preentry-replies.ts";
import { requireCurrentFootprintInversePublicServiceTrue as truth } from "./current-footprint-inverse-public-service-replies.ts";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";

type Role = "wrapper" | "body" | "getData";
export interface CurrentFootprintInverseNativeGetTaskManagerBindings {
  readonly receipt: string; readonly callback: Callback; readonly sender: Sender; readonly dependencies: Dependencies; readonly registration: Registration; readonly native: Omit<Native, "reprove">;
  readonly sessionId: string; readonly contextId: number; readonly scripts: Readonly<{ ui: string; manager: string; prepared: string; invoke: string }>;
  readonly current: () => void; readonly assertOriginalEvent: (event: DiagnosticEvent) => void; readonly assertOriginalExit: () => void;
  readonly send: (command: Command) => Promise<unknown>; readonly poll: () => Promise<void>;
  /** The owner runs beforeTransfer only immediately before actual submission
   * after its async owner/artifact checks. Later resumes reprove this origin. */
  readonly resume: (command: Command, first: boolean, beforeTransfer: () => void) => Promise<unknown>;
  readonly control: (phase: "prepared" | "armed" | "resuming" | "held" | "complete", role?: Role, point?: string) => Promise<void>;
}
export interface CurrentFootprintInverseNativeGetTaskManagerHold { readonly profile: "private.current-footprint-inverse-native-get-task-manager-hold.v1" }
export interface CurrentFootprintInverseNativeGetTaskManagerOriginal {
  readonly event: DiagnosticEvent; readonly point: string; readonly frame: string; readonly lexicals: string; readonly prepared: string; readonly manager: string;
  readonly wrapperAndBodyExecuted: true; readonly getDataBodyAuthorized: false; readonly runtimeJobIssued: false;
}
interface Helper { readonly command: Command; scriptId: string | null }
const originals = new WeakSet<object>();
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_NATIVE_GET_TASK_MANAGER_CUSTODY"); } }
const sizes = Object.freeze({ callback: 20, wrapper: 6, body: 9, applier: 4, getData: 5 } as const);
/** Own the original three bounded transfers and live lexical/receiver joins.
 * Newly projected opaque slots are compared to originals before traversal. */
export class CurrentFootprintInverseNativeGetTaskManagerController {
  readonly #b: CurrentFootprintInverseNativeGetTaskManagerBindings;
  #pending: Promise<CurrentFootprintInverseNativeGetTaskManagerHold> | null = null;
  #failed = false; #transferred = false; #resumed = false; #resumeAttempted = false; #waiting = false;
  #helper: Helper | null = null; #role: Role | null = null; readonly #points = new Map<Role, string>();
  #queued: DiagnosticEvent | null = null; #held: DiagnosticEvent | null = null;
  #token: CurrentFootprintInverseNativeGetTaskManagerHold | null = null;
  #original: CurrentFootprintInverseNativeGetTaskManagerOriginal | null = null;
  #requests = 0; #entryConsumed = false;
  /** Retain only the original private owner-provided bindings. */
  public constructor(bindings: CurrentFootprintInverseNativeGetTaskManagerBindings) { this.#b = Object.freeze({ ...bindings }); originals.add(this); }
  /** Keep the first owner, event or protocol failure permanently spent. */
  #current(): void { try { this.#b.current(); need(!this.#failed); } catch (caughtError) { this.#failed = true; throw caughtError; } }
  /** Accept the exact original helper, resumed event and next selected pause.
   * A foreign or duplicate original event spoils this continuation. */
  public observe(event: DiagnosticEvent): boolean {
    if (this.#entryConsumed || event.sessionId !== this.#b.sessionId) { return false; }
    try { this.#current(); this.#b.assertOriginalEvent(event);
      if (event.method === "Debugger.scriptParsed" && event.params["url"] === "") { const helper = this.#helper; need(helper !== null && helper.scriptId === null && event.params["executionContextId"] === this.#b.contextId && typeof event.params["scriptId"] === "string"); helper.scriptId = event.params["scriptId"]; return true; }
      if (event.method === "Debugger.resumed") { need(this.#waiting && !this.#resumed && this.#held === null); this.#resumed = true; return true; }
      if (event.method === "Debugger.paused") { need(this.#waiting && this.#resumed && this.#role !== null && this.#queued === null && this.#held === null); this.#queued = event; return true; }
      return false;
    } catch (caughtError) { this.#failed = true; throw caughtError; }
  }
  /** Burn the first start synchronously and preserve its same Promise. */
  public start(): Promise<CurrentFootprintInverseNativeGetTaskManagerHold> { if (this.#pending !== null) { return this.#pending; } const pending = Promise.withResolvers<CurrentFootprintInverseNativeGetTaskManagerHold>(); this.#pending = pending.promise; void (async (): Promise<void> => { try { pending.resolve(await this.#run()); } catch (caughtError) { pending.reject(caughtError); } })(); return pending.promise; }
  /** Issue one fixed non-resume operation and join its exact source helper. */
  async #read(input: Command): Promise<unknown> {
    this.#current(); const command = validate(input); need(command.method !== "Debugger.resume" && this.#helper === null && (this.#requests += 1) <= 46);
    const helper: Helper | null = command.method === "Runtime.callFunctionOn" || command.method === "Debugger.evaluateOnCallFrame" ? { command, scriptId: null } : null; this.#helper = helper;
    try { const raw = await this.#b.send(command); this.#current(); if (helper !== null) { need(this.#helper === helper && helper.scriptId !== null && (this.#requests += 1) <= 46); const source = await this.#b.send(validate({ phase: "inverse-native-get-task-manager-helper", method: "Debugger.getScriptSource", params: { scriptId: helper.scriptId } })); this.#current(); qualify(source, command); this.#helper = null; } return raw; } catch (caughtError) { this.#failed = true; throw caughtError; }
  }
  /** Read a fixed program's result and inspect new metadata before traversal. */
  async #tuple(role: "prepare" | "manager", references: readonly string[]): Promise<string> { const size = CALLS[role].size; const id = result(await this.#call(role, references), size); const values = array(await this.#props(id), size); for (const value of values) { if (value.type === "function" || value.type === "object" && value.subtype !== "null") { properties(await this.#props(object(value))); } } return id; }
  /** Read one complete packet for a previously selected original handle. */
  #props(objectId: string): Promise<unknown> { return this.#read(validate({ phase: "inverse-native-get-task-manager-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } })); }
  /** Select one literal program and its exact comparison-reference arity. */
  #call(role: keyof typeof CALLS, references: readonly string[]): Promise<unknown> { return this.#read(validate({ phase: "inverse-native-get-task-manager-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: this.#b.receipt, functionDeclaration: P[role], arguments: references.map(objectId => ({ objectId })), returnByValue: CALLS[role].size === 0 } })); }
  /** Keep newly projected slots opaque until the fixed equality proof. */
  async #frame(role: keyof typeof EXPRESSIONS, callFrameId: string): Promise<string> { const id = result(await this.#read(validate({ phase: "inverse-native-get-task-manager-frame", role, method: "Debugger.evaluateOnCallFrame", params: { callFrameId, expression: EXPRESSIONS[role], objectGroup: FLAGS.objectGroup, silent: true, generatePreview: false, throwOnSideEffect: true, returnByValue: false, includeCommandLineAPI: false } })), sizes[role]); array(await this.#props(id), sizes[role]); return id; }
  /** Pump only the original event stream until this selected entry is held. */
  async #wait(): Promise<DiagnosticEvent> { const started = performance.now(); while (this.#queued === null) { this.#current(); need(performance.now() - started < 30_000); await this.#b.poll(); this.#current(); } const event = this.#queued; this.#queued = null; this.#held = event; this.#waiting = false; return event; }
  /** Remove the prior owned point and perform one guarded original resume. */
  async #advance(role: Role, oldPoint: string, first: boolean): Promise<ReturnType<typeof pause>> { this.#current(); need(!this.#waiting && !this.#resumeAttempted); this.#role = role; this.#resumeAttempted = true; const removal = validate({ phase: "inverse-native-get-task-manager-remove", method: "Debugger.removeBreakpoint", params: { breakpointId: oldPoint } }); const removed = await this.#read(removal); z.strictObject({}).parse(capture(removed)); await this.#b.control("resuming", role); this.#current(); need((this.#requests += 1) <= 46); const raw = await this.#b.resume(validate({ phase: "inverse-native-get-task-manager-resume", method: "Debugger.resume", params: {} }), first, (): void => { this.#current(); need(!this.#waiting && this.#resumeAttempted && (first ? !this.#transferred : this.#transferred)); this.#transferred = true; this.#waiting = true; this.#resumed = false; this.#held = null; }); this.#current(); need(this.#waiting && this.#transferred); z.strictObject({}).parse(capture(raw)); const event = await this.#wait(); this.#b.assertOriginalEvent(event); const selected = this.#points.get(role); need(selected !== undefined); const entry = pause(event, role, this.#b.sessionId, this.#b.scripts, selected); await this.#b.control("held", role); this.#current(); this.#resumeAttempted = false; return entry; }
  /** Qualify original wrapper/body lexicals, manager selection and the actual
   * getData receiver, ending before its ready/worker branch executes. */
  async #run(): Promise<CurrentFootprintInverseNativeGetTaskManagerHold> { try { this.#current(); const b = this.#b, g = b.dependencies, m = b.registration.manager;
    const prepared = await this.#tuple("prepare", [b.callback.prepared, b.callback.payload, g.handler, g.body, g.manager]); const manager = await this.#tuple("manager", [prepared, m.registry, m.map, m.methods, m.native, m.nativePrototype, m.selected, m.project, m.footprint, m.getData, b.native.asyncPrototype, b.sender.prepared]); await b.control("prepared"); this.#current();
    for (const [role, id] of [["wrapper", g.handlerId], ["body", g.bodyId], ["getData", m.getDataId]] as const) { const p = point(await this.#read(validate({ phase: "inverse-native-get-task-manager-arm", role, method: "Debugger.setBreakpointOnFunctionCall", params: { objectId: id, condition: "" } }))); this.#points.set(role, p); await b.control("armed", role, p); this.#current(); }
    const fresh = await this.#frame("callback", b.callback.frame); truth(await this.#call("before", [prepared, manager, fresh, b.callback.lexicals]));
    const wrapper = await this.#advance("wrapper", b.callback.point, true); const wrapperFrame = await this.#frame("wrapper", wrapper.frame); truth(await this.#call("wrapper", [wrapperFrame, prepared, b.native.roots]));
    const wrapperPoint = this.#points.get("wrapper"); need(wrapperPoint !== undefined); const body = await this.#advance("body", wrapperPoint, false); need(body.applier !== null); const bodyFrame = await this.#frame("body", body.frame); const applier = await this.#frame("applier", body.applier); truth(await this.#call("body", [bodyFrame, applier, prepared, manager, b.native.roots, b.sender.prepared]));
    const bodyPoint = this.#points.get("body"); need(bodyPoint !== undefined); const held = await this.#advance("getData", bodyPoint, false); const lexicals = await this.#frame("getData", held.frame); truth(await this.#call("getData", [lexicals, manager, m.project, b.sender.prepared, b.registration.topics, b.registration.topicGroup]));
    need(this.#requests === 46 && this.#held !== null); await b.control("complete"); this.#current(); const selected = this.#points.get("getData"); need(selected !== undefined); const token: CurrentFootprintInverseNativeGetTaskManagerHold = Object.freeze({ profile: "private.current-footprint-inverse-native-get-task-manager-hold.v1" }); this.#original = Object.freeze({ event: this.#held, point: selected, frame: held.frame, lexicals, prepared, manager, wrapperAndBodyExecuted: true, getDataBodyAuthorized: false, runtimeJobIssued: false }); this.#token = token; return token;
  } catch (caughtError) { this.#failed = true; throw caughtError; } }
  /** Retrieve only this actual retained entry; copied tokens grant nothing. */
  public requireOriginalHold(token: CurrentFootprintInverseNativeGetTaskManagerHold): CurrentFootprintInverseNativeGetTaskManagerOriginal { this.#current(); need(!this.#entryConsumed && token === this.#token && this.#original !== null && this.#original.event === this.#held); this.#b.assertOriginalEvent(this.#original.event); pause(this.#original.event, "getData", this.#b.sessionId, this.#b.scripts, this.#original.point); return this.#original; }
  /** Retain only this same actual getData entry before its next transfer. */
  public originalTransitionData(original: CurrentFootprintInverseNativeGetTaskManagerOriginal): void { this.#current(); need(!this.#entryConsumed && original === this.#original && original.event === this.#held); this.#b.assertOriginalEvent(original.event); }
  /** Burn the held getData entry only at the next actual original submission. */
  public consumeOriginalHold(original: CurrentFootprintInverseNativeGetTaskManagerOriginal): void { this.originalTransitionData(original); this.#entryConsumed = true; }
  /** Join this same in-flight proof only after observed original root/Job exit. */
  public async settleAfterOriginalExit(): Promise<void> { this.#b.assertOriginalExit(); this.#failed = true; await Promise.allSettled([this.#pending]); this.#b.assertOriginalExit(); }
}
const methods = Object.getOwnPropertyDescriptors(CurrentFootprintInverseNativeGetTaskManagerController.prototype);
/** Refuse copied instances, Proxy traps and substituted prototype methods. */
export function assertOriginalCurrentFootprintInverseNativeGetTaskManagerController(value: CurrentFootprintInverseNativeGetTaskManagerController): void { need(value !== null && typeof value === "object" && !types.isProxy(value) && originals.has(value) && Object.getPrototypeOf(value) === CurrentFootprintInverseNativeGetTaskManagerController.prototype && Reflect.ownKeys(value).length === 0); const observed = Object.getOwnPropertyDescriptors(CurrentFootprintInverseNativeGetTaskManagerController.prototype); need(Reflect.ownKeys(observed).length === Reflect.ownKeys(methods).length && Object.entries(methods).every(([name, d]) => { const now = observed[name]; return now !== undefined && now.value === d.value && now.get === d.get && now.set === d.set && now.writable === d.writable && now.enumerable === d.enumerable && now.configurable === d.configurable; })); }
