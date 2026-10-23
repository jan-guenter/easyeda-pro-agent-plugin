/** Private original-owner choreography. The lifecycle must publish the sealed
 * checkpoint intent before calling open(). This module supplies no journal,
 * owner adoption, public writer or saved-state authority. */
import { types } from "node:util";
import { z } from "zod";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import type { CurrentDisposableOpenSealedTarget } from "./current-disposable-open.ts";
import type { CurrentPcbWorkerStartupHandoff, CurrentPcbWorkerStartupOpeningBinding } from "./current-pcb-diagnostic-owner.ts";
import { CURRENT_PCB_DIAGNOSTIC_OPENING_FUNCTION, decodeCurrentPcbDiagnosticOpeningReply } from "./current-pcb-diagnostic-opening.ts";
import type { CurrentPcbDiagnosticOpeningPhase, CurrentPcbDiagnosticOpeningResult } from "./current-pcb-diagnostic-opening.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { CurrentPcbWorkerConstructionPacket, CurrentPcbWorkerConstructionProjectIdentity } from "./current-pcb-worker-construction-runner.ts";
import type { CurrentPcbWorkerStartupCommand, CurrentPcbWorkerStartupDependency } from "./current-pcb-worker-startup-contract.ts";
import { CurrentPcbWorkerStartupTransport } from "./current-pcb-worker-startup-transport.ts";

type Row = Record<string, unknown>;
const recordSchema = z.record(z.string(), z.unknown());
const contextSchema = z.object({ sessionId: z.string().min(1).max(128).regex(/^[A-Za-z\d_.:-]+$/u),
  uniqueContextId: z.string().min(1).max(128).regex(/^[A-Za-z\d_.:-]+$/u) }).strict();
const openingMethods = ["context", "reprove", "begin", "finish", "observeParent", "ancillaryFrame",
  "observeAncillary", "ancillaryObservation"] as const;
function fail(code: string): Error { return new Error(`PCB_WORKER_STARTUP_OPENING_${code}`); }
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
  const timer = setTimeout(() => { expired.reject(fail("DEADLINE")); }, milliseconds);
  try { return await Promise.race([work, expired.promise]); } finally { clearTimeout(timer); }
}

export interface CurrentPcbWorkerStartupOpeningResult {
  readonly opening: CurrentPcbDiagnosticOpeningResult;
  readonly construction: CurrentPcbWorkerConstructionPacket;
  readonly workerIdentity: CurrentPcbWorkerConstructionProjectIdentity;
  readonly ancillaryFrame: Row | null;
  readonly executionAuthorized: false;
  readonly persistenceVerified: false;
}

export class CurrentPcbWorkerStartupOpening {
  readonly #dependency: CurrentPcbWorkerStartupDependency;
  readonly #opening: CurrentPcbWorkerStartupOpeningBinding;
  readonly #methods: readonly unknown[];
  readonly #request: CurrentPcbWorkerStartupDependency["request"];
  readonly #assertOwner: CurrentPcbWorkerStartupDependency["assertOriginalOwner"];
  readonly #assertTermination: CurrentPcbWorkerStartupDependency["assertOriginalTermination"];
  readonly #transport: CurrentPcbWorkerStartupTransport;
  #consumed = false;
  #settled = false;
  #released = false;
  #releasing = false;
  #openingAttempted = false;
  #capture: Promise<CurrentPcbWorkerConstructionPacket> | null = null;
  #openingResult: CurrentPcbDiagnosticOpeningResult | null = null;
  #construction: CurrentPcbWorkerConstructionPacket | null = null;
  #workerIdentity: CurrentPcbWorkerConstructionProjectIdentity | null = null;
  #completed: CurrentPcbWorkerStartupOpeningResult | null = null;

