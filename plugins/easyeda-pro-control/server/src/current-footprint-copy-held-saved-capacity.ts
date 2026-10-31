/** Independent held-saved counters. Fixed ceilings and an original ledger
 * reference provide accounting custody, never native or saved-copy authority. */
import { types } from "node:util";
import { CURRENT_FOOTPRINT_COPY_HELD_SAVED_PROFILE as PROFILE } from "./current-footprint-copy-held-saved-profile.ts";
import { CURRENT_FOOTPRINT_COPY_EXECUTION_LIMITS as COORDINATOR } from "./current-footprint-copy-execution.ts";
import { CURRENT_FOOTPRINT_SAVED_CACHE_HELD_LIMITS as HELD } from "./current-footprint-saved-cache-held-profile.ts";
import { CURRENT_PCB_WORKER_STARTUP_STREAM_LIMITS as STREAM } from "./current-pcb-worker-startup-stream-limits.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

const MiB = 1024 * 1024;
const proofControlsPerStage = 2 * 2;
const proofStages = { start: 1, heldNormal: 3, open: 1, stateReads: 4, sourceReads: 2, heldRelease: 1 } as const;
const normalProofControls = (proofStages.start + proofStages.heldNormal + proofStages.open + proofStages.stateReads + proofStages.sourceReads) * proofControlsPerStage;
const cleanupProofControls = proofStages.heldRelease * proofControlsPerStage;
const normalCoreControls = { launch: 1, originalParentBind: 1 } as const;
const cleanupCoreControls = { window: 1, normalClose: COORDINATOR.normalCloseAttemptsPerGeneration,
  termination: COORDINATOR.terminationObservationsPerGeneration, ownerReleaseTermination: 1,
  channelTermination: 1, openingTransportTermination: 1, release: 1, originalJobAbort: 1 } as const;
const alternativeCleanupControls = { launchRefusal: { identity: 1, noProcessProof: 1, releaseNoProcess: 1 },
  unlaunched: { releaseUnlaunched: 1 } } as const;
const sum = (values: Readonly<Record<string, number>>): number => Object.values(values).reduce((total, value) => total + value, 0);
const normalControls = normalProofControls + sum(normalCoreControls);
const cleanupControls = cleanupProofControls + sum(cleanupCoreControls);
const cleanupReplyFrameBytes = HELD.replyBytes + 256;
const cleanupRaw = PROFILE.cleanupRequestLimit * cleanupReplyFrameBytes + STREAM.eventBytes;
const polls = { data: STREAM.dataPolls, idle: STREAM.idlePolls, wait: STREAM.waitPolls } as const;
// Fragment-round slack covers every bounded event and cleanup reply in addition
// To the raw-byte chunk count. Unbounded one-byte fragmentation can still refuse.
const cleanupPolls = { data: Math.ceil(cleanupRaw / STREAM.pollChunkBytes) + STREAM.eventCount + PROFILE.cleanupRequestLimit,
  idle: Math.ceil(PROFILE.cleanupMilliseconds / STREAM.idlePollMilliseconds),
  wait: Math.ceil(PROFILE.cleanupMilliseconds / STREAM.activePollMilliseconds) } as const;
const normalPolls = { data: polls.data - cleanupPolls.data, idle: polls.idle - cleanupPolls.idle, wait: polls.wait - cleanupPolls.wait } as const;
const base64 = (bytes: number): number => 4 * Math.ceil(bytes / 3);
/** Include per-chunk base64 rounding and every bounded poll/control envelope. */
function stdout(rawBytes: number, pollCount: number, commands: number, controls: number): number {
  return base64(rawBytes) + 4 * pollCount + (pollCount + commands + controls) * 512;
}
const normalRaw = STREAM.receivedBytes - cleanupRaw;
const normalStdout = Math.ceil(stdout(normalRaw, sum(normalPolls), PROFILE.normalRequestLimit, normalControls) / MiB) * MiB;
const cleanupStdout = Math.ceil(stdout(cleanupRaw, sum(cleanupPolls), PROFILE.cleanupRequestLimit, cleanupControls) / MiB) * MiB;

