/** Event routing for a future separately admitted continuation purpose. The
 * original native pipe still owns global accounting and command admission.
 * These retained realm handles identify event ancestry, never a JS Worker. */
import { types } from "node:util";
import { z } from "zod";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import type { CurrentPcbWorkerStartupParent } from "./current-pcb-worker-startup-channel.ts";
import type { CurrentPcbWorkerStartupEvent } from "./current-pcb-worker-startup-contract.ts";
import { currentPcb209RatlineRetirementConsumer } from "./current-pcb-209-ratline-continuation-handoff.ts";
import type { CurrentPcb209RatlineContinuationHandoff } from "./current-pcb-209-ratline-continuation-handoff.ts";

export type CurrentPcb209RatlineContinuationRole = "pcb" | "worker" | "subordinate";
export interface CurrentPcb209RatlineContinuationRealm {
  readonly role: CurrentPcb209RatlineContinuationRole;
  readonly targetId: string;
  readonly sessionId: string;
}
export interface CurrentPcb209RatlineContinuationListener {
  readonly event: (event: CurrentPcbWorkerStartupEvent, realm: CurrentPcb209RatlineContinuationRealm) => void;
  readonly lost: () => void;
}
export interface CurrentPcb209RatlineContinuationRoutingDependency {
  readonly requireOriginalParent: () => Promise<CurrentPcbWorkerStartupParent>;
  readonly assertOriginalTermination: () => Promise<void>;
  /** Only the original continuation stream, after prelude background routing.
   * The pipe owner retains its cumulative byte, event and request ledger. */
  readonly subscribe: (listener: Readonly<{ event: (event: CurrentPcbWorkerStartupEvent) => void; lost: () => void }>) => () => void;
}
interface Realm {
  readonly handle: CurrentPcb209RatlineContinuationRealm;
  listener: CurrentPcb209RatlineContinuationListener | null;
  members: readonly unknown[] | null;
  events: number;
  bytes: number;
}
const token = z.string().regex(/^[A-Za-z\d_.:-]{1,128}$/u);
const parentSchema = z.object({ targetId: token, sessionId: token, nextRequestId: z.number().int().positive() }).strict();
const eventSchema = z.object({ method: z.string().min(1).max(128), sessionId: token, params: z.record(z.string(), z.unknown()) }).strict();
const targetInfo = z.looseObject({ targetId: token, type: z.literal("worker"), attached: z.literal(true), title: z.string().max(4096), url: z.string().max(4096) });
const attachment = z.object({ sessionId: token, waitingForDebugger: z.literal(true), targetInfo }).strict();
// These are local routing ceilings, not additional native allowances. Adoption
// Requires deriving the subordinate's reservation in the original launch ledger.
const limits = Object.freeze({ pcb: { events: 4096, bytes: 8 * 1024 * 1024 },
  worker: { events: 128, bytes: 256 * 1024 }, subordinate: { events: 128, bytes: 256 * 1024 } });
