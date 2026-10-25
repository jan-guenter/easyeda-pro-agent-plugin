/** Original native continuation into PCB construction and the first ratline
 * child's held import. The enclosing lifecycle records intent before capture.
 * No worker import continuation, geometry writer or Save is supplied here. */
/* oxlint-disable import/max-dependencies -- This coordinator joins the actual opening, channel, context, SQL reader and fixed source/construction owners. */
import { types } from "node:util";
import { z } from "zod";
import { sha256Json } from "./core.ts";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import type { CurrentDisposableOpenSealedTarget } from "./current-disposable-open.ts";
import { CurrentPcbDiagnosticContext } from "./current-pcb-diagnostic-context.ts";
import { CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION, decodeCurrentPcbDiagnosticPcbOpeningReply } from "./current-pcb-diagnostic-pcb-opening.ts";
import type { CurrentPcbDiagnosticPcbOpeningResult } from "./current-pcb-diagnostic-pcb-opening.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { CurrentPcbWorkerStartupDependency, CurrentPcbWorkerStartupParentCommand } from "./current-pcb-worker-startup-contract.ts";
import { CurrentPcb209WorkerStartupOpening } from "./current-pcb-209-worker-startup-opening.ts";
import type { CurrentPcb209WorkerStartupOpeningResult } from "./current-pcb-209-worker-startup-opening.ts";
import { CurrentPcb209RatlineStartupChannel } from "./current-pcb-209-ratline-startup-channel.ts";
import type { CurrentPcb209RatlineStartupDependency as NativeRouting } from "./current-pcb-209-ratline-startup-channel.ts";
import { CurrentPcb209RatlinePcbContextRouter } from "./current-pcb-209-ratline-pcb-context-router.ts";
import type { CurrentPcb209RatlinePcbContextDependency } from "./current-pcb-209-ratline-pcb-context-router.ts";
import type { CurrentPcb209RatlinePcbBootstrapPacket } from "./current-pcb-209-ratline-pcb-bootstrap-owner.ts";
import { CurrentPcb209RatlineBootstrapOwner } from "./current-pcb-209-ratline-bootstrap-owner.ts";
import type { CurrentPcb209RatlineBootstrapDependency, CurrentPcb209RatlineBootstrapPacket } from "./current-pcb-209-ratline-bootstrap-owner.ts";
import { CurrentPcb209RatlinePcbHeldStartup } from "./current-pcb-209-ratline-startup-session.ts";
import type { CurrentPcb209RatlineHeldStartupPacket } from "./current-pcb-209-ratline-startup-session.ts";
import { CurrentPcb209RatlinePcbCreation } from "./current-pcb-209-ratline-creation-runner.ts";
import type { CurrentPcb209RatlineCreationPacket, CurrentPcb209RatlineWorkerCreation } from "./current-pcb-209-ratline-creation-runner.ts";
import { CurrentPcb209RatlineOrigin } from "./current-pcb-209-ratline-origin.ts";
import type { CurrentPcb209RatlineOriginEvidence, CurrentPcb209RatlineOriginSummary } from "./current-pcb-209-ratline-origin-observation.ts";
import type { CurrentPcb209RatlineStopEvidence } from "./current-pcb-209-ratline-stop-observation.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import { currentPcb209RatlineCompositeDiagnosticsSchema, currentPcb209RatlineFailureReason } from "./current-pcb-209-ratline-diagnostics.ts";
import { CURRENT_PCB_209_RATLINE_NATIVE_PROFILE } from "./current-pcb-209-ratline-budget.ts";
import type { readExactSqlInventory } from "./sqlite-inventory.ts";

