/** Private continuation of the same startup owner into its sealed PCB. This
 * class has no public tool, reader adoption, writer or Save authority. */
import { types } from "node:util";
import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import { currentDisposableOpenSealedTargetSchema } from "./current-disposable-open.ts";
import type { CurrentDisposableOpenSealedTarget } from "./current-disposable-open.ts";
import { CurrentPcbDiagnosticContext } from "./current-pcb-diagnostic-context.ts";
import { CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION, decodeCurrentPcbDiagnosticPcbOpeningReply } from "./current-pcb-diagnostic-pcb-opening.ts";
import type { CurrentPcbDiagnosticPcbOpeningPhase, CurrentPcbDiagnosticPcbOpeningResult } from "./current-pcb-diagnostic-pcb-opening.ts";
import { CURRENT_PCB_DIAGNOSTIC_SCRIPTS } from "./current-pcb-diagnostic-profile.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { CurrentPcbWorkerStartupCommand, CurrentPcbWorkerStartupDependency } from "./current-pcb-worker-startup-contract.ts";
import { CurrentPcbWorkerStartupOpening } from "./current-pcb-worker-startup-opening.ts";
import type { CurrentPcbWorkerStartupOpeningResult } from "./current-pcb-worker-startup-opening.ts";
// oxlint-disable-next-line import/max-dependencies -- This session joins the existing original owner, context, strict opener and their immutable packet without granting any new dispatch family.
import { freezeDeep } from "./sqlite-inventory-core.ts";

type Row = Record<string, unknown>;
type ModelContext = ReturnType<CurrentPcbDiagnosticContext["modelContext"]>;
type Phase = "ready" | "preflight" | "checkpoint" | "opening" | "source" | "identity" | "completed" | "failed";
/** Twenty fixed commands, at most two original identity checks per command,
 * plus initial/checkpoint/final checks. The existing full startup maximum174,
 * owner factory proof and this session therefore use at most239 of256 requests.
 * Later consumer proofs spend the remaining budget. No common reader fits
 * this contract; a later combined launch purpose needs its own fixed budget. */
export const CURRENT_PCB_WORKER_STARTUP_PCB_COMMAND_LIMIT = 20;
export const CURRENT_PCB_WORKER_STARTUP_PCB_TOTAL_REQUEST_LIMIT = 64;
const contextKeys = Object.getOwnPropertyNames(CurrentPcbDiagnosticContext.prototype).filter(key => key !== "constructor");
// oxlint-disable typescript/unbound-method -- Invoke captured private-field methods only on their retained original class instances.
const requireOpening = CurrentPcbWorkerStartupOpening.prototype.requireOriginalPcbDependency;
const originalContext = Object.freeze(Object.fromEntries(contextKeys.map(key => [key,
  Object.getOwnPropertyDescriptor(CurrentPcbDiagnosticContext.prototype, key)?.value as unknown])));
// oxlint-enable typescript/unbound-method
const row = z.record(z.string(), z.unknown());
const model = z.object({ sessionId: z.string().regex(/^[A-Za-z\d_.:-]{1,128}$/u),
  scriptId: z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u), uniqueContextId: z.string().regex(/^[A-Za-z\d_.:-]{1,128}$/u) }).strict();
function need(condition: boolean, detail: string): asserts condition {
  if (!condition) { throw new Error(`PCB_WORKER_STARTUP_PCB_SESSION: ${detail}`); }
}
async function bounded<T>(work: Promise<T>, milliseconds: number): Promise<T> {
  const deadline = Promise.withResolvers<never>();
  const timer = setTimeout(() => { deadline.reject(new Error("PCB_WORKER_STARTUP_PCB_SESSION: deadline")); }, milliseconds);
  try { return await Promise.race([work, deadline.promise]); } finally { clearTimeout(timer); }
}
/** Retain the original decoded reply even if the caller's deadline has already
 * failed. This helper cannot dispatch, retry, revive a phase or authorize work;
 * its sole callback publishes evidence into the original session. */