async function bounded<T>(work: Promise<T>): Promise<T> {
  const expired = Promise.withResolvers<never>(), timer = setTimeout(() => { expired.reject(new Error("PCB209_RATLINE_CONTINUATION_ROUTER_DEADLINE")); }, 2500);
  try { return await Promise.race([work, expired.promise]); } finally { clearTimeout(timer); }
}
function need(value: boolean, code: string): asserts value { if (!value) { throw new Error(`PCB209_RATLINE_CONTINUATION_ROUTER_${code}`); } }
function members(value: unknown, keys: readonly string[]): readonly unknown[] {
  need(value !== null && typeof value === "object" && !types.isProxy(value) && Object.getPrototypeOf(value) === Object.prototype, "DEPENDENCY");
  need(Reflect.ownKeys(value).length === keys.length, "DEPENDENCY");
  return keys.map(key => { const field = Object.getOwnPropertyDescriptor(value, key);
    need(field !== undefined && Object.hasOwn(field, "value") && typeof field.value === "function", "DEPENDENCY"); return field.value as unknown; });
}
const dependencyKeys = ["requireOriginalParent", "assertOriginalTermination", "subscribe"] as const, listenerKeys = ["event", "lost"] as const;
export class CurrentPcb209RatlineContinuationRouter {
  readonly #dependency: CurrentPcb209RatlineContinuationRoutingDependency;
  readonly #members: readonly unknown[];
  readonly #realms = new Map<CurrentPcb209RatlineContinuationRole, Realm>();
  readonly #retiring = new Set<CurrentPcb209RatlineContinuationRole>();
  readonly #handoff: CurrentPcb209RatlineContinuationHandoff | null;
  readonly #consumeRetirement: ((event: CurrentPcbWorkerStartupEvent) => boolean) | null;
  #parent: CurrentPcbWorkerStartupParent | null = null;
  #started = false;
  #failure: string | null = null;
  #released = false;
  #releasing = false;
  #unsubscribe: (() => void) | null = null;
  #subscriptionAttempted = false;
  #subscriptionReturned = false;
  #unsubscribeConsumed = false;
  #terminationVerified = false;
  #cleanupFailure: "SUBSCRIPTION_UNCERTAIN" | "UNSUBSCRIBE_FAILED" | null = null;
  public constructor(dependency: CurrentPcb209RatlineContinuationRoutingDependency, handoff: CurrentPcb209RatlineContinuationHandoff | null = null) {
    this.#members = members(dependency, dependencyKeys); this.#dependency = dependency; this.#handoff = handoff; this.#consumeRetirement = handoff === null ? null : currentPcb209RatlineRetirementConsumer(handoff);
  }
  #same(): void { need(members(this.#dependency, dependencyKeys).every((value, index) => value === this.#members[index]), "DEPENDENCY_CHANGED"); }
  #active(): void { this.#same(); need(this.#started && this.#parent !== null && !this.#released && !this.#releasing && !this.#terminationVerified && this.#cleanupFailure === null && this.#failure === null, "NOT_CURRENT"); }
  #retain(role: CurrentPcb209RatlineContinuationRole, targetId: string, sessionId: string): Realm {
    need(!this.#realms.has(role) && [...this.#realms.values()].every(value => value.handle.targetId !== targetId && value.handle.sessionId !== sessionId), "DUPLICATE_REALM");
    const value: Realm = { handle: Object.freeze({ role, targetId, sessionId }), listener: null, members: null, events: 0, bytes: 0 };
    this.#realms.set(role, value); return value;
  }
  #original(handle: CurrentPcb209RatlineContinuationRealm): Realm {
    const value = [...this.#realms.values()].find(realm => realm.handle === handle); need(value !== undefined, "ORIGINAL_REALM"); return value;
  }
  #listen(realm: Realm, listener: CurrentPcb209RatlineContinuationListener): void {
    need(this.#original(realm.handle) === realm && realm.listener === null, "LISTENER_CONSUMED"); realm.members = members(listener, listenerKeys); realm.listener = listener;
  }
  #poison(code: string): void {
    if (this.#failure !== null) { return; } this.#failure = code;
    for (const realm of this.#realms.values()) {
      const callback = realm.members?.[1];
      if (typeof callback === "function") { try { Reflect.apply(callback, realm.listener, []); } catch {
        // Preserve the original routing failure; callback exceptions grant no route.
      } }
    }
  }
  public async start(listener: CurrentPcb209RatlineContinuationListener): Promise<CurrentPcb209RatlineContinuationRealm> {
    need(!this.#started, "START_CONSUMED"); this.#started = true;
    try {
      this.#same(); const original = await bounded(this.#dependency.requireOriginalParent()); this.#same();
      need(!this.#released && !this.#releasing && this.#failure === null, "START_INTERRUPTED");
      need(original !== null && typeof original === "object" && !types.isProxy(original) && Object.isFrozen(original), "ORIGINAL_PARENT");
      const parent = parentSchema.parse(captureCurrentPcbStringClockReply(original).value); this.#parent = original;
      const realm = this.#retain("pcb", parent.targetId, parent.sessionId); this.#listen(realm, listener);
      this.#subscriptionAttempted = true;
      this.#unsubscribe = this.#dependency.subscribe({ event: this.#event, lost: (): void => { if (!this.#terminationVerified) { this.#poison("STREAM_LOST"); } } });
      need(typeof this.#unsubscribe === "function", "SUBSCRIPTION"); this.#subscriptionReturned = true; this.#active(); return realm.handle;
    } catch (error) { this.#poison("START"); throw error; }
  }
  /** The actual attachment must already be retained. This issues routing only;
   * creation/source owners still prove their own packets and start readiness. */
  public claimOriginalChild(parent: CurrentPcb209RatlineContinuationRealm, listener: CurrentPcb209RatlineContinuationListener): CurrentPcb209RatlineContinuationRealm {
    this.#active(); const original = this.#original(parent);
    need(original.handle.role !== "subordinate", "DEPTH");
    const role = original.handle.role === "pcb" ? "worker" : "subordinate"; const child = this.#realms.get(role);
    need(child !== undefined, "ORIGINAL_ATTACHMENT"); this.#listen(child, listener); return child.handle;
  }
  public async requireOriginal(handle: CurrentPcb209RatlineContinuationRealm): Promise<void> {
    try { this.#active(); need(!this.#retiring.has(handle.role), "REALM_RETIRED"); const realm = this.#original(handle); const original = await bounded(this.#dependency.requireOriginalParent());
      this.#active(); need(original === this.#parent && this.#original(handle) === realm, "ORIGINAL_PARENT");
      need(!this.#retiring.has(handle.role), "REALM_RETIRED");
    } catch (error) { this.#poison("OWNER_CHANGED"); throw error; }
  }
  public retireOriginalRealm(role: "worker" | "subordinate", sessionId: string): void {
    this.#active(); const realm = this.#realms.get(role);
    need(this.#handoff !== null && realm?.handle.sessionId === sessionId && !this.#retiring.has(role), "RETIREMENT_STATE"); this.#retiring.add(role);
  }
  readonly #event = (input: CurrentPcbWorkerStartupEvent): void => {
    if (this.#terminationVerified) { return; }
    try {
      this.#active(); const captured = captureCurrentPcbStringClockReply(input), event = eventSchema.parse(captured.value);
      const realm = [...this.#realms.values()].find(value => value.handle.sessionId === event.sessionId); need(realm !== undefined, "EVENT_SESSION");
      realm.events += 1; realm.bytes += Buffer.byteLength(captured.text);
      need(realm.events <= limits[realm.handle.role].events && realm.bytes <= limits[realm.handle.role].bytes, "EVENT_BUDGET");
      if (this.#consumeRetirement?.(event) === true) { this.#active(); return; }
      need(!this.#retiring.has(realm.handle.role), "RETIRED_REALM_EVENT");
      const listener = realm.listener; need(listener !== null && realm.members !== null, "LISTENER_REQUIRED");
      need(members(listener, listenerKeys).every((value, index) => value === realm.members?.[index]), "LISTENER_CHANGED");
      if (event.method === "Target.attachedToTarget") {
        need(realm.handle.role !== "subordinate", "DEPTH"); const child = attachment.parse(event.params);
        this.#retain(realm.handle.role === "pcb" ? "worker" : "subordinate", child.targetInfo.targetId, child.sessionId);
      }
      listener.event(event, realm.handle); this.#active();
    } catch { this.#poison("EVENT_OR_CALLBACK"); }
  };
  public abort(): void { this.#same(); need(!this.#released, "RELEASED"); this.#poison("ABORTED"); }
  /** Neither detach notifications nor exhausted callbacks replace original root
   * and Job exit proof. A refused proof leaves the subscription and handles held. */
  public async releaseAfterTermination(): Promise<void> {
    this.#same(); need(!this.#released && !this.#releasing && this.#cleanupFailure === null, "RELEASE_STATE"); this.#releasing = true;
    try {
      await bounded(this.#dependency.assertOriginalTermination()); this.#same(); this.#terminationVerified = true;
      if (this.#subscriptionAttempted && !this.#subscriptionReturned) {
        this.#cleanupFailure = "SUBSCRIPTION_UNCERTAIN"; this.#poison("SUBSCRIPTION_UNCERTAIN");
        throw new Error("PCB209_RATLINE_CONTINUATION_ROUTER_SUBSCRIPTION_UNCERTAIN");
      }
      if (this.#unsubscribe !== null) {
        const unsubscribe = this.#unsubscribe; this.#unsubscribe = null; this.#unsubscribeConsumed = true;
        try { unsubscribe(); } catch (error) {
          this.#cleanupFailure = "UNSUBSCRIBE_FAILED"; this.#poison("UNSUBSCRIBE_FAILED");
          throw new Error("PCB209_RATLINE_CONTINUATION_ROUTER_UNSUBSCRIBE_FAILED", { cause: error });
        }
      }
      this.#released = true;
    } finally { this.#releasing = false; }
  }
  public status(): Readonly<{ started: boolean; released: boolean; firstFailure: string | null;
    terminationVerified: boolean; subscriptionUncertain: boolean; unsubscribeConsumed: boolean; cleanupFailure: "SUBSCRIPTION_UNCERTAIN" | "UNSUBSCRIBE_FAILED" | null;
    realms: readonly Readonly<{ role: CurrentPcb209RatlineContinuationRole; listenerClaimed: boolean; events: number; bytes: number }>[];
    sourceQualified: false; nativeWorkerTargetIdentityVerified: false; executionAuthorized: false }> {
    return Object.freeze({ started: this.#started, released: this.#released, firstFailure: this.#failure,
      terminationVerified: this.#terminationVerified, subscriptionUncertain: this.#subscriptionAttempted && !this.#subscriptionReturned,
      unsubscribeConsumed: this.#unsubscribeConsumed, cleanupFailure: this.#cleanupFailure,
      realms: Object.freeze([...this.#realms.values()].map(value => Object.freeze({ role: value.handle.role, listenerClaimed: value.listener !== null, events: value.events, bytes: value.bytes }))),
      sourceQualified: false, nativeWorkerTargetIdentityVerified: false, executionAuthorized: false });
  }
}
