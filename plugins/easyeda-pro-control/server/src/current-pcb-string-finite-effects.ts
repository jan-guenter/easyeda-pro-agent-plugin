/** Original-observation join, not a writer permit. Supplied JSON cannot invent
 * either issuance. A future writer must close the listed effect destinations
 * through its actual native owners before dispatch, then compare complete SQL. */
import { CurrentPcbStringMoveRunner, requireOriginalCurrentPcbStringMoveReply } from "./current-pcb-string-move-runner.ts";
import type { CurrentPcbStringMoveObservation } from "./current-pcb-string-move-runner.ts";
import { CurrentPcbStringWorkerProducerRunner, requireOriginalCurrentPcbStringWorkerProducerReplies } from "./current-pcb-string-worker-producer-runner.ts";
import type { CurrentPcbStringWorkerProducerObservation } from "./current-pcb-string-worker-producer-runner.ts";
import { freezeDeep } from "./sqlite-inventory-core.ts";

// oxlint-disable-next-line typescript/unbound-method -- Captured implementation is invoked only with its original private-field runner receiver.
const requireOriginalMove = CurrentPcbStringMoveRunner.prototype.requireOriginal;
// oxlint-disable-next-line typescript/unbound-method -- Captured implementation is invoked only with its original private-field runner receiver.
const requireOriginalWorker = CurrentPcbStringWorkerProducerRunner.prototype.requireOriginal;

/** Exact first-String effect envelope. No unconstrained "all native effects"
 * option exists. Every permitted destination still requires the full existing
 * String history/SQL model, original actor/clock and original channel proof. */
export const CURRENT_PCB_STRING_FINITE_EFFECT_DESTINATIONS = freezeDeep({
  expected: ["selected-PCB-one-STRING-record", "selected-PCB-DOCHEAD-and-edit-history",
    "selected-PCB-structure-version-and-time", "selected-branch-and-project-bookkeeping",
    "exact-model-required-SQL-sequence-allocation"],
  unchanged: ["all-other-document-records-and-history", "all-other-structure-rows", "FONT-and-BLOB-assets",
    "all-other-SQL-tables-and-cells"],
  excludedBeforeDispatch: ["foreign-project-or-branch-receiver", "cooperation-network-publication", "cloud-upload",
    "persistent-upload-or-replay-cache", "unreviewed-extension-subscriber", "dynamic-copper-worker",
    "custom-footprint-save-participant", "global-profile-or-filesystem-write-triggered-by-create-or-Save"],
  unretainedProducerRoute: "original-single-startup-ratline-result-then-ARt-terminal-state",
  executionAuthorized: false,
} as const);

const REMAINING = Object.freeze([
  "original startup ratline single-result/native-channel provenance and terminal callback relation",
  "four callback lexical receivers or equivalent original construction/dispatch ownership",
  "complete compiler/UI/worker publisher and native-channel destination containment",
  "operation-triggered cooperation/cloud/upload/replay and external-subscriber exclusion",
  "complete original empty-root, common/source/history/assets and native Save participants",
  "original backend/Windows actor and create/Save clock provenance",
  "journaled one-create/one-Save, exact publication, whole-Job closure, full SQL and fresh reopen/visual result",
] as const);

export function inspectCurrentPcbStringFiniteEffects(moveRunner: CurrentPcbStringMoveRunner, move: CurrentPcbStringMoveObservation,
  workerRunner: CurrentPcbStringWorkerProducerRunner, worker: CurrentPcbStringWorkerProducerObservation): Readonly<{
    schema: "easyeda-pro-control.pcb-string-finite-effects.v1";
    identity: CurrentPcbStringMoveObservation["identity"];
    checks: readonly Readonly<{ name: string; matches: boolean }>[];
    observedNecessaryConditionsMatch: boolean;
    unmet: readonly string[];
    remaining: typeof REMAINING;
    destinations: typeof CURRENT_PCB_STRING_FINITE_EFFECT_DESTINATIONS;
    originalRunnerObservationsMatched: true;
    continuousObservation: false;
    completeProducerInventoryVerified: false;
    writeDestinationsContained: false;
    queueCompletionVerified: false;
    saveAuthorized: false;
    executionAuthorized: false;
  }> {
  // Capture maintained implementations at module initialization: instance,
  // Subclass and later prototype replacements cannot replace owner checks.
  // Private fields and WeakMaps reject fake owners.
  const current = (): void => {
    requireOriginalMove.call(moveRunner, move);
    requireOriginalWorker.call(workerRunner, worker);
    requireOriginalCurrentPcbStringMoveReply(move); requireOriginalCurrentPcbStringWorkerProducerReplies(worker);
  };
  current();
  if (move.identity.projectUuid !== worker.identity.projectUuid || move.identity.branchUuid !== worker.identity.branchUuid ||
      move.identity.windowTabId !== worker.identity.windowTabId) { throw new Error("PCB_STRING_FINITE_EFFECT_IDENTITY"); }
  const checks = [
    { name: "move-has-no-retained-state", matches: move.noRetainedMoveState },
    { name: "serial-wrappers-have-no-retained-promises", matches: [worker.uploadStructure, worker.structure]
      .every(value => value.inFlight === "null" && value.queued === "null") },
    { name: "cooperation-has-no-retained-batch-or-timer", matches: worker.cooperation.batchCount === 0 &&
      worker.cooperation.outerTimer === "null" && worker.cooperation.innerTimer === "null" },
    { name: "upload-wrapper-has-no-retained-schedule", matches: worker.upload.timer === "null" &&
      worker.upload.promise === "null" && worker.upload.resolver === "null" },
    { name: "buffered-environment-has-no-retained-schedule", matches: worker.bufferedEnvironment.timer === "null" &&
      worker.bufferedEnvironment.promise === "null" && worker.bufferedEnvironment.resolver === "null" },
  ];
  // QA retains timer/resolver after its promise settles. They are not an idle
  // Condition here. Likewise canWsPublish:false never excludes cooperation.
  const unmet = checks.filter(value => !value.matches).map(value => value.name);
  current();
  return freezeDeep({ schema: "easyeda-pro-control.pcb-string-finite-effects.v1", identity: move.identity, checks,
    observedNecessaryConditionsMatch: unmet.length === 0, unmet, remaining: REMAINING, destinations: CURRENT_PCB_STRING_FINITE_EFFECT_DESTINATIONS,
    originalRunnerObservationsMatched: true, continuousObservation: false, completeProducerInventoryVerified: false,
    writeDestinationsContained: false, queueCompletionVerified: false, saveAuthorized: false, executionAuthorized: false });
}
