import type {CurrentFootprintInverseNativeReferenceNextWorkerKind as Kind} from "./current-footprint-inverse-native-reference-next-worker-manager-programs.ts";
/* oxlint-disable import/max-dependencies -- Original source, metadata, native channel and actual event/exit custody remain independently qualified. */
/** Qualify the selected worker bus and continue the actual getData body only
 * to its original inner RPC entry. The inner body and Job remain closed. */
import { types } from "node:util";
import { z } from "zod";
import type { DiagnosticEvent } from "./current-pcb-diagnostic-protocol.ts";
import type { CurrentFootprintInverseNativeReferenceNextWorkerManagerOriginal as Manager } from "./current-footprint-inverse-native-reference-next-worker-manager-controller.ts";
import type { CurrentFootprintInverseNativeReferenceNextSenderPrepared as Sender } from "./current-footprint-inverse-native-reference-next-sender-collector.ts";

import type { CurrentFootprintInverseNativeDeleteRegistrationPrepared as Registration } from "./current-footprint-inverse-native-delete-registration-collector.ts";
import type { CurrentFootprintInverseGetIntrinsicGraph as Native } from "./current-footprint-inverse-get-intrinsics-collector.ts";
import { currentFootprintInverseLookupIdentity } from "./current-footprint-inverse-lookup-identity.ts";
import { collectCurrentFootprintInverseGetChannel as collect } from "./current-footprint-inverse-get-channel-collector.ts";
import type { CurrentFootprintInverseGetChannelGraph as Channel } from "./current-footprint-inverse-get-channel-collector.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_WORKER_CHANNEL_FLAGS as FLAGS, CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_WORKER_CHANNEL_REQUESTS as LIMIT, CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_WORKER_CHANNEL_CALLS as TABLES, qualifyCurrentFootprintInverseNativeReferenceNextWorkerChannelHelper as qualify, validateCurrentFootprintInverseNativeReferenceNextWorkerChannelCommand as validate } from "./current-footprint-inverse-native-reference-next-worker-channel-protocol.ts";
import type { CurrentFootprintInverseNativeReferenceNextWorkerChannelCommand as Command } from "./current-footprint-inverse-native-reference-next-worker-channel-protocol.ts";
import { CURRENT_FOOTPRINT_INVERSE_NATIVE_REFERENCE_NEXT_WORKER_CHANNEL_EXPRESSIONS as ALL_EXPRESSIONS } from "./current-footprint-inverse-native-reference-next-worker-channel-programs.ts";
import { currentFootprintInverseNativeReferenceNextWorkerChannelPause as pause } from "./current-footprint-inverse-native-reference-next-worker-channel-replies.ts";
import { currentFootprintInverseLookupArray as array, currentFootprintInverseLookupObject as object, currentFootprintInverseLookupPoint as point, currentFootprintInverseLookupProperties as properties, currentFootprintInverseLookupResult as result } from "./current-footprint-inverse-lookup-preentry-replies.ts";
import { requireCurrentFootprintInversePublicServiceTrue as truth } from "./current-footprint-inverse-public-service-replies.ts";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";

interface Dependencies {readonly callbackScope:string;readonly handlerScope:string;readonly bodyScope:string;readonly handler:string;readonly body:string;readonly manager:string}
export interface CurrentFootprintInverseNativeReferenceNextWorkerChannelBindings {
  readonly kind:Kind;readonly receipt: string; readonly manager: Manager; readonly sender: Sender; readonly dependencies: Dependencies; readonly registration: Registration; readonly native: Omit<Native, "reprove">;
  readonly target: Readonly<{ projectUuid: string; branchUuid: string; documentUuid: string }>;
  readonly sessionId: string; readonly contextId: number; readonly scripts: Readonly<{ ui: string; manager: string; prepared: string; invoke: string }>;
  readonly current: () => void; readonly assertOriginalEvent: (event: DiagnosticEvent) => void; readonly assertOriginalExit: () => void;
  readonly send: (command: Command) => Promise<unknown>; readonly poll: () => Promise<void>;
  /** Run beforeTransfer at actual submission after all owner/artifact awaits. */
  readonly resume: (command: Command, beforeTransfer: () => void) => Promise<unknown>;
  readonly control: (phase: "prepared" | "armed" | "resuming" | "held" | "complete", data?: Readonly<Record<string, string>>) => Promise<void>;
}
export interface CurrentFootprintInverseNativeReferenceNextWorkerChannelHold { readonly profile: "private.current-footprint-inverse-native-reference-next-worker-channel-hold.v1" }
export interface CurrentFootprintInverseNativeReferenceNextWorkerChannelOriginal {
  readonly event: DiagnosticEvent; readonly point: string; readonly frame: string; readonly caller: string; readonly lexicals: string; readonly callerLexicals: string; readonly route: string; readonly prepared: string; readonly channel: Channel;
  readonly getDataPrefixExecuted: true; readonly innerRpcBodyAuthorized: false; readonly nativePostAuthorized: false; readonly runtimeJobIssued: false;
}
interface Helper { readonly command: Command; scriptId: string | null }
const originals = new WeakSet<object>();
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_NATIVE_REFERENCE_NEXT_WORKER_CHANNEL_CUSTODY"); } }
/** Own one fresh channel qualification, live-frame projection and actual
 * original resume. All original events, reads and cleanup Promises are retained. */
