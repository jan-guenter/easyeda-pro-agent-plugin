/** Original actual four-namespace descriptor preparation while the first
 * dependency RPC remains held. This grants no result or deletion permission. */
import type{CurrentFootprintInverseReferenceUiEntry}from"./current-footprint-inverse-reference-ui-entry.ts";
import type{CurrentFootprintInverseReferenceData}from"./current-footprint-inverse-public-row-data.ts";

export interface CurrentFootprintInverseReferenceDispatch{readonly profile:"private.current-footprint-inverse-reference-dispatch.v1"}
export interface CurrentFootprintInverseReferenceDispatchBindings{readonly entry:CurrentFootprintInverseReferenceUiEntry;readonly data:CurrentFootprintInverseReferenceData;readonly assertCurrent:()=>void;readonly assertOriginalHeld:()=>void;}
export{requireOriginalCurrentFootprintInverseReferenceDispatch}from"./current-pcb-diagnostic-owner.ts";
