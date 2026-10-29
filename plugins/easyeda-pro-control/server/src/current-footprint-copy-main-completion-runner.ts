/** Unmounted fixed completion sequencer. It observes one existing invocation;
 * it never dispatches copy, SQL, HTTP, a clock or Save. The genuine combined
 * native origin must share the original main allocator, cursor and root/Job. */
/* oxlint-disable import/max-dependencies -- Original held authority, native origin, pinned source, finite protocol and independent reply decoders all remain explicit at this boundary. */
import { performance } from "node:perf_hooks";
import { setTimeout as delay } from "node:timers/promises";
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { requireCurrentFootprintCopyMainRequestHeldFinalPb } from "./current-footprint-copy-main-request-runner.ts";
import { requireCurrentFootprintCopyMainCompletionOrigin } from "./current-footprint-copy-main-completion-origin.ts";
import type { CurrentFootprintCopyMainCompletionOrigin } from "./current-footprint-copy-main-completion-origin.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_ORDER as ORDER, requireCurrentFootprintCopyMainCompletionSource } from "./current-footprint-copy-main-completion-source.ts";
import type { CurrentFootprintCopyMainCompletionStage as Stage } from "./current-footprint-copy-main-completion-source.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_EXPRESSIONS as EXPRESSIONS, CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_PROGRAMS as PROGRAMS } from "./current-footprint-copy-main-completion-programs.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_REQUEST_GROUP as GROUP } from "./current-footprint-copy-main-request-programs.ts";
import { decodeCurrentFootprintCopyMainRequestArrayCapture } from "./current-footprint-copy-main-request-protocol.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_FLAGS as FLAGS, CURRENT_FOOTPRINT_COPY_MAIN_COMPLETION_REQUESTS as REQUESTS,
  currentFootprintCopyMainCompletionAllocatedId, currentFootprintCopyMainCompletionNativeCommand, currentFootprintCopyMainCompletionSourceArm,
  decodeCurrentFootprintCopyMainCompletionAllocation, decodeCurrentFootprintCopyMainCompletionCallback, decodeCurrentFootprintCopyMainCompletionCallbackMetadata,
  decodeCurrentFootprintCopyMainCompletionPause, decodeCurrentFootprintCopyMainCompletionValue,
  requireCurrentFootprintCopyMainCompletionEmpty, validateCurrentFootprintCopyMainCompletionCommand } from "./current-footprint-copy-main-completion-protocol.ts";
import type { CurrentFootprintCopyMainCompletionCommand as Command } from "./current-footprint-copy-main-completion-protocol.ts";

type Origin = ReturnType<typeof requireCurrentFootprintCopyMainCompletionOrigin>;
type Held = ReturnType<typeof requireCurrentFootprintCopyMainRequestHeldFinalPb>;
type Value = ReturnType<typeof decodeCurrentFootprintCopyMainCompletionValue>;
interface Point { readonly stage: Stage; readonly id: string; attempted: boolean; removed: boolean }
interface Pause { readonly stage: Stage | "original-final-pb"; readonly frameId: string; readonly callerFrameId: string | null; attempted: boolean; resumed: boolean }
type Phase = "ready" | "arming" | "armed" | "collecting" | "collected" | "failed";
interface Failure { readonly phase: Phase; readonly normalRequests: number; readonly cleanupRequests: number;
  readonly completedPauses: number; readonly applicationEffectsMayHaveOccurred: true }
export interface CurrentFootprintCopyMainCompletionObservation {
  readonly profile: "private.current-footprint-copy-main-completion-observation.v1";
  readonly value: Value;
  readonly originalFinalPbResumedOnce: true;
  readonly allFourteenCompletionPausesResumed: true;
  readonly allAllocatedCompletionBreakpointsRemoved: true;
  readonly objectGroupReleased: false;
  readonly nativeSqlCompletionVerified: false;
  readonly originalGenerationClosed: false;
  readonly savedResultVerified: false;
  readonly executionAuthorized: false;
}
const issued = new WeakMap<CurrentFootprintCopyMainCompletionObservation, CurrentFootprintCopyMainCompletionRunner>();
const consumed = new WeakSet<object>();
const events = z.discriminatedUnion("method", [z.object({ method: z.literal("Debugger.paused"), params: z.unknown() }).strict(),
  z.object({ method: z.literal("Debugger.resumed"), params: z.object({}).strict() }).strict()]);
