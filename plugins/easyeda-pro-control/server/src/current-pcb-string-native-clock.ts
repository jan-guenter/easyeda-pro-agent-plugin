/** String-only original clock issuance. The enclosing diagnostic owner supplies
 * its retained native transport and binding. No ordinary/rename token, public
 * boolean or historical JSON can enter this issuer as an observation. */
import { types } from "node:util";
import { canonicalJson } from "./core.ts";
import { captureCurrentPcbStringClockReply } from "./current-pcb-string-clock-reply.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";
import { validateClockSample } from "./windows-clock-transport.ts";

export const CURRENT_PCB_STRING_NATIVE_CLOCK_PHASES = Object.freeze(["before", "armed", "post", "termination"] as const);
export type CurrentPcbStringNativeClockPhase = typeof CURRENT_PCB_STRING_NATIVE_CLOCK_PHASES[number];
export interface CurrentPcbStringNativeClockBinding {
  readonly helperInstance: string; readonly jobId: string; readonly rootPid: number; readonly rootCreated: string;
}
type Sample = ReturnType<typeof validateClockSample>;
export interface CurrentPcbStringNativeClockRequest {
  readonly action: "string-clock"; readonly phase: CurrentPcbStringNativeClockPhase; readonly sequence: number;
}
export interface CurrentPcbStringNativeClockTransport {
  readonly request: (request: CurrentPcbStringNativeClockRequest) => Promise<unknown>;
  /** Must use the original owner's retained process/Job and installation lease.
   * For termination, it must accept only genuinely observed root/whole-Job exit. */
  readonly assertCurrent: (phase: CurrentPcbStringNativeClockPhase) => void;
}
export const CURRENT_PCB_STRING_NATIVE_CLOCK_LIMITS = Object.freeze({ nativeOwnerAdmissionVerified: false,
  originalClockedLaunchVerified: false, appClockDirectlyObserved: false, continuousClockStabilityProved: false,
  futureSaveClockVerified: false, backendActorProvenanceVerified: false, saveAuthorized: false, executionAuthorized: false } as const);
export interface CurrentPcbStringNativeClockObservation extends Readonly<typeof CURRENT_PCB_STRING_NATIVE_CLOCK_LIMITS> {
  readonly profile: "private.current-pcb-string-native-clock.v1";
  readonly phase: CurrentPcbStringNativeClockPhase; readonly sequence: number;
  readonly binding: CurrentPcbStringNativeClockBinding;
  readonly before: Sample; readonly after: Sample;
  readonly originalTransportIssued: true; readonly tzAbsentBefore: true; readonly tzAbsentAfter: true;
  readonly nativeClockSamplesVerified: true; readonly rawReplySha256: string;
}
function need(value: boolean, detail: string): asserts value {
  if (!value) { throw new Error(`PCB_STRING_NATIVE_CLOCK: ${detail}`); }
}
function own(value: unknown, names: readonly string[]): Record<string, unknown> {
  need(value !== null && typeof value === "object" && !types.isProxy(value) && !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null), "plain own data required");
  const keys = Reflect.ownKeys(value);
  need(keys.length === names.length && keys.every(key => typeof key === "string" && names.includes(key)), "exact fields required");
  return Object.fromEntries(names.map(name => {
    const descriptor = Object.getOwnPropertyDescriptor(value, name);
    need(descriptor !== undefined && Object.hasOwn(descriptor, "value"), "accessors refused");
    return [name, descriptor.value as unknown];
  }));
}
function binding(value: unknown): CurrentPcbStringNativeClockBinding {
  const data = own(value, ["helperInstance", "jobId", "rootPid", "rootCreated"]);
  need(typeof data["helperInstance"] === "string" && /^[a-f\d]{32}$/u.test(data["helperInstance"]) &&
    typeof data["jobId"] === "string" && /^[a-f\d]{32}$/u.test(data["jobId"]) &&
    typeof data["rootPid"] === "number" && Number.isSafeInteger(data["rootPid"]) && data["rootPid"] > 0 && data["rootPid"] <= 2_147_483_647 &&
    typeof data["rootCreated"] === "string" && /^[1-9]\d{14,19}$/u.test(data["rootCreated"]), "original native binding differs");
  return Object.freeze({ helperInstance: data["helperInstance"], jobId: data["jobId"], rootPid: data["rootPid"], rootCreated: data["rootCreated"] });
}
function sample(value: unknown): Sample {
  const data = own(value, ["schema", "utcBeforeTicks", "utcAfterTicks", "qpcBefore", "qpcAfter", "qpcFrequency",
    "highResolution", "localOffsetMinutes", "zoneRulesSha256"]);
  need(!Object.is(data["localOffsetMinutes"], -0), "negative-zero offset refused");
  return validateClockSample(data);
}
function ordered(first: Sample, last: Sample): void {
  need(first.localOffsetMinutes === last.localOffsetMinutes && first.zoneRulesSha256 === last.zoneRulesSha256 &&
    first.qpcFrequency === last.qpcFrequency && BigInt(first.utcAfterTicks) <= BigInt(last.utcBeforeTicks) &&
    BigInt(first.qpcAfter) <= BigInt(last.qpcBefore), "clock order/timezone/frequency changed");
}
function decode(raw: unknown, request: CurrentPcbStringNativeClockRequest, original: CurrentPcbStringNativeClockBinding): Readonly<{
  before: Sample; after: Sample;
}> {
  const data = own(raw, ["schema", "phase", "sequence", "binding", "clock"]);
  need(data["schema"] === "easyeda-pro-control.pcb-string-native-clock.v1" && data["phase"] === request.phase &&
    data["sequence"] === request.sequence && canonicalJson(binding(data["binding"])) === canonicalJson(original), "native clock reply identity differs");
  const clock = own(data["clock"], ["before", "after"]);
  const observation = (value: unknown): Sample => {
    const record = own(value, ["tzAbsent", "reason", "sample"]);
    need(record["tzAbsent"] === true && record["reason"] === null, "clock unavailable or TZ not proved absent");
    return sample(record["sample"]);
  };
  const after = observation(clock["after"]), before = observation(clock["before"]);
  ordered(before, after);
  need(BigInt(after.utcAfterTicks) - BigInt(before.utcBeforeTicks) <= 100_000_000n &&
    BigInt(after.qpcAfter) - BigInt(before.qpcBefore) <= BigInt(before.qpcFrequency) * 10n, "native observation exceeds ten seconds");
  return { before, after };
}
/** Private one-owner factory. Retain this object inside the genuine diagnostic
 * owner; do not expose its constructor or transport through MCP. Unit tests may
 * supply a synthetic transport, which is not connected/native qualification. */
