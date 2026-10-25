/* oxlint-disable eslint/max-classes-per-file -- A private fixed-profile core keeps both realm wrappers closed to caller-selected capture plans. */
/** Original pause/event capture for the empty209 ratline startup branch.
 * The native held-import adapter adopts only the fixed PCB prefix. */
import { CURRENT_PCB_209_RATLINE_NATIVE_PROFILE } from "./current-pcb-209-ratline-budget.ts";
import { types } from "node:util";
import { CurrentPcb209RatlineStageDiagnostics } from "./current-pcb-209-ratline-diagnostics.ts";
import { currentPcb209RatlineTransportRequestMilliseconds } from "./current-pcb-209-ratline-transport-windows.ts";
import { currentPcb209RatlineContinuationTiming } from "./current-pcb-209-ratline-continuation-timing.ts";
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CURRENT_PCB_209_RATLINE_CAPTURE_PROFILES, CURRENT_PCB_209_RATLINE_HELD_CAPTURE_PROFILE, CURRENT_PCB_209_RATLINE_CAPTURE_GROUP as GROUP } from "./current-pcb-209-ratline-capture-profile.ts";
import type { CurrentPcb209RatlineCaptureRole, CurrentPcb209RatlineCaptureScope, CurrentPcb209RatlineCaptureSite } from "./current-pcb-209-ratline-capture-profile.ts";
import { CURRENT_PCB_209_RATLINE_CAPTURE_PROGRAMS as PROGRAMS } from "./current-pcb-209-ratline-capture-program.ts";
import type { CurrentPcb209RatlineCaptureProgram } from "./current-pcb-209-ratline-capture-program.ts";
import { CURRENT_PCB_209_RATLINE_SOURCE_PROFILE } from "./current-pcb-209-ratline-source.ts";

