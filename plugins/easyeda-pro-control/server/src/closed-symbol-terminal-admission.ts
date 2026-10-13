/** Private combined historical qualification. No current execution or replay grant. */
/* oxlint-disable import/max-dependencies -- Fixed existing admission dependencies plus two inert error classes; importing the cache graph here would break lazy profile isolation. */
import { createOperationScanner, readExactUtf8Artifact } from "./artifacts.ts";
import { FAMILY } from "./closed-symbol-journal.ts";
import { TERMINAL_STATE, parseClosedSymbolTerminalArtifact } from "./closed-symbol-terminal-shape.ts";
import type { TerminalDescriptor } from "./closed-symbol-terminal-shape.ts";
import { isErrnoException, isRecord, isTerminalOperation, operationHasOrphanedCallRisk, sha256Json } from "./core.ts";
import { asOperationJournal, operationSummary } from "./engine-operation-summary.ts";
import type { OperationSummary } from "./engine.ts";
import type { UnknownRecord } from "./core.ts";
import { MachineProfileError, currentProcessSqlRuntime } from "./machine-profile.ts";
import { SqlReaderFailureError } from "./sqlite-inventory.ts";
import { ZodError } from "zod";
import { ClosureEvidenceChangedError } from "./closed-symbol-terminal-closure-evidence-error.ts";
import { ClosureIneligibleError } from "./closed-symbol-terminal-closure-ineligible-error.ts";
import { matchesHistoricalAdmission, selectTerminalProfile } from "./closed-symbol-terminal-admission-shape.ts";

const HASH = /^[a-f0-9]{64}$/u;
type Failure = "terminal-evidence-invalid" | "terminal-evidence-unavailable";
interface TerminalCandidate {
  readonly operationId: string;
  readonly state: typeof TERMINAL_STATE;
  readonly family: typeof FAMILY;
  readonly storedJournalSha256: string;
  readonly entireStoredJournalSha256: string;
  readonly terminalArtifact: TerminalDescriptor;
}
interface ScanCandidate {
  readonly bridgeBlocking: boolean;
  readonly unfinished: boolean;
  readonly summary: OperationSummary;
  readonly classification: "legacy" | "incomplete" | "invalid" | "terminal";
  readonly terminal: TerminalCandidate | null;
}
export interface QualifiedAdmissionOperation {
  readonly bridgeBlocking: boolean;
  readonly unfinished: boolean;
  readonly summary: OperationSummary;
  readonly qualification: "legacy" | "incomplete" | Failure;
  readonly recordedState: unknown;
  readonly historicalCompletionVerified: false;
  readonly authorityRestored: false;
  readonly executionAuthorized: false;
  readonly replayAllowed: false;
}

function project(operation: UnknownRecord): ScanCandidate {
  const plan = operation["plan"];
  const family = isRecord(plan) ? plan["profile"] : undefined;
  const state = operation["state"];
  const summary = operationSummary(asOperationJournal(operation));
  const base = { bridgeBlocking: state === "journal-unreadable" || operationHasOrphanedCallRisk(operation),
    unfinished: !isTerminalOperation(operation), summary };
  const reserved = family === FAMILY || typeof family === "string" && family.startsWith("easyeda-pro-control.project-symbol-closed-session.") ||
    typeof state === "string" && state.startsWith("closed-session-") || Object.hasOwn(operation, "terminalArtifact") || Object.hasOwn(operation, "closedPlanSha256");
  if (!reserved) { return { ...base, classification: "legacy", terminal: null }; }
  if (family === FAMILY && (state === "closed-session-recording" || state === "closed-session-evidence-recorded") &&
      !Object.hasOwn(operation, "terminalArtifact")) {
    return { ...base, classification: "incomplete", terminal: null };
  }
  if (family !== FAMILY || state !== TERMINAL_STATE) { return { ...base, classification: "invalid", terminal: null }; }
  try {
    const operationId = operation["operationId"], storedJournalSha256 = operation["journalSha256"];
    if (typeof operationId !== "string" || typeof storedJournalSha256 !== "string" || !HASH.test(storedJournalSha256)) {
      return { ...base, classification: "invalid", terminal: null };
    }
    const terminalArtifact = parseClosedSymbolTerminalArtifact(operation["terminalArtifact"], operationId);
    return { ...base, classification: "terminal", terminal: { operationId, state, family, storedJournalSha256,
      entireStoredJournalSha256: sha256Json(operation), terminalArtifact } };
  } catch { return { ...base, classification: "invalid", terminal: null }; }
}

