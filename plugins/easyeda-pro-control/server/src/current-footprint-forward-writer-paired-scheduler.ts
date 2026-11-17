/** Original complete-writer clock/Main/Create composition. It uses the actual
 * Core clock unit and defers Main release until the original copy/timer tail
 * is settled. Closed effect and saved verification remain separate. */
/* oxlint-disable import/max-dependencies -- Keep genuine native ownership, the exact pending channel and each original sequencer explicit; none is replaceable by caller callbacks. */
import { types } from "node:util";
import { CurrentFootprintForwardWriterAllocationRunner, requireCurrentFootprintForwardWriterAllocationCopyPlan, requireCurrentFootprintForwardWriterAllocationOrigin } from "./current-footprint-forward-writer-allocation-runner.ts";
import { CurrentFootprintCopyMainBackendRunner } from "./current-footprint-copy-main-backend-runner.ts";
import { createCurrentFootprintForwardWriterMainRequestRunner, requireOriginalCurrentFootprintForwardWriterMainRequestReservation } from "./current-footprint-copy-main-request-runner.ts";
import type { CurrentFootprintCopyMainRequestRunner } from "./current-footprint-copy-main-request-runner.ts";
import { createCurrentFootprintForwardWriterMainCompletionRunner } from "./current-footprint-copy-main-completion-runner.ts";
import type { CurrentFootprintCopyMainCompletionObservation, CurrentFootprintCopyMainCompletionRunner } from "./current-footprint-copy-main-completion-runner.ts";
import { requireCurrentFootprintForwardWriterMainCompletionOrigin } from "./current-footprint-forward-writer-main-origin.ts";
import type { CurrentFootprintForwardWriterMainCompletionOrigin, CurrentFootprintForwardWriterMainRequestOrigin } from "./current-footprint-forward-writer-main-origin.ts";
import type { CurrentFootprintForwardWriterClockRpcObservation, CurrentFootprintForwardWriterClockRpcRunner } from "./current-footprint-forward-writer-clock-rpc-runner.ts";
import { requireCurrentFootprintForwardWriterClockRpcOrigin } from "./current-footprint-forward-writer-clock-origin.ts";
import type { CurrentFootprintForwardWriterClockRpcOrigin } from "./current-footprint-forward-writer-clock-origin.ts";
import { requireCurrentFootprintForwardWriterCreateClockChannelRoute } from "./current-pcb-worker-startup-channel.ts";
import type { CurrentFootprintCopyPendingCreate, CurrentFootprintForwardWriterCreateClockChannelRoute } from "./current-pcb-worker-startup-channel.ts";
import { requireCurrentFootprintForwardWriterMainNativeOwner, requireCurrentFootprintForwardWriterPairedCopy, requireCurrentFootprintForwardWriterPairedSchedule, requireRetainedCurrentFootprintForwardPairedSchedule } from "./current-footprint-forward-writer-main-capability.ts";
import type { CurrentFootprintForwardWriterMainCapability } from "./current-footprint-forward-writer-main-capability.ts";
import { isCurrentFootprintForwardWriterMainRequestReservation, requireCurrentFootprintForwardWriterMainRequestReservationCopy, requireOriginalCurrentFootprintForwardWriterMainRequestReservationCopy } from "./current-footprint-forward-writer-main-request-plan.ts";
import type { CurrentFootprintForwardWriterMainRequestReservation } from "./current-footprint-forward-writer-main-request-plan.ts";
import type { CurrentFootprintCopyV2Plan } from "./current-footprint-copy-v2-plan.ts";
import type {CurrentFootprintForwardWriterCreateIntent} from "./current-footprint-forward-writer-create-intent.ts";
import type { CurrentFootprintForwardWriterNativeOwner } from "./current-pcb-diagnostic-owner.ts";
import { requireOriginalCurrentFootprintForwardWriterOwnData } from "./current-pcb-diagnostic-owner.ts";

