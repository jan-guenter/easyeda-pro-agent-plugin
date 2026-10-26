/** One consumed source-only stage over original private owner methods.
 * Paired samples retain native record order. The independent SQL projection
 * verifies every keyed record without deriving concurrent Map insertion order.
 * This supplies no copy, append, deletion or persistence authority. */
import { types } from "node:util";
import { canonicalJson, sha256Text } from "./core.ts";
import { assertCurrentFootprintSourcePlan, verifyCurrentFootprintSource } from "./current-footprint-source-plan.ts";
import type { CurrentFootprintSourcePlan } from "./current-footprint-source-plan.ts";
import { CURRENT_FOOTPRINT_COPY_SOURCE_STAGE_TIMING } from "./current-footprint-copy-source-read-runner.ts";
import type { CurrentFootprintCopySourceReadTransport } from "./current-footprint-copy-source-read-runner.ts";
import { currentFootprintCopyStatePacketSchema, decodeCurrentFootprintCopyState } from "./current-footprint-copy-state.ts";
import type { CurrentFootprintCopyStatePacket } from "./current-footprint-copy-state.ts";
import { CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS, captureCurrentFootprintCopySourceReadReply,
  currentFootprintCopySourceReadRequestSchema, decodeCurrentFootprintCopySourceRead } from "./current-footprint-copy-source-read.ts";
import type { CurrentFootprintCopySourceReadRequest, CurrentFootprintCopySourceReadSample } from "./current-footprint-copy-source-read.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { z } from "zod";

export const currentFootprintSourceReadPacketSchema = z.object({
  profile: z.literal("private.current-footprint-source-read.v1"), request: currentFootprintCopySourceReadRequestSchema,
  content: z.string().min(1).max(CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS.contentBytes).refine(value =>
    value.isWellFormed() && Buffer.byteLength(value) <= CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS.contentBytes),
  sourceSha256: z.string().regex(/^[a-f0-9]{64}$/u), sourceSamples: z.literal(2), stateSamples: z.literal(4),
  route: z.literal("native-cache-equivalent"), sourceGetterDispatched: z.literal(false),
  cacheRead: z.object({ keys: z.number().int().min(0).max(64), bytes: z.number().int().min(0).max(8_388_608),
    atoms: z.number().int().min(0).max(4096) }).strict(), cacheWrites: z.literal(0), networkRequests: z.literal(0),
  exactKeyedSourceVerified: z.literal(true), comparison: z.literal("complete-checkpoint-records-native-order"), checkpointByteOrderMatched: z.literal(false), nativeOrderStable: z.literal(true),
  keyedRecordsSha256: z.string().regex(/^[a-f0-9]{64}$/u), observedOrderSha256: z.string().regex(/^[a-f0-9]{64}$/u),
  canvasRecords: z.number().int().min(0).max(4096), tombstones: z.number().int().min(0).max(4096),
  cacheEffectsPossible: z.literal(false), cacheBranchObserved: z.literal(false),
  producerBindingVerified: z.literal(false), executionAuthorized: z.literal(false), persistenceVerified: z.literal(false),
}).strict().refine(value => sha256Text(value.content) === value.sourceSha256 &&
  value.tombstones <= value.canvasRecords && value.cacheRead.atoms === value.canvasRecords,
"Complete source hash or record counts differ.");
export type CurrentFootprintSourceReadPacket = Readonly<z.infer<typeof currentFootprintSourceReadPacketSchema>>;
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

