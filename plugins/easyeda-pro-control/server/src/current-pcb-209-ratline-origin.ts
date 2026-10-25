/** Bounded native creation-origin observation. The external async stack is
 * independent of URL/name correlation, but a matching observation does not
 * establish the custom runtime's complete Worker/CDP identity contract. */

import { types } from "node:util";
import { CurrentPcb209RatlinePcbBootstrapOwner } from "./current-pcb-209-ratline-pcb-bootstrap-owner.ts";
import type { CurrentPcb209RatlinePcbBootstrapPacket } from "./current-pcb-209-ratline-pcb-bootstrap-owner.ts";
import { CurrentPcb209RatlineBootstrapOwner } from "./current-pcb-209-ratline-bootstrap-owner.ts";
import { CurrentPcb209RatlinePcbCreation } from "./current-pcb-209-ratline-creation-runner.ts";
import type { CurrentPcb209RatlineCreationPacket } from "./current-pcb-209-ratline-creation-runner.ts";
import { captureCurrentPcb209RatlineOriginEvidence, currentPcb209RatlineObservedExternalId, inspectCurrentPcb209RatlineOriginEvidence } from "./current-pcb-209-ratline-origin-observation.ts";
import type { CurrentPcb209RatlineOriginEvidence, CurrentPcb209RatlineOriginSummary } from "./current-pcb-209-ratline-origin-observation.ts";
import { CURRENT_PCB_209_RATLINE_NATIVE_PROFILE } from "./current-pcb-209-ratline-budget.ts";

export interface CurrentPcb209RatlineOriginCommand {
  readonly method: "Debugger.getStackTrace";
  readonly sessionId: string;
  readonly params: Readonly<{ stackTraceId: Readonly<{ id: string; debuggerId: string }> }>;
}
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`PCB209_RATLINE_ORIGIN_${code}`); } }
async function bounded<T>(work: Promise<T>): Promise<T> {
  const expired = Promise.withResolvers<never>();
  const timer = setTimeout(() => { expired.reject(new Error("PCB209_RATLINE_ORIGIN_DEADLINE")); }, CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.elapsed.ordinaryRequestMilliseconds);
  try { return await Promise.race([work, expired.promise]); } finally { clearTimeout(timer); }
}
interface Dependency { readonly assertOriginalOwner: () => Promise<void>; readonly request: (command: CurrentPcb209RatlineOriginCommand) => Promise<unknown> }
function members(value: Dependency): readonly unknown[] {
  need(value !== null && typeof value === "object" && !types.isProxy(value) && Object.getPrototypeOf(value) === Object.prototype &&
    Reflect.ownKeys(value).length === 2, "DEPENDENCY");
  return ["assertOriginalOwner", "request"].map(key => { const descriptor = Object.getOwnPropertyDescriptor(value, key);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && typeof descriptor.value === "function", "DEPENDENCY"); return descriptor.value as unknown; });
}
// oxlint-disable-next-line typescript/unbound-method -- These original methods are called with their actual private-slot owners below.
const sourceDebugger = CurrentPcb209RatlinePcbBootstrapOwner.prototype.requireOriginalDebugger;
// oxlint-disable-next-line typescript/unbound-method -- Same retained original-instance dispatch.
const firstScript = CurrentPcb209RatlineBootstrapOwner.prototype.requireOriginalFirstScript;
// oxlint-disable-next-line typescript/unbound-method -- Same retained original-instance dispatch.
const constructorObservation = CurrentPcb209RatlinePcbCreation.prototype.requireOriginalConstructor;

export class CurrentPcb209RatlineOrigin {
  readonly #dependency: Dependency;
  readonly #members: readonly unknown[];
  #consumed = false;
  #summary: CurrentPcb209RatlineOriginSummary | null = null;
  #evidence: CurrentPcb209RatlineOriginEvidence | null = null;
  public constructor(dependency: Dependency) { this.#members = members(dependency); this.#dependency = dependency; }
  async #current(): Promise<void> {
    need(members(this.#dependency).every((value, index) => value === this.#members[index]), "OWNER_CHANGED");
    await bounded(this.#dependency.assertOriginalOwner());
    need(members(this.#dependency).every((value, index) => value === this.#members[index]), "OWNER_CHANGED");
  }
  public summary(): CurrentPcb209RatlineOriginSummary | null { return this.#summary; }
  public evidence(): CurrentPcb209RatlineOriginEvidence | null { return this.#evidence; }
  public async capture(source: CurrentPcb209RatlinePcbBootstrapOwner, sourcePacket: CurrentPcb209RatlinePcbBootstrapPacket,
    creation: CurrentPcb209RatlinePcbCreation, construction: CurrentPcb209RatlineCreationPacket, child: CurrentPcb209RatlineBootstrapOwner): Promise<void> {
    need(!this.#consumed, "CONSUMED"); this.#consumed = true;
    need(!types.isProxy(source) && Object.getPrototypeOf(source) === CurrentPcb209RatlinePcbBootstrapOwner.prototype &&
      !types.isProxy(creation) && Object.getPrototypeOf(creation) === CurrentPcb209RatlinePcbCreation.prototype &&
      !types.isProxy(child) && Object.getPrototypeOf(child) === CurrentPcb209RatlineBootstrapOwner.prototype && construction.role === "pcb", "ORIGINAL_OWNERS");
    const current = async (): Promise<Readonly<{ parentDebuggerId: string; first: Awaited<ReturnType<typeof firstScript>>; constructor: Awaited<ReturnType<typeof constructorObservation>> }>> => {
      await this.#current(); const parentDebuggerId = await sourceDebugger.call(source, sourcePacket);
      const first = await firstScript.call(child, creation, construction), original = await constructorObservation.call(creation, construction);
      await this.#current(); need(original.parentSessionId === sourcePacket.sessionId && original.scriptId === sourcePacket.scriptId, "PARENT_BINDING");
      return { parentDebuggerId, first, constructor: original };
    };
    const input = await current();
    this.#evidence = captureCurrentPcb209RatlineOriginEvidence({ metadata: { parentDebuggerId: input.parentDebuggerId,
      childDebuggerId: input.first.debuggerId, childUniqueContextId: input.first.uniqueContextId, childScriptId: input.first.scriptId,
      childUrl: input.first.url, parentSessionId: input.constructor.parentSessionId, parentScriptId: input.constructor.scriptId },
      firstPause: input.first.pause, constructorBefore: input.constructor.before, constructorAfter: input.constructor.after, stackReply: null });
    this.#summary = inspectCurrentPcb209RatlineOriginEvidence(this.#evidence);
    const nativeId = currentPcb209RatlineObservedExternalId(this.#evidence);
    if (nativeId !== null) {
      await current();
      const raw = await bounded(this.#dependency.request({ method: "Debugger.getStackTrace", sessionId: sourcePacket.sessionId, params: { stackTraceId: nativeId } }));
      this.#evidence = captureCurrentPcb209RatlineOriginEvidence({ ...this.#evidence, stackReply: raw });
      // Retain the complete reply even if the following original-owner proof fails.
      this.#summary = inspectCurrentPcb209RatlineOriginEvidence(this.#evidence); await current();
    }
  }
}
