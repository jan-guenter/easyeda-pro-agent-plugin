/** One consumed source-reading stage over original private owner methods.
 * The mounted owner supplies the fixed native-cache-equivalent reader; the
 * direct GET_STR variant remains an offline leaf without native dispatch.
 */
import { types } from "node:util";
import { canonicalJson, sha256Text } from "./core.ts";
import { expectedCurrentFootprintCopySource, verifyCurrentFootprintCopySource } from "./current-footprint-copy-append.ts";
import type { CurrentFootprintCopyAppendPlan } from "./current-footprint-copy-append.ts";
import { currentFootprintCopyStatePacketSchema, decodeCurrentFootprintCopyState } from "./current-footprint-copy-state.ts";
import type { CurrentFootprintCopyStatePacket } from "./current-footprint-copy-state.ts";
import { CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS, captureCurrentFootprintCopySourceReadReply,
  currentFootprintCopySourceReadRequestSchema, decodeCurrentFootprintCopySourceRead } from "./current-footprint-copy-source-read.ts";
import type { CurrentFootprintCopySourceReadRequest, CurrentFootprintCopySourceReadSample } from "./current-footprint-copy-source-read.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { z } from "zod";

/** Source-derived shared native request reservation. Qualification uses3 prior
 * state requests,19 method/factory descriptor reads and5 final state requests.
 * Four source bracket states use5 requests each. Each source read uses
 * 2 assignment +4 method/factory rechecks +1 async read. Each opening delegate
 * adds a project-identity read and an assignment recheck. The32 cleanup slots
 * remain separate. */
export const CURRENT_FOOTPRINT_COPY_SOURCE_STAGE_REQUESTS = 3 + 19 + 5 + 4 * 5 + 2 * 7 + 2 * 2;

/** Aggregate host wrappers include each bounded owner check and command in the
 * original construction callbacks. Inner transport checks overlap the command
 * bounds. Native8s, individual async10s and ordinary2s limits are unchanged. */
export const CURRENT_FOOTPRINT_COPY_SOURCE_STAGE_TIMING = Object.freeze({
  stateCallbackMs: 13 * 2000 + 5 * 2000 + 2000,
  sourceCallbackMs: 16 * 2000 + 6 * 2000 + CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS.hostTimeoutMs + 2000,
});

/** Trusted original owner's methods, not caller JSON or reconstructed handles.
 * assertOriginalState must reprove the original state packet and retained
 * manager/PROJECT/bus/consistency relationship. readSource must use its original
 * constructor and method bundles and the exact fixed route. The mounted cache
 * reader invokes no vendor getter/compressor or cache writer. Its owner must
 * publish durable intent before constructing this runner; this leaf supplies
 * neither original native bindings nor publication authority.
 */
