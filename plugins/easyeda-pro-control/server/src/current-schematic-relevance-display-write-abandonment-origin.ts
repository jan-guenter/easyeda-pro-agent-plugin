/** Data/type boundary only. The original workflow's private WeakMap is the
 * sole issuer; no structural value, JSON record or callback table can issue it. */
import type { CurrentSchematicRelevanceDisplayWritePlan } from "./current-schematic-relevance-display-write-plan.ts";
import type { GeneratedSchematicRelevanceDisplayJournal } from "./generated-schematic-relevance-display-journal.ts";

export interface CurrentSchematicRelevanceDisplayWriteFailureClosure { readonly profile: "private.current-schematic-relevance-display-write-failure-closure.v1" }
export type CurrentSchematicRelevanceDisplayWriteGenerationClosure = Readonly<{
  outcome: "allocation-never-entered"; helperAllocated: false; rootCreated: false; exitClaimed: false;
}> | Readonly<{
  outcome: "no-resource-allocated"; helperAllocated: false; rootCreated: false; exitClaimed: false;
}> | Readonly<{
  outcome: "root-never-created"; helperAllocated: true; helperReleased: true; rootCreated: false; exitClaimed: false;
}> | Readonly<{
  outcome: "root-exited"; helperAllocated: true; helperReleased: true; rootCreated: true;
  originalRootExited: true; originalJobEmpty: true;
}>;
export interface CurrentSchematicRelevanceDisplayWriteFailureClosureValue {
  readonly writer: CurrentSchematicRelevanceDisplayWriteGenerationClosure;
  readonly readback: CurrentSchematicRelevanceDisplayWriteGenerationClosure | null;
  readonly capture: "not-started" | "all-original-handles-closed";
  readonly saved: false; readonly reopened: false; readonly completionClaimed: false;
  readonly ownerTransferred: false; readonly replayAllowed: false;
}
export interface CurrentSchematicRelevanceDisplayWriteFailureClosureBindings {
  readonly plan: CurrentSchematicRelevanceDisplayWritePlan; readonly journal: GeneratedSchematicRelevanceDisplayJournal;
  readonly value: CurrentSchematicRelevanceDisplayWriteFailureClosureValue;
  /** Reproves original failed execution, settled factory/calls/publication,
   * actual original helper closure and all original file-handle releases. */
  readonly assertCurrent: () => Promise<void>;
}
