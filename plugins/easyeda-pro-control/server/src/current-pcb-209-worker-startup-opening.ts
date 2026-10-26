/** Fixed209 original-owner choreography. Legacy opening remains separate. The lifecycle must publish the sealed
 * checkpoint intent before calling open(). This module supplies no journal,
 * owner adoption, public writer or saved-state authority. */
/* oxlint-disable import/max-dependencies -- This coordinator joins the fixed parent opener, original construction owner and actor observers without exporting their native capabilities to another owner. */
import { types } from "node:util";
import { z } from "zod";
import type { CurrentFootprintCopyStatePacket } from "./current-footprint-copy-state.ts";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import type { CurrentDisposableOpenSealedTarget } from "./current-disposable-open.ts";
import type { CurrentPcbWorkerStartupHandoff, CurrentPcbWorkerStartupOpeningBinding } from "./current-pcb-diagnostic-owner.ts";
import { CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION, decodeCurrentPcbDiagnosticOpeningReply } from "./current-pcb-diagnostic-opening.ts";
import type { CurrentPcbDiagnosticOpeningPhase, CurrentPcbDiagnosticOpeningResult } from "./current-pcb-diagnostic-opening.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { CurrentPcb209WorkerConstructionPacket, CurrentPcb209WorkerConstructionRunner, CurrentPcbWorkerConstructionProjectIdentity } from "./current-pcb-worker-construction-runner.ts";
import type { CurrentPcbWorkerConstructionAssignments } from "./current-pcb-worker-construction-assignment.ts";
import type { CurrentPcbWorkerStartupCommand, CurrentPcbWorkerStartupDependency } from "./current-pcb-worker-startup-contract.ts";
import { CurrentPcb209WorkerStartupTransport } from "./current-pcb-worker-startup-transport.ts";
import { currentPcbWorkerStartupUiActorCommand } from "./current-pcb-worker-startup-actor.ts";
import { CurrentPcb209WorkerStartupActorRunner } from "./current-pcb-209-worker-startup-actor.ts";
import type { CurrentPcb209WorkerStartupActorPacket } from "./current-pcb-209-worker-startup-actor.ts";
import { requireCurrentPcb209ActorClockSourceQualification } from "./current-pcb-209-actor-clock-source.ts";
import type { CurrentPcb209ActorClockSourceQualification } from "./current-pcb-209-actor-clock-source.ts";
import type { CurrentPcbWorkerStartupChannelPacket } from "./current-pcb-worker-startup-channel-observation.ts";

type Row = Record<string, unknown>;
const recordSchema = z.record(z.string(), z.unknown());
const contextSchema = z.object({ sessionId: z.string().min(1).max(128).regex(/^[A-Za-z\d_.:-]+$/u),
  uniqueContextId: z.string().min(1).max(128).regex(/^[A-Za-z\d_.:-]+$/u) }).strict();
const openingMethods = ["context", "reprove", "begin", "finish", "observeParent", "ancillaryFrame",
  "observeAncillary", "ancillaryObservation"] as const;
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

export interface CurrentPcb209WorkerStartupOpeningResult {
  readonly opening: CurrentPcbDiagnosticOpeningResult;
  readonly construction: CurrentPcb209WorkerConstructionPacket;
  readonly workerIdentity: CurrentPcbWorkerConstructionProjectIdentity;
  readonly ancillaryFrame: Row | null;
  readonly executionAuthorized: false;
  readonly persistenceVerified: false;
}

export class CurrentPcb209WorkerStartupOpening {
  readonly #actorSource: CurrentPcb209ActorClockSourceQualification;
  readonly #dependency: CurrentPcbWorkerStartupDependency;
  readonly #opening: CurrentPcbWorkerStartupOpeningBinding;
  readonly #methods: readonly unknown[];
  readonly #request: CurrentPcbWorkerStartupDependency["request"];
  readonly #assertOwner: CurrentPcbWorkerStartupDependency["assertOriginalOwner"];
  readonly #assertTermination: CurrentPcbWorkerStartupDependency["assertOriginalTermination"];
  readonly #transport: CurrentPcb209WorkerStartupTransport;
  #consumed = false;
  #settled = false;
  #released = false;
  #releasing = false;
  #openingAttempted = false;
  #capture: Promise<CurrentPcb209WorkerConstructionPacket> | null = null;
  #openingResult: CurrentPcbDiagnosticOpeningResult | null = null;
  #target: CurrentDisposableOpenSealedTarget | null = null;
  #construction: CurrentPcb209WorkerConstructionPacket | null = null;
  #workerIdentity: CurrentPcbWorkerConstructionProjectIdentity | null = null;
  #completed: CurrentPcb209WorkerStartupOpeningResult | null = null;
  #assignmentsConsumed = false;
  #assignments: CurrentPcbWorkerConstructionAssignments | null = null;
  #actorAttempted = false;
  #actor: CurrentPcb209WorkerStartupActorRunner | null = null;
  #actorPacket: CurrentPcb209WorkerStartupActorPacket | null = null;
  #footprintAttempted = false;
  #footprintRunner: CurrentPcb209WorkerConstructionRunner | null = null;
  #footprintPacket: CurrentFootprintCopyStatePacket | null = null;
  #channelAttempted = false;
  #channelRunner: CurrentPcb209WorkerConstructionRunner | null = null;
  #channelPacket: CurrentPcbWorkerStartupChannelPacket | null = null;
  #stage: OpeningStage = "idle";
  #step: OpeningStep = "idle";
  #failure: CurrentPcb209WorkerStartupOpeningDiagnostics["failure"] = null;

