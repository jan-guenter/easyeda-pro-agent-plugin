import type { DesignApplyInput, DesignExecutor } from "./design-execution.ts";

/** A single authorized request, with the same apply/commit proof boundaries.
 * An exception leaves the normal journal intact; never retry or undo here.
 */
export async function executeAndCommitDesign(executor: Pick<DesignExecutor, "apply" | "commit" | "preflightSaveNavigation">, input: DesignApplyInput): Promise<Record<string, unknown>> {
  await executor.preflightSaveNavigation(input);
  const applied = await executor.apply(input);
  const operationId = applied["operationId"];
  if (applied["state"] !== "applied-unsaved" || applied["hardStop"] !== false || applied["orphanedCallPossible"] !== false ||
      typeof operationId !== "string" || operationId.length === 0) {
    throw new Error("Typed apply did not produce a verified, non-orphan commit-ready journal. Inspect the returned operation before proceeding.");
  }
  return executor.commit(operationId);
}