export function retainCurrentPcbWorkerStartupPcbOpeningReply(original: Promise<unknown>,
  target: CurrentDisposableOpenSealedTarget, phase: CurrentPcbDiagnosticPcbOpeningPhase,
  retain: (reply: CurrentPcbDiagnosticPcbOpeningResult) => void): Promise<CurrentPcbDiagnosticPcbOpeningResult> {
  const pending = (async (): Promise<CurrentPcbDiagnosticPcbOpeningResult> => {
    const reply = decodeCurrentPcbDiagnosticPcbOpeningReply(await original, target, phase);
    retain(reply); return reply;
  })();
  // Promise.race observes both settlement paths after its deadline, including
  // Malformed late replies, while keeping its own failure permanently settled.
  return bounded(pending, phase === "open-document" ? 70_000 : 15_000);
}
function copyReply(command: CurrentPcbWorkerStartupCommand, raw: unknown): Row {
  if (command.method !== "Debugger.getScriptSource") { return row.parse(captureCurrentPcbStringClockReply(raw).value); }
  // The only large reply is the complete pinned PCB source. Capture the sole
  // Own string before any await without widening generic reply limits.
  need(raw !== null && typeof raw === "object" && !types.isProxy(raw) && !Array.isArray(raw) &&
    (Object.getPrototypeOf(raw) === Object.prototype || Object.getPrototypeOf(raw) === null), "source reply shape");
  const keys = Reflect.ownKeys(raw), source = Object.getOwnPropertyDescriptor(raw, "scriptSource");
  need(keys.length === 1 && keys[0] === "scriptSource" && source !== undefined && Object.hasOwn(source, "value") &&
    typeof source.value === "string" && source.value.isWellFormed() &&
    Buffer.byteLength(source.value) === CURRENT_PCB_DIAGNOSTIC_SCRIPTS.pcb.scriptBytes, "complete source reply required");
  return Object.freeze({ scriptSource: source.value });
}

export interface CurrentPcbWorkerStartupPcbPacket {
  readonly profile: "private.current-pcb-worker-startup-pcb-session.v1";
  readonly targetSha256: string;
  readonly constructionPacketSha256: string;
  readonly sourceObservation: Readonly<Row>;
  readonly openingObservation: CurrentPcbDiagnosticPcbOpeningResult;
  readonly originalSessionContinued: true;
  readonly nativeCommands: number;
  readonly completeLiveBaselineVerified: false;
  readonly startupCompletionVerified: false;
  readonly executionAuthorized: false;
  readonly saveAuthorized: false;
}

export class CurrentPcbWorkerStartupPcbSession {
  readonly #opening: CurrentPcbWorkerStartupOpening;
  readonly #result: CurrentPcbWorkerStartupOpeningResult;
  readonly #dependency: CurrentPcbWorkerStartupDependency;
  readonly #request: CurrentPcbWorkerStartupDependency["request"];
  readonly #context: CurrentPcbDiagnosticContext;
  readonly #target: CurrentDisposableOpenSealedTarget;
  readonly #reverify: () => Promise<void>;
  #phase: Phase = "ready";
  #transitionStarted = false;
  #commands = 0;
  #openingObservation: CurrentPcbDiagnosticPcbOpeningResult | null = null;
  #packet: CurrentPcbWorkerStartupPcbPacket | null = null;
  #model: ModelContext | null = null;

