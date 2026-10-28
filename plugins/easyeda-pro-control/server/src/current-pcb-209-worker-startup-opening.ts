/* oxlint-disable eslint/max-classes-per-file -- Keep the private shared core with two fixed wrappers so no caller can select a transport factory or constructor profile. */
/** Fixed209 original-owner choreography. Legacy opening remains separate. The lifecycle must publish the sealed
 * checkpoint intent before calling open(). This module supplies no journal,
 * owner adoption, public writer or saved-state authority. */
/* oxlint-disable import/max-dependencies -- This coordinator joins the fixed parent opener, original construction owner and actor observers without exporting their native capabilities to another owner. */
import { types } from "node:util";
import { z } from "zod";
import type { CurrentFootprintCopyProducerObservation } from "./current-footprint-copy-producer-runner.ts";
import type { CurrentFootprintCopyDependencyObservation } from "./current-footprint-copy-dependency-runner.ts";
import type { CurrentFootprintParentWorkerObservation, CurrentFootprintParentWorkerRunner } from "./current-footprint-copy-parent-worker-runner.ts";
import type { CurrentFootprintCopyDestinationObservation } from "./current-footprint-copy-destination-runner.ts";
import type { CurrentFootprintCopyRegisteredAsyncObservation } from "./current-footprint-copy-async-runner.ts";
import type { CurrentFootprintCopyTransactionClockEvents } from "./current-footprint-copy-transaction-clock-events.ts";
import type { CurrentFootprintCopyStatePacket } from "./current-footprint-copy-state.ts";
import type { CurrentFootprintSourcePlan } from "./current-footprint-source-plan.ts";
import type { CurrentFootprintSourceReadPacket } from "./current-footprint-source-read-runner.ts";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import type { CurrentDisposableOpenSealedTarget } from "./current-disposable-open.ts";
import type { CurrentPcbWorkerStartupHandoff, CurrentPcbWorkerStartupOpeningBinding } from "./current-pcb-diagnostic-owner.ts";
import { decodeCurrentPcbDiagnosticOpeningReply } from "./current-pcb-diagnostic-opening.ts";
import { CURRENT_PCB_209_STARTUP_OPENING_FUNCTION } from "./current-pcb-209-startup-opening-program.ts";
import { CURRENT_PCB_209_STARTUP_OPENING_TIMING } from "./current-pcb-209-worker-startup-timing.ts";
import type { CurrentPcbDiagnosticOpeningPhase, CurrentPcbDiagnosticOpeningResult } from "./current-pcb-diagnostic-opening.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { CurrentPcb209WorkerConstructionRunner } from "./current-pcb-worker-construction-runner.ts";
import type { CurrentPcbWorkerConstructionOwner, CurrentPcbWorkerConstructionPacketFor, CurrentPcbWorkerConstructionProjectIdentity } from "./current-pcb-worker-construction-runner.ts";
import type { CurrentPcbWorkerConstructionAssignments } from "./current-pcb-worker-construction-assignment.ts";
import type { CurrentPcbWorkerStartupCommand, CurrentPcbWorkerStartupDependency } from "./current-pcb-worker-startup-contract.ts";
import { CurrentFootprintCopyWorkerStartupTransport, CurrentPcb209WorkerStartupTransport } from "./current-pcb-worker-startup-transport.ts";
import type { CurrentPcbWorkerStartupTransportOwner } from "./current-pcb-worker-startup-transport.ts";
import { currentPcbWorkerStartupUiActorCommand } from "./current-pcb-worker-startup-actor.ts";
import { CurrentPcb209WorkerStartupActorRunner } from "./current-pcb-209-worker-startup-actor.ts";
import type { CurrentPcb209OriginalStartupActorObservation, CurrentPcb209WorkerStartupActorPacket } from "./current-pcb-209-worker-startup-actor.ts";
import { requireCurrentPcb209ActorClockSourceQualification } from "./current-pcb-209-actor-clock-source.ts";
import type { CurrentPcb209ActorClockSourceQualification } from "./current-pcb-209-actor-clock-source.ts";
import type { CurrentPcbWorkerStartupChannelPacket } from "./current-pcb-worker-startup-channel-observation.ts";

type Row = Record<string, unknown>;
type OpeningProfile = "private.current-pcb209-worker-construction.v1" | "private.current-footprint-copy-construction.v1";
const INTERNAL_OPENING = Symbol("fixed-original-worker-opening");
const recordSchema = z.record(z.string(), z.unknown());
const contextSchema = z.object({ sessionId: z.string().min(1).max(128).regex(/^[A-Za-z\d_.:-]+$/u),
  uniqueContextId: z.string().min(1).max(128).regex(/^[A-Za-z\d_.:-]+$/u) }).strict();
const openingMethods = ["context", "reprove", "begin", "finish", "observeParent", "ancillaryFrame",
  "observeAncillary", "ancillaryObservation"] as const;
// oxlint-disable-next-line typescript/unbound-method -- Called only with the retained private-field actor owner, never a caller callback.
const originalActorObservation = CurrentPcb209WorkerStartupActorRunner.prototype.originalObservation;
// oxlint-disable typescript/unbound-method -- Captured construction methods always receive the original private-field runner.
const footprintProducerMethods = Object.freeze({
  observe: CurrentPcb209WorkerConstructionRunner.prototype.observeFootprintProducers,
  require: CurrentPcb209WorkerConstructionRunner.prototype.requireFootprintProducers,
  retained: CurrentPcb209WorkerConstructionRunner.prototype.retainedFootprintProducers,
});
const footprintDependencyMethods = Object.freeze({
  observe: CurrentPcb209WorkerConstructionRunner.prototype.observeFootprintDependencies,
  require: CurrentPcb209WorkerConstructionRunner.prototype.requireFootprintDependencies,
  retained: CurrentPcb209WorkerConstructionRunner.prototype.retainedFootprintDependencies,
});
// oxlint-enable typescript/unbound-method
function producerMethods(runner?: CurrentPcbWorkerConstructionOwner<OpeningProfile>): void {
    if (CurrentPcb209WorkerConstructionRunner.prototype.observeFootprintProducers !== footprintProducerMethods.observe ||
        CurrentPcb209WorkerConstructionRunner.prototype.requireFootprintProducers !== footprintProducerMethods.require ||
        CurrentPcb209WorkerConstructionRunner.prototype.retainedFootprintProducers !== footprintProducerMethods.retained ||
        runner !== undefined && (runner.observeFootprintProducers !== footprintProducerMethods.observe ||
          runner.requireFootprintProducers !== footprintProducerMethods.require || runner.retainedFootprintProducers !== footprintProducerMethods.retained)) {
      throw fail("FOOTPRINT_PRODUCER_METHOD_CHANGED");
    }
  }
