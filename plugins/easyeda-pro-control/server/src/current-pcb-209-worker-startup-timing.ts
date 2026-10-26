/** Fixed 3.2.209 serial await graph, not caller-selectable timeouts. Small
 * commands and owner proofs keep their original two-second ceilings. The
 * source-transfer leaf has separate byte-derived delivery allowances inside
 * these unchanged stage/launch caps; not every subordinate maximum is promised
 * to fit. Pause caps include acknowledgments arriving after the next pause. */
import { performance } from "node:perf_hooks";

const REQUEST_MS = 2000;
const OWNER_MS = REQUEST_MS;
const READ_MS = OWNER_MS + REQUEST_MS + OWNER_MS;
const RESUME_MS = REQUEST_MS + REQUEST_MS;
const BREAKPOINTS = 8;
const ARM_MS = OWNER_MS + BREAKPOINTS * READ_MS;
const SOURCE_MS = OWNER_MS + REQUEST_MS + OWNER_MS;
const SOURCE_CARRY_MS = REQUEST_MS + OWNER_MS;
// Project-end captures lexical constructors and two own manager selectors.
// Base-end additionally retains its just-installed original cache factory.
const constructionReads = [3, 3, 3, 4, 4, 4, 3, 5, 1] as const;
const SOURCE_PHASES = 7;
const EVENT_WAIT_MS = 15_000;
// Count the serial awaits once, rather than summing pause watchdogs: their
// Carry allowances overlap the preceding resume acknowledgment/owner proof.
const attachmentAndPauseWaitMs = (1 + SOURCE_PHASES + constructionReads.length) * EVENT_WAIT_MS;
// Runtime, Debugger, instrumentation, runIfWaiting.
const workerSetupMs = 3 * READ_MS + REQUEST_MS;
const sourceCaptureMs = SOURCE_PHASES * SOURCE_MS + (SOURCE_PHASES - 1) * (RESUME_MS + OWNER_MS) +
  ARM_MS + REQUEST_MS + OWNER_MS + RESUME_MS;
const constructionCaptureMs = constructionReads.reduce((sum, reads) => sum + OWNER_MS + reads * READ_MS + RESUME_MS, 0) + REQUEST_MS;
// The last resume is followed by the runner's final owner proof and then the
// Transport's final owner proof. The second removal joins already-settled work.
const captureCompletionMs = 2 * OWNER_MS;
const captureMs = attachmentAndPauseWaitMs + workerSetupMs + sourceCaptureMs + constructionCaptureMs + captureCompletionMs;
const ordinaryOpeningMs = 45_000;
// Preserve the existing 70s host versus 45s native reply allowance. This is
// Delivery grace, not an extension of small-command or owner deadlines.
const openingReplyGraceMs = 70_000 - ordinaryOpeningMs;
const openingOwnerMs = 2 * OWNER_MS;
const openingSendMs = 2 * openingOwnerMs + REQUEST_MS;
// After the native reply: opener owner, parent snapshot, optional ancillary
// Snapshot, captured packet owner, original runner, project identity and owner.
// These run after the RPC timer ends and remain subject to the original launch
// Deadline. No parent proof or identity check is skipped to fit the RPC timer.
const openingCompletionMs = openingOwnerMs + (2 * openingSendMs + openingOwnerMs) +
  (2 * openingOwnerMs + 2 * openingSendMs) + openingOwnerMs +
  (3 * OWNER_MS + openingOwnerMs) + (2 * OWNER_MS + READ_MS) + openingOwnerMs;

export const CURRENT_PCB_209_STARTUP_OPENING_TIMING = Object.freeze({
  attachmentAndPauseWaitMs, workerSetupMs, sourceCaptureMs, constructionCaptureMs, captureCompletionMs, captureMs,
  ordinaryOpeningMs, openingReplyGraceMs, nativeMs: ordinaryOpeningMs + captureMs,
  hostMs: ordinaryOpeningMs + captureMs + openingReplyGraceMs, openingCompletionMs,
});

export const CURRENT_PCB_209_STARTUP_TIMING = Object.freeze({
  requestMs: REQUEST_MS,
  legacyPauseMs: 5000,
  constructionArmMs: ARM_MS,
  // First source inherits runIfWaiting's acknowledgment; later sources inherit
  // Both the previous resume acknowledgment and its following owner proof.
  bootstrapPauseMs: REQUEST_MS + SOURCE_MS + RESUME_MS,
  sourcePauseMs: SOURCE_CARRY_MS + SOURCE_MS + RESUME_MS,
  projectPauseMs: SOURCE_CARRY_MS + SOURCE_MS + ARM_MS + REQUEST_MS + OWNER_MS + RESUME_MS,
  constructionPauseMs: Object.freeze(constructionReads.map((reads, index) =>
    (index === 0 ? 0 : REQUEST_MS) + OWNER_MS + reads * READ_MS +
    (index === constructionReads.length - 1 ? REQUEST_MS : 0) + RESUME_MS)),
  // The final eight removals run concurrently, hence one request window above.
});

export interface CurrentPcbStartupWindow {
  readonly startedAtMs: number;
  readonly limitMs: number;
}
export interface CurrentPcbStartupWindowObservation {
  readonly elapsedMs: number;
  readonly limitMs: number;
}
export function currentPcbStartupMonotonicMs(): number { return performance.now(); }
export function currentPcbStartupWindowObservation(window: CurrentPcbStartupWindow, now: number): CurrentPcbStartupWindowObservation {
  return Object.freeze({ elapsedMs: Math.max(0, Math.floor(now - window.startedAtMs)), limitMs: window.limitMs });
}
