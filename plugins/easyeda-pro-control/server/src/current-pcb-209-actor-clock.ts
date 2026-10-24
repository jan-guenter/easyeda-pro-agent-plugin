/** Source-qualified 209 actor/local-clock collection. The source closure does
 * not admit a native session: its owner must supply and continuously reprove
 * the original UI, worker and PCB transport/context objects. */
import { sha256Json } from "./core.ts";
import { requireCurrentPcb209ActorClockSourceQualification } from "./current-pcb-209-actor-clock-source.ts";
import type { CurrentPcb209ActorClockSourceQualification } from "./current-pcb-209-actor-clock-source.ts";
import type { CurrentPcbStringActorClockIdentity, CurrentPcbStringActorClockSample } from "./current-pcb-string-actor-clock.ts";
import { CurrentPcbStringActorClockRunner } from "./current-pcb-string-actor-clock-runner.ts";
import type { CurrentPcbStringActorClockContexts, CurrentPcbStringActorClockPacket,
  CurrentPcbStringActorClockTransport } from "./current-pcb-string-actor-clock-runner.ts";
import { currentPcbStringServerClockCommand } from "./current-pcb-string-server-clock.ts";
import type { CurrentPcbStringServerClockCommand } from "./current-pcb-string-server-clock.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const limits = Object.freeze({ nativeSourceContextsOwned: false, responderOwnershipVerified: false,
  nativeIntrinsicsVerified: false, clockProvenanceVerified: false, futureSaveClockVerified: false,
  compatibilityAdmitted: false, executionAuthorized: false, saveAuthorized: false } as const);
export interface CurrentPcb209ActorClockPacket extends Readonly<typeof limits> {
  readonly profile: "private.current-pcb209-actor-clock.v1";
  readonly sourceClosureSha256: string;
  readonly originalActorPacket: CurrentPcbStringActorClockPacket;
  readonly packetSha256: string;
}
export interface CurrentPcb209OriginalActorObservation {
  readonly runner: CurrentPcbStringActorClockRunner;
  readonly packet: CurrentPcbStringActorClockPacket;
}
/** The six unchanged fixed programs retain their original runner and packet.
 * This adapter neither relabels decoded JSON as ownership nor alters the 206
 * API. A completed packet can supply the genuine original pair to the shared
 * provenance collector; all native containment and SQL requirements remain. */
export class CurrentPcb209ActorClockRunner {
  readonly #qualification: CurrentPcb209ActorClockSourceQualification;
  readonly #runner: CurrentPcbStringActorClockRunner;
  #packet: CurrentPcb209ActorClockPacket | null = null;
  public constructor(qualification: CurrentPcb209ActorClockSourceQualification,
    transport: CurrentPcbStringActorClockTransport, contexts: CurrentPcbStringActorClockContexts,
    identity: CurrentPcbStringActorClockIdentity) {
    requireCurrentPcb209ActorClockSourceQualification(qualification);
    this.#qualification = qualification;
    this.#runner = new CurrentPcbStringActorClockRunner(transport, contexts, identity);
  }
  public status(): ReturnType<CurrentPcbStringActorClockRunner["status"]> { return this.#runner.status(); }
  public retainedSamples(): readonly CurrentPcbStringActorClockSample[] { return this.#runner.retainedSamples(); }
  public async observe(): Promise<CurrentPcb209ActorClockPacket> {
    requireCurrentPcb209ActorClockSourceQualification(this.#qualification);
    const originalActorPacket = await this.#runner.observe();
    this.#runner.requireOriginalPacket(originalActorPacket);
    const body = freezeDeep({ profile: "private.current-pcb209-actor-clock.v1" as const,
      sourceClosureSha256: this.#qualification.sourceClosureSha256, originalActorPacket, ...limits });
    this.#packet = freezeDeep({ ...body, packetSha256: sha256Json(body) }); return this.#packet;
  }
  public requireOriginal(packet: CurrentPcb209ActorClockPacket): CurrentPcb209ActorClockPacket {
    if (this.#packet === null || packet !== this.#packet) { throw new Error("PCB209_ACTOR_CLOCK_ORIGINAL_PACKET"); }
    requireCurrentPcb209ActorClockSourceQualification(this.#qualification);
    this.#runner.requireOriginalPacket(packet.originalActorPacket); return packet;
  }
  public originalObservation(packet: CurrentPcb209ActorClockPacket): CurrentPcb209OriginalActorObservation {
    this.requireOriginal(packet);
    return Object.freeze({ runner: this.#runner, packet: packet.originalActorPacket });
  }
  /** Produces one fixed command, never sends it. This RPC changes its worker
   * ticket/subscription state; the caller still needs original native ownership
   * and the clock ledger's durable intent. Its reply is not Save's own reply. */
  public serverClockCommand(packet: CurrentPcb209ActorClockPacket): CurrentPcbStringServerClockCommand {
    const original = this.requireOriginal(packet).originalActorPacket;
    return currentPcbStringServerClockCommand(original.contexts.worker, original.identity, original.workerUserText);
  }
}