export const CURRENT_FOOTPRINT_COPY_HELD_SAVED_CAPACITY = freezeDeep({
  profile: "private.current-footprint-copy-held-saved-capacity.v1", purpose: PROFILE.purpose,
  renderer: { normalClassLimit: PROFILE.normalRequestLimit, cleanupClassLimit: PROFILE.cleanupRequestLimit,
    requestLimit: PROFILE.requestLimit, normalIdCeiling: PROFILE.normalIdCeiling, cleanupReplyFrameBytes,
    receivedBytes: STREAM.receivedBytes, normalReceivedBytes: normalRaw, cleanupReceivedBytes: cleanupRaw,
    eventCount: STREAM.eventCount, eventBytes: STREAM.eventBytes, eventFrameBytes: STREAM.frameBytes,
    polls, normalPolls, cleanupPolls },
  controls: { normal: normalControls, cleanup: cleanupControls, total: normalControls + cleanupControls,
    proofControlsPerStage, proofStages, normalProofControls, cleanupProofControls, normalCoreControls, cleanupCoreControls,
    alternativeCleanupControls,
    releaseObservations: COORDINATOR.releaseObservationsPerGeneration, releaseObservationNativeControls: 0 },
  normalHelperStdoutBytes: normalStdout, cleanupHelperStdoutBytes: cleanupStdout,
  helperStdoutBytes: normalStdout + cleanupStdout,
  helperReplyHeaderBytes: 512, heldReplyBytes: HELD.replyBytes,
  heldReplyCount: HELD.normal + HELD.cleanup, retainedHeldReplyBytes: HELD.aggregateReplyBytes,
  normalMilliseconds: PROFILE.normalMilliseconds, cleanupMilliseconds: PROFILE.cleanupMilliseconds,
  boundedFragmentationMayRefuse: true, fullWriterSqlJournalReservationIssued: false,
  nativeAuthorityIssued: false, executionAuthorized: false,
} as const);

type PollKind = keyof typeof polls;
type ByteKind = "renderer" | "helper-stdout";
interface Classes { normal: number; cleanup: number; }
function fail(code: string): never { throw new Error(`FOOTPRINT_HELD_SAVED_CAPACITY_${code}`); }
/** Reject coerced, negative, nonintegral or negative-zero counter input. */
function count(value: number): void { if (!Number.isSafeInteger(value) || value < 0 || Object.is(value, -0)) { fail("COUNT"); } }
const originalLedgers = new WeakSet<CurrentFootprintCopyHeldSavedResourceLedger>();

export class CurrentFootprintCopyHeldSavedResourceLedger {
  #owner: object | null = null;
  #failed = false;
  #id = 0;
  readonly #requests: Classes = { normal: 0, cleanup: 0 };
  readonly #controls: Classes = { normal: 0, cleanup: 0 };
  readonly #polls: Record<PollKind, Classes> = { data: { normal: 0, cleanup: 0 }, idle: { normal: 0, cleanup: 0 }, wait: { normal: 0, cleanup: 0 } };
  readonly #bytes: Record<ByteKind, Classes> = { renderer: { normal: 0, cleanup: 0 }, "helper-stdout": { normal: 0, cleanup: 0 } };
  #events = 0;
  #eventBytes = 0;
  #heldReplies = 0;
  #heldReplyBytes = 0;

  /** Allocate only counters. The genuine native factory must bind its own
   * retained receiver before attaching listeners or issuing any native work. */
  public constructor() { originalLedgers.add(this); }