  public constructor(handoff: Pick<CurrentPcbWorkerStartupHandoff, "dependency" | "opening" | "actorClockSourceQualification">) {
    if (handoff.actorClockSourceQualification === undefined) { throw fail("ACTOR_SOURCE_QUALIFICATION"); }
    requireCurrentPcb209ActorClockSourceQualification(handoff.actorClockSourceQualification);
    this.#actorSource = handoff.actorClockSourceQualification;
    this.#dependency = handoff.dependency; this.#opening = handoff.opening;
    this.#methods = retainedMethods(this.#opening, openingMethods);
    if (!Object.isFrozen(this.#dependency) || types.isProxy(this.#dependency)) { throw fail("DEPENDENCY"); }
    this.#request = this.#dependency.request; this.#assertOwner = this.#dependency.assertOriginalOwner;
    this.#assertTermination = this.#dependency.assertOriginalTermination;
    // Production never accepts a caller-selected worker source profile.
    this.#transport = new CurrentPcb209WorkerStartupTransport(this.#dependency);
  }
  public status(): Readonly<{ consumed: boolean; settled: boolean; openingAttempted: boolean;
    openingResultRetained: boolean; constructionRetained: boolean; completed: boolean;
    transport: ReturnType<CurrentPcb209WorkerStartupTransport["status"]>;
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
      params: { functionDeclaration: CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION, uniqueContextId: selected.uniqueContextId,
        arguments: [{ value: target }, { value: phase }], returnByValue: true, awaitPromise: true,
        silent: true, generatePreview: false, userGesture: false, throwOnSideEffect: false } };
    if (phase === "open-project") { this.#openingAttempted = true; }
    this.#step = phase === "preflight" ? "preflight-request" : "open-project-request";
    const reply = await bounded(this.#request.call(this.#dependency, command), phase === "preflight" ? 15_000 : 70_000);
    // Retain the decoded reply before a later owner/checkpoint failure. No
    // Timeout or missing reply permits this command to be sent again.
    this.#step = phase === "preflight" ? "preflight-decode" : "open-project-decode";
    const result = decodeCurrentPcbDiagnosticOpeningReply(reply, target, phase); this.#openingResult = result;
    await this.#current(); return result;
  }
  public async open(input: CurrentDisposableOpenSealedTarget, reverify: () => Promise<void>): Promise<CurrentPcb209WorkerStartupOpeningResult> {
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
  public requireOriginal(result: CurrentPcb209WorkerStartupOpeningResult): Promise<CurrentPcb209WorkerStartupTransport> {
    return this.#requireOriginalResult(result);
  }
  async #requireOriginalResult(result: CurrentPcb209WorkerStartupOpeningResult): Promise<CurrentPcb209WorkerStartupTransport> {
    if (result !== this.#completed || !this.#settled || this.#released || this.#releasing ||
        this.#workerIdentity === null || result.workerIdentity !== this.#workerIdentity) { throw fail("ORIGINAL_RESULT"); }
    await this.#current(); const runner = await this.#transport.requireOriginal(result.construction); await this.#current();
    await runner.requireProjectIdentity(result.construction, this.#workerIdentity); await this.#current(); return this.#transport;
  }
  /** The same original opening can be joined to its own PCB qualification.
   * Matching serialized evidence cannot transfer it to another native channel
   * or replace the checkpoint-selected target. This is not writer authority. */
  public async requireOriginalPcbDependency(result: CurrentPcb209WorkerStartupOpeningResult,
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
  public async proveCurrentAssignments(result: CurrentPcb209WorkerStartupOpeningResult): Promise<CurrentPcbWorkerConstructionAssignments> {
    if (this.#assignmentsConsumed) { throw fail("ASSIGNMENTS_CONSUMED"); } this.#assignmentsConsumed = true;
    const transport = await this.requireOriginal(result);
    const runner = await transport.requireOriginal(result.construction); await this.#current();
    const assignments = await runner.proveCurrentAssignments(result.construction);
    this.#assignments = assignments; await this.#current(); return assignments;
  }
  public async requireCurrentAssignments(result: CurrentPcb209WorkerStartupOpeningResult,
    assignments: CurrentPcbWorkerConstructionAssignments): Promise<void> {
    if (assignments !== this.#assignments || this.#assignments === null) { throw fail("ORIGINAL_ASSIGNMENTS"); }
    const transport = await this.requireOriginal(result);
    const runner = await transport.requireOriginal(result.construction); await this.#current();
    await runner.requireCurrentAssignments(result.construction, assignments); await this.#current();
  }
  public retainedFootprintState(): Readonly<Record<string, unknown>> | null {
    return this.#footprintRunner?.retainedFootprintState() ?? null;
  }
  public async observeFootprintState(result: CurrentPcb209WorkerStartupOpeningResult,
    assignments: CurrentPcbWorkerConstructionAssignments): Promise<CurrentFootprintCopyStatePacket> {
    if (this.#footprintAttempted) { throw fail("FOOTPRINT_CONSUMED"); } this.#footprintAttempted = true;
    await this.requireCurrentAssignments(result, assignments);
    const transport = await this.requireOriginal(result);
    const runner = await transport.requireOriginal(result.construction); await this.#current();
    this.#footprintRunner = runner;
    const packet = await runner.observeFootprintState(result.construction, assignments);
    this.#footprintPacket = packet; await this.#current(); return packet;
  }
  public async requireFootprintState(result: CurrentPcb209WorkerStartupOpeningResult,
    assignments: CurrentPcbWorkerConstructionAssignments, packet: CurrentFootprintCopyStatePacket): Promise<void> {
    if (packet !== this.#footprintPacket || this.#footprintRunner === null) { throw fail("ORIGINAL_FOOTPRINT_PACKET"); }
    await this.requireCurrentAssignments(result, assignments);
    const transport = await this.requireOriginal(result);
    const runner = await transport.requireOriginal(result.construction); await this.#current();
    if (runner !== this.#footprintRunner) { throw fail("ORIGINAL_FOOTPRINT_OWNER"); }
    await runner.requireFootprintState(result.construction, assignments, packet); await this.#current();
  }
  public retainedActorObservation(): Readonly<Record<string, unknown>> | null {
    return this.#actor === null ? null : Object.freeze({ status: this.#actor.status(), samples: this.#actor.retainedSamples() });
  }
  public async observeActorClock(result: CurrentPcb209WorkerStartupOpeningResult,
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
  public async requireActorClock(result: CurrentPcb209WorkerStartupOpeningResult,
    assignments: CurrentPcbWorkerConstructionAssignments, packet: CurrentPcb209WorkerStartupActorPacket): Promise<void> {
    if (packet !== this.#actorPacket || this.#actor === null) { throw fail("ORIGINAL_ACTOR_PACKET"); }
    await this.requireCurrentAssignments(result, assignments); await this.#actor.requireOriginal(packet); await this.#current();
  }
  public retainedChannelObservation(): Readonly<Record<string, unknown>> | null {
    return this.#channelRunner?.retainedChannelObservation() ?? null;
  }
  /** The construction owner closes over its original channel handles. Its full
   * assignment checks bracket the stage; each internal await rechecks the same
   * source-qualified worker without spending the channel budget on duplicate
   * assignment reads. These samples grant no writer or persistence authority. */
  public async observeCurrentChannel(result: CurrentPcb209WorkerStartupOpeningResult,
    assignments: CurrentPcbWorkerConstructionAssignments): Promise<CurrentPcbWorkerStartupChannelPacket> {
    if (this.#channelAttempted) { throw fail("CHANNEL_CONSUMED"); } this.#channelAttempted = true;
    if (assignments !== this.#assignments || this.#assignments === null) { throw fail("ORIGINAL_ASSIGNMENTS"); }
    const transport = await this.requireOriginal(result);
    const runner = await transport.requireOriginal(result.construction); await this.#current();
    this.#channelRunner = runner;
    const packet = await runner.observeCurrentChannel(result.construction, assignments);
    this.#channelPacket = packet; await this.#current(); return packet;
  }
  public async requireCurrentChannel(result: CurrentPcb209WorkerStartupOpeningResult,
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