function dependencyMethods(runner?: CurrentPcbWorkerConstructionOwner<OpeningProfile>): void {
  if (CurrentPcb209WorkerConstructionRunner.prototype.observeFootprintDependencies !== footprintDependencyMethods.observe ||
      CurrentPcb209WorkerConstructionRunner.prototype.requireFootprintDependencies !== footprintDependencyMethods.require ||
      CurrentPcb209WorkerConstructionRunner.prototype.retainedFootprintDependencies !== footprintDependencyMethods.retained ||
      runner !== undefined && (runner.observeFootprintDependencies !== footprintDependencyMethods.observe ||
        runner.requireFootprintDependencies !== footprintDependencyMethods.require || runner.retainedFootprintDependencies !== footprintDependencyMethods.retained)) {
    throw fail("FOOTPRINT_DEPENDENCY_METHOD_CHANGED");
  }
}
function fail(code: string): Error { return new Error(`PCB209_WORKER_STARTUP_OPENING_${code}`); }
const deadlineErrors = new WeakSet<Error>();
function deadline(): Error {
  const error = fail("DEADLINE"); deadlineErrors.add(error); return error;
}
type OpeningStage = "idle" | "target-validation" | "parent-before-preflight" | "ancillary-before-preflight" |
  "preflight" | "checkpoint-reverification" | "parent-before-open" | "ancillary-before-open" | "worker-auto-attach" |
  "begin-open" | "open-project" | "parent-after-open" | "ancillary-after-open" | "worker-construction" |
  "worker-project-identity" | "complete";
type OpeningStep = "idle" | "validate-target" | "opening-context" | "opening-owner-reproof" | "native-owner-reproof" |
  "browser-targets" | "parent-frames" | "parent-observation" | "ancillary-frame" | "ancillary-node" |
  "ancillary-observation" | "preflight-request" | "preflight-decode" | "checkpoint-reverification" |
  "bind-project" | "worker-arming" | "begin-open" | "open-project-request" | "open-project-decode" |
  "construction-completion" | "construction-owner" | "worker-project-identity" | "complete";
export interface CurrentPcb209WorkerStartupOpeningDiagnostics {
  readonly stage: OpeningStage;
  readonly step: OpeningStep;
  /** First capture failure, before cleanup. No arbitrary native error, path,
   * source or actor value is copied into this bounded status record. */
  readonly failure: Readonly<{ stage: OpeningStage; step: OpeningStep; kind: "deadline" | "refused" }> | null;
}
function retainedMethods(value: object, keys: readonly string[]): readonly unknown[] {
  if (types.isProxy(value) || !Object.isFrozen(value) || Object.getPrototypeOf(value) !== Object.prototype ||
      Reflect.ownKeys(value).length !== keys.length) { throw fail("DEPENDENCY"); }
  return keys.map(key => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor === undefined || !Object.hasOwn(descriptor, "value") || typeof descriptor.value !== "function") { throw fail("DEPENDENCY"); }
    return descriptor.value as unknown;
  });
}
async function observe(work: Promise<unknown>): Promise<void> {
  try { await work; } catch {
    // The original operation and retained result keep the failure.
  }
}
async function bounded<T>(work: Promise<T>, milliseconds = 2000): Promise<T> {
  const expired = Promise.withResolvers<never>();
  const timer = setTimeout(() => { expired.reject(deadline()); }, milliseconds);
  try { return await Promise.race([work, expired.promise]); } finally { clearTimeout(timer); }
}

interface OpeningResult<P extends OpeningProfile> {
  readonly opening: CurrentPcbDiagnosticOpeningResult;
  readonly construction: CurrentPcbWorkerConstructionPacketFor<P>;
  readonly workerIdentity: CurrentPcbWorkerConstructionProjectIdentity;
  readonly ancillaryFrame: Row | null;
  readonly executionAuthorized: false;
  readonly persistenceVerified: false;
}

class CurrentPcb209WorkerStartupOpeningCore<P extends OpeningProfile> {
  readonly #actorSource: CurrentPcb209ActorClockSourceQualification;
  readonly #dependency: CurrentPcbWorkerStartupDependency;
  readonly #opening: CurrentPcbWorkerStartupOpeningBinding;
  readonly #methods: readonly unknown[];
  readonly #request: CurrentPcbWorkerStartupDependency["request"];
  readonly #assertOwner: CurrentPcbWorkerStartupDependency["assertOriginalOwner"];
  readonly #assertTermination: CurrentPcbWorkerStartupDependency["assertOriginalTermination"];
  readonly #transport: CurrentPcbWorkerStartupTransportOwner<P>;
  #consumed = false;
  #settled = false;
  #released = false;
  #releasing = false;
  #openingAttempted = false;
  #capture: Promise<CurrentPcbWorkerConstructionPacketFor<P>> | null = null;
  #openingResult: CurrentPcbDiagnosticOpeningResult | null = null;
  #target: CurrentDisposableOpenSealedTarget | null = null;
  #construction: CurrentPcbWorkerConstructionPacketFor<P> | null = null;
  #workerIdentity: CurrentPcbWorkerConstructionProjectIdentity | null = null;
  #completed: OpeningResult<P> | null = null;
  #assignmentsConsumed = false;
  #assignments: CurrentPcbWorkerConstructionAssignments | null = null;
  #actorAttempted = false;
  #actor: CurrentPcb209WorkerStartupActorRunner | null = null;
  #actorPacket: CurrentPcb209WorkerStartupActorPacket | null = null;
  #footprintAttempted = false;
  #footprintRunner: CurrentPcbWorkerConstructionOwner<P> | null = null;
  #footprintPacket: CurrentFootprintCopyStatePacket | null = null;
  #footprintSourceAttempted = false;
  #footprintSourcePlan: CurrentFootprintSourcePlan | null = null;
  #footprintSourcePacket: CurrentFootprintSourceReadPacket | null = null;
  #footprintProducersAttempted = false;
  #footprintProducers: CurrentFootprintCopyProducerObservation | null = null;
  #footprintDependenciesAttempted = false;
  #footprintDependencies: CurrentFootprintCopyDependencyObservation | null = null;
  #registeredAsyncAttempted = false;
  #registeredAsync: CurrentFootprintCopyRegisteredAsyncObservation | null = null;
  #destinationsAttempted = false;
  #destinations: CurrentFootprintCopyDestinationObservation | null = null;
  #routeFinalAttempted = false;
  #clocksAttempted = false;
  #channelAttempted = false;
  #channelRunner: CurrentPcbWorkerConstructionOwner<P> | null = null;
  #channelPacket: CurrentPcbWorkerStartupChannelPacket | null = null;
  #stage: OpeningStage = "idle";
  #step: OpeningStep = "idle";
  #failure: CurrentPcb209WorkerStartupOpeningDiagnostics["failure"] = null;

