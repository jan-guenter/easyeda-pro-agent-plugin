import type { LibraryOperation } from "./library-operations.ts";

const structureLifecycleActions = new Set<string>([
  "library.symbol.create", "library.symbol.modify", "document.page.create", "document.page.rename",
  "document.pcb.create", "document.pcb.rename", "document.schematic.create", "document.schematic.rename",
]);

/** These native META writers schedule a debounced project_structures write.
 * The existing task1 upload wait excludes its future timer and task2 work;
 * document-history proofs do not account for the structure table's SQL delta.
 * Keep pure planning and historical evidence readable, without live authority.
 * Source pins and scheduler offsets: docs/symbol-delete-native-effects-2026-10-12.md.
 */
export function libraryExecutionLifecycleRefusal(action: string): string | undefined {
  return structureLifecycleActions.has(action)
    ? "Execution is unavailable until operation-owned completion of the native debounced project_structures write and its exact complete SQLite effect are proved. The task1 upload acknowledgment, stable polling and a point-in-time checkpoint do not drain the pending timer/task2 job."
    : undefined;
}

export function assertLibraryExecutionLifecycle(operation: Pick<LibraryOperation, "action">): void {
  const refusal = libraryExecutionLifecycleRefusal(operation.action);
  if (refusal !== undefined) { throw new Error(`${operation.action}: ${refusal}`); }
}

/** Response metadata only; the original sealed journal is never rewritten. */
export function libraryExecutionLifecycleAdvice(action: string, retainedNextSafeAction: string): Record<string, string> {
  const executionRefusal = libraryExecutionLifecycleRefusal(action);
  return executionRefusal === undefined ? {} : { executionRefusal, retainedNextSafeAction,
    nextSafeAction: "Inspect retained evidence only. Native structure-job completion is unimplemented; do not replay or Save. Historical journal advice is not current execution authority." };
}
