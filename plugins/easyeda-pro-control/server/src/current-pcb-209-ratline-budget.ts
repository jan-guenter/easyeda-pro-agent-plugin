/** Fixed resource accounting for one original launch through the first ratline
 * child's held import. This ledger supplies neither target identity nor a
 * continuation capability. The same private instance must survive handoffs. */
import { types } from "node:util";
import { CURRENT_PCB_209_RATLINE_PCB_BOOTSTRAP_ROLES, CURRENT_PCB_209_RATLINE_PCB_BOOTSTRAP_SOURCES,
  CURRENT_PCB_209_RATLINE_PCB_BOOTSTRAP_SOURCE_PROFILE, currentPcb209RatlinePcbBootstrapCopy } from "./current-pcb-209-ratline-pcb-bootstrap-profile.ts";
import { CURRENT_PCB_209_RATLINE_BOOTSTRAP_ROLES, CURRENT_PCB_209_RATLINE_BOOTSTRAP_SOURCES } from "./current-pcb-209-ratline-bootstrap-profile.ts";
import { CURRENT_PCB_209_PRELOAD_COPY_SOURCE, CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCE_PROFILE } from "./current-pcb-209-worker-bootstrap-source.ts";
import { CURRENT_PCB_209_RATLINE_SOURCE_PROFILE } from "./current-pcb-209-ratline-source.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const chunkBytes = 65_536, envelope = 1024, mib = 1024 * 1024, pollIntervalMilliseconds = 20;
const ordinaryRequestMilliseconds = 2500;
function sourceSlot(stage: string, sourceBytes: number): Readonly<{ stage: string; sourceBytes: number; frameBytes: number; deadlineMilliseconds: number }> {
  // Six bytes per original UTF8 byte covers JSON escaping, including control
  // Characters and non-BMP surrogate pairs. The fixed envelope covers CDP IDs,
  // Session IDs, object keys, punctuation and the final pipe separator.
  const frameBytes = 6 * sourceBytes + envelope;
  return Object.freeze({ stage, sourceBytes, frameBytes,
    // A finite drain-opportunity allowance, not a transport throughput promise.
    // Native exchange deadlines and the original launch deadline also apply.
    deadlineMilliseconds: ordinaryRequestMilliseconds + (Math.ceil(frameBytes / chunkBytes) + 2) * pollIntervalMilliseconds });
}
const pcbSources = Object.freeze(CURRENT_PCB_209_RATLINE_PCB_BOOTSTRAP_ROLES.map(role => {
  const copy = currentPcb209RatlinePcbBootstrapCopy(role);
  if (copy !== null) { return sourceSlot(role, copy.generatedBytes); }
  if (role === "bootstrap") { return sourceSlot(role, Math.max(...CURRENT_PCB_209_RATLINE_PCB_BOOTSTRAP_SOURCES.map(text => Buffer.byteLength(text)))); }
  if (role === "define-top" || role === "preload" || role === "api" || role === "engine" || role === "pcb") {
    return sourceSlot(role, CURRENT_PCB_209_RATLINE_PCB_BOOTSTRAP_SOURCE_PROFILE[role].bytes);
  }
  throw new Error("PCB209_RATLINE_BUDGET_SOURCE_PROFILE");
}));
const childSources = Object.freeze(CURRENT_PCB_209_RATLINE_BOOTSTRAP_ROLES.map(role => {
  if (role === "bootstrap") { return sourceSlot(role, Math.max(...CURRENT_PCB_209_RATLINE_BOOTSTRAP_SOURCES.map(text => Buffer.byteLength(text)))); }
  if (role === "preload") { return sourceSlot(role, CURRENT_PCB_209_WORKER_BOOTSTRAP_SOURCE_PROFILE.preload.bytes); }
  if (role === "worker") { return sourceSlot(role, CURRENT_PCB_209_RATLINE_SOURCE_PROFILE.worker.bytes); }
  return sourceSlot(role, CURRENT_PCB_209_PRELOAD_COPY_SOURCE.generatedBytes);
}));
const requestClasses = freezeDeep({
  // This is the existing complete discovery/project-opening cap, including its
  // Retained reproof allowance. It is not 186 expected commands or a new budget
  // At handoff. Its original pipe retains its own reply/event validation.
  prefix: { count: 186, frameBytes: 32 * mib },
  preparation: { count: 10, frameBytes: mib },
  ancestry: { count: 3 * 4, frameBytes: mib },
  "pcb-source": { count: pcbSources.length, frameBytes: Math.max(...pcbSources.map(slot => slot.frameBytes)) },
  "child-source": { count: childSources.length, frameBytes: Math.max(...childSources.map(slot => slot.frameBytes)) },
  "pcb-bootstrap": { count: 4 + pcbSources.length + 1, frameBytes: envelope },
  "child-bootstrap": { count: 4 + childSources.length - 1 + 1, frameBytes: envelope },
  // Two breakpoints; URL/name; two inventories; two object handles;
  // Before/after resumes; two removals; one guarded child start.
  "pcb-construction": { count: 2 + 2 + 2 + 2 + 2 + 2 + 1, frameBytes: mib },
  // Five fixed capture breakpoints; bridge's three handles+relation;
  // Factory's handle+relation; two resumes. No callback/publication stage.
  "pcb-capture": { count: 5 + 4 + 2 + 2, frameBytes: mib },
  // Original prelude 32; two source instrumentation handles; construction's
  // Two breakpoints and parent pause; five capture breakpoints and one pause.
  cleanup: { count: 32 + 2 + 2 + 1 + 5 + 1, frameBytes: envelope },
} as const);
export type CurrentPcb209RatlineReplyKind = keyof typeof requestClasses;
const normalRequestLimit = Object.entries(requestClasses).reduce((sum, [kind, profile]) => sum + (kind === "cleanup" ? 0 : profile.count), 0);
const cleanupRequests = requestClasses.cleanup.count, requestLimit = normalRequestLimit + cleanupRequests;
const prefixBytes = 64 * mib;
const sourceBytes = [...pcbSources, ...childSources].reduce((sum, slot) => sum + slot.frameBytes, 0);
const ordinaryReplyBytes = Object.entries(requestClasses).reduce((sum, [kind, profile]) =>
  sum + (kind === "prefix" || kind === "pcb-source" || kind === "child-source" || kind === "cleanup" ? 0 : profile.count * profile.frameBytes), 0);
