/** Retain the actual manager receiver across the one original Worker expression.
 * The post-constructor pause never resumes on failure. Only the original native
 * message proof permits that resume; otherwise the generation must end. */
import { types } from "node:util";
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { captureCurrentFootprintCopyManagerRouteSourceReply } from "./current-footprint-copy-manager-route-source.ts";
import { CURRENT_FOOTPRINT_COPY_PARENT_WORKER_SITES as SITES, qualifyCurrentFootprintCopyParentWorkerSource } from "./current-footprint-copy-parent-worker-source.ts";
import { CurrentFootprintParentWorkerRunner } from "./current-footprint-copy-parent-worker-runner.ts";
import type { CurrentFootprintParentWorkerObservation } from "./current-footprint-copy-parent-worker-runner.ts";
import { CURRENT_FOOTPRINT_PARENT_CONSTRUCTION_GROUP as GROUP, CURRENT_FOOTPRINT_PARENT_CONSTRUCTION_LIMITS as LIMITS,
  CURRENT_FOOTPRINT_PARENT_CONSTRUCTION_PROGRAMS as PROGRAMS, CURRENT_FOOTPRINT_PARENT_CONSTRUCTION_REQUESTS as REQUESTS } from "./current-footprint-copy-parent-construction-contract.ts";
import type { CurrentFootprintParentConstructionBinding as Binding, CurrentFootprintParentConstructionCommand as Command,
  CurrentFootprintParentConstructionHeld as Held, CurrentFootprintParentConstructionTransport as Transport } from "./current-footprint-copy-parent-construction-contract.ts";

const token = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const location = z.object({ scriptId: token, lineNumber: z.number().int().nonnegative(), columnNumber: z.number().int().nonnegative() }).strict();
const frame = z.looseObject({ callFrameId: token, functionName: z.literal("open"), location });
const paused = z.looseObject({ reason: z.literal("other"), hitBreakpoints: z.array(token).length(1), callFrames: z.array(z.unknown()).min(1).max(16) });
const breakpointReply = z.object({ breakpointId: token, actualLocation: location }).strict();
const receiverReply = z.object({ result: z.object({ type: z.literal("object"), className: z.literal("sl"), description: z.literal("sl"), objectId: token }).strict() }).strict();
const yes = z.object({ result: z.object({ type: z.literal("boolean"), value: z.literal(true) }).strict() }).strict();
const empty = z.object({}).strict();
const bindingSchema = z.object({ sessionId: token, uniqueContextId: token, managerScriptId: token,
  projectUuid: z.string().regex(/^[a-f\d]{64}$/u), windowTabId: z.string().regex(/^[A-Za-z\d_-]{1,128}$/u) }).strict();
