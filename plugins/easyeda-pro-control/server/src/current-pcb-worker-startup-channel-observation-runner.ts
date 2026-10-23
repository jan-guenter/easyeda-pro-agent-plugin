/** Fixed current-channel and publisher qualification on the original worker.
 * This collector neither opens a channel nor invokes a publisher/subscriber. */
import { types } from "node:util";
import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { decodeCurrentPcbStringWorkerGates } from "./current-pcb-string-worker-gate-program.ts";
import { CURRENT_PCB_STRING_WORKER_GATE_ORDER, decodeCurrentPcbStringWorkerGateBundle,
  decodeCurrentPcbStringWorkerGateProperties, decodeCurrentPcbStringWorkerGateScope,
  decodeCurrentPcbStringWorkerGateTuple } from "./current-pcb-string-worker-gate-scope.ts";
import { currentPcbWorkerStartupActorIdentitySchema } from "./current-pcb-worker-startup-actor.ts";
import type { CurrentPcbWorkerStartupActorIdentity } from "./current-pcb-worker-startup-actor.ts";
import { CURRENT_PCB_WORKER_STARTUP_CHANNEL_OBSERVATION_LIMITS, CURRENT_PCB_WORKER_STARTUP_CHANNEL_OBSERVATION_REQUEST_COUNT,
  currentPcbWorkerStartupChannelPacketSchema } from "./current-pcb-worker-startup-channel-observation.ts";
import type { CurrentPcbWorkerStartupChannelObservationCommand, CurrentPcbWorkerStartupChannelObservationTransport,
  CurrentPcbWorkerStartupChannelPacket } from "./current-pcb-worker-startup-channel-observation.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const token = z.string().min(1).max(256).refine(value => /^[A-Za-z\d_.:-]+$/u.exec(value)?.[0] === value);
const relationReply = z.object({ result: z.object({ type: z.literal("boolean"), value: z.literal(true) }).strict() }).strict();
const gateReply = z.object({ result: z.object({ type: z.literal("string"), value: z.string().max(16_384)
  .refine(value => value.isWellFormed() && Buffer.byteLength(value) <= 16_384) }).strict() }).strict();
type Phase = "ready" | "observing" | "completed" | "failed";
function need(condition: boolean, detail: string): asserts condition {
  if (!condition) { throw new Error(`PCB_WORKER_STARTUP_CHANNEL_OBSERVATION: ${detail}`); }
}
function methods(input: CurrentPcbWorkerStartupChannelObservationTransport): readonly unknown[] {
  need(input !== null && typeof input === "object" && !types.isProxy(input) && !Array.isArray(input) &&
    (Object.getPrototypeOf(input) === Object.prototype || Object.getPrototypeOf(input) === null), "plain transport required");
  const fields = ["scriptId", "request", "assertCurrent"] as const, keys = Reflect.ownKeys(input);
  need(keys.length === fields.length && keys.every(key => fields.some(field => key === field)), "transport fields differ");
  return fields.map(field => {
    const descriptor = Object.getOwnPropertyDescriptor(input, field);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value") &&
      typeof descriptor.value === (field === "scriptId" ? "string" : "function"), "original transport members required");
    return descriptor.value as unknown;
  });
}

