/** One fresh complete journal/artifact scan for six fixed forward launch
 * guards. Only small parsed summaries are shared; no admission, process owner,
 * artifact hash or execution authority is reused from an earlier scan. */
import { projectCurrentFootprintForwardExecutionOpeningLaunchState } from "./current-footprint-forward-execution-opening-journal.ts";
import { projectCurrentFootprintForwardWriterOpeningLaunchState } from "./current-footprint-forward-writer-opening-journal.ts";
import { projectCurrentFootprintForwardWriterCreateIntentLaunchState } from "./current-footprint-forward-writer-create-intent-journal.ts";
import { projectCurrentFootprintForwardWriterPublicationLaunchState } from "./current-footprint-forward-writer-publication-journal.ts";
import { projectCurrentFootprintForwardWriterTicketTimerLaunchState } from "./current-footprint-forward-writer-ticket-timer-journal.ts";
import { projectCurrentFootprintForwardWriterStartupFrontierLaunchState } from "./current-footprint-forward-writer-startup-frontier-journal.ts";
import { createOperationScanner } from "./artifacts.ts";
import type { UnknownRecord } from "./core.ts";

const families = Object.freeze([
  { family: "execution-opening", project: projectCurrentFootprintForwardExecutionOpeningLaunchState, failure: "FORWARD_EXECUTION_JOURNAL_UNRESOLVED_OWNER" },
  { family: "writer-opening", project: projectCurrentFootprintForwardWriterOpeningLaunchState, failure: "FORWARD_WRITER_JOURNAL_UNRESOLVED_OWNER" },
  { family: "create-intent", project: projectCurrentFootprintForwardWriterCreateIntentLaunchState, failure: "FORWARD_WRITER_CREATE_INTENT_JOURNAL_UNRESOLVED_INTENT" },
  { family: "publication", project: projectCurrentFootprintForwardWriterPublicationLaunchState, failure: "FORWARD_PUBLICATION_JOURNAL_UNRESOLVED_OWNER" },
  { family: "ticket-timer", project: projectCurrentFootprintForwardWriterTicketTimerLaunchState, failure: "FORWARD_TICKET_TIMER_JOURNAL_UNRESOLVED_OWNER" },
  { family: "startup-frontier", project: projectCurrentFootprintForwardWriterStartupFrontierLaunchState, failure: "FORWARD_FRONTIER_JOURNAL_UNRESOLVED_OWNER" },
] as const);
type Family = (typeof families)[number]["family"];
interface Summary { readonly family: Family; readonly operationId: string; readonly settled: boolean }
const scan = createOperationScanner((operation: UnknownRecord): readonly Summary[] | undefined => {
  const values: Summary[] = [];
  for (const family of families) {
    const value = family.project(operation);
    if (value !== undefined) { values.push({ family: family.family, ...value }); }
  }
  return values.length === 0 ? undefined : values;
});
/** All bytes, path identities and artifacts are freshly checked by the generic
 * scanner once. Each existing family parser and terminal rule remains exact;
 * Source relinquishment still needs its separately verified original receipt. */
export async function assertNoUnresolvedForwardComponentLaunches(): Promise<void> {
  const groups = await scan();
  const values = groups.flat();
  for (const family of families) {
    const unresolved = values.filter(value => value.family === family.family && !value.settled);
    for (const value of unresolved) { await assertSettled(value, family.failure); }
  }
}
/** Historical relinquishment remains separately checked for each unresolved
 * Source summary; no receipt is inferred from the grouped scan. */
async function assertSettled(value: Summary, failure: string): Promise<void> {
  if (value.family === "execution-opening") {
    const { inspectCurrentFootprintForwardSourceRelinquishment } = await import("./current-footprint-forward-source-relinquishment-journal.ts");
    if (await inspectCurrentFootprintForwardSourceRelinquishment(value.operationId) !== null) { return; }
  }
  throw new Error(failure);
}
