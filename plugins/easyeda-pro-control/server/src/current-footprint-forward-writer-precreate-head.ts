/** Same-writer head-age preparation under the original pre-Create guard
 * interval. The caller retains this owner before observe() and joins its exact
 * pending operation after original termination, before releasing the helper. */
import { sha256Json } from "./core.ts";
import { requireCurrentFootprintForwardWriterOpeningInput } from "./current-footprint-forward-writer-opening.ts";
import type { CurrentFootprintForwardWriterOpeningProvider } from "./current-footprint-forward-writer-opening.ts";
import { currentFootprintForwardWriterMainGenerationExited, requireCurrentFootprintForwardWriterMainNativeOwner } from "./current-footprint-forward-writer-main-capability.ts";
import type { CurrentFootprintForwardWriterMainCapability } from "./current-footprint-forward-writer-main-capability.ts";
import type { CurrentFootprintForwardWriterMainRequestOrigin } from "./current-footprint-forward-writer-main-origin.ts";
import { requireOriginalCurrentFootprintForwardWriterProducerInterval } from "./current-footprint-forward-writer-producer-interval.ts";
import type { CurrentFootprintForwardWriterProducerInterval } from "./current-footprint-forward-writer-producer-interval.ts";
import { CurrentFootprintForwardWriterNativeOwner } from "./current-pcb-diagnostic-owner.ts";
import { captureCurrentFootprintForwardExecutionPrototypes, captureCurrentFootprintForwardExecutionReceiver } from "./current-footprint-forward-execution-opening-identity.ts";
import type { CurrentFootprintForwardHeadAgeObservation } from "./current-footprint-forward-head-age.ts";

