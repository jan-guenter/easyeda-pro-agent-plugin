/** Unmounted copied-destination reader over the maintained native-cache transport.
 * Original callbacks must retain their native state owner. This leaf does not
 * issue a fresh-generation, cache-replay, closure or execution permit. */
import { types } from "node:util";
import { z } from "zod";
import { canonicalJson, sha256Text } from "./core.ts";
import { currentFootprintCopyV2SavedTarget, verifyCurrentFootprintCopyV2SavedSource } from "./current-footprint-copy-v2-saved-source.ts";
import type { CurrentFootprintCopyV2SavedProjection } from "./current-footprint-copy-v2-saved-source.ts";
import { CURRENT_FOOTPRINT_COPY_SOURCE_STAGE_TIMING } from "./current-footprint-copy-source-read-runner.ts";
import type { CurrentFootprintCopySourceReadTransport } from "./current-footprint-copy-source-read-runner.ts";
import { currentFootprintCopyStatePacketSchema, decodeCurrentFootprintCopyState } from "./current-footprint-copy-state.ts";
import type { CurrentFootprintCopyStatePacket } from "./current-footprint-copy-state.ts";
import { CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS, captureCurrentFootprintCopySourceReadReply,
  currentFootprintCopySourceReadRequestSchema, decodeCurrentFootprintCopySourceRead } from "./current-footprint-copy-source-read.ts";
import type { CurrentFootprintCopySourceReadRequest, CurrentFootprintCopySourceReadSample } from "./current-footprint-copy-source-read.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const digest = z.string().length(64).regex(/^[a-f0-9]{64}$/u);
export const currentFootprintCopyV2SavedReadPacketSchema = z.object({
  profile: z.literal("private.current-footprint-copy-v2-saved-read.v1"), request: currentFootprintCopySourceReadRequestSchema,
  content: z.string().min(1).max(CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS.contentBytes).refine(value =>
    value.isWellFormed() && Buffer.byteLength(value) <= CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS.contentBytes),
  contentSha256: digest, afterSqlSha256: digest, creationPlaintextSha256: digest,
  matchedProjection: z.enum(["complete-raw-history", "current-footprint-chunk-cache"]),
  sourceSamples: z.literal(2), stateSamples: z.literal(4), exactContent: z.literal(true),
  route: z.literal("native-cache-equivalent"), sourceGetterDispatched: z.literal(false),
  cacheRead: z.object({ keys: z.number().int().min(0).max(64), bytes: z.number().int().min(0).max(8_388_608),
    atoms: z.number().int().min(0).max(4096) }).strict(),
  canvasRecords: z.number().int().min(0).max(4096), tombstones: z.number().int().min(0).max(4096),
  cacheWrites: z.literal(0), networkRequests: z.literal(0), cacheEffectsPossible: z.literal(false),
  cacheBranchObserved: z.literal(false), producerBindingVerified: z.literal(false), executionAuthorized: z.literal(false),
  completionProved: z.literal(false), generationClosureVerified: z.literal(false), persistentUploadReplayExcluded: z.literal(false),
  reopened: z.literal(false), persistenceVerified: z.literal(false),
}).strict().refine(value => value.contentSha256 === sha256Text(value.content) && value.cacheRead.atoms === value.canvasRecords &&
  value.tombstones <= value.canvasRecords, "Saved content hash or record counts differ.");
export type CurrentFootprintCopyV2SavedReadPacket = Readonly<z.infer<typeof currentFootprintCopyV2SavedReadPacketSchema>>;
type Phase = "ready" | "observing" | "completed" | "failed";
function need(condition: boolean, detail: string): asserts condition {
  if (!condition) { throw new Error(`CURRENT_FOOTPRINT_COPY_V2_SAVED_READ: ${detail}`); }
}
function methods(input: CurrentFootprintCopySourceReadTransport): readonly unknown[] {
  need(input !== null && typeof input === "object" && !types.isProxy(input) && !Array.isArray(input) &&
    (Object.getPrototypeOf(input) === Object.prototype || Object.getPrototypeOf(input) === null), "plain original transport required");
  const keys = ["assertOriginalState", "observeState", "readSource"] as const;
  const actual = Reflect.ownKeys(input);
  need(actual.length === keys.length && actual.every(key => keys.some(member => member === key)), "transport fields differ");
  return keys.map(key => {
    const descriptor = Object.getOwnPropertyDescriptor(input, key);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && typeof descriptor.value === "function", "original transport methods required");
    return descriptor.value as unknown;
  });
}
async function bounded<T>(promise: Promise<T>, limitMs: number = CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS.hostTimeoutMs): Promise<T> {
  const deadline = Promise.withResolvers<never>();
  const timer = setTimeout(() => { deadline.reject(new Error("CURRENT_FOOTPRINT_COPY_V2_SAVED_READ_HOST_DEADLINE")); }, limitMs);
  try { return await Promise.race([promise, deadline.promise]); } finally { clearTimeout(timer); }
}