// Discovery's original parser reserves 4096 events/8MiB. The subsequent
// Project-startup parser gets a separately bounded 4096/8MiB reservation; both
// Still share the one 64 MiB raw prefix ceiling. No serialized counts transfer.
// Continuation includes all 4096 parent-router events, not only its 256 selected
// Source events, plus 128 first-child events. These availability caps can refuse
// An unusually busy environment before semantic capture completes.
const discoveryEventBytes = 8 * mib, discoveryEventCount = 4096;
const startupEventBytes = 8 * mib, startupEventCount = 4096;
const continuationEventBytes = 8 * mib + 256 * 1024, continuationEventCount = 4096 + 128;
const largestFrame = requestClasses["pcb-source"].frameBytes;
// Preserve room for the one final bounded rejected frame and the chunk which
// Reveals its excess. A refusal grants no subsequent normal dispatch.
const rejectedFrameBytes = largestFrame + chunkBytes;
const normalBytes = prefixBytes + sourceBytes + ordinaryReplyBytes + continuationEventBytes + rejectedFrameBytes;
const cleanupBytes = cleanupRequests * envelope, totalBytes = normalBytes + cleanupBytes;
const cleanupMilliseconds = 60 * 1000, normalMilliseconds = 60 * 60 * 1000;
// These waits cover the fixed awaited sub-operations, while each individual
// Acknowledgement keeps its ordinary deadline. None extends the launch clock.
const ancestryProofMilliseconds = 4 * ordinaryRequestMilliseconds;
const sourceReleaseMilliseconds = ancestryProofMilliseconds + ordinaryRequestMilliseconds;
const childArmMilliseconds = (4 + 1) * ordinaryRequestMilliseconds;
const creationContinuationMilliseconds = (4 + 5 + 2) * ordinaryRequestMilliseconds;
const capturePauseMilliseconds = requestClasses["pcb-capture"].count * ordinaryRequestMilliseconds;
const captureWaitMilliseconds = childSources.reduce((sum, slot) => sum + slot.deadlineMilliseconds, 0) +
  requestClasses["child-bootstrap"].count * ordinaryRequestMilliseconds + capturePauseMilliseconds;
