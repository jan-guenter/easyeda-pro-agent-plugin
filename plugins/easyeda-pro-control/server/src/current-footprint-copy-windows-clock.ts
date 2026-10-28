/** Original Windows samples for the distinct footprint execution purpose.
 * This issuer neither dispatches a document clock nor grants create authority.
 * Its transport must come from the retained native process/Job owner. */
import { types } from "node:util";
import { z } from "zod";
import { canonicalJson } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { validateClockSample } from "./windows-clock-transport.ts";

export const CURRENT_FOOTPRINT_COPY_WINDOWS_CLOCK_PHASES = ["before", "armed", "post", "termination"] as const;
export type CurrentFootprintCopyWindowsClockPhase = typeof CURRENT_FOOTPRINT_COPY_WINDOWS_CLOCK_PHASES[number];
export const CURRENT_FOOTPRINT_COPY_WINDOWS_CLOCK_LIMITS = Object.freeze({ liveObservations: 3, terminationObservations: 1,
  nativeRequests: 4, collectionMilliseconds: 10_000, executionAuthorized: false, saveAuthorized: false });
const bindingSchema = z.object({ helperInstance: z.string().regex(/^[a-f\d]{32}$/u), jobId: z.string().regex(/^[a-f\d]{32}$/u),
  rootPid: z.number().int().min(1).max(2_147_483_647), rootCreated: z.string().regex(/^[1-9]\d{14,19}$/u) }).strict();
export type CurrentFootprintCopyWindowsClockBinding = Readonly<z.infer<typeof bindingSchema>>;
type Sample = ReturnType<typeof validateClockSample>;
export interface CurrentFootprintCopyWindowsClockRequest {
  readonly action: "footprint-copy-windows-clock";
  readonly phase: CurrentFootprintCopyWindowsClockPhase;
  readonly sequence: number;
}
export interface CurrentFootprintCopyWindowsClockTransport {
  readonly request: (request: CurrentFootprintCopyWindowsClockRequest) => Promise<unknown>;
  /** Retained purpose/binding/method identity, including after original exit.
   * Historical identity here is not permission for another observation. */
  readonly assertOwned: () => void;
  /** Live phases require the original live root/Job and remaining lifetime.
   * Termination requires observed original root exit AND whole-Job emptiness. */
  readonly assertCurrent: (phase: CurrentFootprintCopyWindowsClockPhase) => void;
}
export interface CurrentFootprintCopyWindowsClockObservation {
  readonly profile: "private.current-footprint-copy-windows-clock.v1";
  readonly phase: CurrentFootprintCopyWindowsClockPhase;
  readonly sequence: number;
  readonly binding: CurrentFootprintCopyWindowsClockBinding;
  readonly before: Sample;
  readonly after: Sample;
  readonly originalTransportIssued: true;
  readonly rawReplySha256: string;
  readonly nativeClockSamplesVerified: true;
  readonly backendActorProvenanceVerified: false;
  readonly documentClockProvenanceVerified: false;
  readonly executionAuthorized: false;
  readonly saveAuthorized: false;
}
const nativeObservation = z.object({ tzAbsent: z.literal(true), reason: z.null(), sample: z.unknown() }).strict();
const replySchema = z.object({ schema: z.literal("easyeda-pro-control.footprint-copy-windows-clock.v1"),
  phase: z.enum(CURRENT_FOOTPRINT_COPY_WINDOWS_CLOCK_PHASES), sequence: z.number().int().min(1).max(4),
  binding: bindingSchema, clock: z.object({ before: nativeObservation, after: nativeObservation }).strict() }).strict();
const sampleSchema = z.object({ schema: z.literal("easyeda-pro-control.windows-clock-sample.v1"),
  utcBeforeTicks: z.string(), utcAfterTicks: z.string(), qpcBefore: z.string(), qpcAfter: z.string(), qpcFrequency: z.string(),
  highResolution: z.literal(true), localOffsetMinutes: z.number().int().min(-840).max(840), zoneRulesSha256: z.string() }).strict();