function need(value: boolean, detail: string): asserts value { if (!value) { throw new Error(`FOOTPRINT_MAIN_COMPLETION_${detail}`); } }
export class CurrentFootprintCopyMainCompletionRunner {
  readonly #token: CurrentFootprintCopyMainCompletionOrigin;
  readonly #origin: Origin;
  readonly #held: Held;
  readonly #points: Point[] = [];
  readonly #pauses: Pause[] = [];
  readonly #packets = new Map<Stage, string>();
  readonly #originalPause: Pause;
  #phase: Phase = "ready";
  #busy = false;
  #started = 0;
  #normal = 0;
  #cleanup = 0;
  #replies = 0;
  #unknownPause = false;
  #allocationUncertain = false;
  #resuming: Pause | null = null;
  #cleanupAttempted = false;
  #groupAttempted = false;
  #groupReleased = false;
  #retired = false;
  #ending = false;
  #generationEnded = false;
  #packet: CurrentFootprintCopyMainCompletionObservation | null = null;
  #firstFailure: Failure | null = null;
  #idle: Promise<null> = Promise.resolve(null);
  #resolveIdle: (() => void) | null = null;
  public constructor(token: CurrentFootprintCopyMainCompletionOrigin) {
    this.#origin = requireCurrentFootprintCopyMainCompletionOrigin(token); this.#token = token;
    this.#held = requireCurrentFootprintCopyMainRequestHeldFinalPb(this.#origin.heldFinalPb);
    need(this.#held.scriptId === this.#origin.scriptId, "ORIGINAL_SCRIPT"); requireCurrentFootprintCopyMainCompletionSource(this.#origin.source);
    this.#originalPause = { stage: "original-final-pb", frameId: this.#held.finalPbFrameId, callerFrameId: null, attempted: false, resumed: false };
  }
  #same(cleanup = false): void {
    need(!this.#retired && !this.#generationEnded && requireCurrentFootprintCopyMainCompletionOrigin(this.#token) === this.#origin, "ORIGINAL_OWNER");
    requireCurrentFootprintCopyMainCompletionSource(this.#origin.source);
    need(cleanup || !this.#cleanupAttempted && !this.#ending && this.#phase !== "failed", "FAILED");
    need(cleanup || this.#started === 0 || performance.now() - this.#started < 300_000, "DEADLINE");
  }
  async #current(cleanup = false): Promise<void> {
    this.#same(cleanup); await (cleanup ? this.#origin.assertCleanup() : this.#origin.assertOriginal()); this.#same(cleanup);
    // The native issuer must consume/transfer this exact held lease immediately
    // Before its first original-PB resume. Once transferred, only that issuer's
    // Original kernel/channel assertions qualify later completion operations.
    if (!this.#originalPause.attempted && !cleanup) {
      need(requireCurrentFootprintCopyMainRequestHeldFinalPb(this.#origin.heldFinalPb) === this.#held, "ORIGINAL_HELD_LEASE");
      await this.#held.assertOriginal(); this.#same();
    }
  }
  #begin(): void { need(!this.#busy && !this.#ending, "BUSY"); this.#busy = true; const idle = Promise.withResolvers<null>(); this.#idle = idle.promise; this.#resolveIdle = (): void => { idle.resolve(null); }; }
  #end(): void { this.#busy = false; this.#resolveIdle?.(); this.#resolveIdle = null; }
  #failed(): void {
    this.#firstFailure ??= Object.freeze({ phase: this.#phase, normalRequests: this.#normal, cleanupRequests: this.#cleanup,
      completedPauses: this.#pauses.filter(value => value.resumed).length, applicationEffectsMayHaveOccurred: true }); this.#phase = "failed";
  }
  #drain(): void {
    for (let count = 0; count < 48; count += 1) {
      const raw = this.#origin.takeEvent(); if (raw === null) { return; }
      let event: z.infer<typeof events>;
      try { event = events.parse(captureCurrentPcbStringClockReply(raw).value); }
      catch (error) { this.#unknownPause = true; throw error; }
      this.#replies += 1;
      if (event.method === "Debugger.resumed") {
        const current = this.#resuming;
        if (current === null || !current.attempted || current.resumed) { this.#unknownPause = true; throw new Error("FOOTPRINT_MAIN_COMPLETION_UNEXPECTED_RESUME"); }
        current.resumed = true; this.#resuming = null;
      } else {
        const stage = ORDER[this.#pauses.length];
        const point = this.#points.find(value => value.stage === stage), previous = this.#pauses.at(-1) ?? this.#originalPause;
        try {
          need(this.#phase === "collecting" && this.#originalPause.resumed && previous.resumed && stage !== undefined && point !== undefined, "UNEXPECTED_PAUSE");
          const pause = decodeCurrentFootprintCopyMainCompletionPause(event.params, stage, this.#origin.scriptId, point.id);
          this.#pauses.push({ stage, ...pause, attempted: false, resumed: false });
        } catch (error) { this.#unknownPause = true; throw error; }
      }
    }
    this.#unknownPause = true; throw new Error("FOOTPRINT_MAIN_COMPLETION_EVENT_BOUND");
  }
  async #send(input: Command, cleanup = false, allocation?: Stage): Promise<unknown> {
    await this.#current(cleanup); this.#drain(); need(cleanup ? this.#cleanup < REQUESTS.cleanup : this.#normal < REQUESTS.normal, "REQUEST_BOUND");
    const command = validateCurrentFootprintCopyMainCompletionCommand(input); currentFootprintCopyMainCompletionNativeCommand(command, 2_147_483_647);
    if (cleanup) { this.#cleanup += 1; } else { this.#normal += 1; } if (allocation !== undefined) { this.#allocationUncertain = true; }
    const reply = captureCurrentPcbStringClockReply(await this.#origin.request(command, cleanup)).value; this.#replies += 1;
    if (allocation !== undefined) {
      const id = currentFootprintCopyMainCompletionAllocatedId(reply);
      if (id !== null && !this.#points.some(value => value.id === id)) { this.#points.push({ stage: allocation, id, attempted: false, removed: false }); this.#allocationUncertain = false; }
    }
    await this.#current(cleanup); this.#drain(); return reply;
  }
  async #wait(predicate: () => boolean): Promise<void> {
    while (!predicate()) { await this.#current(); this.#drain(); if (predicate()) { return; }
      await this.#origin.pump(false); await this.#current(); this.#drain(); if (!predicate()) { await delay(10); } }
  }
  async #allocate(stage: Stage, callbackId?: string): Promise<void> {
    const command = stage === "callback-enter" ? validateCurrentFootprintCopyMainCompletionCommand({ phase: "completion-callback-arm", method: "Debugger.setBreakpointOnFunctionCall", params: { objectId: callbackId } }) :
      currentFootprintCopyMainCompletionSourceArm(stage, this.#origin.scriptId);
    const reply = await this.#send(command, false, stage);
    const id = decodeCurrentFootprintCopyMainCompletionAllocation(reply, stage, this.#origin.scriptId);
    need(this.#points.at(-1)?.id === id && this.#points.at(-1)?.stage === stage, "ALLOCATION");
  }
  public async arm(): Promise<void> {
    need(this.#phase === "ready" && !consumed.has(this.#token), "ARM_CONSUMED"); consumed.add(this.#token); this.#begin(); this.#phase = "arming"; this.#started = performance.now();
    try { for (const stage of ORDER) { if (stage !== "callback-enter") { await this.#allocate(stage); } }
      need(this.#normal === ORDER.length - 1 && this.#points.length === ORDER.length - 1, "ARM_COUNT"); this.#phase = "armed";
    } catch (error) { this.#failed(); throw error; } finally { this.#end(); }
  }
  #previous(stage: Stage): string { const value = this.#packets.get(stage); need(value !== undefined, "ORIGINAL_PACKET"); return value; }
  async #frame(pause: Pause, role: keyof typeof EXPRESSIONS): Promise<string> {
    const frameId = role === "project-sql-caller" ? pause.callerFrameId : pause.frameId; need(frameId !== null, "ORIGINAL_CALLER");
    const reply = await this.#send({ phase: "completion-frame", role, method: "Debugger.evaluateOnCallFrame", params: {
      callFrameId: frameId, expression: EXPRESSIONS[role], objectGroup: GROUP, silent: true, returnByValue: false,
      generatePreview: false, throwOnSideEffect: true, includeCommandLineAPI: false } });
    const sizes = { save: 4, "transaction-enter": 2, "callback-enter": 5, branch: 6, append: 4, "branch-return": 7,
      "commit-enter": 2, "commit-return": 2, "transaction-return": 2, "save-post-transaction": 6, "project-sql": 4,
      "project-sql-caller": 6, "project-return": 4, "save-return": 6, "controller-return": 5 } as const;
    return decodeCurrentFootprintCopyMainRequestArrayCapture(reply, sizes[role]);
  }
  async #capture(pause: Pause, stage: Stage): Promise<Value | null> {
    const frame = await this.#frame(pause, stage), selector = PROGRAMS[stage]; let argumentsList: { objectId: string }[];
    if (stage === "save") { argumentsList = [{ objectId: this.#held.actorObjectId }, { objectId: this.#held.sqlObjectId }]; }
    else if (stage === "transaction-return") { argumentsList = [{ objectId: this.#previous("transaction-enter") }, { objectId: this.#previous("commit-return") }]; }
    else if (stage === "project-sql") { argumentsList = [{ objectId: await this.#frame(pause, "project-sql-caller") }, { objectId: this.#previous("save-post-transaction") }]; }
    else { const index = ORDER.indexOf(stage), previous = ORDER[index - 1]; need(previous !== undefined, "STAGE_ORDER"); argumentsList = [{ objectId: this.#previous(previous) }]; }
    const reply = await this.#send({ phase: "completion-join", stage, method: "Runtime.callFunctionOn", params: { ...FLAGS,
      objectId: frame, functionDeclaration: selector.program, arguments: argumentsList, returnByValue: selector.returnByValue } });
    if (stage === "controller-return") { return decodeCurrentFootprintCopyMainCompletionValue(reply); }
    const packet = decodeCurrentFootprintCopyMainRequestArrayCapture(reply, selector.length); this.#packets.set(stage, packet);
    if (stage === "transaction-enter") {
      const properties = (objectId: string): Promise<unknown> => this.#send({ phase: "completion-properties", method: "Runtime.getProperties",
        params: { objectId, ownProperties: true, accessorPropertiesOnly: false, generatePreview: false } });
      const callback = decodeCurrentFootprintCopyMainCompletionCallback(await properties(packet));
      decodeCurrentFootprintCopyMainCompletionCallbackMetadata(await properties(callback), this.#origin.scriptId);
      await this.#allocate("callback-enter", callback);
    }
    return null;
  }
  async #remove(point: Point): Promise<void> {
    if (point.removed) { return; } need(!point.attempted, "REMOVE_CONSUMED"); point.attempted = true;
    requireCurrentFootprintCopyMainCompletionEmpty(await this.#send({ phase: "completion-remove", method: "Debugger.removeBreakpoint", params: { breakpointId: point.id } }, true)); point.removed = true;
  }
  async #resume(pause: Pause): Promise<void> {
    if (pause.stage === "original-final-pb") { await this.#current(); }
    need(!pause.attempted && !pause.resumed && this.#resuming === null, "RESUME_CONSUMED"); pause.attempted = true; this.#resuming = pause;
    requireCurrentFootprintCopyMainCompletionEmpty(await this.#send({ phase: pause.stage === "original-final-pb" ? "completion-resume-final-pb" : "completion-resume", method: "Debugger.resume", params: {} }, true));
    await this.#wait(() => pause.resumed);
  }
  public async collect(): Promise<CurrentFootprintCopyMainCompletionObservation> {
    need(this.#phase === "armed" && this.#packet === null, "COLLECT_CONSUMED"); this.#begin(); this.#phase = "collecting";
    try {
      await this.#resume(this.#originalPause); let value: Value | null = null;
      for (const [index, stage] of ORDER.entries()) {
        await this.#wait(() => this.#pauses[index] !== undefined); const pause = this.#pauses[index], point = this.#points.find(item => item.stage === stage);
        need(pause?.stage === stage && point !== undefined, "PAUSE_ORDER"); value = await this.#capture(pause, stage) ?? value;
        await this.#remove(point); await this.#resume(pause);
      }
      need(value !== null && this.#normal === REQUESTS.normal && this.#cleanup === REQUESTS.cleanup - 1 && !this.#allocationUncertain &&
        !this.#unknownPause && this.#resuming === null && this.#points.every(point => point.removed) && this.#pauses.every(pause => pause.resumed), "INCOMPLETE");
      this.#packet = freezeDeep({ profile: "private.current-footprint-copy-main-completion-observation.v1", value,
        originalFinalPbResumedOnce: true, allFourteenCompletionPausesResumed: true, allAllocatedCompletionBreakpointsRemoved: true,
        objectGroupReleased: false, nativeSqlCompletionVerified: false, originalGenerationClosed: false, savedResultVerified: false, executionAuthorized: false });
      issued.set(this.#packet, this); this.#phase = "collected"; return this.#packet;
    } catch (error) { this.#failed(); throw error; } finally { this.#end(); }
  }
  public async requireOriginal(packet: CurrentFootprintCopyMainCompletionObservation): Promise<void> {
    need(!this.#busy && packet === this.#packet && issued.get(packet) === this && this.#phase === "collected", "ORIGINAL_PACKET");
    await this.#current(); need(packet === this.#packet && issued.get(packet) === this, "ORIGINAL_PACKET");
  }
  public async cleanup(): Promise<void> {
    need(!this.#cleanupAttempted, "CLEANUP_CONSUMED"); this.#begin(); this.#cleanupAttempted = true;
    try {
      const errors: unknown[] = []; for (const point of this.#points) { try { await this.#remove(point); } catch (error) { errors.push(error); } }
      need(errors.length === 0 && !this.#allocationUncertain && !this.#unknownPause && this.#resuming === null &&
        this.#originalPause.resumed && this.#pauses.every(pause => pause.resumed), "GENERATION_CLOSURE_REQUIRED");
      need(!this.#groupAttempted, "RELEASE_CONSUMED"); this.#groupAttempted = true;
      requireCurrentFootprintCopyMainCompletionEmpty(await this.#send({ phase: "completion-release", method: "Runtime.releaseObjectGroup", params: { objectGroup: GROUP } }, true));
      this.#groupReleased = true; await this.#origin.retire(); this.#retired = true;
    } catch (error) { this.#failed(); throw error; } finally { this.#end(); }
  }
  public async observeOriginalGenerationEnded(): Promise<void> {
    need(!this.#ending && !this.#generationEnded && !this.#retired, "GENERATION_CONSUMED"); this.#ending = true; const idle = this.#idle;
    try { await this.#origin.assertOriginalGenerationExited(); this.#generationEnded = true; this.#failed(); await idle;
      need(!this.#busy && this.#idle === idle, "ORIGINAL_OPERATION_UNSETTLED"); await this.#origin.retire(); this.#retired = true;
    } finally { this.#ending = false; }
  }
  public diagnostics(): Readonly<{ phase: Phase; normalRequests: number; cleanupRequests: number; replies: number; pauses: number;
    originalFinalPbResumeAttempted: boolean; unknownPause: boolean; uncertainAllocation: boolean; groupReleased: boolean;
    retired: boolean; originalGenerationEnded: boolean; firstFailure: Failure | null }> {
    return Object.freeze({ phase: this.#phase, normalRequests: this.#normal, cleanupRequests: this.#cleanup, replies: this.#replies, pauses: this.#pauses.length,
      originalFinalPbResumeAttempted: this.#originalPause.attempted, unknownPause: this.#unknownPause, uncertainAllocation: this.#allocationUncertain,
      groupReleased: this.#groupReleased, retired: this.#retired, originalGenerationEnded: this.#generationEnded, firstFailure: this.#firstFailure });
  }
}