export interface CurrentFootprintCopySourceReadTransport {
  readonly assertOriginalState: (state: CurrentFootprintCopyStatePacket) => Promise<void>;
  readonly observeState: () => Promise<unknown>;
  readonly readSource: (request: CurrentFootprintCopySourceReadRequest) => Promise<unknown>;
}
export const currentFootprintCopySourceReadPacketSchema = z.object({
  profile: z.literal("private.current-footprint-copy-source-read.v1"), request: currentFootprintCopySourceReadRequestSchema,
  content: z.string().min(1).max(CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS.contentBytes).refine(value =>
    value.isWellFormed() && Buffer.byteLength(value) <= CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS.contentBytes),
  sourceSha256: z.string().regex(/^[a-f0-9]{64}$/u), sourceSamples: z.literal(2), stateSamples: z.literal(4),
  route: z.enum(["native-get-str", "native-cache-equivalent"]), sourceGetterDispatched: z.boolean(),
  cacheRead: z.object({ keys: z.number().int().min(0).max(64), bytes: z.number().int().min(0).max(8_388_608),
    atoms: z.number().int().min(0).max(4096) }).strict().optional(), cacheWrites: z.literal(0).optional(), networkRequests: z.literal(0).optional(),
  sourceGetterEquivalent: z.literal(true), cacheEffectsPossible: z.boolean(), cacheBranchObserved: z.literal(false),
  producerBindingVerified: z.literal(false), executionAuthorized: z.literal(false), persistenceVerified: z.literal(false),
}).strict().refine(value => sha256Text(value.content) === value.sourceSha256 &&
  value.sourceGetterDispatched === (value.route === "native-get-str") && value.cacheEffectsPossible === (value.route === "native-get-str") &&
  (value.route === "native-cache-equivalent" ? value.cacheRead !== undefined && value.cacheWrites === 0 && value.networkRequests === 0 :
    value.cacheRead === undefined && value.cacheWrites === undefined && value.networkRequests === undefined),
"Source route, effects or complete content hash differ.");
export type CurrentFootprintCopySourceReadPacket = Readonly<z.infer<typeof currentFootprintCopySourceReadPacketSchema>>;
type Phase = "ready" | "observing" | "completed" | "failed";
function need(condition: boolean, detail: string): asserts condition {
  if (!condition) { throw new Error(`CURRENT_FOOTPRINT_COPY_SOURCE_READ: ${detail}`); }
}
function methods(input: CurrentFootprintCopySourceReadTransport): readonly unknown[] {
  need(input !== null && typeof input === "object" && !types.isProxy(input) && !Array.isArray(input) &&
    (Object.getPrototypeOf(input) === Object.prototype || Object.getPrototypeOf(input) === null), "plain original transport required");
  const keys = ["assertOriginalState", "observeState", "readSource"] as const;
  need(Reflect.ownKeys(input).length === keys.length && Reflect.ownKeys(input).every(key => keys.some(member => member === key)), "transport fields differ");
  return keys.map(key => {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && typeof descriptor.value === "function", "original transport methods required");
    return descriptor.value as unknown;
  });
}
async function bounded<T>(promise: Promise<T>, limitMs: number = CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS.hostTimeoutMs): Promise<T> {
  const deadline = Promise.withResolvers<never>();
  const timer = setTimeout(() => { deadline.reject(new Error("CURRENT_FOOTPRINT_COPY_SOURCE_READ_HOST_DEADLINE")); }, limitMs);
  try { return await Promise.race([promise, deadline.promise]); } finally { clearTimeout(timer); }
}

