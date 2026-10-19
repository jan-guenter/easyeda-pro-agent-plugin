/** Private combined historical qualification. No current execution or replay grant. */
/* oxlint-disable import/max-dependencies -- Fixed existing admission dependencies plus two inert error classes; importing the cache graph here would break lazy profile isolation. */
import { performance } from "node:perf_hooks";
import { createOperationScanner, readExactUtf8Artifact } from "./artifacts.ts";
import { FAMILY } from "./closed-symbol-journal.ts";
import { TERMINAL_STATE, parseClosedSymbolTerminalArtifact } from "./closed-symbol-terminal-shape.ts";
import type { TerminalDescriptor } from "./closed-symbol-terminal-shape.ts";
import { isErrnoException, isRecord, isTerminalOperation, operationHasOrphanedCallRisk, sha256Json } from "./core.ts";
import { asOperationJournal, operationSummary } from "./engine-operation-summary.ts";
import type { OperationSummary } from "./engine.ts";
import type { UnknownRecord } from "./core.ts";
import { MachineProfileError } from "./machine-profile.ts";
import type { MachineProfile } from "./machine-profile.ts";
import { requireCurrentProcessSqlRuntimeLease, withCurrentProcessSqlRuntimeLease } from "./current-process-sql-runtime-lease.ts";
import type { CurrentProcessSqlRuntimeLease } from "./current-process-sql-runtime-lease.ts";
import { SqlReaderFailureError } from "./sqlite-inventory.ts";
import { ZodError } from "zod";
import { ClosureEvidenceChangedError } from "./closed-symbol-terminal-closure-evidence-error.ts";
import { ClosureIneligibleError } from "./closed-symbol-terminal-closure-ineligible-error.ts";
import { matchesHistoricalAdmission, selectTerminalProfile } from "./closed-symbol-terminal-admission-shape.ts";

const HASH = /^[a-f0-9]{64}$/u;
type TerminalFailure = "terminal-evidence-invalid" | "terminal-evidence-unavailable";
type Failure = TerminalFailure | "abandonment-evidence-invalid" | "abandonment-evidence-unavailable";
interface IncompleteCandidate {
  readonly operationId: string;
  readonly storedJournalSha256: string;
  readonly entireStoredJournalSha256: string;
}
interface TerminalCandidate {
  readonly operationId: string;
  readonly state: typeof TERMINAL_STATE;
  readonly family: typeof FAMILY;
  readonly storedJournalSha256: string;
  readonly entireStoredJournalSha256: string;
  readonly terminalArtifact: TerminalDescriptor;
}
interface DetailedScanCandidate {
  readonly compact: false;
  readonly bridgeBlocking: boolean;
  readonly unfinished: boolean;
  readonly summary: OperationSummary;
  readonly classification: "legacy" | "incomplete" | "invalid" | "terminal" | "current-baseline";
  readonly terminal: TerminalCandidate | null;
  readonly incomplete: IncompleteCandidate | null;
}
interface CompletedLegacyCandidate {
  readonly compact: true;
  readonly classification: "legacy";
  readonly operationId: unknown;
  readonly state: unknown;
}
type ScanCandidate = DetailedScanCandidate | CompletedLegacyCandidate;
export interface QualifiedAdmissionOperation {
  readonly bridgeBlocking: boolean;
  readonly unfinished: boolean;
  readonly summary: OperationSummary;
  readonly qualification: "legacy" | "incomplete" | "historical-abandonment-verified" | Failure;
  readonly recordedState: unknown;
  readonly historicalCompletionVerified: false;
  readonly authorityRestored: false;
  readonly executionAuthorized: false;
  readonly replayAllowed: false;
}
/** Bounded aggregate timings from one complete scan, never reusable admission.
 * No operation identities, paths, error text or source bytes enter this report.
 */
export interface AdmissionScanDiagnostics {
  readonly schema: "easyeda-pro-control.admission-scan-diagnostics.v1";
  readonly journalCount: number;
  readonly candidateCounts: Readonly<Record<ScanCandidate["classification"], number>>;
  readonly journalScanMs: number;
  readonly historicalQualificationMs: number;
  readonly totalMs: number;
}
interface QualifiedScan {
  readonly operations: QualifiedAdmissionOperation[];
  readonly diagnostics: AdmissionScanDiagnostics;
}
interface QualifiedStateScan extends QualifiedScan {
  readonly states: UnknownRecord[];
}
function diagnosticInteger(value: number): number {
  return Math.max(0, Math.min(Number.MAX_SAFE_INTEGER, Math.round(value)));
}