const normalPollLimit = Math.ceil(normalMilliseconds / pollIntervalMilliseconds) +
  2 * normalRequestLimit + Math.ceil(normalBytes / chunkBytes);
const cleanupPollReserve = Math.ceil(cleanupMilliseconds / pollIntervalMilliseconds) +
  2 * cleanupRequests + Math.ceil(cleanupBytes / chunkBytes);
const pollLimit = normalPollLimit + cleanupPollReserve;
// Same per-request native reproof allowance as the existing fixed startup
// Profile. This is an availability cap; the composed owner must demonstrate
// That its actual retained callback graph fits, rather than resetting it.
const helperCleanupControlReserve = 128;
const helperControlMessages = 16 * requestLimit + helperCleanupControlReserve;
const helperNormalControlMessages = helperControlMessages - helperCleanupControlReserve;
const helperStdoutBytes = Math.ceil((4 * totalBytes + 8 * pollLimit) / 3) +
  (pollLimit + helperControlMessages) * envelope + 128 * 100_000;
export const CURRENT_PCB_209_RATLINE_NATIVE_PROFILE = freezeDeep({
  purpose: "worker-startup-ratline209", terminalStage: "first-child-held-import",
  normalRequestLimit, cleanupRequests, requestLimit, requestClasses,
  sources: { pcb: pcbSources, child: childSources },
  bytes: { prefix: prefixBytes, sources: sourceBytes, ordinaryReplies: ordinaryReplyBytes,
    continuationEvents: continuationEventBytes, rejectedFrame: rejectedFrameBytes,
    normal: normalBytes, cleanup: cleanupBytes, total: totalBytes, helperStdout: helperStdoutBytes },
  frames: { ordinary: mib, source: largestFrame, envelope, chunk: chunkBytes, outbound: 65_536 },
  events: { discoveryReservedCount: discoveryEventCount, discoveryReservedBytes: discoveryEventBytes,
    startupCount: startupEventCount, startupBytes: startupEventBytes,
    continuationCount: continuationEventCount, continuationBytes: continuationEventBytes,
    totalCount: discoveryEventCount + startupEventCount + continuationEventCount,
    totalBytes: discoveryEventBytes + startupEventBytes + continuationEventBytes },
  polling: { limit: pollLimit, normalLimit: normalPollLimit, cleanupReserve: cleanupPollReserve, intervalMilliseconds: pollIntervalMilliseconds },
  elapsed: { normalMilliseconds, cleanupMilliseconds, totalMilliseconds: normalMilliseconds + cleanupMilliseconds,
    ordinaryRequestMilliseconds, ancestryProofMilliseconds, sourceReleaseMilliseconds, childArmMilliseconds,
    creationContinuationMilliseconds, capturePauseMilliseconds, captureWaitMilliseconds, anchor: "original-monotonic-launch" },
  // One slot stays available for sequential cleanup after normal dispatch fails.
  discoveryRequestLimit: 19, normalPendingRequests: 31, pendingRequests: 32, helperControlMessages, helperNormalControlMessages, helperCleanupControlReserve,
} as const);

/** Original pending source slots select their own byte/deadline envelope.
 * A reply cannot select another class or repeat a slot by supplying metadata. */
export function currentPcb209RatlineSourceBudget(role: "pcb" | "child", ordinal: number): typeof pcbSources[number] {
  if ((role !== "pcb" && role !== "child") || !Number.isSafeInteger(ordinal) || ordinal < 0) { throw new Error("PCB209_RATLINE_BUDGET_SOURCE_SLOT"); }
  const slot = (role === "pcb" ? pcbSources : childSources)[ordinal];
  if (slot === undefined) { throw new Error("PCB209_RATLINE_BUDGET_SOURCE_SLOT"); } return slot;
}
const monotonicNow = process.hrtime.bigint.bind(process.hrtime);
const issued = new WeakSet<CurrentPcb209RatlineBudget>();
const normalResourceRefusals = new WeakMap<object, Readonly<{ budget: CurrentPcb209RatlineBudget; current: () => boolean }>>();
interface Reservation { readonly id: number; readonly kind: CurrentPcb209RatlineReplyKind; readonly frameBytes: number; readonly sourceOrdinal: number | null }
/** Create once before helper spawn. There is deliberately no prior usage,
 * timestamp, caller-selected limit or reset argument. Prefix parsing stays in
 * the original discovery/startup pipe; its fixed reservation stays charged. */
