/** Single-consumption String observations through a retained transport. This
 * class cannot supply native ownership: the enclosing diagnostic owner must
 * admit the UI/PCB/worker source contexts and reprove them at every boundary. */
import { types } from "node:util";
import { canonicalJson, sha256Json } from "./core.ts";
import { currentPcbStringActorClockCommand, currentPcbStringActorClockIdentitySchema,
  decodeCurrentPcbStringActorClock } from "./current-pcb-string-actor-clock.ts";
import type { CurrentPcbStringActorClockCommand, CurrentPcbStringActorClockIdentity,
  CurrentPcbStringActorClockPhase, CurrentPcbStringActorClockSample } from "./current-pcb-string-actor-clock.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const CURRENT_PCB_STRING_ACTOR_CLOCK_SEQUENCE = Object.freeze(["ui", "worker", "pcb", "pcb", "worker", "ui"] as const);
export const CURRENT_PCB_STRING_ACTOR_CLOCK_REQUEST_COUNT = 6;
export const CURRENT_PCB_STRING_ACTOR_CLOCK_PACKET_BYTES = 131_072;
export const CURRENT_PCB_STRING_ACTOR_CLOCK_LIMITS = Object.freeze({
  originalOwnerVerified: false, nativeIntrinsicsVerified: false, workerUserFutureUseVerified: false,
  backendActorProvenanceVerified: false, windowsClockProvenanceVerified: false, serverClockObserved: false,
  clockProvenanceVerified: false, continuousObservation: false, producerBindingVerified: false,
  completePublicationIntervalVerified: false, originalSaveVerified: false, executionAuthorized: false, saveAuthorized: false,
} as const);
export interface CurrentPcbStringActorClockTransport {
  request: (command: CurrentPcbStringActorClockCommand) => Promise<unknown>;
  assertCurrent: () => void;
}
export type CurrentPcbStringActorClockContexts = Readonly<Record<CurrentPcbStringActorClockPhase, string>>;
type RunnerPhase = "ready" | "observing" | "completed" | "failed";
export interface CurrentPcbStringActorClockPacket extends Readonly<typeof CURRENT_PCB_STRING_ACTOR_CLOCK_LIMITS> {
  readonly profile: "private.current-pcb-string-actor-clock-packet.v1";
  readonly identity: CurrentPcbStringActorClockIdentity;
  readonly contexts: CurrentPcbStringActorClockContexts;
  readonly originalRunnerIssued: true;
  readonly pairedActorValuesMatched: true;
  readonly workerUserText: string;
  readonly samples: readonly CurrentPcbStringActorClockSample[];
  readonly packetSha256: string;
}
function need(condition: boolean, detail: string): asserts condition {
  if (!condition) { throw new Error(`PCB_STRING_ACTOR_CLOCK_RUNNER: ${detail}`); }
}
function own(input: unknown, names: readonly string[]): Record<string, unknown> {
  need(input !== null && typeof input === "object" && !types.isProxy(input) && !Array.isArray(input), "plain own input required");
  const keys = Reflect.ownKeys(input), prototype: unknown = Object.getPrototypeOf(input);
  need((prototype === Object.prototype || prototype === null) && keys.length === names.length &&
    keys.every(key => typeof key === "string" && names.includes(key)), "input fields differ");
  return Object.fromEntries(names.map(name => {
    const descriptor = Object.getOwnPropertyDescriptor(input, name);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value"), "own data input required");
    return [name, descriptor.value as unknown];
  }));
}
/** No observation/JSON adoption endpoint. Even an early refusal consumes this
 * attempt; partial evidence is retained without reviving the failed lifetime. */
