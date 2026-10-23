/** One original startup-purpose actor bracket. No String/PCB packet adoption,
 * clock-authority conversion or historical JSON continuation is available. */
import { types } from "node:util";
import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import { currentPcbWorkerStartupActorIdentitySchema, currentPcbWorkerStartupActorSampleSchema,
  decodeCurrentPcbWorkerStartupActor } from "./current-pcb-worker-startup-actor.ts";
import type { CurrentPcbWorkerStartupActorIdentity, CurrentPcbWorkerStartupActorSample } from "./current-pcb-worker-startup-actor.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_WORKER_STARTUP_ACTOR_SEQUENCE = Object.freeze(["ui", "worker", "worker", "ui"] as const);
export const CURRENT_PCB_WORKER_STARTUP_ACTOR_LIMITS = Object.freeze({
  continuousObservation: false, atomicSnapshotVerified: false, pcbRealmObserved: false, nativeIntrinsicsVerified: false,
  windowsClockProvenanceVerified: false, serverClockObserved: false, clockProvenanceVerified: false,
  backendActorProvenanceVerified: false, workerUserFutureUseVerified: false, completePublicationIntervalVerified: false,
  writeDestinationsContained: false, executionAuthorized: false, saveAuthorized: false,
} as const);
const bodySchema = z.object({ profile: z.literal("private.current-pcb-worker-startup-actor-packet.v1"),
  identity: currentPcbWorkerStartupActorIdentitySchema, originalRunnerIssued: z.literal(true),
  originalConstructorProjectObserved: z.literal(true), pairedActorValuesMatched: z.literal(true),
  workerUserText: z.string().max(16_384), samples: z.array(currentPcbWorkerStartupActorSampleSchema).length(4),
  continuousObservation: z.literal(false), atomicSnapshotVerified: z.literal(false), pcbRealmObserved: z.literal(false),
  nativeIntrinsicsVerified: z.literal(false), windowsClockProvenanceVerified: z.literal(false), serverClockObserved: z.literal(false),
  clockProvenanceVerified: z.literal(false), backendActorProvenanceVerified: z.literal(false), workerUserFutureUseVerified: z.literal(false),
  completePublicationIntervalVerified: z.literal(false), writeDestinationsContained: z.literal(false),
  executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
}).strict();
export const currentPcbWorkerStartupActorPacketSchema = bodySchema.extend({ packetSha256: z.string().regex(/^[a-f\d]{64}$/u) })
  .refine(packet => {
    const { packetSha256, ...body } = packet;
    if (packetSha256 !== sha256Json(body) || Buffer.byteLength(canonicalJson(packet)) > 131_072) { return false; }
    try { validateSamples(packet.samples, packet.identity, packet.workerUserText); return true; } catch { return false; }
  });
