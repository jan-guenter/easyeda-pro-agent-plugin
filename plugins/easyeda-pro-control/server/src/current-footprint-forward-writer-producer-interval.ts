/** Original full-writer refusal guards remain installed from the held
 * constructor through this one pre-action interval. This opaque token grants
 * no producer continuation, native Create, persistence or saved successor. */
import type { CurrentFootprintForwardWriterMainCapability } from "./current-footprint-forward-writer-main-capability.ts";
import type { CurrentFootprintForwardWriterMainRequestOrigin } from "./current-footprint-forward-writer-main-origin.ts";
import type { CurrentFootprintForwardWriterNativeOwner } from "./current-pcb-diagnostic-owner.ts";

export interface CurrentFootprintForwardWriterProducerInterval { readonly profile: "private.current-footprint-forward-writer-producer-interval.v1" }
export { requireOriginalCurrentFootprintForwardWriterProducerInterval } from "./current-pcb-diagnostic-owner.ts";
/** Signature documentation for the exact original owner/capability join. */
export type CurrentFootprintForwardWriterProducerIntervalReproof = (token: CurrentFootprintForwardWriterProducerInterval,
  owner: CurrentFootprintForwardWriterNativeOwner, capability: CurrentFootprintForwardWriterMainCapability,
  origin?: CurrentFootprintForwardWriterMainRequestOrigin) => void;
