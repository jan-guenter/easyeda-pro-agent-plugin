/** Fixed 209 startup actor adapter. Its worker callback must be bound to the
 * original constructor-captured PROJECT through the 209 construction owner;
 * source bytes or matching user JSON cannot supply that ownership. */
import { z } from "zod";
import { canonicalJson, sha256Json } from "./core.ts";
import { requireCurrentPcb209ActorClockSourceQualification } from "./current-pcb-209-actor-clock-source.ts";
import type { CurrentPcb209ActorClockSourceQualification } from "./current-pcb-209-actor-clock-source.ts";
import type { CurrentPcbWorkerStartupActorIdentity, CurrentPcbWorkerStartupActorSample } from "./current-pcb-worker-startup-actor.ts";
import { CurrentPcbWorkerStartupActorRunner, currentPcbWorkerStartupActorPacketSchema } from "./current-pcb-worker-startup-actor-runner.ts";
import type { CurrentPcbWorkerStartupActorPacket, CurrentPcbWorkerStartupActorTransport } from "./current-pcb-worker-startup-actor-runner.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

// oxlint-disable-next-line typescript/unbound-method -- The captured private-field method is invoked only with this wrapper's original inner runner.
const originalStartupActorPacket = CurrentPcbWorkerStartupActorRunner.prototype.requireOriginal;
const limits = Object.freeze({ originalConstructorOwnerVerified: false, nativeSourceContextsOwned: false,
  nativeIntrinsicsVerified: false, clockProvenanceVerified: false, futureSaveClockVerified: false,
  compatibilityAdmitted: false, executionAuthorized: false, saveAuthorized: false } as const);
export interface CurrentPcb209WorkerStartupActorPacket extends Readonly<typeof limits> {
  readonly profile: "private.current-pcb209-worker-startup-actor.v1";
  readonly sourceClosureSha256: string;
  readonly originalActorPacket: CurrentPcbWorkerStartupActorPacket;
  readonly packetSha256: string;
}
export const currentPcb209WorkerStartupActorPacketSchema = z.object({
  profile: z.literal("private.current-pcb209-worker-startup-actor.v1"),
  sourceClosureSha256: z.string().regex(/^[a-f\d]{64}$/u),
  originalActorPacket: currentPcbWorkerStartupActorPacketSchema,
  packetSha256: z.string().regex(/^[a-f\d]{64}$/u),
  originalConstructorOwnerVerified: z.literal(false), nativeSourceContextsOwned: z.literal(false),
  nativeIntrinsicsVerified: z.literal(false), clockProvenanceVerified: z.literal(false), futureSaveClockVerified: z.literal(false),
  compatibilityAdmitted: z.literal(false), executionAuthorized: z.literal(false), saveAuthorized: z.literal(false),
}).strict().refine(packet => {
  const { packetSha256, ...body } = packet;
  return packetSha256 === sha256Json(body) && Buffer.byteLength(canonicalJson(packet)) <= 132_096;
});
export interface CurrentPcb209OriginalStartupActorObservation {
  readonly runner: CurrentPcbWorkerStartupActorRunner;
  readonly packet: CurrentPcbWorkerStartupActorPacket;
}
/** Reuse the reviewed four-sample algorithm without widening its startup
 * contract. No PCB snapshot, native clock or Save admission is synthesized. */
export class CurrentPcb209WorkerStartupActorRunner {
  readonly #qualification: CurrentPcb209ActorClockSourceQualification;
  readonly #runner: CurrentPcbWorkerStartupActorRunner;
  #packet: CurrentPcb209WorkerStartupActorPacket | null = null;
  public constructor(qualification: CurrentPcb209ActorClockSourceQualification,
    transport: CurrentPcbWorkerStartupActorTransport, identity: CurrentPcbWorkerStartupActorIdentity) {
    requireCurrentPcb209ActorClockSourceQualification(qualification);
    this.#qualification = qualification; this.#runner = new CurrentPcbWorkerStartupActorRunner(transport, identity);
  }
  public status(): ReturnType<CurrentPcbWorkerStartupActorRunner["status"]> { return this.#runner.status(); }
  public retainedSamples(): readonly CurrentPcbWorkerStartupActorSample[] { return this.#runner.retainedSamples(); }
  public async observe(): Promise<CurrentPcb209WorkerStartupActorPacket> {
    requireCurrentPcb209ActorClockSourceQualification(this.#qualification);
    const originalActorPacket = await this.#runner.observe();
    await this.#runner.requireOriginal(originalActorPacket);
    const body = freezeDeep({ profile: "private.current-pcb209-worker-startup-actor.v1" as const,
      sourceClosureSha256: this.#qualification.sourceClosureSha256, originalActorPacket, ...limits });
    this.#packet = freezeDeep({ ...body, packetSha256: sha256Json(body) }); return this.#packet;
  }
  async #requireOriginal(packet: CurrentPcb209WorkerStartupActorPacket): Promise<CurrentPcb209WorkerStartupActorPacket> {
    if (this.#packet === null || packet !== this.#packet) { throw new Error("PCB209_WORKER_STARTUP_ACTOR_ORIGINAL_PACKET"); }
    if (CurrentPcbWorkerStartupActorRunner.prototype.requireOriginal !== originalStartupActorPacket) {
      throw new Error("PCB209_WORKER_STARTUP_ACTOR_ORIGINAL_METHOD");
    }
    requireCurrentPcb209ActorClockSourceQualification(this.#qualification);
    await originalStartupActorPacket.call(this.#runner, packet.originalActorPacket);
    if (this.#packet !== packet || CurrentPcbWorkerStartupActorRunner.prototype.requireOriginal !== originalStartupActorPacket) {
      throw new Error("PCB209_WORKER_STARTUP_ACTOR_ORIGINAL_METHOD");
    }
    requireCurrentPcb209ActorClockSourceQualification(this.#qualification); return packet;
  }
  public requireOriginal(packet: CurrentPcb209WorkerStartupActorPacket): Promise<CurrentPcb209WorkerStartupActorPacket> {
    return this.#requireOriginal(packet);
  }
  public async originalObservation(packet: CurrentPcb209WorkerStartupActorPacket): Promise<CurrentPcb209OriginalStartupActorObservation> {
    await this.#requireOriginal(packet);
    return Object.freeze({ runner: this.#runner, packet: packet.originalActorPacket });
  }
}