export interface CurrentPcbWorkerStartupActorPacket extends Readonly<typeof CURRENT_PCB_WORKER_STARTUP_ACTOR_LIMITS> {
  readonly profile: "private.current-pcb-worker-startup-actor-packet.v1";
  readonly identity: CurrentPcbWorkerStartupActorIdentity;
  readonly originalRunnerIssued: true;
  readonly originalConstructorProjectObserved: true;
  readonly pairedActorValuesMatched: true;
  readonly workerUserText: string;
  readonly samples: readonly CurrentPcbWorkerStartupActorSample[];
  readonly packetSha256: string;
}
export interface CurrentPcbWorkerStartupActorTransport {
  readonly observeUi: () => Promise<unknown>;
  readonly observeWorker: () => Promise<unknown>;
  readonly assertCurrent: () => Promise<void>;
}
type Phase = "ready" | "observing" | "completed" | "failed";
function need(condition: boolean, detail: string): asserts condition {
  if (!condition) { throw new Error(`PCB_WORKER_STARTUP_ACTOR_RUNNER: ${detail}`); }
}
function validateSamples(samples: readonly CurrentPcbWorkerStartupActorSample[], identity: CurrentPcbWorkerStartupActorIdentity,
  workerUserText: string): void {
  need(samples.length === 4 && samples.every((sample, index) => sample.phase === CURRENT_PCB_WORKER_STARTUP_ACTOR_SEQUENCE[index] &&
    canonicalJson(sample.identity) === canonicalJson(identity) && sample.workerUserText === workerUserText), "paired sample sequence, identity or user differs");
  for (const sample of samples) {
    // Reuse the complete independent decoder: a historical packet cannot
    // Substitute normalized actor fields for its ordered raw user text.
    decodeCurrentPcbWorkerStartupActor({ result: { type: "string", value: JSON.stringify(sample) } });
  }
  for (const phase of ["ui", "worker"] as const) {
    const selected = samples.filter(sample => sample.phase === phase);
    const end = selected[1], start = selected[0];
    need(selected.length === 2 && start !== undefined && end !== undefined &&
      end.clock.before.milliseconds >= start.clock.after.milliseconds &&
      end.clock.after.milliseconds - start.clock.before.milliseconds <= 10_000 &&
      start.clock.before.timezoneOffsetMinutes === end.clock.after.timezoneOffsetMinutes, "paired local clock bracket differs");
    if (start.phase === "ui" && end.phase === "ui") {
      need(canonicalJson(start.cachedActor) === canonicalJson(end.cachedActor) &&
        canonicalJson(start.startupActor) === canonicalJson(end.startupActor), "paired UI actor differs");
    }
  }
}
function methods(input: CurrentPcbWorkerStartupActorTransport): readonly unknown[] {
  need(input !== null && typeof input === "object" && !types.isProxy(input) && !Array.isArray(input) &&
    (Object.getPrototypeOf(input) === Object.prototype || Object.getPrototypeOf(input) === null), "plain transport required");
  const names = ["observeUi", "observeWorker", "assertCurrent"] as const;
  const keys = Reflect.ownKeys(input);
  need(keys.length === names.length && keys.every(key => names.some(name => name === key)), "transport fields differ");
  return names.map(name => {
    const descriptor = Object.getOwnPropertyDescriptor(input, name);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && typeof descriptor.value === "function", "original methods required");
    return descriptor.value as unknown;
  });
}
export class CurrentPcbWorkerStartupActorRunner {
  readonly #transport: CurrentPcbWorkerStartupActorTransport;
  readonly #methods: readonly unknown[];
  readonly #ui: CurrentPcbWorkerStartupActorTransport["observeUi"];
  readonly #worker: CurrentPcbWorkerStartupActorTransport["observeWorker"];
  readonly #assert: CurrentPcbWorkerStartupActorTransport["assertCurrent"];
  readonly #identity: CurrentPcbWorkerStartupActorIdentity;
  readonly #samples: CurrentPcbWorkerStartupActorSample[] = [];
  #phase: Phase = "ready";
  #packet: CurrentPcbWorkerStartupActorPacket | null = null;
  public constructor(transport: CurrentPcbWorkerStartupActorTransport, identity: CurrentPcbWorkerStartupActorIdentity) {
    this.#methods = methods(transport); this.#transport = transport;
    this.#ui = transport.observeUi; this.#worker = transport.observeWorker; this.#assert = transport.assertCurrent;
    this.#identity = freezeDeep(currentPcbWorkerStartupActorIdentitySchema.parse(captureCurrentPcbStringClockReply(identity).value));
  }
  public status(): Readonly<{ phase: Phase; observedReplies: number; executionAuthorized: false }> {
    return Object.freeze({ phase: this.#phase, observedReplies: this.#samples.length, executionAuthorized: false });
  }
  public retainedSamples(): readonly CurrentPcbWorkerStartupActorSample[] { return Object.freeze([...this.#samples]); }
  #same(): void { need(methods(this.#transport).every((method, index) => method === this.#methods[index]), "original transport changed"); }
  #alive(): void { need(this.#phase !== "failed", "original lifetime failed"); }
  async #current(): Promise<void> {
    this.#alive(); this.#same(); await this.#assert.call(this.#transport); this.#same(); this.#alive();
  }
  public async observe(): Promise<CurrentPcbWorkerStartupActorPacket> {
    need(this.#phase === "ready", "attempt consumed"); this.#phase = "observing";
    try {
      for (const phase of CURRENT_PCB_WORKER_STARTUP_ACTOR_SEQUENCE) {
        await this.#current();
        const raw = await (phase === "ui" ? this.#ui : this.#worker).call(this.#transport);
        const sample = decodeCurrentPcbWorkerStartupActor(raw); this.#samples.push(sample);
        await this.#current();
        need(sample.phase === phase && canonicalJson(sample.identity) === canonicalJson(this.#identity), "sample phase or identity differs");
      }
      const first = this.#samples[0]; need(first?.phase === "ui", "original UI sample missing");
      validateSamples(this.#samples, this.#identity, first.workerUserText);
      await this.#current();
      const body = freezeDeep({ profile: "private.current-pcb-worker-startup-actor-packet.v1" as const, identity: this.#identity,
        originalRunnerIssued: true as const, originalConstructorProjectObserved: true as const, pairedActorValuesMatched: true as const,
        workerUserText: first.workerUserText, samples: [...this.#samples], ...CURRENT_PCB_WORKER_STARTUP_ACTOR_LIMITS });
      const packet = freezeDeep({ ...body, packetSha256: sha256Json(body) });
      currentPcbWorkerStartupActorPacketSchema.parse(packet);
      need(Buffer.byteLength(canonicalJson(packet)) <= 131_072, "packet byte bound");
      this.#packet = packet; this.#phase = "completed"; return packet;
    } catch (error) { this.#phase = "failed"; throw error; }
  }
  public async requireOriginal(packet: CurrentPcbWorkerStartupActorPacket): Promise<CurrentPcbWorkerStartupActorPacket> {
    need(this.#phase === "completed" && this.#packet === packet, "original completed packet required");
    try { await this.#current(); return packet; } catch (error) { this.#phase = "failed"; throw error; }
  }
}