  public constructor(opening: CurrentPcbWorkerStartupOpening, result: CurrentPcbWorkerStartupOpeningResult,
    dependency: CurrentPcbWorkerStartupDependency, context: CurrentPcbDiagnosticContext,
    target: CurrentDisposableOpenSealedTarget, reverifyCheckpoint: () => Promise<void>) {
    need(!types.isProxy(opening) && Object.getPrototypeOf(opening) === CurrentPcbWorkerStartupOpening.prototype &&
      !types.isProxy(context) && Object.getPrototypeOf(context) === CurrentPcbDiagnosticContext.prototype &&
      typeof reverifyCheckpoint === "function", "original classes and checkpoint callback required");
    need(dependency !== null && typeof dependency === "object" && !types.isProxy(dependency) && Object.isFrozen(dependency) &&
      Object.getPrototypeOf(dependency) === Object.prototype, "original dependency required");
    const request = Object.getOwnPropertyDescriptor(dependency, "request");
    need(request !== undefined && Object.hasOwn(request, "value") && typeof request.value === "function", "original request method required");
    this.#opening = opening; this.#result = result; this.#dependency = dependency; this.#request = dependency.request;
    this.#context = context; this.#reverify = reverifyCheckpoint;
    this.#target = Object.freeze(currentDisposableOpenSealedTargetSchema.parse(captureCurrentPcbStringClockReply(target).value));
    this.#same();
  }
  public status(): Readonly<{ phase: Phase; transitionStarted: boolean; nativeCommands: number;
    openingObservationRetained: boolean; packetRetained: boolean; executionAuthorized: false }> {
    return Object.freeze({ phase: this.#phase, transitionStarted: this.#transitionStarted, nativeCommands: this.#commands,
      openingObservationRetained: this.#openingObservation !== null, packetRetained: this.#packet !== null, executionAuthorized: false });
  }
  public retainedOpeningObservation(): CurrentPcbDiagnosticPcbOpeningResult | null { return this.#openingObservation; }
  #same(): void {
    need(this.#phase !== "failed" && Object.getPrototypeOf(this.#context) === CurrentPcbDiagnosticContext.prototype &&
      Object.getPrototypeOf(this.#opening) === CurrentPcbWorkerStartupOpening.prototype &&
      this.#dependency.request === this.#request && Object.isFrozen(this.#dependency) && !types.isProxy(this.#dependency), "original lifetime changed");
    for (const key of contextKeys) {
      need(!Object.hasOwn(this.#context, key) &&
        Object.getOwnPropertyDescriptor(CurrentPcbDiagnosticContext.prototype, key)?.value === originalContext[key], "original context method changed");
    }
    this.#context.assertCurrent();
    const parent = this.#transitionStarted ? this.#context.pcbOpeningContext() : this.#context.openingContext();
    need(parent.sessionId === this.#dependency.parentSessionId, "original parent differs");
  }
  async #current(): Promise<void> {
    this.#same(); await bounded(requireOpening.call(this.#opening, this.#result, this.#dependency, this.#target), 10_000); this.#same();
  }
  async #send(command: CurrentPcbWorkerStartupCommand): Promise<Row> {
    await this.#current(); need(this.#commands < CURRENT_PCB_WORKER_STARTUP_PCB_COMMAND_LIMIT, "fixed command budget"); this.#commands += 1;
    const captured = copyReply(command, await bounded(this.#request.call(this.#dependency, command), 15_000));
    await this.#current(); return captured;
  }
  async #parent(): Promise<Readonly<{ targets: Row; frames: Row }>> {
    const targets = await this.#send({ method: "Target.getTargets", params: {} });
    const frames = await this.#send({ method: "Page.getFrameTree", params: {}, sessionId: this.#dependency.parentSessionId });
    return { targets, frames };
  }
  #observeParent(observed: Readonly<{ targets: Row; frames: Row }>): void {
    this.#context.observeTarget(observed.targets); this.#context.observeFrames(observed.frames);
  }
  async #ancillary(): Promise<void> {
    const frameId = this.#context.openingAncillaryFrame();
    if (frameId === null) { return; }
    const sessionId = this.#dependency.parentSessionId;
    const owner = await this.#send({ method: "DOM.getFrameOwner", params: { frameId }, sessionId });
    need(this.#context.openingAncillaryFrame() === frameId, "ancillary frame changed");
    const backendNodeId = z.number().int().min(1).max(2_147_483_647).parse(owner["backendNodeId"]);
    const node = await this.#send({ method: "DOM.describeNode", params: { backendNodeId, depth: 0, pierce: false }, sessionId });
    need(this.#context.openingAncillaryFrame() === frameId, "ancillary frame changed");
    this.#context.observeOpeningAncillaryOwner(owner, node);
  }
  async #call(phase: CurrentPcbDiagnosticPcbOpeningPhase): Promise<CurrentPcbDiagnosticPcbOpeningResult> {
    const context = this.#transitionStarted ? this.#context.pcbOpeningContext() : this.#context.openingContext();
    const command: CurrentPcbWorkerStartupCommand = { method: "Runtime.callFunctionOn", sessionId: context.sessionId,
      params: { functionDeclaration: CURRENT_PCB_DIAGNOSTIC_PCB_OPENING_FUNCTION, uniqueContextId: context.uniqueContextId,
        arguments: [{ value: this.#target }, { value: phase }], returnByValue: true, awaitPromise: true,
        silent: true, generatePreview: false, userGesture: false, throwOnSideEffect: false } };
    // Keep decoded acknowledgments after a deadline as evidence only; the
    // Failed coordinator stays consumed and cannot continue or replay.
    await this.#current(); need(this.#commands < CURRENT_PCB_WORKER_STARTUP_PCB_COMMAND_LIMIT, "fixed command budget"); this.#commands += 1;
    const observed = await retainCurrentPcbWorkerStartupPcbOpeningReply(this.#request.call(this.#dependency, command),
      this.#target, phase, reply => { this.#openingObservation = reply; });
    await this.#current();
    need(observed.ok && observed.windowTabId === this.#result.workerIdentity.windowTabId, "PCB opening observation refused"); return observed;
  }
  public async openAndQualify(): Promise<CurrentPcbWorkerStartupPcbPacket> {
    need(this.#phase === "ready", "attempt consumed"); this.#phase = "preflight";
    try {
      await this.#current(); this.#observeParent(await this.#parent()); await this.#call("preflight");
      this.#phase = "checkpoint"; await this.#current(); await this.#reverify(); await this.#current();
      this.#observeParent(await this.#parent()); await this.#ancillary();
      this.#context.beginPcbOpeningTransition(this.#target.projectUuid, this.#target.documentUuid);
      this.#transitionStarted = true; this.#phase = "opening"; await this.#call("open-document");
      this.#phase = "source";
      const first = await this.#parent();
      const child = this.#context.observePcbOpeningFrames(first.targets, first.frames);
      await this.#ancillary(); const sessionId = this.#dependency.parentSessionId;
      const owner = await this.#send({ method: "DOM.getFrameOwner", params: { frameId: child.frameId }, sessionId });
      const backendNodeId = z.number().int().min(1).max(2_147_483_647).parse(owner["backendNodeId"]);
      const node = await this.#send({ method: "DOM.describeNode", params: { backendNodeId, depth: 0, pierce: false }, sessionId });
      this.#context.observePcbFrameOwner(owner, node);
      const script = this.#context.pcbScript(CURRENT_PCB_DIAGNOSTIC_SCRIPTS.pcb);
      const source = await this.#send({ method: "Debugger.getScriptSource", pcbPhase: "source", params: { scriptId: script.scriptId }, sessionId });
      const after = await this.#parent(), sourceObservation = this.#context.finishPcbOpening(source, after.targets, after.frames);
      this.#phase = "identity"; const openingObservation = await this.#call("observe");
      this.#observeParent(await this.#parent()); await this.#current(); this.#context.completePcbOpening();
      this.#model = Object.freeze(model.parse(this.#context.modelContext()));
      this.#packet = freezeDeep({ profile: "private.current-pcb-worker-startup-pcb-session.v1",
        targetSha256: sha256Json(this.#target), constructionPacketSha256: sha256Json(this.#result.construction),
        sourceObservation, openingObservation, originalSessionContinued: true, nativeCommands: this.#commands,
        completeLiveBaselineVerified: false, startupCompletionVerified: false, executionAuthorized: false, saveAuthorized: false });
      this.#phase = "completed"; return this.#packet;
    } catch (error) { this.#phase = "failed"; throw error; }
  }
  /** Private consumer only, retaining this exact session and packet. Returning
   * the model tuple is not a new transport, budget, complete baseline or writer. */
  public async requireOriginal(packet: CurrentPcbWorkerStartupPcbPacket): Promise<ModelContext> {
    need(this.#phase === "completed" && packet === this.#packet && this.#model !== null, "original completed packet required");
    try {
      await this.#current(); need(canonicalJson(this.#context.modelContext()) === canonicalJson(this.#model), "original PCB context changed"); return this.#model;
    } catch (error) { this.#phase = "failed"; throw error; }
  }
}
