/** Original post-reference yw/Ze/F2 call, still before the DEL RPC body. */
import type { CurrentFootprintInverseReferenceCompletion } from "./current-footprint-inverse-reference-completion.ts";
import type { CurrentFootprintInversePublicDeleteCall } from "./current-footprint-inverse-public-delete-call.ts";

export interface CurrentFootprintInversePublicDeleteRpcEntry{readonly profile:"private.current-footprint-inverse-public-delete-rpc-entry.v1";}
export interface CurrentFootprintInversePublicDeleteRpcEntryBindings{readonly references:CurrentFootprintInverseReferenceCompletion;readonly call:CurrentFootprintInversePublicDeleteCall;readonly assertCurrent:()=>void;readonly assertOriginalHeld:()=>void;}
export{requireOriginalCurrentFootprintInversePublicDeleteRpcEntry}from"./current-pcb-diagnostic-owner.ts";