type Phase = "ready" | "main-armed" | "clocks-bound" | "clocks-armed" | "create-written" | "clocks-retired" | "main-completed" | "tail-completed" | "complete" | "failed" | "ended";
/* oxlint-disable typescript/unbound-method -- Captured class methods are invoked only with the original private-field receiver, preventing supplied method overrides. */
const backendMethods = Object.freeze({ requireRequestOrigin: CurrentFootprintCopyMainBackendRunner.prototype.requireForwardWriterRequestOrigin,
  requireArmed: CurrentFootprintCopyMainBackendRunner.prototype.requireForwardWriterRequestArmed,
  issueCompletionOrigin: CurrentFootprintCopyMainBackendRunner.prototype.issueForwardWriterCompletionOrigin, release: CurrentFootprintCopyMainBackendRunner.prototype.release });
const allocationMethods = Object.freeze({ arm: CurrentFootprintForwardWriterAllocationRunner.prototype.arm,
  collectAndResume: CurrentFootprintForwardWriterAllocationRunner.prototype.collectAndResume, consumeBeforeInvocation: CurrentFootprintForwardWriterAllocationRunner.prototype.consumeBeforeInvocation,
  observeOriginalGenerationEnded: CurrentFootprintForwardWriterAllocationRunner.prototype.observeOriginalGenerationEnded, release: CurrentFootprintForwardWriterAllocationRunner.prototype.release });
/* oxlint-enable typescript/unbound-method */
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`FOOTPRINT_FORWARD_WRITER_PAIRED_${code}`); } }
const issued = new WeakMap<CurrentFootprintForwardWriterPairedObservation, CurrentFootprintForwardWriterPairedScheduler>();
const joinOwners=new WeakMap<CurrentFootprintCopyPendingCreate,CurrentFootprintForwardWriterPairedScheduler>();
export interface CurrentFootprintForwardWriterCreateJoinContext {
 readonly issuer:CurrentFootprintForwardWriterPairedScheduler;readonly backend:CurrentFootprintCopyMainBackendRunner;
 readonly capability:CurrentFootprintForwardWriterMainCapability;readonly mainOrigin:CurrentFootprintForwardWriterMainRequestOrigin;readonly clockOrigin:CurrentFootprintForwardWriterClockRpcOrigin;
 readonly clocks:CurrentFootprintForwardWriterClockRpcObservation;readonly completion:CurrentFootprintCopyMainCompletionRunner;
 readonly completionOrigin:CurrentFootprintForwardWriterMainCompletionOrigin;readonly main:CurrentFootprintCopyMainCompletionObservation;
 readonly timer:Awaited<ReturnType<CurrentFootprintForwardWriterNativeOwner["finishFootprintForwardWriterTicketTimer"]>>;
}