export class CurrentPcb209RatlineBudget {
  readonly #started = monotonicNow();
  readonly #counts = new Map<CurrentPcb209RatlineReplyKind, number>();
  readonly #pending = new Map<number, Reservation>();
  #phase: "prefix" | "continuation" | "cleanup" = "prefix";
  #failed = false;
  #normalResourceFailure = false;
  #closed = false;
  #discoveryOpen = true;
  #startupEvents = 0;
  #startupEventBytes = 0;
  #requests = 0;
  #prefixBytes = 0;
  #bytes = 0;
  #events = 0;
  #eventBytes = 0;
  #polls = 0;
  #helperControls = 0;
  #helperBytes = 0;
  public constructor() { issued.add(this); }
  #reject(code: string, normalResource = false): never {
    if (!normalResource) { this.#normalResourceFailure = false; }
    else if (!this.#failed) { this.#normalResourceFailure = true; }
    this.#failed = true; const error = new Error(`PCB209_RATLINE_BUDGET_${code}`);
    if (normalResource && this.#normalResourceFailure && this.#phase !== "cleanup" && !this.#closed) {
      normalResourceRefusals.set(error, Object.freeze({ budget: this, current: (): boolean => this.#normalResourceFailure && !this.#closed }));
    }
    throw error;
  }
  #number(value: number, minimum = 0): void { if (!Number.isSafeInteger(value) || value < minimum) { this.#reject("NUMBER"); } }
  #age(): number { return Number(monotonicNow() - this.#started) / 1_000_000; }
  public assertNormal(): void {
    if (this.#closed || this.#phase === "cleanup") { this.#reject("NORMAL_CLOSED"); }
    if (this.#failed) { this.#reject("NORMAL_CLOSED", this.#normalResourceFailure); }
    if (this.#age() > normalMilliseconds) { this.#reject("NORMAL_CLOSED", true); }
  }
  public assertCleanup(): void { if (this.#closed || this.#phase !== "cleanup" || this.#age() > normalMilliseconds + cleanupMilliseconds) { this.#reject("CLEANUP_CLOSED"); } }
  /** The actual owner must already have drained its prelude pending/buffer.
   * This one-way resource boundary does not certify that separate ownership. */
  public beginContinuation(): void {
    this.assertNormal(); if (this.#phase !== "prefix" || this.#discoveryOpen || this.#requests === 0 || this.#pending.size > 0) { this.#reject("CONTINUATION"); }
    this.#phase = "continuation";
  }
  public beginCleanup(): void { this.#phase = "cleanup"; }
  /** The original channel calls this after its native process/Job exit proof.
   * This only closes accounting; it cannot establish that external proof.
   * Late native release output remains bounded by the original stdout ledger. */
  public endAfterOriginalTermination(): void {
    this.#closed = true; this.#failed = true; this.#normalResourceFailure = false; this.#phase = "cleanup"; this.#pending.clear();
  }
  public consumeDiscoveryRequest(id: number): void {
    this.assertNormal(); this.#number(id, 1);
    if (!this.#discoveryOpen || this.#phase !== "prefix" || id !== this.#requests + 1 ||
        id > CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.discoveryRequestLimit) { this.#reject("DISCOVERY_REQUEST"); }
    this.#requests = id; this.#counts.set("prefix", id);
  }
  /** The actual discovery pipe has already proved no pending request/buffer.
   * Its next ID only checks this ledger's live count; it imports no usage. */
  public closeDiscovery(originalNextId: number): void {
    this.assertNormal(); this.#number(originalNextId, 1);
    if (!this.#discoveryOpen || this.#requests === 0 || originalNextId !== this.#requests + 1) { this.#reject("DISCOVERY_CLOSE"); }
    this.#discoveryOpen = false;
  }
  public consumeRequest(id: number, kind: CurrentPcb209RatlineReplyKind): Readonly<Reservation> {
    this.#number(id, 1);
    if (typeof kind !== "string" || !Object.hasOwn(requestClasses, kind)) { this.#reject("REPLY_KIND"); }
    if (kind === "cleanup") { this.assertCleanup(); } else { this.assertNormal(); }
    if (this.#discoveryOpen || id !== this.#requests + 1 || id > requestLimit || kind === "prefix" && this.#phase !== "prefix" ||
        kind !== "prefix" && kind !== "cleanup" && this.#phase !== "continuation") { this.#reject("REQUEST_ID_OR_PHASE"); }
    const count = this.#counts.get(kind) ?? 0, profile = requestClasses[kind];
    const pendingLimit = kind === "cleanup" ? CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.pendingRequests :
      CURRENT_PCB_209_RATLINE_NATIVE_PROFILE.normalPendingRequests;
    if (count >= profile.count || this.#pending.size >= pendingLimit) { this.#reject("REQUEST_LIMIT", kind !== "cleanup"); }
    const sourceOrdinal = kind === "pcb-source" || kind === "child-source" ? count : null;
    const frameBytes = sourceOrdinal === null ? profile.frameBytes : currentPcb209RatlineSourceBudget(kind === "pcb-source" ? "pcb" : "child", sourceOrdinal).frameBytes;
    const reservation = Object.freeze({ id, kind, sourceOrdinal, frameBytes });
    this.#requests = id; this.#counts.set(kind, count + 1);
    this.#pending.set(id, reservation); return reservation;
  }
  /** Count raw CDP pipe bytes exactly once, where the original helper's poll
   * data enters. Reply/event attribution below does not charge them again. */
  public consumePipeBytes(bytes: number): void {
    this.#number(bytes); this.#bytes += bytes;
    if (this.#phase === "prefix") { this.#prefixBytes += bytes; }
    if (this.#bytes > (this.#phase === "cleanup" ? totalBytes : normalBytes) || this.#prefixBytes > prefixBytes) { this.#reject("PIPE_BYTES"); }
  }
  /** Attribute complete framed bytes to the original outstanding request. Late
   * normal replies remain observable during cleanup without gaining authority. */
  public consumeReply(id: number, bytes: number): void {
    this.#number(id, 1); this.#number(bytes, 1); const pending = this.#pending.get(id);
    if (pending === undefined) { this.#reject("REPLY_BOUND"); }
    this.#pending.delete(id); if (bytes > pending.frameBytes) { this.#reject("REPLY_BOUND"); }
  }
  public pendingReplyFrameBytes(id: number): number {
    this.#number(id, 1); const pending = this.#pending.get(id);
    if (pending === undefined) { this.#reject("PENDING_ID"); } return pending.frameBytes;
  }
  public remainingRequests(kind: CurrentPcb209RatlineReplyKind): number {
    if (typeof kind !== "string" || !Object.hasOwn(requestClasses, kind)) { this.#reject("REPLY_KIND"); }
    return requestClasses[kind].count - (this.#counts.get(kind) ?? 0);
  }
  public consumeEvent(bytes: number): void {
    this.#number(bytes, 1); if (this.#discoveryOpen) { this.#reject("DISCOVERY_PARSER_OWNS_EVENTS"); }
    if (this.#phase === "prefix") {
      this.#startupEvents += 1; this.#startupEventBytes += bytes;
      if (bytes > mib || this.#startupEvents > startupEventCount || this.#startupEventBytes > startupEventBytes) { this.#reject("STARTUP_EVENT_BOUND"); }
      return;
    }
    this.#events += 1; this.#eventBytes += bytes;
    if (bytes > mib || this.#events > continuationEventCount || this.#eventBytes > continuationEventBytes) { this.#reject("EVENT_BOUND"); }
  }
  public consumePoll(): void {
    if (this.#phase === "cleanup") { this.assertCleanup(); } else { this.assertNormal(); }
    this.#polls += 1; if (this.#polls > (this.#phase === "cleanup" ? pollLimit : normalPollLimit)) { this.#reject("POLL_BOUND", this.#phase !== "cleanup"); }
  }
  /** Native termination/release controls may finish after CDP's deadline.
   * Their bounded count and stdout remain charged to this original ledger. */
  public consumeHelperControl(cleanup = false): void {
    if (typeof cleanup !== "boolean") { this.#reject("HELPER_CONTROL_KIND"); }
    const limit = cleanup ? helperControlMessages : helperNormalControlMessages;
    if (this.#helperControls >= limit) { this.#reject("HELPER_CONTROL_BOUND", !cleanup && this.#phase !== "cleanup"); } this.#helperControls += 1;
  }
  public consumeHelperStdout(bytes: number): void {
    this.#number(bytes); this.#helperBytes += bytes; if (this.#helperBytes > helperStdoutBytes) { this.#reject("HELPER_STDOUT_BOUND"); }
  }
  public snapshot(): Readonly<{ phase: "prefix" | "continuation" | "cleanup"; failed: boolean; closed: boolean; requests: number;
    discoveryOpen: boolean; reservedDiscoveryEvents: number; reservedDiscoveryEventBytes: number;
    observedStartupEvents: number; observedStartupEventBytes: number; prefixRequests: number; pendingReplies: number; receivedBytes: number; prefixBytes: number;
    continuationEvents: number; continuationEventBytes: number; polls: number; helperControls: number;
    helperStdoutBytes: number; elapsedMilliseconds: number }> {
    return Object.freeze({ phase: this.#phase, failed: this.#failed, closed: this.#closed, requests: this.#requests,
      discoveryOpen: this.#discoveryOpen, reservedDiscoveryEvents: discoveryEventCount, reservedDiscoveryEventBytes: discoveryEventBytes,
      observedStartupEvents: this.#startupEvents, observedStartupEventBytes: this.#startupEventBytes, prefixRequests: this.#counts.get("prefix") ?? 0, pendingReplies: this.#pending.size, receivedBytes: this.#bytes,
      prefixBytes: this.#prefixBytes, continuationEvents: this.#events, continuationEventBytes: this.#eventBytes,
      polls: this.#polls, helperControls: this.#helperControls, helperStdoutBytes: this.#helperBytes, elapsedMilliseconds: this.#age() });
  }
}
const methodNames = ["assertNormal", "assertCleanup", "beginContinuation", "beginCleanup", "consumeRequest", "consumePipeBytes", "consumeReply",
  "consumeDiscoveryRequest", "closeDiscovery", "endAfterOriginalTermination", "pendingReplyFrameBytes", "remainingRequests",
  "consumeEvent", "consumePoll", "consumeHelperControl", "consumeHelperStdout", "snapshot"] as const;
const methods = methodNames.map(name => CurrentPcb209RatlineBudget.prototype[name]);
export function assertOriginalCurrentPcb209RatlineBudget(budget: CurrentPcb209RatlineBudget): void {
  if (budget === null || typeof budget !== "object" || types.isProxy(budget) || !issued.has(budget) ||
      Object.getPrototypeOf(budget) !== CurrentPcb209RatlineBudget.prototype) { throw new Error("PCB209_RATLINE_BUDGET_ORIGINAL"); }
  for (const [index, name] of methodNames.entries()) {
    if (Object.hasOwn(budget, name) || Object.getOwnPropertyDescriptor(CurrentPcb209RatlineBudget.prototype, name)?.value !== methods[index]) {
      throw new Error("PCB209_RATLINE_BUDGET_ORIGINAL");
    }
  }
}

/** Only the exact refusal from this original ledger can preserve cleanup after
 * normal resource exhaustion. Malformed evidence or any later semantic failure
 * permanently invalidates that exception; matching error text proves nothing. */
export function isCurrentPcb209RatlineNormalResourceRefusal(error: unknown, budget: CurrentPcb209RatlineBudget): boolean {
  if (error === null || typeof error !== "object" || types.isProxy(error) || budget === null || typeof budget !== "object" ||
      types.isProxy(budget) || !issued.has(budget)) { return false; }
  const refusal = normalResourceRefusals.get(error);
  return refusal?.budget === budget && refusal.current();
}
