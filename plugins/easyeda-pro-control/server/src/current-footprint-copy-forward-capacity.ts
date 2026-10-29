/** Separate two-generation forward-copy ceilings. Existing preparation,
 * combined and four-generation profiles are unchanged. These finite resource
 * counters are not an original native owner or a writer admission token. */
/* oxlint-disable import/max-dependencies -- Derive each independent native/data limit from its maintained implementation instead of duplicating guessed counts. */
import { CURRENT_FOOTPRINT_COPY_ALLOCATED_CREATE_CLOCK_BUDGET as ALLOCATION } from "./current-footprint-copy-allocated-create-clock-budget.ts";
import { CURRENT_FOOTPRINT_COPY_EXECUTION_PROFILE as PREPARATION } from "./current-footprint-copy-execution-profile.ts";
import { CURRENT_FOOTPRINT_COPY_EXECUTION_LIMITS as COORDINATOR } from "./current-footprint-copy-execution.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_KNOWN_CAPACITY as MAIN } from "./current-footprint-copy-main-capacity.ts";
import { CURRENT_FOOTPRINT_COPY_MAIN_TRANSPORT as MAIN_STREAM } from "./current-footprint-copy-main-transport-contract.ts";
import { CURRENT_FOOTPRINT_COPY_NATIVE_CREATE_LIMITS as CREATE } from "./current-footprint-copy-native-create-wire.ts";
import { CURRENT_FOOTPRINT_COPY_PREPARATION_REQUESTS as SOURCE_PREPARATION } from "./current-footprint-copy-preparation.ts";
import { CURRENT_FOOTPRINT_COPY_SAVED_PROFILE as SAVED } from "./current-footprint-copy-saved-profile.ts";
import { CURRENT_FOOTPRINT_COPY_SOURCE_STAGE_REQUESTS as SOURCE } from "./current-footprint-copy-source-read-runner.ts";
import { CURRENT_PCB_WORKER_STARTUP_STREAM_LIMITS as STREAM } from "./current-pcb-worker-startup-stream-limits.ts";
import { MAX_ENCODED_BYTES as SQL_BYTES, freezeDeep } from "./sqlite-inventory-core.ts";
import { assertCurrentFootprintCopyOutputHeadroom, reserveCurrentFootprintCopyOutput } from "./current-footprint-copy-output-reservation.ts";
import type { CurrentFootprintCopyOutputReservation } from "./current-footprint-copy-output-reservation.ts";
import type { CurrentFootprintCopyV2Plan } from "./current-footprint-copy-v2-plan.ts";
import type { CurrentFootprintCopyV2SqlPlan } from "./current-footprint-copy-v2-sql.ts";

const MiB = 1024 * 1024;
const legacyClockCleanup = 5;
const normal = PREPARATION.normalRequestLimit - PREPARATION.requests.transactionClock + ALLOCATION.normal + SOURCE + SOURCE_PREPARATION;
const cleanup = PREPARATION.requests.cleanup - legacyClockCleanup + ALLOCATION.cleanup;
const rendererRequests = normal + cleanup;
const rendererPolls = STREAM.dataPolls + STREAM.idlePolls + STREAM.waitPolls;
const ownerControlsPerGeneration = 512;
// Fixed control responses have only bounded scalar/label fields. Binary poll
// Payloads are accounted separately. Every maximum poll, including empty polls,
// Retains its own 512-byte JSON/header allowance rather than disappearing from
// An optimistic sum of raw renderer/main byte caps.
const controlReplyBytes = 512;
const base64 = (bytes: number): number => 4 * Math.ceil(bytes / 3);
function stdout(rawBytes: number, polls: number, commands: number): number {
  // Each chunk can round independently; allow four extra bytes per data poll.
  const bytes = base64(rawBytes) + 4 * polls + (polls + commands + ownerControlsPerGeneration) * controlReplyBytes;
  return Math.ceil(bytes / MiB) * MiB;
}
const writerRawBytes = STREAM.receivedBytes + MAIN_STREAM.totalReceivedBytes;
const writerHelperBytes = stdout(writerRawBytes, rendererPolls + MAIN_STREAM.totalPolls, rendererRequests + MAIN.minimumTotal);
const savedHelperBytes = stdout(STREAM.receivedBytes, rendererPolls, SAVED.requestLimit);
const controlJournalBytes = 8 * MiB;
const savedObservationBytes = 2 * 2_097_152 + 4096;
const savedFrameBytes = 2 * savedObservationBytes + 4096;
const savedPacketBytes = 2 * 2_097_152 + 65_536;
const rejectedFrameBytes = base64(CREATE.responseFrameBytes) + 65_536;
const journalBytes = (COORDINATOR.journalRecords - 3) * controlJournalBytes +
  5 * CREATE.serializedResultBytes + 65_536 + savedPacketBytes + 65_536 + 16 * 131_072 + 65_536;
