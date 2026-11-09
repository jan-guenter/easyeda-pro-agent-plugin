/** Retain the actual native-task invocation's original Promise and complete
 * pipe reply across its genuine settlement. Metadata alone issues no Job. */
import { types } from "node:util";
import { z } from "zod";
import { captureCurrentFootprintInversePreferenceReply as capture } from "./current-footprint-inverse-public-preferences-replies.ts";

interface Bindings {
  readonly request: Promise<unknown>;
  readonly current: () => void;
  readonly assertOriginalInvocation: (original: Promise<unknown>) => void;
  readonly originalReply: (original: Promise<unknown>) => unknown;
  readonly assertOriginalExit: () => void;
}
export interface CurrentFootprintInverseNativeGetTaskInvocationPromise { readonly objectId: string }
const handle = z.string().regex(/^[A-Za-z\d_.:-]{1,256}$/u);
const reply = z.strictObject({ result: z.strictObject({ type: z.literal("object"), subtype: z.literal("promise"), className: z.literal("Promise"), description: z.literal("Promise"), objectId: handle }) });
const originals = new WeakSet<object>();
function need(value: boolean): asserts value { if (!value) { throw new Error("INVERSE_NATIVE_GET_TASK_INVOCATION_CUSTODY"); } }
/** Observe only the retained original request. The same pipe slot must reprove
 * both before and after await; there is no replacement invocation or synthetic
 * resolution. Its remote Promise still needs a live JS identity/metadata join. */
export class CurrentFootprintInverseNativeGetTaskInvocationCustody {
  readonly #b: Bindings;
  readonly #settlement: Promise<void>;
  #failed = false; #raw: unknown = null; #fingerprint: string | null = null;
  #promise: CurrentFootprintInverseNativeGetTaskInvocationPromise | null = null;
  /** Capture this owner's same actual invocation before its continuation.
   * A rejection is retained and handled until original-exit cleanup joins it. */
  public constructor(bindings: Bindings) { const retained = Object.freeze({ ...bindings }); this.#b = retained; originals.add(this); this.#current(); this.#settlement = (async (): Promise<void> => { try { const raw = await retained.request; this.#current(); need(retained.originalReply(retained.request) === raw && this.#raw === null); const parsed = reply.parse(capture(raw)); this.#raw = raw; this.#fingerprint = JSON.stringify(parsed); this.#promise = Object.freeze({ objectId: parsed.result.objectId }); this.#current(); } catch { this.#failed = true; } })(); }
  /** Reprove the original slot, owner and complete descriptor-safe packet.
   * Equal JSON, altered metadata or a foreign Promise permanently refuses. */
  #current(): void { try { this.#b.current(); need(!this.#failed); this.#b.assertOriginalInvocation(this.#b.request); if (this.#raw !== null) { const parsed = reply.parse(capture(this.#raw)); need(this.#b.originalReply(this.#b.request) === this.#raw && JSON.stringify(parsed) === this.#fingerprint); } } catch (caughtError) { this.#failed = true; throw caughtError; } }
  /** Check only ongoing original invocation custody; this supplies no remote
   * Promise, accepted worker event, body execution or runtime Job permit. */
  public requireCurrent(): void { this.#current(); }
  /** Allow the owner to pump the same original transport until its retained
   * observer settled. This status supplies no remote identity or Job grant. */
  public hasOriginalPromise(): boolean { this.#current(); return this.#promise !== null; }
  /** Join the same original settlement and expose its actual remote handle.
   * The caller must separately prove it is the retained source return value. */
  public async requireOriginalPromise(): Promise<CurrentFootprintInverseNativeGetTaskInvocationPromise> { this.#current(); await this.#settlement; this.#current(); need(this.#promise !== null); return this.#promise; }
  /** Require this same retained Promise record after later asynchronous work. */
  public requireOriginalPromiseRecord(value: CurrentFootprintInverseNativeGetTaskInvocationPromise): void { this.#current(); need(value === this.#promise && this.#raw !== null); }
  /** Join the same request observer only after actual original root/Job exit. */
  public async settleAfterOriginalExit(): Promise<void> { this.#b.assertOriginalExit(); this.#failed = true; await Promise.allSettled([this.#settlement]); this.#b.assertOriginalExit(); }
}
const methods = Object.getOwnPropertyDescriptors(CurrentFootprintInverseNativeGetTaskInvocationCustody.prototype);
/** Refuse copied instances, Proxy traps and substituted prototype members. */
export function assertOriginalCurrentFootprintInverseNativeGetTaskInvocationCustody(value: CurrentFootprintInverseNativeGetTaskInvocationCustody): void { need(value !== null && typeof value === "object" && !types.isProxy(value) && originals.has(value) && Object.getPrototypeOf(value) === CurrentFootprintInverseNativeGetTaskInvocationCustody.prototype && Reflect.ownKeys(value).length === 0); const observed = Object.getOwnPropertyDescriptors(CurrentFootprintInverseNativeGetTaskInvocationCustody.prototype); need(Reflect.ownKeys(observed).length === Reflect.ownKeys(methods).length && Object.entries(methods).every(([name, d]) => { const now = observed[name]; return now !== undefined && now.value === d.value && now.get === d.get && now.set === d.set && now.writable === d.writable && now.enumerable === d.enumerable && now.configurable === d.configurable; })); }
