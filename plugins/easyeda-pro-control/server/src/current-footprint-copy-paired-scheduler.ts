/** Private partial schedule around the actual main and renderer sequencers.
 * No native factory constructs a writer-capable channel or complete qualification
 * yet. Caller-supplied plans/UUIDs cannot create those original capabilities.
 * A separate allocation observer can capture the original native UUID before
 * its first clock await. Its extra grammar/budget is not mounted.
 * The main request may use a separately pre-reserved original copy projection
 * bound only after the original paired clocks. Real Tg.create allocates its UUID
 * internally; a supplied known UUID never qualifies that allocation. */
/* oxlint-disable import/max-dependencies -- Keep genuine native ownership, the exact pending channel and each original sequencer explicit; none is replaceable by caller callbacks. */
import { types } from "node:util";
import { CurrentFootprintCopyAllocationRunner, requireCurrentFootprintCopyAllocationOrigin } from "./current-footprint-copy-allocation-runner.ts";
import type { z } from "zod";
import { CurrentFootprintCopyMainBackendRunner } from "./current-footprint-copy-main-backend-runner.ts";
import { CurrentFootprintCopyMainRequestRunner } from "./current-footprint-copy-main-request-runner.ts";
import type { CurrentFootprintCopyMainRequestOrigin } from "./current-footprint-copy-main-request-origin.ts";
import type { currentFootprintCopyMainRequestPlanSchema } from "./current-footprint-copy-main-request-contract.ts";
import { CurrentFootprintCopyMainCompletionRunner } from "./current-footprint-copy-main-completion-runner.ts";
import { requireCurrentFootprintCopyMainCompletionOrigin } from "./current-footprint-copy-main-completion-origin.ts";
import type { CurrentFootprintCopyMainCompletionOrigin } from "./current-footprint-copy-main-completion-origin.ts";
import type { CurrentFootprintCopyMainCompletionObservation } from "./current-footprint-copy-main-completion-runner.ts";
import { CurrentFootprintCopyClockRpcRunner } from "./current-footprint-copy-clock-rpc-runner.ts";
import type { CurrentFootprintCopyClockRpcObservation } from "./current-footprint-copy-clock-rpc-runner.ts";
import { requireCurrentFootprintCopyClockRpcOrigin } from "./current-footprint-copy-clock-rpc-origin.ts";
import type { CurrentFootprintCopyClockRpcOrigin } from "./current-footprint-copy-clock-rpc-origin.ts";
import { requireCurrentFootprintCopyCreateClockChannelRoute } from "./current-pcb-worker-startup-channel.ts";
import type { CurrentFootprintCopyCreateClockChannelRoute, CurrentFootprintCopyPendingCreate } from "./current-pcb-worker-startup-channel.ts";
import { requireCurrentFootprintCombinedPairedSchedule } from "./current-pcb-diagnostic-owner.ts";
import type { CurrentFootprintCombinedMainCapability } from "./current-pcb-diagnostic-owner.ts";
import { isCurrentFootprintCopyMainRequestReservation } from "./current-footprint-copy-main-request-plan.ts";
import type { CurrentFootprintCopyMainRequestReservation } from "./current-footprint-copy-main-request-plan.ts";

type Plan = Readonly<z.infer<typeof currentFootprintCopyMainRequestPlanSchema>>;
type Phase = "ready" | "main-armed" | "clocks-bound" | "clocks-armed" | "create-written" | "clocks-retired" | "main-completed" | "complete" | "failed" | "ended";
/* oxlint-disable typescript/unbound-method -- Captured class methods are invoked only with the original private-field receiver, preventing supplied method overrides. */
const backendMethods = Object.freeze({ requireRequestOrigin: CurrentFootprintCopyMainBackendRunner.prototype.requireRequestOrigin,
  issueCompletionOrigin: CurrentFootprintCopyMainBackendRunner.prototype.issueCompletionOrigin, release: CurrentFootprintCopyMainBackendRunner.prototype.release });
const allocationMethods = Object.freeze({ arm: CurrentFootprintCopyAllocationRunner.prototype.arm,
  collectAndResume: CurrentFootprintCopyAllocationRunner.prototype.collectAndResume, consumeBeforeInvocation: CurrentFootprintCopyAllocationRunner.prototype.consumeBeforeInvocation,
  observeOriginalGenerationEnded: CurrentFootprintCopyAllocationRunner.prototype.observeOriginalGenerationEnded, release: CurrentFootprintCopyAllocationRunner.prototype.release });