export class CurrentFootprintSourceReadRunner {
  readonly #transport: CurrentFootprintCopySourceReadTransport;
  readonly #methods: readonly unknown[];
  readonly #assert: CurrentFootprintCopySourceReadTransport["assertOriginalState"];
  readonly #observeState: CurrentFootprintCopySourceReadTransport["observeState"];
  readonly #read: CurrentFootprintCopySourceReadTransport["readSource"];
  readonly #state: CurrentFootprintCopyStatePacket;
  readonly #plan: CurrentFootprintSourcePlan;
  readonly #request: CurrentFootprintCopySourceReadRequest;
  readonly #replies: unknown[] = [];
  #phase: Phase = "ready";
  #sourceCalls = 0;
  #stateCalls = 0;
  #packet: CurrentFootprintSourceReadPacket | null = null;
  public constructor(transport: CurrentFootprintCopySourceReadTransport, state: CurrentFootprintCopyStatePacket, plan: CurrentFootprintSourcePlan) {
    this.#methods = methods(transport); this.#transport = transport;
    this.#assert = transport.assertOriginalState; this.#observeState = transport.observeState; this.#read = transport.readSource;
    const parsed = currentFootprintCopyStatePacketSchema.parse(captureCurrentPcbStringClockReply(state).value);
    this.#state = state; this.#plan = plan;
    assertCurrentFootprintSourcePlan(plan);
    need(parsed.identity.projectUuid === plan.source.projectUuid && parsed.identity.branchUuid === plan.source.branchUuid &&
      parsed.maximumTicket === plan.maximumTicket, "state and original source plan differ");
    this.#request = freezeDeep(currentFootprintCopySourceReadRequestSchema.parse({ identity: parsed.identity,
      footprintUuid: plan.source.footprintUuid, client: parsed.client, maximumTicket: parsed.maximumTicket }));
  }
  public status(): Readonly<{ phase: Phase; sourceCalls: number; stateCalls: number; receivedReplies: number; executionAuthorized: false }> {
    return Object.freeze({ phase: this.#phase, sourceCalls: this.#sourceCalls, stateCalls: this.#stateCalls,
      receivedReplies: this.#replies.length, executionAuthorized: false });
  }
  public retainedReplies(): readonly unknown[] { return Object.freeze([...this.#replies]); }
  #same(): void { need(methods(this.#transport).every((method, index) => method === this.#methods[index]), "original transport changed"); }
  #alive(): void { need(this.#phase !== "failed", "original lifetime failed"); }
  async #current(): Promise<void> {
    this.#alive(); this.#same(); assertCurrentFootprintSourcePlan(this.#plan);
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
    need(sample.route === "native-cache-equivalent" && !sample.sourceGetterDispatched &&
      !sample.cacheEffectsPossible, "source-only fixed cache route required");
    verifyCurrentFootprintSource(this.#plan, this.#request.client, sample.content);
    await this.#stateSample(); return sample;
  }
  public async observe(): Promise<CurrentFootprintSourceReadPacket> {
    need(this.#phase === "ready", "attempt consumed"); this.#phase = "observing";
    try {
      const first = await this.#sourceSample(), second = await this.#sourceSample();
      need(canonicalJson(first) === canonicalJson(second), "paired source samples differ"); await this.#current();
      need(this.#sourceCalls === 2 && this.#stateCalls === 4, "complete source bracket required");
      const comparison = verifyCurrentFootprintSource(this.#plan, this.#request.client, first.content);
      need(first.cacheRead !== undefined && first.cacheWrites === 0 && first.networkRequests === 0, "fixed cache evidence absent");
      this.#packet = freezeDeep(currentFootprintSourceReadPacketSchema.parse({ profile: "private.current-footprint-source-read.v1", request: this.#request,
        content: first.content, sourceSha256: sha256Text(first.content), sourceSamples: 2, stateSamples: 4,
        route: "native-cache-equivalent", sourceGetterDispatched: false,
        cacheRead: first.cacheRead, cacheWrites: 0, networkRequests: 0,
        exactKeyedSourceVerified: true, comparison: "complete-checkpoint-records-native-order", checkpointByteOrderMatched: false, nativeOrderStable: true,
        keyedRecordsSha256: comparison.keyedRecordsSha256, observedOrderSha256: comparison.observedOrderSha256,
        canvasRecords: comparison.canvasRecords, tombstones: comparison.tombstones,
        cacheEffectsPossible: false, cacheBranchObserved: false,
        producerBindingVerified: false, executionAuthorized: false, persistenceVerified: false }));
      this.#phase = "completed"; return this.#packet;
    } catch (error) { this.#phase = "failed"; throw error; }
  }
  public async requireOriginal(packet: CurrentFootprintSourceReadPacket): Promise<CurrentFootprintSourceReadPacket> {
    need(this.#phase === "completed" && packet === this.#packet, "original completed source packet required");
    try { await this.#current(); return packet; } catch (error) { this.#phase = "failed"; throw error; }
  }
}
