/** Data/type boundary only. The original workflow's private WeakMap is the
 * sole issuer; no structural value, JSON record or callback table can issue it. */
import type { CurrentPcbViaWritePlan } from "./current-pcb-via-write-plan.ts";
import type { CurrentPcbViaWriteJournal } from "./current-pcb-via-write-journal.ts";

export interface CurrentPcbViaWriteFailureClosure { readonly profile: "private.current-pcb-via-write-failure-closure.v1" }
export type CurrentPcbViaWriteGenerationClosure = Readonly<{
  outcome: "allocation-never-entered"; helperAllocated: false; rootCreated: false; exitClaimed: false;
}> | Readonly<{
  outcome: "no-resource-allocated"; helperAllocated: false; rootCreated: false; exitClaimed: false;
}> | Readonly<{
  outcome: "root-never-created"; helperAllocated: true; helperReleased: true; rootCreated: false; exitClaimed: false;
}> | Readonly<{
  outcome: "root-exited"; helperAllocated: true; helperReleased: true; rootCreated: true;
  originalRootExited: true; originalJobEmpty: true;
}>;
export interface CurrentPcbViaWriteFailureClosureValue {
  readonly writer: CurrentPcbViaWriteGenerationClosure;
  readonly readback: CurrentPcbViaWriteGenerationClosure | null;
  readonly capture: "not-started" | "all-original-handles-closed";
  readonly saved: false; readonly reopened: false; readonly completionClaimed: false;
  readonly ownerTransferred: false; readonly replayAllowed: false;
}
export interface CurrentPcbViaWriteFailureClosureBindings {
  readonly plan: CurrentPcbViaWritePlan; readonly journal: CurrentPcbViaWriteJournal;
  readonly value: CurrentPcbViaWriteFailureClosureValue;
  /** Reproves original failed execution, settled factory/calls/publication,
   * actual original helper closure and all original file-handle releases. */
  readonly assertCurrent: () => Promise<void>;
}
