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
  nativeRequests: 4, collectionMilliseconds: 10_000, closedWindowMilliseconds: 60_000, executionAuthorized: false, saveAuthorized: false });
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
/** Retained numerical interval from this issuer's four original observations.
 * It does not authenticate the application's Date calls, RPC responder, native
 * create or SQL actor. The original native factory must still join those owners.
 * Ordered endpoint samples do not prove continuous UTC or timezone stability. */
export interface CurrentFootprintCopyWindowsClockWindow {
  readonly profile: "private.current-footprint-copy-windows-clock-window.v1";
  readonly binding: CurrentFootprintCopyWindowsClockBinding;
  readonly backendClockMinMs: number;
  readonly backendClockMaxMs: number;
  readonly backendLocalOffsetMinutes: number;
  readonly documentNativeDateMinMs: number;
  readonly documentNativeDateMaxMs: number;
  readonly zoneRulesSha256: string;
  readonly originalFourPhasesJoined: true;
  readonly continuousClockStabilityProved: false;
  readonly nativeDateCallProvenanceVerified: false;
  readonly documentClockProvenanceVerified: false;
  readonly executionAuthorized: false;
  readonly saveAuthorized: false;
}
export interface CurrentFootprintCopyDocumentClockWindow {
  readonly documentClockMinMs: number;
  readonly documentClockMaxMs: number;
  readonly documentNativeDateValues: readonly [number, number];
  readonly suppliedDocumentValuesOnly: true;
  readonly documentClockProvenanceVerified: false;
  readonly executionAuthorized: false;
}
const epochTicks = 621_355_968_000_000_000n;
/** Convert retained Windows UTC ticks to a safe nonnegative Unix millisecond value.
 * Reject out-of-range results instead of coercing them; this numerical conversion
 * neither samples a clock nor establishes its native provenance.
 */