export class CurrentPcbStringNativeClockIssuer {
  readonly #binding: CurrentPcbStringNativeClockBinding;
  readonly #originalBinding: CurrentPcbStringNativeClockBinding;
  readonly #transport: CurrentPcbStringNativeClockTransport;
  readonly #request: CurrentPcbStringNativeClockTransport["request"];
  readonly #assertCurrent: CurrentPcbStringNativeClockTransport["assertCurrent"];
  readonly #attempts = new Set<CurrentPcbStringNativeClockPhase>();
  readonly #issued = new Map<CurrentPcbStringNativeClockPhase, CurrentPcbStringNativeClockObservation>();
  readonly #originals = new WeakSet<CurrentPcbStringNativeClockObservation>();
  readonly #raw = new Map<CurrentPcbStringNativeClockPhase, unknown>();
  #sequence = 0;
  #failed = false;
  #inFlight = false;
  public constructor(transport: CurrentPcbStringNativeClockTransport, originalBinding: CurrentPcbStringNativeClockBinding) {
    const methods = own(transport, ["request", "assertCurrent"]);
    need(typeof methods["request"] === "function" && typeof methods["assertCurrent"] === "function", "original methods required");
    this.#transport = transport; this.#request = transport.request; this.#assertCurrent = transport.assertCurrent;
    this.#binding = binding(originalBinding); this.#originalBinding = originalBinding;
  }
  #current(phase: CurrentPcbStringNativeClockPhase): void {
    const methods = own(this.#transport, ["request", "assertCurrent"]);
    need(methods["request"] === this.#request && methods["assertCurrent"] === this.#assertCurrent &&
      canonicalJson(binding(this.#originalBinding)) === canonicalJson(this.#binding), "original native transport or binding changed");
    this.#assertCurrent.call(this.#transport, phase);
  }
  public async observe(phase: CurrentPcbStringNativeClockPhase): Promise<CurrentPcbStringNativeClockObservation> {
    need(CURRENT_PCB_STRING_NATIVE_CLOCK_PHASES.includes(phase) && !this.#attempts.has(phase) && !this.#inFlight &&
      !this.#attempts.has("termination"), "original phase consumed or busy");
    if (phase !== "termination") {
      need(!this.#failed && phase === CURRENT_PCB_STRING_NATIVE_CLOCK_PHASES[this.#issued.size], "original live phase order differs");
    }
    this.#attempts.add(phase); this.#sequence += 1; this.#inFlight = true;
    const request = Object.freeze({ action: "string-clock" as const, phase, sequence: this.#sequence });
    try {
      this.#current(phase);
      const raw = captureCurrentPcbStringClockReply(await this.#request.call(this.#transport, request));
      this.#raw.set(phase, raw.value); this.#current(phase);
      const result = decode(raw.value, request, this.#binding);
      const previous = [...this.#issued.values()].at(-1); if (previous !== undefined) { ordered(previous.after, result.before); }
      this.#current(phase);
      const token: CurrentPcbStringNativeClockObservation = freezeDeep({ profile: "private.current-pcb-string-native-clock.v1", phase,
        sequence: request.sequence, binding: this.#binding, ...result, rawReplySha256: raw.sha256, originalTransportIssued: true, tzAbsentBefore: true,
        tzAbsentAfter: true, nativeClockSamplesVerified: true, ...CURRENT_PCB_STRING_NATIVE_CLOCK_LIMITS });
      this.#issued.set(phase, token); this.#originals.add(token); return token;
    } catch (error) { this.#failed = true; throw error; }
    finally { this.#inFlight = false; }
  }
  public requireOriginal(token: CurrentPcbStringNativeClockObservation): CurrentPcbStringNativeClockObservation {
    need(this.#originals.has(token) && this.#issued.get(token.phase) === token && !this.#inFlight && (!this.#failed || token.phase === "termination"),
      "original current String native clock required");
    try { this.#current(token.phase); return token; } catch (error) { this.#failed = true; throw error; }
  }
  public evidence(): Readonly<{ phasesAttempted: readonly CurrentPcbStringNativeClockPhase[];
    phasesObserved: readonly CurrentPcbStringNativeClockPhase[]; rawReplies: readonly unknown[]; failed: boolean; inFlight: boolean;
    executionAuthorized: false }> {
    return Object.freeze({ phasesAttempted: [...this.#attempts], phasesObserved: [...this.#issued.keys()],
      rawReplies: [...this.#raw.values()], failed: this.#failed, inFlight: this.#inFlight, executionAuthorized: false });
  }
}
