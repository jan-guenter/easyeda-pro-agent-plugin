/** Original pending public SDK request. No DTO, written boolean or supplied
 * callback can issue this packet or stand in for its retained source entry. */
import type { CurrentFootprintInversePublicDeleteIntent } from "./current-footprint-inverse-public-delete-intent.ts";

export interface CurrentFootprintInversePublicDeleteCall {
  readonly profile: "private.current-footprint-inverse-public-delete-call.v1";
}
export interface CurrentFootprintInversePublicDeleteCallBindings {
  readonly intent: CurrentFootprintInversePublicDeleteIntent;
  readonly projectUuid: string;
  readonly branchUuid: string;
  readonly footprintUuid: string;
  /** Original native SDK write acknowledgement plus exact held service-entry
   * caller/source proof. It never waits for the public SDK result. */
  readonly written: Promise<void>;
  readonly assertCurrent: () => void;
  readonly assertOriginalWritten: () => void;
}
export { requireOriginalCurrentFootprintInversePublicDeleteCall } from "./current-pcb-diagnostic-owner.ts";