const token = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location = z.object({ scriptId: token, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict();
const frame = z.looseObject({ callFrameId: token, functionName: z.string().max(128), location });
const pause = z.looseObject({ reason: z.literal("other"), hitBreakpoints: z.array(token).length(1), callFrames: z.array(frame).min(1).max(32) });
const emptyReply = z.object({}).strict();
const remoteObject = z.object({ result: z.looseObject({ type: z.literal("object"), objectId: token }) }).strict();
const byValue = z.object({ result: z.looseObject({ type: z.enum(["object", "number", "string", "boolean"]), value: z.unknown() }) }).strict();
const nativeId = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const payloadSchema = z.object({ ratlineRes: z.array(z.never()).length(0), workerName: nativeId }).strict();
const worldSchema = z.object({ documentUuid: z.string().regex(/^(?:[a-f\d]{16}|[a-f\d]{32})$/u),
  projectUuid: z.string().regex(/^(?:[a-f\d]{32}|[a-f\d]{64})$/u),
  tabId: z.string().min(1).max(256), windowTabId: z.string().regex(/^[A-Za-z\d_-]{1,128}$/u) }).strict();
type Expression = "this" | "o" | "t" | "e" | "a" | "l" | "i" | "f" | "c" | "h" | "u" | "_" | "O" | "y" | "iY" | "self";
export type CurrentPcb209RatlineCaptureCommand =
  | Readonly<{ method: "Debugger.setBreakpoint"; params: Readonly<{ location: z.infer<typeof location> }> }>
  | Readonly<{ method: "Debugger.removeBreakpoint"; params: Readonly<{ breakpointId: string }> }>
  | Readonly<{ method: "Debugger.resume"; params: Readonly<Record<string, never>> }>
  | Readonly<{ method: "Debugger.evaluateOnCallFrame"; params: Readonly<{ callFrameId: string; expression: Expression; objectGroup: typeof GROUP;
    returnByValue: boolean; silent: true; throwOnSideEffect: true; generatePreview: false; includeCommandLineAPI: false }> }>
  | Readonly<{ method: "Runtime.callFunctionOn"; params: Readonly<{ objectId: string; functionDeclaration: CurrentPcb209RatlineCaptureProgram;
    arguments: readonly Readonly<{ objectId: string }>[]; objectGroup: typeof GROUP; returnByValue: true; silent: true;
    throwOnSideEffect: true; generatePreview: false; awaitPromise: false; userGesture: false }> }>;
/** A private original owner must bind the complete fixed source, context,
 * process and session on each reproof. This interface is never an MCP input.
 * Cleanup reuses its original channel even after qualification fails. */
export interface CurrentPcb209RatlineCaptureTransport {
  readonly scriptId: string;
  readonly assertOriginalPinnedRealm: (source: Readonly<{ relativePath: string; bytes: number; sha256: string }>) => Promise<void>;
  readonly assertOriginalTermination: () => Promise<void>;
  readonly request: (command: CurrentPcb209RatlineCaptureCommand) => Promise<unknown>;
  readonly subscribe: (events: Readonly<{ paused: (input: unknown) => void; resumed: () => void; lost: () => void }>) => () => void;
}
export interface CurrentPcb209RatlineCapturePacket {
  readonly profile: "private.current-pcb209-ratline-pcb-capture.v1" | "private.current-pcb209-ratline-worker-capture.v1";
  readonly sourceSha256: string;
  readonly pauses: number;
  readonly nativeWorkerId: number;
  readonly resultPayload: string;
  readonly world: Readonly<z.infer<typeof worldSchema>> | null;
  readonly originalFactoryAndBridgeEventsRetained: true;
  readonly originalTerminalReturnPauseRetained: true;
  readonly callbackReturnCompletionVerified: false;
  readonly nativeWorkerTargetIdentityVerified: false;
  readonly subscribedCanvasPeerOwnershipVerified: false;
  readonly copperCompletionVerified: false;
  readonly completeLiveBaselineVerified: false;
  readonly executionAuthorized: false;
}
export interface CurrentPcb209RatlineHeldCapturePacket extends Omit<CurrentPcb209RatlineCapturePacket,
  "profile" | "pauses" | "resultPayload" | "world" | "originalTerminalReturnPauseRetained"> {
  readonly profile: "private.current-pcb209-ratline-pcb-held-prefix-capture.v1";
  readonly pauses: 2;
  readonly originalFactoryPauseReleased: true;
}
export type CurrentPcb209RatlineAnyCapturePacket = CurrentPcb209RatlineCapturePacket | CurrentPcb209RatlineHeldCapturePacket;
interface Packets { readonly full: CurrentPcb209RatlineCapturePacket; readonly "pcb-held-prefix": CurrentPcb209RatlineHeldCapturePacket }
interface Breakpoint { readonly id: string; removal: Promise<void> | null; removed: boolean }
interface Paused { readonly event: unknown; readonly capturedError: unknown; readonly resumed: PromiseWithResolvers<null>;
  readonly timer: ReturnType<typeof setTimeout>; resume: Promise<void> | null; observed: boolean }
const INTERNAL = Symbol("fixed209-ratline-capture");
const issued = new WeakMap<CurrentPcb209RatlineAnyCapturePacket, object>();
function fail(code: string): Error { return new Error(`PCB209_RATLINE_CAPTURE_${code}`); }
function need(value: boolean, code: string): asserts value { if (!value) { throw fail(code); } }
async function bounded<T>(promise: Promise<T>, milliseconds: number = CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.elapsed.ordinaryRequestMilliseconds): Promise<T> {
  const deadline = Promise.withResolvers<never>(); const timer = setTimeout(() => { deadline.reject(fail("DEADLINE")); }, milliseconds);
  try { return await Promise.race([promise, deadline.promise]); } finally { clearTimeout(timer); }
}
async function observed(promise: Promise<unknown>): Promise<void> {
  try { await promise; } catch {
    // The original owner retains the failure.
  }
}
async function settle(work: Promise<void>, completion: PromiseWithResolvers<undefined>): Promise<void> {
  try {
    await work;
    // oxlint-disable-next-line unicorn/no-useless-undefined -- Strict PromiseWithResolvers<undefined> requires its resolve argument.
    completion.resolve(undefined);
  } catch (error) { completion.reject(error); }
}
function members(transport: CurrentPcb209RatlineCaptureTransport): readonly unknown[] {
  need(transport !== null && typeof transport === "object" && !types.isProxy(transport) &&
    (Object.getPrototypeOf(transport) === Object.prototype || Object.getPrototypeOf(transport) === null), "TRANSPORT");
  const keys = ["scriptId", "assertOriginalPinnedRealm", "assertOriginalTermination", "request", "subscribe"] as const;
  need(Reflect.ownKeys(transport).length === keys.length, "TRANSPORT");
  return keys.map(key => { const descriptor = Object.getOwnPropertyDescriptor(transport, key);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && typeof descriptor.value === (key === "scriptId" ? "string" : "function"), "TRANSPORT");
    return descriptor.value as unknown; });
}
function payloadValue(input: unknown, expected: number | null): string {
  need(typeof input === "string" && input.length <= 256, "PAYLOAD");
  const value = payloadSchema.parse(JSON.parse(input) as unknown);
  need(expected !== null && value.workerName === expected && JSON.stringify(value) === input, "PAYLOAD"); return input;
}
class CurrentPcb209RatlineCaptureCore<Scope extends CurrentPcb209RatlineCaptureScope> {
  readonly #diagnostics = new CurrentPcb209RatlineStageDiagnostics();
  readonly #role: CurrentPcb209RatlineCaptureRole;
  readonly #transport: CurrentPcb209RatlineCaptureTransport;
  readonly #original: readonly unknown[];
  readonly #request: CurrentPcb209RatlineCaptureTransport["request"];
  readonly #subscribe: CurrentPcb209RatlineCaptureTransport["subscribe"];
  readonly #reprove: CurrentPcb209RatlineCaptureTransport["assertOriginalPinnedRealm"];
  readonly #terminate: CurrentPcb209RatlineCaptureTransport["assertOriginalTermination"];
  readonly #scriptId: string;
  readonly #breakpoints = new Map<string, Breakpoint>();
  readonly #identities = new Map<string, string>();
  readonly #armed = Promise.withResolvers<null>();
  #waiting = Promise.withResolvers<Paused>();
  #pause: Paused | null = null;
  #unsubscribe: (() => void) | null = null;
  #failed: Error | null = null;
  #consumed = false;
  #sequenceExhausted = false;
  #settled = false;
  #released = false;
  #releasing = false;
  #uncertain = 0;
  #commands = 0;
  #events = 0;
  #workerId: number | null = null;
  #selfId: number | null = null;
  #payload: string | null = null;
  #world: z.infer<typeof worldSchema> | null = null;
  readonly #scope: Scope;
  #packet: Packets[Scope] | null = null;
  #cleanupPending: Promise<void> | null = null;
  #cleanupRequested = false;
  public constructor(key: typeof INTERNAL, role: CurrentPcb209RatlineCaptureRole, scope: Scope, transport: CurrentPcb209RatlineCaptureTransport) {
    need(key === INTERNAL && (scope === "full" || scope === "pcb-held-prefix" && role === "pcb"), "FIXED_PROFILE");
    this.#role = role; this.#scope = scope; this.#transport = transport; this.#original = members(transport);
    this.#scriptId = token.parse(transport.scriptId); this.#request = transport.request; this.#subscribe = transport.subscribe;
    this.#reprove = transport.assertOriginalPinnedRealm; this.#terminate = transport.assertOriginalTermination;
    void observed(this.#waiting.promise); void observed(this.#armed.promise);
  }
  public status(): Readonly<Record<string, unknown>> { return Object.freeze({ ...this.#diagnostics.snapshot(), role: this.#role, scope: this.#scope, consumed: this.#consumed,
    settled: this.#settled, failed: this.#failed !== null, released: this.#released, events: this.#events, commands: this.#commands,
    paused: this.#pause !== null && !this.#pause.observed, unresolvedBreakpoints: this.#uncertain > 0 || [...this.#breakpoints.values()].some(value => !value.removed) }); }
  public async whenArmed(): Promise<void> { await this.#armed.promise; await this.#current(); }
  #same(): void { need(members(this.#transport).every((value, index) => value === this.#original[index]), "OWNER_CHANGED"); }
  #poison(code: string, cause: unknown = fail(code)): void { this.#diagnostics.record(cause); this.#failed ??= fail(code); }
  async #current(): Promise<void> {
    this.#diagnostics.step = "owner-reproof";
    try {
      need(this.#failed === null && !this.#released && !this.#releasing, "FAILED_OR_RELEASED"); this.#same();
      await bounded(this.#reprove.call(this.#transport, CURRENT_PCB_209_RATLINE_SOURCE_PROFILE[this.#role]),
        currentPcb209RatlineContinuationTiming(this.#transport)?.ownerMilliseconds); this.#same();
      need(this.#failed === null && !this.#released && !this.#releasing, "FAILED_OR_RELEASED");
    } catch (error) { this.#poison("OWNER_LOST", error); throw error; }
  }
  async #send(command: CurrentPcb209RatlineCaptureCommand): Promise<unknown> {
    await this.#current(); need(this.#commands < 112, "BUDGET"); this.#commands += 1;
    this.#diagnostics.lastCommand = command.method; this.#diagnostics.step = "native-request";
    const value = captureCurrentPcbStringClockReply(await bounded(this.#request.call(this.#transport, command),
      currentPcb209RatlineTransportRequestMilliseconds(this.#transport, command.method))).value;
    await this.#current(); return value;
  }
  async #cleanupSend(command: CurrentPcb209RatlineCaptureCommand): Promise<void> {
    this.#same(); need(this.#commands < 128, "CLEANUP_BUDGET"); this.#commands += 1;
    this.#diagnostics.lastCommand = command.method; this.#diagnostics.step = "cleanup";
    const reply = await bounded(this.#request.call(this.#transport, command), currentPcb209RatlineTransportRequestMilliseconds(this.#transport, command.method));
    emptyReply.parse(captureCurrentPcbStringClockReply(reply).value); this.#same();
  }
  readonly #paused = (input: unknown): void => {
    this.#diagnostics.lastEvent = "paused";
    if (this.#pause !== null && !this.#pause.observed) { this.#poison("DUPLICATE_PAUSE"); return; }
    let capturedError: unknown = null, event: unknown = null;
    try { event = captureCurrentPcbStringClockReply(input).value; } catch (error) { capturedError = error; }
    const retained: Paused = { event, capturedError, resumed: Promise.withResolvers(), resume: null, observed: false,
      timer: setTimeout(() => { this.#poison("PAUSE_DEADLINE"); void observed(this.#cleanup()); },
        currentPcb209RatlineContinuationTiming(this.#transport)?.capturePauseMilliseconds ??
        (this.#role === "pcb" ? CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.elapsed.capturePauseMilliseconds : 6000)) };
    this.#pause = retained; this.#waiting.resolve(retained);
    if (this.#settled || this.#sequenceExhausted) { this.#poison("EXTRA_PAUSE"); void observed(this.#cleanup()); }
  };
  readonly #resumed = (): void => {
    this.#diagnostics.lastEvent = "resumed";
    const paused = this.#pause;
    if (paused === null || paused.observed) { this.#poison("UNEXPECTED_RESUME"); return; }
    if (paused.resume === null) { this.#poison("UNEXPECTED_RESUME"); }
    paused.observed = true; clearTimeout(paused.timer); paused.resumed.resolve(null);
  };
  readonly #lost = (): void => { this.#diagnostics.lastEvent = "lost"; this.#poison("OWNER_LOST"); this.#waiting.reject(this.#failed); this.#armed.reject(this.#failed); void observed(this.#cleanup()); };
  #resume(paused: Paused): Promise<void> {
    if (paused.resume === null) {
      const completion = Promise.withResolvers<undefined>(); paused.resume = completion.promise;
      void settle((async (): Promise<void> => { await this.#cleanupSend({ method: "Debugger.resume", params: {} }); await bounded(paused.resumed.promise); })(), completion);
    }
    return paused.resume;
  }
  #removeBreakpoint(breakpoint: Breakpoint): Promise<void> {
    if (breakpoint.removal === null) {
      const completion = Promise.withResolvers<undefined>(); breakpoint.removal = completion.promise;
      void settle((async (): Promise<void> => {
        await this.#cleanupSend({ method: "Debugger.removeBreakpoint", params: { breakpointId: breakpoint.id } }); breakpoint.removed = true;
      })(), completion);
    }
    return breakpoint.removal;
  }
  async #remove(): Promise<void> {
    const errors: unknown[] = [];
    for (const breakpoint of this.#breakpoints.values()) {
      try { await this.#removeBreakpoint(breakpoint); } catch (error) { errors.push(error); }
    }
    if (errors.length > 0) { throw new AggregateError(errors, "PCB209_RATLINE_CAPTURE_REMOVE"); }
  }
  #cleanup(): Promise<void> {
    if (this.#cleanupPending !== null) { this.#cleanupRequested = true; return this.#cleanupPending; }
    const completion = Promise.withResolvers<undefined>(); this.#cleanupPending = completion.promise;
    void settle((async (): Promise<void> => {
      try {
        do {
          this.#cleanupRequested = false;
          await this.#remove(); need(this.#uncertain === 0, "UNRESOLVED_BREAKPOINTS");
          if (this.#pause !== null && !this.#pause.observed) { await this.#resume(this.#pause); }
        } while (this.#cleanupRequested);
      } finally {
        this.#cleanupPending = null;
        if (this.#cleanupRequested) { void observed((async (): Promise<void> => { await Promise.resolve(); await this.#cleanup(); })()); }
      }
    })(), completion);
    return completion.promise;
  }
  async #arm(site: string, point: Readonly<{ lineNumber: number; columnNumber: number }>): Promise<void> {
    await this.#current(); need(this.#commands < 112, "BUDGET"); this.#commands += 1;
    const requested = { scriptId: this.#scriptId, lineNumber: point.lineNumber, columnNumber: point.columnNumber }; this.#uncertain += 1;
    this.#diagnostics.step = "breakpoint-allocation"; this.#diagnostics.lastCommand = "Debugger.setBreakpoint";
    const pending = (async (): Promise<void> => {
      const raw = await this.#request.call(this.#transport, { method: "Debugger.setBreakpoint", params: { location: requested } });
      const reply = z.object({ breakpointId: token, actualLocation: location }).strict().parse(captureCurrentPcbStringClockReply(raw).value);
      this.#breakpoints.set(site, { id: reply.breakpointId, removal: null, removed: false }); this.#uncertain -= 1;
      if (this.#failed !== null) { void observed(this.#cleanup()); }
      need(JSON.stringify(reply.actualLocation) === JSON.stringify(requested), "BREAKPOINT_RELOCATED");
    })();
    await bounded(pending, currentPcb209RatlineTransportRequestMilliseconds(this.#transport, "Debugger.setBreakpoint")); await this.#current();
  }
  #select(callFrameId: string, expression: Expression, returnByValue = false): Promise<unknown> {
    return this.#send({ method: "Debugger.evaluateOnCallFrame", params: { callFrameId, expression, returnByValue, objectGroup: GROUP,
      silent: true, throwOnSideEffect: true, generatePreview: false, includeCommandLineAPI: false } });
  }
  async #object(frameId: string, expression: Expression): Promise<string> { return remoteObject.parse(await this.#select(frameId, expression)).result.objectId; }
  async #value(frameId: string, expression: Expression): Promise<unknown> { return byValue.parse(await this.#select(frameId, expression, true)).result.value; }
  async #call(objectId: string, functionDeclaration: CurrentPcb209RatlineCaptureProgram, args: readonly string[] = []): Promise<unknown> {
    return byValue.parse(await this.#send({ method: "Runtime.callFunctionOn", params: { objectId, functionDeclaration,
      arguments: args.map(value => ({ objectId: value })), objectGroup: GROUP, returnByValue: true,
      silent: true, throwOnSideEffect: true, generatePreview: false, awaitPromise: false, userGesture: false } })).result.value;
  }
  #get(key: string): string { const value = this.#identities.get(key); need(value !== undefined, "IDENTITY_MISSING"); return value; }
  async #retain(key: string, frameId: string, expression: Expression): Promise<string> {
    const value = await this.#object(frameId, expression);
    const original = this.#identities.get(key);
    if (original === undefined) { this.#identities.set(key, value); } else { need(await this.#call(original, PROGRAMS.same, [value]) === true, "IDENTITY_CHANGED"); }
    return original ?? value;
  }
  async #capturePause(retained: Paused, index: number): Promise<void> {
    this.#diagnostics.step = "pause-validation";
    need(retained.capturedError === null, "EVENT_CAPTURE"); const event = pause.parse(retained.event);
    const profile = this.#profile(), site = profile.sequence[index]; need(site !== undefined, "EXTRA_PAUSE");
    const sites: Readonly<Partial<Record<CurrentPcb209RatlineCaptureSite, Readonly<{ name: string; lineNumber: number; columnNumber: number }>>>> = profile.sites;
    const expected = sites[site], top = event.callFrames[0];
    need(expected !== undefined && top !== undefined && event.hitBreakpoints[0] === this.#breakpoints.get(site)?.id &&
      top.functionName === expected.name && top.location.scriptId === this.#scriptId && top.location.lineNumber === expected.lineNumber &&
      top.location.columnNumber === expected.columnNumber, "PAUSE_LOCATION");
    const frameId = top.callFrameId;
    if (site === "bridge") {
      const self = this.#role === "worker" && index === 0;
      const prefix = self ? "self" : "child";
      const bridge = await this.#retain(`${prefix}Bridge`, frameId, "this");
      const worker = await this.#retain(`${prefix}Worker`, frameId, this.#role === "pcb" ? "t" : "e");
      const bus = await this.#retain(`${prefix}Bus`, frameId, this.#role === "pcb" ? "o" : "t");
      need(await this.#call(bridge, PROGRAMS.bridge, [worker, bus]) === true, "BRIDGE");
      if (self) { await this.#retain("selfWorker", frameId, "self"); }
      else {
        const caller = event.callFrames[1]; need(caller !== undefined && caller.functionName === "addWorker" && caller.location.scriptId === this.#scriptId &&
          caller.location.lineNumber === profile.sites.factory.lineNumber && caller.location.columnNumber < profile.sites.factory.columnNumber &&
          caller.location.columnNumber >= profile.sites.factory.columnNumber - (profile.factoryEnd - profile.factoryStart), "FACTORY_CALLER");
        if (this.#role === "worker") { need(await this.#call(this.#get("selfBus"), PROGRAMS.same, [bus]) === true &&
          await this.#call(this.#get("selfBridge"), PROGRAMS.same, [bridge]) === false, "SUBORDINATE_BRIDGE"); }
      }
    } else if (site === "factory") {
      const manager = await this.#retain("manager", frameId, "this");
      const result = z.object({ nativeWorkerId: nativeId }).strict().parse(await this.#call(manager, PROGRAMS.factory,
        [this.#get("childWorker"), this.#get("childBridge"), this.#get("childBus")])); this.#workerId = result.nativeWorkerId;
    } else if (site === "named") {
      this.#selfId = nativeId.parse(await this.#value(frameId, "t")); await this.#retain("selfWorker", frameId, "self");
      need(await this.#call(this.#get("selfWorker"), PROGRAMS.name) === this.#selfId, "WORKER_NAME");
    } else if (site === "entered") {
      if (this.#role === "worker") { this.#world = worldSchema.parse(await this.#call(await this.#retain("world", frameId, "e"), PROGRAMS.world)); }
      else { const result = payloadSchema.parse(await this.#call(await this.#retain("result", frameId, "o"), PROGRAMS.payload));
        need(JSON.stringify(result) === this.#payload, "RECEIVED_PAYLOAD"); }
    } else if (site === "canvas") {
      const bus = await this.#retain("canvasBus", frameId, "_");
      const request = await this.#retain("canvasRequest", frameId, "O");
      const reply = await this.#retain("canvasReply", frameId, "y");
      const selected = z.object({ documentUuid: worldSchema.shape.documentUuid }).strict().parse(await this.#call(bus, PROGRAMS.canvas, [request, reply]));
      need(selected.documentUuid === this.#world?.documentUuid, "CANVAS_DOCUMENT");
    } else if (site === "initialized") {
      await this.#retain("manager", frameId, "l"); await this.#retain("childBridge", frameId, "h");
      need(await this.#value(frameId, "u") === this.#workerId, "SUBORDINATE_ID");
      need(await this.#call(await this.#object(frameId, "o"), PROGRAMS.empty) === true &&
        await this.#call(await this.#object(frameId, "c"), PROGRAMS.empty) === true, "NONEMPTY_WORK");
    } else if (site === "received") { this.#payload = payloadValue(await this.#value(frameId, "i"), this.#workerId); }
    else if (site === "publication" || site === "returned") {
      if (site === "publication") {
        await this.#retain("selfBridge", frameId, "iY"); await this.#retain("manager", frameId, "l");
        this.#payload = payloadValue(await this.#value(frameId, "f"), this.#selfId);
      } else if (this.#role === "pcb") {
        const result = await this.#call(this.#get("result"), PROGRAMS.payload);
        need(JSON.stringify(payloadSchema.parse(result)) === this.#payload, "TERMINAL_PAYLOAD_CHANGED");
      }
      // V8 may discard locals at return positions. Original remote handles
      // Survive; never replace them with inferred or newly supplied objects.
      need(await this.#call(this.#get("manager"), PROGRAMS.removed) === true, "WORKER_RETAINED");
    }
    this.#events += 1;
  }
  #profile(): typeof CURRENT_PCB_209_RATLINE_CAPTURE_PROFILES[CurrentPcb209RatlineCaptureRole] | typeof CURRENT_PCB_209_RATLINE_HELD_CAPTURE_PROFILE {
    return this.#scope === "pcb-held-prefix" ? CURRENT_PCB_209_RATLINE_HELD_CAPTURE_PROFILE : CURRENT_PCB_209_RATLINE_CAPTURE_PROFILES[this.#role];
  }
  public async capture(): Promise<Packets[Scope]> {
    need(!this.#consumed, "CONSUMED"); this.#consumed = true;
    try {
      this.#diagnostics.stage = "capture-arming"; await this.#current(); this.#unsubscribe = this.#subscribe.call(this.#transport, { paused: this.#paused, resumed: this.#resumed, lost: this.#lost });
      need(typeof this.#unsubscribe === "function", "SUBSCRIPTION");
      const profile = this.#profile();
      let terminalPause: Paused | null = null;
      const sites: Readonly<Record<string, Readonly<{ lineNumber: number; columnNumber: number }>>> = profile.sites;
      for (const [site, point] of Object.entries(sites)) { await this.#arm(site, point); }
      this.#armed.resolve(null);
      this.#diagnostics.stage = "capture";
      for (let index = 0; index < profile.sequence.length; index += 1) {
        this.#diagnostics.step = "pause-wait";
        const retained = await bounded(this.#waiting.promise, currentPcb209RatlineContinuationTiming(this.#transport)?.captureWaitMilliseconds ??
          (this.#role === "pcb" ? CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.elapsed.captureWaitMilliseconds : 20_000));
        this.#waiting = Promise.withResolvers(); void observed(this.#waiting.promise);
        await this.#current(); await this.#capturePause(retained, index);
        if (index === profile.sequence.length - 1) {
          // Poison a newly delivered pause immediately, including during the
          // Last resume and final awaited realm reproof before settlement.
          this.#sequenceExhausted = true; terminalPause = retained; await this.#remove();
        }
        await this.#resume(retained);
      }
      await this.#current();
      need(terminalPause !== null && this.#pause === terminalPause && terminalPause.observed &&
        terminalPause.resume !== null && this.#events === profile.sequence.length, "TERMINAL_PAUSE_CHANGED");
      need(this.#workerId !== null, "INCOMPLETE");
      const common = {
        sourceSha256: CURRENT_PCB_209_RATLINE_SOURCE_PROFILE[this.#role].sha256, nativeWorkerId: this.#workerId,
        originalFactoryAndBridgeEventsRetained: true,
        callbackReturnCompletionVerified: false, nativeWorkerTargetIdentityVerified: false, subscribedCanvasPeerOwnershipVerified: false,
        copperCompletionVerified: false, completeLiveBaselineVerified: false, executionAuthorized: false } as const;
      let packet: CurrentPcb209RatlineAnyCapturePacket;
      if (this.#scope === "pcb-held-prefix") {
        need(this.#events === 2 && this.#payload === null && this.#world === null, "INCOMPLETE");
        packet = Object.freeze({ ...common, profile: "private.current-pcb209-ratline-pcb-held-prefix-capture.v1", pauses: 2, originalFactoryPauseReleased: true });
      } else {
        need(this.#payload !== null, "INCOMPLETE");
        packet = Object.freeze({ ...common, profile: this.#role === "pcb" ? "private.current-pcb209-ratline-pcb-capture.v1" : "private.current-pcb209-ratline-worker-capture.v1",
          pauses: this.#events, resultPayload: this.#payload, world: this.#world === null ? null : Object.freeze({ ...this.#world }), originalTerminalReturnPauseRetained: true });
      }
      // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The private scope selects both its fixed sequence and exact packet branch above; public wrappers cannot choose a different scope.
      this.#packet = packet as Packets[Scope]; issued.set(this.#packet, this); return this.#packet;
    } catch (error) {
      this.#poison("FAILED", error); this.#armed.reject(error);
      try { await this.#cleanup(); } catch (cleanupError) { throw new AggregateError([error, cleanupError], "PCB209_RATLINE_CAPTURE_FAILED", { cause: cleanupError }); }
      throw error;
    } finally { this.#settled = true; }
  }
  public async requireOriginal(packet: Packets[Scope]): Promise<Readonly<Record<string, string>>> {
    need(packet === this.#packet && issued.get(packet) === this, "ORIGINAL_PACKET"); await this.#current(); return Object.freeze(Object.fromEntries(this.#identities));
  }
  /** Abort retains the original allocations and consumes cleanup resumes once. */
  public async abort(): Promise<void> {
    need(this.#consumed && !this.#released, "ABORT_STATE"); this.#lost(); await this.#cleanup();
  }
  public async releaseAfterTermination(): Promise<void> {
    need(this.#settled && !this.#released && !this.#releasing, "RELEASE_STATE"); this.#releasing = true;
    try {
      this.#same(); await bounded(this.#terminate.call(this.#transport)); this.#same();
      clearTimeout(this.#pause?.timer); this.#unsubscribe?.(); this.#unsubscribe = null; this.#released = true;
    } finally { this.#releasing = false; }
  }
}
export class CurrentPcb209RatlinePcbCapture extends CurrentPcb209RatlineCaptureCore<"full"> {
  public constructor(transport: CurrentPcb209RatlineCaptureTransport) { super(INTERNAL, "pcb", "full", transport); }
}
export class CurrentPcb209RatlineWorkerCapture extends CurrentPcb209RatlineCaptureCore<"full"> {
  public constructor(transport: CurrentPcb209RatlineCaptureTransport) { super(INTERNAL, "worker", "full", transport); }
}
export class CurrentPcb209RatlinePcbHeldCapture extends CurrentPcb209RatlineCaptureCore<"pcb-held-prefix"> {
  public constructor(transport: CurrentPcb209RatlineCaptureTransport) { super(INTERNAL, "pcb", "pcb-held-prefix", transport); }
}
