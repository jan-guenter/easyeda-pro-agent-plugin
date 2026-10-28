/** Four independent native births are required for copy/readback/delete/readback.
 * A known observation envelope is never substituted for a missing writer phase. */
import { z } from "zod";
import { CURRENT_FOOTPRINT_COMBINED_PROFILE, CURRENT_FOOTPRINT_COMBINED_PURPOSE } from "./current-footprint-copy-combined-profile.ts";
import { CURRENT_FOOTPRINT_COPY_SAVED_PROFILE } from "./current-footprint-copy-saved-profile.ts";
import { CURRENT_FOOTPRINT_COPY_SOURCE_STAGE_REQUESTS } from "./current-footprint-copy-source-read-runner.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

export const currentFootprintCombinedGenerationSchema = z.object({
  profile: z.literal("private.current-footprint-combined-generation.v1"), purpose: z.literal(CURRENT_FOOTPRINT_COMBINED_PURPOSE),
  operationId: z.string().regex(/^footprint-combined-[a-z\d][a-z\d-]{0,95}(?![\s\S])/u),
  bindingSha256: z.string().regex(/^[a-f\d]{64}(?![\s\S])/u),
}).strict();
export type CurrentFootprintCombinedGeneration = Readonly<z.infer<typeof currentFootprintCombinedGenerationSchema>>;
const pending = Object.freeze([
  "actual-two-document-clock-rpc-joins", "native-create-dispatch-and-return", "complete-parser-upload-http-sql-completion",
  "closed-sql-and-publication-resource-schedule", "saved-generation-replay-exclusion-and-publication",
  "native-delete-single-clock-actor-and-completion", "inverse-closed-and-reopened-absence",
] as const);

export function planCurrentFootprintCombinedCapacity(): Readonly<{
  profile: "private.current-footprint-combined-capacity.v1";
  generationRoles: readonly ["forward-writer", "forward-saved-readback", "inverse-writer", "inverse-saved-readback"];
  knownCombinedObservation: typeof CURRENT_FOOTPRINT_COMBINED_PROFILE;
  knownSavedObservation: typeof CURRENT_FOOTPRINT_COPY_SAVED_PROFILE;
  completeSourceObservationRequests: number;
  unaccountedStages: typeof pending;
  wholeLifecycleRequestLimit: null;
  wholeLifecycleBytes: null;
  wholeLifecycleMilliseconds: null;
  wholeExecutionBudgetReserved: false;
  executionAuthorized: false;
}> {
  return freezeDeep({ profile: "private.current-footprint-combined-capacity.v1", generationRoles: ["forward-writer", "forward-saved-readback", "inverse-writer", "inverse-saved-readback"],
    knownCombinedObservation: CURRENT_FOOTPRINT_COMBINED_PROFILE, knownSavedObservation: CURRENT_FOOTPRINT_COPY_SAVED_PROFILE,
    completeSourceObservationRequests: CURRENT_FOOTPRINT_COPY_SOURCE_STAGE_REQUESTS, unaccountedStages: pending,
    wholeLifecycleRequestLimit: null, wholeLifecycleBytes: null, wholeLifecycleMilliseconds: null,
    wholeExecutionBudgetReserved: false, executionAuthorized: false });
}

/** No caller-provided counts, booleans or copied profile may fill absent native
 * schedules. This gate must change deliberately with their implementations. */
export function requireCurrentFootprintCombinedWriterCapacity(): never {
  throw new Error(`FOOTPRINT_COMBINED_WHOLE_CAPACITY_INCOMPLETE: ${pending.join(",")}`);
}
