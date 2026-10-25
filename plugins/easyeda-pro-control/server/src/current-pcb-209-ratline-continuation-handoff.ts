/** Private continuation-only handoffs. Completed observations survive a qualified
 * retirement interval; they never restore commands in a retired child realm. */
import { types } from "node:util";
import { z } from "zod";
import { sha256Json } from "./core.ts";
import { CURRENT_PCB_209_RATLINE_CONTINUATION_NATIVE_PROFILE } from "./current-pcb-209-ratline-continuation-budget.ts";
import type { CurrentPcb209RatlineBootstrapOwner, CurrentPcb209RatlineBootstrapPacket } from "./current-pcb-209-ratline-bootstrap-owner.ts";
import type { CurrentPcb209RatlineStartupPacket, CurrentPcb209RatlineWorkerStartup } from "./current-pcb-209-ratline-startup-session.ts";
import type { CurrentPcbWorkerStartupEvent } from "./current-pcb-worker-startup-contract.ts";

type ChildRole = "worker" | "subordinate";
type ParentRole = "pcb" | "worker";
interface SourceSeal { readonly source: CurrentPcb209RatlineBootstrapPacket; readonly contextId: number }
interface CaptureSeal { readonly packet: CurrentPcb209RatlineStartupPacket }
const captures = new WeakMap<CaptureSeal, object>(), sources = new WeakMap<SourceSeal, object>();
export function issueCurrentPcb209ContinuedSourceSeal(owner: object, source: CurrentPcb209RatlineBootstrapPacket, contextId: number): SourceSeal {
  const seal = Object.freeze({ source, contextId }); sources.set(seal, owner); return seal;
}
export function isCurrentPcb209ContinuedSourceSeal(seal: SourceSeal, owner: object, source: CurrentPcb209RatlineBootstrapPacket): boolean {
  return sources.get(seal) === owner && seal.source === source;
}
export function issueCurrentPcb209CompletedCaptureSeal(owner: object, packet: CurrentPcb209RatlineStartupPacket): CaptureSeal {
  const seal = Object.freeze({ packet }); captures.set(seal, owner); return seal;
}
export function isCurrentPcb209CompletedCaptureSeal(seal: CaptureSeal, owner: object, packet: CurrentPcb209RatlineStartupPacket): boolean {
  return captures.get(seal) === owner && seal.packet === packet;
}
export type CurrentPcb209ContinuedSourceSeal = SourceSeal;
export type CurrentPcb209CompletedCaptureSeal = CaptureSeal;