const artifactBytes = writerRawBytes + STREAM.receivedBytes + STREAM.eventBytes * 2 + MAIN_STREAM.totalReceivedBytes +
  3 * SQL_BYTES + CREATE.responseFrameBytes + rejectedFrameBytes + CREATE.serializedResultBytes +
  2 * savedFrameBytes + 2 * savedObservationBytes + 4 * 131_072 + savedPacketBytes;

export const CURRENT_FOOTPRINT_COPY_FORWARD_CAPACITY = freezeDeep({
  profile: "private.current-footprint-copy-forward-capacity.v1",
  purpose: "worker-startup-footprint-forward209",
  generations: ["forward-writer", "forward-saved-readback"], inverseAvailable: false,
  writer: {
    renderer: { normalClassLimit: normal, cleanupClassLimit: cleanup, requestLimit: rendererRequests,
      // Cleanup commands can precede later normal commands. This maximum ID is
      // Distinct from the number of normal-class commands, unlike old profiles.
      normalIdCeiling: rendererRequests, receivedBytes: STREAM.receivedBytes, eventCount: STREAM.eventCount,
      eventBytes: STREAM.eventBytes, polls: rendererPolls,
      stages: { preparationCeiling: PREPARATION.normalRequestLimit, removedLegacyClockNormal: PREPARATION.requests.transactionClock,
        removedLegacyClockCleanup: legacyClockCleanup, source: SOURCE, sourcePreparation: SOURCE_PREPARATION,
        allocatedCreateClockNormal: ALLOCATION.normal, allocatedCreateClockCleanup: ALLOCATION.cleanup,
        allocatedCreateClockTotal: ALLOCATION.total, handoffMaximum: ALLOCATION.handoffMaximum } },
    main: { normalClassLimit: MAIN.minimumNormal, cleanupClassLimit: MAIN.minimumCleanup, requestLimit: MAIN.minimumTotal,
      receivedBytes: MAIN_STREAM.totalReceivedBytes, messageBytes: MAIN_STREAM.messageBytes, eventCount: MAIN_STREAM.frames,
      polls: MAIN_STREAM.totalPolls },
    helperStdoutBytes: writerHelperBytes,
  },
  saved: { normalIdCeiling: SAVED.normalRequestLimit, requestLimit: SAVED.requestLimit,
    receivedBytes: STREAM.receivedBytes, eventCount: STREAM.eventCount, eventBytes: STREAM.eventBytes,
    helperStdoutBytes: savedHelperBytes },
  controls: { perGeneration: ownerControlsPerGeneration, replyHeaderBytes: controlReplyBytes,
    terminationObservationsPerGeneration: COORDINATOR.terminationObservationsPerGeneration,
    releaseObservationsPerGeneration: COORDINATOR.releaseObservationsPerGeneration,
    normalCloseAttemptsPerGeneration: COORDINATOR.normalCloseAttemptsPerGeneration, abortAttemptsPerGeneration: 1 },
  output: { rawRendererArtifactBytesPerGeneration: STREAM.receivedBytes, rawMainArtifactBytes: MAIN_STREAM.totalReceivedBytes,
    sqlSnapshots: 3, sqlSnapshotBytes: SQL_BYTES, journalRecords: COORDINATOR.journalRecords,
    controlJournalRecordBytes: controlJournalBytes, artifactBytes, journalBytes,
    helperStdoutBytes: writerHelperBytes + savedHelperBytes, retainedBytes: artifactBytes + journalBytes },
  normalMillisecondsPerGeneration: STREAM.lifetimeMilliseconds, cleanupMillisecondsPerGeneration: SAVED.cleanupMilliseconds,
  originalPrewriteRequirements: ["sealed-disposable-source-and-whole-checkpoint", "fresh-complete-source-and-copy-argument-custody",
    "original-branch-head-eligibility-before-create", "original-current-empty-queues-and-sole-upload-route",
    "original-paired-native-clocks-and-main-backend-issuer", "born-forward-native-resource-counters",
    "original-saved-generation-replay-exclusion"],
  nativePurposeMounted: false, wholeFourGenerationBudgetReserved: false, executionAuthorized: false,
} as const);

