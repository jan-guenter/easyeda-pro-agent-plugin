/** All four actual reference results, still held before l and deletion. */
import type{CurrentFootprintInverseReferenceEntry}from"./current-footprint-inverse-reference-entry.ts";
import type{CurrentFootprintInverseReferenceData}from"./current-footprint-inverse-public-row-data.ts";

export interface CurrentFootprintInverseReferenceCompletion{readonly profile:"private.current-footprint-inverse-reference-completion.v1";}
export interface CurrentFootprintInverseReferenceCompletionBindings{readonly entry:CurrentFootprintInverseReferenceEntry;readonly data:CurrentFootprintInverseReferenceData;readonly assertCurrent:()=>void;readonly assertOriginalHeld:()=>void;}
export{requireOriginalCurrentFootprintInverseReferenceCompletion}from"./current-pcb-diagnostic-owner.ts";
