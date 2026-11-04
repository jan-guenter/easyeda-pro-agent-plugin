/** Original input custody for a future native execution factory. This is not
 * execution admission: publication, current head/queues, clocks, native writer
 * birth and the complete writer/saved envelope remain separate requirements. */
import type { CurrentFootprintCopyMainBackendRunner } from "./current-footprint-copy-main-backend-runner.ts";
import type { CurrentFootprintCopyPreparation } from "./current-footprint-copy-preparation.ts";
import type { requireCurrentFootprintCopyOwned } from "./current-footprint-copy-preparation-runtime.ts";
import type { CurrentFootprintCopyForwardResourceLedger, requireOriginalForwardLedgerBinding } from "./current-footprint-copy-forward-capacity.ts";
import type { CurrentFootprintCopyOpeningOwner, CurrentFootprintCopyOpeningResult } from "./current-pcb-209-worker-startup-opening.ts";
import type { CurrentFootprintCopyForwardNativeOwner, CurrentFootprintCopyNativeTarget } from "./current-pcb-diagnostic-owner.ts";

export interface CurrentFootprintForwardExecutionInputOrigin {
  readonly profile: "private.current-footprint-forward-execution-input-origin.v1";
  readonly executionAuthorized: false;
}
export interface CurrentFootprintForwardExecutionInputs {
  readonly owner: CurrentFootprintCopyForwardNativeOwner;
  readonly main: CurrentFootprintCopyMainBackendRunner;
  readonly source: CurrentFootprintCopyNativeTarget;
  readonly opening: CurrentFootprintCopyOpeningOwner;
  readonly result: CurrentFootprintCopyOpeningResult;
  readonly preparation: CurrentFootprintCopyPreparation;
  readonly owned: Awaited<ReturnType<typeof requireCurrentFootprintCopyOwned>>;
  readonly ledger: CurrentFootprintCopyForwardResourceLedger;
  readonly ledgerMethods: ReturnType<typeof requireOriginalForwardLedgerBinding>;
}
/** Only the native owner's private registry can resolve a token. A matching
 * descriptor, copied owner, callback or journal cannot issue these references. */
export { requireCurrentFootprintForwardExecutionInputs } from "./current-pcb-diagnostic-owner.ts";
