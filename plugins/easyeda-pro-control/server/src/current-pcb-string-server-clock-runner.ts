/** One String-owned server-time attempt. The outer native owner must admit and
 * retain the worker context plus RPC routing. This class is not registered and
 * cannot turn local/rename clocks or copied JSON into Windows/backend authority. */
import { types } from "node:util";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { currentPcbStringSaveProvenanceSource } from "./current-pcb-string-save-provenance.ts";
import type { CurrentPcbStringSaveProvenance } from "./current-pcb-string-save-provenance.ts";
import { currentPcbStringServerClockCommand, decodeCurrentPcbStringServerClock } from "./current-pcb-string-server-clock.ts";
import type { CurrentPcbStringServerClockCommand, CurrentPcbStringServerClockSample } from "./current-pcb-string-server-clock.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_STRING_SERVER_CLOCK_LIMITS = Object.freeze({ nativeOwnerVerified: false,
  nativeIntrinsicsVerified: false, exclusiveRpcServiceVerified: false, backendActorProvenanceVerified: false,
  windowsClockProvenanceVerified: false, saveClockProvenanceVerified: false, futureSaveClockObserved: false,
  producerBindingVerified: false, originalSaveVerified: false, executionAuthorized: false, saveAuthorized: false } as const);
export interface CurrentPcbStringServerClockTransport {
  readonly request: (command: CurrentPcbStringServerClockCommand) => Promise<unknown>;
  readonly assertCurrent: () => void;
}
export interface CurrentPcbStringServerClockPacket extends Readonly<typeof CURRENT_PCB_STRING_SERVER_CLOCK_LIMITS> {
  readonly profile: "private.current-pcb-string-server-clock-packet.v1";
  readonly identity: CurrentPcbStringSaveProvenance["identity"];
  readonly actorPacketSha256: string;
  readonly beforeSqlSha256: string;
  readonly originalRunnerIssued: true;
  readonly originalActorSqlSelectionRetained: true;
  readonly serverTimeRpcObserved: true;
  readonly sample: CurrentPcbStringServerClockSample;
  readonly rawReplySha256: string;
}
const consumed = new WeakSet<CurrentPcbStringSaveProvenance>();
function need(condition: boolean, detail: string): asserts condition {
  if (!condition) { throw new Error(`PCB_STRING_SERVER_CLOCK_RUNNER: ${detail}`); }
}
function methods(transport: CurrentPcbStringServerClockTransport): readonly unknown[] {
  need(transport !== null && typeof transport === "object" && !types.isProxy(transport) && !Array.isArray(transport) &&
    (Object.getPrototypeOf(transport) === Object.prototype || Object.getPrototypeOf(transport) === null), "own transport required");
  const keys = Reflect.ownKeys(transport);
  need(keys.length === 2 && keys.every(key => key === "request" || key === "assertCurrent"), "transport fields differ");
  return ["request", "assertCurrent"].map(key => {
    const descriptor = Object.getOwnPropertyDescriptor(transport, key);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && typeof descriptor.value === "function", "own transport methods required");
    return descriptor.value as unknown;
  });
}
export class CurrentPcbStringServerClockRunner {
  readonly #provenance: CurrentPcbStringSaveProvenance;
  readonly #transport: CurrentPcbStringServerClockTransport;
  readonly #request: CurrentPcbStringServerClockTransport["request"];
  readonly #assertCurrent: CurrentPcbStringServerClockTransport["assertCurrent"];
  readonly #context: string;
  #phase: "ready" | "observing" | "completed" | "failed" = "ready";
  #raw: unknown;
  #received = false;
  #packet: CurrentPcbStringServerClockPacket | undefined;
  public constructor(provenance: CurrentPcbStringSaveProvenance, transport: CurrentPcbStringServerClockTransport) {
    const source = currentPcbStringSaveProvenanceSource(provenance); methods(transport);
    this.#provenance = provenance; this.#transport = transport;
    this.#request = transport.request; this.#assertCurrent = transport.assertCurrent;
    this.#context = source.packet.contexts.worker;
  }
  #current(): void {
    need(this.#phase !== "failed", "original attempt failed");
    const original = methods(this.#transport);
    need(original[0] === this.#request && original[1] === this.#assertCurrent, "original transport changed");
    this.#assertCurrent.call(this.#transport);
    const source = currentPcbStringSaveProvenanceSource(this.#provenance);
    need(source.packet.contexts.worker === this.#context, "original worker context differs");
  }
  public status(): Readonly<{ phase: "ready" | "observing" | "completed" | "failed"; rawReplyRetained: boolean;
    rpcMayRemainPending: boolean; saveAuthorized: false }> {
    return Object.freeze({ phase: this.#phase, rawReplyRetained: this.#received,
      rpcMayRemainPending: this.#phase === "observing" || this.#phase === "failed", saveAuthorized: false });
  }
  /** Private failure evidence only. An unresolved request may have installed a
   * reply subscriber. Never replay it or label timeout as cancellation. */
  public retainedReply(): unknown { return this.#raw; }
  public async observe(): Promise<CurrentPcbStringServerClockPacket> {
    need(this.#phase === "ready" && !consumed.has(this.#provenance), "original String attempt consumed");
    consumed.add(this.#provenance); this.#phase = "observing";
    try {
      this.#current();
      const reply = captureCurrentPcbStringClockReply(await this.#request.call(this.#transport, currentPcbStringServerClockCommand(this.#context,
        this.#provenance.identity, this.#provenance.workerUserText)));
      this.#raw = reply.value;
      this.#received = true; this.#current();
      const sample = decodeCurrentPcbStringServerClock(this.#raw, this.#provenance.identity, this.#provenance.workerUserText);
      this.#current();
      this.#packet = freezeDeep({ profile: "private.current-pcb-string-server-clock-packet.v1", identity: this.#provenance.identity,
        actorPacketSha256: this.#provenance.actorPacketSha256, beforeSqlSha256: this.#provenance.beforeSqlSha256,
        originalRunnerIssued: true, originalActorSqlSelectionRetained: true, serverTimeRpcObserved: true,
        sample, rawReplySha256: reply.sha256, ...CURRENT_PCB_STRING_SERVER_CLOCK_LIMITS });
      this.#phase = "completed"; return this.#packet;
    } catch (error) { this.#phase = "failed"; throw error; }
  }
  public requireOriginal(packet: CurrentPcbStringServerClockPacket): CurrentPcbStringServerClockPacket {
    need(this.#phase === "completed" && packet === this.#packet, "original completed String server clock required");
    try { this.#current(); return packet; } catch (error) { this.#phase = "failed"; throw error; }
  }
}
