/** Mocked fixed-inspector boundary only. No full graph or authority is issued. */
import { loadOperation } from "../../src/artifacts.ts";
import { parseClosedSymbolTerminalArtifact } from "../../src/closed-symbol-terminal-shape.ts";
import { FAMILY } from "../../src/closed-symbol-journal.ts";
import { canonicalJson, sha256Json } from "../../src/core.ts";
import type { MachineProfile } from "../../src/machine-profile.ts";

export { MachineProfileError } from "../../src/machine-profile.ts";
export const unitState = {
  runtimeCalls: 0, runtimeFailure: undefined as Error | undefined, inspected: [] as string[], agedInspected: [] as string[],
  overrides: new Map<string, Record<string, unknown>>(), failures: new Map<string, unknown>(),
  before: new Map<string, () => Promise<void>>(),
  lockedInputs: [] as Readonly<{ candidate: unknown; runtime: unknown }>[],
  runtimes: [] as MachineProfile["runtime"][],
};
export function currentProcessSqlRuntime(): Promise<MachineProfile["runtime"]> {
  unitState.runtimeCalls += 1;
  if (unitState.runtimeFailure !== undefined) { return Promise.reject(unitState.runtimeFailure); }
  const runtime: MachineProfile["runtime"] = { nodeExecutable: process.execPath, nodeVersion: "24.18.0", nodeSha256: "a".repeat(64) };
  unitState.runtimes.push(runtime); return Promise.resolve(runtime);
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
export async function inspectLockedTerminalForAdmission(candidate: unknown, runtime: MachineProfile["runtime"]): Promise<Readonly<Record<string, unknown>>> {
  unitState.lockedInputs.push({ candidate, runtime });
  if (typeof candidate !== "object" || candidate === null || !("operationId" in candidate) || typeof candidate.operationId !== "string") {
    throw new TypeError("Unit requires the complete compact candidate, not an operation identifier.");
  }
  const journal = await loadOperation(candidate.operationId);
  const expected = { operationId: candidate.operationId, state: "closed-session-completed", family: FAMILY,
    storedJournalSha256: journal["journalSha256"], entireStoredJournalSha256: sha256Json(journal),
    terminalArtifact: parseClosedSymbolTerminalArtifact(journal["terminalArtifact"], candidate.operationId) };
  if (canonicalJson(candidate) !== canonicalJson(expected) || runtime !== unitState.runtimes.at(-1)) {
    throw new TypeError("Unit compact candidate or exact current runtime differs.");
  }
  return inspect(candidate.operationId, runtime, false);
}
export function inspectClosedSymbolAgedTerminal(operationId: string, runtime: MachineProfile["runtime"]): Promise<Readonly<Record<string, unknown>>> {
  return inspect(operationId, runtime, true);
}