function project(operation: UnknownRecord): ScanCandidate {
  const plan = operation["plan"];
  const family = isRecord(plan) ? plan["profile"] : undefined;
  const state = operation["state"];
  const bridgeBlocking = state === "journal-unreadable" || operationHasOrphanedCallRisk(operation);
  const unfinished = !isTerminalOperation(operation);
  const reserved = family === FAMILY || typeof family === "string" && family.startsWith("easyeda-pro-control.project-symbol-closed-session.") ||
    typeof state === "string" && state.startsWith("closed-session-") || Object.hasOwn(operation, "terminalArtifact") || Object.hasOwn(operation, "closedPlanSha256");
  // These legacy entries are omitted by both rich-summary consumers. Only the
  // State list exposes them, so retain precisely its two input fields. Every
  // Other class keeps its full summary, including terminal journals with risk.
  if (family !== "easyeda-pro-control.current-symbol-closed-baseline.v1" && !reserved && !bridgeBlocking && !unfinished) {
    return { compact: true, classification: "legacy", operationId: operation["operationId"], state };
  }
  const summary = operationSummary(asOperationJournal(operation));
  const base = { compact: false as const, bridgeBlocking, unfinished, summary };
  if (family === "easyeda-pro-control.current-symbol-closed-baseline.v1") {
    const operationId = operation["operationId"], storedJournalSha256 = operation["journalSha256"];
    const incomplete = typeof operationId === "string" && typeof storedJournalSha256 === "string" && HASH.test(storedJournalSha256)
      ? { operationId, storedJournalSha256, entireStoredJournalSha256: sha256Json(operation) } : null;
    return { ...base, classification: "current-baseline", terminal: null, incomplete };
  }
  if (!reserved) { return { ...base, classification: "legacy", terminal: null, incomplete: null }; }
  if (family === FAMILY && (state === "closed-session-recording" || state === "closed-session-evidence-recorded") &&
      !Object.hasOwn(operation, "terminalArtifact")) {
    const operationId = operation["operationId"], storedJournalSha256 = operation["journalSha256"];
    const incomplete = typeof operationId === "string" && typeof storedJournalSha256 === "string" && HASH.test(storedJournalSha256)
      ? { operationId, storedJournalSha256, entireStoredJournalSha256: sha256Json(operation) } : null;
    return { ...base, classification: "incomplete", terminal: null, incomplete };
  }
  if (family !== FAMILY || state !== TERMINAL_STATE) { return { ...base, classification: "invalid", terminal: null, incomplete: null }; }
  try {
    const operationId = operation["operationId"], storedJournalSha256 = operation["journalSha256"];
    if (typeof operationId !== "string" || typeof storedJournalSha256 !== "string" || !HASH.test(storedJournalSha256)) {
      return { ...base, classification: "invalid", terminal: null, incomplete: null };
    }
    const terminalArtifact = parseClosedSymbolTerminalArtifact(operation["terminalArtifact"], operationId);
    return { ...base, classification: "terminal", incomplete: null, terminal: { operationId, state, family, storedJournalSha256,
      entireStoredJournalSha256: sha256Json(operation), terminalArtifact } };
  } catch { return { ...base, classification: "invalid", terminal: null, incomplete: null }; }
}

// This caches only a bounded pure candidate. Managed journal and ordinary phase
// Bytes are rechecked by the unchanged scanner on every call; success is not cached.
const rawCandidates = createOperationScanner(project);