export class CurrentPcbWorkerStartupChannelObservationRunner {
  readonly #transport: CurrentPcbWorkerStartupChannelObservationTransport;
  readonly #methods: readonly unknown[];
  readonly #send: CurrentPcbWorkerStartupChannelObservationTransport["request"];
  readonly #assert: CurrentPcbWorkerStartupChannelObservationTransport["assertCurrent"];
  readonly #scriptId: string;
  readonly #identity: CurrentPcbWorkerStartupActorIdentity;
  readonly #gateReplies: string[] = [];
  #phase: Phase = "ready";
  #requests = 0;
  #packet: CurrentPcbWorkerStartupChannelPacket | null = null;
  public constructor(transport: CurrentPcbWorkerStartupChannelObservationTransport, identity: CurrentPcbWorkerStartupActorIdentity) {
    this.#methods = methods(transport); this.#transport = transport;
    this.#scriptId = token.parse(transport.scriptId); this.#send = transport.request; this.#assert = transport.assertCurrent;
    this.#identity = freezeDeep(currentPcbWorkerStartupActorIdentitySchema.parse(captureCurrentPcbStringClockReply(identity).value));
  }
  public status(): Readonly<{ phase: Phase; requests: number; observedGateReplies: number; executionAuthorized: false }> {
    return Object.freeze({ phase: this.#phase, requests: this.#requests, observedGateReplies: this.#gateReplies.length, executionAuthorized: false });
  }
  public retainedGateReplies(): readonly string[] { return Object.freeze([...this.#gateReplies]); }
  #same(): void { need(methods(this.#transport).every((method, index) => method === this.#methods[index]), "original transport changed"); }
  #alive(): void { need(this.#phase !== "failed", "original lifetime failed"); }
  async #current(): Promise<void> {
    this.#alive(); this.#same();
    await this.#assert.call(this.#transport); this.#same(); this.#alive();
  }
  async #request(command: CurrentPcbWorkerStartupChannelObservationCommand): Promise<unknown> {
    await this.#current();
    need(this.#requests < CURRENT_PCB_WORKER_STARTUP_CHANNEL_OBSERVATION_REQUEST_COUNT, "request budget"); this.#requests += 1;
    const captured = captureCurrentPcbStringClockReply(await this.#send.call(this.#transport, Object.freeze(command))).value;
    // Retain exact immutable received text before any awaited owner check.
    // Malformed JSON stays diagnostic; neither it nor matching samples grants authority.
    if (command.phase === "gates") { this.#gateReplies.push(gateReply.parse(captured).result.value); }
    await this.#current(); return captured;
  }
  #properties(objectId: string): Promise<unknown> { return this.#request({ phase: "properties", objectId: token.parse(objectId) }); }
  async #sample(bundle: string, canPublish: string): Promise<ReturnType<typeof decodeCurrentPcbStringWorkerGates>> {
    const property = decodeCurrentPcbStringWorkerGateProperties(await this.#properties(canPublish), this.#scriptId, "canPublish");
    const scope = decodeCurrentPcbStringWorkerGateScope(await this.#properties(property.scopesId));
    const sample = decodeCurrentPcbStringWorkerGates(await this.#request({ phase: "gates", bundle, scope }));
    need(canonicalJson(sample.identity) === canonicalJson(this.#identity), "sample identity differs"); return sample;
  }
  public async observe(): Promise<CurrentPcbWorkerStartupChannelPacket> {
    need(this.#phase === "ready", "attempt consumed"); this.#phase = "observing";
    try {
      relationReply.parse(await this.#request({ phase: "channel-relation" }));
      const bundle = decodeCurrentPcbStringWorkerGateBundle(await this.#request({ phase: "gate-select" }));
      const handles = decodeCurrentPcbStringWorkerGateTuple(await this.#properties(bundle));
      for (const [index, kind] of CURRENT_PCB_STRING_WORKER_GATE_ORDER.entries()) {
        const handle = handles[index]; need(handle !== undefined, "publisher method missing");
        decodeCurrentPcbStringWorkerGateProperties(await this.#properties(handle), this.#scriptId, kind);
      }
      const canPublish = handles[2]; need(canPublish !== undefined, "gate method missing");
      const first = await this.#sample(bundle, canPublish), second = await this.#sample(bundle, canPublish);
      need(canonicalJson(first) === canonicalJson(second), "paired gate samples differ");
      relationReply.parse(await this.#request({ phase: "channel-relation" }));
      need(this.#requests === CURRENT_PCB_WORKER_STARTUP_CHANNEL_OBSERVATION_REQUEST_COUNT && this.#gateReplies.length === 2, "complete read sequence required");
      await this.#current();
      const body = { profile: "private.current-pcb-worker-startup-channel-observation.v1" as const, identity: this.#identity,
        originalRunnerIssued: true as const, originalConstructorChannelRelationsObserved: true as const,
        currentPublisherMethodRelationsQualified: true as const, pairedGateSamplesMatched: true as const,
        channelRelationChecks: 2 as const, requestCount: 18 as const, qualifiedMethodKinds: [...CURRENT_PCB_STRING_WORKER_GATE_ORDER],
        gateReplies: [...this.#gateReplies], publisherSenderUuid: first.publisher.senderUuid, ...CURRENT_PCB_WORKER_STARTUP_CHANNEL_OBSERVATION_LIMITS };
      const packet = freezeDeep(currentPcbWorkerStartupChannelPacketSchema.parse({ ...body, packetSha256: sha256Json(body) }));
      this.#packet = packet; this.#phase = "completed"; return packet;
    } catch (error) { this.#phase = "failed"; throw error; }
  }
  public async requireOriginal(packet: CurrentPcbWorkerStartupChannelPacket): Promise<CurrentPcbWorkerStartupChannelPacket> {
    need(this.#phase === "completed" && this.#packet === packet, "original completed packet required");
    try { await this.#current(); return packet; } catch (error) { this.#phase = "failed"; throw error; }
  }
}