export class CurrentPcbStringActorClockRunner {
  readonly #transport: CurrentPcbStringActorClockTransport;
  readonly #request: CurrentPcbStringActorClockTransport["request"];
  readonly #assertCurrent: CurrentPcbStringActorClockTransport["assertCurrent"];
  readonly #contexts: CurrentPcbStringActorClockContexts;
  readonly #identity: CurrentPcbStringActorClockIdentity;
  readonly #samples: CurrentPcbStringActorClockSample[] = [];
  #phase: RunnerPhase = "ready";
  #packet: CurrentPcbStringActorClockPacket | null = null;
  public constructor(transport: CurrentPcbStringActorClockTransport, contexts: CurrentPcbStringActorClockContexts,
    identity: CurrentPcbStringActorClockIdentity) {
    const methods = own(transport, ["request", "assertCurrent"]), selected = own(contexts, ["ui", "worker", "pcb"]);
    need(typeof methods["request"] === "function" && typeof methods["assertCurrent"] === "function", "original methods required");
    need(Object.values(selected).every(value => typeof value === "string" && /^[A-Za-z\d_.:-]{1,256}$/u.test(value)) &&
      new Set(Object.values(selected)).size === 3, "three distinct source contexts required");
    this.#transport = transport; this.#request = transport.request; this.#assertCurrent = transport.assertCurrent;
    this.#contexts = Object.freeze({ ...contexts });
    this.#identity = freezeDeep(currentPcbStringActorClockIdentitySchema.parse(own(identity,
      ["projectUuid", "branchUuid", "documentUuid", "windowTabId"])));
  }
  #current(): void {
    need(this.#phase !== "failed", "original lifetime failed");
    const methods = own(this.#transport, ["request", "assertCurrent"]);
    need(methods["request"] === this.#request && methods["assertCurrent"] === this.#assertCurrent, "original transport changed");
    this.#assertCurrent.call(this.#transport);
  }
  public status(): Readonly<{ phase: RunnerPhase; observedReplies: number; executionAuthorized: false }> {
    return Object.freeze({ phase: this.#phase, observedReplies: this.#samples.length, executionAuthorized: false });
  }
  public retainedSamples(): readonly CurrentPcbStringActorClockSample[] { return Object.freeze([...this.#samples]); }
  public async observe(): Promise<CurrentPcbStringActorClockPacket> {
    need(this.#phase === "ready", "attempt consumed"); this.#phase = "observing";
    try {
      for (const phase of CURRENT_PCB_STRING_ACTOR_CLOCK_SEQUENCE) {
        this.#current();
        const reply = await this.#request.call(this.#transport,
          currentPcbStringActorClockCommand(phase, this.#contexts[phase], this.#identity));
        this.#current();
        const sample = decodeCurrentPcbStringActorClock(reply);
        need(sample.phase === phase && (sample.phase === "pcb" || canonicalJson(sample.identity) === canonicalJson(this.#identity)),
          "observed phase/identity differs");
        this.#samples.push(sample);
      }
      const first = this.#samples[0]; need(first?.phase === "ui", "original UI sample missing");
      for (const sample of this.#samples) {
        if (sample.phase !== "pcb") { need(sample.workerUserText === first.workerUserText, "UI/worker retained user differs"); }
      }
      for (const phase of ["ui", "worker", "pcb"] as const) {
        const samples = this.#samples.filter(sample => sample.phase === phase);
        const end = samples[1], start = samples[0];
        need(samples.length === 2 && start !== undefined && end !== undefined &&
          end.clock.before.milliseconds >= start.clock.after.milliseconds &&
          end.clock.after.milliseconds - start.clock.before.milliseconds <= 10_000 &&
          start.clock.before.timezoneOffsetMinutes === end.clock.after.timezoneOffsetMinutes, "paired local clock bracket differs");
        if (start.phase === "ui" && end.phase === "ui") {
          need(canonicalJson(start.cachedActor) === canonicalJson(end.cachedActor) &&
            canonicalJson(start.startupActor) === canonicalJson(end.startupActor), "paired UI actors differ");
        }
      }
      this.#current();
      const body = freezeDeep({ profile: "private.current-pcb-string-actor-clock-packet.v1" as const,
        identity: this.#identity, contexts: this.#contexts, originalRunnerIssued: true as const, pairedActorValuesMatched: true as const,
        workerUserText: first.workerUserText, samples: [...this.#samples], ...CURRENT_PCB_STRING_ACTOR_CLOCK_LIMITS });
      const packet = freezeDeep({ ...body, packetSha256: sha256Json(body) });
      need(Buffer.byteLength(canonicalJson(packet)) <= CURRENT_PCB_STRING_ACTOR_CLOCK_PACKET_BYTES, "packet byte bound");
      this.#packet = packet; this.#phase = "completed";
      return this.#packet;
    } catch (caughtError) { this.#phase = "failed"; throw caughtError; }
  }
  public requireOriginalPacket(packet: CurrentPcbStringActorClockPacket): CurrentPcbStringActorClockPacket {
    need(this.#phase === "completed" && packet === this.#packet, "original completed packet required");
    try { this.#current(); return packet; }
    catch (caughtError) { this.#phase = "failed"; throw caughtError; }
  }
}
