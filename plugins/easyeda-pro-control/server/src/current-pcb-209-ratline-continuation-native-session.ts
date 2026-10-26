/* oxlint-disable import/max-dependencies -- Native preparation retains original opening, SQL checkpoint, context and the separately launch-sealed continuation channel. */
import { types } from "node:util";
import { z } from "zod";
import { sha256Json } from "./core.ts";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import type { CurrentDisposableOpenSealedTarget } from "./current-disposable-open.ts";
import { CurrentPcbDiagnosticContext } from "./current-pcb-diagnostic-context.ts";
import { decodeCurrentPcbDiagnosticPcbOpeningReply } from "./current-pcb-diagnostic-pcb-opening.ts";
import { CURRENT_PCB_209_RATLINE_OPENING_FUNCTION, currentPcb209RatlineOpeningAcknowledged } from "./current-pcb-209-ratline-opening-program.ts";
import type { CurrentPcbDiagnosticPcbOpeningResult } from "./current-pcb-diagnostic-pcb-opening.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { CurrentPcbWorkerStartupDependency, CurrentPcbWorkerStartupParentCommand } from "./current-pcb-worker-startup-contract.ts";
import { CurrentPcb209WorkerStartupOpening } from "./current-pcb-209-worker-startup-opening.ts";
import type { CurrentPcb209WorkerStartupOpeningResult } from "./current-pcb-209-worker-startup-opening.ts";
import { CurrentPcb209RatlineContinuationChannel } from "./current-pcb-209-ratline-continuation-channel.ts";
import { CurrentPcb209RatlineContinuationSession } from "./current-pcb-209-ratline-continuation-session.ts";
import type { CurrentPcb209RatlineContinuationDependency, CurrentPcb209RatlineContinuationPacket } from "./current-pcb-209-ratline-continuation-session.ts";
import { readerCompletion } from "./sqlite-inventory.ts";
import type { readExactSqlInventory } from "./sqlite-inventory.ts";
import { currentPcb209RatlineContinuationMatchesTarget } from "./current-pcb-209-ratline-continuation-semantics.ts";

