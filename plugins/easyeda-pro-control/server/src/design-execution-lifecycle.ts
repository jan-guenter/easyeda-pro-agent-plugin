/** Native Save republishes pending geometry with pend absent. For these
 * document types that schedules the same debounced structure write as META.
 * The task1 barrier and document-only proof do not cover that SQL/job lifecycle.
 * Keep pure compilers and historical evidence available without dispatch.
 */
export const DESIGN_STRUCTURE_LIFECYCLE_REFUSAL = "Design execution is unavailable for schematic-page, symbol and PCB editors until operation-owned completion of native Save's debounced project_structures write and its exact complete SQLite effect are proved. The task1 upload wait and a point-in-time checkpoint do not drain the pending timer/task2 job. Existing schemas, pure verifiers and historical observations do not establish that completion.";

export function designExecutionLifecycleRefusal(documentType: number): string | undefined {
  return [1, 2, 3].includes(documentType) ? DESIGN_STRUCTURE_LIFECYCLE_REFUSAL : undefined;
}

export function assertDesignExecutionLifecycle(...documentTypes: number[]): void {
  for (const documentType of documentTypes) {
    const refusal = designExecutionLifecycleRefusal(documentType);
    if (refusal !== undefined) { throw new Error(refusal); }
  }
}