type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
type Row = Readonly<Record<string, unknown>>;
type Creation = CurrentPcb209RatlinePcbCreation | CurrentPcb209RatlineWorkerCreation;
type ParentEvents = Parameters<NativeRouting["subscribe"]>[0];
type ChildEvents = Parameters<CurrentPcb209RatlineBootstrapDependency["subscribe"]>[0];
type Phase = "ready" | "preparation" | "pcb-source" | "construction" | "first-child-held" | "failed" | "cleanup" | "released";
const ownerMethods = [CurrentPcb209WorkerStartupOpening.prototype, CurrentPcbDiagnosticContext.prototype,
  CurrentPcb209RatlineStartupChannel.prototype].map(prototype => Object.freeze(Object.fromEntries(Object.getOwnPropertyNames(prototype)
  .filter(key => key !== "constructor").map(key => [key, Object.getOwnPropertyDescriptor(prototype, key)?.value as unknown]))));
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), row = z.record(z.string(), z.unknown());
const attached = z.object({ sessionId: handle, waitingForDebugger: z.literal(true), targetInfo: z.looseObject({
  targetId: handle, type: z.literal("worker"), attached: z.literal(true), title: z.literal("pcb-ratline-worker"),
  url: z.string().regex(/^https:\/\/client\/editor\?entry=pcb-ratline-worker\.js(?:&[^#\\\s]*)?$/u),
}) }).strict();
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`PCB209_RATLINE_NATIVE_SESSION_${code}`); } }
async function boundedOwner(work: Promise<void>): Promise<void> {
  const deadline = Promise.withResolvers<never>(), timer = setTimeout(() => {
    deadline.reject(new Error("PCB209_RATLINE_NATIVE_SESSION_OWNER_DEADLINE"));
  }, CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.elapsed.ordinaryRequestMilliseconds);
  try { await Promise.race([work, deadline.promise]); } finally { clearTimeout(timer); }
}
async function observe(work: Promise<unknown>): Promise<void> { try { await work; } catch {
  // The original operation and failure race retain rejection.
} }
export interface CurrentPcb209RatlineNativePacket {
  readonly profile: "private.pcb209-ratline-native-held-import.v1";
  readonly targetSha256: string;
  readonly originalProjectConstructionSha256: string;
  readonly pcbSource: CurrentPcb209RatlinePcbBootstrapPacket;
  readonly childSource: CurrentPcb209RatlineBootstrapPacket;
  readonly nativeOrigin: CurrentPcb209RatlineOriginSummary;
  readonly nativeOriginEvidence: CurrentPcb209RatlineOriginEvidence;
  readonly originalFrameProofSets: 3;
  readonly pcbNavigationAcknowledged: boolean;
  readonly firstChildImportHeld: true;
  readonly nativeWorkerTargetIdentityVerified: false;
  readonly completeStartupVerified: false;
  readonly completeLiveBaselineVerified: false;
  readonly executionAuthorized: false;
  readonly saveAuthorized: false;
}