const token = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
export const currentPcb209RatlineRetirementEvidenceSchema = z.object({
  role: z.enum(["worker", "subordinate"]), parentSessionId: token, childSessionId: token, childTargetId: token,
  sourceSha256: z.string().regex(/^[a-f\d]{64}$/u), parentPauseSha256: z.string().regex(/^[a-f\d]{64}$/u),
  boundary: z.enum(["pcb-received", "worker-initialized"]), sourceSealedBeforeParentResume: z.literal(true),
  originalParentResumeObserved: z.literal(true), originalDetachObserved: z.literal(true),
  contextDestroyedObserved: z.boolean(),
  nativeWorkerTargetIdentityVerified: z.literal(false), executionAuthorized: z.literal(false),
}).strict();
export type CurrentPcb209RatlineRetirementEvidence = z.infer<typeof currentPcb209RatlineRetirementEvidenceSchema>;
interface Child {
  readonly role: ChildRole;
  readonly owner: CurrentPcb209RatlineBootstrapOwner;
  readonly source: CurrentPcb209RatlineBootstrapPacket;
  readonly parentSessionId: string;
  readonly sourceSha256: string;
  readonly methods: readonly unknown[];
  seal: SourceSeal | null;
  sealing: boolean;
  boundaryConsumed: boolean;
  capture: Readonly<{ owner: CurrentPcb209RatlineWorkerStartup; seal: CaptureSeal; methods: readonly unknown[] }> | null;
  boundary: Readonly<{ pause: object; digest: string }> | null;
  resumeRequested: boolean;
  resumed: boolean;
  resumeAcknowledged: boolean;
  detached: boolean;
  contextDestroyed: boolean;
  readonly ready: PromiseWithResolvers<null>;
  readonly retired: PromiseWithResolvers<null>;
}
const sourceMethods = ["requireOriginal", "sealOriginalContinuedSource", "retireOriginalSealedSource", "requireOriginalSealedSource"] as const;
const captureMethods = ["requireOriginal", "sealOriginalCompletedCapture", "requireOriginalSealedCapture"] as const;
function methods(owner: object, names: readonly string[]): readonly unknown[] {
  need(!types.isProxy(owner), "OWNER");
  const chain: object[] = []; let cursor: unknown = Object.getPrototypeOf(owner);
  while (cursor !== Object.prototype) {
    need(cursor !== null && typeof cursor === "object" && !types.isProxy(cursor) && chain.length < 3, "OWNER");
    chain.push(cursor); cursor = Object.getPrototypeOf(cursor);
  }
  need(chain.length > 0, "OWNER");
  return Object.freeze([...chain, ...names.map(name => {
    need(!Object.hasOwn(owner, name), "OWNER_METHOD");
    for (const prototype of chain) {
      const field = Object.getOwnPropertyDescriptor(prototype, name);
      if (field !== undefined) { need(Object.hasOwn(field, "value") && typeof field.value === "function", "OWNER_METHOD"); return field.value as unknown; }
    }
    throw new Error("PCB209_RATLINE_HANDOFF_OWNER_METHOD");
  })]);
}
const handoffMethods = ["register", "sealSubordinate", "sealWorker", "beforeResume", "requestResume", "observeResume", "acknowledgeResume", "consumeRetirementEvent", "requireOriginalHistory", "evidence", "status", "abort"] as const;
function sameFlow(flow: CurrentPcb209RatlineContinuationHandoff, original: readonly unknown[]): void {
  const current = methods(flow, handoffMethods); need(current.length === original.length && current.every((value, index) => value === original[index]), "FLOW_CHANGED");
}
export function currentPcb209RatlineRetirementConsumer(flow: CurrentPcb209RatlineContinuationHandoff): (event: CurrentPcbWorkerStartupEvent) => boolean {
  const original = methods(flow, handoffMethods);
  // oxlint-disable-next-line typescript/unbound-method -- Retain the original function and invoke it only with its original private owner after graph validation.
  const consume = flow.consumeRetirementEvent;
  return (event): boolean => { sameFlow(flow, original); return consume.call(flow, event); };
}
function need(value: boolean, reason: string): asserts value { if (!value) { throw new Error(`PCB209_RATLINE_HANDOFF_${reason}`); } }
async function observed(work: Promise<unknown>): Promise<void> { try { await work; } catch {
  // Original capture/cleanup reports the failure; keep preinstalled waits observed.
} }
async function bounded<T>(work: Promise<T>): Promise<T> {
  const expired = Promise.withResolvers<never>(), timer = setTimeout(() => { expired.reject(new Error("PCB209_RATLINE_HANDOFF_DEADLINE")); },
    CURRENT_PCB_209_RATLINE_CONTINUATION_NATIVE_PROFILE.elapsed.normalMilliseconds);
  try { return await Promise.race([work, expired.promise]); } finally { clearTimeout(timer); }
}
interface BoundFlow { readonly flow: CurrentPcb209RatlineContinuationHandoff; readonly role: ParentRole; readonly methods: readonly unknown[] }
const bindings = new WeakMap<object, BoundFlow>();
export function bindCurrentPcb209RatlineContinuationHandoff(target: object, flow: CurrentPcb209RatlineContinuationHandoff, role: ParentRole): void {
  need(!bindings.has(target), "BINDING_CONSUMED"); bindings.set(target, Object.freeze({ flow, role, methods: methods(flow, handoffMethods) }));
}
export function inheritCurrentPcb209RatlineContinuationHandoff(original: object, target: object): void {
  const value = bindings.get(original); if (value !== undefined) { need(!bindings.has(target), "BINDING_CONSUMED"); bindings.set(target, value); }
}
export function isCurrentPcb209RatlineCaptureHandoff(transport: object, site: string): boolean {
  const value = bindings.get(transport); if (value !== undefined) { sameFlow(value.flow, value.methods); } return value !== undefined &&
    (value.role === "pcb" && site === "received" || value.role === "worker" && site === "initialized");
}
export async function beforeCurrentPcb209RatlineCaptureResume(transport: object, site: string, pause: object, event: unknown): Promise<void> {
  const value = bindings.get(transport); if (value !== undefined) { sameFlow(value.flow, value.methods); await value.flow.beforeResume(value.role, site, pause, event); sameFlow(value.flow, value.methods); }
}
export function requestCurrentPcb209RatlineCaptureResume(transport: object, pause: object): void {
  const value = bindings.get(transport); if (value !== undefined) { sameFlow(value.flow, value.methods); value.flow.requestResume(value.role, pause); }
}
export function acknowledgeCurrentPcb209RatlineCaptureResume(transport: object, pause: object): void {
  const value = bindings.get(transport); if (value !== undefined) { sameFlow(value.flow, value.methods); value.flow.acknowledgeResume(value.role, pause); }
}
export function observeCurrentPcb209RatlineCaptureResume(transport: object, pause: object): void {
  const value = bindings.get(transport); if (value !== undefined) { sameFlow(value.flow, value.methods); value.flow.observeResume(value.role, pause); }
}