const methodNames = ["request", "assertOwned", "assertCurrent"] as const;
function need(condition: boolean, detail: string): asserts condition {
  if (!condition) { throw new Error(`FOOTPRINT_COPY_WINDOWS_CLOCK: ${detail}`); }
}
function methods(transport: CurrentFootprintCopyWindowsClockTransport): readonly unknown[] {
  need(transport !== null && typeof transport === "object" && !types.isProxy(transport) &&
    (Object.getPrototypeOf(transport) === Object.prototype || Object.getPrototypeOf(transport) === null) &&
    Reflect.ownKeys(transport).length === methodNames.length, "original transport required");
  return methodNames.map(name => {
    const descriptor = Object.getOwnPropertyDescriptor(transport, name);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value") && typeof descriptor.value === "function", "original methods required");
    return descriptor.value as unknown;
  });
}
function sample(input: unknown): Sample {
  const value = sampleSchema.parse(input);
  need(!Object.is(value.localOffsetMinutes, -0), "negative-zero offset refused");
  return validateClockSample(value);
}
function ordered(first: Sample, last: Sample): void {
  need(first.localOffsetMinutes === last.localOffsetMinutes && first.zoneRulesSha256 === last.zoneRulesSha256 &&
    first.qpcFrequency === last.qpcFrequency && BigInt(first.utcAfterTicks) <= BigInt(last.utcBeforeTicks) &&
    BigInt(first.qpcAfter) <= BigInt(last.qpcBefore), "clock order, zone or frequency changed");
}