// This caches only a bounded pure candidate. Managed journal and ordinary phase
// Bytes are rechecked by the unchanged scanner on every call; success is not cached.
const rawCandidates = createOperationScanner(project);

function observation(candidate: ScanCandidate, qualification: QualifiedAdmissionOperation["qualification"]): QualifiedAdmissionOperation {
  const failed = qualification === "terminal-evidence-invalid" || qualification === "terminal-evidence-unavailable";
  const summary = failed ? { ...candidate.summary, state: qualification, hardStop: true,
    nextSafeAction: "Inspect the retained closed-session evidence; do not replay or resume this operation.",
    lastError: { name: "ClosedSessionTerminalAdmission", message: qualification } } : candidate.summary;
  return { bridgeBlocking: failed || candidate.bridgeBlocking, unfinished: failed || candidate.unfinished, summary,
    qualification, recordedState: candidate.summary.state, historicalCompletionVerified: false,
    authorityRestored: false, executionAuthorized: false, replayAllowed: false };
}
function failureClass(error: unknown): Failure {
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
async function qualifyTerminal(candidate: ScanCandidate, runtime: Awaited<ReturnType<typeof currentProcessSqlRuntime>>): Promise<QualifiedAdmissionOperation | undefined> {
  const expected = candidate.terminal;
  if (expected === null) { return observation(candidate, "terminal-evidence-invalid"); }
  try {
    const artifact = await readExactUtf8Artifact(expected.terminalArtifact);
    const routing = selectTerminalProfile(JSON.parse(artifact.text));
    let inspected: unknown;
    if (routing.profile === "easyeda-pro-control.closed-symbol-terminal.v1") {
      const { inspectLockedTerminalForAdmission } = await import("./closed-symbol-terminal-admission-cache.ts");
      inspected = await inspectLockedTerminalForAdmission(expected, runtime);
    } else {
      const { inspectClosedSymbolAgedTerminal } = await import("./closed-symbol-aged-terminal.ts");
      inspected = await inspectClosedSymbolAgedTerminal(expected.operationId, runtime);
    }
    const matches = matchesHistoricalAdmission(inspected, expected, routing);
    // No unrelated await follows the inspector's final journal-bound result.
    // A match only omits this historical blocker; no old capability is restored.
    return matches ? undefined : observation(candidate, "terminal-evidence-invalid");
  } catch (error) { return observation(candidate, failureClass(error)); }
}
async function qualifiedCandidates(): Promise<QualifiedAdmissionOperation[]> {
  const candidates = await rawCandidates();
  const results: QualifiedAdmissionOperation[] = [];
  let runtime: Awaited<ReturnType<typeof currentProcessSqlRuntime>> | undefined;
  let runtimeUnavailable = false;
  for (const candidate of candidates) {
    if (candidate.classification === "legacy" || candidate.classification === "incomplete") {
      results.push(observation(candidate, candidate.classification));
    } else if (candidate.classification === "invalid" || candidate.terminal === null) {
      results.push(observation(candidate, "terminal-evidence-invalid"));
    } else {
      if (runtime === undefined && !runtimeUnavailable) {
        try { runtime = await currentProcessSqlRuntime(); }
        catch { runtimeUnavailable = true; }
      }
      if (runtime === undefined) { results.push(observation(candidate, "terminal-evidence-unavailable")); }
      else {
        const result = await qualifyTerminal(candidate, runtime);
        if (result !== undefined) { results.push(result); }
      }
    }
  }
  return results;
}

/** Fixed async wrapper for the three engine admission views. */
export async function scanQualifiedAdmissionOperations(): Promise<QualifiedAdmissionOperation[]> {
  const candidates = await qualifiedCandidates();
  return candidates.filter((entry) => entry.bridgeBlocking || entry.unfinished);
}

/** Direct default guards retain legacy state behavior; only proven terminals disappear. */
export async function listQualifiedOperationStates(): Promise<UnknownRecord[]> {
  const candidates = await qualifiedCandidates();
  return candidates.map((entry) => ({ operationId: entry.summary.operationId, state: entry.summary.state,
    recordedState: entry.recordedState, qualification: entry.qualification }));
}

