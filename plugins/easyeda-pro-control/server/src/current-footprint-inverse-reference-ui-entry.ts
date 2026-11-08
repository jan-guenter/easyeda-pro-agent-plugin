/** Original first dependency RPC held before its body, no request sent. */
import type{CurrentFootprintInverseReferenceEntry}from"./current-footprint-inverse-reference-entry.ts";
import type{CurrentFootprintInverseReferenceReadiness}from"./current-footprint-inverse-reference-worker.ts";
import type{CurrentFootprintInverseReferenceData}from"./current-footprint-inverse-public-row-data.ts";
import type{CurrentFootprintInversePublicDeleteCall}from"./current-footprint-inverse-public-delete-call.ts";

export interface CurrentFootprintInverseReferenceUiEntry{readonly profile:"private.current-footprint-inverse-reference-ui-entry.v1"}
export interface CurrentFootprintInverseReferenceUiEntryBindings{readonly entry:CurrentFootprintInverseReferenceEntry;readonly readiness:CurrentFootprintInverseReferenceReadiness;readonly data:CurrentFootprintInverseReferenceData;readonly call:CurrentFootprintInversePublicDeleteCall;readonly assertCurrent:()=>void;readonly assertOriginalHeld:()=>void;}
export{requireOriginalCurrentFootprintInverseReferenceUiEntry}from"./current-pcb-diagnostic-owner.ts";