export interface CurrentFootprintForwardWriterPairedObservation {
  readonly profile: "private.current-footprint-forward-writer-paired-observation.v1";
  readonly clocks: CurrentFootprintForwardWriterClockRpcObservation;
  readonly main: CurrentFootprintCopyMainCompletionObservation;
  readonly serializedCreateResult: string;
  readonly timer:Awaited<ReturnType<CurrentFootprintForwardWriterNativeOwner["finishFootprintForwardWriterTicketTimer"]>>;
  readonly originalTimerTailJoined:true;
  readonly clockRetirementBeforeMainCollection: true;
  readonly exactOriginalCreateReplyJoined: true;
  readonly fullQualificationVerified: false;
  readonly nativeSqlCompletionVerified: false;
  readonly savedResultVerified: false;
  readonly executionAuthorized: false;
}
export class CurrentFootprintForwardWriterPairedScheduler {
  readonly #backend: CurrentFootprintCopyMainBackendRunner;
  readonly #owner: CurrentFootprintForwardWriterNativeOwner;
  #tailCompleted = false;
  #timer: Awaited<ReturnType<CurrentFootprintForwardWriterNativeOwner["finishFootprintForwardWriterTicketTimer"]>> | null = null;
  readonly #capability: CurrentFootprintForwardWriterMainCapability;
  readonly #mainOrigin: CurrentFootprintForwardWriterMainRequestOrigin;
  readonly #main: CurrentFootprintCopyMainRequestRunner;
  readonly #reservation: CurrentFootprintForwardWriterMainRequestReservation;
  #executionCopy: CurrentFootprintCopyV2Plan | null = null;
  #packet: CurrentFootprintForwardWriterPairedObservation | null = null;
  #phase: Phase = "ready";
  #busy = false;
  #ending = false;
  #generationEnded = false;
  #idle: Promise<null> = Promise.resolve(null);
  #resolveIdle: (() => void) | null = null;
  #clockToken: CurrentFootprintForwardWriterClockRpcOrigin | null = null;
  #clock: CurrentFootprintForwardWriterClockRpcRunner | null = null;
  #allocation: CurrentFootprintForwardWriterAllocationRunner | null = null;
  #route: CurrentFootprintForwardWriterCreateClockChannelRoute | null = null;
  #routeBinding: ReturnType<typeof requireCurrentFootprintForwardWriterCreateClockChannelRoute> | null = null;
  #pending: CurrentFootprintCopyPendingCreate | null = null;
  #createDispatchAttempted = false;
  #clocks: CurrentFootprintForwardWriterClockRpcObservation | null = null;
  #completion: CurrentFootprintCopyMainCompletionRunner | null = null;
  #completionOrigin: CurrentFootprintForwardWriterMainCompletionOrigin | null = null;
  #mainPacket: CurrentFootprintCopyMainCompletionObservation | null = null;
  #mainTransferred = false;
  #mainReleased = false;
  #joinContext:CurrentFootprintForwardWriterCreateJoinContext|null=null;
  #firstFailure: Phase | null = null;
  public constructor(backend: CurrentFootprintCopyMainBackendRunner, capability: CurrentFootprintForwardWriterMainCapability,
    mainOrigin: CurrentFootprintForwardWriterMainRequestOrigin, plan: CurrentFootprintForwardWriterMainRequestReservation) {
    need(!types.isProxy(backend) && Object.getPrototypeOf(backend) === CurrentFootprintCopyMainBackendRunner.prototype && Reflect.ownKeys(backend).length === 0, "ORIGINAL_BACKEND");
    backendMethods.requireRequestOrigin.call(backend, capability, mainOrigin);
    this.#owner = requireCurrentFootprintForwardWriterMainNativeOwner(capability, backend, "normal");
    requireOriginalCurrentFootprintForwardWriterOwnData(this.#owner, backend);
    this.#backend = backend; this.#capability = capability; this.#mainOrigin = mainOrigin;
    need(isCurrentFootprintForwardWriterMainRequestReservation(plan), "ORIGINAL_LATE_RESERVATION"); this.#reservation = plan;
    need(requireOriginalCurrentFootprintForwardWriterMainRequestReservationCopy(plan) === requireCurrentFootprintForwardWriterPairedCopy(capability, backend), "ORIGINAL_PAIRED_COPY");
    this.#main = createCurrentFootprintForwardWriterMainRequestRunner(mainOrigin, plan);
  }
  #same(): void {
    need(!this.#generationEnded && this.#phase !== "failed" && this.#phase !== "ended" && this.#phase !== "complete", "UNAVAILABLE");
    if (!this.#mainTransferred) { backendMethods.requireRequestOrigin.call(this.#backend, this.#capability, this.#mainOrigin); }
    if (this.#clockToken !== null) {
      if (this.#mainReleased) { requireRetainedCurrentFootprintForwardPairedSchedule(this.#capability, this.#backend, this.#clockToken); }
      else { requireCurrentFootprintForwardWriterPairedSchedule(this.#capability, this.#backend, this.#clockToken); }
      need(this.#route !== null && requireCurrentFootprintForwardWriterCreateClockChannelRoute(this.#route) === this.#routeBinding, "ORIGINAL_ROUTE");
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
    try { await this.#main.armForCompletion(); this.#same(); backendMethods.requireArmed.call(this.#backend,this.#capability,this.#mainOrigin); this.#phase = "main-armed"; }
    catch (error) { this.#failed(); throw error; } finally { this.#end(); }
  }
  /** The genuine future native factory enters its separately sealed renderer
   * phase only AFTER armMain. Existing observation origins have no create route. */
  public bindClocks(token: CurrentFootprintForwardWriterClockRpcOrigin): void {
    need(!this.#busy && !this.#ending && this.#phase === "main-armed", "PHASE"); this.#same();
    requireCurrentFootprintForwardWriterPairedSchedule(this.#capability, this.#backend, token);
    const route=this.#owner.originalFootprintForwardWriterCreateRoute(token);
    const unit=this.#owner.originalFootprintForwardWriterClockRunners(token);
    const allocation=unit.allocation;
    const binding = requireCurrentFootprintForwardWriterCreateClockChannelRoute(route), original = requireCurrentFootprintForwardWriterClockRpcOrigin(token);
    need(original.workerLease === binding.clockLease && original.workerSessionId === binding.workerSessionId, "ORIGINAL_CLOCK_ROUTE");
    need(allocation !== null && typeof allocation === "object" && !types.isProxy(allocation) && Object.getPrototypeOf(allocation) === CurrentFootprintForwardWriterAllocationRunner.prototype && Reflect.ownKeys(allocation).length === 0, "ORIGINAL_ALLOCATED_DESTINATION"); this.#allocation = allocation;
    requireCurrentFootprintForwardWriterAllocationOrigin(this.#allocation, token);
    this.#clock = unit.rpc;
    this.#clockToken = token; this.#route = route; this.#routeBinding = binding; this.#phase = "clocks-bound";
  }
  public async armClocks(): Promise<void> {
    this.#begin("clocks-bound");
    try { need(this.#clock !== null, "CLOCKS"); if (this.#allocation !== null) { await allocationMethods.arm.call(this.#allocation); this.#same(); } await this.#clock.arm(); this.#same(); this.#phase = "clocks-armed"; }
    catch (error) { this.#failed(); throw error; } finally { this.#end(); }
  }
  /** Only an original allocated-create schedule for this exact copy/window
   * can reach the existing coordinator's write boundary. Known-UUID fixtures
   * and merely shape-compatible schedules are not execution qualifications. */
  public requireExecutionReady(copy: CurrentFootprintCopyV2Plan, minimum: number, maximum: number): void {
    need(!this.#busy && !this.#ending && this.#phase === "clocks-armed" &&
      this.#allocation !== null && this.#clockToken !== null && !this.#createDispatchAttempted, "EXECUTION_READY");
    this.#same();
    requireCurrentFootprintForwardWriterMainRequestReservationCopy(this.#reservation, copy, minimum, maximum);
    need(this.#routeBinding !== null && this.#routeBinding.copyPlan === copy, "ORIGINAL_EXECUTION_COPY");
    requireCurrentFootprintForwardWriterAllocationCopyPlan(this.#allocation, this.#clockToken, copy, this.#routeBinding.invocationBinding);
    need(this.#executionCopy === null || this.#executionCopy === copy, "ORIGINAL_EXECUTION_COPY"); this.#executionCopy = copy;
  }
  /** The enclosing genuine owner must already have durable intent and complete
   * eligibility. This partial schedule cannot issue either prerequisite. */
  public async dispatchCreate(intent:CurrentFootprintForwardWriterCreateIntent): Promise<void> {
    this.#begin("clocks-armed");
    try {
      need(this.#clock !== null && this.#route !== null && this.#executionCopy !== null, "ALLOCATED_EXECUTION_COPY");
      // Both markers consume synchronously. No await or native write separates
      // Them from the original route's once-only queued dispatch.
      this.#main.consumeBeforeInvocation(); this.#clock.consumeBeforeInvocation(); if (this.#allocation !== null) { allocationMethods.consumeBeforeInvocation.call(this.#allocation); }
      this.#createDispatchAttempted = true;
      need(this.#clockToken !== null, "ORIGINAL_CLOCK");
      this.#pending = await this.#owner.dispatchFootprintForwardWriterCreate(this.#clockToken,intent); this.#same();need(!joinOwners.has(this.#pending),"ORIGINAL_PENDING_JOIN_OWNER");joinOwners.set(this.#pending,this); this.#phase = "create-written";
    } catch (error) { this.#failed(); throw error; } finally { this.#end(); }
  }
  public async collectClocks(): Promise<void> {
    this.#begin("create-written");
    try {
      need(this.#clock !== null, "CLOCKS");
      if (this.#allocation !== null) { await allocationMethods.collectAndResume.call(this.#allocation); this.#same(); }
      this.#clocks = await this.#clock.collect(); this.#same();
      need(this.#clockToken !== null, "CLOCKS"); await this.#main.bindForwardWriterObservedClocks(this.#clockToken, this.#clocks); this.#same();
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
      this.#completion = createCurrentFootprintForwardWriterMainCompletionRunner(origin); this.#same();
      await this.#completion.arm(); this.#same(); this.#mainPacket = await this.#completion.collect(); this.#same();
      await this.#completion.requireOriginal(this.#mainPacket); this.#same(); await this.#completion.cleanup(); this.#same();
      this.#phase = "main-completed";
    } catch (error) { this.#failed(); throw error; } finally { this.#end(); }
  }
  /** Return only the packet already collected by this same original clock
   * unit. The local/tail composer needs it before the final Create reply join. */
  public originalCompletedClocks():CurrentFootprintForwardWriterClockRpcObservation {
    need(!this.#busy&&!this.#ending&&(this.#phase==="clocks-retired"||this.#phase==="main-completed")&&!this.#mainReleased&&this.#clocks!==null&&this.#clock?.diagnostics()["retired"]===true,"ORIGINAL_CLOCK_COMPLETION");
    this.#same();return this.#clocks;
  }
  /** The tail composer receives only these exact full collector references.
   * Its own Core/Main registries reprove them before post/history collection. */
  public originalCompletedMain(): Readonly<{ runner:CurrentFootprintCopyMainCompletionRunner; origin:CurrentFootprintForwardWriterMainCompletionOrigin; packet:CurrentFootprintCopyMainCompletionObservation }> {
    need(!this.#busy&&!this.#ending&&this.#phase==="main-completed"&&!this.#mainReleased&&this.#completion!==null&&this.#completionOrigin!==null&&this.#mainPacket!==null,"ORIGINAL_MAIN_COMPLETION");
    this.#same();return Object.freeze({runner:this.#completion,origin:this.#completionOrigin,packet:this.#mainPacket});
  }
  public originalMainRequestRunner():CurrentFootprintCopyMainRequestRunner{
    need(!this.#busy&&!this.#ending,"ORIGINAL_REQUEST_IDLE");this.#same();
    requireOriginalCurrentFootprintForwardWriterMainRequestReservation(this.#main,this.#mainOrigin,this.#reservation);return this.#main;
  }
  /** The actual timer finisher requires the same completed native copy,
   * post/history drain and publication before the final Create join/Main release. */
  public async finishAfterTail():Promise<void>{
    this.#begin("main-completed");
    try{
      this.#timer=await this.#owner.finishFootprintForwardWriterTicketTimer();this.#same();
      need(this.#timer.naturalSelfReturnsJoined&&!this.#timer.executionAuthorized,"ORIGINAL_TIMER_SETTLEMENT");
      this.#tailCompleted=true;this.#phase="tail-completed";
    }catch(error){this.#failed();throw error;}finally{this.#end();}
  }
  /** Only the original active post-tail join may retrieve these exact retained
   * collectors. A prewrite interval or copied completion cannot replace them. */
  public requireOriginalCreateJoin(pending:CurrentFootprintCopyPendingCreate,owner:CurrentFootprintForwardWriterNativeOwner,clock:CurrentFootprintForwardWriterClockRpcOrigin):CurrentFootprintForwardWriterCreateJoinContext {
    need(this.#busy&&!this.#ending&&!this.#generationEnded&&this.#phase==="tail-completed"&&owner===this.#owner&&clock===this.#clockToken&&pending===this.#pending&&joinOwners.get(pending)===this&&
      this.#tailCompleted&&this.#timer!==null&&this.#clocks!==null&&this.#completion!==null&&this.#completionOrigin!==null&&this.#mainPacket!==null&&this.#mainTransferred&&!this.#mainReleased&&this.#clock!==null&&this.#allocation!==null,"ORIGINAL_POST_TAIL_JOIN");
    this.#same();const unit=this.#owner.originalFootprintForwardWriterClockRunners(clock);
    need(unit.rpc===this.#clock&&unit.allocation===this.#allocation&&this.#clock.diagnostics()["retired"]===true&&this.#completion.diagnostics().retired,"ORIGINAL_COMPLETED_COLLECTORS");
    this.#joinContext??=Object.freeze({issuer:this,backend:this.#backend,capability:this.#capability,mainOrigin:this.#mainOrigin,clockOrigin:clock,clocks:this.#clocks,
      completion:this.#completion,completionOrigin:this.#completionOrigin,main:this.#mainPacket,timer:this.#timer});return this.#joinContext;
  }
  public async joinCreate(): Promise<CurrentFootprintForwardWriterPairedObservation> {
    this.#begin("tail-completed");
    try {
      need(this.#route !== null && this.#pending !== null && this.#clocks !== null && this.#mainPacket !== null, "COMPLETE_INPUTS");
      need(this.#clockToken!==null&&this.#tailCompleted&&this.#timer!==null,"ORIGINAL_COMPLETE_TAIL");
      const serializedCreateResult = await this.#owner.joinFootprintForwardWriterCreate(this.#clockToken,this.#pending); this.#same();
      await backendMethods.release.call(this.#backend);this.#mainReleased=true;this.#same();
      const result = Object.freeze({ profile: "private.current-footprint-forward-writer-paired-observation.v1" as const,
        clocks: this.#clocks, main: this.#mainPacket, serializedCreateResult, timer:this.#timer,originalTimerTailJoined:true as const,clockRetirementBeforeMainCollection: true as const,
        exactOriginalCreateReplyJoined: true as const, fullQualificationVerified: false as const,
        nativeSqlCompletionVerified: false as const, savedResultVerified: false as const, executionAuthorized: false as const });
      this.#packet = result; issued.set(result, this); this.#phase = "complete"; return result;
    } catch (error) { this.#failed(); throw error; } finally { this.#end(); }
  }
  /** A retained result remains inspectable after original generation exit.
   * Its data alone grants neither current ownership nor saved-content proof. */
  public requireOriginalResult(packet: CurrentFootprintForwardWriterPairedObservation): void {
    need(!this.#busy && !this.#ending && packet === this.#packet && issued.get(packet) === this &&
      packet.clocks === this.#clocks && packet.main === this.#mainPacket && packet.timer===this.#timer && this.#tailCompleted &&
      (this.#phase === "complete" || this.#phase === "ended"), "ORIGINAL_RESULT");
  }
  /** Historical binding for the next fresh saved generation. Actual original
   * root/Job exit is required; a matching copied packet or plan cannot pass. */
  public requireOriginalSavedContinuation(packet: CurrentFootprintForwardWriterPairedObservation,
    owner: CurrentFootprintForwardWriterNativeOwner): Readonly<{ copyPlan: CurrentFootprintCopyV2Plan; paired: CurrentFootprintForwardWriterPairedObservation }> {
    // oxlint-disable-next-line eslint/no-use-before-define -- Capture these genuine private-field class methods after the class definition; runtime lookup occurs only after module initialization.
    savedContinuationMethods.requireResult.call(this, packet);
    need(this.#executionCopy !== null && this.#mainReleased && this.#tailCompleted && this.#timer!==null && this.#createDispatchAttempted && this.#pending !== null &&
      requireCurrentFootprintForwardWriterMainNativeOwner(this.#capability, this.#backend, "exited") === owner &&
      owner.requireOriginalForwardWriterMainRunner(this.#backend, "exited"), "ORIGINAL_CLOSED_SAVED_CONTINUATION");
    return Object.freeze({ copyPlan: this.#executionCopy, paired: packet });
  }
  /** Success already retired both sequencers. Failure or an armed/pending
   * schedule needs actual original root/Job exit; it is never resumed here. */
  public requireQuiescentClose(): void {
    need(!this.#busy && !this.#ending && this.#phase === "complete" && this.#packet !== null &&
      this.#clock?.diagnostics()["retired"] === true && this.#completion?.diagnostics().retired === true &&
      this.#allocation?.diagnostics()["phase"] === "released" && this.#tailCompleted && this.#timer!==null, "GENERATION_CLOSURE_REQUIRED");
    this.requireOriginalResult(this.#packet);
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
      timer = setTimeout(() => { deadline.reject(new Error("FOOTPRINT_FORWARD_WRITER_PAIRED_ORIGINAL_IDLE_DEADLINE")); }, 300_000);
      await Promise.race([idle, deadline.promise]); need(!this.#busy && this.#idle === idle, "ORIGINAL_OPERATION_UNSETTLED");
      if (this.#allocation !== null && this.#allocation.diagnostics()["phase"] !== "ended") { await allocationMethods.observeOriginalGenerationEnded.call(this.#allocation); }
      if (this.#clock !== null && this.#clock.diagnostics()["retired"] !== true) { await this.#clock.observeOriginalGenerationEnded(); }
      if (this.#completion !== null) {
        if (!this.#completion.diagnostics().retired) { await this.#completion.observeOriginalGenerationEnded(); }
      } else if (this.#completionOrigin !== null) {
        const completion = requireCurrentFootprintForwardWriterMainCompletionOrigin(this.#completionOrigin);
        await completion.assertOriginalGenerationExited(); await completion.retire();
      } else if (!this.#main.diagnostics().retired) { await this.#main.observeOriginalGenerationEnded(); }
      this.#phase = "ended";
    } finally { if (timer !== null) { clearTimeout(timer); } this.#ending = false; }
  }
  public diagnostics(): Readonly<Record<string, unknown>> {
    return Object.freeze({ phase: this.#phase, busy: this.#busy, ending: this.#ending, originalGenerationEnded: this.#generationEnded, firstFailure: this.#firstFailure,
      createDispatchAttempted: this.#createDispatchAttempted, createWriteAcknowledged: this.#pending !== null, clocks: this.#clock?.diagnostics() ?? null, allocation: this.#allocation?.diagnostics() ?? null,
      main: this.#main.diagnostics(), completion: this.#completion?.diagnostics() ?? null,
      executionCopyBound: this.#executionCopy !== null, originalResultRetained: this.#packet !== null,
      originalTimerTailJoined:this.#tailCompleted, originalTimerObservation:this.#timer, writerPurposeMounted: false, wholeWriterBudgetReserved: false, executionAuthorized: false });
  }
}

/* oxlint-disable typescript/unbound-method -- Call only on the original sequencer selected by its private issued packet registry. */
const savedContinuationMethods = Object.freeze({ requireResult: CurrentFootprintForwardWriterPairedScheduler.prototype.requireOriginalResult,
  saved: CurrentFootprintForwardWriterPairedScheduler.prototype.requireOriginalSavedContinuation });
/* oxlint-enable typescript/unbound-method */
/** Resolve only the actual original paired sequencer's retained completion.
 * This joins historical create/clock/main provenance, never a new native lease. */
export function requireOriginalCurrentFootprintForwardWriterSavedContinuation(packet: CurrentFootprintForwardWriterPairedObservation,
  owner: CurrentFootprintForwardWriterNativeOwner): Readonly<{ copyPlan: CurrentFootprintCopyV2Plan; paired: CurrentFootprintForwardWriterPairedObservation }> {
  const scheduler = issued.get(packet); need(scheduler !== undefined, "ORIGINAL_CLOSED_SAVED_CONTINUATION");
  return savedContinuationMethods.saved.call(scheduler, packet, owner);
}


// oxlint-disable-next-line typescript/unbound-method -- Invoke the captured method only on the private pending registry's original scheduler.
const originalCreateJoin=CurrentFootprintForwardWriterPairedScheduler.prototype.requireOriginalCreateJoin;
export function requireOriginalCurrentFootprintForwardWriterCreateJoin(pending:CurrentFootprintCopyPendingCreate,owner:CurrentFootprintForwardWriterNativeOwner,clock:CurrentFootprintForwardWriterClockRpcOrigin):CurrentFootprintForwardWriterCreateJoinContext {
 const issuer=joinOwners.get(pending);need(issuer!==undefined,"ORIGINAL_PENDING_JOIN_OWNER");return originalCreateJoin.call(issuer,pending,owner,clock);
}
