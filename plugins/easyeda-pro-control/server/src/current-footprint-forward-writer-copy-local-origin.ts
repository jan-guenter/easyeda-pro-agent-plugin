/** These inputs retain genuine full collector/reservation/clock references.
 * Parsing their shape supplies no body, native owner or producer authority. */
import type { CurrentFootprintCopyMainRequestRunner } from "./current-footprint-copy-main-request-runner.ts";
import type { CurrentFootprintForwardWriterMainRequestOrigin } from "./current-footprint-forward-writer-main-origin.ts";
import type { CurrentFootprintForwardWriterClockRpcOrigin } from "./current-footprint-forward-writer-clock-origin.ts";
import type { CurrentFootprintForwardWriterClockRpcObservation } from "./current-footprint-forward-writer-clock-rpc-runner.ts";
import type { CurrentFootprintForwardWriterMainRequestReservation } from "./current-footprint-forward-writer-main-request-plan.ts";
import type { CurrentFootprintForwardWriterCopyLocalReservation } from "./current-footprint-forward-writer-copy-local-reservation.ts";

export interface CurrentFootprintForwardWriterCopyLocalInput {
  readonly main: CurrentFootprintCopyMainRequestRunner;
  readonly origin: CurrentFootprintForwardWriterMainRequestOrigin;
  readonly clock: CurrentFootprintForwardWriterClockRpcOrigin;
  readonly clocks: CurrentFootprintForwardWriterClockRpcObservation;
  readonly request: CurrentFootprintForwardWriterMainRequestReservation;
  readonly reservation: CurrentFootprintForwardWriterCopyLocalReservation;
}
// oxlint-disable-next-line import/no-cycle -- Only the actual observer invokes the genuine Core's private cursor registry after original producer/native birth; evaluation issues no continuation.
export { continueOriginalCurrentFootprintForwardWriterCopyLocalCall } from "./current-pcb-diagnostic-owner.ts";
