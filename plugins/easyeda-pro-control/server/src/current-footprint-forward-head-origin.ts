/** Only the original forward native owner may issue this optional, pre-Main
 * head-only bootstrap. Its original completed reader is never reconstructed. */
import type { NativeSqlInventory } from "./sqlite-inventory-core.ts";
import type { CurrentFootprintSourcePlan } from "./current-footprint-source-plan.ts";
import type { CurrentFootprintCopyHeadReference } from "./current-footprint-copy-head-reference.ts";

export interface CurrentFootprintForwardHeadBootstrap {
  readonly profile: "private.current-footprint-forward-head-bootstrap.v1";
  readonly executionAuthorized: false;
}
export interface CurrentFootprintForwardHeadSource {
  readonly before: NativeSqlInventory;
  readonly sourcePlan: CurrentFootprintSourcePlan;
  readonly reference: CurrentFootprintCopyHeadReference;
  readonly rawWindowsPath: string;
}
// oxlint-disable-next-line import/no-cycle -- The genuine owner creates the Main runner; bootstrap lookup occurs only after both original objects exist.
export { requireCurrentFootprintForwardHeadBootstrap, requireCurrentFootprintForwardWriterMainBootstraps, sendCurrentFootprintForwardHeadAgeMainCommand, sendCurrentFootprintForwardHeadMainCommand } from "./current-pcb-diagnostic-owner.ts";