  public constructor(internal: symbol, handoff: Pick<CurrentPcbWorkerStartupHandoff, "dependency" | "opening" | "actorClockSourceQualification">,
    createTransport: (dependency: CurrentPcbWorkerStartupDependency) => CurrentPcbWorkerStartupTransportOwner<P>) {
    if (internal !== INTERNAL_OPENING) { throw fail("FIXED_OPENING"); }
    if (handoff.actorClockSourceQualification === undefined) { throw fail("ACTOR_SOURCE_QUALIFICATION"); }
    requireCurrentPcb209ActorClockSourceQualification(handoff.actorClockSourceQualification);
    this.#actorSource = handoff.actorClockSourceQualification;
    this.#dependency = handoff.dependency; this.#opening = handoff.opening;
    this.#methods = retainedMethods(this.#opening, openingMethods);
    if (!Object.isFrozen(this.#dependency) || types.isProxy(this.#dependency)) { throw fail("DEPENDENCY"); }
    this.#request = this.#dependency.request; this.#assertOwner = this.#dependency.assertOriginalOwner;
    this.#assertTermination = this.#dependency.assertOriginalTermination;
    // Production never accepts a caller-selected worker source profile.
    this.#transport = createTransport(this.#dependency);
  }
  public status(): Readonly<{ consumed: boolean; settled: boolean; openingAttempted: boolean;
    openingResultRetained: boolean; constructionRetained: boolean; completed: boolean;
    transport: ReturnType<CurrentPcbWorkerStartupTransportOwner<P>["status"]>;
    diagnostics: CurrentPcb209WorkerStartupOpeningDiagnostics; executionAuthorized: false }> {
    return Object.freeze({ consumed: this.#consumed, settled: this.#settled, openingAttempted: this.#openingAttempted,
      openingResultRetained: this.#openingResult !== null, constructionRetained: this.#construction !== null,
      completed: this.#completed !== null, transport: this.#transport.status(),
      diagnostics: Object.freeze({ stage: this.#stage, step: this.#step, failure: this.#failure }), executionAuthorized: false });
  }
  public retainedOpeningResult(): CurrentPcbDiagnosticOpeningResult | null { return this.#openingResult; }
  #same(): void {
    if (retainedMethods(this.#opening, openingMethods).some((value, index) => value !== this.#methods[index]) ||
        this.#dependency.request !== this.#request || this.#dependency.assertOriginalOwner !== this.#assertOwner ||
        this.#dependency.assertOriginalTermination !== this.#assertTermination) { throw fail("DEPENDENCY_CHANGED"); }
  }
  #context(): z.infer<typeof contextSchema> {
    this.#same(); const context = contextSchema.parse(this.#opening.context());
    if (context.sessionId !== this.#dependency.parentSessionId) { throw fail("PARENT_SESSION"); }
    return context;
  }
  async #current(): Promise<void> {
    this.#step = "opening-context"; this.#context();
    this.#step = "opening-owner-reproof"; await bounded(this.#opening.reprove());
    this.#step = "opening-context"; this.#context();
    this.#step = "native-owner-reproof"; await bounded(this.#assertOwner.call(this.#dependency));
    this.#step = "opening-context"; this.#context();
  }
  async #send(command: CurrentPcbWorkerStartupCommand, step: OpeningStep): Promise<Row> {
    await this.#current();
    this.#step = step;
    const raw = await bounded(this.#request.call(this.#dependency, command));
    const reply = recordSchema.parse(captureCurrentPcbStringClockReply(raw).value);
    await this.#current(); return reply;
  }
  async #parent(finish = false): Promise<Row> {
    const targets = await this.#send({ method: "Target.getTargets", params: {} }, "browser-targets");
    const frames = await this.#send({ method: "Page.getFrameTree", params: {}, sessionId: this.#context().sessionId }, "parent-frames");
    this.#step = "parent-observation";
    if (finish) { this.#opening.finish(targets, frames); } else { this.#opening.observeParent(targets, frames); }
    await this.#current(); return targets;
  }
  async #ancillary(): Promise<void> {
    await this.#current(); const frameId = this.#opening.ancillaryFrame();
    if (frameId === null) { return; }
    const owner = await this.#send({ method: "DOM.getFrameOwner", params: { frameId }, sessionId: this.#context().sessionId }, "ancillary-frame");
    if (this.#opening.ancillaryFrame() !== frameId) { throw fail("ANCILLARY_CHANGED"); }
    const backendNodeId = z.number().int().min(1).max(2_147_483_647).parse(owner["backendNodeId"]);
    const node = await this.#send({ method: "DOM.describeNode", params: { backendNodeId, depth: 0, pierce: false },
      sessionId: this.#context().sessionId }, "ancillary-node");
    this.#step = "ancillary-observation";
    if (this.#opening.ancillaryFrame() !== frameId) { throw fail("ANCILLARY_CHANGED"); }
    this.#opening.observeAncillary(owner, node); await this.#current();
  }
  async #callOpening(target: CurrentDisposableOpenSealedTarget, phase: CurrentPcbDiagnosticOpeningPhase): Promise<CurrentPcbDiagnosticOpeningResult> {
    await this.#current(); const selected = this.#context();
    const command: CurrentPcbWorkerStartupCommand = { method: "Runtime.callFunctionOn", sessionId: selected.sessionId,
      params: { functionDeclaration: CURRENT_PCB_209_STARTUP_OPENING_FUNCTION, uniqueContextId: selected.uniqueContextId,
        arguments: [{ value: target }, { value: phase }], returnByValue: true, awaitPromise: true,
        silent: true, generatePreview: false, userGesture: false, throwOnSideEffect: false } };
    if (phase === "open-project") { this.#openingAttempted = true; }
    this.#step = phase === "preflight" ? "preflight-request" : "open-project-request";
    const reply = await bounded(this.#request.call(this.#dependency, command),
      phase === "preflight" ? 15_000 : CURRENT_PCB_209_STARTUP_OPENING_TIMING.hostMs);
    // Retain the decoded reply before a later owner/checkpoint failure. No
    // Timeout or missing reply permits this command to be sent again.
    this.#step = phase === "preflight" ? "preflight-decode" : "open-project-decode";
    const result = decodeCurrentPcbDiagnosticOpeningReply(reply, target, phase); this.#openingResult = result;
    await this.#current(); return result;
  }
  public async open(input: CurrentDisposableOpenSealedTarget, reverify: () => Promise<void>): Promise<OpeningResult<P>> {
    if (this.#consumed) { throw fail("CONSUMED"); } this.#consumed = true;
    try {
      this.#stage = "target-validation"; this.#step = "validate-target";
      const target = Object.freeze(currentDisposableOpenSealedTargetSchema.parse(captureCurrentPcbStringClockReply(input).value));
      this.#target = target;
      if (typeof reverify !== "function") { throw fail("CHECKPOINT_CALLBACK"); }
      this.#stage = "parent-before-preflight"; await this.#parent();
      this.#stage = "ancillary-before-preflight"; await this.#ancillary();
      this.#stage = "preflight";
      const preflight = await this.#callOpening(target, "preflight"), title = preflight.observation;
      this.#step = "preflight-decode";
      if (!preflight.ok || title === null) { throw fail("PREFLIGHT_REFUSED"); }
      this.#stage = "checkpoint-reverification"; this.#step = "checkpoint-reverification";
      await reverify(); await this.#current();
      this.#stage = "parent-before-open"; const targets = await this.#parent();
      this.#stage = "ancillary-before-open"; await this.#ancillary();
      this.#stage = "worker-auto-attach"; this.#step = "bind-project";
      this.#transport.bindExpectedProject({ projectUuid: target.projectUuid, branchUuid: target.branchUuid, windowTabId: title.windowTabId });
      this.#transport.bindExistingWorkers(targets);
      const capture = this.#transport.capture(); this.#capture = capture; void observe(capture);
      this.#step = "worker-arming";
      await this.#transport.whenArmed(); await this.#current();
      this.#stage = "begin-open"; this.#step = "begin-open";
      this.#opening.begin(target, { initialTitle: title.initialTitle, expectedOpenedTitle: title.expectedOpenedTitle });
      // The worker must run its bounded capture while the parent opener is
      // Awaiting startup. Waiting for the opener before capture would deadlock.
      this.#stage = "open-project";
      const result = await this.#callOpening(target, "open-project");
      this.#step = "open-project-decode";
      if (!result.ok || result.observation?.initialTitle !== title.initialTitle ||
          result.observation.expectedOpenedTitle !== title.expectedOpenedTitle ||
          result.observation.windowTabId !== title.windowTabId) { throw fail("OPEN_REFUSED"); }
      this.#stage = "parent-after-open"; await this.#parent(true);
      this.#stage = "ancillary-after-open"; await this.#ancillary();
      this.#stage = "worker-construction"; this.#step = "construction-completion";
      this.#construction = await capture; await this.#current();
      this.#step = "construction-owner";
      const runner = await this.#transport.requireOriginal(this.#construction); await this.#current();
      this.#stage = "worker-project-identity"; this.#step = "worker-project-identity";
      const identity = await runner.proveProjectIdentity(this.#construction); this.#workerIdentity = identity;
      if (identity.projectUuid !== target.projectUuid || identity.branchUuid !== target.branchUuid ||
          identity.windowTabId !== title.windowTabId) { throw fail("WORKER_PROJECT_IDENTITY"); }
      await this.#current();
      this.#completed = Object.freeze({ opening: result, construction: this.#construction,
        workerIdentity: identity, ancillaryFrame: this.#opening.ancillaryObservation(), executionAuthorized: false, persistenceVerified: false });
      this.#stage = "complete"; this.#step = "complete";
      return this.#completed;
    } catch (error) {
      this.#failure ??= Object.freeze({ stage: this.#stage, step: this.#step,
        kind: error instanceof Error && deadlineErrors.has(error) ? "deadline" : "refused" });
      if (this.#capture !== null) {
        try { await this.#transport.abort(); }
        catch (cleanupError) { throw new AggregateError([error, cleanupError], "PCB209_WORKER_STARTUP_OPENING_FAILED", { cause: cleanupError }); }
        finally { await observe(this.#capture); }
      }
      throw error;
    } finally { this.#settled = true; }
  }
  public requireOriginal(result: OpeningResult<P>): Promise<CurrentPcbWorkerStartupTransportOwner<P>> {
    return this.#requireOriginalResult(result);
  }
  async #requireOriginalResult(result: OpeningResult<P>): Promise<CurrentPcbWorkerStartupTransportOwner<P>> {
    if (result !== this.#completed || !this.#settled || this.#released || this.#releasing ||
        this.#workerIdentity === null || result.workerIdentity !== this.#workerIdentity) { throw fail("ORIGINAL_RESULT"); }
    await this.#current(); const runner = await this.#transport.requireOriginal(result.construction); await this.#current();
    await runner.requireProjectIdentity(result.construction, this.#workerIdentity); await this.#current(); return this.#transport;
  }
  /** An opening from another native launch cannot qualify this owner's UI or
   * worker route even when the serialized project identities are identical. */
  public async requireOriginalNativeDependency(result: OpeningResult<P>, dependency: CurrentPcbWorkerStartupDependency): Promise<void> {
    if (dependency !== this.#dependency) { throw fail("ORIGINAL_NATIVE_DEPENDENCY"); }
    await this.#requireOriginalResult(result);
    if (dependency !== this.#dependency) { throw fail("ORIGINAL_NATIVE_DEPENDENCY"); }
  }
  /** The same original opening can be joined to its own PCB qualification.
   * Matching serialized evidence cannot transfer it to another native channel
   * or replace the checkpoint-selected target. This is not writer authority. */
  public async requireOriginalPcbDependency(result: OpeningResult<P>,
    dependency: CurrentPcbWorkerStartupDependency, input: CurrentDisposableOpenSealedTarget): Promise<void> {
    const target = currentDisposableOpenSealedTargetSchema.parse(captureCurrentPcbStringClockReply(input).value);
    if (dependency !== this.#dependency || this.#target === null || JSON.stringify(target) !== JSON.stringify(this.#target)) {
      throw fail("ORIGINAL_PCB_DEPENDENCY");
    }
    await this.#requireOriginalResult(result);
    if (dependency !== this.#dependency || JSON.stringify(target) !== JSON.stringify(this.#target)) {
      throw fail("ORIGINAL_PCB_DEPENDENCY");
    }
  }
  /** These sequential reads associate current wrappers with the retained
   * constructor callbacks. They do not prove continuous or atomic ownership. */
  public async proveCurrentAssignments(result: OpeningResult<P>): Promise<CurrentPcbWorkerConstructionAssignments> {
    if (this.#assignmentsConsumed) { throw fail("ASSIGNMENTS_CONSUMED"); } this.#assignmentsConsumed = true;
    const transport = await this.requireOriginal(result);
    const runner = await transport.requireOriginal(result.construction); await this.#current();
    const assignments = await runner.proveCurrentAssignments(result.construction);
    this.#assignments = assignments; await this.#current(); return assignments;
  }
  public async requireCurrentAssignments(result: OpeningResult<P>,
    assignments: CurrentPcbWorkerConstructionAssignments): Promise<void> {
    if (assignments !== this.#assignments || this.#assignments === null) { throw fail("ORIGINAL_ASSIGNMENTS"); }
    const transport = await this.requireOriginal(result);
    const runner = await transport.requireOriginal(result.construction); await this.#current();
    await runner.requireCurrentAssignments(result.construction, assignments); await this.#current();
  }
  public retainedFootprintState(): Readonly<Record<string, unknown>> | null {
    return this.#footprintRunner?.retainedFootprintState() ?? null;
  }
  public async observeFootprintState(result: OpeningResult<P>,
    assignments: CurrentPcbWorkerConstructionAssignments): Promise<CurrentFootprintCopyStatePacket> {
    if (this.#footprintAttempted) { throw fail("FOOTPRINT_CONSUMED"); } this.#footprintAttempted = true;
    await this.requireCurrentAssignments(result, assignments);
    const transport = await this.requireOriginal(result);
    const runner = await transport.requireOriginal(result.construction); await this.#current();
    this.#footprintRunner = runner;
    const packet = await runner.observeFootprintState(result.construction, assignments);
    this.#footprintPacket = packet; await this.#current(); return packet;
  }
  public async requireFootprintState(result: OpeningResult<P>,
    assignments: CurrentPcbWorkerConstructionAssignments, packet: CurrentFootprintCopyStatePacket): Promise<void> {
    if (packet !== this.#footprintPacket || this.#footprintRunner === null) { throw fail("ORIGINAL_FOOTPRINT_PACKET"); }
    await this.requireCurrentAssignments(result, assignments);
    const transport = await this.requireOriginal(result);
    const runner = await transport.requireOriginal(result.construction); await this.#current();
    if (runner !== this.#footprintRunner) { throw fail("ORIGINAL_FOOTPRINT_OWNER"); }
    await runner.requireFootprintState(result.construction, assignments, packet); await this.#current();
  }
  public retainedFootprintSource(): Readonly<Record<string, unknown>> | null {
    return this.#footprintRunner?.retainedFootprintSource() ?? null;
  }
  /** The lifecycle must publish the selected checkpoint member before dispatch.
   * Neither the plan nor the returned data adopts
   * another construction owner or enables a footprint writer. */
  public async observeFootprintSource(result: OpeningResult<P>,
    assignments: CurrentPcbWorkerConstructionAssignments, state: CurrentFootprintCopyStatePacket,
    plan: CurrentFootprintSourcePlan): Promise<CurrentFootprintSourceReadPacket> {
    if (this.#footprintSourceAttempted) { throw fail("FOOTPRINT_SOURCE_CONSUMED"); }
    this.#footprintSourceAttempted = true; this.#footprintSourcePlan = plan;
    if (state !== this.#footprintPacket) { throw fail("ORIGINAL_FOOTPRINT_PACKET"); }
    await this.requireCurrentAssignments(result, assignments);
    const runner = this.#footprintRunner;
    if (runner === null) { throw fail("ORIGINAL_FOOTPRINT_OWNER"); }
    const packet = await runner.observeFootprintSource(result.construction, assignments, state, plan);
    this.#footprintSourcePacket = packet; await this.#current(); return packet;
  }
  public async requireFootprintSource(result: OpeningResult<P>,
    assignments: CurrentPcbWorkerConstructionAssignments, state: CurrentFootprintCopyStatePacket,
    plan: CurrentFootprintSourcePlan, packet: CurrentFootprintSourceReadPacket): Promise<void> {
    if (packet !== this.#footprintSourcePacket || plan !== this.#footprintSourcePlan || state !== this.#footprintPacket) {
      throw fail("ORIGINAL_FOOTPRINT_SOURCE_PACKET");
    }
    await this.requireCurrentAssignments(result, assignments);
    const runner = this.#footprintRunner;
    if (runner === null) { throw fail("ORIGINAL_FOOTPRINT_OWNER"); }
    await runner.requireFootprintSource(result.construction, assignments, state, plan, packet); await this.#current();
  }
  public retainedFootprintProducers(): Readonly<Record<string, unknown>> | null {
    producerMethods(this.#footprintRunner ?? undefined);
    return this.#footprintRunner === null ? null : this.#footprintRunner.retainedFootprintProducers();
  }
  /** Two opening identity/assignment reads precede the construction owner's
   * bounded producer stage. The retained arrays never leave that same owner. */
  public async observeFootprintProducers(result: OpeningResult<P>,
    assignments: CurrentPcbWorkerConstructionAssignments, state: CurrentFootprintCopyStatePacket): Promise<CurrentFootprintCopyProducerObservation> {
    producerMethods(this.#footprintRunner ?? undefined);
    if (this.#footprintProducersAttempted) { throw fail("FOOTPRINT_PRODUCER_CONSUMED"); }
    this.#footprintProducersAttempted = true;
    if (state !== this.#footprintPacket || this.#footprintRunner === null) { throw fail("ORIGINAL_FOOTPRINT_PACKET"); }
    const runner = this.#footprintRunner;
    await this.requireCurrentAssignments(result, assignments); producerMethods(this.#footprintRunner ?? undefined);
    if (runner !== this.#footprintRunner || state !== this.#footprintPacket) { throw fail("ORIGINAL_FOOTPRINT_OWNER"); }
    const packet = await runner.observeFootprintProducers(result.construction, assignments, state);
    this.#footprintProducers = packet;
    await this.#current(); producerMethods(this.#footprintRunner ?? undefined); return packet;
  }
  public async requireFootprintProducers(result: OpeningResult<P>,
    assignments: CurrentPcbWorkerConstructionAssignments, state: CurrentFootprintCopyStatePacket,
    packet: CurrentFootprintCopyProducerObservation): Promise<void> {
    producerMethods(this.#footprintRunner ?? undefined);
    if (packet !== this.#footprintProducers || this.#footprintProducers === null || state !== this.#footprintPacket ||
        this.#footprintRunner === null) { throw fail("ORIGINAL_FOOTPRINT_PRODUCER_PACKET"); }
    const runner = this.#footprintRunner;
    await this.requireCurrentAssignments(result, assignments); producerMethods(this.#footprintRunner ?? undefined);
    if (runner !== this.#footprintRunner || state !== this.#footprintPacket) { throw fail("ORIGINAL_FOOTPRINT_OWNER"); }
    await runner.requireFootprintProducers(result.construction, assignments, state, packet);
    await this.#current(); producerMethods(this.#footprintRunner ?? undefined);
  }
  public retainedFootprintDependencies(): Readonly<Record<string, unknown>> | null {
    dependencyMethods(this.#footprintRunner ?? undefined);
    return this.#footprintRunner === null ? null : this.#footprintRunner.retainedFootprintDependencies();
  }
  public async observeFootprintDependencies(result: OpeningResult<P>,
    assignments: CurrentPcbWorkerConstructionAssignments, state: CurrentFootprintCopyStatePacket,
    producers: CurrentFootprintCopyProducerObservation): Promise<CurrentFootprintCopyDependencyObservation> {
    dependencyMethods(this.#footprintRunner ?? undefined);
    if (this.#footprintDependenciesAttempted) { throw fail("FOOTPRINT_DEPENDENCY_CONSUMED"); }
    this.#footprintDependenciesAttempted = true;
    if (producers !== this.#footprintProducers || this.#footprintProducers === null || state !== this.#footprintPacket ||
        this.#footprintRunner === null) { throw fail("ORIGINAL_FOOTPRINT_PRODUCER_PACKET"); }
    const runner = this.#footprintRunner;
    await this.requireCurrentAssignments(result, assignments); dependencyMethods(this.#footprintRunner ?? undefined);
    if (runner !== this.#footprintRunner || state !== this.#footprintPacket) { throw fail("ORIGINAL_FOOTPRINT_OWNER"); }
    const packet = await runner.observeFootprintDependencies(result.construction, assignments, state, producers);
    this.#footprintDependencies = packet;
    await this.#current(); dependencyMethods(this.#footprintRunner ?? undefined); return packet;
  }
  public async requireFootprintDependencies(result: OpeningResult<P>,
    assignments: CurrentPcbWorkerConstructionAssignments, state: CurrentFootprintCopyStatePacket,
    producers: CurrentFootprintCopyProducerObservation, packet: CurrentFootprintCopyDependencyObservation): Promise<void> {
    dependencyMethods(this.#footprintRunner ?? undefined);
    if (packet !== this.#footprintDependencies || this.#footprintDependencies === null || producers !== this.#footprintProducers ||
        this.#footprintProducers === null || state !== this.#footprintPacket || this.#footprintRunner === null) {
      throw fail("ORIGINAL_FOOTPRINT_DEPENDENCY_PACKET");
    }
    const runner = this.#footprintRunner;
    await this.requireCurrentAssignments(result, assignments); dependencyMethods(this.#footprintRunner ?? undefined);
    if (runner !== this.#footprintRunner || state !== this.#footprintPacket) { throw fail("ORIGINAL_FOOTPRINT_OWNER"); }
    await runner.requireFootprintDependencies(result.construction, assignments, state, producers, packet);
    await this.#current(); dependencyMethods(this.#footprintRunner ?? undefined);
  }
  protected async observeRegisteredAsyncForExecution(result: OpeningResult<P>, assignments: CurrentPcbWorkerConstructionAssignments,
    state: CurrentFootprintCopyStatePacket): Promise<CurrentFootprintCopyRegisteredAsyncObservation> {
    if (result !== this.#completed || result.construction.profile !== "private.current-footprint-copy-construction.v1" ||
        assignments !== this.#assignments || state !== this.#footprintPacket || this.#footprintRunner === null ||
        this.#registeredAsyncAttempted) { throw fail("REGISTERED_ASYNC_STATE"); }
    this.#registeredAsyncAttempted = true;
    const runner = this.#footprintRunner;
    await this.#current();
    const observation = await runner.observeFootprintRegisteredAsync(result.construction, assignments, state);
    this.#registeredAsync = observation;
    await this.#current(); return observation;
  }
  protected async observeDestinationsForExecution(result: OpeningResult<P>, assignments: CurrentPcbWorkerConstructionAssignments,
    state: CurrentFootprintCopyStatePacket, dependencies: CurrentFootprintCopyDependencyObservation,
    callbacks: CurrentFootprintCopyRegisteredAsyncObservation): Promise<CurrentFootprintCopyDestinationObservation> {
    if (result !== this.#completed || result.construction.profile !== "private.current-footprint-copy-construction.v1" ||
        assignments !== this.#assignments || state !== this.#footprintPacket || dependencies !== this.#footprintDependencies ||
        callbacks !== this.#registeredAsync || this.#footprintRunner === null || this.#destinationsAttempted) { throw fail("DESTINATIONS_STATE"); }
    this.#destinationsAttempted = true; const runner = this.#footprintRunner;
    await this.#current();
    const observation = await runner.observeFootprintDestinations(result.construction, assignments, state, dependencies, callbacks);
    this.#destinations = observation; await this.#current(); return observation;
  }
  protected async requireRouteObservationsForExecution(result: OpeningResult<P>, assignments: CurrentPcbWorkerConstructionAssignments,
    state: CurrentFootprintCopyStatePacket, producers: CurrentFootprintCopyProducerObservation,
    dependencies: CurrentFootprintCopyDependencyObservation, callbacks: CurrentFootprintCopyRegisteredAsyncObservation,
    destinations: CurrentFootprintCopyDestinationObservation): Promise<void> {
    if (result !== this.#completed || result.construction.profile !== "private.current-footprint-copy-construction.v1" ||
        assignments !== this.#assignments || state !== this.#footprintPacket || producers !== this.#footprintProducers ||
        dependencies !== this.#footprintDependencies || callbacks !== this.#registeredAsync || destinations !== this.#destinations ||
        this.#footprintRunner === null || this.#clocksAttempted || this.#routeFinalAttempted) { throw fail("ROUTE_FINAL_STATE"); }
    this.#routeFinalAttempted = true; const runner = this.#footprintRunner;
    await this.#current();
    await runner.requireFootprintDependencies(result.construction, assignments, state, producers, dependencies);
    await runner.requireFootprintRegisteredAsync(result.construction, assignments, state, callbacks);
    await runner.requireFootprintDestinations(result.construction, assignments, state, destinations);
    await runner.requireCurrentAssignments(result.construction, assignments); await this.#current();
  }
  /** No copied opening or another native launch can retrieve this peer issuer. */
  public async originalParentWorkerPeer(result: OpeningResult<P>, dependency: CurrentPcbWorkerStartupDependency): Promise<Readonly<{
    runner: CurrentFootprintParentWorkerRunner; packet: CurrentFootprintParentWorkerObservation;
  }>> {
    if (result !== this.#completed || result.construction.profile !== "private.current-footprint-copy-construction.v1" ||
        dependency !== this.#dependency || !this.#settled || this.#released || this.#releasing) { throw fail("ORIGINAL_PARENT_PEER"); }
    await this.#current(); const peer = await this.#transport.originalParentWorkerPeer(result.construction); await this.#current(); return peer;
  }
  /** The original construction owner consumes the final dependency and callback
   * checks, then moves its event subscription to the transaction collector.
   * No extra assignment/provenance reads are hidden in this handoff. */
  protected async createTransactionClocksForExecution(result: OpeningResult<P>, assignments: CurrentPcbWorkerConstructionAssignments,
    state: CurrentFootprintCopyStatePacket, producers: CurrentFootprintCopyProducerObservation,
    dependencies: CurrentFootprintCopyDependencyObservation, callbacks: CurrentFootprintCopyRegisteredAsyncObservation,
    destinations: CurrentFootprintCopyDestinationObservation): Promise<CurrentFootprintCopyTransactionClockEvents> {
    if (result !== this.#completed || result.construction.profile !== "private.current-footprint-copy-construction.v1" ||
        assignments !== this.#assignments || state !== this.#footprintPacket || producers !== this.#footprintProducers ||
        dependencies !== this.#footprintDependencies || callbacks !== this.#registeredAsync || destinations !== this.#destinations || this.#footprintRunner === null ||
        this.#clocksAttempted || this.#routeFinalAttempted) { throw fail("TRANSACTION_CLOCK_STATE"); }
    this.#clocksAttempted = true;
    const runner = this.#footprintRunner;
    await this.#current();
    const clocks = await runner.createFootprintTransactionClocks(result.construction, assignments, state, producers, dependencies, callbacks, destinations);
    await this.#current(); return clocks;
  }
  public retainedFootprintRouteObservations(): Readonly<Record<string, unknown>> {
    const runner = this.#footprintRunner;
    return Object.freeze({ state: runner?.retainedFootprintState() ?? null,
      producers: runner?.retainedFootprintProducers() ?? null, dependencies: runner?.retainedFootprintDependencies() ?? null,
      callbacks: runner?.retainedFootprintAsync() ?? null, registrations: runner?.retainedParserRegistration() ?? null,
      destinations: runner?.retainedFootprintDestinations() ?? null, clocks: runner?.retainedFootprintTransactionClocks() ?? null,
      finalReproofAttempted: this.#routeFinalAttempted, clockHandoffAttempted: this.#clocksAttempted, executionAuthorized: false });
  }
  public retainedActorObservation(): Readonly<Record<string, unknown>> | null {
    return this.#actor === null ? null : Object.freeze({ status: this.#actor.status(), samples: this.#actor.retainedSamples() });
  }
  public async observeActorClock(result: OpeningResult<P>,
    assignments: CurrentPcbWorkerConstructionAssignments): Promise<CurrentPcb209WorkerStartupActorPacket> {
    if (this.#actorAttempted) { throw fail("ACTOR_CONSUMED"); } this.#actorAttempted = true;
    await this.requireCurrentAssignments(result, assignments);
    const transport = await this.requireOriginal(result);
    const runner = await transport.requireOriginal(result.construction); await this.#current();
    const actor = new CurrentPcb209WorkerStartupActorRunner(this.#actorSource, Object.freeze({
      observeUi: async (): Promise<unknown> => {
        await this.#current(); const context = this.#context();
        const raw = await bounded(this.#request.call(this.#dependency,
          currentPcbWorkerStartupUiActorCommand(context.sessionId, context.uniqueContextId)));
        const captured = captureCurrentPcbStringClockReply(raw); await this.#current(); return captured.value;
      },
      observeWorker: (): Promise<unknown> => runner.observeActorClock(result.construction, assignments),
      assertCurrent: (): Promise<void> => this.requireCurrentAssignments(result, assignments),
    }), result.workerIdentity);
    this.#actor = actor;
    const packet = await actor.observe(); this.#actorPacket = packet; await this.#current(); return packet;
  }
  public async requireActorClock(result: OpeningResult<P>,
    assignments: CurrentPcbWorkerConstructionAssignments, packet: CurrentPcb209WorkerStartupActorPacket): Promise<void> {
    if (packet !== this.#actorPacket || this.#actor === null) { throw fail("ORIGINAL_ACTOR_PACKET"); }
    await this.requireCurrentAssignments(result, assignments); await this.#actor.requireOriginal(packet); await this.#current();
  }
  /** Retains the original actor issuer for internal compositions. Matching JSON
   * cannot retrieve it; local Date samples still establish no server clock. */
  public async originalActorObservation(result: OpeningResult<P>,
    assignments: CurrentPcbWorkerConstructionAssignments, packet: CurrentPcb209WorkerStartupActorPacket): Promise<CurrentPcb209OriginalStartupActorObservation> {
    if (packet !== this.#actorPacket || this.#actor === null ||
      CurrentPcb209WorkerStartupActorRunner.prototype.originalObservation !== originalActorObservation) { throw fail("ORIGINAL_ACTOR_PACKET"); }
    const actor = this.#actor;
    await this.requireCurrentAssignments(result, assignments);
    const observation = await originalActorObservation.call(actor, packet);
    if (actor !== this.#actor || packet !== this.#actorPacket || observation.packet !== packet.originalActorPacket ||
      CurrentPcb209WorkerStartupActorRunner.prototype.originalObservation !== originalActorObservation) { throw fail("ORIGINAL_ACTOR_PACKET"); }
    await this.#current(); return observation;
  }
  public retainedChannelObservation(): Readonly<Record<string, unknown>> | null {
    return this.#channelRunner?.retainedChannelObservation() ?? null;
  }
  /** The construction owner closes over its original channel handles. Its full
   * assignment checks bracket the stage; each internal await rechecks the same
   * source-qualified worker without spending the channel budget on duplicate
   * assignment reads. These samples grant no writer or persistence authority. */
  public async observeCurrentChannel(result: OpeningResult<P>,
    assignments: CurrentPcbWorkerConstructionAssignments): Promise<CurrentPcbWorkerStartupChannelPacket> {
    if (this.#channelAttempted) { throw fail("CHANNEL_CONSUMED"); } this.#channelAttempted = true;
    if (assignments !== this.#assignments || this.#assignments === null) { throw fail("ORIGINAL_ASSIGNMENTS"); }
    const transport = await this.requireOriginal(result);
    const runner = await transport.requireOriginal(result.construction); await this.#current();
    this.#channelRunner = runner;
    const packet = await runner.observeCurrentChannel(result.construction, assignments);
    this.#channelPacket = packet; await this.#current(); return packet;
  }
  public async requireCurrentChannel(result: OpeningResult<P>,
    assignments: CurrentPcbWorkerConstructionAssignments, packet: CurrentPcbWorkerStartupChannelPacket): Promise<void> {
    if (packet !== this.#channelPacket || this.#channelRunner === null || assignments !== this.#assignments ||
        this.#assignments === null) { throw fail("ORIGINAL_CHANNEL_PACKET"); }
    const transport = await this.requireOriginal(result);
    const runner = await transport.requireOriginal(result.construction); await this.#current();
    if (runner !== this.#channelRunner) { throw fail("ORIGINAL_CHANNEL_OWNER"); }
    await runner.requireCurrentChannel(result.construction, assignments, packet); await this.#current();
  }
  public async releaseAfterTermination(): Promise<void> {
    if (!this.#settled || this.#released || this.#releasing) { throw fail("RELEASE_STATE"); }
    this.#releasing = true;
    try {
      if (this.#capture === null) {
        // Even a preflight refusal retains its original native owner. Do not
        // Require a capture listener that was never allocated, or infer exit.
        this.#same(); await bounded(this.#assertTermination.call(this.#dependency)); this.#same();
      } else { await this.#transport.releaseAfterTermination(); }
      this.#released = true;
    } finally { this.#releasing = false; }
  }
}

export type CurrentPcb209WorkerStartupOpeningResult = OpeningResult<"private.current-pcb209-worker-construction.v1">;
export type CurrentFootprintCopyStartupOpeningResult = OpeningResult<"private.current-footprint-copy-construction.v1">;
export type CurrentFootprintCopyOpeningOwner = CurrentPcb209WorkerStartupOpeningCore<OpeningProfile>;
export type CurrentFootprintCopyOpeningResult = OpeningResult<OpeningProfile>;

/** Fixed legacy/current preparation opening. It cannot select execution capture. */
export class CurrentPcb209WorkerStartupOpening extends CurrentPcb209WorkerStartupOpeningCore<"private.current-pcb209-worker-construction.v1"> {
  public constructor(handoff: Pick<CurrentPcbWorkerStartupHandoff, "dependency" | "opening" | "actorClockSourceQualification">) {
    super(INTERNAL_OPENING, handoff, dependency => new CurrentPcb209WorkerStartupTransport(dependency));
  }
}
/** Distinct execution opening selects its original 11-pause constructor. This
 * does not expose a create call or qualify worker destinations. */
export class CurrentFootprintCopyStartupOpening extends CurrentPcb209WorkerStartupOpeningCore<"private.current-footprint-copy-construction.v1"> {
  public constructor(handoff: Pick<CurrentPcbWorkerStartupHandoff, "dependency" | "opening" | "actorClockSourceQualification">) {
    super(INTERNAL_OPENING, handoff, dependency => new CurrentFootprintCopyWorkerStartupTransport(dependency));
  }
  public observeFootprintRegisteredAsync(result: CurrentFootprintCopyStartupOpeningResult, assignments: CurrentPcbWorkerConstructionAssignments,
    state: CurrentFootprintCopyStatePacket): Promise<CurrentFootprintCopyRegisteredAsyncObservation> {
    return this.observeRegisteredAsyncForExecution(result, assignments, state);
  }
  public observeFootprintDestinations(result: CurrentFootprintCopyStartupOpeningResult, assignments: CurrentPcbWorkerConstructionAssignments,
    state: CurrentFootprintCopyStatePacket, dependencies: CurrentFootprintCopyDependencyObservation,
    callbacks: CurrentFootprintCopyRegisteredAsyncObservation): Promise<CurrentFootprintCopyDestinationObservation> {
    return this.observeDestinationsForExecution(result, assignments, state, dependencies, callbacks);
  }
  public requireFootprintRouteObservations(result: CurrentFootprintCopyStartupOpeningResult, assignments: CurrentPcbWorkerConstructionAssignments,
    state: CurrentFootprintCopyStatePacket, producers: CurrentFootprintCopyProducerObservation,
    dependencies: CurrentFootprintCopyDependencyObservation, callbacks: CurrentFootprintCopyRegisteredAsyncObservation,
    destinations: CurrentFootprintCopyDestinationObservation): Promise<void> {
    return this.requireRouteObservationsForExecution(result, assignments, state, producers, dependencies, callbacks, destinations);
  }
  public createFootprintTransactionClocks(result: CurrentFootprintCopyStartupOpeningResult, assignments: CurrentPcbWorkerConstructionAssignments,
    state: CurrentFootprintCopyStatePacket, producers: CurrentFootprintCopyProducerObservation,
    dependencies: CurrentFootprintCopyDependencyObservation, callbacks: CurrentFootprintCopyRegisteredAsyncObservation,
    destinations: CurrentFootprintCopyDestinationObservation): Promise<CurrentFootprintCopyTransactionClockEvents> {
    return this.createTransactionClocksForExecution(result, assignments, state, producers, dependencies, callbacks, destinations);
  }
}
// oxlint-disable-next-line typescript/unbound-method -- Called only with the original private-field opening owner and exact retained result below.
const requireOriginalFootprintOpening = CurrentPcb209WorkerStartupOpeningCore.prototype.requireOriginalNativeDependency;
export async function requireCurrentFootprintCopyOpening(opening: CurrentFootprintCopyOpeningOwner,
  result: CurrentFootprintCopyOpeningResult, dependency: CurrentPcbWorkerStartupDependency): Promise<void> {
  if (CurrentPcb209WorkerStartupOpeningCore.prototype.requireOriginalNativeDependency !== requireOriginalFootprintOpening) {
    throw fail("ORIGINAL_METHOD_CHANGED");
  }
  await requireOriginalFootprintOpening.call(opening, result, dependency);
  if (CurrentPcb209WorkerStartupOpeningCore.prototype.requireOriginalNativeDependency !== requireOriginalFootprintOpening) {
    throw fail("ORIGINAL_METHOD_CHANGED");
  }
}

// oxlint-disable-next-line typescript/unbound-method -- The original private-field receiver and exact native dependency are rechecked by the captured method.
const originalParentPeer = CurrentPcb209WorkerStartupOpeningCore.prototype.originalParentWorkerPeer;
export async function originalCurrentFootprintCopyParentPeer(opening: CurrentFootprintCopyOpeningOwner,
  result: CurrentFootprintCopyOpeningResult, dependency: CurrentPcbWorkerStartupDependency): Promise<Readonly<{
    runner: CurrentFootprintParentWorkerRunner; packet: CurrentFootprintParentWorkerObservation;
  }>> {
  if (CurrentPcb209WorkerStartupOpeningCore.prototype.originalParentWorkerPeer !== originalParentPeer) { throw fail("ORIGINAL_METHOD_CHANGED"); }
  const peer = await originalParentPeer.call(opening, result, dependency);
  if (CurrentPcb209WorkerStartupOpeningCore.prototype.originalParentWorkerPeer !== originalParentPeer) { throw fail("ORIGINAL_METHOD_CHANGED"); }
  return peer;
}
