/** Original source-qualified first reference callback held before its handler.
 * This token is not a manager forwarding Job or a successful query result. */
import type{CurrentFootprintInverseReferenceDispatch}from"./current-footprint-inverse-reference-dispatch.ts";
import type{CurrentFootprintInverseReferenceData}from"./current-footprint-inverse-public-row-data.ts";

export interface CurrentFootprintInverseReferenceCallback{readonly profile:"private.current-footprint-inverse-reference-callback.v1"}
export interface CurrentFootprintInverseReferenceCallbackBindings{readonly dispatch:CurrentFootprintInverseReferenceDispatch;readonly data:CurrentFootprintInverseReferenceData;readonly assertCurrent:()=>void;readonly assertOriginalHeld:()=>void;}
export{requireOriginalCurrentFootprintInverseReferenceCallback}from"./current-pcb-diagnostic-owner.ts";
