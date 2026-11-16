/** Exact caller sites over source data only. GET/Wire metadata grants no
 * DEL origin, callback, resume, Promise or caller completion. */
import{freezeDeep}from"./sqlite-inventory-core.ts";
import{CURRENT_FOOTPRINT_INVERSE_GET_COMPLETION_SITES as WORKER,qualifyCurrentFootprintInverseGetCompletionSource}from"./current-footprint-inverse-get-completion-source.ts";
import{CURRENT_FOOTPRINT_INVERSE_DELETE_MANAGER_SOURCE as MANAGER,qualifyCurrentFootprintInverseDeleteManagerSource}from"./current-footprint-inverse-delete-manager-source.ts";
import{qualifyCurrentFootprintInverseInnerGetSource}from"./current-footprint-inverse-inner-get-source.ts";
import{currentSchematicWireClassicRpcSourceRow,qualifyCurrentSchematicWireClassicRpcSource}from"./current-schematic-wire-classic-rpc-source.ts";

export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CALLER_WORKER_SITES=freezeDeep({
 returned:WORKER.returned,serviceReturn:WORKER.serviceReturn,success:WORKER.success,successReturn:WORKER.successReturn,failure:WORKER.failure,outerFailure:WORKER.outerFailure,
});
const uiCallback=currentSchematicWireClassicRpcSourceRow(2,"MessageBus_rpcCall_child1");
const callbackEntry=uiCallback.points.entry;const callbackReturn=uiCallback.points.returned;if(callbackEntry===undefined||callbackReturn===undefined){throw new Error("INVERSE_NATIVE_DELETE_CALLER_UI_POINTS");}
const location=(lineNumber:number,columnNumber:number):Readonly<{lineNumber:number;columnNumber:number}>=>Object.freeze({lineNumber,columnNumber});
export const CURRENT_FOOTPRINT_INVERSE_NATIVE_DELETE_CALLER_UI_SITES=freezeDeep({
 innerSubscribe:{file:"manager",functionName:"",functionLine:0,functionColumn:8281,...location(0,8285),expression:"[r,s,t]"},
 innerRpc:{file:"manager",functionName:"",functionLine:0,functionColumn:8827,...location(0,8833),expression:"[o,i,n]"},
 managerReturned:{file:"manager",functionName:"deleteData",functionLine:MANAGER.method.lineNumber,functionColumn:MANAGER.method.columnNumber,...location(104,75_573),expression:"[this,t,J]"},
 handlerReturned:{file:"manager",functionName:"",functionLine:MANAGER.handler.lineNumber,functionColumn:MANAGER.handler.columnNumber,...location(108,42_472),expression:"[t,s,i,K]"},
 outerCallback:{file:"ui",functionName:"",functionLine:uiCallback.lineNumber,functionColumn:uiCallback.columnNumber,...location(callbackEntry.lineNumber,callbackEntry.columnNumber),expression:"[a,s,l,n,Noe]"},
 outerReturned:{file:"ui",functionName:"",functionLine:uiCallback.lineNumber,functionColumn:uiCallback.columnNumber,...location(callbackReturn.lineNumber,callbackReturn.columnNumber),expression:"[a,s,l,n,Noe]"},
}as const);
export function qualifyCurrentFootprintInverseNativeDeleteCallerSources(input:Readonly<{worker:string;ui:string;manager:string}>):void{
 qualifyCurrentFootprintInverseGetCompletionSource(input.worker);qualifyCurrentFootprintInverseDeleteManagerSource(input.manager);qualifyCurrentFootprintInverseInnerGetSource(input.manager);
 if(qualifyCurrentSchematicWireClassicRpcSource({scriptSource:input.ui})!==2){throw new Error("INVERSE_NATIVE_DELETE_CALLER_UI_SOURCE");}
}