export class CurrentFootprintCopyWindowsClockIssuer {
  readonly #transport: CurrentFootprintCopyWindowsClockTransport;
  readonly #methods: readonly unknown[];
  readonly #request: CurrentFootprintCopyWindowsClockTransport["request"];
  readonly #assertOwned: CurrentFootprintCopyWindowsClockTransport["assertOwned"];
  readonly #assertCurrent: CurrentFootprintCopyWindowsClockTransport["assertCurrent"];
  readonly #binding: CurrentFootprintCopyWindowsClockBinding;
  readonly #originalBinding: CurrentFootprintCopyWindowsClockBinding;
  readonly #attempts = new Set<CurrentFootprintCopyWindowsClockPhase>();
  readonly #issued = new Map<CurrentFootprintCopyWindowsClockPhase, CurrentFootprintCopyWindowsClockObservation>();
  readonly #originals = new WeakSet<CurrentFootprintCopyWindowsClockObservation>();
  readonly #raw: unknown[] = [];
  #sequence = 0;
  #failed = false;
  #busy = false;
  public constructor(transport: CurrentFootprintCopyWindowsClockTransport, originalBinding: CurrentFootprintCopyWindowsClockBinding) {
    this.#methods = methods(transport); this.#transport = transport;
    this.#request = transport.request; this.#assertOwned = transport.assertOwned; this.#assertCurrent = transport.assertCurrent;
    this.#binding = freezeDeep(bindingSchema.parse(captureCurrentPcbStringClockReply(originalBinding).value));
    this.#originalBinding = originalBinding; this.#owned();
  }
  #same(): void {
    const capturedBinding = captureCurrentPcbStringClockReply(this.#originalBinding).value;
    need(methods(this.#transport).every((method, index) => method === this.#methods[index]) &&
      canonicalJson(bindingSchema.parse(capturedBinding)) === canonicalJson(this.#binding),
    "original transport or binding changed");
  }
  #owned(): void {
    this.#same(); this.#assertOwned.call(this.#transport); this.#same();
  }
  #current(phase: CurrentFootprintCopyWindowsClockPhase): void {
    this.#owned(); this.#assertCurrent.call(this.#transport, phase); this.#same();
  }
  public async observe(phase: CurrentFootprintCopyWindowsClockPhase): Promise<CurrentFootprintCopyWindowsClockObservation> {
    need(CURRENT_FOOTPRINT_COPY_WINDOWS_CLOCK_PHASES.includes(phase) && !this.#busy && !this.#attempts.has(phase) &&
      !this.#attempts.has("termination") && this.#sequence < CURRENT_FOOTPRINT_COPY_WINDOWS_CLOCK_LIMITS.nativeRequests, "phase consumed or busy");
    if (phase !== "termination") {
      need(!this.#failed && phase === CURRENT_FOOTPRINT_COPY_WINDOWS_CLOCK_PHASES[this.#issued.size], "live phase order differs");
    }
    this.#attempts.add(phase); this.#sequence += 1; this.#busy = true;
    const request = Object.freeze({ action: "footprint-copy-windows-clock" as const, phase, sequence: this.#sequence });
    try {
      this.#current(phase);
      const raw = captureCurrentPcbStringClockReply(await this.#request.call(this.#transport, request));
      this.#raw.push(raw.value); this.#current(phase);
      const reply = replySchema.parse(raw.value);
      need(reply.phase === phase && reply.sequence === request.sequence && canonicalJson(reply.binding) === canonicalJson(this.#binding), "native reply identity differs");
      const after = sample(reply.clock.after.sample), before = sample(reply.clock.before.sample);
      ordered(before, after);
      need(BigInt(after.utcAfterTicks) - BigInt(before.utcBeforeTicks) <= 100_000_000n &&
        BigInt(after.qpcAfter) - BigInt(before.qpcBefore) <= BigInt(before.qpcFrequency) * 10n, "native collection exceeds ten seconds");
      const previous = [...this.#issued.values()].at(-1);
      if (previous !== undefined) { ordered(previous.after, before); }
      this.#current(phase);
      const observation: CurrentFootprintCopyWindowsClockObservation = freezeDeep({
        profile: "private.current-footprint-copy-windows-clock.v1", phase, sequence: request.sequence, binding: this.#binding,
        before, after, originalTransportIssued: true, rawReplySha256: raw.sha256, nativeClockSamplesVerified: true,
        backendActorProvenanceVerified: false, documentClockProvenanceVerified: false, executionAuthorized: false, saveAuthorized: false,
      });
      this.#issued.set(phase, observation); this.#originals.add(observation); return observation;
    } catch (error) { this.#failed = true; throw error; }
    finally { this.#busy = false; }
  }
  /** Original completed samples remain historical evidence after root exit.
   * This never calls a live-phase assertion or grants a new clock request. */
  public requireRecorded(observation: CurrentFootprintCopyWindowsClockObservation): CurrentFootprintCopyWindowsClockObservation {
    need(this.#originals.has(observation) && this.#issued.get(observation.phase) === observation && !this.#busy, "original recorded observation required");
    this.#owned(); return observation;
  }
  public requireCurrent(observation: CurrentFootprintCopyWindowsClockObservation): CurrentFootprintCopyWindowsClockObservation {
    this.requireRecorded(observation);
    need(!this.#failed || observation.phase === "termination", "live observation failed");
    try { this.#current(observation.phase); return observation; }
    catch (error) { this.#failed = true; throw error; }
  }
  public evidence(): Readonly<{ phasesAttempted: readonly CurrentFootprintCopyWindowsClockPhase[];
    phasesObserved: readonly CurrentFootprintCopyWindowsClockPhase[]; rawReplies: readonly unknown[]; failed: boolean; busy: boolean;
    executionAuthorized: false }> {
    return Object.freeze({ phasesAttempted: Object.freeze([...this.#attempts]), phasesObserved: Object.freeze([...this.#issued.keys()]),
      rawReplies: Object.freeze([...this.#raw]), failed: this.#failed, busy: this.#busy, executionAuthorized: false });
  }
}
