/** Original yw held before the first mandatory reference read. */
import type{CurrentFootprintInversePublicGetResult}from"./current-footprint-inverse-public-get-result.ts";
import type{CurrentFootprintInversePublicDeleteCall}from"./current-footprint-inverse-public-delete-call.ts";

export interface CurrentFootprintInverseReferenceEntry{readonly profile:"private.current-footprint-inverse-reference-entry.v1"}
export interface CurrentFootprintInverseReferenceEntryBindings{readonly result:CurrentFootprintInversePublicGetResult;readonly call:CurrentFootprintInversePublicDeleteCall;readonly assertCurrent:()=>void;readonly assertOriginalHeld:()=>void;}
export{requireOriginalCurrentFootprintInverseReferenceEntry,requireOriginalCurrentFootprintInverseReferenceEntryCustody}from"./current-pcb-diagnostic-owner.ts";