const nativePrototype = captureCurrentFootprintForwardExecutionPrototypes(CurrentFootprintForwardWriterNativeOwner.prototype);
const nativeMethods = ["observeForwardHeadAge", "requireOriginalForwardHeadAge", "originalFootprintForwardWriterSource", "requireOriginalForwardWriterMainRunner"] as const;
type Input = Awaited<ReturnType<typeof requireCurrentFootprintForwardWriterOpeningInput>>;
export interface CurrentFootprintForwardWriterPrecreateHead {
 readonly profile: "private.current-footprint-forward-writer-precreate-head.v1";
 readonly sourceInputSha256: string; readonly nativeAgeRequired: boolean;
 readonly originalHeadRetained: true; readonly executionAuthorized: false; readonly saveAuthorized: false;
}
interface Bindings { readonly input: Input; readonly age: CurrentFootprintForwardHeadAgeObservation | null }
const originals = new WeakMap<CurrentFootprintForwardWriterPrecreateHead, Readonly<{ owner: CurrentFootprintForwardWriterPrecreateHeadOwner; read: (provider: CurrentFootprintForwardWriterOpeningProvider, capability: CurrentFootprintForwardWriterMainCapability, interval: CurrentFootprintForwardWriterProducerInterval, mainOrigin?: CurrentFootprintForwardWriterMainRequestOrigin) => Readonly<Bindings> }>>();
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`FORWARD_WRITER_PRECREATE_HEAD_${code}`); } }
export class CurrentFootprintForwardWriterPrecreateHeadOwner {
 readonly #provider: CurrentFootprintForwardWriterOpeningProvider; readonly #capability: CurrentFootprintForwardWriterMainCapability; readonly #interval: CurrentFootprintForwardWriterProducerInterval;
 #input: Input | null = null; #age: CurrentFootprintForwardHeadAgeObservation | null = null; #packet: CurrentFootprintForwardWriterPrecreateHead | null = null;
 #pending: Promise<CurrentFootprintForwardWriterPrecreateHead> | null = null; #nativeCurrent: (() => void) | null = null; #failed = false; #ended = false;
 public constructor(provider: CurrentFootprintForwardWriterOpeningProvider, capability: CurrentFootprintForwardWriterMainCapability, interval: CurrentFootprintForwardWriterProducerInterval) {
  this.#provider = provider; this.#capability = capability; this.#interval = interval; Object.freeze(this);
 }
 #current(mainOrigin?: CurrentFootprintForwardWriterMainRequestOrigin): void {
  need(!this.#ended && !this.#failed && this.#input !== null, "ORIGINAL_INPUT"); this.#nativeCurrent?.(); const input = this.#input, main = input.source.main;
  need(main !== null && requireCurrentFootprintForwardWriterMainNativeOwner(this.#capability, main, "normal") === input.owner, "ORIGINAL_MAIN");
  requireOriginalCurrentFootprintForwardWriterProducerInterval(this.#interval, input.owner, this.#capability, mainOrigin);
  const source = input.owner.originalFootprintForwardWriterSource(); need(source.source === input.source.source && source.opening === input.source.opening && source.result === input.source.result &&
   source.owned.copyPlan === input.source.owned.copyPlan && source.owned.before === input.source.owned.before && source.main === main, "ORIGINAL_SOURCE");
  if (this.#age !== null) { input.owner.requireOriginalForwardHeadAge(this.#age); }
 }
 async #published(mainOrigin?: CurrentFootprintForwardWriterMainRequestOrigin): Promise<void> {
  this.#current(mainOrigin); const current = await requireCurrentFootprintForwardWriterOpeningInput(this.#provider); this.#current(mainOrigin);
  need(this.#input !== null && current.owner === this.#input.owner && current.result === this.#input.result && current.source.main === this.#input.source.main && current.source.source === this.#input.source.source && current.headReference === this.#input.headReference, "ORIGINAL_PUBLICATION");
 }
 /** One original attempt, retained before the first provider/native await. */
 public observe(): Promise<CurrentFootprintForwardWriterPrecreateHead> {
  need(this.#pending === null && !this.#ended, "CONSUMED"); const completion = Promise.withResolvers<CurrentFootprintForwardWriterPrecreateHead>(); this.#pending = completion.promise;
  void (async (): Promise<void> => { try { completion.resolve(await this.#observe()); } catch (error) { this.#failed = true; completion.reject(error); } })(); return completion.promise;
 }
 async #observe(): Promise<CurrentFootprintForwardWriterPrecreateHead> {
  this.#input = await requireCurrentFootprintForwardWriterOpeningInput(this.#provider); const input = this.#input;
  this.#nativeCurrent = captureCurrentFootprintForwardExecutionReceiver(input.owner, nativePrototype, nativeMethods); this.#current(); await this.#published();
  if (input.headReference.nativeAgeRequired) { this.#age = await input.owner.observeForwardHeadAge(); this.#current(); await this.#published(); }
  const packet = Object.freeze({ profile: "private.current-footprint-forward-writer-precreate-head.v1" as const, sourceInputSha256: sha256Json(input.result), nativeAgeRequired: input.headReference.nativeAgeRequired,
   originalHeadRetained: true as const, executionAuthorized: false as const, saveAuthorized: false as const }); this.#packet = packet;
  originals.set(packet, Object.freeze({ owner: this, read: (provider: CurrentFootprintForwardWriterOpeningProvider, capability: CurrentFootprintForwardWriterMainCapability, interval: CurrentFootprintForwardWriterProducerInterval, mainOrigin?: CurrentFootprintForwardWriterMainRequestOrigin): Readonly<Bindings> => {
   need(provider === this.#provider && capability === this.#capability && interval === this.#interval && packet === this.#packet, "ORIGINAL_CONTEXT"); this.#current(mainOrigin); return Object.freeze({ input, age: this.#age });
  } })); return packet;
 }
 /** Join this original operation only after actual original generation exit.
  * No pending call is retried and no native resource or owner is transferred. */
 public async joinAfterOriginalExit(): Promise<void> {
  need(!this.#ended && this.#pending !== null, "ORIGINAL_EXIT_CONTEXT");
  if (this.#input === null) { await Promise.allSettled([this.#pending]); }
  if (this.#input === null) { need(this.#failed, "ORIGINAL_METADATA_SETTLEMENT"); this.#ended = true; return; }
  need(this.#input.source.main !== null, "ORIGINAL_EXIT_CONTEXT");
  need(currentFootprintForwardWriterMainGenerationExited(this.#capability, this.#input.source.main), "ORIGINAL_GENERATION_LIVE");
  if (this.#pending !== null) { await Promise.allSettled([this.#pending]); } this.#ended = true;
 }
}
export function requireOriginalCurrentFootprintForwardWriterPrecreateHead(packet: CurrentFootprintForwardWriterPrecreateHead, provider: CurrentFootprintForwardWriterOpeningProvider,
 capability: CurrentFootprintForwardWriterMainCapability, interval: CurrentFootprintForwardWriterProducerInterval, mainOrigin?: CurrentFootprintForwardWriterMainRequestOrigin): Readonly<Bindings> {
 const original = originals.get(packet); need(original !== undefined, "ORIGINAL_PACKET"); return original.read(provider, capability, interval, mainOrigin);
}