export class CurrentFootprintCopyV2SavedReadRunner {
  readonly #transport: CurrentFootprintCopySourceReadTransport;
  readonly #methods: readonly unknown[];
  readonly #assert: CurrentFootprintCopySourceReadTransport["assertOriginalState"];
  readonly #observeState: CurrentFootprintCopySourceReadTransport["observeState"];
  readonly #read: CurrentFootprintCopySourceReadTransport["readSource"];
  readonly #state: CurrentFootprintCopyStatePacket;
  readonly #stateText: string;
  readonly #plan: CurrentFootprintCopyV2SavedProjection;
  readonly #request: CurrentFootprintCopySourceReadRequest;
  readonly #replies: unknown[] = [];
  #phase: Phase = "ready";
  #sourceCalls = 0;
  #stateCalls = 0;
  #packet: CurrentFootprintCopyV2SavedReadPacket | null = null;
  public constructor(transport: CurrentFootprintCopySourceReadTransport, state: CurrentFootprintCopyStatePacket,
    plan: CurrentFootprintCopyV2SavedProjection) {
    this.#methods = methods(transport); this.#transport = transport;
    this.#assert = transport.assertOriginalState; this.#observeState = transport.observeState; this.#read = transport.readSource;
    const parsed = currentFootprintCopyStatePacketSchema.parse(captureCurrentPcbStringClockReply(state).value);
    const target = currentFootprintCopyV2SavedTarget(plan);
    need(parsed.identity.projectUuid === target.projectUuid && parsed.identity.branchUuid === target.branchUuid &&
      parsed.maximumTicket === plan.maximumTicket, "state and original saved projection differ");
    this.#state = state; this.#stateText = canonicalJson(parsed); this.#plan = plan;
    this.#request = freezeDeep(currentFootprintCopySourceReadRequestSchema.parse({ identity: parsed.identity,
      footprintUuid: target.footprintUuid, client: parsed.client, maximumTicket: parsed.maximumTicket }));
  }
  public status(): Readonly<{ phase: Phase; sourceCalls: number; stateCalls: number; receivedReplies: number; executionAuthorized: false }> {
    return Object.freeze({ phase: this.#phase, sourceCalls: this.#sourceCalls, stateCalls: this.#stateCalls,
      receivedReplies: this.#replies.length, executionAuthorized: false });
  }
  public retainedReplies(): readonly unknown[] { return Object.freeze([...this.#replies]); }
  #same(): void {
    need(this.#phase !== "failed", "original lifetime failed");
    need(methods(this.#transport).every((method, index) => method === this.#methods[index]), "original transport changed");
    need(canonicalJson(captureCurrentPcbStringClockReply(this.#state).value) === this.#stateText, "original state changed");
    const target = currentFootprintCopyV2SavedTarget(this.#plan);
    need(target.projectUuid === this.#request.identity.projectUuid && target.branchUuid === this.#request.identity.branchUuid &&
      target.footprintUuid === this.#request.footprintUuid && this.#plan.maximumTicket === this.#request.maximumTicket,
    "original saved projection changed");
  }
  async #current(): Promise<void> {
    this.#same(); await bounded(this.#assert.call(this.#transport, this.#state)); this.#same();
  }
  async #stateSample(): Promise<void> {
    await this.#current(); need(this.#stateCalls < CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS.stateCalls, "state budget"); this.#stateCalls += 1;
    const raw = captureCurrentPcbStringClockReply(await bounded(this.#observeState.call(this.#transport),
      CURRENT_FOOTPRINT_COPY_SOURCE_STAGE_TIMING.stateCallbackMs)).value;
    this.#replies.push(raw); await this.#current();
    const sample = decodeCurrentFootprintCopyState(raw);
    need(canonicalJson(sample.identity) === canonicalJson(this.#request.identity) && sample.client === this.#request.client &&
      sample.maximumTicket === this.#request.maximumTicket && sample.capturedUser === "own-undefined", "state sample changed");
  }
  #compare(sample: CurrentFootprintCopySourceReadSample): ReturnType<typeof verifyCurrentFootprintCopyV2SavedSource> {
    need(canonicalJson(sample.identity) === canonicalJson(this.#request.identity) && sample.footprintUuid === this.#request.footprintUuid &&
      sample.client === this.#request.client && sample.maximumTicket === this.#request.maximumTicket, "saved sample identity changed");
    need(sample.route === "native-cache-equivalent" && !sample.sourceGetterDispatched && !sample.cacheEffectsPossible &&
      sample.cacheWrites === 0 && sample.networkRequests === 0 && sample.cacheRead?.atoms === this.#plan.canvasRecords,
    "fixed cache-only saved evidence required");
    return verifyCurrentFootprintCopyV2SavedSource(this.#plan, { profile: "private.current-footprint-copy-v2-saved-content-observation.v1",
      targetUuid: sample.footprintUuid, maximumTicket: sample.maximumTicket, workerClient: sample.client, content: sample.content });
  }
  async #sourceSample(): Promise<CurrentFootprintCopySourceReadSample> {
    await this.#stateSample(); await this.#current();
    need(this.#sourceCalls < CURRENT_FOOTPRINT_COPY_SOURCE_READ_LIMITS.sourceCalls, "source budget"); this.#sourceCalls += 1;
    const raw = captureCurrentFootprintCopySourceReadReply(await bounded(this.#read.call(this.#transport, this.#request),
      CURRENT_FOOTPRINT_COPY_SOURCE_STAGE_TIMING.sourceCallbackMs));
    // Retain malformed JSON and stale arrivals before the next owner reproof.
    this.#replies.push(raw); await this.#current();
    const sample = decodeCurrentFootprintCopySourceRead(raw); this.#compare(sample);
    await this.#stateSample(); return sample;
  }
  public async observe(): Promise<CurrentFootprintCopyV2SavedReadPacket> {
    need(this.#phase === "ready", "attempt consumed"); this.#phase = "observing";
    try {
      const first = await this.#sourceSample(), second = await this.#sourceSample();
      need(canonicalJson(first) === canonicalJson(second), "paired saved samples differ"); await this.#current();
      need(this.#sourceCalls === 2 && this.#stateCalls === 4, "complete saved bracket required");
      const comparison = this.#compare(first);
      this.#packet = freezeDeep(currentFootprintCopyV2SavedReadPacketSchema.parse({
        profile: "private.current-footprint-copy-v2-saved-read.v1", request: this.#request, content: first.content,
        contentSha256: sha256Text(first.content), afterSqlSha256: this.#plan.afterSqlSha256,
        creationPlaintextSha256: this.#plan.creationPlaintextSha256, matchedProjection: comparison["matchedProjection"],
        sourceSamples: 2, stateSamples: 4, exactContent: true, route: "native-cache-equivalent", sourceGetterDispatched: false,
        cacheRead: first.cacheRead, canvasRecords: this.#plan.canvasRecords, tombstones: this.#plan.tombstones,
        cacheWrites: 0, networkRequests: 0, cacheEffectsPossible: false, cacheBranchObserved: false, producerBindingVerified: false,
        executionAuthorized: false, completionProved: false, generationClosureVerified: false, persistentUploadReplayExcluded: false,
        reopened: false, persistenceVerified: false,
      }));
      this.#phase = "completed"; return this.#packet;
    } catch (error) { this.#phase = "failed"; throw error; }
  }
  public async requireOriginal(packet: CurrentFootprintCopyV2SavedReadPacket): Promise<CurrentFootprintCopyV2SavedReadPacket> {
    need(this.#phase === "completed" && packet === this.#packet, "original completed saved packet required");
    try { await this.#current(); return packet; } catch (error) { this.#phase = "failed"; throw error; }
  }
}