export class CurrentPcb209RatlineNativeSession {
  readonly #opening: CurrentPcb209WorkerStartupOpening;
  readonly #result: CurrentPcb209WorkerStartupOpeningResult;
  readonly #dependency: CurrentPcbWorkerStartupDependency;
  readonly #request: CurrentPcbWorkerStartupDependency["request"];
  readonly #channel: CurrentPcb209RatlineStartupChannel;
  readonly #context: CurrentPcbDiagnosticContext;
  readonly #target: CurrentDisposableOpenSealedTarget;
  readonly #reverify: () => Promise<Inventory>;
  #phase: Phase = "ready";
  #step = "idle";
  #firstFailure: Readonly<{ reason: string; phase: Phase; step: string }> | null = null;
  #before: Inventory | null = null;
  #completion: ReturnType<typeof readerCompletion> | null = null;
  #routing: NativeRouting | null = null;
  #router: CurrentPcb209RatlinePcbContextRouter | null = null;
  #child: CurrentPcb209RatlineBootstrapOwner | null = null;
  #origin: CurrentPcb209RatlineOrigin | null = null;
  #pcbSource: CurrentPcb209RatlinePcbBootstrapPacket | null = null;
  #composite: CurrentPcb209RatlinePcbHeldStartup | null = null;
  #compositePacket: CurrentPcb209RatlineHeldStartupPacket | null = null;
  #compositeWork: Promise<unknown> | null = null;
  #navigation: Promise<void> | null = null;
  #openingObservation: CurrentPcbDiagnosticPcbOpeningResult | null = null;
  #attachment: Readonly<{ sessionId: string; targetId: string }> | null = null;
  #creation: Creation | null = null;
  #construction: CurrentPcb209RatlineCreationPacket | null = null;
  #parentEvents: ParentEvents | null = null;
  #childEvents: ChildEvents | null = null;
  #unsubscribe: (() => void) | null = null;
  #cleanup: Promise<void> | null = null;
  #packet: CurrentPcb209RatlineNativePacket | null = null;
  public constructor(opening: CurrentPcb209WorkerStartupOpening, result: CurrentPcb209WorkerStartupOpeningResult,
    dependency: CurrentPcbWorkerStartupDependency, channel: CurrentPcb209RatlineStartupChannel,
    context: CurrentPcbDiagnosticContext, target: CurrentDisposableOpenSealedTarget, reverifyCheckpoint: () => Promise<Inventory>) {
    need(!types.isProxy(opening) && Object.getPrototypeOf(opening) === CurrentPcb209WorkerStartupOpening.prototype &&
      !types.isProxy(context) && Object.getPrototypeOf(context) === CurrentPcbDiagnosticContext.prototype &&
      !types.isProxy(channel) && Object.getPrototypeOf(channel) === CurrentPcb209RatlineStartupChannel.prototype &&
      typeof reverifyCheckpoint === "function" && dependency !== null && typeof dependency === "object" &&
      !types.isProxy(dependency) && Object.isFrozen(dependency) && Object.getPrototypeOf(dependency) === Object.prototype, "ORIGINAL_OWNERS");
    const request = Object.getOwnPropertyDescriptor(dependency, "request");
    need(request !== undefined && Object.hasOwn(request, "value") && typeof request.value === "function", "ORIGINAL_REQUEST");
    this.#opening = opening; this.#result = result; this.#dependency = dependency; this.#request = dependency.request;
    this.#channel = channel; this.#context = context; this.#reverify = reverifyCheckpoint;
    this.#target = Object.freeze(currentDisposableOpenSealedTargetSchema.parse(captureCurrentPcbStringClockReply(target).value));
  }
  public status(): Readonly<{ phase: Phase; transitionStarted: boolean; openingAcknowledged: boolean; packetRetained: boolean; executionAuthorized: false;
    nativeOrigin: CurrentPcb209RatlineOriginSummary | null; step: string;
    firstFailure: Readonly<{ reason: string; phase: Phase; step: string }> | null;
    pcbContext: ReturnType<CurrentPcb209RatlinePcbContextRouter["status"]> | null;
    childSource: ReturnType<CurrentPcb209RatlineBootstrapOwner["status"]> | null;
    composite: ReturnType<CurrentPcb209RatlinePcbHeldStartup["status"]> | null }> {
    return Object.freeze({ phase: this.#phase, transitionStarted: this.#router?.status()["transitionStarted"] === true,
      openingAcknowledged: this.#openingObservation?.phase === "open-document", packetRetained: this.#packet !== null, executionAuthorized: false,
      nativeOrigin: this.#origin?.summary() ?? null, step: this.#step, firstFailure: this.#firstFailure,
      pcbContext: this.#router?.status() ?? null, childSource: this.#child?.status() ?? null, composite: this.#composite === null ? null : currentPcb209RatlineCompositeDiagnosticsSchema.parse(this.#composite.status()) });
  }
  public retainedNativeOriginEvidence(): CurrentPcb209RatlineOriginEvidence | null { return this.#origin?.evidence() ?? null; }
  public retainedRejectedStopEvidence(): CurrentPcb209RatlineStopEvidence | null { return this.#router?.retainedRejectedStopEvidence() ?? null; }
  public retainedOpeningObservation(): CurrentPcbDiagnosticPcbOpeningResult | null { return this.#openingObservation; }
  #same(): void {
    need(this.#phase !== "failed" && this.#phase !== "cleanup" && this.#phase !== "released" && this.#dependency.request === this.#request, "NOT_CURRENT");
    this.#methodsCurrent();
    need(this.#before === null || readerCompletion(this.#before) === this.#completion, "ORIGINAL_SQL_READER_CHANGED");
    this.#context.assertCurrent(); this.#router?.assertCurrent();
  }
  #methodsCurrent(): void {
    const owners = [this.#opening, this.#context, this.#channel];
    const prototypes = [CurrentPcb209WorkerStartupOpening.prototype, CurrentPcbDiagnosticContext.prototype, CurrentPcb209RatlineStartupChannel.prototype];
    for (const [index, owner] of owners.entries()) {
      need(!types.isProxy(owner) && Object.getPrototypeOf(owner) === prototypes[index], "ORIGINAL_OWNER_CHANGED");
      for (const [key, method] of Object.entries(ownerMethods[index] ?? {})) {
        need(!Object.hasOwn(owner, key) && Object.getOwnPropertyDescriptor(prototypes[index], key)?.value === method, "ORIGINAL_METHOD_CHANGED");
      }
    }
  }
  async #current(): Promise<void> { this.#same(); await boundedOwner(this.#dependency.assertOriginalOwner()); this.#same(); }
  async #send(command: CurrentPcbWorkerStartupParentCommand): Promise<Row> {
    await this.#current(); const value = row.parse(captureCurrentPcbStringClockReply(await this.#request.call(this.#dependency, command)).value);
    await this.#current(); return value;
  }
  async #parent(): Promise<void> {
    const targets = await this.#send({ method: "Target.getTargets", params: {} });
    const frames = await this.#send({ method: "Page.getFrameTree", sessionId: this.#dependency.parentSessionId, params: {} });
    this.#context.observeTarget(targets); this.#context.observeFrames(frames);
  }
  async #ancillary(): Promise<void> {
    const frameId = this.#context.openingAncillaryFrame(); if (frameId === null) { return; }
    const sessionId = this.#dependency.parentSessionId;
    const owner = await this.#send({ method: "DOM.getFrameOwner", sessionId, params: { frameId } });
    const backendNodeId = z.number().int().positive().max(2_147_483_647).parse(owner["backendNodeId"]);
    const node = await this.#send({ method: "DOM.describeNode", sessionId, params: { backendNodeId, depth: 0, pierce: false } });
    need(this.#context.openingAncillaryFrame() === frameId, "ANCILLARY_CHANGED"); this.#context.observeOpeningAncillaryOwner(owner, node);
  }
  #openingCommand(phase: "preflight" | "open-document"): CurrentPcbWorkerStartupParentCommand {
    const context = phase === "preflight" ? this.#context.openingContext() : this.#context.pcbOpeningContext();
    return { method: "Runtime.callFunctionOn", sessionId: context.sessionId, params: {
      functionDeclaration: CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION, uniqueContextId: context.uniqueContextId,
      arguments: [{ value: this.#target }, { value: phase }], returnByValue: true, awaitPromise: true,
      silent: true, generatePreview: false, userGesture: false, throwOnSideEffect: false } };
  }
  #navigate(routing: NativeRouting): Promise<void> {
    need(this.#navigation === null && this.#routing === routing, "NAVIGATION_CONSUMED");
    this.#navigation = (async (): Promise<void> => {
      const raw = await routing.requestParent(this.#openingCommand("open-document"));
      const reply = decodeCurrentPcbDiagnosticPcbOpeningReply(raw, this.#target, "open-document"); this.#openingObservation = reply;
      need(reply.ok && reply.windowTabId === this.#result.workerIdentity.windowTabId, "OPENING_REFUSED");
      this.#same();
    })(); void observe(this.#navigation); return this.#navigation;
  }
  #lost(error: unknown = new Error("PCB209_RATLINE_NATIVE_SESSION_STREAM_LOST")): void {
    this.#firstFailure ??= Object.freeze({ reason: currentPcb209RatlineFailureReason(error), phase: this.#phase, step: this.#step });
    if (this.#phase !== "released") { this.#phase = "failed"; } this.#parentEvents?.lost(); this.#childEvents?.lost();
  }
  async #observeComposite(work: Promise<unknown>): Promise<void> {
    try { await work; } catch (error) { this.#lost(error); }
  }
  #subscribeParent(events: ParentEvents, routing: NativeRouting): () => void {
    need(this.#parentEvents === null && this.#unsubscribe === null, "PARENT_SUBSCRIBER"); this.#parentEvents = events;
    this.#unsubscribe = routing.subscribe({ lost: (): void => { this.#lost(); }, event: event => {
      try {
        if (event.sessionId === routing.parentSessionId) {
          if (event.method === "Target.attachedToTarget") {
            const value = attached.parse(event.params); need(this.#attachment === null, "DUPLICATE_CHILD");
            this.#attachment = Object.freeze({ sessionId: value.sessionId, targetId: value.targetInfo.targetId });
          }
          need(this.#parentEvents !== null, "PARENT_SUBSCRIBER"); this.#parentEvents.event(event);
        } else {
          need(this.#attachment?.sessionId === event.sessionId && this.#childEvents !== null, "CHILD_EVENT_OWNER"); this.#childEvents.event(event);
        }
      } catch (error) { this.#lost(error); }
    } });
    return (): void => { need(this.#parentEvents === events, "PARENT_SUBSCRIBER_CHANGED"); this.#parentEvents = null; };
  }
  #childOwner(routing: NativeRouting): CurrentPcb209RatlineBootstrapOwner {
    return new CurrentPcb209RatlineBootstrapOwner(Object.freeze<CurrentPcb209RatlineBootstrapDependency>({
      assertOriginalChild: async (creation: Creation, packet: CurrentPcb209RatlineCreationPacket): Promise<void> => {
        this.#same(); await creation.requireOriginal(packet); await this.#current();
        need(this.#attachment?.sessionId === packet.childSessionId && this.#attachment.targetId === packet.childTargetId, "CHILD_ATTACHMENT");
        if (this.#creation === null) { this.#creation = creation; this.#construction = packet; }
        need(this.#creation === creation && this.#construction === packet, "CHILD_CONSTRUCTION");
      },
      assertOriginalTermination: (): Promise<void> => routing.assertOriginalTermination(),
      observeOriginalFirstScript: async (creation, packet, owner): Promise<void> => {
        await this.#current(); need(this.#router !== null && this.#origin !== null && this.#pcbSource !== null && owner === this.#child &&
          creation instanceof CurrentPcb209RatlinePcbCreation, "ORIGIN_OWNERS");
        await this.#origin.capture(this.#router.sourceOwner, this.#pcbSource, creation, packet, owner); await this.#current();
      },
      request: command => routing.request("worker", command),
      subscribe: (events: ChildEvents): (() => void) => {
        need(this.#childEvents === null && this.#construction !== null, "CHILD_SUBSCRIBER"); this.#childEvents = events;
        return (): void => { need(this.#childEvents === events, "CHILD_SUBSCRIBER_CHANGED"); this.#childEvents = null; };
      },
    }));
  }
  public async captureFirstChildHeld(): Promise<CurrentPcb209RatlineNativePacket> {
    need(this.#phase === "ready", "CONSUMED"); this.#phase = "preparation";
    try {
      this.#step = "original-opening"; this.#channel.beginPcbPreparation();
      await this.#opening.requireOriginalPcbDependency(this.#result, this.#dependency, this.#target); await this.#current();
      this.#step = "parent-snapshot"; await this.#parent();
      this.#step = "pcb-preflight";
      const preflight = decodeCurrentPcbDiagnosticPcbOpeningReply(await this.#send(this.#openingCommand("preflight")), this.#target, "preflight");
      need(preflight.ok && preflight.windowTabId === this.#result.workerIdentity.windowTabId, "PREFLIGHT");
      this.#step = "checkpoint-reverification"; const before = await this.#reverify(), completion = readerCompletion(before);
      need(completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null, "ORIGINAL_SQL_READER");
      this.#before = before; this.#completion = completion; this.#step = "parent-reproof"; await this.#current(); await this.#parent(); await this.#ancillary();
      this.#step = "claim-routing";
      const routing = await this.#channel.claimRatlineRouting(); this.#routing = routing;
      const router = new CurrentPcb209RatlinePcbContextRouter(this.#context, this.#target, Object.freeze<CurrentPcb209RatlinePcbContextDependency>({
        parentSessionId: routing.parentSessionId, parentTargetId: routing.parentTargetId,
        assertOriginalOwner: (): Promise<void> => routing.assertOriginalOwner(),
        assertOriginalBeforeNavigation: async (): Promise<void> => { await this.#current(); need(this.#navigation === null && this.#before === before, "BEFORE_NAVIGATION"); },
        beginOriginalPcbNavigation: (): Promise<void> => this.#navigate(routing),
        assertOriginalTermination: (): Promise<void> => routing.assertOriginalTermination(),
        request: command => routing.request("pcb", command),
        requestParent: command => routing.requestParent(command),
        subscribe: events => this.#subscribeParent(events, routing),
      })); this.#router = router;
      this.#origin = new CurrentPcb209RatlineOrigin({ assertOriginalOwner: (): Promise<void> => this.#current(),
        request: (command): Promise<unknown> => routing.request("pcb", command) });
      const child = this.#childOwner(routing); this.#child = child; this.#phase = "pcb-source";
      this.#step = "pcb-source-arming"; await router.sourceOwner.armBeforeNavigation();
      this.#step = "pcb-navigation"; await router.sourceOwner.startOriginalNavigation(); this.#step = "pcb-source-qualification";
      const pcbSource = await router.sourceOwner.whenSourceQualified(); this.#pcbSource = pcbSource; await this.#current(); this.#phase = "construction";
      this.#step = "pcb-construction"; const composite = new CurrentPcb209RatlinePcbHeldStartup({ realm: await router.sourceOwner.claimOriginalPcbRealm(pcbSource),
        releaseOriginalPinnedSource: (): Promise<void> => router.releaseOriginalPinnedSource(pcbSource), childBootstrapOwner: child });
      this.#composite = composite; const work = composite.capture(); this.#compositeWork = work; void this.#observeComposite(work);
      /* Both branches must settle. The PCB prefix owns no wait for callbacks
       * that require the deliberately held child import to continue. */
      this.#step = "child-and-prefix-qualification";
      const [childSource, compositePacket] = await Promise.all([child.whenSourceQualified(), work]); this.#compositePacket = compositePacket;
      this.#step = "held-child-reproof";
      await composite.requireOriginal(compositePacket);
      await router.reproveFirstChildHeld(pcbSource);
      await this.#opening.requireOriginalPcbDependency(this.#result, this.#dependency, this.#target); await child.requireOriginal(childSource); await this.#current();
      const nativeOrigin = this.#origin.summary(), nativeOriginEvidence = this.#origin.evidence();
      need(nativeOrigin !== null && nativeOriginEvidence !== null, "ORIGIN_OBSERVATION_REQUIRED");
      this.#packet = Object.freeze({ profile: "private.pcb209-ratline-native-held-import.v1", targetSha256: sha256Json(this.#target),
        originalProjectConstructionSha256: sha256Json(this.#result.construction), pcbSource, childSource, nativeOrigin, nativeOriginEvidence, originalFrameProofSets: 3,
        pcbNavigationAcknowledged: this.#openingObservation?.phase === "open-document", firstChildImportHeld: true,
        nativeWorkerTargetIdentityVerified: false, completeStartupVerified: false, completeLiveBaselineVerified: false,
        executionAuthorized: false, saveAuthorized: false }); this.#phase = "first-child-held"; return this.#packet;
    } catch (error) {
      this.#firstFailure ??= Object.freeze({ reason: currentPcb209RatlineFailureReason(error), phase: this.#phase, step: this.#step });
      this.#phase = "failed";
      try { await this.abort(); } catch (cleanupError) {
        throw new AggregateError([error, cleanupError], "PCB209_RATLINE_NATIVE_SESSION_FAILED_CLEANUP", { cause: cleanupError });
      }
      throw error;
    }
  }
  public async requireOriginal(packet: CurrentPcb209RatlineNativePacket): Promise<void> {
    need(packet === this.#packet && this.#phase === "first-child-held" && this.#child !== null && this.#composite !== null && this.#compositePacket !== null, "ORIGINAL_PACKET");
    await this.#current(); await this.#composite.requireOriginal(this.#compositePacket); await this.#current();
    await this.#child.requireOriginal(packet.childSource); await this.#current();
  }
  public abort(): Promise<void> {
    if (this.#cleanup !== null) { return this.#cleanup; }
    need(this.#phase !== "released", "ABORT_STATE"); this.#methodsCurrent(); this.#phase = "cleanup";
    this.#cleanup = (async (): Promise<void> => {
      await this.#channel.beginCleanup();
      const work = [this.#router?.abort(), this.#composite?.abort(), this.#child?.abort()].filter(value => value !== undefined);
      const results = await Promise.allSettled(work); const errors = results.filter(result => result.status === "rejected").map(result => result.reason as unknown);
      if (errors.length > 0) { throw new AggregateError(errors, "PCB209_RATLINE_NATIVE_SESSION_CLEANUP"); }
    })(); return this.#cleanup;
  }
  public async releaseAfterTermination(): Promise<void> {
    need(this.#phase === "cleanup" || this.#phase === "failed", "RELEASE_STATE");
    this.#methodsCurrent();
    await this.#dependency.assertOriginalTermination();
    if (this.#composite !== null) {
      if (this.#compositeWork !== null) { await observe(this.#compositeWork); }
      await this.#composite.releaseAfterTermination();
    }
    else if (this.#child !== null) { await this.#child.releaseAfterTermination(); }
    await this.#router?.releaseAfterTermination(); this.#unsubscribe?.(); this.#phase = "released";
  }
}
