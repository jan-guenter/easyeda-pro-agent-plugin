/** Distinct original reference-query worker custody. These tokens grant no
 * DELETE, Save or reuse of the earlier GET completion. Only Core issues them. */
import type { CurrentFootprintInverseReferenceEntry } from "./current-footprint-inverse-reference-entry.ts";
import type { CurrentFootprintInverseReferenceData } from "./current-footprint-inverse-public-row-data.ts";
import type { CurrentFootprintInverseReferenceQueryJob } from "./current-footprint-inverse-reference-query-job.ts";

export interface CurrentFootprintInverseReferenceReadiness {
  readonly profile: "private.current-footprint-inverse-reference-readiness.v1";
}
export interface CurrentFootprintInverseReferenceReadinessBindings {
  readonly entry: CurrentFootprintInverseReferenceEntry;
  readonly data: CurrentFootprintInverseReferenceData;
  readonly assertCurrent: () => void;
  readonly assertOriginalReady: () => void;
}
export interface CurrentFootprintInverseReferenceWorkerCompletion {
  readonly profile: "private.current-footprint-inverse-reference-worker-completion.v1";
}
export interface CurrentFootprintInverseReferenceWorkerCompletionBindings {
  readonly job: CurrentFootprintInverseReferenceQueryJob;
  readonly data: CurrentFootprintInverseReferenceData;
  readonly assertCurrent: () => void;
}
export {
  requireOriginalCurrentFootprintInverseReferenceReadiness,
  consumeOriginalCurrentFootprintInverseReferenceReadiness,
  requireOriginalCurrentFootprintInverseReferenceWorkerCompletion,
} from "./current-pcb-diagnostic-owner.ts";
