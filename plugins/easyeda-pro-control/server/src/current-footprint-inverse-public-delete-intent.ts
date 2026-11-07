/** One durable inverse-only public Project delete intent. Publication grants
 * no SDK call, worker clock, selected SQL or collateral completion by itself. */
export interface CurrentFootprintInversePublicDeleteIntent {
  readonly profile: "private.current-footprint-inverse-public-delete-intent.v1";
}
export interface CurrentFootprintInversePublicDeleteEnrollment {
  readonly assertCurrent: () => void;
  readonly assertBeforeAttempt: () => void;
  readonly assertOriginalAttempted: () => void;
  readonly assertPublished: () => Promise<void>;
}
export { requireOriginalCurrentFootprintInversePublicDeleteIntent, enrollCurrentFootprintInversePublicDeleteIntent,
  consumeCurrentFootprintInversePublicDeleteIntent } from "./current-pcb-diagnostic-owner.ts";
