interface RecoveryCoordinates {
  readonly operationId: string;
  readonly transactionState: string;
  readonly orphanedCallPossible: boolean;
  readonly nextSafeAction: string;
}
const journalCoordinates = new WeakMap<Error, RecoveryCoordinates>();

/** Only this module can mark coordinates as originating from a loaded journal. */
export function transactionErrorDetails(error: unknown): RecoveryCoordinates | undefined {
  return error instanceof Error ? journalCoordinates.get(error) : undefined;
}

/** Attach only journal-owned recovery coordinates, never the native response or
 * credentials. Failed callers can inspect this exact transaction immediately.
 */
export function transactionError(error: unknown, journal: {
  readonly operationId: string;
  readonly state: string;
  readonly orphanedCallPossible: boolean;
  readonly nextSafeAction: string;
}): Error {
  const result = error instanceof Error ? error : new Error("Tracked operation failed; inspect its retained journal.");
  const coordinates = Object.freeze({
    operationId: journal.operationId,
    transactionState: journal.state,
    orphanedCallPossible: journal.orphanedCallPossible,
    nextSafeAction: journal.nextSafeAction,
  });
  Object.assign(result, coordinates);
  journalCoordinates.set(result, coordinates);
  return result;
}
