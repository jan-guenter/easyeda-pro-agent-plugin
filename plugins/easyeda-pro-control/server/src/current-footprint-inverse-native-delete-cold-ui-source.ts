/** Exact negative-task path and normal return sites. Metadata/source data
 * neither starts an application nor issues an original UI invocation. */
import {createHash} from "node:crypto";
import {CURRENT_FOOTPRINT_INVERSE_INITIALIZED_GET_SOURCE as UI,qualifyCurrentFootprintInverseInitializedGetSource as initialized} from "./current-footprint-inverse-initialized-get-source.ts";
import {CURRENT_FOOTPRINT_INVERSE_GET_FUNCTIONS as WORKER,qualifyCurrentFootprintInverseGetSource as worker} from "./current-footprint-inverse-get-source.ts";
import {CURRENT_FOOTPRINT_INVERSE_INNER_GET_SOURCE as INNER,qualifyCurrentFootprintInverseInnerGetSource as inner} from "./current-footprint-inverse-inner-get-source.ts";
import {CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_NEGATIVE_SOURCE as NEGATIVE} from "./current-footprint-inverse-native-delete-cold-negative-source.ts";
import {freezeDeep} from "./sqlite-inventory-core.ts";

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_SOURCE=freezeDeep({
 uiRpc:UI.uiBusRpcCall,uiTimer:UI.uiBusRpcCallCallback3,uiTask:UI.uiTaskExecute,uiPush:UI.uiBusPush,uiReply:UI.uiBusRpcReply,uiResolver:UI.uiBusRpcCallCallback2,
 uiFulfilled:UI.uiBusRpcServiceCallback2,uiRejected:UI.uiBusRpcServiceCallback3,
 innerPush:INNER.innerBroadcastBasePush,innerCaller:INNER.innerRpcBaseRpcCallCallback1,
 workerDispatch:{...INNER.innerRpcBaseRpcServiceCallback1,file:"worker"},
 workerHandler:{...WORKER.handler,file:"worker"},workerNeedData:{...WORKER.getNeedData,file:"worker"},workerGetData:{...WORKER.getData,file:"worker"},
 managerResult:NEGATIVE.managerResult,
 managerGetData:{file:"manager",start:1_731_174,end:1_731_357,bytes:183,sha256:"fbbf1ac5a9452fffa901a10dfe8b331051a3ee70231b1ce0a4a68ccec236a84c",lineNumber:104,columnNumber:71_588},
}as const);
export type CurrentFootprintInverseNativeDeleteColdUiSourceRole=keyof typeof CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_SOURCE;
function need(ok:boolean):asserts ok{if(!ok){throw new Error("INVERSE_NATIVE_DELETE_COLD_UI_SOURCE");}}
export function qualifyCurrentFootprintInverseNativeDeleteColdUiSource(source:string,file:"ui"|"manager"|"worker"):void{
 if(file==="worker"){worker(source);}else{initialized(source,file);if(file==="manager"){inner(source);}}
 for(const row of Object.values(CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_COLD_UI_SOURCE)){
  if(row.file===file){const body=source.slice(row.start,row.end);need(Buffer.byteLength(body)===row.bytes&&createHash("sha256").update(body).digest("hex")===row.sha256);}
 }
}