type Inventory = Awaited<ReturnType<typeof readExactSqlInventory>>;
type Phase = "ready" | "preparation" | "continuation" | "captured" | "failed" | "cleanup" | "released";
type Routing = Awaited<ReturnType<CurrentPcb209RatlineContinuationChannel["claimRatlineRouting"]>>;
export interface CurrentPcb209RatlineContinuationNativePacket {
  readonly profile: "private.pcb209-ratline-native-continuation.v1";
  readonly targetSha256: string;
  readonly originalProjectConstructionSha256: string;
  readonly continuation: CurrentPcb209RatlineContinuationPacket;
  readonly pcbNavigationAcknowledged: boolean;
  readonly nativeWorkerTargetIdentityVerified: false;
  readonly callbackReturnCompletionVerified: false;
  readonly completeStartupVerified: false;
  readonly completeLiveBaselineVerified: false;
  readonly executionAuthorized: false;
  readonly saveAuthorized: false;
}
const prototypes = [CurrentPcb209WorkerStartupOpening.prototype, CurrentPcbDiagnosticContext.prototype, CurrentPcb209RatlineContinuationChannel.prototype] as const;
const methods = prototypes.map(prototype => Object.freeze(Object.fromEntries(Object.getOwnPropertyNames(prototype).filter(key => key !== "constructor")
  .map(key => [key, Object.getOwnPropertyDescriptor(prototype, key)?.value as unknown]))));
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`PCB209_RATLINE_CONTINUATION_NATIVE_${code}`); } }
async function bounded<T>(work: Promise<T>): Promise<T> {
  const expired = Promise.withResolvers<never>(), timer = setTimeout(() => { expired.reject(new Error("PCB209_RATLINE_CONTINUATION_NATIVE_DEADLINE")); }, 2500);
  try { return await Promise.race([work, expired.promise]); } finally { clearTimeout(timer); }
}
async function observed(work: Promise<unknown>): Promise<void> { try { await work; } catch {
  // Original capture and retained navigation own the failure.
} }
export class CurrentPcb209RatlineContinuationNativeSession {
  readonly #opening: CurrentPcb209WorkerStartupOpening;
  readonly #result: CurrentPcb209WorkerStartupOpeningResult;
  readonly #dependency: CurrentPcbWorkerStartupDependency;
  readonly #channel: CurrentPcb209RatlineContinuationChannel;
  readonly #context: CurrentPcbDiagnosticContext;
  readonly #target: CurrentDisposableOpenSealedTarget;
  readonly #reverify: () => Promise<Inventory>;
  readonly #request: CurrentPcbWorkerStartupDependency["request"];
  #phase: Phase = "ready";
  #before: Inventory | null = null;
  #completion: ReturnType<typeof readerCompletion> | null = null;
  #navigation: Promise<void> | null = null;
  #openingObservation: CurrentPcbDiagnosticPcbOpeningResult | null = null;
  #session: CurrentPcb209RatlineContinuationSession | null = null;
  #work: Promise<CurrentPcb209RatlineContinuationPacket> | null = null;
  #packet: CurrentPcb209RatlineContinuationNativePacket | null = null;
  #cleanup: Promise<void> | null = null;
  public constructor(opening: CurrentPcb209WorkerStartupOpening, result: CurrentPcb209WorkerStartupOpeningResult,
    dependency: CurrentPcbWorkerStartupDependency, channel: CurrentPcb209RatlineContinuationChannel,
    context: CurrentPcbDiagnosticContext, target: CurrentDisposableOpenSealedTarget, reverifyCheckpoint: () => Promise<Inventory>) {
    need(dependency !== null && typeof dependency === "object" && !types.isProxy(dependency) && Object.isFrozen(dependency) &&
      Object.getPrototypeOf(dependency) === Object.prototype && typeof reverifyCheckpoint === "function", "DEPENDENCY");
    const request = Object.getOwnPropertyDescriptor(dependency, "request");
    need(request !== undefined && Object.hasOwn(request, "value") && typeof request.value === "function", "ORIGINAL_REQUEST");
    this.#opening = opening; this.#result = result; this.#dependency = dependency; this.#request = dependency.request;
    this.#channel = channel; this.#context = context; this.#reverify = reverifyCheckpoint;
    this.#target = Object.freeze(currentDisposableOpenSealedTargetSchema.parse(captureCurrentPcbStringClockReply(target).value)); this.#methods();
  }
  #methods(): void {
    for (const [index, owner] of [this.#opening, this.#context, this.#channel].entries()) {
      need(!types.isProxy(owner) && Object.getPrototypeOf(owner) === prototypes[index], "ORIGINAL_OWNER");
      for (const [key, method] of Object.entries(methods[index] ?? {})) {
        need(!Object.hasOwn(owner, key) && Object.getOwnPropertyDescriptor(prototypes[index], key)?.value === method, "ORIGINAL_METHOD");
      }
    }
  }
  #same(): void {
    this.#methods(); need(this.#dependency.request === this.#request && this.#phase !== "failed" && this.#phase !== "cleanup" && this.#phase !== "released", "NOT_CURRENT");
    need(this.#before === null || readerCompletion(this.#before) === this.#completion, "ORIGINAL_SQL_READER"); this.#context.assertCurrent();
  }
  async #current(): Promise<void> { this.#same(); await bounded(this.#dependency.assertOriginalOwner()); this.#same(); }
  async #send(command: CurrentPcbWorkerStartupParentCommand): Promise<Record<string, unknown>> {
    await this.#current(); const raw = await this.#request.call(this.#dependency, command); await this.#current();
    return z.record(z.string(), z.unknown()).parse(captureCurrentPcbStringClockReply(raw).value);
  }
  async #parent(): Promise<void> {
    const targets = await this.#send({ method: "Target.getTargets", params: {} });
    const frames = await this.#send({ method: "Page.getFrameTree", sessionId: this.#dependency.parentSessionId, params: {} });
    this.#context.observeTarget(targets); this.#context.observeFrames(frames);
  }
  #openingCommand(phase: "preflight" | "open-document"): CurrentPcbWorkerStartupParentCommand {
    const context = phase === "preflight" ? this.#context.openingContext() : this.#context.pcbOpeningContext();
    return { method: "Runtime.callFunctionOn", sessionId: context.sessionId, params: { functionDeclaration: CURRENT_PCB_209_RATLINE_OPENING_FUNCTION,
      uniqueContextId: context.uniqueContextId, arguments: [{ value: this.#target }, { value: phase }], returnByValue: true, awaitPromise: true,
      silent: true, generatePreview: false, userGesture: false, throwOnSideEffect: false } };
  }
  #navigate(routing: Routing): Promise<void> {
    need(this.#navigation === null, "NAVIGATION_CONSUMED");
    this.#navigation = (async (): Promise<void> => {
      const raw = await routing.requestParent(this.#openingCommand("open-document"));
      const value = decodeCurrentPcbDiagnosticPcbOpeningReply(raw, this.#target, "open-document"); this.#openingObservation = value;
      need(value.ok && value.windowTabId === this.#result.workerIdentity.windowTabId, "OPENING_REFUSED"); this.#same();
    })(); void observed(this.#navigation); return this.#navigation;
  }
  public async captureContinuation(): Promise<CurrentPcb209RatlineContinuationNativePacket> {
    need(this.#phase === "ready", "CONSUMED"); this.#phase = "preparation";
    try {
      this.#channel.beginPcbPreparation(); await this.#opening.requireOriginalPcbDependency(this.#result, this.#dependency, this.#target); await this.#current();
      await this.#parent(); const preflight = decodeCurrentPcbDiagnosticPcbOpeningReply(await this.#send(this.#openingCommand("preflight")), this.#target, "preflight");
      need(preflight.ok && preflight.windowTabId === this.#result.workerIdentity.windowTabId, "PREFLIGHT");
      const before = await this.#reverify(), completion = readerCompletion(before);
      need(completion.observedChildClose && completion.exitCode === 0 && completion.exitSignal === null, "ORIGINAL_SQL_READER");
      this.#before = before; this.#completion = completion; await this.#current(); await this.#parent();
      const frameId = this.#context.openingAncillaryFrame();
      if (frameId !== null) {
        const sessionId = this.#dependency.parentSessionId;
        const owner = await this.#send({ method: "DOM.getFrameOwner", sessionId, params: { frameId } });
        const backendNodeId = z.number().int().positive().max(2_147_483_647).parse(owner["backendNodeId"]);
        const node = await this.#send({ method: "DOM.describeNode", sessionId, params: { backendNodeId, depth: 0, pierce: false } });
        need(this.#context.openingAncillaryFrame() === frameId, "ANCILLARY_CHANGED"); this.#context.observeOpeningAncillaryOwner(owner, node);
      }
      const routing = await this.#channel.claimRatlineRouting();
      this.#session = new CurrentPcb209RatlineContinuationSession(this.#context, this.#target, Object.freeze<CurrentPcb209RatlineContinuationDependency>({
        requireOriginalParent: (): ReturnType<Routing["requireOriginalParent"]> => routing.requireOriginalParent(),
        assertOriginalTermination: (): Promise<void> => routing.assertOriginalTermination(), subscribe: events => routing.subscribe(events),
        assertOriginalBeforeNavigation: async (): Promise<void> => { await this.#current(); need(this.#navigation === null && this.#before === before, "BEFORE_NAVIGATION"); },
        beginOriginalPcbNavigation: (): Promise<void> => this.#navigate(routing),
        request: (role, command): Promise<unknown> => routing.request(role, command), requestParent: command => routing.requestParent(command),
        beginCleanup: (): Promise<void> => this.#channel.beginCleanup(),
        retireOriginalRealm: (role, sessionId): void => { routing.retireOriginalRealm(role, sessionId); },
      })); this.#phase = "continuation"; this.#work = this.#session.capture(); void observed(this.#work);
      const continuation = await this.#work; await this.#session.requireOriginal(continuation); await this.#current();
      need(currentPcb209RatlineContinuationMatchesTarget(continuation.pcb.capture, continuation.worker.capture,
        this.#target, this.#result.workerIdentity.windowTabId), "SEMANTIC_TARGET");
      this.#channel.beginOriginalProjectIdentityReproof();
      await this.#opening.requireOriginalPcbDependency(this.#result, this.#dependency, this.#target); await this.#current();
      this.#packet = Object.freeze({ profile: "private.pcb209-ratline-native-continuation.v1", targetSha256: sha256Json(this.#target),
        originalProjectConstructionSha256: sha256Json(this.#result.construction), continuation, pcbNavigationAcknowledged: currentPcb209RatlineOpeningAcknowledged(this.#openingObservation),
        nativeWorkerTargetIdentityVerified: false, callbackReturnCompletionVerified: false, completeStartupVerified: false,
        completeLiveBaselineVerified: false, executionAuthorized: false, saveAuthorized: false }); this.#phase = "captured"; return this.#packet;
    } catch (error) { this.#phase = "failed";
      try { await this.abort(); } catch (cleanupError) { throw new AggregateError([error, cleanupError], "PCB209_RATLINE_CONTINUATION_NATIVE_FAILED_CLEANUP", { cause: cleanupError }); }
      throw error;
    }
  }
  public async requireOriginal(packet: CurrentPcb209RatlineContinuationNativePacket): Promise<void> {
    need(this.#packet !== null && this.#packet === packet && this.#phase === "captured" && this.#session !== null, "ORIGINAL_PACKET");
    await this.#current(); await this.#session.requireOriginal(packet.continuation); await this.#current();
  }
  public abort(): Promise<void> {
    if (this.#cleanup !== null) { return this.#cleanup; } need(this.#phase !== "released", "RELEASED"); this.#phase = "cleanup";
    this.#cleanup = this.#session === null ? this.#channel.beginCleanup() : this.#session.abort(); return this.#cleanup;
  }
  public async releaseAfterTermination(): Promise<void> {
    need(this.#phase === "cleanup", "RELEASE_STATE"); this.#methods(); await bounded(this.#dependency.assertOriginalTermination());
    if (this.#work !== null) { await bounded(observed(this.#work)); } await this.#session?.releaseAfterTermination(); this.#phase = "released";
  }
  public retainedOpeningObservation(): CurrentPcbDiagnosticPcbOpeningResult | null { return this.#openingObservation; }
  public retainedNativeOriginEvidence(): ReturnType<CurrentPcb209RatlineContinuationSession["retainedNativeOriginEvidence"]> { return this.#session?.retainedNativeOriginEvidence() ?? null; }
  public retainedRejectedStopEvidence(): ReturnType<CurrentPcb209RatlineContinuationSession["retainedRejectedStopEvidence"]> { return this.#session?.retainedRejectedStopEvidence() ?? null; }
  public retainedAncestryEvidence(): ReturnType<CurrentPcb209RatlineContinuationSession["retainedAncestryEvidence"]> { return this.#session?.retainedAncestryEvidence() ?? null; }
  public status(): Readonly<Record<string, unknown>> { return Object.freeze({ phase: this.#phase,
    transitionStarted: this.#session?.status()["transitionStarted"] === true, openingAcknowledged: currentPcb209RatlineOpeningAcknowledged(this.#openingObservation),
    packetRetained: this.#packet !== null, continuation: this.#session?.status() ?? null, executionAuthorized: false }); }
}
