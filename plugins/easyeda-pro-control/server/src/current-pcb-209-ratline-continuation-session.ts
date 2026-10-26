/* oxlint-disable import/max-dependencies -- This private coordinator composes existing source, construction, capture and original event owners without replacing their gates. */
/** Fresh-launch source-qualified continuation composition.
 * The adapter must supply the original prepared disposable opening and retain
 * native cumulative accounting. The held-import purpose cannot adopt this. */
import { types } from "node:util";
import { currentPcb209RatlineFailureReason } from "./current-pcb-209-ratline-diagnostics.ts";
import { bindCurrentPcb209RatlineContinuationTiming } from "./current-pcb-209-ratline-continuation-timing.ts";
import { CurrentPcbDiagnosticContext } from "./current-pcb-diagnostic-context.ts";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { CurrentDisposableOpenSealedTarget } from "./current-disposable-open.ts";
import { CurrentPcb209RatlineContinuationRouter } from "./current-pcb-209-ratline-continuation-router.ts";
import type { CurrentPcb209RatlineContinuationRealm, CurrentPcb209RatlineContinuationRole,
  CurrentPcb209RatlineContinuationRoutingDependency } from "./current-pcb-209-ratline-continuation-router.ts";
import { CurrentPcb209RatlinePcbContextRouter } from "./current-pcb-209-ratline-pcb-context-router.ts";
import type { CurrentPcb209RatlinePcbContextDependency } from "./current-pcb-209-ratline-pcb-context-router.ts";
import { CurrentPcb209RatlineBootstrapOwner } from "./current-pcb-209-ratline-bootstrap-owner.ts";
import type { CurrentPcb209RatlineBootstrapDependency, CurrentPcb209RatlineBootstrapPacket } from "./current-pcb-209-ratline-bootstrap-owner.ts";
import type { CurrentPcb209RatlinePcbBootstrapPacket } from "./current-pcb-209-ratline-pcb-bootstrap-owner.ts";
import { CurrentPcb209RatlinePcbCreation } from "./current-pcb-209-ratline-creation-runner.ts";
import type { CurrentPcb209RatlineCreationPacket, CurrentPcb209RatlineWorkerCreation } from "./current-pcb-209-ratline-creation-runner.ts";
import { CurrentPcb209RatlinePcbStartup, CurrentPcb209RatlineWorkerStartup } from "./current-pcb-209-ratline-startup-session.ts";
import type { CurrentPcb209RatlineStartupPacket } from "./current-pcb-209-ratline-startup-session.ts";
import { CurrentPcb209RatlineSubordinateContinuation } from "./current-pcb-209-ratline-subordinate-continuation.ts";
import type { CurrentPcb209RatlineSubordinateContinuationPacket } from "./current-pcb-209-ratline-subordinate-continuation.ts";
import type { CurrentPcb209RatlineOriginCommand } from "./current-pcb-209-ratline-origin.ts";
import { CurrentPcb209RatlineOrigin } from "./current-pcb-209-ratline-origin.ts";
import type { CurrentPcb209RatlineOriginEvidence, CurrentPcb209RatlineOriginSummary } from "./current-pcb-209-ratline-origin-observation.ts";
import { CurrentPcb209RatlineContinuationHandoff, bindCurrentPcb209RatlineContinuationHandoff } from "./current-pcb-209-ratline-continuation-handoff.ts";
import { CURRENT_PCB_209_RATLINE_SOURCE_PROFILE } from "./current-pcb-209-ratline-source.ts";

type Creation = CurrentPcb209RatlinePcbCreation | CurrentPcb209RatlineWorkerCreation;
type ChildEvents = Parameters<CurrentPcb209RatlineBootstrapDependency["subscribe"]>[0];
type ParentEvent = Parameters<CurrentPcb209RatlineContinuationRoutingDependency["subscribe"]>[0] extends { event: (event: infer Event) => void } ? Event : never;
type ParentEvents = Parameters<CurrentPcb209RatlinePcbContextDependency["subscribe"]>[0];
type Request = Parameters<CurrentPcb209RatlinePcbContextDependency["request"]>[0] |
  Parameters<CurrentPcb209RatlineBootstrapDependency["request"]>[0] | CurrentPcb209RatlineOriginCommand;