function observation(candidate: DetailedScanCandidate, qualification: QualifiedAdmissionOperation["qualification"]): QualifiedAdmissionOperation {
  const failed = qualification === "terminal-evidence-invalid" || qualification === "terminal-evidence-unavailable" ||
    qualification === "abandonment-evidence-invalid" || qualification === "abandonment-evidence-unavailable";
  const summary = failed ? { ...candidate.summary, state: qualification, hardStop: true,
    nextSafeAction: "Inspect the retained closed-session evidence; do not replay or resume this operation.",
    lastError: { name: "ClosedSessionTerminalAdmission", message: qualification } } : candidate.summary;
  return { bridgeBlocking: failed || candidate.bridgeBlocking, unfinished: failed || candidate.unfinished, summary,
    qualification, recordedState: candidate.summary.state, historicalCompletionVerified: false,
    authorityRestored: false, executionAuthorized: false, replayAllowed: false };
}
function failureClass(error: unknown): TerminalFailure {
  if (error instanceof ClosureEvidenceChangedError) { return "terminal-evidence-invalid"; }
  if (error instanceof ClosureIneligibleError) { return "terminal-evidence-unavailable"; }
  if (error instanceof MachineProfileError || error instanceof SqlReaderFailureError) { return "terminal-evidence-unavailable"; }
  if (error instanceof TypeError && isErrnoException(error) && error.code === "ERR_ENCODING_INVALID_ENCODED_DATA") {
    return "terminal-evidence-invalid";
  }
  if (isErrnoException(error)) {
    return ["ENOENT", "ENOTDIR", "ELOOP"].includes(error.code ?? "") ? "terminal-evidence-invalid" : "terminal-evidence-unavailable";
  }
  // Existing semantic validators use plain Error; malformed JSON uses SyntaxError.
  // Unexpected engine exceptions are inability to validate, not asserted corruption.
  return error instanceof ZodError || error instanceof SyntaxError || error instanceof Error && error.constructor === Error
    ? "terminal-evidence-invalid" : "terminal-evidence-unavailable";
}
async function qualifyAbandonment(candidate: DetailedScanCandidate): Promise<QualifiedAdmissionOperation> {
  const expected = candidate.incomplete;
  if (expected === null) { return observation(candidate, "incomplete"); }
  try {
    const { inspectClosedSymbolAbandonment } = await import("./closed-symbol-abandonment.ts");
    const { inspectClosedSymbolBaselineAbandonment } = await import("./closed-symbol-baseline-abandonment.ts");
    const original = await inspectClosedSymbolAbandonment(expected.operationId);
    const baseline = await inspectClosedSymbolBaselineAbandonment(expected.operationId);
    if (original !== undefined && baseline !== undefined) { return observation(candidate, "abandonment-evidence-invalid"); }
    const inspected: unknown = original ?? baseline;
    if (inspected === undefined) { return observation(candidate, "incomplete"); }
    if (!isRecord(inspected) || inspected["profile"] !== "easyeda-pro-control.closed-symbol-abandonment-inspection.v1" ||
      inspected["classification"] !== "historical-abandonment-verified" || inspected["operationId"] !== expected.operationId ||
      inspected["originalStoredJournalSha256"] !== expected.storedJournalSha256 ||
      inspected["originalJournalSha256"] !== expected.entireStoredJournalSha256 || inspected["completionProved"] !== false ||
      inspected["authorityRestored"] !== false || inspected["executionAuthorized"] !== false || inspected["replayAllowed"] !== false ||
      inspected["saved"] !== false || inspected["reopened"] !== false) {
      return observation(candidate, "abandonment-evidence-invalid");
    }
    // The sidecar qualifies abandonment only. Keep the original journal state and
    // All completion/authority flags unchanged, and requalify on every scan.
    return { ...observation(candidate, "historical-abandonment-verified"), bridgeBlocking: false, unfinished: false };
  } catch (error) {
    return observation(candidate, failureClass(error) === "terminal-evidence-invalid"
      ? "abandonment-evidence-invalid" : "abandonment-evidence-unavailable");
  }
}
async function qualifyCurrentBaselineAbandonment(candidate: DetailedScanCandidate): Promise<QualifiedAdmissionOperation> {
  const expected = candidate.incomplete;
  if (expected === null) { return observation(candidate, "abandonment-evidence-invalid"); }
  try {
    const { inspectCurrentSymbolBaselineAbandonment } = await import("./current-symbol-baseline-abandonment.ts");
    const inspected: unknown = await inspectCurrentSymbolBaselineAbandonment(expected.operationId);
    if (inspected === undefined) { return observation(candidate, "incomplete"); }
    if (!isRecord(inspected) || inspected["profile"] !== "easyeda-pro-control.current-symbol-baseline-abandonment-inspection.v1" ||
        inspected["classification"] !== "historical-abandonment-verified" || inspected["operationId"] !== expected.operationId ||
        inspected["originalStoredJournalSha256"] !== expected.storedJournalSha256 || inspected["originalJournalSha256"] !== expected.entireStoredJournalSha256 ||
        inspected["completionProved"] !== false || inspected["processClosureProved"] !== false || inspected["currentSourceChecked"] !== false ||
        inspected["sourceInvarianceProved"] !== false || inspected["authorityRestored"] !== false || inspected["executionAuthorized"] !== false ||
        inspected["replayAllowed"] !== false || inspected["writerReady"] !== false || inspected["saved"] !== false || inspected["reopened"] !== false) {
      return observation(candidate, "abandonment-evidence-invalid");
    }
    return { ...observation(candidate, "historical-abandonment-verified"), bridgeBlocking: false, unfinished: false };
  } catch (error) {
    return observation(candidate, failureClass(error) === "terminal-evidence-invalid" ? "abandonment-evidence-invalid" : "abandonment-evidence-unavailable");
  }
}
async function qualifyTerminal(candidate: DetailedScanCandidate, runtime: MachineProfile["runtime"], lease: CurrentProcessSqlRuntimeLease): Promise<QualifiedAdmissionOperation | undefined> {
  const expected = candidate.terminal;
  if (expected === null) { return observation(candidate, "terminal-evidence-invalid"); }
  try {
    const artifact = await readExactUtf8Artifact(expected.terminalArtifact);
    const routing = selectTerminalProfile(JSON.parse(artifact.text));
    let inspected: unknown;
    if (routing.profile === "easyeda-pro-control.closed-symbol-terminal.v1") {
      const { inspectLockedTerminalForAdmission } = await import("./closed-symbol-terminal-admission-cache.ts");
      inspected = await inspectLockedTerminalForAdmission(expected, runtime, lease);
    } else {
      const { inspectAgedTerminalForAdmission } = await import("./closed-symbol-aged-terminal-admission-cache.ts");
      inspected = await inspectAgedTerminalForAdmission(expected, runtime, lease);
    }
    const matches = matchesHistoricalAdmission(inspected, expected, routing);
    // No unrelated await follows the inspector's final journal-bound result.
    // A match only omits this historical blocker; no old capability is restored.
    return matches ? undefined : observation(candidate, "terminal-evidence-invalid");
  } catch (error) {
    // A failed runtime lease is scan-fatal, not an individual evidence refusal.
    // Do not attempt another candidate or cold path after observed Node drift.
    requireCurrentProcessSqlRuntimeLease(lease);
    return observation(candidate, failureClass(error));
  }
}
async function qualifiedCandidates(): Promise<QualifiedStateScan> {
  const started = performance.now();
  const candidates = await rawCandidates();
  const journalScanEnded = performance.now();
  const candidateCounts: Record<ScanCandidate["classification"], number> = {
    legacy: 0, incomplete: 0, invalid: 0, terminal: 0, "current-baseline": 0,
  };
  const results: QualifiedAdmissionOperation[] = [];
  const states: UnknownRecord[] = [];
  const inspectCandidates = async (lease?: CurrentProcessSqlRuntimeLease): Promise<void> => {
    for (const candidate of candidates) {
      candidateCounts[candidate.classification] += 1;
      if (candidate.compact) {
        states.push({ operationId: candidate.operationId, state: candidate.state, recordedState: candidate.state, qualification: "legacy" });
      } else {
        let result: QualifiedAdmissionOperation | undefined;
        if (candidate.classification === "legacy") {
          result = observation(candidate, "legacy");
        } else if (candidate.classification === "current-baseline") {
          result = await qualifyCurrentBaselineAbandonment(candidate);
        } else if (candidate.classification === "incomplete") {
          result = await qualifyAbandonment(candidate);
        } else if (candidate.classification === "invalid" || candidate.terminal === null) {
          result = observation(candidate, "terminal-evidence-invalid");
        } else {
          result = lease === undefined ? observation(candidate, "terminal-evidence-unavailable") : await qualifyTerminal(candidate, lease.runtime, lease);
        }
        if (result !== undefined) {
          results.push(result);
          if (result.qualification !== "historical-abandonment-verified") {
            states.push({ operationId: result.summary.operationId, state: result.summary.state,
              recordedState: result.recordedState, qualification: result.qualification });
          }
        }
      }
    }
  };
  if (candidates.some(candidate => !candidate.compact && candidate.classification === "terminal" && candidate.terminal !== null)) {
    let entered = false;
    try {
      await withCurrentProcessSqlRuntimeLease(async lease => { entered = true; await inspectCandidates(lease); });
    } catch (error) {
      // Initial acquisition failure retains the established per-journal blocker.
      // Once the scan owns a lease, drift or cleanup failure defeats the whole
      // Result. Never reacquire or publish already-cleared historical entries.
      if (entered) { throw error; }
      await inspectCandidates();
    }
  } else { await inspectCandidates(); }
  const ended = performance.now();
  return { operations: results, states, diagnostics: Object.freeze({
    schema: "easyeda-pro-control.admission-scan-diagnostics.v1", journalCount: candidates.length,
    candidateCounts: Object.freeze(candidateCounts), journalScanMs: diagnosticInteger(journalScanEnded - started),
    historicalQualificationMs: diagnosticInteger(ended - journalScanEnded), totalMs: diagnosticInteger(ended - started),
  }) };
}

/** Fixed async wrapper for the three engine admission views. */
export async function scanQualifiedAdmissionOperations(): Promise<QualifiedAdmissionOperation[]> {
  const scanned = await qualifiedCandidates();
  return scanned.operations.filter((entry) => entry.bridgeBlocking || entry.unfinished);
}

/** One fresh status scan with passive aggregate diagnostics. Other guards call
 * their own scanner; neither the result nor its timings can be supplied back.
 */
export async function observeQualifiedAdmissionOperations(): Promise<QualifiedScan> {
  const scanned = await qualifiedCandidates();
  return { operations: scanned.operations.filter((entry) => entry.bridgeBlocking || entry.unfinished), diagnostics: scanned.diagnostics };
}

/** Direct guards omit proven historical completion or abandonment without rewriting state. */
export async function listQualifiedOperationStates(): Promise<UnknownRecord[]> {
  const scanned = await qualifiedCandidates();
  return scanned.states;
}

