/** Original pre-navigation intent for cancelling this inverse generation's
 * first checkProject timer. No timer ID or caller expression is accepted. */
export interface CurrentFootprintInversePollingCancellationIntent {
  readonly profile: "private.current-footprint-inverse-polling-cancellation-intent.v1";
}
export interface CurrentFootprintInversePollingCancellationEnrollment {
  readonly assertCurrent: () => void;
  readonly assertBeforeAttempt: () => void;
  readonly assertOriginalAttempted: () => void;
  readonly assertPublished: () => Promise<void>;
}
export { requireOriginalCurrentFootprintInversePollingIntent, enrollCurrentFootprintInversePollingIntent,
  consumeCurrentFootprintInversePollingIntent } from "./current-pcb-diagnostic-owner.ts";