export type CurrentFootprintCopyForwardRole = "forward-writer" | "forward-saved-readback";
const originalOutputs = new WeakSet<CurrentFootprintCopyOutputReservation>();
/** Once actual original SQL/copy plans exist, narrow their data reservation
 * inside the fixed prelaunch upper envelope. Future clocks are not fabricated
 * merely to obtain a SQL plan before native allocation. This function grants
 * neither a head/queue witness nor dispatch authority. */
export function reserveCurrentFootprintCopyForwardOutput(copy: CurrentFootprintCopyV2Plan,
  sql: CurrentFootprintCopyV2SqlPlan): CurrentFootprintCopyOutputReservation {
  const maximum = CURRENT_FOOTPRINT_COPY_FORWARD_CAPACITY.output, result = reserveCurrentFootprintCopyOutput(copy, sql);
  if (result.artifactBytes > maximum.artifactBytes || result.journalBytes > maximum.journalBytes ||
      result.slots["journal-control"].bytes > maximum.controlJournalRecordBytes) { fail("DATA_OUTPUT"); }
  originalOutputs.add(result); return result;
}
export function requireCurrentFootprintCopyForwardOutput(result: CurrentFootprintCopyOutputReservation): void {
  if (!originalOutputs.has(result)) { fail("ORIGINAL_OUTPUT"); }
  assertCurrentFootprintCopyOutputHeadroom(result, CURRENT_FOOTPRINT_COPY_FORWARD_CAPACITY.output.artifactBytes,
    CURRENT_FOOTPRINT_COPY_FORWARD_CAPACITY.output.journalBytes);
}
type StreamKind = "renderer" | "renderer-event" | "main" | "helper-stdout" | "artifact" | "journal";
const rendererPollLimits = Object.freeze({ data: STREAM.dataPolls, idle: STREAM.idlePolls, wait: STREAM.waitPolls });
type RendererPollKind = keyof typeof rendererPollLimits;
interface Generation {
  readonly original: object;
  rendererId: number;
  rendererNormal: number;
  rendererCleanup: number;
  mainId: number;
  mainNormal: number;
  mainCleanup: number;
  controls: number;
  readonly rendererPolls: Record<RendererPollKind, number>;
  mainPolls: number;
  rendererEvents: number;
  mainFrames: number;
  readonly bytes: Map<StreamKind, number>;
}
function fail(code: string): never { throw new Error(`FOOTPRINT_FORWARD_CAPACITY_${code}`); }
function count(value: number): void { if (!Number.isSafeInteger(value) || value < 0 || Object.is(value, -0)) { fail("COUNT"); } }

/** A genuine future native factory must retain this counter and feed the
 * original validated sends/chunks BEFORE dispatch or retention. Callers cannot
 * choose larger limits; copied references cannot spend another generation's
 * slots. This class does not authenticate its supplied owner reference and
 * cannot replace the original native factory/termination/eligibility checks. */
