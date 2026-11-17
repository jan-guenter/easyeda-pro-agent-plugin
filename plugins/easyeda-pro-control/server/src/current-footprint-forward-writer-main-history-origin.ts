/** Separate full-purpose same-reader Main history custody. A matching label
 * or an inverse history token cannot supply these original bindings. */
import type { CurrentFootprintInverseMainHistoryBaseline } from "./current-footprint-inverse-main-history-baseline.ts";
import type { CurrentFootprintInverseMainHistoryCommand } from "./current-footprint-inverse-main-history-protocol.ts";

export interface CurrentFootprintForwardWriterMainHistoryOrigin { readonly profile: "private.current-footprint-forward-writer-main-history-origin.v1" }
export interface CurrentFootprintForwardWriterMainHistoryBindings {
  readonly baseline: CurrentFootprintInverseMainHistoryBaseline;
  readonly ordinaryRequestLimit: number;
  readonly assertCurrent: () => void;
  readonly send: (command: CurrentFootprintInverseMainHistoryCommand, requestId: number) => Promise<void>;
}
// oxlint-disable-next-line import/no-cycle -- Main resolves this original registry only after its native owner and own runner already exist.
export { originalCurrentFootprintForwardWriterMainRequestLimit, requireCurrentFootprintForwardWriterMainHistoryOrigin } from "./current-pcb-diagnostic-owner.ts";