export class CurrentFootprintInverseNativeReferenceNextWorkerChannelController {
  readonly #b: CurrentFootprintInverseNativeReferenceNextWorkerChannelBindings;
  #pending: Promise<CurrentFootprintInverseNativeReferenceNextWorkerChannelHold> | null = null;
  #failed = false; #transferred = false; #resumed = false; #resumeAttempted = false; #consumed = false;
  #helper: Helper | null = null; #point: string | null = null; #queued: DiagnosticEvent | null = null; #held: DiagnosticEvent | null = null;
  #token: CurrentFootprintInverseNativeReferenceNextWorkerChannelHold | null = null; #original: CurrentFootprintInverseNativeReferenceNextWorkerChannelOriginal | null = null; #requests = 0;
  /** Retain only the original private owner-provided closures and references. */
  public constructor(bindings: CurrentFootprintInverseNativeReferenceNextWorkerChannelBindings) { this.#b = Object.freeze({ ...bindings }); originals.add(this); }
  /** Preserve the first original custody or protocol failure permanently. */
  #current(): void { try { this.#b.current(); need(!this.#failed); } catch (caughtError) { this.#failed = true; throw caughtError; } }
  /** Route only actual same-session helpers, one resumed event and the selected
   * original inner RPC pause. Duplicates and foreign deliveries spoil the lane. */
  public observe(event: DiagnosticEvent): boolean { if (this.#consumed || event.sessionId !== this.#b.sessionId) { return false; } try { this.#current(); this.#b.assertOriginalEvent(event); if (event.method === "Debugger.scriptParsed" && event.params["url"] === "") { const helper = this.#helper; need(helper !== null && helper.scriptId === null && event.params["executionContextId"] === this.#b.contextId && typeof event.params["scriptId"] === "string"); helper.scriptId = event.params["scriptId"]; return true; } if (event.method === "Debugger.resumed") { need(this.#transferred && !this.#resumed && this.#held === null); this.#resumed = true; return true; } if (event.method === "Debugger.paused") { need(this.#transferred && this.#resumed && this.#point !== null && this.#queued === null && this.#held === null); this.#queued = event; return true; } return false; } catch (caughtError) { this.#failed = true; throw caughtError; } }
  /** Burn start synchronously and join every caller to its original Promise. */
  public start(): Promise<CurrentFootprintInverseNativeReferenceNextWorkerChannelHold> { if (this.#pending !== null) { return this.#pending; } const pending = Promise.withResolvers<CurrentFootprintInverseNativeReferenceNextWorkerChannelHold>(); this.#pending = pending.promise; void (async (): Promise<void> => { try { pending.resolve(await this.#run()); } catch (caughtError) { pending.reject(caughtError); } })(); return pending.promise; }
  /** Submit one literal operation, then correlate its exact original helper
   * source before any subsequent metadata traversal or transport operation. */
  async #read(input: Command): Promise<unknown> { this.#current(); const command = validate({...input,queryKind:this.#b.kind}); need(command.method !== "Debugger.resume" && this.#helper === null && (this.#requests += 1) <= LIMIT.cdpRequests); const helper: Helper | null = command.method === "Runtime.callFunctionOn" || command.method === "Debugger.evaluateOnCallFrame" ? { command, scriptId: null } : null; this.#helper = helper; try { const raw = await this.#b.send(command); this.#current(); if (helper !== null) { need(this.#helper === helper && helper.scriptId !== null && (this.#requests += 1) <= LIMIT.cdpRequests); const source = await this.#b.send(validate({queryKind:this.#b.kind, phase: "inverse-native-reference-next-worker-channel-helper", method: "Debugger.getScriptSource", params: { scriptId: helper.scriptId } })); this.#current(); qualify(source, command); this.#helper = null; } return raw; } catch (caughtError) { this.#failed = true; throw caughtError; } }
  /** Read a complete non-accessor metadata packet for one selected handle. */
  #props(objectId: string): Promise<unknown> { return this.#read(validate({queryKind:this.#b.kind, phase: "inverse-native-reference-next-worker-channel-properties", method: "Runtime.getProperties", params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } })); }
  /** Select only a fixed role, original references and owner-derived target. */
  #call(role: keyof typeof TABLES[Kind], references: readonly string[]): Promise<unknown> { const row = TABLES[this.#b.kind][role]; const args: unknown[] = references.map(objectId => ({ objectId })); if (row.value !== 0) { args.push({ value: currentFootprintInverseLookupIdentity(this.#b.target) }); } return this.#read(validate({queryKind:this.#b.kind, phase: "inverse-native-reference-next-worker-channel-call", role, method: "Runtime.callFunctionOn", params: { ...FLAGS, objectId: this.#b.receipt, functionDeclaration: row.program, arguments: args, returnByValue: row.byValue } })); }
  /** Qualify every newly projected tuple member before later traversal. */
  async #tuple(role: "route" | "send-prepare", refs: readonly string[], size: number): Promise<string> { const id = result(await this.#call(role, refs), size); const values = array(await this.#props(id), size); for (const value of values) { if (value.type === "function" || value.type === "object" && value.subtype !== "null") { properties(await this.#props(object(value))); } } return id; }
  /** Project actual live frame operands while leaving opaque slots untouched
   * until metadata and the fixed equality join have qualified them. */
  async #frame(role: keyof typeof ALL_EXPRESSIONS[Kind], callFrameId: string): Promise<Readonly<{ id: string; values: ReturnType<typeof array> }>> { const size = role === "inner" ? 17 : 5; const id = result(await this.#read(validate({queryKind:this.#b.kind, phase: "inverse-native-reference-next-worker-channel-frame", role, method: "Debugger.evaluateOnCallFrame", params: { callFrameId, expression: ALL_EXPRESSIONS[this.#b.kind][role], objectGroup: FLAGS.objectGroup, silent: true, generatePreview: false, throwOnSideEffect: true, returnByValue: false, includeCommandLineAPI: false } })), size); return Object.freeze({ id, values: array(await this.#props(id), size) }); }
  /** Pump the same original stream with a fixed deadline and sticky custody. */
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
  /** Qualify original channel classes/native BC before any body transfer,
   * then prove all live inner operands and stop before the RPC body executes. */
  async #run(): Promise<CurrentFootprintInverseNativeReferenceNextWorkerChannelHold> { try { this.#current(); const b = this.#b; const g = b.dependencies; const m = { ...b.registration.manager, project: b.manager.project, footprint: b.manager.service, getData: b.manager.method, getDataId: b.manager.methodId }; const first = await this.#frame("getData", b.manager.frame); const route = await this.#tuple("route", [first.id, b.manager.lexicals, b.manager.topics, b.manager.topicGroup, b.native.roots], 2);
    const channel = await collect({ profile: "ui", scriptId: b.scripts.manager, manager: m, forwarding: { callbackScope: g.callbackScope, handlerScope: g.handlerScope, bodyScope: g.bodyScope, handler: g.handler, body: g.body, managerModule: g.manager }, current: (): void => { this.#current(); }, properties: (id): Promise<unknown> => this.#props(id), call: (role, refs): Promise<unknown> => { need(role !== "lineageManager"); return this.#call(`channel-${role}`, refs); } });
    const prepared = await this.#tuple("send-prepare", [channel.roots, channel.lineage, channel.classes, channel.module, channel.methods, channel.channel, b.native.roots, b.native.members, route], 5); await b.control("prepared", { innerRpc: channel.rpc }); this.#current(); this.#point = point(await this.#read(validate({queryKind:this.#b.kind, phase: "inverse-native-reference-next-worker-channel-arm", method: "Debugger.setBreakpointOnFunctionCall", params: { objectId: channel.rpc, condition: "" } }))); await b.control("armed", { breakpointId: this.#point }); this.#current();
    const fresh = await this.#frame("getData", b.manager.frame); truth(await this.#call("before", [fresh.id, b.manager.lexicals, channel.roots, route, prepared, m.project, b.sender.prepared])); const removal = validate({queryKind:this.#b.kind, phase: "inverse-native-reference-next-worker-channel-remove", method: "Debugger.removeBreakpoint", params: { breakpointId: b.manager.point } }); const removed = await this.#read(removal); z.strictObject({}).parse(capture(removed)); await b.control("resuming"); this.#current(); need(!this.#resumeAttempted && (this.#requests += 1) <= LIMIT.cdpRequests); this.#resumeAttempted = true; const resumed = await b.resume(validate({queryKind:this.#b.kind, phase: "inverse-native-reference-next-worker-channel-resume", method: "Debugger.resume", params: {} }), (): void => { this.#current(); need(!this.#transferred && this.#resumeAttempted); this.#transferred = true; }); this.#current(); need(this.#transferred); z.strictObject({}).parse(capture(resumed));
    const event = await this.#wait(); b.assertOriginalEvent(event); need(this.#point !== null); const selected = pause(event, b.sessionId, b.scripts, this.#point,b.kind); await b.control("held"); this.#current(); const inner = await this.#frame("inner", selected.frame); const input = inner.values[2]; need(b.kind==="footprint-derived"?input?.type==="string"&&input.value===b.target.documentUuid&&input.objectId===undefined:input?.type==="undefined"&&input.objectId===undefined&&input.value===undefined); const caller = await this.#frame("caller", selected.caller); truth(await this.#call("inner", [inner.id, caller.id, b.manager.lexicals, channel.roots, channel.module, channel.classes, b.native.roots, prepared])); need(this.#requests === LIMIT.cdpRequests); await b.control("complete"); this.#current(); const token: CurrentFootprintInverseNativeReferenceNextWorkerChannelHold = Object.freeze({ profile: "private.current-footprint-inverse-native-reference-next-worker-channel-hold.v1" }); this.#original = Object.freeze({ event, point: this.#point, frame: selected.frame, caller: selected.caller, lexicals: inner.id, callerLexicals: caller.id, route, prepared, channel, getDataPrefixExecuted: true, innerRpcBodyAuthorized: false, nativePostAuthorized: false, runtimeJobIssued: false }); this.#token = token; return token;
  } catch (caughtError) { this.#failed = true; throw caughtError; } }
  /** Retrieve this exact retained original entry; copied tokens cannot grant. */
  public requireOriginalHold(token: CurrentFootprintInverseNativeReferenceNextWorkerChannelHold): CurrentFootprintInverseNativeReferenceNextWorkerChannelOriginal { this.#current(); need(!this.#consumed && token === this.#token && this.#original !== null && this.#original.event === this.#held); this.#b.assertOriginalEvent(this.#original.event); pause(this.#original.event, this.#b.sessionId, this.#b.scripts, this.#original.point,this.#b.kind); return this.#original; }
  /** Keep the exact accepted entry's comparison data after its separate hold
   * is consumed; this method never replays a spent prefix check. */
  public originalTransitionData(original: CurrentFootprintInverseNativeReferenceNextWorkerChannelOriginal): void { this.#current(); need(!this.#consumed && original === this.#original && original.event === this.#held); this.#b.assertOriginalEvent(original.event); }
  /** Spend only this actual original hold at the next owner's transfer seam. */
  public consumeOriginalHold(original: CurrentFootprintInverseNativeReferenceNextWorkerChannelOriginal): void { this.originalTransitionData(original); this.#consumed = true; }
  /** Join this same pending proof only after actual original root/Job exit. */
  public async settleAfterOriginalExit(): Promise<void> { this.#b.assertOriginalExit(); this.#failed = true; await Promise.allSettled([this.#pending]); this.#b.assertOriginalExit(); }
}
const methods = Object.getOwnPropertyDescriptors(CurrentFootprintInverseNativeReferenceNextWorkerChannelController.prototype);
/** Refuse copied controllers, Proxy traps and substituted prototype members. */
export function assertOriginalCurrentFootprintInverseNativeReferenceNextWorkerChannelController(value: CurrentFootprintInverseNativeReferenceNextWorkerChannelController): void { need(value !== null && typeof value === "object" && !types.isProxy(value) && originals.has(value) && Object.getPrototypeOf(value) === CurrentFootprintInverseNativeReferenceNextWorkerChannelController.prototype && Reflect.ownKeys(value).length === 0); const observed = Object.getOwnPropertyDescriptors(CurrentFootprintInverseNativeReferenceNextWorkerChannelController.prototype); need(Reflect.ownKeys(observed).length === Reflect.ownKeys(methods).length && Object.entries(methods).every(([name, d]) => { const now = observed[name]; return now !== undefined && now.value === d.value && now.get === d.get && now.set === d.set && now.writable === d.writable && now.enumerable === d.enumerable && now.configurable === d.configurable; })); }
