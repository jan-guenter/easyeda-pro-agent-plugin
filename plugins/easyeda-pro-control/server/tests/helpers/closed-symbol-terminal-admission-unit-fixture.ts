/** Mocked fixed-inspector boundary only. No full graph or authority is issued. */
import { loadOperation } from "../../src/artifacts.ts";
import { parseClosedSymbolTerminalArtifact } from "../../src/closed-symbol-terminal-shape.ts";
import { FAMILY } from "../../src/closed-symbol-journal.ts";
import { canonicalJson, sha256Json } from "../../src/core.ts";
import type { MachineProfile } from "../../src/machine-profile.ts";
import type { CurrentProcessSqlRuntimeLease } from "../../src/current-process-sql-runtime-lease.ts";

export { MachineProfileError } from "../../src/machine-profile.ts";
export const unitState = {
  runtimeCalls: 0, runtimeFailure: undefined as Error | undefined, inspected: [] as string[], agedInspected: [] as string[],
  abandoned: new Set<string>(), abandonmentInspected: [] as string[],
  overrides: new Map<string, Record<string, unknown>>(), failures: new Map<string, unknown>(),
  before: new Map<string, () => Promise<void>>(),
  lockedInputs: [] as Readonly<{ candidate: unknown; runtime: unknown; lease: CurrentProcessSqlRuntimeLease }>[],
  agedInputs: [] as Readonly<{ candidate: unknown; runtime: unknown; lease: CurrentProcessSqlRuntimeLease }>[],
  runtimes: [] as MachineProfile["runtime"][],
  leases: [] as CurrentProcessSqlRuntimeLease[], leaseCloses: 0, leaseFinalFailure: undefined as Error | undefined,
  leasePoisoned: false,
};
export function currentProcessSqlRuntime(): Promise<MachineProfile["runtime"]> {
  unitState.runtimeCalls += 1;
  if (unitState.runtimeFailure !== undefined) { return Promise.reject(unitState.runtimeFailure); }
  const runtime: MachineProfile["runtime"] = { nodeExecutable: process.execPath, nodeVersion: "24.18.0", nodeSha256: "a".repeat(64) };
  unitState.runtimes.push(runtime); return Promise.resolve(runtime);
}
export async function withCurrentProcessSqlRuntimeLease<T>(invoke: (lease: CurrentProcessSqlRuntimeLease) => Promise<T>): Promise<T> {
  const lease = Object.freeze({ runtime: await currentProcessSqlRuntime() }); unitState.leases.push(lease);
  try {
    const result = await invoke(lease);
    if (unitState.leaseFinalFailure !== undefined) { throw unitState.leaseFinalFailure; }
    return result;
  } finally { unitState.leaseCloses += 1; }
}
export function requireCurrentProcessSqlRuntimeLease(lease: CurrentProcessSqlRuntimeLease): void {
  if (unitState.leasePoisoned || lease !== unitState.leases.at(-1)) { throw new Error("synthetic-lease-not-current"); }
}
async function inspect(operationId: string, runtime: MachineProfile["runtime"], aged: boolean): Promise<Readonly<Record<string, unknown>>> {
  (aged ? unitState.agedInspected : unitState.inspected).push(operationId);
  if (runtime.nodeExecutable !== process.execPath || runtime.nodeSha256 !== "a".repeat(64)) { throw new Error("Unit runtime binding differs."); }
  await unitState.before.get(operationId)?.();
  if (unitState.failures.has(operationId)) { throw unitState.failures.get(operationId); }
  const journal = await loadOperation(operationId);
  const self = journal["journalSha256"]; if (typeof self !== "string") { throw new TypeError("Unit journal lacks self-seal."); }
  return { profile: aged ? "private.closed-symbol-historical-terminal.v2" : "private.closed-symbol-historical-terminal.v1", operationId,
    classification: "historical-completion-verified", historicalCompletionRecorded: true, terminalOutcomeVerified: true,
    liveOriginalCompletionProved: false, currentSourceChecked: false, currentOwnershipChecked: false,
    authorityRestored: false, executionAuthorized: false, replayAllowed: false,
    terminalArtifact: parseClosedSymbolTerminalArtifact(journal["terminalArtifact"], operationId), bodySha256: "b".repeat(64),
    storedJournalSha256: self, entireStoredJournalSha256: sha256Json(journal), ...unitState.overrides.get(operationId) };
}
async function inspectCandidate(candidate: unknown, runtime: MachineProfile["runtime"], aged: boolean, lease: CurrentProcessSqlRuntimeLease): Promise<Readonly<Record<string, unknown>>> {
  (aged ? unitState.agedInputs : unitState.lockedInputs).push({ candidate, runtime, lease });
  if (typeof candidate !== "object" || candidate === null || !("operationId" in candidate) || typeof candidate.operationId !== "string") {
    throw new TypeError("Unit requires the complete compact candidate, not an operation identifier.");
  }
  const journal = await loadOperation(candidate.operationId);
  const expected = { operationId: candidate.operationId, state: "closed-session-completed", family: FAMILY,
    storedJournalSha256: journal["journalSha256"], entireStoredJournalSha256: sha256Json(journal),
    terminalArtifact: parseClosedSymbolTerminalArtifact(journal["terminalArtifact"], candidate.operationId) };
  if (canonicalJson(candidate) !== canonicalJson(expected) || runtime !== unitState.runtimes.at(-1) || lease !== unitState.leases.at(-1) || lease.runtime !== runtime) {
    throw new TypeError("Unit compact candidate or exact current runtime differs.");
  }
  return inspect(candidate.operationId, runtime, aged);
}
export function inspectLockedTerminalForAdmission(candidate: unknown, runtime: MachineProfile["runtime"], lease: CurrentProcessSqlRuntimeLease): Promise<Readonly<Record<string, unknown>>> {
  return inspectCandidate(candidate, runtime, false, lease);
}
export function inspectAgedTerminalForAdmission(candidate: unknown, runtime: MachineProfile["runtime"], lease: CurrentProcessSqlRuntimeLease): Promise<Readonly<Record<string, unknown>>> {
  return inspectCandidate(candidate, runtime, true, lease);
}
export function inspectClosedSymbolAgedTerminal(operationId: string, runtime: MachineProfile["runtime"]): Promise<Readonly<Record<string, unknown>>> {
  return inspect(operationId, runtime, true);
}
export async function inspectClosedSymbolAbandonment(operationId: string): Promise<Readonly<Record<string, unknown>> | undefined> {
  unitState.abandonmentInspected.push(operationId);
  if (!unitState.abandoned.has(operationId)) { return undefined; }
  await unitState.before.get(operationId)?.();
  if (unitState.failures.has(operationId)) { throw unitState.failures.get(operationId); }
  const journal = await loadOperation(operationId);
  return { profile: "easyeda-pro-control.closed-symbol-abandonment-inspection.v1", operationId,
    classification: "historical-abandonment-verified", originalJournalSha256: sha256Json(journal),
    originalStoredJournalSha256: journal["journalSha256"], artifact: { path: "/synthetic/abandonment.json", bytes: 1, sha256: "a".repeat(64) },
    bodySha256: "b".repeat(64), completionProved: false, authorityRestored: false, executionAuthorized: false,
    replayAllowed: false, saved: false, reopened: false, ...unitState.overrides.get(operationId) };
}