export interface CurrentPcb209RatlineContinuationDependency extends CurrentPcb209RatlineContinuationRoutingDependency {
  /** Reprove the original fresh-purpose opening, SQL reader and owner before
   * the one navigation. It cannot be replaced by a caller-supplied receipt. */
  readonly assertOriginalBeforeNavigation: () => Promise<void>;
  readonly beginOriginalPcbNavigation: () => Promise<void>;
  readonly request: (role: CurrentPcb209RatlineContinuationRole, command: Request) => Promise<unknown>;
  readonly requestParent: CurrentPcb209RatlinePcbContextDependency["requestParent"];
  readonly beginCleanup: () => Promise<void>;
  readonly retireOriginalRealm: (role: "worker" | "subordinate", sessionId: string) => void;
}
export interface CurrentPcb209RatlineContinuationPacket {
  readonly retirements: ReturnType<CurrentPcb209RatlineContinuationHandoff["evidence"]>;
  readonly profile: "private.pcb209-ratline-fresh-continuation.v1";
  readonly pcbSource: CurrentPcb209RatlinePcbBootstrapPacket;
  readonly workerSource: CurrentPcb209RatlineBootstrapPacket;
  readonly subordinateSource: CurrentPcb209RatlineBootstrapPacket;
  readonly pcb: CurrentPcb209RatlineStartupPacket;
  readonly worker: CurrentPcb209RatlineStartupPacket;
  readonly subordinate: CurrentPcb209RatlineSubordinateContinuationPacket;
  readonly nativeOrigin: CurrentPcb209RatlineOriginSummary;
  readonly nativeOriginEvidence: CurrentPcb209RatlineOriginEvidence;
  readonly allThreeOriginalSourcesQualified: true;
  readonly nativeWorkerTargetIdentityVerified: false;
  readonly callbackReturnCompletionVerified: false;
  readonly subscribedCanvasPeerOwnershipVerified: false;
  readonly copperCompletionVerified: false;
  readonly completeStartupVerified: false;
  readonly completeLiveBaselineVerified: false;
  readonly executionAuthorized: false;
  readonly saveAuthorized: false;
}
interface Child {
  readonly role: "worker" | "subordinate";
  owner: CurrentPcb209RatlineBootstrapOwner | null;
  realm: CurrentPcb209RatlineContinuationRealm | null;
  creation: Creation | null;
  construction: CurrentPcb209RatlineCreationPacket | null;
  events: ChildEvents | null;
}
type Phase = "ready" | "pcb-source" | "worker-source" | "subordinate-source" | "callbacks" | "captured" | "failed" | "cleanup" | "released";
const keys = ["requireOriginalParent", "assertOriginalTermination", "subscribe", "assertOriginalBeforeNavigation",
  "beginOriginalPcbNavigation", "request", "requestParent", "beginCleanup", "retireOriginalRealm"] as const;
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`PCB209_RATLINE_CONTINUATION_${code}`); } }
function members(value: CurrentPcb209RatlineContinuationDependency): readonly unknown[] {
  need(value !== null && typeof value === "object" && !types.isProxy(value) && Object.isFrozen(value) && Object.getPrototypeOf(value) === Object.prototype, "DEPENDENCY");
  need(Reflect.ownKeys(value).length === keys.length, "DEPENDENCY");
  return keys.map(key => { const field = Object.getOwnPropertyDescriptor(value, key);
    need(field !== undefined && Object.hasOwn(field, "value") && typeof field.value === "function", "DEPENDENCY"); return field.value as unknown; });
}
async function bounded<T>(work: Promise<T>): Promise<T> {
  const expired = Promise.withResolvers<never>(), timer = setTimeout(() => { expired.reject(new Error("PCB209_RATLINE_CONTINUATION_DEADLINE")); }, 2500);
  try { return await Promise.race([work, expired.promise]); } finally { clearTimeout(timer); }
}
async function observed(work: Promise<unknown>): Promise<void> { try { await work; } catch {
  // The original capture and cleanup retain the failure.
} }
export class CurrentPcb209RatlineContinuationSession {
  readonly #dependency: CurrentPcb209RatlineContinuationDependency;
  readonly #members: readonly unknown[];
  readonly #context: CurrentPcbDiagnosticContext;
  readonly #target: CurrentDisposableOpenSealedTarget;
  readonly #routing: CurrentPcb209RatlineContinuationRouter;
  readonly #handoff: CurrentPcb209RatlineContinuationHandoff;
  readonly #worker: Child = { role: "worker", owner: null, realm: null, creation: null, construction: null, events: null };
  readonly #subordinate: Child = { role: "subordinate", owner: null, realm: null, creation: null, construction: null, events: null };
  readonly #failure = Promise.withResolvers<never>();
  #phase: Phase = "ready";
  #firstFailure: unknown = null;
  #pcbRealm: CurrentPcb209RatlineContinuationRealm | null = null;
  #parentEvents: ParentEvents | null = null;
  readonly #parentBacklog: ParentEvent[] = [];
  #parentBacklogBytes = 0;
  #parentSubscriptionClaimed = false;
  #contextRouter: CurrentPcb209RatlinePcbContextRouter | null = null;
  #origin: CurrentPcb209RatlineOrigin | null = null;
  #pcbSource: CurrentPcb209RatlinePcbBootstrapPacket | null = null;
  #pcb: CurrentPcb209RatlinePcbStartup | null = null;
  #workerStartup: CurrentPcb209RatlineWorkerStartup | null = null;
  #subordinateObserver: CurrentPcb209RatlineSubordinateContinuation | null = null;
  #pcbWork: Promise<CurrentPcb209RatlineStartupPacket> | null = null;
  #workerWork: Promise<CurrentPcb209RatlineStartupPacket> | null = null;
  #packet: CurrentPcb209RatlineContinuationPacket | null = null;
  #cleanup: Promise<void> | null = null;
  #cleanupAdmission: Promise<void> | null = null;
  #cleanupAdmitted = false;
  #releaseStarted = false;
  public constructor(context: CurrentPcbDiagnosticContext, target: CurrentDisposableOpenSealedTarget,
    dependency: CurrentPcb209RatlineContinuationDependency) {
    this.#members = members(dependency); this.#dependency = dependency; this.#context = context;
    this.#target = Object.freeze(currentDisposableOpenSealedTargetSchema.parse(captureCurrentPcbStringClockReply(target).value));
    need(!types.isProxy(context) && Object.getPrototypeOf(context) === CurrentPcbDiagnosticContext.prototype, "ORIGINAL_CONTEXT");
    this.#handoff = new CurrentPcb209RatlineContinuationHandoff(() => this.#current(), (role, sessionId): void => {
      this.#same(); this.#dependency.retireOriginalRealm(role, sessionId); this.#routing.retireOriginalRealm(role, sessionId);
    });
    this.#routing = new CurrentPcb209RatlineContinuationRouter({ requireOriginalParent: (): ReturnType<typeof dependency.requireOriginalParent> => dependency.requireOriginalParent(),
      assertOriginalTermination: (): Promise<void> => dependency.assertOriginalTermination(), subscribe: (events): (() => void) => dependency.subscribe(events) }, this.#handoff);
    void observed(this.#failure.promise);
  }
  #same(): void {
    need(members(this.#dependency).every((value, index) => value === this.#members[index]), "DEPENDENCY_CHANGED");
    need(this.#phase !== "failed" && this.#phase !== "cleanup" && this.#phase !== "released", "NOT_CURRENT"); this.#context.assertCurrent();
  }
  async #current(): Promise<void> {
    this.#same(); need(this.#pcbRealm !== null, "PARENT_REQUIRED"); await this.#routing.requireOriginal(this.#pcbRealm); this.#same();
  }
  #lost(error: unknown = new Error("PCB209_RATLINE_CONTINUATION_STREAM_LOST")): void {
    if (this.#firstFailure !== null || this.#phase === "released") { return; }
    this.#firstFailure = error; if (this.#phase !== "cleanup") { this.#phase = "failed"; }
    this.#handoff.abort();
    void this.#beginCleanupAdmission(); this.#failure.reject(error); this.#parentEvents?.lost(); this.#worker.events?.lost(); this.#subordinate.events?.lost();
  }
  #beginCleanupAdmission(): Promise<void> {
    if (this.#cleanupAdmission === null) {
      const settled = Promise.withResolvers<undefined>(); this.#cleanupAdmission = settled.promise; void observed(this.#cleanupAdmission);
      void observed((async (): Promise<void> => {
        try { await bounded(this.#dependency.beginCleanup()); this.#cleanupAdmitted = true;
          // oxlint-disable-next-line unicorn/no-useless-undefined -- The strict undefined resolver requires an explicit argument.
          settled.resolve(undefined); }
        catch (error) { settled.reject(error); }
      })());
    }
    return this.#cleanupAdmission;
  }
  async #send(role: CurrentPcb209RatlineContinuationRole, command: Request): Promise<unknown> {
    if (this.#phase === "failed" || this.#phase === "cleanup") {
      await this.#beginCleanupAdmission(); need(this.#cleanupAdmitted &&
        (command.method === "Debugger.removeBreakpoint" || command.method === "Debugger.resume"), "CLEANUP_COMMAND");
    } else { this.#same(); }
    need(this.#phase !== "released", "RELEASED"); return this.#dependency.request(role, command);
  }
  async #wait<T>(work: Promise<T>): Promise<T> {
    try { return await Promise.race([work, this.#failure.promise]); } catch (error) { this.#lost(error); throw error; }
  }
  #childOwner(child: Child, parent: () => CurrentPcb209RatlineContinuationRealm | null): CurrentPcb209RatlineBootstrapOwner {
    const dependency = Object.freeze<CurrentPcb209RatlineBootstrapDependency>({
      assertOriginalChild: async (creation, packet): Promise<void> => {
        await creation.requireOriginal(packet); await this.#current();
        if (child.creation === null) { child.creation = creation; child.construction = packet; }
        need(child.creation === creation && child.construction === packet && packet.role === (child.role === "worker" ? "pcb" : "worker"), "ORIGINAL_CONSTRUCTION");
        if (child.realm !== null) {
          need(child.realm.targetId === packet.childTargetId && child.realm.sessionId === packet.childSessionId, "CHILD_ATTACHMENT");
          await this.#routing.requireOriginal(child.realm); await this.#current();
        }
      },
      assertOriginalTermination: (): Promise<void> => this.#dependency.assertOriginalTermination(),
      observeOriginalFirstScript: async (creation, packet, source): Promise<void> => {
        await this.#current(); need(source === child.owner && creation === child.creation && packet === child.construction, "FIRST_SCRIPT_OWNER");
        if (child.role === "worker") {
          need(this.#contextRouter !== null && this.#pcbSource !== null && this.#origin !== null && creation instanceof CurrentPcb209RatlinePcbCreation, "ORIGIN_OWNER");
          await this.#origin.capture(this.#contextRouter.sourceOwner, this.#pcbSource, creation, packet, source);
        } else { await source.requireOriginalFirstScript(creation, packet); }
        await this.#current();
      },
      request: command => this.#send(child.role, command),
      subscribe: events => {
        need(child.events === null && child.realm === null && child.construction !== null, "CHILD_SUBSCRIPTION");
        const originalParent = parent(); need(originalParent !== null, "CHILD_PARENT"); child.events = events;
        child.realm = this.#routing.claimOriginalChild(originalParent, { event: event => { need(child.events === events, "CHILD_SUBSCRIPTION_CHANGED"); events.event(event); }, lost: (): void => { this.#lost(); } });
        need(child.realm.role === child.role && child.realm.targetId === child.construction.childTargetId && child.realm.sessionId === child.construction.childSessionId, "CHILD_ATTACHMENT");
        return (): void => { need(child.events === events, "CHILD_SUBSCRIPTION_CHANGED"); child.events = null; };
      },
    }); bindCurrentPcb209RatlineContinuationTiming(dependency, child.role);
    const owner = new CurrentPcb209RatlineBootstrapOwner(dependency); child.owner = owner; return owner;
  }
  public async capture(): Promise<CurrentPcb209RatlineContinuationPacket> {
    need(this.#phase === "ready", "CONSUMED"); this.#phase = "pcb-source";
    try {
      this.#pcbRealm = await this.#routing.start({ event: event => {
        if (this.#parentEvents === null) {
          need(this.#phase === "pcb-source" && !this.#parentSubscriptionClaimed && this.#parentBacklog.length < 32, "PARENT_SUBSCRIPTION");
          const captured = captureCurrentPcbStringClockReply(event); this.#parentBacklogBytes += Buffer.byteLength(captured.text);
          need(this.#parentBacklogBytes <= 128 * 1024, "PARENT_BACKLOG_BOUND"); this.#parentBacklog.push(event);
        } else { this.#parentEvents.event(event); }
      }, lost: (): void => { this.#lost(); } }); await this.#current();
      const dependency = Object.freeze<CurrentPcb209RatlinePcbContextDependency>({
        parentSessionId: this.#pcbRealm.sessionId, parentTargetId: this.#pcbRealm.targetId,
        assertOriginalOwner: (): Promise<void> => this.#current(),
        assertOriginalBeforeNavigation: async (): Promise<void> => { await this.#current(); await this.#dependency.assertOriginalBeforeNavigation(); await this.#current(); },
        beginOriginalPcbNavigation: (): Promise<void> => this.#dependency.beginOriginalPcbNavigation(),
        assertOriginalTermination: (): Promise<void> => this.#dependency.assertOriginalTermination(),
        request: command => this.#send("pcb", command), requestParent: command => this.#dependency.requestParent(command),
        subscribe: events => { need(this.#parentEvents === null && !this.#parentSubscriptionClaimed, "PARENT_SUBSCRIPTION");
          this.#parentSubscriptionClaimed = true; this.#parentEvents = events;
          const retained = this.#parentBacklog.splice(0); this.#parentBacklogBytes = 0;
          for (const event of retained) { events.event(event); }
          return (): void => { need(this.#parentEvents === events, "PARENT_SUBSCRIPTION_CHANGED"); this.#parentEvents = null; }; },
      }); bindCurrentPcb209RatlineContinuationTiming(dependency, "pcb");
      const contextRouter = new CurrentPcb209RatlinePcbContextRouter(this.#context, this.#target, dependency); this.#contextRouter = contextRouter;
      this.#origin = new CurrentPcb209RatlineOrigin({ assertOriginalOwner: (): Promise<void> => this.#current(),
        request: (command): Promise<unknown> => this.#send("pcb", command) });
      const subordinate = this.#childOwner(this.#subordinate, () => this.#worker.realm), worker = this.#childOwner(this.#worker, () => this.#pcbRealm);
      await this.#wait(contextRouter.sourceOwner.armBeforeNavigation()); await this.#wait(contextRouter.sourceOwner.startOriginalNavigation());
      const pcbSource = await this.#wait(contextRouter.sourceOwner.whenSourceQualified()); this.#pcbSource = pcbSource; await this.#current();
      const pcbRealm = await contextRouter.sourceOwner.claimOriginalPcbRealm(pcbSource); bindCurrentPcb209RatlineContinuationHandoff(pcbRealm, this.#handoff, "pcb");
      this.#pcb = new CurrentPcb209RatlinePcbStartup({ realm: pcbRealm,
        releaseOriginalPinnedSource: (): Promise<void> => contextRouter.releaseOriginalPinnedSource(pcbSource), childBootstrapOwner: worker });
      this.#phase = "worker-source"; this.#pcbWork = this.#pcb.capture(); void observed(this.#wait(this.#pcbWork));
      const workerSource = await this.#wait(worker.whenSourceQualified()); await this.#current(); await contextRouter.reproveFirstChildHeld(pcbSource);
      this.#handoff.register("worker", worker, workerSource, pcbSource.sessionId, CURRENT_PCB_209_RATLINE_SOURCE_PROFILE.worker.sha256);
      const workerRealm = await worker.claimOriginalWorkerRealm(workerSource); bindCurrentPcb209RatlineContinuationHandoff(workerRealm, this.#handoff, "worker");
      const workerStartup = new CurrentPcb209RatlineWorkerStartup({ realm: workerRealm,
        releaseOriginalPinnedSource: (): Promise<void> => worker.releaseOriginalPinnedSource(workerSource), childBootstrapOwner: subordinate });
      this.#workerStartup = workerStartup;
      this.#phase = "subordinate-source"; this.#workerWork = (async (): Promise<CurrentPcb209RatlineStartupPacket> => {
        const packet = await workerStartup.capture(); await this.#handoff.sealWorker(workerStartup, packet); return packet;
      })(); void observed(this.#wait(this.#workerWork));
      const subordinateSource = await this.#wait(subordinate.whenSourceQualified()); await this.#current();
      this.#handoff.register("subordinate", subordinate, subordinateSource, workerSource.childSessionId, CURRENT_PCB_209_RATLINE_SOURCE_PROFILE.worker.sha256);
      this.#subordinateObserver = new CurrentPcb209RatlineSubordinateContinuation(subordinate, subordinateSource, (): Promise<void> => this.#dependency.assertOriginalTermination());
      const continuation = await this.#wait(this.#subordinateObserver.continue()); await this.#handoff.sealSubordinate(); this.#phase = "callbacks";
      const [pcbPacket, workerPacket] = await this.#wait(Promise.all([this.#pcbWork, this.#workerWork]));
      await this.#pcb.requireOriginal(pcbPacket); await this.#handoff.requireOriginalHistory(); await this.#current();
      const nativeOrigin = this.#origin.summary(), nativeOriginEvidence = this.#origin.evidence(); need(nativeOrigin !== null && nativeOriginEvidence !== null, "ORIGIN_REQUIRED");
      this.#packet = Object.freeze({ profile: "private.pcb209-ratline-fresh-continuation.v1", pcbSource, workerSource, subordinateSource,
        pcb: pcbPacket, worker: workerPacket, subordinate: continuation, nativeOrigin, nativeOriginEvidence, retirements: this.#handoff.evidence(), allThreeOriginalSourcesQualified: true,
        nativeWorkerTargetIdentityVerified: false, callbackReturnCompletionVerified: false, subscribedCanvasPeerOwnershipVerified: false,
        copperCompletionVerified: false, completeStartupVerified: false, completeLiveBaselineVerified: false, executionAuthorized: false, saveAuthorized: false });
      this.#phase = "captured"; return this.#packet;
    } catch (error) {
      this.#lost(error);
      try { await this.abort(); } catch (cleanupError) { throw new AggregateError([error, cleanupError], "PCB209_RATLINE_CONTINUATION_FAILED_CLEANUP", { cause: cleanupError }); }
      throw error;
    }
  }
  public async requireOriginal(packet: CurrentPcb209RatlineContinuationPacket): Promise<void> {
    need(packet === this.#packet && this.#phase === "captured" && this.#pcb !== null && this.#workerStartup !== null && this.#subordinateObserver !== null, "ORIGINAL_PACKET");
    await this.#current(); await this.#pcb.requireOriginal(packet.pcb); await this.#handoff.requireOriginalHistory(); await this.#current();
  }
  public abort(): Promise<void> {
    if (this.#cleanup !== null) { return this.#cleanup; } need(this.#phase !== "released", "RELEASED"); this.#phase = "cleanup";
    this.#cleanup = (async (): Promise<void> => {
      const admission = this.#beginCleanupAdmission(); this.#handoff.abort(); this.#subordinateObserver?.abort(); this.#routing.abort();
      const work = [this.#contextRouter?.abort(), this.#pcb?.abort(), this.#workerStartup?.abort(), this.#worker.owner?.abort(), this.#subordinate.owner?.abort()]
        .filter(value => value !== undefined);
      const results = await Promise.allSettled([admission, ...work]);
      const errors = results.filter(result => result.status === "rejected").map(result => result.reason as unknown);
      if (errors.length > 0) { throw new AggregateError(errors, "PCB209_RATLINE_CONTINUATION_CLEANUP"); }
    })(); return this.#cleanup;
  }
  public async releaseAfterTermination(): Promise<void> {
    need(this.#phase === "cleanup" && !this.#releaseStarted, "RELEASE_STATE");
    await bounded(this.#dependency.assertOriginalTermination());
    need(this.#phase === "cleanup" && !this.#releaseStarted, "RELEASE_STATE"); this.#releaseStarted = true;
    await this.#subordinateObserver?.releaseAfterTermination();
    if (this.#workerWork !== null) { await bounded(observed(this.#workerWork)); } if (this.#pcbWork !== null) { await bounded(observed(this.#pcbWork)); }
    await (this.#workerStartup === null ? this.#subordinate.owner?.releaseAfterTermination() : this.#workerStartup.releaseAfterTermination());
    await (this.#pcb === null ? this.#worker.owner?.releaseAfterTermination() : this.#pcb.releaseAfterTermination());
    await this.#contextRouter?.releaseAfterTermination(); await this.#routing.releaseAfterTermination(); this.#phase = "released";
  }
  public retainedNativeOriginEvidence(): CurrentPcb209RatlineOriginEvidence | null { return this.#origin?.evidence() ?? null; }
  public retainedRejectedStopEvidence(): ReturnType<CurrentPcb209RatlinePcbContextRouter["retainedRejectedStopEvidence"]> { return this.#contextRouter?.retainedRejectedStopEvidence() ?? null; }
  public retainedAncestryEvidence(): ReturnType<CurrentPcb209RatlinePcbContextRouter["retainedAncestryEvidence"]> | null { return this.#contextRouter?.retainedAncestryEvidence() ?? null; }
  public status(): Readonly<Record<string, unknown>> {
    return Object.freeze({ phase: this.#phase, firstFailure: this.#firstFailure === null ? null : currentPcb209RatlineFailureReason(this.#firstFailure),
      transitionStarted: this.#contextRouter?.status()["transitionStarted"] === true,
      releaseStarted: this.#releaseStarted, cleanupAdmitted: this.#cleanupAdmitted, routing: this.#routing.status(), handoff: this.#handoff.status(), pcbSource: this.#contextRouter?.status() ?? null, workerSource: this.#worker.owner?.status() ?? null,
      subordinateSource: this.#subordinate.owner?.status() ?? null, pcb: this.#pcb?.status() ?? null, worker: this.#workerStartup?.status() ?? null,
      subordinate: this.#subordinateObserver?.status() ?? null, nativeWorkerTargetIdentityVerified: false, executionAuthorized: false });
  }
}