  public constructor(handoff: Pick<CurrentPcbWorkerStartupHandoff, "dependency" | "opening">) {
    this.#dependency = handoff.dependency; this.#opening = handoff.opening;
    this.#methods = retainedMethods(this.#opening, openingMethods);
    if (!Object.isFrozen(this.#dependency) || types.isProxy(this.#dependency)) { throw fail("DEPENDENCY"); }
    this.#request = this.#dependency.request; this.#assertOwner = this.#dependency.assertOriginalOwner;
    this.#assertTermination = this.#dependency.assertOriginalTermination;
    // Production never accepts a caller-selected worker source profile.
    this.#transport = new CurrentPcbWorkerStartupTransport(this.#dependency);
  }
  public status(): Readonly<{ consumed: boolean; settled: boolean; openingAttempted: boolean;
    openingResultRetained: boolean; constructionRetained: boolean; completed: boolean; executionAuthorized: false }> {
    return Object.freeze({ consumed: this.#consumed, settled: this.#settled, openingAttempted: this.#openingAttempted,
      openingResultRetained: this.#openingResult !== null, constructionRetained: this.#construction !== null,
      completed: this.#completed !== null, executionAuthorized: false });
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
    this.#context(); await bounded(this.#opening.reprove()); this.#context();
    await bounded(this.#assertOwner.call(this.#dependency)); this.#context();
  }
  async #send(command: CurrentPcbWorkerStartupCommand): Promise<Row> {
    await this.#current();
    const raw = await bounded(this.#request.call(this.#dependency, command));
    const reply = recordSchema.parse(captureCurrentPcbStringClockReply(raw).value);
    await this.#current(); return reply;
  }
  async #parent(finish = false): Promise<void> {
    const targets = await this.#send({ method: "Target.getTargets", params: {} });
    const frames = await this.#send({ method: "Page.getFrameTree", params: {}, sessionId: this.#context().sessionId });
    if (finish) { this.#opening.finish(targets, frames); } else { this.#opening.observeParent(targets, frames); }
    await this.#current();
  }
  async #ancillary(): Promise<void> {
    await this.#current(); const frameId = this.#opening.ancillaryFrame();
    if (frameId === null) { return; }
    const owner = await this.#send({ method: "DOM.getFrameOwner", params: { frameId }, sessionId: this.#context().sessionId });
    if (this.#opening.ancillaryFrame() !== frameId) { throw fail("ANCILLARY_CHANGED"); }
    const backendNodeId = z.number().int().min(1).max(2_147_483_647).parse(owner["backendNodeId"]);
    const node = await this.#send({ method: "DOM.describeNode", params: { backendNodeId, depth: 0, pierce: false },
      sessionId: this.#context().sessionId });
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
    const reply = await bounded(this.#request.call(this.#dependency, command), phase === "preflight" ? 15_000 : 70_000);
    // Retain the decoded reply before a later owner/checkpoint failure. No
    // Timeout or missing reply permits this command to be sent again.
    const result = decodeCurrentPcbDiagnosticOpeningReply(reply, target, phase); this.#openingResult = result;
    await this.#current(); return result;
  }
  public async open(input: CurrentDisposableOpenSealedTarget, reverify: () => Promise<void>): Promise<CurrentPcbWorkerStartupOpeningResult> {
    if (this.#consumed) { throw fail("CONSUMED"); } this.#consumed = true;
    try {
      const target = Object.freeze(currentDisposableOpenSealedTargetSchema.parse(captureCurrentPcbStringClockReply(input).value));
      if (typeof reverify !== "function") { throw fail("CHECKPOINT_CALLBACK"); }
      await this.#parent(); await this.#ancillary();
      const preflight = await this.#callOpening(target, "preflight"), title = preflight.observation;
      if (!preflight.ok || title === null) { throw fail("PREFLIGHT_REFUSED"); }
      await reverify(); await this.#current(); await this.#parent(); await this.#ancillary();
      this.#transport.bindExpectedProject({ projectUuid: target.projectUuid, branchUuid: target.branchUuid, windowTabId: title.windowTabId });
      const capture = this.#transport.capture(); this.#capture = capture; void observe(capture);
      await this.#transport.whenArmed(); await this.#current();
      this.#opening.begin(target, { initialTitle: title.initialTitle, expectedOpenedTitle: title.expectedOpenedTitle });
      // The worker must run its bounded capture while the parent opener is
      // Awaiting startup. Waiting for the opener before capture would deadlock.
      const result = await this.#callOpening(target, "open-project");
      if (!result.ok || result.observation?.initialTitle !== title.initialTitle ||
          result.observation.expectedOpenedTitle !== title.expectedOpenedTitle ||
          result.observation.windowTabId !== title.windowTabId) { throw fail("OPEN_REFUSED"); }
      await this.#parent(true); await this.#ancillary();
      this.#construction = await capture; await this.#current();
      const runner = await this.#transport.requireOriginal(this.#construction); await this.#current();
      const identity = await runner.proveProjectIdentity(this.#construction); this.#workerIdentity = identity;
      if (identity.projectUuid !== target.projectUuid || identity.branchUuid !== target.branchUuid ||
          identity.windowTabId !== title.windowTabId) { throw fail("WORKER_PROJECT_IDENTITY"); }
      await this.#current();
      this.#completed = Object.freeze({ opening: result, construction: this.#construction,
        workerIdentity: identity, ancillaryFrame: this.#opening.ancillaryObservation(), executionAuthorized: false, persistenceVerified: false });
      return this.#completed;
    } catch (error) {
      if (this.#capture !== null) {
        try { await this.#transport.abort(); }
        catch (cleanupError) { throw new AggregateError([error, cleanupError], "PCB_WORKER_STARTUP_OPENING_FAILED", { cause: cleanupError }); }
        finally { await observe(this.#capture); }
      }
      throw error;
    } finally { this.#settled = true; }
  }
  public async requireOriginal(result: CurrentPcbWorkerStartupOpeningResult): Promise<CurrentPcbWorkerStartupTransport> {
    if (result !== this.#completed || !this.#settled || this.#workerIdentity === null || result.workerIdentity !== this.#workerIdentity) { throw fail("ORIGINAL_RESULT"); }
    await this.#current(); const runner = await this.#transport.requireOriginal(result.construction); await this.#current();
    await runner.requireProjectIdentity(result.construction, this.#workerIdentity); await this.#current(); return this.#transport;
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