export class CurrentFootprintCopySourceReadRunner {
  readonly #transport: CurrentFootprintCopySourceReadTransport;
  readonly #methods: readonly unknown[];
  readonly #assert: CurrentFootprintCopySourceReadTransport["assertOriginalState"];
  readonly #observeState: CurrentFootprintCopySourceReadTransport["observeState"];
  readonly #read: CurrentFootprintCopySourceReadTransport["readSource"];
  readonly #state: CurrentFootprintCopyStatePacket;
  readonly #append: CurrentFootprintCopyAppendPlan;
  readonly #request: CurrentFootprintCopySourceReadRequest;
  readonly #replies: unknown[] = [];
  #phase: Phase = "ready";
  #sourceCalls = 0;
  #stateCalls = 0;
  #packet: CurrentFootprintCopySourceReadPacket | null = null;
  public constructor(transport: CurrentFootprintCopySourceReadTransport, state: CurrentFootprintCopyStatePacket, append: CurrentFootprintCopyAppendPlan) {
    this.#methods = methods(transport); this.#transport = transport;
    this.#assert = transport.assertOriginalState; this.#observeState = transport.observeState; this.#read = transport.readSource;
    const parsed = currentFootprintCopyStatePacketSchema.parse(captureCurrentPcbStringClockReply(state).value);
    this.#state = state; this.#append = append;
    need(parsed.identity.projectUuid === append.copyPlan.source.projectUuid && parsed.identity.branchUuid === append.copyPlan.source.branchUuid &&
      parsed.maximumTicket === append.maximumTicket, "state and original append plan differ");
    // This pure reader also refuses copied or forged append-plan objects.
    expectedCurrentFootprintCopySource(append, parsed.client, "before-create");
    this.#request = freezeDeep(currentFootprintCopySourceReadRequestSchema.parse({ identity: parsed.identity,
      footprintUuid: append.copyPlan.source.footprintUuid, client: parsed.client, maximumTicket: parsed.maximumTicket }));
  }
  public status(): Readonly<{ phase: Phase; sourceCalls: number; stateCalls: number; receivedReplies: number; executionAuthorized: false }> {
    return Object.freeze({ phase: this.#phase, sourceCalls: this.#sourceCalls, stateCalls: this.#stateCalls,
      receivedReplies: this.#replies.length, executionAuthorized: false });
  }
  public retainedReplies(): readonly unknown[] { return Object.freeze([...this.#replies]); }
  #same(): void { need(methods(this.#transport).every((method, index) => method === this.#methods[index]), "original transport changed"); }
  #alive(): void { need(this.#phase !== "failed", "original lifetime failed"); }
  async #current(): Promise<void> {
    this.#alive(); this.#same();
    await bounded(this.#assert.call(this.#transport, this.#state));
    this.#same(); this.#alive();
  }
  async #stateSample(): Promise<void> {
    await this.#current(); need(this.#stateCalls < CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS.stateCalls, "state budget"); this.#stateCalls += 1;
    const raw = captureCurrentPcbStringClockReply(await bounded(this.#observeState.call(this.#transport),
      CURRENT_FOOTPRINT_COPY_SOURCE_STAGE_TIMING.stateCallbackMs)).value;
    this.#replies.push(raw); await this.#current();
    const state = decodeCurrentFootprintCopyState(raw);
    need(canonicalJson(state.identity) === canonicalJson(this.#request.identity) && state.client === this.#request.client &&
      state.maximumTicket === this.#request.maximumTicket && state.capturedUser === "own-undefined", "state sample changed");
  }
  async #sourceSample(): Promise<CurrentFootprintCopySourceReadSample> {
    await this.#stateSample(); await this.#current();
    need(this.#sourceCalls < CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS.sourceCalls, "source budget"); this.#sourceCalls += 1;
    const raw = captureCurrentFootprintCopySourceReadReply(await bounded(this.#read.call(this.#transport, this.#request),
      CURRENT_FOOTPRINT_COPY_SOURCE_STAGE_TIMING.sourceCallbackMs));
    // Retain malformed or stale-arrival evidence before another awaited check.
    this.#replies.push(raw); await this.#current();
    const sample = decodeCurrentFootprintCopySourceRead(raw);
    need(canonicalJson(sample.identity) === canonicalJson(this.#request.identity) && sample.footprintUuid === this.#request.footprintUuid &&
      sample.client === this.#request.client && sample.maximumTicket === this.#request.maximumTicket, "source sample identity changed");
    verifyCurrentFootprintCopySource(this.#append, this.#request.client, "before-create", sample.content);
    await this.#stateSample(); return sample;
  }
  public async observe(): Promise<CurrentFootprintCopySourceReadPacket> {
    need(this.#phase === "ready", "attempt consumed"); this.#phase = "observing";
    try {
      const first = await this.#sourceSample(), second = await this.#sourceSample();
      need(canonicalJson(first) === canonicalJson(second), "paired source samples differ"); await this.#current();
      need(this.#sourceCalls === 2 && this.#stateCalls === 4, "complete source bracket required");
      this.#packet = freezeDeep({ profile: "private.current-footprint-copy-source-read.v1", request: this.#request,
        content: first.content, sourceSha256: sha256Text(first.content), sourceSamples: 2, stateSamples: 4,
        route: first.route, sourceGetterDispatched: first.sourceGetterDispatched,
        ...(first.cacheRead === undefined ? {} : { cacheRead: first.cacheRead, cacheWrites: first.cacheWrites, networkRequests: first.networkRequests }),
        sourceGetterEquivalent: true, cacheEffectsPossible: first.cacheEffectsPossible, cacheBranchObserved: false,
        producerBindingVerified: false, executionAuthorized: false, persistenceVerified: false });
      this.#phase = "completed"; return this.#packet;
    } catch (error) { this.#phase = "failed"; throw error; }
  }
  public async requireOriginal(packet: CurrentFootprintCopySourceReadPacket): Promise<CurrentFootprintCopySourceReadPacket> {
    need(this.#phase === "completed" && packet === this.#packet, "original completed source packet required");
    try { await this.#current(); return packet; } catch (error) { this.#phase = "failed"; throw error; }
  }
}