// oxlint-disable-next-line typescript/unbound-method -- Call the captured implementation only with the validated original peer receiver.
const requirePeerParent = CurrentFootprintParentWorkerRunner.prototype.requireOriginalHeldParent;
const issuedFailures = new WeakMap<Error, string>();
function fail(code: string): Error {
  const error = new Error(`FOOTPRINT_PARENT_CONSTRUCTION_${code}`); issuedFailures.set(error, code); return error;
}
function need(value: boolean, code: string): asserts value { if (!value) { throw fail(code); } }
async function bounded<T>(promise: Promise<T>, milliseconds: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = Promise.withResolvers<never>();
  try { timer = setTimeout(() => { deadline.reject(fail("DEADLINE")); }, milliseconds); return await Promise.race([promise, deadline.promise]); }
  finally { clearTimeout(timer); }
}
async function observeRejection(promise: Promise<unknown>): Promise<void> {
  try { await promise; } catch {
    // The original event owner retains the same failure for its public await.
  }
}
function members(transport: Transport): readonly unknown[] {
  need(!types.isProxy(transport) && (Object.getPrototypeOf(transport) === Object.prototype || Object.getPrototypeOf(transport) === null), "TRANSPORT");
  const names = ["assertOriginalOwner", "request", "subscribe", "assertOriginalGenerationExited"] as const;
  need(Reflect.ownKeys(transport).length === names.length, "TRANSPORT");
  return names.map(name => { const item = Object.getOwnPropertyDescriptor(transport, name);
    need(item !== undefined && Object.hasOwn(item, "value") && typeof item.value === "function", "TRANSPORT"); return item.value as unknown; });
}
interface Pause {
  readonly side: "before" | "after";
  readonly frameId: string;
  readonly resumed: PromiseWithResolvers<null>;
  resumeAttempted: boolean;
  resumeObserved: boolean;
}
interface Breakpoint { readonly id: string; removalAttempted: boolean; removed: boolean }
type ParentPhase = "idle" | "waiting-before" | "waiting-after" | "held" | Command["phase"];
interface ParentFailure {
  readonly code: string;
  readonly phase: ParentPhase;
  readonly expectedPause: "before" | "after" | "none";
  readonly observedPause: "before" | "after" | null;
  readonly requests: number;
  readonly replies: number;
}
export class CurrentFootprintParentConstructionRunner {
  readonly #transport: Transport;
  readonly #members: readonly unknown[];
  readonly #binding: Binding;
  readonly #owner: Transport["assertOriginalOwner"];
  readonly #send: Transport["request"];
  readonly #subscribe: Transport["subscribe"];
  readonly #exited: Transport["assertOriginalGenerationExited"];
  readonly #before = Promise.withResolvers<Pause>();
  readonly #after = Promise.withResolvers<Pause>();
  readonly #held = Promise.withResolvers<Held>();
  readonly #breakpoints = new Map<"before" | "after", Breakpoint>();
  readonly #raw: unknown[] = [];
  #expected: "before" | "after" | "none" = "none";
  #activePause: Pause | null = null;
  #heldBinding: Held | null = null;
  #failed: Error | null = null;
  #phase: ParentPhase = "idle";
  #firstFailure: ParentFailure | null = null;
  #unsubscribe: (() => void) | null = null;
  #holdTimer: ReturnType<typeof setTimeout> | undefined;
  #armAttempted = false;
  #armed = false;
  #captureAttempted = false;
  #resumeAttempted = false;
  #resumed = false;
  #releaseAttempted = false;
  #released = false;
  #generationEnded = false;
  #busy = false;
  #ending = false;
  #idle: Promise<null> = Promise.resolve(null);
  #resolveIdle: (() => void) | null = null;
  #requests = 0;
  #operationRequests = 0;
  #limit = 0;
  public constructor(transport: Transport, binding: Binding) {
    this.#transport = transport; this.#members = members(transport);
    this.#binding = Object.freeze(bindingSchema.parse(captureCurrentPcbStringClockReply(binding).value));
    this.#owner = transport.assertOriginalOwner; this.#send = transport.request; this.#subscribe = transport.subscribe; this.#exited = transport.assertOriginalGenerationExited;
    // Event failures can precede the caller's await. Retain the same rejected
    // Promises while preventing an unrelated unhandled-rejection termination.
    for (const promise of [this.#before.promise, this.#after.promise, this.#held.promise]) { void observeRejection(promise); }
  }
  #begin(): void {
    need(!this.#busy && !this.#ending, "BUSY"); this.#busy = true;
    const idle = Promise.withResolvers<null>(); this.#idle = idle.promise; this.#resolveIdle = (): void => { idle.resolve(null); };
  }
  #end(): void { this.#busy = false; this.#resolveIdle?.(); this.#resolveIdle = null; }
  #same(): void { need(members(this.#transport).every((item, index) => item === this.#members[index]), "OWNER_CHANGED"); }
  #live(): void { this.#same(); if (this.#failed !== null) { throw this.#failed; } need(!this.#released && !this.#generationEnded, "ENDED"); }
  async #current(): Promise<void> { this.#live(); await bounded(this.#owner(), LIMITS.ownerMs); this.#live(); }
  #refuse(error: unknown): void {
    if (this.#firstFailure === null) {
      // These labels come only from our fixed errors. Never publish a native
      // Exception message, actor value, source text or remote object handle.
      const issued = error instanceof Error ? issuedFailures.get(error) : undefined;
      const code = issued ?? (error instanceof z.ZodError ? "REPLY_SCHEMA" : "DEPENDENCY_FAILURE");
      this.#firstFailure = Object.freeze({ code, phase: this.#phase, expectedPause: this.#expected,
        observedPause: this.#activePause?.side ?? null, requests: this.#requests, replies: this.#raw.length });
    }
    this.#failed ??= error instanceof Error ? error : fail("EVENT");
    clearTimeout(this.#holdTimer);
    this.#before.reject(this.#failed); this.#after.reject(this.#failed); this.#held.reject(this.#failed); this.#activePause?.resumed.reject(this.#failed);
  }
  #paused(input: unknown): void {
    try {
      const raw = captureCurrentPcbStringClockReply(input).value; this.#raw.push(raw); this.#live();
      need(this.#armed && this.#activePause === null && this.#expected !== "none", "UNEXPECTED_PAUSE");
      const event = paused.parse(raw), first = frame.parse(event.callFrames[0]);
      const side = this.#expected; const point = SITES[side];
      need(event.hitBreakpoints[0] === this.#breakpoints.get(side)?.id && first.location.scriptId === this.#binding.managerScriptId &&
        first.location.lineNumber === point.lineNumber && first.location.columnNumber === point.columnNumber, "PAUSE_LOCATION");
      const value: Pause = { side, frameId: first.callFrameId, resumed: Promise.withResolvers<null>(), resumeAttempted: false, resumeObserved: false };
      void observeRejection(value.resumed.promise); this.#activePause = value; this.#expected = "none";
      (side === "before" ? this.#before : this.#after).resolve(value);
    } catch (error) { this.#refuse(error); }
  }
  #onResumed(): void {
    const current = this.#activePause;
    if (current === null || !current.resumeAttempted || current.resumeObserved) { this.#refuse(fail("UNEXPECTED_RESUME")); return; }
    current.resumeObserved = true; current.resumed.resolve(null); this.#activePause = null;
  }
  async #request(command: Command): Promise<unknown> {
    this.#phase = command.phase;
    await this.#current(); need(this.#operationRequests < this.#limit, "BUDGET"); this.#operationRequests += 1; this.#requests += 1;
    const raw = await bounded(this.#send(command), LIMITS.requestMs);
    const reply = command.phase === "source" ? captureCurrentFootprintCopyManagerRouteSourceReply(raw) : captureCurrentPcbStringClockReply(raw).value;
    this.#raw.push(reply); await this.#current(); return reply;
  }
  async #source(): Promise<void> {
    const reply = captureCurrentFootprintCopyManagerRouteSourceReply(await this.#request({ phase: "source", method: "Debugger.getScriptSource", sessionId: this.#binding.sessionId,
      params: { scriptId: this.#binding.managerScriptId } })); qualifyCurrentFootprintCopyParentWorkerSource(reply.scriptSource);
  }
  async #remove(side: "before" | "after"): Promise<void> {
    const value = this.#breakpoints.get(side); need(value !== undefined && !value.removalAttempted, "BREAKPOINT_REMOVE"); value.removalAttempted = true;
    empty.parse(await this.#request({ phase: "remove", method: "Debugger.removeBreakpoint", sessionId: this.#binding.sessionId, params: { breakpointId: value.id } })); value.removed = true;
  }
  async #resume(pause: Pause): Promise<void> {
    need(this.#activePause === pause && !pause.resumeAttempted && !pause.resumeObserved, "RESUME_CONSUMED"); pause.resumeAttempted = true;
    empty.parse(await this.#request({ phase: "resume", method: "Debugger.resume", sessionId: this.#binding.sessionId, params: {} }));
    await bounded(pause.resumed.promise, LIMITS.requestMs); this.#live();
  }
  async #receiver(pause: Pause): Promise<string> {
    need(this.#activePause === pause && !pause.resumeAttempted, "RECEIVER");
    const reply = receiverReply.parse(await this.#request({ phase: "receiver", method: "Debugger.evaluateOnCallFrame", sessionId: this.#binding.sessionId,
      params: { callFrameId: pause.frameId, expression: "this", objectGroup: GROUP, silent: true, returnByValue: false, generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false } }));
    return reply.result.objectId;
  }
  async #relation(side: "before" | "after", receiver: string, original?: string): Promise<void> {
    const args: Readonly<{ value: string } | { objectId: string }>[] = [{ value: this.#binding.projectUuid }, { value: this.#binding.windowTabId }];
    if (side === "after") { need(original !== undefined, "ORIGINAL_RECEIVER"); args.unshift({ objectId: original }); }
    yes.parse(await this.#request({ phase: side, method: "Runtime.callFunctionOn", sessionId: this.#binding.sessionId,
      params: { objectId: receiver, functionDeclaration: PROGRAMS[side], arguments: args, objectGroup: GROUP, returnByValue: true, awaitPromise: false,
        silent: true, generatePreview: false, userGesture: false, throwOnSideEffect: true } }));
  }
  public async arm(): Promise<void> {
    need(!this.#armAttempted && !this.#busy, "ARM_CONSUMED"); this.#armAttempted = true; this.#begin(); this.#limit = REQUESTS.arm; this.#operationRequests = 0;
    try {
      await this.#current(); this.#unsubscribe = this.#subscribe({ paused: input => { this.#paused(input); }, resumed: () => { this.#onResumed(); }, lost: () => { this.#refuse(fail("LOST")); } });
      this.#live(); await this.#source();
      for (const side of ["before", "after"] as const) {
        const point = SITES[side]; const expected = { scriptId: this.#binding.managerScriptId, lineNumber: point.lineNumber, columnNumber: point.columnNumber };
        const reply = breakpointReply.parse(await this.#request({ phase: side === "before" ? "breakpoint-before" : "breakpoint-after", method: "Debugger.setBreakpoint", sessionId: this.#binding.sessionId, params: { location: expected } }));
        this.#breakpoints.set(side, { id: reply.breakpointId, removalAttempted: false, removed: false });
        need(reply.actualLocation.scriptId === expected.scriptId && reply.actualLocation.lineNumber === expected.lineNumber && reply.actualLocation.columnNumber === expected.columnNumber, "BREAKPOINT_RELOCATED");
      }
      need(this.#operationRequests === REQUESTS.arm && this.#breakpoints.get("before")?.id !== this.#breakpoints.get("after")?.id, "ARM_COUNT");
      this.#armed = true; this.#expected = "before";
    } catch (error) { this.#refuse(error); throw error; } finally { this.#end(); }
  }
  public async captureUntilHeld(): Promise<Held> {
    need(this.#armed && !this.#captureAttempted && !this.#busy, "CAPTURE_CONSUMED"); this.#captureAttempted = true; this.#begin(); this.#limit = REQUESTS.capture; this.#operationRequests = 0;
    try {
      this.#phase = "waiting-before";
      const before = await bounded(this.#before.promise, LIMITS.pauseMs); await this.#current();
      const original = await this.#receiver(before); await this.#relation("before", original); await this.#remove("before");
      this.#expected = "after"; await this.#resume(before);
      this.#phase = "waiting-after";
      const after = await bounded(this.#after.promise, LIMITS.pauseMs); await this.#current();
      const receiver = await this.#receiver(after); await this.#relation("after", receiver, original); await this.#remove("after");
      need(this.#operationRequests === REQUESTS.capture && this.#activePause === after && !after.resumeAttempted, "HOLD_STATE");
      this.#heldBinding = Object.freeze({ parentSessionId: this.#binding.sessionId, parentUniqueContextId: this.#binding.uniqueContextId, projectObjectId: receiver });
      this.#phase = "held";
      this.#holdTimer = setTimeout(() => { this.#refuse(fail("HOLD_DEADLINE")); }, LIMITS.holdMs);
      this.#held.resolve(this.#heldBinding); return this.#heldBinding;
    } catch (error) { this.#refuse(error); throw error; } finally { this.#end(); }
  }
  public async whenHeld(): Promise<Held> { const value = await this.#held.promise; await this.requireOriginalHeld(value); return value; }
  public async requireOriginalHeld(value: Held): Promise<void> {
    this.#live(); need(value === this.#heldBinding && !this.#resumed && this.#activePause?.side === "after" && !this.#activePause.resumeAttempted, "ORIGINAL_HOLD");
    await this.#current(); need(value === this.#heldBinding && !this.#resumed && this.#activePause?.side === "after" && !this.#activePause.resumeAttempted, "ORIGINAL_HOLD");
  }
  #originalParent(value: Held): void {
    this.#same(); if (this.#failed !== null) { throw this.#failed; }
    need(value === this.#heldBinding && !this.#generationEnded && (this.#resumed ||
      this.#activePause?.side === "after" && !this.#activePause.resumeAttempted), "ORIGINAL_PARENT");
  }
  /** Group release retires debugger handles, not the original parent identity.
   * The peer's separate group retains the actual project/Worker references. */
  public async requireOriginalParent(value: Held): Promise<void> {
    this.#originalParent(value); await bounded(this.#owner(), LIMITS.ownerMs); this.#originalParent(value);
  }
  public async resumeAfterPeer(peer: CurrentFootprintParentWorkerRunner, packet: CurrentFootprintParentWorkerObservation): Promise<void> {
    need(!this.#busy && !this.#resumeAttempted && this.#heldBinding !== null && this.#activePause?.side === "after" && !types.isProxy(peer) && Object.getPrototypeOf(peer) === CurrentFootprintParentWorkerRunner.prototype, "RESUME_PEER");
    this.#begin(); this.#resumeAttempted = true; this.#limit = REQUESTS.resume; this.#operationRequests = 0;
    try {
      await this.#current(); await requirePeerParent.call(peer, packet, this.#heldBinding); await this.#current();
      await this.#source(); const current = this.#activePause; need(current?.side === "after", "RESUME_HOLD"); await this.#resume(current);
      need(this.#operationRequests === REQUESTS.resume, "RESUME_COUNT"); clearTimeout(this.#holdTimer); this.#resumed = true;
    } catch (error) { this.#refuse(error); throw error; } finally { this.#end(); }
  }
  public retained(): Readonly<{ armed: boolean; captured: boolean; held: boolean; resumeAttempted: boolean; resumed: boolean;
    failed: boolean; requests: number; released: boolean; originalGenerationEnded: boolean; replies: readonly unknown[] }> {
    return Object.freeze({ armed: this.#armed, captured: this.#heldBinding !== null, held: this.#activePause !== null, resumeAttempted: this.#resumeAttempted,
      resumed: this.#resumed, failed: this.#failed !== null, requests: this.#requests, released: this.#released,
      originalGenerationEnded: this.#generationEnded, replies: Object.freeze([...this.#raw]) });
  }
  public diagnostics(): Readonly<{ phase: ParentPhase; firstFailure: ParentFailure | null; armed: boolean;
    captured: boolean; held: boolean; resumed: boolean; requests: number; replies: number }> {
    return Object.freeze({ phase: this.#phase, firstFailure: this.#firstFailure, armed: this.#armed,
      captured: this.#heldBinding !== null, held: this.#activePause !== null, resumed: this.#resumed,
      requests: this.#requests, replies: this.#raw.length });
  }
  public async release(): Promise<void> {
    need(!this.#busy && this.#resumed && !this.#releaseAttempted, "RELEASE"); this.#releaseAttempted = true; this.#begin(); this.#limit = REQUESTS.release; this.#operationRequests = 0;
    try {
      need([...this.#breakpoints.values()].every(value => value.removed) && this.#activePause === null, "RELEASE_PAUSE");
      empty.parse(await this.#request({ phase: "release", method: "Runtime.releaseObjectGroup", sessionId: this.#binding.sessionId, params: { objectGroup: GROUP } }));
      this.#unsubscribe?.(); this.#unsubscribe = null; this.#released = true;
    } catch (error) { this.#refuse(error); throw error; } finally { this.#end(); }
  }
  public async observeOriginalGenerationEnded(): Promise<void> {
    need(this.#armAttempted && !this.#generationEnded && !this.#ending, "GENERATION"); this.#ending = true;
    const originalIdle = this.#idle;
    try {
      this.#same(); await bounded(this.#exited(), LIMITS.ownerMs); this.#same();
      // Only the original root/Job exit proof may end a pending capture. Reject
      // Its owned waits and let its original finally settle; send no resume.
      if (this.#busy) { this.#refuse(fail("ORIGINAL_GENERATION_ENDED")); }
      clearTimeout(this.#holdTimer);
      await bounded(originalIdle, LIMITS.ownerMs + LIMITS.requestMs); this.#same();
      need(!this.#busy && this.#idle === originalIdle, "ORIGINAL_OPERATION_UNSETTLED");
      this.#unsubscribe?.(); this.#unsubscribe = null; this.#generationEnded = true; this.#released = true; this.#activePause = null; this.#expected = "none";
    } finally { this.#ending = false; }
  }
}
