/** Finite accounting for implemented preparation stages. Missing adapters have
 * no invented request count, and no existing launch budget is widened. */
import { CURRENT_FOOTPRINT_COPY_ACTOR_PREPARATION_REQUESTS, CURRENT_FOOTPRINT_COPY_ACTOR_REPROOF_REQUESTS } from "./current-footprint-copy-actor-preparation.ts";
import { CURRENT_FOOTPRINT_COPY_CLOCK_REQUIREMENTS } from "./current-footprint-copy-clock-requirements.ts";
import { CURRENT_FOOTPRINT_COPY_PREPARATION_REQUESTS } from "./current-footprint-copy-preparation.ts";
import { CURRENT_FOOTPRINT_COPY_PRODUCER_OWNER_REQUESTS, CURRENT_FOOTPRINT_COPY_PRODUCER_REQUESTS } from "./current-footprint-copy-producer-runner.ts";
import { reserveCurrentFootprintCopyV2Capacity } from "./current-footprint-copy-v2-capacity.ts";
import type { CurrentFootprintCopyV2Capacity } from "./current-footprint-copy-v2-capacity.ts";
import type { CurrentFootprintCopyV2Plan } from "./current-footprint-copy-v2-plan.ts";
import type { CurrentFootprintCopyV2SqlPlan } from "./current-footprint-copy-v2-sql.ts";

const pending = Object.freeze(["original-startup-and-actor-collection", "copy-launch-parent-owner-reproof",
  "ui-route-original-owner-and-project-worker-target", "transitive-parser-cache-and-upload-producers",
  "two-native-qe-results", "windows-clock-brackets", "native-create-and-result", "exact-post-copy-observation",
  "durable-journal-and-raw-reply-artifacts", "save-and-original-generation-termination",
  "saved-generation-startup-and-complete-closure"] as const);
export interface CurrentFootprintCopyPreparationCapacity {
  readonly profile: "private.current-footprint-copy-preparation-capacity.v1";
  readonly modeledData: CurrentFootprintCopyV2Capacity;
  readonly sourceObservationRequests: number;
  readonly ownedSourcePreparationRequests: number;
  readonly ownedActorPreparationRequests: number;
  readonly ownedActorReproofRequestsPerUse: number;
  readonly ownedActorPreparationStateObservations: 2;
  readonly ownedActorReproofStateObservationsPerUse: 1;
  readonly producerBindingRequests: number;
  readonly producerOriginalOwnerMaximumRequests: number;
  readonly producerOriginalOwnerReproofMaximumRequestsPerUse: number;
  readonly sourceGenerationKnownPreparationRequests: number;
  readonly savedGenerationKnownObservationRequests: number;
  readonly cleanupRequestsPerGeneration: 32;
  readonly nativeQeResultsRequired: 2;
  readonly nativeClockRequestCount: null;
  readonly unaccountedStages: typeof pending;
  readonly wholeLaunchBudgetReserved: false;
  readonly existingStartupBudgetExpanded: false;
  readonly requestLedgerImplemented: false;
  readonly executionAuthorized: false;
}
/** Validates the original copy/SQL plans and data bounds before reporting a
 * partial count. Source and saved reads belong to different native generations;
 * per-use actor reproof is additional and cannot silently consume cleanup. */
export function planCurrentFootprintCopyPreparationCapacity(copy: CurrentFootprintCopyV2Plan,
  sql: CurrentFootprintCopyV2SqlPlan): CurrentFootprintCopyPreparationCapacity {
  const modeledData = reserveCurrentFootprintCopyV2Capacity(copy, sql);
  return Object.freeze({ profile: "private.current-footprint-copy-preparation-capacity.v1", modeledData,
    sourceObservationRequests: modeledData.sourceObservationRequests,
    ownedSourcePreparationRequests: CURRENT_FOOTPRINT_COPY_PREPARATION_REQUESTS,
    ownedActorPreparationRequests: CURRENT_FOOTPRINT_COPY_ACTOR_PREPARATION_REQUESTS,
    ownedActorReproofRequestsPerUse: CURRENT_FOOTPRINT_COPY_ACTOR_REPROOF_REQUESTS,
    ownedActorPreparationStateObservations: 2, ownedActorReproofStateObservationsPerUse: 1,
    producerBindingRequests: CURRENT_FOOTPRINT_COPY_PRODUCER_REQUESTS,
    producerOriginalOwnerMaximumRequests: CURRENT_FOOTPRINT_COPY_PRODUCER_OWNER_REQUESTS.observeMaximum,
    producerOriginalOwnerReproofMaximumRequestsPerUse: CURRENT_FOOTPRINT_COPY_PRODUCER_OWNER_REQUESTS.requireMaximum,
    sourceGenerationKnownPreparationRequests: modeledData.sourceObservationRequests + CURRENT_FOOTPRINT_COPY_PREPARATION_REQUESTS +
      CURRENT_FOOTPRINT_COPY_ACTOR_PREPARATION_REQUESTS + CURRENT_FOOTPRINT_COPY_PRODUCER_OWNER_REQUESTS.observeMaximum,
    savedGenerationKnownObservationRequests: modeledData.savedObservationRequests,
    cleanupRequestsPerGeneration: 32, nativeQeResultsRequired: CURRENT_FOOTPRINT_COPY_CLOCK_REQUIREMENTS.distinctNativeResultsRequired,
    nativeClockRequestCount: null, unaccountedStages: pending, wholeLaunchBudgetReserved: false,
    existingStartupBudgetExpanded: false, requestLedgerImplemented: false, executionAuthorized: false });
}