/* oxlint-enable typescript/unbound-method */
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`FOOTPRINT_PAIRED_SCHEDULE_${code}`); } }
export interface CurrentFootprintCopyPairedScheduleObservation {
  readonly profile: "private.current-footprint-copy-paired-schedule-observation.v1";
  readonly clocks: CurrentFootprintCopyClockRpcObservation;
  readonly main: CurrentFootprintCopyMainCompletionObservation;
  readonly serializedCreateResult: string;
  readonly clockRetirementBeforeMainCollection: true;
  readonly exactOriginalCreateReplyJoined: true;
  readonly fullQualificationVerified: false;
  readonly nativeSqlCompletionVerified: false;
  readonly savedResultVerified: false;
  readonly executionAuthorized: false;
}
export class CurrentFootprintCopyPairedScheduler {
  readonly #backend: CurrentFootprintCopyMainBackendRunner;
  readonly #capability: CurrentFootprintCombinedMainCapability;
  readonly #mainOrigin: CurrentFootprintCopyMainRequestOrigin;
  readonly #main: CurrentFootprintCopyMainRequestRunner;
  readonly #latePlan: boolean;
  #phase: Phase = "ready";
  #busy = false;
  #ending = false;
  #generationEnded = false;
  #idle: Promise<null> = Promise.resolve(null);
  #resolveIdle: (() => void) | null = null;
  #clockToken: CurrentFootprintCopyClockRpcOrigin | null = null;
  #clock: CurrentFootprintCopyClockRpcRunner | null = null;
  #allocation: CurrentFootprintCopyAllocationRunner | null = null;
  #route: CurrentFootprintCopyCreateClockChannelRoute | null = null;
  #routeBinding: ReturnType<typeof requireCurrentFootprintCopyCreateClockChannelRoute> | null = null;
  #pending: CurrentFootprintCopyPendingCreate | null = null;
  #createDispatchAttempted = false;
  #clocks: CurrentFootprintCopyClockRpcObservation | null = null;
  #completion: CurrentFootprintCopyMainCompletionRunner | null = null;
  #completionOrigin: CurrentFootprintCopyMainCompletionOrigin | null = null;
  #mainPacket: CurrentFootprintCopyMainCompletionObservation | null = null;
  #mainTransferred = false;
  #firstFailure: Phase | null = null;
  public constructor(backend: CurrentFootprintCopyMainBackendRunner, capability: CurrentFootprintCombinedMainCapability,
    mainOrigin: CurrentFootprintCopyMainRequestOrigin, plan: Plan | CurrentFootprintCopyMainRequestReservation) {
    need(!types.isProxy(backend) && Object.getPrototypeOf(backend) === CurrentFootprintCopyMainBackendRunner.prototype && Reflect.ownKeys(backend).length === 0, "ORIGINAL_BACKEND");
    backendMethods.requireRequestOrigin.call(backend, capability, mainOrigin);
    this.#backend = backend; this.#capability = capability; this.#mainOrigin = mainOrigin;
    this.#latePlan = isCurrentFootprintCopyMainRequestReservation(plan);
    this.#main = new CurrentFootprintCopyMainRequestRunner(mainOrigin, plan);
  }
  #same(): void {
    need(!this.#generationEnded && this.#phase !== "failed" && this.#phase !== "ended" && this.#phase !== "complete", "UNAVAILABLE");
    if (!this.#mainTransferred) { backendMethods.requireRequestOrigin.call(this.#backend, this.#capability, this.#mainOrigin); }
    if (this.#clockToken !== null) {
      requireCurrentFootprintCombinedPairedSchedule(this.#capability, this.#backend, this.#clockToken);
      need(this.#route !== null && requireCurrentFootprintCopyCreateClockChannelRoute(this.#route) === this.#routeBinding, "ORIGINAL_ROUTE");
    }
  }
  #begin(phase: Phase): void {
    need(!this.#busy && !this.#ending && this.#phase === phase, "PHASE"); this.#same(); this.#busy = true;
    const idle = Promise.withResolvers<null>(); this.#idle = idle.promise; this.#resolveIdle = (): void => { idle.resolve(null); };
  }
  #end(): void { this.#busy = false; this.#resolveIdle?.(); this.#resolveIdle = null; }
  #failed(): void { this.#firstFailure ??= this.#phase; this.#phase = "failed"; this.#route?.fail(); }
  public async armMain(): Promise<void> {
    this.#begin("ready");
    try { await this.#main.armForCompletion(); this.#same(); this.#phase = "main-armed"; }
    catch (error) { this.#failed(); throw error; } finally { this.#end(); }
  }
  /** The genuine future native factory enters its separately sealed renderer
   * phase only AFTER armMain. Existing observation origins have no create route. */
  public bindClocks(token: CurrentFootprintCopyClockRpcOrigin, route: CurrentFootprintCopyCreateClockChannelRoute, documentUuid: string | CurrentFootprintCopyAllocationRunner): void {
    need(!this.#busy && !this.#ending && this.#phase === "main-armed", "PHASE"); this.#same();
    requireCurrentFootprintCombinedPairedSchedule(this.#capability, this.#backend, token);
    const binding = requireCurrentFootprintCopyCreateClockChannelRoute(route), original = requireCurrentFootprintCopyClockRpcOrigin(token);
    need(original.workerLease === binding.clockLease && original.workerSessionId === binding.workerSessionId, "ORIGINAL_CLOCK_ROUTE");
    this.#allocation = typeof documentUuid === "string" ? null : documentUuid;
    if (this.#allocation !== null) { requireCurrentFootprintCopyAllocationOrigin(this.#allocation, token); }
    this.#clock = new CurrentFootprintCopyClockRpcRunner(token, documentUuid);
    this.#clockToken = token; this.#route = route; this.#routeBinding = binding; this.#phase = "clocks-bound";
  }
  public async armClocks(): Promise<void> {
    this.#begin("clocks-bound");
    try { need(this.#clock !== null, "CLOCKS"); if (this.#allocation !== null) { await allocationMethods.arm.call(this.#allocation); this.#same(); } await this.#clock.arm(); this.#same(); this.#phase = "clocks-armed"; }
    catch (error) { this.#failed(); throw error; } finally { this.#end(); }
  }
  /** The enclosing genuine owner must already have durable intent and complete
   * eligibility. This partial schedule cannot issue either prerequisite. */
  public async dispatchCreate(): Promise<void> {
    this.#begin("clocks-armed");
    try {
      need(this.#clock !== null && this.#route !== null, "CLOCKS");
      // Both markers consume synchronously. No await or native write separates
      // Them from the original route's once-only queued dispatch.
      this.#main.consumeBeforeInvocation(); this.#clock.consumeBeforeInvocation(); if (this.#allocation !== null) { allocationMethods.consumeBeforeInvocation.call(this.#allocation); }
      this.#createDispatchAttempted = true;
      this.#pending = await this.#route.dispatchCreate(); this.#same(); this.#phase = "create-written";
    } catch (error) { this.#failed(); throw error; } finally { this.#end(); }
  }
  public async collectClocks(): Promise<void> {
    this.#begin("create-written");
    try {
      need(this.#clock !== null, "CLOCKS");
      if (this.#allocation !== null) { await allocationMethods.collectAndResume.call(this.#allocation); this.#same(); }
      this.#clocks = await this.#clock.collect(); this.#same();
      if (this.#latePlan) {
        need(this.#clockToken !== null, "CLOCKS"); await this.#main.bindObservedClocks(this.#clockToken, this.#clocks); this.#same();
      }
      await this.#clock.requireOriginal(this.#clocks); this.#same();
      if (this.#allocation !== null) { await allocationMethods.release.call(this.#allocation); this.#same(); }
      await this.#clock.cleanup(); this.#same();
      need(this.#clock.diagnostics()["retired"] === true, "CLOCK_RETIREMENT"); this.#phase = "clocks-retired";
    } catch (error) { this.#failed(); throw error; } finally { this.#end(); }
  }
  public async collectMain(): Promise<void> {
    this.#begin("clocks-retired");
    try {
      const held = await this.#main.collectToHeldFinalPb(); this.#same();
      const origin = await backendMethods.issueCompletionOrigin.call(this.#backend, this.#capability, held);
      this.#mainTransferred = true; this.#completionOrigin = origin;
      this.#completion = new CurrentFootprintCopyMainCompletionRunner(origin); this.#same();
      await this.#completion.arm(); this.#same(); this.#mainPacket = await this.#completion.collect(); this.#same();
      await this.#completion.requireOriginal(this.#mainPacket); this.#same(); await this.#completion.cleanup(); this.#same();
      await backendMethods.release.call(this.#backend); this.#same(); this.#phase = "main-completed";
    } catch (error) { this.#failed(); throw error; } finally { this.#end(); }
  }
  public async joinCreate(): Promise<CurrentFootprintCopyPairedScheduleObservation> {
    this.#begin("main-completed");
    try {
      need(this.#route !== null && this.#pending !== null && this.#clocks !== null && this.#mainPacket !== null, "COMPLETE_INPUTS");
      const serializedCreateResult = await this.#route.joinCreate(this.#pending); this.#same();
      const result = Object.freeze({ profile: "private.current-footprint-copy-paired-schedule-observation.v1" as const,
        clocks: this.#clocks, main: this.#mainPacket, serializedCreateResult, clockRetirementBeforeMainCollection: true as const,
        exactOriginalCreateReplyJoined: true as const, fullQualificationVerified: false as const,
        nativeSqlCompletionVerified: false as const, savedResultVerified: false as const, executionAuthorized: false as const });
      this.#phase = "complete"; return result;
    } catch (error) { this.#failed(); throw error; } finally { this.#end(); }
  }
  /** Does not close/kill the process. Only the retained native root-exit and
   * empty-Job proof can end ambiguous pending replies and held native pauses. */
  public async observeOriginalGenerationEnded(): Promise<void> {
    need(!this.#ending && this.#phase !== "ended", "ENDING_PHASE"); this.#ending = true;
    const idle = this.#idle; let timer: ReturnType<typeof setTimeout> | null = null;
    try {
      // Exit proof is allowed while a normal wait remains pending, since that
      // Proof is what rejects the exact original pending entry and joins it.
      // Before route binding, the original main collector owns the same proof.
      if (this.#route !== null) { await this.#route.assertOriginalGenerationExited(); }
      else if (!this.#main.diagnostics().retired) { await this.#main.observeOriginalGenerationEnded(); }
      this.#generationEnded = true;
      const deadline = Promise.withResolvers<never>();
      timer = setTimeout(() => { deadline.reject(new Error("FOOTPRINT_PAIRED_SCHEDULE_ORIGINAL_IDLE_DEADLINE")); }, 300_000);
      await Promise.race([idle, deadline.promise]); need(!this.#busy && this.#idle === idle, "ORIGINAL_OPERATION_UNSETTLED");
      if (this.#allocation !== null && this.#allocation.diagnostics()["phase"] !== "ended") { await allocationMethods.observeOriginalGenerationEnded.call(this.#allocation); }
      if (this.#clock !== null && this.#clock.diagnostics()["retired"] !== true) { await this.#clock.observeOriginalGenerationEnded(); }
      if (this.#completion !== null) {
        if (!this.#completion.diagnostics().retired) { await this.#completion.observeOriginalGenerationEnded(); }
      } else if (this.#completionOrigin !== null) {
        const completion = requireCurrentFootprintCopyMainCompletionOrigin(this.#completionOrigin);
        await completion.assertOriginalGenerationExited(); await completion.retire();
      } else if (!this.#main.diagnostics().retired) { await this.#main.observeOriginalGenerationEnded(); }
      this.#phase = "ended";
    } finally { if (timer !== null) { clearTimeout(timer); } this.#ending = false; }
  }
  public diagnostics(): Readonly<Record<string, unknown>> {
    return Object.freeze({ phase: this.#phase, busy: this.#busy, ending: this.#ending, originalGenerationEnded: this.#generationEnded, firstFailure: this.#firstFailure,
      createDispatchAttempted: this.#createDispatchAttempted, createWriteAcknowledged: this.#pending !== null, clocks: this.#clock?.diagnostics() ?? null, allocation: this.#allocation?.diagnostics() ?? null,
      main: this.#main.diagnostics(), completion: this.#completion?.diagnostics() ?? null,
      writerPurposeMounted: false, wholeWriterBudgetReserved: false, executionAuthorized: false });
  }
}