function unixMilliseconds(ticks: string): number {
  // Date.now is an integer millisecond value. Preserve the containing floor
  // When converting the native 100ns sample instead of rounding it inwards.
  const value = Number((BigInt(ticks) - epochTicks) / 10_000n);
  need(Number.isSafeInteger(value) && value >= 0, "native clock conversion differs"); return value;
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
  #closedWindow: CurrentFootprintCopyWindowsClockWindow | null = null;
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
  /** A pure historical join after genuine original-root/whole-Job exit was
   * observed for termination. Missing, failed or overlong phases refuse; no new
   * native request, retry, source qualification or dispatch authority follows. */
  public closedWindow(): CurrentFootprintCopyWindowsClockWindow {
    need(!this.#busy && !this.#failed && this.#issued.size === 4, "complete original closed clock window required");
    this.#owned();
    const before = this.#issued.get("before");
    const armed = this.#issued.get("armed");
    const post = this.#issued.get("post");
    const termination = this.#issued.get("termination");
    need(before !== undefined && armed !== undefined && post !== undefined && termination !== undefined &&
      before.sequence === 1 && armed.sequence === 2 && post.sequence === 3 && termination.sequence === 4,
    "complete original closed clock window required");
    for (const observation of [before, armed, post, termination]) { this.requireRecorded(observation); }
    const first = before.before, last = termination.after;
    const maximum = BigInt(CURRENT_FOOTPRINT_COPY_WINDOWS_CLOCK_LIMITS.closedWindowMilliseconds);
    // Both independently ordered counters must fit the SQL comparator's fixed
    // One-minute envelope. This is a finite bound, not UTC/QPC calibration.
    need(BigInt(last.utcAfterTicks) - BigInt(first.utcBeforeTicks) <= maximum * 10_000n &&
      (BigInt(last.qpcAfter) - BigInt(first.qpcBefore)) * 1000n <= maximum * BigInt(first.qpcFrequency),
    "closed clock window exceeds one minute");
    const backendClockMinMs = unixMilliseconds(first.utcBeforeTicks);
    const backendClockMaxMs = unixMilliseconds(last.utcAfterTicks);
    const documentNativeDateMinMs = unixMilliseconds(armed.before.utcBeforeTicks);
    const documentNativeDateMaxMs = unixMilliseconds(post.after.utcAfterTicks);
    need(backendClockMaxMs - backendClockMinMs <= CURRENT_FOOTPRINT_COPY_WINDOWS_CLOCK_LIMITS.closedWindowMilliseconds &&
      documentNativeDateMinMs >= backendClockMinMs && documentNativeDateMaxMs <= backendClockMaxMs,
    "closed clock bounds differ");
    this.#owned();
    this.#closedWindow ??= freezeDeep({ profile: "private.current-footprint-copy-windows-clock-window.v1",
      binding: this.#binding, backendClockMinMs, backendClockMaxMs, backendLocalOffsetMinutes: first.localOffsetMinutes,
      documentNativeDateMinMs, documentNativeDateMaxMs, zoneRulesSha256: first.zoneRulesSha256,
      originalFourPhasesJoined: true, continuousClockStabilityProved: false, nativeDateCallProvenanceVerified: false,
      documentClockProvenanceVerified: false, executionAuthorized: false, saveAuthorized: false });
    return this.#closedWindow;
  }
  /** Accept only this issuer's original cached four-phase window, then reprove its
   * complete recorded closure. Equal copied JSON and foreign windows refuse without
   * issuing another clock request or granting dispatch authority.
   */
  public requireClosedWindow(window: CurrentFootprintCopyWindowsClockWindow): CurrentFootprintCopyWindowsClockWindow {
    need(window === this.#closedWindow && window !== null, "original closed clock window required");
    need(this.closedWindow() === window, "original closed clock window changed"); return window;
  }
  /** Check both independently supplied document results and lexical offsets
   * against the original armed-to-post interval. Equal result values are legal;
   * neither equality nor this numerical check proves an original native call. */
  public boundDocumentValues(window: CurrentFootprintCopyWindowsClockWindow,
    values: readonly [readonly [number, number], readonly [number, number]]): CurrentFootprintCopyDocumentClockWindow {
    this.requireClosedWindow(window);
    const raw = captureCurrentPcbStringClockReply(values).value;
    const scalar = z.number().int().min(-8_640_000_000_000_000).max(8_640_000_000_000_000);
    const document = z.number().int().positive().max(8_640_000_000_000_000);
    const pair = z.tuple([z.tuple([document, scalar]), z.tuple([document, scalar])]).parse(raw);
    const [first, second] = pair, firstNative = first[0] - first[1], secondNative = second[0] - second[1];
    need([firstNative, secondNative].every(value => Number.isSafeInteger(value) && !Object.is(value, -0) &&
      value >= window.documentNativeDateMinMs && value <= window.documentNativeDateMaxMs), "document native Date values outside original interval");
    const minimum = Math.min(first[0], second[0]);
    const maximum = Math.max(first[0], second[0]);
    need(maximum - minimum <= CURRENT_FOOTPRINT_COPY_WINDOWS_CLOCK_LIMITS.closedWindowMilliseconds,
      "document clock values exceed one minute");
    this.requireClosedWindow(window);
    return freezeDeep({ documentClockMinMs: minimum, documentClockMaxMs: maximum,
      documentNativeDateValues: [firstNative, secondNative], suppliedDocumentValuesOnly: true,
      documentClockProvenanceVerified: false, executionAuthorized: false });
  }
  public evidence(): Readonly<{ phasesAttempted: readonly CurrentFootprintCopyWindowsClockPhase[];
    phasesObserved: readonly CurrentFootprintCopyWindowsClockPhase[]; rawReplies: readonly unknown[]; failed: boolean; busy: boolean;
    executionAuthorized: false }> {
    return Object.freeze({ phasesAttempted: Object.freeze([...this.#attempts]), phasesObserved: Object.freeze([...this.#issued.keys()]),
      rawReplies: Object.freeze([...this.#raw]), failed: this.#failed, busy: this.#busy, executionAuthorized: false });
  }
}
