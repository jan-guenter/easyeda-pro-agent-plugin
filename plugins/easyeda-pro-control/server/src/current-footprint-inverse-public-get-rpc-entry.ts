/** Held original RPC body; no GET forwarding/result or deletion authority. */
import type { CurrentFootprintInversePublicDeleteCall } from "./current-footprint-inverse-public-delete-call.ts";
import type { CurrentFootprintInversePublicLookupEntry } from "./current-footprint-inverse-public-lookup-entry.ts";
import type { CurrentFootprintInverseGetWorkerReadiness } from "./current-footprint-inverse-get-worker-readiness.ts";

export interface CurrentFootprintInversePublicGetRpcEntry { readonly profile: "private.current-footprint-inverse-public-get-rpc-entry.v1" }
export interface CurrentFootprintInversePublicGetRpcEntryBindings {
  readonly call: CurrentFootprintInversePublicDeleteCall;
  readonly lookupEntry: CurrentFootprintInversePublicLookupEntry;
  readonly readiness: CurrentFootprintInverseGetWorkerReadiness;
  readonly assertCurrent: () => void;
  readonly assertOriginalHeld: () => void;
}
export { requireOriginalCurrentFootprintInversePublicGetRpcEntry } from "./current-pcb-diagnostic-owner.ts";