  /** Bind one receiver once. Data equality and a copied owner cannot spend its
   * counters; this method itself does not authenticate a native process. */
  public bind(original: object): void {
    if (this.#owner !== null || this.#failed || original === null || typeof original !== "object" || types.isProxy(original)) { fail("BIND"); }
    this.#owner = original;
  }

  /** Require the factory-retained receiver and preserve cleanup after failure. */
  #original(original: object, cleanup = false): void {
    if (this.#owner === null || original !== this.#owner) { fail("ORIGINAL_OWNER"); }
    if (typeof cleanup !== "boolean" || this.#failed && !cleanup) { fail("CLEANUP_ONLY"); }
  }

  /** An exhausted fixed class never revives normal work or resets a counter. */
  #refuse(code: string): never { this.#failed = true; return fail(code); }

  /** Charge each global positive ID before send. Cleanup IDs may precede later
   * normal IDs without consuming normal-class slots or resetting this cursor. */
  public consumeRequest(original: object, id: number, cleanup: boolean): void {
    this.#original(original, cleanup); count(id);
    const kind = cleanup ? "cleanup" : "normal", limit = cleanup ? PROFILE.cleanupRequestLimit : PROFILE.normalRequestLimit;
    if (id !== this.#id + 1 || id > PROFILE.requestLimit || this.#requests[kind] >= limit) { this.#refuse("REQUEST"); }
    this.#id = id; this.#requests[kind] += 1;
  }

  /** Count only actual helper controls; pure original-context/status callbacks
   * consume no control and make no fresh Windows ownership claim. */
  public consumeControl(original: object, cleanup: boolean): void {
    this.#original(original, cleanup);
    const kind = cleanup ? "cleanup" : "normal", limit = cleanup ? cleanupControls : normalControls;
    if (this.#controls[kind] >= limit) { this.#refuse("CONTROL"); } this.#controls[kind] += 1;
  }

  /** Charge bounded poll classes without permitting normal work to spend the
   * terminal reserve. Extreme fragmentation may require original teardown. */
  public consumeRendererPoll(original: object, kind: PollKind, cleanup: boolean): void {
    this.#original(original, cleanup);
    if (kind !== "data" && kind !== "idle" && kind !== "wait") { this.#refuse("POLL_KIND"); }
    const phase = cleanup ? "cleanup" : "normal";
    const limit = cleanup ? cleanupPolls[kind] : normalPolls[kind];
    if (this.#polls[kind][phase] >= limit) { this.#refuse("POLL"); } this.#polls[kind][phase] += 1;
  }

  /** Charge events before retaining them. These bytes are a subset of actual
   * renderer chunk bytes; their separate event cap does not charge raw twice. */
  public consumeRendererEvent(original: object, bytes: number): void {
    this.#original(original, true); count(bytes);
    if (bytes === 0 || bytes > STREAM.frameBytes || this.#events >= STREAM.eventCount || this.#eventBytes + bytes > STREAM.eventBytes) { this.#refuse("EVENT"); }
    this.#events += 1; this.#eventBytes += bytes;
  }

  /** Bound original chunks before retention. Per-class byte counters protect
   * cleanup while sharing the unchanged total64MiB renderer ceiling. */
  public consumeBytes(original: object, kind: ByteKind, bytes: number, cleanup: boolean): void {
    this.#original(original, cleanup); count(bytes);
    if (kind !== "renderer" && kind !== "helper-stdout") { this.#refuse("BYTE_KIND"); }
    const phase = cleanup ? "cleanup" : "normal";
    let limit = cleanup ? cleanupStdout : normalStdout;
    if (kind === "renderer") { limit = cleanup ? cleanupRaw : normalRaw; }
    if (this.#bytes[kind][phase] + bytes > limit) { this.#refuse("BYTES"); } this.#bytes[kind][phase] += bytes;
  }

  /** Bound the separate inert held-result copies, independently of the raw
   * renderer/event/helper stream counters that already account their transport. */
  public consumeHeldReply(original: object, bytes: number): void {
    this.#original(original, true); count(bytes);
    if (bytes > HELD.replyBytes || this.#heldReplies >= HELD.normal + HELD.cleanup || this.#heldReplyBytes + bytes > HELD.aggregateReplyBytes) { this.#refuse("HELD_REPLY"); }
    this.#heldReplies += 1; this.#heldReplyBytes += bytes;
  }

  /** Mark an original accounting failure; only reserved cleanup can continue. */
  public fail(original: object): void { this.#original(original, true); this.#failed = true; }

  /** Inspect local counters only, including before native binding. No status
   * result is a process, realm, cache freshness or termination observation. */
  public status(original?: object): Readonly<{ bound: boolean; failed: boolean; nextRequestId: number;
    requests: Readonly<Classes>; controls: Readonly<Classes>; polls: Readonly<Record<PollKind, Readonly<Classes>>>;
    bytes: Readonly<Record<ByteKind, Readonly<Classes>>>; events: number; eventBytes: number;
    heldReplies: number; heldReplyBytes: number; nativeAuthorityIssued: false }> {
    if (original !== undefined) { this.#original(original, true); }
    return freezeDeep({ bound: this.#owner !== null, failed: this.#failed, nextRequestId: this.#id + 1,
      requests: { ...this.#requests }, controls: { ...this.#controls },
      polls: { data: { ...this.#polls.data }, idle: { ...this.#polls.idle }, wait: { ...this.#polls.wait } },
      bytes: { renderer: { ...this.#bytes.renderer }, "helper-stdout": { ...this.#bytes["helper-stdout"] } },
      events: this.#events, eventBytes: this.#eventBytes, heldReplies: this.#heldReplies, heldReplyBytes: this.#heldReplyBytes,
      nativeAuthorityIssued: false });
  }
}

const prototype = CurrentFootprintCopyHeldSavedResourceLedger.prototype;
const descriptors = Object.getOwnPropertyDescriptors(prototype);
/* oxlint-disable typescript/unbound-method -- Captured original methods are invoked only with the registry-checked private-field receiver. */
const methods = Object.freeze({ bind: prototype.bind, consumeRequest: prototype.consumeRequest, consumeControl: prototype.consumeControl,
  consumeRendererPoll: prototype.consumeRendererPoll, consumeRendererEvent: prototype.consumeRendererEvent,
  consumeBytes: prototype.consumeBytes, consumeHeldReply: prototype.consumeHeldReply, fail: prototype.fail, status: prototype.status });
/* oxlint-enable typescript/unbound-method */
export type CurrentFootprintCopyHeldSavedLedgerBinding = Readonly<Pick<CurrentFootprintCopyHeldSavedResourceLedger, keyof typeof methods> & { requireOriginal: () => void }>;
const bindings = new WeakMap<CurrentFootprintCopyHeldSavedResourceLedger, CurrentFootprintCopyHeldSavedLedgerBinding>();

/** Require one actual ledger and unchanged prototype methods, not supplied
 * counter/status JSON or a proxy wrapping another original receiver. */
function requireOriginal(ledger: CurrentFootprintCopyHeldSavedResourceLedger): void {
  if (ledger === null || typeof ledger !== "object" || types.isProxy(ledger) || !originalLedgers.has(ledger) ||
      Object.getPrototypeOf(ledger) !== prototype || Reflect.ownKeys(ledger).length > 0) { fail("ORIGINAL_LEDGER"); }
  const actual = Object.getOwnPropertyDescriptors(prototype);
  if (Reflect.ownKeys(actual).length !== Reflect.ownKeys(descriptors).length || Object.keys(descriptors).some(name => {
    const original = descriptors[name];
    const current = actual[name];
    return original === undefined || current === undefined || original.value !== current.value || original.get !== current.get ||
      original.set !== current.set || original.writable !== current.writable || original.configurable !== current.configurable || original.enumerable !== current.enumerable;
  })) { fail("ORIGINAL_METHODS"); }
  methods.status.call(ledger);
}

/** Capture the genuine fixed methods once. This proves accounting custody
 * only; the native factory separately owns its retained process/Job and leases. */
export function requireOriginalHeldSavedLedgerBinding(ledger: CurrentFootprintCopyHeldSavedResourceLedger): CurrentFootprintCopyHeldSavedLedgerBinding {
  requireOriginal(ledger); const prior = bindings.get(ledger); if (prior !== undefined) { return prior; }
  const binding: CurrentFootprintCopyHeldSavedLedgerBinding = Object.freeze({ requireOriginal: (): void => { requireOriginal(ledger); },
    bind: (...args: Parameters<CurrentFootprintCopyHeldSavedResourceLedger["bind"]>): void => { requireOriginal(ledger); methods.bind.call(ledger, ...args); },
    consumeRequest: (...args: Parameters<CurrentFootprintCopyHeldSavedResourceLedger["consumeRequest"]>): void => { requireOriginal(ledger); methods.consumeRequest.call(ledger, ...args); },
    consumeControl: (...args: Parameters<CurrentFootprintCopyHeldSavedResourceLedger["consumeControl"]>): void => { requireOriginal(ledger); methods.consumeControl.call(ledger, ...args); },
    consumeRendererPoll: (...args: Parameters<CurrentFootprintCopyHeldSavedResourceLedger["consumeRendererPoll"]>): void => { requireOriginal(ledger); methods.consumeRendererPoll.call(ledger, ...args); },
    consumeRendererEvent: (...args: Parameters<CurrentFootprintCopyHeldSavedResourceLedger["consumeRendererEvent"]>): void => { requireOriginal(ledger); methods.consumeRendererEvent.call(ledger, ...args); },
    consumeBytes: (...args: Parameters<CurrentFootprintCopyHeldSavedResourceLedger["consumeBytes"]>): void => { requireOriginal(ledger); methods.consumeBytes.call(ledger, ...args); },
    consumeHeldReply: (...args: Parameters<CurrentFootprintCopyHeldSavedResourceLedger["consumeHeldReply"]>): void => { requireOriginal(ledger); methods.consumeHeldReply.call(ledger, ...args); },
    fail: (...args: Parameters<CurrentFootprintCopyHeldSavedResourceLedger["fail"]>): void => { requireOriginal(ledger); methods.fail.call(ledger, ...args); },
    status: (...args: Parameters<CurrentFootprintCopyHeldSavedResourceLedger["status"]>) => { requireOriginal(ledger); return methods.status.call(ledger, ...args); } });
  bindings.set(ledger, binding); return binding;
}