export class CurrentPcb209RatlineContinuationHandoff {
  readonly #assertOwner: () => Promise<void>;
  readonly #revoke: (role: ChildRole, sessionId: string) => void;
  readonly #children = new Map<ChildRole, Child>();
  readonly #failure = Promise.withResolvers<never>();
  #failed = false;
  public constructor(assertOriginalOwner: () => Promise<void>, revokeOriginalRealm: (role: ChildRole, sessionId: string) => void) {
    this.#assertOwner = assertOriginalOwner; this.#revoke = revokeOriginalRealm; void observed(this.#failure.promise);
  }
  async #current(): Promise<void> { need(!this.#failed, "FAILED"); await this.#assertOwner(); need(!this.#failed, "FAILED"); }
  #child(role: ChildRole): Child { const child = this.#children.get(role); need(child !== undefined, "CHILD_REQUIRED"); return child; }
  #same(child: Child): void {
    need(!this.#failed, "FAILED");
    const source = methods(child.owner, sourceMethods);
    need(source.length === child.methods.length && source.every((value, index) => value === child.methods[index]), "SOURCE_OWNER_CHANGED");
    if (child.capture !== null) { const capture = methods(child.capture.owner, captureMethods); need(capture.length === child.capture.methods.length && capture.every((value, index) => value === child.capture?.methods[index]), "CAPTURE_OWNER_CHANGED"); }
  }
  public register(role: ChildRole, owner: CurrentPcb209RatlineBootstrapOwner, source: CurrentPcb209RatlineBootstrapPacket,
    parentSessionId: string, sourceSha256: string): void {
    need(!this.#failed && !this.#children.has(role), "REGISTER_CONSUMED");
    const ready = Promise.withResolvers<null>(), retired = Promise.withResolvers<null>(); void observed(ready.promise); void observed(retired.promise);
    this.#children.set(role, { role, owner, source, parentSessionId, sourceSha256, methods: methods(owner, sourceMethods), seal: null, capture: null,
      sealing: false, boundaryConsumed: false, boundary: null, resumeRequested: false, resumed: false, resumeAcknowledged: false, detached: false, contextDestroyed: false, ready, retired });
  }
  public async sealSubordinate(): Promise<void> {
    const child = this.#child("subordinate"); need(!child.sealing, "SEAL_CONSUMED"); child.sealing = true; await this.#current(); this.#same(child);
    child.seal = await child.owner.sealOriginalContinuedSource(child.source); this.#same(child); await this.#current(); child.ready.resolve(null);
  }
  public async sealWorker(owner: CurrentPcb209RatlineWorkerStartup, packet: CurrentPcb209RatlineStartupPacket): Promise<void> {
    const child = this.#child("worker"); need(!child.sealing, "SEAL_CONSUMED"); child.sealing = true; await this.#current(); this.#same(child);
    const originalMethods = methods(owner, captureMethods), seal = await owner.sealOriginalCompletedCapture(packet);
    need(methods(owner, captureMethods).every((value, index) => value === originalMethods[index]), "CAPTURE_OWNER_CHANGED");
    child.capture = Object.freeze({ owner, seal, methods: originalMethods }); child.seal = await child.owner.sealOriginalContinuedSource(child.source);
    this.#same(child); await this.#current(); child.ready.resolve(null);
  }
  public async beforeResume(role: ParentRole, site: string, pause: object, event: unknown): Promise<void> {
    if (!(role === "pcb" && site === "received" || role === "worker" && site === "initialized")) { return; }
    const child = this.#child(role === "pcb" ? "worker" : "subordinate"); need(!child.boundaryConsumed, "BOUNDARY_CONSUMED"); child.boundaryConsumed = true;
    await bounded(Promise.race([child.ready.promise, this.#failure.promise])); await this.#current(); this.#same(child);
    need(child.seal !== null && !child.resumed && !child.detached && (role !== "pcb" || child.capture !== null), "BOUNDARY_SEAL");
    child.owner.requireOriginalSealedSource(child.seal); if (child.capture !== null) { child.capture.owner.requireOriginalSealedCapture(child.capture.seal); }
    child.boundary = Object.freeze({ pause, digest: sha256Json(event) });
  }
  public requestResume(role: ParentRole, pause: object): void {
    const child = this.#children.get(role === "pcb" ? "worker" : "subordinate");
    if (child?.boundary?.pause !== pause) { return; }
    need(!this.#failed && !child.resumeRequested && child.seal !== null, "RESUME_STATE"); this.#same(child);
    // Native execution may detach the child before the parent resumed event
    // Reaches the original pipe. Revoke requests before the one resume write;
    // History still requires that write's acknowledgment and observed resume.
    child.resumeRequested = true; child.owner.retireOriginalSealedSource(child.seal); this.#revoke(child.role, child.source.childSessionId);
  }
  public observeResume(role: ParentRole, pause: object): void {
    const child = this.#children.get(role === "pcb" ? "worker" : "subordinate");
    if (child?.boundary?.pause !== pause) { return; }
    need(!this.#failed && child.resumeRequested && !child.resumed && child.seal !== null, "RESUME_STATE"); this.#same(child); child.resumed = true;
  }
  public acknowledgeResume(role: ParentRole, pause: object): void {
    const child = this.#children.get(role === "pcb" ? "worker" : "subordinate");
    if (child?.boundary?.pause !== pause) { return; }
    need(!this.#failed && child.resumeRequested && child.resumed && !child.resumeAcknowledged, "RESUME_ACKNOWLEDGMENT");
    this.#same(child); child.resumeAcknowledged = true;
  }
  /** Called only by the original router, before shared owners see terminal events. */
  public consumeRetirementEvent(event: CurrentPcbWorkerStartupEvent): boolean {
    const destroyed = event.method === "Runtime.executionContextDestroyed", detach = event.method === "Target.detachedFromTarget";
    if (!detach && !destroyed) { return false; }
    const child = [...this.#children.values()].find(value => detach ? event.sessionId === value.parentSessionId &&
      event.params["sessionId"] === value.source.childSessionId : event.sessionId === value.source.childSessionId);
    if (child === undefined) { return false; }
    need(!this.#failed && child.resumeRequested && child.seal !== null && child.boundary !== null, "EARLY_RETIREMENT"); this.#same(child);
    if (detach) {
      const value = z.object({ sessionId: token, targetId: token.optional() }).strict().parse(event.params);
      need(!child.detached && value.sessionId === child.source.childSessionId && (value.targetId === undefined || value.targetId === child.source.childTargetId), "DETACH_IDENTITY");
      child.detached = true; child.retired.resolve(null);
    } else if (destroyed) {
      const value = z.object({ executionContextId: z.number().int().positive(), executionContextUniqueId: token }).strict().parse(event.params);
      need(!child.contextDestroyed && value.executionContextId === child.seal.contextId &&
        value.executionContextUniqueId === child.source.uniqueContextId, "CONTEXT_IDENTITY"); child.contextDestroyed = true;
    }
    return true;
  }
  public async requireOriginalHistory(): Promise<void> {
    await this.#current(); need(this.#children.size === 2, "INCOMPLETE");
    for (const child of this.#children.values()) {
      await bounded(Promise.race([child.retired.promise, this.#failure.promise])); await this.#current(); this.#same(child);
      need(child.seal !== null && child.resumed && child.resumeAcknowledged && child.detached, "INCOMPLETE"); child.owner.requireOriginalSealedSource(child.seal);
      if (child.role === "worker") { need(child.capture !== null, "CAPTURE_REQUIRED"); child.capture.owner.requireOriginalSealedCapture(child.capture.seal); }
    }
  }
  public evidence(): Readonly<{ worker: CurrentPcb209RatlineRetirementEvidence; subordinate: CurrentPcb209RatlineRetirementEvidence }> {
    const read = (role: ChildRole): CurrentPcb209RatlineRetirementEvidence => {
      const child = this.#child(role); need(!this.#failed && child.detached && child.resumed && child.resumeAcknowledged && child.boundary !== null, "INCOMPLETE"); this.#same(child);
      return Object.freeze({ role, parentSessionId: child.parentSessionId, childSessionId: child.source.childSessionId, childTargetId: child.source.childTargetId,
        sourceSha256: child.sourceSha256, parentPauseSha256: child.boundary.digest, boundary: role === "worker" ? "pcb-received" : "worker-initialized",
        sourceSealedBeforeParentResume: true, originalParentResumeObserved: true, originalDetachObserved: true,
        contextDestroyedObserved: child.contextDestroyed,
        nativeWorkerTargetIdentityVerified: false, executionAuthorized: false });
    }; return Object.freeze({ worker: read("worker"), subordinate: read("subordinate") });
  }
  public status(): Readonly<Record<string, unknown>> {
    return Object.freeze({ failed: this.#failed, children: [...this.#children.values()].map(child => ({ role: child.role, sealing: child.sealing,
      sourceSealed: child.seal !== null, captureSealed: child.capture !== null, boundaryConsumed: child.boundaryConsumed,
      boundaryReady: child.boundary !== null, resumeRequested: child.resumeRequested, resumed: child.resumed, resumeAcknowledged: child.resumeAcknowledged, detached: child.detached, contextDestroyed: child.contextDestroyed })) });
  }
  public abort(): void { if (!this.#failed) { this.#failed = true; this.#failure.reject(new Error("PCB209_RATLINE_HANDOFF_ABORTED")); } }
}