export class CurrentFootprintCopyForwardResourceLedger {
  readonly #generations = new Map<CurrentFootprintCopyForwardRole, Generation>();
  readonly #aggregateBytes = new Map<"artifact" | "journal", number>();
  #failed = false;
  public bind(role: CurrentFootprintCopyForwardRole, original: object): void {
    if (this.#failed || !CURRENT_FOOTPRINT_COPY_FORWARD_CAPACITY.generations.includes(role) || this.#generations.has(role) ||
        original === null || typeof original !== "object" || [...this.#generations.values()].some(value => value.original === original)) { fail("GENERATION"); }
    this.#generations.set(role, { original, rendererId: 0, rendererNormal: 0, rendererCleanup: 0,
      mainId: 0, mainNormal: 0, mainCleanup: 0, controls: 0, rendererPolls: { data: 0, idle: 0, wait: 0 },
      mainPolls: 0, rendererEvents: 0, mainFrames: 0, bytes: new Map() });
  }
  #original(role: CurrentFootprintCopyForwardRole, original: object): Generation {
    const value = this.#generations.get(role); if (value === undefined || value.original !== original) { fail("ORIGINAL_GENERATION"); } return value;
  }
  #refuse(code: string): never { this.#failed = true; return fail(code); }
  public consumeRequest(role: CurrentFootprintCopyForwardRole, original: object, channel: "renderer" | "main", id: number, cleanupRequest: boolean): void {
    const value = this.#original(role, original); count(id);
    if (typeof cleanupRequest !== "boolean" || this.#failed && !cleanupRequest) { fail("REQUEST_CLASS"); }
    const profile = CURRENT_FOOTPRINT_COPY_FORWARD_CAPACITY;
    if (channel === "main") {
      if (role !== "forward-writer" || id !== value.mainId + 1 || id > profile.writer.main.requestLimit ||
          (cleanupRequest ? value.mainCleanup >= profile.writer.main.cleanupClassLimit : value.mainNormal >= profile.writer.main.normalClassLimit)) { this.#refuse("MAIN_REQUEST"); }
      value.mainId = id; if (cleanupRequest) { value.mainCleanup += 1; } else { value.mainNormal += 1; } return;
    }
    const total = role === "forward-writer" ? profile.writer.renderer.requestLimit : profile.saved.requestLimit;
    const normalLimit = role === "forward-writer" ? profile.writer.renderer.normalClassLimit : profile.saved.normalIdCeiling;
    const cleanupLimit = role === "forward-writer" ? profile.writer.renderer.cleanupClassLimit : profile.saved.requestLimit - profile.saved.normalIdCeiling;
    const normalId = role === "forward-writer" ? profile.writer.renderer.normalIdCeiling : profile.saved.normalIdCeiling;
    if (channel !== "renderer" || id !== value.rendererId + 1 || id > total || !cleanupRequest && id > normalId ||
        (cleanupRequest ? value.rendererCleanup >= cleanupLimit : value.rendererNormal >= normalLimit)) { this.#refuse("RENDERER_REQUEST"); }
    value.rendererId = id; if (cleanupRequest) { value.rendererCleanup += 1; } else { value.rendererNormal += 1; }
  }
  /** The original renderer classifies a completed poll before processing its
   * bytes or issuing another poll. Data, idle and request-wait allowances are
   * cumulative and shared by normal and cleanup work within one generation. */
  public consumeRendererPoll(role: CurrentFootprintCopyForwardRole, original: object, kind: RendererPollKind, cleanupPoll = false): void {
    const value = this.#original(role, original);
    if (typeof kind !== "string" || !Object.hasOwn(rendererPollLimits, kind) || typeof cleanupPoll !== "boolean" ||
        this.#failed && !cleanupPoll) { fail("POLL_CLASS"); }
    if (value.rendererPolls[kind] >= rendererPollLimits[kind]) { this.#refuse("RENDERER_POLL"); }
    value.rendererPolls[kind] += 1;
  }
  /** Mirrors the native main transport's one cumulative cursor. Cleanup can
   * use its terminal reserve, but cannot reset the normal poll-ID ceiling. */
  public consumeMainPoll(role: CurrentFootprintCopyForwardRole, original: object, cleanupPoll = false): void {
    const value = this.#original(role, original);
    if (typeof cleanupPoll !== "boolean" || this.#failed && !cleanupPoll) { fail("POLL_CLASS"); }
    if (role !== "forward-writer" || value.mainPolls >= (cleanupPoll ? MAIN_STREAM.totalPolls : MAIN_STREAM.normalPolls)) { this.#refuse("MAIN_POLL"); }
    value.mainPolls += 1;
  }
  /** Count every original renderer event and its subset of received bytes
   * before retention. Raw chunk bytes are independently charged as renderer
   * bytes, including replies; this method does not charge those bytes twice. */
  public consumeRendererEvent(role: CurrentFootprintCopyForwardRole, original: object, bytes: number): void {
    const value = this.#original(role, original); count(bytes);
    const used = value.bytes.get("renderer-event") ?? 0;
    if (bytes === 0 || bytes > STREAM.frameBytes || value.rendererEvents >= STREAM.eventCount || used + bytes > STREAM.eventBytes) { this.#refuse("RENDERER_EVENT"); }
    value.rendererEvents += 1; value.bytes.set("renderer-event", used + bytes);
  }
  /** Main's native limit covers all WebSocket frames: replies, events,
   * continuation and control frames. Zero-length control payloads still count.
   * Received wire bytes remain independently charged at the chunk boundary. */
  public consumeMainFrame(role: CurrentFootprintCopyForwardRole, original: object, bytes: number): void {
    const value = this.#original(role, original); count(bytes);
    if (role !== "forward-writer" || bytes > MAIN_STREAM.messageBytes || value.mainFrames >= MAIN_STREAM.frames) { this.#refuse("MAIN_FRAME"); }
    value.mainFrames += 1;
  }
  public consumeBytes(role: CurrentFootprintCopyForwardRole, original: object, kind: StreamKind, bytes: number): void {
    const value = this.#original(role, original); count(bytes);
    const profile = CURRENT_FOOTPRINT_COPY_FORWARD_CAPACITY;
    const aggregate = kind === "artifact" || kind === "journal";
    const used = aggregate ? this.#aggregateBytes.get(kind) ?? 0 : value.bytes.get(kind) ?? 0;
    const limits: Readonly<Record<StreamKind, number>> = {
      renderer: STREAM.receivedBytes, "renderer-event": STREAM.eventBytes,
      main: role === "forward-writer" ? MAIN_STREAM.totalReceivedBytes : 0,
      "helper-stdout": role === "forward-writer" ? profile.writer.helperStdoutBytes : profile.saved.helperStdoutBytes,
      artifact: profile.output.artifactBytes, journal: profile.output.journalBytes,
    };
    if (!Object.hasOwn(limits, kind) || !Number.isSafeInteger(used + bytes) || used + bytes > limits[kind]) { this.#refuse("BYTES"); }
    if (aggregate) { this.#aggregateBytes.set(kind, used + bytes); } else { value.bytes.set(kind, used + bytes); }
  }
  public consumeControl(role: CurrentFootprintCopyForwardRole, original: object, cleanupControl = false): void {
    const value = this.#original(role, original);
    if (typeof cleanupControl !== "boolean" || this.#failed && !cleanupControl) { fail("CONTROL_CLASS"); }
    if (value.controls >= CURRENT_FOOTPRINT_COPY_FORWARD_CAPACITY.controls.perGeneration) { this.#refuse("CONTROL"); } value.controls += 1;
  }
  public status(): Readonly<{ failed: boolean; boundGenerations: number; rendererRequests: number; mainRequests: number; controls: number;
    rendererPolls: number; mainPolls: number; rendererEvents: number; mainFrames: number; executionAuthorized: false }> {
    const values = [...this.#generations.values()]; return Object.freeze({ failed: this.#failed, boundGenerations: values.length,
      rendererRequests: values.reduce((sum, value) => sum + value.rendererId, 0), mainRequests: values.reduce((sum, value) => sum + value.mainId, 0),
      controls: values.reduce((sum, value) => sum + value.controls, 0),
      rendererPolls: values.reduce((sum, value) => sum + value.rendererPolls.data + value.rendererPolls.idle + value.rendererPolls.wait, 0),
      mainPolls: values.reduce((sum, value) => sum + value.mainPolls, 0), rendererEvents: values.reduce((sum, value) => sum + value.rendererEvents, 0),
      mainFrames: values.reduce((sum, value) => sum + value.mainFrames, 0), executionAuthorized: false });
  }
}
