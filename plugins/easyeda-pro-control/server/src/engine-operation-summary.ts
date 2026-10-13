/** Internal legacy engine summary projection. No journal or execution validation. */
import { operationSummary as untypedOperationSummary } from "./core.ts";
import type { UnknownRecord } from "./core.ts";
import type { OperationJournal, OperationSummary } from "./engine.ts";

function isUnknownRecord(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isOperationJournalRecord(value: unknown): value is OperationJournal {
  return isUnknownRecord(value);
}

function isCompleteOperationJournal(value: unknown): value is OperationJournal {
  return (
    isUnknownRecord(value) &&
    typeof value["operationId"] === "string" &&
    typeof value["planHash"] === "string" &&
    typeof value["state"] === "string" &&
    typeof value["mutationState"] === "string" &&
    typeof value["saved"] === "boolean" &&
    typeof value["reopened"] === "boolean" &&
    typeof value["hardStop"] === "boolean" &&
    typeof value["mutationMayHaveOccurred"] === "boolean" &&
    typeof value["nextSafeAction"] === "string" &&
    typeof value["journalPath"] === "string" &&
    typeof value["updatedAt"] === "string"
  );
}

export function operationSummary(operation: OperationJournal): OperationSummary;
export function operationSummary(
  operation: Readonly<UnknownRecord>,
): ReturnType<typeof untypedOperationSummary>;
export function operationSummary(
  operation: Readonly<UnknownRecord>,
): OperationSummary | ReturnType<typeof untypedOperationSummary> {
  const summary = untypedOperationSummary(operation);
  if (!isCompleteOperationJournal(operation)) {
    return summary;
  }
  return {
    operationId: operation.operationId,
    planHash: operation.planHash,
    state: operation.state,
    mutationState: operation.mutationState,
    saved: operation.saved,
    reopened: operation.reopened,
    hardStop: operation.hardStop,
    mutationMayHaveOccurred: operation.mutationMayHaveOccurred,
    orphanedCallPossible: summary.orphanedCallPossible,
    orphanedCallPhase:
      typeof summary.orphanedCallPhase === "string"
        ? summary.orphanedCallPhase
        : undefined,
    runtimeRestartChallenge:
      typeof summary.runtimeRestartChallenge === "string"
        ? summary.runtimeRestartChallenge
        : undefined,
    runtimeRestartChallengeIssuedAt:
      typeof summary.runtimeRestartChallengeIssuedAt === "string"
        ? summary.runtimeRestartChallengeIssuedAt
        : undefined,
    runtimeRestartBoundary: operation.runtimeRestartBoundary,
    nextSafeAction: operation.nextSafeAction,
    unknownPhase:
      typeof summary.unknownPhase === "string"
        ? summary.unknownPhase
        : undefined,
    lastError: summary.lastError,
    journalPath: operation.journalPath,
    checkpoints: summary.checkpoints,
    artifacts: summary.artifacts,
    updatedAt: operation.updatedAt,
  };
}

export function asOperationJournal(value: unknown): OperationJournal {
  if (!isOperationJournalRecord(value)) {
    throw new TypeError("Operation journal must be an object.");
  }
  return value;
}
